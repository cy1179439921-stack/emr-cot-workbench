// ===================== 演示环境接口兜底 =====================
// 有些展示页在本地演示环境里没有后端，接口会一直挂起导致页面长期转圈。
// 这里统一提供「限时等待」：超时或异常都返回 null，由调用方回落到演示数据。

/**
 * 给 Promise 加一个超时上限
 * @param {Promise} promise 原始请求
 * @param {number} ms 最长等待时间（毫秒）
 * @returns {Promise<any|null>} 超时或异常时返回 null
 */
export const withTimeout = (promise, ms = 3000) => {
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve(null), ms)
  })
  const safePromise = Promise.resolve(promise).catch(() => null)
  return Promise.race([safePromise, timeout])
}
