<template>
  <div class="configManage">
    <div class="configInner">
      <div class="pageHead">
        <h2 class="pageTitle">配置管理</h2>
        <p class="pageDesc">统一设置校对流程的自动保存节奏、每日工作量上限与详情页广告位，保存后立即生效。</p>
      </div>
      <section class="configCard">
        <header class="cardHead">
          <div class="cardHeadMain">
            <h3 class="cardTitle">自动保存时间</h3>
            <p class="cardDesc">按 N 阶段分别设置自动保存的时间范围，共 5 个阶段，单位为秒（s）。</p>
          </div>
          <span class="cardTag">单位：s</span>
        </header>
        <div class="stepList">
          <div class="stepRow" v-for="(stepItem, index) in PROOFREAD_STEPS" :key="stepItem.key">
            <div class="stepInfo">
              <span class="stepBadge">{{ stepItem.label }}</span>
              <span class="stepName">{{ stepItem.name }}</span>
            </div>
            <div class="stepRange">
              <el-input-number
                v-model="formData.autoSaveRanges[index].min"
                class="numInput"
                :min="AUTO_SAVE_MIN"
                :max="AUTO_SAVE_MAX"
                :precision="0"
                :controls="false"
                placeholder="起始"
              />
              <span class="rangeSplit">-</span>
              <el-input-number
                v-model="formData.autoSaveRanges[index].max"
                class="numInput"
                :min="AUTO_SAVE_MIN"
                :max="AUTO_SAVE_MAX"
                :precision="0"
                :controls="false"
                placeholder="结束"
              />
              <span class="rangeUnit">s</span>
            </div>
          </div>
        </div>
        <div class="cardTip">
          <el-icon class="tipIcon"><InfoFilled /></el-icon>
          <span>自动保存时间将在范围内随机生成。</span>
        </div>
      </section>

      <section class="configCard">
        <header class="cardHead">
          <div class="cardHeadMain">
            <h3 class="cardTitle">每日校对上限</h3>
            <p class="cardDesc">限制每日可校对（提交）的病历份数，达到上限后当日不再派发新的校对任务。</p>
          </div>
        </header>
        <div class="stepList single">
          <div class="stepRow">
            <div class="stepInfo">
              <span class="stepName">每日可校对份数</span>
            </div>
            <div class="stepRange">
              <el-input-number
                v-model="formData.dailyProofreadLimit"
                class="limitInput"
                :min="DAILY_LIMIT_MIN"
                :max="DAILY_LIMIT_MAX"
                :precision="0"
                :controls="false"
                placeholder="请填写内容"
              />
              <span class="rangeUnit">份 / 天</span>
            </div>
          </div>
        </div>
        <div class="cardTip">
          <el-icon class="tipIcon"><InfoFilled /></el-icon>
          <span>请填写 0-1000 的正整数，填写 0 表示不限制每日校对份数。</span>
        </div>
      </section>

      <section class="configCard">
        <header class="cardHead">
          <div class="cardHeadMain">
            <h3 class="cardTitle">广告配置</h3>
            <p class="cardDesc">
              控制校对详情页右上角广告位是否展示。每条广告由一张图片和一个跳转链接组成，展示时从中随机取一条；最多可添加 {{ AD_SLOT_COUNT }} 条，至少保留 1 条。
            </p>
          </div>
          <div class="adSwitch">
            <span class="switchLabel">展示广告</span>
            <el-switch v-model="formData.adEnabled" />
          </div>
        </header>
        <div class="adPanel" :class="{ 'is-off': !formData.adEnabled }">
          <div class="adRow" v-for="(ad, index) in formData.ads" :key="index">
            <span class="adIndex">{{ index + 1 }}</span>
            <div class="adThumb" :class="{ 'is-empty': !ad.image }" @click="chooseAdImage(index)">
              <img v-if="ad.image" class="adThumbImg" :src="ad.image" alt="广告图片" />
              <div v-else class="adThumbEmpty">
                <el-icon class="thumbIcon"><Plus /></el-icon>
                <span>上传图片</span>
              </div>
              <span v-if="ad.image" class="adThumbMask">更换</span>
            </div>
            <el-input
              v-model="ad.link"
              class="adLinkInput"
              :disabled="!formData.adEnabled"
              placeholder="请填写跳转链接，如 https://example.com"
              clearable
            />
            <el-button
              class="adClear"
              text
              :disabled="!formData.adEnabled || (!ad.image && !ad.link)"
              @click="clearAd(index)"
            >
              清空
            </el-button>
            <el-button
              class="adDelete"
              text
              :disabled="!formData.adEnabled || formData.ads.length <= AD_MIN_COUNT"
              @click="removeAd(index)"
            >
              删除
            </el-button>
          </div>
          <div class="adAddRow">
            <el-button
              class="adAddBtn"
              :disabled="!formData.adEnabled || formData.ads.length >= AD_SLOT_COUNT"
              @click="addAd"
            >
              <el-icon><Plus /></el-icon>
              添加广告（{{ formData.ads.length }} / {{ AD_SLOT_COUNT }}）
            </el-button>
            <span v-if="formData.ads.length >= AD_SLOT_COUNT" class="adAddTip">已达到上限，删除一条后可继续添加</span>
            <span v-else-if="formData.ads.length <= AD_MIN_COUNT" class="adAddTip">至少保留 1 条广告</span>
          </div>
          <input
            ref="adFileInput"
            class="adFileInput"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            @change="onAdFileChange"
          />
        </div>
        <div class="cardTip">
          <el-icon class="tipIcon"><InfoFilled /></el-icon>
          <span>图片建议使用横版（约 8:3），单张不超过 {{ AD_IMAGE_MAX_MB }}MB，保存时会自动压缩；链接需以 http:// 或 https:// 开头。</span>
        </div>
      </section>

      <section class="configCard">
        <header class="cardHead">
          <div class="cardHeadMain">
            <h3 class="cardTitle">标注时间范围</h3>
            <p class="cardDesc">
              控制专家可以在什么时间段进入标注。按工作日与非工作日分别配置，24 小时制，每种最多配置 {{ ANNOTATE_MAX_RANGES }} 个时间段，例如工作日 17:00-21:00。
            </p>
          </div>
          <div class="adSwitch">
            <span class="switchLabel">启用限制</span>
            <el-switch v-model="formData.annotateTimeEnabled" />
          </div>
        </header>
        <div class="timePanel" :class="{ 'is-off': !formData.annotateTimeEnabled }">
          <div
            v-for="dayType in ANNOTATE_DAY_TYPES"
            :key="dayType.key"
            class="timeBlock"
          >
            <div class="timeBlockHead">
              <div class="timeBlockTitle">
                <span class="timeBadge">{{ dayType.label }}</span>
                <span class="timeDesc">{{ dayType.desc }}</span>
              </div>
              <el-button
                class="timeAddBtn"
                text
                :disabled="!formData.annotateTimeEnabled || formData.annotateTime[dayType.key].length >= ANNOTATE_MAX_RANGES"
                @click="addTimeRange(dayType.key)"
              >
                <el-icon><Plus /></el-icon>
                添加时间段
              </el-button>
            </div>
            <div
              v-for="(range, index) in formData.annotateTime[dayType.key]"
              :key="index"
              class="timeRow"
            >
              <span class="timeRowIndex">时段 {{ index + 1 }}</span>
              <el-time-picker
                v-model="formData.annotateTime[dayType.key][index]"
                class="timePicker"
                is-range
                format="HH:mm"
                value-format="HH:mm"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :disabled="!formData.annotateTimeEnabled"
                :clearable="false"
              />
              <el-button
                class="timeDelete"
                text
                :disabled="!formData.annotateTimeEnabled"
                @click="removeTimeRange(dayType.key, index)"
              >
                删除
              </el-button>
            </div>
            <div v-if="!formData.annotateTime[dayType.key].length" class="timeEmpty">
              暂未设置，点击右上角「添加时间段」补充
            </div>
          </div>
        </div>
        <div class="cardTip">
          <el-icon class="tipIcon"><InfoFilled /></el-icon>
          <span>关闭开关后不限制标注时间；开启时工作日至少保留 1 个时间段，开始时间需早于结束时间。</span>
        </div>
      </section>

      <footer class="configFooter">
        <el-button @click="handleReset">恢复默认</el-button>
        <el-button type="primary" @click="handleSave">保 存</el-button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'configManagement'
}
</script>
<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  PROOFREAD_STEPS,
  AUTO_SAVE_MIN,
  AUTO_SAVE_MAX,
  DAILY_LIMIT_MIN,
  DAILY_LIMIT_MAX,
  DEFAULT_AUTO_SAVE_RANGES,
  DEFAULT_DAILY_LIMIT,
  DEFAULT_AD_ENABLED,
  AD_IMAGE_MAX_MB,
  AD_IMAGE_MAX_SIDE,
  AD_IMAGE_MAX_BYTES,
  createEmptyAdSlots,
  AD_SLOT_COUNT,
  AD_MIN_COUNT,
  ANNOTATE_DAY_TYPES,
  ANNOTATE_MAX_RANGES,
  DEFAULT_ANNOTATE_TIME_ENABLED,
  createDefaultAnnotateTime,
  getSystemConfig,
  saveSystemConfig
} from '@/utils/systemConfig'

const formData = reactive(getSystemConfig())

// 广告图片选择：10 个广告位共用一个隐藏的 file input，用下标记录当前操作行
const adFileInput = ref(null)
const uploadingIndex = ref(-1)

// 还原为出厂配置（页面展示 + 本地存储一起回到默认值）
const applyDefault = () => {
  formData.autoSaveRanges = DEFAULT_AUTO_SAVE_RANGES.map((item) => ({ ...item }))
  formData.dailyProofreadLimit = DEFAULT_DAILY_LIMIT
  formData.adEnabled = DEFAULT_AD_ENABLED
  formData.ads = createEmptyAdSlots()
  formData.annotateTimeEnabled = DEFAULT_ANNOTATE_TIME_ENABLED
  formData.annotateTime = createDefaultAnnotateTime()
}

// 打开系统文件选择框
const chooseAdImage = (index) => {
  if (!formData.adEnabled) return
  uploadingIndex.value = index
  const input = adFileInput.value
  if (!input) return
  input.value = ''
  input.click()
}

// 读取文件为 dataURL
const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('read-failed'))
    reader.readAsDataURL(file)
  })

// dataURL 解码为图片对象
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('decode-failed'))
    image.src = src
  })

// 压缩：限制最长边与体积，统一转 JPEG（透明区域铺白底），避免 10 张图撑爆 localStorage
const compressImage = async (file) => {
  const dataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(dataUrl)
  const width = image.naturalWidth || AD_IMAGE_MAX_SIDE
  const height = image.naturalHeight || Math.round(AD_IMAGE_MAX_SIDE * 0.375)
  let scale = Math.min(1, AD_IMAGE_MAX_SIDE / Math.max(width, height))
  let quality = 0.82
  let result = dataUrl
  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    result = canvas.toDataURL('image/jpeg', quality)
    if (result.length <= AD_IMAGE_MAX_BYTES) break
    if (quality > 0.6) {
      quality -= 0.12
    } else {
      scale *= 0.85
    }
  }
  return result
}

const onAdFileChange = async (event) => {
  const file = event.target.files && event.target.files[0]
  const index = uploadingIndex.value
  uploadingIndex.value = -1
  event.target.value = ''
  if (!file || index < 0) return
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    ElMessage.error('仅支持 JPG、PNG、WEBP 格式的图片')
    return
  }
  if (file.size > AD_IMAGE_MAX_MB * 1024 * 1024) {
    ElMessage.error(`图片不能超过 ${AD_IMAGE_MAX_MB}MB`)
    return
  }
  try {
    formData.ads[index].image = await compressImage(file)
  } catch (e) {
    ElMessage.error('图片解析失败，请更换一张图片')
  }
}

// 清空单条广告（图片 + 链接）
const clearAd = (index) => {
  formData.ads[index].image = ''
  formData.ads[index].link = ''
}

// 添加一条广告：最多 10 条
const addAd = () => {
  if (formData.ads.length >= AD_SLOT_COUNT) {
    ElMessage.warning('最多添加 10 条，已经加满了')
    return
  }
  formData.ads.push({ image: '', link: '' })
}

// 删除一条广告：至少保留 1 条
const removeAd = (index) => {
  if (formData.ads.length <= AD_MIN_COUNT) {
    ElMessage.warning('至少保留 1 条广告')
    return
  }
  formData.ads.splice(index, 1)
}

// ===================== 标注时间范围 =====================
// 追加一个时间段（每种类型最多 2 个），默认给一个 17:00-21:00 的常用值
const addTimeRange = (dayKey) => {
  const list = formData.annotateTime[dayKey]
  if (!formData.annotateTimeEnabled) return
  if (list.length >= ANNOTATE_MAX_RANGES) {
    ElMessage.warning(`每种日期最多配置 ${ANNOTATE_MAX_RANGES} 个时间段`)
    return
  }
  list.push(['17:00', '21:00'])
}

// 删除某个时间段
const removeTimeRange = (dayKey, index) => {
  const list = formData.annotateTime[dayKey]
  if (!list.length) return
  list.splice(index, 1)
}

// 时间范围校验：格式合法且开始早于结束
const validateAnnotateTime = () => {
  if (!formData.annotateTimeEnabled) return true
  const workday = formData.annotateTime.workday || []
  if (!workday.length) {
    ElMessage.error('请至少为工作日配置 1 个标注时间段')
    return false
  }
  for (const dayType of ANNOTATE_DAY_TYPES) {
    const list = formData.annotateTime[dayType.key] || []
    for (let index = 0; index < list.length; index++) {
      const range = list[index] || []
      const [start, end] = range
      if (!start || !end) {
        ElMessage.error(`${dayType.label}的第 ${index + 1} 个时间段请填写完整`)
        return false
      }
      if (start >= end) {
        ElMessage.error(`${dayType.label}的第 ${index + 1} 个时间段，开始时间需早于结束时间`)
        return false
      }
    }
  }
  return true
}

// 广告校验：填了任意一项就要成对填写，链接必须是 http(s)
const validateAds = () => {
  if (!formData.adEnabled) return true
  for (let index = 0; index < formData.ads.length; index++) {
    const ad = formData.ads[index]
    const link = (ad.link || '').trim()
    if (!ad.image && !link) continue
    if (!ad.image) {
      ElMessage.error(`第 ${index + 1} 条广告请上传图片`)
      return false
    }
    if (!link) {
      ElMessage.error(`第 ${index + 1} 条广告请填写跳转链接`)
      return false
    }
    if (!/^https?:\/\//i.test(link)) {
      ElMessage.error(`第 ${index + 1} 条广告的链接需以 http:// 或 https:// 开头`)
      return false
    }
  }
  return true
}

// 广告配置快照（保存 / 恢复默认共用）
const buildAdPayload = () => ({
  adEnabled: formData.adEnabled,
  ads: formData.ads.map((ad) => ({ image: ad.image, link: (ad.link || '').trim() }))
})

// 标注时间范围快照
const buildAnnotateTimePayload = () => ({
  annotateTimeEnabled: formData.annotateTimeEnabled,
  annotateTime: {
    workday: (formData.annotateTime.workday || []).map((range) => [...range]),
    weekend: (formData.annotateTime.weekend || []).map((range) => [...range])
  }
})

// 逐项校验：时间范围必须为整数、在取值区间内且起始小于结束
const validateForm = () => {
  for (let index = 0; index < PROOFREAD_STEPS.length; index++) {
    const stepItem = PROOFREAD_STEPS[index]
    const range = formData.autoSaveRanges[index] || {}
    const min = range.min
    const max = range.max
    if (min === null || min === undefined || max === null || max === undefined) {
      ElMessage.error(`请完整填写 ${stepItem.label}（${stepItem.name}）的自动保存时间范围`)
      return false
    }
    if (min < AUTO_SAVE_MIN || max > AUTO_SAVE_MAX) {
      ElMessage.error(`${stepItem.label} 的时间范围需在 ${AUTO_SAVE_MIN}-${AUTO_SAVE_MAX}s 之间`)
      return false
    }
    if (min >= max) {
      ElMessage.error(`${stepItem.label} 的起始时间需小于结束时间`)
      return false
    }
  }
  const limit = formData.dailyProofreadLimit
  if (limit === null || limit === undefined) {
    ElMessage.error('请填写每日校对上限')
    return false
  }
  if (!Number.isInteger(limit) || limit < DAILY_LIMIT_MIN || limit > DAILY_LIMIT_MAX) {
    ElMessage.error(`每日校对上限需为 ${DAILY_LIMIT_MIN}-${DAILY_LIMIT_MAX} 的正整数`)
    return false
  }
  if (!validateAds()) return false
  return validateAnnotateTime()
}

// 本地存储有 5MB 上限，图片过多时给出明确提示而不是静默失败
const persistConfig = () => {
  try {
    saveSystemConfig({
      autoSaveRanges: formData.autoSaveRanges.map((item) => ({ min: item.min, max: item.max })),
      dailyProofreadLimit: formData.dailyProofreadLimit,
      ...buildAdPayload(),
      ...buildAnnotateTimePayload()
    })
    return true
  } catch (e) {
    ElMessage.error('保存失败：本地存储空间不足，请减少广告图片数量或更换更小的图片')
    return false
  }
}

const handleSave = () => {
  if (!validateForm()) return
  if (!persistConfig()) return
  ElMessage.success('配置已保存')
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '恢复默认后，自动保存时间将重置为 30-40s，每日校对上限重置为默认值，广告配置清空为 1 条，标注时间范围恢复为工作日 17:00-21:00，是否继续？',
      '恢复默认',
      {
        confirmButtonText: '恢复默认',
        cancelButtonText: '取 消',
        type: 'warning'
      }
    )
  } catch (e) {
    return
  }
  applyDefault()
  persistConfig()
  ElMessage.success('已恢复默认配置')
}
</script>

<style scoped lang="scss">
.configManage {
  display: flex;
  overflow: auto;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  .configInner {
    box-sizing: border-box;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }
  .pageHead {
    padding: 4px 2px 14px;
    .pageTitle {
      margin: 0;
      padding: 0;
      line-height: 24px;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-text);
    }
    .pageDesc {
      margin: 6px 0 0;
      padding: 0;
      line-height: 20px;
      font-size: 13px;
      color: var(--theme-text-3);
    }
  }
  .configCard {
    box-sizing: border-box;
    width: 100%;
    margin-bottom: 16px;
    padding: 20px 24px 22px;
    border-radius: 8px;
    background-color: var(--theme-card);
  }
  .cardHead {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .cardHeadMain {
      flex: 1;
      min-width: 0;
    }
    .cardTitle {
      margin: 0;
      padding: 0;
      line-height: 22px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
    .cardDesc {
      margin: 6px 0 0;
      padding: 0;
      line-height: 20px;
      font-size: 13px;
      color: var(--theme-text-3);
    }
    .cardTag {
      flex-shrink: 0;
      margin-left: 12px;
      padding: 2px 10px;
      border-radius: 10px;
      background-color: var(--theme-primary-soft);
      line-height: 18px;
      font-size: 12px;
      color: #6b7a94;
    }
  }
  .stepList {
    margin-top: 18px;
    border-top: 1px solid var(--theme-border);
    &.single {
      margin-top: 14px;
      .stepName {
        padding-left: 44px;
      }
    }
    .stepRow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 56px;
      border-bottom: 1px solid var(--theme-border);
      &:last-child {
        border-bottom: none;
      }
    }
    .stepInfo {
      display: flex;
      align-items: center;
      .stepBadge {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        width: 32px;
        height: 22px;
        border-radius: 4px;
        background-color: var(--theme-primary-soft);
        line-height: 22px;
        font-weight: 500;
        font-size: 12px;
        color: var(--theme-primary);
      }
      .stepName {
        margin-left: 12px;
        line-height: 20px;
        font-size: 14px;
        color: #3d4a5c;
      }
    }
    .stepRange {
      display: flex;
      align-items: center;
      .rangeSplit {
        margin: 0 8px;
        font-size: 14px;
        color: #c0c6d1;
      }
      .rangeUnit {
        margin-left: 10px;
        line-height: 20px;
        font-size: 13px;
        color: var(--theme-text-3);
      }
      :deep(.numInput) {
        width: 96px;
        .el-input__wrapper {
          padding: 0 10px;
        }
        .el-input__inner {
          text-align: center;
          font-size: 14px;
        }
      }
      :deep(.limitInput) {
        width: 120px;
        .el-input__wrapper {
          padding: 0 10px;
        }
        .el-input__inner {
          text-align: center;
          font-size: 14px;
        }
      }
    }
  }
  .cardTip {
    display: flex;
    align-items: center;
    margin-top: 16px;
    padding: 9px 12px;
    border-radius: 6px;
    background-color: var(--theme-primary-soft);
    line-height: 18px;
    font-size: 12.5px;
    color: #5a6b87;
    .tipIcon {
      flex-shrink: 0;
      margin-right: 6px;
      font-size: 14px;
      color: var(--theme-primary);
    }
  }
  .adSwitch {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 16px;
    padding-top: 2px;
    .switchLabel {
      margin-right: 8px;
      line-height: 20px;
      font-size: 13px;
      color: #3d4a5c;
    }
  }
  .adPanel {
    margin-top: 14px;
    border-top: 1px solid var(--theme-border);
    &.is-off {
      opacity: 0.55;
    }
    .adRow {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--theme-border);
      &:last-of-type {
        border-bottom: none;
      }
    }
    .adIndex {
      flex-shrink: 0;
      width: 30px;
      line-height: 20px;
      font-size: 13px;
      color: var(--theme-text-3);
    }
    .adThumb {
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      box-sizing: border-box;
      width: 132px;
      height: 52px;
      border: 1px dashed #d5dce8;
      border-radius: 6px;
      background-color: var(--theme-primary-soft);
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;
      &:hover {
        border-color: var(--theme-primary);
        background-color: var(--theme-primary-soft);
        .adThumbMask {
          opacity: 1;
        }
      }
      .adThumbImg {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .adThumbEmpty {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        line-height: 18px;
        font-size: 12px;
        color: var(--theme-text-3);
        .thumbIcon {
          margin-right: 4px;
          font-size: 14px;
        }
      }
      .adThumbMask {
        display: flex;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        justify-content: center;
        align-items: center;
        height: 18px;
        background-color: rgba(8, 24, 60, 0.52);
        opacity: 0;
        line-height: 18px;
        font-size: 12px;
        color: #fff;
        transition: opacity 0.2s;
      }
    }
    .adLinkInput {
      flex: 1;
      margin: 0 12px;
      :deep(.el-input__inner) {
        font-size: 13px;
      }
    }
    .adClear {
      flex-shrink: 0;
      font-size: 13px;
    }
    .adDelete {
      flex-shrink: 0;
      margin-left: 4px;
      font-size: 13px;
      color: #e15b52;
    }
    .adAddRow {
      display: flex;
      align-items: center;
      padding-top: 14px;
      gap: 12px;

      .adAddBtn {
        height: 32px;
        padding: 0 14px;
        border: 1px dashed #b9cdf7;
        border-radius: 6px;
        background: var(--theme-primary-soft);
        font-size: 13px;
        color: var(--theme-primary);

        &:hover {
          border-color: var(--theme-primary);
          background: var(--theme-primary-soft);
        }

        &.is-disabled {
          border-color: var(--theme-border);
          background: var(--theme-primary-soft);
          color: #a3abbd;
        }
      }

      .adAddTip {
        line-height: 20px;
        font-size: 12px;
        color: var(--theme-text-3);
      }
    }
    .adFileInput {
      display: none;
    }
  }

  /* 标注时间范围 */
  .timePanel {
    margin-top: 14px;
    border-top: 1px solid var(--theme-border);

    &.is-off {
      opacity: 0.55;
    }
  }

  .timeBlock {
    padding: 14px 0 6px;

    &:not(:last-child) {
      border-bottom: 1px dashed var(--theme-border);
    }
  }

  .timeBlockHead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .timeBlockTitle {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .timeBadge {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 10px;
    border-radius: 11px;
    background: var(--theme-primary-soft);
    font-size: 12px;
    color: var(--theme-primary);
  }

  .timeDesc {
    font-size: 12px;
    color: var(--theme-text-3);
  }

  .timeAddBtn {
    font-size: 13px;
    color: var(--theme-primary);

    &.is-disabled {
      color: #b9c0cd;
    }
  }

  .timeRow {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 12px;

    .timeRowIndex {
      flex-shrink: 0;
      width: 52px;
      font-size: 13px;
      color: #6b7a94;
    }

    .timePicker {
      width: 240px;
    }

    .timeDelete {
      font-size: 13px;
      color: #e15b52;
    }
  }

  .timeEmpty {
    padding: 10px 0 14px;
    font-size: 13px;
    color: #a3abbd;
  }
  .configFooter {
    display: flex;
    position: sticky;
    bottom: 0;
    z-index: 8;
    justify-content: flex-end;
    align-items: center;
    margin-top: 4px;
    padding: 12px 0;
    border-top: 1px solid var(--theme-border);
    background: var(--theme-bg);
    box-shadow: 0 -6px 16px rgba(31, 58, 105, 0.06);
    .el-button {
      min-width: 88px;
    }
  }
}
</style>
