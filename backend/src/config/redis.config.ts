import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL ||  'redis://localhost:6379',
});

export const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'aug-sess:',
});

export const sessionConfig = {
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 10, // 10 minutes
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: false,
  },
};