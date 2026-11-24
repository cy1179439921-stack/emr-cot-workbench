export const setFavicon = (path, name) => {
  document.title = name
  // 创建一个新的<link rel="icon">标签
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'icon'

  // 根据 window.location.href 的值来设置 href
  link.href = path

  // 将 link 元素添加到 head 中
  document.getElementsByTagName('head')[0].appendChild(link)
}
