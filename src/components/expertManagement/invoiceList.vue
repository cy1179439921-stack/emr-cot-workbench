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
            <el-form-item label="单据状态" class="form-query-select">
              <commonMultipleSelect v-model="searchInfo.status" :options="statusOption" placeholder="请选择一项"/>
            </el-form-item>
            <el-form-item label="生成时间" class="form-query-select">
              <el-date-picker
                clearable
                placeholder="请选择一项"
                range-separator="-"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                v-model="searchInfo.createTime"
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
            <el-table-column prop="settlementStatus" label="单据状态" :min-width="echartsToPx(100)">
              <template #default="scope">
                <div class="statusCell">
                  <span
                    v-if="getStatusConfig(scope.row.settlementStatus)"
                    class="statusDot"
                    :class="getStatusConfig(scope.row.settlementStatus).dotClass"
                  ></span>
                  <span>{{ getStatusConfig(scope.row.settlementStatus)?.label || scope.row.statusName || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="settlementAmount" label="结算金额" :min-width="echartsToPx(120)">
              <template #default="scope">
                <span class="amountCell">¥ {{ formatAmount(scope.row.settlementAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="生成时间" :min-width="echartsToPx(150)"></el-table-column>
            <el-table-column label="操作" fixed="right" :min-width="echartsToPx(120)">
              <template #default="scope">
                <el-button type="primary" link @click="viewDetail(scope.row)">查看</el-button>

                <!-- 待发起结算状态的操作 -->

                <template v-if="scope.row.settlementStatus === 'PENDING_CONFIRM'">
                  <el-button type="primary" link :loading="downloading" v-if="!needCheckPermission || hadPermissionList.includes('下载')" @click="handleDownload(scope.row)">下载</el-button>
                  <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('提交结算单')" @click="handleSubmitStatement(scope.row)">提交结算单</el-button>
                </template>

                <!-- 待专家确认状态的操作 -->
                <template v-if="scope.row.settlementStatus === 'WAITING_EXPERT_CONFIRM'">
                  <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('下载')" :loading="downloading" @click="handleDownload(scope.row)">下载</el-button>
                </template>
                <!-- 待打款 -->
                <template v-if="scope.row.settlementStatus === 'WAITING_PAYMENT'">
                  <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('下载')" :loading="downloading" @click="handleDownload(scope.row)">下载</el-button>
                  <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('已打款')" @click="handleSubmitStatement(scope.row)">已打款</el-button>
                </template>
                <template v-if="scope.row.settlementStatus === 'SETTLED'">
                  <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('下载')" :loading="downloading" @click="handleDownload(scope.row)">下载</el-button>
                  <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('归档')" @click="handlePush(scope.row)">归档</el-button>
                </template>
                <template v-if="scope.row.settlementStatus === 'REJECTED'">
                  <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('下载')" :loading="downloading" @click="handleDownload(scope.row)">下载</el-button>
                  <el-button type="primary" link v-if="!needCheckPermission || hadPermissionList.includes('提交结算单')" @click="handleSubmitStatement(scope.row)">提交结算单</el-button>
                </template>
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
  </div>

  <!-- 结算单导出模板（离屏渲染） -->
  <SettlementStatement ref="statementRef" />

</template>

<script>
export default {
  name: 'settlementList'
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SettlementStatement from '@/components/expertManagement/settlementStatement.vue'
import { echartsToPx } from '@/utils/utils.js'
import { getAngencyAndDepartmentTreeListByRole } from '@/api/api_home'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import { getInvoiceList, archiveSettlement } from '@/api/api_expertManagement.js'
import { INVOICE_DEMO_LIST } from '@/mock/demoModules'
import { withTimeout } from '@/utils/requestFallback'
import router from '@/router'
import { getPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/invoiceManagement/invoiceList')
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
  createTime: []
})

const total = ref(0)
const tableData = ref([])

// 单据状态映射示例（可根据后端具体枚举调整）
const statusOption = [
  { label: '待申请结算', value: 'UNSETTLED', dotClass: 'statusDot1' },
  { label: '待发起结算', value: 'PENDING_CONFIRM', dotClass: 'statusDot1' },
  { label: '待专家确认', value: 'WAITING_EXPERT_CONFIRM', dotClass: 'statusDot2' },
  { label: '待打款', value: 'WAITING_PAYMENT', dotClass: 'statusDot3' },
  { label: '已结清', value: 'SETTLED', dotClass: 'statusDot4' },
  { label: '已结清', value: 'ARCHIVED', dotClass: 'statusDot4' },
  { label: '已驳回', value: 'REJECTED', dotClass: 'statusDot5' }
]
const getStatusConfig = (status) => statusOption.find(item => item.value === status)
// 结算金额展示：千分位 + 两位小数
const formatAmount = (val) => {
  const num = Number(val)
  if (!Number.isFinite(num)) return '0.00'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 重置查询条件
const resetParams = () => {
  searchInfo.value = {
    settlementNo: '',
    doctorName: '',
    hospital: [],
    department: [],
    status: [],
    createTime: []
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
    tab: 'active',
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  const res = await withTimeout(getInvoiceList(params))
  if (res && res.code === 10000 && res.data?.items?.length) {
    tableData.value = res.data.items
    total.value = res.data.total
  } else {
    // 演示环境无后端：使用演示数据，保证列表与新字段可见
    tableData.value = INVOICE_DEMO_LIST
    total.value = INVOICE_DEMO_LIST.length
  }
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
    path: '/invoiceManagement/invoiceListDetail',
    query: { id: row.id }
  })
}

const handleSubmitStatement = (row) => {
  router.push({
    path: '/invoiceManagement/invoiceListEdit',
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

const handlePush = (row) => {
  ElMessageBox.confirm('归档后会从待处理列表移出，确认归档吗？', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    archiveSettlement({ id: row.id }).then(res => {
      if (res.code === 10000) {
        ElMessage.success('已归档')
        getListData()
      }
    })
  })
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
    }

    .statusDot1 { background: #666; }
    .statusDot2 { background: #3670f8; }
    .statusDot4 { background: #04a273; }
    .statusDot3 { background: #666; }
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
