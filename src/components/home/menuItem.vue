<template>
  <el-menu-item :index="routerInfo.name">
    <template v-if="isCollapse">
      <el-tooltip class="box-item" effect="light" :content="routerInfo.title" placement="right">
        <!-- <el-icon v-if="routerInfo.icon">
          <component :is="routerInfo.icon" />
        </el-icon> -->
        <SvgIcon :iconName="routerInfo.icon" :className="routerInfo.icon" v-if="routerInfo.icon"></SvgIcon>
      </el-tooltip>
    </template>
    <template v-else>
      <div class="gva-menu-item">
        <!-- <el-icon v-if="routerInfo.icon">
          <component :is="routerInfo.icon" />
        </el-icon> -->
        <SvgIcon :iconName="routerInfo.icon" :className="routerInfo.icon" v-if="routerInfo.icon"></SvgIcon>
        <span class="gva-menu-item-title" :title="routerInfo.title" v-if="routerInfo.path==='/researchManagement/toBeDone'">{{ routerInfo.title }}
          <span class="count">{{`（${tobeDoneStore.tobeDoneNum?.todoTotalNum>999?'999+':(tobeDoneStore.tobeDoneNum?.todoTotalNum)||0}）`}}</span>
        </span>
        <span class="gva-menu-item-title" :title="routerInfo.title" v-else>{{ routerInfo.title }}</span>
        <el-icon v-if="closeRouter" @click.stop="emit('closeRouterIndex',routerInfo)"><Close /></el-icon>
      </div>
    </template>
  </el-menu-item>
</template>

<script>
export default {
  name: 'MenuItem'
}
</script>
<script setup>
import { ref, watch } from 'vue'
import { useTobeDoneStore } from '@/store/tobeDoneStore'
const tobeDoneStore = useTobeDoneStore()
const props = defineProps({
  routerInfo: {
    default() {
      return null
    },
    type: Object
  },
  isCollapse: {
    default() {
      return false
    },
    type: Boolean
  },
  theme: {
    default() {
      return {}
    },
    type: Object
  },
  closeRouter: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['closeRouterIndex'])
const activeBackground = ref(props.theme.activeBackground)
const activeText = ref(props.theme.activeText)
const normalText = ref(props.theme.normalText)
const hoverBackground = ref(props.theme.hoverBackground)
const hoverText = ref(props.theme.hoverText)

watch(
  () => props.theme,
  () => {
    activeBackground.value = props.theme.activeBackground
    activeText.value = props.theme.activeText
    normalText.value = props.theme.normalText
    hoverBackground.value = props.theme.hoverBackground
    hoverText.value = props.theme.hoverText
  }
)
</script>

<style lang="scss" scoped>
// .el-menu-item{
//   height: 36px;
//   line-height: 36px;
//   margin-top: 8px;
// }
// .gva-menu-item {
//   display: flex;
//   width: 144px;
//   padding-left: 41px;
//   box-sizing: border-box;
//   align-items: center;
//   // padding-left: 10px;
//   font-weight: 500;
//   color: #646464;
//   &:nth-child(1){
//     margin-top: 0;
//   }
//   // color: rgba(245, 245, 245, .5);
//   .gva-menu-item-title {
//     // flex: 1;
//   }
// }
// .el-menu-item.is-active {
//   .gva-menu-item {
//     border-radius: 8px;
//     background: var(--theme-primary-soft);
//     // i {
//     //   color: v-bind(activeText);
//     // }
//     // span {
//     //   color: v-bind(activeText);
//     // }
//   }
// }
// .el-menu-item:hover {
//   background-color: inherit;
//   // .gva-menu-item {
//   //   background: v-bind(hoverBackground);
//   //   border-radius: 4px;
//   //   box-shadow: 0 0 2px 1px v-bind(hoverBackground);
//   //   color: v-bind(hoverText);
//   // }
// }
.count {
  font-weight: 500;
  font-size: 14px;
  color: #ff4e4e;
}
</style>
