#!/usr/bin/env bash
# Story 031 — falha se algum controller voltar a confiar em companyId vindo
# do cliente (query string ou corpo da requisição) em vez do JWT.
set -euo pipefail

cd "$(dirname "$0")/.."

PATTERN='@Query\((\x27|")companyId(\x27|")\)|\bbody\.companyId\b|\bdto\.companyId\b'

MATCHES=$(grep -rEn "$PATTERN" src --include='*.controller.ts' || true)

if [ -n "$MATCHES" ]; then
  echo "Auditoria de isolamento de tenant falhou:"
  echo "companyId não pode vir de @Query()/body do cliente — use @CurrentUser()."
  echo ""
  echo "$MATCHES"
  exit 1
fi

echo "Auditoria de isolamento de tenant OK: nenhum controller lê companyId de query/body do cliente."
