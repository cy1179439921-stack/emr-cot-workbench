<template>
  <div class="container">
    <!-- 头部返回与标题 -->
    <header class="pageHeader">
      <commonGoBack :upperLevel="true">
        <div class="line"></div>
        <div class="title">劳务合同详情</div>
      </commonGoBack>
    </header>

    <div class="mainContent">
      <!-- 左侧锚点菜单 -->
      <div class="leftContainer">
        <div class="menuTitle">劳务合同</div>
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
          <el-anchor-link href="#laborBasis">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>劳务签约基础</span>
          </el-anchor-link>
          <el-anchor-link href="#bankCard">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>劳务签约银行卡</span>
          </el-anchor-link>
          <el-anchor-link href="#laborSign">
            <SvgIcon iconName="icon-duihao" class="icon-check" />
            <span>劳务协议签署</span>
          </el-anchor-link>
        </el-anchor>
      </div>

      <!-- 右侧内容区域（滚动容器） -->
      <div class="rightWrapper">
        <div class="rightContainer" ref="containerRef">

          <!-- 模块 1：劳务签约基础 -->
          <div id="laborBasis" class="cardBlock">
            <div class="cardHeader flex-between">
              <div class="cardTitle margin-bottom-0">
                <span class="blueBar"></span>
                劳务签署基础
              </div>

            </div>

            <!-- 合同基本头部卡片 -->
            <div class="contractHeaderCard">
              <div class="infoContainer">
                <div class="contractIconBox">
                  <i class="iconfont icon-hetongbianhao"></i>
                </div>
                <div class="contractInfoDetail">
                  <div class="contractNumRow">
                    <span class="contractNum">合同编号：{{ infoObj.contractNo || '-' }}</span>
                    <el-tag :class="getStatusConfig(infoObj?.contractStatus||'')?.dotClass">{{ getStatusConfig(infoObj?.contractStatus)?.label || '-' }}</el-tag>
                  </div>
                  <div class="contractMeta">
                    发起时间：{{ infoObj.submitTime || '-' }} &nbsp;|&nbsp; 签署时间：{{ infoObj.signedTime || '-' }}
                  </div>
                </div>
              </div>

              <div class="headerBtns">
                <el-button
                  class="btnDownload"
                  type="primary"
                  :loading="signLoading"
                  v-if="(infoObj.contractStatus==='PENDING'||infoObj.contractStatus==='REJECTED'||infoObj.contractStatus==='EXPIRED')&&(!needCheckPermission || hadPermissionList.includes('发起劳务签署'))" @click="handleSign">发起劳务签署</el-button>
              </div>
            </div>

            <!-- 基础字段 3列排版 -->
            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">专家姓名：</span>
                <span class="val">{{ infoObj.expertName || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="label">手机号：</span>
                <span class="val">{{ infoObj.expertPhone || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="label">医院名称：</span>
                <span class="val">{{ infoObj.hospitalName || '-' }}</span>
              </div>
            </div>

            <div class="gridRow margin-top-24">
              <div class="sectionField gridCol">
                <div class="fieldLabel">身份证照片：</div>
                <div class="imgListGroup margin-top-12">
                  <div class="imgCardItem">
                    <CommonPreview :URL="infoObj.idCardFrontUrl"></CommonPreview>
                    <div class="imgSubText">人像面</div>
                  </div>
                  <div class="imgCardItem">
                    <CommonPreview :URL="infoObj.idCardBackUrl"></CommonPreview>
                    <div class="imgSubText">国徽面</div>
                  </div>
                </div>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">身份证号：</span>
                <span class="val">{{ infoObj.idCardNo || '-' }}</span>
              </div>
              <div class="gridCol"></div>
            </div>
          </div>

          <!-- 模块 2：劳务签约银行卡 -->
          <div id="bankCard" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              劳务签约银行卡
            </div>

            <div class="gridRow">
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">开户人姓名：</span>
                <span class="val">{{ infoObj.accountName || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">银行卡号：</span>
                <span class="val">{{ infoObj.bankAccountId || '-' }}</span>
              </div>
              <div class="gridCol">
                <span class="requiredMark">*</span>
                <span class="label">开户支行：</span>
                <span class="val">{{ infoObj.bankBranch || '-' }}</span>
              </div>
            </div>

            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="label">预留手机号：</span>
                <span class="val">{{ infoObj.bankPhone || '-' }}</span>
              </div>
              <div class="gridCol"></div>
              <div class="gridCol"></div>
            </div>
          </div>

          <!-- 模块 3：劳务协议签署 -->
          <div id="laborSign" class="cardBlock">
            <div class="cardTitle">
              <span class="blueBar"></span>
              劳务协议签署
            </div>

            <!-- PDF 文档预览下载卡片 -->
            <div class="filePreviewCard">
              <div class="fileLeft">
                <img class="pdfTag" src="@/assets/image-pdf.png" alt="">
                <span class="fileName">线上劳务协议文档</span>
              </div>
              <div class="fileRight">
                <el-button class="lineBtn blueLine" :loading="previewLoading" @click="handlePreviewFile">
                  <i class="iconfont icon-xianshimima"></i>
                  预 览
                </el-button>
                <el-button class="lineBtn" :loading="downloadLoading" @click="downloadFile" v-if="(!needCheckPermission || hadPermissionList.includes('下载'))">
                  <i class="iconfont icon-daochu2"></i>
                  下 载
                </el-button>
              </div>
            </div>
            <div class="gridRow margin-top-24">
              <div class="gridCol">
                <span class="label">驳回原因：</span>
                <span class="val">{{ infoObj.rejectReason || '-' }}</span>
              </div>
            </div>

            <!-- 劳务信息补充备注列表与编辑 -->
            <div class="remarkSection margin-top-24">
              <div class="remarkHeader">
                <span class="label">劳务信息补充备注：</span>
                <span v-if="remarkList.length === 0" class="val">-</span>
              </div>

              <!-- 备注时间线列表 -->
              <el-timeline v-if="remarkList.length > 0" class="customTimeline margin-top-16">
                <el-timeline-item
                  v-for="(item, index) in remarkList"
                  :key="item.id || index"
                  hollow
                  type="primary"
                >
                  <div class="timelineTitle">{{ item.createTime || '-' }}</div>
                  <div class="timelineText">{{ item.noteText || '-' }}</div>
                  <div class="deleteBtn" @click="handleDeleteRemark(item, index)" v-if="(!needCheckPermission || hadPermissionList.includes('备注'))">
                    删除
                  </div>
                  <!-- <el-button type="danger" link class="deleteBtn" >
                    删除
                  </el-button> -->
                </el-timeline-item>
              </el-timeline>
              <el-button class="lineBtn blueLine" :class="{editBtn:!remarkList?.length}" @click="openRemarkDialog" v-if="(!needCheckPermission || hadPermissionList.includes('备注'))">
                <i class="iconfont icon-bianji1"></i>
                编 辑
              </el-button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- 编辑/添加劳务信息补充备注弹窗 -->
    <el-dialog
      title="编辑劳务信息补充备注"
      v-model="remarkDialogVisible"
      :width="pxToRem ? pxToRem(520) : '520px'"
      :before-close="closeRemarkDialog"
      class="remarkDialog"
    >
      <el-form ref="remarkFormRef" :model="remarkForm" :rules="remarkRules" label-position="top">
        <el-form-item label="备注内容" prop="content">
          <el-input
            v-model="remarkForm.content"
            type="textarea"
            :rows="5"
            maxlength="500"
            show-word-limit
            resize="none"
            placeholder="仅管理员可见，专家不可见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRemarkDialog">取 消</el-button>
          <el-button type="primary" @click="confirmSaveRemark">保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import commonGoBack from '@/components/common/commonGoBack.vue'
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getContractDetail, getContractPreview, getContractDownload, getNoteList, addNoteList, delNoteList, contractLaunch } from '@/api/api_expertManagement.js'
import { useRoute } from 'vue-router'
import { formatDateTime } from '@/utils/utils.js'
import { getPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/expertManagement/contractManagement')
const route = useRoute()
const currentId = ref(route.query?.id || '')
const statusOption = [
  { label: '待发起', value: 'PENDING', dotClass: 'statusDot1' },
  { label: '已发起待签署', value: 'INITIATED', dotClass: 'statusDot2' },
  { label: '已签署', value: 'SIGNED', dotClass: 'statusDot3' },
  { label: '已驳回', value: 'REJECTED', dotClass: 'statusDot5' },
  { label: '已过期', value: 'EXPIRED', dotClass: 'statusDot4' }
]
const getStatusConfig = (status) => statusOption.find(item => item.value === status)
// 数据源（默认值为空或已清空）
const infoObj = ref({})

// 滚动容器与锚点逻辑
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
const signLoading = ref(false)

const handleSign = () => {
  if (signLoading.value) return

  // 1. 点击即开启 loading，防止连续点击
  signLoading.value = true

  ElMessageBox.confirm('确认向该专家发起劳务合同签署吗？发起后会发送签署通知', '', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    // 2. 点击确定，发起慢接口请求
    return contractLaunch({ contractId: currentId.value })
  }).then(res => {
    if (res?.code === 10000) {
      ElMessage.success('签署已发起，请留意签署通知')
      getContractDetailFn()
    }
  }).catch((err) => {
    // 3. 捕获取消弹窗或接口报错的情况
    if (err !== 'cancel') {
      console.error(err)
    }
  }).finally(() => {
    // 4. 无论是取消弹窗、接口成功还是接口失败/超时，统一关闭 loading
    signLoading.value = false
  })
}

// 文件预览与下载
// const handlePreviewFile = () => {
//   getContractPreview({ id: currentId.value }).then(res => {
//     console.log('获取预览地址', res)
//     if (res.code === 10000) {
//       window.open(res.data.previewUrl, '_blank')
//     }
//   })
// }
const previewLoading = ref(false)
const downloadLoading = ref(false)
const handlePreviewFile = () => {
  if (previewLoading.value) return
  previewLoading.value = true

  getContractPreview({ id: currentId.value })
    .then(res => {
      if (res.code === 10000 && res.data?.previewUrl) {
        window.open(res.data.previewUrl, '_blank')
      } else {
        ElMessage.error(res.msg || '合同预览暂时打不开，请稍后重试')
      }
    })
    .catch(err => {
      console.error(err)
      ElMessage.error('合同预览暂时打不开，请稍后重试')
    })
    .finally(() => {
      previewLoading.value = false
    })
}

const downloadFile = () => {
  if (downloadLoading.value) return

  ElMessageBox.confirm('即将下载劳务合同，是否继续？', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '下载中...'
        downloadLoading.value = true

        getContractDownload({ id: currentId.value })
          .then(async (res) => {
            if (res.code === 10000 && res.data?.downloadUrl) {
              const fileUrl = res.data.downloadUrl
              const fileName = (infoObj.value.accountName || '') + '劳务协议文档_' + formatDateTime(new Date()) + '.pdf'

              try {
                // 请求文件链接获取 Blob 对象
                const response = await fetch(fileUrl)
                const blob = await response.blob()

                // 创建本地的临时 Blob URL 并触发下载
                const blobUrl = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = blobUrl
                link.download = fileName
                document.body.appendChild(link)
                link.click()

                // 清理 DOM
                document.body.removeChild(link)
                window.URL.revokeObjectURL(blobUrl)

                ElMessage.success('文件已开始下载')
                done()
              } catch (error) {
                console.error('文件下载失败:', error)
                ElMessage.error('文件没能文件已开始下载，请稍后重试')
              }
            } else {
              ElMessage.error(res.msg || '获取下载地址失败')
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '确 定'
            downloadLoading.value = false
          })
      } else {
        done()
      }
    }
  }).catch(() => {})
}

// 备注列表及弹窗逻辑
const remarkList = ref([])

const remarkDialogVisible = ref(false)
const remarkFormRef = ref(null)
const remarkForm = reactive({
  content: ''
})

const remarkRules = {
  content: [{ required: true, message: '请填写备注内容', trigger: 'blur' }]
}

const openRemarkDialog = () => {
  remarkForm.content = ''
  remarkDialogVisible.value = true
}

const closeRemarkDialog = () => {
  remarkDialogVisible.value = false
  if (remarkFormRef.value) {
    remarkFormRef.value.resetFields()
  }
}

const confirmSaveRemark = () => {
  remarkFormRef.value.validate((valid) => {
    if (valid) {
      addNoteList({
        contractId: currentId.value,
        text: remarkForm.content
      }).then(res => {
        if (res.code === 10000) {
          ElMessage.success('已保存')
          closeRemarkDialog()
          getNoteListFn()
        }
      })
    }
  })
}

const handleDeleteRemark = (item, index) => {
  ElMessageBox.confirm('删除后无法恢复，确认删除这条备注吗？', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    delNoteList({ id: item.id }).then(res => {
      if (res.code === 10000) {
        ElMessage.success('已删除')
        remarkList.value.splice(index, 1)
      }
    })
  })
}
// 查询备注
const getNoteListFn = () => {
  getNoteList({ id: currentId.value }).then(res => {
    if (res.code === 10000) {
      remarkList.value = res.data || []
    }
  })
}
const getContractDetailFn = () => {
  getContractDetail({ id: currentId.value }).then(res => {
    if (res.code === 10000) {
      infoObj.value = res.data
    }
  })
}

onMounted(() => {
  getContractDetailFn()
  getNoteListFn()
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
          padding: 24px 24px;
          border-radius: 8px;
          background: var(--theme-card);

          .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .margin-bottom-0 {
            margin-bottom: 0 !important;
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
        }
      }
    }
  }
}

/* 顶部合同详情卡片样式 */
.contractHeaderCard {
  display: flex;
  align-items: center;
  margin-top: 16px;
  // padding: 16px 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ededed;
  border-radius: 6px;
  // background-color: var(--theme-primary-soft);
  .infoContainer {
    display: flex;
    align-items: center;
    flex: 1;
  }
  .headerBtns {
    .btnDownload {
      height: 40px;
      padding: 0 20px;
      border-color: var(--theme-primary);
      // background-color: var(--theme-card);
      font-size: 16px;
      // color: var(--theme-primary);
    }
  }

  .contractIconBox {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 74px;
    height: 74px;
    margin-right: 16px;
    border-radius: 17px 17px 17px 17px;
    background-color: var(--theme-primary-soft);

    .iconfont {
      margin-left: 5px;
      font-size: 32px;
      color: var(--theme-primary);
    }
  }

  .contractInfoDetail {
    .contractNumRow {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      .contractNum {
        margin-right: 10px;
        font-weight: 600;
        font-size: 22px;
        color: var(--theme-text);
      }

      .statusTag {
        margin-left: 12px;
      }
    }

    .contractMeta {
      font-size: 14px;
      color: #8c8c8c;
    }
  }
}

/* 文件预览区域 */
.filePreviewCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 16px 24px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background-color: var(--theme-bg)#fafafa;

  .fileLeft {
    display: flex;
    align-items: center;
    .pdfTag {
      width: 49px;
      margin-right: 24px;
    }

    .fileName {
      font-size: 16px;
      color: var(--theme-text);
    }
  }
}

/* 备注列表样式 */
.remarkSection {
  .remarkHeader {
    display: flex;
    align-items: center;

    .btnEditRemark {
      margin-left: 12px;
      border-radius: 16px;
    }
  }

  .customTimeline {
    padding-left: 4px;

    .timelineTitle {
      line-height: 23px;
      font-weight: 600;
      font-size: 16px;
      color: var(--theme-text);
    }

    .timelineText {
      margin-top: 4px;
      font-weight: 400;
      font-size: 16px;
      color: var(--theme-text-2);
    }

    .deleteBtn {
      margin-top: 8px;
      padding: 0 !important;
      cursor: pointer;
      line-height: 23px;
      font-size: 16px;
      color: #ff1414;
    }
  }
  .editBtn {
    margin-top: 16px;
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

  .imgSubText {
    width: 100%;
    margin-top: 12px;
    text-align: center;
    font-size: 14px;
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

/* 辅助边距类 */
.margin-top-12 {
  margin-top: 12px;
}

.margin-top-16 {
  margin-top: 16px;
}

.margin-top-24 {
  margin-top: 24px;
}
.el-button.lineBtn {
  width: 124px;
  height: 40px;
  border-radius: 20px !important;
  font-weight: 600;
  font-size: 16px;
  color: var(--theme-text-2);
  &:hover {
    border-color: #d8d8d8;
  }
  .iconfont {
    margin-right: 10px;
  }
  &.blueLine {
    border-color: var(--theme-primary);
    color: var(--theme-primary);

    .iconfont {
      color: var(--theme-primary);
    }
  }
}
.statusDot1 {
  border-color: #e4e4e4;
  border-radius: 2px;
  background: var(--theme-primary-soft);
  color: var(--theme-text-2);
}
.statusDot2 {
  border-color: #95b4fb;
  border-radius: 2px;
  background: var(--theme-primary-soft);
  // background-color: rgba(54, 112, 248, 0.05);
  color: rgba(54, 112, 248, 1);
}
.statusDot3 {
  border-color: #7bceb6;
  border-radius: 2px;
  background: var(--theme-success-soft);
  color: rgba(4, 162, 115, 1);
}
.statusDot4 {
  border-color: #ffd997;
  border-radius: 2px;
  background: var(--theme-fill);
  color: rgba(245, 159, 12, 1);
}
.statusDot5 {
  border-color: #ffa2a2;
  border-radius: 2px;
  background: var(--theme-danger-soft);
  color: rgba(255, 78, 78, 1);
}
</style>

<style lang="scss">
.remarkDialog {
  &.el-dialog .el-dialog__header {
    padding-bottom: 16px !important;
  }
  .el-form--label-top .el-form-item__label {
    margin: 0 0 10px 0 !important;
    font-weight: 500;
  }
}
</style>
