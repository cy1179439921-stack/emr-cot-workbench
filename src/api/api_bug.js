import service from './index'
// 获取bug列表
export const getBugList = (params) => service.post('/bug/getBugList', params)
// 创建bug
export const createBug = (params) => service.post('/bug/createBug', params)
// 批量创建bug
export const createBugs = (params) => service.post('/bug/createBugs', params)
// 更新bug信息
export const updateBug = (params) => service.put('/bug/setBugInfo', params)
// 更新bug状态
export const updateBugStatus = (params) => service.post('/bug/setBugStatus', params)
// 删除bug
export const deleteBug = (data) => service({
  url: '/bug/deleteBug',
  method: 'delete',
  data
})
