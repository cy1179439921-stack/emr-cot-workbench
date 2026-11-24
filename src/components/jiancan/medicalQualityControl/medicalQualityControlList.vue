<template>
  <div class="researchQueue">
    <detailsOfMedicalRecords v-if="isDetails" :isPreview="isPreview" :isHeaderShow="false" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" :curData="curData" :diseaseGroupOptions="diseaseGroupOptions" @goBack="isDetails = false"></detailsOfMedicalRecords>
    <div class="viewContent" v-show="!isDetails">
      <header class="header header1">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="searchTitle">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="就诊ID" >
              <el-input v-model="searchInfo.medicalRecordId" clearable placeholder="请填写内容" @keyup.enter="onSubmit" oninput="value=value.replace(/[^\d.]/g,'')" maxlength="19"></el-input>
            </el-form-item>
            <el-form-item label="住院号" >
              <el-input v-model="searchInfo.visitNumber" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="患者姓名" >
              <el-input v-model="searchInfo.patientName" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="治疗类型">
              <commonMultipleSelect
                v-model="searchInfo.healingTypeList"
                :options="diseaseGroupOptions"
                placeholder="请选择一项"
              />
            </el-form-item>
            <el-form-item label="出院日期" :style="{width:pxToRem(300)}">
              <AllDateSelect
                :clearable="true"
                v-model="searchInfo.createTime"
                v-model:dateType="searchInfo.type"
              ></AllDateSelect>
            </el-form-item>
          </el-form>
          <div class="btnDiv">
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </div>
      </header>
      <div class="list-section">
        <header class="header">
          <div class="title">病历列表</div>
        </header>
        <commonTable class="singleTable emptyDefaultTable btnsLastCell" :data="tableBtnNum" @sort-change="handleChangeSort" ref="myTable" >
          <el-table-column prop="medicalRecordId" label="就诊ID" min-width="110"></el-table-column>
          <el-table-column prop="visitNumber" label="住院号" min-width="60"></el-table-column>
          <el-table-column prop="patientName" label="患者姓名" min-width="60"></el-table-column>
          <el-table-column prop="sex" label="性别" min-width="50">
            <template #default="scope">
              <div>{{ {0: '未知', 1: '男', 2: '女'}[scope.row.sex] }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" min-width="50"></el-table-column>
          <el-table-column prop="exitHospitalDate" sortable="custom" label="出院日期" min-width="80"></el-table-column>
          <el-table-column prop="healingType" label="治疗类型" min-width="100"></el-table-column>
          <el-table-column prop="creator" label="录入人" min-width="80"></el-table-column>
          <el-table-column prop="reportTime" label="上报时间" sortable="custom" min-width="100"></el-table-column>
          <el-table-column prop="agencyName" label="上报医院" min-width="90"></el-table-column>
          <el-table-column prop="reportFlag" label="上报状态" min-width="60">
            <template #default="scope">
              <div>{{ scope.row.reportFlag === 0 ? '未上报' : scope.row.reportFlag === 1 ? '上报成功' : '上报失败' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="数据来源" min-width="70">
            <template #default="scope">
              <div>{{ {0:'手动采集',1:'病历库采集',2:'自动采集'}[scope.row.uploadType] }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="105" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="lookFile(scope.row)" v-if="(!needCheckPermission || hadPermissionList.includes('查看指标'))">查看指标</el-button>
              <el-button type="primary" link @click="viewFile(scope.row)" v-if="scope.row.fileUrl && (!needCheckPermission || hadPermissionList.includes('查看原始病历'))">查看原始病历</el-button>
              <!-- <el-button class="greenBtn" :disabled="scope.row.bizStatus === 1 || scope.row.bizStatus === 11" link @click="lookFile(scope.row)">查看指标</el-button> -->
            </template>
          </el-table-column>
        </commonTable>
        <div class="tabel_pagination">
          <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
            <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
          </el-pagination>
        </div>
      </div>
      <pdfViews :pdfUrl="pdfUrl" v-model:isPdf='isPdf' :fileName="fileName" v-if="isPdf" ></pdfViews>
    </div>
  </div>
</template>

<script>
export default {
  name: 'medicalQualityControlList'
}
</script>
<script setup>
import { ref, computed } from 'vue'
import { getMedicalRecordList } from '@/api/jiancanAPI/api_home'
import { convertTimestampToDate } from '@/utils/utils.js'
import detailsOfMedicalRecords from '@/components/jiancan/medicalDirectReport/detailsOfMedicalRecords.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import { getPagePermission } from '@/hooks/permissionHooks'
import { diseaseOptions } from '@/components/jiancan/medicalDirectReport/configMenu.js'
const { needCheckPermission, hadPermissionList } = getPagePermission('/strokeDirectReport/medicalQualityControlList')
const isDetails = ref(false) // 是否查看病历详情
const curData = ref({}) // 当前病历数据
const isPreview = ref(false) // 是否预览病历
const myTable = ref(null)
const searchInfo = ref({
  medicalRecordId: '',
  visitNumber: '',
  patientName: '',
  healingTypeList: [],
  createTime: [],
  type: 'monthrange'
})
const diseaseGroupOptions = ref(diseaseOptions)
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const tableData = ref([])
const pdfUrl = ref('')
const isPdf = ref(false)
const fileName = ref('')

const tableBtnNum = computed(() => {
  const table = tableData.value.map(item => {
    item.btnNum = 0
    item.btns = ['查看']
    // 查看原始病历
    if ((!needCheckPermission.value || hadPermissionList.value.includes('查看原始病历')) && item.fileUrl) {
      item.btnNum += 1
      item.btns.push('查看原始病历')
    }

    return item
  })
  return table
})

// 获取列表数据
const getListData = async() => {
  let enterHospitalDateValue = ''
  let exitHospitalDateValue = ''
  if (searchInfo.value.createTime && searchInfo.value.createTime[0]) {
    enterHospitalDateValue = convertTimestampToDate(searchInfo.value.createTime[0])
  }
  if (searchInfo.value.createTime && searchInfo.value.createTime[1]) {
    exitHospitalDateValue = convertTimestampToDate(searchInfo.value.createTime[1])
  }
  const exitHospitalDates = enterHospitalDateValue || exitHospitalDateValue ? [enterHospitalDateValue, exitHospitalDateValue] : []
  const params = {
    medicalRecordId: searchInfo.value.medicalRecordId,
    exitHospitalDateList: exitHospitalDates,
    healingTypeList: searchInfo.value.healingTypeList,
    visitNumber: searchInfo.value.visitNumber,
    patientName: searchInfo.value.patientName,
    reportFlag: 1,
    pageNum: currentPage.value,
    pageSize: limit.value,
    type: searchInfo.value.type,
    sortType: searchInfo.value.sortType,
    orderType: searchInfo.value.orderType
  }
  const res = await getMedicalRecordList(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}
const handleChangeSort = (column, prop, order) => {
  const transformParams = {
    descending: 1, // 降序
    ascending: 2, // 升序
    exitHospitalDate: '2', // 出院时间
    createTime: '1', // 录入时间
    reportTime: '3'
  }
  searchInfo.value.sortType = transformParams[column.order]
  searchInfo.value.orderType = transformParams[column.prop]
  getListData()
}
// 加载时请求页面列表
const init = async() => {
  getListData()
}

init()

// 重置
const resetParams = () => {
  myTable.value?.tableRef?.clearSort()
  searchInfo.value = {
    medicalRecordId: '',
    visitNumber: '',
    patientName: '',
    healingTypeList: [],
    createTime: []
  }
  getListData()
}

// 搜索
const onSubmit = () => {
  getListData()
}
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getListData()
}
// 更改每页条数
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getListData()
}
const lookFile = (item) => {
  curData.value = item
  isPreview.value = true
  isDetails.value = true
}
// 查看原始病历
const viewFile = (item, index) => {
  pdfUrl.value = item.fileUrl
  fileName.value = item.fileName
  if (pdfUrl.value) {
    isPdf.value = true
  }
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
    padding: 0 16px 0 0;
    background-color: var(--theme-card);
    :deep(.el-form) {
      display: flex;
      position: relative;
      flex: 1;
      width: 0;
      .el-form-item {
        width: 262px;
        margin-right: 32px;
        &:nth-child(5) {
          width: 340px !important;
          margin-right: 0;
          .el-form-item__content {
            width: 255px;
            .el-input__wrapper {
              width: 100% !important;
            }
          }
        }
        .el-form-item__content {
          .el-date-editor,
          .el-select__wrapper {
            height: 32px;
            // border: none;
            // background: inherit;
            // box-shadow: none;
          }
        }
      }
    }
    &.header1 {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 104px;
      padding: 0 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      font-size: 14px;
      .conditionTitle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 52px;
        .title {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
      }
      .searchTitle {
        display: flex;
        justify-content: space-between;
        width: 100%;
        .btnDiv {
          display: flex;
          .el-button {
            height: 32px;
            border-radius: 2px;
            &:nth-child(2) {
              margin-left: 16px;
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

  .list-section {
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    height: 0;
    margin-top: 16px;
    padding: 0 26px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: 56px;
      border-radius: 16px;
      .title {
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .flexCenter {
        display: flex;
        align-items: center;
        height: 32px;
        padding: 0 16px;
        border-radius: 2px;
        background-color: var(--el-color-primary);
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
        color: #fff;
        i {
          margin-right: 10px;
        }
      }
    }
    :deep(.singleTable) {
      display: flex;
      flex-direction: column;
      flex: 1;
      .el-table__body {
        tbody {
          tr {
            td {
              height: 53px;
              padding: 5px 0;
              img {
                display: block;
                width: 16px;
                height: 16px;
                // margin: 0 auto;
                margin-right: 10px;
              }
              .segmentationLine {
                color: #d8d8d8;
              }
              // &:last-child {
              //   .cell {
              //     display: flex;
              //     flex-wrap: wrap;
              //     align-items: center;
              //     // padding-right: 26px;
              //   }
              // }
              .el-button {
                font-weight: 400;
                &+.el-button {
                  margin-left: 7px;
                }
              }
              .blueBtn {
                color: var(--el-color-primary);
                &.is-disabled {
                  color: rgba(149, 149, 149, .55);
                }
                .iconfont {
                  font-size: 24px;
                  color: var(--theme-primary);
                  transform: scale(.7);
                }
              }
              .reIdentify {
                width: 32px;
                height: 32px;
                margin-left: 8px;
                border: 1px solid var(--theme-primary);
                background: rgba(54, 112, 248, 0.1);
              }
              .cell {
                // display: flex;
                .tag {
                  display: block;
                  width: 6px;
                  height: 6px;
                  margin: 0 8px 0 0;
                  border-radius: 100%;
                }
                .tag1 {
                  background: #04a273;
                }
                .tag2 {
                  background: var(--el-color-primary);
                }
                .tag3 {
                  background: red;
                }
                .tag4 {
                  background: #faad14;
                }
              }
              &.displayCell {
                .cell {
                  display: flex;
                  justify-content: center;
                }
              }
            }
            td:nth-child(1) {
              .cell {
                display: flex;
                align-items: center;
                padding-left: 26px;
                span {
                  display: block;
                  // max-width: 70px;
                }
                i {
                  width: 16px;
                  padding-right: 10px;
                }
              }
            }
          }
        }
      }
    }
    .tabel_pagination {
      display: flex;
      justify-content: center;
    }
  }
  :deep(.new_Dialog) {
    .el-dialog__body {
      padding: 14px 26px !important;
    }
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
        // height: 40px;
        padding-right: 0;
        font-size: 14px;
      }
      &:nth-child(1) {
        .el-form-item__label {
          line-height: 40px;
          font-size: 14px;
        }
        .el-form-item__content {
          height: 40px;
          line-height: 40px;
          .el-select {
            width: 100%;
            height: 100%;
            line-height: 100%;
            font-size: 14px;
          }
        }
      }
      &:nth-child(2) {
        margin-top: 26px;
        .el-form-item__content {
          display: flex;
          align-items: flex-start;
          height: 296px;
          .el-checkbox-group {
            .el-checkbox {
              width: 166px;
              margin-right: 0;
              .el-checkbox__label {
                padding-left: 13px;
              }
              .el-checkbox__inner {
                border-radius: 2px;
              }
              .el-checkbox__inner::after {
                border-width: 3px;
              }
              .el-checkbox__input.is-checked+.el-checkbox__label {
                color: inherit;
              }
            }
          }
        }
      }
    }
    .el-input {
      .el-input__wrapper {
        padding: 5px 14px;
        border-radius: 8px;
        background-color: var(--theme-fill);
        box-shadow: none;
        .el-input__inner {
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
  }
}
</style>
