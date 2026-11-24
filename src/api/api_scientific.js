import service from './index'
// 新增项目立项
export const saveProject = (params) => service.post('/scientific/project/insert', params)
// 查看项目立项详情
export const getProjectDetail = (params) => service.post('/scientific/project/detail', params)
// 修改项目立项
export const updateProject = (params) => service.post('/scientific/project/update', params)
// 删除项目立项
export const deleteProject = (path, params) => service.post(`/scientific/${path}/del`, params)
// 项目立项列表
export const getProjectList = (path, params) => service.post(`/scientific/${path}/pageList`, params)
// 项目下拉列表
export const getProjectSelectList = (params) => service.post('/scientific/project/projectSelectList', params)
// 重新提交项目立项
export const reSubmitProject = (params) => service.post('/scientific/project/resubmit', params)
// 项目全景-项目立项
export const getProjectPanorama = (params) => service.post('/scientific/project/overview', params)
// 获取用户下拉选择列表
export const getUserSelectList = (params) => service.post('/system/user/getUserSelectList', params)
// 文件上传
export const uploadFiles = (params, businessType) => service.post(`/scientific/projectFile/upload/${businessType}`, params)
// 附件上传
export const uploadAttachmentFiles = (params) => service.post('/scientific/flowTaskHistoryFile/upload', params)
// 我的待办数据统计
export const tobeDoneStatistic = params => service.post('/scientific/flowTaskState/statistic')
// 我的待办列表查询
export const getTobeDoneList = params => service.post('/scientific/flowTaskHistory/pageList', params)
// 项目撤销
export const revokeProject = params => service.post('/scientific/flowTaskState/revoke', params)
// 审批
export const approveProject = params => service.post('/scientific/flowTaskState/audit', params)
// 新增项目研究
export const saveProjectResearch = (params) => service.post('/scientific/projectResearch/insert', params)
// 修改项目研究
export const updateProjectResearch = (params) => service.post('/scientific/projectResearch/update', params)
// 项目研究详情
export const getProjectResearchDetail = (params) => service.post('/scientific/projectResearch/detail', params)
// 新增项目变更
export const saveProjectChange = (params) => service.post('/scientific/projectChange/insert', params)
// 修改项目变更
export const updateProjectChange = (params) => service.post('/scientific/projectChange/update', params)
// 项目变更详情
export const getProjectChangeDetail = (params) => service.post('/scientific/projectChange/detail', params)
// 变更-修改详情
export const getUpdateChangeDetail = (params) => service.post('/scientific/projectChange/getNewProjectChangeDetail', params)
// 新增项目中检
export const saveProjectMiddle = (params) => service.post('/scientific/projectCheck/saveOrUpdate', params)
// 获取中检详情
export const getProjectMiddleDetail = (params) => service.post('/scientific/projectCheck/info', params)
// 获取项目全景
export const getProjectPanoramaList = (params) => service.post('/scientific/projectOverview/overviewLabel', params)
// 新增项目结题
export const saveProjectConclusion = (params) => service.post('/scientific/projectConclusion/saveOrSubmit', params)
// 项目结题详情
export const getProjectConclusionDetail = (params) => service.post('/scientific/projectConclusion/info', params)
// 项目全景-项目立项（多了研究附件）
export const getProjectInitialPanoramaDetail = (params) => service.post('/scientific/projectOverview/projInit', params)
// 项目全景-项目结题
export const getProjectConclusionPanorama = (params) => service.post('/scientific/projectOverview/projConclusion', params)
// 项目全景-项目中检
export const getProjectMiddlePanorama = (params) => service.post('/scientific/projectOverview/projCheck', params)
// 获取科研配置列表
export const getScientificConfigList = (params) => service.post('/scientific/flowBase/pageList', params)

// 根据医院id获取科室
export const getDepartmentByAgencyId = (params) => service.post('/system/department/getListByAgency', params)

// 验证是否存在同阶段流程
export const checkProcess = (params) => service.post('/scientific/flowBase/validateStage', params)

// 新增科研配置流程
export const addScientificConfig = (params) => service.post('/scientific/flowBase/insert', params)

// 修改科研配置流程
export const updateScientificConfig = (params) => service.post('/scientific/flowBase/update', params)

// 删除科研配置流程
export const deleteScientificConfig = (params) => service.post('/scientific/flowBase/del', params)

// 根据医院获取科室用户
export const getDepartmentUserByAgencyId = (params) => service.post('/system/department/getListByAgencyInCascade', params)
// 根据医院获取科室用户带权限
export const getDepartmentUserByAgencyIdWithAuth = (params) => service.post('/system/agency/getAgencyListInCascade/role', params)

// 项目研究全景详情
export const getProjectResearchPanoramaDetail = (params) => service.post('/scientific/projectOverview/projResearch', params)

// 项目变更全景详情
export const getProjectChangePanoramaDetail = (params) => service.post('/scientific/projectOverview/projChange', params)

// 论文全景详情
export const getPaperPanoramaDetail = (params) => service.post('/scientific/projectOverview/thesis', params)

// 著作全景详情
export const getWorkPanoramaDetail = (params) => service.post('/scientific/projectOverview/book', params)

// 专利全景详情
export const getPatentPanoramaDetail = (params) => service.post('/scientific/projectOverview/patent', params)

// 获奖全景详细
export const getAwardPanoramaDetail = (params) => service.post('/scientific/projectOverview/award', params)

// 新增论文
export const savePaper = (params) => service.post('/scientific/srmThesis/insert', params)
// 修改论文
export const updatePaper = (params) => service.post('/scientific/srmThesis/update', params)
// 查看论文详情
export const getPaperDetail = (params) => service.post('/scientific/srmThesis/info', params)

// 新增著作
export const saveWork = (params) => service.post('/scientific/srmBook/insert', params)
// 修改著作
export const updateWork = (params) => service.post('/scientific/srmBook/update', params)
// 查看著作详情
export const getWorkDetail = (params) => service.post('/scientific/srmBook/info', params)
// 新增专利\修改专利
export const savePatent = (params) => service.post('/scientific/srmPatent/saveOrUpdate', params)
// 查看专利详情
export const getPatentDetail = (params) => service.post('/scientific/srmPatent/info', params)
// 新增获奖\修改获奖
export const saveAward = (params) => service.post('/scientific/srmAward/saveOrUpdate', params)
// 查看获奖详情
export const getAwardDetail = (params) => service.post('/scientific/srmAward/info', params)

// 论文管理列表
export const getPaperList = (params) => service.post('/scientific/srmThesis/pageList', params)

// 删除论文
export const delPaper = (params) => service.post('/scientific/srmThesis/del', params)

// 著作管理列表
export const getBookList = (params) => service.post('/scientific/srmBook/pageList', params)

// 著作删除
export const delBook = params => service.post('/scientific/srmBook/del', params)

// 专利管理列表
export const getPatentList = (params) => service.post('/scientific/srmPatent/pageList', params)

// 专利删除
export const delPatent = (params) => service.post('/scientific/srmPatent/del', params)

// 获奖管理列表
export const getAwardList = (params) => service.post('/scientific/srmAward/pageList', params)

// 获奖删除
export const delAward = (params) => service.post('/scientific/srmAward/del', params)

