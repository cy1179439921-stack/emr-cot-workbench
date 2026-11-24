// DeepSeek配置文件
// API配置
export const DEEPSEEK_CONFIG = {
  // baseURL: 'https://api.deepseek.com/v1',
  // baseURL: 'http://10.31.0.23:9997/v1',
  // apiKey: 'sk-', // 换成自己的apiKey
  dangerouslyAllowBrowser: true
}

// 模型配置
export const MODEL_CONFIG = {
  // model: 'deepseek-chat', // 调用DeepSeek-V3
  model: 'deepseek-reasoner', // DeepSeek-R1
  // model: 'QwQ-32B',
  stream: true,
  max_tokens: 8192, // 限制一次请求中模型生成 completion 的最大 token 数
  temperature: 0.6 // 严谨与想象 越低越严谨 官方建议0.6
}

// 本地存储键名配置
export const STORAGE_KEYS = {
  sessionList: 'deepseekSessionList',
  activeSessionInfo: 'activeDeepseekSessionInfo',
  indexDBName: 'deepseek-chat',
  indexDBTableName: 'deepseek-history-message'
}

export const DOUBAO_STORAGE_KEYS = {
  sessionList: 'doubaoSessionList',
  activeSessionInfo: 'activeDoubaoSessionInfo',
  indexDBName: 'doubao-chat',
  indexDBTableName: 'doubao-history-message'
}
