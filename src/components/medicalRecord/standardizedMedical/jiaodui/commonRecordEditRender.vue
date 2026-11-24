<template>
  <div class="common-record-render" v-bind="$attrs">
    <el-form class="medical-form" ref="ruleFormRef" :model="localFormData">
      <template v-for="(item, index) in fieldInfo" :key="index">
        <div class="section">
          <div class="section-title" v-if="item.label">
            <div class="line"></div>
            <div v-if="item.component === 'labelWithContent'">{{item.label}}：{{localFormData[item.key]}}</div>
            <div v-else>{{item.label}}</div>
            <div class="form-item-tool">
              <el-button type="primary" link v-if="item.buttonText" @click="handleButtonClick(item.buttonText, item.key, item.buttonKey)">{{item.buttonText}}</el-button>
              <el-button type="primary" link v-if="item.buttonText2" @click="handleButtonClick(item.buttonText2, item.key, item.buttonKey)">{{item.buttonText2}}</el-button>
              <el-button type="primary" link v-if="item.buttonText3" style="display: none;" @click="handleButtonClick(item.buttonText3, item.key, item.buttonKey)">{{item.buttonText3}}</el-button>
              <el-input
                v-if="item.hasInput"
                v-model="textareas[item.key]"
                style="flex: 1; height: 56px;"
                :rows="2"
                type="textarea"
                placeholder="请填写内容"
              />
              <div v-if="item.hasInput">
                <el-button type="primary" link @click="updateFormDataTable(item)">{{item.hasInputButtonText || '赋值'}}</el-button>
              </div>
            </div>
          </div>
          <div class="commonUl-li" v-if="item.component === 'ul-li'">
            <ul :class="'ul-' + item.rowCount">
              <li v-for="(li, liIndex) in item.children" :key="li.label + liIndex" :class="{'width100': li.type === 'textarea'}">
                <el-form-item class="custom-form-item" :label="li.label + '：'"
                              label-width="100%" label-position="left" :prop="li.key" :rules="li.rules">
                  <el-input-number v-no-e v-model="localFormData[li.key]" :controls="false" :precision="li.precision" :min="li.min" :step-strictly="li.stepStrictly" placeholder="请填写内容" v-if="li.component === 'el-input-number'" @change="markDirty"></el-input-number>
                  <!-- 普通输入框 -->
                  <el-input :type="li.type" v-model="localFormData[li.key]" placeholder="请填写内容" v-else-if="li.component === 'el-input'" :maxlength="li.type === 'textarea' && !['出生地', '体温（°C）', '脉搏（次/分）', '血压（收缩压/舒张压 mmHG）', '呼吸（次/分）', '身高（cm）', '体重（kg）', '诊断'].includes(li.label) ? 10000 : 200" show-word-limit @change="markDirty"></el-input>
                  <el-select v-model="localFormData[li.key]" placeholder="请选择一项" v-if="li.component === 'el-select' && !['诊断名称', '疾病编码'].includes(li.label)" clearable @change="markDirty">
                    <el-option v-for="enumItem in li.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                  </el-select>
                  <el-input :type="li.type" v-model="localFormData[li.key]" placeholder="请填写内容" v-if="li.component === 'el-select' && ['诊断名称', '疾病编码'].includes(li.label)" maxlength="200" show-word-limit @change="markDirty"></el-input>
                  <el-date-picker v-model="localFormData[li.key]" :type="li.type ? li.type : 'datetime'" :format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" v-if="li.component === 'el-date-picker'" placeholder="请选择一项" @change="markDirty"></el-date-picker>
                </el-form-item>
              </li>
            </ul>
          </div>
          <el-form-item class="custom-form-item" v-if="['singleDiv', 'singleDivArray'].includes(item.component)">
            <el-input :autosize="{ minRows: 2 }" :type="['体温（°C）', '脉搏（次/分）', '血压（收缩压/舒张压 mmHG）', '呼吸（次/分）', '身高（cm）', '体重（kg）'].includes(item.label) ? 'text' : 'textarea'" :maxlength="!['出生地', '体温（°C）', '脉搏（次/分）', '血压（收缩压/舒张压 mmHG）', '呼吸（次/分）', '身高（cm）', '体重（kg）', '诊断'].includes(item.label) ? 10000 : 200" show-word-limit v-model="localFormData[item.key]" placeholder="请填写内容" @change="markDirty"></el-input>
          </el-form-item>
          <el-table ref="elTableRef" row-key="uuid" :data="localFormData[item.key]" :border="item.border" :class="item.className" :row-class-name="item.needRowClass ? tableRowClassName : ''" v-if="item.component === 'el-table'">
            <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
              <el-table-column v-bind="item.fixed ? { 'min-width': h.width } : { 'min-width': h.width }"
                               :fixed="h.fixed">
                <template #header>
                  <span>{{h.label}}</span>
                </template>
                <template #default="scope">
                  <div class="tag" v-if="h.isTag">
                    <span class="circle"></span>
                    <span class="text">{{ scope.row[h.key] || '-'}}</span>
                    <span class="arrow" v-if="scope.row[h.key] === '高'"><i class="iconfont icon-shang"></i></span>
                    <span class="arrow" v-if="scope.row[h.key] === '低'"><i class="iconfont icon-xia"></i></span>
                  </div>
                  <div v-if="h.label === '序号' || h.label === ''">
                    <div class="dragBtn"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    {{scope.$index}}
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-input'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <el-input v-model="scope.row[h.key]" placeholder="请填写内容" v-if="h.hiddenLimit" @change="markDirty"></el-input>
                    <el-input v-model="scope.row[h.key]" maxlength="1000" show-word-limit placeholder="请填写内容" v-else @change="markDirty"></el-input>
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-select'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <el-select v-model="scope.row[h.key]" placeholder="请选择一项" v-if="h.component === 'el-select'" popper-class="setWidthPopper" :filterable="h.allowCreate" :allow-create="h.allowCreate" clearable @change="markDirty">
                      <el-option v-for="enumItem in h.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                    </el-select>
                  </div>
                  <div v-else-if="h.component === 'el-button'">
                    <span class="btn" @click="handleDelete(scope.row, scope.$index, item.key)">
                      <i class="iconfont icon-shanchu-1"></i>
                    </span>
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-date-picker'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <el-date-picker v-model="scope.row[h.key]" :type="h.type ? h.type : 'datetime'" :format="h.customFormat ? h.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="h.customFormat ? h.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" placeholder="请选择一项" v-if="!showSelectInput" @change="markDirty"></el-date-picker>
                    <el-input v-model="scope.row[h.key]" placeholder="请填写内容" v-else @change="markDirty"></el-input>
                  </div>
                  <div v-else>
                    {{scope.row[h.key]}}
                  </div>
                </template>
              </el-table-column>
            </template>
          </el-table>
          <div class="addLine flexCenter" v-if="item.component === 'el-table' && localFormData[item.key].length < item.maxCount" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="flexCenter" style="flex: 1;" @click="handleAddLine(item.key, 1, item.maxCount)"><i class="iconfont icon-jia"></i>
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
    </el-form>

  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonRecordEditRender',
  inheritAttrs: false
})
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import Sortable from 'sortablejs'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
// import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
// const userStore = useUserStore()
// 基本信息
const props = defineProps({
  lightQuery: {
    type: String
  },
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
const lineCount = ref(5)

const showSelectInput = ref(false)
const localFormData = ref(_.cloneDeep(props.formData))

medicalStore.setEditingMedical(localFormData.value)
// const oldLocalFormData = ref({ ...props.formData })
const markDirty = () => {
  medicalStore.setEditingMedical(localFormData.value)
  medicalStore.setDirty(true)
}
const tableRowClassName = ({
  row,
  rowIndex
}) => {
  if (row.state === '正常') {
    return 'normalTr'
  } else if (!row.state || row.state === '-') {
    return ''
  } else {
    return 'abnormalTr'
  }
}
// 删除该行
const handleDelete = (row, index, key) => {
  localFormData.value[key].splice(index, 1)
  markDirty()
}
// 添加一行
const handleAddLine = (key, count, maxCount) => {
  if (localFormData.value[key].length + Number(count) > maxCount) {
    ElMessage.warning(`最多只能添加${maxCount}行`)
    return
  }
  if (key === 'operations') {
    for (let i = 0; i < count; i++) {
      localFormData.value[key].push({
        uuid: uuidv4(),
        operation_code: '',
        operation_time: '',
        operation_name: ''
      })
    }
  } else if (['preliminary_diagnosis', 'enter_diagnosis', 'out_diagnosis', 'out_advice'].includes(key)) {
    for (let i = 0; i < count; i++) {
      localFormData.value[key].push({
        uuid: uuidv4(),
        name: ''
      })
    }
  } else if (key === 'ancillary_tests') { // 辅助检查
    for (let i = 0; i < count; i++) {
      localFormData.value[key].push({
        uuid: uuidv4(),
        time: '',
        content: ''
      })
    }
  } else {
    for (let i = 0; i < count; i++) {
      localFormData.value[key].push({
        uuid: uuidv4(),
        code: '',
        name: ''
      })
    }
  }
  markDirty()
}
const elTableRef = ref()
const sortableInstances = ref([])
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
  if (elTableRef?.value?.length > 0) {
    const el = elTableRef?.value[tableIndex]?.$el.querySelector('tbody')
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
}
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}
onMounted(async() => {
  // 与手术记录相关的病历都要获取手术字典
  if (props.curMedicalInfo?.value === 'basic_information') {
    // await getCode()
    setSort(0, 'other_diagnosis')
    setSort(1, 'operations')
  } else if (props.curMedicalInfo?.value === 'enter_record') {
    setSort(0, 'ancillary_tests')
    setSort(1, 'preliminary_diagnosis')
  } else if (props.curMedicalInfo?.value === 'exit_record') {
    setSort(0, 'enter_diagnosis')
    setSort(1, 'out_diagnosis')
    setSort(2, 'out_advice')
  } else if (props.curMedicalInfo?.value === 'course_record') {
    setSort(0, 'preliminary_diagnosis')
  } else if (props.curMedicalInfo?.value === 'admission_record') {
    setSort(0, 'enter_diagnosis')
    setSort(1, 'out_diagnosis')
    setSort(2, 'out_advice')
  }
})
onBeforeUnmount(() => {
  destroyAllSorts()
})

// 校验
const ruleFormRef = ref(null)
const validateForm = () => {
  return new Promise((resolve, reject) => {
    ruleFormRef.value.validate((valid) => {
      if (valid) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
// 存储值/使用值
const handleButtonClick = (buttonText, key, buttonKey) => {
  if (buttonText.includes('存储')) {
    const arr = []
    localFormData.value[key].forEach(item => {
      arr.push(item.name)
    })
    localStorage.setItem(key, JSON.stringify(arr))
    ElMessage.success('已保存')
  } else if (buttonText.includes('使用')) {
    const arr = JSON.parse(localStorage.getItem(buttonKey))
    if (arr) {
      localFormData.value[key] = []
      arr.forEach(item => {
        localFormData.value[key].push({
          uuid: uuidv4(),
          name: item
        })
      })
      markDirty()
    } else {
      ElMessage.warning('这里还没有可用的数据')
    }
  } else if (buttonText.includes('去除首数字')) {
    localFormData.value[key].forEach(item => {
      let newValue = item.name.trim()
      // 如果newValue最前面带‘1.’或‘1、’这种，则去掉
      const isValidPrefix = /^([1-9]|[1-9]\d)[.、]/.test(newValue)
      if (isValidPrefix) {
        newValue = newValue.slice(2)
      }
      item.name = newValue
    })
    markDirty()
    ElMessage.success('已移除')
  } else if (buttonText.includes('切换日期格式')) {
    showSelectInput.value = !showSelectInput.value
  }
}
// 统一管理多个 textarea 的值，按 key 分组
const textareas = reactive({})

// 初始化 textareas
const initTextareas = () => {
  props.fieldInfo.forEach(item => {
    if (item.hasInput) {
      textareas[item.key] = ''
    }
  })
}
initTextareas()

// 赋值
const updateFormDataTable = (item) => {
  const inputTextValue = textareas[item.key]
  if (!inputTextValue) return
  const lines = inputTextValue.split('\n')
  if (item.key !== 'other_diagnosis') {
    localFormData.value[item.key] = []
  }
  lines.forEach((line, index) => {
    let newValue = line.trim()
    // 如果newValue最前面带‘1.’或‘1、’这种，则去掉
    const isValidPrefix = /^([1-9]|[1-9]\d)[.、]/.test(newValue)
    if (isValidPrefix) {
      newValue = newValue.slice(2)
    }
    const targetIndex = index
    // 获取或创建对应行
    let row = localFormData.value[item.key][targetIndex]
    if (!row) {
      if (item.key !== 'other_diagnosis') {
        row = {
          uuid: uuidv4(),
          name: ''
        }
      } else {
        row = {
          uuid: uuidv4(),
          name: '',
          code: ''
        }
      }

      localFormData.value[item.key][targetIndex] = row
    }
    // 更新字段
    if (item.key !== 'other_diagnosis') {
      row.name = newValue
    } else {
      row.code = newValue
    }
  })
  markDirty()
}

defineExpose({
  validateForm
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.header {
  margin-top: 16px;
}
.addLine {
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
.icon-tongbu {
  margin-left: 4px;
  cursor: pointer;
}
.icon-tianjia-1,
.icon-shengchengfuben,
.icon-fuzhi1 {
  margin-left: 4px;
  cursor: pointer;
}
.form-item-tool {
  display: flex;
  align-items: center;
  width: 600px;
  margin-left: 12px;
  .el-textarea {
    margin-left: 8px;
    margin-right: 8px;
  }
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
