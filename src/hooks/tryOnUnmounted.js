import { getCurrentInstance, onUnmounted } from 'vue'
// import type { Fn } from '../utils'

/**
 * Call onUnmounted() if it's inside a component lifecycle, if not, do nothing
 *
 * @param fn
 */
export function tryOnUnmounted(fn) {
  if (getCurrentInstance()) { onUnmounted(fn) }
}
