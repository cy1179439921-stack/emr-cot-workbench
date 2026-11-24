<template>
  <div class="container">
    <div class="list-div">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="titleSearch">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="合同编号" class="form-query-select">
              <el-input v-model="searchInfo.contractNo" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="专家姓名" class="form-query-select">
              <el-input v-model="searchInfo.name" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="手机号" class="form-query-select">
              <el-input v-model="searchInfo.phone" clearable placeholder="请填写内容" maxlength="11" @keyup.enter="onSubmit" oninput="value=value.replace(/[^\d.]/g,'')"></el-input>
            </el-form-item>
            <!-- <el-form-item label="医院-科室" class="form-query-select">
              <el-select v-model="searchInfo.hospital" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择一项">
                <el-option
                  v-for="item in getAgencyData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
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
            <el-form-item label="合同状态" class="form-query-select">
              <commonMultipleSelect v-model="searchInfo.contractStatus" :options="statusOption" placeholder="请选择一项"/>
            </el-form-item>
            <el-form-item label="发起时间" class="form-query-select">
              <el-date-picker
                clearable
                placeholder="请选择一项"
                range-separator="-"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                v-model="searchInfo.startTime"
              />
              <!-- <el-input v-model="searchInfo.startTime" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input> -->
            </el-form-item>
            <el-form-item label="签署时间" class="form-query-select">
              <el-date-picker
                clearable
                placeholder="请选择一项"
                range-separator="-"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                v-model="searchInfo.signTime"
              />
              <!-- <el-input v-model="searchInfo.signTime" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input> -->
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
          <div>劳务合同列表</div>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable btnsLastCell" :data="tableData">
            <el-table-column prop="contractNo" label="合同编号" :min-width="echartsToPx(180)">
              <template #default="scope">
                <span>{{ scope.row.contractNo || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="expertName" label="专家姓名" :min-width="echartsToPx(100)"></el-table-column>
            <el-table-column prop="expertPhone" label="手机号" :min-width="echartsToPx(120)"></el-table-column>
            <el-table-column prop="hospitalName" label="医院名称" :min-width="echartsToPx(100)"></el-table-column>
            <el-table-column prop="deptName" label="科室名称" :min-width="echartsToPx(100)"></el-table-column>

            <el-table-column prop="contractStatus" label="合同状态" :min-width="echartsToPx(100)">
              <template #default="scope">
                <div class="statusCell">
                  <span
                    v-if="getStatusConfig(scope.row.contractStatus)"
                    class="statusDot"
                    :class="getStatusConfig(scope.row.contractStatus).dotClass"
                  ></span>
                  <span>{{ getStatusConfig(scope.row.contractStatus)?.label || scope.row.statusName || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="submitTime" label="发起时间" :min-width="echartsToPx(150)">
              <template #default="scope">
                <span>{{ scope.row.submitTime || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="signedTime" label="签署时间" :min-width="echartsToPx(150)">
              <template #default="scope">
                <span>{{ scope.row.signedTime || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" :min-width="echartsToPx(150)">
              <template #default="scope">
                <el-button type="primary" link @click="viewDetail(scope.row)">查看</el-button>
                <template v-if="(scope.row.contractStatus==='PENDING'||scope.row.contractStatus==='REJECTED'||scope.row.contractStatus==='EXPIRED')&&(!needCheckPermission || hadPermissionList.includes('发起劳务签署'))">
                  <el-button type="primary" link @click="viewDetail(scope.row)">发起劳务签署</el-button>
                </template>
                <template v-if="(scope.row.contractStatus==='INITIATED'||scope.row.contractStatus==='SIGNED'||scope.row.contractStatus==='REJECTED')&&(!needCheckPermission || hadPermissionList.includes('下载'))">
                  <el-button type="primary" link @click="handleDownLoad(scope.row)">下载</el-button>
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

</template>

<script>
export default {
  name: 'laborContractList'
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { echartsToPx, formatDateTime } from '@/utils/utils.js'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import router from '@/router'
import { getContractList, getContractDownload } from '@/api/api_expertManagement.js'
import { getAllAgencyByCity, getAngencyAndDepartmentTreeListByRole } from '@/api/api_home'
import { getPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/expertManagement/contractManagement')
const currentPage = ref(1)
const limit = ref(20)
const departmentOptions = ref([])
const getAngencyAndDepartmentTreeListFn = () => {
  getAngencyAndDepartmentTreeListByRole().then(res => {
    if (res.code === 10000) {
      departmentOptions.value = res.data || []
    }
  })
}
const searchInfo = ref({
  contractNo: '',
  name: '',
  phone: '',
  hospital: [],
  contractStatus: [],
  startTime: [],
  signTime: []
})

const total = ref(0)
const tableData = ref([
  // {
  //   name: '888',
  //   contractStatus: 'PENDING'
  // },
  // {
  //   name: '888',
  //   contractStatus: 'INITIATED'
  // },
  // {
  //   name: '888',
  //   contractStatus: 'SIGNED'
  // },
  // {
  //   name: '888',
  //   contractStatus: 'REJECTED'
  // },
  // {
  //   name: '888',
  //   contractStatus: 'EXPIRED'
  // }
])

// 状态配置（可按具体业务的数字/字符串枚举调整）
const statusOption = [
  { label: '待发起', value: 'PENDING', dotClass: 'statusDot1' },
  { label: '已发起待签署', value: 'INITIATED', dotClass: 'statusDot2' },
  { label: '已签署', value: 'SIGNED', dotClass: 'statusDot3' },
  { label: '已驳回', value: 'REJECTED', dotClass: 'statusDot5' },
  { label: '已过期', value: 'EXPIRED', dotClass: 'statusDot4' }
]
const getStatusConfig = (status) => statusOption.find(item => item.value === status)

// 重置条件
const resetParams = () => {
  searchInfo.value = {
    contractNo: '',
    name: '',
    phone: '',
    hospital: [],
    contractStatus: [],
    startTime: [],
    signTime: []
  }
  currentPage.value = 1
  getListData()
}

const onSubmit = () => {
  currentPage.value = 1
  getListData()
}

// 获取接口数据
const getListData = async () => {
  // const { auditTime, submitTime, ...rest } = searchInfo.value
  const params = {
    ...searchInfo.value,
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  const res = await getContractList(params)
  if (res.code === 10000) {
    tableData.value = res.data?.items || []
    total.value = res.data.total
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

// 查看详情
const viewDetail = (row) => {
  console.log('查看详情:', row)
  router.push({
    path: '/expertManagement/contractManagementDetail',
    query: { id: row.id }
  })
}

const handleDownLoad = (row) => {
  ElMessageBox.confirm('即将下载劳务合同，是否继续？', '确认', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    // getContractDownload({ id: row.id }).then(res => {
    //   if (res.code === 10000) {
    //     const fileUrl = res.data.downloadUrl
    //     const name = '线上劳务协议文档' // 如果没有文件扩展名则使用 fileName
    //     if (name) {
    //       const link = document.createElement('a')
    //       link.href = fileUrl
    //       link.download = name
    //       link.target = '_blank' // 可选，如果希望在新窗口中下载文件，请取消注释此行
    //       link.click()
    //       link.remove()
    //       ElMessage.success('文件已开始下载')
    //     } else {
    //       ElMessage({ message: '文件地址无效，请联系管理员核对', type: 'error' })
    //     }
    //   }
    // })
    getContractDownload({ id: row.id }).then(async (res) => {
      if (res.code === 10000) {
        const fileUrl = res.data.downloadUrl
        const fileName = row.accountName + '劳务协议文档_' + formatDateTime(new Date()) + '.pdf' // 建议加上具体的扩展名，如 .pdf / .docx

        try {
          // 1. 请求文件链接获取 Blob 对象
          const response = await fetch(fileUrl)
          const blob = await response.blob()

          // 2. 创建本地的临时 Blob URL
          const blobUrl = window.URL.createObjectURL(blob)

          // 3. 创建 a 标签并触发下载
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = fileName
          document.body.appendChild(link)
          link.click()

          // 4. 清理内存和 DOM
          document.body.removeChild(link)
          window.URL.revokeObjectURL(blobUrl)

          ElMessage.success('文件已开始下载')
        } catch (error) {
          console.error('文件下载失败:', error)
          ElMessage.error('文件没能文件已开始下载，请稍后重试')
        }
      } else {
        ElMessage.error(res.msg || '获取下载地址失败')
      }
    })
  })
}
const getAgencyData = ref([])
// 获取医院列表
const getAgencyAllData = async() => {
  const res = await getAllAgencyByCity({})
  if (res.code === 10000) {
    getAgencyData.value = res.data
  }
}

onMounted(() => {
  getListData()
  getAngencyAndDepartmentTreeListFn()
  getAgencyAllData()
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
    .statusDot3 { background: #04a273; }
    .statusDot4 { background: #f59f0c; }
    .statusDot5 { background: #ff4e4e; }
  }
}

:deep(.commonSearch) {
  &.el-form {
    flex-wrap: wrap;
    flex: 1;
  }
}
</style>
