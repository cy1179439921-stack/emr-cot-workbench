<template>
  <div class="list-div">
    <div class="viewContent" v-show="!showForm || (showForm && mode === 'edit')">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="searchContainer">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="项目ID" class="form-query-select">
              <el-input
                type="number"
                @input="handelInput('projectId')"
                maxlength="19"
                v-model="searchInfo.projectId"
                placeholder="请填写内容"
                clearable
                @keyup.enter="onSubmit"/>
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
            <el-form-item label="项目级别" class="form-query-select">
              <el-select v-model="searchInfo.projectLevel" clearable placeholder="请选择一项">
                <el-option
                  v-for="item in projectLevelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="项目来源" class="form-query-select" v-if="whether">
              <el-select v-model="searchInfo.projectSource" clearable placeholder="请选择一项">
                <el-option
                  v-for="item in projectSourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="项目负责人" class="form-query-select" v-if="whether">
              <el-input type="text" v-model="searchInfo.projectDirector" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
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
            <div>全景列表</div>
          </div>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable" :data="tableData">
            <el-table-column prop="id" fixed="left" label="项目ID" :min-width="echartsToPx(190)"></el-table-column>
            <el-table-column prop="projectName" fixed="left" label="项目名称" :min-width="echartsToPx(190)">
              <template #default="scope">
                <div>
                  {{ scope.row.projectName||"-" }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="projectCode" label="项目编号" :min-width="echartsToPx(120)"></el-table-column>
            <el-table-column prop="researchStartTime" label="研究期限" :min-width="echartsToPx(190)">
              <template #default="scope">
                {{ scope.row.researchStartTime+'~'+scope.row.researchEndTime }}
              </template>
            </el-table-column>
            <el-table-column prop="projectApprovalYear" label="立项年月" :min-width="echartsToPx(100)">
              <template #default="scope">
                {{ scope.row.projectApprovalYear+'-'+String(scope.row.projectApprovalMonth)?.padStart(2, '0') }}
              </template>
            </el-table-column>
            <el-table-column prop="totalMoney" label="总经费(万)" :min-width="echartsToPx(100)">
              <template #default="scope">
                {{ scope.row.totalMoney||0}}
              </template>
            </el-table-column>
            <el-table-column prop="projectTypeName" label="项目类别" :min-width="echartsToPx(100)"></el-table-column>
            <el-table-column prop="projectLevelName" label="项目级别" :min-width="echartsToPx(100)"></el-table-column>
            <!-- <el-table-column prop="projectSourceName" label="项目来源" min-width="120">
              <template #default="scope">
                {{ scope.row.projectSourceName||'-' }}
              </template>
            </el-table-column> -->
            <el-table-column prop="projectDirectorName" label="项目负责人" :min-width="echartsToPx(100)">
              <template #default="scope">
                {{ scope.row.projectDirectorName||'-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" :width="echartsToPx(80)">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  @click="handleRow('Look',scope.row)"
                  v-if="[1,2,3,4,5].includes(scope.row.auditStatus) && (!needCheckPermission || hadPermissionList.includes('查看'))">
                  查看
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
    <projectPanoramaForm :curEditRow="curEditRow" @handleBack="handleBack" v-if="showForm"/>
  </div>
</template>

<script>
export default {
  name: 'ProjectPanorama'
}
</script>
<script setup>
import { ref } from 'vue'
import { getProjectList } from '@/api/api_scientific'
import { getPagePermission } from '@/hooks/permissionHooks'
import projectPanoramaForm from '@/components/researchManagement/projectPanoramaForm.vue'
import { useRoute } from 'vue-router'
import { echartsToPx } from '@/utils/utils.js'
import {
  enum_project_type as projectCategoryOptions,
  enum_project_level as projectLevelOptions,
  enum_project_source as projectSourceOptions
} from '@/components/researchManagement/enum/enum_researchManagement.js'
const route = useRoute()
// eslint-disable-next-line no-unused-vars
const { needCheckPermission, hadPermissionList } = getPagePermission(route.path)
// 判断是否存在 '医院端查看' 的权限
const searchInfo = ref({})

const tableData = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const whether = ref(false) // 是否显示全部
// 获取用户列表
const getData = async() => {
  const params = {
    ...searchInfo.value,
    pageNum: currentPage.value,
    pageSize: limit.value,
    auditStatusList: [4]
  }
  const res = await getProjectList('project', params)
  if (res.code === 10000) {
    tableData.value = res.data?.items || []
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
const mode = ref('view')
const showForm = ref(false)
// 搜索
const onSubmit = () => {
  getData()
  return false
}
const curEditRow = ref(null)
const handleRow = (type, row) => {
  curEditRow.value = row
  curEditRow.value.projectId = row.id
  showForm.value = true
}
// 返回
const handleBack = () => {
  showForm.value = false
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
</style>
