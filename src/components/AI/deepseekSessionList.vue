<template>
  <div class="session-list">
    <div class="title" v-if="dataList.length">{{title}}</div>
    <div class="session-group">
      <div class="session-item" v-for="item in dataList" :key="item.id" :class="{ active: activeSessionInfo?.id === item.id, editing: editItem?.id === item.id }" @click="emits('changeSession', item)">
        <template v-if="editItem?.id === item.id">
          <el-input ref="editInputRef" v-model="item.title" clearable placeholder="请填写内容" @blur="(e) => handleChangeName(e, item)"></el-input>
        </template>
        <template v-else>
          <div class="name">
            <CommonTooltip :content="item.title"><span>{{ item.title }}</span></CommonTooltip>
          </div>
          <MorePopover :operationList="userOperationList" trigger="click" @handlePopoverSelect="btnValue => handlePopoverSelect(btnValue, item)"/>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'DeepseekSessionList',
  inheritAttrs: false
})
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MorePopover from '@/components/common/morePopover.vue'
import { updateSessionTitle } from '@/api/api_AIChat.js'
const emits = defineEmits(['changeSession', 'deleteSession'])
defineProps({
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
  }
})
const editItem = ref(null)
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
        emits('deleteSession', item.id)
      }).catch(() => {})
      break
  }
}
// 完成改名
const handleChangeName = async (e, item) => {
  if (!item.title.trim()) {
    // 阻止失焦
    e.preventDefault()
    // 保持焦点
    editInputRef.value[0].focus()
    // 可选：添加错误提示
    ElMessage.warning('会话名称不能为空')
    return
  }
  const params = {
    dialogId: item.id,
    title: item.title
  }
  const { code } = await updateSessionTitle(params)
  if (code === 10000) {
    ElMessage.success('修改成功')
    selectedOperation.value = ''
    // emits('update:activeSessionInfo', item)
    editItem.value = null
  }
}
</script>
<style scoped lang="scss">
.session-list {
  .title {
    margin-top: 26px;
    padding-left: 10px;
    font-weight: 600;
    color: var(--theme-text);
  }
  .session-group {
    margin-top: 8px;
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
        }
      }
      .name {
        flex: 1;
        width: 0;
        margin-right: 16px;
      }
      &:hover {
        :deep(.icon-div) {
          .icon-gengduo1 {
            display: block;
          }
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
