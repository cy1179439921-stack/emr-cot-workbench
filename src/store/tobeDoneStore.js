// 管理状态的模块
import { defineStore } from 'pinia'
import { tobeDoneStatistic } from '@/api/api_scientific'
// import { ref } from 'vue'
export const useTobeDoneStore = defineStore('tobeDone', {
  state: () => ({
    tobeDoneNum: {}
  }),
  actions: {
    async setTobeDoneNum(val) {
      const res = await tobeDoneStatistic()
      console.log('待办数据', res)
      if (res.code === 10000) {
        this.tobeDoneNum = res.data || {}
      }
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
