# Modelo Entidade-Relacionamento (MER) - SprintHub

Abaixo está a representação visual da arquitetura de dados atual do SprintHub baseada no seu `schema.prisma`.

```mermaid
erDiagram
    %% Entities
    Company {
        String id PK
        String name
        String cnpj UK
        String responsible
        String email
        Boolean active
        DateTime createdAt
        DateTime updatedAt
    }

    User {
        String id PK
        String email UK
        String name
        String role
        Boolean active
        String companyId FK
        String teamId FK "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    Team {
        String id PK
        String name
        String description "nullable"
        Boolean active
        String companyId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Project {
        String id PK
        String name
        String description "nullable"
        String status
        DateTime startDate "nullable"
        DateTime endDate "nullable"
        String companyId FK
        String teamId FK "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    Sprint {
        String id PK
        String name
        String goal "nullable"
        String status
        DateTime startDate
        DateTime endDate
        String projectId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Task {
        String id PK
        String title
        String description "nullable"
        String type
        String status
        String priority
        Int storyPoints "nullable"
        String projectId FK
        String sprintId FK "nullable"
        String assigneeId FK "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    %% Relationships
    Company ||--o{ Team : "has"
    Company ||--o{ User : "has"
    Company ||--o{ Project : "owns"

    Team ||--o{ User : "contains members"
    Team ||--o{ Project : "manages"

    Project ||--o{ Sprint : "divided into"
    Project ||--o{ Task : "backlog contains"

    Sprint ||--o{ Task : "includes"

    User ||--o{ Task : "assigned to"
```

## Resumo das Conexões Arquiteturais:
- O **Company (Tenant)** é o coração multi-tenant. Ele é dono de Equipes, Projetos e Usuários.
- A **Team** agrupa **Users** e gerencia múltiplos **Projects**.
- O **Project** aloja diversas **Sprints** (ciclos de tempo) e um Backlog enorme de **Tasks**.
- A **Task** pode estar orfã no Backlog (somente apontando pro `Project`) ou embutida em uma `Sprint` ativa, focada num encarregado (`Assignee`).
