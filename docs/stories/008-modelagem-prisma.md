# Story 008 - Modelagem de Dados com Prisma

## Descrição
Como Desenvolvedor,
Quero configurar o Prisma como ORM e definir as entidades do sistema,
Para que possamos persistir dados reais no banco PostgreSQL.

## Critérios de Aceite
- [x] Instalar e configurar Prisma no backend.
- [x] Criar schema.prisma com entidades: Company, Team, User, Project, Sprint, Task.
- [x] Configurar migrations para criar tabelas no banco.
- [x] Atualizar Services para usar PrismaClient real.
- [x] Executar migration inicial.

## Technical Notes
- Provider: PostgreSQL
- Entidades com relações (Company hasMany Teams, Project belongsTo Company, etc.)
- PrismaClient singleton no backend