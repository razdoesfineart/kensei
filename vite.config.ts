import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },
  resolve: {
    alias: {
      'react': 'https://esm.sh/react@19.2.4',
      'react-dom': 'https://esm.sh/react-dom@19.2.4'
    }
  }
});
