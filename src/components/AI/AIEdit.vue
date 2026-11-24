
<template>
  <div class="AIEdit">
    <div class="input-div" v-if="status === 1">
      <el-input type="textarea" :class="{'overflowHidden': rowCount < 13}" v-model="userQuery" ref="userQueryRef" :autosize="{ minRows: minRows, maxRows: 12 }" placeholder="说说你想怎么改写" @keydown.enter="handleEnterKey($event)" @input="handleInput"/>
      <div class="footer-toolbar">
        <div class="input-left">
          <div class="left-title">
            <img src="@/assets/AIEditImg.png">快捷操作：
          </div>
          <div class="left-btns">
            <el-button type="primary" @click="handleRequest(5)" v-if="showOptimizeButton">
              <i class="iconfont icon-yijianyouhua"></i>一键优化
            </el-button>
            <el-button class="edit-button" @click="handleRequest(3)">
              <i class="iconfont icon-runse"></i>润色
            </el-button>
            <el-button class="edit-button" @click="handleRequest(2)">
              <i class="iconfont icon-kuoxie"></i>扩写
            </el-button>
            <el-button class="edit-button" @click="handleRequest(1)">
              <i class="iconfont icon-suoxie"></i>缩写
            </el-button>
          </div>
        </div>
        <div class="input-right">
          <el-button class="send-button" @click="handleRequest(4)" :disabled="!userQuery?.trim()">
            <i class="iconfont icon-fasong"></i>
          </el-button>
        </div>
      </div>
    </div>
    <div class="output-div" v-if="status === 2">
      <div class="user">
        <div class="line"></div>
        <div class="userContent">用户：
          <span v-if="!userQuery">{{userAction}}</span>
          <span v-else>{{userQuery}}</span>
        </div>
      </div>
      <div class="assistant">
        <CommonMarkdown :source="AIContent" />
      </div>
      <div class="footer-toolbar">
        <div class="output-left">
          <el-button class="edit-button" :disabled="loading" @click="handleReplace">
            <i class="iconfont icon-tihuan"></i>替换当前章节
          </el-button>
          <el-button class="reGenerate" @click="handleReGenerate">
            <i class="iconfont icon-zhongxinshengcheng"></i>重新生成
          </el-button>
        </div>
        <div class="output-right">
          <Loading :size="16" :loading="loading" v-if="loading">
            <span class="custom-text">正在生成</span>
          </Loading>
          <el-button class="cancel-btn" v-else @click="handleCancel">取 消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AIEdit',
  inheritAttrs: false
})
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import CommonMarkdown from '@/components/AI/commonMarkdown.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getToken } from '@/utils/crypto'
const props = defineProps({
  minRows: {
    type: Number,
    default: () => 1
  },
  source: {
    type: String,
    default: ''
  },
  showOptimizeButton: {
    type: Boolean,
    default: false
  },
  index: {
    type: Number,
    default: -1
  },
  canStartRequest: {
    type: Function,
    default: () => true
  },
  schemeId: {
    type: String,
    default: () => ''
  },
  urlList: {
    type: Array,
    default: () => []
  }
})
const loading = ref(false)
const emits = defineEmits(['handleReplace', 'handleRequest'])
const rowCount = ref(1)
const deepThink = ref(localStorage.getItem('deepThink') === 'true')

watch(deepThink, (value) => {
  localStorage.setItem('deepThink', value)
})

const userQueryRef = ref(null)
const userQuery = ref('')
const handleEnterKey = (e) => {
  if ((e.ctrlKey || e.shiftKey) && e.keyCode === 13) { // 用户点击了ctrl+enter或cmd+enter触发
  } else { // 用户点击了enter触发
    e.preventDefault() // 阻止默认换行行为
    handleRequest(4)
  }
}
const AIContent = ref('')
const status = ref(1) // 1: 输入框 2: 输出框
const promptType = ref(null) // 用户行为
const userAction = computed(() => {
  if (promptType.value === 5) {
    return '根据关键问题与优化项进行优化'
  } else if (promptType.value === 3) {
    return '请对本节进行润色'
  } else if (promptType.value === 2) {
    return '请对本节进行扩写'
  } else if (promptType.value === 1) {
    return '请对本节进行缩写'
  }
  return ''
})
let controller = null
const SSE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  Accept: 'text/event-stream',
  Authorization: `Bearer ${getToken()}`
}
// 发送流接口
const startSSE = async (val) => {
  try {
    controller = new AbortController()
    // loading.value 已在 handleRequest 中设置
    // eslint-disable-next-line no-undef
    await fetchEventSource(`${window.location.protocol}//${window.location.host}/api${curBussinessUrl.value}`, {
      method: 'POST',
      headers: SSE_HEADERS,
      body: JSON.stringify({
        id: props.schemeId,
        content: props.source,
        requirement: userQuery.value,
        type: val || promptType.value,
        sort: props.index + 1 // 重新生成的时候传一个下标
      }),
      signal: controller.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok) {
          console.log('SSE 连接成功')
          return
        }
        handleError(new Error(`连接失败，状态码: ${response.status}`))
      },
      onmessage(msg) {
        try {
          const delta = JSON.parse(msg.data)
          handleMessage(delta)
        } catch (error) {
          console.error('Error parsing SSE message:', error)
          handleError(new Error('Failed to parse SSE message'))
        }
      },
      onerror(error) {
        console.error('SSE error:', error)
        handleError(error)
      },
      onclose() {
        console.log('SSE 连接已关闭')
        handleClose()
      }
    })
  } catch (error) {
    console.error('网络好像不太稳定，请稍后重试:', error)
    handleClose()
  }
}
const curBussinessUrl = ref('') // 当前业务流式接口地址
const handleRequest = async (val) => {
  if (!val && !userQuery.value?.trim()) return

  // 检查是否可以发起新的请求
  if (!props.canStartRequest()) {
    return
  }

  promptType.value = val
  status.value = 2
  loading.value = true // 在这里设置loading状态
  console.log('开始生成')
  AIContent.value = ''
  curBussinessUrl.value = props.urlList.find(item => item.id === val)?.url || '/agent/literatureReview/aiModify'
  // 调流式接口
  startSSE()
}
// 处理流消息
const handleMessage = (delta) => {
  AIContent.value += delta.content
}
const handleClose = () => {
  loading.value = false
}

const handleError = (error) => {
  throw error
}
// 取消
const handleCancel = () => {
  status.value = 1
  userQuery.value = ''
  userQueryRef.value?.focus()
}
// 重新生成
const handleReGenerate = () => {
  console.log('重新生成')
  AIContent.value = ''
  // // 调流式接口
  startSSE(6)
}
// const handleStopRequest = () => {
//   console.log('停止生成')
//   // emits('handleStopRequest')
// }
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
  userQuery.value = ''
  userQueryRef.value?.focus()
}
// 替换当前章节
const handleReplace = () => {
  console.log('替换当前章节')
  // 清空内容，恢复初始状态
  status.value = 1
  userQuery.value = ''
  emits('handleReplace', {
    newContent: AIContent.value,
    operationType: promptType.value
  })
}
defineExpose({
  initAIInput,
  loading,
  status
})
const stopSSE = () => {
  if (controller && loading.value) {
    console.log('前端主动终止 SSE 连接')
    controller.abort()
    loading.value = false
  }
}
onUnmounted(() => {
  localStorage.removeItem('deepThink')
  // 终止流式接口
  stopSSE()
})
</script>

<style scoped lang="scss">
.AIEdit {
  display: flex;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 16px 16px 76px 16px;
  border-radius: 4px;
  background: var(--theme-card);
  .input-div {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .output-div {
    display: flex;
    flex-direction: column;
    .user {
      display: flex;
      .line {
        width: 3px;
        height: 100%;
        margin-right: 7px;
        background-color: #2c67ff;
      }
      .userContent {
        font-weight: 600;
        font-size: 18px;
        color: var(--theme-text);
      }
    }
    .assistant {
      :deep(.common-markdown) {
        padding-left: 0;
        padding-right: 0;
      }
    }
  }
  :deep(.el-textarea) {
    line-height: 20px;
    .el-textarea__inner {
      height: auto; // 确保自动调整高度
      min-height: 20px !important;
      // min-height: 46px !important;
      padding: 0;
      padding-right: 21px;
      background-color: inherit;
      box-shadow: none;
      resize: none;
      // line-height: 30px;
      line-height: 20px;
      font-size: 18px;

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
    position: absolute;
    left: 0;
    bottom: 16px;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 37px;
    padding-left: 14px;
    padding-right: 16px;

    .input-left {
      display: flex;
      align-items: center;
      .left-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 18px;
        color: var(--theme-text);
        img {
          width: 16px;
          margin-right: 7px;
        }
      }
      .left-btns {
        display: flex;
        align-items: center;
        margin-left: 6px;
        i {
          width: 12px;
          margin-right: 7px;
        }
        .el-button {
          display: flex;
          box-sizing: border-box;
          height: 44px;
          padding: 0 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
          font-size: 18px;
          i {
            margin-right: 12px;
            font-size: 16px;
          }
        }
        .edit-button {
          background-color: var(--theme-bg)#f0f3f8;
          font-size: 18px;
          color: var(--theme-text);

          &:hover {
            background: #2c67ff;
            color: #fff;
          }
        }
        .el-button + .el-button {
          margin-left: 12px;
        }
      }
    }
    .input-right {
      .send-button {
        width: 37px;
        height: 100%;
        border: none;
        background-color: inherit;
        cursor: pointer;
        i {
          font-size: 37px;
          color: var(--theme-primary);
        }
        &.is-disabled {
          i {
            color: rgba(54, 112, 248, 0.5);
          }
        }
      }
    }
    .output-left {
      display: flex;
      align-items: center;
      .edit-button {
        display: flex;
        box-sizing: border-box;
        height: 34px;
        padding: 0 16px;
        border: 1px solid #2c67ff;
        border-radius: 4px;
        background: rgba(44, 103, 255, 0.1);
        cursor: pointer;
        user-select: none;
        font-size: 18px;
        color: #2c67ff;
        i {
          margin-right: 6px;
          font-size: 12px;
        }
        &.is-disabled {
          border: 1px solid rgba(44, 103, 255, 0.5);
          cursor: not-allowed;
          color: rgba(44, 103, 255, 0.5);
        }
        &:hover:not(:disabled) {
          background: #2c67ff;
          color: #fff;
        }
      }
      .reGenerate {
        border: none;
        font-weight: 600;
        font-size: 18px;
        color: var(--theme-text-2);
        i {
          margin-right: 7px;
          font-size: 17px;
        }
      }
      .el-button + .el-button {
        margin-left: 12px;
      }
    }
    .output-right {
      .loading {
        cursor: pointer;
      }
      .custom-text {
        margin-left: 10px;
        font-size: 18px;
      }
      .cancel-btn {
        border: 1px solid #d8d8d8;
        font-weight: 600;
        font-size: 18px;
        color: var(--theme-text);
      }
    }
  }
}
</style>
