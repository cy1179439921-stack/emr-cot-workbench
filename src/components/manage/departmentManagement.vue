<template>
  <div class="list-div">
    <div class="viewContent">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
          <el-form-item label="科室名称" class="form-query-select">
            <el-input type="text" v-model.trim="searchInfo.departmentName" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
          </el-form-item>
          <el-form-item label="医院" class="form-query-select">
            <el-select v-model="searchInfo.agencyIdList" multiple collapse-tags collapse-tags-tooltip clearable placeholder="请选择一项">
              <el-option
                v-for="item in getAgencyData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <div class="btnDiv">
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </el-form>
      </header>
      <div class="list-section">
        <header class="table-header">
          <div>科室列表</div>
          <el-button type="primary" @click="newResearch" v-if="!needCheckPermission || hadPermissionList.includes('新增')"><i class="iconfont icon-tianjiayihang" style="padding-right: 7px;"></i>新增科室</el-button>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable" :data="tableData">
            <el-table-column prop="departmentName" label="科室名称" min-width="120"></el-table-column>
            <el-table-column prop="agencyName" label="医院" min-width="120">
              <template #default="scope">
                <div>{{ scope.row.agencyName||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="departmentUserNum" label="科室人数" min-width="120">
              <template #default="scope">
                <div>{{ scope.row.departmentUserNum||'0' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="120">
              <template #default="scope">
                <div>{{ scope.row.createTime||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" min-width="32">
              <template #default="scope">
                <el-button link type="primary" @click="editRow(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('编辑')">编辑</el-button>
                <el-button link type="danger" @click="deleteRow(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('删除')">删除</el-button>
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
    <el-dialog :title="titleName" v-model="addDialogShow" v-if="addDialogShow" class="new_Dialog" :width="pxToRem(508)" :before-close="handleClose">
      <el-form ref="ruleFormRef" :label-width="pxToRem(92)" label-position="left" :model="formData" class="new_DialogForm" :rules="rules">
        <el-form-item label="科室名称：" prop="departmentName">
          <el-input type="text" placeholder="请填写内容" v-model.trim="formData.departmentName" maxlength="30" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="医院：" prop="agencyId" >
          <el-select v-model="formData.agencyId" clearable placeholder="请选择一项" :disabled="isDisabled">
            <el-option
              v-for="item in getAgencyData"
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

<script>
export default {
  name: 'departmentManagement'
}
</script>
<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import lodash from 'lodash'
import { getDartmentList, createDartment, updateDartment, delDartment, getAllAgencyByCity } from '@/api/api_home'
import { getPagePermission, getOtherPagePermission } from '@/hooks/permissionHooks'
import { SYSTEM_DEPARTMENT_ROWS, SYSTEM_AGENCY_OPTIONS } from '@/mock/demoModules'
import { useRoute } from 'vue-router'
const route = useRoute()
const { needCheckPermission, hadPermissionList } = getPagePermission(route.path)
const { OtherPagePermissionList } = getOtherPagePermission(['/hospitalHomePage'])
const OtherPagePermissionListRef = ref(OtherPagePermissionList)
const filteredPermissions = OtherPagePermissionListRef.value.filter(item => item.permission.includes('医院端查看'))
// 判断是否存在 '医院端查看' 的权限
const hasHospitalPermission = filteredPermissions.length > 0
console.log(hasHospitalPermission) // 输出是否存在 '医院端查看' 的权限
const searchInfo = ref({
  agencyIdList: [],
  departmentName: ''
})
const rules = reactive({
  departmentName: [{ required: true, message: '请填写科室名称', trigger: 'blur' }],
  agencyId: [{ required: true, message: '请选择所属医院', trigger: 'change' }]
})
const addDialogShow = ref(false)
const rowVal = ref(null)
const isDisabled = ref(false)
const exportDialogShow = ref(false)
const formData = ref({
  departmentName: '',
  agencyId: []
})
const errorMsg = ref('')
const tableData = ref([])
const getAgencyData = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const editId = ref('')
const titleName = ref('新增科室')

// 获取用户列表
const getData = async() => {
  const params = {
    pageNum: currentPage.value,
    pageSize: limit.value,
    ...searchInfo.value
  }
  const res = await getDartmentList(params)
  if (res.code === 10000) {
    // mock 模式下接口无数据，使用演示科室兜底
    const items = res.data?.items
    tableData.value = items && items.length ? items : SYSTEM_DEPARTMENT_ROWS
    total.value = res.data?.total || SYSTEM_DEPARTMENT_ROWS.length
  }
}
// 编辑用户
const editRow = async(row) => {
  isDisabled.value = true
  titleName.value = '编辑科室'
  addDialogShow.value = true
  formData.value = lodash.cloneDeep(row)
  rowVal.value = row
  editId.value = lodash.cloneDeep(row.id)
}
// 删除科室
const deleteRow = async(row) => {
  ElMessageBox.confirm(
    `确认删除【${row.departmentName}】吗？删除后将无法找回，请谨慎操作。`,
    '删除',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const params = {
        id: row.id
      }
      const res = await delDartment(params)
      if (res.code === 10000) {
        ElMessage.success('已删除')
        resetParams()
      } else {
        errorMsg.value = res.msg
      }
    })
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
  searchInfo.value = {
    agencyIdList: [],
    departmentName: ''
  }
  currentPage.value = 1
  getData()
}

// 获取医院列表
const getAgencyAllData = async() => {
  const res = await getAllAgencyByCity({})
  if (res.code === 10000) {
    getAgencyData.value = res.data && res.data.length ? res.data : SYSTEM_AGENCY_OPTIONS
  }
}
getAgencyAllData()

// 新增用户
const newResearch = async () => {
  isDisabled.value = false
  titleName.value = '新增科室'
  formData.value = {
    departmentName: '',
    agencyId: ''
  }
  addDialogShow.value = true
}

// 关闭弹窗
const handleClose = async () => {
  addDialogShow.value = false
  exportDialogShow.value = false
}

// 搜索
const onSubmit = () => {
  getData()
  return false
}

const ruleFormRef = ref()
//  新增用户
const submitForm = async(formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      if (titleName.value === '新增科室') {
        createDartment(formData.value).then(res => {
          if (res.code === 10000) {
            resetParams()
            addDialogShow.value = false
            ElMessage.success('已新增')
          }
        })
      } else {
        updateDartment({
          agencyId: formData.value.agencyId,
          departmentName: formData.value.departmentName,
          id: formData.value.id
        }
        ).then(res => {
          if (res.code === 10000) {
            onSubmit()
            addDialogShow.value = false
            ElMessage.success('已保存')
          }
        })
      }
      // 已保存
    } else {
      console.log('error submit!', fields)
    }
  })
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
.delBtn {
  color: #ff4e4e;
}
</style>
