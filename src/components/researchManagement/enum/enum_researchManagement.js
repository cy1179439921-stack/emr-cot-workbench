// enum_researchManagement.js
const createEnum = (arr) => {
  return arr.map(item => {
    return { label: item, value: item }
  })
}

// 项目类别
export const enum_project_type = [
  {
    value: 1,
    label: '纵向课题'
  },
  {
    value: 2,
    label: '横向课题'
  }
]
// 项目级别
export const enum_project_level = [
  {
    value: 1,
    label: '国家级'
  },
  {
    value: 2,
    label: '省部级'
  },
  {
    value: 3,
    label: '厅局级'
  },
  {
    value: 4,
    label: '院校级'
  }
]

// 项目来源
export const enum_project_source = [
  {
    value: 1,
    label: '国家重点研发计划'
  },
  {
    value: 2,
    label: '国家科技支撑计划'
  },
  {
    value: 3,
    label: '重大新药创新'
  },
  {
    value: 4,
    label: '国家科技重大专项'
  },
  {
    value: 5,
    label: '国家自然科学基金'
  }
]

// 项目属性
export const enum_project_property = [
  {
    label: '牵头',
    value: 1
  },
  {
    label: '参与',
    value: 2
  }
]

// 性别
export const enum_gender = [
  {
    label: '男',
    value: 1
  },
  {
    label: '女',
    value: 2
  }
]

// 学历
export const enum_education = createEnum([
  '无',
  '初中',
  '高中',
  '中专',
  '专科',
  '本科',
  '研究生',
  '其他'
])

// 学位
export const enum_degree = createEnum([
  '学士',
  '硕士',
  '博士',
  '其他'
])

// 职称
export const enum_title = createEnum([
  '高级工程师',
  '工程师',
  '助理工程师',
  '研究员',
  '副研究员',
  '助理研究员',
  '研究实习员',
  '教授',
  '副教授',
  '讲师',
  '助教',
  '主任医师',
  '副主任医师',
  '主治医师',
  '医师',
  '主任药师',
  '副主任药师',
  '主管药师',
  '药师',
  '主任护师',
  '副主任护师',
  '主管护师',
  '护师',
  '主任技师',
  '副主任技师',
  '主管技师',
  '技师',
  '高级实验师',
  '实验师',
  '助理实验师',
  '高级经济师',
  '经济师',
  '助理经济师',
  '高级会计师',
  '会计师',
  '助理会计师',
  '高级统计师',
  '统计师',
  '助理统计师',
  '编审',
  '副编审',
  '编辑',
  '助理编辑',
  '研究馆员',
  '副研究馆员',
  '馆员',
  '助理馆员'
])

export const enum_status = [
  {
    value: 1,
    label: '暂存',
    color: '#C5C4C4'
  },
  {
    value: 2,
    label: '审批中',
    color: '#3670F8'
  },
  {
    value: 3,
    label: '已驳回',
    color: '#FF4E4E'
  },
  {
    value: 4,
    label: '已通过',
    color: '#04A273'
  },
  {
    value: 5,
    label: '已撤销',
    color: '#F59F0C'
  }
]
export const approve_status = [
  {
    value: 0,
    label: '通过',
    color: '#04A273'
  },
  {
    value: 1,
    label: '驳回',
    color: '#FF4E4E'
  }
]

// 获奖级别
export const enum_award_level = [
  {
    value: 1,
    label: '国家级'
  },
  {
    value: 2,
    label: '省部级'
  },
  {
    value: 3,
    label: '厅局级'
  },
  {
    value: 4,
    label: '其他'
  }
]

export const enum_award_level2 = createEnum([
  '国家级',
  '省部级',
  '厅局级',
  '其他'
])
// 获奖等级
export const enum_award_grade = [
  {
    value: 1,
    label: '特等奖'
  },
  {
    value: 2,
    label: '一等奖'
  },
  {
    value: 3,
    label: '二等奖'
  },
  {
    value: 4,
    label: '三等奖'
  },
  {
    value: 5,
    label: '科普奖'
  },
  {
    value: 6,
    label: '管理奖'
  }
]
export const enum_award_grade2 = createEnum([
  '特等奖',
  '一等奖',
  '二等奖',
  '三等奖',
  '科普奖',
  '管理奖'
])
// 论文类型
export const enum_paper_type = createEnum([
  '期刊论文',
  '博士研究生论文',
  '硕士研究生论文',
  '会议论文',
  '其他'
])

// 专利类型
export const enum_patent_type = createEnum([
  '发明专利',
  '实用新型专利',
  '外观设计专利'
])

// 期刊等级
export const enum_journal_level = createEnum([
  '中文核心',
  '科技核心',
  '非核心'
])

// 作者类型
export const enum_author_type = createEnum([
  '第一作者',
  '通讯作者',
  '共同第一作者',
  '共同通讯作者',
  '其他作者'
])

// 著作作者类型
export const enum_book_author_type = createEnum([
  '主编',
  '副主编',
  '编委',
  '主译',
  '译者'
])

// 著作类别
export const enum_book_type = createEnum([
  '专著',
  '编著',
  '译著',
  '教材',
  '其他'
])
