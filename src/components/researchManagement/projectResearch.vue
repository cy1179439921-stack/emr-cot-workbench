<template>
  <div class="list-div">
    <div class="viewContent" v-show="!showForm || (showForm && routerType === 2 && mode === 'edit')">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="searchContainer">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="项目ID" class="form-query-select">
              <el-input
                @input="handelInput('projectId')"
                maxlength="19"
                v-model="searchInfo.projectId"
                placeholder="请填写内容"
                clearable
                @keyup.enter="onSubmit"/>
            </el-form-item>
            <el-form-item :label="textList[routerType].labelText+'ID'" class="form-query-select">
              <el-input
                @input="handelInput('stageBusId')"
                maxlength="19"
                v-model="searchInfo.stageBusId"
                placeholder="请填写内容"
                clearable
                @keyup.enter="onSubmit"
              />
            </el-form-item>
            <el-form-item label="项目名称" class="form-query-select">
              <el-input type="text" v-model="searchInfo.projectName" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
            </el-form-item>
            <el-form-item label="项目编号" class="form-query-select">
              <el-input type="text" v-model="searchInfo.projectCode" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
            </el-form-item>
            <el-form-item label="项目类别" class="form-query-select">
              <el-select v-model="searchInfo.projectType" clearable placeholder="请选择一项">
                <el-option
                  v-for="item in projectCategoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="项目级别" class="form-query-select" v-if="whether">
              <el-select v-model="searchInfo.projectLevel" class="specialSelect" clearable placeholder="请选择一项">
                <el-option
                  v-for="item in projectLevelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="项目来源" class="form-query-select" v-if="whether">
              <el-select v-model="searchInfo.projectSource" class="specialSelect" clearable placeholder="请选择一项">
                <el-option
                  v-for="item in projectSourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="项目负责人" class="form-query-select " v-if="whether">
              <el-input type="text" v-model="searchInfo.projectDirector" class="specialSelect" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
            </el-form-item>

            <el-form-item label="提交时间" class="timeSelectContainer" v-if="whether">
              <el-date-picker
                v-model="searchInfo.commitTime"
                type="datetimerange"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item label="审批状态" class="form-query-select lastElFormItem" v-if="whether">
              <commonMultipleSelect
                v-model="searchInfo.auditStatusList"
                :options="statusGroupOptions"
                placeholder="请选择一项"
              />
            </el-form-item>
          </el-form>
          <div class="btnDiv">
            <div class="whether">
              <el-button class="blueBtn" link @click="whether = !whether">
                {{ whether ? '收起' : '展开' }}
                <i class="iconfont icon-xuanzekuang-xiala" :class="{rotate:whether}"></i>
              </el-button>
            </div>
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </div>
      </header>
      <div class="list-section">
        <header class="table-header">
          <div class="tableHeader">
            <div>{{ textList[routerType].listTiltle}}</div>
            <div class="noticeText">倒计时1-30天</div>
            <div class="noticeText timeOut">项目到期或项目超期</div>
          </div>

          <!-- v-if="!needCheckPermission || hadPermissionList.includes('新增用户') -->
          <el-button type="primary" @click="newResearch" v-if="!needCheckPermission || hadPermissionList.includes('新增')">
            <i class="iconfont icon-tianjiayihang" style="padding-right: 7px;"></i>
            {{textList[routerType].newBtnText}}
          </el-button>

        </header>
        <div class="tableMain">
          <commonTable class="singleTable" :data="tableData">
            <el-table-column v-if="routerType===0" prop="id" fixed="left" label="项目ID" :min-width="echartsToPx(190)"></el-table-column>
            <el-table-column prop="projectApprovalId" v-if="routerType===0" fixed="left" :label="textList[routerType].labelText+'ID'" :min-width="echartsToPx(180)"></el-table-column>
            <el-table-column v-if="routerType!==0" prop="projectId" fixed="left" label="项目ID" :min-width="echartsToPx(190)"></el-table-column>
            <el-table-column prop="id" fixed="left" v-if="routerType!==0" :label="textList[routerType].labelText+'ID'" :min-width="echartsToPx(180)"></el-table-column>
            <el-table-column prop="projectName" fixed="left" label="项目名称" :min-width="echartsToPx(120)">
              <template #default="scope">
                <div v-if="[1,3,5].includes(scope.row.auditStatus)">
                  {{ scope.row.projectName||"-" }}
                </div>
                <div v-else>
                  <div v-if="scope.row.timeLine===1">{{ scope.row.projectName }}</div>
                  <div v-if="scope.row.timeLine===2||scope.row.timeLine===6" class="countdown warning">{{ scope.row.projectName||"-" }}</div>
                  <div v-if="scope.row.timeLine===3" class="countdown danger">{{ scope.row.projectName||"-" }}</div>
                  <div v-if="scope.row.timeLine===4" class="countdown danger">{{ scope.row.projectName||"-" }}</div>
                  <div v-if="scope.row.timeLine===5" class="countdown">{{ scope.row.projectName||"-" }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="projectCode" label="项目编号" :min-width="echartsToPx(120)">
              <template #default="scope">
                {{ scope.row.projectCode||'-' }}
              </template>
            </el-table-column>
            <el-table-column prop="researchStartTime" label="研究期限" :min-width="echartsToPx(180)">
              <template #default="scope">
                {{ scope.row.researchStartTime&&scope.row.researchEndTime?scope.row.researchStartTime+'~'+scope.row.researchEndTime:"-" }}
              </template>
            </el-table-column>
            <el-table-column prop="projectApprovalYear" label="立项年月" :min-width="echartsToPx(90)">
              <template #default="scope">
                {{ (scope.row.projectApprovalYear&&scope.row.projectApprovalMonth)? (scope.row.projectApprovalYear+'-'+String(scope.row.projectApprovalMonth)?.padStart(2, '0')):'-' }}
              </template>

            </el-table-column>
            <el-table-column prop="totalMoney" label="总经费(万)" :min-width="echartsToPx(100)">
              <template #default="scope">
                {{ scope.row.totalMoney||0}}
              </template>
            </el-table-column>
            <el-table-column prop="projectTypeName" label="项目类别" :min-width="echartsToPx(100)">
              <template #default="scope">
                {{ scope.row.projectTypeName||'-'}}
              </template>
            </el-table-column>
            <el-table-column prop="projectLevelName" label="项目级别" :min-width="echartsToPx(100)">
              <template #default="scope">
                {{ scope.row.projectLevelName||'-'}}
              </template>
            </el-table-column>
            <el-table-column prop="projectSourceName" label="项目来源" :min-width="echartsToPx(160)">
              <template #default="scope">
                {{ scope.row.projectSourceName||'-' }}
              </template>
            </el-table-column>
            <el-table-column prop="projectDirectorName" label="项目负责人" :min-width="echartsToPx(100)">
              <template #default="scope">
                {{ scope.row.projectDirectorName||'-' }}
              </template>
            </el-table-column>
            <el-table-column prop="projectCommitterName" label="提交人" :min-width="echartsToPx(80)">
              <template #default="scope">
                {{ scope.row.projectCommitterName||scope.row.committerName||'-' }}
              </template>
            </el-table-column>
            <el-table-column prop="commitTime" label="提交时间" :min-width="echartsToPx(180)">
              <template #default="scope">
                {{ scope.row.commitTime||'-' }}
              </template>
            </el-table-column>
            <el-table-column prop="projectCountdown" label="项目倒计时(天)" :min-width="echartsToPx(120)" fixed="right">
              <template #default="scope">
                <div v-if="[1,3,5].includes(scope.row.auditStatus)">
                  -
                </div>
                <div v-else>
                  <div v-if="scope.row.timeLine===1" >{{ scope.row.diffDays }}</div>
                  <div v-if="scope.row.timeLine===2" class="countdown warning">{{ scope.row.diffDays }}</div>

                  <div v-if="scope.row.timeLine===3" class="countdown danger">{{ scope.row.diffDays?`超时${scope.row.diffDays}天`:'项目到期' }}</div>
                  <div v-if="scope.row.timeLine===4" class="countdown danger">{{ scope.row.diffDays?`超时${scope.row.diffDays}天(已结题)`:'正常结题' }}</div>
                  <div v-if="scope.row.timeLine===5" class="countdown ">{{ `${scope.row.diffDays}(已结题)` }}</div>
                  <div v-if="scope.row.timeLine===6" class="countdown warning">{{ `${scope.row.diffDays}(已结题)` }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="auditStatus" label="审批状态" :min-width="echartsToPx(90)" fixed="right">
              <template #default="scope">
                <div class="point" :style="{backgroundColor:statusGroupOptions[Number(scope.row?.auditStatus)-1]?.color}"></div>
                <div >{{ statusGroupOptions[Number(scope.row?.auditStatus)-1]?.label||'-' }}</div>
              </template>
            </el-table-column>

            <el-table-column label="操作" fixed="right" :width="echartsToPx(200)">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  @click="handleRow('Look',scope.row)"
                  v-if="[1,2,3,4,5].includes(scope.row.auditStatus) && (!needCheckPermission || hadPermissionList.includes('查看'))">
                  查看
                </el-button>
                <el-button
                  link
                  type="primary"
                  @click="handleRow('Edit',scope.row)"
                  v-if="[1].includes(scope.row.auditStatus) && (!needCheckPermission || hadPermissionList.includes('编辑'))">
                  修改
                </el-button>
                <el-button
                  link
                  class="red"
                  type="primary"
                  @click="handleRow('Revoke',scope.row)"
                  v-if="[2].includes(scope.row.auditStatus) && (!needCheckPermission || hadPermissionList.includes('编辑'))">
                  撤销
                </el-button>
                <el-button
                  link
                  type="primary"
                  @click="handleRow('Resubmit',scope.row)"
                  v-if="[3,5].includes(scope.row.auditStatus) && (!needCheckPermission || hadPermissionList.includes('编辑'))">
                  重新提交
                </el-button>
                <el-button
                  link
                  class="red"
                  type="primary"
                  @click="handleRow('Delete',scope.row)"
                  v-if="[1,3,5].includes(scope.row.auditStatus) && (!needCheckPermission || hadPermissionList.includes('删除'))">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </commonTable>
          <div class="tabel_pagination">
            <el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
              <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <projectInitiationForm :mode="mode" :curEditRow="curEditRow" :businessType="1" @handleBack="handleBack" v-if="routerType === 0 && showForm"/>
    <projectResearchForm :mode="mode" :curEditRow="curEditRow" :businessType="2" @handleBack="handleBack" v-if="routerType === 1 && showForm"/>
    <projectChangeForm :mode="mode" :curEditRow="curEditRow" :businessType="3" @handleBack="handleBack" v-if="routerType === 2 && showForm && mode === 'view'"/>
    <newProjectChangeDialog class="newDialog" :mode="mode" :curEditRow="curEditRow" v-model:addDialogShow="showForm" @handleBack="handleBack" @handle-submit="onSubmit" v-if="routerType === 2 && showForm && mode === 'edit'"/>
    <projectMidCheckForm :mode="mode" :curEditRow="curEditRow" :businessType="4" @handleBack="handleBack" v-if="routerType === 3 && showForm"/>
    <projectConclusionForm :mode="mode" :curEditRow="curEditRow" :businessType="5" @handleBack="handleBack" v-if="routerType === 4 && showForm"/>
    <projectPanoramaForm :mode="mode" @handleBack="handleBack" v-if="routerType === 5 && showForm"/>
  </div>
</template>

<script>
export default {
  name: 'ProjectResearch'
}
</script>
<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProjectList, deleteProject, revokeProject } from '@/api/api_scientific'
import { getPagePermission } from '@/hooks/permissionHooks'
import { useRoute } from 'vue-router'
// eslint-disable-next-line no-unused-vars
import { echartsToPx, formatDate } from '@/utils/utils.js'
import {
  enum_status as statusGroupOptions,
  enum_project_type as projectCategoryOptions,
  enum_project_level as projectLevelOptions,
  enum_project_source as projectSourceOptions
} from '@/components/researchManagement/enum/enum_researchManagement.js'
import newProjectChangeDialog from '@/components/researchManagement/newProjectChangeDialog.vue'
import projectInitiationForm from '@/components/researchManagement/projectInitiationForm.vue'
import projectChangeForm from '@/components/researchManagement/projectChangeForm.vue'
import projectResearchForm from '@/components/researchManagement/projectResearchForm.vue'
import projectMidCheckForm from '@/components/researchManagement/projectMidCheckForm.vue'
import projectConclusionForm from '@/components/researchManagement/projectConclusionForm.vue'
import projectPanoramaForm from '@/components/researchManagement/projectPanoramaForm.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
// 立项, 研究,变更, 中检,结题   接口路径
const InterfaceList = ['project', 'projectResearch', 'projectChange', 'projectCheck', 'projectConclusion']
const route = useRoute()
const routerType = ref()
const textList = [
  {
    newBtnText: '新增项目',
    listTiltle: '项目列表',
    labelText: '立项'
  },
  {
    newBtnText: '新增研究',
    listTiltle: '研究列表',
    labelText: '研究'
  },
  {
    newBtnText: '新增变更',
    listTiltle: '变更列表',
    labelText: '变更'
  },
  {
    newBtnText: '新增中检',
    listTiltle: '中检列表',
    labelText: '中检'
  },
  {
    newBtnText: '新增结题',
    listTiltle: '结题列表',
    labelText: '结题'
  }
]
switch (route.path) {
  case '/researchManagement/projectInitiation':
    console.log('项目立项')
    routerType.value = 0
    break
  case '/researchManagement/projectResearch':
    console.log('项目研究')
    routerType.value = 1
    break
  case '/researchManagement/projectChange':
    console.log('项目变更')
    routerType.value = 2
    break
  case '/researchManagement/projectInspection':
    console.log('项目中检')
    routerType.value = 3
    break
  case '/researchManagement/projectConclusion':
    console.log('项目结题')
    routerType.value = 4
    break
  default:''
    break
}
// eslint-disable-next-line no-unused-vars
const { needCheckPermission, hadPermissionList } = getPagePermission(route.path)
console.log('hadPermissionList', hadPermissionList)
// 判断是否存在 '医院端查看' 的权限
const searchInfo = ref({
  stageBusId: '',
  projectId: ''
})

const tableData = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const whether = ref(false) // 是否显示全部
const timeComparison = (time, conclusionTime) => {
  // const currentData = formatDate(new Date())
  // const date1 = new Date(currentData + ' 23:59:59')
  const date1 = new Date()
  const date2 = new Date(time + ' 23:59:59')// 项目结束时间
  let diffTime = ''
  let diffDays = ''
  let timeLine = 5 // 默认正常结题
  if (conclusionTime) {
    // '已结题'
    const date3 = new Date(conclusionTime + ' 23:59:59')// 结题时间
    diffTime = Math.abs(date3.getTime() - date2.getTime())
    diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    if (date2.getTime() <= date3.getTime()) {
      // 超期结题
      timeLine = 4
      diffDays = diffDays - 1
    } else {
      // 正常结题
      if (diffDays > 30) {
        timeLine = 5
      } else {
        timeLine = 6
      }
    }
  } else {
    // 未结题
    diffTime = Math.abs(date2.getTime() - date1.getTime())
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // timeLine: 1, // 1、正常进行中  2、30天内的  3、超期未结题 4、超期已结题,5正常结题
    if (date1.getTime() <= date2.getTime()) {
      if (diffDays > 30) {
        // 正常进行中并且时间大于30天的
        timeLine = 1
      } else if (diffDays === 1) {
        timeLine = 3
        diffDays = 0
      } else {
        // 正常进行中,并且时间小于30天的
        timeLine = 2
      }
    } else if (date1.getTime() > date2.getTime()) {
      // 超期未结题的
      timeLine = 3
    }
  }

  return {
    timeLine,
    diffDays
  }
}
// 获取用户列表
const getData = async() => {
  const params = {
    ...searchInfo.value,
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  const res = await getProjectList(InterfaceList[routerType.value], params)
  if (res.code === 10000) {
    tableData.value = []
    const arr = res.data?.items || []
    arr.forEach(item => {
      tableData.value.push({
        ...item,
        ...timeComparison(item.researchEndTime, item.conclusionTime)
      })
    })
    total.value = res.data.total
  }
}

// 分页
const handleCurrentChange = (val) => {
  currentPage.value = val
  getData()
}
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getData()
}
// 加载时请求页面列表
const init = async() => {
  getData()
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {}
  getData()
}

// 新增项目
const newResearch = () => {
  console.log('新增', routerType.value)
  curEditRow.value = {}
  mode.value = 'edit'
  showForm.value = true
}
// 返回
const handleBack = () => {
  console.log('返回', routerType.value)
  showForm.value = false
  // 刷新数据
  getData()
}
const curEditRow = ref({})
const mode = ref('view')
const showForm = ref(false)
// 搜索
const onSubmit = () => {
  getData()
  return false
}

const handleRow = (type, row) => {
  switch (type) {
    case 'Look':
      // 查看
      curEditRow.value = row
      if (routerType.value === 0) {
        curEditRow.value.projectId = row.id
      }
      mode.value = 'view'
      showForm.value = true
      break
    case 'Edit':
    case 'Resubmit':
      // 编辑
      mode.value = 'edit'
      curEditRow.value = row
      if (routerType.value === 0) {
        curEditRow.value.projectId = row.id
      }
      showForm.value = true
      // switch (routerType.value) {
      //   case 0:
      //     // 修改项目立项
      //     showForm.value = true
      //     break
      //   case 1:
      //     // 修改项目研究
      //     break
      //   case 2:
      //     // 修改项目变更
      //     // newProjectChange()
      //     break
      //   case 3:
      //     // 修改项目中检
      //     break
      //   case 4:
      //     // 修改项目结题
      //     break
      //   default:
      //     break
      // }
      break
    case 'Delete':
      // 删除
      ElMessageBox.confirm(
        `删除后将无法恢复,确认删除当前项目?`,
        '删除',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      ).then(() => {
        deleteProject(InterfaceList[routerType.value], { id: row.id }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('已删除')
            currentPage.value = 1
            getData()
          }
        })
      })
      break
    case 'Revoke':
      ElMessageBox.confirm(
        `撤销将影响当前审批下所有节点审批,确认撤销?`,
        '撤销',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      ).then(() => {
        revokeProject({
          businessId: row.id,
          businessType: routerType.value + 1
        }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('撤销成功')
            getData()
          }
        })
      })
      break
    default:
      break
  }
}
const handelInput = (key) => {
  searchInfo.value[key] = searchInfo.value[key].replace(/[^\d]/g, '')
}
</script>

<style scoped lang="scss">
@use "@/style/common/list.scss";
.list-div {
  .tableMain {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 0;
    :deep(.singleTable) {
      flex: 1;
    }
  }
  :deep(.new_Dialog) {
    .exportTip {
      box-sizing: border-box;
      width: 100%;
      height: 40px;
      margin-bottom: 16px;
      border: 1px solid rgba(54, 112, 248, 0.5);
      border-radius: 2px;
      background: rgba(54, 112, 248, 0.05);
      p {
        display: flex;
        align-items: center;
        height: 100%;
        margin: 0;
        padding-left: 16px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text);
        img {
          width: 19px;
          height: 19px;
          margin-right: 7px;
        }
      }
    }
    .el-dialog__body {
      display: flex;
      flex-direction: column;
      // justify-content: center;
      // align-items: center;
      .el-form {
        width: 100%;
      }
    }
    .el-form-item {
      margin-bottom: 16px;
      .el-form-item__label {
        display: flex;
        position: relative;
        align-items: center;
        color: var(--theme-text);
        img {
          width: 14px;
          height: 14px;
          margin: 0 6px 0 6px;
        }
      }
      .el-form-item__content {
        .el-input {
          height: 100%;
          .el-input__wrapper {
            height: 100%;
          }
        }
        .el-select {
          height: 100%;
          .el-select__wrapper {
            height: 100%;
          }
        }
      }
    }
    .el-form-item:last-child {
      margin-bottom: 0;
    }
  }
  :deep(.export_Dialog) {
    .el-form-item {
      .el-form-item__label {
        width: auto;
        padding-right: 0;
        img {
          margin-left: 6px;
          margin-right: 16px;
        }
      }
    }
  }
}
.list-div .list-header.header-query {
  height: auto;
  min-height: 127px;
}
.searchContainer {
  display: flex;
  width: 100%;
  .btnDiv {
    display: flex;
    margin-top: 24px;
    :deep(.whether) {
      display: flex;
      align-items: center;
      height: 32px;
      margin-right: 16px;
      .icon-xuanzekuang-xiala {
        font-size: 7px;
        color: var(--theme-primary);
      }
      span {
        color: var(--theme-primary);
      }
      i {
        margin-left: 5px;
      }
      .rotate {
        transform: rotate(180deg);
        transition: transform 0.3s;
      }
    }
  }
}
.commonSearch {
  flex-wrap: wrap;
  flex: 1;
}
:deep(.timeSelect) {
  width: 255px !important;
}
.timeSelectContainer {
  width: 310px !important;
}
:deep(.el-form) {
  .el-form-item {
    &.lastElFormItem {
      margin-right: 0 !important;
    }
    .el-form-item__label {
      padding-right: 10px !important;
    }
  }
}
.red {
  color: #ff4e4e;
}
.list-div .list-section .table-header {
  .tableHeader {
    display: flex;
    align-items: center;
    flex: 1;
    .noticeText {
      display: flex;
      justify-content: center;
      align-items: center;
      width: auto;
      height: 25px;
      margin-left: 16px;
      padding: 0 10px;
      border-radius: 2px;
      background: rgba(245, 159, 12, 0.1);
      font-weight: 400;
      font-size: 14px;
      color: #ff8c00;
      &.timeOut {
        margin-left: 12px;
        background: rgba(255, 78, 78, 0.1);
        color: #ff4e4e;
      }
    }
  }
}
.point {
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 50%;
}
.countdown {
  &.warning {
    color: #f59f0c;
  }
  &.danger {
    color: #ff4e4e;
  }
}
// .list-div .list-header .el-form .el-form-item {
//   margin-right: 26px;
// }
.commonSearch .el-form-item .el-select.specialSelect,
.commonSearch .el-form-item .el-input.specialSelect {
  width: 194px !important;
}

</style>
