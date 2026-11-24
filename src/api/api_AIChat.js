import service from './index'
// 获取会话列表
export const getSessionList = (params) => service.post('/medical/AIChat/getDialogList', params)
// 获取会话内容
export const getSessionContent = (params) => service.post('/medical/AIChat/getDialogHistoryByDialogIdOrMedicalRecordId', params)
// 发送会话请求
export const sendSessionRequest = (params, signal) => service.post('/medical/AIChat/chat', params, { signal })
// 修改会话标题
export const updateSessionTitle = (params) => service.post('/medical/AIChat/updateDialog', params)
// 删除会话
export const deleteSession = (params) => service.post('/medical/AIChat/deleteDialog', params)
// 新建会话
export const newSession = (params) => service.post('/medical/AIChat/newDialog', params)
// 中断会话
export const stopSession = (params) => service.post('/medical/AIChat/interrupt', params)
// 文件上传
export const AIUploadFile = (params) => service.post('/medical/AIChat/uploadFile', params)
// 根据文件id获取url
export const getFileUrl = (params) => service.post('/medical/AIChat/getFileUrl', params)
// 根据文件id获取文件解析结果
export const getNodeDetail = (params) => service.post('/medical/AIChat/getParseFileResult', params)
