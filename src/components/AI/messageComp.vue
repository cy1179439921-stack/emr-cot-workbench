
<template>
  <div class="container-message">
    <div class="session-div">
      <template v-if="message.length">
        <div class="box-item" v-for="(item, index) in message" :key="`message_${index}`">
          <div :class="['message-item', item.source === 2 ? 'message-item--assistant' : 'message-item--user']" v-if="item.source === 2 || item.chatContent">
            <el-avatar class="message-item__avatar assitantImg" v-if="item.source === 2">
              <img :src="menuFoldLogo"/>
            </el-avatar>
            <div v-else></div>
            <div :class="['message-item__content', item.source === 2 ? 'message-item__content--left' : 'message-item__content--right']">
              <!-- 深度思考内容 -->
              <div class="message-item__thinking" v-if="item.deepThink && item.source !== 1">
                <div class="message-item__thinking-header" @click="collapseThinking(item)">
                  <div class="message-item__thinking-header-box">
                    <el-icon v-if="item.collapse"><ArrowUpBold /></el-icon>
                    <el-icon v-else><ArrowDownBold /></el-icon>
                    <div>
                      <span v-if="item.thinkStatus === 1">已深度思考（用时{{item.thinkingTime}}秒）</span>
                      <span v-if="item.thinkStatus === 2">思考中...</span>
                      <span v-if="item.thinkStatus === 3">思考已停止</span>
                    </div>
                  </div>
                </div>
                <div class="thinking-content" :class="{ 'empty_reasoning_content': !item.thinkingProcess }">
                  <div class="line"></div>
                  <Markdown v-loading :source="item.thinkingProcess" v-if="item.collapse"/>
                </div>
                <div class="thinking-loader" v-if="item.loading && !item.chatContent"></div>
              </div>
              <!-- 无深度思考时的loading -->
              <div class="message-item__loader" v-if="!item.deepThink && item.source !== 1 && !item.chatContent">
                <div class="thinking-loader" v-if="item.loading"></div>
              </div>
              <div class="message-item__text" v-if="item.chatContent && item.source === 2">
                <template v-if="item.chatContent !== 'null'">
                  <Markdown v-loading :source="item.chatContent" :plugins="plugins"/>
                  <!-- <Markdown v-loading :source="customContent" :plugins="plugins"/> -->
                </template>
                <div class="thinking-loader agent-loader" v-if="sessionType === 'dataAnalysis' && item.loading"></div>
              </div>
              <div class="message-item__text assistant-attachment" v-if="item.attachment && item.source === 2">
                <AIAttachment :fileInfo="item.attachment"/>
                <div class="download" @click="downloadAttachment(item.attachment)">
                  <i class="iconfont icon-daochu2"></i>
                </div>
              </div>
              <div class="message-item__text" v-if="item.chatContent && item.source !== 2">
                <AIAttachment :fileInfo="item.attachment" v-if="item.attachment"/>
                <div class="message-item__text-content">{{item.chatContent}}</div>
              </div>
            </div>
            <el-avatar class="message-item__avatar" v-if="item.source !== 2">
              <img :src="userDefaultImg" />
            </el-avatar>
            <div v-else></div>
          </div>
        </div>
      </template>
      <template v-if="from !== 'patient' && message.length === 0">
        <div class="welcome">
          <div class="line line1">
            <img :src="menuFoldLogo"/>
            我是<span>智脉大模型AI</span>助理，很高兴见到你！
          </div>
          <div class="line line2">我可以为您提供数据分析、辅助决策、资料查询等内容，有任何问题请您找我吧~</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ArrowDownBold, ArrowUpBold } from '@element-plus/icons-vue'
import Markdown from 'vue3-markdown-it'
import { useUserStore } from '@/store/user'
import projectLogo from '@/assets/ebondlogo.png'
import 'highlight.js/styles/github.css'
import userDefaultImg from '@/assets/defaultHeadImg.png'
import hljs from 'highlight.js'
import AIAttachment from '@/components/AI/AIAttachment.vue'

defineProps({
  message: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  from: {
    type: String,
    default: ''
  },
  sessionType: {
    type: String,
    default: () => 'normal'
  }
})
const emits = defineEmits(['judgeScrollbar', 'handleClickCollapse'])
const userStore = useUserStore()
const menuFoldLogo = ref(userStore.platInfo.menuFoldLogo || projectLogo)
// const customContent = `
// \n\n**<font color=#3670F8>1、读取文件基本信息：</font>**\n\n数据大小为0.10MB，维度194行*41列。\n\n**<font color=#3670F8>2、正态检验</font>**\n\n\n\n:::collapse id=1125672226562117632:::\n\n根据正态性检验结果，age样本量193，采用Kolmogorov–Smirnov检验，P值为0.953（0.0），未呈现显著性，结合偏度绝对值0.243（<3）、峰度绝对值1.083（<10），以及直方图、PP图、QQ图的观测结果，可判定该数据基本符合正态分布（PS：现实研究中允许一定偏离）。
// `
onMounted(async () => {
})

onUnmounted(() => {
})

const codeBlockWithLang = (md) => {
  // console.log('md', md)
  // 重写 fence 渲染函数
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const langName = info.split(/\s+/g)[0] || ''
    // 自动检测并高亮
    const highlightedCode = hljs.highlightAuto(token.content || '').value

    // 生成最终的 HTML 代码块
    return `<div class="code-block-wrapper">
        <div class="code-header">
           <div class="code-lang">${langName}</div>
           <div class="copy-button" onclick="copyCode(this)">复制</div>
        </div>
        <pre><code class="hljs ${langName}">${highlightedCode}</code></pre>
      </div>`
  }
}
const copyCode = (button) => {
  const codeBlock = button.parentElement.nextElementSibling
  const tempTextarea = document.createElement('textarea')
  tempTextarea.value = codeBlock.innerText
  document.body.appendChild(tempTextarea)
  tempTextarea.select()
  document.execCommand('copy')
  document.body.removeChild(tempTextarea)
  button.innerText = '已复制'
  setTimeout(() => { button.innerText = '复制' }, 1000)
}
const collapseBtn = (button) => {
  // 把所有的类名为md-collapse-toggle的button都改成收起状态
  document.querySelectorAll('.md-collapse-toggle').forEach((item) => {
    // 排除当前button
    if (item === button) return
    item.classList.remove('md-collapse-toggle-active')
    item.innerHTML = '展开查看 <i class="iconfont icon-arrowDown"></i>'
  })
  const isClosed = button.innerHTML.includes('展开查看')
  if (isClosed) {
    button.innerHTML = '隐藏内容 <i class="iconfont icon-arrowUp"></i>'
    // 给button加个class，方便控制样式
    button.classList.add('md-collapse-toggle-active')
    // 获取button上的“data-id”属性的值
    const id = button.dataset.id
    emits('handleClickCollapse', id)
  } else {
    // 移除md-collapse-toggle-active类
    button.classList.remove('md-collapse-toggle-active')
    button.innerHTML = '展开查看 <i class="iconfont icon-arrowDown"></i>'
    emits('handleClickCollapse', null)
  }
}
window.copyCode = copyCode
window.collapseBtn = collapseBtn
const collapsePlugin = (md) => {
  // 解析 :::collapse id=xxx 或 :::collapse:xxx:::
  md.block.ruler.before('fence', 'custom_collapse', (state, startLine, endLine, silent) => {
    const start = state.getLines(startLine, startLine + 1, 0, false).trim()
    if (!start.startsWith(':::collapse')) return false

    // 提取 id
    let id = ''
    if (start.includes('id=')) {
      id = start.split('id=')[1].trim()
      // 去除末尾的 :::
      if (id.endsWith(':::')) {
        id = id.slice(0, -3)
      }
    } else if (start.includes(':')) {
      id = start.split(':')[1].replace(/:/g, '').trim()
    }

    const token = state.push('custom_collapse', '', 0)
    token.meta = { id }

    state.line = startLine + 1
    return true
  })

  // 自定义折叠块渲染
  md.renderer.rules.custom_collapse = (tokens, idx) => {
    const { id } = tokens[idx].meta

    // 公共 HTML 前缀
    const prefix = `<div class="md-collapse">
    <div class="md-collapse-result">
      <span class="md-collapse-custom-text">输出结果：</span>`

    // 根据 id 是否存在，决定后缀内容
    const suffix = id
      ? `<span class="md-collapse-toggle" data-id="${id}" onClick="collapseBtn(this)">展开查看 <i class="iconfont icon-arrowDown"></i></span>`
      : `<span class="md-collapse-error">分析失败</span>`

    // 拼接完整 HTML
    return `${prefix}${suffix}
    </div>
  </div>`
  }
}
// 渲染 HTML
const enableHtmlPlugin = (md) => {
  md.set({
    html: true, // 开启内联 HTML
    breaks: false, // 需要“两个空格+回车”才换行；如果想单回车换行改成 true
    linkify: true,
    typographer: true
  }).disable('emoji')
}
// eslint-disable-next-line no-unused-vars
const plugins = [
  { plugin: enableHtmlPlugin },
  { plugin: codeBlockWithLang },
  { plugin: collapsePlugin }
]

// 折叠思考内容
const collapseThinking = async (item) => {
  item.collapse = !item.collapse
  // 折叠后，调用父方法，重新计算滚动条的滚动高度,进而控制回到底部按钮是否展示
  await nextTick()
  emits('judgeScrollbar')
}
// 下载附件
const downloadAttachment = (fileInfo) => {
  let pdfUrl = ''
  if (process.env.NODE_ENV === 'development') {
    pdfUrl = `http://192.168.43.162:9000${fileInfo.fileUrl.replace('/minio', '')}`
  } else {
    pdfUrl = `${window.location.origin}/${fileInfo.fileUrl}`
  }
  const link = document.createElement('a')
  link.href = pdfUrl
  link.download = fileInfo.name
  link.target = '_blank' // 可选，如果希望在新窗口中下载文件，请取消注释此行
  link.click()
  link.remove()
}
defineExpose({
})
</script>

<style scoped lang="scss">
.container-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  .title {
    display: flex;
    justify-content: center;
    width: 1005px;
    margin-top: 32px;
    margin-bottom: 32px;
    font-weight: 700;
    font-size: 18px;
    color: var(--theme-text);
  }
  .session-div {
    flex: 1;
    width: 100%;
    height: 0;
  }
}

.welcome {
  display: flex;
  flex-direction: column;
  margin-bottom: 37px;
  .line {
    display: flex;
    justify-content: center;
    &.line1 {
      font-weight: 600;
      font-size: 26px;
      color: #3d3d3d;
      span {
        color: var(--theme-primary);
      }
      img {
        height: 29px;
        margin-right: 14px;
      }
    }
    &.line2 {
      margin-top: 8px;
      font-size: 16px;
      color: #847f7f;
    }
  }
}

.box-item {
  margin-bottom: 24px;
}

.message-item {
  display: grid;
  &--user {
    // grid-template-columns: 0% auto 40px;
    display: flex;
    justify-content: end;
    margin-left: 62px;
    .message-item__content {
      margin-right: 16px;
      .message-item__text {
        display: flex;
        flex-direction: column;
        align-items: end;
        padding: 0;
        .message-item__text-content {
          width: fit-content;
          padding: 16px;
          border-radius: 8px;
          background-color: var(--theme-primary);
          line-height: 28px;
          color: #fff;
          white-space: pre-wrap;
        }
      }
    }
  }

  &--assistant {
    display: flex;
    justify-content: start;
    margin-right: 62px;
    .assistant-attachment {
      display: flex;
      align-items: center;
      width: fit-content;
      margin-top: 10px;
      padding: 0;
      background: initial !important;
      line-height: 20px !important;
      .attachment-div {
        margin-bottom: 0;
      }
      .download {
        margin-left: 12px;
        cursor: pointer;
        color: var(--theme-primary);
      }
    }
    :deep(.md-collapse-result) {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 22px;
      .md-collapse-error {
        color: #ff4e4e;
      }
    }
    .message-item__content {
      flex: 1;
      width: 0;
      margin-left: 16px;
      .message-item__text {
        line-height: 28px;
        :deep(.md-collapse-toggle) {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          padding: 0 3px;
          border-radius: 2px;
          cursor: pointer;
          line-height: 21px;
          color: var(--theme-primary);
          i {
            margin-left: 2px;
            font-size: 5px;
          }
          &.md-collapse-toggle-active {
            background-color: var(--theme-primary);
            color: #fff;
          }
        }
        .task-list {
          .task-item-name {
            &.bold {
              font-weight: 600;
              color: var(--theme-text);
            }
          }
          .task-item-content {
            display: flex;
            align-items: center;
            .collapsing-text {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 80px;
              cursor: pointer;
              line-height: normal;
              color: var(--theme-primary);
              &.expanging {
                height: 21px;
                border-radius: 2px;
                background-color: var(--theme-primary);
                color: #fff;
              }
            }
          }
        }
      }
    }
  }

  &__avatar {
    flex-shrink: 0;
    width: 46px;
    height: 46px;
  }
  .assitantImg {
    border: 1px solid #99a5ee;
    background: var(--theme-card);
    img {
      width: auto;
      height: 24px;
      margin-left: 1px;
      margin-top: -2px;
    }
  }
  &__content {
    position: relative;
    border-radius: 8px;
    &--left {
      .message-item__text {
        // margin-top: 15px;
        border-radius: 8px;
        background: rgba(240, 243, 248, 0.5);
      }
    }
  }

  &__text {
    position: relative;
    box-sizing: border-box;
    padding: 16px;
    line-height: 20px;
    color: var(--theme-text);

    :deep(pre) {
      overflow-x: auto;
      max-width: 100%;
      margin: 0.5rem 0;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    :deep(code) {
      overflow-x: auto;
      max-width: 100%;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
  }
  &__thinking {
    position: relative;
    box-sizing: border-box;
    padding-right: 15px;
  }
  &__loader {
    display: flex;
    position: relative;
    align-items: center;
    box-sizing: border-box;
    height: 52px;
    padding-right: 15px;
    .thinking-loader {
      margin-left: 0 !important;
    }
  }
  &__thinking-header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: fit-content;
    height: 52px;
    margin-bottom: 12px;
    padding: 0 14px;
    border-radius: 10px;
    background: rgba(240, 243, 248, 0.5);
    cursor: pointer;
    color: var(--theme-text);
  }
  &__thinking-header-box {
    display: flex;
    align-items: center;
    .el-icon {
      margin-right: 4px;
      font-size: 12px;
      color: #3d3d3d;
    }
  }
  :deep(.thinking-content) {
    position: relative;
    box-sizing: border-box;
    margin-left: 17px;
    padding-left: 15px;
    line-height: 28px;
    color: var(--theme-text-2);
    white-space: pre-wrap;
    .line {
      position: absolute;
      left: 0;
      top: 6px;
      height: calc(100% - 40px);
      border-left: 1px solid #d8d8d8;
    }
    &.empty_reasoning_content {
      margin-bottom: 0;
    }
  }
  .thinking-loader {
    box-sizing: border-box;
    width: 24px;
    margin-left: 17px;
    margin-bottom: 12px;
    padding: 2px;
    border-radius: 50%;
    background-color: #909090;
    -webkit-mask: var(--_m);
    mask: var(--_m);
    -webkit-mask-composite: source-out;
    mask-composite: subtract;
    animation: l3 .6s infinite linear;
    aspect-ratio: 1;

    --_m:
      conic-gradient(#0000 10%, #000),
      linear-gradient(#000 0 0) content-box;
  }
  .agent-loader {
    margin-left: 4px;
    margin-top: 16px;
  }

  @keyframes l3 { to { transform: rotate(1turn); } }
}
:deep(.code-block-wrapper) {
  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background: #50505a;
    color: #fff;
    & + pre {
      margin-top: 0;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    .copy-button {
      cursor: pointer;
    }
  }
  .md-collapse {
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
  .md-collapse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: var(--theme-fill);
    cursor: pointer;
  }
  .md-collapse-title {
    font-weight: 500;
  }
  .md-collapse-content {
    padding: 8px 10px;
    background: var(--theme-card);
  }
}
</style>
<style>
ol {
  padding-inline-start: 24px !important;
}
</style>
