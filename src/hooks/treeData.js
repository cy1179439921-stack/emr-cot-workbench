
import { getAllDisease, getOthersIndex, getAllAgency, getAllAgencyWithRole } from '@/api/api_homePage.js'
import { getDiagnosisCodeList, getOperationCodeList } from '@/api/jiancanAPI/api_home'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import lodash from 'lodash'
export function useTree(withRole, isCaseBase) {
  const sexEnumValues = [
    {
      name: '男',
      id: 1
    },
    {
      name: '女',
      id: 2
    },
    {
      name: '未知',
      id: 0
    }
  ]
  const medicalRecordTypeEnumValues = [
    {
      name: '住院',
      id: 1
    },
    {
      name: '门急诊',
      id: 2
    },
    {
      name: '体检',
      id: 3
    }
  ]
  const relationEnumValues = [
    {
      name: '大于',
      id: 1,
      value: 'gt'
    },
    {
      name: '等于',
      id: 2,
      value: 'eq'
    },
    {
      name: '小于',
      id: 3,
      value: 'lt'
    },
    {
      name: '介于',
      id: 4,
      value: 'between'
    }
  ]
  const diagnosisList = ref([])
  const diagnosisCodeList = ref([])
  const operationList = ref([])
  const operationCodeList = ref([])
  const initTreeData = reactive([
    {
      label: '显示全部',
      id: '0',
      children: [
        {
          label: '就诊属性',
          id: '1',
          children: [
            {
              label: '就诊类型',
              id: '1-6',
              soleID: '1-6',
              value: 'medicalRecordTypeList',
              type: 'mulSelect',
              minWidth: 90,
              EnumValues: medicalRecordTypeEnumValues,
              html: true,
              isEnter: true
            },
            {
              label: '就诊医院',
              id: '1-1',
              soleID: '1-1',
              type: 'mulSelect',
              value: 'agencyIdList',
              minWidth: 140,
              formatter: (row) => {
                const arr = lodash.filter(agencyIdList.value, { id: row.agencyId })
                return arr.length ? arr[0].name : '-'
              }
            },
            {
              label: '病种',
              id: '1-2',
              soleID: '1-2',
              type: 'mulSelect',
              value: 'diseaseTypeIdList',
              showToolTip: false,
              // className: 'customToolTip',
              isShowSearch: true,
              minWidth: 120,
              html: true
              // formatter: (row) => {
              //   let name = ''
              //   diseaseTypeIdList.value.forEach(item => {
              //     if (row.diseaseTypeIdList?.includes(item.id)) {
              //       name ? name += ('，' + item.name) : name += item.name
              //     }
              //   })
              //   return name || '-'
              // }
            },
            {
              label: '就诊日期',
              id: '1-3',
              soleID: '1-3',
              type: 'datePicker',
              value: 'enterHospitalDate',
              minWidth: 80,
              formatter: (row) => {
                return row?.enterHospitalDate || '-'
              }
            },
            {
              label: '入库时间',
              id: '1-4',
              soleID: '1-4',
              type: 'datetimerange',
              value: 'createTime',
              minWidth: 120,
              formatter: (row) => {
                return row?.createTime || '-'
              }
            }
            // {
            //   label: '患者总就诊次数',
            //   id: '1-5',
            //   type: 'text',
            //   value: 'visitNumber',
            //   minWidth: 120
            // }
          ]
        },
        {
          label: '基本信息',
          id: '2',
          children: [
            {
              label: '性别',
              id: '2-1',
              soleID: '2-1',
              type: 'select',
              value: 'sex',
              width: 60,
              EnumValues: sexEnumValues,
              formatter: (row) => {
                const obj = lodash.find(sexEnumValues, { id: row.sex })
                return obj?.name || '-'
              }
            },
            {
              label: '年龄',
              id: '2-2',
              soleID: '2-2',
              width: 60,
              isFixed: true,
              type: 'relationSelect',
              value: 'age', // 大于 等于 小于时候的值
              rangeValue: 'ageRange', // 介于 关系时候的值
              relationValue: 'relationValue', // 关系值 大于 等于 小于 介于
              EnumValues: relationEnumValues,
              precision: 0,
              valueRange: [1, 120],
              min: 1,
              max: 120,
              formatter: (row) => {
                return String(row?.age) || '-'
              }
            },
            {
              label: '病案号',
              id: '2-3',
              soleID: '2-3',
              type: 'text',
              value: 'hospitalNumber',
              minWidth: 100,
              formatter: (row) => {
                return row?.hospitalNumber || '-'
              }
            }
          ]
        }
      ]
    }
  ])
  const initTreeData2 = reactive([
    {
      label: '显示全部',
      id: '0',
      children: [
        {
          label: '就诊属性',
          id: '1',
          children: [
            {
              label: '就诊类型',
              id: '1-6',
              soleID: '1-6',
              value: 'medicalRecordTypeList',
              type: 'mulSelect',
              minWidth: 90,
              codomainType: 4,
              EnumValues: medicalRecordTypeEnumValues,
              html: true,
              isEnter: true
            },
            {
              label: '就诊医院',
              id: '1-1',
              soleID: '1-1',
              type: 'mulSelect',
              value: 'agencyIdList',
              codomainType: 4,
              minWidth: 140,
              formatter: (row) => {
                const arr = lodash.filter(agencyIdList.value, { id: row.agencyId })
                return arr.length ? arr[0].name : '-'
              }
            },
            {
              label: '病种',
              id: '1-2',
              soleID: '1-2',
              type: 'mulSelect',
              value: 'diseaseTypeIdList',
              isShowSearch: true,
              codomainType: 4,
              minWidth: 140,
              showToolTip: false,
              className: 'customToolTip',
              html: true
              // formatter: (row) => {
              //   let name = ''
              //   diseaseTypeIdList.value.forEach(item => {
              //     if (row.diseaseTypeIdList?.includes(item.id)) {
              //       name ? name += ('，' + item.name) : name += item.name
              //     }
              //   })
              //   return name || '-'
              // }
            },
            {
              label: '就诊日期',
              id: '1-3',
              soleID: '1-3',
              type: 'datePicker',
              codomainType: 6,
              value: 'enterHospitalDate',
              minWidth: 120,
              formatter: (row) => {
                return row?.enterHospitalDate || '-'
              }
            },
            {
              label: '入库时间',
              id: '1-4',
              soleID: '1-4',
              type: 'datetimerange',
              codomainType: 5,
              value: 'createTime',
              minWidth: 120,
              formatter: (row) => {
                return row?.createTime || '-'
              }
            }
            // {
            //   label: '患者总就诊次数',
            //   id: '1-5',
            //   type: 'text',
            //   value: 'visitNumber',
            //   minWidth: 120
            // }
          ]
        },
        {
          label: '病案首页',
          id: '2',
          children: [
            {
              label: '基本信息',
              id: '2-1',
              children: [
                {
                  label: '性别',
                  id: '2-1-1',
                  soleID: '2-1-1',
                  type: 'select',
                  codomainType: 4,
                  value: 'sex',
                  width: 60,
                  EnumValues: sexEnumValues,
                  formatter: (row) => {
                    const obj = lodash.find(sexEnumValues, { id: row.sex })
                    return obj?.name || '-'
                  }
                },
                {
                  label: '年龄',
                  id: '2-1-2',
                  soleID: '2-1-2',
                  width: 60,
                  isFixed: true,
                  type: 'relationSelect',
                  codomainType: 1,
                  value: 'age', // 大于 等于 小于时候的值
                  rangeValue: 'ageRange', // 介于 关系时候的值
                  relationValue: 'relationValue', // 关系值 大于 等于 小于 介于
                  EnumValues: relationEnumValues,
                  precision: 0,
                  min: 1,
                  max: 120,
                  valueRange: [1, 120],
                  formatter: (row) => {
                    return String(row?.age) || '-'
                  }
                },
                {
                  label: '病案号',
                  id: '2-1-3',
                  soleID: '2-1-3',
                  type: 'text',
                  codomainType: 3,
                  value: 'hospitalNumber',
                  minWidth: 100,
                  formatter: (row) => {
                    return row?.hospitalNumber || '-'
                  }
                }
              ]
            },
            {
              label: '入出院信息',
              id: '2-6',
              children: [
                {
                  label: '入院时间',
                  id: '2-6-1',
                  soleID: '2-6-1',
                  type: 'datetimerange',
                  value: 'enterHospitalTime',
                  minWidth: 120,
                  codomainType: 5,
                  formatter: (row) => {
                    return row?.enterHospitalTime || '-'
                  }
                },
                {
                  label: '出院时间',
                  id: '2-6-2',
                  soleID: '2-6-2',
                  type: 'datetimerange',
                  value: 'exitHospitalTime',
                  codomainType: 5,
                  minWidth: 120,
                  formatter: (row) => {
                    return row?.exitHospitalTime || '-'
                  }
                }
              ]
            },
            {
              label: '门（急）诊诊断信息',
              id: '2-2',
              children: [
                {
                  label: '门（急）诊诊断-诊断名称',
                  id: '2-2-1',
                  soleID: '2-2-1',
                  type: 'select-v2',
                  codomainType: 4,
                  minWidth: 90,
                  EnumValues: diagnosisList,
                  value: 'clinicDiagnosisNameList',
                  // minWidth: 100,
                  formatter: (row) => {
                    return row?.clinicDiagnosisName || '-'
                  }
                },
                {
                  label: '门（急）诊诊断-疾病编码',
                  id: '2-2-2',
                  soleID: '2-2-2',
                  type: 'select-v2',
                  codomainType: 4,
                  minWidth: 90,
                  EnumValues: diagnosisCodeList,
                  value: 'clinicDiagnosisIcd10List',
                  // minWidth: 100,
                  formatter: (row) => {
                    return row?.clinicDiagnosisIcd10 || '-'
                  }
                }
              ]
            },
            {
              label: '出院诊断-主要诊断',
              id: '2-3',
              children: [
                {
                  label: '主要诊断-诊断名称',
                  id: '2-3-1',
                  soleID: '2-3-1',
                  type: 'select-v2',
                  codomainType: 4,
                  minWidth: 140,
                  EnumValues: diagnosisList,
                  value: 'mainDiagnosisList',
                  formatter: (row) => {
                    return row?.mainDiagnosis || '-'
                  }
                },
                {
                  label: '主要诊断-疾病编码',
                  id: '2-3-2',
                  soleID: '2-3-2',
                  type: 'select-v2',
                  codomainType: 4,
                  minWidth: 90,
                  EnumValues: diagnosisCodeList,
                  value: 'mainDiagnosisIcd10List',
                  // minWidth: 100,
                  formatter: (row) => {
                    return row?.mainDiagnosisIcd10 || '-'
                  }
                }
              ]
            },
            {
              label: '出院诊断-其他诊断',
              id: '2-4',
              children: [
                {
                  label: '其他诊断-诊断名称',
                  id: '2-4-1',
                  soleID: '2-4-1',
                  type: 'select-v2',
                  codomainType: 4,
                  minWidth: 180,
                  EnumValues: diagnosisList,
                  value: 'otherDiagnosisList',
                  showToolTip: false,
                  html: true
                  // formatter: (row) => {
                  //   let str = ''
                  //   row?.otherDiagnosisList.forEach((item, index) => {
                  //     str += (index + 1) + '、' + item + '；'
                  //   })
                  //   return str || '-'
                  // }
                },
                {
                  label: '其他诊断-疾病编码',
                  id: '2-4-2',
                  soleID: '2-4-2',
                  type: 'select-v2',
                  codomainType: 4,
                  minWidth: 180,
                  EnumValues: diagnosisCodeList,
                  value: 'otherDiagnosisIcd10List',
                  showToolTip: false,
                  html: true
                  // formatter: (row) => {
                  //   let str = ''
                  //   row?.otherDiagnosisIcd10List.forEach((item, index) => {
                  //     str += (index + 1) + '、' + item + '；'
                  //   })
                  //   return str || '-'
                  // }
                }
              ]
            },
            {
              label: '手术信息',
              id: '2-5',
              children: [
                {
                  label: '手术及操作编码',
                  id: '2-5-1',
                  soleID: '2-5-1',
                  type: 'select-v2',
                  codomainType: 4,
                  minWidth: 180,
                  EnumValues: operationCodeList,
                  value: 'operateCodeList',
                  showToolTip: false,
                  html: true
                  // formatter: (row) => {
                  //   let str = ''
                  //   row?.operateCodeList.forEach((item, index) => {
                  //     str += (index + 1) + '、' + item + '；'
                  //   })
                  //   return str || '-'
                  // }
                },
                {
                  label: '手术及操作日期',
                  id: '2-5-2',
                  soleID: '2-5-2',
                  type: 'datetimerange',
                  value: 'operateDateList',
                  codomainType: 5,
                  minWidth: 180,
                  showToolTip: false,
                  html: true
                  // formatter: (row) => {
                  //   let str = ''
                  //   row?.operateDateList.forEach((item, index) => {
                  //     str += (index + 1) + '、' + item + '；'
                  //   })
                  //   return str || '-'
                  // }
                },
                {
                  label: '手术及操作名称',
                  id: '2-5-3',
                  soleID: '2-5-3',
                  type: 'select-v2',
                  codomainType: 4,
                  minWidth: 180,
                  EnumValues: operationList,
                  value: 'operateNameList',
                  showToolTip: false,
                  html: true
                  // formatter: (row) => {
                  //   let str = ''
                  //   row?.operateNameList.forEach((item, index) => {
                  //     str += (index + 1) + '、' + item + '；'
                  //   })
                  //   return str || '-'
                  // }
                }
              ]
            }
          ]
        }
      ]
    }
  ])
  const othersTreeData = ref([])
  const agencyIdList = ref([])
  // const agencyIds = reactive([])
  const diseaseTypeIdList = ref([])
  // const diseaseTypeIds = reactive([])
  const recursionFn = (arr, key, data, all) => {
    arr.forEach(item => {
      if (item.value === key) {
        item.EnumValues = all ? (key === 'agencyIdList' ? agencyIdList.value : diseaseTypeIdList.value) : data
      }
      if (item.children) {
        recursionFn(item.children, key, data, all)
      }
    })
  }
  const getOthersIndexFn = (id, init) => {
    return new Promise((resolve, reject) => {
      // 如果有id,或者初始化就进行数据请求
      const params = { queueId: id }
      getOthersIndex(params).then(res => {
        if (res.code === 10000) {
          handelOthersIndex(res.data)
          othersTreeData.value = res.data
          resolve()
        }
      })
    })
  }
  // eslint-disable-next-line no-unused-vars
  const calculateStringLength = (str) => {
    let length = 0
    for (let i = 0; i < str.length; i++) {
      // 使用正则表达式判断字符是否为中文字符
      if (/[\u4e00-\u9fa5]/.test(str[i])) {
        length += 2 // 如果是中文字符，长度加2
      } else {
        length += 1 // 如果是英文或数字字符，长度加1
      }
    }
    return length
  }
  const handelOthersIndex = (initData) => {
    const fn = (arr, id) => {
      arr.forEach(item => {
        item.soleID = id + '-' + item.id
        item.label = item.name || ''
        // const length = calculateStringLength(item.label)
        // item.width = length <= 30 ? (length * 10 < 90 ? 90 : length * 10) : 30 * 8
        item.type = item.indexSearchType || ''
        item.value = 'customIndex-' + item.id
        if ((item.type === 'select' || item.type === 'mulSelect')) {
          item.EnumValues = []
          const valuesArr = item.enumOptionsString?.split(',') || []
          valuesArr.forEach(v => {
            item.EnumValues.push({
              name: v,
              id: v
            })
          })
        }
        // 数值关系类型修改
        if (item.type === 'relationSelect') {
          item.EnumValues = relationEnumValues
          item.relationValue = 'relationValue-' + item.id
          item.rangeValue = item.id
          // item.max = Infinity
          // item.min = -Infinity
          // item.valueRange = [-Infinity, Infinity]
          // item.value = 'alone-' + item.id
        }
        if (!item.formatter) {
          item.formatter = (row) => {
            return lodash.isEmpty(row['customIndex-' + item.id]) ? '-' : row['customIndex-' + item.id]
          }
        }

        if (item.children) {
          item.children = item.children.concat(item.indexList)
          fn(item.children, item.soleID)
        } else {
          item.children = lodash.get(item.indexList)
        }
      })
    }
    fn(initData, '0')
  }
  onMounted(async () => {
    if (withRole) {
      await getAllAgencyWithRole({}).then(async res => {
        if (res.code === 10000) {
          agencyIdList.value = res.data
          recursionFn(initTreeData, 'agencyIdList', res.data)
          recursionFn(initTreeData2, 'agencyIdList', res.data)
        } else {
          ElMessage.error('医院列表加载失败，请刷新页面重试')
        }
      })
    } else {
      await getAllAgency({}).then(res => {
        if (res.code === 10000) {
          agencyIdList.value = res.data
          recursionFn(initTreeData, 'agencyIdList', res.data)
          recursionFn(initTreeData2, 'agencyIdList', res.data)
        } else {
          ElMessage.error('医院列表加载失败，请刷新页面重试')
        }
      })
    }
    await getAllDisease().then(res => {
      if (res.code === 10000) {
        const data = res.data.map(item => ({ ...item, label: item.name, value: item.id }))
        diseaseTypeIdList.value = data
        recursionFn(initTreeData, 'diseaseTypeIdList', data)
        recursionFn(initTreeData2, 'diseaseTypeIdList', data)
      } else {
        ElMessage.error('病种列表加载失败，请刷新页面重试')
      }
    })
    if (isCaseBase) {
      // 病例库需要获取这两项枚举值
      await getDiagnosisCodeList({
        pageNum: 1,
        pageSize: 50000
      }).then(res => {
        if (res.code === 10000) {
          const arr = lodash.get(res, 'data.items', [])
          arr.forEach(item => {
            diagnosisCodeList.value.push({
              label: `${item.code}（${item.name}）`,
              value: item.code
            })
            diagnosisList.value.push({
              label: `${item.code}（${item.name}）`,
              value: item.name
            })
          })
        }
      })
      await getOperationCodeList({
        pageNum: 1,
        pageSize: 50000
      }).then(res => {
        if (res.code === 10000) {
          const arr = lodash.get(res, 'data.items', [])
          arr.forEach(item => {
            operationCodeList.value.push({
              label: `${item.code}（${item.name}）`,
              value: item.code
            })
            operationList.value.push({
              label: `${item.code}（${item.name}）`,
              value: item.name
            })
          })
        }
      })
    }
  })
  return {
    initTreeData,
    initTreeData2,
    recursionFn,
    getOthersIndexFn,
    othersTreeData,
    diseaseTypeIdList,
    agencyIdList
    // diseaseTypeIds,
    // agencyIds
  }
}
