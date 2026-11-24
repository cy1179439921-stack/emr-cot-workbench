<template>
  <div class="content-medicalRecord">
    <el-dialog :model-value="true" :title="isMedicalRecord ? '导出病历' : '导出指标'" :width="pxToRem(560)"
               class="dialogDIV" @close="emit('closure')">
      <ul >
        <template v-if="props.isMedicalRecord">
          <li v-for="item in checkData" :key="item.label">
            <div class="section-title">
              <div class="line"></div>
              <div class="text" data-v-da8ccd08="">{{ item.label }}</div>
            </div>
            <div class="select-container">
              <el-checkbox class="select-all" v-model="item.checkAll" :indeterminate="item.isIndeterminate" @change="(val)=>handleCheckAllChange(val,item)">全选</el-checkbox>
              <div class="value">
                <el-checkbox-group v-model="item.value" @change="(val)=>handleCheckedCitiesChange(val,item)">
                  <el-checkbox v-for="item in item.list" :key="item" :value="item">{{ item }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </li>
        </template>
        <li>
          <div class="section-title"><div class="line"></div><div class="text" data-v-da8ccd08="">数据范围</div></div>
          <div class="value data-range">
            <el-radio-group v-model="dataRange">
              <el-radio v-for="item in checkListData" :key="item" :value="item">{{item}}</el-radio>
            </el-radio-group>
          </div>
        </li>
      </ul>
      <template #footer>
        <div class="dialog-footer">
          <div class="common-btn" @click="emit('closure')">取 消</div>
          <div class="common-btn primary btnSpace" @click="handleSub">确 认</div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { reactive, ref, h } from 'vue'
import {
  exportRecord,
  derivationOfMedicalRecordIndexConditionTree,
  exportRecordsFromMedicalRecordDatabaseConditionTree,
  verifyQuantitymedical,
  conditionTreeverifyQuantitymedical
} from '@/api/api_export'
import { nowDate } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import lodash from 'lodash'
const emit = defineEmits(['closure']) // 定义事件
const props = defineProps({
  isMedicalRecord: {
    type: Boolean,
    default: true
  },
  studyName: {
    type: String,
    default: '空'
  },
  studyCohort: {
    type: String,
    default: '0'
  },
  pageResult: {
    type: Object,
    default: () => {
      return {
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  mySearchRef: {
    type: Object,
    default: () => {
      return {}
    }
  },
  rgpaRef: Object,
  queryWay: {
    type: Number
  },
  search: Array,
  queryDimension: Number,
  total: {
    type: Number,
    default: 0
  }
})
const outpatient = ['基本信息', '门急诊病历（初诊）'] // 门急诊病历
const checkList = ['病案首页', '24小时入出院记录', '入院记录', '出院记录', '首次病程记录', '其他病程记录', '查房记录', '术前小结', '术后小结', '实验室检查', '影像检查', '病理', '手术记录', '医嘱'] // 住院病历
const medicalReport = ['基础信息', '实验室检查', '影像检查'] // 体检报告
const checkListData = ['当前数据页', '当前筛选数据'] // 数据范围

const checkData = reactive([
  { label: '住院病历', value: [...checkList], list: Object.freeze(checkList), checkAll: true, isIndeterminate: false },
  { label: '门急诊病历', value: [...outpatient], list: Object.freeze(outpatient), checkAll: true, isIndeterminate: false },
  { label: '体检报告', value: [...medicalReport], list: Object.freeze(medicalReport), checkAll: true, isIndeterminate: false }
])
const dataRange = ref('') // 数据范围

// 全选/全不选
const handleCheckAllChange = (val, data) => {
  data.value = val ? data.list : []
  data.isIndeterminate = false
}

// 半选逻辑
const handleCheckedCitiesChange = (val, data) => {
  const checkedCount = val.length
  data.checkAll = checkedCount === data.list.length
  data.isIndeterminate = checkedCount > 0 && checkedCount < data.list.length
}
// eslint-disable-next-line no-unused-vars
const verifyQuantitymedicalFn = async (params) => {
  let res = ''
  if (props.isMedicalRecord && props.queryWay === 1) {
    res = await verifyQuantitymedical(params)
  } else if (props.isMedicalRecord && props.queryWay === 2) {
    res = await conditionTreeverifyQuantitymedical(params)
  } else {
    res = '研究对列病历指标' // 病历指标暂未处理条数判断
  }
  if (res.code === 10000) {
    return res.data || 0
  } else {
    console.log('获取数量错误')
  }
}
const handleParams = () => {
  let params = {}
  switch (dataRange.value) {
    case '当前数据页':
      if (props.queryWay === 1) {
        params = { ...props.mySearchRef }
        params.showFilterContent = JSON.stringify({
          search: props.search,
          value: props.mySearchRef
        })
      } else {
        const data = props.rgpaRef.getData()
        params.searchConditionTree = data
        params.showFilterContent = JSON.stringify(data)
      }
      params.pageNum = props.pageResult.pageNum
      params.pageSize = props.pageResult.pageSize
      break
    case '当前筛选数据':
      if (props.queryWay === 1) {
        params = { ...props.mySearchRef }
        params.showFilterContent = JSON.stringify({
          search: props.search,
          value: props.mySearchRef
        })
        params.searchType = 1
      } else {
        const data = props.rgpaRef.getData()
        params.searchConditionTree = data
        params.showFilterContent = JSON.stringify(data)
        params.searchType = 2
      }
      params.pageNum = 0
      params.pageSize = 0
      break
    case '全部数据':
      params.pageNum = 0
      params.pageSize = 0
      break
  }
  params.queueName = props.studyName // 队列名称
  params.exportRecordType = props.isMedicalRecord ? 1 : 2 // 导出类型
  params.fileName = `${props.studyCohort ? ('研究队列(' + props.studyName + ')') : (props.isMedicalRecord ? '病历库' : '指标')}_${nowDate()}` // 文件名
  params.queueId = props.studyCohort // 队列编号
  if (props.isMedicalRecord) {
    params.inHospitalMedicalRecordHeadNameList = checkData[0]?.value || undefined // 病历类型
    params.physicalMedicalRecordHeadNameList = checkData[2]?.value || undefined// 体检报告类型
    params.outPatientMedicalRecordHeadNameList = checkData[1]?.value || undefined// 门急诊病历类型
  } else {
    params.searchDimension = props.queryDimension // 查询维度
  }
  params.searchType = props.queryWay // 查询方式

  if (props.isMedicalRecord && props.queryWay === 1) {
    // todo 临时处理年龄筛选
    switch (params.relationValue) {
      case 'gt':
      // 大于
        params.startAge = params.age
        break
      case 'eq':
      // 等于
        params.equalAge = params.age
        break
      case 'lt':
      // 小于
        params.endAge = params.age
        break
      case 'between':
      // 介于
        if (params.ageRange?.length) {
          params.startAge = params.ageRange[0]
          params.endAge = params.ageRange[1]
        }
        break
    }
    if (params.relationValue === 'between' && params.startAge > params.endAge) {
      ElMessage.warning('请填写完整年龄段')
      return
    }
    delete params.age
    delete params.ageRange
    delete params.relationValue
    // 病历库普通+研究队列就诊
    // 普通条件导出请求
  } else if (props.isMedicalRecord && props.queryWay === 2) {
    // 病历库条件树导出
    console.log('不做处理')
  } else {
    if (props.queryWay === 1) {
      switch (params.relationValue) {
        case 'gt':
          // 大于
          params.startAge = params.age
          break
        case 'eq':
          // 等于
          params.equalAge = params.age
          break
        case 'lt':
          // 小于
          params.endAge = params.age
          break
        case 'between':
          // 介于
          if (params.ageRange?.length) {
            params.startAge = params.ageRange[0]
            params.endAge = params.ageRange[1]
          }
          break
      }
      if (params.relationValue === 'between' && params.startAge > params.endAge) {
        ElMessage.warning('请填写完整年龄段')
        return
      }
      delete params.age
      delete params.ageRange
      delete params.relationValue
      const customConditionMap = []
      Object.keys(params).forEach(item => {
        if (item.includes('customIndex-')) {
          const obj = {}
          obj.indexId = item.split('-')[1]
          if (Array.isArray(params[item])) {
            obj.valueList = params[item]
          } else {
            obj.valueList = params[item] ? [params[item]] : []
          }
          if (!lodash.isEmpty(params['relationValue-' + obj.indexId])) {
            obj.searchSymbol = params['relationValue-' + obj.indexId]
            if (Array.isArray(params[obj.indexId])) {
              obj.valueList = params[obj.indexId]
            } else {
              obj.valueList = params[obj.indexId] ? [params[obj.indexId]] : []
            }
          }
          customConditionMap.push(obj)
          delete params[item]
          delete params['relationValue-' + obj.indexId]
          delete params[obj.indexId]
        }
      })
      params.searchConditionList = customConditionMap
    }
  }
  return params
}
const handleSub = async () => {
  if (dataRange.value === '') {
    ElMessage({
      message: '请选择要导出的数据范围',
      type: 'warning'
    })
    return
  }
  const params = handleParams()
  if (!props.isMedicalRecord || dataRange.value === '当前数据页') {
    // 病历指标导出不需要判断条数,直接导出
    save(params)
    return
  }
  const total = await verifyQuantitymedicalFn(params)
  if (total || total === 0) {
    if (total > 100000) {
      ElMessageBox.confirm(
        h('p', null, [
          h('span', null, '当前病历导出数据达超过'),
          h('span', { style: 'color: #ff4e4e' }, '10万'),
          h('span', null, '行，将会拆分成多个压缩文件下载！')
        ]),
        '导出病历',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      ).then(async() => {
        save(params)
      }).catch(() => {

      })
    } else {
      save(params)
    }
  }
}
const save = (params) => {
  // let params = {}
  // switch (dataRange.value) {
  //   case '当前数据页':
  //     if (props.queryWay === 1) {
  //       params = { ...props.mySearchRef }
  //       params.showFilterContent = JSON.stringify({
  //         search: props.search,
  //         value: props.mySearchRef
  //       })
  //     } else {
  //       const data = props.rgpaRef.getData()
  //       params.searchConditionTree = data
  //       params.showFilterContent = JSON.stringify(data)
  //     }
  //     params.pageNum = props.pageResult.pageNum
  //     params.pageSize = props.pageResult.pageSize
  //     break
  //   case '当前筛选数据':
  //     if (props.queryWay === 1) {
  //       params = { ...props.mySearchRef }
  //       params.showFilterContent = JSON.stringify({
  //         search: props.search,
  //         value: props.mySearchRef
  //       })
  //       params.searchType = 1
  //     } else {
  //       const data = props.rgpaRef.getData()
  //       params.searchConditionTree = data
  //       params.showFilterContent = JSON.stringify(data)
  //       params.searchType = 2
  //     }
  //     params.pageNum = 0
  //     params.pageSize = 0
  //     break
  //   case '全部数据':
  //     params.pageNum = 0
  //     params.pageSize = 0
  //     break
  // }
  // params.queueName = props.studyName // 队列名称
  // params.exportRecordType = props.isMedicalRecord ? 1 : 2 // 导出类型
  // params.fileName = `${props.studyCohort ? ('研究队列(' + props.studyName + ')') : (props.isMedicalRecord ? '病历库' : '指标')}_${nowDate()}` // 文件名
  // params.queueId = props.studyCohort // 队列编号
  // if (props.isMedicalRecord) {
  //   params.inHospitalMedicalRecordHeadNameList = checkData[0]?.value || undefined // 病历类型
  //   params.physicalMedicalRecordHeadNameList = checkData[2]?.value || undefined// 体检报告类型
  //   params.outPatientMedicalRecordHeadNameList = checkData[1]?.value || undefined// 门急诊病历类型
  // } else {
  //   params.searchDimension = props.queryDimension // 查询维度
  // }
  // params.searchType = props.queryWay // 查询方式

  if (props.isMedicalRecord && props.queryWay === 1) {
    // todo 临时处理年龄筛选
    // switch (params.relationValue) {
    //   case 'gt':
    //   // 大于
    //     params.startAge = params.age
    //     break
    //   case 'eq':
    //   // 等于
    //     params.equalAge = params.age
    //     break
    //   case 'lt':
    //   // 小于
    //     params.endAge = params.age
    //     break
    //   case 'between':
    //   // 介于
    //     if (params.ageRange?.length) {
    //       params.startAge = params.ageRange[0]
    //       params.endAge = params.ageRange[1]
    //     }
    //     break
    // }
    // if (params.relationValue === 'between' && params.startAge > params.endAge) {
    //   ElMessage.warning('请填写完整年龄段')
    //   return
    // }
    // delete params.age
    // delete params.ageRange
    // delete params.relationValue
    // 病历库普通+研究队列就诊
    // 普通条件导出请求
    exportRecord(params).then((res) => {
      if (res.code === 10000) {
        ElMessage({ message: '请求成功', type: 'success' })
        emit('closure')
      }
    })
  } else if (props.isMedicalRecord && props.queryWay === 2) {
    // 病历库条件树导出
    exportRecordsFromMedicalRecordDatabaseConditionTree(params).then((res) => {
      if (res.code === 10000) {
        ElMessage({ message: '请求成功', type: 'success' })
        emit('closure')
      }
    })
  } else {
    // if (props.queryWay === 1) {
    //   switch (params.relationValue) {
    //     case 'gt':
    //       // 大于
    //       params.startAge = params.age
    //       break
    //     case 'eq':
    //       // 等于
    //       params.equalAge = params.age
    //       break
    //     case 'lt':
    //       // 小于
    //       params.endAge = params.age
    //       break
    //     case 'between':
    //       // 介于
    //       if (params.ageRange?.length) {
    //         params.startAge = params.ageRange[0]
    //         params.endAge = params.ageRange[1]
    //       }
    //       break
    //   }
    //   if (params.relationValue === 'between' && params.startAge > params.endAge) {
    //     ElMessage.warning('请填写完整年龄段')
    //     return
    //   }
    //   delete params.age
    //   delete params.ageRange
    //   delete params.relationValue
    //   const customConditionMap = []
    //   Object.keys(params).forEach(item => {
    //     if (item.includes('customIndex-')) {
    //       const obj = {}
    //       obj.indexId = item.split('-')[1]
    //       if (Array.isArray(params[item])) {
    //         obj.valueList = params[item]
    //       } else {
    //         obj.valueList = params[item] ? [params[item]] : []
    //       }
    //       if (!lodash.isEmpty(params['relationValue-' + obj.indexId])) {
    //         obj.searchSymbol = params['relationValue-' + obj.indexId]
    //         if (Array.isArray(params[obj.indexId])) {
    //           obj.valueList = params[obj.indexId]
    //         } else {
    //           obj.valueList = params[obj.indexId] ? [params[obj.indexId]] : []
    //         }
    //       }
    //       customConditionMap.push(obj)
    //       delete params[item]
    //       delete params['relationValue-' + obj.indexId]
    //       delete params[obj.indexId]
    //     }
    //   })
    //   params.searchConditionList = customConditionMap
    // }

    // 研究队列条件树导出请求
    derivationOfMedicalRecordIndexConditionTree(params).then((res) => {
      if (res.code === 10000) {
        ElMessage({ message: '请求成功', type: 'success' })
        emit('closure')
      }
    })
  }
}
</script>
<style scoped lang="scss">
  :deep(.dialogDIV) {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    .el-dialog__body {
      padding-bottom: 22px;
    }
    .dialog-footer {
      .submit {
        margin-left: 12px;
        border: none;
        background-color: var(--theme-primary);
        color: #fff;
      }
    }
  }

  .content-medicalRecord {
    li {
      margin-bottom: 18px;
      .data-range {
        height: 20px;
        margin-top: 20px;
      }
      .section-title {
        display: flex;
        align-items: center;
        height: 20px;
        margin-bottom: -4px;
        line-height: 20px;
        font-weight: 500;
        color: var(--theme-text);

        .line {
          width: 2px;
          height: 15px;
          margin-right: 6px;
          background-color: var(--theme-primary);
        }
        .text {
          font-weight: 500;
          font-size: 14px;
        }
      }
      .select-container {
        margin-top: 16px;
        border: 1px solid #e8e8e8;
        .select-all {
          display: flex;
          height: 40px;
          padding-left: 16px;
          background: rgba(54, 112, 248, 0.05);
        }
        .value {
          padding: 0 16px 14px 16px;
          .el-checkbox-group {
            .el-checkbox {
              width: 33%;
              height: 20px;
              margin-right: 0;
              margin-top: 14px;
            }
          }
        }
      }
      :where(.el-radio-group,.el-checkbox-group) {
        display: flex;
        flex-wrap: wrap;
        .el-radio {
          height: 20px;
        }
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .messageText {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--theme-text-2);
    .iconfont {
      margin-right: 5px;
      font-size: 19px;
      color: #f59f0c;
    }
    .notice {
      color: #ff4e4e;
    }
  }
</style>
