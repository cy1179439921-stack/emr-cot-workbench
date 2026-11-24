<template>
  <!-- 系统更新提示条 -->
  <div v-if="systemUpdateStore.isUpdating" class="system-update-banner">
    <img src="@/assets/notification.png" alt="消息通知">
    <span>{{ systemUpdateStore.updateMessage }}</span>
  </div>

  <!-- <VScaleScreen :fullScreen="true" v-if="!smallScreen">
    <router-view />
  </VScaleScreen> -->
  <router-view/>
</template>

<script setup>
import { watch } from 'vue'
// import { getPlatformVersionInfo } from '@/api/api_manageBackground'
import { useUserStore } from '@/store/user'
import { useSystemUpdateStore } from '@/store/systemUpdate'
import { useModeStore, applyTheme } from '@/store/modeStore'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const systemUpdateStore = useSystemUpdateStore()
const modeStore = useModeStore()
const route = useRoute()

// 外观风格（明亮 / 暖色 / 深色）：启动即同步到 <html>，避免刷新时闪色
// 登录页固定走明亮主题：它的输入框是浅色皮肤的硬编码样式，深色下会看不清
const syncTheme = () => {
  applyTheme(route.name === 'login' ? 'light' : modeStore.mode)
}
syncTheme()
watch(() => [route.name, modeStore.mode], syncTheme)
// const getPlatformInfoData = async () => {
//   const res = await getPlatformInfo()
//   userStore.setPlatInfo({
//     systemName: res.data[0].value,
//     menuFoldLogo: res.data[1].value,
//     menuExpandLogo: res.data[2].value,
//     darkMenuFoldLogo: res.data[3].value,
//     darkMenuExpandLogo: res.data[4].value,
//     systemIco: res.data[5].value,
//     loginLogo: res.data[6].value,
//     isSensitiveInfo: res.data[7].value === '1', // 是否敏感信息
//     loginTitle: res.data[8].value
//   })
//   // 创建一个新的<link rel="icon">标签
//   const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
//   link.type = 'image/x-icon'
//   link.rel = 'icon'
//   link.href = res.data[5].value
//   // 将 link 元素添加到 head 中
//   document.getElementsByTagName('head')[0].appendChild(link)
//   if (!localStorage.getItem('isAuthLogin')) {
//     document.title = res.data[0].value
//   } else {
//     document.title = '疾病监测与公共卫生数据分析平台'
//   }
// }
// getPlatformInfoData()

// ===== 轮询检测系统更新 =====
// let pollingTimer = null
// let wasUpdating = false // 记录上一次的更新状态

// const checkSystemUpdate = async () => {
//   try {
//     const res = await getPlatformVersionInfo()

//     if (res.code === 10000) {
//       const isUpdating = res.data.value === '1'

//       // 状态变化日志
//       if (systemUpdateStore.isUpdating !== isUpdating) {
//         console.log(`系统更新状态变化: ${systemUpdateStore.isUpdating} -> ${isUpdating}`)
//       }

//       // 检测从更新中恢复，自动刷新页面
//       if (wasUpdating && !isUpdating) {
//         console.log('系统更新完成，即将刷新页面...')
//         setTimeout(() => {
//           location.reload()
//         }, 1000) // 1秒后刷新，让用户看到状态变化
//         return
//       }

//       wasUpdating = isUpdating
//       systemUpdateStore.setUpdating(isUpdating)
//       systemUpdateStore.setUpdateMessage(res.data.description)
//     }
//   } catch (error) {
//     // 轮询接口失败不影响主流程，只记录日志
//     console.error('检查系统更新状态失败:', error)
//   }
// }

// const startPolling = () => {
//   checkSystemUpdate() // 立即执行一次
//   pollingTimer = setInterval(checkSystemUpdate, 60000)
// }

// const stopPolling = () => {
//   if (pollingTimer) {
//     clearInterval(pollingTimer)
//     pollingTimer = null
//   }
// }

// onMounted(() => {
//   // 只在生产环境启动轮询
//   if (import.meta.env.PROD) {
//     startPolling()
//   }
// })

// onUnmounted(() => {
//   stopPolling()
// })
// ===== 轮询检测结束 =====

const setRem = () => {
  // const zoomLevel = (window.devicePixelRatio / 2).toFixed(2)
  const zoomLevel = 1
  const width = document.documentElement.clientWidth || document.body.clientWidth
  const rootFontSize = width / 1920 * 14 * zoomLevel // 假设1920px宽度的设计稿，根据设计稿宽度动态设置rem
  document.documentElement.style.fontSize = `${rootFontSize}px`
}
setRem()
window.addEventListener('resize', setRem)
// 禁用缩放
document.addEventListener('keydown', function (event) {
  if ((event.ctrlKey === true || event.metaKey === true) &&
      (event.key === '=' || event.key === '+' ||
      event.key === '-' || event.key === '_')) {
    event.preventDefault()
  }
}, false)
// 使用watch监听userStore下的platInfo，当platInfo发生变化时，重新设置<link rel="icon">的href值
watch(
  () => userStore.platInfo,
  (newVal, oldVal) => {
    if (newVal.systemIco !== oldVal.systemIco) {
      const link = document.querySelector("link[rel*='icon']")
      link.href = newVal.systemIco
    }
  }
)
</script>

<style lang="scss">
/* 系统更新提示条 */
.system-update-banner {
  display: flex;
  position: fixed;
  left: 50%;
  top: 3px;
  z-index: 9999;
  justify-content: center;
  box-sizing: border-box;
  width: max-content;
  max-width: 1100px;
  min-height: 60px;
  padding: 14px 32px;
  border: 1px solid rgba(245, 159, 12, 0.5);
  border-radius: 8px;
  background: rgba(245, 159, 12, 0.12);
  line-height: 33px;
  font-weight: 600;
  font-size: 20px;
  color: #ff7411;
  transform: translateX(-50%);
  img {
    width: 16px;
    height: 20px;
    margin-right: 16px;
    margin-top: 6px;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
