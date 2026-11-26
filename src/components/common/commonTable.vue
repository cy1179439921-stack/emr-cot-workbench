<template>
  <el-table class="commonTable" :class="{darkModeCommonTable:modeStore.mode==='dark' && $route.name === 'dataBoard'}" ref="tableRef" @sort-change="(...args)=>emit('sortChange',...args)" @selection-change="(...args)=>emit('selection-change',...args)">
    <template #empty>
      <div class="empty">
        <img v-if="!loadingStatus" class="emptyImg" :src="(modeStore.mode==='dark' && $route.name === 'dataBoard') ? darkEmptyImg : emptyImg" alt="" />
        <div v-if="loadingStatus" class="pixel-spinner">
          <div class="pixel-spinner-inner"></div>
        </div>
        <span class="noDataText" :class="{ 'loading': loadingStatus }">{{ loadingStatus ? '加载中' : '这里还没有内容' }}</span>
      </div>
    </template>
    <slot></slot>
  </el-table>
</template>
<script setup>
import { ref, onMounted, useAttrs, computed, toRefs, reactive } from 'vue'
import emptyImg from '@/assets/empty-1.png'
import darkEmptyImg from '@/assets/dark-empty.png'
import { emitter } from '@/utils/bus'
import { useModeStore } from '@/store/modeStore'
import { echartsToPx } from '@/utils/utils'
const modeStore = useModeStore()
const tableRef = ref(null)
const loadingStatus = ref(true)
const emit = defineEmits(['sortChange', 'selection-change'])
onMounted(() => {
  emitter.on('showLoading', () => {
    loadingStatus.value = true
  })
  emitter.on('closeLoading', () => {
    loadingStatus.value = false
  })
})

const toggleRowSelection = (row, selected) => {
  tableRef.value?.toggleRowSelection(row, selected)
}
const clearSelection = () => {
  tableRef.value?.clearSelection()
}
const { data } = toRefs(reactive(useAttrs()))

const hanldeFlex = computed(() => {
  return data.value?.length && !loadingStatus.value ? 'initial' : 1
})

const styleMinHeight = computed(() => {
  return data.value?.length > 0 ? 'auto' : echartsToPx(246) + 'px'
})

defineExpose({ tableRef, loadingStatus, toggleRowSelection, clearSelection })
</script>
<style lang="scss" scoped>
.commonTable {
  flex: v-bind(hanldeFlex);
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  .pixel-spinner {
    margin-bottom: 14px;
  }
  .emptyImg {
    width: 162px;
    height: auto;
    margin-bottom: 14px;
  }
  .noDataText {
    line-height: 22px;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}

:deep(.el-table) {
  display: flex;
  flex-direction: column;
  .el-table__inner-wrapper,
  .el-table__body-wrapper {
    flex: 1;
  }
}
:deep(.el-scrollbar__wrap) {
  .el-table__empty-block {
    position: absolute;
  }
}
.darkModeCommonTable {
  .empty {
    .noDataText {
      color: rgba(255, 255, 255, 0.6);
      &.loading {
        color: #fff;
      }
    }
    .pixel-spinner .pixel-spinner-inner {
      background-color: #9cb9fe;
      color: #9cb9fe;
    }
  }
}
:deep(.el-table__body-wrapper),
:deep(.el-scrollbar) {
  min-height: v-bind(styleMinHeight);
}
</style>
