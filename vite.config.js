import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import electron from 'vite-plugin-electron/simple'
import path from 'path'
import MotionResolver from 'motion-v/resolver'



// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ArcoResolver()],
    }),
    Components({
      dts: true,            // 自动生成 TypeScript 类型声明文件（.d.ts 文件）可用于代码提示
      resolvers: [
        ArcoResolver({
          sideEffect: true  // 启用组件的副作用自动导入功能 （自动导入组件的样式文件）
        }),
        MotionResolver()
      ]
    }),
    electron({
      main: {
        entry: 'electron/main.js',
      },
      preload: {
        input: 'electron/preload.js',
      },
    }),
  ],
  css:{
    preprocessorOptions: {
        less: {
          modifyVars:{
             hack: `true; @import (reference) "${path.resolve('./src/theme.less')}";`
          },
          javascriptEnabled: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // define: {
  //   'import.meta.env.EXE_DIR': JSON.stringify(process.env.EXE_DIR)
  // }
})
