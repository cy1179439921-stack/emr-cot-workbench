// 管理状态的模块
import { defineStore } from 'pinia'
// import { ref } from 'vue'
export const useAgentStore = defineStore('agent', {
  // 推荐使用 完整类型推断的箭头函数
  state: () => ({
    questionList: [] // 问题列表
  }),
  actions: {
    setQuestionList(val) {
      this.questionList = val
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
