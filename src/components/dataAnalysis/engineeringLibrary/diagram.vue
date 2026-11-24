<!-- 操作记录 -->
<template>
  <div class="operation-log">
    <div class="search">
      <div class="clearfix">
        <span>节点筛选</span>
      </div>
      <div class="filter">
        <div>
          <el-tree default-expand-all :default-checked-keys="checkList" :data="selectOptions" ref="treeRef" show-checkbox node-key="id" :props="{ children: 'children', label: 'label' }" @check="filterTreeData">
            <template #default="{ node }">
              <div class="customTreeNode">
                <span class="treeLabel">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
          <div class="filterbtn">
            <el-checkbox v-model="codeNode" @change="filterTreeData">核心节点日志</el-checkbox>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="leftContent">
        <el-scrollbar ref="timeLineDomRef">
          <TreeChart :json="treeData" :expandable="false" @click-node="onNodeClick" ></TreeChart>
        </el-scrollbar>
      </div>
    </div>

    <div class="right" v-if="showDetails">
      <div class="header">
        <span>详情</span>
        <i class="iconfont icon-dankuang-shanchu" @click="closeDetails"></i>
      </div>
      <div class="content"></div>
      <div class="footer">
        <el-button>
          <svgIcon iconName="icon-biaoji1"></svgIcon>标记为核心节点
        </el-button>
        <el-button>
          <i class="iconfont icon-daochu2"></i>下载PDF
        </el-button>
        <el-button type="primary">
          <i class="iconfont icon-tiaozhuan"></i>跳转至该节点
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import TreeChart from './TreeChart.vue'
// import _ from 'lodash'
// const arrIcon = [
//   { type: 0, value: 'icon-shujuji' },
//   { type: 1, value: 'icon-shujuzhengli2' },
//   { type: 2, value: 'icon-jixianfenxi1' },
//   { type: 3, value: 'icon-gaojifenxi1' }
// ]
// const tabNameConversion = [
//   { type: 0, value: '初始化数据集' },
//   { type: 1, value: '数据整理' },
//   { type: 2, value: '基线分析' },
//   { type: 3, value: '高级分析' },
//   { type: 4, value: '系统操作' }
// ]
// const tabNameProcess = [
//   { type: 1, value: '推荐流程1' },
//   { type: 2, value: '推荐流程2' },
//   { type: 3, value: '推荐流程3' },
//   { type: 4, value: '自定义流程' }
// ]
const checkList = [1, 2, 3, 4, 5, 6, 7, 8, 9] // 默认选中节点
const treeRef = ref(null) // 节点树

const showDetails = ref(false) // 是否节点显示详情
const codeNode = ref(false) // 核心节点日志筛选
const filterValue = ref([]) // 筛选条件
const timeLineDomRef = ref(null) // 时间轴dom
const treeData = ref([]) // 筛选后的数据
const activeNodeData = ref(null) // 当前选中节点数据
// const nodeId = ref(null) // 节点id
const menu = [
  { id: 1, label: '数据整理节点', icon: 'iconfont icon-shujuzhengli' },
  { id: 2, label: '描述性分析节点', icon: 'iconfont icon-miaoshuxingfenxi' },
  { id: 3, label: '差异性分析节点', icon: 'iconfont icon-chayixingfenxi' },
  { id: 4, label: '相关性分析节点', icon: 'iconfont icon-xiangguanxingfenxi' },
  { id: 5, label: '回归分析节点', icon: 'iconfont icon-huiguifenxi' },
  { id: 6, label: '生存分析节点', icon: 'iconfont icon-shengcunfenxi' },
  { id: 7, label: '时间序列模型节点', icon: 'iconfont icon-shijianxuliemoxing' },
  { id: 8, label: '空间分析节点', icon: 'iconfont icon-kongjianfenxi' },
  { id: 9, label: '传统机器学习节点', icon: 'iconfont icon-chuantongjiqixuexi' }
]

const selectOptions = [ // 节点树数据
  {
    id: 0,
    label: '全部节点',
    children: menu
  }
]

// 筛选条件变更
const filterTreeData = () => {
  filterValue.value = treeRef.value.getCheckedKeys(true)
}
// 回到底部
const toCenter = () => {
  const scrollElem = timeLineDomRef.value?.wrapRef
  const { offsetWidth, scrollWidth } = scrollElem
  console.log(scrollElem.scrollWidth)
  scrollElem.scrollTo({ left: (scrollWidth - offsetWidth) / 2, behavior: 'instant' })
}

// 节点详情
const onNodeClick = (nodeObject) => {
  showDetails.value = true
  activeNodeData.value = nodeObject
}

// 初始化数据
const initData = () => {
  const res = {
    code: 10000,
    data: {
      name: 'root',
      image_url: 'https://static.refined-x.com/static/avatar.jpg',

      children: [
        {
          name: 'children1',
          image_url: 'https://static.refined-x.com/static/avatar.jpg',

          children: [
            {
              name: 'grandchild',
              image_url: 'https://static.refined-x.com/static/avatar.jpg'

            },
            {
              name: 'grandchild2',
              image_url: 'https://static.refined-x.com/static/avatar.jpg'

            },
            {
              name: 'grandchild3',
              image_url: 'https://static.refined-x.com/static/avatar.jpg'

            }
          ]
        },
        {
          name: 'children2',
          image_url: 'https://static.refined-x.com/static/avatar.jpg',

          children: [
            {
              name: 'grandchild',
              image_url: 'https://static.refined-x.com/static/avatar.jpg'
            },
            {
              name: 'grandchild2',
              image_url: 'https://static.refined-x.com/static/avatar.jpg'
            },
            {
              name: 'grandchild3',
              image_url: 'https://static.refined-x.com/static/avatar.jpg',
              children: [
                {
                  name: 'grandchild',
                  image_url: 'https://static.refined-x.com/static/avatar.jpg'

                },
                {
                  name: 'grandchild2',
                  image_url: 'https://static.refined-x.com/static/avatar.jpg'
                },
                {
                  name: 'grandchild3',
                  image_url: 'https://static.refined-x.com/static/avatar.jpg',
                  children: [
                    {
                      name: 'grandchild',
                      image_url: 'https://static.refined-x.com/static/avatar.jpg'
                    },
                    {
                      name: 'grandchild2',
                      image_url: 'https://static.refined-x.com/static/avatar.jpg'
                    },
                    {
                      name: 'grandchild3',
                      image_url: 'https://static.refined-x.com/static/avatar.jpg'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    msg: 'success'
  }
  treeData.value = res.data
}

// 关闭节点详情
const closeDetails = () => {
  showDetails.value = false
  activeNodeData.value = null
}

// function renderFunc(nodeData) {
//   return '<span class=datachange>* 数据集有变动</span>'
//   // ${!data.supportArr.some(suItem => suItem.id === nodeData.id) && 'grey'}
//   // eslint-disable-next-line no-unreachable
//   const isOpactiy = isOpactiyData(nodeData)
//   return `<div class="fixed ${nodeId.value === nodeData.id && 'rel-node-checked'} ${isOpactiy && 'isOpactiy'}">
//                 <div class='datafinishing ${nodeData.type === 4 && 'dottedline'} ${nodeData.type === 0 && 'green'} ${nodeData.status && 'coreNode'}
//                   ${codeNode.value && nodeData.status && 'yellow'}'>
//                   ${nodeData.batch_type
//     ? `<div class="flex mbce">
//                         <i class="iconfont icon-tuijian1"></i>
//                         <h4 class=m0>${tabNameProcess.find(it => it.type === nodeData.batch_type)?.value}</h4>
//                       </div>
//                       <div>
//                         <span>${tabNameConversion.find(it => it.type === nodeData.type)?.value}_${nodeData.node_name}</span>
//                       </div>
//                   `
//     : `<div class=flex>
//                       ${`<i class="iconfont ${arrIcon.find(it => it.type === nodeData.type)?.value}"></i>`}
//                       <div>
//                         <h4>${tabNameConversion.find(it => it.type === nodeData.type)?.value}</h4>
//                         <span>${nodeData.node_name}</span>
//                       </div>
//                   </div>`
// }
//                   ${nodeData.type === 1 ? '<span class=datachange>* 数据集有变动</span>' : ''}
//                 </div>
//               </div>`
// }

// const isOpactiyData = (nodeData) => {
//   let isOpacity = false
//   const { type, node_name, status } = nodeData
//   if (type !== 0) {
//     const isCodeNodeMatch = codeNode.value && codeNode.value !== status
//     const isFilterValueMatch = filterValue.value.includes(node_name)

//     if (!isFilterValueMatch && !codeNode.value) {
//       isOpacity = true
//     } else if (isCodeNodeMatch && _.isEmpty(filterValue.value)) {
//       isOpacity = true
//     } else if (isCodeNodeMatch || !isFilterValueMatch) {
//       isOpacity = true
//     }
//   }
//   return isOpacity
// }

onMounted(() => {
  initData()
  nextTick(() => {
    toCenter()
  })
})
</script>

<style lang="scss" scoped>
.operation-log {
  display: flex;
  overflow: hidden;
  position: relative;
  width: 100%;
  .search {
    box-sizing: border-box;
    width: 260px;
    padding: 16px 16px 0 16px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .filter {
      :deep(.el-tree-node__expand-icon.expanded) {
        position: absolute;
        right: 0;
        transform: rotate(90deg);
      }
      :deep(.el-tree-node__expand-icon) {
        position: absolute;
        right: 0;
      }
      :deep(.el-checkbox__input.is-checked .el-checkbox__inner,),
      :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
        border-color: var(--theme-primary) !important;
        background-color: var(--theme-primary) !important;
      }
      :deep(.el-tree-node__content) {
        .el-checkbox {
          margin-left: 14px !important;
        }
      }
      :deep(.el-tree-node__content),
      .customTreeNode {
        display: flex;
        align-items: center;
        height: 44px;
        user-select: none;
        .hookImg {
          position: absolute;
          right: 6px;
          width: 10px;
          height: auto;
        }
      }

      .treeLabel {
        line-height: 44px;
        font-weight: 400;
        font-size: 14px;
      }
    }
  }

  .content {
    display: flex;
    overflow: hidden;
    position: relative;
    flex: 1;
    margin-left: 16px;
    border-radius: 8px;
    background: var(--theme-card);
    .leftContent {
      overflow: hidden;
      flex: 1;
      box-sizing: border-box;
      padding: 56px 0;
      user-select: none;
      >div {
        display: flex;
        justify-content: center;
      }
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    width: 660px;
    margin-left: 16px;
    border-radius: 8px;
    background: var(--theme-card);
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 54px;
      padding: 0 24px;
      border-bottom: 1px solid #e8e8e8;
      span {
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      i {
        cursor: pointer;
        font-size: 14px;
        color: var(--theme-text-3);
      }
    }
    .content {
      overflow-y: auto;
      flex: 1;
    }
    .footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      box-sizing: border-box;
      height: 80px;
      padding-right: 24px;
      .svg-icon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
      .iconfont {
        margin-right: 4px;
        font-size: 16px;
      }
    }
  }
}
</style>
