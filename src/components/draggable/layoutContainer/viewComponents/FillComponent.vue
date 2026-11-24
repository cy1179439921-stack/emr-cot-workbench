<template>
  <div class="text-container" v-show="isShow">
    <span class="lable" :style="style">{{ name }} : </span>
    <div style="display: flex; flex-wrap: wrap;">
      <span v-for="(item,index) in data.option.options" :key="item" class="fill">
        <span>{{ item.lable }}</span>
        <template v-if="isEdit">
          <el-input v-model="value[index]" type="text" class="input m8" :placeholder="preview ? item.value : ''" :readonly="preview"/>
        </template>
        <template v-else>
          <span class="value m8">{{ value[index] }}</span>
        </template>
      </span>
    </div>
  </div>
</template>
<script setup>
import { toRefs, computed, watch, reactive } from 'vue'

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

const value = reactive({})

// 字段名
const name = computed(() => {
  return data.value.option?.name || '字段名'
})

// 样式
const style = computed(() => {
  return data.value?.style || {}
})

if (formData.value && Object.keys(formData.value).length) {
  data.value.option.options.forEach((item) => {
    value[item.value] = formData.value[item.value] || ''
  })
}

watch(() => value, (val) => {
  formData.value = { ...formData.value, ...val }
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
  .fill {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    white-space: nowrap;
    :deep(.input) {
      display: inline-table;
      width: 130px;
    }
    .value {
      text-decoration: underline;
    }
  }
}
.m8 {
  margin: 0 8px;
}
</style>
