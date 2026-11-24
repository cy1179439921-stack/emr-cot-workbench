<template>
  <div class="tooltip-box content-ellipsis" v-show-tip>
    <el-tooltip
      class="box-item"
      effect="dark"
      :content="String(content)"
      placement="bottom"
      :open-delay="400"
      :enterable="false"
      :hide-after="0">
      <slot></slot>
    </el-tooltip>
  </div>

</template>

<script setup>
defineOptions({
  name: 'CommonTooltip',
  inheritAttrs: false
})
defineProps({
  content: {
    type: [String, Number],
    required: false
  }
})
</script>

<style scoped>
.tooltip-box {
  flex: 1;
}
</style>
