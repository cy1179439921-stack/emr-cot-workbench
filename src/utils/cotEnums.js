// COT 相关模块的数字状态枚举与映射关系
// 约定：状态/进度值一律以数字存储，展示时通过映射对象转换为中文标签。
// 注意：以下数字编码需与后端保持一致（后端若返回固定编码，以本文件为准对齐）。

// ===================== COT 标注任务状态 =====================
// COT 标注任务状态：0 标注中 / 1 已完成 / 2 未完成
export const COT_TASK_STATUS = {
  0: '标注中',
  1: '已完成',
  2: '未完成'
}

// COT 标注任务状态对应的 el-tag 颜色
export const COT_TASK_STATUS_TAG = {
  0: 'primary',
  1: 'success',
  2: 'info'
}

// ===================== 专家端任务状态（新接口 /api/expert/task/page） =====================
// 任务状态：0 待处理 / 1 进行中 / 2 已完成
export const EXPERT_TASK_STATUS = {
  0: '未完成',
  1: '标注中',
  2: '已完成'
}

// 专家端任务状态对应的 el-tag 颜色
export const EXPERT_TASK_STATUS_TAG = {
  0: 'info',
  1: 'primary',
  2: 'success'
}

// 专家端任务状态下拉选项（value 为数字状态码）
export const EXPERT_TASK_STATUS_OPTIONS = Object.keys(EXPERT_TASK_STATUS).map((key) => ({
  value: Number(key),
  label: EXPERT_TASK_STATUS[key]
}))

// 专家端任务数字状态 → 中文标签（找不到时回退原值，便于排查）
export function getExpertTaskStatusLabel(value) {
  return EXPERT_TASK_STATUS[value] !== undefined ? EXPERT_TASK_STATUS[value] : value
}

// ===================== 劳务结算状态（专家工作台 / 劳务结算共用） =====================
// 结算单状态：待申请 → 申请中 → 待确认 → 打款中 → 已结清（归档仍显示已结清）；异常分支：已驳回
export const SETTLE_STATUS = {
  UNSETTLED: '待申请',
  PENDING_CONFIRM: '申请中',
  WAITING_EXPERT_CONFIRM: '待确认',
  WAITING_PAYMENT: '打款中',
  SETTLED: '已结清',
  REJECTED: '已驳回'
}

export const SETTLE_STATUSALL = {
  UNSETTLED: '待申请',
  PENDING_CONFIRM: '申请中',
  WAITING_EXPERT_CONFIRM: '待确认',
  WAITING_PAYMENT: '打款中',
  SETTLED: '已结清',
  ARCHIVED: '已结清',
  REJECTED: '已驳回'
}

// ===================== 下拉选项（value 统一为数字） =====================
// COT 标注任务状态下拉选项（value 为数字状态码）
export const COT_TASK_STATUS_OPTIONS = Object.keys(COT_TASK_STATUS).map((key) => ({
  value: Number(key),
  label: COT_TASK_STATUS[key]
}))

// 劳务结算状态下拉选项（value 为数字状态码）
export const SETTLE_STATUS_OPTIONS = Object.keys(SETTLE_STATUS).map((key) => ({
  value: key,
  label: SETTLE_STATUS[key]
}))

// 标注任务数字状态 → 中文标签（找不到时回退原值，便于排查）
export function getCotTaskStatusLabel(value) {
  return COT_TASK_STATUS[value] !== undefined ? COT_TASK_STATUS[value] : value
}

// 结算数字状态 → 中文标签（找不到时回退原值，便于排查）
export function getSettleStatusLabel(value) {
  return SETTLE_STATUS[value] !== undefined ? SETTLE_STATUS[value] : value
}
