import { createClient } from 'redis';
import { RedisClientType } from 'redis';
import { RedisStore } from 'connect-redis';

export const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => {
    console.error('Redis Client Error:', err);
    // Don't exit on runtime errors, just log them
});

const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: 86400, // 24 hours in seconds
});

export const sessionConfig = {
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
    },
};
