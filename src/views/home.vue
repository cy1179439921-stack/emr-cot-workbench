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

    <!-- 未入驻引导：落地首页时提醒一次，点击去填写入驻申请 -->
    <el-dialog
      v-model="onboardDialogVisible"
      class="onboardGuideDialog"
      width="460px"
      align-center
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="onboardGuide">
        <div class="guideEmblem">
          <i class="iconfont icon-guanfangrenzheng"></i>
        </div>
        <h3 class="guideTitle">完成入驻，就能开始标注</h3>
        <p class="guideText">
          入驻审核通过后，就可以接取标注任务、参与劳务结算。用您的专业，为医疗 AI 贡献一份力量。
        </p>
        <div class="guidePoints">
          <span class="guidePoint"><i class="iconfont icon-duihao2"></i>上传证件与简历，通常 1-2 个工作日出结果</span>
          <span class="guidePoint"><i class="iconfont icon-duihao2"></i>填到一半可以先暂存，下次回来接着填</span>
        </div>
        <div class="guideActions">
          <el-button class="guideLater" text @click="handleOnboardLater">稍后再说</el-button>
          <el-button class="guideGo" type="primary" @click="goOnboarding">去入驻申请</el-button>
        </div>
      </div>
    </el-dialog>
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
import { onMounted, ref, computed, watch } from 'vue'
import { useModeStore } from '@/store/modeStore'
import { useRoute } from 'vue-router'
import { getUserMenu } from '@/api/api_user'
import { useUserStore } from '@/store/user'
import router from '@/router'
import { useMedicalStore } from '@/store/medicalStore'
import { getToken } from '@/utils/crypto'
import { onboardingState, ONBOARDING_STATUS } from '@/utils/onboarding'
import { currentPlatformRole, loginRouteByRole } from '@/utils/platform'
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
// 未入驻引导弹窗
const onboardDialogVisible = ref(false)
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
// 平台按使用角色拆分为两端：专家端重交互体验，管理端重业务功能
// 端别工具统一放 utils/platform.js，登录跳转（退出/失效）也要带端别
const EXPERT_VISIBLE_MENU = ['expertWorkbench', 'onboardingAudit', 'medicalRecordProofreading', 'laborSign', 'laborSettlement']
const ADMIN_VISIBLE_MENU = ['dataBoard', 'proofreadingManagement', 'checkInAuditManage', 'contractManagement', 'invoiceManagement', 'manage']
// 专家端流程页在管理端登录下不可直达，统一回管理端首屏
const expertOnlyRouteNames = [...EXPERT_VISIBLE_MENU]
// 浏览器标签按端显示名称
document.title = currentPlatformRole() === 'admin' ? '颐邦小源医学专家平台管理后台' : '颐邦小源医学专家平台'
const redirectIfNotVerified = () => {
  if (onboardingState.status === ONBOARDING_STATUS.APPROVED) return
  const currentName = router.currentRoute.value.name
  // 未入驻统一落在首页（不展示侧边栏），由首页引导 + 弹窗引导去填入驻申请
  if (!UNVERIFIED_ALLOWED_ROUTE.includes(currentName)) {
    router.push({ name: 'expertWorkbench' })
  }
}

// 未入驻用户落地首页时，弹一次入驻引导（每个登录会话只弹一次）
const maybeShowOnboardGuide = () => {
  if (onboardingState.status !== ONBOARDING_STATUS.NOT_APPLIED) return
  if (router.currentRoute.value.name !== 'expertWorkbench') return
  if (sessionStorage.getItem('cot-onboard-guide-shown') === '1') return
  sessionStorage.setItem('cot-onboard-guide-shown', '1')
  onboardDialogVisible.value = true
}

const handleOnboardLater = () => {
  onboardDialogVisible.value = false
}

const goOnboarding = () => {
  onboardDialogVisible.value = false
  router.push({ name: 'onboardingAudit' })
}

// 路由落到首页即检查（登录后 toFirstRoute、刷新直达都覆盖）
watch(
  () => route.name,
  (name) => {
    if (name === 'expertWorkbench') maybeShowOnboardGuide()
  },
  { immediate: true }
)
// 加载时请求页面列表
const init = async () => {
  if (!userStore.needCheckPermission) {
    // 按角色在菜单数据源头裁剪，主菜单与独立菜单组一起收敛
    const role = currentPlatformRole()
    if (role === 'expert') {
      routerArr.value = routerArr.value.filter(item => EXPERT_VISIBLE_MENU.includes(item.name))
    } else if (role === 'admin') {
      routerArr.value = routerArr.value.filter(item => ADMIN_VISIBLE_MENU.includes(item.name))
      // 管理端不承载专家流程页，直达时回管理端首屏
      if (expertOnlyRouteNames.includes(router.currentRoute.value.name)) {
        router.push({ path: '/dataBoard' })
      }
    }
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
  // 重定向到登录界面（带上端别，管理后台失效时不被送回专家端入口）
  router.push(loginRouteByRole())
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
    margin-left: var(--sidebar-width, 224px);
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
