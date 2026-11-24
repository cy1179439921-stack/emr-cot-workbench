<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
    <template #动脉瘤数量="scope">
      <el-form-item :label="scope.lable" :prop="props.lable + scope.item.name" :rules="scope.item?.rules || null" class="numberOfTumors">
        <div :style="{'width': pxToRem(330)}" >
          <!-- <el-input v-if="isEdit" v-model.number="formData[scope.lable + scope.item.name]" placeholder="请填写内容" :controls="false" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)"></el-input> -->
          <el-input-number v-no-e v-if="isEdit" v-model.number="formData[scope.lable + scope.item.name]" placeholder="请填写内容" :precision="0" :controls="false" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.name)"></el-input-number>
          <span class="warp" v-else>
            {{ formData[scope.lable + scope.item.name] || '-' }}
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
      </el-form-item>
      <template v-if="formData[props.lable + '动脉瘤数量'] && Number(formData[props.lable + '动脉瘤数量']) !== 0">
        <el-row class="item-row" :gutter="props.isViewPdf ? 24 : 54" v-for="(items,indexSum) in (Number(formData[props.lable + '动脉瘤数量']) || 0) > 4 ? 4 : Number(formData[props.lable + '动脉瘤数量']) || 0" :key="indexSum">
          <template v-for="(it, index) in scope.item.children" :key="index">
            <recursionItem
              :isViewPdf="isViewPdf"
              :artificialIntelligenceForm="artificialIntelligenceForm"
              :formData="formData"
              :col = "{...it,lable: '动脉瘤' + (indexSum + 1) + it.lable}" :isEdit="isEdit" :lable="props.lable + '动脉瘤' + (indexSum + 1)"
              v-if="(!it.judgment) || (it.judgment && formData[((it?.judgment?.lable || scope.lable) + '动脉瘤' + (indexSum + 1)) + it.judgment?.conditions] && // 判断条件是否满足
                (it.judgment.type === 'multiple' ? formData[((it?.judgment?.lable || scope.lable )+ '动脉瘤' + (indexSum + 1)) + it.judgment?.conditions].includes(it.judgment.value) : // 多选判断
                  it.judgment.type === '!multiple' ? it.judgment?.value.every(it => !formData[((it?.judgment?.lable || scope.lable) + '动脉瘤' + (indexSum + 1)) + it.judgment?.conditions].includes(it)) : // 排除多选判断
                  it.judgment.type === 'string' ? it.judgment.value?.split(',')?.includes(formData[((it?.judgment?.lable || scope.lable) + '动脉瘤' + (indexSum + 1)) + it.judgment?.conditions]) : // 字符串判断
                  !it.judgment.value?.split(',')?.includes(formData[((it?.judgment?.lable || scope.lable)+ '动脉瘤' + (indexSum + 1) )+ it.judgment?.conditions]))
              )"></recursionItem>
          </template>
        </el-row>
      </template>
    </template>
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import recursionItem from '@/components/jiancan/medicalDirectReport/recursionItem.vue'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
defineOptions({
  name: 'aneurysm',
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

</script>
<style lang="scss" scoped>
.item-row {
  margin-top: 32px;
}
.numberOfTumors {
  margin-bottom: 12px;
  :deep(.el-form-item__error) {
    position: absolute;
  }
}
</style>
