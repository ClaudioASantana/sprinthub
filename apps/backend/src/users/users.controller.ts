import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { tenantScope } from '../auth/tenant.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAll(tenantScope(user));
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      email: string;
      role: string;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user?.companyId) {
      throw new HttpException(
        'Usuário sem companyId no token.',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.usersService.create({
        ...body,
        companyId: user.companyId,
      });
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }
}
