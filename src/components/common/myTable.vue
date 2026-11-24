<template>
  <div :class="{myTable:true,noPadding:!tableData?.length||!pagination}">
    <commonTable
      ref="table"
      class="singleTable"
      :data="tableData"
      v-loading="props.loading"
      @current-change="currentChange"
      @selection-change="selectionChange"
      :row-key="rowKey"
    >
      <el-table-column type="selection" :width="echartsToPx(55)" v-if="selection" />
      <el-table-column
        :min-width="echartsToPx(50)"
        header-align="center"
        label="序号"
        v-if="sort"
      >
        <template #default="scope">
          <span>
            {{
              (Number(pageResult.pageNum) - 1) * Number(pageResult.pageSize) +
                scope.$index +
                1
            }}</span
          >
        </template>
      </el-table-column>
      <template v-if="showToolTip">
        <el-table-column
          v-for="(item, colIndex) in column"
          :key="`${item.soleID || item.value || item.id || 'col'}-${colIndex}`"
          :class-name="item.className"
          :fixed="item.fixed"
          :label="item.label||item.name"
          :prop="item.value"
          :min-width="echartsToPx(item.minWidth)"
          :width="echartsToPx(item.width)"
          :formatter="item.formatter"
          :show-overflow-tooltip="showToolTip"
        >
          <!-- 如果该数据需要显示其他标签，则使用插槽显示 插槽名称就是column的prop -->
          <template #default="scope" v-if="item.html">
            <slot :name="item.value" :row="scope.row"></slot>
            <!-- <div v-html="item.html(scope.row)"></div> -->
          </template>
        </el-table-column>
      </template>
      <template v-if="!showToolTip">
        <el-table-column
          v-for="(item, colIndex) in column"
          :key="`${item.soleID || item.value || item.id || 'col'}-${colIndex}`"
          :class-name="item.className"
          :fixed="item.fixed"
          :label="item.label||item.name"
          :prop="item.value"
          :min-width="echartsToPx(item.minWidth)"
          :width="echartsToPx(item.width)"
          :formatter="item.formatter"
          :show-overflow-tooltip="item.showToolTip"
        >
          <!-- 如果该数据需要显示其他标签，则使用插槽显示 插槽名称就是column的prop -->
          <template #default="scope" v-if="item.html">
            <slot :name="item.value" :row="scope.row">
            </slot>
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="option && isSlotOption"
        fixed="right"
        :label="props.handlerName"
        :width="echartsToPx(props.handlerWidth)"
        :min-width="echartsToPx(props.handlerMinWidth)"
      >
        <template #default="scope">
          <slot name="option" :row="scope.row"></slot>
        </template>
      </el-table-column>
    </commonTable>
    <div
      class="paginationContainer"
      v-if="pagination && tableData?.length"
    >
      <el-pagination
        class="bottomPagination"
        v-model:current-page="pageResult.pageNum"
        v-model:page-size="pageResult.pageSize"
        :total="pageResult.total"
        size="small"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
        <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ pageResult.total }}</span> 条</span></template>
      </el-pagination>
    </div>
  </div>
</template>
<script setup>
import { ref, useSlots, computed, toRefs } from 'vue'
import { echartsToPx } from '@/utils/utils.js'
const isSlotOption = computed(() => {
  return !!slots.option
})
const props = defineProps({
  // 表格数据
  tableData: {
    type: Array,
    default: () => {
      return []
    }
  },
  // 表格加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 表格最大高度
  maxHeight: {
    type: [Number, String],
    default: 1150
  },
  // 是否带有纵向边框
  border: {
    type: Boolean,
    default: false
  },
  // 是否多选
  selection: {
    type: Boolean,
    default: false
  },
  // 分页页数和每页显示
  pageResult: {
    type: Object,
    default: () => {
      return {
        pageSize: 20,
        pageNum: 1,
        total: 0
      }
    }
  },
  // 是否显示序号（1,2,3,4,5）
  sort: {
    type: Boolean,
    default: false
  },
  // 表格内容
  column: {
    type: Array,
    default: () => {
      return []
    }
  },
  // 是否显示操作模块
  option: {
    type: Boolean,
    default: true
  },
  // 是否显示操作模块
  options: {
    type: Boolean,
    default: true
  },
  // 是否显示分页
  pagination: {
    type: Boolean,
    default: true
  },
  rowKey: {
    type: String,
    default: ''
  },
  showToolTip: {
    type: Boolean,
    default: false
  },
  handlerName: {
    type: String,
    default: '操作'
  },
  handlerWidth: {
    type: [Number, String],
    default: 'auto'
  }
})
const table = ref()
const slots = useSlots()
const { pageResult } = toRefs(props)

const emits = defineEmits([
  'edit',
  'confirm',
  'handleSizeChange',
  'handleCurrentChange',
  'currentChange',
  'selectionChange'
])
// 分页
const handleSizeChange = (val) => {
  emits('handleSizeChange', val)
}
const handleCurrentChange = (val) => {
  emits('handleCurrentChange', val)
}
// 选中单行
const currentChange = (val) => {
  emits('currentChange', val)
}
// 多行
const selectionChange = (val) => {
  emits('selectionChange', val)
}

defineExpose({ table })
</script>
<style scoped lang="scss">
.myTable {
  display: flex;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  padding-bottom: 80px;
  &.noPadding {
    padding-bottom: 0;
  }
}
.paginationContainer {
  display: flex;
  position: absolute;
  // left: 50%;
  left: 0;
  bottom: 0;
  z-index: 2;
  justify-content: flex-end;
  box-sizing: border-box;
  width: 100%;
  padding-right: 24px;
  background-color: var(--theme-card);
}
.singleTable {
  flex: 1;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-top: 55px;
  .emptyImg {
    width: 220px;
    height: 220px;
    margin-bottom: 14px;
  }
}
:deep(.el-table .cell.el-tooltip) {
  white-space: normal;
}
// :deep(.customToolTip) {
//   .cell {
//     display: -webkit-box;
//     overflow: hidden;
//     flex: 1;
//     line-height: 20px;
//     -webkit-line-clamp: 3; /* 显示两行 */
//     font-weight: 400;
//     font-size: 14px;
//     -webkit-box-orient: vertical;
//   }
// }
</style>
