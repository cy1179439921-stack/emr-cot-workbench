<template>
  <div class="ai-editor-renderer">
    <h2>AiEditor 渲染测试</h2>
    <div class="editor-container">
      <div ref="editorRef" class="aieditor-wrapper"></div>
    </div>
    <div class="controls">
      <el-button @click="destroyEditor" type="danger">销毁编辑器</el-button>
      <el-button @click="reinitEditor" type="primary">重新初始化</el-button>
      <el-button @click="getMarkdown" type="success">获取Markdown</el-button>
      <el-button @click="getOriginalMarkdown" type="warning">获取原始Markdown</el-button>
      <el-button @click="getHtml" type="info">获取HTML</el-button>
    </div>

    <!-- 显示获取到的markdown内容 -->
    <div v-if="markdownOutput" class="markdown-output" style="margin-top: 20px;">
      <h3>修复后的Markdown内容：</h3>
      <el-button @click="copyMarkdown" size="small" type="primary" style="margin-bottom: 10px;">
        复制到剪贴板
      </el-button>
      <pre class="markdown-content">{{ markdownOutput }}</pre>
    </div>

    <!-- 显示原始markdown内容 -->
    <div v-if="originalMarkdown" class="markdown-output" style="margin-top: 20px;">
      <h3>原始Markdown内容：</h3>
      <el-button @click="copyOriginalMarkdown" size="small" type="info" style="margin-bottom: 10px;">
        复制原始内容
      </el-button>
      <pre class="markdown-content">{{ originalMarkdown }}</pre>
    </div>

    <!-- 显示HTML内容 -->
    <div v-if="htmlOutput" class="markdown-output" style="margin-top: 20px;">
      <h3>渲染后的HTML内容：</h3>
      <el-button @click="copyHtml" size="small" type="success" style="margin-bottom: 10px;">
        复制HTML内容
      </el-button>
      <pre class="markdown-content">{{ htmlOutput }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { AiEditor } from 'aieditor'
import 'aieditor/dist/style.css'
import { content1 } from './b.js'

defineOptions({
  name: 'AiEditorRenderer',
  inheritAttrs: false
})

// 编辑器引用
const editorRef = ref(null)
let editorInstance = null

// 存储获取到的markdown内容
const markdownOutput = ref('')
const originalMarkdown = ref('')
const htmlOutput = ref('')

// 初始化编辑器
const initEditor = () => {
  if (editorInstance) {
    editorInstance.destroy()
    editorInstance = null
  }

  try {
    nextTick(() => {
      if (!editorRef.value) {
        console.error('编辑器容器未找到')
        return
      }

      // 直接使用原始markdown内容
      console.log('原始内容:', content1)

      editorInstance = new AiEditor({
        element: editorRef.value,
        placeholder: '请填写内容...',
        content: content1,
        contentIsMarkdown: true, // 使用 Markdown 模式进行渲染
        textCounter: false,
        // 添加更多配置
        markdown: {
          breaks: true,
          linkify: true,
          typographer: true,
          html: true
        },
        toolbarKeys: [
          'undo', 'redo', 'brush', 'eraser',
          '|', 'heading',
          '|', 'bold', 'italic', 'underline', 'strike', 'link',
          '|', 'font-color',
          '|', 'align',
          '|', 'bullet-list', 'ordered-list', 'indent-decrease', 'indent-increase', 'break',
          '|', 'quote', 'table'
        ],
        textSelectionBubbleMenu: {
          enable: true,
          items: ['Bold', 'Italic', 'Underline', 'Strike', 'code']
        },
        onCreated: () => {
          console.log('AiEditor 实例创建成功')
          // 调试：查看初始内容
          setTimeout(() => {
            console.log('AiEditor 初始化后的内容:', editorInstance.getHtml())
          }, 1000)
        },
        onChange: (content) => {
          console.log('内容变化:', content)
        }
      })

      console.log('AiEditor 初始化完成')
    })
  } catch (error) {
    console.error('AiEditor 初始化失败:', error)
  }
}

// 销毁编辑器
const destroyEditor = () => {
  if (editorInstance) {
    editorInstance.destroy()
    editorInstance = null
    console.log('编辑器已销毁')
  }
}

// 重新初始化编辑器
const reinitEditor = () => {
  destroyEditor()
  markdownOutput.value = '' // 清空之前的输出
  originalMarkdown.value = '' // 清空原始输出
  htmlOutput.value = '' // 清空HTML输出
  setTimeout(() => {
    initEditor()
  }, 100)
}

// 修复Markdown格式问题
const fixMarkdownFormat = (content) => {
  if (!content) return content

  return content
    // 问题1修复：将列表中的表格提取出来，作为独立元素
    .replace(/(-\s*.*?)(\n\s*\|.*\|[\s\S]*?\n\s*\|\s*\|.*\n)/gm, (match, listItem, table) => {
      // 移除列表项末尾的换行符，确保表格独立
      const cleanedListItem = listItem.trim()
      return cleanedListItem + '\n\n' + table.trim() + '\n\n'
    })
    // 问题2修复：确保表格前后有足够的换行符
    .replace(/([^\n])\n(\|[\s\S]*?\|\s*\n)/g, '$1\n\n$2')
    .replace(/(\|[\s\S]*?\|\s*\n)([^\n])/g, '$1\n\n$2')
    // 修复表格后缺少换行符的问题
    .replace(/\|[\s\S]*?\|\s*\n(?=[^\n])/g, (match) => match + '\n')
    // 移除多余的空行
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// 获取原始markdown内容（不修复）
const getOriginalMarkdown = () => {
  if (!editorInstance) {
    ElMessage.error('编辑器实例不存在')
    return
  }

  try {
    // 获取编辑器的原始内容
    const content = editorInstance.getMarkdown()
    originalMarkdown.value = content || '无内容'
    console.log('原始Markdown内容:', content)
    ElMessage.success('原始Markdown内容获取成功')
  } catch (error) {
    console.error('获取原始markdown内容失败:', error)
    ElMessage.error('获取原始Markdown内容失败')
  }
}

// 获取编辑后的markdown内容
const getMarkdown = () => {
  if (!editorInstance) {
    ElMessage.error('编辑器实例不存在')
    return
  }

  try {
    // 获取编辑器的内容，转换为markdown格式
    let content = editorInstance.getMarkdown()

    // 修复格式问题
    content = fixMarkdownFormat(content)

    markdownOutput.value = content || '无内容'
    console.log('原始内容:', editorInstance.getMarkdown())
    console.log('修复后内容:', content)
    ElMessage.success('Markdown内容获取成功')
  } catch (error) {
    console.error('获取markdown内容失败:', error)
    ElMessage.error('获取Markdown内容失败')
  }
}

// 复制原始markdown到剪贴板
const copyOriginalMarkdown = async () => {
  if (!originalMarkdown.value) {
    ElMessage.warning('没有可复制的原始内容')
    return
  }

  try {
    await navigator.clipboard.writeText(originalMarkdown.value)
    ElMessage.success('原始Markdown已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案：创建临时textarea
    const textarea = document.createElement('textarea')
    textarea.value = originalMarkdown.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('原始Markdown已复制到剪贴板')
  }
}

// 获取HTML内容
const getHtml = () => {
  if (!editorInstance) {
    ElMessage.error('编辑器实例不存在')
    return
  }

  try {
    const html = editorInstance.getHtml()
    htmlOutput.value = html || '无HTML内容'
    console.log('获取到的HTML内容:', html)
    ElMessage.success('HTML内容获取成功')
  } catch (error) {
    console.error('获取HTML内容失败:', error)
    ElMessage.error('获取HTML内容失败')
  }
}

// 复制HTML到剪贴板
const copyHtml = async () => {
  if (!htmlOutput.value) {
    ElMessage.warning('没有可复制的HTML内容')
    return
  }

  try {
    await navigator.clipboard.writeText(htmlOutput.value)
    ElMessage.success('HTML已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案：创建临时textarea
    const textarea = document.createElement('textarea')
    textarea.value = htmlOutput.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('HTML已复制到剪贴板')
  }
}

// 复制markdown到剪贴板
const copyMarkdown = async () => {
  if (!markdownOutput.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(markdownOutput.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案：创建临时textarea
    const textarea = document.createElement('textarea')
    textarea.value = markdownOutput.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('已复制到剪贴板')
  }
}

onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  destroyEditor()
})
</script>

<style scoped lang="scss">
.ai-editor-renderer {
  padding: 20px;

  h2 {
    margin-bottom: 20px;
    font-size: 18px;
    color: var(--theme-text);
  }

  .editor-container {
    overflow: hidden;
    min-height: 800px;
    margin-bottom: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;

    .aieditor-wrapper {
      height: 700px;
    }
  }

  .controls {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

// 全局样式，确保 AiEditor 正确显示
:deep(.aie-container) {
  height: 100%;

  .aie-content {
    min-height: 350px;
    padding: 16px;
    line-height: 1.6;
    font-size: 14px;
  }

  // 表格样式优化
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;

    th,
    td {
      padding: 8px 12px;
      border: 1px solid #ddd;
      vertical-align: top;
      text-align: left;
    }

    thead {
      tr {
        background-color: var(--theme-fill);
      }
    }

    tbody {
      tr:nth-child(odd) {
        background-color: var(--theme-fill);
      }

      tr:nth-child(even) {
        background-color: var(--theme-card);
      }
    }
  }

  // 标题样式
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 16px 0 8px 0;
    line-height: 1.4;
    font-weight: 600;
  }

  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }
  h4 { font-size: 16px; }
  h5 { font-size: 14px; }
  h6 { font-size: 12px; }

  // 列表样式
  ul,
  ol {
    margin: 8px 0;
    padding-left: 24px;

    li {
      margin: 4px 0;
    }
  }

  // 代码块样式
  pre {
    overflow-x: auto;
    margin: 16px 0;
    padding: 12px;
    border-radius: 6px;
    background-color: var(--theme-fill);

    code {
      padding: 0;
      background: none;
    }
  }

  code {
    padding: 2px 4px;
    border-radius: 3px;
    background-color: var(--theme-fill);
    font-size: 0.9em;
  }
}

// Markdown输出区域样式
.markdown-output {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: var(--theme-fill);

  h3 {
    margin: 0 0 16px 0;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-text);
  }

  .markdown-content {
    overflow-y: auto;
    max-height: 400px;
    margin: 0;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background-color: var(--theme-card);
    line-height: 1.5;
    font-size: 13px;
    color: var(--theme-text);
    word-wrap: break-word;
    white-space: pre-wrap;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      border-radius: 3px;
      background: var(--theme-fill);
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background: #c1c1c1;

      &:hover {
        background: #a9a9a9;
      }
    }
  }
}
</style>
