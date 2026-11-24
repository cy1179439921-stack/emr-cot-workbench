<template>
  <div :class="{ areaSelect: true, lightMode: modeStore.mode === 'light' }">
    <div class="showContainer">
      <template v-if='!isAll'>
        <div
          v-for="item in areaList.slice(0, 5)"
          :key="item.name"
          :class="{ areaItem: true, actived: areaArr.includes(item.id) }"
          @click="handleSelect(item)"
        >
          {{ item.name }}
        </div>
      </template>
      <template v-if='isAll'>
        <div
          v-for="item in areaList"
          :key="item.name"
          :class="{ areaItem: true, actived: areaArr.includes(item.id) }"
          @click="handleSelect(item)"
        >
          {{ item.name }}
        </div>
      </template>

      <el-popover
        v-if="!isAll"
        placement="bottom"
        width="100%"
        :offset="0"
        :show-arrow="false"
        :teleported="false"
        popper-class="customAreaSelect"
      >
        <template #reference>
          <div class="moreBtn" @mouseenter="handelLeave(true)" @mouseleave="handelLeave(false)">
            <span>更多</span>
            <el-icon v-show="!visible"><ArrowDown/></el-icon>
            <el-icon v-show="visible"><ArrowUp /></el-icon>
          </div>
        </template>
        <div class="popperContainer" @mouseenter="handelLeave(true)" @mouseleave="handelLeave(false)">
          <div class="moreContainer">
            <div
              v-for="item in areaList.slice(5)" :key="item.name"
              :class="{ areaItem: true, actived: areaArr.includes(item.id) }"
              @click="handleSelect(item)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import lodash from 'lodash'
import { useModeStore } from '@/store/modeStore'
const modeStore = useModeStore()
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  areaList: {
    type: Array,
    default: () => {
      return []
    }
  },
  isAll: {
    type: Boolean,
    default: false
  }
})
const visible = ref(false)
const handelLeave = lodash.debounce((val) => {
  visible.value = val
}, 200)
const emits = defineEmits(['updateArea'])
const areaArr = ref([''])
const handleSelect = (item) => {
  if (item.id !== '') {
    if (areaArr.value.includes(item.id)) {
      const index = areaArr.value.indexOf(item.id)
      areaArr.value.splice(index, 1)
      if (areaArr.value.length <= 0) {
        areaArr.value = ['']
      }
    } else {
      areaArr.value.push(item.id)
      const index = areaArr.value.indexOf('')
      if (index > -1) {
        areaArr.value.splice(index, 1)
      }
    }
  } else {
    console.log(areaArr.value.includes(item.id))
    if (areaArr.value.includes(item.id)) {
      console.log('不改变')
    } else {
      areaArr.value = ['']
    }
  }
  emits('updateArea', areaArr.value)
}
</script>
<style lang="scss">
.areaSelect {
  position: relative;
  width: 100%;
  height: auto;
  .showContainer {
    display: flex;
    position: relative;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    height: auto;
  }
  .areaItem {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    height: 26px;
    margin-right: 8px;
    padding: 0 11px;
    border-radius: 2px;
    background-color: rgba(7, 6, 23, 0.38);
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    &.actived {
      background: var(--theme-primary);
      color: #fff;
    }
  }
  &.lightMode {
    .areaItem {
      background-color: var(--theme-primary-soft);
      color: var(--theme-text-2);
      &.actived {
        background-color: var(--theme-primary);
        color: #fff;
      }
    }
    .customAreaSelect {
      background-color: var(--theme-card) !important;
      box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.16);
    }
    .moreBtn {
      background: var(--theme-primary-soft);
      color: var(--theme-primary);
    }
    .moreContainer {
      .areaItem {
        background: var(--theme-primary-soft);
        color: var(--theme-text-2);
        &.actived {
          background: var(--theme-primary);
          color: #fff;
        }
      }
    }
  }
  .moreBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 26px;
    padding: 0 11px;
    border-radius: 2px;
    background-color: rgba(7, 6, 23, 0.38);
    cursor: pointer;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    i {
      font-size: 14px;
    }
    span {
      margin-right: 5px;
    }
  }
  .moreContainer {
    display: flex;
    bottom: 100%;
    z-index: 2;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    max-width: 100%;
    height: auto;
    .areaItem {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      min-width: 64px;
      height: 26px;
      margin-right: 8px;
      margin-bottom: 8px;
      padding: 0 11px;
      background-color: rgba(129, 167, 255, 0.1);
      font-weight: 400;
      font-size: 14px;
      color: #fff;
      &.actived {
        background: var(--theme-primary);
      }
    }
  }
  .popperContainer {
    width: 100%;
    background: transparent;
  }
  .customAreaSelect {
    left: 0 !important;
    padding: 16px;
    padding-bottom: 8px;
    border: 0;
    border-radius: 4px;
    background: #161526 !important;
  }
}
</style>
