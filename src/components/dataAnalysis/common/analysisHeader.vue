<template>
  <div class="analysis-header">
    <!-- <div class="title">{{title}}</div> -->
    <!-- <div class="split-line"></div> -->
    <div class="main-content">
      <div class="left-content">
        <template v-for="(item, index) in options" :key="index">
          <div class="split-line" v-if="index > 0"></div>
          <el-button link @click="$emit('header-click', item)">
            <img :src="item.icon" class="icon" />{{item.name}}
          </el-button>
        </template>
      </div>
      <div class="right-content">
        <div class="searchContainer" v-click-outside="handleClickoutside">
          <commonInput
            clearable
            class="searchInput"
            :placeholder="props.type === 0 ? '请填写文件夹名/工程名' : '请填写文件夹名/数据集名'"
            v-model="filterText"/>
          <div class="customTreeContainer">
            <el-scrollbar>
              <el-tree
                v-show="isHiddenTree"
                ref="treeDom"
                class="customTree"
                default-expand-all
                :indent="echartsToPx(27)"
                :data="treeData"
                :filter-node-method="filterNode"
                @node-click="handleNodeClick"
                :expand-on-click-node="false"
              >
                <template #default="{ data }">
                  <div class="customTreeNode" >
                    <template v-if="data.type===1" >
                      <img class="folderIcon" :src="folder" alt="">
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
                    </template>
                    <template v-else>
                      <img class="fileIcon" :src="fileLogo" alt="">
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

                    </template>
                  </div>
                </template>
              </el-tree>
            </el-scrollbar>
          </div>
        </div>
        <el-button-group class="btns">
          <el-button :class="{ active: showWay === 1 }" @click="$emit('update:showWay', 1)">
            <i class="iconfont icon-pingpu"></i>
          </el-button>
          <el-button :class="{ active: showWay === 2 }" @click="$emit('update:showWay', 2)">
            <i class="iconfont icon-liebiao"></i>
          </el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useAnalysisStore } from '@/store/analysisStore.js'
import fileLogo from '@/assets/dataSet.png'
import folder from '@/assets/folder.png'
import { echartsToPx } from '@/utils/utils.js'
import { clickoutside } from '@/utils/utils'
const vClickOutside = clickoutside
const analysisStore = useAnalysisStore()
defineOptions({
  name: 'AnalysisHeader',
  inheritAttrs: false
})
const emits = defineEmits(['update:showWay', 'handle-click', 'handleJumpObj'])
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showWay: {
    type: Number
  },
  options: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: Number,
    default: 0
  }
})
const treeData = ref([])
const handleNodeClick = (val) => {
  emits('handleJumpObj', val)
  isHiddenTree.value = false
  filterText.value = ''
}
const filterText = ref('')

const filterNode = (value, item) => {
  if (!value) return true
  return (item.name && item.name.includes(value))
}
const isHiddenTree = ref(false)
const treeDom = ref('')
const handleClickoutside = () => {
  isHiddenTree.value = false
  filterText.value = ''
}
watch(filterText, (val) => {
  isHiddenTree.value = !!val
  treeDom.value.filter(val)
})
watch(() => analysisStore.data, (val) => {
  isHiddenTree.value = false
  filterText.value = ''
  treeData.value = val
}, {
  deep: true
})

</script>
<style scoped lang="scss">
.analysis-header {
  display: flex;
  flex-direction: column;
  height: 64px;
  border-radius: 8px;
  background-color: var(--theme-card);
  .title {
    display: flex;
    align-items: center;
    flex: 1;
    padding-left: 24px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
  }
  .split-line {
    height: 1px;
    background-color: #e8e8e8;
  }
  .main-content {
    display: flex;
    justify-content: space-between;
    flex: 1;
    .left-content {
      display: flex;
      align-items: center;
      flex: 1;
      padding-left: 27px;
      .el-button + .el-button {
        margin-left: 0;
      }
      .el-button {
        font-size: 16px;
        color: var(--theme-text);
        &.is-link {
          padding: 0;
        }
        .icon {
          width: 25px;
          margin-right: 5px;
        }
      }
      .split-line {
        width: 1px;
        height: 32px;
        margin-left: 16px;
        margin-right: 17px;
        background-color: #e8e8e8;
      }
    }
    .right-content {
      display: flex;
      align-items: center;
      padding-right: 24px;
      .searchContainer {
        display: flex;
        position: relative;
        .customTreeContainer {
          display: flex;
          overflow: hidden;
          position: absolute;
          left: 0;
          top: 42px;
          z-index: 100;
          flex-direction: column;
          width: 321px;
          height: auto;
          max-height: 60vh;
          border-radius: 2px;
          box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2);
          :deep(.el-scrollbar) {
            display: flex;
            flex-direction: column;
            flex: 1;
            .el-scrollbar__wrap {
              flex: 1;
            }
          }
        }
        .customTree {
          box-sizing: border-box;
          width: 321px;
          padding: 8px 16px;
          :deep(.el-tree-node__content) {
            height: 38px;
          }
        }
      }
      .searchInput {
        width: 245px;
        margin-right: 12px;
      }
      .btns {
        display: flex;
        .el-button {
          width: 32px;
          padding: 0;
        }
        .el-button:hover {
          border-color: #d9d9d9;
          background: var(--theme-card);
          color: var(--theme-text);
        }
        .el-button:last-child {
          margin: 0;
        }
        .active {
          z-index: 999;
          background: rgba(85, 113, 223, 0.05);
          // border-color: var(--theme-primary);
          color: var(--theme-primary);
          &:hover {
            // border-color: var(--theme-primary);
            background: rgba(85, 113, 223, 0.05);
            color: var(--theme-primary);
          }
        }
        .iconfont {
          font-size: 20px;
        }
      }
    }
  }
  :deep(.el-tree-node__content) {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    user-select: none;
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
    .folderIcon,
    .fileIcon {
      width: 18px;
      margin-left: 7px;
      margin-right: 9px;
    }
  }
}
</style>
