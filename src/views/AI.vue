<template>
  <div class="AI-div">
    <div class="left-div" v-show="isShowLeftMenu">
      <div class="show-time" style="display: none;">显示时间 <el-switch v-model="showTime" /></div>
      <header>
        <span>
          <img src="@/assets/AI-icon.png">颐邦智脉智能体
        </span>
        <el-tooltip class="box-item" effect="dark" content="收起边栏" placement="top">
          <i class="iconfont icon-bianlanshouqi" @click="isShowLeftMenu = false"></i>
        </el-tooltip>
      </header>
      <!-- <div class="add-session flexCenter" @click="handleNewSession('normal')">
        <i class="iconfont icon-duihua"></i>
        开启新对话
      </div> -->
      <div class="sessionType-list">
        <template v-for="item in sessionTypes" :key="item.type" >
          <div class="type-item" :class="{'active': sessionType === item.type && !activeSessionInfo}" @click="handleNewSession(item.type)" v-if="item.show">
            <i :class="item.icon"></i>
            {{item.name}}
          </div>
        </template>

        <!-- <div class="splitLine"></div> -->
      </div>
      <div class="session-area">
        <el-scrollbar @scroll="handleSessionScroll" ref="sessionScrollbar">
          <SessionList
            v-for="section in sessionSections"
            :key="section.key"
            :dataList="groupedSessions[section.key]"
            :title="section.title"
            :activeSessionInfo="activeSessionInfo"
            :showTime="showTime"
            @changeSession="handleChangeSession"
            @deleteSession="handleDeleteSession"
          />
        </el-scrollbar>
      </div>
    </div>
    <div class="right-div">
      <el-tooltip class="box-item" effect="dark" content="展开边栏" placement="bottom" :disabled="isShowLeftMenu">
        <div class="openMenu" v-if="!isShowLeftMenu" @click="isShowLeftMenu = true">
          <i class="iconfont icon-bianlanzhankai"></i>
        </div>
      </el-tooltip>
      <div class="right-content" :class="{'hasSession': chatMessages.messages.length > 0}">
        <div :class="{'normal-area':true,'initPage':!activeSessionInfo}" v-show="['normal', 'dataAnalysis'].includes(sessionType)">
          <div class="session-title" v-if="activeSessionInfo">{{activeSessionInfo?.dialogTitle || '新对话'}}</div>
          <el-scrollbar class="normalScroll" @scroll="handleScroll" ref="scrollbar" :class="{'showViewDiv': showViewDiv}">
            <div class="message-area">
              <MessageComp ref="messageRef" :message="chatMessages.messages" :sessionType="sessionType" :loading="loading" :title="activeSessionInfo?.dialogTitle" @handleClickCollapse="handleClickCollapse" @judgeScrollbar="handleScroll"></MessageComp>
            </div>
            <div class="input-area">
              <AIInput ref="AIInputRef" :sessionType="sessionType" :dialogId="activeSessionInfo?.dialogId" :loading="loading" @handleRequest="handleRequest" @handleStopRequest="handleStopRequest"/>
              <div v-show="showBackToBottom" class="back-to-bottom" @click="scrollBottom">
                <i class="iconfont icon-xiala"></i>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <div class="section-area" v-if="!['normal', 'dataAnalysis'].includes(sessionType)">
          <template v-if="sessionType === 'section1'">
            <outlineOfLiteratureReview @handleRefreshDialogList="handleRefreshDialogList" :id="activeSessionInfo?.dialogId" :key="`outline-${sectionKey}`"/>
          </template>
          <template v-if="sessionType === 'section2'">
            <researchTopic @handleRefreshDialogList="handleRefreshDialogList" :activeSessionInfo="activeSessionInfo" @next="nextSection4" :key="`topic-${sectionKey}`"></researchTopic>
          </template>
          <template v-if="sessionType === 'section3'">
            <ResearchSchemeAgent :activeSessionInfo="activeSessionInfo" :dialogId="activeSessionInfo?.dialogId" :text="paramsText" @handleRefreshDialogList="handleRefreshDialogList" :key="`research-${sectionKey}`"></ResearchSchemeAgent>
          </template>
          <template v-if="sessionType === 'section4'">
            <createResearch :defaultData="defaultData" @next="nextSection5" :key="`create-${sectionKey}`"></createResearch>
          </template>
          <template v-if="sessionType === 'section5'">
            <DataAnalysisAgent :defaultStep="defaultStep" :key="`data-${sectionKey}`"></DataAnalysisAgent>
          </template>
        </div>
      </div>
    </div>
    <div class="view-div" v-if="showViewDiv">
      <AIOperationLogDefault :nodeData="nodeData" ref="operationLogDefaultRef" @close="handleCloseViewDiv"></AIOperationLogDefault>
    </div>
    <feedback ref="feedbackRef" v-show="['section1','section2','section3'].includes(sessionType)" :sessionType="sessionType"></feedback>

  </div>
</template>

<script setup>
defineOptions({
  name: 'AI',
  inheritAttrs: false
})
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from 'vue'
import MessageComp from '@/components/AI/messageComp.vue'
import AIInput from '@/components/AI/AIInput.vue'
import SessionList from '@/components/AI/sessionList.vue'
import { ElMessage } from 'element-plus'
import { formatDateTime } from '@/utils/utils'
import { newSession, getSessionList, deleteSession, getSessionContent, stopSession, sendSessionRequest } from '@/api/api_AIChat.js'
import { getToken } from '@/utils/crypto'
import throttle from 'lodash/throttle'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import AIOperationLogDefault from '@/components/dataAnalysis/engineeringLibrary/AIOperationLogDefault.vue'
import ResearchSchemeAgent from '@/components/AI/ResearchSchemeAgent.vue'
import DataAnalysisAgent from '@/components/AI/DataAnalysisAgent.vue'
import outlineOfLiteratureReview from '@/components/AI/outlineOfLiteratureReview.vue'
import researchTopic from '@/components/AI/researchTopic.vue'
import createResearch from '@/components/AI/createResearch.vue'
import feedback from '@/components/common/feedback.vue'
import { getPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/AI')
// import { useIndexedDB } from '@/hooks/useIndexedDB'
// const { putItem, deleteItem, getStorageUsage, getAllItems } = useIndexedDB('ebond-chat', 'history-message')
const sessionTypes = [
  // {
  //   type: 'dataAnalysis',
  //   name: '数据分析',
  //   icon: 'iconfont icon-zhexiantu-01'
  // },
  {
    type: 'section1',
    name: '研究热点洞察',
    icon: 'iconfont icon-AIwenxianzongshuzhinengti',
    show: !needCheckPermission.value || hadPermissionList.value.includes('研究热点洞察')
  },
  {
    type: 'section2',
    name: '基金选题推荐',
    icon: 'iconfont icon-AIxuanti',
    show: !needCheckPermission.value || hadPermissionList.value.includes('基金选题推荐')
  },
  {
    type: 'section3',
    name: 'GCP/IIT方案',
    icon: 'iconfont icon-AIfangan',
    show: !needCheckPermission.value || hadPermissionList.value.includes('GCP/IIT方案')
  },
  {
    type: 'section4',
    name: '智能专病队列',
    icon: 'iconfont icon-chuangjianyanjiuduilie',
    show: !needCheckPermission.value || hadPermissionList.value.includes('研究队列智能体')
  },
  {
    type: 'section5',
    name: 'AI全栈数据分析',
    icon: 'iconfont icon-AIshujufenxi',
    show: !needCheckPermission.value || hadPermissionList.value.includes('数据分析智能体')
  },
  {
    type: 'section6',
    name: '样本量评估',
    icon: 'iconfont icon-yangbenliangpinggu',
    show: true
  },
  {
    type: 'section7',
    name: '手术/诊疗规划',
    icon: 'iconfont icon-a-shoushuzhenliaoguihua',
    show: true
  }
]
const isShowLeftMenu = ref(true)
const sessionList = ref([])
const activeSessionInfo = ref(null)
const chatMessages = ref({
  messages: []
})
const loading = ref(false)
const messageRef = ref(null)
// 滚动按钮控制
const showBackToBottom = ref(false)
const showViewDiv = ref(false)
const nodeData = ref({
  bigGroup: '',
  id: '',
  smallGroup: ''
})
// const storageStatus = ref(null)
// 监听数据变化
watch(sessionList, async (val) => {
  // const list = val.map((o, i) => ({
  //   ...o,
  //   messages: o.dialogId === activeSessionInfo.value?.dialogId ? chatMessages.value.messages : o.messages
  // }))
  // localStorage.setItem('sessionList', JSON.stringify(list))
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

const getYearMonth = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

const sortAndGroupSessions = () => {
  // 对 sessionList.value 进行排序
  sessionList.value?.sort((a, b) => new Date(b.operateTime) - new Date(a.operateTime))

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const sevenDaysAgo = new Date(todayStart)
  sevenDaysAgo.setDate(todayStart.getDate() - 6)
  const todaySessions = []
  const sevenDaysSessions = []
  const monthlySessionsMap = new Map()

  sessionList.value?.forEach(session => {
    const sessionDate = new Date(session.operateTime)
    if (sessionDate >= todayStart) {
      todaySessions.push(session)
    } else if (sessionDate >= sevenDaysAgo) {
      sevenDaysSessions.push(session)
    } else {
      const yearMonth = getYearMonth(session.operateTime)
      if (!monthlySessionsMap.has(yearMonth)) {
        monthlySessionsMap.set(yearMonth, [])
      }
      monthlySessionsMap.get(yearMonth).push(session)
    }
  })

  const result = {
    todaySessions,
    sevenDaysSessions
  }

  const sortedMonths = Array.from(monthlySessionsMap.keys()).sort().reverse()
  sortedMonths.forEach(yearMonth => {
    result[`month_${yearMonth}`] = monthlySessionsMap.get(yearMonth)
  })

  return result
}
const groupedSessions = computed(() => {
  return sortAndGroupSessions()
})
const sessionSections = computed(() => {
  const sections = [
    { key: 'todaySessions', title: '今天' },
    { key: 'sevenDaysSessions', title: '七天内' }
  ]

  const grouped = groupedSessions.value
  Object.keys(grouped).forEach(key => {
    if (key.startsWith('month_') && grouped[key]?.length > 0) {
      const yearMonth = key.replace('month_', '')
      sections.push({
        key,
        title: yearMonth
      })
    }
  })

  return sections
})
const AIInputRef = ref(null)
// 选择sessionTypes中第一个show为true的sessionType
const sessionType = ref(sessionTypes.find(item => item.show)?.type || 'normal')
const sectionKey = ref(Date.now())
// 开启新对话
const handleNewSession = (type) => {
  // if (loading.value) {
  //   ElMessage({ type: 'warning', message: '请等待当前问题结束后重试！' })
  //   return false
  // }
  console.log('new session')
  feedbackRef.value?.handleClose()
  showViewDiv.value = false
  sessionType.value = type
  activeSessionInfo.value = null
  chatMessages.value.messages = []
  AIInputRef.value.initAIInput()
  stopSSE()
  sectionKey.value = Date.now()
}
const handleAddSession = async (queryContent) => {
  const { code, data } = await newSession({
    content: queryContent
  })
  if (code === 10000) {
    console.log('add session')
    activeSessionInfo.value = {
      chatType: sessionType.value === 'dataAnalysis' ? 2 : 1,
      dialogId: data.dialogId,
      operateTime: formatDateTime(data.operateTime),
      dialogTitle: data.dialogTitle,
      replyStatus: 1,
      messages: []
    }
    sessionList.value.push(activeSessionInfo.value)
    return true
  } else {
    return false
  }
}
const feedbackRef = ref()
const handleChangeSession = async (item) => {
  // if (loading.value) {
  //   ElMessage({ type: 'warning', message: '请等待当前问题结束后重试！' })
  //   return false
  // }
  feedbackRef.value?.handleClose()

  stopSSE()
  showViewDiv.value = false
  activeSessionInfo.value = item
  if (item.chatType === 1) {
    sessionType.value = 'normal'
  } else if (item.chatType === 2) {
    sessionType.value = 'dataAnalysis'
  } else if (item.chatType === 3) {
    sessionType.value = 'section1'
  } else if (item.chatType === 4) {
    sessionType.value = 'section2'
  } else if (item.chatType === 5) {
    sessionType.value = 'section3'
  }
  // nextTick(() => {
  sectionKey.value = Date.now()
  // })
  if (item.chatType === 1 && item.dialogId) {
    const { code, data } = await getSessionContent({
      dialogId: item.dialogId
    })
    if (code === 10000) {
      data.forEach(d => {
        d.collapse = true // 默认都是展开
      })
      console.log('newData', data)
      // 如果data.length是偶数
      if (data.length % 2 === 0) {
        item.messages = data
      } else {
        item.messages = data.concat({
          chatContent: '',
          source: 2,
          collapse: true,
          thinkingProcess: '',
          deepThink: data[data.length - 1].deepThink,
          thinkingTime: 0,
          loading: false,
          thinkStatus: data[data.length - 1].thinkStatus
        })
      }
      item.messages.forEach(delta => {
        if (delta.additionList && delta.additionList.length > 0 && !delta.result) {
          delta.attachment = {
            name: delta.additionList[0].fileName,
            size: delta.additionList[0].fileSize,
            fileUrl: delta.additionList[0].fileUrl
          }
        }
      })
      chatMessages.value.messages = activeSessionInfo.value.messages || []
      await nextTick()
      handleScroll()
      scrollBottom()
      AIInputRef.value.initAIInput()
      // 判断会话有没有结束,未结束，则继续开始流式接口
      if (item.replyStatus === 1) {
        startSSE(item.dialogId)
      }
    }
  }
}

const continuePost = ref(true)
let controller = null
// 在需要时主动断开
const stopSSE = () => {
  if (controller && loading.value) {
    console.log('前端主动终止 SSE 连接')
    controller.abort()
    if (chatMessages.value.messages.length > 1) {
      chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = false
    }
    loading.value = false
  }
}
const SSE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  Accept: 'text/event-stream',
  Authorization: `Bearer ${getToken()}`
}
// 更新当前对话
const updateCurrentChat = (inputParams) => {
  console.log('inputParams', inputParams)
  if (inputParams.fileInfo?.id && inputParams.fileInfo?.fileStatus) {
    chatMessages.value.messages.push({
      source: 1,
      chatContent: inputParams.content,
      attachment: inputParams.fileInfo
    })
  } else {
    chatMessages.value.messages.push({
      source: 1,
      chatContent: inputParams.content
    })
  }
  chatMessages.value.messages.push({ source: 2, chatContent: '', thinkingProcess: '', deepThink: inputParams.deepThink, collapse: inputParams.deepThink, thinkingTime: 0, loading: true, thinkStatus: inputParams.deepThink ? 2 : '' })
  handleScroll()
  nextTick(() => {
    scrollBottom()
  })
}

// 处理流消息
const handleMessage = (delta) => {
  console.log('收到数据:', delta)
  if (delta.thinkingProcess && activeSessionInfo.value?.dialogId === delta.dialogId) {
    console.log('思考数据')
    chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = true
    chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkingProcess += delta.thinkingProcess
    chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkingTime = delta.thinkingTime
  } else if (delta.chatContent && activeSessionInfo.value?.dialogId === delta.dialogId) {
    console.log('正文数据')
    chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = true
    chatMessages.value.messages[chatMessages.value.messages.length - 1].chatContent += delta.chatContent
    if (delta.fileUrl && !delta.result) {
      chatMessages.value.messages[chatMessages.value.messages.length - 1].attachment = {
        name: delta.fileName,
        size: delta.fileSize,
        fileUrl: delta.fileUrl
      }
    } else if (delta.result) {
      chatMessages.value.messages[chatMessages.value.messages.length - 1].tasks = [{
        name: delta.smallGroup,
        bigGroup: delta.bigGroup,
        smallGroup: delta.smallGroup,
        id: delta.fileId,
        show: false
      }]
    }
  } else if (activeSessionInfo.value?.dialogId === delta.dialogId) {
    // 3是结束
    console.log('delta.chatContentType', delta.chatContentType)
    if (delta.chatContentType === 3) {
      activeSessionInfo.value.replyStatus = 2
    }
  } else {
    console.log('没找到主', activeSessionInfo.value?.dialogId, delta.dialogId)
  }
  if (activeSessionInfo.value?.dialogId === delta.dialogId) {
    chatMessages.value.messages[chatMessages.value.messages.length - 1].thinkStatus = delta.thinkStatus
    activeSessionInfo.value.messages = chatMessages.value.messages
  }

  if (!showBackToBottom.value) {
    nextTick().then(scrollBottom)
  }
}
const handleClose = () => {
  loading.value = false
  if (chatMessages.value) {
    chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = false
    activeSessionInfo.value.messages = chatMessages.value.messages
  }
}
const handleError = (error) => {
  throw error
}

// 思考状态： 1思考完成  2思考中 3 思考已停止
const handleRequest = async (inputParams) => {
  if (loading.value || chatMessages.value.messages[chatMessages.value.messages.length - 1]?.loading) {
    ElMessage.warning('请等待当前问题结束后重试！')
    return false
  }
  continuePost.value = true
  console.log('发送请求')
  if (sessionType.value === 'dataAnalysis') {
    AIInputRef.value.initAIInputWithFile()
  } else {
    AIInputRef.value.initAIInput()
  }
  if (!activeSessionInfo.value) {
    activeSessionInfo.value = {} // 快速出现默认标题
    chatMessages.value.messages = []
    updateCurrentChat(inputParams)
    continuePost.value = await handleAddSession(inputParams.content)
  } else {
    activeSessionInfo.value.replyStatus = 1
    updateCurrentChat(inputParams)
  }
  if (!continuePost.value) {
    loading.value = false
    chatMessages.value.messages.forEach(item => {
      item.loading = false
    })
    return false
  }
  // 更新最新会话时间
  activeSessionInfo.value.operateTime = new Date().getTime()
  let params = ''
  if (sessionType.value === 'dataAnalysis') {
    params = {
      dialogId: activeSessionInfo.value?.dialogId,
      deepThink: inputParams.fileInfo?.id ? false : inputParams.deepThink,
      content: inputParams.content,
      fileId: inputParams.fileInfo?.id
    }
  } else {
    params = {
      dialogId: activeSessionInfo.value?.dialogId,
      deepThink: inputParams.deepThink,
      content: inputParams.content
    }
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
    // 让加载圈圈及时转起来
    if (chatMessages.value.messages.length > 1) {
      chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = true
    }
    // eslint-disable-next-line no-undef
    await fetchEventSource(`${window.location.protocol}//${window.location.host}/api/medical/AIChat/getReply`, {
      method: 'POST',
      headers: SSE_HEADERS,
      body: JSON.stringify({
        dialogId
      }),
      signal: controller.signal,
      openWhenHidden: true, // 作用：页面隐藏时是否保持连接，标准的做法应该是true，但应后端要求（后端希望切换会话时断开连接），先设为false
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
    dialogId: activeSessionInfo.value.dialogId
  })
  if (code === 10000) {
    console.log('停止成功')
  }
}
const scrollbar = ref(null)
// 滚动处理
const handleScroll = throttle((e) => {
  const container = scrollbar.value?.wrapRef
  if (!container) return
  const threshold = 100
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  showBackToBottom.value = distanceFromBottom > threshold
}, 200)

const scrollBottom = () => {
  console.log('滚动到最底部')
  const container = scrollbar.value?.wrapRef
  if (container) {
    container.scrollTop = container.scrollHeight - container.clientHeight
  }
}
const pageNum = ref(1)
const pageSize = ref(50)
const maxPage = ref(1)
const initSessionList = async () => {
  const { code, data } = await getSessionList({
    pageNum: pageNum.value,
    pageSize: pageSize.value
  })
  if (code === 10000) {
    maxPage.value = data.pages
    sessionList.value = data.items
  }

  if (sessionList.value?.length) {
    const localActiveSessionInfo = JSON.parse(localStorage.getItem('activeSessionInfo'))
    if (localActiveSessionInfo && localActiveSessionInfo !== '{}') {
      activeSessionInfo.value = localActiveSessionInfo
      handleChangeSession(activeSessionInfo.value)
    }
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
      // 如果删除的是当前会话，则清空
      if (activeSessionInfo.value && activeSessionInfo.value.dialogId === dialogId) {
        activeSessionInfo.value = null
        chatMessages.value.messages = []
        sessionType.value = sessionTypes.find(item => item.show)?.type || 'normal'
        sectionKey.value = Date.now()
      }
    }
    localStorage.setItem('activeSessionInfo', JSON.stringify(activeSessionInfo.value))
  }
}

onMounted(async () => {
  initSessionList()
  await nextTick()
  scrollBottom()
  AIInputRef.value.initAIInput()
  window.addEventListener('beforeunload', handleBeforeUnload)
})
// 会话滚动处理
const sessionScrollbar = ref(null)
const isLodingNextPage = ref(false)
const handleSessionScroll = throttle(() => {
  if (pageNum.value === maxPage.value) {
    return false
  }
  const container = sessionScrollbar.value.wrapRef
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  console.log('distanceFromBottom', distanceFromBottom)
  if (distanceFromBottom < 50 && pageNum.value < maxPage.value && !isLodingNextPage.value) {
    getNextPageData()
  }
}, 200)

const getNextPageData = async () => {
  console.log('下一页吧')
  isLodingNextPage.value = true
  pageNum.value++
  const { code, data } = await getSessionList({
    pageNum: pageNum.value,
    pageSize: pageSize.value
  })
  if (code === 10000) {
    maxPage.value = data.pages
    sessionList.value = sessionList.value.concat(data.items)
  }
  isLodingNextPage.value = false
}
onUnmounted(() => {
  handleBeforeUnload()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
const handleBeforeUnload = () => {
  // localStorage.removeItem('activeSessionInfo')
  // localStorage.removeItem('sessionList')
  if (loading.value) {
    handleStopRequest()
  }
  stopSSE()
}
const showTime = ref(false)
// 展开数据分析详情
const handleClickCollapse = (id) => {
  console.log('id', id)
  if (id) {
    nodeData.value.id = id
    showViewDiv.value = true
  } else {
    showViewDiv.value = false
  }
}
// 关闭数据分析详情
const handleCloseViewDiv = () => {
  showViewDiv.value = false
  document.querySelectorAll('.md-collapse-toggle').forEach((item) => {
    item.classList.remove('md-collapse-toggle-active')
    // 排除当前button
    item.innerHTML = '展开查看 <i class="iconfont icon-arrowDown"></i>'
  })
}
const defaultData = ref('')

const defaultStep = ref(0)
const paramsText = ref('')
const nextSection4 = (val) => {
  console.log('val', val)
  paramsText.value = val
  handleNewSession('section3')
}
const nextSection5 = () => {
  sessionType.value = 'section5'
  defaultStep.value = 1
}
// 刷新左侧会话列表，并定位高亮
const handleRefreshDialogList = async (dialog) => {
  const { code, data } = await getSessionList({
    pageNum: pageNum.value,
    pageSize: pageSize.value
  })
  if (code === 10000) {
    maxPage.value = data.pages
    sessionList.value = data.items
  }
  if (dialog) {
    const obj = sessionList.value.find(item => item.dialogId === dialog)
    activeSessionInfo.value = obj
  }
  localStorage.setItem('activeSessionInfo', JSON.stringify(activeSessionInfo.value))
  chatMessages.value.messages = activeSessionInfo.value.messages || []
}
</script>
<style scoped lang="scss">
@use '@/components/AI/style/AI.scss';
.left-div {
  position: relative;
  .show-time {
    position: absolute;
    right: 0;
    top: 12px;
    color: var(--theme-text);
  }
}
.normal-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: var(--theme-card);
  &.initPage {
    background: url('@/assets/aiBg.png') no-repeat;
    background-size: 100% 100%;
    :deep(.input-area) {
      background: transparent;
      background-color: unset !important;
    }
  }
}
.section-area {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  :deep(.el-scrollbar__view) {
    width: 100% !important;
  }
}
</style>
<style>
  .el-popper span {
    font-size: 18px;
  }
</style>
