<template>
  <draggable :forceFallback="true" fallbackClass="dragClass" handle=".tuozhuai" :list="aiLiteratureReviewIntelligentAgentsData" class="draggableDiv" item-key="id" animation="300" group="classI">
    <template #item="{ element }">
      <div class="content-item">
        <div class="titleContainer">
          <i class="iconfont icon-a-tuozhuai1 tuozhuai"></i>
          <yDivEdit placeholderText="请填写内容" :ref="el => { element.ref = el }" type="text" class="edit" :title="element.title" v-model="element.title">
            <div class="btns">
              <el-tooltip placement="bottom" raw-content popper-class="btnPop">
                <template #content>
                  <div>
                    <span>删除</span>
                  </div>
                </template>
                <i class="iconfont icon-jian" :class="{'dis': aiLiteratureReviewIntelligentAgentsData.length === 1 }" @click="handlerContent(element.id,'del')"></i>
              </el-tooltip>
              <el-tooltip placement="bottom" raw-content popper-class="btnPop" :disabled="visible">
                <template #content>
                  <div>
                    <span class="ellipsis">添加同级标题</span>
                  </div>
                </template>
                <i class="iconfont icon-tongjibiaoti" @click="addTitle"></i>
              </el-tooltip>
              <el-tooltip placement="bottom" raw-content popper-class="btnPop" :disabled="visible">
                <template #content>
                  <div>
                    <span class="ellipsis">添加副标题</span>
                  </div>
                </template>
                <i class="iconfont icon-fubiaoti" @click="handlerContent(element.id,'add')"></i>
              </el-tooltip>
            </div>
          </yDivEdit>
        </div>
        <div class="item-content" v-if="!isShowTitle">
          <div class="keywords">
            <div>
              <i class="iconfont icon-zhishitubiao"></i><span>关键词:</span>
            </div>
            <div class="label" :class="{'label-hover':Array.isArray(element.keywords) && element.keywords.length === 0}">
              <span class="tip" v-for="(value,index) in element.keywords" :key="index">
                <ytSpanEdit v-model="element.keywords[index]"></ytSpanEdit>
                <i class="iconfont icon-guanbi" @click="delTips(element.id,index)"></i>
              </span>
              <i class="iconfont icon-jia" @click="addTips(element.id)"></i>
            </div>
          </div>
          <div class="searchPurpose"><i class="iconfont icon-zhishitubiao"></i><span>检索目的:</span>
            <yDivEdit placeholderText="请填写内容" type="text" class="edit check eli" :title="element.target" v-model="element.target" />
          </div>
        </div>
        <div class="subtitle">
          <draggable :forceFallback="true" fallbackClass="dragClass" handle=".icon-a-tuozhuai1" :list="element.children" class="draggableChildRenDiv" item-key="id" animation="300" :group="'subtitleItem' + element.id">
            <template #item="{ element }">
              <div class="subtitleItemContainer">
                <i class="iconfont icon-a-tuozhuai1"></i>
                <i class="iconfont icon-erjibiaoshi"></i>
                <yDivEdit placeholderText="子标题" :ref="el => { element.ref = el }" type="text" class="subtitleItem" :title="element.title" v-model="element.title" :key="String(element.parentId) + element.id">
                  <div class="btns">
                    <el-tooltip :offset="12" placement="bottom" raw-content popper-class="btnPop">
                      <template #content>
                        <div>
                          <span>删除</span>
                        </div>
                      </template>
                      <i class="iconfont icon-jian" @click="handlerChildrenContent(element,'del')"></i>
                    </el-tooltip>
                    <el-tooltip placement="bottom" raw-content popper-class="btnPop" :disabled="visible">
                      <template #content>
                        <div>
                          <span class="ellipsis">添加同级标题</span>
                        </div>
                      </template>
                      <i class="iconfont icon-tongjibiaoti" @click="handlerContent(element.parentId,'add')"></i>
                    </el-tooltip>
                  </div>
                </yDivEdit>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </template>
  </draggable>
</template>
<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import yDivEdit from './yDivEdit.vue'
import ytSpanEdit from './ytSpanEdit.vue'
import draggable from 'vuedraggable'
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  isShowTitle: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['update:modelValue'])

const aiLiteratureReviewIntelligentAgentsData = ref([])
const visible = ref(false) // tip显示状态
const findSectionById = (id) => aiLiteratureReviewIntelligentAgentsData.value.find(item => item.id === id)
const confirmDelete = (message = '删除后内容将无法找回，请谨慎操作') => ElMessageBox.confirm(message, '确认删除么？', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })

// 当 modelValue 更新时，只在内容真正改变时才更新 DOM
watch(() => props.modelValue, (newValue) => {
  if (Array.isArray(newValue) && newValue.length > 0) {
    aiLiteratureReviewIntelligentAgentsData.value = newValue
  } else {
    aiLiteratureReviewIntelligentAgentsData.value = [{ title: '', ref: ref(null), id: 1, children: [], keywords: [], target: '' }]
    // 只有一个内容时候，自动聚焦到第一个节
    setTimeout(() => {
      if (aiLiteratureReviewIntelligentAgentsData.value.length === 1) {
        aiLiteratureReviewIntelligentAgentsData.value[0].ref?.divFocus()
      }
    }, 500)
  }
}, { immediate: true, deep: true })

// 监听节内容变化
watch(() => aiLiteratureReviewIntelligentAgentsData.value, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// 删除关键词
const delTips = (id, index) => {
  const sec = findSectionById(id)
  if (sec?.keywords) sec.keywords.splice(index, 1)
}

// 添加关键词
const addTips = (id) => {
  const sec = findSectionById(id)
  if (!sec) return
  sec.keywords = sec.keywords || []
  if (sec.keywords.length > 19) {
    ElMessage.error('关键词数量不能超过20个')
    return
  }
  ElMessageBox.prompt('关键词：', '新增关键词', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '关键词不能为空！',
    customClass: 'add-tips-box'
  }).then(({ value }) => {
    if (!value) return
    sec.keywords.push(value)
  }).catch(() => {})
}

const addTitle = () => {
  aiLiteratureReviewIntelligentAgentsData.value.push({
    id: aiLiteratureReviewIntelligentAgentsData.value.length + 1,
    title: '',
    ref: ref(null),
    children: [],
    keywords: [],
    target: ''
  })
  setTimeout(() => {
    aiLiteratureReviewIntelligentAgentsData.value[aiLiteratureReviewIntelligentAgentsData.value.length - 1].ref?.divFocus()
  }, 500)
}

// 处理内容（添加/删除节）
const handlerContent = (id, actionType) => {
  visible.value = true
  if (actionType === 'add') {
    const sec = findSectionById(id)
    if (!sec) { visible.value = false; return }
    sec.children = sec.children || []
    sec.children.push({
      id: sec.children.length,
      parentId: id,
      title: '',
      ref: ref(null)
    })
    setTimeout(() => {
      const last = sec.children[sec.children.length - 1]
      last.ref?.divFocus()
      nextTick(() => { visible.value = false })
    }, 500)
  } else if (actionType === 'del') {
    if (aiLiteratureReviewIntelligentAgentsData.value.length === 1) {
      return
    }
    confirmDelete().then(() => {
      aiLiteratureReviewIntelligentAgentsData.value = aiLiteratureReviewIntelligentAgentsData.value.filter(item => item.id !== id)
      nextTick(() => { visible.value = false })
    }).catch(() => {})
  }
}

// 处理子内容删除
const handlerChildrenContent = ({ id, parentId }) => {
  confirmDelete().then(() => {
    const parent = findSectionById(parentId)
    console.log(parent)
    if (parent?.children) parent.children = parent.children.filter(ch => ch.id !== id)
  }).catch(() => {})
}

// 检查所有标题和子标题是否存在为空的情况
const checkTitle = () => {
  const titles = aiLiteratureReviewIntelligentAgentsData.value.map(item => item.title)
  const childTitles = aiLiteratureReviewIntelligentAgentsData.value.reduce((acc, cur) => {
    if (cur.children) {
      cur.children.forEach(child => {
        acc.push(child.title)
      })
    }
    return acc
  }, [])
  const hasEmptyTitle = titles.some(title => !title)
  const hasEmptyChildTitle = childTitles.some(title => !title)
  if (hasEmptyTitle || hasEmptyChildTitle) {
    return true
  }
  return false
}

// 是否存在标题为空的
const isCheckTitle = computed(() => {
  return checkTitle()
})

defineExpose({
  isCheckTitle
})
</script>
<style lang="scss" scoped>
:deep(.draggableDiv) {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  width: 100%;
}
:deep(.content-item) {
  display: flex;
  position: relative;
  flex-direction: column;
  margin-bottom: 16px;
  line-height: 20px;
  &:nth-child(1) {
    margin-top: 12px;
  }
  .edit {
    margin-left: 18px;
  }
  .eli {
    margin-left: 0;
  }
  .titleContainer {
    display: flex;
    align-items: flex-start;
    >.icon-a-tuozhuai1 {
      margin-top: 8px;
    }
  }
  .subtitle {
    display: contents;
    .draggableChildRenDiv {
      margin-left: 16px;
      margin-top: 4px;
    }
  }
  &::after {
    display: block;
    position: absolute;
    left: 20px !important;
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
    .icon-tongjibiaoti {
      margin: 0 16px 0 12px;
    }
    .dis {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }
  }
  .yt-div-edit {
    box-sizing: border-box;
    width: calc(100% - 14px) !important;
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
      padding-right: 90px !important;
      border-radius: 2px 2px 2px 2px;
      outline: 1px solid var(--theme-primary);
      background: var(--theme-primary-soft);
      word-break: break-all;
      white-space: wrap;
      &.yt-div-edit-focus-empty {
        background: transparent;
      }
    }
  }
  .yt-input {
    position: relative;
    &:has(.yt-div-edit-focus),
    &:hover {
      .btns {
        display: flex !important;
        align-items: center;
      }
      .yt-div-edit {
        margin-left: 12px !important;
        padding-right: 90px !important;
        border-radius: 2px 2px 2px 2px;
        outline: 1px solid var(--theme-primary);
      }
    }
  }
  .subtitleItem {
    .yt-div-edit {
      width: calc(100% - 16px);
      margin-bottom: 2px;
      font-weight: 700;
      font-size: 18px;
      // color: #000;
      .yt-div-edit-focus {
        margin-left: 12px;
      }
    }
    .yt-input:hover .yt-div-edit {
      margin-left: 12px;
    }
    .icon-tongjibiaoti {
      margin: 0 0 0 12px !important;
    }
  }
  .item-content {
    display: flex;
    flex-direction: column;
    margin-left: 14px !important;
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
        min-height: 36px;
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
        &:hover,
        &.label-hover {
          box-sizing: border-box;
          margin-left: 10px;
          padding-right: 72px;
          border: 1px solid var(--theme-primary);
          border-radius: 2px 2px 2px 2px;
          // background: var(--theme-primary-soft);
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
          width: calc(100% - 14px) !important;
          margin-left: 12px !important;
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
      margin-left: 10px !important;
      font-size: 8px;
      color: var(--theme-primary);
    }
  }
  .icon-tongjibiaoti,
  .icon-fubiaoti {
    font-size: 16px !important;
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
.icon-a-tuozhuai1 {
  cursor: move !important;
  font-size: 14px;
  color: var(--theme-text-3);
}
</style>
<style lang="scss">
.dragClass { opacity: 0 !important; }
body :has(.dragClass) {
  cursor: move !important;
  user-select: none;
}
</style>
