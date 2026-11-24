<template>
  <el-col class="item" :span="(col?.column || 6) * scaleNum">
    <el-form-item :label="col.lable" :prop="props.lable + col.name" :rules="col.rules || null">
      <template #label>
        <!-- 标题 -->
        <span v-if="col.lable" :title="col.lable">{{ col.lable }}：</span>
        <span class="waring" v-if="admissionAnDischargeNotice[col.lable] && isEdit && isHeaderShow">(请核对{{col.lable}})</span>
        <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + col.name] && !col?.disabled && props.isEdit">
          <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
        </el-tooltip>
      </template>
      <!-- <template #error="{ error }">
        <div class="el-form-item__error">{{ error }}</div>
      </template> -->
      <div style="display: flex; width: 100%;">
        <!-- 组件 -->
        <template v-if="isEdit" >
          <!-- 单位 -->
          <span v-if="col.prefix" class="prefixSpan">{{ col.prefix }}</span>
          <!-- 输入框 -->
          <template v-if="col.component === 'el-input'">
            <template v-if="col?.trim">
              <el-input :disabled="col?.disabled || false" v-model.trim="formData[props.lable + col.name]" placeholder="请填写内容" v-if="col?.rules || col.rules?.max" :maxlength="Array.isArray(col?.rules) ? col.rules[1]?.max : col.rules?.max" show-word-limit @blur="channelArtificialIntelligenceForm(props.lable + col.name)">
                <template #append v-if="col.unit && (!col?.hideUnitValue || (col?.hideUnitValue && formData[props.lable + col.name] !== col?.hideUnitValue))">{{col.unit}}</template>
              </el-input>
              <el-input :disabled="col?.disabled || false" v-model.trim="formData[props.lable + col.name]" placeholder="请填写内容" v-else @blur="channelArtificialIntelligenceForm(props.lable + col.name)">
                <template #append v-if="col.unit && (!col?.hideUnitValue || (col?.hideUnitValue && formData[props.lable + col.name] !== col?.hideUnitValue))">{{col.unit}}</template>
              </el-input>
            </template>
            <template v-else>
              <el-input :disabled="col?.disabled || false" v-model="formData[props.lable + col.name]" placeholder="请填写内容" v-if="col?.rules || col.rules?.max" :maxlength="Array.isArray(col?.rules) ? col.rules[1]?.max : col.rules?.max" show-word-limit @blur="channelArtificialIntelligenceForm(props.lable + col.name)">
                <template #append v-if="col.unit && (!col?.hideUnitValue || (col?.hideUnitValue && formData[props.lable + col.name] !== col?.hideUnitValue))">{{col.unit}}</template>
              </el-input>
              <el-input :disabled="col?.disabled || false" v-model="formData[props.lable + col.name]" placeholder="请填写内容" v-else @blur="channelArtificialIntelligenceForm(props.lable + col.name)">
                <template #append v-if="col.unit && (!col?.hideUnitValue || (col?.hideUnitValue && formData[props.lable + col.name] !== col?.hideUnitValue))">{{col.unit}}</template>
              </el-input>
            </template>
          </template>
          <template v-if="col.component === 'el-input-number'">
            <el-input-number
              :disabled="col?.disabled || false" v-model.number="formData[props.lable + col.name]" v-no-e placeholder="请填写内容" :precision="col?.precision || 0" v-if="col?.rules || col.rules?.max" :max="Array.isArray(col?.rules) ? col.rules[1]?.max : col.rules?.max" :min="Array.isArray(col?.rules) ? (col.rules[1]?.min || 0) : (col.rules?.min || 0)" :controls="false" @keydown="channelInputLimit" @blur="channelArtificialIntelligenceForm(props.lable + col.name)"></el-input-number>
            <el-input-number
              :disabled="col?.disabled || false" v-model.number="formData[props.lable + col.name]" v-no-e placeholder="请填写内容" :precision="col?.precision || 0" v-else :controls="false" @keydown="channelInputLimit" @blur="channelArtificialIntelligenceForm(props.lable + col.name)"></el-input-number>
          </template>
          <!-- 选择框 -->
          <el-select :disabled="col?.disabled || false" v-model="formData[props.lable + col.name]" placeholder="请选择一项" v-if="col.component === 'el-select'" :multiple="col.isMultiple || false" :class="{'isError':col.isMultiple}" collapse-tags-tooltip collapse-tags @blur="channelArtificialIntelligenceForm(props.lable + col.name)">
            <el-option v-for="item in col.enums" :key="item.value" :label="item.label" :value="item.value" :disabled="methodOfTaking(item.value)"/>
          </el-select>
          <!-- 日期时间框 -->
          <el-date-picker
            :disabled="col?.disabled || false"
            v-model="formData[props.lable + col.name]"
            :type="col.type ? col.type : 'datetime'"
            :format="col.minute ? col.format : 'YYYY-MM-DD HH:mm:ss'"
            :value-format="col.minute ? col.format : 'YYYY-MM-DD HH:mm:ss'"
            v-if="col.component === 'el-date-picker'"
            :disabledDate="dateOptions"
            @blur="channelArtificialIntelligenceForm(props.lable + col.name,col.name)"
          >
          </el-date-picker>
        </template>
        <!-- 预览 -->
        <span class="warp" v-if="!isEdit">{{ (col.component === 'el-select' ? transfromEnumsLable(col.enums,formData[props.lable + col.name]) : (formData[props.lable + col.name] === 0 ? formData[props.lable + col.name] : formData[props.lable + col.name] || '-')) }}</span>
        <span class="waring ml4" v-if="admissionAnDischargeNotice[col.lable] && !isEdit && isHeaderShow">(请核对{{ col.lable }})</span>
        <!-- 单位 -->
        <!-- <span v-if="col.unit && (!col?.hideUnitValue || (col?.hideUnitValue && formData[props.lable + col.name] !== col?.hideUnitValue))" class="unitSpan">{{ col.unit }}</span> -->
        <!-- 识别状态 -->

        <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + col.name] && !col?.disabled && !props.isEdit">
          <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
        </el-tooltip>

        <!-- 递归 -->
        <template v-if="col.children && col.children.length > 0" >
          <template v-for="(item, index) in col.children" :key="index">
            <recursionItem :formData="formData" :col = "item" :isEdit="isEdit" :lable="props.lable" v-if="item.judgment && formData[(item.judgment?.label || props.lable) + item.judgment?.conditions] && // 判断条件是否满足
              (item.judgment.type === 'multiple' ? formData[(item.judgment?.label || props.lable) + item.judgment?.conditions].includes(item.judgment.value) : // 多选判断
                item.judgment.type === '!multiple' ? item.judgment?.value.every(it => !formData[(item.judgment?.label || props.lable) + item.judgment?.conditions].includes(it)) : // 排除多选判断
                item.judgment.type === 'string' ? item.judgment.value?.split(',')?.includes(formData[(item.judgment?.label || props.lable) + item.judgment?.conditions]) : // 字符串判断
                item.judgment.value?.split(',')?.includes(formData[(item.judgment?.label || props.lable) + item.judgment?.conditions]))"></recursionItem>
          </template>
        </template>

        <template v-if="col.list && formData[props.lable + col.name]">
          <div v-for="it in formData[props.lable + col.name]" :key="it" class="independent">
            <h2>{{ col.listTitle + it }}</h2>
            <template v-for="(item) in col.list" :key="item">
              <template v-if="formData[props.lable + col.name + 'list'].length === formData[props.lable + col.name]">
                <!-- <recursionItem :formData="formData[props.lable + col.name + 'list'][it - 1]" :col = "item" :isEdit="isEdit" :lable="props.lable"></recursionItem> -->
                <recursionItem :artificialIntelligenceForm="artificialIntelligenceForm" :formData="formData[props.lable + col.name + 'list'][it - 1]" :col = "item" :isEdit="isEdit" :lable="props.lable" v-if="!item.judgment"></recursionItem>
                <template v-else-if="item.judgment && formData[props.lable + col.name + 'list'][it - 1][props.lable + item.judgment?.conditions] && // 判断条件是否满足
                  (item.judgment.type === 'multiple' ? formData[props.lable + col.name + 'list'][it - 1][props.lable + item.judgment?.conditions].includes(item.judgment.value) : // 多选判断
                    item.judgment.type === '!multiple' ? item.judgment?.value.every(it => !formData[props.lable + col.name + 'list'][it - 1][props.lable + item.judgment?.conditions].includes(it)) : // 排除多选判断
                    item.judgment.type === 'string' ? item.judgment.value?.split(',')?.includes(formData[props.lable + col.name + 'list'][it - 1][props.lable + item.judgment?.conditions]) : // 字符串判断
                    item.judgment.value?.split(',')?.includes(formData[props.lable + col.name + 'list'][it - 1][props.lable + item.judgment?.conditions] ))"
                >
                  <recursionItem :artificialIntelligenceForm="artificialIntelligenceForm" :formData="formData[props.lable + col.name + 'list'][it - 1]" :col = "item" :isEdit="isEdit" :lable="props.lable"></recursionItem>
                </template>
              </template>
            </template>
          </div>
        </template>
      </div>
      <div class="el-form-item__error" v-if="errMsg && isEdit" v-html="errMsg.join('<br/>')"></div>
    </el-form-item>
    <!-- <span class="waring msg" v-if="admissionAnDischargeNotice[col.lable] && !isEdit && isViewPdf">(请核对出院日期)</span> -->
  </el-col>
</template>
<script setup>
import { transfromEnumsLable, errorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
defineOptions({
  name: 'recursionItem',
  inheritAttrs: false
})
import { toRefs, onBeforeUnmount, computed, inject } from 'vue'
const errMsg = computed(() => [...new Set(errorCollector.value[props.lable + col.name]?.map(item => item.replace(/条件\d+/, '')) || [])])
const isHeaderShow = inject('isHeaderShow')
const props = defineProps({
  col: { // 列配置
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
    type: Object, // 入出院通知
    default: () => ({})
  }
})
const { col } = props
const { formData, artificialIntelligenceForm, admissionAnDischargeNotice } = toRefs(props)
onBeforeUnmount(() => {
  if (col?.isMultiple) {
    formData.value[props.lable + col.name] = [] // 如果是数组给赋值为空，直接删除dom会报错
  } else {
    delete formData.value[props.lable + col.name] // 当组件销毁时删除掉当前值
  }
})

const channelInputLimit = (e) => {
  if (e.key === 'e' || e.key === 'E' || e.key === '-') {
    e.returnValue = false
    return false
  }
  return true
}

const dateOptions = (time) => {
  return time.getTime() > Date.now()
}

const methodOfTaking = (value) => {
  if (col?.disabledText && col?.isMultiple) {
    if (value === col?.disabledText) {
      if (Array.isArray(formData.value[props.lable + props.col.name]) && !formData.value[props.lable + props.col.name].includes(col?.disabledText) && formData.value[props.lable + props.col.name].length > 0) {
        return true
      } else {
        return false
      }
    } else {
      if (Array.isArray(formData.value[props.lable + props.col.name]) && formData.value[props.lable + props.col.name].includes(col?.disabledText)) {
        return true
      } else {
        return false
      }
    }
  } else if (col?.deathOptionalValue) { // 死亡可选值
    if (formData.value['入出院信息' + '离院方式'] === '5' && value !== col?.deathOptionalValue) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

const channelArtificialIntelligenceForm = (label, name) => {
  // 清空人工智能标识
  if (artificialIntelligenceForm.value[label]) {
    artificialIntelligenceForm.value[label] = false
  }
  // 清空入出院提示
  if (name && admissionAnDischargeNotice.value[name]) {
    admissionAnDischargeNotice.value[name] = false
  }
}

const scaleNum = computed(() => {
  return props.isViewPdf ? 2 : 1
})

</script>
<style lang="scss" scoped>
:deep(.waring) {
  padding-right: 14px;
  color: #f59f0c !important;
  &.ml4 {
    margin-left: 8px;
  }
}
.item:has(.waring) .warp {
  white-space: noWrap !important;
}
</style>
