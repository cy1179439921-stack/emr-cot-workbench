<template>
  <div class="AI-setting">
    <header class="header">
      <div class="icon-div flexCenter" @click="toBack">
        <i class="iconfont icon-zuo"></i>
        设置
      </div>
    </header>
    <div class="setting-content">
      <el-tabs tab-position="left" class="tabs-div" v-model="editableTabsValue" @tab-change="tabChange">
        <el-tab-pane v-for="item in editableTabs" :key="item.id" :label="item.name" :name="item.id">
          <template #label>
            <div class="label-container">
              <i :class="item.icon"></i>
              <div class="span-title">
                <span>{{ item.name }}</span>
              </div>
            </div>
          </template>
        </el-tab-pane>
        <div class="tabs-content" v-if="editableTabsValue === 'API'">
          <el-form ref="form" :model="APIForm" label-width="100px" :rules="rules" label-position="left">
            <el-form-item label="API Key" prop="apiKey">
              <el-input v-model="APIForm.apiKey" placeholder="请填写DeepSeek API Key"></el-input>
            </el-form-item>
          </el-form>
          <div class="hint">在此输入您的 DeepSeek API Key，它将被安全地存储在本地</div>
          <el-button type="primary" @click="handleSubmit">保 存</el-button>
          <div class="how-div">如何获取 API Key？</div>
          <ul class="ul-list">
            <li v-for="(text, lIndex) in getAPIKeyList" :key="lIndex">
              {{lIndex + 1}}.
              {{text}}
            </li>
          </ul>
        </div>
        <div class="tabs-content" v-if="editableTabsValue === 'Model'">
          <el-form ref="form" :model="APIForm" label-width="100px" :rules="rules" label-position="left">
            <el-form-item prop="model">
              <template #label>
                模型
                <el-tooltip content="选择要使用的模型" placement="top">
                  <i class="iconfont icon-bangzhuzhongxin"></i>
                </el-tooltip>
              </template>
              <el-select v-model="APIForm.model" placeholder="请选择模型">
                <el-option
                  v-for="item in modelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="temperature" style="display: none;">
              <template #label>
                Temperature
                <el-tooltip content="控制输出的随机性，值越高输出越随机" placement="top">
                  <i class="iconfont icon-bangzhuzhongxin"></i>
                </el-tooltip>
              </template>
              <el-input v-model="APIForm.temperature" placeholder="请填写DeepSeek API Key"></el-input>
            </el-form-item>
            <el-form-item prop="maxTokens">
              <template #label>
                最大长度
                <el-tooltip content="生成文本的最大长度" placement="top">
                  <i class="iconfont icon-bangzhuzhongxin"></i>
                </el-tooltip>
              </template>
              <el-input type="number" v-no-e v-model="APIForm.max_tokens" placeholder="请填写DeepSeek API Key"></el-input>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="handleSubmit">保存设置</el-button>
          <el-button @click="resetForm">重 置</el-button>
        </div>
        <div class="tabs-content" v-if="editableTabsValue === 'Balance'">
          <div class="balance-title">余额</div>
          <div class="balance-text">{{balance}} ¥</div>
        </div>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AISetting',
  inheritAttrs: false
})
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
const emits = defineEmits(['handleBack', 'getBalance'])
const editableTabsValue = ref('API')
const editableTabs = ref([
  {
    id: 'API',
    name: 'API 设置',
    icon: 'iconfont icon-a-5'
  },
  {
    id: 'Model',
    name: '模型设置',
    icon: 'iconfont icon-a-5'
  },
  {
    id: 'Balance',
    name: '账户余额',
    icon: 'iconfont icon-a-10'
  }
])
const APIForm = ref({})
const balance = ref(0)
if (localStorage.getItem('APIForm')) {
  APIForm.value = JSON.parse(localStorage.getItem('APIForm'))
} else {
  APIForm.value = {
    apiKey: '',
    model: 'deepseek-reasoner',
    temperature: 0.6, // 严谨与想象 越低越严谨 官方建议0.6
    max_tokens: 8192 // 限制一次请求中模型生成 completion 的最大 token 数
  }
}
const validate1 = (rule, value, callback) => {
  const regex = /^[1-9]\d*$/
  if (!regex.test(value)) {
    callback(new Error('必须是1-8192的整数'))
  } else if (value < 1 || value > 8192) {
    callback(new Error('数值范围1-8192的整数'))
  } else {
    callback()
  }
}
const validate2 = (rule, value, callback) => {
  if (value < 0 || value > 2) {
    callback(new Error('数值范围0-2之间'))
  } else {
    callback()
  }
}
const rules = {
  apiKey: [
    { required: true, message: '请填写DeepSeek API Key', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请选择模型', trigger: 'blur' }
  ],
  temperature: [
    { required: true, message: '请填写0-2的浮点数', trigger: 'blur' },
    { validator: validate2, trigger: 'blur' }
  ],
  maxTokens: [
    { required: true, message: '数值范围1-8192的整数', trigger: 'blur' },
    { validator: validate1, trigger: 'blur' }
  ]
}
const getAPIKeyList = ref([
  '访问 DeepSeek 开发者平台',
  '注册或登录您的账号',
  '在控制台中创建新的 API Key',
  '复制并粘贴到上方输入框'
])
const modelOptions = ref([
  // {
  //   value: 'deepseek-chat',
  //   label: 'DeepSeek Chat'
  // },
  {
    value: 'deepseek-reasoner',
    label: 'DeepSeek Reasoner'
  },
  {
    value: 'QwQ-32B',
    label: 'QwQ-32B'
  }
])
const toBack = () => {
  emits('handleBack', false)
}
// 保存
const handleSubmit = () => {
  localStorage.setItem('APIForm', JSON.stringify(APIForm.value))
  ElMessage.success('已保存')
}
// 重置
const resetForm = () => {
  APIForm.value = {
    apiKey: JSON.parse(localStorage.getItem('APIForm')).apiKey || '',
    model: 'deepseek-reasoner',
    temperature: 0.6, // 严谨与想象 越低越严谨 官方建议0.6
    max_tokens: 8192 // 限制一次请求中模型生成 completion 的最大 token 数
  }
}
// 切换tab
const tabChange = (value) => {
  if (value === 'Balance') {
    emits('getBalance')
  }
}
// 设置余额
const setBalance = (value) => {
  balance.value = value
}
defineExpose({
  setBalance
})
</script>
<style scoped lang="scss">
.AI-setting {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: var(--theme-card);
  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 48px;
    border-bottom: 1px solid #dbdcdf;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-text);
    .icon-div {
      height: 100%;
      margin-right: 16px;
      padding-left: 16px;
      cursor: pointer;
      color: var(--theme-primary);
      i {
        font-size: 32px;
      }
    }
  }
  .setting-content {
    box-sizing: border-box;
    padding: 16px;
    .tabs-content {
      width: 504px;
      padding-left: 24px;
      .balance-title {
        font-weight: 600;
        color: var(--theme-text);
      }
      .balance-text {
        margin-top: 16px;
        font-weight: 600;
        font-size: 20px;
        color: var(--theme-text);
      }
    }
    :deep(.el-tabs) {
      .el-tabs__item {
        height: 60px;
        .label-container {
          display: flex;
          align-items: center;
          height: 100%;
          i {
            font-size: 28px;
          }
        }
      }
      .el-form {
        .el-form-item {
          flex-direction: column;
          .el-form-item__label {
            font-weight: 600;
            .icon-bangzhuzhongxin {
              cursor: pointer;
              font-size: 28px;
            }
          }
          .el-input__wrapper {
            height: 40px;
          }
        }
      }
      // .hint {
      // }
      .el-button {
        margin-top: 24px;
      }
      .how-div {
        margin-top: 24px;
        line-height: 32px;
        font-weight: 600;
      }
      .ul-list {
        line-height: 32px;
      }
    }
  }
}
</style>
