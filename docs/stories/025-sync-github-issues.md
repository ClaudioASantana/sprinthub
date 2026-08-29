---
title: "Story 025 - Sync GitHub Issues → Tasks (one-way)"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 025 - Sync GitHub Issues → Tasks (one-way)

## Descrição
Como Product Owner,
Quero sincronizar Issues de um repositório GitHub para Tasks do projeto,
Para usar o SprintHub como visualização/acompanhamento do backlog que vive no GitHub.

## Critérios de Aceite
- [x] Project armazena `githubOwner` + `githubRepo`.
- [x] Task armazena `githubIssueNumber` + `githubIssueUrl` (único por projeto).
- [x] `PATCH /api/projects/:id` atualiza o repo GitHub.
- [x] `POST /api/projects/:id/github/sync` importa/atualiza Issues (one-way).
- [x] Requer `GITHUB_TOKEN` ou `GH_TOKEN` no backend.
- [x] Overview: formulário owner/repo + botão Sync.
- [x] Issues fechadas → status `done`; abertas → `todo`; PRs ignorados.
- [x] Labels mapeiam type/priority (bug, epic, high/low, etc.).

## Technical Notes
- Auth: JWT + tenant check
- API GitHub REST `/repos/{owner}/{repo}/issues`
- Re-sync é idempotente via `githubIssueNumber`
