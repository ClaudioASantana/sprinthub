import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Health check: precisa responder sem token para orquestradores/monitoramento.
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    const companyId = req.user?.companyId as string | undefined;
    return this.appService.getStats(companyId);
  }
}
