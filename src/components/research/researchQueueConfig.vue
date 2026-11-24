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
              <!-- <i class="iconfont icon-bianji" @click="toEditResearchName" v-if="!userStore.needCheckPermission || hadPermissionList.includes('编辑队列')"></i> -->
              <img class="bianji" @click="toEditResearchName" v-if="!userStore.needCheckPermission || hadPermissionList.includes('编辑队列')" :src="myRequire('bianji.png')" />
            </div>
            <!-- <div class="line1-title" v-else>
              <el-input text placeholder="请填写内容" maxlength="50" show-word-limit v-model="newResearchName" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent></el-input>
              <el-button @click="cancelEdit">取 消</el-button>
              <el-button type="primary" @click="saveEdit">保存</el-button>
            </div> -->
            <div class="line-btn" @click="deleteResearch" v-if="!userStore.needCheckPermission || hadPermissionList.includes('删除队列')"><i class="iconfont icon-shanchu2"></i>删除研究队列</div>
          </div>
          <div class="line2">
            <span>病案数：{{researchStore.curResearchQueueDetail.medicalSum}}</span>
            <span>患者数：{{researchStore.curResearchQueueDetail.patientSum}}</span>
            <span>创建人：{{researchStore.curResearchQueueDetail.creator}}</span>
            <span>创建时间：{{convertTimestampToDate(researchStore.curResearchQueueDetail.createTime)}}</span>
          </div>
        </div>
      </header>
      <div class="card-section">
        <div class="tabsDiv">
          <ul>
            <template v-for="item in tabs">
              <li :key="item.value" v-if="!item.hidden" class="flexCenter" :class="{'active': activeTabName === item.label}" @click="handleClickTab(item.label)">
                <div>{{item.label}}</div>
                <div class="bottomLine" ></div>
              </li>
            </template>
          </ul>
        </div>
        <div class="componentContent">
          <component @dataVal="handleDataVal" :is="compUrl" :needCheckPermission="userStore.needCheckPermission" :hadPermissionList="hadPermissionList"></component>
        </div>
      </div>
    </div>
    <el-dialog
      title="编辑"
      v-model="dialogVisible"
      :width="pxToRem(499)"
      :before-close="handleClose"
      class="new_Dialog"
    >
      <el-form ref="ruleFormRef" :label-width="pxToRem(82)" label-position="left" :model="formData" class="new_DialogForm">
        <el-form-item label="编辑名称：" prop="newResearchName">
          <el-input text placeholder="请填写内容" maxlength="50" show-word-limit v-model="formData.newResearchName" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent></el-input>
        </el-form-item>
      </el-form>
      <div style="margin-top: 20px; text-align: right;">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ResearchQueueConfig'
}
</script>
<script setup>
import { ref, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { convertTimestampToDate } from '@/utils/utils'
import { editResearchName, removeResearch } from '@/api/api_research'
// import researchLogo from '@/assets/researchLogo.png'
import { useResearchStore } from '@/store/researchStore'
import inclusionCriteria from '@/components/research/inclusionCriteria.vue'
import indicatorList from '@/components/research/indicatorList.vue'
import participants from '@/components/research/participants.vue'
import router from '@/router'
import { useUserStore } from '@/store/user'
const myRequire = (name) => new URL(`/src/assets/${name}`, import.meta.url).href
const userStore = useUserStore()
// 导出权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/research/researchQueue') {
    hadPermissionList.value.push(item.name)
  }
})
// import { removeWatermark, setWaterMark } from '@/utils/watermark'
const components = {
  inclusionCriteria,
  indicatorList,
  participants
}
const formData = ref({
  newResearchName: ''
})
const researchStore = useResearchStore()
console.log(researchStore.curResearchQueueDetail)
const researchName = ref(researchStore.curResearchQueueDetail.queueName)
// const newResearchName = ref('')
const compUrl = shallowRef(null)
const dialogVisible = ref(false)

// 标签页
const tabs = ref([
  {
    label: '纳排标准',
    value: 0,
    component: 'inclusionCriteria',
    hidden: false
  },
  {
    label: '指标列表',
    value: 1,
    component: 'indicatorList',
    hidden: false
  },
  {
    label: '参与人员',
    value: 2,
    component: 'participants',
    hidden: false
  }
])
const activeTabName = ref()
// const editResearchNameStatus = ref(false)

// 标签页切换
const handleClickTab = (indexName) => {
  activeTabName.value = indexName
  const obj = tabs.value.find(item => item.label === indexName)
  console.log('obj', obj)
  compUrl.value = components[obj.component]
}
handleClickTab(researchStore.curResearchQueueDetail ? researchStore.curResearchQueueDetail.defaultTabName : 0)

// 编辑研究队列名称
const toEditResearchName = () => {
  formData.value.newResearchName = researchName.value
  dialogVisible.value = true
  console.log('点击编辑了啊')
}
// 取消编辑
// const cancelEdit = () => {
//   editResearchNameStatus.value = false
// }
// 保存编辑
const saveEdit = async () => {
  // editResearchNameStatus.value = false
  // ElMessage.error('名称已存在，请重新输入！')
  const params = {
    id: researchStore.curResearchQueueDetail.id,
    queueName: formData.value.newResearchName
  }
  const res = await editResearchName(params)
  if (res.code === 10000) {
    researchName.value = formData.value.newResearchName
    ElMessage.success('队列名称已修改')
    dialogVisible.value = false
    researchStore.setCurResearchQueueDetail({
      ...researchStore.curResearchQueueDetail,
      queueName: formData.value.newResearchName
    })
  }
}
const handleClose = () => {
  dialogVisible.value = false
}
// 返回
const goBack = () => {
  router.push({ name: 'researchQueue' })
}
// 删除队列
const deleteResearch = () => {
  ElMessageBox.confirm(
    `确认删除<span class="specialText">【${researchStore.curResearchQueueDetail.queueName}】</span>吗？删除后将无法找回，请谨慎操作。`,
    '删除研究队列',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const params = {
        id: researchStore.curResearchQueueDetail.id
      }
      console.log(params)
      const res = await removeResearch(params)
      if (res.code === 10000) {
        ElMessage({
          type: 'success',
          message: '已删除'
        })
        goBack()
      }
    })
    .catch(() => {
      // ElMessage({
      //   type: 'info',
      //   message: '删除失败'
      // })
    })
}

const handleDataVal = (val) => {
  researchStore.curResearchQueueDetail.medicalSum = val.medicalSum
  researchStore.curResearchQueueDetail.patientSum = val.patientSum
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
