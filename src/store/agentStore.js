import { defineStore } from 'pinia'

export const useAgentStore = defineStore('agentStore', {
  state: () => ({
    variables: []
  }),
  actions: {
    setVariables(val) {
      this.variables = val
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
