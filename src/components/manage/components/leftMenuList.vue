<template>
  <div class="session-list">
    <div class="session-group">
      <div class="session-item" v-for="item in dataList" :key="item.id" :class="{ active: activeMenuInfo?.id === item.id, editing: editItem?.id === item.id }" @click="handleClick(item)">
        <div class="name">
          <CommonTooltip :content="item.name"><span>{{ item.name }}</span></CommonTooltip>
        </div>
        <MorePopover :operationList="userOperationList" @handlePopoverSelect="btnValue => handlePopoverSelect(btnValue, item)" v-if="!userStore.needCheckPermission || (hadPermissionList.includes('删除指标') && item.name !== '全部')"/>
        <div class="replying-flag" v-if="item.replyStatus === 1"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'LeftMenuList',
  inheritAttrs: false
})
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { checkIndexEnum } from '@/api/api_index'
import MorePopover from '@/components/common/morePopover.vue'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/manage/indexDictionary') {
    hadPermissionList.value.push(item.name)
  }
})
const emits = defineEmits(['toHandleClick', 'toHandleDelete'])
const props = defineProps({
  dataList: {
    type: Array,
    default: () => []
  },
  activeMenuInfo: {
    type: Object,
    default: () => ({})
  }
})
const editItem = ref(null)
const userOperationList = ref([
  {
    name: '删除',
    icon: 'iconfont icon-shanchu3'
  }
])
const handlePopoverSelect = async (value, item) => {
  if (value === '删除') {
    ElMessageBox.confirm(
      `确认删除【${item.name}】及以下所有指标？删除后将无法找回，请谨慎操作。`,
      '删除指标',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }
    ).then(async () => {
      const { code, data } = await checkIndexEnum({
        id: item.id
      })
      if (code === 10000) {
        if (data === 0) {
          emits('toHandleDelete', item.id)
        } else {
          ElMessageBox.confirm(
            `有<span class="count">${data}</span>个指标已被队列引用，请在队列删除后重试。<br/>
          除引用指标外都被确认删除？`,
            '删除指标',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              type: 'warning'
            }
          ).then(async () => {
            console.log('删除')
            emits('toHandleDelete', item.id)
          }).catch(() => {})
        }
      }
    }).catch(() => {})
  }
}
const handleClick = (item) => {
  if (props.activeMenuInfo?.id === item.id) return false
  emits('toHandleClick', item)
}
</script>
<style scoped lang="scss">
.session-list {
  .session-group {
    .session-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      padding-left: 10px;
      cursor: pointer;
      color: var(--theme-text-2);
      &:not(:first-child) {
        margin-top: 6px;
      }
      &:hover {
        background: rgba(54, 112, 248, 0.05);
      }
      &.active {
        border-radius: 8px;
        background: rgba(54, 112, 248, 0.05);
        font-weight: 600;
        color: var(--theme-primary);
        .replying-flag {
          display: none;
        }
      }
      .name {
        flex: 1;
        width: 0;
        // margin-right: 16px;
      }
      .replying-flag {
        width: 14px;
        height: 14px;
        margin-right: 2px;
        border-radius: 14px;
        background-color: #ff4e4e;
      }
      &:hover {
        :deep(.icon-div) {
          .icon-gengduo1 {
            display: block;
          }
        }
        .replying-flag {
          display: none;
        }
      }
    }
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
      &:hover,
      &.active {
        background: rgba(54, 112, 248, 0.05);
        color: var(--theme-primary);
      }
    }
  }
}
</style>
<style lang="scss">
.el-popover.morePanel {
  width: auto !important;
  .panelDiv {
    ul {
      li {
        padding-right: 24px;
      }
    }
  }
}
.count {
  color: var(--theme-primary);
}
</style>
