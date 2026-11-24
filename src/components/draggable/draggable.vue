<template>
  <div id="layout-container">
    <div class="page-left">
      <header>
        <span>表单</span>
        <span @click="newForm" v-if="!userStore.needCheckPermission || hadPermissionList.includes('新增表单')"><i class="iconfont icon-xinzeng"></i>新增表单</span>
      </header>
      <el-input
        :prefix-icon="Search"
        v-model="filterText"
        placeholder="搜索名称"
        class="search"
        clearable
      />
      <el-scrollbar>
        <el-tree
          :data="formList"
          :props="defaultProps"
          default-expand-all
          :highlight-current="true"
          node-key="index"
          ref="treeRef"
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          :default-checked-keys="[formList[0]?.id]">
          <template #default="{ data }">
            <div class="txt" :title="data.name"><i class="iconfont icon-jigou" v-if="data.list"></i>{{ data.name }}</div>
          </template>
        </el-tree>
      </el-scrollbar>

    </div>
    <div class="page-right" v-if="selectedForm.id">
      <div class="page-right-top">
        <div class="formName" v-if="!editFormName">
          <span>{{selectedForm.name}}</span>
          <i class="iconfont icon-bianji" @click="toEditResearchName" v-if="selectedForm.name && (!userStore.needCheckPermission || hadPermissionList.includes('编辑表单'))"></i>
        </div>
        <div class="formName" v-else>
          <el-input text placeholder="请填写内容" maxlength="50" show-word-limit v-model="newFormName" @keyup.enter="saveEdit" @submit.prevent></el-input>
          <el-button @click="cancelEdit">取 消</el-button>
          <el-button type="primary" @click="saveEdit">保 存</el-button>
        </div>
        <div class="btnDiv">
          <template v-if="!isEdit">
            <el-button @click="handleEdit" :disabled="editFormName" v-if="!userStore.needCheckPermission || hadPermissionList.includes('编辑表单')">编 辑</el-button>
            <el-button @click="handleDelete" :disabled="editFormName" v-if="!userStore.needCheckPermission || hadPermissionList.includes('删除表单')">删 除</el-button>
          </template>
          <template v-else>
            <el-button @click="cancelEditForm">取 消</el-button>
            <el-button class="save" @click="save">保 存</el-button>
          </template>
        </div>
      </div>
      <div class="page-right-bottom" >
        <div id="mater-center">
          <MaterialContent :data="dataSource" @activeDargComponent="activeDargComponent" @delRelation="delRelation" :componentsObj="componentsObj" v-if="isEdit"/>
          <template v-else>
            <materRender :data="dataSource" :isEdit="true" :isDisable="true" :preview="true" :componentsObj="componentsObj" v-if="isEdit"/>
            <materRender :data="dataSource" :isEdit="true" :isDisable="true" :preview="true" :componentsObj="componentsObj" v-else/>
          </template>
        </div>
        <div id="mater-right" v-if="isEdit">
          <div class="topNav">
            <ul>
              <li v-for="item in tabs" :key="item.value" class="flexCenter" :class="{ active: activeTab === item.value }" @click="handleClickTab(item.value)">
                <div>{{ item.label }}</div>
                <div class="bottomLine"></div>
              </li>
            </ul>
          </div>
          <MaterialArea v-show="activeTab === 0"/>
          <MaterialEdit :activeComponent="activeComponent" v-show="[1,2].includes(activeTab)" :activeTab="activeTab" :dataSource="dataSource"/>
        </div>
      </div>
    </div>
    <div class="page-right empty" v-else>
      <el-empty :image="emptyImg" description="点击左侧表单列表查看表单内容"/>
    </div>
    <el-dialog title="新增表单" v-model="addDialogShow" class="new_Dialog" :width="pxToRem(500)" :before-close="handleClose">
      <el-form ref="ruleFormRef" :label-width="pxToRem(84)" label-position="left" :model="formData" class="new_DialogForm">
        <el-form-item label="所属医院：" prop="hospital">
          <el-select class="noSelectFocusBorder" v-model="formData.agencyId" clearable placeholder="请选择一项">
            <el-option
              v-for="item in hospitalGroupOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="表单名称：" prop="formName">
          <el-input text placeholder="请填写内容" maxlength="50" show-word-limit v-model="formData.formName" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="formName"></el-input>
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
  name: 'Draggable'
}
</script>
<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import MaterialArea from '@/components/draggable/layoutContainer/materialArea.vue'
import MaterialContent from '@/components/draggable/layoutContainer/materialContent.vue'
import materRender from '@/components/draggable/layoutContainer/materRender.vue'
import MaterialEdit from '@/components/draggable/layoutContainer/materialEdit.vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllAgencyWithRole } from '@/api/api_homePage'
import { addForm, getFormPage, deleteForm, updateForm } from '@/api/api_form'
import emptyImg from '@/assets/emptyFormList.png'
import _ from 'lodash'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/manage/form') {
    hadPermissionList.value.push(item.name)
  }
})
const tabs = ref([
  { label: '组件', value: 0 },
  { label: '属性', value: 1 },
  { label: '样式', value: 2 }
])

const defaultProps = {
  children: 'list',
  label: 'name'
}

const filterNode = (value, data) => {
  if (!value) return true
  return data.name?.includes(value)
}
// 所有数据集合
const dataSource = reactive({
  title: '表单标题',
  data: [],
  style: {},
  childrenRelation: []
})
const formList = ref([]) // 表单列表
const initFormList = ref([]) // 初始表单列表
const curEditRow = ref('') // 当前编辑行
const formData = reactive({ // 新增表单数据
  agencyId: '',
  formName: ''
})
const addDialogShow = ref(false) // 新增表单弹窗
const errorMsg = ref('') // 错误提示
const hospitalGroupOptions = ref([]) // 医院
const selectedForm = ref({ // 当前选中表单
  id: null,
  name: null,
  agencyId: null,
  format: null
})
const cleepData = ref({ // 克隆数据
  id: null,
  name: null,
  agencyId: null,
  format: null,
  childrenRelation: []
})
const editFormName = ref(false) // 编辑表单名称
// 选中态
const activeComponent = ref(null)
const activeDargComponent = (el) => { // 选中组件
  activeComponent.value = el
}

const activeTab = ref(0) // 当前激活tab
const filterText = ref('') // 搜索
watch(filterText, (val) => {
  if (val) {
    const arr = []
    initFormList.value.forEach(item => {
      if (item.name.includes(val)) {
        arr.push(item)
      } else if (item.list) {
        item.list.forEach(v => {
          if (v.name.includes(val)) {
            const index = _.findIndex(arr, { id: item.id })
            if (index === -1) {
              arr.push(item)
            }
          }
        })
      }
    })
    formList.value = arr
  } else {
    formList.value = JSON.parse(JSON.stringify(initFormList.value))
  }
})
const isEdit = ref(false) //   是否编辑

const handleClickTab = (index) => { // 切换tab
  activeTab.value = index
}
const agencyIdList = ref([]) // 医院id列表
// 获取医院数据
const getHospitalData = async() => {
  const res = await getAllAgencyWithRole({})
  if (res.code === 10000) {
    hospitalGroupOptions.value = res.data
    formList.value = [...res.data]
    formList.value.forEach(item => {
      item.list = []
    })
    initFormList.value = JSON.parse(JSON.stringify(formList.value))
    agencyIdList.value = []
    res.data.forEach(item => {
      agencyIdList.value.push(item.id)
    })
  }
}
// 获取列表数据
const getListData = async() => {
  const params = {
    agencyIdList: agencyIdList.value
  }
  const res = await getFormPage(params)
  if (res.code === 10000) {
    formList.value.forEach(item => {
      item.list = []
    })
    res.data.forEach(item => {
      const hosObj = formList.value.find(hos => hos.id === item.agencyId)
      if (hosObj) {
        hosObj.list.push({
          id: item.id,
          name: item.name,
          agencyId: item.agencyId,
          format: item.format
        })
      }
    })
    initFormList.value = JSON.parse(JSON.stringify(formList.value))
  }
}
// 加载时请求页面列表
const init = async() => {
  await getHospitalData()
  getListData()
}

onMounted(() => {
  init()
})

const handleNodeClick = async (data) => { // 保存
  if (data.children) {
    return
  }
  // 查看表单名是否正在编辑
  if (editFormName.value) {
    cancelEdit()
  }
  if (isEdit.value) {
    ElMessageBox.confirm(`还有改动没保存，退出后无法找回，确认退出吗？`, '操作未保存', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }).then(() => {
      handler(data)
    })
  } else {
    handler(data)
  }
}

const handler = (item) => { // 处理数据
  isEdit.value = false
  const parentObj = formList.value.find(hospital => hospital.id === item.agencyId)
  if (parentObj) {
    const data = parentObj.list.find(child => child.id === item.id)
    if (data.format) {
      const json = JSON.parse(data.format)
      dataSource.data = json.data
      dataSource.title = json.title
      dataSource.style = json.style
      dataSource.childrenRelation = json?.childrenRelation || []
    } else {
      dataSource.title = '表单名称'
      dataSource.style = {}
      dataSource.data = []
      dataSource.childrenRelation = []
    }
    cleepData.value = _.cloneDeep(dataSource)
    selectedForm.value = data
  }
}

// 新增
const newForm = () => {
  curEditRow.value = ''
  formData.agencyId = ''
  formData.formName = ''
  addDialogShow.value = true
}
//  新增提交
const submitForm = async(formEl) => {
  if (!formData.agencyId) {
    ElMessage.warning('请选择所属医院')
    return false
  } else if (!formData.formName) {
    ElMessage.warning('请填写表单名称')
    return false
  }
  const params = {
    agencyId: formData.agencyId,
    name: formData.formName
  }
  const res = await addForm(params)
  if (res.code === 10000) {
    ElMessage.success('已新增')
    handleClose()
    getListData()
  } else {
    errorMsg.value = res.msg
  }
}
const newFormName = ref('')
// 编辑研究队列名称
const toEditResearchName = () => {
  if (!isEdit.value) {
    newFormName.value = selectedForm.value.name
    editFormName.value = true
  } else {
    ElMessage.warning('表单编辑中，禁止修改名称')
  }
}
const handleClose = async () => {
  addDialogShow.value = false
  // await getData()
}
// 编辑
const handleEdit = () => {
  isEdit.value = true
  activeComponent.value = null
  activeTab.value = 0
}
// 取消编辑
const cancelEdit = () => {
  editFormName.value = false
}

const cancelEditForm = () => {
  ElMessageBox.confirm(
    `还有改动没保存，退出后无法找回，确认退出吗？`,
    '操作未保存',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  ).then(() => {
    isEdit.value = false
    const data = _.cloneDeep(cleepData.value)
    dataSource.data = data.data
    dataSource.title = data.title
    dataSource.style = data.style
    dataSource.childrenRelation = data?.childrenRelation || []
  })
}
// 保存编辑
const saveEdit = async () => {
  editFormName.value = false
  // ElMessage.error('名称已存在，请重新输入！')
  const params = {
    id: selectedForm.value.id,
    name: newFormName.value,
    format: JSON.stringify(dataSource)
  }
  const res = await updateForm(params)
  if (res.code === 10000) {
    selectedForm.value.name = newFormName.value
  }
}
// 删除
const handleDelete = () => {
  ElMessageBox.confirm(
    `确认删除<span class="specialText">【${selectedForm.value.name}】</span>吗？删除后将无法找回，请谨慎操作。`,
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
        id: selectedForm.value.id
      }
      const res = await deleteForm(params)
      if (res.code === 10000) {
        getListData()
        ElMessage({
          type: 'success',
          message: '已删除'
        })
        selectedForm.value = {
          id: null,
          name: null,
          agencyId: null,
          format: null
        }
      }
    })
}

const save = () => {
  const relationList = getChildrenRelation(dataSource?.childrenRelation || []) // 收集子集选项
  formRcursive(dataSource.data, relationList || []) // 递归处理数据

  const params = {
    ...selectedForm.value,
    format: JSON.stringify(dataSource)
  }

  updateForm(params).then(res => {
    if (res.code === 10000) {
      ElMessage({
        type: 'success',
        message: '已保存'
      })
      getListData()
      cleepData.value = _.cloneDeep(dataSource)
      isEdit.value = false
    }
  })
}

// 收集子集选项
const formRcursive = (data, relationList) => {
  for (const i in data) {
    const rowData = data[i]
    if (rowData.type === 'LayoutContainer') {
      formRcursive(rowData.col)
    } else {
      const { key, option } = rowData
      const relation = relationList.find(item => item.key === key)
      if (relation) {
        option.rule = {
          key: relation.childrenKey,
          name: relation.childrenName,
          value: relation.value,
          valueType: relation.valueType
        }
      } else {
        delete option.rule
      }
    }
  }
}

// 根据规则获取关联关系列表
const getChildrenRelation = (data = []) => {
  const list = data.reduce((arr, cur) => {
    cur.relation.forEach(relation => {
      arr.push({ key: relation, childrenKey: cur.key, childrenName: cur.name, value: cur.select, valueType: cur.valueType })
    })
    return arr
  }, [])
  return list
}

// 删除关联关系
const delRelation = (key) => {
  if (dataSource.childrenRelation) {
    dataSource.childrenRelation = dataSource.childrenRelation.filter(item => item.key !== key)
  }
}

// 收集所有组件
const componentsObj = {}
// 创建一个上下文，导入指定文件夹内的所有Vue文件
const files = import.meta.glob('./layoutContainer/viewComponents/*.vue')

Object.keys(files).forEach(async key => {
  const componentConfig = await files[key]()
  const componentName = key.split('/').pop().replace(/\.\w+$/, '')
  componentsObj[componentName] = componentConfig.default || componentConfig
})
</script>
<style lang="scss" scoped>
#layout-container {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  >div {
    // border: 1px solid #ccc;
    border-radius: 8px;
  }
  .page-left {
    display: flex;
    flex-direction: column;
    width: 258px;
    background-color: var(--theme-card);
    :deep(.el-scrollbar) {
      margin-bottom: 8px;
    }
    :deep(.el-tree-node__expand-icon.expanded) {
      position: absolute;
      right: 20px;
      transform: rotate(90deg);
    }
    :deep(.el-tree-node__expand-icon) {
      position: absolute;
      right: 20px;
      // transform: rotate(180deg);
    }
    :deep(.el-tree) {
      padding: 0 8px;
      &.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
        background-color: var(--theme-primary-soft);
        color: var(--theme-text);
      }
      & > .el-tree-node > .el-tree-node__content:nth-child(1) {
        padding-left: 18px !important;
        .txt {
          font-weight: 500;
          color: #646464;
        }
      }
      .el-tree-node__content {
        overflow: hidden;
        height: 36px;
        margin-top: 8px;
        padding-left: 50px !important;
        border-radius: 8px;
        color: #646464;
        &:hover {
          background-color: var(--theme-primary-soft);
        }
        .txt {
          display: inline-block;
          overflow: hidden;
          width: 100%;
          text-overflow: ellipsis;
          font-size: 14px;
          white-space: nowrap;
          .iconfont {
            margin-right: 8px;
            color: #959595;
          }
        }
      }
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 52px;
      padding: 0 12px 0 26px;
      span:nth-child(1) {
        font-weight: 500;
        color: var(--theme-text);
      }
      span:nth-child(2) {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 109px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        &:hover {
          background-color: var(--theme-primary-soft);
          color: var(--theme-primary);
        }
        i {
          font-size: 32px;
        }
      }
    }
    .search {
      height: 28px;
      margin-bottom: 10px;
      padding-left: 24px;
      padding-right: 27px;
      :deep(.el-input__wrapper) {
        background: var(--theme-fill);
        box-shadow: none;
      }
    }
    :deep(.el-menu-form) {
      padding: 0 8px;
      .el-sub-menu {
        margin-top: 12px;
        &.active {
          .el-sub-menu__title {
            font-weight: 500;
            color: var(--theme-primary);
          }
        }
        // &.is-active {
        //   .el-sub-menu__title {
        //     font-weight: 500;
        //     color: #3670F8;
        //   }
        // }
        .el-menu-item {
          display: block;
          overflow: hidden;
          height: 36px;
          margin-top: 8px;
          border-radius: 8px;
          line-height: 36px;
          text-overflow: ellipsis;
          color: #646464;
          white-space: nowrap;
          &:hover {
            background-color: var(--theme-primary-soft);
          }
          &.is-active {
            background-color: var(--theme-primary-soft);
            color: var(--theme-text);
          }
        }
        .el-sub-menu__title {
          height: 36px;
          border-radius: 8px;
          .iconfont {
            margin-right: 8px;
          }
        }
      }
      .el-menu-item.is-active {
        background-color: var(--theme-card) !important;
      }
      .el-menu-item.active {
        background-color: var(--theme-primary-soft) !important;
      }
    }
  }
  .page-right {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
    margin-left: 16px;
    .page-right-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 52px;
      padding: 0 26px;
      border-radius: 16px;
      background-color: var(--theme-card);
      .formName {
        display: flex;
        align-items: center;
        span {
          font-weight: 500;
          color: var(--theme-text);
        }
        .iconfont {
          width: 32px;
          height: 32px;
          margin-left: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 32px;
          &:hover {
            background: var(--theme-primary-soft);
            color: var(--theme-primary);
          }
        }
        :deep(.el-input) {
          .el-input__wrapper {
            padding: 0 14px;
            border-radius: 8px;
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
          width: 88px;
          height: 28px;
          margin-left: 26px;
          border-radius: 14px;
        }
        .el-button+.el-button {
          margin-left: 14px;
        }
      }
      .btnDiv {
        .el-button {
          width: 120px;
          height: 28px;
          border-radius: 14px;
          &:nth-child(2) {
            margin-left: 14px;
            border-color: #f76868;
            color: #f76868;
          }
        }
        .save {
          border: none;
          background-color: var(--theme-primary);
          color: #fff !important;
        }
      }
    }
    .page-right-bottom {
      display: flex;
      overflow: hidden;
      flex: 1;
      margin-top: 14px;
    }
  }
  .empty {
    background-color: var(--theme-card);
    >div {
      height: 100%;
    }
  }
  #mater-right {
    overflow: hidden;
    flex-basis: 280px;
    box-sizing: border-box;
    margin-left: 14px;
    padding: 15px 20px;
    border-radius: 16px;
    background: var(--theme-card);
    .topNav {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 47px;
      border-radius: 8px;
      background: var(--theme-card);
      ul {
        display: flex;
        flex: 1;
        box-sizing: border-box;
        height: 100%;
        font-size: 16px;
        li {
          display: flex;
          flex-direction: column;
          margin: 0 26px;
          cursor: pointer;

          /* 文本不换行 */
          white-space: nowrap;
          .bottomLine {
            width: 100%;
            height: 4px;
            margin-top: 3px;
            border-radius: 2px;
            background-color: var(--theme-card);
          }
          &.active {
            color: var(--theme-text);
            .bottomLine {
              background-color: var(--theme-primary);
            }
          }
        }
      }
    }
  }

  #mater-center {
    overflow: hidden;
    flex: 1;
    box-sizing: border-box;
    margin: 0;
    border-radius: 16px;
    background: var(--theme-card);
  }
  :deep(.new_Dialog) {
    .el-dialog__body {
      padding: 26px !important;
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
      &:nth-child(2) {
        margin-top: 24px;
      }
      .el-form-item__label {
        justify-content: flex-start;
        height: 40px;
        padding-right: 0;
        line-height: 40px;
      }
      .el-form-item__content {
        height: 40px;
        line-height: 40px;
        .el-input {
          height: 100%;
          line-height: 100%;
          font-size: 14px;
        }
      }
    }
    .el-select {
      width: 100%;
      height: 40px;
      line-height: 40px;
      .select-trigger {
        height: 100%;
      }
    }
    .el-input {
      .el-input__wrapper {
        padding: 0 14px;
        border-radius: 8px;
        background-color: var(--theme-fill);
        box-shadow: none;
        .el-input__inner {
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
:focus-visible {
  outline: none;
}
</style>
