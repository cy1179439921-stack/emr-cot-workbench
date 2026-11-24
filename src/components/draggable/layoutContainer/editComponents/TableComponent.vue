<template>
  <div class="title-container" v-if="activeTab === 1">
    <span>标题：</span>
    <el-input v-model="data.option.name" type="text" class="input"/>
    <span>行：</span>
    <el-input-number
      v-no-e v-model="data.option.localRow" :min="1" :max="100" class="center"/>
    <span>列：</span>
    <el-input-number
      v-no-e v-model="data.option.localColumn" :min="1" :max="100" class="center"/>
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
:deep(.center) {
  width: 100%;
  .el-input__inner {
    text-align: center;
  }
  .el-input__wrapper {
    background: var(--theme-fill) !important;
  }
}
</style>
