import { createServer } from 'http';
import { SandboxExecutionRequest } from '@ai-interview/shared-types';
import { sandboxRunnerConfig } from './config';
import { ExecutionService } from './execution-service';

const executionService = new ExecutionService();

function readJsonBody<T>(request: import('http').IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        resolve(JSON.parse(body) as T);
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (request.method === 'POST' && request.url === '/execute') {
    try {
      const payload = await readJsonBody<SandboxExecutionRequest>(request);
      const result = await executionService.execute(payload);
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify(result));
    } catch (error) {
      response.writeHead(400, { 'content-type': 'application/json' });
      response.end(
        JSON.stringify({
          message: error instanceof Error ? error.message : 'Invalid request payload',
        }),
      );
    }

    return;
  }

  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(sandboxRunnerConfig.port, sandboxRunnerConfig.host, () => {
  console.log(
    `[sandbox-runner] listening on http://${sandboxRunnerConfig.host}:${sandboxRunnerConfig.port}`,
  );
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
