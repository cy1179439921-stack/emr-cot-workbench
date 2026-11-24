<template>
  <div class="session-list">
    <div class="title" v-if="dataList.length">{{title}}</div>
    <div class="session-group">
      <div class="session-item" v-for="item in dataList" :key="item.dialogId" :class="{ active: activeSessionInfo?.dialogId === item.dialogId, editing: editItem?.dialogId === item.dialogId }" @click="handleClickSession(item)">
        <template v-if="editItem?.dialogId === item.dialogId">
          <el-input ref="editInputRef" maxlength="50" show-word-limit v-model="newDialogTitle" clearable placeholder="请填写内容" @click.stop @blur="(e) => handleChangeName(e, item)"></el-input>
        </template>
        <template v-else>
          <div class="type flexCenter">
            {{getType(item.chatType)}}
          </div>
          <div class="name">
            <CommonTooltip :content="item.dialogTitle" v-if="!showTime"><span class="content-ellipsis">{{ item.dialogTitle }}</span></CommonTooltip>
            <!-- <span v-else>{{formatDateTime(item.operateTime)}}</span> -->
          </div>
          <MorePopover :operationList="userOperationList" trigger="click" @handlePopoverSelect="btnValue => handlePopoverSelect(btnValue, item)"/>
          <div class="replying-flag" v-if="item.replyStatus === 1"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'SessionList',
  inheritAttrs: false
})
import { ref, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import MorePopover from '@/components/common/morePopover.vue'
import { updateSessionTitle } from '@/api/api_AIChat.js'
// import { formatDateTime } from '@/utils/utils'
const emits = defineEmits(['changeSession', 'deleteSession'])
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  dataList: {
    type: Array,
    default: () => []
  },
  activeSessionInfo: {
    type: Object,
    default: () => ({})
  },
  showTime: {
    type: Boolean,
    default: false
  }
})
const editItem = ref(null)
const newDialogTitle = ref(null)
const userOperationList = ref([
  {
    name: '重命名',
    icon: 'iconfont icon-bianji2'
  },
  {
    name: '删除',
    icon: 'iconfont icon-shanchu3'
  }
])
const editInputRef = ref(null)
const selectedOperation = ref('')
const handlePopoverSelect = async (value, item) => {
  selectedOperation.value = value
  switch (value) {
    case '重命名':
      console.log('重命名')
      console.log('item', item)
      editItem.value = item
      newDialogTitle.value = item.dialogTitle
      await nextTick()
      console.log('editInputRef.value', editInputRef.value)
      editInputRef.value[0].focus()
      break
    case '删除':
      ElMessageBox.confirm(
        `删除后，该对话将不可恢复。确认删除吗？`,
        '永久删除对话',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '删 除',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      ).then(async () => {
        console.log('删除')
        emits('deleteSession', item.dialogId)
      }).catch(() => {})
      break
  }
}
// 完成改名
const handleChangeName = async (e, item) => {
  if (!newDialogTitle.value.trim()) {
    editItem.value = null
    return
  }
  const params = {
    dialogId: item.dialogId,
    title: newDialogTitle.value
  }
  const { code } = await updateSessionTitle(params)
  if (code === 10000) {
    // ElMessage.success('修改成功')
    selectedOperation.value = ''
    item.dialogTitle = newDialogTitle.value
    item.operateTime = new Date().getTime()
    // emits('update:activeSessionInfo', item)
    editItem.value = null
  }
}
const handleClickSession = (item) => {
  if (props.activeSessionInfo?.dialogId === item.dialogId) return false
  emits('changeSession', item)
}
// 获取会话类型
const getType = (chatType) => {
  switch (chatType) {
    case 1:
      return '对话'
    case 2:
      return '分析'
    case 3:
      return '文献'
    case 4:
      return '选题'
    case 5:
      return '方案'
    default:
      return '对话'
  }
}
</script>
<style scoped lang="scss">
.session-list {
  .title {
    margin-top: 26px;
    padding-left: 10px;
    font-weight: 600;
    color: var(--theme-text-3);
  }
  .session-group {
    margin-top: 8px;
    .session-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      padding-left: 10px;
      cursor: pointer;
      color: var(--theme-text);
      &:not(:first-child) {
        margin-top: 6px;
      }
      &:hover {
        background: rgba(54, 112, 248, 0.05);
      }
      &.active {
        border-radius: 2px;
        background: rgba(54, 112, 248, 0.05);
        font-weight: 600;
        color: var(--theme-primary);
        .replying-flag {
          display: none;
        }
      }
      &.editing {
        padding-left: 0;
        background: none;
        :deep(.el-input) {
          height: 100%;
          .el-input__wrapper {
            height: 100%;
            padding-left: 10px;
          }
          .el-input__count {
            font-weight: 400;
          }
        }
      }
      .type {
        width: 55px;
        height: 26px;
        margin-right: 8px;
        border-radius: 2px 2px 2px 2px;
        background: rgba(54, 112, 248, 0.1);
        font-size: 16px;
        color: var(--theme-primary);
      }
      .name {
        flex: 1;
        width: 0;
        // margin-right: 16px;
        .content-ellipsis {
          font-size: 18px;
        }
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
