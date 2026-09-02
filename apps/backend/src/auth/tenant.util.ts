import { AuthenticatedUser } from './decorators/current-user.decorator';

export function isSuperAdmin(user: AuthenticatedUser | undefined): boolean {
  return user?.profile === 'super_admin';
}

// companyId "efetivo" para escopar queries: undefined para super_admin
// (sem filtro, cruza tenants de propósito), companyId do token para todo
// resto. Usado em toda query "lista" e "um recurso por id".
export function tenantScope(user: AuthenticatedUser | undefined): string | undefined {
  return isSuperAdmin(user) ? undefined : user?.companyId;
}
