<template>
  <div class="container">
    <div class="pageTabs">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="pageTab"
        :class="{ active: route.path === tab.path }"
        @click="router.push(tab.path)"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="pageContent">
      <router-view />
    </div>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const tabs = [
  { label: '病历池', path: '/proofreadingManagement/medicalRecordPool' },
  { label: '任务管理', path: '/proofreadingManagement/taskManagement' }
]
</script>
<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
}
.pageTabs {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  margin-bottom: 16px;
  background: var(--theme-card);
  border-radius: 8px;
}
.pageTab {
  height: 48px;
  padding: 0 24px;
  margin-right: 24px;
  cursor: pointer;
  line-height: 48px;
  color: var(--theme-text-2);
  border-bottom: 2px solid transparent;
}
.pageTab.active {
  color: var(--theme-primary);
  border-bottom-color: var(--theme-primary);
}
.pageContent {
  height: calc(100% - 64px);
}
</style>
