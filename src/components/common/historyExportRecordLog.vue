<template>
  <div class="content-medicalRecord">
    <el-dialog :model-value="true" title="历史导出记录" :width="pxToRem(740)" class="dialogDIV" @close="close">
      <div class="listDiv">
        <div class="notice">
          <i class="iconfont icon-tishi-yidongwenjianjia"></i>
          <span>超过近90天导出记录将失效，请记得及时下载！</span>
        </div>
        <div class="tableStyle borderDiv">
          <commonTable class="singleTable btnsLastCell" :data="tableData">
            <el-table-column label="文件名" prop="fileName" min-width="180"></el-table-column>
            <el-table-column prop="useraccount" label="导出时间" min-width="90">
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
            <el-table-column label="操作" fixed="right" min-width="40">
              <template #default="scope">
                <el-button type="primary"
                           link
                           @click.stop="handlerRowData('download', scope.row)"
                           class="textBtn"
                           :style="{color:(scope.row.bizStatus !== 2 ? 'rgba(149,149,149,0.5453)':'var(--el-color-primary)') }"
                           :disabled="scope.row.bizStatus !== 2||!scope.row?.fileUrlList?.length"
                           v-if="scope.row.bizStatus !== 0">下载</el-button>
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
import { ElMessage } from 'element-plus'
import { exportOperationLogRecord } from '@/api/api_home'
const emit = defineEmits(['closure', 'echo'])
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
    type: 4
  }
  const res = await exportOperationLogRecord(params)
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

// 下载
const handlerRowData = async (type, row) => {
  const { fileUrlList, fileName } = row
  if (!fileUrlList || fileUrlList.length === 0) { // 检查 fileUrlList 是否存在且不为空
    ElMessage({ message: '文件不存在', type: 'error' })
    return
  }
  await download(fileUrlList, fileName) // 传递 fileUrlList 和 fileName
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
  }
  ElMessage({ message: '文件已开始下载', type: 'success' })
}
function getFileExtension(url) {
  // 获取文件扩展名
  const regex = url.split('/').pop().split('?')[0]
  // 解码
  return decodeURIComponent(regex) || null
}
</script>

<style lang="scss" scoped>
.content-medicalRecord {
  :deep(.dialogDIV) {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    height: 621px;
    padding: 0;
    .content {
      display: flex;
      // overflow: hidden;
      flex-direction: column;
      height: 100%;
    }
    .notice {
      display: flex;
      align-items: center;
      flex-shrink: 0;
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
    .el-dialog__header {
      display: v-bind(headerIsShow);
      // height: 56px !important;
    }
    .el-dialog__body {
      padding-bottom: 0;
    }
    .textBtn {
      font-weight: normal;
      color: var(--el-color-primary);
    }
  }
  .listDiv {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
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
