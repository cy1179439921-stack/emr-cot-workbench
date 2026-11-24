import service from '../index'
// 上报总数排行
export const getReportData = (params) => service.post('/medical/statistics/dataBigScreen/home/record/agency', params)
export const getReportDataNew = (params) => service.post('/jcw/statistics/dataBigScreen/home/record/agency', params)
// 治疗类型
export const getTreatmentTypes = (params) => service.post('/home/jcw/form/getFormList', params)
// 医院列表
export const getAllAgency = (params) => service.post('/system/agency/getAgencyListMulti', params)

export const getReportTrend = (params) => service.post('/jcw/statistics/dataBigScreen/fileNumGroupByCreateTDate', params)
// 数据概览
export const getOverviewData = (params) => service.post('/jcw/statistics/dataBigScreen/overview', params)

// 性别分布
export const getSexData = (params) => service.post('/jcw/statistics/dataBigScreen/home/patient/sex', params)

// 年龄分布
export const getAgeData = (params) => service.post('/jcw/statistics/dataBigScreen/home/record/age', params)

// 治疗类型分布
export const getHealingTypeData = (params) => service.post('/jcw/statistics/dataBigScreen/home/record/healingType', params)

// 覆盖医院总数

export const getAgencyNum = (params) => service.post('/system/agency/getAgencyListCount', params)
export const getAgencyNumNew = (params) => service.post('/jcw/statistics/dataBigScreen/getAgencyListCount', params)
// 获取数据预估分析所有数据
export const getAllScore = (params) => service.post('/jcw/statistics/dataBigScreen/score', params)

// 获取AIS血管内治疗DPT分布图
export const getDptData = (params) => service.post('/jcw/statistics/dataBigScreen/dpt', params)

export const scoringTrend = () => service.post('/jcw/statistics/dataBigScreen/score/list', {})
