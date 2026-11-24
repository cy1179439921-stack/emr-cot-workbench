import service from './index'
// 基本数据统计表---数据概览
export const getOverviewData = () => service.post('/medical/statistics/dataBigScreen/overview')
// 获取城市数据
// export const getCityData = () => service.post('/system/region/getCityList')
// 基本数据统计表数据
export const dataBoardBasicData = (params) => service.post('/medical/statistics/dataBigScreen/baseData', params)
// 导出基本数据统计
export const dataExportBasic = (params) => service.post('/medical/statistics/dataBigScreen/baseData/export', params)
// 病种数据统计表数据
export const dataBoardDiseaseData = (params) => service.post('/medical/statistics/dataBigScreen/disease/baseData', params)
// 导出病种数据
export const dataExportDisease = (params) => service.post('/medical/statistics/dataBigScreen/disease/baseData/export', params)

export const agencyDetail = (params) => service.post('/medical/statistics/dataBigScreen/agencyStatisticsDetail', params)

export const getTreeData = (params) => service.post('/medical/statistics/dataBigScreen/map', params)

export const getAgencyNum = (params) => service.post('/system/agency/getAgencyListCount', params)

