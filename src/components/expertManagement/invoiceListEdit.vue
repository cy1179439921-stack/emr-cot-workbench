<template>
  <div class="container">
    <!-- 顶部返回与标题 -->
    <header class="pageHeader">
      <commonGoBack @handleBack="handleBack">
        <div class="line"></div>
        <div class="title">编辑结算单</div>
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

      <!-- 右侧表单区域 -->
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
                  <span class="orderNoText">结算单号：{{ baseInfo?.settlementNo || '-' }}</span>
                  <el-tag v-if="baseInfo?.settlementStatus" :class="getStatusConfig(baseInfo.settlementStatus)?.dotClass">
                    {{ getStatusConfig(baseInfo.settlementStatus)?.label || '-' }}
                  </el-tag>
                </div>
                <div class="orderMeta">
                  单据生成时间：{{ baseInfo?.createTime || '-' }}
                </div>
              </div>
              <div class="headerBtnGroup">
                <el-button class="btnDownload" v-if="!needCheckPermission || hadPermissionList.includes('下载')" :loading="downloading" @click="handleDownload">下载结算单</el-button>
                <el-button
                  type="primary"
                  class="btnSubmit"
                  :loading="submitting"
                  v-if="(['PENDING_CONFIRM','REJECTED'].includes(baseInfo?.settlementStatus))&&(!needCheckPermission || hadPermissionList.includes('提交结算单'))"
                  @click="handleSubmit"
                >提交结算单</el-button>
                <el-button
                  type="primary"
                  class="btnSubmit"
                  :loading="submitting"
                  v-if="(baseInfo?.settlementStatus === 'SETTLED')&&(!needCheckPermission || hadPermissionList.includes('归档'))"
                  @click="handlePush"
                >归档</el-button>
                <el-button
                  type="primary"
                  class="btnSubmit"
                  :loading="submitting"
                  v-if="(baseInfo?.settlementStatus === 'WAITING_PAYMENT')&&(!needCheckPermission || hadPermissionList.includes('已打款'))"
                  @click="handleSubmitPay"
                >已打款</el-button>
              </div>
            </div>

            <!-- 详细字段 3列栅格排版 -->
            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">医师姓名：</span>
                <span class="val">{{ baseInfo?.doctorName || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">医师职称：</span>
                <span class="val">{{ baseInfo?.doctorTitle || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">科室名称：</span>
                <span class="val">{{ baseInfo?.deptName || '-' }}</span>
              </div>
            </div>

            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">创建人：</span>
                <span class="val">{{ baseInfo?.creator || '-' }}</span>
              </div>
              <div class="gridCol"></div>
              <div class="gridCol"></div>
            </div>
          </div>

          <el-form
            :model="formData"
            :rules="formRules"
            ref="formRef"
            label-position="top"
            class="edit-form"
          >
            <!-- 2. 薪酬核算 -->
            <div id="compensation" class="section-card">
              <div class="section-title">
                <span class="blueBar"></span>
                <span>薪酬核算</span>
              </div>

              <div class="gridRow">
                <div
                  v-for="item in compensationCalculation"
                  :key="item.props"
                  class="gridCol"
                >
                  <el-form-item
                    :label="item.label"
                    :required="item.required"
                    :prop="item.props"
                  >
                    <el-input
                      v-if="item.disabled"
                      :model-value="(formData[item.props] ?? '') === '' ? '-' : formData[item.props]"
                      disabled
                      :placeholder="item.placeholder"
                    />
                    <el-input
                      v-else
                      v-model="formData[item.props]"
                      :disabled="isWaitingPayment || isBaseDisabled"
                      :placeholder="item.placeholder"
                      clearable
                    />
                  </el-form-item>
                </div>
              </div>

              <div class="remarkRow">
                <remarkSection
                  :remarkList="remarkList"
                  title="其他核算备注"
                  :isEdit="(!needCheckPermission || hadPermissionList.includes('备注'))"
                  @save="handleSaveRemark"
                  @delete="handleDeleteRemark"
                />
              </div>
            </div>

            <!-- 3. 专家确认 -->
            <div id="expertConfirm" class="section-card">
              <div class="section-title">
                <span class="blueBar"></span>
                <span>专家确认</span>
              </div>

              <div class="gridRow">
                <div class="gridCol">
                  <el-form-item label="专家是否确认" required prop="expertConfirmedStatusDesc">
                    <el-input
                      :model-value="formData.expertConfirmedStatusDesc || '-'"
                      disabled
                      placeholder="无"
                    />
                  </el-form-item>
                </div>
                <div class="gridCol" v-if="formData.expertConfirmedStatus === 'REJECTED'">
                  <el-form-item label="专家驳回原因">
                    <el-input
                      :model-value="formData.expertRejectReason || '-'"
                      disabled
                      placeholder="无"
                    />
                  </el-form-item>
                </div>
                <div class="gridCol" v-else></div>
                <div class="gridCol" v-if="formData.expertConfirmedStatus !== 'REJECTED'"></div>
              </div>
            </div>

            <!-- 4. 收款账户信息 -->
            <div id="accountInfo" class="section-card">
              <div class="section-title">
                <span class="blueBar"></span>
                <span>收款账户信息</span>
              </div>

              <div class="gridRow">
                <div
                  v-for="item in accountInfo"
                  :key="item.props"
                  class="gridCol"
                >
                  <el-form-item
                    :label="item.label"
                    :required="item.required"
                    :prop="item.props"
                  >
                    <el-input
                      v-model="formData[item.props]"
                      :disabled="isWaitingPayment || isBaseDisabled"
                      :placeholder="item.placeholder"
                      clearable
                    />
                  </el-form-item>
                </div>
              </div>
            </div>

            <!-- 5. 打款信息 -->
            <div id="paymentInfo" class="section-card">
              <div class="section-title">
                <span class="blueBar"></span>
                <span>打款信息</span>
              </div>

              <div class="gridRow">
                <div
                  v-for="item in paymentInfo"
                  :key="item.props"
                  class="gridCol"
                >
                  <el-form-item
                    :label="item.label"
                    :required="item.props === 'transferNo' ? isWaitingPayment : item.required"
                    :prop="item.props"
                  >
                    <el-input
                      v-if="item.props === 'isArchived'"
                      :model-value="formData.isArchived ? '已归档' : '未归档'"
                      disabled
                      :placeholder="item.placeholder"
                    />
                    <el-input
                      v-else-if="item.props === 'transferNo'"
                      v-model="formData.transferNo"
                      :disabled="!isWaitingPayment || isBaseDisabled"
                      :placeholder="item.placeholder"
                      clearable
                    />
                    <el-input
                      v-else
                      :model-value="(formData[item.props] ?? '') === '' ? '-' : formData[item.props]"
                      disabled
                      :placeholder="item.placeholder"
                    />
                  </el-form-item>
                </div>
                <div class="gridCol"></div>
              </div>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import commonGoBack from '@/components/common/commonGoBack.vue'
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import remarkSection from './remarkSection.vue'
import router from '@/router'
import {
  getInvoiceDetail,
  invoiceDownload,
  addSettlementNoteList,
  getSettlementNoteList,
  delSettlementNoteList,
  submitSettlement,
  archiveSettlement,
  submitPay
} from '@/api/api_expertManagement.js'
import { useRoute } from 'vue-router'
import { getPagePermission } from '@/hooks/permissionHooks'

const { needCheckPermission, hadPermissionList } = getPagePermission('/invoiceManagement/invoiceList')
const route = useRoute()
const currentId = ref(route.query?.id || '')
const formRef = ref(null)

const baseInfo = ref({})
const formData = ref({})

// 加载/提交防重控制
const submitting = ref(false)
const downloading = ref(false)

// 判断是否为待打款状态
const isWaitingPayment = computed(() => baseInfo.value?.settlementStatus === 'WAITING_PAYMENT')
// 判断是否为已结清状态
const isBaseDisabled = computed(() => baseInfo.value?.settlementStatus === 'SETTLED' || baseInfo.value?.settlementStatus === 'WAITING_EXPERT_CONFIRM')

// 单据状态选项配置
const statusOption = [
  { label: '待发起结算', value: 'PENDING_CONFIRM', dotClass: 'statusDot1' },
  { label: '待专家确认', value: 'WAITING_EXPERT_CONFIRM', dotClass: 'statusDot2' },
  { label: '待打款', value: 'WAITING_PAYMENT', dotClass: 'statusDot3' },
  { label: '已结清', value: 'SETTLED', dotClass: 'statusDot4' },
  { label: '已驳回', value: 'REJECTED', dotClass: 'statusDot5' }
]

const getStatusConfig = (status) => statusOption.find(item => item.value === status)
// 自定义校验：0-1000 范围且最多两位小数
const validateUnitPrice = (rule, value, callback) => {
  if (value === '' || value === null || value === undefined) {
    return callback(new Error('请填写标注单价'))
  }

  // 正则校验：非负数且最多两位小数
  const reg = /^\d+(\.\d{1,2})?$/
  if (!reg.test(value)) {
    return callback(new Error('单价格式不正确，最多支持两位小数'))
  }

  const num = Number(value)
  if (num < 0 || num > 1000) {
    return callback(new Error('标注单价必须在 0 - 1000 之间'))
  }

  callback()
}
// 薪酬核算配置：总病历数 key 修改为 totalCount
const compensationCalculation = ref([
  { label: '任务ID', props: 'allocateId', required: true, disabled: true, placeholder: '请填写任务 ID' },
  { label: '总病历数', props: 'totalCount', required: true, disabled: true, placeholder: '请填写总病历数' },
  { label: '标注病历数', props: 'annotationCount', required: true, disabled: false, placeholder: '请填写标注病历数' },
  { label: '标注单价', props: 'unitPrice', required: true, disabled: false, placeholder: '请填写标注单价' },
  { label: '税前合计总额', props: 'beforeTaxAmount', required: true, disabled: false, placeholder: '请填写税前合计总额' }
])

// 收款账户信息配置
const accountInfo = ref([
  { label: '开户人姓名', props: 'accountName', required: true, placeholder: '请填写开户人姓名' },
  { label: '银行卡号', props: 'bankNo', required: true, placeholder: '请填写银行卡号' },
  { label: '完整开户行', props: 'bankBranch', required: true, placeholder: '请填写完整开户行' },
  { label: '银行预留手机号', props: 'bankPhone', required: true, placeholder: '请填写银行预留手机号' }
])

// 打款信息配置
const paymentInfo = ref([
  { label: '银行打款流水号', props: 'transferNo', required: true, placeholder: '请填写银行打款流水号，可在网银记录中查到' },
  { label: '单据归档标记', props: 'isArchivedDesc', required: true, placeholder: '请填写单据归档标记' }
])

// 格式与非空校验规则：将 annotationCount1 替换为 totalCount
const formRules = ref({
  allocateId: [{ required: true, message: '请填写任务 ID', trigger: 'blur' }],
  totalCount: [
    { required: true, message: '请填写总病历数', trigger: 'blur' },
    { pattern: /^[0-9]+$/, message: '总病历数请填 0 或正整数', trigger: 'blur' }
  ],
  annotationCount: [
    { required: true, message: '请填写标注病历数', trigger: 'blur' },
    { pattern: /^[0-9]+$/, message: '标注病历数请填 0 或正整数', trigger: 'blur' }
  ],
  unitPrice: [
    { required: true, message: '请填写标注单价', trigger: 'blur' },
    { required: true, validator: validateUnitPrice, trigger: ['blur', 'change'] }
    // { pattern: /^\d+(\.\d{1,2})?$/, message: '请填写正确金额，最多保留两位小数', trigger: 'blur' }
  ],
  beforeTaxAmount: [
    { required: true, message: '请填写税前合计总额', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请填写正确金额，最多保留两位小数', trigger: 'blur' }
  ],
  expertConfirmedStatusDesc: [
    { required: true, message: '请选择专家确认状态', trigger: ['blur', 'change'] }
  ],
  accountName: [{ required: true, message: '请填写开户人姓名', trigger: 'blur' }, { min: 2, message: '姓名至少 2 个字', trigger: 'blur' }],
  bankNo: [
    { required: true, message: '请填写银行卡号', trigger: 'blur' },
    { pattern: /^(\d{16}|\d{19})$/, message: '银行卡号应为 16 位或 19 位，请核对', trigger: 'blur' }
  ],
  bankBranch: [{ required: true, message: '请填写完整开户行', trigger: 'blur' }],
  bankPhone: [
    { required: true, message: '请填写银行预留手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号需为 11 位数字，请核对', trigger: 'blur' }
  ],
  settlementStatusDesc: [
    { required: true, message: '请选择单据归档标记', trigger: ['blur', 'change'] }
  ],
  transferNo: []
})

// 滚动容器 Ref 与锚点处理
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
const remarkList = ref([])
const handleSaveRemark = (params, done) => {
  addSettlementNoteList({
    settlementId: currentId.value,
    text: params
  }).then(res => {
    if (res.code === 10000) {
      done()
      getNoteListFn()
    }
  })
}

const handleDeleteRemark = (obj) => {
  const { item, index } = obj
  delSettlementNoteList({ id: item.id }).then(res => {
    if (res.code === 10000) {
      ElMessage.success('已删除')
      remarkList.value.splice(index, 1)
    }
  })
}

const getNoteListFn = () => {
  getSettlementNoteList({ id: currentId.value }).then(res => {
    if (res.code === 10000) {
      remarkList.value = res.data || []
    }
  })
}

// 下载结算单
const handleDownload = async () => {
  if (downloading.value) return
  downloading.value = true
  let url = ''
  try {
    const res = await invoiceDownload({ id: currentId.value })
    const blobData = res.data || res

    const blob = new Blob([blobData], { type: 'application/pdf' })
    url = window.URL.createObjectURL(blob)

    const fileName = `结算单_${formData.value.settlementNo || currentId.value}.pdf`

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('文件已开始下载')
  } catch (error) {
    console.error('下载失败', error)
    ElMessage.error('文件没能文件已开始下载，请稍后重试')
  } finally {
    if (url) {
      window.URL.revokeObjectURL(url)
    }
    downloading.value = false
  }
}

// 提交结算单：在入参中补充 totalCount
const handleSubmit = () => {
  if (!formRef.value || submitting.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessageBox.confirm('提交后进入审核流程，确认提交吗？', '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }).then(() => {
        submitting.value = true
        submitSettlement({
          accountName: formData.value.accountName,
          bankBranch: formData.value.bankBranch,
          bankNo: formData.value.bankNo,
          bankPhone: formData.value.bankPhone,
          count: formData.value.annotationCount,
          beforeTaxAmount: formData.value.beforeTaxAmount,
          id: currentId.value,
          price: formData.value.unitPrice
        }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('提交成功')
            getInvoiceDetailFn()
          }
        }).finally(() => {
          submitting.value = false
        })
      }).catch(() => {})
    }
  })
}

// 提交已打款
const handleSubmitPay = () => {
  if (!formRef.value || submitting.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      submitPay({ id: currentId.value, transferNo: formData.value.transferNo }).then(res => {
        if (res.code === 10000) {
          ElMessage.success('提交成功')
          getInvoiceDetailFn()
        }
      }).finally(() => {
        submitting.value = false
      })
    }
  })
}
const initialFormData = ref({})

// 获取结算单详情
const getInvoiceDetailFn = () => {
  getInvoiceDetail({ id: currentId.value }).then(res => {
    if (res.code === 10000) {
      const data = res.data || {}
      formData.value = { ...data }
      baseInfo.value = { ...data }

      initialFormData.value = JSON.parse(JSON.stringify(formData.value))

      // 动态切换打款流水号校验规则
      if (baseInfo.value.settlementStatus === 'WAITING_PAYMENT') {
        formRules.value = {
          ...formRules.value,
          transferNo: [
            { required: true, message: '请填写银行打款流水号，可在网银记录中查到', trigger: 'blur' }
          ]
        }
      } else {
        formRules.value = {
          ...formRules.value,
          transferNo: []
        }
      }

      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  })
}

// 归档结算单
const handlePush = () => {
  if (submitting.value) return
  ElMessageBox.confirm('归档后会从待处理列表移出，确认归档吗？', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    submitting.value = true
    archiveSettlement({ id: currentId.value }).then(res => {
      if (res.code === 10000) {
        ElMessage.success('已归档')
        router.go(-1)
      }
    }).finally(() => {
      submitting.value = false
    })
  }).catch(() => {})
}

// 执行真正的返回操作
const doGoBack = () => {
  router.go(-1)
}

const handleBack = () => {
  if (isFormChanged()) {
    ElMessageBox.confirm(
      '有改动还没保存，离开后会丢失，确认返回吗？',
      '提示',
      {
        confirmButtonText: '确定返回',
        cancelButtonText: '继续编辑',
        type: 'warning'
      }
    ).then(() => {
      doGoBack()
    }).catch(() => {})
  } else {
    doGoBack()
  }
}

// 检查表单可编辑项是否有修改：比对新增 totalCount
const isFormChanged = () => {
  const keysToCompare = [
    'totalCount',
    'annotationCount',
    'unitPrice',
    'beforeTaxAmount',
    'accountName',
    'bankNo',
    'bankBranch',
    'bankPhone',
    'transferNo'
  ]

  return keysToCompare.some(key => {
    const oldVal = initialFormData.value[key] ?? ''
    const newVal = formData.value[key] ?? ''
    return String(oldVal).trim() !== String(newVal).trim()
  })
}

onMounted(() => {
  getInvoiceDetailFn()
  getNoteListFn()
  nextTick(() => {
    scrollTo()
  })
})
</script>

<style lang="scss" scoped>
/* 样式部分完全保持不变 */
.container {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--theme-bg)#f5f6f9;

  .pageHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
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

    /* 左侧锚点菜单 */
    .leftContainer {
      box-sizing: border-box;
      width: 259px;
      margin-right: 12px;
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

    /* 右侧滚动区域 */
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
      }
    }
  }
}

/* 表单 */
.edit-form {
  .section-card {
    margin-bottom: 16px;
    padding: 24px;
    border-radius: 8px;
    background: var(--theme-card);
    &:nth-last-of-type(1) {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      line-height: 22px;
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

    .gridRow {
      display: flex;
      flex-wrap: wrap;
      margin-right: -24px;

      .gridCol {
        box-sizing: border-box;
        padding-right: 24px;
      }
    }

    .remarkRow {
      margin-top: 0;
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 24px;

  .el-form-item__label {
    height: 24px;
    margin-bottom: 12px;
    padding: 0;
    line-height: 24px;
    font-size: 16px;
    color: var(--theme-text);
  }
  .el-input {
    height: 42px;
  }

  .el-input__wrapper {
    box-sizing: border-box;
    height: 42px;
    min-height: 42px;
    border-radius: 2px;
    font-size: 16px;
  }

  &.is-required:not(.is-no-asterisk) > .el-form-item__label::before {
    margin-right: 4px;
    color: #ff4d4f;
  }
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: var(--theme-fill);
  box-shadow: 0 0 0 1px #d9dfe8 inset;

  .el-input__inner {
    color: var(--theme-text-2);
    -webkit-text-fill-color: #666;
  }
}

/* 备注组件嵌入卡片时去掉自身卡片样式 */
:deep(.remark-section) {
  padding: 0 0 16px 0;
  background-color: transparent;

  .info-row {
    margin-bottom: 0;
  }
}

/* 栅格排版与字号 */
.gridRow {
  display: flex;
  align-items: flex-start;

  .gridCol {
    width: calc(100% / 3);
    font-size: 16px;
    &.span2 {
      flex: 2;
    }

    &.fullWidth {
      flex: 1 1 100%;
    }
  }
}
.margin-top-24 {
  margin-top: 24px;
}
.requiredMark {
  margin-right: 4px;
  font-size: 16px;
  color: #ff4d4f;
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
