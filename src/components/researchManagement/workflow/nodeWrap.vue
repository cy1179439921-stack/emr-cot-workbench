<template>
  <div class="node-wrap" v-if="nodeConfig.type < 3">
    <div class="node-wrap-box" :class="(nodeConfig.type === 0 ? 'start-node ' : '') +(isTried && nodeConfig.error ? 'active error' : '')">
      <div class="title" :style="`background: ${bgColors[nodeConfig.type]};`">
        <span v-if="nodeConfig.type === 0">{{ nodeConfig.name }}</span>
        <template v-else>
          <el-input v-if="isInput" :maxlength="15" v-model="nodeConfig.name" :placeholder="defaultText" class="ant-input editable-title-input" @keyup.enter="blurEvent()" @blur="blurEvent()" @focus="$event.currentTarget.select()" v-focus clearable/>
          <span v-else class="editable-title">{{ nodeConfig.name || '审批' }}</span>
          <i class="iconfont icon-bianji3" v-if="!isInput" @click="clickEvent()"></i>
          <i class="iconfont icon-guanbi1" v-if="!isInput" @click="isMask = true"></i>
        </template>
      </div>
      <div class="content" @click="setPerson">
        <div class="text">
          <span class="placeholder" v-if="!showText">请选择{{defaultText}}</span>
          {{showText}}
        </div>
        <i class="iconfont icon-right" v-if="nodeConfig.type"></i>
      </div>
      <el-tooltip
        class="box-item"
        effect="dark"
        content="请设置审批人"
        placement="bottom"
        :open-delay="400"
        :enterable="false"
        :hide-after="0"
      >
        <i class="iconfont icon-tishi1 error_tip" v-if="isTried && nodeConfig.error"></i>
      </el-tooltip>
      <div class="mask" v-if="isMask">
        <span class="btn-text" @click="isMask = false">取 消</span>
        <span class="btn-text" @click="delNode">删 除</span>
      </div>
    </div>
    <addNode v-model:childNodeP="nodeConfig.childNode"/>
  </div>
  <!-- <div class="branch-wrap" v-if="nodeConfig.type === 4">
    <div class="branch-box-wrap">
      <div class="branch-box">
        <button class="add-branch" @click="addTerm">添加条件</button>
        <div class="col-box" v-for="(item, index) in nodeConfig.conditionNodes" :key="index">
          <div class="condition-node">
            <div class="condition-node-box">
              <div class="auto-judge" :class="isTried && item.error ? 'error active' : ''">
                <div class="sort-left" v-if="index !== 0" @click="arrTransfer(index, -1)">&lt;</div>
                <div class="title-wrapper">
                  <input
                    v-if="isInputList[index]"
                    type="text"
                    class="ant-input editable-title-input"
                    @blur="blurEvent(index)"
                    @focus="$event.currentTarget.select()"
                    v-focus
                    v-model="item.name"
                  />
                  <span v-else class="editable-title" @click="clickEvent(index)">{{ item.name }}</span>
                  <span class="priority-title" @click="setPerson(item.priorityLevel)">优先级{{ item.priorityLevel }}</span>
                  <i class="anticon anticon-close close" @click="delTerm(index)"></i>
                </div>
                <div class="sort-right" v-if="index !== nodeConfig.conditionNodes.length - 1" @click="arrTransfer(index)">&gt;</div>
                <div class="content" @click="setPerson(item.priorityLevel)">{{ $func.conditionStr(nodeConfig, index) }}</div>
                <div class="error_tip" v-if="isTried && item.error">
                  <i class="iconfont icon-tishi1"></i>
                </div>
              </div>
              <addNode v-model:childNodeP="item.childNode" />
            </div>
          </div>
          <nodeWrap v-if="item.childNode" v-model:nodeConfig="item.childNode" />
          <template v-if="index === 0">
            <div class="top-left-cover-line"></div>
            <div class="bottom-left-cover-line"></div>
          </template>
          <template v-if="index === nodeConfig.conditionNodes.length - 1">
            <div class="top-right-cover-line"></div>
            <div class="bottom-right-cover-line"></div>
          </template>
        </div>
      </div>
      <addNode v-model:childNodeP="nodeConfig.childNode" />
    </div>
  </div> -->
  <nodeWrap v-if="nodeConfig.childNode" v-model:nodeConfig="nodeConfig.childNode" :isEdit="isEdit" :flowPermission="flowPermission" :departmentOptions="departmentOptions"/>
</template>
<script setup>
import { onMounted, ref, watch, getCurrentInstance, computed, toRefs } from 'vue'
import $func from '@/utils/fun'
import { useStore } from '@/store/workflow'
import addNode from './addNode.vue'
const _uid = getCurrentInstance().uid
const bgColors = ['#C5C4C4', '#3670F8', '50, 150, 250']
const placeholderList = ['发起人', '审批', '抄送人']
const props = defineProps({
  nodeConfig: {
    type: Object,
    default: () => ({})
  },
  flowPermission: {
    type: [Object, Array],
    default: () => ([])
  },
  isEdit: {
    type: Boolean,
    default: true
  },
  departmentOptions: {
    type: Array,
    default: () => []
  }
})
const isMask = ref(false)
const { nodeConfig } = toRefs(props)

const defaultText = computed(() => {
  return placeholderList[props.nodeConfig.type]
})
const showText = computed(() => {
  if (props.nodeConfig.type === 0) return $func.arrToStr(props.flowPermission) || '提交人：全员'
  if (props.nodeConfig.type === 1) return $func.setApproverStr(props.nodeConfig, props.departmentOptions)
  return $func.copyerStr(props.nodeConfig)
})

const isInputList = ref([])
const isInput = ref(false)
const resetConditionNodesErr = () => {
  for (let i = 0; i < props.nodeConfig.conditionNodes.length; i++) {
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeConfig.conditionNodes[i].error = $func.conditionStr(props.nodeConfig, i) === '请设置条件' && i !== props.nodeConfig.conditionNodes.length - 1
  }
}
onMounted(() => {
  if (props.nodeConfig.type === 1) {
    console.log('走了走了', props.departmentOptions)
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeConfig.error = !$func.setApproverStr(props.nodeConfig, props.departmentOptions)
  } else if (props.nodeConfig.type === 2) {
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeConfig.error = !$func.copyerStr(props.nodeConfig)
  } else if (props.nodeConfig.type === 4) {
    resetConditionNodesErr()
  }
})
const emits = defineEmits(['update:flowPermission', 'update:nodeConfig'])
const store = useStore()
const {
  // setPromoter,
  setApprover,
  setCopyer,
  setCondition,
  // setFlowPermission,
  setApproverConfig,
  setCopyerConfig,
  setConditionsConfig
} = store
const isTried = computed(() => store.isTried)
const flowPermission1 = computed(() => store.flowPermission1)
const approverConfig1 = computed(() => store.approverConfig1)
const copyerConfig1 = computed(() => store.copyerConfig1)
const conditionsConfig1 = computed(() => store.conditionsConfig1)
watch(flowPermission1, (flow) => {
  if (flow.flag && flow.id === _uid) {
    emits('update:flowPermission', flow.value)
  }
})
watch(approverConfig1, (approver) => {
  if (approver.flag && approver.id === _uid) {
    emits('update:nodeConfig', approver.value)
  }
})
watch(copyerConfig1, (copyer) => {
  if (copyer.flag && copyer.id === _uid) {
    emits('update:nodeConfig', copyer.value)
  }
})
watch(conditionsConfig1, (condition) => {
  if (condition.flag && condition.id === _uid) {
    emits('update:nodeConfig', condition.value)
  }
})

const clickEvent = (index) => {
  console.log('clickEvent', index)
  if (index || index === 0) {
    isInputList.value[index] = true
  } else {
    isInput.value = true
  }
}
const blurEvent = (index) => {
  if (index || index === 0) {
    isInputList.value[index] = false
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeConfig.conditionNodes[index].name = props.nodeConfig.conditionNodes[index].name || '条件'
  } else {
    isInput.value = false
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeConfig.name = props.nodeConfig.name || defaultText.value
  }
}
const delNode = () => {
  emits('update:nodeConfig', props.nodeConfig.childNode)
  isMask.value = false
}
// const addTerm = () => {
//   const len = props.nodeConfig.conditionNodes.length + 1
//   // eslint-disable-next-line vue/no-mutating-props
//   props.nodeConfig.conditionNodes.push({
//     name: '条件' + len,
//     type: 3,
//     priorityLevel: len,
//     conditionList: [],
//     nodeUserList: [],
//     childNode: null
//   })
//   resetConditionNodesErr()
//   emits('update:nodeConfig', props.nodeConfig)
// }
// const delTerm = (index) => {
//   // eslint-disable-next-line vue/no-mutating-props
//   props.nodeConfig.conditionNodes.splice(index, 1)
//   props.nodeConfig.conditionNodes.map((item, index) => {
//     item.priorityLevel = index + 1
//     item.name = `条件${index + 1}`
//     return item
//   })
//   resetConditionNodesErr()
//   emits('update:nodeConfig', props.nodeConfig)
//   if (props.nodeConfig.conditionNodes.length === 1) {
//     if (props.nodeConfig.childNode) {
//       if (props.nodeConfig.conditionNodes[0].childNode) {
//         reData(props.nodeConfig.conditionNodes[0].childNode, props.nodeConfig.childNode)
//       } else {
//         // eslint-disable-next-line vue/no-mutating-props
//         props.nodeConfig.conditionNodes[0].childNode = props.nodeConfig.childNode
//       }
//     }
//     emits('update:nodeConfig', props.nodeConfig.conditionNodes[0].childNode)
//   }
// }
// const reData = (data, addData) => {
//   if (!data.childNode) {
//     data.childNode = addData
//   } else {
//     reData(data.childNode, addData)
//   }
// }
const setPerson = (priorityLevel) => {
  const { type } = props.nodeConfig
  console.log('setPerson', type)
  // if (type === 0) {
  //   setApprover(true)
  //   setApproverConfig({
  //     value: {
  //       ...JSON.parse(JSON.stringify(props.nodeConfig)),
  //       ...{ auditPersonType: props.nodeConfig.auditPersonType }
  //     },
  //     flag: false,
  //     id: _uid
  //   })
  // } else
  if (type === 1) {
    setApprover(true)
    setApproverConfig({
      value: {
        ...JSON.parse(JSON.stringify(props.nodeConfig)),
        ...{ auditPersonType: props.nodeConfig.auditPersonType }
      },
      flag: false,
      id: _uid
    })
  } else if (type === 2) {
    setCopyer(true)
    setCopyerConfig({
      value: JSON.parse(JSON.stringify(props.nodeConfig)),
      flag: false,
      id: _uid
    })
  } else {
    setCondition(true)
    setConditionsConfig({
      value: JSON.parse(JSON.stringify(props.nodeConfig)),
      priorityLevel,
      flag: false,
      id: _uid
    })
  }
}
// const arrTransfer = (index, type = 1) => {
//   // 向左-1,向右1
//   // eslint-disable-next-line vue/no-mutating-props
//   props.nodeConfig.conditionNodes[index] = props.nodeConfig.conditionNodes.splice(index + type, 1, props.nodeConfig.conditionNodes[index])[0]
//   props.nodeConfig.conditionNodes.map((item, index) => {
//     item.priorityLevel = index + 1
//     return item
//   })
//   resetConditionNodesErr()
//   emits('update:nodeConfig', props.nodeConfig)
// }
</script>
<style lang="scss">
.error_tip {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 18px;
  transform: translate(150%, 0);
}

.promoter_person .el-dialog__body {
  padding: 10px 20px 14px 20px;
}

.selected_list {
  overflow: hidden;
  flex: inherit;
  margin-left: 16px;
}

.selected_list span {
  display: flex;
  overflow: hidden;
  align-items: center;
  max-width: 300px;
  padding: 6px 10px;
  border-radius: 2px;
  background: var(--theme-fill);
  text-overflow: ellipsis;
  color: var(--theme-text);
  white-space: nowrap;
  div,
  p {
    overflow: hidden;
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.selected_list i {
  margin-left: 6px;
  cursor: pointer;
  font-size: 8px !important;
  color: #303133;
}
.icon-tishi1 {
  color: var(--el-color-error);
}
</style>
