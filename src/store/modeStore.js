// ===================== 外观风格 =====================
// 明亮（白 + 浅蓝，默认）/ 暖色（琥珀，人文关怀）/ 深色
// 说明：数据看板沿用了 mode === 'dark' 的判断，这里保持 mode 字段不拆
import { defineStore } from 'pinia'

// 可选项：头像弹层的风格切换器使用
export const THEME_OPTIONS = [
  { label: '明亮', value: 'light', dot: '#3670f8', desc: '白底浅蓝' },
  { label: '深色', value: 'dark', dot: '#252d3d', desc: '深蓝灰底，长时间不刺眼' },
  { label: '暖色', value: 'warm', dot: '#c2742c', desc: '米白底 + 琥珀主色' }
]

const THEME_CLASSES = ['theme-light', 'theme-warm', 'theme-dark']

// 把主题类挂到 <html>：全局 CSS 变量都挂在 theme-* 上
export const applyTheme = (val) => {
  const theme = ['light', 'warm', 'dark'].includes(val) ? val : 'light'
  const root = document.documentElement
  if (!root) return theme
  root.classList.remove(...THEME_CLASSES)
  root.classList.add(`theme-${theme}`)
  root.setAttribute('data-theme', theme)
  return theme
}

export const useModeStore = defineStore('modeStore', {
  state: () => ({
    mode: 'light'
  }),
  actions: {
    setMode(val) {
      this.mode = applyTheme(val)
    },
    // 启动时同步一次（持久化恢复后再补一次，避免刷新瞬间闪白）
    initTheme() {
      this.mode = applyTheme(this.mode)
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
