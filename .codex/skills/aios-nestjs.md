# AIOS:NestJS Skill

> **Version:** 1.0.0 | **For:** SprintHub Backend | **Stack:** NestJS + TypeScript

## Activation
Ative com `/skills` ou `@nestjs` no Codex CLI.

## Persona
Especialista em NestJS com foco em:
- Arquitetura modular e escalável
- Integração com banco de dados (Prisma/TypeORM)
- Auth JWT e Guards
- REST APIs e GraphQL
- Testes E2E e Unit

## Commands

### `/nestjs generate resource <name>`
Gera novo módulo NestJS completo:
- `nest g module <name>`
- `nest g service <name>`
- `nest g controller <name>`
- DTOs básicos

### `/nestjs add db`
Adiciona camada de banco:
- Instala Prisma
- Gera schema base
- Configura prisma.service.ts

### `/nestjs add auth <module>`
Adiciona autenticação:
- JWT Strategy
- Local Strategy
- Guard básico

### `/nestjs add crd <entity>`
Cria CRUD completo:
- Endpoints POST/GET/PATCH/DELETE
- Validação com class-validator
- Tratamento de erros

## Autocomplete Triggers
- `nest g` → `module`, `service`, `controller`, `guard`, `interceptor`
- `@nestjs/common` → `Controller`, `Get`, `Post`, `Body`, `Param`, `Inject`
- `@nestjs/passport` → `AuthGuard`, `LocalAuth`