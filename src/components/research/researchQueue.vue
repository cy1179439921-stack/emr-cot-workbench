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
              <el-select v-model="searchInfo.hospital" multiple :multiple-limit="30" collapse-tags collapse-tags-tooltip clearable placeholder="请选择一项">
                <el-option
                  v-for="item in hospitalGroupOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="病种" class="form-query-select">
              <CommonMultiSelectWithSearch v-model="searchInfo.disease" :options="diseaseGroupOptions" :multipleLimit="30"/>
            </el-form-item>
            <el-form-item label="创建人" class="form-query-select">
              <commonMultipleSelect
                v-model="searchInfo.creator"
                :options="creatorGroupOptions"
                placeholder="全部"
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
              <el-button type="primary" @click="onSubmit">查 询</el-button>
            </div>
          </el-form>
        </header>
        <header class="header header2">
          <div>研究队列</div>
          <el-button type="primary" @click="newResearch" v-if="!userStore.needCheckPermission || hadPermissionList.includes('新增队列')"><i class="iconfont icon-tianjiayihang"></i>新增研究队列</el-button>
        </header>
      </div>

      <div class="card-section">
        <el-scrollbar v-if="!loading && cardList.length > 0">
          <div class="card" v-for="item in cardList" :key="item.id" @click="toDetail(item, '详情')">
            <div class="card-title">
              <img :src="researchLogo">
              <span class="title content-ellipsis" :title="item.queueName">{{item.queueName}}</span>
              <el-button link type="danger" class="deleteDiv" @click.stop="deleteResearch(item)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('删除队列')"><i class="iconfont icon-shanchu2"></i>删除</el-button>
            </div>
            <div class="card-number">
              <div class="number">
                <div>{{item.patientSum}}</div>
                <div>患者数</div>
              </div>
              <div class="splitLine"></div>
              <div class="number">
                <div>{{item.medicalSum}}</div>
                <div>病案数</div>
              </div>
            </div>
            <div class="card-info">
              <div class="card-info-title">患者纳排标准</div>
              <div class="card-info-text card-flag firstline">医院：
                <div class="hospital-flag" v-if="item.agencyList.length > 0">
                  <template v-for="(item2, index2) in item.agencyList" :key="index2">
                    <div class="tag tag-hospital" v-if="index2 < item.tagHosCanShow">{{item2.name}}</div>
                  </template>
                  <el-popover :teleported="false" popper-class="card-more-popover" placement="bottom-start" width="auto" v-if="item.agencyList.length > item.tagHosCanShow">
                    <template #reference>
                      <div class="tag more-flag">+{{ item.agencyList.length - item.tagHosCanShow }}</div>
                    </template>
                    <el-scrollbar>
                      <template v-for="(item2, index2) in item.agencyList" :key="index2">
                        <div class="hospital-item" v-if="index2 > item.tagHosCanShow - 1">
                          <span>{{item2.name}}</span>
                        </div>
                      </template>
                    </el-scrollbar>
                  </el-popover>
                </div>
                <div class="hospital-flag no-flag" v-else>暂无</div>
              </div>
              <div class="card-info-text card-flag">病种：
                <div class="hospital-flag disease-flag" v-if="item.diseaseList.length > 0">
                  <template v-for="(item2, index2) in item.diseaseList" :key="index2">
                    <div class="tag tag-hospital" v-if="index2 < item.tagDiseaseCanShow">{{item2.name}}</div>
                  </template>
                  <el-popover :teleported="false" popper-class="card-more-popover card-more-disease-popover" placement="bottom-start" width="auto" v-if="item.diseaseList.length > item.tagDiseaseCanShow">
                    <template #reference>
                      <div class="tag more-flag">+{{ item.diseaseList.length - item.tagDiseaseCanShow }}</div>
                    </template>
                    <el-scrollbar>
                      <template v-for="(item2, index2) in item.diseaseList" :key="index2">
                        <div class="hospital-item" v-if="index2 > item.tagDiseaseCanShow - 1">
                          <span>{{item2.name}}</span>
                        </div>
                      </template>
                    </el-scrollbar>
                  </el-popover>
                </div>
                <div class="hospital-flag disease-flag no-flag" v-else>暂无</div>
              </div>
            </div>
            <div class="card-info base-info">
              <div class="card-info-title">基本信息</div>
              <div class="card-info-text firstline">
                <div>参与人数</div>
                <div>：{{item.userNum}}人</div>
              </div>
              <div class="card-info-text">
                <div>创建时间</div>
                <div>：{{convertTimestampToDate(item.createTime)}}</div>
              </div>
              <div class="card-info-text">
                <div>创 建 人</div>
                <div>：{{item.creator}}</div>
              </div>
            </div>
            <div class="card-btn" v-if="!userStore.needCheckPermission || hadPermissionList.includes('查看详情') || hadPermissionList.includes('查看配置')">
              <el-button @click.stop="toDetail(item, '详情')" v-if="!userStore.needCheckPermission || hadPermissionList.includes('查看详情')">详 情</el-button>
              <el-button @click.stop="toDetail(item, '配置')" v-if="!userStore.needCheckPermission || hadPermissionList.includes('查看配置')">配 置</el-button>
            </div>
          </div>
        </el-scrollbar>

        <div class="loadingDiv" v-if="loading || cardList.length === 0">
          <emptyContent :loading="loading"/>
        </div>
      </div>
    </div>
    <el-dialog title="新增研究队列" v-model="addDialogShow" class="new_Dialog" :width="pxToRem(500)" :before-close="handleClose">
      <el-form ref="ruleFormRef" label-position="left" :model="formData" class="new_DialogForm" :rules="rules" @submit.prevent>
        <el-form-item label="研究队列名称：" prop="researchName">
          <el-input text placeholder="请填写内容" maxlength="50" show-word-limit v-model="formData.researchName" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="researchName"></el-input>
        </el-form-item>
        <div class="errorMsg" v-if="errorMsg">{{errorMsg}}</div>
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

<script>
export default {
  name: 'ResearchQueue'
}
</script>
<script setup>
import { ref, reactive } from 'vue'
import router from '@/router'
import { formatStandardDate, convertTimestampToDate } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import emptyContent from '@/components/medicalRecord/standardizedMedical/emptyContent.vue'
import { getResearchList, getResearchDisease, getResearchCreat, addNewResearch, removeResearch } from '@/api/api_research'
import { getAllAgency } from '@/api/api_home'
import { useResearchStore } from '@/store/researchStore'
import researchLogo from '@/assets/researchLogo.png'
import { useUserStore } from '@/store/user'
import { useMedicalStore } from '@/store/medicalStore'
import CommonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
const medicalStore = useMedicalStore()
const userStore = useUserStore()
// 导出权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/research/researchQueue') {
    hadPermissionList.value.push(item.name)
  }
})
const researchStore = useResearchStore()
// 移除研究队列详情的缓存
medicalStore.handlerRouterKeepLiveList('researchQueueDetail', 'add')
const searchInfo = ref({
  hospital: [],
  disease: [],
  creator: [],
  createTime: ''
})
const loading = ref(true)
const cardList = ref([])
const addDialogShow = ref(false)
const hospitalGroupOptions = ref([])
const diseaseGroupOptions = ref([])
const creatorGroupOptions = ref([])
const formData = reactive({
  researchName: ''
})
const createTimeBegin = ref('')
const createTimeEnd = ref('')
const errorMsg = ref('')
const saveDate = ref(false)
const boxWidth = ref(228)
const rules = reactive({
  researchName: [{ required: true, message: '', trigger: 'blur' }]
})
// 获取列表数据
const getListData = async() => {
  loading.value = true
  searchInfo.value.hospital = searchInfo.value.hospital === '' ? [] : searchInfo.value.hospital
  searchInfo.value.disease = searchInfo.value.disease === '' ? [] : searchInfo.value.disease
  if (searchInfo.value.createTime) {
    createTimeBegin.value = formatStandardDate(searchInfo.value.createTime[0])
    createTimeEnd.value = formatStandardDate(searchInfo.value.createTime[1])
  } else {
    createTimeBegin.value = ''
    createTimeEnd.value = ''
  }
  const params = {
    agency: searchInfo.value.hospital,
    disease: searchInfo.value.disease,
    creatorIds: searchInfo.value.creator,
    createTimeBegin: createTimeBegin.value,
    createTimeEnd: createTimeEnd.value,
    pageNum: 1,
    pageSize: 200
  }
  const res = await getResearchList(params)
  if (res.code === 10000) {
    cardList.value = res.data.items
    // 判断boxWidth的宽度能容下几个flag
    cardList.value.forEach((item, index) => {
      let width = 0
      let width2 = 0
      if (item.agencyList.length === 1) {
        item.tagHosCanShow = 1
      } else {
        item.agencyList.forEach((item2, index2) => {
          if (width < boxWidth.value) {
            const itemWidth = item2.name?.length * 12 + 20
            width += itemWidth
            item.tagHosCanShow = index2 + 1
            if (width > boxWidth.value) {
              item.tagHosCanShow = index2
            }
          }
        })
      }
      if (item.diseaseList.length === 1) {
        item.tagDiseaseCanShow = 1
      } else {
        item.diseaseList.forEach((item2, index2) => {
          if (width2 < boxWidth.value) {
            const itemWidth = item2.name.length * 12 + 20
            width2 += itemWidth
            item.tagDiseaseCanShow = index2 + 1
            if (width2 > boxWidth.value) {
              item.tagDiseaseCanShow = index2
            }
          }
        })
      }
    })
    loading.value = false
    if (saveDate.value) {
      saveDate.value = false
      // toDetail(cardList.value[0], 0)
    }
  }
}

// 获取医院数据
const getHospitalData = async() => {
  const res = await getAllAgency({})
  if (res.code === 10000) {
    hospitalGroupOptions.value = res.data
  }
}

// 获取病种数据
const getDiseaseData = async() => {
  const res = await getResearchDisease()
  if (res.code === 10000) {
    diseaseGroupOptions.value = res.data
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
  // await toGetSysDictionaryByType()
  // getData()
  getListData()
  getHospitalData()
  getDiseaseData()
  getPersonData()
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {
    hospital: [],
    disease: [],
    creator: [],
    createTime: ''
  }
  getListData()
}
const curEditRow = ref('')
const ruleFormRef = ref(null)
// 新增
const newResearch = () => {
  curEditRow.value = ''
  formData.researchName = ''
  addDialogShow.value = true
}
const handleClose = async () => {
  clearValidate()
  addDialogShow.value = false
  // await getData()
}
const clearValidate = () => {
  errorMsg.value = ''
}
// 搜索
const onSubmit = () => {
  getListData()
  return false
}
//  新增研究队列
const submitForm = async(formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      const params = {
        icon: '',
        queueName: formData.researchName
      }
      const res = await addNewResearch(params)
      if (res.code === 10000) {
        saveDate.value = true
        ElMessage.success('已新增')
        handleClose()
        getListData()
      } else {
        errorMsg.value = res.msg
      }
    } else {
      errorMsg.value = '请填写研究队列名称'
      console.log('error submit!', fields)
    }
  })
}
// 跳转到详情
const toDetail = (item, name) => {
  researchStore.setCurResearchQueueDetail({
    ...item,
    defaultTabName: '纳排标准',
    hospitalData: hospitalGroupOptions.value,
    diseaseDate: diseaseGroupOptions.value
  })
  switch (name) {
    case '详情':
      if (!userStore.needCheckPermission || hadPermissionList.value.includes('查看详情')) {
        router.push({ name: 'researchQueueDetail' })
      }
      break
    case '配置':
      router.push({ name: 'researchQueueConfig' })
      break
  }
}
// 删除队列
const deleteResearch = (item) => {
  console.log(item.id)
  ElMessageBox.confirm(
    `确认删除<span class="specialText">【${item.queueName}】</span>吗？删除后将无法找回，请谨慎操作。`,
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
        id: item.id
      }
      const res = await removeResearch(params)
      if (res.code === 10000) {
        getListData()
        ElMessage({
          type: 'success',
          message: '已删除'
        })
      }
    })
    .catch(() => {
      // ElMessage({
      //   type: 'info',
      //   message: '删除失败'
      // })
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
      height: 440px;
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
    // .el-dialog__body {
    //   padding: 26px !important;
    // }
    .el-form {
      .errorMsg {
        position: absolute;
        left: 143px;
        margin-top: 4px;
        font-size: 12px;
        color: #ea0000;
      }
    }
    .el-form-item {
      margin-bottom: 0;
      .el-form-item__label {
        padding-right: 0;
      }
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
