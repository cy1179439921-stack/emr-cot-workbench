<template>
  <div class="diff-viewer" v-html="diffHtml"></div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DiffViewer'
})
import { computed } from 'vue'
import { diff_match_patch, DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL } from 'diff-match-patch'

const props = defineProps({
  original: {
    type: [String, Number],
    default: ''
  },
  polished: {
    type: [String, Number],
    default: ''
  }
})

// 渲染 diff
const diffHtml = computed(() => {
  // 确保 original 和 polished 是字符串
  const original = String(props.original || '')
  const polished = String(props.polished || '')

  // eslint-disable-next-line new-cap
  const dmp = new diff_match_patch() // 创建 diff 对象
  const diffs = dmp.diff_main(original, polished) // 计算差异
  dmp.diff_cleanupSemantic(diffs) // 优化 diff 结果，使结果更符合语义（比如合并相邻的小修改）

  return diffs
    .map(([type, text]) => {
      switch (type) {
        case DIFF_INSERT:
          return `<span class="diff-insert">${text}</span>` // 新增文本：绿色背景
        case DIFF_DELETE:
          return `<span class="diff-delete">${text}</span>` // 删除文本：红色背景+删除线
        case DIFF_EQUAL:
          return `<span class="diff-equal">${text}</span>` // 未修改文本：保持原样
        default:
          return text
      }
    })
    .join('')
})
</script>

<style lang="scss">
$line-height-base: 36px;
.diff-viewer {
  line-height: $line-height-base;
  font-size: 16px;
  color: var(--theme-text);
  white-space: pre-wrap; /* 保留换行和空格 */
}

/* 新增内容 */
.diff-insert {
  padding: 5px; /* 上下撑开背景 */
  background-color: #d4f7d4;
  line-height: $line-height-base;
}

/* 删除内容 */
.diff-delete {
  padding: 5px; /* 上下撑开背景 */
  background: #ffe6e6;
  line-height: $line-height-base;
  text-decoration: line-through;
}

/* 相同内容 */
.diff-equal {
  padding: 5px; /* 上下撑开背景 */
  line-height: $line-height-base;
  color: inherit;
}
</style>

