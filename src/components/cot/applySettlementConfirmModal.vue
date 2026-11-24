<template>
  <el-dialog
    v-model="visible"
    title="申请结算确认"
    :width="pxToRem(480)"
    :close-on-click-modal="false"
    align-center
    class="apply-settlement-modal"
    @closed="onClosed"
  >
    <p class="modal-subtitle">确认是否提交该任务结算申请</p>
    <div v-loading="loading" class="apply-form">
      <div class="form-row">
        <div class="form-item">
          <label>医师姓名：</label>
          <div class="form-value">{{ detail.doctorName || row?.doctorName || '-' }}</div>
        </div>
        <div class="form-item">
          <label>医师职称：</label>
          <div class="form-value">{{ detail.doctorTitle || row?.doctorTitle || '-' }}</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label>科室名称：</label>
          <div class="form-value">{{ detail.deptName || row?.deptName || '-' }}</div>
        </div>
        <div class="form-item">
          <label>结算单编号：</label>
          <div class="form-value">{{ detail.settlementNo || row?.settlementNo || '-' }}</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label>任务ID：</label>
          <div class="form-value">{{ detail.allocateId || '-' }}</div>
        </div>
        <div class="form-item">
          <label>总病历数：</label>
          <div class="form-value">{{ detail.totalCount ?? row?.totalCount ?? '-' }}</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label>完成病历数：</label>
          <div class="form-value">{{ detail.annotationCount ?? row?.completedCount ?? '-' }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="modal-footer">
        <el-button class="modal-btn modal-btn--cancel" :disabled="submitting" @click="visible = false">
          取消
        </el-button>
        <el-button
          class="modal-btn modal-btn--confirm"
          type="primary"
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
export default { name: 'ApplySettlementConfirmModal' }
</script>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getSettlementDetail, expertApplySettlement } from '@/api/api_cot'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  row: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const detail = ref({})
const loading = ref(false)
const submitting = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      detail.value = {}
      loading.value = false
      submitting.value = false
      fetchDetail()
    }
  }
)

async function fetchDetail() {
  if (!props.row?.id) return
  loading.value = true
  const res = await getSettlementDetail({ id: props.row.id })
  if (res.code === 10000) {
    detail.value = res.data || {}
  }
  loading.value = false
}

function onClosed() {
  detail.value = {}
  loading.value = false
  submitting.value = false
}

async function onConfirm() {
  if (!props.row?.id || submitting.value) return
  submitting.value = true
  const res = await expertApplySettlement({ id: props.row.id })
  submitting.value = false
  if (res.code === 10000) {
    ElMessage.success('结算已确认')
    visible.value = false
    emit('success')
  }
}
</script>

<style lang="scss" scoped>
.apply-settlement-modal {
  :deep(.el-dialog__header) {
    padding-bottom: 0;
  }

  :deep(.el-dialog__title) {
    font-weight: 500;
    font-size: 20px;
    color: var(--theme-text);
  }

  :deep(.el-dialog__body) {
    padding: 8px 24px 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 0 24px 24px;
  }
}

.modal-subtitle {
  margin: 0 0 16px;
  font-size: 16px;
  color: var(--theme-text-2);
}

.apply-form {
  box-sizing: border-box;
  padding: 24px;
  background: var(--theme-fill);
}

.form-row {
  display: flex;
  gap: 34px;

  & + .form-row {
    margin-top: 24px;
  }
}

.form-item {
  flex: 1;
  min-width: 0;

  label {
    display: block;
    margin-bottom: 6px;
    font-size: 16px;
    color: var(--theme-text);
  }
}

.form-value {
  overflow: hidden;
  box-sizing: border-box;
  text-overflow: ellipsis;
  font-size: 16px;
  color: var(--theme-text-2);
  white-space: nowrap;
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
