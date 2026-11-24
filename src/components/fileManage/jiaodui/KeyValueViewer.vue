<template>
  <div class="key-value-viewer">
    <div v-if="validItems.length > 0" class="kv-view-list">
      <div v-for="(item, idx) in validItems" :key="idx" class="kv-view-row">
        <span class="kv-view-key">{{ item.key }}：</span>
        <span class="kv-view-value" :title="item?.value">{{ item.value }}</span>
      </div>
    </div>
    <span v-else class="empty-text">-</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'KeyValueViewer', inheritAttrs: false })

const props = defineProps({
  data: { type: Array, default: () => [] }
})

const validItems = computed(() => {
  return (props.data || []).filter(item => item.key || item.value)
})
</script>

<style lang="scss" scoped>
// KeyValueViewer — 查看态 KV 列表
// 设计稿：key 蓝色，value 灰色，各行之间分隔线
.key-value-viewer {
  .kv-view-list {
    overflow: hidden;
    background: var(--theme-bg)#fafbfc;
  }

  .kv-view-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;
    line-height: 1.2;
    font-size: 16px;

    &:last-child {
      border-bottom: none;
    }
  }

  .kv-view-key {
    font-weight: 400;
  }

  .kv-view-value {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--theme-text-2);
    word-break: break-all;
  }

  .empty-text {
    display: block;
    line-height: 30px;
    font-size: 16px;
    color: var(--theme-text-3);
  }
}
</style>
