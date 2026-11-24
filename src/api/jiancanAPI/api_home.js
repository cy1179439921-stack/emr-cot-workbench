import service from '../index'
// 用户列表
export const getUserListData = (params) => service.post('/system/user/getUserPage', params)
// 根据城市获取医院列表数据
export const getAllAgencyByCity = (params) => service.post('/system/agency/getAgencyList', params)
// 获取医院列表数据
export const getAllAgency = (params) => service.post('/system/agency/getAgencyListWithQueueAndRole', params)
// 新增用户
export const addUserData = (params) => service.post('/system/user/addUser', params)
// 编辑用户
export const editUserData = (params) => service.post('/system/user/updateUser', params)
// 删除用户
export const delUserData = (params) => service.post('/system/user/deleteUser', params)
// 重置密码
export const resetUserPassword = (params) => service.post('/system/user/resetPassword', params)
// 获取角色列表
export const getRoleNames = (params) => service.post('/system/role/getSelectRoleList', params)

/* ----------------- 减残接口---------------*/
// 获取治疗类型下拉列表
// export const getTreatmentTypeSelectList = (params) => service.post('/home/healingType/getAllHealingTypeList', params)
// // 获取病历列表
// export const getMedicalRecordList = (params) => service.post('/medical/medicalRecord/getMedicalRecordPage', params)
// // 病历上报
// export const reportMedicalRecord = (params) => service.post('/medical/medicalRecord/updateMedicalRecord', params)
// // 上传病历pdf
// export const uploadMedicalRecordPdf = (params) => service.post('/medical/medicalRecord/addMedicalRecord', params)

// 获取治疗类型下拉列表-新接口
// export const getTreatmentTypeSelectList = (params) => service.post('/home/form/getFormList', params)
// 获取病历列表-新接口
export const getMedicalRecordList = (params) => service.post('/jcw/indexExtract/pageList', params)
// 刷新识别状态-新接口
export const refreshIdentifyStatus = (params) => service.post('/jcw/indexExtract/getByIndexExtractIds', params)
// 病历上报-新接口
export const reportMedicalRecord = (params) => service.post('/jcw/indexExtract/reportFile', params)
// 上传病历pdf-新接口
export const uploadMedicalRecordPdf = (params) => service.post('/jcw/indexExtract/insert/hand', params)
// 导出excel
export const exportExcel = (params) => service.post('/jcw/indexExtract/export/exportRecord', params)
// 病历库采集-新接口
export const collectMedicalRecord = (params) => service.post('/jcw/indexExtract/pull/insert', params)
// 获取采集数量
export const getCollectCount = (params) => service.post('/jcw/indexExtract/pull/count', params)

// 删除病例接口
export const deleteMedicalRecord = (params) => service.post('/jcw/indexExtract/del', params)

// 重新识别接口
export const reIdentify = (params) => service.post('/jcw/indexExtract/reIdentify', params)

// 获取手术编码列表接口
export const getOperationCodeList = (params) => service.post('/system/operation/pageList', params)
// 获取诊断编码列表接口
export const getDiagnosisCodeList = (params) => service.post('/system/diagnosis/pageList', params)

