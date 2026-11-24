<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
    <template #主要诊断名称="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null">
        <div style="display: flex; width: 100%;">
          <operationCodeSelect isOperationCodeListLoaded useCustomSelectionItems valueFileds="name"
                               @click="isClick = (props.lable + scope.item.name)"
                               :options="isClick === (props.lable + scope.item.name) ? options : []"
                               @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)"
                               v-if="isEdit"
                               v-model="formData[props.lable + scope.item.name]"
                               @change="(value) => changeSur(props.lable + scope.item.name,value)">
          </operationCodeSelect>

          <span class="warp" v-else>
            {{ formData[props.lable + scope.item.name] || '-' }}
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
    <template #主要诊断编码="scope">
      <el-form-item :label="scope.item.lable" :prop="scope.lable + scope.item.name" :rules="scope.item?.rules || null">
        <div style="display: flex; width: 100%;">
          <operationCodeSelect isOperationCodeListLoaded useCustomSelectionItems valueFileds="code"
                               @click="isClick = props.lable + scope.item.name"
                               :options="isClick === (props.lable + scope.item.name) ? options : []"
                               @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)"
                               v-if="isEdit"
                               v-model="formData[props.lable + scope.item.name]"
                               @change="(value) => changeSur(props.lable + scope.item.name,value)">
          </operationCodeSelect>

          <span class="warp" v-else>
            {{ formData[props.lable + scope.item.name] || '-' }}
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
import { toRefs, onMounted, ref } from 'vue'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
import { getDiagnosisCodeList } from '@/api/jiancanAPI/api_home'
import operationCodeSelect from '@/components/common/operationCodeSelect.vue'
import { errorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
defineOptions({
  name: 'mainDiagnosis',
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
const isClick = ref('') // 是否点击选择其他诊断编码
// 清空人工智能标识
const channelArtificialIntelligenceForm = (name) => {
  if (artificialIntelligenceForm.value[name]) {
    artificialIntelligenceForm.value[name] = false
  }
}

onMounted(async () => {
  await getCode()
})

const errMsg = (name) => {
  return [...new Set(errorCollector.value[name]?.map(item => item.replace(/条件\d+/, '')) || [])]
}

const options = ref([]) // 其他诊断编码选项
// 获取其他诊断编码选项
const getCode = async () => {
  const params = {
    pageNum: 1,
    pageSize: 50000
  }
  getDiagnosisCodeList(params).then(res => {
    options.value = res.data?.items || []
  })
}

const changeSur = (filed, value) => {
  console.log(filed, value)
  switch (filed) {
    case '病案首页中的出院主要诊断主要诊断名称':
      formData.value[props.lable + '主要诊断编码'] = options.value.find(item => item.name === value)?.code
      break
    case '病案首页中的出院主要诊断主要诊断编码':
      formData.value[props.lable + '主要诊断名称'] = options.value.find(item => item.code === value)?.name
      break
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
