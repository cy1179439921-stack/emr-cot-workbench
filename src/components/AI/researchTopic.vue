<template>
  <div :class="{researchTopic:true, middleSize:fontSizeMode === 'middleSize',largeSize:fontSizeMode === 'largeSize'}">
    <div class="page-div" v-if="step === 1">
      <el-scrollbar>
        <div class="main">
          <universalHead
            :fontSizeMode="fontSizeMode"
            :logo="aiLogo"
            placeholder="请填写多个关键词，并用分号隔开"
            @search="toInput"
            ref="universalHeadRef"
            @handleRequest="handleNext"
          ></universalHead>
          <div
            class="generate"
            @click="handleNext"
            :class="{ dis: !searchContent.trim() }"
          >
            <i class="iconfont icon-yijianbianji"></i>
            <span>生成研究选题</span>
          </div>
          <div class="recommended">
            <img
              src="@/assets/recommendIcon.png"
              alt=""
              class="recommendIcon"
            />
            <div
              :class="{
                recommendedItem: true,
                actived: recommendedId === item.id,
              }"
              v-for="(item, index) in recommendedList"
              :key="index"
              @click="handleRecommended(item)"
            >
              {{ index + 1 + '.' + item.title }}
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="mainContent" v-if="step === 2">
      <div class="topHeader">
        <div class="title">
          您的选题方向是：
          <span class="direction">{{ topicSelectionDirection }}</span>
        </div>
        <!-- <div class="language">
          <div :class="{LanItem:true,actived:lanVal===1}" @click="handleLan(1)">中文</div>
          <div :class="{LanItem:true,actived:lanVal===2}" @click="handleLan(2)">英文</div>
        </div> -->

        <div class="AINotice">内容由AI生成，注意甄别，仅供参考</div>
        <div class="fontControls">
          <span>字体：</span>
          <div class="fontContainer">
            <div v-for="(item,index) in fontSizeList" :key="index" @click="handleFontSize(item)" :class="{fontItem:true,actived:fontSizeMode===item.value} ">
              {{ item.label }}
            </div>
          </div>
        </div>
        <CommonDownLoad @handleClick="handleDownload">
          <el-button type="primary" class="downloadBtn">
            <i class="iconfont icon-daochu2"></i>下载报告
          </el-button>
        </CommonDownLoad>
        <!-- <el-button type="primary" class="downloadBtn">
          <i class="iconfont icon-baocunweichangyong"></i>保存课题
        </el-button> -->
      </div>
      <div class="stepContainer" v-if="!loading && !timeOut">
        <div class="leftContainer">
          <el-scrollbar ref="scrollbarRef" @scroll="handleScroll">
            <div class="report">选题报告</div>
            <template v-for="(item, index) in titleList" :key="index">
              <div class="subTitle">
                <div class="line"></div>
                <div>{{ item.label }}</div>
              </div>
              <CommonMarkdown
                v-if="index < 3 && !item.isFail && !item.loading"
                :source="item.renderMsgList.join('')"
              />
              <div v-if="item.isFail" class="failContainer">
                <img class="AIFailIcon" src="@/assets/AIFailIcon.png" alt="" />
                <div>
                  <span>生成失败，</span>
                  <span class="retryText" @click="handleRetry(item)"
                  >重新生成</span
                  >
                </div>
              </div>
              <div class="contentItem" v-if="item.loading && index < 3">
                <Loading :size="16" :loading="item.loading">
                  <span class="custom-text">生成中</span>
                </Loading>
              </div>

              <div v-if="item.type === 'words'" class="contentItem">
                <Loading :size="16" :loading="item.loading" v-if="item.loading">
                  <span class="custom-text">生成中</span>
                </Loading>
                <div v-if="!item.loading">
                  <span
                  >共现词分析旨在通过分析关键词在同一片文献中同时出现的频率,构建共现网络,识别高频关键词、主题旅和关键词之间的关联强度。纳入</span
                  >
                  <span class="redWord">{{
                    `相关度的${statisticalData.referencesTextNum}篇`
                  }}</span>
                  <span>的文献进行分析,让识别出现大于</span>
                  <span class="redWord">2次</span>
                  <span>的关键词共</span>
                  <span class="redWord">{{
                    `${statisticalData.keywordsNum}个`
                  }}</span>
                  <span>,其中,研究热点是</span>
                  <span class="redWord">{{
                    statisticalData?.researchHotWord.join('、')
                  }}</span>
                  <span>(见图共现词分析)</span>
                </div>
              </div>
              <div v-if="item.type === 'hotTopic'" class="contentItem">
                <Loading :size="16" :loading="item.loading" v-if="item.loading">
                  <span class="custom-text">生成中</span>
                </Loading>
                <div v-if="!item.loading">
                  <span>出现频率最高的词包括</span>
                  <span class="redWord">{{
                    statisticalData?.hotWord.join('、')
                  }}</span>
                  <span>(见图词云图）</span>
                </div>
              </div>
              <div class="references" v-if="index === 2 && literatureContent">
                <p class="title">【参考文献】</p>
                <span class="content">
                  {{ literatureContent }}
                </span>
              </div>
            </template>
            <!-- <div class="AILoadingF2">
              <AILoading v-if="loading2"></AILoading>
            </div> -->
          </el-scrollbar>
        </div>
        <div class="rightContaienr" v-if="!rightLoading">
          <el-scrollbar>
            <div class="rightTitle">
              <img class="light" src="@/assets/light.png" alt="" />
              选题推荐
            </div>
            <div
              class="topicRecommendation"
              v-for="(item, index) in topicList"
              :key="index"
            >
              <div class="pointer"></div>
              <div class="RTitle" v-show-tip>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :popper-class="fontSizeMode === 'middleSize'?'middleSizePopper':(fontSizeMode === 'largeSize'?'largeSizePopper':'')"
                  :content="item.title"
                  placement="bottom"
                  :open-delay="400"
                  :enterable="false"
                  :hide-after="0"
                >
                  <div class="treeLabel">{{ item.title }}</div>
                </el-tooltip>
              </div>
              <div class="tag" v-show-tip>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :popper-class="fontSizeMode === 'middleSize'?'middleSizePopper':(fontSizeMode === 'largeSize'?'largeSizePopper':'')"
                  :content="item.tag"
                  placement="bottom"
                  :open-delay="400"
                  :enterable="false"
                  :hide-after="0"
                >
                  <div class="treeLabel">{{ item.tag }}</div>
                </el-tooltip>
              </div>
              <div class="btn" @click="handleEmitNext(item)">开始方案设计</div>
              <!-- <el-button type="primary" @click="handleSubmit">确定选题进入方案设计</el-button> -->
            </div>
            <div class="retryContainer">
              <div class="retryNotice">
                <img src="@/assets/robot2.gif" alt="" />
                <div class="noticeText">
                  如果觉得当前选题不够聚焦或与您的研究方向不一致,可以在下方补充一个关键词或限定期望的研究类型,模型会努力为您找到更加匹配的选题哦
                </div>
              </div>
              <div class="customEditContainer">
                <editDiv @handleRetry="handleRetryKeyWords"></editDiv>
              </div>
            </div>
            <div class="chartsTitle">
              <i class="iconfont icon-gongxiancifenxi"></i>
              <span>共现词分析图</span>
            </div>
            <div :class="{ wordCloudContainer: true, empty: !isShowRelation }">
              <div class="echartsPlaceDom" v-if="!isShowRelation">
                <img src="@/assets/AIPlaceImg.png" alt="" />
                <span>这里还没有内容</span>
              </div>
              <template v-if="isShowRelation">
                <common-echarts :option="relationConfig"> </common-echarts>
              </template>
            </div>
            <div class="chartsTitle">
              <i class="iconfont icon-tiaoyuntu"></i>
              <span>词云图</span>
            </div>
            <div class="chartsDescribe">
              <span>以"</span>
              <span class="searchContent">{{ topicSelectionDirection }}</span>
              <span>"为研究方向的课题中,相关的关键词云图如下:</span>
            </div>
            <div :class="{ wordCloudContainer: true, empty: !isShowWordCloud }">
              <div class="echartsPlaceDom" v-if="!isShowWordCloud">
                <img src="@/assets/AIPlaceImg.png" alt="" />
                <span>这里还没有内容</span>
              </div>
              <template v-if="isShowWordCloud">
                <common-echarts :option="wordCloudConfig"> </common-echarts>
              </template>
            </div>
          </el-scrollbar>
        </div>
        <div class="rightContaienr" v-if="rightLoading">
          <div class="AILoadingF2">
            <AILoading></AILoading>
          </div>
        </div>
      </div>
      <div class="loadingContainer" v-if="loading && !timeOut">
        <div class="AILoadingF">
          <AILoading></AILoading>
        </div>
        <div class="loadingText">{{ loadingText }}</div>
      </div>
      <div class="loadingContainer" v-if="timeOut">
        <Timeout :text="errorText" @handleRetry="handleRetryAll"></Timeout>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
// eslint-disable-next-line no-unused-vars
import {
  createResearchTopic,
  getCreateResearchTopicRes,
  downLoadFile,
  getResearchTopicDetail,
  getResearchTopicData,
  reGenerate,
  reGenerateSingleChapter,
  getReferenceList
} from '@/api/api_agent.js'
import aiLogo from '@/assets/researchTopicLogo.png'
import universalHead from '@/components/AI/universalHead.vue'
import CommonDownLoad from '@/components/AI/commonDownLoad.vue'
import CommonMarkdown from '@/components/AI/commonMarkdown.vue'
import Timeout from './timeout.vue'
import { ElMessage } from 'element-plus'
import { blodDownLoadFile } from '@/utils/fileDownload'
import { formatDateTime2 } from '@/utils/utils'
import { getToken } from '@/utils/crypto'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import lodash from 'lodash'
import {
  wordCloudConfigFn,
  relationshipDiagramFn
} from '@/components/configs/AIEchartsConfig.js'
import editDiv from '@/components/common/editDiv.vue'
const fontSizeMode = ref('middleSize')
const fontSizeList = ref([
  {
    label: 'A-',
    value: 'smallSize'
  },
  {
    label: 'A',
    value: 'middleSize'
  },
  {
    label: 'A+',
    value: 'largeSize'
  }
])
const handleFontSize = (obj) => {
  fontSizeMode.value = obj.value
}
const props = defineProps({
  activeSessionInfo: {
    default: () => {
      return {}
    }
  }
})
const emits = defineEmits(['next', 'handleRefreshDialogList'])
const searchContent = ref('')
const recommendedList = ref([
  {
    title: '多囊卵巢综合征；胰岛素抵抗；生活方式干预；排卵率；妊娠结局',
    // keyWords: '多囊卵巢综合征；胰岛素抵抗；生活方式干预；排卵率；妊娠结局',
    id: 1
  },
  {
    title:
      '近3年关于机械取栓治疗急性缺血性卒中的随机对照试验，且标题中包含“血栓切除术的研究',
    // keyWords: '机械取栓、急性缺血性卒中、随机对照试验、血栓切除术',
    id: 2
  },
  {
    title: '炎症在动脉粥样硬化和心力衰竭中的共同作用',
    // keyWords: '炎症、动脉粥样硬化、心力衰竭、共同作用',
    id: 3
  },
  {
    title: '关于PCSK9抑制剂在冠心病和脑血管疾病中二级预防的临床试验',
    // keyWords: 'PCSK9抑制剂、冠心病、脑血管疾病、二级预防',
    id: 4
  }
])

const recommendedId = ref('')
const universalHeadRef = ref(null)
const handleRecommended = (obj) => {
  recommendedId.value = obj.id
  searchContent.value = obj.title
  universalHeadRef.value.setSearchText(obj.title)
}
const lanVal = ref(1)
// eslint-disable-next-line no-unused-vars
const handleLan = (val) => {
  lanVal.value = val
}

const step = ref(1)
let controller = null
const loading = ref(false)
const loadingText = ref('正在分析题目')
const timeOut = ref(false)
const errorText = ref('')
const rightLoading = ref(false)
const researchId = ref('')
const titleList = ref([
  {
    label: '背景分析',
    type: 'background',
    renderMsgList: [],
    isFail: false
  },
  {
    label: '选题推荐',
    renderMsgList: [],
    type: 'topic',
    isFail: false
  },
  {
    label: '研究挑战',
    renderMsgList: [],
    type: 'challenge',
    isFail: false
  },
  {
    label: '共现词分析',
    renderMsgList: [],
    loading: true,
    type: 'words'
  },
  {
    label: '热点分析',
    renderMsgList: [],
    loading: true,
    type: 'hotTopic'
  }
])
const topicSelectionDirection = ref('')
const textTimer = ref()
const textList = ref([
  '正在分析题目',
  '正在检索文献',
  '正在整理资料',
  '正在规划内容'
])
const textInterval = () => {
  let textIndex = 0
  textTimer.value = setInterval(() => {
    textIndex += 1
    if (textIndex >= 3) {
      clearInterval(textTimer.value)
    }
    loadingText.value = textList.value[textIndex]
  }, 10000)
}
const handleNext = () => {
  if (!searchContent.value) {
    ElMessage.error('请填写关键字')
    return
  }
  step.value = 2
  loading.value = true
  loadingText.value = '正在分析题目'
  textInterval()
  // const obj = lodash.find(recommendedList.value, { title: searchContent.value })

  createResearchTopic({ keywords: searchContent.value }).then((res) => {
    if (res.code === 10000) {
      getCreateResearchTopicResFn(res.data.id)
      topicSelectionDirection.value = res.data.title
      researchId.value = res.data.id
      emits('handleRefreshDialogList', researchId.value)
      // 刷新左侧会话记录，并定位到当前会话
    } else {
      step.value = 1
      loading.value = false
    }
  })
}
const timer = ref()
const getCreateResearchTopicResFn = (id, isHistory) => {
  return new Promise((resolve) => {
    getCreateResearchTopicRes({ id }).then((res) => {
      if (res.code === 10000) {
        if (res.data.generateTopicRecommendStatus === 1) {
          timer.value = setInterval(() => {
            getCreateResearchTopicRes({ id }).then((res) => {
              if (res.code === 10000) {
                if (res.data.generateTopicRecommendStatus === 1) {
                  return
                }
                if (res.data.generateTopicRecommendStatus === 2) {
                  if (isHistory) {
                    clearInterval(timer.value)
                    resolve(true)
                  } else {
                    handleAI(id)
                    topicList.value = res.data.topicRecommend || []
                    loading.value = false
                    rightLoading.value = true
                    clearInterval(timer.value)
                    resolve()
                  }
                } else {
                  clearInterval(timer.value)
                  if (res.data.generateTopicRecommendStatus === 30) {
                    errorText.value =
                      '很抱歉，在处理您请求的过程中，我们的AI引擎遇到了一个意外错误，无法完成此次任务。'
                  } else if (res.data.generateTopicRecommendStatus === 31) {
                    errorText.value =
                      '暂时未检索到与您描述高度契合的现有文献，请尝试简化或拆分您的关键词，或者这可能是您正触及一个极具创新性的研究方向。'
                  } else {
                    errorText.value =
                      '响应超时，网络或服务器可能在忙碌，请稍后重试～'
                  }
                  timeOut.value = true
                  resolve()
                }
              }
            })
          }, 5000)
          return
        }
        if (res.data.generateTopicRecommendStatus === 2) {
          if (isHistory) {
            timer.value && clearInterval(timer.value)
            resolve(true)
          } else {
            handleAI(id)
            topicList.value = res.data.topicRecommend || []
            loading.value = false
            rightLoading.value = true
            timer.value && clearInterval(timer.value)
            resolve()
          }
        } else {
          timer.value && clearInterval(timer.value)
          if (res.data.generateTopicRecommendStatus === 30) {
            errorText.value =
              '很抱歉，在处理您请求的过程中，我们的AI引擎遇到了一个意外错误，无法完成此次任务。'
          } else if (res.data.generateTopicRecommendStatus === 31) {
            errorText.value =
              '暂时未检索到与您描述高度契合的现有文献，请尝试简化或拆分您的关键词，或者这可能是您正触及一个极具创新性的研究方向。'
          } else {
            errorText.value = '响应超时，网络或服务器可能在忙碌，请稍后重试～'
          }
          timeOut.value = true
          resolve()
        }
      }
    })
  })
}
const SSE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  Accept: 'text/event-stream',
  Authorization: `Bearer ${getToken()}`
}

// 在需要时主动断开
const stopSSE = () => {
  if (controller && loading.value) {
    console.log('前端主动终止 SSE 连接')
    controller.abort()
    loading.value = false
  }
}
const canDownLoad = ref(0)

const handleAI = (id) => {
  controller = new AbortController()
  // eslint-disable-next-line no-undef
  fetchEventSource(
    `${window.location.protocol}//${window.location.host}/api/agent/researchSelect/getReplyList`,
    {
      method: 'POST',
      headers: SSE_HEADERS,
      body: JSON.stringify({
        id
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
          // const delta = JSON.parse(msg.data)
          // handleMessage(delta)
          const msgArr = JSON.parse(msg.data)
          msgArr.forEach((msgItem) => {
            if (msgItem.chatContentType === 1) {
              loading.value = false
              const index = lodash.findIndex(titleList.value, {
                type: msgItem.title
              })
              if (index !== -1) {
                titleList.value[index].renderMsgList.push(msgItem.content)
                scrollBottom()
              }
            } else if (msgItem.chatContentType === 3) {
              canDownLoad.value += 1
              if (canDownLoad.value >= 3) {
                getResearchTopicDataFn()
              }
            } else if (msgItem.chatContentType === 4) {
              console.log('异常状态稍后处理')
              const index = lodash.findIndex(titleList.value, {
                type: msgItem.title
              })
              if (index !== -1) {
                titleList.value[index].renderMsgList = []
                titleList.value[index].isFail = true
                scrollBottom()
              }
            }
          })
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
    }
  )
}
const statisticalData = ref({})
const isShowWordCloud = ref(false)
const isShowRelation = ref(false)
const getResearchTopicDataFn = () => {
  getResearchTopicData({ id: researchId.value }).then((res) => {
    if (res.code === 10000) {
      rightLoading.value = false
      statisticalData.value = { ...res.data }
      titleList.value.forEach((item) => {
        if (['words', 'hotTopic'].includes(item.type)) {
          item.loading = false
        }
      })

      if (res.data?.wordCloud.length) {
        isShowWordCloud.value = true
        nextTick(() => {
          wordCloudConfig.value = wordCloudConfigFn(
            res.data?.wordCloud.map((obj) => {
              return {
                name: obj.name,
                value: obj.num
              }
            })
          )
        })
      } else {
        isShowWordCloud.value = false
      }
      if (res.data?.coOccurringWords.length) {
        isShowRelation.value = true
        nextTick(() => {
          relationConfig.value = relationshipDiagramFn(
            res.data?.nodes,
            res.data?.coOccurringWords,
            res.data?.categories.map((obj) => {
              return { name: obj }
            })
          )
        })
      } else {
        isShowRelation.value = false
      }
    }
  })
}
const scrollbarRef = ref()
const isAutoScroll = ref(true) // 是否自动滚动
const STOP_DISTANCE = 60 // 向上滚动超过 60px 就停止自动滚动

// 监听用户滚动
const handleScroll = lodash.throttle(() => {
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

const scrollBottom = lodash.throttle(() => {
  const container = scrollbarRef.value?.wrapRef
  if (container && isAutoScroll.value) {
    container.scrollTop = container.scrollHeight - container.clientHeight
  }
}, 1000)
const handleError = (error) => {
  throw error
}

const literatureContent = ref('') // 文献内容

const getReference = () => {
  getReferenceList({ id: props.activeSessionInfo?.dialogId }).then((res) => {
    if (res.code === 10000) {
      literatureContent.value = res.data?.references || ''
    }
  })
}

const handleClose = () => {
  loading.value = false
  getReference()
  // if (chatMessages.value) {
  //   chatMessages.value.messages[chatMessages.value.messages.length - 1].loading = false
  //   activeSessionInfo.value.messages = chatMessages.value.messages
  // }
}
const renderMsgList = ref([])
const toInput = (text) => {
  searchContent.value = text
}
const topicList = ref([])
const handleEmitNext = (item) => {
  emits('next', item)
}
// 处理下载事件
const handleDownload = (item) => {
  if (canDownLoad.value >= 3) {
    downLoadFile({
      fileType: item.value,
      id: researchId.value
    }).then((res) => {
      const time = formatDateTime2()
      const fileName = `基金选题推荐_#${downloadFileName.value}_${time}.${item.fileType}` // 导出文件名
      blodDownLoadFile(res, fileName)
    })
  } else {
    ElMessage.warning('请等待回答完成后再尝试下载')
  }
}
const handleRetryKeyWords = (kerwords) => {
  loading.value = true
  loadingText.value = '正在分析题目'
  textInterval()
  reGenerate({ keywords: kerwords, id: researchId.value }).then((res) => {
    if (res.code === 10000) {
      getCreateResearchTopicResFn(researchId.value)
      // topicSelectionDirection.value = res.data.title
      // researchId.value = res.data.id
      // 刷新左侧会话记录，并定位到当前会话
    }
  })
}
const handleRetry = (obj) => {
  reGenerateSingleChapter({ id: researchId.value, title: obj.type }).then(
    (res) => {
      if (res.code === 10000) {
        handleReGenerateSingleChapter(obj)
      }
    }
  )
}
const handleReGenerateSingleChapter = (obj) => {
  const subController = new AbortController()
  obj.loading = true
  obj.isFail = false
  obj.renderMsgList = []
  fetchEventSource(
    `${window.location.protocol}//${window.location.host}/api/agent/researchSelect/getReply`,
    {
      method: 'POST',
      headers: SSE_HEADERS,
      body: JSON.stringify({
        id: researchId.value,
        title: obj.type
      }),
      signal: subController.signal,
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
          // const delta = JSON.parse(msg.data)
          // handleMessage(delta)
          const msgItem = JSON.parse(msg.data)
          if (msgItem.chatContentType === 1) {
            obj.loading = false
            const index = lodash.findIndex(titleList.value, {
              type: msgItem.title
            })
            if (index !== -1) {
              titleList.value[index].isFail = false
              titleList.value[index].renderMsgList.push(msgItem.content)
              scrollBottom()
            }
          } else if (msgItem.chatContentType === 3) {
            canDownLoad.value += 1
            if (canDownLoad.value >= 3) {
              getResearchTopicDataFn()
            }
          } else if (msgItem.chatContentType === 4) {
            const index = lodash.findIndex(titleList.value, {
              type: msgItem.title
            })
            if (index !== -1) {
              titleList.value[index].renderMsgList = []
              titleList.value[index].isFail = true
              scrollBottom()
            }
          }
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
    }
  )
}
const handleRetryAll = () => {
  loading.value = true
  loadingText.value = '正在分析题目'
  textInterval()
  timeOut.value = false
  handleRetryKeyWords('')
}
const relationConfig = ref({})
const wordCloudConfig = ref({})
const downloadFileName = ref('')
onMounted(async () => {
  if (props.activeSessionInfo?.dialogId) {
    topicSelectionDirection.value = props.activeSessionInfo?.dialogTitle
    researchId.value = props.activeSessionInfo?.dialogId
    step.value = 2
    loading.value = true
    loadingText.value = '正在分析题目'
    textInterval()
    const hisStatus = await getCreateResearchTopicResFn(researchId.value, true)
    if (hisStatus) {
      getResearchTopicDetail({ id: props.activeSessionInfo?.dialogId }).then(
        (res) => {
          if (res.code === 10000) {
            loading.value = false
            renderMsgList.value.push(res.data.reply)
            topicList.value = res.data.topicRecommend || []
            downloadFileName.value = res.data?.keywords
            if (
              res.data.backgroundReplyStatus === 2 &&
              res.data.challengeReplyStatus === 2 &&
              res.data.topicReplyStatus === 2
            ) {
              canDownLoad.value = 3
              rightLoading.value = true
              titleList.value.forEach((item) => {
                if (item.type === 'background') {
                  item.renderMsgList.push(res.data.backgroundReply)
                } else if (item.type === 'topic') {
                  item.renderMsgList.push(res.data.topicReply)
                } else if (item.type === 'challenge') {
                  item.renderMsgList.push(res.data.challengeReply)
                }
              })
              getResearchTopicDataFn(props.activeSessionInfo?.dialogId)
            } else {
              getResearchTopicDataFn(props.activeSessionInfo?.dialogId)
              canDownLoad.value = 0
              titleList.value.forEach((item) => {
                if (item.type === 'background') {
                  item.renderMsgList.push(res.data.backgroundReply)
                  if (res.data.backgroundReplyStatus === 1) {
                    handleReGenerateSingleChapter(item)
                  } else if (res.data.backgroundReplyStatus === 3) {
                    item.isFail = true
                  } else {
                    canDownLoad.value += 1
                  }
                } else if (item.type === 'topic') {
                  item.renderMsgList.push(res.data.topicReply)
                  if (res.data.topicReplyStatus === 1) {
                    handleReGenerateSingleChapter(item)
                  } else if (res.data.topicReplyStatus === 3) {
                    item.isFail = true
                  } else {
                    canDownLoad.value += 1
                  }
                } else if (item.type === 'challenge') {
                  item.renderMsgList.push(res.data.challengeReply)
                  if (res.data.challengeReplyStatus === 1) {
                    handleReGenerateSingleChapter(item)
                  } else if (res.data.challengeReplyStatus === 3) {
                    item.isFail = true
                  } else {
                    canDownLoad.value += 1
                  }
                }
              })
              canDownLoad.value = 0
            }
            getReference()
          }
        }
      )
    }
  }
})
onUnmounted(() => {
  stopSSE()
  timer.value && clearInterval(timer.value)
  textTimer.value && clearInterval(textTimer.value)
})
</script>
<style scoped lang="scss">
.researchTopic {
  display: flex;
  overflow: hidden;
  align-items: center;
  width: 100%;
  height: 100%;

  .page-div {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    background: url('@/assets/aiBg.png') no-repeat;
    background-size: 100% 100%;
    .el-scrollbar {
      width: 100%;
      height: 100%;
      .main {
        width: 880px;
        margin: 0 auto;
        padding-bottom: 24px;
        :deep(.header-box) {
          margin-top: 90px;
        }
      }
    }
    .logo {
      width: 361px;
      height: 84px;
      margin-top: 181px;
      margin-bottom: 60px;
    }
    // .main {
    //   display: flex;
    //   flex-direction: column;
    //   box-sizing: border-box;
    //   width: 880px;
    //   height: 111px;
    //   padding: 16px 24px;
    //   border: 1px solid #d8d8d8;
    //   border-radius: 8px;
    //   background-color: var(--theme-fill);
    //   //background: url('@/assets/searchBorder.png') no-repeat;
    //   background-size: 100% 100%;
    //   :deep(.search) {
    //     flex: 1;
    //     height: 0;
    //     .el-textarea__inner {
    //       box-sizing: border-box;
    //       height: 100%;
    //       min-height: 0;
    //       padding: 0;
    //       border: 0;
    //       border-radius: 0;
    //       box-shadow: none;
    //     }
    //   }
    //   .opContainer {
    //     display: flex;
    //     justify-content: space-between;
    //     align-items: center;
    //     .deepThinking {
    //       display: flex;
    //       justify-content: center;
    //       align-items: center;
    //       width: 89px;
    //       height: 31px;
    //       border: 1px solid #c9d9ff;
    //       border-radius: 16px;
    //       background: #e4e7fd;
    //       cursor: pointer;
    //       font-weight: 600;
    //       font-size: 14px;
    //       color: var(--theme-primary);
    //     }
    //     .sendIcon {
    //       width: 29px;
    //       height: 29px;
    //       cursor: pointer;
    //     }
    //   }
    // }
    .generate {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 250px;
      height: 50px;
      margin: 0 auto;
      margin-top: 42px;
      border-radius: 50px;
      background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      color: #fdfdfd;
      .iconfont {
        margin-right: 12px;
      }
      :deep(.loading) {
        margin-right: 12px;
      }
      &.dis {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    // .AIResearchBtn {
    //   width: 249px;
    //   height: 51px;
    //   margin: 40px auto;
    //   cursor: pointer;
    // }
    .recommended {
      box-sizing: border-box;
      width: 880px;
      margin-top: 39px;
      padding: 24px;
      border: 1px solid #fff;
      border-radius: 16px;
      background:
        linear-gradient(
          180deg,
          rgba(54, 112, 248, 0.095) 0%,
          rgba(255, 255, 255, 0) 100%
        );
      .recommendIcon {
        width: 89px;
        height: 20px;
        margin-bottom: 15px;
      }
      .recommendedItem {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        // padding: 0 18px;
        cursor: pointer;
        line-height: 25px;
        font-weight: 400;
        font-size: 16px;
        color: #656566;
        &:hover {
          color: var(--theme-primary);
        }
        // &.actived {
        //   color: var(--theme-primary);
        // }
        .bookIcon {
          width: 14px;
          height: 15px;
          margin-right: 10px;
        }
      }
    }
  }
}
.mainContent {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--theme-bg)#f0f3f8;
  .topHeader {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 65px;
    padding: 0 24px;
    border-radius: 8px;
    background: var(--theme-card);
    .AINotice {
      margin-right: 18px;
      font-weight: 400;
      font-size: 16px;
      color: var(--theme-text-3);
    }
    .fontControls {
      display: flex;
      position: relative;
      align-items: center;
      margin: 0 20px;
      &::before {
        position: absolute;
        left: -20px;
        top: 50%;
        width: 0;
        height: 20px;
        border-right: 1px solid #999;
        content: "";
        transform: translateY(-50%);
      }
      >span {
        font-weight: 400;
        font-size: 18px;
      }
      .fontContainer {
        display: flex;
        align-items: center;
        .fontItem {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid #d8d8d8;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
          font-size: 18px;
          color: var(--theme-text-3);
          &:nth-of-type(2) {
            margin: 0 10px;
          }
          &.actived {
            border: 1px solid var(--theme-primary);
            background: var(--theme-primary);
            color: #fff;
          }
        }
      }
    }
    .title {
      flex: 1;
      line-height: 23px;
      font-weight: 700;
      font-size: 18px;
      color: #3d3d3d;
      .direction {
        color: var(--theme-primary);
      }
    }
    .language {
      display: flex;
      position: relative;
      align-items: center;
      &::before {
        position: absolute;
        left: 50%;
        width: 1px;
        height: 100%;
        background-color: #c7d6f9;
        content: '';
      }
      .LanItem {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        width: 60px;
        height: 32px;
        border: 1px solid #d8d8d8;
        cursor: pointer;
        font-size: 14px;
        color: var(--theme-text-2);
        &.actived {
          border: 1px solid #c7d6f9;
          background: linear-gradient(111deg, #ebf0ff 0%, #efebff 100%);
          font-size: 14px;
          color: var(--theme-primary);
        }
        &:nth-of-type(1) {
          border-right: 0;
          border-radius: 16px 0 0 16px;
        }
        &:nth-of-type(2) {
          border-left: 0;
          border-radius: 0 16px 16px 0;
        }
      }
    }
    :deep(.downloadBtn) {
      height: 40px;
      margin-left: 10px;
      border-radius: 20px;
      .iconfont {
        margin-right: 6px;
      }
      span { font-size: 18px; }
    }
  }
  .stepContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    width: 100%;
    height: 0;
    margin-top: 16px;
  }
  .loadingContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    width: 100%;
    height: 100%;
    margin-top: 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    .AILoadingF {
      width: 126px;
      height: 126px;
    }
    .loadingText {
      margin-top: 5px;
      line-height: 22px;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-text-2);
    }
  }
}
.AILoadingF2 {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.leftContainer,
.rightContaienr {
  overflow: hidden;
  box-sizing: border-box;
  width: calc(50% - 8px);
  height: 100%;
  padding: 24px;
  border: 1px solid #fff;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  .titleContent {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-primary);
    .iconfont {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
  }
  .timeOutText {
    margin-top: 16px;
    line-height: 20px;
    text-align: center;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
.leftContainer {
  position: relative;
  .references {
    padding: 0 16px 16px 16px;
    border-top: 1px solid #e8e8e8;
    .title {
      margin-bottom: 12px;
      padding-left: -12px;
      padding-top: 12px;
      text-align: left;
      font-weight: 600;
      font-weight: 500;
      font-size: 12px;
      color: var(--theme-text);
    }
    .content {
      line-height: 23px;
      font-weight: 400;
      font-size: 12px;
      color: var(--theme-text-2);
      white-space: pre-wrap;
    }
  }
  .report {
    position: absolute;
    top: 0;
    width: 100%;
    padding-bottom: 16px;
    background-color: var(--theme-card);
    line-height: 23px;
    text-align: center;
    font-weight: 700;
    font-size: 16px;
    color: #3d3d3d;
  }
  .subTitle {
    display: flex;
    align-items: center;
    // width: 722px;
    height: 39px;
    // margin-bottom: 14px;
    padding-left: 16px;
    border-radius: 2px;
    background: rgba(54, 112, 248, 0.05);
    line-height: 20px;
    font-weight: 600;
    font-size: 14px;
    color: #005dff;
    .line {
      width: 2px;
      height: 12px;
      margin-right: 6px;
      background: #005dff;
    }
  }
  .failContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 26px;
    .AIFailIcon {
      width: 30px;
    }
    span {
      line-height: 20px;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text-2);
      &.retryText {
        cursor: pointer;
        color: var(--theme-primary);
      }
    }
  }
  .contentItem {
    box-sizing: border-box;
    padding: 16px;
    .custom-text {
      margin-left: 8px;
    }
    .redWord {
      color: #ff4e4e;
    }
  }
  :deep(.el-scrollbar__view) {
    box-sizing: border-box;
    padding-top: 40px;
  }
}
.rightContaienr {
  position: relative;
  box-sizing: border-box;
  padding: 16px;
  .rightTitle {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 8px;
    line-height: 23px;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-primary);
    .light {
      width: 14px;
      height: 20px;
      margin-right: 9px;
    }
  }
  .topicRecommendation {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 8px;
    padding-bottom: 18px;
    border-bottom: 1px solid #e8e8e8;
    .pointer {
      width: 7px;
      height: 7px;
      margin-right: 10px;
      border-radius: 50%;
      background: var(--theme-primary);
    }
    .RTitle {
      display: flex;
      overflow: hidden;
      flex: 1;
      line-height: 20px;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text);
    }
    .tag {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      width: 78px;
      height: 26px;
      margin-left: 29px;
      margin-right: 29px;
      padding: 0 10px;
      border-radius: 4px;
      background: rgba(54, 112, 248, 0.1);
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-primary);
    }

    .btn {
      display: flex;
      align-items: center;
      height: 32px;
      padding: 0 16px;
      border: 1px solid var(--theme-primary);
      border-radius: 16px;
      cursor: pointer;
      font-size: 14px;
      color: var(--theme-primary);
    }
  }
  .retryContainer {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    align-items: flex-start;
    box-sizing: border-box;
    width: 100%;
    min-height: 203px;
    margin-top: 24px;
    margin-bottom: 24px;
    padding: 16px 20px;
    border: 1px solid #c9d8fc;
    border-radius: 8px;
    background: rgba(238, 243, 255, 0.5);
    .retryNotice {
      display: flex;
      img {
        width: 29px;
        height: 31px;
        margin-right: 6px;
      }
      .noticeText {
        line-height: 20px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text-2);
      }
    }
    .customEditContainer {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      width: 100%;
      margin-top: 22px;
      border-radius: 4px;
      background: var(--theme-card);
      :deep(.editableDivContaienr) {
        // height: 0;
      }
    }
  }
  .chartsTitle {
    margin-bottom: 14px;
    line-height: 23px;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-primary);
    .iconfont {
      margin-right: 6px;
    }
  }
  .chartsDescribe {
    margin-bottom: 24px;
    padding-left: 22px;
    line-height: 20px;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text);
    .searchContent {
      font-weight: 600;
      color: var(--theme-primary);
    }
  }
  .wordCloudContainer {
    display: flex;
    align-items: center;
    width: 100%;
    height: 500px;
    &.empty {
      box-sizing: border-box;
      height: auto;
      padding: 80px;
    }
  }
}
.echartsPlaceDom {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  img {
    width: 67px;
    margin-bottom: 16px;
  }
  span {
    line-height: 20px;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
.treeLabel {
  overflow: hidden; /* 隐藏溢出内容 */
  flex: 1;
  // max-width: 50px;
  line-height: 20px;
  text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
  font-weight: 400;
  font-size: 14px;
  white-space: nowrap;
}
:deep(.common-markdown) {
  & * p {
    line-height: 23px;
    font-size: 14px;
  }
}
.researchTopic {
  &.middleSize {
    :deep(.common-markdown) {
      & * p {
        line-height: 30px;
        font-size: 18px;
      }
    }
    .aiLterContainer {
      // background-color: red;
      .main .search :deep(.el-textarea .el-textarea__inner) {
        font-size: 18px;
      }
    }
    .page-div .generate {
      font-size: 20px;
      .iconfont {
        font-size: 18px;
      }
    }
    .page-div .recommended {
      .recommendIcon {
        width: 96px;
      }
      .recommendedItem {
        line-height: 30px;
        font-size: 20px;
      }
    }
    .leftContainer .report {
      font-size: 20px;
    }
    .leftContainer .subTitle {
      height: 54px;
      font-size: 18px;
    }
    .leftContainer .subTitle .line {
      height: 19px;
    }
    .leftContainer .references .title {
      position: relative;
      left: -10px;
      font-size: 18px;
    }
    .leftContainer .references .content {
      font-size: 16px;
    }
    .leftContainer .contentItem {
      line-height: 30px;
      font-size: 18px;
      color: var(--theme-text);
    }
    .rightContaienr .rightTitle {
      font-size: 20px;
    }
    .treeLabel {
      font-size: 18px;
    }
    .rightContaienr .topicRecommendation .tag {
      width: 97px;
      height: 34px;
      margin-left: 21px;
      margin-right: 21px;
      font-size: 18px;
    }
    .rightContaienr .topicRecommendation .btn {
      height: 41px;
      border-radius: 21px;
      font-weight: 600;
      font-size: 18px;
    }
    .rightContaienr .retryContainer {
      min-height: 260px;
      .retryNotice .noticeText {
        line-height: 30px;
        font-size: 18px;
      }
    }

    :deep(#editableDiv),
    :deep(.retryBtn),
    :deep(.placeholderDom) {
      font-size: 18px;
    }
    .rightContaienr .chartsTitle,
    .rightContaienr .chartsDescribe {
      line-height: 30px;
      font-size: 18px;
    }
    .chartsTitle i {
      font-size: 18px;
    }
    .echartsPlaceDom span {
      font-size: 16px;
    }
  }
}
.researchTopic {
  &.largeSize {
    :deep(.common-markdown) {
      & * p {
        line-height: 36px;
        font-size: 22px;
      }
    }
    .aiLterContainer {
      // background-color: red;
      .main .search :deep(.el-textarea .el-textarea__inner) {
        font-size: 18px;
      }
    }
    .page-div .generate {
      font-size: 20px;
      .iconfont {
        font-size: 18px;
      }
    }
    .page-div .recommended {
      .recommendIcon {
        width: 96px;
      }
      .recommendedItem {
        line-height: 30px;
        font-size: 20px;
      }
    }
    .leftContainer .report {
      font-size: 24px;
    }
    .leftContainer .subTitle {
      height: 54px;
      font-size: 22px;
    }
    .leftContainer .subTitle .line {
      height: 19px;
    }
    .leftContainer .references .title {
      position: relative;
      left: -10px;
      font-size: 20px;
    }
    .leftContainer .references .content {
      line-height: 32px;
      font-size: 20px;
    }
    .leftContainer .contentItem {
      line-height: 36px;
      font-size: 22px;
    }
    .rightContaienr .rightTitle {
      font-size: 24px;
    }
    .treeLabel {
      line-height: 22px;
      font-size: 22px;
    }
    .rightContaienr .topicRecommendation .tag {
      width: 117px;
      height: 38px;
      margin-left: 18px;
      margin-right: 18px;
      font-size: 22px;
    }
    .rightContaienr .topicRecommendation .btn {
      height: 41px;
      border-radius: 21px;
      font-weight: 600;
      font-size: 18px;
    }
    .rightContaienr .retryContainer {
      min-height: 355px;
      .retryNotice .noticeText {
        line-height: 36px;
        font-size: 22px;
      }
    }
    :deep(#editableDiv),
    :deep(.retryBtn),
    :deep(.placeholderDom) {
      font-size: 22px;
    }
    :deep(.placeholderDom) {
      line-height: 32px;
    }
    .rightContaienr .chartsTitle,
    .rightContaienr .chartsDescribe {
      line-height: 35px;
      font-size: 24px;
    }
    .chartsTitle i {
      font-size: 24px;
    }
    .echartsPlaceDom span {
      font-size: 20px;
    }
  }
}
</style>
<style>
.middleSizePopper {
  span {
    line-height: 30px;
    font-size: 18px;
  }
}
.largeSizePopper {
  span {
    line-height: 36px;
    font-size: 22px;
  }
}
</style>
