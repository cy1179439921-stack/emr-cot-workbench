<template>
  <el-tag :class="'type'+status">{{ tagText||"-" }}</el-tag>
</template>
<script setup>
defineProps({
  status: {
    type: Number,
    default: 1
  },
  tagText: {
    type: String,
    default: ''
  }
})
</script>
<style lang='scss' scoped>
:deep(.el-tag) {
  height: 32px;
  font-size: 16px;
}

.type1 {
  border-color: #e4e4e4;
  border-radius: 2px;
  background-color: rgba(102, 102, 102, 0.05);
  color: var(--theme-text-2);
}
.type2 {
  border-color: rgba(54, 112, 248, 1);
  border-radius: 2px;
  background-color: rgba(54, 112, 248, 0.05);
  color: rgba(54, 112, 248, 1);
}
.type3 {
  border-color: rgba(4, 162, 115, 1);
  border-radius: 2px;
  background-color: rgba(4, 162, 115, 0.05);
  color: rgba(4, 162, 115, 1);
}
.type4 {
  border-color: rgba(245, 159, 12, 1);
  border-radius: 2px;
  background-color: rgba(245, 159, 12, 0.05);
  color: rgba(245, 159, 12, 1);
}
.type5 {
  border-color: rgba(255, 78, 78, 1);
  border-radius: 2px;
  background-color: rgba(255, 78, 78, 0.05);
  color: rgba(255, 78, 78, 1);
}
</style>
