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

    <!-- 头像 + 姓名（可改） -->
    <div class="pcHero">
      <el-avatar :size="54" class="pcAvatar">{{ initial }}</el-avatar>

      <div v-if="editing === 'name'" class="pcHeroEdit">
        <el-input
          v-model.trim="draft"
          size="default"
          maxlength="20"
          placeholder="请输入姓名"
          class="pcInlineInput"
          @keyup.enter="saveEdit"
        />
        <div class="pcInlineActions">
          <el-button link type="primary" @click="saveEdit">保存</el-button>
          <el-button link @click="cancelEdit">取消</el-button>
        </div>
      </div>
      <template v-else>
        <span class="pcName">{{ profile.name }}</span>
        <span class="verifyTag"><i class="iconfont icon-guanfangrenzheng" />已认证</span>
        <button type="button" class="pcIconBtn" title="修改姓名" @click="startEdit('name')">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20z" />
            <path d="M13.5 6.5l4 4" />
          </svg>
        </button>
      </template>
    </div>

    <ul class="pcList">
      <!-- 手机号：弹窗改，需要验证码 -->
      <li class="pcRow" @click="openPhoneEdit">
        <span class="pcRowIcon">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
            <path d="M10.5 18.5h3" />
          </svg>
        </span>
        <span class="pcRowLabel">手机号</span>
        <span class="pcRowValue">{{ profile.phone || '未绑定' }}</span>
        <span class="pcRowAction">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20z" />
            <path d="M13.5 6.5l4 4" />
          </svg>
        </span>
      </li>

      <!-- 账号：直接变编辑框 -->
      <li class="pcRow" :class="{ 'is-editing': editing === 'account' }" @click="editing === 'account' ? null : startEdit('account')">
        <span class="pcRowIcon">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="3.6" />
            <path d="M4.5 20.5c1.6-3.6 4.3-5.4 7.5-5.4s5.9 1.8 7.5 5.4" />
          </svg>
        </span>
        <span class="pcRowLabel">账号</span>
        <template v-if="editing === 'account'">
          <el-input
            v-model.trim="draft"
            maxlength="20"
            class="pcInlineInput"
            placeholder="6-20 位数字或字母"
            @keyup.enter="saveEdit"
          />
          <span class="pcInlineActions">
            <el-button link type="primary" @click.stop="saveEdit">保存</el-button>
            <el-button link @click.stop="cancelEdit">取消</el-button>
          </span>
        </template>
        <template v-else>
          <span class="pcRowValue">{{ profile.account }}</span>
          <span class="pcRowAction">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20z" />
              <path d="M13.5 6.5l4 4" />
            </svg>
          </span>
        </template>
      </li>

      <!-- 登录密码：打开修改密码弹窗 -->
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
    width="500px"
    align-center
    append-to-body
    title="修改手机号"
    :close-on-click-modal="false"
  >
    <el-form label-width="80px" label-position="right">
      <el-form-item label="新手机号">
        <el-input v-model.trim="phoneInput" maxlength="11" placeholder="请输入 11 位手机号" />
      </el-form-item>
      <el-form-item label="验证码">
        <div class="phoneCodeRow">
          <el-input v-model.trim="codeInput" maxlength="6" placeholder="请输入短信验证码" />
          <el-button class="codeBtn" :disabled="counting" @click="sendCode">
            {{ counting ? countdown + 's 后重发' : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="phoneDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="savePhone">确认修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { onboardingState } from '@/utils/onboarding'
import { DEMO_USER } from '@/mock/demoUser'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'edit-password'])

const NAME_KEY = 'cot-profile-name'
const PHONE_KEY = 'cot-profile-phone'
const DEMO_SMS_CODE = '123456'

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const profile = reactive({
  name: localStorage.getItem(NAME_KEY) || DEMO_USER.userName,
  phone: localStorage.getItem(PHONE_KEY) || onboardingState.form?.phone || DEMO_USER.phone || '',
  account: localStorage.getItem('account') || DEMO_USER.userName
})

const initial = computed(() => (profile.name || profile.account || '医').slice(0, 1).toUpperCase())

// ===== 姓名 / 账号：行内编辑 =====
const editing = ref('')
const draft = ref('')

const startEdit = (key) => {
  editing.value = key
  draft.value = key === 'name' ? profile.name : profile.account
}

const cancelEdit = () => {
  editing.value = ''
  draft.value = ''
}

const saveEdit = () => {
  const val = String(draft.value || '').trim()
  if (editing.value === 'name') {
    if (!val) {
      ElMessage.warning('姓名不能为空')
      return
    }
    profile.name = val
    localStorage.setItem(NAME_KEY, val)
    ElMessage.success('姓名已更新')
  } else if (editing.value === 'account') {
    if (!/^[A-Za-z0-9]{6,20}$/.test(val)) {
      ElMessage.warning('账号只能填数字或字母，长度 6-20 位')
      return
    }
    profile.account = val
    localStorage.setItem('account', val)
    ElMessage.success('账号已更新')
  }
  cancelEdit()
}

// ===== 手机号：弹窗 + 验证码 =====
const phoneDialogVisible = ref(false)
const phoneInput = ref('')
const codeInput = ref('')
const counting = ref(false)
const countdown = ref(60)
let countdownTimer = null

const openPhoneEdit = () => {
  phoneInput.value = /^\d{11}$/.test(profile.phone) ? profile.phone : ''
  codeInput.value = ''
  phoneDialogVisible.value = true
}

const sendCode = () => {
  if (!/^1\d{10}$/.test(phoneInput.value)) {
    ElMessage.warning('请先填写 11 位新手机号')
    return
  }
  if (counting.value) return
  counting.value = true
  countdown.value = 60
  ElMessage.success('验证码已发送（演示环境固定为 123456）')
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      counting.value = false
    }
  }, 1000)
}

const savePhone = () => {
  if (!/^1\d{10}$/.test(phoneInput.value)) {
    ElMessage.warning('手机号要填 11 位数字，请核对后再保存')
    return
  }
  if (codeInput.value !== DEMO_SMS_CODE) {
    ElMessage.error('验证码不正确或已过期，请重新获取')
    return
  }
  profile.phone = phoneInput.value
  localStorage.setItem(PHONE_KEY, phoneInput.value)
  phoneDialogVisible.value = false
  ElMessage.success('手机号已更新')
}

const handlePasswordEdit = () => {
  emit('edit-password')
}

watch(visible, (val) => {
  if (!val) {
    cancelEdit()
    phoneDialogVisible.value = false
    clearInterval(countdownTimer)
    counting.value = false
  }
})

onBeforeUnmount(() => clearInterval(countdownTimer))
</script>
