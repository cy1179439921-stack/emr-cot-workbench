<template>
  <div class="newProjectChange" v-bind="$attrs">
    <el-dialog :title="title || dialogTitle" v-model="showDialog" class="add_Dialog" :width="pxToRem(1532)" :before-close="handleClose">
      <projectInitiationForm :mode="mode" :class="mode" :curEditRow="curEditRow" page="newProjectChange" :showHeader="false" :businessType="businessType" :projectId="projectId" @handleBack="handleClose"/>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'NewProjectChangeDialog'
}
</script>
<script setup>
import { ref } from 'vue'
import projectInitiationForm from '@/components/researchManagement/projectInitiationForm.vue'
defineProps({
  mode: {
    type: String,
    default: 'view'
  },
  curEditRow: {
    type: Object,
    default: () => ({})
  },
  businessType: {
    type: Number,
    default: 3
  },
  title: {
    type: String,
    default: ''
  },
  projectId: {
    type: String,
    default: ''
  }
})
const showDialog = ref(false)
const open = () => {
  showDialog.value = true
}
open()
const dialogTitle = ref('变更信息')

const emit = defineEmits(['handleBack', 'handle-edit', 'handle-submit'])

// 提交表单
// const submitForm = async () => {
//   if (selectedRowIds.value.length === 0) {
//     ElMessage.warning('请选择人员')
//     return
//   }
//   const params = {
//     queueId: researchStore.curResearchQueueDetail.id,
//     userIds: selectedRowIds.value
//   }
//   const res = await addParticipantsData(params)
//   if (res.code === 10000) {
//     showDialog.value = false
//     ElMessage.success('已新增')
//     emit('handle-submit')
//   }
// }
const handleClose = () => {
  showDialog.value = false
  emit('handleBack')
}

</script>
<style scoped lang="scss">
.newProjectChange {
  :deep(.add_Dialog) {
    display: flex;
    flex-direction: column;
    height: 800px;
    .el-dialog__close {
      color: #91b9cd;
    }
    .el-dialog__header {
      padding-bottom: 12px !important;
    }
    .el-dialog__body {
      overflow: initial;
      box-sizing: border-box;
      height: 0;
      padding: 0;
      padding-bottom: 10px;
      .form-body-container {
        .edit {
          .main-frame {
            .menu-content {
              margin-bottom: 80px;
            }
          }
        }
        .main-frame {
          padding: 0 !important;
          .main-content {
            .common-form-left-menu {
              padding-right: 24px;
              border-right: 1px solid #e8e8e8;
              border-radius: 0;
              header {
                display: none;
              }
              .el-anchor {
                margin-top: 0;
              }
            }
            .menu-content {
              margin-left: 0;

              .common-form-render {
                .common-form {
                  .section {
                    padding-top: 0;
                    .commonUl-li {
                      ul {
                        li {
                          margin-right: 67px;
                          &.width25 {
                            width: calc((100% - 201px)/4);
                          }
                        }
                      }
                    }
                  }
                  .section:not(:first-child) {
                    margin-top: 0;
                  }
                }
                .bottom-btn {
                  position: absolute;
                  right: 0;
                  justify-content: flex-end;
                  height: 80px;
                  padding-right: 24px;
                  border-bottom-left-radius: 4px;
                  border-bottom-right-radius: 4px;
                  box-shadow: none;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
<style>
.newDialog {
  .main-frame {
    .main-content {
      .menu-content {
        .common-form-render {
          .common-form {
            padding-bottom: 80px;
          }
        }
      }
    }
  }
}
</style>
