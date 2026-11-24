<template>
  <div class="list-div">
    <div class="viewContent" v-show="!showForm">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="searchContainer">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="专利类型" class="form-query-select" >
              <commonMultipleSelect
                v-model="searchInfo.patentTypeList"
                :options="patentTypeOptions"
                placeholder="请选择一项"
              />
            </el-form-item>
            <el-form-item label="专利号" class="form-query-select">
              <el-input type="text" v-model="searchInfo.patentNo" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
            </el-form-item>
            <el-form-item label="专利名称" class="form-query-select">
              <el-input type="text" v-model="searchInfo.patentName" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
            </el-form-item>
            <el-form-item label="提交时间" class="timeSelectContainer">
              <el-date-picker
                v-model="searchInfo.submissionTimeList"
                type="datetimerange"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item label="审批状态" class="form-query-select lastElFormItem" v-if="whether">
              <commonMultipleSelect
                v-model="searchInfo.approvalStatusList"
                :options="statusGroupOptions"
                placeholder="请选择一项"
              />
              <!-- <el-select
                class="specialSelect"
                v-model="searchInfo.approvalStatusList"
                collapse-tags
                collapse-tags-tooltip
                multiple
                clearable
                placeholder="请选择一项">
                <el-option
                  v-for="item in statusGroupOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select> -->
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
            <div>专利列表</div>
          </div>
          <el-button type="primary" @click="handleNew" v-if="!needCheckPermission || hadPermissionList.includes('新增')">
            <i class="iconfont icon-tianjiayihang" style="padding-right: 7px;"></i>
            新增专利
          </el-button>
        </header>
        <div class="tableMain">
          <myTable
            ref="myTableRef"
            :border="true"
            class="myTable"
            :tableData="tableData"
            :column="currentColumns"
            :pagination="true"
            handlerName="操作"
            :handlerWidth="200"
            :pageResult="pageResult"
            @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange"
          >
            <template #auditStatus="scope">
              <div class="point" :style="{backgroundColor:statusGroupOptions[Number(scope.row?.auditStatus)-1]?.color}"></div>
              <div >{{ statusGroupOptions[Number(scope.row?.auditStatus)-1]?.label||'-' }}</div>
            </template>
            <template #option="scope">
              <div class="oprContainer">
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
              </div>
            </template>
          </myTable>
        </div>
      </div>
    </div>
    <patentForm :mode="mode" :curEditRow="curEditRow" :businessType="8" @handleBack="handleBack" v-if="showForm"/>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getPatentList, revokeProject, delPatent } from '@/api/api_scientific.js'
import { getPagePermission } from '@/hooks/permissionHooks'
import patentForm from '@/components/researchManagement/patentForm.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import { useRoute } from 'vue-router'
import {
  enum_status as statusGroupOptions,
  enum_patent_type as patentTypeOptions
} from '@/components/researchManagement/enum/enum_researchManagement.js'
import lodash from 'lodash'
const route = useRoute()
const { needCheckPermission, hadPermissionList } = getPagePermission(route.path)

const searchInfo = ref({})
const mode = ref('view')
const curEditRow = ref({})
const showForm = ref(false)
const whether = ref(false)
// 重置
const resetParams = () => {
  searchInfo.value = {}
  getData()
}
// 搜索
const onSubmit = () => {
  getData()
  return false
}
const getData = () => {
  getPatentList({
    pageNum: pageResult.value.pageNum,
    pageSize: pageResult.value.pageSize,
    ...searchInfo.value
  }).then(res => {
    if (res.code === 10000) {
      tableData.value = lodash.get(res, 'data.items', [])
      pageResult.value.total = res.data.total || 0
    }
  })
}
const handleNew = () => {
  curEditRow.value = {}
  mode.value = 'edit'
  showForm.value = true
}
const handleRow = (type, row) => {
  switch (type) {
    case 'Look':
      // 查看
      curEditRow.value = row
      mode.value = 'view'
      showForm.value = true
      break
    case 'Edit':
    case 'Resubmit':
      // 编辑
      mode.value = 'edit'
      curEditRow.value = row
      showForm.value = true
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
        delPatent({ id: row.id }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('已删除')
            pageResult.value.pageNum = 1
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
          businessType: 8
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
const tableData = ref([])
// 返回
const handleBack = () => {
  showForm.value = false
  // 刷新数据
  getData()
}
const currentColumns = ref([
  { label: '专利类型', value: 'patentType', formatter: (row) => { return row.patentType || '-' } },
  { label: '专利号', value: 'patentNo', formatter: (row) => { return row.patentNo || '-' } },
  { label: '专利名称', value: 'patentName', formatter: (row) => { return row.patentName || '-' } },
  { label: '发明人（第一）', value: 'inventor', formatter: (row) => { return row.inventor || '-' } },
  { label: '所在科室', value: 'departmentName', formatter: (row) => { return row.departmentName || '-' } },
  { label: '提交人', value: 'committerName', formatter: (row) => { return row.committerName || '-' } },
  { label: '提交时间', value: 'commitTime', formatter: (row) => { return row.commitTime || '-' } },
  { label: '审批状态', value: 'auditStatus', html: true }
])
const pageResult = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
const handleSizeChange = (val) => {
  getData()
}
const handleCurrentChange = (val) => {
  getData()
}

onMounted(() => {
  getData()
})
</script>
<style lang="scss" scoped>
@use "@/style/common/list.scss";
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
        color: #3670f8;
      }
      span {
        color: #3670f8;
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
.tableMain {
  flex: 1;
  width: 100%;
  height: 0;
}
.red {
  color: #ff4e4e;
}
.point {
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 50%;
}
</style>
