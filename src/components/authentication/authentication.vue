<template>
  <div class="authentication">
    <div class="authentication-content">
      <div class="top-div">
        <img class="logo" :src="myRequire('authentication.png')" />
        <img class="logo-text" :src="myRequire('authentication-text.png')">
        <img class="logo-text2" :src="myRequire('authentication-text2.png')">
      </div>
      <div class="bottom-div">
        <div class="info-div">
          <div class="info-title">
            <div class="title-flag"></div>
            <div class="title-text">产品认证</div>
          </div>
          <div class="left-upload">
            <el-upload
              class="myUpload"
              ref="uploadRef"
              drag
              action="#"
              :auto-upload="false"
              :limit="1"
              accept=".lic"
              :on-change="handleChange"
              v-model:file-list="fileList"
              v-show="fileListCopy.length === 0"
            >
              <!-- <el-icon class="el-icon--upload"><upload-filled /></el-icon> -->
              <img class="authentication-bg" :src="myRequire('authentication-bg.png')" />
              <img class="defaultLogo" :src="myRequire('el-upload.png')" />
              <div class="el-upload__text">
                <div>选择文件</div>
                <div>仅支持LIC文件，且不超过1M</div>
              </div>
            </el-upload>
            <div class="existFile" :class="'status' + authenticationStatus" v-show="fileListCopy.length > 0">
              <img class="logo" :src="myRequire('licImg.png')" />
              <div class="existFile-info">
                <div>
                  <el-tooltip :content="fileListCopy[0]?.name" placement="top">
                    <div class="content-ellipsis">{{fileListCopy.length > 0? fileListCopy[0].name : ''}}</div>
                  </el-tooltip>
                  <div class="validityDate" v-if="authenticationStatus === 4 || authenticationStatus === 5">当前认证有效期：{{validityDate}}</div>
                </div>
                <div v-if="size && (authenticationStatus === 1 || authenticationStatus === 2)">{{fileListCopy.length > 0? size : ''}}</div>
              </div>

              <div class="changeFile" @click="changeFile" v-if="[1,2,3].includes(authenticationStatus)">更换证书</div>

              <div class="fail-info flexCenter" v-if="[3, 5].includes(authenticationStatus)">
                <i class="iconfont icon-a-dankuang-renzhengshibaitishi"></i>
                <span v-if="authenticationStatus === 3">认证失败</span>
                <span v-if="authenticationStatus === 5">认证过期</span>
              </div>
              <div class="success-info flexCenter" v-if="[4].includes(authenticationStatus)">
                <el-icon><SuccessFilled /></el-icon>
                <span>已认证</span>
              </div>
            </div>
          </div>
          <div class="left-bottom-div">
            <el-button type="primary" :disabled="fileListCopy.length === 0" @click="toAuthentication" v-if="authenticationStatus === 1">立即认证</el-button>
            <el-button type="primary" :disabled="fileListCopy.length === 0" @click="toAuthentication" v-if="authenticationStatus === 2">
              <img class="loadingImg" :src="myRequire('loading.gif')" />认证中
            </el-button>
            <el-button type="primary" :disabled="fileListCopy.length === 0" @click="toAuthentication" v-if="authenticationStatus === 3">重新认证</el-button>
            <el-button type="primary" :disabled="fileListCopy.length === 0" @click="toAuthentication" v-if="authenticationStatus === 4 || authenticationStatus === 5">更换证书</el-button>
            <!-- <div class="common-btn primary flexCenter" :class="{ 'active': fileListCopy.length > 0 }" @click="toAuthentication">
              <div class="flexCenter" v-if="authenticationStatus === 1">立即认证</div>
              <div class="flexCenter" v-if="authenticationStatus === 2">
                <img class="loadingImg" :src="myRequire('loading.gif')" />认证中</div>
              <div class="flexCenter" v-if="authenticationStatus === 3">重新认证</div>
              <div class="flexCenter" v-if="authenticationStatus === 4 || authenticationStatus === 5">更换证书</div>
            </div> -->
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'Authentication',
  inheritAttrs: false
})
import { ref, computed } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { getLicenseFilterInfo, uploadLicense } from '@/api/jiancanAPI/api_license'
const emits = defineEmits([
  'handleClose'
])
const myRequire = (name) =>
  new URL(`/src/assets/${name}`, import.meta.url).href
const props = defineProps({
  status: {
    type: Number
  },
  otherAuthenticationInfo: {
    type: Object
  }
})
const uploadRef = ref(null)
const fileList = ref([])
const fileListCopy = ref([])
const validityDate = ref('')
const authenticationStatus = ref(1) // 1:未认证 2:认证中 3:认证失败 4:已认证 5:认证已过期
const size = computed(() => {
  if (fileListCopy.value.length > 0) {
    return getSize(fileListCopy.value[0].size)
  }
  return ''
})
const getLicenseInfo = () => {
  getLicenseFilterInfo().then((res) => {
    if (res.code === 10000) {
      if (res.data.enableLicenseFilter) { // 医院端
        if (res.data.authStatus === 1) {
          // 已认证
          authenticationStatus.value = 4
          validityDate.value = res.data.effectiveTime
          fileListCopy.value[0] = {
            name: res.data.fileName,
            size: ''
          }
        } else if (res.data.authStatus === 2) {
          // 认证过期
          authenticationStatus.value = 5
          router.push({ name: 'login' })
        } else {
          // 认证过期
          authenticationStatus.value = 1
          router.push({ name: 'login' })
        }
      }
    }
  })
}
if (props.status) {
  authenticationStatus.value = props.status
  validityDate.value = props.otherAuthenticationInfo.effectiveTime
  if (props.status === 5) {
    fileListCopy.value[0] = {
      name: props.otherAuthenticationInfo.fileName,
      size: ''
    }
  }
} else {
  getLicenseInfo()
}
const changeFile = () => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
    uploadRef.value.$el.querySelector('input').click()
  }
}
const isUnderMaxSize = (file) => {
  return file.size <= 1 * 1024 * 1024 // 1MB in bytes
  // return file.size <= 200 // 1MB in bytes
}
// 更换证书
const handleChange = (file, fileList) => {
  if (file) {
    if (!isUnderMaxSize(file)) {
      ElMessage.warning('文件大小不能超过1MB，请重新选择')
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
      return false
    }
    fileListCopy.value = [file]
    authenticationStatus.value = 1
  }
}
// 获取文件大小
const getSize = (size) => {
  if (!size) {
    return ''
  }
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1048576) {
    return (size / 1024).toFixed(1) + 'KB'
  } else {
    return (size / 1048576).toFixed(1) + 'MB'
  }
}
// 请求认证
const handleAuthentication = async () => {
  const newFormData = new FormData()
  newFormData.append('file', fileListCopy.value[0].raw)
  authenticationStatus.value = 2
  const res = await uploadLicense(newFormData)
  if (res.code === 10000) {
    console.log(res)
    authenticationStatus.value = 4
    ElMessage.success('认证成功')
    validityDate.value = res.data.effectiveTime
    setTimeout(() => {
      emits('handleClose', false)
    }, 1000)
  } else {
    authenticationStatus.value = 3
  }
}
// 立即认证
const toAuthentication = async() => {
  if (fileListCopy.value.length > 0) {
    if (authenticationStatus.value === 1) {
      console.log('立即认证')
      handleAuthentication()
    } else if (authenticationStatus.value === 2) {
      console.log('认证中')
    } else if (authenticationStatus.value === 3) {
      console.log('重新认证')
      handleAuthentication()
    } else if ([4, 5].includes(authenticationStatus.value)) {
      console.log('更换证书')
      changeFile()
      // authenticationStatus.value = 2
    }
  }
}
</script>
<style scoped lang="scss">
.authentication {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  .authentication-content {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    padding: 16px;
    border-radius: 8px;
    background-color: var(--theme-card);
    :deep(.bottom-div) {
      display: flex;
      justify-content: center;
      flex: 1;
      box-sizing: border-box;
      height: 100%;

      .info-div {
        width: 520px;
      }
      .info-title {
        display: flex;
        align-items: center;
        height: 22px;
        margin-top: 24px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
        .title-flag {
          width: 2px;
          height: 15px;
          margin-right: 8px;
          background-color: var(--theme-primary);
        }
      }
      .left-upload {
        // margin-right: 58px;
        margin-top: 22px;
        .myUpload {
          margin-bottom: 32px;
        }
        .el-upload-list {
          display: none;
        }
        .existFile {
          display: flex;
          position: relative;
          box-sizing: border-box;
          height: 112px;
          margin-bottom: 30px;
          padding: 24px;
          border-radius: 4px;
          background-color: var(--theme-primary-soft);
          .fail-info {
            position: absolute;
            bottom: -34px;
            .iconfont {
              font-size: 16px;
              color: #e46767;
            }
            span {
              margin-left: 10px;
              font-size: 16px;
              color: #ff4e4e;
            }
          }
          .success-info {
            position: absolute;
            bottom: -34px;
            .el-icon {
              font-size: 16px;
              color: #04a273;
            }
            span {
              margin-left: 10px;
              font-size: 16px;
              color: #04a273;
            }
          }
          img {
            width: 56px;
          }
          .existFile-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            width: 0;
            height: 100%;
            margin-left: 16px;
            margin-right: 10px;
            div:nth-child(1) {
              line-height: 32px;
              font-weight: 500;
              font-size: 17px;
              color: var(--theme-text);
            }
            div:nth-child(2) {
              line-height: 32px;
              color: var(--theme-text-3);
            }
          }
          &.status3,
          &.status5 {
            box-sizing: border-box;
            border: 1px solid #ff4e4e;
            background-color: rgba(255, 78, 78, 0.05);
            .changeFile {
              color: #ff4e4e;
            }
          }
        }
        .changeFile {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-primary);
        }
        .validityDate {
          display: flex;
          align-items: center;
          font-weight: 400;
          font-size: 12px;
          color: #767676 !important;
        }
        .el-upload-dragger {
          display: flex;
          position: relative;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 112px;
          padding: 0;
          border: inherit;
          // border: 2px dashed #d8d8d8;
          // border-radius: 4px;
          // background: url(@/assets/authentication-bg.png) no-repeat center;
          // background: rgba(54, 112, 248, 0.05);
          .el-upload__text {
            margin-top: 8px;
            div:nth-child(1) {
              font-weight: 600;
              color: var(--theme-primary);
            }
            div:nth-child(2) {
              font-weight: 400;
              font-size: 12px;
              color: var(--theme-text-3);
            }
          }
          // .el-icon--upload {
          //   margin-top: 20px;
          //   margin-bottom: 10px;
          //   font-size: 42px;
          // }
          .defaultLogo {
            width: 42px;
          }
          .authentication-bg {
            position: absolute;
            left: 0;
            top: 0;
            width: 520px;
            height: 112px;
          }
        }
        .el-upload__text {
          div:nth-child(1) {
            font-weight: 600;
            font-size: 14px;
            color: var(--theme-primary);
          }
          div:nth-child(2) {
            margin-top: 2px;
            font-weight: 500;
            color: var(--theme-text-3);
          }
        }
      }
      .left-bottom-div {
        display: flex;
        justify-content: center;
        .loadingImg {
          width: 13px;
          margin-right: 6px;
        }
        // .common-btn {
        //   cursor: not-allowed;
        //   &.active {
        //     background: var(--theme-primary);
        //     cursor: pointer;
        //   }
        // }
      }
    }
    .top-div {
      position: relative;
      width: 100%;
      height: 315px;
      .logo {
        width: 100%;
        height: 100%;
      }
      .logo-text {
        position: absolute;
        left: 124px;
        top: 77px;
        width: 585px;
        height: 90px;
      }
      .logo-text2 {
        position: absolute;
        left: 134px;
        top: 194px;
        width: 304px;
        height: 19px;
      }
    }
  }
}

</style>
