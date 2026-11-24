<template>
  <div class="empty-state">
    <img :src="imageSrc" alt="" class="empty-state__illustration" />
    <p class="empty-state__desc">{{ desc }}</p>
    <el-button
      v-if="showAction"
      type="primary"
      class="empty-state__action"
      @click="$emit('action')"
    >{{ actionText }}</el-button>
  </div>
</template>

<script>
export default { name: 'EmptyState' }
</script>

<script setup>
import { computed } from 'vue'
import image1 from '@/assets/empty-1.png'
import image2 from '@/assets/empty-2.png'

// 组件属性
const props = defineProps({
  // 空状态预设类型：1=等待分配任务 / 2=需劳务签署 / 3=等待发放协议
  type: { type: [Number, String], default: 1 },
  // 自定义描述文案（传入时覆盖预设）
  desc: { type: String, default: '' },
  // 自定义按钮文字（传入时覆盖预设）
  actionText: { type: String, default: '劳务签署' },
  // 是否显示操作按钮（传入时覆盖预设）
  showAction: { type: Boolean, default: false }
})

defineEmits(['action'])

// 三种空状态的预设配置（插画、文案、按钮）
const PRESETS = {
  1: {
    image: image1,
    desc: '这里还没有内容',
    actionText: '',
    showAction: false
  },
  2: {
    image: image1,
    desc: '完成劳务签署后就可以开始标注了',
    actionText: '劳务签署',
    showAction: true
  },
  3: {
    image: image2,
    desc: '协议还在准备中，管理员发放后会通知您',
    actionText: '',
    showAction: false
  }
}

// 当前生效的预设配置
const preset = computed(() => PRESETS[props.type] || PRESETS[1])

// 实际使用的插画路径
const imageSrc = computed(() => preset.value.image)

// 实际显示的描述文案
const desc = computed(() => props.desc || preset.value.desc)

// 实际显示的按钮文字
const actionText = computed(() => props.actionText || preset.value.actionText)

// 是否渲染操作按钮
const showAction = computed(() => props.showAction || preset.value.showAction)
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 40px 16px;
  background: var(--theme-card);

  &__illustration {
    width: 162px;
    height: auto;
  }

  &__desc {
    margin-top: 22px;
    line-height: 22px;
    text-align: center;
    font-size: 14px;
    color: var(--theme-text-3);
  }

  &__action {
    min-width: 120px;
    height: 32px;
    margin-top: 24px;
    font-weight: 500;
    font-size: 14px;
  }
}
</style>
