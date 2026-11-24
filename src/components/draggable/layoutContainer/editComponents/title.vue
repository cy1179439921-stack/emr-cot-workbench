<template>
  <div class="title-container" v-if="activeTab === 1">
    <span>标题内容：</span>
    <el-input v-model="data.title" :rows="6" type="textarea" class="input"/>
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
.common{

}
</style>
