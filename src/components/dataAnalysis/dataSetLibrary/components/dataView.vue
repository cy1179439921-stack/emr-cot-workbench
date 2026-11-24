<template>
  <div class="database-container">
    <div class="main">
      <div class="table-controls">
        <span class="describe">全部数据集</span>
        <div>
          <el-button @click="openDiaglogType(1)" v-if="!needCheckPermission || hadPermissionList.includes('另存为')">
            <i class="iconfont icon-shujulingcunwei"></i>
            <span>数据集另存为</span>
          </el-button>
          <el-button type="primary" @click="openDiaglogType(2)" v-if="!needCheckPermission || hadPermissionList.includes('导出')">
            <i class="iconfont icon-daochu1"></i>
            <span>数据导出</span>
          </el-button>
        </div>
      </div>
      <commonTable ref="tableRef" border :data="tableData" :cell-style="handleCellStyle" fit class="table surroundingTableBorder" >
        <el-table-column align="center" :fixed="true" type="index" :min-width="echartsToPx(76)" :width="echartsToPx(76)"></el-table-column>
        <el-table-column align="center" v-for="(colum) in columns" :key="colum.prop + colum.sort + colum.dataProperty" :label="colum.header" style="background-color: rgba(54, 112, 248, 0.05);" :min-width="echartsToPx(colum?.minWidth || 120)">
          <el-table-column align="center" :prop="colum.label" :label="colum.label" :min-width="echartsToPx(190)">
            <!-- 表头 -->
            <template v-slot:header>
              <el-popover placement="bottom" trigger="hover" popper-class="customPopover">
                <div class="folerOperate">
                  <template v-for="item in menuList.filter(it => it.isShow(colum))" :key="item.title" >
                    <div class="folerOperateLine" @click="handleHeader(colum, item.title)">
                      <span class="ml8">{{item.title}}</span>
                    </div>
                  </template>
                </div>
                <template #reference>
                  <div class="tableHeaderLabel" v-show-tip @click="sort(colum)" >
                    <el-tooltip class="box-item" effect="dark" :content=" String(colum.label) " placement="top" :open-delay="400" :enterable="false" :hide-after="0">
                      <div class="tableHeaderLabel">
                        <template v-if="!['',null,undefined].includes(colum.dataProperty)">
                          <SvgIcon :iconName="sortIcon(colum) || ''"></SvgIcon>
                          <SvgIcon class="mlr6" :iconName="typeIconMap[colum.dataProperty]"></SvgIcon>
                        </template>
                        <span class="content-ellipsis">{{ colum.label }}</span>
                      </div>
                    </el-tooltip>
                  </div>
                </template>
              </el-popover>
            </template>

            <!-- 内容 -->
            <template #default="scope">
              <div class="tableBodyLabel" v-show-tip>
                <el-tooltip class="box-item" effect="dark" :content="String(scope.row[colum.label])" placement="bottom" :open-delay="400" :enterable="false" :hide-after="0">
                  <div class="ellipsis">{{ scope.row[colum.label] }}</div>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </commonTable>
    </div>
    <el-dialog v-model="exportDialog" :title="btnHandlerType === 1 ? '数据集另存为' :'数据导出'" :width="btnHandlerType === 1 ? pxToRem(504) : pxToRem(450)" :before-close="resetForm">
      <el-form ref="exportFormRef" class="exportForm" :model="exportForm" :label-width="pxToRem(52)" v-if="btnHandlerType === 1" :rules="exportFormRules">
        <el-form-item label="名称" prop="name">
          <el-input class="h40" show-word-limit maxlength="15" v-model="exportForm.name" placeholder="请填写内容"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" show-word-limit maxlength="60" v-model="exportForm.description" placeholder="请填写内容"></el-input>
        </el-form-item>
      </el-form>
      <el-radio-group v-model="fileFormat" v-if="btnHandlerType === 2">
        <el-radio :value="item.value" v-for="item in fileTypeList" :key="item.value">{{item.label}}</el-radio>
      </el-radio-group>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetForm">取 消</el-button>
          <!-- <el-button type="primary" @click="handleExport(btnHandlerType)" :loading="xhrLoding">确 认</el-button> -->
          <loading-btn type="primary" ref="loadingBtnDom" @handleSubmit="handleExport(btnHandlerType)">确&nbsp;认</loading-btn>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { echartsToPx } from '@/utils/utils.js'
import { ref, reactive, nextTick, onUnmounted, watch } from 'vue'
import { analysisMethodList } from '@/components/dataAnalysis/utils/commonData'
import { ElMessage } from 'element-plus'
import { getEngineerLibraryDetail, exportEngineerLibrary, saveAsDataset } from '@/api/api_dataAnalysis'
import { nowDate } from '@/utils/utils'
import { blodDownLoadFile } from '@/utils/fileDownload'
import { getPagePermission } from '@/hooks/permissionHooks'
import { emitter } from '@/utils/bus'
const { needCheckPermission, hadPermissionList } = getPagePermission('/dataAnalysis/engineeringLibrary')
const emit = defineEmits(['handleHeader'])
const props = defineProps({
  engineeringInfo: {
    type: Object
  },
  dataOperateId: {
    type: String,
    required: true
  }
})
const xhrLoding = ref(false) // 导出请求loading
const isLoding = ref(false) // 是否正在加载
const tableRef = ref(null) // 表格引用
const columns = ref([]) // 表格列
const tableData = ref([]) // 表格数据
const activeColumn = ref(undefined) // 当前操作的列
const sortType = ref('default') // 排序类型
const exportDialog = ref(false) // 导出弹窗
const fileFormat = ref(3) // 导出选项
const btnHandlerType = ref(null) // 按钮点击 1 数据集另存为 2 数据导出
const exportFormRef = ref(null) // 数据集表单ref
const total = ref(0) // 总数据量
const pageNum = ref(1) // 当前页
const pageSize = ref(50) // 每页数据量
const maxPage = ref(1) // 最大页数
const tableBodyWarp = ref(null) // 表格body的元素
const exportForm = reactive({ // 数据集表单
  name: '',
  description: ''
})
// 导出表单
const exportFormRules = {
  name: [
    { required: true, message: '请填写数据集名称', trigger: 'blur' }
  ]
}
// 类型图标
const typeIconMap = {
  1: 'icon-shuzi',
  2: 'icon-qita',
  0: 'icon-zimu'
}
// { id: 0, label: '定性变量' }, N
// { id: 1, label: '定量变量' }, S
// { id: 2, label: '其他' } E

// 导出文件格式
const fileTypeList = [
  { label: 'csv', value: 3 },
  { label: 'xlsx', value: 2 },
  { label: 'xls', value: 1 }
] // 导出文件格式列表

// 排序映射
const sortMap = {
  default: undefined,
  shengxu: 1,
  jiangxu: 2
}

let menuList = [
  { title: '数据可视化', isShow: (item) => item.codomainType !== 7 },
  { title: '数据编辑', isShow: (item) => item.codomainType !== 7 },
  { title: '空值处理', isShow: (item) => item.dataProperty !== 2 && item.codomainType !== 7 },
  { title: '异常值处理', isShow: (item) => item.dataProperty === 1 && item.codomainType !== 7 },
  { title: '生成变量', isShow: (item) => item.dataProperty !== 2 && item.codomainType !== 7 },
  { title: '对照组切分', isShow: (item) => item.dataProperty !== 2 && item.codomainType !== 7 },
  { title: '数据筛选', isShow: (item) => item.dataProperty !== 2 && item.codomainType !== 7 },
  { title: '数据变换', isShow: (item) => item.dataProperty === 1 },
  { title: '变量变换', isShow: (item) => item.dataProperty === 1 && item.codomainType !== 7 },
  { title: '数据标准化', isShow: (item) => item.dataProperty === 1 && item.codomainType !== 7 },
  { title: '比例抽样', isShow: (item) => item.dataProperty !== 2 && item.codomainType !== 7 },
  // { title: '数据合并、数据拆分、取子集', isShow: (item) => item.dataProperty !== 2 },
  { title: '单变量调整', isShow: (item) => item.dataProperty === 1 && item.codomainType !== 7 },
  { title: '变量间的滞后调整', isShow: (item) => item.dataProperty === 1 && item.codomainType !== 7 }
  // { title: '列联表变换', isShow: (item) => item.dataProperty !== 2 }
]
// 根据hadPermissionList是否包含menuListz中的title，控制menuList的每一项是否展示
menuList = menuList.filter(item => hadPermissionList.value.includes(item.title))
// 初始化数据
const initData = async () => {
  pageNum.value = 1
  const res = await getTableData()

  // 处理表头，添加双字母属性
  res.columns.forEach((item, index) => {
    item.header = getColumnHeader(index) // 添加字母属性，从 A 到 ZZZZZ
    item.sort = 'default'
  })

  columns.value = res?.columns || []
  tableData.value = res.tableData?.items || []
  console.log('这是啊哈', columns.value, tableData.value)
  total.value = res.tableData?.total || 0
  maxPage.value = Math.ceil(total.value / pageSize.value)

  nextTick(() => {
    addScrollEvent() // 添加滚动事件
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

const getTableData = async () => {
  const sort = sortMap[sortType.value]
  const params = {
    indexName: activeColumn.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    dataProjectId: props.engineeringInfo.id,
    dataOperateId: props.dataOperateId,
    sort
  }

  const res = await getEngineerLibraryDetail(params)
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
    const data = res?.tableData?.items || []
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
    emitter.emit('closeLoading')
  }
}

// 更改第一列样式
const handleCellStyle = ({ columnIndex }) => {
  if (columnIndex === 0) {
    // 判断是否为第一列
    return { backgroundColor: '#F5F8FF', whiteSpace: 'nowrap' } // 设置背景色
  }
}

const sortIcon = (colum) => {
  const { label, dataProperty, sort } = colum
  if (['', null, undefined].includes(dataProperty)) {
    return ''
  }

  if (sort !== 'default' && label === activeColumn.value) {
    if (dataProperty === 1) {
      return sort === 'jiangxu' ? 'icon-shuzi-daoxu' : 'icon-shuzi-zhengxu'
    } else {
      return sort === 'jiangxu' ? 'icon-zimu-daoxu' : 'icon-zimu-zhengxu'
    }
  } else {
    return dataProperty === 1 ? 'icon-shuzi-bupaixu' : 'icon-zimu-bupaixu'
  }
}

// 点击排序
const sort = (column) => {
  activeColumn.value = column.label
  // 点击排序时，将其他列的排序状态置为 default
  sortType.value = column.sort === 'default' ? 'shengxu' : column.sort === 'shengxu' ? 'jiangxu' : 'default'
  columns.value = columns.value.map(col => {
    col.sort = col.label === column.label ? sortType.value : 'default'
    return col
  })
  // 点击排序时，重置页码为1，清空数据，重新请求数据
  nextTick(() => {
    emitter.emit('showLoading')
    pageNum.value = 0
    tableData.value = []
    getNextPageData()
    // 移除滚动事件,重新添加
    tableBodyWarp.value?.removeEventListener('scroll', handleScroll)
    nextTick(() => {
      addScrollEvent() // 添加滚动事件
    })
  })
}

// eslint-disable-next-line no-unused-vars
const handleHeader = (column, name) => {
  const menu = analysisMethodList[0].children // 获取数据整理菜单
  const curMenu = menu.find(item => item.name === name) // 获取当前点击的菜单
  emit('handleHeader', { ...curMenu, selectColumn: column })
}
const loadingBtnDom = ref()
const handleExport = (type) => {
  switch (type) {
    case 1:
      exportFormRef.value.validate((valid) => {
        if (valid) {
          xhrLoding.value = true
          const params = {
            pid: 0,
            projectId: props.engineeringInfo.id,
            dataOperateId: props.dataOperateId,
            name: exportForm.name,
            describe: exportForm.description,
            dataSource: 4,
            type: 2
          }
          saveAsDataset(params).then(res => {
            if (res.code === 10000) {
              resetForm()
              ElMessage.success('数据集另存为成功')
            }
          })
        } else {
          loadingBtnDom.value.handleLoading()
        }
      })
      break
    case 2:
      if (!fileFormat.value) {
        ElMessage.warning('请选择文件格式')
        loadingBtnDom.value.handleLoading()
        return
      }
      exportEngineerLibrary({ id: props.engineeringInfo.id, dataOperateId: props.dataOperateId, type: fileFormat.value }).then(result => {
        const fileType = fileTypeList.find(item => item.value === fileFormat.value)?.label // 获取文件类型
        const fileName = `${props.engineeringInfo.name}_${props.engineeringInfo.dataSetName}_${nowDate()}.${fileType}` // 导出文件名
        blodDownLoadFile(result, fileName)
        resetForm()
      })
      break
  }
}

// 打开对话框,设置按钮对应类型
const openDiaglogType = (type) => {
  btnHandlerType.value = type
  exportDialog.value = true
}

// 关闭对话框重置表单
const resetForm = () => {
  exportFormRef.value?.resetFields()
  exportForm.name = ''
  exportForm.description = ''
  fileFormat.value = 3
  exportDialog.value = false
  xhrLoding.value = false
}

watch(() => props.dataOperateId, (val) => {
  if (val) {
    initData()
  }
}, { immediate: true, deep: true })

// 销毁移除监听
onUnmounted(() => {
  tableBodyWarp.value?.removeEventListener('scroll', handleScroll)
})

defineExpose({
  initData
})
</script>
<style lang="scss" scoped>
.database-container {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
  border-radius: 8px;
  background-color: var(--theme-card);
  // padding-bottom: 32px;
  .main {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    // margin: 16px 16px 0 16px;
    padding: 18px 24px 24px 24px;
    // border-radius: 4px;
    // background-color: var(--theme-card);
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
      }
      :deep(.tableHeaderLabel) {
        display: flex;
        overflow: hidden;
        align-items: center;
        cursor: pointer;
        font-weight: 350;
        font-size: 14px;
        color: var(--theme-text);
        .svg-icon {
          flex-shrink: 0;
          height: 16px;
          line-height: 22px;
        }
        .mlr6 {
          height: 18px;
          margin: 0 2px 0 0;
        }
      }
      :deep(.tableBodyLabel) {
        display: flex;
        overflow: hidden;
        flex-wrap: wrap;
        align-items: center;
        cursor: pointer;
        font-weight: 350;
        font-size: 14px;
        color: var(--theme-text);
      }
    }
  }
  :deep(.exportForm) {
    .el-form-item__label {
      align-items: center;
      height: 40px;
    }
    .el-textarea__inner {
      height: 94px;
      padding: 10px 16px 0 16px;
    }
  }
  .el-form-item:last-child {
    margin-bottom: 0;
  }

  :deep(.el-dialog__body):has(.el-radio-group) {
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
:deep(.el-scrollbar__bar.is-vertical) {
  right: 0;
}
</style>
<style lang="scss">
.el-popover:has(.folerOperate) {
  padding: 8px 0;
}
.folerOperateLine {
  overflow: hidden;
  box-sizing: border-box;
  height: 32px;
  padding: 0 0 0 24px;
  background: var(--theme-card);
  cursor: pointer;
  line-height: 32px;
  text-overflow: ellipsis;
  font-weight: 400;
  font-size: 14px;
  color: #141414;
  white-space: nowrap;
  &:hover {
    background: rgba(54, 112, 248, 0.1);
    color: var(--theme-primary);
  }
}
</style>
