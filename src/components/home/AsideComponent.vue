<template>
  <component :is="menuComponent" v-if="!routerInfo.hidden" :is-collapse="isCollapse" :router-info="routerInfo" :closeRouter="closeRouter" @closeRouterIndex="emit('closeRouterIndex', $event)">
    <template v-if="routerInfo.children && routerInfo.children.length">
      <template v-for="item in routerInfo.children" :key="item.name">
        <AsideComponent :is-collapse="false" :router-info="item" v-if="!item.hidden" :closeRouter="closeRouter" @closeRouterIndex="emit('closeRouterIndex', $event)"/>
      </template>
    </template>
  </component>
</template>

<script>
export default {
  name: 'AsideComponent'
}
</script>
<script setup>
import { computed } from 'vue'
import MenuItem from './menuItem.vue'
import AsyncSubmenu from './asyncSubmenu.vue'
const emit = defineEmits(['closeRouterIndex'])
const props = defineProps({
  routerInfo: {
    type: Object,
    default: () => null
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

const menuComponent = computed(() => {
  if (props.routerInfo.children && props.routerInfo.children.filter((item) => !item.hidden).length) {
    return AsyncSubmenu
  }
  return MenuItem
})
</script>
