<template>
  <el-drawer class="homeDrawer" :class="{'is-collapse': isCollapse}" v-model="drawer" modal-class="drawer-box" :modal="false" :with-header="false" direction="ltr" :close-on-click-modal="false">
    <div :class="{
           homeMenu:true,
           darkTheme:(modeStore.mode==='dark'&&route.path==='/dataBoard'),
         }"
         @mouseenter="openSubMenu"
         @mouseleave="closeSubMenu">
      <div class="menuTitle" :class="getMenuTitleClassNmae">
        <div v-if="isCollapse" class="brandArt brandArtMini" :title="platformName">颐邦<br />小源</div>
        <div v-else class="brandArt" :title="platformName">
          <span class="brandArtMain">{{ brandMain }}</span>
          <span class="brandArtSub">{{ brandSub }}</span>
        </div>
      </div>
      <div v-if="!isCollapse" class="menuSectionLabel">工作区</div>
      <el-scrollbar height="100%">
        <!-- <transition :duration="{ enter: 800, leave: 100 }"> -->
        <el-menu
          :collapse="isCollapse"
          :default-active="active"
          class="el-menu-vertical"
          unique-opened
          @select="selectMenuItem"
          :key="isCollapse"
        >
          <template v-for="item in menuList.filter(item => !item.meta?.independent)" :key="item.name">
            <AsideComponent
              v-show="!item.hidden"
              :is-collapse="isCollapse"
              :router-info="item"
              :theme="theme"
            />
          </template>
        </el-menu>
        <!-- </transition> -->
        <!-- <el-divider class="menuDivider"/> -->
        <template v-for="routerItem in independentRouting" :key="routerItem.name">
          <template v-if="userStore.allowedRouter.some(r => r.path === routerItem.list[0].path)">
            <!-- <transition :duration="{ enter: 800, leave: 100 }"> -->
            <el-menu
              :collapse="isCollapse"
              :default-active="active"
              class="el-menu-vertical list-el-menu"
              unique-opened
              @select="$event => selectMedicalMenuItem($event,routerItem.name)"
              :key="isCollapse && routerItem.list[0]?.children?.length"
            >
              <template v-for="item in routerItem.list" :key="item.name">
                <AsideComponent
                  v-show="!item.hidden"
                  :is-collapse="isCollapse"
                  :router-info="item"
                  :theme="theme"
                  :closeRouter="Boolean(item?.children)"
                  @closeRouterIndex="$event => closeRouterIndex($event,routerItem.name)"
                />
              </template>
            </el-menu>
          <!-- </transition> -->
          </template>
        </template>
      </el-scrollbar>
      <!-- <div class="AILogo"><img src="../../assets/AI.png" @click="openAI"></div> -->
      <!-- <div class="AILogo" v-if="!userStore.needCheckPermission || userStore.allowedMenu.includes('/AI')">
        <div class="aiLogo-content" :class="{'isCollapse': isCollapse}" @click="openAI">
          <img class="img1" src="@/assets/AILogoImg.png">
          <img class="img2" src="@/assets/AILogoText.png" v-if="!isCollapse">
        </div>
      </div>
      <div class="AILogo AILogo2" v-if="userStore.allowedMenu.includes('/AI')">
        <div class="aiLogo-content" :class="{'isCollapse': isCollapse}" @click="openDeepseek">
          <img class="img1" src="@/assets/AILogoImg.png">
          <div v-if="!isCollapse" class="text">Deepseek</div>
        </div>
      </div>
      <div class="AILogo AILogo3" v-if="userStore.allowedMenu.includes('/AI')">
        <div class="aiLogo-content" :class="{'isCollapse': isCollapse}" @click="openDoubao">
          <img class="img1" src="@/assets/AILogoImg.png">
          <div v-if="!isCollapse" class="text">豆包大模型</div>
        </div>
      </div>
      <div :class="{toBeDoneContaienr:true,isNotice:!isCollapse}" @click="handleQuickEntrance" class="tobeDoneText" v-if="userStore.allowedMenu.includes('/researchManagement/toBeDone')">
        <SvgIcon iconName="icon-xiaoxi" className="icon-xiaoxi " ></SvgIcon>
        <div v-show="!isCollapse" class="text" >
          <span>我的待办</span>
          <span class="count">{{`（${tobeDoneStore.tobeDoneNum?.todoTotalNum>999?'999+':(tobeDoneStore.tobeDoneNum?.todoTotalNum)||0}）`}}</span>
        </div>
        <div class="notice" v-show="isCollapse&&Number(tobeDoneStore.tobeDoneNum?.todoTotalNum)">{{`${tobeDoneStore.tobeDoneNum?.todoTotalNum>99?'99+':(tobeDoneStore.tobeDoneNum?.todoTotalNum)||0}`}}</div>
      </div> -->
      <footer class="homeFooter" :class="isCollapse ? '' : 'homeFooter-expand'">
        <el-popover
          placement="right-end"
          :width="pxToRem(240)"
          popper-class="photoPanel photoPanelWithTheme"
          trigger="click"
          ref="myPopover"
        >
          <div class="panelDiv">
            <!-- 外观风格：明亮 / 暖色 / 深色（管理后台不提供切换） -->
            <div v-if="showThemeSwitch" class="themeBlock">
              <div class="themeBlockTitle">外观风格</div>
              <div class="themeOptions">
                <span
                  v-for="item in THEME_OPTIONS"
                  :key="item.value"
                  class="themeOption"
                  :class="{ 'is-active': modeStore.mode === item.value }"
                  @click="switchTheme(item.value)"
                >
                  <i class="themeDot" :style="{ background: item.dot }"></i>
                  {{ item.label }}
                </span>
              </div>
            </div>
            <ul>
              <li
                v-for="(item, index) in userOperationList"
                :key="index"
                @click="selectLi(item.value)"
              >
                {{ item.name }}
              </li>
            </ul>
          </div>
          <template #reference>
            <div class="headerInfo" title="点击配置外观风格">
              <el-avatar :src="userDefaultImg" />
            </div>
          </template>
        </el-popover>
        <span class="name" :title="userStore.username" v-if="!isCollapse">{{ userStore.username }}</span>
      </footer>
    </div>
  </el-drawer>
  <ProfileCenter v-model="profileDialogVisible" @edit-password="openChangePassword" />
  <el-dialog :title="titleName" v-model="changeDialogShow" v-if="changeDialogShow" class="changePasswordDialog" :width="pxToRem(536)" :before-close="handleClose" :append-to-body="true">
    <el-form ref="ruleFormRef" :label-width="pxToRem(83)" label-position="right" :model="formData" class="new_DialogForm" :rules="rules">
      <el-form-item label="账号：" prop="account">
        <el-input type="text" disabled v-model="formData.account"></el-input>
      </el-form-item>
      <el-form-item label="姓名：" prop="userName">
        <el-input type="text" disabled v-model="formData.userName"></el-input>
      </el-form-item>
      <el-form-item label="原始密码" prop="oldPassword" class="hasEye">
        <el-input :type="showEye3 ? 'text' : 'password'" placeholder="请填写内容" maxlength="30" v-model="formData.oldPassword" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="oldPassword"></el-input>
        <i :class="showEye3 ? 'iconfont icon-zhengyan' : 'iconfont icon-biyan'" @click="showEye3 = !showEye3"></i>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword" class="hasEye">
        <el-input :type="showEye ? 'text' : 'password'" placeholder="请填写内容" maxlength="30" v-model="formData.newPassword" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="newPassword"></el-input>
        <i :class="showEye ? 'iconfont icon-zhengyan' : 'iconfont icon-biyan'" @click="showEye = !showEye"></i>
        <!-- <div v-if="isShow" class='errorMsg'>密码长度8-30位，需包含大写字母、小写字母、数字、特殊字符。</div> -->
      </el-form-item>
      <el-form-item label="确认密码" prop="surePassword" class="hasEye confirmPassword">
        <el-input :type="showEye2 ? 'text' : 'password'" placeholder="请填写内容" maxlength="30" v-model="formData.surePassword" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="surePassword"></el-input>
        <i :class="showEye2 ? 'iconfont icon-zhengyan' : 'iconfont icon-biyan'" @click="showEye2 = !showEye2"></i>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">确 认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'HomeMenu'
}
</script>
<script setup>
import { ref, watch, reactive, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { loginOut, changePassword } from '@/api/api_user'
import { loginRouteByRole } from '@/utils/platform'
import AsideComponent from '@/components/home/AsideComponent.vue'
import projectLogo from '@/assets/ebondlogo.png'
import projectLogoName from '@/assets/ebondlogo2.png'
import cdcLogo from '@/assets/cdclogo.png'
import cdcLogoName from '@/assets/cdclogo2.png'
import darkLogoName from '@/assets/darkLogoName.png'
import userDefaultImg from '@/assets/defaultHeadImg.png'
import { useModeStore, THEME_OPTIONS } from '@/store/modeStore'
import ProfileCenter from '@/components/home/profileCenter.vue'
import { useMedicalStore } from '@/store/medicalStore'
import { setFavicon } from '@/utils/setIco'
import { onboardingState, ONBOARDING_STATUS } from '@/utils/onboarding'
// import { useTobeDoneStore } from '@/store/tobeDoneStore'
// const tobeDoneStore = useTobeDoneStore()
const medicalStore = useMedicalStore()
// console.log('我是导航栏')
const modeStore = useModeStore()
const list = ref([])
// 平台拆分为两端：管理后台与专家端共用一套壳，品牌副标题与外观风格入口按角色区分
// 旧版本 'full'（全模块）统一按管理后台处理
const platformRole = (() => {
  const role = localStorage.getItem('cot-login-role')
  return role === 'full' ? 'admin' : role
})()
const brandMain = '颐邦小源'
const brandSub = computed(() => (platformRole === 'admin' ? '医学专家平台管理后台' : '医学专家平台'))
const platformName = computed(() => `颐邦小源${brandSub.value}`)
// 管理后台重业务，不提供外观风格切换；专家端保留
const showThemeSwitch = computed(() => platformRole !== 'admin')
// 入驻审核未通过时，只展示「首页」与「入驻审核」两个入口
const UNVERIFIED_VISIBLE_MENU = ['expertWorkbench', 'onboardingAudit']
const onboardingApproved = computed(() => onboardingState.status === ONBOARDING_STATUS.APPROVED)
const menuList = computed(() => {
  const items = list.value || []
  if (onboardingApproved.value) return items
  return items.filter(item => UNVERIFIED_VISIBLE_MENU.includes(item.name))
})
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const menuFoldLogo = ref(userStore.platInfo.menuFoldLogo || projectLogo)
const darkMenuFoldLogo = ref(userStore.platInfo.darkMenuFoldLogo || projectLogo)
const menuExpandLogo = ref(userStore.platInfo.menuExpandLogo || projectLogoName)
const darkMenuExpandLogo = ref(userStore.platInfo.darkMenuExpandLogo || darkLogoName)

// 认证登录的医院定制logo尺寸
const getMenuTitleClassNmae = computed(() => {
  if (localStorage.getItem('isAuthLogin')) {
    return 'menuTitle2'
  }
  return ''
})
if (localStorage.getItem('isAuthLogin')) {
  menuFoldLogo.value = cdcLogo
  menuExpandLogo.value = cdcLogoName
  setFavicon('../static/sd-cdc.ico', '疾病监测与公共卫生数据分析平台') // 定制ico图标
}
// 使用watch监听userStore下的platInfo，当platInfo发生变化时，重新设置menuFoldLogo\menuExpandLogo\darkMenuFoldLogo\darkMenuExpandLogo
watch(
  () => userStore.platInfo,
  (newVal, oldVal) => {
    if (newVal.menuFoldLogo.split('?')[0] !== oldVal.menuFoldLogo.split('?')[0]) {
      menuFoldLogo.value = newVal.menuFoldLogo
    }
    if (newVal.menuExpandLogo.split('?')[0] !== oldVal.menuExpandLogo.split('?')[0]) {
      menuExpandLogo.value = newVal.menuExpandLogo
    }
    if (newVal.darkMenuFoldLogo.split('?')[0] !== oldVal.darkMenuFoldLogo.split('?')[0]) {
      darkMenuFoldLogo.value = newVal.darkMenuFoldLogo
    }
    if (newVal.darkMenuExpandLogo.split('?')[0] !== oldVal.darkMenuExpandLogo.split('?')[0]) {
      darkMenuExpandLogo.value = newVal.darkMenuExpandLogo
    }
  }
)
const theme = ref({})
const titleName = ref('修改密码')
const showEye = ref(false)
const showEye2 = ref(false)
const showEye3 = ref(false)
const isShow = ref(false)
const drawer = ref(true)
const changeDialogShow = ref(false)
const profileDialogVisible = ref(false)

// 个人中心里点「登录密码」→ 打开原有的修改密码弹窗
const openChangePassword = () => {
  profileDialogVisible.value = false
  formData.value.account = localStorage.getItem('account') || 'admin'
  const cachedName = localStorage.getItem('cot-profile-name')
  const loginName = userStore.username || ''
  formData.value.userName = cachedName || (loginName.startsWith('演示账号') ? '张慧敏' : loginName) || '张慧敏'
  formData.value.oldPassword = ''
  formData.value.newPassword = ''
  formData.value.surePassword = ''
  changeDialogShow.value = true
}
const formData = ref({
  account: localStorage.getItem('account'),
  userName: userStore.username,
  oldPassword: '',
  newPassword: '',
  surePassword: ''
})

const independentRouting = computed(() => {
  const medical = {
    name: 'medicalDetails',
    list: medicalStore.medicalRouter
  }
  const patient = {
    name: 'patientHomePage',
    list: medicalStore.curPatientDetailRouter
  }
  return [medical, patient] || []
})

watch(
  () => userStore.allowedRouter,
  (value) => {
    list.value = value || []
  },
  { immediate: true, deep: true }
)
const validatePass = (rule, value, callback) => {
  if (value === '') {
    isShow.value = false
    callback(new Error('请填写新密码'))
  } else if (value === formData.value.oldPassword) {
    isShow.value = false
    callback(new Error('新密码不能与旧密码相同'))
  } else {
    const hasLower = /(?=.*[a-z])/.test(value)
    const hasUpper = /(?=.*[A-Z])/.test(value)
    const hasDigit = /(?=.*\d)/.test(value)
    const hasSpecial = /(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",.<>\/?])/.test(value)
    const count = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
    const isAllowed = /^[A-Za-z\d!@#$%^&*()_+\-=\[\]{}|;':",.<>\/?]{8,30}$/.test(value)

    if (isAllowed && count >= 3) {
      isShow.value = false
      callback()
    } else {
      callback(new Error('密码长度8-30位，需包含大写字母、小写字母、数字、特殊字符中的至少任意三种。'))
      // setTimeout(async () => {
      //   isShow.value = true
      // }, 300)
    }
  }
}
const validateSurePassword = async (rule, value) => {
  return new Promise((resolve, reject) => {
    if (value !== formData.value.newPassword) {
      reject(new Error('两次输入的密码不一致'))
    } else {
      resolve()
    }
  })
}
const rules = reactive({
  oldPassword: [
    { required: true, message: '请填写当前密码', trigger: 'blur' }
  ],
  newPassword: [{ required: true, validator: validatePass, trigger: 'blur' }],
  surePassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateSurePassword, trigger: 'blur' }
  ]
})
const getTheme = () => {
  // switch (userStore.sideMode) {
  switch ('#191a23') {
    case '#fff':
      theme.value = {
        background: '#fff',
        activeBackground: 'var(--el-color-primary)',
        activeText: '#fff',
        normalText: '#333',
        hoverBackground: 'rgba(64, 158, 255, 0.08)',
        hoverText: '#333'
      }
      break
    case '#191a23':
      theme.value = {
        background: '#191a23',
        activeBackground: 'var(--el-color-primary)',
        activeText: '#fff',
        normalText: '#fff',
        hoverBackground: 'rgba(64, 158, 255, 0.08)',
        hoverText: '#fff'
      }
      break
    default:
      break
  }
}

getTheme()
const active = ref(userStore.activeRouter)
watch(active, (newValue, oldValue) => {
  if (newValue) {
    userStore.setActiveRouter(newValue)
  }
})
watch(() => router.currentRoute.value.name, (newValue, oldValue) => {
  const obj = router.options.routes[1].children.find(item => item.name === newValue)
  if (obj) {
    if (obj.type === 0) {
      active.value = obj.name
    } else if (obj.type === 1) {
      active.value = obj.meta?.activeName
    }
  } else {
    list.value.forEach(item => {
      if (item.children) {
        const obj2 = item.children.find(item2 => item2.name === newValue)
        if (obj2) {
          if (obj2.hidden) {
            // 取oldValue路由的name,让左侧高亮保持父项
            const obj3 = item.children.find(item3 => item3.name === oldValue)
            if (obj3) {
              active.value = obj3.name
            }
          } else {
            active.value = obj2.name
          }
        }
      }
    })
  }
  if (newValue === 'medicalDetails') {
    active.value = medicalStore.activeMedical
  }
  if (newValue === 'patientHomePage') {
    active.value = medicalStore.activeCurPatientDetail
  }
}, { immediate: true })
watch(() => medicalStore.activeMedical, (newValue) => {
  nextTick(() => {
    if (router.currentRoute.value.name === 'medicalDetails') {
      active.value = newValue
    }
  })
})

watch(() => medicalStore.activeCurPatientDetail, (newValue) => {
  nextTick(() => {
    if (router.currentRoute.value.name === 'patientHomePage') {
      active.value = newValue
    }
  })
})
// 侧边栏默认展开：顶部品牌 + 工作区分组，底部可收起
const isCollapse = ref(false)

// 内容区左边距跟随侧边栏宽度
const syncSidebarWidth = () => {
  document.documentElement.style.setProperty('--sidebar-width', isCollapse.value ? '72px' : '224px')
}
watch(isCollapse, syncSidebarWidth)
onMounted(syncSidebarWidth)
const userOperationList = ref([
  {
    name: '个人中心',
    value: 0
  },
  {
    name: '退出登录',
    value: 1
  }
])
const initPage = () => {
  // 存储当前路由信息
  userStore.setActiveRouter(active.value)
  const screenWidth = document.body.clientWidth
  if (screenWidth < 1000) {
    isCollapse.value = !isCollapse.value
  }

  // emitter.on('collapse', (item) => {
  //   isCollapse.value = item
  // })
}

initPage()
const selectMenuItem = (index, _, ele, aaa) => {
  if (index === 'leakagePrevention') {
    window.open('https://10.31.0.97:31000/portal-login', 'PortalLoginWindow')
    isCollapse.value = !isCollapse.value
    return false
  }
  active.value = index
  if (index === route.name) {
    // 当前已在目标路由：通过变更 query 触发组件重新挂载，从而重新拉取状态（如劳务签署的合同状态）
    router.replace({ path: route.path, query: { ...route.query, _t: Date.now() }})
    return
  }
  router.push({ name: index })
  medicalStore.handlerRouterKeepLiveList('medicalRecordLibrary', 'add')
  medicalStore.handlerRouterKeepLiveList('researchQueueDetail', 'add')
}
// // 打开AI
// const openAI = () => {
//   active.value = ''
//   router.push({ name: 'AI' })
// }
// const openDeepseek = () => {
//   active.value = ''
//   router.push({ name: 'deepseek' })
// }
// const openDoubao = () => {
//   active.value = ''
//   router.push({ name: 'doubao' })
// }
const selectMedicalMenuItem = (index, type) => {
  switch (type) {
    case 'patientHomePage':
      medicalStore.setActiveCurPatientDetail(index)
      router.push({ name: 'patientHomePage', query: { key: index }})
      break
    case 'medicalDetails':
      medicalStore.setActiveMedical(index)
      router.push({ name: 'medicalDetails', query: { key: index }})
      break
  }
}
const closeRouterIndex = (index, type) => {
  switch (type) {
    case 'patientHomePage':
      medicalStore.delCurPatientDetail(index.name)
      break
    case 'medicalDetails':
      medicalStore.delmedicalList(index.name)
      break
  }
}
// 切换外观风格
const switchTheme = (val) => {
  modeStore.setMode(val)
}

const selectLi = async (value) => {
  const myPopover = ref(null)
  if (myPopover.value) {
    myPopover.value.close()
  }
  if (value === 1) {
    window.sessionStorage.clear()
    // const isAuthLogin = window.sessionStorage.getItem('isAuthLogin')
    // if (isAuthLogin) {
    //   router.push({
    //     path: '/Auth'
    //   })
    // } else {
    const res = await loginOut({})
    if (res.code === 10000) {
      // 按退出前的端别回对应登录页，管理后台不被送回专家端入口
      router.push(loginRouteByRole())
    }
    // }

    medicalStore.clearmedicalList()
  } else if (value === 0) {
    profileDialogVisible.value = true
  }
}
const handleClose = async () => {
  changeDialogShow.value = false
}
const ruleFormRef = ref()
const submitForm = async(formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      const params = {
        id: localStorage.getItem('user_id'),
        oldPassword: formData.value.oldPassword,
        newPassword: formData.value.newPassword
      }
      // 演示环境没有改密接口，直接按成功处理，便于走完交互
      if (localStorage.getItem('mockLogin') === 'true') {
        ElMessage.success('密码已修改，下次登录请使用新密码')
        changeDialogShow.value = false
        return
      }
      const res = await changePassword(params)
      if (res.code === 10000) {
        ElMessage.success('密码已修改，下次登录请使用新密码')
        changeDialogShow.value = false
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
// 展开菜单
const openSubMenu = () => {
  isCollapse.value = false
}
// 收起菜单
const closeSubMenu = () => {
  isCollapse.value = true
}
// const handleQuickEntrance = () => {
//   router.push({
//     path: '/researchManagement/toBeDone'
//   })
// }
</script>
<style scoped lang="scss">
:deep(.el-menu-item) {
  transition: none;
}
.homeMenu {
  display: flex;
  position: relative;
  z-index: 2;
  flex-direction: column;
  height: 100%;
  background-color: var(--theme-card);
  &.darkTheme {
    // background: radial-gradient(circle at center, #1d2656 0%, #04020f 65%);
    background-color: #111327;
    :deep(.el-menu) {
      background: transparent;
      .el-menu-item {
        color: rgba(255, 255, 255, 0.7);
        &:hover {
          background-color: var(--theme-primary) !important;
          color: #fff !important;
        }
      }
      .el-menu-item.is-active {
        background: var(--theme-primary);
        color: #fff;
        .iconfont {
          color: #ffff !important;
        }
        svg,
        svg use {
          color: #fff;
        }
      }
      .el-sub-menu {
        .el-sub-menu__title {
          color: rgba(255, 255, 255, 0.7);
        }
      }
      .el-menu-item:hover,
      .el-sub-menu__title:hover,
      &.el-menu--collapse .el-sub-menu__title:hover {
        background: transparent;
        color: #fff;
        .iconfont {
          color: #ffff !important;
        }
      }
      &.el-menu--collapse .el-menu-item.is-active {
        background: transparent;
      }
      &.el-menu--collapse {
        .el-menu-item.is-active {
          background-color: var(--theme-primary);
          .iconfont {
            color: #fff !important;
          }
          svg,
          svg use {
            color: #fff;
          }
        }
      }
    }
    .name {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    .tobeDoneText {
      color: rgba(255, 255, 255, 0.7);
      &:hover {
        background-color: var(--theme-primary);
        color: #fff;
        .text {
          color: #fff;
        }
      }
      .text {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
  .collapseBtn {
    display: none;
    position: absolute;
    right: 0;
    top: 27px;
    z-index: 9;
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-radius: 20px;
    background-color: var(--theme-card);
    cursor: pointer;
    &.darkcollapseBtn {
      border: 2px solid #04020f;
      background-color: rgba(30, 29, 45, 1);
      i {
        color: #fff;
      }
    }
    i {
      color: var(--theme-primary);
    }
  }
  :deep(.el-scrollbar) {
    .el-scrollbar__view {
      display: flex;
      flex-direction: column;
      height: 100%;

      @include scrollBarStyle();
    }
  }
  .menuTitle {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 60px;
    padding: 0 22px;
    font-weight: 600;
    font-size: 20px;
    :deep(.el-avatar) {
      background-color: var(--theme-card);
    }
    img:nth-child(1) {
      // width: 23px;
      height: 36px;
    }
    img:nth-child(2) {
      // width: 106px;
      height: 22px;
      margin-left: 12px;
    }
  }
  .menuTitle2 {
    padding-left: 19px;
    img:nth-child(1) {
      width: 34px;
      height: auto;
    }
    img:nth-child(2) {
      width: 140px;
      height: auto;
    }
  }
  :deep(.el-menu) {
    width: 224px;
    padding-left: 18px;
    padding-right: 18px;
    border-right: none;
    .gva-menu-item {
      display: flex;
      align-items: center;
      .el-icon {
        margin-top: -3px;
      }
      .gva-menu-item-title {
        margin-left: 8px;
      }
    }
    .el-menu-item {
      // width: 144px;
      height: 32px;
      margin-top: 16px;
      padding: 0;
      border-radius: 4px;
      line-height: 32px;
      color: var(--theme-text-2);
      .iconfont {
        height: 100%;
        font-size: 32px;
      }
      &.is-active {
        background-color: var(--theme-primary-soft);
        font-weight: 600;
        color: var(--theme-text);
        svg,
        svg use {
          color: var(--theme-primary);
        }
      }
    }
    .el-menu-item [class^="el-icon"] {
      margin-right: 16px;
    }
    .el-sub-menu__title {
      border-radius: 4px;
    }
    .el-sub-menu {
      margin-top: 16px;
      border-radius: 4px;
      &.is-active {
        svg,
        svg use {
          color: var(--theme-primary) !important;
        }
        .gva-subMenu {
          span {
            font-weight: 600;
            color: var(--theme-text);
          }
        }
      }
      .el-menu-item {
        height: 40px;
      }
      .iconfont {
        font-size: 32px;
      }
      .gva-subMenu {
        .el-icon {
          margin-right: 16px;
        }
        span {
          margin-left: 8px;
        }
      }
      .el-sub-menu__title {
        height: 32px;
        padding: 0;
        // padding-left: 16px;
        color: var(--theme-text-2);
      }
      .el-menu--inline {
        // width: 202px;
        width: 188px;
        padding-left: 0;
        padding-right: 0;
        // padding-left: 38px;
        .el-menu-item {
          width: 188px;
          padding-left: 40px;
          .gva-menu-item-title {
            margin-left: 0;
          }
          >div {
            display: flex;
            align-items: center;
            width: 100%;
            span {
              overflow: hidden;
              width: 100%;
              user-select: none;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            i {
              width: 14px;
              height: 14px;
              margin: 0;
              color: #959595;
            }
          }
        }
      }
    }
    &.el-menu--collapse {
      display: flex;
      flex-direction: column;
      width: 72px;
      .el-menu-item,
      .el-sub-menu__title {
        justify-content: center;
        width: 32px;
        padding: 0;
      }
      .el-sub-menu {
        width: 32px;
        height: 32px;
        &:not(.is-opened).is-active {
          background-color: var(--theme-primary-soft);
          // color: var(--theme-text);
          .iconfont {
            color: var(--theme-primary) !important;
          }
        }
      }
      .el-menu-item [class^="el-icon"] {
        margin-right: 0;
      }
      .el-menu-item.is-active {
        background-color: var(--theme-primary-soft);
        color: var(--theme-primary);
      }
      .el-sub-menu__title:hover {
        background-color: var(--theme-primary-soft);
      }
    }
  }
  .list-el-menu {
    :deep(.gva-menu-item) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      span {
        width: 89px !important;
      }
      i {
        margin-right: 4px !important;
      }
    }
  }
  .AILogo {
    // display: none;
    margin-top: 16px;
    margin-bottom: 0;
    padding-left: 12px;
    padding-right: 12px;
    &.AILogo2 {
      display: none;
      margin-top: -12px;
    }
    &.AILogo3 {
      display: none;
      margin-top: -12px;
    }
    .aiLogo-content {
      display: flex;
      align-items: center;
      height: 42px;
      padding-left: 20px;
      // padding-left: 13px;
      border-radius: 42px;
      background: linear-gradient(111deg, #ebf0ff 0%, #efebff 100%);
      cursor: pointer;
      &.isCollapse {
        padding-left: 13px;
      }
      .img1 {
        width: 21px;
        height: 17px;
      }
      .img2 {
        width: 131px;
        margin-left: 5px;
      }
      .text {
        margin-left: 6px;
        font-style: italic;
        font-weight: 600;
        font-size: 20px;
        color: var(--theme-primary);
      }
    }
  }
  .homeFooter {
    display: flex;
    // justify-content: center;
    box-sizing: border-box;
    margin-top: 24px;
    margin-bottom: 48px;
    padding-left: 20px;
    cursor: pointer;

    .el-avatar {
      width: 32px;
      height: 32px;
    }

    &.homeFooter-expand {
      display: flex;
      align-items: center;
      .name {
        overflow: hidden;
        max-width: 120px;
        margin-left: 16px;
        text-overflow: ellipsis;
        font-weight: 500;
        font-size: 16px;
        white-space: nowrap;
      }
    }
    .headerInfo {
      display: flex;
      align-items: center;
    }
  }
}
.toBeDoneContaienr {
  display: flex;
  position: relative;
  align-items: center;
  height: 40px;
  margin-top: 24px;
  padding-left: 18px;
  border-radius: 4px 4px 4px 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: rgba(54, 112, 248, 0.05);
  }
  .text {
    flex: 1;
    width: 0;
    margin-left: 8px;
    font-weight: 400;
    font-size: 14px;
    color: #585858;
    white-space: nowrap;
  }
  .notice {
    display: flex;
    position: absolute;
    right: -2px;
    top: 2px;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 12px;
    border-radius: 6px 6px 6px 0;
    background: #ff4e4e;
    font-size: 8px;
    color: #fff;
  }
  .count {
    font-weight: 500;
    font-size: 14px;
    color: #ff4e4e;
  }
}
</style>
<style lang="scss">
.drawer-box {
  position: initial !important;
}
.homeDrawer {
  width: 224px !important;
  box-shadow: 4px 0 16px 0 rgba(0, 0, 0, 0.12);
  .el-scrollbar__wrap {
    .el-scrollbar__view {
      overflow-x: hidden;
    }
  }
  .el-drawer__body {
    overflow-x: hidden;
    padding: 0;
  }
  &.is-collapse {
    width: 72px !important;
    box-shadow: none;
  }
  .gva-subMenu {
    display: flex;
    align-items: center;
  }
  .svg-icon {
    width: 32px;
    height: 32px;
  }
}
.el-overlay {
  .el-overlay-dialog {
    .changePasswordDialog {
      // height: 480px;
      padding: 0;
      .el-dialog__body {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 0 24px 24px 24px !important;
        // .el-form {
        //   .errorMsg {
        //     // margin-top: 1px;
        //     line-height: 15px;
        //     font-size: 12px;
        //     color: #f56c6c;
        //   }
        // }
        .el-form-item {
          margin-bottom: 16px;
          &:nth-of-type(4) {
            &.is-error {
              margin-bottom: 64px;
            }
          }
          &:last-child {
            margin-bottom: 0;
          }
          &.hasEye {
            .el-form-item__content {
              position: relative;
              .iconfont {
                position: absolute;
                right: 16px;
                cursor: pointer;
                color: var(--theme-text-3);
              }
              .icon-biyan {
                font-size: 8px;
              }
              .icon-zhengyan {
                font-size: 10px;
              }
            }
          }
          &.is-error {
            margin-bottom: 45px;
            .el-form-item__error {
              height: auto;
              min-height: 20px;
              padding-top: 12px;
              padding-bottom: 13px;
              line-height: 20px;
            }
          }
          &.confirmPassword {
            &.is-error {
              margin-bottom: 30px;
            }
          }
          .el-form-item__label {
            position: relative;
            height: 40px;
            margin-right: 14px;
            padding-right: 0;
            line-height: 40px;
            text-align: left;
            font-family: Source Han Sans;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text);
          }
          .el-form-item__content {
            width: 292px;
            // height: 40px;
            // line-height: 40px;
            color: var(--theme-text);
            .el-input,
            .el-select {
              height: 100%;
              line-height: 100%;
              font-size: 14px;
              .el-input__wrapper {
                height: 100%;
              }
            }
          }
        }
      }
      .el-dialog__footer {
        height: 56px;
      }
    }
  }
}
.menuDivider {
  width: calc(100% - 36px);
  margin: 24px 18px 6px 18px;
  border-top: 1px solid #d8d8d8;
  // border-top: 1px solid rgba(255, 255, 255, 0.2);
}
.darkTheme {
  .menuDivider {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
}
// .el-popper {
//   ul>[role="menuitem"] {
//     padding-left: 130px !important;
//     background-color: red !important;
//     .gva-menu-item {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       width: 100%;
//       background-color: red !important;
//       i {
//         width: 16px !important;
//         height: 16px !important;
//         padding-left: 6px;
//         background-color: red !important;
//         color: #959595;
//       }
//     }
//   }
// }

/* ===================== 新版侧边栏（品牌头 + 工作区分组） ===================== */
.homeMenu {
  .menuTitle {
    display: flex;
    align-items: center;
    height: 68px;
    padding: 0 18px;
    border-bottom: 1px solid var(--theme-border);

    .brandArt {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      line-height: 1.15;
      white-space: nowrap;
      user-select: none;

      .brandArtMain {
        font-family: 'STKaiti', 'KaiTi', 'Songti SC', 'PingFang SC', 'Microsoft YaHei', serif;
        font-size: 21px;
        font-weight: 700;
        letter-spacing: 3px;
        color: var(--theme-text);
        background: linear-gradient(100deg, var(--theme-text) 0%, var(--theme-primary) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .brandArtSub {
        padding-left: 2px;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 5px;
        color: var(--theme-text-2);
      }

      &.brandArtMini {
        align-items: center;
        font-family: 'STKaiti', 'KaiTi', 'Songti SC', 'PingFang SC', 'Microsoft YaHei', serif;
        font-size: 15px;
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: 2px;
        color: var(--theme-text);
        background: linear-gradient(100deg, var(--theme-text) 0%, var(--theme-primary) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }

  .menuSectionLabel {
    padding: 16px 22px 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-text-2);
    letter-spacing: 0.5px;
  }

  :deep(.el-menu-vertical) {
    padding: 0 10px;
    border-right: none;
    background: transparent;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 42px;
    margin: 2px 0;
    border-radius: 8px;
    line-height: 42px;
    font-size: 14px;
    color: var(--theme-text-2);
  }

  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background: var(--theme-fill);
    color: var(--theme-primary);
  }

  :deep(.el-menu-item.is-active) {
    background: var(--theme-primary-soft);
    font-weight: 600;
    color: var(--theme-primary);
  }

}
</style>
