import service from '../index'
// import qs from 'querystringify'
// 获取研究队列列表数据
export const getResearchList = (params) => service.post('/queue/researchQueue/getResearchQueuePage', params)
// 医院
// export const getResearchHospital = () => service.post('/system/agency/getAgencyList')
// 病种
export const getResearchDisease = () => service.post('/system/disease/getDiseaseList')
// 创建人
export const getResearchCreat = () => service.post('/system/user/getUserList')
// 新建队列
export const addNewResearch = (params) => service.post('/queue/researchQueue/saveResearchQueue', params)
// 删除队列
export const removeResearch = (params) => service.post('/queue/researchQueue/delResearchQueue', params)
// 编辑队列名称
export const editResearchName = (params) => service.post('/queue/researchQueue/updateResearchQueue', params)
// 纳入标准
export const getInclusionCriteria = (params) => service.post('/queue/queueCondition/getQueueCondition', params)
// 编辑纳入标准
export const edirInclusionCriteria = (params) => service.post('/queue/queueCondition/updateQueueCondition', params)
// 指标列表table数据
export const getindicatorListData = (params) => service.post('/home/queueIndex/getQueueIndexPage', params)
// 指标列表数据
// export const getindexListData = (params) => service.post('/queue/index/getIndexList', params)
// 新增指标
export const addIndexData = (params) => service.post('/queue/index/saveIndexForQueue', params)
// 删除指标
export const deleteIndexData = (params) => service.post('/home/queueIndex/delQueueIndex', params)
// 保存左侧tree指标
export const saveIndexData = (params) => service.post('/home/queueIndex/saveQueueIndexList', params)
// 保存左侧tree默认选中的指标
// export const getChoiceIndexData = (params) => service.post('/home/queueIndex/getQueueIndexDefault', params)
// 点击复选框移除左侧tree默认选中的指标
export const delChoiceIndexData = (params) => service.post('/home/queueIndex/delQueueIndexList', params)
// 删除左侧tree自定义指标
// export const removeIndexData = (params) => service.post('/queue/index/delIndex', params)
export const removeIndexData = (params) => service.post('/home/queueIndex/delQueueIndexOwn', params)
// 参与人员列表数据
export const getParticipantsData = (params) => service.post('/queue/queueUser/getQueueIndexPage', params)
// 删除参与人员列表数据
export const deleteParticipantsData = (params) => service.post('/queue/queueUser/delQueueUser', params)
// 新增参与人员列表数据
export const unshiftParticipantsData = (params) => service.post('/system/user/getUnshiftUserPage', params)
// 新增参与人员
export const addParticipantsData = (params) => service.post('/queue/queueUser/saveQueueUserList', params)

// 第二版本
// 获取指标的分类列表
export const getQueueIndexGroupList = (params) => service.post('/queue/queueIndexGroup/getQueueIndexGroupList', params)
// 新增指标分类
export const addQueueIndexGroupList = (params) => service.post('/queue/queueIndexGroup/newQueueIndexGroup', params)
// 编辑指标分类
export const updateQueueIndexGroupList = (params) => service.post('/queue/queueIndexGroup/updateQueueIndexGroup', params)
// 编辑指标分类
export const deleteQueueIndexGroupList = (params) => service.post('/queue/queueIndexGroup/deleteWithChildren', params)
// 获取队列指标分类下的指标table
export const getGroupListData = (params) => service.post('/queue/queueIndexGroup/getIndexPage', params)
// 删除某个分类下的某个指标
export const deleteGroupListData = (params) => service.post('/queue/queueIndexGroup/deleteIndexFromQueueIndexGroup', params)
// 获取某个分类下可以添加的有层级的指标
export const getIndexGroup = (params) => service.post('/queue/queueIndexGroup/getOptionalIndexForQueueIndexGroup', params)
// 给某个分类下添加指标table
export const addIndexGroup = (params) => service.post('/queue/queueIndexGroup/addIndexListToQueueIndexGroup', params)
