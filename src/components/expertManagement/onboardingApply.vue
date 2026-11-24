<template>
  <div class="onboardingApply warmTheme">
    <!-- 页头 -->
    <div class="pageHero warmCard">
      <div class="heroText">
        <h1 class="heroTitle">专家入驻申请</h1>
        <p class="heroDesc">
          完成资质认证后，就可以接取标注任务、参与劳务结算。资料我们会逐项人工核对，
          填写过程中随时可以离开，回来接着填。
        </p>
      </div>
      <div class="heroStatus" :class="'is-' + status.toLowerCase()">
        <span class="statusDot" />
        <span class="statusText">{{ statusText }}</span>
      </div>
    </div>

    <!-- 状态提示：审核中 / 已驳回 / 已通过 -->
    <div v-if="status === 'PENDING'" class="statusBanner is-pending warmCard">
      <i class="iconfont icon-shijian1"></i>
      <div class="bannerBody">
        <p class="bannerTitle">资料已提交，审核中</p>
        <p class="bannerText">
          申请单号 {{ state.applyNo }}，{{ state.submittedAt }} 提交。审核结果会通过消息通知您，一般 1-2 个工作日。
        </p>
      </div>
      <el-button class="bannerBtn" @click="handleDemoApprove">模拟审核通过</el-button>
    </div>

    <div v-else-if="status === 'REJECTED'" class="statusBanner is-rejected warmCard">
      <i class="iconfont icon-tishi-yidongwenjianjia"></i>
      <div class="bannerBody">
        <p class="bannerTitle">这次没通过，补充材料后再提交</p>
        <p class="bannerText">驳回原因：{{ state.rejectReason || '管理员未填写驳回原因' }}</p>
      </div>
    </div>

    <div v-else-if="status === 'APPROVED'" class="statusBanner is-approved warmCard">
      <i class="iconfont icon-duihao2"></i>
      <div class="bannerBody">
        <p class="bannerTitle">认证已通过，欢迎加入</p>
        <p class="bannerText">
          {{ state.reviewedAt }} 审核通过。现在可以回到首页，接取标注任务了。
        </p>
      </div>
      <el-button type="primary" class="bannerBtn" @click="goHome">去首页接任务</el-button>
    </div>

    <!-- 表单 -->
    <el-form
      ref="formRef"
      v-loading="saving"
      :model="form"
      :rules="rules"
      label-position="top"
      class="applyForm"
      :disabled="!editable"
    >
      <!-- 基本信息 -->
      <section class="warmCard formCard">
        <header class="cardHead">
          <h2 class="warmSectionTitle">基本信息</h2>
          <span class="warmHint">姓名需与身份证一致，证件照片要能看清姓名和号码</span>
        </header>

        <div class="fieldGrid">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请填写真实姓名" maxlength="20" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请填写 11 位手机号" maxlength="11" />
          </el-form-item>
          <el-form-item label="身份证号" prop="idCardNo">
            <el-input v-model="form.idCardNo" placeholder="请填写 18 位身份证号" maxlength="18" />
          </el-form-item>
        </div>

        <div class="uploadGrid">
          <div class="uploadCell">
            <span class="cellLabel"><i class="requiredStar">*</i>身份证正面照片（人像面）</span>
            <UploadField
              v-model="form.idCardFront"
              tip="清晰人脸、证件号完整"
              :show-error="errors.idCardFront"
              error-text="请上传身份证人像面"
            />
          </div>
          <div class="uploadCell">
            <span class="cellLabel"><i class="requiredStar">*</i>身份证反面照片（国徽面）</span>
            <UploadField
              v-model="form.idCardBack"
              tip="核对有效期，过期证件无法签约"
              :show-error="errors.idCardBack"
              error-text="请上传身份证国徽面"
            />
          </div>
        </div>
      </section>

      <!-- 医师资质 -->
      <section class="warmCard formCard">
        <header class="cardHead">
          <h2 class="warmSectionTitle">医师资质</h2>
          <span class="warmHint">证书照片支持 jpg / png / pdf，单个文件不超过 10 MB</span>
        </header>

        <div class="fieldGrid">
          <el-form-item label="职称等级" prop="titleLevel">
            <el-select v-model="form.titleLevel" placeholder="请选择职称等级" class="fullWidth">
              <el-option v-for="item in TITLE_LEVEL_OPTIONS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="执业医院名称" prop="hospitalName">
            <el-input v-model="form.hospitalName" placeholder="请填写医院全称，如「滕州市中心人民医院」" />
          </el-form-item>
          <el-form-item label="执业科室大类" prop="departmentCategory">
            <el-select v-model="form.departmentCategory" placeholder="请选择科室大类" class="fullWidth">
              <el-option v-for="item in DEPARTMENT_CATEGORY_OPTIONS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="执业年限" prop="yearsOfPractice">
            <el-select v-model="form.yearsOfPractice" placeholder="请选择执业年限" class="fullWidth">
              <el-option v-for="item in PRACTICE_YEARS_OPTIONS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="最高学历" prop="education">
            <el-select v-model="form.education" placeholder="请选择最高学历（选填）" clearable class="fullWidth">
              <el-option v-for="item in EDUCATION_OPTIONS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </div>

        <div class="uploadGrid">
          <div class="uploadCell">
            <span class="cellLabel"><i class="requiredStar">*</i>医师执业证书照片</span>
            <UploadField
              v-model="form.doctorCertificate"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              tip="正反面合并上传，缺失会被驳回"
              :show-error="errors.doctorCertificate"
              error-text="请上传医师执业证书照片"
            />
          </div>
          <div class="uploadCell">
            <span class="cellLabel"><i class="requiredStar">*</i>职称等级证书照片</span>
            <UploadField
              v-model="form.titleCertificate"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              tip="无高职称可上传初级医师证"
              :show-error="errors.titleCertificate"
              error-text="请上传职称等级证书照片"
            />
          </div>
        </div>

        <el-form-item label="资质补充说明（选填）" class="noteItem">
          <el-input
            v-model="form.qualificationNote"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="可填写专项资质、专科进修经历，方便审核老师了解您的专业方向"
          />
        </el-form-item>

        <div class="uploadCell single">
          <span class="cellLabel">资质补充说明附件（选填）</span>
          <UploadField
            v-model="form.qualificationAttachment"
            mode="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,.doc,.docx"
            placeholder="点击上传进修证书、获奖证明等"
            tip="支持图片 / PDF / Word，单个文件不超过 10 MB"
          />
        </div>
      </section>

      <!-- 简历 -->
      <section class="warmCard formCard">
        <header class="cardHead">
          <h2 class="warmSectionTitle">简历</h2>
          <span class="warmHint">上传一份简历，审核老师能更快了解您的临床与科研经历</span>
        </header>
        <div class="uploadCell single">
          <span class="cellLabel">个人简历</span>
          <UploadField
            v-model="form.resume"
            mode="file"
            accept="application/pdf,.doc,.docx,image/png,image/jpeg,image/jpg"
            placeholder="点击上传简历（PDF / Word / 图片）"
            tip="单个文件不超过 10 MB，选填"
          />
        </div>
      </section>

      <!-- 底部操作 -->
      <footer v-if="editable" class="formFooter">
        <el-button class="resetBtn" :disabled="saving" @click="handleReset">重置资料</el-button>
        <el-button type="primary" class="submitBtn" :loading="saving" @click="handleSubmit">
          {{ status === 'REJECTED' ? '重新提交审核' : '提交审核' }}
        </el-button>
      </footer>
      <p v-if="editable" class="footerTip">
        提交后资料会进入人工审核，审核结果通过消息通知，通常 1-2 个工作日。
      </p>
    </el-form>
  </div>
</template>

<script>
export default { name: 'OnboardingApply' }
</script>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import UploadField from '@/components/expertManagement/uploadField.vue'
import {
  onboardingState,
  ONBOARDING_STATUS,
  ONBOARDING_STATUS_TEXT,
  TITLE_LEVEL_OPTIONS,
  DEPARTMENT_CATEGORY_OPTIONS,
  PRACTICE_YEARS_OPTIONS,
  EDUCATION_OPTIONS,
  createEmptyApplication,
  submitApplication,
  approveApplication,
  resetApplication
} from '@/utils/onboarding'

const router = useRouter()
const state = onboardingState
const formRef = ref(null)
const saving = ref(false)

const status = computed(() => state.status)
const statusText = computed(() => ONBOARDING_STATUS_TEXT[state.status] || '未提交')
// 未提交 / 已驳回时才能编辑表单
const editable = computed(() => [
  ONBOARDING_STATUS.NOT_APPLIED,
  ONBOARDING_STATUS.REJECTED
].includes(state.status))

const form = reactive({ ...createEmptyApplication(), ...(state.form || {}) })
// 附件必填校验状态（el-form 规则覆盖不到自定义上传组件）
const errors = reactive({
  idCardFront: false,
  idCardBack: false,
  doctorCertificate: false,
  titleCertificate: false
})

const validatePhone = (rule, value, callback) => {
  if (!value) return callback(new Error('请填写手机号'))
  if (!/^1\d{10}$/.test(value)) return callback(new Error('手机号需为 11 位数字，请核对'))
  callback()
}

const validateIdCard = (rule, value, callback) => {
  if (!value) return callback(new Error('请填写身份证号'))
  if (!/^\d{17}[\dXx]$/.test(value)) return callback(new Error('身份证号应为 18 位，请核对'))
  callback()
}

const rules = {
  name: [{ required: true, message: '请填写真实姓名', trigger: 'blur' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  idCardNo: [{ required: true, validator: validateIdCard, trigger: 'blur' }],
  titleLevel: [{ required: true, message: '请选择职称等级', trigger: 'change' }],
  hospitalName: [{ required: true, message: '请填写执业医院全称', trigger: 'blur' }],
  departmentCategory: [{ required: true, message: '请选择执业科室大类', trigger: 'change' }],
  yearsOfPractice: [{ required: true, message: '请选择执业年限', trigger: 'change' }]
}

// 附件变化后清掉报错提示
watch(() => form.idCardFront, (v) => { if (v) errors.idCardFront = false })
watch(() => form.idCardBack, (v) => { if (v) errors.idCardBack = false })
watch(() => form.doctorCertificate, (v) => { if (v) errors.doctorCertificate = false })
watch(() => form.titleCertificate, (v) => { if (v) errors.titleCertificate = false })

// 表单校验 + 附件校验
const validateAll = async () => {
  let formValid = true
  await formRef.value.validate((valid) => { formValid = valid }).catch(() => { formValid = false })
  errors.idCardFront = !form.idCardFront?.url
  errors.idCardBack = !form.idCardBack?.url
  errors.doctorCertificate = !form.doctorCertificate?.url
  errors.titleCertificate = !form.titleCertificate?.url
  const attachValid = !errors.idCardFront && !errors.idCardBack &&
    !errors.doctorCertificate && !errors.titleCertificate
  if (!formValid && attachValid) {
    ElMessage.warning('还有必填项没填完，请检查标红的字段')
  } else if (formValid && !attachValid) {
    ElMessage.warning('证件照片还没传齐，补齐后就能提交了')
  }
  return formValid && attachValid
}

const handleSubmit = async () => {
  if (saving.value) return
  const valid = await validateAll()
  if (!valid) return
  try {
    await ElMessageBox.confirm(
      '提交后资料会进入人工审核，审核期间仍可查看已填内容。确认提交吗？',
      '提交入驻申请',
      { confirmButtonText: '确认提交', cancelButtonText: '再检查一下', type: 'warning' }
    )
  } catch (e) {
    return
  }
  saving.value = true
  try {
    submitApplication(form)
    ElMessage.success('资料已提交，审核结果会通过消息通知您')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    saving.value = false
  }
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm('重置后已填写的内容会清空，确认重置吗？', '重置资料', {
      confirmButtonText: '确认重置',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (e) {
    return
  }
  Object.assign(form, createEmptyApplication())
  resetApplication()
  formRef.value?.clearValidate()
  ElMessage.success('资料已清空，可以重新填写')
}

// 演示环境：模拟管理员审核通过，便于完整体验后续功能
const handleDemoApprove = () => {
  approveApplication()
  ElMessage.success('演示环境：已模拟审核通过，全部功能已解锁')
}

const goHome = () => {
  router.push({ name: 'expertWorkbench' })
}
</script>

<style lang="scss" scoped>
.onboardingApply {
  overflow-y: auto;
  box-sizing: border-box;
  height: 100%;
  padding: 20px 24px 40px;
}

/* ===================== 页头 ===================== */
.pageHero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 26px 30px;
  background: linear-gradient(120deg, var(--theme-card) 0%, var(--theme-primary-soft) 55%, var(--theme-primary-soft) 100%);
}

.heroTitle {
  margin: 0 0 8px;
  font-weight: 700;
  font-size: 24px;
  color: var(--theme-text);
}

.heroDesc {
  max-width: 760px;
  margin: 0;
  line-height: 26px;
  font-size: 15px;
  color: var(--theme-text-2);
}

.heroStatus {
  display: flex;
  align-items: center;
  flex: none;
  height: 34px;
  padding: 0 16px;
  border-radius: 17px;
  background: var(--theme-border);
  font-weight: 600;
  font-size: 14px;
  color: var(--theme-text-2);
  gap: 8px;

  .statusDot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--theme-text-3);
  }

  &.is-pending {
    background: var(--theme-primary-soft);
    color: var(--theme-warning);

    .statusDot {
      background: var(--theme-warning);
    }
  }

  &.is-approved {
    background: var(--theme-success-soft);
    color: var(--theme-success);

    .statusDot {
      background: var(--theme-success);
    }
  }

  &.is-rejected {
    background: var(--theme-danger-soft);
    color: var(--theme-danger);

    .statusDot {
      background: var(--theme-danger);
    }
  }
}

/* ===================== 状态提示条 ===================== */
.statusBanner {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 18px 22px;
  gap: 14px;

  i {
    font-size: 22px;
  }

  .bannerBody {
    flex: 1;
  }

  .bannerTitle {
    margin: 0 0 4px;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-text);
  }

  .bannerText {
    margin: 0;
    line-height: 22px;
    font-size: 14px;
    color: var(--theme-text-2);
  }

  .bannerBtn {
    flex: none;
  }

  &.is-pending {
    border-color: var(--theme-primary-soft);

    i {
      color: var(--theme-warning);
    }
  }

  &.is-rejected {
    border-color: var(--theme-danger-soft);

    i {
      color: var(--theme-danger);
    }
  }

  &.is-approved {
    border-color: var(--theme-success-soft);

    i {
      color: var(--theme-success);
    }
  }
}

/* ===================== 表单 ===================== */
.applyForm {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  gap: 16px;
}

.formCard {
  padding: 24px 26px;
}

.cardHead {
  display: flex;
  align-items: baseline;
  margin-bottom: 18px;
  gap: 14px;
}

.fieldGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 4px 24px;
}

.fullWidth {
  width: 100%;
}

.uploadGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  margin-top: 6px;
  gap: 20px 24px;
}

.uploadCell {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.single {
    margin-top: 6px;
  }
}

.cellLabel {
  font-weight: 500;
  font-size: 14px;
  color: var(--theme-text-2);
}

.requiredStar {
  margin-right: 4px;
  font-style: normal;
  color: var(--theme-danger);
}

.noteItem {
  margin-top: 20px;
}

.formFooter {
  display: flex;
  justify-content: center;
  padding: 6px 0 0;
  gap: 16px;
}

.submitBtn {
  min-width: 168px;
  height: 44px;
  font-size: 16px;
}

.resetBtn {
  min-width: 120px;
  height: 44px;
  font-size: 15px;
}

.footerTip {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(--theme-text-3);
}

:deep(.el-form-item__label) {
  padding-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: var(--theme-text-2);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-size: 14px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
