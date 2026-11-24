<template>
  <div class="dataHomePage">
    <div class="main">
      <medicalRecordsDatabase
        :studyCohort="studyCohort"
        studyName="全部"
        :diseaseTypeIds="diseaseTypeIds"
        :diseaseTypeIdList="diseaseTypeIdList"
        :agencyIds="agencyIds"
        ref="medicalRecordRef"
        :initTreeData="initTreeData2"
        @transferSearchExport="transferSearchExport"
      ></medicalRecordsDatabase>
    </div>
  </div>
</template>
<script>
export default {
  name: 'medicalRecordLibrary'
}
</script>
<script setup>
import { nextTick, onMounted, ref } from 'vue'
// import router from '@/router'
import medicalRecordsDatabase from '@/components/medicalRecord/medicalRecordsDatabase.vue'
import { useTree } from '@/hooks/treeData.js'
const { initTreeData2, diseaseTypeIdList } = useTree(true, true)
const medicalRecordRef = ref('')

const studyCohort = ref('')
const agencyIds = ref([])
const diseaseTypeIds = ref([])
onMounted(() => {
  handleClickTab()
})

const handleClickTab = () => {
  // router.push({
  //   path: '/medicalRecordLibrary',
  //   query: {
  //     index: 0
  //   }
  // })
  if (initTreeData2[0].children.length > 2) {
    initTreeData2[0].children.splice(2, 1)
  }
}

const transferSearchExport = (obj) => {
  const { type, treeValue, isTree } = obj
  console.log(type, treeValue, isTree)
  handleClickTab(type - 1)
  nextTick(() => {
    medicalRecordRef.value.handelEchoSearch({ searchItems: treeValue.search, values: treeValue.value, filterName: '无' })
  })
}
</script>
<style lang="scss" scoped>
.dataHomePage {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main {
  overflow: hidden;
  flex: 1;
}
:deep(.studyCohort .el-input__wrapper) {
  box-sizing: border-box;
  height: 28px;
  // width: 147px;
  border: 0 solid #fff;
  border-radius: 0 6px 6px 0;
  background: var(--theme-fill);
  box-shadow: none;
}
.studyCohort {
  :deep(:where(.studyCohort .el-input__wrapper, .studyCohort .el-input)):hover,
  :deep(
    :where(
      .el-input__wrapper,
      .el-input__wrapper.is-focus,
      .el-input,
      .el-input.is-focus)):visited,
  :deep(.el-select .el-input.is-focus .el-input__wrapper),
  :deep(.el-select .el-input__wrapper.is-focus) {
    border: 0 !important;
    box-shadow: none !important;
  }
}
</style>
