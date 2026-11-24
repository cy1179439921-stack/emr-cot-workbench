/**
 * 版本更新检测工具模块
 * 功能：
 * 1. 统一的版本检测逻辑
 * 2. 防重复弹窗机制
 * 3. 防抖避免频繁请求
 * 4. 完善的错误处理
 */

import { ElMessageBox } from 'element-plus'
import axios from 'axios'

// ========== 全局状态 ==========

// 全局标志：防止重复弹窗（跨 router 和 main 两个模块共享）
let isUpdatePromptShown = false

// 防抖：避免频繁检测
let lastCheckTime = 0
const CHECK_DEBOUNCE_TIME = 60 * 1000 // 1分钟内不重复检测

// ========== 核心函数 ==========

/**
 * 检查版本更新
 * @returns {Promise<boolean>} 是否有新版本
 */
export async function checkVersion() {
  // 开发环境跳过
  if (import.meta.env.DEV) {
    console.log('[版本检测] 开发环境，跳过检测')
    return false
  }

  // 防抖检查
  const now = Date.now()
  if (now - lastCheckTime < CHECK_DEBOUNCE_TIME) {
    console.log('[版本检测] 1分钟内已检测过，跳过')
    return false
  }
  lastCheckTime = now

  try {
    const lastVersion = localStorage.getItem('lastVersion') || ''

    // 使用时间戳破坏缓存
    const res = await axios.get(`/version.json?t=${now}`, {
      timeout: 5000 // 5秒超时
    })

    const currentVersion = res.data?.version

    // 验证版本号格式
    if (!currentVersion) {
      console.warn('[版本检测] version.json 格式错误:', res.data)
      return false
    }

    console.log('[版本检测] 文件版本:', currentVersion, '本地版本:', lastVersion)

    // 首次访问，记录版本号
    if (!lastVersion || lastVersion === 'null') {
      localStorage.setItem('lastVersion', String(currentVersion))
      console.log('[版本检测] 首次访问，记录版本号:', currentVersion)
      return false
    }

    // 简化的版本比对：只比较 version.json
    if (Number(lastVersion) !== Number(currentVersion)) {
      console.log(`[版本检测] 检测到版本更新: ${lastVersion} -> ${currentVersion}`)
      localStorage.setItem('lastVersion', String(currentVersion))
      return true
    }

    console.log('[版本检测] 版本一致，无需更新')
    return false
  } catch (error) {
    // 关键：网络错误不触发刷新，避免无限循环
    console.error('[版本检测] 检测失败，不触发刷新:', error.message)
    return false
  }
}

/**
 * 显示版本更新提示弹窗
 */
export function showVersionUpdatePrompt() {
  // 防止重复弹窗
  if (isUpdatePromptShown) {
    console.log('[版本检测] 已显示更新提示，跳过')
    return
  }

  isUpdatePromptShown = true
  console.log('[版本检测] 显示版本更新提示')

  ElMessageBox.confirm(
    '有新版本可用，刷新页面即可使用最新功能',
    '版本更新提示',
    {
      confirmButtonText: '立即刷新',
      showCancelButton: false,
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      type: 'warning'
    }
  ).then(() => {
    console.log('[版本检测] 用户确认刷新')
    location.reload() // 移除废弃的 true 参数
  })
}

/**
 * 检查版本并在有更新时提示
 */
export async function checkAndNotify() {
  const hasUpdate = await checkVersion()
  if (hasUpdate) {
    showVersionUpdatePrompt()
  }
}
