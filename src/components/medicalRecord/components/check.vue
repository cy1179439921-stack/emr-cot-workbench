<template>
  <div class="check">
    <div class="conditionTitle">
      <div class="title">
        <el-form
          ref="searchForm"
          :inline="true"
          :model="searchInfo"
          @submit.prevent
        >
          <el-form-item label="检查项目" class="form-query-select">
            <el-input
              v-model="searchInfo.name"
              clearable
              placeholder="请填写内容" @keyup.enter="onSubmit"
              maxlength="30"
            ></el-input>
          </el-form-item>
          <el-form-item label="检查部位" class="form-query-select">
            <el-input
              v-model="searchInfo.examPart"
              clearable
              placeholder="请填写内容" @keyup.enter="onSubmit"
              maxlength="30"
            ></el-input>
          </el-form-item>
          <el-form-item label="报告时间" class="form-query-select">
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
    <commonTable
      class="singleTable btnsLastCell"
      :data="tableData"
      type="expand"
      row-key="id"
      :expand-row-keys="expands"
      :row-class-name="tableRowClassName"
    >
      <el-table-column type="expand" class-name="expand-column" width="1">
        <template v-slot="scope">
          <el-scrollbar>
            <table class="table-detail" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th style="width: 50%;">检查所见</th>
                  <th style="width: 50%;">诊断</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ scope.row.imageContent }}</td>
                  <td>{{ scope.row.imageResult }}</td>
                </tr>
              </tbody>
            </table>
          </el-scrollbar>
        </template>
      </el-table-column>
      <el-table-column label="就诊类型" min-width="100">
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
        min-width="110"
      >
        <template #default="scope">
          <div>{{ scope.row.medicalRecordId||'-' }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="检查项目"
        min-width="200"
      ></el-table-column>
      <el-table-column
        prop="agencyName"
        label="就诊医院"
        min-width="120"
      ></el-table-column>
      <el-table-column
        prop="reportTime"
        label="检查时间"
        min-width="120"
      ></el-table-column>
      <el-table-column
        prop="visitNumber"
        label="住院号/门诊号/体检号"
        min-width="110"
      ></el-table-column>
      <el-table-column
        prop="examDepartment"
        label="科室"
        min-width="100"
      ></el-table-column>
      <el-table-column
        prop="examType"
        label="检查类型"
        min-width="60"
      ></el-table-column>
      <el-table-column
        prop="examPart"
        label="检查部位"
        min-width="140"
      ></el-table-column>
      <el-table-column label="查看" min-width="50" fixed="right">
        <template #default="scope">
          <el-button class="blueBtn" type="primary" link @click="showDateLine(scope.row)">{{expands.includes(scope.row.id) ? '收起' : '展开'}}
            <el-icon v-if="expands.includes(scope.row.id)"><ArrowUp /></el-icon>
            <el-icon v-else><ArrowDown /></el-icon>
          </el-button>
        </template>
      </el-table-column>
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
import { getTheListOfMedicalExaminationInformation } from '@/api/api_patient'
import _ from 'lodash'
const props = defineProps(['curPatientDetail']) // 当前患者详情
const currentPage = ref(1) // 当前页
const limit = ref(20) // 每页条数
const total = ref(0) // 总条数
const searchInfo = ref({ // 搜索条件
  examPart: '',
  name: '',
  time: ['', '']
})
const tableData = ref([]) // 列表数据
// 病历类型选项
const hospitalGroupOptions = [
  { value: 1, label: '住院', icon: 'icon-zhuyuan1' },
  { value: 2, label: '门急诊', icon: 'icon-menjizhen' },
  { value: 3, label: '体检', icon: 'icon-tijian' }
]

const expands = ref([]) // 展开行
// 加载时请求页面列表
const init = async () => {
  getData() // 获取列表数据
}

// 获取列表数据
const getData = async () => {
  const params = {
    startTime: _.get(searchInfo.value, 'time[0]', ''),
    endTime: _.get(searchInfo.value, 'time[1]', ''),
    examPart: searchInfo.value.examPart,
    name: searchInfo.value.name,
    pageNum: currentPage.value,
    pageSize: limit.value,
    patientId: props.curPatientDetail.patientId,
    queueId: props.curPatientDetail.studyCohort
  }
  const res = await getTheListOfMedicalExaminationInformation(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}
// 重置
const resetParams = () => {
  searchInfo.value = {
    examPart: '',
    name: '',
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
const tableRowClassName = ({ row, rowIndex }) => {
  if (expands.value.includes(row.id)) {
    return 'expand-tr'
  } else {
    return ''
  }
}

// 检查展开
const showDateLine = (row) => {
  if (expands.value.includes(row.id)) {
    expands.value = expands.value.filter(val => val !== row.id)
  } else {
    expands.value.push(row.id)
  }
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
.check {
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
          &:nth-child(2) {
            .cell {
              padding-left: 24px;
            }
          }
        }
      }
    }

    .el-table__body {
      tbody {
        tr {
          .el-table__expanded-cell {
            padding: 0 12px 0 18px;
            padding-top: 0;
            border-bottom: none;
          }
          td {
            border-bottom: 1px solid #e8e8e8;
            &:nth-child(2) {
              .cell {
                padding-left: 24px;
              }
            }
            .el-button {
              font-weight: 400;
              & + .el-button {
                margin-left: 7px;
              }
            }
            .blueBtn {
              .el-icon {
                margin-left: 5px;
              }
            }
            .redBtn {
              color: #f76868;
            }
            .green:hover {
              color: #25c7cb;
            }
          }
          &.expand-tr {
            td {
              border-bottom: none;
            }
          }
        }
      }
    }
    .expand-column .el-table__expand-icon {
      display: none;
    }

    .table-detail {
      height: 100%;
      border: 1px solid #e8e8e8;
      thead {
        flex-basis: 54px;
        box-sizing: border-box;
        border-bottom: 1px solid #e8e8e8;
      }
      tbody {
        flex: 1;
      }
      th {
        font-weight: 400;
        color: var(--theme-text);
      }
      th,
      td {
        box-sizing: border-box;
        height: 54px;
        padding-left: 26px;
        word-wrap: break-word;
        word-break: break-all;
        white-space: normal;
      }
      tr,
      tbody {
        .normalTr td {
          color: #04a273;
          .tag {
            display: flex;
            align-items: center;
            width: fit-content;
            height: 24px;
            padding-left: 8px;
            padding-right: 12px;
            border-radius: 4px;
            background-color: var(--theme-primary-soft);

            .circle {
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 8px;
              background-color: #04a273;
            }

            .text {
              margin-left: 10px;
            }

            .arrow {
              margin-left: 5px;

              i {
                font-size: 11px;
              }
            }
          }
        }
        .abnormalTr td {
          color: #ff4e4e;
          .tag {
            display: flex;
            align-items: center;
            width: fit-content;
            height: 24px;
            padding-left: 8px;
            padding-right: 12px;
            border-radius: 4px;
            background-color: rgba(255, 78, 78, 0.1);

            .circle {
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 8px;
              background-color: #ff4e4e;
            }

            .text {
              margin-left: 10px;
            }

            .arrow {
              margin-left: 5px;

              i {
                font-size: 11px;
              }
            }
          }
        }
        td {
          box-sizing: border-box;
          padding-top: 4px;
          padding-bottom: 4px;
          border-bottom-width: 0 !important;
          line-height: 22px;
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
