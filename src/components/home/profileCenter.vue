<template>
  <el-dialog
    v-model="visible"
    class="profileCenterDialog"
    width="480px"
    align-center
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="pcHead">
      <h3 class="pcTitle">个人中心</h3>
      <p class="pcSub">管理个人信息、订阅与账户安全</p>
    </div>

    <div class="pcHero">
      <el-avatar :size="54" class="pcAvatar">{{ initial }}</el-avatar>
      <span class="pcPhone">{{ displayPhone }}</span>
      <button type="button" class="pcIconBtn" title="修改手机号" @click="openPhoneEdit">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20z" />
          <path d="M13.5 6.5l4 4" />
        </svg>
      </button>
    </div>

    <ul class="pcList">
      <li class="pcRow" @click="openPhoneEdit">
        <span class="pcRowIcon">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
            <path d="M10.5 18.5h3" />
          </svg>
        </span>
        <span class="pcRowLabel">手机号</span>
        <span class="pcRowValue">{{ displayPhone }}</span>
        <span class="pcRowAction">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20z" />
            <path d="M13.5 6.5l4 4" />
          </svg>
        </span>
      </li>

      <li class="pcRow" @click="handleAccountEdit">
        <span class="pcRowIcon">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="3.6" />
            <path d="M4.5 20.5c1.6-3.6 4.3-5.4 7.5-5.4s5.9 1.8 7.5 5.4" />
          </svg>
        </span>
        <span class="pcRowLabel">账号</span>
        <span class="pcRowValue">{{ accountText }}</span>
        <span class="pcRowAction">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 4h4a1 1 0 0 1 1 1v4" />
            <path d="M21 15v4a1 1 0 0 1-1 1h-4" />
            <path d="M9 20H5a1 1 0 0 1-1-1v-4" />
            <path d="M3 9V5a1 1 0 0 1 1-1h4" />
          </svg>
        </span>
      </li>

      <li class="pcRow" @click="handlePasswordEdit">
        <span class="pcRowIcon">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4.5" y="10" width="15" height="10.5" rx="2.2" />
            <path d="M8.5 10V7.2a3.5 3.5 0 0 1 7 0V10" />
          </svg>
        </span>
        <span class="pcRowLabel">登录密码</span>
        <span class="pcRowValue">******</span>
        <span class="pcRowAction">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 4h4a1 1 0 0 1 1 1v4" />
            <path d="M21 15v4a1 1 0 0 1-1 1h-4" />
            <path d="M9 20H5a1 1 0 0 1-1-1v-4" />
            <path d="M3 9V5a1 1 0 0 1 1-1h4" />
          </svg>
        </span>
      </li>
    </ul>

    <div class="pcFoot">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.4" />
        <path d="M12 17.2h.01" />
      </svg>
      <span>若有任何意见或建议发送邮箱：</span>
      <a class="pcMail" href="mailto:Ebond@ebondhm.com">Ebond@ebondhm.com →</a>
    </div>
  </el-dialog>

  <!-- 修改手机号 -->
  <el-dialog
    v-model="phoneDialogVisible"
    class="profilePhoneDialog"
    width="400px"
    align-center
    append-to-body
    title="修改手机号"
  >
    <el-form label-position="top">
      <el-form-item label="新手机号">
        <el-input v-model="phoneInput" maxlength="11" placeholder="请输入 11 位手机号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="phoneDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="savePhone">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { onboardingState } from '@/utils/onboarding'
import { DEMO_USER } from '@/mock/demoUser'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'edit-password'])

const PHONE_KEY = 'cot-profile-phone'

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const phoneValue = ref(localStorage.getItem(PHONE_KEY) || onboardingState.form?.phone || DEMO_USER.phone || '')

const displayPhone = computed(() => phoneValue.value || '未绑定')
const accountText = computed(() => localStorage.getItem('account') || DEMO_USER.userName)
const initial = computed(() => (accountText.value || '医').slice(0, 1).toUpperCase())

const phoneDialogVisible = ref(false)
const phoneInput = ref('')

const openPhoneEdit = () => {
  phoneInput.value = /^\d{11}$/.test(phoneValue.value) ? phoneValue.value : ''
  phoneDialogVisible.value = true
}

const savePhone = () => {
  const val = String(phoneInput.value || '').trim()
  if (!/^1\d{10}$/.test(val)) {
    ElMessage.warning('手机号要填 11 位数字，请核对后再保存')
    return
  }
  phoneValue.value = val
  localStorage.setItem(PHONE_KEY, val)
  phoneDialogVisible.value = false
  ElMessage.success('手机号已更新')
}

const handleAccountEdit = () => {
  ElMessage.info('账号由注册手机号生成，如需更换请联系管理员')
}

const handlePasswordEdit = () => {
  emit('edit-password')
}

// 关闭个人中心时一并收起手机号弹窗
watch(visible, (val) => {
  if (!val) phoneDialogVisible.value = false
})
</script>
