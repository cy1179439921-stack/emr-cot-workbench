<template>
  <div class="database-container">
    <div class="contentTop">
      <div class="info">
        <p @click="emit('goBack')">
          <i class="iconfont icon-zuo"></i>
          <span>返回</span>
        </p>
        <span class="title">数据集名称：</span>
        <span class="value">{{curryData?.name || '-'}}</span>

        <span class="title">数据集大小：</span>
        <span class="value">{{curryData?.fileSizeStr || '-'}}</span>

        <span class="title title1">数据维度：</span>
        <span class="value">{{dimensions || '-'}}</span>
      </div>
    </div>
    <div class="main">
      <div class="table-controls">
        <span class="describe">全部数据集</span>
        <el-button type="primary" @click="exportDialog = true" v-if="!needCheckPermission || hadPermissionList.includes('导出')">
          <i class="iconfont icon-daochu1"></i>
          <span>数据导出</span>
        </el-button>
      </div>
      <commonTable ref="tableRef" border :data="tableData" :cell-style="handleCellStyle" class="table surroundingTableBorder">
        <el-table-column align="center" :fixed="true" type="index" :width="echartsToPx(76)"></el-table-column>
        <el-table-column align="center" v-for="(colum, index) in columns" :key="index" :label="colum.header" style="background-color: rgba(54, 112, 248, 0.05);">
          <el-table-column align="center" :prop="String(colum.prop)" show-overflow-tooltip :label="colum.prop" :min-width="echartsToPx(190)">
            <template v-slot:header>
              <div class="tableHeaderLabel" v-show-tip>
                <el-tooltip class="box-item" effect="dark" :content=" colum.prop " placement="bottom" :open-delay="400" :enterable="false" :hide-after="0">
                  <div class="ellipsis">{{ colum.prop }}</div>
                </el-tooltip>
              </div>
            </template>
            <template #default="scope">
              <div class="tableHeaderLabel" v-show-tip>
                <!-- <el-tooltip class="box-item" effect="dark" :content=" String(scope.row[colum.prop]) " placement="bottom" :open-delay="400" :enterable="false" :hide-after="0"> -->
                <div class="ellipsis">{{ scope.row[colum.prop] }}</div>
                <!-- </el-tooltip> -->
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </commonTable>
    </div>
    <el-dialog v-model="exportDialog" title="数据导出" :width="pxToRem(450)" :before-close="resetForm">
      <el-radio-group v-model="fileFormat">
        <el-radio :value="item.value" v-for="item in fileTypeList" :key="item.value">{{item.label}}</el-radio>
      </el-radio-group>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialog = false">取 消</el-button>
          <el-button type="primary" @click="handleExport">确 认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { echartsToPx } from '@/utils/utils.js'
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getDatasetDetail, exportDataset, getDatasetDetailIndex, getProjectDetail } from '@/api/api_dataAnalysis'
import { nowDate } from '@/utils/utils'
import { blodDownLoadFile } from '@/utils/fileDownload'
const emit = defineEmits(['goBack'])
// 当前数据
const props = defineProps({
  id: {
    type: String,
    default: '0'
  },
  needCheckPermission: {
    type: Boolean,
    default: false
  },
  hadPermissionList: {
    type: Array,
    default: () => []
  },
  projectId: {
    type: String,
    default: ''
  }
})
const curryData = ref({}) // 当前数据
const isLoding = ref(false) // 是否正在加载
const fileTypeList = [
  { label: 'csv', value: 3 },
  { label: 'xlsx', value: 2 },
  { label: 'xls', value: 1 }
] // 导出文件格式列表
const tableRef = ref(null) // 表格引用
const columns = ref([]) // 表格列
const tableData = ref([]) // 表格数据
const exportDialog = ref(false) // 导出弹窗
const fileFormat = ref(3) // 导出选项
const total = ref(0) // 总数据量
const pageNum = ref(1) // 当前页
const pageSize = ref(50) // 每页数据量
const maxPage = ref(1) // 最大页数
const tableBodyWarp = ref(null) // 表格body的元素
// 数据维度
const dimensions = computed(() => {
  const row = total.value + '行'
  const col = columns.value.length + '列'
  return row + '*' + col
})

// 更改第一列样式
const handleCellStyle = ({ columnIndex }) => {
  if (columnIndex === 0) {
    // 判断是否为第一列
    return { backgroundColor: '#F5F8FF', whiteSpace: 'nowrap' } // 设置背景色
  }
}

// 初始化数据
const initData = async () => {
  // 获取数据集信息
  getDatasetDetailIndex({ id: props.id }).then(res => {
    if (res.code === 10000) {
      curryData.value = res?.data || {}
      if (props.projectId) {
        getProjectDatasetName()
      }
    }
  })

  const res = await getTableData()
  const columnArr = []
  // 处理表头，添加双字母属性
  res.headerList.forEach((item, index) => {
    columnArr.push({
      header: getColumnHeader(index), // 添加字母属性，从 A 到 ZZZZZ
      prop: item
    })
  })

  columns.value = columnArr
  tableData.value = res.data?.items || []
  total.value = res.data?.total || 0
  maxPage.value = Math.ceil(total.value / pageSize.value)

  nextTick(() => {
    addScrollEvent() // 添加滚动事件
  })
}

const getProjectDatasetName = () => {
  getProjectDetail({ id: props.projectId }).then(res => {
    curryData.value.name = res?.data?.dataSetName || ''
  })
}

const getColumnHeader = (index) => {
  let header = ''
  let tempIndex = index

  while (tempIndex >= 0) {
    const charCode = (tempIndex % 26) + 65 // 65 是 'A' 的 ASCII 码
    header = String.fromCharCode(charCode) + header // 在前面添加字符
    tempIndex = Math.floor(tempIndex / 26) - 1 // 进行进位处理
  }
  return header
}

// 获取表格内容实体，添加滚动事件
const addScrollEvent = () => {
  tableBodyWarp.value = tableRef.value?.tableRef?.$refs.scrollBarRef?.wrapRef
  if (tableBodyWarp.value) {
    tableBodyWarp.value.addEventListener('scroll', handleScroll)
  }
}

// 获取表格数据
const getTableData = async () => {
  const params = {
    dataSetId: props?.id || '0',
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }
  const res = await getDatasetDetail(params)
  return res?.data || {}
}

// 滚动事件处理函数
const handleScroll = () => {
  // 判断是否最后一页
  if (pageNum.value === maxPage.value) {
    tableBodyWarp.value?.removeEventListener('scroll', handleScroll)
  }
  // 判断是否到底部
  const scrollBottom = tableBodyWarp.value.scrollHeight - tableBodyWarp.value.scrollTop - tableBodyWarp.value.clientHeight
  // 判断是否为最后一页，并且距离底部小于50px，并且没有在加载中
  if (scrollBottom < 50 && pageNum.value < maxPage.value && !isLoding.value) {
    getNextPageData()
  }
}

// 获取下一页数据
const getNextPageData = async () => {
  // 进入加载状态防止重复请求
  isLoding.value = true
  pageNum.value++
  try {
    const res = await getTableData()
    const data = res?.data?.items || []
    // todo: 处理分页数据
    tableData.value = tableData.value.concat(data)
    // 重新设置tableBodyWarp
    nextTick(() => {
      tableBodyWarp.value = tableRef.value?.tableRef?.$refs.scrollBarRef?.wrapRef
      isLoding.value = false
    })
  } catch {
    // 出现加载失败要回退
    pageNum.value--
  } finally {
    // 不管失败完成都要取消加载，才能再次触发滚动下一页时间
    isLoding.value = false
  }
}

const handleExport = () => {
  if (!fileFormat.value) {
    ElMessage.warning('请选择文件格式')
    return
  }
  exportDataset({ type: fileFormat.value, dataSetId: props?.id || '0' }).then((result) => {
    const fileType = fileTypeList.find(item => item.value === fileFormat.value)?.label // 获取文件类型
    const fileName = `${curryData.value.name}_${nowDate()}.${fileType}` // 导出文件名
    blodDownLoadFile(result, fileName)
    exportDialog.value = false // 关闭导出弹窗
  })
}

// 关闭对话框重置表单
const resetForm = () => {
  fileFormat.value = 3
  exportDialog.value = false
}

// 初始化数据
onMounted(() => {
  initData()
})

// 销毁移除监听
onUnmounted(() => {
  tableBodyWarp.value?.removeEventListener('scroll', handleScroll)
})
</script>
<style lang="scss" scoped>
.database-container {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
  padding-bottom: 32px;
  .contentTop {
    display: flex;
    align-items: center;
    flex-basis: 48px;
    box-sizing: border-box;
    padding: 0 24px 0 8px;
    background: var(--theme-card);

    .info {
      display: flex;
      align-items: center;
      span {
        line-height: 20px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text-2);
        white-space: nowrap;
        &.value {
          margin-right: 54px;
        }
      }
      p:nth-child(1) {
        display: flex;
        align-items: center;
        height: 20px;
        margin-right: 16px;
        padding-right: 16px;
        border-right: 1px solid #cbcfdc;
        cursor: pointer;
        .iconfont {
          display: block;
          width: 32px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          font-size: 32px;
          color: var(--theme-primary);
        }
        span {
          display: block;
          margin-left: -5px;
          line-height: 32px;
          font-weight: 400;
          font-size: 16px;
          color: var(--el-color-primary);
        }
      }
    }
  }
  .main {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    margin: 16px 16px 0 16px;
    padding: 18px 24px 24px 24px;
    border-radius: 4px;
    background-color: var(--theme-card);
    .table-controls {
      margin-bottom: 20px;

      @include childrenBetween();
      .describe {
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .el-button {
        i {
          margin-right: 10px;
          font-size: 12px;
        }
      }
    }
    .table {
      :deep(:where(td,tr)) .cell {
        justify-content: center;
        padding: 0 12px;
        // white-space: wrap;
        .tableHeaderLabel {
          overflow: hidden;
        }
      }
    }
  }
  :deep(.el-dialog__body) {
    overflow: hidden;
    height: 16px;
    .el-radio-group {
      label {
        display: flex;
        align-items: flex-start;
        height: 14px;
      }
    }
  }
}
</style>
