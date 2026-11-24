// 演示用户信息：详情页水印、工作台等处共用
// 说明：mock 登录写入的用户名为「演示账号」，水印场景下展示可读的真实姓名更贴近演示效果
export const DEMO_USER = {
  userName: '张慧敏',
  idCard: '370402199003156728',
  phone: '138****6621',
  agencyName: '演示医院',
  department: '心内科'
}

// 身份证脱敏：保留前 4 位与后 4 位，中间用 * 占位
export const maskIdCard = (idCard) => {
  const text = String(idCard || '')
  if (text.length <= 8) return text
  return `${text.slice(0, 4)}${'*'.repeat(text.length - 8)}${text.slice(-4)}`
}

// 水印文案：姓名 + 脱敏身份证号
export const watermarkText = (userName) => {
  const name = userName && userName !== '演示账号' ? userName : DEMO_USER.userName
  return `${name} ${maskIdCard(DEMO_USER.idCard)}`
}
