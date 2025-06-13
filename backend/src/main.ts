import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { redisClient } from './config/redis.config';

async function bootstrap() {
    // Ensure Redis is connected before starting the application
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        process.exit(1);
    }

    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    
    if (process.env.NODE_ENV !== 'production') {
        app.enableCors({
            origin: 'http://localhost:8080',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            credentials: true,
        });
    }
    
    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
