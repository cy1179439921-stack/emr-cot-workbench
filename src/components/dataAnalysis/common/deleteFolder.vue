<template>
  <el-dialog
    v-model="showDialog"
    title="删除"
    :width="pxToRem(450)"
    destroy-on-close
    :before-close="handleClose"
  >
    <p class="contentMian">
      <i class="iconfont icon-querentishi"></i>
      <span>{{ content }}</span>
    </p>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取&nbsp;消</el-button>
        <el-button type="primary" @click="handleDelete">
          确&nbsp;定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import { deleteEngineerLibrary, deleteDataset } from '@/api/api_dataAnalysis'
import { ElMessage } from 'element-plus'
const showDialog = ref(false)
const content = ref('确定删除该文件夹吗？')
const emit = defineEmits(['handle-close', 'updateList', 'deleteId'])
const props = defineProps({
  deleteData: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: ''
  }
})

const open = () => {
  console.log(props.deleteData)
  if (props.deleteData.type === 1) {
    content.value = '确定删除该文件夹吗？'
  } else {
    content.value = '确定删除该数据集吗？'
  }
  showDialog.value = true
}
open()

const handleClose = () => {
  showDialog.value = false
  emit('handle-close')
}
const handleDelete = async () => {
  const params = { id: props.deleteData.id }
  const deleteAction = props.type === 0 ? deleteEngineerLibrary : deleteDataset

  try {
    const res = await deleteAction(params)
    if (res.code === 10000) {
      ElMessage.success('已删除')
      handleClose()
      emit('updateList')
      if (props.type === 0) {
        emit('deleteId', props.deleteData)
      }
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

</script>
<style scoped lang="scss">
.contentMian {
  display: flex;
  align-items: center;
  i {
    margin-right: 7px;
    font-size: 18px;
    color: #f59f0b;
  }
  span {
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
</style>
