import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { checkAndNotify, showVersionUpdatePrompt } from '@/utils/versionChecker'
// import zhCn from 'element-plus/lib/locale/lang/zh-cn'
// import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './style/element/element.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@/assets/iconfont/iconfont.css'
import '@/assets/iconfont/iconfont.js'
import '@/assets/font/font.css'
import store from './store'
import App from './App.vue'
import 'virtual:svg-icons-register'
import router from './router'
import './style/element/common.scss'
import './style/theme.scss'
import './elementConfig.js'
import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'

// markdonw相关的引入
import VueMarkdownEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'

import Prism from 'prismjs'

// 全局组件
import myTable from '@/components/common/myTable.vue'
import myTable2 from '@/components/common/myTable2.vue'
import VTable from '@/components/common/vTable.vue'
import mySearch from '@/components/common/mySearch.vue'
import operationCodeSelect from '@/components/common/operationCodeSelect.vue'
import pdfViews from '@/components/common/pdfViews.vue'
// import pdfViews from '@/components/common/pdfViews2.vue'
import commonEcharts from '@/components/common/commonEcharts.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'
import YearRange from '@/components/common/yearrange.vue'
import AllDateSelect from '@/components/common/allDateSelect.vue'
import CommonTable from '@/components/common/commonTable.vue'
import CommonSubTitle from '@/components/common/commonSubTitle.vue'
import CommonTitle from '@/components/common/commonTitle.vue'
import CommonInput from '@/components/common/commonInput.vue'
import CommonLengend from '@/components/common/commonLengend.vue'
import CommonTooltip from '@/components/common/commonTooltip.vue'
import CommonTooltipWithSlotContent from '@/components/common/commonTooltipWithSlotContent.vue'
import LoadingBtn from '@/components/common/loadingBtn.vue'
import Loading from '@/components/common/loading.vue'
import CommonMultiSelectV2WithSearch from '@/components/common/commonMultiSelectV2WithSearch.vue'
import CommonMD from '@/components/common/commonMD.vue'
import AILoading from '@/components/common/AILoading.vue'
import MyTableInfinite from '@/components/common/myTableInfinite.vue'
import CommonPreview from '@/components/common/commonPreview.vue'
// 自定义指令
import { showTip, noE, focus, decimalLimit } from './directives.js'

VueMarkdownEditor.use(vuepressTheme, {
  Prism
})

const app = createApp(App)
const icons = Object.keys(ElementPlusIconsVue)
app.directive('show-tip', showTip)
app.directive('no-e', noE)
app.directive('decimal-limit', decimalLimit)
app.directive('focus', focus) // 注册 v-focus 指令
// 全局混入
app.mixin({
  methods: {
    // 将px转换为rem的方法
    pxToRem(px) {
      const baseFontSize = 14 // 设定基准字体大小，比如14px
      return `${px / baseFontSize}rem`
    }
  }
})
icons.forEach((key) => {
  const component = ElementPlusIconsVue[key]
  app.component(key, component)
})
app.component('myTable', myTable)
app.component('myTable2', myTable2)
app.component('VTable', VTable)
app.component('mySearch', mySearch)
app.component('operationCodeSelect', operationCodeSelect)
app.component('pdfViews', pdfViews)
app.component('commonEcharts', commonEcharts)
app.component('SvgIcon', SvgIcon)
app.component('YearRange', YearRange)
app.component('AllDateSelect', AllDateSelect)
app.component('CommonTable', CommonTable)
app.component('CommonSubTitle', CommonSubTitle)
app.component('CommonTitle', CommonTitle)
app.component('CommonInput', CommonInput)
app.component('CommonLengend', CommonLengend)
app.component('CommonTooltip', CommonTooltip)
app.component('CommonTooltipWithSlotContent', CommonTooltipWithSlotContent)
app.component('LoadingBtn', LoadingBtn)
app.component('Loading', Loading)
app.component('CommonMultiSelectV2WithSearch', CommonMultiSelectV2WithSearch)
app.component('CommonMD', CommonMD)
app.component('AILoading', AILoading)
app.component('MyTableInfinite', MyTableInfinite)
app.component('CommonPreview', CommonPreview)

app.use(store)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
app.use(VxeUITable)
app.use(VueMarkdownEditor)
app.mount('#app')

// ========== 智能版本检测（仅生产环境） ==========
if (import.meta.env.PROD) {
  // 资源加载错误拦截：JS/CSS 文件加载失败时提示更新
  window.addEventListener('error', (event) => {
    const target = event.target || event.srcElement

    // 只关心 script 和 link 标签
    const isElementTarget =
      target instanceof HTMLScriptElement ||
      target instanceof HTMLLinkElement

    if (!isElementTarget) return

    const url = target.src || target.href
    if (!url) return

    // 仅拦截打包出来的静态资源（.js 或 .css）
    if (!/\.(js|css)(\?|#|$)/.test(url)) return

    console.log('[版本检测] 资源加载失败:', url)
    showVersionUpdatePrompt()
  }, true)

  // 1. 页面首次加载时检查
  console.log('[版本检测] 页面加载，检查更新')
  checkAndNotify()

  // 2. 页面可见性变化检测（用户从其他标签页切回来）
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('[版本检测] 页面可见，检查更新')
      checkAndNotify()
    }
  })

  // 3. 页面重新获得焦点时检查
  window.addEventListener('focus', () => {
    console.log('[版本检测] 页面聚焦，检查更新')
    checkAndNotify()
  })

  // 4. 定时轮询（仅在页面可见时，10分钟检测一次）
  setInterval(() => {
    if (!document.hidden) {
      console.log('[版本检测] 定时检查更新')
      checkAndNotify()
    }
  }, 10 * 60 * 1000) // 10分钟
}
