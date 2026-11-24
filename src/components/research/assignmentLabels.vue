<template>
  <div class="assignmentLabels">
    <div>
      <div class="stepContainer">
        <template v-for="(item,index) in steps" :key="index">
          <!--  @click="tabNodeClick(index + 1)" -->
          <div :class="{stepItem:true,active:step >= item.id}">
            <i class="iconfont icon-chenggong" v-if='step > item.id'></i>
            <div class="stepItemNum" v-if="step <= item.id">{{index + 1}}</div>
            <div :class="{stepItemName:true}">
              {{ item.name }}
            </div>
          </div>
          <div class="line" v-if="index < steps.length - 1"></div>
        </template>
      </div>
      <template v-if="step===1">
        <el-form ref="ruleFormRef" :label-width="pxToRem(100)" label-position="left" :model="formData" class="new_DialogForm" >
          <el-form-item label="文件ID：">
            <commonMultiSelectWithSearch v-model="formData.recordIds" :options="recordIdsOptions" placeholder="请选择一项"></commonMultiSelectWithSearch>
            <!-- <commonMultipleSelect v-model="formData.recordIds" :options="recordIdsOptions" placeholder="请选择一项"/> -->
          </el-form-item>

          <el-form-item label="病历ID：">
            <commonMultiSelectWithSearch v-model="formData.documentIds" :options="documentIdsOptions" placeholder="请选择一项"></commonMultiSelectWithSearch>
            <!-- <commonMultipleSelect v-model="formData.documentIds" :options="documentIdsOptions" placeholder="请选择一项"/> -->
          </el-form-item>
          <el-form-item label="状 态：">
            <commonMultiSelectWithSearch v-model="formData.proofreadStatusList" :options="statusOption" placeholder="请选择一项"/>
          </el-form-item>
          <el-form-item label="校对人：">
            <commonMultiSelectWithSearch v-model="formData.proofreaderIds" :options="creatorGroupOptions" placeholder="请选择一项"/>
          </el-form-item>
          <el-form-item label="上传时间：">
            <el-date-picker
              clearable
              placeholder="请选择一项"
              range-separator="-"
              :value-format="'YYYY-MM-DD'"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              v-bind="{ type: 'daterange' }"
              v-model="formData.time"
            />
          </el-form-item>
          <el-form-item label="所属医院-科室" class="form-query-select">
            <el-cascader
              v-model="formData.department"
              :options="departmentOptions"
              :props="{multiple: true,label:'name',value:'id',children:'departmentList'}"
              collapse-tags
              collapse-tags-tooltip
              clearable
            />
          </el-form-item>
        </el-form>
        <div class="searchContainer">
          <el-button class="searchBtn" @click="handelSearch">筛 选</el-button>
        </div>
        <div class="tableContainer" v-if="isSearch">
          <MyTableInfinite
            ref="MyTableInfiniteDom"
            :tableData="tableData"
            :pageResult="pageResult"
            :maxHeight="300"
            :columns="columns"
            @getNextPageData="getNextPageData"
          >
            <template #status="{ row }">
              <div class="statusCell">
                <span
                  v-if="getStatusConfig(row.proofreadStatus)"
                  class="statusDot"
                  :class="getStatusConfig(row.proofreadStatus).dotClass"
                ></span>
                <span>{{ getStatusConfig(row.proofreadStatus)?.label || '-' }}</span>
              </div>
            </template>
          </MyTableInfinite>
        </div>
      </template>
      <template v-if="step===2">
        <div class="targetUserSelect">
          <div class="text">共筛选出病历</div>
          <div class="num">{{ pageResult.total+'份' }}</div>
          <el-select v-model="targetUserIds" placeholder="请选择分配人员" class="selectTargetUserId">
            <el-option
              v-for="(item) in assignPersonnel"
              :label="item.userName"
              :value="item.id"
              :key="item.id">
            </el-option>
          </el-select>
          <!-- <commonMultipleSelect v-model="targetUserIds" :options="assignPersonnel" placeholder="请选择分配人员"/> -->
        </div>
      </template>
      <template v-if="step===3">
        <div class="successContaienr">
          <img class="successIcon" src="@/assets/successIcon.png" alt="">
          <div class="successText">分配成功</div>
        </div>
      </template>

    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, defineProps, defineExpose } from 'vue'
// import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import commonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
import { getTaskAllocateList, getAllIds, getGroupOptions, saveAllocationRules, getMedicalRecordList } from '@/api/api_proofread'
import { emitter } from '@/utils/bus'
import lodash from 'lodash'
import { getAngencyAndDepartmentTreeListByRole } from '@/api/api_home'
import { getDemoAllRecords } from '@/mock/proofreadDemo'
import { ElMessage } from 'element-plus'
const props = defineProps({
  creatorGroupOptions: {
    type: Array,
    default: () => {
      return []
    }
  },
  step: {
    type: Number,
    default: 1
  }
})
const steps = ref([
  {
    name: '病历筛选',
    id: 1
  },
  {
    name: '分配人员',
    id: 2
  },
  {
    name: '分配结果',
    id: 3
  }
])
const formData = ref({})
const statusOption = [
  { label: '待校对', value: 1, dotClass: 'statusDot1' },
  // { label: '校对中', value: 2, dotClass: 'statusDot2' },
  { label: '待复核', value: 3, dotClass: 'statusDot3' }
  // { label: '复核中', value: 4, dotClass: 'statusDot4' },
  // { label: '已完成', value: 5, dotClass: 'statusDot5' }
]
const getStatusConfig = (status) => lodash.find(statusOption, { value: status })
const isSearch = ref(false)
const handelSearch = () => {
  isSearch.value = true
  initData()
}
const tableData = ref([]) // 表格数据
const columns = ref([
  {
    label: '文件ID',
    prop: 'id',
    minWidth: 150
  },
  {
    label: '病历ID',
    prop: 'documentId',
    minWidth: 90
  },
  {
    label: '文件状态',
    prop: 'status',
    minWidth: 80,
    slot: 'status'
  },
  {
    label: '上传时间',
    prop: 'createTime',
    minWidth: 140
  }
])
const pageResult = ref({
  pageSize: 20,
  pageNum: 1,
  total: 0,
  maxPage: 1
})
const MyTableInfiniteDom = ref()
// 初始化数据
const initData = async () => {
  emitter.emit('showLoading')
  pageResult.value.pageNum = 1
  tableData.value = []
  try {
    const res = await getTableData()
    tableData.value = res?.items || []
    pageResult.value.total = res?.total || 0
    pageResult.value.maxPage = Math.ceil(pageResult.value.total / pageResult.value.pageSize) || 1
  } finally {
    MyTableInfiniteDom.value?.resetDom()
  }
}
// 获取下一页数据
const getNextPageData = async () => {
  if (pageResult.value.pageNum >= pageResult.value.maxPage) {
    MyTableInfiniteDom.value?.resetDom()
    return
  }
  pageResult.value.pageNum += 1
  try {
    const res = await getTableData()
    const data = res?.items || []
    tableData.value = tableData.value.concat(data)
  } catch {
    // 出现加载失败要回退
    pageResult.value.pageNum -= 1
  } finally {
    // 不管失败完成都要取消加载，才能再次触发滚动下一页
    MyTableInfiniteDom.value?.resetDom()
  }
}
const getTableData = async(isVerification) => {
  const { time, ...rest } = formData.value
  const params = {
    ...rest,
    pageNum: isVerification ? 1 : pageResult.value.pageNum,
    pageSize: pageResult.value.pageSize,
    uploadStartTime: time?.length ? time[0] : '',
    uploadEndTime: time?.length ? time[1] : ''
  }

  const res = await getTaskAllocateList(params)
  return res?.data || {}
}
const documentIdsOptions = ref([])
const recordIdsOptions = ref([])

// 把 ID 补上「医院 · 科室」，方便在长 ID 里一眼认出是哪家医院哪个科室的病历
const cityOf = (item) => [item?.hospitalName || item?.agencyName, item?.departmentName || item?.deptName || item?.department]
  .filter(Boolean)
  .join(' · ')

// ID → 医院 · 科室 的映射：options 接口只返回 ID 时，用病历列表补上归属信息
const loadAreaMap = async () => {
  const map = new Map()
  try {
    const res = await getMedicalRecordList({ pageNum: 1, pageSize: 1000 })
    const items = res && res.code === 10000 ? (res.data?.items || []) : []
    items.forEach((item) => {
      const area = [item.agencyName || item.hospitalName, item.departmentName || item.deptName].filter(Boolean).join(' · ')
      if (!area) return
      if (item.id) map.set(String(item.id), area)
      if (item.documentId) map.set(String(item.documentId), area)
    })
  } catch (e) {
    // 拿不到映射时只展示 ID，不阻断筛选流程
  }
  return map
}

const enrichIdOptions = (list, areaMap) => {
  if (!Array.isArray(list)) return []
  return list.map((item) => {
    // 后端可能返回 { id, hospitalName, departmentName } 或纯字符串 ID
    const isObject = item && typeof item === 'object'
    const value = isObject ? (item.value || item.id || item.recordId || item.documentId) : item
    const base = isObject ? (item.label || item.name || value) : item
    const city = (isObject && cityOf(item)) || (areaMap && areaMap.get(String(value))) || ''
    return {
      value,
      label: city ? `${base}（${city}）` : base
    }
  })
}

// 演示环境没有后端时，用本地演示病历兜底，保证枚举里能看到医院与科室
const buildDemoIdOptions = () => {
  const records = getDemoAllRecords()
  return {
    recordIds: records.map(item => ({
      value: item.id,
      label: `${item.id}（${item.agencyName || '演示医院'} · ${item.departmentName || '-'}）`
    })),
    documentIds: records.map(item => ({
      value: item.documentId,
      label: `${item.documentId}（${item.agencyName || '演示医院'} · ${item.departmentName || '-'}）`
    }))
  }
}

const applyDemoIdOptions = () => {
  const demo = buildDemoIdOptions()
  recordIdsOptions.value = demo.recordIds
  documentIdsOptions.value = demo.documentIds
}

const getAllIdsFn = async () => {
  // 演示登录：直接用本地演示病历生成枚举，保证 ID 与列表、医院科室一致
  if (localStorage.getItem('mockLogin') === 'true') {
    applyDemoIdOptions()
    return
  }
  const areaMap = await loadAreaMap()
  getAllIds()
    .then(res => {
      if (res && res.code === 10000) {
        const recordList = enrichIdOptions(res.data?.recordIds, areaMap)
        const documentList = enrichIdOptions(res.data?.documentIds, areaMap)
        if (recordList.length || documentList.length) {
          recordIdsOptions.value = recordList
          documentIdsOptions.value = documentList
          return
        }
      }
      applyDemoIdOptions()
    })
    .catch(() => applyDemoIdOptions())
}
const assignPersonnel = ref([])
const getGroupOptionsFn = () => {
  getGroupOptions().then(res => {
    if (res.code === 10000) {
      assignPersonnel.value = res.data
    }
  })
}
const verificationTotal = ref(0)
const verificationFn = async() => {
  if (props.step === 1) {
    verificationTotal.value = 0
    try {
      const res = await getTableData(1)
      verificationTotal.value = res?.total || 0
      pageResult.value.total = res?.total || 0
      return verificationTotal.value > 0
    } catch (error) {
      console.error('校验查询失败', error)
      return false // 请求异常时同样阻止进入下一步
    }
  } else if (props.step === 2) {
    if (!targetUserIds.value?.length) {
      ElMessage.error('请选择标注人员')
      return false
    } else {
      // if (targetUserIds.value?.length === 1) {
      //   ElMessage.error('至少要选 2 位标注人员')
      //   return false
      // }
      // eslint-disable-next-line no-unused-vars
      const { time, ...rest } = formData.value
      try {
        const res = await saveAllocationRules({
          queryAO: { ...rest },
          targetUserIds: [targetUserIds.value]
        })
        if (res.code === 10000) {
          console.log('分配成功')
          return true // 告知父组件成功即可
        } else {
          return false
        }
      } catch (err) {
        console.error('保存失败', err)
        return false
      }
    }
  }
}
const targetUserIds = ref([])
const departmentOptions = ref([])
const getAngencyAndDepartmentTreeListFn = () => {
  getAngencyAndDepartmentTreeListByRole().then(res => {
    if (res.code === 10000) {
      departmentOptions.value = res.data || []
    }
  })
}
onMounted(() => {
  getAllIdsFn()
  getGroupOptionsFn()
  initData()
  getAngencyAndDepartmentTreeListFn()
})

defineExpose({
  verificationFn,
  verificationTotal
})
</script>
<style lang="scss" scoped>
.assignmentLabels {
  .tabsContainer {
    display: flex;
    margin-bottom: 16px;
    padding-bottom: 11px;
    border-bottom: 1px solid #e8e8e8;

    .tabItem {
      margin-right: 39px;
      cursor: pointer;
      line-height: 20px;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text);
      &.active {
        position: relative;
        font-weight: 600;
        color: var(--theme-primary);
        &::before {
          position: absolute;
          left: 0;
          bottom: -12px;
          z-index: 2;
          width: 57px;
          height: 0;
          border-bottom: 2px solid var(--theme-primary);
          content: '';
        }
      }
    }
  }
  .stepContainer {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 78px;
    margin-top: 16px;
    margin-bottom: 24px;
    padding: 0 43px;
    padding-top: 15px;
    padding-bottom: 43px;
    border-radius: 2px;
    background: rgba(54, 112, 248, 0.05);
    .stepItem {
      display: flex;
      position: relative;
      align-items: center;
      cursor: pointer;
      &.active {
        .stepItemNum {
          border: none;
          background: var(--theme-primary);
          color: #fff;
        }

        .stepItemName {
          font-weight: 600;
          color: var(--theme-primary);
        }
      }
      .iconfont {
        font-size: 20px;
        color: var(--theme-primary);
      }
      .stepItemNum {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border: 1px solid #d8d8d8;
        border-radius: 50%;
        background: var(--theme-card);
        user-select: none;
        font-family: D-DIN;
        font-size: 14px;
        color: var(--theme-text-2);
      }

      .stepItemName {
        display: flex;
        position: absolute;
        left: 50%;
        bottom: -27px;
        justify-content: center;
        align-items: center;
        width: auto;
        font-size: 14px;
        color: var(--theme-text);
        word-break: keep-all;
        transform: translateX(-50%);
        &.doneName {
          font-weight: 600;
          font-size: 14px;
          color: #3d3d3d;
        }
      }
    }

    .line {
      flex: 1;
      height: 2px;
      margin: 0 24px;
      border-radius: 3px;
      background-color: #dce6ff;
    }
  }
  .searchContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    .searchBtn {
      border: 1px solid var(--theme-primary);
      background: var(--theme-card);
      font-weight: 500;
      font-size: 14px;
      color: var(--theme-primary);
    }
  }
  .tableContainer {
    margin-top: 16px;

    .statusCell {
      display: flex;
      align-items: center;
    }

    .statusDot {
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      margin-right: 8px;
      border-radius: 50%;
    }

    .statusDot1 {
      background: #b6b7b9;
    }

    .statusDot2 {
      background: var(--theme-primary);
    }

    .statusDot3 {
      background: #f59f0c;
    }

    .statusDot4 {
      background: #8a33c4;
    }

    .statusDot5 {
      background: #04a273;
    }
  }
  .targetUserSelect {
    display: flex;
    flex-direction: column;
    margin-top: 32px;
    margin-bottom: 8px;
    .text {
      line-height: 25px;
      text-align: center;
      font-weight: 400;
      font-size: 17px;
      color: var(--theme-text);
    }
    .num {
      margin-top: 10px;
      margin-bottom: 30px;
      line-height: 34px;
      text-align: center;
      font-family: D-DIN;
      font-weight: 700;
      font-size: 31px;
      color: var(--theme-primary);
    }
    .selectTargetUserId {
      width: 377px;
      height: 40px;
      margin: 0 auto;
      :deep(.el-select__wrapper) {
        height: 40px;
      }
    }
    :deep(.common-multiple-select) {
      width: 377px;
      height: 40px;
      margin: 0 auto;
      .el-select__wrapper {
        height: 40px;
      }
    }
  }
  .successContaienr {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 70px;
    margin-bottom: 32px;
    .successIcon {
      width: 50px;
      height: auto;
      margin-bottom: 7px;
    }
    .successText {
      line-height: 20px;
      font-weight: 600;
      font-size: 14px;
      color: var(--theme-text);
    }
  }
}
:deep(.empty .emptyImg) {
  width: 103px;
}
:deep(.el-cascader) {
  width: 100% !important;
  .el-input__inner {
    height: 22px !important;
  }
}
</style>
