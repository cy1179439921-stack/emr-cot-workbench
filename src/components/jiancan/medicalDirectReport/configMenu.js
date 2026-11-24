
import { markRaw, reactive, ref } from 'vue'
// import { ElMessage } from 'element-plus'
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import diagnosis from '@/components/jiancan/medicalDirectReport/component/diagnosis.vue'
import surgicalRecord from '@/components/jiancan/medicalDirectReport/component/surgicalRecord.vue'
import admissionSituation from '@/components/jiancan/medicalDirectReport/component/admissionSituation.vue'
import physicalExamination from '@/components/jiancan/medicalDirectReport/component/physicalExamination.vue'
import AIS from '@/components/jiancan/medicalDirectReport/component/AIS.vue'
import intraoperativeTherapy from '@/components/jiancan/medicalDirectReport/component/intraoperativeTherapy.vue'
import cerebralInfarction from '@/components/jiancan/medicalDirectReport/component/cerebralInfarction.vue'
import dischargeCondition from '@/components/jiancan/medicalDirectReport/component/dischargeCondition.vue'
import smoke from '@/components/jiancan/medicalDirectReport/component/smoke.vue'
import AVM from '@/components/jiancan/medicalDirectReport/component/AVM.vue'
import aneurysm from '@/components/jiancan/medicalDirectReport/component/aneurysm.vue'
import patientInfo from '@/components/jiancan/medicalDirectReport/component/patientInfo.vue'
import hospitalizationInfo from '@/components/jiancan/medicalDirectReport/component/hospitalizationInfo.vue'
import mainDiagnosis from '@/components/jiancan/medicalDirectReport/component/mainDiagnosis.vue'
import treatment from '@/components/jiancan/medicalDirectReport/component/treatment.vue'
import mainDiagno from '@/components/jiancan/medicalDirectReport/component/mainDiagno.vue'
import recoveryTreatment from '@/components/jiancan/medicalDirectReport/component/recoveryTreatment.vue'
import {
  sexGroups, nationGroups, medicalPayGroups, intraoperativeTherapyMethodGroups, admissionWayGroups, dischargeWayGroups, treatmentTypeGroups, yesOrNoGroups, cerebralInfractionTimeGroups, knownOrUnknownGroups, evaluatedOrNotEvaluatedGroups,
  swallowAssessmentGroups, tumorClinicalClassificationGroups, haveOrNotGroups, mechanismOfInfectionGroups, neckChestXrayGroups, startAISLocationGroups, AISDrugGroups, AISConcomitantGroups,
  evaluatedOrNotDeathGroups, reasonForNoIntraoperativeTherapyGroups, extractionMethodGroups, reasonForNoAISGroups, mTICIResultGroups, intraoperativeTherapyConcomitantGroups, onsetToAdmissionTimeGroups,
  bleedingPartGroups, cerebralInfectionDiagnosisGroups, otherImagingChecksGroups, cerebralInfectionAnesthesiaMethodGroups, cerebralInfectionProcedureMethodGroups, microscopicIncisionTypeGroups,
  cerebralInfectionProcedureConcomitantGroups, antiXaBGroup, CEAorCASProcedurePartGroups, CEAProcedureConcomitantGroups, CASProcedureConcomitantGroups, CEAorCASProcedureMethodGroups, CEAorCASMonitoringMethodGroups,
  deathReasonGroups, dischargeDrugGroups, smokingClinicalTypeGroups, smokingChestSideGroups, smokingChestLocationGroups, smokingTreatmentMethodGroups, smokingProcedureConcomitantGroups,
  AVMTypeGroups, AVMSizeGroups, AVMFeatureGroups, AISFlowLocationGroups, AVMTreatmentStrategyGroups, AVMTreatmentConcomitantGroups, AVMResponsibleLesionLocationGroups, AVMCentralLineLesionLocationGroups,
  neckChestXrayMethodGroups, tumorSideGroups, tumorPartGroups, tumorICAGroups, tumorACAGroups, tumorMCAGroups, tumorVAGroups, tumorBAGroups, tumorPCAGroups, tumorTypeGroups, tumorSurgeryTypeGroups, tumorTreatmentResultGroups,
  tumorClosureAfterLoadGroups, tumorClosureConcomitantGroups, tumorIntraoperativeOtherMaterialGroups, tumorIntraoperativeAfterLoadGroups, tumorIncisionConcomitantGroups, tumorIncisionEmergencyGroups, brainInjuryOtherConcomitantGroups
} from '@/utils/enumGroups3'
import _ from 'lodash'
import dayjs from 'dayjs'
export const diseaseOptions = ref([
  { id: '01', name: 'AIS静脉溶栓' },
  { id: '02', name: 'AIS介入再通' },
  { id: '03', name: '脑出血手术' },
  { id: '04', name: '颅内动脉瘤手术' },
  { id: '05', name: 'CEA/CAS' }
])

let formData = reactive({})
const formRef = ref(null)
export const errorCollector = ref({}) // 错误收集器
// 错误收集器处理函数
export const errorCollectorHandler = (name, errorMsg, type = 'add') => {
  switch (type) {
    case 'add':
      // 新增错误
      if (!Object.hasOwnProperty.call(errorCollector.value, name)) {
        errorCollector.value[name] = []
      }
      // 如果错误消息不存在，则新增
      if (!errorCollector.value[name]?.includes(errorMsg)) {
        errorCollector.value[name].push(errorMsg)
      }
      break
    case 'del':
      // 删除错误
      if (Object.hasOwnProperty.call(errorCollector.value, name)) {
        errorCollector.value[name] = errorCollector.value[name].filter(item => item !== errorMsg)
        // 如果错误消息数组为空，则删除
        if (errorCollector.value[name].length === 0) {
          delete errorCollector.value[name]
        }
      }
      break
  }
}
// 错误收集器清空函数
export const clearErrorCollector = () => {
  errorCollector.value = {}
}
export const useModuleSetting = (data, refDom) => { // 接收数据和dom
  formData = data
  formRef.value = refDom
}

// 患者信息
export const patientInfoModule = {
  lable: '患者信息',
  restrict: 'all',
  value: [
    {
      lable: '患者姓名',
      name: '患者姓名',
      component: 'el-input',
      rules: [{ required: true, message: '患者姓名为必填项', trigger: 'change' }, { max: 20 }, {
        validator: (rule, value, callback) => {
          if (/^[\u4e00-\u9fa5]+$/.test(value) === false) {
            callback(new Error('请填写中文'))
          } else {
            // 校验通过
            callback()
          }
        },
        trigger: 'change'
      }],
      column: 6
    },
    {
      lable: '年龄',
      name: '年龄',
      component: 'el-input',
      precision: 0,
      rules: [{ required: true, message: '年龄为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 150) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('请填写0-150的年龄合理区间范围'))
          } else {
            callback()
          }
        }
      }],
      column: 6
    },
    { lable: '民族', name: '民族', component: 'el-select', rules: { required: true, message: '民族为必填项', trigger: 'change' }, enums: nationGroups, column: 6 },
    {
      lable: '出生日期',
      name: '出生日期',
      component: 'el-date-picker',
      minute: true,
      rules: [{ required: true, message: '出生日期为必填项', trigger: 'change' }, {
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }],
      type: 'date',
      format: 'YYYY-MM-DD',
      column: 6
    },
    {
      lable: '身份证号',
      name: '身份证号',
      component: 'el-input',
      rules: [{ required: true, message: '身份证号为必填项', trigger: 'change' }, { max: 18, message: '请填写正确的身份证号', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          // 校验只能输入15位或者18位的数字
          const _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/
          // 校验身份证：
          if (isValid18DigitIdCard(value) || _IDre15.test(value)) {
            // 校验通过
            callback()
          } else {
            callback(new Error('请填写正确的身份证号'))
          }
        }
      }],
      column: 6
    },
    { lable: '性别', name: '性别', component: 'el-select', rules: { required: true, message: '性别为必填项', trigger: 'change' }, enums: sexGroups, column: 6 },
    {
      lable: '联系人姓名',
      name: '联系人姓名',
      component: 'el-input',
      rules: [{ required: true, message: '联系人姓名为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          if (/^[\u4e00-\u9fa5]+$/.test(value) === false) {
            callback(new Error('请填写中文'))
          } else {
          // 校验通过
            callback()
          }
        },
        trigger: 'change'
      }],
      column: 6
    },
    {
      lable: '联系人电话',
      name: '联系人电话',
      component: 'el-input',
      rules: [{
        validator: (rule, value, callback) => {
          const moblie = /^1(3|4|5|6|7|8|9)\d{9}$/
          const tel = /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/
          if (!value || (value && (moblie.test(value) || tel.test(value)))) {
            callback()
          } else {
            callback(new Error('请填写正确合规的手机号码或座机号码（区号-座机号码）'))
          }
        }
      }],
      column: 6
    },
    { lable: '主要医疗付费方式', name: '主要医疗付费方式', component: 'el-select', rules: { required: true, message: '主要医疗付费方式为必填项', trigger: 'change' }, enums: medicalPayGroups, column: 6 }
  ],
  component: markRaw(patientInfo)
}

// 入出院信息
export const hospitalizationInfoModule = {
  lable: '入出院信息',
  restrict: 'all',
  value: [
    {
      lable: '住院号',
      name: '住院号',
      component: 'el-input',
      trim: true,
      rules: [{ required: true, message: '住院号为必填项', trigger: 'blur' }, { max: 50 }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if ((isNaN(numericValue) && !_.isNil(value)) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('只能输入数字'))
          } else {
            callback()
          }
        }
      }],
      column: 6
    },
    { lable: '入院途径', name: '入院途径', component: 'el-select', rules: { required: true, message: '入院途径为必填项', trigger: 'change' }, enums: admissionWayGroups, column: 6 },
    { lable: '发病至门急诊时间', name: '发病至门急诊时间', component: 'el-select', enums: onsetToAdmissionTimeGroups, column: 6 },
    {
      lable: '住院日期',
      name: '住院日期',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '住院日期为必填项', trigger: 'change' }],
      column: 6
    },
    {
      lable: '出院日期',
      name: '出院日期',
      component: 'el-date-picker',
      type: 'date',
      format: 'YYYY-MM-DD',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '出院日期为必填项', trigger: 'change' }],
      column: 6
    },
    {
      lable: '住院天数',
      name: '住院天数',
      component: 'el-input-number',
      precision: 1,
      rules: [{ required: true, message: '住院天数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if ((isNaN(numericValue) && !_.isNil(value)) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('只能输入数字'))
          } else {
            callback()
          }
        }
      }],
      column: 6
    },
    { lable: '离院方式', name: '离院方式', component: 'el-select', rules: { required: true, message: '离院方式为必填项', trigger: 'change' }, enums: dischargeWayGroups, column: 6 },
    {
      lable: '住院总费用',
      name: '住院总费用',
      component: 'el-input-number',
      precision: 2,
      rules: [{ required: true, message: '住院总费用为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if ((isNaN(numericValue) && !_.isNil(value)) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('只能输入数字'))
          } else {
            callback()
          }
        }
      }],
      column: 6
    }
  ],
  component: markRaw(hospitalizationInfo)
}

// 病案首页中的出院主要诊断
export const mainDiagnoModule = {
  lable: '病案首页中的出院主要诊断',
  restrict: 'all',
  value:
    [
      { lable: '主要诊断名称', name: '主要诊断名称', component: 'slot', rules: { required: true, message: '主要诊断名称为必填项', trigger: 'change' }, column: 6 },
      { lable: '主要诊断编码', name: '主要诊断编码', component: 'slot', rules: { required: true, message: '主要诊断编码为必填项', trigger: 'change' }, column: 6 }],
  component: markRaw(mainDiagno)
}
// 出院其他诊断（病案首页中原始信息）
export const otherDiagnosisOfDischargeModule = {
  lable: '出院其他诊断（病案首页中原始信息）',
  restrict: 'all',
  value: [
    {
      lable: '其他诊断数量',
      name: '其他诊断数量',
      component: 'slot',
      hidden: true,
      column: 24,
      children: [
        {
          lable: '其他诊断名称',
          name: '其他诊断名称',
          component: 'el-input',
          column: 6,
          rules: [{
            validator: (rule, value, callback) => {
              validate(rule, callback)
            },
            trigger: 'change'
          }]
        },
        {
          lable: '其他诊断编码',
          name: '其他诊断编码',
          component: 'el-input',
          column: 6,
          rules: [{
            validator: (rule, value, callback) => {
              validate(rule, callback)
            },
            trigger: 'change'
          }]
        }
      ]
    }
  ],
  component: markRaw(diagnosis)
}

// 手术记录（病案首页中原始信息）
export const operationRecord = {
  lable: '手术记录（病案首页中原始信息）',
  restrict: 'all',
  value: [
    {
      lable: '手术记录数量',
      name: '手术记录数量',
      component: 'slot',
      hidden: true,
      column: 24,
      children: [
        {
          lable: '手术及操作名称',
          name: '手术及操作名称',
          component: 'el-input',
          column: 6,
          rules: [{
            validator: (rule, value, callback) => {
              validate(rule, callback)
            },
            trigger: 'change'
          }]
        },
        {
          lable: '手术及操作编码',
          name: '手术及操作编码',
          component: 'el-input',
          column: 6,
          rules: [{
            validator: (rule, value, callback) => {
              validate(rule, callback)
            },
            trigger: 'change'
          }]
        },
        {
          lable: '手术日期',
          name: '手术日期',
          component: 'el-date-picker',
          minute: true,
          type: 'date',
          format: 'YYYY-MM-DD',
          column: 6,
          rules: [{
            type: 'date',
            message: '请填写正确的日期格式',
            trigger: 'change'
          }, {
            validator: (rule, value, callback) => {
              if (!dayjs(value, 'YYYY-MM-DD', true).isValid() && value) {
                callback(new Error('请填写正确的日期格式'))
                return
              }
              validate(rule, callback)
            },
            trigger: 'change'
          }]
        }
      ]
    }
  ],
  component: markRaw(surgicalRecord)
}

// 治疗类型
export const treatmentTypeModule = {
  lable: '治疗类型',
  restrict: 'all',
  value: [
    {
      lable: '治疗类型',
      name: '治疗类型',
      component: 'slot',
      isMultiple: true,
      maxTags: 5,
      rules: {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      },
      enums: treatmentTypeGroups,
      column: 12
    }
  ],
  component: markRaw(treatment)
}

// 入院情况
export const admissionConditionModule = {
  lable: '入院情况',
  restrict: 'all',
  value: [
    {
      lable: '脑梗死发病是否在院',
      name: '脑梗死发病是否在院',
      component: 'el-select',
      rules: [{ required: true, message: '脑梗死发病是否在院为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }],
      enums: yesOrNoGroups,
      column: 6,
      restrict: ['01', '02']
    },
    {
      lable: '脑梗死患者到院时间',
      name: '脑梗死患者到院时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '脑梗死患者到院时间为必填项', trigger: 'change' }],
      column: 6,
      restrict: ['01', '02']
    },
    {
      lable: '脑梗死发病时间是否明确',
      name: '脑梗死发病时间是否明确',
      component: 'el-select',
      rules: [{ required: true, message: '脑梗死发病时间是否明确为必填项', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            validate(rule, callback)
          },
          trigger: 'change'
        }
      ],
      enums: cerebralInfractionTimeGroups,
      column: 6,
      restrict: ['01', '02']
    },
    {
      lable: '脑梗死患者发病时间',
      name: '脑梗死患者发病时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '脑梗死患者发病时间为必填项', trigger: 'change' }],
      column: 6,
      restrict: ['01', '02'],
      judgment: {
        type: '!string',
        conditions: '脑梗死发病时间是否明确',
        value: '2' // 基底动脉BA  前交通动脉AcomA
      }
    },
    {
      lable: '脑出血发病是否在院',
      name: '脑出血发病是否在院',
      component: 'el-select',
      rules: [{ required: true, message: '脑出血发病是否在院为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }],
      enums: yesOrNoGroups,
      column: 6,
      restrict: ['03']
    },
    {
      lable: '脑出血患者到院时间',
      name: '脑出血患者到院时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '脑出血患者到院时间为必填项', trigger: 'change' }],
      column: 6,
      restrict: ['03']
    },
    {
      lable: '脑出血发病时间是否明确',
      name: '脑出血发病时间是否明确',
      component: 'el-select',
      rules: [{ required: true, message: '脑出血发病时间是否明确为必填项', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            validate(rule, callback)
          },
          trigger: 'change'
        }
      ],
      enums: knownOrUnknownGroups,
      column: 6,
      restrict: ['03']
    },
    {
      lable: '脑出血患者发病时间',
      name: '脑出血患者发病时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '脑出血患者发病时间为必填项', trigger: 'change' }],
      column: 6,
      restrict: ['03'],
      judgment: {
        type: 'string',
        conditions: '脑出血发病时间是否明确',
        value: '1'
      }
    },
    { lable: '本次发病前mRS评分', name: '本次发病前mRS评分', component: 'el-select', rules: { required: true, message: '本次发病前mRS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotEvaluatedGroups, column: 6, restrict: ['01', '02', '03', '04', '05'] },
    {
      lable: '本次发病前mRS评分分数',
      name: '本次发病前mRS评分分数',
      component: 'el-input',
      unit: '分',
      precision: 0,
      rules: [{ required: true, message: '本次发病前mRS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 6) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤6'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '本次发病前mRS评分',
        value: '1'
      }
    },
    { lable: '本次入院NIHSS评分', name: '本次入院NIHSS评分', component: 'el-select', rules: { required: true, message: '本次入院NIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotEvaluatedGroups, column: 6, restrict: ['05'] },
    {
      lable: '本次入院NIHSS评分分数',
      name: '本次入院NIHSS评分分数',
      component: 'el-input',
      unit: '分',
      precision: 0,
      rules: [{ required: true, message: '本次入院NIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '本次入院NIHSS评分',
        value: '1'
      }
    },
    { lable: '是否进行吞咽功能评估（洼田饮水试验）', name: '是否进行吞咽功能评估（洼田饮水试验）', component: 'el-select', rules: { required: true, message: '是否进行吞咽功能评估（洼田饮水试验）为必填项', trigger: 'change' }, enums: swallowAssessmentGroups, column: 6, restrict: ['01', '02'] },
    {
      lable: '是否脑疝',
      name: '是否脑疝',
      component: 'slot',
      rules: { required: true, message: '是否脑疝为必填项', trigger: 'change' },
      enums: yesOrNoGroups,
      column: 6,
      restrict: ['03', '04'],
      judgment: {
        type: '!string',
        conditions: '动脉瘤临床分类',
        value: '3'
      }
    },
    {
      lable: '入院GCS评分',
      name: '入院GCS评分',
      component: 'slot',
      rules: { required: true, message: '入院GCS评分为必填项', trigger: 'change' },
      enums: evaluatedOrNotEvaluatedGroups,
      column: 6,
      restrict: ['03', '04'],
      judgment: {
        type: '!string',
        conditions: '动脉瘤临床分类',
        value: '3'
      }
    }, {
      lable: '入院GCS评分分数',
      name: '入院GCS评分分数',
      component: 'el-input',
      unit: '分',
      precision: 0,
      rules: [{ required: true, message: '入院GCS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 3 || numericValue > 15) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围3≤n≤15'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '入院GCS评分',
        value: '1'
      }
    },
    {
      lable: '有无既往动脉瘤破裂史',
      name: '有无既往动脉瘤破裂史',
      component: 'el-select',
      rules: { required: true, message: '有无既往动脉瘤破裂史为必填项', trigger: 'change' },
      enums: haveOrNotGroups,
      column: 6,
      restrict: ['04']
    },
    { lable: '动脉瘤临床分类', name: '动脉瘤临床分类', component: 'el-select', rules: { required: true, message: '动脉瘤临床分类为必填项', trigger: 'change' }, enums: tumorClinicalClassificationGroups, column: 6, restrict: ['04'] },
    {
      lable: '动脉瘤发病时间',
      name: '动脉瘤发病时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      column: 6,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '动脉瘤发病时间为必填项', trigger: 'change' }],
      restrict: ['04'],
      judgment: {
        type: '!string',
        conditions: '动脉瘤临床分类',
        value: '3'
      }
    },
    {
      lable: 'Hunt-Hess分级',
      name: 'Hunt-Hess分级',
      component: 'el-select',
      rules: { required: true, message: 'Hunt-Hess分级为必填项', trigger: 'change' },
      enums: evaluatedOrNotEvaluatedGroups,
      column: 6,
      judgment: {
        type: '!string',
        conditions: '动脉瘤临床分类',
        value: '3'
      }
    }, {
      lable: 'Hunt-Hess分级级别',
      name: 'Hunt-Hess分级级别',
      component: 'el-input',
      unit: '级',
      precision: 0,
      rules: [{ required: true, message: 'Hunt-Hess分级级别为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 5) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤5'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: 'Hunt-Hess分级',
        value: '1'
      }
    },
    {
      lable: 'Fisher分级',
      name: 'Fisher分级',
      component: 'el-select',
      rules: { required: true, message: 'Fisher分级为必填项', trigger: 'change' },
      enums: evaluatedOrNotEvaluatedGroups,
      column: 6,
      judgment: {
        type: '!string',
        conditions: '动脉瘤临床分类',
        value: '3'
      }
    }, {
      lable: 'Fisher分级级别',
      name: 'Fisher分级级别',
      component: 'el-input',
      precision: 0,
      unit: '级',
      rules: [{ required: true, message: 'Fisher分级级别为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 4) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤4'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: 'Fisher分级',
        value: '1'
      }
    },
    {
      lable: '是否尼莫地平预防血管痉挛治疗',
      name: '是否尼莫地平预防血管痉挛治疗',
      component: 'el-select',
      rules: { required: true, message: '是否尼莫地平预防血管痉挛治疗为必填项', trigger: 'change' },
      enums: yesOrNoGroups,
      column: 6,
      judgment: {
        type: '!string',
        conditions: '动脉瘤临床分类',
        value: '3'
      }
    },
    {
      lable: '颈动脉狭窄或闭塞是否有症状(缺血或脑梗死症状)',
      name: '颈动脉狭窄或闭塞是否有症状（缺血或脑梗死症状）',
      component: 'el-select',
      rules: { required: true, message: '颈动脉狭窄或闭塞是否有症状（缺血或脑梗死症状）为必填项', trigger: 'change' },
      enums: haveOrNotGroups,
      column: 12,
      restrict: ['05']
    },
    {
      lable: '颈部血管检查',
      name: '颈部血管检查',
      component: 'el-select',
      disabledText: '98',
      rules: { required: true, message: '颈部血管检查为必填项', trigger: 'change' },
      enums: neckChestXrayGroups,
      column: 6,
      isMultiple: true, // 多选
      restrict: ['05']
    }
  ],
  component: markRaw(admissionSituation)
}

// 体格检查
export const physicalExaminationModule = {
  lable: '体格检查',
  restrict: ['01', '02', '03', '04', '05'],
  value: [
    {
      lable: '入院后首次收缩压',
      name: '入院后首次收缩压',
      component: 'el-input',
      precision: 0,
      unit: 'mmHg',
      rules: [{
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'blur'
      }, {
        required: true,
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (!value && value !== 0) {
            callback(new Error('入院后首次收缩压为必填项'))
          }

          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 40 || numericValue > 260) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围40≤n≤260'))
          } else {
            callback()
          }
        }
      }],
      column: 6
    },
    {
      lable: '入院后首次舒张压',
      name: '入院后首次舒张压',
      unit: 'mmHg',
      component: 'el-input',
      precision: 0,
      rules: [{
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'blur'
      }, {
        required: true,
        validator: (rule, value, callback) => {
          const numericValue = Number(value)

          if (!value && value !== 0) {
            callback(new Error('入院后首次舒张压为必填项'))
          }
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 40 || numericValue > 260) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围40≤n≤260'))
          } else {
            callback()
          }
        }
      }],
      column: 6
    }
  ],
  component: markRaw(physicalExamination)
}

// TOAST分型
export const TOASTModule = {
  lable: 'TOAST分型',
  restrict: ['01', '02'],
  value: [
    {
      lable: '发病机制（TOAST分型）',
      name: '发病机制（TOAST分型）',
      component: 'el-select',
      rules: { required: true, message: '发病机制（TOAST分型）为必填项', trigger: 'change' },
      enums: mechanismOfInfectionGroups,
      column: 6,
      restrict: ['01', '02']
    }, {
      lable: '是否烟雾病',
      name: '是否烟雾病',
      component: 'el-select',
      rules: { required: true, message: '是否烟雾病为必填项', trigger: 'change' },
      enums: yesOrNoGroups,
      column: 6,
      judgment: {
        type: 'string',
        conditions: '发病机制（TOAST分型）',
        value: '4'
      }
    }
  ],
  component: markRaw(universalModule)
}

// AIS静脉溶栓
export const AISModule = {
  lable: 'AIS静脉溶栓',
  restrict: ['01'],
  value: [
    { lable: '溶栓前NIHSS评分', name: '溶栓前NIHSS评分', component: 'el-select', rules: { required: true, message: '溶栓前NIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotEvaluatedGroups, column: 6 },
    {
      lable: '溶栓前NIHSS评分分数',
      name: '溶栓前NIHSS评分分数',
      component: 'el-input',
      unit: '分',
      precision: 0,
      rules: [{ required: true, message: '溶栓前NIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '溶栓前NIHSS评分',
        value: '1'
      }
    },
    { lable: '开始静脉溶栓的场所', name: '开始静脉溶栓的场所', component: 'el-select', rules: { required: true, message: '开始静脉溶栓的场所为必填项', trigger: 'change' }, enums: startAISLocationGroups, column: 6 },
    {
      lable: '开始静脉溶栓时间',
      name: '开始静脉溶栓时间',
      component: 'el-date-picker',
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '开始静脉溶栓时间为必填项', trigger: 'change' }],
      minute: true,
      format: 'YYYY-MM-DD HH:mm',
      column: 6
    },
    {
      lable: 'ONT时间',
      name: 'ONT时间',
      unit: '分',
      component: 'el-input',
      hideUnitValue: '不详',
      disabled: true,
      rules: [{ required: true, message: 'ONT时间为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) && value !== '不详') {
            callback(new Error('当发病时间未知或未填写时，ONT记为不详'))
          } else if (!_.isNil(value) && (numericValue < 1 || numericValue > 360)) {
            callback(new Error('等于开始静脉溶栓时间-脑梗死患者发病时间,要求合理取值范围1≤n≤360'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }],
      column: 6
    },
    {
      lable: 'DNT时间',
      name: 'DNT时间',
      unit: '分',
      component: 'el-input',
      hideUnitValue: '不详',
      disabled: true,
      rules: [{ required: true, message: 'DNT时间为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) && value !== '不详') {
            callback(new Error('当发病时间未知或未填写时，DNT记为不详'))
          } else if (!_.isNil(value) && (numericValue < 1 || numericValue > 360)) {
            callback(new Error('等于开始静脉溶栓时间-脑梗死患者到院时间,要求合理取值范围1≤n≤360'))
          } else {
            callback()
          }
        }
      }],
      column: 6
    },
    {
      lable: '静脉溶栓药物',
      name: '静脉溶栓药物',
      component: 'el-select',
      rules: { required: true, message: '静脉溶栓药物为必填项', trigger: 'change' },
      enums: AISDrugGroups,
      column: 6
    },
    {
      lable: '其他静脉溶栓药物名称',
      name: '其他静脉溶栓药物名称',
      component: 'el-input',
      rules: { required: true, message: '其他静脉溶栓药物名称为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'string',
        conditions: '静脉溶栓药物',
        value: '9'
      }
    },
    {
      lable: '有无溶栓并发症',
      name: '有无溶栓并发症',
      component: 'el-select',
      enums: haveOrNotGroups,
      rules: { required: true, message: '有无溶栓并发症为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '溶栓并发症',
      name: '溶栓并发症',
      component: 'slot',
      enums: AISConcomitantGroups,
      rules: { required: true, message: '溶栓并发症为必填项', trigger: 'change' },
      isMultiple: true,
      column: 6,
      judgment: {
        type: 'string',
        conditions: '有无溶栓并发症',
        value: '1'
      }
    },
    {
      lable: '溶栓并发症其他',
      name: '溶栓并发症其他',
      component: 'el-input',
      rules: { required: true, message: '溶栓并发症其他为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '溶栓并发症',
        value: '99'
      }
    },
    { lable: '溶栓结束后即刻NIHSS评分', name: '溶栓结束后即刻NIHSS评分', component: 'el-select', rules: { required: true, message: '溶栓结束后即刻NIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotEvaluatedGroups, column: 6 },
    {
      lable: '溶栓结束后即刻NIHSS评分分数',
      name: '溶栓结束后即刻NIHSS评分分数',
      component: 'el-input',
      unit: '分',
      precision: 0,
      rules: [{ required: true, message: '溶栓结束后即刻NIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '溶栓结束后即刻NIHSS评分',
        value: '1'
      }
    },
    { lable: '溶栓后24hNIHSS评分', name: '溶栓后24hNIHSS评分', deathOptionalValue: '2', component: 'el-select', rules: { required: true, message: '溶栓后24hNIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotDeathGroups, column: 6 },
    {
      lable: '溶栓后24hNIHSS评分分数',
      name: '溶栓后24hNIHSS评分分数',
      unit: '分',
      component: 'el-input',
      precision: 0,
      rules: [{ required: true, message: '溶栓后24hNIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '溶栓后24hNIHSS评分',
        value: '1'
      }
    },
    { lable: '溶栓后7±2天NIHSS评分', name: '溶栓后7±2天NIHSS评分', deathOptionalValue: '2', component: 'el-select', rules: { required: true, message: '溶栓后7±2天NIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotDeathGroups, column: 6 },
    {
      lable: '溶栓后7±2天NIHSS评分分数',
      name: '溶栓后7±2天NIHSS评分分数',
      component: 'el-input',
      unit: '分',
      precision: 0,
      rules: [{ required: true, message: '溶栓后7±2天NIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '溶栓后7±2天NIHSS评分',
        value: '1'
      }
    },
    {
      lable: '未给予血管内治疗的原因',
      name: '未给予血管内治疗的原因',
      component: 'slot',
      enums: reasonForNoIntraoperativeTherapyGroups,
      rules: { required: true, message: '未给予血管内治疗的原因为必填项', trigger: 'change' },
      isMultiple: true,
      column: 6,
      restrict: ['01', '03', '04', '05']
    }
  ],
  component: markRaw(AIS)
}

// AIS血管内治疗
export const intraoperativeTherapyModule = {
  lable: 'AIS血管内治疗',
  restrict: ['02'],
  value: [
    {
      lable: '取栓方式',
      name: '取栓方式',
      component: 'slot',
      enums: extractionMethodGroups,
      rules: { required: true, message: '取栓方式为必填项', trigger: 'change' },
      column: 6
    }, {
      lable: '二次发病时间',
      name: '二次发病时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '二次发病时间为必填项', trigger: 'change' }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '取栓方式',
        value: '3'
      }
    },
    { lable: '术前NIHSS评分', name: '术前NIHSS评分', component: 'el-select', rules: { required: true, message: '术前NIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotEvaluatedGroups, column: 6 },
    {
      lable: '术前NIHSS评分分数',
      name: '术前NIHSS评分分数',
      unit: '分',
      component: 'el-input',
      precision: 0,
      rules: [{ required: true, message: '术前NIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '术前NIHSS评分',
        value: '1'
      }
    },
    {
      lable: '穿刺完成时间',
      name: '穿刺完成时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '穿刺完成时间为必填项', trigger: 'change' }],
      column: 6
    },
    {
      lable: 'OPT时间',
      name: 'OPT时间',
      component: 'el-input',
      unit: '分',
      hideUnitValue: '不详',
      disabled: true,
      rules: [{ required: true, message: 'OPT时间为必填项', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            const numericValue = Number(value)
            if (isNaN(numericValue) && value !== '不详') {
              callback(new Error('当发病时间未知或未填写时，OPT记为不详'))
            } else if (!_.isNil(value) && (numericValue < 1 || numericValue > 1440)) {
              callback(new Error('等于完成穿刺时间-脑梗死患者发病时间,要求合理取值范围1≤n≤1440'))
            } else {
              callback()
            }
          }
        }
      ],
      column: 6
    },
    {
      lable: 'DPT时间',
      name: 'DPT时间',
      unit: '分',
      component: 'el-input',
      hideUnitValue: '不详',
      disabled: true,
      rules: [{ required: true, message: 'DPT时间为必填项', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            const numericValue = Number(value)
            if (isNaN(numericValue) && value !== '不详') {
              callback(new Error('当发病时间未知或未填写时，DPT记为“不详”'))
            } else if (!_.isNil(value) && (numericValue < 1 || numericValue > 360)) {
              callback(new Error('等于完成穿刺时间-脑梗死患者到院时间,要求合理取值范围1≤n≤360'))
            } else {
              callback()
            }
          }
        }],
      column: 6
    }, {
      lable: '血管内开通方法',
      name: '血管内开通方法',
      component: 'el-select',
      rules: { required: true, message: '血管内开通方法为必填项', trigger: 'change' },
      enums: intraoperativeTherapyMethodGroups,
      column: 6,
      isMultiple: true // 多选
    },
    { lable: '术后mTICI是否分级', name: '术后mTICI是否分级', component: 'el-select', rules: { required: true, message: '术后mTICI是否分级为必填项', trigger: 'change' }, enums: evaluatedOrNotEvaluatedGroups, column: 6 },
    {
      lable: '术后mTICI分级结果',
      name: '术后mTICI分级结果',
      component: 'el-select',
      enums: mTICIResultGroups,
      rules: { required: true, message: '术后mTICI分级结果为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'string',
        conditions: '术后mTICI是否分级',
        value: '1'
      }
    },
    {
      lable: '首次血管成功再通时间',
      name: '首次血管成功再通时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '首次血管成功再通时间为必填项', trigger: 'change' }],
      column: 6,
      judgment: {
        type: '!string',
        conditions: '术后mTICI分级结果',
        value: '1,2,3'
      }
    },
    {
      lable: 'ORT时间',
      name: 'ORT时间',
      component: 'el-input',
      unit: '分',
      hideUnitValue: '不详',
      disabled: true,
      rules: [{ required: true, message: 'ORT时间为必填项', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            const numericValue = Number(value)
            if (isNaN(numericValue) && value !== '不详') {
              callback(new Error('当发病时间未知或未填写时，ORT记为不详'))
            } else if (!_.isNil(value) && (numericValue < 1 || numericValue > 1440)) {
              callback(new Error('等于首次血管成功再通时间-脑梗死患者发病时间,要求合理取值范围1≤n≤1440'))
            } else {
              callback()
            }
          }
        }],
      column: 6
    },
    {
      lable: 'DRT时间',
      name: 'DRT时间',
      component: 'el-input',
      unit: '分',
      hideUnitValue: '不详',
      disabled: true,
      rules: [{ required: true, message: 'DRT时间为必填项', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            const numericValue = Number(value)
            if (isNaN(numericValue) && value !== '不详') {
              callback(new Error('当到院时间未知或未填写时，DRT记为不详'))
            } else if (!_.isNil(value) && (numericValue < 1 || numericValue > 600)) {
              callback(new Error('等于首次血管成功再通时间-脑梗死患者到院时间,要求合理取值范围1≤n≤600'))
            } else {
              callback()
            }
          }
        }],
      column: 6
    },
    {
      lable: '血管内开通治疗手术并发症',
      name: '血管内开通治疗手术并发症',
      component: 'slot',
      isMultiple: true,
      enums: intraoperativeTherapyConcomitantGroups,
      rules: { required: true, message: '血管内开通治疗手术并发症为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '血管内开通治疗手术其他并发症内容',
      name: '血管内开通治疗手术其他并发症内容',
      component: 'el-input',
      rules: { required: true, message: '血管内开通治疗手术其他并发症内容为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '血管内开通治疗手术并发症',
        value: '99'
      }
    },
    { lable: '术后24hNIHSS评分', name: '术后24hNIHSS评分', deathOptionalValue: '2', component: 'el-select', rules: { required: true, message: '术后24hNIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotDeathGroups, column: 6, restrict: ['01', '02', '03', '04', '05'] },
    {
      lable: '术后24hNIHSS评分分数',
      name: '术后24hNIHSS评分分数',
      unit: '分',
      component: 'el-input',
      precision: 0,
      rules: [{ required: true, message: '术后24hNIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '术后24hNIHSS评分',
        value: '1'
      }
    },
    { lable: '术后7±2天NIHSS评分', name: '术后7±2天NIHSS评分', deathOptionalValue: '2', component: 'el-select', rules: { required: true, message: '术后7±2天NIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotDeathGroups, column: 6, restrict: ['01', '02', '03', '04', '05'] },
    {
      lable: '术后7±2天NIHSS评分分数',
      name: '术后7±2天NIHSS评分分数',
      unit: '分',
      component: 'el-input',
      precision: 0,
      rules: [{ required: true, message: '术后7±2天NIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '术后7±2天NIHSS评分',
        value: '1'
      }
    },
    {
      lable: '未溶栓原因',
      name: '未溶栓原因',
      component: 'slot',
      isMultiple: true,
      enums: reasonForNoAISGroups,
      rules: { required: true, message: '未溶栓原因为必填项', trigger: 'change' },
      column: 6
    }
  ],
  component: markRaw(intraoperativeTherapy)
}

// 主要影像检查
export const mainDiagnosisModule = {
  lable: '主要影像检查',
  restrict: ['03'],
  value: [
    {
      lable: '出血部位',
      name: '出血部位',
      component: 'el-select',
      rules: { required: true, message: '出血部位为必填项', trigger: 'change' },
      enums: bleedingPartGroups,
      column: 6,
      isMultiple: true // 多选
    }, {
      lable: '出血大小',
      name: '出血大小',
      component: 'el-input',
      precision: 0,
      unit: 'ml',
      rules: [{ required: true, message: '出血大小为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || (numericValue <= 0 || numericValue > 200) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求合理取值范围0<n≤200ml'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: '!multiple',
        conditions: '出血部位',
        value: ['05']
      }
    },
    {
      lable: '脑出血病因诊断',
      name: '脑出血病因诊断',
      component: 'el-select',
      rules: { required: true, message: '脑出血病因诊断为必填项', trigger: 'change' },
      enums: cerebralInfectionDiagnosisGroups,
      column: 6,
      isMultiple: true // 多选
    },
    {
      lable: '其他影像学检查',
      name: '其他影像学检查',
      component: 'slot',
      rules: { required: true, message: '其他影像学检查为必填项', trigger: 'change' },
      enums: otherImagingChecksGroups,
      column: 6,
      isMultiple: true // 多选
    }
  ],
  component: markRaw(mainDiagnosis)
}

// 脑出血手术
export const cerebralInfarctionModule = {
  lable: '脑出血手术',
  restrict: ['03'],
  value: [
    {
      lable: '脑出血手术开始时间',
      name: '脑出血手术开始时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }, { required: true, message: '脑出血手术开始时间为必填项', trigger: 'change' }],
      column: 6
    },
    {
      lable: '脑出血发病到开始手术时间',
      name: '脑出血发病到开始手术时间',
      component: 'el-input',
      unit: '分',
      hideUnitValue: '不详',
      disabled: true,
      rules: { required: true, message: '脑出血发病到开始手术时间为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '脑出血到院到开始手术时间',
      name: '脑出血到院到开始手术时间',
      hideUnitValue: '不详',
      unit: '分',
      component: 'el-input',
      disabled: true,
      rules: { required: true, message: '脑出血到院到开始手术时间为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '脑出血麻醉方式',
      name: '脑出血麻醉方式',
      component: 'el-select',
      enums: cerebralInfectionAnesthesiaMethodGroups,
      rules: { required: true, message: '脑出血麻醉方式为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '脑出血手术方式',
      name: '脑出血手术方式',
      component: 'el-select',
      isMultiple: true,
      enums: cerebralInfectionProcedureMethodGroups,
      rules: { required: true, message: '脑出血手术方式为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '微创血肿穿刺术类型',
      name: '微创血肿穿刺术类型',
      component: 'el-select',
      isMultiple: true,
      enums: microscopicIncisionTypeGroups,
      rules: { required: true, message: '微创血肿穿刺术类型为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '脑出血手术方式',
        value: '06'
      }
    }, {
      lable: '脑出血其他手术方式',
      name: '脑出血其他手术方式',
      component: 'el-input',
      rules: { required: true, message: '脑出血其他手术方式为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '脑出血手术方式',
        value: '99'
      }
    },
    {
      lable: '脑出血手术并发症',
      name: '脑出血手术并发症',
      component: 'el-select',
      isMultiple: true,
      disabledText: '98',
      enums: cerebralInfectionProcedureConcomitantGroups,
      rules: { required: true, message: '脑出血手术并发症为必填项', trigger: 'change' },
      column: 6
    }, {
      lable: '脑出血手术并发症其他',
      name: '脑出血手术并发症其他',
      component: 'el-select',
      isMultiple: true,
      enums: brainInjuryOtherConcomitantGroups,
      rules: { required: true, message: '脑出血手术并发症其他为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '脑出血手术并发症',
        value: '99'
      }
    }

  ],
  component: markRaw(cerebralInfarction)
}

// 住院药物治疗
export const hospitalizationDrugModule = {
  lable: '住院药物治疗',
  restrict: ['01', '02'],
  value: [
    {
      lable: '是否抗血小板治疗',
      name: '是否抗血小板治疗',
      component: 'el-select',
      enums: yesOrNoGroups,
      rules: { required: true, message: '是否抗血小板治疗为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '抗血小板药物名称',
      name: '抗血小板药物名称',
      component: 'el-select',
      enums: antiXaBGroup,
      isMultiple: true,
      column: 6,
      judgment: {
        type: 'string',
        conditions: '是否抗血小板治疗',
        value: '1'
      }
    },
    {
      lable: '是否发病48小时内用药',
      name: '是否发病48小时内用药',
      component: 'el-select',
      enums: yesOrNoGroups,
      rules: { required: true, message: '是否发病48小时内用药为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'string',
        conditions: '是否抗血小板治疗',
        value: '1'
      }
    }
  ],
  component: markRaw(universalModule)
}

// CEA/CAS手术
export const CEAorCASModule = {
  lable: 'CEA/CAS手术',
  restrict: ['05'],
  value: [
    {
      lable: 'CEA/CAS手术开始时间',
      name: 'CEA/CAS手术开始时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }],
      column: 6
    },
    {
      lable: 'CEA/CAS手术部位',
      name: 'CEA/CAS手术部位',
      component: 'el-select',
      isMultiple: true,
      enums: CEAorCASProcedurePartGroups,
      column: 6
    },
    {
      lable: 'CEA/CAS手术实施的监测手段',
      name: 'CEA/CAS手术实施的监测手段',
      component: 'el-select',
      isMultiple: true,
      enums: CEAorCASMonitoringMethodGroups,
      rules: { required: true, message: 'CEA/CAS手术实施的监测手段为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: 'CEA/CAS手术采取方式',
      name: 'CEA/CAS手术采取方式',
      component: 'el-select',
      enums: CEAorCASProcedureMethodGroups,
      rules: { required: true, message: 'CEA/CAS手术采取方式为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: 'CEA/CAS手术是否采用补片',
      name: 'CEA/CAS手术是否采用补片',
      component: 'el-select',
      enums: yesOrNoGroups,
      column: 6
    },
    {
      lable: 'CEA手术并发症',
      name: 'CEA手术并发症',
      component: 'el-select',
      enums: CEAProcedureConcomitantGroups,
      disabledText: '98',
      isMultiple: true,
      rules: { required: true, message: 'CEA手术并发症为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'string',
        conditions: 'CEA/CAS手术采取方式',
        value: '1,2,4'
      }
    },
    {
      lable: 'CAS手术并发症',
      name: 'CAS手术并发症',
      component: 'el-select',
      disabledText: '98',
      enums: CASProcedureConcomitantGroups,
      isMultiple: true,
      rules: { required: true, message: 'CAS手术并发症为必填项', trigger: 'change' },
      column: 6,
      judgment: {
        type: 'string',
        conditions: 'CEA/CAS手术采取方式',
        value: '3,4'
      }
    }],
  component: markRaw(universalModule)
}

// 出院评估
export const dischargeEvaluationModule = {
  lable: '出院评估',
  restrict: ['01', '02', '03', '04', '05'],
  value: [
    { lable: '7±2天（或出院）时mRS评分', deathOptionalValue: '3', name: '7±2天（或出院）时mRS评分', component: 'el-select', rules: { required: true, message: '7±2天（或出院）时mRS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotDeathGroups, column: 6, restrict: ['01', '02', '03', '04', '05'] },
    {
      lable: '7±2天（或出院）时mRS评分分数',
      name: '7±2天（或出院）时mRS评分分数',
      unit: '分',
      component: 'el-input',
      precision: 0,
      restrict: ['01', '02', '03', '04', '05'],
      rules: [{ required: true, message: '7±2天（或出院）时mRS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 6) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤6 '))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '7±2天（或出院）时mRS评分',
        value: '1'
      }
    },
    { lable: '7±2天（或出院）时NIHSS评分', name: '7±2天（或出院）时NIHSS评分', deathOptionalValue: '3', component: 'el-select', rules: { required: true, message: '7±2天（或出院）时NIHSS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotDeathGroups, column: 6, restrict: ['01', '02', '05'] },
    {
      lable: '7±2天（或出院）时NIHSS评分分数',
      name: '7±2天（或出院）时NIHSS评分分数',
      unit: '分',
      component: 'el-input',
      precision: 0,
      restrict: ['01', '02', '05'],
      rules: [{ required: true, message: '7±2天（或出院）时NIHSS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 42) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围0≤n≤42'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '7±2天（或出院）时NIHSS评分',
        value: '1'
      }
    },
    { lable: '7±2天（或出院）时GCS评分', name: '7±2天（或出院）时GCS评分', deathOptionalValue: '3', component: 'el-select', rules: { required: true, message: '7±2天（或出院）时GCS评分为必填项', trigger: 'change' }, enums: evaluatedOrNotDeathGroups, column: 6, restrict: ['03', '04'] },
    {
      lable: '7±2天（或出院）时GCS评分分数',
      name: '7±2天（或出院）时GCS评分分数',
      unit: '分',
      component: 'el-input',
      precision: 0,
      restrict: ['03', '04'],
      rules: [{ required: true, message: '7±2天（或出院）时GCS评分分数为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 3 || numericValue > 15) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围3≤n≤15'))
          } else {
            callback()
          }
        }
      }],
      column: 6,
      judgment: {
        type: 'string',
        conditions: '7±2天（或出院）时GCS评分',
        value: '1'
      }
    }
  ],
  component: markRaw(universalModule)
}

// 康复治疗
export const recoveryTreatmentModule = {
  lable: '康复治疗',
  restrict: ['01', '02', '03', '04'],
  value: [
    {
      lable: '是否接受康复治疗',
      name: '是否接受康复治疗',
      rules: { required: true, message: '是否接受康复治疗为必填项', trigger: 'change' },
      component: 'el-select',
      enums: yesOrNoGroups,
      column: 6
    }, {
      lable: '开始康复治疗日期',
      name: '开始康复治疗日期',
      component: 'el-date-picker',
      type: 'date',
      format: 'YYYY-MM-DD',
      minute: true,
      column: 6,
      rules: [{ required: true, message: '开始康复治疗日期为必填项', trigger: 'change' }, {
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }],
      judgment: {
        type: 'string',
        conditions: '是否接受康复治疗',
        value: '1'
      }
    }
  ],
  component: markRaw(recoveryTreatment)
}

// 出院情况
export const dischargeConditionModule = {
  lable: '出院情况',
  restrict: ['01', '02', '03', '04', '05'],
  value: [
    {
      lable: '死亡原因',
      name: '死亡原因',
      component: 'el-select',
      isMultiple: true,
      disabledText: '98',
      enums: deathReasonGroups,
      column: 6,
      judgment: {
        type: 'string',
        conditions: '离院方式',
        lable: '入出院信息',
        value: '5'
      }
    },
    {
      lable: '死亡原因其他',
      name: '死亡原因其他',
      component: 'el-input',
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '死亡原因',
        value: '99'
      }
    }, {
      lable: '死亡时间',
      name: '死亡时间',
      component: 'el-date-picker',
      type: 'date',
      format: 'YYYY-MM-DD',
      minute: true,
      column: 6,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }],
      judgment: {
        type: 'string',
        conditions: '离院方式',
        lable: '入出院信息',
        value: '5'
      }
    },
    {
      lable: '出院用药',
      name: '出院用药',
      component: 'slot',
      isMultiple: true,
      enums: dischargeDrugGroups,
      rules: { required: true, message: '出院用药为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '既往有房颤病史或此次住院检查提示房颤',
      name: '既往有房颤病史或此次住院检查提示房颤',
      component: 'el-select',
      rules: { required: true, message: '既往有房颤病史或此次住院检查提示房颤为必填项', trigger: 'change' },
      enums: yesOrNoGroups,
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '出院用药',
        value: '04'
      }
    }
  ],
  component: markRaw(dischargeCondition)
}

// 烟雾病登记
export const smokeModule = {
  lable: '烟雾病登记',
  restrict: ['03'],
  value: [
    {
      lable: '烟雾病临床表现类型',
      name: '烟雾病临床表现类型',
      component: 'el-select',
      isMultiple: true,
      enums: smokingClinicalTypeGroups,
      column: 6
    },
    {
      lable: '既往是否有类似病史',
      name: '既往是否有类似病史',
      component: 'el-select',
      enums: haveOrNotGroups,
      column: 6
    },
    {
      lable: '烟雾病上次发病时间',
      name: '烟雾病上次发病时间',
      component: 'el-date-picker',
      minute: true,
      type: 'date',
      format: 'YYYY-MM-DD',
      rules: {
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      },
      column: 6,
      judgment: {
        type: 'string',
        conditions: '既往是否有类似病史',
        value: '1'
      }
    },
    {
      lable: '烟雾病既往手术情况',
      name: '烟雾病既往手术情况',
      component: 'el-select',
      enums: haveOrNotGroups,
      column: 6
    }, {
      lable: '烟雾状血管侧别',
      name: '烟雾状血管侧别',
      component: 'el-select',
      enums: smokingChestSideGroups,
      column: 6
    }, {
      lable: '左侧烟雾状血管位置',
      name: '左侧烟雾状血管位置',
      component: 'el-select',
      isMultiple: true,
      enums: smokingChestLocationGroups,
      column: 6,
      judgment: {
        type: '!string',
        conditions: '烟雾状血管侧别',
        value: '2'
      }
    }, {
      lable: '左侧烟雾状血管位置其他',
      name: '左侧烟雾状血管位置其他',
      component: 'el-input',
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '左侧烟雾状血管位置',
        value: '99'
      }
    }, {
      lable: '右侧烟雾状血管位置',
      name: '右侧烟雾状血管位置',
      component: 'el-select',
      isMultiple: true,
      enums: smokingChestLocationGroups,
      column: 6,
      judgment: {
        type: '!string',
        conditions: '烟雾状血管侧别',
        value: '1'
      }
    }, {
      lable: '右侧烟雾状血管位置其他',
      name: '右侧烟雾状血管位置其他',
      component: 'el-input',
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '右侧烟雾状血管位置',
        value: '99'
      }
    }, {
      lable: '颅内外是否有代偿',
      name: '颅内外是否有代偿',
      component: 'el-select',
      enums: haveOrNotGroups,
      column: 6
    }, {
      lable: '烟雾病本次发病是否手术治疗',
      name: '烟雾病本次发病是否手术治疗',
      component: 'el-select',
      enums: yesOrNoGroups,
      column: 6
    },
    {
      lable: '烟雾病手术开始时间',
      name: '烟雾病手术开始时间',
      component: 'el-date-picker',
      type: 'date',
      format: 'YYYY-MM-DD',
      minute: true,
      column: 6,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }],
      judgment: {
        type: 'string',
        conditions: '烟雾病本次发病是否手术治疗',
        value: '1'
      }
    }, {
      lable: '烟雾病手术治疗并发症',
      name: '烟雾病手术治疗并发症',
      component: 'el-select',
      isMultiple: true,
      enums: smokingProcedureConcomitantGroups,
      column: 6,
      disabledText: '98',
      judgment: {
        type: 'string',
        conditions: '烟雾病本次发病是否手术治疗',
        value: '1'
      }
    }, {
      lable: '烟雾病手术治疗并发症其他',
      name: '烟雾病手术治疗并发症其他',
      component: 'el-input',
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '烟雾病手术治疗并发症',
        value: '99'
      }
    }, {
      lable: '烟雾病左侧治疗方式',
      name: '烟雾病左侧治疗方式',
      component: 'slot',
      isMultiple: true,
      enums: smokingTreatmentMethodGroups,
      column: 6,
      judgment: {
        type: '!string',
        conditions: '烟雾状血管侧别',
        value: '1'
      }
    }, {
      lable: '烟雾病左侧治疗方式其他',
      name: '烟雾病左侧治疗方式其他',
      component: 'el-input',
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '烟雾病左侧治疗方式',
        value: '99'
      }
    }, {
      lable: '烟雾病右侧治疗方式',
      name: '烟雾病右侧治疗方式',
      component: 'slot',
      isMultiple: true,
      enums: smokingTreatmentMethodGroups,
      column: 6,
      judgment: {
        type: '!string',
        conditions: '烟雾状血管侧别',
        value: '1'
      }
    }, {
      lable: '烟雾病右侧治疗方式其他',
      name: '烟雾病右侧治疗方式其他',
      component: 'el-input',
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: '烟雾病右侧治疗方式',
        value: '99'
      }
    }

  ],
  component: markRaw(smoke)
}

// 颅内AVM登记
export const AVMModule = {
  lable: '颅内AVM登记',
  restrict: ['03'],
  value: [
    {
      lable: 'AVM类型',
      name: 'AVM类型',
      component: 'el-select',
      enums: AVMTypeGroups,
      column: 6
    },
    {
      lable: 'AVM大小',
      name: 'AVM大小',
      component: 'el-select',
      enums: AVMSizeGroups,
      column: 6
    },
    {
      lable: 'AVM部位特征',
      name: 'AVM部位特征',
      component: 'el-select',
      enums: AVMFeatureGroups,
      column: 6
    },
    {
      lable: '静脉引流位置',
      name: '静脉引流位置',
      component: 'el-select',
      enums: AISFlowLocationGroups,
      column: 6
    }, {
      lable: 'Spetzler–Marin评分分数',
      name: 'Spetzler–Marin评分分数',
      unit: '分',
      disabled: true,
      component: 'el-input',
      precision: 0,
      rules: [{
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (((value || value === 0) && (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 0 || numericValue > 5))) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求合理取值范围0≤n≤5'))
          } else {
            callback()
          }
        }
      }],
      column: 6
    },
    {
      lable: '有无静脉血栓',
      name: '有无静脉血栓',
      component: 'el-select',
      enums: haveOrNotGroups,
      column: 6
    },
    {
      lable: 'AVM患者是否手术治疗',
      name: 'AVM患者是否手术治疗',
      component: 'el-select',
      enums: yesOrNoGroups,
      column: 6
    },
    {
      lable: 'AVM治疗时间',
      name: 'AVM治疗时间',
      component: 'el-date-picker',
      format: 'YYYY-MM-DD HH:mm',
      minute: true,
      column: 6,
      rules: [{
        type: 'date',
        message: '请填写正确的日期格式',
        trigger: 'change'
      }, {
        validator: (rule, value, callback) => {
          validate(rule, callback)
        },
        trigger: 'change'
      }],
      judgment: {
        type: 'string',
        conditions: 'AVM患者是否手术治疗',
        value: '1'
      }
    }, {
      lable: 'AVM治疗策略',
      name: 'AVM治疗策略',
      component: 'el-select',
      isMultiple: true,
      enums: AVMTreatmentStrategyGroups,
      column: 6,
      judgment: {
        type: 'string',
        conditions: 'AVM患者是否手术治疗',
        value: '1'
      }
    }, {
      lable: 'AVM治疗并发症',
      name: 'AVM治疗并发症',
      component: 'el-select',
      isMultiple: true,
      enums: AVMTreatmentConcomitantGroups,
      disabledText: '98',
      column: 6,
      judgment: {
        type: 'string',
        conditions: 'AVM患者是否手术治疗',
        value: '1'
      }
    }, {
      lable: 'AVM治疗并发症其他',
      name: 'AVM治疗并发症其他',
      component: 'el-input',
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: 'AVM治疗并发症',
        value: '99'
      }
    }, {
      lable: 'AVM左侧责任病灶位置',
      name: 'AVM左侧责任病灶位置',
      component: 'el-select',
      isMultiple: true,
      enums: AVMResponsibleLesionLocationGroups,
      column: 6
    }, {
      lable: 'AVM右侧责任病灶位置',
      name: 'AVM右侧责任病灶位置',
      component: 'el-select',
      isMultiple: true,
      enums: AVMResponsibleLesionLocationGroups,
      column: 6
    }, {
      lable: 'AVM中线部位责任病灶位置',
      name: 'AVM中线部位责任病灶位置',
      component: 'el-select',
      isMultiple: true,
      enums: AVMCentralLineLesionLocationGroups,
      column: 6
    }, {
      lable: 'AVM中线部位责任病灶位置其他',
      name: 'AVM中线部位责任病灶位置其他',
      component: 'el-input',
      column: 6,
      judgment: {
        type: 'multiple',
        conditions: 'AVM中线部位责任病灶位置',
        value: '99'
      }
    }
  ],
  component: markRaw(AVM)
}

// 动脉瘤手术
export const aneurysmModule = {
  lable: '动脉瘤手术',
  restrict: ['04'],
  value: [
    {
      lable: '颅内血管检查方式',
      name: '颅内血管检查方式',
      component: 'el-select',
      isMultiple: true,
      disabledText: '98',
      enums: neckChestXrayMethodGroups,
      rules: { required: true, message: '颅内血管检查方式为必填项', trigger: 'change' },
      column: 6
    },
    {
      lable: '动脉瘤数量',
      name: '动脉瘤数量',
      component: 'slot',
      precision: 0,
      rules: [{ required: true, message: '动脉瘤数量为必填项', trigger: 'change' }, {
        validator: (rule, value, callback) => {
          const numericValue = Number(value)
          if (isNaN(numericValue) || !_.isInteger(numericValue) || (numericValue < 1 || numericValue > 10) || (_.isString(value) && value.includes(' '))) {
            callback(new Error('要求整数，合理取值范围1≤n≤10'))
          } else {
            callback()
          }
        }
      }],
      column: 24,
      children: [
        {
          lable: '侧别',
          name: '侧别',
          component: 'el-select',
          enums: tumorSideGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '部位',
            value: '5,8'
          }
        }, {
          lable: '部位',
          name: '部位',
          component: 'el-select',
          enums: tumorPartGroups,
          column: 6
        }, {
          lable: '部位颈内动脉ICA',
          name: '部位颈内动脉ICA',
          component: 'el-select',
          enums: tumorICAGroups,
          column: 6,
          judgment: {
            type: 'string',
            conditions: '部位',
            value: '1'
          }
        }, {
          lable: '部位大脑前动脉ACA',
          name: '部位大脑前动脉ACA',
          component: 'el-select',
          enums: tumorACAGroups,
          column: 6,
          judgment: {
            type: 'string',
            conditions: '部位',
            value: '4'
          }
        }, {
          lable: '部位大脑中动脉MCA',
          name: '部位大脑中动脉MCA',
          component: 'el-select',
          enums: tumorMCAGroups,
          column: 6,
          judgment: {
            type: 'string',
            conditions: '部位',
            value: '6'
          }
        }, {
          lable: '部位椎动脉VA',
          name: '部位椎动脉VA',
          component: 'el-select',
          enums: tumorVAGroups,
          column: 6,
          judgment: {
            type: 'string',
            conditions: '部位',
            value: '7'
          }
        }, {
          lable: '部位基底动脉BA',
          name: '部位基底动脉BA',
          component: 'el-select',
          enums: tumorBAGroups,
          column: 6,
          judgment: {
            type: 'string',
            conditions: '部位',
            value: '8'
          }
        }, {
          lable: '部位大脑后动脉PCA',
          name: '部位大脑后动脉PCA',
          component: 'el-select',
          enums: tumorPCAGroups,
          column: 6,
          judgment: {
            type: 'string',
            conditions: '部位',
            value: '9'
          }
        }, {
          lable: '部位其他',
          name: '部位其他',
          component: 'el-input',
          column: 6,
          judgment: {
            type: 'string',
            conditions: '部位',
            value: '99'
          }
        }, {
          lable: '大小(长)',
          name: '大小(长)',
          component: 'el-input',
          precision: 0,
          unit: 'mm',
          rules: [{
            validator: (rule, value, callback) => {
              const numericValue = Number(value)
              if (((value || value === 0) && (isNaN(numericValue) || (numericValue <= 0 || numericValue > 50))) || (_.isString(value) && value.includes(' '))) {
                callback(new Error('要求合理取值范围0<n≤50'))
              } else {
                callback()
              }
            }
          }],
          column: 6
        }, {
          lable: '大小(宽)',
          name: '大小(宽)',
          unit: 'mm',
          component: 'el-input',
          precision: 0,
          rules: [{
            validator: (rule, value, callback) => {
              const numericValue = Number(value)
              if (((value || value === 0) && (isNaN(numericValue) || (numericValue <= 0 || numericValue > 50))) || (_.isString(value) && value.includes(' '))) {
                callback(new Error('要求合理取值范围0<n≤50'))
              } else {
                callback()
              }
            }
          }],
          column: 6
        }, {
          lable: '大小(高)',
          name: '大小(高)',
          unit: 'mm',
          component: 'el-input',
          precision: 0,
          rules: [{
            validator: (rule, value, callback) => {
              const numericValue = Number(value)
              if (((value || value === 0) && (isNaN(numericValue) || (numericValue <= 0 || numericValue > 50))) || (_.isString(value) && value.includes(' '))) {
                callback(new Error('要求合理取值范围0<n≤50'))
              } else {
                callback()
              }
            }
          }],
          column: 6
        }, {
          lable: '大小（瘤颈)',
          name: '大小（瘤颈)',
          unit: 'mm',
          component: 'el-input',
          precision: 0,
          rules: [{
            validator: (rule, value, callback) => {
              const numericValue = Number(value)
              if (((value || value === 0) && (isNaN(numericValue) || (numericValue <= 0 || numericValue > 50))) || (_.isString(value) && value.includes(' '))) {
                callback(new Error('要求合理取值范围0<n≤50'))
              } else {
                callback()
              }
            }
          }],
          column: 6
        }, {
          lable: '类型',
          name: '类型',
          component: 'el-select',
          enums: tumorTypeGroups,
          column: 6
        }, {
          lable: '是否手术',
          name: '是否手术',
          component: 'el-select',
          enums: yesOrNoGroups,
          rules: [{
            required: true,
            validator: (rule, value, callback) => {
              const { field } = rule
              if (_.isNil(value) || !value) {
                callback(new Error(field.replace('动脉瘤手术', '') + '为必填项'))
              } else {
                callback()
              }
            }
          }],
          column: 6
        }, {
          lable: '手术类型',
          name: '手术类型',
          component: 'el-select',
          rules: [{
            required: true,
            validator: (rule, value, callback) => {
              const { field } = rule
              if (_.isNil(value) || !value) {
                callback(new Error(field.replace('动脉瘤手术', '') + '为必填项'))
              } else {
                callback()
              }
            }
          }],
          enums: tumorSurgeryTypeGroups,
          column: 6,
          judgment: {
            type: 'string',
            conditions: '是否手术',
            value: '1'
          }
        },
        {
          lable: '手术时间',
          name: '手术时间',
          component: 'el-date-picker',
          format: 'YYYY-MM-DD HH:mm',
          minute: true,
          rules: [{
            type: 'date',
            message: '请填写正确的日期格式',
            trigger: 'change'
          }, {
            validator: (rule, value, callback) => {
              validate(rule, callback)
            },
            trigger: 'change'
          }, {
            required: true,
            validator: (rule, value, callback) => {
              const { field } = rule
              if (_.isNil(value) || !value) {
                callback(new Error(field.replace('动脉瘤手术', '') + '为必填项'))
              } else {
                callback()
              }
            }
          }],
          column: 6,
          judgment: {
            type: 'string',
            conditions: '是否手术',
            value: '1'
          }
        },
        {
          lable: '夹闭术治疗结果',
          name: '夹闭术治疗结果',
          component: 'el-select',
          enums: tumorTreatmentResultGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '04'
          }
        }, {
          lable: '夹闭术夹闭后载瘤动脉情况',
          name: '夹闭术夹闭后载瘤动脉情况',
          component: 'el-select',
          enums: tumorClosureAfterLoadGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '04'
          }
        }, {
          lable: '夹闭术中有无并发症',
          name: '夹闭术中有无并发症',
          component: 'el-select',
          enums: haveOrNotGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '04'
          }
        }, {
          lable: '夹闭术中并发症',
          name: '夹闭术中并发症',
          component: 'el-select',
          enums: tumorClosureConcomitantGroups,
          isMultiple: true,
          column: 6,
          judgment: {
            type: 'string',
            conditions: '夹闭术中有无并发症',
            value: '1'
          }
        }, {
          lable: '夹闭术其他并发症',
          name: '夹闭术其他并发症',
          component: 'el-input',
          column: 6,
          judgment: {
            type: 'multiple',
            conditions: '夹闭术中并发症',
            value: '99'
          }
        }, {
          lable: '介入治疗有无弹簧圈',
          name: '介入治疗有无弹簧圈',
          component: 'el-select',
          enums: haveOrNotGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '02'
          }
        }, {
          lable: '介入治疗弹簧圈个数',
          name: '介入治疗弹簧圈个数',
          component: 'el-input-number',
          rules: { type: 'number', max: 20, min: 1 },
          column: 6,
          judgment: {
            type: 'string',
            conditions: '介入治疗有无弹簧圈',
            value: '1'
          }
        }, {
          lable: '介入治疗有无支架',
          name: '介入治疗有无支架',
          component: 'el-select',
          enums: haveOrNotGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '02'
          }
        }, {
          lable: '介入治疗支架个数',
          name: '介入治疗支架个数',
          component: 'el-input-number',
          rules: { type: 'number', max: 10, min: 1 },
          column: 6,
          judgment: {
            type: 'string',
            conditions: '介入治疗有无支架',
            value: '1'
          }
        }, {
          lable: '介入治疗有无球囊',
          name: '介入治疗有无球囊',
          component: 'el-select',
          enums: haveOrNotGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '02'
          }
        }, {
          lable: '介入治疗球囊个数',
          name: '介入治疗球囊个数',
          component: 'el-input-number',
          rules: { type: 'number', max: 3, min: 1 },
          column: 6,
          judgment: {
            type: 'string',
            conditions: '介入治疗有无球囊',
            value: '1'
          }
        }, {
          lable: '介入治疗其他栓塞材料',
          name: '介入治疗其他栓塞材料',
          component: 'el-select',
          disabledText: '98',
          enums: tumorIntraoperativeOtherMaterialGroups,
          isMultiple: true,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '02'
          }
        }, {
          lable: '介入治疗其他栓塞材料描述',
          name: '介入治疗其他栓塞材料描述',
          component: 'el-input',
          column: 6,
          judgment: {
            type: 'multiple',
            conditions: '介入治疗其他栓塞材料',
            value: '99'
          }
        }, {
          lable: '介入后动脉瘤治疗结果',
          name: '介入后动脉瘤治疗结果',
          component: 'el-select',
          enums: tumorTreatmentResultGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '02'
          }
        }, {
          lable: '介入后载瘤动脉情况',
          name: '介入后载瘤动脉情况',
          component: 'el-select',
          enums: tumorIntraoperativeAfterLoadGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '02'
          }
        }, {
          lable: '栓塞术过程中有无并发症',
          name: '栓塞术过程中有无并发症',
          component: 'el-select',
          enums: haveOrNotGroups,
          column: 6,
          judgment: {
            type: '!string',
            conditions: '手术类型',
            value: '02'
          }
        }, {
          lable: '栓塞术过程中并发症',
          name: '栓塞术过程中并发症',
          component: 'el-select',
          enums: tumorIncisionConcomitantGroups,
          isMultiple: true,
          column: 12,
          judgment: {
            type: 'string',
            conditions: '栓塞术过程中有无并发症',
            value: '1'
          }
        }, {
          lable: '栓塞术过程中急性血栓形成部位',
          name: '栓塞术过程中急性血栓形成部位',
          component: 'el-select',
          enums: tumorIncisionEmergencyGroups,
          isMultiple: true,
          column: 12,
          judgment: {
            type: 'multiple',
            conditions: '栓塞术过程中并发症',
            value: '1'
          }
        }, {
          lable: '栓塞术过程中动脉夹层部位',
          name: '栓塞术过程中动脉夹层部位',
          component: 'el-input',
          column: 12,
          judgment: {
            type: 'multiple',
            conditions: '栓塞术过程中并发症',
            value: '4'
          }
        }, {
          lable: '栓塞术过程中其他术中并发症说明',
          name: '栓塞术过程中其他术中并发症说明',
          component: 'el-input',
          column: 12,
          judgment: {
            type: 'multiple',
            conditions: '栓塞术过程中并发症',
            value: '99'
          }
        }
      ]
    }
  ],
  component: markRaw(aneurysm)
}
// 新集合
export const newTabList = [patientInfoModule, hospitalizationInfoModule, mainDiagnoModule, otherDiagnosisOfDischargeModule, operationRecord, treatmentTypeModule,
  admissionConditionModule, physicalExaminationModule, TOASTModule, AISModule, intraoperativeTherapyModule, mainDiagnosisModule, cerebralInfarctionModule,
  hospitalizationDrugModule, aneurysmModule, CEAorCASModule, dischargeEvaluationModule, recoveryTreatmentModule, dischargeConditionModule, smokeModule, AVMModule
]

export const transfromEnumsLable = (enums, values) => {
  if (values) {
    const valuesList = Array.isArray(values) ? values : String(values).split(',')
    return valuesList.map(value => getLable(enums, value)).join(',') || '-'
  } else {
    return '-'
  }
  function getLable(enums, value) {
    return enums.find(item => item.value === value)?.label || '-'
  }
}

// 计算时间差分钟
export const TimeDifference = (Stime, Ttime, msg = '开始时间不能大于结束时间', isEdit = true) => {
  // 判断开始时间是否大于结束日期
  const startDate = new Date(Stime)
  const stopDate = new Date(Ttime)
  // if (Stime > Ttime) {
  //   isEdit && ElMessage.error(msg)
  // }
  const startTime = startDate.getTime()
  const stopTime = stopDate.getTime()
  const cTime = Number(stopTime) - Number(startTime)
  const secondTime = cTime / 1000 / 60
  return Number(secondTime) > 0 ? secondTime : '不详'
}

//
export const isValidTimeFormat = (dateTimeString) => {
  // 使用正则表达式匹配时间格式
  // 支持年月日、年月日时分、年月日时分秒三种格式
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/
  const dateTimeFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
  const dateTimeWithSecondFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

  if (dateFormat.test(dateTimeString)) {
    return true
  } else if (dateTimeFormat.test(dateTimeString)) {
    return true
  } else if (dateTimeWithSecondFormat.test(dateTimeString)) {
    return true
  } else {
    return false
  }
}

function validateTimeline(times, sequence, msg = '') {
  const errMsgList = []

  // 构建有效时间链（按传入顺序过滤无效值）
  const timeline = sequence.map((field, index) => ({
    value: times[index],
    field // 保留字段名用于错误提示
  }))

  if (timeline.length < 2) {
    return errMsgList
  }

  // // 执行时间顺序验证
  // for (let i = 1; i < timeline.length; i++) {
  //   const prev = timeline[i - 1].value
  //   const current = timeline[i].value
  //   console.log(prev, current)
  //   errMsgList.push({
  //     valid: (current < prev) && (prev && current),
  //     errorField: timeline[i].field[0] + timeline[i].field[1],
  //     previousField: timeline[i - 1].field[0] + timeline[i - 1].field[1],
  //     errMsg: timeline[i - 1].field[1] + '<' + timeline[i].field[1]
  //   })
  // }

  for (let i = 0; i < timeline.length; i++) {
    for (let j = i + 1; j < timeline.length; j++) {
      const prev = timeline[i].value
      const current = timeline[j].value
      const fileds = !!prev && !!current
      const isNotCondition = timeline[i].field[1] === '死亡时间' && timeline[j].field[1] === '出院日期'
      errMsgList.push({
        valid: (current <= prev) && fileds && !isNotCondition,
        errorField: timeline[j].field[0] + timeline[j].field[1],
        previousField: timeline[i].field[0] + timeline[i].field[1],
        errMsg: timeline[i].field[1] + '<' + timeline[j].field[1] + msg
      })
    }
  }

  return errMsgList
}

const validate = (rule, callback) => {
  const { field } = rule // 校验字段
  const start = formData['入出院信息' + '住院日期'] ? new Date(formData['入出院信息' + '住院日期']) : formData['入出院信息' + '住院日期']
  const end = formData['入出院信息' + '出院日期'] ? new Date(formatDateTime(formData['入出院信息' + '出院日期'])) : formData['入出院信息' + '出院日期']
  const deathTime = formData['出院情况' + '死亡时间'] ? new Date(formatDateTime(formData['出院情况' + '死亡时间'])) : formData['出院情况' + '死亡时间']
  const ceaStart = formData['CEA/CAS手术' + 'CEA/CAS手术开始时间'] ? new Date(formData['CEA/CAS手术' + 'CEA/CAS手术开始时间']) : formData['CEA/CAS手术' + 'CEA/CAS手术开始时间'] // CEA/CAS手术开始时间
  const avmStart = formData['颅内AVM登记' + 'AVM治疗时间'] ? new Date(formData['颅内AVM登记' + 'AVM治疗时间']) : formData['颅内AVM登记' + 'AVM治疗时间'] // AVM治疗时间
  const smokeStart = formData['烟雾病登记' + '烟雾病手术开始时间'] ? new Date(formatDateTime(formData['烟雾病登记' + '烟雾病手术开始时间'], '00', '00')) : formData['烟雾病登记' + '烟雾病手术开始时间'] // 烟雾病手术开始时间

  const whetherItIsClear = formData['入院情况' + '脑梗死发病是否在院'] === '2' // 是否在院
  const timeOfCerebral = formData['入院情况' + '脑梗死患者发病时间'] ? new Date(formData['入院情况' + '脑梗死患者发病时间']) : formData['入院情况' + '脑梗死患者发病时间'] // 发病时间
  const cerebralTime = formData['入院情况' + '脑梗死患者到院时间'] ? new Date(formData['入院情况' + '脑梗死患者到院时间']) : formData['入院情况' + '脑梗死患者到院时间'] // 到院时间

  const startSuctionTime = formData['AIS静脉溶栓' + '开始静脉溶栓时间'] ? new Date(formData['AIS静脉溶栓' + '开始静脉溶栓时间']) : formData['AIS血管内治疗' + '开始静脉溶栓时间'] // 开始静脉溶栓时间
  const endSuctionTime = formData['AIS血管内治疗' + '二次发病时间'] ? new Date(formData['AIS血管内治疗' + '二次发病时间']) : formData['AIS血管内治疗' + '二次发病时间'] // 二次发病时间
  const strangingTime = formData['AIS血管内治疗' + '穿刺完成时间'] ? new Date(formData['AIS血管内治疗' + '穿刺完成时间']) : formData['AIS血管内治疗' + '穿刺完成时间'] // 穿刺完成时间
  const theFirstBloodVesselsAreThroughTime = formData['AIS血管内治疗' + '首次血管成功再通时间'] ? new Date(formData['AIS血管内治疗' + '首次血管成功再通时间']) : formData['AIS血管内治疗' + '首次血管成功再通时间'] // 首次血管成功再通时间

  const whetherItIsClearOfCerebral = formData['入院情况' + '脑出血发病是否在院'] === '2' // 脑出血发病是否在院
  const timeOfOnsetOfCerebral = formData['入院情况' + '脑出血患者发病时间'] ? new Date(formData['入院情况' + '脑出血患者发病时间']) : formData['入院情况' + '脑出血患者发病时间'] // 脑出血患者发病时间
  const cerebralHemorrhage = formData['入院情况' + '脑出血患者到院时间'] ? new Date(formData['入院情况' + '脑出血患者到院时间']) : formData['入院情况' + '脑出血患者到院时间'] // 脑出血患者到院时间
  const startSuctionTimeOfCerebral = formData['脑出血手术' + '脑出血手术开始时间'] ? new Date(formData['脑出血手术' + '脑出血手术开始时间']) : formData['脑出血手术' + '脑出血手术开始时间'] // 脑出血手术开始时间

  // 手术及操作名称,手术及操作编码,手术日期为一组需同时存在
  if (['手术记录（病案首页中原始信息）' + '手术及操作名称', '手术记录（病案首页中原始信息）' + '手术及操作编码', '手术记录（病案首页中原始信息）' + '手术日期'].includes(field.replace(/\d+$/, ''))) {
    for (let i = 1; i <= 6; i++) {
      const valList = [formData['手术记录（病案首页中原始信息）' + '手术及操作名称' + i], formData['手术记录（病案首页中原始信息）' + '手术及操作编码' + i], formData['手术记录（病案首页中原始信息）' + '手术日期' + i]]
      const errMsg = `手术及操作名称${i},手术及操作编码${i},手术日期${i}为一组需同时存在`
      const conditionalJudgment = !(valList.every(val => _.isString(val)) || valList.every(val => !_.isString(val)))
      errorCollectorHandler('手术记录（病案首页中原始信息）手术及操作名称' + i, errMsg, conditionalJudgment ? 'add' : 'del')
      errorCollectorHandler('手术记录（病案首页中原始信息）手术及操作编码' + i, errMsg, conditionalJudgment ? 'add' : 'del')
      errorCollectorHandler('手术记录（病案首页中原始信息）手术日期' + i, errMsg, conditionalJudgment ? 'add' : 'del')
    }
    callback()
  }

  if (['出院其他诊断（病案首页中原始信息）' + '其他诊断名称', '出院其他诊断（病案首页中原始信息）' + '其他诊断编码'].includes(field.replace(/\d+$/, ''))) {
    const num = field.match(/\d+/)[0]
    const valList = [formData['出院其他诊断（病案首页中原始信息）' + '其他诊断名称' + num], formData['出院其他诊断（病案首页中原始信息）' + '其他诊断编码' + num]]
    const errMsg = `其他诊断名称${num}与其他诊断编码${num}为一组需同时存在`
    const conditionalJudgment = !(valList.every(val => val) || valList.every(val => !val))
    errorCollectorHandler('出院其他诊断（病案首页中原始信息）' + '其他诊断名称' + num, errMsg, conditionalJudgment ? 'add' : 'del')
    errorCollectorHandler('出院其他诊断（病案首页中原始信息）' + '其他诊断编码' + num, errMsg, conditionalJudgment ? 'add' : 'del')
    callback()
  }

  if (['入院情况' + '脑梗死患者发病时间', '入院情况' + '脑梗死患者到院时间', '入出院信息' + '住院日期', '入院情况' + '脑梗死发病是否在院', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline(
      [timeOfCerebral, cerebralTime, start],
      [
        ['入院情况', '脑梗死患者发病时间'],
        ['入院情况', '脑梗死患者到院时间'],
        ['入出院信息', '住院日期']
      ], '条件1'
    )
    if (whetherItIsClear && timeOfCerebral && cerebralTime) {
      conditionalJudgment.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      callback()
    } else {
      conditionalJudgment.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, 'del')
        errorCollectorHandler(item.previousField, item.errMsg, 'del')
      })
    }
  }

  // 发病时间＜开始静脉溶栓时间＜二次发病时间＜穿刺完成时间＜首次血管成功再通时间＜死亡时间＜出院时间
  if (['AIS静脉溶栓开始静脉溶栓时间', 'AIS血管内治疗二次发病时间', 'AIS血管内治疗穿刺完成时间', 'AIS血管内治疗首次血管成功再通时间', '出院情况死亡时间', '入出院信息出院日期', '入院情况' + '脑梗死发病是否在院', '入院情况' + '脑梗死患者发病时间', '入院情况' + '脑梗死患者到院时间', '入院情况' + '脑梗死发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline(
      [timeOfCerebral, startSuctionTime, endSuctionTime, strangingTime, theFirstBloodVesselsAreThroughTime, deathTime, end],
      [
        ['入院情况', '脑梗死患者发病时间'],
        ['AIS静脉溶栓', '开始静脉溶栓时间'],
        ['AIS血管内治疗', '二次发病时间'],
        ['AIS血管内治疗', '穿刺完成时间'],
        ['AIS血管内治疗', '首次血管成功再通时间'],
        ['出院情况', '死亡时间'],
        ['入出院信息', '出院日期']
      ], '条件2'
    )
    if (whetherItIsClear && timeOfCerebral && cerebralTime) {
      conditionalJudgment.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      callback()
    } else {
      if (['入院情况' + '脑梗死发病是否在院', '入院情况' + '脑梗死患者发病时间', '入院情况' + '脑梗死患者到院时间', '入院情况' + '脑梗死发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
        conditionalJudgment.forEach(item => {
          errorCollectorHandler(item.errorField, item.errMsg, 'del')
          errorCollectorHandler(item.previousField, item.errMsg, 'del')
        })
        callback()
      }
    }
  }

  // 发病时间＜到院时间＜二次发病时间＜穿刺完成时间＜首次血管成功再通时间＜死亡时间＜出院时间
  if (['入院情况' + '脑梗死患者发病时间', '入院情况' + '脑梗死患者到院时间', 'AIS血管内治疗二次发病时间', 'AIS血管内治疗穿刺完成时间', 'AIS血管内治疗首次血管成功再通时间', '出院情况死亡时间', '入出院信息出院日期', '入院情况' + '脑梗死发病是否在院', '入院情况' + '脑梗死患者发病时间', '入院情况' + '脑梗死患者到院时间', '入院情况' + '脑梗死发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline(
      [timeOfCerebral, cerebralTime, endSuctionTime, strangingTime, theFirstBloodVesselsAreThroughTime, deathTime, end],
      [
        ['入院情况', '脑梗死患者发病时间'],
        ['入院情况', '脑梗死患者到院时间'],
        ['AIS血管内治疗', '二次发病时间'],
        ['AIS血管内治疗', '穿刺完成时间'],
        ['AIS血管内治疗', '首次血管成功再通时间'],
        ['出院情况', '死亡时间'],
        ['入出院信息', '出院日期']
      ], '条件3'
    )
    if (whetherItIsClear && timeOfCerebral && cerebralTime) {
      conditionalJudgment.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      callback()
    } else {
      if (['入院情况' + '脑梗死发病是否在院', '入院情况' + '脑梗死患者发病时间', '入院情况' + '脑梗死患者到院时间', '入院情况' + '脑梗死发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
        conditionalJudgment.forEach(item => {
          errorCollectorHandler(item.errorField, item.errMsg, 'del')
          errorCollectorHandler(item.previousField, item.errMsg, 'del')
        })
        callback()
      }
    }
  }

  // 发病时间=到院时间到院时间＜开始静脉溶栓时间＜二次发病时间＜穿刺完成时间＜首次血管成功再通时间＜死亡时间＜出院时间
  if (['入院情况' + '脑梗死患者发病时间', '入院情况' + '脑梗死患者到院时间', 'AIS静脉溶栓开始静脉溶栓时间', 'AIS血管内治疗二次发病时间', 'AIS血管内治疗穿刺完成时间', 'AIS血管内治疗首次血管成功再通时间', '出院情况死亡时间', '入出院信息出院日期', '入院情况' + '脑梗死发病是否在院', '入院情况' + '脑梗死发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment1 = validateTimeline(
      [timeOfCerebral, startSuctionTime, endSuctionTime, strangingTime, theFirstBloodVesselsAreThroughTime, deathTime, end],
      [
        ['入院情况', '脑梗死患者发病时间'],
        ['AIS静脉溶栓', '开始静脉溶栓时间'],
        ['AIS血管内治疗', '二次发病时间'],
        ['AIS血管内治疗', '穿刺完成时间'],
        ['AIS血管内治疗', '首次血管成功再通时间'],
        ['出院情况', '死亡时间'],
        ['入出院信息', '出院日期']
      ], '条件4'
    )

    const conditionalJudgment2 = validateTimeline(
      [cerebralTime, startSuctionTime, endSuctionTime, strangingTime, theFirstBloodVesselsAreThroughTime, deathTime, end],
      [
        ['入院情况', '脑梗死患者到院时间'],
        ['AIS静脉溶栓', '开始静脉溶栓时间'],
        ['AIS血管内治疗', '二次发病时间'],
        ['AIS血管内治疗', '穿刺完成时间'],
        ['AIS血管内治疗', '首次血管成功再通时间'],
        ['出院情况', '死亡时间'],
        ['入出院信息', '出院日期']
      ], '条件5'
    )

    if (!whetherItIsClear && timeOfCerebral && cerebralTime) {
      errorCollectorHandler('入院情况' + '脑梗死患者发病时间', '脑梗死患者发病时间=脑梗死患者到院时间', !(String(timeOfCerebral) === String(cerebralTime)) ? 'add' : 'del')
      errorCollectorHandler('入院情况' + '脑梗死患者到院时间', '脑梗死患者发病时间=脑梗死患者到院时间', !(String(timeOfCerebral) === String(cerebralTime)) ? 'add' : 'del')
      conditionalJudgment1.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      conditionalJudgment2.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      callback()
    } else {
      if (['入院情况' + '脑梗死发病是否在院', '入院情况' + '脑梗死患者发病时间', '入院情况' + '脑梗死患者到院时间', '入院情况' + '脑梗死发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
        errorCollectorHandler('入院情况' + '脑梗死患者发病时间', '脑梗死患者发病时间=脑梗死患者到院时间', 'del')
        errorCollectorHandler('入院情况' + '脑梗死患者到院时间', '脑梗死患者发病时间=脑梗死患者到院时间', 'del')
        conditionalJudgment1.forEach(item => {
          errorCollectorHandler(item.errorField, item.errMsg, 'del')
          errorCollectorHandler(item.previousField, item.errMsg, 'del')
        })
        conditionalJudgment2.forEach(item => {
          errorCollectorHandler(item.errorField, item.errMsg, 'del')
          errorCollectorHandler(item.previousField, item.errMsg, 'del')
        })
        callback()
      }
    }
  }

  // 发病时间＜到院时间＜住院时间＜死亡时间＜出院时间
  if (['入院情况' + '脑出血患者发病时间', '入院情况' + '脑出血患者到院时间', '入出院信息' + '住院日期', '入院情况' + '脑出血发病是否在院', '出院情况死亡时间', '入出院信息出院日期', '入院情况' + '脑出血发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline(
      [timeOfOnsetOfCerebral, cerebralHemorrhage, start, deathTime, end],
      [
        ['入院情况', '脑出血患者发病时间'],
        ['入院情况', '脑出血患者到院时间'],
        ['入出院信息', '住院日期'],
        ['出院情况', '死亡时间'],
        ['入出院信息', '出院日期']
      ], '条件6'
    )
    if (whetherItIsClearOfCerebral && timeOfOnsetOfCerebral && cerebralHemorrhage) {
      conditionalJudgment.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      callback()
    } else {
      if (['入院情况' + '脑出血发病是否在院', '入院情况' + '脑出血患者发病时间', '入院情况' + '脑出血患者到院时间', '入院情况' + '脑出血发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
        conditionalJudgment.forEach(item => {
          errorCollectorHandler(item.errorField, item.errMsg, 'del')
          errorCollectorHandler(item.previousField, item.errMsg, 'del')
        })
        callback()
      }
    }
  }

  // 发病时间＜到院时间＜脑出血手术开始时间＜死亡时间＜出院时间
  if (['入院情况' + '脑出血患者发病时间', '入院情况' + '脑出血患者到院时间', '脑出血手术' + '脑出血手术开始时间', '入院情况' + '脑出血发病是否在院', '出院情况死亡时间', '入出院信息出院日期', '入院情况' + '脑出血发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline(
      [timeOfOnsetOfCerebral, cerebralHemorrhage, startSuctionTimeOfCerebral, deathTime, end],
      [
        ['入院情况', '脑出血患者发病时间'],
        ['入院情况', '脑出血患者到院时间'],
        ['脑出血手术', '脑出血手术开始时间'],
        ['出院情况', '死亡时间'],
        ['入出院信息', '出院日期']
      ], '条件7'
    )
    if (whetherItIsClearOfCerebral && timeOfOnsetOfCerebral && cerebralHemorrhage) {
      conditionalJudgment.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      callback()
    } else {
      if (['入院情况' + '脑出血发病是否在院', '入院情况' + '脑出血患者发病时间', '入院情况' + '脑出血患者到院时间', '入院情况' + '脑出血发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
        conditionalJudgment.forEach(item => {
          errorCollectorHandler(item.errorField, item.errMsg, 'del')
          errorCollectorHandler(item.previousField, item.errMsg, 'del')
        })
        callback()
      }
      callback()
    }
  }

  // 发病时间=到院时间＜脑出血手术开始时间＜死亡时间＜出院时间
  if (['入院情况' + '脑出血患者发病时间', '入院情况' + '脑出血患者到院时间', '脑出血手术' + '脑出血手术开始时间', '入院情况' + '脑出血发病是否在院', '出院情况死亡时间', '入出院信息出院日期', '入院情况' + '脑出血发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment1 = validateTimeline(
      [timeOfOnsetOfCerebral, startSuctionTimeOfCerebral, deathTime, end],
      [
        ['入院情况', '脑出血患者发病时间'],
        ['脑出血手术', '脑出血手术开始时间'],
        ['出院情况', '死亡时间'],
        ['入出院信息', '出院日期']
      ], '条件8'
    )

    const conditionalJudgment2 = validateTimeline(
      [cerebralHemorrhage, startSuctionTimeOfCerebral, deathTime, end],
      [
        ['入院情况', '脑出血患者到院时间'],
        ['脑出血手术', '脑出血手术开始时间'],
        ['出院情况', '死亡时间'],
        ['入出院信息', '出院日期']
      ], '条件9'
    )

    if (!whetherItIsClearOfCerebral && timeOfOnsetOfCerebral && cerebralHemorrhage) {
      errorCollectorHandler('入院情况' + '脑出血患者发病时间', '脑出血患者发病时间=脑出血患者到院时间', !(String(timeOfOnsetOfCerebral) === String(cerebralHemorrhage)) ? 'add' : 'del')
      errorCollectorHandler('入院情况' + '脑出血患者到院时间', '脑出血患者发病时间=脑出血患者到院时间', !(String(timeOfOnsetOfCerebral) === String(cerebralHemorrhage)) ? 'add' : 'del')
      conditionalJudgment1.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      conditionalJudgment2.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })
      callback()
    } else {
      if (['入院情况' + '脑出血发病是否在院', '入院情况' + '脑出血患者发病时间', '入院情况' + '脑出血患者到院时间', '入院情况' + '脑出血发病时间是否明确', '治疗类型治疗类型'].includes(field)) {
        errorCollectorHandler('入院情况' + '脑出血患者发病时间', '脑出血患者发病时间=脑出血患者到院时间', 'del')
        errorCollectorHandler('入院情况' + '脑出血患者到院时间', '脑出血患者发病时间=脑出血患者到院时间', 'del')
        conditionalJudgment1.forEach(item => {
          errorCollectorHandler(item.errorField, item.errMsg, 'del')
          errorCollectorHandler(item.previousField, item.errMsg, 'del')
        })
        conditionalJudgment2.forEach(item => {
          errorCollectorHandler(item.errorField, item.errMsg, 'del')
          errorCollectorHandler(item.previousField, item.errMsg, 'del')
        })
        callback()
      }
    }
  }

  // 死亡时间<动脉瘤发病时间
  const anesthesiaIncidenceTime = formData['入院情况动脉瘤发病时间'] ? new Date(formData['入院情况动脉瘤发病时间']) : formData['入院情况动脉瘤发病时间']
  if (['出院情况死亡时间', '入院情况动脉瘤发病时间', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline([anesthesiaIncidenceTime, deathTime], [['入院情况', '动脉瘤发病时间'], ['出院情况', '死亡时间']])
    conditionalJudgment.forEach(item => {
      errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
      errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
    })
    callback()
  }

  // 住院时间＜死亡时间≤出院日期
  if (['入出院信息住院日期', '入出院信息出院日期', '出院情况死亡时间', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline([start, deathTime, end], [['入出院信息', '住院日期'], ['出院情况', '死亡时间'], ['入出院信息', '出院日期']])
    conditionalJudgment.forEach(item => {
      errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
      errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
    })
    callback()
  }

  // CEA/CAS手术开始时间＜死亡时间＜出院时间
  if (['CEA/CAS手术CEA/CAS手术开始时间', '出院情况死亡时间', '入出院信息出院日期', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline([ceaStart, deathTime, end], [['CEA/CAS手术', 'CEA/CAS手术开始时间'], ['出院情况', '死亡时间'], ['入出院信息', '出院日期']])
    conditionalJudgment.forEach(item => {
      errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
      errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
    })
    callback()
  }

  // AVM治疗时间＜死亡时间＜出院时间
  if (['颅内AVM登记AVM治疗时间', '出院情况死亡时间', '入出院信息出院日期', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline([avmStart, deathTime, end], [['颅内AVM登记', 'AVM治疗时间'], ['出院情况', '死亡时间'], ['入出院信息', '出院日期']])
    conditionalJudgment.forEach(item => {
      errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
      errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
    })
    callback()
  }

  // 烟雾病手术开始时间＜死亡时间＜出院时间
  if (['烟雾病登记烟雾病手术开始时间', '出院情况死亡时间', '入出院信息出院日期', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline([smokeStart, deathTime, end], [['烟雾病登记', '烟雾病手术开始时间'], ['出院情况', '死亡时间'], ['入出院信息', '出院日期']])
    conditionalJudgment.forEach(item => {
      errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
      errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
    })
    callback()
  }

  // 动脉瘤手术开始时间＜死亡时间＜出院时间
  const aneurysmysm = formData['动脉瘤手术' + '动脉瘤数量']
  if (field.replace(/[0-9]+/g, '') === '动脉瘤手术动脉瘤手术时间' || ['出院情况' + '死亡时间', '入出院信息' + '出院日期'].includes(field)) {
    for (let index = 1; index <= aneurysmysm; index++) {
      const aneurysmStart = formData['动脉瘤手术' + '动脉瘤' + index + '手术时间'] ? new Date(formData['动脉瘤手术' + '动脉瘤' + index + '手术时间']) : formData['动脉瘤手术' + '动脉瘤' + index + '手术时间']
      const conditionalJudgment = validateTimeline([aneurysmStart, deathTime, end], [['动脉瘤手术', '动脉瘤' + index + '手术时间'], ['出院情况', '死亡时间'], ['入出院信息', '出院日期']])
      conditionalJudgment.forEach(item => {
        errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
        errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
      })

      callback()
    }
  }

  // 脑梗死患者发病时间<二次发病时间
  if (['入院情况' + '脑梗死患者发病时间', 'AIS血管内治疗二次发病时间', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline([timeOfCerebral, endSuctionTime], [['入院情况', '脑梗死患者发病时间'], ['AIS血管内治疗', '二次发病时间']])
    conditionalJudgment.forEach(item => {
      errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
      errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
    })
    callback()
  }

  if (['体格检查' + '入院后首次收缩压', '体格检查' + '入院后首次舒张压', '治疗类型治疗类型'].includes(field)) {
    const errMsg = '入院后首次收缩压必须大于入院后首次舒张压'
    console.log(formData['体格检查' + '入院后首次收缩压'], formData['体格检查' + '入院后首次舒张压'])
    if ((formData['体格检查' + '入院后首次收缩压'] || formData['体格检查' + '入院后首次收缩压'] === 0) && (formData['体格检查' + '入院后首次舒张压'] || formData['体格检查' + '入院后首次舒张压'] === 0)) {
      const conditionalJudgment = (Number(formData['体格检查' + '入院后首次收缩压']) <= Number(formData['体格检查' + '入院后首次舒张压']))
      errorCollectorHandler('体格检查' + '入院后首次收缩压', errMsg, conditionalJudgment ? 'add' : 'del')
      errorCollectorHandler('体格检查' + '入院后首次舒张压', errMsg, conditionalJudgment ? 'add' : 'del')
    } else {
      errorCollectorHandler('体格检查' + '入院后首次收缩压', errMsg, 'del')
      errorCollectorHandler('体格检查' + '入院后首次舒张压', errMsg, 'del')
    }
    callback()
  }

  if (['入出院信息住院日期', '入出院信息出院日期', '治疗类型治疗类型'].includes(field)) {
    const conditionalJudgment = validateTimeline([start, end], [['入出院信息', '住院日期'], ['入出院信息', '出院日期']], '条件10')
    conditionalJudgment.forEach(item => {
      errorCollectorHandler(item.errorField, item.errMsg, item.valid ? 'add' : 'del')
      errorCollectorHandler(item.previousField, item.errMsg, item.valid ? 'add' : 'del')
    })
    callback()
  }

  errorCollectorHandler('入出院信息出院日期', '死亡时间<出院日期', 'del')
  errorCollectorHandler('出院情况死亡时间', '死亡时间<出院日期', 'del')

  // 住院时间＜死亡时间≤出院日期
  if (['入出院信息出院日期', '出院情况死亡时间', '治疗类型治疗类型'].includes(field)) {
    if (deathTime && end) {
      errorCollectorHandler('入出院信息出院日期', '死亡时间≤出院日期', deathTime > end ? 'add' : 'del')
      errorCollectorHandler('出院情况死亡时间', '死亡时间≤出院日期', deathTime > end ? 'add' : 'del')
      callback()
    } else {
      errorCollectorHandler('入出院信息出院日期', '死亡时间≤出院日期', 'del')
      errorCollectorHandler('出院情况死亡时间', '死亡时间≤出院日期', 'del')
      callback()
    }
  }
  callback()
}

const formatDateTime = (dateString, hours = '23', minutes = '59') => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2) // 注意月份是从 0 开始计数的
  const day = ('0' + date.getDate()).slice(-2)
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes
}

// 计算字符串的长度，其中中文字符（包括其他全角字符）计算为一个字符，字母、数字和特殊字符（半角字符）计算为0.5个字符
export const calculateLength = (text) => {
  let length = 0
  _.forEach(text, (char) => {
    // 检查是否为中文字符或其他全角字符
    if (char.match(/[^\x00-\xff]/)) {
      length += 1
    } else {
      length += 0.5
    }
  })
  return length
}

const isValid18DigitIdCard = (idCard) => {
  // 正则校验格式：前17位数字+末位数字/X/x
  const regex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/
  if (!regex.test(idCard)) {
    return false
  }

  // 校验码计算
  const idChars = idCard.toUpperCase().split('')
  const factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idChars[i]) * factors[i]
  }

  const mod = sum % 11
  return idChars[17] === checkCodes[mod]
}
