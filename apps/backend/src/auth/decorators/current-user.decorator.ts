import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  companyId?: string;
  profile?: string;
  role?: string;
  name?: string;
}

// O JwtAuthGuard (global) já populou request.user com o payload verificado
// do token — este decorator só expõe esse valor tipado nos handlers.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
