<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm" :admissionAnDischargeNotice="admissionAnDischargeNotice"></universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
defineOptions({
  name: 'treatmentPlan',
  inheritAttrs: false
})
import { toRefs } from 'vue'
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

// watch(() => [formData.value[props.lable + '是否接受康复治疗'], formData.value['入出院信息' + '离院方式']], (value) => {
//   if (String(value[0]) === '2' && String(value[1]) === '5') {
//     formData.value['出院情况' + '出院用药'] = ['98']
//   }
// }, { deep: true })

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
