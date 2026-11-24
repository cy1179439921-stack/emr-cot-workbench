
<template>
  <div class="input-div">
    <div class="file-div" v-if="fileInfo">
      <div class="file-section" v-if="!dialogId">
        <div class="delete-icon" @click="deleteFile"><el-icon><CircleCloseFilled /></el-icon></div>
        <div class="left flexCenter">
          <FileIcon :status="fileInfo.status" :type="fileInfo.type" />
        </div>
        <div class="right">
          <div class="file-name">
            <CommonTooltip :content="fileInfo.name">
              <div class="content-ellipsis">{{ fileInfo.name }}</div>
            </CommonTooltip>
          </div>
          <div class="file-uploading" v-if="fileInfo.status === 'uploading'">上传中...</div>
          <div class="file-uploadError" v-else-if="fileInfo.status === 'error'">上传失败</div>
          <div class="file-success" v-else>{{fileInfo.type}}·{{fileInfo.sizeText}}</div>
        </div>
      </div>
      <div class="suggest-div" v-if="!dialogId">
        <div class="suggest-item" :class="{active: fileInfo.status === 'success'}" @click="handleClickSuggest('做一下简单的数据清洗')">做一下简单的数据清洗<el-icon><Right /></el-icon></div>
      </div>
      <div class="file-section2" v-if="dialogId">
        <div class="section-left">
          <div class="leftLogo flexCenter">
            <FileIcon :status="fileInfo.status" :type="fileInfo.type" />
          </div>
          <div class="file-name">
            <CommonTooltip :content="fileInfo.name">
              <div class="content-ellipsis">{{ fileInfo.name }}</div>
            </CommonTooltip>
            <div class="file-uploading" v-if="fileInfo.status === 'uploading'">上传中...</div>
            <div class="file-uploadError" v-else-if="fileInfo.status === 'error'">上传失败</div>
          </div>
        </div>
        <div class="section-right" @click="deleteFile">
          <el-tooltip
            class="box-item"
            popper-class="AI-tooltip-class"
            effect="dark"
            content="不再围绕这个文件回答"
            placement="top">
            <el-icon><CircleCloseFilled /></el-icon>
          </el-tooltip>
        </div>
      </div>
    </div>
    <el-input type="textarea" :class="{'overflowHidden': rowCount < 13}" v-model="userQuery" ref="userQueryRef" :autosize="{ minRows: minRows, maxRows: 12 }" autofocus :placeholder="dialogId? '请填写内容' : placeholderMap[sessionType]" @keydown.enter="handleEnterKey($event)" @input="handleInput"/>
    <div class="footer-toolbar">
      <div class="ds-button flexCenter" :class="{ active: deepThink }" @click="deepThink = !deepThink" v-if="sessionType === 'normal'">深度思考</div>
      <el-tooltip
        class="box-item"
        popper-class="AI-tooltip-class"
        effect="dark"
        content="文件单个最大不能超过5万行*500列；支持.xls、.xlsx、.csv"
        placement="bottom" v-else-if="sessionType === 'dataAnalysis'">
        <div class="ds-button flexCenter" :class="{ active: deepThink }" @click="handleUpload"><i class="iconfont icon-shangchuanfujian"></i>上传文档</div>
      </el-tooltip>
      <el-upload
        ref="uploadRef"
        class="upload-div"
        :auto-upload="false"
        accept=".csv,.xlsx,.xls"
        action="#"
        :show-file-list="false"
        @change="uploadFile"
      >
        <el-button ref="uploadBtn" type="primary">确 定</el-button>
      </el-upload>
      <el-button class="send-button" @click="handleRequest" :disabled="!userQuery?.trim()" v-if="!loading">
        <i class="iconfont icon-fasong"></i>
      </el-button>
      <el-button class="send-button" @click="handleStopRequest" v-else>
        <i class="iconfont icon-zanting"></i>
      </el-button>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AIInput',
  inheritAttrs: false
})
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import CommonTooltip from '@/components/common/commonTooltip.vue'
import FileIcon from '@/components/AI/FileIcon.vue'
import { AIUploadFile } from '@/api/api_AIChat.js'
const props = defineProps({
  loading: {
    type: Boolean,
    default: () => false
  },
  minRows: {
    type: Number,
    default: () => 2
  },
  sessionType: {
    type: String,
    default: () => 'normal'
  },
  dialogId: {
    type: String,
    default: () => ''
  }
})
const placeholderMap = {
  normal: '给智脉大模型AI助理发送信息',
  dataAnalysis: '根据我上传的文件，请做一下简单的数据清洗'
}
const emits = defineEmits(['handleRequest', 'handleStopRequest'])
const rowCount = ref(2)
const deepThink = ref(localStorage.getItem('deepThink') === 'true')

watch(deepThink, (value) => {
  localStorage.setItem('deepThink', value)
})
watch(() => props.sessionType, (value) => {
  if (value === 'dataAnalysis') {
    deepThink.value = false
  }
})
const userQueryRef = ref(null)
const userQuery = ref('')
const handleEnterKey = (e) => {
  if ((e.ctrlKey || e.shiftKey) && e.keyCode === 13) { // 用户点击了ctrl+enter或cmd+enter触发
  } else { // 用户点击了enter触发
    e.preventDefault() // 阻止默认换行行为
    handleRequest()
  }
}
const handleRequest = async () => {
  if (props.loading) {
    ElMessage.warning('请等待当前问题结束后重试！')
    return false
  }
  if (!userQuery.value?.trim()) return
  // console.log({
  //   content: userQuery.value,
  //   ...(fileInfo.value
  //     ? {
  //       fileId: [{
  //         name: fileInfo.value.name,
  //         type: fileInfo.value.type,
  //         size: fileInfo.value.size,
  //         id: fileInfo.value.id
  //       }]
  //     }
  //     : {}),
  //   deepThink: deepThink.value
  // })
  emits('handleRequest', {
    content: userQuery.value,
    ...(fileInfo.value
      ? {
        fileInfo: {
          name: fileInfo.value.name,
          type: fileInfo.value.type,
          size: fileInfo.value.size,
          id: fileInfo.value.id,
          fileStatus: fileInfo.value.fileStatus
        }
      }
      : {}),
    deepThink: deepThink.value
  })
}
const handleStopRequest = () => {
  emits('handleStopRequest')
}
const handleInput = (e) => {
  // 计算行数（可能由于rem原因，会造成低于maxRows时出现滚动条）
  const textarea = userQueryRef.value.$el.querySelector('textarea')
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight)
  const height = textarea.scrollHeight
  rowCount.value = Math.round(height / lineHeight)
  // console.log('当前行数:', rowCount.value)
}
onMounted(() => {
  initAIInput()
})
const initAIInput = () => {
  fileInfo.value = null
  userQuery.value = null
  userQueryRef.value.focus()
}
// 数据分析清空输入内容
const initAIInputWithFile = () => {
  deepThink.value = false
  userQuery.value = null
  userQueryRef.value.focus()
  // 清空新文件状态识
  if (fileInfo.value) {
    fileInfo.value.fileStatus = ''
  }
}
const uploadBtn = ref(null)
const fileInfo = ref(null)
const uploadRef = ref(null)

const uploadFile = async (file, fileList) => {
  console.log('file', file)
  fileInfo.value = file
  fileInfo.value.status = 'uploading'
  // fileInfo.value.status = 'success'
  fileInfo.value.sizeText = getFileSize(fileInfo.value)
  fileInfo.value.type = getFileType(fileInfo.value)
  // console.log('上传文件:', fileInfo.value)
  const newFormData = new FormData()
  newFormData.append('files', file.raw)
  const { code, data } = await AIUploadFile(newFormData)
  console.log(code, data)
  // 若上传中，文件被删除
  if (fileInfo.value) {
    if (code === 10000) {
      fileInfo.value.status = 'success'
      fileInfo.value.id = data.fileIdList[0]
      fileInfo.value.fileStatus = 'new'
    } else {
      fileInfo.value.status = 'error'
    }
  }

  // 清空el-upload
  uploadRef.value.clearFiles()
}
const handleUpload = () => {
  console.log('上传文档')
  uploadBtn.value?.$.vnode.el?.click()
}
// 快捷建议
const handleClickSuggest = (content) => {
  if (fileInfo.value.status === 'success') {
    userQuery.value = content
    userQueryRef.value.focus()
  }
}
// 从参数的name中获取后缀
const getFileType = (fileInfo) => {
  const name = fileInfo.name
  const index = name.lastIndexOf('.')
  if (index === -1) return ''
  return name.slice(index + 1)
}
// 从参数的size中获取文件大小
const getFileSize = (fileInfo) => {
  const size = fileInfo.size
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
}
// 删除文件
const deleteFile = () => {
  initAIInput()
}
defineExpose({
  initAIInput,
  initAIInputWithFile
})
onUnmounted(() => {
  localStorage.removeItem('deepThink')
})
</script>

<style scoped lang="scss">
.input-div {
  box-sizing: border-box;
  width: 880px;
  padding: 16px 21px 16px 16px;
  border: 1px solid #dbdcdf;
  border-radius: 16px;
  background: var(--theme-card);
  .file-div {
    width: 100%;
    margin-bottom: 10px;
    .file-section {
      display: flex;
      position: relative;
      align-items: center;
      width: 213px;
      height: 61px;
      border-radius: 8px;
      background: #e2e2e4;
      .delete-icon {
        position: absolute;
        right: -3px;
        top: -3px;
        box-sizing: border-box;
        width: 17px;
        height: 17px;
        border: 2px solid #f2f6fd;
        border-radius: 17px;
        cursor: pointer;
        color: var(--theme-text-3);
      }
      .left {
        width: 27px;
        height: 27px;
        margin-left: 16px;
        border-radius: 4px;
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
        .file-uploading {
          font-size: 12px;
          color: var(--theme-primary);
        }
        .file-uploadError {
          font-size: 12px;
          color: #ff4e4e;
        }
        .file-success {
          font-size: 12px;
          color: var(--theme-text-3);
        }
      }
    }
    .file-section2 {
      display: flex;
      position: relative;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: 47px;
      padding: 0 16px;
      border-radius: 8px;
      background: var(--theme-card);
      .section-left {
        display: flex;
        align-items: center;
        flex: 1;
        .leftLogo {
          width: 27px;
          height: 27px;
          border-radius: 4px;
        }
        .file-name {
          flex: 1;
          width: 0;
          margin-left: 8px;
          color: var(--theme-text);
        }
        .file-uploading {
          font-size: 12px;
          color: var(--theme-primary);
        }
        .file-uploadError {
          font-size: 12px;
          color: #ff4e4e;
        }
      }
      .section-right {
        cursor: pointer;
        i {
          font-size: 16px;
          color: #bfbfbf;
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
  :deep(.el-textarea) {
    line-height: 20px;
    .el-textarea__inner {
      height: auto; // 确保自动调整高度
      min-height: 56px !important;
      padding: 0;
      background-color: inherit;
      box-shadow: none;
      resize: none;
      // line-height: 30px;
      line-height: inherit;

      @include scrollBarStyle;
      &::placeholder {
        color: var(--theme-text-3);
      }
    }
    &.overflowHidden {
      .el-textarea__inner {
        overflow-y: hidden;
      }
    }
  }
  .footer-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 31px;
    margin-top: 4px;
    .ds-button {
      display: flex;
      // align-items: center;
      box-sizing: border-box;
      height: 31px;
      padding: 0 16px;
      border: 1px solid #dbdcdf;
      border-radius: 16px;
      background-color: var(--theme-card);
      cursor: pointer;
      user-select: none;
      color: var(--theme-text-2);
      i {
        margin-right: 6px;
        font-size: 13px;
      }
      &.active {
        border: 1px solid #c9d9ff;
        background: #e4e7fd;
        color: var(--theme-primary);
      }
    }
    .send-button {
      width: 31px;
      height: 31px;
      border: none;
      background-color: inherit;
      cursor: pointer;
      i {
        font-size: 31px;
        color: var(--theme-primary);
      }
      &.is-disabled {
        i {
          color: #99b6fa;
        }
      }
    }
  }
  .upload-div {
    display: none;
  }
}
</style>
