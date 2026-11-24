// 工程库table的列配置
export const engineering_columns = [
  {
    label: '工程/文件夹名',
    value: 'name',
    minWidth: 160
  },
  {
    label: '创建时间',
    value: 'createTime',
    sortable: true,
    minWidth: 120
  },
  {
    label: '选取数据集',
    value: 'dataSetName',
    minWidth: 120
  },
  {
    label: '最近节点',
    value: 'node',
    minWidth: 120
  },
  {
    label: '最近修改时间',
    value: 'operatorTime',
    minWidth: 120
  },
  {
    label: '描述',
    value: 'describe',
    minWidth: 160
  }
]
// 数据集库table的列配置
export const dataset_columns = [
  {
    label: '数据集名/文件夹名',
    value: 'name',
    minWidth: 150
  },
  {
    label: '创建时间',
    value: 'createTime',
    sortable: true,
    minWidth: 100
  },
  {
    label: '数据集大小',
    value: 'fileSizeStr',
    minWidth: 100
  },
  {
    label: '数据集来源',
    value: 'dataSourceName',
    minWidth: 100
  },
  {
    label: '数据量',
    value: 'totalRowNum',
    minWidth: 100
  },
  {
    label: '变量数',
    value: 'totalColNum',
    minWidth: 100
  },
  {
    label: '描述',
    value: 'describe',
    minWidth: 150
  }
]
// 多选的最大个数
export const MULTICOUNT = 10
// 分析方法汇总
export const analysisMethodList = [
  {
    name: '数据整理',
    id: 1,
    type: 1,
    icon: 'icon-shujuzhengli',
    children: [
      {
        name: '数据查看',
        component: 'dataView',
        type: 1,
        explain: ''
      },
      {
        name: '数据可视化',
        explain:
          '数据可视化功能为当前工程的各个变量提供了丰富的基于数理统计的数据查看图和表信息等，一方面帮助用户更好的快速查看到当前变量的特征，另一方面为用户提供了同类型变量和不同类型变量的聚合查看方式，帮助用户更方便的初步比较变量差异。',
        type: 1,
        component: 'dataVisualizeN'
      },
      {
        name: '数据编辑',
        explain:
          '数据编辑功能为用户提供了定量变量的原数据类型的修改和定性变量的编码值/顺序值以及原指标类别的修改，此外还提供了对于变量名的修改。',
        type: 1,
        component: 'dataEditResultN'
      },
      {
        name: '空值处理',
        explain: '空值处理功能对于简单的数据删除空值数据（NaN）提供了四种基础的数理统计空值填补和一种删除操作。',
        type: 1,
        component: 'nullValueHandleResultN'
      },
      {
        name: '异常值处理',
        explain:
          '异常值处理功能对于那些在数据集中存在的不合理的值进行处理，需要注意的是，不合理的值是偏离正常范围的值，不是错误值。该功能提供了三种主流的异常值处理方法，方便用户精确快捷的对异常值进行填充和删除。',
        type: 1,
        component: 'outliersHandleResultN'
      },
      {
        name: '生成变量',
        explain:
          '生成变量功能提供了业界主流的生成方法帮助用户在变量不符合下一步分析要求的情况下，通过统计学手段来调整数据，并且可以覆盖或直接生成新的变量，方便下一步分析使用。',
        type: 1,
        component: 'createNewVariableResultN'
      },
      {
        name: '对照组切分',
        explain:
          '对照组切分功能在生成变量中，但由于结合医学领域使用对照组频繁，且手动分组效果不理想的劣势，故推出该自动对照组切分功能。帮助用户快速且符合统计学随机性，来切分对照组。',
        type: 1,
        component: 'groupSplitN'
      },
      {
        name: '数据筛选',
        explain:
          '数据筛选器可以用于创建数据的子集，以便在特定条件下进行分析。例如，可以根据某些特定的属性或标准筛选数据，然后对这些子集进行独立的分析。这有助于针对感兴趣的特定子群体进行深入分析，从而获得更详细和准确的结论。由于该功能会修改当前数据集从而创建子数据集，如使用后想要返回子数据集之前的数据集，可以使用“全景脉络”和“工程日志”中的跳转功能。',
        type: 1,
        component: 'dataFilterN'
      },
      {
        name: '数据变换',
        explain: '数据变换是将数据准换成更适合数据分析的形式。其中Box-Cox变换的目的是为了让数据满足线性模型的基本假定。而小波变换和傅里叶变换能有效地提取相关的数据进行：小波变换可以同时提取时域信息和频域信息，而傅里叶变换只能提取频域信息。傅里叶逆变换与傅里叶变换相对应，其是将经过傅里叶变换后得到的频域函数还原回原来的时域。Box-Cox逆变换是Box-Cox变换的逆向操作，用于将经过Box-Cox变换后的数据还原回原始的数据形式。',
        type: 1,
        component: 'dataConversionResultN'
      },
      {
        name: '变量变换',
        explain: '变量变换是一种对原始变量进行特定数学转换的操作，旨在满足统计分析的不同需求、改善数据特征或更适配相应的统计模型。',
        type: 1,
        component: 'variableConversion'
      },
      {
        name: '数据标准化',
        explain: '数据标准化包括去量纲化和一致化。去量纲化是指不同指标之间由于量纲不同以致于其不具可比性，故首先需将指标进行无量纲化，消除量纲影响后再进行接下来的分析。一致性是指将指标作用方向一致化。',
        type: 1,
        component: 'dataStandardization'
      },
      // {
      //   name: '比例抽样',
      //   explain: '比例抽样是基于总体中不同类别或层次所占的比例结构，从总体中抽取样本的一种抽样方式。其核心思想是要确保所抽取的样本在结构上与总体的相应结构保持一致，使得样本能够较好地代表总体的特征。',
      //   // explain: `分层抽样介绍：分层抽样是一种抽样方法，用于从总体中选择样本，其中总体根据某些重要特征（称为层）被分成若干个子群体。
      //   // 整体抽样介绍：整体抽样，又称为全面抽样或全群抽样，是一种抽样方法，其中研究人员选择了总体中的每一个个体作为样本，以便全面地了解总体的特征和性质。与其他抽样方法不同，整体抽样不涉及从总体中选择部分个体作为样本，而是选择了整个总体作为样本，因此也被称为“普查”或“普查抽样”。
      //   // 多阶段抽样介绍：多阶段抽样是一种复杂的抽样方法，通常用于大规模调查或抽样调查中。在多阶段抽样中，总体被划分为多个阶段或层次，然后在每个阶段中进行抽样。通常，第一阶段是从总体中选择一些较大的群体（如地区、社区或群组），然后在第二阶段从所选的群体中选择一些更小的群体，最终在最后一个阶段，从最小的群体中选择个体作为样本。`,
      //   type: 1,
      //   component: 'proportionalSampling'
      // },
      // {
      //   name: '数据合并、数据拆分、取子集',
      //   explain: '数据合并是将两个或多个数据集按照某种共同的标识符或键值连接起来形成一个新的数据集的过程，使得不同数据源的信息可以被整合和分析。数据拆分则是将一个数据集按照某种条件或标准分解成多个较小的数据集，以便于分析或处理。取子集是从一个大的数据集中选择满足特定条件或需求的数据行或数据列，以构建一个新的数据集。这些操作都是数据处理中常用的方法，能够帮助我们更好地管理和利用数据，提高数据分析的效率和准确性。',
      //   type: 1,
      //   component: 'mergeSplitSubsetData'
      // },
      {
        name: '比例抽样',
        explain: '比例抽样是基于总体中不同类别或层次所占的比例结构，从总体中抽取样本的一种抽样方式。其核心思想是要确保所抽取的样本在结构上与总体的相应结构保持一致，使得样本能够较好地代表总体的特征。',
        // explain: `分层抽样介绍：分层抽样是一种抽样方法，用于从总体中选择样本，其中总体根据某些重要特征（称为层）被分成若干个子群体。
        // 整体抽样介绍：整体抽样，又称为全面抽样或全群抽样，是一种抽样方法，其中研究人员选择了总体中的每一个个体作为样本，以便全面地了解总体的特征和性质。与其他抽样方法不同，整体抽样不涉及从总体中选择部分个体作为样本，而是选择了整个总体作为样本，因此也被称为“普查”或“普查抽样”。
        // 多阶段抽样介绍：多阶段抽样是一种复杂的抽样方法，通常用于大规模调查或抽样调查中。在多阶段抽样中，总体被划分为多个阶段或层次，然后在每个阶段中进行抽样。通常，第一阶段是从总体中选择一些较大的群体（如地区、社区或群组），然后在第二阶段从所选的群体中选择一些更小的群体，最终在最后一个阶段，从最小的群体中选择个体作为样本。`,
        type: 1,
        component: 'proportionalSampling'
      },
      {
        name: '单变量调整',
        // eslint-disable-next-line max-len
        explain: `单变量调整是把日数据转换为周数据的过程，能降低数据波动，凸显数据趋势。其中，相加聚合是将每周每日数据相加，其和即为周数据，但在一些情形下，简单相加并非最佳聚合方式。比如，若不同日期的发病数据重要性或代表性有别，可采用加权相加。像一周内，因周末人口流动大、社交活动多，对疾病传播影响更大，就可给周末发病数据赋更高权重后再聚合。中位数聚合适用于数据有异常值或呈偏态分布时，计算一周内日数据的中位数作为周数据，它比平均数更稳健。众数聚合在数据为分类数据或有明显集中趋势时可选用，即取一组数据中出现次数最多的数值作为周数据。移动平均聚合是一种平滑数据的技术，以一周为时间窗口计算平均值来实现日数据到周数据的转换。从第一天起计算前七天的平均值作为第一周的移动平均值，然后从第二天起计算第二天到第八天的平均值作为第二周的移动平均值，依此类推，这样能保留数据动态变化趋势并减少短期波动。分位数聚合除了用中位数（50% 分位数），还可用 25% 分位数和 75% 分位数等来聚合日数据。例如，当一周内日发病数据为 [8, 10, 12, 15, 18, 20, 25] 时，其 25% 分位数是 10，75% 分位数是 20，这些分位数能更全面地描述数据分布情况，将其作为周数据能提供更多信息。`,
        type: 1,
        component: 'singleVariableAdjustment'
      },
      {
        name: '变量间的滞后调整',
        explain: '滞后调整是指一个变量的变化对另一个变量产生影响时，在时间上有一定的滞后性。为了研究变量间的滞后调整，需要对滞后的程度进行度量，并构建合适的模型。',
        type: 1,
        component: 'lagAdjustmentBetweenVariablesHandle'
      }
      // {
      //   name: '列联表变换',
      //   explain: '列联表变换是一种用于探索和呈现两个或多个分类变量之间关系的方法。通过列联表变换，我们可以将原始的二维列联表转换成其他形式的统计表格或图形，以便于更直观地理解变量之间的关系和相互作用。',
      //   type: 1,
      //   component: 'crossTableConversion'
      // }
    ]
  },
  {
    name: '描述性分析',
    id: 2,
    type: 2,
    icon: 'icon-miaoshuxingfenxi',
    component: '',
    children: [
      {
        name: '正态性检验',
        explain: [
          '正态性检验用于检验数据是否满足正态分布，一些算法需要数据满足正态分布（如单样本T检验，独立样本T检验等），标准正态分布特征：均值=中位数=众数。'
        ],
        type: 2,
        component: 'normalityTest',
        inputHint: '<span class="V-N">≥1个【定量变量】</span>。',
        outputHint: '模型检验的结果，数据满足/不满足正态分布。',
        path: 'descriptiveAnalysis/normalityTest',
        apiName: 'normality_test'
      },
      {
        name: '分布检验',
        explain: ['对于不符合正态分布的数据，分布检验可以确定其服从的概率分布。'],
        type: 2,
        component: 'multipleDistributionTest',
        inputHint: '<span class="V-N">≥1个【定量变量】</span>。',
        outputHint: '模型检验的结果，各种分布类型检验统计量和p值，根据最大p值确定数据满足的分布。',
        path: 'descriptiveAnalysis/distributionTest',
        apiName: 'anderson_test'
      }
    ]
  },
  {
    name: '差异性分析',
    id: 3,
    type: 2,
    icon: 'icon-chayixingfenxi',
    component: '',
    children: [
      {
        name: '单样本T检验',
        explain: [
          '单样本t检验用于检验样本均数所代表的未知总体均数μ是否与已知总体均数μ0存在差异。数据来自（近似）正态分布的总体的随机样本。'
        ],
        type: 2,
        component: 'tTestAnalysis',
        inputHint: '<span class="V-N">1个【定量变量】</span>与总体均值。',
        outputHint: '该定量变量数据是否与该特定数值分布存在差异性。',
        path: 'differenceAnalysis/oneSampleTest',
        apiName: 'one_sample_t_test'
      },
      {
        name: '配对样本T检验',
        explain: [
          '配对样本t检验简称配(成)对t检验(paired/matched t-test)，适用于配对设计或自身对照设计的计量资料的比较，其应用条件是两个配对组别间观察变量的差值服从正态(或近似正态)分布。'
        ],
        type: 2,
        component: 'tTestPairingAnalysis',
        inputHint: '<span class="V-N">2个【定量变量】</span>。',
        outputHint: '两组数据之间是否存在显著性差异。',
        path: 'differenceAnalysis/pairSampleTest',
        apiName: 'rel_sample_t_test'
      },
      {
        name: '独立样本T检验',
        explain: [
          '独立样本T检验用于完全随机设计两独立样本均数的比较，其比较的目的是检验两独立样本均数所代表的未知总体均数是否不等，其应用条件是两组数据均服从正态分布(或近似正态)，且两组数据的方差相等。'
        ],
        type: 2,
        component: 'tTestIndependentAnalysis',
        inputHint: '<span class="V-N">1个【定量变量】</span>，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '是否有显著性差异。',
        path: 'differenceAnalysis/independentSampleTest',
        apiName: 'two_sample_t_test'
      },
      {
        name: '单因素方差分析',
        explain: [
          '方差分析用于定性变量与1个或1个以上的定量变量之间的差异性研究。需要注意的是，一个定性变量称为单因素方差分析，两个及以上的定性变量称为多因素方差分析。'
        ],
        type: 2,
        component: 'onewayAnova',
        inputHint: '<span class="V-N">1个【定量变量】</span>，<span class="V-S">1个【定性变量】</span>。',
        outputHint: '模型检验的结果:同一因素不同分组对定量变量产生/不产生显著性影响。',
        path: 'differenceAnalysis/oneWayANOVA',
        apiName: 'one_f_way'
      },
      {
        name: '拟合优度卡方检验',
        explain: [
          '拟合优度卡方检验是一种统计学上的假设检验，用于确定某个变量是否可能来自指定的分布。它常常用于评估样本数据是否代表总体。'
        ],
        type: 2,
        component: 'goodnessChisquareTest',
        inputHint: '<span class="V-S">1个【定性变量】</span>与各分组项的期望比例。',
        outputHint: '判断收集的数据分布与预期是否呈显著性差异。',
        path: 'differenceAnalysis/goodnessOfFitChiSquare',
        apiName: 'chisquare_test'
      },
      {
        name: '卡方检验',
        explain: [
          '卡方检验（Chi-Square Test）是一种用于分析两个或多个分类变量之间关联性的统计方法。它用于判断两个或多个分类变量之间的观察势实频数与期望频数之间是否存在显著性差异。卡方检验适用于离散型数据，比如数据以频数或计数形式呈现，而不是连续型数据。'
        ],
        type: 2,
        component: 'chisquareTest',
        inputHint: '<span class="V-S">2个【定性变量】</span>（分类变量）。',
        outputHint:
          '卡方检验主要是比较定类变量与定类变量之间的差异性分析。通过统计样本的实际观测值与理论推断值之间的偏离程度，实际观测值与理论推断值之间的偏离程度决定卡方值的大小，如果卡方值越大，二者偏差程度越大；反之，二者偏差越小。',
        path: 'differenceAnalysis/chiSquareTest',
        apiName: 'base_chi2_contingency'
      },
      {
        name: '配对卡方检验',
        explain: [
          "配对卡方检验（Paired Chi-Square Test），也称为麦克马斯特卡方检验（McNemar's Chi-Square Test），是一种用于比较两个相关样本或两组相关观测之间的差异的统计方法。它通常用于分析两个分类变量在两个时间点或条件下的差异。这种方法对于研究干预或治疗方法的效果在不同时间点或条件下是否显著具有重要作用。"
        ],
        type: 2,
        component: 'pairedChisquareTest',
        inputHint:
          '<span class="V-S">2个【定性变量】</span>（分类变量）</span>，<span class="V-N">1个【定量变量】</span>（频数变量）。',
        outputHint:
          '配对卡方检验主要是比较定类变量与定类变量之间的差异性分析。通过统计样本的实际观测值与理论推断值之间的偏离程度，实际观测值与理论推断值之间的偏离程度决定卡方值的大小，如果卡方值越大，二者偏差程度越大；反之，二者偏差越小。',
        path: 'differenceAnalysis/pairChiSquareTest',
        apiName: 'chi2_mcnemar'
      },
      {
        name: 'CMH分层卡方检验',
        explain: [
          '分层卡方检验，也称为Cochran-Mantel-Haenszel检验（CMH检验），主要用于分层分析。CMH检验通过对分层因素进行控制，从而考察调整混杂因素之后暴露/处理因素与结局事件之间的关联性。'
        ],
        type: 2,
        component: 'CMHstratifiedChisquareTest',
        inputHint:
          '<span class="V-S">1个【定性变量】</span>（分层变量），<span class="V-S">2个【定性变量】</span>（二分类因变量）。',
        outputHint: '以一个混杂因素作为分层变量，输出不同层间2个二分类变量的关系。',
        path: 'differenceAnalysis/cmhChiSquareTest',
        apiName: 'strata_chi2'
      },
      {
        name: '趋势卡方检验',
        explain: [
          '趋势卡方检验(Trend X² test)是对有序多分类资料（等级资料）进行假设检验的一种方法，属于卡方检验的一种。它主要用于检验等级资料内部构成之间的差别是否有显著性，以及两组变量间有无相关关系等。'
        ],
        type: 2,
        component: 'trendChisquareTest',
        inputHint: '<span class="V-S">2个【定性变量】</span>（二分类或有序多分类变量）。',
        outputHint: '输出有序多分类变量对另一分类变量的影响有无趋势关系。',
        path: 'differenceAnalysis/trendChiSquareTest',
        apiName: 'trend_chi2'
      },
      {
        name: '独立样本Mann-Whitney U检验',
        explain: ['Mann-Whitney U检验用于检验两组间一个或多个定量变量的中位数有无明显差异，不要求数据呈现正态分布。'],
        type: 2,
        component: 'mannWhitneyUTest',
        inputHint: '<span class="V-N">≥1个【定量变量】</span>，<span class="V-S">1个【定性变量】</span>（二分类定性变量）。',
        outputHint: '模型检验结果，两组间定量变量的中位数存在/不存在明显差异。',
        path: 'differenceAnalysis/independentMannWhitneyTest',
        apiName: 'mann_u_test'
      },
      {
        name: '配对样本wilcoxon符号秩检验',
        explain: [
          '配对样本wilcoxon符号秩检验用于比较两个样本（样本量相同）的中位数是否存在显著差异，适用于不满足正态分布或方差齐性假设的数据。'
        ],
        type: 2,
        component: 'wilcoxonTest',
        inputHint: '样本数相同，且不满足正态分布或方差齐性<span class="V-N">2个【定量变量】</span>。',
        outputHint: '模型检验结果，两个定量变量中位数存在/不存在明显差异。',
        path: 'differenceAnalysis/pairWilcoxonSignedRankTest',
        apiName: 'rel_wilcoxon_test'
      },
      {
        name: '独立样本Kruskal-Wallis检验',
        explain: [
          '独立样本Kruskal-Wallis检验用于比较三个或更多独立样本的中位数是否存在显著差异（独立样本Mann-Whitney U检验只作用于二分类定性变量)，不要求数据满足正态分布。'
        ],
        type: 2,
        component: 'independentKWTest',
        inputHint: '<span class="V-N">1个【定量变量】</span>，<span class="V-S">1个【定性变量】（多分类变量）</span>。',
        outputHint: '模型检验结果，同一定性变量不同分组间定量变量的中位数存在/不存在明显差异。',
        path: 'differenceAnalysis/independentKruskalWallisTest',
        apiName: 'kruskal_w_test'
      },
      {
        name: '独立样本Kolmogorov-Smirnow检验',
        explain: ['独立样本Kolmogorov-Smirnow检验用于比较两组独立样本的数据分布是否存在显著差异，而无需对数据的分布做出假设。'],
        type: 2,
        component: 'independentKSTest',
        inputHint: '<span class="V-N">2个【定量变量】</span>。',
        outputHint: '模型检验结果，两组样本的数据分布存在/不存在明显差异。',
        path: 'differenceAnalysis/independentKSTest',
        apiName: 'ks_2samp_test'
      },
      {
        name: '多配对样本Friedman检验',
        explain: ['配对样本Friedman非参数检验用于比较多个配对样本来自的多个总体的分布是否存在显著差异。'],
        type: 2,
        component: 'pairFriedmanTest',
        inputHint: '样本量相同，且不满足正态分布<span class="V-N">≥3个【定量变量】</span>。',
        outputHint: '变量整体存在/不存在明显差异，哪些变量两两之间存在差异和差异程度。',
        path: 'differenceAnalysis/multiPairFriedmanTest',
        apiName: 'rel_friedman_test'
      },
      {
        name: '单样本游程检验',
        explain: ['单样本游程检验是用于检验某一事件的发生是否是随机的。'],
        type: 2,
        component: 'singleSampleTest',
        inputHint: '设置检验值（中位数，均值，自定义数值），<span class="V-N">1个【定量变量】</span>。',
        outputHint: '某一事件的发生是/不是随机的。',
        path: 'differenceAnalysis/oneSampleRunTest',
        apiName: 'one_samp_runstest'
      },
      {
        name: '独立样本游程检验',
        explain: ['独立样本游程检验用于检验两独立样本来自的总体分布是否存在显著差异。'],
        type: 2,
        component: 'doubleSampleTest',
        inputHint: '<span class="V-N">2个【定量变量】</span>。',
        outputHint: '两个独立样本总体存在/不存在显著差异。',
        path: 'differenceAnalysis/independentRunTest',
        apiName: 'wald_wolf_test'
      },
      {
        name: '事后多重比较',
        explain: ['方差分析后存在显著差异时，对变量之间具体差异进行分析的方法。'],
        type: 2,
        component: 'postMultipleComparison',
        inputHint: '<span class="V-S">1个【定性变量】</span>（分类变量），<span class="V-N">≥1个【定量变量】</span>（连续变量）。',
        outputHint:
          '方差分析总体平均数间有显著性差异时，多重比较可用来进一步确定在哪两个平均数间有差异，哪两个平均数间没有差异。',
        path: 'differenceAnalysis/postHocTest',
        apiName: 'multi_comparison'
      },
      {
        name: '多因素方差分析',
        explain: ['当有两个或者两个以上的因素对因变量产生影响时，可以用多因素方差分析的方法来进行分析。其原理与单因素方差分析基本一致，也是利用方差比较的方法，通过假设检验的过程来判断多个因素是否对因变量产生显著性影响。在多因素方差分析中，由于影响因变量的因素有多个，其中某些因素除了自身对因变量产生影响之外，它们之间也有可能会共同对因变量产生影响。'],
        type: 2,
        component: 'multipleFactorAnova',
        inputHint: '<span class="V-N">1个【定量因变量】</span>，<span class="V-S">≥2个【定性分组自变量】</span>。',
        outputHint: '多个分类变量的不同水平对结果是否有显著影响。',
        path: 'differenceAnalysis/multiFactorANOVA',
        apiName: ''
      },
      {
        name: '协方差分析',
        explain: ['协方差分析是一种强大的统计工具，用于解释组别之间的差异，并控制潜在的协变量的影响，从而更准确地评估实验或研究的结果。当你想要比较两个或多个组的均值差异，但存在可能会影响因变量的协变量，就需要用到协方差分析去控制了协变量的影响并评估分组之间的差异。'],
        type: 2,
        component: 'covarianceAnalysis',
        inputHint: '<span class="V-N">1个【定量资料因变量】</span>，<span class="V-S">≥1个【定性分组自变量】</span>，<span class="V-N">≥1个【定量资料协变量】</span>。',
        outputHint: '协变量的影响被控制后，解释组别之间的差异。',
        path: 'differenceAnalysis/ANCOVA',
        apiName: ''
      },
      // {
      //   name: '重复测量方差分析',
      //   explain: ['重复测量方差是一种用于重复测量数据的方差分析，通过分解方差-协方差矩阵代替对方差的分解。而重复测量数据，是一种医学研究常用数据，通过对不同时间点对同一对象的同一观察指标进行多次测量得到。这类数据常常存在相关性，不符合一般方差分析对数据的独立性的要求，故需要使用重复测量方差进行分析。'],
      //   type: 2,
      //   component: 'repeatedMeasuresAnova',
      //   inputHint: '组间变量：<span class="V-S">≤2个定性变量</span>，组内变量：<span class="V-N">≥2个定量变量</span>，应按顺序放入，个体变量：<span class="V-S">1个定性变量</span>，用于确定个体的变量(类似患者名、医院名、试验名等确定个体的变量）。',
      //   outputHint: '组间、组内不同水平之间是否存在差异以及组间随着组内变量的变化趋势。',
      //   path: 'differenceAnalysis/repeatedMeasuresANOVA',
      //   apiName: ''
      // },
      // {
      //   name: '主成分分析',
      //   explain: ['主成分分析将多个有一定相关性的指标进行线性组合，以最少的维度解释原数据中尽可能多的信息为目标进行降维，降维后的各变量间彼此线性无关，最终确定的新变量是原始变量的线性组合，且越往后主成分在方差中的比重也小，综合原信息的能力越弱，与因子分析不同的是，因子分析是利用少数几个公共因子去解释较多个要观测变量中存在的关系，它不是对原始变量的重新组合。'],
      //   type: 2,
      //   component: 'principalComponentAnalysis',
      //   inputHint: '<span class="V-N">2个或两个以上的定量变量</span>（假设为N个变量），<span class="V-S">行索引 [定类] 变量</span>（变量数≤1）。',
      //   outputHint: '最低可降维成1维（一个变量，一般用于综合评价），最多可降维成N个变量（一般用于数据脱敏），同时可以获取降维后各个变量的组成权重，用于代表原先变量的数据保留情况。',
      //   path: 'differenceAnalysis/pca',
      //   apiName: ''
      // },
      // {
      //   name: '主成分评价',
      //   explain: ['主成分评价是对主成分分析结果进行检验和解释的过程，旨在确定主成分分析是否提供了对原始数据的有效降维和解释。通过主成分评价，可以确定主成分分析是否适用于数据，以及提供了对数据结构的合理解释，从而为后续数据分析和建模提供参考依据。'],
      //   type: 2,
      //   component: 'principalComponentEvaluation',
      //   inputHint: '≥2个定性变量',
      //   outputHint: '主成分：通过PCA提取的主要成分，这些成分解释了大部分的变量变异。回归模型参数：基于主成分的回归分析结果，包括系数、标准误差、p值等统计指标。'
      // },
      {
        name: '四格表卡方检验',
        explain: ['四格表卡方检验是一种用于分析两个分类变量之间关系的统计方法。它通过比较实际观察到的频数和期望频数之间的差异来判断两个变量之间是否存在相关性。通常情况下，四格表卡方检验适用于具有两个分类变量的交叉表'],
        type: 2,
        component: 'fourGridChiSquareTest',
        inputHint: '<span class="V-S">1个【定性资料自变量】</span>，<span class="V-S">≥1个【定性资料因变量】</span>。',
        outputHint: '定类数据与定类数据之间等级存在/不存在显著性差异。',
        path: 'differenceAnalysis/contingencyTableChiSquareTest',
        apiName: ''
      },
      {
        name: '配对四格表卡方检验',
        explain: ['配对卡方检验用于分析配对定类变量X1与定类变量X2之间的差异性。它要求数据是配对的，即变量X1、X2是一个事物的同一属性，例如分别采用甲、乙两种方法对同一批病人进行检查，比较此两种方法的结果是否有本质不同，此时要用配对卡方检验。'],
        type: 2,
        component: 'pairedFourGridChiSquareTest',
        inputHint: '<span class="V-S">1个【定性资料变量1】</span>，<span class="V-S">1个【定性资料变量2】</span>。',
        outputHint: '配对变量X1、X2之间是否存在差异性。',
        path: 'differenceAnalysis/pairContingencyTableChiSquareTest',
        apiName: ''
      }
    ]
  },
  {
    name: '相关性分析',
    id: 4,
    type: 2,
    icon: 'icon-xiangguanxingfenxi',
    component: '',
    children: [
      {
        name: '皮尔逊相关性分析',
        explain: [
          '相关性分析是指对两个或多个具备相关性的变量元素进行分析，从而衡量两个变量因素的相关密切程度。相关性的元素之间需要存在一定的联系或者概率才可以进行相关性分析。',
          '皮尔逊相关性分析是分析两变量间线性相关的方法。皮尔逊相关系数的变化范围为-1到1。 相关系数大于0表示正相关；相关系数小于0表示负相关；相关系数等于0 表示不相关。相关系数的绝对值越接近1，两个变量的线性相关程度越强；相关系数越接近 0，两个变量的线性相关越弱。 相关系数等于1时称为完全正相关；相关系数等于-1时称为完全负相关。',
          '其应用条件是数据均服从正态分布(或近似正态)。'
        ],
        type: 2,
        component: 'pearsonAnalysis',
        inputHint: '<span class="V-N">≥2个【定量变量】</span>。',
        outputHint: '变量之间是否呈现显著性相关以及相关的程度。',
        path: 'relevanceAnalysis/pearsonCorrelation',
        apiName: 'pearsonr_coefficient'
      },
      {
        name: '斯皮尔曼相关性分析',
        explain: [
          '相关性分析是指对两个或多个具备相关性的变量元素进行分析，从而衡量两个变量因素的相关密切程度。相关性的元素之间需要存在一定的联系或者概率才可以进行相关性分析。',
          '由于直线相关的统计推断要求两个变量服从双变量正态分布，但在实际应用中有时满足不了这样的条件，这时，常用斯皮尔曼相关性分析。斯皮尔曼相关性分析是分析两变量间线性相关的方法。斯皮尔曼相关系数的变化范围为-1到1。 相关系数大于0表示正相关；相关系数小于0表示负相关；相关系数等于0 表示不相关。相关系数的绝对值越接近1，两个变量的线性相关程度越强；相关系数越接近 0，两个变量的线性相关越弱。 相关系数等于1时称为完全正相关；相关系数等于-1时称为完全负相关。'
        ],
        type: 2,
        component: 'pearsonAnalysis',
        inputHint: '<span class="V-N">≥2个【定量变量】</span>。',
        outputHint: '变量之间是否呈现显著性相关以及相关的程度。',
        path: 'relevanceAnalysis/spearmanCorrelation',
        apiName: 'spearmanr_coefficient'
      },
      {
        name: '肯德尔tau-b相关性分析',
        explain: [
          '相关性分析是指对两个或多个具备相关性的变量元素进行分析，从而衡量两个变量因素的相关密切程度。相关性的元素之间需要存在一定的联系或者概率才可以进行相关性分析。',
          '肯德尔tau-b相关性分析用于判断两个有序分类变量（比如名次、年龄段、肥胖等级等）之间是否存在相关。肯德尔相关系数使用了“成对“这一概念来决定相关系数的强弱。肯德尔相关系数的变化范围为-1到1。 相关系数大于0表示正相关；相关系数小于0表示负相关；相关系数等于0 表示不相关。相关系数的绝对值越接近1，两个变量的线性相关程度越强；相关系数越接近 0，两个变量的线性相关越弱。 相关系数等于1时称为完全正相关；相关系数等于-1时称为完全负相关。'
        ],
        type: 2,
        component: 'pearsonAnalysis',
        inputHint: '<span class="V-N">≥2个【定量变量】</span>。',
        outputHint: '变量之间是否呈现显著性相似以及相似的程度。',
        path: 'relevanceAnalysis/kendallTauB',
        apiName: 'kendalltau_coefficient'
      },
      {
        name: "Cochran's Q检验",
        explain: [
          "Cochran's Q 检验也是用于非参数差异性检验的一种，用于研究三个及以上样本（样本数一致）是否呈现出显著性差异的一种研究方法。"
        ],
        type: 2,
        component: 'cochransQ',
        inputHint: '<span class="V-S">≥3个【定性变量】</span>（二分类变量）。',
        outputHint:
          'Cochran’s Q 检验是对多个二分类数据进行差异性分析，在a取0.05情况下，整体的显著性P值<0.05，水平上呈现显著性生，说明数据总体存在差异性，反之，说明数据总体不存在差异性。',
        path: 'relevanceAnalysis/cochransQTest',
        apiName: 'cochran_q_test'
      },
      {
        name: 'Kappa一致性检验',
        explain: ['Kappa系数用于定类数据的相关性检验。'],
        type: 2,
        component: 'kappaTest',
        inputHint: '<span class="V-S">≥2个【定性变量】</span>。',
        outputHint:
          'Kappa系数检验是对两两定类变量的相关性进行分析，a取0.05情况下，整体的显著性P值<0.05，水平上呈现显著性，说明两变量之间存在一致性，反之，说明两变量之间不存在一致性。',
        path: 'relevanceAnalysis/kappaConsistencyTest',
        apiName: 'kappa_test'
      },
      {
        name: 'Kendall一致性检验',
        explain: [
          'Kendall一致性检验是对总体（全部数据）的相关性进行分析，适用于3位及以上观察者、结局变量为连续变量或有序分类变量的一致性检验。'
        ],
        type: 2,
        component: 'kendallTest',
        inputHint: '<span class="V-S">【定性变量】</span>（有序变量）或<span class="V-N">【定量变量】</span>的和≥2个。',
        outputHint:
          "Kendall系数一致性检验是对总体（全部数据）的相关性进行分析，a取0.05情况下，整体的显著性P值<0.05，水平上呈现显著性，说明数据呈现一致性，反之，说明数据一致性不显著；在显著性情况下，Kendall's W 系数越大，说明相关性程度越强。",
        path: 'relevanceAnalysis/kendallConsistencyTest',
        apiName: 'kendall_test'
      }
      // {
      //   name: '相关系数比较',
      //   explain: [
      //     '相关系数比较(comparison of correlation coefficients)可用于检验两个独立样本相关系数(r(1)、r(2))的差异是否有统计学意义，即检验两个相关系数是否来自不同的总体(ρ(1)≠ρ(2)，ρ(1)、ρ(2)不全等于0)。'
      //   ],
      //   type: 2,
      //   component: 'correlationCoefficientComparison',
      //   inputHint: '至少两项或以上的定量变量或有序的定类变量，一般要求数据为量表量数据。',
      //   outputHint: '设计的问卷量表题目里各样本是否具有一致性。'
      // },
      // {
      //   name: '探索性因子分析',
      //   explain: ['探索性因子分析(exploratory factor analysis, EFA)主要是为了初步找出因子个数以及因子下各个观测变量的组成、相关程度，以进一步为改进因子结构提供依据。'],
      //   type: 2,
      //   component: 'exploratoryFactorAnalysis',
      //   inputHint: '2个或两个以上的定量变量（假设为N个变量）。',
      //   outputHint: '最低可降维成1维（一个变量，一般用于综合评价），最多可降维成N个变量（一般用于数据脱敏），同时可以获取降维后各个变量的组成权重，用于代表原先变量的数据保留情况。'
      // },
      // {
      //   name: '验证性因子分析',
      //   explain: ['验证性因子分析（confirmatory factor analysis, CFA）是用于测试一个因子与相对应的测度项之间的关系是否符合研究者所设计的理论关系的一种研究方法，可用于调查问卷的量表分析。'],
      //   type: 2,
      //   component: 'confirmatoryFactorAnalysis',
      //   inputHint: '≥2个【定量变量】或有序定类变量',
      //   outputHint: '测量因子与变量之间的对应关系是否符合研究者所设计的理论关系。'
      // }
    ]
  },
  {
    name: '回归分析',
    id: 5,
    type: 2,
    icon: 'icon-huiguifenxi',
    component: '',
    children: [
      {
        name: '一元线性回归模型（最小二乘法）',
        explain: ['一元线性回归是利用数理统计中的回归分析，确定一个自变量和一个因变量之间的线性关系模型。'],
        type: 2,
        component: 'oneVariableLinearRegression',
        inputHint: '<span class="V-N">1个【定量变量】</span>（自变量），<span class="V-N">1个【定量变量】</span>（因变量）。',
        outputHint: '模型检验优度的结果，自变量对因变量的线性关系等。',
        path: 'regressionAnalysis/simpleLinearRegression',
        apiName: 'line_regression'
      },
      {
        name: '多元线性回归模型（最小二乘法）',
        explain: ['多元线性回归是利用数理统计中的回归分析，确定两个或多个自变量和一个因变量之间的线性关系模型。'],
        type: 2,
        component: 'multipleLinearRegression',
        inputHint: '<span class="V-N">≥2个【定量变量】</span>（自变量），<span class="V-N">1个【定量变量】</span>（因变量）。',
        outputHint: '模型检验优度的结果，自变量对因变量的线性关系等。',
        path: 'regressionAnalysis/multipleLinearRegression',
        apiName: 'multiple_linear_regression'
      },
      {
        name: 'logistic回归',
        explain: ['逻辑回归是研究二分类因变量与一些影响因素之间关系的一种多变量分析方法。'],
        type: 2,
        component: 'logisticRegression',
        inputHint:
          '<span class="V-SN">≥1个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '逻辑回归系数估计以及分类预测的效果评价。',
        path: 'regressionAnalysis/logisticRegression',
        apiName: 'logistic_regression_s'
      },
      {
        name: 'Poisson回归',
        explain: [
          'Poisson分布是一种描述和分析稀有事件发生次数的概率分析方法。Poisson分布是偏态分布，线性回归不能解决相关问题，一般推荐使用Poisson回归。Poisson回归主要用于分析服从Poisson分布的因变量与影响其取值的自变量之间变化关系的一种模型，即单位时间(或空间)内某稀有事件发生数的影响因素分析，如某罕见疾病的发病率的影响因素分析。'
        ],
        type: 2,
        component: 'poissonRegression',
        inputHint:
          '<span class="V-S">≥1个【定性变量】</span>（自变量）或<span class="V-N">≥1个【定量变量】</span>（自变量）、<span class="V-N"> 1个【定量变量】</span>（因变量）（服从Poisson分布）。',
        outputHint: 'Poisson回归模型的拟合结果和统计检验结果。',
        path: 'regressionAnalysis/poissonRegression',
        apiName: 'poisson_regression'
      },
      {
        name: '条件logistics回归',
        explain: [
          '条件logistics回归也称配对logistic回归，是使用配对数据的一种模型，常用于医学研究的回顾研究和前瞻研究。条件logistics回归与二元logistic回归区别在于多出配对编号，即将配对组纳入考虑范畴。'
        ],
        type: 2,
        component: 'conditionalLogisticsRegression',
        inputHint:
          '<span class="V-SN">≥1个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量），<span class="V-S">1个【定性变量】</span>（编号变量）。',
        outputHint: '回归系数与各变量对阳性事件发生的作用。',
        path: 'regressionAnalysis/conditionalLogisticRegression',
        apiName: 'conditional_model'
      },
      {
        name: '无序多分类logistic回归',
        explain: ['当因变量为无序多分类变量时，可以采用无序多分类logistic回归（Multinomial logistic regression）进行分析。'],
        type: 2,
        component: 'unorderedLogisticsRegression',
        inputHint:
          '<span class="V-SN">≥1个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（无序分类）（因变量）。',
        outputHint: '无序逻辑回归系数估计以及分类预测的效果评价。',
        path: 'regressionAnalysis/multinomialLogisticRegression',
        apiName: 'mn_logit_model'
      },
      {
        name: '有序logistics回归',
        explain: ['有序Logistic回归（Ordinal Logistic Regression）是一种用于处理有序分类响应变量的统计方法。'],
        type: 2,
        component: 'orderlyLogisticsRegression',
        inputHint:
          '<span class="V-SN">≥1个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（有序分类）（因变量）。',
        outputHint: '有序逻辑回归系数估计以及分类预测的效果评价。',
        path: 'regressionAnalysis/ordinalLogisticRegression',
        apiName: 'order_logit_model'
      },
      // {
      //   name: '负二项回归',
      //   explain: [
      //     '如果说因变量Y为计数数据，一般可使用Poisson回归，但是Poisson回归要求数据满足等离散现象（平均值与方差相等），如果说数据具有一定的聚焦性，此时很可能就会产生过离散现象，即数据平均值与方差明显不相等。此时使用负二项回归更为科学。'
      //   ],
      //   type: 2,
      //   component: 'negativeBinomialRegression',
      //   inputHint: '≥1个定性自变量或≥1个定量自变量、 1个定量因变量',
      //   outputHint: 'poisson回归 图1，表1，表2'
      // },
      {
        name: '分层回归',
        explain: [
          '分层回归本质上是建立在回归分析基础上，通过逐个或逐层增加自变量查看回归模型的改变有无统计学意义，即通过研究上一个层次模型与下一个层次模型的拟合情况之间的差异，来分析新加入的自变量对因变量的影响程度。'
        ],
        type: 2,
        component: 'hierarchicalRegression',
        inputHint:
          '<span class="V-N">1个定量变量Y</span>，<span class="V-SN">≥1个控制变量</span>（<span class="V-N">定量</span>or<span class="V-S">定性</span>），<span class="V-SN">≥1个核心变量</span>（<span class="V-N">定量</span>or<span class="V-S">定性</span>）。',
        outputHint: '分层回归一致性检验',
        path: 'regressionAnalysis/hierarchicalRegression',
        apiName: 'poisson_regression'
      },
      {
        name: 'LASSO回归',
        explain: [
          'Lasso 回归(Least absolute shrinkage and selection operator regression)是一种替代最小二乘法的压缩估计方法。Lasso 的基本思想是建立一个 L1 正则化模型，因此也被称为L1正则化(L1regularization)，其在模型建立过程中会压缩一些系数和设定一些系数为零，当模型训练完成后这些权值等于0的参数就可以舍去，起到筛选变量的效果，从而使模型更为简单，以避免共线性和过拟合。Lasso回归可以利用较少样本量，高效地选较多变量，因此被广泛用于存在多重共线性数据(一般VIF值大于10)的拟合和变量选择。'
        ],
        type: 2,
        component: 'lassoRegression',
        inputHint: '<span class="V-N">1个定量变量Y</span>，<span class="V-N">≥1个定量</span>或二分类定类自变量。',
        outputHint: '模型检验优度的结果，自变量对因变量的先行关系和变量筛选结果等。',
        path: 'regressionAnalysis/lassoRegression',
        apiName: 'poisson_regression'
      }
      // {
      //   name: 'B样条回归',
      //   explain: ['B样条回归是一种回归分析方法，使用B样条函数逼近数据关系。这种方法基于一组节点和基函数构建模型，这些基函数在节点附近局部有效，并且在整个数据范围内通过线性组合进行平滑拟合。B样条回归具有较高的灵活性，能够适应各种数据形状，同时通过控制节点位置和基函数的数量，有效避免了过拟合问题。'],
      //   type: 2,
      //   component: 'bSplineRegression',
      //   inputHint: '≥1个自变量，1个定量自变量，阶数（用户自己填，范围3-6） ',
      //   outputHint: '多元线性回归图1'
      // },
      // {
      //   name: '限制性立方样条回归模型',
      //   explain: ['RCS样条:RCS(Restricted cubic spline)限制性立方样条是分析非线性关系的最常见的方法之一。通常需要设置样条函数节点的个数(k)和参考点(ti)。绝大多数情况下, 节点的位置对限制性立方样条的拟合影响不大, 而节点的个数则决定曲线的形状。当节点的个数为2时, 得到的拟合曲线就是一条直线，一般推荐为4个节点。参考点ti默认为影响因素的中位数，或者自行输入临床上有意义的点。'],
      //   type: 2,
      //   component: 'restrictedCubicSplineRegressionModel',
      //   inputHint:
      // '1个二分类自变量，≥1个自变量，节点数（用户自己填，范围3-6），参考点（用户自己填）',
      //   outputHint: 'logistic回归 表1,表2'
      // },
      // {
      //   name: '主成分回归',
      //   explain: ['主成分回归（Principal Component Regression, PCR）是一种统计建模方法，它结合了主成分分析（Principal Component Analysis, PCA）和多元线性回归（Multiple Linear Regression）的思想。在PCR中，首先通过主成分分析将自变量进行降维，然后利用得到的主成分作为新的自变量进行线性回归分析。PCR可以帮助解决自变量之间共线性的问题，并提高模型的解释性能。它在数据探索和预测建模中广泛应用，特别是在高维数据集中具有很好的效果。'],
      //   type: 2,
      //   component: 'principalComponentRegression',
      //   inputHint: '≥1个自变量，1个定量自变量',
      //   outputHint: '多元线性回归表1'
      // },
      // {
      //   name: '多项式回归',
      //   explain: ['多项式回归是一种回归分析方法，它利用多项式函数来拟合数据的非线性关系。与线性回归模型不同，多项式回归模型包括一个自变量的高次项，这使得模型能够更灵活地适应数据的曲线特征。'],
      //   type: 2,
      //   component: 'polynomialRegression',
      //   inputHint:
      // '<span class="V-N">≥1个自变量（</span><span class="V-S">定性</span><span class="V-N"> or 定量），</span><span class="V-S">1个二分类因变量</span>。',
      //   outputHint: '逻辑回归系数估计以及分类预测的效果评价。'
      // }
    ]
  },
  {
    name: '生存分析',
    id: 6,
    type: 2,
    icon: 'icon-shengcunfenxi',
    component: '',
    children: [
      {
        name: 'K-M法生存分析',
        explain: ['是一种单因素生存分析，可用于研究一个因素对于生存时间的影响，在医疗领域中使用广泛。'],
        type: 2,
        component: 'survivalAnalysis',
        inputHint: '<span class="V-N">1个【定量变量】</span>（生存时间变量），<span class="V-S">1个【定性变量】</span>（二分类生存结局变量），<span class="V-S">1个【定性变量】</span>（自变量）（影响事件）。',
        outputHint: '单一因素对生存期的影响情况。',
        path: 'survivalAnalysis/kaplanMeierSurvivalAnalysis',
        apiName: 'survival_time'
      },
      {
        name: 'Cox回归模型',
        explain: [
          'Cox回归模型又称“比例风险回归模型，该模型以生存结局和生存时间为因变量，可同时分析众多因素对生存期的影响。建立Cox回归模型的前提条件是各变量满足Cox比例风险假设（PH假设），即各变量的作用不随时间的变化而变化。若存在不满足PH假设的情况，可选用不等比例Cox回归模型进行分析，如时间依存Cox回归模型，逆概率加权Cox回归模型和分层Cox回归模型。'
        ],
        type: 2,
        component: 'proportionalRiskCOXRegression',
        inputHint: '<span class="V-SN">≥1个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类生存结局变量），<span class="V-N">1个【定量变量】</span>（生存时间变量）。',
        outputHint:
          '若满足PH假设，输出不同因素对生存期的影响情况；若不满足PH假设，则选用不等比例Cox回归模型进行后续分析，并输出不同因素对生存期的影响情况。',
        path: 'survivalAnalysis/coxRegression',
        apiName: 'proportional_hazards'
      }
    ]
  },
  // {
  //   name: '高级分析',
  //   id: 7,
  //   type: 2,
  //   icon: 'icon-gaojifenxi',
  //   component: '',
  //   children: [
  //     {
  //       name: 'landmark分析',
  //       explain: ['Landmark分析是一种在生存分析中用于研究时间相关因素的方法。该方法通过在固定的时间点（即“地标时间”）观察事件发生情况，而不是从研究开始时观察，来评估时间相关因素对事件发生的影响。这种方法有助于减轻因遗漏时间依赖性而导致的偏差，提供更准确的估计。Landmark分析适用于研究中存在时间相关因素，如治疗效果随时间变化或观察时点的影响等情况。'],
  //       type: 2,
  //       component: 'landmark',
  //       inputHint: '1个定量Y，≤1个分类变量，向后预测单位（用户自己输入，范围0-99），季节性周期长度（用户自己输入，范围1-48）',
  //       outputHint: "多元线性回归图1，Cochran's Q 检验表1 "
  //     },
  //     {
  //       name: '加速失效时间模型',
  //       explain: ['加速失效时间模型（AFT）是一种参数回归模型，用于分析影响生存时间的因素，特别是在不满足Cox等比例风险假设的情况下。与Cox模型不同，AFT模型假设协变量对生存时间的影响是通过改变时间尺度来实现的，而不是风险比例。因此，AFT模型适用于研究中存在时间相关性的情况，其中协变量的影响随时间变化。通过AFT模型，我们可以更全面地理解不同因素对生存时间的影响，为生存分析提供了另一种有力的工具。'],
  //       type: 2,
  //       component: 'acceleratedFailureTimeModel',
  //       inputHint: '1个生存时间变量，1个二分类定性结局变量，≥1个自变量（定性or定量）',
  //       outputHint: '若满足PH假设，输出不同因素对生存期的影响情况；若不满足PH假设，则选用不等比例Cox回归模型进行后续分析，并输出不同因素对生存期的影响情况。 '
  //     },
  //     {
  //       name: '竞争风险模型',
  //       explain: ['一种在原有基础上考虑了竞争风险的改进生存分析模型，在存在竞争风险的情况下传统生存分析往往会高估累积风险率。其中竞争风险是指当研究对象会发生几个结局事件，并且结局事件间互斥。'],
  //       type: 2,
  //       component: 'competitiveRiskModel',
  //       inputHint: '同cox回归，但是结局变量改为1个3分类变量',
  //       outputHint: 'Omlnbus全局性检验结果以及回归系数汇总结果 '
  //     },
  //     {
  //       name: '医学交互作用分析模型',
  //       explain: ['交互作用分析模型是一种统计模型，用于研究两个或多个自变量之间的相互作用对因变量的影响。该模型可以帮助确定自变量之间是否存在相互作用，即它们的组合是否对因变量产生非加性影响。通过引入交互项（interaction term），交互作用分析模型能够捕捉到不同自变量之间的联合效应，从而更准确地解释和预测因变量的变化'],
  //       type: 2,
  //       component: 'medicalInteractionAnalysisModel', // logisticRegression
  //       inputHint: '1个二分类自变量，≥1个自变量，交互项（2个自变量）',
  //       outputHint: '二分类因变量汇总结果、模型评价结果 '
  //     },
  //     {
  //       name: '医学贝叶斯模型',
  //       explain: ['朴素贝叶斯分类器（Naive Bayes classifier），在机器学习中是一系列以假设特征之间强（朴素）独立下运用贝叶斯定理为基础的简单概率分类器。'],
  //       type: 2,
  //       component: 'naiveBayesClassifier', // logisticRegression
  //       inputHint: '1个定量变量Y，≥1个变量X（定类或定量）；训练集比例（用户自己选，0-1）；是否交叉验证；',
  //       outputHint: '二分类因变量汇总结果、模型评价结果 '
  //     },
  //     {
  //       name: '高灵敏传染病预警模型-时间预警模型',
  //       explain: ['时间预警模型是一种利用数学和统计方法来分析传染病数据以及监测和预测传染病爆发的模型。这些模型基于历史传染病数据、人口流动模式、疾病传播动态等因素，通过建立数学模型来预测传染病爆发的可能性、规模和传播速度。传染病时间预警模型的目标是在传染病暴发前及时发现预警信号，以便采取有效的控制措施，减少疾病的传播和影响。这些模型在公共卫生领域中具有重要意义，可以帮助政府和卫生科室做出及时的应对和决策，从而保护公众健康。'],
  //       type: 2,
  //       component: 'timeWarningModel', // multipleLinearRegression
  //       inputHint: '≥2个定量自变量，1个定量因变量',
  //       outputHint: '模型检验优度的结果，拟合效果等 '
  //     },
  //     {
  //       name: '高灵敏传染病预警模型-时空预警模型',
  //       explain: ['传染病时空预警模型是一种利用时空数据分析方法来监测和预测传染病暴发的模型。该模型结合了传染病的时间和空间特征，通过分析传染病在不同时间和地点的传播情况，识别出可能存在的传染风险区域和高发地点。这种模型可以基于历史传染病数据、人口流动信息、环境因素等多种数据来源，利用空间统计方法和机器学习算法来构建预测模型，以提前发现传染病爆发的迹象，并为公共卫生科室和决策者提供及时的预警信息和应对策略，从而有效控制传染病的传播和扩散。'],
  //       type: 2,
  //       component: 'spatioTemporalWarningModel', // multipleLinearRegression
  //       inputHint: '≥2个定量自变量，1个定量因变量',
  //       outputHint: '模型检验优度的结果，拟合效果等 '
  //     },
  //     {
  //       name: '高灵敏传染病预警模型-传染病动力学模型',
  //       explain: ['介绍：传染病动力学模型是数学和统计工具的集合，用于研究传染病在人群中传播的模式和特征。这些模型基于一系列方程和假设，描述了感染个体之间的相互作用和传播过程，通常考虑因素包括人口结构、疾病特性、接触率、治疗和预防措施等。通过模拟不同的传染病传播情景，传染病动力学模型可以为公共卫生决策提供重要的信息和预测，如制定疫苗接种策略、制定隔离和社交隔离政策等，有助于控制和预防传染病的爆发。'],
  //       type: 2,
  //       component: 'infectiousDiseaseDynamicsModel', // multipleLinearRegression
  //       inputHint: '≥2个定量自变量，1个定量因变量',
  //       outputHint: '模型检验优度的结果，拟合效果等 '
  //     },
  //     {
  //       name: '影响因素预警模型',
  //       explain: ['影响因素预警模型是一种利用统计和机器学习方法，分析和识别影响传染病爆发和传播的关键因素的模型。通过整合传染病相关数据、人口特征、环境条件以及疫情控制措施等多方面信息，该模型能够量化不同因素对传染病传播的影响程度，并预测未来传染病爆发的可能性。通过提前识别和评估各种影响因素，该模型可以为公共卫生科室和政府决策者提供预警信息和决策支持，帮助他们及时采取控制措施，降低传染病的传播风险和影响。'],
  //       type: 2,
  //       component: 'earlyWarningModelOfInfluencingFactors', // naiveBayesClassifier
  //       inputHint: '≥1个自变量（定性 or 定量），1个二分类因变量',
  //       outputHint: '二分类因变量汇总以及模型评价。'
  //     },
  //     {
  //       name: '症状监测预警模型',
  //       explain: ['介绍：传染病症状监测预警模型是一种利用医疗和健康数据，以及机器学习和数据挖掘技术来监测和预测传染病爆发的模型。该模型通过分析公共卫生科室、医疗医院和个人健康记录中的症状和就诊数据，识别出异常增加的症状报告和就诊频率，以及可能存在的传染病爆发迹象。通过实时监测症状数据的变化趋势和空间分布，该模型可以提前发现传染病暴发的迹象，并向相关科室和公众发出预警信息，有助于及时采取应对措施，控制传染病的传播。'],
  //       type: 2,
  //       component: 'symptomMonitoringAndEarlyWarningModel', // infectiousDiseaseDynamicsModel
  //       inputHint: '1个二分类变量Y，≥1个自变量',
  //       outputHint: '模型检验优度的结果，拟合效果等 '
  //     },
  //     {
  //       name: 'Serfling回归',
  //       explain: ['Serfling回归是一种统计方法，常用于估计流感季节性流行的基线水平，以便检测流感活动的异常增加。'],
  //       type: 2,
  //       component: 'serfling', // infectiousDiseaseDynamicsModel
  //       inputHint: '1个二分类变量Y，≥1个自变量',
  //       outputHint: '模型检验优度的结果，线性回归分析结果等'
  //     },
  //     {
  //       name: 'WSARE模型',
  //       explain: [
  //         'WSARE模型（Weighted Sum Auto-Regressive Exogenous）是一种用于时间序列预测的统计模型，结合了自回归、外生变量和加权和的特性。该模型考虑了自回归项的影响，同时允许外生变量对预测结果产生影响，并通过加权和的方式来平衡各项的重要性。'
  //       ],
  //       type: 2,
  //       component: 'WSAREModel', // 'cochransQ',
  //       inputHint: '输入：3个或以上的【二分类定类变量】、【定性变量】。',
  //       outputHint:
  //     'WSARE对多个二分类数据进行差异性分析，在a取0.05情况下，整体的显著性P值<0.05，水平上呈现显著性生，说明数据总体存在差异性，反之，说明数据总体不存在差异性。'
  //     },
  //     {
  //       name: '预测值分析',
  //       explain: [
  //         '预测值分析是一种数据分析方法，旨在根据已知数据，通过建立数学模型或算法来预测未来事件或结果。该方法通常应用于各种领域，包括金融、市场营销、医疗保健和气象学等。通过收集历史数据并使用统计技术、机器学习或人工智能等技术，预测值分析可以帮助组织做出更准确的决策，制定有效的战略，并最大程度地利用现有资源。'
  //       ],
  //       type: 2,
  //       component: 'predictedValueAnalysis', // proportionalRiskCOXRegression
  //       inputHint:
  //     '<span class="V-N">1个生存时间变量，</span><span class="V-S">1个二分类定性结局变量，≥1个自变量（</span><span class="V-N">定性</span><span class="V-S">or定量）</span>。',
  //       outputHint:
  //     '若满足PH假设，输出不同因素对生存期的影响情况；若不满足PH假设，则选用不等比例Cox回归模型进行后续分析，并输出不同因素对生存期的影响情况。'
  //     },
  //     {
  //       name: '医学断点回归模型',
  //       explain: [
  //         '断点回归主要用于政策分析，其基本思想是存在分组变量X，该变量能决定个体在断点两侧接受政策干预的概率（精确断点回归处理概率为0跳跃至1，模糊断点回归则不是）。由于X在断点两侧是连续的且认为个体针对X的取值落入断点任意一侧是随机发生的，则断点附近是一个准自然实验，从而可以用于分析引起断点的政策因素对结果的具体影响。'
  //       ],
  //       type: 2,
  //       component: 'medicalBreakpointRegressionModel', // wilcoxonTest
  //       inputHint: '用户需输入包含选定断点附近的样本数据，这通常包括断点两侧的数据及相关的自变量和因变量。',
  //       outputHint: '平台将输出基准模型和断点回归模型的估计结果，包括因变量在断点附近的变化趋势，以及政策变化或干预的因果效应估计值。',
  //     },
  //     {
  //       name: '线性混合效应模型',
  //       explain: ['“医学潜在类别轨迹模型-线性混合效应模型”功能用于分析和识别患者群体在时间序列数据中的不同潜在轨迹。这种模型结合了线性混合效应模型的优点，可以处理时间序列数据中的个体差异和随时间变化的影响。它特别适用于长期跟踪研究，如慢性疾病的进展、治疗反应的变化等。该模型能够揭示不同患者群体随时间的变化模式，并帮助识别哪些因素与健康结果的不同轨迹相关。'],
  //       type: 2,
  //       component: 'linearMixedEffectsModel', // spatioTemporalWarningModel
  //       inputHint: '用户需输入跟踪期间的重复测量数据，包括时间点、个体的测量值，以及可能影响轨迹的协变量。',
  //       outputHint: '平台将输出不同潜在类别的轨迹图，每个轨迹的参数估计（如斜率、截距），以及与健康轨迹相关的协变量分析结果。'
  //     },
  //     {
  //       name: '潜在类别成长模型',
  //       explain: ['潜在类别成长模型常用于分析长期观察数据中的变化趋势和潜在的类别结构。该模型将观察到的数据分解为潜在的类别和成长过程，并通过对潜在类别和成长参数的估计，揭示出数据中的潜在结构和模式'],
  //       type: 2,
  //       component: 'potentialCategoryGrowthModel', // oneVariableLinearRegression
  //       inputHint: '用户需输入个体在多个时间点的重复测量数据，包括对应的时间信息和相关协变量。',
  //       outputHint: '平台将输出基于时间的不同潜在类别的成长轨迹图，每个类别的成长参数（如成长率、方向），以及相关协变量对轨迹的影响。'
  //     },
  //     {
  //       name: '多元潜在类别混合模型',
  //       explain: ['“多元潜在类别混合模型”（Multivariate Latent Class Mixture Model, MLCMM）是一种高级统计方法，用于分析多变量数据中的潜在亚群体。该模型可以同时处理多个变量，以识别不同变量间潜在的关联模式和亚群体。它适用于在复杂数据集中寻找潜在的分类，例如在医学研究中识别具有相似症状或反应模式的患者群体。MLCMM有助于提高对复杂医学问题的理解，支持个体化治疗和精准医疗。'],
  //       type: 2,
  //       component: 'multiplePotentialClassesMixedModel', // multipleLinearRegression
  //       inputHint: '用户需输入涵盖多个相关变量的复杂数据集，包括临床测量值、患者的反应数据、生理指标等。',
  //       outputHint: '平台将输出不同潜在类别的描述，包括每个类别的特征、成员组成，以及各变量在不同类别中的分布情况。'
  //     },
  //     {
  //       name: '小波变换',
  //       explain: ['小波变换（wavelet transform，WT）是一种新的变换分析方法，它继承和发展了短时傅立叶变换局部化的思想，同时又克服了窗口大小不随频率变化等缺点，能够提供一个随频率改变的“时间-频率”窗口，是进行信号时频分析和处理的理想工具。'],
  //       type: 2,
  //       component: 'waveletTransform',
  //       inputHint: '用户需输入时间序列数据，如医学检测信号、经济数据序列或任何需要局部时频分析的数据。',
  //       outputHint: '模型将输出数据的小波系数，包括对数据的多尺度分析结果，识别出的局部时频特征，以及可能的异常或模式。 '
  //     },
  //     {
  //       name: '隐马尔可夫模型',
  //       explain: ['隐马尔可夫模型（Hidden Markov Model，HMM）是一种统计模型，用于描述由隐藏状态序列产生的观测序列。在HMM中，系统状态是不可见的（即隐藏的），但通过可观测的数据可以推断出状态序列的概率分布。'],
  //       type: 2,
  //       component: 'hiddenMarkovModel',
  //       inputHint: '1个【分类变量】，≥1个【连续变量】。',
  //       outputHint: '隐马尔可夫模型较可用来进一步确定在哪两个平均数间有差异，哪两个平均数间没有差异。 '
  //     },
  //     {
  //       name: '高精度临床预测分析',
  //       explain: ['临床预测模型是在医学领域中应用的一种分析工具，旨在根据患者的临床特征、生物标志物或医疗历史等信息，预测患者可能发生的特定事件或疾病结果。这些模型可以基于统计学方法、机器学习算法或深度学习技术构建，以帮助医疗专业人员做出更准确的诊断、评估患者的风险水平，并指导个性化的治疗方案。临床预测模型的发展对于提高医疗决策的效率和准确性具有重要意义，可以为医护人员提供更好的支持和指导，从而改善患者的治疗结果和生存质量'],
  //       type: 2,
  //       component: 'clinicalPrecisionPredictionModel',
  //       inputHint: '≥1个自变量（定性 or 定量），1个二分类因变量',
  //       outputHint: '二分类因变量汇总以及模型评价。 '
  //     },
  //     {
  //       name: '基准模型',
  //       explain: ['“基准模型”功能允许用户建立和评估在无政策变化或无干预情况下的因变量变化趋势。这个基准模型是评估政策或干预效果的重要参考，帮助用户理解干预措施实施前后的实际影响。它通过对比实验组和对照组在选定的多个时间点上的因变量数据，分析和估计干预的净效果'],
  //       type: 2,
  //       component: 'didReferenceModel',
  //       inputHint: '2个定量变量',
  //       outputHint: '两组数据之间是否存在显著性差异。'
  //     },
  //     {
  //       name: '差分模型',
  //       explain: ['“差分模型”功能是为了估计特定政策变化或干预措施的影响而设计的。它考虑了时间效应、组间效应以及时间和组别的交互效应。该模型通过比较实验组和对照组在干预前后的差异变化，从而估计干预的因果效应。这种方法特别有助于控制未观察到的混杂变量，这些变量可能随时间而变化，但通常假定它们对实验组和对照组的影响是相同的。'],
  //       type: 2,
  //       component: 'didDifferenceInDifferencesModel',
  //       inputHint: '2个定量变量',
  //       outputHint: '两组数据之间是否存在显著性差异。'
  //     },
  //     {
  //       name: '因果效应估计',
  //       explain: ['“因果效应估计”功能专门用于估计政策变化或干预措施对特定因变量的影响。该功能通过比较差分模型中政策变化前后实验组和对照组之间的差异，来估计干预的因果效应。此功能对于分析政策变更或临床干预对人群健康影响的研究尤为重要，它帮助研究者理解政策或干预是否达到预期效果，以及这些效果的幅度。'],
  //       type: 2,
  //       component: 'didCausalEffectEstimation',
  //       inputHint: '2个定量变量',
  //       outputHint: '两组数据之间是否存在显著性差异。'
  //     },
  //     {
  //       name: '传统机器学习模型',
  //       explain: ['“传统机器学习模型”功能提供了一套全面的机器学习工具，用于数据挖掘和预测建模。支持的模型包括随机森林、梯度提升、XGBoost、支持向量机、决策树、KNN、K均值聚类、正则化逻辑回归等。用户可以根据具体的研究需求选择适当的模型，功能还支持自动模型优化，通过遍历不同的参数组合和变量选择来找出最佳模型。此外，还支持使用多种验证方法进行模型拟合，并提供丰富的评价指标来评估预测效果。'],
  //       type: 2,
  //       component: 'traditionalMachineLearningModel',
  //       inputHint: '用户需输入包括自变量和因变量的数据集，以及任何特定的模型参数或拟合选项。',
  //       outputHint: '平台将输出最优模型的详细结果，包括模型参数、性能评估指标（如灵敏度、特异度、R2等），预测结果及相关图形表示。'
  //     },
  //     {
  //       name: '人工神经网络模型',
  //       explain: ['“人工神经网络模型”功能提供了一个强大的深度学习工具，用于处理复杂的非线性数据模式。这项功能支持多种类型的神经网络，包括多层感知机（MLP）、前馈神经网络（FNN）、循环神经网络（RNN）和卷积神经网络（CNN）。这些模型可以应用于各种任务，如图像和语音识别、时间序列预测、自然语言处理等。用户可以根据具体任务选择合适的网络类型，并调整网络参数以优化性能。'],
  //       type: 2,
  //       component: 'artificialNeuralNetworkModel',
  //       inputHint: '用户需要输入相应的训练数据，这些数据应包括特征变量和目标变量。',
  //       outputHint: '平台将输出神经网络的训练结果，包括模型性能指标（如准确率、损失函数值）和预测结果。'
  //     },
  //     {
  //       name: 'Rayleigh检验',
  //       explain: ['Rayleigh检验是一种用于检验数据是否符合圆形分布的统计方法。该检验基于Rayleigh分布，通过计算数据的向量平均值的长度（也称为矢量长度）来评估数据是否集中在圆周上。如果数据的矢量长度显著大于预期的随机分布，则可以拒绝数据均匀分布的假设，表明数据倾向于在特定的方向上集中。'],
  //       type: 2,
  //       component: 'rayleighTest',
  //       inputHint: '2个或以上的【定类变量】。',
  //       outputHint: '对两两定类变量的相关性进行分析，a取0.05情况下，整体的显著性P值<0.05，水平上呈现显著性，说明两变量之间存在一致性，反之，说明两变量之间不存在一致性。'
  //     },
  //     {
  //       name: 'Watson-Williams检验',
  //       explain: ['Watson-Williams检验是一种用于比较两个或多个组之间差异的统计方法，特别适用于分析不同组别之间的方向性数据（例如角度、方向）。该检验基于将数据转换为正弦和余弦值的方法，然后计算各组数据的均值向量，并比较这些向量之间的差异。'],
  //       type: 2,
  //       component: 'watsonWilliamsTest',
  //       inputHint: '2个或以上的【定类变量】。',
  //       outputHint: '对两两定类变量的相关性进行分析，a取0.05情况下，整体的显著性P值<0.05，水平上呈现显著性，说明两变量之间存在一致性，反之，说明两变量之间不存在一致性。'
  //     },
  //     {
  //       name: 'Kuiper检验',
  //       explain: ['Kuiper检验是一种用于检验两个样本之间是否存在显著差异的非参数统计方法，特别适用于圆形数据或周期性数据的比较。'],
  //       type: 2,
  //       component: 'kuiperTest',
  //       inputHint: '1个二分类定性变量，≥1个【定量变量】',
  //       outputHint: '模型检验结果，两组间定量变量的中位数存在/不存在明显差异。'
  //     },
  //     {
  //       name: '结构方程模型',
  //       explain: [
  //         'SEM结构方程模型是一种基于因子分析、线性回归方法、用于分析错综复杂变量之间路径关系的一种模型。与线性回归不一样的是，SEM是以量表为单位的，也就是将量表通过因子分析降维成1个主成分（多个变量转化为一个变量），再进行路径分析。'
  //       ],
  //       type: 2,
  //       component: 'structuralEquationModel', // proportionalRiskCOXRegression
  //       inputHint:
  //     '<span class="V-N">1个生存时间变量，</span><span class="V-S">1个二分类定性结局变量，≥1个自变量（</span><span class="V-N">定性</span><span class="V-S">or定量）</span>。',
  //       outputHint:
  //     '若满足PH假设，输出不同因素对生存期的影响情况；若不满足PH假设，则选用不等比例Cox回归模型进行后续分析，并输出不同因素对生存期的影响情况。'
  //     },
  //     {
  //       name: '时间分层病例交叉研究模型',
  //       explain: [
  //         '时间分层病例交叉研究模型是一种研究设计，用于探究特定事件或治疗对疾病发展的影响。该模型通过在不同时间点对同一组病例进行观察和数据收集，以了解时间因素对疾病进程的影响。通过对同一组病例在不同时间点的比较，研究人员可以评估治疗效果的持续性、变化情况以及可能的长期影响，从而为临床实践提供更深入的见解和指导。'
  //       ],
  //       type: 2,
  //       component: 'timeStratifiedCaseCrossoverStudyModel', // structuralEquationModel
  //       inputHint:
  //     '<span class="V-N">1个生存时间变量，</span><span class="V-S">1个二分类定性结局变量，≥1个自变量（</span><span class="V-N">定性</span><span class="V-S">or定量）</span>。',
  //       outputHint:
  //     '若满足PH假设，输出不同因素对生存期的影响情况；若不满足PH假设，则选用不等比例Cox回归模型进行后续分析，并输出不同因素对生存期的影响情况。'
  //     },
  //     {
  //       name: '医学随机对照试验',
  //       explain: [
  //         '医学随机对照试验设计旨在评估药物、治疗方法或其他医学干预措施的有效性和安全性。在这种设计中，研究人员将参与者随机分配到接受干预的实验组和接受安慰剂或标准治疗的对照组中，以消除干预组和对照组之间的可能偏倚。通过在实验组和对照组之间比较结果，如疗效、副作用等，研究人员可以更准确地评估干预措施的效果，并为临床实践提供可靠的证据支持。'
  //       ],
  //       type: 2,
  //       component: 'medicalRandomizedControlledTrialDesign', // tTestIndependentAnalysis
  //       inputHint: '1个【定量变量】，1个【定性变量】（二分类变量）',
  //       outputHint: '是否有显著性差异。'
  //     },
  //     {
  //       name: '广义估计方程模型',
  //       explain: ['广义估计方程（Generalized Estimating Equations, GEE）模型是一种用于处理重复测量数据或相关数据的统计方法，它基于广义线性模型框架，通过估计出使得似然函数最大化的模型参数来进行推断。与传统的线性模型相比，GEE模型可以更好地处理相关性数据和不完全数据，因为它不需要对相关性结构做出具体的假设，并且提供了一种直接估计平均效应的方法。'],
  //       type: 2,
  //       component: 'generalizedEstimationEquationModel', // logisticRegression
  //       inputHint:
  //     '1个【定量变量】，1个【定性变量】（二分类变量）',
  //       outputHint: '逻辑回归系数估计以及分类预测的效果评价。'
  //     },
  //     {
  //       name: '多水平统计模型',
  //       explain: ['多水平统计模型是一种用于分析具有层级结构数据的统计方法，也称为混合效应模型或随机效应模型。该模型考虑了数据的层级结构，例如个体嵌套在群组中，可以同时估计不同层级上的固定效应和随机效应，从而更准确地描述数据的变异性和预测力。'],
  //       type: 2,
  //       component: 'multilevelStatisticalModel', // multipleLinearRegression
  //       inputHint: '<span class="V-N">≥2个定量自变量，1个定量因变量</span>。',
  //       outputHint: '模型检验优度的结果，自变量对因变量的线性关系等。'
  //     },
  //     {
  //       name: '方差成分模型',
  //       explain: [
  //         '方差成分模型是一种用于分解和分析数据变异性来源的统计模型。该模型将总体变异分解为多个成分，通常包括固定效应、随机效应和残差。固定效应表示由特定因素引起的变异，如处理效应或预测因子的影响；随机效应表示来自样本间或观测间的随机变异，通常用于捕捉数据的层级结构；而残差则表示未被模型解释的剩余变异'
  //       ],
  //       type: 2,
  //       component: 'varianceComponentModel', // onewayAnova
  //       inputHint: '1个【定量变量】，1个【定性变量】（二分类变量）',
  //       outputHint: '是否有显著性差异。'
  //     },
  //     {
  //       name: '随机系数模型',
  //       explain: ['随机系数模型是一种统计模型，用于描述在不同个体之间存在随机变异的情况下，自变量对因变量的影响。在这种模型中，模型中的某些参数被认为是随机的，而不是固定的'],
  //       type: 2,
  //       component: 'randomCoefficientModel', // multipleLinearRegression
  //       inputHint: '<span class="V-N">≥2个定量自变量，1个定量因变量</span>。',
  //       outputHint: '模型检验优度的结果，自变量对因变量的线性关系等。'
  //     },
  //     {
  //       name: '中介作用分析',
  //       explain: ['中介作用分析是一种统计方法，用于探究一个变量通过影响另一个变量来影响因变量的过程。在这种分析中，研究者将关注于中介变量是否解释了自变量和因变量之间的关系。'],
  //       type: 2,
  //       component: 'mediationAnalysis', // logisticRegression
  //       inputHint:
  //     '<span class="V-N">≥1个自变量（</span><span class="V-S">定性</span><span class="V-N"> or 定量），</span><span class="V-S">1个二分类因变量</span>。',
  //       outputHint: '逻辑回归系数估计以及分类预测的效果评价。'
  //     },
  //     {
  //       name: '主成分分析与因子分析比较',
  //       explain: ['主成分分析（PCA）与因子分析（FA）的比较旨在帮助研究人员选择适合其研究目的的适当方法。虽然它们都是用于数据降维和探索数据结构的方法，但它们具有不同的假设、目标和应用场景。比较两者有助于确定哪种方法更适合研究的特定需求，从而更好地解释数据和发现潜在结构。'],
  //       type: 2,
  //       component: 'CPCAAA', // multipleLinearRegression
  //       inputHint: '<span class="V-N">≥2个定量自变量，1个定量因变量</span>。',
  //       outputHint: '模型检验优度的结果，自变量对因变量的线性关系等。'
  //     },
  //     {
  //       name: '多维偏好分析',
  //       explain: ['多维偏好分析（Multiple Correspondence Analysis，MCA）是一种用于分析分类数据的主成分分析方法。它适用于研究多个分类变量之间的关系，如调查问卷中的多选题或分类性问题。'],
  //       type: 2,
  //       component: 'multiDimensionalPreferenceAnalysis', // multipleLinearRegression
  //       inputHint: '<span class="V-N">≥2个定量自变量，1个定量因变量</span>。',
  //       outputHint: '模型检验优度的结果，自变量对因变量的线性关系等。'
  //     },
  //     {
  //       name: '医学空间分析模型',
  //       explain: ['医学空间分析模型是一种在医学研究中应用的统计分析方法，旨在探索空间分布与医学现象之间的关联关系。通过医学空间分析模型，研究人员可以探索疾病的地理分布、疾病之间的空间关联、环境因素与健康状况之间的关系等。'],
  //       type: 2,
  //       component: 'medicalSpatialAnalysisModel', // logisticRegression
  //       inputHint:
  //     '<span class="V-N">≥1个自变量（</span><span class="V-S">定性</span><span class="V-N"> or 定量），</span><span class="V-S">1个二分类因变量</span>。',
  //       outputHint: '是否有显著性差异'
  //     }

  //   ]
  // },
  {
    name: '时间序列模型',
    id: 8,
    type: 2,
    icon: 'icon-shijianxuliemoxing',
    component: '',
    children: [
      {
        name: 'ARIMA模型',
        explain: ['ARIMA自回归积分滑动平均模型（Autoregressive Integrated Moving Average Model），是由博克思（Box）和詹金斯（Jenkins）于70年代初提出一著名时间序列预测方法，所以又称为box-jenkins模型、博克思-詹金斯法。其中ARIMA（p，d，q）称为差分自回归移动平均模型，AR是自回归， p为自回归项；MA为移动平均，q为移动平均项数，d为时间序列成为平稳时所做的差分次数。所谓ARIMA模型，是指将非平稳时间序列转化为平稳时间序列，然后将因变量仅对它的滞后值以及随机误差项的现值和滞后值进行回归所建立的模型。ARIMA模型根据原序列是否平稳以及回归中所含部分的不同，包括移动平均过程（MA）、自回归过程（AR）、自回归移动平均过程（ARMA）以及ARIMA过程。'],
        functionalRequirements: [
          '1.ARIMA模型适用于时间序列数据，即按时间顺序排列的观测值。这些数据可以是连续的时间点或固定时间间隔的数据，如每月、每周、每日等。',
          '2.ARIMA模型要求时间序列是平稳的或者可以通过差分转换为平稳的。平稳性是指时间序列的统计特性在时间上不发生明显的变化，如均值、方差等保持稳定。可以通过观察时间序列的图表、自相关图（ACF）和偏自相关图（PACF），以及进行单位根检验（如ADF检验）来评估平稳性。',
          '3.ARIMA模型有三个主要的参数，分别是自回归阶数（AR）、差分阶数（I）和移动平均阶数（MA）。这些阶数需要根据时间序列的自相关和偏自相关性质来选择，可以通过观察ACF和PACF图来确定阶数。',
          '4.在进行ARIMA分析之前，需要对时间序列数据进行模型识别，确定最适合的ARIMA模型。这包括识别是否需要进行差分处理（即I阶数）、确定AR和MA阶数，以及检验模型的拟合程度和残差序列的平稳性。',
          '5.完成模型识别后，需要进行ARIMA模型的拟合和评估。拟合过程包括使用最小二乘法估计模型参数，并对模型进行诊断，如检验残差序列的自相关性和白噪声性质。评估过程包括使用信息准则（如AIC、BIC）来比较不同的ARIMA模型，并选择最优的模型。'
        ],
        type: 2,
        component: 'ARIMAModel',
        inputHint: '<span class="V-N">1个【定量变量】</span>Y，<span class="V-S">1个【定性变量】（时间项）</span>，向后预测单位，是否自动寻优。',
        outputHint: '未来N个时间单位的预测值。',
        path: 'timeSeriesModel/arimaModel',
        apiName: 'arima_model'
      },
      {
        name: 'SARIMA模型',
        explain: ['季节性ARIMA（SARIMA）模型是时间序列分析中一种常用的方法，用于处理具有季节性波动的数据。它是ARIMA（自回归积分滑动平均）模型的一种扩展，专门考虑了数据中的季节性成分。 季节性ARIMA模型的表示通常为SARIMA（p, d, q）（(P, D, Q，s），其中，p：自回归项的阶数、d：非季节性差分次数、q： 移动平均项的阶数、P：季节性自回归项的阶数、D：季节性差分次数、Q：季节性移动平均项的阶数、s：季节周期。'],
        functionalRequirements: [
          '1.时间序列数据：SARIMA模型同样适用于按时间顺序排列的观测值，可以是连续的时间点或固定时间间隔的数据，如每月、每周、每日等。',
          '2.平稳性或差分转换：与ARIMA模型一样，SARIMA模型要求时间序列是平稳的或者可以通过差分转换为平稳的。你可以通过观察时间序列的图表、自相关图（ACF）和偏自相关图（PACF），以及进行单位根检验（如ADF检验）来评估平稳性。',
          '3.主要参数：SARIMA模型也有三个主要的参数，即自回归阶数（AR）、差分阶数（I）、移动平均阶数（MA），以及季节性自回归阶数（SAR）、季节性差分阶数（SI）、季节性移动平均阶数（SMA）。这些参数需要根据时间序列的自相关和偏自相关性质来选择，可以通过观察ACF和PACF图以及季节性ACF和PACF图来确定阶数。',
          '4.模型识别：在进行SARIMA分析之前，需要对时间序列数据进行模型识别，确定最适合的SRIMA模型。这包括识别是否需要进行季节性差分处理（即SI阶数）、确定季节性AR和MA阶数，以及检验模型的拟合程度和残差序列的平稳性。',
          '5.模型拟合和评估：完成模型识别后，需要进行SARIMA模型的拟合和评估。拟合过程包括使用最小二乘法估计模型参数，并对模型进行诊断，如检验残差序列的自相关性和白噪声性质。评估过程包括使用信息准则（如AIC、BIC）来比较不同的SRIMA模型，并选择最优的模型。'
        ],
        type: 2,
        component: 'SARIMAModel',
        inputHint: '<span class="V-N">1个【定量变量】</span>Y，<span class="V-S">1个【定性变量】（时间项）</span>，向后预测单位，季节周期，是否自动寻优。',
        outputHint: '未来N个时间单位的预测值。',
        path: 'timeSeriesModel/sarimaModel',
        apiName: 'sarima_model'
      },
      {
        name: '分布滞后非线性模型',
        explain: ['分布滞后非线性模型（Distributed Lag Nonlinear Model，简称DLNM）是一种统计分析工具，专门用于处理时间序列数据中的滞后效应和非线性关系。它结合了滞后项和非线性函数，能够更好地捕捉数据之间的动态关系。'],
        type: 2,
        component: 'distributedHysteresisNonlinearModel',
        inputHint: '<span class="V-N">1个【定量变量】</span>（自变量）Y，<span class="V-N">1个【定量变量】</span>（因变量），滞后单位。',
        outputHint: '暴露-滞后-反映关联。',
        path: 'timeSeriesModel/distributedLagNonlinearModel',
        apiName: 'dlnm_model'
      }
    ]
  },
  {
    name: '空间分析',
    id: 9,
    type: 2,
    icon: 'icon-kongjianfenxi',
    component: '',
    children: [
      {
        name: '局部空间自相关分析',
        explain: ['全局空间自相关是对整个研究空间的总体描述，仅对同质的空间过程有效，无法识别空间异质性。局部空间自相关可识别空间异质性。', '要求：进行局部空间自相关分析需要的数据包括地理信息数据和对应的属性数据。地理信息数据可以是地图、空间坐标数据或者栅格数据，而属性数据则是与地理信息数据对应的实际测量值或观测值，例如人口数量、经济指标、环境指标等。'],
        type: 2,
        component: 'localSpatialAutocorrelation',
        inputHint: '<span class="V-N">1个【定量变量】</span> ，定义邻接矩阵（Queen邻接 or Rook邻接）。',
        outputHint: '局部莫兰指数等。',
        path: 'spatialAnalysis/localSpatialAutocorrelation',
        apiName: 'local_spatial_auto_correlation'
      },
      {
        name: '全局空间自相关分析',
        explain: ['全局空间自相关（Global spatial autocorrelation）主要用于描述整个研究区域的空间对象某一属性取值的空间分布状态，以判断该对象在空间上是否存在聚集性。'],
        type: 2,
        component: 'globalSpatialAutocorrelation',
        inputHint: '<span class="V-N">1个【定量变量】</span> ，定义邻接矩阵（Queen邻接 or Rook邻接）。',
        outputHint: 'Moran散点图、全局莫兰指数等。',
        path: 'spatialAnalysis/globalSpatialAutocorrelation',
        apiName: 'global_spatial_auto_correlation'
      }
    ]
  },
  {
    name: '传统机器学习',
    id: 10,
    type: 2,
    icon: 'icon-chuantongjiqixuexi',
    component: '',
    children: [
      {
        name: '决策树分类模型',
        explain: ['决策树分类预测模型是一种监督学习方法，通过递归地分割数据集，根据特征值将数据划分成不同的分支，形成一个树状结构。每个内部节点代表一个特征，分支代表该特征的取值范围或条件，叶节点则表示分类结果或预测值。'],
        type: 2,
        component: 'decisionTree',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '模型输出的决策树结构图及模型的分类效果。',
        path: 'traditionalMachineLearning/decisionTreeClassification',
        apiName: 'decision_tree'
      },
      {
        name: '随机森林分类模型',
        explain: ['随机森林是一种强大的机器学习算法，通常用于分类任务。它基于集成学习的思想，通过同时训练多个决策树，并结合它们的预测结果来提高整体模型的准确性和稳定性。在随机森林中，每棵决策树都是通过对训练数据的随机抽样和特征的随机选择而构建的，这种随机性有助于减少过拟合并提高模型的泛化能力。随机森林不需要对输入数据进行特征缩放，并且对于大型数据集和高维特征空间也表现出色。由于其高度并行化的性质，随机森林在大规模数据集上也能够有效地进行训练。'],
        type: 2,
        component: 'randomForest',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '模型输出的决策树结构图及模型的分类效果。',
        path: 'traditionalMachineLearning/randomForestClassification',
        apiName: 'random_forest'
      },
      {
        name: 'XGBoost分类模型',
        explain: ['XGBoost （Extreme Gradient Boosting）是一种高度高效和可扩展的梯度提升算法实现，包括回归、分类和排序。XGBoost通过引入一系列高级技术扩展了梯度提升框架，如正则化（L1和L2）、并行和分布式计算、缺失值处理和稀疏数据支持。'],
        type: 2,
        component: 'XGBoost',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '模型的分类结果和模型分类的评价效果。',
        path: 'traditionalMachineLearning/xgboostClassification',
        apiName: 'xgb_classifier'
      },
      {
        name: '支持向量机二分类模型',
        explain: ['支持向量机（Support Vector Machine，简称SVM）是一种用于分类和回归分析的监督学习算法。SVM通过在高维空间中寻找一个最优的超平面，将数据点分隔到不同的类别中。其核心思想是找到一个最大化边界的决策平面，使得不同类别的样本之间的间隔最大化，从而提高分类的准确性和泛化能力。SVM不仅适用于线性可分的数据，还可以通过使用核函数（如线性核、径向基函数核等）处理非线性可分的数据。'],
        type: 2,
        component: 'supportVectorMachine',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '模型的分类结果和模型分类的评价效果。',
        path: 'traditionalMachineLearning/svmBinaryClassification',
        apiName: 'svm_classifier'
      },
      {
        name: '正则化逻辑回归二分类模型',
        explain: ['正则化逻辑回归二分类模型是在逻辑回归模型的基础上引入正则化项，以防止模型过拟合。逻辑回归用于处理二分类问题，通过学习特征与目标变量之间的关系来预测样本属于某一类别的概率。正则化通过在损失函数中添加一个惩罚项（如L1正则化的Lasso或L2正则化的Ridge），对模型参数进行约束，从而降低模型复杂度，提高泛化能力，使模型在处理新数据时表现更好。'],
        type: 2,
        component: 'regularizedLogisticRegression',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '模型的分类结果和模型分类的评价效果。',
        path: 'traditionalMachineLearning/regularizedLogisticRegression',
        apiName: 'l2_logit_regression'
      },
      {
        name: 'KNN二分类模型',
        explain: ['K近邻(KNN)分类器是有监督学习中普遍使用的分类器之一，将观察值的分类判定为离它最近的k个观察值中所占比例最大的分类。'],
        type: 2,
        component: 'KNN',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '模型的分类结果和模型分类的评价效果。',
        path: 'traditionalMachineLearning/knnBinaryClassification',
        apiName: 'knn_classifier'
      },
      {
        name: 'K均值聚类',
        explain: ['K均值聚类是一种广泛使用的无监督机器学习算法，用于将数据集划分为K个互斥的簇。该算法通过迭代的方式，试图最小化每个簇内数据点与簇中心之间的距离。'],
        type: 2,
        component: 'kMeansClustering',
        inputHint: '<span class="V-SN">≥1个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)。',
        outputHint: '根据预先设定的类别个数，划分为其设定的类别。',
        path: 'traditionalMachineLearning/kMeansClustering',
        apiName: 'kmeans_method'
      }
    ]
  },
  {
    name: '人工神经网络',
    id: 11,
    type: 2,
    icon: 'icon-rengongshenjingwangluo',
    component: '',
    children: [
      {
        name: '多层感知机分类模型',
        explain: ['多层感知机（Multilayer Perceptron，MLP）是一种前馈神经网络模型，通常用于分类和回归任务。它由一个输入层、一个或多个隐藏层和一个输出层组成。每一层的神经元与下一层的神经元全连接，通过权重和偏置进行加权求和并通过激活函数输出。通过反向传播算法，MLP调整网络的权重和偏置，以最小化预测误差，从而提高模型的性能。MLP具有强大的非线性映射能力，能够捕捉复杂的数据模式，被广泛应用于图像识别、自然语言处理和预测分析等领域。'],
        type: 2,
        component: 'multilayerPerceptron',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '模型的分类结果和模型分类的评价效果。',
        path: 'artificialNeuralNetwork/mlpClassification',
        apiName: 'mlp_func'
      },
      {
        name: '前馈神经网络分类模型',
        explain: ['前馈神经网络（Feedforward Neural Network，FFNN）是一种人工神经网络结构，其中信息以单向方式从输入层流向输出层，不会形成环路。FFNN由多个神经元层组成，包括输入层、一个或多个隐藏层和输出层。每层的神经元通过加权连接与前一层的神经元相连，并使用激活函数处理输入信号。这种网络结构广泛应用于分类、回归和模式识别等任务，因其简单且易于训练，被认为是深度学习的基础模型之一。'],
        type: 2,
        component: 'feedforwardNeuralNetwork',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。',
        outputHint: '模型的分类结果和模型分类的评价效果。',
        path: 'artificialNeuralNetwork/feedforwardNNClassification',
        apiName: 'fnn_func'
      },
      {
        name: '卷积神经网络二分类模型',
        explain: ['卷积神经网络（CNN）是一种深度学习算法。它通过卷积层提取数据的局部特征，再通过池化层减少特征维度，从而提高计算效率和减少过拟合。经过多层卷积和池化操作后，数据被展平并传递到全连接层进行分类。'],
        type: 2,
        component: 'convolutionalNeuralNetwork',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。<span class="data-limit">（*数据集最多支持1w行）</span>',
        outputHint: '模型的分类结果和模型分类的评价效果。',
        path: 'artificialNeuralNetwork/cnnBinaryClassification',
        apiName: 'cnn_method'
      },
      {
        name: '循环神经网络二分类模型',
        explain: ['介绍：循环神经网络（RNN）是一种处理序列数据的深度学习模型，广泛应用于时间序列分析和自然语言处理等领域。RNN通过其内部循环结构能够捕捉序列数据中的时间依赖性，将前一时刻的隐藏状态与当前输入共同计算生成当前时刻的隐藏状态，这种机制使得RNN能够有效处理和记忆长短期依赖关系。在分类任务中，RNN的输出经过全连接层和适当的激活函数（如Softmax或Sigmoid）转换为类别概率，实现序列数据的分类。'],
        type: 2,
        component: 'recurrentNeuralNetwork',
        inputHint: '<span class="V-SN">≥2个【</span><span class="V-S">定性</span><span class="V-SN">or</span><span class="V-N">定量</span><span class="V-SN">】</span>(自变量)，<span class="V-S">1个【定性变量】</span>（二分类因变量）。<span class="data-limit">（*数据集最多支持3w行）</span>',
        outputHint: '模型的分类结果和模型分类的评价效果。',
        path: 'artificialNeuralNetwork/rnnBinaryClassification',
        apiName: 'rnn_method'
      }
    ]
  }
]

export const groupSplitOptions = [
  {
    label: '平均值分组（2组）',
    value: 'mean'
  },
  {
    label: '二分位数分组（2组）',
    value: 'median'
  },
  {
    label: '三分位数分组（3组）',
    value: 'percentile_3'
  },
  {
    label: '三分位数分组（4组）',
    value: 'percentile_4'
  },
  {
    label: '三分位数分组（5组）',
    value: 'percentile_5'
  },
  {
    label: '27%,73%分位数分组（3组）',
    value: 'percentile_27'
  }
]

