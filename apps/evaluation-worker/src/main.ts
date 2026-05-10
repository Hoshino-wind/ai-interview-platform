import { evaluationWorkerDataSource } from './data-source';
import { EvaluationWorkerApp } from './evaluation-worker';
import { workerConfig } from './config';

async function bootstrap(): Promise<void> {
  const app = new EvaluationWorkerApp(evaluationWorkerDataSource);
  await app.start();

  console.log(
    `[evaluation-worker] consuming queue ${workerConfig.queueName} with redis ${workerConfig.redis.host}:${workerConfig.redis.port} and sandbox ${workerConfig.sandboxRunnerUrl}`,
  );

  const shutdown = async () => {
    await app.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('[evaluation-worker] bootstrap failed', error);
  process.exit(1);
});
