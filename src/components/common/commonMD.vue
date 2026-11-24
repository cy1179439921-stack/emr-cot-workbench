<template>
  <v-md-editor
    v-model="subText"
    :default-show-toc="defaultShowToc"
    :default-fullscreen="defaultFullscreen"
    @save="handleSave"
  ></v-md-editor>
</template>

<script setup>
import { ref } from 'vue'
import lodash from 'lodash'
const emits = defineEmits(['handleSave'])
const props = defineProps({
  defaultShowToc: { // 是否开启目录导航,默认开启
    default: true
  },
  defaultFullscreen: { // 是否默认全屏,默认不全屏
    default: false
  },
  text: {

  }
})

const subText = ref(lodash.cloneDeep(props.text))
const handleSave = () => {
  emits('handleSave', subText.value)
}
</script>
<style lang="scss" scoped>
.v-md-editor--fullscreen {
  z-index: 100000 !important;
}
.v-md-editor {
  width: 100%;
  height: 100%;
}
</style>
