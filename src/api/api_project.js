import service from './index'
// 获取项目列表
export const getProjectList = (params) => service.post('/project/getProjectList', params)
// 创建项目
export const createProject = (params) => service.post('/project/createProject', params)
// 更新项目
export const updateProject = (params) => service.put('/project/setProjectInfo', params)
// 删除项目
export const deleteProject = (params) => service.post('/project/deleteProject', params)
// 删除选中api
// export const deleteApisByIds = (data) => service({
//   url: '/api/deleteApisByIds',
//   method: 'delete',
//   data
// })
