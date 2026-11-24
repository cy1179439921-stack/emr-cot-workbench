<template>
  <div class="analysis-cards">
    <el-breadcrumb separator=">" v-if="breadcrumbList.length">
      <el-breadcrumb-item @click="clearBreadcrumb">{{type === 0? '工程库' : '数据集库'}}</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" @click="handleClickBreadcrumb(index, item)">{{item.name}}</el-breadcrumb-item>
    </el-breadcrumb>
    <template v-if="cardsData && cardsData.length ">
      <!-- 卡片渲染 -->
      <div class="card-content" v-if="showWay === 1">
        <el-scrollbar>
          <div class="card-title" v-if="folders.length"><div class="flag"></div>全部文件夹</div>
          <div class="card-section" v-if="folders.length">
            <div class="card-item" v-for="item in folders" :key="item.id" @click="handleClickFolder(item)">
              <div class="card-name">
                <img :src="folder">
                <div class="name">
                  <CommonTooltip :content="item.name">
                    <span>{{ item.name }}</span>
                  </CommonTooltip>
                </div>
                <MorePopover :operationList="getPermission(operationList1)" trigger="hover" @handlePopoverSelect="btnValue => handlePopoverSelect(btnValue, item)" v-if="getPermission(operationList1).length > 0"/>
                <!-- <div class="operate" v-if="!needCheckPermission || hadPermissionList.includes('编辑') || hadPermissionList.includes('移动') || hadPermissionList.includes('删除')" @click.stop>
                  <i class="iconfont gengduo icon-gengduo1"></i>
                  <div class="operate-btn">
                    <div class="btn" @click.stop="editFolder(item)" v-if="!needCheckPermission || hadPermissionList.includes('编辑')">
                      <i class="iconfont icon-bianji2"></i>
                      <span>编辑信息</span>
                    </div>
                    <div class="btn" @click.stop="removeFolder(item)" v-if="!needCheckPermission || hadPermissionList.includes('移动')">
                      <i class="iconfont icon-yidong1"></i>
                      <span>移动至文件夹</span>
                    </div>
                    <div class="btn" @click.stop="deleteFolder(item)" v-if="!needCheckPermission || hadPermissionList.includes('删除')">
                      <i class="iconfont icon-shanchu3"></i>
                      <span>删除</span>
                    </div>
                  </div>
                </div> -->
              </div>
              <div class="card-desc">
                <CommonTooltip :content="item.describe">
                  <span>描述：{{item.describe || '暂无描述'}}</span>
                </CommonTooltip>
              </div>
              <div class="card-time">
                <i class="iconfont icon-shijian"></i>
                <span class="text">创建时间：</span>
                <span class="time">{{item.createTime}}</span>
              </div>
            </div>
          </div>
          <div class="card-title" v-if="fileList?.length"><div class="flag"></div>{{type === 0? '工程' : '数据集'}}</div>
          <div class="card-section" v-if="fileList?.length">
            <div
              class="card-item big-card-item"
              v-for="item in fileList"
              :key="item.id"
              :class="'card-item' + type"
              @click="handleClickCard(item)">
              <div class="card-name">
                <img :src="fileLogo">
                <div class="name">
                  <CommonTooltip :content="item.name">
                    <span>{{ item.name }}</span>
                  </CommonTooltip>
                </div>
                <MorePopover
                  :operationList="getPermission(operationList2)"
                  trigger="hover"
                  @handlePopoverSelect="btnValue => handlePopoverSelect(btnValue, item)"
                  v-if="getPermission(operationList2).length > 0&&(type==1&&item.dataSetStatus===3||type===0)"/>
                <div
                  class="canDelBtn"
                  @click="handlePopoverSelect('删除',item)"
                  v-if="getPermission([{permissionText:'删除'}]).length>0&&type==1&&item.dataSetStatus!==3">
                  <i class="iconfont icon-shanchu-1"></i>
                  <span>删除</span>
                </div>
                <!-- <div class="operate" v-if="!needCheckPermission || hadPermissionList.includes('编辑') || hadPermissionList.includes('移动') || hadPermissionList.includes('查看数据集') || hadPermissionList.includes('删除') || hadPermissionList.includes('数据查看')" @click.stop>
                  <i class="iconfont gengduo icon-gengduo1"></i>
                  <div class="operate-btn">
                    <div class="btn" @click.stop="viewDataBase(item)" v-if="!needCheckPermission || hadPermissionList.includes('查看数据集') || hadPermissionList.includes('数据查看')">
                      <i class="iconfont icon-chakanshujuji"></i>
                      <span>查看数据集</span>
                    </div>
                    <div class="btn" @click.stop="editFolder(item)" v-if="!needCheckPermission || hadPermissionList.includes('编辑')">
                      <i class="iconfont icon-bianji2"></i>
                      <span>编辑信息</span>
                    </div>
                    <div class="btn" @click.stop="removeFolder(item)" v-if="!needCheckPermission || hadPermissionList.includes('移动')">
                      <i class="iconfont icon-yidong1"></i>
                      <span>移动至文件夹</span>
                    </div>
                    <div class="btn" @click.stop="deleteFolder(item)" v-if="!needCheckPermission || hadPermissionList.includes('删除')">
                      <i class="iconfont icon-shanchu3"></i>
                      <span>删除</span>
                    </div>
                  </div>
                </div> -->
              </div>
              <div :class="'big-card-main'+' '+(type===0?'':rowClassName[item.dataSetStatus-1])">
                <!-- 工程库 -->
                <template v-if="type === 0">
                  <div class="dataset">
                    <div class="circleFlag"></div>
                    <div class="dataset_name">
                      <CommonTooltip :content="item.dataSetName">
                        <span>{{item.dataSetName || '-'}}</span>
                      </CommonTooltip>
                    </div>
                  </div>
                  <div class="normalText content-ellipsis">最近节点：{{item.node || '-'}}</div>
                  <div class="normalText">上次操作时间：{{item.operatorTime}}</div>
                  <div class="normalText">
                    <CommonTooltip :content="item.describe">
                      <span>描述：{{item.describe || '暂无描述'}}</span>
                    </CommonTooltip>
                  </div>
                  <div class="card-time">
                    <i class="iconfont icon-shijian"></i>
                    <span class="text">创建时间：</span>
                    <span class="time">{{item.createTime}}</span>
                  </div>
                </template>
                <!-- 数据集库 -->
                <template v-if="type === 1">
                  <div class="normalText">数据集大小：{{item.fileSizeStr || '-'}}</div>
                  <div class="normalText content-ellipsis">数据集来源：{{item.dataSourceName || '-'}}</div>
                  <div class="normalText">数据量：{{item.totalRowNum || '-'}}</div>
                  <div class="normalText">变量数：{{item.totalColNum || '-'}}</div>
                  <div class="normalText">
                    <CommonTooltip :content="item.describe">
                      <span>描述：{{item.describe || '暂无描述'}}</span>
                    </CommonTooltip>
                  </div>
                  <div class="card-time">
                    <i class="iconfont icon-shijian"></i>
                    <span class="text">创建时间：</span>
                    <span class="time">{{item.createTime}}</span>
                  </div>
                </template>
                <div v-if="[1,2].includes(item.dataSetStatus)&&type===1" class="mask processingRowMask" :id="item.id" >
                  <div class="loader" @click="convertToGif(item)">
                  </div>
                  <span>正在解析中，请稍等片刻...</span>
                </div>
                <div v-if="[4].includes(item.dataSetStatus)&&type===1" class="mask parsingFailedMask">
                  <i class="iconfont icon-jiexishibai"></i>
                  <span>解析失败</span>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <!-- 表格渲染 -->
      <div class="card-content-table" v-if="showWay === 2">
        <div class="table-title">全部文件</div>
        <commonTable
          class="singleTable"
          :data="cardsData"
          @sortChange="sortChange"
          :default-sort="{ prop: 'createTime', order: 'descending' }"
          :row-class-name="tableRowClassName"
          @row-click="handleClickRow">
          <el-table-column
            v-for="(item) in columns"
            :key="JSON.stringify(item)"
            :fixed="item.fixed"
            align="center"
            :label="item.label||item.name"
            :prop="item.value"
            :min-width="item.minWidth"
            :show-overflow-tooltip="item.showToolTip"
            :sortable="item.sortable ? 'custom' : false"
          >
            <template #default="scope">
              <div v-if="item.value === 'name'">
                <div class="first-td" v-if="scope.row['type'] === 1">
                  <img class="icon folder" :src="folder" alt="">{{scope.row[item.value]}}
                </div>
                <div class="first-td" v-else>
                  <img class="icon project" :src="fileLogo" alt="">{{scope.row[item.value]}}
                </div>
              </div>

              <div v-else-if="item.label === '描述'">
                {{scope.row[item.value] || '暂无描述'}}
              </div>

              <div v-else-if="['数据量', '变量数'].includes(item.label)">
                {{scope.row['type'] === 1 ? '-' : scope.row[item.value] || '-'}}
              </div>

              <div v-else>
                {{scope.row[item.value] || '-'}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="106px">
            <template #default="scope">
              <el-button type="primary" link @click.stop="handleClickRow(scope.row)" v-if="type === 1 && (!needCheckPermission || hadPermissionList.includes('查看数据集'))">查看</el-button>
              <el-button type="primary" link @click.stop="handleClickRow(scope.row)" v-if="type === 0 ">查看</el-button>
              <el-button type="primary" link @click.stop="editFolder(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('编辑')">编辑</el-button>
              <el-button type="primary" link @click.stop="removeFolder(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('移动')">移动</el-button>
              <el-button type="danger" class="delBtn" link @click.stop="deleteFolder(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('删除')">删除</el-button>
            </template>
          </el-table-column>
        </commonTable>
      </div>
    </template>
    <template v-else>
      <div class="emptyContent" v-if="!loading">
        <div class="emptyImg">
          <img v-if="!loading" :src="emptyImg" alt="" />
          <div class="text">您暂时还未新建项目～</div>
          <div class="btn-div">
            <template v-for="(item, index) in newOptions" :key="item.name">
              <el-button type="primary" @click="handleEmptyAdd(item.name)" v-if="index === 0">
                <!-- 鼠标移入时，换一个图片 -->
                <img :src="dataSetIcon2" class="icon" />{{item.name}}
              </el-button>
              <el-button type="default" @click="handleEmptyAdd(item.name)" v-if="index === 1" @mouseover="dataSetIcon3 = newFloaderIconActive" @mouseout="dataSetIcon3 = newFloaderIcon">
                <img :src="dataSetIcon3" class="icon" />{{item.name}}
              </el-button>
            </template>
          </div>
        </div>
      </div>
      <div class="loading-div flexCenter" v-else>
        <div class="loading-box">
          <div class="pixel-spinner">
            <div class="pixel-spinner-inner"></div>
          </div>
          <div class="text">加载中</div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, nextTick, getCurrentInstance, watch, onUnmounted } from 'vue'
import emptyImg from '@/assets/empty.png'
// import { datasetData, projectData } from './data.js'
import { getDatasetList, getEngineerLibraryList } from '@/api/api_dataAnalysis'
import fileLogo from '@/assets/dataSet.png'
import folder from '@/assets/folder.png'
import _ from 'lodash'
import { useAnalysisStore } from '@/store/analysisStore'
import { engineering_columns, dataset_columns } from '@/components/dataAnalysis/utils/commonData'
import MorePopover from '@/components/common/morePopover.vue'
import { ElMessage } from 'element-plus'
import dataSetIcon2 from '@/assets/dataSetIcon2.png'
import newFloaderIcon from '@/assets/newFloaderIcon.png'
import newFloaderIconActive from '@/assets/newFloaderIconActive.png'
const analysisStore = useAnalysisStore()
const emits = defineEmits(['handleEdit', 'handleDelete', 'handleAdd', 'handleNew', 'handleRemove', 'handleClickCard', 'handleClickFolder', 'viewDataBase'])
// eslint-disable-next-line no-unused-vars
const { proxy: $vm } = getCurrentInstance()
defineOptions({
  name: 'AnalysisCardsTable',
  inheritAttrs: false
})
const props = defineProps({
  type: {
    type: Number,
    default: 0
  },
  showWay: {
    type: Number,
    default: 0
  },
  options: {
    type: Object,
    default: () => ({})
  },
  needCheckPermission: {
    type: Boolean,
    default: false
  },
  hadPermissionList: {
    type: Array,
    default: () => []
  },
  otherPermissions: {
    type: Array,
    default: () => []
  }
})
const dataSetIcon3 = ref(newFloaderIcon)
const newOptions = _.cloneDeep(props.options)
const loading = ref(false)
const allData = ref([])
const cardsData = ref([])
const folders = computed(() => cardsData.value.filter(item => item.type === 1))
const fileList = computed(() => cardsData.value.filter(item => item.type === 2))
const operationList1 = ref([
  {
    name: '编辑信息',
    permissionText: '编辑',
    icon: 'iconfont icon-bianji2'
  },
  {
    name: '移动至文件夹',
    permissionText: '移动',
    icon: 'iconfont icon-yidong1'
  },
  {
    name: '删除',
    permissionText: '删除',
    icon: 'iconfont icon-shanchu3'
  }
])
const operationList2 = ref([
  {
    name: props.type === 1 ? '查看数据集' : '查看原始数据集',
    permissionText: props.type === 1 ? '查看数据集' : '查看原始数据集',
    icon: 'iconfont icon-chakanshujuji'
  },
  {
    name: '编辑信息',
    permissionText: '编辑',
    icon: 'iconfont icon-bianji2'
  },
  {
    name: '移动至文件夹',
    permissionText: '移动',
    icon: 'iconfont icon-yidong1'
  },
  {
    name: '删除',
    permissionText: '删除',
    icon: 'iconfont icon-shanchu3'
  }
])
// 判断权限
const getPermission = (operationList) => {
  const result = []
  for (const item of operationList) {
    if (!props.needCheckPermission || props.hadPermissionList.includes(item.permissionText)) {
      result.push(item)
    }
  }
  return result
}
// 递归找到指定id的层级数据
const findById = (data, id) => {
  for (const node of data) {
    if (node.id === id) {
      return node // 找到目标节点，返回
    }

    // 如果有子节点，递归查找
    if (node.children) {
      const result = findById(node.children, id)
      if (result) {
        return result // 找到目标节点，返回
      }
    }
  }
  return null // 如果没有找到，返回 null
}
// 递归找到指定id的层级数据及所有父级数据
const findByIdWithParent = (data, id) => {
  const result = []
  for (const node of data) {
    if (node.id === id) {
      result.push(node) // 找到目标节点，返回
      return result
    }

    // 如果有子节点，递归查找
    if (node.children) {
      const childResult = findByIdWithParent(node.children, id)
      if (childResult.length) {
        result.push(node) // 找到父节点，添加到结果
        result.push(...childResult) // 找到目标节点，添加到结果
        return result
      }
    }
  }
  return result // 如果没有找到，返回空数组
}
// 获取数据
const getData = async () => {
  loading.value = true
  let curPageData = ''
  if (props.type === 0) {
    // 工程库
    const { code, data } = await getEngineerLibraryList()
    if (code === 10000) {
      allData.value = data
      // 获取面包屑当前层级
      if (breadcrumbList.value.length === 0) {
        cardsData.value = _.cloneDeep(allData.value)
        curPageData = cardsData.value
      } else {
        // 获取旧当前层级的id
        const oldId = breadcrumbList.value[breadcrumbList.value.length - 1].id
        curPageData = findById(allData.value, oldId)
        cardsData.value = curPageData?.children
      }
      emits('handleClickFolder', {
        allData: allData.value,
        curPageData: breadcrumbList.value.length
          ? curPageData
          : {
            id: 0,
            leval: 0,
            children: cardsData.value
          }
      })
    }
  } else if (props.type === 1) {
    // 数据集库
    const { code, data } = await getDatasetList({ type: 1 })
    if (code === 10000) {
      allData.value = data
      // 获取面包屑当前层级
      if (breadcrumbList.value.length === 0) {
        cardsData.value = _.cloneDeep(allData.value)
        curPageData = cardsData.value
      } else {
        // 刷新数据，保留当前面包屑层级
        const oldId = breadcrumbList.value[breadcrumbList.value.length - 1].id
        curPageData = findById(allData.value, oldId)
        cardsData.value = curPageData?.children
      }
      if (!cardsData.value?.length && interval.value) {
        clearInterval(interval.value)
      } else if (cardsData.value?.length && !interval.value) {
        createInterval()
      }
      emits('handleClickFolder', {
        allData: allData.value,
        curPageData: breadcrumbList.value.length
          ? curPageData
          : {
            id: 0,
            leval: 0,
            children: cardsData.value
          }
      })
    }
  }
  loading.value = false
}
const interval = ref('')
const createInterval = () => {
  if (props.type === 1) {
    interval.value = setInterval(() => {
      getData()
    }, 10000)
  }
}
const init = () => {
  getData()
  createInterval()
}
init()

const columns = computed(() => props.type === 0 ? engineering_columns : dataset_columns)
const rowClassName = ref(['processingRow', 'processingRow', 'parsingSuccess', 'parsingFailed'])
const tableRowClassNameList = ref(['table-processingRow', 'table-processingRow', 'table-parsingSuccess', 'table-parsingFailed'])
const tableRowClassName = ({ row, rowIndex }) => {
  return tableRowClassNameList.value[row.dataSetStatus - 1]
}
// 空内容时新增
const handleEmptyAdd = (name) => {
  switch (name) {
    case '新增数据集':
      emits('handleAdd', {
        name: '新增数据集'
      })
      break
    case '新增文件夹':
      emits('handleAdd', {
        name: '新增文件夹'
      })
      break
    case '新增工程':
      emits('handleNew', {
        name: '新增工程'
      })
      break
    default:
      break
  }
}
const handlePopoverSelect = (name, item) => {
  switch (name) {
    case '查看数据集':
      viewDataBase({ ...item, isProject: false })
      break
    case '查看原始数据集':
      viewDataBase({ ...item, isProject: true })
      break
    case '编辑信息':
      editFolder(item)
      break
    case '移动至文件夹':
      removeFolder(item)
      break
    case '删除':
      deleteFolder(item)
      break
    default:
      break
  }
}
// 删除
const deleteFolder = async (item) => {
  console.log(item)
  emits('handleDelete', {
    name: '删除',
    data: item
  })
}
// 移动至文件夹
const removeFolder = (item) => {
  console.log(item)
  emits('handleRemove', {
    name: '移动至文件夹',
    data: item
  })
}
// 编辑
const editFolder = (item) => {
  console.log(item)
  emits('handleEdit', {
    name: '编辑',
    data: item
  })
}

const viewDataBase = (item) => {
  if (!props.needCheckPermission || props.hadPermissionList.includes('查看数据集') || props.hadPermissionList.includes('查看原始数据集')) {
    emits('viewDataBase', item)
  } else {
    ElMessage.error('暂无权限')
  }
}

const breadcrumbList = ref([])
// 点击文件夹
const handleClickFolder = (item) => {
  console.log('item', item)
  breadcrumbList.value.push({
    name: item.name,
    id: item.id
  })
  cardsData.value = item.children
  // allData是总数据，cardData是点击层数据
  emits('handleClickFolder', {
    allData: allData.value,
    curPageData: item
  })
}
// 点击面包屑
const handleClickBreadcrumb = (index, item) => {
  // 数据回到点击层数据
  cardsData.value = findById(allData.value, item.id)?.children
  breadcrumbList.value.splice(index + 1)
  analysisStore.setData(cardsData.value || [])
  analysisStore.setPid(item.id || 0)
  analysisStore.setLevel(item.level || 0)
}
// 清空面包屑
const clearBreadcrumb = () => {
  breadcrumbList.value = []
  cardsData.value = allData.value
  analysisStore.setData(cardsData.value || [])
  analysisStore.setPid(0)
  analysisStore.setLevel(0)
}
// 点击卡片
const handleClickCard = (item) => {
  if (props.type === 1) {
    // 查看数据集
    if (item.dataSetStatus === 3) {
      viewDataBase(item)
    }
  } else {
    emits('handleClickCard', item)
  }
}
// 点击行
const handleClickRow = (row) => {
  console.log(row)
  if (row.type === 1) {
    // 点击文件夹行
    handleClickFolder(row)
  } else {
    // 点击数据集/工程行
    handleClickCard(row)
  }
}
// 跳转到指定面包屑
// eslint-disable-next-line no-unused-vars
const jumpObj = (obj) => {
  // 重新处理面包屑和当前页数据
  console.log('obj', obj)
  // 如果点击的是数据集，则直接跳转查看，如果是文件夹，则切换到对应面包屑层级
  if (obj.type === 2) {
    // 文件，数据集或工程
    if (props.type === 0) {
      handleClickCard(obj)
    } else if (props.type === 1) {
      viewDataBase(obj)
    }
    return
  }
  breadcrumbList.value = []
  cardsData.value = obj.children || []
  const parentList = findByIdWithParent(allData.value, obj.id)
  parentList.forEach(item => {
    breadcrumbList.value.push({
      name: item.name,
      id: item.id
    })
  })
}
// 排序
const sortChange = (data) => {
  if (data.order === 'ascending') {
    // 升序,早到晚
    // cardsData数组中既有type=1，也有type=2,需要区分排序，不可以交叉排序
    // 先排序type=1，再排序type=2
    const folderList = cardsData.value.filter(item => item.type === 1)
    const fileList = cardsData.value.filter(item => item.type === 2)
    const sortedFolderList = _.sortBy(folderList, ['createTime'])
    const sortedFileList = _.sortBy(fileList, ['createTime'])
    cardsData.value = [...sortedFolderList, ...sortedFileList]
  } else {
    // 降序,晚到早
    // cardsData数组中既有type=1，也有type=2,需要区分排序，不可以交叉排序
    // 先排序type=1，再排序type=2
    const folderList = cardsData.value.filter(item => item.type === 1)
    const fileList = cardsData.value.filter(item => item.type === 2)
    const sortedFolderList = _.sortBy(folderList, ['createTime']).reverse()
    const sortedFileList = _.sortBy(fileList, ['createTime']).reverse()
    cardsData.value = [...sortedFolderList, ...sortedFileList]
  }
}
watch(cardsData, (newVal) => {
  handleLoadingDom()
})
const handleLoadingDom = () => {
  // const oldDomArr = document.querySelectorAll('.table-parsingFailed')
  // oldDomArr.forEach(item => {
  //   item.classList.remove('table-parsingFailed')
  // })
  const oldLoadingDomArr = document.querySelectorAll('.row-loading-custom')
  oldLoadingDomArr.forEach(item => {
    item.remove('row-loading-custom')
  })
  // const oldFailedDomArr = document.querySelectorAll('.row-loading-custom')
  // oldLoadingDomArr.forEach(item => {
  //   item.remove('row-loading-custom')
  // })
  nextTick(() => {
    setTimeout(() => {
      const domArr = document.querySelectorAll('.table-processingRow')
      const html = `<div class='row-loading-custom'>
        <div class='tableLoader'></div>
        <div>正在解析中,请稍等片刻...</div>
        </div>`
      domArr.forEach(item => {
        const temp = document.createElement('div')
        temp.innerHTML = html
        item.appendChild(temp.firstElementChild)
      })

      const domArr2 = document.querySelectorAll('.table-parsingFailed')
      const html2 = `<div class='row-loading-custom failed'>
        <i class='iconfont icon-jiexishibai'></i>
        <div>解析失败</div>
        </div>`
      domArr2.forEach(item => {
        const temp = document.createElement('div')
        temp.innerHTML = html2
        item.appendChild(temp.firstElementChild)
      })
    })
  })
}
watch(() => props.showWay, (newVal) => {
  if (newVal === 2) {
    handleLoadingDom()
  }
})
onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})
defineExpose({
  getData,
  jumpObj
})
</script>
<style scoped lang="scss">
.analysis-cards {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 0;
  margin-top: 16px;
  :deep(.el-breadcrumb) {
    height: 20px;
    margin-top: 8px;
    margin-bottom: 24px;
    line-height: 20px;
    color: var(--theme-text-3);
    .el-breadcrumb__item:last-child {
      .el-breadcrumb__inner {
        color: var(--theme-text);
      }
    }
    .el-breadcrumb__inner {
      cursor: pointer;
      color: var(--theme-text-3);
    }
    .el-breadcrumb__separator {
      margin: 0 5px;
      font-weight: normal;
    }
  }
  .card-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 0;
    .card-title {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      margin-top: 16px;
      padding-top: 0;
      padding-bottom: 16px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
      &:first-child {
        margin-top: 0;
      }
      .flag {
        width: 2px;
        height: 14px;
        margin-right: 8px;
        background-color: var(--theme-primary);
      }
    }
    .card-section {
      display: flex;
      flex-wrap: wrap;
      .card-item {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: calc((100% - 64px)/5);
        height: 156px;
        margin-right: 16px;
        padding: 19px 16px 0 18px;
        border-radius: 8px;
        background-color: var(--theme-card);
        cursor: pointer;
        &:nth-child(5n) {
          margin-right: 0;
          .card-name {
            .operate {
              .operate-btn {
                left: auto !important;
                right: 0 !important;
              }
              ::after {
                left: auto !important;
                right: 0 !important;
              }
              ::before {
                left: auto !important;
                right: 0 !important;
              }
            }
          }
        }
        &:nth-child(n + 6) {
          margin-top: 16px;
        }
        &.big-card-item {
          padding: 0;
          &.card-item0 {
            height: 245px;
            .dataset {
              display: flex;
              align-items: center;
              height: 22px;
              color: var(--theme-text);
              .circleFlag {
                width: 5px;
                height: 5px;
                margin-left: 3px;
                margin-right: 6px;
                border-radius: 100%;
                background-color: #36b58f;
              }
              .dataset_name {
                display: flex;
                overflow: hidden;
                flex: 1;
              }
            }
          }
          &.card-item1 {
            height: 275px;
          }
          .card-name {
            display: flex;
            align-items: center;
            height: 56px;
            padding-left: 16px;
            padding-right: 16px;
            border-bottom: 1px solid #e8e8e8;
            img {
              width: 24px;
            }
            .name {
              display: flex;
              overflow: hidden;
              margin-left: 12px;
            }
          }
          .big-card-main {
            position: relative;
            flex: 1;
            padding: 16px 16px 0;
            .normalText {
              display: flex;
              overflow: hidden;
              line-height: 22px;
              color: var(--theme-text-2);
              &:not(:first-child) {
                margin-top: 8px;
              }
            }
            .card-time {
              border-top: none;
              .iconfont {
                font-size: 16px;
                color: rgba(4, 162, 115, 0.8);
              }
            }
            .mask {
              display: flex;
              position: absolute;
              left: 0;
              top: 0;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              background-color: rgba(255, 255, 255, 0.85);
              &.processingRowMask {
                span {
                  font-size: 14px;
                  color: var(--theme-text);
                }
              }
              &.parsingFailedMask {
                font-size: 14px;
                color: #ff4e4e;
              }
              .iconfont {
                margin-bottom: 13px;
                font-size: 20px;
                color: #ff4e4e;
              }
            }
          }
        }
        .card-name {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          img {
            width: 36px;
          }
          .name {
            display: flex;
            overflow: hidden;
            flex: 1;
            margin-left: 11px;
            color: var(--theme-text);
          }
          .operate {
            display: flex;
            position: relative;
            justify-content: center;
            align-items: center;
            width: 36px;
            height: 36px;
            .gengduo {
              display: none;
              font-size: 3px;
              color: var(--theme-text-2);
            }
            .operate-btn {
              display: none;
              position: absolute;
              right: -48px;
              top: 36px;
              z-index: 10;
              box-sizing: border-box;
              width: 153px;
              padding: 8px 0;
              border: 1px solid var(--theme-border); /* 设置边框颜色 */
              background: var(--theme-card); /* 设置背景色 */
              &::before {
                position: absolute;
                left: 50%;
                top: -21px;
                width: 0;
                height: 0;
                border-width: 10px;
                border-style: dashed dashed solid dashed;
                border-color: transparent transparent var(--theme-border) transparent;
                content: '';
              }
              &::after {
                position: absolute;
                left: 50%;
                top: -20px;
                width: 0;
                height: 0;
                border-width: 10px;
                border-style: dashed dashed solid dashed;
                border-color: transparent transparent #fff transparent;
                content: '';
              }
              .btn {
                height: 28px;
                margin-bottom: 5px;
                padding-left: 24px;
                line-height: 28px;
                span {
                  padding-left: 8px;
                  font-weight: 400;
                  font-size: 14px;
                  color: var(--theme-text);
                }
                .iconfont {
                  font-size: 14px;
                }
              }
              .btn:hover {
                background: rgba(54, 112, 248, 0.05);
                i,
                span {
                  color: var(--theme-primary);
                }
              }
              .btn:last-child {
                margin-bottom: 0;
              }
            }
          }

          .canDelBtn {
            display: none;
            cursor: pointer;
            font-size: 14px;
            color: #ff4e4e;
            .iconfont {
              margin-right: 6px;
              font-size: 14px;
            }
          }
        }
        .card-desc {
          display: flex;
          overflow: hidden;
          margin-top: 17px;
          padding-left: 2px;
          color: var(--theme-text-2);
        }
        .card-time {
          display: flex;
          align-items: center;
          flex: 1;
          margin-right: 3px;
          margin-top: 16px;
          border-top: 1px solid #e8e8e8;
          .iconfont {
            font-size: 16px;
            color: var(--theme-primary);
          }
          .el-icon {
            font-size: 16px;
            color: var(--theme-primary);
          }
          .text {
            margin-left: 8px;
            font-size: 12px;
            color: var(--theme-text-2);
          }
          .time {
            color: var(--theme-text-3);
          }
        }
        &:hover {
          box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
          .canDelBtn {
            display: block;
          }
          :deep(.card-name) {
            .icon-gengduo1 {
              display: block;
            }
            &:hover {
              .operate-btn,
              .canDelBtn {
                display: block;
              }
            }
          }
        }
      }
    }
  }
  .card-content-table {
    display: flex;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    height: 0;
    // margin-top: 24px;
    padding: 24px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .table-title {
      height: 19px;
      margin-bottom: 24px;
      line-height: 19px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
    :deep(.singleTable) {
      .first-td {
        display: flex;
        align-items: center;
        .icon {
          width: 18px;
          margin-right: 8px;
        }

        i {
          margin-right: 8px;
          font-size: 18px;
        }
      }
      // .table-processingRow {
      //   position: relative;
      //   pointer-events: none;
      //   td {
      //     opacity: 0.15;
      //     pointer-events: none;
      //   }
      // }
      .table-parsingFailed,
      .table-processingRow {
        position: relative;
        td:nth-of-type(n+2) {
          .cell {
            opacity: 0.15;
            pointer-events: none;
          }
        }
        td:last-of-type {
          .cell {
            opacity: 1;
            pointer-events: none;
            button {
              opacity: 0.15;
              &.delBtn {
                opacity: 1;
                pointer-events: auto;
              }
            }
          }
        }
      }
      .table-parsingFailed,
      .table-processingRow {
        position: relative;
      }
      .table-processingRow::after,
      .table-parsingFailed::after {
        display: block;
        overflow: hidden;
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 100;
        width: 140px;
        height: 20px;
        // background: url('@/assets/processing.gif') no-repeat;
        // background-size: contain;
        opacity: 1;
        content: '';
        transform: translate(-50%, -50%);
      }
      // .parsingFailed::before {
      //   display: block;
      //   overflow: hidden;
      //   position: absolute;
      //   left: 50%;
      //   top: 50%;
      //   z-index: 100;
      //   width: auto;
      //   height: 20px;
      //   opacity: 1;
      //   font-size: 14px;
      //   color: #ff4e4e;
      //   content: '解析失败';
      //   transform: translate(-50%, -50%);
      // }
      // .parsingFailed::after {
      //   background: url('@/assets/processing5.gif') no-repeat;
      //   background-size: contain;
      // }
    }
  }
  .emptyContent {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    // margin-top: 16px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .emptyImg {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -84px;
      // margin-top: 212px;
      img {
        width: 204px;
        margin-bottom: 6px;
      }
      .text {
        color: var(--theme-text-3);
      }
      .btn-div {
        display: flex;
        margin-top: 33px;
        .el-button {
          display: flex;
          img {
            width: 21px;
            margin-right: 8px;
            margin-bottom: 0;
          }
          &:nth-child(2) {
            img {
              width: 23px;
            }
          }
        }
      }
    }
  }
  .loading-div {
    flex: 1;
    border-radius: 8px;
    background-color: var(--theme-card);
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
}
:deep(.row-loading-custom) {
  display: flex;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 100;
  align-items: center;
  width: auto;
  opacity: 1;
  transform: translate(-50%, -50%);
  &.failed {
    flex-wrap: nowrap;
    font-size: 14px;
    color: #ff4e4e;
    .iconfont {
      margin-right: 5px;
    }
  }
  .tableLoader {
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    margin-right: 5px;
    padding: 2px;
    border-radius: 50%;
    background-color: #0057f9;
    -webkit-mask: var(--_m);
    mask: var(--_m);
    -webkit-mask-composite: source-out;
    mask-composite: subtract;
    animation: l3 1s infinite linear;
    aspect-ratio: 1;

    --_m:
      conic-gradient(#0000 10%, #000),
      linear-gradient(#000 0 0) content-box;
  }
}
.loader {
  box-sizing: border-box;
  width: 20px;
  margin-right: 5px;
  margin-bottom: 14px;
  padding: 2px;
  border-radius: 50%;
  background-color: #0057f9;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
  aspect-ratio: 1;

  --_m:
    conic-gradient(#0000 10%, #000),
    linear-gradient(#000 0 0) content-box;
}

@keyframes l3 { to { transform: rotate(1turn); } }
</style>
