<template>
  <div class="uploadField">
    <!-- 图片型附件：缩略图卡片 -->
    <template v-if="mode === 'image'">
      <div
        class="uploadBox"
        :class="{ 'is-filled': modelValue?.url, 'is-error': showError }"
        @click="triggerPick"
      >
        <img v-if="modelValue?.url" :src="modelValue.url" class="uploadThumb" alt="" />
        <div v-else class="uploadEmpty">
          <i class="iconfont icon-a-shangchuantupian-jiahao"></i>
          <span>上传照片</span>
        </div>
        <div v-if="modelValue?.url" class="uploadMask">
          <span>更换</span>
          <span class="uploadDel" @click.stop="clearFile">删除</span>
        </div>
      </div>
      <p v-if="tip" class="uploadTip">{{ tip }}</p>
      <p v-if="showError" class="uploadError">{{ errorText }}</p>
    </template>

    <!-- 文件型附件：文件行 -->
    <template v-else>
      <div class="fileRow" :class="{ 'is-filled': modelValue?.name, 'is-error': showError }" @click="triggerPick">
        <i class="iconfont" :class="modelValue?.name ? 'icon-wenjian' : 'icon-shangchuanfujian'"></i>
        <template v-if="modelValue?.name">
          <span class="fileName">{{ modelValue.name }}</span>
          <span class="fileSize">{{ formatFileSize(modelValue.size) }}</span>
          <span class="fileAction" @click.stop="clearFile">移除</span>
        </template>
        <template v-else>
          <span class="filePlaceholder">{{ placeholder || '点击上传附件' }}</span>
        </template>
      </div>
      <p v-if="tip" class="uploadTip">{{ tip }}</p>
      <p v-if="showError" class="uploadError">{{ errorText }}</p>
    </template>

    <input
      ref="fileInput"
      class="fileInput"
      type="file"
      :accept="accept"
      @change="onFileChange"
    />
  </div>
</template>

<script>
export default { name: 'UploadField' }
</script>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { readAttachment, formatFileSize, ATTACHMENT_MAX_MB } from '@/utils/onboarding'

defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'image'
  },
  accept: {
    type: String,
    default: 'image/png,image/jpeg,image/jpg,image/webp'
  },
  tip: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  showError: {
    type: Boolean,
    default: false
  },
  errorText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
const fileInput = ref(null)
const uploading = ref(false)

const triggerPick = () => {
  if (uploading.value) return
  fileInput.value?.click()
}

const clearFile = () => {
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}

const onFileChange = async (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  if (file.size > ATTACHMENT_MAX_MB * 1024 * 1024) {
    ElMessage.warning(`文件超过 ${ATTACHMENT_MAX_MB} MB，请压缩后再上传`)
    event.target.value = ''
    return
  }
  uploading.value = true
  try {
    const attachment = await readAttachment(file)
    emit('update:modelValue', attachment)
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}
</script>

<style lang="scss" scoped>
.uploadField {
  display: flex;
  flex-direction: column;
}

.fileInput {
  display: none;
}

/* ===================== 图片型 ===================== */
.uploadBox {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 156px;
  height: 104px;
  border: 1px dashed var(--theme-primary-border);
  border-radius: 12px;
  background: var(--theme-card);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: var(--theme-primary);
    background: var(--theme-primary-soft);
  }

  &.is-filled {
    border-style: solid;
    border-color: var(--theme-border);
    background: var(--theme-card);
  }

  &.is-error {
    border-color: var(--theme-danger);
  }
}

.uploadThumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploadEmpty {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--theme-text-3);
  gap: 4px;

  i {
    font-size: 20px;
  }

  span {
    font-size: 13px;
  }
}

.uploadMask {
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  inset: 0;
  background: rgba(60, 47, 38, 0.55);
  font-size: 13px;
  color: var(--theme-card);
  opacity: 0;
  transition: opacity 0.2s ease;
  gap: 14px;
}

.uploadBox:hover .uploadMask {
  opacity: 1;
}

.uploadDel {
  text-decoration: underline;
}

/* ===================== 文件型 ===================== */
.fileRow {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 44px;
  padding: 0 14px;
  border: 1px dashed var(--theme-primary-border);
  border-radius: 12px;
  background: var(--theme-card);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  gap: 10px;

  &:hover {
    border-color: var(--theme-primary);
    background: var(--theme-primary-soft);
  }

  &.is-filled {
    border-style: solid;
    border-color: var(--theme-border);
    background: var(--theme-card);
  }

  &.is-error {
    border-color: var(--theme-danger);
  }

  i {
    font-size: 15px;
    color: var(--theme-primary);
  }
}

.fileName {
  overflow: hidden;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: var(--theme-text);
}

.fileSize {
  flex: none;
  font-size: 12px;
  color: var(--theme-text-3);
}

.fileAction {
  flex: none;
  font-size: 13px;
  color: var(--theme-primary);

  &:hover {
    text-decoration: underline;
  }
}

.filePlaceholder {
  font-size: 14px;
  color: var(--theme-text-3);
}

/* ===================== 提示 ===================== */
.uploadTip {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--theme-text-3);
}

.uploadError {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--theme-danger);
}
</style>
