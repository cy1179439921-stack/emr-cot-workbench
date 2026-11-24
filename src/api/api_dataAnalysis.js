import service from './index'

// 获取数据集详情
// export const getDatasetDetail = (params) => service.post('/analysis/dataSetIndex/pageList', params)
export const getDatasetDetail = (params) => service.post('/analysis/dataSet/getDataSetContentPageList', params)
// 获取数据集列表
export const getDatasetList = (params) => service.post('/analysis/dataSet/getList', params)
// 删除数据集
export const deleteDataset = (params) => service.post('/analysis/dataSet/del', params)
// 数据库-移动文件夹
export const moveFolderDb = (params) => service.post('/analysis/dataSet/update', params)

// 获取工程库列表
export const getEngineerLibraryList = (params) => service.post('/analysis/dataProject/getList', params)
// 获取平台数据列表
export const getPlatformDataSource = (params) => service.post('/queue/researchQueue/show', params)
// 创建数据集
export const createDataSet = (params) => service.post('/analysis/dataSet/createFolderOrDataSet', params)
// 创建三方数据集
export const createTreeDataSet = (params) => service.post('/analysis/dataSet/createDataSetByThirdJson', params)
// 数据集编辑
export const editDataSet = params => service.post('/analysis/dataSet/update', params)

// 创建工程文件夹
export const createProjectFolder = params => service.post('/analysis/dataProject/insert', params)
// 工程库编辑
export const editProject = params => service.post('/analysis/dataProject/update', params)
export const edit = params => service.post('/analysis/dataSet/update')
// 工程库-新增工程
export const createEngineerLibrary = (params) => service.post('/analysis/dataProject/insert', params)
// 工程库-删除工程
export const deleteEngineerLibrary = (params) => service.post('/analysis/dataProject/del', params)
// 工程库-移动文件夹
export const moveFolder = (params) => service.post('/analysis/dataProject/update', params)
// 数据集导出
export const exportDataset = (params) => service.post('/analysis/dataSet/dataSetExport', params, { responseType: 'blob' })
// 工程查看
export const getEngineerLibraryDetail = (params) => service.post('/analysis/dataProjectIndex/pageList', params)
// 查看数据集详情
export const getDatasetDetailIndex = (params) => service.post('/analysis/dataSet/info', params)
// 工程库-数据查看导出
export const exportEngineerLibrary = (params) => service.post('/analysis/dataProjectIndex/export', params, { responseType: 'blob' })
// 数据集另存为
export const saveAsDataset = (params) => service.post('/analysis/dataProject/convertDataSet', params)
// 工程-查看当前工程
export const getProjectDetail = (params) => service.post('/analysis/dataProject/info', params)
// 获取所有变量
export const getAllVariables = params => service.post('/analysis/dataOperate/getColList', params)
// 空值处理点击获取右侧变量空值信息
export const getNullValueInfo = (params) => service.post('/analysis/dataOrganize/getFieldNullValueInfo', params)
// 空值处理点击保存空值信息
export const saveNullValueInfo = (params) => service.post('/analysis/dataOrganize/nullValueOperate', params)
// 异常值处理点击保存信息
export const saveAbnormalValueInfo = (params) => service.post('/analysis/dataOrganize/outlierHandling', params)
// 请求分析
export const getAnalysisResult = (params, path) => service.post(`/analysis/${path}`, params)
// 获取操作id
export const getOperateId = params => service.post('/analysis/dataOperate/getDataOperateId', params)
// 操作日志列表
export const getOperationLogList = (params) => service.post('/analysis/dataOperate/getList', params)
// 标记为核心节点
export const signNode = (params) => service.post('/analysis/dataOperate/update', params)
// 获取节点详情
export const getNodeDetail = (params) => service.post('/analysis/dataOperate/info', params)
// 获取工程起点信息
export const getProjectStartInfo = (params) => service.post('/analysis/dataOperate/info', params)
// 获取节点详情在编辑
export const getNodeDetailEdit = (params) => service.post('/analysis/descriptiveAnalysis/getCode', params)
// 单样本T检验-获取样本均值
export const getAverageValue = (params) => service.post('/analysis/descriptiveAnalysis/getAverageValue', params)
// 拟合优度卡方检验-当前比例
export const getGoodnessPercentage = (params) => service.post('/analysis/descriptiveAnalysis/getProportion', params)
// 二分变量检验
export const checkBinaryVariable = (params) => service.post('/analysis/descriptiveAnalysis/checkBinaryVariable', params)
// 二分变量批量检验
export const batchCheckBinaryVariable = (params) => service.post('/analysis/descriptiveAnalysis/batchCheckBinaryVariable', params)
// 数据整理-数据编辑方法列表
export const getDataEditList = (params) => service.post('/analysis/dataOrganize/dataEdit', params)
// 数据整理-批量覆盖保存
export const batchSaveEdit = (params) => service.post('/analysis/dataOrganize/dataEditBatch', params)
// 获取图表视图数据
export const getChartData = (params) => service.post('/analysis/dataOrganize/createDataFilter', params)
// 数据可视化
export const getDataVisible = (params) => service.post('/analysis/dataOrganize/dataVisible', params)
// 数据筛选
export const saveDataFilter = (params) => service.post('/analysis/dataOrganize/dataFilter', params)
// 对照组切分
export const groupSplitN = (params) => service.post('/analysis/dataOrganize/controlGroupSegmentation', params)

// 生成变量获取方法列表
export const getCreateVariableMethod = (params) => service.post('/analysis/dataOrganize/getCreateVariableMethod', params)

// 添加时间依赖协变量 下拉列表
export const getTimeCovariantOptions = (params) => service.post('/analysis/descriptiveAnalysis/checkCoxAssumptions', params)

// 获取分组变量区间
export const getVariableInterval = (params) => service.post('/analysis/dataOrganize/getCreateVariableMaxAndMinValue', params)

// 获取哑变量下拉
export const getDumbVariables = (params) => service.post('/analysis/dataOrganize/getCreateVariableDummyVariable', params)

// 生成变量
export const postGeneratingVariable = (params) => service.post('/analysis/dataOrganize/createVariable', params)

// 数据整理操作日志
export const getDataSortingParams = (params) => service.post('/analysis/dataOrganize/history', params)

// 异常值处理-获取异常值信息
export const getAbnormalValueInfo = (params) => service.post('/analysis/dataOrganize/preOutlierHandling', params)
// 异常值处理,获取平均值
export const getAverageValueAbnormal = (params) => service.post('/analysis/dataOrganize/getOutlierHandlingAverageValue', params)
// 控制处理操作日志获取
export const getNullValueNumber = (params) => service.post('/analysis/dataOrganize/getOldFieldNullValueInfo', params)

// 异常值处理获取散点图
export const getOutlierValueLog = (params) => service.post('/analysis/dataOrganize/batchPreOutlierHandling', params)

// 比例抽样
export const proportionalSamplingFn = params => service.post('/analysis/dataOrganize/ratioSample', params)

// 单变量调整
export const singleVariableAdjustmentFn = params => service.post('/analysis/dataOrganize/univariateAdjustment', params)

// 变量变换
export const variableTransformFn = params => service.post('/analysis/dataOrganize/dataFieldConvertBatch', params)
// 数据标准化
export const dataStandardizationFn = params => service.post('/analysis/dataOrganize/dataStandard', params)
// 数据变换
export const dataTransformFn = params => service.post('/analysis/dataOrganize/dataConvert', params)

// 滞后性调整训练接口
export const lagAdjustTrainFn = params => service.post('/analysis/dataOrganize/lagAdjustTrain', params)

// 滞后调整
export const lagAdjustFn = params => service.post('/analysis/dataOrganize/lagAdjust', params)

// 减残导入数据集，获取纳入指标病例数量
export const getIncludeCaseCount = (params) => service.post('/analysis/dataSet/getJcwMedicalNumber', params)

// 获取AI智能分析结果
export const getAIResult = (params) => service.post('/analysis/descriptiveAnalysis/getAiAnalysis', params)
