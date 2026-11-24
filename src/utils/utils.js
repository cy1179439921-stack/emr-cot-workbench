import lodash from 'lodash'
import { ElMessage } from 'element-plus'
export const formatDateTime = (time) => {
  if (time !== null && time !== '' && time > 0) {
    const date = new Date(time)
    const Y = `${date.getFullYear()}-`
    let M = date.getMonth() + 1
    M = M < 10 ? `0${M}-` : `${M}-`
    let D = date.getDate()
    D = D < 10 ? `0${D} ` : `${D} `
    let h = date.getHours()
    h = h < 10 ? `0${h}:` : `${h}:`
    let m = date.getMinutes()
    m = m < 10 ? `0${m}:` : `${m}:`
    let s = date.getSeconds()
    s = s < 10 ? `0${s}` : s
    return Y + M + D + h + m + s
  }
  return ''
}
//
export const formatDateTime2 = (time) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const filenameVal = `${year}年${month}月${day}日${hours}时${minutes}分${seconds}秒`
  return filenameVal
}
// 将时间戳格式转成YYYY-MM-DD格式
export const formatDate = (date) => {
  // const date = new Date(time)
  const Y = `${date.getFullYear()}-`
  let M = date.getMonth() + 1
  M = M < 10 ? `0${M}-` : `${M}-`
  let D = date.getDate()
  D = D < 10 ? `0${D}` : `${D}`
  return Y + M + D
}
// 将时间戳格式转成YYYY-MM-DD格式
export const convertTimestampToDate = (timestamp, isDateTime = false) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return isDateTime ? `${year}-${month}-${day} ${hours}:${minutes}:${seconds}` : `${year}-${month}-${day}`
}
export const formatDateT = (time, length) => {
  if (time) {
    const newTime = time.substring(0, length).replace('T', ' ')
    return newTime
  }
  return ''
}
export const getExpireDate = (time) => {
  const startDate = new Date()
  const endDate = new Date(time)

  // 将时间部分设置为0，只比较日期
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  // 计算相差的毫秒数
  const timeDiff = endDate.getTime() - startDate.getTime()

  // 转换为天数
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
  return dayDiff
}
export const downloadImage = (imgsrc, name) => { // 下载图片地址和图片名
  const image = new Image()
  image.setAttribute('crossOrigin', 'anonymous')
  // eslint-disable-next-line func-names
  image.onload = function () {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height)
    const url = canvas.toDataURL('image/png') // 得到图片的base64编码数据

    const a = document.createElement('a') // 生成一个a元素
    const event = new MouseEvent('click') // 创建一个单击事件
    a.download = name || 'photo' // 设置图片名称
    a.href = url // 将生成的URL设置为a.href属性
    a.dispatchEvent(event) // 触发a的单击事件
  }
  image.src = imgsrc
}

export const formatBoolean = (bool) => {
  if (bool !== null) {
    return bool ? '是' : '否'
  }
  return ''
}
// 将标准时间转成YYYY-MM-DD格式
export const formatStandardDate = (dateStr) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const transferKeys = (arr) => {
  arr.forEach(item => {
    item.label = item.name
    item.value = item.id
    if (item.items) {
      item.children = item.items
      transferKeys(item.children)
    }
  })
}

// 递归树形数组对象，根据指定字段及传递值删除指定对象
export function removeByField(arr, field, value) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][field] === value) {
      arr.splice(i, 1)
      i--
    } else if (arr[i].children) {
      removeByField(arr[i].children, field, value)
    }
  }
}

// 写一个uuidhash函数
export function uuidHash(str = Math.random().toExponential(10)) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) + hash)
  }
  return hash
}

export const clickoutside = {
  mounted(el, binding, vnode) {
    function documentHandler(e) {
      // 这里判断点击的元素是否是本身，是本身，则返回
      if (el.contains(e.target)) {
        return false
      }
      // 判断指令中是否绑定了函数
      if (binding && binding.value) {
        // 如果绑定了函数 则调用那个函数，此处binding.value就是handleClose方法
        if (binding.value && binding.value(e)) {
          binding.value(e)
        }
      }
    }
    // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
    el.__vueClickOutside__ = documentHandler
    document.addEventListener('click', documentHandler)
  },
  unmounted(el, binding) {
    // 解除事件监听
    document.removeEventListener('click', el.__vueClickOutside__)
    delete el.__vueClickOutside__
  }
}

export const SELECT_STATE = {
  unselect: 0,
  selecting: 1,
  selected: 2
}

// 判断数组的每一项是否都为0，当所有值都为空，则饼图不展示
export const filterZero = (data) => {
  if (!data || data.length === 0) {
    return []
  } else if (data && data.length > 0) {
    const filterZeros = data.every(item => item.value === 0)
    if (filterZeros) {
      return []
    } else {
      return data
    }
  }
}

// 将echarts内置的px转换为适配后px的方法
export const echartsToPx = (px) => {
  const clientWidth = document.documentElement.clientWidth || document.body.clientWidth
  if (!clientWidth) return
  const fontSize = px * (clientWidth / 1920)
  return fontSize
}

// 将echartsToPx函数计算后的数值反计算回去
export const transformPx = (size) => {
  const clientWidth = document.documentElement.clientWidth || document.body.clientWidth
  if (!clientWidth) return
  return size / (clientWidth / 1920)
}

// 定义防抖函数
export const debounce = (func, wait) => {
  let timeout
  return function () {
    const context = this
    const args = arguments
    const later = function () {
      timeout = null
      func.apply(context, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const addThousandSeparator = (number) => {
  if (number) {
    const num = number - 0
    if (lodash.isFinite(num)) {
      return num.toLocaleString('en-US')
    } else {
      return number
    }
  } else {
    return number
  }
}

export const myRequire = (path) => {
  return new URL(path, import.meta.url).href
}

export const nowDate = () => {
  const getTime = new Date().getTime() // 获取到当前时间戳
  const time = new Date(getTime) // 创建一个日期对象
  const year = time.getFullYear() // 年
  const month = (time.getMonth() + 1).toString().padStart(2, '0') // 月
  const date = time.getDate().toString().padStart(2, '0') // 日
  const hour = time.getHours().toString().padStart(2, '0') // 时
  const minute = time.getMinutes().toString().padStart(2, '0') // 分
  const second = time.getSeconds().toString().padStart(2, '0') // 秒
  return (
    year + '年' + month + '月' + date + '日' + hour + '时' + minute + '分' + second + '秒'
  )
}

// 复制文本到剪贴板
export const copy = (text) => {
  const copyContent = typeof text === 'object' ? JSON.stringify(text) : text
  try {
    // navigator clipboard 向剪贴板写文本
    navigator.clipboard.writeText(copyContent).then(function () {
      ElMessage.success('已复制')
    })
  } catch (e) {
    const input = document.createElement('textarea')
    document.body.appendChild(input)
    input.value = copyContent
    input.select()
    if (document.execCommand('copy')) {
      document.execCommand('copy')
      ElMessage.success('已复制')
    }
    document.body.removeChild(input)
  }
}

export const isValid18DigitIdCard = (idCard) => {
  // 正则校验格式：前17位数字+末位数字/X/x
  const regex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/
  if (!regex.test(idCard)) {
    return false
  }

  // 校验码计算
  const idChars = idCard.toUpperCase().split('')
  const factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idChars[i]) * factors[i]
  }

  const mod = sum % 11
  return idChars[17] === checkCodes[mod]
}
