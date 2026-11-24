<template>
  <div class="authentication">
    <div class="authentication-content">
      <div class="left">
        <div class="left-top-text">
          <div>卒中中心临床数据智能质控平台</div>
          <div>产品认证</div>
        </div>
        <div class="left-center-text">
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
            <img class="authentication-bg" :src="myRequire('login-authentication-bg.png')" />
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
          <div class="common-btn flexCenter" :class="{ 'active': fileListCopy.length > 0 }" @click="toAuthentication">
            <div class="flexCenter" v-if="authenticationStatus === 1">立即认证</div>
            <div class="flexCenter" v-if="authenticationStatus === 2">
              <img class="loadingImg" :src="myRequire('loading.gif')" />认证中</div>
            <div class="flexCenter" v-if="authenticationStatus === 3">重新认证</div>
            <div class="flexCenter" v-if="authenticationStatus === 4 || authenticationStatus === 5">更换证书</div>
          </div>
        </div>
      </div>
      <div class="right">
        <img class="logo" :src="myRequire('login-authentication.png')" />
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
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.authentication-content {
  display: flex;
  height: 100%;
  :deep(.left) {
    flex: 1;
    box-sizing: border-box;
    height: 100%;
    padding: 40px 40px 24px 40px;
    background-color: var(--theme-card);
    .left-top-text {
      height: 72px;
      line-height: 36px;
      font-weight: 500;
      font-size: 26px;
      color: var(--theme-text);
      div:nth-child(2) {
        color: var(--theme-primary);
      }
    }
    .left-center-text {
      display: flex;
      align-items: center;
      height: 22px;
      margin-top: 26px;
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
      margin-top: 22px;
      .el-upload-list {
        display: none;
      }
      .existFile {
        display: flex;
        position: relative;
        box-sizing: border-box;
        height: 112px;
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
            margin-left: 8px;
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
            font-size: 16px;
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
        font-size: 14px;
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
        position: relative;
        height: 112px;
        padding: 0;
        padding-top: 18px;
        border: inherit;
        border-color: #d8d8d8;
        .defaultLogo {
          width: 42px;
        }
        .authentication-bg {
          position: absolute;
          left: 0;
          top: 0;
          width: 377px;
          height: 112px;
        }
      }
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
    }
    .left-bottom-div {
      display: flex;
      justify-content: center;
      padding-top: 84px;
      .common-btn {
        border: 1px solid rgba(54, 112, 248, 0.5);
        background: rgba(54, 112, 248, 0.5);
        cursor: not-allowed;
        color: #fff;
        &.active {
          border: 1px solid rgba(54, 112, 248, 1);
          background: rgba(54, 112, 248, 1);
          cursor: pointer;
        }
        .loadingImg {
          width: 13px;
          margin-right: 6px;
        }
      }
    }
  }
  .right {
    overflow: hidden;
    width: 259px;
    background-color: #e2e9f3;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
