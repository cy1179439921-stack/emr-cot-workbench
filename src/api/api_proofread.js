import service from './index'
// 参与人批次列表
export const getBatchListByParticipant = (params) => service.post('/verifyBatch/myPageList', params)
// 查询批次列表
export const getBatchList = (params) => service.post('/verifyBatch/pageList', params)
// 开始获取排队病历并作业
export const getQueueList = (params) => service.post('/verifyBatchRecord/allocate', params)
// 获取病历详情
export const getMedicalRecordDetail = (params) => service.post('/verifyBatchRecord/record/detail', params)
// 管理员查看病历详情
// export const getAdminMedicalRecordDetail = (params) => service.post('/verifyBatchRecord/record/detailForPlatform', params)
export const getAdminMedicalRecordDetail = (params) => service.post('/verifyCotRecord/record/detail', params)
// 新增批次
export const addBatch = (params) => service.post('/verifyBatch/insert', params)
// 编辑批次
export const editBatch = (params) => service.post('/verifyBatch/update', params)
// 删除批次
export const deleteBatch = (params) => service.post('/verifyBatch/del', params)
// 附件上传
export const uploadAttachment = (params) => service.post('/verifyCotRecord/import', params)
// 附件下载
export const downloadAttachment = (params) => service.post('/verifyCotRecord/record/export', params, { responseType: 'blob' })
// 批次详情
// 病历管理-列表
export const getMedicalRecordList = (params) => service.post('/verifyCotRecord/pageList', params)
// 删除病历
export const deleteMedicalRecord = (params) => service.post('/verifyCotRecord/record/delete', params)
// 检索批次下的参与人员
export const getParticipantList = (params) => service.post('/verifyCotRecord/user-list', params)
// 新增批次下的参与人员
export const addParticipant = (params) => service.post('/verifyBatchUser/insert', params)
// 删除批次下的参与人员
export const deleteParticipant = (params) => service.post('/verifyBatchUser/del', params)
// 批次整体情况统计（大盘数据）
export const getBatchStatistics = (params) => service.post('/verifyStat/overall-statistics', params)
// 批次人员详细统计情况
export const getBatchUserStatistics = (params) => service.post('/verifyStat/user-statistics', params)
// 暂存或提交病历
export const updateMedicalRecordContent = params => service.post('/verifyBatchRecord/record/save', params)
// 编辑，记录开始校对-复核时间
export const startProofreading = params => service.post('/verifyBatchRecord/start', params)
// 存储模板
export const saveTemplate = params => service.post('/verify/verifyTemplate/insert', params)
// 获取模板列表
export const getTemplateList = params => service.post('/verify/verifyTemplate/pageList', params)
// 删除模板
export const deleteTemplate = params => service.post('/verify/verifyTemplate/del', params)
// 查询操作记录
export const getOperationRecords = params => service.post('/verifyLog/pageList', params)
// 字段详细统计
export const getFieldReport = params => service.post('/verifyBatch/statistics/fieldReport', params)

// 获取待分配列表
export const getTaskAllocateList = params => service.post('/verifyTaskAllocate/record/pageList', params)

// 获取文件id列表,和病历id列表
export const getAllIds = params => service.post('/verifyTaskAllocate/record/options', params)

// 获取分配人员
export const getGroupOptions = params => service.post('/verifyTaskAllocate/user/list', params)

// 保存分配规则
export const saveAllocationRules = params => service.post('/verifyTaskAllocate/create', params)

// 获取历史分配记录
export const getTaskAllocateRecordsList = params => service.post('/verifyTaskAllocate/pageList', params)

// 获取历史分配记录详情
export const getTaskAllocateRecordDetails = params => service.post('/verifyTaskAllocate/detailList', params)

// 重置所有
export const resetAll = params => service.post('/verifyCotRecord/resetAll', params)

// 病历审核：status 7-审核通过 8-审核未通过，rejectReason 审核不通过原因（非必填）
export const auditMedicalRecord = params => service.post('/verifyCotRecord/audit', params)
