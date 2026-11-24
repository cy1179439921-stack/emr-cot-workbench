// 病历列表查询状态管理
import { defineStore } from 'pinia'

export const useMedicalRecordListStore = defineStore('medicalRecordListStore', {
  state: () => ({
    // 查询条件
    searchInfo: {
      id: '',
      proofreadStatusList: [],
      proofreaderIds: [],
      reviewerIds: []
    },
    // 分页
    currentPage: 1,
    limit: 20
  }),
  actions: {
    // 设置查询状态（支持部分更新）
    setQueryState(params) {
      Object.assign(this, params)
    },
    // 设置搜索信息
    setSearchInfo(searchInfo) {
      this.searchInfo = searchInfo
    },
    // 设置当前页码
    setCurrentPage(page) {
      this.currentPage = page
    },
    // 设置每页条数
    setLimit(limit) {
      this.limit = limit
    },
    // 重置所有状态
    resetState() {
      this.searchInfo = {
        id: '',
        proofreadStatusList: [],
        proofreaderIds: [],
        reviewerIds: []
      }
      this.currentPage = 1
      this.limit = 20
    }
  },
  persist: {
    enabled: true,
    strategies: [
      { storage: localStorage }
    ]
  }
})
