
<template>
  <div class="container-message">
    <!-- <div class="title">{{title}}</div> -->
    <!-- <el-scrollbar> -->
    <div class="session-div">
      <template v-if="message.length">
        <div class="box-item" v-for="(item, index) in message" :key="`message_${index}`">
          <div :class="['message-item', item.role === 'assistant' ? 'message-item--assistant' : 'message-item--user']" v-if="item.role === 'assistant' || item.content">
            <el-avatar class="message-item__avatar assitantImg" v-if="item.role === 'assistant'">
              <img :src="menuFoldLogo"/>
            </el-avatar>
            <div v-else></div>
            <div :class="['message-item__content', item.role === 'assistant' ? 'message-item__content--left' : 'message-item__content--right']">
              <!-- 深度思考内容 -->
              <div class="message-item__thinking" v-if="item.thinkingEnabled && item.role !== 'user'">
                <div class="message-item__thinking-header" @click="collapseThinking(item)">
                  <div class="message-item__thinking-header-box" v-if="!item.content">
                    <el-icon v-if="item.collapse"><ArrowUpBold /></el-icon>
                    <el-icon v-else><ArrowDownBold /></el-icon>
                    <div>思考中...</div>
                  </div>
                  <div class="message-item__thinking-header-box" v-if="item.content">
                    <el-icon v-if="item.collapse"><ArrowUpBold /></el-icon>
                    <el-icon v-else><ArrowDownBold /></el-icon>
                    <div>已深度思考（用时{{item.thinkingTime}}秒）</div>
                  </div>
                </div>
                <div class="thinking-content" :class="{ 'empty_reasoning_content': !item.reasoning_content }">
                  <div class="line"></div>
                  <Markdown v-loading :source="item.reasoning_content" v-if="item.collapse"/>
                </div>
                <div class="thinking-loader" v-if="!item.content"></div>
              </div>
              <!-- 无深度思考时的loading -->
              <div class="message-item__loader" v-if="!item.thinkingEnabled && item.role !== 'user' && !item.content">
                <div class="thinking-loader" v-if="!item.content"></div>
              </div>
              <div class="message-item__text" v-if="item.content && item.role === 'assistant'">
                <Markdown v-loading :source="item.content" :plugins="plugins"/>
              </div>
              <div class="message-item__text" v-if="item.content && item.role !== 'assistant'">
                <div>{{item.content}}</div>
                <!-- <Markdown v-loading :source="item.content" :plugins="plugins"/> -->
              </div>
            </div>
            <el-avatar class="message-item__avatar" v-if="item.role !== 'assistant'">
              <img :src="userDefaultImg" />
            </el-avatar>
            <div v-else></div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="welcome">
          <div class="line line1">
            <img :src="menuFoldLogo"/>
            我是<span>智脉大模型AI</span>助理，很高兴见到你！
          </div>
          <div class="line line2">我可以为您提供数据分析、辅助决策、资料查询等内容，有任何问题请您找我吧~</div>
        </div>
      </template>
    </div>
    <!-- </el-scrollbar> -->
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

defineProps({
  message: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['judgeScrollbar'])
const userStore = useUserStore()
const menuFoldLogo = ref(userStore.platInfo.menuFoldLogo || projectLogo)

// 确保组件卸载时移除监听
onMounted(() => {
})

onUnmounted(() => {
})

// const codeBlockWithLang = (md) => {
//   // 保存默认的 fence 渲染函数
//   const defaultFence = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
//     return self.renderToken(tokens, idx, options)
//   }

//   // 重写 fence 渲染函数
//   md.renderer.rules.fence = function(tokens, idx, options, env, self) {
//     const token = tokens[idx]
//     const info = token.info ? token.info.trim() : ''
//     // 取第一个单词作为语言名称
//     const langName = info.split(/\s+/g)[0] || ''
//     // 获取原始代码块 HTML（高亮处理）
//     const codeHtml = defaultFence(tokens, idx, options, env, self)

//     // 输出包装 HTML：包含一个显示语言的标签和复制按钮
//     return `<div class="code-block-wrapper">
//         <div class="code-header">
//            <div class="code-lang">${langName}</div>
//            <div class="copy-button" onclick="copyCode(this)">复制</div>
//         </div>
//         ${codeHtml}
//       </div>`
//   }
// }
const codeBlockWithLang = (md) => {
  // 重写 fence 渲染函数
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const langName = info.split(/\s+/g)[0] || ''
    // 自动检测并高亮
    const highlightedCode = hljs.highlightAuto(token.content).value

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
window.copyCode = copyCode

const plugins = [
  { plugin: codeBlockWithLang }
]

// 折叠思考内容
const collapseThinking = async (item) => {
  item.collapse = !item.collapse
  // 折叠后，调用父方法，重新计算滚动条的滚动高度,进而控制回到底部按钮是否展示
  await nextTick()
  emits('judgeScrollbar')
}
defineExpose({
})
</script>

<style scoped lang="scss">
.container-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  // overflow: auto;
  width: 100%;
  height: 100%;
  // :deep(.el-scrollbar) {
  //   display: flex;
  //   justify-content: center;
  //   flex: 1;
  //   width: 100%;
  //   height: 0;
  //   // margin-bottom: 24px;
  //   .el-scrollbar__view {
  //     width: 1005px;
  //   }
  // }
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
  // column-gap: 16px;

  &--user {
    // grid-template-columns: 0% auto 40px;
    display: flex;
    justify-content: end;
    margin-left: 62px;
    .message-item__content {
      margin-right: 16px;
      .message-item__text {
        padding: 12px 16px;
        line-height: 28px;
        white-space: pre-wrap;
      }
    }
  }

  &--assistant {
    display: flex;
    justify-content: start;
    margin-right: 62px;
    // grid-template-columns: 40px auto 1%;
    .message-item__content {
      flex: 1;
      width: 0;
      margin-left: 16px;
      .message-item__text {
        line-height: 28px;
      }
      // .message-item__text {
      //   :deep(p) {
      //     margin: 0.5rem 0;
      //   }
      // }
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
    &--right {
      background-color: var(--theme-primary);
      .message-item__text {
        color: #fff;
      }
    }
  }

  &__text {
    position: relative;
    box-sizing: border-box;
    padding: 16px;
    line-height: 20px;
    color: var(--theme-text);

    // :deep(p) {
    //   margin: 0.5rem 0;
    // }

    :deep(pre) {
      overflow-x: auto;
      max-width: 100%;
      margin: 0.5rem 0;
      // font-size: 0.8125rem;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    :deep(code) {
      overflow-x: auto;
      max-width: 100%;
      // font-size: 0.8125rem;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
  }
  &__thinking {
    position: relative;
    box-sizing: border-box;
    padding-right: 15px;
    // line-height: 1.4;
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
    // padding: 7px 14px;
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
    // border-left: 1px solid #d8d8d8;
    box-sizing: border-box;
    margin-left: 17px;
    // margin-bottom: -16px;
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

  @keyframes l3 { to { transform: rotate(1turn); } }
}
// :deep(.btn-copy) {
//   span {
//     font-size: 14px!important;
//   }
// }
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
}

</style>
