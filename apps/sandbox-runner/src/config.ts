export const sandboxRunnerConfig = {
  port: parseInt(process.env.SANDBOX_RUNNER_PORT || '3010'),
  host: process.env.SANDBOX_RUNNER_HOST || '127.0.0.1',
};
