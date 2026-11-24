<template>
  <div class="directApoplexyReport">
    <div :class="{topNav:true,MB:activeTab===2}">
      <ul>
        <template v-for="item in tabs">
          <li
            v-if="item.isPermission"
            :key="item.value"
            :class="{ active: activeTab === item.value }"
            @click="handleClickTab(item.value)"
          >
            <div class="label">{{ item.label }}</div>
            <div class="bottomLine"></div>
          </li>
        </template>
      </ul>
    </div>
    <div class="content">
      <branchDashBoard v-if="activeTab===1"></branchDashBoard>
      <predictiveAnalysis v-if="activeTab===2"></predictiveAnalysis>
      <centerDashBoard v-if="activeTab===3"></centerDashBoard>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import router from '@/router'
import { getPagePermission } from '@/hooks/permissionHooks'
import centerDashBoard from './centerDashBoard.vue'
import predictiveAnalysis from './predictiveAnalysis.vue'
import branchDashBoard from './branchDashBoard.vue'

import { useRoute } from 'vue-router'
const route = useRoute()
// eslint-disable-next-line no-unused-vars
const { needCheckPermission, hadPermissionList } = getPagePermission('/strokeDirectReport/directApoplexyReport')
const tabs = ref([
  {
    label: '院内卒中基本数据情况',
    value: 1,
    isPermission: hadPermissionList.value.includes('查看院内卒中基本数据情况') && needCheckPermission
  },
  {
    label: '院内卒中数据预估分析',
    value: 2,
    isPermission: hadPermissionList.value.includes('查看院内卒中数据预估分析') && needCheckPermission
  },
  {
    label: '中心卒中基本数据情况',
    value: 3,
    isPermission: hadPermissionList.value.includes('查看中心卒中基本数据情况') && needCheckPermission
  }
])
const activeTab = ref(1)
activeTab.value = (route.query.index - 0) || 1
const handleClickTab = (index) => {
  activeTab.value = index
  router.push({
    path: '/strokeDirectReport/directApoplexyReport',
    query: {
      index
    }
  })
}
</script>
<style lang="scss" scoped>
.topNav {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 58px;
  margin: 16px 16px 0 16px;
  padding-left: 32px;
  border-radius: 8px;
  background: var(--theme-card);
  &.MB {
    margin-bottom: 24px;
  }
  ul {
    display: flex;
    flex: 1;
    box-sizing: border-box;
    height: 100%;
    li {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: auto;
      margin-right: 42px;
      cursor: pointer;
      line-height: 22px;
      font-size: 16px;
      color: var(--theme-text-2);
      .label {
        display: flex;
        align-items: center;
        height: 100%;
      }
      &.active {
        position: relative;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-primary);
        .bottomLine {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 50px;
          height: 3px;
          background-color: var(--theme-primary);
          transform: translateX(-50%);
        }
      }
    }
  }
}
.directApoplexyReport {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
}
.content {
  overflow: hidden;
  position: relative;
  z-index: 2;
  flex: 1;
  box-sizing: border-box;
}
</style>
