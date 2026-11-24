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
            node-key="soleID"
            :draggable="true"
            default-expand-all
            :default-checked-keys="checkedIds"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
          >
            <template #default="{ node }">
              <div class="customTreeNode">
                <span class="treeLabel">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>

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
import { onMounted, ref, toRefs, watch } from 'vue'
import { ElMessage } from 'element-plus'
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
  }
})

const { checkedIds } = toRefs(props)
const emits = defineEmits(['close', 'handelSure'])
const filterText = ref('')
const treeRef = ref()
watch(filterText, (val) => {
  treeRef.value.filter(val)
})
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}
const handelSure = () => {
  const checkedNodes = treeRef.value.getCheckedNodes(false, false)
  const filterNodes = lodash.filter(checkedNodes, (n) => {
    return !n?.children
  })
  // 将非最后一级的选项筛掉,等待与后端协商
  const ids = []
  filterNodes.forEach((item) => {
    ids.push(item.soleID)
  })
  if (ids.length < 20) {
    emits('handelSure', { nodes: filterNodes, ids, type: 'addConditions' })
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
      padding-top: 4px !important;
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
:deep(.el-tree-node__expand-icon.expanded),
:deep(.el-tree-node__expand-icon) {
  position: absolute;
  right: 0;
}
:deep(.el-checkbox__input.is-checked .el-checkbox__inner,),
:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  border-color: #3670f8 !important;
  background-color: #3670f8 !important;
}
:deep(.el-tree-node__content),
.customTreeNode {
  height: 44px;
  user-select: none;
}
.treeLabel {
  line-height: 44px;
  font-weight: 400;
  font-size: 14px;
}
</style>
