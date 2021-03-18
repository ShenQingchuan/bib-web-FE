import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import { resolve } from 'path';

function pathResolve(dir: string) {
  return resolve(__dirname, '.', dir);
}

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [vue(), vueJsx()],
  optimizeDeps: {
    include: [
      '@ant-design/icons-vue',
      'ant-design-vue',
      'ant-design-vue/lib/form/Form',
      'underscore',
      '@vueuse/core',
      'vuex',
      'vue-router',
      'jsonwebtoken',
    ]
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
