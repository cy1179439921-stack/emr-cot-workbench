<template>
  <div class="container">
    <div class="list-div">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="titleSearch">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="结算单编号" class="form-query-select">
              <el-input v-model="searchInfo.settlementNo" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="医师姓名" class="form-query-select">
              <el-input v-model="searchInfo.doctorName" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <!-- <el-form-item label="医院名称" class="form-query-select">
              <el-input v-model="searchInfo.hospital" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="科室名称" class="form-query-select">
              <el-input v-model="searchInfo.department" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item> -->
            <el-form-item label="医院-科室" class="form-query-select">
              <el-cascader
                v-model="searchInfo.department"
                :options="departmentOptions"
                :props="{multiple: true,label:'name',value:'id',children:'departmentList'}"
                collapse-tags
                collapse-tags-tooltip
                clearable
              />
            </el-form-item>
            <el-form-item label="归档时间" class="form-query-select">
              <el-date-picker
                clearable
                placeholder="请选择一项"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                v-model="searchInfo.archiveTime"
              />
              <!-- <el-input v-model="searchInfo.createTime" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input> -->
            </el-form-item>
          </el-form>
          <div class="btnDiv">
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </div>
      </header>

      <div class="list-section">
        <header class="table-header">
          <div>结算单列表</div>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable btnsLastCell" :data="tableData">
            <el-table-column prop="settlementNo" label="结算单编号" :min-width="echartsToPx(170)"></el-table-column>
            <el-table-column prop="doctorName" label="医师姓名" :min-width="echartsToPx(100)"></el-table-column>
            <el-table-column prop="doctorTitle" label="医师职称" :min-width="echartsToPx(110)"></el-table-column>
            <el-table-column prop="hospitalName" label="医院名称" :min-width="echartsToPx(160)"></el-table-column>
            <el-table-column prop="deptName" label="科室名称" :min-width="echartsToPx(100)"></el-table-column>
            <el-table-column prop="settlementStatusDesc" label="单据状态" :min-width="echartsToPx(100)">
              <template #default="scope">
                <div class="statusCell">
                  <span class="statusDot"></span>
                  <span>{{ scope.row.settlementStatusDesc }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="settlementAmount" label="结算金额" :min-width="echartsToPx(120)">
              <template #default="scope">
                <span class="amountCell">¥ {{ formatAmount(scope.row.settlementAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="archiveTime" label="归档时间" :min-width="echartsToPx(160)"></el-table-column>
            <el-table-column label="操作" fixed="right" :min-width="echartsToPx(70)">
              <template #default="scope">
                <el-button type="primary" link @click="viewDetail(scope.row)">查看</el-button>
                <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('下载')" :loading="downloading" @click="handleDownload(scope.row)">下载</el-button>
              </template>
            </el-table-column>
          </commonTable>
          <div class="tabel_pagination">
            <el-pagination
              class="bottomPagination"
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
              v-model:current-page="currentPage"
              :page-size="limit"
              :total="total"
            >
              <template #default>
                <span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span>
              </template>
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <!-- 结算单导出模板（离屏渲染）：放在 container 内，保持单一根节点 -->
    <SettlementStatement ref="statementRef" />
  </div>
</template>

<script>
export default {
  name: 'settlementList'
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { echartsToPx } from '@/utils/utils.js'
import SettlementStatement from '@/components/expertManagement/settlementStatement.vue'
import { getAngencyAndDepartmentTreeListByRole } from '@/api/api_home'
import { getInvoiceList } from '@/api/api_expertManagement.js'
import { INVOICE_ARCHIVED_DEMO_LIST } from '@/mock/demoModules'
import { withTimeout } from '@/utils/requestFallback'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/invoiceManagement/archivingInvoiceList')
const departmentOptions = ref([])
const getAngencyAndDepartmentTreeListFn = () => {
  getAngencyAndDepartmentTreeListByRole().then(res => {
    if (res.code === 10000) {
      departmentOptions.value = res.data || []
    }
  })
}
const currentPage = ref(1)
const limit = ref(20)

const searchInfo = ref({
  settlementNo: '',
  doctorName: '',
  hospital: [],
  department: [],
  status: [],
  archiveTime: []
})

const total = ref(0)
const tableData = ref([])

// 重置查询条件
const resetParams = () => {
  searchInfo.value = {
    settlementNo: '',
    doctorName: '',
    hospital: [],
    department: [],
    status: [],
    archiveTime: []
  }
  currentPage.value = 1
  getListData()
}

const onSubmit = () => {
  currentPage.value = 1
  getListData()
}

// 获取列表数据
const getListData = async () => {
  const params = {
    ...searchInfo.value,
    tab: 'archive',
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  const res = await withTimeout(getInvoiceList(params))
  if (res && res.code === 10000 && res.data?.items?.length) {
    tableData.value = res.data.items
    total.value = res.data.total
  } else {
    // 演示环境无后端：使用演示数据，保证列表与新字段可见
    tableData.value = INVOICE_ARCHIVED_DEMO_LIST
    total.value = INVOICE_ARCHIVED_DEMO_LIST.length
  }
}

// 结算金额展示：千分位 + 两位小数
const formatAmount = (val) => {
  const num = Number(val)
  if (!Number.isFinite(num)) return '0.00'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getListData()
}

const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getListData()
}

// 操作事件
const viewDetail = (row) => {
  console.log('查看详情:', row)
  router.push({
    path: '/invoiceManagement/archivingInvoiceDetail',
    query: { id: row.id }
  })
}
const downloading = ref(false)
const statementRef = ref(null)
// 下载结算单（带内存释放防御）
const handleDownload = async (row) => {
  if (downloading.value) return
  downloading.value = true
  try {
    await statementRef.value?.download(row, `结算单_${row.settlementNo || row.id || '未命名'}`)
    ElMessage.success('文件已开始下载')
  } catch (error) {
    console.error('下载失败', error)
    ElMessage.error('结算单生成失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}
onMounted(() => {
  getListData()
  getAngencyAndDepartmentTreeListFn()
})
</script>

<style scoped lang="scss">
@use "@/style/common/list.scss";
.container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
}
.list-div {
  .header-query {
    &.list-header {
      height: auto;
      padding-bottom: 16px;
    }
    .titleSearch {
      display: flex;
      align-items: baseline;
      width: 100%;
      .btnDiv {
        display: flex;
        align-items: center;
        margin-left: 16px;
        white-space: nowrap;
      }
    }
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tableMain {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 0;

    :deep(.singleTable) {
      flex: 1;
    }

    .statusCell {
      display: flex;
      align-items: center;
    }

    .statusDot {
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      margin-right: 8px;
      border-radius: 50%;
      background: #04a273;
    }
    .statusDot1 { background: #666; }
    .statusDot2 { background: #3670f8; }
    .statusDot4 { background: #04a273; }
    .statusDot3 { background: #f59f0c; }
    .statusDot5 { background: #ff4e4e; }
  }
}

:deep(.commonSearch) {
  &.el-form {
    flex-wrap: wrap;
    flex: 1;
  }
}

.amountCell {
  font-weight: 600;
  font-size: 13px;
  color: #1f2d3d;
}
</style>
