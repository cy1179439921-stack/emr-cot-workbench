<template>
  <div class="yt-input">
    <div
      ref="ytDiv"
      :class="{'yt-div-edit':true,'ellipsis':true, 'yt-div-edit-focus': (isFocus || editText.length === 0),'yt-div-edit-focus-empty': (editText.length === 0)}"
      contenteditable="plaintext-only"
      :data-placeholder="placeholderText"
      @input="changeDivText($event)"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
      @focus="divFocus"
      @blur="divBlur">
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, watchEffect } from 'vue'
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholderText: {
    type: String,
    default: ''
  },
  maxLength: {
    type: Number,
    default: 200
  }
})
const ytDiv = ref(null)
const isFocus = ref(false)
const editText = ref(props.modelValue)

const sanitizedValue = computed(() => {
  const v = String(editText.value)
  return v.trim().replace(/\n/, '').replace(/<br\/>/g, '').replace(/<br\s*\/?>/gi, '')
})

// 只有当外部值与当前编辑值不同时才更新，避免干扰用户输入
watch(() => props.modelValue, (v) => {
  if (String(v) !== String(editText.value)) {
    editText.value = String(v)
  }
})

// 使用 watchEffect 来更新 DOM 内容，但仅在必要时
watchEffect(() => {
  // 只有在元素存在且当前没有焦点（用户未在输入）时才更新内容
  if (ytDiv.value && !isFocus.value) {
    ytDiv.value.textContent = sanitizedValue.value
  }
})

let isComposing = false // 标记是否处于输入法组合状态

// 监听输入法组合事件
function handleCompositionStart() {
  isComposing = true
}

function handleCompositionEnd(event) {
  isComposing = false
  // 组合结束后，更新内容
  const target = event.target
  const data = String(target.textContent.trim())
  editText.value = data
  emit('update:modelValue', data)
}

function changeDivText (event) {
  // 检查是否处于输入法组合状态
  if (isComposing) {
    // 如果正在组合输入（如拼音转汉字），则只更新值，不执行后续操作
    const data = String(event.target.textContent.trim())
    editText.value = data
    emit('update:modelValue', data)
    return
  }

  // 使用 textContent 而不是 innerHTML，避免输入法组合问题
  const data = String(event.target.textContent.trim())
  editText.value = data
  emit('update:modelValue', data)
}
function divFocus () {
  isFocus.value = true
  nextTick(() => {
    const el = ytDiv.value
    el.textContent = editText.value // 确保显示最新内容
    el.focus()
    // 设置光标在文字最后面
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false) // false 表示光标在末尾
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  })
}

function divBlur () {
  isFocus.value = false
  let data = String(editText.value)
  if (data.length > props.maxLength) {
    data = data.substring(0, props.maxLength)
  }
  nextTick(() => {
    editText.value = data
    emit('update:modelValue', data)
  })
}

defineExpose({
  divFocus,
  divBlur,
  ytDiv
})
</script>
<style lang="scss" scoped>
.yt-input {
  width: 100%;
  .yt-div-edit-focus:empty::before,
  .yt-div-edit:hover:empty::before {
    display: block; /* Ensures visibility in Firefox */
    pointer-events: none;
    font-weight: normal;
    font-size: 18px;
    color: var(--theme-text-3);
    content: attr(data-placeholder);
  }
}
</style>
