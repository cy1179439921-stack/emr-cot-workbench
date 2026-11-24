<template>
  <div class="researchConfigurationDetails">
    <header class="pdfHeader">
      <div class="goBack">
        <p @click="goBack">
          <i class="iconfont icon-zuo"></i>
          <span>返回</span>
        </p>
      </div>
    </header>
    <div class="main" :class="{layoutLR: !isEdit}">
      <div class="tab" v-if="isEdit">
        <h3>科研配置</h3>
        <div class="steep">
          <el-steps :active="active" align-center finish-status="success">
            <el-step title="基础信息" />
            <el-step title="审批表单设计" />
            <el-step title="流程设计" />
          </el-steps>
        </div>
        <div></div>
      </div>
      <div class="menu" v-else>
        <h3>科研配置</h3>
        <ul>
          <li v-for="(item, index) in menuList" :key="index" :class="{'active': index === active}" @click="active = index">{{ item }}</li>
        </ul>
      </div>
      <div class="content" :class="{ process: active === 2 }">
        <el-scrollbar>
          <el-form ref="ruleFormRef" :model="formData" :rules="rules" class="ruleFormRef" :label-width="pxToRem(140)" v-if="[0,1].includes(active)">
            <template v-if="active === 0">
              <div class="section-title">
                <div class="line"></div>
                <div>基础信息</div>
              </div>
              <el-form-item label="流程名称:" prop="flowName">
                <el-input v-model="formData.flowName" :maxlength="30" placeholder="请填写内容" v-if="isEdit" clearable/>
                <span class="value" v-else>{{ formData.flowName }}</span>
              </el-form-item>
              <el-form-item label="说 明:" prop="description">
                <el-input v-model="formData.description" :maxlength="30" placeholder="请填写内容" v-if="isEdit" clearable/>
                <span class="value" v-else>{{ formData.description }}</span>
              </el-form-item>
              <el-form-item label="医 院:" prop="agencyId">
                <el-select v-model="formData.agencyId" placeholder="请填写内容" v-if="isEdit" @change="()=>getDepartmentData()">
                  <el-option v-for="item in hospitalGroupOptions" :key="item.id" :label="item.name" :value="item.id"/>
                </el-select>
                <span class="value" v-else>{{ formData.agencyId }}</span>
              </el-form-item>
              <el-form-item label="科 室:" prop="departmentId">
                <el-select v-model="formData.departmentId" placeholder="请填写内容" v-if="isEdit" :disabled="!formData.agencyId">
                  <el-option v-for="item in departmentOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
                <span class="value" v-else>{{ formData.departmentId }}</span>
              </el-form-item>
              <el-form-item label="阶 段:" prop="stage">
                <el-select v-model="formData.stage" placeholder="请填写内容" v-if="isEdit">
                  <el-option :label="i" :value="index + 1" v-for="(i,index) in stageEnumeration" :key="i" />
                </el-select>
                <span class="value" v-else>{{ formData.stage }}</span>
              </el-form-item>
              <el-form-item label="谁可以提交该审批:" prop="whoCanSubmitThisApproval" class="is-required">
                <el-select model-value="全员" placeholder="请填写内容" v-if="isEdit">
                  <el-option label="全员" value="全员" />
                </el-select>
                <span class="value" v-else>全员</span>
              </el-form-item>
            </template>
            <template v-if="active === 1">
              <div class="section-title">
                <div class="line"></div>
                <div>审批表单设计</div>
              </div>
              <el-form-item label="审批备注:" prop="approvalRemarks">
                <el-input v-model="formData.approvalRemarks" :autosize="{ minRows: 3 }" type="textarea" placeholder="请填写内容" :maxlength="500" show-word-limit v-if="isEdit" disabled/>
                <span class="value" v-else>{{ formData.approvalRemarks }}</span>
              </el-form-item>
              <el-form-item label="附 件:" prop="file" class="w100">
                <!-- <el-upload v-model:file-list="formData.fileList" multiple :auto-upload="false" :on-change="onChange"> -->
                <el-upload multiple :auto-upload="false" :on-change="onChange" v-if="isEdit">
                  <el-button type="primary" disabled>
                    <i class="iconfont icon-shangchuanfujian"></i>
                    上传附件
                  </el-button>
                </el-upload>
                <span class="value" v-else>{{ formData.fileList }}</span>
              </el-form-item>
            </template>
          </el-form>
          <template v-if="active === 2">
            <setting ref="settingRef" :isEdit="isEdit" :agencyId="formData.agencyId" :departmentOptions="departmentOptions" :initData="initData" :roleList="roleList"></setting>
          </template>
        </el-scrollbar>
      </div>
      <footer v-if="isEdit">
        <div class="handlerBtn">
          <el-button v-if="active === 0" @click="goBack">取 消</el-button>
          <el-button v-else @click="previousStep">上一步</el-button>
          <el-button type="primary" @click="saveRuleForm">{{ active === 2? '提 交' : '下一步' }}</el-button>
        </div>
      </footer>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'researchConfigurationDetails',
  inheritAttrs: false
})

import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useResearchStore } from '@/store/researchStore'
import setting from '@/components/researchManagement/setting.vue'
import { getDepartmentByAgencyId, checkProcess, addScientificConfig, updateScientificConfig } from '@/api/api_scientific'
import { getAllAgencyWithRole, getRoleListByAgency } from '@/api/api_home'
import _ from 'lodash'

const stageEnumeration = ['项目立项', '项目研究', '项目变更', '项目中检', '项目结题', '论文管理', '著作管理', '专利管理', '获奖管理']
const researchStore = useResearchStore()
const router = useRouter()
const active = ref(0)
const settingRef = ref(null)
const researchConfigurationDetails = ref(researchStore.researchConfigurationDetails)
const isEdit = computed(() => researchConfigurationDetails.value?.isEdit)
const isAdd = computed(() => researchConfigurationDetails.value?.isAdd)
const hospitalGroupOptions = ref([]) // 医院选项
const departmentOptions = ref([]) // 科室选项
const initData = ref(undefined)

onMounted(async () => {
  await getHospitalData()
  if (!isAdd.value) {
    formData.value = { ...researchConfigurationDetails.value, stage: stageEnumeration.indexOf(researchConfigurationDetails.value?.stage) + 1 }
    await getDepartmentData(researchConfigurationDetails.value?.departmentId)
    initData.value = JSON.parse(researchConfigurationDetails.value?.flowJson) || undefined
  }
  if (!isAdd.value && !isEdit.value) {
    formData.value.stage = researchConfigurationDetails.value?.stage || ''
    formData.value.agencyId = researchConfigurationDetails.value?.agencyName || ''
    formData.value.departmentId = researchConfigurationDetails.value?.departmentName || ''
  }
})
const roleList = ref([])
const ruleFormRef = ref(null)
const menuList = ['基本信息', '审批列表设计', '流程设计']
const formData = ref({
  flowName: '',
  description: '',
  agencyId: '',
  departmentId: '',
  stage: null,
  approvalRemarks: '',
  flowJson: ''
  // fileList: []
})

const rules = ref({
  flowName: { required: true, message: '请填写流程名称', trigger: 'blur' },
  // description: { required: true, message: '请填写备注', trigger: 'blur' },
  agencyId: { required: true, message: '请选择所属医院', trigger: 'blur' },
  departmentId: { required: true, message: '请选择科室', trigger: 'blur' },
  stage: { required: true, message: '请选择阶段', trigger: 'blur' }
  // whoCanSubmitThisApproval: { required: true, message: '请选择谁可以提交该审批', trigger: 'blur' }
})

const handlerTreeArr = (data) => {
  const arr = []

  function loop(data) {
    const params = {
      name: data.name,
      auditPersonType: data.auditPersonType,
      auditPersonId: _.get(data, 'nodeUserList[0].id', '')
    }
    if (data.auditPersonType === 1) {
      params.auditPersonId = data.designatedPersonInCharge || ''
    }

    arr.push(params)
    if (Object.values(data?.childNode || {}).length) {
      loop(data.childNode)
    }
  }
  if (data?.name) {
    loop(data)
  }
  return arr
}

const saveRuleForm = () => {
  if (active.value < 2) {
    if (active.value === 0) {
      ruleFormRef.value.validate((valid) => {
        if (valid) {
          checkProcess({ ...formData.value }).then(res => {
            if (res.code === 10000) {
              active.value++
            }
          })
        }
      })
    } else {
      active.value++
    }
  } else {
    const data = settingRef.value.saveSet()
    if (data) {
      formData.value.flowJson = JSON.stringify(data)
      formData.value.templateSaveAOList = handlerTreeArr(data.childNode)
      if (formData.value.templateSaveAOList.length === 0) {
        ElMessage.error('审批节点不能为空，请添加审批节点')
      } else {
        if (isAdd.value) {
          addScientificConfig({ ...formData.value }).then(res => {
            if (res.code === 10000) {
              ElMessage.success('已保存')
              router.push({ path: '/manage/scientificResearchConfiguration' })
            }
          })
        } else {
          ElMessageBox.confirm(
            `正在引用该流程还未完成的审批将继续走旧流程，新发起的将使用编辑后最新流程，确认保存？`,
            '编辑',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              type: 'warning'
            }
          ).then(async () => {
            updateScientificConfig({ ...formData.value }).then(res => {
              if (res.code === 10000) {
                ElMessage.success('修改成功')
                router.push({ path: '/manage/scientificResearchConfiguration' })
              }
            })
          }).catch(() => {})
        }
      }
    }
  }
}

const goBack = () => {
  if (isEdit.value) {
    ElMessageBox.confirm('填写内容将丢失，确认返回？', '返回',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.push({ path: '/manage/scientificResearchConfiguration' })
    })
  } else {
    router.push({ path: '/manage/scientificResearchConfiguration' })
  }
}

const onChange = (file, fileList) => {
  formData.value.fileList = fileList
  const { size } = file
  const isLt10M = size / 1024 / 1024 > 200
  if (isLt10M) {
    ElMessage.error('上传文件大小不能超过200MB')
    const currIdx = fileList.indexOf(file)
    formData.value.fileList.splice(currIdx, 1)
  }
}

// 获取医院数据
const getHospitalData = async() => {
  const res = await getAllAgencyWithRole({})
  if (res.code === 10000) {
    hospitalGroupOptions.value = res.data
  }
}

// 获取科室数据
const getDepartmentData = async(data = '') => {
  if (!formData.value.agencyId) return
  formData.value.departmentId = data
  const res = await getDepartmentByAgencyId({ id: formData.value.agencyId })
  if (res.code === 10000) {
    departmentOptions.value = res.data || []
  }
  await getRoleListByAgencyList()
}

const getRoleListByAgencyList = async () => {
  getRoleListByAgency({ id: formData.value.agencyId }).then(res => {
    roleList.value = res.data
  })
}

const previousStep = () => {
  if (settingRef.value) {
    initData.value = settingRef.value.initData()
  }
  nextTick(() => {
    active.value--
  })
}
</script>
<style scoped lang="scss">
.researchConfigurationDetails {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;

  .pdfHeader {
    display: flex;
    justify-content: space-between;
    height: 48px;
    min-height: 48px;
    margin-bottom: 16px;
    padding: 0 8px;
    border-radius: 0 0 0 0;
    background: var(--theme-card);
    opacity: 1;
    .goBack {
      display: flex;
      align-items: center;
      width: 100%;
      color: var(--theme-text);
      p {
        margin: 0;
      }
      p:nth-child(1) {
        display: flex;
        align-items: center;
        height: 20px;
        cursor: pointer;
        .iconfont {
          display: block;
          width: 32px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          font-size: 32px;
          color: var(--theme-primary);
        }
        span {
          display: block;
          margin-left: -5px;
          line-height: 32px;
          font-weight: 400;
          font-size: 16px;
          color: var(--el-color-primary);
        }
      }
    }
  }
  .main {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
    margin: 0 16px 16px;
    &.layoutLR {
      flex-direction: row;
      .menu {
        width: 260px;
        margin-right: 16px;
        padding: 16px 12px;
        h3 {
          margin-left: 12px;
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        ul li {
          width: 100%;
          margin-bottom: 8px;
          padding-left: 12px;
          border-radius: 2px;
          cursor: pointer;
          line-height: 36px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-2);
          &.active {
            background: rgba(54, 112, 248, 0.05);
            font-weight: 600;
            color: var(--theme-primary);
          }
        }
      }
      :deep(.node-wrap-box) {
        >.title {
          background: #c5c4c4 !important;
        }
        .text,
        .placeholder {
          color: var(--theme-text-3) !important;
        }
      }
      .section-title {
        margin-top: 200px !important;
      }
      :deep(.box-scale) {
        padding-top: 135px;
      }
      :deep(.add-node-btn) .btn {
        background: #9ab7fb;
      }
    }
    >div {
      border-radius: 8px;
      background: var(--theme-card);
    }
    .tab {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 80px;
      margin-bottom: 16px;
      padding: 0 24px;
      h3 {
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      :deep(.steep) {
        width: 600px;
        .el-step__title {
          padding-top: 6px;
          line-height: 1em;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-2);
          &.is-process {
            font-weight: 500;
            font-size: 14px;
            color: var(--theme-primary);
          }
        }
        .el-step__icon-inner.is-status {
          font-size: 16px;
        }
        .el-step.is-center .el-step__line {
          left: 60%;
          right: -40%;
          height: 1px;
          background-color: #d8d8d8;
        }
        .el-step__head {
          &.is-success {
            border-color: var(--el-color-primary);
            color: var(--el-color-primary);
            .el-step__line {
              background: var(--el-color-primary);
            }
          }
          &.is-process {
            .el-step__icon {
              border-color: var(--el-color-primary);
              background: var(--el-color-primary);
            }
            .el-step__icon-inner {
              color: #fff;
            }
          }
        }
      }
    }
    .content {
      display: flex;
      overflow: hidden;
      justify-content: center;
      flex: 1;
      padding-bottom: 24px;
      :deep(.ruleFormRef) {
        width: 556px;
        .el-form-item:has(:where(.el-input__wrapper, .el-select__wrapper)) .el-form-item__label,
        .el-input__wrapper,
        .el-select__wrapper {
          height: 40px;
          line-height: 40px;
        }
      }

      .section-title {
        display: flex;
        align-items: center;
        height: 20px;
        margin-top: 92px;
        margin-bottom: 24px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
        .line {
          width: 2px;
          height: 14px;
          margin-right: 6px;
          background-color: var(--theme-primary);
        }
      }
      .upload-demo {
        width: 100%;
      }
      &.process {
        background-color: var(--theme-primary-soft);
      }
      .value {
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text);
      }
    }
    footer {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: 55px;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      background: var(--theme-card);
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.1);
      .handlerBtn {
        .btn {
          box-sizing: border-box;
          margin-left: 12px;
          padding: 7px 16px;
          border: 1px solid var(--theme-primary);
          border-radius: 2px;
          cursor: pointer;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-primary);
          &:first-child {
            margin-left: 0;
          }
        }
        .primary {
          background: var(--theme-primary);
          color: #fff;
        }
        .del {
          border: 1px solid #ff4e4e;
          color: #ff4e4e;
        }
        .normal {
          border: 1px solid #d8d8d8;
          color: var(--theme-text-2);
        }
      }
    }
  }
}
.w100 .el-form-item__content>div {
  width: 100%;
}
.icon-shangchuanfujian {
  padding-right: 8px;
  font-size: 14px;
}
</style>
