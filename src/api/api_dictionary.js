import service from './index'
// 获取字典列表
export const getSysDictionaryList = (params) => service({
  url: '/sysDictionary/getSysDictionaryList',
  method: 'get',
  params
})
// 根据type获取j具体字典
export const getSysDictionaryByType = (params) => service({
  url: '/sysDictionary/getSysDictionaryByType',
  method: 'get',
  params
})
// 分页获取SysDictionaryDetail列表
export const getSysDictionaryDetailList = (params) => service({
  url: '/sysDictionaryDetail/getSysDictionaryDetailList',
  method: 'get',
  params
})
// 获取单个字典详情
export const findSysDictionary = (params) => service({
  url: '/sysDictionary/findSysDictionary',
  method: 'get',
  params
})
// 获取单个字典详情
export const findSysDictionaryDetail = (params) => service({
  url: '/sysDictionaryDetail/findSysDictionaryDetail',
  method: 'get',
  params
})
// 创建字典
export const createSysDictionary = (params) => service.post('/sysDictionary/createSysDictionary', params)
// 创建字典项
export const createSysDictionaryDetail = (params) => service.post('/sysDictionaryDetail/createSysDictionaryDetail', params)
// 更新字典
export const updateSysDictionary = (params) => service.put('/sysDictionary/updateSysDictionary', params)
// 更新字典项
export const updateSysDictionaryDetail = (params) => service.put('/sysDictionaryDetail/updateSysDictionaryDetail', params)
// 删除字典
export const deleteSysDictionary = (data) => service({
  url: '/sysDictionary/deleteSysDictionary',
  method: 'delete',
  data
})
// 删除字典项
export const deleteSysDictionaryDetail = (data) => service({
  url: '/sysDictionaryDetail/deleteSysDictionaryDetail',
  method: 'delete',
  data
})
