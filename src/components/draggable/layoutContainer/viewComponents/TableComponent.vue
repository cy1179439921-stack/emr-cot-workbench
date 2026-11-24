<template>
  <div class="text-container" v-show="isShow">
    <span class="lable" :style="style">{{ name }}</span>
    <template v-if="isSpenction">
      <el-table :data="value" class="table">
        <el-table-column :prop="item" :label="item" v-for="item in headerTitle" :key="item">
          <template v-slot="scope">
            <el-input v-model="scope.row[item]" class="el-input" v-if="isEdit"></el-input>
            <span :title="scope.row[item]" style="line-height: 34px; white-space: nowrap;" v-else>{{ scope.row[item] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template v-else>
      <table ref="table" :border="1" cellpadding="5%">
        <tr v-for="(r,index) in data.option.tableData" :key="index">
          <template v-for="(item,tdIndex) in r">
            <td
              v-if="!item.isMerge"
              :key="tdIndex"
              :class="[item.isSelect && preview && !isDisable ? 'select' : '']"
              :rowspan="item.rowspan"
              :colspan="item.colspan"
              @mousemove="moveAction(item.x,item.y)"
              @mousedown.left="downAction(item.x,item.y)"
              @mousedown.right="downActionOnOneTd(item.x,item.y)"
              @mouseup.left="upAction"
              @contextmenu="menuShow">
              <!-- 判断是创建还是渲染 -->
              <template v-if="isDisable">
                <span>{{item.name}}</span>
              </template>
              <template v-else>
                <el-input v-model="item.name" class="mergeInp" v-if="preview"/>
                <template v-else>
                  <template v-if="isEdit">
                    <span v-if="item.name !== ''">{{item.name}}</span>
                    <el-input v-model="value[index][tdIndex]" class="mergeInp" v-else/>
                  </template>
                  <template v-else>
                    <span v-if="item.name !== ''">{{item.name}}</span>
                    <template v-else>
                      <span >{{value[index][tdIndex] || ''}}</span>
                    </template>
                  </template>
                </template>
              </template>
            </td>
          </template>
        </tr>
      </table>
    </template>

    <Menu
      v-show="dataObj.isShowMenu && isMenuShow && preview"
      ref="menu"
      :top="dataObj.menuTop"
      :left="dataObj.menuLeft"
      :show-menu="dataObj.isShowMenu && isMenuShow"
      @deleteRow="deleteRow"
      @insertColumn="insertColumn"
      @deleteColumn="deleteColumn"
      @insertRow="insertRow"
      @mergeTd="mergeTd"
      @breakTd="breakTd"
    />
  </div>
</template>

<script setup>
import Menu from '@/components/draggable/layoutContainer/viewComponents/Menu.vue'
// import _ from 'lodash'
import { reactive, watch, onMounted, onUnmounted, ref, nextTick, toRefs, computed } from 'vue'
const name = computed(() => {
  return data.value.option?.name || '字段名'
})

const menu = ref()
const props = defineProps({
  data: {
    type: Object
  },
  mergeTableData: {
    type: Array,
    default: () => ([])
  },
  isMenuShow: {
    type: Boolean,
    default: true
  },
  axiosCellData: {
    type: Array,
    default: () => ([])
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  preview: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: true
  },
  isDisable: {
    type: Boolean,
    default: false
  }
})

const style = computed(() => {
  return data.value?.style || {}
})

const value = ref([])
const headerTitle = ref([])
const isSpenction = ref(false)
const { data, formData } = toRefs(props)

try {
  if (formData.value[name.value] && formData.value?.isSpenction) {
    isSpenction.value = true
    headerTitle.value = formData.value?.[name.value]?.header || []
    value.value = formData.value?.[name.value]?.data || []
  } else if (formData.value[name.value] && !formData.value?.isSpenction) {
    value.value = JSON.parse(formData.value[name.value])
  } else {
    const { localRow, localColumn } = data.value.option
    const tableData = []
    for (let r = 0; r < localRow; r++) {
      const arr = []
      for (let col = 0; col < localColumn; col++) {
        arr.push('')
      }
      tableData.push(arr)
    }
    value.value = tableData
  }
} catch (error) {
  const { localRow, localColumn } = data.value.option
  const tableData = []
  for (let r = 0; r < localRow; r++) {
    const arr = []
    for (let col = 0; col < localColumn; col++) {
      arr.push('')
    }
    tableData.push(arr)
  }
  value.value = tableData
}

watch(() => value, (val) => {
  if (isSpenction.value) {
    formData.value[name.value] = {
      header: headerTitle.value,
      data: val.value
    }
  } else {
    formData.value[name.value] = JSON.stringify(val.value)
  }
}, { deep: true })

const dataObj = reactive({
  isMouse: false,
  // 选中的坐标
  position: {
    x: {
      from: -1,
      to: -1
    },
    y: {
      from: -1,
      to: -1
    }
  },
  menuTop: 0,
  menuLeft: 0,
  isShowMenu: false,
  beMergeCell: [],
  mergeCell: []
})

watch([() => data.value.option.localRow, () => data.value.option.localColumn], () => {
  renderTable()
})

watch(() => dataObj.position, (newName, oldName) => {
  if (typeof oldName === 'undefined') {
    return
  }
  if (newName.x.from === -1 && oldName.x.from !== -1) {
    return
  }
  data.value.option.tableData = makeTableData()
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    document.addEventListener('click', menuClose)
  })
})

onUnmounted(() => {
  document.removeEventListener('click', menuClose)
})

const initTable = () => {
  if (data.value.option.tableData.length === 0) {
    renderTable()
  }
}

const renderTable = () => {
  const { localRow, localColumn } = data.value.option
  const tableData = []
  for (let r = 0; r < localRow; r++) {
    const arr = []
    for (let col = 0; col < localColumn; col++) {
      const obj = {
        value: `${r}:${col}`,
        x: r,
        y: col,
        isSelect: false,
        rowspan: 1,
        colspan: 1,
        isMerge: false,
        name: ''
      }
      arr.push(obj)
    }
    tableData.push(arr)
  }
  data.value.option.tableData = tableData
}

initTable()

const downActionOnOneTd = (x, y) => {
  const {
    x: { from: xFrom, to: xTo },
    y: { from: yFrom, to: yTo }
  } = dataObj.position
  if (xFrom - xTo !== 0 || yFrom - yTo !== 0) { return }
  positionXY(x, y)
}

const positionXY = (x, y) => {
  dataObj.position.x.from = x
  dataObj.position.y.from = y
  dataObj.position.x.to = x
  dataObj.position.y.to = y
}

const menuShow = (event) => {
  if (!props.isDisable) {
    dataObj.isShowMenu = false
    nextTick(() => {
      event.preventDefault()
      const { clientX, clientY } = event
      if (document.body.clientWidth - clientX < 150) {
        dataObj.menuLeft = clientX - 150
      } else {
        dataObj.menuLeft = clientX
      }
      if (document.body.clientHeight - clientY < 240) {
        dataObj.menuTop = clientY - 240
      } else {
        dataObj.menuTop = clientY
      }
      dataObj.isShowMenu = true
    })
  }
}

const menuClose = () => {
  dataObj.isShowMenu = false
}

const downAction = (x, y) => {
  menuClose()
  if (!props.preview || props.isDisable) {
    return
  }
  dataObj.isMouse = true
  positionXY(x, y)
}

const moveAction = (x, y) => {
  if (dataObj.isMouse) {
    dataObj.position.x.to = x
    dataObj.position.y.to = y
  }
}

const upAction = () => {
  dataObj.isMouse = false
}

const updateBeMergeCell = () => {
  dataObj.beMergeCell.length = 0
  for (let i = 0; i < data.value.option.localRow; i++) {
    for (let j = 0; j < data.value.option.localColumn; j++) {
      if (data.value.option.tableData[i][j].isMerge) {
        dataObj.beMergeCell.push(data.value.option.tableData[i][j])
      }
    }
  }
}
const insertRow = () => {
  menuClose()
  const { position: { x: { from, to }}, beMergeCell, mergeCell } = dataObj
  const { localColumn, tableData } = data.value.option
  const maxX = Math.max(from, to)
  const newRow = []
  let shouldDeleteY = []
  let isMerge = false
  for (let i = 0; i < mergeCell.length; i++) {
    const minXOfmergeCell = mergeCell[i].x
    const minYOfmergeCell = mergeCell[i].y
    const maxXOfmergeCell = mergeCell[i].x + mergeCell[i].rowspan - 1
    // 更新插入后合并单元格和被合并单元格的横坐标
    if (minXOfmergeCell >= maxX + 1) {
      mergeCell[i].x += 1
      for (let j = 0; j < beMergeCell.length; j++) {
        beMergeCell[j].x += 1
      }
    }
    if (maxX + 1 >= minXOfmergeCell && maxX + 1 <= maxXOfmergeCell) {
      // 找到插入后应该被删掉的y坐标
      for (let j = 0; j < beMergeCell.length; j++) {
        if (beMergeCell[j].x === maxX + 1) {
          shouldDeleteY.push(beMergeCell[j].y)
        }
      }
      // 更改合并单元格最左上角的rowspan
      if (minXOfmergeCell <= maxX) {
        mergeCell[i].rowspan += 1
        tableData[minXOfmergeCell][minYOfmergeCell].rowspan += 1
      }
    }
  }
  shouldDeleteY = [...new Set(shouldDeleteY)]
  for (let col = 0; col <= localColumn; col++) {
    // 插入位置的列中包含合并，则不显示
    if (shouldDeleteY.includes(col)) {
      isMerge = true
    } else {
      isMerge = false
    }
    const newCell = {
      value: '',
      name: '',
      x: maxX + 1,
      y: col,
      isSelect: false,
      rowspan: 1,
      colspan: 1,
      isMerge
    }
    newRow.push(newCell)
  }
  tableData.splice(maxX + 1, 0, newRow)
  data.value.option.localRow += 1
  data.value.option.tableData = makeTableData()
  updateBeMergeCell()
}

const insertColumn = () => {
  menuClose()
  const {
    position:
        { y: { from, to }},
    beMergeCell,
    mergeCell
  } = dataObj
  const { localRow, tableData } = data.value.option
  const maxY = Math.max(from, to)
  let shouldDeleteX = []
  let isMerge = false
  for (let i = 0; i < mergeCell.length; i++) {
    const minXOfmergeCell = mergeCell[i].x
    const minYOfmergeCell = mergeCell[i].y
    const maxYOfmergeCell = mergeCell[i].y + mergeCell[i].colspan - 1
    if (maxY + 1 > minYOfmergeCell && maxY + 1 <= maxYOfmergeCell) {
      // 找到插入后应该被删掉的x坐标
      for (let j = 0; j < beMergeCell.length; j++) {
        if (beMergeCell[j].y === maxY + 1) {
          shouldDeleteX.push(beMergeCell[j].x)
        }
      }
      // 更改合并单元格最左上角的colspan
      if (minYOfmergeCell <= maxY) {
        mergeCell[i].colspan += 1
        tableData[minXOfmergeCell][minYOfmergeCell].colspan += 1
      }
    }
  }
  shouldDeleteX = [...new Set(shouldDeleteX)]
  for (let r = 0; r < localRow; r++) {
    // 插入位置的列中包含合并，则不显示
    if (shouldDeleteX.includes(r)) {
      isMerge = true
    } else {
      isMerge = false
    }
    const newCell = {
      value: '',
      x: r,
      y: maxY + 1,
      name: '',
      isSelect: false,
      rowspan: 1,
      colspan: 1,
      isMerge
    }
    tableData[r].splice(maxY + 1, 0, newCell)
  }
  data.value.option.localColumn += 1
  data.value.option.tableData = makeTableData()
  updateBeMergeCell()
}

const deleteRow = () => {
  menuClose()
  const { from, to } = dataObj.position.x
  data.value.option.tableData.splice(Math.min(from, to), Math.abs(to - from) + 1)
  data.value.option.localRow = data.value.option.localRow - (Math.abs(to - from) + 1)
}

const deleteColumn = () => {
  menuClose()
  const { from, to } = dataObj.position.y
  data.value.option.localColumn = data.value.option.localColumn - (Math.abs(to - from) + 1)
  data.value.option.tableData.forEach((arr, index) => {
    arr.splice(Math.min(from, to), Math.abs(to - from) + 1)
  })
}

const mergeTd = () => {
  menuClose()
  const { localRow, localColumn } = data.value.option
  const mergeValue = []
  /**
       * 不做拷贝, 直接修改dataObj.tableData
       * 因为修改的是数组的对象, 所以vue也能感知到数据变化
       */
  const tableData = data.value.option.tableData
  let minX, minY, maxX, maxY
  for (let r = 0; r < parseInt(localRow); r++) {
    for (let col = 0; col < parseInt(localColumn); col++) {
      // 被选中区域
      if (tableData[r][col].isSelect) {
        if (typeof minX === 'undefined') { minX = r }
        if (typeof maxX === 'undefined') { maxX = r }
        if (typeof minY === 'undefined') { minY = col }
        if (typeof maxY === 'undefined') { maxY = col }
        minX = minX > r ? r : minX
        minY = minY > col ? col : minY
        maxX = maxX > r ? maxX : r
        maxY = maxY > col ? maxY : col
      }
    }
  }
  for (let i = minX; i <= maxX; i++) {
    for (let j = minY; j <= maxY; j++) {
      if (i === minX && j === minY) {
        tableData[i][j].rowspan = Math.abs(maxX - minX) + 1
        tableData[i][j].colspan = Math.abs(maxY - minY) + 1
        dataObj.mergeCell.push(tableData[i][j])
      } else {
        tableData[i][j].isMerge = true
        dataObj.beMergeCell.push(tableData[i][j])
      }
      if (tableData[i][j].value !== '') {
        mergeValue.push(tableData[i][j].value)
      }
    }
  }

  data.value.option.tableData[minX][minY].value = String(mergeValue)
}

const makeTableData = () => {
  const tableData = [...data.value.option.tableData]
  const { localRow, localColumn } = data.value.option
  for (let r = 0; r < localRow; r++) {
    const arr = []
    for (let col = 0; col < localColumn; col++) {
      let rowspanDefault = 1
      let colspanDefault = 1
      let isMerge = false
      if (data.value.option.tableData[r][col].colspan !== 1 || tableData[r][col].rowspan !== 1) {
        rowspanDefault = tableData[r][col].rowspan
        colspanDefault = tableData[r][col].colspan
      }
      if (tableData[r][col].isMerge) {
        isMerge = true
      }
      const isSelect = inRange(r, col)
      const obj = {
        value: data.value.option.tableData[r][col].value,
        x: r,
        y: col,
        isSelect,
        name: data.value.option.tableData[r][col].name,
        rowspan: rowspanDefault,
        colspan: colspanDefault,
        isMerge
      }
      arr.push(obj)
    }
    tableData[r] = arr
  }
  return tableData
}

const inRange = (x, y) => {
  const {
    x: { from: xFrom, to: xTo },
    y: { from: yFrom, to: yTo }
  } = dataObj.position

  const maxXStart = xFrom + data.value.option.tableData[xFrom][yFrom].rowspan - 1
  const maxYStart = yFrom + data.value.option.tableData[xFrom][yFrom].colspan - 1
  const maxXEnd = xTo + data.value.option.tableData[xTo][yTo].rowspan - 1
  const maxYEnd = yTo + data.value.option.tableData[xTo][yTo].colspan - 1

  let minSelectX = Math.min(xFrom, xTo)
  let minSelectY = Math.min(yFrom, yTo)
  let maxSelectX = Math.max(maxXStart, maxXEnd)
  let maxSelectY = Math.max(maxYStart, maxYEnd)

  if (dataObj.beMergeCell.length !== 0) {
    // 起始点间是否包含合并的单元格
    for (let i = 0; i < dataObj.mergeCell.length; i++) {
      const mergeCellMinX = dataObj.mergeCell[i].x
      const mergeCellMinY = dataObj.mergeCell[i].y
      if ((mergeCellMinX >= minSelectX && mergeCellMinX <= maxSelectX) &&
              (mergeCellMinY >= minSelectY && mergeCellMinY <= maxSelectY)) {
        const rowspan = dataObj.mergeCell[i].rowspan
        const colspan = dataObj.mergeCell[i].colspan
        const mergeCellMaxX = mergeCellMinX + rowspan - 1
        const mergeCellMaxY = mergeCellMinY + colspan - 1
        minSelectX = mergeCellMinX < minSelectX ? mergeCellMinX : minSelectX
        maxSelectX = mergeCellMaxX > maxSelectX ? mergeCellMaxX : maxSelectX
        minSelectY = mergeCellMinY < minSelectY ? mergeCellMinY : minSelectY
        maxSelectY = mergeCellMaxY > maxSelectY ? mergeCellMaxY : maxSelectY
      }
    }

    // 起始点间是否包含被合并的单元格，并找到被合并单元格对应的合并单元格
    for (let i = 0; i < dataObj.beMergeCell.length; i++) {
      const passCellX = dataObj.beMergeCell[i].x
      const passCellY = dataObj.beMergeCell[i].y
      if ((passCellX >= minSelectX && passCellX <= maxSelectX) &&
              (passCellY >= minSelectY && passCellY <= maxSelectY)) {
        for (let j = 0; j < dataObj.mergeCell.length; j++) {
          const rowspan = dataObj.mergeCell[j].rowspan
          const colspan = dataObj.mergeCell[j].colspan
          const mergeCellMinX = dataObj.mergeCell[j].x
          const mergeCellMinY = dataObj.mergeCell[j].y
          const mergeCellMaxX = mergeCellMinX + rowspan - 1
          const mergeCellMaxY = mergeCellMinY + colspan - 1
          if ((passCellX >= mergeCellMinX && passCellX <= mergeCellMaxX) &&
                  (passCellY >= mergeCellMinY && passCellY <= mergeCellMaxY)) {
            minSelectX = mergeCellMinX < minSelectX ? mergeCellMinX : minSelectX
            maxSelectX = mergeCellMaxX > maxSelectX ? mergeCellMaxX : maxSelectX
            minSelectY = mergeCellMinY < minSelectY ? mergeCellMinY : minSelectY
            maxSelectY = mergeCellMaxY > maxSelectY ? mergeCellMaxY : maxSelectY
          }
        }
      }
    }
  }

  if ((x >= minSelectX && x <= maxSelectX) && (y >= minSelectY && y <= maxSelectY)) {
    return true
  }
  return false
}

const breakTd = () => {
  menuClose()
  const {
    x: { from: xFrom, to: xTo },
    y: { from: yFrom, to: yTo }
  } = dataObj.position
  if (xFrom - xTo !== 0 || yFrom - yTo !== 0) {
    alert('只能选择一个单元格')
    return
  }

  const postionValue = data.value.option.tableData[xTo][yTo].value
  const postionArray = postionValue.split(',')
  dataObj.mergeCell = dataObj.mergeCell.filter(it => it.value === data.value.option.tableData[xTo][yTo].value)
  postionArray.forEach(it => {
    const xto = it.split(':')[0]
    const yto = it.split(':')[1]
    data.value.option.tableData[xto][yto].isMerge = false
    data.value.option.tableData[xto][yto].isSelect = false
    dataObj.beMergeCell = dataObj.beMergeCell.filter(it => it.value === `${xto}:${yto}`)
  })
  data.value.option.tableData[xTo][yTo].colspan = 1
  data.value.option.tableData[xTo][yTo].rowspan = 1
  data.value.option.tableData[xTo][yTo].value = `${xTo}:${yTo}`
}

// 是否显示
const isShow = computed(() => {
  if (props.preview) {
    return true
  } else {
    const rule = data.value?.option?.rule
    return !(rule && !(formData.value[rule.name] && rule.valueType === 'string' ? formData.value[rule.name] === rule.value : formData.value[rule.name].includes(rule.value)))
  }
})
</script>
<style lang="scss" scoped>
.text-container {
  overflow-x: auto;
  box-sizing: border-box;
  width: 100%;
  padding: 5px;
  .lable {
    display: inline-block;
    margin-bottom: 4px;
    word-break: break-all;
  }
}
table {
  overflow-x: auto;
  border-collapse: collapse;
  border-radius: 6px;
  text-align: center;
  td {
    box-sizing: border-box;
    width: 150px;
    min-width: 100px;
    max-width: 150px;
    padding: 0 5px;
    border-color: #e0e0e0;
    background-color: var(--theme-fill);
    user-select: none;
    :deep(input) {
      // text-align: center;
      overflow: hidden;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      // outline: none;
      border: 0;
      border-bottom: 1px solid #e4e7ed;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :deep(.el-input__inner) {
      border: 0;
      background-color: rgba(0, 0, 0, 0);
    }
  }
  td:hover {
    box-shadow: 0 0 10px 1px rgba(164, 232, 227, 0.2);
  }
  :deep(input) {
    height: 100%;
  }
}
// .table:active,
// .table:hover {
//   border: 1px solid #ccc;
// }
table td,
table tr {
  overflow: hidden;
  height: 32px;
  border: 1px solid #d8d8d8;
  color: var(--theme-text-2);
}
.select {
  background: rgba(202, 217, 234, 0.5);
}
.mergeInp {
  :deep(.el-input__wrapper) {
    background-color: transparent;
    box-shadow: none;
  }
}
.cell {
  width: 100px;
  height: 30px;
}
:deep(:where(.el-input,.el-input__wrapper)) {
  display: block;
  background-color: transparent;
  box-shadow: none;
}
:deep(.el-table tr) {
  background-color: var(--theme-fill);
}
</style>
