import { getStyle } from 'element-plus/es/utils/dom/index'

export const showTip = {
  created(el, binding, vnode) {
    const tooltipNode = vnode.children.find((childCmpt) => childCmpt.component?.type.name === 'ElTooltip')
    if (tooltipNode) {
      // let { content } = tooltipNode.props;
      el.addEventListener('mouseenter', () => {
        tooltipNode.component.props.disabled = true
        const range = document.createRange()
        range.setStart(el, 0)
        range.setEnd(el, el.childNodes.length)
        const rangeWidth = range.getBoundingClientRect().width
        const padding = (parseFloat(getStyle(el, 'paddingLeft'), 10) || 0) + (parseFloat(getStyle(el, 'paddingRight'), 10) || 0)
        // 取消等比缩放造成的误差
        if (Math.round(rangeWidth + padding) > el.offsetWidth || el.scrollWidth > el.offsetWidth) {
          tooltipNode.component.props.disabled = false
        }
      })
    }
  }
}
// 格式化方法
function formatValue(value) {
  if (!value) return value
  return value
    .replace(/[^0-9.-]/g, '') // 只保留数字 . -
    .replace(/(?!^)-/g, '') // 负号只允许在开头
    .replace(/(\..*)\./g, '$1') // 只保留第一个小数点
}

export const noE = {
  created(el, binding, vnode) {
    const input =
      el.querySelector('.el-input__inner') ||
      el.querySelector('.el-textarea__inner') ||
      el
    input.addEventListener('compositionend', (event) => {
      event.target.value = formatValue(event.target.value)
    })
    // 键盘输入拦截
    el.addEventListener('keydown', (e) => {
      // 禁止 e/E
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
      }
    })

    // 失焦时再次清理
    input.addEventListener('blur', (event) => {
      event.target.value = formatValue(event.target.value)
    })
  }
}

export const focus = {
  mounted(el) {
    el.querySelector('input')?.focus()
  }
}

// 输入框限制几位小数
export const decimalLimit = {
  mounted(el, binding, vnode) {
    const input =
      el.querySelector('.el-input__inner') ||
      el.querySelector('.el-textarea__inner') ||
      el
    input.addEventListener('input', (event) => {
      const value = event.target.value.replace(/[^\d.]/g, '')
      const dotIndex = value.indexOf('.')
      if (dotIndex > -1) {
        const decimalLength = value.length - dotIndex - 1
        if (decimalLength > binding.value) {
          event.target.value = value.slice(0, dotIndex + binding.value + 1)
        }
      }
    })
  }
}

