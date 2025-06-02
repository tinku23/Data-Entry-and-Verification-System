"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function bootstrap() {
    console.log('🚀 Starting Mortgage Data API...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('🔍 Env file check:');
    console.log('DATABASE_HOST exists:', !!process.env.DATABASE_HOST);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
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
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
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
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map