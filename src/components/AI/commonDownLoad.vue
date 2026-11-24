<template>
  <el-popover
    :width="pxToRem(192)"
    popper-class="downloadPanel"
    trigger="click"
    ref="myPopover"
  >
    <div class="panelDiv">
      <ul>
        <li v-for="(item, index) in downloadList" :key="'download-' + index" @click="handleDownload(item)">
          <SvgIcon class="arrowDown" :iconName="item.img"></SvgIcon>
          {{ item.name }}
        </li>
      </ul>
    </div>
    <template #reference>
      <slot></slot>
    </template>
  </el-popover>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'CommonDownLoad',
  inheritAttrs: false
})

const emits = defineEmits(['handleClick'])
const downloadList = ref([
  {
    name: 'markdown格式',
    value: 1,
    fileType: 'md',
    img: 'icon-md'
  },
  {
    name: 'word格式',
    value: 2,
    fileType: 'docx',
    img: 'icon-docx'
  }
])
const myPopover = ref(null)

// 处理下载项点击
const handleDownload = (item) => {
  // 关闭弹窗
  if (myPopover.value) {
    myPopover.value.hide()
  }
  // 触发下载事件
  emits('handleClick', item)
}
</script>

<style scoped lang="scss">
.panelDiv {
  margin: 0;
  padding: 0;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      // height: 30px;
      height: 34px;
      padding-left: 20px;
      cursor: pointer;
      line-height: 30px;
      font-size: 18px;
      .svg-icon {
        width: 20px;
        margin-right: 7px;
      }

      &:hover {
        background-color: var(--theme-primary-soft);
        font-weight: 600;
        color: #3670f8;
      }
    }
  }
}
.download-btn {
  border-radius: 16px;
  i {
    margin-right: 6px;
    font-size: 14px;
  }
}

</style>
<style>
.downloadPanel {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
