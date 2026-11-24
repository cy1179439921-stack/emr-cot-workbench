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
          <el-form-item label="手术名称" class="form-query-select">
            <el-input
              v-model="searchInfo.groupName"
              clearable
              placeholder="请填写内容" @keyup.enter="onSubmit"
            ></el-input>
          </el-form-item>
          <el-form-item label="手术日期" class="form-query-select">
            <el-date-picker
              v-model="searchInfo.time"
              type="daterange"
              range-separator="-"
              value-format="YYYY-MM-DD"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>
          <div class="btnDiv">
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </el-form>
      </div>
    </div>
    <commonTable class="singleTable" :data="tableData" type="expand" row-key="id">
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
        min-width="80"
      >
        <!-- <template #default="scope">
          <div>{{ scope.row.medicalRecordId||'-' }}</div>
        </template> -->
      </el-table-column>
      <el-table-column
        prop="operationName"
        label="手术名称"
        min-width="120"
      ></el-table-column>
      <el-table-column
        prop="agencyName"
        label="就诊医院"
        min-width="100"
      ></el-table-column>
      <el-table-column
        prop="preDiagnosis"
        label="术前诊断"
        min-width="80"
      ></el-table-column>
      <el-table-column
        prop="intraDiagnosis"
        label="术中诊断"
        min-width="80"
      ></el-table-column>
      <el-table-column
        prop="operationTimeString"
        label="手术开始时间"
        min-width="100"
      ></el-table-column>
      <el-table-column
        prop="duration"
        label="手术持续时间"
        min-width="70"
      ></el-table-column>
      <el-table-column
        prop="property"
        label="手术性质"
        min-width="80"
      ></el-table-column>
      <el-table-column
        prop="incisionType"
        label="切口类型"
        min-width="100"
      ></el-table-column>
      <!-- <el-table-column
        prop="startEndTime"
        label="手术起止时间"
        min-width="100"
      ></el-table-column>
      <el-table-column
        prop="bleedingVolume"
        label="术中出血量"
        min-width="100"
      ></el-table-column> -->
      <el-table-column
        prop="anesthesia"
        label="麻醉方法"
        min-width="80"
      ></el-table-column>
      <el-table-column
        prop="process"
        label="手术经过"
        min-width="160"
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
import { getSurgicalPage } from '@/api/api_patient'
import _ from 'lodash'

const props = defineProps(['curPatientDetail']) // 当前患者详情
const currentPage = ref(1) // 当前页
const limit = ref(20) // 每页条数
const total = ref(0) // 总条数
const searchInfo = ref({ // 搜索条件
  groupName: '',
  time: ['', '']
})
// 病历类型选项
const hospitalGroupOptions = [
  { value: 1, label: '住院', icon: 'icon-zhuyuan1' },
  { value: 2, label: '门急诊', icon: 'icon-menjizhen' },
  { value: 3, label: '体检', icon: 'icon-tijian' }
]
const tableData = ref([]) // 列表数据
// 加载时请求页面列表
const init = async () => {
  getData() // 获取列表数据
}

// 获取列表数据
const getData = async () => {
  const params = {
    startTime: _.get(searchInfo.value, 'time[0]', ''),
    endTime: _.get(searchInfo.value, 'time[1]', ''),
    operationName: searchInfo.value.groupName,
    pageNum: currentPage.value,
    pageSize: limit.value,
    patientId: props.curPatientDetail.patientId,
    queueId: props.curPatientDetail.studyCohort
  }
  const res = await getSurgicalPage(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}
// 重置
const resetParams = () => {
  searchInfo.value = {
    groupName: '',
    time: ['', '']
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
      .blue {
        color: var(--theme-primary);
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
