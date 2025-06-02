import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecordsModule } from './records/records.module';
import { BatchesModule } from './batches/batches.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('🔍 Database Configuration Debug:');
        console.log('DATABASE_HOST:', configService.get('DATABASE_HOST'));
        console.log('DATABASE_PORT:', configService.get('DATABASE_PORT'));
        console.log('DATABASE_USER:', configService.get('DATABASE_USER'));
        console.log('DATABASE_NAME:', configService.get('DATABASE_NAME'));
        console.log('DATABASE_SSL:', configService.get('DATABASE_SSL'));
        console.log('DATABASE_URL:', configService.get('DATABASE_URL') ? 'SET' : 'NOT SET');

        // Use DATABASE_URL if available, otherwise use individual params
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
        } else {
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
      inject: [ConfigService],
    }),
    RecordsModule,
    BatchesModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
