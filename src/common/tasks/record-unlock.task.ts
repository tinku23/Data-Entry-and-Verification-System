import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecordsService } from '../../records/records.service';

@Injectable()
export class RecordUnlockTask {
  private readonly logger = new Logger(RecordUnlockTask.name);

  constructor(private readonly recordsService: RecordsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleUnlockExpiredRecords() {
    this.logger.log('Running expired record unlock task...');
    
    try {
      const unlockedCount = await this.recordsService.unlockExpiredRecords();
      this.logger.log(`Unlocked ${unlockedCount} expired records`);
    } catch (error) {
      this.logger.error('Failed to unlock expired records', error);
    }
  }
}
