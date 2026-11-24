<template>
  <div>
    <commonTable ref="tableRef" :data="tableData" :max-height="echartsToPx(maxHeight)">
      <el-table-column
        v-for="(colum) in columns"
        :key="colum.prop"
        :prop="colum.prop"
        :label="colum.label"
        :min-width="echartsToPx(colum.minWidth)"
        :formatter="colum.slot ? undefined : colum.formatter"
      >
        <template v-if="colum.slot && slots[colum.slot]" #default="scope">
          <slot :name="colum.slot" :row="scope.row"></slot>
        </template>
      </el-table-column>

      <el-table-column
        v-if="options && isSlotOption"
        fixed="right"
        :label="handlerName"
        :width="echartsToPx(props.handlerWidth||100)"
        :min-width="echartsToPx(props.handlerMinWidth||100)"
      >
        <template #default="scope">
          <slot name="option" :row="scope.row"></slot>
        </template>
      </el-table-column>
    </commonTable>
  </div>
</template>
<script setup>
import { ref, defineProps, useSlots, onMounted, onUnmounted, defineEmits, nextTick, defineExpose, computed } from 'vue'
import { emitter } from '@/utils/bus'
import { echartsToPx } from '@/utils/utils.js'
const props = defineProps({
  // 表格数据
  tableData: {
    type: Array,
    default: () => {
      return []
    }
  },
  // 表格最大高度
  maxHeight: {
    type: [Number, String],
    default: 400
  },
  // 分页页数和每页显示
  pageResult: {
    type: Object,
    default: () => {
      return {
        pageSize: 20,
        pageNum: 1,
        total: 0,
        maxPage: 1
      }
    }
  },
  // 表格内容
  columns: {
    type: Array,
    default: () => {
      return []
    }
  },
  // 是否显示操作模块
  options: {
    type: Boolean,
    default: true
  },
  handlerName: {
    type: String,
    default: '操作'
  },
  handlerWidth: {
    type: Number,
    default: 70
  }
})
const slots = useSlots()
const isSlotOption = computed(() => {
  return !!slots.option
})
const isLoading = ref(false)
const emits = defineEmits(['getNextPageData'])
const tableRef = ref(null) // 表格引用
const tableBodyWarp = ref(null) // 表格body的元素
// 获取表格内容实体，添加滚动事件
const addScrollEvent = () => {
  tableBodyWarp.value?.removeEventListener('scroll', handleScroll)
  tableBodyWarp.value = tableRef.value?.tableRef?.$refs.scrollBarRef?.wrapRef
  if (tableBodyWarp.value) {
    tableBodyWarp.value.addEventListener('scroll', handleScroll)
  }
}
// 滚动事件处理函数
const handleScroll = () => {
  if (!tableBodyWarp.value) return
  const { pageNum, maxPage } = props.pageResult
  // 已到最后一页不再请求
  if (pageNum >= maxPage) return
  // 判断是否到底部
  const scrollBottom = tableBodyWarp.value.scrollHeight - tableBodyWarp.value.scrollTop - tableBodyWarp.value.clientHeight
  if (scrollBottom < 50 && !isLoading.value) {
    isLoading.value = true
    emits('getNextPageData')
  }
}
// 加载完成 / 筛选重置后调用：解除加载锁并重新绑定滚动
const resetDom = () => {
  isLoading.value = false
  emitter.emit('closeLoading')
  nextTick(() => {
    addScrollEvent()
  })
}
onMounted(() => {
  nextTick(() => {
    addScrollEvent()
  })
})
// 销毁移除监听
onUnmounted(() => {
  tableBodyWarp.value?.removeEventListener('scroll', handleScroll)
})

defineExpose({
  resetDom
})
</script>
<style lang="scss" scoped>

</style>
