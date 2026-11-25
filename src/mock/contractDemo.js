// ===================== 劳务合同管理：演示数据 =====================
// 演示环境没有后端时，列表与详情用它兜底，覆盖待发起 / 待签署 / 已签署 / 已驳回 / 已过期

const docImage = (title, sub) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200">
    <rect width="320" height="200" rx="10" fill="#fdf6ee"/>
    <rect x="10" y="10" width="300" height="180" rx="8" fill="none" stroke="#e8cfae" stroke-dasharray="6 5"/>
    <text x="160" y="92" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="18" fill="#a9762f">${title}</text>
    <text x="160" y="122" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="12" fill="#b9a08a">${sub}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const CONTRACT_DEMO_LIST = [
  {
    id: 'CT-2001',
    contractNo: 'LW202611210001',
    expertName: '李文博',
    expertPhone: '13800138001',
    hospitalName: '滕州市中心人民医院',
    deptName: '心内科',
    contractStatus: 'INITIATED',
    submitTime: '2026-11-21 10:12:00',
    signedTime: '',
    idCardNo: '370402197805124312',
    idCardFrontUrl: docImage('身份证 · 人像面', '演示占位图'),
    idCardBackUrl: docImage('身份证 · 国徽面', '演示占位图'),
    accountName: '李文博',
    bankAccountId: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行',
    bankPhone: '13800138001',
    rejectReason: '',
    contractFile: '颐邦小源专家劳务协议.pdf',
    remarkList: [
      { id: 'N-1', createTime: '2026-11-21 10:20:00', noteText: '已电话确认签约意愿，等待专家在线签署。' }
    ]
  },
  {
    id: 'CT-2002',
    contractNo: 'LW202611180002',
    expertName: '周敏',
    expertPhone: '13900139002',
    hospitalName: '枣庄市立医院',
    deptName: '肾内科',
    contractStatus: 'SIGNED',
    submitTime: '2026-11-18 09:30:00',
    signedTime: '2026-11-18 15:42:00',
    idCardNo: '370403198902187745',
    idCardFrontUrl: docImage('身份证 · 人像面', '演示占位图'),
    idCardBackUrl: docImage('身份证 · 国徽面', '演示占位图'),
    accountName: '周敏',
    bankAccountId: '6217000200115566778',
    bankBranch: '中国建设银行枣庄分行营业部',
    bankPhone: '13900139002',
    rejectReason: '',
    contractFile: '颐邦小源专家劳务协议.pdf',
    remarkList: []
  },
  {
    id: 'CT-2003',
    contractNo: 'LW202611160003',
    expertName: '陈立新',
    expertPhone: '13700137003',
    hospitalName: '枣庄矿业集团中心医院',
    deptName: '急诊科',
    contractStatus: 'SIGNED',
    submitTime: '2026-11-16 11:05:00',
    signedTime: '2026-11-16 19:20:00',
    idCardNo: '370405198011052219',
    idCardFrontUrl: docImage('身份证 · 人像面', '演示占位图'),
    idCardBackUrl: docImage('身份证 · 国徽面', '演示占位图'),
    accountName: '陈立新',
    bankAccountId: '6228480201223344556',
    bankBranch: '中国农业银行枣庄市中支行',
    bankPhone: '13700137003',
    rejectReason: '',
    contractFile: '颐邦小源专家劳务协议.pdf',
    remarkList: [
      { id: 'N-2', createTime: '2026-11-17 09:00:00', noteText: '银行卡号已核对，与身份证姓名一致。' }
    ]
  },
  {
    id: 'CT-2004',
    contractNo: 'LW202611140004',
    expertName: '王雅楠',
    expertPhone: '13600136004',
    hospitalName: '滕州市中医医院',
    deptName: '儿科',
    contractStatus: 'REJECTED',
    submitTime: '2026-11-14 14:26:00',
    signedTime: '',
    idCardNo: '370481199506301128',
    idCardFrontUrl: docImage('身份证 · 人像面', '演示占位图'),
    idCardBackUrl: docImage('身份证 · 国徽面', '演示占位图'),
    accountName: '王雅楠',
    bankAccountId: '6212260200118899001',
    bankBranch: '中国银行滕州支行',
    bankPhone: '13600136004',
    rejectReason: '开户支行名称与银行卡不符，请核对后重新发起签署。',
    contractFile: '颐邦小源专家劳务协议.pdf',
    remarkList: []
  },
  {
    id: 'CT-2005',
    contractNo: 'LW202610280005',
    expertName: '孙浩',
    expertPhone: '13500135005',
    hospitalName: '枣庄市妇幼保健院',
    deptName: '妇产科',
    contractStatus: 'PENDING',
    submitTime: '',
    signedTime: '',
    idCardNo: '370402198706143316',
    idCardFrontUrl: docImage('身份证 · 人像面', '演示占位图'),
    idCardBackUrl: docImage('身份证 · 国徽面', '演示占位图'),
    accountName: '孙浩',
    bankAccountId: '6214830200556677889',
    bankBranch: '招商银行枣庄分行',
    bankPhone: '13500135005',
    rejectReason: '',
    contractFile: '颐邦小源专家劳务协议.pdf',
    remarkList: []
  }
]

// 按合同 id 取详情，取不到时回落到第一条，避免详情页出现空数据
export const getContractDemoDetail = (id) =>
  CONTRACT_DEMO_LIST.find((item) => item.id === String(id || '')) || CONTRACT_DEMO_LIST[0]
