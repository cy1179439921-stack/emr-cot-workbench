import service from './index'
// 获取省市数据
export const getRegionMap = (params) => service.post('/system/region/getRegionMap', params)
