import service from './index'
// 获取平台信息
export const getPlatformInfo = (params) => service.post('/system/platformInfo/getPlatformInfo', params)
// 修改平台信息
export const updatePlatformInfo = (params) => service.post('/system/platformInfo/updatePlatformInfo', params)
// 获取minio上传链接
export const getMinioUploadUrl = (params) => service.post('/system/platformInfo/getUploadUrl', params)
// 上传minio文件
export const uploadMinioFile = (url, params) => service.put(url, params)
// 获取平台版本更新信息（用于轮询检测）
export const getPlatformVersionInfo = () => service.post('/system/platformInfo/getPlatformVersionInfo')
