// 18位身份证号校验
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

// 身份证号校验
export const validateIdCard = (required = false) => {
  return (rule, value, callback) => {
    const _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/

    if (!value) {
      if (required) {
        callback(new Error('身份证号为必填项'))
      } else {
        callback() // 非必填且为空，合法
      }
    } else if (isValid18DigitIdCard(value) || _IDre15.test(value)) {
      callback()
    } else {
      callback(new Error('请填写正确的身份证号'))
    }
  }
}

// 手机号码校验
export const validateMobileNumber = (required = false, options = {}) => {
  const { strict = true, trim = true } = options

  // 严格模式：目前常用号段（13-19开头）
  const strictPattern = /^1[3-9]\d{9}$/
  const loosePattern = /^1\d{10}$/

  return (rule, value, callback) => {
    // 强制转为字符串并去除首尾空格
    let val = String(value ?? '')
    if (trim) val = val.trim()

    // 空值处理
    if (!val) {
      if (required) {
        callback(new Error('手机号为必填项'))
      } else {
        callback() // 非必填且为空，合法
      }
      return
    }

    // 选择正则
    const pattern = strict ? strictPattern : loosePattern

    // 校验
    if (!pattern.test(val)) {
      // 细化错误信息
      if (val.length !== 11) {
        callback(new Error(`请填写正确的手机号`))
      } else if (!/^1\d{10}$/.test(val)) {
        callback(new Error('手机号必须以1开头'))
      } else {
        callback(new Error('请填写正确的手机号码（当前号段不支持）'))
      }
    } else {
      callback()
    }
  }
}

// 固定电话校验
export const validateFixedPhone = (required = false) => {
  return (rule, value, callback) => {
    const fixedPhone = /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/

    if (!value) {
      if (required) {
        callback(new Error('固定电话为必填项'))
      } else {
        callback() // 非必填且为空，合法
      }
    } else if (!fixedPhone.test(value)) {
      callback(new Error('请填写正确合规的固定电话号码'))
    } else {
      callback()
    }
  }
}
