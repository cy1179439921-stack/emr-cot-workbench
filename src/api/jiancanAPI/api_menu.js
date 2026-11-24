import service from '../index'
// 获取功能权限树
export const getMenuRoleTree = (params) => service.post('/system/menu/getMenuRoleTree', params)
