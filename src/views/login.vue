<template>
  <div class="loginDiv" :style="{ backgroundImage: `url(${loginBg})` }">
    <div
      class="mainDiv"
      v-loading="loadingFlag"
      element-loading-text="登录中，请稍候..."
    >
      <img class="login-title" :src="loginTitleLogo" />
      <img class="loginText" alt="" :src="loginText">
      <div class="medical-login">
        <div class="medical-login_box">
          <!--登录 start-->
          <div class="medical-login_form">
            <div class="loginNav">
              <span>账号密码登录</span>
            </div>
            <el-form
              ref="ruleFormRef"
              :model="loginForm"
              :rules="rules"
              :hide-required-asterisk="true"
              class="login-form"
              @submit.prevent
            >
              <el-form-item prop="account" class="accountInput" label="账号ID">
                <el-input
                  v-focus
                  v-model.trim="loginForm.account"
                  autocomplete="off"
                  placeholder="请填写账号ID"
                ></el-input>
              </el-form-item>
              <el-form-item prop="password" label="账号密码">
                <el-input
                  v-model="loginForm.password"
                  :type="showEye ? 'password' : 'text'"
                  placeholder="请填写账号密码"
                  autocomplete="off"
                  @keyup.enter="submitForm(ruleFormRef)"
                ></el-input>
                <i
                  :class="
                    showEye
                      ? 'iconfont icon-yincang'
                      : 'iconfont icon-xianshi'
                  "
                  @click="showEye = !showEye"
                ></i>
              </el-form-item>
            </el-form>
            <div class="agreement">
              登录视为您已阅读并同意
              <span @click="handleAgreement('agreement')">用户协议</span>
              和
              <span @click="handleAgreement('privacy')">隐私政策</span>
            </div>
            <div class="btn-login"
                 :class="loginForm.account !== '' && loginForm.password !== '' ? 'active' : ''"
                 @click="submitForm(ruleFormRef)">
              登 录
            </div>
            <!-- 演示账号：点击可快速填入 -->
            <div class="demoAccounts">
              <div class="demoAccountsTitle">演示账号（点击填入）</div>
              <div
                v-for="item in DEMO_ACCOUNTS"
                :key="item.account"
                class="demoAccountItem"
                @click="fillDemoAccount(item)"
              >
                <span class="demoAccountName">{{ item.account }} / {{ item.password }}</span>
                <span class="demoAccountDesc">{{ item.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 原有认证弹窗 -->
    <el-dialog class="authentication-dialog" v-model="showDialog" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :before-close="handleClose">
      <authentication @handleClose="handleClose" :status="authenticationStatus" :otherAuthenticationInfo="otherAuthenticationInfo" v-if="showDialog"/>
    </el-dialog>
    <UserAgreement :open="legalDialog === 'agreement'" @close="legalDialog = null" />
    <PrivacyPolicy :open="legalDialog === 'privacy'" @close="legalDialog = null" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import router from '@/router'
import { emitter } from '@/utils/bus'
import { storeToken } from '@/utils/crypto'
import { useUserStore } from '@/store/user'
import { useModeStore } from '@/store/modeStore'
import { approveApplication, resetApplication } from '@/utils/onboarding'
import authentication from '@/components/authentication/login-authentication.vue'
import loginBgDefault from '@/assets/login-bg2.png'
import loginTitle from '@/assets/login-title1.png'
import loginText from '@/assets/loginText.png'
import { setFavicon } from '@/utils/setIco'
import PrivacyPolicy from './PrivacyPolicy.vue'
import UserAgreement from './UserAgreement.vue'

const userStore = useUserStore()
const modeStore = useModeStore()

const systemName = ref(userStore.platInfo.systemName || '标注审阅工作台 · COT')
const loginBg = ref(userStore.platInfo.loginLogo || loginBgDefault)
const loginTitleLogo = ref(userStore.platInfo.loginTitle || loginTitle)
const loginForm = reactive({
  account: '',
  password: ''
})
const showEye = ref(true)
const ruleFormRef = ref()
const rules = reactive({
  account: [{ required: true, message: '请填写账号ID', trigger: 'blur' }],
  password: [{ required: true, message: '请填写密码', trigger: 'blur' }]
})
const showDialog = ref(false)
const authenticationStatus = ref(1)
const otherAuthenticationInfo = reactive({
  effectiveTime: '',
  fileName: ''
})

const clearLocalStorage = () => {
  const lastVersion = localStorage.getItem('lastVersion')
  // 外观风格属于个人偏好，重新登录时保留
  const modeStoreCache = localStorage.getItem('modeStore')
  localStorage.clear()
  if (lastVersion) localStorage.setItem('lastVersion', lastVersion)
  if (modeStoreCache) localStorage.setItem('modeStore', modeStoreCache)
}
clearLocalStorage()
const loadingFlag = ref(false)
const legalDialog = ref()

const handleAgreement = (type) => {
  legalDialog.value = type
}
// ----------------------------------------

onMounted(() => {
  setFavicon('../static/idl.ico', systemName.value)
  emitter.on('showLoading', () => {})
  emitter.on('closeLoading', () => {
    loadingFlag.value = false
  })
})

// ===== 演示账号 =====
// admin：全模块可用（入驻状态直接置为已通过）
// guest：每次登录都回到「未入驻」，必须先填入驻申请
const DEMO_ACCOUNTS = [
  { account: 'admin', password: '123456', role: 'full', desc: '全部模块可用' },
  { account: 'guest', password: '123456', role: 'newbie', desc: '每次登录都需入驻申请' }
]

// 点击提示条快速填入
const fillDemoAccount = (item) => {
  loginForm.account = item.account
  loginForm.password = item.password
}

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      loadingFlag.value = true
      // ===== Mock 登录：绕过后端直接预览 =====
      const account = String(loginForm.account || '').trim()
      const isFullAccount = ['admin', 'full'].includes(account.toLowerCase())
      // 全模块账号：入驻审核直接通过；其他账号：每次登录都重置为待入驻
      if (isFullAccount) {
        approveApplication()
      } else {
        resetApplication()
      }
      localStorage.setItem('cot-login-role', isFullAccount ? 'full' : 'newbie')
      // 重置入驻引导标记，保证每次登录首页都会提醒一次
      sessionStorage.removeItem('cot-onboard-landed')
      sessionStorage.removeItem('cot-onboard-guide-shown')
      storeToken('mock-token-for-preview')
      localStorage.setItem('user_id', isFullAccount ? 'mock-user-id' : `mock-user-${account}`)
      localStorage.setItem('account', account || 'admin')
      localStorage.setItem('mockLogin', 'true')
      userStore.setUsername(isFullAccount ? '演示账号 · 全模块' : `${account || '新专家'}（待入驻）`)
      userStore.needCheckPermission = false
      // 沿用用户上次选择的外观风格
      modeStore.initTheme()
      router.push({ name: 'home' })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const handleClose = () => {
  showDialog.value = false
}
</script>

<style scoped lang="scss">
.flexCenter {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loginDiv {
  width: 100%;
  height: 100%;
  background: url('/src/assets/login-bg2.png') no-repeat;
  background-position: center;
  background-size: cover;
  .mainDiv {
    display: flex;
    position: relative;
    align-items: center;
    width: 100%;
    height: 100%;

    .login-title {
      position: absolute;
      left: 51px;
      top: 33px;
      height: 40px;
    }
    .loginText {
      width: 585px;
      margin-left: 130px;
    }
    .medical-login {
      display: flex;
      position: relative;
      justify-content: flex-end;
      align-items: end;
      box-sizing: border-box;
      width: 100%;
      height: 562px;
      margin-right: 141px;
      margin-bottom: 2px;
      .medical-login_box {
        box-sizing: border-box;
        width: 509px;
        height: 100%;
        padding: 53px 44px 0 45px;
        border: 2px solid #fff;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.5);
        .medical-login_form {
          .loginNav {
            display: flex;
            justify-content: center;
            margin: 0 auto;
            margin-bottom: 44px;

            span {
              cursor: pointer;
              font-weight: 600;
              font-size: 30px;
              color: #262626;
            }
          }

          .login-form {
            width: 100%;
            :deep(.el-form-item) {
              display: flex;
              flex-direction: column;
              margin-bottom: 0;
              color: var(--theme-text);
              &.accountInput {
                margin-bottom: 29px;
              }
              .el-form-item__label {
                justify-content: flex-start;
                height: 29px;
                margin-bottom: 16px;
                line-height: 29px;
                font-weight: 500;
                font-size: 20px;
                color: #000;
              }
              .el-form-item__content {
                position: relative;

                .icon-xianshi,
                .icon-yincang {
                  position: absolute;
                  right: 0;
                  top: 10px;
                  padding: 0 20px;
                  cursor: pointer;
                  color: #979797;
                }
                .icon-xianshi {
                  font-size: 14px;
                }
                .icon-yincang {
                  font-size: 10px;
                }
                .el-form-item__error {
                  margin-top: 4px;
                  font-size: 14px;
                }
              }
            }
            :deep(.el-input__wrapper) {
              box-sizing: border-box;
              height: 100%;
              border: 1px solid #d9e4ff;
              border-radius: 4px;
              background-color: var(--theme-card);
              box-shadow: none;
            }

            :deep(.el-input__inner) {
              height: 50px;
              line-height: 50px;
              font-size: 16px;
              color: var(--theme-text) !important;
              &::placeholder {
                color: var(--theme-text-3);
              }
            }
          }

          .btn-login {
            height: 50px;
            margin: 36px 0 16px;
            border-radius: 4px;
            background-color: var(--theme-primary);
            opacity: .5;
            cursor: pointer;
            line-height: 50px;
            text-align: center;
            font-size: 18px;
            color: #fff;

            &.active {
              opacity: 1;
            }
          }

          /* 演示账号提示：点击即填入 */
          .demoAccounts {
            padding: 12px 14px;
            border: 1px dashed #b9cdf7;
            border-radius: 8px;
            background: rgba(54, 112, 248, 0.04);
          }

          .demoAccountsTitle {
            margin-bottom: 8px;
            font-size: 16px;
            color: #7f8899;
          }

          .demoAccountItem {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 6px;
            border-radius: 6px;
            cursor: pointer;
            line-height: 20px;

            &:hover {
              background: rgba(54, 112, 248, 0.08);
            }
          }

          .demoAccountName {
            font-weight: 600;
            font-size: 18px;
            color: var(--theme-primary);
          }

          .demoAccountDesc {
            font-size: 16px;
            color: var(--theme-text-3);
          }

          .text {
            text-align: center;
            font-size: 14px;
            color: #918f8f;
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

.agreement {
  margin-top: 29px;
  span {
    cursor: pointer;
    color: var(--theme-primary);
  }
}

/* 协议预览弹窗样式 */
:deep(.agreement-dialog) {
  border-radius: 8px;
  .el-dialog__body {
    padding: 15px 20px;
  }
  .agreement-content {
    overflow-y: auto;
    max-height: 60vh;
    padding: 10px 15px;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    background-color: var(--theme-bg)#f8f9fa;

    pre {
      margin: 0;
      line-height: 1.6;
      font-family: inherit;
      font-size: 14px;
      color: var(--theme-text);
      word-wrap: break-word;
      white-space: pre-wrap; /* 自动换行 */
    }
  }
}
</style>
