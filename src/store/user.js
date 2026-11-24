// 管理状态的模块
import { defineStore } from 'pinia'
// import { ref } from 'vue'
export const useUserStore = defineStore('user', {
  // 推荐使用 完整类型推断的箭头函数
  state: () => ({
    username: '', // 用户名
    activeRouter: 'medicalRecord', // 默认路由
    userPermissionMenu: [], // 用户授权的菜单和权限
    allowedMenu: [], // 用户授权的权限，未排序
    allowedRouter: [], // 用户授权的菜单，按路由配置排序
    needCheckPermission: true, // 是否检验权限
    screenWidth: 1920, // 当前分辨率
    platInfo: {} // 平台信息
  }),
  actions: {
    setUsername(val) {
      this.username = val
    },
    setActiveRouter(val) {
      this.activeRouter = val
    },
    setUserPermissionMenu(val) {
      this.userPermissionMenu = val
    },
    setAllowedMenu(val) {
      this.allowedMenu = val
    },
    setAllowedRouter(val) {
      this.allowedRouter = val
    },
    setScreenWidth(val) {
      this.screenWidth = val
    },
    setPlatInfo(val) {
      this.platInfo = val
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
