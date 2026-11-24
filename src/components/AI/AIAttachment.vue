
<template>
  <div class="attachment-div">
    <div class="file-section">
      <div class="left flexCenter" :class="fileType">
        <img src="@/assets/file-xlsx.png" v-if="fileType === 'xlsx'">
        <img src="@/assets/file-xls.png" v-if="fileType === 'xls'">
        <img src="@/assets/file-csv.png" v-if="fileType === 'csv'">
      </div>
      <div class="right">
        <div class="file-name">
          <CommonTooltip :content="fileInfo.name">
            <div class="content-ellipsis">{{ fileInfo.name }}</div>
          </CommonTooltip>
        </div>
        <div class="file-success">{{fileType}}·{{fileSize}}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  fileInfo: {
    type: Object,
    default: () => {}
  }
})
// 从参数的name中获取后缀
const fileType = computed(() => {
  const name = props.fileInfo.name
  const index = name.lastIndexOf('.')
  if (index === -1) return ''
  return name.slice(index + 1)
})

// 从参数的size中获取文件大小
const fileSize = computed(() => {
  const size = Number(props.fileInfo.size)
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
})
</script>

<style scoped lang="scss">
.attachment-div {
  margin-bottom: 10px;
  border-radius: 8px;
  background: var(--theme-bg)#f0f3f8;
  .file-section {
    display: flex;
    position: relative;
    align-items: center;
    width: 213px;
    height: 61px;
    border-radius: 8px;
    .left {
      width: 27px;
      height: 27px;
      margin-left: 16px;
      border-radius: 4px;
      img {
        width: 15px;
      }
      &.xlsx {
        background: rgba(54, 112, 248, 0.1);
      }
      &.xls {
        background: rgba(4, 162, 115, 0.1);
      }
      &.csv {
        background: rgba(255, 78, 78, 0.1);
      }
    }
    .right {
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      width: 0;
      margin-left: 8px;
      padding-right: 16px;
      .file-name {
        color: var(--theme-text);
      }
      .file-success {
        font-size: 12px;
        color: var(--theme-text-3);
      }
    }
  }
  .suggest-div {
    margin-top: 12px;
    .suggest-item {
      display: flex;
      align-items: center;
      width: fit-content;
      padding: 5px 16px;
      border-radius: 8px;
      background-color: var(--theme-card);
      cursor: not-allowed;
      color: #bfbfbf;
      i {
        margin-left: 6px;
      }
      &.active {
        cursor: pointer;
        color: var(--theme-text);
      }
    }
  }
}
</style>
