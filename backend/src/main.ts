import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { redisClient } from './config/redis.config';

async function bootstrap() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected');
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:8080', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], credentials: true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
