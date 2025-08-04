import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SatLog/',
  
  // Optimize bundle splitting for better memory usage
  build: {
    target: 'esnext',
    sourcemap: false, // Disable sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libs
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Chart libraries (lazy load)
          'charts': ['chart.js', 'react-chartjs-2'],
          
          // PDF generation (lazy load)
          'pdf-utils': ['jspdf'],
          
          // UI libraries
          'ui-libs': ['framer-motion', 'lucide-react'],
          
          // Search and data
          'data-libs': ['fuse.js'],
          
          // Supabase
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 500,
    
    // Reduce bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js'
    ],
    exclude: [
      'jspdf',
      'chart.js'
    ]
  },
  
  // Performance optimizations
  server: {
    fs: {
      strict: false
    }
  }
}) 