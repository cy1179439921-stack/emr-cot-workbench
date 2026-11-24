// 多选的最大个数
export const MULTICOUNT = 10
// 分析方法汇总
export const analysisMethodList = [
  // {
  //   name: '描述性分析',
  //   id: 2,
  //   type: 2,
  //   icon: 'icon-miaoshuxingfenxi',
  //   component: '',
  //   children: [
  //     {
  //       name: '正态性检验',
  //       type: 2,
  //       component: 'normalityTest',
  //       path: 'descriptiveAnalysis/normalityTest',
  //       apiName: 'normality_test'
  //     },
  //     {
  //       name: '分布检验',
  //       type: 2,
  //       component: 'multipleDistributionTest',
  //       path: 'descriptiveAnalysis/distributionTest',
  //       apiName: 'anderson_test'
  //     }
  //   ]
  // },
  {
    name: '差异性分析',
    id: 3,
    type: 2,
    icon: 'icon-chayixingfenxi',
    component: '',
    children: [
      // {
      //   name: '单样本T检验',
      //   type: 2,
      //   component: 'tTestAnalysis',
      //   path: 'differenceAnalysis/oneSampleTest',
      //   apiName: 'one_sample_t_test'
      // },
      {
        name: '配对样本T检验',
        type: 2,
        component: 'tTestPairingAnalysis',
        path: 'differenceAnalysis/pairSampleTest',
        apiName: 'rel_sample_t_test'
      }
      // {
      //   name: '独立样本T检验',
      //   type: 2,
      //   component: 'tTestIndependentAnalysis',
      //   path: 'differenceAnalysis/independentSampleTest',
      //   apiName: 'two_sample_t_test'
      // },
      // {
      //   name: '单因素方差分析',
      //   type: 2,
      //   component: 'onewayAnova',
      //   path: 'differenceAnalysis/oneWayANOVA',
      //   apiName: 'one_f_way'
      // },
      // {
      //   name: '拟合优度卡方检验',
      //   type: 2,
      //   component: 'goodnessChisquareTest',
      //   path: 'differenceAnalysis/goodnessOfFitChiSquare',
      //   apiName: 'chisquare_test'
      // },
      // {
      //   name: '卡方检验',
      //   type: 2,
      //   component: 'chisquareTest',
      //   path: 'differenceAnalysis/chiSquareTest',
      //   apiName: 'base_chi2_contingency'
      // },
      // {
      //   name: '配对卡方检验',
      //   type: 2,
      //   component: 'pairedChisquareTest',
      //   path: 'differenceAnalysis/pairChiSquareTest',
      //   apiName: 'chi2_mcnemar'
      // },
      // {
      //   name: 'CMH分层卡方检验',
      //   type: 2,
      //   component: 'CMHstratifiedChisquareTest',
      //   path: 'differenceAnalysis/cmhChiSquareTest',
      //   apiName: 'strata_chi2'
      // },
      // {
      //   name: '趋势卡方检验',
      //   type: 2,
      //   component: 'trendChisquareTest',
      //   path: 'differenceAnalysis/trendChiSquareTest',
      //   apiName: 'trend_chi2'
      // },
      // {
      //   name: '独立样本Mann-Whitney U检验',
      //   type: 2,
      //   component: 'mannWhitneyUTest',
      //   path: 'differenceAnalysis/independentMannWhitneyTest',
      //   apiName: 'mann_u_test'
      // },
      // {
      //   name: '配对样本wilcoxon符号秩检验',
      //   type: 2,
      //   component: 'wilcoxonTest',
      //   path: 'differenceAnalysis/pairWilcoxonSignedRankTest',
      //   apiName: 'rel_wilcoxon_test'
      // },
      // {
      //   name: '独立样本Kruskal-Wallis检验',
      //   type: 2,
      //   component: 'independentKWTest',
      //   path: 'differenceAnalysis/independentKruskalWallisTest',
      //   apiName: 'kruskal_w_test'
      // },
      // {
      //   name: '独立样本Kolmogorov-Smirnow检验',
      //   type: 2,
      //   component: 'independentKSTest',
      //   path: 'differenceAnalysis/independentKSTest',
      //   apiName: 'ks_2samp_test'
      // },
      // {
      //   name: '多配对样本Friedman检验',
      //   type: 2,
      //   component: 'pairFriedmanTest',
      //   path: 'differenceAnalysis/multiPairFriedmanTest',
      //   apiName: 'rel_friedman_test'
      // },
      // {
      //   name: '单样本游程检验',
      //   type: 2,
      //   component: 'singleSampleTest',
      //   path: 'differenceAnalysis/oneSampleRunTest',
      //   apiName: 'one_samp_runstest'
      // },
      // {
      //   name: '独立样本游程检验',
      //   type: 2,
      //   component: 'doubleSampleTest',
      //   path: 'differenceAnalysis/independentRunTest',
      //   apiName: 'wald_wolf_test'
      // },
      // {
      //   name: '事后多重比较',
      //   type: 2,
      //   component: 'postMultipleComparison',
      //   path: 'differenceAnalysis/postHocTest',
      //   apiName: 'multi_comparison'
      // },
      // {
      //   name: '多因素方差分析',
      //   type: 2,
      //   component: 'multipleFactorAnova',
      //   path: 'differenceAnalysis/multiFactorANOVA',
      //   apiName: ''
      // },
      // {
      //   name: '协方差分析',
      //   type: 2,
      //   component: 'covarianceAnalysis',
      //   path: 'differenceAnalysis/ANCOVA',
      //   apiName: ''
      // },
      // {
      //   name: '四格表卡方检验',
      //   type: 2,
      //   component: 'fourGridChiSquareTest',
      //   path: 'differenceAnalysis/contingencyTableChiSquareTest',
      //   apiName: ''
      // },
      // {
      //   name: '配对四格表卡方检验',
      //   type: 2,
      //   component: 'pairedFourGridChiSquareTest',
      //   path: 'differenceAnalysis/pairContingencyTableChiSquareTest',
      //   apiName: ''
      // }
    ]
  },
  // {
  //   name: '相关性分析',
  //   id: 4,
  //   type: 2,
  //   icon: 'icon-xiangguanxingfenxi',
  //   component: '',
  //   children: [
  //     {
  //       name: '皮尔逊相关性分析',
  //       type: 2,
  //       component: 'pearsonAnalysis',
  //       path: 'relevanceAnalysis/pearsonCorrelation',
  //       apiName: 'pearsonr_coefficient'
  //     },
  //     {
  //       name: '斯皮尔曼相关性分析',
  //       type: 2,
  //       component: 'pearsonAnalysis',
  //       path: 'relevanceAnalysis/spearmanCorrelation',
  //       apiName: 'spearmanr_coefficient'
  //     },
  //     {
  //       name: '肯德尔tau-b相关性分析',
  //       type: 2,
  //       component: 'pearsonAnalysis',
  //       path: 'relevanceAnalysis/kendallTauB',
  //       apiName: 'kendalltau_coefficient'
  //     },
  //     {
  //       name: "Cochran's Q检验",
  //       type: 2,
  //       component: 'cochransQ',
  //       path: 'relevanceAnalysis/cochransQTest',
  //       apiName: 'cochran_q_test'
  //     },
  //     {
  //       name: 'Kappa一致性检验',
  //       type: 2,
  //       component: 'kappaTest',
  //       path: 'relevanceAnalysis/kappaConsistencyTest',
  //       apiName: 'kappa_test'
  //     },
  //     {
  //       name: 'Kendall一致性检验',
  //       type: 2,
  //       component: 'kendallTest',
  //       path: 'relevanceAnalysis/kendallConsistencyTest',
  //       apiName: 'kendall_test'
  //     }
  //   ]
  // },
  {
    name: '回归分析',
    id: 5,
    type: 2,
    icon: 'icon-huiguifenxi',
    component: '',
    children: [
      // {
      //   name: '一元线性回归模型（最小二乘法）',
      //   type: 2,
      //   component: 'oneVariableLinearRegression',
      //   path: 'regressionAnalysis/simpleLinearRegression',
      //   apiName: 'line_regression'
      // },
      // {
      //   name: '多元线性回归模型（最小二乘法）',
      //   type: 2,
      //   component: 'multipleLinearRegression',
      //   path: 'regressionAnalysis/multipleLinearRegression',
      //   apiName: 'multiple_linear_regression'
      // },
      {
        name: 'logistic回归',
        type: 2,
        component: 'logisticRegression',
        path: 'regressionAnalysis/logisticRegression',
        apiName: 'logistic_regression_s'
      }
      //     {
      //       name: 'Poisson回归',
      //       type: 2,
      //       component: 'poissonRegression',
      //       path: 'regressionAnalysis/poissonRegression',
      //       apiName: 'poisson_regression'
      //     },
      //     {
      //       name: '条件logistics回归',
      //       type: 2,
      //       component: 'conditionalLogisticsRegression',
      //       path: 'regressionAnalysis/conditionalLogisticRegression',
      //       apiName: 'conditional_model'
      //     },
      //     {
      //       name: '无序多分类logistic回归',
      //       type: 2,
      //       component: 'unorderedLogisticsRegression',
      //       path: 'regressionAnalysis/multinomialLogisticRegression',
      //       apiName: 'mn_logit_model'
      //     },
      //     {
      //       name: '有序logistics回归',
      //       type: 2,
      //       component: 'orderlyLogisticsRegression',
      //       path: 'regressionAnalysis/ordinalLogisticRegression',
      //       apiName: 'order_logit_model'
      //     },
      //     {
      //       name: '分层回归',
      //       type: 2,
      //       component: 'hierarchicalRegression',
      //       path: 'regressionAnalysis/hierarchicalRegression',
      //       apiName: 'poisson_regression'
      //     },
      //     {
      //       name: 'LASSO回归',
      //       type: 2,
      //       component: 'lassoRegression',
      //       path: 'regressionAnalysis/lassoRegression',
      //       apiName: 'poisson_regression'
      //     }
      //   ]
      // },
      // {
      //   name: '生存分析',
      //   id: 6,
      //   type: 2,
      //   icon: 'icon-shengcunfenxi',
      //   component: '',
      //   children: [
      //     {
      //       name: 'K-M法生存分析',
      //       type: 2,
      //       component: 'survivalAnalysis',
      //       path: 'survivalAnalysis/kaplanMeierSurvivalAnalysis',
      //       apiName: 'survival_time'
      //     },
      //     {
      //       name: 'Cox回归模型',
      //       type: 2,
      //       component: 'proportionalRiskCOXRegression',
      //       path: 'survivalAnalysis/coxRegression',
      //       apiName: 'proportional_hazards'
      //     }
      //   ]
      // },
      // {
      //   name: '时间序列模型',
      //   id: 8,
      //   type: 2,
      //   icon: 'icon-shijianxuliemoxing',
      //   component: '',
      //   children: [
      //     {
      //       name: 'ARIMA模型',
      //       type: 2,
      //       component: 'ARIMAModel',
      //       path: 'timeSeriesModel/arimaModel',
      //       apiName: 'arima_model'
      //     },
      //     {
      //       name: 'SARIMA模型',
      //       type: 2,
      //       component: 'SARIMAModel',
      //       path: 'timeSeriesModel/sarimaModel',
      //       apiName: 'sarima_model'
      //     },
      //     {
      //       name: '分布滞后非线性模型',
      //       type: 2,
      //       component: 'distributedHysteresisNonlinearModel',
      //       path: 'timeSeriesModel/distributedLagNonlinearModel',
      //       apiName: 'dlnm_model'
      //     }
    ]
  }
  // {
  //   name: '空间分析',
  //   id: 9,
  //   type: 2,
  //   icon: 'icon-kongjianfenxi',
  //   component: '',
  //   children: [
  //     {
  //       name: '局部空间自相关分析',
  //       type: 2,
  //       component: 'localSpatialAutocorrelation',
  //       path: 'spatialAnalysis/localSpatialAutocorrelation',
  //       apiName: 'local_spatial_auto_correlation'
  //     },
  //     {
  //       name: '全局空间自相关分析',
  //       type: 2,
  //       component: 'globalSpatialAutocorrelation',
  //       path: 'spatialAnalysis/globalSpatialAutocorrelation',
  //       apiName: 'global_spatial_auto_correlation'
  //     }
  //   ]
  // },
  // {
  //   name: '传统机器学习',
  //   id: 10,
  //   type: 2,
  //   icon: 'icon-chuantongjiqixuexi',
  //   component: '',
  //   children: [
  //     {
  //       name: '决策树分类模型',
  //       type: 2,
  //       component: 'decisionTree',
  //       path: 'traditionalMachineLearning/decisionTreeClassification',
  //       apiName: 'decision_tree'
  //     },
  //     {
  //       name: '随机森林分类模型',
  //       type: 2,
  //       component: 'randomForest',
  //       path: 'traditionalMachineLearning/randomForestClassification',
  //       apiName: 'random_forest'
  //     },
  //     {
  //       name: 'XGBoost分类模型',
  //       type: 2,
  //       component: 'XGBoost',
  //       path: 'traditionalMachineLearning/xgboostClassification',
  //       apiName: 'xgb_classifier'
  //     },
  //     {
  //       name: '支持向量机二分类模型',
  //       type: 2,
  //       component: 'supportVectorMachine',
  //       path: 'traditionalMachineLearning/svmBinaryClassification',
  //       apiName: 'svm_classifier'
  //     },
  //     {
  //       name: '正则化逻辑回归二分类模型',
  //       type: 2,
  //       component: 'regularizedLogisticRegression',
  //       path: 'traditionalMachineLearning/regularizedLogisticRegression',
  //       apiName: 'l2_logit_regression'
  //     },
  //     {
  //       name: 'KNN二分类模型',
  //       type: 2,
  //       component: 'KNN',
  //       path: 'traditionalMachineLearning/knnBinaryClassification',
  //       apiName: 'knn_classifier'
  //     },
  //     {
  //       name: 'K均值聚类',
  //       type: 2,
  //       component: 'kMeansClustering',
  //       path: 'traditionalMachineLearning/kMeansClustering',
  //       apiName: 'kmeans_method'
  //     }
  //   ]
  // },
  // {
  //   name: '人工神经网络',
  //   id: 11,
  //   type: 2,
  //   icon: 'icon-rengongshenjingwangluo',
  //   component: '',
  //   children: [
  //     {
  //       name: '多层感知机分类模型',
  //       component: 'multilayerPerceptron',
  //       path: 'artificialNeuralNetwork/mlpClassification',
  //       apiName: 'mlp_func'
  //     },
  //     {
  //       name: '前馈神经网络分类模型',
  //       type: 2,
  //       component: 'feedforwardNeuralNetwork',
  //       path: 'artificialNeuralNetwork/feedforwardNNClassification',
  //       apiName: 'fnn_func'
  //     },
  //     {
  //       name: '卷积神经网络二分类模型',
  //       type: 2,
  //       component: 'convolutionalNeuralNetwork',
  //       path: 'artificialNeuralNetwork/cnnBinaryClassification',
  //       apiName: 'cnn_method'
  //     },
  //     {
  //       name: '循环神经网络二分类模型',
  //       type: 2,
  //       component: 'recurrentNeuralNetwork',
  //       path: 'artificialNeuralNetwork/rnnBinaryClassification',
  //       apiName: 'rnn_method'
  //     }
  //   ]
  // }
]

