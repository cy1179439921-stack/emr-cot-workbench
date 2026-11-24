<template>
  <div class="platformInfo">
    <div class="viewContents">
      <div class="contentArea">
        <div class="header">
          <p>平台信息</p>
        </div>
        <div class="contentMain">
          <div class="title">
            <div class="configTitle">
              <div></div>
              基本配置
            </div>
            <div class="btnDiv">
              <el-button class="editBtn" type="primary" v-if="isDisabled" @click="editBtnClick">编 辑</el-button>
            </div>
          </div>
          <el-scrollbar>
            <div class="content">
              <input
                ref="reuploadInput"
                type="file"
                accept="image/*"
                @change="onChange"
                id="fileBtn"
                style="display: none;"
                :disabled="isDisabled"
              >
              <el-form ref="platformForm" :model="platformInfo">
                <el-form-item label="平台名称">
                  <el-input :disabled="isDisabled" v-model="platformInfo.system_name" show-word-limit maxlength="20" placeholder="请填写内容"></el-input>
                </el-form-item>
                <el-form-item label="导航收起LOGO">
                  <div class="image-square" :style="isDisabled? 'cursor: not-allowed;' : ''" @click="choicedImage('system_retract_logo_url')">
                    <!-- <img v-if="platformInfo.system_retract_logo_url" :src="platformInfo.system_retract_logo_url" /> -->
                    <div
                      v-if="platformInfo.system_retract_logo_url"
                      class="image-wrapper"
                      @mouseover="showOverlay = true"
                      @mouseleave="showOverlay = false"
                    >
                      <img :src="platformInfo.system_retract_logo_url" />
                      <div class="overlay" v-show="!isDisabled && showOverlay">
                        <span class="overlay-text">修改照片</span>
                      </div>
                    </div>
                    <div v-else class="plus">
                      <Plus class="add" />
                      <span>上传图片</span>
                    </div>
                  </div>
                  <div class="otherText">
                    <p>图片格式：</p>
                    <span>仅支持上传JPG、PNG、JPEG图片，且不超过10MB</span>
                    <p>{{ platformInfo.system_retract_logo_url_name }}</p>
                  </div>
                </el-form-item>
                <el-form-item label="导航展开LOGO">
                  <div class="image-square" :style="isDisabled? 'cursor: not-allowed;' : ''" @click="choicedImage('system_expand_logo_url')">
                    <!-- <img v-if="platformInfo.system_expand_logo_url" :src="platformInfo.system_expand_logo_url" /> -->
                    <div
                      v-if="platformInfo.system_expand_logo_url"
                      class="image-wrapper"
                      @mouseover="showOverlay = true"
                      @mouseleave="showOverlay = false"
                    >
                      <img :src="platformInfo.system_expand_logo_url" />
                      <div class="overlay" v-show="!isDisabled && showOverlay">
                        <span class="overlay-text">修改照片</span>
                      </div>
                    </div>
                    <div v-else class="plus">
                      <Plus class="add" />
                      <span>上传图片</span>
                    </div>
                  </div>
                  <div class="otherText">
                    <p>图片格式：</p>
                    <span>仅支持上传JPG、PNG、JPEG图片，且不超过10MB</span>
                    <p>{{ platformInfo.system_expand_logo_url_name }}</p>
                  </div>
                </el-form-item>
                <el-form-item label="暗黑模式导航收起LOGO">
                  <div class="image-square" :style="isDisabled? 'cursor: not-allowed;' : ''" @click="choicedImage('dark_system_retract_logo_url')">
                    <!-- <img v-if="platformInfo.dark_system_retract_logo_url" :src="platformInfo.dark_system_retract_logo_url" /> -->
                    <div
                      v-if="platformInfo.dark_system_retract_logo_url"
                      class="image-wrapper"
                      @mouseover="showOverlay = true"
                      @mouseleave="showOverlay = false"
                    >
                      <img :src="platformInfo.dark_system_retract_logo_url" />
                      <div class="overlay" v-show="!isDisabled && showOverlay">
                        <span class="overlay-text">修改照片</span>
                      </div>
                    </div>
                    <div v-else class="plus">
                      <Plus class="add" />
                      <span>上传图片</span>
                    </div>
                  </div>
                  <div class="otherText">
                    <p>图片格式：</p>
                    <span>仅支持上传JPG、PNG图片，且不超过10MB</span>
                    <p>{{ platformInfo.dark_system_retract_logo_url_name }}</p>
                  </div>
                </el-form-item>
                <el-form-item label="暗黑模式导航展开LOGO">
                  <div class="image-square" :style="isDisabled? 'cursor: not-allowed;' : ''" @click="choicedImage('dark_system_expand_logo_url')">
                    <!-- <img v-if="platformInfo.dark_system_expand_logo_url" :src="platformInfo.dark_system_expand_logo_url" /> -->
                    <div
                      v-if="platformInfo.dark_system_expand_logo_url"
                      class="image-wrapper"
                      @mouseover="showOverlay = true"
                      @mouseleave="showOverlay = false"
                    >
                      <img :src="platformInfo.dark_system_expand_logo_url" />
                      <div class="overlay" v-show="!isDisabled && showOverlay">
                        <span class="overlay-text">修改照片</span>
                      </div>
                    </div>
                    <div v-else class="plus">
                      <Plus class="add" />
                      <span>上传图片</span>
                    </div>
                  </div>
                  <div class="otherText">
                    <p>图片格式：</p>
                    <span>仅支持上传JPG、PNG图片，且不超过10MB</span>
                    <p>{{ platformInfo.dark_system_expand_logo_url_name }}</p>
                  </div>
                </el-form-item>
                <el-form-item label="浏览器ICON">
                  <div class="image-square" :style="isDisabled? 'cursor: not-allowed;' : ''" @click="choicedImage('browser_icon')">
                    <!-- <img v-if="platformInfo.browser_icon" :src="platformInfo.browser_icon" /> -->
                    <div
                      v-if="platformInfo.browser_icon"
                      class="image-wrapper"
                      @mouseover="showOverlay = true"
                      @mouseleave="showOverlay = false"
                    >
                      <img :src="platformInfo.browser_icon" />
                      <div class="overlay" v-show="!isDisabled && showOverlay">
                        <span class="overlay-text">修改照片</span>
                      </div>
                    </div>
                    <div v-else class="plus">
                      <Plus class="add" />
                      <span>上传图片</span>
                    </div>
                  </div>
                  <div class="otherText">
                    <p>图片格式：</p>
                    <span>仅支持上传ICO图片，且不超过10MB</span>
                    <p>{{ platformInfo.browser_icon_name }}</p>
                  </div>
                </el-form-item>
                <div class="otherConfigTitle">
                  <div></div>
                  其他配置
                </div>
                <el-form-item label="登录页展示图">
                  <div class="image-square" :style="isDisabled? 'cursor: not-allowed;' : ''" @click="choicedImage('login_image')">
                    <!-- <img v-if="platformInfo.login_image" :src="platformInfo.login_image" /> -->
                    <div
                      v-if="platformInfo.login_image"
                      class="image-wrapper"
                      @mouseover="showOverlay = true"
                      @mouseleave="showOverlay = false"
                    >
                      <img :src="platformInfo.login_image" />
                      <div class="overlay" v-show="!isDisabled && showOverlay">
                        <span class="overlay-text">修改照片</span>
                      </div>
                    </div>
                    <div v-else class="plus">
                      <Plus class="add" />
                      <span>上传图片</span>
                    </div>
                  </div>
                  <div class="otherText">
                    <p>图片格式：</p>
                    <span>仅支持上传JPG、PNG、JPEG图片，且不超过10MB</span>
                    <p>{{ platformInfo.login_image_name }}</p>
                  </div>
                </el-form-item>
                <el-form-item label="登录页LOGO">
                  <div class="image-square" :style="isDisabled? 'cursor: not-allowed;' : ''" @click="choicedImage('login_logo_url')">
                    <div
                      v-if="platformInfo.login_logo_url"
                      class="image-wrapper"
                      @mouseover="showOverlay = true"
                      @mouseleave="showOverlay = false"
                    >
                      <img :src="platformInfo.login_logo_url" />
                      <div class="overlay" v-show="!isDisabled && showOverlay">
                        <span class="overlay-text">修改照片</span>
                      </div>
                    </div>
                    <div v-else class="plus">
                      <Plus class="add" />
                      <span>上传图片</span>
                    </div>
                  </div>
                  <div class="otherText">
                    <p>图片格式：</p>
                    <span>仅支持上传JPG、PNG、JPEG图片，且不超过10MB</span>
                    <p>{{ platformInfo.login_logo_url_name }}</p>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-scrollbar>
          <div class="btnBoxDiv" v-if="!isDisabled">
            <el-button @click="cancelBtnClick">取 消</el-button>
            <el-button type="primary" @click="saveBtnClick">保 存</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
// import ImageUploaderDialog from '@/components/common/imageUploaderDialog.vue'
import { getPlatformInfo, updatePlatformInfo, getMinioUploadUrl } from '@/api/api_manageBackground'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
import axios from 'axios'
const platformInfo = ref({
  system_name: '',
  system_retract_logo_url: '',
  dark_system_retract_logo_url: '',
  system_expand_logo_url: '',
  dark_system_expand_logo_url: '',
  browser_icon: '',
  login_image: '',
  login_logo_url: '',
  system_retract_logo_url_name: '',
  dark_system_retract_logo_url_name: '',
  system_expand_logo_url_name: '',
  dark_system_expand_logo_url_name: '',
  browser_icon_name: '',
  login_image_name: '',
  login_logo_url_name: ''
})
const originalData = ref([])
const showOverlay = ref(false)
// const showDialog = ref(false)
const isDisabled = ref(true)
const currentImageType = ref('')
// const childRef = ref(null)
const reuploadInput = ref(null)

const editBtnClick = () => {
  isDisabled.value = false
}

const choicedImage = (type) => {
  console.log(type)
  currentImageType.value = type
  uploadFile('reupload')
  // showDialog.value = true
}

const uploadFile = (type) => {
  /* 打开新的上传文件无需生成新的input元素 */
  if (type === 'reupload') {
    reuploadInput.value?.click()
    return
  }
  let input = document.createElement('input')
  input.type = 'file'
  input.click()
  input = null
}
const onChange = (event) => {
  console.log(event)
  const file = event.target.files[0]
  console.log(file)
  if (file) {
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      ElMessage.error('文件大小不能超过 10MB')
      event.target.value = '' // 清空选择的文件
      return
    }
    // 获取文件类型
    const fileType = file.type.toLowerCase()
    console.log(fileType)
    console.log(currentImageType.value)
    // 检查 browser_icon 类型的文件格式
    if (currentImageType.value === 'browser_icon' && fileType !== 'image/x-icon' && fileType !== 'image/vnd.microsoft.icon') {
      ElMessage.error('请上传 ICO 格式的图片')
      event.target.value = '' // 清空选择的文件
      return
    }
    // 检查其他类型的文件格式
    if (currentImageType.value !== 'browser_icon' && fileType !== 'image/png' && fileType !== 'image/jpg' && fileType !== 'image/jpeg') {
      ElMessage.error('请上传 PNG、 JPG 或 JPEG 格式的图片')
      event.target.value = '' // 清空选择的文件
      return
    }
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target.result
      if (currentImageType.value === 'browser_icon') {
        platformInfo.value.browser_icon = imageUrl // 将数据 URL 作为图片的 src
        platformInfo.value.browser_icon_name = file.name // 获取文件名
      } else if (currentImageType.value === 'login_image') {
        platformInfo.value.login_image = imageUrl // 将数据 URL 作为图片的 src
        platformInfo.value.login_image_name = file.name // 获取文件名
      } else if (currentImageType.value === 'login_logo_url') {
        platformInfo.value.login_logo_url = imageUrl // 将数据 URL 作为图片的 src
        platformInfo.value.login_logo_url_name = file.name // 获取文件名
      } else if (currentImageType.value === 'system_retract_logo_url') {
        platformInfo.value.system_retract_logo_url = imageUrl // 将数据 URL 作为图片的 src
        platformInfo.value.system_retract_logo_url_name = file.name // 获取文件名
      } else if (currentImageType.value === 'system_expand_logo_url') {
        platformInfo.value.system_expand_logo_url = imageUrl // 将数据 URL 作为图片的 src
        platformInfo.value.system_expand_logo_url_name = file.name // 获取文件名
      } else if (currentImageType.value === 'dark_system_retract_logo_url') {
        platformInfo.value.dark_system_retract_logo_url = imageUrl // 将数据 URL 作为图片的 src
        platformInfo.value.dark_system_retract_logo_url_name = file.name // 获取文件名
      } else if (currentImageType.value === 'dark_system_expand_logo_url') {
        platformInfo.value.dark_system_expand_logo_url = imageUrl // 将数据 URL 作为图片的 src
        platformInfo.value.dark_system_expand_logo_url_name = file.name // 获取文件名
      }
      console.log(file)
      const paramsFile = {
        fileName: file.name
      }
      const resFile = await getMinioUploadUrl(paramsFile)
      if (resFile.code === 10000) {
        axios.put(resFile.data.url, file).then(response => {
          console.log('上传成功', response)
          originalData.value.forEach(item => {
            if (item.topic === currentImageType.value) {
              item.value = resFile.data.url
            }
          })
        }).catch(error => {
          console.error('上传失败', error)
        })
      }
      // } else {
      //   fileUrl.value = imageUrl // 将数据 URL 赋值给 fileUrl
      //   fileName.value = file.name // 获取文件名
      //   showDialog.value = true
      // }
    }
    reader.readAsDataURL(file) // 将文件转换为数据 URL
    event.target.value = ''
  }
}

const getPlatformInfoData = async () => {
  const res = await getPlatformInfo()
  console.log(res)
  if (res.code === 10000) {
    platformInfo.value = res.data
    originalData.value = res.data
    // platformInfo.value = []
    // originalData.value = []
    if (res.data.length === 0) {
      isDisabled.value = false
    }
    platformInfo.value.forEach(item => {
      switch (item.topic) {
        case 'system_name':
          platformInfo.value.system_name = item.value
          if (!platformInfo.value.system_name) {
            isDisabled.value = false
          }
          break
        case 'system_retract_logo_url':
          platformInfo.value.system_retract_logo_url = item.value
          platformInfo.value.system_retract_logo_url_name = item.fileName
          break
        case 'system_expand_logo_url':
          platformInfo.value.system_expand_logo_url = item.value
          platformInfo.value.system_expand_logo_url_name = item.fileName
          break
        case 'dark_system_retract_logo_url':
          platformInfo.value.dark_system_retract_logo_url = item.value
          platformInfo.value.dark_system_retract_logo_url_name = item.fileName
          break
        case 'dark_system_expand_logo_url':
          platformInfo.value.dark_system_expand_logo_url = item.value
          platformInfo.value.dark_system_expand_logo_url_name = item.fileName
          break
        case 'browser_icon':
          platformInfo.value.browser_icon = item.value
          platformInfo.value.browser_icon_name = item.fileName
          break
        case 'login_image':
          platformInfo.value.login_image = item.value
          platformInfo.value.login_image_name = item.fileName
          break
        case 'login_logo_url':
          platformInfo.value.login_logo_url = item.value
          platformInfo.value.login_logo_url_name = item.fileName
          break
      }
    })
    console.log(platformInfo.value)
    userStore.setPlatInfo({
      systemName: res.data[0].value,
      menuFoldLogo: res.data[1].value,
      menuExpandLogo: res.data[2].value,
      darkMenuFoldLogo: res.data[3].value,
      darkMenuExpandLogo: res.data[4].value,
      systemIco: res.data[5].value,
      loginLogo: res.data[6].value,
      loginTitle: res.data[8].value
    })
  }
}

const cancelBtnClick = () => {
  isDisabled.value = true
  init()
}

const saveBtnClick = async () => {
  if (platformInfo.value.system_name === '') {
    ElMessage.error('平台名称不能为空')
    return
  }
  originalData.value.forEach(item => {
    switch (item.topic) {
      case 'system_name':
        item.value = platformInfo.value.system_name
        break
    }
  })
  const params = {
    platformInfoList: originalData.value
  }
  const res = await updatePlatformInfo(params)
  if (res.code === 10000) {
    ElMessage.success('已保存')
    isDisabled.value = true
    init()
  }
}

const init = () => {
  getPlatformInfoData()
}

init()
</script>

<style scoped lang="scss">
.platformInfo {
  width: 100%;
  height: 100%;
  .viewContents {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 16px;
    .contentArea {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      border-radius: 8px;
      background: var(--theme-card);
      .header {
        display: flex;
        align-items: center;
        height: 53px;
        padding: 0 16px;
        border-bottom: 1px solid #e8e8e8;
        background: var(--theme-card);
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .contentMain {
        display: flex;
        flex-direction: column;
        flex: 1;
        // overflow-y: auto;
        height: 0;
        background: var(--theme-card);
        .title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 943px;
          height: 70px;
          margin: 0 auto;
          .configTitle {
            display: flex;
            align-items: center;
            margin: 0;
            font-weight: 500;
            font-size: 16px;
            color: var(--theme-text);
            div {
              width: 2px;
              height: 15px;
              margin-right: 6px;
              background-color: var(--theme-primary);
            }
          }
        }
        .content {
          flex: 1;
          width: 943px;
          margin: 0 auto;
          padding-bottom: 55px;
          :deep(.el-form) {
            // overflow-y: auto;
            box-sizing: border-box;
            width: 100%;
            padding: 24px 24px 1px 24px;
            background: var(--theme-fill);
            .el-form-item:first-child {
              .el-form-item__content {
                width: 450px;
              }
            }
            .el-form-item {
              display: flex;
              flex-direction: column;
              width: 100%;
              margin-bottom: 24px;
              .el-form-item__label {
                display: block;
                height: 14px;
                margin-bottom: 10px;
                line-height: 14px;
                font-weight: 400;
                font-size: 14px;
                color: var(--theme-text);
              }
              .el-form-item__content {
                .el-input.is-disabled {
                  .el-input__wrapper {
                    background: var(--theme-card);
                  }
                }
              }
              .image-square {
                display: flex;
                position: relative;
                justify-content: center;
                align-items: center;
                width: 104px;
                height: 104px;
                border: 1px solid #d8d8d8;
                border-radius: 2px;
                background: var(--theme-card);
                cursor: pointer;
                .overlay {
                  display: flex;
                  visibility: hidden; /* 默认隐藏 */
                  position: absolute;
                  left: 0;
                  top: 0;
                  justify-content: center;
                  align-items: center;
                  width: 100%;
                  height: 100%;
                  border-radius: 2px;
                  background: rgba(0, 0, 0, 0.6);
                  font-weight: bold;
                  font-size: 16px;
                  color: #fff;
                }
                .overlay-text {
                  font-weight: 500;
                  font-size: 12px;
                  color: #fff;
                }
                .image-wrapper:hover .overlay {
                  visibility: visible;
                }
                .plus {
                  text-align: center;
                  .add {
                    width: 17px;
                    height: 17px;
                    margin-bottom: 5px;
                    line-height: 17px;
                    color: var(--theme-text-2);
                  }
                  span:nth-child(2) {
                    display: block;
                    line-height: 22px;
                    text-align: center;
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--theme-text);
                  }
                }
                img {
                  // width: 100%;
                  // height: 100%;
                  // object-fit: cover;
                  max-width: 100%;
                  max-height: 100%;
                }
              }
              .otherText {
                margin-left: 16px;
                p {
                  margin: 0;
                  line-height: 14px;
                  font-weight: 500;
                  font-size: 14px;
                  color: var(--theme-text);
                }
                p:nth-child(3) {
                  overflow: hidden;
                  max-width: 650px;
                  text-overflow: ellipsis;
                  font-weight: 400;
                  font-size: 12px;
                  color: var(--theme-text-3);
                  white-space: nowrap;
                }
                span {
                  display: block;
                  margin: 9px 0 14px 0;
                  line-height: 14px;
                  font-weight: 400;
                  font-size: 12px;
                  color: var(--theme-text-2);
                }
              }
            }
            .el-form-item:last-child {
              margin-bottom: 21px;
            }
            .otherConfigTitle {
              display: flex;
              align-items: center;
              height: 70px;
              margin: 0 -24px 24px -24px;
              background: var(--theme-card);
              font-weight: 500;
              font-size: 16px;
              color: var(--theme-text);
              div {
                width: 2px;
                height: 15px;
                margin-right: 6px;
                background-color: var(--theme-primary);
              }
            }
          }
        }
        .btnBoxDiv {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 55px;
          background: var(--theme-card);
          box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>

