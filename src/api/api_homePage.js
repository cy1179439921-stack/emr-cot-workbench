import service from './index'

export const getStudyList = (params) => service.post('/queue/researchQueue/getResearchQueuePage', params)

export const getAllDisease = () => service.post('/system/disease/getDiseaseList')

export const getMedicalRecords = (params) => service.post('/medical/medicalRecord/medicalStructureRecord/findByMultiCondition', params)

export const getMedicalTree = (params) => service.post('/medical/medicalRecord/medicalStructureRecord/findByTree', params)

export const getMedicalRecordIndexList = (params) => service.post('/queue/medicalQueueIndexResult/getMedicalIndexPage', params)

export const getUpdateProcess = (params) => service.post('/queue/medicalQueueIndexResult/countMedicalRecord', params)

export const medicalRecordIndexConditionTreeQuery = (params) => service.post('/queue/medicalQueueIndexResult/getMedicalIndexPage', params)

export const saveCommonUse = (params) => service.post('/medical/commonFilter/save', params)

export const saveFixedQueryCondition = (params) => service.post('medical/commonFilter/addOrUpdate', params)

export const getCommonUse = (params) => service.post('/medical/commonFilter/getCommonFilter', params)

export const delCommonUse = (params) => service.post('/medical/commonFilter/deleteCommonFilter', params)

export const getOthersIndex = (params) => service.post('/queue/queueIndexGroup/getIndexListWithGroupByQueueId', params)

export const getAllAgency = (params) => service.post('/system/agency/getAgencyListWithQueueAndRole', params)
export const getAllAgencyWithRole = (params) => service.post('/system/agency/getAgencyListWithRole', params)
// 首页概览
export const getOverview = params => service.post('/medical/statistics/dataBigScreen/home/overview', params)

// 性别分布
export const getSexDistribution = params => service.post('/medical/statistics/dataBigScreen/home/patient/sex', params)

// 年龄分布
export const getAgeDistribution = params => service.post('/medical/statistics/dataBigScreen/home/record/age', params)

// 病例类型
export const getRecordTypeDistribution = params => service.post('/medical/statistics/dataBigScreen/home/record/type', params)

// 就诊年份分布
export const getYearDistribution = params => service.post('/medical/statistics/dataBigScreen/home/record/year', params)

// 地域分布
export const getAreaDistribution = params => service.post('/medical/statistics/dataBigScreen/home/record/city', params)

// 主要诊断top10
export const getPrimaryDiagnosisDistribution = params => service.post('/medical/statistics/dataBigScreen/home/record/main', params)

// 就诊医院分布
export const getMedicalInstitutionDistribution = params => service.post('/medical/statistics/dataBigScreen/home/record/agency', params)

// 获取就诊医院数量
export const getAgencyNum = params => service.post('/medical/statistics/dataBigScreen/getAgencyListCount', params)

// 暂停指标提取
export const pauseUpdateIndex = params => service.post('/queue/medicalQueueIndexResult/pauseExtractQueueIndexResult', params)

// 开始提取
export const startUpdateIndex = params => service.post('/queue/medicalQueueIndexResult/resumeExtractQueueIndexResult', params)

// 结束提取任务
export const finishUpdateIndex = params => service.post('/queue/medicalQueueIndexResult/stopExtractQueueIndexResult', params)

// 触发指标提取任务
export const postUpdateIndex = (params) => service.post('/queue/medicalQueueIndexResult/reExtractQueueIndexResult', params)
// export const postUpdateIndex = (params) => service.post('/queue/queueCondition/updateIndex', params)
