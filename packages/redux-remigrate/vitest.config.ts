import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    testTimeout: 10000,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    }
  }
});
