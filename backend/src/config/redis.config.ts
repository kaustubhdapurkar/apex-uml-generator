import { createClient } from 'redis';
import { RedisClientType } from 'redis';
import { RedisStore } from 'connect-redis';

export const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        console.log('Redis Client Connected');
    } catch (error) {
        console.error('Redis Client Connection Error:', error);
        process.exit(1); // Exit if Redis connection fails
    }
})();

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
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' as const,
    },
};
