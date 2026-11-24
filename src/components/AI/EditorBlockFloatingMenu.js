/**
 * AiEditor 块元素浮动菜单
 * 用于在鼠标悬停时显示块类型标识和转换菜单
 */
import { echartsToPx } from '@/utils/utils.js'

export class EditorBlockFloatingMenu {
  constructor (editorElement) {
    this.editorElement = editorElement
    this.floatingMenu = null
    this.dropdown = null
    this.currentBlock = null
    this.container = null
    this.proseMirror = null
    this.hideTimer = null // 延迟隐藏定时器

    this.init()
  }

  init () {
    // 获取编辑器内容区域
    this.proseMirror = this.editorElement.querySelector('.ProseMirror')
    if (!this.proseMirror) {
      this.proseMirror = this.editorElement.querySelector('.aie-content')
    }
    if (!this.proseMirror) {
      this.proseMirror = this.editorElement.querySelector('[contenteditable="true"]')
    }

    if (!this.proseMirror) {
      console.warn('未找到可编辑区域')
      return
    }

    // 获取父容器
    this.container = this.proseMirror.parentElement
    if (!this.container) {
      console.warn('未找到 ProseMirror 父容器')
      return
    }

    // 确保父容器有 position: relative
    const containerPosition = window.getComputedStyle(this.container).position
    if (containerPosition === 'static') {
      this.container.style.position = 'relative'
    }

    // 创建浮动菜单
    this.createFloatingMenu()

    // 创建下拉菜单
    this.createDropdown()

    // 绑定事件
    this.bindEvents()
  }

  createFloatingMenu () {
    this.floatingMenu = document.createElement('div')
    this.floatingMenu.className = 'block-floating-menu'
    this.floatingMenu.setAttribute('data-floating-menu', 'true')
    this.floatingMenu.style.cssText = `
      position: absolute;
      left: ${echartsToPx(9)}px;
      width: ${echartsToPx(32)}px;
      height: ${echartsToPx(24)}px;
      display: none;
      align-items: center;
      justify-content: center;
      background: transparent;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      color: #8a8f98;
      cursor: grab;
      z-index: 1000;
      border:1px solid #e8e9eb;
      user-select: none;
      pointer-events: auto;
      transition: all 0.15s ease;
    `

    this.container.appendChild(this.floatingMenu)
  }

  createDropdown () {
    this.dropdown = document.createElement('div')
    this.dropdown.className = 'block-type-dropdown'
    this.dropdown.style.cssText = `
      position: absolute;
      left: 45px;
      top: 0;
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      display: none;
      z-index: 1001;
      pointer-events: none;
      padding: 8px;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
    `

    // 菜单选项
    const menuOptions = [
      { label: '正文', value: 'p', icon: 'T' },
      { label: '标题 1', value: 'h1', icon: 'H1' },
      { label: '标题 2', value: 'h2', icon: 'H2' },
      { label: '标题 3', value: 'h3', icon: 'H3' },
      { label: '标题 4', value: 'h4', icon: 'H4' },
      { label: '标题 5', value: 'h5', icon: 'H5' },
      { label: '标题 6', value: 'h6', icon: 'H6' }
    ]

    menuOptions.forEach(option => {
      const item = document.createElement('div')
      item.className = 'dropdown-item'
      item.textContent = option.icon
      item.setAttribute('data-block-type', option.value)
      item.style.cssText = `
        width: 36px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f2f3f5;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        color: #1f2329;
        cursor: pointer;
        transition: all 0.15s ease;
      `

      item.addEventListener('mouseenter', () => {
        item.style.background = '#e8e9eb'
        item.style.transform = 'scale(1.05)'
      })

      item.addEventListener('mouseleave', () => {
        item.style.background = '#f2f3f5'
        item.style.transform = 'scale(1)'
      })

      item.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()

        if (this.currentBlock) {
          this.changeBlockType(this.currentBlock, option.value)
          this.hideDropdown()
          this.floatingMenu.style.display = 'none'
          this.currentBlock = null
        }
      })

      this.dropdown.appendChild(item)
    })

    this.container.appendChild(this.dropdown)
  }

  bindEvents () {
    // 点击浮动菜单显示/隐藏下拉菜单
    this.floatingMenu.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.toggleDropdown()
    })

    // 阻止鼠标按下事件，避免影响编辑器
    this.floatingMenu.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      e.preventDefault()
    })

    // 鼠标进入浮动菜单时，选中当前块元素的文本
    this.floatingMenu.addEventListener('mouseenter', () => {
      if (this.currentBlock) {
        this.selectBlockText(this.currentBlock)
      }
    })

    // 鼠标离开浮动菜单时，取消文本选中
    this.floatingMenu.addEventListener('mouseleave', () => {
      this.clearSelection()
    })

    // 容器鼠标移动事件
    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true })

    // 容器鼠标离开事件
    this.container.addEventListener('mouseleave', (e) => this.handleMouseLeave(e), { passive: true })
  }

  handleMouseMove (e) {
    const target = e.target

    // 使用 elementFromPoint 检测鼠标下方的真实元素
    const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY)

    // 检查是否在浮动菜单或下拉菜单上
    const isOnFloatingMenu =
      target === this.floatingMenu || this.floatingMenu.contains(target) ||
      elementUnderMouse === this.floatingMenu || this.floatingMenu.contains(elementUnderMouse) ||
      target.classList?.contains('block-floating-menu') || elementUnderMouse?.classList?.contains('block-floating-menu')

    const isOnDropdown =
      target === this.dropdown || this.dropdown.contains(target) ||
      elementUnderMouse === this.dropdown || this.dropdown.contains(elementUnderMouse) ||
      !!target.closest('.dropdown-item') || !!elementUnderMouse?.closest('.dropdown-item')

    // 如果鼠标在浮动菜单或下拉菜单上，保持菜单显示，并取消隐藏定时器
    if (isOnFloatingMenu || isOnDropdown) {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
        this.hideTimer = null
      }
      return
    }

    // 检查是否是我们关心的块元素
    const blockElement = target.closest('h1, h2, h3, h4, h5, h6, p, ul, ol, pre, blockquote')

    // 如果鼠标不在块元素上，延迟隐藏菜单
    if (!blockElement || !this.proseMirror.contains(blockElement)) {
      // 只有当下拉菜单也不可见时，才延迟隐藏浮动菜单
      if (this.dropdown.style.display !== 'grid') {
        // 清除之前的定时器
        if (this.hideTimer) {
          clearTimeout(this.hideTimer)
        }
        // 设置新的延迟隐藏定时器
        this.hideTimer = setTimeout(() => {
          this.floatingMenu.style.display = 'none'
          this.currentBlock = null
          this.hideTimer = null
        }, 200) // 延迟 200ms
      }
      return
    }

    // 取消隐藏定时器（如果有的话）
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    // 如果是同一个块元素，不需要重新定位
    if (blockElement === this.currentBlock) {
      return
    }

    // 切换到新的块元素，隐藏下拉菜单
    this.hideDropdown()

    this.currentBlock = blockElement

    // 设置菜单文本
    const label = this.getBlockTypeLabel(blockElement)
    if (!label) {
      this.floatingMenu.style.display = 'none'
      return
    }

    this.floatingMenu.textContent = label

    // 定位菜单
    this.positionFloatingMenu(blockElement)

    this.floatingMenu.style.display = 'flex'
  }

  handleMouseLeave (e) {
    // 鼠标离开容器时，检查是否移到了浮动菜单或下拉菜单上
    const relatedTarget = e.relatedTarget

    // 如果鼠标移到了浮动菜单或下拉菜单上，不隐藏
    if (relatedTarget === this.floatingMenu || this.floatingMenu.contains(relatedTarget) ||
        relatedTarget === this.dropdown || this.dropdown.contains(relatedTarget)) {
      return
    }

    // 如果下拉菜单不可见，隐藏浮动菜单
    if (this.dropdown.style.display !== 'grid') {
      this.floatingMenu.style.display = 'none'
      this.currentBlock = null
    }
  }

  positionFloatingMenu (blockElement) {
    const blockRect = blockElement.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()
    const blockStyle = window.getComputedStyle(blockElement)
    const paddingTop = parseFloat(blockStyle.paddingTop) || 0

    const top = blockRect.top - containerRect.top + this.container.scrollTop + paddingTop

    this.floatingMenu.style.top = `${top}px`
  }

  toggleDropdown () {
    const isVisible = this.dropdown.style.display === 'grid'

    if (isVisible) {
      this.hideDropdown()
    } else {
      this.showDropdown()
    }
  }

  showDropdown () {
    this.dropdown.style.top = this.floatingMenu.style.top
    this.dropdown.style.display = 'grid'
    this.dropdown.style.pointerEvents = 'auto'
  }

  hideDropdown () {
    this.dropdown.style.display = 'none'
    this.dropdown.style.pointerEvents = 'none'
  }

  changeBlockType (element, newType) {
    if (!element) return

    const newElement = document.createElement(newType)
    newElement.innerHTML = element.innerHTML

    // 复制属性
    Array.from(element.attributes).forEach(attr => {
      newElement.setAttribute(attr.name, attr.value)
    })

    element.parentNode.replaceChild(newElement, element)
  }

  getBlockTypeLabel (element) {
    if (!element) return ''
    const tagName = element.tagName.toLowerCase()
    const labelMap = {
      h1: 'H1',
      h2: 'H2',
      h3: 'H3',
      h4: 'H4',
      h5: 'H5',
      h6: 'H6',
      p: 'T',
      ul: '•',
      ol: '1.',
      pre: '</>',
      blockquote: '"'
    }
    return labelMap[tagName] || ''
  }

  selectBlockText (element) {
    if (!element) return

    try {
      const selection = window.getSelection()
      const range = document.createRange()

      // 选中整个块元素的内容
      range.selectNodeContents(element)

      // 清除现有选区并添加新选区
      selection.removeAllRanges()
      selection.addRange(range)
    } catch (error) {
      console.warn('选中文本失败:', error)
    }
  }

  clearSelection () {
    try {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
      }
    } catch (error) {
      console.warn('清除选中失败:', error)
    }
  }

  destroy () {
    // 清理事件监听器和 DOM 元素
    if (this.floatingMenu) {
      this.floatingMenu.remove()
    }
    if (this.dropdown) {
      this.dropdown.remove()
    }
    this.currentBlock = null
  }
}
