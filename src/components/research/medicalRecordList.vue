<template>
  <div class="list-div">
    <header class="list-header header-query" v-if="!hideQueryHeader">
      <div class="conditionTitle">
        <div class="title">查询条件</div>
      </div>
      <div class="titleSearch">
        <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
          <el-form-item label="文件ID" class="form-query-select">
            <el-input v-model="searchInfo.id" clearable placeholder="请填写内容" maxlength="19" @keyup.enter="onSubmit" oninput="value=value.replace(/[^\d.]/g,'')"></el-input>
          </el-form-item>
          <el-form-item label="病历ID" class="form-query-select">
            <el-input v-model="searchInfo.documentId" clearable placeholder="请填写内容" maxlength="19" @keyup.enter="onSubmit" oninput="value=value.replace(/[^\d.]/g,'')"></el-input>
          </el-form-item>
          <el-form-item label="文件状态" class="form-query-select">
            <commonMultipleSelect v-model="searchInfo.proofreadStatusList" :options="statusOption" placeholder="请选择一项"/>
          </el-form-item>
          <el-form-item label="审核状态" class="form-query-select">
            <commonMultipleSelect v-model="searchInfo.reviewStatusList" :options="reviewStatusOption" placeholder="请选择一项"/>
          </el-form-item>
          <el-form-item label="所属医院-科室" class="form-query-select">
            <el-cascader
              v-model="searchInfo.department"
              :options="departmentOptions"
              :props="{multiple: true,label:'name',value:'id',children:'departmentList'}"
              collapse-tags
              collapse-tags-tooltip
              clearable
            />
          </el-form-item>
          <!-- <el-form-item label="所属医院" class="form-query-select">
            <commonMultipleSelect v-model="searchInfo.agencyIds" :options="agencyList" placeholder="请选择一项"/>
          </el-form-item> -->

          <el-form-item label="校对人" class="form-query-select">
            <commonMultipleSelect v-model="searchInfo.proofreaderIds" :options="creatorGroupOptions" placeholder="请选择一项"/>
          </el-form-item>
          <el-form-item label="上传时间" class="form-query-select">
            <el-date-picker
              clearable
              placeholder="请选择一项"
              range-separator="-"
              :value-format="'YYYY-MM-DD'"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              v-bind="{ type: 'daterange' }"
              v-model="searchInfo.time"
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
        <div>文件列表</div>
        <div class="export" v-if="!allocateId">
          <el-button v-if="!needCheckPermission || hadPermissionList.includes('导入病历')" @click="handleUploadBtn()">
            <i class="iconfont icon-daochu2"></i>
            <span>导 入</span>
          </el-button>

          <el-button @click="newResearch" v-if="!needCheckPermission || hadPermissionList.includes('导出病历')">
            <i class="iconfont icon-daochu1"></i>
            <span>导 出</span>
          </el-button>
          <el-button type="primary" @click="handleAssignmentLabels" v-if="!needCheckPermission || hadPermissionList.includes('分配标注')">
            <i class="iconfont icon-fenpeibiaozhu"></i>
            <span>分配标注</span>
          </el-button>
          <el-button type="danger" @click="handleResetDialog" v-if="!needCheckPermission || hadPermissionList.includes('一键重置')">
            <i class="iconfont icon-yijianzhongzhi"></i>
            <span>一键重置</span>
          </el-button>
        </div>
      </header>
      <div class="tableMain">
        <commonTable class="singleTable btnsLastCell" :data="tableData">
          <el-table-column prop="id" label="文件ID" :min-width="echartsToPx(150)"></el-table-column>
          <el-table-column prop="documentId" label="病历ID" :min-width="echartsToPx(120)"></el-table-column>
          <el-table-column prop="status" label="文件状态" :min-width="echartsToPx(80)">
            <template #default="scope">
              <div class="statusCell">
                <span
                  v-if="getStatusConfig(scope.row.proofreadStatus)"
                  class="statusDot"
                  :class="getStatusConfig(scope.row.proofreadStatus).dotClass"
                ></span>
                <span>{{ getStatusConfig(scope.row.proofreadStatus)?.label || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="annotateCount" label="标注次数" :min-width="echartsToPx(90)">
            <template #default="scope">
              <span class="annotateCountCell" :class="{ 'is-max': (scope.row.annotateCount || 0) >= 4 }">
                {{ scope.row.annotateCount || 0 }} / 4
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="reviewStatus" label="审核状态" :min-width="echartsToPx(90)">
            <template #default="scope">
              <span>{{ getReviewStatusLabel(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="proofreaders" label="校对人" :min-width="echartsToPx(140)"></el-table-column>
          <el-table-column prop="proofreadStartTime" label="开始校对时间" :min-width="echartsToPx(140)"></el-table-column>
          <el-table-column prop="agencyName" label="医院" :min-width="echartsToPx(140)"></el-table-column>
          <el-table-column prop="departmentName" label="科室" :min-width="echartsToPx(70)"></el-table-column>
          <el-table-column prop="createTime" label="上传时间" :min-width="echartsToPx(140)"></el-table-column>
          <el-table-column label="操作" fixed="right" :min-width="echartsToPx(allocateId ? 160 : 126)">
            <template #default="scope">
              <el-button type="primary" link @click="viewRow(scope.row)">查看</el-button>
              <el-button type="danger" link @click="handlerRow(scope.row,true)" v-if="(!allocateId || demo) && (!needCheckPermission || hadPermissionList.includes('删除病历')) && canDeleteRecord(scope.row)">删除</el-button>
              <el-button type="warning" link @click="goAudit(scope.row)" v-if="allocateId && scope.row.proofreadStatus === 5">审核</el-button>
            </template>
          </el-table-column>
        </commonTable>
        <div class="tabel_pagination">
          <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
            <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog title="导出范围" v-model="showDialog" class="new_Dialog new_Dialog2" :width="pxToRem(404)" :before-close="handleClose">
      <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
        全部
      </el-checkbox>
      <el-checkbox-group v-model="selectStatus" @change="handleCheckedCitiesChange" >
        <el-checkbox v-for="city in statusOption" :key="city.value" :label="city.label" :value="city.value"></el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="toExportIndex()">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="导入" v-model="showUploadDialog" class="new_Dialog new_Dialog2" :width="pxToRem(640)" :before-close="handleCloseUpload">
      <el-form ref="ruleFormRef" :label-width="pxToRem(70)" label-position="left" :model="formData" class="new_DialogForm" :rules="rules">
        <el-form-item label="医 院：" prop="agencyId" >
          <el-select v-model="formData.agencyId" clearable placeholder="请选择一项" @change="handleChangeAgency">
            <el-option
              v-for="item in agencyList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科 室：" prop="departmentId">
          <el-select v-model="formData.departmentId" clearable placeholder="请选择一项">
            <el-option
              v-for="item in dartmentList"
              :key="item.id"
              :label="item.departmentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文 件：" prop="file">
          <el-upload ref="uploadRef" :auto-upload="false" accept=".zip" action="#" :show-file-list="false" @change="selectFile">
            <span class="fileName" v-if="formData.file">{{ formData.file.name }}</span>
            <el-button class="fileSelectBtn">
              <i class="iconfont icon-daochu1"></i>
              <span v-if="formData.file">重新选择</span>
              <span v-else>选择文件</span>
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span >
          <el-button @click="handleCloseUpload">取 消</el-button>
          <el-button type="primary" @click="uploadFile">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      title="分配标注"
      destroy-on-close
      v-model="assignmentLabelsDialog"
      class="new_Dialog new_Dialog2"
      :width="pxToRem(640)"
      :before-close="handleCloseAssignmentLabels"
      :close-on-click-modal="false"
    >
      <div>
        <assignmentLabels
          ref="assignmentLabelsDom"
          :creatorGroupOptions="creatorGroupOptions"
          :step="step"
        >
        </assignmentLabels>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleStep(-1)" v-if="step>1&&step!==3">上一步</el-button>
          <el-button type="primary" v-if="step!==3" @click="handleStep(1)">下一步</el-button>
          <el-button v-if="step===3" type="primary" @click="handleCloseAssignmentLabels">完 成</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'medicalRecordList'
}
</script>
<script setup>
import { ref, computed, onMounted, reactive, defineProps, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import { getMedicalRecordList, uploadAttachment, downloadAttachment, deleteMedicalRecord, getParticipantList, resetAll } from '@/api/api_proofread'
import { getAllAgencyWithRole } from '@/api/api_homePage.js'
import { getAngencyAndDepartmentTreeListByRole } from '@/api/api_home'
import { getDartmentList } from '@/api/api_home.js'
import { useMedicalRecordListStore } from '@/store/medicalRecordListStore'
import { formatDateTime2 } from '@/utils/utils'
import { blodDownLoadFile } from '@/utils/fileDownload'
import { useMedicalStore } from '@/store/medicalStore'
import router from '@/router'
import assignmentLabels from './assignmentLabels.vue'
import { echartsToPx } from '@/utils/utils.js'
import warningPng from '@/assets/warningPng.png'
import { getDemoRecords, getDemoAllRecords, DEMO_USER_OPTIONS, FILE_DISPLAY_STATUS_OPTIONS, REVIEW_STATUS_OPTIONS, toFileDisplayStatus, toReviewStatus } from '@/mock/proofreadDemo'
import { loadCotExportRecords } from '@/mock/cotExportData'
const medicalRecordListStore = useMedicalRecordListStore()
const medicalStore = useMedicalStore()
const props = defineProps({
  hadPermissionList: {
    type: Array
  },
  needCheckPermission: {
    type: Boolean
  },
  // 任务详情模式：传入 allocateId 时，仅查询该任务下的病历，隐藏导入/导出/分配等操作，显示审核按钮
  allocateId: {
    type: [String, Number],
    default: ''
  },
  taskStatus: {
    type: [String, Number],
    default: ''
  },
  demo: {
    type: Boolean,
    default: false
  },
  // 任务详情模式：隐藏表头上方的查询筛选区域
  hideQueryHeader: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['data-change'])
const showDialog = ref(false)
const uploadRef = ref(null)
const selectStatus = ref([1, 2, 3, 4, 9])
const checkAll = ref(true)
const isIndeterminate = ref(false)

// 使用 computed 读写 store 状态，实现持久化
const currentPage = computed({
  get: () => medicalRecordListStore.currentPage,
  set: (val) => medicalRecordListStore.setCurrentPage(val)
})

const limit = computed({
  get: () => medicalRecordListStore.limit,
  set: (val) => medicalRecordListStore.setLimit(val)
})

const searchInfo = ref({})

const total = ref(0)
const ruleFormRef = ref()
const statusOption = FILE_DISPLAY_STATUS_OPTIONS
const reviewStatusOption = REVIEW_STATUS_OPTIONS
const getStatusConfig = (status) => statusOption.find(item => item.value === toFileDisplayStatus(status))
const getReviewStatusValue = (row) => row.reviewStatus ?? toReviewStatus(row.proofreadStatus)
const getReviewStatusLabel = (row) => {
  const val = getReviewStatusValue(row)
  return reviewStatusOption.find(item => item.value === val)?.label || '-'
}
// 删除条件：文件状态为待校对且审核状态为"-" 或 文件状态为待复核且审核状态为"审核通过"
const canDeleteRecord = (row) => {
  const fileStatus = toFileDisplayStatus(row.proofreadStatus)
  const reviewStatus = getReviewStatusValue(row)
  if (fileStatus === 1 && reviewStatus === 0) return true
  if (fileStatus === 3 && reviewStatus === 2) return true
  return false
}

const creatorGroupOptions = ref([])
const resetParams = () => {
  searchInfo.value = {
    id: '',
    proofreadStatusList: [],
    reviewStatusList: [],
    proofreaderIds: [],
    reviewerIds: []
  }
  currentPage.value = 1
  getListData()
}
const onSubmit = () => {
  currentPage.value = 1
  getListData()
}
const tableData = ref([])
const loadExportFallback = async () => {
  const records = await loadCotExportRecords()
  return records.map(item => ({
    id: item.recordId,
    documentId: item.documentId,
    proofreadStatus: item.proofreadStatus,
    reviewStatus: toReviewStatus(item.proofreadStatus),
    proofreaders: 'COT示例标注人',
    proofreadStartTime: item.loops?.[0]?.loop_meta?.trigger_time || '-',
    reviewers: '-',
    reviewStartTime: '-',
    agencyName: item.agencyName,
    departmentName: item.departmentName,
    createTime: item.loops?.[0]?.loop_meta?.trigger_time || '-',
    cotExport: true
  }))
}
const appendExportFallback = async () => {
  if (props.allocateId) return
  const imported = await loadExportFallback()
  const existingIds = new Set(tableData.value.map(item => String(item.id)))
  tableData.value = [...tableData.value, ...imported.filter(item => !existingIds.has(String(item.id)))]
  total.value = tableData.value.length
}
// 获取列表数据
const getListData = async() => {
  if (props.demo) {
    const params = searchInfo.value || {}
    const [startDate, endDate] = params.time || []
    // 病历池模式（无 allocateId）展示所有任务的病历；任务详情模式展示指定任务的病历
    const baseRecords = props.allocateId ? getDemoRecords(props.allocateId) : getDemoAllRecords()
    tableData.value = baseRecords
      .filter(item => !params.id || item.id.toLowerCase().includes(String(params.id).toLowerCase()))
      .filter(item => !params.documentId || item.documentId.toLowerCase().includes(String(params.documentId).toLowerCase()))
      .filter(item => !params.proofreadStatusList?.length || params.proofreadStatusList.includes(toFileDisplayStatus(item.proofreadStatus)))
      .filter(item => !params.reviewStatusList?.length || params.reviewStatusList.includes(getReviewStatusValue(item)))
      .filter(item => !startDate || item.createTime.slice(0, 10) >= startDate)
      .filter(item => !endDate || item.createTime.slice(0, 10) <= endDate)
      .filter(item => !params.proofreaderIds?.length || params.proofreaderIds.includes(item.proofreaders))
      .filter(item => !params.reviewerIds?.length || params.reviewerIds.includes(item.reviewers))
    total.value = tableData.value.length
    return
  }
  const { time } = searchInfo.value
  const ensureNum = (v, d) => (v === undefined || v === null || isNaN(Number(v)) ? d : Number(v))
  const baseParams = {
    pageNum: ensureNum(currentPage.value, 1),
    pageSize: ensureNum(limit.value, 20),
    ...searchInfo.value,
    uploadStartTime: time?.length ? time[0] : undefined,
    uploadEndTime: time?.length ? time[1] : undefined
  }
  try {
    if (props.allocateId) {
      // 任务详情模式：mock 病历数据已由 watch allocateId 注入，
      // 此处不调后端接口（避免 "Required request body is missing" 报错）。
      // 后续接入真实数据时，替换为 getTaskAllocateRecordDetails 调用。
    } else {
      const res = await getMedicalRecordList(baseParams)
      if (res.code === 10000) {
        tableData.value = res.data?.items || []
        total.value = res.data?.total || 0
      }
    }
  } catch (error) {
    console.warn('病历接口暂不可用，加载 COT 示例数据', error)
    if (!props.allocateId) {
      await appendExportFallback()
    }
  }
  if (!props.allocateId) {
    await appendExportFallback()
  }
}

// 新增
const newResearch = () => {
  // selectStatus.value = [1, 2, 3, 4, 5]
  // checkAll.value = true
  // showDialog.value = true
  ElMessageBox.confirm(`将按当前筛选条件导出，确认导出吗？`, '导出', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    toExportIndex()
  })
}
const handleClose = async () => {
  selectStatus.value = []
  showDialog.value = false
}
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getListData()
}
// 更改每页条数
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getListData()
}
// 操作
const handlerRow = async(row) => {
  ElMessageBox.confirm('若该病历已分配任务，将从任务中删除病历，已完成任务中不删除病历。是否删除该病历？', '删除', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(async () => {
    if (props.demo) {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index >= 0) tableData.value.splice(index, 1)
      total.value = tableData.value.length
      ElMessage.success('演示：已删除')
      return
    }
    const params = { recordId: row.id }
    const res = await deleteMedicalRecord(params)
    if (res.code === 10000) {
      ElMessage.success('已删除')
      getListData()
    }
  })
}

// 获取创建人数据
const getPersonData = async() => {
  const params = {
    pageNum: 1,
    pageSize: 10000
    // batchId: researchStore.curResearchQueueDetail.id
  }
  const res = await getParticipantList(params)
  if (res.code === 10000) {
    creatorGroupOptions.value = res.data?.items.map(item => {
      return {
        label: item.userName,
        value: item.id
      }
    })
  }
}
const agencyList = ref([])
const showUploadDialog = ref(false)
const dartmentList = ref([])
const formData = ref({
  agencyId: ''
})
const rules = reactive({
  departmentId: [{ required: true, message: '请选择科室', trigger: 'blur' }],
  agencyId: [{ required: true, message: '请选择所属医院', trigger: 'change' }],
  file: [{ required: true, message: '请选择文件', trigger: 'blur' }]
})
const handleUploadBtn = async() => {
  formData.value = {}
  showUploadDialog.value = true
}
const getAgencyList = () => {
  getAllAgencyWithRole({}).then(async res => {
    if (res.code === 10000) {
      agencyList.value = res.data || []
    } else {
      ElMessage.error('医院列表加载失败，请刷新页面重试')
    }
  })
}
const handleChangeAgency = () => {
  formData.value.departmentId = ''
  getDartmentList({
    agencyIdList: [formData.value.agencyId],
    pageNum: 1,
    pageSize: 2000
  }).then(res => {
    if (res.code === 10000) {
      dartmentList.value = res.data?.items || []
    } else {
      ElMessage.error('科室获取失败,请刷新重试')
    }
  })
}
const selectFile = (file, fileList) => {
  console.log('file', file)
  formData.value.file = file
}
// 导入指标
const uploadFile = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const newFormData = new FormData()
      newFormData.append('file', formData.value.file.raw)
      newFormData.append('departmentId', formData.value.departmentId)
      const res = await uploadAttachment(newFormData)
      if (res.code === 10000) {
        showUploadDialog.value = false
        ElMessageBox.alert(`共上传${res.data.totalCount}份病历，其中${res.data.duplicateCount}份重复，实际上传${res.data.successCount}份，失败${res.data.failCount}份`, '上传提示', {
          confirmButtonText: '确定'
        })
        uploadRef.value.clearFiles()
        getListData()
      } else {
        ElMessage.error(res.msg)
      }
    } else {
      console.log('验证失败')
    }
  })
}
const handleCloseUpload = () => {
  showUploadDialog.value = false
}
const viewRow = (row) => {
  medicalStore.setRecordId(row.id)
  // demo 模式：所有病历均为 mock 数据，传 demo=1 让详情页直接走 initDemoData
  // 标注管理仅允许查看，readonly=1 关闭详情页的「开始校对」入口
  const query = { recordId: row.id, demo: '1', readonly: '1' }
  if (props.allocateId) {
    // 任务详情 → 病历详情：返回时回到任务详情
    query.backTo = '/proofreadingManagement/taskDetail'
    query.backAllocateId = props.allocateId
    query.backTaskStatus = props.taskStatus
  } else {
    // 病历池 → 病历详情：返回时回到病历池
    query.backTo = '/proofreadingManagement/medicalRecordPool'
  }
  router.push({
    name: 'viewProofreadMedical',
    query
  })
}

// 进入审核详情页
const goAudit = (row) => {
  medicalStore.setRecordId(row.id)
  // demo 模式：传 demo=1 让审核页直接走 initDemoData
  const query = { recordId: row.id, demo: '1' }
  // 任务详情模式跳转审核时，透传返回路径与 allocateId，
  // 保证审核页返回按钮能回到任务详情，不依赖 browser history 栈
  if (props.allocateId) {
    query.backTo = '/proofreadingManagement/taskDetail'
    query.backAllocateId = props.allocateId
    query.backTaskStatus = props.taskStatus
  }
  router.push({
    name: 'auditMedical',
    query
  })
}

// 导出
const toExportIndex = async () => {
  // if (selectStatus.value.length === 0) {
  //   ElMessage.error('请选择要导出的范围')
  //   return
  // }
  // downloadAttachment({ proofreadStatusList: selectStatus.value }).then(res => {
  downloadAttachment({ ...searchInfo.value }).then(res => {
    if (res.status === 200) {
      let fileName = `校对文件_${formatDateTime2()}.zip`
      const { headers } = res
      // 获取文件名，从headers中获取或使用默认名称
      const contentDisposition = headers['content-disposition']

      if (contentDisposition) {
      // 从content-disposition中提取文件名
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['”]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['”]/g, '')
        }
      }
      blodDownLoadFile(res, fileName)
      handleClose()
    } else if (res.status === 204) {
      ElMessage.error('这个状态下暂时没有病历，换个状态看看')
    } else {
      ElMessage.error('导出没成功，请稍后重试')
    }
  })
}

const handleCheckAllChange = (val) => {
  selectStatus.value = val ? statusOption.map(item => item.value) : []
  isIndeterminate.value = false
}
const handleCheckedCitiesChange = (value) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === statusOption.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < statusOption.length
}
const assignmentLabelsDialog = ref(false)
const handleAssignmentLabels = () => {
  step.value = 1
  assignmentLabelsDialog.value = true
}
const handleCloseAssignmentLabels = () => {
  assignmentLabelsDialog.value = false
  step.value = 1 // 👈 确保这里重置为 1 即可！
}
const step = ref(1)
const assignmentLabelsDom = ref()
const handleStep = async(val) => {
  if (step.value === 1) {
    const isPass = await assignmentLabelsDom.value.verificationFn()
    if (isPass) {
      step.value += val
    } else {
      ElMessage.error('当前条件没有匹配到数据，换个条件试试')
    }
  } else if (step.value === 2) {
    if (val === 1) {
      const isPass = await assignmentLabelsDom.value.verificationFn()
      if (isPass) {
        step.value = 3
        console.log('通过')
      }
    } else {
      step.value += val
    }
  }
}
const isShowResetDialog = ref(false)
const handleResetDialog = () => {
  isShowResetDialog.value = true
  ElMessageBox.confirm(
    `<div class="resetContainer">
      <img src='${warningPng}'>
      <div class="title">一键重置</div>
      <div class='sureText'>一键重置后，所有病历恢复至初始状态，是否重置?</div>
      <div class="warningText">请谨慎操作!</div>
    </div>`,
    '',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      customClass: 'resetAllContainer'
      // type: 'warning'
    }
  )
    .then(async () => {
      resetAll().then(res => {
        console.log('重置结果', res)
        if (res.code === 10000) {
          onSubmit()
          ElMessage.success('筛选条件已重置')
        }
      })
    })
}
const departmentOptions = ref([])
const getAngencyAndDepartmentTreeListFn = () => {
  getAngencyAndDepartmentTreeListByRole().then(res => {
    if (res.code === 10000) {
      departmentOptions.value = res.data || []
    }
  })
}
// 加载时请求页面列表
onMounted(() => {
  if (props.demo) {
    // demo 模式：使用 mock 用户选项，不调后端接口
    creatorGroupOptions.value = DEMO_USER_OPTIONS
    getListData()
    return
  }
  // 任务详情模式：查询区域已隐藏，不需要加载筛选下拉选项，watch allocateId 会注入 mock 病历
  if (props.allocateId) {
    return
  }
  getPersonData()
  getAgencyList()
  getAngencyAndDepartmentTreeListFn()
  getListData()
})

// 任务详情模式：allocateId 有值时立即注入 mock 病历数据，再尝试加载真实数据
// 确保 mock 病历和真实病历走同一个病历详情页组件，页面布局一致
watch(() => props.allocateId, (newVal) => {
  if (newVal) {
    const mockRecords = getDemoRecords(newVal)
    tableData.value = mockRecords
    total.value = mockRecords.length
    getListData()
  }
}, { immediate: true })

watch(
  [total, tableData],
  ([newTotal, newTableData]) => {
    if (props.hideQueryHeader || props.allocateId) {
      const recordIds = (newTableData || []).map(r => r.id).filter(Boolean)
      const startTimes = (newTableData || []).map(r => r.createTime || r.proofreadStartTime || r.reviewStartTime).filter(Boolean)
      emit('data-change', {
        total: Number(newTotal) || 0,
        earliestTime: startTimes.length ? startTimes.slice().sort()[0] : '',
        recordIds,
        proofreadStatuses: (newTableData || []).map(r => r.proofreadStatus).filter(v => v !== undefined && v !== null)
      })
    }
  },
  { immediate: true, flush: 'post' }
)

watch(
  () => props.allocateId,
  (val) => {
    if (val || val === 0) {
      getListData()
    }
  },
  { immediate: true, flush: 'post' }
)
</script>

<style scoped lang="scss">
@use "@/style/common/list.scss";
.list-div {
  .header-query {
    &.list-header {
      height: 183px;
    }
    .titleSearch {
      display: flex;
      align-items: baseline;
      width: 100%;
      .search {
        display: flex;
        align-items: center;
        p {
          width: auto;
          min-width: 56px;
          margin: 0;
          margin-right: 10px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text);
        }
        .el-input {
          width: 235px;
          margin-right: 32px;
        }
      }
      .btnDiv {
        display: flex;
        align-items: center;
      }
    }
  }
  .table-header {
    .export {
      display: flex;
      align-items: center;
      width: auto !important;
      background-color: transparent !important;
      .el-button {
        margin-left: 12px;
        i {
          margin-right: 10px;
          font-size: 12px;
        }
      }
    }
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

    .statusDot1 {
      background: #b6b7b9;
    }

    .statusDot2 {
      background: var(--theme-primary);
    }

    .statusDot3 {
      background: #f59f0c;
    }

    .statusDot4 {
      background: #8a33c4;
    }

    .statusDot5 {
      background: #04a273;
    }

    .statusDot6 {
      background: #00b578;
    }

    .statusDot7 {
      background: #ff4e4e;
    }
  }
  :deep(.new_Dialog) {
    label {
      width: 33%;
      margin-right: 0;
    }
    .el-checkbox-group {
      display: inline;
    }
    .fileSelectBtn {
      display: flex;
      align-items: center;
      i {
        margin-right: 10px;
        font-size: 12px;
      }
    }
    .fileName {
      margin-right: 16px;
      font-size: 14px;
      color: var(--theme-primary);
    }
  }
}
:deep(.commonSearch) {
  &.el-form {
    flex-wrap: wrap;
  }
}
</style>
<style lang="scss">
.resetAllContainer {
  .el-message-box__message {
    width: 100%;
    .p {
      display: block;
      width: 100%;
    }
  }
  .resetContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    img {
      width: 65px;
      height: 65px;
      margin-top: 16px;
    }
    .title {
      margin-top: 10px;
      margin-bottom: 6px;
      line-height: 35px;
      font-weight: 600;
      font-size: 24px;
      color: var(--theme-text);
    }
    .sureText {
      line-height: 26px;
      font-weight: 400;
      font-size: 16px;
      color: var(--theme-text-2);
    }
    .warningText {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 117px;
      height: 32px;
      margin-top: 16px;
      border-radius: 4px 4px 4px 4px;
      background: rgba(255, 78, 78, 0.1);
      font-weight: 400;
      font-size: 16px;
      color: #ff4e4e;
    }
  }
}

.annotateCountCell {
  font-size: 13px;
  color: #6d7d9c;

  &.is-max {
    font-weight: 600;
    color: #f59f0c;
  }
}
</style>
