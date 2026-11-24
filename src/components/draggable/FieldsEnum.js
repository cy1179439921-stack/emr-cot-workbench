export default [
  {
    label: '病案首页',
    value: 'basic_information',
    children: [
      {
        label: '基本信息',
        children: [
          {
            label: '文档编号',
            value: 'document_id'
          },
          {
            label: '性别',
            value: 'sex'
          },
          {
            label: '出生日期',
            value: 'birthday'
          },
          {
            label: '年龄',
            value: 'age'
          },
          {
            label: '职业',
            value: 'career'
          },
          {
            label: '婚姻',
            value: 'marital'
          },
          {
            label: '出生地',
            value: 'address'
          }
        ]
      },
      {
        label: '入出院信息',
        children: [
          {
            label: '入院时间',
            value: 'enter_time'
          },
          {
            label: '出院时间',
            value: 'exit_time'
          },
          {
            label: '住院天数',
            value: 'inhospital_days'
          },
          {
            label: '第几次住院',
            value: 'inhospital_number'
          },
          {
            label: '入院途径',
            value: 'enter_way'
          },
          {
            label: '入院科室',
            value: 'in_department'
          },
          {
            label: '出院科室',
            value: 'out_department'
          }
        ]
      },
      {
        label: '门（急）诊诊断信息',
        value: 'clinic_diagnosis_name'
        // children: [
        //   {
        //     label: '诊断名称',
        //     value: ''
        //   },
        //   {
        //     label: '疾病编码',
        //     value: ''
        //   }
        // ]
      },
      {
        label: '出院诊断-主要诊断',
        value: 'main_diagnosis_name'
        // children: [
        //   {
        //     label: '诊断名称',
        //     value: ''
        //   },
        //   {
        //     label: '疾病编码',
        //     value: ''
        //   }
        // ]
      },
      {
        label: '出院诊断-其他诊断',
        value: 'other_diagnosis_name',
        children: [
          {
            label: '0',
            value: ''
          }
        ],
        type: 'EDIT',
        fieldName: 'other_diagnosis_name'
      },
      {
        label: '手术信息',
        value: 'operations_name'
      }
    ]
  },
  {
    label: '入院记录',
    value: 'enter_record',
    children: [
      {
        label: '主诉',
        value: 'complain'
      },
      {
        label: '现病史',
        value: 'present'
      },
      {
        label: '既往史',
        value: 'past'
      },
      {
        label: '个人史',
        value: 'personal'
      },
      {
        label: '过敏史',
        value: 'allergy'
      },
      {
        label: '婚育史',
        value: 'marriage'
      },
      {
        label: '月经史',
        value: 'menstruation'
      },
      {
        label: '家族史',
        value: 'family'
      },
      {
        label: '体格检查',
        value: 'body_examination'
      },
      {
        label: '专科检查',
        value: 'specialist_examination'
      },
      {
        label: '辅助检查',
        key: 'ancillary_tests'
      },
      {
        label: '体温（°C）',
        key: 'temperature'
      },
      {
        label: '脉搏（次/分）',
        key: 'pulse'
      },
      {
        label: '血压（收缩压/舒张压 mmHG）',
        key: 'bp'
      },
      {
        label: '呼吸（次/分）',
        key: 'respiratory'
      },
      {
        label: '身高（cm）',
        key: 'body_height'
      },
      {
        label: '体重（kg）',
        key: 'body_weight'
      },
      {
        label: '初步诊断',
        key: 'preliminary_diagnosis'
      }

    ]
  },
  {
    label: '出院记录',
    value: 'exit_record',
    children: [
      { label: '入院情况', value: 'enter_description' },
      { label: '入院诊断', value: 'enter_diagnosis' },
      { label: '诊疗情况', value: 'treatment' },
      { label: '出院情况', value: 'out_diagnosis' },
      { label: '出院诊断', value: 'out_description' },
      { label: '出院医嘱', value: 'out_advice' }
    ]
  },
  {
    label: '首次病程记录',
    value: 'first_record',
    children: [
      { label: '首次病程时间', value: 'course_time' },
      { label: '初步诊断', value: 'preliminary_diagnosis' },
      { label: '病例特点', value: 'description' },
      { label: '诊断依据', value: 'diagnostic_basis' },
      { label: '鉴别诊断', value: 'differential_diagnosis' },
      { label: '诊疗计划', value: 'plan' }
    ]
  },
  {
    label: '其他病程记录',
    value: 'other_record',
    children: [
      { label: '记录类型', value: 'record_type' },
      { label: '记录时间', value: 'record_time' },
      { label: '文档内容', value: 'record_content' }
    ]
  },
  {
    label: '查房记录',
    value: 'ward_record',
    children: []
    // 需要动态处理
  },
  {
    label: '会诊记录',
    value: 'consultation_record',
    children: []
    // 需要动态处理
  },
  {
    label: '检验报告',
    value: 'inspections',
    children: []
    // 需要动态处理
  },
  {
    label: '影像报告',
    value: 'image_reports',
    children: [
      {
        label: '0',
        value: '0',
        children: [
          { label: '科室', value: 'department' },
          { label: '检查项目', value: 'project' },
          { label: '检查部位', value: 'part' },
          { label: '检查时间', value: 'time' },
          { label: '检查所见', value: 'findings' },
          { label: '检查结论', value: 'diagnosis' }
        ]
      }
    ]
    // 需要动态处理
  },
  {
    label: '病理报告',
    value: 'pathologies',
    children: [
      {
        label: '0',
        value: '0',
        children: [
          { label: '报告时间', value: 'time' },
          { label: '送检科室', value: 'department' },
          { label: '送检标本', value: 'specimen' },
          { label: '巨检（肉眼所见）', value: 'gross_description' },
          { label: '病理诊断', value: 'diagnosis' }
        ]
      }
    ]
    // 需要动态处理
  },
  {
    label: '手术记录',
    value: 'operation',
    children: [
      {
        label: '0',
        value: '0',
        children: [
          { label: '手术开始时间', value: 'start_time' },
          { label: '手术结束时间', value: 'end_time' },
          { label: '手术名称', value: 'op_name' },
          { label: '术前诊断', value: 'pre_diagnosis' },
          { label: '术中诊断', value: 'intra_diagnosis' },
          { label: '手术经过', value: 'process' },
          { label: '手术持续时间', value: 'duration' },
          { label: '手术性质', value: 'property' },
          { label: '切口类型', value: 'incision_type' },
          { label: '麻醉方法', value: 'anesthesia' }
        ]
      }
    ]
    // 需要动态处理
  },
  {
    label: '会诊记录',
    value: 'consultation_record',
    children: [
      {
        label: '0',
        value: '0',
        children: [
          { label: '会诊类型', value: 'consultation_type' },
          { label: '会诊时间', value: 'consultation_time' },
          { label: '申请科室', value: 'request_department' },
          { label: '被邀请科室', value: 'consultation_department' },
          { label: '会诊摘要', value: 'consultation_abstract' },
          { label: '会诊意见', value: 'consultation_advice' }
        ]
      }
    ]
    // 需要动态处理
  },
  {
    label: '长期医嘱',
    value: 'long_advices',
    children: [
      {
        label: '0',
        value: '0',
        children: [
          { label: '长期医嘱开始时间', value: 'start_time' },
          { label: '长期医嘱内容', value: 'advices' },
          { label: '长期医嘱类型', value: 'type' },
          { label: '是否药品医嘱', value: 'is_drug' },
          { label: '给药途径', value: 'administration' },
          { label: '给药频次', value: 'frequency' },
          { label: '单次剂量及单位', value: 'dose_unit' },
          { label: '长期医嘱结束时间', value: 'end_time' }
        ]
      }
    ]
    // 需要动态处理
  },
  {
    label: '临时医嘱',
    value: 'short_advices',
    children: [
      {
        label: '0',
        value: '0',
        children: [
          { label: '临时医嘱时间', value: 'time' },
          { label: '临时医嘱执行时间', value: 'excute_time' },
          { label: '临时医嘱内容', value: 'advices' },
          { label: '临时医嘱类型', value: 'type' },
          { label: '是否药品医嘱', value: 'is_drug' },
          { label: '给药途径', value: 'administration' },
          { label: '单次剂量及单位', value: 'dose_unit' }
        ]
      }
    ]
    // 需要动态处理
  }
]
