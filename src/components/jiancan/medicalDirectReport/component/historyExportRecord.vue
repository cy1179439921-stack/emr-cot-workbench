<template>
  <div class="content-medicalRecord">
    <el-dialog :model-value="true" title="导出" :width="pxToRem(740)" class="dialogDIV" @close="close">
      <div class="listDiv">
        <HistoryderivedRecordDetails
          v-if="addDialogShow"
          v-model:addDialogShow="addDialogShow"
          :curEditRow="curEditRow"
          @handle-close="addDialogShow = false"
          @handler="handlerRowData"
          @close="close"
          @echo="echo"
          :diseaseGroupOptions="diseaseGroupOptions"
          :type="props.type"
        />
        <div class="tableStyle borderDiv" v-else>
          <commonTable class="singleTable btnsLastCell dialogEmptyTable" :data="tableData">
            <el-table-column label="文件名" prop="fileName" min-width="120"></el-table-column>
            <el-table-column prop="useraccount" label="导出时间" min-width="80">
              <template #default="scope">
                <span>{{ convertTimestampToDate(scope.row.createTime,true) }}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column prop="queueName" label="研究队列"></el-table-column> -->
            <el-table-column label="导出状态" min-width="60">
              <template #default="scope">
                <div class="status"><span :class="'status' + scope.row.bizStatus"></span>{{ statusList[scope.row.bizStatus] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" min-width="48">
              <template #default="scope">
                <el-button type="primary" link @click.stop="handlerRowData('details', scope.row)" class="textBtn">详情</el-button>
                <!-- <el-button type="primary" link @click.stop="handlerRowData('delete', scope.row)" class="textBtn del">删除</el-button> -->
                <el-button type="primary" link @click.stop="handlerRowData('download', scope.row)" class="textBtn" :style="{color:(scope.row.bizStatus !== 2 ? 'rgba(149,149,149,0.5453)':'var(--el-color-primary)') }" :disabled="scope.row.bizStatus !== 2" v-if="scope.row.bizStatus !== 0">下载</el-button>
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
import { ref, computed } from 'vue'
import { convertTimestampToDate } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAListOfHistoryExportRecords, delexportRecord, exportRecordRetry } from '@/api/jiancanAPI/api_export'
import HistoryderivedRecordDetails from '@/components/jiancan/medicalDirectReport/component/historyderivedRecordDetails.vue'
const emit = defineEmits(['closure', 'echo'])
const props = defineProps({
  type: {
    type: Number,
    default: 1
  },
  diseaseGroupOptions: {
    type: Array,
    default: () => ([])
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
    type: props.type
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

init()

const curEditRow = ref(null)
// 编辑
const handlerRowData = async (type, row) => {
  const { fileUrlList, fileName } = row
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
      if (!fileUrlList || fileUrlList.length === 0) { // 检查 fileUrlList 是否存在且不为空
        ElMessage({ message: '文件不存在', type: 'error' })
        return
      }
      await download(fileUrlList, fileName) // 传递 fileUrlList 和 fileName
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
    const response = await fetch(fileUrl)
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    const name = getFileExtension(fileUrl) || fileName // 如果没有文件扩展名则使用 fileName
    if (name) {
      a.download = name
      a.click()
      a.remove()
    } else {
      ElMessage({ message: '文件地址无效，请联系管理员核对', type: 'error' })
      return
    }
  }
  ElMessage({ message: '文件已开始下载', type: 'success' })
}

const echo = (data) => {
  emit('echo', data)
}

function getFileExtension(url) {
  // 获取文件扩展名
  const regex = url.split('/').pop().split('?')[0]
  // 解码
  return decodeURIComponent(regex) || null
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
    width: 740px;
    height: 556px;
    padding: 0;
    .el-dialog__header {
      display: v-bind(headerIsShow);
    }
    .textBtn {
      font-weight: normal;
      color: var(--el-color-primary);
    }
    .el-dialog__body {
      padding-bottom: 0;
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
.del {
  color: #f76868 !important;
}
</style>
