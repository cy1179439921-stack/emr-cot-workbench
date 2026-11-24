<template>
  <div class="tooltip-box content-ellipsis" v-show-tip>
    <el-tooltip
      class="box-item"
      :popper-class="className"
      effect="dark"
      placement="bottom"
      :open-delay="400"
      :enterable="false"
      :hide-after="0">
      <!-- 默认插槽：鼠标悬停的元素 -->
      <template #default>
        <slot></slot>
      </template>
      <!-- 新增：内容插槽 -->
      <template #content>
        <slot name="content">
          {{ content }}
        </slot>
      </template>

    </el-tooltip>
  </div>
</template>

<script setup>
defineOptions({
  name: 'CommonTooltiWithSlotContent',
  inheritAttrs: false
})

defineProps({
  content: {
    type: [String, null],
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.tooltip-box {
  flex: 1;
  height: 20px;
}
</style>
