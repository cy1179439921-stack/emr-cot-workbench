// vite.config.js
import { defineConfig } from "file:///Library/COT%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E9%A1%B9%E7%9B%AE%E5%BC%80%E5%8F%91%E4%BB%A3%E7%A0%81/emr-cot-4-dev-xyw/node_modules/.pnpm/vite@5.4.21_@types+node@25.9.1_sass@1.99.0_sugarss@2.0.0/node_modules/vite/dist/node/index.js";
import * as path2 from "path";
import vue from "file:///Library/COT%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E9%A1%B9%E7%9B%AE%E5%BC%80%E5%8F%91%E4%BB%A3%E7%A0%81/emr-cot-4-dev-xyw/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@5.4.21_@types+node@25.9.1_sass@1.99.0_sugarss@2.0.0__vue@3.5.34/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import eslintPlugin from "file:///Library/COT%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E9%A1%B9%E7%9B%AE%E5%BC%80%E5%8F%91%E4%BB%A3%E7%A0%81/emr-cot-4-dev-xyw/node_modules/.pnpm/vite-plugin-eslint@1.8.1_eslint@8.57.1_vite@5.4.21_@types+node@25.9.1_sass@1.99.0_sugarss@2.0.0_/node_modules/vite-plugin-eslint/dist/index.mjs";
import { createSvgIconsPlugin } from "file:///Library/COT%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E9%A1%B9%E7%9B%AE%E5%BC%80%E5%8F%91%E4%BB%A3%E7%A0%81/emr-cot-4-dev-xyw/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.4.21_@types+node@25.9.1_sass@1.99.0_sugarss@2.0.0_/node_modules/vite-plugin-svg-icons/dist/index.mjs";

// plugin/versionUpdatePlugin.js
import fs from "fs";
import path from "path";
var writeVersion = (versionFile, content) => {
  fs.writeFile(versionFile, content, (err) => {
    if (err) throw err;
  });
};
var versionUpdatePlugin_default = (options) => {
  let config;
  return {
    name: "version-update",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    buildStart() {
      if (config.command !== "build") return;
      const file = config.publicDir + path.sep + "version.json";
      const content = JSON.stringify({ version: options.version }, null, 2);
      if (fs.existsSync(config.publicDir)) {
        writeVersion(file, content);
      } else {
        fs.mkdir(config.publicDir, (err) => {
          if (err) throw err;
          writeVersion(file, content);
        });
      }
    }
  };
};

// vite.config.js
import pxtorem from "file:///Library/COT%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83%E9%A1%B9%E7%9B%AE%E5%BC%80%E5%8F%91%E4%BB%A3%E7%A0%81/emr-cot-4-dev-xyw/node_modules/.pnpm/postcss-pxtorem@6.1.0_postcss@8.5.15/node_modules/postcss-pxtorem/index.js";
var __vite_injected_original_dirname = "/Library/COT\u6D4B\u8BD5\u73AF\u5883\u9879\u76EE\u5F00\u53D1\u4EE3\u7801/emr-cot-4-dev-xyw";
var pathSrc = path2.resolve(__vite_injected_original_dirname, "src");
var pythonDomain = "http://10.31.0.130:8366";
var minioDomain = "http://192.168.43.162:9000/";
var now = (/* @__PURE__ */ new Date()).getTime();
var vite_config_default = defineConfig({
  define: {
    // 定义全局变量
    __APP_VERSION__: now,
    __APP_DOMAIN__: JSON.stringify(pythonDomain)
  },
  plugins: [
    vue(),
    // manualChunksPlugin(),
    eslintPlugin({
      include: ["src/**/*.js", "src/**/*.vue", "src/*.js", "src/*.vue"]
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path2.resolve(pathSrc, "assets/svg/")],
      // 指定symbolId格式
      symbolId: "icon-[dir]-[name]"
    }),
    versionUpdatePlugin_default({
      version: now
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: `${pythonDomain}/api`,
        changeOrigin: true,
        // eslint-disable-next-line no-shadow
        rewrite: (path3) => path3.replace("/api", "")
      },
      "/minio": {
        target: `${minioDomain}`,
        changeOrigin: true,
        rewrite: (path3) => path3.replace("/minio", "")
      }
      // '/v1': {
      //   target: `${pythonDomain}/api`,
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace('/v1', '')
      // }
    }
  },
  esbuild: {
    drop: ["console", "debugger"]
  },
  build: {
    // 将公共资源拆包
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue"],
          lodash: ["lodash"],
          echarts: ["echarts"],
          axios: ["axios"],
          elementPlus: ["element-plus"],
          pinia: ["pinia"],
          router: ["vue-router"],
          cryptoJs: ["crypto-js"],
          dayjs: ["dayjs"],
          fileSaver: ["file-saver"],
          html2canvas: ["html2canvas"],
          jquery: ["jquery"],
          jsFileDownload: ["js-file-download"],
          jspdf: ["jspdf"],
          mathjs: ["mathjs"],
          mitt: ["mitt"],
          plotly: ["plotly.js-dist"],
          qs: ["qs"],
          relationGraph: ["relation-graph"],
          vueCropper: ["vue-cropper"],
          vueDraggableNext: ["vue-draggable-next"],
          vuePdfEmbed: ["vue-pdf-embed"],
          vueWordHighlighter: ["vue-word-highlighter"],
          vueJsonEditor: ["vue3-json-editor"],
          vuedraggable: ["vuedraggable"],
          xlsx: ["xlsx"]
        }
      }
    }
  },
  css: {
    devSourcemap: true,
    // 开启 CSS source maps
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
        additionalData: '@use "@/style/global/mixins.scss" as *;'
      }
    },
    postcss: {
      plugins: [
        pxtorem({
          rootValue: 14,
          // 根字体大小，1rem = 16px
          propList: ["*"],
          // 需要转换的属性，这里选择转换所有属性
          selectorBlackList: ["van"],
          // 忽略转换正则匹配到的选择器，例如Vant Weapp组件类名不转换
          minPixelValue: 2
          // 最小转换像素值，小于这个值的像素值不转换
        })
      ]
    }
  },
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname, "./src"),
      components: path2.resolve(__vite_injected_original_dirname, "src/components")
      // jspdf: path.resolve(__dirname, './node_modules/jspdf/dist/jspdf.es.js') // 如果遇到莫名的jspdf报错或CI报错指向了jspdf，可以尝试使用未压缩的版本
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2luL3ZlcnNpb25VcGRhdGVQbHVnaW4uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvTGlicmFyeS9DT1RcdTZENEJcdThCRDVcdTczQUZcdTU4ODNcdTk4NzlcdTc2RUVcdTVGMDBcdTUzRDFcdTRFRTNcdTc4MDEvZW1yLWNvdC00LWRldi14eXdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9MaWJyYXJ5L0NPVFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1OTg3OVx1NzZFRVx1NUYwMFx1NTNEMVx1NEVFM1x1NzgwMS9lbXItY290LTQtZGV2LXh5dy92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vTGlicmFyeS9DT1QlRTYlQjUlOEIlRTglQUYlOTUlRTclOEUlQUYlRTUlQTIlODMlRTklQTElQjklRTclOUIlQUUlRTUlQkMlODAlRTUlOEYlOTElRTQlQkIlQTMlRTclQTAlODEvZW1yLWNvdC00LWRldi14eXcvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG4vLyBpbXBvcnQgeyBtYW51YWxDaHVua3NQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi13ZWJwYWNrY2h1bmtuYW1lJ1xuaW1wb3J0IGVzbGludFBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1lc2xpbnQnXG5pbXBvcnQgeyBjcmVhdGVTdmdJY29uc1BsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucydcbmltcG9ydCB2ZXJzaW9uVXBkYXRlUGx1Z2luIGZyb20gJy4vcGx1Z2luL3ZlcnNpb25VcGRhdGVQbHVnaW4nXG5pbXBvcnQgcHh0b3JlbSBmcm9tICdwb3N0Y3NzLXB4dG9yZW0nXG5jb25zdCBwYXRoU3JjID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpXG5jb25zdCBweXRob25Eb21haW4gPSAnaHR0cDovLzEwLjMxLjAuMTMwOjgzNjYnIC8vIC8gQ0lcdTZENEJcdThCRDVcdTY3MERcbi8vIGNvbnN0IHB5dGhvbkRvbWFpbiA9ICdodHRwOi8vMTAuMzEuMC4xMzA6ODM0MicgLy8gLyBDSVx1NkQ0Qlx1OEJENVx1NjcwRFxuY29uc3QgbWluaW9Eb21haW4gPSAnaHR0cDovLzE5Mi4xNjguNDMuMTYyOjkwMDAvJyAvLyBtaW5pb1x1NTdERlx1NTQwRFxuY29uc3Qgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGRlZmluZToge1xuICAgIC8vIFx1NUI5QVx1NEU0OVx1NTE2OFx1NUM0MFx1NTNEOFx1OTFDRlxuICAgIF9fQVBQX1ZFUlNJT05fXzogbm93LFxuICAgIF9fQVBQX0RPTUFJTl9fOiBKU09OLnN0cmluZ2lmeShweXRob25Eb21haW4pXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICAvLyBtYW51YWxDaHVua3NQbHVnaW4oKSxcbiAgICBlc2xpbnRQbHVnaW4oe1xuICAgICAgaW5jbHVkZTogWydzcmMvKiovKi5qcycsICdzcmMvKiovKi52dWUnLCAnc3JjLyouanMnLCAnc3JjLyoudnVlJ11cbiAgICB9KSxcbiAgICBjcmVhdGVTdmdJY29uc1BsdWdpbih7XG4gICAgICAvLyBcdTYzMDdcdTVCOUFcdTk3MDBcdTg5ODFcdTdGMTNcdTVCNThcdTc2ODRcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTU5MzlcbiAgICAgIGljb25EaXJzOiBbcGF0aC5yZXNvbHZlKHBhdGhTcmMsICdhc3NldHMvc3ZnLycpXSxcbiAgICAgIC8vIFx1NjMwN1x1NUI5QXN5bWJvbElkXHU2ODNDXHU1RjBGXG4gICAgICBzeW1ib2xJZDogJ2ljb24tW2Rpcl0tW25hbWVdJ1xuICAgIH0pLFxuICAgIHZlcnNpb25VcGRhdGVQbHVnaW4oe1xuICAgICAgdmVyc2lvbjogbm93XG4gICAgfSlcbiAgXSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogYCR7cHl0aG9uRG9tYWlufS9hcGlgLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgnL2FwaScsICcnKVxuICAgICAgfSxcbiAgICAgICcvbWluaW8nOiB7XG4gICAgICAgIHRhcmdldDogYCR7bWluaW9Eb21haW59YCxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKCcvbWluaW8nLCAnJylcbiAgICAgIH1cbiAgICAgIC8vICcvdjEnOiB7XG4gICAgICAvLyAgIHRhcmdldDogYCR7cHl0aG9uRG9tYWlufS9hcGlgLFxuICAgICAgLy8gICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAvLyAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoJy92MScsICcnKVxuICAgICAgLy8gfVxuICAgIH1cbiAgfSxcbiAgZXNidWlsZDoge1xuICAgIGRyb3A6IFsnY29uc29sZScsICdkZWJ1Z2dlciddXG4gIH0sXG4gIGJ1aWxkOiB7IC8vIFx1NUMwNlx1NTE2Q1x1NTE3MVx1OEQ0NFx1NkU5MFx1NjJDNlx1NTMwNVxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB2dWU6IFsndnVlJ10sXG4gICAgICAgICAgbG9kYXNoOiBbJ2xvZGFzaCddLFxuICAgICAgICAgIGVjaGFydHM6IFsnZWNoYXJ0cyddLFxuICAgICAgICAgIGF4aW9zOiBbJ2F4aW9zJ10sXG4gICAgICAgICAgZWxlbWVudFBsdXM6IFsnZWxlbWVudC1wbHVzJ10sXG4gICAgICAgICAgcGluaWE6IFsncGluaWEnXSxcbiAgICAgICAgICByb3V0ZXI6IFsndnVlLXJvdXRlciddLFxuICAgICAgICAgIGNyeXB0b0pzOiBbJ2NyeXB0by1qcyddLFxuICAgICAgICAgIGRheWpzOiBbJ2RheWpzJ10sXG4gICAgICAgICAgZmlsZVNhdmVyOiBbJ2ZpbGUtc2F2ZXInXSxcbiAgICAgICAgICBodG1sMmNhbnZhczogWydodG1sMmNhbnZhcyddLFxuICAgICAgICAgIGpxdWVyeTogWydqcXVlcnknXSxcbiAgICAgICAgICBqc0ZpbGVEb3dubG9hZDogWydqcy1maWxlLWRvd25sb2FkJ10sXG4gICAgICAgICAganNwZGY6IFsnanNwZGYnXSxcbiAgICAgICAgICBtYXRoanM6IFsnbWF0aGpzJ10sXG4gICAgICAgICAgbWl0dDogWydtaXR0J10sXG4gICAgICAgICAgcGxvdGx5OiBbJ3Bsb3RseS5qcy1kaXN0J10sXG4gICAgICAgICAgcXM6IFsncXMnXSxcbiAgICAgICAgICByZWxhdGlvbkdyYXBoOiBbJ3JlbGF0aW9uLWdyYXBoJ10sXG4gICAgICAgICAgdnVlQ3JvcHBlcjogWyd2dWUtY3JvcHBlciddLFxuICAgICAgICAgIHZ1ZURyYWdnYWJsZU5leHQ6IFsndnVlLWRyYWdnYWJsZS1uZXh0J10sXG4gICAgICAgICAgdnVlUGRmRW1iZWQ6IFsndnVlLXBkZi1lbWJlZCddLFxuICAgICAgICAgIHZ1ZVdvcmRIaWdobGlnaHRlcjogWyd2dWUtd29yZC1oaWdobGlnaHRlciddLFxuICAgICAgICAgIHZ1ZUpzb25FZGl0b3I6IFsndnVlMy1qc29uLWVkaXRvciddLFxuICAgICAgICAgIHZ1ZWRyYWdnYWJsZTogWyd2dWVkcmFnZ2FibGUnXSxcbiAgICAgICAgICB4bHN4OiBbJ3hsc3gnXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBjc3M6IHtcbiAgICBkZXZTb3VyY2VtYXA6IHRydWUsIC8vIFx1NUYwMFx1NTQyRiBDU1Mgc291cmNlIG1hcHNcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnbGVnYWN5LWpzLWFwaSddLFxuICAgICAgICBhZGRpdGlvbmFsRGF0YTogJ0B1c2UgXCJAL3N0eWxlL2dsb2JhbC9taXhpbnMuc2Nzc1wiIGFzICo7J1xuICAgICAgfVxuICAgIH0sXG4gICAgcG9zdGNzczoge1xuICAgICAgcGx1Z2luczogW1xuICAgICAgICBweHRvcmVtKHtcbiAgICAgICAgICByb290VmFsdWU6IDE0LCAvLyBcdTY4MzlcdTVCNTdcdTRGNTNcdTU5MjdcdTVDMEZcdUZGMEMxcmVtID0gMTZweFxuICAgICAgICAgIHByb3BMaXN0OiBbJyonXSwgLy8gXHU5NzAwXHU4OTgxXHU4RjZDXHU2MzYyXHU3Njg0XHU1QzVFXHU2MDI3XHVGRjBDXHU4RkQ5XHU5MUNDXHU5MDA5XHU2MkU5XHU4RjZDXHU2MzYyXHU2MjQwXHU2NzA5XHU1QzVFXHU2MDI3XG4gICAgICAgICAgc2VsZWN0b3JCbGFja0xpc3Q6IFsndmFuJ10sIC8vIFx1NUZGRFx1NzU2NVx1OEY2Q1x1NjM2Mlx1NkI2M1x1NTIxOVx1NTMzOVx1OTE0RFx1NTIzMFx1NzY4NFx1OTAwOVx1NjJFOVx1NTY2OFx1RkYwQ1x1NEY4Qlx1NTk4MlZhbnQgV2VhcHBcdTdFQzRcdTRFRjZcdTdDN0JcdTU0MERcdTRFMERcdThGNkNcdTYzNjJcbiAgICAgICAgICBtaW5QaXhlbFZhbHVlOiAyIC8vIFx1NjcwMFx1NUMwRlx1OEY2Q1x1NjM2Mlx1NTBDRlx1N0QyMFx1NTAzQ1x1RkYwQ1x1NUMwRlx1NEU4RVx1OEZEOVx1NEUyQVx1NTAzQ1x1NzY4NFx1NTBDRlx1N0QyMFx1NTAzQ1x1NEUwRFx1OEY2Q1x1NjM2MlxuICAgICAgICB9KVxuICAgICAgXVxuICAgIH1cbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgY29tcG9uZW50czogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzJylcbiAgICAgIC8vIGpzcGRmOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9ub2RlX21vZHVsZXMvanNwZGYvZGlzdC9qc3BkZi5lcy5qcycpIC8vIFx1NTk4Mlx1Njc5Q1x1OTA0N1x1NTIzMFx1ODNBQlx1NTQwRFx1NzY4NGpzcGRmXHU2MkE1XHU5NTE5XHU2MjE2Q0lcdTYyQTVcdTk1MTlcdTYzMDdcdTU0MTFcdTRFODZqc3BkZlx1RkYwQ1x1NTNFRlx1NEVFNVx1NUMxRFx1OEJENVx1NEY3Rlx1NzUyOFx1NjcyQVx1NTM4Qlx1N0YyOVx1NzY4NFx1NzI0OFx1NjcyQ1xuICAgIH1cbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL0xpYnJhcnkvQ09UXHU2RDRCXHU4QkQ1XHU3M0FGXHU1ODgzXHU5ODc5XHU3NkVFXHU1RjAwXHU1M0QxXHU0RUUzXHU3ODAxL2Vtci1jb3QtNC1kZXYteHl3L3BsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL0xpYnJhcnkvQ09UXHU2RDRCXHU4QkQ1XHU3M0FGXHU1ODgzXHU5ODc5XHU3NkVFXHU1RjAwXHU1M0QxXHU0RUUzXHU3ODAxL2Vtci1jb3QtNC1kZXYteHl3L3BsdWdpbi92ZXJzaW9uVXBkYXRlUGx1Z2luLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9MaWJyYXJ5L0NPVCVFNiVCNSU4QiVFOCVBRiU5NSVFNyU4RSVBRiVFNSVBMiU4MyVFOSVBMSVCOSVFNyU5QiVBRSVFNSVCQyU4MCVFNSU4RiU5MSVFNCVCQiVBMyVFNyVBMCU4MS9lbXItY290LTQtZGV2LXh5dy9wbHVnaW4vdmVyc2lvblVwZGF0ZVBsdWdpbi5qc1wiO2ltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5jb25zdCB3cml0ZVZlcnNpb24gPSAodmVyc2lvbkZpbGUsIGNvbnRlbnQpID0+IHtcbiAgLy8gXHU5MDFBXHU4RkM3ZnNcdTZBMjFcdTU3NTdcdTUxOTlcdTUxNjVcdTY1ODdcdTRFRjZcbiAgZnMud3JpdGVGaWxlKHZlcnNpb25GaWxlLCBjb250ZW50LCAoZXJyKSA9PiB7XG4gICAgaWYgKGVycikgdGhyb3cgZXJyXG4gIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IChvcHRpb25zKSA9PiB7XG4gIGxldCBjb25maWdcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd2ZXJzaW9uLXVwZGF0ZScsXG5cbiAgICBjb25maWdSZXNvbHZlZChyZXNvbHZlZENvbmZpZykge1xuICAgICAgLy8gXHU1QjU4XHU1MEE4XHU2NzAwXHU3RUM4XHU4OUUzXHU2NzkwXHU3Njg0XHU5MTREXHU3RjZFXG4gICAgICBjb25maWcgPSByZXNvbHZlZENvbmZpZ1xuICAgIH0sXG5cbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgLy8gXHU1M0VBXHU1NzI4IGJ1aWxkIFx1NkEyMVx1NUYwRlx1NjI2N1x1ODg0Q1xuICAgICAgaWYgKGNvbmZpZy5jb21tYW5kICE9PSAnYnVpbGQnKSByZXR1cm5cblxuICAgICAgLy8gXHU3NTFGXHU2MjEwXHU3MjQ4XHU2NzJDXHU0RkUxXHU2MDZGXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHU1QjU4XHU1MjMwZGlzdFx1NzY4NHZlcnNpb24uanNvblxuICAgICAgY29uc3QgZmlsZSA9IGNvbmZpZy5wdWJsaWNEaXIgKyBwYXRoLnNlcCArICd2ZXJzaW9uLmpzb24nXG4gICAgICAvLyBcdThGRDlcdTkxQ0NcdTRGN0ZcdTc1MjhcdTdGMTZcdThCRDFcdTY1RjZcdTk1RjRcdTRGNUNcdTRFM0FcdTcyNDhcdTY3MkNcdTRGRTFcdTYwNkZcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeSh7IHZlcnNpb246IG9wdGlvbnMudmVyc2lvbiB9LCBudWxsLCAyKVxuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhjb25maWcucHVibGljRGlyKSkge1xuICAgICAgICB3cml0ZVZlcnNpb24oZmlsZSwgY29udGVudClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLm1rZGlyKGNvbmZpZy5wdWJsaWNEaXIsIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnJcbiAgICAgICAgICB3cml0ZVZlcnNpb24oZmlsZSwgY29udGVudClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFgsU0FBUyxvQkFBb0I7QUFDdlosWUFBWUEsV0FBVTtBQUN0QixPQUFPLFNBQVM7QUFFaEIsT0FBTyxrQkFBa0I7QUFDekIsU0FBUyw0QkFBNEI7OztBQ0wwWCxPQUFPLFFBQVE7QUFDOWEsT0FBTyxVQUFVO0FBQ2pCLElBQU0sZUFBZSxDQUFDLGFBQWEsWUFBWTtBQUU3QyxLQUFHLFVBQVUsYUFBYSxTQUFTLENBQUMsUUFBUTtBQUMxQyxRQUFJLElBQUssT0FBTTtBQUFBLEVBQ2pCLENBQUM7QUFDSDtBQUVBLElBQU8sOEJBQVEsQ0FBQyxZQUFZO0FBQzFCLE1BQUk7QUFFSixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFFTixlQUFlLGdCQUFnQjtBQUU3QixlQUFTO0FBQUEsSUFDWDtBQUFBLElBRUEsYUFBYTtBQUVYLFVBQUksT0FBTyxZQUFZLFFBQVM7QUFHaEMsWUFBTSxPQUFPLE9BQU8sWUFBWSxLQUFLLE1BQU07QUFFM0MsWUFBTSxVQUFVLEtBQUssVUFBVSxFQUFFLFNBQVMsUUFBUSxRQUFRLEdBQUcsTUFB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
