// 示例：@/store/medicalStore.js (或对应的store路径)
import { defineStore } from 'pinia'

export const useMedicalPathStore = defineStore('medical', {
  state: () => ({
    // ... 现有的其他状态
    activeHighlightPath: '' // 新增：用来存储当前点击并需要高亮的证据路径
  }),
  actions: {
    // 新增：设置高亮路径
    setActiveHighlightPath(path) {
      this.activeHighlightPath = path
    },
    // 新增：清除高亮路径（可选，便于路由切换或关闭重置）
    clearHighlightPath() {
      this.activeHighlightPath = ''
    }
  }
})
