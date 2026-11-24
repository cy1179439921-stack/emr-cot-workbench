import service from './index'
// 查询指标列表
export const getIndexList = (params) => service.post('/queue/index/getPublicIndexPage', params)
// 新增指标
export const addIndex = (params) => service.post('/queue/index/savePublicIndex', params)
// 编辑指标
export const updateIndex = (params) => service.post('/queue/index/updatePublicIndex', params)
// 删除指标
export const deleteIndex = (params) => service.post('/queue/index/delIndex', params)

// 更新私有指标
export const updatePrivateIndex = params => service.post('/queue/index/updatePrivateIndex', params)

// 获取指标索引枚举接口
export const getIndexEnum = params => service.post('/queue/indexType/getPubIndexTypePage', params)

// 指标索引删除
export const deleteIndexEnum = params => service.post('/queue/index/delIndexByType', params)

// 指标索引删除前校验
export const checkIndexEnum = params => service.post('/queue/index/checkDelIndexTypeQueueCount', params)

// 检验来源
export const getSourceList = params => service.post('/system/inspectProjectDict/pageList', params)

// 批量删除指标校验
export const checkDelIndexQueueCount = params => service.post('/queue/index/checkDelIndexQueueCount', params)

// 批量删除指标
export const delIndexList = params => service.post('/queue/index/batchDelIndex', params)

// 导出指标
export const exportIndex = params => service.post('/queue/index/exportPublicIndexFile', params)

// 导入指标
export const importIndex = params => service.post('/queue/index/importIndexList', params)
