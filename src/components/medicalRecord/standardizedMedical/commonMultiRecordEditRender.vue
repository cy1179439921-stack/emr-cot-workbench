<template>
  <div class="common-record-render">
    <el-form class="medical-form" ref="ruleFormRef" :model="localFormData">
      <template v-for="(item, index) in fieldInfo" :key="index">
        <header class="time-header" v-if="item.label === '时间轴'">
          <div class="time-card timeline-card">
            <span class="label">时间</span>
            <el-date-picker v-model="localFormData[item.key]" :type="item.type ? item.type : 'datetime'" :format="item.customFormat ? item.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="item.customFormat ? item.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" placeholder="请选择一项"></el-date-picker>
          </div>
        </header>
      </template>
      <div class="main-content">
        <template v-for="(item, index) in fieldInfo" :key="index">
          <div class="section" v-if="item.label!== '时间轴'">
            <div class="section-title" v-if="item.label">
              <div class="line"></div>
              <!-- <div v-if="item.component === 'labelWithContent'">{{item.label}}：{{localFormData[item.key]}}</div> -->
              <div>{{item.label}}</div>
            </div>
            <div class="commonUl-li" v-if="item.component === 'ul-li'">
              <ul :class="'ul-' + item.rowCount">
                <li v-for="(li, liIndex) in item.children" :key="li.label + liIndex" :class="{'width100': li.type === 'textarea'}">
                  <el-form-item class="custom-form-item" :label="li.label + '：'"
                                label-width="100%" label-position="left">
                    <el-input :type="li.type" :maxlength="li.type === 'textarea'? 10000 : 200" show-word-limit v-model="localFormData[li.key]" placeholder="请填写内容" :disabled="!userStore.platInfo.isSensitiveInfo && ['查房医生'].includes(li.label)" v-if="li.component === 'el-input'"></el-input>
                    <el-select v-model="localFormData[li.key]" placeholder="请选择一项" v-if="li.component === 'el-select'">
                      <el-option v-for="enumItem in li.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                    </el-select>
                    <el-date-picker v-model="localFormData[li.key]" :type="li.type ? li.type : 'datetime'" :format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" v-if="li.component === 'el-date-picker'" placeholder="请选择一项"></el-date-picker>
                  </el-form-item>
                </li>
              </ul>
            </div>
            <el-form-item class="custom-form-item" v-if="['singleDiv', 'singleDivArray'].includes(item.component)">
              <el-input :autosize="{ minRows: 2 }" type="textarea" maxlength="10000" show-word-limit v-model="localFormData[item.key]" placeholder="请填写内容"></el-input>
            </el-form-item>
            <el-table ref="elTableRef" row-key="uuid" :data="localFormData[item.key]" :border="item.border" class="proof-table" :class="item.className" v-if="item.component === 'el-table'">
              <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
                <el-table-column :min-width="h.editWidth || h.width">
                  <template #header>
                    <span>{{h.label}}</span>
                  </template>
                  <template #default="scope">
                    <!-- <div class="tag" v-if="h.isTag">
                      <span class="circle"></span>
                      <span class="text">{{ scope.row[h.key] || '-'}}</span>
                      <span class="arrow" v-if="scope.row[h.key] === '高'"><i class="iconfont icon-shang"></i></span>
                      <span class="arrow" v-if="scope.row[h.key] === '低'"><i class="iconfont icon-xia"></i></span>
                    </div> -->
                    <div v-if="h.label === '序号'">
                      <div class="dragBtn"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                      {{scope.$index}}
                    </div>
                    <div v-else-if="h.component === 'el-input'">
                      <el-input v-model="scope.row[h.key]" maxlength="200" @input="curMedicalInfo.title === '实验室检查' ? handleInput(scope.row, h.key, $event) : ''" show-word-limit placeholder="请填写内容"></el-input>
                    </div>
                    <div v-else-if="h.component === 'el-button'">
                      <span class="btn" @click="handleEdit(scope.row, scope.$index, item.key)">删除</span>
                    </div>
                    <div v-else>
                      {{scope.row[h.key]}}
                    </div>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            <div class="addLine flexCenter" v-if="item.component === 'el-table' && localFormData[item.key].length < item.maxCount" @click="handleAddLine(item.key)">
              <i class="iconfont icon-jia"></i>
              <span>{{item.addText}}</span>
            </div>
          </div>
        </template>
      </div>
    </el-form>

  </div>
</template>
<script setup>
defineOptions({
  name: 'commonMultiRecordEditRender',
  inheritAttrs: false
})
import { ref, watch, onMounted } from 'vue'
import Sortable from 'sortablejs'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
// 基本信息
const props = defineProps({
  curMedicalInfo: {
    type: Object
  },
  lightQuery: {
    type: String
  },
  fieldInfo: {
    type: Object
  },
  singleFormData: {
    type: Object
  },
  formData: {
    type: Array
  }
})
// const emit = defineEmits(['updateFormData'])
const localFormData = ref(_.cloneDeep(props.singleFormData))
// medicalStore.setEditingMedical(props.formData)
// 直接赋值props.formData会出错，应该用medicalStore.editingMedical数组与props.formData数组作对比，如果有相同的uuid，则取medicalStore.editingMedical的对应项，否则取props.formData的对应项，最后组合一个新的数组赋值给medicalStore.setEditingMedical
// if (props.formData.length > 1) {
const savedData = _.cloneDeep(props.formData)
const editingData = _.cloneDeep(medicalStore.editingMedical)
// 如果editingData为空，或editingData不是数组（残留上个病历类型的数据），则直接赋值props.formData
if (!editingData || !Array.isArray(editingData)) {
  medicalStore.setEditingMedical(props.formData)
} else {
  // 对比editingData，如果editingData中存在savedData的uuid，则把值赋给savedData的对应项
  savedData.forEach(item => {
    const index = editingData.findIndex(editItem => editItem.uuid === item.uuid)
    if (index > -1) {
      savedData.splice(index, 1, editingData[index])
    }
  })
  medicalStore.setEditingMedical(savedData)
}
// } else {
//   medicalStore.setEditingMedical(props.formData)
// }
watch(localFormData, (newVal) => {
  // 获取已经保存的临时数据
  const savedData = _.cloneDeep(medicalStore.editingMedical)
  // 找到修改的哪一次的查房记录
  const index = savedData.findIndex(item => item.uuid === newVal.uuid)
  // 替换掉数组的某个索引的值
  savedData.splice(index, 1, newVal)
  console.log('savedData', savedData)
  medicalStore.setEditingMedical(savedData)
}, { deep: true })

// 删除该行
const handleEdit = (row, index, key) => {
  localFormData.value[key].splice(index, 1)
}
// 添加一行
const handleAddLine = (key) => {
  console.log(4, key)
  if (key === 'operations') {
    localFormData.value[key].push({
      uuid: uuidv4(),
      operation_code: '',
      operation_time: '',
      operation_name: ''
    })
  } else if (key === 'content') {
    localFormData.value[key].push({
      uuid: uuidv4(),
      // index: localFormData.value[key].length + 1,
      name: '',
      value: '',
      state: '',
      range: '',
      unit: ''
    })
  }
}
const elTableRef = ref()
const setSort = () => {
  if (elTableRef?.value?.length > 0) {
    const el = elTableRef?.value[0]?.$el.querySelector('tbody')
    // eslint-disable-next-line no-new
    new Sortable(el, {
      handle: '.dragBtn',
      animation: 180,
      delay: 0,
      onEnd: (e) => {
        const targetRow = localFormData.value.content.splice(e.oldIndex, 1)
        localFormData.value.content.splice(e.newIndex, 0, targetRow[0])
      }
    })
  }
}
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}
onMounted(() => {
  setSort()
})
const isValidRange = (range) => {
  // 正则表达式匹配区间模式，例如：-3.2-10.2，-3.2-1，10.3-23.2 或 0.3--4.8
  const intervalPattern = /^-?\d+(\.\d+)?\s*-\s*(-?\d+(\.\d+)?)$/
  // 正则表达式匹配大于某个值的模式，例如：>-3.2
  const greaterThanPattern = /^>\s*-?\d+(\.\d+)?$/
  // 正则表达式匹配小于某个值的模式，例如：<-3.2
  const lessThanPattern = /^<\s*-?\d+(\.\d+)?$/
  let type = 0
  if (intervalPattern.test(range)) {
    type = 1
  } else if (greaterThanPattern.test(range)) {
    type = 2
  } else if (lessThanPattern.test(range)) {
    type = 3
  }
  return type
}
const convertRange = (range) => {
  if (range.startsWith('-')) {
    return '-' + range.replace('-', '').replace('-', '&&')
  } else if (range.includes('--')) {
    return range.replace('--', '&&')
  } else if (range.includes('-') && range.split('-').length === 2) {
    return range.replace('-', '&&')
  }
  return range
}
// 判断一个值是否是数值类型
const isNumeric = (value) => {
  if (value === '') {
    return false
  }
  return !isNaN(value) && !isNaN(parseFloat(value))
}
// 需要加判断
const handleInput = (row, key, e) => {
  if (!['value', 'range'].includes(key)) {
    return false
  }
  // 首先判断参考范围是不是标准的，如是否是区间，是否是>某个值，是否是<某个值
  // 然后根据参考范围，判断输入的值是否合法
  // 合法则保存，不合法则提示错误
  if (!row.value.trim()) {
    row.state = '不正常'
    return false
  }
  let range = row.range
  const type = isValidRange(range)
  if (type > 0) {
    const numValue = Number(row.value)
    if (!isNumeric(numValue)) {
      console.log('不是有效数值')
      row.state = '不正常'
      return
    }
    // 区间模式
    if (type === 1) {
      // 如果range中间有2个--, 则转为一个-
      range = convertRange(range)
      console.log('换后', range)
      // 判断区间
      const [start, end] = range.split('&&').map(Number)
      console.log('start', start)
      console.log('end', end)
      console.log('numValue', numValue)
      if (isNumeric(start) && isNumeric(end)) {
        if (numValue < start) {
          row.state = '低'
        } else if (numValue > end) {
          row.state = '高'
        } else {
          row.state = '正常'
        }
      } else {
        console.log('不是有效区间')
        row.state = '不正常'
      }
    } else if (type === 2) {
      const start = Number(range.replace('>', ''))
      if (numValue > start) {
        row.state = '正常'
      } else {
        row.state = '低'
      }
    } else if (type === 3) {
      const end = Number(range.replace('<', ''))
      if (numValue < end) {
        row.state = '正常'
      } else {
        row.state = '高'
      }
    }
  } else if (['阴', '阴性'].includes(range)) {
    if (row.value === '阴' || row.value === '阴性' || row.value === '-') {
      row.state = '正常'
    } else {
      row.state = '不正常'
    }
  } else if (['阳', '阳性'].includes(range)) {
    if (row.value === '阳' || row.value === '阳性' || row.value === '+') {
      row.state = '正常'
    } else {
      row.state = '不正常'
    }
  } else {
    row.state = '不正常'
    console.log('无效的')
  }
  console.log('修改后', row.state)
}

</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.timeline-card {
  box-sizing: border-box;
  width: 50%;
  padding-left: 0 !important;
  padding-right: 20px;
  background-color: var(--theme-card) !important;
  color: var(--theme-text) !important;
  .label {
    margin-right: 10px;
  }
  :deep(.el-date-editor) {
    flex: 1;
  }
}
.main-content {
  overflow: hidden;
  margin-top: 16px;
  padding: 0 16px 24px;
  border-radius: 6px;
  background-color: var(--theme-fill);
  .el-form-item {
    margin-bottom: 0 !important;
  }
}
.addLine {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  margin-top: 12px;
  border: 1px dashed #d8d8d8;
  cursor: pointer;
  font-weight: 500;
  color: var(--theme-primary);
  i {
    font-size: 20px;
  }
}
:deep(.proof-table) {
  .el-table__body {
    .el-input {
      .el-input__wrapper {
        padding: 6px;
      }
    }
  }
}
</style>
