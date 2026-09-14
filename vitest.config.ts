import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.pure.test.ts'],
    exclude: ['**/node_modules/**'],
  },
});
