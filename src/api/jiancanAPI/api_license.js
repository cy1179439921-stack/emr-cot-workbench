import service from '../index'
// 获取是否需要证书校验信息
export const getLicenseFilterInfo = (params) => service.post('/system/license/getLicenseFilterInfo', params)
// 上传证书
export const uploadLicense = (params) => service.post('/system/license/uploadLicense', params)
