<template>
  <div class="addIP-dialogDIV">
    <el-dialog class="addIP_Dialog"
               v-model="showDialog"
               :before-close="handleClose"
               :width="active === 0? pxToRem(740) : pxToRem(508)"
               :title="active === 0? '选取数据集' : '创建工程'"
               :class="active === 0? 'addIP_Dialog' : 'createEngineering_Dialog'">
      <div class="content">
        <div v-if="active === 0" class="first-step">
          <div class="title-box">
            <div class="search">
              <i class="iconfont icon-chaxun-sousuo"></i>
              <el-input type="text" v-model="filterText" @input="handleInput" placeholder="请填写文件名/数据集名" clearable />
            </div>
            <div class="rightTop">
              <el-button type="primary" @click="addType" v-if="!needCheckPermission || hadPermissionList.includes('新增')"><i class="iconfont icon-tianjiayihang"></i>新增数据集</el-button>
            </div>
          </div>
          <commonTable
            :row-class-name="isHidden"
            :data="filteredTree"
            row-key="key"
            :tree-props="{ children: 'children' }"
            :header-cell-style="{ background: '#FAFAFA' }"
            :expand-row-keys="expandKeys"
          >
            <el-table-column
              prop=""
              label="数据集"
              min-width="150"
            >
              <template v-slot="scope">
                <div class="chooseBox" v-if="scope.row.type === 2">
                  <el-radio
                    v-model="selectId"
                    :label="scope.row.id"
                    @change="rowClick(scope.row)"
                  >
                    <img class="radioImg" :src="myRequire('danxuan.png')" />
                    <span class="ellipsis" :title="scope.row.name">{{ scope.row.name }}</span>
                  </el-radio
                  >
                </div>
                <div class="chooseBox" v-else>
                  <p>
                    <img class="moreImg" :src="myRequire('duoceng.png')" />
                    <span class="ellipsis" :title="scope.row.name">{{ scope.row.name }}</span>
                  </p>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop=""
              label="数据量"
              min-width="50"
            >
              <template v-slot="scope">
                <span>
                  {{ scope.row.type === 1 ? '-' : (scope.row.totalRowNum || '-') }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop=""
              label="变量数"
              min-width="50"
            >
              <template v-slot="scope">
                <span>
                  {{ scope.row.type === 1 ? '-' : (scope.row.totalColNum || '-') }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop=""
              label="创建时间"
              min-width="120"
            >
              <template v-slot="scope">
                <span>
                  {{ scope.row.createTime || '—' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop=""
              label="描述"
              min-width="120"
            >
              <template v-slot="scope">
                <span>
                  {{ scope.row.describe || '暂无描述' }}
                </span>
              </template>
            </el-table-column>
          </commonTable>
        </div>
        <div v-if="active === 1" class="first-step second-step">
          <el-form ref="ruleFormRef" :rules="rules" :model="formLibraryData" class="new_DialogForm library-collection-form" :label-width="pxToRem(60)" @submit.prevent>
            <el-form-item label="名称" prop="name">
              <el-input v-model="formLibraryData.name" maxlength="50" show-word-limit clearable placeholder="请填写内容" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="name"></el-input>
            </el-form-item>
            <el-form-item label="描述" prop="describe" style="margin-bottom: 0;">
              <el-input type="textarea" maxlength="60" show-word-limit v-model="formLibraryData.describe" clearable placeholder="请填写内容" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="confirmBtn" v-if="active === 0" @click="handleClose">取 消</el-button>
          <el-button class="prevBtn" v-if="active === 1" @click="prev">上一步</el-button>
          <el-button class="nextBtn" v-if="active === 0" type="primary" @click="nextStep">下一步</el-button>
          <!-- <el-button class="confirmBtn" v-if="active === 1" type="primary" @click="submitForm(ruleFormRef)">确 定</el-button> -->
          <loading-btn
            ref='loadingBtnDom'
            v-if="active === 1"
            @handleSubmit="submitForm(ruleFormRef)">
            确&nbsp;定
          </loading-btn>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: 'NewEngineering'
})
import { ref, reactive } from 'vue'
// import { projectData } from './data.js'
import CommonTable from '../../common/commonTable.vue'
import { createEngineerLibrary, getDatasetList } from '@/api/api_dataAnalysis'
import { ElMessage } from 'element-plus'
import lodash from 'lodash'
const myRequire = (name) => new URL(`/src/assets/${name}`, import.meta.url).href
import { useAnalysisStore } from '@/store/analysisStore.js'
import { getPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/dataAnalysis/dataSetLibrary')
const analysisStore = useAnalysisStore()
const active = ref(0)
const ruleFormRef = ref(null)
const selectId = ref('')
const filterText = ref('')
const expandKeys = ref([])
const filteredTree = ref([])
const initData = ref([])
const emit = defineEmits(['handle-close', 'updateList', 'header-click'])
const showDialog = ref(false)
const open = () => {
  showDialog.value = true
}
open()

// const projectData = props.allData
const formLibraryData = ref({
  name: '',
  describe: ''
})
const rules = reactive({
  name: [{ required: true, message: '请填写', trigger: 'blur' }]
})

const datasetTable = (data) => {
  function recursion(recursionData) {
    for (const item of recursionData || []) {
      item.key = Number(lodash.uniqueId(''))
      if (item.project_list && item.project_list.length) {
        item.children = item.children.concat(item.project_list)
      }

      if (item.children && item.children.length) {
        recursion(item.children)
      }
    }
  }
  recursion(data)
  return data
}

const getTreeData = async () => {
  const res = await getDatasetList({ type: 2 })
  if (res.code === 10000) {
    filteredTree.value = res.data
    initData.value = res.data
  }
  if (filteredTree.value.length > 0) {
    filteredTree.value = datasetTable(filteredTree.value)
    initData.value = datasetTable(initData.value)
  }
}

const isHidden = (it) => {
  if (it.row && it.row.status === 0) {
    return 'processingRow'
  }
  return ''
}

const rowClick = (row) => {
  if (!row.id) return
  selectId.value = row.id
}

const handleClose = () => {
  showDialog.value = false
  emit('handle-close')
}
// 新增工程
const loadingBtnDom = ref()
const submitForm = async(formEl) => {
  if (!formEl) {
    return
  }
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      const params = {
        name: formLibraryData.value.name,
        describe: formLibraryData.value.describe,
        dataSetId: selectId.value,
        type: 2,
        pid: analysisStore.pid || 0
      }
      const res = await createEngineerLibrary(params)
      if (res.code === 10000) {
        ElMessage.success('创建成功')
        handleClose()
        emit('updateList', res.data)
      } else {
        ElMessage.error('创建失败')
      }
    } else {
      console.log('aaa', loadingBtnDom.value)
      loadingBtnDom.value.handleLoading()
      console.log('error submit!', fields)
    }
  })
}

const nextStep = async () => {
  console.log(analysisStore.pid, 'analysisStore')
  console.log(selectId.value, 'nextStep')
  if (!selectId.value) {
    ElMessage.error('请选取数据集')
    return
  }
  active.value = 1
}
const prev = async () => {
  active.value = 0
}

const addType = () => {
  emit('header-click', { name: '新增数据集' })
}

// const handleInput = (val) => {
//   filterText.value = val
//   const newArr = lodash.filter(initData.value, (item) => {
//     return item.name.includes(filterText.value)
//   })
//   filteredTree.value = newArr || []
// }
const handleInput = (val) => {
  filterText.value = val
  const filterTree = (nodes, keyword) => {
    // 遍历节点并过滤
    return nodes
      .map((node) => {
        // 深拷贝节点，防止影响原始数据
        const newNode = { ...node }
        // 递归过滤子节点
        if (newNode.children) {
          newNode.children = filterTree(newNode.children, keyword)
        }
        // 如果当前节点或其子节点符合条件，保留节点
        if (newNode.name.includes(keyword) || (newNode.children && newNode.children.length > 0)) {
          return newNode
        }
        // 如果当前节点及其子节点均不符合条件，剔除节点
        return null
      })
      .filter(Boolean) // 移除 null 值
  }
  filteredTree.value = filterTree(initData.value, filterText.value)
}

const init = () => {
  console.log(111)
  getTreeData()
}

init()

defineExpose({
  getTreeData
})
</script>

<style lang="scss" scoped>
:deep(.addIP_Dialog) {
  .first-step {
    .title-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      .search {
        position: relative;
        width: 230px;
        .iconfont {
          position: absolute;
          left: 13px;
          top: 3px;
          z-index: 10;
          font-size: 24px;
          color: var(--theme-text-3);
        }
        .el-input {
          width: 100%;
          .el-input__wrapper {
            padding: 0 !important;
            .el-input__inner {
              padding-left: 36px;
            }
            .el-input__suffix {
              padding-right: 5px;
            }
          }
        }
      }
      .rightTop {
        i {
          padding-right: 10px;
          font-size: 12px;
        }
      }
    }
    .el-table {
      .el-table__body-wrapper {
        img {
          margin: 0 8px 0 0;
        }
        .moreImg {
          width: 18px;
          height: 16px;
        }
        .el-radio__label {
          display: flex;
          overflow: hidden;
          align-items: center;
          .radioImg {
            width: 18px;
            height: 18px;
            margin-left: 9px;
          }
        }
        .chooseBox {
          overflow: hidden;
          p {
            display: flex;
            align-items: center;
          }
          .ellipsis {
            display: inline-block;
            overflow: hidden;
            max-width: 100%; /* 自动适应宽度 */
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .el-radio {
            overflow: hidden;
            width: 100%;
          }
        }
      }
    }
  }
  .el-form {
    .el-form-item {
      .el-form-item__label {
        justify-content: flex-start;
      }
    }
    .el-form-item:nth-child(2) {
      .el-form-item__label {
        padding-left: 10px;
      }
    }
  }
  .el-dialog__body {
    height: 446px;
    .content {
      height: 100%;
      .first-step {
        display: flex;
        flex-direction: column;
        height: 100%;
        .commonTable {
          .el-table__placeholder {
            width: auto;
          }
        }
      }
    }
  }
}
:deep(.createEngineering_Dialog) {
  .el-dialog__body {
    height: auto;
  }
}
</style>
