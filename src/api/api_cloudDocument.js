import service from './index'
// 获取字典列表
export const getCloudDocumentList = (params) => service({
  url: '/cloudDocument/getCloudDocumentList',
  method: 'get',
  params
})

// 创建文档
export const createCloudDocument = (params) => service.post('/cloudDocument/createCloudDocument', params)
// 获取文档详情
export const getCloudDocumentDetail = (params) => service.post('/cloudDocument/getCloudDocumentDetail', params)
// 更新文档
export const updateCloudDocument = (params) => service.put('/cloudDocument/updateCloudDocument', params)
// 更新字典项
export const updateSysDictionaryDetail = (params) => service.put('/cloudDocument/updateSysDictionaryDetail', params)
// 删除字典
export const deleteSysCloudDocument = (data) => service({
  url: '/cloudDocument/deleteSysCloudDocument',
  method: 'delete',
  data
})
// 删除字典项
export const deleteSysDictionaryDetail = (data) => service({
  url: '/cloudDocument/deleteSysDictionaryDetail',
  method: 'delete',
  data
})
