<template>
  <div class="text-container" :style="style" v-show="isShow">
    <span class="lable">{{ name }}</span>
    <div v-if="isEdit">
      <el-checkbox-group v-model="value">
        <el-checkbox :label="item" v-for="item in data.option.options" :key="item" :disabled="preview">{{ item }}</el-checkbox>
      </el-checkbox-group>
    </div>
    <template v-else>
      <span>: </span>
      <div class="value">{{ value.join(',') }}</div>
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

// 字段名
const name = computed(() => {
  return data.value.option?.name || '字段名'
})

// 样式
const style = computed(() => {
  return data.value?.style || {}
})

const value = ref([])

if (formData.value[name.value]) {
  try {
    value.value = JSON.parse(formData.value[name.value])
  } catch (error) {
    value.value = []
  }
}
watch(() => value, (val) => {
  // formData.value[name.value] = { ...formData.value[name.value], key: name.value, value: val.value }
  formData.value[name.value] = JSON.stringify(val.value)
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
