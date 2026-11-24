import service from './index'
// 接口都改为按需引入的方式
// 获取患者详细信息
export const getPatientDetail = (params) => service.post('/medical/patient/getPatientDetail', params)
// 获取就诊记录信息列表
export const getMedicalRecordPage = (params) => service.post('/medical/medicalRecord/getMedicalRecordPageFromPatient', params)
// export const getMedicalRecordPage = (params) => service.post('/medical/patient/getMedicalRecordPage', params)
// 查看就诊记录
export const getMedicalRecord = (params) => service.post('/medical/patient/getMedicalRecord', params)
// 获取检验指标类
export const getInspectionIndex = (params) => service.post('/medical/patient/getInspectionIndex', params)
// 获取指标详情
export const getIndicatorDetail = (params) => service.post('/medical/patient/getIndicatorDetail', params)
// 获取本次就诊检验信息列表
export const getTheListOfTestInformationForThisVisit = (params) => service.post('/medical/medicalExtractIndexInspectionGroup/getMedicalExtractIndexInspectionGroupPage', params)
// 获取检验信息具体检验结果
export const obtainInspectionInformationAndSpecificInspectionResults = (params) => service.post('/medical/medicalExtractIndexInspection/getMedicalExtractIndexInspectionList', params)
// 获取本次就诊检查信息列表
export const getTheListOfMedicalExaminationInformation = (params) => service.post('/medical/medicalExtractIndexExam/getMedicalExtractIndexExamPage', params)
// 获取手术分页
export const getSurgicalPage = (params) => service.post('/medical/medicalExtractIndexOperation/getMedicalExtractIndexOperationPage', params)
// 获取医嘱列表
export const getPrescriptionList = (params) => service.post('/medical/medicalDoctorAdvice/getMedicalDoctorAdvicePage', params)
