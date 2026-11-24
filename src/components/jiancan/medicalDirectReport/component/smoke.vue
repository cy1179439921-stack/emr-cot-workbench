<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
    <template #烟雾病左侧治疗方式="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null" v-if="formData[scope.lable + '烟雾病本次发病是否手术治疗'] === '1' && (formData[scope.lable + '烟雾状血管侧别'] && formData[scope.lable + '烟雾状血管侧别'] !== '2')">
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
          <span v-if="scope.item.name">{{ scope.item.name }}：</span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name] && isEdit">
            <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
          </el-tooltip>
        </template>
        <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.name) && isEdit" v-html="errMsg(props.lable + scope.item.name).join('<br/>')"></div>
      </el-form-item>
    </template>
    <template #烟雾病右侧治疗方式="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null" v-if="formData[scope.lable + '烟雾病本次发病是否手术治疗'] === '1' && (formData[scope.lable + '烟雾状血管侧别'] && formData[scope.lable + '烟雾状血管侧别'] !== '1')">
        <div style="display: flex; width: 100%;">
          <el-select v-model="formData[props.lable + scope.item.name]" placeholder="请选择一项" :multiple="true" collapse-tags-tooltip collapse-tags v-if="isEdit" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)">
            <el-option v-for="items in scope.item.enums" :key="items.value" :label="items.label" :value="items.value"/>
          </el-select>
          <span class="warp" v-else>
            {{ transfromEnumsLable(scope.item.enums,formData[props.lable + scope.item.name]) || '-' }}
          </span>
          <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.name]&& !isEdit">
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
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import { toRefs, watch } from 'vue'
import { transfromEnumsLable, errorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
defineOptions({
  name: 'smoke',
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

watch(() => formData.value[props.lable + '烟雾状血管侧别'], (val) => {
  if (val === '1') {
    delete formData.value[props.lable + '烟雾病右侧治疗方式']
  }
  if (val === '2') {
    delete formData.value[props.lable + '烟雾病左侧治疗方式']
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
