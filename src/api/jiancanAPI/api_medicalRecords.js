import service from '../index'
// 获取病历详情的值
export const getTheValueOfMedicalRecordDetails = (params) => service.post('/jcw/indexExtract/medicalRecord/getJcwIndexExtractResultById', params)
// 更新病历详情的值
export const updateTheValueOfMedicalRecordDetails = (params) => service.post('/jcw/indexExtract/update', params)
