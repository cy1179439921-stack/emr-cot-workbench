<template>
  <el-table class="surroundingTableBorder" height="auto" :data="tableData" :border="border" :class-name="className" :span-method="objectSpanMethod">
    <template v-for="(item,index) in tableHeader">
      <table-column
        v-if="item.children && item.children.length"
        :key="'if-' + index + item.id"
        :tableData="tableData"
        :className="className"
        :needFlexColumnWidth="needFlexColumnWidth"
        :coloumn-header="item"
      ></table-column>
      <el-table-column
        v-else
        :key="'else-' + index + item.id"
        :label="item.label"
        :prop="item.prop"
        :min-width="flexColumnWidth(item.prop, tableData)"
        :resizable="false"
      >
      </el-table-column>
    </template>
  </el-table>
</template>
<script setup>
defineOptions({
  name: 'DynamicTable2',
  inheritAttrs: false
})
import TableColumn from './dataAnalysisTableColumn.vue'
const props = defineProps({
  // 表格的数据
  tableData: {
    type: Array,
    required: true
  },
  // 多级表头的数据
  tableHeader: {
    type: Array,
    required: true
  },
  border: {
    type: Boolean
  },
  needFlexColumnWidth: {
    type: Boolean
  },
  columnMerge: {
    type: Number
  },
  columnMergeArr: {
    type: Array
  },
  columnIndexArr: {
    type: Array
  },
  endMergeRowIndex: {
    type: Number
  },
  lastRowNeedMerge: { // 最后一行是否需要合并
    type: Number
  },
  className: {
    type: String
  }
})
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (props.columnIndexArr && props.columnIndexArr.includes(columnIndex)) {
    if (rowIndex % props.columnMerge === 0) {
      if (props.endMergeRowIndex && rowIndex > (props.endMergeRowIndex - 1)) {
        return {
          rowspan: 1,
          colspan: 1
        }
      } else {
        return {
          rowspan: props.columnMerge,
          colspan: 1
        }
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  } else if (props.lastRowNeedMerge && rowIndex > (props.columnMerge - 1)) {
    if (columnIndex === 0) {
      return {
        rowspan: 1,
        colspan: props.lastRowNeedMerge
      }
    }
  } else if (props.className === 'hierarchicalRegressionTable2') { // 分层回归
    if (rowIndex > (props.columnMerge - 1)) {
      if (columnIndex === 1 || columnIndex === 5) {
        return [1, 4] // 1行4列
      } else if (columnIndex === 2 || columnIndex === 3 || columnIndex === 4 || columnIndex === 6 || columnIndex === 7 || columnIndex === 8) {
        return [0, 0]
      }
    }
  } else if (props.className === 'ARIMAModelTable2') {
    if (columnIndex === 0) {
      if (rowIndex === 2) {
        return {
          rowspan: 5,
          colspan: 1
        }
      } else if ((rowIndex > 2 && rowIndex < 7) || rowIndex === 8) {
        return {
          rowspan: 0,
          colspan: 0
        }
      } else if (rowIndex === 7) {
        return {
          rowspan: 2,
          colspan: 1
        }
      }
    }
  }
}
const flexColumnWidth = (str, tableData, flag = 'max') => {
  // str为该列的字段名(传字符串);tableData为该表格的数据源(传变量);
  // flag为可选值，可不传该参数,传参时可选'max'或'equal',默认为'max'
  // flag为'max'则设置列宽适配该列中最长的内容,flag为'equal'则设置列宽适配该列中第一行内容的长度。
  str = str + ''
  let columnContent = ''
  if (!tableData || !tableData.length || tableData.length === 0 || tableData === undefined) {
    return
  }
  if (!str || !str.length || str.length === 0 || str === undefined) {
    return
  }
  if (flag === 'equal') {
    // 获取该列中第一个不为空的数据(内容)
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i][str].length > 0) {
        // console.log('该列数据[0]:', tableData[0][str])
        columnContent = tableData[i][str]
        break
      }
    }
  } else {
    // 获取该列中最长的数据(内容)
    let index = 0
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i][str] === null) {
        return
      }
      const now_temp = tableData[i][str] + ''
      const max_temp = tableData[index][str] + ''
      if (now_temp.length > max_temp.length) {
        index = i
      }
    }
    columnContent = tableData[index][str]
  }
  // console.log('该列数据[i]:', columnContent)
  // 以下分配的单位长度可根据实际需求进行调整
  let flexWidth = 0
  for (const char of columnContent) {
    if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')) {
      // 如果是英文字符，为字符分配8个单位宽度
      flexWidth += 8
    } else if (char >= '\u4e00' && char <= '\u9fa5') {
      // 如果是中文字符，为字符分配15个单位宽度
      flexWidth += 15
    } else {
      // 其他种类字符，为字符分配8个单位宽度
      flexWidth += 8
    }
  }
  if (flexWidth < 80) {
    // 设置最小宽度
    flexWidth = 80
  }
  // if (flexWidth > 250) {
  //   // 设置最大宽度
  //   flexWidth = 250
  // }
  return flexWidth + 'px'
}
</script>
<style scoped lang="scss">

</style>
