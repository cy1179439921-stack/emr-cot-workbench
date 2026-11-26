// 系统配置（系统管理-配置管理）读取与持久化
// 演示环境无后端接口，配置统一存在浏览器本地，页面刷新后仍保留

// 校对流程的 5 个阶段
export const PROOFREAD_STEPS = [
  { key: 'n1', label: 'N1', name: '初始呈象' },
  { key: 'n2', label: 'N2', name: '检查策略' },
  { key: 'n3', label: 'N3', name: '病情锚定' },
  { key: 'n4', label: 'N4', name: '方案抉择' },
  { key: 'n5', label: 'N5', name: '长程应变' }
]

// 自动保存时间默认范围：每个 N 阶段均为 30-40s
export const DEFAULT_AUTO_SAVE_RANGES = PROOFREAD_STEPS.map(() => ({ min: 30, max: 40 }))
// 每日校对上限默认值
export const DEFAULT_DAILY_LIMIT = 50
// 标注次数默认值与取值范围（每次标注的病历份数）
export const DEFAULT_ANNOTATE_TIMES = 10
export const ANNOTATE_TIMES_MIN = 1
export const ANNOTATE_TIMES_MAX = 100
// 自动保存时间取值范围（秒）
export const AUTO_SAVE_MIN = 1
export const AUTO_SAVE_MAX = 3600
// 每日校对上限取值范围
export const DAILY_LIMIT_MIN = 0
export const DAILY_LIMIT_MAX = 1000
// 广告位：可添加删除，最多 10 条、最少 1 条
export const AD_SLOT_COUNT = 10
export const AD_MIN_COUNT = 1
// 广告总开关默认值（默认展示，未配置自定义广告时回落到内置宣传图）
export const DEFAULT_AD_ENABLED = true
// 单张广告图片允许的原始文件大小（MB）
export const AD_IMAGE_MAX_MB = 5
// 广告图片压缩后的最长边（px）与体积上限（byte），避免撑爆本地存储
export const AD_IMAGE_MAX_SIDE = 960
export const AD_IMAGE_MAX_BYTES = 380 * 1024

const STORAGE_KEY = 'cot-system-config'

// 生成空广告位（默认 1 条，最多 10 条）
export const createEmptyAdSlots = (count = AD_MIN_COUNT) =>
  Array.from({ length: Math.min(Math.max(count, AD_MIN_COUNT), AD_SLOT_COUNT) }, () => ({ image: '', link: '' }))

// ===================== 标注时间范围 =====================
// 按工作日 / 非工作日分别配置，每天最多 2 个时间段，24 小时制
export const ANNOTATE_DAY_TYPES = [
  { key: 'workday', label: '工作日', desc: '周一至周五' },
  { key: 'weekend', label: '非工作日', desc: '周六、周日及法定节假日' }
]
// 每个类型最多可配置的时间段数量
export const ANNOTATE_MAX_RANGES = 2
export const DEFAULT_ANNOTATE_TIME_ENABLED = true
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

// 默认：工作日 17:00-21:00，非工作日不开放
export const createDefaultAnnotateTime = () => ({
  workday: [['17:00', '21:00']],
  weekend: []
})

const normalizeTimeRange = (range) => {
  if (!Array.isArray(range) || range.length !== 2) return null
  const [start, end] = range
  if (!TIME_PATTERN.test(start || '') || !TIME_PATTERN.test(end || '')) return null
  if (start >= end) return null
  return [start, end]
}

const normalizeDayRanges = (ranges) => {
  if (!Array.isArray(ranges)) return []
  return ranges
    .map(normalizeTimeRange)
    .filter(Boolean)
    .slice(0, ANNOTATE_MAX_RANGES)
}

const normalizeAnnotateTime = (value) => {
  const fallback = createDefaultAnnotateTime()
  if (!value || typeof value !== 'object') return fallback
  const workday = normalizeDayRanges(value.workday)
  const weekend = normalizeDayRanges(value.weekend)
  return {
    workday: workday.length ? workday : fallback.workday,
    weekend
  }
}

const cloneDefaults = () => ({
  autoSaveRanges: DEFAULT_AUTO_SAVE_RANGES.map((item) => ({ ...item })),
  dailyProofreadLimit: DEFAULT_DAILY_LIMIT,
  annotateTimes: DEFAULT_ANNOTATE_TIMES,
  adEnabled: DEFAULT_AD_ENABLED,
  ads: createEmptyAdSlots(),
  annotateTimeEnabled: DEFAULT_ANNOTATE_TIME_ENABLED,
  annotateTime: createDefaultAnnotateTime()
})

// 广告项只接受「data:image 开头的图片 + http(s) 链接」，其余一律视为空位
const normalizeAd = (ad) => {
  const empty = { image: '', link: '' }
  if (!ad || typeof ad !== 'object') return empty
  const image = typeof ad.image === 'string' && ad.image.startsWith('data:image/') ? ad.image : ''
  const rawLink = typeof ad.link === 'string' ? ad.link.trim() : ''
  const link = /^https?:\/\//i.test(rawLink) ? rawLink : ''
  return { image, link }
}

const normalizeAds = (ads) => {
  if (!Array.isArray(ads) || !ads.length) return createEmptyAdSlots()
  return ads
    .slice(0, AD_SLOT_COUNT)
    .map(normalizeAd)
}

// 只接受合法范围，非法值回落到默认，避免本地脏数据把页面打乱
const normalizeRange = (range) => {
  const min = Number(range && range.min)
  const max = Number(range && range.max)
  if (!Number.isInteger(min) || !Number.isInteger(max)) return null
  if (min < AUTO_SAVE_MIN || max > AUTO_SAVE_MAX || min >= max) return null
  return { min, max }
}

const normalizeLimit = (value) => {
  const limit = Number(value)
  if (!Number.isInteger(limit) || limit < DAILY_LIMIT_MIN || limit > DAILY_LIMIT_MAX) return null
  return limit
}

// 标注次数：只接受 1-100 的正整数
const normalizeAnnotateTimes = (value) => {
  const times = Number(value)
  if (!Number.isInteger(times) || times < ANNOTATE_TIMES_MIN || times > ANNOTATE_TIMES_MAX) return null
  return times
}

// 读取配置：缺失或损坏时回落到默认值
export function getSystemConfig() {
  const config = cloneDefaults()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return config
    const saved = JSON.parse(raw)
    if (Array.isArray(saved.autoSaveRanges) && saved.autoSaveRanges.length === PROOFREAD_STEPS.length) {
      saved.autoSaveRanges.forEach((item, index) => {
        const range = normalizeRange(item)
        if (range) config.autoSaveRanges[index] = range
      })
    }
    const limit = normalizeLimit(saved.dailyProofreadLimit)
    if (limit !== null) config.dailyProofreadLimit = limit
    const annotateTimes = normalizeAnnotateTimes(saved.annotateTimes)
    if (annotateTimes !== null) config.annotateTimes = annotateTimes
    if (typeof saved.adEnabled === 'boolean') config.adEnabled = saved.adEnabled
    if (Array.isArray(saved.ads)) config.ads = normalizeAds(saved.ads)
    if (typeof saved.annotateTimeEnabled === 'boolean') config.annotateTimeEnabled = saved.annotateTimeEnabled
    config.annotateTime = normalizeAnnotateTime(saved.annotateTime)
  } catch (e) {
    console.warn('[系统配置] 本地配置解析失败，使用默认值', e)
  }
  return config
}

// 保存配置
export function saveSystemConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// 取当前生效的广告：关闭或无自定义图片时返回 null，由调用方回落到内置宣传图
export function pickVisibleAd(config) {
  const cfg = config || getSystemConfig()
  if (!cfg.adEnabled) return null
  const usable = cfg.ads.filter((ad) => ad.image)
  if (!usable.length) return null
  return usable[Math.floor(Math.random() * usable.length)]
}

// 恢复默认后同步落库，保持「默认值也是当前生效值」
export function resetSystemConfig() {
  const config = cloneDefaults()
  saveSystemConfig(config)
  return config
}
