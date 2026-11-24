<template>
  <div class="container">
    <!-- 头部返回与标题 -->
    <header class="pageHeader">
      <commonGoBack :upperLevel="true">
        <div class="line"></div>
        <div class="title">入驻审核管理</div>
      </commonGoBack>
    </header>

    <div class="mainContent">
      <!-- 左侧锚点菜单 -->
      <div class="leftContainer">
        <div class="menuTitle">入驻审核单</div>
        <!-- 核心修改：绑定 containerRef，监听 @click 与 @change -->
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
            <span>基本信息</span>
          </el-anchor-link>
          <el-anchor-link href="#doctoralQualifications">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>医生资质</span>
          </el-anchor-link>
          <el-anchor-link href="#resumeSection">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>简历附件</span>
          </el-anchor-link>
        </el-anchor>
      </div>

      <!-- 右侧内容区域（作为锚点的滚动容器） -->
      <div class="rightWrapper">
        <!-- 核心修改：在此处挂载 containerRef 并设置 overflow-y: auto -->
        <div class="rightContainer" ref="containerRef">
          <!-- 卡片 1：基本信息 -->
          <div id="baseInfo" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              基本信息
            </div>

            <!-- 用户基本资料 -->
            <div class="userInfoHeader">
              <div class="avatarBox">
                <i class="iconfont icon-ren"></i>
              </div>
              <div class="userInfoDetail">
                <div class="userName">{{ detailData.name || '-' }}</div>
                <div class="userMeta">
                  手机号：{{ detailData.phone || '-' }}
                </div>
              </div>
            </div>

            <div class="gridRow margin-top-24">
              <div class="sectionField gridCol">
                <div class="fieldLabel">身份证照片：</div>
                <div class="imgListGroup margin-top-24">
                  <div class="imgCardItem">
                    <CommonPreview :URL="detailData.idCardFront"></CommonPreview>
                    <div class="imgSubText">人像面</div>
                  </div>
                  <div class="imgCardItem">
                    <CommonPreview :URL="detailData.idCardBack"></CommonPreview>
                    <div class="imgSubText">国徽面</div>
                  </div>
                </div>
              </div>
              <div class="gridCol">
                <span class="label">身份证号：</span>
                <span class="val">{{ detailData.idCardNo || '-' }}</span>
              </div>
              <div class="gridCol"></div>
            </div>
          </div>

          <!-- 卡片 2：医生资质 -->
          <div id="doctoralQualifications" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              医生资质
            </div>
            <!-- 1. 医生执业证书照片 -->
            <div class="sectionField">

              <span class="requiredMark">*</span>
              <span class="label">职称等级：</span>
              <span class="val">{{ detailData.titleLevel || '-' }}</span>
              <!-- <div class="fieldLabel">医生执业证书照片：</div>
              <div class="imgCardItem align-left margin-top-24">
                <CommonPreview :URL="detailData.doctorCertificate"></CommonPreview>
              </div> -->
            </div>

            <!-- 2. 职业等级证书 + 职业等级 -->
            <div class="gridRow align-center margin-top-24">
              <div class="gridCol">
                <div class="label"><span class="requiredMark">*</span>职称等级证书：</div>
                <div class="imgCardItem align-left margin-top-24">
                  <CommonPreview :URL="detailData.titleCertificate"></CommonPreview>
                </div>
              </div>
              <!-- <div class="gridCol">

                <span class="requiredMark">*</span>
                <span class="label">职称等级：</span>
                <span class="val">{{ detailData.titleLevel || '-' }}</span>
              </div> -->
              <div class="gridCol">
                <div class="fieldLabel"><span class="requiredMark">*</span>医生执业证书照片：</div>
                <div class="imgCardItem align-left margin-top-24">
                  <CommonPreview :URL="detailData.doctorCertificate"></CommonPreview>
                </div>
              </div>
              <div class="gridCol align-self-center"></div>
            </div>
            <div class="gridRow align-center margin-top-24">
              <div class="gridCol">
                <div class="label"><span class="requiredMark">*</span>卫健委官网查验信息：</div>
                <div class="imgCardItem align-left margin-top-24">
                  <CommonPreview :URL="detailData.verificationInfo"></CommonPreview>
                </div>
              </div>
              <div class="gridCol">
                <div class="label">卫健委官网查验信息示例图片：</div>
                <div class="imgCardItem align-left margin-top-24">
                  <CommonPreview :URL="ExamplesImg"></CommonPreview>
                </div>
              </div>
              <div class="gridCol"></div>
            </div>
            <!-- 3. 医院 / 科室 / 年限 -->
            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">医院名称：</span>
                <span class="val">{{ detailData.hospitalName || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">科室名称：</span>
                <span class="val">{{ detailData.department || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">执业年限：</span>
                <span class="val">{{ detailData.yearsOfPractice || '-' }}</span>
              </div>
            </div>

            <!-- 4. 学历 / 资质补充说明 -->
            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <!-- <span class="requiredMark">*</span> -->
                <span class="label">最高学历：</span>
                <span class="val">{{ detailData.education || '-' }}</span>
              </div>
              <div class="gridCol span2">
                <!-- <span class="requiredMark">*</span> -->
                <span class="label">资质补充说明：</span>
                <span class="val">{{ detailData.qualificationNote || '-' }}</span>
              </div>
            </div>

            <!-- 5. 资质补充说明附件 -->
            <div class="sectionField margin-top-24">
              <div class="fieldLabel">资质补充说明附件：</div>
              <div class="imgCardItem align-left margin-top-24">
                <CommonPreview :URL="detailData.qualificationAttachment"></CommonPreview>
              </div>
            </div>

          </div>

          <!-- 卡片 3：简历附件 -->
          <div id="resumeSection" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              简历附件
            </div>
            <div v-if="detailData.resume && detailData.resume.name" class="resumeBox">
              <span class="resumeIcon"><i class="iconfont icon-wenjian"></i></span>
              <div class="resumeMeta">
                <div class="resumeName">{{ detailData.resume.name }}</div>
                <div class="resumeSize">{{ resumeSizeText }}</div>
              </div>
              <el-button v-if="detailData.resume.url" link type="primary" @click="openResume">查看简历</el-button>
              <span v-else class="resumeTip">演示环境暂不提供文件预览</span>
            </div>
            <div v-else class="resumeEmpty">这位专家还没有上传简历，可以提醒 TA 补充一份。</div>
          </div>
        </div>

        <!-- 底部固定的操作按钮栏 -->
        <footer class="footerHandler">
          <el-button class="btnReject" v-if="applyStatus==='PENDING'&&(!needCheckPermission || hadPermissionList.includes('审核申请'))" @click="handleReject">驳 回</el-button>
          <el-button type="primary" v-if="applyStatus==='PENDING'&&(!needCheckPermission || hadPermissionList.includes('审核申请'))" class="btnApprove" @click="handlePass">通过审核</el-button>
        </footer>
      </div>

    </div>
    <!-- 驳回资质审核单弹窗 -->
    <el-dialog
      title="驳回资质审核单"
      v-model="rejectDialogVisible"
      :width="pxToRem(596)"
      :before-close="closeRejectDialog"
      class="rejectDialog"
    >
      <div class="rejectTips">
        <i class="iconfont icon-tishi-yidongwenjianjia"></i>
        <span>请填写驳回原因，方便对方修改后重新提交，专家将收到修改通知。</span>
      </div>
      <el-form ref="rejectFormRef" :model="rejectForm" :rules="rejectRules" label-position="top">
        <el-form-item label="驳回原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            resize="none"
            maxlength="500"
            show-word-limit
            :rows="5"
            placeholder="例如：医师执业证书照片模糊，姓名与证件编号看不清，请重新上传。"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRejectDialog" >取 消</el-button>
          <el-button type="primary" @click="confirmReject">确认驳回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import commonGoBack from '@/components/common/commonGoBack.vue'
import { ref, onMounted, nextTick, reactive, computed } from 'vue'
import router from '@/router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAuditDetail, checkInAudit } from '@/api/api_expertManagement.js'
import { useRoute } from 'vue-router'
import ExamplesImg from '@/assets/Examples.png'
import { getPagePermission } from '@/hooks/permissionHooks'
import { getOnboardingDetail } from '@/mock/onboardingDemo'
import { approveApplication, rejectApplication, formatFileSize } from '@/utils/onboarding'
import { withTimeout } from '@/utils/requestFallback'
const { needCheckPermission, hadPermissionList } = getPagePermission('/expertManagement/checkInAuditManage')
const route = useRoute()
const id = route?.query?.fileId || ''
const applyStatus = ref('')
// 数据源
const detailData = ref({})

// 简历附件大小文案
const resumeSizeText = computed(() => {
  const resume = detailData.value.resume
  if (!resume) return ''
  const typeText = resume.kind === 'pdf' ? 'PDF 文档' : (resume.kind === 'word' ? 'Word 文档' : '附件')
  return resume.size ? `${typeText} · ${formatFileSize(resume.size)}` : typeText
})

// 演示环境没有后端时，回落到本地演示数据 / 当前账号提交的申请
const useDemoDetail = () => {
  const demo = getOnboardingDetail(id)
  if (!demo) return
  detailData.value = { ...demo }
  applyStatus.value = demo.applyStatus
}

// 打开简历（演示数据没有真实文件地址时不响应）
const openResume = () => {
  const url = detailData.value.resume?.url
  if (url) window.open(url, '_blank')
}

const containerRef = ref(null)

// 阻止默认锚点跳转的哈希行为
const handleClick = (e) => {
  const firstLi = document.querySelector('.leftContainer .el-anchor__list a:first-child')
  if (firstLi) {
    firstLi.classList.remove('is-active')
  }
  e.preventDefault()
}

// 锚点联动/滚动/初始化事件 handler
const scrollTo = (href) => {
  nextTick(() => {
    if (!href) {
      // 页面初始化没有 href 时，默认高亮首个锚点
      const firstLi = document.querySelector('.leftContainer .el-anchor__list a:first-child')
      if (firstLi) {
        firstLi.classList.add('is-active')
      }
    }
  })
}
// 驳回弹窗相关逻辑
const rejectDialogVisible = ref(false)
const rejectFormRef = ref(null)
const rejectForm = reactive({
  reason: ''
})
const rejectRules = {
  reason: [{ required: true, message: '请填写驳回原因，方便对方修改后重新提交', trigger: 'blur' }]
}
const handleReject = () => {
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}
const closeRejectDialog = () => {
  rejectDialogVisible.value = false
  if (rejectFormRef.value) {
    rejectFormRef.value.resetFields()
  }
}
const confirmReject = () => {
  rejectFormRef.value.validate().then(volid => {
    if (volid) {
      // 当前账号自己的申请：同步专家端入驻状态
      if (id === 'SELF') rejectApplication(rejectForm.reason)
      ElMessage.warning('入驻申请已驳回，已通知专家')
      closeRejectDialog()
      router.go(-1)
      checkInAudit({
        action: 'REJECTED',
        applicationId: id,
        rejectReason: rejectForm.reason
      }).catch(() => {})
    }
  })
}

const handlePass = () => {
  ElMessageBox.confirm('确认通过这位专家的资质审核吗？', '审核', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    // 当前账号自己的申请：同步专家端入驻状态，解锁其他模块
    if (id === 'SELF') approveApplication()
    ElMessage.success('审核通过，已通知专家')
    router.go(-1)
    checkInAudit({
      action: 'APPROVED',
      applicationId: id
    }).catch(() => {})
  }).catch(() => {})
}

// 页面加载完成后触发初始高亮逻辑
onMounted(async () => {
  const res = await withTimeout(getAuditDetail({ id: route?.query?.fileId }))
  if (res && res.code === 10000 && res.data) {
    detailData.value = res.data.formData || {}
    applyStatus.value = res.data.applyStatus
  } else {
    useDemoDetail()
  }
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

    /* 左侧侧边栏 */
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

            /* 参考第二个组件的样式匹配：支持 .el-anchor__link 上的 is-active */
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

            /* 同时兼容父级 .el-anchor__item 带 is-active 的情况 */
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

      /* 核心：设为直接滚动容器 */
      .rightContainer {
        overflow-y: auto;
        flex: 1;

        @include scrollBarStyle;

        .cardBlock {
          margin-bottom: 16px;
          padding: 24px 24px;
          border-radius: 8px;
          background: var(--theme-card);
          &#doctoralQualifications {
            margin-bottom: 16px;
          }
          &:last-child {
            margin-bottom: 0;
          }
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

          /* 简历附件 */
          .resumeBox {
            display: flex;
            align-items: center;
            padding: 16px 20px;
            border: 1px solid var(--theme-border);
            border-radius: 10px;
            background: var(--theme-primary-soft);

            .resumeIcon {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 40px;
              height: 40px;
              margin-right: 14px;
              border-radius: 10px;
              background: var(--theme-primary-soft);
              font-size: 20px;
              color: var(--theme-primary);
            }

            .resumeMeta {
              flex: 1;
              min-width: 0;

              .resumeName {
                overflow: hidden;
                margin-bottom: 4px;
                text-overflow: ellipsis;
                font-weight: 500;
                font-size: 14px;
                color: var(--theme-text);
                white-space: nowrap;
              }

              .resumeSize {
                font-size: 13px;
                color: var(--theme-text-3);
              }
            }

            .resumeTip {
              font-size: 13px;
              color: #a3abbd;
            }
          }

          .resumeEmpty {
            padding: 20px;
            border: 1px dashed var(--theme-border);
            border-radius: 10px;
            text-align: center;
            font-size: 13px;
            color: var(--theme-text-3);
          }
        }
      }

      /* 底部操作栏 */
      .footerHandler {
        display: flex;
        position: sticky;
        bottom: 0;
        z-index: 9;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        height: auto;
        border-radius: 8px;
        background: var(--theme-card);
        box-shadow: 0 -6px 16px rgba(31, 58, 105, 0.08);

        .btnReject {
          width: 124px;
          height: 44px;
          margin: 16px 0;
          border-color: #ff4e4e;
          font-size: 16px;
          color: #ff4e4e;
          &:hover {
            background-color: var(--theme-fill);
          }
        }

        .btnApprove {
          width: 124px;
          height: 44px;
          margin: 16px 0;
          margin-left: 16px;
          border-color: var(--theme-primary);
          background-color: var(--theme-primary);
          font-size: 18px;
        }
      }
    }
  }
}

/* 头部用户基本资料卡片 */
.userInfoHeader {
  display: flex;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #ededed;
  .avatarBox {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 74px;
    height: 74px;
    margin-right: 24px;
    border-radius: 50%;
    background-color: #e8f0fe;
    .iconfont {
      font-size: 32px;
      color: var(--theme-primary);
    }
  }

  .userName {
    margin-bottom: 5px;
    font-weight: 600;
    font-size: 22px;
    color: #3d3d3d;
  }

  .userMeta {
    font-size: 16px;
    color: #8c8c8c;
  }
}

/* 图片展示布局 */
.sectionField {
  .fieldLabel {
    font-size: 16px;
    color: var(--theme-text);
  }
  .imgListGroup {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.imgCardItem {
  display: inline-flex;
  flex-direction: column;
  :deep(.previewContainer) {
    width: 204px;
    height: 125px;
    background-color: var(--theme-bg)#f5f7fa;
  }

  &.align-left {
    align-items: flex-start;
  }

  .imgSubText {
    width: 100%;
    margin-top: 16px;
    text-align: center;
    font-size: 16px;
    color: #8c8c8c;
  }
}

/* 栅格排版与 16px 字号 */
.gridRow {
  display: flex;
  align-items: flex-start;

  .gridCol {
    flex: 1;
    font-size: 16px;

    &.span2 {
      flex: 2;
    }

    &.align-self-center {
      align-self: center;
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

/* 统一 24px 顶边距辅助类 */
.margin-top-24 {
  margin-top: 24px;
}
</style>
<style lang="scss">
.rejectDialog {
  // background-color: red;
  &.el-dialog .el-dialog__header {
    padding-bottom: 16px !important;
  }
  .rejectTips {
    display: flex;
    align-items: center;
    height: 40px;
    border: 1px solid rgba(245, 159, 12, 0.5);
    background: rgba(245, 159, 12, 0.05);
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text);
    .iconfont {
      margin-left: 16px;
      margin-right: 8px;
      font-size: 18px;
      color: #f59f0c;
    }
  }
  .el-form--label-top .el-form-item__label {
    margin: 14px 0 !important;
    color: #ff3a3a !important;
  }
}
</style>
