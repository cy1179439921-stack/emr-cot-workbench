<template>
  <div class="loginDiv">
    <div
      class="mainDiv"
      v-loading="loadingFlag"
      element-loading-text="登录中，请稍候..."
    >
      <div class="medical-login-left">
        <span class="title">{{systemName}}</span>
        <img :src="loginLogo" />
      </div>
      <div class="medical-login-right" key="form">
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
              label-width="0px"
              class="userinfo"
              @submit.prevent
            >
              <el-form-item prop="account" class="phoneInput">
                <el-input
                  v-model="loginForm.account"
                  autocomplete="off"
                  placeholder="账号ID"
                ></el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  :type="showEye ? 'password' : 'text'"
                  placeholder="密码"
                  autocomplete="off"
                  @keyup.enter="submitForm(ruleFormRef)"
                ></el-input>
                <i
                  :class="
                    showEye
                      ? 'iconfont icon-yincangmima'
                      : 'iconfont icon-xianshimima'
                  "
                  @click="showEye = !showEye"
                ></i>
              </el-form-item>
            </el-form>
            <div
              class="btn-login"
              :class="
                loginForm.account !== '' && loginForm.password !== ''
                  ? 'active'
                  : ''
              "
              @click="submitForm(ruleFormRef)"
            >
              登 录
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
import { login } from '@/api/api_user'
// import { useIndexStore } from '@/store'
import router from '@/router'
import { emitter } from '@/utils/bus'
import { storeToken } from '@/utils/crypto'
import { useUserStore } from '@/store/user'
import { getLicenseFilterInfo } from '@/api/jiancanAPI/api_license'
const userStore = useUserStore()
import { useModeStore } from '@/store/modeStore'
import authentication from '@/components/authentication/login-authentication.vue'
import loginBg from '@/assets/login-bg.png'
const modeStore = useModeStore()
// 自定义require方法
// const myRequire = (name) =>
//   new URL(`/src/assets/${name}.png`, import.meta.url).href
const loginForm = reactive({
  account: '',
  password: ''
})
const systemName = ref(userStore.platInfo.systemName || 'iDL 颐智湖')
const loginLogo = ref(userStore.platInfo.loginLogo || loginBg)
const showEye = ref(true)
const ruleFormRef = ref()
const rules = reactive({
  account: [{ required: true, message: '请填写用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请填写密码', trigger: 'blur' }]
})
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
// const configUrlArr = ref([])
const clearLocalStprage = () => {
  const lastVersion = localStorage.getItem('lastVersion')
  localStorage.clear()
  localStorage.setItem('lastVersion', lastVersion)
}
// 清空localStorage
clearLocalStprage()
const loadingFlag = ref(false)

onMounted(() => {
  emitter.on('showLoading', () => {
    // loadingFlag.value = true
  })
  emitter.on('closeLoading', () => {
    loadingFlag.value = false
  })
  // if (userStore.loadingInstance) {
  //   userStore.loadingInstance.close()
  // }
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      loadingFlag.value = true
      const params = {
        password: loginForm.password,
        account: loginForm.account.trim()
      }
      login(params).then(async(res) => {
        if (res.code === 10000) {
          storeToken(res.data.token)
          localStorage.setItem('user_id', res.data.id)
          localStorage.setItem('account', res.data.account) // 用户账户
          userStore.setUsername(res.data.userName)
          modeStore.setMode('light')
          router.push({ name: 'home' })
        }
      })
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

  .mainDiv {
    display: flex;
    width: 100%;
    height: 100%;

    .medical-login-left {
      position: relative;
      width: 50%;
      height: 100%;
      background: rgba(55, 138, 255, .05);

      @extend .flexCenter;

      .title {
        position: absolute;
        left: 32px;
        top: 33px;
        font-weight: 600;
        font-size: 32px;
        color: #262626;
      }
      img {
        max-width: 600px;
      }
    }

    .medical-login-right {
      display: flex;
      justify-content: space-around;
      align-items: center;
      width: 50%;
      height: 100%;
      background-color: rgba(255, 255, 255, .8);
      .el-input--medium .el-input__icon {
        color: #000 !important;
      }

      .medical-login_box {
        width: 368px;
        padding: 40px;
        box-shadow: 2px 3px 7px rgba(0, 0, 0, .2);
        .medical-login_form {
          .loginNav {
            display: flex;
            justify-content: space-between;
            margin: 0 auto;
            margin-bottom: 50px;

            span {
              cursor: pointer;
              font-weight: 600;
              font-size: 24px;
              color: #262626;
            }
          }

          .userinfo {
            width: 100%;

            .el-form-item {
              margin-bottom: 0;
              :deep(.el-input__wrapper) {
                height: 40px;
              }
            }
            .phoneInput {
              margin-bottom: 32px;

              .verify {
                background: #91b9cd;
                color: #fff;
              }
            }

            :deep(.el-form-item) {
              border-radius: 100%;
              background-color: var(--theme-fill);

              .el-form-item__content {
                position: relative;

                .icon-xianshimima,
                .icon-yincangmima {
                  position: absolute;
                  right: 0;
                  top: 5px;
                  padding: 0 20px;
                  opacity: .3;
                  cursor: pointer;
                  font-size: 16px;
                  color: #141414;
                }
              }
            }

            :deep(.el-input__inner) {
              height: 36px;
              line-height: 36px;
              color: #000 !important;
              // border-radius: 4px;
            }
          }

          .btn-login {
            height: 40px;
            margin: 24px 0;
            background-color: #3670f8;
            opacity: .5;
            cursor: pointer;
            line-height: 40px;
            text-align: center;
            font-weight: 500;
            font-size: 16px;
            color: #fff;

            &.active {
              opacity: 1;
            }
          }

          :deep(.el-input--medium .el-input__inner) {
            font-size: 14px;
          }

          .el-checkbox {
            color: #fff;
          }
        }
      }

      :deep(.el-input--medium .el-input__icon) {
        color: #c5cae2;
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
