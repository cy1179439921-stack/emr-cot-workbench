// 真实病例演示数据：public/static 下的 ori_data（原始病历）与 anno_data（COT 标注）成对加载
// 说明：这批数据此前未被页面引用，标注详情页改版后作为演示数据源使用。

// 演示病例清单（取中文版，与 ori_data / anno_data 文件名一一对应）
export const CASE_LIST = [
  { key: 'case_02_colon_cancer', name: '直肠恶性肿瘤伴肝肺转移' },
  { key: 'case_04_gastric_cancer', name: '胃癌' },
  { key: 'case_01_lung_cancer', name: '肺癌' },
  { key: 'case_03_ophtha', name: '眼科' },
  { key: 'case_05_sleep_disorder', name: '睡眠障碍' }
]

// 病例加载缓存：同一病例只请求一次
const caseCache = new Map()

const fetchJson = (path) => fetch(`${import.meta.env.BASE_URL}static/${path}`).then(res => res.json())

// 按病例 key 加载原始病历与标注数据
export const loadCase = async (key) => {
  if (caseCache.has(key)) return caseCache.get(key)
  const [oriData, annoData] = await Promise.all([
    fetchJson(`ori_data/${key}.json`),
    fetchJson(`anno_data/${key}.json`)
  ])
  const payload = { key, oriData, annoData }
  caseCache.set(key, payload)
  return payload
}

// 由病历 ID 稳定映射到某个演示病例，保证同一份病历每次打开看到同一病例
const pickCaseKey = (recordId) => {
  const text = String(recordId || '')
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100000
  }
  return CASE_LIST[hash % CASE_LIST.length].key
}

// 根据记录 ID 加载对应演示病例（找不到时按 hash 兜底，不会返回空）
export const loadCaseByRecordId = (recordId) => loadCase(pickCaseKey(recordId))

// ===================== 病历字段中文标签 =====================
export const FIELD_LABELS = {
  // 病案首页
  document_id: '文档编号',
  sex: '性别',
  birthday: '出生日期',
  age: '年龄',
  career: '职业',
  marital: '婚姻',
  inhospital_number: '住院次数',
  enter_time: '入院时间',
  exit_time: '出院时间',
  inhospital_days: '住院天数',
  enter_way: '入院途径',
  in_department: '入院科室',
  out_department: '出院科室',
  clinic_diagnosis_name: '门(急)诊诊断',
  clinic_diagnosis_icd10: '疾病编码',
  main_diagnosis_name: '主要诊断',
  main_diagnosis_icd10: '疾病编码',
  other_diagnosis_name: '其他诊断',
  other_diagnosis_icd10: '疾病编码',
  operations_name: '手术名称',
  operations_code: '手术编码',
  operations_time: '手术日期',
  // 入院记录
  complain: '主诉',
  present: '现病史',
  past: '既往史',
  personal: '个人史',
  family: '家族史',
  marriage: '婚育史',
  menstruation: '月经史',
  allergy: '过敏史',
  body_examination: '体格检查',
  specialist_examination: '专科检查',
  ancillary_tests: '辅助检查',
  preliminary_diagnosis: '初步诊断',
  temperature: '体温',
  pulse: '脉搏',
  respiratory: '呼吸',
  bp: '血压',
  body_height: '身高',
  body_weight: '体重',
  // 出院记录
  enter_description: '入院情况',
  enter_diagnosis: '入院诊断',
  treatment: '诊疗经过',
  out_description: '出院情况',
  out_diagnosis: '出院诊断',
  out_advice: '出院医嘱',
  // 病程记录
  course_time: '记录时间',
  description: '病例特点',
  diagnostic_basis: '诊断依据',
  differential_diagnosis: '鉴别诊断',
  plan: '诊疗计划',
  record_time: '记录时间',
  record_content: '记录内容',
  // 会诊记录
  consultation_time: '会诊时间',
  consultation_type: '会诊类型',
  request_department: '申请科室',
  consultation_department: '会诊科室',
  consultation_abstract: '会诊摘要',
  consultation_advice: '会诊意见',
  // 检验 / 检查
  inspection_number: '检验号',
  specimen_type: '标本类型',
  time: '时间',
  department: '科室',
  diagnosis: '诊断',
  content: '检验明细',
  // 影像
  part: '检查部位',
  project: '检查项目',
  findings: '检查所见',
  // 病理
  specimen: '标本',
  gross_description: '大体所见',
  // 手术
  op_name: '手术名称',
  property: '手术性质',
  incision_type: '切口类型',
  anesthesia: '麻醉方式',
  duration: '手术时长',
  bleeding_volume: '出血量',
  pre_diagnosis: '术前诊断',
  intra_diagnosis: '术后诊断',
  process: '手术经过',
  start_time: '开始时间',
  end_time: '结束时间',
  // 医嘱
  name: '医嘱名称',
  type: '医嘱类型',
  frequency: '频次',
  administration: '给药途径',
  dose_unit: '剂量单位',
  is_drug: '是否药品'
}

// ===================== COT 枚举中文映射 =====================
export const COT_LABELS = {
  template_type: {
    ACUTE_OR_FIRST_DIAGNOSIS: '首次诊断',
    CHRONIC_MAINTENANCE_ASSESSMENT: '慢病维持评估',
    PROCEDURAL_INDICATION_REVIEW: '手术指征评估'
  },
  n1_urgency_level: {
    URGENT_TREATMENT: '紧急处理',
    ROUTINE_DIAGNOSIS: '常规诊断',
    ROUTINE_MONITORING: '常规监测',
    ELECTIVE: '择期处理'
  },
  n3_treatment_strategy: {
    DIAGNOSTIC_WORKUP: '诊断性检查',
    PALLIATIVE_LIFE_PROLONGING: '姑息延长生存',
    ROUTINE_MAINTENANCE: '常规维持',
    SURGICAL_DEFINITIVE: '手术根治',
    SYMPTOM_CONTROL_SUPPORTIVE: '对症支持'
  },
  n4_deviation_nature: {
    ALIGNED_WITH_STANDARD: '符合标准路径',
    JUSTIFIED_TRADEOFF: '合理权衡偏离'
  },
  n5_outcome_dimension: {
    FUNCTIONAL_OR_PSYCHIATRIC: '功能或精神维度',
    PHYSIOLOGICAL_OR_LAB: '生理或检验维度',
    PROCEDURAL_OR_SURGICAL: '手术或操作维度',
    SYMPTOMATIC: '症状维度'
  },
  evidence_scope: {
    EXACT_ONLY: '精确匹配',
    CURRENT_LINE_CONTEXT: '当前行上下文',
    CURRENT_SECTION_CONTEXT: '当前段落上下文'
  },
  evidence_quality: {
    DIRECT_DOCUMENTED: '直接记录',
    INFERRED_REASONABLE: '合理推断'
  }
}

// ===================== 病历文书分区展示蓝图 =====================
// type: fields 字段网格 / diagnosis 单条诊断 / diagTable 诊断表格 / list 明细卡片 / text 长文本
export const RECORD_LAYOUT = {
  basic_information: [
    { title: '基本信息', type: 'fields', fields: ['document_id', 'sex', 'birthday', 'age', 'career', 'marital'] },
    { title: '入出院信息', type: 'fields', fields: ['enter_time', 'exit_time', 'inhospital_days', 'enter_way', 'in_department', 'out_department'] },
    { title: '门(急)诊诊断信息', type: 'diagnosis', nameField: 'clinic_diagnosis_name', codeField: 'clinic_diagnosis_icd10' },
    { title: '出院诊断 · 主要诊断', type: 'diagnosis', nameField: 'main_diagnosis_name', codeField: 'main_diagnosis_icd10' },
    { title: '出院诊断 · 其他诊断', type: 'diagTable', names: 'other_diagnosis_name', codes: 'other_diagnosis_icd10' },
    { title: '手术信息', type: 'diagTable', names: 'operations_name', codes: 'operations_time', codeLabel: '手术日期' }
  ],
  enter_record: [
    { title: '主诉', type: 'fields', fields: ['complain'] },
    { title: '现病史', type: 'text', fields: ['present'] },
    { title: '既往史与个人史', type: 'text', fields: ['past', 'personal', 'family', 'marriage', 'menstruation', 'allergy'] },
    { title: '体格检查', type: 'fields', fields: ['temperature', 'pulse', 'respiratory', 'bp', 'body_height', 'body_weight'] },
    { title: '专科检查', type: 'text', fields: ['specialist_examination'] },
    { title: '初步诊断', type: 'listText', fields: ['preliminary_diagnosis'] }
  ],
  exit_record: [
    { title: '入院情况', type: 'text', fields: ['enter_description'] },
    { title: '入院诊断', type: 'listText', fields: ['enter_diagnosis'] },
    { title: '诊疗经过', type: 'text', fields: ['treatment'] },
    { title: '出院情况', type: 'text', fields: ['out_description'] },
    { title: '出院诊断', type: 'listText', fields: ['out_diagnosis'] },
    { title: '出院医嘱', type: 'listText', fields: ['out_advice'] }
  ],
  'course_record.first_record': [
    { title: '病例特点', type: 'text', fields: ['description'] },
    { title: '诊断依据', type: 'text', fields: ['diagnostic_basis'] },
    { title: '鉴别诊断', type: 'text', fields: ['differential_diagnosis'] },
    { title: '初步诊断', type: 'listText', fields: ['preliminary_diagnosis'] },
    { title: '诊疗计划', type: 'text', fields: ['plan'] }
  ],
  'course_record.other_records': [
    { title: '病程记录', type: 'list', fields: ['record_time', 'record_content'] }
  ],
  'course_record.ward_records': [
    { title: '查房记录', type: 'list', fields: ['record_time', 'record_content'] }
  ],
  consultation_record: [
    { title: '会诊记录', type: 'list', fields: ['consultation_time', 'consultation_type', 'request_department', 'consultation_department', 'consultation_abstract', 'consultation_advice'] }
  ],
  inspections: [
    { title: '检验报告', type: 'inspectionList', fields: ['time', 'department', 'specimen_type', 'diagnosis'] }
  ],
  image_reports: [
    { title: '影像报告', type: 'list', fields: ['time', 'department', 'part', 'project', 'findings', 'diagnosis'] }
  ],
  pathologies: [
    { title: '病理报告', type: 'list', fields: ['time', 'department', 'specimen', 'gross_description', 'diagnosis'] }
  ],
  operations: [
    { title: '手术记录', type: 'list', fields: ['op_name', 'start_time', 'end_time', 'property', 'incision_type', 'anesthesia', 'duration', 'bleeding_volume', 'pre_diagnosis', 'intra_diagnosis', 'process'] }
  ],
  long_advices: [
    { title: '长期医嘱', type: 'list', fields: ['name', 'type', 'frequency', 'administration', 'start_time', 'end_time'] }
  ],
  short_advices: [
    { title: '临时医嘱', type: 'list', fields: ['name', 'type', 'frequency', 'administration', 'start_time', 'end_time'] }
  ]
}

// ===================== COT 各步字段分组 =====================
// type: enum 枚举单值 / kv 对象字段 / list 字符串数组 / text 长文本 / tagList 对象数组
export const COT_NODE_SECTIONS = {
  1: [
    {
      title: '核心结构化字段',
      type: 'grid',
      items: [
        { label: '模板类型', field: 'template_type', type: 'enum' },
        { label: '紧急度', field: 'n1_urgency_level', type: 'enum' },
        { label: '初步印象', field: 'n1_primary_impressions', type: 'list', full: true },
        { label: '鉴别诊断', field: 'n1_differential_list', type: 'list', full: true }
      ]
    },
    { title: '思维链', type: 'text', field: 'n1_diagnostic_logic_cot' }
  ],
  2: [
    {
      title: '核心结构化字段',
      type: 'grid',
      items: [
        { label: '临床问题', field: 'n2_clinical_questions', type: 'list', full: true },
        { label: '计划检查', field: 'n2_intended_test_orders', type: 'list', full: true },
        { label: '实际检查', field: 'n2_actual_test_orders', type: 'list', full: true },
        { label: '遗漏或延迟', field: 'n2_missed_or_delayed_tests', type: 'list', full: true },
        { label: '危急值', field: 'n2_critical_values', type: 'list', full: true }
      ]
    },
    { title: '思维链', type: 'text', field: 'n2_decision_cot' }
  ],
  3: [
    {
      title: '核心结构化字段',
      type: 'grid',
      items: [
        { label: '严重程度分期', field: 'n3_severity_staging', type: 'kv', full: true },
        { label: '治疗策略', field: 'n3_treatment_strategy', type: 'enum', full: true }
      ]
    },
    { title: '思维链', type: 'text', field: 'n3_strategy_logic_cot' }
  ],
  4: [
    {
      title: '核心结构化字段',
      type: 'grid',
      items: [
        { label: '标准方案', field: 'n4_standard_regimen', type: 'list', full: true },
        { label: '实际方案', field: 'n4_actual_regimen', type: 'list', full: true },
        { label: '偏离性质', field: 'n4_deviation_nature', type: 'enum', full: true },
        { label: '患者约束', field: 'n4_patient_constraints', type: 'list', full: true },
        { label: '禁用方案', field: 'n4_forbidden_regimens_list', type: 'list', full: true }
      ]
    },
    { title: '思维链', type: 'text', field: 'n4_tradeoff_logic_cot' }
  ],
  5: [
    {
      title: '核心结构化字段',
      type: 'grid',
      items: [
        { label: '住院内结局', field: 'n5_outcome_observable_within_admission', type: 'text', full: true },
        { label: '结局维度', field: 'n5_outcome_dimension', type: 'enum', full: true },
        { label: '结局取值', field: 'n5_outcome_value', type: 'text', full: true },
        { label: '随访结局', field: 'n5_followup_outcome', type: 'text', full: true },
        { label: '不良事件', field: 'n5_adverse_events_list', type: 'list', full: true },
        { label: '应急处置', field: 'n5_emergency_actions', type: 'list', full: true }
      ]
    },
    { title: '思维链', type: 'text', field: 'n5_adaptation_logic_cot' }
  ]
}

// 各步骤对应的标注节点 key
export const COT_NODE_KEYS = {
  1: 'node_1_initial_presentation',
  2: 'node_2_investigation_interpretation',
  3: 'node_3_status_anchor',
  4: 'node_4_tailored_treatment',
  5: 'node_5_longitudinal_adaptation'
}

// ===================== COT 对象字段的中文键名 =====================
export const KV_LABELS = {
  clinical_grading: '临床分级',
  cTNM: 'cTNM 分期',
  pTNM: 'pTNM 分期',
  stage: '分期',
  grade: '分级',
  // 思维链分步（N2 / N4 的 cot 对象）
  step_1_clinical_question: '① 临床问题',
  step_2_test_choice_logic: '② 检查选择逻辑',
  step_3_actual_vs_planned_gap: '③ 实际与计划偏差',
  step_4_result_reshapes_downstream: '④ 结果对下游决策的影响',
  step_1_standard_baseline: '① 标准方案基线',
  step_2_constraint_interception: '② 约束条件拦截',
  step_3_clinical_balancing: '③ 临床权衡',
  step_4_safety_guarantee: '④ 安全保障',
  // 禁用方案条目
  forbidden_item: '禁用方案',
  forbidden_reason_type: '禁用原因',
  severity_level: '警示级别',
  // 不良事件条目
  ae_name: '事件名称',
  ae_grade: '严重程度',
  ae_attribution: '归因'
}

// 取对象字段的中文键名（兼容 step_1_xxx 这类带序号前缀的键）
export const kvLabel = (key) => {
  if (!key) return ''
  if (KV_LABELS[key]) return KV_LABELS[key]
  const matched = Object.keys(KV_LABELS).find(labelKey => key.endsWith(labelKey))
  return matched ? KV_LABELS[matched] : key
}

// 取任意枚举的中文标签（未收录时原样返回）
export const labelOf = (group, value) => {
  if (value === undefined || value === null || value === '') return '-'
  return COT_LABELS[group]?.[value] || String(value)
}
