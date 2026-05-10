export const workerConfig = {
  queueName: 'evaluation',
  sandboxRunnerUrl: process.env.SANDBOX_RUNNER_URL || 'http://127.0.0.1:3010',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  postgres: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ai_interview',
  },
};
