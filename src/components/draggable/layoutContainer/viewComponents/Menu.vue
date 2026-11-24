<template>
  <ul v-show="menuShow" :style="{top: top+'px', left: left +'px',zIndex:9999}">
    <li @click="insertRow">插入行(↓)</li>
    <li @click="insertColumn">插入列(→)</li>
    <li @click="deleteRow">删除行</li>
    <li @click="deleteColumn">删除列</li>
    <li @click="mergeTd">合并单元格</li>
    <li @click="breakTd">拆分单元格</li>
  </ul>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  top: {
    type: Number,
    required: true
  },
  left: {
    type: Number,
    required: true
  },
  showMenu: {
    type: Boolean,
    required: false
  }
})

const menuShow = ref(false)
watch(() => props.showMenu, (value) => {
  menuShow.value = value
}, { deep: true })
menuShow.value = props.showMenu
const emit = defineEmits(['insertRow', 'insertColumn', 'deleteRow', 'deleteColumn', 'mergeTd', 'breakTd'])

const insertRow = () => {
  menuShow.value = false
  emit('insertRow', menuShow.value)
}

const insertColumn = () => {
  menuShow.value = false
  emit('insertColumn', menuShow.value)
}

const deleteRow = () => {
  menuShow.value = false
  emit('deleteRow', menuShow.value)
}

const deleteColumn = () => {
  menuShow.value = false
  emit('deleteColumn', menuShow.value)
}

const mergeTd = () => {
  menuShow.value = false
  emit('mergeTd', menuShow.value)
}

const breakTd = () => {
  menuShow.value = false
  emit('breakTd', menuShow.value)
}
</script>

<style scoped>
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  padding: 8px 20px;
  user-select: none;
  text-decoration: none;
  text-align: center;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
}
li:hover {
  box-shadow: 0 0 1px 1px rgba(164, 232, 227, 0.2);
}
ul {
  position: fixed;
  box-sizing: border-box;
  width: 150px;
  background: var(--theme-card);
  box-shadow: 0 0 10px 2px rgba(164, 232, 227, 0.26);
}
</style>
