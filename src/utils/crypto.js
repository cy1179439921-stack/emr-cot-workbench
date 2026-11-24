import { encrypt, decrypt } from 'crypto-js/aes'
import UTF8 from 'crypto-js/enc-utf8'

// 从环境变量或配置文件中获取密钥
const secretKey = 'ebond-idl'

// 加密数据
export const encryption = (token) => {
  return encrypt(token, secretKey).toString()
}

// 解密数据
export const decryption = (token) => {
  try {
    const decrypted = decrypt(token, secretKey)
    return decrypted.toString(UTF8)
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}

// 存储加密后的 token
export const storeToken = (token) => {
  const encrypted = encryption(token)
  localStorage.setItem('token', encrypted)
}

// 获取解密后的 token
export const getToken = () => {
  const token = localStorage.getItem('token')
  if (token) {
    return decryption(token)
  }
  return null
}

