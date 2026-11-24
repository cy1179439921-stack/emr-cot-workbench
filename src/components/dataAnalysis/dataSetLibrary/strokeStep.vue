<template>
  <div class="stroke-container">
    <p class="completedQuantity" v-show="active === 0" >已完成识别共<span> {{ completedQuantity }}</span>份数据量</p>
    <div class="content">
      <el-steps :active="active" align-center>
        <el-step title="纳排病历数据" description="筛选所需要的数据">
          <template #icon>
            <span class="custom-dot"></span>
          </template>
        </el-step>
        <el-step title="确认纳排病历" description="纳排病历大于0才可进行下一步">
          <template #icon>
            <span class="custom-dot"></span>
          </template>
        </el-step>
        <el-step title="纳排指标" description="纳排指标数必须大于0">
          <template #icon>
            <span class="custom-dot"></span>
          </template>
        </el-step>
        <el-step title="确认纳排数据" description="纳排数据量为0不支持新增">
          <template #icon>
            <span class="custom-dot"></span>
          </template>
        </el-step>
      </el-steps>
      <div v-show="active === 0" class="first-step">
        <el-form ref="ruleFormRef" :model="formLibraryData" class="new_DialogForm library-collection-form" :label-width="pxToRem(126)" :rules="rules">
          <el-form-item label="就诊类型：" prop="medicalRecordTypeList">
            <el-input value="住院" clearable disabled @submit.prevent></el-input>
          </el-form-item>
          <el-form-item label="治疗类型：" prop="healingTypeIdList">
            <el-select v-model="formLibraryData.healingTypeIdList" clearable placeholder="请选择一项" @submit.prevent>
              <el-option v-for="item in diseaseOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="手术编码/名称：" class="operationCodeList" prop="operationCodeList">
            <operationCodeSelect :multiple="true" isOperationCodeListLoaded v-model="formLibraryData.operationCodeList" collapse-tags-tooltip collapse-tags :max-collapse-tags="4" ></operationCodeSelect>
          </el-form-item>
          <el-form-item label="入院时间：" class="w100" prop="enterHospitalDateList" @submit.prevent>
            <!-- <AllDateSelect :clearable="true" v-model="formLibraryData.enterHospitalDateList" v-model:dateType="formLibraryData.enterType"></AllDateSelect> -->
            <el-date-picker v-model="formLibraryData.enterHospitalDateList" type="daterange" range-separator="-" :value-format="'YYYY-MM-DD'" start-placeholder="开始日期" end-placeholder="结束日期" />
          </el-form-item>
          <el-form-item label="出院时间：" class="w100" prop="exitHospitalDateList" @submit.prevent>
            <!-- <AllDateSelect :clearable="true" v-model="formLibraryData.exitHospitalDateList" v-model:dateType="formLibraryData.exitType"></AllDateSelect> -->
            <el-date-picker v-model="formLibraryData.exitHospitalDateList" type="daterange" range-separator="-" :value-format="'YYYY-MM-DD'" start-placeholder="开始日期" end-placeholder="结束日期" />
          </el-form-item>
        </el-form>
      </div>
      <div v-show="active === 1" class="first-step second-step">
        <img class="logo" :src="myRequire('diyibulogo.png')" />
        <p>共筛选出病历<span>{{ sum }}</span>份</p>
      </div>
      <div v-show="active === 2" class="first-step third-step">
        <div class="tree-container">
          <div class="tree-header">
            <el-checkbox v-model="treeCheckedData.checked" :indeterminate="treeCheckedData.indeterminate" @change="handleCheckAllChange">
              全选，共{{treeCheckedData.dataNum}}项
            </el-checkbox>
          </div>
          <div class="tree-body">
            <CommonInput v-model="treeCheckedData.filterText" placeholder="搜索名称" class="search" clearable/>
            <el-scrollbar :height="pxToRem(160)">
              <el-tree
                ref="treeRef"
                :data="filterTreeData"
                :show-checkbox="true"
                node-key="label"
                check-on-click-node
                @check-change="handleCurrentChange"
                :filter-node-method="filterNode"
              />
            </el-scrollbar>
          </div>
        </div>
      </div>
      <div v-show="active === 3" class="first-step second-step">
        <img class="logo" :src="myRequire('diyibulogo.png')" />
        <p>纳排<span>{{ sum }}</span>份数据量，<span>{{ treeCheckedData.dataNum }}</span>列指标数</p>
      </div>
      <div v-if="active === 4" class="first-step five-step">
        <img class="logo" v-if="resultText === '更新成功'" :src="myRequire('caijichenggong.png')" />
        <img class="logo" v-else :src="myRequire('caijishibai.png')" />
        <p>{{ resultText }}</p>
      </div>
    </div>
    <div class="dialog-footer">
      <el-button class="prevBtn" @click="prev">上一步</el-button>
      <!-- <el-button class="nextBtn" :disabled="active === 1" v-if="active === 0 || active === 1" type="primary" @click="submitForm(ruleFormRef)">下一步</el-button> -->
      <el-button class="nextBtn" v-if="active < 4" :disabled="(active === 1 && parseInt(sum) === 0) || (active === 2 && treeCheckedData.dataNum === 0) || !completedQuantity" type="primary" @click="submitFormBtn(active)">下一步</el-button>
      <el-button class="confirmBtn" v-if="active === 4" type="primary" @click="handleUploadLibrary">确 定</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch, onMounted } from 'vue'
import lodash from 'lodash'
import { strokeField } from '@/components/dataAnalysis/dataSetLibrary/field.js'
import { diseaseOptions } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import { convertTimestampToDate } from '@/utils/utils'
import { getIncludeCaseCount } from '@/api/api_dataAnalysis.js'

const myRequire = (name) => new URL(`/src/assets/${name}`, import.meta.url).href
const emit = defineEmits('handlerStrokeData', 'handlerPrev')

const active = ref(0)
const sum = ref(0)
const resultText = ref('更新成功')
const completedQuantity = ref(0)

const ruleFormRef = ref(null) // 表单
const treeRef = ref(null) // 树

const treeCheckedData = reactive({ // 树选择数据
  checked: false,
  immediate: false,
  dataNum: 0,
  filterText: ''
})

const formLibraryData = reactive({ // 表单数据
})

const rules = {
  // medicalRecordTypeList: {
  //   required: true,
  //   message: '请选择就诊类型',
  //   trigger: 'blur'
  // },
  healingTypeIdList: {
    required: true,
    message: '请选择治疗类型',
    trigger: 'blur'
  }
  // operationCodeList: {
  //   required: true,
  //   message: '请选择手术编码/名称',
  //   trigger: 'blur'
  // }
}

const filterTreeData = computed(() => { // 根据治疗类型选择树数据
  if (formLibraryData.healingTypeIdList) {
    return strokeField.filter(item => item.restrict === 'all' || item.restrict.some(id => formLibraryData.healingTypeIdList === id))
  } else {
    return strokeField
  }
})

const filterTreeDataLength = computed(() => { // 树数据长度
  return filterTreeData.value.reduce((acc, cur) => {
    return acc + cur.children.length
  }, 0)
})

watch(() => treeCheckedData.filterText, (val) => { // 树搜索
  treeRef.value.filter(val)
})

const filterNode = (value, data) => { // 树搜索方法
  if (!value) return true
  return data.label.includes(value)
}

const handleCheckAllChange = (value) => { // 全选树
  treeCheckedData.checked = value
  treeCheckedData.indeterminate = false
  if (value) {
    const nodes = filterTreeData.value.reduce((acc, cur) => {
      return acc.concat(cur.children.map((item) => item.label))
    }, [])
    treeCheckedData.dataNum = filterTreeDataLength.value
    treeRef.value.setCheckedKeys(nodes, false)
  } else {
    treeCheckedData.dataNum = 0
    treeRef.value.setCheckedKeys([], false)
  }
}

const submitFormBtn = async () => {
  if (active.value === 0) {
    ruleFormRef.value.validate(async (valid) => {
      if (valid) {
        const getNumber = await getProgressData({ ...formLibraryData, healingTypeIdList: [formLibraryData.healingTypeIdList] })
        sum.value = getNumber?.count || 0
        active.value = 1
      }
    })
  } else if (active.value === 1) {
    active.value = 2
    nextTick(() => {
      handleCheckAllChange(true)
    })
  } else if (active.value === 2) {
    active.value = 3
  } else if (active.value === 3) {
    handleUploadLibrary()
  }
}

const handleCurrentChange = () => {
  const checkNodes = treeRef.value.getCheckedNodes(true)?.length || 0
  if (checkNodes === filterTreeDataLength.value) {
    treeCheckedData.checked = true
    treeCheckedData.indeterminate = false
    treeCheckedData.dataNum = checkNodes
  } else if (checkNodes > 0 && checkNodes < filterTreeDataLength.value) {
    treeCheckedData.checked = false
    treeCheckedData.indeterminate = true
    treeCheckedData.dataNum = checkNodes
  } else {
    treeCheckedData.checked = false
    treeCheckedData.indeterminate = false
    treeCheckedData.dataNum = 0
  }
}

const prev = () => {
  if (active.value === 0) {
    emit('handlerPrev')
    return
  }
  if (active.value !== 0) {
    active.value--
  }
}

const saveHandlerTreeData = () => {
  const cloneCheckedData = lodash.cloneDeep(filterTreeData.value)
  const indexList = []
  const treeLabelList = treeRef.value.getCheckedNodes(true).map(item => item.label)
  for (const key in cloneCheckedData) {
    const { label, children } = cloneCheckedData[key]
    const map = {}
    map.label = label
    map.children = children.filter(item => treeLabelList.includes(item.label))
    if (map.children.length > 0) {
      indexList.push(map)
    }
  }
  return indexList
}

const handleUploadLibrary = () => {
  emit('handlerStrokeData', {
    queueName: `脑卒中_${convertTimestampToDate(new Date().getTime(), true)}`,
    indexList: saveHandlerTreeData(),
    ...formLibraryData,
    healingTypeIdList: [formLibraryData.healingTypeIdList]
  })
}

// 获取识别数据量
const getProgressData = async (formData) => {
  const { data } = await getIncludeCaseCount({ ...formData })
  return data
}

const init = async () => {
  const data = await getProgressData()
  completedQuantity.value = data?.count || 0
}

onMounted(() => {
  init()
})
</script>

  <style lang="scss" scoped>
.stroke-container {
  .completedQuantity {
    margin-bottom: 16px;
    span {
      color: var(--theme-primary);
    }
  }
  :deep(.el-steps) {
    display: flex;
    align-items: center;
    width: 100%;
    height: 84px;
    margin-bottom: 12px;
    border-radius: 4px;
    background: rgba(54, 112, 248, 0.05);
    .el-step__icon {
      background: none;
    }
    .custom-dot {
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d8d8d8;
    }
    .el-step__head {
      .el-step__line {
        width: 90%;
        height: 1px;
        margin: 0 auto;
        background: #e8e8e8;
        .el-step__line-inner {
          border: 0;
        }
      }
      &.is-finish,
      &.is-process {
        .custom-dot {
          background: var(--theme-primary);
        }
      }
      &.is-finish {
        .el-step__line {
          background: var(--theme-primary);
        }
      }
    }
    .el-step__main {
      .el-step__title {
        margin-bottom: 2px;
        line-height: 22px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text);
      }
      .el-step__description {
        padding: 0;
        line-height: 16px;
        font-weight: 400;
        font-size: 11px;
        color: var(--theme-text-3);
        white-space: nowrap;
      }
    }
  }
  .first-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: 0 auto;
    margin-bottom: 20px;
    img {
      display: block;
      width: 46px;
      height: 51px;
    }
    p {
      margin: 0;
      line-height: 20px;
      text-align: center;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text);
    }
    .el-form {
      width: 100%;
      .w100 {
        :deep(.el-date-editor) {
          width: 100% !important;
        }
      }
    }
  }
  .second-step {
    margin: 97px 0;
    span {
      color: var(--theme-primary);
    }
    img {
      margin-bottom: 16px;
    }
  }
  .third-step {
    .tree-container {
      overflow: hidden;
      box-sizing: border-box;
      width: 100%;
      height: 266px;
      border: 1px solid #d8d8d8;
      border-radius: 2px 2px 2px 2px;
      .tree-header {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 20px;
        background: rgba(54, 112, 248, 0.05);
      }
      .tree-body {
        overflow: hidden;
        box-sizing: border-box;
        height: 100%;
        .search {
          padding: 10px 16px;
        }
        .el-scrollbar {
          padding: 0 10px;
        }
        :deep(.el-tree-node__content),
        :deep(.el-tree-node) {
          margin-bottom: 14px;
        }
      }
    }
  }
  .five-step {
    img {
      width: 50px;
      height: 50px;
      margin: 63px 0 8px 0;
    }
    p {
      line-height: 20px;
      font-weight: 500;
      font-size: 14px;
      color: var(--theme-text);
    }
  }
}
.dialog-footer {
  padding: 24px 0;
}
  </style>
