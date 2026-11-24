<template>
  <div class="list-div">
    <div class="viewContent">

      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="searchContainer">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="文件ID" class="form-query-select">
              <el-input v-model="searchInfo.fileId" clearable placeholder="请填写内容" maxlength="19" @keyup.enter="onSubmit" oninput="value=value.replace(/[^\d.]/g,'')"></el-input>
            </el-form-item>
            <el-form-item label="文件名" class="form-query-select">
              <el-input v-model="searchInfo.fileName" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="所属医院" class="form-query-select">
              <el-select v-model="searchInfo.hospital" multiple :multiple-limit="30" collapse-tags clearable placeholder="请选择一项">
                <el-option
                  v-for="item in hospitalGroupOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="病种" class="form-query-select">
              <CommonMultiSelectWithSearch v-model="searchInfo.diseaseType" :options="diseaseGroupOptions" :multipleLimit="30"/>
            <!-- <el-select v-model="searchInfo.diseaseType" multiple :multiple-limit="30" collapse-tags clearable placeholder="请选择一项">
              <el-option
                v-for="item in diseaseGroupOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select> -->
            </el-form-item>
            <el-form-item label="状态" class="form-query-select">
              <commonMultipleSelect
                v-model="searchInfo.status"
                :options="statusOptions"
                placeholder="请选择一项"
              />
            </el-form-item>
            <el-form-item label="入库时间" class="form-query-select" v-if="whether">
              <el-date-picker
                clearable
                placeholder="请选择一项"
                range-separator="-"
                :value-format=" 'YYYY-MM-DD HH:mm:ss'"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                v-bind="{ type: 'datetimerange' }"
                v-model="searchInfo.enterHospitalDate"
              />
            </el-form-item>
          </el-form>
          <div class="btnDiv">
            <div class="whether">
              <el-button class="blueBtn" link @click="whether = !whether">
                {{ whether ? '收起' : '展开' }}
                <i class="iconfont icon-xuanzekuang-xiala" :class="{rotate:whether}"></i>
              </el-button>
            </div>
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </div>

      </header>
      <div class="list-section">
        <header class="table-header">
          <div class="title">文件列表</div>
          <el-button type="primary" @click="newResearch" v-if="!userStore.needCheckPermission || hadPermissionList.includes('文件上传')">上传文件</el-button>
        </header>
        <commonTable class="singleTable emptyDefaultTable btnsLastCell" :data="tableData">
          <el-table-column prop="fileId" label="文件ID" min-width="100"></el-table-column>
          <el-table-column prop="fileName" label="文件名" min-width="100"></el-table-column>
          <el-table-column prop="agencyName" label="所属医院" min-width="100"></el-table-column>
          <el-table-column label="病种" min-width="140">
            <template #default="scope">
              <div class="custom-disease-column" v-if="scope.row.fileDiseaseName">
                <CommonTooltipWithSlotContent className="diseaseTooltip" :content="scope.row.fileDiseaseName">
                  <div class="span-box">
                    <span v-for="(item, index) in scope.row.fileDiseaseName.split('；')" :key="'disease' + index" class="itemTag">{{ item }}</span>
                  </div>
                  <template #content>
                    <div class="tooltip-custom">
                      <div class="item" v-for="(item, index) in scope.row.fileDiseaseName.split('；')" :key="'tooltip' + index">
                        {{ item }}
                      </div>
                    </div>
                  </template>
                </CommonTooltipWithSlotContent>
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="left" min-width="60">
            <template #default="scope">
              <div style="display: flex; align-items: center;">
                <span v-if="statusOptions.find(it=>it.value===scope.row.structureRecognitionStatus)?.className" class="tag" :class="statusOptions.find(it=>it.value===scope.row.structureRecognitionStatus).className"></span>
                <div :style="{minWidth:pxToRem(56)}">{{ getStatusName(scope.row.structureRecognitionStatus) }}</div>
                <el-button link class="blueBtn reIdentify"
                           v-if="(!userStore.needCheckPermission || hadPermissionList.includes('重新识别')) && (scope.row.structureRecognitionStatus===-100 || scope.row.structureRecognitionStatus===200)"
                           @click="resetIdentifyBtn(scope.row)">
                  <i class="iconfont icon-liebiao-shuaxin" :class="{ 'rotate': scope.row.isHovered }"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="传输类别" min-width="40">
            <template #default="scope">
              <div>{{ scope.row.uploadType === 0 ? '手动上传' : '自动上传' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="入库时间" min-width="100" prop="createTime">
          </el-table-column>
          <el-table-column label="操作" fixed="right" :min-width="130">
            <template #default="scope">
              <!-- <el-button class="blueBtn" :disabled="scope.row.indexRecognitionStatus === 1 || scope.row.indexRecognitionStatus === 11" link @click="viewFile(scope.row)">查看文件</el-button> -->
              <el-button type="primary" link @click="viewFile(scope.row)">查看文件</el-button>
              <el-button type="primary" link @click="handleCoordinates(scope.row)">坐标校对</el-button>
              <el-button type="primary" :disabled="scope.row.structureRecognitionStatus !== 200" link @click="proofreadMedical(scope.row)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('病历校对')">校对病历</el-button>
              <el-button type="danger" link @click="deleteRow(scope.row)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('文件删除')">删除</el-button>
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
    <el-dialog title="文件上传" v-model="showDialog" class="new_Dialog" :width="pxToRem(640)" :before-close="handleClose">
      <el-form ref="ruleFormRef" label-position="left" :model="formData" class="new_DialogForm">
        <el-form-item label="所属医院：" prop="hospital">
          <el-select v-model="formData.hospital" clearable placeholder="请选择一项">
            <el-option
              v-for="item in hospitalGroupOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属病种：" prop="hospital" class="disease">
          <CommonMultiSelectWithSearch
            v-model="formData.diseaseType"
            :options="diseaseGroupOptions"
            placeholder="请选择一项"
            :multipleLimit="30"
            :maxCollapseTags="3"
          >
          </CommonMultiSelectWithSearch>
          <!-- <el-scrollbar>
            <el-checkbox-group v-model="formData.diseaseType">
              <el-checkbox v-for="item in diseaseGroupOptions" :key="item.id" :label="item.id">
                <CommonTooltip :content="item.name"><span>{{ item.name }}</span></CommonTooltip>
              </el-checkbox>
            </el-checkbox-group>
          </el-scrollbar> -->
        </el-form-item>
        <div class="errorMsg" v-if="errorMsg">{{errorMsg}}</div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleUpload">上 传</el-button>
          <el-upload
            style='display: none;'
            ref="uploadFile"
            class="upload-demo"
            :limit="1"
            action="#"
            :auto-upload="false"
            accept=".PDF"
            :show-file-list="false"
            :on-change="handleChange"
            :on-error="handleError"
            :on-success="handleSuccess"
            :file-list="fileList">
            <el-button ref="uploadBtn" type="primary">确 定</el-button>
          </el-upload>
        </span>
      </template>
    </el-dialog>
    <pdfViews :pdfUrl="pdfUrl" v-model:isPdf='isPdf' :fileName="fileName" v-if="isPdf" ></pdfViews>
  </div>
</template>

<script>
export default {
  name: 'fileList'
}
</script>
<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, onActivated, onDeactivated } from 'vue'
import router from '@/router'
import { getFilesList, deleteFile, addFile, resetIdentify } from '@/api/api_file'
import { getResearchDisease } from '@/api/api_research'
import { getPermissionStructure } from '@/api/api_home'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import CommonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
// const isProofreading = ref(localStorage.getItem('isProofreadingMode'))
const userStore = useUserStore()
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/fileManage/fileList') {
    hadPermissionList.value.push(item.name)
  }
})
// import { ElMessage, ElMessageBox } from 'element-plus'
// import {
//   getUserList
// } from '@/api/api_user'
// import { useResearchStore } from '@/store/researchStore'
// const researchStore = useResearchStore()
const searchInfo = ref({
  fileName: '',
  fileId: '',
  status: [],
  hospital: [],
  diseaseType: []
})
const whether = ref(false) // 是否显示全部
const showDialog = ref(false)
const hospitalGroupOptions = ref([])
const diseaseGroupOptions = ref([])
// const statusOptions = ref([
//   {
//     label: '上传失败',
//     value: 1
//   },
//   {
//     label: '处理失败',
//     value: 2
//   },
//   {
//     label: '上传中',
//     value: 11
//   },
//   {
//     label: '处理中',
//     value: 12
//   },
//   {
//     label: '已入库',
//     value: 13
//   }
// ])
const statusOptions = ref([
  {
    label: '已完成',
    value: 200,
    className: 'tag1'
  },
  {
    label: '识别中',
    value: 100,
    className: 'tag2'
  },
  {
    label: '识别失败',
    value: -100,
    className: 'tag3'
  },
  {
    label: '等待识别',
    value: 10,
    className: 'tag4'
  }
])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const ruleFormRef = ref()
const formData = reactive({
  hospital: '',
  diseaseType: []
})
const errorMsg = ref('')
const tableData = ref([])
const pdfUrl = ref('')
const isPdf = ref(false)
const fileName = ref('')
// 获取状态对应中文名
const getStatusName = (status) => {
  const obj = statusOptions.value.find(item => item.value === status)
  return obj ? obj.label : ''
}
// 定时请求
const startTimer = () => {
  return setInterval(() => {
    getListData()
  }, 5000)
}
const stopTimer = (timer) => {
  clearInterval(timer) // 清除定时器
}

let timer = null // 定时器变量
onMounted(() => {
  timer = startTimer() // 组件挂载时启动定时器
})
onActivated(() => {
  stopTimer(timer)
  timer = startTimer()
})
onBeforeUnmount(() => {
  stopTimer(timer)
})
onDeactivated(() => {
  stopTimer(timer)
})
const isFetching = ref(false) // 请求状态标志
// 获取列表数据
const getListData = async() => {
  if (isFetching.value) return // 若上一次请求未结束，跳过
  isFetching.value = true // 标记为正在请求
  const params = {
    // agencyIdList: [],
    // bizStatus: 0,
    // diseaseIdList: [],
    // fileName: '',
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  if (searchInfo.value.fileName) {
    params.fileName = searchInfo.value.fileName
  }
  if (searchInfo.value.status) {
    params.structureRecognitionStatusList = searchInfo.value.status
  }
  if (searchInfo.value.hospital.length > 0) {
    params.agencyIdList = searchInfo.value.hospital
  }
  if (searchInfo.value.diseaseType.length > 0) {
    params.diseaseIdList = searchInfo.value.diseaseType
  }
  if (searchInfo.value.fileId) {
    params.fileId = searchInfo.value.fileId
  }
  if (searchInfo.value.enterHospitalDate) {
    params.createTime = searchInfo.value.enterHospitalDate
  }
  try {
    const res = await getFilesList(params)
    if (res.code === 10000) {
      const data = res.data.items
      data.forEach(item => {
        item.isHovered = false
      })
      tableData.value = data
      total.value = res.data.total
    }
  } catch (err) {
    console.error('获取列表失败', err)
  } finally {
    isFetching.value = false // 请求完成，允许下一次请求
  }
}
// 获取医院数据
const getHospitalData = async() => {
  const res = await getPermissionStructure({})
  if (res.code === 10000) {
    hospitalGroupOptions.value = res.data
  }
}
// 获取病种数据
const getDiseaseData = async() => {
  const res = await getResearchDisease()
  if (res.code === 10000) {
    diseaseGroupOptions.value = res.data
  }
}
// 加载时请求页面列表
const init = async() => {
  getListData()
  getHospitalData()
  getDiseaseData()
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {
    fileName: '',
    fileId: '',
    status: [],
    hospital: [],
    diseaseType: []
  }
  getListData()
}

// 新增
const newResearch = () => {
  formData.hospital = ''
  formData.diseaseType = []
  showDialog.value = true
}
const handleClose = async () => {
  showDialog.value = false
}
// 搜索
const onSubmit = () => {
  getListData()
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
// 查看文件
const viewFile = (item, index) => {
  pdfUrl.value = ''
  // pdfUrl.value = item.fileUrl
  // 获取本机的ip和端口，拼接fileUrl
  // 如果是开发环境
  if (process.env.NODE_ENV === 'development') {
    pdfUrl.value = `http://192.168.43.162:9000${item.fileUrl.replace('/minio', '')}`
  } else {
    pdfUrl.value = `${window.location.origin}/${item.fileUrl}`
  }
  fileName.value = item.fileName
  if (pdfUrl.value) {
    isPdf.value = true
  }
}
// 校对病历
const proofreadMedical = (item, index) => {
  console.log(item.id)
  // stopTimer(timer)
  router.push({
    name: 'proofreadMedical',
    query: {
      fileId: item.medicalRecordId
    },
    props: true
  })
}
const handleCoordinates = (item) => {
  router.push({
    name: 'Coordinates',
    query: {
      fileId: item.medicalRecordId
    },
    props: true
  })
}
// 删除
const deleteRow = async(row) => {
  ElMessageBox.confirm(
    `确定要删除此文件吗？`,
    '删除文件',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const params = {
        id: row.medicalRecordId,
        fileName: row.fileName
      }
      const res = await deleteFile(params)
      if (res.code === 10000) {
        ElMessage.success('已删除')
        await getListData()
      } else {
        errorMsg.value = res.msg
      }
    })
}
// const fullscreenLoading = ref(false)
// 调用上传方法
const uploadBtn = ref(null)
// 弹出原生上传界面
const handleUpload = () => {
  if (!formData.hospital) {
    ElMessage.warning('请选择所属医院')
    return false
  } else if (formData.diseaseType.length === 0) {
    ElMessage.warning('请选择所属病种')
    return false
  }
  uploadBtn.value?.$.vnode.el?.click()
}
const fileList = ref([])
const maxFileLength = ref(0)
const uploadFile = ref(null)
// 调用后端上传API
const toAddFile = async (file, index, length) => {
  const newFormData = new FormData()
  console.log('file', file)
  newFormData.append('files', file.raw)
  const formm = {
    agencyId: formData.hospital,
    diseaseIdList: formData.diseaseType,
    uploadType: 0
  }
  newFormData.append('data', new Blob([JSON.stringify(formm)], { type: 'application/json' }))
  const res = await addFile(newFormData)
  console.log(res)
  if (res.code === 10000 && index === length - 1) {
    ElMessage.success(`${length}份文件已上传`)
    setTimeout(() => {
      getListData()
    }, 1000)
  }
}
const isPDF = (file) => {
  return file.type === 'application/pdf' || file.name.endsWith('.pdf')
}

const isUnderMaxSize = (file) => {
  return file.size <= 800 * 1024 * 1024 // 800MB in bytes
}
// 点击上传文件
const handleChange = (file, fileList) => {
  const length = fileList.length
  maxFileLength.value = Math.max(length, maxFileLength.value)
  let shouldAbort = false // Flag to track if we should abort the loop
  setTimeout(async () => {
    if (maxFileLength.value === length) {
      maxFileLength.value = 0
      uploadFile.value.clearFiles()
      fileList.forEach((item, index) => {
        if (shouldAbort) return
        if (!isPDF(item)) {
          ElMessage.warning('所选文件中存在非PDF文件，请重新选择')
          shouldAbort = true
        } else if (!isUnderMaxSize(item)) {
          ElMessage.warning('所选文件中存在大于800MB文件，请重新选择')
          shouldAbort = true
        }
      })
      if (!shouldAbort) {
        fileList.forEach((item, index) => {
          toAddFile(item, index, length)
        })
        handleClose()
      }
    }
  }, 0)
}
// 上传成功了
const handleError = (fileList) => {
  console.log('上传失败的文件' + JSON.stringify(fileList))
}
// 上传成功了
const handleSuccess = (fileList) => {
  console.log('上传成功的文件' + JSON.stringify(fileList))
}
const resetIdentifyBtn = async (row) => {
  row.isHovered = true
  const params = {
    medicalRecordId: row.medicalRecordId
  }
  const res = await resetIdentify(params)
  if (res.code === 10000) {
    // row.structureRecognitionStatus = 10
    setTimeout(() => {
      getListData()
    }, 1000)
  }
}
</script>

<style scoped lang="scss">
@use "@/style/common/list.scss";
.list-div .list-header.header-query {
  height: auto;
  min-height: 127px;
}
.searchContainer {
  display: flex;
  align-items: baseline;
  width: 100%;
  .btnDiv {
    display: flex;
    align-items: center;
    :deep(.whether) {
      display: flex;
      align-items: center;
      height: 32px;
      margin-right: 16px;
      .icon-xuanzekuang-xiala {
        font-size: 7px;
        color: var(--theme-primary);
      }
      span {
        color: var(--theme-primary);
      }
      i {
        margin-left: 5px;
      }
      .rotate {
        transform: rotate(180deg);
        transition: transform 0.3s;
      }
    }
  }
}
.commonSearch {
  flex-wrap: wrap;
}
.list-div {
  :deep(.singleTable) {
    display: flex;
    flex-direction: column;
    flex: 1;
    .reIdentify {
      width: 26px;
      height: 26px;
      margin-left: 8px;
      border: 1px solid var(--theme-primary);
      background: rgba(54, 112, 248, 0.1);
      .rotate {
        animation: rotate 0.5s linear;
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    }
    .cell {
      .custom-disease-column {
        display: flex;
        flex: 1;
        width: 0;
        .span-box {
          overflow: hidden;
          flex: 1;
          width: 100%;
          text-overflow: ellipsis;
        }
        .itemTag {
          display: inline-block;
          overflow: hidden;
          max-width: 100%;
          height: 20px;
          margin-right: 8px;
          padding: 0 8px;
          border-radius: 2px;
          background: var(--theme-fill);
          line-height: 20px;
          text-overflow: ellipsis;
          font-size: 12px;
          color: var(--theme-text);
          white-space: nowrap;
        }
      }
      .tag {
        display: block;
        width: 6px;
        height: 6px;
        margin: 0 8px 0 0;
        border-radius: 100%;
      }
      .tag1 {
        background: #04a273;
      }
      .tag2 {
        background: var(--el-color-primary);
      }
      .tag3 {
        background: #ff4e4e;
      }
      .tag4 {
        background: #faad14;
      }
    }
  }
  // :deep(.singleTable) tbody :empty::before {
  //   color: #000;
  //   content: '-';
  // }
  :deep(.new_Dialog) {
    .el-form-item {
      margin-bottom: 0;
      .el-form-item__label,
      .el-checkbox__label {
        color: var(--theme-text);
      }

      &:nth-child(1) {
        .el-form-item__content {
          .el-select {
            width: 100%;
            height: 100%;
            line-height: 100%;
            font-size: 14px;
            .el-select__wrapper {
              width: 100%;
              height: 100%;
              line-height: 100%;
            }
          }
        }
      }
      &:nth-child(2) {
        margin-top: 26px;
        .el-form-item__label {
          display: flex;
          height: 32px;
          line-height: 32px;
        }
        .el-form-item__content {
          display: flex;
          align-items: flex-start;
          height: 100px;
          .el-checkbox-group {
            display: flex;
            flex-wrap: wrap;
            .el-checkbox {
              display: flex;
              width: calc(100%/ 2);
              height: 32px;
              margin-right: 0;
              .el-checkbox__label {
                flex: 1;
                width: 0;
                padding-left: 13px;
                padding-right: 8px;
                line-height: normal;
              }
              .el-checkbox__inner {
                border-radius: 2px;
              }
            }
          }
        }
      }
    }
    .disease {
      .el-form-item__label {
        height: 32px;
      }
      .el-form-item__content {
        .el-input__wrapper,
        .el-select__wrapper {
          height: auto;
          min-height: 40px;
          padding-top: 8px;
          padding-bottom: 8px;
        }
      }
    }
  }
}
</style>
