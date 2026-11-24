<template>
  <el-dialog title="选择审批负责人" v-model="visibleDialog" :width="pxToRem(718)" append-to-body class="promoter_person">
    <div class="person_body clear">
      <div class="person_left">
        <CommonInput v-model="searchVal" placeholder="请填写内容" class="search" clearable/>
        <div class="person_tree">
          <el-scrollbar style="height: 100%;">
            <el-checkbox-group v-model="checkedEmployessList">
              <!-- <el-checkbox name="disabled" value="Value disabled" disabled /> -->
              <el-tree ref="treeRef" :data="dataSource" node-key="id" default-expand-all :props="treeProps" :filter-node-method="filterNode">
                <template #default="{ data }">
                  <div class="custom-tree-node">
                    <i class="iconfont icon-wenjian" :class="{ 'checkoutColor': data.children.some(item => checkedEmployessList.length && checkedEmployessList[0].name === item.name) }" v-if="data.children"></i>
                    <el-checkbox :value="data" v-else :disabled="checkedEmployessList.length && checkedEmployessList[0].name !== data.name"/>
                    <!-- <p v-show-tip :title="data.name">{{ data.name }}</p> -->
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
                        <p class="treeLabel">{{ data.name }}</p>
                      </el-tooltip>
                    </div>
                  </div>
                </template>
              </el-tree>

            </el-checkbox-group>
          </el-scrollbar>
        </div>
      </div>
      <div class="person_right">
        <div class="select_box_title">
          <span>已选：{{ checkedEmployessList.length }}人 </span>
          <span @click="checkedEmployessList=[]">清空</span>
        </div>
        <div class="select_box_list">
          <div class="select_box_item" v-for="(item, index) in checkedEmployessList" :key="index">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content=" item.name "
              placement="bottom"
              :open-delay="400"
              :enterable="false"
              :hide-after="0"
            >
              <span class="select_box_item_left">{{ item.name }}</span>
            </el-tooltip>

            <i class="iconfont icon-guanbi1" @click="checkedEmployessList.splice(index, 1)"></i>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible',false)">取 消</el-button>
      <el-button type="primary" @click="saveDialog">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { getDepartmentUserByAgencyId } from '@/api/api_scientific'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Array,
    default: () => []
  },
  agencyId: {
    type: String,
    required: true
  }
})
const emits = defineEmits(['update:visible', 'change'])

const treeProps = ref({
  children: 'children',
  label: 'name'
})
const searchVal = ref('')
const treeRef = ref(null)

const dataSource = ref([])

const checkedEmployessList = ref([])

const visibleDialog = computed({
  get() {
    return props.visible
  },
  set() {
    closeDialog()
  }
})

watch(searchVal, (val) => {
  treeRef.value?.filter(val)
})

watch(() => props.visible, (val) => {
  if (val) {
    checkedEmployessList.value = JSON.parse(JSON.stringify(props.data)) || []
  }
})

watch(() => props.agencyId, () => {
  getDepartmentUserByAgencyIdApi()
})

const filterNode = (value, data, node) => {
  if (!value) return true
  const _array = [] // 这里使用数组存储 只是为了存储值。
  getReturnNode(node, _array, value)
  let result = false
  _array.forEach(item => {
    result = result || item
  })
  return result
}

const getReturnNode = (node, _array, value) => {
  const isPass = node.data && node.data.name && node.data.name.indexOf(value) !== -1
  isPass ? _array.push(isPass) : ''
  if (!isPass && node.level !== 1 && node.parent) {
    getReturnNode(node.parent, _array, value)
  }
}

const closeDialog = () => {
  emits('update:visible', false)
}

const saveDialog = () => {
  emits('change', checkedEmployessList.value)
}

const getDepartmentUserByAgencyIdApi = async () => {
  const res = await getDepartmentUserByAgencyId({ id: props.agencyId })
  if (res.code === 10000) {
    console.log(res.data)
    dataSource.value = res.data
  }
}

getDepartmentUserByAgencyIdApi()
// const delList = () => {
//   checkedEmployessList.value = []
// }
</script>
<style lang="scss" scoped>
.person_body {
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  height: 387px;
  font-family: "San francisco", PingFangSC-Light, sans-serif;
  .person_left,
  .person_right {
    width: 327px;
    border: 1px solid #d8d8d8;
  }
  .person_left {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 16px;
    :deep(.el-input__inner) {
      font-family: "San francisco", PingFangSC-Light, sans-serif;
      font-size: 12px;
    }
    .search {
      margin-bottom: 8px;
    }
    .person_tree {
      overflow: hidden;
      flex: 1;
      :deep(.el-tree-node__expand-icon.expanded) {
        position: absolute;
        right: 0;
        transform: rotate(90deg);
      }
      :deep(.el-tree-node__expand-icon) {
        position: absolute;
        right: 0;
        // transform: rotate(180deg);
      }

      :deep(.el-checkbox__input.is-checked .el-checkbox__inner,),
      :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
        border-color: var(--theme-primary) !important;
        background-color: var(--theme-primary) !important;
      }
      :deep(.el-tree-node__content) {
        .custom-tree-node {
          display: flex;
          overflow: hidden;
          align-items: center;
          width: 100%;
          height: 100%;
          i {
            margin-right: 10px;
            font-size: 14px;
            color: #959595;
          }
          .el-checkbox {
            margin-right: 4px;
          }
          .checkoutColor {
            color: var(--theme-primary);
          }
          p {
            display: inline-block;
            overflow: hidden;
            max-width: 240px;
            line-height: 32px;
            text-overflow: ellipsis;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text-2);
            white-space: nowrap;
          }
        }
      }
      :deep(.el-tree-node__content),
      .customTreeNode {
        display: flex;
        align-items: center;
        height: 36px;
        user-select: none;
        span {
          color: var(--theme-text-2);
        }
      }
    }
  }
  .person_right {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    .select_box_title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      padding: 0 16px;
      background: rgba(54, 112, 248, 0.05);
      span {
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text);
        &:last-child {
          cursor: pointer;
          color: var(--theme-primary);
        }
      }
    }
    .select_box_list {
      flex: 1;
      width: 100%;
      .select_box_item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0 16px;
        line-height: 36px;
        i {
          cursor: pointer;
          font-size: 10px;
          color: var(--theme-text-3);
        }
        .select_box_item_left {
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-2);
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
