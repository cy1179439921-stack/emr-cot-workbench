<template>
  <div class="container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>样式</span>
        </div>
      </template>
      <!-- <Common :data="data" :isShowPosition="true"></Common> -->
    </el-card>
  </div>
</template>
<script setup>
// import { toRefs } from 'vue'
// import Common from './Common.vue'

// const props = defineProps({
//   data: {
//     type: Object
//   }
// })
// const { data } = toRefs(props)
</script>
<style lang="scss" scoped>
.container,.el-card{
  height: 100%;
}
</style>
