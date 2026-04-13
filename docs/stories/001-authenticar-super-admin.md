# Autenticar Super Admin

## Descrição
Como Administrador Global (membro ativo da equipe raiz do SprintHub),
Quero realizar o login no painel administrativo utilizando a central de Autenticação Única (Gestão de Acesso),
Para obter acesso seguro ao portal e provar meus privilégios de alto nível.

## Critérios de Aceite
- [ ] O Backoffice deve redirecionar o usuário não autenticado para o portal de login do **Gestão de Acesso**.
- [ ] Ao retornar do Gestão de Acesso, o sistema deve decodificar o token JWT.
- [ ] O token JWT deve conter um campo `Perfil` explícito informando `super_admin`.
- [ ] Se o token não indicar o perfil de `super_admin`, o acesso ao painel deve ser negado (Retornando erro HTTP 403 Forbidden).
- [ ] Caso o perfil seja válido, o usuário será direcionado ao Dashboard do Backoffice.
