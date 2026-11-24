<template>
  <div class="editableDivContaienr">
    <div id="editableDiv" ref="editableDiv" contenteditable="true">

    </div>
    <div class="placeholderDom" v-show="!isContent">
      补充一个关键词，例如：<span>限定人群（如老年人）</span>或<span>研究类型（随机对照试验）</span>
    </div>
    <div class="retryBtn" @click="handleRetry">
      <i class="iconfont icon-zhongxinshengcheng"></i>
      <span>重新生成</span>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
const emits = defineEmits(['handleRetry'])
const editableDiv = ref()
const isEmpty = () => {
  return editableDiv.value.innerHTML === '<br>' || editableDiv.value.innerHTML.trim() === ''
}
const isContent = ref(false)
const handleRetry = () => {
  if (isEmpty()) {
    ElMessage.error('输入关键词，如姓名或工号')
  } else {
    emits('handleRetry', editableDiv.value.innerHTML)
  }
}
onMounted(() => {
  editableDiv.value.addEventListener('focus', function() {
    isContent.value = true
  })

  editableDiv.value.addEventListener('blur', function() {
    if (!isEmpty()) {
      isContent.value = true
    } else {
      isContent.value = false
    }
  })
})
defineExpose({
  editableDiv
})

</script>
<style scoped lang="scss">
.editableDivContaienr {
  display: flex;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  min-height: 0; /* flex 子项需设置 min-height: 0 才能正确收缩并继承父高度 */
  padding: 16px;
  padding-bottom: 42px;
  border: none;
}
#editableDiv {
  position: relative;
  z-index: 2;
  min-height: 50px;
  padding: 0;
  outline: none; /* 移除焦点时的默认轮廓 */
  font-size: 16px;
  color: var(--theme-text);
}

.placeholder {
  color: var(--theme-text-3); /* 灰色文字作为提示词样式 */
}
.placeholderDom {
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  line-height: 20px;
  font-weight: 400;
  font-size: 14px;
  color: var(--theme-text-3);

  span {
    color: var(--theme-primary);
  }
}
.retryBtn {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 3;
  cursor: pointer;
  line-height: 20px;
  font-weight: 600;
  font-size: 14px;
  color: var(--theme-primary);
  .iconfont {
    margin-right: 6px;
  }
}
</style>
