<template>
  <el-dialog
    v-model="visible"
    title="结算协议"
    :width="pxToRem(600)"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    modal-class="settlement-confirm-overlay"
    class="settlement-confirm-modal"
    @closed="onClosed"
  >
    <p class="modal-subtitle">请阅读并勾选同意协议后完成结算确认。</p>

    <div class="agreement-box">
      <h4 class="agreement-box__title">结算确认协议</h4>
      <p class="agreement-box__text">
        本人确认本结算单所列任务、完成病历数、单价、薪酬核算金额及收款账户信息无误。
      </p>
      <p class="agreement-box__text">
        确认后，平台将进入后续打款流程；如信息存在问题，请选择驳回并填写原因。
      </p>
    </div>

    <el-checkbox v-model="agreeChecked" class="modal-agree-check">
      我已阅读并同意结算协议
    </el-checkbox>

    <template #footer>
      <div class="modal-footer">
        <el-button
          class="modal-btn modal-btn--cancel"
          :disabled="submitting"
          @click="visible = false"
        >
          取消
        </el-button>
        <el-button
          class="modal-btn modal-btn--confirm"
          type="primary"
          :disabled="!agreeChecked || submitting"
          :loading="submitting"
          @click="onConfirm"
        >
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default { name: 'SettlementConfirmModal' }
</script>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { expertConfirmSettlement } from '@/api/api_cot'

const props = defineProps({
  // 弹窗显隐（v-model）
  modelValue: { type: Boolean, default: false },
  // 当前选中行数据，用于取 id 调用确认接口
  row: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 弹窗显隐计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 是否已勾选同意协议
const agreeChecked = ref(false)
// 提交中状态
const submitting = ref(false)

// 监听弹窗打开，重置勾选与提交状态
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      agreeChecked.value = false
      submitting.value = false
    }
  }
)

// 弹窗关闭后清理状态
function onClosed() {
  agreeChecked.value = false
  submitting.value = false
}

// 点击确认，调用专家结算申请接口
async function onConfirm() {
  if (!props.row?.id || !agreeChecked.value) return
  submitting.value = true
  const res = await expertConfirmSettlement({ id: props.row.id })
  if (res.code === 10000) {
    ElMessage.success('结算已确认')
    visible.value = false
    emit('success')
  }
  submitting.value = false
}
</script>

<style lang="scss" scoped>

:deep(.el-dialog__title) {
  line-height: 29px;
  font-weight: 500;
  font-size: 20px;
  color: var(--theme-text);
}

.modal-subtitle {
  margin: 0;
  line-height: 23px;
  font-size: 16px;
  color: var(--theme-text-2);
}

.agreement-box {
  box-sizing: border-box;
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  background: var(--theme-fill);
}

.agreement-box__title {
  margin: 0;
  line-height: 26px;
  font-weight: 500;
  font-size: 18px;
  color: var(--theme-text);
}

.agreement-box__text {
  margin: 10px 0 0;
  line-height: 24px;
  font-size: 16px;
  color: var(--theme-text-2);
}

.modal-agree-check {
  margin-top: 16px;

  :deep(.el-checkbox__label) {
    padding-left: 8px;
    line-height: 20px;
    font-size: 16px;
    color: var(--theme-text-2);
  }

  :deep(.el-checkbox__inner) {
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    border-color: var(--theme-primary);
    background: var(--theme-primary);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.modal-btn {
  box-sizing: border-box;
  width: 86px;
  height: 39px;
  padding: 0;
  border-radius: 2px;
  font-size: 16px;
}

.modal-btn--cancel {
  border: 1px solid #d8d8d8;
  background: transparent;
  color: var(--theme-text-2);
}

.modal-btn--confirm {
  border: none;
  background: var(--theme-primary);
  color: #fff;
}
</style>
<style lang="scss">
.settlement-confirm-modal {
  :deep(.el-dialog__title) {
    font-size: 20px;
  }
}
</style>
