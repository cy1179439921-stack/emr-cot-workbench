<template>
  <div class="container">
    <!-- 头部返回与标题 -->
    <header class="pageHeader">
      <commonGoBack :upperLevel="true">
        <div class="line"></div>
        <div class="title">结算单详情</div>
      </commonGoBack>
    </header>

    <div class="mainContent">
      <!-- 左侧锚点菜单 -->
      <div class="leftContainer">
        <div class="menuTitle">结算单</div>
        <el-anchor
          v-if="containerRef"
          :container="containerRef"
          direction="vertical"
          :bound="30"
          :offset="30"
          :marker="false"
          @click="handleClick"
          @change="scrollTo"
        >
          <el-anchor-link href="#baseInfo">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>单据基础信息</span>
          </el-anchor-link>
          <el-anchor-link href="#compensation">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>薪酬核算</span>
          </el-anchor-link>
          <el-anchor-link href="#expertConfirm">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>专家确认</span>
          </el-anchor-link>
          <el-anchor-link href="#accountInfo">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>收款账户信息</span>
          </el-anchor-link>
          <el-anchor-link href="#paymentInfo">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>打款信息</span>
          </el-anchor-link>
        </el-anchor>
      </div>

      <!-- 右侧内容区域（作为锚点的滚动容器） -->
      <div class="rightWrapper">
        <div class="rightContainer" ref="containerRef">

          <!-- 1. 单据基础信息 -->
          <div id="baseInfo" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              单据基础信息
            </div>

            <!-- 单据主信息头部卡片 -->
            <div class="orderInfoHeader">
              <div class="iconBox">
                <i class="iconfont icon-jiesuandan"></i>
              </div>
              <div class="orderInfoDetail">
                <div class="orderNoRow">
                  <span class="orderNoText">结算单号：{{ baseInfo.settlementNo || '-' }}</span>
                  <!-- <span class="statusTag">{{ baseInfo.status || '-' }}</span> -->
                  <el-tag :class="getStatusConfig(baseInfo?.settlementStatus||'')?.dotClass">{{ getStatusConfig(baseInfo?.settlementStatus)?.label || '-' }}</el-tag>
                </div>
                <div class="orderMeta">
                  单据生成时间：{{ baseInfo.createTime || '-' }}
                </div>
              </div>
              <div class="headerBtnGroup">
                <el-button type="primary" class="btnDownload" v-if="!needCheckPermission || hadPermissionList.includes('下载')" :loading="downloading" @click="handleDownload">下载结算单</el-button>
                <el-button type="primary" class="btnSubmit" v-if="(['PENDING_CONFIRM','REJECTED'].includes(baseInfo.settlementStatus))&&(!needCheckPermission || hadPermissionList.includes('提交结算单'))" @click="handleSubmit">提交结算单</el-button>
                <el-button type="primary" class="btnSubmit" v-if="(baseInfo.settlementStatus === 'SETTLED')&&(!needCheckPermission || hadPermissionList.includes('归档'))" @click="handlePush">归档</el-button>
                <el-button type="primary" class="btnSubmit" v-if="(baseInfo.settlementStatus === 'WAITING_PAYMENT')&&(!needCheckPermission || hadPermissionList.includes('已打款'))" @click="handleSubmit">已打款</el-button>
              </div>
            </div>

            <!-- 详细字段 3列栅格排版 -->
            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">医师姓名：</span>
                <span class="val">{{ baseInfo.doctorName || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">医师职称：</span>
                <span class="val">{{ baseInfo.doctorTitle || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">科室名称：</span>
                <span class="val">{{ baseInfo.deptName || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 2. 薪酬核算 -->
          <div id="compensation" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              薪酬核算
            </div>

            <div class="gridRow">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">任务ID：</span>
                <span class="val">{{ baseInfo.allocateId || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">总病历数：</span>
                <span class="val">{{ baseInfo.annotationCount || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">标注量：</span>
                <span class="val">{{ baseInfo.annotationCount || '-' }}</span>
              </div>
            </div>

            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">标注单价：</span>
                <span class="val">{{ baseInfo.unitPrice===0?0:(baseInfo.unitPrice || '-') }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">税前合计总额：</span>
                <span class="val">{{ baseInfo.beforeTaxAmount || '-' }}</span>
              </div>
              <div class="gridCol"></div>
            </div>

            <!-- 备注组件单独一行 -->
            <div class="gridRow margin-top-24">
              <div class="gridCol fullWidth">
                <remarkSection
                  :isEdit="false"
                  :remarkList="baseInfo.salaryNotes"
                  title="其他核算备注"
                  @save="handleSaveRemark"
                  @delete="handleDeleteRemark"
                />
              </div>
            </div>
          </div>

          <!-- 3. 专家确认 -->
          <div id="expertConfirm" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              专家确认
            </div>
            <div class="gridRow">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">专家是否确认：</span>
                <span class="val">{{ baseInfo.expertConfirmedStatusDesc||'-' }}</span>
              </div>
              <div class="gridCol" v-if="baseInfo.expertConfirmedStatus==='REJECTED'">
                <span class="requiredMark">*</span>
                <span class="label">专家驳回原因：</span>
                <span class="val">{{ baseInfo.expertRejectReason ||'-'}}</span>
              </div>
            </div>
          </div>

          <!-- 4. 收款账户信息 -->
          <div id="accountInfo" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              收款账户信息
            </div>

            <div class="gridRow">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">开户人姓名：</span>
                <span class="val">{{ baseInfo.accountName || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">银行卡号：</span>
                <span class="val">{{ baseInfo.bankNo || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">完整开户行：</span>
                <span class="val">{{ baseInfo.bankBranch || '-' }}</span>
              </div>
            </div>

            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">银行预留手机号：</span>
                <span class="val">{{ baseInfo.bankPhone || '-' }}</span>
              </div>
              <div class="gridCol"></div>
              <div class="gridCol"></div>
            </div>
          </div>

          <!-- 5. 打款信息 -->
          <div id="paymentInfo" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              打款信息
            </div>
            <div class="gridRow">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">银行打款流水号：</span>
                <span class="val">{{ baseInfo.transferNo || '-' }}</span>
              </div>
              <div class="gridCol span2">
                <span class="requiredMark">*</span>
                <span class="label">单据归档标记：</span>
                <span class="val">{{ baseInfo.settlementStatus!=='ARCHIVED'? '未归档':'已归档' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 结算单导出模板（离屏渲染）：放在 container 内，保证组件只有单一根节点，
         否则路由切换时的过渡动画会因「片段根节点」而整页渲染空白 -->
    <SettlementStatement ref="statementRef" />
  </div>
</template>

<script setup>
import commonGoBack from '@/components/common/commonGoBack.vue'
import remarkSection from './remarkSection.vue'
import SettlementStatement from '@/components/expertManagement/settlementStatement.vue'
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getInvoiceDetail, archiveSettlement } from '@/api/api_expertManagement.js'
import router from '@/router'
import { useRoute } from 'vue-router'
import { getPagePermission } from '@/hooks/permissionHooks'
import { INVOICE_DEMO_LIST } from '@/mock/demoModules'
import { withTimeout } from '@/utils/requestFallback'
const route = useRoute()
let permissionPath = ''
if (route.path === '/invoiceManagement/archivingInvoiceDetail') {
  permissionPath = '/invoiceManagement/archivingInvoiceList'
} else {
  permissionPath = '/invoiceManagement/invoiceList'
}

const { needCheckPermission, hadPermissionList } = getPagePermission(permissionPath)
console.log('route', route)
const currentId = ref(route.query?.id || '')
const baseInfo = ref({})
// 单据状态映射示例（可根据后端具体枚举调整）
const statusOption = [
  { label: '待申请结算', value: 'UNSETTLED', dotClass: 'statusDot3' },
  { label: '待发起结算', value: 'PENDING_CONFIRM', dotClass: 'statusDot1' },
  { label: '待专家确认', value: 'WAITING_EXPERT_CONFIRM', dotClass: 'statusDot2' },
  { label: '待打款', value: 'WAITING_PAYMENT', dotClass: 'statusDot3' },
  { label: '已结清', value: 'SETTLED', dotClass: 'statusDot4' },
  { label: '已驳回', value: 'REJECTED', dotClass: 'statusDot5' },
  { label: '已归档', value: 'ARCHIVED', dotClass: 'statusDot6' }
]
const getStatusConfig = (status) => statusOption.find(item => item.value === status)
// 滚动容器Ref与锚点处理
const containerRef = ref(null)

const handleClick = (e) => {
  const firstLi = document.querySelector('.leftContainer .el-anchor__list a:first-child')
  if (firstLi) {
    firstLi.classList.remove('is-active')
  }
  e.preventDefault()
}

const scrollTo = (href) => {
  nextTick(() => {
    if (!href) {
      const firstLi = document.querySelector('.leftContainer .el-anchor__list a:first-child')
      if (firstLi) {
        firstLi.classList.add('is-active')
      }
    }
  })
}

// 备注交互逻辑
const handleSaveRemark = (params, done) => {
  baseInfo.value.remarkList.push({
    id: `R-${Date.now()}`,
    createTime: '2026-08-12 16:00:00',
    noteText: params
  })
  done()
}

const handleDeleteRemark = (item, index) => {
  baseInfo.value.remarkList.splice(index, 1)
  ElMessage.success('已删除')
}
const downloading = ref(false)
const statementRef = ref(null)
// 下载结算单（带内存释放防御）
const handleDownload = async () => {
  if (downloading.value) return
  downloading.value = true
  try {
    await statementRef.value?.download({ ...baseInfo.value, hospitalName: baseInfo.value?.agencyName }, `结算单_${baseInfo.value.settlementNo || currentId.value}`)
    ElMessage.success('文件已开始下载')
  } catch (error) {
    console.error('下载失败', error)
    ElMessage.error('结算单生成失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

// 演示环境无后端时按 id 回落到演示数据，避免 baseInfo 为 null 导致详情页白屏
const applyDemoDetail = () => {
  const demo = INVOICE_DEMO_LIST.find(item => item.id === currentId.value) || INVOICE_DEMO_LIST[0] || {}
  baseInfo.value = { ...demo, remarkList: demo.remarkList || [] }
}

const getInvoiceDetailFn = () => {
  withTimeout(getInvoiceDetail({ id: currentId.value }))
    .then(res => {
      if (res && res.code === 10000 && res.data) {
        baseInfo.value = { ...res.data, remarkList: res.data.remarkList || [] }
        return
      }
      applyDemoDetail()
    })
    .catch(() => applyDemoDetail())
}
const handleSubmit = () => {
  router.replace({
    path: '/invoiceManagement/invoiceListEdit',
    query: { id: baseInfo.value.id }
  })
}
const handlePush = (row) => {
  ElMessageBox.confirm('归档后会从待处理列表移出，确认归档吗？', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    archiveSettlement({ id: currentId.value }).then(res => {
      if (res.code === 10000) {
        ElMessage.success('已归档')
        router.got(-1)
      }
    })
  })
}
onMounted(() => {
  getInvoiceDetailFn()
  nextTick(() => {
    scrollTo()
  })
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--theme-bg)#f5f6f9;

  .pageHeader {
    display: flex;
    align-items: center;
    height: 48px;
    background-color: var(--theme-card);

    .line {
      width: 1px;
      height: 16px;
      margin: 0 12px;
      background-color: #cbcfdc;
    }
    .title {
      font-weight: 600;
      font-size: 16px;
      color: var(--theme-text);
    }
  }

  .mainContent {
    display: flex;
    flex: 1;
    box-sizing: border-box;
    height: 0;
    padding: 16px;

    /* 左侧侧边栏锚点 */
    .leftContainer {
      box-sizing: border-box;
      width: 259px;
      margin-right: 16px;
      padding: 24px 8px;
      border-radius: 8px;
      background: var(--theme-card);

      .menuTitle {
        margin-bottom: 24px;
        padding-left: 12px;
        font-weight: 600;
        font-size: 18px;
        color: var(--theme-text);
      }

      :deep(.el-anchor) {
        background: transparent;
        .el-anchor__list {
          padding-left: 0;

          .el-anchor__item {
            margin-bottom: 9px;
            padding: 0;

            .el-anchor__link {
              display: flex;
              align-items: center;
              box-sizing: border-box;
              width: 100%;
              height: 50px;
              padding: 0 12px;
              border-radius: 2px;
              font-size: 16px;
              color: var(--theme-text-2);

              .icon-check {
                width: 16px;
                height: 16px;
                margin-right: 6px;
                color: #b0b0b0;
              }

              &.is-active {
                background-color: var(--theme-primary-soft);
                font-weight: 500;
                color: var(--theme-primary);

                .icon-check {
                  color: var(--theme-primary);
                }
              }
            }

            &.is-active {
              .el-anchor__link {
                background-color: var(--theme-primary-soft);
                font-weight: 500;
                color: var(--theme-primary);

                .icon-check {
                  color: var(--theme-primary);
                }
              }
            }
          }
        }
      }
    }

    /* 右侧主区域 */
    .rightWrapper {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      height: 100%;

      .rightContainer {
        overflow-y: auto;
        flex: 1;

        @include scrollBarStyle;

        .cardBlock {
          margin-bottom: 16px;
          padding: 24px;
          border-radius: 8px;
          background: var(--theme-card);

          .cardTitle {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
            font-weight: 600;
            font-size: 18px;
            color: var(--theme-text);

            .blueBar {
              width: 3px;
              height: 16px;
              margin-right: 8px;
              border-radius: 2px;
              background-color: var(--theme-primary);
            }
          }
        }
      }
    }
  }
}

/* 单据主信息头部组件卡片 */
.orderInfoHeader {
  display: flex;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #ededed;

  .iconBox {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 64px;
    height: 64px;
    margin-right: 20px;
    border-radius: 8px;
    background-color: var(--theme-primary-soft);
    .iconfont {
      font-size: 32px;
      color: var(--theme-primary);
    }
  }

  .orderInfoDetail {
    flex: 1;

    .orderNoRow {
      display: flex;
      align-items: center;

      .orderNoText {
        margin-right: 10px;
        font-weight: 600;
        font-size: 20px;
        color: var(--theme-text);
      }

      .statusTag {
        margin-left: 12px;
        padding: 2px 8px;
        border: 1px dashed #b0b0b0;
        border-radius: 4px;
        font-size: 14px;
        color: #8c8c8c;
      }
    }

    .orderMeta {
      margin-top: 8px;
      font-size: 16px;
      color: #8c8c8c;
    }
  }

  .headerBtnGroup {
    .btnDownload {
      height: 40px;
      padding: 0 20px;
      border-color: var(--theme-primary);
      background-color: var(--theme-card);
      font-size: 16px;
      color: var(--theme-primary);
    }
    .btnSubmit {
      height: 40px;
      padding: 0 20px;
      border-color: var(--theme-primary);
      background-color: var(--theme-primary);
      font-size: 16px;
    }
  }
}

/* 栅格排版与字号 */
.gridRow {
  display: flex;
  align-items: flex-start;

  .gridCol {
    flex: 1;
    font-size: 16px;

    &.span2 {
      flex: 2;
    }

    &.fullWidth {
      flex: 1 1 100%;
    }
  }
}

.requiredMark {
  margin-right: 4px;
  font-size: 16px;
  color: #ff4d4f;
}

.label {
  font-size: 16px;
  color: var(--theme-text);
}

.val {
  font-size: 16px;
  color: var(--theme-text-2);
}

.margin-top-24 {
  margin-top: 24px;
}
.statusDot1 {
  border-color: #e4e4e4;
  border-radius: 2px;
  background: var(--theme-primary-soft);
  color: var(--theme-text-2);
}
.statusDot2 {
  border-color: #95b4fa;
  border-radius: 2px;
  background: var(--theme-primary-soft);
  color: var(--theme-primary);
}
.statusDot3 {
  border-color: #e4e4e4;
  border-radius: 2px;
  background: var(--theme-primary-soft);
  color: var(--theme-text-2);
}
.statusDot4 {
  border-color: rgba(4, 162, 115, 1);
  border-radius: 2px;
  background-color: rgba(4, 162, 115, 0.05);
  color: rgba(4, 162, 115, 1);
}
// .statusDot5 {
//   border-color: rgba(245, 159, 12, 1);
//   border-radius: 2px;
//   background-color: rgba(245, 159, 12, 0.05);
//   color: rgba(245, 159, 12, 1);
// }
.statusDot5 {
  border-color: rgba(255, 78, 78, 1);
  border-radius: 2px;
  background-color: rgba(255, 78, 78, 0.05);
  color: rgba(255, 78, 78, 1);
}
.statusDot6 {
  border-color: rgba(4, 162, 115, 1);
  border-radius: 2px;
  background-color: rgba(4, 162, 115, 0.05);
  color: rgba(4, 162, 115, 1);
}
</style>
