<template>
  <div class="list-div">
    <div class="viewContent">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
          <el-form-item label="应用名称" class="form-query-select">
            <el-input type="text" v-model="searchInfo.appName" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
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
          <div>应用列表</div>
          <el-button type="primary" v-if="!needCheckPermission || hadPermissionList.includes('新增')" @click="newResearch"><i class="iconfont icon-tianjiayihang" style="padding-right: 7px;"></i>新增应用</el-button>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable emptyDefaultTable" :data="tableData">
            <el-table-column prop="appName" label="应用名称" min-width="120"></el-table-column>
            <el-table-column prop="appUrl" label="应用地址" min-width="120"></el-table-column>
            <el-table-column prop="enableStatus" label="状态" min-width="80">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.enableStatus"
                  inline-prompt
                  :active-value="1"
                  :inactive-value="2"
                  active-text="启动"
                  inactive-text="停止"
                  :disabled="(needCheckPermission && !hadPermissionList.includes('编辑'))"
                  @change="changeTableSwitch(scope.row.enableStatus,scope.row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column prop="appDesc" label="描述" min-width="120"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="120"></el-table-column>
            <el-table-column label="操作" fixed="right" min-width="60">
              <template #default="scope">
                <el-button link type="primary" :disabled="scope.row.enableStatus === 2" v-if="!needCheckPermission || hadPermissionList.includes('跳转')" @click="jumpTo(scope.row)">跳转</el-button>
                <el-button link type="primary" v-if="!needCheckPermission || hadPermissionList.includes('编辑')" @click="editRow(scope.row)">编辑</el-button>
                <el-button link type="danger" v-if="!needCheckPermission || hadPermissionList.includes('删除')" @click="deleteRow(scope.row)">删除</el-button>
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
      <el-form ref="ruleFormRef" :label-width="pxToRem(80)" label-position="left" :model="formData" class="new_DialogForm" :rules="rules">
        <el-form-item label="应用名称" prop="appName">
          <el-input text placeholder="请填写内容" show-word-limit maxlength="30" v-model="formData.appName" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="appName"></el-input>
        </el-form-item>
        <el-form-item label="应用地址" prop="appUrl">
          <el-input text placeholder="请填写内容" @blur="handleAppUrlBlur" show-word-limit maxlength="100" v-model="formData.appUrl" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="appUrl"></el-input>
        </el-form-item>
        <el-form-item label="应用描述" prop="appDesc">
          <el-input type="textarea" placeholder="请填写内容" show-word-limit maxlength="60" v-model="formData.appDesc" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="appDesc"></el-input>
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
  name: 'userManage'
}
</script>
<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import lodash from 'lodash'
import { getPagePermission } from '@/hooks/permissionHooks'
import { getApplicationList, addApplication, editApplication, delApplication, jumpApplication } from '@/api/api_home'

const { needCheckPermission, hadPermissionList } = getPagePermission('/manage/authenticationApplication')
const searchInfo = ref({
  enableStatus: '',
  appName: ''
})
const rules = reactive({
  appName: [
    { required: true, message: '请填写应用名称', trigger: 'blur' }
  ],
  appUrl: [
    { required: true, message: '请填写应用地址', trigger: 'blur' }
  ]
})
const addDialogShow = ref(false)
const rowVal = ref(null)
const isDisabled = ref(false)
const statusGroupOptions = ref([
  {
    id: 1,
    label: '启动'
  },
  {
    id: 2,
    label: '停止'
  }
])
const formData = ref({
  appName: '',
  appUrl: '',
  appDesc: ''
})

const tableData = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const editId = ref('')
const titleName = ref('新增应用')

// 请求数据
const getData = async() => {
  const params = {
    pageNum: currentPage.value,
    pageSize: limit.value,
    enableStatus: searchInfo.value.enableStatus,
    appName: searchInfo.value.appName
  }
  const res = await getApplicationList(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}

const handleAppUrlBlur = () => {
  if (formData.value.appUrl) {
    formData.value.appUrl = formData.value.appUrl.trim() // 去除首尾空格
  }
}

const jumpTo = async(row) => {
  let url = row.appUrl.trim() // 去除可能的多余空格
  // 检查并补充协议前缀
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url // 默认加上 http://
  }
  // 使用正则表达式验证 URL 的格式
  const urlRegex = /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6})|(\d{1,3}(\.\d{1,3}){3}))(:\d+)?(\/[^\s]*)?$/
  if (!urlRegex.test(url)) {
    ElMessage.error('请填写正确的 URL 地址')
    return
  }
  console.log(row)
  const params = {
    id: row.id
  }
  const res = await jumpApplication(params)
  console.log(res)
  if (res.code === 10000) {
    console.log(url)
    window.open(url)
  }
}

// 编辑应用
const editRow = async(row) => {
  isDisabled.value = false
  titleName.value = '编辑'
  if (typeof localStorage !== 'undefined' && localStorage.getItem('account') === row.account) {
    isDisabled.value = true
  }
  addDialogShow.value = true
  formData.value = lodash.cloneDeep(row)
  rowVal.value = row
  editId.value = lodash.cloneDeep(row.id)
}

// 删除用户
const deleteRow = async(row) => {
  ElMessageBox.confirm(
    `确认删除该应用？`,
    '删除应用',
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
      const res = await delApplication(params)
      if (res.code === 10000) {
        ElMessage.success('已删除')
        await getData()
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
    enableStatus: '',
    appName: ''
  }
  getData()
}

// 新增应用
const newResearch = async () => {
  isDisabled.value = false
  titleName.value = '新增应用'
  formData.value = {
    appName: '',
    appUrl: '',
    appDesc: ''
  }
  addDialogShow.value = true
}

// 关闭弹窗
const handleClose = async () => {
  addDialogShow.value = false
}

// 搜索
const onSubmit = () => {
  getData()
  return false
}

// 切换表格开关
const changeTableSwitch = async (val, row) => {
  const params = {
    id: row.id,
    enableStatus: val
  }
  const res = await editApplication(params)
  if (res.code === 10000) {
    if (val === 1) {
      ElMessage.success('启动成功')
    } else {
      ElMessage.success('已停止')
    }
  }
}

const ruleFormRef = ref()
//  新增应用
const submitForm = async(formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      if (titleName.value === '新增应用') {
        const params = {
          appName: formData.value.appName,
          appUrl: formData.value.appUrl,
          appDesc: formData.value.appDesc
        }
        const res = await addApplication(params)
        if (res.code === 10000) {
          ElMessage.success('新应用创建成功!')
          addDialogShow.value = false
          await getData()
        }
      } else {
        const params = {
          id: editId.value,
          appName: formData.value.appName,
          appUrl: formData.value.appUrl,
          appDesc: formData.value.appDesc
        }
        const res = await editApplication(params)
        if (res.code === 10000) {
          ElMessage.success('已保存')
          addDialogShow.value = false
          await getData()
        }
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
  .viewContent {
    padding: 0;
  }
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
    .el-dialog__body {
      display: flex;
      flex-direction: column;
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
        .el-textarea__inner {
          min-height: 94px !important;
        }
      }
    }
    .el-form-item:last-child {
      margin-bottom: 0;
      .el-form-item__content {
        height: auto !important;
        min-height: 94px !important;
      }
    }
  }
}
</style>
