import { Injectable } from '@nestjs/common';
import { redisClient } from '../../config/redis.config';

@Injectable()
export class SessionService {
    async createSession(sessionId: string, data: any): Promise<void> {
        await redisClient.set(`sess:${sessionId}`, JSON.stringify(data));
    }

    async getSession(sessionId: string): Promise<any> {
        const data = await redisClient.get(`sess:${sessionId}`);
        return data ? JSON.parse(data) : null;
    }

    async updateSession(sessionId: string, data: any): Promise<void> {
        await this.createSession(sessionId, data);
    }

    async deleteSession(sessionId: string): Promise<void> {
        await redisClient.del(`sess:${sessionId}`);
    }

    async setSessionData(sessionId: string, key: string, value: any): Promise<void> {
        const session = await this.getSession(sessionId);
        if (session) {
            session[key] = value;
            await this.updateSession(sessionId, session);
        }
    }

    async getSessionData(sessionId: string, key: string): Promise<any> {
        const session = await this.getSession(sessionId);
        return session ? session[key] : null;
    }
} 