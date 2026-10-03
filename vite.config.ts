import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    base: '/granada-historica/',
    define: {
      __ENABLE_INTERNAL_C1550__: JSON.stringify(env.VITE_ENABLE_INTERNAL_C1550 === 'true'),
    },
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }
})
