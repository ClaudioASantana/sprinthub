# Story 009 - Autenticação de Usuários

## Descrição
Como Usuário membro de uma empresa,
Quero realizar login no sistema para acessar o painel de projetos e tarefas,
Para gerenciar meu trabalho em sprints e backlogs.

## Critérios de Aceite
- [x] O usuário deve conseguir fazer login via Gestão de Acesso (Go Auth).
- [x] O sistema deve validar o token JWT eextrair informações do usuário.
- [x] O usuário deve ter acesso apenas aos dados da sua empresa (isolamento de tenant).
- [x] O frontend deve exibir interface de login quando não autenticado.
- [x] O frontend deve exibir dados do usuário logado no header.
- [x] O sistema deve redirecionar para dashboard após login válido.
- [x] O sistema deve negar acesso (403) para usuários sem permissão.

## Technical Notes
- Integração com Go Auth (OAuth2/JWT)
- Middleware de auth no backend
- Rotas protegidas no frontend
- Stored user info no localStorage
- CompanyId associado ao usuário via JWT