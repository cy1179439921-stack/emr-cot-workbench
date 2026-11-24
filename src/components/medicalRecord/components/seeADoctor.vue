<template>
  <div class="seeADoctor">
    <div class="conditionTitle">
      <div class="title">
        <el-form ref="searchForm" :inline="true" :model="searchInfo" @submit.prevent>
          <el-form-item label="就诊ID" class="form-query-select">
            <el-input v-model.trim="searchInfo.medicalId" clearable oninput="value=value.replace(/[^\d.]/g,'')" maxlength="19" placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
          </el-form-item>
          <el-form-item label="病种" class="form-query-select">
            <CommonMultiSelectWithSearch v-model="searchInfo.diseaseType" :options="diseaseGroupOptions"/>
            <!-- <el-select :style="{ width: pxToRem(140) }" v-model="searchInfo.diseaseType" multiple collapse-tags clearable placeholder="请选择一项">
              <el-option v-for="item in diseaseGroupOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select> -->
          </el-form-item>
          <el-form-item label="就诊类型" class="form-query-select">
            <commonMultipleSelect
              v-model="searchInfo.hospital"
              :options="hospitalGroupOptions"
              placeholder="请选择一项"
            />
          </el-form-item>
          <div class="btnDiv">
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </el-form>
      </div>

    </div>
    <commonTable class="singleTable btnsLastCell" :data="tableData" type="expand" row-key="medicalRecordId" :expand-row-keys="expands">
      <el-table-column type="expand" class-name="expand-column" width="1">
        <template v-slot="scope">
          <div style="height: auto;">
            <timeline :data="scope.row.timeLine" :id="scope.row.medicalRecordId"></timeline>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="就诊类型" min-width="100">
        <template #default="scope">
          <div style="display: flex; justify-content: center; align-items: center;" v-if="scope.row.medicalRecordType">
            <i class="iconfont blue"
               :class="hospitalGroupOptions.find(item => item.value === scope.row.medicalRecordType)?.icon"></i>
            <span style="margin-left: 10px;">{{ hospitalGroupOptions.find(item => item.value === scope.row.medicalRecordType)?.label || '-' }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="medicalRecordId" label="就诊ID" min-width="140">
        <template #default="scope">
          <div>{{ scope.row.medicalRecordId || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="agencyName" label="就诊医院" min-width="150">
        <template #default="scope">
          <div>{{ scope.row.agencyName || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="visitNumber" label="住院号/门诊号/体检号" min-width="140">
        <template #default="scope">
          <div>{{ scope.row.visitNumber || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="病种" min-width="140">
        <!-- <template #default="scope">
          <div>{{ scope.row.diseaseName || '-' }}</div>
        </template> -->
        <template #default="scope">
          <div class="custom-disease-column">
            <CommonTooltipWithSlotContent className="diseaseTooltip" v-if="scope.row.diseaseName">
              <div class="span-box">
                <span v-for="(item, index) in scope.row.diseaseName.split('；')" :key="'disease' + index" class="itemTag">{{ item }}</span>
              </div>
              <template #content>
                <div class="tooltip-custom">
                  <div class="item" v-for="(item, index) in scope.row.diseaseName.split('；')" :key="'tooltip' + index">
                    {{ item }}
                  </div>
                </div>
              </template>
            </CommonTooltipWithSlotContent>
            <div v-else>-</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="mainDiagnosis" label="主要诊断" min-width="140">
        <template #default="scope">
          <div>{{ scope.row.mainDiagnosis || '-' }}</div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="查看" :min-width="props.curPatientDetail.studyCohort ? 140 : 75" fixed="right"> -->
      <el-table-column label="查看" min-width="95" fixed="right">
        <template #default="scope">
          <el-button class="blueBtn" type="primary" link @click="showDateLine(scope.row)" v-if="scope.row.medicalRecordType === 1">时间轴</el-button>
          <el-button class="blueBtn" type="primary" link @click="viewRecord(scope.row, 0)"
                     v-if="!needCheckPermission || hadPermissionList.includes('查看')">查看就诊记录</el-button>
          <!-- <el-button class="blueBtn" type="primary" link
                     v-if="(!needCheckPermission || hadPermissionList.includes('病历指标')) && props.curPatientDetail.studyCohort"
                     @click="viewRecord(scope.row, 1)">查看病历指标</el-button> -->
        </template>
      </el-table-column>
    </commonTable>
    <div class="tabel_pagination">
      <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange"
                     v-model:current-page="currentPage" :page-size="limit" :total="total">
        <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total
        }}</span> 条</span></template>
      </el-pagination>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import router from '@/router'
import { getResearchDisease } from '@/api/api_research'
import { getMedicalRecordPage } from '@/api/api_patient'
import timeline from '@/components/medicalRecord/components/timeline.vue'
import { useMedicalStore } from '@/store/medicalStore'
import { ElMessage } from 'element-plus'
import { getPagePermission } from '@/hooks/permissionHooks'
import CommonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import _ from 'lodash'
const { needCheckPermission, hadPermissionList } = getPagePermission('/medicalRecord/medicalDetails')
const props = defineProps(['curPatientDetail']) // 当前患者详情
const medicalStore = useMedicalStore() // 病历状态管理
const currentPage = ref(1) // 当前页
const limit = ref(20) // 每页条数
const total = ref(0) // 总条数
const searchInfo = ref({ // 搜索条件
  medicalId: '',
  diseaseType: [],
  hospital: []
})
const tableData = ref([]) // 列表数据
// 病历类型选项
const hospitalGroupOptions = [
  { value: 1, label: '住院', icon: 'icon-zhuyuan1' },
  { value: 2, label: '门急诊', icon: 'icon-menjizhen' },
  { value: 3, label: '体检', icon: 'icon-tijian' }
]
const diseaseGroupOptions = ref([]) // 病种数据
const queryType = ref(0) // 0是查看就诊记录  1是查看病历指标
const expands = ref([]) // 展开行

// 获取病种数据
const getDiseaseData = async () => {
  const res = await getResearchDisease()
  if (res.code === 10000) {
    diseaseGroupOptions.value = res.data
  }
}

// 查看就诊记录
const viewRecord = (val, type) => {
  queryType.value = type
  const params = {
    id: val.medicalRecordId,
    patientId: props.curPatientDetail.patientId,
    studyCohort: props.curPatientDetail.studyCohort,
    studyName: props.curPatientDetail.studyName,
    medicalRecordType: val.medicalRecordType
  }
  params.routerName = router.currentRoute.value.name
  params.key = props.curPatientDetail.studyName + val.medicalRecordId
  params.fileId = props.curPatientDetail.fileId
  medicalStore.setmedicalList({ ...params, type })

  if (medicalStore.medicalList.length !== 10 || medicalStore.medicalList.findIndex(item => item.key === params.key) !== -1) {
    router.push({ name: 'medicalDetails' })
  } else {
    ElMessage.error('当前就诊详情已超过10条记录，请先清理历史记录后再查看')
  }
}
// 加载时请求页面列表
const init = _.debounce(async () => {
  getDiseaseData() // 获取病种数据
  getData() // 获取列表数据
}, 300)

// 获取列表数据
const getData = async () => {
  const params = {
    medicalRecordTypeList: searchInfo.value.hospital,
    diseaseIdList: searchInfo.value.diseaseType,
    medicalRecordId: searchInfo.value.medicalId,
    pageNum: currentPage.value,
    pageSize: limit.value,
    patientId: props.curPatientDetail.patientId,
    queueId: props.curPatientDetail.studyCohort
  }
  const res = await getMedicalRecordPage(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}
// 重置
const resetParams = () => {
  searchInfo.value = {
    medicalId: '',
    hospital: [],
    diseaseType: []
  }
  getData()
}
// 搜索
const onSubmit = () => {
  currentPage.value = 1
  getData()
}
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getData()
}
// 更改每页条数
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getData()
}

// 时间轴展开
const showDateLine = (row) => {
  if (expands.value.includes(row.medicalRecordId)) {
    expands.value = expands.value.filter(val => val !== row.medicalRecordId)
  } else {
    expands.value.push(row.medicalRecordId)
  }
}
// 页面加载时初始化
onMounted(() => {
  init() // 初始化页面数据
})

defineExpose({
  onRefresh: () => {
    init()
  }
})
</script>

<style scoped lang="scss">
.seeADoctor {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 100%;

  .conditionTitle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 32px;
    margin-top: 16px;
    margin-bottom: 24px;

    .title {
      display: flex;
      align-items: center;
      width: 100%;
      color: var(--theme-text);
      white-space: nowrap;
    }

    .el-form {
      display: flex;
      width: 100%;

      .el-form-item {
        margin-bottom: 0;
      }

      .el-input,
      .el-select {
        width: 245px !important;
      }
    }

    .el-button+.el-button {
      margin-left: 16px;
    }
  }

  :deep(.singleTable) {
    display: flex;
    flex-direction: column;
    flex: 1;

    .el-table__header {
      thead {
        th {
          &:nth-child(2) {
            .cell {
              padding-left: 24px;
            }
          }
        }
      }
    }

    .el-table__body {
      tbody {
        tr {
          td {
            .cell {
              .custom-disease-column {
                display: flex;
                flex: 1;
                width: 0;
                .span-box {
                  overflow: hidden;
                  flex: 1;
                  width: 100%;
                  text-overflow: ellipsis;
                }
                .itemTag {
                  display: inline-block;
                  overflow: hidden;
                  max-width: 100%;
                  height: 20px;
                  margin-right: 8px;
                  padding: 0 8px;
                  border-radius: 2px;
                  background: var(--theme-fill);
                  text-overflow: ellipsis;
                  font-size: 12px;
                  color: var(--theme-text);
                  white-space: nowrap;
                }
              }
            }
            &:nth-child(2) {
              .cell {
                padding-left: 24px;
              }
            }

            .el-button {
              font-weight: 400;

              &+.el-button {
                margin-left: 7px;
              }
            }

            .blueBtn {
              color: var(--el-color-primary);

              &.is-disabled {
                color: rgba(149, 149, 149, 0.55);
              }
            }

            .redBtn {
              color: #f76868;
            }

            .green:hover {
              color: #25c7cb;
            }
          }
        }
      }
    }

    .expand-column .el-table__expand-icon {
      display: none;
    }

    .blue {
      color: var(--theme-primary);
    }

    tbody :empty:not(:where(span, .iconfont))::before {
      color: #000;
      content: '-';
    }
  }

  // :deep(.singleTable) tbody :empty:not(i)::before {
  //   color: #000;
  //   content: '-';
  // }
  .tabel_pagination {
    display: flex;
    justify-content: center;
  }
}
</style>
