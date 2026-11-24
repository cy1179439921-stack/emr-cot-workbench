// 管理状态的模块
import { defineStore } from 'pinia'
// import { ref } from 'vue'
export const useResearchStore = defineStore('researchStore', {
  // 推荐使用 完整类型推断的箭头函数
  state: () => ({
    curResearchQueueDetail: null, // 研究队列详情
    researchConfigurationDetails: null // 科研配置详情
  }),
  actions: {
    setCurResearchQueueDetail(val) {
      console.log('val', val)
      this.curResearchQueueDetail = val
    },
    setResearchConfigurationDetails(val) {
      this.researchConfigurationDetails = val
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
