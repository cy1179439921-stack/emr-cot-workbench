<template>
  <div class="title-container" v-if="activeTab === 1">
    <span>标题：</span>
    <el-input v-model="data.option.name" type="text" class="input"/>
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
span{
  font-size: 14px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 400;
  color: #646464;
  line-height: 20px;
  margin-bottom: 6px;
  margin-top: 35px;
  display: block;
}
.input{
  width: 100%;
  .el-input-number__decrease,.el.inputNumber.increase{
    display: none;
  }
}
</style>
