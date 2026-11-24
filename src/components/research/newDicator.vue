<template>
  <div class="addIP-dialogDIV">
    <el-dialog v-model="showDialog" class="addIP_Dialog" :class="steps === '0'? 'addIP_Dialog1' : 'addIP_Dialog2'" :width="steps==='0'? pxToRem(942) : pxToRem(552)" :before-close="handleClose">
      <template #header="{ titleClass1 }">
        <div class="my-header">
          <h2 :class="titleClass1">{{formData?.id?"编辑指标":'新增指标'}}</h2>
        </div>
      </template>
      <div class="choiceIndex" v-show="steps==='0'">
        <header class="choiceTop">
          <div class="left">
            <span><i></i>指标索引</span>
          </div>
          <div class="right">
            <div class="search">
              <i class="iconfont icon-chaxun-sousuo"></i>
              <el-input type="text" v-model="searchText" @input="handleInput" placeholder="搜索名称" />
            </div>
            <div class="rightTop">
              <el-button type="primary" @click="addType"><i class="iconfont icon-tianjiayihang"></i>创建指标</el-button>
            </div>
          </div>
        </header>
        <div class="choiceTable">
          <el-scrollbar ref="myScrollBar">
            <ul class="leftTab">
              <li v-for="item in tabList" :key="item.id" @click="selectTab(item.id,item)" :class="{ active: item.id==isActive}" :title="item.name"><i></i><span>{{ item.name }}</span></li>
            </ul>
          </el-scrollbar>
          <div class="rightTable">
            <commonTable class="singleTable" :data="tableData" ref="multipleTableRef" @selection-change="handleSelectionChange">
              <!-- <el-table-column label="引用字段">
                <template #default="{ row }">
                  <el-checkbox v-model="row.checked" :disabled="row.choose" @change="handleCheckboxChange(row)" />
                </template>
              </el-table-column> -->
              <el-table-column type="selection" :width="echartsToPx(46)" :selectable="selectable" />
              <el-table-column prop="" :width="echartsToPx(100)" label="引用字段" />
              <el-table-column prop="name" label="指标名称">
                <template #default="{ row }">
                  {{ row.name || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="nameEn" label="英文名称">
                <template #default="{ row }">
                  {{ row.nameEn || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="数据类型" :width="tabObj?.name==='自定义'?'':echartsToPx(90)">
                <template #default="{ row }">
                  {{ getDataTypeName(row.codomainType) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" :width="echartsToPx(120)" fixed="right" v-if="tabObj?.name==='自定义'">
                <template #default="{ row }">
                  <el-button
                    class="editBtn"
                    @click="editRow(row)" link>编辑</el-button>
                  <el-button
                    class="deleteBtn"
                    @click="deleteRow(row)" link>删除</el-button>
                </template>
              </el-table-column>
            </commonTable>
          </div>
        </div>
      </div>
      <div class="creatIndex" v-show="steps === '1'">
        <el-form ref="ruleFormRef" label-position="left" :model="formData" class="addIP_DialogForm" :rules="rules">
          <el-form-item label="指标名称：" prop="name">
            <el-input text class="study_DialogTitle_input" placeholder="请填写内容" maxlength="30" show-word-limit v-model="formData.name" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="name"></el-input>
          </el-form-item>
          <el-form-item label="英文名称：" prop="nameEn">
            <el-input text class="study_DialogTitle_input" placeholder="请填写内容" maxlength="30" show-word-limit v-model="formData.nameEn" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="nameEn"></el-input>
          </el-form-item>
          <el-form-item label="医学含义：" class="textarea no-padding">
            <el-input type="textarea" resize='none' class="textareaWithScroll" placeholder="请填写内容" maxlength="200" show-word-limit v-model="formData.medicalMean" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="medicalMean"></el-input>
          </el-form-item>
          <!-- <el-form-item label="指标分类：" prop="indexTypeName">
            <el-input text placeholder="请填写内容" maxlength="30" show-word-limit v-model="formData.indexTypeName" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="indexTypeName"></el-input>
          </el-form-item> -->
          <el-form-item label="指标类型：" prop="idxCategory">
            <el-radio-group v-model="formData.idxCategory" @change="handleTypeChange">
              <el-radio :value="1">常规类</el-radio>
              <el-radio :value="2">检验类</el-radio>
              <el-radio :value="3">检查类</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="检验来源：" prop="inspectSource" v-if="formData.idxCategory===2">
            <commonSelectWithSearch
              :prop="{
                label:'name',
                value:'name'
              }"
              v-model="formData.inspectSource"
              :options="allSourceList">
            </commonSelectWithSearch>
          </el-form-item>
          <el-form-item label="所在位置：" prop="indexPass">
            <el-select class="study_DialogTitle_input" placeholder="请选择一项" multiple collapse-tags v-model="formData.indexPass" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="indexPass">
              <el-option
                v-for="item in indexRun"
                :key="item.value"
                :disabled="item.disabledArr.includes(formData.idxCategory)"
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
              @keyup.enter="submitForm(ruleFormRef)"
              @change="handleDataProperty"
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
          <el-form-item label="检索样式：" prop="IndexSearchType" v-if="[1,2,4,5,6].includes(formData.codomainType)">
            <el-select class="study_DialogTitle_input" placeholder="请选择一项" v-model="formData.IndexSearchType" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="IndexSearchType">
              <el-option
                v-for="item in filteredIndexSearchTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

        </el-form>
      </div>
      <div class="creatSource" v-if="steps === '2'">
        <div class="addSource">+新增定义源</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleBack" class="stepBack" v-if="steps === '2'">上一步</el-button>
          <el-button @click="handleClose" v-if="steps === '0'" class="cancel">取 消</el-button>
          <el-button @click="handleCloseFrom" v-if="steps === '1'" class="cancel">取 消</el-button>
          <el-button @click="submitTable" class="nextStep" type="primary" v-if="steps === '0'">确 定</el-button>
          <el-button @click="submitForm(ruleFormRef)" class="sure" type="primary" v-if="steps === '1'">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'NewDicator'
}
</script>
<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useResearchStore } from '@/store/researchStore'
import { getIndexGroup, addIndexData, addIndexGroup, sourceList } from '@/api/api_research'
import { deleteIndex } from '@/api/api_index.js'
import { updatePrivateIndex } from '@/api/api_index'
import { codomainTypeOptions, IndexSearchTypeOptions } from '@/utils/dictionaries.js'
import CommonTable from '../common/commonTable.vue'
import commonSelectWithSearch from '../common/commonSelectWithSearch.vue'
import lodash from 'lodash'
import { echartsToPx } from '@/utils/utils.js'
const researchStore = useResearchStore()
const showDialog = ref(false)
const open = () => {
  showDialog.value = true
}
open()
const steps = ref('0')
const searchText = ref('')
const multipleTableRef = ref(null)
const isActive = ref(0)
const allData = ref()
const props = defineProps({
  defaultCheckedKey: String,
  groupType: Number
})
const formData = reactive({
  name: '',
  nameEn: '',
  // indexTypeName: '',
  medicalMean: '',
  codomainType: '',
  dataProperty: '',
  codomain: '',
  codomainLower: '',
  codomainUpper: '',
  indexPass: [],
  IndexSearchType: '',
  enumOptionsString: ''
})
const tabList = ref([])
const tableData = ref([])
const selectedRows = ref([])

// 页面初始化数据
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
const handleTypeChange = () => {
  formData.indexPass = ''
}
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

const myScrollBar = ref()
const emit = defineEmits(['handle-close', 'handle-edit', 'handle-submit'])
const ruleFormRef = ref()
const rules = reactive({
  name: [{ required: true, message: '请填写', trigger: 'blur' }],
  nameEn: [{ required: true, message: '请填写', trigger: 'blur' }],
  // indexTypeName: [{ required: true, message: '请填写', trigger: 'blur' }],
  enumOptionsString: [{ required: true, message: '请填写', trigger: 'blur' }],
  codomainType: [{ required: true, message: '请选择', trigger: 'change' }],
  codomain: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (formData.codomainLower !== '' && formData.codomainUpper !== '') {
          callback() // 校验通过
        } else {
          callback(new Error('请填写'))
        }
      },
      trigger: 'blur'
    }
  ],
  dataProperty: [{ required: true, message: '请选择', trigger: 'change' }],
  indexPass: [{ required: true, message: '请选择', trigger: 'change' }],
  IndexSearchType: [{ required: true, message: '请选择', trigger: 'change' }],
  idxCategory: { required: true, message: '请选择', trigger: 'blur' },
  inspectSource: { required: true, message: '请选择', trigger: 'blur' }
})
// 获取数据类型名称
const getDataTypeName = (type) => codomainTypeOptions.value.find(item => item.value === type)?.label || ''

const selectable = (row) => {
  // 通过判断 row.choose 来决定该行是否可选择
  if (row.choose) {
    return false
  } else {
    return row.idxCategory === props.groupType
  }
  // 如果 row.choose 为 true或者类型不同则该行不可选
}
const currentSelectedRows = ref([])
const handleSelectionChange = (val) => {
  const selectableRows = val
  currentSelectedRows.value = []
  selectableRows.forEach(item => {
    currentSelectedRows.value.push(item.id)
  })
}

const handleDataTypeChange = () => {
  formData.IndexSearchType = ''
  formData.codomainLower = ''
  formData.codomainUpper = ''
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
    if (Number(value) > 100000) value = 100000 // 上限不超过 10000
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

// 获取页面列表
const getData = async(val) => {
  const params = {
    queueIndexGroupId: props.defaultCheckedKey,
    name: searchText.value
  }
  const res = await getIndexGroup(params)
  if (res.code === 10000) {
    tabList.value = res.data.map(item => ({
      id: item.id,
      name: item.name
    }))
    // 设置默认选中的tab对应的右侧表格数据
    if (tabList.value.length > 0) {
      allData.value = res
      allData.value.data.forEach(group => {
        group.items.forEach(item => {
          item.checked = selectedRows.value.includes(item.id)
        })
      })
      if (val === 'add' || val === 'edit') {
        await nextTick(() => {
          formData.id = ''
          const obj = tabList.value.find(item => item.name === '自定义')
          const customId = obj.id
          selectTab(customId, obj)
          // tableData.value[0].checked = true
          // handleCheckboxChange(tableData.value[0])
          if (val === 'add') {
            multipleTableRef.value.toggleRowSelection(tableData.value[0], true)
            currentSelectedRows.value.push(tableData.value[0].id)
          }
          multipleTableRef.value.$forceUpdate()
          myScrollBar.value.scrollTo({ top: (tabList.value.length + 1) * 36 })
        })
      } else {
        if (searchText.value === '') {
          selectTab(tabList.value[0].id, tabList.value[0])
        } else {
          const objIndex = allData.value.data.findIndex(item => item.items.length > 0)
          if (objIndex > 0) {
            selectTab(allData.value.data[objIndex].id, allData.value.data[objIndex])
            nextTick(() => {
              myScrollBar.value.scrollTo({ top: (objIndex) * echartsToPx(32) })
            })
          } else {
            selectTab(tabList.value[0].id, tabList.value[0])
          }
        }
      }
    } else {
      tableData.value = []
    }
  }
}

// 输入框输入
const handleInput = () => {
  getData()
}
const tabObj = ref('')
// 选择tab
const selectTab = (tabId, obj) => {
  isActive.value = tabId
  tabObj.value = obj

  const tab = tabList.value.find(tab => tab.id === tabId)
  if (tab) {
    selectedRows.value = selectedRows.value.concat(currentSelectedRows.value)

    tableData.value = allData.value.data.find(item => item.id === tabId)?.items || []
    const currentSelectedRows2 = []
    tableData.value.forEach(item => {
      if (selectedRows.value.includes(item.id)) {
        currentSelectedRows2.push(item.id)
        selectedRows.value.splice(selectedRows.value.indexOf(item.id), 1)
      }
    })
    nextTick(() => {
      tableData.value.forEach(row => {
        if (currentSelectedRows2.includes(row.id)) {
          multipleTableRef.value.toggleRowSelection(row, true)
        } else {
          multipleTableRef.value.toggleRowSelection(row, false)
        }
      })
    })
  }
}

// 处理复选框状态改变事件
// const handleCheckboxChange = (row) => {
//   const index = selectedRows.value.indexOf(row.id)
//   if (row.checked && index === -1) {
//     selectedRows.value.push(row.id)
//   } else if (!row.checked && index !== -1) {
//     selectedRows.value.splice(index, 1)
//   }
// }

// 确定按钮
const submitTable = async() => {
  const arr = [...new Set(selectedRows.value), ...new Set(currentSelectedRows.value)]
  if (arr?.length === 0) {
    ElMessage.error('选择项不能为空，请选择指标')
    return
  }

  const params = {
    queueIndexGroupId: props.defaultCheckedKey,
    indexIdList: lodash.uniq(arr)
  }
  const res = await addIndexGroup(params)
  if (res.code === 10000) {
    ElMessage.success('已新增')
    emit('handle-submit')
  }
}
const handleDataProperty = () => {
  formData.codomainType = ''
}
// 表单提交
const submitForm = async(formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      if (Number(formData.codomainLower) > Number(formData.codomainUpper)) {
        ElMessage.error('上下限输入错误，上限不能小于下限')
        return
      }
      const params = {
        queueId: researchStore.curResearchQueueDetail.id,
        name: formData.name,
        nameEn: formData.nameEn,
        // indexTypeName: formData.indexTypeName,
        medicalMean: formData.medicalMean,
        codomainType: formData.codomainType,
        dataProperty: formData.dataProperty,
        indexPass: formData.indexPass,
        codomain: formData.codomainLower + '-' + formData.codomainUpper,
        indexSearchType: formData.IndexSearchType,
        enumOptionsString: formData.enumOptionsString,
        idxCategory: formData.idxCategory,
        inspectSource: formData.inspectSource
      }
      let res = ''
      if (formData.id) {
        res = await updatePrivateIndex({ ...params, id: formData.id })
        if (res.code === 10000) {
          ElMessage.success('已保存')
          steps.value = '0'
          getData('add')
        }
      } else {
        res = await addIndexData(params)
        if (res.code === 10000) {
          ElMessage.success('已新增')
          steps.value = '0'
          getData('add')
        }
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
const handleClose = () => {
  showDialog.value = false
  emit('handle-close')
}
const handleCloseFrom = () => {
  steps.value = '0'
  formData.id = ''
}
const handleBack = () => {
  steps.value = '1'
}

// 创建指标
const addType = () => {
  steps.value = '1'
  formData.id = ''
  formData.name = ''
  formData.nameEn = ''
  // formData.indexTypeName = ''
  formData.medicalMean = ''
  formData.codomainType = ''
  formData.dataProperty = ''
  formData.codomain = ''
  formData.codomainLower = ''
  formData.codomainUpper = ''
  formData.indexPass = []
  formData.IndexSearchType = ''
  formData.enumOptionsString = ''
  formData.idxCategory = 1
  formData.inspectSource = ''
  if (!allSourceList.value.length) {
    getSourceList()
  }
}
const allSourceList = ref([])
// 获取检验来源
const getSourceList = () => {
  sourceList({
    pageNum: 1,
    pageSize: 10000
  }).then(res => {
    if (res.code === 10000) {
      allSourceList.value = lodash.get(res.data, 'items', [])
    }
  })
}
// 加载时请求页面列表
const init = async() => {
  getData()
}
const editRow = (editRowObj) => {
  formData.id = editRowObj.id
  formData.name = editRowObj.name
  formData.nameEn = editRowObj.nameEn
  formData.medicalMean = editRowObj.medicalMean
  formData.codomain = editRowObj.codomain
  formData.dataUnit = editRowObj.dataUnit
  formData.codomainType = editRowObj.codomainType
  formData.multiNumFlag = editRowObj.multiNumFlag
  formData.IndexSearchType = editRowObj.indexSearchType
  formData.enumOptionsString = editRowObj.enumOptionsString
  if (editRowObj.codomain.startsWith('-')) {
    formData.codomainLower = -editRowObj.codomain.split('-')[1]
    formData.codomainUpper = editRowObj.codomain.split('-')[2]
  } else {
    formData.codomainLower = editRowObj.codomain.split('-')[0]
    formData.codomainUpper = editRowObj.codomain.split('-')[1]
  }
  formData.dataProperty = editRowObj.dataProperty
  formData.codomain = editRowObj.codomain
  formData.indexPass = editRowObj.indexPass
    ? editRowObj.indexPass.split(',').map(value => value.trim())
    : []
  formData.idxCategory = editRowObj.idxCategory
  formData.inspectSource = editRowObj.inspectSource
  if (!allSourceList.value.length) {
    getSourceList()
  }
  steps.value = '1'
}
// 删除
const deleteRow = async(row) => {
  ElMessageBox.confirm(
    `确认删除该指标吗？`,
    '删除指标',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const res = await deleteIndex({ id: row.id })
      if (res.code === 10000) {
        // const index = common.tableData.indexOf(row)
        // if (index !== -1) {
        //   common.tableData.splice(index, 1)
        // }
        getData('add')
        ElMessage.success('已删除')
      }
    })
}
init()
</script>
<style scoped lang="scss">
.editBtn {
  font-weight: 400;
  font-size: 14px;
  color: var(--theme-primary);
  &:hover {
    color: var(--theme-primary);
  }
}
.deleteBtn {
  font-weight: 400;
  font-size: 14px;
  color: #f76868;
  &:hover {
    color: #f76868;
  }
}
.addIP-dialogDIV {
  :deep(.addIP_Dialog) {
    display: flex;
    flex-direction: column;
    background: var(--theme-card);
    opacity: 1;
    .choiceIndex {
      .choiceTop {
        display: flex;
        justify-content: space-between;
        height: 44px;
        padding: 0;
        .left {
          span {
            display: block;
            display: flex;
            align-items: center;
            font-weight: 500;
            font-size: 14px;
            color: var(--theme-text);
          }
          i {
            display: block;
            width: 2px;
            height: 14px;
            margin-right: 8px;
            background: var(--theme-primary);
          }
        }
        .right {
          display: flex;
          .search {
            position: relative;
            margin-right: 10px;
            i {
              position: absolute;
              left: 10px;
              top: 3px;
              z-index: 1;
              font-size: 26px;
              color: var(--theme-text-3);
            }
            .el-input {
              width: 220px;
              height: 32px;
              border-radius: 1px;
              .el-input__wrapper {
                padding-left: 37px;
              }
            }
          }
          .rightTop {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 32px;
            .el-button {
              i {
                margin-right: 10px;
                font-size: 12px;
              }
            }
          }
        }
      }
      .choiceTable {
        display: flex;
        flex: 1;
        height: 0;
        .el-scrollbar {
          padding-right: 18px;
          border-right: 1px solid #e8e8e8;
        }
        .leftTab {
          width: 185px;
          padding: 0;
          li {
            display: flex;
            align-items: center;
            width: 167px;
            height: 32px;
            padding-left: 18px;
            cursor: pointer;
            line-height: 32px;
            i {
              display: inline-block;
              width: 5px;
              height: 5px;
              margin-right: 8px;
              border-radius: 50%;
              background: #d7d7d7;
            }
            span {
              overflow: hidden;
              max-width: 152px;
              text-overflow: ellipsis;
              font-weight: 400;
              font-size: 14px;
              color: var(--theme-text);
              white-space: nowrap;
            }
          }
          li:hover {
            background: rgba(54, 112, 248, 0.05);
            span {
              font-weight: 500;
              font-size: 14px;
              color: var(--theme-primary);
            }
            i {
              background: var(--theme-primary);
            }
          }
          li.active {
            background: rgba(54, 112, 248, 0.05);
            span {
              font-weight: 500;
              font-size: 14px;
              color: var(--theme-primary);
            }
            i {
              background: var(--theme-primary);
            }
          }
        }
        .rightTable {
          flex: 1;
          width: 0;
          margin-left: 18px;
          .el-scrollbar {
            padding-right: 0;
            border-right: none;
            .emptyImg {
              width: 116px;
              height: 112px;
              margin-bottom: 8px;
            }
          }
          .el-table {
            height: 100%;
            .el-table__header {
              th:nth-child(2) {
                .cell {
                  padding-left: 6px !important;
                }
              }
            }
          }
        }
      }
    }
    .el-form.addIP_DialogForm {
      .el-form-item {
        margin-bottom: 16px;
        .el-form-item__label {
          position: relative;
          justify-content: flex-end;
          min-width: 92px;
          line-height: 32px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text);
        }
        .el-form-item__label::before {
          color: #ff4e4e;
        }
        .el-form-item__content {
          // .el-input__wrapper,
          // .el-textarea {
          //   .el-input__count {
          //     top: 14px;
          //     height: 15px;
          //     font-size: 16px;
          //     color: var(--theme-text-3);
          //   }
          // }
          // .el-textarea__inner {
          //   height: 100%;
          //   padding: 10px 78px 0 14px;
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
    .creatSource {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex: 1;
      width: 100%;
      height: 100%;
      .addSource {
        width: 380px;
        height: 285px;
        border: 1px solid #d8d8d8;
        border-radius: 8px;
        background: var(--theme-fill);
        opacity: 1;
        cursor: pointer;
        line-height: 285px;
        text-align: center;
      }
    }
    .el-dialog__header {
      .my-header {
        h2 {
          margin: 0;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
          span {
            font-weight: 400;
          }
        }
      }
    }
    .el-dialog__title {
      line-height: 26px;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-text);
    }
    .el-dialog__close {
      color: #91b9cd;
    }
    .el-dialog__body {
      .choiceIndex {
        display: flex;
        overflow: hidden;
        flex-direction: column;
        height: 100%;
      }
    }
    .el-dialog__footer {
      position: relative;
      .dialog-footer {
        .stepBack {
          position: absolute;
          left: 26px;
        }
      }
    }
    .el-select {
      width: 100%;
    }
    .el-form-item__error {
      padding-left: 16px;
    }
  }
  :deep(.addIP_Dialog1) {
    height: 605px;
  }
  :deep(.addIP_Dialog2) {
    height: auto;
  }
}
.textareaWithScroll {
  height: 95px;
  :deep(.el-textarea__inner) {
    height: 100%;
  }
}
</style>
