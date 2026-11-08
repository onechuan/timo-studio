import { bootstrap } from './bootstrap/index.js';
const { db, worker } = await bootstrap();
console.log('TimoTV worker ready');
for (const sig of ['SIGINT', 'SIGTERM'])
  process.on(sig, async () => {
    await worker.close();
    await db.$disconnect();
    process.exit(0);
  });
