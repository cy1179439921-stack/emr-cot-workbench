// 按时段给出友好问候：22-6 夜深了 / 6-10 早上好 / 10-14 中午好 / 14-17 下午好 / 17-22 晚上好

export const getGreeting = (date = new Date()) => {
  const hour = date.getHours()
  if (hour >= 22 || hour < 6) return '夜深了'
  if (hour < 10) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  return '晚上好'
}

export const getGreetingTip = (date = new Date()) => {
  const hour = date.getHours()
  if (hour >= 22 || hour < 6) return '忙碌一天，记得早点休息~'
  if (hour < 10) return '愿今天的工作从容顺畅~'
  if (hour < 14) return '记得好好吃饭，给身体充充电~'
  if (hour < 17) return '忙碌间隙，不妨起身稍作休息~'
  return '忙碌一天，别让自己太过劳累~'
}
