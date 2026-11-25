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
        <div class="loginColumn">
          <div class="medical-login_box">
            <!--登录 start-->
            <div class="medical-login_form">
              <div class="loginNav">
                <span class="loginNavTitle">{{ isPhoneMode ? '登录/注册' : '账号密码登录' }}</span>
                <p class="loginNavSub">{{ isPhoneMode ? '手机号验证码登录，未注册账号将自动创建' : '使用账号与密码登录工作台' }}</p>
              </div>

              <div class="loginTabs">
                <span
                  :class="{ 'is-active': isPhoneMode }"
                  @click="switchLoginMode('phone')">
                  手机验证码登录
                </span>
                <span
                  :class="{ 'is-active': !isPhoneMode }"
                  @click="switchLoginMode('password')">
                  账号密码登录
                </span>
              </div>

              <!-- 手机验证码登录 -->
              <template v-if="isPhoneMode">
                <el-form
                  ref="phoneFormRef"
                  :model="phoneForm"
                  :rules="phoneRules"
                  :hide-required-asterisk="true"
                  class="login-form"
                  @submit.prevent
                >
                  <el-form-item prop="phone" class="accountInput">
                    <el-input
                      v-model.trim="phoneForm.phone"
                      maxlength="11"
                      autocomplete="off"
                      placeholder="请输入手机号"
                    ></el-input>
                  </el-form-item>
                  <el-form-item prop="code">
                    <div class="codeRow">
                      <el-input
                        v-model.trim="phoneForm.code"
                        maxlength="6"
                        autocomplete="off"
                        placeholder="请输入短信验证码"
                        @keyup.enter="submitPhone"
                      ></el-input>
                      <el-button class="codeBtn" :disabled="counting" @click="sendCode">
                        {{ counting ? countdown + 's 后重发' : '获取验证码' }}
                      </el-button>
                    </div>
                  </el-form-item>
                </el-form>

                <div class="agreeCheck">
                  <el-checkbox v-model="agreed" />
                  <span class="agreeText">我已阅读并同意</span>
                  <span class="agreeLink" @click="handleAgreement('agreement')">《用户协议》</span>
                  <span class="agreeText">和</span>
                  <span class="agreeLink" @click="handleAgreement('privacy')">《隐私政策》</span>
                </div>

                <div
                  class="btn-login"
                  :class="{ active: phoneReady }"
                  @click="submitPhone">
                  登录/注册
                </div>
                <p class="phoneDemoTip">演示环境：短信验证码固定为 123456</p>
              </template>

              <!-- 账号密码登录 -->
              <template v-else>
                <el-form
                  ref="ruleFormRef"
                  :model="loginForm"
                  :rules="rules"
                  :hide-required-asterisk="true"
                  class="login-form"
                  @submit.prevent
                >
                  <el-form-item prop="account" class="accountInput">
                    <el-input
                      v-focus
                      v-model.trim="loginForm.account"
                      autocomplete="off"
                      placeholder="请输入账号ID"
                    ></el-input>
                  </el-form-item>
                  <el-form-item prop="password">
                    <el-input
                      v-model="loginForm.password"
                      :type="showEye ? 'password' : 'text'"
                      placeholder="请输入密码"
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
              </template>
            </div>
          </div>

          <!-- 演示账号：放在登录框外，切换登录方式不影响卡片高度 -->
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
            <div class="demoAccountsTip">演示环境：短信验证码固定为 123456</div>
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { emitter } from '@/utils/bus'
import { storeToken } from '@/utils/crypto'
import { useUserStore } from '@/store/user'
import { useModeStore } from '@/store/modeStore'
import { approveApplication, resetApplication } from '@/utils/onboarding'
import authentication from '@/components/authentication/login-authentication.vue'
import loginBgDefault from '@/assets/login-bg2.png'
import brandLockup from '@/assets/brand/brand-lockup.png'
import loginText from '@/assets/loginText.png'
import { setFavicon } from '@/utils/setIco'
import PrivacyPolicy from './PrivacyPolicy.vue'
import UserAgreement from './UserAgreement.vue'

const userStore = useUserStore()
const modeStore = useModeStore()

const systemName = ref(userStore.platInfo.systemName || '颐邦小源医学专家平台')
const loginBg = ref(userStore.platInfo.loginLogo || loginBgDefault)
const loginTitleLogo = ref(userStore.platInfo.loginTitle || brandLockup)
const loginForm = reactive({
  account: '',
  password: ''
})

// ===== 登录方式：手机验证码 / 账号密码 =====
const loginMode = ref('phone')
const isPhoneMode = computed(() => loginMode.value === 'phone')
const switchLoginMode = (mode) => { loginMode.value = mode }

const phoneFormRef = ref()
const phoneForm = reactive({ phone: '', code: '' })
const phoneRules = {
  phone: [
    { required: true, message: '请填写手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号应为 11 位数字', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请填写短信验证码', trigger: 'blur' }]
}
// 演示环境：短信验证码固定为 123456
const DEMO_SMS_CODE = '123456'
const agreed = ref(false)
const counting = ref(false)
const countdown = ref(60)
let countdownTimer = null

const phoneReady = computed(() => /^1\d{10}$/.test(phoneForm.phone) && phoneForm.code.length >= 4)

const sendCode = () => {
  if (!/^1\d{10}$/.test(phoneForm.phone)) {
    ElMessage.warning('请先填写 11 位手机号')
    return
  }
  if (counting.value) return
  counting.value = true
  countdown.value = 60
  ElMessage.success('验证码已发送（演示环境固定为 123456）')
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      counting.value = false
    }
  }, 1000)
}

onBeforeUnmount(() => clearInterval(countdownTimer))

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
  setFavicon('/static/brand-logo.png', systemName.value)
  emitter.on('showLoading', () => {})
  emitter.on('closeLoading', () => {
    loadingFlag.value = false
  })
})

// ===== 演示账号 =====
// admin：全模块可用（入驻状态直接置为已通过）
// zhuanjia：专家演示账号，已入驻，但仅展示 5 个专家相关一级菜单
// guest：每次登录都回到「未入驻」，必须先填入驻申请
const DEMO_ACCOUNTS = [
  { account: 'admin', password: '123456', role: 'full', desc: '全部模块可用' },
  { account: 'zhuanjia', password: '123456', role: 'expert', desc: '专家账号 · 仅 5 个模块' },
  { account: 'guest', password: '123456', role: 'newbie', desc: '每次登录都需入驻申请' }
]

// 点击提示条快速填入
const fillDemoAccount = (item) => {
  loginForm.account = item.account
  loginForm.password = item.password
}

// ===== Mock 登录：绕过后端直接预览 =====
const doLogin = ({ account, role = 'newbie', displayName }) => {
  loadingFlag.value = true
  // full / expert 都视为已入驻，只有 newbie 每次回到未提交
  if (role === 'newbie') {
    resetApplication()
  } else {
    approveApplication()
  }
  localStorage.setItem('cot-login-role', role)
  // 重置入驻引导标记，保证每次登录首页都会提醒一次
  sessionStorage.removeItem('cot-onboard-landed')
  sessionStorage.removeItem('cot-onboard-guide-shown')
  storeToken('mock-token-for-preview')
  localStorage.setItem('user_id', role === 'full' ? 'mock-user-id' : `mock-user-${account}`)
  localStorage.setItem('account', account)
  localStorage.setItem('mockLogin', 'true')
  const defaultName = role === 'full' ? '演示账号 · 全模块' : role === 'expert' ? '张慧敏' : `${account}（待入驻）`
  userStore.setUsername(displayName || defaultName)
  userStore.needCheckPermission = false
  // 沿用用户上次选择的外观风格
  modeStore.initTheme()
  router.push({ name: 'home' })
}

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      const account = String(loginForm.account || '').trim()
      const lower = account.toLowerCase()
      const matched = DEMO_ACCOUNTS.find(item => item.account.toLowerCase() === lower)
      const role = matched?.role || (['admin', 'full'].includes(lower) ? 'full' : 'newbie')
      doLogin({ account: account || 'admin', role })
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 手机验证码登录：未注册手机号自动创建账号（走未入驻流程）
const submitPhone = async () => {
  if (!agreed.value) {
    ElMessage.warning('请先勾选《用户协议》和《隐私政策》')
    return
  }
  await phoneFormRef.value.validate((valid, fields) => {
    if (!valid) {
      console.log('error submit!', fields)
      return
    }
    if (phoneForm.code !== DEMO_SMS_CODE && phoneForm.code.length !== 6) {
      ElMessage.error('验证码不正确或已过期，请重新获取')
      return
    }
    const phone = phoneForm.phone
    doLogin({ account: phone, role: 'newbie', displayName: `${phone.slice(0, 3)}****${phone.slice(-4)}` })
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
      min-height: 562px;
      margin-right: 141px;
      margin-bottom: 2px;
      .medical-login_box {
        flex: none;
        box-sizing: border-box;
        width: 509px;
        height: 500px;
        padding: 34px 44px 28px 45px;
        border: 2px solid #fff;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.5);
        .medical-login_form {
          .loginNav {
            margin: 0 auto 18px;
            text-align: center;

            .loginNavTitle {
              cursor: default;
              font-weight: 700;
              font-size: 26px;
              color: #262626;
            }

            .loginNavSub {
              margin: 8px 0 0;
              line-height: 20px;
              font-size: 13px;
              color: #8a94a6;
            }
          }

          /* 登录方式切换 */
          .loginTabs {
            display: flex;
            margin-bottom: 20px;
            padding: 4px;
            border-radius: 8px;
            background: #eef1f6;

            span {
              flex: 1;
              height: 38px;
              border-radius: 6px;
              cursor: pointer;
              line-height: 38px;
              text-align: center;
              font-size: 14px;
              color: #5a6678;
              transition: all 0.2s;

              &.is-active {
                background: #fff;
                box-shadow: 0 2px 6px rgba(31, 58, 105, 0.12);
                font-weight: 600;
                color: var(--theme-primary);
              }
            }
          }

          /* 短信验证码一行 */
          .codeRow {
            display: flex;
            width: 100%;
            gap: 10px;

            :deep(.el-input) {
              flex: 1;
            }

            .codeBtn {
              flex: none;
              width: 118px;
              height: 40px;
              border-color: var(--theme-primary-border);
              font-size: 13px;
              color: var(--theme-primary);

              &.is-disabled {
                border-color: #e2e8f2;
                color: #a3abbd;
              }
            }
          }

          /* 协议勾选 */
          .agreeCheck {
            display: flex;
            align-items: center;
            margin-top: 12px;
            font-size: 12.5px;
            color: #8a94a6;

            :deep(.el-checkbox) {
              height: auto;
              margin-right: 2px;
            }

            .agreeText {
              line-height: 20px;
            }

            .agreeLink {
              cursor: pointer;
              color: var(--theme-primary);
            }
          }

          .phoneDemoTip {
            margin: 8px 0 0;
            text-align: center;
            font-size: 12px;
            color: #a3abbd;
          }

          /* 或 */
          .orLine {
            display: flex;
            align-items: center;
            margin: 16px 0;
            font-size: 12px;
            color: #a8b0be;
            gap: 12px;

            &::before,
            &::after {
              flex: 1;
              height: 1px;
              background: #e7ecf5;
              content: '';
            }
          }

          /* 统一认证登录 */
          .authBtn {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 44px;
            border: 1px solid var(--theme-primary-border);
            border-radius: 4px;
            background: #fff;
            cursor: pointer;
            font-size: 14px;
            color: var(--theme-primary);
            transition: all 0.2s;

            &:hover {
              background: var(--theme-primary-soft);
            }
          }

          /* 两个登录方式共用同一套字段尺寸 */
          .login-form {
            width: 100%;

            :deep(.el-input__wrapper) {
              height: 46px;
            }

            :deep(.el-input__inner) {
              height: 46px;
              font-size: 15px;
            }
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

/* 右侧登录列：卡片 + 卡片外的演示账号 */
.loginColumn {
  display: flex;
  flex-direction: column;
  flex: none;
  width: 509px;
  gap: 14px;
}

/* 演示账号（登录框外） */
.loginDiv .demoAccounts {
  padding: 16px 20px;
  border: 1px dashed #b9cdf7;
  border-radius: 10px;
  background: rgba(54, 112, 248, 0.05);
}

.loginDiv .demoAccountsTitle {
  margin-bottom: 10px;
  font-size: 15px;
  color: #7f8899;
}

.loginDiv .demoAccountItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  line-height: 22px;

  &:hover {
    background: rgba(54, 112, 248, 0.08);
  }
}

.loginDiv .demoAccountName {
  font-weight: 600;
  font-size: 16px;
  color: var(--theme-primary);
}

.loginDiv .demoAccountDesc {
  font-size: 14px;
  color: #8a94a6;
}

.loginDiv .demoAccountsTip {
  margin-top: 10px;
  padding-top: 9px;
  border-top: 1px dashed rgba(54, 112, 248, 0.25);
  font-size: 13px;
  color: var(--theme-text-2);
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
    background-color: var(--theme-bg) #f8f9fa;

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
