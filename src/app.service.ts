import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    };
  }

  getAppInfo() {
    return {
      message: 'Mortgage Data API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        records: '/records',
        search: '/records/search',
        statistics: '/records/statistics'
      }
    };
  }
}
