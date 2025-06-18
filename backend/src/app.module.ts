import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SessionMiddleware } from './middleware/session.middleware';
import { MetadataController } from './modules/metadata/metadata.controller';
import { MetadataService } from './modules/metadata/metadata.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
    ],
    controllers: [AppController, MetadataController],
    providers: [AppService, MetadataService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SessionMiddleware).forRoutes('*');
    }
}
