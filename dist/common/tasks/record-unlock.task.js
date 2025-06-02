"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RecordUnlockTask_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordUnlockTask = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const records_service_1 = require("../../records/records.service");
let RecordUnlockTask = RecordUnlockTask_1 = class RecordUnlockTask {
    constructor(recordsService) {
        this.recordsService = recordsService;
        this.logger = new common_1.Logger(RecordUnlockTask_1.name);
    }
    async handleUnlockExpiredRecords() {
        this.logger.log('Running expired record unlock task...');
        try {
            const unlockedCount = await this.recordsService.unlockExpiredRecords();
            this.logger.log(`Unlocked ${unlockedCount} expired records`);
        }
        catch (error) {
            this.logger.error('Failed to unlock expired records', error);
        }
    }
};
exports.RecordUnlockTask = RecordUnlockTask;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecordUnlockTask.prototype, "handleUnlockExpiredRecords", null);
exports.RecordUnlockTask = RecordUnlockTask = RecordUnlockTask_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [records_service_1.RecordsService])
], RecordUnlockTask);
//# sourceMappingURL=record-unlock.task.js.map