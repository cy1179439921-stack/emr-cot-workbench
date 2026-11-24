<template>
  <div class="common-record-render" v-bind="$attrs">
    <el-form class="medical-form" ref="ruleFormRef" :model="localFormData">
      <template v-for="(item, index) in fieldInfo" :key="index">
        <div class="section" v-if="item.component === 'el-table'">
          <el-table ref="elTableRef" row-key="uuid" :data="localFormData[item.key]" :border="item.border" :class="item.className">
            <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
              <el-table-column :min-width="h.width" :fixed="h.fixed">
                <template #header>
                  <span>{{ h.label }}</span>
                </template>
                <template #default="scope">
                  <div v-if="h.label === '序号' || h.label === ''">
                    <div class="dragBtn"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    {{ scope.$index }}
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-input'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <el-input v-model="scope.row[h.key]" placeholder="请填写内容" v-if="h.hiddenLimit" @change="markDirty"></el-input>
                    <el-input v-model="scope.row[h.key]" maxlength="1000" show-word-limit placeholder="请填写内容" v-else @change="markDirty"></el-input>
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-select'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <div
                      class="cell-text editable-cell"
                      v-if="isLazySelect(h.key) && !isEditingCell(scope.row, h.key)"
                      @click="startEditCell(scope.row, h.key)"
                    >
                      {{ scope.row[h.key] || '' }}
                    </div>
                    <el-select v-else v-model="scope.row[h.key]" placeholder="请选择一项" popper-class="setWidthPopper" :filterable="h.allowCreate" :allow-create="h.allowCreate" clearable @change="val => handleTableSelectChange(scope.row, h.key, val)" @blur="stopEditCell">
                      <el-option v-for="enumItem in h.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                    </el-select>
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-date-picker'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <el-input
                      v-model="scope.row[h.key]"
                      placeholder="YYYY-MM-DD HH:mm"
                      :class="{ 'is-time-error': hasTimeError(scope.row, h.key) }"
                      @input="val => handleTimeInput(scope.row, h.key, val)"
                      @change="val => handleTimeInputChange(scope.row, h.key, val)"
                    ></el-input>
                  </div>
                  <div v-else-if="h.component === 'el-button'">
                    <span class="btn" @click="handleDelete(scope.$index, item.key)">
                      <i class="iconfont icon-shanchu-1"></i>
                    </span>
                    <el-tooltip class="box-item" effect="dark" content="添加一行" placement="top" v-if="h.buttonText2 === '添加一行'">
                      <i class="iconfont icon-tianjia-1" @click="addNextLine(item.key, scope.$index)"></i>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="生成一行副本" placement="top" v-if="h.buttonText3 === '生成副本'">
                      <i class="iconfont icon-shengchengfuben" @click="addNextLineWithValue(item.key, scope.$index)"></i>
                    </el-tooltip>
                  </div>
                  <div v-else>
                    {{ scope.row[h.key] }}
                  </div>
                </template>
              </el-table-column>
            </template>
          </el-table>
          <div class="addLine flexCenter" v-if="localFormData[item.key].length < item.maxCount">
            <div class="flexCenter" style="flex: 1;" @click="handleAddLine(item.key, 1, item.maxCount)">
              <i class="iconfont icon-jia"></i>
              <span>{{ item.addText }}</span>
            </div>
            <div class="flexCenter" style="flex: 1;" @click="handleAddLine(item.key, lineCount, item.maxCount)">
              添加<span>{{ lineCount }}</span>行
            </div>
            <div class="flexCenter" style="flex: 1;">
              指定行数<el-input class="setCount" v-model="lineCount"></el-input>
            </div>
          </div>
        </div>
      </template>
    </el-form>
  </div>
</template>

<script setup>
defineOptions({
  name: 'CommonAdviceEditRender',
  inheritAttrs: false
})
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Sortable from 'sortablejs'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { useMedicalStore } from '@/store/medicalStore'
import { ElMessage } from 'element-plus'

const props = defineProps({
  fieldInfo: {
    type: Object
  },
  formData: {
    type: Object
  },
  curMedicalInfo: {
    type: Object
  }
})
const emits = defineEmits(['updateFormData'])
const medicalStore = useMedicalStore()
const lineCount = ref(5)
const ruleFormRef = ref(null)
const elTableRef = ref()
const sortableInstances = ref([])
const localFormData = ref(_.cloneDeep(props.formData))
const editingCell = ref('')
const timeErrorCells = ref({})

medicalStore.setEditingMedical(localFormData.value)

const isLongAdvice = () => props.curMedicalInfo?.value === 'long_advices'
const getAdviceKey = () => isLongAdvice() ? 'long_term' : 'short_term'
const createEmptyRow = (key) => {
  if (key === 'long_term') {
    return {
      uuid: uuidv4(),
      start_time: '',
      name: '',
      type: '',
      is_drug: '',
      administration: '',
      frequency: '',
      dose_unit: '',
      end_time: ''
    }
  }
  return {
    uuid: uuidv4(),
    time: '',
    name: '',
    type: '',
    is_drug: '',
    administration: '',
    dose_unit: '',
    excute_time: ''
  }
}

const markDirty = () => {
  medicalStore.setEditingMedical(localFormData.value)
  medicalStore.setDirty(true)
}
const getCellKey = (row, key) => {
  return `${row.uuid || ''}-${key}`
}
const isEditingCell = (row, key) => {
  return editingCell.value === getCellKey(row, key)
}
const isLazySelect = (key) => {
  return ['type', 'is_drug', 'administration'].includes(key)
}
const startEditCell = (row, key) => {
  editingCell.value = getCellKey(row, key)
}
const stopEditCell = () => {
  editingCell.value = ''
}
const setTimeError = (row, key, hasError) => {
  const cellKey = getCellKey(row, key)
  if (hasError) {
    timeErrorCells.value[cellKey] = true
    return
  }
  delete timeErrorCells.value[cellKey]
}
const hasTimeError = (row, key) => {
  return Boolean(timeErrorCells.value[getCellKey(row, key)])
}
const isValidMinuteTime = (value) => {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
    return false
  }
  const [datePart, timePart] = value.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const date = new Date(year, month - 1, day, hour, minute)
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute
}
const getFirstAdviceYear = (key) => {
  const firstAdvice = localFormData.value[getAdviceKey()]?.[0] || {}
  const timeKeys = [key, 'start_time', 'end_time', 'time', 'excute_time']
  for (const timeKey of timeKeys) {
    const year = String(firstAdvice[timeKey] || '').match(/^(\d{4})/)?.[1]
    if (year) {
      return year
    }
  }
  return ''
}
const getPreviousAdviceDate = (row, key) => {
  const adviceList = localFormData.value[getAdviceKey()] || []
  const currentIndex = adviceList.findIndex(item => item.uuid === row.uuid)
  const previousAdvice = currentIndex > 0 ? adviceList[currentIndex - 1] : {}
  const timeKeys = [key, 'start_time', 'end_time', 'time', 'excute_time']
  for (const timeKey of timeKeys) {
    const date = String(previousAdvice[timeKey] || '').match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
    if (date) {
      return date
    }
  }
  return ''
}
const normalizeMinuteTime = (value, key, row) => {
  const normalizedColonValue = value.replace(/：/g, ':')
  if (/^--\d{4}$/.test(normalizedColonValue)) {
    const previousAdviceDate = getPreviousAdviceDate(row, key)
    if (!previousAdviceDate) {
      return normalizedColonValue
    }
    const shortTime = normalizedColonValue.slice(2)
    return `${previousAdviceDate} ${shortTime.slice(0, 2)}:${shortTime.slice(2, 4)}`
  }
  if (/^-\d{8}$/.test(normalizedColonValue)) {
    const firstAdviceYear = getFirstAdviceYear(key)
    if (!firstAdviceYear) {
      return normalizedColonValue
    }
    const shortTime = normalizedColonValue.slice(1)
    return `${firstAdviceYear}-${shortTime.slice(0, 2)}-${shortTime.slice(2, 4)} ${shortTime.slice(4, 6)}:${shortTime.slice(6, 8)}`
  }
  if (!/^\d{12}$/.test(normalizedColonValue)) {
    return normalizedColonValue
  }
  return `${normalizedColonValue.slice(0, 4)}-${normalizedColonValue.slice(4, 6)}-${normalizedColonValue.slice(6, 8)} ${normalizedColonValue.slice(8, 10)}:${normalizedColonValue.slice(10, 12)}`
}
const handleTimeInput = (row, key, val) => {
  if (isValidMinuteTime(val)) {
    setTimeError(row, key, false)
  }
}
const handleTimeInputChange = (row, key, val) => {
  const normalizedValue = normalizeMinuteTime(val, key, row)
  if (normalizedValue !== val) {
    row[key] = normalizedValue
  }
  if (!isValidMinuteTime(normalizedValue)) {
    setTimeError(row, key, true)
    ElMessage.warning('时间格式不对，请按 2024-01-01 09:00 填写')
    return
  }
  setTimeError(row, key, false)
  markDirty()
}
const handleTableSelectChange = (row, key, val) => {
  if (key === 'type') {
    row.is_drug = val === '药品' ? '是' : '否'
  }
  if (isLazySelect(key)) {
    stopEditCell()
  }
  markDirty()
}
const handleDelete = (index, key) => {
  localFormData.value[key].splice(index, 1)
  markDirty()
}
const handleAddLine = (key, count, maxCount) => {
  const addCount = Number(count) || 0
  if (addCount <= 0) {
    ElMessage.warning('请填写要添加的行数（正整数）')
    return
  }
  if (localFormData.value[key].length + addCount > maxCount) {
    ElMessage.warning(`最多只能添加${maxCount}行`)
    return
  }
  for (let i = 0; i < addCount; i++) {
    localFormData.value[key].push(createEmptyRow(key))
  }
  markDirty()
}
const addNextLine = (key, index) => {
  localFormData.value[key].splice(index + 1, 0, createEmptyRow(key))
  markDirty()
  ElMessage.success('已新增')
  nextTick(() => {
    emits('updateFormData', index)
  })
}
const addNextLineWithValue = (key, index) => {
  const currentRow = localFormData.value[key][index]
  localFormData.value[key].splice(index + 1, 0, {
    ..._.cloneDeep(currentRow),
    uuid: uuidv4()
  })
  markDirty()
  ElMessage.success('已新增')
  nextTick(() => {
    emits('updateFormData', index)
  })
}

const destroySort = (tableIndex) => {
  const sortable = sortableInstances.value[tableIndex]
  if (sortable) {
    sortable.destroy()
    sortableInstances.value[tableIndex] = null
  }
}
const destroyAllSorts = () => {
  sortableInstances.value.forEach((sortable, tableIndex) => {
    if (sortable) {
      sortable.destroy()
      sortableInstances.value[tableIndex] = null
    }
  })
}
const setSort = (tableIndex, key) => {
  const el = elTableRef.value?.[tableIndex]?.$el.querySelector('tbody')
  if (!el) {
    return
  }
  destroySort(tableIndex)
  sortableInstances.value[tableIndex] = new Sortable(el, {
    handle: '.dragBtn',
    animation: 180,
    delay: 0,
    onEnd: (e) => {
      const targetRow = localFormData.value[key].splice(e.oldIndex, 1)
      localFormData.value[key].splice(e.newIndex, 0, targetRow[0])
      markDirty()
    }
  })
}
const validateForm = () => {
  return new Promise((resolve) => {
    ruleFormRef.value.validate((valid) => {
      resolve(valid)
    })
  })
}

onMounted(() => {
  setSort(0, getAdviceKey())
})
onBeforeUnmount(() => {
  destroyAllSorts()
})

defineExpose({
  validateForm
})
</script>

<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.addLine {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  margin-top: 12px;
  border: 1px dashed #d8d8d8;
  cursor: pointer;
  font-weight: 500;
  color: #3670f8;
  i {
    font-size: 20px;
  }
}
.icon-tianjia-1,
.icon-shengchengfuben {
  margin-left: 4px;
  cursor: pointer;
}
.editable-cell {
  min-height: 28px;
  border-radius: 2px;
  // border: 1px solid #d8d8d8;
  box-shadow: 0 0 0 1px #d8d8d8 inset;
  cursor: pointer;
  line-height: 28px;
}
:deep(.is-time-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}
</style>

<style lang="scss">
.setWidthPopper {
  .el-select-dropdown__footer {
    .el-input__wrapper {
      margin-bottom: 8px;
    }
  }
}
</style>
