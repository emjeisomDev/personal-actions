import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/tests/integration/**/*.integration.spec.ts'],
        globalSetup: ['./src/tests/integration/setup.ts'],
        environment: 'node',
        globals: false,
        clearMocks: true,
        restoreMocks: true,
        testTimeout: 30_000,
        hookTimeout: 30_000,
        fileParallelism: false
    }
});