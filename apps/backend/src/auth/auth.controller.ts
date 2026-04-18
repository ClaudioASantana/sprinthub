import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('login')
  login(@Res({ passthrough: true }) res: Response) {
    const authUrl = this.authService.getLoginUrl();
    return res.redirect(authUrl);
  }

  @Post('dev-login')
  devLogin(@Body() body: { email: string; role: string }) {
    const payload = {
      sub: 'dev-user-1',
      email: body.email,
      name: body.email.split('@')[0],
      role: body.role || 'member',
      profile: body.role === 'super_admin' ? 'super_admin' : 'user',
      companyId: 'company-demo-id',
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        profile: payload.profile,
        role: payload.role,
        companyId: payload.companyId,
      },
    };
  }

  @Get('login-url')
  loginUrl(@Res({ passthrough: true }) res: Response) {
    const authUrl = this.authService.getLoginUrl();
    return res.redirect(authUrl);
  }

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

  @Get('validate')
  validate(@Query('token') token: string) {
    const isValid = this.authService.validateSuperAdmin(token);
    return { valid: isValid };
  }
}
