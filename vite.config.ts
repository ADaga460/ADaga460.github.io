import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the root of https://adaga460.github.io
export default defineConfig({
  plugins: [react()],
  base: '/',
});
