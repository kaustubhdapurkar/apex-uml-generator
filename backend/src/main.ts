import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
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
