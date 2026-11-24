<template>
  <div class="AI-div">
    <div class="right-div">
      <div class="right-content patient-right-content" :class="{'hasSession': chatMessages.messages.length > 0}">
        <div class="session-title">与<span>智脉大模型AI</span>助理的会话</div>
        <el-scrollbar @scroll="handleScroll" ref="scrollbar">
          <div class="message-area">
            <MessageComp ref="messageRef" :message="chatMessages.messages" :loading="loading" @judgeScrollbar="handleScroll" from="patient"></MessageComp>
          </div>
          <div class="input-area">
            <AIInput ref="AIInputRef" :loading="loading" :minRows="1" @handleRequest="handleRequest" @handleStopRequest="handleStopRequest"/>
            <div v-show="showBackToBottom" class="back-to-bottom" @click="scrollBottom">
              <i class="iconfont icon-xiala"></i>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'PatientAI',
  inheritAttrs: false
})
import { onMounted, ref, nextTick, onUnmounted } from 'vue'
import MessageComp from '@/components/AI/messageComp.vue'
import AIInput from '@/components/AI/AIInput.vue'
import { ElMessage } from 'element-plus'
import { newSession, getSessionContent, stopSession, sendSessionRequest } from '@/api/api_AIChat.js'
import { getToken } from '@/utils/crypto'
import { fetchEventSource } from '@microsoft/fetch-event-source'
// import { useIndexedDB } from '@/hooks/useIndexedDB'
// const { putItem, deleteItem, getStorageUsage, getAllItems } = useIndexedDB('ebond-chat', 'history-message')
const apiKey = ref('')
const APIForm = ref(JSON.parse(localStorage.getItem('APIForm')))
if (APIForm.value?.apiKey) {
  apiKey.value = APIForm.value.apiKey
}
const chatMessages = ref({
  messages: []
})
const loading = ref(false)
const messageRef = ref(null)
// 滚动按钮控制
const showBackToBottom = ref(false)
// const storageStatus = ref(null)
const props = defineProps({
  medicalRecordId: {
    type: String
  }
})
const AIInputRef = ref(null)
const handleAddSession = async (queryContent) => {
  // if (loading.value) {
  //   ElMessage({ type: 'warning', message: '请当前问题查询完成后重试！' })
  //   return false
  // }
  const { code } = await newSession({
    content: queryContent,
    medicalRecordId: props.medicalRecordId
  })
  if (code === 10000) {
    console.log('add session')
    // chatMessages.value.messages = []
    return true
  } else {
    return false
  }
}
const toGetSessionContent = async () => {
  const { code, data } = await getSessionContent({
    medicalRecordId: props.medicalRecordId
  })

  if (code === 10000) {
    if (data.length > 0) {
      data.forEach(d => {
        d.collapse = true // 默认都是展开
      })
    }
    chatMessages.value.messages = data
    await nextTick()
    scrollBottom()
  }
}
const continuePost = ref(true)
let controller = null
const SSE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  Accept: 'text/event-stream',
  Authorization: `Bearer ${getToken()}`
}
// 更新当前对话
const updateCurrentChat = (inputParams) => {
  chatMessages.value.messages.push({
    source: 1,
    chatContent: inputParams.content
  })
  chatMessages.value.messages.push({ source: 2, chatContent: '', thinkingProcess: '', deepThink: inputParams.deepThink, collapse: inputParams.deepThink, thinkingTime: 0, loading: true, thinkStatus: inputParams.deepThink ? 2 : '' })
  handleScroll()
  nextTick(() => {
    scrollBottom()
  })
}
// 处理流消息
const handleMessage = (delta) => {
  console.log('收到数据:', delta)
  if (delta.thinkingProcess) {
    console.log('思考数据')
    chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkingProcess += delta.thinkingProcess
    chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkingTime = delta.thinkingTime
  } else if (delta.chatContent) {
    console.log('正文数据')
    chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = false
    chatMessages.value.messages[chatMessages.value.messages.length - 1].chatContent += delta.chatContent
  }
  chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkStatus = delta.thinkStatus

  if (!showBackToBottom.value) {
    nextTick().then(scrollBottom)
  }
}
const handleClose = () => {
  loading.value = false
  if (chatMessages.value) {
    chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = false
  }
}
const handleError = (error) => {
  throw error
}
const handleRequest = async (inputParams) => {
  if (loading.value || chatMessages.value.messages[chatMessages.value.messages.length - 1]?.loading) {
    ElMessage.warning('请等待当前问题结束后重试！')
    return false
  }
  continuePost.value = true
  console.log('发送请求')
  AIInputRef.value.initAIInput()
  updateCurrentChat(inputParams)
  if (chatMessages.value.messages.length === 2) { // 开头的2条
    continuePost.value = await handleAddSession(inputParams.content)
  }
  if (!continuePost.value) {
    loading.value = false
    return false
  }
  // 更新最新会话时间
  const params = {
    medicalRecordId: props.medicalRecordId,
    ...inputParams
  }
  // 创建会话，创建成功后再调流式接口
  const { code } = await sendSessionRequest(params)
  if (code === 10000) {
    startSSE(params.dialogId)
  } else {
    loading.value = false
  }
}
// 发送流接口
const startSSE = async (dialogId) => {
  try {
    controller = new AbortController()
    loading.value = true
    // eslint-disable-next-line no-undef
    await fetchEventSource(`${window.location.protocol}//${window.location.host}/api/medical/AIChat/getReply`, {
      method: 'POST',
      headers: SSE_HEADERS,
      body: JSON.stringify({
        medicalRecordId: props.medicalRecordId
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
const handleStopRequest = async () => {
  console.log('请停止请求')
  const { code } = await stopSession({
    medicalRecordId: props.medicalRecordId
  })
  if (code === 10000) {
    console.log('停止成功')
  }
}
const scrollbar = ref(null)
// 滚动处理
const handleScroll = (e) => {
  const container = scrollbar.value.wrapRef
  const threshold = 100
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  showBackToBottom.value = distanceFromBottom > threshold
  // console.log('距离底部:', distanceFromBottom)
}
const scrollBottom = () => {
  // nextTick(() => {
  console.log('滚动到最底部')
  const container = document.querySelector('.patient-right-content .el-scrollbar__wrap')
  if (container) {
    container.scrollTop = container.scrollHeight - container.clientHeight
  }
  // });
}

onMounted(async () => {
  toGetSessionContent()
  await nextTick()
  scrollBottom()
  AIInputRef.value.initAIInput()
  window.addEventListener('beforeunload', handleBeforeUnload)
})
onUnmounted(() => {
  handleBeforeUnload()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
const handleBeforeUnload = () => {
  if (loading.value) {
    console.log('前端主动终止 SSE 连接')
    controller.abort()
    loading.value = false
    handleStopRequest()
  }
}
</script>
<style scoped lang="scss">
@use '@/components/AI/style/AI.scss';
.AI-div {
  padding: 23px 0 24px 16px;
  .right-div {
    width: 100%;
    margin-left: 0;
    .right-content {
      // .back-to-bottom {
      //   right: 0;
      // }
      .session-title {
        box-sizing: border-box;
        margin-top: 0;
        margin-bottom: 23px;
        padding-right: 16px;
        span {
          color: #3670f8;
        }
      }
      :deep(.el-scrollbar) {
        box-sizing: border-box;
        width: 100%;
        padding-right: 16px;
        .el-scrollbar__view {
          width: 100%;
          .message-area {
            flex: 1;
          }
          .input-area {
            .input-div {
              width: 100%;
              margin-bottom: 0;
              padding-left: 16px;
              padding-right: 14px;
              .el-textarea {
                .el-textarea__inner {
                  min-height: 29px !important;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
