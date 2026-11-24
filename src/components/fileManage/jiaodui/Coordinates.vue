<template>
  <div class="proofreadMedical">
    <div class="viewContent">
      <header class="pdfHeader" @wheel.stop>
        <div class="goBack">
          <p @click="goBack">
            <i class="iconfont icon-zuo"></i>
            <span>返回</span>
          </p>
          <div class="item item1">
            <span class="title">就诊ID：</span>
            <span class="value">{{info?.medicalRecordId || '-'}}</span>
          </div>
          <div class="item">
            <span class="title">就诊医院：</span>
            <span class="value">{{info?.agencyName || '-'}}</span>
          </div>
          <div class="item diseaseItem">
            <span class="title">病种：</span>
            <div class="list-div">
              <template v-for="(item, index) in diseaseList" :key="index">
                <div class="tag" v-if="index < tagDiseaseCanShow1">{{item || '-'}}</div>
              </template>
              <el-popover :teleported="false" popper-class="card-more-popover card-more-disease-popover" placement="bottom" width="auto" v-if="diseaseList.length > tagDiseaseCanShow1">
                <template #reference>
                  <div class="tag more-flag">+{{ diseaseList.length - tagDiseaseCanShow1 }}</div>
                </template>
                <el-scrollbar>
                  <template v-for="(item, index) in diseaseList" :key="index">
                    <div class="hospital-item" v-if="index > tagDiseaseCanShow1 - 1">
                      <span>{{item || '-'}}</span>
                    </div>
                  </template>
                </el-scrollbar>
              </el-popover>
            </div>
          </div>
          <div class="item">
            <span class="title inHospitaDate">入院日期：</span>
            <span class="value">{{info?.enterHospitalDate || '-'}}</span>
          </div>
          <div class="item">
            <span class="title">患者总就诊次数：</span>
            <span class="value">{{ info.medicalNumber || '-' }}</span>
          </div>
        </div>
        <screenShot></screenShot>
      </header>
      <div class="content">
        <div class="contentTop" @wheel.stop>
          <ul class="topList">
            <li>
              <span>文件名：</span>
              <!-- <span>{{ info && info.id || '' }}</span> -->
              <span class="ellipsis" :title="info.fileName">{{ info.fileName || '-' }}</span>
            </li>
            <li>
              <span>患者ID：</span>
              <!-- <span>{{ info && info.patientId || '' }}</span> -->
              <span>{{ info.patientId || '-' }}</span>
            </li>
            <li>
              <span>就诊医院：</span>
              <span>{{ info && info.agencyName || '-' }}</span>
            </li>
            <li>
              <span>病种：</span>
              <div class="list-div">
                <template v-for="(item, index) in diseaseList" :key="index">
                  <div class="tag" v-if="index < tagDiseaseCanShow1">{{item || '-'}}</div>
                </template>
                <el-popover :teleported="false" popper-class="card-more-popover card-more-disease-popover" placement="bottom" width="auto" v-if="diseaseList.length > tagDiseaseCanShow1">
                  <template #reference>
                    <div class="tag more-flag">+{{ diseaseList.length - tagDiseaseCanShow1 }}</div>
                  </template>
                  <el-scrollbar>
                    <template v-for="(item, index) in diseaseList" :key="index">
                      <div class="hospital-item" v-if="index > tagDiseaseCanShow1 - 1">
                        <span>{{item || '-'}}</span>
                      </div>
                    </template>
                  </el-scrollbar>
                </el-popover>
              </div>
            </li>
            <li>
              <span>性别：</span>
              <span>{{ info && info.sex || '-' }}</span>
            </li>
            <li>
              <span>年龄：</span>
              <span>{{ info && info.age || '-' }}</span>
            </li>
          </ul>
        </div>
        <div class="contentMain">
          <div class="centerImg">
            <viewPDFPage ref="viewPDFPageDom" :renderTimes="renderTimes" :pdfUrl="pdfUrl" :fileName="info.fileName" v-if="pdfUrl" :defaultIsPdfValue="false" :isCoordinates="true" @changePage="getCoordinatesFn"/>
          </div>
          <div class="right" v-if="isCoordinates">
            <div class="valContainer">
              <el-scrollbar>
                <template v-for="(item,index) in valueList" :key="index">
                  <el-input class="valItem" v-model="item.text" @focus="handelFocus(item,index)"></el-input>
                </template>
              </el-scrollbar>
            </div>
            <div class="bottom">
              <div class="btn-div">
                <!-- <el-button type="primary" @click="editTable" v-if="!isEdit">编 辑</el-button> -->
                <!-- <el-button @click="editTable" v-if="isEdit">取 消</el-button> -->
                <el-button type="primary" @click="saveCoordinatesFn" >保 存</el-button>
              </div>
            </div>
          </div>
          <div class="right" @wheel.stop v-if="!isCoordinates">
            <div class="top">
              <div class="top-header">
                <div>结构化病历</div>
                <div class="allPage">
                  <span v-for="page in medicalStore.medicalPageList" :key="page">{{page + 1}}</span>
                </div>
              </div>
              <el-button type="primary" @click="createMedical" v-if="isEdit && ['checkupRecord', 'labCheck', 'imageExamination', 'pathology', 'surgeryRecord'].includes(curMedicalInfo?.component) && formCount < 200"><i class="iconfont icon-tianjiayihang"></i>新 建</el-button>
            </div>
            <div class="right-content" :class="{'editing': isEdit}">
              <el-scrollbar ref="scrollbarRef">
                <template v-for="item in medicalList" :key="item.id + '-' + renderTimes" >
                  <component ref="childComp" :is="compUrl" :medicalRecordId="fileId" :agencyName="info?.agencyName" :otherInfo="info" :curMedicalInfo="item" :isEdit="isEdit" mode="proofread"></component>
                </template>
              </el-scrollbar>
            </div>
            <div class="bottom">
              <div class="btn-div">
                <!-- <el-button type="primary" @click="editTable" v-if="!isEdit">编 辑</el-button> -->
                <!-- <el-button @click="editTable" v-if="isEdit">取 消</el-button> -->
                <el-button type="primary" @click="saveForm" >保 存</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Coordinates'
}
</script>
<script setup>
import router from '@/router'
import { ref, onUnmounted, onMounted, nextTick, watch, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import { getMedicalRecord, resetIdentify, resetGetFileStatus, updateMedicalRecordContent, getCoordinates, saveCoordinates } from '@/api/api_file'
import _ from 'lodash'
import medicalRecordHomePage from '@/components/medicalRecord/standardizedMedical/jiaodui/medicalRecordHomePage.vue'
import inHospitalRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/inHospitalRecord.vue'
import outHospitalRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/outHospitalRecord.vue'
import firstMedicalRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/firstMedicalRecord.vue'
import checkupRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/checkupRecord.vue'
import diagnosis from '@/components/medicalRecord/standardizedMedical/jiaodui/diagnosis.vue' // 术前小结 术后小结
import labCheck from '@/components/medicalRecord/standardizedMedical/jiaodui/labCheck.vue'
import imageExamination from '@/components/medicalRecord/standardizedMedical/jiaodui/imageExamination.vue'
import pathology from '@/components/medicalRecord/standardizedMedical/jiaodui/pathology.vue'
import surgeryRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/surgeryRecord.vue'
import doctorAdvice from '@/components/medicalRecord/standardizedMedical/jiaodui/doctorAdvice.vue'
import viewPDFPage from '@/components/common/viewPDFPage.vue'
import { getPagePermission } from '@/hooks/permissionHooks'
import { useMedicalStore } from '@/store/medicalStore'
import screenShot from './screenShot.vue'
import { echartsToPx } from '@/utils/utils.js'
const medicalStore = useMedicalStore()
const isCoordinates = ref(true)
// eslint-disable-next-line no-unused-vars
const { needCheckPermission, hadPermissionList } = getPagePermission('/fileManage/fileList')
const treeRef = ref(null)
const dialogVisible = ref(false)
const isReander = ref(false)
// 收集所有组件
const componentsObj = {}
// 创建一个上下文，导入指定文件夹内的所有Vue文件
const files = import.meta.glob('@/components/draggable/layoutContainer/viewComponents/*.vue')

Object.keys(files).forEach(async key => {
  const componentConfig = await files[key]()
  const componentName = key.split('/').pop().replace(/\.\w+$/, '')
  componentsObj[componentName] = componentConfig.default || componentConfig
})
const formRenderList = ref([])
const cloneRes = ref(null)
const cloneFormData = ref(null)
const route = useRoute()
const fileId = ref(null)
const pdfUrl = ref('')
const isEdit = ref(false)
const medicalList = ref([])
const childComp = ref(null)
const renderTimes = ref(0)
const scrollbarRef = ref(null)

const compUrl = shallowRef(null)
const boxWidth1 = ref(500)
const tagDiseaseCanShow1 = ref(1)
const diseaseList = ref([])
const handleBoxWidth1 = (list) => {
  let canShowCount = 1
  let width = 0
  list.forEach((item2, index2) => {
    if (width < boxWidth1.value) {
      const itemWidth = item2.length * 12 + 20
      width += itemWidth
      canShowCount = index2 + 1
      if (width > boxWidth1.value) {
        canShowCount = index2
      }
    }
  })
  return canShowCount
}
// eslint-disable-next-line no-unused-vars
const components = {
  medicalRecordHomePage,
  inHospitalRecord,
  outHospitalRecord,
  firstMedicalRecord,
  checkupRecord,
  diagnosis,
  labCheck,
  imageExamination,
  pathology,
  surgeryRecord,
  doctorAdvice
}

const info = ref({
  medicalRecordId: '',
  agencyName: '',
  diseaseName: '',
  enterHospitalDate: '',
  medicalNumber: '',
  fileName: '',
  patientId: '',
  sex: '',
  age: ''
})
const filterText = ref('')
watch(filterText, (val) => {
  treeRef.value.filter(val)
})
const medicalTypeList = ref([
  {
    title: '病历文书',
    icon: 'icon-bingliwenshu',
    id: '1',
    children: [
      {
        title: '病案首页',
        value: 'basic_information',
        component: 'medicalRecordHomePage',
        id: '1-1'
      },
      {
        title: '入院记录',
        value: 'enter_record',
        component: 'inHospitalRecord',
        id: '1-2'
      },
      {
        title: '出院记录',
        value: 'exit_record',
        component: 'outHospitalRecord',
        id: '1-3'
      },
      {
        title: '首次病程记录',
        value: 'course_record',
        component: 'firstMedicalRecord',
        id: '1-4'
      },
      {
        title: '查房记录',
        value: 'course_record',
        component: 'checkupRecord',
        id: '1-5'
        // count: 3
      },
      {
        title: '术前小结',
        value: 'course_record',
        component: 'diagnosis',
        id: '1-6'
      },
      {
        title: '术后小结',
        value: 'course_record',
        component: 'diagnosis',
        id: '1-7'
      }
    ]
  },
  {
    title: '实验室检查',
    value: 'inspections',
    icon: 'icon-shiyanshijiancha1',
    id: '3',
    component: 'labCheck'
    // count: 3
  },
  {
    title: '影像检查',
    value: 'image_reports',
    icon: 'icon-yingxiangjiancha',
    id: '4',
    component: 'imageExamination'
    // count: 3
  },
  {
    title: '病理',
    value: 'pathologies',
    icon: 'icon-bingli1',
    id: '5',
    component: 'pathology'
    // count: 3
  },
  {
    title: '手术记录',
    value: 'operations',
    icon: 'icon-shoushujilu',
    id: '6',
    component: 'surgeryRecord'
    // count: 3
  },
  {
    title: '医嘱',
    value: 'advices',
    icon: 'icon-yizhu',
    id: '7',
    component: 'doctorAdvice'
    // count: 3
  }
  }
])
medicalTypeList.value.forEach(item => {
  if (item.children) {
    item.childeIds = []
    item.children.forEach(v => {
      item.childeIds.push(v.id)
    })
  }
})
const checkDefault = ref([])
watch(checkDefault, (val) => {
  // treeRef.value.filter(val)
  nextTick(() => {
    if (medicalTypeList.value && medicalTypeList.value[0] && medicalTypeList.value[0].children?.length) {
      handleNodeClick(medicalTypeList.value[0].children[0])
    }
  })
})

// 重新识别
// eslint-disable-next-line no-unused-vars
const resetIdentifyBtn = async () => {
  const params = {
    medicalRecordId: fileId.value
  }
  const res = await resetIdentify(params)
  if (res.code === 10000) {
    dialogVisible.value = true
    setTimeout(() => {
      resetFileStatus()
    }, 1000)
  }
}

// 重新识别
const timerId = ref(null)
const resetFileStatus = () => {
  return new Promise((resolve, reject) => {
    const params = {
      medicalRecordId: fileId.value
    }
    const checkStatus = async () => {
      const res = await resetGetFileStatus(params)
      if ([10, 100].includes(res.data.structureRecognitionStatus)) {
        timerId.value = setTimeout(checkStatus, 15000)
      } else {
        clearTimeout(timerId.value)
        dialogVisible.value = false
        window.location.reload(true)
        ElMessage.success('重新识别完成!')
        resolve() // 解决 Promise
      }
    }
    checkStatus()
  })
}
// 编辑表格
// eslint-disable-next-line no-unused-vars
const editTable = () => {
  if (isEdit.value) {
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
      // 恢复旧数据
      if (curMedicalInfo.value.component === 'checkupRecord') {
        childComp.value[0].recoverOldData()
      }
      isEdit.value = false
      formRenderList.value = _.cloneDeep(cloneFormData.value)
      nextTick(() => {
        isReander.value = true
      })
    })
  } else {
    // 记住旧数据
    if (curMedicalInfo.value.component === 'checkupRecord') {
      childComp.value[0].saveOldData()
    }
    isEdit.value = true
  }
}
const activeId = ref(null)

const curMedicalInfo = ref(null)
const handleNodeClick = async (data) => {
  if (isEdit.value) {
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
      if (data.children) {
        return
      }
      isEdit.value = false
      renderTimes.value++
      curMedicalInfo.value = data
      compUrl.value = components[data.component]
      medicalList.value = [data]
      // activeId.value = data.index
      // treeRef.value?.setCurrentKey(activeId.value)
      activeId.value = data.id
      treeRef.value?.setCurrentKey(activeId.value)
    })
  } else {
    if (data.children) {
      return
    }
    renderTimes.value++
    curMedicalInfo.value = data
    medicalStore.setEditingMedical('')
    compUrl.value = components[data.component]
    medicalList.value = [data]
    activeId.value = data.id
    treeRef.value?.setCurrentKey(activeId.value)
  }
}

// 获取病历信息
const agencyId = ref(null)
const getMedicalAllData = async() => {
  const params = {
    medicalRecordId: fileId.value
  }
  const res = await getMedicalRecord(params)
  if (res.code === 10000) {
    info.value = {
      medicalRecordId: res.data.medicalRecordId,
      enterHospitalDate: res.data.enterHospitalDate,
      medicalNumber: res.data.medicalNumber,
      fileName: res.data.fileName,
      patientId: res.data.patientId,
      agencyName: res.data.agencyName,
      diseaseName: res.data.diseaseName,
      sex: res.data.sex,
      age: res.data.age
    }
    diseaseList.value = res.data.diseaseName ? res.data.diseaseName.split('；') : ['']
    tagDiseaseCanShow1.value = handleBoxWidth1(diseaseList.value)
    agencyId.value = res.data.agencyId
    pdfUrl.value = res.data.fileUrl
    cloneRes.value = _.cloneDeep(res.data.recordList)
    nextTick(() => {
      if (medicalTypeList.value && medicalTypeList.value[0] && medicalTypeList.value[0].children?.length) {
        handleNodeClick(medicalTypeList.value[0].children[0])
      }
    })
  }
}

const init = async() => {
  if (route.query.fileId) {
    fileId.value = route.query.fileId
    // await getInfoData()
    await getMedicalAllData()
  }
}

const viewPDFPageDom = ref()
const valueList = ref([])
// eslint-disable-next-line no-unused-vars
const getCoordinatesFn = () => {
  getCoordinates({
    medicalRecordId: route.query.fileId,
    pageNum: viewPDFPageDom.value.currentPage
  }).then(res => {
    if (res.code === 10000) {
      valueList.value = res?.data || []
    }
  })
}

const handelFocus = (item, index) => {
  const frameDom = viewPDFPageDom.value.frameDom
  const canvas = document.querySelector('.vue-pdf-embed__page canvas')
  const canvasHeight = canvas.height
  const trueHeight = canvas.offsetHeight
  // 以 canvas 实际渲染高度与原始高度的比例来换算坐标（假设 x、y 等比例缩放）
  const scale = trueHeight / canvasHeight
  const left = canvas.offsetLeft
  const top = canvas.offsetTop
  // 根据缩放比例和 canvas 偏移计算最终位置与尺寸（坐标以左上角为原点）
  frameDom.style.left = `${left + echartsToPx(item.xmin * scale)}px`
  frameDom.style.top = `${top + echartsToPx(item.ymin * scale)}px`
  frameDom.style.width = `${echartsToPx((item.xmax - item.xmin) * scale)}px`
  frameDom.style.height = `${echartsToPx((item.ymax - item.ymin) * scale)}px`
  frameDom.style.display = 'block'
}
const saveCoordinatesFn = () => {
  saveCoordinates({
    medicalRecordId: route.query.fileId,
    pageNum: viewPDFPageDom.value.currentPage,
    content: valueList.value
  }).then(res => {
    if (res.code === 10000) {
      ElMessage.success('已保存')
    }
  })
}
onMounted(() => {
  init()
})

onUnmounted(() => {
  clearTimeout(timerId.value)
})

// 校对病历
const goBack = (item, index) => {
  // router.push({name: 'fileList'})
  router.go(-1)
}

// 保存
const saveForm = async () => {
  const validateResult = await (childComp.value[0].getValidateResult ? childComp.value[0].getValidateResult() : Promise.resolve(true))
  if (!validateResult) {
    return false
  }
  const editingMedical = childComp.value[0].getEditingMedicalContent()
  const params = {
    contentGroup: curMedicalInfo.value.value,
    medicalRecordId: fileId.value,
    content: editingMedical
  }
  updateMedicalRecordContent(params).then(res => {
    if (res.code === 10000) {
      ElMessage.success('已保存')
      childComp.value[0].getData()
      isEdit.value = false
      // cloneRes.value = _.cloneDeep(recordList)
    }
  })
}
// 滚动到底部
const scrollToBottom = () => {
  const scrollbar = document.querySelector('.proofreadMedical .right .el-scrollbar__view')
  if (scrollbar) {
    scrollbarRef.value.setScrollTop(scrollbar.offsetHeight)
  }
}
const formCount = ref(0) // 表单新建200个
// 新建病历
const createMedical = () => {
  formCount.value = childComp.value[0].addMedicalRecord()
  ElMessage.success('新建成功')
  nextTick(() => {
    scrollToBottom()
  })
}
</script>

<style scoped lang="scss">
@use '@/components/fileManage/jiaodui/proofreadMedicalJiaoDui.scss';
.centerImg {
  position: relative;
  margin-left: 0 !important;
}
.right {
  .valContainer {
    display: flex;
    overflow: hidden;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 16px;
    .valItem {
      width: calc(50% - 8px);
      margin-right: 16px;
      margin-bottom: 16px;
      &:nth-of-type(2n) {
        margin-right: 0;
      }
    }
  }
}

</style>
