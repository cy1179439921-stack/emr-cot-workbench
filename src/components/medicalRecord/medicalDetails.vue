<template>
  <div class="container" v-if="medicalList.length">
    <el-tabs v-model="editableTabsValue" v-show="false" type="card" class="tabs" closable @tab-remove="removeTab" @tab-change="tabClick">
      <el-tab-pane v-for="item in medicalList" :key="item.key" :label="item.label || item.key" :name="item.key" ></el-tab-pane>
    </el-tabs>
    <template v-for="item in medicalList" :key="item.key">
      <div class="main" v-if="item.key === activeMedical" >
        <medicalItem :data = "item" :type="item.type" ></medicalItem>
      </div>
    </template>
  </div>
  <el-empty :image="emptyMedical" description="暂未打开任何患者的就诊记录，请在病历库或研究队列打开" v-else/>
</template>

<script setup>
import { ref, onMounted, onActivated, computed, watch } from 'vue'
import { useMedicalStore } from '@/store/medicalStore'
import emptyMedical from '@/assets/emptyMedical.png'
import medicalItem from '@/components/medicalRecord/medicalItem.vue'
// import { useRoute } from 'vue-router'

// const router = useRoute()
const medicalStore = useMedicalStore()
const medicalList = computed(() => medicalStore.medicalList) // 就诊列表
const activeMedical = computed(() => medicalStore.activeMedical) // 新添加或者新点击的tab

const editableTabsValue = ref('') // 选中当前就诊

// 只加载一次
onMounted(() => {
  console.log(medicalList, 'medicalList')
})

// 每次打开这个页面激活
onActivated(() => {
  console.log(medicalList, 'onActivated')
  editableTabsValue.value = activeMedical.value // 每次缓存页面激活的tab
})

const removeTab = (id) => {
  medicalStore.delmedicalList(id)
  if (medicalList.value.length) {
    editableTabsValue.value = medicalList.value[medicalList.value.length - 1].key
  }
}

const tabClick = (tab) => {
  medicalStore.setActiveMedical(tab)
}

// watch(() => router.query.key, (newVal) => {
//   console.log(newVal, 'router.query.key')
//   tabClick(newVal)
//   editableTabsValue.value = newVal
//   medicalStore.setActiveMedical(newVal)
// }, { immediate: true })

watch(() => activeMedical.value, (newVal) => {
  editableTabsValue.value = newVal
})
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .tabs {
    z-index: 1;
    padding-top: 8px;
    // background-color: var(--theme-card);
    background: var(--theme-bg)#fafafa;
    :deep(.el-tabs__item) {
      padding: 0 0 0 26px !important;
      border: 0;
      border-radius: 0;
      font-weight: 500;
      font-size: 14px;
      .is-icon-close {
        width: 18px !important;
        margin-left: 46px;
        padding-right: 16px;
        border-right: 1px solid #cbcfdc;
        border-radius: 0;
        font-size: 18px !important;
        color: #959595;
        &:hover {
          background-color: transparent;
        }
      }
    }
    :deep(.el-tabs__header) {
      margin: 0;
    }
    :deep(.el-tabs__nav) {
      border: 0;
    }
    :deep(.is-active) {
      border: 0;
      border-radius: 6px 6px 0 0;
      // background-color: var(--theme-bg)#fafafa;
      background: var(--theme-card);
      box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
    }
  }
  .main {
    overflow: hidden;
    flex: 1;
  }
}
.el-empty {
  height: 100%;
  margin: 16px;
  border-radius: 8px;
  background: var(--theme-card);
  :deep(.el-empty__description) {
    margin-top: 26px;
    font-weight: 400;
    font-size: 12px;
    color: #959595;
  }
}
:deep(.el-empty__image) {
  width: 213px;
}
:deep(.el-empty__description) {
  margin-top: 0 !important;
  p {
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
</style>
