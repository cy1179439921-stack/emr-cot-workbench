import service from './index.js'

export const getReportedTotal = (params) => service.post('/medical/statistics/dataBigScreen/fileNumGroupByCity', params)

export const getOverviewData = (params) => service.post('/medical/statistics/dataBigScreen/overview', params)

export const getReportTendency = (params) => service.post('/medical/statistics/dataBigScreen/fileNumGroupByCreateTDate', params)

export const getAreaList = (params) => service.post('/system/agency/getCity', params)

// 根据地区获取医院列表
export const getHospitalsByArea = (params) => service.post('/system/agency/getAgencyListMulti', params)

// 获取所有病种
export const getDiseaseList = (params) => service.post('/system/disease/getDiseaseList', params)

// 大病种患者每日新增折线图
export const getEveryDayBrokenLine = params => service.post('/medical/statistics/dataBigScreen/fileNumGroupByEnterHospitalDate', params)

// 大病种患者总占比
export const getEveryDayPieData = params => service.post('/medical/statistics/dataBigScreen/statisticsFileNumGroupByDiseaseType', params)

// 大病种患者每日数据
export const getMajorDiseaseEveryDayData = params => service.post('/medical/statistics/dataBigScreen/statisticsFileNumGroupByDiseaseTypeByDay', params)

// 大病种患者地图数据
export const getMajorDiseaseMapData = params => service.post('/medical/statistics/dataBigScreen/patientNumGroupByAgencyOrCity', params)

// 地图点位详情
export const getPointDetail = params => service.post('/medical/statistics/dataBigScreen/patientNumGroupById', params)

// 小病种趋势图
export const getminorDisease = (params) => service.post('/medical/statistics/dataBigScreen/fileNumGroupByDisease', params)

// 慢病患者基本信息分布情况
export const getBasicInfo = (params) => service.post('/medical/statistics/dataBigScreen/patientNumGroupBySexOrCareerOrAge', params)

// 共病患者分布情况
export const getCommonData = (params) => service.post('/medical/statistics/dataBigScreen/patientNumGroupBySexOrCareerOrAgeMulti', params)

// 慢病患者复发统计   先因病种 后因病种 图表接口
export const getRecurData = (params) => service.post('/medical/statistics/dataBigScreen/patientNumRecurrence', params)

// 住院次数
export const getEnterHospitalNum = (params) => service.post('/medical/statistics/dataBigScreen/enterHospitalNum', params)

// 死因分布
export const getDeathCause = (params) => service.post('/medical/statistics/dataBigScreen/patient/death', params)
