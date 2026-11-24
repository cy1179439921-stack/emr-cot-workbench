<template>
  <div class="indexDetails">
    <div class="indexSection">
      <header>
        <el-form ref="searchForm" :inline="true" :model="searchInfo" label-width="65px" @submit.prevent>
          <span class="title">查询指标</span>
          <el-form-item label="指标名称" class="form-query-select">
            <el-input v-model="searchInfo.indicatorName" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
          </el-form-item>
        </el-form>
        <div class="btnDiv">
          <el-button @click="resetParams">重置条件</el-button>
          <el-button type="primary" @click="onSubmit">查 询</el-button>
        </div>
      </header>
      <div class="indexSection-body">
        <header>指标详情</header>
        <myTable
          ref="myTableRef"
          class="myTable"
          :tableData="common.tableData"
          :column="common.column"
          :pagination="false"
          :pageResult="pageResult"
          @handleSizeChange="handleSizeChange"
          @handleCurrentChange="handleCurrentChange"
        >
          <template #status="scope">
            <span>{{ scope.row }}</span>
          </template>
        </myTable>
        <div class="tabel_pagination">
          <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
            <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexDetails'
}
</script>
<script setup>
import { ref, reactive } from 'vue'
import { getIndicatorDetail } from '@/api/api_patient'

const pageResult = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const searchInfo = ref({
  indicatorName: ''
})

// 加载时请求页面列表
const init = async() => {
  getData()
}
// 获取列表数据
const getData = async() => {
  const params = {
    // id: curMedicalRecord.id,
    id: '911951674661277696',
    pageNum: currentPage.value,
    pageSize: limit.value,
    indicatorName: searchInfo.value.indicatorName
  }
  // 指标详情
  const res = await getIndicatorDetail(params)
  if (res.code === 10000) {
    common.tableData = res.data.items
    total.value = res.data.total
  }
}
init()
// 重置
const resetParams = () => {
  searchInfo.value = {
    indicatorName: ''
  }
  getData()
}
// 搜索
const onSubmit = () => {
  getData()
}
const common = reactive({
  text: '',
  tableData: [],
  column: [{ label: '指标名称', value: 'indicatorName', fixed: 'left' },
    { label: '结果', value: 'result', fixed: 'left' },
    { label: '单位', value: 'unit', fixed: 'left' },
    { label: '时间日期', value: 'date', fixed: 'left' },
    { label: '值域', value: 'range', fixed: 'left' }
  ]
})
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
</script>

<style scoped lang="scss">
.indexDetails {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .indexSection {
    display: flex;
    flex-direction: column;
    flex: 1;
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 52px;
      padding: 0 26px;
      border-radius: 16px;
      background-color: var(--theme-card);
      .title {
        margin-right: 16px;
        font-weight: 500;
        color: var(--theme-text);
      }
      .btnDiv {
        .el-button {
          width: 120px;
          height: 28px;
          border-radius: 14px;
          &:nth-child(2) {
            margin-left: 14px;
          }
        }
      }
    }
    .indexSection-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      margin-top: 14px;
      padding: 0 10px;
      border-radius: 16px;
      background-color: var(--theme-card);
      header {
        height: 52px;
        padding-left: 16px;
        font-weight: 500;
        color: var(--theme-text);
      }
      :deep(.myTable) {
        flex: 1;
        padding-bottom: 0;
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
                  &+.el-button {
                    margin-left: 7px;
                  }
                }
                .blueBtn {
                  color: var(--el-color-primary);
                  &.is-disabled {
                    color: rgba(149, 149, 149, .55);
                  }
                }
                .redBtn {
                  color: #f76868;
                }
              }
            }
          }
        }
      }
      .tabel_pagination {
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
