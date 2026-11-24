
<template>
  <div class="researchQueue">
    <div class="viewContent">
      <div class="viewHeader">
        <header class="header header1">
          <div class="conditionTitle">
            <div class="title">查询条件</div>
          </div>
          <el-form class="commonSearch" ref="searchForm" :inline="true" :model="searchInfo">
            <el-form-item label="医院" class="form-query-select">
              <el-select v-model="searchInfo.agencyIdList" multiple :multiple-limit="30" collapse-tags collapse-tags-tooltip clearable placeholder="请选择一项">
                <el-option
                  v-for="item in hospitalGroupOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="创建人" class="form-query-select">
              <commonMultipleSelect
                v-model="searchInfo.createIds"
                :options="creatorGroupOptions"
                placeholder="请选择一项"
              />
            </el-form-item>
            <el-form-item label="创建时间" >
              <el-date-picker
                v-model="searchInfo.createTime"
                type="daterange"
                :clearable="false"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
            <div class="btnDiv">
              <el-button @click="resetParams">重置条件</el-button>
              <el-button type="primary" @click="getListData">查 询</el-button>
            </div>
          </el-form>
        </header>
        <header class="header header2">
          <div>批次列表</div>
          <el-button type="primary" @click="newResearch" v-if="!props.isMedicalRecordProofreading && (!needCheckPermission || proHadPermissionList.includes('新建批次'))"><i class="iconfont icon-tianjiayihang"></i>新增批次</el-button>
        </header>
      </div>

      <div class="card-section">
        <el-scrollbar v-if="!loading && cardList.length > 0">
          <div class="card" v-for="item in cardList" :key="item.id">
            <div class="card-title">
              <img :src="researchLogo">
              <span class="title content-ellipsis" :title="item.name">{{item.name}}</span>
              <el-button link type="danger" class="deleteDiv" @click.stop="deleteResearch(item)" v-if="!props.isMedicalRecordProofreading && !needCheckPermission || proHadPermissionList.includes('删除批次')"><i class="iconfont icon-shanchu2"></i>删除</el-button>
            </div>
            <div class="card-number">
              <div class="number">
                <div>{{item.totalRecordCount}}</div>
                <div>病历总数</div>
              </div>
              <div class="splitLine"></div>
              <div class="number">
                <div>{{item.completedProofreadCount}}</div>
                <div>已校对病历数</div>
              </div>
              <div class="splitLine"></div>
              <div class="number">
                <div>{{item.completedReviewCount}}</div>
                <div>已复核病历数 </div>
              </div>
            </div>
            <div class="card-info base-info">
              <div class="card-info-title">基本信息</div>
              <div class="card-info-text firstline">
                <div>参与人员</div>
                <div>：{{item.participantCount}}人</div>
              </div>
              <div class="card-info-text">
                <div>医院</div>
                <div>：{{item.agencyName}}</div>
              </div>
              <div class="card-info-text">
                <div>创 建 人</div>
                <div>：{{item.creator}}</div>
              </div>
              <div class="card-info-text">
                <div>创建时间</div>
                <div>：{{item.createTime}}</div>
              </div>
            </div>
            <div class="card-btn">
              <el-button @click.stop="toDetail(item, '开始校对')" v-if="props.isMedicalRecordProofreading && (!needCheckPermission || medHadPermissionList.includes('校对'))">开始校对</el-button>
              <el-button @click.stop="toDetail(item, '配置')" v-if="!props.isMedicalRecordProofreading">详 情</el-button>
            </div>
          </div>
        </el-scrollbar>
        <div class="loadingDiv" v-if="loading || cardList.length === 0">
          <emptyContent :loading="loading"/>
        </div>
      </div>
    </div>
    <el-dialog title="新增批次" v-model="addDialogShow" class="new_Dialog" :width="pxToRem(500)" :before-close="handleClose">
      <el-form ref="ruleFormRef" :model="formData" class="new_DialogForm" :label-width="pxToRem(100)" :rules="rules" @submit.prevent>
        <el-form-item label="批次名称：" prop="name">
          <el-input text placeholder="请填写内容" maxlength="100" show-word-limit v-model="formData.name" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="name"></el-input>
        </el-form-item>
        <el-form-item label="医院：" prop="agencyId">
          <el-select v-model="formData.agencyId" clearable placeholder="请选择一项">
            <el-option
              v-for="item in hospitalGroupOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import router from '@/router'
import { formatStandardDate } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import emptyContent from '@/components/medicalRecord/standardizedMedical/emptyContent.vue'
import { getResearchCreat } from '@/api/api_research'
import { getBatchList, getBatchListByParticipant, addBatch, deleteBatch, getQueueList } from '@/api/api_proofread'
import { getAllAgencyByCity } from '@/api/api_home'
import { useResearchStore } from '@/store/researchStore'
import { useMedicalRecordListStore } from '@/store/medicalRecordListStore'
import researchLogo from '@/assets/researchLogo.png'
import { useMedicalStore } from '@/store/medicalStore'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import { getPagePermission } from '@/hooks/permissionHooks'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
// 导出权限
const proHadPermissionList = ref([])
const medHadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/proofreadingManagement') {
    proHadPermissionList.value.push(item.name)
  }
  if (item.url === '/medicalRecordProofreading') {
    medHadPermissionList.value.push(item.name)
  }
})
const { needCheckPermission } = getPagePermission('/proofreadingManagement')
const props = defineProps({
  isMedicalRecordProofreading: { // 是否是病历校对页面
    default: false
  }
})

const medicalStore = useMedicalStore()
const researchStore = useResearchStore()
const medicalRecordListStore = useMedicalRecordListStore()
// 移除研究队列详情的缓存
medicalStore.handlerRouterKeepLiveList('researchQueueDetail', 'add')
const searchInfo = ref({
  agencyIdList: [],
  createIds: [],
  createTime: ''
})
const loading = ref(true)
const cardList = ref([])
const addDialogShow = ref(false)
const hospitalGroupOptions = ref([])
const creatorGroupOptions = ref([])
const formData = reactive({
  name: '',
  agencyId: ''
})
const curEditRow = ref('')
const ruleFormRef = ref(null)
const createTimeStart = ref('')
const createTimeEnd = ref('')
const saveDate = ref(false)
const rules = reactive({
  name: [{ required: true, message: '请填写批次名称', trigger: 'blur' }],
  agencyId: [{ required: true, message: '请选择所属医院', trigger: 'blur' }]
})
// 获取列表数据
const getListData = async() => {
  loading.value = true
  if (searchInfo.value.createTime) {
    createTimeStart.value = formatStandardDate(searchInfo.value.createTime[0])
    createTimeEnd.value = formatStandardDate(searchInfo.value.createTime[1])
  } else {
    createTimeStart.value = ''
    createTimeEnd.value = ''
  }
  const params = {
    agencyIdList: searchInfo.value.agencyIdList,
    createIds: searchInfo.value.createIds,
    createTimeStart: createTimeStart.value,
    createTimeEnd: createTimeEnd.value
  }
  const res = props.isMedicalRecordProofreading ? await getBatchListByParticipant(params) : await getBatchList(params)
  if (res.code === 10000) {
    cardList.value = res.data.items
    loading.value = false
  }
}

// 获取医院数据
const getHospitalData = async() => {
  const res = await getAllAgencyByCity({})
  if (res.code === 10000) {
    hospitalGroupOptions.value = res.data
  }
}

// 获取创建人数据
const getPersonData = async() => {
  const res = await getResearchCreat()
  if (res.code === 10000) {
    creatorGroupOptions.value = res.data.map(item => {
      return {
        label: item.userName,
        value: item.id
      }
    })
  }
}
// 加载时请求页面列表
const init = async() => {
  getHospitalData()
  getPersonData()
  getListData()
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {
    agencyIdList: [],
    createIds: [],
    createTime: ''
  }
  getListData()
}
// 新增
const newResearch = () => {
  ruleFormRef.value?.resetFields()
  curEditRow.value = ''
  formData.name = ''
  formData.agencyId = ''
  addDialogShow.value = true
}
const handleClose = async () => {
  addDialogShow.value = false
}
//  新增批次
const submitForm = async(formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid) => {
    if (valid) {
      const res = await addBatch(formData)
      if (res.code === 10000) {
        saveDate.value = true
        ElMessage.success('已新增')
        handleClose()
        getListData()
      }
    }
  })
}
// 跳转到详情
const toDetail = async (item, name) => {
  // 从列表页进入详情时，清除病历列表的查询条件
  medicalRecordListStore.resetState()
  researchStore.setCurResearchQueueDetail({
    ...item,
    defaultTabName: '病历列表',
    hospitalData: hospitalGroupOptions.value,
    diseaseDate: []
  })
  switch (name) {
    case '开始校对':
      ElMessageBox.confirm(`是否开始校对？若无校对中的病历，将分配新的病历开始校对？`, '开始校对', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }).then(() => {
        getQueueList({ batchId: item.id }).then(async res => {
          if (res.code === 10000) {
            if (res.data) {
              medicalStore.setBatchId(item.id)
              medicalStore.setUserAllocateId(res.data.userAllocateId)
              medicalStore.setRecordId(res.data.recordId)
              router.push({
                name: 'proofreadMedical'
              })
            } else {
              ElMessage.warning('当前批次病历已全部校对完成')
            }
          }
        })
      })
      break
    case '配置':
      router.push({ name: 'proofreadingManagementDetails' })
      break
  }
}
// 删除批次
const deleteResearch = (item) => {
  ElMessageBox.confirm(`是否删除该批次数据？`, '删除批次', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteBatch({ id: item.id })
    if (res.code === 10000) {
      getListData()
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
  .viewContent {
    padding: 0;
    .viewHeader {
      padding: 16px;
    }
  }
  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 16px 0 0;
    background-color: var(--theme-card);
    :deep(.el-form) {
      display: flex;
      position: relative;
      width: 100%;
      margin-top: 24px;
      .el-form-item {
        min-width: 240px;
        margin-right: 32px;
        .el-form-item__label {
          padding-right: 10px;
        }
        .el-form-item__content {
          &:has(.el-date-editor) {
            width: 344px;
          }
        }
      }
    }
    &.header2 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 67px;
      margin-top: 16px;
      padding: 0 26px;
      border-radius: 8px;
      div:nth-child(1) {
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .el-button {
        i {
          margin-right: 10px;
          font-size: 12px;
        }
      }
    }
    &.header1 {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 127px;
      padding: 0 26px;
      border-radius: 8px;
      background-color: var(--theme-card);
      font-size: 14px;
      .conditionTitle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-top: 24px;
        .title {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        .btnDiv {
          .el-button {
            &:nth-child(2) {
              margin-left: 14px;
              color: #fff;
            }
          }
        }
      }
    }
    .divText {
      display: flex;
      align-items: center;
      height: 100%;
      font-weight: 500;
      font-size: 16px;
      color: #0b0b0a;
      span {
        margin-right: 15px;
        padding-right: 15px;
        border-right: 1px solid #d9d9d9;
        cursor: pointer;
        i {
          font-weight: 600;
          color: #378aff;
        }
      }
    }
  }
  .card-section {
    display: flex;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    height: 0;
    padding: 0 16px;
    :deep(.el-scrollbar) {
      width: 100%;
      height: 100%;
      .el-scrollbar__wrap {
        width: 100%;
        height: 100%;
        .el-scrollbar__view {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
        }
      }
    }
    .loadingDiv {
      width: 100%;
      height: 100%;
    }
    .card {
      box-sizing: border-box;
      width: calc((100% - 64px)/5);
      height: 372px;
      margin: 0 16px 16px 0;
      padding: 16px;
      border-radius: 8px;
      background-color: var(--theme-card);
      cursor: pointer;
      &:nth-child(5n) {
        margin-right: 0;
      }
      &:hover {
        box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
        .card-title {
          .deleteDiv {
            visibility: visible;
          }
        }
      }
      .card-title {
        display: flex;
        align-items: center;
        img {
          width: 29px;
          height: 29px;
        }
        .title {
          flex: 1;
          margin-left: 12px;
          font-weight: 500;
          color: var(--theme-text);
        }
        .deleteDiv {
          visibility: hidden;
          .iconfont {
            margin-right: 6px;
          }
        }
      }
      .card-number {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        height: 73px;
        margin-top: 16px;
        border-radius: 4px;
        background: rgba(54, 112, 248, 0.03);
        .number {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          flex: 1;
          div:nth-child(1) {
            font-weight: 700;
            font-size: 20px;
            color: var(--theme-text);
          }
          div:nth-child(2) {
            margin-top: 1px;
            font-size: 12px;
            color: var(--theme-text-2);
          }
        }
        .splitLine {
          width: 1px;
          height: 34px;
          background-color: #e8e8e8;
        }
      }
      .card-info {
        margin-top: 24px;
        .card-info-title {
          font-weight: 500;
          color: var(--theme-text);
        }
        .card-info-text {
          display: flex;
          margin-top: 8px;
          color: var(--theme-text-2);
          &.firstline {
            margin-top: 10px;
          }
        }
        .card-flag {
          display: flex;
          .hospital-flag {
            display: flex;
            position: relative;
            align-items: center;
            width: 85%;
            &.no-flag {
              color: var(--theme-text-3);
            }
            .tag {
              display: flex;
              align-items: center;
              height: 20px;
              margin-right: 4px;
              padding: 0 8px;
              border-radius: 2px;
              font-size: 12px;
            }
            .tag-hospital {
              // max-width: 7em;
              background: #eaf0fe;
              color: var(--theme-primary);
            }
            .tag-disease {
              background: rgba(255, 78, 78, 0.1);
              color: #ff4e4e;
            }
            .more-flag {
              margin-right: 0;
              background: #eaf0fe;
              color: var(--el-color-primary);
            }
          }
          .disease-flag {
            .tag-hospital {
              background: rgba(247, 104, 104, 0.1);
              color: #ff4e4e;
            }
            .more-flag {
              margin-right: 0;
              background: rgba(255, 78, 78, 0.1);
              color: #ff4e4e;
            }
          }
        }
      }
      .base-info {
        margin-top: 20px;
        // .card-info-text {
        //   div:first-child {
        //     width: 58px;
        //   }
        // }
      }
      .card-btn {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 32px;
        margin-top: 22px;
        font-size: 12px;
        .el-button {
          flex: 1;
        }
        .el-button + .el-button {
          margin-left: 12px;
        }
      }
    }
  }
  :deep(.new_Dialog) {
    .el-form-item {
      .el-form-item__content {
        .el-input {
          height: 100%;
          line-height: 100%;
          font-size: 14px;
        }
      }
    }
    .el-input {
      .el-input__wrapper {
        .el-input__count-inner {
          font-size: 14px;
        }
      }
    }
  }
}
.creatPerson {
  .el-select-dropdown {
    .el-select-dropdown__item {
      overflow: hidden;
      max-width: 280px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

</style>
