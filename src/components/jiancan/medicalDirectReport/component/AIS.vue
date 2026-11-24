<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
    <template #溶栓并发症="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null" v-if="formData[scope.lable + scope.item.judgment.conditions] === '1'">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" :multiple="true" collapse-tags-tooltip collapse-tags v-if="isEdit" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
            <el-option v-for="items in scope.item.enums" :key="items.value" :label="items.label" :value="items.value"
                       :disabled="(items.value === '08' && formData[props.lable + scope.item.name].includes('07')) || (items.value === '07' && formData[props.lable + scope.item.name].includes('08'))"
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
    <template #未给予血管内治疗的原因="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null" v-if="!formData['治疗类型治疗类型'].includes('02')">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" :multiple="true" collapse-tags-tooltip collapse-tags v-if="isEdit" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
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
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import { toRefs, watch } from 'vue'
import { TimeDifference, transfromEnumsLable, isValidTimeFormat, errorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import _ from 'lodash'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
defineOptions({
  name: 'AIS',
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

watch([() => formData.value['入院情况' + '脑梗死患者发病时间'], () => formData.value['入院情况' + '脑梗死患者到院时间'], () => formData.value[props.lable + '开始静脉溶栓时间']], _.debounce((value) => {
  const timeOfOnsetOfPatientsWithCerebralInfarction = value[0] // 脑梗死患者发病时间
  const timeOfDischargeOfPatientsWithCerebralInfarction = value[1] // 脑梗死患者到院时间
  const timeOfStartOfSynchronousSedation = value[2] // 开始静脉溶栓时间
  if (isValidTimeFormat(timeOfOnsetOfPatientsWithCerebralInfarction) && isValidTimeFormat(timeOfStartOfSynchronousSedation)) {
    formData.value[props.lable + 'ONT时间'] = TimeDifference(timeOfOnsetOfPatientsWithCerebralInfarction, timeOfStartOfSynchronousSedation, '脑梗死患者发病时间不能大于开始静脉溶栓时间', props.isEdit)
  } else {
    formData.value[props.lable + 'ONT时间'] = '不详'
  }
  if (isValidTimeFormat(timeOfDischargeOfPatientsWithCerebralInfarction) && isValidTimeFormat(timeOfStartOfSynchronousSedation)) {
    formData.value[props.lable + 'DNT时间'] = TimeDifference(timeOfDischargeOfPatientsWithCerebralInfarction, timeOfStartOfSynchronousSedation, '脑梗死患者到院时间不能大于开始静脉溶栓时间', props.isEdit)
  } else {
    formData.value[props.lable + 'DNT时间'] = '不详'
  }
}, 500), { deep: true, immediate: true })

watch(() => formData.value['治疗类型治疗类型'], (value) => {
  if (value && value.includes('02')) {
    formData.value[props.lable + '未给予血管内治疗的原因'] = []
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
