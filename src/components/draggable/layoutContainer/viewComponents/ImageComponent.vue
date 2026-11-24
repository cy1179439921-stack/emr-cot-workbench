<template>
  <div class="text-container" v-show="isShow">
    <span class="lable" :style="style">{{ name }}</span>
    <el-image :src="emptyImg" v-if="preview"/>
    <el-image :src="value" v-else>
      <template #error>
        <div class="image-slot">
          <img :src="emptyImg" alt="err">
        </div>
      </template>
    </el-image>
  </div>
</template>
<script setup>
import { toRefs, computed, ref } from 'vue'
import emptyImg from '@/assets/emptyImg.png'
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
  }
})
const { data, formData } = toRefs(props)

const value = ref('')

// 字段名
const name = computed(() => {
  return data.value.option?.name || '字段名'
})

if (formData.value[name.value]) {
  value.value = formData.value[name.value]
  // value.value = formData.value[name.value].value
}

// 图片样式
const style = computed(() => {
  return data.value?.style || {}
})

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
  .el-image {
    display: block;
    width: 100px;
    padding: 0 5px;
  }
  .image-slot {
    font-size: 30px;
    color: var(--el-text-color-secondary);
  }
}
</style>
