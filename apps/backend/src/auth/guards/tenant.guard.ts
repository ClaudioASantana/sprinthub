import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;

      const userCompanyId = payload.companyId;
      const requestedCompanyId =
        request.params.companyId || request.query.companyId;

      if (requestedCompanyId && userCompanyId !== requestedCompanyId) {
        throw new ForbiddenException('Acesso negado a dados de outra empresa');
      }

      return true;
    } catch {
      return false;
    }
  }
}
