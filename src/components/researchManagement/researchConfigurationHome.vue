<template>
  <div class="researchConfigurationHome">
    <div class="viewContent">
      <div class="viewHeader">
        <header class="header header1">
          <div class="conditionTitle">
            <div class="title">查询条件</div>
          </div>
          <el-form class="commonSearch" ref="searchForm" :inline="true" :model="searchInfo">
            <el-form-item label="流程名称" class="form-query-select">
              <el-input v-model="searchInfo.name" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="科室" class="form-query-select">
              <el-cascader
                v-model="searchInfo.department"
                :options="hospitalGroupOptions"
                :props="{multiple: true,label:'name',value:'id',children:'departmentList'}"
                collapse-tags
                collapse-tags-tooltip
                clearable
              />
            </el-form-item>
            <el-form-item label="阶段" class="form-query-select">
              <el-select v-model="searchInfo.phase" multiple :multiple-limit="30" collapse-tags collapse-tags-tooltip clearable placeholder="请选择一项">
                <el-option
                  v-for="item in processOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="创建人" class="form-query-select">
              <el-input v-model="searchInfo.creator" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <div class="btnDiv">
              <el-button @click="resetParams">重置条件</el-button>
              <el-button type="primary" @click="onSubmit">查 询</el-button>
            </div>
          </el-form>
        </header>
      </div>
      <researchConfigCards ref="researchConfigCardsRef" :type="0" :loading="loading" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" :cardsData="cardsData" @handleNew="newAdd" @handleEdit="handleHeaderClick" @handleDelete="handleHeaderClick" @handleAdd="handleHeaderClick" @handleClickCard="handleClickCard"/>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'researchConfigurationHome',
  inheritAttrs: false
})
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import researchConfigCards from '@/components/researchManagement/researchConfigCards.vue'
import { getPagePermission } from '@/hooks/permissionHooks'
import { getScientificConfigList, deleteScientificConfig, getDepartmentUserByAgencyIdWithAuth } from '@/api/api_scientific'
import { useRouter, useRoute } from 'vue-router'
import { useResearchStore } from '@/store/researchStore'
import { formatDateTime } from '@/utils/utils'

const router = useRouter()
const route = useRoute()
const { needCheckPermission, hadPermissionList } = getPagePermission(route.path)
const loading = ref(false)
const cardsData = ref([])
const researchStore = useResearchStore()
const searchInfo = ref({
  name: '',
  hospital: [],
  department: [],
  phase: [],
  creator: ''
})
const hospitalGroupOptions = ref([])
const processOptions = ref([
  {
    id: 1,
    name: '项目立项'
  },
  {
    id: 2,
    name: '项目研究'
  },
  {
    id: 3,
    name: '项目变更'
  },
  {
    id: 4,
    name: '项目中检'
  },
  {
    id: 5,
    name: '项目结题'
  },
  {
    id: 6,
    name: '论文管理'
  },
  {
    id: 7,
    name: '著作管理'
  },
  {
    id: 8,
    name: '专利管理'
  },
  {
    id: 9,
    name: '获奖管理'
  }
])
// 获取医院数据
const getHospitalData = async() => {
  getDepartmentUserByAgencyIdWithAuth().then(res => {
    console.log('树结构', res)
    if (res.code === 10000) {
      hospitalGroupOptions.value = res.data || []
    }
  })
}
getHospitalData()
const researchConfigCardsRef = ref(null)
// 加载时请求页面列表
const init = async() => {
  loading.value = true
  const res = await getScientificConfigList({
    flowName: searchInfo.value.name,
    stages: searchInfo.value.phase,
    creator: searchInfo.value.creator,
    agencyAndDepartmentIdList: searchInfo.value.department
  })
  if (res.code === 10000) {
    const stageEnumeration = ['项目立项', '项目研究', '项目变更', '项目中检', '项目结题', '论文管理', '著作管理', '专利管理', '获奖管理']
    cardsData.value = res.data?.items.map(it => {
      it.stage = stageEnumeration[it.stage - 1]
      it.createTime = formatDateTime(it.createTime)
      return it
    }) || []
  }
  loading.value = false
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {
    name: '',
    hospital: [],
    department: [],
    phase: [],
    creator: ''
  }
  init()
}
// 搜索
const onSubmit = () => {
  init()
}

// 新增
const newAdd = () => {
  researchStore.setResearchConfigurationDetails({ isEdit: true, isAdd: true })
  router.push({ path: '/researchManagement/researchConfigurationDetails' })
}
// 点击选项
const handleHeaderClick = (option) => {
  console.log(option)
  switch (option.name) {
    case '编辑':
      researchStore.setResearchConfigurationDetails({ ...option.data, isEdit: true, isAdd: false })
      router.push({ path: '/researchManagement/researchConfigurationDetails' })
      break
    case '删除':
      ElMessageBox.confirm(
        `正在引用流程还未完成的审批将继续走该流程，新发起的将使用最新流程，删除后将无法恢复，确认删除？`,
        '删除',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      ).then(async () => {
        deleteScientificConfig({ id: option.data.id }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('已删除')
            onSubmit()
          }
        })
      }).catch(() => {})
      break
    default:
      break
  }
}

// 点击卡片事件
const handleClickCard = (data) => {
  researchStore.setResearchConfigurationDetails({ ...data, isEdit: false, isAdd: false })
  router.push({ path: '/researchManagement/researchConfigurationDetails' })
}

</script>
<style scoped lang="scss">
.researchConfigurationHome {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  padding: 16px;
  .viewContent {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0;
  }
  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 16px 0 0;
    background-color: var(--theme-card);
    :deep(.el-form) {
      display: flex;
      position: relative;
      width: 100%;
      margin-top: 24px;
      .el-form-item {
        min-width: 240px;
        margin-right: 32px;
        .el-form-item__label {
          padding-right: 10px;
        }
        .el-form-item__content {
          &:has(.el-date-editor) {
            width: 344px;
          }
        }
      }
    }
    &.header1 {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 127px;
      padding: 0 26px;
      border-radius: 8px;
      background-color: var(--theme-card);
      font-size: 14px;
      .conditionTitle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-top: 24px;
        .title {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        .btnDiv {
          .el-button {
            &:nth-child(2) {
              margin-left: 14px;
              color: #fff;
            }
          }
        }
      }
    }
  }
}
</style>
