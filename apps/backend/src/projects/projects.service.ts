import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string): Promise<any[]> {
    return this.prisma.project.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        company: true,
        sprints: true,
        team: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: { company: true, sprints: true },
    });
  }

  async findByCompany(companyId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { companyId },
      include: { sprints: true },
    });
  }

  async create(data: Partial<Project>): Promise<Project> {
    return this.prisma.project.create({ data: data as any });
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    await this.prisma.project.update({ where: { id }, data: data as any });
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  /**
   * Métricas do projeto para Overview (Story 018).
   * Sprint ativo: status === 'active', senão janela de datas contendo agora.
   */
  async getStats(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return null;
    }

    const sprints = await this.prisma.sprint.findMany({
      where: { projectId },
      orderBy: { startDate: 'desc' },
    });

    const now = Date.now();
    const activeSprint =
      sprints.find((s) => s.status === 'active') ||
      sprints.find((s) => {
        const start = new Date(s.startDate).getTime();
        const end = new Date(s.endDate).getTime();
        return start <= now && now <= end;
      }) ||
      null;

    const [totalTasks, backlogCount, statusGroups, sprintStatusGroups, sprintPoints] =
      await Promise.all([
        this.prisma.task.count({ where: { projectId } }),
        this.prisma.task.count({ where: { projectId, sprintId: null } }),
        this.prisma.task.groupBy({
          by: ['status'],
          where: { projectId },
          _count: { _all: true },
        }),
        activeSprint
          ? this.prisma.task.groupBy({
              by: ['status'],
              where: { projectId, sprintId: activeSprint.id },
              _count: { _all: true },
            })
          : Promise.resolve([]),
        activeSprint
          ? this.prisma.task.findMany({
              where: { projectId, sprintId: activeSprint.id },
              select: { status: true, storyPoints: true },
            })
          : Promise.resolve([]),
      ]);

    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    for (const row of statusGroups) {
      if (row.status in byStatus) {
        byStatus[row.status as keyof typeof byStatus] = row._count._all;
      }
    }

    const sprintByStatus = { todo: 0, in_progress: 0, done: 0 };
    for (const row of sprintStatusGroups as { status: string; _count: { _all: number } }[]) {
      if (row.status in sprintByStatus) {
        sprintByStatus[row.status as keyof typeof sprintByStatus] = row._count._all;
      }
    }

    let pointsCommitted = 0;
    let pointsDone = 0;
    for (const t of sprintPoints as { status: string; storyPoints: number | null }[]) {
      const pts = t.storyPoints ?? 0;
      pointsCommitted += pts;
      if (t.status === 'done') pointsDone += pts;
    }

    const sprintTaskTotal =
      sprintByStatus.todo + sprintByStatus.in_progress + sprintByStatus.done;
    const percentDone =
      sprintTaskTotal === 0
        ? 0
        : Math.round((sprintByStatus.done / sprintTaskTotal) * 100);

    return {
      projectId,
      companyId: project.companyId,
      totalTasks,
      backlogCount,
      byStatus,
      activeSprint: activeSprint
        ? {
            id: activeSprint.id,
            name: activeSprint.name,
            goal: activeSprint.goal,
            status: activeSprint.status,
            startDate: activeSprint.startDate,
            endDate: activeSprint.endDate,
            byStatus: sprintByStatus,
            taskTotal: sprintTaskTotal,
            percentDone,
            pointsCommitted,
            pointsDone,
            capacityPoints: activeSprint.capacityPoints ?? null,
            capacityRemaining:
              activeSprint.capacityPoints != null
                ? activeSprint.capacityPoints - pointsCommitted
                : null,
          }
        : null,
    };
  }

  /**
   * Velocity dos últimos sprints concluídos (Story 024).
   */
  async getVelocity(projectId: string, limit = 5) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return null;

    const completed = await this.prisma.sprint.findMany({
      where: { projectId, status: 'completed' },
      orderBy: { endDate: 'desc' },
      take: limit,
      include: {
        tasks: { select: { status: true, storyPoints: true } },
      },
    });

    const sprints = completed
      .map((s) => {
        const pointsDone = s.tasks
          .filter((t) => t.status === 'done')
          .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
        const tasksDone = s.tasks.filter((t) => t.status === 'done').length;
        return {
          id: s.id,
          name: s.name,
          endDate: s.endDate,
          pointsDone,
          tasksDone,
          capacityPoints: s.capacityPoints,
        };
      })
      .reverse();

    const avgPoints =
      sprints.length === 0
        ? 0
        : Math.round(
            (sprints.reduce((sum, s) => sum + s.pointsDone, 0) / sprints.length) * 10,
          ) / 10;

    return {
      projectId,
      companyId: project.companyId,
      sprints,
      averagePoints: avgPoints,
    };
  }

  /**
   * Sync one-way: GitHub Issues / Project items → Tasks (025–027).
   * Requer GITHUB_TOKEN (ou GH_TOKEN) no ambiente.
   * Aceita repo (owner/repo) e/ou Project # (owner + number).
   */
  async syncGithubIssues(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return null;

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN (ou GH_TOKEN) não configurado no backend.');
    }

    if (
      !project.githubRepo &&
      !project.githubProjectNumber &&
      !project.githubProjectId
    ) {
      throw new Error(
        'Configure githubRepo e/ou githubProjectNumber/githubProjectId antes de sincronizar.',
      );
    }

    if (project.githubRepo && !project.githubOwner) {
      throw new Error('Configure githubOwner junto com githubRepo.');
    }

    const owner = project.githubOwner;
    const issues: SyncItem[] = [];
    const statusByKey = new Map<string, string>();

    if (project.githubProjectId || project.githubProjectNumber) {
      if (!project.githubProjectId && !owner) {
        throw new Error(
          'Configure githubOwner ou githubProjectId antes de sincronizar o Project.',
        );
      }
      const fromProject = await fetchGithubProjectItems(token, {
        projectNodeId: project.githubProjectId,
        owner: owner || undefined,
        projectNumber: project.githubProjectNumber ?? undefined,
        projectUrl: project.githubProjectUrl,
      });
      for (const item of fromProject) {
        issues.push(item);
        if (item.projectStatus) {
          statusByKey.set(itemKey(item), item.projectStatus);
        }
      }
    }

    if (project.githubRepo) {
      let page = 1;
      while (page <= 5) {
        const url = `https://api.github.com/repos/${owner}/${project.githubRepo}/issues?state=all&per_page=100&page=${page}`;
        const res = await fetch(url, {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'User-Agent': 'sprinthub-sync',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
        }

        const batch = (await res.json()) as GithubIssue[];
        const onlyIssues = batch.filter((i) => !i.pull_request);
        for (const issue of onlyIssues) {
          if (issues.some((x) => x.githubIssueNumber === issue.number)) continue;
          issues.push({
            kind: 'issue',
            title: issue.title,
            body: issue.body,
            state: issue.state,
            html_url: issue.html_url,
            githubIssueNumber: issue.number,
            githubProjectItemId: null,
            labels: issue.labels || [],
            projectStatus: null,
          });
        }
        if (batch.length < 100) break;
        page += 1;
      }

      if (project.githubProjectNumber && owner && statusByKey.size === 0) {
        const projectStatuses = await fetchGithubProjectStatuses(
          token,
          owner,
          project.githubProjectNumber,
        );
        for (const [num, st] of projectStatuses) {
          statusByKey.set(`issue:${num}`, st);
        }
      }
    }

    let created = 0;
    let updated = 0;

    for (const item of issues) {
      const mapped = mapSyncItem(item);
      const key = itemKey(item);
      if (statusByKey.has(key)) {
        mapped.status = statusByKey.get(key)!;
      } else if (item.projectStatus) {
        mapped.status = item.projectStatus;
      }

      const existingWhere: any = { projectId };
      if (item.githubProjectItemId) {
        existingWhere.githubProjectItemId = item.githubProjectItemId;
      } else if (item.githubIssueNumber != null) {
        existingWhere.githubIssueNumber = item.githubIssueNumber;
      } else {
        continue;
      }

      const existing = await this.prisma.task.findFirst({
        where: existingWhere,
      });

      if (existing) {
        await this.prisma.task.update({
          where: { id: existing.id },
          data: {
            title: mapped.title,
            description: mapped.description,
            type: mapped.type,
            status: mapped.status,
            priority: mapped.priority,
            githubIssueUrl: mapped.githubIssueUrl,
            githubIssueNumber: mapped.githubIssueNumber,
            githubProjectItemId: mapped.githubProjectItemId,
          },
        });
        updated += 1;
      } else {
        await this.prisma.task.create({
          data: {
            projectId,
            title: mapped.title,
            description: mapped.description,
            type: mapped.type,
            status: mapped.status,
            priority: mapped.priority,
            githubIssueNumber: mapped.githubIssueNumber,
            githubIssueUrl: mapped.githubIssueUrl,
            githubProjectItemId: mapped.githubProjectItemId,
            sprintId: null,
          },
        });
        created += 1;
      }
    }

    return {
      projectId,
      companyId: project.companyId,
      repo: project.githubRepo ? `${owner}/${project.githubRepo}` : null,
      githubProjectNumber: project.githubProjectNumber ?? null,
      projectStatusesApplied: statusByKey.size,
      fetched: issues.length,
      created,
      updated,
    };
  }

  /**
   * Lista GitHub Projects v2 do usuário (+ orgs opcionais).
   * Orgs: query `orgs` ou env `GITHUB_ORGS` (csv). Não usa viewer.organizations
   * (exige read:org); busca organization(login) por nome.
   */
  async listGithubProjects(orgs?: string[]) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN (ou GH_TOKEN) não configurado no backend.');
    }
    const fromEnv = (process.env.GITHUB_ORGS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const orgLogins = [...new Set([...(orgs || []), ...fromEnv])];
    return listAccessibleGithubProjects(token, orgLogins);
  }

  /** Importa um GitHub Project como Project do SprintHub (+ sync itens). */
  async importGithubProject(params: {
    companyId: string;
    teamId?: string;
    owner: string;
    number: number;
    id: string;
    title: string;
    url?: string;
    shortDescription?: string | null;
    sync?: boolean;
  }) {
    const existing = await this.prisma.project.findFirst({
      where: {
        companyId: params.companyId,
        githubProjectId: params.id,
      },
    });
    if (existing) {
      return {
        project: existing,
        created: false,
        sync: null as any,
      };
    }

    const project = await this.prisma.project.create({
      data: {
        name: params.title,
        description:
          params.shortDescription ||
          `Importado do GitHub Project #${params.number}`,
        status: 'active',
        companyId: params.companyId,
        teamId: params.teamId || null,
        githubOwner: params.owner,
        githubProjectNumber: params.number,
        githubProjectId: params.id,
        githubProjectUrl: params.url || null,
      },
    });

    let syncResult: Awaited<ReturnType<ProjectsService['syncGithubIssues']>> | {
      error: string;
    } | null = null;
    if (params.sync !== false) {
      try {
        syncResult = await this.syncGithubIssues(project.id);
      } catch (e: any) {
        syncResult = { error: e?.message || 'sync failed' };
      }
    }

    return { project, created: true, sync: syncResult };
  }
}

type GithubIssue = {
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  labels: { name: string }[];
  pull_request?: unknown;
};

type SyncItem = {
  kind: 'issue' | 'draft' | 'pull_request';
  title: string;
  body: string | null;
  state: string;
  html_url: string | null;
  githubIssueNumber: number | null;
  githubProjectItemId: string | null;
  labels: { name: string }[];
  projectStatus: string | null;
};

function itemKey(item: SyncItem): string {
  if (item.githubProjectItemId) return `item:${item.githubProjectItemId}`;
  if (item.githubIssueNumber != null) return `issue:${item.githubIssueNumber}`;
  return `title:${item.title}`;
}

function mapSyncItem(item: SyncItem) {
  const labels = (item.labels || []).map((l) => l.name.toLowerCase());
  let type = 'story';
  if (labels.some((l) => l.includes('bug') || l === 'defect')) type = 'bug';
  else if (labels.some((l) => l.includes('epic'))) type = 'epic';
  else if (labels.some((l) => l.includes('task') || l.includes('chore'))) type = 'task';
  else if (/^e\d+\s*·/i.test(item.title) && !/s\d+/i.test(item.title)) type = 'epic';

  let priority = 'medium';
  if (labels.some((l) => l.includes('critical') || l.includes('p0') || l === 'urgent')) {
    priority = 'high';
  } else if (labels.some((l) => l.includes('high') || l.includes('p1'))) {
    priority = 'high';
  } else if (labels.some((l) => l.includes('low') || l.includes('p3'))) {
    priority = 'low';
  }

  const status =
    item.projectStatus ||
    (item.state === 'closed' || item.state === 'CLOSED' ? 'done' : 'todo');

  const description = [
    item.body?.trim() || '',
    '',
    item.kind === 'draft'
      ? 'Synced from GitHub Project draft'
      : `Synced from GitHub #${item.githubIssueNumber}`,
    item.html_url || '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 8000);

  return {
    title: item.title.slice(0, 240),
    description,
    type,
    status,
    priority,
    githubIssueNumber: item.githubIssueNumber,
    githubIssueUrl: item.html_url,
    githubProjectItemId: item.githubProjectItemId,
  };
}

async function fetchGithubProjectStatuses(
  token: string,
  owner: string,
  projectNumber: number,
): Promise<Map<number, string>> {
  const query = `
    query($login: String!, $number: Int!, $after: String) {
      organization(login: $login) {
        projectV2(number: $number) {
          items(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              content {
                __typename
                ... on Issue { number }
              }
              fieldValues(first: 30) {
                nodes {
                  __typename
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field {
                      ... on ProjectV2FieldCommon { name }
                    }
                  }
                }
              }
            }
          }
        }
      }
      user(login: $login) {
        projectV2(number: $number) {
          items(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              content {
                __typename
                ... on Issue { number }
              }
              fieldValues(first: 30) {
                nodes {
                  __typename
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field {
                      ... on ProjectV2FieldCommon { name }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const result = new Map<number, string>();
  let after: string | null = null;
  let pages = 0;

  while (pages < 5) {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'sprinthub-sync',
      },
      body: JSON.stringify({
        query,
        variables: { login: owner, number: projectNumber, after },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub GraphQL ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as any;
    if (json.errors?.length) {
      // Org may 404 for user-owned projects — try continuing with user node
      const msg = json.errors.map((e: any) => e.message).join('; ');
      if (!json.data?.organization?.projectV2 && !json.data?.user?.projectV2) {
        throw new Error(`GitHub Projects: ${msg}`);
      }
    }

    const itemsConn =
      json.data?.organization?.projectV2?.items ||
      json.data?.user?.projectV2?.items;

    if (!itemsConn) {
      throw new Error(
        `Project #${projectNumber} não encontrado para "${owner}" (org ou user).`,
      );
    }

    for (const node of itemsConn.nodes || []) {
      const issueNumber = node?.content?.number;
      if (!issueNumber) continue;
      const statusName = extractStatusField(node.fieldValues?.nodes || []);
      if (!statusName) continue;
      result.set(issueNumber, mapProjectStatus(statusName));
    }

    if (!itemsConn.pageInfo?.hasNextPage) break;
    after = itemsConn.pageInfo.endCursor;
    pages += 1;
  }

  return result;
}

function extractStatusField(
  nodes: { __typename?: string; name?: string; field?: { name?: string } }[],
): string | null {
  for (const n of nodes) {
    if (n.__typename !== 'ProjectV2ItemFieldSingleSelectValue') continue;
    const fieldName = (n.field?.name || '').toLowerCase();
    if (fieldName === 'status' || fieldName.includes('status')) {
      return n.name || null;
    }
  }
  // fallback: first single-select
  const first = nodes.find(
    (n) => n.__typename === 'ProjectV2ItemFieldSingleSelectValue' && n.name,
  );
  return first?.name || null;
}

function mapProjectStatus(name: string): string {
  const n = name.toLowerCase().trim();
  if (
    n.includes('done') ||
    n.includes('complete') ||
    n.includes('closed') ||
    n.includes('feito') ||
    n.includes('conclu')
  ) {
    return 'done';
  }
  if (
    n.includes('progress') ||
    n.includes('doing') ||
    n.includes('review') ||
    n.includes('andamento') ||
    n.includes('develop')
  ) {
    return 'in_progress';
  }
  return 'todo';
}

type ListedGithubProject = {
  id: string;
  number: number;
  title: string;
  shortDescription: string | null;
  url: string;
  updatedAt: string;
  closed: boolean;
  owner: string;
};

function mapProjectNodes(
  nodes: any[],
  fallbackOwner: string,
): ListedGithubProject[] {
  const out: ListedGithubProject[] = [];
  for (const n of nodes || []) {
    if (!n?.id) continue;
    out.push({
      id: n.id,
      number: n.number,
      title: n.title,
      shortDescription: n.shortDescription || null,
      url: n.url,
      updatedAt: n.updatedAt,
      closed: !!n.closed,
      owner: n.owner?.login || fallbackOwner,
    });
  }
  return out;
}

async function githubGraphql(
  token: string,
  query: string,
  variables: Record<string, unknown>,
) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'sprinthub-sync',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GraphQL ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as any;
}

async function listAccessibleGithubProjects(
  token: string,
  orgLogins: string[] = [],
) {
  // Sem viewer.organizations — exige scope read:org que muitos PATs não têm.
  const viewerQuery = `
    query($after: String) {
      viewer {
        login
        projectsV2(first: 50, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            number
            title
            shortDescription
            url
            updatedAt
            closed
            owner { ... on User { login } ... on Organization { login } }
          }
        }
      }
    }
  `;

  const projects: ListedGithubProject[] = [];
  let after: string | null = null;
  let pages = 0;
  let viewerLogin = '';

  while (pages < 3) {
    const json = await githubGraphql(token, viewerQuery, { after });
    if (json.errors?.length && !json.data?.viewer?.projectsV2) {
      throw new Error(json.errors.map((e: any) => e.message).join('; '));
    }

    const viewer = json.data?.viewer;
    if (!viewer) throw new Error('Não foi possível listar projetos do GitHub.');
    viewerLogin = viewer.login || viewerLogin;

    projects.push(...mapProjectNodes(viewer.projectsV2?.nodes || [], viewerLogin));

    if (!viewer.projectsV2?.pageInfo?.hasNextPage) break;
    after = viewer.projectsV2.pageInfo.endCursor;
    pages += 1;
  }

  const orgQuery = `
    query($login: String!) {
      organization(login: $login) {
        login
        projectsV2(first: 50) {
          nodes {
            id
            number
            title
            shortDescription
            url
            updatedAt
            closed
            owner { ... on User { login } ... on Organization { login } }
          }
        }
      }
    }
  `;

  for (const login of orgLogins) {
    try {
      const json = await githubGraphql(token, orgQuery, { login });
      const org = json.data?.organization;
      if (!org) continue;
      projects.push(...mapProjectNodes(org.projectsV2?.nodes || [], org.login));
    } catch {
      // org inacessível / sem permissão — ignora
    }
  }

  const seen = new Set<string>();
  return projects
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

async function fetchGithubProjectItems(
  token: string,
  opts: {
    projectNodeId?: string | null;
    owner?: string;
    projectNumber?: number;
    projectUrl?: string | null;
  },
): Promise<SyncItem[]> {
  const itemFields = `
    pageInfo { hasNextPage endCursor }
    nodes {
      id
      content {
        __typename
        ... on Issue {
          number
          title
          body
          state
          url
          labels(first: 20) { nodes { name } }
        }
        ... on DraftIssue {
          title
          body
        }
        ... on PullRequest {
          number
          title
          body
          state
          url
        }
      }
      fieldValues(first: 30) {
        nodes {
          __typename
          ... on ProjectV2ItemFieldSingleSelectValue {
            name
            field { ... on ProjectV2FieldCommon { name } }
          }
        }
      }
    }
  `;

  const byNodeQuery = `
    query($id: ID!, $after: String) {
      node(id: $id) {
        ... on ProjectV2 {
          items(first: 50, after: $after) { ${itemFields} }
        }
      }
    }
  `;

  const byOwnerQuery = `
    query($login: String!, $number: Int!, $after: String) {
      organization(login: $login) {
        projectV2(number: $number) {
          items(first: 50, after: $after) { ${itemFields} }
        }
      }
      user(login: $login) {
        projectV2(number: $number) {
          items(first: 50, after: $after) { ${itemFields} }
        }
      }
    }
  `;

  const out: SyncItem[] = [];
  let after: string | null = null;
  let pages = 0;
  const useNode = !!opts.projectNodeId;

  while (pages < 10) {
    const json = useNode
      ? await githubGraphql(token, byNodeQuery, {
          id: opts.projectNodeId,
          after,
        })
      : await githubGraphql(token, byOwnerQuery, {
          login: opts.owner,
          number: opts.projectNumber,
          after,
        });

    const itemsConn = useNode
      ? json.data?.node?.items
      : json.data?.organization?.projectV2?.items ||
        json.data?.user?.projectV2?.items;

    if (!itemsConn) {
      if (json.errors?.length) {
        throw new Error(json.errors.map((e: any) => e.message).join('; '));
      }
      throw new Error(
        useNode
          ? 'GitHub Project não encontrado pelo id.'
          : `Project #${opts.projectNumber} não encontrado para "${opts.owner}".`,
      );
    }

    for (const node of itemsConn.nodes || []) {
      const c = node?.content;
      if (!c?.__typename) continue;
      const statusName = extractStatusField(node.fieldValues?.nodes || []);
      const projectStatus = statusName ? mapProjectStatus(statusName) : null;
      const itemUrl =
        c.url ||
        (opts.projectUrl
          ? `${opts.projectUrl}#${node.id}`
          : `github://project-item/${node.id}`);

      if (c.__typename === 'Issue' && c.number) {
        out.push({
          kind: 'issue',
          title: c.title,
          body: c.body || null,
          state:
            (c.state || 'OPEN').toLowerCase() === 'closed' ? 'closed' : 'open',
          html_url: c.url,
          githubIssueNumber: c.number,
          githubProjectItemId: node.id,
          labels: (c.labels?.nodes || []).map((l: { name: string }) => ({
            name: l.name,
          })),
          projectStatus,
        });
      } else if (c.__typename === 'DraftIssue' && c.title) {
        out.push({
          kind: 'draft',
          title: c.title,
          body: c.body || null,
          state: 'open',
          html_url: itemUrl,
          githubIssueNumber: null,
          githubProjectItemId: node.id,
          labels: [],
          projectStatus,
        });
      } else if (c.__typename === 'PullRequest' && c.number) {
        out.push({
          kind: 'pull_request',
          title: c.title,
          body: c.body || null,
          state:
            (c.state || 'OPEN').toLowerCase() === 'closed' ||
            (c.state || '').toLowerCase() === 'merged'
              ? 'closed'
              : 'open',
          html_url: c.url,
          githubIssueNumber: c.number,
          githubProjectItemId: node.id,
          labels: [],
          projectStatus,
        });
      }
    }

    if (!itemsConn.pageInfo?.hasNextPage) break;
    after = itemsConn.pageInfo.endCursor;
    pages += 1;
  }

  return out;
}
