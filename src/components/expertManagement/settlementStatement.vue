<template>
  <!-- 离屏渲染：供 html2canvas 截图导出，不在页面上显示 -->
  <div ref="captureEl" class="statementSheet">
    <header class="sheetHead">
      <div class="brand">
        <div class="brandMark"><i class="iconfont icon-danjujichuxinxi" /></div>
        <div class="brandText">
          <h1>结算单</h1>
          <p>EMR-COT ANNOTATION PLATFORM</p>
        </div>
      </div>
      <div class="sheetNo">
        编号：<em>{{ data.settlementNo || '-' }}</em>
      </div>
    </header>

    <!-- 单据基础信息 -->
    <section class="sheetCard">
      <div class="cardTitle">
        <i class="iconfont icon-danjujichuxinxi" />
        <h2>单据基础信息</h2>
      </div>
      <div class="fieldGrid cols3">
        <div class="field">
          <span class="fieldLabel">单据状态</span>
          <span class="fieldValue">
            <span class="statusChip" :class="statusClass"><i class="chipDot" />{{ statusText }}</span>
          </span>
        </div>
        <div class="field">
          <span class="fieldLabel">医师职称</span>
          <span class="fieldValue">{{ data.doctorTitle || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">单据生成时间</span>
          <span class="fieldValue">{{ data.createTime || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">医生姓名</span>
          <span class="fieldValue">{{ data.doctorName || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">执业科室</span>
          <span class="fieldValue">{{ data.deptName || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">创建人</span>
          <span class="fieldValue">{{ data.creator || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">执业医院</span>
          <span class="fieldValue">{{ data.hospitalName || '--' }}</span>
        </div>
      </div>
    </section>

    <!-- 薪酬核算 -->
    <section class="sheetCard">
      <div class="cardTitle">
        <i class="iconfont icon-xinchouhesuan" />
        <h2>薪酬核算</h2>
      </div>
      <div class="fieldGrid cols3">
        <div class="field">
          <span class="fieldLabel">标注病历数</span>
          <span class="fieldValue">{{ data.annotationCount || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">标注单价</span>
          <span class="fieldValue">{{ unitPriceText }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">税前合集总额</span>
          <span class="fieldValue">{{ beforeTaxText }}</span>
        </div>
      </div>
    </section>

    <!-- 收款账户信息 -->
    <section class="sheetCard">
      <div class="cardTitle">
        <i class="iconfont icon-shoukuanzhanghuxinxi" />
        <h2>收款账户信息</h2>
      </div>
      <div class="fieldGrid colsAccount">
        <div class="field">
          <span class="fieldLabel">开户人姓名</span>
          <span class="fieldValue">{{ data.accountName || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">银行卡号</span>
          <span class="fieldValue">{{ data.bankNo || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">完整开户行</span>
          <span class="fieldValue">{{ data.bankBranch || '--' }}</span>
        </div>
        <div class="field">
          <span class="fieldLabel">银行预留手机号</span>
          <span class="fieldValue">{{ data.bankPhone || '--' }}</span>
        </div>
      </div>
    </section>

    <!-- 打款信息 -->
    <section class="sheetCard">
      <div class="cardTitle">
        <i class="iconfont icon-dakuanxinxi" />
        <h2>打款信息</h2>
      </div>
      <div class="fieldGrid cols1">
        <div class="field">
          <span class="fieldLabel">银行打款流水号</span>
          <span class="fieldValue">{{ data.transferNo || '--' }}</span>
        </div>
      </div>
    </section>

    <footer class="sheetFoot">
      <div class="footLeft">
        <i class="iconfont icon-anquan1" />
        <span>本结算单由 EMR-COT 标注平台生成，仅用于服务结算确认</span>
      </div>
      <div class="footRight">
        <span>下载时间：{{ downloadTime }}</span>
        <span class="footPage">第 1 页 / 第 1 页</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { SETTLE_STATUSALL } from '@/utils/cotEnums'
import { exportElementToPdf } from '@/utils/settlementPdf'
import { onboardingState } from '@/utils/onboarding'
import { DEMO_USER } from '@/mock/demoUser'

const captureEl = ref(null)
const downloadTime = ref('')
const data = reactive({
  settlementNo: '',
  settlementStatus: '',
  doctorTitle: '',
  createTime: '',
  doctorName: '',
  deptName: '',
  creator: '',
  hospitalName: '',
  annotationCount: '',
  unitPrice: '',
  beforeTaxAmount: '',
  accountName: '',
  bankNo: '',
  bankBranch: '',
  bankPhone: '',
  transferNo: ''
})

const statusText = computed(() => data.settlementStatusDesc || SETTLE_STATUSALL[data.settlementStatus] || data.settlementStatus || '--')

// 状态色：待打款/已结清绿、待申请黄、已驳回红、其余蓝
const statusClass = computed(() => {
  const s = data.settlementStatus
  if (['SETTLED', 'ARCHIVED', 'WAITING_PAYMENT'].includes(s)) return 'is-success'
  if (['UNSETTLED', 'WAITING_EXPERT_CONFIRM'].includes(s)) return 'is-warning'
  if (s === 'REJECTED') return 'is-danger'
  return 'is-primary'
})

const unitPriceText = computed(() => (data.unitPrice === '' || data.unitPrice === null ? '--' : `¥${Number(data.unitPrice).toFixed(2)}`))
const beforeTaxText = computed(() => (data.beforeTaxAmount === '' || data.beforeTaxAmount === null ? '--' : `¥${Number(data.beforeTaxAmount).toFixed(2)}`))

const pad = (n) => String(n).padStart(2, '0')
const nowText = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * 导出结算单 PDF
 * @param {object} row 结算单数据（列表行 / 详情）
 * @param {string} [fileName]
 */
async function download(row = {}, fileName) {
  Object.keys(data).forEach((key) => {
    data[key] = row[key] !== undefined && row[key] !== null ? row[key] : ''
  })
  // 列表里可能没有的字段，按「接口 → 入驻资料 → 演示账号」逐级兜底
  const applyForm = onboardingState.form || {}
  data.hospitalName = row.hospitalName || row.agencyName || applyForm.hospitalName || DEMO_USER.agencyName || ''
  data.doctorTitle = data.doctorTitle || applyForm.titleLevel || ''
  data.deptName = data.deptName || applyForm.departmentCategory || ''
  data.settlementStatusDesc = row.settlementStatusDesc || ''
  data.bankPhone = row.bankPhone || row.bankAccount?.bankPhone || DEMO_USER.phone || ''
  data.accountName = data.accountName || DEMO_USER.userName || ''
  data.transferNo = row.transferNo || ''
  downloadTime.value = nowText()

  // 等一帧，确保离屏 DOM 已按最新数据渲染
  await new Promise((resolve) => requestAnimationFrame(() => resolve()))
  await exportElementToPdf(captureEl.value, fileName || `结算单_${data.settlementNo || '未命名'}`)
}

defineExpose({ download })
</script>

<style scoped lang="scss">
/* 离屏容器：不参与布局，但保持真实渲染尺寸，保证截图清晰 */
.statementSheet {
  position: fixed;
  left: -10000px;
  top: 0;
  z-index: -1;
  box-sizing: border-box;
  width: 794px;
  padding: 32px 32px 24px;
  background: #f4f6fb;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  color: #1f2d3d;
}

.sheetHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 22px;
  padding: 4px 2px;

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brandMark {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #2f6bff;
    font-size: 24px;
    color: #fff;
  }

  .brandText {
    h1 {
      margin: 0;
      font-weight: 700;
      font-size: 28px;
      color: #101828;
      letter-spacing: 2px;
    }

    p {
      margin: 4px 0 0;
      font-size: 11px;
      color: #8a94a6;
      letter-spacing: 2px;
    }
  }

  .sheetNo {
    padding-top: 10px;
    font-size: 13px;
    color: #5b6b82;

    em {
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      color: #2f6bff;
    }
  }
}

.sheetCard {
  margin-bottom: 14px;
  padding: 18px 20px 20px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(31, 45, 61, 0.04);

  .cardTitle {
    display: flex;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #eef1f6;
    gap: 8px;

    .iconfont {
      font-size: 17px;
      color: #2f6bff;
    }

    h2 {
      margin: 0;
      font-weight: 600;
      font-size: 16px;
      color: #101828;
    }
  }
}

.fieldGrid {
  display: grid;
  padding-top: 14px;
  gap: 14px 18px;

  &.cols3 {
    grid-template-columns: repeat(3, 1fr);
  }

  &.cols4 {
    grid-template-columns: repeat(4, 1fr);
  }

  // 收款账户：银行卡号较长，给它更多宽度，避免数字折行
  &.colsAccount {
    grid-template-columns: 0.9fr 1.45fr 1.45fr 1fr;
  }

  &.cols1 {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.fieldLabel {
  font-size: 12px;
  color: #8a94a6;
}

.fieldValue {
  font-weight: 600;
  font-size: 15px;
  color: #1f2d3d;
  word-break: break-all;
}

.statusChip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 13px;
  gap: 6px;

  .chipDot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentcolor;
  }

  &.is-warning {
    background: #fff7e6;
    color: #d48806;
  }

  &.is-success {
    background: #eaf7ee;
    color: #2f9e44;
  }

  &.is-danger {
    background: #fdecec;
    color: #d93025;
  }

  &.is-primary {
    background: #eef3ff;
    color: #2f6bff;
  }
}

.sheetFoot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e6ebf2;
  font-size: 11px;
  color: #8a94a6;

  .footLeft {
    display: flex;
    align-items: center;
    gap: 6px;

    .iconfont {
      font-size: 13px;
      color: #2f6bff;
    }
  }

  .footRight {
    display: flex;
    align-items: center;
    gap: 18px;
  }
}
</style>
