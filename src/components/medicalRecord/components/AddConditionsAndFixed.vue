<template>
  <div class="content-medicalRecord">
    <el-dialog
      :model-value="true"
      destroy-on-close
      title="添加查询条件"
      :width="pxToRem(680)"
      class="dialogDIV"
      @close="emits('close')"
    >
      <div class="dialogContent">
        <div class="leftTreeContaienr">
          <CommonInput
            v-model="filterText"
            placeholder="搜索名称"
            class="search"
            clearable
          />
          <div class="treeContainer">
            <el-scrollbar style="height: 100%;">
              <el-tree
                ref="treeRef"
                :data="treeSource"
                show-checkbox
                :indent="indent"
                node-key="id"
                @check="changeChecked"
                default-expand-all
                :default-checked-keys="checkedIds"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
              >
                <template #default="{ node }">
                  <div class="customTreeNode" v-show-tip>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      :content=" node.label "
                      placement="bottom"
                      :open-delay="400"
                      :enterable="false"
                      :hide-after="0"
                    >
                      <div class="treeLabel">{{ node.label }}</div>
                    </el-tooltip>
                  </div>
                </template>
              </el-tree>
            </el-scrollbar>
          </div>
        </div>
        <div class="queryConditionCotainer">
          <el-scrollbar>
            <div class="pd16">
              <div class="title">已选择</div>
              <div class="showConditionContaienr">
                <template v-for="(item) in checkedNodes" :key="item.id">
                  <div class="showConditionItem">
                    <el-tooltip
                      popper-class="bottom-end-popper"
                      effect="dark"
                      :content="item.init?'取消固定查询条件':'固定查询条件'"
                      placement="bottom"
                    >
                      <i :class="{iconfont:true, 'icon-guding':true,fixed:item.init}" @click="handelFixed(item)"></i>
                    </el-tooltip>
                    <div v-show-tip class="labelContainer">
                      <el-tooltip
                        popper-class="bottom-end-popper"
                        effect="dark"
                        :content="item.label"
                        placement="bottom"
                      >
                        <div class="label">{{ item.label }}</div>
                      </el-tooltip>
                    </div>
                  </div>
                </template>
              </div>
              <div class="blank">
              </div>
              <div class="fixedQueryConditionContainer">
                <div class="fixedTitle">
                  <i class="iconfont icon-guding"></i>
                  <span>固定查询条件</span>
                </div>
                <div class="allFixedCondition">
                  <div v-for="item in fixedArr" :key="item.id" class="fixedConditionItem">
                    <!-- <span class="label">{{ item.label }}</span> -->
                    <div v-show-tip class="labelContainer">
                      <el-tooltip
                        popper-class="bottom-end-popper"
                        effect="dark"
                        :content="item.label"
                        placement="bottom"
                      >
                        <div class="label">{{ item.label }}</div>
                      </el-tooltip>
                    </div>
                    <i class="iconfont icon-shanchu1" @click="handeDelete(item)"></i>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <template #footer>
        <div class="footer">
          <div class="common-btn" @click="emits('close')">取 消</div>
          <div class="common-btn primary btnSpace" @click="handelSure">确 定</div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="addConditions">
// eslint-disable-next-line no-unused-vars
import { onMounted, ref, toRefs, watch, onUnmounted } from 'vue'
import { echartsToPx } from '@/utils/utils.js'
import { ElMessage } from 'element-plus'
import { saveFixedQueryCondition } from '@/api/api_homePage.js'
import lodash from 'lodash'
const props = defineProps({
  checkedIds: {
    type: Array,
    default: () => {
      return []
    }
  },
  treeSource: {
    type: Array,
    default: () => {
      return []
    }
  },
  searchArr: {
    type: [Array],
    default: () => {
      return []
    }
  },
  searchInit: {
    type: [Array],
    default: () => {
      return []
    }
  },
  fixedType: {
    type: Number,
    default: () => {
      return 3
    }
  },
  length: {
    type: Number,
    default: () => {
      return 2
    }
  }
})
const { checkedIds, treeSource } = toRefs(props)
const checkedNodes = ref([])
checkedNodes.value = lodash.cloneDeep(props.searchArr)
checkedNodes.value.splice(0, props.length)
const emits = defineEmits(['close', 'handelSure'])
const filterText = ref('')
const treeRef = ref()
watch(filterText, (val) => {
  treeRef.value.filter(val)
})
onMounted(() => {
  window.addEventListener('resize', resizeHeight)
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeHeight)
})
const indent = ref(echartsToPx(20))
const resizeHeight = () => {
  indent.value = echartsToPx(20)
}
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

const changeChecked = (obj) => {
  const newCheckedNodes = treeRef.value.getCheckedNodes(false, false)
  lodash.remove(newCheckedNodes, (n) => {
    return n.children
  })
  checkedNodes.value = lodash.cloneDeep(newCheckedNodes)
  checkedNodes.value.forEach(item => {
    const index = lodash.findIndex(fixedArr.value, { id: item.id })
    if (index > -1) {
      item.init = true
    }
  })
}
const fixedArr = ref([])
fixedArr.value = lodash.cloneDeep(props.searchInit)
const handelFixed = (obj) => {
  const index = lodash.findIndex(fixedArr.value, { id: obj.id })
  if (index > -1) {
    fixedArr.value.splice(index, 1)
    obj.init = false
  } else {
    fixedArr.value.push(obj)
    obj.init = true
  }
}
const handeDelete = (obj) => {
  const index = lodash.findIndex(fixedArr.value, { id: obj.id })
  const oprationObj = fixedArr.value[index]
  checkedNodes.value.forEach(item => {
    if (item.id === oprationObj.id) {
      item.init = false
    }
  })
  fixedArr.value.splice(index, 1)
}
const handelSure = () => {
  // const checkedNodesArr = treeRef.value.getCheckedNodes(false, false)
  // const filterNodes = lodash.filter(checkedNodesArr, (n) => {
  //   return !n?.children
  // })
  const ids = []
  checkedNodes.value.forEach((item) => {
    ids.push(item.id)
    const index = lodash.findIndex(fixedArr.value, { id: item.id })
    if (index > -1) {
      item.init = true
    } else {
      item.init = false
    }
  })
  if (ids.length < 20) {
    const params = {
      filterItemContent: JSON.stringify(fixedArr.value),
      type: props.fixedType
    }
    saveFixedQueryCondition(params).then(res => {
      if (res.code === 10000) {
        emits('handelSure', {
          nodes: checkedNodes.value,
          fixedArr: fixedArr.value,
          ids,
          type: 'addConditions'
        })
      }
    })
  } else {
    ElMessage.warning('超过允许搜索项个数上限20个!请重新选择')
  }
}
</script>
<style lang="scss" scoped>
.content-medicalRecord {
  :deep(.dialogDIV) {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    height: 60vh;
    .el-dialog__header {
      display: v-bind(headerIsShow);
    }
    .el-dialog__body {
      display: flex;
      overflow: hidden;
      flex-direction: column;
    }
  }
  .treeContainer {
    overflow: hidden;
    flex: 1;
    box-sizing: border-box;
    padding: 10px 0;
  }
  .footer {
    display: flex;
    align-items: center;
  }
}
:deep(.el-tree) {
  background: transparent;
}
:deep(.el-tree-node__expand-icon.expanded),
:deep(.el-tree-node__expand-icon) {
  position: absolute;
  right: 0;
}
:deep(.el-checkbox__input.is-checked .el-checkbox__inner,),
:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  border-color: var(--theme-primary) !important;
  background-color: var(--theme-primary) !important;
}
:deep(.el-tree-node__content),
.customTreeNode {
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  user-select: none;
}
.treeLabel {
  overflow: hidden; /* 隐藏溢出内容 */
  flex: 1;
  line-height: 44px;
  text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
  font-weight: 400;
  font-size: 14px;
  white-space: nowrap;
}
.dialogContent {
  display: flex;
  align-items: center;
  height: 100%;
  .leftTreeContaienr {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 263px;
    height: 100%;
    margin-right: 12px;
    padding: 16px;
    border: 1px  solid #d8d8d8;
    border-radius: 2px;
    background-color: var(--theme-fill);
    .treeContainer {
      flex: 1;
    }
  }
  .queryConditionCotainer {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 364px;
    height: 100%;
    padding: 16px 0;
    border: 1px  solid #d8d8d8;
    border-radius: 2px;
    background-color: var(--theme-fill);
    .pd16 {
      padding: 0 16px;
    }
    .title {
      margin-bottom: 16px;
      line-height: 20px;
      font-weight: 500;
      font-size: 14px;
      color: var(--theme-primary);
    }
    .showConditionContaienr {
      display: flex;
      flex-wrap: wrap;
      .showConditionItem {
        display: flex;
        align-items: center;
        width: calc(50% - 5px);
        height: 20px;
        margin-right: 10px;
        margin-bottom: 16px;
        &:nth-of-type(2n) {
          margin-right: 0;
        }
        .labelContainer {
          overflow: hidden;
          flex: 1;
        }
        .label {
          overflow: hidden; /* 隐藏溢出内容 */
          margin: 0 8px;
          user-select: none;
          line-height: 20px;
          text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-2);
          white-space: nowrap;
        }
        i {
          cursor: pointer;
          user-select: none;
          line-height: 14px;
          font-weight: 400;
          font-size: 14px;
          color: #bfbfbf;
          &.fixed {
            color: #f59f0c;
          }
        }
      }
    }
    .blank {
      flex: 1;
    }
    .fixedQueryConditionContainer {
      position: sticky;
      box-sizing: border-box;
      width: 100%;
      min-height: 217px;
      padding: 16px;
      padding-bottom: 0;
      border: 1px solid #d8d8d8;
      background: var(--theme-card);
      .fixedTitle {
        margin-bottom: 14px;
        line-height: 20px;
        font-weight: 500;
        font-size: 14px;
        color: #f59f0c;
        i {
          font-size: 14px;
        }
        span {
          margin-left: 7px;
        }
      }
      .allFixedCondition {
        display: flex;
        flex-wrap: wrap;
      }
      .fixedConditionItem {
        display: flex;
        align-items: center;
        width: calc(50% - 5px);
        margin-right: 10px;
        margin-bottom: 16px;
        &:nth-of-type(2n) {
          margin-right: 0;
        }
        .labelContainer {
          overflow: hidden;
          flex: 1;
        }
        .label {
          overflow: hidden; /* 隐藏溢出内容 */
          margin-right: 8px;
          user-select: none;
          line-height: 20px;
          text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-2);
          white-space: nowrap;
        }
        i {
          cursor: pointer;
          font-size: 12px;
          color: #ff4e4e;
        }
      }
    }
  }
}

</style>
