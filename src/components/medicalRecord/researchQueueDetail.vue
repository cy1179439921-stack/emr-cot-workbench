<template>
  <div class="dataHomePage">
    <div class="topNav">
      <p @click="goBack"><i class="iconfont icon-zuo"></i>返回</p>
      <p></p>
      <p>{{studyName}}</p>
      <div class="studyCohort" style="display: none;">
        <div class="label">研究队列</div>
        <el-select
          @change="handelChange"
          v-model="studyCohort"
          style="margin-right: 20px;"
          size="small"
        >
          <div
            infinite-scroll-immediate="false"
            style="overflow: hidden;"
          ></div>
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.queueName"
            :value="item.id"
          />
        </el-select>
      </div>
    </div>
    <div class="topNav">
      <ul>
        <li
          v-for="item in tabs"
          :key="item.value"
          class="flexCenter"
          :class="{ active: activeTab === item.value }"
          @click="handleClickTab(item.value)"
        >
          <div>{{ item.label }}</div>
          <div class="bottomLine"></div>
        </li>
      </ul>
    </div>
    <div class="main">
      <!-- 数据统计 -->
      <DataView
        :studyCohort="studyCohort"
        v-if="activeTab === 0">
      </DataView>
      <!-- 就诊记录 -->
      <MedicalRecord
        :studyCohort="studyCohort"
        :studyName="studyName"
        :diseaseTypeIds="diseaseTypeIds"
        :agencyIds="agencyIds"
        :diseaseTypeIdList="diseaseTypeIdList"
        ref="medicalRecordRef"
        :initTreeData="initTreeData"
        v-if="activeTab === 1"
        @transferSearch="transferSearch"
        @transferSearchExport="transferSearchExport"
      ></MedicalRecord>
      <!-- 病历指标 -->
      <MedicalRecordIndex
        ref="medicalRecordIndexRef"
        :diseaseTypeIds="diseaseTypeIds"
        :agencyIdList="agencyIdList"
        :agencyIds="agencyIds"
        :studyCohort="studyCohort"
        v-if="activeTab === 2"
        :studyName="studyName"
        :initTreeData="othersTreeData"
        :queryWayNum="queryWayNum"
        @transferSearchExport="transferSearchExport"
      ></MedicalRecordIndex>
    </div>
  </div>
</template>
<script setup name="dataHomePage">
import { nextTick, onMounted, ref } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import MedicalRecord from '@/components/medicalRecord/medicalRecord.vue'
import MedicalRecordIndex from '@/components/medicalRecord/medicalRecordIndex.vue'
import DataView from '@/views/homePage.vue'
import { getAllAgency } from '@/api/api_homePage.js'
import lodash from 'lodash'
import { useTree } from '@/hooks/treeData.js'
const { initTreeData, recursionFn, getOthersIndexFn, othersTreeData, agencyIdList, diseaseTypeIdList } = useTree(true)
import { useResearchStore } from '@/store/researchStore'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
// import { useUserStore } from '@/store/user'
// const userStore = useUserStore()
// 找到所有有查看权限的url
// const allowedMenu = ref([...userStore.allowedMenu])
const researchStore = useResearchStore()
const studyName = ref(researchStore.curResearchQueueDetail.queueName)
const studyCohort = ref(researchStore.curResearchQueueDetail.id)
const tabs = ref([
  {
    label: '数据统计',
    value: 0
  },
  {
    label: '就诊记录',
    value: 1
  },
  {
    label: '病历指标',
    value: 2
  }
])
const route = useRoute()
const medicalRecordIndexRef = ref('')
const medicalRecordRef = ref('')
const activeTab = ref()
// const state = reactive({
//   pageNum: 1,
//   pageSize: 20,
//   total: 0
// })
const queryWayNum = ref(1)
const agencyIds = ref([])
const diseaseTypeIds = ref([])
// const allTreeData = ref([])
const options = ref([
  {
    queueName: '全部',
    id: ''
  }
])
onMounted(async() => {
  medicalStore.handlerRouterKeepLiveList('researchQueueDetail', 'del')

  // await studyList()
  // await handelChange()
  handleClickTab(route.query.index - 0 || 0)
  // setTimeout(() => {
  //   activeTab.value = route.query.index - 0 || 0
  // }, 3000)
})

// const studyList = async () => {
// const params = {
//   pageNum: state.pageNum,
//   pageSize: state.pageSize
// }
// await getStudyList(params).then((res) => {
//   if (res.code === 10000) {
//     const data = res.data.items
//     state.total = res.data.total
//     options.value = options.value.concat(data)
//   }
// })
// }
// const loadMore = () => {
//   state.pageNum += 1
//   if (options.value.length < state.total) {
//     studyList()
//   }
// }
const IndexInitTreeData = ref([])
const getOthersIndex = async() => {
  if (!studyCohort.value) {
    return
  }
  await getOthersIndexFn(studyCohort.value)
  IndexInitTreeData.value = othersTreeData.value
  // const obj = {
  //   label: '其他指标',
  //   id: '3',
  //   children: othersTreeData.value
  // }
  // if (initTreeData[0].children.length > 2) {
  //   initTreeData[0].children.splice(2, 1, obj)
  // } else {
  //   initTreeData[0].children.push(obj)
  // }
}
const handleClickTab = (index) => {
  activeTab.value = index
  queryWayNum.value = 1
  router.push({
    path: '/researchQueueDetail',
    query: {
      index
    }
  })
  if (index === 2) {
    getOthersIndex()
  } else {
    if (initTreeData[0].children.length > 2) {
      initTreeData[0].children.splice(2, 1)
    }
  }
}
const handelChange = async () => {
  // console.log('options.value', options.value)
  // const obj = lodash.find(options.value, { id: studyCohort.value })
  // console.log('obj', obj)
  // if (obj && studyCohort.value) {
  let agencyList = []
  await getAllAgency({ queueId: studyCohort.value }).then(res => {
    if (res.code === 10000) {
      agencyList = res.data
    }
  })
  recursionFn(initTreeData, 'agencyIdList', agencyList || [])
  recursionFn(initTreeData, 'diseaseTypeIdList', researchStore.curResearchQueueDetail.diseaseList || [])
  if (agencyList) {
    agencyIds.value = lodash.map(agencyList, 'id')
  } else {
    agencyIds.value = []
  }
  if (researchStore.curResearchQueueDetail.diseaseList) {
    diseaseTypeIds.value = lodash.map(researchStore.curResearchQueueDetail.diseaseList, 'id')
  } else {
    diseaseTypeIds.value = []
  }
  // } else {
  //   recursionFn(initTreeData, 'agencyIdList', [], true)
  //   recursionFn(initTreeData, 'diseaseTypeIdList', [], true)
  // }
  if (activeTab.value === 2) {
    getOthersIndex()
  }
}

// activeTab.value = route.query.index - 0 || 0
if (activeTab.value === 2) {
  getOthersIndex()
}

const transferSearch = (obj) => {
  // 将就诊页面的搜索项继承到指标页面
  activeTab.value = 2
  handelChange()
  router.push({
    path: 'researchQueueDetail',
    query: {
      index: 2
    }
  })
  nextTick(() => {
    medicalRecordIndexRef.value.handelEchoSearch(obj, true)
  })
}
const transferSearchExport = (obj) => {
  const { type, treeValue, isTree } = obj
  console.log(type, treeValue, isTree)
  handleClickTab(type)
  queryWayNum.value = isTree ? 2 : 1
  nextTick(() => {
    if (activeTab.value === 1) {
      medicalRecordRef.value.handelEchoSearch({ searchItems: treeValue.search, values: treeValue.value, filterName: '无' })
    } else if (activeTab.value === 2) {
      if (isTree) {
        medicalRecordIndexRef.value.handelTreeSearch(treeValue)
      } else {
        medicalRecordIndexRef.value.handelEchoSearch({ searchItems: treeValue.search, values: treeValue.value, filterName: '无' })
      }
    }
  })
}
// const studyName = computed(() => {
//   return options.value.find((item) => item.id === studyCohort.value)?.queueName
// })
// 返回
const goBack = () => {
  router.push({ name: 'researchQueue' })
}
</script>
<style lang="scss" scoped>
.dataHomePage {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.topNav {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 48px;
  margin-bottom: 0;
  background: var(--theme-card);
  &:nth-of-type(1) {
    padding: 0 8px;
  }
  &:nth-of-type(2) {
    height: 56px;
    margin: 16px 16px 0;
    border-radius: 8px;
  }
  p:nth-child(1) {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 16px;
    color: var(--el-color-primary);
    i {
      font-size: 32px;
    }
  }
  p:nth-child(2) {
    height: 16px;
    margin: 0 16px;
    border-right: 1px solid #cbcfdc;
  }
  p:nth-child(3) {
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
  }
  ul {
    display: flex;
    flex: 1;
    box-sizing: border-box;
    height: 100%;
    padding: 0 32px;
    font-size: 16px;
    li {
      display: flex;
      position: relative;
      flex-direction: column;
      width: 70px;
      margin-right: 34px;
      cursor: pointer;
      font-size: 16px;
      color: var(--theme-text-2);

      .bottomLine {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 3px;
        background-color: var(--theme-card);
      }

      &.active {
        font-weight: 500;
        color: var(--theme-primary);
        .bottomLine {
          background-color: var(--theme-primary);
        }
      }
    }
  }
  .studyCohort {
    display: flex;
    align-items: center;
    height: 28px;
    border-radius: 6px 6px 6px 6px;
    background: var(--theme-fill);
    .label {
      position: relative;
      box-sizing: border-box;
      width: 78px;
      padding: 7px;
      line-height: 14px;
      font-size: 12px;
      color: #646464;
      &::after {
        position: absolute;
        right: 0;
        width: 0;
        height: 14px;
        border-right: 1px solid #cbcfdc;
        content: '';
      }
    }
  }
}
.main {
  overflow: hidden;
  flex: 1;
}
:deep(.studyCohort .el-input__wrapper) {
  box-sizing: border-box;
  height: 28px;
  // width: 147px;
  border: 0 solid #fff;
  border-radius: 0 6px 6px 0;
  background: var(--theme-fill);
  box-shadow: none;
}
.studyCohort {
  :deep(:where(.studyCohort .el-input__wrapper, .studyCohort .el-input)):hover,
  :deep(
    :where(
      .el-input__wrapper,
      .el-input__wrapper.is-focus,
      .el-input,
      .el-input.is-focus)):visited,
  :deep(.el-select .el-input.is-focus .el-input__wrapper),
  :deep(.el-select .el-input__wrapper.is-focus) {
    border: 0 !important;
    box-shadow: none !important;
  }
}
</style>
