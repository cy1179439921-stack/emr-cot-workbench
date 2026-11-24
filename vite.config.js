import { defineConfig } from 'vite'
import * as path from 'path'
import vue from '@vitejs/plugin-vue'
// import { manualChunksPlugin } from 'vite-plugin-webpackchunkname'
import eslintPlugin from 'vite-plugin-eslint'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import versionUpdatePlugin from './plugin/versionUpdatePlugin'
import pxtorem from 'postcss-pxtorem'
const pathSrc = path.resolve(__dirname, 'src')
const pythonDomain = 'http://10.31.0.130:8366' // / CI测试服
// const pythonDomain = 'http://10.31.0.130:8342' // / CI测试服
const minioDomain = 'http://192.168.43.162:9000/' // minio域名
const now = new Date().getTime()
export default defineConfig({
  define: {
    // 定义全局变量
    __APP_VERSION__: now,
    __APP_DOMAIN__: JSON.stringify(pythonDomain)
  },
  plugins: [
    vue(),
    // manualChunksPlugin(),
    eslintPlugin({
      include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue']
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(pathSrc, 'assets/svg/')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]'
    }),
    versionUpdatePlugin({
      version: now
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true,
    // 忽略构建产物与截图目录，避免每次构建/截图都触发整页 reload
    watch: {
      ignored: ['**/dist*/**', '**/.screenshots/**', '**/node_modules/**']
    },
    proxy: {
      '/api': {
        target: `${pythonDomain}/api`,
        changeOrigin: true,
        // 后端不可达时快速失败（默认要等 30s+，会把页面拖得很卡）
        timeout: 5000,
        proxyTimeout: 5000,
        // eslint-disable-next-line no-shadow
        rewrite: (path) => path.replace('/api', '')
      },
      '/minio': {
        target: `${minioDomain}`,
        changeOrigin: true,
        timeout: 5000,
        proxyTimeout: 5000,
        rewrite: (path) => path.replace('/minio', '')
      }
      // '/v1': {
      //   target: `${pythonDomain}/api`,
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace('/v1', '')
      // }
    }
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: { // 将公共资源拆包
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          lodash: ['lodash'],
          echarts: ['echarts'],
          axios: ['axios'],
          elementPlus: ['element-plus'],
          pinia: ['pinia'],
          router: ['vue-router'],
          cryptoJs: ['crypto-js'],
          dayjs: ['dayjs'],
          fileSaver: ['file-saver'],
          html2canvas: ['html2canvas'],
          jquery: ['jquery'],
          jsFileDownload: ['js-file-download'],
          jspdf: ['jspdf'],
          mathjs: ['mathjs'],
          mitt: ['mitt'],
          plotly: ['plotly.js-dist'],
          qs: ['qs'],
          relationGraph: ['relation-graph'],
          vueCropper: ['vue-cropper'],
          vueDraggableNext: ['vue-draggable-next'],
          vuePdfEmbed: ['vue-pdf-embed'],
          vueWordHighlighter: ['vue-word-highlighter'],
          vueJsonEditor: ['vue3-json-editor'],
          vuedraggable: ['vuedraggable'],
          xlsx: ['xlsx']
        }
      }
    }
  },
  css: {
    devSourcemap: true, // 开启 CSS source maps
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
        additionalData: '@use "@/style/global/mixins.scss" as *;'
      }
    },
    postcss: {
      plugins: [
        pxtorem({
          rootValue: 14, // 根字体大小，1rem = 16px
          propList: ['*'], // 需要转换的属性，这里选择转换所有属性
          selectorBlackList: ['van'], // 忽略转换正则匹配到的选择器，例如Vant Weapp组件类名不转换
          minPixelValue: 2 // 最小转换像素值，小于这个值的像素值不转换
        })
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, 'src/components')
      // jspdf: path.resolve(__dirname, './node_modules/jspdf/dist/jspdf.es.js') // 如果遇到莫名的jspdf报错或CI报错指向了jspdf，可以尝试使用未压缩的版本
    }
  }
})
