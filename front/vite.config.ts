import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const ENVIRONMENT = process.env.ENVIRONMENT || '';
  return {
    plugins: [react()],
    define: {
      'process.env.ENVIRONMENT': JSON.stringify(ENVIRONMENT),
    },
  };
}); 