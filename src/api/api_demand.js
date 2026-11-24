import service from './index'
// 获取需求列表
export const getDemandList = (params) => service.post('/demand/getDemandList', params)
// 创建需求
export const createDemand = (params) => service.post('/demand/createDemand', params)
// 更新需求
export const updateDemand = (params) => service.put('/demand/setDemandInfo', params)
// 删除需求
export const deleteDemand = (params) => service.post('/demand/deleteDemand', params)
