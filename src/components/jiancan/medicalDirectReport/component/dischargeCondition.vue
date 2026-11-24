<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
    <template #出院用药="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" multiple v-if="isEdit" collapse-tags-tooltip collapse-tags @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
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
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import { toRefs } from 'vue'
import { transfromEnumsLable, errorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
defineOptions({
  name: 'dischargeCondition',
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
  if (value === '98') {
    if (Array.isArray(formData.value[props.lable + '出院用药']) && !formData.value[props.lable + '出院用药'].includes('98') && formData.value[props.lable + '出院用药'].length > 0) {
      return true
    } else {
      return false
    }
  } else {
    if (Array.isArray(formData.value[props.lable + '出院用药']) && formData.value[props.lable + '出院用药'].includes('98')) {
      return true
    } else {
      if (value === '07') {
        if (formData.value['治疗类型治疗类型'].includes('04') && (['1', '2'].includes(formData.value['入院情况' + '动脉瘤临床分类']))) {
          return false
        } else {
          if (formData.value[props.lable + '出院用药'].includes('07')) {
            formData.value[props.lable + '出院用药'] = formData.value[props.lable + '出院用药'].filter(item => item !== '07')
          }
          return true
        }
      }
      return false
    }
  }
}

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
