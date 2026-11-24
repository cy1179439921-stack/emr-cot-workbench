<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm" :admissionAnDischargeNotice="admissionAnDischargeNotice"></universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
// import { ElMessage } from 'element-plus'
defineOptions({
  name: 'hospitalizationInfo',
  inheritAttrs: false
})
import { toRefs, watch } from 'vue'
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
    type: Object // 人工智能标识
  },
  admissionAnDischargeNotice: {
    type: Object // 入出院通知
  }
})
const { formData } = toRefs(props)

watch(() => formData.value[props.lable + '离院方式'], (value) => {
  const setFormFiledValue = {
    AIS静脉溶栓溶栓后24hNIHSS评分: '2',
    'AIS静脉溶栓溶栓后7±2天NIHSS评分': '2',
    'AIS血管内治疗术后7±2天NIHSS评分': '2',
    AIS血管内治疗术后24hNIHSS评分: '2',
    '出院评估7±2天（或出院）时mRS评分': '3',
    '出院评估7±2天（或出院）时NIHSS评分': '3',
    '出院评估7±2天（或出院）时GCS评分': '3'
  }
  if (String(value) === '5') {
    Object.keys(setFormFiledValue).forEach(key => {
      formData.value[key] = setFormFiledValue[key]
    })
    formData.value['康复治疗' + '是否接受康复治疗'] = '2'
    formData.value['出院情况' + '出院用药'] = ['98']
  }
}, { deep: true })

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
