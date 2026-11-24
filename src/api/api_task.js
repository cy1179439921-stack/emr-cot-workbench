import service from './index'
// 获取任务列表
export const getTaskList = (params) => service.post('/task/getTaskList', params)
// 创建任务
export const createTask = (params) => service.post('/task/createTask', params)
// 批量创建任务
export const createTasks = (params) => service.post('/task/createTasks', params)
// 更新任务
export const updateTask = (params) => service.put('/task/setTaskInfo', params)
// 删除任务
export const deleteTask = (data) => service({
  url: '/task/deleteTask',
  method: 'delete',
  data
})
