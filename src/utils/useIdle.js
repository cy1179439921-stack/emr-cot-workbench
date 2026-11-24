// useIdle.js
import { onBeforeUnmount, ref } from 'vue'

/**
 * 无操作监听（手动控制启停）
 * @param {number | import('vue').Ref<number> | (() => number)} seconds
 *   触发秒数。支持 number / ref<number> / getter，便于在 start 之前动态修改。
 * @param {() => void} onIdle  超时回调
 * @returns {{ start: (overrideSeconds?: number | import('vue').Ref<number>) => void, stop: () => void, running: import('vue').Ref<boolean>, remaining: import('vue').Ref<number> }}
 */
export function useIdle(seconds, onIdle) {
  const timer = ref(null)
  const interval = ref(null)
  const running = ref(false)
  const remaining = ref(0) // 剩余倒计时秒数（供页面展示）
  const deadline = ref(0) // 超时时间戳

  // 统一解析触发秒数：兼容 number / ref<number> / getter 三种形态
  const resolveSeconds = (value) => {
    if (typeof value === 'function') return Number(value()) || 0
    if (value && typeof value === 'object' && 'value' in value) return Number(value.value) || 0
    return Number(value) || 0
  }

  // 当前生效的触发秒数（start 时确定，reset 直接使用，避免运行中被动变更）
  let currentSeconds = resolveSeconds(seconds)

  // 高频事件，加 passive 提升性能（只重置计时，不阻止默认行为）
  const passiveEvents = ['mousemove', 'scroll', 'wheel', 'touchstart']

  // 需要时可能 preventDefault 的事件，不加 passive
  const normalEvents = ['pointerdown', 'mousedown', 'keydown', 'click']

  // 每秒更新剩余时间
  const updateRemaining = () => {
    if (!running.value) {
      remaining.value = 0
      return
    }
    remaining.value = Math.max(0, Math.ceil((deadline.value - Date.now()) / 1000))
  }

  const reset = () => {
    if (!running.value) return
    if (timer.value) clearTimeout(timer.value)
    deadline.value = Date.now() + currentSeconds * 1000
    updateRemaining()
    timer.value = setTimeout(() => {
      stop()
      onIdle?.()
    }, currentSeconds * 1000)
  }

  /**
   * 启动监听。
   * @param {number | import('vue').Ref<number>} [overrideSeconds]
   *   可选，覆盖本次启动的触发秒数（优先级高于入参 seconds），支持 number / ref<number>。
   *   例：idle.start(60) 或 idle.start(someRef)
   */
  const start = (overrideSeconds) => {
    if (running.value) return
    // 每次 start 重新读取最新触发秒数：优先用 override，否则取入参（支持动态 ref/getter）
    currentSeconds = overrideSeconds !== undefined ? resolveSeconds(overrideSeconds) : resolveSeconds(seconds)
    running.value = true
    passiveEvents.forEach(e => window.addEventListener(e, reset, { passive: true }))
    normalEvents.forEach(e => window.addEventListener(e, reset))
    reset()
    // 启动每秒更新循环
    interval.value = setInterval(updateRemaining, 1000)
  }

  const stop = () => {
    running.value = false
    remaining.value = 0
    passiveEvents.forEach(e => window.removeEventListener(e, reset))
    normalEvents.forEach(e => window.removeEventListener(e, reset))
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
    if (interval.value) {
      clearInterval(interval.value)
      interval.value = null
    }
  }

  // 组件卸载自动清理
  onBeforeUnmount(stop)

  return { start, stop, running, remaining }
}
