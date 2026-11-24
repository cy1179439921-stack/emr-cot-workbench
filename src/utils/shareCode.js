// 公网预览环境（WorkBuddy 托管）的访问入口必须携带 ?sharecode=xxx，
// 否则网关会直接返回「链接不完整」页。
// 项目使用 history 路由，站内跳转默认不会带上 query，
// 导致地址栏变成 /medicalRecordProofreading 这类短地址，
// 复制分享出去别人打开就是「链接不完整」。
// 这里在每次路由切换后把 sharecode 补回地址栏，保证地址栏始终是可分享的完整链接。

const STORAGE_KEY = 'wb-preview-sharecode'

// 读取地址栏里的 sharecode，并记录到 sessionStorage 供后续跳转复用
export function captureShareCode() {
  if (typeof window === 'undefined') return ''
  const matched = String(window.location.search || '').match(/[?&]sharecode=([^&#]*)/i)
  if (matched && matched[1]) {
    let code = matched[1]
    try {
      code = decodeURIComponent(code)
    } catch (e) {
      // 非法编码，保留原值
    }
    try {
      window.sessionStorage.setItem(STORAGE_KEY, code)
    } catch (e) {
      // 隐私模式下 sessionStorage 不可用，忽略
    }
    return code
  }
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) || ''
  } catch (e) {
    return ''
  }
}

// 把 sharecode 补回当前地址栏（replaceState 不触发路由重新解析）
export function keepShareCodeInUrl() {
  if (typeof window === 'undefined') return
  const code = captureShareCode()
  if (!code) return
  const { pathname, search, hash } = window.location
  const current = String(search || '').match(/[?&]sharecode=([^&#]*)/i)
  if (current && current[1]) return // 已经有 sharecode，无需处理
  const nextSearch = search
    ? `${search}&sharecode=${encodeURIComponent(code)}`
    : `?sharecode=${encodeURIComponent(code)}`
  try {
    window.history.replaceState(window.history.state, '', `${pathname}${nextSearch}${hash}`)
  } catch (e) {
    // 忽略 replaceState 失败的情况
  }
}
