import axios from 'axios'
// import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { emitter } from '@/utils/bus'
import router from '../router'
// eslint-disable-next-line no-unused-vars
import { getToken } from '@/utils/crypto'
// import { useSystemUpdateStore } from '@/store/systemUpdate'
// import { encryptedSM4, decryptedSM4 } from '@/utils/gm.js'
// 不显示错误信息的url
const notErrorMessageUrls = ['/analysis/dataProjectIndex/export', '/analysis/dataSet/dataSetExport', '/verifyBatchRecord/record/export', '/verifyCotRecord/record/export']
// 不携带token的url
const notTokenUrls = ['/system/sso/getAuthUrl', '/system/sso/validCode', '/system/common/login', '/system/common/loginEncrypted', '/system/license/getLicenseFilterInfo', '/system/platformInfo/getPlatformInfo', '/system/platformInfo/getPlatformVersionInfo', '/system/license/uploadLicense']
// const ENUrlList = ['/system/common/loginEncrypted']
// 若不先实例化，会出现一次请求，拦截器拦截多次请求与响应问题
const service = axios.create({
  baseURL: '/api',
  timeout: 4 * 60 * 1000
})
let acitveAxios = 0
// let timer
const showLoading = () => {
  acitveAxios += 1
  // if (timer) {
  //   clearTimeout(timer)
  // }
  // timer = setTimeout(() => {
  if (acitveAxios === 1) {
    emitter.emit('showLoading')
  }
  // }, 400) // 400毫秒内请求不需要显示loading
}

const closeLoading = () => {
  acitveAxios -= 1
  if (acitveAxios <= 0) {
    // clearTimeout(timer)
    emitter.emit('closeLoading')
  }
}
let tokenLostPrompted = false // 全局变量，标记是否已经提示过token丢失的消息

const handleTokenLost = () => {
  if (!tokenLostPrompted) {
    tokenLostPrompted = true
    closeLoading()
    router.push({ name: 'login' })
  }
}
let accountLostPrompted = false // 全局变量，标记是否已经提示过账号被删除的消息
const handleAccountLost = (msg) => {
  if (!accountLostPrompted) {
    accountLostPrompted = true
    ElMessage({
      message: msg,
      type: 'error'
    })
    router.push({ name: 'login' })
  }
}
let server502Prompted = false // 全局变量，标记是否已经提示过502错误
const multipartUrls = [
  '/medical/medicalRecord/addFile',
  '/analysis/dataSet/createFolderOrDataSet',
  '/scientific/projectFile/upload',
  '/scientific/flowTaskHistoryFile/upload',
  '/medical/AIChat/uploadFile',
  '/queue/index/importIndexList',
  '/queue/queueIndexGroup/importQueueIndexGroupStructure',
  '/verifyBatch/upload',
  '/verifyCotRecord/import'
]
const blobUrls = [
  '/queue/index/exportPublicIndexFile',
  '/queue/queueIndexGroup/exportQueueIndexGroupStructure',
  '/admin/settlement/export-pdf'
]
// http request 拦截器
service.interceptors.request.use(
  (config) => {
    // ===== 模拟 502 错误（测试用） =====
    // if (localStorage.getItem('mock502') === 'true') {
    //   closeLoading()
    //   const error = new Error('Bad Gateway')
    //   error.response = {
    //     status: 502,
    //     statusText: 'Bad Gateway',
    //     config,
    //     data: null
    //   }
    //   return Promise.reject(error)
    // }

    // if (config.url === '/api/v1/base/login') {
    //   showLoading('登录中，请稍候...')
    // }
    if (config.url !== '/queue/queueIndexGroup/updateQueueIndexGroup') { // 指标列表拖拽
      showLoading()
    }
    const token = getToken()
    if (token && !config.url.includes('/system/license/uploadLicense')) {
      config.headers = {
        Authorization: `Bearer ${token}`,
        ...config.headers
      }
      if (multipartUrls.some(url => config.url.includes(url))) {
        config.headers['Content-Type'] = 'multipart/form-data'
      } else {
        config.headers['Content-Type'] = 'application/json'
      }
      if (blobUrls.some(url => config.url.includes(url))) {
        config.responseType = 'blob'
      }
    } else if (!notTokenUrls.includes(config.url)) {
      handleTokenLost()
      return false
    }
    return config
  },
  (error) => {
    // console.log('请求拦截器error', error)
    closeLoading()
    ElMessage({
      message: error,
      type: 'error'
    })
    return error
  }
)
// http response 拦截器
service.interceptors.response.use(
  (response) => {
    closeLoading()
    // ===== Mock 登录模式：静默处理后端响应，不弹错误 =====
    if (localStorage.getItem('mockLogin') === 'true') {
      if (response.data && response.data.code === 10000) {
        return response.data
      }
      return { code: 10000, data: null, msg: 'ok' }
    }
    // let response = res
    // if (res.config.headers['X-Encrypted']) {
    //   response = decryptedSM4(res.data.encryptedData)
    // }
    if (response.config.url === '/medical/AIChat/getReply') {
      if (response.status === 200) {
        // const reader = response.data.getReader()
        // const decoder = new TextDecoder('utf-8')
        // let done = false

        // const readStream = async () => {
        //   while (!done) {
        //     const { value, done: doneReading } = await reader.read()
        //     done = doneReading
        //     const chunkValue = decoder.decode(value, { stream: !done })
        //     console.log(chunkValue) // 或者将 chunkValue 更新到你的页面中
        //   }
        // }

        // readStream()
        return response.data
      } else {
        ElMessage({
          message: '网络好像不太稳定，请稍后重试',
          type: 'error'
        })
      }
    } else if (response.status && response.data.code === 10000) {
      // 拦截登录请求
      if (response.config.url === '/system/common/login') {
        tokenLostPrompted = false
        accountLostPrompted = false
      }
      // 如果请求成功，重置 502 错误标志
      server502Prompted = false
      return response.data
    } else if (response.status && response.data.code === 900002) {
      handleTokenLost()
    } else if (response.status && response.data.code === 900008) {
      // 该用户账号被删除
      handleAccountLost(response.data.msg)
    } else if (response.status && response.data.code === 900015) {
      return response.data
    }
    const DOWNLOAD_APIS = [
      '/system/license/downloadLicense',
      '/queue/index/exportPublicIndexFile',
      '/queue/queueIndexGroup/exportQueueIndexGroupStructure',
      '/agent/agentResearchProposal/download',
      '/agent/researchSelect/download',
      '/agent/literatureReview/download',
      '/verifyCotRecord/record/export',
      '/admin/settlement/export-pdf'
    ]
    // 热更新时会出现response不包含完整头，只包含后端返回的data的情况，特殊处理一下
    if (response.status === 200 && DOWNLOAD_APIS.some(api => response.config?.url?.includes(api))) {
      return response
    }
    // 热更新时会出现response不包含完整头，只包含后端返回的data的情况，特殊处理一下
    // if (!response.status && response.code === 200) {
    //   return response
    // }
    const url = response.config.url
    if (!accountLostPrompted && !notErrorMessageUrls.includes(url)) { // 账号没被删除 && 不是不显示错误信息的url
      ElMessage({
        message: response.data.msg,
        type: 'error'
      })
    }

    return response.data.msg ? response.data : response
  },
  (error) => {
    closeLoading()
    // ===== Mock 登录模式：静默处理请求错误，不弹错误提示 =====
    if (localStorage.getItem('mockLogin') === 'true') {
      console.log('[Mock模式] 请求错误已静默处理:', error.message)
      return Promise.resolve({ code: 10000, data: null, msg: 'ok' })
    }
    // 过滤掉取消请求的错误
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.message)
      return Promise.reject(error)
    }

    // ===== 处理 502 Bad Gateway 错误 =====
    if (error.response && error.response.status === 502) {
      if (!server502Prompted) {
        server502Prompted = true
        ElMessage({
          message: '系统正在升级，请稍后再试',
          type: 'warning',
          duration: 0
        })
      }
      return Promise.reject(error)
    }
    // ===== 502 处理结束 =====

    // ===== 如果已经提示过 502，不再显示其他错误提示 =====
    if (server502Prompted) {
      console.log('系统更新中，请求错误已被静默处理')
      return Promise.reject(error)
    }
    // ===== 结束 =====

    if (error.code === 'ECONNABORTED') {
      ElMessage({
        message: '这次加载超时了，请检查网络后重试',
        type: 'error'
      })
    } else {
      ElMessage({
        message: error.message,
        type: 'error'
      })
    }
    return Promise.reject(error)
  }
)
export default service
