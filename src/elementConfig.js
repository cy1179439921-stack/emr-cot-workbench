import { ElSelect, ElDatePicker, ElPagination, ElTree, ElMessageBox, ElMessage } from 'element-plus'
import { emitter } from '@/utils/bus'
import { h } from 'vue'
import lodash from 'lodash'
ElSelect.props.suffixIcon.default = () => h('i', {
  class: 'iconfont icon-xuanzekuang-xiala',
  style: {
    fontSize: `${6 / 14}rem`
  }
})

ElDatePicker.props.prefixIcon.default = () => h('i', {
  class: 'iconfont icon-xialakuang-riqi customDatePickerIcon'
})

ElTree.props.icon.default = () => h('i', {
  class: 'iconfont icon-xiala-2',
  style: {
    fontSize: `${9 / 14}rem`
  }
})

ElPagination.props = {
  ...ElPagination.props,
  background: {
    ...ElPagination.props.background,
    default: true
  },
  layout: {
    ...ElPagination.props.layout,
    default: 'slot, total,  prev, pager, next,sizes, jumper'
  },
  pageSizes: {
    ...ElPagination.props.pageSizes,
    default: [20, 50, 100]
  }
}

const confirm = ElMessageBox.confirm // 保存原有confirm方法
ElMessageBox.confirm = (message, title, options) => {
  const { type } = options || {}
  if (type === 'warning') {
    options.icon = () => h('i', {
      class: 'iconfont icon-querentishi',
      style: {
        fontSize: `${18 / 14}rem`
      }
    })
  }
  return confirm.call(ElMessageBox, message, title, options)
}

const initElMessageErrorFn = ElMessage.error
ElMessage.error = (options) => {
  const errorIcon = () => h('i', {
    class: 'iconfont icon-tishicuowu-butongshujuyuan',
    style: {
      fontSize: `${18 / 14}rem`
    }
  })
  if (lodash.isObject(options)) {
    initElMessageErrorFn({ ...options, icon: errorIcon })
  } else {
    initElMessageErrorFn({ message: options, icon: errorIcon })
  }
  emitter.emit('closeLoading')
}

const initElMessageWarningFn = ElMessage.warning
ElMessage.warning = (options) => {
  const errorIcon = () => h('i', {
    class: 'iconfont icon-querentishi',
    style: {
      fontSize: `${18 / 14}rem`
    }
  })
  if (lodash.isObject(options)) {
    initElMessageWarningFn({ ...options, icon: errorIcon })
  } else {
    initElMessageWarningFn({ message: options, icon: errorIcon })
  }
  emitter.emit('closeLoading')
}

const initElMessageSuccessFn = ElMessage.success
ElMessage.success = (options) => {
  const errorIcon = () => h('i', {
    class: 'iconfont icon-tishi-wancheng',
    style: {
      fontSize: `${18 / 14}rem`
    }
  })
  if (lodash.isObject(options)) {
    initElMessageSuccessFn({ ...options, icon: errorIcon })
  } else {
    initElMessageSuccessFn({ message: options, icon: errorIcon })
  }
  emitter.emit('closeLoading')
}

