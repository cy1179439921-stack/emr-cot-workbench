<template>
  <el-dialog title="重新识别" :model-value="true" label-width="auto" class="new_Dialog new_Dialog3" :width="pxToRem(552)" :before-close="closeDialog" >
    <el-form ref="ruleFormRef" :model="formData" class="new_DialogForm" :label-width="pxToRem(93)" :rules="rules">
      <el-form-item label="患者姓名：" prop="patientName">
        <el-input v-model="formData.patientName" maxlength="20" show-word-limit clearable placeholder="请填写内容"></el-input>
      </el-form-item>
      <el-form-item label="住院号：" prop="visitNumber">
        <el-input v-model="formData.visitNumber" maxlength="50" show-word-limit clearable placeholder="请填写内容"></el-input>
      </el-form-item>
      <el-form-item label="治疗类型：" prop="healingTypeList">
        <el-select v-model="formData.healingTypeList" multiple clearable collapse-tags :max-collapse-tags="2" placeholder="请选择一项" class="heigth-select">
          <el-option v-for="item in diseaseGroupOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="saveForm">确 认</el-button>
    </div>
  </el-dialog>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { diseaseOptions } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import lodash from 'lodash'
const diseaseGroupOptions = ref(diseaseOptions)
const emit = defineEmits(['close', 'reidentify'])
const porps = defineProps({
  currentData: {
    type: Object,
    required: true
  }
})
const ruleFormRef = ref(null)
const rules = ref({
  patientName: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
        } else if (/^[\u4e00-\u9fa5]+$/.test(value) === false) {
          callback(new Error('请填写中文'))
        } else {
          // 校验通过
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  visitNumber: [
    {
      validator: (rule, value, callback) => {
        const numericValue = Number(value)
        if (!value) {
          callback()
        } else if (isNaN(numericValue) && !lodash.isNil(value)) {
          callback(new Error('只能输入数字'))
        } else {
          callback()
        }
      }
    }
  ]
})

// 表单数据
const formData = reactive({
  patientName: porps.currentData?.patientName || '',
  visitNumber: porps.currentData?.visitNumber || '',
  healingTypeList: porps.currentData?.healingTypeList || []
})

const closeDialog = () => {
  emit('close')
}

const saveForm = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      emit('reidentify', { ...formData, id: porps.currentData.id })
    } else {
      return false
    }
  })
}
</script>
<style lang="scss" scoped>
.new_DialogForm {
  margin-top: 8px;
  :deep(.el-input__suffix-inner) {
    display: inline-flex;
  }
}
</style>
