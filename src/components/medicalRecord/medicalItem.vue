<template>
  <div class="medicalItem">
    <div class="contentTop">
      <div class="info">
        <p @click="goBack" v-if="data?.routerName">
          <i class="iconfont icon-zuo"></i>
          <span>返回</span>
        </p>
        <div class="item item1">
          <span class="title title1">就诊ID：</span>
          <span class="value">{{patientInfo?.medicalRecordId || '-'}}</span>
        </div>
        <div class="item">
          <span class="title">文件ID：</span>
          <span class="value">{{patientInfo?.fileId || '-'}}</span>
        </div>
        <div class="item">
          <span class="title">就诊医院：</span>
          <span class="value">{{patientInfo?.agencyName || '-'}}</span>
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
          <span class="title">入院日期：</span>
          <span class="value">{{patientInfo?.enterHospitalDate || '-'}}</span>
        </div>
        <div class="item">
          <span class="title">患者总就诊次数：</span>
          <span class="value">{{ patientInfo.medicalNumber || '-' }}</span>
        </div>
      </div>
      <div class="switch" @click="toPatiendPage" v-if="!userStore.needCheckPermission || hadPermissionList.includes('患者主页')">
        <!-- <i class="iconfont icon-qiehuan"></i> -->
        <span>患者主页</span>
      </div>
    </div>
    <div class="paientInfo">
      <div class="info info2">
        <div class="item">
          <span class="title">患者ID：</span>
          <span class="value">{{ patientInfo.patientId || '-' }}</span>
        </div>
        <div class="item">
          <span class="title">性别：</span>
          <span class="value">{{ patientInfo.sex || '-' }}</span>
        </div>
        <div class="item">
          <span class="title">年龄：</span>
          <span class="value">{{ patientInfo.age || '-' }}</span>
        </div>
        <div class="item">
          <span class="title">出生日期：</span>
          <span class="value">{{ patientInfo.birthDate || '-' }}</span>
        </div>
        <div class="item">
          <span class="title">婚姻状况：</span>
          <span class="value">{{ patientInfo.marital || '-' }}</span>
        </div>
        <div class="item">
          <span class="title">职业：</span>
          <span class="value">{{ patientInfo.occupation || '-' }}</span>
        </div>
      </div>
      <div class="line" v-if="!userStore.needCheckPermission || hadPermissionList.includes('就诊详情')">
        <div class="aiTitle" @click="isAiShow = true">
          <img :src="menuFoldLogo" class="logo"/>
          <span class="aiName">智脉大模型AI</span>
          <span>助理</span>
        </div>
      </div>
    </div>
    <div class="table">
      <div class="left" v-show="activeTab !== ''">
        <ul>
          <li
            v-for="item in filterTabs" :key="item.value"
            :class="{ active: activeTab === item.value }"
            @click="handleClickTab(item.value)"
          >
            <div>{{ item.label }}</div>
            <!-- <div class="bottomLine"></div> -->
          </li>
        </ul>
        <el-input
          :prefix-icon="Search"
          v-model="filterText"
          placeholder="搜索名称"
          class="searchText"
          clearable
        />
        <div class="treeMenu">
          <el-scrollbar>
            <el-tree
              class="tree-line"
              v-show="activeTab === 0"
              :data="medicalTypeList"
              :props="defaultProps"
              default-expand-all
              :filter-node-method="filterNode"
              :highlight-current="true"
              node-key="index"
              ref="treeRef"
              :expand-on-click-node="true"
              @node-click="handleNodeClick"
              :default-checked-keys="checkDefault">
              <template #default="{ data }">
                <div :class=" {'custom-tree-node':true,childrenActived:data.childeIds&&data.childeIds.includes(activeId),'actived':(data.id===activeId),childrenNode:!data.icon }">
                  <i :class="'iconfont'+' ' + data.icon" v-if="data.icon"></i>
                  <div :class="{customTxt:data.icon}" :title="data.title">{{ data.title }}</div>
                </div>
              </template>
            </el-tree>
            <el-tree
              v-show="activeTab === 1"
              :data="dataSource"
              :props="{ name: 'name', children: 'children' }"
              ref="tree"
              :indent="14"
              default-expand-all
              highlight-current
              draggable
              @node-click="nodeclick"
              :default-checked-keys="[defaultCheckedKey]"
            >
              <template
                #default="{ data }"
              >
                <div
                  class="categrtory"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    :content="data.name"
                    placement="top-start"
                    :open-delay="1000"
                  >
                    <div class="txt">{{ data.name }}</div>
                  </el-tooltip>
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
      </div>
      <div class="right">
        <header class="header">
          <div class="title">{{curMedicalInfo?.title}}</div>
          <div class="title-right" style="justify-content: flex-end;">
            <div class="label">关键词搜索</div>
            <el-input v-model="lightQuery" clearable placeholder="输入关键词，如姓名或工号" @input="handleLightQuery"></el-input>
            <el-button type="primary" @click="viewFile" v-if="data.medicalRecordType === 1">查看病历文件</el-button>
          </div>

        </header>
        <div class="right-content right-content1" v-show="activeTab === 0">
          <!-- <template v-if="isRender"> -->
          <el-scrollbar>
            <template v-for="item in medicalList" :key="item.id + '-' + renderTimes" >
              <!-- <template v-if="item.count">
                <template v-for="(c, cIndex) in item.count" :key="'c' + cIndex">
                  <component :is="compUrl" :medicalRecordId="data.id" :curMedicalInfo="item" :lightQuery="lightQuery" class="lastCom"></component>
                </template>
              </template> -->
              <component :is="compUrl" :medicalRecordId="data.id" :agencyName="patientInfo?.agencyName" :curMedicalInfo="item" :content="content" :lightQuery="lightQuery"></component>
            </template>
          </el-scrollbar>
          <!-- </template> -->
        </div>
        <div class="right-content" v-if="activeTab === 1">
          <indexDetails/>
        </div>
      </div>
      <div class="aiContent" v-if="isAiShow">
        <div class="closeBtn" @click="isAiShow = false">
          <img :src="close" alt="">
        </div>
        <PatientAI :medicalRecordId="patientInfo?.medicalRecordId"/>
      </div>
    </div>
    <pdfViews :pdfUrl="pdfUrl" v-model:isPdf='isPdf' :fileName="fileName" v-if="isPdf" ></pdfViews>
  </div>
</template>
<script setup>
import { ref, computed, watch, nextTick, onMounted, shallowRef, onActivated } from 'vue'
import { getMedicalRecord } from '@/api/api_file'
import { Search } from '@element-plus/icons-vue'
import { getQueueIndexGroupList } from '@/api/api_research'
// import materRender from '@/components/draggable/layoutContainer/materRender.vue'
// import { transformInspect } from '@/components/draggable/layoutContainer/viewComponents/config'
import indexDetails from '@/components/medicalRecord/indexDetails.vue'
import medicalRecordHomePage from '@/components/medicalRecord/standardizedMedical/medicalRecordHomePage.vue'
import inHospitalRecord from '@/components/medicalRecord/standardizedMedical/inHospitalRecord.vue'
import inHospitalRecord24h from '@/components/medicalRecord/standardizedMedical/inHospitalRecord24h.vue'
import outHospitalRecord from '@/components/medicalRecord/standardizedMedical/outHospitalRecord.vue'
import firstMedicalRecord from '@/components/medicalRecord/standardizedMedical/firstMedicalRecord.vue'
import otherMedicalRecord from '@/components/medicalRecord/standardizedMedical/otherMedicalRecord.vue'
import checkupRecord from '@/components/medicalRecord/standardizedMedical/checkupRecord.vue'
import diagnosis from '@/components/medicalRecord/standardizedMedical/diagnosis.vue' // 鉴别诊断 术前小结 术后小结
import labCheck from '@/components/medicalRecord/standardizedMedical/labCheck.vue'
import imageExamination from '@/components/medicalRecord/standardizedMedical/imageExamination.vue'
import pathology from '@/components/medicalRecord/standardizedMedical/pathology.vue'
import surgeryRecord from '@/components/medicalRecord/standardizedMedical/surgeryRecord.vue'
import doctorAdvice from '@/components/medicalRecord/standardizedMedical/doctorAdvice.vue'
import outFirstVisitMedicalRecord from '@/components/medicalRecord/standardizedMedical/outFirstVisitMedicalRecord.vue'
import physicalExamBasicInformation from '@/components/medicalRecord/standardizedMedical/physicalExamBasicInformation.vue'
import physicalExamLabCheck from '@/components/medicalRecord/standardizedMedical/physicalExamLabCheck.vue'
import physicalExamImageExamination from '@/components/medicalRecord/standardizedMedical/physicalExamImageExamination.vue'
import { useMedicalStore } from '@/store/medicalStore'
import projectLogo from '@/assets/ebondlogo.png'
import close from '@/assets/close.png'
import PatientAI from '@/components/AI/patientAI.vue'
const medicalStore = useMedicalStore()
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const userStore = useUserStore()
const router = useRouter()
const compUrl = shallowRef(null)
const isAiShow = ref(false)
const menuFoldLogo = ref(userStore.platInfo.menuFoldLogo || projectLogo)
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
  doctorAdvice,
  outFirstVisitMedicalRecord,
  physicalExamBasicInformation,
  physicalExamLabCheck,
  physicalExamImageExamination,
  inHospitalRecord24h,
  otherMedicalRecord
}
const medicalList = ref([])
const renderTimes = ref(0)
const lightQuery = ref('')
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/medicalRecord/medicalDetails' || item.url === '/medicalRecordLibrary' || item.url === '/AI') {
    hadPermissionList.value.push(item.name)
  }
})
const props = defineProps({
  data: {
    type: Object
  },
  type: {
    type: Number,
    default: 0
  }
})
const filterText = ref('')
// 收集所有组件
const componentsObj = {}
// 创建一个上下文，导入指定文件夹内的所有Vue文件
const files = import.meta.glob('@/components/draggable/layoutContainer/viewComponents/*.vue')

Object.keys(files).forEach(async key => {
  const componentConfig = await files[key]()
  const componentName = key.split('/').pop().replace(/\.\w+$/, '')
  componentsObj[componentName] = componentConfig.default || componentConfig
})
const treeList = ref([
  [
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
          title: '24小时入出院记录',
          value: 'admission_record',
          component: 'inHospitalRecord24h',
          id: '1-2'
        },
        {
          title: '入院记录',
          value: 'enter_record',
          component: 'inHospitalRecord',
          id: '1-3'
        },
        {
          title: '出院记录',
          value: 'exit_record',
          component: 'outHospitalRecord',
          id: '1-4'
        },
        {
          title: '病程记录',
          id: '1-5',
          children: [
            {
              title: '首次病程记录',
              value: 'course_record',
              component: 'firstMedicalRecord',
              id: '1-5-1'
            },
            {
              title: '其他病程记录',
              value: 'course_record',
              component: 'otherMedicalRecord',
              id: '1-5-2'
            },
            {
              title: '查房记录',
              value: 'course_record',
              component: 'checkupRecord',
              id: '1-5-3'
            },
            {
              title: '术前小结',
              value: 'course_record',
              component: 'diagnosis',
              id: '1-5-4'
            },
            {
              title: '术后小结',
              value: 'course_record',
              component: 'diagnosis',
              id: '1-5-5'
            }
          ]
        }
      ]
    },
    // {
    //   title: '时间轴',
    //   icon: 'icon-shijianzhou',
    //   id: '2'
    // },
    {
      title: '实验室检查',
      value: 'inspections',
      icon: 'icon-shiyanshijiancha1',
      id: '3',
      component: 'labCheck'
    },
    {
      title: '影像检查',
      value: 'image_reports',
      icon: 'icon-yingxiangjiancha',
      id: '4',
      component: 'imageExamination'
    },
    {
      title: '病理',
      value: 'pathologies',
      icon: 'icon-bingli1',
      id: '5',
      component: 'pathology'
    },
    {
      title: '手术记录',
      value: 'operations',
      icon: 'icon-shoushujilu',
      id: '6',
      component: 'surgeryRecord'
    },
    {
      title: '医嘱',
      value: 'advices',
      icon: 'icon-yizhu',
      id: '7',
      component: 'doctorAdvice'
    }
  // {
  //   title: '护理记录',
  //   value: 'basic_information',
  //   icon: 'icon-hulijilu',
  //   id: '7'
  // }
  ],
  [
    {
      title: '门急诊病历 (初诊)',
      value: 'basic_information',
      icon: 'icon-bingliwenshu',
      id: '101',
      component: 'outFirstVisitMedicalRecord'
    }
  ],
  [
    {
      title: '基础信息',
      value: 'basic_information',
      icon: 'icon-jichuxinxi',
      id: '201',
      component: 'physicalExamBasicInformation'
    },
    {
      title: '实验室检查',
      value: 'inspections',
      icon: 'icon-shiyanshijiancha1',
      id: '3',
      component: 'physicalExamLabCheck'
    },
    {
      title: '影像检查',
      value: 'image_reports',
      icon: 'icon-yingxiangjiancha',
      id: '4',
      component: 'physicalExamImageExamination'
    }
  ]
])
const medicalTypeList = ref(treeList.value[props.data.medicalRecordType - 1])

// 递归收集所有后代节点的 id
const collectDescendantIds = (node) => {
  let ids = []
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      ids.push(child.id)
      if (child.children) {
        ids = ids.concat(collectDescendantIds(child))
      }
    })
  }
  return ids
}

// 递归遍历树，为每个有 children 的节点添加 childeIds
const initChildeIds = (nodes) => {
  nodes.forEach(node => {
    if (node.children && node.children.length > 0) {
      node.childeIds = collectDescendantIds(node)
      initChildeIds(node.children)
    }
  })
}

// 初始化 childeIds
initChildeIds(medicalTypeList.value)
const dataSource = ref([])
const checkDefault = ref([])
// const formRenderList = ref([])
// const formList = ref([])
const activeId = ref(null)
const treeRef = ref(null)
const defaultCheckedKey = ref()
// const isRender = ref(false)
const defaultProps = {
  children: 'children',
  label: 'title'
}

// const filterNullFromRenderList = computed(() => {
//   return formRenderList.value.filter(item => item.data)
// })
const activeTab = ref(0)
const tabs = ref([
  {
    label: '医疗文书',
    value: 0
  }
  // {
  //   label: '病历指标',
  //   value: 1
  // }
])
const boxWidth1 = ref(300)
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
const toPatiendPage = () => {
  medicalStore.setCurPatientDetail({
    ...patientInfo.value,
    key: props.data.studyName + patientInfo.value.patientId,
    studyCohort: props.data.studyCohort,
    studyName: props.data.studyName,
    routerName: router.currentRoute.value.name
  })
  router.push({ name: 'patientHomePage' })
}
watch(filterText, (val) => {
  treeRef.value.filter(val)
})
watch(checkDefault, (val) => {
  // treeRef.value.filter(val)
  nextTick(() => {
    if (props.data.medicalRecordType === 1) {
      if (medicalTypeList.value && medicalTypeList.value[0] && medicalTypeList.value[0].children && medicalTypeList.value[0].children.length > 0) {
        handleNodeClick(medicalTypeList.value[0].children[0])
      }
    } else if (props.data.medicalRecordType === 2) {
      if (medicalTypeList.value && medicalTypeList.value[0]) {
        handleNodeClick(medicalTypeList.value[0])
      }
    }
  })
})
activeTab.value = props.type
if (userStore.needCheckPermission && hadPermissionList.value.includes('医疗文书') && !hadPermissionList.value.includes('病历指标')) {
  tabs.value = [tabs.value[0]]
  activeTab.value = 0
} else if (userStore.needCheckPermission && !hadPermissionList.value.includes('医疗文书') && hadPermissionList.value.includes('病历指标')) {
  tabs.value = [tabs.value[1]]
  if (props.data.studyCohort) {
    activeTab.value = 1
  } else {
    activeTab.value = ''
  }
} else if (userStore.needCheckPermission && !hadPermissionList.value.includes('医疗文书') && !hadPermissionList.value.includes('病历指标')) {
  tabs.value = []
  activeTab.value = ''
}
const filterTabs = computed(() => {
  return props.data.studyCohort ? tabs.value : tabs.value.filter(item => item.value === 0)
  // return tabs.value
})

watch(() => props.type, (val) => {
  activeTab.value = val
}, { deep: true })

const handleClickTab = (value) => {
  console.log(value)
  activeTab.value = value
}
const curMedicalInfo = ref(null)
// 每次打开这个页面激活
onActivated(() => {
  // 防止页面内容被校对修改
  if (curMedicalInfo.value) {
    handleNodeClick(curMedicalInfo.value)
  }
})
const handleNodeClick = async (data) => {
  // 判断是否为叶子节点（有 component 属性的才是叶子节点）
  const isLeafNode = data.component !== undefined

  activeId.value = data.id
  treeRef.value?.setCurrentKey(activeId.value)

  // 只有叶子节点才能触发加载
  if (!isLeafNode) {
    return
  }

  renderTimes.value++
  curMedicalInfo.value = data
  compUrl.value = components[data.component]
  medicalList.value = [data]
  activeId.value = data.id
  treeRef.value?.setCurrentKey(activeId.value)
}

const patientInfo = ref({
  medicalRecordId: '',
  agencyName: '',
  diseaseName: '',
  enterHospitalDate: '',
  medicalNumber: '',
  patientId: '',
  sex: '',
  age: '',
  birthDate: '',
  marital: '',
  occupation: '',
  fileUrl: '',
  fileName: ''
})
const content = ref({})
// 赋值患者信息
// const updatePatientInfo = (data) => {
//   patientInfo.value = data
//   console.log('patientInfo.value', patientInfo.value)
// }

const getData = async() => {
  const params = {
    medicalRecordId: props.data.id,
    queueId: props.data.studyCohort
  }
  const res = await getMedicalRecord(params)
  patientInfo.value = res.data
  diseaseList.value = res.data.diseaseName ? res.data.diseaseName.split('；') : ['']
  tagDiseaseCanShow1.value = handleBoxWidth1(diseaseList.value)
  const queueList = props.data.studyCohort ? await getQueueIndexGroupList({ queueId: props.data.studyCohort }) : '' // 910688081689055232
  if (queueList.code === 10000) {
    dataSource.value = queueList.data
    defaultCheckedKey.value = dataSource.value[0].id
  }
}
const nodeclick = (value) => {
  defaultCheckedKey.value = value.id
  console.log(defaultCheckedKey.value)
}

// 返回
const goBack = () => {
  router.back()
}
const filterNode = (value, data, node) => {
  if (!value) return true
  // 首先筛选目标节点，打上filterFlag来区分是否要显示该节点
  data.filterFlag = data.title.includes(value)
  // 然后给子节点赋上父节点的filterFlag
  // 加上!data.filterFlag判断是为了防止上一行执行完了再进来重复执行
  if (!data.filterFlag && node.level > 1) {
    data.filterFlag = node.parent.data.filterFlag
  }
  return data.filterFlag
}
const pdfUrl = ref('')
const isPdf = ref(false)
const fileName = ref('')
// 查看文件
const viewFile = () => {
  // 暂无文件
  if (!patientInfo.value.fileUrl) {
    ElMessage.warning('该就诊无原始病历文件')
    return false
  }
  pdfUrl.value = ''
  // 如果是开发环境
  if (process.env.NODE_ENV === 'development') {
    pdfUrl.value = `http://192.168.43.162:9000${patientInfo.value.fileUrl.replace('/minio', '')}`
  } else {
    pdfUrl.value = `${window.location.origin}/${patientInfo.value.fileUrl}`
  }
  fileName.value = patientInfo.value.fileName
  if (pdfUrl.value) {
    isPdf.value = true
  }
}
onMounted(() => {
  getData() // 获取数据
  // if (activeTab.value === 1) {
  //   getData()
  // } else {
  if (props.data.medicalRecordType === 1) {
    if (medicalTypeList.value && medicalTypeList.value[0] && medicalTypeList.value[0].children && medicalTypeList.value[0].children.length > 0) {
      handleNodeClick(medicalTypeList.value[0].children[0])
    }
  } else if (props.data.medicalRecordType === 2 || props.data.medicalRecordType === 3) {
    if (medicalTypeList.value && medicalTypeList.value[0]) {
      handleNodeClick(medicalTypeList.value[0])
    }
  }
  // }
})
const handleLightQuery = () => {
  nextTick(() => {
    console.log(111)
    const mark = document.querySelector('mark')
    // 获取mark的位置,并让滚动条滚动到该位置
    if (mark) {
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' }) // 平滑滚动到mark位置，居中显示
    }
  })
}
</script>
<style scoped lang="scss">
.searchText {
  width: auto;
  margin: 0 16px;
}
.medicalItem {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 100%;
  // background: var(--theme-fill);
  .contentTop {
    display: flex;
    overflow-x: auto;
    justify-content: space-between;
    align-items: center;
    flex-basis: 48px;
    box-sizing: border-box;
    padding: 0 24px 0 8px;
    background: var(--theme-card);
    color: var(--theme-text);
    >span {
      padding-right: 15px;
      cursor: pointer;
      color: #429fff;
    }
    .switch {
      display: flex;
      align-items: center;
      margin-left: 40px;
      cursor: pointer;
      white-space: nowrap;
      i {
        font-size: 32px;
      }
      span {
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-primary);
      }
    }
  }
  .paientInfo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-basis: 56px;
    margin: 16px;
    padding: 0 26px;
    border-radius: 8px;
    background: var(--theme-card);
  }
  .info {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    align-items: center;
    flex: 1;
    margin-right: 16px;
    &.info2 {
      .item:nth-child(1) {
        margin-left: 0;
      }
    }
    // .span {
    //   display: inline-block;
    //   line-height: 20px;
    //   font-weight: 400;
    //   font-size: 14px;
    //   color: var(--theme-text);
    //   white-space: nowrap;
    // }
    p {
      margin: 0;
    }
    p:nth-child(1) {
      display: flex;
      align-items: center;
      height: 20px;
      padding-right: 16px;
      border-right: 1px solid #cbcfdc;
      cursor: pointer;
      .iconfont {
        display: block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        font-size: 32px;
        color: var(--theme-primary);
      }
      span {
        display: block;
        margin-left: -5px;
        line-height: 32px;
        font-weight: 400;
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }
    .item {
      margin-left: 40px;
      &.diseaseItem {
        display: flex;
        // flex: 1;
        .list-div {
          display: flex;
          .tag {
            display: flex;
            align-items: center;
            height: 20px;
            margin-right: 4px;
            padding: 0 8px;
            border-radius: 2px;
            background: #ff4e4e1a;
            font-size: 12px;
            color: #ff4e4e;
          }
          .tag-hospital {
            background: rgba(247, 104, 104, 0.1);
            color: #ff4e4e;
          }
          .more-flag {
            margin-right: 0;
            background: rgba(255, 78, 78, 0.1);
            cursor: pointer;
            color: #ff4e4e;
          }
        }
      }
    }
    .item1 {
      margin-left: 16px;
    }
    .diseaseName {
      display: inline-block;
      overflow: hidden;
      max-width: 240px;
      height: 20px;
      margin-right: 8px;
      padding: 0 8px;
      border-radius: 2px;
      background: rgba(255, 78, 78, 0.1);
      line-height: 20px;
      text-overflow: ellipsis;
      font-size: 12px;
      color: #ff4e4e;
      white-space: nowrap;
    }
    .value {
      display: inline-block;
      line-height: 20px;
      white-space: nowrap;
    }
    .diseaseName {
      display: inline-block;
      overflow: hidden;
      max-width: 240px;
      margin-right: 8px;
      padding: 2px 5px;
      border-radius: 4px;
      background: rgba(247, 104, 104, 0.1);
      text-overflow: ellipsis;
      color: #f76868;
      white-space: nowrap;
    }
    &.info2 {
      .title:first-child {
        margin-left: 0;
      }
      .title,
      .value {
        color: #646464;
      }
    }
  }
  .line,
  .aiTitle {
    display: flex;
    align-items: center;
  }
  .aiTitle {
    justify-content: center;
    width: 197px;
    height: 37px;
    border-radius: 18px;
    background: linear-gradient(111deg, #ebf0ff 0%, #efebff 100%);
    cursor: pointer;
    user-select: none;
    .logo {
      width: 14px;
      margin-right: 10px;
    }
    span {
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
    .aiName {
      color: var(--theme-primary);
    }
  }
  .table {
    display: flex;
    overflow: hidden;
    flex: 1;
    margin: 0 16px 16px 16px;
    .left {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      width: 258px;
      height: 100%;
      margin-right: 16px;
      border-radius: 8px;
      background: rgba(255, 255, 255);
      ul {
        overflow: hidden;
        // display: flex;
        box-sizing: border-box;
        width: 100%;
        height: 56px;
        font-size: 14px;
        li {
          display: flex;
          float: left;
          flex-direction: column;
          flex: 1;
          box-sizing: border-box;
          width: 50%;
          margin: 18px 0;
          padding-left: 24px;
          cursor: pointer;
          font-weight: 500;
          font-size: 16px;
          // color: var(--theme-text);
          .bottomLine {
            width: 70px;
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
      :deep(.el-input) {
        .el-input__wrapper {
          .el-input__icon {
            font-size: 14px;
            color: var(--theme-text-3);
          }
          .el-input__inner {
            font-size: 14px;
            &::placeholder {
              color: var(--theme-text-3);
            }
          }
        }
      }
      .treeMenu {
        overflow: hidden;
        flex: 1;
        :deep(.el-tree-node__expand-icon.expanded) {
          position: absolute;
          right: 8px;
          transform: rotate(90deg);
        }
        :deep(.el-tree-node__expand-icon) {
          position: absolute;
          right: 8px;
          // transform: rotate(180deg);
        }
        :deep(.el-tree) {
          padding: 0 10px;
          font-size: 14px;
          .custom-tree-node {
            padding-left: 14px;
            &.childrenNode {
              margin-left: 10px;
              padding-left: 17px;
              &.actived {
                background-color: rgba(54, 112, 248, 0.05);
              }
            }
            &.childrenActived {
              font-weight: 500;
              color: var(--theme-primary);
              .iconfont {
                color: var(--theme-primary);
              }
            }
          }
          .el-tree-node__content {
            padding-left: 14px !important;
          }
          &.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
            background: transparent;
            .custom-tree-node {
              border-radius: 2px;
              background-color: rgba(54, 112, 248, 0.05);
            }
          }
          & > .el-tree-node > .el-tree-node__content:nth-child(1) {
            padding-left: 0 !important;
          }
          .el-tree-node__content {
            overflow: hidden;
            height: 36px;
            margin-top: 8px;
            border-radius: 2px;
            // padding-left: 8px;
            &:hover {
              // background-color: var(--theme-fill);
              background: transparent;
              .custom-tree-node {
                border-radius: 2px;
                background-color: rgba(54, 112, 248, 0.05);
              }
            }
            .txt {
              display: inline-block;
              overflow: hidden;
              width: 100%;
              text-overflow: ellipsis;
              font-size: 14px;
              white-space: nowrap;
            }
          }
        }
        .title {
          height: 52px;
          padding-left: 26px;
          line-height: 52px;
          font-weight: 500;
          font-size: 14px;
          color: var(--theme-text);
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
        ul {
          overflow-y: auto;
          flex: 1;
          padding: 0 14px;
          li {
            height: 36px;
            margin-top: 8px;
            padding-left: 12px;
            cursor: pointer;
            line-height: 36px;
            &:nth-child(1) {
              margin-top: 0;
            }
            &.active {
              border-radius: 8px;
              background-color: rgba(54, 112, 248, 0.05);
            }
          }
        }
      }
    }
    .right {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      height: 100%;
      border-radius: 8px;
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        height: 52px;
        padding: 0 24px 0 26px;
        border-radius: 8px;
        background-color: var(--theme-card);
        .title {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        .title-right {
          display: flex;
          justify-content: flex-start;
          width: 463px;
          .label {
            display: flex;
            align-items: center;
            width: 80px;
            color: var(--theme-text);
          }
          .el-input {
            width: 245px;
          }
          .el-button {
            margin-left: 23px;
          }
        }
      }
      .right-content {
        flex: 1;
        width: 100%;
        height: 0;
        margin-top: 16px;
        border-radius: 8px;
        background-color: var(--theme-card);
        &.right-content1 {
          box-sizing: border-box;
          padding-bottom: 24px;

          :deep(.medical-body:first-child) {
            .timeline-left {
              .line-top {
                visibility: hidden;
              }
            }
          }
          // :deep(.el-scrollbar) {
          //   .el-scrollbar__view {
          //     height: 100%;
          //   }
          // }
        }
        :deep(.medical-body) {
          box-sizing: border-box;
          width: 100%;
          // height: 100%;
          padding: 24px 25px 25px;
          &:not(:first-child) {
            margin-top: 20px;
          }
          .el-input__inner,
          .el-textarea__inner {
            font-size: 14px;
          }
          .custom-form-item {
            align-items: center;
          }

          // .custom-form-item .el-form-item__label {
          //   display: flex;
          //   align-items: center;
          // }
        }
        // >div {
        //   overflow-y: auto;
        //   height: 100%;
        // }
      }
    }
    .aiContent {
      position: relative;
      box-sizing: border-box;
      width: 517px;
      margin-left: 12px;
      border-radius: 8px;
      background-color: var(--theme-card);
      .closeBtn {
        position: absolute;
        right: 12px;
        top: 5px;
        cursor: pointer;
        img {
          width: 38px;
          height: 38px;
        }
      }
    }
  }
}
:deep(.tree-line) {
  .el-tree-node {
    position: relative;
    padding-left: 0; // 缩进量
    .iconfont {
      margin-right: 10px;
      font-size: 17px;
      color: var(--theme-text-3);
      &.icon-yingxiangjiancha,
      &.icon-bingli1,
      &.icon-shoushujilu,
      &.icon-hulijilu {
        font-size: 18px;
      }
    }
    .custom-tree-node {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      &.actived {
        font-weight: 500;
        // background: red;
        color: var(--el-color-primary);
        .iconfont {
          color: var(--el-color-primary);
        }
      }
    }
    &:focus>.el-tree-node__content {
      background-color: inherit;
    }
    // &:focus>.el-tree-node__content,
    // &.is-current {
    //   .iconfont,
    //   .customTxt {
    //     color: var(--theme-primary) !important;
    //   }
    // }
    // &.is-current > .el-tree-node__content {
    //   background: rgba(54,112,248,0.05); !important;
    // }
  }

  .el-tree-node__children {
    padding-left: 6px; // 二级目录缩进量

    // 三级目录缩进量
    .el-tree-node__children {
      padding-left: 32px;
    }
  }

  // 竖线
  .el-tree-node::before {
    position: absolute;
    // left: -3px;
    left: 15px;
    top: -30px;
    width: 1px;
    height: 48px;
    border-width: 1px;
    border-left: 1px solid #d8d8d8;
    content: '';
  }
  .el-tree-node:nth-child(1)::before {
    top: 0;
  }
  // 当前层最后一个节点的竖线高度固定
  .el-tree-node:last-child::before {
    height: 48px; // 可以自己调节到合适数值
  }

  // 横线
  .el-tree-node::after {
    position: absolute;
    left: 15px;
    top: 18px;
    width: 9px;
    height: 20px;
    border-width: 1px;
    border-top: 1px solid #d8d8d8;
    content: '';
  }

  // 去掉最顶层的虚线，放最下面样式才不会被上面的覆盖了
  & > .el-tree-node::after {
    border-top: none;
  }
  & > .el-tree-node::before {
    border-left: none;
  }

  // 展开关闭的icon
  .el-tree-node__expand-icon {
    font-size: 16px;
    // 叶子节点（无子节点）
    &.is-leaf {
      color: transparent;
      // display: none; // 也可以去掉
    }
  }
}
</style>
