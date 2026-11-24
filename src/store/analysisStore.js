import { defineStore } from 'pinia'

export const useAnalysisStore = defineStore('analysisStore', {
  state: () => ({
    data: [],
    pid: 0,
    level: 0
  }),
  actions: {
    setData(val) {
      this.data = val
    },
    setPid(val) {
      this.pid = val
    },
    setLevel(val) {
      this.level = val
    }
  },
  getters: {},
  persist: {
    // 开启持久化
    enabled: true,
    // 选择存储方式和内容
    strategies: [
      { storage: localStorage }
    ]
  }
})
