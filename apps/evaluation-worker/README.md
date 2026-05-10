# Evaluation Worker

This workspace runs the standalone evaluation queue consumer.

Current responsibilities:
- consume the `evaluation` Bull queue
- update `evaluation_jobs` status
- call `sandbox-runner` and write `evaluation_results`
- move `interview_sessions` into `reviewing` or `evaluation_failed`

Run locally:
- `pnpm --filter @ai-interview/sandbox-runner dev`
- `pnpm --filter @ai-interview/evaluation-worker dev`
- `pnpm --filter @ai-interview/evaluation-worker build && pnpm --filter @ai-interview/evaluation-worker start`
