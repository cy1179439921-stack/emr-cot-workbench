<template>
  <div class="listDiv">
    <div class="tableStyle">
      <div class="main">
        <el-scrollbar>
          <h2><span></span>纳入标准</h2>
          <el-form ref="ruleFormRef" label-position="left" :model="formData" class="addIP_DialogForm" :class=" !editAble ? 'edit' : ''" :rules="rules" :show-message="editAble">
            <el-form-item label="医  院：" prop="agencyIdList">
              <div class="hospital-flag" v-if="!editAble">
                <div class="hospital-item" v-if="Array.isArray(formData.agencyName) && formData.agencyName.length > 0">
                  <div v-for="(item, index) in formData.agencyName.slice(0, 2)" :key="index" :class="[index === 1 ? 'last-flag' : '']" class="first-flag" :title="item">{{ item }}</div>
                  <el-popover :teleported="false" popper-class="card-more-popover" placement="bottom-start" width="auto" v-if="formData.agencyName.length > 2">
                    <template #reference>
                      <div class="more-flag">+{{ formData.agencyName.length - 2 }}</div>
                    </template>
                    <el-scrollbar>
                      <div v-for="(item, index) in formData.agencyName.slice(2)" :key="index" class="hospital-item">
                        <span>{{ item }}</span>
                      </div>
                    </el-scrollbar>
                  </el-popover>
                </div>
                <span v-else>-</span>
              </div>
              <el-select v-else multiple collapse-tags class="study_DialogTitle_input" placeholder="请选择..." v-model="formData.agencyIdList" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="agencyIdList" collapse-tags-tooltip>
                <el-option
                  v-for="item in hospitalData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="病  种：" prop="diseaseIdList">
              <div class="hospital-flag diseaseIdList-flag" v-if="!editAble">
                <div class="hospital-item" v-if="Array.isArray(formData.diseaseName) && formData.diseaseName.length > 0">
                  <div v-for="(item, index) in formData.diseaseName.slice(0, 3)" :key="index" :class="[index === 2 ? 'last-flag-diseaseIdList' : '']" class="first-flag-diseaseIdList" :title="item">{{ item }}</div>
                  <el-popover :teleported="false" popper-class="card-more-popover card-more-disease-popover" placement="bottom-start" width="auto" v-if="formData.diseaseName.length > 3">
                    <template #reference>
                      <div class="more-flag-diseaseIdList">+{{ formData.diseaseName.length - 3 }}</div>
                    </template>
                    <el-scrollbar>
                      <div v-for="(item, index) in formData.diseaseName.slice(3)" :key="index" class="hospital-item">
                        <span>{{ item }}</span>
                      </div>
                    </el-scrollbar>
                  </el-popover>
                </div>
                <span v-else>-</span>
              </div>
              <CommonMultiSelectWithSearch v-model="formData.diseaseIdList" :options="diseaseData" v-else/>
              <!-- <el-select v-else multiple collapse-tags class="study_DialogTitle_input" placeholder="请选择..." v-model="formData.diseaseIdList" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="diseaseIdList">
                <el-option
                  v-for="item in diseaseData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select> -->
            </el-form-item>
          </el-form>
          <rgpa class="rgpa1" ref="rgpaRef1" :menuList="treeSelectList.filter(item => !['就诊医院', '病种'].includes(item.name))" valueFileds="label" :isDisabled="!editAble" @fullScreen="(isFull) => fullScreen(isFull,1)"></rgpa>
          <h2><span></span>排除标准</h2>
          <rgpa class="rgpa2" ref="rgpaRef2" :menuList="treeSelectList.filter(item => !['就诊医院', '病种'].includes(item.name))" valueFileds="label" :isDisabled="!editAble" @fullScreen="(isFull) => fullScreen(isFull,2)"></rgpa>
        </el-scrollbar>
      </div>
      <div class="btnBoxDiv">
        <el-button @click="cancelBtn" v-if="editAble">取 消</el-button>
        <el-button
          type="primary"
          @click="!editAble ? editBtn() : submitForm()"
          class="data-btn"
          v-if="!props.needCheckPermission || props.hadPermissionList.includes('编辑纳入标准')">
          {{ editAble ? '保 存' : '修 改' }}
        </el-button>
      </div>
    </div>
    <CommonSteps v-if="isShow" v-model:isShow="isShow" :getProgressData="getProgressData" :storeInclusionCriteria="storeInclusionCriteria" @handle-close="isShow = false" @handle-submit="handleSubmit" @uploadLibrary="onUploadLibrary" />
  </div>
</template>

<script>
export default {
  name: 'InclusionCriteria'
}
</script>
<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { getInclusionCriteria, edirInclusionCriteria, getProgress, getMedicalRecordCount } from '@/api/api_research'
import { ElMessage } from 'element-plus'
import { useResearchStore } from '@/store/researchStore'
import CommonSteps from '@/components/common/commonSteps.vue'
import rgpa from '@/components/medicalRecord/components/rgpa.vue'
import { useTree } from '@/hooks/treeData.js'
import CommonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
const { initTreeData2 } = useTree(true, true)
const emit = defineEmits(['dataVal'])
const props = defineProps({
  hadPermissionList: {
    type: Array
  },
  needCheckPermission: {
    type: Boolean
  }
})
const rgpaHeight = reactive({
  height1: 290,
  height2: 290
})
const rgpaRef1 = ref(null)
const rgpaRef2 = ref(null)
const editAble = ref(false)
const isShow = ref(false)
const researchStore = useResearchStore()
const diseaseData = ref(researchStore.curResearchQueueDetail.diseaseDate)
const ruleFormRef = ref(null)
const rules = reactive({
  agencyIdList: [
    { required: true, message: '医院为必填项', trigger: 'blur' }
  ],
  diseaseIdList: [
    { required: true, message: '病种为必填项', trigger: 'blur' }
  ]
})
const formData = ref({
  agencyIdList: [],
  diseaseIdList: []
})

const treeSelectList = computed(() => {
  const collectedItems = initTreeData2.reduce((acc, item) => {
    if (item.codomainType !== undefined) {
      acc.push({ label: item.label, name: item.label, indexSearchType: item.type, codomainType: item.codomainType, id: item.id, enumOptionsString: item.EnumValues })
    }
    if (item.children && item.children.length > 0) {
      return acc.concat((function collect(items) {
        return items.reduce((accInner, itemInner) => {
          if (itemInner.codomainType !== undefined) {
            accInner.push({ label: itemInner.label, name: itemInner.label, indexSearchType: itemInner.type, codomainType: itemInner.codomainType, id: itemInner.id, enumOptionsString: itemInner.EnumValues })
          }
          if (itemInner.children && itemInner.children.length > 0) {
            return accInner.concat(collect(itemInner.children))
          }
          return accInner
        }, [])
      })(item.children))
    }
    return acc
  }, [])
  return collectedItems
})

const hospitalData = computed(() => {
  return treeSelectList.value.find(item => item.name === '就诊医院')?.enumOptionsString || []
})

const fullScreen = (isFull, index) => {
  if (index === 1) {
    rgpaHeight.height1 = isFull ? 290 : 620
    nextTick(() => {
      rgpaRef1.value.layout()
    })
  } else {
    rgpaHeight.height2 = isFull ? 290 : 620
    nextTick(() => {
      rgpaRef2.value.layout()
    })
  }
}

// 获取数据
const getData = async() => {
  const params = {
    queueId: researchStore.curResearchQueueDetail.id
  }
  const res = await getInclusionCriteria(params)
  if (res.code === 10000) {
    emit('dataVal', {
      medicalSum: res.data.medicalSum,
      patientSum: res.data.patientSum
    })
    const { agencyList, diseaseList, includeCondition, excludeCondition } = res?.data || {}
    const agencyListArr = Array.isArray(agencyList) ? agencyList : []
    const diseaseListArr = Array.isArray(diseaseList) ? diseaseList : []
    const reactiveData = reactive({
      agencyIdList: agencyListArr.map(item => item.id),
      diseaseIdList: diseaseListArr.map(item => item.id),
      agencyName: agencyListArr.map(item => item.name),
      diseaseName: diseaseListArr.map(item => item.name)
    })
    if (includeCondition) {
      rgpaRef1.value.reduction(includeCondition)
    } else {
      rgpaRef1.value.resetData()
    }
    if (excludeCondition) {
      rgpaRef2.value.reduction(excludeCondition)
    } else {
      rgpaRef2.value.resetData()
    }
    formData.value = reactiveData
  }
}

const cancelBtn = async () => {
  editAble.value = false
  isShow.value = false
  getData()
}

const handleSubmit = async() => {
  editAble.value = false
}

const editBtn = async () => {
  // 编辑模式下的自定义逻辑，例如检查或初始化数据
  const params = {
    id: researchStore.curResearchQueueDetail.id
  }
  const res = await getProgress(params)
  if (res.code === 10000) {
    if (res.data.taskFlag) {
      ElMessage.error('指标提取中请稍后再试')
    } else {
      editAble.value = true
    }
  }
}

const submitForm = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      const isCondition1 = rgpaRef1.value.whetherTheConditionsAreMet('纳入标准未满足查询条件，请检查后再提交')
      const isCondition2 = rgpaRef2.value.whetherTheConditionsAreMet('排除标准未满足查询条件，请检查后再提交')
      if ((isCondition1 && isCondition2)) {
        isShow.value = true
      }
    }
  })
}

// 点击第一个下一步，获取病历数量
const getProgressData = async() => {
  const params = {
    id: researchStore.curResearchQueueDetail.id,
    agencyIdList: formData.value.agencyIdList,
    diseaseIdList: formData.value.diseaseIdList,
    includeCondition: rgpaRef1.value.getData(),
    excludeCondition: rgpaRef2.value.getData()
  }
  const res = await getMedicalRecordCount(params)
  if (res.code === 10000) {
    return res.data
  }
}

// 点击第二个下一步， 存储纳入条件
const storeInclusionCriteria = async() => {
  // 更新参数并调用 API
  const params = {
    id: researchStore.curResearchQueueDetail.id,
    agencyIdList: formData.value.agencyIdList,
    diseaseIdList: formData.value.diseaseIdList,
    includeCondition: rgpaRef1.value.getData(),
    excludeCondition: rgpaRef2.value.getData()
  }
  const res = await edirInclusionCriteria(params)
  if (res.code === 10000) {
    getData()
  }
}

const onUploadLibrary = () => {
  ElMessage.success('纳入标准已修改')
  editAble.value = false
}

getData()
</script>

<style scoped lang="scss">
.listDiv {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .tableStyle {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    height: 0;
    border-radius: 8px;
    background-color: var(--theme-card);
    .main {
      overflow: hidden;
      flex: 1;
      box-sizing: border-box;
      width: 100%;
      padding: 24px;
      h2 {
        display: flex;
        align-items: center;
        margin: 0;
        line-height: 22px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
        span {
          display: block;
          width: 2px;
          height: 15px;
          margin-right: 6px;
          background: var(--theme-primary);
        }
      }
      .rgpa1 {
        height: v-bind('pxToRem(rgpaHeight.height1)') !important;
        margin-bottom: 24px;
      }
      .rgpa2 {
        height: v-bind('pxToRem(rgpaHeight.height2)') !important;
        margin: 24px 0;
      }
    }
    .btnBoxDiv {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 55px;
      background: var(--theme-card);
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.1);
    }
  }
}
.addIP_DialogForm {
  display: flex;
  margin-top: 12px;
  .el-form-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    margin-bottom: 16px;
    padding: 0 25px 0 25px;
    border-radius: 8px;
    :deep(.el-form-item__label) {
      position: relative;
      justify-content: end;
      padding-right: 8px;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text);
    }
    :deep(.el-form-item__label::before) {
      position: absolute;
      left: -12px;
      color: #ff4e4e;
    }
    :deep(.el-form-item__content) {
      display: -webkit-box;
      display: flex;
      justify-content: flex-start;
      flex: none;
      flex: 1 1 auto;
      // height: 100%;
      line-height: 23px;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      text-align: right;
      font-weight: 400;
      font-size: 16px;
      color: var(--theme-text);
      -webkit-box-orient: vertical;
      .hospital-flag {
        .hospital-item {
          display: flex;
          align-items: center;
          .first-flag {
            overflow: hidden;
            // max-width: 100px;
            height: 29px;
            margin-right: 8px;
            padding: 0 8px;
            border-radius: 2px;
            background: rgba(85, 113, 223, 0.1);
            line-height: 29px;
            text-overflow: ellipsis;
            font-size: 14px;
            color: var(--theme-primary);
            white-space: nowrap;
          }
          .first-flag-diseaseIdList {
            overflow: hidden;
            // max-width: 70px;
            margin-right: 8px;
            padding: 0 8px;
            border-radius: 2px;
            background: rgba(247, 104, 104, 0.1);
            line-height: 29px;
            text-overflow: ellipsis;
            font-size: 14px;
            color: #f76868;
            white-space: nowrap;
          }
          // .last-flag-diseaseIdList{
          //   margin-right: 30px;
          // }
          .more-flag {
            width: 40px;
            height: 29px;
            border-radius: 2px;
            background: #eaf0fe;
            cursor: pointer;
            line-height: 29px;
            text-align: center;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-primary);
          }
          .more-flag-diseaseIdList {
            width: 40px;
            height: 29px;
            border-radius: 2px;
            background: var(--theme-fill);
            cursor: pointer;
            line-height: 29px;
            text-align: center;
            font-weight: 400;
            font-size: 14px;
            color: #ff4e4e;
          }
        }
      }
      .diseaseIdList -flag {
        .first-flag-diseaseIdList {
          background: rgba(247, 104, 104, 0.1);
          color: #f76868;
        }
      }
      .el-select,
      .el-input {
        width: 208px;
        // height: 40px;
        border: none;
        border-radius: 6px;
        background: var(--theme-fill) !important;
        opacity: 1;
        .el-select__tags-text {
          font-weight: 400;
          font-size: 12px;
          color: var(--theme-text);
        }
        .el-input__wrapper,
        .el-select__wrapper {
          height: 32px;
        }
      }
    }
  }
}
.el-popover.card-more-popover .hospital-item span {
  font-family: "San francisco", PingFangSC-Light, sans-serif;
}
</style>
<style>
.el-popper {
  max-width: 1768px;
}
</style>

