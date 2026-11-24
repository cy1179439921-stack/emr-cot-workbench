import service from './index'
// 获取api列表
export const getApiList = (params) => service.post('/api/getApiList', params)
// 获取所有api列表
export const getAllApis = (params) => service.post('/api/getAllApis', params)
// 创建Api
export const createApi = (params) => service.post('/api/createApi', params)
// 获取单条Api消息
export const getApiById = (params) => service.post('/api/getApiById', params)
// 更新api
export const updateApi = (params) => service.post('/api/updateApi', params)
// 删除Api
export const deleteApi = (params) => service.post('/api/deleteApi', params)
// 删除选中api
export const deleteApisByIds = (data) => service({
  url: '/api/deleteApisByIds',
  method: 'delete',
  data
})
