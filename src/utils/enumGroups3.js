import { reactive } from 'vue'
// 性别
export const sexGroups = reactive([
  {
    label: '男',
    value: '1'
  },
  {
    label: '女',
    value: '2'
  }
])
// 民族
export const nationGroups = reactive([
  {
    label: '汉族',
    value: '01'
  },
  {
    label: '蒙古族',
    value: '02'
  },
  {
    label: '回族',
    value: '03'
  },
  {
    label: '藏族',
    value: '04'
  },
  {
    label: '维吾尔族',
    value: '05'
  },
  {
    label: '苗族',
    value: '06'
  },
  {
    label: '彝族',
    value: '07'
  },
  {
    label: '壮族',
    value: '08'
  },
  {
    label: '布依族',
    value: '09'
  },
  {
    label: '朝鲜族',
    value: '10'
  },
  {
    label: '满族',
    value: '11'
  },
  {
    label: '侗族',
    value: '12'
  },
  {
    label: '瑶族',
    value: '13'
  },
  {
    label: '白族',
    value: '14'
  },
  {
    label: '土家族',
    value: '15'
  },
  {
    label: '哈尼族',
    value: '16'
  },
  {
    label: '哈萨克族',
    value: '17'
  },
  {
    label: '傣族',
    value: '18'
  },
  {
    label: '黎族',
    value: '19'
  },
  {
    label: '傈僳族',
    value: '20'
  },
  {
    label: '佤族',
    value: '21'
  },
  {
    label: '畲族',
    value: '22'
  },
  {
    label: '高山族',
    value: '23'
  },
  {
    label: '拉祜族',
    value: '24'
  },
  {
    label: '水族',
    value: '25'
  },
  {
    label: '东乡族',
    value: '26'
  },
  {
    label: '纳西族',
    value: '27'
  },
  {
    label: '景颇族',
    value: '28'
  },
  {
    label: '柯尔克孜族',
    value: '29'
  },
  {
    label: '土族',
    value: '30'
  },
  {
    label: '达斡尔族',
    value: '31'
  },
  {
    label: '仫佬族',
    value: '32'
  },
  {
    label: '羌族',
    value: '33'
  },
  {
    label: '布朗族',
    value: '34'
  },
  {
    label: '撒拉族',
    value: '35'
  },
  {
    label: '毛难族',
    value: '36'
  },
  {
    label: '仡佬族',
    value: '37'
  },
  {
    label: '锡伯族',
    value: '38'
  },
  {
    label: '阿昌族',
    value: '39'
  },
  {
    label: '普米族',
    value: '40'
  },
  {
    label: '塔吉克族',
    value: '41'
  },
  {
    label: '怒族',
    value: '42'
  },
  {
    label: '乌孜别克族',
    value: '43'
  },
  {
    label: '俄罗斯族',
    value: '44'
  },
  {
    label: '鄂温克族',
    value: '45'
  },
  {
    label: '崩龙族',
    value: '46'
  },
  {
    label: '保安族',
    value: '47'
  },
  {
    label: '裕固族',
    value: '48'
  },
  {
    label: '京族',
    value: '49'
  },
  {
    label: '塔塔尔族',
    value: '50'
  },
  {
    label: '独龙族',
    value: '51'
  },
  {
    label: '鄂伦春族',
    value: '52'
  },
  {
    label: '赫哲族',
    value: '53'
  },
  {
    label: '门巴族',
    value: '54'
  },
  {
    label: '珞巴族',
    value: '55'
  },
  {
    label: '基诺族',
    value: '56'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 主要医疗付费方式
export const medicalPayGroups = reactive([
  {
    label: '城镇职工基本医疗保险',
    value: '01'
  },
  {
    label: '城镇居民基本医疗保险',
    value: '02'
  },
  {
    label: '新型农村合作医疗',
    value: '03'
  },
  {
    label: '贫困补助',
    value: '04'
  },
  {
    label: '商业医疗保险',
    value: '05'
  },
  {
    label: '全公费',
    value: '06'
  },
  {
    label: '全自费',
    value: '07'
  },
  {
    label: '其他社会保险',
    value: '08'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 入院途径
export const admissionWayGroups = reactive([
  {
    label: '急诊',
    value: '1'
  },
  {
    label: '门诊',
    value: '2'
  },
  {
    label: '其他医疗医院转入',
    value: '3'
  },
  {
    label: '其他',
    value: '9'
  }
])
// 离院方式
export const dischargeWayGroups = reactive([
  {
    label: '医嘱离院',
    value: '1'
  },
  {
    label: '医嘱转院',
    value: '2'
  },
  {
    label: '医嘱转社区卫生服务医院/乡镇卫生院',
    value: '3'
  },
  {
    label: '非医嘱离院',
    value: '4'
  },
  {
    label: '死亡',
    value: '5'
  },
  {
    label: '其他',
    value: '9'
  }
])
// 治疗类型
export const treatmentTypeGroups = reactive([
  {
    label: 'AIS静脉溶栓',
    value: '01'
  },
  {
    label: 'AIS介入再通',
    value: '02'
  },
  {
    label: '脑出血手术',
    value: '03'
  },
  {
    label: '颅内动脉瘤手术',
    value: '04'
  },
  {
    label: 'CEA/CAS',
    value: '05'
  }
])
// 是否（脑梗死发病是否在院、脑出血发病是否在院、是否脑疝、是否尼莫地平预防血管痉挛治疗···）
export const yesOrNoGroups = reactive([
  {
    label: '是',
    value: '1'
  },
  {
    label: '否',
    value: '2'
  }
])
// 脑梗死发病时间是否明确
export const cerebralInfractionTimeGroups = reactive([
  {
    label: '已知',
    value: '1'
  },
  {
    label: '未知',
    value: '2'
  },
  {
    label: '醒后卒中',
    value: '3'
  }
])
// 已知未知（脑出血发病时间是否明确、）
export const knownOrUnknownGroups = reactive([
  {
    label: '已知',
    value: '1'
  },
  {
    label: '未知',
    value: '2'
  }
])
// 已评未评（本次发病前mRS评分、本次入院NHSS评分、···）
export const evaluatedOrNotEvaluatedGroups = reactive([
  {
    label: '已评',
    value: '1'
  },
  {
    label: '未评',
    value: '2'
  }
])
// 吞咽功能评估
export const swallowAssessmentGroups = reactive([
  {
    label: '是',
    value: '1'
  },
  {
    label: '否',
    value: '2'
  },
  {
    label: '无法评估',
    value: '3'
  }
])
// 有无（动脉瘤1夹闭术中有无并发症、动脉瘤1介入治疗有无弹簧圈、动脉瘤1介入治疗有无支架、动脉瘤1介入治疗有无球囊、···）
export const haveOrNotGroups = reactive([
  {
    label: '有',
    value: '1'
  },
  {
    label: '无',
    value: '2'
  }
])
// 动脉瘤临床分类
export const tumorClinicalClassificationGroups = reactive([
  {
    label: '本次破裂致蛛网膜下腔出血',
    value: '1'
  },
  {
    label: '本次破裂致蛛网膜下腔出血合并脑出血',
    value: '2'
  },
  {
    label: '未破裂',
    value: '3'
  }
])
// 颈部血管检查
export const neckChestXrayGroups = reactive([
  {
    label: '颈部血管超声',
    value: '01'
  },
  {
    label: 'CTA',
    value: '02'
  },
  {
    label: 'MRA',
    value: '03'
  },
  {
    label: 'DSA',
    value: '04'
  },
  {
    label: '未查',
    value: '98'
  }
])
// 发病机制(TOAST分型)
export const mechanismOfInfectionGroups = reactive([
  {
    label: '大动脉粥样硬化型（LAA）',
    value: '1'
  },
  {
    label: '心源性栓塞型（CE）',
    value: '2'
  },
  {
    label: '小动脉闭塞型（SAA）',
    value: '3'
  },
  {
    label: '其他原因（SOE）',
    value: '4'
  },
  {
    label: '不明原因（SUE）',
    value: '5'
  }
])
// 开始静脉溶栓的场所
export const startAISLocationGroups = reactive([
  {
    label: '本地急救车',
    value: '1'
  },
  {
    label: '本院急诊科',
    value: '2'
  },
  {
    label: '本院CT室',
    value: '3'
  },
  {
    label: '本院病房',
    value: '4'
  }
])
// 静脉溶栓药物
export const AISDrugGroups = reactive([
  {
    label: 'rt-PA',
    value: '1'
  },
  {
    label: '尿激酶',
    value: '2'
  },
  {
    label: '阿尼普酶',
    value: '3'
  },
  {
    label: '瑞替普酶',
    value: '4'
  },
  {
    label: '替奈普酶',
    value: '5'
  },
  {
    label: '尿激酶原',
    value: '6'
  },
  {
    label: '其他',
    value: '9'
  }
])
// 溶栓并发症
export const AISConcomitantGroups = reactive([
  {
    label: '无症状性颅内出血',
    value: '08'
  },
  {
    label: '症状性颅内出血',
    value: '07'
  },
  {
    label: '消化道出血',
    value: '02'
  },
  {
    label: '其他部位出血',
    value: '04'
  },
  {
    label: '血管源性唇舌水肿',
    value: '06'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 已评未评死亡（溶栓后24hNIHSS评分、溶栓后7±2天NIHSS评分、术后24hNIHSS评分、术后7±2天NIHSS评分）
export const evaluatedOrNotDeathGroups = reactive([
  {
    label: '已评',
    value: '1'
  },
  {
    label: '未评',
    value: '2'
  },
  {
    label: '死亡',
    value: '3'
  }
])
// 未给予血管内治疗的原因
export const reasonForNoIntraoperativeTherapyGroups = reactive([
  {
    label: '溶栓后血管再通',
    value: '05'
  },
  {
    label: '非大血管病变',
    value: '04'
  },
  {
    label: '超时间窗',
    value: '01'
  },
  {
    label: '禁忌症',
    value: '02'
  },
  {
    label: '患者/家属拒绝',
    value: '03'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 取栓方式
export const extractionMethodGroups = reactive([
  {
    label: '桥接取栓',
    value: '1'
  },
  {
    label: '直接取栓',
    value: '2'
  },
  {
    label: '院内二次发病取栓',
    value: '3'
  }
])
// 血管内开通方法
export const intraoperativeTherapyMethodGroups = reactive([
  {
    label: '支架取栓',
    value: '01'
  },
  {
    label: '抽栓',
    value: '02'
  },
  {
    label: '球囊成形',
    value: '03'
  },
  {
    label: '支架成形',
    value: '04'
  },
  {
    label: '动脉溶栓',
    value: '05'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 术后mTICI分级结果
export const mTICIResultGroups = reactive([
  {
    label: '0级',
    value: '1'
  },
  {
    label: '1级',
    value: '2'
  },
  {
    label: '2a级',
    value: '3'
  },
  {
    label: '2b级',
    value: '4'
  },
  {
    label: '3级',
    value: '5'
  }
])
// 血管内开通治疗手术并发症
export const intraoperativeTherapyConcomitantGroups = reactive([
  {
    label: '无症状性颅内出血',
    value: '14'
  },
  {
    label: '症状性颅内出血',
    value: '15'
  },
  {
    label: '栓子逃逸',
    value: '11'
  },
  {
    label: '动脉夹层',
    value: '10'
  },
  {
    label: '支架脱载',
    value: '09'
  },
  {
    label: '再闭塞',
    value: '05'
  },
  {
    label: '再灌注损伤',
    value: '08'
  },
  {
    label: '其他',
    value: '99'
  },
  {
    label: '无',
    value: '98'
  }
])
// 未溶栓原因
export const reasonForNoAISGroups = reactive([
  {
    label: '超时间窗',
    value: '01'
  },
  {
    label: '禁忌症',
    value: '02'
  },
  {
    label: '患者/家属拒绝',
    value: '03'
  },
  {
    label: '外院溶栓',
    value: '04'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 出血部位
export const bleedingPartGroups = reactive([
  {
    label: '大脑半球',
    value: '06'
  },
  {
    label: '小脑',
    value: '03'
  },
  {
    label: '脑干',
    value: '04'
  },
  {
    label: '脑室',
    value: '05'
  }
])
// 脑出血病因诊断
export const cerebralInfectionDiagnosisGroups = reactive([
  {
    label: '高血压',
    value: '01'
  },
  {
    label: '动静脉畸形AVM',
    value: '02'
  },
  {
    label: '烟雾病',
    value: '03'
  },
  {
    label: '血管淀粉样变性',
    value: '04'
  },
  {
    label: '颅内动脉瘤',
    value: '05'
  },
  {
    label: '硬脑膜动静脉瘘',
    value: '06'
  },
  {
    label: '海绵状血管瘤',
    value: '07'
  },
  {
    label: '颅内静脉窦血栓形成',
    value: '08'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 其他影像学检查
export const otherImagingChecksGroups = reactive([
  {
    label: 'MRI',
    value: '06'
  },
  {
    label: 'CTA',
    value: '03'
  },
  {
    label: 'MRA',
    value: '04'
  },
  {
    label: 'DSA',
    value: '05'
  },
  {
    label: '未查',
    value: '98'
  }
])
// 脑出血麻醉方式
export const cerebralInfectionAnesthesiaMethodGroups = reactive([
  {
    label: '全麻',
    value: '1'
  },
  {
    label: '局麻',
    value: '2'
  }
])
// 脑出血手术方式
export const cerebralInfectionProcedureMethodGroups = reactive([
  {
    label: '开颅血肿清除术',
    value: '01'
  },
  {
    label: '内镜下血肿清除术',
    value: '05'
  },
  {
    label: '微创血肿穿刺术',
    value: '06'
  },
  {
    label: '脑室引流术',
    value: '07'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 微创血肿穿刺术类型
export const microscopicIncisionTypeGroups = reactive([
  {
    label: '立体定向框架手术',
    value: '01'
  },
  {
    label: '神经外科手术机器人手术',
    value: '02'
  },
  {
    label: '普通微创血肿穿刺术',
    value: '03'
  }
])
// 脑出血手术并发症
export const cerebralInfectionProcedureConcomitantGroups = reactive([
  {
    label: '手术部位再次脑出血',
    value: '01'
  },
  {
    label: '手术远隔部位再出血',
    value: '02'
  },
  {
    label: '脑梗死',
    value: '03'
  },
  {
    label: '继发性癫痫',
    value: '04'
  },
  {
    label: '颅内感染',
    value: '05'
  },
  {
    label: '其他',
    value: '99'
  },
  {
    label: '无',
    value: '98'
  }
])
// 抗血小板药物名称
export const antiXaBGroup = reactive([
  {
    label: '阿司匹林',
    value: '01'
  },
  {
    label: '氯吡格雷',
    value: '02'
  },
  {
    label: '奥扎格雷',
    value: '03'
  },
  {
    label: '双嘧达莫',
    value: '04'
  },
  {
    label: '塞氯吡啶',
    value: '05'
  },
  {
    label: '西洛他唑',
    value: '06'
  },
  {
    label: '替罗非班',
    value: '07'
  },
  {
    label: '吲哚布芬',
    value: '08'
  },
  {
    label: '替格瑞咯',
    value: '09'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 颅内血管检查方式
export const neckChestXrayMethodGroups = reactive([
  {
    label: 'CTA',
    value: '03'
  },
  {
    label: 'MRA',
    value: '04'
  },
  {
    label: 'DSA',
    value: '05'
  },
  {
    label: '未查',
    value: '98'
  }
])
// 动脉瘤侧别
export const tumorSideGroups = reactive([
  {
    label: '左侧',
    value: '1'
  },
  {
    label: '右侧',
    value: '2'
  }
])
// 动脉瘤部位
export const tumorPartGroups = reactive([
  {
    label: '颈内动脉ICA',
    value: '1'
  },
  {
    label: '后交通动脉PComA',
    value: '2'
  },
  {
    label: '脉络膜前动脉AChA',
    value: '3'
  },
  {
    label: '大脑前动脉ACA',
    value: '4'
  },
  {
    label: '前交通动脉AcomA',
    value: '5'
  },
  {
    label: '大脑中动脉MCA',
    value: '6'
  },
  {
    label: '基底动脉BA',
    value: '8'
  },
  {
    label: '椎动脉VA',
    value: '7'
  },
  {
    label: '大脑后动脉PCA',
    value: '9'
  },
  {
    label: '小脑前下动脉AICA',
    value: '10'
  },
  {
    label: '小脑后下动脉PICA',
    value: '11'
  },
  {
    label: '小脑上动脉SCA',
    value: '12'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 动脉瘤部位颈内动脉ICA
export const tumorICAGroups = reactive([
  {
    label: 'C1',
    value: '1'
  },
  {
    label: 'C2',
    value: '2'
  },
  {
    label: 'C3',
    value: '3'
  },
  {
    label: 'C4',
    value: '4'
  },
  {
    label: 'C5',
    value: '5'
  },
  {
    label: 'C6',
    value: '6'
  },
  {
    label: 'C7',
    value: '7'
  }
])
// 动脉瘤部位大脑前动脉ACA
export const tumorACAGroups = reactive([
  {
    label: 'A1',
    value: '1'
  },
  {
    label: 'A2',
    value: '2'
  },
  {
    label: 'A3',
    value: '3'
  },
  {
    label: 'A4',
    value: '4'
  },
  {
    label: 'A5',
    value: '5'
  }
])
// 动脉瘤部位大脑中动脉MCA
export const tumorMCAGroups = reactive([
  {
    label: 'M1',
    value: '1'
  },
  {
    label: 'M2',
    value: '2'
  },
  {
    label: 'M3',
    value: '3'
  },
  {
    label: 'M4',
    value: '4'
  },
  {
    label: 'M5',
    value: '5'
  },
  {
    label: '大脑中动脉M2分叉处',
    value: '6'
  }
])
// 动脉瘤部位椎动脉VA
export const tumorVAGroups = reactive([
  {
    label: 'V1',
    value: '1'
  },
  {
    label: 'V2',
    value: '2'
  },
  {
    label: 'V3',
    value: '3'
  },
  {
    label: 'V4',
    value: '4'
  },
  {
    label: 'V5',
    value: '5'
  }
])
// 动脉瘤部位基底动脉BA
export const tumorBAGroups = reactive([
  {
    label: 'BA-顶端',
    value: '1'
  },
  {
    label: 'BA-主干',
    value: '2'
  }
])
// 动脉瘤部位大脑后动脉PCA
export const tumorPCAGroups = reactive([
  {
    label: 'P1',
    value: '1'
  },
  {
    label: 'P2',
    value: '2'
  },
  {
    label: 'P3',
    value: '3'
  },
  {
    label: 'P4',
    value: '4'
  }
])
// 动脉瘤类型
export const tumorTypeGroups = reactive([
  {
    label: '梭形',
    value: '1'
  },
  {
    label: '囊状',
    value: '2'
  },
  {
    label: '夹层',
    value: '3'
  },
  {
    label: '假性动脉瘤',
    value: '4'
  }
])
// 动脉瘤手术类型
export const tumorSurgeryTypeGroups = reactive([
  {
    label: '血管内介入治疗',
    value: '04'
  },
  {
    label: '夹闭术',
    value: '02'
  },
  {
    label: '复合手术',
    value: '03'
  }
])
// 动脉瘤治疗结果
export const tumorTreatmentResultGroups = reactive([
  {
    label: '完全闭塞',
    value: '1'
  },
  {
    label: '瘤颈残留',
    value: '2'
  },
  {
    label: '部分瘤体残留',
    value: '3'
  },
  {
    label: '瘤体残留',
    value: '4'
  }
])
// 动脉瘤夹闭术夹闭后载瘤动脉情况
export const tumorClosureAfterLoadGroups = reactive([
  {
    label: '通畅',
    value: '1'
  },
  {
    label: '轻度狭窄（<50%）',
    value: '2'
  },
  {
    label: '严重狭窄（>50%）',
    value: '3'
  },
  {
    label: '完全闭塞',
    value: '4'
  }
])
// 动脉瘤夹闭术中并发症
export const tumorClosureConcomitantGroups = reactive([
  {
    label: '载瘤动脉闭塞',
    value: '01'
  },
  {
    label: '术中动脉瘤破裂',
    value: '02'
  },
  {
    label: '动脉瘤附近穿支血管闭塞',
    value: '03'
  },
  {
    label: '脑挫裂伤',
    value: '04'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 动脉瘤介入治疗其他栓塞材料
export const tumorIntraoperativeOtherMaterialGroups = reactive([
  {
    label: 'Glubran',
    value: '01'
  },
  {
    label: 'Onyx',
    value: '02'
  },
  {
    label: '其他',
    value: '99'
  },
  {
    label: '无',
    value: '98'
  }
])
// 动脉瘤介入后载瘤动脉情况
export const tumorIntraoperativeAfterLoadGroups = reactive([
  {
    label: '无弹簧圈突出',
    value: '1'
  },
  {
    label: '有弹簧圈突出',
    value: '2'
  },
  {
    label: '载瘤动脉闭塞',
    value: '3'
  }
])
// 动脉瘤栓塞术过程中并发症
export const tumorIncisionConcomitantGroups = reactive([
  {
    label: '急性血栓形成',
    value: '1'
  },
  {
    label: '动脉瘤破裂',
    value: '2'
  },
  {
    label: '动脉瘤附近穿支血管闭塞',
    value: '3'
  },
  {
    label: '动脉夹层',
    value: '4'
  },
  {
    label: '穿刺部位并发症',
    value: '5'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 动脉瘤栓塞术过程中急性血栓形成部位
export const tumorIncisionEmergencyGroups = reactive([
  {
    label: '动脉瘤颈附近',
    value: '01'
  },
  {
    label: '载瘤动脉瘤颈以远',
    value: '02'
  },
  {
    label: '载瘤动脉瘤颈近心端',
    value: '03'
  },
  {
    label: '非载瘤动脉流域的血管',
    value: '04'
  }
])
// CEA/CAS手术部位
export const CEAorCASProcedurePartGroups = reactive([
  {
    label: 'LICA',
    value: '01'
  },
  {
    label: 'RICA',
    value: '02'
  }
])
// CEA/CAS手术实施的监测手段
export const CEAorCASMonitoringMethodGroups = reactive([
  {
    label: 'TCD',
    value: '01'
  },
  {
    label: '其他',
    value: '99'
  }
])
// CEA/CAS手术采取方式
export const CEAorCASProcedureMethodGroups = reactive([
  {
    label: '标准式CEA',
    value: '1'
  },
  {
    label: '外翻式CEA',
    value: '2'
  },
  {
    label: 'CAS',
    value: '3'
  },
  {
    label: '复合手术',
    value: '4'
  }
])
// CEA手术并发症
export const CEAProcedureConcomitantGroups = reactive([
  {
    label: '手术相关性脑梗死',
    value: '06'
  }, {
    label: '脑出血',
    value: '07'
  },
  {
    label: '其他',
    value: '99'
  },
  {
    label: '无',
    value: '98'
  }
])
// CAS手术并发症
export const CASProcedureConcomitantGroups = reactive([
  {
    label: '手术相关性脑梗死',
    value: '06'
  }, {
    label: '脑出血',
    value: '07'
  },
  {
    label: '其他',
    value: '99'
  },
  {
    label: '无',
    value: '98'
  }
])
// 康复治疗场所
export const rehabilitationLocationGroups = reactive([
  {
    label: '床旁',
    value: '1'
  },
  {
    label: '康复科',
    value: '2'
  }
])
// 死亡原因
export const deathReasonGroups = reactive([
  {
    label: '呼吸循环衰竭',
    value: '01'
  },
  {
    label: '脑血管病',
    value: '02'
  },
  {
    label: '肺部感染',
    value: '03'
  },
  {
    label: '上消化道出血',
    value: '04'
  },
  {
    label: '急性肾功能衰竭',
    value: '05'
  },
  {
    label: '损伤和中毒',
    value: '06'
  },
  {
    label: '不详',
    value: '98'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 出院用药
export const dischargeDrugGroups = reactive([
  {
    label: '降压药',
    value: '01'
  },
  {
    label: '降糖药',
    value: '02'
  },
  {
    label: '降脂药',
    value: '03'
  },
  {
    label: '抗凝药',
    value: '04'
  },
  {
    label: '抗血小板药',
    value: '05'
  },
  {
    label: '中药治疗',
    value: '06'
  },
  {
    label: '抗血管痉挛药',
    value: '07'
  },
  {
    label: '其他',
    value: '99'
  },
  {
    label: '无',
    value: '98'
  }
])
// 烟雾病临床表现类型
export const smokingClinicalTypeGroups = reactive([
  {
    label: 'TIA',
    value: '01'
  },
  {
    label: '脑梗塞',
    value: '02'
  },
  {
    label: '脑出血',
    value: '03'
  },
  {
    label: '蛛网膜下腔出血',
    value: '04'
  },
  {
    label: '头痛',
    value: '05'
  },
  {
    label: '癫痫发作',
    value: '06'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 烟雾状血管侧别
export const smokingChestSideGroups = reactive([
  {
    label: '左侧',
    value: '1'
  },
  {
    label: '右侧',
    value: '2'
  },
  {
    label: '双侧',
    value: '3'
  }
])
// 烟雾状血管位置(左侧烟雾状血管位置、右侧烟雾状血管位置)
export const smokingChestLocationGroups = reactive([
  {
    label: '大脑前动脉ACA',
    value: '01'
  },
  {
    label: '大脑中动脉MCA',
    value: '02'
  },
  {
    label: '大脑后动脉PCA',
    value: '03'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 烟雾病治疗方式(烟雾病左侧治疗方式、烟雾病右侧治疗方式)
export const smokingTreatmentMethodGroups = reactive([
  {
    label: 'STA/MCA搭桥',
    value: '01'
  },
  {
    label: 'STA贴敷',
    value: '02'
  },
  {
    label: '颞肌贴敷',
    value: '03'
  },
  {
    label: '硬脑膜贴敷',
    value: '04'
  },
  {
    label: '其他',
    value: '99'
  }
])
// 烟雾病手术治疗并发症
export const smokingProcedureConcomitantGroups = reactive([
  {
    label: '出血',
    value: '01'
  },
  {
    label: '栓塞',
    value: '02'
  },
  {
    label: '继发性癫痫',
    value: '03'
  },
  {
    label: '感染',
    value: '04'
  },
  {
    label: '其他',
    value: '99'
  },
  {
    label: '无',
    value: '98'
  }
])
// AVM类型
export const AVMTypeGroups = reactive([
  {
    label: '脑实质AVM',
    value: '1'
  },
  {
    label: '脑膜脑AVM',
    value: '2'
  }
])
// AVM大小
export const AVMSizeGroups = reactive([
  {
    label: '小于3cm',
    value: '01'
  },
  {
    label: '3-6cm',
    value: '02'
  },
  {
    label: '大于6cm',
    value: '03'
  }
])
// AVM部位特征
export const AVMFeatureGroups = reactive([
  {
    label: '大脑非功能区',
    value: '1'
  },
  {
    label: '大脑功能区',
    value: '2'
  }
])
// 静脉引流位置
export const AISFlowLocationGroups = reactive([
  {
    label: '浅表部',
    value: '1'
  },
  {
    label: '深部',
    value: '2'
  }
])
// AVM治疗策略
export const AVMTreatmentStrategyGroups = reactive([
  {
    label: '栓塞术',
    value: '01'
  },
  {
    label: '血肿清除术',
    value: '02'
  },
  {
    label: 'AVM切除术',
    value: '03'
  },
  {
    label: '放射外科手术',
    value: '04'
  },
  {
    label: '复合手术',
    value: '05'
  }
])
// AVM治疗并发症
export const AVMTreatmentConcomitantGroups = reactive([
  {
    label: '颅内出血',
    value: '01'
  },
  {
    label: '脑梗死',
    value: '02'
  },
  {
    label: '其他',
    value: '99'
  },
  {
    label: '无',
    value: '98'
  }
])
// AVM责任病灶位置
export const AVMResponsibleLesionLocationGroups = reactive([
  {
    label: '额叶',
    value: '01'
  },
  {
    label: '顶叶',
    value: '02'
  },
  {
    label: '颞叶',
    value: '03'
  },
  {
    label: '枕叶',
    value: '04'
  },
  {
    label: '小脑',
    value: '05'
  },
  {
    label: '深部',
    value: '06'
  }
])
// AVM中线部位责任病灶位置
export const AVMCentralLineLesionLocationGroups = reactive([
  {
    label: '脑干',
    value: '01'
  },
  {
    label: '胼胝体',
    value: '02'
  },
  {
    label: '其他',
    value: '99'
  }
])

// 发病至门急诊时间
export const onsetToAdmissionTimeGroups = reactive([
  {
    label: '4.5小时以内',
    value: '4'
  },
  {
    label: '4.5小时至24小时以内',
    value: '5'
  },
  {
    label: '24小时至14天以内',
    value: '6'
  },
  {
    label: '超过14天',
    value: '3'
  }
])
// 脑出血手术并发症其他
export const brainInjuryOtherConcomitantGroups = reactive([
  {
    label: '坠积性肺炎',
    value: '01'
  },
  {
    label: '下肢深静脉血栓',
    value: '02'
  }
])
