<template>
  <div class="common-record-render" v-bind="$attrs">
    <el-form class="medical-form" ref="ruleFormRef" :model="localFormData">
      <template v-for="(item, index) in fieldInfo" :key="index">
        <div class="section">
          <div class="section-title" v-if="item.label">
            <div class="line"></div>
            <div v-if="item.component === 'labelWithContent'">{{item.label}}：{{localFormData[item.key]}}</div>
            <div v-else>{{item.label}}</div>
          </div>
          <div class="commonUl-li" v-if="item.component === 'ul-li'">
            <ul :class="'ul-' + item.rowCount">
              <li v-for="(li, liIndex) in item.children" :key="li.label + liIndex" :class="{'width100': li.type === 'textarea'}">
                <el-form-item class="custom-form-item" :label="li.label + '：'"
                              label-width="100%" label-position="left" :prop="li.key" :rules="li.rules">
                  <el-input :type="li.type" v-model="specialLabels[li.key]" placeholder="请填写内容" v-if="!userStore.platInfo.isSensitiveInfo && ['姓名', '身份证号', '出生地', '电话'].includes(li.label)" :maxlength="li.type === 'textarea' ? 10000 : 200" show-word-limit disabled class="disabledInputWithStar"></el-input>
                  <!-- 数字验证输入框 -->
                  <!-- <el-input :type="li.type" v-no-e v-decimal-limit="li.decimalLength" v-model.number="localFormData[li.key]" placeholder="请填写内容" v-else-if="li.component === 'el-input' && li.type === 'number'"></el-input> -->
                  <el-input-number v-no-e v-model="localFormData[li.key]" :controls="false" :precision="li.precision" :min="li.min" :step-strictly="li.stepStrictly" placeholder="请填写内容" v-else-if="li.component === 'el-input-number'"></el-input-number>
                  <!-- 普通输入框 -->
                  <el-input :type="li.type" v-model="localFormData[li.key]" placeholder="请填写内容" v-else-if="li.component === 'el-input'" :maxlength="li.type === 'textarea' && !['出生地', '体温（°C）', '脉搏（次/分）', '血压（收缩压/舒张压 mmHG）', '呼吸（次/分）', '身高（cm）', '体重（kg）', '诊断'].includes(li.label) ? 10000 : 200" show-word-limit></el-input>
                  <el-select v-model="localFormData[li.key]" placeholder="请选择一项" v-if="li.component === 'el-select' && !['诊断名称', '疾病编码'].includes(li.label)">
                    <el-option v-for="enumItem in li.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                  </el-select>
                  <operationCodeSelect useCustomSelectionItems :valueFileds="li.label === '诊断名称' ? 'name' : 'code'" :options="diagnoOptions"
                                       v-if="li.component === 'el-select' && ['诊断名称', '疾病编码'].includes(li.label)"
                                       v-model="localFormData[li.key]"
                                       @change="(value) => diagnoChangeSur(li.label,item.label,liIndex, value,false)">
                  </operationCodeSelect>
                  <el-date-picker v-model="localFormData[li.key]" :type="li.type ? li.type : 'datetime'" :format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" v-if="li.component === 'el-date-picker'" placeholder="请选择一项"></el-date-picker>
                </el-form-item>
              </li>
            </ul>
          </div>
          <el-form-item class="custom-form-item" v-if="['singleDiv', 'singleDivArray'].includes(item.component)">
            <el-input :autosize="{ minRows: 2 }" :type="['体温（°C）', '脉搏（次/分）', '血压（收缩压/舒张压 mmHG）', '呼吸（次/分）', '身高（cm）', '体重（kg）'].includes(item.label) ? 'text' : 'textarea'" :maxlength="!['出生地', '体温（°C）', '脉搏（次/分）', '血压（收缩压/舒张压 mmHG）', '呼吸（次/分）', '身高（cm）', '体重（kg）', '诊断'].includes(item.label) ? 10000 : 200" show-word-limit v-model="localFormData[item.key]" placeholder="请填写内容"></el-input>
          </el-form-item>
          <el-table ref="elTableRef" row-key="uuid" :data="localFormData[item.key]" :border="item.border" :class="item.className" :row-class-name="item.needRowClass ? tableRowClassName : ''" v-if="item.component === 'el-table'">
            <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
              <el-table-column :min-width="h.width">
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
                  <div v-if="h.label === '序号'">
                    <div class="dragBtn"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    {{scope.$index}}
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-input'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <el-input v-model="scope.row[h.key]" maxlength="200" show-word-limit placeholder="请填写内容"></el-input>
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-select'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <operationCodeSelect useCustomSelectionItems :valueFileds="h.label === '手术及操作名称' ? 'name' : 'code'" :options="options"
                                         v-if="['手术及操作编码', '手术及操作名称'].includes(h.label)"
                                         v-model="scope.row[h.key]"
                                         popperClass="setWidthPopper"
                                         @change="(value) => changeSur(h.label,item.key,scope.$index, value)">
                    </operationCodeSelect>
                    <operationCodeSelect useCustomSelectionItems :valueFileds="h.label === '诊断名称' ? 'name' : 'code'" :options="diagnoOptions"
                                         v-if="['诊断名称', '疾病编码'].includes(h.label)"
                                         v-model="scope.row[h.key]"
                                         popperClass="setWidthPopper"
                                         @change="(value) => diagnoChangeSur(h.label,item.key,scope.$index, value)">
                    </operationCodeSelect>
                  </div>
                  <div v-else-if="h.component === 'el-button'">
                    <span class="btn" @click="handleDelete(scope.row, scope.$index, item.key)">删除</span>
                  </div>
                  <div class="td-div" v-else-if="h.component === 'el-date-picker'">
                    <div class="dragBtn" v-if="hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                    <el-date-picker v-model="scope.row[h.key]" :type="h.type ? h.type : 'datetime'" :format="h.customFormat ? h.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="h.customFormat ? h.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" placeholder="请选择一项"></el-date-picker>
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
    </el-form>

  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonRecordEditRender',
  inheritAttrs: false
})
import { ref, watch, onMounted } from 'vue'
import Sortable from 'sortablejs'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import operationCodeSelect from '@/components/common/operationCodeSelect.vue'
import { getOperationCodeList, getDiagnosisCodeList } from '@/api/jiancanAPI/api_home'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
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
// const emit = defineEmits(['updateFormData'])
const options = ref([])
const diagnoOptions = ref([]) // 诊断字典
const specialLabels = ref({
  name: '***',
  id_num: '******************',
  address: '********',
  phone: '***********'
})
const localFormData = ref(_.cloneDeep(props.formData))
props.fieldInfo.forEach(item => {
  if (item.component === 'singleDivArray') {
    localFormData.value[item.key] = localFormData.value[item.key]?.join('\n')
  }
})
console.log('localFormData.value', localFormData.value)
medicalStore.setEditingMedical(localFormData.value)
// const oldLocalFormData = ref({ ...props.formData })
watch(localFormData, (newVal) => {
  medicalStore.setEditingMedical(newVal)
}, { deep: true })
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
  // if (index === 0) {
  //   return false
  // }
  // console.log(1, index)
  // console.log(2, row)
  // console.log(3, key)
  // const index = props.formData[key].indexOf(row)
  // // props.formData[key].splice(index, 1)
  localFormData.value[key].splice(index, 1)
}
// 添加一行
const handleAddLine = (key) => {
  if (key === 'operations') {
    localFormData.value[key].push({
      uuid: uuidv4(),
      operation_code: '',
      operation_time: '',
      operation_name: ''
    })
  } else if (key === 'preliminary_diagnosis') {
    localFormData.value[key].push({
      uuid: uuidv4(),
      name: ''
    })
  } else if (['long_term', 'short_term'].includes(key)) {
    localFormData.value[key].push({
      uuid: uuidv4(),
      advice: '',
      time: ''
    })
  } else {
    localFormData.value[key].push({
      uuid: uuidv4(),
      code: '',
      name: ''
    })
  }
}
const elTableRef = ref()
const setSort = (tableIndex, key) => {
  if (elTableRef?.value?.length > 0) {
    const el = elTableRef?.value[tableIndex]?.$el.querySelector('tbody')
    // eslint-disable-next-line no-new
    new Sortable(el, {
      handle: '.dragBtn',
      animation: 180,
      delay: 0,
      onEnd: (e) => {
        const targetRow = localFormData.value[key].splice(e.oldIndex, 1)
        localFormData.value[key].splice(e.newIndex, 0, targetRow[0])
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
    await getCode()
    setSort(0, 'other_diagnosis')
    setSort(1, 'operations')
  } else if (props.curMedicalInfo?.value === 'enter_record') {
    setSort(0, 'preliminary_diagnosis')
  } else if (props.curMedicalInfo?.value === 'exit_record') {
    setSort(0, 'enter_diagnosis')
    setSort(1, 'out_diagnosis')
    setSort(2, 'out_advice')
  } else if (props.curMedicalInfo?.value === 'course_record') {
    setSort(0, 'preliminary_diagnosis')
  } else if (props.curMedicalInfo?.value === 'advices') {
    setSort(0, 'long_term')
    setSort(1, 'short_term')
  } else if (props.curMedicalInfo?.value === 'admission_record') {
    setSort(0, 'enter_diagnosis')
    setSort(1, 'out_diagnosis')
    setSort(2, 'out_advice')
  }
})
const changeSur = (text, filed, index, value) => {
  // console.log(1, text, filed, index, value)
  switch (text) {
    case '手术及操作名称':
      localFormData.value[filed][index].operation_code = options.value.find(item => item.name === value)?.code
      break
    case '手术及操作编码':
      localFormData.value[filed][index].operation_name = options.value.find(item => item.code === value)?.name
      break
  }
}

const diagnoChangeSur = (text, filed, index, value, isChildren = true) => {
  if (isChildren) {
    switch (text) {
      case '诊断名称':
        localFormData.value[filed][index].code = diagnoOptions.value.find(item => item.name === value)?.code
        break
      case '疾病编码':
        localFormData.value[filed][index].name = diagnoOptions.value.find(item => item.code === value)?.name
        break
    }
  } else {
    if (filed === '门（急）诊诊断信息') {
      switch (text) {
        case '诊断名称':
          localFormData.value.clinic_diagnosis_icd10 = diagnoOptions.value.find(item => item.name === value)?.code
          break
        case '疾病编码':
          localFormData.value.clinic_diagnosis_name = diagnoOptions.value.find(item => item.code === value)?.name
          break
      }
    }
    if (filed === '出院诊断-主要诊断') {
      switch (text) {
        case '诊断名称':
          localFormData.value.main_diagnosis_icd10 = diagnoOptions.value.find(item => item.name === value)?.code
          break
        case '疾病编码':
          localFormData.value.main_diagnosis_name = diagnoOptions.value.find(item => item.code === value)?.name
          break
      }
    }
  }
}

const getCode = async () => {
  const params = {
    pageNum: 1,
    pageSize: 50000
  }
  getOperationCodeList(params).then(res => {
    options.value = res.data?.items || []
  })
  getDiagnosisCodeList(params).then(res => {
    diagnoOptions.value = res.data?.items || []
  })
}
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
</style>
