<template>
  <div class="homeHeader">
    <div class="headerContent">
      <div class="routerTitle" v-if="!route.path.includes('/projectManage/') && !route.path.includes('/cloudManage/markdown') ">
        {{userStore.routerBreadcrumb.title}}
      </div>
      <projectHeader v-if="route.path.includes('/projectManage/')"/>
    <!-- <slot name="headerContent"></slot> -->
    <!-- <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item v-for="item in userStore.routerBreadcrumb" :key="item.title">{{ item.title }}</el-breadcrumb-item>
      </el-breadcrumb> -->
    </div>
    <div class="headerRight">
      <el-popover :teleported="false" placement="bottom" width="160" popper-class="photoPanel" trigger="click" ref="myPopover">
        <div class="panelDiv">
          <ul>
            <li v-for="(item, index) in list" :key="index" @click="selectLi(item.value)">
              {{ item.name }}
            </li>
          </ul>
        </div>
        <template #reference>
          <div class="headerInfo">
            <el-avatar :size="30" :src="headerImg" />
            <span class="name">{{ account }}</span>
          </div>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeHeader'
}
</script>
<script setup>
import { ref } from 'vue'
import router from '@/router'
import { useUserStore } from '@/store/user'
import projectHeader from '@/components/manage/projectHeader.vue'

// import { ArrowRight } from '@element-plus/icons-vue'
// import {storeToRefs} from "pinia"
import defaultHeadImg from '@/assets/defaultHeadImg.png'
import { useRoute } from 'vue-router'

const route = useRoute()

const headerImg = ref(defaultHeadImg)
const list = ref([
  {
    name: '退出登录',
    value: 1
  }
])
const userStore = useUserStore()
const account = ref('')
account.value = localStorage.getItem('account')
const selectLi = (value) => {
  const myPopover = ref(null)
  if (myPopover.value) {
    myPopover.value.close()
  }
  if (value === 1) {
    localStorage.clear()
    router.push({
      path: '/login'
    })
  } else if (value === 2) {
    console.log(1)
  }
}
</script>
<style scoped lang="scss">
.homeHeader {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: var(--theme-card);
  .headerContent {
    display: flex;
    align-items: center;
    flex: 1;
    height: 100%;
    :deep(.el-breadcrumb) {
      font-size: 16px;
    }
  }
  .headerRight {
    .headerInfo {
      display: flex;
      align-items: center;
      cursor: pointer;
      .name {
        padding: 0 10px;
      }
    }
  }
  :deep(.routerTitle) {
    font-size: 16px;
  }
}
</style>
