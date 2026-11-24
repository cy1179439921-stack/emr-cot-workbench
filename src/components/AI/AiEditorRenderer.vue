<template>
  <div class="editor-container">
    <div ref="editorContainer" class="aieditor-wrapper"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { AiEditor } from 'aieditor'
import 'aieditor/dist/style.css'

defineOptions({
  name: 'AiEditorRenderer',
  inheritAttrs: false
})

// Props 定义
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请填写内容...'
  },
  toolbarKeys: {
    type: Array,
    default: () => [
      'undo', 'redo', 'brush', 'eraser',
      '|', 'heading',
      '|', 'bold', 'italic', 'underline', 'strike', 'link',
      '|', 'font-color',
      '|', 'align',
      '|', 'bullet-list', 'ordered-list', 'indent-decrease', 'indent-increase', 'break',
      '|', 'quote', 'table'
    ]
  },
  textSelectionBubbleMenu: {
    type: Object,
    default: () => ({
      enable: true,
      items: ['Bold', 'Italic', 'Underline', 'Strike', 'code']
    })
  }
})

// Events 定义
const emit = defineEmits([
  'ready',
  'error'
])

// 响应式状态
const editorContainer = ref(null)
const editorInstance = ref(null)
const isReady = ref(false)
const originalRefs = ref(new Map()) // 缓存引用标签映射 [序号 => URL]

// 预处理内容：将 URL 转义，防止 Markdown 解析成链接
const preprocessContent = (content) => {
  if (!content) return content

  let result = content

  // 1. 先提取并缓存引用标签的映射关系，转换为简洁格式 [1]
  originalRefs.value.clear()
  result = result.replace(
    /\[URL[：:]\s*([^\]\]]+)\]\[(\d+)\]/g,
    (_match, url, num) => {
      originalRefs.value.set(num, url)
      return `[${num}]` // 转换为简洁格式 [1]
    }
  )

  // 2. 将 http/https URL 中的特殊字符转义，使其成为纯文本
  // 策略：将 http/https 中的 : 和 / 转义，这样 Markdown 就不会识别为链接
  result = result.replace(
    /(https?:\/\/[^\s<>\[\](){}"']+)/g,
    (match) => {
      // 转义 : 和 / 字符，使 URL 不被识别为链接
      return match.replace(/:/g, '\\:').replace(/\//g, '\\/')
    }
  )

  return result
}

// 初始化编辑器
const initEditor = async () => {
  if (!editorContainer.value || isReady.value) {
    return
  }

  try {
    // 销毁已存在的实例
    if (editorInstance.value) {
      editorInstance.value.destroy()
      editorInstance.value = null
    }

    await nextTick()

    // 预处理内容，防止 URL 被解析成链接
    const processedContent = preprocessContent(props.content)

    // 创建新的 AiEditor 实例
    editorInstance.value = new AiEditor({
      element: editorContainer.value,
      placeholder: props.placeholder,
      content: processedContent,
      editable: true,
      contentIsMarkdown: true,
      toolbarKeys: props.toolbarKeys,
      textSelectionBubbleMenu: props.textSelectionBubbleMenu
    })

    isReady.value = true
    emit('ready', editorInstance.value)

    console.log('AiEditor 实例初始化成功')
  } catch (error) {
    console.error('AiEditor 初始化失败:', error)
    emit('error', error)
  }
}

// 销毁编辑器
const destroyEditor = () => {
  if (editorInstance.value) {
    try {
      editorInstance.value.destroy()
      console.log('AiEditor 实例已销毁')
    } catch (error) {
      console.error('AiEditor 销毁失败:', error)
    } finally {
      editorInstance.value = null
      isReady.value = false
    }
  }
}

// 生命周期钩子
onMounted(async () => {
  await nextTick()
  initEditor()
})

onUnmounted(() => {
  destroyEditor()
  // 清理缓存
  originalRefs.value.clear()
})

// 监听 content prop 的变化，更新编辑器内容
watch(() => props.content, (newContent, oldContent) => {
  if (newContent !== undefined && newContent !== oldContent) {
    // 重新初始化编辑器来更新内容
    destroyEditor()
    nextTick(() => {
      initEditor()
    })
  }
}, { immediate: false })

// 暴露给父组件的方法
defineExpose({
  // 核心方法：获取 Markdown 内容
  getContent() {
    let markdown = editorInstance.value ? editorInstance.value.getMarkdown() : props.content

    // 1. 还原被转义的 URL（预处理时添加的 \: 和 \/）
    // 预处理时 https:// 变成了 https\:\\//（字符串中的反斜杠）
    // 使用 split/join 避免复杂的正则转义
    markdown = markdown.split('\\:\\//').join('://')

    // 2. 处理各种不必要的转义符问题

    // 2.1 处理有序列表数字后的转义符问题
    // 将形如 "1\\." 替换为 "1."
    markdown = markdown.replace(/(\d+)\\\./g, '$1.')

    // 2.2 移除所有中括号的转义符
    // 将 "\[" 替换为 "["，将 "\]" 替换为 "]"
    markdown = markdown.replace(/\\\[/g, '[').replace(/\\\]/g, ']')

    // 3. 还原引用标签：将 [1] 转换回 [URL: xxx][1]
    markdown = markdown.replace(
      /\[(\d+)\]/g,
      (_match, num) => {
        const url = originalRefs.value.get(num)
        return url ? `[URL: ${url}][${num}]` : `[${num}]`
      }
    )

    return markdown
  }
})
</script>

<style scoped lang="scss">
.editor-container {
  position: relative;
  width: 100%;
  height: 100%;

  .aieditor-wrapper {
    width: 100%;
    height: 100%;
    :deep(.aie-container) {
      border: none;
      background: initial;

      aie-header {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 40px;
        margin-left: -16px;
        margin-right: -16px;
        padding-left: 12px;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        background: #e7eefd;

        &>div {
          border-bottom: none;
        }
      }

      .aie-content {
        padding: 0;
      }

      aie-footer {
        display: none;
      }

      .aie-bubble-menu {
        .aie-bubble-menu-item {
          font-size: 16px;
        }
      }
    }

    :deep(*) {
      a {
        text-decoration: auto;
        color: var(--theme-text-2);
      }

      p {
        margin-top: 16px;
        margin-bottom: 16px;
        line-height: 1.5;
      }

      .tableWrapper {
        display: flex;
      }

      table {
        margin: 0 auto 10px;
        margin-left: 0;
        margin-right: 0;

        thead {
          tr {
            background-color: var(--theme-fill);
          }
        }

        tr {

          th,
          td {
            border-width: 1px;
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
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-top: 16px;
        margin-bottom: 16px;
        padding-top: 0;
        padding-bottom: 0;
        border-bottom: none;
        line-height: 1.25;
        font-size: 18px;
      }

      p {
        line-height: 30px;
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

          &+pre {
            margin-top: 0;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
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
}
</style>

