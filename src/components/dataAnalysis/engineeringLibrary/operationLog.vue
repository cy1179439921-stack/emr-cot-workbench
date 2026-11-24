<!-- 操作记录 -->
<template>
  <div class="operation-log">
    <div class="search">
      <span class="clearfix">节点筛选</span>
      <div class="filter">
        <div class="treeClearFocuStyle">
          <el-tree default-expand-all :default-checked-keys="checkList" :data="selectOptions" ref="treeRef" show-checkbox node-key="label" :props="{ children: 'children', label: 'label' }" @check="filterTreeData">
            <template #default="{ node }">
              <div class="customTreeNode">
                <span class="treeLabel">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="leftContent" v-if="!isLoding">
        <el-scrollbar ref="timeLineDomRef">
          <div class="shortcut">
            <div class="top" @click="toTop()">
              <i class="iconfont icon-shang2" ></i>
            </div>
            <div class="bottom" @click="toBottom()">
              <i class="iconfont icon-xia2"></i>
            </div>
          </div>
          <el-timeline>
            <el-timeline-item v-for="(item, index) in treeDataList" :key="index" :icon="setIcon(item)">
              <div class="timestampStyle" :class="{'activeStyle': item.id === checkNodeId}" @click="changeCard(item)">
                <template v-if="item.coreFlag">
                  <div class="marker">
                    <SvgIcon iconName="icon-biaoji-2"></SvgIcon>标记节点
                  </div>
                </template>
                <div class="timestampTitle">
                  <span class="nodeName">{{ item.smallGroup || engineeringInfo.name }}</span>
                </div>
                <div class="operationContent">
                  <div class="operationContentItem">
                    <span class="title">操作详情</span>
                    <span class="value">{{ item.operateDetail }}</span>
                  </div>
                  <div class="operationContentItem mtb8">
                    <span class="title">操作人</span>
                    <span class="value">{{ item.creator }}</span>
                  </div>
                  <div class="operationContentItem">
                    <span class="title">操作时间</span>
                    <span class="value">{{ item.createTime }}</span>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-scrollbar>
      </div>
      <div class="loading-div flexCenter" v-else>
        <div class="loading-box">
          <div class="pixel-spinner">
            <div class="pixel-spinner-inner"></div>
          </div>
          <div class="text">加载中</div>
        </div>
      </div>
    </div>

    <operationLogDefault :tabIndex="tabIndex" ref="operationLogDefaultRef" @close="checkNodeId = null" @setCardNodeSign="setCardNodeSign" @toCurrentNode="toCurrentNode" v-if="checkNodeId"></operationLogDefault>
  </div>
</template>

<script setup>
import { ref, onMounted, h, computed, nextTick, provide } from 'vue'
import { getOperationLogList } from '@/api/api_dataAnalysis'
import SvgIcon from '@/components/common/SvgIcon.vue'
import operationLogDefault from './operationLogDefault.vue'
// import lodash from 'lodash'
const emits = defineEmits(['toCurrentNode'])
const { engineeringInfo } = defineProps({
  engineeringInfo: {
    type: Object,
    required: true
  },
  tabIndex: {
    type: Number
  }
})
provide('engineeringInfo', engineeringInfo)
const isLoding = ref(true) // 是否正在加载
const treeRef = ref(null) // 节点树
const timeLineDomRef = ref(null) // 时间轴dom
const operationLogDefaultRef = ref(null) // 节点详情弹窗
const checkNodeId = ref(null) // 选中节点id

const filterActivities = ref([]) // 筛选后的日志数据
const menu = [
  { label: '数据整理节点', icon: 'iconfont icon-shujuzhengli' },
  { label: '描述性分析节点', icon: 'iconfont icon-miaoshuxingfenxi' },
  { label: '差异性分析节点', icon: 'iconfont icon-chayixingfenxi' },
  { label: '相关性分析节点', icon: 'iconfont icon-xiangguanxingfenxi' },
  { label: '回归分析节点', icon: 'iconfont icon-huiguifenxi' },
  { label: '生存分析节点', icon: 'iconfont icon-shengcunfenxi' },
  { label: '时间序列模型节点', icon: 'iconfont icon-shijianxuliemoxing' },
  { label: '空间分析节点', icon: 'iconfont icon-kongjianfenxi' },
  { label: '传统机器学习节点', icon: 'iconfont icon-chuantongjiqixuexi' },
  { label: '人工神经网络节点', icon: 'iconfont icon-rengongshenjingwangluo' },
  { label: '高级分析节点', icon: 'iconfont icon-gaojifenxi' }
]
const checkList = [...menu.map(i => i.label)] // 默认选中节点
const filterList = ref([]) // 筛选条件

const treeDataList = computed(() => {
  const menuReplace = new Set(filterList.value.map(i => i.replace('节点', '')))

  return ([...filterActivities.value]).filter(i => {
    if (Number(i.pid) === 0) return true

    if (!menuReplace.has(i.bigGroup)) return false

    return !menuReplace.has('核心') || i.coreFlag
  })
}) // 节点树数据

const selectOptions = [ // 节点树数据
  {
    id: 0,
    label: '全部节点',
    children: menu
  },
  {
    id: 1,
    label: '核心节点'
  }
]

// 筛选条件变更
const filterTreeData = () => {
  filterList.value = treeRef.value.getCheckedKeys(true)
}

// 回到顶部
const toTop = () => {
  const scrollElem = timeLineDomRef.value?.wrapRef
  scrollElem.scrollTo({ top: 0, behavior: 'smooth' })
}
// 回到底部
const toBottom = () => {
  const scrollElem = timeLineDomRef.value?.wrapRef
  scrollElem.scrollTo({ top: scrollElem.scrollHeight, behavior: 'smooth' })
}

// 节点详情
const changeCard = (nodeObject) => {
  const { id } = nodeObject
  checkNodeId.value = id
  nextTick(() => {
    operationLogDefaultRef.value.show(nodeObject)
  })
}

// 初始化数据
const initData = () => {
  isLoding.value = true
  getOperationLogList({ id: engineeringInfo?.id }).then(res => {
    filterActivities.value = res.data
    nextTick(() => {
      isLoding.value = false
    })
  })
}

// 设置节点图标
const setIcon = (item) => {
  if (Number(item.pid) === 0) {
    return () => h(SvgIcon, { iconName: 'icon-gongcheng-1' })
  }
  const iconName = menu.find(i => i.label.includes(item.bigGroup))?.icon || ''
  return () => h('i', { class: iconName })
}
// 设置card的标记状态
const setCardNodeSign = (val) => {
  // 从treeDataList中找到当前节点
  const currentNode = treeDataList.value.find(i => i.id === checkNodeId.value)
  if (currentNode) {
    currentNode.coreFlag = val
  }
}
// 跳转节点
const toCurrentNode = (result) => {
  emits('toCurrentNode', result)
}
onMounted(() => {
  filterTreeData()
  initData()
})
</script>

<style lang="scss" scoped>
.operation-log {
  display: flex;
  position: relative;
  width: 100%;
  .search {
    box-sizing: border-box;
    width: 260px;
    padding: 16px 16px 0 16px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .clearfix {
      line-height: 24px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
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
        margin-top: 8px;
        .el-checkbox {
          margin-left: 14px !important;
        }
      }
      :deep(.el-tree-node__content),
      .customTreeNode {
        display: flex;
        align-items: center;
        height: 36px;
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
      :deep(.el-scrollbar__wrap) {
        width: 100%;
        .el-scrollbar__view {
          display: flex;
        }
      }
    }
    .shortcut {
      display: flex;
      position: absolute;
      right: 24px;
      bottom: 0;
      flex-direction: column;
      .top,
      .bottom {
        width: 32px;
        height: 32px;
        margin-top: 12px;
        border-radius: 50%;
        background-color: var(--theme-primary-soft);
        cursor: pointer;

        @include childrenCenter();
        i {
          font-size: 6px;
        }
        &:hover {
          background-color: var(--theme-primary);
          color: #fff;
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
  :deep(.el-timeline) {
    box-sizing: border-box;
    height: 100%;
    margin: 0 auto;
    padding: 0;
    .el-timeline-item {
      padding: 8px;
      .el-timeline-item__timestamp {
        margin: 0;
      }
      .el-timeline-item__tail {
        left: 14px;
        top: 52px;
        height: 76%;
        border-left: 1px solid #efefef;
      }
      .el-timeline-item__node--normal {
        left: 0;
        top: 20px;
        width: 28px;
        height: 28px;
        background: var(--theme-primary-soft);
        .iconfont {
          font-size: 14px;
          color: #3570f8;
        }
        .icon-gongcheng {
          color: #35b58f;
        }
        &:has(svg) {
          background: rgba(54, 181, 143, 0.07);
          .el-icon {
            border-radius: 50%;
            font-size: 14px;
          }
        }
      }
      .el-timeline-item__wrapper {
        top: 0;
      }
      .timestampStyle {
        position: relative;
        box-sizing: border-box;
        width: 468px;
        padding: 16px;
        border-radius: 4px;
        background-color: var(--theme-primary-soft);
        cursor: pointer;
        .marker {
          display: flex;
          position: absolute;
          right: 0;
          top: 0;
          justify-content: center;
          align-items: center;
          width: 80px;
          border-radius: 0 3.5px 0 3.5px;
          background-color: var(--theme-fill);
          line-height: 27px;
          font-weight: 400;
          font-size: 12px;
          color: #f59f0c;
          .svg-icon {
            width: 12px;
            height: 12px;
            margin-right: 2px;
          }
        }
        .timestampTitle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
        }
        .nodeName {
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
      }
      .activeStyle {
        background-color: var(--theme-primary) !important;
        color: #fff;
        .operationContentItem>*,
        .nodeName {
          color: #fff !important;
        }
      }
      .operationContent {
        display: flex;
        flex-direction: column;
        width: 100%;
        .operationContentItem {
          font-weight: 400;
          font-size: 14px;

          @include childrenBetween();
          .title,
          .value {
            color: var(--theme-text-3);
          }
          &.mtb8 {
            margin: 8px 0;
          }
        }
      }
    }
  }
}
</style>
