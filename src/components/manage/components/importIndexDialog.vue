<template>
  <!-- <div class="importIndexDialog"> -->
  <el-dialog title="导入指标" v-model="showDialog" class="new_Dialog" :width="pxToRem(470)" :before-close="handleClose" v-if="showDialog">
    <div class="infoTitle">
      <i class="iconfont icon-tishi-yidongwenjianjia"></i>
      <span>同一个指标索引内指标名称不允许重复</span>
    </div>
    <div class="file-div">
      <img :src="iconJson">
      <div class="file-right-div">
        <div class="file-top">
          <div class="file-name">
            <CommonTooltip :content="fileInfo.name">
              <div class="content-ellipsis">{{ fileInfo.name }}</div>
            </CommonTooltip>
          </div>
          <div class="file-percent">{{fileInfo['status'] === 'success' ? '100%' : '60%'}}</div>
        </div>
        <div class="file-progress">
          <el-progress :percentage="100" :stroke-width="6" status="success" color="#04A273" :show-text="false" v-if="fileInfo['status'] === 'success'">
            <template #default>
              <span class="custom-success-icon"><el-icon><CircleCheckFilled /></el-icon></span>
            </template>
          </el-progress>
          <el-progress :percentage="60" :stroke-width="6" status="exception" color="#FF4E4E" :show-text="false" v-else-if="fileInfo['status'] == 'error'">
            <template #default>
              <span class="custom-error-icon"><el-icon><CircleCloseFilled /></el-icon></span>
            </template>
          </el-progress>
          <el-progress :percentage="60" :stroke-width="6" color="#3670F8" :show-text="false" v-else-if="fileInfo['status'] == 'uploading'"></el-progress>
        </div>
      </div>
    </div>
    <div class="file-text">
      <div class="success-text" v-if="fileInfo['status'] === 'success'">
        成功导入<span class="success-count">{{fileInfo.successCount}}</span>个指标，舍弃重复<span class="error-count">{{fileInfo.duplicateCount}}</span>个指标
      </div>
      <div class="error-text" v-else-if="fileInfo['status'] == 'error'">{{fileInfo.msg}}，请<span @click="triggerUpload">重新上传</span></div>
      <div class="upload-text" v-else-if="fileInfo['status'] == 'uploading'">正在新增中，请稍等片刻...</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleClose" :disabled="fileInfo['status'] === 'uploading'">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <el-upload
    ref="uploadRef"
    class="upload-div"
    :auto-upload="false"
    accept=".json"
    action="#"
    :show-file-list="false"
    @change="uploadFile"
    style="display: none;"
  >
    <el-button ref="uploadBtn" type="primary">确 定</el-button>
  </el-upload>
  <!-- </div> -->
</template>

<script setup>
defineOptions({
  name: 'ImportIndexDialog',
  inheritAttrs: false
})
import { ref } from 'vue'
import iconJson from '@/assets/icon-json.png'
import { importIndex } from '@/api/api_index'
import { importResearchQueueIndex } from '@/api/api_research'
const emits = defineEmits(['handle-close', 'finishUpload'])
const props = defineProps({
  fromPage: {
    type: String,
    default: ''
  },
  queueId: {
    type: String,
    default: ''
  }
})
const handleClose = () => {
  showDialog.value = false
  emits('handle-close')
}
const uploadBtn = ref(null)
const fileInfo = ref(null)
const uploadRef = ref(null)
const showDialog = ref(false)
const uploadFile = async (file, fileList) => {
  showDialog.value = true
  console.log('file', file)
  fileInfo.value = file
  fileInfo.value.status = 'uploading'
  console.log('上传文件:', fileInfo.value)
  const newFormData = new FormData()
  newFormData.append('file', file.raw)
  console.log('props', props)
  let res = {}
  if (props.fromPage === 'indexDictionary') {
    res = await importIndex(newFormData)
  } else if (props.fromPage === 'researchQueue') {
    newFormData.append('queueId', props.queueId)
    res = await importResearchQueueIndex(newFormData)
  }
  if (fileInfo.value) {
    if (res.code === 10000) {
      fileInfo.value.status = 'success'
      fileInfo.value.successCount = res.data.successCount
      fileInfo.value.duplicateCount = res.data.duplicateCount
    } else {
      fileInfo.value.status = 'error'
      fileInfo.value.msg = res.msg
    }
  }
  // 清空el-upload
  uploadRef.value.clearFiles()
  emits('finishUpload', fileInfo.value, showDialog.value)
}
const triggerUpload = () => {
  uploadBtn.value?.$.vnode.el?.click()
}

defineExpose({
  triggerUpload
})
</script>
<style lang="scss" scoped>
.infoTitle {
  display: flex;
  align-items: center;
  height: 40px;
  margin-bottom: 16px;
  padding-left: 18px;
  border: 1px solid rgba(245, 159, 12, 0.5);
  border-radius: 2px;
  background: rgba(245, 159, 12, 0.05);
  i {
    padding-right: 7px;
    color: #f6a31e;
  }
  span {
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text);
  }
}
.file-div {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 73px;
  padding-left: 18px;
  background-color: var(--theme-fill);
  img {
    width: 32px;
  }
  .file-right-div {
    display: flex;
    flex-direction: column;
    flex: 1;
    .file-top {
      display: flex;
      justify-content: space-between;
      padding-left: 16px;
      padding-right: 17px;
      .file-name {
        flex: 1;
        width: 0;
        margin-right: 20px;
        cursor: pointer;
      }
    }
    .file-progress {
      margin-top: 12px;
      padding-left: 16px;
      padding-right: 13px;
    }
  }
}
.file-text {
  margin-top: 14px;
  padding-left: 13px;
  .success-text {
    .success-count {
      color: var(--theme-primary);
    }
    .error-count {
      color: #ff4e4e;
    }
    .btn-span {
      cursor: pointer;
      color: var(--theme-primary);
    }
  }
  .error-text {
    span {
      cursor: pointer;
      color: var(--theme-primary);
    }
  }
  .upload-text {
    color: var(--theme-primary);
  }
}
</style>
<style lang="scss">
.el-overlay-dialog .el-dialog .el-dialog__header {
  padding-bottom: 16px !important;
}
</style>
