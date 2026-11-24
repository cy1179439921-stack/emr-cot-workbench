<template>
  <div class="title-container" v-if="activeTab === 1">
    <span class="label">标题：</span>
    <el-input v-model="data.option.name" type="text" class="input"/>
    <div class="multipleChoice">
      <div class="flex">
        <span>选择项内容</span>
        <el-button type="text" class="multipleChoicebtn" @click="()=>{ data.option.options.push({lable:'内容',value:'识别内容'}) }">+ 新选项</el-button>
      </div>
    </div>
    <VueDraggableNext v-model="data.option.options" class="dragItem" handle=".icon-xuanxiangbiaoshi" animation="300">
      <transition-group>
        <div class="item" v-for="(item,index) in data.option.options" :key="index">
          <i class="iconfont icon-xuanxiangbiaoshi"></i>
          <el-input v-model.trim="data.option.options[index]['lable']" type="text" class="input"></el-input>
          <el-input v-model.trim="data.option.options[index]['value']" type="text" class="input"></el-input>
          <i class="iconfont icon-guanbi" @click="()=>{ data.option.options.splice(index,1) }"></i>
        </div>
      </transition-group>
    </VueDraggableNext>
  </div>
  <div class="common" v-else>
    <common :data="data"></common>
  </div>
</template>
<script setup>
import { toRefs } from 'vue'
import common from '@/components/draggable/layoutContainer/editComponents/common.vue'

import { VueDraggableNext } from 'vue-draggable-next'

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
.label{
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
.multipleChoice{
  font-size: 14px;
  margin-top: 20px;
  margin-bottom: 6px;
  .multipleChoicebtn{
    font-size: 14px;
  }
}
.flex,.item{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .item{
    background: var(--theme-fill);
    border-radius: 8px 8px 8px 8px;
    padding: 0 14px;
    margin-bottom: 4px;
    cursor: pointer;
    &:hover{
      background: var(--theme-primary-soft);
      .icon-xuanxiangbiaoshi{
        color: #5571DF;
      }
      :deep(.el-input__inner){
        background-color: var(--theme-card);
      }
      :deep(.el-input__wrapper){
        background-color: var(--theme-primary-soft);
      }
    }
    .icon-guanbi{
      font-size: 20px;
    }
  }
</style>
