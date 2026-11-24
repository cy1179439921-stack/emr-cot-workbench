<template>
  <div class="aiLterContainer">
    <div class="header-box">
      <img :src="logo" alt="" class="logo">
      <div class="main">
        <div class="search">
          <el-input :disabled="disabled" ref="userQueryRef" v-model="searchText" maxlength="500" :show-word-limit="!activeted" type="textarea" :placeholder="placeholder" @keydown.enter="handleEnterKey($event)" @change="emits('search', searchText)" @input="emits('search', searchText)"/>
          <div class="btns" v-if="showAnalysis">
            <el-tooltip effect="dark" content="意图分析：会根据PICOS原则拆解和明确您的主题，并分析您需要补充的主题的关键信息，以便生成更精准的综述内容。" placement="bottom">
              <div class="intention" :class="{'active':activeted,'disabled':disabled}" @click="activeHandler">
                <i class="iconfont icon-yitufenxi"></i>
                <span>意图分析</span>
              </div>
            </el-tooltip>
            <div class="send" v-if="activeted" @click="send" :class="{disabled:!searchText || disabled}">
              <i class="iconfont icon-fasonganniu" v-if="!isLoading"></i>
              <div class="spinner" v-else>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
                <div class="spinner-blade"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="searchAnalysis" v-if="isLoading || mdList.length">
          <div class="header">
            <div class="headerTitle">
              <div class="iconContainer">
                <i class="iconfont icon-PICOSyuanze"></i>
              </div>
              <!-- <img :src="text" alt=""> -->
              <span class="tipTitle">PICOS原则<span class="parimy">拆解和明确您的主题</span></span>
              <span class="tip">注意! 根据分析在输入框内补充需要的关键信息，便于生成更精准的综述内容。</span>
            </div>
            <div class="expand" @click="isShowExpand = !isShowExpand">
              <i class="iconfont" :class="{'icon-zhankai1':isShowExpand,'icon-shouqi1': !isShowExpand}"></i>
            </div>
          </div>
          <div class="content" v-if="!isShowExpand">
            <div class="contentProess" v-if="num !== 0 && mdList.length && !mdList[mdList.length - 1]">
              <div class="contentHeader">
                <i class="iconfont icon-jiansuo"></i>
                <span class="text">全力为您分析中</span>
                <el-progress :percentage="num" :show-text="false"/>
              </div>
              <el-skeleton :rows="5" animated />
            </div>
            <div class="mdContent" v-else>
              <el-scrollbar ref="scrollbarRef" @scroll="handleScroll" class="scrollbarRef">
                <template v-for="(value, index) in mdList" :key="'secition' + index">
                  <CommonMarkdown ref="CommonMarkdownRef" :source="value" :showToolbar="false"/>
                </template>
              </el-scrollbar>
            </div>
          </div>
        </div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CommonMarkdown from '@/components/AI/commonMarkdown.vue'
// import text from '@/assets/text.png'
import { getToken } from '@/utils/crypto'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { throttle } from 'lodash'
import { ElMessage } from 'element-plus'

const searchText = ref('')
const emits = defineEmits(['search', 'handleRequest', 'setSearchContent'])
const props = defineProps({
  logo: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  showAnalysis: { // 是否显示意图分析
    type: Boolean,
    default: false
  },
  disabled: { // 是否禁用输入框
    type: Boolean,
    default: false
  }
})
const activeted = ref(false) // 是否点击意图分析
const isLoading = ref(false) // 是否正在发送请求
const isShowExpand = ref(false) // 是否展开搜索分析
const num = ref(0) // 进度条
const mdList = ref([]) // 搜索分析结果
const scrollbarRef = ref(null) // 滚动条
const isAutoScroll = ref(true) // 是否自动滚动
const STOP_DISTANCE = 60 // 向上滚动超过 60px 就停止自动滚动
const camelcascList = ref([]) // 意图多轮列表标题

const setSearchText = (value) => {
  searchText.value = value
  emits('search', searchText.value)
}
const userQueryRef = ref(null)
onMounted(() => {
  initAIInput()
})
const initAIInput = () => {
  userQueryRef.value.focus()
}
const handleRequest = async () => {
  if (!searchText.value?.trim()) return
  emits('handleRequest', searchText.value)
}
const handleEnterKey = (e) => {
  if ((e.ctrlKey || e.shiftKey) && e.keyCode === 13) { // 用户点击了ctrl+enter或cmd+enter触发
  } else { // 用户点击了enter触发
    e.preventDefault() // 阻止默认换行行为
    handleRequest()
  }
}
const activeHandler = () => {
  if (props.disabled) return
  activeted.value = !activeted.value
}

let _searchTimer = null
const send = () => {
  if (!searchText.value || isLoading.value || props.disabled) return
  num.value = 0
  mdList.value.push('')
  isLoading.value = true
  const params = {
    content: camelcascList.value.length ? camelcascList.value.join(',') + ',' + searchText.value : searchText.value
  }
  startSSE(params)
  if (_searchTimer) clearInterval(_searchTimer)
  _searchTimer = setInterval(() => {
    num.value += 1
    if (num.value >= 95) {
      clearInterval(_searchTimer)
      _searchTimer = null
    }
  }, 20)
}

let controller = null
// 发送流接口
const startSSE = async (params) => {
  try {
    controller = new AbortController()
    // eslint-disable-next-line no-undef
    await fetchEventSource(`${window.location.protocol}//${window.location.host}/api/agent/literatureReview/generateMultiRoundChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(params),
      timeout: 4 * 60 * 1000, // 超时时间为4分钟
      signal: controller.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok) {
          console.log('sse open')
          isAutoScroll.value = true
          return
        }
        ElMessage.error('连接失败，请检查网络连接')
        mdList.value.pop()
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
        console.log('sse error', error)
        handleError(error)
      },
      onclose() {
        console.log('sse close')
        handleClose()
      }
    })
  } catch (error) {
    handleClose()
  }
}

const handleError = (error) => {
  if (_searchTimer) clearInterval(_searchTimer)
  num.value = 0
  throw error
}

// 处理流消息
const handleMessage = (delta) => {
  const { content, chatContentType } = delta
  if (chatContentType === 3) {
    handleClose()
    camelcascList.value.push(searchText.value)
    console.log('camelcascList', camelcascList.value)
    emits('setSearchContent', camelcascList.value.join(','))
  }
  if (content && Number(chatContentType) === 1) {
    num.value = 0
    mdList.value[mdList.value.length - 1] += content
  }
  scrollBottom()
}

// 自动滚动到底部（节流）
const scrollBottom = throttle(() => {
  const container = scrollbarRef.value?.wrapRef
  if (container && isAutoScroll.value) {
    container.scrollTop = container.scrollHeight - container.clientHeight
  }
}, 1000)

// 流接口完成
const handleClose = () => {
  isLoading.value = false
}

// 监听用户滚动
const handleScroll = throttle(() => {
  const container = scrollbarRef.value?.wrapRef
  if (!container) return

  const distanceToBottom = container.scrollHeight - container.clientHeight - container.scrollTop

  if (distanceToBottom > STOP_DISTANCE) {
    isAutoScroll.value = false
  } else {
    isAutoScroll.value = true
  }
}, 50) // 每100ms计算一次即可

defineExpose({
  setSearchText
})
</script>
<style lang="scss" scoped>
.aiLterContainer {
  overflow: hidden;
  width: 100%;

  .header-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo {
    width: auto;
    height: 84px;
    margin-top: 90px;
    margin-bottom: 60px;
  }
  .main {
    width: 880px;
    :deep(.search) {
      position: relative;
      box-sizing: border-box;
      height: 111px;
      padding: 16px 2px 10px 16px;
      border: 1px solid transparent;
      // border: 1px solid #dbdcdf;
      border-radius: 16px;
      background-image: linear-gradient(to right, #fff, #fff), linear-gradient(160deg, rgba(54, 112, 248, 1), rgba(54, 222, 248, 0.73), rgba(138, 54, 248, 0.4), rgba(54, 112, 248, 1));
      background-origin: padding-box, border-box;
      background-clip: padding-box, border-box;
      // border-image-source: linear-gradient(to right, #8f41e9, #578aef);
      // border-image-slice: 1;
      // border-image: url('@/assets/searchBorder.png') 40% stretch stretch;
      // background: linear-gradient(90deg, rgba(85, 153, 255, .5) 0, rgba(148, 122, 227, .5) 60%, rgba(221, 112, 175, .5) 81%, rgba(255, 192, 72, .5));
      // background: url('@/assets/searchBorder.png') no-repeat;
      // background-size: 100% 100%;
      &:has(.is-disabled) {
        background-image: linear-gradient(to right, var(--el-disabled-bg-color), var(--el-disabled-bg-color)), linear-gradient(160deg, rgba(54, 112, 248, 1), rgba(54, 222, 248, 0.73), rgba(138, 54, 248, 0.4), rgba(54, 112, 248, 1));
      }
      .el-textarea {
        height: 100%;
        .el-input__count {
          bottom: 0;
          font-size: 16px;
        }
        .el-textarea__inner {
          height: 100%;
          padding: 0;
          box-shadow: none;
          resize: none;
          font-size: 18px;

          @include scrollBarStyle;
        }
      }
      .btns {
        display: flex;
        position: absolute;
        left: 0;
        bottom: 16px;
        z-index: 0;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .intention {
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          width: 124px;
          height: 32px;
          margin-left: 16px;
          border: 1px solid #dbdcdf;
          border-radius: 32px;
          background: var(--theme-card);
          cursor: pointer;
          user-select: none;
          span {
            margin-left: 8px;
            font-weight: 400;
            font-size: 16px;
            color: var(--theme-text);
          }
          &:hover {
            background: var(--theme-bg)#f0f3f8;
          }
          &.active {
            border: 1px solid #c9d9ff;
            background: #e4e7fd;
            span,
            i {
              color: var(--theme-primary);
            }
            &:hover {
              border: 1px solid #a6c0fd;
              background: #d9deff;
            }
          }
          &.disabled {
            background: var(--el-disabled-bg-color) !important;
            cursor: not-allowed !important;
          }
        }
        .send {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 29px;
          height: 29px;
          margin-right: 16px;
          border-radius: 50%;
          background-color: var(--theme-primary);
          cursor: pointer;
          i {
            font-size: 14px;
            color: #fff;
          }
          &.disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        }
      }
    }
    .searchAnalysis {
      position: relative;
      width: 880px;
      min-height: 56px;
      margin-top: 16px;
      padding: 1px 1px 0 1px;
      border-radius: 8px;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      .header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 56px;
        background: url('@/assets/aibanner2.png') no-repeat;
        background-size: 100% 100%;
        user-select: none;
        .headerTitle {
          display: flex;
          align-items: center;
          height: 24px;
          margin-top: 16px;
          .iconContainer {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 22px;
            height: 22px;
            margin-left: 24px;
            margin-right: 12px;
            border-radius: 1px 1px 1px 1px;
            background: #f59f0c;
            i {
              font-size: 12px;
              color: #fff;
            }
          }
          // img {
          //   width: 238px;
          // }
          .tipTitle {
            font-weight: 700;
            font-size: 18px;
            color: var(--theme-text);
            span {
              color: #3570f8;
            }
          }
          .tip {
            position: relative;
            margin-left: 20px;
            font-weight: 400;
            font-size: 14px;
            color: #f59f0c;
            &::after {
              position: absolute;
              left: -10px;
              top: 4px;
              width: 1px;
              height: 12px;
              background-color: var(--theme-primary);
              content: '';
            }
          }
        }
        .expand {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 22px;
          height: 22px;
          margin-right: 16px;
          margin-top: 16px;
          border: 1px solid rgba(54, 112, 248, 0.2);
          border-radius: 50%;
          background: rgba(54, 112, 248, 0.1);
          cursor: pointer;
          i {
            font-weight: 700;
            font-size: 6px;
            color: var(--theme-primary);
          }
        }
      }
      .content {
        position: relative;
        height: auto;
        min-height: 192px;
        border-radius: 16px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        background: var(--theme-card) url('@/assets/mengban1.png') no-repeat;
        background-position: 1px 1px;
        background-size: calc(100% - 2px);
        .contentProess {
          box-sizing: border-box;
          width: 100%;
          padding: 24px;
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
        .mdContent {
          display: flex;
          overflow: hidden;
          flex-direction: column;
          box-sizing: border-box;
          width: 100%;
          height: auto;
          // max-height: v-bind('pxToRem(maxHeight)');
          max-height: 240px;
          padding-bottom: 16px;
          .scrollbarRef {
            display: flex;
            flex-direction: column;
            flex: 1;
            height: auto;
            // max-height: v-bind('pxToRem(maxHeight)');
            max-height: 240px;
            :deep(.el-scrollbar__view) {
              box-sizing: border-box;
              padding: 0 20px;
            }
            :deep(.common-markdown-wrapper) {
              border-bottom: 1px solid #e8e8e8;
              &:last-child {
                border-bottom: none;
                ul:last-child {
                  margin-bottom: 0;
                }
                p:first-child {
                  line-height: 20px;
                  strong {
                    position: relative;
                    margin-left: 66px;
                    &::after {
                      position: absolute;
                      left: -66px;
                      top: -4px;
                      box-sizing: border-box;
                      width: 52px;
                      height: 26px;
                      border: 1px solid #ffa100;
                      border-radius: 20px;
                      line-height: 26px;
                      text-align: center;
                      font-weight: 500;
                      font-size: 16px;
                      color: #ffa100;
                      white-space: nowrap;
                      content: '最新';
                    }
                  }
                }
              }
              .common-markdown {
                padding: 14px 0 10px 0;
              }
              &:first-child {
                strong {
                  margin-left: 0 !important;
                  &::after {
                    display: none !important;
                  }
                }
                // .common-markdown {
                //   padding-top: 24px;
                // }
              }
            }
          }
        }
      }
    }
  }
}
.spinner {
  display: inline-block;
  position: relative;
  width: 1em;
  height: 1em;
  font-size: 16px;

  .spinner-blade {
    position: absolute;
    left: 0.4629em;
    bottom: 0;
    width: 0.074em;
    height: 0.2777em;
    border-radius: 0.0555em;
    background-color: transparent;
    transform-origin: center -0.2222em;
    animation: spinner-fade 1s infinite linear;

    @for $i from 1 through 12 {
      &:nth-child(#{$i}) {
        transform: rotate(($i - 1) * 30deg);
        animation-delay: calc((#{$i - 1}) * 0.083s);
      }
    }
  }
}

@keyframes spinner-fade {
  0% {
    background-color: var(--theme-card);
  }

  100% {
    background-color: transparent;
  }
}

</style>
