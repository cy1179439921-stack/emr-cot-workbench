import service from '../index'
// 获取历史导出记录列表
export const getAListOfHistoryExportRecords = (params) => service.post('/medical/exportRecord/getExportRecordPage', params)
// 导出记录
export const exportRecord = (params) => service.post('/medical/exportRecord/exportRecordByCommonFilter', params)
// 导出记录
export const delexportRecord = (params) => service.post('/medical/exportRecord/deleteExportRecord', params)
// 条件树查询
export const conditionalTreeQuery = (params) => service.post('/queue/queueIndexGroup/getIndexListWithGroupByQueueId', params)

// 导出记录重试
export const exportRecordRetry = (params) => service.post('/jcw/indexExtract/exportRecord/retry', params)
