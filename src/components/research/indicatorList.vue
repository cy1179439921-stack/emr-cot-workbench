<template>
  <div class="listDiv">
    <div class="viewContent">
      <div class="tableStyle borderDiv">
        <div class="leftIndicator">
          <div class="leftTitle">
            <span>指标分类</span>
            <!-- <el-button class="flexCenter addBtn" type="primary" link @click="addType" v-if="!props.needCheckPermission || props.hadPermissionList.includes('编辑指标列表')"><i class="iconfont icon-tianjiayihang"></i>新增分类</el-button> -->
            <MorePopover :showMoreIcon="true" :operationList="operationList" @handlePopoverSelect="btnValue => handlePopoverSelect(btnValue, item)" v-if="operationList.length > 0"/>
          </div>
          <div class="treeList">
            <!-- <span style="display: block; width: 42px;"></span> -->
            <el-scrollbar>
              <el-tree
                v-if="dataSource && dataSource.length > 0"
                :data="dataSource"
                :props="{ name: 'name', children: 'children' }"
                ref="treeRef"
                :indent="echartsToPx(14)"
                default-expand-all
                :highlight-current="true"
                @node-click="handleNodeClick"
                node-key="id"
                :default-checked-keys="[defaultCheckedKey]"
                class="custom-tree"
              >
                <!--  @node-drop="handleDrop" -->
                <!-- draggable -->
                <template
                  #default="{ data }"
                >
                  <div
                    :class="['categrtory', `categrtory-${data.level + 1}`]"
                    @mouseenter="mouseenterEvent(data)"
                    @mouseleave="mouseleaveEvent(data)"
                  >
                    <!-- <i class="iconfont icon-liebiao-shangxiayi" v-show="showMoreIcon && hoverId === data.id"></i> -->
                    <div class="name">
                      <CommonTooltip :content="data.name" placement="bottom">
                        <span>{{ data.name }}</span>
                      </CommonTooltip>
                    </div>
                    <div class="iconBtn" v-show="showMoreIcon && hoverId === data.id" v-if="!props.needCheckPermission || props.hadPermissionList.includes('编辑指标列表')">
                      <span class="popicon" @click.stop>
                        <el-popover
                          popperClass="addpop"
                          placement="bottom"
                          width="104"
                          trigger="hover"
                          :show-arrow="true"
                          @before-leave="hidePopver"
                          v-if="isShowPopver"
                        >
                          <div @mouseenter="mouseenterEvent(data)" @mouseleave="mouseleaveEvent(data)">
                            <p @click.stop="editNode(data)"><span><i class="iconfont icon-bianji2"></i> 编辑分类</span></p>
                            <p @click.stop="deleteNode(data)"><span><i class="iconfont icon-shanchu3"></i> 删除分类</span></p>
                          </div>
                          <template #reference>
                            <i class="iconfont gengduo icon-gengduo1"></i>
                          </template>
                        </el-popover>
                      </span>
                      <!-- <el-tooltip content="新增分类" placement="bottom">
                        <span class="popicon" @click.stop>
                          <i @click="addnewCategory(data)" class="iconfont addIcon icon-a-shangchuantupian-jiahao" v-if="data.level<10"></i>
                        </span>
                      </el-tooltip> -->
                    </div>
                  </div>
                </template>
              </el-tree>
              <span v-else class="noData">这里还没有内容</span>
            </el-scrollbar>
            <div class="loading-div flexCenter" v-if="loadingFlag">
              <div class="loading-box">
                <div class="pixel-spinner">
                  <div class="pixel-spinner-inner"></div>
                </div>
                <!-- <div class="text">加载中...</div> -->
              </div>
            </div>
          </div>
        </div>
        <div class="tableList">
          <header class="tableTop">
            <h2>指标列表</h2>
            <!-- <p class="flexCenter" :style="{ pointerEvents: dataSource && dataSource.length > 0 ? 'auto' : 'none', opacity: dataSource && dataSource.length > 0 ? 1 : 0.5 }" @click="addPerson" v-if="!props.needCheckPermission || props.hadPermissionList.includes('编辑指标列表')"><i class="iconfont icon-xinzeng"></i>新增指标</p> -->
            <div class="rightTop">
              <el-button
                @click="delRowList"
                type="danger"
                :disabled="!selectionList.length"
                plain
                class="delBtn"
                v-if="!props.needCheckPermission || props.hadPermissionList.includes('编辑指标列表')">
                <i class="iconfont icon-shanchu-1"></i>
                删除指标</el-button>
              <el-button type="primary" :style="{ pointerEvents: dataSource && dataSource.length > 0 ? 'auto' : 'none', opacity: dataSource && dataSource.length > 0 ? 1 : 0.5 }" @click="addPerson" v-if="!props.needCheckPermission || props.hadPermissionList.includes('编辑指标列表')"><i class="iconfont icon-tianjiayihang"></i>新增指标</el-button>
            </div>
          </header>
          <div class="tableDiv">
            <myTable
              ref="myTableRef"
              :selection="true"
              :tableData="common.tableData"
              :column="common.column || common.initColumn"
              :sort="false"
              :pagination="true"
              :pageResult="pageResult"
              @handleSizeChange="handleSizeChange"
              @handleCurrentChange="handleCurrentChange"
              @selectionChange="selectionChange"
              :handlerWidth="76"
              :option="!props.needCheckPermission || props.hadPermissionList.includes('编辑指标列表')"
            >
              <template #option="scope">
                <el-button
                  class="deleteBtn"
                  @click="deleteRow(scope.row)" link v-if="!props.needCheckPermission || props.hadPermissionList.includes('编辑指标列表')">删除</el-button>
              </template>
            </myTable>
          </div>
        </div>
      </div>
    </div>

    <newDicator
      v-if="addDialogShow"
      :groupType="groupType"
      v-model:addDialogShow="addDialogShow"
      :defaultCheckedKey='defaultCheckedKey'
      :curEditRow="curEditRow"
      @handle-close="addDialogShow = false"
      @handle-submit="handleSubmit" />

    <el-dialog :title="typeTitleName" v-model="addDialogType" v-if="addDialogType" class="addType_Dialog" :width="pxToRem(499)" :before-close="handleCloseType">
      <el-form ref="ruleFormTypeRef" :width="pxToRem(92)" label-position="right" :model="formTypeData" class="addType_DialogForm" :rules="typeRules" @submit.prevent>
        <el-form-item label="分类名称：" prop="typeName">
          <el-input text placeholder="请填写内容" maxlength="50" show-word-limit v-model="formTypeData.typeName" @keyup.enter="submitFormType(ruleFormTypeRef, selectedNode)" @submit.prevent ref="typeName"></el-input>
        </el-form-item>
        <el-form-item label="分类类型：" prop="resource">
          <el-radio-group v-model="formTypeData.resource">
            <el-radio :value="1">常规类</el-radio>
            <el-radio :value="2">检验类</el-radio>
            <el-radio :value="3">检查类</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseType">取 消</el-button>
          <el-button type="primary" @click="submitFormType(ruleFormTypeRef, selectedNode)">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <importIndexDialog fromPage="researchQueue" :queueId="researchStore.curResearchQueueDetail.id" @finishUpload="finishUpload" ref="importIndexDialogRef"/>
  </div>
</template>

<script>
export default {
  name: 'IndicatorList'
}
</script>
<script setup>
import { ref, reactive, nextTick, h } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { codomainTypeOptions } from '@/utils/dictionaries.js'
import { echartsToPx } from '@/utils/utils.js'
import { getQueueIndexGroupList, addQueueIndexGroupList, updateQueueIndexGroupList, deleteQueueIndexGroupList, getGroupListData, deleteGroupListData, saveQueueIndexGroupList, delIndexGroup, exportIndex } from '@/api/api_research'
import newDicator from './newDicator.vue'
import MorePopover from '@/components/common/morePopover.vue'
import importIndexDialog from '@/components/manage/components/importIndexDialog.vue'
import { formatDateTime, formatDateTime2 } from '@/utils/utils'
import { useResearchStore } from '@/store/researchStore'
// import lodash from 'lodash'
const props = defineProps({
  hadPermissionList: {
    type: Array
  },
  needCheckPermission: {
    type: Boolean
  }
})
const addDialogShow = ref(false)
const addDialogType = ref(false)
const showMoreIcon = ref(false)
const hoverId = ref(0)
const ruleFormTypeRef = ref()
const defaultCheckedKey = ref()
const researchStore = useResearchStore()
const typeTitleName = ref('新增分类')
const operationList = ref([
  {
    icon: 'iconfont icon-tianjiayihang',
    name: '新增分类'
  },
  {
    icon: 'iconfont icon-piliangdaoru',
    name: '导入指标'
  },
  {
    icon: 'iconfont icon-daochu1',
    name: '导出指标'
  }
])
if (props.needCheckPermission) {
  if (!props.hadPermissionList.includes('编辑指标列表')) {
    operationList.value = operationList.value.filter(item => item.name !== '新增分类')
  }
  if (!props.hadPermissionList.includes('导入指标')) {
    operationList.value = operationList.value.filter(item => item.name !== '导入指标')
  }
  if (!props.hadPermissionList.includes('导出指标')) {
    operationList.value = operationList.value.filter(item => item.name !== '导出指标')
  }
}
const isShowPopver = ref(true)
const pageResult = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
const formTypeData = reactive({
  typeName: '',
  resource: 1
})
const typeRules = reactive({
  typeName: [{ required: true, message: '请填写分类名称', trigger: 'blur' }],
  resource: [{ required: true, message: '请选择分类类型', trigger: 'blur' }]
})
const treeRef = ref(null)

// 页面数据
const common = reactive({
  tableData: [],
  initColumn: [
    {
      label: '指标名称',
      value: 'name',
      minWidth: 150
    },
    {
      label: '英文名称',
      value: 'nameEn'
    },
    {
      label: '医学含义',
      value: 'medicalMean'
    },
    {
      label: '所在位置',
      value: 'indexPass',
      formatter: (row) => {
        // 将 indexPass 字符串分割成数组，并去除每个项的空格
        const indexPassArray = row.indexPass.split(',').map(item => item.trim())

        // 使用 map 对数组中的每个项进行映射，得到对应的标签
        const mappedLabels = indexPassArray.map(item => {
          switch (item) {
            case 'basic_information':
              return '病案首页'
            case 'enter_record':
              return '入院记录'
            case 'exit_record':
              return '出院记录'
            case 'inspections':
              return '实验室检查'
            case 'image_reports':
              return '影像检查'
            case 'pathologies':
              return '病理'
            case 'operations':
              return '手术记录'
            case 'advices':
              return '医嘱'
            case 'course_record':
              return '病程记录'
            default:
              return '' // 未匹配到时返回空字符串
          }
        })
        // 将映射后的标签数组用逗号连接并返回
        return mappedLabels.join(', ')
      }
    },
    {
      label: '数据类型',
      value: 'codomainType',
      formatter: (row) => {
        return getDataTypeName(row.codomainType) || '-'
      }
    },
    {
      label: '值域/枚举',
      value: 'codomain',
      formatter: row => {
        if ([1, 2, 4].includes(row.codomainType)) {
          return row.enumOptionsString || row.codomain || '-'
        } else {
          return '-'
        }
      }
    }
  ],
  column: ''
})
// 获取数据类型名称
const getDataTypeName = (type) => codomainTypeOptions.value.find(item => item.value === type)?.label || ''
const dataSource = ref([])
const selectedNode = ref(null) // 创建 selectedNode 变量
const hidePopver = () => {
  isShowPopver.value = false
  setTimeout(() => {
    isShowPopver.value = true
  }, 1)
}
// 新增分类-外层
const addType = () => {
  typeTitleName.value = '新增分类'
  selectedNode.value = null
  formTypeData.typeName = ''
  formTypeData.resource = 1
  addDialogType.value = true
}
// 导出
const toExportIndex = async () => {
  try {
    const params = {
      queueId: researchStore.curResearchQueueDetail.id
    }
    const res = await exportIndex(params)
    if (res.status === 200) {
      const { data, headers } = res
      // 创建 Blob 对象
      const blob = new Blob([data], { type: headers['content-type'] })
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      // fileName为“指标字典所有指标_某年某月某日某时某分某秒”格式
      const name = formatDateTime2()
      const fileName = `${researchStore.curResearchQueueDetail.queueName}所有指标_${name}.json`
      link.href = url
      link.setAttribute('download', fileName) // 设置下载文件名
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // 显示成功消息
      ElMessage.success('文件已开始下载')
    }
  } catch (error) {
    // 处理下载失败的情况
    console.error('下载失败', error)
    ElMessage.error('下载失败')
  }
}
const importIndexDialogRef = ref(null)
// eslint-disable-next-line no-unused-vars
const showImportNotification = (isSuccess, filename, total = 0, duplicates = 0) => {
  const icon = isSuccess ? SuccessFilled : CircleCloseFilled
  const statusText = isSuccess ? '导入成功' : '导入失败'
  const statsText = isSuccess
    ? [
      '共导入',
      h('span', { class: 'notification-total' }, total),
      '个指标，舍弃重复',
      h('span', { class: 'notification-duplicates' }, duplicates),
      '个指标'
    ]
    : '导入格式不正确，请重新上传'

  ElNotification({
    customClass: isSuccess ? 'notification-success' : 'notification-error',
    message: h('div', { class: 'notification-content' }, [
      h('div', { class: 'notification-status' }, [
        h(icon, { class: 'notification-icon' }),
        statusText
      ]),
      h('div', { class: 'notification-fileInfo' }, [
        h('span', { class: 'notification-filename' }, filename),
        h('span', { class: 'notification-time' }, formatDateTime(new Date()))
      ]),
      h('div', { class: 'notification-text' }, statsText)
    ])
    // duration: 0
  })
}
// 导入指标
const toImportIndex = () => {
  importIndexDialogRef.value.triggerUpload()
}
// 导入完成
const finishUpload = (fileInfo, showImportDialog) => {
  console.log('导入完成')
  if (!showImportDialog) {
    if (fileInfo.status === 'success') {
      showImportNotification(true, fileInfo.name, fileInfo.successCount, fileInfo.duplicateCount)
    } else {
      showImportNotification(false, fileInfo.name)
    }
  }
  getGroupList('import')
}
const handlePopoverSelect = (name, item) => {
  switch (name) {
    case '新增分类':
      addType()
      break
    case '导入指标':
      console.log('导入指标')
      toImportIndex()
      break
    case '导出指标':
      console.log('导出指标')
      toExportIndex()
      break
    default:
      break
  }
}

// 新增分类-内层
// eslint-disable-next-line no-unused-vars
const addnewCategory = (data) => {
  typeTitleName.value = '新增分类'
  formTypeData.typeName = ''
  formTypeData.resource = 1
  selectedNode.value = data
  addDialogType.value = true
}

// 关闭新增分类弹窗
const handleCloseType = () => {
  addDialogType.value = false
}

const mouseenterEvent = (value) => {
  showMoreIcon.value = true
  hoverId.value = value.id
}

const mouseleaveEvent = (value) => {
  showMoreIcon.value = false
  hoverId.value = 0
}

// 编辑分类
const editNode = (value) => {
  typeTitleName.value = '编辑分类'
  addDialogType.value = true
  selectedNode.value = value
  formTypeData.typeName = value.name
  formTypeData.resource = value.groupType
}
const groupType = ref(0)
const curNode = ref(null)
// 选择分类
const handleNodeClick = (value) => {
  console.log('类别', value)
  curNode.value = value
  groupType.value = value.groupType
  defaultCheckedKey.value = value.id
  treeRef.value?.setCurrentKey(defaultCheckedKey.value)
  getData(defaultCheckedKey.value)
}
const deleteNode = (value) => {
  ElMessageBox.confirm(
    `确认删除【${value.name}】及以下所有指标？删除后可从指标库重新添加`,
    '删除指标',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const res = await deleteQueueIndexGroupList({ id: value.id })
      if (res.code === 10000) {
        ElMessage.success('已删除')
        getGroupList()
      }
    })
}

// 递归函数，用于遍历节点及其子节点，收集名称
const collectNames = (node, names) => {
  names.push(node.name)
  for (const child of node.children) {
    collectNames(child, names)
  }
}

// 函数用于验证新增或编辑的名称是否与已有名称重复
const isNameUnique = (name, data) => {
  const names = []
  for (const node of data) {
    collectNames(node, names)
  }
  return !names.includes(name)
}

// 提交表单
const submitFormType = async (formEl, selectedNode) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (!valid) {
      console.log('error submit!', fields)
      return
    }
    const newName = formTypeData.typeName.trim()
    const isEditing = typeTitleName.value === '编辑分类'
    if (isEditing && selectedNode && newName === selectedNode.name) {
      // 编辑分类且名称未改变，继续往后走
    } else if (!isNameUnique(newName, dataSource.value)) {
      ElMessage.error('分类名称与已有数据中的名称重复，请重新输入')
      return
    }
    const newNode = {
      name: formTypeData.typeName,
      groupType: formTypeData.resource,
      queueId: researchStore.curResearchQueueDetail.id,
      level: isEditing ? selectedNode.level : (selectedNode ? selectedNode.level + 1 : 1)
    }
    if (isEditing) {
      newNode.id = selectedNode.id
      newNode.parentId = selectedNode.parentId
    } else if (selectedNode) {
      newNode.parentId = selectedNode.id
    }
    const action = isEditing ? updateQueueIndexGroupList : addQueueIndexGroupList
    const res = await action(newNode)
    if (res.code === 10000) {
      ElMessage.success(`${isEditing ? '编辑' : '新增'}成功`)
    }
    addDialogType.value = false
    // 更新 selectedNode 的名称和类型
    if (isEditing) {
      selectedNode.name = newName
      selectedNode.groupType = formTypeData.resource
      getData(defaultCheckedKey.value)
    } else {
      getGroupList('add', newName)
    }
  })
}

// 获取分类列表
const findIdByName = async (data, name) => {
  for (const item of data) {
    if (item.name === name) {
      return item
    }
    if (item.children && item.children.length > 0) {
      const foundId = await findIdByName(item.children, name)
      if (foundId !== null) {
        return foundId
      }
    }
  }
  return null
}

// 获取分类列表
const getGroupList = async(type, val) => {
  const params = {
    queueId: researchStore.curResearchQueueDetail.id
  }
  const res = await getQueueIndexGroupList(params)
  if (res.code === 10000) {
    dataSource.value = res.data
    if (dataSource.value.length > 0) {
      if (type === 'add') {
        const obj = await findIdByName(dataSource.value, val)
        if (obj !== null) {
          defaultCheckedKey.value = obj.id
          groupType.value = obj.groupType
          handleNodeClick({ ...obj })
        }
      } else if (type === 'import') {
        nextTick(() => {
          handleNodeClick(curNode.value)
        })
      } else {
        defaultCheckedKey.value = dataSource.value[0].id
        nextTick(() => {
          handleNodeClick(dataSource.value[0])
        })
      }
    } else {
      common.tableData = []
    }
  }
}

const loadingFlag = ref(false)
// 递归函数来重新编号orderIndex、level、parentId
const reindexItems = (items, currentParentId = null, currentLevel = 1) => {
  items.forEach((item, index) => {
    item.orderIndex = index + 1 // 同级目录从1开始编号
    item.level = currentLevel // 设置当前层级
    item.parentId = currentParentId // 设置父节点ID
    // 对子节点递归调用
    if (item.children && item.children.length > 0) {
      reindexItems(item.children, item.id, currentLevel + 1)
    }
  })
}
const findMaxLevel = (nodes) => {
  let maxLevel = 0
  nodes.forEach(node => {
    maxLevel = Math.max(maxLevel, node.level)
    if (node.children && node.children.length > 0) {
      maxLevel = Math.max(maxLevel, findMaxLevel(node.children))
    }
  })
  return maxLevel
}
// eslint-disable-next-line no-unused-vars
const handleDrop = async(draggingNode, dropNode, dropType, ev) => {
  loadingFlag.value = true
  // console.log('tree drop:', draggingNode, dropNode, dropType, ev)
  reindexItems(dataSource.value)
  // 判断dataSource的最深一层的level值，不能大于10
  const maxLevel = findMaxLevel(dataSource.value)
  console.log('maxLevel', maxLevel)
  if (maxLevel > 10) {
    ElMessage.error('分类层级不能超过10级')
    loadingFlag.value = false
    // 刷新数据
    const params = {
      queueId: researchStore.curResearchQueueDetail.id
    }
    const res = await getQueueIndexGroupList(params)
    if (res.code === 10000) {
      dataSource.value = res.data
    }
    return
  }
  const res = await saveQueueIndexGroupList(dataSource.value)
  if (res.code === 10000) {
    ElMessage.success('移动成功')
    // 刷新数据,测试后端是否按照顺序返回
    // const params = {
    //   queueId: researchStore.curResearchQueueDetail.id
    // }
    // const res = await getQueueIndexGroupList(params)
    // if (res.code === 10000) {
    //   dataSource.value = res.data
    // }
  }
  loadingFlag.value = false
}

// 获取指标列表
const getData = async(val) => {
  const params = {
    queueIndexGroupId: val,
    pageNum: pageResult.value.pageNum,
    pageSize: pageResult.value.pageSize
  }
  const res = await getGroupListData(params)
  if (res.code === 10000) {
    if (res.data.items.length === 0 && res.data.pageNum > 1) {
      pageResult.value.pageNum = pageResult.value.pageNum - 1
      getData(val)
      return
    }
    common.tableData = res.data.items
    pageResult.value.total = res.data.total
  }
}
const handleSizeChange = (val) => {
  getData(defaultCheckedKey.value)
}
const handleCurrentChange = (val) => {
  getData(defaultCheckedKey.value)
}

// 加载时请求页面列表
const init = async() => {
  getGroupList()
}

init()
const curEditRow = ref('')
// 新增
const addPerson = () => {
  curEditRow.value = ''
  addDialogShow.value = true
}
// 删除
const deleteRow = async(row) => {
  console.log('row', row)
  ElMessageBox.confirm(
    `确认删除该指标吗？删除后可从指标库重新添加。`,
    '删除指标',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const res = await deleteGroupListData({ indexId: row.id, queueIndexGroupId: defaultCheckedKey.value })
      if (res.code === 10000) {
        // const index = common.tableData.indexOf(row)
        // if (index !== -1) {
        //   common.tableData.splice(index, 1)
        // }
        console.log(defaultCheckedKey.value)
        getData(defaultCheckedKey.value)
        ElMessage.success('已删除')
      }
    })
}
// 新增后回调
const handleSubmit = async() => {
  // await init()
  handleNodeClick({ id: defaultCheckedKey.value, groupType: groupType.value })
  addDialogShow.value = false
}
const selectionList = ref([])
const selectionChange = (val) => {
  console.log('选中的值', val)
  selectionList.value = val
}
const delRowList = () => {
  if (!selectionList.value.length) {
    ElMessage.warning('请选择要删除的指标')
    return
  }
  console.log(999, defaultCheckedKey.value)
  ElMessageBox.confirm(
    `确认删除指标吗？删除后可从指标库重新添加。`,
    '删除指标',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  ).then(res => {
    console.log('进行批量删除')
    delIndexGroup({
      indexIdList: selectionList.value.map(v => v.id),
      queueIndexGroupId: defaultCheckedKey.value
    }).then(res => {
      console.log('批量删除结果', res)
      if (res.code === 10000) {
        getData(defaultCheckedKey.value)
        ElMessage.success('已删除')
      }
    })
  })
}
</script>
<style scoped lang="scss">
.listDiv {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .viewContent {
    flex-direction: initial;
    width: 100%;
    padding: 0;
    .tableStyle {
      display: flex;
      width: 100%;
      height: 100%;
      // padding: 0 5px;
      border-radius: 8px;
      .leftIndicator {
        display: flex;
        flex-direction: column;
        width: 259px;
        margin-right: 16px;
        border-radius: 8px;
        background-color: var(--theme-card);
        .leftTitle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 55px;
          padding-left: 20px;
          padding-right: 10px;
          span {
            display: block;
            font-weight: 500;
            font-size: 16px;
            color: var(--theme-text);
          }
          .addBtn {
            margin: 0 0 0 0;
            padding: 14px  10px !important;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-primary);
            i {
              padding-right: 5px;
              font-size: 12px;
            }
          }
        }
        .treeList {
          position: relative;
          flex: 1;
          height: 0;
          padding: 0 12px;
          .loading-div {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            flex: 1;
            border-radius: 8px;
            background-color: var(--theme-card);
            opacity: 0.9;
            .loading-box {
              display: flex;
              flex-direction: column;
              align-items: center;
              .pixel-spinner {
                margin-bottom: 14px;
              }
              .text {
                color: var(--theme-text-3);
              }
            }
          }
          .noData {
            display: block;
            margin: 100px auto;
            text-align: center;
            color: var(--theme-text-2);
          }
          :deep(.el-tree) {
            overflow-y: auto;
            height: 100%;
            .categrtory {
              display: flex;
              position: relative;
              justify-content: space-between;
              align-items: center;
              box-sizing: border-box;
              width: 100%;
              height: 100%;
              .icon-liebiao-shangxiayi {
                position: absolute;
                left: 7px;
                width: 10px;
                height: 10px;
                font-size: 10px;
                color: var(--theme-text-2);
              }
              .name {
                // padding-top: 3px;
                .el-tooltip__trigger {
                  box-sizing: border-box;
                  padding-left: 20px;
                }
              }
              .tree-label {
                overflow: hidden;
                flex: 1;
                width: 0;
                max-width: 155px;
                text-overflow: ellipsis;
                font-weight: 400;
                font-size: 14px;
                color: #646464;
                white-space: nowrap;
              }
              .iconBtn {
                display: flex;
                // margin-right: 40px;
                position: absolute;
                right: -10px;
                align-items: center;
                width: 40px;
                .popicon:not(:last-child) {
                  margin-right: 10px;
                }
              }
              .popicon {
                i {
                  font-size: 12px;
                  color: var(--theme-text-2);
                  &:hover {
                    color: var(--theme-primary);
                  }
                }
                i.gengduo {
                  display: block;
                  width: 18px;
                  height: 18px;
                  padding-right: 0;
                  line-height: 18px;
                  font-size: 3px;
                  color: var(--theme-text-2);
                  &:hover {
                    color: var(--theme-primary);
                  }
                }
              }
            }
            .categrtory-2 {
              .name {
                width: 190px;
              }
            }
            .categrtory-3 {
              .name {
                width: 140px;
              }
            }
            .categrtory-4 {
              .name {
                width: 120px;
              }
            }
            .categrtory-5 {
              .name {
                width: 110px;
              }
            }
            .categrtory-6 {
              .name {
                width: 100px;
              }
            }
            .categrtory-7 {
              .name {
                width: 80px;
              }
            }
            .categrtory-8 {
              .name {
                width: 70px;
              }
            }
            .categrtory-9 {
              .name {
                width: 60px;
              }
            }
            .categrtory-10 {
              .name {
                width: 40px;
              }
            }
            .categrtory-11 {
              .name {
                width: 60px;
              }
              .iconBtn {
                right: 10px !important;
                justify-content: flex-end !important;
                .popicon {
                  margin-right: 0 !important;
                }
              }
            }
            .is-checked {
              font-weight: 600;
              color: var(--theme-primary);
            }
            .el-tree-node__content {
              position: relative;
              height: 39px;
              // margin-bottom: 8px;
              border-radius: 2px;
              // line-height: 35px;
              .custom-tree-node {
                line-height: 20px;
                font-weight: 500;
                font-size: 14px;
                color: #646464;
              }
            }
            .is-current>.el-tree-node__content {
              background: var(--theme-primary-soft);
            }
            .el-tree-node__children {
              .el-tree-node__content {
                border-radius: 2px;
              }
              .custom-tree-node {
                line-height: 20px;
                font-weight: 400;
                font-size: 14px;
                color: #646464;
                span {
                  display: block;
                  width: 150px;
                }
              }
            }
            // .el-tree-node__expand-icon {
            //   right: 12px;
            // }
          }
        }
      }
      .tableList {
        display: flex;
        flex-direction: column;
        flex: 1;
        box-sizing: border-box;
        width: 0;
        padding: 0 24px;
        border-radius: 8px;
        background-color: var(--theme-card);
        .tableTop {
          display: flex;
          position: relative;
          justify-content: space-between;
          align-items: center;
          height: 71px;
          h2 {
            margin: 0;
            font-weight: 500;
            font-size: 16px;
            color: var(--theme-text);
          }
          .rightTop {
            display: flex;
            justify-content: center;
            align-items: center;
            // width: 110px;
            height: 32px;
            border-radius: 2px;
            .el-button {
              i {
                margin-right: 10px;
                font-size: 12px;
              }
            }
            .delBtn,
            .delBtn:hover {
              border: 1px solid #ff4e4e;
              background-color: var(--theme-card);
              font-size: 14px;
              color: #ff4e4e;
              &.is-disabled {
                border: 1px solid #e4e7ed;
                color: var(--theme-text-3);
              }
            }
          }
        }
        .tableDiv {
          flex: 1;
          height: 0;
        }
        :deep(.singleTable) {
          display: flex;
          flex-direction: column;
          flex: 1;
          thead {
            .cell {
              font-weight: 400;
              font-size: 14px;
              color: #121111;
            }
            // .cell:last-child {
            //   padding-right: 18px;
            // }
            .is-first-column {
              padding-right: 18px;
            }
          }
          // .el-table__body {
          //   .el-button {
          //     font-weight: 400;
          //     font-size: 14px;
          //     color: #f76868;
          //   }
          // }
          .is-first-column {
            // display: flex;
            // justify-content: end;
            min-width: 100px;
            padding-right: 14px;
            border-left: none !important;
            .cell {
              float: right;
            }
          }
        }
        .editBtn {
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-primary);
        }
        .deleteBtn {
          font-weight: 400;
          font-size: 14px;
          color: #f76868;
        }
        // :deep(.singleTable) tbody :empty::before {
        //   color: #000;
        //   content: '-';
        // }
        .tabel_pagination {
          display: flex;
          justify-content: center;
        }
      }
    }
  }
  :deep(.addType_Dialog) {
    .el-dialog__body {
      .el-form-item {
        margin-bottom: 20px;
      }
      .el-form-item:nth-child(2) {
        height: 22px;
        margin-bottom: 0;
      }
    }
  }
}
// :deep(.el-tree-node__expand-icon.expanded, .el-tree-node__expand-icon.is-leaf) {
//   position: absolute;
//   right: 12px;
//   transform: rotate(90deg);
// }
:deep(.el-icon.el-tree-node__expand-icon) {
  position: absolute;
  right: 12px;
}
// :deep(.el-tree-node__expand-icon) {
//   position: absolute;
//   right: 0;
// }
:deep(.el-tree-node) {
  &.is-drop-inner>.el-tree-node__content .categrtory {
    background-color: rgba(54, 112, 248, 0.5) !important;
    // color: #fff !important;
  }
}
:deep(.el-tree__drop-indicator) {
  left: 0 !important;
}

</style>

<style lang="scss">
.addpop {
  display: block;
  width: 104px !important;
  min-width: 104px !important;
  padding: 8px 0 !important;
  border-radius: 4px !important;
  div {
    display: flex;
    flex-direction: column;
    p {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 28px;
      margin: 0;
      cursor: pointer;
      line-height: 28px;
      &:not(:first-child) {
        margin-top: 4px;
      }
      span {
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text);
      }
    }
    p:hover {
      background: rgba(54, 112, 248, 0.05);
      span {
        color: var(--theme-primary);
      }
    }
  }
}
.el-notification.right {
  padding-right: 0;
}
.el-notification__group {
  margin-left: 2px;
}
.notification-content {
  .notification-status {
    display: flex;
    font-weight: 600;
    font-size: 16px;
    color: #3d3d3d;
    svg {
      width: 22px;
      height: 22px;
      margin-right: 9px;
    }
  }
  .notification-fileInfo {
    margin-top: 8px;
    padding-left: 31px;
    color: var(--theme-text-2);
    .notification-time {
      padding-left: 8px;
    }
  }
  .notification-text {
    margin-top: 4px;
    padding-left: 31px;
    color: var(--theme-text-2);
    .notification-total {
      font-weight: 600;
      color: var(--theme-primary);
    }
    .notification-duplicates {
      font-weight: 600;
      color: #ff4e4e;
    }
  }
}
.notification-success {
  svg {
    color: #049c72;
  }
}
.notification-error {
  svg {
    color: #ff4e4e;
  }
}
</style>
