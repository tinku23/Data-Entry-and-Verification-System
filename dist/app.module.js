"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const records_module_1 = require("./records/records.module");
const batches_module_1 = require("./batches/batches.module");
const audit_logs_module_1 = require("./audit-logs/audit-logs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    console.log('🔍 Database Configuration Debug:');
                    console.log('DATABASE_HOST:', configService.get('DATABASE_HOST'));
                    console.log('DATABASE_PORT:', configService.get('DATABASE_PORT'));
                    console.log('DATABASE_USER:', configService.get('DATABASE_USER'));
                    console.log('DATABASE_NAME:', configService.get('DATABASE_NAME'));
                    console.log('DATABASE_SSL:', configService.get('DATABASE_SSL'));
                    console.log('DATABASE_URL:', configService.get('DATABASE_URL') ? 'SET' : 'NOT SET');
                    const databaseUrl = configService.get('DATABASE_URL');
                    if (databaseUrl) {
                        console.log('📊 Using DATABASE_URL for connection');
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            ssl: {
                                rejectUnauthorized: false
                            },
                            autoLoadEntities: true,
                            synchronize: configService.get('NODE_ENV') === 'development',
                            logging: configService.get('NODE_ENV') === 'development',
                            retryAttempts: 3,
                            retryDelay: 3000,
                        };
                    }
                    else {
                        console.log('📊 Using individual database parameters');
                        return {
                            type: 'postgres',
                            host: configService.get('DATABASE_HOST') || 'localhost',
                            port: parseInt(configService.get('DATABASE_PORT') || '5432', 10),
                            username: configService.get('DATABASE_USER') || 'postgres',
                            password: configService.get('DATABASE_PASSWORD'),
                            database: configService.get('DATABASE_NAME') || 'postgres',
                            ssl: configService.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
                            autoLoadEntities: true,
                            synchronize: configService.get('NODE_ENV') === 'development',
                            logging: configService.get('NODE_ENV') === 'development',
                            retryAttempts: 3,
                            retryDelay: 3000,
                        };
                    }
                },
                inject: [config_1.ConfigService],
            }),
            records_module_1.RecordsModule,
            batches_module_1.BatchesModule,
            audit_logs_module_1.AuditLogsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map