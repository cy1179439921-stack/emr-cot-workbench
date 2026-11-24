<template>
  <div class="demo-emr-panel">
    <div class="panel-body">
      <!-- 左侧：病案导航树 -->
      <aside class="record-nav">
        <div class="nav-title">病案导航</div>
        <el-scrollbar class="nav-scroll">
          <el-tree
            ref="treeRef"
            class="record-tree"
            :data="treeData"
            :props="treeProps"
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="true"
            @node-click="onNodeClick">
            <template #default="{ data }">
              <div :class="{ 'tree-node': true, 'is-leaf': !!data.component, 'is-active': data.id === activeNodeId }">
                <i :class="'iconfont ' + (data.icon || '')" v-if="data.icon"></i>
                <span class="tree-text">{{ data.title }}</span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </aside>

      <!-- 右侧：原始病历结构化数据 -->
      <section class="record-content">
        <el-scrollbar class="content-scroll">
          <div class="doc-wrap">
            <div class="doc-title">{{ activeNode?.title || '病案首页' }}</div>
            <div v-if="!sections.length" class="doc-empty">该文书暂无结构化数据</div>
            <div v-for="(section, sIndex) in sections" :key="sIndex" class="doc-section">
              <div class="section-title">{{ section.title }}</div>

              <!-- 字段网格 -->
              <div v-if="section.type === 'fields'" class="field-grid">
                <div v-for="field in section.fields" :key="field" class="field-item">
                  <span class="field-label">{{ FIELD_LABELS[field] || field }}</span>
                  <span class="field-value">{{ displayValue(sectionData[field]) }}</span>
                </div>
              </div>

              <!-- 单条诊断 -->
              <div v-else-if="section.type === 'diagnosis'" class="diag-line">
                <div class="diag-item">
                  <span class="field-label">{{ FIELD_LABELS[section.nameField] || section.nameField }}</span>
                  <span class="field-value">{{ displayValue(sectionData[section.nameField]) }}</span>
                </div>
                <div class="diag-item">
                  <span class="field-label">{{ FIELD_LABELS[section.codeField] || section.codeField }}</span>
                  <span class="field-value">{{ displayValue(sectionData[section.codeField]) }}</span>
                </div>
              </div>

              <!-- 诊断 / 手术表格 -->
              <el-table
                v-else-if="section.type === 'diagTable'"
                class="doc-table"
                :data="buildTable(sectionData, section)"
                size="small"
                border>
                <el-table-column type="index" label="序号" width="70" align="center" />
                <el-table-column prop="name" :label="FIELD_LABELS[section.names] || '名称'" min-width="200" />
                <el-table-column prop="code" :label="section.codeLabel || '疾病编码'" min-width="160" />
              </el-table>

              <!-- 长文本 -->
              <div v-else-if="section.type === 'text'" class="text-block">
                <p v-for="field in section.fields" :key="field" class="text-paragraph">
                  <template v-if="hasMultiple(section.fields) && displayValue(sectionData[field]) !== '-'">
                    <span class="paragraph-label">{{ FIELD_LABELS[field] || field }}：</span>
                  </template>
                  {{ displayValue(sectionData[field]) }}
                </p>
              </div>

              <!-- 字符串数组（诊断列表、医嘱列表等） -->
              <ol v-else-if="section.type === 'listText'" class="plain-list">
                <li v-for="(item, index) in pickList(sectionData, section.fields[0])" :key="index">{{ item }}</li>
              </ol>

              <!-- 检验报告：含明细表 -->
              <div v-else-if="section.type === 'inspectionList'" class="list-cards">
                <div v-for="(report, rIndex) in pickList(sectionData, null)" :key="rIndex" class="list-card">
                  <div class="card-head">
                    <span class="card-title">{{ report.inspection_number || '检验报告' }}{{ rIndex + 1 }}</span>
                    <span class="card-time">{{ report.time || '-' }}</span>
                  </div>
                  <div class="card-meta">
                    <span v-for="field in section.fields" :key="field" class="meta-cell">
                      <span class="field-label">{{ FIELD_LABELS[field] || field }}</span>
                      <span class="field-value">{{ displayValue(report[field]) }}</span>
                    </span>
                  </div>
                  <el-table class="doc-table inner-table" :data="report.content || []" size="small" border>
                    <el-table-column prop="name" label="项目名称" min-width="180" />
                    <el-table-column prop="value" label="结果" width="100" />
                    <el-table-column prop="unit" label="单位" width="100" />
                    <el-table-column prop="range" label="参考范围" min-width="130" />
                    <el-table-column prop="state" label="状态" width="90" />
                  </el-table>
                </div>
              </div>

              <!-- 对象数组：会诊 / 影像 / 病理 / 手术 / 医嘱 -->
              <div v-else-if="section.type === 'list'" class="list-cards">
                <div v-for="(item, rIndex) in pickList(sectionData, null)" :key="rIndex" class="list-card">
                  <div class="card-head">
                    <span class="card-title">{{ item[section.fields[0]] || '记录 ' + (rIndex + 1) }}</span>
                  </div>
                  <div class="card-meta vertical">
                    <div v-for="field in section.fields.slice(1)" :key="field" class="meta-row">
                      <span class="field-label">{{ FIELD_LABELS[field] || field }}</span>
                      <span class="field-value">{{ displayValue(item[field]) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </section>
    </div>
  </div>
</template>

<script>
export default { name: 'DemoEmrPanel' }
</script>

<script setup>
import { computed, ref, watch } from 'vue'
import { FIELD_LABELS, RECORD_LAYOUT } from '@/mock/cotCaseData'

const props = defineProps({
  // 病案导航树（父级已按当前步骤过滤）
  treeData: { type: Array, default: () => [] },
  // 原始病历 JSON（ori_data）
  oriData: { type: Object, default: () => ({}) }
})

const treeProps = { children: 'children', label: 'title' }
const treeRef = ref(null)
// 当前选中的文书节点 ID
const activeNodeId = ref('')

// 文书组件名 → 数据路径与展示蓝图 key
const COMPONENT_MAP = {
  medicalRecordHomePage: { path: ['basic_information'], layout: 'basic_information' },
  inHospitalRecord: { path: ['enter_record'], layout: 'enter_record' },
  outHospitalRecord: { path: ['exit_record'], layout: 'exit_record' },
  firstMedicalRecord: { path: ['course_record', 'first_record'], layout: 'course_record.first_record' },
  otherMedicalRecord: { path: ['course_record', 'other_records'], layout: 'course_record.other_records' },
  checkupRecord: { path: ['course_record', 'ward_records'], layout: 'course_record.ward_records' },
  consulationRecord: { path: ['consultation_record'], layout: 'consultation_record' },
  labCheck: { path: ['inspections'], layout: 'inspections' },
  imageExamination: { path: ['image_reports'], layout: 'image_reports' },
  pathology: { path: ['pathologies'], layout: 'pathologies' },
  surgeryRecord: { path: ['operations'], layout: 'operations' },
  longAdvices: { path: ['advices', 'long_advices', 'items'], layout: 'long_advices' },
  shortAdvices: { path: ['advices', 'short_advices', 'items'], layout: 'short_advices' }
}

// 深度取值，路径不存在时返回空
const pickByPath = (source, path) => path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), source)

// 默认选中第一份文书（病案首页）
const firstLeaf = computed(() => {
  const group = props.treeData?.[0]
  if (!group) return null
  return group.children?.[0] || group
})

// 当前选中节点，未手动点击时回落到第一份文书
const activeNode = computed(() => {
  if (!activeNodeId.value) return firstLeaf.value
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.id === activeNodeId.value) return node
      if (node.children?.length) {
        const found = walk(node.children)
        if (found) return found
      }
    }
    return null
  }
  return walk(props.treeData) || firstLeaf.value
})

// 树数据就绪后默认选中首份文书，保证进入即有病历内容
watch(() => props.treeData, (list) => {
  if (activeNodeId.value || !list?.length) return
  const first = list[0]
  const leaf = first.children?.[0] || first
  if (leaf?.id) activeNodeId.value = leaf.id
}, { immediate: true })

// 当前文书的原始数据片段
const sectionData = computed(() => {
  const component = activeNode.value?.component
  const mapper = COMPONENT_MAP[component]
  if (!mapper) return {}
  return pickByPath(props.oriData, mapper.path) || {}
})

// 当前文书的分区蓝图
const sections = computed(() => {
  const mapper = COMPONENT_MAP[activeNode.value?.component]
  if (!mapper) return []
  return RECORD_LAYOUT[mapper.layout] || []
})

// 点击导航节点切换文书
const onNodeClick = (data) => {
  if (!data.component) return
  activeNodeId.value = data.id
}

// 统一空值展示
const displayValue = (value) => {
  if (value === undefined || value === null || value === '') return '-'
  if (Array.isArray(value)) return value.filter(item => item !== '' && item !== undefined).join('、') || '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// 是否多个字段拼接展示（用于长文本分段加标签）
const hasMultiple = (fields) => Array.isArray(fields) && fields.length > 1

// 取数组字段，非数组时包一层
const pickList = (source, field) => {
  const value = field ? source?.[field] : source
  if (Array.isArray(value)) return value
  if (value === undefined || value === null || value === '') return []
  return [value]
}

// 拼装诊断 / 手术表格数据
const buildTable = (source, section) => {
  const names = pickList(source, section.names)
  const codes = pickList(source, section.codes)
  return names.map((name, index) => ({ name, code: codes[index] || '-' }))
}
</script>

<style lang="scss" scoped>
.demo-emr-panel {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: var(--theme-card);

  .panel-body {
    display: flex;
    overflow: hidden;
    flex: 1;
    min-height: 0;
  }

  .record-nav {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex-shrink: 0;
    width: 190px;
    border-right: 1px solid #eef1f6;
    background: var(--theme-fill);

    .nav-title {
      flex-shrink: 0;
      padding: 16px 18px 12px;
      font-weight: 500;
      font-size: 16px;
      color: #1f2d3d;
    }

    .nav-scroll {
      flex: 1;
      min-height: 0;
      padding-bottom: 16px;
    }

    :deep(.el-tree) {
      background: transparent;
      color: #4a5670;

      .el-tree-node__content {
        height: 34px;
        border-radius: 6px;
      }

      .el-tree-node__content:hover {
        background: var(--theme-primary-soft);
      }

      .el-tree-node.is-current > .el-tree-node__content {
        background: #e8f0ff;
      }
    }

    .tree-node {
      display: flex;
      overflow: hidden;
      align-items: center;
      font-size: 16px;
      gap: 6px;

      .tree-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.is-active {
        font-weight: 500;
        color: var(--theme-primary);
      }

      i.iconfont {
        font-size: 16px;
        color: #8793a8;
      }
    }
  }

  .record-content {
    overflow: hidden;
    flex: 1;
    min-width: 0;

    .content-scroll {
      height: 100%;
    }

    .doc-wrap {
      padding: 18px 22px 28px;
    }

    .doc-title {
      margin-bottom: 16px;
      font-weight: 500;
      font-size: 18px;
      color: #1f2d3d;
    }

    .doc-empty {
      padding: 40px 0;
      text-align: center;
      font-size: 16px;
      color: #a8b1c2;
    }

    .doc-section {
      margin-bottom: 22px;

      .section-title {
        margin-bottom: 10px;
        font-weight: 500;
        font-size: 16px;
        color: #1f2d3d;
      }
    }

    .field-grid {
      display: grid;
      // 字号放大后固定 3 列会让日期时间折行，改为按可用宽度自适应列数
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 10px 24px;
    }

    .field-item,
    .diag-item,
    .meta-cell {
      display: flex;
      align-items: baseline;
      line-height: 1.7;
      font-size: 16px;
      gap: 8px;
    }

    .field-label {
      flex-shrink: 0;
      color: #8793a8;
    }

    .field-value {
      color: #1f2d3d;
      overflow-wrap: anywhere;
    }

    .diag-line {
      display: flex;
      gap: 48px;
    }

    .text-block {
      .text-paragraph {
        margin: 0 0 8px;
        line-height: 1.9;
        text-align: justify;
        font-size: 16px;
        color: #1f2d3d;
      }

      .paragraph-label {
        color: #8793a8;
      }
    }

    .plain-list {
      margin: 0;
      padding-left: 20px;
      line-height: 1.9;
      font-size: 16px;
      color: #1f2d3d;
    }

    .list-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .list-card {
      padding: 12px 14px;
      border: 1px solid #eef1f6;
      border-radius: 6px;
      background: var(--theme-fill);

      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .card-title {
        font-weight: 500;
        font-size: 16px;
        color: #1f2d3d;
      }

      .card-time {
        font-size: 14px;
        color: #8793a8;
      }

      .card-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 28px;
        margin-bottom: 8px;
      }

      .card-meta.vertical {
        flex-direction: column;
        gap: 6px;
      }
    }

    :deep(.doc-table) {
      font-size: 16px;

      th.el-table__cell {
        background: var(--theme-primary-soft) !important;
        font-weight: 400;
        color: #4a5670;
      }

      td.el-table__cell {
        color: #1f2d3d;
      }
    }

    .inner-table {
      margin-top: 6px;
    }
  }
}
</style>
