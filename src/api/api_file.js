import service from './index'
// 获取所有文件列表
export const getFilesList = (params) => service.post('/medical/medicalRecord/getFilePage', params)
// 删除文件
export const deleteFile = (params) => service.post('/medical/medicalRecord/deleteFile', params)
// 添加文件
export const addFile = (params) => service.post('/medical/medicalRecord/addFile', params)
// 校对页面基本信息
export const getFileDetail = (params) => service.post('/medical/medicalRecord/getFileDetail', params)
// 重新识别
export const resetIdentify = (params) => service.post('/medical/medicalRecord/reIdentify', params)
// 获取重新识别文件状态
export const resetGetFileStatus = (params) => service.post('/medical/medicalRecord/getFileStatus', params)
// 左侧树病历数据
export const getDiseaseTree = (params) => service.post('/medical/medicalRecord/getMedicalRecordType', params)
// 获取表单信息
export const getFormData = (params) => service.post('/medical/medicalRecord/getCheckForm', params)
// 查看就诊记录病历类型
export const getMedicalRecord = (params) => service.post('/medical/medicalRecord/getMedicalRecordDetail', params)
// 根据病历类型获取病历内容
export const getMedicalRecordContent = (params) => service.post('/medical/medicalRecord/getMedicalRecordContent', params)

export const getMedicalRecordNew = (params) => service.post('/medical/medicalRecord/getMedicalRecordMainInfo', params)

export const getFormPage = (params) => service.post('/home/form/getFormPage', params)
// 编辑识别结果
export const editTheRecognitionResult = (params) => service.post('/medical/medicalRecord/updateMedicalRecordDetail', params)
// 获取表单样式
export const getFormFormat = (params) => service.post('/home/form/getFormFormat', params)
// 获取患者主页详细信息
export const getPatientHomePageDetails = (params) => service.post('/medical/patient/getPatientDetail', params)
// 病历标准化保存
export const updateMedicalRecordContent = (params) => service.post('/medical/medicalRecord/updateMedicalRecordContent', params)
// 获取病历标准化详情

// 源文件导出接口
export const sourceFileExport = (params) => service.post('/medical/exportRecord/exportFileByCommonFilter', params)

// 源文件导出记录
export const sourceFileExportRecords = params => service.post('/medical/exportRecord/getExportRecordPage', params)

// 获取坐标信息
export const getCoordinates = params => service.post('/medical/algorithm/getMedicalRecordOCR', params)

// 保存坐标信息
export const saveCoordinates = params => service.post('/medical/algorithm/updateMedicalRecordOCR', params)

