import service from './index'

// 根据病历ID获取完整JSON结构及翻译路径树
export const obtainCompleteJson = (params) => service.post('/verifyCotRecord/queryJsonTree', params)

// 加载待校对病历
export const loadPendingRecords = (params) => service.post('/verifyCotRecord/allocate', params)

// 查询当前登录用户校对中病历文件下所有的 loops 进度
export const getLoopList = (params) => service.post('/verifyCotRecord/currentLoops', params)

// 获取病历基本信息详情
export const getMedicalInfo = (params) => service.post('/verifyCotRecord/base/detail', params)

// 获取病历详情
export const getMedicalDetail = (params) => service.post('/verifyCotRecord/record/detail', params)

// 查询 COT 标注任务列表（标注页列表）
export const getCotTaskList = (params) => service.post('/verifyCotRecord/taskList', params)

// 专家任务分页列表（病历校对平台 / 专家端-任务管理）
export const getExpertTaskPage = (params) => service.post('/expert/task/page', params)

// 自动获取当前进行中任务的校对进度节点数据
export const getCurrentLoopData = (params) => service.post('/verifyCotRecord/queryCurrentNode', params)

// 记录开始校对
export const startVerification = (params) => service.post('/verifyCotRecord/start', params)

// 进入下一步
export const nextStep = (params) => service.post('/verifyCotRecord/nextStep', params)

// 暂存COT校对数据
export const saveCotData = (params) => service.post('/verifyCotRecord/stash', params)

// 提交病历
export const submitMedical = (params) => service.post('/verifyCotRecord/submit', params)

// 根据病历ID和Key路径查询对应的数据内容
export const queryDataByKey = (params) => service.post('/verifyCotRecord/queryJsonValue', params)

// 获取指定Loop下特定节点的数据
export const getLoopDataByKey = (params) => service.post('/verifyCotRecord/queryNode', params)

// ===================== 专家工作台 =====================
// 获取专家工作进度
export const getExpertProgress = (params) => service.post('/expert/task/workbench', params)

// 获取历史任务列表
export const getExpertHistoryTasks = (params) => service.post('/expert/settlement/page', params)

// ===================== 劳务签署 =====================
// 接口契约（getLaborSignStatus → /expert/contract/init-info 单接口返回完整合同信息）：
// - contractStatus: 'NOT_APPLIED' | 'PENDING' | 'EXPIRED' | 'INITIATED' | 'SIGNED' | 'REJECTED'
// - contractStatusDesc: 合同状态描述（顶部状态栏展示）
// - idCardFrontUrl / idCardBackUrl / idCardNo: 身份证信息
// - bankAccount: { accountName, bankNo, bankBranch, bankPhone }
// - esignSignUrl: 外部签署链接；rejectReason: 驳回原因
// 说明：原独立的 userInfo 接口已由本接口字段覆盖，不再单独调用。

// 获取劳务签署状态（页面加载 / 打开选项卡时调用，用于判断当前处于第几步）
export const getLaborSignStatus = (params) => service.post('/expert/contract/init-info', params)

// 提交/保存银行卡信息并初始化合同为待签署状态（资料填写步骤提交）
export const submitContractBankInfo = (params) => service.post('/expert/contract/submit-initiate', params)

// 驳回劳务协议
export const rejectLaborSign = (params) => service.post('/expert/contract/reject', params)

// ===================== 劳务结算 =====================
// 获取结算列表
export const getSettlementList = (params) => service.post('/expert/settlement/page', params)

// 申请结算
export const applySettlement = (params) => service.post('/cotSettlement/apply', params)

// 驳回结算（专家端，参数为结算单 id 与驳回原因）
export const expertRejectSettlement = (params) => service.post('/expert/settlement/reject', params)

// 获取结算单详情（弹窗加载时使用，参数为结算单 id）
export const getSettlementDetail = (params) => service.post('/expert/settlement/detail', params)

// 专家结算确认（弹窗内点击"确认"时使用，参数为结算单 id）
export const expertConfirmSettlement = (params) => service.post('/expert/settlement/confirm', params)

// 专家结算申请（弹窗内点击"确认"时使用，参数为结算单 id）
export const expertApplySettlement = (params) => service.post('/expert/settlement/apply', params)

// 获取视频地址
export const getVideoUrl = (params) => service.post('/common/config/annotation/video', params)
