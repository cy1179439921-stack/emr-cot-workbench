<template>
  <div class="platformInfo">
    <div class="viewContents">
      <div class="contentArea">
        <div class="header">
          <p>安全管理</p>
        </div>
        <div class="contentMain">
          <div class="title">
            <p class="configTitle">安全管理</p>
          </div>
          <div class="content">
            <el-form ref="platformForm" :model="platformInfo">
              <el-form-item label="是否展示敏感信息：">
                <el-radio-group v-model="platformInfo.value">
                  <el-radio value="1">是, 展示敏感信息</el-radio>
                  <el-radio value="0">否, 不展示敏感信息</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
          <div class="title">
            <p class="configTitle">发版通知</p>
          </div>
          <div class="content update-div">
            <el-form ref="updateForm" :model="updateNotification" :rules="updateRules">
              <el-form-item label="" prop="description">
                <div class="form-item-div">
                  <el-input
                    v-model="updateNotification.description"
                    placeholder="请填写发版通知文案"
                    show-word-limit
                    maxlength="200"
                  />
                  <el-tooltip :content="updateNotification.value ? '关闭通知' : '开启通知'" placement="top">
                    <el-switch v-model="updateNotification.value" />
                  </el-tooltip>
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div class="title">
            <p class="configTitle">校对模式</p>
          </div>
          <div class="content">
            <el-form ref="platformForm" :model="proofreadMode">
              <el-form-item label="是否展示校对模式：">
                <el-radio-group v-model="proofreadMode.value" @change="handleChangeMode">
                  <el-radio value="true">是, 展示校对模式</el-radio>
                  <el-radio value="false">否, 展示普通模式</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="btnBoxDiv">
          <!-- <el-button class="cancelBtn" @click="cancelBtnClick">取 消</el-button> -->
          <el-button class="saveBtn" type="primary" @click="saveBtnClick">保 存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getPlatformInfo, updatePlatformInfo } from '@/api/api_manageBackground'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const platformInfo = ref({
  id: '',
  topic: '',
  value: ''
})
const updateNotification = ref({
  value: false,
  description: ''
})
const proofreadMode = ref({
  value: localStorage.getItem('isProofreadingMode') || 'false'
})
const handleChangeMode = (val) => {
  localStorage.setItem('isProofreadingMode', val)
}
// const cancelBtnClick = () => {
//   console.log('cancel')
// }
const updateForm = ref(null)
const saveBtnClick = async () => {
  if (updateNotification.value.value) {
    if (updateForm.value) {
      const valid = await updateForm.value.validate().catch(() => false)
      if (!valid) {
        return
      }
    }
  }
  const params = {
    platformInfoList: [{
      id: platformInfo.value.id,
      topic: platformInfo.value.topic,
      value: platformInfo.value.value
    },
    {
      id: updateNotification.value.id,
      value: updateNotification.value.value ? '1' : '0',
      description: updateNotification.value.description
    }]
  }

  const res = await updatePlatformInfo(params)
  console.log(res)
  if (res.code === 10000) {
    ElMessage.success('已保存')
    const res = await getPlatformInfo()
    userStore.setPlatInfo({
      systemName: res.data[0].value,
      menuFoldLogo: res.data[1].value,
      menuExpandLogo: res.data[2].value,
      darkMenuFoldLogo: res.data[3].value,
      darkMenuExpandLogo: res.data[4].value,
      systemIco: res.data[5].value,
      loginLogo: res.data[6].value,
      isSensitiveInfo: res.data[7].value === '1' // 是否敏感信息
    })
  }
}

const getPlatformInfoData = async () => {
  const res = await getPlatformInfo()
  console.log(res)
  if (res.code === 10000) {
    const sensitiveInfoData = res.data.find(item => item.topic === 'show_sensitive_info')
    if (sensitiveInfoData) {
      platformInfo.value = sensitiveInfoData
    }
    const updateVersionData = res.data.find(item => item.topic === 'show_version')
    if (updateVersionData) {
      updateNotification.value.value = updateVersionData.value === '1'
      updateNotification.value.description = updateVersionData.description || ''
      updateNotification.value.id = updateVersionData.id
    }
    // console.log(platformInfo.value)
  }
}
const updateRules = computed(() => ({
  description: [
    { required: updateNotification.value.value, message: '请填写发版通知文案', trigger: 'blur' }
  ]
}))
const init = () => {
  getPlatformInfoData()
}

init()
</script>

<style scoped lang="scss">
.platformInfo {
  width: 100%;
  height: 100%;
  .viewContents {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 16px;
    .contentArea {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      border-radius: 8px;
      background: var(--theme-card);
      .header {
        display: flex;
        align-items: center;
        height: 53px;
        padding: 0 16px;
        border-bottom: 1px solid #e8e8e8;
        background: var(--theme-card);
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .contentMain {
        display: flex;
        flex-direction: column;
        flex: 1;
        background: var(--theme-card);
        .title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 943px;
          margin: 24px auto;
          .configTitle {
            margin: 0;
            padding-left: 3px;
            line-height: 20px;
            font-weight: 500;
            font-size: 16px;
            color: var(--theme-text);
            &::before {
              display: inline-block;
              width: 2px;
              height: 14px;
              margin-right: 6px;
              margin-top: -3px;
              background: var(--theme-primary);
              vertical-align: middle;
              content: "";
            }
          }
        }
        .content {
          width: 943px;
          margin: 0 auto;
          background: var(--theme-fill);
          :deep(.el-form) {
            width: 100%;
            padding: 24px 24px 1px 24px;
            .el-form-item {
              display: flex;
              flex-direction: column;
              width: 100%;
              margin-bottom: 24px;
              .el-form-item__label {
                display: block;
                height: 14px;
                margin-bottom: 10px;
                line-height: 14px;
                font-weight: 400;
                font-size: 14px;
                color: var(--theme-text);
              }
              .el-form-item__content {
                width: 450px;
                .el-radio-group {
                  display: grid;
                  span.el-radio__label {
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--theme-text-2);
                  }
                }
              }
            }
          }
        }
        .update-div {
          background: var(--theme-card);
          :deep(.el-form) {
            padding: 0;
            .el-form-item__content {
              width: 100% !important;
              .form-item-div {
                display: flex;
                width: 100%;
                .el-switch {
                  margin-left: 16px;
                }
              }
            }
          }
        }
      }
      .btnBoxDiv {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 55px;
        background: var(--theme-card);
        box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.1);
        .el-button {
          font-weight: 400;
          font-size: 14px;
          color: #fff;
        }
        .saveBtn {
          border: none;
          &:hover {
            background: var(--theme-primary);
          }
        }
      }
    }
  }
}
</style>

