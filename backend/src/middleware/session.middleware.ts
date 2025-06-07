import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as session from 'express-session';
import { sessionConfig } from '../config/redis.config';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
    private sessionMiddleware: ReturnType<typeof session>;

    constructor() {
        if (!process.env.SESSION_SECRET) {
            throw new Error('Session secret is required. Please set SESSION_SECRET environment variable.');
        }

        const typedSessionConfig: session.SessionOptions = {
            ...sessionConfig,
            secret: process.env.SESSION_SECRET
        };

        this.sessionMiddleware = session(typedSessionConfig);
    }

    use(req: Request, res: Response, next: NextFunction) {
        this.sessionMiddleware(req, res, next);
    }
}