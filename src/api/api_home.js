import service from './index'
// 用户列表
export const getUserListData = (params) => service.post('/system/user/getUserPage', params)
// 根据城市获取医院列表数据
export const getAllAgencyByCity = (params) => service.post('/system/agency/getAgencyList', params)
// 获取医院列表数据
export const getAllAgency = (params) => service.post('/system/agency/getAgencyListWithQueueAndRole', params)
// 带角色权限的医院列表数据
export const getAllAgencyWithRole = (params) => service.post('/system/agency/getAgencyListWithRole', params)
// 获取权限的结构列表
export const getPermissionStructure = (params) => service.post('/system/agency/getAgencyListWithRole', params)
// 新增用户
export const addUserData = (params) => service.post('/system/user/addUser', params)
// 编辑用户
export const editUserData = (params) => service.post('/system/user/updateUser', params)
// 删除用户
export const delUserData = (params) => service.post('/system/user/deleteUser', params)
// 重置密码
export const resetUserPassword = (params) => service.post('/system/user/resetPassword', params)
// 获取角色列表
export const getRoleNames = (params) => service.post('/system/role/getSelectRoleList', params)
// 卒中导出配置
export const exportConfig = (params) => service.post('/system/user/configImportInfo', params)

// 操作日志列表
export const getOperationLogList = (params) => service.post('/system/apiAccessLog/pageList', params)
// 操作日志导出
// export const exportOperationLog = (params) => service.post('/medical/exportRecord/audit', params)
export const exportOperationLog = (params) => service.post('/system/apiAccessLog/export/audit', params)
// 操作日志导出记录
export const exportOperationLogRecord = (params) => service.post('/medical/exportRecord/getExportRecordPage', params)

// 证书认证--获取证书
export const getCertificateList = (params) => service.post('/system/license/getLicense', params)
// 新增证书
export const addCertificate = (params) => service.post('/system/license/addLicense', params)
// 编辑证书
export const editCertificates = (params) => service.post('/system/license/updateLicense', params)
// 下载证书
export const downloadCertificates = (params) => service.post('/system/license/downloadLicense', params)

// 认证应用---应用管理列表
export const getApplicationList = (params) => service.post('/system/appInfo/pageList', params)
// 新增应用
export const addApplication = (params) => service.post('/system/appInfo/insert', params)
// 编辑应用-更改应用状态
export const editApplication = (params) => service.post('/system/appInfo/update', params)
// 删除应用
export const delApplication = (params) => service.post('/system/appInfo/del', params)
// 跳转应用
export const jumpApplication = (params) => service.post('/system/appInfo/forward', params)

// 认证应用---操作日志列表
export const getApplicationLogList = (params) => service.post('/system/appForwardLog/pageList', params)

// 根据医院获取科室下拉列表
export const getDartmentListByAgengcy = (params) => service.post('/system/department/getListByAgency', params)

// 科室列表接口
export const getDartmentList = params => service.post('/system/department/pageList', params)

// 新增科室
export const createDartment = params => service.post('/system/department/insert', params)

// 编辑科室
export const updateDartment = params => service.post('/system/department/update', params)

// 删除科室
export const delDartment = params => service.post('/system/department/del', params)

// 医院科室树结构
export const getAngencyAndDepartmentTreeList = params => service.post('/system/agency/getAgencyListInCascade', params)

// 根据角色获取权限内医院
export const getAngencyAndDepartmentTreeListByRole = params => service.post('/system/agency/getAgencyListInCascade/role', params)

// 根据医院获取角色列表
export const getRoleListByAgency = params => service.post('/system/user/getUserSelectList/params', params)

