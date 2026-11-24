import service from './index'
// 研究方案智能体下载
export const downloadResearchScheme = (params) => service.post('/agent/agentResearchProposal/download', params, { responseType: 'blob' })

// 生成研究方案
export const generateResearchScheme = (params) => service.post('/agent/agentResearchProposal/insert', params)

// 轮询研究方案是否生成完毕
export const getChapterGenerateDetail = (params) => service.post('/agent/agentResearchProposalChapter/getChapterGenerateDetail', params)
// 生成章节
export const generateChapter = (params) => service.post('/agent/agentResearchProposalChapter/insert', params)

// 批量生成章节
export const generateChapters = (params) => service.post('/agent/agentResearchProposalChapter/insertList', params)

// 获取完整章节与未完成章节
export const getResearchSchemeStatus = (params) => service.post('/agent/agentResearchProposalChapter/getCompleteChapterAndUnCompleteChapterNum', params)

// 保存研究方案
export const saveResearchScheme = (params) => service.post('/agent/agentResearchProposalChapter/update', params)

// 生成综述大纲
export const getReviewOutline = (params) => service.post('/agent/literatureReview/generateAiReviewOutline', params)
// AI生成综述大纲结果查询（轮询）
export const getReviewOutlineResult = (params) => service.post('/agent/literatureReview/getAiReviewOutlineResult', params)
// 自定义综述大纲生成综述
export const generateCustomReview = (params) => service.post('/agent/literatureReview/customReviewOutlineGenerateReview', params)

// 更新综述大纲
export const updateReviewOutline = (params) => service.post('/agent/literatureReview/updateReviewOutline', params)
// 生成综述
export const getReview = (params) => service.post('/agent/literatureReview/generateReview', params)
// 获取参考文献
export const getReference = (params) => service.post('/agent/literatureReview/getReferencesText', params)
// 获取综述回复
export const getReviewReply = (params) => service.post('/agent/literatureReview/getReply', params, { timeout: 4 * 60 * 1000 })
// AI修改综述
export const updateReview = (params) => service.post('/agent/literatureReview/updateReview', params)
// 更新综述
export const updateReviewText = (params) => service.post('/agent/literatureReview/updateReview', params)
// 获取历史
export const getHistory = (params) => service.post('/agent/literatureReview/getHistory', params)
// 下载综述
export const downloadReview = (params) => service.post('/agent/literatureReview/download', params, { responseType: 'blob' })

// 生成研究选题
export const createResearchTopic = params => service.post('/agent/researchSelect/generateResearchSelect', params)

// 获取研究选题结果
export const getCreateResearchTopicRes = params => service.post('/agent/researchSelect/getTopicRecommendResult', params)

// 获取研究选题结果数据分析
export const getResearchTopicData = params => service.post('/agent/researchSelect/getStatistics', params)

// 补充关键词重新生成
export const reGenerate = params => service.post('/agent/researchSelect/reGenerateResearchSelect', params)
// 下载研究选题方案
export const downLoadFile = params => service.post('/agent/researchSelect/download', params, { responseType: 'blob' })

// 获取研究选题历史
export const getResearchTopicDetail = params => service.post('/agent/researchSelect/getHistory', params)

// 获取质量校验结果
export const getQualityCheckResult = params => service.post('/agent/agentResearchProposalChapter/getTotalScore', params)

// 获取单个章节分数和错误详情
export const getChapterScore = (params, config = {}) => service.post('/agent/agentResearchProposalChapter/generateScore', params, config)

// 单章节重新生成
export const reGenerateSingleChapter = params => service.post('/agent/researchSelect/generateResearchSelectChapter', params)
// 自定义综述大纲生成综述-失败重试
export const retryCustomReview = params => service.post('/agent/literatureReview/customReviewOutlineGenerateReviewRetry', params)
// 获取参考文献
export const getReferenceList = params => service.post('/agent/researchSelect/getReferences', params)

// 意见反馈
export const feedback = params => service.post('/agent/agentFeedback/insert', params)
