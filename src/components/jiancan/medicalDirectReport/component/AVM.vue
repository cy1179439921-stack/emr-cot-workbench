<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import { toRefs, watch } from 'vue'
defineOptions({
  name: 'AVM',
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

watch([() => formData.value[props.lable + 'AVM大小'], () => formData.value[props.lable + 'AVM部位特征'], () => formData.value[props.lable + '静脉引流位置']], (val) => {
  const size = val[0] ? Number(val[0]) : 0
  const part = val[1] ? Number(val[1]) - 1 : 0
  const location = val[2] ? Number(val[2]) - 1 : 0
  formData.value[props.lable + 'Spetzler–Marin评分分数'] = size + part + location
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
