import service from '../index'
// 查询角色列表
export const getRoleList = (params) => service.post('/system/role/getRoleList', params)
// 新增角色
export const addRole = (params) => service.post('/system/role/addRole', params)
// 编辑角色
export const updateRole = (params) => service.post('/system/role/updateRole', params)
// 删除角色
export const deleteRole = (params) => service.post('/system/role/deleteRole', params)
