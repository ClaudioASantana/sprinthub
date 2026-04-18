import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token not provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify(token);
      const profile = payload.profile ?? payload.role;

      if (profile !== 'super_admin') {
        throw new ForbiddenException(
          'Access denied. Super admin privileges required.',
        );
      }

      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
