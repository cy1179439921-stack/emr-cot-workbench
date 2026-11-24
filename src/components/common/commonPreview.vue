<template>
  <div :class="{previewContainer:true,isEdit:isEdit}" >
    <el-image
      v-show="URL"
      ref="imgPreviewRef"
      :src="URL"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :preview-teleported="true"
      :preview-src-list="[URL]"
      fit="fill"
    >
      <template #error>
        <div class="image-viewer-slot image-slot">
          <img src="@/assets/loadingFail.png" alt="">
        </div>
      </template>
    </el-image>
    <img src="@/assets/emptyPicture.png" alt="" class="emptyPicture" v-show="!URL">
    <div class="mask" v-if="URL" @click.stop="handlePreview()">
      <div>预览</div>
    </div>
    <img src="@/assets/delImg.png" v-if="isEdit&&URL" class="delImg" alt="" @click.stop="handleDelImg()">
  </div>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  URL: {
    type: String
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number

  }
})
const emits = defineEmits(['handleDelImg'])
const imgPreviewRef = ref(null)
const handlePreview = () => {
  console.log('预览', imgPreviewRef.value, props.URL)
  if (imgPreviewRef.value) {
    imgPreviewRef.value.$el.querySelector('.el-image__preview').click()
  } else {
    console.error('预览功能不可用，请检查 el-image 组件是否加载成功')
  }
}
const handleDelImg = () => {
  emits('handleDelImg')
}
</script>
<style lang="scss" scoped>
:deep(.el-image) {
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 2px;
}

.previewContainer {
  overflow: hidden;
  // overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  &.isEdit {
    margin-top: 16px;
  }

  &:hover {
    .mask {
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2;
      width: 100%;
      height: 100%;
      border-radius: 2px;
      background: rgb(0 0 0 / 40%);
      cursor: pointer;
      line-height: 22px;
      font-weight: 600;
      font-size: 16px;
      color: #fff;

      >div {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        user-select: none;
      }
    }
  }
}

.delImg {
  display: block;
  position: absolute;
  right: -9px;
  top: -9px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.mask {
  display: none;
}

.emptyPicture {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  // width: 49px;
  width: 100%;
  height: auto;
  transform: translate(-50%, -50%);
}
.image-viewer-slot {
  width: 100%;
  height: 100%;
  img {
    width: 100%;
    height: auto;
  }
}
</style>
