
<template>
  <draggable
    :list="list"
    class="draggableDiv"
    item-key="label"
    animation="300"
    :group="group"
    @change="handleChange"
    @end="handleEnd">
    <template #item="{ element }">
      <div class="li" :class="{
        'active': activeObj && activeObj.includes(element),
        'disabledS': disabledS && element.dataProperty === 1,
        'disabledR': disabledR && element.dataProperty !== 1
      }" @click="handleClick(element)" v-if="!filterCodomainType.includes(element.codomainType)">
        <SvgIcon :iconName="element.dataProperty === 1 ? 'icon-shuzi' : 'icon-zimu'"></SvgIcon>
        <div class="name">
          <CommonTooltip :content="element.label">
            <span>{{ element.label }}</span>
          </CommonTooltip>
        </div>
      </div>
    </template>
  </draggable>
</template>
<script setup>
defineOptions({
  name: 'VariableDraggable',
  inheritAttrs: false
})
import draggable from 'vuedraggable'
const emits = defineEmits(['handleClick', 'handleChange', 'handleEnd', 'update:list'])
const props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  group: {
    type: Object,
    default: () => ({})
  },
  activeObj: {
    type: Array,
    default: () => []
  },
  selectType: { // 单选还是多选 single/multiple
    type: String,
    default: 'multiple'
  },
  disabledS: {
    type: Boolean,
    default: false
  },
  disabledR: {
    type: Boolean,
    default: false
  },
  filterCodomainType: { // 过滤数据
    type: [Array],
    default: () => ([7]) // 7 复数
  }
})

const handleClick = (item) => {
  emits('handleClick', item, props.selectType)
}
const handleChange = (event) => {
  emits('handleChange', event)
}
const handleEnd = (event) => {
  emits('handleEnd', event)
}
</script>
<style lang="scss" scoped>
.draggableDiv {
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  .li {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 26px;
    margin-top: 3px;
    padding: 0 6px 0 5px;
    cursor: pointer;
    color: var(--theme-text);
    &.active {
      background: rgba(54, 112, 248, 0.1);
    }
    &.disabledS,
    &.disabledR {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .svg-icon {
      width: 18px;
      margin-right: 7px;
    }
    .name {
      display: flex;
      overflow: hidden;
      flex: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &:first-child {
      margin-top: 8px;
    }
    &:last-child {
      margin-bottom: 8px;
    }
  }
}
</style>
