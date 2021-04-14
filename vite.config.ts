import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [vue(), vueJsx()],
  optimizeDeps: {
    include: [
      '@ant-design/icons-vue',
      'underscore',
      '@vueuse/core',
      'vuex',
      'vue-router',
      'jsonwebtoken'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname)
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1353c1',
          'link-color': '#1453c1'
        },
        javascriptEnabled: true
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9797/',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
