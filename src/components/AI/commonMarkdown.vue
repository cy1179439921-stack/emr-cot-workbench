<template>
  <div class="common-markdown-wrapper">
    <!-- 编辑工具栏 -->
    <div v-if="showToolbar" class="markdown-toolbar">
      <div class="toolbar-left">
        <button v-if="!isEditing" @click="startEdit" class="toolbar-btn edit-btn">
          <i class="iconfont icon-edit"></i>编辑
        </button>

        <template v-else>
          <button @click="saveContent" class="toolbar-btn save-btn" :disabled="loading">
            <i class="iconfont icon-save"></i>保存
          </button>

          <button @click="cancelEdit" class="toolbar-btn cancel-btn">
            <i class="iconfont icon-close"></i>取消
          </button>
        </template>
      </div>

      <div class="toolbar-right">
        <span v-if="isEditing" class="edit-status">编辑模式</span>
      </div>
    </div>

    <!-- Markdown 内容区域 -->
    <div class="common-markdown markdown-body" v-show="!isEditing">
      <Markdown
        ref="myMarkdown"
        v-loading="loading"
        :source="processedSource"
        :plugins="plugins"
      />
    </div>
    <!-- 编辑markdown内容 -->
    <!-- <div
      class="common-markdown markdown-body editing"
      v-show="isEditing"
      contenteditable="true"
      ref="editableElement"
    >
      <Markdown
        v-loading="loading"
        :source="editingSource"
        :plugins="plugins"
      />
    </div> -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import Markdown from 'vue3-markdown-it'
import hljs from 'highlight.js'
import 'github-markdown-css/github-markdown-light.css' // 浅色代码高亮
import 'highlight.js/styles/github.css' // 浅色代码高亮
import TurndownService from 'turndown'

const props = defineProps({
  source: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  autoSave: {
    type: Boolean,
    default: false
  },
  showToolbar: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'readOnly'
  }
})
const emits = defineEmits(['judgeScrollbar', 'handleClickCollapse', 'jump', 'update:source'])

// 编辑状态管理
const isEditing = ref(props.mode === 'edit')
const originalContent = ref('') // 用于取消编辑时恢复内容
const editingSource = ref('') // 编辑时的内容字段

// 开始编辑
const startEdit = () => {
  originalContent.value = props.source
  editingSource.value = processedSource.value // 将 processedSource 的值赋给编辑字段
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  emits('update:source', originalContent.value)
}
const myMarkdown = ref(null)
// 更新保存内容函数，增加状态管理
const saveContent = () => {
  const currentHTML = myMarkdown.value.$el.innerHTML
  const originalFormat = convertToOriginalFormat(currentHTML)

  // 将转换后的原始格式赋值给 editingSource，然后更新父组件
  editingSource.value = originalFormat
  emits('update:source', originalFormat)

  // 保存后退出编辑模式
  isEditing.value = false
  // }
}

// 预处理source，转换引用标签格式
const processedSource = computed(() => {
  if (!props.source) return ''

  let result = props.source

  // 调试：输出原始内容
  // console.log('原始 props.source:', props.source)

  // 匹配并转换引用标签：将 [URL: https://xxx/][1] 转换为 <span class="click-placeholder" onclick="jumpFun('1','https://xxx/')"1</span>
  result = result.replace(
    /\[URL[：:]\s*([^\]\]]+)\]\[(\d+)\]/g,
    (match, url, param3) => {
      // 返回转换后的HTML，使用序号作为第一个参数，URL作为第二个参数
      return `<span class="click-placeholder" onclick="jumpFun('${param3}','${url}')">${param3}</span>`
    }
  )

  // 调试：输出处理后内容
  // console.log('处理后 processedSource:', result)

  return result
})

// 创建 turndown 实例，配置保留特殊 span 标签
const turndownService = new TurndownService({
  headingStyle: 'atx', // 标题使用 # ## ### 格式
  hr: '---', // 水平分割线使用 ---
  bulletListMarker: '-', // 无序列表使用 - 作为标记
  codeBlockStyle: 'fenced', // 代码块使用围栏格式
  fence: '```', // 代码块使用三个反引号包围
  emDelimiter: '*', // 斜体使用 * 包围
  strongDelimiter: '**', // 粗体使用 ** 包围
  linkStyle: 'inlined', // 链接使用内联格式 [text](url)
  linkReferenceStyle: 'full', // 链接引用使用完整格式
  preformattedCode: true, // 保留预格式化代码
  blankConversionMode: 'literal' // 空白字符使用字面量转换
})

// 添加特殊规则：将 jumpSpan 转换回引用格式
turndownService.addRule('jumpSpan', {
  filter: (node) => {
    return node.nodeName === 'SPAN' &&
           node.hasAttribute('onclick') &&
           node.getAttribute('onclick').includes('jumpFun')
  },
  replacement: (content, node) => {
    const onclick = node.getAttribute('onclick')
    // 提取参数：jumpFun('序号','URL')
    const match = onclick.match(/jumpFun\('(\d+)','([^']+)'\)/)
    if (match) {
      const [,, param2] = match
      // 转换为新的格式：[URL: xxx][序号]
      return `[URL: ${param2}][${content}]`
    }
    return content
  }
})

// 添加换行符处理规则
turndownService.addRule('preserveBr', {
  filter: 'br',
  replacement: () => '\n'
})

// 添加段落换行处理规则
turndownService.addRule('paragraphConversion', {
  filter: 'p',
  replacement: (content) => content + '\n\n'
})

// 添加规则：禁止对数字后跟点的文本进行转义
turndownService.addRule('noEscapeNumberDot', {
  filter: (text) => {
    // 处理纯文本内容，避免对数字. 进行转义
    return typeof text === 'string' && /^\d+\.\s/.test(text)
  },
  replacement: (content) => {
    return content
  }
})

// 禁用默认的转义规则，覆盖默认行为
const originalEscape = turndownService.options.escape
turndownService.escape = function(text) {
  // 调用原始转义函数
  let escaped = originalEscape ? originalEscape.call(this, text) : text

  // 移除数字后面的反斜杠转义（如 \1. -> 1.）
  escaped = escaped.replace(/\\(\d+\.)/g, '$1')

  return escaped
}

// 添加表格处理规则
turndownService.addRule('markdownItTable', {
  filter: (node) => {
    return node.nodeName === 'TABLE'
  },
  replacement: (content, node) => {
    // 处理 markdown-it 生成的表格
    const rows = Array.from(node.querySelectorAll('tr'))
    if (rows.length === 0) return ''

    let markdown = '\n\n'

    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('td, th'))
      const cellContents = cells.map(cell => {
        let text = cell.textContent || cell.innerText || ''
        // 转义管道符
        text = text.replace(/\|/g, '\\|').trim()
        return text
      })

      // 添加表格行
      markdown += '| ' + cellContents.join(' | ') + ' |\n'

      // 在表头后添加分隔符
      if (rowIndex === 0) {
        const separator = Array.from(cells).map(() => '---').join(' | ')
        markdown += '| ' + separator + ' |\n'
      }
    })

    markdown += '\n'
    return markdown
  }
})

// 将渲染后的HTML转换回原始格式（用于保存）
const convertToOriginalFormat = (htmlContent) => {
  if (!htmlContent) return ''

  // 使用 turndown 将 HTML 转换为 Markdown，保留特殊 span 标签
  const result = turndownService.turndown(htmlContent)

  // console.log('转换后Markdown:', result)

  return result
}

// 代码块处理插件
const codeBlockWithLang = (md) => {
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

// 复制代码功能
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

// 折叠按钮处理 - 这个会在父组件中定义具体逻辑
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
// 折叠内容插件
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

// 链接在新标签页打开插件
const linkTargetBlankPlugin = (md) => {
  // 重写默认的链接渲染规则
  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    // 添加 target="_blank" 属性
    const token = tokens[idx]
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
    // 渲染 token
    return self.renderToken(tokens, idx, options)
  }
}

// 渲染 HTML
const enableHtmlPlugin = (md) => {
  md.set({
    html: true, // 开启内联 HTML
    breaks: true, // 单个换行符也会产生换行（类似GitHub的"软换行"）
    linkify: true,
    typographer: true
  }).disable('emoji')
}

// 插件配置
const plugins = [
  { plugin: enableHtmlPlugin },
  { plugin: codeBlockWithLang },
  { plugin: collapsePlugin },
  { plugin: linkTargetBlankPlugin }
]

// 确保 jumpFun 函数始终可用的辅助函数
const ensureJumpFunAvailable = () => {
  if (!window.jumpFun || typeof window.jumpFun !== 'function') {
    window.jumpFun = (param1, param2) => {
      // 直接触发父组件的 jump 事件
      emits('jump', param1, param2)
    }
  }
}

// 监听 processedSource 变化，确保 jumpFun 始终可用
watch(processedSource, () => {
  // 在下一个 DOM 更新周期中确保 jumpFun 可用
  setTimeout(() => {
    ensureJumpFunAvailable()
  }, 0)
})

// 全局函数挂载
onMounted(() => {
  window.copyCode = copyCode
  window.collapseBtn = collapseBtn
  // 添加 jumpFun 全局函数，用于处理引用标签点击
  ensureJumpFunAvailable()

  // 添加事件监听器用于处理 jump 事件
  const markdownElements = document.querySelectorAll('.common-markdown')
  markdownElements.forEach((element) => {
    element.addEventListener('jump', (event) => {
      const { param1, param2 } = event.detail
      emits('jump', param1, param2)
    })
  })
})

onUnmounted(() => {
  // 清理全局函数（可选）
  if (window.copyCode) delete window.copyCode
  if (window.collapseBtn) delete window.collapseBtn
  if (window.jumpFun) delete window.jumpFun

  // debounceTimer 已移除，无需清理
})

// 获取渲染后的HTML内容
const getRenderedHTML = () => {
  if (myMarkdown.value && myMarkdown.value.$el) {
    return myMarkdown.value.$el.innerHTML
  }
  return ''
}

// 暴露方法给父组件
defineExpose({
  saveContent,
  getRenderedHTML
})
</script>

<style scoped lang="scss">
// .common-markdown-wrapper {
//   border: 1px solid #e5e7eb;
//   border-radius: 8px;
//   background: var(--theme-card);
// }

.markdown-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: var(--theme-fill);

  .toolbar-left {
    display: flex;
    gap: 8px;
  }

  .toolbar-right {
    .edit-status {
      padding: 4px 8px;
      border-radius: 4px;
      background: var(--theme-primary);
      font-size: 12px;
      color: #fff;
    }
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    i {
      font-size: 14px;
    }

    &.edit-btn {
      background: var(--theme-primary);
      color: #fff;

      &:hover {
        background: #2a5ad8;
      }
    }

    &.save-btn {
      background: #10b981;
      color: #fff;

      &:hover:not(:disabled) {
        background: #059669;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &.cancel-btn {
      background: #ef4444;
      color: #fff;

      &:hover {
        background: #dc2626;
      }
    }
  }
}

.common-markdown {
  min-height: 30px;
  padding: 16px;

  &:focus-visible {
    outline: none;
  }

  &.editing {
    border: 2px solid var(--theme-primary);
    border-radius: 6px;
    background: var(--theme-fill);
    box-shadow: 0 0 0 3px rgba(54, 112, 248, 0.1);
  }
  &.markdown-body {
    background-color: initial;
    font-weight: normal;
    font-size: 14px;
    color: var(--theme-text);
  }
  :deep(*) {
    a {
      text-decoration: auto;
      color: var(--theme-text-2);
    }
    p {
      margin-top: 10px;
      margin-bottom: 10px;
      line-height: 30px;
      font-size: 18px;
    }
    ul li {
      line-height: 30px;
      font-size: 18px;
    }
    table {
      margin: 0 auto 10px;
      thead {
        tr {
          background-color: var(--theme-fill);
        }
      }
      // tr {
      //   background-color: inherit;
      // }
      // tbody {
      //   tr:nth-child(odd) {
      //     background-color: var(--theme-fill);
      //   }
      //   tr:nth-child(2n) {
      //     background-color: initial;
      //   }
      // }
    }
    ul,
    ol {
      padding-left: 0 !important;
      padding-inline-start: 0 !important;
    }
    ol,
    ol li {
      list-style: none;
      margin-left: 0;
      padding-left: 0;
      font-size: 18px;
    }
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 16px;
      margin-bottom: 16px;
      padding-bottom: 0;
      border-bottom: none;
      font-size: 18px;
    }
    h1 {
      font-size: 18px;
    }
    .code-block-wrapper {
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
          font-size: 18px;
        }
        .copy-button {
          cursor: pointer;
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    .md-collapse {
      margin: 8px 0;
      border: 1px solid #ddd;
      border-radius: 6px;
    }

    .md-collapse-result {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 22px;
      .md-collapse-error {
        color: #ff4e4e;
      }
    }

    .md-collapse-toggle {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding: 0 3px;
      border-radius: 2px;
      cursor: pointer;
      line-height: 21px;
      color: var(--theme-primary);
      transition: all 0.3s ease;

      i {
        margin-left: 2px;
        font-size: 5px;
      }

      &:hover {
        background-color: rgba(54, 112, 248, 0.1);
      }

      &.md-collapse-toggle-active {
        background-color: var(--theme-primary);
        color: #fff;
      }
    }

    .click-placeholder {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-width: 22px;
      height: 22px;
      margin-left: 5px;
      margin-right: 2px;
      border-radius: 10px;
      background-color: rgba(54, 112, 248, 0.1);
      cursor: pointer;
      color: var(--theme-primary);
      &:hover {
        background-color: rgba(54, 112, 248, 1);
        color: #fff;
      }
    }
  }
}
</style>
