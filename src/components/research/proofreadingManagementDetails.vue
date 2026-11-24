<template>
  <div class="researchQueue">
    <header class="header">
      <p @click="goBack"><i class="iconfont icon-zuo"></i>返回</p>
      <p></p>
      <p>{{researchName}}</p>
    </header>
    <div class="viewContent">
      <header class="info">
        <!-- <el-avatar :size="54" :src="researchLogo" /> -->
        <img class="logo" :src="myRequire('researchLogo.png')" />
        <div class="info-right">
          <div class="line1">
            <div class="line1-title">
              <span>{{researchName}}</span>
              <!-- <img class="bianji" @click="toEditResearchName" v-if="!userStore.needCheckPermission || hadPermissionList.includes('编辑队列')" :src="myRequire('bianji.png')" /> -->
              <img class="bianji" @click="toEditResearchName" :src="myRequire('bianji.png')" />
            </div>
            <div class="line-btn" @click="deleteResearch" v-if="!needCheckPermission || hadPermissionList.includes('删除队列')"><i class="iconfont icon-shanchu2"></i>删除批次</div>
          </div>
          <div class="line2">
            <span>病历总数：{{researchStore.curResearchQueueDetail.totalRecordCount}}</span>
            <span>已校对病历数：{{researchStore.curResearchQueueDetail.completedProofreadCount}}</span>
            <span>已复核病历数：{{researchStore.curResearchQueueDetail.completedReviewCount}}</span>
            <span>参与人员：{{researchStore.curResearchQueueDetail.participantCount}}</span>
            <span>医院：{{researchStore.curResearchQueueDetail.agencyName}}</span>
            <span>创建人：{{researchStore.curResearchQueueDetail.creator}}</span>
            <span>创建时间：{{researchStore.curResearchQueueDetail.createTime}}</span>
          </div>
        </div>
      </header>
      <div class="card-section">
        <div class="tabsDiv">
          <ul>
            <template v-for="item in tabs.filter(item => item.show)">
              <li :key="item.value" v-if="!item.hidden" class="flexCenter" :class="{'active': activeTabName === item.label}" @click="handleClickTab(item.label)">
                <div>{{item.label}}</div>
                <div class="bottomLine" ></div>
              </li>
            </template>
          </ul>
        </div>
        <div class="componentContent">
          <component :is="compUrl" :id="researchStore.curResearchQueueDetail.id" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList"></component>
        </div>
      </div>
    </div>
    <el-dialog title="编辑" v-model="dialogVisible" :width="pxToRem(499)" :before-close="handleClose" class="new_Dialog">
      <el-form ref="ruleFormRef" :label-width="pxToRem(100)" :model="formData" :rules="rules" class="new_DialogForm">
        <el-form-item label="批次名称：" prop="name">
          <el-input text placeholder="请填写内容" maxlength="100" show-word-limit v-model="formData.name" @submit.prevent></el-input>
        </el-form-item>
        <el-form-item label="医院：" prop="agencyId">
          <el-select v-model="formData.agencyId" clearable placeholder="请选择一项">
            <el-option
              v-for="item in researchStore.curResearchQueueDetail.hospitalData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="margin-top: 20px; text-align: right;">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit(ruleFormRef)">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'proofreadingManagementDetails'
}
</script>
<script setup>
import { ref, shallowRef, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteBatch, editBatch } from '@/api/api_proofread'
import { useResearchStore } from '@/store/researchStore'
import medicalRecordList from '@/components/research/medicalRecordList.vue'
import dataStatistics from '@/components/research/dataStatistics.vue'
import participants from '@/components/research/participants.vue'
import router from '@/router'
import { getPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/proofreadingManagement')
const myRequire = (name) => new URL(`/src/assets/${name}`, import.meta.url).href

const components = {
  medicalRecordList,
  dataStatistics,
  participants
}
const formData = ref({
  name: ''
})
const ruleFormRef = ref(null)
const researchStore = useResearchStore()
const researchName = ref(researchStore.curResearchQueueDetail.name)
const compUrl = shallowRef(null)
const dialogVisible = ref(false)
const rules = reactive({
  name: [{ required: true, message: '请填写批次名称', trigger: 'blur' }],
  agencyId: [{ required: true, message: '请选择所属医院', trigger: 'blur' }]
})
// 标签页
const tabs = ref([
  {
    label: '病历列表',
    value: 0,
    component: 'medicalRecordList',
    hidden: false,
    show: true
  },
  {
    label: '参与人员',
    value: 2,
    component: 'participants',
    hidden: false,
    show: !needCheckPermission.value || hadPermissionList.value.includes('查看参与人员')
  },
  {
    label: '数据统计',
    value: 1,
    component: 'dataStatistics',
    hidden: false,
    show: !needCheckPermission.value || hadPermissionList.value.includes('查看数据统计')
  }
])
const activeTabName = ref()

// 标签页切换
const handleClickTab = (indexName) => {
  activeTabName.value = indexName
  const obj = tabs.value.find(item => item.label === indexName)
  compUrl.value = components[obj.component]
}
handleClickTab(researchStore.curResearchQueueDetail ? researchStore.curResearchQueueDetail.defaultTabName : 0)

// 编辑研究队列名称
const toEditResearchName = () => {
  formData.value.name = researchName.value
  formData.value.agencyId = researchStore.curResearchQueueDetail.agencyId
  dialogVisible.value = true
}
// 取消编辑
// const cancelEdit = () => {
//   editResearchNameStatus.value = false
// }
// 保存编辑
const saveEdit = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid) => {
    if (valid) {
      const params = {
        id: researchStore.curResearchQueueDetail.id,
        name: formData.value.name,
        agencyId: formData.value.agencyId
      }
      const res = await editBatch(params)
      if (res.code === 10000) {
        researchName.value = formData.value.name
        dialogVisible.value = false
        researchStore.setCurResearchQueueDetail({
          ...researchStore.curResearchQueueDetail
        })
      }
    }
  }
  )
}
const handleClose = () => {
  dialogVisible.value = false
}
// 返回
const goBack = () => {
  router.push({ path: '/proofreadingManagement' })
}
// 删除队列
const deleteResearch = () => {
  ElMessageBox.confirm(`是否删除该批次数据？`, '删除批次', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteBatch({ id: researchStore.curResearchQueueDetail.id })
    if (res.code === 10000) {
      goBack()
      ElMessage({ type: 'success', message: '已删除' })
    }
  })
}
</script>

<style scoped lang="scss">
.researchQueue {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 48px;
    padding: 0 9px;
    background-color: var(--theme-card);
    p:nth-child(1) {
      display: flex;
      align-items: center;
      cursor: pointer;
      line-height: 23px;
      font-weight: 400;
      font-size: 16px;
      color: var(--theme-primary);
      i {
        font-size: 32px;
      }
    }
    p:nth-child(2) {
      height: 16px;
      margin: 0 14px 0 12px;
      border: 1px solid #cbcfdc;
    }
    p:nth-child(3) {
      line-height: 23px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
  }
  .info {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 102px;
    padding: 24px 16px 24px 24px;
    border-radius: 8px;
    background-color: var(--theme-card);
    img {
      width: 54px;
    }
    .info-right {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-left: 16px;
      .line1 {
        display: flex;
        justify-content: space-between;
        height: 20px;
        .line1-title {
          display: flex;
          align-items: center;
          font-size: 20px;
          span {
            display: block;
            font-weight: 500;
            font-size: 14px;
            color: var(--theme-text);
          }
          .bianji {
            display: block;
            width: 12px;
            height: 12px;
            margin-left: 8px;
            cursor: pointer;
          }
          :deep(.el-input) {
            .el-input__wrapper {
              padding: 0 14px;
              background-color: var(--theme-fill);
              box-shadow: none;
              .el-input__inner {
                width: 240px;
                height: 32px;
                line-height: 32px;
                font-size: 14px;
                color: var(--theme-text);
              }
              .el-input__count-inner {
                background: inherit;
                font-size: 16px;
                color: rgba(149, 149, 149, .5453);
              }
            }
          }
          .el-button {
            margin-left: 26px;
          }
          .el-button+.el-button {
            margin-left: 14px;
          }
        }
        .line-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          height: 32px;
          padding: 0 8px;
          border-radius: 2px;
          cursor: pointer;
          font-weight: 400;
          font-size: 14px;
          color: #ff4e4e;
          &:hover {
            background: rgba(234, 0, 0, 0.1);
            color: #ff4e4e;
          }
          .iconfont {
            margin-right: 4px;
            font-size: 13px;
          }
        }
      }
      .line2 {
        margin-top: 9px;
        span {
          margin-right: 31px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-2);
        }
      }
    }
  }
  .card-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    height: 0;
    margin-top: 16px;
    border-radius: 8px;
    .tabsDiv {
      display: flex;
      align-items: center;
      height: 65px;
      margin-bottom: 16px;
      border-radius: 8px;
      background-color: var(--theme-card);
      ul {
        display: flex;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 0 32px;
        font-size: 16px;
        li {
          display: flex;
          position: relative;
          flex-direction: column;
          width: 70px;
          margin-right: 31px;
          cursor: pointer;
          div:nth-child(1) {
            font-weight: 400;
            font-size: 16px;
            color: var(--theme-text-2);
          }
          .bottomLine {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 3px;
            background-color: var(--theme-card);
          }
          &.active {
            div:nth-child(1) {
              font-weight: 500;
              font-size: 16px;
              color: var(--theme-primary);
            }
            .bottomLine {
              background-color: var(--theme-primary);
            }
          }
        }
      }
    }
    .componentContent {
      flex: 1;
      height: 0;
    }
  }
  :deep(.new_Dialog) {
    .el-form-item {
      .el-form-item__label {
        padding-right: 8px;
      }
    }
  }
}
</style>
