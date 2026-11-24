import service from './index'
// 新增表单
export const addForm = (params) => service.post('home/form/addForm', params)
// 删除表单
export const deleteForm = (params) => service.post('home/form/deleteForm', params)
// 根据医院id获取表单列表
export const getFormPage = (params) => service.post('/home/form/getFormPage', params)
// 更新表单信息
export const updateForm = (params) => service.post('/home/form/updateForm', params)
