import service from './index'
// 接口都改为按需引入的方式
// 登录
export const login = (params) => service.post('/system/common/login', params)

// 加密登录接口
export const loginEn = params => service.post('/system/common/loginEncrypted', params)
// 退出登录
export const loginOut = (params) => service.post('/system/common/logout', params)
// 修改密码
export const changePassword = (params) => service.post('/system/user/updatePassword', params)
// 获取用户列表
export const getUserList = (params) => service.post('/user/getUserList', params)
// 创建用户
export const createUser = (params) => service.post('/user/createUser', params)
// 同步用户
export const synchronizeUsers = (params) => service.get('/user/synchronizeUsers', params)
// 编辑用户
export const editUser = (params) => service.put('/user/setUserInfo', params)
// 删除用户
export const deleteUser = (data) => service({
  url: '/user/deleteUser',
  method: 'delete',
  data
})
// 设置权限
export const setUserAuthorities = (params) => service.post('/user/setUserAuthorities', params)
// 获取用户授权的菜单
export const getUserMenu = (params) => service.post('/system/common/getUserMenu', params)

// 用户获取统一认证平台跳转地址
export const getAuthUrl = (params) => service.post('/system/sso/getAuthUrl', params)
// sso登录
export const ssoLogin = (params) => service.post('/system/sso/validCode', params, { timeout: 600000 })

// 获取基础信息
export const getBaseInfo = params => service.post('/system/common/baseInfo')

