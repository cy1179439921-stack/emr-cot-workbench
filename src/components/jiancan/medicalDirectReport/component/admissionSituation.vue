<template>
  <universalModule :item="item" :isEdit="isEdit" :formData="formData" :isViewPdf="isViewPdf" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
    <template #是否脑疝="scope" >
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null" v-if="(formData['治疗类型治疗类型'].includes('04') && ['1','2'].includes(formData[lable + '动脉瘤临床分类']) || formData['治疗类型治疗类型'].includes('03'))">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" v-if="isEdit" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
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
          <span v-if="scope.item.name">{{ scope.item.name }}：</span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </template>
        <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.name) && isEdit" v-html="errMsg(props.lable + scope.item.name).join('<br/>')"></div>
      </el-form-item>
    </template>
    <template #入院GCS评分="scope" >
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null" v-if="(formData['治疗类型治疗类型'].includes('04') && ['1','2'].includes(formData[lable + '动脉瘤临床分类']) || formData['治疗类型治疗类型'].includes('03'))">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" v-if="isEdit" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
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
          <span v-if="scope.item.name">{{ scope.item.name }}：</span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </template>
        <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.name) && isEdit" v-html="errMsg(props.lable + scope.item.name).join('<br/>')"></div>
        <!-- <span v-if="scope.item.unit" class="unitSpan">{{ scope.item.unit }}</span> -->
      </el-form-item>
    </template>
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import { watch, toRefs } from 'vue'
import { transfromEnumsLable, errorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
defineOptions({
  name: 'admissionSituation',
  inheritAttrs: false
})
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isViewPdf: { // 是否为预览pdf
    type: Boolean,
    default: false
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
  artificialIntelligenceForm: {
    type: Object, // 人工智能标识
    default: () => ({})
  }
})

const { formData, artificialIntelligenceForm } = toRefs(props)

const errMsg = (name) => {
  return [...new Set(errorCollector.value[name]?.map(item => item.replace(/条件\d+/, '')) || [])]
}
// 清空人工智能标识
const channelArtificialIntelligenceForm = (name) => {
  if (artificialIntelligenceForm.value[name]) {
    artificialIntelligenceForm.value[name] = false
  }
}

// watch([() => formData.value[props.lable + '脑梗死发病是否在院'], () => formData.value[props.lable + '脑梗死患者到院时间'], () => formData.value[props.lable + '脑梗死患者发病时间'], () => formData.value[props.lable + '脑梗死发病时间是否明确']], (val, oldVal) => {
//   const time = val[1]
//   const oldTime = oldVal[1]
//   const whetherItIsClear = val[0]
//   const whetherItIsClearOld = oldVal[0]
//   const timeOfCerebral = val[2]
//   const timeOfCerebralOld = oldVal[2]
//   const whetherTo = val[3]
//   const whetherToOld = oldVal[3]
//   if (time && whetherItIsClear === '1') {
//     if (time !== oldTime && whetherTo !== '2') {
//       formData.value[props.lable + '脑梗死患者发病时间'] = time
//     }
//     if (whetherItIsClear !== whetherItIsClearOld && whetherTo !== '2') {
//       formData.value[props.lable + '脑梗死患者发病时间'] = time
//     }
//     if (whetherTo !== whetherToOld && whetherTo !== '2') {
//       formData.value[props.lable + '脑梗死患者发病时间'] = time
//     }
//     if (timeOfCerebral && timeOfCerebral !== timeOfCerebralOld) {
//       formData.value[props.lable + '脑梗死患者到院时间'] = timeOfCerebral
//     }
//   }
// }, { deep: false })

// watch([() => formData.value[props.lable + '脑出血发病是否在院'], () => formData.value[props.lable + '脑出血患者到院时间'], () => formData.value[props.lable + '脑出血患者发病时间'], () => formData.value[props.lable + '脑出血发病时间是否明确']], (val, oldVal) => {
//   const time = val[1]
//   const oldTime = oldVal[1]
//   const whetherItIsClear = val[0]
//   const whetherItIsClearOld = oldVal[0]
//   const timeOfOnsetOfCerebral = val[2]
//   const timeOfOnsetOfCerebralOld = oldVal[2]
//   const whetherTo = val[3]
//   const whetherToOld = oldVal[3]
//   if (time && whetherItIsClear === '1') {
//     if (time !== oldTime && whetherTo === '1') {
//       formData.value[props.lable + '脑出血患者发病时间'] = time
//     }
//     if (whetherItIsClear !== whetherItIsClearOld && whetherTo === '1') {
//       formData.value[props.lable + '脑出血患者发病时间'] = time
//     }
//     if (whetherTo !== whetherToOld && whetherTo === '1') {
//       formData.value[props.lable + '脑出血患者发病时间'] = time
//     }
//     if (timeOfOnsetOfCerebral && timeOfOnsetOfCerebral !== timeOfOnsetOfCerebralOld) {
//       formData.value[props.lable + '脑出血患者到院时间'] = timeOfOnsetOfCerebral
//     }
//   }
// }, { deep: false })

watch([() => formData.value['治疗类型治疗类型'], () => formData.value[props.lable + '动脉瘤临床分类']], (val) => {
  const treatment = val[0]
  const clinicalClassification = val[1]
  if (treatment) {
    if (!((treatment.includes('04') && ['1', '2'].includes(clinicalClassification)) || treatment.includes('03'))) {
      delete formData.value[props.lable + '入院GCS评分']
      delete formData.value[props.lable + '是否脑疝']
    }
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
