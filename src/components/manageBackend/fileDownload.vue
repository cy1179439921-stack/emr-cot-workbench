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
              <commonMultipleSelect
                v-model="searchInfo.hospital"
                :options="hospitalGroupOptions"
                placeholder="请选择一项"
              />
            </el-form-item>
            <el-form-item label="病种" class="form-query-select" >
              <CommonMultiSelectWithSearch v-model="searchInfo.diseaseType" :options="diseaseGroupOptions" :multipleLimit="30"/>
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
          <div class="export">
            <el-button @click="handleHisExport(true)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('导出')">
              <i class="iconfont icon-daochu1"></i>
              <span>导出记录</span>
            </el-button>
            <el-button @click="handleExport(true)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('导出')">
              <i class="iconfont icon-daochu1"></i>
              <span>导 出</span>
            </el-button>
          </div>
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
          <!-- <el-table-column label="文件页数" min-width="100" prop="filePageCount">
          </el-table-column> -->
          <el-table-column label="文件大小" min-width="40" prop="fileSizeDesc">
          </el-table-column>
          <el-table-column label="入库时间" min-width="50" prop="createTime">
          </el-table-column>
        </commonTable>
        <div class="tabel_pagination">
          <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
            <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog :model-value="dialogVisible" title="导出日志" :width="pxToRem(488)" class="dialogDIV" @close="handleClose">
      <div class="section-title"><div class="line"></div><div class="text" data-v-da8ccd08="">数据范围</div></div>
      <div class="value data-range">
        <el-radio-group v-model="dataRange">
          <el-radio v-for="item in checkListData" :key="item" :value="item">{{item}}</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <div class="common-btn" @click="handleClose">取 消</div>
          <div class="common-btn primary btnSpace" @click="handleExportUpload">确 认</div>
        </div>
      </template>
    </el-dialog>
    <fileDownLoadlog
      v-if="ishistoryExportRecord"
      :hospitalGroupOptions="hospitalGroupOptions"
      :diseaseGroupOptions="diseaseGroupOptions"
      @closure="handleHisExport(false)"
      @echo="handleEcho"
    >
    </fileDownLoadlog>
  </div>
</template>

<script>
export default {
  name: 'fileList'
}
</script>
<script setup>
import { ref, onMounted, onBeforeUnmount, h } from 'vue'
import { getFilesList, sourceFileExport } from '@/api/api_file'
import { getResearchDisease } from '@/api/api_research'
import { getPermissionStructure } from '@/api/api_home'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
import fileDownLoadlog from './fileDownLoadlog.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
const userStore = useUserStore()
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/manageBackend/fileDownload') {
    hadPermissionList.value.push(item.name)
  }
})
const searchInfo = ref({
  fileName: '',
  fileId: '',
  status: [],
  hospital: [],
  diseaseType: []
})
const whether = ref(false) // 是否显示全部
const hospitalGroupOptions = ref([])
const diseaseGroupOptions = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const tableData = ref([])
// 定时请求
// const startTimer = () => {
//   const timer = setInterval(() => {
//     getListData()
//   }, 5000)

//   return timer // 返回定时器ID，以便在组件销毁时清除
// }
// const stopTimer = (timer) => {
//   clearInterval(timer) // 清除定时器
// }

// let timer = null // 定时器变量
onMounted(() => {
  // timer = startTimer() // 组件挂载时启动定时器
})
onBeforeUnmount(() => {
  // stopTimer(timer)
})
// 获取列表数据
const getListData = async(isExport) => {
  const params = {
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
  const res = await getFilesList(params)
  if (res.code === 10000) {
    if (isExport) {
      const data = res.data.items
      currentExportTotal.value = data?.length || 0
      exportTotal.value = res.data.total
    } else {
      const data = res.data.items
      data.forEach(item => {
        item.isHovered = false
      })
      tableData.value = data
      total.value = res.data.total
    }
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
const handleEcho = (params) => {
  searchInfo.value = params
  handleHisExport(false)
  getListData()
}
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
const dialogVisible = ref(false)
const checkListData = ['当前数据页', '当前筛选数据'] // 数据范围
const handleExport = () => {
  dialogVisible.value = true
}
const dataRange = ref('')
const handleClose = () => {
  dialogVisible.value = false
  dataRange.value = ''
}
const exportTotal = ref(0)
const currentExportTotal = ref(0)
const handleExportUpload = async() => {
  if (!dataRange.value) {
    ElMessage({
      message: '请选择要导出的数据范围',
      type: 'warning'
    })
    return
  }
  await getListData(true)
  let total = 0
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const filenameVal = `原文件库_${year}年${month}月${day}日${hours}时${minutes}分${seconds}秒`

  const params = {
    exportFileName: filenameVal,
    dataRange: dataRange.value
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
  if (dataRange.value === '当前数据页') {
    params.pageNum = currentPage.value
    params.pageSize = limit.value
    total = currentExportTotal.value
  } else {
    params.pageNum = 0
    params.pageSize = 0
    total = exportTotal.value
  }
  params.showFilterContent = JSON.stringify({
    value: searchInfo.value
  })
  if (total > 100) {
    ElMessageBox.confirm(
      h('p', null, [
        h('span', null, '当前导出病历数据份数大于'),
        h('span', { style: 'color: #ff4e4e' }, '100份'),
        h('span', null, '，将会生成任务由管理员进行线下下载，点击确认后请联系管理员进行下载操作！')
      ]),
      '导出文件',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }
    ).then(async() => {
      sourceFileExport(params).then(res => {
        if (res.code === 10000) {
          ElMessage.success('导出成功')
          handleClose()
        } else {
          ElMessage.error('导出失败')
        }
      })
    }).catch(() => {

    })
  } else {
    sourceFileExport(params).then(res => {
      if (res.code === 10000) {
        ElMessage.success('导出成功')
        handleClose()
      } else {
        ElMessage.error('导出失败')
      }
    })
  }
}
const ishistoryExportRecord = ref(false)
const handleHisExport = (val) => {
  ishistoryExportRecord.value = val
}
</script>

<style scoped lang="scss">
@use "@/style/common/list.scss";
.table-header {
  .export {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
    background-color: var(--theme-card) !important;
    .el-button {
      i {
        margin-right: 10px;
        font-size: 12px;
      }
    }
  }
}
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
          height: 296px;
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
    }
  }
}
:deep(.dialogDIV) {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .el-dialog__body {
    padding-bottom: 22px;
  }
  .dialog-footer {
    .submit {
      margin-left: 12px;
      border: none;
      background-color: var(--theme-primary);
      color: #fff;
    }
  }
}
.data-range {
  height: 20px;
  margin-top: 20px;
  :deep(.el-radio) {
    height: auto;
  }
}
.section-title {
  display: flex;
  align-items: center;
  height: 20px;
  margin-bottom: -4px;
  line-height: 20px;
  font-weight: 500;
  color: var(--theme-text);

  .line {
    width: 2px;
    height: 15px;
    margin-right: 6px;
    background-color: var(--theme-primary);
  }
  .text {
    font-weight: 500;
    font-size: 14px;
  }
}

</style>
