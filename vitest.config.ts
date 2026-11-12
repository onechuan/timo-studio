import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include:
      process.env.RUN_INTEGRATION === '1'
        ? ['tests/integration/**/*.test.ts']
        : ['tests/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
});
