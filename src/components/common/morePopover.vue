<template>
  <el-popover
    :width="pxToRem(width || 153)"
    popper-class="morePanel"
    :trigger="trigger"
    :offset="offset"
    ref="myPopover"
    @after-leave="selectedOperation = ''"
    @show="isHovering = true"
    @hide="isHovering = false"
  >
    <div class="panelDiv">
      <ul>
        <li v-for="(itemName, itemIndex) in operationList" :key="itemIndex" :class="{ active: selectedOperation === itemName.name }" @click.stop="handleSelect(itemName.name)">
          <i :class="itemName.icon"></i>
          <span>{{ itemName.name }}</span>
        </li>
      </ul>
    </div>
    <template #reference>
      <div class="icon-div flexCenter" :class="{ hovering: isHovering || showMoreIcon }" @click.stop>
        <i class="iconfont icon-gengduo1"></i>
      </div>
    </template>
  </el-popover>
</template>
<script setup>
defineOptions({
  name: 'MorePopover',
  inheritAttrs: false
})
import { ref } from 'vue'
const emits = defineEmits(['handlePopoverSelect'])
defineProps({
  operationList: { // 选项列表
    type: Array,
    default: () => []
  },
  trigger: { // 触发方式
    type: String,
    default: 'hover'
  },
  offset: { // 偏移量
    type: Number
  },
  width: {
    type: Number,
    default: null
  },
  showMoreIcon: {
    type: Boolean,
    default: false
  }
})
const selectedOperation = ref('')
const myPopover = ref(null)
const isHovering = ref(false)
const handleSelect = (name) => {
  selectedOperation.value = name
  emits('handlePopoverSelect', name)
  myPopover.value.hide()
}

</script>
<style scoped lang="scss">
.icon-div {
  width: 36px;
  height: 36px;
  cursor: pointer;
  &.hovering {
    .icon-gengduo1 {
      display: block;
    }
  }
  .icon-gengduo1 {
    display: none;
    font-size: 3px;
    color: var(--theme-text-2);
  }
}

.panelDiv {
  ul {
    flex-direction: column;
    width: 100%;
    padding-top: 4px;
    padding-bottom: 8px;
    font-size: 14px;
    li {
      height: 28px;
      margin-top: 4px;
      padding-left: 24px;
      cursor: pointer;
      line-height: 28px;
      font-weight: 400;
      &:not(:first-child) {
        margin-top: 8px;
      }
      i {
        margin-right: 8px;
        font-size: 14px;
      }
      .icon-shanchu3,
      .icon-yidong1 {
        font-size: 16px;
      }
      .icon-xiangqing {
        font-size: 15px;
      }
      &:hover,
      &.active {
        background: rgba(54, 112, 248, 0.05);
        color: var(--theme-primary);
      }
    }
  }
}
</style>
