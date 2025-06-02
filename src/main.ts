import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from 'dotenv';

// Load environment variables
config();

async function bootstrap() {
  console.log('🚀 Starting Mortgage Data API...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('🔍 Env file check:');
  console.log('DATABASE_HOST exists:', !!process.env.DATABASE_HOST);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Enable CORS for frontend
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.CORS_ORIGIN || 'http://localhost:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    
    // Enable validation pipes with detailed error messages
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow extra properties but ignore them
      validationError: {
        target: false,
        value: false,
      },
    }));
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    console.log(`🚀 Backend server is running on: http://localhost:${port}`);
    console.log(`📊 Database: Connected to Railway PostgreSQL`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);
    console.log(`🔍 API Docs: http://localhost:${port}/api (if Swagger is enabled)`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();