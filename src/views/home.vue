<template>
  <div :class="{home:true,darkTheme:(modeStore.mode==='dark'&&route.path==='/dataBoard')}" v-loading="loadingFlag" element-loading-text="分析中，请稍候...">
    <homeMenu v-if="showMenu"/>
    <div class="mainRouter" v-if="showMenu">
      <!-- <homeHeader /> -->
      <div class="homeView" v-if="isPermission">
        <div class="homeView-content">
          <router-view
            v-slot="{ Component }"
            element-loading-text="正在加载中"
            class="admin-box"
          >
            <keep-alive :exclude="routerNotKeepLiveList">
              <component :is="Component" :key="$route.name + appVersion" v-if="$route.meta.keepAlive"/>
            </keep-alive>
            <transition mode="out-in" name="el-fade-in-linear" v-if="!$route.meta.keepAlive">
              <component :is="Component" :key="route.fullPath + appVersion"/>
            </transition>
          </router-view>
        </div>
      </div>
      <noPermission v-else></noPermission>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
<script setup>
// import homeHeader from '@/components/home/homeHeader.vue'
import homeMenu from '@/components/home/homeMenu.vue'
import noPermission from '@/views/noPermission.vue'
import { emitter } from '@/utils/bus'
import { onMounted, ref, computed } from 'vue'
import { useModeStore } from '@/store/modeStore'
import { useRoute } from 'vue-router'
import { getUserMenu } from '@/api/api_user'
import { useUserStore } from '@/store/user'
import router from '@/router'
import { useMedicalStore } from '@/store/medicalStore'
import { getToken } from '@/utils/crypto'
import { onboardingState, ONBOARDING_STATUS } from '@/utils/onboarding'
import _ from 'lodash'
// import { useTobeDoneStore } from '@/store/tobeDoneStore'
const medicalStore = useMedicalStore()
// const tobeDoneStore = useTobeDoneStore()
const routerNotKeepLiveList = computed(() => medicalStore.routerNotKeepLiveList) // 患者列表
// import { getSysDictionaryByType } from '@/api/api_dictionary'
const modeStore = useModeStore()
// eslint-disable-next-line no-undef
const appVersion = ref(__APP_VERSION__)
const route = useRoute()
const userStore = useUserStore()
const $route = computed(() => route)

const loadingFlag = ref(false)
const configUrlArr = ref([])
const showMenu = ref(false)
const routerArr = ref([])
const isPermission = ref(true) // 是否有权限
routerArr.value = router.options.routes[1].children.filter(
  (item) => item.type === 0
)
console.log(111, router.options.routes[1].children.filter(
  (item) => item.type === 0
))

userStore.setScreenWidth(document.documentElement.clientWidth || document.body.clientWidth)
const toGetUserMenu = async () => {
  const res = await getUserMenu()
  if (res.code === 10000) {
    if (res.data && (res.data.some(item => item.name === '查看') || res.data.some(item => item.name === '主页面'))) {
      userStore.setUserPermissionMenu(res.data)
      res.data.forEach(item => {
        if (item.name === '查看' || ['查看院内卒中基本数据情况', '查看院内卒中数据预估分析', '查看中心卒中基本数据情况'].includes(item.name)) {
          configUrlArr.value.push(item.url)
        }
        if (item.url === '/AI' && item.name === '主页面') {
          configUrlArr.value.push(item.url)
        }
      })
      userStore.setAllowedMenu(configUrlArr.value)
      if (userStore.needCheckPermission) {
        const temp = _.cloneDeep(routerArr.value)
        temp.forEach((item, index) => {
          if (item.type === 0 && !item.children && !configUrlArr.value.includes(item.path)) {
            routerArr.value = routerArr.value.filter(i => i.path !== item.path)
          } else if (item.path === '/manage' && !configUrlArr.value.some(allowItem => allowItem.includes('/manage/'))) {
            routerArr.value = routerArr.value.filter(i => i.path !== '/manage')
          } else if (item.path === '/researchManagement' && !configUrlArr.value.some(allowItem => allowItem.includes('/researchManagement/'))) {
            routerArr.value = routerArr.value.filter(i => i.path !== '/researchManagement')
          } else if (item.path === '/manageBackend' && !configUrlArr.value.some(allowItem => allowItem.includes('/manageBackend'))) {
            // routerArr.value = routerArr.value.filter(i => i.path !== '/manageBackend')
          } else if (item.path === '/strokeDirectReport' && !configUrlArr.value.some(allowItem => allowItem.includes('/strokeDirectReport'))) {
            routerArr.value = routerArr.value.filter(i => i.path !== '/strokeDirectReport')
          } else if (item.path === '/dataAnalysis' && !configUrlArr.value.some(allowItem => allowItem.includes('/dataAnalysis'))) {
            routerArr.value = routerArr.value.filter(i => i.path !== '/dataAnalysis')
          } else if (item.path === '/medicalRecordLibrary/patientHomePage' && !res.data.some(allowItem => allowItem.name === '患者主页')) {
            routerArr.value = routerArr.value.filter(i => i.path !== '/medicalRecordLibrary/patientHomePage')
          } else if (item.path === '/invoiceManagement' && !configUrlArr.value.some(allowItem => allowItem.includes('/invoiceManagement'))) {
            routerArr.value = routerArr.value.filter(i => i.path !== '/invoiceManagement')
          } else if (item.path === '/proofreadingManagement') {
            // 权限 URL 配置在父路径 /proofreadingManagement 上，而非子路径，
            // 因此不能进入下方 else 分支按子路径精确匹配过滤子项
            if (!configUrlArr.value.some(allowItem => allowItem.includes('/proofreadingManagement'))) {
              routerArr.value = routerArr.value.filter(i => i.path !== '/proofreadingManagement')
            }
            // 有权限时保留全部子项，不进入 else 过滤
          } else if (item.path === '/researchManagement' && !configUrlArr.value.some(allowItem => allowItem.includes('/researchManagement/'))) {
            console.log(1)
          } else {
            item.children && item.children.forEach((item2, index2) => {
              if (!configUrlArr.value.includes(item2.path)) {
                const newIndex = routerArr.value.findIndex(i => i.name === item.name)
                if (routerArr.value[newIndex] && routerArr.value[newIndex].children) {
                  routerArr.value[newIndex].children = routerArr.value[newIndex].children.filter(i => i.path !== item2.path)
                }
              }
            })
          }
          if (localStorage.getItem('account') !== 'admin') {
            routerArr.value = routerArr.value.filter(i => i.path !== '/manageBackend')
          }
        })
      }
      // 标注管理的两个子模块是原型核心页面，即使后端权限菜单只返回父路径，
      // 也保留完整的病历池/任务管理导航，避免菜单被权限裁剪成空项。
      const proofreadingRoute = router.options.routes[1].children.find(item => item.name === 'proofreadingManagement')
      const allowedProofreading = routerArr.value.find(item => item.name === 'proofreadingManagement')
      if (proofreadingRoute) {
        if (allowedProofreading) {
          allowedProofreading.children = proofreadingRoute.children
        } else {
          routerArr.value.push(proofreadingRoute)
        }
      }
      // 配置管理是原型核心页面，后端权限菜单未配置该项时也保留入口，避免菜单被裁剪后找不到配置页
      const configManageRoute = router.options.routes[1].children.find(item => item.name === 'configManagement')
      const manageRoute = routerArr.value.find(item => item.name === 'manage')
      if (configManageRoute && manageRoute && manageRoute.children && !manageRoute.children.some(item => item.name === 'configManagement')) {
        manageRoute.children.push(configManageRoute)
      }
      userStore.setAllowedRouter(routerArr.value)
      return true
    } else {
      routerArr.value = []
      userStore.setAllowedRouter(routerArr.value)
      return false
    }
  }
}
onMounted(() => {
  emitter.on('showGlobalLoading', () => {
    loadingFlag.value = true
  })
  emitter.on('closeLoading', () => {
    loadingFlag.value = false
  })
  // if (userStore.loadingInstance) {
  //   userStore.loadingInstance.close()
  // }
})
// const toGetSysDictionaryByType = async () => {
//   // const res = await getSysDictionaryByType({
//   //   type: 'developGroupOptions',
//   // })
//   // const dictionaryStore = useDictionaryStore()
//   // dictionaryStore.setDevelopGroupOptions(res.data)
// }
// 跳到第一个路由
const toFirstRoute = () => {
  if (routerArr.value.length === 0) {
    if (userStore.userPermissionMenu.some(item => item.url.includes('/AI'))) {
      router.push({ path: '/AI' })
    }
    return false
  }
  // 1. 优先查找是否有【专家工作台】权限
  const expertRoute = routerArr.value.find(item => item.path === '/expertWorkbench')

  if (expertRoute) {
    userStore.setActiveRouter(expertRoute.path)
    router.push({ path: expertRoute.path })
  } else {
    // 2. 如果没有专家工作台，跳转到第一个路由
    const firstRoute = routerArr.value[0]
    if (firstRoute.children && firstRoute.children.length > 0) {
      userStore.setActiveRouter(firstRoute.children[0].path)
      router.push({ path: firstRoute.children[0].path })
    } else {
      userStore.setActiveRouter(firstRoute.path)
      router.push({ path: firstRoute.path })
    }
  }
  // if (routerArr.value[0].children) {
  //   userStore.setActiveRouter(routerArr.value[0].children[0].path)
  //   router.push({ path: routerArr.value[0].children[0].path })
  // } else {
  //   userStore.setActiveRouter(routerArr.value[0].path)
  //   router.push({ path: routerArr.value[0].path })
  // }
}
// 入驻审核未通过时，只允许访问「首页」与「入驻审核」
const UNVERIFIED_ALLOWED_ROUTE = ['expertWorkbench', 'onboardingAudit']
const redirectIfNotVerified = () => {
  if (onboardingState.status === ONBOARDING_STATUS.APPROVED) return
  const currentName = router.currentRoute.value.name
  // 「新入驻」账号（非全模块账号）每次登录都直接进入驻申请页，
  // 全模块账号未通过时先回首页看引导
  const isNewbie = localStorage.getItem('cot-login-role') === 'newbie'
  // 每次登录只引导一次：登录后先落入驻申请，之后首页仍可访问
  const landed = sessionStorage.getItem('cot-onboard-landed') === '1'
  if (isNewbie && !landed) {
    sessionStorage.setItem('cot-onboard-landed', '1')
    router.push({ name: 'onboardingAudit' })
    return
  }
  if (!UNVERIFIED_ALLOWED_ROUTE.includes(currentName)) {
    router.push({ name: 'expertWorkbench' })
  }
}
// 加载时请求页面列表
const init = async () => {
  if (!userStore.needCheckPermission) {
    showMenu.value = true
    if (router.currentRoute.value.name === 'home') {
      toFirstRoute() // 统一走优先首页/第一路由的跳转逻辑
    }
    redirectIfNotVerified()
    userStore.setAllowedRouter(routerArr.value)
  } else {
    const hadPermission = await toGetUserMenu()
    if (hadPermission) {
      // 如果当前页面路由不存在，则跳转到第一个有权限的页面
      // 详情页不一定会出现在菜单权限 URL 中，但必须允许从列表进入、刷新和返回。
      // 之前这些路由会被统一重定向到首个菜单，表现为详情页空白/无法访问。
      const detailRouteNames = ['taskDetail', 'viewProofreadMedical', 'auditMedical']
      const isDetailRoute = detailRouteNames.includes(router.currentRoute.value.name)
      if ((router.currentRoute.value.name === 'home' || (!configUrlArr.value.includes(router.currentRoute.value.path) && !isDetailRoute)) && router.currentRoute.value.path !== '/AI' && router.currentRoute.value.path !== '/deepseek') {
        if (router.currentRoute.value.name === 'researchQueueConfig') {
          const obj = userStore.userPermissionMenu.find(item => item.name === '查看配置')
          if (!obj) {
            // 查看配置权限被他人取消
            toFirstRoute()
          }
        } else if (router.currentRoute.value.name === 'researchQueueDetail') {
          const obj = userStore.userPermissionMenu.find(item => item.name === '查看详情')
          if (!obj) {
            // 查看详情权限被他人取消
            toFirstRoute()
          }
        } else if (router.currentRoute.value.name === 'proofreadingManagementDetails') {
          const obj = userStore.userPermissionMenu.find(item => item.name === '查看')
          if (!obj) {
            // 查看详情权限被他人取消
            toFirstRoute()
          }
        } else if (router.currentRoute.value.name === 'patientHomePage') {
          const obj = userStore.userPermissionMenu.find(item => item.name === '患者主页')
          if (!obj) {
            // 患者主页权限被他人取消
            toFirstRoute()
          }
        } else if (router.currentRoute.value.name === 'proofreadMedical') {
          const obj = userStore.userPermissionMenu.find(item => item.name === '校对')
          if (!obj) {
            // 病历校对权限被他人取消
            toFirstRoute()
          }
        } else {
          toFirstRoute()
        }
      }
      showMenu.value = true
      redirectIfNotVerified()
    } else {
      isPermission.value = false
      showMenu.value = true
      return false
    }
  }
  // if (userStore.allowedMenu.includes('/researchManagement/toBeDone')) {
  // // 进行我的待办数据统计请求
  //   tobeDoneStore.setTobeDoneNum()
  // }

  // await toGetSysDictionaryByType()
}
const token = getToken()
if (token) {
  init()
} else {
  // 重定向到登录界面
  router.push({ name: 'login' })
}
</script>

<style scoped lang="scss">
.home {
  display: flex;
  width: 100%;
  height: 100%;
  &.darkTheme {
    background: radial-gradient(circle at center, #1d2656 0%, #04020f 65%);
    :deep(.homeDrawer) {
      background: transparent;
    }
  }
  .mainRouter {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: 72px;
    .homeView {
      display: flex;
      flex: 1;
      height: 0;
      background-color: var(--theme-card);
      .homeView-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 0;
        height: 100%;
        // padding: 12px 16px;padding
        // box-sizing: border-box;box-sizing
        background-color: var(--theme-bg);
      }
    }
  }
}
</style>
