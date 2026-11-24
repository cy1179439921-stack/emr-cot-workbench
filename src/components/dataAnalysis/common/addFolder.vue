<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="pxToRem(508)"
    destroy-on-close
    :before-close="handleClose"
  >
    <el-form
      ref="ruleFormDom"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      @submit.prevent
    >
      <el-form-item label="名称" prop="name">
        <el-input
          class="h40"
          maxlength="50"
          show-word-limit
          v-model.trim="ruleForm.name"
          placeholder="请填写内容"
          @keyup.enter="handleSure"/>
      </el-form-item>
      <el-form-item label="描述" prop="describe">
        <el-input
          class="description"
          maxlength="60"
          show-word-limit
          type="textarea"
          v-model="ruleForm.describe"
          placeholder="请填写内容"
          @keyup.enter="handleSure"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取&nbsp;消</el-button>
        <el-button type="primary" @click="handleSure">
          确&nbsp;定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { createDataSet, editDataSet, createProjectFolder, editProject } from '@/api/api_dataAnalysis.js'
import { useAnalysisStore } from '@/store/analysisStore.js'
import { ElMessage } from 'element-plus'
const analysisStore = useAnalysisStore()

const emits = defineEmits(['updateList'])
const dialogVisible = ref(false)
const ruleFormDom = ref('')
const title = ref('新增文件夹')
const editType = ref(1)
const handleDialog = (type, data) => {
  editType.value = type
  if (data) {
    title.value = '编辑'
    ruleForm.value = {
      id: data.id,
      name: data.name,
      describe: data.describe
    }
  } else {
    title.value = '新增文件夹'
    ruleForm.value = {}
  }
  dialogVisible.value = true
}
const ruleForm = ref({
  name: '',
  describe: ''
})
const rules = reactive({
  name: [
    { required: true, message: '请填写名称', trigger: 'blur' },
    { max: 50, message: '最长50个字', trigger: 'blur' }
  ]
})
const handleSure = () => {
  ruleFormDom.value.validate((valid) => {
    if (valid) {
      if (editType.value === 1) {
        const newFormData = new FormData()
        newFormData.append('files', '')
        const formm = {
          pid: analysisStore.pid || 0,
          describe: ruleForm.value.describe,
          name: ruleForm.value.name,
          type: 1
        }
        newFormData.append('dataSetSaveAO', new Blob([JSON.stringify(formm)], { type: 'application/json' }))
        createDataSet(newFormData).then(res => {
          if (res.code === 10000) {
            ElMessage.success('已新增')
            dialogVisible.value = false
            emits('updateList')
          }
        })
      } else if (editType.value === 2) {
        editDataSet(ruleForm.value).then(res => {
          if (res.code === 10000) {
            ElMessage.success('编辑成功')
            emits('updateList')
            dialogVisible.value = false
          }
        })
      } else if (editType.value === 3) {
        const formm = {
          pid: analysisStore.pid || 0,
          describe: ruleForm.value.describe,
          name: ruleForm.value.name,
          type: 1
        }
        createProjectFolder(formm).then(res => {
          if (res.code === 10000) {
            ElMessage.success('已新增')
            dialogVisible.value = false
            emits('updateList')
          }
        })
      } else if (editType.value === 4) {
        editProject(ruleForm.value).then(res => {
          if (res.code === 10000) {
            ElMessage.success('编辑成功')
            emits('updateList', ruleForm.value)
            dialogVisible.value = false
          }
        })
      }
    }
  })
}
const handleClose = (done) => {
  emits('handleClose')
  done()
}
defineExpose({
  handleDialog
})
</script>
<style scoped lang="scss">
.description {
  height: 94px;
  :deep(textarea) {
    height: 94px;
  }
}
:deep(.el-form-item__label) {
  align-items: center;
  height: 40px;
}
:deep(.el-form-item:nth-last-of-type(1)) {
  margin-bottom: 0;
}
</style>
