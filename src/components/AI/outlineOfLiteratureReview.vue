<template>
  <div class="overviewOutline" v-if="[0,1].includes(type)">
    <el-scrollbar width="100%" height="100%" ref="scrollbarRef" class="overviewOutlinescrollbar">
      <universalHead showAnalysis :disabled="num !== 0" class="page-div" :logo="aiLogo" placeholder="请填写完整的综述标题" @search="value => searchContent = value" ref="universalHeadRef" @handleRequest="search" @setSearchContent="(value)=>{userContent = value}">
        <div class="condition">
          <commonSubTitle text="综述索引"></commonSubTitle>
          <div class="form">
            <el-form ref="ruleFormRef" :model="ruleForm" label-width="auto" label-position="top">
              <el-form-item label="参考文献发表时间范围:" >
                <el-form-item prop="time">
                  <YearRange
                    :isLimitYear="true"
                    :clearable="false"
                    :style="{width:pxToRem(328),height:pxToRem(42)}"
                    v-model="ruleForm.time"
                    startPlaceholder="开始时间"
                    endPlaceholder="结束时间"
                  />
                </el-form-item>
              </el-form-item>
              <el-form-item label="生成模式:" prop="mode" required>
                <el-radio-group v-model="ruleForm.mode">
                  <el-radio value='normal'>标准版</el-radio>
                  <el-radio value='think'>深度思考版 <span class="tip">(耗时略长)</span> </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="综述语言:" prop="language" required>
                <el-radio-group v-model="ruleForm.language">
                  <el-radio value="chinese">中文</el-radio>
                  <el-radio value="english">英文</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生成大纲:" prop="generateOutline" required>
                <el-radio-group :model-value="ruleForm.generateOutline">
                  <el-radio value="1" @click="radioChange('1')">AI生成</el-radio>
                  <el-radio value="2" @click="radioChange('2')">自定义</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <template v-if="ruleForm.generateOutline === '1'">
          <div class="generate" @click="search" :class="{'dis':!searchContent}">
            <i class="iconfont icon-yijianbianji" v-if="num === 0" ></i>
            <Loading :size="16" color="#fff" v-else/>
            <span>生成综述大纲</span>
          </div>
          <div class="recommended" v-if="!type && !num">
            <img src="@/assets/recommendedTopics.png" alt="" class="recommendIcon">
            <div :class="{recommendedItem:true,actived:recommendedId===item.id}" v-for="(item,index) in recommendedList" :key="index" @click="handleRecommended(item)">
              {{(index+1)+'.'+ item.title }}
            </div>
          </div>
        </template>
        <div class="content" v-if="num !== 0 && type === 0">
          <div class="contentHeader">
            <i class="iconfont icon-jiansuo"></i>
            <span class="text">{{ text }}</span>
            <el-progress :percentage="num" :show-text="false"/>
          </div>
          <el-skeleton :rows="10" animated />
        </div>
        <div v-if="(type === 1) || ruleForm.generateOutline === '2'" class="contentList" :class="{'customize': ruleForm.generateOutline === '2'}">
          <div class="contentContainer">
            <div class="mask"></div>
            <div class="content-header">
              <img :src="aiLiter5" alt="">
              <span class="flex1">您可以编辑此大纲，或按原样继续</span>
              <span v-if="ruleForm.generateOutline === '1'">内容由AI生成，注意甄别，仅供参考</span>
            </div>
            <template v-if="ruleForm.generateOutline === '1'">
              <Printer class="printer" :previewContent="outlineHTML(aiLiteratureReviewIntelligentAgentsData)" :speed="1" @complete="generating = false" v-if="generating"/>
              <template v-else>
                <customOutline v-model="aiLiteratureReviewIntelligentAgentsData" :isShowTitle="false"></customOutline>
              </template>
              <div class="flexSp">
                <span class="regenerate" v-show="!generating" @click="search" ><i class="iconfont icon-liebiao-shuaxin"></i> 重新生成</span>
                <div class="generate" @click="handler" :class="{'dis':generating}">
                  <i class="iconfont icon-yijianbianji" v-if="!btnLoading" ></i>
                  <Loading :size="16" color="#fff" v-else/>
                  <span>根据大纲生成综述</span>
                </div>
                <div></div>
              </div>
            </template>
            <customOutline ref="customOutlineRef" v-model="customData" v-else></customOutline>
          </div>
        </div>
        <div class="generate" @click="handlerCustomize" :class="{'dis':customOutlineRef?.isCheckTitle }" v-if="ruleForm.generateOutline === '2'">
          <i class="iconfont icon-yijianbianji" v-if="!btnLoading" ></i>
          <Loading :size="16" color="#fff" v-else/>
          <span>根据大纲生成综述</span>
        </div>
      </universalHead>
    </el-scrollbar>
  </div>
  <literatureReviewContent
    v-if="type === 2"
    :id="ruleForm.generateOutline === '1' ? outlineId : customOutlineId"
    :title="cloneSearchContent"
    :isHistory="isHistory"
    :isAiGenerated="ruleForm.generateOutline === '1'"
    @handleRefreshDialogList="()=>{emits('handleRefreshDialogList',ruleForm.generateOutline === '1' ? outlineId : customOutlineId)}"
  >
  </literatureReviewContent>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import universalHead from '@/components/AI/universalHead.vue'
import aiLiter5 from '@/assets/aiLiter5.png'
import aiLogo from '@/assets/aiLogo.png'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { outlineHTML, aiLiteratureDataHandler, aiLiteratureDataRestore } from '@/components/AI/js/data.js'
import Printer from '@/components/AI/printer.vue'
import literatureReviewContent from './literatureReviewContent.vue'
import { getReviewOutline, updateReviewOutline, generateCustomReview, getReviewOutlineResult, getHistory } from '@/api/api_agent.js'
import customOutline from '@/components/AI/customOutline.vue'
import { debounce } from 'lodash'

const emits = defineEmits(['handleRefreshDialogList'])

const ruleForm = reactive({ // 表单数据
  time: [], // 参考文献发表时间范围
  language: 'chinese', // 综述语言
  mode: 'normal', // 生成模式
  generateOutline: '1' // 生成大纲
})
const props = defineProps({
  id: {
    type: String,
    default: ''
  }
})
const scrollbarRef = ref(null) // 滚动条ref
const outlineId = ref('') // 综述大纲id
const customOutlineId = ref('') // 自定义大纲id
const universalHeadRef = ref(null) // 头部ref
const aiLiteratureReviewIntelligentAgentsData = ref([]) // 综述大纲数据
const customOutlineRef = ref(null) // 自定义大纲ref
const customData = ref([]) // 自定义大纲数据
const btnLoading = ref(false) // 按钮加载状态
const type = ref(0) // 0检索文献 1综述大纲 2综述报告
const num = ref(0) // 进度条
const generating = ref(false) // 是否正在生成
const searchContent = ref('') // 搜索内容
const cloneSearchContent = ref('') // 克隆搜索内容
const isHistory = ref(false) // 是否是历史记录
const userContent = ref(null) // 意图分析标题
const text = computed(() => {
  const textList = ['正在分析题目', '正在检索文献', '正在整理资料', '正在规划章节', '正在生成大纲']
  const index = Math.min(Math.floor(num.value / 10), textList.length - 1)
  return textList[index]
}) // 文献检索提示语

const recommendedList = ref([
  {
    title: '抗EGFR抗体在晚期结直肠癌的临床试验汇总',
    id: 1
  },
  {
    title: 'MSI-H/dMMR结直肠癌患者免疫治疗进展',
    id: 2
  },
  {
    title: '胃癌围术期免疫治疗临床研究进展',
    id: 3
  }
  // {
  //   title: '肠道微生物调控肿瘤免疫微环境、免疫检查点抑制剂',
  //   id: 4
  // }
])
const recommendedId = ref('')
const handleRecommended = (obj) => {
  recommendedId.value = obj.id
  searchContent.value = obj.title
  universalHeadRef.value.setSearchText(obj.title)
}
// 判断是否是历史记录进入
if (props.id) {
  outlineId.value = props.id
  customOutlineId.value = props.id
  getHistory({ id: props.id }).then(res => {
    if (res.code === 10000) {
      if (Number(res.data.showStatus) !== 1) {
        getReviewOutlineResult({ id: props.id }).then(res => {
          if (res.code === 10000) {
            if (res.data.generateReviewOutlineStatus !== 1) {
              setoutlineResults(res.data, props.id, false)
            } else {
              type.value = 0
              num.value = 90
              setIntervalReuse(props.id)
            }

            // 回显条件
            const search = JSON.parse(res.data.searchCondition)
            universalHeadRef.value.setSearchText(search.reviewTitle)
            if (search.startTime && search.endTime) {
              ruleForm.time = [search.startTime + '-01-01 00:00:00', search.endTime + '-12-31 23:59:59']
            }
            ruleForm.language = search.language
            ruleForm.mode = search.mode
          }
        })
      } else {
        type.value = 2
        isHistory.value = true
      }
    }
  })
}

// 搜索综述大纲
let _searchTimer = null
const search = () => {
  if (!searchContent.value || generating.value || num.value !== 0) return
  type.value = 0
  num.value = 1
  if (_searchTimer) clearInterval(_searchTimer)
  _searchTimer = setInterval(() => {
    num.value += 1
    if (num.value >= 95) {
      clearInterval(_searchTimer)
      _searchTimer = null
    }
  }, 1000)
  setTimeout(() => {
    scrollbarRef.value?.wrapRef?.scrollTo({ top: scrollbarRef.value?.wrapRef?.scrollHeight, behavior: 'smooth' })
  }, 500)
  getReview()
}

// 调用综述大纲接口
const getReview = async () => {
  const params = {
    reviewTitle: searchContent.value,
    userContent: userContent.value,
    language: ruleForm.language,
    startTime: ruleForm.time.length ? ruleForm.time[0].split('-')[0] : '',
    endTime: ruleForm.time.length ? ruleForm.time[1].split('-')[0] : '',
    mode: ruleForm.mode,
    id: outlineId.value || undefined
  }
  try {
    const res = await getReviewOutline(params)
    if (res.code === 10000) {
      await setIntervalReuse(res.data.id)
      emits('handleRefreshDialogList', res.data.id)
    } else {
      clearTime(res.msg)
    }
  } catch (error) {
    clearTime()
  }
}

let stop = null // 轮询停止函数

const setIntervalReuse = (id) => {
  stop = startPolling(getReviewOutlineResult, { id }, (result) => {
    setoutlineResults(result.data, id)
  })
}

const setoutlineResults = (data, id, showIsLoading = true) => {
  if (data.generateReviewOutlineStatus === 2) {
    stop?.()
    num.value = 100
    outlineId.value = id
    aiLiteratureReviewIntelligentAgentsData.value = aiLiteratureDataHandler(data?.reviewOutlineList || [])
    type.value = 1
    generating.value = showIsLoading
    if (_searchTimer) clearInterval(_searchTimer)
    num.value = 0
    cloneSearchContent.value = searchContent.value
  } else if ([20, 30, 31].includes(data.generateReviewOutlineStatus)) {
    stop?.()
    const msgObj = {
      20: '大纲生成失败',
      30: 'agent无响应',
      31: 'agent没有查询到文献'
    }
    clearTime(msgObj[data.generateReviewOutlineStatus])
  }
}

// 清空定时器
const clearTime = (data) => {
  if (data) {
    ElMessage.error(data)
  }

  if (_searchTimer) clearInterval(_searchTimer)
  num.value = 0
}

// 生成综述
const handler = () => {
  if (generating.value) return
  if (customOutlineRef.value?.isCheckTitle) {
    ElMessage.error('请填写完整的大纲内容')
    return
  }
  btnLoading.value = true
  updateReview([...aiLiteratureReviewIntelligentAgentsData.value]).then(value => {
    if (value) {
      btnLoading.value = false
      type.value = 2
    } else {
      ElMessage.error('保存失败，请重试')
      btnLoading.value = false
    }
  })
}

// 大纲发生改变的时候实时保存
watch(() => aiLiteratureReviewIntelligentAgentsData.value, debounce((value, oldVlue) => {
  if (oldVlue && value) {
    updateReview([...value])
  }
}, 2000), { deep: true })

// 保存更新后的大纲
const updateReview = (data) => {
  const reviewOutline = aiLiteratureDataRestore(data)
  return updateReviewOutline({ reviewOutline, id: outlineId.value }).then(res => {
    if (res.code === 10000) {
      return true
    } else {
      ElMessage.error(res.msg)
      return false
    }
  })
}

const startPolling = (apiCall, params, callback) => {
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
      const delay = (isFirstComplete || props.id) ? 5000 : 60000 // 首次60秒，后续5秒
      isFirstComplete = true
      // 清理旧定时器，避免叠加
      clearTimeout(timer)
      timer = setTimeout(poll, delay)
    } else {
      clearTime('生成失败')
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

// 自定义大纲
const handlerCustomize = async () => {
  if (btnLoading.value || customOutlineRef.value?.isCheckTitle) return
  if (!searchContent.value) {
    ElMessage.error('综述标题不能为空')
    return
  }
  btnLoading.value = true
  const params = {
    reviewOutlineList: aiLiteratureDataRestore([...customData.value]),
    reviewTitle: searchContent.value,
    userContent: userContent.value,
    language: ruleForm.language,
    startTime: ruleForm.time.length ? ruleForm.time[0].split('-')[0] : '',
    endTime: ruleForm.time.length ? ruleForm.time[1].split('-')[0] : '',
    mode: ruleForm.mode
  }
  const res = await generateCustomReview(params)
  if (res.code === 10000) {
    cloneSearchContent.value = searchContent.value
    customOutlineId.value = res.data.id
    type.value = 2
    btnLoading.value = false
  } else {
    btnLoading.value = false
  }
}

const radioChange = (value) => {
  if (value === '2' && (generating.value || num.value !== 0)) {
    ElMessage.error('大纲生成中，请稍后再试')
    return
  }
  ruleForm.generateOutline = value
}

// 自动滚动到底部（节流）
// const scrollBottom = throttle(() => {
//   const container = scrollbarRef.value?.wrapRef
//   if (container) {
//     container.scrollTop = container.scrollHeight - container.clientHeight
//   }
// }, 1000)

onUnmounted(() => {
  stop?.()
})
</script>
<style lang="scss" scoped>
.overviewOutline {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
  height: 100%;
  background: url('@/assets/aiBg.png') no-repeat;
  background-size: 100% 100%;
}
.page-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  height: 100%;
}
.condition {
  box-sizing: border-box;
  width: 100%;
  margin-top: 16px;
  padding: 20px 24px;
  padding-bottom: 0;
  border-radius: 16px;
  background: var(--theme-card) url('@/assets/mengban.png') no-repeat;
  background-position: 1px 1px;
  background-size: calc(100% - 2px);
  word-break: break-all;
  :deep(.commonSubTitleText) {
    font-weight: 700;
    font-size: 20px;
    color: var(--theme-primary);
  }
  :deep(.line) {
    height: 16px;
  }
  .el-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 16px;
    :deep(.el-form-item__label),
    :deep(.el-radio__label),
    :deep(.yearShow) .el-input__inner {
      font-size: 18px;
    }
    :deep(.el-form-item__label) {
      margin-bottom: 12px;
    }
    :deep(.el-radio__label) {
      padding-left: 8px;
      padding-right: 55px;
    }
    >.el-form-item {
      width: 50%;
    }
    :deep(.clearDomContainer) {
      display: none;
    }
    .el-radio {
      margin-right: 12px;
      .tip {
        font-size: 16px;
        color: var(--theme-text-3);
      }
    }
  }
}
.generate {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 250px;
  height: 50px;
  margin: 0 auto;
  margin-top: 42px;
  margin-bottom: 40px;
  border-radius: 50px;
  background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  font-size: 20px;
  color: #fdfdfd;
  :deep(.loading),
  .iconfont {
    margin-right: 12px;
    font-size: 18px;
  }
  img {
    width: 16px;
    height: 16px;
    margin-right: 12px;
  }
  &.dis {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.recommended {
  box-sizing: border-box;
  width: 880px;
  margin-top: 39px;
  margin-bottom: 40px;
  padding: 24px;
  border: 1px solid #fff;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(54, 112, 248, 0.095) 0%, rgba(255, 255, 255, 0) 100%);
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
    line-height: 30px;
    font-weight: 400;
    font-size: 20px;
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

.content {
  box-sizing: border-box;
  width: 880px;
  min-height: 208px;
  margin: 40px 0;
  padding: 24px 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  .contentHeader {
    display: flex;
    align-items: center;
    i {
      font-size: 14px;
      color: var(--theme-primary);
    }
    .text {
      padding: 0 16px 0 8px;
      font-weight: 700;
      font-size: 18px;
      color: var(--theme-text);
    }
    .el-progress {
      flex: 1;
    }
  }
  :deep(.el-skeleton__paragraph) {
    height: 10px;
    margin-top: 12px;
  }
  :deep(.el-skeleton__item.is-first) {
    display: none;
  }
}
.contentList {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  margin: 16px 0 40px 0;
  border-radius: 8px;
  background-size: 100% 100%;
  >div {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .contentContainer {
    display: flex;
    overflow: hidden;
    position: relative;
    flex-direction: column;
    box-sizing: border-box;
    width: 880px;
    height: 100%;
    padding: 24px 24px 16px 24px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.9);
    white-space: pre-wrap;
    transition: 0.3s;
    .mask {
      position: absolute;
      right: 0;
      top: 0;
      width: 880px;
      height: 413px;
      background: url('@/assets/aiLiter6.png') no-repeat;
      background-size: 100% 100%;
    }
    :deep(.content-item-template) {
      display: flex;
      position: relative;
      flex-direction: column;
      margin-bottom: 16px;
      line-height: 20px;
      &:nth-child(1) {
        margin-top: 12px;
      }
      .subtitle {
        display: contents;
      }
      &::after {
        display: block;
        position: absolute;
        left: 0;
        top: 14px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--theme-primary);
        content: "";
      }
      .btns {
        display: none;
        position: absolute;
        right: 18px;
        top: 8px;
        .iconfont {
          cursor: pointer;
          font-size: 24px;
          color: var(--theme-primary);
        }
      }
      .yt-div-edit {
        box-sizing: border-box;
        width: calc(100% - 26px);
        padding: 8px 14px;
        border: none;
        outline: 1px solid transparent;
        background: transparent;
        font-weight: 700;
        font-size: 18px;
        color: var(--theme-text);
        &.yt-div-edit-focus {
          overflow: auto;
          margin-left: 24px;
          padding-right: 72px;
          border-radius: 2px 2px 2px 2px;
          outline: 1px solid var(--theme-primary);
          background: var(--theme-primary-soft);
          word-break: break-all;
          white-space: wrap;
        }
      }
      .yt-input {
        position: relative;
        &:has(.yt-div-edit-focus),
        &:hover {
          .btns {
            display: block;
          }
          .yt-div-edit {
            margin-left: 24px;
            padding-right: 72px;
            border-radius: 2px 2px 2px 2px;
            outline: 1px solid var(--theme-primary);
          }
        }
      }
      :deep(.subtitleItem) {
        .yt-div-edit {
          width: calc(100% - 16px);
          margin-bottom: 2px;
          font-weight: 700;
          font-size: 18px;
          color: #000;
          .yt-div-edit-focus {
            margin-left: 12px;
          }
        }
        .yt-input:hover .yt-div-edit {
          margin-left: 14px;
        }
      }
      .item-content {
        display: flex;
        flex-direction: column;
        margin-left: 12px;
        font-size: 18px;
        color: var(--theme-text);
        word-break: break-all;
        .icon-zhishitubiao {
          margin-right: 8px;
        }
        .keywords {
          display: flex;
          align-items: start;
          font-weight: 400;
          >div:first-child {
            display: flex;
            margin-top: 8px;
            line-height: 26px;
          }
          .label {
            display: flex;
            overflow: hidden;
            position: relative;
            flex-wrap: wrap;
            flex: 1;
            box-sizing: border-box;
            padding: 2px  8px;
            border: 1px solid transparent;
            span {
              font-size: 16px;
              white-space: nowrap;
            }
            .tip {
              display: flex;
              position: relative;
              align-items: center;
              margin: 4px 5px 4px 0;
              padding: 5px 0 5px 4px;
              border-radius: 2px;
              background: #dce6ff;
              line-height: 18px;
              font-size: 16px;
              color: var(--theme-primary);
              white-space: nowrap;
              .icon-guanbi {
                display: none;
                text-align: center;
                font-size: 16px;
                color: var(--theme-primary);
              }
              &:not(.icon-guanbi) {
                padding-right: 4px;
              }
            }
            .icon-jia {
              display: none;
              position: absolute;
              right: 16px;
              top: 8px;
              font-size: 24px;
              color: var(--theme-primary);
            }
            &:hover {
              box-sizing: border-box;
              margin-left: 12px;
              padding-right: 72px;
              border: 1px solid var(--theme-primary);
              border-radius: 2px 2px 2px 2px;
              background: var(--theme-primary-soft);
              .icon-jia,
              .icon-guanbi {
                display: block;
                cursor: pointer;
              }
            }
          }
        }
        .searchPurpose {
          display: flex;
          align-items: flex-start;
          white-space: nowrap;
          >i,
          >span {
            margin-top: 8px;
          }
          .check {
            .yt-div-edit {
              overflow: hidden;
              width: calc(100% - 2px) !important;
              margin-left: 0 !important;
              padding-right: 14px !important;
              line-height: 20px;
              -webkit-line-clamp: 3; /* 显示的行数 */
              text-overflow: ellipsis;
              font-weight: 400 !important;
              color: var(--theme-text);
              -webkit-box-orient: vertical;
              white-space: pre-wrap;
            }
            &:has(.yt-div-edit-focus) .yt-div-edit {
              flex: 1;
              width: calc(100% - 2px) !important;
            }
          }
          .yt-input:hover .yt-div-edit {
            flex: 1;
            width: calc(100% - 14px) !important;
            margin-left: 12px !important;
          }
        }
      }
      .subtitleItemContainer {
        display: flex;
        align-items: center;
        .icon-erjibiaoshi {
          margin-left: 12px;
          font-size: 8px;
          color: var(--theme-primary);
        }
        .icon-a-tuozhuai1 {
          cursor: move !important;
          font-size: 14px;
          color: var(--theme-text-3);
        }
      }
    }
    .content-header {
      display: flex;
      align-items: center;
      span {
        font-size: 16px;
        color: #878686;
      }
      .flex1 {
        flex: 1;
        margin-left: 10px;
        font-weight: 700;
        font-size: 18px;
        color: var(--theme-primary);
      }
      img {
        width: 24px;
        height: 24px;
      }
    }
    :deep(.preview-content) {
      display: flex;
      flex-direction: column;
    }
    .regenerate {
      margin-top: 12px;
      cursor: pointer;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-primary);
      white-space: nowrap;
    }
    .printer {
      :deep(.searchPurpose) {
        margin-bottom: 8px;
      }
    }
  }
  .flexSp {
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: center;
    height: 74px;
    .generate {
      position: absolute;
      left: 50%;
      bottom: 4px;
      margin-bottom: 0 !important;
      cursor: pointer;
      transform: translate(-50%, 0%);
    }
  }
}
:deep(.ellipsis) {
  overflow: hidden;           /* 隐藏超出部分 */
  text-overflow: ellipsis;    /* 显示省略号 */
  white-space: nowrap;        /* 不换行 */
}
:deep(.yt-div-edit) {
  min-height: 36px;
}
</style>
<style lang="scss">
.add-tips-box {
  .el-message-box__content {
    display: flex;
    align-items: center;
    margin-top: 12px;
    font-size: 18px;
    .el-message-box__container::before {
      margin-right: 4px;
      color: var(--el-color-danger);
      content: "*";
    }
    .el-message-box__input {
      flex: 1;
      padding-top: 0;
      .el-message-box__errormsg {
        position: absolute;
      }
      .el-input__wrapper {
        height: 42px;
        font-size: 18px;
      }
    }
  }
}
.el-message-box {
  .el-message-box__title {
    font-size: 20px;
  }
  .el-message-box__message p,
  button span {
    font-size: 18px !important;
  }
}
.btnPop {
  padding: 6px 12px;
  cursor: pointer;
  .iconfont {
    margin-right: 7px;
    color: var(--theme-text-2);
  }
  span {
    font-weight: 400;
    font-size: 16px;
  }
}
.custom_year_range {
  .floatPanel {
    width: auto;
  }
  &::before,
  &::after,
  .fastContaienr {
    display: none !important;
  }
}
.custom_year_range .floatPanel .panelContent > div a,
.custom_year_range .floatPanel .panelHead {
  font-size: 18px;
}
.el-popper span {
  line-height: 1.5em;
}
</style>
