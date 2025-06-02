import { Controller, Post, Body } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Post()
  logAction(@Body() body: any) {
    return this.service.createLog(body);
  }
}
