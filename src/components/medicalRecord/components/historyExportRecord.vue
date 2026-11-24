<template>
  <div class="content-medicalRecord">
    <el-dialog :model-value="true" title="历史导出记录" :width="pxToRem(865)" class="dialogDIV" @close="close">
      <div class="listDiv">
        <HistoryderivedRecordDetails
          v-if="addDialogShow"
          v-model:addDialogShow="addDialogShow"
          :curEditRow="curEditRow"
          :studyCohort="props.studyCohort"
          @handle-close="addDialogShow = false"
          @handler="handlerRowData"
          @close="close"
          @echo="echo"
          :isMedicalRecord="props.isMedicalRecord"
          :type="props.type"
          :treeSource="treeSource"
        />
        <div class="tableStyle borderDiv" v-else>
          <div class="notice">
            <i class="iconfont icon-tishi-yidongwenjianjia"></i>
            <span>超过近90天导出记录将失效，请记得及时下载！</span>
          </div>
          <commonTable class="singleTable btnsLastCell dialogEmptyTable" :data="tableData">
            <el-table-column prop="fileName" label="文件名" min-width="176"></el-table-column>
            <el-table-column prop="useraccount" label="导出时间" min-width="100">
              <template #default="scope">
                <span>{{ convertTimestampToDate(scope.row.createTime,true) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="queueName" label="研究队列" min-width="80" v-if="studyCohort"></el-table-column>
            <el-table-column label="导出状态" min-width="60">
              <template #default="scope">
                <div class="status"><span :class="'status' + scope.row.bizStatus"></span>{{ statusList[scope.row.bizStatus] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" :min-width="studyCohort ? '100' : '80'">
              <template #default="scope">
                <el-button type="primary" link @click.stop="handlerRowData('details', scope.row)" class="textBtn">详情</el-button>
                <el-button type="primary" link @click.stop="handlerRowData('delete', scope.row)" class="textBtn">删除</el-button>
                <el-button
                  type="primary"
                  link
                  @click.stop="handlerRowData('download', scope.row)"
                  :style="{color:(scope.row.bizStatus !== 2 ? 'rgba(149,149,149,0.5453)':'var(--el-color-primary)') }"
                  :disabled="scope.row.bizStatus !== 2||scope.row.bizStatus===3"
                  v-if="scope.row.bizStatus !== 0">下载
                </el-button>
                <el-button type="primary" link @click.stop="handlerRowData('retry', scope.row)" class="textBtn" v-else>重试</el-button>
              </template>
            </el-table-column>
          </commonTable>
          <div class="tabel_pagination">
            <el-pagination
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
              v-model:current-page="currentPage"
              :pager-count="5"
              :page-size="limit"
              :total="total"
            >
              <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
            </el-pagination>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
// import fileDownload from 'js-file-download'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { convertTimestampToDate } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAListOfHistoryExportRecords, delexportRecord, exportRecordRetry } from '@/api/api_export'
import HistoryderivedRecordDetails from '@/components/medicalRecord/components/historyderivedRecordDetails.vue'
const emit = defineEmits(['closure', 'echo'])
const props = defineProps({
  type: {
    type: Number,
    default: 1
  },
  studyCohort: {
    type: String,
    default: '0'
  },
  isMedicalRecord: {
    type: Boolean,
    default: true
  },
  treeSource: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const tableData = ref([])
const addDialogShow = ref(false)
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const statusList = {
  0: '导出失败',
  1: '导出中',
  2: '已完成',
  3: '已过期'
}
const getData = async () => {
  const params = {
    pageNum: currentPage.value,
    pageSize: limit.value,
    type: props.type,
    queueId: props.studyCohort
  }
  const res = await getAListOfHistoryExportRecords(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = Number(res.data.total)
  }
}
// 加载时请求页面列表
const init = async () => {
  getData()
}

let timer = null

onMounted(() => {
  init()
  timer = setInterval(() => {
    !props.studyCohort && getData()
  }, 5000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})

const curEditRow = ref(null)
// 编辑
const handlerRowData = async (type, row) => {
  const { fileName, fileUrlList } = row
  switch (type) {
    case 'details': // 详情
      curEditRow.value = row
      addDialogShow.value = true
      break
    case 'delete': // 删除
      ElMessageBox.confirm('确认删除此条数据吗?', '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      ).then(() => {
        delexportRecord({ id: row.id }).then(res => {
          if (res.code === 10000) {
            ElMessage({ message: '已删除', type: 'success' })
            addDialogShow.value = false
            getData()
          }
        })
      })
      break
    case 'download': // 下载
      if (!fileUrlList?.length) {
        ElMessage({ message: '文件不存在', type: 'error' })
        return
      }
      download(fileUrlList, fileName)
      break
    case 'retry': // 重试
      exportRecordRetry({ id: row.id }).then(res => {
        if (res.code === 10000) {
          ElMessage({ message: '重试成功', type: 'success' })
          addDialogShow.value = false
          getData()
        }
      })
      break
    default:
      break
  }
}
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getData()
}

const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getData()
}

const headerIsShow = computed(() => {
  return addDialogShow.value ? 'none' : 'block'
})

const close = () => {
  emit('closure')
}

const download = async (fileUrlList, fileName) => {
  for (const fileUrl of fileUrlList) { // 循环遍历 fileUrlList
    const name = getFileExtension(fileUrl) || fileName // 如果没有文件扩展名则使用 fileName
    if (name) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = name
      link.target = '_blank' // 可选，如果希望在新窗口中下载文件，请取消注释此行
      link.click()
      link.remove()
    } else {
      ElMessage({ message: '文件地址无效，请联系管理员核对', type: 'error' })
      return
    }
    // const response = await fetch(fileUrl, { responseType: 'arraybuffer' })
    // const arrayBuffer = await response.arrayBuffer()
    // const blob = new Blob([arrayBuffer])
    // try {
    //   fileDownload(blob, getFileExtension(fileUrl))
    //   ElMessage({ message: '文件已开始下载', type: 'success' })
    // } catch (e) {
    //   ElMessage({ message: '下载失败', type: 'error' })
    // }
  }
}

function getFileExtension(url) {
  // 获取文件扩展名
  const regex = url.split('/').pop().split('?')[0]
  // 解码
  return decodeURIComponent(regex) || null
}

const echo = (data) => {
  emit('echo', data)
}
// const fileUrl = 'https://example.com/file.pdf'
// console.log(getFileExtension(fileUrl)) // 输出：pdf
</script>

<style lang="scss" scoped>
.content-medicalRecord {
  :deep(.dialogDIV) {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    height: 621px;
    .el-dialog__header {
      display: v-bind(headerIsShow);
    }
    .el-dialog__body {
      padding-bottom: 0;
    }
    .textBtn {
      color: var(--el-color-primary);
    }
  }
  .listDiv {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .tableStyle {
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      width: 100%;
      height: 0;
      border-radius: 2px;
      background-color: var(--theme-card);
      .notice {
        display: flex;
        align-items: center;
        height: 40px;
        margin-bottom: 24px;
        padding: 0 16px;
        border: 1px solid rgba(245, 159, 12, 0.5);
        border-radius: 4px;
        background: rgba(245, 159, 12, 0.05);

        .iconfont {
          margin-right: 6px;
          font-size: 18px;
          color: #f59f0c;
        }
      }
      :deep(.singleTable) {
        display: flex;
        flex-direction: column;
        flex: 1;
        .status {
          display: flex;
          align-items: center;
          span {
            display: inline-block;
            width: 6px;
            height: 6px;
            margin-right: 8px;
            border-radius: 100%;
            &.status0 {
              background-color: #ff4e4e;
            }
            &.status1 {
              background-color: var(--theme-primary);
            }
            &.status2 {
              background-color: #04a273;
            }
            &.status3 {
              background-color: #f59f0c;
            }
          }
        }
      }
    }
  }
}
</style>
