// ===================== 标注时段 =====================
// 时段来源：系统管理 - 配置管理 - 标注时间范围（工作日 / 非工作日各最多 2 段）
// 首页展示今日可标注时段，并在非开放时段阻止进入标注。
import { ElMessageBox } from 'element-plus'
import { getSystemConfig } from '@/utils/systemConfig'

// 周六、周日按「非工作日」处理
const isRestDay = (date) => [0, 6].includes(date.getDay())

const toMinutes = (time) => {
  const [hour, minute] = String(time).split(':').map(Number)
  return hour * 60 + minute
}

// 时间段格式化为「17:00-21:00」，多段用顿号连接
const formatRanges = (ranges) => (ranges || []).map(([start, end]) => `${start}-${end}`).join('、')

// 今日标注时段状态
// status：free 未启用限制 / open 正在开放 / before 未到时间 / after 今日已结束 / closed 今日不开放
export function getAnnotateTimeState(config, date = new Date()) {
  const cfg = config || getSystemConfig()
  const restDay = isRestDay(date)
  const dayLabel = restDay ? '非工作日' : '工作日'
  const rules = cfg.annotateTime || {}
  const workdayRanges = rules.workday || []
  const weekendRanges = rules.weekend || []
  const ranges = restDay ? weekendRanges : workdayRanges
  const weekText = `工作日 ${formatRanges(workdayRanges) || '不开放'} · 非工作日 ${formatRanges(weekendRanges) || '不开放'}`

  if (!cfg.annotateTimeEnabled) {
    return { enabled: false, dayLabel, ranges, weekText, todayText: '全天可标注', status: 'free', within: true }
  }
  if (!ranges.length) {
    return { enabled: true, dayLabel, ranges, weekText, todayText: '今日不开放', status: 'closed', within: false }
  }

  const now = date.getHours() * 60 + date.getMinutes()
  let within = false
  let beforeStart = false
  ranges.forEach(([start, end]) => {
    if (now >= toMinutes(start) && now < toMinutes(end)) within = true
    if (now < toMinutes(start)) beforeStart = true
  })

  return {
    enabled: true,
    dayLabel,
    ranges,
    weekText,
    todayText: formatRanges(ranges),
    status: within ? 'open' : beforeStart ? 'before' : 'after',
    within
  }
}

// 首页时段卡片右侧的状态文案
export const ANNOTATE_STATUS_TEXT = {
  free: '全天可标注',
  open: '正在开放',
  before: '不在时段',
  after: '不在时段',
  closed: '今日不开放'
}

// 非开放时段的友好提醒：统一说「不在标注时段内」，不区分没到点 / 已过点
export function showAnnotateTimeTip(state) {
  const tip = state || getAnnotateTimeState()
  const isClosed = tip.status === 'closed'
  const html = isClosed
    ? `今天（${tip.dayLabel}）标注暂不开放。<br>开放时段：<b>${tip.weekText}</b>。<br>请在标注时间内操作，到点再来就好。`
    : `今天（${tip.dayLabel}）的标注时段是 <b>${tip.todayText}</b>。<br>请在标注时间内操作，到点再进来就好，任务和进度都替你留着。`

  return ElMessageBox.alert(html, '现在不在标注时段内', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '我知道了',
    customClass: 'annotateTimeTip',
    type: 'info'
  }).catch(() => {})
}

// 进入标注前的统一校验：不在时段内就提醒并拦截
export function ensureAnnotateTime() {
  const state = getAnnotateTimeState()
  if (state.within) return true
  showAnnotateTimeTip(state)
  return false
}
