<template>
  <div class="AI-div">
    <div class="left-div">
      <header>智脉大模型AI助理</header>
      <div class="add-session flexCenter" @click="handleNewSession">
        <i class="iconfont icon-duihua"></i>
        开启新对话
      </div>
      <div class="session-area">
        <el-scrollbar @scroll="handleSessionScroll" ref="sessionScrollbar">
          <SessionList :dataList="groupedSessions.todaySessions" :activeSessionInfo="activeSessionInfo" @changeSession="handleChangeSession" @deleteSession="handleDeleteSession" title="今天"/>
          <SessionList :dataList="groupedSessions.sevenDaysSessions" :activeSessionInfo="activeSessionInfo" @changeSession="handleChangeSession" @deleteSession="handleDeleteSession" title="七天内"/>
          <SessionList :dataList="groupedSessions.historySessions" :activeSessionInfo="activeSessionInfo" @changeSession="handleChangeSession" @deleteSession="handleDeleteSession" title="历史"/>
        </el-scrollbar>
      </div>
    </div>
    <div class="right-div">
      <div class="right-content" :class="{'hasSession': chatMessages.messages.length > 0}">
        <div class="session-title">{{activeSessionInfo?.dialogTitle}}</div>
        <el-scrollbar @scroll="handleScroll" ref="scrollbar">
          <div class="message-area">
            <MessageComp ref="messageRef" :message="chatMessages.messages" :loading="loading" :title="activeSessionInfo?.dialogTitle" @judgeScrollbar="handleScroll"></MessageComp>
          </div>
          <div class="input-area">
            <div class="input-div">
              <el-input type="textarea" :class="{'overflowHidden': rowCount < 13}" v-model="userQuery" ref="userQueryRef" :autosize="{ minRows: 2, maxRows: 12 }" autofocus placeholder="给智脉大模型AI助理发送信息" @keydown.enter="handleEnterKey($event)" @input="handleInput"/>
              <div class="footer-toolbar">
                <div class="ds-button flexCenter" :class="{ active: deepThink }" @click="deepThink = !deepThink">深度思考</div>
                <el-button class="send-button" @click="handleRequest" :disabled="!userQuery?.trim()" v-if="!loading">
                  <i class="iconfont icon-fasong"></i>
                </el-button>
                <el-button class="send-button" @click="handleStopRequest" v-else>
                  <i class="iconfont icon-zanting"></i>
                </el-button>
              </div>
            </div>
            <div v-show="showBackToBottom" class="back-to-bottom" @click="scrollBottom">
              <el-icon :size="18">
                <ArrowDownBold />
              </el-icon>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AI',
  inheritAttrs: false
})
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import MessageComp from '@/components/AI/messageComp.vue'
import SessionList from '@/components/AI/sessionList.vue'
import { ElMessage } from 'element-plus'
import { formatDateTime } from '@/utils/utils'
import { newSession, getSessionList, deleteSession, getSessionContent } from '@/api/api_AIChat.js'
import { getToken } from '@/utils/crypto'
// import { useIndexedDB } from '@/hooks/useIndexedDB'
// const { putItem, deleteItem, getStorageUsage, getAllItems } = useIndexedDB('ebond-chat', 'history-message')
const sessionList = ref([])
const activeSessionInfo = ref(null)
const apiKey = ref('')
const APIForm = ref(JSON.parse(localStorage.getItem('APIForm')))
if (APIForm.value?.apiKey) {
  apiKey.value = APIForm.value.apiKey
}
const chatMessages = ref({
  messages: []
})
const userQuery = ref('')
const deepThink = ref(true)
const loading = ref(false)
const messageRef = ref(null)
// 滚动按钮控制
const showBackToBottom = ref(false)
// const storageStatus = ref(null)
// 监听数据变化
watch(sessionList, async (val) => {
  const list = val.map((o, i) => ({
    ...o,
    messages: o.dialogId === activeSessionInfo.value?.dialogId ? chatMessages.value.messages : o.messages
  }))
  localStorage.setItem('sessionList', JSON.stringify(list))
  // 检查存储空间
  // const status = await getStorageUsage()
  // storageStatus.value = status
  // console.log('storageStatus.value', storageStatus.value)
  // list.forEach(async newItem => {
  //   // 添加数据
  //   // console.log('newItem', newItem)
  //   await putItem(JSON.parse(JSON.stringify(newItem)))
  // })
}, { deep: true })
watch(activeSessionInfo, async (val) => {
  localStorage.setItem('activeSessionInfo', JSON.stringify(val))
  // await putItem(JSON.parse(JSON.stringify(val)))
}, { deep: true })

const sortAndGroupSessions = () => {
  // 对 sessionList.value 进行排序
  sessionList.value.sort((a, b) => new Date(b.operateTime) - new Date(a.operateTime))

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const sevenDaysAgo = new Date(todayStart)
  sevenDaysAgo.setDate(todayStart.getDate() - 6)
  const todaySessions = []
  const sevenDaysSessions = []
  const historySessions = []

  sessionList.value.forEach(session => {
    const sessionDate = new Date(session.operateTime)
    if (sessionDate >= todayStart) {
      todaySessions.push(session)
    } else if (sessionDate >= sevenDaysAgo) {
      sevenDaysSessions.push(session)
    } else {
      historySessions.push(session)
    }
  })

  return {
    todaySessions,
    sevenDaysSessions,
    historySessions
  }
}

const groupedSessions = computed(() => {
  return sortAndGroupSessions()
})
// 开启新对话
const handleNewSession = () => {
  console.log('new session')
  chatMessages.value.messages = []
  activeSessionInfo.value = null
  userQuery.value = null
  userQueryRef.value.focus()
}
const handleAddSession = async (queryContent) => {
  if (loading.value) {
    ElMessage({ type: 'warning', message: '请当前问题查询完成后重试！' })
    return false
  }
  const { code, data } = await newSession({
    content: queryContent
  })
  if (code === 10000) {
    console.log('add session')
    activeSessionInfo.value = {
      dialogId: data.dialogId,
      operateTime: formatDateTime(data.operateTime),
      dialogTitle: data.dialogTitle,
      messages: []
    }
    sessionList.value.push(activeSessionInfo.value)
    chatMessages.value.messages = []
    return true
  } else {
    return false
  }
}
const handleChangeSession = async (item) => {
  const { code, data } = await getSessionContent({
    dialogId: item.dialogId
  })
  if (code === 10000) {
    data.forEach(d => {
      d.collapse = true // 默认都是展开
    })
    console.log('newData', data)
    item.messages = data
    activeSessionInfo.value = item
    chatMessages.value.messages = activeSessionInfo.value.messages || []
    await nextTick()
    scrollBottom()
  }
}
const controller = ref(null)
const continuePost = ref(true)
const handleRequest = async (e) => {
  if (loading.value) {
    ElMessage.warning('请等待会话结束')
    return false
  }
  if (!userQuery.value.trim()) return
  continuePost.value = true
  console.log('发送请求')
  if (!activeSessionInfo.value) {
    continuePost.value = await handleAddSession(userQuery.value)
  }
  if (!continuePost.value) return
  // 更新最新会话时间
  activeSessionInfo.value.operateTime = new Date().getTime()
  loading.value = true
  chatMessages.value.messages.push({
    source: 1,
    chatContent: userQuery.value
  })
  handleScroll()
  nextTick(() => {
    scrollBottom()
  })
  const params = {
    dialogId: activeSessionInfo.value?.dialogId,
    content: userQuery.value,
    deepThink: deepThink.value
  }
  userQuery.value = null
  try {
    chatMessages.value.messages.push({ source: 2, chatContent: '', thinkingProcess: '', deepThink: deepThink.value, collapse: deepThink.value, thinkingTime: 0, loading: true })
    controller.value = new AbortController()
    // eslint-disable-next-line no-undef
    // console.log(111, __APP_DOMAIN__, typeof __APP_DOMAIN__)
    const token = getToken()
    const response = await fetch(`http://10.31.0.130:8342/api/medical/AIChat/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      // 可选自定义 headers
      },
      signal: controller.value.signal,
      body: JSON.stringify(params)
    })

    if (!response.ok || !response.body) {
      console.error('连接失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        console.log('输出自然结束')
        chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = false
        activeSessionInfo.value.messages = chatMessages.value.messages
        loading.value = false
        break
      }

      buffer += decoder.decode(value, { stream: true })

      // 解析 event-stream 数据（按 \n\n 分隔事件）
      const events = buffer.split('\n\n')
      buffer = events.pop() // 最后一段可能不完整，留到下次循环
      for (const event of events) {
        const lines = event.split('\n')
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.replace(/^data:\s*/, '')
            const delta = JSON.parse(data)
            console.log('收到数据:', data, delta)
            if (delta.thinkingProcess) {
              chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkingProcess += delta.thinkingProcess
              chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkingTime = delta.thinkingTime
            } else if (delta.chatContent) {
              chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = false
              chatMessages.value.messages[chatMessages.value.messages.length - 1].chatContent += delta.chatContent
            }
            if (!showBackToBottom.value) {
              await nextTick()
              scrollBottom()
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('网络好像不太稳定，请稍后重试:', error)
    chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = false
    // chatMessages.value.messages[chatMessages.value.messages.length - 1].chatContent = '请求中断'
    activeSessionInfo.value.messages = chatMessages.value.messages
    loading.value = false
  }
}

const handleStopRequest = () => {
  console.log('请停止请求')
  if (controller.value) {
    controller.value.abort()
    controller.value = null
  }
}
const handleEnterKey = (e) => {
  if ((e.ctrlKey || e.shiftKey) && e.keyCode === 13) { // 用户点击了ctrl+enter或cmd+enter触发
  } else { // 用户点击了enter触发
    e.preventDefault() // 阻止默认换行行为
    handleRequest()
  }
}
const rowCount = ref(2)
const handleInput = (e) => {
  // 计算行数（可能由于rem原因，会造成低于maxRows时出现滚动条）
  const textarea = userQueryRef.value.$el.querySelector('textarea')
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight)
  const height = textarea.scrollHeight
  rowCount.value = Math.round(height / lineHeight)
  // console.log('当前行数:', rowCount.value)
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
  const container = document.querySelector('.right-content .el-scrollbar__wrap')
  if (container) {
    container.scrollTop = container.scrollHeight - container.clientHeight
  }
  // });
}
const userQueryRef = ref(null)
const pageNum = ref(1)
const pageSize = ref(30)
const maxPage = ref(1)
const initSessionList = async () => {
  const { code, data } = await getSessionList({
    pageNum: pageNum.value,
    pageSize: pageSize.value
  })
  if (code === 10000) {
    maxPage.value = data.pages
  }
  // console.log(1234, await getAllItems())
  sessionList.value = data.items

  if (sessionList.value.length) {
    activeSessionInfo.value = handleChangeSession(sessionList.value[0])
  } else {
    activeSessionInfo.value = null
  }
  if (activeSessionInfo.value) {
    chatMessages.value.messages = activeSessionInfo.value.messages || []
  }
}
// 删除会话
const handleDeleteSession = async (dialogId) => {
  const { code } = await deleteSession({
    id: dialogId
  })
  if (code === 10000) {
    ElMessage.success('已删除')
    const index = sessionList.value.findIndex(item => item.dialogId === dialogId)
    if (index !== -1) {
      sessionList.value.splice(index, 1)
      if (activeSessionInfo.value && activeSessionInfo.value.dialogId === dialogId) {
        activeSessionInfo.value = null
        chatMessages.value.messages = []
      }
    }
    localStorage.setItem('sessionList', JSON.stringify(sessionList.value))
    localStorage.setItem('activeSessionInfo', JSON.stringify(activeSessionInfo.value))
    // try {
    //   await deleteItem(dialogId)
    // } catch (err) {
    //   console.error('删除出错：', err)
    // }
  }
}

onMounted(async () => {
  userQueryRef.value.focus()
  initSessionList()
  await nextTick()
  scrollBottom()
})
// 会话滚动处理
const sessionScrollbar = ref(null)
// for (let i = (pageNum.value - 1) * 20; i < pageNum.value * 20; i++) {
//   sessionList.value.push({
//     dialogId: sessionList.value.length + 1,
//     operateTime: '2024-10-01 07:00:00',
//     dialogTitle: `对话${sessionList.value.length + 1}`,
//     messages: []
//   })
// }
const isLoding = ref(false)
const handleSessionScroll = () => {
  if (pageNum.value === maxPage.value) {
    return false
  }
  const container = sessionScrollbar.value.wrapRef
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  if (distanceFromBottom < 50 && pageNum.value < maxPage.value && !isLoding.value) {
    getNextPageData()
  }
}
const getNextPageData = () => {
  console.log('下一页吧')
  isLoding.value = true
  pageNum.value++
  for (let i = (pageNum.value - 1) * 20; i < pageNum.value * 20; i++) {
    sessionList.value.push({
      dialogId: sessionList.value.length + 1,
      operateTime: '2024-10-01 07:00:00',
      dialogTitle: `对话${sessionList.value.length + 1}`,
      messages: []
    })
  }
  isLoding.value = false
}
</script>
<style scoped lang="scss">
@use '@/components/AI/style/AI.scss';
</style>
