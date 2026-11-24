import service from './index'

// 入住审核医院列表获取
export const getHospitalList = (params) => service.post('/admin/expert-apply/getExpertHospitalList', params)

// 审批列表
export const getQualificationList = (params) => service.post('/admin/expert-apply/getExpertApplyPage', params)

// 获取入驻的医院科室列表
export const getSectionListInCascade = params => service.post('/system/section/getSectionListInCascade', params)

// 审批接口
export const checkInAudit = (params) => service.post('/admin/expert-apply/audit', params)

// 获取审批详情
export const getAuditDetail = (params) => service.post('/admin/expert-apply/query', params)

// 劳务合同列表
export const getContractList = (params) => service.post('/admin/contract/page', params)

// 劳务合同详情
export const getContractDetail = (params) => service.post('/admin/contract/detail', params)

// 劳务合同下载
export const getContractDownload = (params) => service.post('/admin/contract/download-url', params)

// 劳务合同预览
export const getContractPreview = (params) => service.post('/admin/contract/preview-url', params)

// 查询劳务合同备注列表
export const getNoteList = (params) => service.post('/admin/contract/note/list', params)

// 临时增加重置功能
export const resetAccount = (params) => service.post('/admin/expert-apply/deleteByPhone', params)

// 新增合同备注
export const addNoteList = (params) => service.post('/admin/contract/note/add', params)

// 删除合同备注
export const delNoteList = (params) => service.post('/admin/contract/note/delete', params)

// 发起劳务签署
export const contractLaunch = (params) => service.post('/admin/contract/launch', params)

// 结算单列表
export const getInvoiceList = (params) => service.post('/admin/settlement/page', params)

// 结算单详情
export const getInvoiceDetail = (params) => service.post('/admin/settlement/detail', params)

// 下载计算单
export const invoiceDownload = (params) => service.post('/admin/settlement/export-pdf', params)

// 增加核算备注
export const addSettlementNoteList = (params) => service.post('/admin/settlement/note/add', params)

// 查询劳务合同备注列表
export const getSettlementNoteList = (params) => service.post('/admin/settlement/note/list', params)

// 删除合同备注
export const delSettlementNoteList = (params) => service.post('/admin/settlement/note/delete', params)

// 提交结算单
export const submitSettlement = (params) => service.post('/admin/settlement/submit-to-expert', params)

// 归档结算单
export const archiveSettlement = (params) => service.post('/admin/settlement/archive', params)

// 打款确认
export const submitPay = (params) => service.post('/admin/settlement/pay', params)

