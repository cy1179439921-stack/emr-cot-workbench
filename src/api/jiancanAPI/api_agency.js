import service from '../index'
// 查询医院列表
export const getAgencyList = (params) => service.post('/system/agency/getAgencyPage', params)
// 新增医院
export const addAgency = (params) => service.post('/system/agency/newAgency', params)
// 编辑医院
export const updateAgency = (params) => service.post('/system/agency/updateAgency', params)
// 删除医院
export const deleteAgency = (params) => service.post('/system/agency/deleteAgency', params)
// 获取配置权限的医院树
export const getAgencyRoleTree = (params) => service.post('/system/agency/getAgencyRoleTree', params)
