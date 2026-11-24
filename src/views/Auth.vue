<template>
  <div class="authDiv" :style="{ backgroundImage: `url(${authBg})` }">
    <div class="mainDiv">
      <img class="auth-title" :src="loginTitleLogo" />
      <div class="medical-auth">
        <div class="medical-auth_box">
          <div class="certificationInProgress" v-if="isAuthIng">
            <span class="message">跳转登录认证中, 请稍后</span>
            <div class="loader">Loading...</div>
          </div>
          <div class="authenticationFailed" v-else>
            <span class="message">对不起！<br/>您的登录认证未通过！</span>
            <span class="tips">若您需要使用，请点击下方按钮进行操作</span>
            <el-button type="primary" class="authBtn" @click="goAuth(true)">重新认证</el-button>
            <div class="toLoginBtn" @click="toLogin">
              <span>跳转本系统账号密码登录</span>
              <i class="iconfont icon-tiaozhuan-1"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog class="authentication-dialog" v-model="showDialog" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :before-close="handleClose">
      <authentication @handleClose="handleClose" :status="authenticationStatus" :otherAuthenticationInfo="otherAuthenticationInfo" v-if="showDialog"/>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAuthUrl, ssoLogin } from '@/api/api_user'
import router from '@/router'
import { storeToken } from '@/utils/crypto'
import { useUserStore } from '@/store/user'
import { getLicenseFilterInfo } from '@/api/jiancanAPI/api_license'
import { useModeStore } from '@/store/modeStore'
import authentication from '@/components/authentication/login-authentication.vue'
import authBg from '@/assets/authBg.jpeg'
import loginTitle from '@/assets/cdc-login-title.png'
import { setFavicon } from '@/utils/setIco'
const userStore = useUserStore()
const modeStore = useModeStore()
const isAuthIng = ref(true) // 认证中
const loginTitleLogo = ref(loginTitle)
const showDialog = ref(false)
const authenticationStatus = ref(1)
const otherAuthenticationInfo = reactive({
  effectiveTime: '',
  fileName: ''
})
const getLicenseInfo = () => {
  getLicenseFilterInfo().then((res) => {
    if (res.code === 10000) {
      if (res.data.enableLicenseFilter) { // 医院端
        if (res.data.authStatus === 0) { // 认证状态 0 未认证 1 已认证 2 已过期
          authenticationStatus.value = 1
          showDialog.value = true
        } else if (res.data.authStatus === 2) {
          authenticationStatus.value = 5
          otherAuthenticationInfo.effectiveTime = res.data.effectiveTime
          otherAuthenticationInfo.fileName = res.data.fileName
          showDialog.value = true
        }
      }
    }
  })
}
getLicenseInfo()

const clearLocalStprage = () => {
  const lastVersion = localStorage.getItem('lastVersion')
  const referer = localStorage.getItem('referer')
  const threeDataFileData = localStorage.getItem('threeDataFileData')
  localStorage.clear()
  localStorage.setItem('lastVersion', lastVersion)
  if (referer) {
    localStorage.setItem('referer', referer)
  }
  if (threeDataFileData) {
    localStorage.setItem('threeDataFileData', threeDataFileData)
  }
}
// 清空localStorage
clearLocalStprage()

const handleClose = () => {
  showDialog.value = false
}

const toLogin = () => {
  localStorage.removeItem('isAuthLogin')
  router.push({ name: 'login' })
}

const goAuth = (type = false) => {
  const referer = localStorage.getItem('referer') || ''
  isAuthIng.value = true
  const searchParams = new URLSearchParams(window.location.search)
  const code = searchParams.get('code')
  if (!code || type) {
    const { origin, pathname } = window.location
    const url = origin + pathname
    getAuthUrl({ redirectUri: url }).then((res) => {
      if (res.code === 10000) {
        window.location.replace(res?.data)
      }
    }).catch(() => {
      isAuthIng.value = false
    })
  } else {
    ssoLogin({ code, referer }).then((res) => {
      if (res.code === 10000) {
        storeToken(res.data.token)
        localStorage.setItem('user_id', res.data.id)
        localStorage.setItem('account', res.data.account) // 用户账号
        userStore.setUsername(res.data.userName)
        modeStore.setMode('light')
        const isTreeData = localStorage.getItem('threeDataFileData')
        router.push({ name: isTreeData ? 'dataSetLibrary' : 'home' })
      } else {
        isAuthIng.value = false
      }
    }).catch(() => {
      isAuthIng.value = false
    })
  }
}

const locaSetThreeDatafileData = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const jsonPath = searchParams.get('jsonPath')
  // 三方数据源
  if (jsonPath) {
    localStorage.setItem('threeDataFileData', JSON.stringify({
      jsonName: decodeURIComponent(searchParams.get('jsonName') || ''),
      jsonPath: decodeURIComponent(searchParams.get('jsonPath') || ''),
      dataRows: decodeURIComponent(searchParams.get('dataRows') || ''),
      dataColumns: decodeURIComponent(searchParams.get('dataColumns') || '')
    }))
  }
}

onMounted(() => {
  locaSetThreeDatafileData() // 存储三方数据源
  setFavicon('../static/sd-cdc.ico', '疾病监测与公共卫生数据分析平台') // 定制ico图
  const currentOrigin = window.location.origin
  const referer = document.referrer
  if (referer && new URL(referer).origin !== currentOrigin) {
    localStorage.setItem('referer', referer || '')
  }
  localStorage.setItem('isAuthLogin', true)
  goAuth(false)
})
</script>
<style scoped lang="scss">
.authDiv {
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
  .mainDiv {
    display: flex;
    position: relative;
    align-items: center;
    width: 100%;
    height: 100%;
    .auth-title {
      position: absolute;
      left: 50px;
      top: 50px;
      width: 300px;
    }
    .medical-auth {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      height: 427px;
      margin-right: 170px;
      .medical-auth_box {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 716px;
        height: 100%;
        padding-left: 55px;
        background: var(--theme-card);
        .message {
          line-height: 50px;
          font-weight: 700;
          font-size: 34px;
          color: var(--theme-text);
        }
        .certificationInProgress {
          display: flex;
          .loader,
          .loader::before,
          .loader::after {
            width: 1em;
            height: 1em;
            border-radius: 50%;
            -webkit-animation: loding 1.8s infinite ease-in-out;
            animation: loding 1.8s infinite ease-in-out;
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
          }
          .loader {
            position: relative;
            margin-left: 20px;
            margin-top: 11px;
            text-indent: -9999em;
            font-size: 10px;
            color: #000;
            -webkit-transform: translateZ(0);
            -ms-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-animation-delay: -0.16s;
            animation-delay: -0.16s;
          }
          .loader::before,
          .loader::after {
            position: absolute;
            top: 0;
            content: '';
          }
          .loader::before {
            left: -14px;
            -webkit-animation-delay: -0.32s;
            animation-delay: -0.32s;
          }
          .loader::after {
            left: 14px;
          }

          @-webkit-keyframes loding {
            0%,
            80%,
            100% {
              box-shadow: 0 1em 0 -1em;
            }
            40% {
              box-shadow: 0 1em 0 0;
            }
          }

          @keyframes loding {
            0%,
            80%,
            100% {
              box-shadow: 0 1em 0 -1em;
            }
            40% {
              box-shadow: 0 1em 0 0;
            }
          }
        }
        .authenticationFailed {
          display: flex;
          flex-direction: column;
          margin-left: 10px;
          .tips {
            margin: 14px 0 32px 0;
            font-weight: 400;
            font-size: 26px;
            color: var(--theme-text-2);
          }
          .authBtn {
            width: 246px;
            height: 43px;
            margin-bottom: 16px;
            font-size: 20px;
          }
          .toLoginBtn {
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 18px;
            color: var(--theme-primary);
            .iconfont {
              margin-left: 10px;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
:deep(.authentication-dialog) {
  overflow: hidden;
  width: 716px;
  height: 432px;
  margin-bottom: 0;
  padding: 0;
  .el-dialog__header {
    display: none !important;
  }
  .el-dialog__body {
    height: 100%;
    padding: 0 !important;
  }
}
</style>
