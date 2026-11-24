<template>
  <div style=" position: relative; width: 100%; height: 100%;">
    <div class="fullBtn" @click="fullScreen" v-if="isFullShow">
      <i class="iconfont" :class="{ 'icon-quanpingxianshi': isfullScreen,'icon-baocunbingtuichu':!isfullScreen }"></i>
      <span>{{ isfullScreen ? '全屏显示' : '保存并退出全屏' }}</span>
    </div>
    <relation-graph ref="graphRef" :options="{...option,allowShowMiniToolBar:isFullShow}" @click="handleClick">
      <template v-slot:node="{ node }" >
        <graph :node="node" @delNodes="delNodes" @addNodes="addNodes" :treeList="treeList" :valueFileds="props.valueFileds" :isDisabled="isDisabled"></graph>
      </template>
    </relation-graph>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, reactive, watch, computed } from 'vue'
import { conditionalTreeQuery } from '@/api/api_export'
import RelationGraph from 'relation-graph/vue3'
import graph from './graph.vue'
import _ from 'lodash'
import { ElMessage } from 'element-plus'
const props = defineProps({
  studyCohort: {
    type: String,
    default: '0'
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  isFullShow: {
    type: Boolean,
    default: true
  },
  menuList: {
    type: Array,
    default: () => ([])
  },
  valueFileds: {
    type: String,
    default: 'id'
  }
})
const emit = defineEmits(['fullScreen'])

const isfullScreen = ref(true) // 是否全屏
const graphRef = ref(null)
const treeList = ref([])

const option = computed(() => {
  return {
  // 脉络图配置项
    backgrounImage: '',
    defaultLineWidth: 1,
    defaultJunctionPoint: 'lr',
    layouts: [
      {
        label: '中心',
        layoutName: 'tree',
        defaultNodeShape: 0,
        defaultLineShape: 5,
        min_per_width: '500',
        max_per_width: '500',
        max_per_height: 150,
        from: 'left'
      }
    ],
    defaultLineMarker: {
      markerWidth: 0,
      markerHeight: 0
    },
    disableZoom: true,
    backgroundColor: props.isDisabled ? '#FAFBFB' : '#F7F8F8',
    defaultNodeColor: props.isDisabled ? '#FAFBFB' : '#F7F8F8',
    hideNodeContentByZoom: false,
    disableDragNode: true,
    defaultFocusRootNode: false,
    centerOffset_y: 400,
    disableNodeClickEffect: true
  }
})

let conventionDataArr = reactive({
  rootId: '9999999999',
  nodes: [
    { id: '9999999999', data: { nodeType: 1, leafCondition: { indexId: '', name: '', value: '', condition: '', dataType: 3, valueList: [] }}}
  ],
  lines: []
})

const conventionDataArr2 = reactive({
  rootId: '9999999999',
  nodes: [
    { id: '9999999999', data: { nodeType: 1, leafCondition: { indexId: '', name: '', value: '', condition: '', dataType: 3, valueList: [] }}}
  ],
  lines: []
})

const getTree = () => {
  conditionalTreeQuery({ queueId: props.studyCohort }).then(res => {
    treeList.value = treeData(res.data)
  })
}

watch(() => [props.studyCohort, props.menuList], () => {
  initData()
})

const initData = () => {
  if (Array.isArray(props.menuList) && props.menuList.length > 0) {
    treeList.value = props.menuList
  } else {
    props.studyCohort && getTree()
  }
}

initData()

const treeData = (data) => {
  let tree = []

  function handlerData(dataTree) {
    dataTree.forEach(item => {
      if (item.indexList) {
        tree = tree.concat(item.indexList)
      }
      if (item.children && item.children.length > 0) {
        handlerData(item.children)
      }
    })
  }

  handlerData(data)
  return tree
}

onMounted(() => {
  setJsonData(conventionDataArr)
})

const delNodes = (id) => {
  let { nodes, lines, rootId } = conventionDataArr
  // 获取到点击父级节点
  const parentData = lines.find(it => it.to === id)
  if (parentData) {
  // 获取爷爷级的节点
    const parentDataParent = lines.find(it => it.to === parentData.from)

    // 获取爷爷节点的下标
    const index = lines.findIndex(it => it.to === parentData.from) || 0

    // 根据父节点或取另一个字节点
    const childrenLine = lines.find(it => (it.from === parentData.from && it.to !== id))
    // 删除当前节点及父级节点
    nodes = nodes.filter(it => ![parentData.from, id].includes(it.id)).map(it => {
      return { id: it.id, data: it.data }
    })
    // 删除关联链接线条
    lines = lines.filter(it => ![it.from, it.to].includes(parentData.from))
    // 判断父节点是否为根节点
    if (parentData.from === rootId) {
      rootId = childrenLine.to
    } else {
      // 将另一个节点链接到父级节点的父节之点下
      lines.splice(index, 0, {
        from: parentDataParent.from,
        to: childrenLine.to,
        lineShape: 5
      })
    }
    conventionDataArr = Object.assign({}, conventionDataArr, {
      rootId,
      nodes,
      lines
    })
    setJsonData(conventionDataArr)
  } else {
    reset()
  }
}

const addNodes = (id) => {
  let { nodes, lines, rootId } = conventionDataArr
  const findNodeIndex = nodes.findIndex(it => it.id === id) || nodes.length - 1
  // 获取到点击父级节点
  const parentData = lines.find(it => it.to === id)
  // 生成兄弟随机id
  const random = Math.floor(Math.random() * 10000000).toString()
  // 生成父级id
  const randomParent = Math.floor(Math.random() * 10000000).toString()
  nodes.splice(findNodeIndex, 0, {
    id: randomParent,
    data: { id: randomParent, nodeCondition: 'and', nodeType: 0 }
  })
  nodes.splice(findNodeIndex + 2, 0, {
    id: random,
    data: { id: random, nodeType: 1, leafCondition: { indexId: '', value: '', name: '', condition: '', dataType: 3, valueList: [] }}
  })

  const findLinesIndex = lines.findIndex(it => it.to === id)

  // 判断当前节点是否为根节点
  if (rootId === id) {
    rootId = randomParent
  } else {
    lines = lines.filter(it => it.to !== id)
    lines.splice(findLinesIndex, 0, { from: parentData.from, to: randomParent, lineShape: 5 })
  }
  lines.splice(findLinesIndex + 1, 0, { from: randomParent, to: id.toString(), lineShape: 5 })
  lines.splice(findLinesIndex + 2, 0, { from: randomParent, to: random, lineShape: 5 })
  nodes = nodes.map(it => {
    return {
      id: it.id,
      data: it.data
    }
  })
  conventionDataArr = Object.assign({}, conventionDataArr, {
    rootId,
    nodes,
    lines
  })

  setJsonData(conventionDataArr)
}

// 渲染图谱数据
const setJsonData = (data) => {
  nextTick(() => {
    graphRef.value?.setJsonData(data)
  })
}

const transfromData = () => {
  let { nodes, lines } = { ...conventionDataArr }
  // 设置父级id
  nodes = nodes.map(it => {
    const num = lines.find(item => Number(it.id) === Number(item.to))?.from
    it.data.parentId = num === undefined ? undefined : String(num)
    it.data.id = String(it.id)
    return it.data
  })
  // 定义递归函数，将分组后的数组转换为树级结构
  const arrayToTree = (arr, pid) => {
    return arr.reduce((res, current) => {
      if (current.parentId === pid) {
        const childrenData = arrayToTree(arr, current.id)
        current.childNodeList = childrenData.length ? childrenData : undefined
        return res.concat(current)
      }
      return res
    }, [])
  }
  // 将数组转换为树级结构
  const spliceData = arrayToTree(nodes, undefined) || {}
  return spliceData.length > 0 ? spliceData[0] : spliceData
}

const reset = () => {
  conventionDataArr = Object.assign({}, _.cloneDeep(conventionDataArr2))
  setJsonData(conventionDataArr)
}

const reduction = (data) => {
  conventionDataArr = Object.assign({}, changeCloneData(data))
  setJsonData(conventionDataArr)
}

const changeCloneData = (b) => {
  const nodes = []; const lines = []
  function handlerData (data) {
    nodes.push({ id: String(data.id), data })
    if (Array.isArray(data?.childNodeList) && data?.childNodeList.length > 0) {
      // data.obj = data.obj.reverse()
      data.childNodeList.forEach(element => {
        handlerData(element)
        lines.push({ from: String(data.id), to: String(element.id), lineShape: 5 })
      })
    }
  }
  handlerData(b)
  return {
    rootId: b.id,
    nodes,
    lines
  }
}

const fullScreen = () => {
  isfullScreen.value = !isfullScreen.value
  emit('fullScreen', isfullScreen.value)
}

const handleClick = () => {
  const dom = document.querySelector('.selectV2Graph .el-select__wrapper.is-focused')
  dom && dom?.click()
  // 移除dom的is-focused的class名
  dom && dom?.classList.remove('is-focused')
}

defineExpose({
  layout: () => { // 刷新布局
    nextTick(() => {
      graphRef.value.refresh()
    })
  },
  getData: () => { // 获取数据
    return transfromData()
  },
  resetData: () => { // 重置操作
    return reset()
  },
  reduction: (data) => { // 赋值操作
    return reduction(data)
  },
  obtainFlattenedData: () => { // 获取扁平化数据
    const { nodes } = { ...conventionDataArr }
    return nodes.filter(it => it.data?.leafCondition).map(item => item.data?.leafCondition)
  },
  whetherTheConditionsAreMet: (title = null) => {
    const { nodes } = { ...conventionDataArr }
    const data = nodes.filter(it => it.data?.leafCondition).map(item => item.data?.leafCondition)
    if (data.length <= 1) {
      const condition = (it) => (it.name && it.condition && ((!['', null, undefined].includes(it.value)) || (it.valueList.length > 0))) ||
  (!it.name && !it.condition && ((['', null, undefined].includes(it.value)) || (it.valueList.length === 0)))
  // 判断是否满足单条
      const conditionsMet = data.filter(it => !condition(it)).map(it => it.name)
      if (conditionsMet.length !== 0) {
        // ElMessage.error(`${title}下${conditionsMet.join('、')}未满足查询条件，请检查后再提交`)
        title && ElMessage.error(`${title}`)
        return false
      }
      return true
    }

    if (data.length > 1) {
      const condition = (it) => (it.name && it.condition && ((!['', null, undefined].includes(it.value)) || (it.valueList.length > 0)))
      // 判断是否满足单条
      const conditionsMet = data.filter(it => !condition(it)).map(it => it.name)
      if (conditionsMet.length !== 0) {
        // ElMessage.error(`${title}下${conditionsMet.join('、')}未满足查询条件，请检查后再提交`)
        title && ElMessage.error(`${title}`)
        return false
      }
      return true
    }

    return true
  }
})
</script>
<style lang="scss" scoped>
:deep(.relation-graph) {
  .rel-toolbar-v {
    width: 34px;
  }
  .rel-node-peel {
    padding: 0 !important;
  }
  .rel-toolbar {
    border: 1px solid #d8d8d8;
    border-radius: 4px;
    background-color: var(--theme-card);
    div[title="刷新"] {
      width: 14px;
      height: 14px;
      stroke-width: 24px;
      svg {
        transform: scale(0.9);
      }
    }
  }
  .rel-toolbar {
    right: v-bind("isfullScreen ? pxToRem(152) : pxToRem(194)");
    top: 24px;
    width: 152px;
    height: 32px;
    padding: 0 16px;
    box-shadow: none;

    @include childrenBetween();
    .c-mb-button {
      height: 24px !important;
      padding: 0;
      stroke: #666;
      &:first-child {
        display: none;
      }
      svg {
        width: 16px;
        height: 16px;
        fill: #666;
      }
    }
    >div {
      color: var(--theme-text-2);
      &:hover {
        background-color: unset;
      }
      &:last-child {
        display: none;
      }
    }
  }
}

.fullBtn {
  position: absolute;
  right: 24px;
  top: 24px;
  z-index: 99;
  box-sizing: border-box;
  height: 32px;
  padding: 0 16px;
  border: 1px solid #d8d8d8;
  border-radius: 4px;
  background-color: var(--theme-card);
  cursor: pointer;

  @include childrenCenter();
  span {
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
  }
  .iconfont {
    margin-right: 8px;
    font-size: 12px;
    color: var(--theme-text-2);
  }
}
</style>
