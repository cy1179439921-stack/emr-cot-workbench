<template>
  <div class="operation">
    <div class="conditionTitle">
      <div class="title">
        <el-form
          ref="searchForm"
          :inline="true"
          :model="searchInfo"
          @submit.prevent
        >
          <el-form-item label="就诊ID" class="form-query-select">
            <el-input
              v-model="searchInfo.medicalRecordId"
              clearable
              oninput="value=value.replace(/[^\d.]/g,'')"
              maxlength="19"
              placeholder="请填写内容" @keyup.enter="onSubmit"
            ></el-input>
          </el-form-item>
          <el-form-item label="开始时间" class="form-query-select">
            <el-date-picker
              v-model="searchInfo.startTime"
              type="date"
              value-format="YYYY-MM-DD"
              @keyup.enter="onSubmit"
            />
          </el-form-item>
          <el-form-item label="医嘱内容" class="form-query-select">
            <el-input
              v-model="searchInfo.doctorAdvice"
              clearable
              placeholder="请填写内容" @keyup.enter="onSubmit"
            ></el-input>
          </el-form-item>
          <div class="btnDiv">
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </el-form>
        <el-button-group class="btns">
          <el-button @click="switchBtn(1)" :class="{ active: doctorAdviceType === 1 }">长期医嘱</el-button>
          <el-button @click="switchBtn(2)" :class="{ active: doctorAdviceType === 2 }">临时医嘱</el-button>
        </el-button-group>
      </div>
    </div>
    <commonTable class="singleTable" ref="table" :data="tableData" type="expand" row-key="id">
      <el-table-column label="就诊类型" min-width="80">
        <template #default="scope">
          <div style="display: flex; justify-content: center; align-items: center;" v-if="scope.row.medicalRecordType">
            <i class="iconfont blue" :class="hospitalGroupOptions.find(item => item.value === scope.row.medicalRecordType)?.icon"></i>
            <span style="margin-left: 10px;">{{ hospitalGroupOptions.find(item => item.value === scope.row.medicalRecordType)?.label || '-' }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="medicalRecordId"
        label="就诊ID"
        min-width="150"
      ></el-table-column>
      <el-table-column
        prop="startTime"
        label="开始时间"
        min-width="150"
      ></el-table-column>
      <el-table-column
        prop="doctorAdvice"
        label="医嘱内容"
        min-width="450"
      ></el-table-column>
      <el-table-column
        prop="agencyName"
        label="就诊医院"
        min-width="120"
      ></el-table-column>
    </commonTable>
    <div class="tabel_pagination" >
      <el-pagination
        class="bottomPagination"
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
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getPrescriptionList } from '@/api/api_patient'
const table = ref(null) // 表格实例
const doctorAdviceType = ref(1) // 按钮激活状态
const props = defineProps(['curPatientDetail']) // 当前患者详情
const currentPage = ref(1) // 当前页
const limit = ref(20) // 每页条数
const total = ref(0) // 总条数
const searchInfo = ref({ // 搜索条件
  groupName: '',
  startTime: '',
  doctorAdvice: ''
})
const tableData = ref([]) // 列表数据
// 加载时请求页面列表
const init = async () => {
  getData() // 获取列表数据
}
// 病历类型选项
const hospitalGroupOptions = [
  { value: 1, label: '住院', icon: 'icon-zhuyuan1' },
  { value: 2, label: '门急诊', icon: 'icon-menjizhen' },
  { value: 3, label: '体检', icon: 'icon-tijian' }
]

// 获取列表数据
const getData = async () => {
  const params = {
    patientId: props.curPatientDetail.patientId,
    startTime: searchInfo.value.startTime,
    medicalRecordId: searchInfo.value.medicalRecordId,
    doctorAdviceType: doctorAdviceType.value,
    pageNum: currentPage.value,
    pageSize: limit.value,
    queueId: props.curPatientDetail.studyCohort,
    doctorAdvice: searchInfo.value.doctorAdvice
  }
  const res = await getPrescriptionList(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}
// 重置
const resetParams = () => {
  // table.value?.clearSort()
  searchInfo.value = {
    groupName: '',
    startTime: '',
    doctorAdvice: ''
  }
  getData()
}
// 搜索
const onSubmit = () => {
  currentPage.value = 1
  getData()
}
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getData()
}
// 更改每页条数
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getData()
}
// 页面加载时初始化
onMounted(() => {
  init() // 初始化页面数据
})

const switchBtn = (val) => {
  doctorAdviceType.value = val
  getData()
}

defineExpose({
  onRefresh: () => {
    init()
  }
})
</script>

<style scoped lang="scss">
.operation {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 100%;
  .conditionTitle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 32px;
    margin-top: 16px;
    margin-bottom: 24px;
    .title {
      display: flex;
      align-items: center;
      width: 100%;
      color: var(--theme-text);
      white-space: nowrap;
      >.btns {
        display: flex;
        .el-button:hover {
          border-color: #d8d8d8;
          background: var(--theme-card);
          color: unset;
        }
        .el-button:last-child {
          margin: 0;
        }
        .active {
          z-index: 999;
          border-color: var(--theme-primary);
          color: var(--theme-primary);
          &:hover {
            border-color: var(--theme-primary);
            color: var(--theme-primary);
          }
        }
      }
    }
    .el-form {
      display: flex;
      width: 100%;
      :deep(.el-date-editor) {
        width: 255px;
      }
      .el-form-item {
        margin-bottom: 0;
      }
      .el-input {
        width: 245px;
      }
    }
    .el-button+.el-button {
      margin-left: 16px;
    }
  }
  :deep(.singleTable) {
    display: flex;
    flex-direction: column;
    flex: 1;
    .el-table__header {
      thead {
        th {
          &:last-child {
            text-align: center;
          }
        }
      }
    }
    .el-table__body {
      tbody {
        tr {
          td {
            .el-button {
              font-weight: 400;
              & + .el-button {
                margin-left: 7px;
              }
            }
            .blueBtn {
              color: var(--el-color-primary);
              &.is-disabled {
                color: rgba(149, 149, 149, 0.55);
              }
            }
            .blue {
              color: var(--theme-primary);
            }
            .redBtn {
              color: #f76868;
            }
            .green:hover {
              color: #25c7cb;
            }
          }
        }
      }
    }
    tbody :empty:not(:where(span,.iconfont))::before {
      color: #000;
      content: '-';
    }
  }
  .tabel_pagination {
    display: flex;
    justify-content: center;
  }
}
</style>
