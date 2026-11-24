<template>
  <div class="VirtualTableContainer" >
    <vxe-table
      border
      class="VirtualTable"
      ref="VirtualTableRef"
      height="100%"
      :header-cell-config="{
        minHeight:Math.ceil(echartsToPx(40))
      }"
      header-cell-class-name="headerClassName"
      :data='tableData'
      @ready="handleReady"
      :virtual-x-config="{enabled: true, gt: 0}"
      :virtual-y-config="{enabled: true, gt: 0}">
      <template v-for="column in columns" :key="JSON.stringify(column)">
        <vxe-colgroup
          v-if="column.children&&column.children.length"
          :title="column.fullLabel">
          <vxe-column
            v-for="v in column.children"
            :key="JSON.stringify(v)"
            :field="v.value"
            :title="v.fullLabel"
            :min-width="v.minWidth"
            :width="v.width||'auto'"
            :formatter="v.formatter"
          >
          </vxe-column>
        </vxe-colgroup>
        <vxe-column
          v-else
          :fixed="column.fixed"
          :field="column.value"
          :title="column.label"
          :min-width="column.minWidth"
          :width="column.width||'auto'"
          :formatter="column.formatter"
        >
        </vxe-column>
      </template>

      <template #empty>
        <div class="empty">
          <img v-if="!loadingStatus" class="emptyImg" :src="emptyImg" alt="" />
          <div v-if="loadingStatus" class="pixel-spinner">
            <div class="pixel-spinner-inner"></div>
          </div>
          <span class="noDataText" :class="{ 'loading': loadingStatus }">{{ loadingStatus ? '加载中' : '这里还没有内容' }}</span>
        </div>
      </template>
    </vxe-table>
  </div>
</template>
<script setup>
import { emitter } from '@/utils/bus'
import { ref, onMounted } from 'vue'
import emptyImg from '@/assets/empty.png'
import { echartsToPx } from '@/utils/utils.js'
defineProps({
  columns: {
    type: Array,
    default: () => {
      return []
    }
  },
  tableData: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const VirtualTableRef = ref()
const loadingStatus = ref(true)
const handleReady = () => {
  console.log('渲染完毕')
}
onMounted(() => {
  emitter.on('showLoading', () => {
    loadingStatus.value = true
  })
  emitter.on('closeLoading', () => {
    loadingStatus.value = false
  })
})
</script>
<style lang="scss" scoped>
  .VirtualTableContainer {
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    padding: 0 24px;
  }
  .table,
  .VirtualTable {
    :deep(:where(td,tr)) .cell {
      justify-content: center;
      padding: 0 12px;
    }
    :deep(.tableHeaderLabel) {
      display: flex;
      overflow: hidden;
      align-items: center;
      cursor: pointer;
      font-weight: 350;
      font-size: 14px;
      color: var(--theme-text);
      .svg-icon {
        flex-shrink: 0;
        height: 16px;
        line-height: 22px;
      }
      .mlr6 {
        height: 18px;
        margin: 0 2px 0 0;
      }
    }
    :deep(.tableBodyLabel) {
      display: flex;
      overflow: hidden;
      flex-wrap: wrap;
      align-items: center;
      cursor: pointer;
      font-weight: 350;
      font-size: 14px;
      color: var(--theme-text);
    }
    :deep(.vxe-cell) {
      height: auto !important;
      word-break: break-all;
    }
  }

</style>

