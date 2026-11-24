import { ref } from 'vue'
// 值域类型
// int（整数）、float（实数）、string（字符串）、Choices（选项）、Datetime（时间）、Date（日期）
export const codomainTypeOptions = ref([
  {
    value: 1,
    label: '整数',
    showConditions: [1]
  },
  {
    value: 2,
    label: '实数',
    showConditions: [1]
  },
  {
    value: 3,
    label: '字符串',
    showConditions: [0, 2]
  },
  {
    value: 4,
    label: '选项',
    showConditions: [0, 2]
  },
  {
    value: 5,
    label: '时间',
    showConditions: [0, 2]
  },
  {
    value: 6,
    label: '日期',
    showConditions: [0, 2]
  }
])
// 单次就诊是否可能产生多个值
export const multiNumFlagOptions = ref([
  {
    value: 0,
    label: '否'
  },
  {
    value: 1,
    label: '是'
  }
])
// 指标对应检索样式
export const IndexSearchTypeOptions = ref([
  {
    value: 'text',
    label: '输入框'
  },
  {
    value: 'select',
    label: '单选下拉框'
  },
  {
    value: 'mulSelect',
    label: '多选下拉框 '
  },
  {
    value: 'relationSelect',
    label: '数值关系类型 '
  },
  {
    value: 'datetimerange',
    label: '时间日期范围选择框  '
  },
  {
    value: 'daterange',
    label: '日期范围选择框 '
  },
  {
    value: 'number',
    label: '数字类型 '
  }
])
// 需求状态字典
export const demandStatusOptions = ref([
  {
    value: 1,
    label: '激活',
    type: ''
  },
  {
    value: 2,
    label: '已变更',
    type: 'success'
  },
  {
    value: 3,
    label: '待关闭',
    type: 'danger'
  },
  {
    value: 4,
    label: '已关闭',
    type: 'warning'
  },
  {
    value: 9,
    label: '草稿',
    type: 'info'
  }
])
// 阶段字典
export const stageOptions = ref([
  {
    value: 1,
    label: '已立项',
    type: ''
  },
  {
    value: 2,
    label: '已计划',
    type: 'success'
  },
  {
    value: 3,
    label: '研发中',
    type: ''
  },
  {
    value: 4,
    label: '已完成',
    type: 'info'
  }
])
// 开发组字典
export const developGroupOptions = ref([
  {
    value: 1,
    label: '后端组'
  },
  {
    value: 2,
    label: '研发算法组'
  },
  {
    value: 3,
    label: '交付算法组'
  },
  {
    value: 4,
    label: '前端组'
  },
  {
    value: 5,
    label: '测试组'
  },
  {
    value: 6,
    label: 'UI组'
  },
  {
    value: 7,
    label: '医学组'
  },
  {
    value: 8,
    label: '统计组'
  },
  {
    value: 9,
    label: '产品组'
  },
  {
    value: 10,
    label: '运维组'
  }
])
// 来源字典
export const sourceOptions = ref([
  {
    value: 1,
    label: '客户'
  },
  {
    value: 2,
    label: '产品经理'
  },
  {
    value: 3,
    label: '开发人员'
  },
  {
    value: 4,
    label: '测试人员'
  }
])
// bug解决方案(状态)字典
export const bugSolutionOptions = ref([
  {
    value: 1,
    label: '设计如此',
    type: ''
  },
  {
    value: 2,
    label: '重复缺陷',
    type: 'success'
  },
  {
    value: 3,
    label: '外部原因',
    type: 'danger'
  },
  {
    value: 4,
    label: '已解决',
    type: 'danger'
  },
  {
    value: 5,
    label: '无法重现',
    type: ''
  },
  {
    value: 6,
    label: '延期处理',
    type: ''
  },
  {
    value: 7,
    label: '不予解决',
    type: 'info'
  }
])
// bug状态字典
export const bugStatusOptions = ref([
  {
    value: 1,
    label: '待解决',
    type: ''
  },
  {
    value: 2,
    label: '待测试',
    type: 'success'
  },
  {
    value: 3,
    label: '已解决',
    type: 'danger'
  }
])
