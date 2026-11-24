// 管理系统更新状态的模块
import { defineStore } from 'pinia'

export const useSystemUpdateStore = defineStore('systemUpdate', {
  // 推荐使用 完整类型推断的箭头函数
  state: () => ({
    isUpdating: false, // 是否正在更新
    updateMessage: '系统正在更新中···' // 更新提示消息
  }),
  actions: {
    setUpdating(status) {
      this.isUpdating = status
    },
    setUpdateMessage(message) {
      this.updateMessage = message
    }
  },
  getters: {},
  persist: {
    // 不开启持久化，每次刷新页面都重新检测最新状态
    enabled: false
  }
})
