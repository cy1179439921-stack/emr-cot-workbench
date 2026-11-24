<template>
  <el-sub-menu ref="subMenu" :index="routerInfo.name">
    <template #title>
      <div v-if="!isCollapse" class="gva-subMenu">
        <SvgIcon :iconName="routerInfo.icon" :className="routerInfo.icon" v-if="routerInfo.icon"></SvgIcon>
        <span>{{ routerInfo.title }}</span>
      </div>
      <template v-else>
        <SvgIcon :iconName="routerInfo.icon" :className="routerInfo.icon" v-if="routerInfo.icon"></SvgIcon>
        <span>{{ routerInfo.title }}</span>
      </template>
    </template>
    <slot />
  </el-sub-menu>
</template>

<script>
export default {
  name: 'AsyncSubmenu'
}
</script>
<script setup>
import { ref, watch } from 'vue'

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
  }
})

const activeBackground = ref(props.theme.activeBackground)
const activeText = ref(props.theme.activeText)
const normalText = ref(props.theme.normalText)
// const hoverBackground = ref(props.theme.hoverBackground)
// const hoverText = ref(props.theme.hoverText)

watch(
  () => props.theme,
  () => {
    activeBackground.value = props.theme.activeBackground
    activeText.value = props.theme.activeText
    normalText.value = props.theme.normalText
    // hoverBackground.value = props.theme.hoverBackground
    // hoverText.value = props.theme.hoverText
  }
)
</script>

<style lang="scss" scoped>
// .el-sub-menu {
//   ::v-deep(.el-sub-menu__title) {
//     padding: 0;
//     display: flex;
//     padding-left: 41px!important;
//     .gva-subMenu{
//       padding-left: 0;
//       font-weight: 500;
//       color: #646464;
//       .el-icon{
//         margin-right: 16px;
//       }
//     }
//     // justify-content: center;
//     // background-color: initial !important;
//     // color: v-bind(normalText);
//   }
//   &.is-opened {
//     ::v-deep(.gva-menu-item) {
//       padding-left: 24px!important;
//     }
//   }
// }
// .is-active:not(.is-opened) {
//   ::v-deep(.el-sub-menu__title) .gva-subMenu {
//     flex: 1;
//     height: 100%;
//     border-radius: 4px;
//     // background: v-bind(activeBackground) !important;
//     box-shadow: 0 0 2px 1px v-bind(activeBackground) !important;
//     line-height: 44px;
//     i {
//       // color: v-bind(activeText);
//     }
//     span {
//       // color: v-bind(activeText);
//     }
//   }
// }
// .gva-subMenu {
//   padding-left: 4px;
// }
</style>
