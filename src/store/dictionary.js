// 管理状态的模块
import { defineStore } from 'pinia'

export const useDictionaryStore = defineStore('dictionary', {
  // 推荐使用 完整类型推断的箭头函数
  state: () => ({
    developGroupOptions: [],
    projectStatusOptions: [],
    priorityOptions: [],
    demandStatusOptions: [],
    stageOptions: [],
    sourceOptions: [],
    taskStatusOptions: [],
    bugStatusOptions: [],
    bugSolutionOptions: []
  }),
  actions: {
    setDevelopGroupOptions(val) {
      this.developGroupOptions = val
    },
    setProjectStatusOptions(val) {
      this.projectStatusOptions = val
    },
    setPriorityOptions(val) {
      this.priorityOptions = val
    },
    setDemandStatusOptions(val) {
      this.demandStatusOptions = val
    },
    setStageOptions(val) {
      this.stageOptions = val
    },
    setSourceOptions(val) {
      this.sourceOptions = val
    },
    setTaskStatusOptions(val) {
      this.taskStatusOptions = val
    },
    setBugStatusOptions(val) {
      this.bugStatusOptions = val
    },
    setBugSolutionOptions(val) {
      this.bugSolutionOptions = val
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
