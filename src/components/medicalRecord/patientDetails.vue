<template>
  <div class="container" v-if="curPatientDetailList.length">
    <el-tabs v-model="editableTabsValue" v-show="false" type="card" class="tabs" closable @tab-remove="removeTab" @tab-change="tabClick">
      <el-tab-pane v-for="item in curPatientDetailList" :key="item.key" :label="item.label || item.key" :name="item.key" ></el-tab-pane>
    </el-tabs>
    <template v-for="item in curPatientDetailList" :key="item.key">
      <div class="main" v-if="item.key === activeCurPatientDetail" >
        <PatientHomePage :data = "item" :type="item.type" ref="pagesKey"></PatientHomePage>
      </div>
    </template>
  </div>
  <el-empty :image="emptyMedical" description="暂未打开任何患者主页，请在病历库或研究队列打开" v-else/>
</template>

<script setup>
import { ref, onMounted, onActivated, computed, watch, nextTick } from 'vue'
import { useMedicalStore } from '@/store/medicalStore'
import emptyMedical from '@/assets/emptyMedical.png'
import PatientHomePage from '@/components/medicalRecord/patientHomePage.vue'
// import { useRoute } from 'vue-router'

// const router = useRoute()
const medicalStore = useMedicalStore()
const curPatientDetailList = computed(() => medicalStore.curPatientDetailList) // 患者列表
const activeCurPatientDetail = computed(() => medicalStore.activeCurPatientDetail) // 新添加或者新点击的tab

const editableTabsValue = ref('') // 选中当前患者
const pagesKey = ref(null)
// 只加载一次
onMounted(() => {
  console.log(curPatientDetailList, 'curPatientDetailList')
})

// 每次打开这个页面激活
onActivated(() => {
  nextTick(() => {
    pagesKey.value[0]?.onRefresh()
  })
})

const removeTab = (id) => {
  medicalStore.delCurPatientDetail(id)
  if (curPatientDetailList.value.length) {
    editableTabsValue.value = curPatientDetailList.value[curPatientDetailList.value.length - 1].key
  }
}

const tabClick = (tab) => {
  medicalStore.setactiveCurPatientDetail(tab)
}

watch(() => activeCurPatientDetail.value, (newVal) => {
  editableTabsValue.value = newVal
})
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
