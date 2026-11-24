<template>
  <div class="dialog-content">
    <input
      ref="reuploadInput"
      type="file"
      accept="image/*"
      @change="onChange"
      id="fileBtn"
      style="display: none;"
    >
    <div class="cropper_left">
      <vueCropper
        :tyle="{ width: '250px'}"
        ref="cropperRef"
        :img="options.img"
        :info="true"
        :info-true="options.infoTrue"
        :auto-crop="options.autoCrop"
        :fixed-box="options.fixedBox"
        :can-move="options.canMoveBox"
        :can-scale="options.canScale"
        :fixed="options.fixed"
        :full="options.full"
        :center-box="options.centerBox"
        @real-time="previewHandle"
      />
    </div>
    <div class="cropper_right">
      <div
        :style="getStyle"
        v-if="previews.url"
        class="previewImg"
      >
        <div :style="previewFileStyle">
          <img
            :style="previews.img"
            :src="previews.url"
            alt=""
          >
        </div>
      </div>
      <div class="preview_text">
        图片预览
      </div>
    </div>
  </div>
  <div class="dialog-footer">
    <!-- <div class="reupload_text" @click="uploadFile('reload')">上传图片</div> -->
    <div class="reupload_text">上传图片</div>
    <div class="rotate_text">
      <p><img :src="myRequire('chongzhi')" @click="refreshCrop" /></p>
      <p><img :src="myRequire('xuanzhuan')" @click="rotateRight" /></p>
      <p><img :src="myRequire('suoxiao')" @click="changeScale(-1)" /></p>
      <p><img :src="myRequire('fangda')" @click="changeScale(1)" /></p>
      <el-button type="primary" class="confirm_btn" @click="onConfirm">确定裁剪</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { ElMessage } from 'element-plus'
import axios from 'axios'
// eslint-disable-next-line no-unused-vars
import { getMinioUploadUrl, uploadMinioFile } from '@/api/api_manageBackground'
const myRequire = (name) =>
  new URL(`/src/assets/${name}.png`, import.meta.url).href
const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  fileUrl: {
    type: String,
    default: ''
  },
  currentImageType: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:visible', 'crop', 'dataUrl'])
const localVisible = ref(props.visible)
const reuploadInput = ref(null)
const allowTypeList = ref(['png', 'jpg', 'jpeg'])
const tempScale = ref(0)
// const idVal = ref('')
const options = ref({
  img: props.fileUrl, // 需要剪裁的图片
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 196, // 默认生成截图框的宽度
  autoCropHeight: 196, // 默认生成截图框的长度
  fixedBox: false, // 是否固定截图框的大小 不允许改变
  info: true, // 裁剪框的大小信息
  outputSize: 1, // 裁剪生成图片的质量 [1至0.1]
  outputType: 'png', // 裁剪生成图片的格式
  canScale: true, // 图片是否允许滚轮缩放
  fixed: false, // 设置为 false 以允许非固定比例
  full: true, // 是否输出原图比例的截图
  canMoveBox: true, // 截图框能否拖动
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  accept: 'jpg,png,jpeg' // 允许上传的类型
})
const getStyle = ref({
  width: '',
  height: ''
})
// 裁剪后的预览样式信息
const previews = ref({})
const previewFileStyle = ref({})
// 裁剪组件Ref
const cropperRef = ref({})
watch(() => props.visible, (newVal) => {
  localVisible.value = newVal
})

watch(localVisible, (newVal) => {
  emit('update:visible', newVal)
  if (!newVal) {
    // 当对话框关闭时，清除图片数据
    options.value.img = ''
  }
})
watch(() => props.fileUrl, (newUrl) => {
  if (newUrl) {
    options.value.img = newUrl
  }
}, { immediate: true })
/* 上传图片前置拦截函数 */
const beforeUploadEvent = (file) => {
  const type = file.name.substring(file.name.lastIndexOf('.') + 1) // 获得图片上传后缀
  // 判断是否符合上传类型
  const isAllowTye = allowTypeList.value.some(item => {
    return item === type
  })
  if (!isAllowTye) {
    ElMessage.error(`仅支持png、jpg、jpeg格式的图片`)
    return false
  }
  return true
}
// 回显图片使用的方法
const onChange = (e) => {
  const file = e.target.files[0]
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 10MB')
    event.target.value = '' // 清空选择的文件
    return
  }
  const URL = window.URL || window.webkitURL
  // 上传图片前置钩子，用于判断限制类型用
  if (beforeUploadEvent(file)) {
    options.value.img = URL.createObjectURL(file)
    localVisible.value = true
  }
}
// 点击上传
// const uploadFile = (type) => {
//   /* 打开新的上传文件无需生成新的input元素 */
//   if (type === 'reupload') {
//     reuploadInput.value?.click()
//     return
//   }
//   let input = document.createElement('input')
//   input.type = 'file'
//   input.accept = options.value.accept
//   input.onchange = onChange
//   input.click()
//   input = null
// }
// 裁剪之后的数据
const previewHandle = (data) => {
  previews.value = data // 预览img图片
  tempScale.value = props.previewWidth / data.w
  previewFileStyle.value = {
    width: data.w + 'px',
    height: data.h + 'px',
    margin: 0,
    overflow: 'hidden',
    // zoom: tempScale.value,
    zoom: 0.63,
    position: 'relative',
    border: '1px solid #e8e8e8',
    'border-radius': '2px'
  }
}
/* 重置裁剪组件 */
const refreshCrop = () => {
  // cropperRef裁剪组件自带很多方法，可以打印看看
  cropperRef.value.refresh()
}
/* 右旋转图片 */
const rotateRight = () => {
  cropperRef.value.rotateRight()
}
/* 放大缩小图片比例 */
const changeScale = (num) => {
  const scale = num || 1
  cropperRef.value.changeScale(scale)
}
// base64转图片文件
const dataURLtoFile = (dataUrl, filename) => {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let len = bstr.length
  const u8arr = new Uint8Array(len)
  while (len--) {
    u8arr[len] = bstr.charCodeAt(len)
  }
  return new File([u8arr], filename, { type: mime })
}

// 上传图片（点击保存按钮）
const onConfirm = () => {
  cropperRef.value.getCropData(async (data) => {
    const dataFile = dataURLtoFile(data, props.fileName)
    const paramsFile = {
      fileName: props.fileName
    }
    const resFile = await getMinioUploadUrl(paramsFile)
    if (resFile.code === 10000) {
      emit('dataUrl', resFile.data.url)
      axios.put(resFile.data.url, dataFile).then(response => {
        console.log('上传成功', response)
      }).catch(error => {
        console.error('上传失败', error)
      })
    }
    // 触发自定义事件，将裁剪后的图片数据传递给父组件
    emit('crop', data, props.fileName)
    // return res
    localVisible.value = false
  })
}
</script>

<style scoped lang="scss">
.dialog-content {
  display: flex;
  width: 100%;
  height: 331px;
  margin-bottom: 24px;
  .cropper_left {
    display: flex;
    flex-direction: column;
    // width: 409px;
    flex: 0 0 409px;
    :deep(.vue-cropper) {
      /* 这里覆盖 vueCropper 的默认样式 */
      .cropper-move {
        border: none; /* 移除默认边框 */
        background: rgba(0, 0, 0, 0.7); /* 设置背景色为半透明黑色 */
      }
    }
  }
  .cropper_right {
    flex: 1;
    padding-left: 18px;
    .previewImg {
      margin-bottom: 14px;
    }
    .preview_text {
      line-height: 20px;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text-2);
    }
  }
}
.dialog-footer {
  justify-content: space-between !important;
  .reupload_text {
    line-height: 20px;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
  }
  .rotate_text {
    display: flex;
    p {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 32px;
      height: 32px;
      margin: 0;
      margin-right: 8px;
      background: rgba(54, 112, 248, 0.1);
      cursor: pointer;
      img {
        display: block;
      }
    }
    p:nth-child(1) {
      img {
        width: 18px;
        height: 18px;
      }
    }
    p:nth-child(2) {
      img {
        width: 18px;
        height: 15px;
      }
    }
    p:nth-child(3),
    p:nth-child(4) {
      img {
        width: 16px;
        height: 16px;
      }
    }
    .confirm_btn {
      width: 213px;
      height: 32px;
      margin-left: 8px;
      background: var(--theme-primary);
      line-height: 32px;
      text-align: center;
      font-weight: 400;
      font-size: 12px;
      color: #fff;
    }
  }
}
</style>
