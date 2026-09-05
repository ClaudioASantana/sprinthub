import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHash, randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dto/auth.dto';
import { PrismaService } from '../prisma.service';
import type { User } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  profile?: string;
  role?: string;
  companyId?: string;
  name?: string;
  companyName?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

// 30 dias por padrão — configurável via JWT_REFRESH_EXPIRES_IN_DAYS.
const DEFAULT_REFRESH_TOKEN_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  getLoginUrl(): string {
    const authUrl = this.configService.get<string>('GO_AUTH_URL') ?? '';
    const clientId = this.configService.get<string>('GO_CLIENT_ID') ?? '';
    const redirectUri = this.configService.get<string>('GO_REDIRECT_URI') ?? '';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
    });

    return `${authUrl}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<AuthResponseDto> {
    const authUrl = this.configService.get<string>('GO_AUTH_URL') ?? '';
    const clientId = this.configService.get<string>('GO_CLIENT_ID') ?? '';
    const clientSecret =
      this.configService.get<string>('GO_CLIENT_SECRET') ?? '';
    const redirectUri = this.configService.get<string>('GO_REDIRECT_URI') ?? '';

    const response = await axios.post(`${authUrl}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const accessToken = response.data?.access_token as string;
    return this.validateAndDecodeToken(accessToken);
  }

  validateAndDecodeToken(accessToken: string): AuthResponseDto {
    const payload = this.jwtService.verify(accessToken);

    return {
      access_token: accessToken,
      user: {
        id: payload.sub,
        email: payload.email,
        profile: payload.profile ?? payload.role ?? 'user',
      },
    };
  }

  validateSuperAdmin(token: string): boolean {
    try {
      const payload = this.jwtService.verify(token);
      return (
        payload.profile === 'super_admin' || payload.role === 'super_admin'
      );
    } catch {
      return false;
    }
  }

  /** Monta o payload do JWT a partir do registro do usuário no banco — nunca de um body de request. */
  buildJwtPayload(user: User & { company?: { name: string } }): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.role === 'super_admin' ? 'super_admin' : 'user',
      companyId: user.companyId,
      companyName: user.company?.name,
    };
  }

  /** Assina o access token curto + emite e persiste (hasheado) um refresh token novo. */
  async issueTokenPair(
    user: User & { company?: { name: string } },
  ): Promise<TokenPair> {
    const access_token = this.jwtService.sign(this.buildJwtPayload(user));
    const refresh_token = await this.issueRefreshToken(user.id);
    return { access_token, refresh_token };
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(40).toString('hex');
    const days = Number(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN_DAYS') ??
        DEFAULT_REFRESH_TOKEN_DAYS,
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(raw),
        userId,
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    });

    return raw;
  }

  /** Valida o refresh token, revoga-o e emite um par novo (rotação). */
  async rotateRefreshToken(rawToken: string): Promise<TokenPair> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: { include: { company: true } } },
    });

    if (
      !record ||
      record.revokedAt ||
      record.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair(record.user);
  }

  /** Revoga um refresh token (logout). Idempotente — não erra se já não existir/estiver revogado. */
  async revokeRefreshToken(rawToken: string): Promise<void> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });

    if (record && !record.revokedAt) {
      await this.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      });
    }
  }
}

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
