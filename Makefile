.PHONY: dev build test lint install clean db-generate db-push

# Start development servers (frontend and backend in parallel)
dev:
	pnpm dev

# Build the project
build:
	pnpm build

# Run tests
test:
	pnpm test

# Run linting
lint:
	pnpm lint

# Install dependencies
install:
	pnpm install

# Prisma specific commands (assumes backend uses Prisma based on earlier history)
db-generate:
	cd apps/backend && npx prisma generate

db-push:
	cd apps/backend && npx prisma db push

db-seed:
	cd apps/backend && npx prisma db seed

db-init:
	$(MAKE) db-push
	$(MAKE) db-seed

# Clean node_modules
clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
