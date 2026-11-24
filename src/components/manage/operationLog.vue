<template>
  <HistoryExportRecorLog v-if="ishistoryExportRecord" @closure="handleHisExport(false)"></HistoryExportRecorLog>
  <div class="operationLog">
    <div class="viewContent">
      <header class="header header1">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="searchTitle">
          <el-form ref="searchForm" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="事件类型" class="form-query-select">
              <el-select v-model="searchInfo.eventType" clearable placeholder="请选择一项">
                <el-option
                  v-for="item in statusGroupOptions"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="操作人" class="form-query-select">
              <el-input type="text" v-model="searchInfo.creator" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
            </el-form-item>
            <el-form-item label="操作时间" class="form-query-select" :style="{width:pxToRem(320)}">
              <el-date-picker
                v-model="searchInfo.time"
                type="daterange"
                :clearable="false"
                :disabledDate="disabledDate"
                range-separator="-"
                @calendar-Change="calendarChange"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
            <div class="btnDiv">
              <el-button @click="resetParams">重置条件</el-button>
              <el-button @click="onSubmit">查 询</el-button>
            </div>
          </el-form>
        </div>
      </header>
      <div class="content">
        <header class="header2">
          <div class="title">操作日志</div>
          <div class="export">
            <div class="common-btn" @click="handleHisExport(true)" v-if="!needCheckPermission || hadPermissionList.includes('导出')">
              <!-- <i class="iconfont icon-daochujilu"></i> -->
              <img src="@/assets/daochu.png" alt="">
              <span>导出记录</span>
            </div>
            <div class="common-btn" @click="handleExport" v-if="!needCheckPermission || hadPermissionList.includes('导出')" >
              <!-- <i class="iconfont icon-daochu"></i> -->
              <img src="@/assets/daochu.png" alt="">
              <span>导&nbsp;出</span>
            </div>
          </div>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable emptyDefaultTable" id="exportTable" :data="tableData">
            <el-table-column prop="id" label="日志序号" min-width="120"></el-table-column>
            <el-table-column prop="eventType" label="事件类型" min-width="120">
              <template v-slot="scope">
                {{ statusGroupOptions[scope.row.eventType - 1].label }}
              </template>
            </el-table-column>
            <el-table-column prop="eventDetail" label="事件描述" min-width="150"></el-table-column>
            <el-table-column prop="resultCode" label="操作是否成功" min-width="80">
              <template v-slot="scope">
                <div class="resultCodeDiv">
                  <span :class="scope.row.resultCode === '成功' ? 'iconfont icon-success' : 'iconfont icon-error'"></span>
                  <span>{{scope.row.resultCode}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="creator" label="操作人" min-width="80"></el-table-column>
            <!-- <el-table-column prop="createTime" label="操作时间" min-width="60">
              <template v-slot="scope">
                {{ convertTimestampToDate(scope.row.createTime,true) }}
              </template>
            </el-table-column> -->
            <el-table-column prop="createTime" label="操作时间" min-width="60"></el-table-column>
          </commonTable>
          <div class="tabel_pagination">
            <el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
              <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
            </el-pagination>
          </div>
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
  </div>
</template>

<script>
export default {
  name: 'operationLog'
}
</script>
<script setup>
import { ref } from 'vue'
// import * as XLXS from 'xlsx'
// import FileSaver from 'file-saver'
import HistoryExportRecorLog from '@/components/common/historyExportRecordLog.vue'
import { getOperationLogList, exportOperationLog } from '@/api/api_home'
import { getPagePermission } from '@/hooks/permissionHooks'
import { formatStandardDate } from '@/utils/utils'
import { ElMessage } from 'element-plus'
const { needCheckPermission, hadPermissionList } = getPagePermission('/manage/operationLog')
// eslint-disable-next-line no-unused-vars
const getDefaultTime = (type) => {
  if (type === 'month' || type === 'monthrange') {
    const end = new Date()
    const start = new Date()

    // 核心修改：使用 setMonth 自动处理跨年和月份溢出
    // 如果想要近1个月，就 -1；如果想要近12个月，就 -12
    start.setMonth(end.getMonth() - 1)

    // 如果需要包含“下个月”作为结束（看您之前的逻辑好像有 +1），可以对 end 也做处理
    // 但通常默认时间范围是：[一个月前, 今天]
    return [formatStandardDate(start), formatStandardDate(end)]
  } else if (type === 'year' || type === 'yearrange') {
    // ... 保持不变
    const year = new Date().getFullYear()
    return [year - 6, year]
  } else {
    // ... 保持不变
    const end = new Date()
    const start = new Date().getTime() - 3600 * 1000 * 24 * 6
    return [formatStandardDate(start), formatStandardDate(end)]
  }
}
const searchInfo = ref({
  eventType: '',
  creator: '',
  // time: []
  time: getDefaultTime('monthrange')
})
const statusGroupOptions = ref([
  {
    id: 1,
    label: '登录'
  },
  {
    id: 2,
    label: '登出'
  },
  {
    id: 3,
    label: '新增'
  },
  {
    id: 4,
    label: '删除'
  },
  {
    id: 5,
    label: '导出'
  },
  {
    id: 6,
    label: '编辑'
  }
])
const checkListData = ['当前数据页', '当前筛选数据'] // 数据范围
const dataRange = ref('')
const dialogVisible = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const ishistoryExportRecord = ref(false)
const getData = async() => {
  console.log(searchInfo.value.time)
  const params = {
    pageNum: currentPage.value,
    pageSize: limit.value,
    eventType: searchInfo.value.eventType,
    creator: searchInfo.value.creator,
    time: searchInfo.value.time && searchInfo.value.time.length > 0
      ? [
        searchInfo.value.time[0] ? formatStandardDate(searchInfo.value.time[0]) : '',
        searchInfo.value.time[1] ? formatStandardDate(searchInfo.value.time[1]) : ''
      ]
      : []
  }
  const res = await getOperationLogList(params)
  if (res.code === 10000) {
    tableData.value = res.data.items || []
    total.value = res.data.total
  }
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getData()
}
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getData()
}

const handleHisExport = (flag) => {
  ishistoryExportRecord.value = flag
}
const handleExport = () => {
  dialogVisible.value = true
}
const handleClose = () => {
  dialogVisible.value = false
  dataRange.value = ''
}
const handleExportUpload = async() => {
  if (!dataRange.value) {
    ElMessage({
      message: '请选择要导出的数据范围',
      type: 'warning'
    })
    return
  }
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const filenameVal = `操作日志_${year}年${month}月${day}日${hours}时${minutes}分${seconds}秒`
  const params = {
    fileName: filenameVal,
    dataRange: dataRange.value,
    pageNum: currentPage.value,
    pageSize: limit.value,
    eventType: searchInfo.value.eventType,
    creator: searchInfo.value.creator,
    time: searchInfo.value.time && searchInfo.value.time.length > 0
      ? [
        searchInfo.value.time[0] ? formatStandardDate(searchInfo.value.time[0]) : '',
        searchInfo.value.time[1] ? formatStandardDate(searchInfo.value.time[1]) : ''
      ]
      : []
  }
  if (dataRange.value === '当前数据页') {
    params.pageNum = currentPage.value
    params.pageSize = limit.value
  } else {
    params.pageNum = ''
    params.pageSize = ''
  }
  exportOperationLog(params).then(res => {
    if (res.code === 10000) {
      ElMessage.success('导出成功')
      handleClose()
    } else {
      ElMessage.error('导出失败')
    }
  })
}

// 加载时请求页面列表
const init = async() => {
  getData()
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {
    eventType: '',
    creator: '',
    time: getDefaultTime('monthrange')
  }
  getData()
}

// 搜索
const onSubmit = () => {
  getData()
  // return false
}
const chooseDay = ref('')
const disabledDate = (time) => {
  // 选择维度为月
  if (chooseDay.value) {
    // 选择了一个月份 ,限制最多选择30个月
    const num = 3 * 30 * 24 * 3600 * 1000
    const minTime = chooseDay.value - num
    const maxTime = chooseDay.value - 0 + num
    return (time.getTime() > Date.now() || (time.getTime() > maxTime || time.getTime() < minTime))
  } else {
    return time.getTime() > Date.now() // 如果没有选择日期，就要限制不能选择还没到的日期
  }
}
const calendarChange = (obj) => {
  const minDate = obj[0]
  const maxDate = obj[1]
  // 把选择的第一个日期赋值给一个变量。
  chooseDay.value = minDate.getTime()
  // 如何你选择了两个日期了，就把那个变量置空
  if (maxDate) chooseDay.value = null
}
</script>

<style scoped lang="scss">
.operationLog {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 16px 0 0;
    border-radius: 8px;
    background-color: var(--theme-card);
    :deep(.el-form) {
      display: flex;
      position: relative;
      width: 100%;
      .el-form-item {
        width: 274px;
        margin-right: 32px;
        margin-bottom: 0;
        .el-form-item__label {
          padding-right: 10px;
        }
        .el-date-editor {
          width: 344px !important;
        }
      }
    }
    &.header1 {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 127px;
      padding: 0 24px;
      background-color: var(--theme-card);
      font-size: 14px;
      .conditionTitle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-top: 24px;
        .title {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
      }
    }
    .searchTitle {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: 24px;
      .btnDiv {
        display: flex;
        .el-button {
          border-color: #d9d9d9;
          &:nth-child(1):hover {
            border-color: #ebf2fa !important;
            border-color: var(--theme-primary) !important;
            background-color: var(--theme-primary-soft) !important;
            color: var(--theme-primary) !important;
          }
          &:focus {
            border-color: #d9d9d9;
            background-color: var(--theme-card);
            color: #646464;
          }
          &:nth-child(2) {
            margin-left: 14px;
            border: 0;
            background: var(--theme-primary);
            color: #fff;
          }
        }
      }
    }
  }
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 0;
    margin-top: 16px;
    padding: 0 24px;
    border-radius: 8px;
    background: var(--theme-card);
    .header2 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      padding: 18px 0;
      .title {
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .export {
        display: flex;
        align-items: center;
        .common-btn {
          margin-right: 12px;
          padding: 0 16px;
          // i {
          //   font-size: 24px;
          // }
          img {
            width: 13px;
            height: 12px;
            margin-right: 10px;
          }
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
    .tableMain {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 0;
      // padding: 0 8px;
      :deep(.singleTable) {
        flex: 1;
        thead {
          .cell {
            font-weight: 400;
            font-size: 14px;
            color: #000;
          }
        }
        .resultCodeDiv {
          display: flex;
          justify-content: center;
          align-items: center;
          .iconfont {
            display: block;
            width: 6px;
            height: 6px;
            margin-right: 8px;
            border-radius: 100%;
          }
          .icon-success {
            background: #04a273;
          }
          .icon-error {
            background: #ff4e4e;
          }
        }
      }
    }
    .tabel_pagination {
      display: flex;
      justify-content: center;
    }
  }
  :deep(.new_Dialog) {
    padding: 0;
  }
  :deep(.new_Dialog2) {
    .el-dialog__body {
      box-sizing: border-box;
      // height: 148px;
      padding: 0 24px 0 24px !important;
      .el-form-item__content {
        height: auto !important;
        padding-right: 0;
        .el-input {
          height: 40px;
          line-height: 40px;
        }
        p {
          margin: 4px 0 0 6px;
          line-height: 17px;
          text-align: left;
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          color: var(--theme-text-3);
        }
      }
      .exportContent {
        display: flex;
        align-items: flex-start;
        >p {
          margin: 0 0 0 8px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text);
          white-space: nowrap;
        }
        >div {
          margin-left: 24px;
          p {
            margin: 0;
            line-height: 20px;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text);
          }
          p:last-child {
            margin: 4px  0 24px 0;
            line-height: 17px;
            font-weight: 400;
            font-size: 12px;
            color: #959595;
          }
        }
      }
    }
    .el-form-item:nth-child(1)::before {
      display: none !important;
    }
    .is-disabled {
      opacity: 0.6;
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
.data-range {
  margin-top: 20px;
  :deep(.el-radio) {
    height: auto;
  }
}
.select-container {
  margin-top: 16px;
  border: 1px solid #e8e8e8;
  .select-all {
    display: flex;
    height: 40px;
    padding-left: 16px;
    background: rgba(54, 112, 248, 0.05);
  }
  .value {
    padding: 0 16px 14px 16px;
    .el-checkbox-group {
      .el-checkbox {
        width: 25%;
        height: 20px;
        margin-right: 0;
        margin-top: 14px;
      }
    }
  }
}
:where(.el-radio-group,.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  .el-radio {
    height: 20px;
  }
}
</style>
