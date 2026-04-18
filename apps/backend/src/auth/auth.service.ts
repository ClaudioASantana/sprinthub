import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  profile?: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
}
