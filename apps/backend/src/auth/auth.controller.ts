import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { Public } from './decorators/public.decorator';

const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

// Todas as rotas aqui são, por natureza, o fluxo de obtenção do token —
// não faz sentido exigir um token para conseguir um token.
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('login')
  login(@Res({ passthrough: true }) res: Response) {
    const authUrl = this.authService.getLoginUrl();
    return res.redirect(authUrl);
  }

  // Story 032: única "chave" liberada sem senha, e só em dev — nunca cria
  // empresa/usuário, e role/profile vêm sempre do registro no banco, nunca
  // do body da requisição.
  //
  // ALLOW_DEV_LOGIN=true reabre isso em produção — usado no deploy LAN
  // enquanto não existe um provedor de auth real (o "Go Auth" nunca foi
  // implementado, ver Story 032). Nunca setar isso num ambiente exposto
  // à internet.
  @Throttle(AUTH_THROTTLE)
  @Post('dev-login')
  async devLogin(@Body() body: { email: string }) {
    const allowInProd = process.env.ALLOW_DEV_LOGIN === 'true';
    if (process.env.NODE_ENV === 'production' && !allowInProd) {
      throw new NotFoundException();
    }

    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      include: { company: true },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { access_token, refresh_token } =
      await this.authService.issueTokenPair(user);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: user.role === 'super_admin' ? 'super_admin' : 'user',
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  @Throttle(AUTH_THROTTLE)
  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    if (!body?.refresh_token) {
      throw new UnauthorizedException('refresh_token não fornecido');
    }
    return this.authService.rotateRefreshToken(body.refresh_token);
  }

  @Post('logout')
  async logout(@Body() body: { refresh_token: string }) {
    if (body?.refresh_token) {
      await this.authService.revokeRefreshToken(body.refresh_token);
    }
    return { success: true };
  }

  @Get('login-url')
  loginUrl(@Res({ passthrough: true }) res: Response) {
    const authUrl = this.authService.getLoginUrl();
    return res.redirect(authUrl);
  }

  @Throttle(AUTH_THROTTLE)
  @Get('callback')
  async callback(@Query('code') code: string, @Query('error') error: string) {
    if (error) {
      throw new UnauthorizedException(error);
    }

    if (!code) {
      throw new UnauthorizedException('Authorization code not provided');
    }

    const authData = await this.authService.exchangeCodeForToken(code);

    const isSuperAdmin = this.authService.validateSuperAdmin(
      authData.access_token,
    );

    if (!isSuperAdmin) {
      throw new UnauthorizedException(
        'Access denied. Super admin privileges required.',
      );
    }

    return {
      message: 'Authentication successful',
      user: authData.user,
      redirectUrl: '/dashboard',
    };
  }

  @Throttle(AUTH_THROTTLE)
  @Get('tenant-callback')
  async tenantCallback(
    @Query('code') code: string,
    @Query('error') error: string,
  ) {
    if (error) {
      throw new UnauthorizedException(error);
    }

    if (!code) {
      throw new UnauthorizedException('Authorization code not provided');
    }

    // Troca o código pelo Token
    const authData = await this.authService.exchangeCodeForToken(code);

    if (!authData || !authData.access_token) {
      throw new UnauthorizedException('Falha na autenticação do Tenant');
    }

    return {
      message: 'Authentication successful',
      user: authData.user,
      access_token: authData.access_token,
      redirectUrl: '/dashboard',
    };
  }

  @Get('validate')
  validate(@Query('token') token: string) {
    const isValid = this.authService.validateSuperAdmin(token);
    return { valid: isValid };
  }
}
