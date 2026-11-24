// 管理状态的模块
import { defineStore } from 'pinia'
// import { ref } from 'vue'
export const useMedicalStore = defineStore('medicalStore', {
  // 推荐使用 完整类型推断的箭头函数
  state: () => ({
    curPatientDetail: null, // 患者基本信息详情
    medicalList: [], // 就诊详情列表
    activeMedical: '', // 当前选中
    curPatientDetailList: [], // 患者列表
    activeCurPatientDetail: '', // 当前选择患者索引
    routerNotKeepLiveList: [], // 路由缓存
    editingMedical: '', // 编辑中病历信息
    isDirty: false, // 当前编辑内容是否有未保存修改
    medicalPageList: [], // 病历相关页码，不允许重复
    medicalOrderPageList: [], // 病历顺序页码，允许重复
    currentPage: '', // 当前页码
    batchId: '', // 批次id
    userAllocateId: '', // 人工分配id
    recordId: '', // 病历id
    showOperationView: false, // 是否显示操作记录界面
    lastEditTime: '' // 最后编辑时间
  }),
  actions: {
    setCurPatientDetail(val) {
      if (this.curPatientDetailList.find(item => item.key === val.key)) {
        // 判断是否存在路由，如果不存在，则删除原有路由
        this.curPatientDetailList = this.curPatientDetailList.map(it => {
          if (it.key === val.key && !val?.routerName) {
            delete it.routerName
          } else {
            it.routerName = val.routerName
          }
          return it
        })
        this.activeCurPatientDetail = val.key
        return
      }
      if (this.curPatientDetailList.length < 10) {
        if (val?.key) {
          this.curPatientDetailList.unshift(val)
          this.activeCurPatientDetail = val.key
        }
      }
    },
    setmedicalList(val) {
      if (this.medicalList.find(item => item.key === val.key)) {
        // 判断是否存在路由，如果不存在，则删除原有路由
        this.medicalList = this.medicalList.map(it => {
          if (it.key === val.key && !val?.routerName) {
            delete it.routerName
          } else {
            it.routerName = val.routerName
          }
          it.type = val?.type || 0
          return it
        })
        this.activeMedical = val.key
        return
      }
      if (this.medicalList.length < 10) {
        if (val?.key) {
          this.medicalList.unshift(val)
          this.activeMedical = val.key
        }
      }
    },
    delmedicalList(val) {
      if (val) {
        this.medicalList = this.medicalList.filter(item => item.key !== val)
        if (this.medicalList.length && this.activeMedical === val) {
          this.activeMedical = this.medicalList[this.medicalList.length - 1].key || ''
        }
      }
    },
    delCurPatientDetail(val) {
      if (val) {
        this.curPatientDetailList = this.curPatientDetailList.filter(item => item.key !== val)
        if (this.curPatientDetailList.length && this.activeCurPatientDetail === val) {
          this.activeCurPatientDetail = this.curPatientDetailList[this.curPatientDetailList.length - 1].key || ''
        }
      }
    },
    setLable(key, val) {
      if (key) {
        this.medicalList.forEach(item => {
          if (item.key === key) {
            item.label = val
          }
        })
      }
    },
    setPatientLable(key, val) {
      if (key) {
        this.curPatientDetailList.forEach(item => {
          if (item.key === key) {
            item.label = val
          }
        })
      }
    },
    setActiveMedical(val) {
      // 判断是否存在路由，如果不存在，则删除原有路由
      this.medicalList = this.medicalList.map(it => {
        if (it.key === val) {
          delete it.routerName
        }
        return it
      })
      this.activeMedical = val
    },
    setActiveCurPatientDetail(val) {
      // 判断是否存在路由，如果不存在，则删除原有路由
      this.curPatientDetailList = this.curPatientDetailList.map(it => {
        if (it.key === val) {
          delete it.routerName
        }
        return it
      })
      this.activeCurPatientDetail = val
    },
    clearmedicalList() {
      this.medicalList = []
      this.curPatientDetailList = []
      this.routerNotKeepLiveList = []
      this.activeMedical = ''
      this.activeCurPatientDetail = ''
    },
    handlerRouterKeepLiveList(val, type = 'add') {
      if (type === 'add' && !this.routerNotKeepLiveList.includes(val)) {
        this.routerNotKeepLiveList.push(val)
      }
      if (type === 'del') {
        this.routerNotKeepLiveList = this.routerNotKeepLiveList.filter(item => item !== val)
      }
    },
    setEditingMedical(val) {
      this.editingMedical = val
    },
    setDirty(val = true) {
      this.isDirty = val
    },
    clearDirty() {
      this.isDirty = false
    },
    setLastEditTime(val) {
      this.lastEditTime = val
    },
    setMedicalPageList(val) {
      this.medicalPageList = val
    },
    setMedicalOrderPageList(val) {
      this.medicalOrderPageList = val
    },
    setCurrentPage(val) {
      this.currentPage = val
    },
    setBatchId(val) {
      this.batchId = val
    },
    setUserAllocateId(val) {
      this.userAllocateId = val
    },
    setRecordId(val) {
      this.recordId = val
    },
    clearRecordId() {
      this.recordId = ''
    },
    setShowOperationView(val) {
      this.showOperationView = val
    }
  },
  getters: {
    medicalRouter: (state) => {
      const medicalDetails = {
        name: 'medicalDetails',
        path: '/medicalRecord/medicalDetails',
        title: '就诊详情',
        type: 0,
        meta: {
          keepAlive: true, // 缓存页面
          independent: true
        },
        icon: 'icon-a-11'
      }

      if (state.medicalList.length) {
        medicalDetails.children = []
        state.medicalList.forEach(item => {
          medicalDetails.children.push({
            name: item.key,
            path: '/medicalRecord/medicalDetails',
            meta: {
              activeName: 'medicalDetails'
            },
            title: item.label || item.key
          })
        })
      }
      return [medicalDetails]
    },
    curPatientDetailRouter: (state) => {
      const curPatientDetail = {
        name: 'patientHomePage',
        path: '/medicalRecordLibrary/patientHomePage',
        title: '患者主页',
        type: 0,
        icon: 'icon-a-10',
        meta: {
          keepAlive: true, // 缓存页面
          independent: true
        }
      }

      if (state.curPatientDetailList.length) {
        curPatientDetail.children = []
        state.curPatientDetailList.forEach(item => {
          curPatientDetail.children.push({
            name: item.key,
            path: '/medicalRecordLibrary/patientHomePage',
            meta: {
              activeName: 'curPatientDetail'
            },
            title: item.label || item.key
          })
        })
      }
      return [curPatientDetail]
    }
  },
  persist: {
    // 开启持久化
    enabled: true,
    // 选择存储方式和内容
    strategies: [
      {
        storage: localStorage,
        paths: [
          'curPatientDetail',
          'medicalList',
          'activeMedical',
          'curPatientDetailList',
          'activeCurPatientDetail',
          'routerNotKeepLiveList',
          'medicalPageList',
          'medicalOrderPageList',
          'currentPage',
          'batchId',
          'userAllocateId',
          'recordId',
          'showOperationView'
        ]
      }
    ]
  }
})
