<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
    <template #取栓方式="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" v-if="isEdit" collapse-tags-tooltip collapse-tags @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
            <el-option v-for="items in scope.item.enums" :key="items.value" :label="items.label" :value="items.value"
                       :disabled="methodOfTaking(items.value)"
            />
          </el-select>
          <span class="warp" v-else>
            {{ transfromEnumsLable(scope.item.enums,formData[props.lable + scope.item.name]) || '-' }}
          </span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && !isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </div>
        <template #label>
          <!-- 标题 -->
          <span v-if="scope.item.lable">{{ scope.item.lable }}：</span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </template>
        <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.name) && isEdit" v-html="errMsg(props.lable + scope.item.name).join('<br/>')"></div>
      </el-form-item>
    </template>
    <template #未溶栓原因="scope" v-if="!(formData['治疗类型治疗类型'].includes('01')) && formData['治疗类型治疗类型'].includes('02')">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" :multiple="true" v-if="isEdit" collapse-tags-tooltip collapse-tags @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
            <el-option v-for="items in scope.item.enums" :key="items.value" :label="items.label" :value="items.value"/>
          </el-select>
          <span class="warp" v-else>
            {{ transfromEnumsLable(scope.item.enums,formData[props.lable + scope.item.name]) || '-' }}
          </span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && !isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </div>
        <template #label>
          <!-- 标题 -->
          <span v-if="scope.item.lable">{{ scope.item.lable }}：</span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </template>
        <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.name) && isEdit" v-html="errMsg(props.lable + scope.item.name).join('<br/>')"></div>
      </el-form-item>
    </template>
    <template #血管内开通治疗手术并发症="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" :multiple="true" collapse-tags-tooltip collapse-tags v-if="isEdit" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
            <el-option v-for="items in scope.item.enums" :key="items.value" :label="items.label" :value="items.value"
                       :disabled="(items.value === '15' && formData[props.lable + scope.item.name].includes('14')) ||
                         (items.value === '14' && formData[props.lable + scope.item.name].includes('15')) ||
                         (items.value === '98' && !formData[props.lable + scope.item.name].includes('98') && formData[props.lable + scope.item.name].length > 0) ||
                         (items.value !== '98' && formData[props.lable + scope.item.name].includes('98'))"
            />
          </el-select>
          <span class="warp" v-else>
            {{ transfromEnumsLable(scope.item.enums,formData[props.lable + scope.item.name]) || '-' }}
          </span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && !isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </div>
        <template #label>
          <!-- 标题 -->
          <span v-if="scope.item.lable">{{ scope.item.lable }}：</span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </template>
        <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.name) && isEdit" v-html="errMsg(props.lable + scope.item.name).join('<br/>')"></div>
      </el-form-item>
    </template>
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import { toRefs, watch } from 'vue'
import { TimeDifference, transfromEnumsLable, isValidTimeFormat, errorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
import _ from 'lodash'
defineOptions({
  name: 'intraoperativeTherapy',
  inheritAttrs: false
})
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isEdit: { // 是否编辑
    type: Boolean,
    required: true,
    default: false
  },
  formData: { // 表单数据
    type: Object,
    required: true
  },
  lable: {
    type: String
  },
  isViewPdf: { // 是否为预览pdf
    type: Boolean,
    default: false
  },
  artificialIntelligenceForm: {
    type: Object, // 人工智能标识
    default: () => ({})
  }
})
const { formData, artificialIntelligenceForm } = toRefs(props)
// 清空人工智能标识
const channelArtificialIntelligenceForm = (name) => {
  if (artificialIntelligenceForm.value[name]) {
    artificialIntelligenceForm.value[name] = false
  }
}

const errMsg = (name) => {
  return [...new Set(errorCollector.value[name]?.map(item => item.replace(/条件\d+/, '')) || [])]
}

const methodOfTaking = (value) => {
  if (formData.value[props.lable + '未溶栓原因']) {
    if (value === '1') {
      if (formData.value['治疗类型治疗类型'].includes('02') && !formData.value['治疗类型治疗类型'].includes('01') && (!formData.value[props.lable + '未溶栓原因'].includes('04'))) {
        if (formData.value[props.lable + '取栓方式'] === '1') {
          delete formData.value[props.lable + '取栓方式']
        }
        return true
      } else {
        return false
      }
    }
    if (value === '2') {
      if (Array.isArray(formData.value[props.lable + '未溶栓原因']) && formData.value[props.lable + '未溶栓原因'].length > 0) {
        if (formData.value[props.lable + '未溶栓原因'].includes('04') && (formData.value['治疗类型治疗类型'].includes('02') && !formData.value['治疗类型治疗类型'].includes('01'))) {
          if (formData.value[props.lable + '取栓方式'] === '2') {
            delete formData.value[props.lable + '取栓方式']
          }
          return true
        } else {
          false
        }
      } else {
        if (formData.value['治疗类型治疗类型'].includes('02') && formData.value['治疗类型治疗类型'].includes('01')) {
          if (formData.value[props.lable + '取栓方式'] === '2') {
            delete formData.value[props.lable + '取栓方式']
          }
          return true
        } else {
          return false
        }
      }
      if (formData.value['治疗类型治疗类型'].includes('01') && (formData.value[props.lable + '未溶栓原因'].includes('04'))) {
        if (formData.value[props.lable + '取栓方式'] === '2') {
          delete formData.value[props.lable + '取栓方式']
        }
        return true
      } else {
        return false
      }
    }
    if (value === '3') {
      return false
    }
  } else {
    return false
  }
}

watch(() => formData.value['治疗类型治疗类型'], (value) => {
  if (value.includes('01') && value.includes('02')) {
    formData.value[props.lable + '未溶栓原因'] = []
  }
}, { deep: true })

watch([() => formData.value['入院情况' + '脑梗死患者发病时间'], () => formData.value['入院情况' + '脑梗死患者到院时间'], () => formData.value[props.lable + '穿刺完成时间'], () => formData.value[props.lable + '二次发病时间'], () => formData.value[props.lable + '取栓方式'], () => formData.value[props.lable + '首次血管成功再通时间']], _.debounce((value) => {
  const timeOfOnsetOfPatientsWithCerebralInfarction = value[0] // 脑梗死患者发病时间
  const timeOfDischargeOfPatientsWithCerebralInfarction = value[1] // 脑梗死患者到院时间
  const timeOfStartOfSynchronousSedation = value[2] // 穿刺完成时间
  const timeOfSecondSymptomOnset = (value[3]) // 二次发病时间
  const methodOfTaking = (value[4] !== '3') // 取栓方式
  const timeOfFirstVesselReentry = value[5] // 首次血管成功再通时间
  // OPT时间
  if (isValidTimeFormat(timeOfStartOfSynchronousSedation) && ((!methodOfTaking && isValidTimeFormat(timeOfSecondSymptomOnset)) || (methodOfTaking && isValidTimeFormat(timeOfOnsetOfPatientsWithCerebralInfarction)))) {
    formData.value[props.lable + 'OPT时间'] = TimeDifference(methodOfTaking ? timeOfOnsetOfPatientsWithCerebralInfarction : timeOfSecondSymptomOnset, timeOfStartOfSynchronousSedation, methodOfTaking ? '脑梗死患者发病时间不能大于穿刺完成时间' : '二次发病时间不能大于穿刺完成时间', props.isEdit)
  } else {
    formData.value[props.lable + 'OPT时间'] = '不详'
  }

  // DPT时间
  if (isValidTimeFormat(timeOfStartOfSynchronousSedation) && ((!methodOfTaking && isValidTimeFormat(timeOfSecondSymptomOnset)) || (methodOfTaking && isValidTimeFormat(timeOfDischargeOfPatientsWithCerebralInfarction)))) {
    formData.value[props.lable + 'DPT时间'] = TimeDifference(methodOfTaking ? timeOfDischargeOfPatientsWithCerebralInfarction : timeOfSecondSymptomOnset, timeOfStartOfSynchronousSedation, methodOfTaking ? '脑梗死患者到院时间不能大于穿刺完成时间' : '二次发病时间不能大于穿刺完成时间', props.isEdit)
  } else {
    formData.value[props.lable + 'DPT时间'] = '不详'
  }

  // DRT时间
  if (isValidTimeFormat(timeOfFirstVesselReentry) && ((!methodOfTaking && isValidTimeFormat(timeOfSecondSymptomOnset)) || (methodOfTaking && isValidTimeFormat(timeOfDischargeOfPatientsWithCerebralInfarction)))) {
    formData.value[props.lable + 'DRT时间'] = TimeDifference(methodOfTaking ? timeOfDischargeOfPatientsWithCerebralInfarction : timeOfSecondSymptomOnset, timeOfFirstVesselReentry, methodOfTaking ? '脑梗死患者到院时间不能大于首次血管成功再通时间' : '二次发病时间不能大于首次血管成功再通时间', props.isEdit)
  } else {
    formData.value[props.lable + 'DRT时间'] = '不详'
  }

  // ORT时间
  if (isValidTimeFormat(timeOfFirstVesselReentry) && ((!methodOfTaking && isValidTimeFormat(timeOfSecondSymptomOnset)) || (methodOfTaking && isValidTimeFormat(timeOfOnsetOfPatientsWithCerebralInfarction)))) {
    formData.value[props.lable + 'ORT时间'] = TimeDifference(methodOfTaking ? timeOfOnsetOfPatientsWithCerebralInfarction : timeOfSecondSymptomOnset, timeOfFirstVesselReentry, methodOfTaking ? '脑梗死患者发病时间不能大于首次血管成功再通时间' : '二次发病时间不能大于首次血管再通时间', props.isEdit)
  } else {
    formData.value[props.lable + 'ORT时间'] = '不详'
  }
}, 500), { deep: true, immediate: true })

</script>
    <style lang="scss" scoped>
    .center {
      display: flex;
      i {
        margin-right: 20px;
        margin-top: 10px;
        cursor: pointer;
      }
    }
    </style>
