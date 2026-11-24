<template>
  <div class="actionBar">
    <el-dialog
      title="移动至文件夹"
      class="addIP_Dialog"
      v-model="showDialog"
      :show-close="true"
      :close-on-click-modal="true"
      :width="pxToRem(653)"
      :before-close="handleClose"
    >
      <div class="infoTitle">
        <i class="iconfont icon-tishi-yidongwenjianjia"></i>
        <span>文件夹最多至5层级，当前选择的文件夹总层级超过5层级，目标节点不可选择</span>
      </div>
      <div class="mainContent">
        <div class="tips">请选择目标</div>
        <div class="treeContent">
          <el-scrollbar>
            <el-tree
              :default-expanded-keys="['0']"
              @node-click="handleNodeClick"
              :highlight-current="true"
              :data="folerList"
              node-key="id"
              :expand-on-click-node="false"
            >
              <template #default="{ data }">
                <div class="custom-tree-node engineerNode customTreeNode">
                  <el-radio
                    v-model="dataSetId"
                    :label="data.id"
                    :disabled="data.level + maxDepth > 5 && props.removeData.type === 1"
                  >
                    <img class="radioImg" :src="myRequire('duoceng.png')" />
                    <!-- <span>{{ data.name }}</span> -->
                    <div v-show-tip class="content">
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        :content=" data.name "
                        placement="bottom"
                        :open-delay="400"
                        :enterable="false"
                        :hide-after="0"
                      >
                        <span class="treeLabel">{{ data.name }}</span>
                      </el-tooltip>
                    </div>
                  </el-radio>
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: 'RemoveFolderDialog'
})
import { ref, watch } from 'vue'
import { moveFolder, moveFolderDb } from '@/api/api_dataAnalysis'
import { ElMessage } from 'element-plus'
import _ from 'lodash'
const folerList = ref([])
const dataSetId = ref(null)
const choiceId = ref(null)
const myRequire = (name) => new URL(`/src/assets/${name}`, import.meta.url).href
const emit = defineEmits(['handle-close', 'updateList'])
const projectData = ref([])
const props = defineProps({
  allData: {
    type: Array,
    default: () => []
  },
  dialogVisibleRemove: {
    type: Boolean,
    default: false
  },
  removeData: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: Number,
    default: 0
  }
})

const showDialog = ref(false)
const open = () => {
  showDialog.value = true
}
open()
// const handleDialog = (data) => {
//   isShow.value = true
//   // getTreeData(data)
// }
const getTreeDepth = (node) => {
  // 如果没有子节点，或者子节点的 type 为 2，返回当前节点的深度为 1
  if (!node.children || node.children.length === 0 || node.type === 2) {
    return 1
  }

  // 获取每个子节点的深度，忽略 type 为 2 的子节点
  const childrenDepth = node.children
    .filter(child => child.type !== 2) // 过滤掉 type 为 2 的子节点
    .map(getTreeDepth)

  // 如果有有效的子节点，取最大深度并加上当前层级
  return childrenDepth.length > 0 ? Math.max(...childrenDepth) + 1 : 1
}

const maxDepth = ref(0)
const filterTreeData = (data, removeId) => {
  return data
    .filter(item => item.id !== removeId && item.type !== 2) // 过滤顶层数据
    .map(item => {
      if (item.children && item.children.length > 0) {
        // 如果有 children，就递归过滤
        item.children = filterTreeData(item.children, removeId)
      }
      return item // 返回过滤后的数据
    })
}
const getTreeData = () => {
  projectData.value = _.cloneDeep(props.allData)
  // 获取最深层级
  maxDepth.value = getTreeDepth(props.removeData)
  // 排除掉数据中data.id那一条数据
  // const treeData = projectData.filter(item => item.id !== props.removeData.id && item.type !== 2)
  const treeData = filterTreeData(projectData.value, props.removeData.id)
  console.log(treeData, 'treeData')
  folerList.value = [
    {
      id: '0',
      pid: 0,
      name: '根目录',
      children: treeData
    }
  ]
}

const handleNodeClick = (data) => {
  console.log(data)
  choiceId.value = data.id
}

const handleClose = () => {
  showDialog.value = false
  emit('handle-close')
}

const confirm = () => {
  if (!choiceId.value) {
    console.log('请选择目标文件夹')
    return
  }
  const params = { id: props.removeData.id, pid: choiceId.value }
  const moveAction = props.type === 0 ? moveFolder : moveFolderDb
  moveAction(params).then(res => {
    if (res.code === 10000) {
      ElMessage.success('移动成功')
      handleClose()
      emit('updateList')
    }
  })
    .catch((error) => {
      console.error('移动失败', error)
    })
}

const init = () => {
  getTreeData()
}

init()

watch(() => props.dialogVisibleRemove, (newVal) => {
  if (newVal) {
    getTreeData()
  }
})
</script>

<style lang="scss" scoped>
:deep(.addIP_Dialog) {
  .el-dialog__header {
    padding-bottom: 16px !important;
  }
  .el-dialog__body {
    .infoTitle {
      display: flex;
      align-items: center;
      height: 40px;
      margin-bottom: 16px;
      padding-left: 18px;
      border: 1px solid rgba(245, 159, 12, 0.5);
      border-radius: 2px;
      background: rgba(245, 159, 12, 0.05);
      i {
        padding-right: 7px;
        color: #f6a31e;
      }
      span {
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text);
      }
    }
    .mainContent {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 605px;
      height: 358px;
      padding: 24px 8px 0 24px;
      background: var(--theme-fill);
      .tips {
        padding-bottom: 17px;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-text);
      }
      .treeContent {
        flex: 1;
        height: 0;
        .el-tree {
          overflow-y: auto;
          box-sizing: border-box;
          height: 100%;
          padding-bottom: 24px;
          background: var(--theme-fill);
          img {
            width: 18px;
            height: 16px;
            margin: 0 8px 0 10px;
          }
          .el-tree-node__content {
            height: 20px;
            background: none;
            .el-radio {
              display: flex;
              align-items: center;
              width: 100%;
              height: 100%;
              .el-radio__label {
                display: flex;
                align-items: center;
                width: 95%;
                line-height: 20px;
                font-weight: 400;
                font-size: 14px;
                color: var(--theme-text);
              }
              .el-radio__input {
                &.is-disabled {
                  .el-radio__inner {
                    border: 1px solid #d8d8d8;
                    background: var(--theme-fill);
                  }
                }
              }
            }
            &:hover {
              background-color: transparent !important;
            }
            .customTreeNode {
              display: flex;
              overflow: hidden;
              align-items: center;
              flex: 1;
              height: 38px;
              .content {
                display: flex;
                overflow: hidden;
                flex: 1;
              }
              .treeLabel {
                overflow: hidden; /* 隐藏溢出内容 */
                flex: 1;
                line-height: 20px;
                text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
                font-weight: 400;
                font-size: 14px;
                white-space: nowrap;
              }
            }
          }
          .el-tree-node.is-curren {
            background-color: transparent !important;
            .el-tree-node__content {
              background-color: transparent !important;
            }
          }
          .el-tree-node__children {
            .el-tree-node {
              margin-top: 20px;
            }
          }
        }
      }
    }
    .dialog-footer {
      margin-top: 24px;
    }
  }
}
</style>
