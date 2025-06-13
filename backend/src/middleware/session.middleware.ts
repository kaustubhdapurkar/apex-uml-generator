import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as session from 'express-session';
import { sessionConfig } from '../config/redis.config';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
    private sessionMiddleware: ReturnType<typeof session>;

    constructor() {
        const secret = process.env.SESSION_SECRET;
        if (!secret) {
          throw new Error('Session secret is required. Please set SESSION_SECRET environment variable.');
        }

        const typedSessionConfig: session.SessionOptions = {
            ...sessionConfig,
            secret: secret
        };

        this.sessionMiddleware = session(typedSessionConfig);
    }

    use(req: Request, res: Response, next: () => void) {
        this.sessionMiddleware(req, res, next);
    }
}
