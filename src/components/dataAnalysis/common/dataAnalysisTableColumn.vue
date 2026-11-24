<template>
  <el-table-column :label="coloumnHeader.label" :prop="coloumnHeader.label">
    <template v-for="(item, index) in coloumnHeader.children">
      <DataAnalysisTableColumn
        v-if="item.children && item.children.length"
        :key="'if' + index + item.id === 1 ? Math.random() : item.id"
        :tableData="tableData"
        :className="className"
        :needFlexColumnWidth="needFlexColumnWidth"
        :coloumn-header="item"
      ></DataAnalysisTableColumn>
      <el-table-column
        v-else-if="item.label === '类别/变量名'"
        :key="'elseif' + index + item.name"
        label="变量名"
        show-overflow-tooltip
        align="center"
        :min-width="needFlexColumnWidth ? flexColumnWidth(item.label, item.prop) : 'auto'" :resizable="false">
        <el-table-column :prop="item.prop" label="类别">
        </el-table-column>
      </el-table-column>
      <el-table-column
        v-else
        :key="'else' + index + item.name"
        :label="item.label"
        :prop="item.prop"
        show-overflow-tooltip
        align="center"
        :min-width="needFlexColumnWidth ? flexColumnWidth(item.label, item.prop, item.width, coloumnHeader) : 'auto'" :resizable="false">
      </el-table-column>
    </template>
  </el-table-column>
</template>
<script setup>
defineOptions({
  name: 'DataAnalysisTableColumn',
  inheritAttrs: false
})
const props = defineProps({
  tableData: {
    type: Array,
    required: true
  },
  needFlexColumnWidth: {
    type: Boolean,
    default: false
  },
  coloumnHeader: {
    type: Object,
    required: true
  },
  className: {
    type: String
  }
})
/**
 * 遍历列的所有内容，获取最宽一列的宽度
 * @param arr
 */
const getMaxLength = (arr) => {
  return arr.reduce((acc, item) => {
    if (item) {
      const calcLen = getTextWidth(item)
      if (acc < calcLen) {
        acc = calcLen
      }
    }
    return acc
  }, 0)
}
/**
 * 使用span标签包裹内容，然后计算span的宽度 width： px
 * @param valArr
 */
const getTextWidth = (str) => {
  let width = 0
  const html = document.createElement('span')
  html.innerText = str
  html.className = 'getTextWidth'
  document.querySelector('body').appendChild(html)
  width = document.querySelector('.getTextWidth').offsetWidth
  document.querySelector('.getTextWidth').remove()
  return width
}
/**
 * el-table-column 自适应列宽
 * @param prop_label: 表名
 * @param table_data: 表格数据
 */
const flexColumnWidth = (label, prop, width, columnHeaderLabel) => {
  // console.log('flexColumnWidth', label, prop, width, columnHeaderLabel)
  // 1.获取该列的所有数据
  if (width) {
    return width + 'px'
  } else {
    const arr = props.tableData.map(x => x[prop])
    arr.push(label) // 把每列的表头也加进去算
    // 2.计算每列内容最大的宽度 + 表格的内间距（依据实际情况而定）
    let contentWidth = getMaxLength(arr) + 40 // 40是预留内间距
    if (props.className === 'independenceChisquareTestTable1') {
      if (!columnHeaderLabel.label.includes('卡方检验分析结果表')) {
        const columnHeaderLabelWidth = getTextWidth(columnHeaderLabel.label) // 父类header标题的宽度
        if (contentWidth < columnHeaderLabelWidth) {
          contentWidth = columnHeaderLabelWidth / columnHeaderLabel.children.length + 40 // 内容宽度不能小于父类header标题的宽度
        }
      }
    }
    return contentWidth + 'px'
  }
}
</script>
<style scoped lang="scss">

</style>
