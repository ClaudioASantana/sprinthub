<template>
  <div class="projects-page">
    <div class="page-header">
      <h1>Meus Projetos</h1>
      <button type="button" class="btn-github" @click="openGithubImport" :disabled="loadingGithub">
        {{ loadingGithub ? 'Carregando…' : 'Importar do GitHub' }}
      </button>
    </div>

    <div v-if="githubError" class="banner error">{{ githubError }}</div>
    <div v-if="importMsg" class="banner ok">{{ importMsg }}</div>

    <div v-if="showGithubPanel" class="github-panel glass-panel">
      <div class="github-panel-head">
        <h2>GitHub Projects</h2>
        <button type="button" class="linkish" @click="showGithubPanel = false">Fechar</button>
      </div>
      <p class="hint">
        Lista Projects da sua conta (token sem <code>read:org</code>). Para Projects de organização, informe o login da org abaixo ou use <code>GITHUB_ORGS</code> no .env.
      </p>
      <div class="org-row">
        <input
          v-model="orgFilter"
          type="text"
          placeholder="Org (opcional), ex: minha-org"
          @keyup.enter="openGithubImport"
        />
        <button type="button" class="btn-github" :disabled="loadingGithub" @click="openGithubImport">
          Atualizar lista
        </button>
      </div>
      <div v-if="githubProjects.length === 0 && !loadingGithub" class="empty-state">
        Nenhum GitHub Project encontrado.
      </div>
      <ul class="github-list">
        <li v-for="gp in githubProjects" :key="gp.id" class="github-row">
          <div class="github-info">
            <strong>{{ gp.title }}</strong>
            <span class="meta">{{ gp.owner }} · #{{ gp.number }}{{ gp.closed ? ' · fechado' : '' }}</span>
            <span v-if="gp.shortDescription" class="desc">{{ gp.shortDescription }}</span>
          </div>
          <button
            type="button"
            class="btn-import"
            :disabled="importingId === gp.id || alreadyImported(gp.id)"
            @click="importProject(gp)"
          >
            {{ alreadyImported(gp.id) ? 'Já importado' : importingId === gp.id ? 'Importando…' : 'Importar' }}
          </button>
        </li>
      </ul>
    </div>

    <div class="projects-grid">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card glass-panel"
        @click="goToProject(project.id)"
      >
        <h3>{{ project.name }}</h3>
        <p>{{ project.description || 'Sem descrição' }}</p>
        <div class="project-meta">
          <span :class="['status', 'status-' + project.status]">
            {{ statusLabels[project.status] || project.status }}
          </span>
          <span v-if="project.githubProjectId" class="gh-badge">GitHub</span>
          <span class="team">{{ project.team?.name || 'Sem equipe' }}</span>
        </div>
        <div class="project-stats">
          <span>{{ project.sprints?.length || 0 }} sprints</span>
          <span>{{ taskCount(project) }} tarefas</span>
        </div>
      </div>
      <p v-if="projects.length === 0" class="empty-state">Nenhum projeto encontrado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  githubProjectId?: string | null;
  team?: { name: string };
  sprints?: any[];
  tasks?: any[];
  _count?: { tasks?: number };
}

interface GithubProject {
  id: string;
  number: number;
  title: string;
  shortDescription: string | null;
  url: string;
  updatedAt: string;
  closed: boolean;
  owner: string;
}

const router = useRouter();
const projects = ref<Project[]>([]);
const githubProjects = ref<GithubProject[]>([]);
const showGithubPanel = ref(false);
const loadingGithub = ref(false);
const importingId = ref<string | null>(null);
const githubError = ref('');
const importMsg = ref('');
const orgFilter = ref('');

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
};

const api = () => import.meta.env.VITE_API_URL || '';
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const taskCount = (p: Project) =>
  p._count?.tasks ?? p.tasks?.length ?? 0;

const alreadyImported = (githubId: string) =>
  projects.value.some((p) => p.githubProjectId === githubId);

const fetchProjects = async () => {
  try {
    const res = await fetch(api() + '/api/projects', {
      headers: authHeaders(),
    });
    if (res.ok) projects.value = await res.json();
  } catch {
    projects.value = [];
  }
};

const openGithubImport = async () => {
  showGithubPanel.value = true;
  githubError.value = '';
  importMsg.value = '';
  loadingGithub.value = true;
  try {
    const qs = orgFilter.value.trim()
      ? `?org=${encodeURIComponent(orgFilter.value.trim())}`
      : '';
    const res = await fetch(api() + '/api/projects/github/list' + qs, {
      headers: authHeaders(),
    });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) {
      githubError.value =
        data?.message || `Falha ao listar (${res.status}). Verifique GITHUB_TOKEN.`;
      githubProjects.value = [];
      return;
    }
    githubProjects.value = Array.isArray(data) ? data : [];
  } catch (e: any) {
    githubError.value = e?.message || 'Erro de rede ao listar GitHub Projects';
    githubProjects.value = [];
  } finally {
    loadingGithub.value = false;
  }
};

const importProject = async (gp: GithubProject) => {
  importingId.value = gp.id;
  githubError.value = '';
  importMsg.value = '';
  try {
    const res = await fetch(api() + '/api/projects/github/import', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        id: gp.id,
        owner: gp.owner,
        number: gp.number,
        title: gp.title,
        url: gp.url,
        shortDescription: gp.shortDescription,
        sync: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      githubError.value = data?.message || `Falha ao importar (${res.status})`;
      return;
    }
    if (data.created === false) {
      importMsg.value = `"${gp.title}" já estava importado.`;
    } else {
      const sync = data.sync;
      const syncNote =
        sync?.error
          ? ` (sync: ${sync.error})`
          : sync
            ? ` · ${sync.created || 0} tarefas novas, ${sync.updated || 0} atualizadas`
            : '';
      importMsg.value = `"${gp.title}" importado.${syncNote}`;
    }
    await fetchProjects();
  } catch (e: any) {
    githubError.value = e?.message || 'Erro ao importar';
  } finally {
    importingId.value = null;
  }
};

const goToProject = (id: string) => {
  router.push(`/app/project/${id}/board`);
};

onMounted(fetchProjects);
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
}

.btn-github {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-primary);
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-github:disabled {
  opacity: 0.6;
  cursor: wait;
}

.banner {
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.banner.error {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.banner.ok {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
}

.github-panel {
  padding: 20px;
  margin-bottom: 24px;
}

.github-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.github-panel-head h2 {
  margin: 0;
  font-size: 18px;
}

.linkish {
  background: none;
  border: none;
  color: var(--neon-blue);
  cursor: pointer;
  font-size: 14px;
}

.hint {
  color: var(--color-text-secondary);
  font-size: 13px;
  margin: 0 0 16px;
}

.org-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.org-row input {
  flex: 1;
  min-width: 180px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text-primary);
}

.github-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.github-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.github-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.github-info .meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.github-info .desc {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.btn-import {
  flex-shrink: 0;
  border: none;
  background: var(--neon-blue);
  color: #0b1220;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-import:disabled {
  opacity: 0.5;
  cursor: default;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  padding: 24px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
  border-color: rgba(255, 255, 255, 0.2);
}

.project-card h3 {
  margin: 0 0 12px;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

.project-card p {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0 0 16px;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.status-inactive { background: rgba(239, 68, 68, 0.1); color: #f87171; }
.status-archived { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

.gh-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.75);
}

.team {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.project-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--neon-blue);
  font-weight: 500;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.empty-state {
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>
