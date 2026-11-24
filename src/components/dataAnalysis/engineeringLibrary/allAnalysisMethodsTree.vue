<template>
  <div class="all-analysis-methods">
    <div class="title">选择算法</div>
    <commonInput
      v-model="filterText"
      placeholder="搜索名称"
      class="searchText"
      clearable
    />
    <div class="treeMenu">
      <el-scrollbar>
        <el-tree
          class="tree-line"
          :data="treeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          :highlight-current="true"
          node-key="id"
          ref="treeRef"
          :default-expanded-keys="[1]"
          :expand-on-click-node="true"
          @node-click="handleNodeClick"
          :default-checked-keys="checkDefault">
          <template #default="{ data }">
            <div :class="{
              'custom-tree-node':true,
              'childrenActived':data.childeIds&&data.childeIds.includes(activeId),
              'actived':(data.id===activeId),
              'childrenNode':!data.icon,
            }">
              <i :class="'iconfont'+' ' + data.icon" v-if="data.icon"></i>
              <div :class="{customTxt:data.icon, 'name':!data.icon}">
                <CommonTooltip :content="data.name">
                  <span>{{ data.name }}</span>
                </CommonTooltip>
              </div>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'AllAnalysisMethodsTree',
  inheritAttrs: false
})
import { ref, watch, nextTick, onMounted } from 'vue'
import { analysisMethodList } from '@/components/dataAnalysis/utils/commonData'
import _ from 'lodash'
const analysisMethodList2 = _.cloneDeep(analysisMethodList)
const props = defineProps({
  jumpData: {
    type: Object
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
// 监听props.jumpData变化，更新高亮节点（跳转节点需求）
watch(() => props.jumpData, (val) => {
  if (val) {
    // activeId.value = val.id
    if (treeData.value) {
    // 获取树的根节点
      const rootNode = treeRef.value.root
      // 根据props.jumpData中的bigGroup值和smallGroup的值，筛选出对应的节点
      const targetNode = rootNode.childNodes.find((node) => {
        // console.log('node', node)
        return node.data.name === val.bigGroup
      })
      if (targetNode) {
        // 找到目标节点的子节点
        const targetChildNode = targetNode.childNodes.find((node) => {
          return node.data.name === val.smallGroup
        })
        handleNodeClickPassive(targetChildNode.data, targetChildNode)
      }
    }
  }
}, {
  deep: true
})
// const customNodeClass = (data) => {
//   return {
//     showOneChild: (data.children && data.children.filter(item => item.filterFlag).length === 1) || (data.children && data.children.length === 1)
//   }
// }
const defaultProps = {
  children: 'children',
  label: 'label'
  // class: customNodeClass
}
const emits = defineEmits([
  'handleNodeClick',
  'handleNodeClickPassive'
])
const filterText = ref('')
const treeRef = ref(null)
watch(filterText, (val) => {
  treeRef.value.filter(val)
})

analysisMethodList2.forEach((item, index) => {
  item.id = (index + 1).toString()
  if (item.children) {
    item.childeIds = item.children.map((child, vIndex) => {
      const id = `${index + 1}-${vIndex + 1}`
      child.id = id // 同时赋值child的id
      return id
    })
  }
})
console.log(props.needCheckPermission, props.hadPermissionList)
// 筛选出有权限的节点
if (props.needCheckPermission) {
  analysisMethodList2.forEach((item, index) => {
    if (item.name === '数据整理') {
      if (item.children) {
        item.children = item.children.filter((child) => {
          return child.name === '数据查看' || props.hadPermissionList.includes(child.name)
        })
      }
    }
  })
  const requiredPermissions = [
    '描述性分析', '差异性分析', '相关性分析', '回归分析', '生存分析',
    '时间序列模型', '空间分析', '传统机器学习', '人工神经网络'
  ]

  const filteredAnalysisMethodList = analysisMethodList2.filter(item => {
    if (requiredPermissions.includes(item.name)) {
      return props.hadPermissionList.includes(item.name)
    }
    return true // 如果不在 requiredPermissions 中，保留该节点
  })
  analysisMethodList2.splice(0, analysisMethodList2.length, ...filteredAnalysisMethodList)
}
// 过滤analysisMethodList2中children为空的节点
const treeData = ref(analysisMethodList2.filter(item => item.children && item.children.length > 0))
const toFirstNode = () => {
  if (treeData.value && treeData.value[0] && treeData.value[0].children && treeData.value[0].children.length > 0) {
    // 获取树的根节点
    const rootNode = treeRef.value.root
    handleNodeClick(treeData.value[0].children[0], rootNode.childNodes[0].childNodes[0])
  }
}
const checkDefault = ref([])
watch(checkDefault, (val) => {
  // treeRef.value.filter(val)
  nextTick(() => {
    toFirstNode()
  })
})
onMounted(() => {
  toFirstNode()
})
const filterNode = (value, data, node) => {
  if (!value) return true
  // 首先筛选目标节点，打上filterFlag来区分是否要显示该节点
  data.filterFlag = data.name.includes(value)
  // 然后给子节点赋上父节点的filterFlag
  // 加上!data.filterFlag判断是为了防止上一行执行完了再进来重复执行
  if (!data.filterFlag && node.level > 1) {
    data.filterFlag = node.parent.data.filterFlag
  }
  return data.filterFlag
}
const activeId = ref(null)

const medicalList = ref([])
const handleNodeClick = async (data, node, component) => {
  if (data.children) {
    return
  }
  setTreeAcitve(data)
  // 获取当前节点的父节点
  const parentNode = node.parent
  if (parentNode) {
    setTimeout(() => {
      emits('handleNodeClick', {
        ...data,
        icon: parentNode.data.icon,
        groupName: parentNode.data.name
      })
    }, 200) // 使用延迟，目的是让左侧节点树能顺利展开，防止加载右侧数据查看table过慢，造成阻塞左侧节点树的丝滑展开
  }
}
const handleNodeClickPassive = async (data, node, component) => {
  if (data.children) {
    return
  }
  setTreeAcitve(data)
  // 获取当前节点的父节点
  const parentNode = node.parent
  if (parentNode) {
    emits('handleNodeClickPassive', {
      ...data,
      icon: parentNode.data.icon,
      groupName: parentNode.data.name
    })
  }
}
const checkedDefaultNode = () => {
  toFirstNode()
}

const setTreeAcitve = (data) => {
  // compUrl.value = components[data.component]
  medicalList.value = [data]
  activeId.value = data.id
  treeRef.value?.setCurrentKey(activeId.value)
}

defineExpose({ checkedDefaultNode, setTreeAcitve })
</script>
<style scoped lang="scss">
.all-analysis-methods {
  display: flex;
  flex-direction: column;
  width: 259px;
  border-radius: 8px;
  background-color: var(--theme-card);
  .title {
    margin: 16px 0 16px 24px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
  }
  :deep(.searchText) {
    width: auto;
    margin: 0 16px;
    .el-input__wrapper {
      .el-input__icon {
        font-size: 14px;
        color: var(--theme-text-3);
      }
      .el-input__inner {
        font-size: 14px;
        color: var(--theme-text);
        &::placeholder {
          color: var(--theme-text-3);
        }
      }
    }
  }
  .treeMenu {
    overflow: hidden;
    flex: 1;
    padding-bottom: 16px;
    :deep(.el-tree-node__expand-icon.expanded) {
      position: absolute;
      right: 0;
      transform: rotate(90deg);
    }
    :deep(.el-tree-node__expand-icon) {
      position: absolute;
      right: 0;
    }
  }
  :deep(.tree-line) {
    box-sizing: border-box;
    padding: 0 16px 24px 16px;
    font-size: 14px;
    &.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
      background: transparent;
    }
    & > .el-tree-node > .el-tree-node__content:nth-child(1) {
      padding-left: 0 !important;
    }
    .el-tree-node {
      position: relative;
      padding-left: 0; // 缩进量
      // &.showOneChild {
      //   .el-tree-node__children {
      //     .el-tree-node {
      //       &::before,
      //       &::after {
      //         display: none;
      //       }
      //     }
      //   }
      // }

      .el-tree-node__content {
        overflow: hidden;
        height: 36px;
        margin-top: 8px;
        padding-left: 14px !important;
        border-radius: 2px;
        &:hover {
          background: transparent;
          .custom-tree-node {
            border-radius: 2px;
            background-color: rgba(54, 112, 248, 0.05);
          }
        }
      }
      .iconfont {
        margin-right: 10px;
        font-size: 16px;
        color: var(--theme-text-3);
        &.icon-yingxiangjiancha,
        &.icon-bingli1,
        &.icon-shoushujilu,
        &.icon-hulijilu {
          font-size: 18px;
        }
      }
      .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        padding-left: 6px;
        &.childrenNode {
          margin-left: 10px;
          padding: 0 16px;
          .name {
            display: flex;
            overflow: hidden;
            width: 171px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        &.childrenActived {
          font-weight: 500;
          color: var(--theme-primary);
          .iconfont {
            color: var(--theme-primary);
          }
        }
        &.actived {
          border-radius: 2px;
          background-color: rgba(54, 112, 248, 0.05);
          font-weight: 600;
          color: var(--theme-primary) !important;
          .iconfont {
            color: var(--theme-primary) !important;
          }
        }
      }
      &:focus>.el-tree-node__content {
        background-color: inherit;
      }
      // &:focus>.el-tree-node__content,
      // &.is-current {
      //   .iconfont,
      //   .customTxt {
      //     color: var(--theme-primary) !important;
      //   }
      // }
    }

    .el-tree-node__children {
      padding-left: 6px; // 缩进量
    }

    // 竖线
    .el-tree-node::before {
      position: absolute;
      // left: -3px;
      left: 15px;
      top: -30px;
      width: 1px;
      height: 48px;
      border-width: 1px;
      border-left: 1px solid #d8d8d8;
      content: '';
    }
    // .el-tree-node:only-child::before {
    //   top: 0;
    // }
    // // 当前层最后一个节点的竖线高度固定
    // .el-tree-node:last-child::before {
    //   height: 19px; // 可以自己调节到合适数值
    // }
    .el-tree-node + .el-tree-node:last-child::before {
      height: 48px;
    }

    // 横线
    .el-tree-node::after {
      position: absolute;
      left: 15px;
      top: 18px;
      width: 9px;
      height: 20px;
      border-width: 1px;
      border-top: 1px solid #d8d8d8;
      content: '';
    }

    // 去掉最顶层的虚线，放最下面样式才不会被上面的覆盖了
    & > .el-tree-node::after {
      border-top: none;
    }
    & > .el-tree-node::before {
      border-left: none;
    }

    // 展开关闭的icon
    .el-tree-node__expand-icon {
      font-size: 16px;
      // 叶子节点（无子节点）
      &.is-leaf {
        color: transparent;
        // display: none; // 也可以去掉
      }
    }
  }
}
</style>
