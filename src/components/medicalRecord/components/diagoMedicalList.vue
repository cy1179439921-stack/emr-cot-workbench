<template>
  <div class="content-medicalRecord">
    <el-dialog :model-value="true" title="就诊列表" width="900px" class="dialogDIV" @close="close">
      <div class="listDiv">
        <commonTable class="singleTable" :data="tableData" :show-overflow-tooltip="true">
          <el-table-column prop="medicalRecordId" label="就诊ID" min-width="150" ></el-table-column>
          <el-table-column prop="agencyName" label="就诊医院" min-width="130" ></el-table-column>
          <el-table-column prop="visitNumber" label="住院号" min-width="100" ></el-table-column>
          <el-table-column prop="diseaseName" label="病种" min-width="100" ></el-table-column>
          <el-table-column prop="mainDiagnosis" label="主要诊断" min-width="100" ></el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button type="primary" link @click.stop="handlerRowData(scope.row)" class="textBtn">切换</el-button>
            </template>
          </el-table-column>
        </commonTable>
        <div class="tabel_pagination">
          <el-pagination
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            v-model:current-page="currentPage"
            :page-size="limit"
            :total="total"
          >

            <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
          </el-pagination>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getMedicalRecordPage } from '@/api/api_patient'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
const emit = defineEmits(['closure'])
const props = defineProps({
  data: {
    type: Object
  }
})
const tableData = ref([])
const addDialogShow = ref(false)
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const getData = async () => {
  const params = {
    agencyId: '',
    // bizStatus: 0,
    diseaseId: '',
    fileId: '',
    pageNum: currentPage.value,
    pageSize: limit.value,
    patientId: props.data.patientId,
    queueId: props.data.studyCohort
  }
  const res = await getMedicalRecordPage(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}
// 加载时请求页面列表
const init = async () => {
  getData()
}

init()
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getData()
}

const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getData()
}

const headerIsShow = computed(() => {
  return addDialogShow.value ? 'none' : 'block'
})

const close = () => {
  emit('closure')
}

const handlerRowData = (row) => {
  row.key = props.data.studyName + row.medicalRecordId
  if (medicalStore.medicalList.length !== 10 || medicalStore.medicalList.findIndex(item => item.key === row.key) !== -1) {
    medicalStore.setmedicalList({ ...props.data, ...row, id: row.medicalRecordId, type: 0, studyCohort: props.data.studyCohort, studyName: props.data.studyName })
    emit('closure')
  } else {
    ElMessage.error('当前就诊详情已超过10条记录，请先清理历史记录后再查看')
  }
}
</script>

<style lang="scss" scoped>
.content-medicalRecord {
  :deep(.dialogDIV) {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    height: 600px;
    .el-dialog__header {
      display: v-bind(headerIsShow);
    }
    .el-dialog__body {
      padding-top: 4px !important;
    }
    .textBtn {
      color: var(--el-color-primary);
    }
  }
  .listDiv {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .singleTable {
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      width: 100%;
      height: 0;
      border-radius: 2px;
      background-color: var(--theme-card);
      :deep(.singleTable) {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    }
    .tabel_pagination {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
