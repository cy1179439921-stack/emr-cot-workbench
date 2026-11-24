<template>
  <div class="title-container" v-if="activeTab === 1">
    <span>文本内容：</span>
    <el-input v-model="data.option.content" :rows="6" type="textarea" class="input"/>
  </div>
  <div class="common" v-else>
    <common :data="data"></common>
  </div>
</template>
<script setup>
import { toRefs } from 'vue'
import common from '@/components/draggable/layoutContainer/editComponents/common.vue'

const props = defineProps({
  data: {
    type: Object
  },
  activeTab: {
    type: Number,
    default: 0
  }
})
const { data } = toRefs(props)
</script>
<style lang="scss" scoped>
span {
  display: block;
  margin-top: 35px;
  margin-bottom: 6px;
  line-height: 20px;
  font-weight: 400;
  font-size: 14px;
  color: #646464;
}
</style>
