<template>
  <div class="list-div">
    <div class="viewContent">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
          <el-form-item label="账号" class="form-query-select">
            <el-input type="text" v-model="searchInfo.account" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
          </el-form-item>
          <el-form-item label="姓名" class="form-query-select">
            <el-input type="text" v-model="searchInfo.userName" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
          </el-form-item>
          <el-form-item label="科室" class="form-query-select">
            <el-cascader
              v-model="searchInfo.agencyAndDepartmentIdList"
              :options="departmentOptions"
              :props="{multiple: true,label:'name',value:'id',children:'departmentList'}"
              collapse-tags
              collapse-tags-tooltip
              clearable
            />
          </el-form-item>
          <el-form-item label="科室负责人" class="form-query-select">
            <el-select v-model="searchInfo.departmentManagerList" multiple collapse-tags clearable placeholder="请选择一项">
              <el-option
                v-for="item in PersonChargeList"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="状态" class="form-query-select">
            <el-select v-model="searchInfo.enableStatus" clearable placeholder="请选择一项">
              <el-option
                v-for="item in statusGroupOptions"
                :key="item.id"
                :label="item.label"
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
          <div>用户列表</div>
          <el-button type="primary" @click="newResearch" v-if="!needCheckPermission || hadPermissionList.includes('新增用户')"><i class="iconfont icon-tianjiayihang" style="padding-right: 7px;"></i>新增用户</el-button>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable" :data="tableData">
            <el-table-column prop="account" label="账号" :min-width="echartsToPx(120)"></el-table-column>
            <el-table-column prop="userName" label="姓名" :min-width="echartsToPx(120)"></el-table-column>
            <el-table-column prop="phone" label="手机号" :min-width="echartsToPx(110)">
              <template #default="scope">
                <div>{{ scope.row.phone||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="userSourceDesc" label="用户类型" :min-width="echartsToPx(120)">
              <template #default="scope">
                <div>{{ scope.row.userSourceDesc||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="agencyName" label="医院" :min-width="echartsToPx(140)">
              <template #default="scope">
                <div>{{ scope.row.agencyName||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="agencyName" label="科室" :min-width="echartsToPx(100)">
              <template #default="scope">
                <div>{{ scope.row.departmentName||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="agencyName" label="科室负责人" :min-width="echartsToPx(60)">
              <template #default="scope">
                <div>{{ scope.row.departmentManager?'是':'否'||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="roleNames" label="角色" :min-width="echartsToPx(70)">
              <template #default="scope">
                <div>{{ scope.row.roleNames||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="enableStatus" label="状态" :min-width="echartsToPx(60)">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.enableStatus"
                  :disabled="(needCheckPermission && !hadPermissionList.includes('编辑用户')) || isDeleteDisabled(scope.row)"
                  inline-prompt
                  :active-value="1"
                  :inactive-value="2"
                  active-text="启用"
                  inactive-text="停用"
                  @change="changeTableSwitch(scope.row.enableStatus,scope.row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" :min-width="(hadPermissionList.includes('卒中导出配置')||!needCheckPermission) ? echartsToPx(180) : echartsToPx(120)">
              <template #default="scope">
                <el-button link type="primary" @click="editRow(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('编辑用户')">编辑</el-button>
                <el-button link type="primary" @click="resetRow(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('重置密码')">重置密码</el-button>
                <el-button link type="primary" @click="exportRow(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('卒中导出配置')">卒中导出配置</el-button>
                <el-button link type="danger" @click="deleteRow(scope.row)" :disabled="isDeleteDisabled(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('删除用户')">删除</el-button>
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
    <el-dialog :title="titleName" v-model="addDialogShow" v-if="addDialogShow" :class="{new_Dialog:true, newUserDialog:titleName === '新增用户'}" :width="pxToRem(640)" :before-close="handleClose">
      <div class="exportTip" v-if="titleName === '新增用户'">
        <p><img src="@/assets/icon-hint-normal.png"/>初始密码为Aa123456，用户登录后可修改</p>
      </div>
      <el-form ref="ruleFormRef" :label-width="pxToRem(110)" label-position="left" :model="formData" class="new_DialogForm" :rules="rules">
        <!-- <el-form-item label="账号：" prop="account" v-if="titleName === '编辑'">
          <el-input type="text" disabled v-model="formData.account"></el-input>
        </el-form-item> -->

        <el-form-item label="姓名：" prop="userName">
          <el-input text placeholder="请填写内容" show-word-limit maxlength="30" v-model="formData.userName" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="userName"></el-input>
        </el-form-item>
        <el-form-item label="账号ID：" prop="account">
          <el-input type="text" placeholder="请填写内容" show-word-limit maxlength="30" :disabled="!isEditAccount" v-model="formData.account"></el-input>
        </el-form-item>
        <el-form-item label="手机号：" prop="phone">
          <!-- validateMobileNumber -->
          <el-input type="text" placeholder="请填写内容" oninput="value=value.replace(/[^\d.]/g,'')" show-word-limit maxlength="11" v-model="formData.phone"></el-input>
        </el-form-item>
        <el-form-item label="医院：" prop="agencyId">
          <el-select
            v-model="formData.agencyId"
            filterable
            clearable
            placeholder="请选择一项"
            @keyup.enter="submitForm(ruleFormRef)"
            @submit.prevent
            ref="agencyId"
            @change="handleChange"
          >
            <el-option
              v-for="item in getAgencyData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科室：" prop="departmentId">
          <el-select v-model="formData.departmentId" filterable clearable placeholder="请选择一项" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent>
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科室负责人：" prop="departmentManager" class="8899kkk">
          <el-radio-group v-model="formData.departmentManager">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色：" prop="roleIds">
          <el-select v-model="formData.roleIds" :popper-append-to-body="false" filterable multiple :multiple-limit="30" collapse-tags clearable placeholder="请选择一项" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="roleIds">
            <el-option
              v-for="item in roleData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态：" prop="enableStatus">
          <el-switch
            v-model="formData.enableStatus"
            inline-prompt
            :active-value="1"
            :inactive-value="2"
            active-text="启用"
            inactive-text="停用"
            :disabled="isDisabled"
            @change="changeSwitch"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="导出时建档人信息" v-model="exportDialogShow" v-if="exportDialogShow" class="new_Dialog export_Dialog" :width="pxToRem(536)" :before-close="handleClose">
      <el-form ref="ruleFormExportRef" :model="exportDataValue" :label-width="pxToRem(177)" class="new_DialogForm">
        <el-form-item label="用户名" prop="centerUser">
          <template #label>
            用户名
            <el-tooltip
              class="box-item"
              popper-class="my-userTooltip"
              effect="dark"
              content="负责该档案内容的医护人员在脑血管病大数据平台上的注册用户名"
              placement="bottom"
            >
              <img src="@/assets/tooltipIcon.png" alt="">
            </el-tooltip>
          </template>
          <el-input text placeholder="请填写内容" show-word-limit maxlength="30" v-model="exportDataValue.centerUser" @keyup.enter="submitExportForm(ruleFormExportRef)" @submit.prevent ref="centerUser"></el-input>
        </el-form-item>
        <el-form-item label="本地建档用户的用户名" prop="localFileUserName">
          <template #label>
            本地建档用户的用户名
            <el-tooltip
              class="box-item"
              popper-class="my-userTooltip"
              effect="dark"
              content="本地录入用户，用户名"
              placement="bottom"
            >
              <img src="@/assets/tooltipIcon.png" alt="">
            </el-tooltip>
          </template>
          <el-input text placeholder="请填写内容" show-word-limit maxlength="30" v-model="exportDataValue.localFileUserName" @keyup.enter="submitExportForm(ruleFormExportRef)" @submit.prevent ref="localFileUserName"></el-input>
        </el-form-item>
        <el-form-item label="本地建档用户的姓名" prop="localFileUserFullName">
          <template #label>
            本地建档用户的姓名
            <el-tooltip
              class="box-item"
              popper-class="my-userTooltip"
              effect="dark"
              content="本地录入用户，姓名"
              placement="bottom"
            >
              <img src="@/assets/tooltipIcon.png" alt="">
            </el-tooltip>
          </template>
          <el-input text placeholder="请填写内容" show-word-limit maxlength="30" v-model="exportDataValue.localFileUserFullName" @keyup.enter="submitExportForm(ruleFormExportRef)" @submit.prevent ref="localFileUserFullName"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" :disabled="isSubmitDisabled" @click="submitExportForm(ruleFormExportRef)">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'userManage'
}
</script>
<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import lodash from 'lodash'
import { echartsToPx } from '@/utils/utils.js'
import { validateMobileNumber } from '@/utils/validate.js'
import { getUserListData, getAllAgencyByCity, addUserData, editUserData, delUserData, resetUserPassword, getRoleNames, exportConfig, getDartmentListByAgengcy, getAngencyAndDepartmentTreeList } from '@/api/api_home'
import { getPagePermission, getOtherPagePermission } from '@/hooks/permissionHooks'
import { SYSTEM_USER_ROWS, SYSTEM_ROLE_ROWS } from '@/mock/demoModules'
import { useUserStore } from '@/store/user'
const { needCheckPermission, hadPermissionList } = getPagePermission('/manage/userManage')
const { OtherPagePermissionList } = getOtherPagePermission(['/hospitalHomePage'])
const OtherPagePermissionListRef = ref(OtherPagePermissionList)
const filteredPermissions = OtherPagePermissionListRef.value.filter(item => item.permission.includes('医院端查看'))
const userStore = useUserStore()
// 判断是否存在 '医院端查看' 的权限
const hasHospitalPermission = filteredPermissions.length > 0
console.log(hasHospitalPermission) // 输出是否存在 '医院端查看' 的权限
const searchInfo = ref({
  account: '',
  enableStatus: '',
  userName: ''
})
const validateAccount = (_rule, value, callback) => {
  const v = (value ?? '').toString()
  if (!v) return callback()
  const accountReg =
    /^[A-Za-z0-9`~!@#$%^&*()_\-+=[\]{}\\|;:'",.<>/?]+$/
  if (!accountReg.test(v)) {
    return callback(new Error('账号ID仅支持大小写字母、数字、特殊符号组合（不含空格）'))
  }
  callback()
}
const rules = reactive({
  userName: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
  agencyId: [{ required: true, message: '请选择所属医院', trigger: 'change' }],
  departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  departmentManager: [{ required: true, message: '请选择是否是科室负责人', trigger: 'change' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
  account: [
    { required: true, message: '请填写账号ID', trigger: 'blur' },
    { validator: validateAccount, trigger: 'blur' }
  ],
  phone: [{ required: true, message: '请填写手机号', trigger: 'blur' },
    { validator: validateMobileNumber(true), trigger: 'blur' }
  ]
})
const addDialogShow = ref(false)
const rowVal = ref(null)
const isDisabled = ref(false)
const exportDialogShow = ref(false)
const isSubmitDisabled = ref(true)
const statusGroupOptions = ref([
  {
    id: 1,
    label: '启用'
  },
  {
    id: 2,
    label: '停用'
  }
])
const PersonChargeList = ref([
  {
    id: 1,
    label: '是'
  },
  {
    id: 0,
    label: '否'
  }
])
const departmentOptions = ref([])
const roleData = ref([])
const formData = ref({
  userName: '',
  agencyId: '',
  roleIds: [],
  enableStatus: 1
})
const exportDataValue = ref({
  centerUser: '',
  localFileUserName: '',
  localFileUserFullName: ''
})
const errorMsg = ref('')
const tableData = ref([])
const getAgencyData = ref([])
const departmentList = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const editId = ref('')
const titleName = ref('新增用户')
watch(
  () => [exportDataValue.value.centerUser, exportDataValue.value.localFileUserName, exportDataValue.value.localFileUserFullName],
  ([centerUser, localFileUserName, localFileUserFullName]) => {
    isSubmitDisabled.value = !centerUser && !localFileUserName && !localFileUserFullName
  }
)

const isDeleteDisabled = (row) => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('account') === row.account
  } else {
    console.error('localStorage is not available.')
    return true
  }
}
// 获取用户列表
const getData = async() => {
  const params = {
    pageNum: currentPage.value,
    pageSize: limit.value,
    account: searchInfo.value.account,
    enableStatus: searchInfo.value.enableStatus,
    userName: searchInfo.value.userName,
    departmentManagerList: searchInfo.value.departmentManagerList,
    agencyAndDepartmentIdList: searchInfo.value.agencyAndDepartmentIdList
  }
  const res = await getUserListData(params)
  if (res.code === 10000) {
    // mock 模式下接口无数据，使用演示用户兜底（覆盖启用/停用、不同角色）
    const items = res.data?.items
    tableData.value = items && items.length ? items : SYSTEM_USER_ROWS
    total.value = res.data?.total || SYSTEM_USER_ROWS.length
  }
}

// 获取角色列表
const getRoleData = async() => {
  const res = await getRoleNames()
  if (res.code === 10000) {
    roleData.value = res.data && res.data.length ? res.data : SYSTEM_ROLE_ROWS.map(item => item.name)
  }
}
const isEditAccount = ref(true)
// 编辑用户
const editRow = async(row) => {
  isDisabled.value = false
  getAgencyAllData()
  titleName.value = '编辑'
  if (typeof localStorage !== 'undefined' && localStorage.getItem('account') === row.account) {
    isDisabled.value = true
  }
  addDialogShow.value = true
  formData.value = lodash.cloneDeep(row)
  if (row.account === 'admin') {
    isEditAccount.value = false
  } else {
    isEditAccount.value = true
  }
  rowVal.value = row
  editId.value = lodash.cloneDeep(row.id)
  getDepartmentList()
}

// 重置密码
const resetRow = async(row) => {
  ElMessageBox.confirm(
    `确认重置账号<span style="font-weight: 500;">【${row.account}】</span>的密码吗？重置后将恢复为初始密码。`,
    '重置密码',
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
      const res = await resetUserPassword(params)
      if (res.code === 10000) {
        ElMessage.success('密码已重置为初始密码，请提醒本人尽快修改')
      } else {
        errorMsg.value = res.msg
      }
    })
}

// 删除用户
const deleteRow = async(row) => {
  ElMessageBox.confirm(
    `确认删除账号<span>【${row.account}】</span>用户吗？`,
    '删除用户',
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
      const res = await delUserData(params)
      if (res.code === 10000) {
        ElMessage.success('已删除')
        await getData()
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
// 卒中导出配置
const exportRow = async(row) => {
  exportDataValue.value = {
    centerUser: row.centerUser,
    localFileUserName: row.localFileUserName,
    localFileUserFullName: row.localFileUserFullName
  }
  exportDialogShow.value = true
  editId.value = row.id
}

// 获取医院列表
const getAgencyAllData = async() => {
  const res = await getAllAgencyByCity({})
  if (res.code === 10000) {
    getAgencyData.value = res.data
  }
}
const getDepartmentList = () => {
  departmentList.value = []
  if (!formData.value.agencyId) {
    return
  }
  getDartmentListByAgengcy({ id: formData.value.agencyId }).then(res => {
    if (res.code === 10000) {
      departmentList.value = res.data || []
    }
  })
}
const getAngencyAndDepartmentTreeListFn = () => {
  getAngencyAndDepartmentTreeList().then(res => {
    if (res.code === 10000) {
      departmentOptions.value = res.data || []
    }
  })
}
// 加载时请求页面列表
const init = async() => {
  getData()
  getRoleData()
  getAngencyAndDepartmentTreeListFn()
  getAgencyAllData()
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {
    account: '',
    enableStatus: '',
    userName: ''
  }
  currentPage.value = 1
  getData()
}

// 新增用户
const newResearch = async () => {
  isDisabled.value = false
  titleName.value = '新增用户'
  formData.value.userName = ''
  formData.value.account = ''
  formData.value.agencyId = ''
  formData.value.departmentId = ''
  formData.value.phone = ''
  formData.value.departmentManager = 0
  formData.value.roleIds = []
  formData.value.enableStatus = 1
  departmentList.value = []
  addDialogShow.value = true
}
const handleChange = () => {
  console.log('医院变更的时候获取科室列表')
  formData.value.departmentId = ''
  getDepartmentList()
}
// 关闭弹窗
const handleClose = async () => {
  exportDataValue.value = {
    centerUser: '',
    localFileUserName: '',
    localFileUserFullName: ''
  }
  addDialogShow.value = false
  exportDialogShow.value = false
}

// 搜索
const onSubmit = () => {
  getData()
  return false
}

// 切换开关
const changeSwitch = (val) => {
  formData.value.enableStatus = val
}

// 切换表格开关
const changeTableSwitch = async (val, row) => {
  const params = {
    id: row.id,
    userName: row.userName,
    agencyId: row.agencyId,
    roleIds: row.roleIds,
    roleNames: row.roleNames,
    enableStatus: val,
    // password: 'Aa123456',
    departmentId: row.departmentId,
    departmentManager: row.departmentManager,
    account: row.account
  }
  const res = await editUserData(params)
  if (res.code === 10000) {
    if (val === 1) {
      ElMessage.success('账号已启用')
    } else {
      ElMessage.success('账号已停用，该用户将无法登录')
    }
  } else {
    if (val === 1) {
      row.enableStatus = 2
    } else {
      row.enableStatus = 1
    }
    errorMsg.value = res.msg
  }
}

const ruleFormRef = ref()
//  新增用户
const submitForm = async(formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      if (titleName.value === '新增用户') {
        const params = {
          userName: formData.value.userName,
          agencyId: formData.value.agencyId,
          roleIds: formData.value.roleIds,
          enableStatus: formData.value.enableStatus,
          departmentId: formData.value.departmentId,
          departmentManager: formData.value.departmentManager,
          account: formData.value.account,
          phone: formData.value.phone
        }
        const res = await addUserData(params)
        if (res.code === 10000) {
          ElMessage.success('用户已创建，可将账号和初始密码发送给对方')
          addDialogShow.value = false
          await getData()
        } else {
          errorMsg.value = res.msg
        }
      } else {
        const params = {
          id: editId.value,
          userName: formData.value.userName,
          agencyId: formData.value.agencyId,
          roleIds: formData.value.roleIds,
          enableStatus: formData.value.enableStatus,
          departmentId: formData.value.departmentId,
          departmentManager: formData.value.departmentManager,
          account: formData.value.account,
          phone: formData.value.phone
        }
        const res = await editUserData(params)
        if (res.code === 10000) {
          ElMessage.success('已保存')
          addDialogShow.value = false
          if (isDisabled.value) {
            localStorage.setItem('account', formData.value.account)
          }

          await getData()
          // 修改自己信息
          if (localStorage.getItem('account') === rowVal.value.account) {
            userStore.setUsername(formData.value.userName)
          }
        } else {
          errorMsg.value = res.msg
        }
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
const ruleFormExportRef = ref()
const submitExportForm = async(formEl) => {
  console.log(exportDataValue.value)
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    console.log('1')
    if (valid) {
      console.log('2')
      const params = {
        userId: editId.value,
        centerUser: exportDataValue.value.centerUser,
        localFileUserName: exportDataValue.value.localFileUserName,
        localFileUserFullName: exportDataValue.value.localFileUserFullName
      }
      const res = await exportConfig(params)
      if (res.code === 10000) {
        ElMessage.success('配置成功!')
        exportDialogShow.value = false
        await getData()
      } else {
        errorMsg.value = res.msg
      }
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
    &.newUserDialog {
      .el-dialog__header {
        padding-bottom: 16px !important;
      }
    }
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
          margin-left: 0;
          margin-right: 0;
          padding-left: 6px;
          padding-right: 16px;
        }
      }
    }
  }
}
</style>
