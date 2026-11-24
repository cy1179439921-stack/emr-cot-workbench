<template>
  <div class="common-form-left-menu">
    <header>{{title}}</header>
    <el-anchor
      :container="containerRef"
      direction="vertical"
      type="default"
      :offset="0"
      :marker="false"
      @change="scrollTo"
      @click="handleClick"
    >
      <template v-for="(item, index) in renderInfo" :key="'link' + index">
        <el-anchor-link :href="'#' + hrefIdPrefix + index" :title="item.label" v-if="item.show"></el-anchor-link>
      </template>
    </el-anchor>
  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonFormLeftMenu',
  inheritAttrs: false
})
import { onMounted, nextTick } from 'vue'
defineProps({
  hrefIdPrefix: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  renderInfo: {
    type: Array,
    default: () => []
  },
  containerRef: {
    type: Object
  }
})
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      scrollTo()
    }, 300) // 给子组件一点时间渲染 id 节点
  })
})
const handleClick = (e) => {
  // 如果点的不是第一个锚点，就把is-active移除
  const activeLi = document.querySelector('.common-form-left-menu .el-anchor__list a.is-active')
  console.log(activeLi)
  if (activeLi && activeLi !== e.target) {
    activeLi.classList.remove('is-active')
  }
}
const scrollTo = (href) => { // 锚点滚动事件
  nextTick(async () => {
    if (!href) {
      console.log('到顶了')
      await nextTick()
      // 解决右侧滚动到顶部时，第一个瞄点消失问题
      const firstLi = document.querySelector('.common-form-left-menu .el-anchor__list a:first-child')
      if (firstLi) {
        firstLi.classList.add('is-active')
      }
    } else {
      console.log(2222)
    }
  })
}
</script>
<style scoped lang="scss">
.common-form-left-menu {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 259px;
  padding: 0 8px 8px;
  border-radius: 8px;
  background-color: var(--theme-card);
  header {
    margin-left: 16px;
    margin-top: 16px;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-text);
  }
  :deep(.el-anchor) {
    overflow: auto;
    flex: 1;
    margin-top: 16px;

    @include scrollBarStyle;
    .el-anchor__list {
      padding-left: 0;
      .el-anchor__item {
        margin-top: 8px;
        &:first-child {
          margin-top: 0;
        }
        .el-anchor__link {
          padding: 8px 15px;
          font-size: 14px;
          color: var(--theme-text-2);
          &.is-active {
            border-radius: 2px;
            background: rgba(54, 112, 248, 0.05);
            font-weight: 600;
            color: var(--theme-primary);
          }
        }
      }
    }
  }
}
</style>
