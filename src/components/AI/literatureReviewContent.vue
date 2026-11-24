<template>
  <div class="overviewOutline-container hideMenu" :class="[setSizeClass]">
    <div class="header">
      <span :class="[ 'title', editStatus ? 'editStatus' : 'noEditStatus' ]" v-if="!overviewContentGenerationInProgress">
        <template v-if="!editStatus && editTime"><i class="iconfont icon-xiugai"></i>修改于 {{ editTime }}</template>
        <template v-if="editStatus">一键AI编辑</template>
      </span>
      <span class="overviewContentGenerationInProgress" v-if="overviewContentGenerationInProgress && !isThrowError">
        <Loading :size="16" color="#3670F8" />
        综述内容撰写中...
      </span>
      <span v-else></span>
      <div class="right-btn">
        <div class="AINotice">内容由AI生成，注意甄别，仅供参考</div>
        <div class="setSize">
          字体：
          <span :class="setSizeClass === 'small'? 'active' : ''" @click="setSizeClass = 'small'">A-</span>
          <span :class="setSizeClass === null ? 'active' : ''" @click="setSizeClass = null">A</span>
          <span :class="setSizeClass === 'big'? 'active' : ''" @click="setSizeClass = 'big'">A+</span>
        </div>
        <CommonDownLoad v-if="!editStatus" @handleClick="handleDownload">
          <el-button class="download-btn" type="primary">
            <i class="iconfont icon-daochu2"></i>
            <span>下载报告</span>
          </el-button>
        </CommonDownLoad>
        <el-button type="default" @click="handleCancel" v-if="editStatus"><i class="iconfont icon-quxiao"></i>取消</el-button>
        <el-button type="primary" @click="handleSave" v-if="editStatus"><i class="iconfont icon-baocunweichangyong"></i>保存</el-button>
      </div>
    </div>
    <div class="content-overview">
      <div class="left" v-show="isShowLeftMenu">
        <div class="head">
          <span>
            <i class="iconfont icon-zongshudagang"></i>
            综述大纲
          </span>
          <el-tooltip class="box-item" effect="dark" content="收起大纲" placement="bottom" :disabled="!isShowLeftMenu">
            <i class="iconfont icon-shouqi2" v-if="isShowLeftMenu" @click="isShowLeftMenu = false"></i>
          </el-tooltip>
        </div>
        <div class="treeContainer">
          <el-scrollbar style="height: 100%;">
            <el-tree :data="aiLiteratureReviewIntelligentAgentsData" @node-click="handleNodeClick" default-expand-all :props="treeProps" :expand-on-click-node="false">
              <template #default="{ data }">
                <span class="treeLabel" :title="data.title">
                  {{ data.title }}
                </span>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
      </div>
      <div class="center" :class="{'edit': editStatus}">
        <AILoading v-if="overviewContentGenerationInProgress && !overviewReportContent && !isThrowError"></AILoading>
        <Timeout :text="errorText" @handleRetry="porps.isHistory ? historyInit() : getReviewContent(true)" v-else-if="overviewContentGenerationInProgress && !overviewReportContent && isThrowError"></Timeout>
        <el-scrollbar ref="scrollbarRef" @scroll="handleScroll" v-else>
          <h4 class="title">{{ contentTitle }}</h4>
          <CommonMarkdown ref="CommonMarkdownRef" :source="overviewReportContent" @jump="scrollIntoView" :showToolbar="false" v-if="!editStatus"/>
          <template v-for="(value, index) in mdList" :key="'secition' + index" v-else>
            <div class="section-div">
              <div class="html-content">
                <!-- <CommonMarkdown class="CommonMarkdown" :data-index="index" :ref="el => { if (el) commonMarkdownRefs[index] = el }" :source="value" @jump="scrollIntoView" :showToolbar="false" @update:source="(newContent) => { mdList[index] = newContent }"/> -->
                <AiEditorRenderer :content="value" :ref="el => { if (el) commonMarkdownRefs[index] = el }"/>
              </div>
              <div class="html-footer">
                <AIEdit ref="AIInputRef" :source="value" :urlList="urlList" @handleReplace="val => mdList[index] = val?.newContent"/>
              </div>
            </div>
          </template>
          <!-- <p></p> -->
        </el-scrollbar>
        <div class="btn" @click="editHandler" v-if="!editStatus && !overviewContentGenerationInProgress">
          <i class="iconfont icon-yijianbianji"></i>
          一键AI编辑
        </div>
        <!-- <div class="terminateGeneration" v-if="overviewContentGenerationInProgress">
          <i></i>
          <span>终止生成</span>
        </div> -->

        <el-tooltip class="box-item" effect="dark" content="展开大纲" placement="bottom" :disabled="isShowLeftMenu">
          <i class="iconfont icon-zhankai2 leftMenuBtn" v-if="!isShowLeftMenu" @click="isShowLeftMenu = true"></i>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="展开文献" placement="bottom" :disabled="isShowrightMenu">
          <i class="iconfont icon-shouqi2 rightMenuBtn" v-if="!isShowrightMenu" @click="isShowrightMenu = true"></i>
        </el-tooltip>
      </div>
      <div class="right" v-if="!editStatus && isShowrightMenu">
        <AILoading v-if="overviewContentGenerationInProgress && !isThrowError"></AILoading>
        <el-scrollbar v-else>
          <div class="head">
            <div>
              <span class="title">参考文献</span>
              <i class="iconfont icon-a-wenxian4"></i>共{{referenceList.length}}个
            </div>
            <el-tooltip class="box-item" effect="dark" content="收起文献" placement="bottom" :disabled="!isShowrightMenu">
              <i class="iconfont icon-zhankai2" v-if="isShowrightMenu" @click="isShowrightMenu = false"></i>
            </el-tooltip>
          </div>
          <template v-if="referenceList.length">
            <div class="item" :class="{active:value.url == activeIndex}" v-for="(value,index) in referenceList" :key="index" :id="value.url" @click="toUrl(value.url)">
              <div class="headTitle" :title="value.title" >
                <span v-if="value?.id">[{{ value.id }}]</span>{{ value.title }}
              </div>
              <div class="flexSp">
                <div class="author" :title="value.author">作者：{{ value.authors }}</div>
                <div class="time">时间：{{ value.publish_date }}</div>
              </div>
              <div class="flexSp">
                <!-- <div class="journal" :title="value.journal">摘要：{{ value.journal }}</div> -->
                <!-- <div class="tips">JCR(Q1)</div> -->
                <div class="abstract" :title="value.abstract">摘要：{{ value.abstract }}</div>
              </div>
            </div>
          </template>
          <el-empty :image="emptyLiterature" description="暂未查找到相关文献" v-else/>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup>
import emptyLiterature from '@/assets/emptyLiterature.png'
import CommonMarkdown from '@/components/AI/commonMarkdown.vue'
import CommonDownLoad from '@/components/AI/commonDownLoad.vue'
import { reactive, ref, nextTick, watch, onUnmounted } from 'vue'
import AIEdit from '@/components/AI/AIEdit.vue'
import { getReview, getReference, getHistory, updateReviewText, downloadReview, getReviewOutlineResult, retryCustomReview } from '@/api/api_agent.js'
import { fetchEventSource } from '@microsoft/fetch-event-source'
// import { aiLiteratureDataHandler, aiLiteratureDataHandler2 } from '@/components/AI/js/data.js'
import { getToken } from '@/utils/crypto'
import AILoading from '../common/AILoading.vue'
import Timeout from './timeout.vue'
import { ElMessage } from 'element-plus'
import { blodDownLoadFile } from '@/utils/fileDownload'
import { formatDateTime2 } from '@/utils/utils'
import { throttle } from 'lodash'
import AiEditorRenderer from '@/components/AI/AiEditorRenderer.vue'

const porps = defineProps({
  id: { // 综述大纲id
    type: String,
    default: '',
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  isHistory: { // 是否为历史记录进入
    type: Boolean,
    default: false
  },
  isAiGenerated: { // 是否由AI生成
    type: Boolean,
    default: true
  }
})
const treeProps = reactive({
  label: 'title',
  children: 'children'
})
const SSE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  Accept: 'text/event-stream',
  Authorization: `Bearer ${getToken()}`
}
const isShowLeftMenu = ref(true) // 是否显示左侧菜单
const isShowrightMenu = ref(true) // 是否显示左侧菜单
const setSizeClass = ref(null) // 字体大小类名
const emits = defineEmits(['handleRefreshDialogList'])
const urlList = ref([
  {
    id: 1, // 缩写
    url: '/agent/literatureReview/abbreviation'
  },
  {
    id: 2, // 扩写
    url: '/agent/literatureReview/elaborate'
  },
  {
    id: 3, // 润色
    url: '/agent/literatureReview/rewrite'
  }
])
let controller = null
const contentTitle = ref(porps.title) // 内容标题
const commonMarkdownRefs = ref([]) // 保存每个 CommonMarkdown 组件的 ref
const overviewReportContent = ref('') // 综述报告内容
let cloneOverviewReportContent = '' // 备份综述报告内容
const aiLiteratureReviewIntelligentAgentsData = ref([]) // 综述大纲数据
const mdList = ref([]) // 内容列表
const overviewContentGenerationInProgress = ref(false) // 综述报告生成中
const editStatus = ref(false) // 是否编辑状态
const editTime = ref('') // 编辑时间
const activeIndex = ref(0) // 文稿选中索引
const scrollbarRef = ref(null) // 滚动条ref
const referenceList = ref([]) // 参考文献列表
const isThrowError = ref(false) // 是否抛出错误
const CommonMarkdownRef = ref(null) // 保存 CommonMarkdown 组件的 ref
const errorText = ref('') // 错误提示
// 历史记录进入
const historyInit = () => {
  getHistory({ id: porps.id }).then(res => {
    if (res.code === 10000) {
      overviewReportContent.value = res.data?.review || ''
      cloneOverviewReportContent = overviewReportContent.value
      // aiLiteratureReviewIntelligentAgentsData.value = aiLiteratureDataHandler(res.data?.reviewOutlineList || [])
      editTime.value = res.data?.operatorTime || ''
      contentTitle.value = res.data?.generateReviewTitle || ''
      referenceList.value = res.data?.referencesTextList || []
      if (!overviewReportContent.value) {
        startSSE({ id: porps.id })
      }
    }
  })
}

// 获取参考文献列表
const getReferenceList = async () => {
  getReference({ id: porps.id }).then(res => {
    referenceList.value = res.data?.reference || []
  })
}

// 发送流接口
const startSSE = async (params) => {
  try {
    controller = new AbortController()
    overviewContentGenerationInProgress.value = true
    // eslint-disable-next-line no-undef
    await fetchEventSource(`${window.location.protocol}//${window.location.host}/api/agent/literatureReview/getReply`, {
      method: 'POST',
      headers: SSE_HEADERS,
      body: JSON.stringify(params),
      timeout: 4 * 60 * 1000, // 超时时间为4分钟
      signal: controller.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok) {
          return
        }
        handleError(new Error(`连接失败，状态码: ${response.status}`))
      },
      onmessage(msg) {
        try {
          if (msg.data) {
            const delta = JSON.parse(msg.data)
            handleMessage(delta)
          }
        } catch (error) {
          handleError(new Error('Failed to parse SSE message'))
        }
      },
      onerror(error) {
        handleError(error)
      },
      onclose() {
        handleClose()
      }
    })
  } catch (error) {
    handleClose()
  }
}

// 流接口完成
const handleClose = () => {
  overviewContentGenerationInProgress.value = false
  cloneOverviewReportContent = overviewReportContent.value
  getReferenceList()
}

const isAutoScroll = ref(true) // 是否自动滚动
const STOP_DISTANCE = 60 // 向上滚动超过 60px 就停止自动滚动

// 监听用户滚动
const handleScroll = throttle(() => {
  const container = scrollbarRef.value?.wrapRef
  if (!container) return

  const distanceToBottom =
    container.scrollHeight - container.clientHeight - container.scrollTop

  if (distanceToBottom > STOP_DISTANCE) {
    isAutoScroll.value = false
  } else {
    isAutoScroll.value = true
  }
}, 50) // 每100ms计算一次即可

// 自动滚动到底部（节流）
const scrollBottom = throttle(() => {
  const container = scrollbarRef.value?.wrapRef
  if (container && isAutoScroll.value) {
    container.scrollTop = container.scrollHeight - container.clientHeight
  }
}, 1000)

const handleError = (error) => {
  throw error
}

// 处理流消息
const handleMessage = (delta) => {
  const { content, chatContentType } = delta
  if (chatContentType === 4) {
    ElMessage.error('异常结束')
    errorText.value = '响应超时，网络或服务器可能在忙碌，请稍后重试～'
    isThrowError.value = true
    handleClose()
    return
  } else if (chatContentType === 3) {
    handleClose()
  }
  if (content && Number(chatContentType) === 1) {
    overviewReportContent.value += content
    scrollBottom()
  }
}

// 页面滚动
const scrollIntoView = (index, url) => {
  activeIndex.value = url
  const el = document.getElementById(url)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
// 节点点击跳转
const handleNodeClick = (data) => {
  const tag = data.children ? 1 : 2
  jump(data.title, tag)
}

// 跳转工具：使用 textContent 做稳健比较
const jump = (text, typeNum) => {
  const headings = document.querySelectorAll('h' + typeNum)
  const target = Array.from(headings).find(h => (h.textContent || '').trim().includes((text || '').trim()))
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 一键AI编辑：根据标题切割内容（保留原逻辑，避免异常）
// const editHandler = () => {
//   mdList.value = []
//   let content = overviewReportContent.value || ''
//   const titleList = aiLiteratureReviewIntelligentAgentsData.value.map(item => item.title).filter(Boolean)
//   if (titleList.length === 0 && content.trim() !== '') {
//     mdList.value.push(content)
//   }
//   titleList.forEach((title, index) => {
//     const parts = content.split('# ' + title)
//     if (parts.length > 1) {
//       // 前段（如果有）推入列表，最后一轮会把剩余内容推入
//       if (parts[0] || index > 0) mdList.value.push(parts[0])
//       content = '# ' + title + parts.slice(1).join('# ' + title)
//     }
//   })
//   if (titleList.length > 0) content && mdList.value.push(content)
//   editStatus.value = true
//   setTimeout(() => {
//     scrollbarRef.value?.setScrollTop(0)
//   }, 100)
// }

const editHandler = () => {
  mdList.value = []
  const content = overviewReportContent.value || ''
  const titleList = aiLiteratureReviewIntelligentAgentsData.value.map(item => item.title).filter(Boolean)

  // 没有标题时，整段作为一个部分
  if (titleList.length === 0) {
    if (content.trim() !== '') {
      mdList.value.push(content)
    }
  } else {
    // 构建所有标题的匹配正则（按顺序匹配每个标题）
    const pattern = titleList.map(title => {
      const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return `(?:^|\\n)#\\s+${escaped}`
    }).join('|')

    const regex = new RegExp(pattern, 'gm')
    const matches = []
    let match

    // 找到所有标题位置
    while ((match = regex.exec(content)) !== null) {
      matches.push({ index: match.index, title: match[0].trim() })
    }

    // 按标题位置切割
    if (matches.length === 0) {
      // 没有找到任何标题，整段作为一个部分
      mdList.value.push(content.trim())
    } else {
      // 第一个标题之前的内容
      if (matches[0].index > 0) {
        const before = content.slice(0, matches[0].index).trim()
        if (before) mdList.value.push(before)
      }

      // 每个标题到下一个标题之间的内容
      for (let i = 0; i < matches.length; i++) {
        const startIndex = matches[i].index
        const endIndex = i < matches.length - 1 ? matches[i + 1].index : content.length
        const section = content.slice(startIndex, endIndex).trim()
        if (section) mdList.value.push(section)
      }
    }
  }

  editStatus.value = true
  setTimeout(() => {
    scrollbarRef.value?.setScrollTop(0)
  }, 100)
}

const handlerMenu = () => {
  nextTick(() => {
    const domText = CommonMarkdownRef.value?.getRenderedHTML()
    if (!domText) return
    // 步骤1：提取所有h1/h2标签的原始数据（保留顺序）
    const regex = /<(h1|h2)[^>]*>(.*?)<\/\1>/g
    const allTags = []
    let match
    while ((match = regex.exec(domText)) !== null) {
      allTags.push({
        tagName: match[1],
        content: match[2].trim()
      })
    }

    // 步骤2：构建层级结构（h1为父节点，后续h2归入对应h1的children）
    const result = []
    let currentH1 = null

    allTags.forEach(tag => {
      if (tag.tagName === 'h1') {
        // 遇到h1，创建新节点并加入结果数组，同时更新当前h1
        currentH1 = {
          tagName: 'h1',
          title: tag.content,
          children: [] // 初始化h2子节点数组
        }
        result.push(currentH1)
      } else if (tag.tagName === 'h2' && currentH1) {
        // 遇到h2，归入当前h1的children
        currentH1.children.push({
          tagName: 'h2',
          title: tag.content
        })
      }
    })
    aiLiteratureReviewIntelligentAgentsData.value = result
  })
}

// 取消编辑
const handleCancel = () => {
  editStatus.value = false
  overviewReportContent.value = cloneOverviewReportContent
}
// 保存
const handleSave = () => {
  mdList.value = []
  // 调用每个 CommonMarkdown 组件的 saveContent 方法
  commonMarkdownRefs.value.forEach((ref, index) => {
    if (ref) {
      const content = ref.getContent()
      mdList.value[index] = content
    }
  })
  const data = mdList.value.join('\n\n')
  updateReviewText({ id: porps.id, review: data }).then(res => {
    if (res.code === 10000) {
      overviewReportContent.value = data
      cloneOverviewReportContent = data
      editTime.value = new Date().toLocaleString()
      editStatus.value = false
      commonMarkdownRefs.value = []
      handlerMenu()
    }
  })
}

const toUrl = (url) => {
  if (url) {
    createSuperLabel(url)
  } else {
    ElMessage.error('文献链接不存在')
  }
}

const createSuperLabel = (url) => {
  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('target', '_blank')
  a.setAttribute('id', url)
  // 防止反复添加
  if (!document.getElementById(url)) {
    document.body.appendChild(a)
  }
  a.click()
}

// 处理下载事件
const handleDownload = (item) => {
  if (!overviewContentGenerationInProgress.value) {
    downloadReview({
      fileType: item.value,
      id: porps.id
    }).then(res => {
      const time = formatDateTime2()
      const fileName = `研究热点洞察_#${contentTitle.value}_${time}.${item.fileType}` // 导出文件名
      blodDownLoadFile(res, fileName)
    })
  } else {
    ElMessage.warning('请等待回答完成后再尝试下载')
  }
}

// 定义节流后的回调函数：2秒内只执行一次
const throttleCallback = throttle((newVal) => {
  handlerMenu()
  // 这里写你需要执行的业务逻辑，比如请求接口、更新数据等
}, 3000) // 节流间隔：2000毫秒（2秒）

// 监听inputValue的变化，执行节流后的回调
watch(() => overviewReportContent.value, // 监听的目标
  throttleCallback // 节流后的回调函数
)
// 在需要时主动断开
const stopSSE = () => {
  if (controller) {
    controller.abort()
  }
}
// 注意：组件卸载时清除节流的定时器（防止内存泄漏）
onUnmounted(() => {
  stopSSE()
  stop?.()
  // 调用lodash throttle返回函数的cancel方法，清除定时器
  throttleCallback?.cancel()
})

const startPolling = (apiCall, params, callback, time = 60000) => {
  let isFirstComplete = false // 标记是否第一次业务完成
  let isStopped = false // 标记是否终止轮询
  let timer = null // 定时器实例，用于清理
  // 核心轮询逻辑
  const poll = async () => {
    // 如果已终止，直接返回
    if (isStopped) return
    // 执行API调用，等待请求完成（无论成功/失败都算完成）
    const result = await apiCall(params)
    // 1. API调用成功（基础响应正常）
    if (result) {
      // 执行回调函数
      if (typeof callback === 'function') {
        callback(result)
      }
      // 控制下一次轮询延迟
      const delay = isFirstComplete ? 5000 : time
      isFirstComplete = true
      // 清理旧定时器，避免叠加
      clearTimeout(timer)
      timer = setTimeout(poll, delay)
    }
  }
  // 终止轮询的函数（外部可调用）
  const stopPolling = () => {
    isStopped = true
    clearTimeout(timer) // 清理未执行的定时器
  }
  // 启动第一次轮询
  poll()
  // 返回终止函数，供外部控制
  return stopPolling
}
let stop = null

// 获取综述报告内容
const getReviewContent = async (isRefresh = false) => {
  const params = { id: porps.id }
  if (porps.isAiGenerated) {
    isThrowError.value = false
    getReview(params).then(res => {
      if (res.code === 10000) {
        emits('handleRefreshDialogList')
        startSSE(params)
      }
    })
  } else {
    overviewContentGenerationInProgress.value = true
    isThrowError.value = false
    // 自定义失败重试
    if (isRefresh) {
      await retryCustomReview(params)
    } else {
      emits('handleRefreshDialogList')
    }
    stop = startPolling(getReviewOutlineResult, params, (result) => {
      const data = result.data
      if (data.generateReviewOutlineStatus === 2) {
        stop()
        startSSE(params)
      } else if ([20, 30, 31].includes(data.generateReviewOutlineStatus)) {
        stop()
        if (data.generateReviewOutlineStatus === 30) {
          errorText.value = '很抱歉，在处理您请求的过程中，我们的AI引擎遇到了一个意外错误，无法完成此次任务。'
        } else if (data.generateReviewOutlineStatus === 31) {
          errorText.value = '暂时未检索到与您描述高度契合的现有文献，请尝试简化或拆分您的关键词，或者这可能是您正触及一个极具创新性的研究方向。'
        } else {
          errorText.value = '响应超时，网络或服务器可能在忙碌，请稍后重试～'
        }
        isThrowError.value = true
      }
    }, isRefresh ? 5000 : 60000)
  }
}

// 页面加载完成后初始化
porps.isHistory ? historyInit() : getReviewContent()

</script>
<style lang="scss" scoped>
.overviewOutline-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  background: var(--theme-bg)#f0f3f8;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    height: 65px;
    margin-bottom: 16px;
    padding: 0 24px;
    border-radius: 8px;
    background: var(--theme-card);
    .overviewContentGenerationInProgress {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 18px;
      color: var(--theme-primary);
      .loading {
        margin-right: 12px;
      }
    }
    .title {
      font-weight: 400;
      font-size: 20px;
      color: var(--theme-text-2);
      .iconfont {
        margin-right: 12px;
        font-size: 18px;
      }
      &.editStatus {
        font-weight: 700;
        font-size: 18px;
        color: #3d3d3d;
      }
    }
    .down {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 111px;
      height: 32px;
      border-radius: 32px;
      background: var(--theme-primary);
      cursor: pointer;
      font-weight: 350;
      font-size: 14px;
      color: #fefeff;
      .iconfont {
        margin-right: 5px;
        font-size: 12px;
      }
    }
    .right-btn {
      display: flex;
      align-items: center;

      .setSize {
        display: flex;
        position: relative;
        align-items: center;
        margin: 0 24px 0 24px;
        span {
          display: inline-block;
          box-sizing: border-box;
          width: 32px;
          height: 32px;
          margin: 0 6px;
          border: 1px solid #d8d8d8;
          border-radius: 4px;
          cursor: pointer;
          line-height: 32px;
          text-align: center;
          font-size: 18px;
          color: var(--theme-text-3);
          &.active {
            border: none;
            background-color: var(--theme-primary);
            color: #fff;
          }
        }
        &::after {
          position: absolute;
          left: -24px;
          width: 1px;
          height: 18px;
          background-color: #999;
          content: '';
        }
      }
      .AINotice {
        margin-right: 18px;
        font-weight: 400;
        font-size: 16px;
        color: var(--theme-text-3);
      }
      .el-button {
        height: 40px;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 600;
        font-size: 18px;
        span {
          display: flex;
          align-items: center;
        }
        i {
          margin-right: 6px;
          font-size: 16px;
        }
      }
    }
  }
  .content-overview {
    display: flex;
    overflow: hidden;
    flex: 1;
    width: 100%;
    >div {
      overflow: hidden;
      box-sizing: border-box;
      height: 100%;
    }
  }
  .left {
    width: 300px;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      padding: 18px 18px 12px 18px;
      font-weight: 700;
      font-size: 20px;
      span {
        display: flex;
        align-items: center;
        color: var(--theme-primary);
      }
      .icon-zongshudagang {
        margin-right: 8px;
        font-size: 16px;
      }
    }
    .titleItem {
      display: flex;
      flex-direction: column;
      .item {
        margin-bottom: 14px;
        padding-left: 18px;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-text);
        .subtitle p {
          margin-top: 6px;
          padding-left: 12px;
          font-weight: 400;
          font-size: 12px;
          color: var(--theme-text-2);
        }
      }
    }
  }
  .center {
    overflow: hidden;
    position: relative;
    flex: 1;
    padding: 16px 0;
    border-top-left-radius: v-bind('!isShowLeftMenu ? "8px" : "0px"');
    border-top-right-radius: v-bind('!isShowrightMenu ? "8px" : "0px"');
    border-bottom-left-radius: v-bind('!isShowLeftMenu ? "8px" : "0px"');
    border-bottom-right-radius: v-bind('!isShowrightMenu ? "8px" : "0px"');
    background: var(--theme-primary-soft);

    .title {
      margin: 0;
    }
    &.edit {
      border: none;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      .section-div {
        display: flex;
        flex-direction: column;
        flex: 1;
        box-sizing: border-box;
        padding: 0 16px;
        padding-bottom: 16px;
        border: 1px solid #c9d8fc;
        border-radius: 4px;
        background: rgba(238, 243, 255, 0.5);

        &:not(:first-child) {
          margin-top: 16px;

          :deep(.markdown-body) {
            padding-top: 16px;
          }
        }
      }
      .html-content {
        flex: 1;
        color: var(--theme-text-2);
        &:focus-visible {
          outline: none;
        }
      }
      .html-footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-weight: 500;
        color: var(--theme-primary);

        img {
          width: 12px;
          margin-right: 8px;
        }

        :deep(.question-item) {
          padding: 22px 0 18px;
          border: none;
          border-top: 1px solid #c9d8fc;
          border-radius: inherit;
          background-color: initial;

          .circle {
            display: inline-block;
          }
        }
      }
      // .html-footer {
      //   display: flex;
      //   justify-content: center;
      //   align-items: center;
      //   margin: -32px 16px 16px;
      //   font-weight: 500;
      //   color: var(--theme-primary);
      //   img {
      //     width: 12px;
      //     margin-right: 8px;
      //   }
      //   &.html-footer1 {
      //     height: 45px;
      //     border-top: 1px solid #c9d8fc;
      //   }
      // }
    }
    .el-scrollbar {
      max-width: 1520px;
      margin: 0 auto;
      padding: 0 24px;
    }
    :deep(.common-markdown-wrapper):nth-child(2) .common-markdown {
      padding-top: 0;
    }
    :deep(.common-markdown-wrapper):not(:last-child) {
      margin-bottom: 16px;
    }
    :deep(.markdown-body) {
      background-color: inherit;
    }
    .title {
      text-align: center;
      font-weight: 700;
      font-size: 18px;
      color: #3d3d3d;
    }
    .btn,
    .terminateGeneration {
      display: flex;
      position: fixed;
      left: 51%;
      bottom: 75px;
      justify-content: center;
      align-items: center;
      width: 217px;
      height: 50px;
      border-radius: 50px;
      background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
      cursor: pointer;
      line-height: 50px;
      text-align: center;
      font-weight: 500;
      font-size: 20px;
      color: #fdfdfd;
      img,
      i {
        margin-right: 12px;
        font-size: 18px;
      }
    }
    .terminateGeneration {
      left: 54%;
      width: 156px;
      border: 1px solid #2c67ff;
      background: none;
      color: #2c67ff;
      i {
        display: block;
        width: 12px;
        height: 12px;
        background-color: #2c67ff;
      }
    }
    .leftMenuBtn {
      position: absolute;
      left: 20px;
      top: 20px;
      cursor: pointer;
    }
    .rightMenuBtn {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
    }
  }
  .right {
    overflow: hidden;
    box-sizing: border-box;
    width: 350px;
    height: 100%;
    padding: 16px 0;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    .el-scrollbar {
      padding: 0 16px;
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      .title {
        display: inline-table;
        position: relative;
        margin-right: 24px;
        font-weight: 700;
        font-size: 18px;
        color: var(--theme-primary);
        &::after {
          position: absolute;
          right: -16px;
          top: 4px;
          width: 1px;
          height: 18px;
          background-color: #999;
          content: '';
        }
      }
      .iconfont {
        margin-right: 4px;
      }
      >div {
        font-weight: 400;
        font-size: 16px;
        color: var(--theme-text-3);
      }
    }
    .item {
      box-sizing: border-box;
      margin-bottom: 12px;
      padding: 16px 16px 0 16px;
      border: 1px solid #efefef;
      border-radius: 4px;
      background: var(--theme-card);
      cursor: pointer;
      &.active {
        border-color: transparent;
        background: var(--theme-primary-soft);
      }
      .headTitle {
        overflow: hidden;
        max-width: 230px;
        margin-bottom: 12px;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        font-weight: 500;
        font-size: 18px;
        color: var(--theme-text);
        white-space: nowrap;
        span {
          margin-right: 4px;
          color: var(--theme-primary);
        }
      }
      .flexSp {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        .author,
        .journal {
          overflow: hidden;
          max-width: 130px;
          -o-text-overflow: ellipsis;
          text-overflow: ellipsis;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text-2);
          white-space: nowrap;
        }
        .time {
          font-weight: 500;
          font-size: 16px;
        }
        .tips {
          width: 63px;
          height: 20px;
          border-radius: 20px;
          background-color: #dce6ff;
          line-height: 20px;
          text-align: center;
          font-size: 12px;
          color: var(--theme-primary);
        }
        .abstract {
          display: -webkit-box;
          overflow: hidden;
          line-height: 28px;
          -webkit-line-clamp: 3; /* 显示的行数 */
          text-overflow: ellipsis;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text-2);
          -webkit-box-orient: vertical;
        }
      }
    }
    .el-empty {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      :deep(img) {
        width: 67px;
      }
      p {
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text-2);
      }
    }
  }

  :deep(.ellipsis) {
    overflow: hidden;           /* 隐藏超出部分 */
    text-overflow: ellipsis;    /* 显示省略号 */
    white-space: nowrap;        /* 不换行 */
  }

  .treeContainer {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    // :deep(.el-tree-node__expand-icon.expanded),
    // :deep(.el-tree-node__expand-icon) {
    //   position: absolute;
    //   right: 0;
    // }
    .el-scrollbar {
      margin-bottom: 16px;
    }
    :deep(.el-tree) {
      padding-bottom: 32px;
    }
    :deep(.el-tree-node__expand-icon.expanded) {
      position: absolute;
      right: 0;
      transform: rotate(90deg);
    }
    :deep(.el-tree-node__expand-icon) {
      position: absolute;
      right: 0;
    }
    :deep(.el-checkbox__input.is-checked .el-checkbox__inner,),
    :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
      border-color: var(--theme-primary) !important;
      background-color: var(--theme-primary) !important;
    }
    :deep(.el-tree-node):focus {
      span {
        color: var(--theme-primary);
      }
      .el-tree-node::after {
        background-color: var(--theme-primary);
      }
    }
    :deep(.el-tree-node__content) {
      // width: 100%;
      // max-width: 237px;
      height: 42px;
      padding: 0 16px !important;
      .el-tree-node__label,
      .treeLabel {
        overflow: hidden;           /* 隐藏超出部分 */
        text-overflow: ellipsis;    /* 显示省略号 */
        font-weight: 600;
        font-size: 18px;
        color: var(--theme-text);
        white-space: nowrap;        /* 不换行 */
      }
    }
    :deep(.el-tree-node__children) {
      .el-tree-node__content {
        padding-left: 34px !important;
      }
      .el-tree-node {
        position: relative;
        &::after {
          position: absolute;
          left: 24px;
          top: 50%;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #959595;
          content: '';
          transform: translateY(-50%);
        }
        &:focus::after {
          background-color: var(--theme-primary);
        }
      }
      .treeLabel {
        font-weight: 400;
        font-size: 18px;
        color: var(--theme-text-2);
      }
    }
  }
  &.small {
    .left {
      .head {
        font-size: 14px;
        .icon-zongshudagang,
        .title {
          font-size: 14px !important;
        }
      }
      .treeLabel {
        font-size: 14px;
      }
      :deep(.el-tree-node__content) {
        height: 32px;
      }
    }
    .center {
      .title {
        font-size: 16px;
      }
      :deep(.common-markdown),
      :deep(.editor-container) {
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p {
          line-height: 1.5em;
          font-size: 14px;
        }
      }
      // :deep(.AIEdit) {
      //   .el-textarea__inner,
      //   .left-title,
      //   .edit-button,
      //   .edit-button i {
      //     font-size: 14px !important;
      //   }
      //   .edit-button {
      //     height: 34px;
      //   }
      // }
    }
    .right {
      .headTitle,
      .head {
        font-size: 14px;
        .title {
          font-size: 14px !important;
          &::after {
            height: 14px !important;
          }
        }

        .icon-a-wenxian4 {
          font-size: 14px;
        }
      }
      .author,
      .time,
      .abstract,
      .head>div {
        line-height: 2em !important;
        font-size: 12px !important;
      }
      .abstract {
        line-height: 24px !important;
      }
    }

    .icon-shouqi2,
    .icon-zhankai2 {
      font-size: 14px !important;
      color: var(--theme-text-2);
    }
  }
  &.big {
    .left {
      .head {
        font-size: 24px;
        .icon-zongshudagang {
          font-size: 20px !important;
        }
      }
      .treeLabel {
        font-size: 22px;
      }
      :deep(.el-tree-node__content) {
        height: 48px;
      }
    }
    .center {
      .title {
        font-size: 24px;
      }
      :deep(.common-markdown),
      :deep(.editor-container) {
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        ul li {
          line-height: 1.5em;
          font-size: 22px;
        }
      }
      // :deep(.AIEdit) {
      //   .el-textarea__inner {
      //     height: 2em !important;
      //   }
      // .el-textarea__inner,
      // .left-title,
      // .edit-button,
      // .edit-button i {
      //   font-size: 22px !important;
      // }
      // .edit-button {
      //   height: 54px;
      //   padding: 0 1.5em;
      // }
      // }
    }
    .right {
      :deep(.is-horizontal .el-scrollbar__thumb) {
        display: none;
      }
      .headTitle,
      .head {
        font-size: 22px;
        .title {
          font-size: 22px !important;
          &::after {
            height: 22px !important;
          }
        }
        .icon-a-wenxian4 {
          font-size: 18px;
        }
      }
      .head>div {
        display: flex;
        align-items: center;
        font-size: 20px !important;
      }
      .author,
      .time,
      .abstract {
        max-width: 100% !important;
        line-height: 1.5em !important;
        font-size: 20px !important;
        white-space: pre-wrap;
      }
      .abstract {
        line-height: 32px !important;
      }
      .flexSp {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 0;
      }
      .item {
        padding: 16px;
      }
    }
  }
}
.icon-shouqi2,
.icon-zhankai2 {
  font-size: 16px;
  color: var(--theme-text-2);
}
</style>
