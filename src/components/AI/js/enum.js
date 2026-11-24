import { ref } from 'vue'
export const goalList = ref([
  {
    label: '病因假设/预后预测',
    value: '病因假设/预后预测'
  },
  {
    label: '疗效评价',
    value: '疗效评价'
  }
])
export const typeList = ref([
  {
    label: '前瞻性',
    value: '前瞻性'
  },
  {
    label: '回顾性',
    value: '回顾性'
  }
])
export const randomList = ref([
  {
    label: '简单随机',
    value: '简单随机'
  },
  {
    label: '区组随机',
    value: '区组随机'
  },
  {
    label: '分层随机',
    value: '分层随机'
  },
  {
    label: '中央随机',
    value: '中央随机'
  }
])
export const blindList = ref([
  {
    label: '单盲',
    value: '单盲'
  },
  {
    label: '双盲',
    value: '双盲'
  },
  {
    label: '三盲',
    value: '三盲'
  },
  {
    label: '开放标签',
    value: '开放标签'
  }
])
export const languageList = ref([
  {
    label: '中文',
    value: '中文'
  }
  // {
  //   label: '英文',
  //   value: '英文'
  // }
])
export const researchTypes = ref([
  {
    id: 1,
    name: '体外研究',
    list: [
      'MiR-34a通过靶向抑制Notch1信号通路诱导结直肠癌细胞凋亡的机制研究',
      'FAM3C 通过 Notch 信号通路调节胶质瘤细胞的增殖、侵袭、凋亡和上皮间质转化',
      '卵巢癌细胞分泌的外泌体 miR-205 通过诱导血管生成促进转移',
      '构建一种用于实时监测细胞凋亡的荧光纳米探针及其在药物筛选中的应用'
    ],
    searchList: [
      {
        label: '研究体系：',
        prop: 'researchSystem',
        type: 'RADIO',
        Enums: ['细胞系', '原代细胞', '器官组织', '细菌/微生物']
      },
      {
        label: '干预措施：',
        type: 'RADIO',
        prop: 'interventionMeasures',
        Enums: ['药物处理', '基因操作', '物理刺激']
      },
      {
        label: '检测指标：',
        type: 'RADIO',
        prop: 'detectionIndex',
        Enums: ['细胞活力', '基因表达', '蛋白表达', '形态学变化']
      },
      {
        label: '实验步骤：',
        type: 'RADIO',
        prop: 'experimentalProcedures',
        Enums: ['AI生成', '自定义']
      }
    ],
    defaultValue: {
      researchSystem: '细胞系',
      interventionMeasures: '药物处理',
      detectionIndex: '细胞活力',
      experimentalProcedures: 'AI生成'
    }
  },
  {
    id: 2,
    name: '动物实验',
    list: [
      '一种在阿尔茨海默病小鼠模型中恢复小胶质细胞 Trem2 功能的细胞疗法',
      '丹参酮通过调节SIRT1/NF-κB信号通路对ApoE小鼠动脉粥样硬化斑块稳定的作用及机制',
      'EqualSpheres栓塞微球搭载伊达比星在VX2兔肝肿瘤模型中的应用',
      '间充质干细胞来源外泌体通过调节巨噬细胞极化促进小鼠深Ⅱ度烫伤创面愈合的机制研究'
    ],
    searchList: [
      {
        label: '实验动物：',
        prop: 'experimentalAnimals',
        type: 'INPUT',
        placeholder: '建议写明动物的种属、品系、性别'
      },
      {
        label: '疾病模型：',
        type: 'RADIO',
        prop: 'diseaseModel',
        Enums: ['自发模型', '诱导模型', '基因编辑模型']
      },
      {
        label: '干预措施：',
        type: 'RADIO',
        prop: 'interventionMeasures',
        Enums: ['给药方案', '手术操作', '行为干预']
      },
      {
        label: '观察指标：',
        type: 'RADIO',
        prop: 'detectionIndex',
        Enums: ['生存分析', '行为学', '影像学', '组织病理学']
      },
      {
        label: '实验步骤：',
        type: 'RADIO',
        prop: 'experimentalProcedures',
        Enums: ['AI生成', '自定义']
      }
    ],
    defaultValue: {
      experimentalAnimals: '',
      diseaseModel: '自发模型',
      interventionMeasures: '给药方案',
      detectionIndex: '生存分析',
      experimentalProcedures: 'AI生成'
    }
  },
  {
    id: 3,
    name: '横断面研究',
    list: [
      '三级医院住院老年患者营养不良风险现状及其与衰弱的相关性分析',
      '2型糖尿病患者自我管理行为与血糖控制达标率的横断面研究',
      '北京市三甲医院急诊科护士职业倦怠现状及与工作环境感知的关系'
    ],
    searchList: [
      {
        label: '研究目的：',
        prop: 'researchPurpose',
        type: 'RADIO',
        Enums: ['患病率调查', '疾病相关因素初筛', '诊断试验评价', '自定义']
      },
      {
        prop: '',
        type: 'CUSTOM1'
      },
      {
        label: '抽样方法：',
        prop: 'samplingMethod',
        type: 'RADIO',
        Enums: ['简单随机抽样', '分层抽样', '整群抽样']
      }

    ],
    defaultValue: {
      researchPurpose: '患病率调查',
      samplingMethod: '简单随机抽样',
      customValue: ''
    }
  },
  {
    id: 4,
    name: '队列研究',
    list: [
      '不同抗生素治疗慢性子宫内膜炎对围产期结果的影响：一项前瞻性队列研究 ',
      '不同手术方式（腹腔镜 vs. 开腹）对结肠癌患者术后五年无病生存率的影响：一项多中心前瞻性队列研究',
      '术中低血压持续时间与非心脏手术后急性肾损伤关系的回顾性队列研究',
      '机器人辅助经阴道自然腔道腹腔镜全子宫切除术的临床优势：回顾性队列研究'
    ],
    searchList: [
      {
        label: '研究目的：',
        prop: 'researchPurpose',
        type: 'RADIO',
        Enums: ['病因研究', '疗效评价', '预后研究', '疾病自然史研究', '自定义']
      },
      {
        prop: '',
        type: 'CUSTOM2'
      },
      {
        label: '数据类型：',
        prop: 'dataType',
        type: 'RADIO',
        Enums: ['前瞻性', '回顾性']
      },
      {
        label: '关键参数：',
        prop: 'keyParams',
        type: 'RADIO',
        Enums: ['随访时间', '失访率控制']
      },
      {
        prop: '',
        type: 'CUSTOM3'
      }
    ],
    defaultValue: {
      researchPurpose: '病因研究',
      customValue: '',
      dataType: '前瞻性',
      keyParams: '随访时间',
      time: '',
      lossRate: ''
    }
  },
  {
    id: 5,
    name: '病例对照研究',
    list: [
      '子宫内膜异位症发病相关危险因素的病例对照研究',
      '服用质子泵抑制剂与社区获得性肺炎发病风险的巢式病例对照研究',
      '某高校诺如病毒感染暴发相关饮食危险因素的病例对照调查',
      'BRCA1/2基因突变与家族性乳腺癌遗传易感性的病例对照研究'
    ],
    searchList: [
      {
        label: '研究目的：',
        prop: 'researchPurpose',
        type: 'RADIO',
        Enums: ['病因研究', '药物罕见不良反应调查', '自定义']
      },
      {
        prop: '',
        type: 'CUSTOM4'
      },
      {
        label: '匹配设计：',
        prop: 'matchingDesign',
        type: 'RADIO',
        Enums: ['是', '否']
      },
      {
        prop: '',
        type: 'CUSTOM5'
      },
      {
        label: '对照组来源：',
        prop: 'source',
        type: 'RADIO',
        Enums: ['社区人群', '医院其他疾病患者']
      }
    ],
    defaultValue: {
      researchPurpose: '病因研究',
      customValue: '',
      matchingDesign: '是',
      source: '社区人群',
      age: '',
      entryTime: '',
      gender: ''
    }
  },
  {
    id: 6,
    name: '随机对照试验',
    list: [
      'SGLT2抑制剂达格列净对比格列美脲作为二甲双胍联合用药治疗2型糖尿病的有效性与安全性',
      '一项多中心、随机、双盲、阳性药物平行对照临床试验；高强度间歇训练与中等强度持续训练对冠心病患者心肺功能影响的随机对照研究',
      '虚拟现实技术术前访视对腹腔镜手术患者术前焦虑影响的随机对照研究',
      '早期康复介入对急性缺血性脑卒中患者肢体功能恢复的疗效：多中心、随机、开放、盲终点评价试验'
    ],
    searchList: [
      // {
      //   label: '研究目的：',
      //   prop: 'researchPurpose',
      //   type: 'RADIO',
      //   Enums: ['优效性试验', '非劣效性/等效性试验']
      // },
      {
        label: '随机方式：',
        prop: 'randomMethod',
        type: 'RADIO',
        Enums: ['简单随机', '区组随机', '分层随机', '中央随机']
      },
      {
        label: '盲法选择：',
        prop: 'blindSelection',
        type: 'RADIO',
        Enums: ['单盲', '双盲', '三盲', '随机标签']
      },
      {
        label: '多中心研究：',
        prop: 'multicenter',
        type: 'RADIO',
        Enums: ['是', '否']
      }
    ],
    defaultValue: {
      researchPurpose: '优效性试验',
      randomMethod: '简单随机',
      blindSelection: '单盲',
      multicenter: '是'
    }
  },
  {
    id: 7,
    name: '证据综合研究',
    list: [
      '妊娠期口服降压药：一项系统评价和meta分析',
      '老年食管癌同步放化疗对比单纯放疗有效性和安全性Meta分析',
      '人工智能模型在医学影像中诊断糖尿病视网膜病变准确性的系统综述与Meta分析'
    ],
    searchList: [
      {
        label: 'P-研究对象：',
        prop: 'P',
        type: 'INPUT'
      },
      {
        label: ' I-干预措施：',
        prop: 'I',
        type: 'INPUT'
      },
      {
        label: 'C-对照措施：',
        prop: 'C',
        type: 'INPUT'
      },
      {
        label: 'O-结局指标：',
        prop: 'O',
        type: 'INPUT'
      },
      {
        label: 'S-研究类型：',
        prop: 'S',
        type: 'INPUT'
      }
    ],
    defaultValue: {
      P: '',
      I: '',
      C: '',
      O: '',
      S: ''
    }
  }
])
