// ===================== 平台端别工具 =====================
// 平台按角色拆分为专家端与管理后台（登录页 ?platform=admin），
// 退出登录 / 会话失效回到登录页时需要带上端别，避免管理后台用户被送回专家端入口。

// 当前登录角色；旧版本 'full'（全模块）统一按管理后台处理
export const currentPlatformRole = () => {
  const role = localStorage.getItem('cot-login-role')
  return role === 'full' ? 'admin' : role
}

// 登录页路由（带端别参数）
export const loginRouteByRole = () => {
  return currentPlatformRole() === 'admin'
    ? { name: 'login', query: { platform: 'admin' }}
    : { name: 'login' }
}
