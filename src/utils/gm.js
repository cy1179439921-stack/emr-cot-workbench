
import { SM4 } from 'gm-crypto'
import CryptoJS from 'crypto-js'
// function stringToHex(str) {
//   const hex = Array.prototype.map.call(str, (c) => {
//     return c.charCodeAt(0).toString(16)
//   }).join('')
//   return hex
// }
const hash = (str) => {
  const res = CryptoJS.HmacSHA256(str, str).toString(CryptoJS.enc.Hex).toUpperCase()
  return res
}

let token = hash('v1@idl@20260205@v1@idl@20260205@')

// let pwdKey = stringToHex(token) // 密钥替换为后端密钥
export const changeToken = (val) => {
  token = hash('v1idl@20260205@1' + val)
  // pwdKey = stringToHex(token.substring(0, 16))
}
// HMAC-SHA256 签名函数
const generateSign = (data, ts) => {
  // 拼接加密数据和时间戳
  const queryString = `data=${data}&ts=${ts}`

  // 使用 token 作为密钥，生成 HMAC-SHA256 签名
  const sign = CryptoJS.HmacSHA256(queryString, token).toString(CryptoJS.enc.Base64)
  return sign
}
export const encryptedSM4 = (text) => {
  const pwdKey = token.substring(0, 32)
  const gmCryptConfigSet = {
    key: pwdKey,
    mode: SM4.constants.ECB,
    inputEncoding: 'utf8',
    outputEncoding: 'base64'
  }
  // Data...
  const ts = Date.now()
  const encryptedData = SM4.encrypt(JSON.stringify(text), pwdKey, gmCryptConfigSet)
  const sign = generateSign(encryptedData, ts)
  return {
    data: encryptedData,
    sign,
    ts
  }
}

export const decryptedSM4 = (text) => {
  const pwdKey = token.substring(0, 32)
  const gmCryptConfigGet = {
    key: pwdKey,
    mode: SM4.constants.ECB,
    inputEncoding: 'base64',
    outputEncoding: 'utf8'
  }
  const originData = SM4.decrypt(text, pwdKey, gmCryptConfigGet)
  return JSON.parse(originData)
}

export const singleEncryptedSM4 = (text) => {
  // Backend uses substring(0, 32) of the Hex string -> 16 bytes
  const pwdKey = token.substring(0, 32)
  const gmCryptConfigSet = {
    key: pwdKey,
    mode: SM4.constants.ECB,
    inputEncoding: 'utf8',
    outputEncoding: 'hex',
    padding: SM4.constants.PKCS7 // Match backend PKCS5Padding (equivalent to PKCS7)
  }
  const encryptedData = SM4.encrypt(JSON.stringify(text), pwdKey, gmCryptConfigSet)
  return encryptedData
}

export const singleDecryptedSM4 = (text) => {
  const pwdKey = token.substring(0, 32)
  const gmCryptConfigGet = {
    key: pwdKey,
    mode: SM4.constants.ECB,
    inputEncoding: 'hex', // Backend outputs hex
    outputEncoding: 'utf8', // We want utf8 string output
    padding: SM4.constants.PKCS7
  }
  const originData = SM4.decrypt(text, pwdKey, gmCryptConfigGet)
  return JSON.parse(originData)
}
window.decryptedSM4 = decryptedSM4

