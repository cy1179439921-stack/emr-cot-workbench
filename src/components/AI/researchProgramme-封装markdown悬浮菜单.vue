<template>
  <div class="programme">
    <!-- <div class="top-div">
      <CommonSteps2></CommonSteps2>
    </div> -->
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
    <div class="bottom-div">
      <div class="bottom-left">
        <header>
          <i class="iconfont icon-beijingfenxi"></i>
          <span>方案章节</span>
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
      <div class="bottom-right">
        <header>
          <div class="left">
            <Loading v-if="totalLoading"></Loading>
            <span v-if="totalLoading">实时生成：</span>
            <!-- <span v-else-if="activeItem.status === 3" style="color: #f56c6c;">生成失败：</span> -->
          </div>
          <div class="right" v-if="!totalLoading">
            <div class="AINotice">内容由AI生成，注意甄别，仅供参考</div>
            <CommonDownLoad v-if="curMode === 'onlyRead'" @handleClick="handleDownload">
              <el-button class="download-btn" type="default">
                <i class="iconfont icon-daochu2"></i>
                <span>下载</span>
              </el-button>
            </CommonDownLoad>

            <el-button type="default" @click="handleCancel" v-if="curMode === 'edit'"><i class="iconfont icon-quxiao"></i>取消</el-button>
            <el-button type="primary" @click="handleSave" v-if="curMode === 'edit'"><i class="iconfont icon-baocunweichangyong"></i>保存</el-button>
          </div>
        </header>
        <div class="preview" :class="curMode">
          <div class="AILoadingF" v-if="sectionList.every(item => item.status === 1 && item.content === '')">
            <AILoading ></AILoading>
          </div>
          <el-scrollbar class="right-el-scrollbar" id="pdfId" ref="scrollbarRef" v-else>
            <template v-for="(item,index) in sectionList" :key="'section-' + index">
              <div class="section-div">
                <!-- 只读模式或生成中：使用 CommonMarkdown -->
                <div v-if="curMode === 'onlyRead' || item.status === 1" class="html-content">
                  <CommonMarkdown
                    :ref="el => { if (el) commonMarkdownRefs[index] = el }"
                    mode="onlyRead"
                    v-model:source="item.content"
                    @jump="handleJump"/>
                </div>

                <!-- 编辑模式：使用 AiEditor -->
                <div v-else-if="curMode === 'edit' && index !== 11" class="html-content editor-container">
                  <div :ref="el => { if (el) editorRefs[index] = el }" class="aieditor-wrapper"></div>
                </div>

                <!-- 参考文献章节编辑模式：使用 CommonMarkdown 只读 -->
                <div v-else-if="curMode === 'edit' && index === 11" class="html-content">
                  <CommonMarkdown
                    :ref="el => { if (el) commonMarkdownRefs[index] = el }"
                    mode="onlyRead"
                    v-model:source="item.content"
                    @jump="handleJump"/>
                </div>
              </div>

              <!-- AIEdit 组件弹窗 -->
              <el-dialog v-model="showAIEdit[index]" title="AI 辅助编辑" width="800px" v-if="index !== 11">
                <AIEdit
                  :ref="el => { if (el) AIInputRefs[index] = el }"
                  :source="item.content"
                  @handleReplace="val => handleAIReplace(val, item, index)"/>
              </el-dialog>
            </template>
          </el-scrollbar>
          <!-- <div class="html-footer html-footer1" v-if="activeItem.status === 1">
            <img src="@/assets/icon-lightning.png">
            <span>正在生成..</span>
          </div> -->
        </div>
        <div class="preview-footer" v-if="curMode === 'onlyRead'">
          <el-button class="generate-btn" :class="{'disabled': percentage !== 100}" @click="handleEdit" type="primary" v-if="curMode === 'onlyRead'">
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
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onUnmounted, computed } from 'vue'
// import CommonSteps2 from '@/components/common/commonSteps2.vue'
import AIEdit from '@/components/AI/AIEdit.vue'
import CommonMarkdown from '@/components/AI/commonMarkdown.vue'
import CommonDownLoad from '@/components/AI/commonDownLoad.vue'
import { AiEditor } from 'aieditor'
import { EditorBlockFloatingMenu } from '@/components/AI/EditorBlockFloatingMenu.js'
import 'aieditor/dist/style.css'
// 移除模拟数据，使用真实SSE生成
// import { content1, content2, content3, content4, content5, content6, content7, content8, content9, content10, content11, content12 } from '@/components/AI/b.js'
// import { downloadResearchScheme } from '@/api/api_agent'
// import pdf from '@/utils/pdf.js'
// import { formatDateTime2 } from '@/utils/utils'
import { getResearchSchemeStatus, generateChapter, generateChapters, saveResearchScheme } from '@/api/api_agent.js'
import { downloadResearchScheme } from '@/api/api_agent'
import multiSSEManager from '@/utils/multiSSEManager.js'
// import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getToken } from '@/utils/crypto'
import { blodDownLoadFile } from '@/utils/fileDownload'
import { formatDateTime2 } from '@/utils/utils'
import { ElMessage } from 'element-plus'
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
  }
})

const curMode = ref('onlyRead')
const commonMarkdownRefs = ref([])
const scrollbarRef = ref(null)
const originalSectionList = ref([]) // 备份原始数据

// AiEditor 实例管理
const editorRefs = ref([]) // DOM 容器引用
const editorInstances = ref([]) // AiEditor 实例
const floatingMenuInstances = ref([]) // 浮动菜单实例
const showAIEdit = ref(Array(12).fill(false)) // AI 编辑弹窗显示状态
const AIInputRefs = ref([]) // AIEdit 组件引用
// 一键编辑
const handleEdit = async () => {
  // 保存当前滚动位置
  const scrollWrap = scrollbarRef.value.wrapRef
  const scrollTop = scrollWrap.scrollTop

  // 备份当前数据
  originalSectionList.value = sectionList.value.map(item => ({
    ...item,
    content: typeof item.content === 'string' ? item.content : JSON.parse(JSON.stringify(item.content))
  }))

  curMode.value = 'edit'

  // 等待 DOM 更新后初始化编辑器
  await nextTick()

  sectionList.value.forEach((item, index) => {
    if (index !== 11 && editorRefs.value[index]) {
      initAiEditor(index, item.content)
    }
  })

  // 恢复滚动位置
  requestAnimationFrame(() => {
    scrollWrap.scrollTo({
      top: scrollTop,
      behavior: 'instant'
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

// 初始化单个 AiEditor 实例
const initAiEditor = (index, content) => {
  // 如果已存在实例，先销毁
  if (editorInstances.value[index]) {
    editorInstances.value[index].destroy()
  }

  try {
    editorInstances.value[index] = new AiEditor({
      element: editorRefs.value[index],
      placeholder: '请填写内容...',
      content,
      // editable: true,
      contentIsMarkdown: true, // 直接渲染 Markdown
      textCounter: false,
      // 启用拖拽块功能（类似 Notion 的行首菜单）
      draggable: true,
      toolbarKeys: ['undo', 'redo', 'brush', 'eraser',
        '|', 'heading',
        '|', 'bold', 'italic', 'underline', 'strike', 'link', 'code',
        '|', 'font-color',
        '|', 'align',
        '|', 'bullet-list', 'ordered-list', 'indent-decrease', 'indent-increase', 'container',
        '|', 'quote', 'code-block', 'table',
        '|', 'source-code', 'printer', 'fullscreen', 'ai'
      ],
      // toolbarKeys: [
      //   'undo', 'redo', '|',
      //   'heading', 'paragraph', '|',
      //   'bold', 'italic', 'underline', 'strike', '|',
      //   'quote', '|',
      //   'bulletList', 'orderedList', '|',
      //   'code', 'codeBlock', '|',
      //   'ai' // 使用 AiEditor 内置的 AI 按钮
      // ],
      // 配置 AI 功能
      ai: {
        models: {
          custom: {
            url: `${window.location.protocol}//${window.location.host}/api/agent/literatureReview/aiModify`,
            headers: SSE_HEADERS,
            wrapPayload: (message) => {
              // message 格式可能是：
              // 1. 只有用户输入："用户输入的内容"
              // 2. 用户输入 + 泡泡菜单：用户输入\n润色
              // 3. 只有泡泡菜单：\n润色 或 润色

              let currentType = 4
              console.log('wrapPayload - 原始message:', JSON.stringify(message))

              // 解析 message 获取用户输入
              let userInput = ''
              // 解析 message 获取选中内容
              let selectedContent = ''
              if (typeof message === 'string') {
                const parts = message.split('\n')

                if (parts.length >= 2) {
                  // 格式：用户输入 + \n + 泡泡菜单prompt
                  // 取第一部分作为用户输入
                  const singleValue = parts[1].trim()
                  if (['润色', '扩写', '缩写'].includes(singleValue)) {
                    selectedContent = parts[0].trim()
                    currentType = singleValue === '润色' ? 3 : singleValue === '扩写' ? 2 : 1
                  } else {
                    userInput = parts[1].trim()
                    currentType = 4
                  }
                }
              }

              console.log('wrapPayload 解析结果:')
              console.log('  - 用户选中的文本 (content):', selectedContent)
              console.log('  - 用户输入的值 (requirement):', userInput)
              console.log('  - 命令类型 (type):', currentType)

              return JSON.stringify({
                content: selectedContent, // 用户选中的文本（从onClick存储获取）
                requirement: userInput, // 用户在 AI 面板输入的内容
                type: currentType // 命令类型（1=缩写, 2=扩写, 3=润色, 4=默认）
              })
            },
            parseMessage: (message) => {
              try {
                // message 是字符串格式的 JSON，需要先解析
                const parsed = JSON.parse(message)
                console.log('parseMessage 解析后:', parsed)
                return {
                  role: 'assistant',
                  content: parsed.content || ''
                  // index: 1, // 中间结果
                  // status: 1 // 0=首个, 1=中间, 2=最后
                }
              } catch (error) {
                console.error('parseMessage 解析失败:', error, '原始数据:', message)
                return {
                  role: 'assistant',
                  content: ''
                }
              }
            }
          }
        },
        model: 'custom', // 默认模型
        bubblePanelModel: 'custom', // 泡泡菜单使用的模型
        bubblePanelMenus: [
          {
            prompt: `润色`,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
            title: '润色',
            onClick: (_editor, selectedText) => {
              console.log('润色被点击，选中文本:', selectedText)
              // 存储当前命令的 type 和选中的文本到编辑器实例上
              editorInstances.value[index]._currentAiCommandType = 3
              editorInstances.value[index]._currentSelectedText = selectedText
              return true // 返回 true 继续默认行为
            }
          },
          {
            prompt: `扩写`,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>',
            title: '扩写',
            onClick: (_editor, selectedText) => {
              console.log('扩写被点击，选中文本:', selectedText)
              editorInstances.value[index]._currentAiCommandType = 2
              editorInstances.value[index]._currentSelectedText = selectedText
              return true
            }
          },
          {
            prompt: `缩写`,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h12v2H6v-2zm0-4h12v2H6v-2zm0-4h12v2H6v-2zm0-4h12v2H6V7z"/></svg>',
            title: '缩写',
            onClick: (_editor, selectedText) => {
              console.log('缩写被点击，选中文本:', selectedText)
              editorInstances.value[index]._currentAiCommandType = 1
              editorInstances.value[index]._currentSelectedText = selectedText
              return true
            }
          }
        ]
        // 使用 onCreateClientUrl 拦截 AI 请求，直接流式处理
        // onCreateClientUrl: async (selectedText, command, startFn, _endFn) => {
        //   console.log('onCreateClientUrl 被触发:', command, '选中文本:', selectedText)

        //   // 根据命令 title 映射到 promptType
        //   let promptType
        //   const commandTitle = command.title || ''

        //   if (commandTitle === '润色' || commandTitle === 'polish') {
        //     promptType = 3 // 润色
        //   } else if (commandTitle === '扩写' || commandTitle === 'expand') {
        //     promptType = 2 // 扩写
        //   } else if (commandTitle === '缩写' || commandTitle === 'shorten') {
        //     promptType = 1 // 缩写
        //   } else {
        //     promptType = 4 // 默认对话模式
        //   }

        //   // 获取当前编辑器内容
        //   const currentContent = editorInstances.value[index]?.getMarkdown() || sectionList.value[index].content

        //   // 创建一个 ReadableStream 来处理 SSE 流
        //   const stream = new ReadableStream({
        //     async start(controller) {
        //       const encoder = new TextEncoder()
        //       const streamAbortController = new AbortController()

        //       try {
        //         await fetchEventSource(
        //           `${window.location.protocol}//${window.location.host}/api/agent/literatureReview/aiModify`,
        //           {
        //             method: 'POST',
        //             headers: {
        //               'Content-Type': 'application/json',
        //               'Cache-Control': 'no-cache',
        //               Connection: 'keep-alive',
        //               Accept: 'text/event-stream',
        //               Authorization: `Bearer ${getToken()}`
        //             },
        //             body: JSON.stringify({
        //               content: currentContent,
        //               requirement: selectedText || '',
        //               type: promptType
        //             }),
        //             signal: streamAbortController.signal,
        //             openWhenHidden: false,
        //             async onopen(response) {
        //               if (response.ok) {
        //                 console.log('SSE 连接成功')
        //                 return
        //               }
        //               console.error(`连接失败，状态码: ${response.status}`)
        //               controller.error(new Error(`连接失败，状态码: ${response.status}`))
        //             },
        //             onmessage(msg) {
        //               try {
        //                 const delta = JSON.parse(msg.data)
        //                 // 转换为 OpenAI 兼容的 SSE 格式
        //                 const openAIFormat = {
        //                   choices: [{
        //                     delta: {
        //                       content: delta.content || ''
        //                     }
        //                   }]
        //                 }
        //                 // 将数据推送到 stream
        //                 controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIFormat)}\n\n`))
        //               } catch (error) {
        //                 console.error('Error parsing SSE message:', error)
        //               }
        //             },
        //             onerror(error) {
        //               console.error('SSE error:', error)
        //               controller.error(error)
        //             },
        //             onclose() {
        //               console.log('SSE 连接已关闭')
        //               controller.close()
        //             }
        //           }
        //         )
        //       } catch (error) {
        //         console.error('网络好像不太稳定，请稍后重试:', error)
        //         controller.error(error)
        //       }
        //     },
        //     cancel() {
        //       console.log('Stream 被取消')
        //     }
        //   })

        //   // 创建 Response 对象并传递给 startFn
        //   const response = new Response(stream, {
        //     headers: {
        //       'Content-Type': 'text/event-stream',
        //       'Cache-Control': 'no-cache',
        //       Connection: 'keep-alive'
        //     }
        //   })

        //   // 调用 startFn 开始流式处理
        //   startFn(response)
        // }
      }
    })
    console.log(`AiEditor 实例 ${index} 初始化成功`)

    // 初始化段落前浮动菜单
    // 使用容器级别的 mousemove 事件，不干扰编辑器
    setTimeout(() => {
      const editorElement = editorRefs.value[index]
      if (editorElement) {
        floatingMenuInstances.value[index] = new EditorBlockFloatingMenu(editorElement)
      }
    }, 500) // 延迟 500ms 确保 AiEditor 完成渲染
  } catch (error) {
    console.error(`AiEditor 初始化失败 (章节 ${index}):`, error)
  }
}

// 处理 AI 替换
const handleAIReplace = (aiContent, item, index) => {
  // 将 AI 生成的内容更新到 AiEditor
  if (editorInstances.value[index]) {
    editorInstances.value[index].setContent(aiContent)
  }
  // 更新数据
  item.content = aiContent
  // 关闭弹窗
  showAIEdit.value[index] = false
}
// 取消
const handleCancel = () => {
  // 销毁所有 AiEditor 实例
  editorInstances.value.forEach((editor, index) => {
    if (editor) {
      editor.destroy()
      editorInstances.value[index] = null
    }
  })

  // 恢复原始数据
  if (originalSectionList.value.length > 0) {
    // 先清空 sectionList，强制重新渲染
    const backupData = originalSectionList.value.map(item => ({
      ...item,
      content: typeof item.content === 'string' ? item.content : JSON.parse(JSON.stringify(item.content))
    }))

    // 清空组件引用
    commonMarkdownRefs.value = []

    // 重新设置数据
    sectionList.value = []
    nextTick(() => {
      sectionList.value = backupData
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
    prompt: '请生成研究方案的基本信息与摘要部分'
  },
  {
    id: 2,
    name: '背景与依据',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的背景与依据部分'
  },
  {
    id: 3,
    name: '研究目的与目标',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的研究目的与目标部分'
  },
  {
    id: 4,
    name: '研究设计',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的研究设计部分'
  },
  {
    id: 5,
    name: '受试者选择',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的受试者选择部分'
  },
  {
    id: 6,
    name: '研究干预措施',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的研究干预措施部分'
  },
  {
    id: 7,
    name: '研究终点与评估方法',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的研究终点与评估方法部分'
  },
  {
    id: 8,
    name: '安全性评估',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的安全性评估部分'
  },
  {
    id: 9,
    name: '数据管理与统计学',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的数据管理与统计学部分'
  },
  {
    id: 10,
    name: '伦理与法规考虑',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的伦理与法规考虑部分'
  },
  {
    id: 11,
    name: '研究管理',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的研究管理部分'
  },
  {
    id: 12,
    name: '参考文献',
    status: 1,
    loading: false,
    content: '',
    prompt: '请生成研究方案的参考文献部分'
  }
])
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
    // 通过 ref 获取对应的 CommonMarkdown 组件
    const targetComponent = commonMarkdownRefs.value[index]

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
const createAllConnection = async () => {
  const url = '/agent/agentResearchProposalChapter/getReplyList'
  try {
    multiSSEManager.createConnection('all', {
      researchProposalId: props.schemeId
    }, url, {
      onMessage: (connectionId, content) => handleAllMessage(connectionId, content),
      onError: (connectionId, error) => handleAllError(connectionId, error),
      onClose: (connectionId) => handleAllComplete(connectionId),
      onProgress: (progress, elapsedTime, completed, total) => handleGlobalProgress(progress, elapsedTime, completed, total)
    })

    console.log(`全文SSE连接已启动`)
    return true
  } catch (error) {
    console.error(`全文SSE初始化失败:`, error)
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
const referenceList = ref([])

// 请求第12个章节（参考文献）
const requestReferenceSection = async () => {
  console.log('开始请求第12个章节（参考文献）')
  const lastSection = sectionList.value[11] // 第12个章节

  try {
    const { code, data } = await generateChapter({
      chapterName: lastSection.name,
      researchProposalId: props.schemeId,
      sort: lastSection.id
    })

    if (code === 10000) {
      if (data.length === 0) {
        ElMessage.error('未找到相关参考文献')
        // 结束所有章节的生成，状态设为3
        sectionList.value.forEach(section => {
          section.loading = false
          section.status = 3 // 3: 生成失败
        })
        // 停止计时器
        clearInterval(timer.value)
        timer.value = null
        return false
      }

      console.log('第12个章节生成成功！', data)
      referenceList.value = data
      // 暂时不赋值内容，等所有章节完成后再赋值

      return true // 成功
    } else {
      // 结束所有章节的生成，状态设为3
      sectionList.value.forEach(section => {
        section.loading = false
        section.status = 3 // 3: 生成失败
      })
      // 停止计时器
      clearInterval(timer.value)
      timer.value = null
      return false
    }
  } catch (error) {
    console.error('第12个章节网络好像不太稳定，请稍后重试:', error)
    sectionList.value.forEach(section => {
      section.loading = false
      section.status = 3 // 3: 生成失败
    })
    // 停止计时器
    clearInterval(timer.value)
    timer.value = null
    return false
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

// 等待批次中所有章节完成的辅助函数
// const waitForBatchCompletion = (batchSections, batchName) => {
//   return new Promise((resolve) => {
//     console.log(`${batchName}开始等待完成...`)

//     const checkCompletion = () => {
//       const allCompleted = batchSections.every(section => section.status !== 1) // 状态不是1（生成中）即为完成
//       const completedCount = batchSections.filter(section => section.status === 2).length
//       const failedCount = batchSections.filter(section => section.status === 3).length

//       if (allCompleted) {
//         console.log(`${batchName}完成！成功：${completedCount}，失败：${failedCount}`)
//         resolve()
//       } else {
//         // 每500ms检查一次
//         setTimeout(checkCompletion, 500)
//       }
//     }

//     checkCompletion()
//   })
// }

// 为参考文献章节赋值内容
const assignReferenceContent = () => {
  if (referenceList.value.length > 0) {
    const lastSection = sectionList.value[11] // 第12个章节
    lastSection.loading = false
    lastSection.status = 2 // 2: 已完成
    lastSection.content = '\n\n## 参考文献\n\n'
    referenceList.value.forEach((item, index) => {
      lastSection.content += `[${index + 1}] ${item.title} ${item.authors} ${item.publish_date}\n\n`
    })
    console.log('参考文献内容已赋值完成')
  }
}
// 定义一个计时器，每隔1秒+1
const timer = ref(null)
// 初始化研究方案生成
// eslint-disable-next-line no-unused-vars
const init = async () => {
  if (props.dialogId) {
    const { code, data } = await getResearchSchemeStatus({
      researchProposalId: props.dialogId
    })
    if (code === 10000) {
      data.completeChapterList.forEach(item => {
        const section = sectionList.value.find(s => s.id === item.sort)
        if (section) {
          // 文献章节特殊处理，最后再赋值
          if (section.id === 12 && data.unCompleteChapterSortList?.length > 0) {
            referenceList.value = JSON.parse(item.chapterContent)
            section.status = 1 // 1: 生成中
            section.loading = true
          } else if (section.id === 12 && data.unCompleteChapterSortList?.length === 0) {
            // 都完成，可直接赋值
            section.status = 2 // 2: 已完成
            section.loading = false
            referenceList.value = JSON.parse(item.chapterContent)
            assignReferenceContent()
          } else {
            section.status = 2 // 2: 已完成
            section.content = item.chapterContent
            section.loading = false
          }
        }
      })
      // 未完成，继续发起流式请求
      data.unCompleteChapterSortList?.forEach(sort => {
        const section = sectionList.value.find(s => s.id === sort)
        if (section) {
          section.status = 1 // 1: 生成中
          section.loading = true
          createSectionConnection(section)
        }
      })
      // 未成功
      data.errList.forEach(sort => {
        const section = sectionList.value.find(s => s.id === sort)
        if (section) {
          section.status = 3 // 3: 生成失败
          section.loading = false
        }
      })
      time.value = data.second

      // 等待下一个DOM更新周期，确保CommonMarkdown组件完全渲染后再计算字符数
      await nextTick()
      // 强制更新字符数显示
      sectionList.value.forEach(section => {
        if (section.status === 2) {
          // 通过访问内容来触发响应式更新
          console.log(`章节 ${section.name} 字符数:`, getRenderedCharCount(section))
        }
      })
    }
  } else {
    // 开始time计时
    timer.value = setInterval(() => {
      time.value += 1
    }, 1000)
    console.log('开始初始化研究方案生成')
    // 第一步：请求第12个章节（参考文献）
    const referenceSuccess = await requestReferenceSection()

    // 如果参考文献成功，再请求前11个章节
    if (referenceSuccess) {
      const { code } = await generateChapters({
        researchProposalId: props.schemeId
      })
      if (code === 10000) {
        requestAllSection()
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
    } else {
      console.log('参考文献请求失败，跳过前11个章节请求')
    }
  }
}
// 处理全文消息
const handleAllMessage = (connectionId, content) => {
  content.forEach(item => {
    const section = sectionList.value.find(s => s.id === item.sort)
    if (section) {
      if (item.chatContentType === 1) {
        section.content += item.content
      } else if (item.chatContentType === 3) {
        // 该章节结束
        section.loading = false
        section.status = 2
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
  if (allFirst11Completed && referenceList.value.length > 0) {
    console.log('所有前11个章节已完成，开始为参考文献赋值')
    assignReferenceContent()
  }
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

// 处理章节完成
const handleSectionComplete = (connectionId) => {
  console.log(`章节生成完成: ${connectionId}`)
  const section = sectionList.value.find(s => s.id === connectionId)
  if (section) {
    section.loading = false
    section.status = 2 // 2: 已完成
    console.log(`章节 ${section.name} 已完成，字符数: ${section.content.length}`)

    // 检查是否所有前11个章节都已完成(成功2或失败3)，如果是，则为参考文献章节赋值
    const first11Sections = sectionList.value.slice(0, 11)
    const allFirst11Completed = first11Sections.every(s => s.status !== 1)

    if (allFirst11Completed && referenceList.value.length > 0) {
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
// 组件卸载时清理所有SSE连接
onUnmounted(() => {
  console.log('组件卸载，清理所有SSE连接')
  multiSSEManager.stopAllConnections()
  // 清除timer计时器
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
    console.log('组件卸载时清除计时器')
  }

  // 销毁所有 AiEditor 实例
  editorInstances.value.forEach(editor => {
    if (editor) editor.destroy()
  })

  // 销毁所有浮动菜单实例
  floatingMenuInstances.value.forEach(menu => {
    if (menu) menu.destroy()
  })
})

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
// 保存
const handleSave = async () => {
  // 从每个 AiEditor 实例获取 Markdown 内容
  editorInstances.value.forEach((editor, index) => {
    if (editor && index !== 11) {
      const markdown = editor.getMarkdown()
      sectionList.value[index].content = markdown
    }
  })

  // 已保存后，更新备份为当前最新的数据
  originalSectionList.value = sectionList.value.map(item => ({
    ...item,
    content: typeof item.content === 'string' ? item.content : JSON.parse(JSON.stringify(item.content))
  }))

  console.log('保存', sectionList.value)
  // 将sectionList.value中的content字段拼到一起，章节间添加双换行符分隔
  const newContent = sectionList.value.slice(0, -1).map(item => item.content)
  console.log('newContent（换行符已转换）:', newContent)
  const params = {
    contentList: newContent,
    researchProposalId: props.schemeId
  }
  const { code } = await saveResearchScheme(params)
  if (code === 10000) {
    ElMessage.success('已保存')
    // 回到只读模式
    handleCancel()
  }
}

// 处理下载事件
const handleDownload = async (item) => {
  console.log('下载类型:', item.fileType)
  downloadResearchScheme({
    fileType: item.value,
    id: props.schemeId
  }).then(res => {
    const time = formatDateTime2()

    const fileName = `研究方案_#${props.query}_${time}.${item.fileType}` // 导出文件名
    blodDownLoadFile(res, fileName)
  }).catch(err => {
    console.error('下载失败:', err)
  })
}

// 单个章节重试功能
const handleRetrySection = async (section) => {
  // 清空之前的错误内容
  section.content = ''
  section.loading = true
  section.status = 1
  // 若文献为空，则先重试文献
  if (referenceList.value.length === 0 || section.id === 12) {
    await requestReferenceSection()
  }
  // 对于前11个章节，使用单个章节重试逻辑
  requestSingleSection(section)
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
</script>
<style scoped lang="scss">
.programme {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  // .top-div {
  //   height: 100px;
  //   background-color: var(--theme-card);
  // }
  .progress-div {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 113px;
    padding: 0 2px 2px;
    border-radius: 8px;
    background: var(--theme-card);
    .progress-frame {
      box-sizing: border-box;
      width: 100%;
      height: 106px;
      padding-left: 30px;
      padding-right: 36px;
      border-radius: 8px;
      background: linear-gradient(180deg, rgba(54, 112, 248, 0.13) 5%, rgba(255, 255, 255, 0) 100%);
      background-size: 100% 100%;
      .info {
        display: flex;
        justify-content: space-between;
        margin-top: 28px;
        .left {
          display: flex;
          align-items: center;
          .successIcon {
            width: 22px;
            height: 22px;
            margin-right: 11px;
            border-radius: 22px;
            background-color: var(--theme-primary);
            i {
              font-size: 9px;
              color: #fff;
            }
          }
          img {
            width: 22px;
            height: 22px;
            margin-right: 11px;
          }
          span {
            font-weight: 500;
            color: var(--theme-text);
          }
        }
        .right {
          display: flex;
          align-items: center;
          font-weight: 500;
          color: var(--theme-primary);
          div:first-child {
            display: flex;
            align-items: center;
            i {
              margin-right: 6px;
            }
          }
        }
        .line {
          width: 1px;
          height: 15px;
          margin-left: 11px;
          margin-right: 11px;
          background-color: #666;
        }
      }
      .el-progress {
        margin-top: 22px;
      }
    }
  }
  .bottom-div {
    display: flex;
    flex: 1;
    height: 0;
    margin-top: 16px;
    .bottom-left {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 412px;
      padding: 16px 0 16px 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      header {
        display: flex;
        align-items: center;
        margin-bottom: 21px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-primary);
        i {
          margin-right: 9px;
        }
      }
      .el-scrollbar {
        padding-right: 24px;
      }
      .section {
        display: flex;
        .timeline {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 7px;
          padding-top: 6px;
          .circle {
            width: 7px;
            height: 7px;
            border-radius: 100%;
            background-color: var(--theme-primary);
          }
          .line {
            width: 1px;
            height: 63px;
            margin-top: 10px;
            margin-bottom: 10px;
            background-color: var(--theme-primary);
            &.last-line {
              height: 50px;
            }
          }
        }
        .section-content {
          flex: 1;
          margin-left: 11px;
          .section-top {
            display: flex;
            .title {
              color: var(--theme-text);
            }
          }
          .section-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;
            height: 40px;
            margin-top: 14px;
            padding-left: 16px;
            padding-right: 16px;
            border: 1px solid #c9d8fc;
            border-radius: 2px;
            background: var(--theme-primary-soft);
            cursor: pointer;
            color: var(--theme-primary);
            &.error {
              border-color: #ff4e4e;
              background: rgba(255, 78, 78, 0.1);
              .statusText {
                color: var(--theme-text);
                i {
                  color: #ff4e4e;
                }
              }
            }
            div {
              display: flex;
              span {
                display: flex;
                align-items: center;
                i {
                  margin-right: 8px;
                  font-size: 16px;
                }
              }
            }
          }
        }
      }
    }
    .bottom-right {
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      margin-left: 16px;
      padding: 16px 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .left {
          display: flex;
          span {
            margin-left: 11px;
            font-weight: 600;
            font-weight: 500;
            font-size: 16px;
            color: var(--theme-primary);
          }
        }
        .right {
          display: flex;
          align-items: center;
          .AINotice {
            margin-right: 18px;
            font-weight: 400;
            font-size: 12px;
            color: var(--theme-text-3);
          }
          .el-button {
            border-radius: 30px;
            cursor: pointer;
            span {
              display: flex;
              align-items: center;
            }
            i {
              margin-right: 5px;
              font-size: 12px;
            }
          }
        }
      }
      .preview {
        display: flex;
        flex-direction: column;
        flex: 1;
        box-sizing: border-box;
        height: 0;
        margin-top: 19px;
        border: 1px solid #c9d8fc;
        border-radius: 8px;
        background: var(--theme-primary-soft);
        .AILoadingF {
          display: flex;
          flex: 1;
        }
        &.edit {
          border: none;
          background: initial;
          .section-div {
            padding-bottom: 16px;
            border: 1px solid #c9d8fc;
            border-radius: 8px;
            background: var(--theme-primary-soft);
            &:not(:first-child) {
              margin-top: 16px;
              :deep(.markdown-body) {
                padding-top: 16px;
              }
            }
          }
        }
        .section-div {
          display: flex;
          flex-direction: column;
          flex: 1;
          box-sizing: border-box;
          padding: 0 16px;
          &:not(:first-child) {
            :deep(.markdown-body) {
              padding-top: 0;
            }
          }
          :deep(.markdown-body) {
            padding-left: 0;
            padding-right: 0;
            padding-bottom: 0;
          }
        }
        .html-content {
          flex: 1;
          // padding: 22px;
          color: var(--theme-text-2);
          &:focus-visible {
            outline: none;
          }

          // AiEditor 编辑器容器样式
          &.editor-container {
            display: flex;
            flex-direction: column;
            :deep(*) {
              a {
                color: #1f2328;
              }
              p {
                margin-bottom: 16px;
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
              }
              h1,
              h2,
              h3,
              h4,
              h5,
              h6 {
                margin-top: 16px;
                margin-bottom: 16px;
                padding: 0;
                padding-bottom: 0;
                border-bottom: none;
                font-size: 14px;
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
            :deep(.aieditor-wrapper) {
              flex: 1;
              min-height: 300px;
              // 移除 aie-content 的左侧内边距，避免与浮动菜单之间有缝隙
              .aie-content {
                padding-left: 0 !important;
              }

              // 浮动菜单相关样式
              .ProseMirror {
                position: relative;

                // 给所有块元素添加左侧内边距，让它们的交互区域覆盖浮动按钮
                h1,
                h2,
                h3,
                h4,
                h5,
                h6,
                p,
                ul,
                ol,
                pre,
                blockquote {
                  // margin-left: -50px !important;
                  padding-left: 50px !important;
                }
              }
            }
          }
        }
        .html-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 500;
          color: var(--theme-primary);
          img {
            width: 12px;
            margin-right: 8px;
          }
          &.html-footer1 {
            height: 45px;
            border-top: 1px solid #c9d8fc;
          }
        }
      }
      .preview-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 51px;
        margin-top: 16px;
        .generate-btn {
          width: 249px;
          height: 51px;
          border: none;
          border-radius: 51px;
          background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
          font-weight: 600;
          font-size: 16px;
          &.disabled {
            background: linear-gradient(111deg, rgba(96, 92, 251, 0.5) 0%, rgba(69, 148, 249, 0.5) 100%);
            cursor: not-allowed;
          }
          :deep(.loading) {
            margin-right: 12px;
          }
          img {
            width: 16px;
            margin-right: 10px;
          }
        }
      }
    }
  }
}
.custom-text {
  margin-left: 8px;
}

</style>
<style>
.right-div {
  background-color: initial !important;
}
</style>
