<template>
  <div class="list-div">
    <div class="viewContent">
      <div class="left-div">
        <header>
          <div class="title">指标索引</div>
          <el-input
            :prefix-icon="Search"
            v-model="filterText"
            placeholder="请填写指标索引名称"
            class="searchText"
            clearable
          />
        </header>
        <div class="list-area">
          <el-scrollbar ref="menuListScrollbar">
            <LeftMenuList
              :dataList="menuList"
              :activeMenuInfo="activeMenuInfo"
              @toHandleClick="handleChangeItem"
              @toHandleDelete="handleDeleteItem"
              v-if="menuList.length > 0"
            />
            <div class="noData" v-if="!menuList.length">这里还没有内容</div>
          </el-scrollbar>
        </div>
      </div>
      <div class="rightContent">
        <header class="list-header header-query">
          <div class="conditionTitle">
            <div class="title">查询条件</div>
          </div>
          <div class="titleSearch">
            <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
              <el-form-item label="指标名称" class="form-query-select">
                <el-input v-model="searchInfo.filterText" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
              </el-form-item>
              <div class="btnDiv">
                <el-button @click="resetParams">重置条件</el-button>
                <el-button type="primary" @click="onSubmit">查 询</el-button>
              </div>
            </el-form>
          </div>
        </header>
        <div class="list-section">
          <header class="table-header">
            <div>指标列表</div>
            <div class="btns">
              <el-button class="common-btn default" @click="toImportIndex" v-if="!userStore.needCheckPermission || hadPermissionList.includes('导入指标')"><i class="iconfont icon-piliangdaoru"></i>批量导入</el-button>
              <el-button class="common-btn default" @click="toExportIndex" v-if="!userStore.needCheckPermission || hadPermissionList.includes('导出指标')"><i class="iconfont icon-daochu1"></i>导出指标</el-button>
              <el-button class="common-btn danger" @click="handleDelete" :disabled="multipleSelection.length === 0" v-if="!userStore.needCheckPermission || hadPermissionList.includes('删除指标')"><i class="iconfont icon-shanchu-1"></i>删除指标</el-button>
              <el-button type="primary" class="common-btn primary" @click="newResearch" v-if="!userStore.needCheckPermission || hadPermissionList.includes('添加指标')"><i class="iconfont icon-tianjiayihang"></i>新增指标</el-button>
            </div>
          </header>
          <div class="tableMain">
            <commonTable class="singleTable emptyDefaultTable btnsLastCell" :data="tableData" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column prop="name" label="指标名称" min-width="100"></el-table-column>
              <el-table-column prop="nameEn" label="英文名称" min-width="100"></el-table-column>
              <el-table-column prop="medicalMean" label="医学含义" min-width="150"></el-table-column>
              <el-table-column prop="indexTypeName" label="指标索引" min-width="100"></el-table-column>
              <!-- <el-table-column prop="codomain" label="值域" min-width="100"></el-table-column> -->
              <!-- <el-table-column prop="dataUnit" label="单位" min-width="50"></el-table-column> -->
              <el-table-column prop="indexPass" label="所在位置" min-width="80">
                <template #default="scope">
                  <span>{{getIndexPassName(scope.row)}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="codomainType" label="数据类型" min-width="80">
                <template #default="scope">
                  <span>{{getDataTypeName(scope.row.codomainType)}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="enumOptionsString" :formatter='formatterEnum' label="值域/枚举" min-width="100"></el-table-column>
              <el-table-column label="操作" fixed="right" min-width="60">
                <template #default="scope">
                  <el-button type="primary" link @click="editRow(scope.row)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('编辑指标')">编辑</el-button>
                  <el-button link class="redBtn" @click="deleteRow(scope.row)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('删除指标')">删除</el-button>
                </template>
              </el-table-column>
            </commonTable>
            <div class="tabel_pagination">
              <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
                <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
              </el-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :title="title" v-model="showDialog" v-if="showDialog" class="new_Dialog" :width="pxToRem(552)" :before-close="handleClose">
      <el-scrollbar>
        <el-form ref="ruleFormRef" label-position="left" :model="formData" class="new_DialogForm" :rules="rules">
          <el-form-item label="指标名称：" prop="name">
            <el-input text placeholder="请填写内容" maxlength="30" show-word-limit v-model="formData.name" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="name"></el-input>
          </el-form-item>
          <el-form-item label="英文名称：" prop="nameEn">
            <el-input text placeholder="请填写内容" maxlength="30" show-word-limit v-model="formData.nameEn" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="nameEn"></el-input>
          </el-form-item>
          <el-form-item label="医学含义：" class="textarea no-padding">
            <el-input type="textarea" resize='none' class="textareaWithScroll" placeholder="请填写内容" maxlength="200" show-word-limit v-model="formData.medicalMean" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="medicalMean"></el-input>
          </el-form-item>
          <el-form-item label="指标索引：" prop="indexTypeName">
            <!-- <el-input text placeholder="请填写内容" maxlength="30" show-word-limit v-model="formData.indexTypeName" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="indexTypeName"></el-input> -->

            <el-select
              popper-class="indexTypeNameSelect"
              v-model="formData.indexTypeName"
              filterable
              allow-create
              default-first-option
              placeholder="请选择一项"
              @blur="e=>selectBlur(e, index)"
              @change="val=>selectChange(val,index)"
              :disabled="Boolean(formData.id)||Boolean(activeMenuInfo?.id)">
              <template #header>
                历史记录指标
              </template>
              <el-option
                v-for="item in indexTypeOptions"
                :key="item.label"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指标类型：" prop="idxCategory">
            <el-radio-group v-model="formData.idxCategory" @change="handleIdxCategoryChange">
              <el-radio :value="1">常规类</el-radio>
              <el-radio :value="2">检验类</el-radio>
              <el-radio :value="3">检查类</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="检验来源：" prop="inspectSource" v-if="formData.idxCategory === 2">
            <commonSelectWithSearch
              v-model="formData.inspectSource"
              :options="inspectSourceOptions"
              :prop="{
                label:'name',
                value:'name'
              }"
            >
            </commonSelectWithSearch>
          </el-form-item>
          <el-form-item label="所在位置：" prop="indexPass">
            <el-select class="study_DialogTitle_input" placeholder="请选择一项" multiple collapse-tags v-model="formData.indexPass" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="indexPass">
              <el-option
                :disabled="item.disabledArr.includes(formData.idxCategory)"
                v-for="item in indexRun"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指标属性：" prop="dataProperty">
            <el-select
              class="study_DialogTitle_input"
              placeholder="请选择一项"
              v-model="formData.dataProperty"
              @change="handleDataProperty"
              @keyup.enter="submitForm(ruleFormRef)"
              @submit.prevent ref="dataProperty">
              <el-option
                v-for="item in rangeType"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据类型：" prop="codomainType">
            <el-select class="study_DialogTitle_input" placeholder="请选择一项" @change="handleDataTypeChange" v-model="formData.codomainType" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="codomainType">
              <el-option
                v-for="item in codomainTypeOptions"
                :key="item.label"
                :disabled="!item.showConditions.includes(formData.dataProperty)"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="枚举值：" prop="enumOptionsString" v-if="[4].includes(formData.codomainType)">
            <el-input text placeholder="请填写，以“,”间隔" maxlength="500" show-word-limit v-model="formData.enumOptionsString" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent @input="handleEnumInput" ref="enumOptionsString"></el-input>
          </el-form-item>
          <el-form-item label="值域：" class="valueDomain" prop="codomain" v-if="[1,2].includes(formData.codomainType)">
            <el-input text class="study_DialogTitle_input smallInput" @blur="checkLimits" @input="handleLowerInput" placeholder="下限" v-model="formData.codomainLower" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="codomainLower"></el-input>
            <span class="line"></span>
            <el-input text class="study_DialogTitle_input bigInput" @blur="checkLimits" @input="handleUpperInput" placeholder="上限" v-model="formData.codomainUpper" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="codomainUpper"></el-input>
          </el-form-item>
          <el-form-item label="检索样式：" prop="indexSearchType" v-if="[1,2,4,5,6].includes(formData.codomainType)">
            <el-select class="study_DialogTitle_input" placeholder="请选择一项" v-model="formData.indexSearchType" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="indexSearchType">
              <el-option
                v-for="item in filteredIndexSearchTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">保 存</el-button>
        </span>
      </template>
    </el-dialog>
    <importIndexDialog fromPage="indexDictionary" @finishUpload="finishUpload" ref="importIndexDialogRef"/>
  </div>
</template>

<script>
export default {
  name: 'IndexDictionary'
}
</script>
<script setup>
import { ref, reactive, computed, h } from 'vue'
import { getIndexList, deleteIndex, addIndex, updateIndex, getIndexEnum, deleteIndexEnum, getSourceList, checkDelIndexQueueCount, delIndexList, exportIndex } from '@/api/api_index'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Search, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { codomainTypeOptions, IndexSearchTypeOptions } from '@/utils/dictionaries.js'
import LeftMenuList from '@/components/manage/components/leftMenuList.vue'
import importIndexDialog from '@/components/manage/components/importIndexDialog.vue'
import commonSelectWithSearch from '@/components/common/commonSelectWithSearch.vue'
import { formatDateTime2, formatDateTime } from '@/utils/utils'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/manage/indexDictionary') {
    hadPermissionList.value.push(item.name)
  }
})
const searchInfo = ref({
  filterText: ''
})
const inspectSourceOptions = ref([])
const indexRun = ref([
  {
    value: 'basic_information',
    label: '病案首页',
    disabledArr: [2, 3]
  }, {
    value: 'enter_record',
    label: '入院记录',
    disabledArr: [2, 3]
  }, {
    value: 'exit_record',
    label: '出院记录',
    disabledArr: [2, 3]
  }, {
    value: 'course_record',
    label: '病程记录',
    disabledArr: [2, 3]
  }, {
    value: 'inspections',
    label: '实验室检查',
    disabledArr: [1, 3]
  }, {
    value: 'image_reports',
    label: '影像检查',
    disabledArr: [1, 2]
  }, {
    value: 'pathologies',
    label: '病理',
    disabledArr: [2, 3]
  }, {
    value: 'operations',
    label: '手术记录',
    disabledArr: [2, 3]
  }, {
    value: 'advices',
    label: '医嘱',
    disabledArr: [2, 3]
  }
])
const rangeType = ref([
  {
    id: 0,
    label: '定性变量'
  },
  {
    id: 1,
    label: '定量变量'
  },
  {
    id: 2,
    label: '其他'
  }
])
const filterText = ref('')
const allMenuList = ref([])
const menuList = computed(() => {
  const list = allMenuList.value.filter(item => {
    return item.name.includes(filterText.value)
  })
  return list
})
const activeMenuInfo = ref(null)
const showDialog = ref(false)
const title = ref('新增指标')
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const ruleFormRef = ref()
const formData = reactive({
  id: '',
  name: '',
  nameEn: '',
  indexPass: [],
  dataProperty: '',
  indexTypeName: '', // 指标索引
  idxCategory: 1, // 指标类型
  medicalMean: '',
  codomain: '',
  dataUnit: '',
  codomainType: '',
  multiNumFlag: '',
  indexSearchType: '',
  enumOptionsString: '',
  codomainLower: '',
  codomainUpper: ''
})
const tableData = ref([])
const rules = reactive({
  name: [{ required: true, message: '请填写', trigger: 'blur' }],
  nameEn: [{ required: true, message: '请填写', trigger: 'blur' }],
  indexPass: [{ required: true, message: '请选择', trigger: 'change' }],
  dataProperty: [{ required: true, message: '请选择', trigger: 'change' }],
  inspectSource: [{ required: true, message: '请选择', trigger: 'change' }],
  enumOptionsString: [{ required: true, message: '请填写', trigger: 'blur' }],
  indexTypeName: [{ required: true, message: '请选择', trigger: 'change' }],
  codomainType: [{ type: 'number', required: true, message: '请选择', trigger: 'change' }],
  multiNumFlag: [{ type: 'number', required: true, message: '请选择', trigger: 'change' }],
  codomain: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (formData.codomainLower !== '' && formData.codomainUpper !== '') {
          // 合并 codomainLower 和 codomainUpper 并赋值给 codomain
          // formData.codomain = `${formData.codomainLower},${formData.codomainUpper}`
          callback() // 校验通过
        } else {
          callback(new Error('请填写'))
        }
      },
      trigger: 'blur'
    }
  ],
  indexSearchType: [{ required: true, message: '请选择', trigger: 'change' }],
  idxCategory: { required: true, message: '请选择' }
})
const indexTypeOptions = computed(() => {
  return allMenuList.value.slice(1).map(item => {
    return {
      value: item.id,
      label: item.name
    }
  })
})
const formatterEnum = (row) => {
  if ([1, 2, 4].includes(row.codomainType)) {
    return row.enumOptionsString || row.codomain || '-'
  } else {
    return '-'
  }
}
const resetParams = () => {
  searchInfo.value = {}
  currentPage.value = 1
  getListData()
}
const onSubmit = () => {
  currentPage.value = 1
  getListData()
}

const handleInputValue = (val, isUpper = true) => {
  let value = val
  // 根据 codomainType 判断输入格式
  if (formData.codomainType === 1) { // 仅允许整数（含负数）
    value = value.replace(/[^\d-]/g, '') // 只允许数字和负号
    // 只允许负号出现在开头且只出现一次
    value = value.replace(/(?!^)-/g, '')
    if (value.startsWith('-')) {
      // 负数，去除负号后前导零
      value = '-' + value.slice(1).replace(/^0+(?=\d)/, '')
    } else {
      // 正数，去除前导零
      value = value.replace(/^0+(?=\d)/, '')
    }
  } else if (formData.codomainType === 2) { // 允许浮点数（含负数）
    value = value.replace(/[^\d.-]/g, '') // 只允许数字、小数点和负号
    // 只允许负号出现在开头且只出现一次
    value = value.replace(/(?!^)-/g, '')
    // 只允许一个小数点
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts.shift() + '.' + parts.join('')
    }
    if (value.startsWith('-')) {
      // 负数
      let num = value.slice(1)
      if (num.startsWith('.')) {
        num = '0' + num
      }
      // 移除整数部分前导零（保留0.）
      if (num.indexOf('.') === -1 && /^0\d+/.test(num)) {
        num = num.replace(/^0+/, '')
      }
      value = '-' + num
    } else {
      // 正数
      if (value.indexOf('.') === 0) {
        value = '0' + value
      }
      if (value.indexOf('.') === -1 && /^0\d+/.test(value)) {
        value = value.replace(/^0+/, '')
      }
    }
    // 限制小数点后最多四位
    if (value.includes('.')) {
      value = value.replace(/(\.\d{4})\d+/, '$1')
    }
  }

  // 处理范围控制
  if (value !== '' && !isNaN(Number(value))) {
    if (Number(value) < -1000) value = -1000 // 下限不小于 -1000
    if (Number(value) > 100000) value = 100000 // 上限不超过 100000
  }
  if (/^0+$/.test(value)) {
    value = 0 // 如果值是 0，设置为 0
  }
  // 设置表单数据
  if (isUpper) {
    formData.codomainUpper = value
  } else {
    formData.codomainLower = value
  }
}

// 上限输入处理
const handleUpperInput = (val) => {
  handleInputValue(val, true)
}

// 下限输入处理
const handleLowerInput = (val) => {
  handleInputValue(val, false)
}

const checkLimits = () => {
  if (formData.codomainLower !== '' && formData.codomainUpper !== '') {
    if (Number(formData.codomainLower) > Number(formData.codomainUpper)) {
      ElMessage.error('上下限输入错误，上限不能小于下限')
      return false
    }
  }
  return true
}

const filteredIndexSearchTypeOptions = computed(() => {
  if (formData.codomainType === 1 || formData.codomainType === 2) {
    return IndexSearchTypeOptions.value.filter(option => option.value === 'relationSelect' || option.value === 'number')
  } else if (formData.codomainType === 4) {
    return IndexSearchTypeOptions.value.filter(option => option.value === 'select' || option.value === 'mulSelect')
  } else if (formData.codomainType === 5) {
    return IndexSearchTypeOptions.value.filter(option => option.value === 'datetimerange')
  } else if (formData.codomainType === 6) {
    return IndexSearchTypeOptions.value.filter(option => option.value === 'daterange')
  } else {
    return []
  }
})
// 获取列表数据
const getListData = async() => {
  const params = {
    name: searchInfo.value.filterText,
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  if (activeMenuInfo.value.id !== 0) {
    params.indexTypeId = activeMenuInfo.value.id
  }
  const res = await getIndexList(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}
// 获取指标索引列表
const getIndexEnumList = async() => {
  const res = await getIndexEnum({
    pageNum: 1,
    pageSize: 10000
  })
  if (res.code === 10000) {
    const data = res.data.items
    data.unshift({
      id: 0,
      name: '全部'
    })
    allMenuList.value = data
    if (data.length > 0 && (!activeMenuInfo.value || !data.find(item => item.id === activeMenuInfo.value.id))) {
      handleChangeItem(data[0])
    } else {
      getListData()
    }
  }
}
// 加载时请求页面列表
const init = async () => {
  await getIndexEnumList()
}

init()

// 新增
const newResearch = () => {
  // ruleFormRef.value?.resetFields()
  formData.id = ''
  formData.name = ''
  formData.nameEn = ''
  formData.indexPass = []
  formData.dataProperty = ''
  formData.medicalMean = ''
  formData.codomain = ''
  formData.dataUnit = ''
  formData.codomainType = ''
  formData.multiNumFlag = ''
  formData.indexSearchType = ''
  formData.enumOptionsString = ''
  formData.indexTypeName = activeMenuInfo.value.name !== '全部' ? activeMenuInfo.value.name : ''
  formData.idxCategory = 1
  formData.inspectSource = ''
  title.value = '新增指标'

  if (!inspectSourceOptions.value.length) {
    getSourceListFn()
  }
  showDialog.value = true
}
// 关闭弹窗
const handleClose = async () => {
  showDialog.value = false
  ruleFormRef.value?.resetFields()
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
const handleDataTypeChange = () => {
  formData.indexSearchType = ''
  formData.codomainLower = ''
  formData.codomainUpper = ''
}
// 编辑指标
const editRow = (item) => {
  title.value = '编辑指标'
  formData.id = item.id
  formData.name = item.name
  formData.nameEn = item.nameEn
  formData.indexTypeName = item.indexTypeName
  formData.idxCategory = item.idxCategory
  formData.inspectSource = item.inspectSource // 检验来源
  formData.medicalMean = item.medicalMean
  formData.codomain = item.codomain
  formData.dataUnit = item.dataUnit
  formData.codomainType = item.codomainType
  formData.multiNumFlag = item.multiNumFlag
  formData.indexSearchType = item.indexSearchType
  formData.enumOptionsString = item.enumOptionsString
  if (item.codomain.startsWith('-')) {
    formData.codomainLower = -item.codomain.split('-')[1]
    formData.codomainUpper = item.codomain.split('-')[2]
  } else {
    formData.codomainLower = item.codomain.split('-')[0]
    formData.codomainUpper = item.codomain.split('-')[1]
  }

  formData.dataProperty = item.dataProperty
  formData.codomain = item.codomain
  formData.indexPass = item.indexPass
    ? item.indexPass.split(',').map(value => value.trim())
    : []
  showDialog.value = true
  if (!inspectSourceOptions.value.length) {
    getSourceListFn()
  }
}
// 获取检验来源
const getSourceListFn = () => {
  getSourceList({
    pageNum: 1,
    pageSize: 10000
  }).then(res => {
    if (res.code === 10000) {
      inspectSourceOptions.value = res.data.items.map(item => ({
        name: item.name,
        id: item.id
      }))
    }
  })
}
// 删除
const deleteRow = async(row) => {
  ElMessageBox.confirm(
    `确认删除【${row.name}】吗？删除后将无法找回，请谨慎操作。`,
    '删除指标',
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
      const res = await deleteIndex(params)
      if (res.code === 10000) {
        ElMessage.success('已删除')
        // await getListData()
        // 刷新指标列表
        getIndexEnumList()
      }
    })
}
const handleDataProperty = () => {
  formData.codomainType = ''
}
// const fullscreenLoading = ref(false)
// 弹出原生上传界面
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      if (Number(formData.codomainLower) > Number(formData.codomainUpper)) {
        ElMessage.error('上下限输入错误，上限不能小于下限')
        return
      }
      let res = ''
      formData.codomain = formData.codomainLower + '-' + formData.codomainUpper
      if (!formData.id) {
        res = await addIndex(formData)
      } else {
        res = await updateIndex(formData)
      }
      if (res.code === 10000) {
        ElMessage.success('已保存')
        getIndexEnumList()
        handleClose()
      }
    }
  })
}
const handleEnumInput = (value) => {
  // 使用正则表达式替换中文逗号为英文逗号
  const newValue = value.replace(/，/g, ',')
  const regex = /^[0-9a-zA-Z\u4e00-\u9fa5,]+$/
  if (!regex.test(newValue)) {
    formData.enumOptionsString = newValue.slice(0, -1)
  } else {
    formData.enumOptionsString = newValue
  }
}
// 获取数据类型名称
const getDataTypeName = (type) => codomainTypeOptions.value.find(item => item.value === type)?.label || ''

// 获取所在位置名称
const getIndexPassName = (row) => {
  if (!row.indexPass) return ''
  const indexPassArray = row.indexPass.split(',').map(item => item.trim())
  // 使用 map 对数组中的每个项进行映射，得到对应的标签
  const mappedLabels = indexPassArray.map(item => {
    switch (item) {
      case 'basic_information':
        return '病案首页'
      case 'enter_record':
        return '入院记录'
      case 'exit_record':
        return '出院记录'
      case 'inspections':
        return '实验室检查'
      case 'image_reports':
        return '影像检查'
      case 'pathologies':
        return '病理'
      case 'operations':
        return '手术记录'
      case 'advices':
        return '医嘱'
      case 'course_record':
        return '病程记录'
      default:
        return '' // 未匹配到时返回空字符串
    }
  })
  // 将映射后的标签数组用逗号连接并返回
  return mappedLabels.join(', ')
}
// 切换指标类型
const handleChangeItem = async (item) => {
  activeMenuInfo.value = item
  currentPage.value = 1
  getListData()
}
// 删除指标类型
const handleDeleteItem = async (id) => {
  console.log('删除', id)
  const res = await deleteIndexEnum({
    id
  })
  if (res.code === 10000) {
    ElMessage.success('已删除')
    // 若删除的当前组，则默认第一个组，并重新查询数据;若删除的其他组，仅需重新获取列表即可，
    if (activeMenuInfo.value.id === id) {
      activeMenuInfo.value = null
    }
    getIndexEnumList()
  }
}
// 批量删除
const handleDelete = async (row) => {
  console.log('multipleSelection', multipleSelection.value)
  if (multipleSelection.value.length > 0) {
    // 先校验
    ElMessageBox.confirm(
      `确认删除指标？删除后将无法找回，请谨慎操作。`,
      '删除指标',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }
    )
      .then(async () => {
        const ids = multipleSelection.value.map(item => item.id)
        const params = {
          indexIdList: ids
        }
        const { code, data } = await checkDelIndexQueueCount(params)
        if (code === 10000) {
          if (data === 0) {
            const res = await delIndexList(params)
            if (res.code === 10000) {
              ElMessage.success('已删除')
              getIndexEnumList()
            }
          } else {
            ElMessageBox.confirm(
              `有<span class="count">${data}</span>个指标已被队列引用，请在队列删除后重试。<br/>
          除引用指标外都被确认删除？`,
              '删除指标',
              {
                dangerouslyUseHTMLString: true,
                confirmButtonText: '确 定',
                cancelButtonText: '取 消',
                type: 'warning'
              }
            ).then(async () => {
              const res = await delIndexList(params)
              if (res.code === 10000) {
                ElMessage.success('已删除')
                getIndexEnumList()
              }
            }).catch(() => {})
          }
        }
      })
  } else {
    ElMessage.warning('请选择要删除的指标')
  }
}
const importIndexDialogRef = ref(null)
// eslint-disable-next-line no-unused-vars
const showImportNotification = (isSuccess, filename, total = 0, duplicates = 0) => {
  const icon = isSuccess ? SuccessFilled : CircleCloseFilled
  const statusText = isSuccess ? '导入成功' : '导入失败'
  const statsText = isSuccess
    ? [
      '共导入',
      h('span', { class: 'notification-total' }, total),
      '个指标，舍弃重复',
      h('span', { class: 'notification-duplicates' }, duplicates),
      '个指标'
    ]
    : '导入格式不正确，请重新上传'

  ElNotification({
    customClass: isSuccess ? 'notification-success' : 'notification-error',
    message: h('div', { class: 'notification-content' }, [
      h('div', { class: 'notification-status' }, [
        h(icon, { class: 'notification-icon' }),
        statusText
      ]),
      h('div', { class: 'notification-fileInfo' }, [
        h('span', { class: 'notification-filename' }, filename),
        h('span', { class: 'notification-time' }, formatDateTime(new Date()))
      ]),
      h('div', { class: 'notification-text' }, statsText)
    ])
    // duration: 0
  })
}
// 批量导入
const toImportIndex = () => {
  console.log('批量导入')
  // showImportNotification(true, '指标数据.xlsx', 200, 6)
  // showImportNotification(false, '指标数据.xlsx')
  importIndexDialogRef.value.triggerUpload()
}
// 导入完成
const finishUpload = (fileInfo, showImportDialog) => {
  console.log('导入完成')
  if (!showImportDialog) {
    if (fileInfo.status === 'success') {
      showImportNotification(true, fileInfo.name, fileInfo.successCount, fileInfo.duplicateCount)
    } else {
      showImportNotification(false, fileInfo.name)
    }
  }
  getIndexEnumList()
}
// 导出
const toExportIndex = async () => {
  try {
    const res = await exportIndex()
    if (res.status === 200) {
      const { data, headers } = res
      // 创建 Blob 对象
      const blob = new Blob([data], { type: headers['content-type'] })
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      // fileName为“指标字典所有指标_某年某月某日某时某分某秒”格式
      const name = formatDateTime2()
      const fileName = `指标字典所有指标_${name}.json`
      link.href = url
      link.setAttribute('download', fileName) // 设置下载文件名
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // 显示成功消息
      ElMessage.success('文件已开始下载')
    }
  } catch (error) {
    // 处理下载失败的情况
    console.error('下载失败', error)
    ElMessage.error('下载失败')
  }
}
const multipleSelection = ref([])
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
const selectBlur = (e, index) => {
  console.log(11, e.target.value)
  if (e.target.value) {
    formData.indexTypeName = e.target.value.slice(0, 30)
  }
}
const selectChange = (e, index) => {
  if (index) {
    formData.indexTypeName = e.target.value.slice(0, 30)
  }
}
// 切换指标类型
const handleIdxCategoryChange = async (val) => {
  formData.indexPass = ''
  // if (val === 2) {
  //   const { code, data } = await getSourceList({
  //     pageNum: 1,
  //     pageSize: 10000
  //   })
  //   if (code === 10000) {
  //     inspectSourceOptions.value = data.items.map(item => ({
  //       name: item.name,
  //       id: item.id
  //     }))
  //   }
  // }
}
</script>

<style scoped lang="scss">
@use "@/style/common/list.scss";
.list-div {
  .viewContent {
    flex-direction: row;
    .left-div {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 258px;
      height: 100%;
      padding: 16px 0;
      border-radius: 8px;
      background-color: var(--theme-card);
      header {
        padding: 0 16px;
        .title {
          font-weight: 600;
          font-size: 16px;
          color: var(--theme-text);
        }
        .searchText {
          margin-top: 16px;
        }
      }
      .list-area {
        flex: 1;
        height: 0;
        margin-top: 13px;
        padding: 0 10px;
        .noData {
          margin-top: 12px;
          text-align: center;
          color: var(--theme-text-2);
        }
      }
    }
    .rightContent {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 0;
      margin-left: 16px;
      .table-header {
        justify-content: initial;
        .btns {
          display: flex;
          justify-content: flex-end;
          flex: 1;
          background: initial;
          .default:hover {
            i {
              color: var(--theme-primary);
            }
          }
          .default.is-disabled {
            i {
              color: var(--theme-text-3);
            }
          }
        }
      }
    }
  }
  .header-query {
    .titleSearch {
      display: flex;
      width: 100%;
    }
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
    .el-form-item {
      margin-bottom: 16px;
      &.textarea {
        .el-form-item__content {
          height: auto;
        }
      }
      .el-form-item__label {
        position: relative;
        justify-content: flex-end;
        min-width: 92px;
        height: 32px;
        line-height: 32px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text);
      }
      .el-form-item__label::before {
        color: #ff4e4e;
      }
      .el-form-item__content {
        height: 32px;
        //.el-textarea
        .el-input__wrapper {
          .el-input__count {
            // top: 14px;
            height: 15px;
            // font-size: 16px;
            color: rgba(149, 149, 149, 0.5453);
          }
        }
        // .el-textarea__inner {
        //   height: 100%;
        //   // padding: 10px 0 0 14px;
        //   outline: 0;
        //   resize: none;
        // }
      }
    }
    .valueDomain {
      .el-form-item__content {
        display: flex;
        align-items: center;
        .smallInput,
        .bigInput {
          width: 193px;
        }
        .line {
          display: inline-block;
          width: 14px;
          height: 1px;
          margin: 0 6px;
          background: #d8d8d8;
        }
      }
    }
    .el-form-item:last-child {
      margin-bottom: 0;
    }
  }
}
.textareaWithScroll {
  height: 95px;
  :deep(.el-textarea__inner) {
    height: 100%;
  }
}
</style>
<style lang="scss">
.indexTypeNameSelect {
  max-width: 500px;
  .el-select-dropdown__header {
    padding: 13px 14px 9px;
    font-size: 12px;
    color: var(--theme-text-3);
  }
  .el-select-dropdown__list {
    padding-top: 0;
  }
}
</style>
<style lang="scss">
.el-notification.right {
  padding-right: 0;
}
.el-notification__group {
  margin-left: 2px;
}
.notification-content {
  .notification-status {
    display: flex;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-text);
    svg {
      width: 22px;
      height: 22px;
      margin-right: 9px;
    }
  }
  .notification-fileInfo {
    margin-top: 8px;
    padding-left: 31px;
    color: var(--theme-text-2);
    .notification-time {
      padding-left: 8px;
    }
  }
  .notification-text {
    margin-top: 4px;
    padding-left: 31px;
    color: var(--theme-text-2);
    .notification-total {
      font-weight: 600;
      color: var(--theme-primary);
    }
    .notification-duplicates {
      font-weight: 600;
      color: #ff4e4e;
    }
  }
}
.notification-success {
  svg {
    color: #049c72;
  }
}
.notification-error {
  svg {
    color: #ff4e4e;
  }
}
</style>
