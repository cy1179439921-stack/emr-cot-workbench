<template>
  <div>
    <MyTableInfinite
      v-if="!isShowDetail"
      ref="MyTableInfiniteDom"
      :tableData="tableData"
      :pageResult="pageResult"
      :maxHeight="500"
      :columns="columns"
      handlerName="操作"
      :options="true"
      @getNextPageData="getNextPageData"
    >
      <template #option="scope">
        <div class="oprContainer">
          <el-button type="primary" link @click="handleFn(scope.row)">查看</el-button>
        </div>
      </template>
    </MyTableInfinite>
    <div v-if="isShowDetail">
      <!-- <div class="back" @click="handleBack">
        <i class="iconfont icon-zuo"></i>
        <span>返回</span>
      </div> -->
      <assignmentLabelsRecordsDetails :allocateId="allocateId"></assignmentLabelsRecordsDetails>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, inject } from 'vue'
import { getTaskAllocateRecordsList } from '@/api/api_proofread'
import assignmentLabelsRecordsDetails from './assignmentLabelsRecordsDetails.vue'
// const statusOption = [
//   { label: '待校对', value: 1 },
//   { label: '校对中', value: 2 },
//   { label: '待复核', value: 3 },
//   { label: '复核中', value: 4 },
//   { label: '已完成', value: 5 }
// ]
const tableData = ref([]) // 表格数据
const columns = ref([
  {
    label: '分配病历数',
    prop: 'totalCount',
    minWidth: 110
  },
  {
    label: '任务ID',
    prop: 'id',
    minWidth: 180
  },
  {
    label: '分配标注人',
    prop: 'targetUserNames',
    minWidth: 130,
    formatter: (row) => {
      return row?.targetUserNames.join('、')
    }
  },
  {
    label: '操作人',
    prop: 'operatorName',
    minWidth: 70
  },
  {
    label: '操作时间',
    prop: 'createTime',
    minWidth: 160
    // minWidth: 140
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
const getTableData = async() => {
  const params = {
    pageNum: pageResult.value.pageNum,
    pageSize: pageResult.value.pageSize
  }

  const res = await getTaskAllocateRecordsList(params)
  return res?.data || {}
}
const isShowDetail = ref(false)
const allocateId = ref('')
const PisShowDetail = inject('PisShowDetail')
const handleFn = (row) => {
  allocateId.value = row.id
  isShowDetail.value = true
  PisShowDetail.value = true
}
const handleBack = () => {
  isShowDetail.value = false
}
onMounted(() => {
  initData()
})
defineExpose({
  handleBack
})
</script>
<style lang="scss" scoped>
.back {
  display: flex;
  align-items: center;
  margin: 16px 0;
  cursor: pointer;
  line-height: 20px;
  font-weight: 400;
  font-size: 14px;
  color: #3670f8;
  .iconfont {
    text-align: center;
    font-size: 18px;
    color: #3670f8;
  }
}
</style>
