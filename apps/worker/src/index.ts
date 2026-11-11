import { bootstrap } from './bootstrap/index.js';
const { db, worker, films } = await bootstrap();
console.log('TimoTV worker ready');
for (const sig of ['SIGINT', 'SIGTERM'])
  process.on(sig, async () => {
    await Promise.all([worker.close(), films.close()]);
    await db.$disconnect();
    process.exit(0);
  });
