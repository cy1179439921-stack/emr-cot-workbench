<template>
  <div class="dragArea"></div>
</template>
<script setup>
defineOptions({
  name: 'LayoutContainer',
  inheritAttrs: false
})

</script>
<style lang="scss" scoped>
.dragArea {
  min-height: 50px;
  outline: 1px dashed;
}
</style>
