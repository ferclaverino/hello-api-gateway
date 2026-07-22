# Upgrade Kafka Library: kafkajs → @confluentinc/kafka-javascript

## Goal

Replace the unmaintained `kafkajs@2.2.4` with Confluent's officially maintained
`@confluentinc/kafka-javascript@1.10.0` to fix the Node 24
`TimeoutNegativeWarning` and the `group coordinator is not available` startup
error, without carrying a dependency patch.

## Context

- `kafkajs` last released Feb 2023, unmaintained since Aug 2024.
- The timeout fix was merged to the kafkajs repo (Dec 2025) but never published
  to npm — there is no `2.2.5`.
- `@confluentinc/kafka-javascript` is Confluent's official client (GA Dec 2024),
  backed by librdkafka, and ships a KafkaJS-compatible API under its `.KafkaJS`
  namespace with a migration guide.
- Pre-built musl binaries exist for Alpine 3.20+ on Node 18–24, so no C/C++
  toolchain is required in the Docker image.

## Prerequisites

- Docker daemon running.
- No uncommitted changes (the migration touches the lockfile and several source
  files). Start from a clean working tree.
- Confirm current state before starting:

  ```bash
  git status --short
  ```

  If the previous pnpm patch is still present, it will be removed as part of
  this migration.

---

## Step 1 — Swap the dependency

In `heavy-service/package.json`, replace:

```diff
- "kafkajs": "^2.2.4",
+ "@confluentinc/kafka-javascript": "^1.10.0",
```

## Step 2 — Remove the kafkajs patch

The patch added in the previous fix is no longer needed.

- Delete `heavy-service/patches/kafkajs@2.2.4.patch` (remove the `patches/`
  directory if it becomes empty).
- In `heavy-service/pnpm-workspace.yaml`, delete the `patchedDependencies`
  block:

  ```diff
  allowBuilds:
    esbuild: true
  -
  -patchedDependencies:
  -  kafkajs@2.2.4: patches/kafkajs@2.2.4.patch
  ```

## Step 3 — Update the Dockerfile

In `heavy-service/Dockerfile.dev`, remove the patch copy line added previously:

```diff
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
- COPY patches ./patches
  RUN pnpm install --frozen-lockfile
  COPY . .
```

If `pnpm install` fails to fetch the pre-built musl binary inside the image (a
known `node-pre-gyp` quirk with pnpm's symlinked layout — see
confluentinc/confluent-kafka-javascript#48), add before the install:

```dockerfile
RUN rm -rf node_modules/@confluentinc
```

Try without it first; only add if the build segfaults or the binary is wrong.

## Step 4 — Reinstall dependencies

```bash
cd heavy-service
pnpm install
```

This regenerates `pnpm-lock.yaml`: removes `kafkajs`, adds
`@confluentinc/kafka-javascript` and its native binary.

If pnpm prompts about build scripts for the native module, allow it
(`@confluentinc/kafka-javascript` runs a `node-pre-gyp` postinstall to fetch
the pre-built binary). With pnpm 11 this is governed by `allowBuilds` in
`pnpm-workspace.yaml`; add the package there if needed:

```yaml
allowBuilds:
  esbuild: true
  "@confluentinc/kafka-javascript": true
```

## Step 5 — Update source imports

The Confluent client exposes the KafkaJS-compatible API via the `.KafkaJS`
named export. There are 6 files importing from `kafkajs`.

### 5.1 `src/infrastructure/kafka/kafka-client.ts` (main change)

```diff
-import {
-  Kafka,
-  logLevel,
-  type Admin,
-  type Producer,
-  type Consumer,
-} from "kafkajs";
+import { KafkaJS } from "@confluentinc/kafka-javascript";
+import type { Kafka, Admin, Producer, Consumer } from "@confluentinc/kafka-javascript";
```

> **Note:** Verify the exact TypeScript import shape against the shipped
> `types/index.d.ts`. The runtime export is `require("@confluentinc/kafka-javascript").KafkaJS`,
> so ESM is `import { KafkaJS } from "@confluentinc/kafka-javascript"` and then
> destructure `const { Kafka, logLevel } = KafkaJS;`. Types may be exported
> directly from the package root. Check `pnpm build` output and adjust.

Wrap all config in a `kafkaJS` block:

```diff
 export function createKafka(): Kafka {
-  return new Kafka({
-    clientId: config.KAFKA_CLIENT_ID,
-    brokers: kafkaBrokers,
-    logLevel: logLevel.WARN,
-  });
+  return new KafkaJS.Kafka({
+    kafkaJS: {
+      clientId: config.KAFKA_CLIENT_ID,
+      brokers: kafkaBrokers,
+      logLevel: KafkaJS.logLevel.WARN,
+    },
+  });
 }
```

Producer and consumer creation:

```diff
- this.producer = this.kafka.producer({ allowAutoTopicCreation: false });
+ this.producer = this.kafka.producer({ kafkaJS: { allowAutoTopicCreation: false } });
```

```diff
- this.consumer = this.kafka.consumer({
-  groupId: config.GROUP_ID,
-  allowAutoTopicCreation: false,
-});
+ this.consumer = this.kafka.consumer({
+  kafkaJS: {
+    groupId: config.GROUP_ID,
+    allowAutoTopicCreation: false,
+  },
+});
```

`createTopicsIfMissing`, `admin.listTopics()`, `admin.createTopics()`,
`admin.fetchTopicMetadata()`, `admin.fetchTopicOffsets()` are all supported by
the Confluent admin client and need no changes.

### 5.2 `src/infrastructure/kafka/kafka-event-bus.ts`

```diff
-import { Producer } from "kafkajs";
+import type { Producer } from "@confluentinc/kafka-javascript";
```

### 5.3 `src/infrastructure/kafka/kafka-topic-stats.ts`

```diff
-import type { Admin, PartitionMetadata } from "kafkajs";
+import type { Admin, PartitionMetadata } from "@confluentinc/kafka-javascript";
```

### 5.4 `src/infrastructure/kafka/job-worker.ts`

```diff
-import type { Consumer } from "kafkajs";
+import type { Consumer } from "@confluentinc/kafka-javascript";
```

`fromBeginning` must move from `subscribe` to the consumer constructor. Since
the current value is `false` (the default), it can simply be removed:

```diff
- await consumer.subscribe({
-   topic: getTopicName(JobCreatedEvent.name),
-   fromBeginning: false,
- });
+ await consumer.subscribe({
+   topic: getTopicName(JobCreatedEvent.name),
+ });
```

### 5.5 `src/adapters/kafka/event.mapper.ts`

```diff
-import { ProducerRecord } from "kafkajs";
+import type { ProducerRecord } from "@confluentinc/kafka-javascript";
```

### 5.6 `src/infrastructure/fastify/register-status-route.ts`

```diff
-import { Admin } from "kafkajs";
+import type { Admin } from "@confluentinc/kafka-javascript";
```

## Step 6 — Build

```bash
cd heavy-service
pnpm build
```

Fix any TypeScript errors. The most likely issues are:

- **Import shape** — if `KafkaJS` is not a named export, adjust to whatever
  `types/index.d.ts` exposes (e.g. `import { Kafka } from "@confluentinc/kafka-javascript"`).
- **Type compatibility** — `PartitionMetadata` field names may differ slightly.
  Check the error and adapt the mapping in `kafka-topic-stats.ts`.

## Step 7 — Rebuild Docker images

```bash
docker compose build heavy-service heavy-worker-1
```

Watch for:
- `node-pre-gyp` downloading `confluent-kafka-javascript-v1.10.0-node-vXXX-linux-musl-x64.tar.gz`.
- Any segfault or binary-mismatch warnings.

## Step 8 — Clean cold start

```bash
docker compose down
docker compose up -d --build
```

## Step 9 — Verify

```bash
# Worker should show no timeout warning and no coordinator error
sleep 8
docker compose logs --since 2m heavy-worker-1
```

Expected output (clean):

```
heavy-worker-1-1  | $ tsx --watch src/infrastructure/terminal/worker.ts
heavy-worker-1-1  | Starting heavy-worker id=worker-1 group=heavy-workers
heavy-worker-1-1  | Kafka connected
heavy-worker-1-1  | Redis connected
heavy-worker-1-1  | heavy-worker worker-1 ready
```

```bash
# Admin client (uses fetchTopicMetadata + fetchTopicOffsets)
curl -s http://127.0.0.1:3010/status | jq

# End-to-end: gateway → heavy-service → Kafka → worker → Redis
curl -s http://127.0.0.1:3000/hello
```

## Step 10 — Commit

```bash
git add -A
git status
git diff --cached --stat
git commit
```

Suggested message:

```
Migrate from kafkajs to @confluentinc/kafka-javascript

Replaces the unmaintained kafkajs@2.2.4 with Confluent's official
client. Fixes the Node 24 TimeoutNegativeWarning and the Kafka group
coordinator startup error without carrying a dependency patch.

- Swap dependency in package.json, regenerate lockfile
- Remove the kafkajs pnpm patch and patches/ directory
- Update 6 source files to import from @confluentinc/kafka-javascript
- Wrap Kafka/producer/consumer config in the kafkaJS compat block
- Move fromBeginning from subscribe() to consumer config (removed, was default)
- Update Dockerfile.dev (remove patch copy)
```

---

## Rollback

If the migration fails and you need to restore the previous (patched) state:

```bash
git restore .
git clean -fd heavy-service/patches
```

Or, if already committed:

```bash
git revert <commit-sha>
```

---

## Files touched

| File | Change |
|---|---|
| `heavy-service/package.json` | Replace `kafkajs` with `@confluentinc/kafka-javascript` |
| `heavy-service/pnpm-workspace.yaml` | Remove `patchedDependencies` |
| `heavy-service/pnpm-lock.yaml` | Regenerated by `pnpm install` |
| `heavy-service/patches/kafkajs@2.2.4.patch` | Deleted |
| `heavy-service/Dockerfile.dev` | Remove `COPY patches` line |
| `heavy-service/src/infrastructure/kafka/kafka-client.ts` | New imports, `kafkaJS` config blocks |
| `heavy-service/src/infrastructure/kafka/kafka-event-bus.ts` | Update type import |
| `heavy-service/src/infrastructure/kafka/kafka-topic-stats.ts` | Update type imports |
| `heavy-service/src/infrastructure/kafka/job-worker.ts` | Update type import, remove `fromBeginning` |
| `heavy-service/src/adapters/kafka/event.mapper.ts` | Update type import |
| `heavy-service/src/infrastructure/fastify/register-status-route.ts` | Update type import |

## Known risks

1. **TypeScript import shape** — The exact ESM import for the `.KafkaJS`
   namespace needs verification against the shipped types. Check
   `node_modules/@confluentinc/kafka-javascript/types/index.d.ts` after install.

2. **pnpm + node-pre-gyp** — pnpm's symlinked layout can confuse the pre-built
   binary fetch. If `pnpm install` or the Docker build produces a segfault,
   add `rm -rf node_modules/@confluentinc` before install (see Step 3).

3. **`linger.ms` default** — The Confluent client batches sends with a default
   `linger.ms`. `KafkaEventBus.publish` is fire-and-forget (no await). This is
   fine because `producer.disconnect()` flushes. If messages appear delayed,
   set `"linger.ms": 0` in the producer's outer config.

4. **`stop()` unsupported** — The Confluent consumer does not support `stop()`.
   The current code only calls `disconnect()`, so this is not an issue.
