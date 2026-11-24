<template>
  <el-dialog v-model="dialogVisible" title="代码编辑" :width="pxToRem(960)" :before-close="handleClose">
    <el-button type="primary" @click="copy(jsonContent)" class="copy">
      <i class="iconfont icon-fuzhidaima1"></i>
      复制代码
    </el-button>
    <div class="code-json-editor">
      <Vue3JsonEditor
        v-model="jsonContent"
        :showBtns="false"
        mode="text"
        lang="zh"
        :expandedOnStart="true"
        @json-change="onJsonChange"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCode">
          执 行
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import { Vue3JsonEditor } from 'vue3-json-editor'
import { getNodeDetailEdit } from '@/api/api_dataAnalysis'
import { copy } from '@/utils/utils'
// import { getAnalysisResult } from '@/api/api_dataAnalysis.js'
// import { ElMessage } from 'element-plus'
const emits = defineEmits(['toRunComponentMethod'])
const props = defineProps({
  dataOperateId: { // 节点id
    type: String,
    require: true
  }
})

const dialogVisible = ref(false) // 弹窗是否可见
const jsonContent = ref({}) // 代码编辑器内容
const searchParams = ref({}) // 查询参数

const openCodeEditor = async () => {
  const { code, data } = await getNodeDetailEdit({
    dataOperateId: props.dataOperateId
  })
  if (code === 10000) {
    searchParams.value = { ...data }
    const params = JSON.parse(data?.params || '{}')
    if (params.input_conditions) { // 老方法，使用input_conditions
      params.input_conditions = JSON.parse(params.input_conditions || '{}')
    } else if (params.inputConditions) { // 新方法，使用inputConditions
      params.inputConditions = JSON.parse(params.inputConditions || '{}')
    }
    jsonContent.value = params
  }
  dialogVisible.value = true
}

const handleClose = () => {
  dialogVisible.value = false
}

// 代码发生变成的时候触发
const onJsonChange = (newVal) => {
  console.log(newVal)
  jsonContent.value = newVal
}

const saveCode = async () => {
  // 处理input_conditions
  const JsonParams = { ...jsonContent.value }
  if (JsonParams.input_conditions) { // 老方法，使用input_conditions
    JsonParams.input_conditions = JSON.stringify(JsonParams.input_conditions)
  } else if (JsonParams.inputConditions) { // 新方法，使用inputConditions
    JsonParams.inputConditions = JSON.stringify(JsonParams.inputConditions)
  }

  emits('toRunComponentMethod', JsonParams)
  dialogVisible.value = false
}

defineExpose({
  openCodeEditor
})
</script>
<style lang="scss" scoped>
.code-json-editor {
  margin-top: 36px;
  :deep(.jsoneditor-vue) {
    /* jsoneditor右上角默认有一个链接,加css去掉 */
    .jsoneditor-poweredBy {
      display: none !important;
    }

    /* 修改高度 */
    div.jsoneditor-outer {
      height: 500px;
    }

    /* 修改菜单栏背景颜色,原始背景为蓝色，为了和整体页面风格一致，改为黑色 */
    div.jsoneditor-menu {
      border-bottom: 1px solid #000;
      background-color: #000;
    }

    /* 修改输入框边框颜色 */
    div.jsoneditor {
      border: 1px solid #000;
    }
  }
}
.copy {
  position: absolute;
  right: 24px;
  top: 60px;
  z-index: 99;
  i {
    margin-right: 8px;
    font-size: 14px;
  }
}
</style>
