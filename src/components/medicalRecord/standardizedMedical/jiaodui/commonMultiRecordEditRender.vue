<template>
  <div class="common-record-render">
    <el-form class="medical-form" ref="ruleFormRef" :model="localFormData">
      <template v-for="(item, index) in fieldInfo" :key="index">
        <header class="time-header" v-if="item.label === '时间轴'" :id="childId">
          <div class="time-card timeline-card">
            <span class="label">时间</span>
            <el-date-picker v-model="localFormData[item.key]" :type="item.type ? item.type : 'datetime'" :format="item.customFormat ? item.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="item.customFormat ? item.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" placeholder="请选择一项" @change="markDirty"></el-date-picker>
          </div>
        </header>
      </template>
      <div class="main-content">
        <slot></slot>
        <template v-for="(item, index) in fieldInfo" :key="index">
          <div class="section" v-if="item.label!== '时间轴'">
            <div class="section-title" v-if="item.label">
              <div class="line"></div>
              <!-- <div v-if="item.component === 'labelWithContent'">{{item.label}}：{{localFormData[item.key]}}</div> -->
              <div>{{item.label}}</div>
              <el-button type="primary" link v-if="item.buttonText1" style="margin-left: 12px;" @click="handleButtonClick(item.buttonText1, item.buttonTextKey1)">{{item.buttonText1}}</el-button>
              <el-button type="primary" link v-if="item.buttonText2" @click="handleButtonClick(item.buttonText2, item.buttonTextKey2)">{{item.buttonText2}}</el-button>

              <el-input
                v-model="nameTextarea"
                style="flex: 1;"
                :rows="2"
                type="textarea"
                placeholder="请填写内容"
                v-if="item.hasInput"
              />
            </div>
            <div class="commonUl-li" v-if="item.component === 'ul-li'">
              <ul :class="'ul-' + item.rowCount">
                <li v-for="(li, liIndex) in item.children" :key="li.label + liIndex" :class="{'width100': li.type === 'textarea'}">
                  <el-form-item class="custom-form-item" :label="li.label + '：'"
                                label-width="100%" label-position="left">
                    <el-input :type="li.type" :maxlength="li.type === 'textarea'? 10000 : 200" show-word-limit v-model="localFormData[li.key]" placeholder="请填写内容" v-if="li.component === 'el-input'" @change="markDirty"></el-input>
                    <el-select v-model="localFormData[li.key]" placeholder="请选择一项" v-if="li.component === 'el-select'" :filterable="li.allowCreate" :allow-create="li.allowCreate" clearable @change="markDirty">
                      <el-option v-for="enumItem in li.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                    </el-select>
                    <el-date-picker v-model="localFormData[li.key]" :type="li.type ? li.type : 'datetime'" :format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" v-if="li.component === 'el-date-picker'" placeholder="请选择一项" @change="markDirty"></el-date-picker>
                  </el-form-item>
                </li>
              </ul>
            </div>
            <el-form-item class="custom-form-item" v-if="['singleDiv', 'singleDivArray'].includes(item.component)">
              <el-input :autosize="{ minRows: 2 }" type="textarea" :maxlength="item.maxlength || 10000" show-word-limit v-model="localFormData[item.key]" placeholder="请填写内容" @change="markDirty"></el-input>
            </el-form-item>
            <el-form-item class="custom-form-item" v-if="['el-select'].includes(item.component)">
              <el-select v-model="localFormData[item.key]" filterable allow-create placeholder="请选择一项" popper-class="setWidthPopper" clearable @change="markDirty">
                <el-option v-for="enumItem in item.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
              </el-select>
            </el-form-item>
            <el-table ref="elTableRef" row-key="uuid" :data="localFormData[item.key]" :border="item.border" class="proof-table" :class="item.className" v-if="item.component === 'el-table' && !leftRightMode">
              <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
                <el-table-column :min-width="h.editWidth || h.width">
                  <template #header>
                    <span>{{h.label}}</span>
                  </template>
                  <template #default="scope">
                    <div v-if="h.label === '序号'">
                      <div class="dragBtn"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                      {{scope.$index}}
                    </div>
                    <div v-else-if="h.component === 'el-input'" style="width: 100%;">
                      <el-input v-model="scope.row[h.key]" @change="handleTableInput(scope.row, h.key, $event)" placeholder="请填写内容" v-if="h.hiddenLimit"></el-input>
                      <el-input v-model="scope.row[h.key]" maxlength="200" @change="handleTableInput(scope.row, h.key, $event)" show-word-limit placeholder="请填写内容" v-else></el-input>
                    </div>
                    <div v-else-if="h.component === 'el-button'">
                      <span class="btn" @click="handleEdit(scope.row, scope.$index, item.key)">
                        <i class="iconfont icon-shanchu-1"></i>
                      </span>
                      <span class="add" @click="handleAddLine(item.key, 1, item.maxCount, true, scope.$index)">
                        <i class="iconfont icon-tianjia-1"></i>
                      </span>
                    </div>
                    <div class="td-div" v-else-if="h.component === 'el-select'">
                      <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                      <el-select v-model="scope.row[h.key]" placeholder="请选择一项" v-if="h.component === 'el-select'" popper-class="setWidthPopper" :filterable="h.allowCreate" :allow-create="h.allowCreate" clearable @change="markDirty">
                        <el-option v-for="enumItem in h.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                      </el-select>
                    </div>
                    <div v-else>
                      {{scope.row[h.key]}}
                    </div>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            <div class="dual-table-container" v-if="item.component === 'el-table' && leftRightMode">
              <!-- 左侧表格 -->
              <el-table ref="leftTableRef" row-key="uuid"
                        :data="getLeftTableData(localFormData[item.key])"
                        :border="item.border"
                        class="proof-table left-table">
                <template v-for="(h, hIndex) in item.header" :key="'th-left' + hIndex">
                  <el-table-column :min-width="h.editWidth || h.width">
                    <template #header>
                      <span>{{h.label}}</span>
                    </template>
                    <template #default="scope">
                      <!-- 序号列特殊处理 -->
                      <div v-if="h.label === '序号'">
                        <div class="dragBtn"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                        {{ getDisplayIndex(scope.$index, 0) }}
                      </div>
                      <!-- 输入框组件 -->
                      <div v-else-if="h.component === 'el-input'">
                        <el-input v-model="scope.row[h.key]"
                                  @change="handleTableInput(scope.row, h.key, $event)"
                                  placeholder="请填写内容" v-if="h.hiddenLimit"></el-input>
                        <el-input v-model="scope.row[h.key]"
                                  maxlength="200"
                                  @change="handleTableInput(scope.row, h.key, $event)"
                                  placeholder="请填写内容" v-else></el-input>
                      </div>
                      <!-- 按钮组件 -->
                      <div v-else-if="h.component === 'el-button'">
                        <span class="btn" @click="handleEdit(scope.row, getOriginalIndex(scope.$index, 0), item.key)">
                          <i class="iconfont icon-shanchu-1"></i>
                        </span>
                        <span class="add" @click="handleAddLine(item.key, 1, item.maxCount, true, getOriginalIndex(scope.$index, 0))">
                          <i class="iconfont icon-tianjia-1"></i>
                        </span>
                      </div>
                      <div class="td-div" v-else-if="h.component === 'el-select'">
                        <el-select v-model="scope.row[h.key]" placeholder="请选择一项" v-if="h.component === 'el-select'" popper-class="setWidthPopper" :filterable="h.allowCreate" :allow-create="h.allowCreate" clearable @change="markDirty">
                          <el-option v-for="enumItem in h.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                        </el-select>
                      </div>
                      <!-- 普通文本 -->
                      <div v-else>
                        {{scope.row[h.key]}}
                      </div>
                    </template>
                  </el-table-column>
                </template>
              </el-table>

              <!-- 右侧表格 -->
              <el-table ref="rightTableRef" row-key="uuid"
                        :data="getRightTableData(localFormData[item.key])"
                        :border="item.border"
                        class="proof-table right-table">
                <template v-for="(h, hIndex) in item.header" :key="'th-right' + hIndex">
                  <el-table-column :min-width="h.editWidth || h.width">
                    <template #header>
                      <span>{{h.label}}</span>
                    </template>
                    <template #default="scope">
                      <div v-if="h.label === '序号'">
                        <div class="dragBtn"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                        {{ getDisplayIndex(scope.$index, 1) }}
                      </div>
                      <div v-else-if="h.component === 'el-input'">
                        <el-input v-model="scope.row[h.key]"
                                  maxlength="200"
                                  @change="handleTableInput(scope.row, h.key, $event)"
                                  placeholder="请填写内容" v-if="h.hiddenLimit"></el-input>
                        <el-input v-model="scope.row[h.key]"
                                  @change="handleTableInput(scope.row, h.key, $event)"
                                  placeholder="请填写内容" v-else></el-input>
                      </div>
                      <div v-else-if="h.component === 'el-button'">
                        <span class="btn" @click="handleEdit(scope.row, getOriginalIndex(scope.$index, 1), item.key)">
                          <i class="iconfont icon-shanchu-1"></i>
                        </span>
                        <span class="add" @click="handleAddLine(item.key, 1, item.maxCount, true, getOriginalIndex(scope.$index, 1))">
                          <i class="iconfont icon-tianjia-1"></i>
                        </span>
                      </div>
                      <div class="td-div" v-else-if="h.component === 'el-select'">
                        <el-select v-model="scope.row[h.key]" placeholder="请选择一项" v-if="h.component === 'el-select'" popper-class="setWidthPopper" :filterable="h.allowCreate" :allow-create="h.allowCreate" clearable @change="markDirty">
                          <el-option v-for="enumItem in h.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                        </el-select>
                      </div>
                      <div v-else>
                        {{scope.row[h.key]}}
                      </div>
                    </template>
                  </el-table-column>
                </template>
              </el-table>
            </div>
            <div class="addLine flexCenter" v-if="item.component === 'el-table' && localFormData[item.key].length < item.maxCount" style="display: flex; justify-content: space-between; align-items: center;">
              <div class="flexCenter" style="flex: 1;" @click="handleAddLine(item.key, 1, item.maxCount)">
                <i class="iconfont icon-jia"></i>
                <span>{{item.addText}}</span>
              </div>
              <div class="flexCenter" style="flex: 1;" @click="handleAddLine(item.key, lineCount, item.maxCount)">
                添加<span>{{lineCount}}</span>
                行
              </div>
              <div class="flexCenter" style="flex: 1;">
                指定行数<el-input class="setCount" v-model="lineCount"></el-input>
              </div>
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
import { ref, onMounted } from 'vue'
import Sortable from 'sortablejs'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { ElMessage } from 'element-plus'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
const lineCount = ref(5)
const leftRightMode = ref(false)
const intervalMode = ref(false)
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
  },
  otherInfo: {
    type: Object
  },
  childId: {
    type: String,
    default: ''
  }
})
const localFormData = ref(_.cloneDeep(props.singleFormData))
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
const syncEditingMedical = () => {
  const savedData = Array.isArray(medicalStore.editingMedical)
    ? [...medicalStore.editingMedical]
    : _.cloneDeep(props.formData)
  const index = savedData.findIndex(item => item.uuid === localFormData.value.uuid)
  if (index > -1) {
    savedData.splice(index, 1, localFormData.value)
  } else {
    savedData.push(localFormData.value)
  }
  medicalStore.setEditingMedical(savedData)
}

const markDirty = () => {
  syncEditingMedical()
  medicalStore.setDirty(true)
}

// 删除该行
const handleEdit = (row, index, key) => {
  localFormData.value[key].splice(index, 1)
  markDirty()
}
// 添加一行
const handleAddLine = (key, count, maxCount, isNextLine, curLineIndex) => {
  if (localFormData.value[key].length + Number(count) > maxCount) {
    ElMessage.warning(`最多只能添加${maxCount}行`)
    return
  }
  if (key === 'operations') {
    // 根据count添加count行
    for (let i = 0; i < count; i++) {
      localFormData.value[key].push({
        uuid: uuidv4(),
        operation_code: '',
        operation_time: '',
        operation_name: ''
      })
    }
  } else if (key === 'content') {
    for (let i = 0; i < count; i++) {
      const newRow = {
        uuid: uuidv4(),
        name: '',
        value: '',
        state: '',
        range: '',
        unit: ''
      }
      if (isNextLine) {
        // 添加到下一行
        localFormData.value[key].splice(curLineIndex + 1, 0, newRow)
      } else {
        // 添加到末尾
        localFormData.value[key].push(newRow)
      }
    }
  }
  markDirty()
}
const elTableRef = ref()
const leftTableRef = ref()
const rightTableRef = ref()
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
        markDirty()
      }
    })
  }
}
const setSort2 = () => {
  const groupName = 'lab-table-group'

  if (leftTableRef?.value?.length > 0) {
    const el = leftTableRef?.value[0]?.$el.querySelector('tbody')
    // eslint-disable-next-line no-new
    new Sortable(el, {
      handle: '.dragBtn',
      group: groupName,
      animation: 180,
      delay: 0,
      onEnd: (e) => {
        handleDragEnd(e)
      }
    })
  }
  if (rightTableRef?.value?.length > 0) {
    const el = rightTableRef?.value[0]?.$el.querySelector('tbody')
    // eslint-disable-next-line no-new
    new Sortable(el, {
      handle: '.dragBtn',
      group: groupName,
      animation: 180,
      delay: 0,
      onEnd: (e) => {
        handleDragEnd(e)
      }
    })
  }
}

const rebuildContentByMode = (leftRows, rightRows) => {
  if (!intervalMode.value) {
    return [...leftRows, ...rightRows]
  }
  const rebuilt = []
  rightRows.forEach((row, index) => {
    if (leftRows[index]) {
      rebuilt.push(leftRows[index])
    }
    rebuilt.push(row)
  })
  rebuilt.push(...leftRows.slice(rightRows.length))
  return rebuilt
}

// 处理拖拽结束事件（支持跨表格拖拽）
const handleDragEnd = (e) => {
  const content = localFormData.value.content

  // 判断来源和目标表格
  const fromLeft = e.from === leftTableRef?.value?.[0]?.$el.querySelector('tbody')
  const toLeft = e.to === leftTableRef?.value?.[0]?.$el.querySelector('tbody')
  const leftRows = getLeftTableIndexes(content).map(index => content[index]).filter(Boolean)
  const rightRows = getRightTableIndexes(content).map(index => content[index]).filter(Boolean)
  const fromRows = fromLeft ? leftRows : rightRows
  const toRows = toLeft ? leftRows : rightRows
  const targetRows = fromRows.splice(e.oldIndex, 1)
  const targetRow = targetRows[0]
  if (!targetRow) {
    return
  }

  toRows.splice(e.newIndex, 0, targetRow)
  if (fromLeft !== toLeft) {
    if (fromLeft && !toLeft) {
      leftLength.value = Math.max((Number(leftLength.value) || 0) - 1, 0)
      rightLength.value = (Number(rightLength.value) || 0) + 1
    } else if (!fromLeft && toLeft) {
      leftLength.value = (Number(leftLength.value) || 0) + 1
      rightLength.value = Math.max((Number(rightLength.value) || 0) - 1, 0)
    }
    emit('dragLengthChange', { leftLength: leftLength.value, rightLength: rightLength.value })
  }
  content.splice(0, content.length, ...rebuildContentByMode(leftRows, rightRows))
  markDirty()
}
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}
onMounted(() => {
  setSort()
})

const isValidRange = (range) => {
  // 正则表达式匹配区间模式，例如：-3.2-10.2，-3.2-1，10.3-23.2 或 0.3--4.8
  const intervalPattern = /^-?\d+(\.\d+)?[-~～]{1,2}-?\d+(\.\d+)?$/
  // 正则表达式匹配大于某个值的模式，例如：>-3.2
  const greaterThanPattern = /^>\s*-?\d+(\.\d+)?$/
  // 正则表达式匹配小于某个值的模式，例如：<-3.2
  const lessThanPattern = /^<\s*-?\d+(\.\d+)?$/
  // 正则表达式匹配大于某个值的模式，例如：≥-3.2
  const greaterThanOrEqualPattern = /^(>=|≥)\s*-?\d+(\.\d+)?$/
  // 正则表达式匹配小于某个值的模式，例如：≤-3.2
  const lessThanOrEqualPattern = /^(<=|≤)\s*-?\d+(\.\d+)?$/
  let type = 0 // 默认文字模式
  if (intervalPattern.test(range)) {
    type = 1 // 区间模式
  } else if (greaterThanPattern.test(range)) {
    type = 2 // 大于某个值的模式
  } else if (lessThanPattern.test(range)) {
    type = 3 // 小于某个值的模式
  } else if (greaterThanOrEqualPattern.test(range)) {
    type = 4 // 大于等于某个值的模式
  } else if (lessThanOrEqualPattern.test(range)) {
    type = 5 // 小于等于某个值的模式
  }
  return type
}
// 统一区间符号
const convertRange = (range) => {
  if (range.includes('--')) { // 优先判断--，防止负数开头
    return range.replace('--', '&&')
  } else if (range.startsWith('-')) {
    return '-' + range.replace('-', '').replace('-', '&&')
  } else if (range.includes('-') && range.split('-').length === 2) {
    return range.replace('-', '&&')
  } else if (range.includes('~')) {
    return range.replace('~', '&&')
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
  if (!row.value?.trim()) {
    row.state = '不正常'
    return false
  } else if ((row.value?.trim() && !row.range) || (row.value === '-')) { // 没有参考值，则状态为-
    row.state = '-'
    return false
  }
  let range = row.range
  const type = isValidRange(range)
  if (type > 0) {
    const numValue = Number(row.value)
    if (!isNumeric(numValue)) {
      row.state = '不正常'
      return
    }
    // 区间模式
    if (type === 1) {
      // 统一range为&&分隔的形式
      range = convertRange(range)
      // 判断区间
      const [start, end] = range.split('&&').map(Number)
      if (isNumeric(start) && isNumeric(end)) {
        if (numValue < start) {
          row.state = '低'
        } else if (numValue > end) {
          row.state = '高'
        } else {
          row.state = '正常'
        }
      } else {
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
    } else if (type === 4) {
      const start = Number(range.replace('>=', '').replace('≥', ''))
      if (numValue >= start) {
        row.state = '正常'
      } else {
        row.state = '低'
      }
    } else if (type === 5) {
      const end = Number(range.replace('<=', '').replace('≤', ''))
      if (numValue <= end) {
        row.state = '正常'
      } else {
        row.state = '高'
      }
    }
  } else if (['阴', '阴性', '阴性(-)', '阴性（-）', '阴性-', '-'].includes(range)) {
    row.state = ['阴', '阴性', '-', '阴性(-)', '阴性（-）', '阴性-'].includes(row.value) ? '正常' : '不正常'
  } else if (['阳', '阳性', '阳性(+)', '阳性（+）', '阳性+', '+'].includes(range)) {
    row.state = ['阳', '阳性', '+', '阳性(+)', '阳性（+）', '阳性+'].includes(row.value) ? '正常' : '不正常'
  } else if (['Normal/正常'].includes(range)) {
    row.state = ['Normal/正常', '正常', 'Normal'].includes(row.value) ? '正常' : '不正常'
  } else if (row.value === range) { // 纯文字模式，值与参考范围完全相同,如大便颜色 尿液颜色等
    row.state = '正常'
  } else if (range.includes('或')) {
    const values = range.split('或')
    if (values.includes(row.value) || row.value === '未见') {
      row.state = '正常'
    } else {
      row.state = '不正常'
    }
  } else if (range === '无') {
    if (row.value === '未见') {
      row.state = '正常'
    } else {
      row.state = '不正常'
    }
  } else {
    row.state = '不正常'
  }
}

const handleTableInput = (row, key, e) => {
  if (props.curMedicalInfo?.title === '实验室检查') {
    handleInput(row, key, e)
  }
  markDirty()
}
// 存储值/使用值
const handleButtonClick = (buttonText, buttonKey) => {
  if (buttonText.includes('存储')) {
    if (localFormData.value[buttonKey].trim() === '') {
      ElMessage.warning('请先选择科室')
      return
    }
    localStorage.setItem(buttonKey, localFormData.value[buttonKey])
    ElMessage.success('已保存')
  } else if (buttonText.includes('使用')) {
    if (localStorage.getItem(buttonKey)) {
      localFormData.value[buttonKey] = localStorage.getItem(buttonKey)
      markDirty()
    } else {
      ElMessage.warning('还没有保存过科室信息')
    }
  }
}

const getLeftTableIndexes = (data) => {
  const leftLen = Number(leftLength.value) || 0
  if (!intervalMode.value) {
    return data.reduce((indexes, row, index) => {
      if (index < leftLen && row) {
        indexes.push(index)
      }
      return indexes
    }, [])
  }
  const rightLen = Number(rightLength.value) || 0
  return data.reduce((indexes, row, index) => {
    if (row && (index >= rightLen * 2 || index % 2 === 0)) {
      indexes.push(index)
    }
    return indexes
  }, [])
}

const getRightTableIndexes = (data) => {
  const leftLen = Number(leftLength.value) || 0
  const rightLen = Number(rightLength.value) || 0
  if (!intervalMode.value) {
    return data.reduce((indexes, row, index) => {
      if (index >= leftLen && index < leftLen + rightLen && row) {
        indexes.push(index)
      }
      return indexes
    }, [])
  }
  return data.reduce((indexes, row, index) => {
    if (row && index < rightLen * 2 && index % 2 === 1) {
      indexes.push(index)
    }
    return indexes
  }, [])
}

// 获取左侧表格数据
const getLeftTableData = (data) => {
  if (!leftLength.value || leftLength.value === 0) {
    // 初始化：取一半作为左侧
    leftLength.value = Math.ceil(data.length / 2)
  }
  return getLeftTableIndexes(data).map(index => data[index])
}

// 获取右侧表格数据
const getRightTableData = (data) => {
  if (!rightLength.value || rightLength.value === 0) {
    // 初始化：剩余部分作为右侧
    rightLength.value = data.length - leftLength.value
  }
  return getRightTableIndexes(data).map(index => data[index])
}

// 计算原始数据索引
const getOriginalIndex = (currentIndex, tableType) => {
  // tableType: 0-左侧表格, 1-右侧表格
  if (intervalMode.value) {
    const data = localFormData.value.content || []
    const indexes = tableType === 0 ? getLeftTableIndexes(data) : getRightTableIndexes(data)
    return indexes[currentIndex] ?? currentIndex
  }
  if (tableType === 0) {
    // 左侧：直接返回当前索引
    return currentIndex
  } else {
    // 右侧：加上左侧的偏移量
    return (Number(leftLength.value) || 0) + currentIndex
  }
}
const getDisplayIndex = (currentIndex, tableType) => {
  return getOriginalIndex(currentIndex, tableType) + 1
}
const nameTextarea = ref('')
const leftLength = ref(0)
const rightLength = ref(0)

// 定义 emits
const emit = defineEmits(['dragLengthChange'])

defineExpose({
  localFormData,
  handleInput,
  markDirty,
  setSort,
  setSort2,
  leftRightMode,
  intervalMode,
  leftLength,
  rightLength
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.timeline-card {
  box-sizing: border-box;
  width: 60%;
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
.dual-table-container {
  display: flex;
  width: 100%;
  gap: 6px; /* 两个表格之间的间距 */
  :deep(.el-table) {
    font-size: 10px;
    .el-input__inner,
    .el-select__wrapper {
      font-size: 10px !important;
    }
    .el-select__wrapper {
      padding: 0 4px;
      .el-icon {
        display: inline-flex;
      }
      .el-select__caret {
        .iconfont {
          font-size: 5px !important;
        }
      }
    }
  }
}

.left-table,
.right-table {
  flex: 1; /* 等分宽度 */
  width: 50%;
}

/* 保持表格高度一致 */
.proof-table {
  height: 100%;
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
