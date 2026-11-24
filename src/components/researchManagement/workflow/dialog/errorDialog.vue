<template>
  <el-dialog title="提示" v-model="visibleDialog" :width="520">
    <div class="ant-confirm-body">
      <i class="anticon anticon-close-circle" style="color: #f00;"></i>
      <span class="ant-confirm-title">当前无法发布</span>
      <div class="ant-confirm-content">
        <div>
          <p class="error-modal-desc">以下内容不完善，需进行修改</p>
          <div class="error-modal-list">
            <div class="error-modal-item" v-for="(item,index) in list" :key="index">
              <div class="error-modal-item-label">流程设计</div>
              <div class="error-modal-item-content">{{item.name}} 未选择{{item.type}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="visibleDialog = false">我知道了</el-button>
      <el-button type="primary" @click="visibleDialog = false">前往修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  visible: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['update:visible'])

const visibleDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('update:visible', val)
  }
})
</script>

<style scoped>
.ant-confirm-body .ant-confirm-title {
  display: block;
  overflow: hidden;
  line-height: 1.4;
  font-weight: 500;
  font-size: 16px;
  color: rgba(0, 0, 0, .85);
}

.ant-confirm-body .ant-confirm-content {
  margin-left: 38px;
  margin-top: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, .65);
}

.ant-confirm-body>.anticon {
  float: left;
  margin-right: 16px;
  font-size: 22px;
}
</style>
