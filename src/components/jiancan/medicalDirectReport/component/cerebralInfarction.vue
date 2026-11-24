<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import { watch, toRefs } from 'vue'
import { TimeDifference } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import _ from 'lodash'
defineOptions({
  name: 'cerebralInfarction',
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
const { formData } = toRefs(props)

watch([() => formData.value[props.lable + '脑出血手术开始时间'], () => formData.value['入院情况' + '脑出血患者发病时间'], () => formData.value['入院情况' + '脑出血患者到院时间']], _.debounce((val) => {
  const startTimeOfCerebralHemorrhageSurgery = val[0] // 脑出血手术开始时间
  const timeOfFirstSymptom = val[1] // 脑出血患者发病时间
  const timeOfAdmission = val[2] // 脑出血患者到院时间
  if (startTimeOfCerebralHemorrhageSurgery && timeOfFirstSymptom) {
    formData.value[props.lable + '脑出血发病到开始手术时间'] = TimeDifference(timeOfFirstSymptom, startTimeOfCerebralHemorrhageSurgery, '脑出血手术开始时间不能小于脑出血患者发病时间', props.isEdit)
  } else {
    formData.value[props.lable + '脑出血发病到开始手术时间'] = '不详'
  }
  if (timeOfAdmission && startTimeOfCerebralHemorrhageSurgery) {
    formData.value[props.lable + '脑出血到院到开始手术时间'] = TimeDifference(timeOfAdmission, startTimeOfCerebralHemorrhageSurgery, '脑出血手术开始时间不能小于脑出血患者到院时间', props.isEdit)
  } else {
    formData.value[props.lable + '脑出血到院到开始手术时间'] = '不详'
  }
}, 500), { deep: false, immediate: true })

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
