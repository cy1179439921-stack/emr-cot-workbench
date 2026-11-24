<template>
  <div class="programme">
    <div class="progress-div">
      <div class="progress-frame">
        <div class="info">
          <div class="left">
            <img src="@/assets/question-mark.png" v-if="sectionList.some(item => item.status === 1)"/>
            <span v-if="sectionList.some(item => item.status === 1)">正在生成研究方案-并行生成阶段...</span>
            <div class="successIcon flexCenter" v-if="sectionList.every(item => item.status !== 1)">
              <i class="iconfont icon-wancheng-1"></i>
            </div>
            <span v-if="sectionList.some(item => item.status === 3)">部分章节生成成功，异常章节可点击重新生成</span>
            <span v-if="sectionList.every(item => item.status === 2)">生成成功</span>
          </div>
          <div class="right">
            <div><el-icon><Clock /></el-icon>用时: {{time || 0}}s</div>
            <div class="line"></div>
            <div>进度: {{percentage}}%</div>
          </div>
        </div>
        <el-progress :percentage="percentage" :show-text="false"/>
      </div>
    </div>
    <div class="bottom-div" :class="[setSizeClass]">
      <div class="bottom-left" v-if="isShowLeftMenu">
        <div class="section-list">
          <header>
            <span>
              <i class="iconfont icon-beijingfenxi"></i>
              <span>方案章节</span>
            </span>
            <el-tooltip class="box-item" effect="dark" content="收起章节" placement="bottom" :disabled="!isShowLeftMenu">
              <i class="iconfont icon-shouqi2" v-if="isShowLeftMenu" @click="isShowLeftMenu = false"></i>
            </el-tooltip>
          </header>
          <el-scrollbar>
            <div class="section" v-for="(item, index) in sectionList" :key="'section-' + index">
              <div class="timeline">
                <div class="circle"></div>
                <div class="line" :class="{'last-line': index === sectionList.length - 1}"></div>
              </div>
              <div class="section-content">
                <div class="section-top">
                  <div class="title">{{item.name}}</div>
                  <div class="score" :class="getScoreClass(item.score)" v-if="!item.loading && item.status !== 1 && item.scoreStatus !== 1 && item.id !== 12">
                    质量：
                    <Loading :size="14" color="#3670f8" v-if="item.scoreStatus === 1"/>
                    <span class="text" v-else>{{item.score}}/10</span>
                  </div>
                </div>
                <div class="section-bottom" :class="{'error': item.status === 3}" @click="handleClick(item)">
                  <div>
                    <Loading :size="14" :loading="item.loading || item.status === 1" v-if="item.loading || item.status === 1">
                      <span class="custom-text">生成中</span>
                    </Loading>
                    <span class="statusText" v-else-if="item.status === 3">
                      <el-icon><CircleCloseFilled /></el-icon>生成失败
                    </span>
                    <span v-else><el-icon><SuccessFilled /></el-icon>已完成</span>
                  </div>
                  <div v-if="item.status !== 3">{{getRenderedCharCount(item)}}字符</div>
                  <div @click.stop="handleRetrySection(item)" v-if="item.status === 3">重新生成</div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <footer class="checkResult-div" v-if="!showCheckReport && ![1].includes(statusCode) && sectionList[11]?.status !== 3">
          <div class="footer-header"><i class="iconfont icon-zhiliangjiaoyan"></i>质量校验结果</div>
          <template v-if="isCheckLoading">
            <div class="isLoading">
              <AILoading></AILoading>
              <div class="text">正在生成中...</div>
            </div>
          </template>
          <template v-else>
            <AIQualityResult mode="thumbnail" :info="qualityResult"/>
            <div class="operation">
              <div class="btn btn1" @click="handleFooterClick(1)">
                重新校验
              </div>
              <div class="line"></div>
              <div class="btn btn2" @click="handleFooterClick(2)">查看校验报告</div>
            </div>
          </template>
        </footer>
      </div>
      <div class="bottom-right" v-show="!showCheckReport" v-if="[1, 2].includes(statusCode)">
        <header class="header1">
          <div class="flex">
            <el-tooltip class="box-item" effect="dark" content="展开章节" placement="bottom" :disabled="isShowLeftMenu">
              <i class="iconfont icon-zhankai2 leftMenuBtn leftMenuBtn1" v-if="!isShowLeftMenu" @click="isShowLeftMenu = true"></i>
            </el-tooltip>
            <div class="left">
              <Loading v-if="totalLoading"></Loading>
              <span v-if="totalLoading">实时生成：</span>
            </div>
          </div>
          <div class="right" v-if="!totalLoading">
            <div class="AINotice">内容由AI生成，注意甄别，仅供参考</div>
            <div class="setSize">
              字体：
              <span :class="setSizeClass === 'small'? 'active' : ''" @click="setSizeClass = 'small'">A-</span>
              <span :class="setSizeClass === null ? 'active' : ''" @click="setSizeClass = null">A</span>
              <span :class="setSizeClass === 'big'? 'active' : ''" @click="setSizeClass = 'big'">A+</span>
            </div>
            <CommonDownLoad v-if="curMode === 'onlyRead'" @handleClick="handleDownload">
              <el-button class="download-btn" type="primary">
                <i class="iconfont icon-daochu2"></i>
                <span>下载报告</span>
              </el-button>
            </CommonDownLoad>
            <el-button type="default" @click="handleCancel" v-if="curMode === 'edit'"><i class="iconfont icon-quxiao"></i>取消</el-button>
            <el-button type="primary" @click="handleSave" v-if="curMode === 'edit'"><i class="iconfont icon-baocunweichangyong"></i>保存</el-button>
          </div>
        </header>
        <div class="preview" :class="curMode">
          <div class="AILoadingF" v-if="sectionList.every(item => item.status === 1 && item.content === '')">
            <AILoading ></AILoading>
            <div class="loadingText">{{ loadingText }}</div>
          </div>
          <el-scrollbar class="right-el-scrollbar" id="pdfId" ref="scrollbarRef" v-else>
            <template v-for="(item,index) in sectionList" :key="'section-' + index">
              <div class="section-div">
                <div class="html-content" v-if="curMode === 'onlyRead' || index === 11">
                  <CommonMarkdown
                    :ref="el => { if (el) commonMarkdownRefs[index] = el }"
                    :mode="curMode"
                    v-model:source="item.content"
                    @jump="handleJump"/>
                </div>
                <!-- 编辑模式：使用 AiEditor -->
                <div class="html-content" v-if="curMode === 'edit' && index !== 11">
                  <AiEditorRenderer :content="item.content" :ref="el => { if (el) editorComponentRefs[index] = el }"/>
                </div>
                <div class="html-footer" v-if="index !== 11 && curMode === 'edit'">
                  <AIQuestionCard :info="item" v-if="item.questionType?.length > 0"/>
                  <AIEdit :schemeId="schemeId" :ref="el => { if (el) AIEditRefs[index] = el }" :urlList="urlList" :showOptimizeButton="true" :source="item.content" :index="index" :canStartRequest="() => canStartAIRequest(index)" @handleReplace="val => handleReplace(val, item)"/>
                </div>
              </div>
            </template>
          </el-scrollbar>
        </div>
        <div class="preview-footer" v-if="curMode === 'onlyRead'">
          <el-button class="generate-btn" :class="{'disabled': percentage !== 100 || isCheckLoading}" @click="handleEdit" type="primary" v-if="curMode === 'onlyRead'">
            <img src="@/assets/icon-btn-star2.png" alt="" v-if="!btnLoading">
            <Loading :size="16" color="#fff" v-else/>
            <span>一键编辑</span>
          </el-button>
          <!-- <el-button class="generate-btn" :class="{'disabled': percentage !== 100}" @click="handleGenerate" type="primary" v-if="activeItem.status !== 3">
            <img src="@/assets/icon-btn-star.png" alt="" v-if="!btnLoading">
            <Loading :size="16" color="#fff" v-else/>
            <span>根据方案创建研究队列</span>
          </el-button>
          <el-button class="generate-btn" :class="{'disabled': activeItem.status === 3}" @click="handleGenerate" type="primary" v-else>
            <span>保存</span>
          </el-button> -->
        </div>
      </div>
      <div class="bottom-right" v-else>
        <el-tooltip class="box-item" effect="dark" content="展开章节" placement="bottom" :disabled="isShowLeftMenu">
          <i class="iconfont icon-zhankai2 leftMenuBtn" v-if="!isShowLeftMenu" @click="isShowLeftMenu = true"></i>
        </el-tooltip>
        <Timeout :text="errorText" @handleRetry="handleRetryAll"></Timeout>
      </div>
      <div class="bottom-right bottom-right2" v-if="showCheckReport">
        <el-tooltip class="box-item" effect="dark" content="展开章节" placement="bottom" :disabled="isShowLeftMenu">
          <i class="iconfont icon-zhankai2 leftMenuBtn" v-if="!isShowLeftMenu" @click="isShowLeftMenu = true"></i>
        </el-tooltip>
        <QualityCheckReport :isLoading="isCheckLoading" :list="sectionList" :qualityResult="qualityResult" @handleEdit="handleReportEdit" @handleCheck="handleCheck" @handleBack="handleBack"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onUnmounted, computed } from 'vue'
import AIEdit from '@/components/AI/AIEdit.vue'
import CommonMarkdown from '@/components/AI/commonMarkdown.vue'
import CommonDownLoad from '@/components/AI/commonDownLoad.vue'
// import { content1, content2 } from '@/components/AI/b.js'
import AIQualityResult from '@/components/AI/AIQualityResult.vue'
import QualityCheckReport from '@/components/AI/qualityCheckReport.vue'
import AiEditorRenderer from '@/components/AI/AiEditorRenderer.vue'
import Timeout from '@/components/AI/timeout.vue'
import { getResearchSchemeStatus, generateChapter, generateChapters, saveResearchScheme, getQualityCheckResult, getChapterGenerateDetail, getChapterScore } from '@/api/api_agent.js'
import { downloadResearchScheme } from '@/api/api_agent'
import multiSSEManager from '@/utils/multiSSEManager.js'
import { blodDownLoadFile } from '@/utils/fileDownload'
import { formatDateTime2 } from '@/utils/utils'
import { ElMessage } from 'element-plus'
import AIQuestionCard from '@/components/AI/AIQuestionCard.vue'
import _ from 'lodash'
defineOptions({
  name: 'ResearchProgramme',
  inheritAttrs: false
})
const props = defineProps({
  query: {
    type: String,
    default: () => ''
  },
  schemeId: {
    type: String,
    default: () => ''
  },
  dialogId: {
    type: String,
    default: ''
  },
  activeSessionInfo: {
    default: () => {
      return {}
    }
  }
})
const urlList = ref([
  {
    id: 1, // 缩写
    url: '/agent/agentResearchProposalChapter/abbreviation'
  },
  {
    id: 2, // 扩写
    url: '/agent/agentResearchProposalChapter/elaborate'
  },
  {
    id: 3, // 润色
    url: '/agent/agentResearchProposalChapter/rewrite'
  },
  {
    id: 5, // 一键优化
    url: '/agent/agentResearchProposalChapter/optimize'
  }
])
const isShowLeftMenu = ref(true) // 左侧菜单是否显示
const setSizeClass = ref(null) // 字体大小类名
const curMode = ref('onlyRead')
const commonMarkdownRefs = ref([])
const scrollbarRef = ref(null)
const originalSectionList = ref([]) // 备份原始数据
const isCheckLoading = ref(false)

// AiEditor 组件引用管理
const editorComponentRefs = ref([]) // AiEditorRenderer 组件引用

// AIEdit 组件引用管理
const AIEditRefs = ref([]) // 存储所有AIEdit组件的引用
// 校验报告一键编辑
const handleReportEdit = () => {
  showCheckReport.value = false
  handleEdit()
}
// 一键编辑
const handleEdit = async () => {
  if (isCheckLoading.value) {
    ElMessage.warning('质量校验中，请稍后操作')
    return
  }
  // 保存当前滚动位置
  const scrollWrap = scrollbarRef.value.wrapRef
  const scrollTop = scrollWrap.scrollTop
  // 备份当前数据
  originalSectionList.value = _.cloneDeep(sectionList.value)
  curMode.value = 'edit'

  // 等待 DOM 更新后，新组件会自动初始化
  await nextTick()
  console.log('编辑模式已切换，AiEditorRenderer 组件将自动初始化')

  // 恢复滚动位置
  requestAnimationFrame(() => {
    scrollWrap.scrollTo({
      top: scrollTop,
      behavior: 'instant'
    })
  })
}
// 取消
const handleCancel = () => {
  // 恢复原始数据
  if (originalSectionList.value.length > 0) {
    // 先清空 sectionList，强制重新渲染
    // const backupData = originalSectionList.value.map(item => ({
    //   ...item,
    //   content: typeof item.content === 'string' ? item.content : JSON.parse(JSON.stringify(item.content))
    // }))

    // 清空组件引用
    commonMarkdownRefs.value = []

    // 重新设置数据
    sectionList.value = []
    nextTick(() => {
      sectionList.value = _.cloneDeep(originalSectionList.value)
    })
  }
  curMode.value = 'onlyRead'
}
const totalLoading = computed(() => {
  return sectionList.value.some(item => item.status === 1)
})
// const emits = defineEmits(['handleGenerate'])
const sectionList = ref([
  {
    id: 1,
    name: '基本信息与摘要',
    status: 1, // 1: 生成中, 2: 已完成 3: 生成失败
    loading: false, // SSE连接状态
    content: '', // 初始为空，通过SSE获取
    score: '',
    scoreStatus: 1, // 1: 生成中, 2: 已完成 3: 生成失败
    questionType: [], // 问题标识
    description: '',
    advice: ''
  },
  {
    id: 2,
    name: '背景与依据',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 3,
    name: '研究目的与目标',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 4,
    name: '研究设计',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 5,
    name: '受试者选择',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 6,
    name: '研究干预措施',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 7,
    name: '研究终点与评估方法',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 8,
    name: '安全性评估',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 9,
    name: '数据管理与统计学',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 10,
    name: '伦理与法规考虑',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 11,
    name: '研究管理',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 1,
    questionType: [],
    description: '',
    advice: ''
  },
  {
    id: 12,
    name: '参考文献',
    status: 1,
    loading: false,
    content: '',
    score: '',
    scoreStatus: 2,
    questionType: [],
    description: '',
    advice: ''
  }
])
const loadingText = ref('正在分析题目')
const textTimer = ref()
const textList = ref(['正在分析题目', '正在检索文献', '正在整理资料', '正在规划内容'])
const textInterval = () => {
  textTimer.value && clearInterval(textTimer.value)
  let textIndex = 0
  textTimer.value = setInterval(() => {
    textIndex += 1
    if (textIndex >= 3) {
      clearInterval(textTimer.value)
    }
    loadingText.value = textList.value[textIndex]
  }, 10000)
}
const percentage = computed(() => {
  const completedCount = sectionList.value.filter(item => item.status === 2).length
  const totalCount = sectionList.value.length
  return Number(((completedCount / totalCount) * 100).toFixed(1)) || 0
})
const time = ref(0)
const activeItem = ref(sectionList.value[0])
const handleClick = (item) => {
  // 只有当章节不是失败状态时才进行跳转
  if (item.status === 3) {
    console.log('失败的章节不进行跳转')
    return
  }

  activeItem.value = item
  // 获取章节索引
  const index = sectionList.value.findIndex(section => section === item)
  if (index !== -1) {
    // 通过 ref 获取对应的 CommonMarkdown 组件（如果是编辑状态，获取对应的AiEditorRenderer组件）
    let targetComponent = null
    if (curMode.value === 'edit') {
      targetComponent = editorComponentRefs.value[index]
    } else {
      targetComponent = commonMarkdownRefs.value[index]
    }
    // const targetComponent = commonMarkdownRefs.value[index]

    if (targetComponent && targetComponent.$el && scrollbarRef.value) {
      // 获取 scrollbar 的内部滚动容器
      const scrollWrap = scrollbarRef.value.wrapRef

      if (scrollWrap) {
        // 计算目标元素相对于滚动容器的位置
        const containerRect = scrollWrap.getBoundingClientRect()
        const targetRect = targetComponent.$el.getBoundingClientRect()
        const currentScrollTop = scrollWrap.scrollTop

        // 计算目标滚动位置，添加一些偏移量确保元素可见
        const targetScrollTop = currentScrollTop + targetRect.top - containerRect.top

        // 直接设置滚动位置
        scrollWrap.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        })
      } else {
        // 备选方案：直接使用组件元素的 scrollIntoView
        targetComponent.$el.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }
}

const btnLoading = ref(false)
// const handleGenerate = () => {
//   btnLoading.value = true
//   setTimeout(() => {
//     btnLoading.value = false
//     emits('handleGenerate')
//   }, 3000)
// }
// 创建全文章节SSE连接
const createAllConnection = async (sortIdList) => {
  const url = '/agent/agentResearchProposalChapter/getReplyList'
  try {
    const params = {
      researchProposalId: props.schemeId
    }
    if (sortIdList && sortIdList.length > 0) {
      params.sortIdList = sortIdList
    }
    multiSSEManager.createConnection('all', params, url, {
      onMessage: (connectionId, content) => handleAllMessage(connectionId, content),
      onError: (connectionId, error) => handleAllError(connectionId, error),
      onClose: (connectionId) => handleAllComplete(connectionId),
      onProgress: (progress, elapsedTime, completed, total) => handleGlobalProgress(progress, elapsedTime, completed, total)
    })

    console.log(sortIdList ? `批量章节SSE连接已启动` : `全文SSE连接已启动`)
    return true
  } catch (error) {
    console.error(sortIdList ? `批量章节SSE初始化失败:` : `全文SSE初始化失败:`, error)
    return false
  }
}
// 创建章节SSE连接的公共逻辑
const createSectionConnection = async (section) => {
  const url = '/agent/agentResearchProposalChapter/getReply'
  try {
    section.loading = true
    section.status = 1 // 重置为生成中状态

    // 创建SSE连接，直接使用section.id作为connectionId
    multiSSEManager.createConnection(section.id, {
      researchProposalId: props.schemeId,
      sort: section.id
    }, url, {
      onMessage: (connectionId, content) => handleSectionMessage(connectionId, content),
      onError: (connectionId, error) => handleSectionError(connectionId, error),
      onClose: (connectionId) => handleSectionComplete(connectionId),
      onProgress: (progress, elapsedTime, completed, total) => handleGlobalProgress(progress, elapsedTime, completed, total)
    })

    console.log(`章节 ${section.id} SSE连接已启动`)
    return true
  } catch (error) {
    console.error(`章节 ${section.id} 初始化失败:`, error)
    section.loading = false
    section.status = 3 // 设置为错误状态
    return false
  }
}
// 定义参考文献列表
const referenceContent = ref('')

// 请求第12个章节生成状态
const toGetReferencesGenerateDetail = async () => {
  console.log('请求第12个章节（参考文献）状态')
  const lastSection = sectionList.value[11] // 第12个章节

  const { code, data } = await getChapterGenerateDetail({
    researchProposalId: props.schemeId,
    sortIdList: [lastSection.id]
  })

  if (code === 10000) {
    if (data.chapterList) {
      const chapterInfo = data.chapterList.find(item => item.sort === lastSection.id)
      if (chapterInfo) {
        return chapterInfo.generateChapterStatus
      } else {
        return 1
      }
    } else {
      return 1
    }
  }
}
const errorText = ref('')
// 轮询状态码
const statusCode = ref(1)
// 重试轮询
const handleRetryAll = () => {
  statusCode.value = 1
  toStartGenerate()
}
const pollTimer = ref(null)
// 评分请求的 AbortController
const scoreAbortController = ref(null)
// 轮询参考文献生成状态
const pollReferencesStatus = async () => {
  statusCode.value = await toGetReferencesGenerateDetail()
  if (statusCode.value === 1) {
    // 如果状态为1，5秒后再次请求
    clearTimeout(pollTimer.value)
    pollTimer.value = setTimeout(() => {
      pollReferencesStatus()
    }, 5000)
  } else if (statusCode.value === 2) {
    // 状态为2，成功生成，开始请求其他章节
    requestAllSection()
  } else {
    console.error('参考文献生成失败')
    getErrorText()
    // 结束所有章节的生成，状态设为3
    sectionList.value.forEach(section => {
      section.loading = false
      section.status = 3 // 3: 生成失败
    })
    // 停止计时器
    clearInterval(timer.value)
    timer.value = null
  }
}
// 获取错误文本
const getErrorText = async () => {
  if (statusCode.value === 30) {
    errorText.value = '很抱歉，在处理您请求的过程中，我们的AI引擎遇到了一个意外错误，无法完成此次任务。'
  } else if (statusCode.value === 31) {
    errorText.value = '暂时未检索到与您描述高度契合的现有文献，请尝试简化或拆分您的关键词，或者这可能是您正触及一个极具创新性的研究方向。'
  } else if (statusCode.value === 20) {
    errorText.value = '响应超时，网络或服务器可能在忙碌，请稍后重试～'
  }
}
// 请求单个章节
const requestSingleSection = async (section) => {
  console.log(`重试章节: ${section.id}`)
  try {
    const { code } = await generateChapter({
      chapterName: section.name,
      researchProposalId: props.schemeId,
      sort: section.id
    })
    if (code === 10000) {
      // 立即开始章节的流式请求
      createSectionConnection(section)
    }
  } catch (error) {
    console.error(`章节 ${section.id} 网络好像不太稳定，请稍后重试:`, error)
    section.status = 3 // 3: 生成失败
    section.loading = false
    return false
  }
}

// 请求所有章节
const requestAllSection = async () => {
  console.log(`开始全文章节`)

  try {
    // 请求所有章节前，恢复所有章节的状态
    sectionList.value.forEach(section => {
      section.status = 1 // 1: 生成中
      section.loading = true
    })
    // 立即开始全文的流式请求
    createAllConnection()
  } catch (error) {
    console.error(`全文章节网络好像不太稳定，请稍后重试:`, error)
    return false
  }
}

// 为参考文献章节赋值内容
const assignReferenceContent = () => {
  if (referenceContent.value) {
    const lastSection = sectionList.value[11] // 第12个章节
    lastSection.loading = false
    lastSection.status = 2 // 2: 已完成
    lastSection.content = _.cloneDeep(referenceContent.value)
    console.log('参考文献内容已赋值完成')
  }
}
// 定义一个计时器，每隔1秒+1
const timer = ref(null)
// 获取总的质量校验结果
const toGetQualityCheckResult = async () => {
  // 避免重复请求
  isCheckLoading.value = true
  const { code, data } = await getQualityCheckResult({
    researchProposalId: props.schemeId
  })
  if (code === 10000) {
    qualityResult.value.score = data.actualScore
    qualityResult.value.keyQuestionCount = data.keyNum
    qualityResult.value.optimizationCount = data.optimizeNum
    isCheckLoading.value = false
  }
}
// 开始正式生成
const toStartGenerate = async () => {
// 开始time计时
  clearInterval(timer.value)
  time.value = 0
  timer.value = setInterval(() => {
    time.value += 1
  }, 1000)
  // 所有状态设为1，loading设为true
  sectionList.value.forEach(section => {
    section.status = 1 // 1: 生成中
    section.loading = true
    section.content = ''
    section.scoreStatus = 1
    section.score = ''
    section.advice = ''
    section.description = ''
    section.questionType = []
  })
  loadingText.value = '正在分析题目'
  textInterval()
  isCheckLoading.value = true
  console.log('开始初始化研究方案生成')
  // 如果参考文献成功，再请求前11个章节
  const { code } = await generateChapters({
    researchProposalId: props.schemeId
  })
  if (code === 10000) {
    // 第一步：请求第12个章节（参考文献），并轮询直到状态不为1
    pollReferencesStatus()
  } else {
    console.error('批量生成章节请求失败')
    // 结束所有章节的生成，状态设为3
    sectionList.value.forEach(section => {
      section.loading = false
      section.status = 3 // 3: 生成失败
    })
    // 停止计时器
    clearInterval(timer.value)
    timer.value = null
  }
}
// 初始化研究方案生成
const init = async () => {
  if (props.dialogId) {
    const { code, data, msg } = await getResearchSchemeStatus({
      researchProposalId: props.dialogId
    })
    loadingText.value = textList.value[textList.value.length - 1]
    if (code === 10000) {
      // 未成功
      if (data.errList.length > 0) {
        // 判断有没有参考文献失败
        const referenceSection = data.errList.find(item => item.sort === 12)
        if (referenceSection) {
          // 参考文献失败，则都置为失败
          sectionList.value.forEach(section => {
            section.status = 3 // 3: 生成失败
            section.loading = false
          })
          statusCode.value = referenceSection.generateChapterStatus
          getErrorText()
          return false
        } else {
          data.errList.forEach(item => {
            const section = sectionList.value.find(s => s.id === item.sort)
            if (section) {
              section.status = 3 // 3: 生成失败
              section.loading = false
            }
          })
        }
      }

      data.completeChapterList.forEach(item => {
        const section = sectionList.value.find(s => s.id === item.sort)
        if (section) {
          // 文献章节特殊处理，最后再赋值
          if (section.id === 12 && data.unCompleteChapterSortList?.length > 0) {
            referenceContent.value = item.chapterContent
            section.status = 1 // 1: 生成中
            section.loading = true
          } else {
            referenceContent.value = item.chapterContent
            section.status = 2 // 2: 已完成
            section.content = item.chapterContent
            section.scoreStatus = item.generateScoreStatus
            if (section.scoreStatus === 2) {
              section.score = item.score
              section.advice = item.suggestion
              section.description = item.item
              section.questionType = item.tag
            }
            section.loading = false
          }
        }
      })
      if (data.unCompleteChapterSortList.length === 0) {
        // 全部完成，时间赋值
        time.value = Number(data?.second || 0)
        clearInterval(timer.value)
        statusCode.value = 2
      }
      // 未完成，继续发起流式请求
      const hasLastSection = data.unCompleteChapterSortList.find(item => item === 12)
      if (hasLastSection) {
        // 继续计时
        clearInterval(timer.value)
        time.value = Number(data?.second || 0)
        timer.value = setInterval(() => {
          time.value += 1
        }, 1000)
        // 继续轮询
        pollReferencesStatus()
      } else {
        statusCode.value = 2
        data.unCompleteChapterSortList?.forEach(sort => {
          const section = sectionList.value.find(s => s.id === sort)
          if (section) {
            section.status = 1 // 1: 生成中
            section.loading = true
            // createSectionConnection(section)
          }
        })
        if (data.unCompleteChapterSortList?.length > 0) {
          createAllConnection(data.unCompleteChapterSortList)
        }
      }
      toGetQuality()
      // 等待下一个DOM更新周期，确保CommonMarkdown组件完全渲染后再计算字符数
      await nextTick()
      // 强制更新字符数显示
      sectionList.value.forEach(section => {
        if (section.status === 2) {
          // 通过访问内容来触发响应式更新
          getRenderedCharCount(section)
          // console.log(`章节 ${section.name} 字符数:`, getRenderedCharCount(section))
        }
      })
    } else {
      sectionList.value.forEach(section => {
        section.status = 3
        section.loading = false
      })
      statusCode.value = 3
      errorText.value = msg
    }
  } else {
    loadingText.value = textList.value[0]
    toStartGenerate()
  }
}
// 获取评分及校验结果
const toGetQuality = () => {
  // 如果评分都完成，则获取质量校验结果
  const hasSectionScoreLoading = sectionList.value.slice(0, 11).some(s => s.scoreStatus === 1)
  // 获取质量校验结果
  if (!hasSectionScoreLoading) {
    toGetQualityCheckResult()
  } else {
    // 若11个章节流式都已完成，并且11个章节存在评分未完成的，就调toGetAllSectionScore
    // 收集前11个章节中未完成评分的章节ID
    const incompleteScoreSectionsIds = sectionList.value.slice(0, 11).filter(s => s.status !== 1 && s.scoreStatus === 1).map(s => s.id)
    if (incompleteScoreSectionsIds && incompleteScoreSectionsIds?.length > 0) {
      console.log('未完成评分的章节ID:', incompleteScoreSectionsIds)
      toGetAllSectionScore(incompleteScoreSectionsIds)
    }
  }
}
// 处理全文消息
const handleAllMessage = (connectionId, content) => {
  content.forEach(item => {
    const section = sectionList.value.find(s => s.id === item.sort)
    if (section) {
      if (item.chatContentType === 1) {
        if (section.id === 12) {
          referenceContent.value += item.content
        } else {
          section.content += item.content
        }
      } else if (item.chatContentType === 3) {
        // 该章节结束
        if (section.id !== 12) {
          section.loading = false
          section.status = 2
          console.log('章节流式结束，获取章节分数')
          // toGetSectionScore(section)
        }
      } else if (item.chatContentType === 4) {
        // 该章节出错
        section.loading = false
        section.status = 3
      }
    }
  })
}
// 处理全文错误
const handleAllError = (connectionId, error) => {
  console.error(`全文生成错误:`, error)
  sectionList.value.forEach(item => {
    item.loading = false
    item.status = 3
  })
}
// 处理全文完成
const handleAllComplete = (connectionId) => {
  console.log(`全文生成完成`)
  // 检查是否所有章节都已完成(成功2或失败3)，如果是，则为参考文献章节赋值
  const first11Sections = sectionList.value.slice(0, 11)
  const allFirst11Completed = first11Sections.every(s => s.status !== 1)
  // 关闭计时器
  clearInterval(timer.value)
  timer.value = null
  if (allFirst11Completed) {
    console.log('所有前11个章节已完成，开始为参考文献赋值')
    assignReferenceContent()
  }
  // 获取所有章节评分
  toGetAllSectionScore()
}
// 处理章节消息
const handleSectionMessage = (connectionId, content) => {
  const section = sectionList.value.find(s => s.id === connectionId)
  if (section) {
    section.content += content
  }
}

// 处理章节错误
const handleSectionError = (connectionId, error) => {
  console.error(`章节生成错误 ${connectionId}:`, error)
  const section = sectionList.value.find(s => s.id === connectionId)
  if (section) {
    section.loading = false
    section.status = 3 // 3: 错误状态
  }
}
// 重新校验
const toGetAllSectionScore = async (val) => {
  // 取消之前的评分请求
  if (scoreAbortController.value) {
    scoreAbortController.value.abort()
    console.log('取消之前的评分请求')
  }

  // 创建新的 AbortController
  scoreAbortController.value = new AbortController()

  isCheckLoading.value = true
  sectionList.value.forEach(item => {
    if (!val || val.includes(item.id)) {
      Object.assign(item, {
        scoreStatus: 1,
        score: '',
        advice: '',
        description: '',
        questionType: ''
      })
    }
  })

  try {
    const { code, data } = await getChapterScore({
      researchProposalId: props.schemeId,
      sortIdList: val || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    }, {
      signal: scoreAbortController.value.signal
    })

    if (code === 10000) {
      data.forEach(item => {
        const section = sectionList.value.find(s => s.id === item.sort)
        if (section) {
          section.scoreStatus = item.generateScoreStatus
          if (section.scoreStatus === 2) {
            section.score = item.score
            section.advice = item.suggestion
            section.description = item.item
            section.questionType = item.tag
          } else {
            section.score = item.score || 0
          }
        }
      })
      const hasSectionScoreLoading = sectionList.value.slice(0, 11).some(s => s.scoreStatus === 1)
      // 获取质量校验结果
      if (!hasSectionScoreLoading) {
        toGetQualityCheckResult()
      }
    }
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      console.log('评分请求已取消')
    } else {
      console.error('评分请求失败:', error)
    }
  }
}
// 获取章节评分
// const toGetSectionScore = async (section) => {
//   if (section.id === 12) {
//     return
//   }
//   isCheckLoading.value = true
//   section.scoreStatus = 1
//   section.score = ''
//   section.advice = ''
//   section.description = ''
//   section.questionType = ''
//   const { code, data } = await getChapterScore({
//     researchProposalId: props.schemeId,
//     sortIdList: [section.id]
//   })
//   if (code === 10000) {
//     const newData = data.find(item => item.sort === section.id)
//     if (newData) {
//       section.scoreStatus = newData.generateScoreStatus
//       if (section.scoreStatus === 2) {
//         section.score = newData.score
//         section.advice = newData.suggestion
//         section.description = newData.item
//         section.questionType = newData.tag
//       } else {
//         section.score = newData.score || 0
//       }
//     } else {
//       section.scoreStatus = 3
//       section.score = 0
//     }
//     // 如果评分都完成，则获取质量校验结果
//     console.log('检查评分加载状态:', sectionList.value.slice(0, 11).map(s => s.scoreStatus))
//     const hasSectionScoreLoading = sectionList.value.slice(0, 11).some(s => s.scoreStatus === 1)
//     console.log('检查评分加载状态2:', hasSectionScoreLoading)
//     // 获取质量校验结果
//     if (!hasSectionScoreLoading) {
//       toGetQualityCheckResult()
//     }
//   }
// }
// 处理章节完成
const handleSectionComplete = (connectionId) => {
  console.log(`章节生成完成: ${connectionId}`)
  const section = sectionList.value.find(s => s.id === connectionId)
  if (section) {
    section.loading = false
    section.status = 2 // 2: 已完成
    console.log(`章节 ${section.name} 已完成，字符数: ${section.content.length}`)
    // toGetSectionScore(section)
    // // 检查是否所有前11个章节都已完成(成功2或失败3)，如果是，则为参考文献章节赋值
    const first11Sections = sectionList.value.slice(0, 11)
    const allFirst11Completed = first11Sections.every(s => s.status !== 1)

    if (allFirst11Completed) {
      console.log('所有前11个章节已完成，开始为参考文献赋值')
      assignReferenceContent()
    }
  }
}

// 处理全局进度
const handleGlobalProgress = (progress, elapsedTime, completed, total) => {
  // 如果还在计时过程中，使用实时时间
  // 如果已完成，使用最终保存的时间
  if (completed === total) {
    console.log('所有章节生成完成，最终用时:', time.value, '秒')
    // 清除timer计时器
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
      console.log('计时器已清除')
    }
  }
}

// 初始化
init()

// 让<el-scrollbar>滚动条滚动到最底部
// const scrollToBottom = () => {
//   const scrollbar = document.querySelector('.right-el-scrollbar')
//   if (scrollbar) {
//     // console.log('scrollbar.scrollHeight', scrollbar.scrollHeight)
//     scrollbar.scrollTop = scrollbar.scrollHeight
//   }
// }
// 检查两个内容是否语义相等（忽略格式差异）
const normalizeMarkdown = (text) => {
  return text
    // 统一换行符
    .replace(/\r\n/g, '\n')

    // 移除行尾所有空格（含 Markdown 强制换行）
    .replace(/[ \t]+$/gm, '')

    // 🔥 统一列表标记后的空格
    .replace(/^(\s*(?:\d+\.|[-*+]))\s+/gm, '$1 ')

    // 🔥 关键新增：移除“正文行”的行首缩进（但保留列表标记本身）
    .replace(/^(?!\s*(?:\d+\.|[-*+]))[ \t]+/gm, '')

    // 移除所有空行
    .replace(/^\s*\n/gm, '')

    // 多个换行压缩成一个
    .replace(/\n+/g, '\n')

    // 去掉整体首尾空白
    .trim()
}
const isSameContent = (a, b) => {
  return normalizeMarkdown(a) === normalizeMarkdown(b)
}
// 保存
const handleSave = async () => {
  // 从每个 AiEditorRenderer 组件获取最新的 Markdown 内容
  editorComponentRefs.value.forEach((componentRef, index) => {
    if (componentRef && index !== 11) {
      try {
        // 使用组件暴露的 getContent 方法获取最新内容
        const content = componentRef.getContent()
        console.log('content', JSON.stringify(content))
        sectionList.value[index].content = content
        console.log(`章节 ${index} 已获取内容，长度:`, content?.length || 0)
      } catch (error) {
        console.error(`获取编辑器 ${index} 内容失败:`, error)
      }
    }
  })

  console.log('保存', sectionList.value)
  // 将sectionList.value中的content字段拼到一起，章节间添加双换行符分隔
  const newContent = []
  sectionList.value.slice(0, -1).forEach(item => {
    newContent.push({
      sort: item.id,
      content: item.content
    })
  })
  // eslint-disable-next-line no-unreachable
  console.log('newContent（换行符已转换）:', newContent)
  const params = {
    contentList: newContent,
    researchProposalId: props.schemeId
  }
  // 拿备份数据与新的数据做对比，谁的content语义不一致，就重新评谁的分数
  // const diffSectionIds = []
  // sectionList.value.forEach(item => {
  //   const originalItem = originalSectionList.value.find(o => o.id === item.id)
  //   if (originalItem && !isSameContent(item.content, originalItem.content)) {
  //     diffSectionIds.push(item.id)
  //   }
  // })
  // // 如果有差异，则重新评分
  // if (diffSectionIds.length > 0) {
  //   console.log('有差异，重新评分', diffSectionIds)
  // } else {
  //   console.log('没有差异，不重新评分')
  // }
  const { code } = await saveResearchScheme(params)
  if (code === 10000) {
    ElMessage.success('已保存')
    // 拿备份数据与新的数据做对比，谁的content语义不一致，就重新评谁的分数
    const diffSectionIds = []
    sectionList.value.forEach(item => {
      const originalItem = originalSectionList.value.find(o => o.id === item.id)
      if (originalItem && !isSameContent(item.content, originalItem.content)) {
        diffSectionIds.push(item.id)
      }
    })
    // 如果有差异，则重新评分
    // eslint-disable-next-line no-unreachable
    if (diffSectionIds.length > 0) {
      console.log('有差异，重新评分', diffSectionIds)
      toGetAllSectionScore(diffSectionIds)
    }

    // 已保存后，更新备份为当前最新的数据
    originalSectionList.value = _.cloneDeep(sectionList.value)
    // 回到只读模式
    handleCancel()
  }
}
// 替换当前章节
const handleReplace = (valHooks, item) => {
  console.log('handleReplace', item)
  item.content = valHooks.newContent
  if (valHooks.operationType === 5) {
    item.questionType = []
    item.description = ''
    item.advice = ''
  }
  // scrollToBottom()
}

// 统计所有AIEdit组件中loading为true的数量
const getLoadingAIEditCount = () => {
  const validRefs = AIEditRefs.value.filter(ref => ref !== null && ref !== undefined)
  const loadingRefs = validRefs.filter(ref => ref.loading === true)
  return loadingRefs.length
}

// 检查是否可以发起新的AI请求
const canStartAIRequest = (currentIndex) => {
  const loadingCount = getLoadingAIEditCount()
  console.log(`当前有 ${loadingCount} 个AIEdit组件的loading状态为true`)

  if (loadingCount >= 6) {
    ElMessage.warning('当前有6个AI正在请求，请稍后再试')
    return false
  }

  return true
}

// 处理下载事件
const handleDownload = async (item) => {
  console.log('下载类型:', item.fileType)
  downloadResearchScheme({
    fileType: item.value,
    id: props.schemeId
  }).then(res => {
    const time = formatDateTime2()

    const fileName = `GCP/IIT方案_#${props.activeSessionInfo?.dialogTitle}_${time}.${item.fileType}` // 导出文件名
    blodDownLoadFile(res, fileName)
  }).catch(err => {
    console.error('下载失败:', err)
  })
}

// 单个章节重试功能
const handleRetrySection = async (section) => {
  // 若文献为空，则先重试文献
  if (!referenceContent.value || section.id === 12) {
    // await requestReferenceSection()
    toStartGenerate()
  } else {
    // 清空之前的错误内容
    section.content = ''
    section.loading = true
    section.status = 1
    section.scoreStatus = 1
    section.score = ''
    section.advice = ''
    section.description = ''
    section.questionType = []
    isCheckLoading.value = true
    // 对于前11个章节，使用单个章节重试逻辑
    requestSingleSection(section)
  }
}
// 处理引用点击事件
const handleJump = (value, url) => {
  console.log('引用点击事件', value, url)
}

// 获取markdown渲染后的字符数
const getRenderedCharCount = (item) => {
  // 如果内容为空，直接返回0
  if (!item.content) return 0

  // 获取当前章节在数组中的索引
  const index = sectionList.value.findIndex(section => section === item)
  if (index !== -1 && commonMarkdownRefs.value[index]) {
    const markdownComponent = commonMarkdownRefs.value[index]
    // 如果组件有getRenderedHTML方法，获取渲染后的HTML内容长度
    if (markdownComponent && typeof markdownComponent.getRenderedHTML === 'function') {
      try {
        const renderedHTML = markdownComponent.getRenderedHTML()
        // 去除HTML标签后的纯文本字符数
        const plainText = renderedHTML.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        // 如果渲染后内容为空，返回原始字符数
        return plainText.length > 0 ? plainText.length : item.content.length
      } catch (error) {
        console.warn('获取渲染内容失败，使用原始字符数:', error)
        return item.content.length
      }
    }
  }
  // 如果无法获取渲染后的内容，返回原始markdown字符数
  return item.content.length
}
// 获取评分class
const getScoreClass = (score) => {
  if (!score && score !== 0) {
    return 'default'
  } else if (score >= 8) {
    return 'high'
  } else if (score < 4) {
    return 'low'
  } else {
    return 'medium'
  }
}
const showCheckReport = ref(false)
const qualityResult = ref({
  score: '',
  keyQuestionCount: '',
  optimizationCount: ''
})
const handleFooterClick = (value) => {
  if (isCheckLoading.value) {
    ElMessage.warning('质量校验中，请稍后操作')
    return
  }
  switch (value) {
    case 1:
      handleCheck()
      break
    case 2:
      console.log('查看校验报告')
      showCheckReport.value = true
      break
  }
}
// 重新校验
const handleCheck = () => {
  // 针对12个章节重新进行评分
  toGetAllSectionScore()
}
// 校验报告返回
const handleBack = () => {
  showCheckReport.value = false
}

// 组件卸载时清理所有SSE连接
onUnmounted(() => {
  console.log('组件卸载，清理所有SSE连接')
  multiSSEManager.stopAllConnections()
  // 清除定时器
  timer.value && clearInterval(timer.value)
  timer.value = null
  textTimer.value && clearInterval(textTimer.value)
  textTimer.value = null
  if (pollTimer.value) {
    clearTimeout(pollTimer.value)
    pollTimer.value = null
    console.log('组件卸载时清除轮询请求')
  }
  // 取消评分请求
  if (scoreAbortController.value) {
    scoreAbortController.value.abort()
    scoreAbortController.value = null
    console.log('组件卸载时取消评分请求')
  }
})
</script>
<style scoped lang="scss">
@use '@/components/AI/style/researchProgramme.scss';
</style>
<style>
.right-div {
  background-color: initial !important;
}
</style>

