import service from './index'
// 更改角色api权限
export const updateCasbin = (params) => service.post('/casbin/updateCasbin', params)
// 获取权限列表
export const getPolicyPathByAuthorityId = (params) => service.post('/casbin/getPolicyPathByAuthorityId', params)
