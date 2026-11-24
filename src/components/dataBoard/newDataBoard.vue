<template>
  <div class="container">
    <div class="list-div">
      <div class="title mp0">整体情况</div>
      <div class="statistics">
        <div class="card" v-for="(it,index) in statisticalData" :key="index">
          <div class="left">
            <div class="text">{{it.label}}</div>
            <div class="num" :class="{err:it?.err}" v-if="it.label !== '字段修改率'">{{it.value}}</div>
            <div class="num" v-else>
              {{ it.value }}%
              <el-progress :percentage="Number(it.value)" :format="()=>''" />
            </div>
          </div>
          <div class="right">
            <img :src="myRequire('med' +(index + 1) +'.png')" alt="" srcset="">
          </div>
        </div>
      </div>
      <div class="title">人员详细统计</div>
      <div class="tableMain">
        <commonTable class="singleTable btnsLastCell" :data="tableData">
          <el-table-column prop="userName" label="校对人" min-width="100"></el-table-column>
          <el-table-column prop="completedProofreadCount" label="已校对病历数" min-width="100"></el-table-column>
          <el-table-column prop="totalProofreadTimes" label="已校对次数" min-width="90"></el-table-column>
          <el-table-column prop="rejectedRecordCount" label="打回病历数" min-width="90"></el-table-column>
          <el-table-column prop="totalRejectionTimes" label="打回次数" min-width="80">
            <template #default="scope">
              <span class="err">{{scope.row.totalRejectionTimes}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rejectionRate" label="打回率" min-width="80">
            <template #default="scope">
              <span class="percentage">{{scope.row.rejectionRate}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="firstActionTime" label="首次校对时间" min-width="140"></el-table-column>
          <el-table-column prop="lastActionTime" label="最后校对时间" min-width="140"></el-table-column>
          <!-- <el-table-column prop="totalOperatingPages" label="校对总页数" min-width="80"></el-table-column> -->
          <!-- <el-table-column prop="modifiedFieldCount" label="修改字段数" min-width="90"></el-table-column> -->
          <!-- <el-table-column prop="modificationRate" label="修改率" min-width="110">
            <template #default="scope">
              <el-progress :percentage="scope.row.modificationRate || 0"/>
            </template>
          </el-table-column> -->
          <!-- <el-table-column prop="totalOperatingPages" label="校对页数" min-width="80"></el-table-column> -->
          <!-- <el-table-column prop="averageTimePerPageMinutes" label="校对每页平均用时(分钟)" min-width="130"></el-table-column> -->
          <el-table-column prop="averageTimePerRecordMinutes" label="校对每份平均用时(分钟)" min-width="130"></el-table-column>
        </commonTable>
        <div class="tabel_pagination">
          <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
            <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
          </el-pagination>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import { ref } from 'vue'
import { getBatchStatistics, getBatchUserStatistics } from '@/api/api_proofread'
import { BOARD_STATISTICS, BOARD_USER_ROWS } from '@/mock/demoModules'
const myRequire = (name) => new URL(`/src/assets/${name}`, import.meta.url).href
const tableData = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const statisticalData = ref([
  {
    label: '病历总数',
    key: 'totalRecordCount',
    value: 0
  },
  {
    label: '待校对病历数',
    key: 'pendingProofreadCount',
    value: 0
  },
  {
    label: '校对中病历数',
    key: 'proofingCount',
    value: 0
  },
  {
    label: '待复核病历数',
    key: 'pendingReviewCount',
    value: 0
  },
  {
    label: '复核中病历数',
    key: 'reviewingCount',
    value: 0
  },
  {
    label: '已完成病历数',
    key: 'completedCount',
    value: 0
  },
  {
    label: '打回病历数',
    key: 'rejectedCount',
    value: 0,
    err: true
  },
  {
    label: '打回次数',
    key: 'totalRejectionTimes',
    value: 0,
    err: true
  },
  // {
  //   label: '字段修改率',
  //   key: 'fieldModifiedRate',
  //   value: 0
  // },
  {
    label: '参与人数',
    key: 'participantCount',
    value: 0
  }
])
// 获取列表数据
const getListData = async() => {
  const params = {
    pageNum: currentPage.value,
    pageSize: limit.value
    // batchId: researchStore.curResearchQueueDetail.id
  }
  const res = await getBatchUserStatistics(params)
  if (res.code === 10000) {
    // mock 模式下接口无数据，使用演示数据兜底
    const items = res.data?.items
    tableData.value = items && items.length ? items : BOARD_USER_ROWS
    total.value = res.data?.total || BOARD_USER_ROWS.length
  }
}

const getDataStatistics = async() => {
  const res = await getBatchStatistics()
  if (res.code === 10000) {
    const data = res.data || BOARD_STATISTICS
    statisticalData.value = statisticalData.value.map(item => {
      item.value = data[item.key] || 0
      return item
    })
  }
}
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getListData()
}

// 更改每页条数
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getListData()
}

// 加载时请求页面列表
const init = async() => {
  getDataStatistics()
  getListData()
  // TODO: 替换为后端接口返回的下载地址
  // loadExcel('http://192.168.43.162:9000/verify-report/1193229482828369920-2026-04-03.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=pv97ZrZ2fluRurcJuYJB%2F20260403%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260403T091846Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=6cb0ce71b58a59e48fd083a5215ee41a41fb13e89ab24e91865a5bfb54966178')
}

init()
</script>
<style lang="scss" scoped>
.container {
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
}
.list-div {
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 24px;
  padding-bottom: 0;
  border-radius: 8px;
  background-color: var(--theme-card);
  >.title {
    position: relative;
    margin: 24px 0;
    padding-left: 12px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
    &.mp0 {
      margin-top: 0;
    }
    &::after {
      position: absolute;
      left: 0;
      top: 4px;
      width: 3px;
      height: 16px;
      background-color: #3d67ff;
      content: '';
    }
  }
  .statistics {
    display: flex;
    flex-wrap: wrap;
    .card {
      display: flex;
      justify-content: space-between;
      width: calc(100% / 5 - 16px);
      height: 102px;
      margin-right: 16px;
      margin-bottom: 24px;
      border-radius: 8px;
      background: var(--theme-primary-soft);
      &:nth-child(5n) {
        margin-right: 0;
      }
      &:nth-child(n+6) {
        margin-bottom: 0;
      }
      .right {
        display: flex;
        align-items: center;
        width: 78px;
      }
      .left {
        flex-direction: column;
        margin: 16px 0 0 21px;
        .text {
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 14px;
          color: var(--theme-text-2);
        }
        .num {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 28px;
          color: #3d3d3d;
          &.err {
            color: #ff4e4e;
          }
          :deep(.el-progress) {
            width: 78px;
            margin-left: 12px;
            .el-progress__text {
              display: none;
            }
          }
        }
      }
    }
  }
  .tableMain {
    display: flex;
    position: relative;
    flex-direction: column;
    flex: 1;
    height: 0;
    padding-bottom: 80px;
    .err {
      color: #ff4e4e;
    }
    .percentage {
      display: inline-block;
      box-sizing: border-box;
      height: 22px;
      padding: 0 8px;
      border-radius: 11px;
      background: #e2e8ff;
      line-height: 22px;
      text-align: center;
      font-weight: 500;
      font-size: 14px;
      color: #3d67ff;
    }
    :deep(.el-progress) {
      display: flex;
      flex-direction: column;
      .el-progress-bar {
        width: 96px;
        margin-bottom: 8px;
      }
    }
    .tabel_pagination {
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
<!-- vxe-table 表头换行覆盖：非 scoped，用 .list-div 限定作用域 -->
<style lang="scss">
.list-div .vxe-table {
  .vxe-header--column .vxe-cell,
  .vxe-header--column.col--ellipsis .vxe-cell {
    height: auto !important;
    line-height: 16px;
    text-overflow: unset !important;
    word-break: break-all;
    white-space: normal !important;
  }
  .vxe-cell--title {
    text-overflow: unset !important;
    white-space: normal !important;
  }
}
</style>
