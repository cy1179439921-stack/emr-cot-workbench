<template>
  <h3 class="title-label"><i class="bors"></i>{{ item.lable }}</h3>
  <div class="content">
    <el-row :gutter="props.isViewPdf ? 24 : 54">
      <template v-for="(col, index) in item.value" :key="index">
        <!-- 是否为某个治疗类型下的值 -->
        <template v-if="!col?.restrict || (col?.restrict && col?.restrict.some(it => formData['治疗类型' + '治疗类型']?.includes(it)))">
          <!-- 是否是插槽 -->
          <template v-if="col.component !=='slot'">
            <recursionItem :isViewPdf="isViewPdf" :artificialIntelligenceForm="artificialIntelligenceForm" :admissionAnDischargeNotice="admissionAnDischargeNotice" :formData="formData" :col = "col" :isEdit="isEdit" :lable="item.lable" v-if="(!col.judgment) || (
              col.judgment && formData[(col?.judgment?.lable || item.lable) + col.judgment?.conditions] && // 判断条件是否满足
              (col.judgment.type === 'multiple' ? formData[(col?.judgment?.lable || item.lable) + col.judgment?.conditions].includes(col.judgment.value) : // 多选判断
                col.judgment.type === '!multiple' ? col.judgment?.value.every(it => !formData[(col?.judgment?.lable || item.lable) + col.judgment?.conditions].includes(it)) : // 排除多选判断
                col.judgment.type === 'string' ? col.judgment.value?.split(',')?.includes(formData[(col?.judgment?.lable || item.lable) + col.judgment?.conditions]) : // 字符串判断
                !col.judgment.value?.split(',')?.includes(formData[(col?.judgment?.lable || item.lable) + col.judgment?.conditions]))
            )"></recursionItem>
          </template>
          <el-col class="item" :span="(col.column || 6) * scaleNum" v-else >
            <slot :name="col.name" :formData="formData" :isEdit="isEdit" :item="col" :lable="lable"></slot>
          </el-col>
        </template>
      </template>
    </el-row>
  </div>
</template>
<script setup>
import recursionItem from '@/components/jiancan/medicalDirectReport/recursionItem.vue'
import { computed, toRefs } from 'vue'
defineOptions({
  name: 'universalModule',
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
  lable: { // 列名称
    type: String
  },
  isViewPdf: { // 是否为预览pdf
    type: Boolean,
    default: false
  },
  artificialIntelligenceForm: {
    type: Object, // 人工智能标识
    default: () => ({})
  },
  admissionAnDischargeNotice: {
    type: Object // 入出院通知
  }

})
const { formData } = toRefs(props)

const scaleNum = computed(() => {
  return props.isViewPdf ? 2 : 1
})
</script>
<style lang="scss" scoped>
.title-label {
  display: flex;
  align-items: center;
  margin-top: 6px;
  margin-bottom: 18px;
  font-weight: 500;
  font-size: 16px;
  color: var(--theme-text);
  .bors {
    display: inline-block;
    width: 2px;
    height: 14px;
    margin-right: 6px;
    background-color: var(--el-color-primary);
  }
}
</style>
