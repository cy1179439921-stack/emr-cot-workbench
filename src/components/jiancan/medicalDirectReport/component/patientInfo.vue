<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import { watch, toRefs } from 'vue'
defineOptions({
  name: 'patientInfo',
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

const getGender = (idNumber) => {
  let lastDigit = 0
  if (idNumber.length === 15) {
    lastDigit = parseInt(idNumber.charAt(idNumber.length - 1), 10)
  } else if (idNumber.length === 18) {
    lastDigit = parseInt(idNumber.charAt(idNumber.length - 2), 10)
  }
  // 判断性别
  if (!formData.value[props.lable + '性别']) {
    formData.value[props.lable + '性别'] = lastDigit % 2 === 0 ? '2' : '1'
  }
}

watch(() => formData.value[props.lable + '身份证号'], (val) => {
  if ([15, 18].includes(val.length)) {
    getGender(val, val.length)
  }
}, { deep: false })

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
