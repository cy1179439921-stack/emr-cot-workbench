<template>
  <div>
    <MyTableInfinite
      ref="MyTableInfiniteDom"
      :tableData="tableData"
      :pageResult="pageResult"
      :maxHeight="500"
      :columns="columns"
      handlerName="操作"
      :options="false"
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
      <template #option="scope">
        <div class="oprContainer">
          <el-button type="primary" link @click="handleFn(scope.row)">查看</el-button>
        </div>
      </template>
    </MyTableInfinite>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getTaskAllocateRecordDetails } from '@/api/api_proofread'
import lodash from 'lodash'
const props = defineProps({
  allocateId: {
    type: String,
    default: ''
  }
})
const statusOption = [
  { label: '待校对', value: 1, dotClass: 'statusDot1' },
  { label: '校对中', value: 2, dotClass: 'statusDot2' },
  { label: '待复核', value: 3, dotClass: 'statusDot3' },
  { label: '复核中', value: 4, dotClass: 'statusDot4' },
  { label: '已完成', value: 5, dotClass: 'statusDot5' }
]
const getStatusConfig = (status) => lodash.find(statusOption, { value: status })
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
    minWidth: 150
  },
  {
    label: '文件状态',
    prop: 'status',
    minWidth: 90,
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
    pageResult.value.pageNum -= 1
  } finally {
    MyTableInfiniteDom.value?.resetDom()
  }
}
const getTableData = async(isVerification) => {
  const params = {
    allocateId: props.allocateId,
    pageNum: pageResult.value.pageNum,
    pageSize: pageResult.value.pageSize
  }

  const res = await getTaskAllocateRecordDetails(params)
  return res?.data || {}
}
const handleFn = (row) => {
  console.log(row)
}
onMounted(() => {
  initData()
})
</script>
<style lang="scss" scoped>
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
  background: #3670f8;
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
</style>
