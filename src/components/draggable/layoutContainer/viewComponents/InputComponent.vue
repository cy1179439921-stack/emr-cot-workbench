<template>
  <div class="text-container" v-show="isShow" >
    <span class="lable" :style="style">{{ name }}</span>
    <template v-if="isEdit">
      <el-input v-model="value" type="text" class="input" :maxlength="data.option.lenght || 20" :placeholder="data.option.placeholder" :readonly="preview"/>
    </template>
    <template v-else>
      <span class="lable">: {{ value }}</span>
    </template>
  </div>
</template>
<script setup>
import { toRefs, computed, watch, ref } from 'vue'

const props = defineProps({
  data: {
    type: Object
  },
  preview: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: true
  }
})
const { data, formData } = toRefs(props)

// 名称
const name = computed(() => {
  return data.value.option?.name
})

// 样式
const style = computed(() => {
  return data.value?.style || {}
})

const value = ref('')

if (formData.value[name.value]) {
  value.value = formData.value[name.value]
  // value.value = formData.value[name.value].value
}
watch(() => value, (val) => {
  // formData.value[name.value] = { ...formData.value[name.value], key: name.value, value: val.value }
  formData.value[name.value] = val.value
}, { deep: true })

// 是否显示
const isShow = computed(() => {
  if (props.preview) {
    return true
  } else {
    const rule = data.value?.option?.rule
    return !(rule && !(formData.value[rule.name] && rule.valueType === 'string' ? formData.value[rule.name] === rule.value : formData.value[rule.name].includes(rule.value)))
  }
})
</script>
<style lang="scss" scoped>
.text-container {
  box-sizing: border-box;
  padding: 5px;
  .lable {
    display: inline-block;
    margin-bottom: 4px;
    word-break: break-all;
  }
}
</style>
