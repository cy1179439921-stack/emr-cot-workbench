import service from './index'
// 获取历史导出记录列表
export const getAListOfHistoryExportRecords = (params) => service.post('/medical/exportRecord/getExportRecordPage', params)
// 导出记录
export const exportRecord = (params) => service.post('/medical/exportRecord/exportRecordByCommonFilter', params)
// 病历库条件树导出记录
export const exportRecordsFromMedicalRecordDatabaseConditionTree = (params) => service.post('/medical/exportRecord/exportRecordByTree', params)
// 导出记录
export const delexportRecord = (params) => service.post('/medical/exportRecord/deleteExportRecord', params)
// 条件树查询
export const conditionalTreeQuery = (params) => service.post('/queue/queueIndexGroup/getIndexListWithGroupByQueueId', params)

// 导出记录重试
export const exportRecordRetry = (params) => service.post('/medical/exportRecord/retry', params)

// 病历指标条件树导出
// export const derivationOfMedicalRecordIndexConditionTree = (params) => service.post('/medical/exportRecord/exportMedicalIndexExtractRecordByConditionTree', params)
export const derivationOfMedicalRecordIndexConditionTree = (params) => service.post('/medical/exportRecord/exportQueueIndex', params)

// 病例库普通导出验证数量
export const verifyQuantitymedical = params => service.post('/medical/exportRecord/exportRecordCheckByCommonFilter', params)

// 病例库条件数导出验证数量
export const conditionTreeverifyQuantitymedical = params => service.post('/medical/exportRecord/exportRecordCountByTree', params)
