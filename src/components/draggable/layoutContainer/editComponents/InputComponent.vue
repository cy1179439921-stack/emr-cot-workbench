<template>
  <div class="title-container" v-if="activeTab === 1">
    <span>标题：</span>
    <el-input v-model="data.option.name" type="text" class="input"/>
    <span>默认提示词：</span>
    <el-input v-model="data.option.placeholder" type="text" class="input"/>
    <span>数据类型：</span>
    <el-input v-model="data.option.type" type="text" class="input"/>
    <span>字符长度：</span>
    <el-input-number
      v-no-e v-model="data.option.lenght" :min="1" :max="20" type="text" class="input disnone" placeholder="0～20" controls-position="right"/>
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
.input {
  width: 100%;
  .el-input-number__decrease,
  .el.inputNumber.increase {
    display: none;
  }
}
.disnone {
  :deep(span) {
    display: none;
  }
}
</style>
