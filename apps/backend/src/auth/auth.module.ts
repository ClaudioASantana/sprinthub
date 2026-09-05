import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  JwtModule,
  type JwtModuleOptions,
  type JwtSignOptions,
} from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      // JWT_SECRET já foi validado em main.ts::assertJwtSecretConfigured
      // antes da aplicação subir — aqui é só leitura.
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET,
        // Story 032: token de acesso curto — a sessão longa vive no refresh token.
        signOptions: {
          expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ||
            '15m') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SuperAdminGuard],
  exports: [AuthService, SuperAdminGuard, JwtModule],
})
export class AuthModule {}
