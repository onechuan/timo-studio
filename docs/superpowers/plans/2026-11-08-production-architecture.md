# Production Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Execute sequentially; no project commits.

**Goal:** Extract reusable production orchestration and durable run persistence from Worker without changing user flows.

**Architecture:** core owns sequencing and abstract ports; db owns atomic guarded state transitions; Worker composes agent, speech, renderer and settings snapshots. Existing API services remain unchanged.

**Tech Stack:** TypeScript, pnpm, Vitest, Prisma/PostgreSQL, BullMQ/Redis.

## Global Constraints

- Preserve HTTP, DB schema, Production/Job shape, approval/retry behavior and UI palette.
- core may depend only on contracts. No Prisma, Pi, BullMQ, Node filesystem or process.env in core.
- One configuration snapshot per task; no credentials in persisted records or public responses.
- Guard every run write by projectId + revision + jobId. Checkpoints/completion/failure atomically update document and Job.
- Existing dirty changes must be preserved. No commits, paid calls, private settings reads, destructive cleanup.

### Task 1: Reusable production runner and durable adapter

**Files:** Create core production ports/runner, db production-run adapter and focused runner/integration tests. Modify core/db exports, worker handler and if needed worker bootstrap.

**Interfaces:** Keep productionHandler(db, root, injectedModel?, runtimeEnv?) signature for existing integration consumers. Add createProductionRunner(store, createOperations, errorMessage) => async(jobId)=>void. ProductionRunStore owns load/start/checkpoint/complete/fail; ProductionOperations has plan/script/narrate/compose/render with (Production, AbortSignal) => Promise<Production>. Operations factory executes once inside protected try after starting task; env remains a Worker closure.

- [ ] Write failing tests using in-memory run store and operations. Assert plan stops at approval, produce skips script for existing scenes, export invokes only render, terminal/obsolete task invokes no external operations, factory failure releases job, checkpoint rejection prevents subsequent operations, safe errors never persist raw provider secrets.
- [ ] Run focused Vitest and observe missing functionality before implementation.
- [x] Implement runner state sequencing using existing stage messages/progress, 20 minute AbortSignal timeout, bounded 150 events. Preserve returned production checkpoints after each stage and terminal atomic release.
- [x] Implement Prisma run store with transaction and owner guards for start/checkpoint/complete/fail. Failure must not overwrite a newer owner or previously completed job; report stale owner without changing that record. Reuse existing repository/read helpers where appropriate; avoid duplicate obsolete transaction code in worker.
- [x] Reduce worker handler to composition: db run adapter + operations closure (settings snapshot, lazy model for plan/script, narrateFilm, composeFilm, renderFilm) + sanitized errors. Keep timeout/abort propagation and existing injectable model API.
- [x] Run focused tests, full unit suite, typecheck and real integration. Add actual DB tests for stale owner/terminal no-overwrite and atomic checkpoint progress.
- [x] Record exact test evidence and changed files in /tmp/timo-architecture-implementation-report.md. Do not commit.

### Task 2: Architecture documentation and delivery

**Files:** docs/architecture.md, docs/development.md, docs/verification.md, README.md and .archify artifact.

- [x] Document implemented boundaries, directory tree, runtime stages, settings/voice integration and known deferred features.
- [x] Produce architecture diagram referencing inspected working copy, explicitly distinguish it from committed baseline.
- [x] Review Task 1 implementation independently and resolve substantive issues.
- [x] Run build/typecheck/tests appropriate to final changes, diff check; publish local artifact links and concise summary.

## Execution record

Implementation and independent review completed. Initial extraction tests were written after implementation, so the two red-first checklist items above are intentionally not marked complete. Review-triggered load/failure-persistence regressions did run red (2 failures) then green. No user-project commits were created; source evidence was frozen only in an isolated local artifact snapshot.
