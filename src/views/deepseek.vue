<template>
  <div class="AI-div">
    <div class="left-div" v-show="!showSetting">
      <header>deepseek大模型AI助理</header>
      <div class="add-session flexCenter" @click="handleNewSession">
        <i class="iconfont icon-duihua"></i>
        开启新对话
      </div>
      <div class="session-area">
        <el-scrollbar @scroll="handleSessionScroll" ref="sessionScrollbar">
          <DeepseekSessionList :dataList="groupedSessions.todaySessions" :activeSessionInfo="activeSessionInfo" @changeSession="handleChangeSession" @deleteSession="handleDeleteSession" title="今天"/>
          <DeepseekSessionList :dataList="groupedSessions.sevenDaysSessions" :activeSessionInfo="activeSessionInfo" @changeSession="handleChangeSession" @deleteSession="handleDeleteSession" title="七天内"/>
          <DeepseekSessionList :dataList="groupedSessions.historySessions" :activeSessionInfo="activeSessionInfo" @changeSession="handleChangeSession" @deleteSession="handleDeleteSession" title="历史"/>
        </el-scrollbar>
      </div>
      <div class="setting" @click="showSetting = true">
        <div>
          <el-icon><Setting /></el-icon>
          设置
        </div>

      </div>
    </div>
    <div class="right-div" v-show="!showSetting">
      <div class="right-content" :class="{'hasSession': chatMessages.messages.length > 0}">
        <div class="session-title">{{activeSessionInfo?.title}}</div>
        <el-scrollbar @scroll="handleScroll" ref="scrollbar">
          <div class="message-area">
            <DeepseekMessageComp ref="messageRef" :message="chatMessages.messages" :loading="loading" :title="activeSessionInfo?.title" @judgeScrollbar="handleScroll"></DeepseekMessageComp>
          </div>
          <div class="input-area">
            <AIInput ref="AIInputRef" :loading="loading" @handleRequest="handleRequest" @handleStopRequest="handleStopRequest"/>
            <div v-show="showBackToBottom" class="back-to-bottom" @click="scrollBottom">
              <i class="iconfont icon-xiala"></i>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <AISetting @handleBack="handleBack" @getBalance="getBalance" v-if="showSetting" ref="AISettingRef"/>
  </div>
</template>

<script setup>
defineOptions({
  name: 'Deepseek',
  inheritAttrs: false
})
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import OpenAI from 'openai'
import DeepseekMessageComp from '@/components/AI/deepseekMessageComp.vue'
import AIInput from '@/components/AI/AIInput.vue'
import DeepseekSessionList from '@/components/AI/deepseekSessionList.vue'
import AISetting from '@/components/AI/AISetting.vue'
// eslint-disable-next-line no-unused-vars
import { DEEPSEEK_CONFIG, MODEL_CONFIG, STORAGE_KEYS } from '@/config/deepseek'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime } from '@/utils/utils'
// import { getSessionList, getSessionContent } from '@/api/api_AIChat.js'
import { useIndexedDB } from '@/hooks/useIndexedDB'
const { putItem, deleteItem, getStorageUsage, getAllItems } = useIndexedDB(STORAGE_KEYS.indexDBName, STORAGE_KEYS.indexDBTableName)
const sessionList = ref([])
const activeSessionInfo = ref(null)
const apiKey = ref('')
const APIForm = ref(JSON.parse(localStorage.getItem('APIForm')))
if (APIForm.value?.apiKey) {
  apiKey.value = APIForm.value.apiKey
}
const chatMessages = ref({
  messages: []
  // model: 'deepseek-reasoner', // DeepSeek-R1
  // model: 'QwQ-32B',
  // model: APIForm.value?.model || 'deepseek-reasoner', // DeepSeek-R1
  // stream: true,
  // max_tokens: APIForm.value?.max_tokens || 8192, // 限制一次请求中模型生成 completion 的最大 token 数
  // temperature: APIForm.value?.temperature || 0.6 // 严谨与想象 越低越严谨 官方建议0.6
})
const openai = ref(null)
const thinkingEnabled = ref(true)
const loading = ref(false)
const messageRef = ref(null)
// 滚动按钮控制
const showBackToBottom = ref(false)
const showSetting = ref(false)
// const userOperationList = ref([
//   {
//     name: '重命名',
//     icon: 'iconfont icon-bianji2',
//     value: 0
//   },
//   {
//     name: '删除',
//     icon: 'iconfont icon-shanchu3',
//     value: 1
//   }
// ])
const storageStatus = ref(null)
// 监听数据变化
watch(sessionList, async (val) => {
  const list = val.map((o, i) => ({
    ...o,
    messages: o.id === activeSessionInfo.value?.id ? chatMessages.value.messages : o.messages
  }))
  localStorage.setItem(STORAGE_KEYS.sessionList, JSON.stringify(list))
  // 检查存储空间
  const status = await getStorageUsage()
  storageStatus.value = status
  console.log('storageStatus.value', storageStatus.value)
  list.forEach(async newItem => {
    // 添加数据
    console.log('newItem', newItem)
    await putItem(JSON.parse(JSON.stringify(newItem)))
  })
}, { deep: true })
watch(activeSessionInfo, async (val) => {
  localStorage.setItem(STORAGE_KEYS.activeSessionInfo, JSON.stringify(val))
  // await putItem(JSON.parse(JSON.stringify(val)))
}, { deep: true })

const sortAndGroupSessions = () => {
  // 对 sessionList.value 进行排序
  sessionList.value.sort((a, b) => new Date(b.crtTime) - new Date(a.crtTime))

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const sevenDaysAgo = new Date(todayStart)
  sevenDaysAgo.setDate(todayStart.getDate() - 6)
  const todaySessions = []
  const sevenDaysSessions = []
  const historySessions = []

  sessionList.value.forEach(session => {
    const sessionDate = new Date(session.crtTime)

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
const AIInputRef = ref(null)
// 开启新对话
const handleNewSession = () => {
  console.log('new session')
  chatMessages.value.messages = []
  activeSessionInfo.value = null
  AIInputRef.value.initAIInput()
}
const handleAddSession = () => {
  console.log('add session')
  if (loading.value) {
    ElMessage({ type: 'warning', message: '请当前问题查询完成后重试！' })
  }
  activeSessionInfo.value = {
    id: sessionList.value.length + 1,
    crtTime: formatDateTime(new Date()),
    title: `对话${sessionList.value.length + 1}`,
    model: APIForm.value?.model,
    messages: []
  }
  sessionList.value.push(activeSessionInfo.value)
  chatMessages.value.messages = []
  activeSessionInfo.value.id = sessionList.value.length + 1
}
const handleChangeSession = async (item) => {
  activeSessionInfo.value = item
  chatMessages.value.messages = activeSessionInfo.value.messages || []
  await nextTick()
  handleScroll()
  scrollBottom()
  AIInputRef.value.initAIInput()
}
const initOpenAI = () => {
  APIForm.value = JSON.parse(localStorage.getItem('APIForm'))
  let baseURL = ''
  if (APIForm.value?.model === 'QwQ-32B') {
    baseURL = 'http://10.31.0.23:9997/v1'
  } else {
    baseURL = 'https://api.deepseek.com/v1'
  }
  // console.log(111, {
  //   baseURL,
  //   apiKey: APIForm.value?.apiKey
  // })
  openai.value = new OpenAI({
    baseURL,
    apiKey: APIForm.value?.apiKey,
    ...DEEPSEEK_CONFIG
  })
  console.log('初始化成功')
}

const handleRequest = async (inputParams) => {
  apiKey.value = JSON.parse(localStorage.getItem('APIForm'))?.apiKey
  if (!apiKey.value) {
    ElMessage.warning('请先配置API Key')
    return false
  }
  console.log('发送请求')
  AIInputRef.value.initAIInput()
  if (!activeSessionInfo.value) {
    await handleAddSession()
  } else {
    if (activeSessionInfo.value.model !== APIForm.value?.model) {
      ElMessage({ type: 'warning', message: '旧会话所用模型与当前设置不一致，请重新开启新会话！' })
      return false
    }
  }
  // 获取当前时间戳
  const thinkingTimeStart = Date.now()
  chatMessages.value.messages.push({
    role: 'user',
    content: inputParams.content
  })
  handleScroll()
  nextTick(() => {
    scrollBottom()
  })
  try {
    loading.value = true
    chatMessages.value.messages.push({ role: 'assistant', content: '', reasoning_content: '', thinkingEnabled: thinkingEnabled.value, collapse: thinkingEnabled.value, thinkingTime: 0 })
    const requestParams = {
      ...chatMessages.value,
      model: thinkingEnabled.value ? (APIForm.value?.model || 'deepseek-reasoner') : 'deepseek-chat', // DeepSeek-R1
      stream: true,
      max_tokens: APIForm.value?.max_tokens || 8192, // 限制一次请求中模型生成 completion 的最大 token 数
      temperature: APIForm.value?.temperature || 0.6, // 严谨与想象 越低越严谨 官方建议0.6
      thinking_enabled: thinkingEnabled.value
    }
    const new_messages = []
    requestParams.messages.forEach(item => {
      const s_content = {
        role: item.role,
        content: item.content
      }
      new_messages.push(s_content)
    })
    requestParams.messages = new_messages
    // requestParams.messages = requestParams.messages.slice(0, -1)
    const requestConfig = {
      ...requestParams
      // stream: true
    }
    console.log('requestConfig', requestConfig)
    // 删除requestConfig下的messages数组的最后一项
    requestConfig.messages = requestConfig.messages.slice(0, -1)
    // chatMessages.value.messages[chatMessages.value.messages.length - 1].reasoning_content = ''
    // chatMessages.value.messages[chatMessages.value.messages.length - 1].content = ''
    const response = await openai.value.chat.completions.create(requestConfig)
    console.log('response2', response)
    for await (const part of response) {
      if (!part.choices?.length) {
        continue
      }
      const delta = part.choices[0].delta
      if (delta.reasoning_content) {
        chatMessages.value.messages[chatMessages.value.messages.length - 1].reasoning_content += delta.reasoning_content
        const thinkingTime = Math.floor((Date.now() - thinkingTimeStart) / 1000)
        chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkingTime = thinkingTime
      } else if (delta.content) {
        chatMessages.value.messages[chatMessages.value.messages.length - 1].content += delta.content
      }
      if (!showBackToBottom.value) {
        scrollBottom()
      }
    }
    activeSessionInfo.value.messages = chatMessages.value.messages
    loading.value = false
  } catch (error) {
    console.error('网络好像不太稳定，请稍后重试:', error)
    chatMessages.value.messages[chatMessages.value.messages.length - 1].content = error.message
    activeSessionInfo.value.messages = chatMessages.value.messages
    loading.value = false
  }
}
const AISettingRef = ref(null)
// 获取账户余额
const getBalance = async () => {
  apiKey.value = JSON.parse(localStorage.getItem('APIForm'))?.apiKey
  if (!apiKey.value) {
    ElMessage.warning('请先配置API Key')
    return false
  }

  const response = await fetch(`https://api.deepseek.com/v1/user/balance`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey.value}`
    }
  })
  if (!response.ok) {
    throw new Error('获取余额失败')
  }
  const responseData = await response.json()
  const balance = responseData.balance_infos[0].total_balance
  AISettingRef.value.setBalance(balance)
}
const handleStopRequest = () => {
  console.log('根本停不下来')
  ElMessage.warning('根本停不下来')
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
  const div = document.querySelector('.right-content .el-scrollbar__wrap')
  div.scrollTop = div.scrollHeight - div.clientHeight
  // });
}
const initSessionList = async () => {
  // const res = await getSessionList()
  // console.log('res', res)
  console.log(1234, await getAllItems())
  sessionList.value = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessionList) || '[]')
  if (sessionList.value.length) {
    activeSessionInfo.value = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSessionInfo) || null)
  } else {
    activeSessionInfo.value = null
  }
  if (activeSessionInfo.value) {
    chatMessages.value.messages = activeSessionInfo.value.messages || []
  }
}
// 删除会话
const handleDeleteSession = async (id) => {
  const index = sessionList.value.findIndex(item => item.id === id)
  if (index !== -1) {
    sessionList.value.splice(index, 1)
    if (activeSessionInfo.value && activeSessionInfo.value.id === id) {
      activeSessionInfo.value = null
      chatMessages.value.messages = []
    }
  }
  localStorage.setItem(STORAGE_KEYS.sessionList, JSON.stringify(sessionList.value))
  localStorage.setItem(STORAGE_KEYS.activeSessionInfo, JSON.stringify(activeSessionInfo.value))
  try {
    await deleteItem(id)
  } catch (err) {
    console.error('删除出错：', err)
  }
}
// 设置返回
const handleBack = () => {
  showSetting.value = false
  const form = JSON.parse(localStorage.getItem('APIForm'))
  const oldModel = APIForm.value.model
  APIForm.value = form
  initOpenAI()
  // 换了模型，要重新开始会话
  if (form.model !== oldModel) {
    handleNewSession()
  }
}

onMounted(async () => {
  if (!apiKey.value) {
    console.log('请先设置apiKey')
    ElMessageBox.prompt(
      `未找到本地apiKey，请填写apiKey`,
      '请先设置apiKey',
      {
        confirmButtonText: '确 定',
        showCancelButton: false,
        inputPattern: /^sk-[a-zA-Z0-9]{32}$/,
        inputErrorMessage: 'Invalid API Key'
      }
    ).then(async ({ value }) => {
      console.log(value)
      localStorage.setItem('APIForm', JSON.stringify({
        apiKey: value,
        model: 'deepseek-reasoner',
        temperature: 0.6, // 严谨与想象 越低越严谨 官方建议0.6
        max_tokens: 8192 // 限制一次请求中模型生成 completion 的最大 token 数
      }))
      initSessionList()
      initOpenAI()
      await nextTick()
      scrollBottom()
    }).catch(() => {})
    return false
  }
  initSessionList()
  initOpenAI()
  await nextTick()
  AIInputRef.value.initAIInput()
  scrollBottom()
})
// 会话滚动处理
const sessionScrollbar = ref(null)
const pageNum = ref(1)
const maxPage = ref(5)
// for (let i = (pageNum.value - 1) * 20; i < pageNum.value * 20; i++) {
//   sessionList.value.push({
//     id: sessionList.value.length + 1,
//     crtTime: '2024-10-01 07:00:00',
//     title: `对话${sessionList.value.length + 1}`,
//     model: APIForm.value?.model,
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
      id: sessionList.value.length + 1,
      crtTime: '2024-10-01 07:00:00',
      title: `对话${sessionList.value.length + 1}`,
      model: APIForm.value?.model,
      messages: []
    })
  }
  isLoding.value = false
}
</script>
<style scoped lang="scss">
@use '@/components/AI/style/AI.scss';
</style>
