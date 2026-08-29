<template>
  <div class="overview-page">
    <div class="stats-grid" v-if="!isLoading && stats && !hasError">
      <div class="card glass-panel">
        <span class="label">Tasks no projeto</span>
        <span class="value">{{ stats.totalTasks }}</span>
      </div>
      <div class="card glass-panel">
        <span class="label">Product Backlog</span>
        <span class="value">{{ stats.backlogCount }}</span>
        <p class="hint">sem sprint</p>
      </div>
      <div class="card glass-panel">
        <span class="label">A fazer</span>
        <span class="value">{{ stats.byStatus.todo }}</span>
      </div>
      <div class="card glass-panel">
        <span class="label">Em progresso</span>
        <span class="value">{{ stats.byStatus.in_progress }}</span>
      </div>
      <div class="card glass-panel">
        <span class="label">Concluídas</span>
        <span class="value">{{ stats.byStatus.done }}</span>
      </div>
      <div class="card glass-panel sprint-card" v-if="stats.activeSprint">
        <span class="label">Sprint ativo</span>
        <span class="value name">{{ stats.activeSprint.name }}</span>
        <p class="hint" v-if="stats.activeSprint.goal">{{ stats.activeSprint.goal }}</p>
        <p class="hint">
          {{ formatDate(stats.activeSprint.startDate) }} —
          {{ formatDate(stats.activeSprint.endDate) }}
        </p>
        <div class="progress-block">
          <div class="progress-meta">
            <span>{{ stats.activeSprint.percentDone }}% done</span>
            <span>
              {{ stats.activeSprint.byStatus.done }}/{{ stats.activeSprint.taskTotal }} tasks
            </span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: stats.activeSprint.percentDone + '%' }"
            />
          </div>
          <p class="hint" v-if="stats.activeSprint.pointsCommitted">
            Pontos: {{ stats.activeSprint.pointsDone }} /
            {{ stats.activeSprint.pointsCommitted }}
            <template v-if="stats.activeSprint.capacityPoints != null">
              · Capacidade {{ stats.activeSprint.capacityPoints }}
              ({{ stats.activeSprint.capacityRemaining }} restantes)
            </template>
          </p>
        </div>
      </div>
      <div class="card glass-panel" v-else>
        <span class="label">Sprint ativo</span>
        <span class="value name">Nenhum</span>
        <p class="hint">Crie ou ative um sprint na aba Sprints</p>
      </div>
    </div>

    <div class="stats-grid" v-else-if="isLoading">
      <div class="card glass-panel skeleton" v-for="i in 6" :key="i">
        <div class="pulse line short" />
        <div class="pulse line" />
      </div>
    </div>

    <div class="error-banner" v-if="hasError">
      Não foi possível carregar as métricas do projeto.
      <button type="button" class="retry" @click="loadAll">Tentar de novo</button>
    </div>

    <!-- GitHub sync -->
    <section class="github-panel glass-panel">
      <div class="burndown-header">
        <div>
          <h2>GitHub Issues</h2>
          <p class="hint">
            Sync one-way: Issues → Tasks. Se informar Project #, o Status do GitHub Projects v2
            sobrescreve o status da task.
          </p>
        </div>
      </div>
      <form class="github-form" @submit.prevent="saveGithubConfig">
        <div class="form-row">
          <div class="form-group">
            <label>Owner</label>
            <input v-model="githubForm.owner" class="dark-input" placeholder="org ou user" />
          </div>
          <div class="form-group">
            <label>Repo</label>
            <input v-model="githubForm.repo" class="dark-input" placeholder="nome-do-repo" />
          </div>
          <div class="form-group">
            <label>Project # (opcional)</label>
            <input
              v-model.number="githubForm.projectNumber"
              type="number"
              min="1"
              class="dark-input"
              placeholder="ex: 1"
            />
          </div>
        </div>
        <div class="github-actions">
          <button type="submit" class="btn btn-outline" :disabled="githubSaving">
            {{ githubSaving ? 'Salvando…' : 'Salvar repo' }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="githubSyncing || !githubForm.owner || !githubForm.repo"
            @click="syncGithub"
          >
            {{ githubSyncing ? 'Sincronizando…' : 'Sync Issues' }}
          </button>
        </div>
      </form>
      <p v-if="githubMsg" class="hint success-msg">{{ githubMsg }}</p>
      <p v-if="githubErr" class="hint error-msg">{{ githubErr }}</p>
    </section>

    <!-- Burndown -->
    <section class="burndown-panel glass-panel" v-if="burndown && !burndownLoading">
      <div class="burndown-header">
        <div>
          <h2>Burndown</h2>
          <p class="hint">
            {{ burndown.sprintName }} ·
            {{ burndown.unit === 'points' ? 'story points' : 'tarefas' }} ·
            restante {{ burndown.remainingNow }} / {{ burndown.totalCommitted }}
          </p>
        </div>
        <div class="legend">
          <span class="leg ideal">Ideal</span>
          <span class="leg actual">Real</span>
        </div>
      </div>

      <svg
        v-if="chart.idealPath"
        class="burndown-svg"
        :viewBox="`0 0 ${chart.w} ${chart.h}`"
        role="img"
        aria-label="Gráfico de burndown"
      >
        <g class="grid">
          <line
            v-for="(gy, i) in chart.gridY"
            :key="'gy'+i"
            :x1="chart.padL"
            :x2="chart.w - chart.padR"
            :y1="gy"
            :y2="gy"
          />
        </g>
        <polyline class="line ideal" :points="chart.idealPath" fill="none" />
        <polyline
          v-if="chart.actualPath"
          class="line actual"
          :points="chart.actualPath"
          fill="none"
        />
        <g class="axis-labels">
          <text
            v-for="(lab, i) in chart.xLabels"
            :key="'xl'+i"
            :x="lab.x"
            :y="chart.h - 8"
            text-anchor="middle"
          >{{ lab.text }}</text>
          <text
            v-for="(lab, i) in chart.yLabels"
            :key="'yl'+i"
            :x="chart.padL - 8"
            :y="lab.y + 4"
            text-anchor="end"
          >{{ lab.text }}</text>
        </g>
      </svg>
      <p v-else class="hint">Sem dados suficientes para o gráfico.</p>
    </section>

    <section class="burndown-panel glass-panel skeleton-panel" v-else-if="burndownLoading">
      <div class="pulse line short" />
      <div class="pulse chart-skel" />
    </section>

    <!-- Velocity -->
    <section class="velocity-panel glass-panel" v-if="velocity">
      <div class="burndown-header">
        <div>
          <h2>Velocity</h2>
          <p class="hint">
            Média dos últimos sprints concluídos:
            <strong>{{ velocity.averagePoints }}</strong> pts
          </p>
        </div>
      </div>
      <div v-if="velocity.sprints.length === 0" class="hint">
        Ainda não há sprints concluídos para calcular velocity.
      </div>
      <div v-else class="velocity-bars">
        <div v-for="s in velocity.sprints" :key="s.id" class="velocity-col">
          <div class="bar-wrap">
            <div
              class="bar"
              :style="{ height: velocityBarHeight(s.pointsDone) + '%' }"
              :title="s.pointsDone + ' pts'"
            />
          </div>
          <span class="bar-value">{{ s.pointsDone }}</span>
          <span class="bar-label">{{ shortName(s.name) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch, type Ref, type ComputedRef } from 'vue';

type HubCtx = {
  project: Ref<any>;
  projectId: ComputedRef<string>;
  activeSprint: ComputedRef<any>;
  refresh?: () => Promise<void> | void;
};

const hub = inject<HubCtx>('projectHub');
const projectId = hub!.projectId;
const activeSprint = hub!.activeSprint;
const project = hub!.project;

const stats = ref<any>(null);
const burndown = ref<any>(null);
const velocity = ref<any>(null);
const isLoading = ref(true);
const burndownLoading = ref(false);
const hasError = ref(false);

const githubForm = ref({ owner: '', repo: '', projectNumber: null as number | null });
const githubSaving = ref(false);
const githubSyncing = ref(false);
const githubMsg = ref('');
const githubErr = ref('');

watch(
  project,
  (p) => {
    if (p) {
      githubForm.value = {
        owner: p.githubOwner || '',
        repo: p.githubRepo || '',
        projectNumber: p.githubProjectNumber ?? null,
      };
    }
  },
  { immediate: true },
);

function formatDate(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

function shortName(name: string) {
  return name.length > 18 ? name.slice(0, 16) + '…' : name;
}

function velocityBarHeight(points: number) {
  const max = Math.max(
    1,
    ...(velocity.value?.sprints || []).map((s: any) => s.pointsDone || 0),
  );
  return Math.round((points / max) * 100);
}

const chart = computed(() => {
  const data = burndown.value;
  const w = 640;
  const h = 260;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  if (!data?.points?.length) {
    return { w, h, padL, padR, idealPath: '', actualPath: '', gridY: [], xLabels: [], yLabels: [] };
  }

  const pts = data.points as { date: string; ideal: number; remaining: number | null }[];
  const maxY = Math.max(data.totalCommitted || 0, ...pts.map((p) => p.ideal), 1);
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const xAt = (i: number) =>
    padL + (pts.length === 1 ? plotW / 2 : (i / (pts.length - 1)) * plotW);
  const yAt = (v: number) => padT + plotH - (v / maxY) * plotH;

  const idealPath = pts.map((p, i) => `${xAt(i)},${yAt(p.ideal)}`).join(' ');
  const actualPts = pts.filter((p) => p.remaining != null);
  const actualPath = actualPts
    .map((p) => {
      const i = pts.findIndex((x) => x.date === p.date);
      return `${xAt(i)},${yAt(p.remaining as number)}`;
    })
    .join(' ');

  const gridY = [0, 0.25, 0.5, 0.75, 1].map((f) => padT + plotH * (1 - f));
  const yLabels = [0, 0.5, 1].map((f) => ({
    y: padT + plotH * (1 - f),
    text: String(Math.round(maxY * f)),
  }));

  const labelIdx = [0, Math.floor((pts.length - 1) / 2), pts.length - 1].filter(
    (v, i, a) => a.indexOf(v) === i,
  );
  const xLabels = labelIdx.map((i) => ({
    x: xAt(i),
    text: pts[i].date.slice(5), // MM-DD
  }));

  return { w, h, padL, padR, idealPath, actualPath, gridY, xLabels, yLabels };
});

async function loadStats() {
  isLoading.value = true;
  hasError.value = false;
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || '';
  try {
    const res = await fetch(`${base}/api/projects/${projectId.value}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(String(res.status));
    stats.value = await res.json();
  } catch {
    stats.value = null;
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function loadBurndown() {
  const sprintId = stats.value?.activeSprint?.id || activeSprint.value?.id;
  if (!sprintId) {
    burndown.value = null;
    return;
  }
  burndownLoading.value = true;
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || '';
  try {
    const res = await fetch(`${base}/api/sprints/${sprintId}/burndown`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) burndown.value = await res.json();
    else burndown.value = null;
  } catch {
    burndown.value = null;
  } finally {
    burndownLoading.value = false;
  }
}

async function loadVelocity() {
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || '';
  try {
    const res = await fetch(`${base}/api/projects/${projectId.value}/velocity`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) velocity.value = await res.json();
    else velocity.value = null;
  } catch {
    velocity.value = null;
  }
}

async function saveGithubConfig() {
  githubSaving.value = true;
  githubMsg.value = '';
  githubErr.value = '';
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || '';
  try {
    const res = await fetch(`${base}/api/projects/${projectId.value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        githubOwner: githubForm.value.owner.trim(),
        githubRepo: githubForm.value.repo.trim(),
        githubProjectNumber: githubForm.value.projectNumber
          ? Number(githubForm.value.projectNumber)
          : null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    githubMsg.value = 'Repositório salvo.';
    await hub?.refresh?.();
  } catch (e: any) {
    githubErr.value = e?.message || 'Falha ao salvar';
  } finally {
    githubSaving.value = false;
  }
}

async function syncGithub() {
  githubSyncing.value = true;
  githubMsg.value = '';
  githubErr.value = '';
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || '';
  try {
    // ensure config saved first
    await saveGithubConfig();
    const res = await fetch(`${base}/api/projects/${projectId.value}/github/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    const projectPart = data.projectStatusesApplied
      ? ` · ${data.projectStatusesApplied} status do Project`
      : '';
    githubMsg.value = `Sync OK: ${data.fetched} issues · ${data.created} criadas · ${data.updated} atualizadas (${data.repo})${projectPart}`;
    await loadAll();
  } catch (e: any) {
    githubErr.value = e?.message || 'Falha no sync';
  } finally {
    githubSyncing.value = false;
  }
}

async function loadAll() {
  await loadStats();
  await Promise.all([loadBurndown(), loadVelocity()]);
}

watch(projectId, loadAll);
onMounted(loadAll);
</script>

<style scoped>
.overview-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sprint-card {
  grid-column: span 2;
}

@media (max-width: 640px) {
  .sprint-card {
    grid-column: span 1;
  }
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

.value {
  font-size: 1.75rem;
  font-weight: 700;
}

.value.name {
  font-size: 1.15rem;
}

.hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.progress-block {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.progress-bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.burndown-panel {
  padding: 20px;
}

.burndown-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.burndown-header h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
}

.legend {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
}

.leg::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 3px;
  margin-right: 6px;
  vertical-align: middle;
  border-radius: 2px;
}

.leg.ideal::before {
  background: #94a3b8;
}

.leg.actual::before {
  background: #3b82f6;
}

.burndown-svg {
  width: 100%;
  height: auto;
  max-height: 280px;
}

.burndown-svg .grid line {
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 1;
}

.burndown-svg .line.ideal {
  stroke: #94a3b8;
  stroke-width: 2;
  stroke-dasharray: 6 4;
}

.burndown-svg .line.actual {
  stroke: #3b82f6;
  stroke-width: 2.5;
}

.burndown-svg .axis-labels text {
  fill: var(--color-text-secondary, #94a3b8);
  font-size: 10px;
}

.skeleton-panel .chart-skel {
  height: 180px;
  margin-top: 16px;
  border-radius: 8px;
}

.skeleton .pulse,
.skeleton-panel .pulse {
  height: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  animation: pulse 1.2s ease-in-out infinite;
}

.skeleton .line {
  width: 60%;
  margin-top: 12px;
  height: 28px;
}

.skeleton .line.short,
.skeleton-panel .line.short {
  width: 40%;
  height: 10px;
  margin-top: 0;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.error-banner {
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  display: flex;
  gap: 12px;
  align-items: center;
}

.retry {
  background: transparent;
  border: 1px solid currentColor;
  color: inherit;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}

.velocity-panel {
  padding: 20px;
}

.velocity-bars {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  min-height: 160px;
  margin-top: 12px;
}

.velocity-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.bar-wrap {
  width: 100%;
  max-width: 48px;
  height: 120px;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  border-radius: 8px 8px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}

.bar-value {
  font-size: 0.8rem;
  font-weight: 600;
}

.bar-label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.github-panel {
  padding: 20px;
}

.github-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  gap: 12px;
}

@media (max-width: 700px) {
  .github-form .form-row {
    grid-template-columns: 1fr;
  }
}

.github-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.github-form label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

.github-form .dark-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  background: var(--bg-darker, #0d0b14);
  color: var(--color-text-primary, #fff);
}

.github-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.success-msg {
  color: #34d399 !important;
  margin-top: 10px !important;
}

.error-msg {
  color: #f87171 !important;
  margin-top: 10px !important;
}
</style>
