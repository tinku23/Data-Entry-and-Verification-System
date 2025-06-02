import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { Record } from './entities/record.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record, AuditLog])],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService, TypeOrmModule],
})
export class RecordsModule {}