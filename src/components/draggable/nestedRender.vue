<template>
  <div ghostClass="ghost" :class="{'flex':isRoot}" class="dragArea">
    <div v-for="el in tasks" :key="el.key" class="relative">
      <nested-render :tasks="el.children || []" :formData="formData" :isRoot="el.id === 100" :isEdit="isEdit" :preview="preview" v-if="el.children" class="bg-gray-100 pl-5" :componentsObj="componentsObj" />
      <component :is="componentsObj[el.type]" v-else :data="el" class="next-draggable" :preview="preview" :formData="formData" :isEdit="isEdit" :isDisable="isDisable" />
    </div>
  </div>
</template>
<script setup>
import { toRefs, watch } from 'vue'
defineOptions({
  name: 'nested-render',
  inheritAttrs: false
})

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  componentsObj: {
    type: Object
  },
  activeComponent: null,
  isRoot: {
    type: Boolean,
    default: false
  },
  preview: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: true
  },
  isDisable: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => ({})
  }
})
const { tasks, isRoot } = toRefs(props)

watch(() => tasks.value, (val) => {
  console.log(val)
})
</script>
<style scoped lang="scss">
.flex {
  display: flex;
  flex-wrap: nowrap;
  >div {
    margin: 0 !important;
  }
}
.pl-5 {
  box-sizing: border-box;
  padding: 5px;
}
.bg-gray-100 {
  background-color: var(--theme-fill);
}
.dragArea {
  overflow: hidden;
  justify-content: 'none';
  box-sizing: border-box;
  width: 100%;
  min-height: 50px;
  // padding: 5px;
  .relative {
    overflow: hidden;
    position: relative;
    flex: 1;
    width: 100%;
    margin: 5px 0;
    cursor: pointer;
    .handler-title {
      position: absolute;
      left: -2px;
      top: -50px;
      z-index: 999;
      box-sizing: border-box;
      width: 106px;
      border-radius: 8px 8px 8px 8px;
      background: var(--theme-card);
      box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.16);
      opacity: 1;
      line-height: 40px;
      text-align: center;
      font-size: 16px;
    }
  }
}
</style>
