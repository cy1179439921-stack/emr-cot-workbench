import service from '../index'
// 接口都改为按需引入的方式
// 登录
export const login = (params) => service.post('/system/common/login', params)
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
