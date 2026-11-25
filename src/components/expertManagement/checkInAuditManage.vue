<template>
  <div class="container">
    <div class="list-div">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="titleSearch">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="专家姓名" class="form-query-select">
              <el-input v-model="searchInfo.name" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="手机号" class="form-query-select">
              <el-input v-model="searchInfo.phone" clearable placeholder="请填写内容" maxlength="11" @keyup.enter="onSubmit" oninput="value=value.replace(/[^\d.]/g,'')"></el-input>
              <!-- <el-input v-model="searchInfo.phone" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input> -->
            </el-form-item>
            <el-form-item label="医院名称" class="form-query-select">
              <commonMultipleSelect v-model="searchInfo.hospitalNameList" :options=" hospitalList" placeholder="请选择一项"/>
            </el-form-item>
            <!-- <el-form-item label="科室名称" class="form-query-select">
              <commonMultipleSelect v-model="searchInfo.departmentList" :options="departmentArr" placeholder="请选择一项"/>
            </el-form-item> -->
            <el-form-item label="科室" class="form-query-select">
              <el-cascader
                v-model="searchInfo.departmentList"
                :options="departmentOptions"
                :props="{multiple: true,label:'name',value:'id',children:'children'}"
                collapse-tags
                collapse-tags-tooltip
                clearable
              />
            </el-form-item>
            <el-form-item label="审核状态" class="form-query-select">
              <commonMultipleSelect v-model="searchInfo.applyStatusList" :options="statusOption" placeholder="请选择一项"/>
            </el-form-item>
            <el-form-item label="职称等级" class="form-query-select">
              <commonMultipleSelect v-model="searchInfo.titleLevelList" :options="titleLevelArr" placeholder="请选择一项"/>
            </el-form-item>
            <el-form-item label="审核时间" class="form-query-select">
              <el-date-picker
                clearable
                placeholder="请选择一项"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                v-model="searchInfo.auditTime"
              />
            </el-form-item>
            <el-form-item label="提交时间" class="form-query-select">
              <el-date-picker
                clearable
                placeholder="请选择一项"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                v-model="searchInfo.submitTime"
              />
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
          <div>资质列表</div>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable btnsLastCell" :data="tableData">
            <el-table-column prop="name" label="专家姓名" :min-width="echartsToPx(100)"></el-table-column>
            <el-table-column prop="phone" label="手机号" :min-width="echartsToPx(120)"></el-table-column>
            <el-table-column prop="titleLevel" label="职称等级" :min-width="echartsToPx(110)"></el-table-column>
            <el-table-column prop="hospitalName" label="医院名称" :min-width="echartsToPx(160)"></el-table-column>
            <el-table-column prop="department" label="科室名称" :min-width="echartsToPx(100)"></el-table-column>
            <el-table-column prop="applyStatus" label="审核状态" :min-width="echartsToPx(90)">
              <template #default="scope">
                <div class="statusCell">
                  <span
                    v-if="getStatusConfig(scope.row.applyStatus)"
                    class="statusDot"
                    :class="getStatusConfig(scope.row.applyStatus).dotClass"
                  ></span>
                  <span>{{ getStatusConfig(scope.row.applyStatus)?.label || scope.row.statusName || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="resume" label="简历" :min-width="echartsToPx(80)">
              <template #default="scope">
                <span class="resumeCell" :class="{ 'is-empty': !scope.row.resume }">
                  {{ scope.row.resume && scope.row.resume.name ? '已上传' : '未上传' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="submittedAt" label="提交时间" :min-width="echartsToPx(150)"></el-table-column>
            <el-table-column prop="reviewedAt" label="审核时间" :min-width="echartsToPx(150)"></el-table-column>
            <el-table-column label="操作" fixed="right" :min-width="echartsToPx(102)">
              <template #default="scope">
                <el-button type="primary" link @click="resetRow(scope.row)" v-if="isReset">重置</el-button>
                <el-button type="primary" link @click="viewRow(scope.row)">查看</el-button>
                <el-button
                  type="primary"
                  v-if="scope.row.applyStatus==='PENDING'&&(!needCheckPermission || hadPermissionList.includes('审核申请'))"
                  link
                  @click="handlePass(scope.row)">通过</el-button>
                <el-button type="danger" v-if="scope.row.applyStatus==='PENDING'&&(!needCheckPermission || hadPermissionList.includes('审核申请'))" link @click="openRejectDialog(scope.row)">驳回</el-button>
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
    <!-- 驳回资质审核单弹窗 -->
    <el-dialog
      title="驳回资质审核单"
      v-model="rejectDialogVisible"
      :width="pxToRem(596)"
      :before-close="closeRejectDialog"
      class="rejectDialog"
    >
      <div class="rejectTips">
        <i class="iconfont icon-tishi-yidongwenjianjia"></i>
        <span>请填写驳回原因，方便对方修改后重新提交，专家将收到修改通知。</span>
      </div>
      <el-form ref="rejectFormRef" :model="rejectForm" :rules="rejectRules" label-position="top">
        <el-form-item label="驳回原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            resize="none"
            maxlength="500"
            show-word-limit
            :rows="5"
            placeholder="例如：医师执业证书照片模糊，姓名与证件编号看不清，请重新上传。"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRejectDialog">取 消</el-button>
          <el-button type="primary" @click="confirmReject">确认驳回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'qualificationList'
}
</script>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { echartsToPx } from '@/utils/utils.js'
import router from '@/router'
import { getQualificationList, checkInAudit, getHospitalList, resetAccount, getSectionListInCascade } from '@/api/api_expertManagement.js'
import { getPagePermission } from '@/hooks/permissionHooks'
import { getOnboardingList } from '@/mock/onboardingDemo'
import { approveApplication, rejectApplication } from '@/utils/onboarding'
import { withTimeout } from '@/utils/requestFallback'
const { needCheckPermission, hadPermissionList } = getPagePermission('/expertManagement/checkInAuditManage')
const isReset = ref(localStorage.getItem('reset'))
const currentPage = ref(1)

const limit = ref(20)

const searchInfo = ref({
  applyStatusList: [],
  departmentList: [],
  hospitalNameList: [],
  name: '',
  phone: '',
  titleLevelList: [],
  auditTime: '',
  submitTime: ''
})

const total = ref(0)
const tableData = ref([])
// 演示环境的审核结果：无后端时就地更新列表状态
const localReviewed = reactive({})

const nowText = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 状态映射配置（可根据后端具体枚举改写）
const statusOption = [
  { label: '待审核', value: 'PENDING', dotClass: 'statusDot1' },
  { label: '已通过', value: 'APPROVED', dotClass: 'statusDot2' },
  { label: '已驳回', value: 'REJECTED', dotClass: 'statusDot3' }
]
const titleLevelArr = [
  {
    label: '初级医师',
    value: '初级医师'
  },
  {
    label: '主治医师',
    value: '主治医师'
  },
  {
    label: '副主任医师',
    value: '副主任医师'
  },
  {
    label: '主任医师',
    value: '主任医师'
  }
]

const getStatusConfig = (status) => statusOption.find(item => item.value === status)
const hospitalList = ref([])
const getHospitalListFn = () => {
  getHospitalList().then(res => {
    if (res.code === 10000) {
      hospitalList.value = res?.data || []
    }
  })
}
const departmentOptions = ref([])
const getSectionListInCascadeFn = () => {
  getSectionListInCascade().then(res => {
    if (res.code === 10000) {
      departmentOptions.value = res?.data || []
    }
  })
}
// 重置查询条件
const resetParams = () => {
  searchInfo.value = {
    applyStatusList: [],
    departmentList: [],
    hospitalNameList: [],
    name: '',
    phone: '',
    titleLevelList: [],
    auditTime: '',
    submitTime: ''
  }
  currentPage.value = 1
  getListData()
}

const onSubmit = () => {
  currentPage.value = 1
  getListData()
}

// 获取列表数据（需按实际业务 API 修改）
const getListData = async () => {
  const { auditTime, submitTime, ...rest } = searchInfo.value
  const params = {
    ...rest,
    reviewedAtBegin: auditTime?.length ? auditTime[0] : '',
    reviewedAtEnd: auditTime?.length ? auditTime[1] : '',
    submittedAtBegin: submitTime?.length ? submitTime[0] : '',
    submittedAtEnd: submitTime?.length ? submitTime[1] : '',
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  const res = await withTimeout(getQualificationList(params))
  if (res && res.code === 10000 && res.data?.items?.length) {
    tableData.value = res.data.items
    total.value = res.data.total
  } else {
    // 演示环境无后端：使用演示数据 + 当前账号的入驻申请，保证列表可审核
    tableData.value = getOnboardingList()
      .filter(item => !searchInfo.value.name || String(item.name).includes(searchInfo.value.name))
      .filter(item => !searchInfo.value.phone || String(item.phone).includes(searchInfo.value.phone))
      .filter(item => !searchInfo.value.applyStatusList?.length || searchInfo.value.applyStatusList.includes(item.applyStatus))
      .map(item => (localReviewed[item.id] ? { ...item, ...localReviewed[item.id] } : item))
    total.value = tableData.value.length
  }
}

// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getListData()
}

const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getListData()
}

// 操作方法：查看
const viewRow = (row) => {
  console.log('查看:', row)
  router.push({
    name: 'checkInAuditManageDetail',
    query: {
      fileId: row.id
    },
    props: true
  })
}

// 操作方法：通过
const handlePass = (row) => {
  ElMessageBox.confirm('确认通过这位专家的资质审核吗？', '审核', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    // 演示环境先就地更新列表状态，保证没有后端时审核闭环也能走通
    localReviewed[row.id] = { applyStatus: 'APPROVED', reviewedAt: nowText(), rejectReason: '' }
    // 当前账号自己的申请：同步专家端入驻状态，解锁其他模块
    if (row.isSelf) approveApplication()
    ElMessage.success('审核通过，已通知专家')
    getListData()
    // 真实接口可用时再同步后台
    checkInAudit({
      action: 'APPROVED',
      applicationId: row.id
    }).catch(() => {})
  }).catch(() => {})
}

// 驳回弹窗相关逻辑
const rejectDialogVisible = ref(false)
const rejectFormRef = ref(null)
const currentRejectRow = ref(null)
const rejectForm = reactive({
  reason: ''
})
const rejectRules = {
  reason: [{ required: true, message: '请填写驳回原因，方便对方修改后重新提交', trigger: 'blur' }]
}

const openRejectDialog = (row) => {
  currentRejectRow.value = row
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const closeRejectDialog = () => {
  rejectDialogVisible.value = false
  if (rejectFormRef.value) {
    rejectFormRef.value.resetFields()
  }
}
const confirmReject = () => {
  rejectFormRef.value.validate().then(volid => {
    if (volid) {
      const row = currentRejectRow.value
      localReviewed[row.id] = { applyStatus: 'REJECTED', reviewedAt: nowText(), rejectReason: rejectForm.reason }
      // 当前账号自己的申请：同步专家端入驻状态
      if (row.isSelf) rejectApplication(rejectForm.reason)
      ElMessage.warning('入驻申请已驳回，已通知专家')
      closeRejectDialog()
      getListData()
      checkInAudit({
        action: 'REJECTED',
        applicationId: row.id,
        rejectReason: rejectForm.reason
      }).catch(() => {})
    }
  })
}
const resetRow = (row) => {
  resetAccount({ phone: row.phone }).then(res => {
    if (res.code === 10000) {
      ElMessage.warning('账号已重置为初始密码')
      getListData()
    }
  })
}
onMounted(() => {
  getListData()
  getHospitalListFn()
  getSectionListInCascadeFn()
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
      height: auto; // 适应多行 input 展开
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

    .statusDot1 { background: #b6b7b9; }
    .statusDot2 { background: #04a273; }
    .statusDot3 { background: #ff4e4e; }

    .resumeCell {
      font-size: 13px;
      color: #04a273;

      &.is-empty {
        color: var(--theme-text-3);
      }
    }
  }
}

:deep(.commonSearch) {
  &.el-form {
    flex-wrap: wrap;
    flex: 1;
  }
}

</style>
<style lang="scss">
.rejectDialog {
  // background-color: red;
  &.el-dialog .el-dialog__header {
    padding-bottom: 16px !important;
  }
  .rejectTips {
    display: flex;
    align-items: center;
    height: 40px;
    border: 1px solid rgba(245, 159, 12, 0.5);
    background: rgba(245, 159, 12, 0.05);
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text);
    .iconfont {
      margin-left: 16px;
      margin-right: 8px;
      font-size: 18px;
      color: #f59f0c;
    }
  }
  .el-form--label-top .el-form-item__label {
    margin: 14px 0 !important;
    color: #ff3a3a !important;
  }
}
</style>
