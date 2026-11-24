<template>
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
      <commonTable class="singleTable btnsLastCell" :data="tableData" :border="true">
        <el-table-column prop="userName" label="校对人" min-width="100"></el-table-column>
        <el-table-column prop="completedProofreadCount" label="已校对病历数" min-width="100"></el-table-column>
        <el-table-column prop="totalProofreadTimes" label="已校对次数" min-width="90"></el-table-column>
        <el-table-column prop="completedReviewCount" label="已复核病历数" min-width="100"></el-table-column>
        <el-table-column prop="firstActionTime" label="首次校对时间" min-width="140"></el-table-column>
        <el-table-column prop="lastActionTime" label="最后校对时间" min-width="140"></el-table-column>
        <!-- <el-table-column prop="totalOperatingPages" label="校对总页数" min-width="80"></el-table-column> -->
        <el-table-column prop="modifiedFieldCount" label="修改字段数" min-width="90"></el-table-column>
        <el-table-column prop="modificationRate" label="修改率" min-width="110">
          <template #default="scope">
            <el-progress :percentage="scope.row.modificationRate || 0"/>
          </template>
        </el-table-column>
        <el-table-column prop="totalOperatingPages" label="校对页数" min-width="80"></el-table-column>
        <el-table-column prop="averageTimePerPageMinutes" label="校对每页平均用时(分钟)" min-width="130"></el-table-column>
        <el-table-column prop="averageTimePerRecordMinutes" label="校对每份平均用时(分钟)" min-width="130"></el-table-column>
      </commonTable>
      <div class="tabel_pagination">
        <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
          <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
        </el-pagination>
      </div>
    </div>
    <div class="title mp0">字段详细统计</div>
    <div class="tableMain">
      <vxe-table
        ref="excelTableRef"
        border
        :row-config="{ isHover: true }"
        :scroll-y="{ enabled: true, gt: 50 }"
        :show-header-overflow="false"
        :header-row-style="{ height: 'auto' }"
        :header-cell-style="{ height: 'auto' }"
        height="590"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick } from 'vue'
import * as XLSX from 'xlsx'
import { getBatchStatistics, getBatchUserStatistics, getFieldReport } from '@/api/api_proofread'
import { useResearchStore } from '@/store/researchStore'
const researchStore = useResearchStore()
const myRequire = (name) => new URL(`/src/assets/${name}`, import.meta.url).href
const tableData = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const excelTableRef = ref(null)
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
    label: '字段修改率',
    key: 'fieldModifiedRate',
    value: 0
  },
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
    pageSize: limit.value,
    batchId: researchStore.curResearchQueueDetail.id
  }
  const res = await getBatchUserStatistics(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}

const getDataStatistics = async() => {
  const res = await getBatchStatistics({ batchId: researchStore.curResearchQueueDetail.id })
  if (res.code === 10000) {
    statisticalData.value = statisticalData.value.map(item => {
      item.value = res.data[item.key] || 0
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

// ========== Excel 解析 & vxe-table 渲染 ==========

/**
 * 推断表头行数：取水平合并 + 首列纵向合并的最大行
 */
const detectHeaderRowCount = (merges) => {
  const hMerges = merges.filter(m => m.e.c > m.s.c)
  const vMerges = merges.filter(m => m.s.c <= 1 && m.s.r === 0 && m.e.r > m.s.r)
  const allHeaderMerges = [...hMerges, ...vMerges]
  if (allHeaderMerges.length) {
    return Math.max(...allHeaderMerges.map(m => m.e.r)) + 1
  }
  return 1
}

/**
 * 将合并单元格的值填充到所有被合并的位置
 */
const fillMergedCells = (rawRows, merges) => {
  const filledRows = rawRows.map(row => [...row])
  for (const merge of merges) {
    const val = filledRows[merge.s.r]?.[merge.s.c] ?? ''
    for (let r = merge.s.r; r <= merge.e.r; r++) {
      for (let c = merge.s.c; c <= merge.e.c; c++) {
        if (filledRows[r]) filledRows[r][c] = val
      }
    }
  }
  return filledRows
}

/**
 * 构建多级表头列配置，只有叶子列有 field
 */
const buildColumnConfig = (filledRows, merges, headerRowCount, colCount) => {
  let leafSeq = 0

  // 表头区域内纵向合并映射: (col, startRow) -> endRow
  const vMergeMap = {}
  for (const m of merges) {
    if (m.s.r < headerRowCount && m.e.c === m.s.c && m.e.r > m.s.r) {
      vMergeMap[`${m.s.c}_${m.s.r}`] = m.e.r
    }
  }

  const build = (start, end, rowIdx) => {
    if (rowIdx >= headerRowCount) return null
    const cols = []
    let i = start
    while (i <= end) {
      const title = String(filledRows[rowIdx]?.[i] || '')
      let colEnd = i
      if (rowIdx + 1 < headerRowCount) {
        for (let j = i + 1; j <= end; j++) {
          if (filledRows[rowIdx]?.[j] !== title) break
          colEnd = j
        }
      }
      const col = { title, showHeaderOverflow: false }
      // 第一列内容固定、不需换行，设置更宽的宽度
      const colWidth = leafSeq === 0 ? 180 : 120
      // 纵向合并的列直接作为叶子列
      if (vMergeMap[`${i}_${rowIdx}`] !== undefined) {
        col.field = `f${leafSeq++}`
        col.width = colWidth
      } else {
        const children = build(i, colEnd, rowIdx + 1)
        if (children?.length) col.children = children
        if (!col.children) {
          col.field = `f${leafSeq++}`
          col.width = colWidth
        }
      }
      cols.push(col)
      i = colEnd + 1
    }
    return cols
  }

  const columns = build(0, colCount - 1, 0) || []
  return { columns, leafCount: leafSeq }
}

/**
 * 收集列配置中的叶子字段名
 */
const collectLeafFields = (columns) => {
  const fields = []
  const collect = (cols) => {
    for (const col of cols) {
      if (col.children?.length) collect(col.children)
      else fields.push(col.field)
    }
  }
  collect(columns)
  return fields
}

/**
 * 将原始行数据转换为 vxe-table 数据格式
 */
const buildTableData = (rawRows, headerRowCount, leafFields) => {
  return rawRows.slice(headerRowCount).map(row => {
    const obj = {}
    leafFields.forEach((field, idx) => {
      obj[field] = row[idx] ?? ''
    })
    return obj
  })
}

/**
 * 构建数据区域的合并单元格配置
 */
const buildDataMergeCells = (merges, headerRowCount) => {
  return merges
    .filter(m => m.s.r >= headerRowCount)
    .map(m => ({
      row: m.s.r - headerRowCount,
      col: m.s.c,
      rowspan: m.e.r - m.s.r + 1,
      colspan: m.e.c - m.s.c + 1
    }))
}

/**
 * 加载 Excel 并渲染到 vxe-table
 * 仅通过 vxe-table API 方法加载列和数据，避免属性绑定导致的双重渲染
 */
const loadExcel = async(url) => {
  try {
    // 1. 下载并解析 Excel
    const response = await fetch(url)
    if (!response.ok) throw new Error(`fetch 失败: ${response.status}`)
    const buffer = await response.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    const merges = sheet['!merges'] || []

    if (!rawRows.length) return

    // 2. 解析表头与列配置
    const headerRowCount = detectHeaderRowCount(merges)
    const filledRows = fillMergedCells(rawRows, merges)
    const colCount = Math.max(...rawRows.slice(0, headerRowCount).map(r => r.length))
    const { columns } = buildColumnConfig(filledRows, merges, headerRowCount, colCount)

    // 3. 构建数据行
    const leafFields = collectLeafFields(columns)
    const data = buildTableData(rawRows, headerRowCount, leafFields)

    // 4. 构建合并单元格配置
    const mc = buildDataMergeCells(merges, headerRowCount)

    // 5. 通过 API 方法一次性加载列和数据（避免双重渲染）
    await nextTick()
    const $table = excelTableRef.value
    if (!$table) return

    await $table.loadColumn(columns)
    await $table.loadData(data)
    if (mc.length) {
      await nextTick()
      $table.setMergeCells(mc)
    }
    // 强制重算表格布局，使表头行高适应换行内容
    await nextTick()
    await $table.recalculate(true)
  } catch (e) {
    console.error('Excel加载失败:', e)
  }
}
// 字段统计接口
const getFieldStatistics = async() => {
  const res = await getFieldReport({
    id: researchStore.curResearchQueueDetail.id
  })
  console.log(res)
  if (res.code === 10000) {
    let fileUrl = ''
    if (process.env.NODE_ENV === 'development') {
      fileUrl = `http://192.168.43.162:9000${res.data.replace('/minio', '')}`
    } else {
      fileUrl = `${window.location.origin}/${res.data}`
    }
    loadExcel(fileUrl)
  }
}
// 加载时请求页面列表
const init = async() => {
  getDataStatistics()
  getListData()
  getFieldStatistics()
  // TODO: 替换为后端接口返回的下载地址
  // loadExcel('http://192.168.43.162:9000/verify-report/1193229482828369920-2026-04-03.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=pv97ZrZ2fluRurcJuYJB%2F20260403%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260403T091846Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=6cb0ce71b58a59e48fd083a5215ee41a41fb13e89ab24e91865a5bfb54966178')
}

init()
</script>
<style lang="scss" scoped>
.list-div {
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 24px;
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
