import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new HttpException('companyId is required', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.findAll(companyId);
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      email: string;
      role: string;
      companyId: string;
    },
  ) {
    if (!body.companyId) {
      throw new HttpException('companyId is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.usersService.create(body);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }
}
