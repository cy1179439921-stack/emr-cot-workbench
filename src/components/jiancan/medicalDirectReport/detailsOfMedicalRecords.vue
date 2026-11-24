<template>
  <div class="detailsOfMedicalRecords" :class="{'isPreview': !isEdit }">
    <header class="pdfHeader">
      <div class="goBack">
        <p @click="clearFormData(true)">
          <i class="iconfont icon-zuo"></i>
          <span>返回</span>
        </p>
        <p class="title">{{ isEdit ? '编辑病历' : '病历详情' }}</p>
      </div>
      <div class="handlerBtn" >
        <!-- <span v-if="isEdit && isHeaderShow">自动更新时间:{{updateTime}}</span> -->
        <el-button type="primary" v-if="curData.btns.includes('查看原始病历')" @click="viewFile">{{ isViewPdf ? '关闭原始病历' : '查看原始病历'}}</el-button>
        <template v-if="isHeaderShow">
          <template v-if="!isEdit">
            <span class="btn" @click="goBack('report')" v-if="curData.btns.includes('上报')">上 报</span>
            <span class="btn del" @click="goBack('delete')" v-if="curData.btns.includes('删除')">删 除</span>
          </template>
        </template>
      </div>
    </header>
    <div class="main">
      <div class="menu" >
        <h4 class="content-ellipsis">病历</h4>
        <el-anchor :container="containerRef" direction="vertical" :bound="30" :offset="30" @click="handleClick" @change="scrollTo" :marker="false">
          <el-anchor-link :href="`#${item.lable.split('/')[0]}`" v-for="item in tabList" :key="item.lable">
            <el-tooltip effect="dark" lacement="bottom" popper-class="errTip">
              <template #content>
                <span v-if="!errMsgList[item.lable]">该分组必填指标已完成填写</span>
                <template v-else-if="errMsgList[item.lable]">
                  <ul>
                    <li v-for="it in [...new Set(errMsgList[item.lable]?.map(item => item.replace(/条件\d+/, '')) || [])]" :key="it">{{it}}</li>
                  </ul>
                </template>
              </template>
              <SvgIcon iconName="icon-duihao" v-if="!errMsgList[item.lable]"></SvgIcon>
              <SvgIcon iconName="icon-cuowu" v-else></SvgIcon>
            </el-tooltip>
            <span class="ellipsis" :title="item.lable">{{ item.lable }}</span>
          </el-anchor-link>
        </el-anchor>
      </div>
      <div id="pdfView" v-if="isViewPdf">
        <viewPDFPage :pdfUrl="curData.fileUrl" :fileName="curData.fileName" v-if="curData.fileUrl" :defaultIsPdfValue="true"/>
      </div>
      <div class="editForm">
        <div ref="containerRef" id="containerRef">
          <el-form ref="ruleFormRef" :model="formData" @validate="validate" :show-message="!hiddenErr" :label-position="isEdit ? 'top' : 'left'">
            <div :id="item.lable.split('/')[0]" class="part" v-for="item in tabList" :key="item.lable">
              <component :is="item.component" :item="item" :formData="formData" :artificialIntelligenceForm="artificialIntelligenceForm" :isEdit="isEdit" :lable="item.lable" :isViewPdf="isViewPdf" :admissionAnDischargeNotice="admissionAnDischargeNotice" ref="formRefs"></component>
            </div>
          </el-form>
        </div>
        <footer v-if="isHeaderShow">
          <div class="handlerBtn">
            <template v-if="isEdit">
              <el-button @click="clearFormData(false)">取 消</el-button>
              <el-button type="primary" @click="saveRuleForm">保 存</el-button>
            </template>
            <template v-else>
              <el-button @click="onReidentify" v-if="curData.btns.includes('重新识别')">重新识别</el-button>
              <el-button type="primary" @click="editForm" v-if="curData.btns.includes('编辑')">编 辑</el-button>
            </template>
          </div>
        </footer>
      </div>
    </div>
  </div>
  <dialogReidentify :currentData="saveNewData ? saveNewData : curData" @reidentify="(data)=>goBack('reIdentify',data)" v-if="isReidentify" @close="isReidentify = false"></dialogReidentify>
</template>

<script setup>
import { errorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import { ref, nextTick, onMounted, reactive, computed, watch, provide } from 'vue'
import { newTabList, useModuleSetting } from '@/components/jiancan/medicalDirectReport/configMenu'
import { getTheValueOfMedicalRecordDetails, updateTheValueOfMedicalRecordDetails } from '@/api/jiancanAPI/api_medicalRecords'
import _ from 'lodash'
import { ElMessage, ElMessageBox } from 'element-plus'
import viewPDFPage from '@/components/common/viewPDFPage.vue'
import { reportMedicalRecord, deleteMedicalRecord, reIdentify } from '@/api/jiancanAPI/api_home'
import { useMedicalStore } from '@/store/medicalStore'
import dialogReidentify from '@/components/jiancan/medicalDirectReport/component/dialogReidentify.vue'
const medicalStore = useMedicalStore()

const emits = defineEmits(['goBack'])
const props = defineProps({
  // props
  isPreview: { // 是否预览状态
    type: Boolean,
    default: true
  },
  curData: { // 当前数据
    required: true
  },
  isHeaderShow: { // 是否显示头部
    type: Boolean,
    default: true
  },
  needCheckPermission: {
    type: Boolean,
    default: true
  },
  hadPermissionList: {
    type: Array,
    default: () => []
  }
})
provide('isHeaderShow', props.isHeaderShow)
const formRefs = ref(null) // 表单ref
const treatment = ref(props.curData?.healingTypeList || []) // 治疗方案
const isEdit = ref(!props.isPreview) // 是否编辑状态
const isReidentify = ref(false) // 是否重新识别
const ruleFormRef = ref(null) // 表单ref
const containerRef = ref(null) // 锚点容器
let cloneData = {} // 原始数据
let formData = reactive({
  '手术记录（病案首页中原始信息）手术记录数量': 0,
  '出院其他诊断（病案首页中原始信息）其他诊断数量': 0,
  治疗类型治疗类型: props.curData.healingTypeList,
  出院情况出院用药: []
}) // 表单数据
const isViewPdf = ref(false) // 是否查看pdf文件
let admissionAnDischargeNotice = reactive({}) // 入出院提示
let artificialIntelligenceForm = reactive({}) // 人工智能标识
let artificialFormClone = {} // 人工智能标识源数据
let titiPageIds = null // 病历详情页ids
const hiddenErr = ref(false) // 隐藏错误提示
const tabList = computed(() => { // 治疗类型对应的详情列表
  // 传递数据
  const allList = newTabList.filter(item => item.restrict === 'all') // 通用所有的模块
  const handlerList = newTabList.filter(item => Array.isArray(item.restrict) && item.restrict.some(it => treatment.value?.includes(it))) // 根据治疗类型筛选的对应模块
  return [...allList, ...handlerList]
})
const errMsg = ref({}) // 错误信息
const errMsgList = ref({}) // 错误信息分类
const saveNewData = ref(null) // 是否保存新数据
const handleClick = (e, href) => { // 锚点点击事件
  // 获取第一个li元素并添加is-active类名
  const firstLi = document.querySelector('.el-anchor__list a:first-child')
  if (firstLi) {
    firstLi.classList.remove('is-active')
  }
  e.preventDefault()
}

const scrollTo = (href) => { // 锚点滚动事件
  nextTick(() => {
    if (!href) {
    // 获取第一个li元素并添加is-active类名
      const firstLi = document.querySelector('.el-anchor__list a:first-child')
      getTitlePageIds(firstLi?.attributes?.href?.value.replace('#', ''))
      if (firstLi) {
        firstLi.classList.add('is-active')
      }
    } else {
      getTitlePageIds(href.replace('#', ''))
    }
  })
}

// 根据表头获取对应pdf 的 ids数据
const getTitlePageIds = (title) => {
  if (Object.hasOwnProperty.call(titiPageIds, title)) {
    medicalStore.setMedicalPageList(titiPageIds[title]?.page_ids || [])
  } else {
    medicalStore.setMedicalPageList([])
  }
}

// 错误信息收集
const validate = (name, rules, msg) => {
  if (!rules) {
    errMsg.value[name] = msg // 错误信息收集
  } else {
    if (errMsg.value[name]) {
      delete errMsg.value[name] // 错误信息清除
    }
  }
}

// 查看文件
const viewFile = () => {
  isViewPdf.value = !isViewPdf.value
}

// 获取病历详情数据
const init = () => {
  return new Promise((resolve) => {
    getTheValueOfMedicalRecordDetails({ id: props.curData.id }).then(res => {
      try {
        const resData = res?.data?.jcwIndexExtractResult || {} // 结构化数据
        const robotData = processingrobotData(res?.data?.jcwAlgorithmSourceMap || {}) // 处理机器人数据
        admissionAnDischargeNotice = Object.assign(admissionAnDischargeNotice, res?.data?.dateTipMap || {}) // 处理机器人数据
        artificialFormClone = _.cloneDeep(res?.data?.jcwAlgorithmSourceMap || {}) // 人工智能标识源数据
        artificialIntelligenceForm = Object.assign(artificialIntelligenceForm, robotData) // 人工智能标识
        cloneData = Object.assign(_.cloneDeep(formData), handlerGetData(resData)) // 原始数据
        titiPageIds = resData // 病历详情页ids
        handlerFormData(_.cloneDeep(cloneData))
        nextTick(() => {
          resolve()
        })
      } catch (error) {
        cloneData = Object.assign({}, formData)
        artificialFormClone = {}
        resolve()
      }
    })
  })
}

const processingrobotData = (data) => {
  const obj = {}
  if (data && !_.isEmpty(data)) {
    for (const key in data) {
      if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
        data[key].forEach(item => {
          obj[key + item] = true
        })
      }
    }
  }
  return obj
}

// 处理数据
const handlerGetData = (data) => {
  const obj = {}
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      if (_.isPlainObject(data[key])) {
        for (const item in data[key]) {
          if (Object.hasOwnProperty.call(data[key], item)) {
            obj[key + item] = data[key][item] === 0 ? 0 : data[key][item]
          }
        }
      } else {
        obj[key] = data[key] === 0 ? 0 : data[key]
      }
    }

    if (['出院其他诊断（病案首页中原始信息）', '手术记录（病案首页中原始信息）'].includes(key) && data[key]) {
      const keyArr = Object.keys(data[key]).filter(it => (it !== '手术记录数量' && it !== '其他诊断数量'))
      if (Array.isArray(keyArr)) {
        const MaxValue = Math.max(...keyArr.map(it => Number(it?.match(/\d+/) || 0)))
        if (key.includes('出院其他诊断（病案首页中原始信息）') && !obj['出院其他诊断（病案首页中原始信息）其他诊断数量']) {
          obj['出院其他诊断（病案首页中原始信息）其他诊断数量'] = MaxValue
        }
        if (key.includes('手术记录（病案首页中原始信息）') && !obj['手术记录（病案首页中原始信息）手术记录数量']) {
          obj['手术记录（病案首页中原始信息）手术记录数量'] = MaxValue
        }
      }
    }
  }
  return obj
}

// 保存病历详情数据
const saveForm = (isSetInterval = false) => {
  const list = handlerSaveFormData(_.cloneDeep(formData))
  const robotData = handleRobotData({ ...artificialIntelligenceForm })
  const params = {
    id: props.curData.id,
    jcwIndexExtractResult: list,
    jcwAlgorithmSourceMap: robotData,
    dateTipMap: { ...admissionAnDischargeNotice }
  }
  updateTheValueOfMedicalRecordDetails(params).then(res => {
    if (res.code === 10000) {
      if (!isSetInterval) {
        isEdit.value = false
        ElMessage.success('已保存')
        saveNewData.value = {
          patientName: list?.['患者信息']?.['患者姓名'] || '',
          visitNumber: list?.['入出院信息']?.['住院号'] || '',
          healingTypeList: list?.['治疗类型']?.['治疗类型'] || [],
          id: props.curData.id
        }
      }
      cloneData = _.cloneDeep(formData)
    }
  })
}

// 获取所有的错误分类
const getErrAssemble = (errHide = true) => {
  return new Promise((resolve) => {
    errMsg.value = {}
    hiddenErr.value = true // 隐藏错误提示
    nextTick(() => {
      ruleFormRef.value.validate(() => { // 验证表单
        nextTick(() => {
          errMsgList.value = getErrMessage() // 错误信息分类
          if (errHide) {
            ruleFormRef.value?.clearValidate() // 清除错误提示
          }
          hiddenErr.value = false // 显示错误提示
          resolve()
        })
      })
    })
  })
}

// 获取所有规则错误
const getErrMessage = () => { // 获取错误信息分类
  const errStatus = {}
  const reqObj = { ...errMsg.value }
  const rulesObj = { ...errorCollector.value }
  tabList.value.forEach(items => {
    errStatus[items.lable] = []

    // 获取必填项验证
    for (const key in reqObj) {
      if (_.startsWith(key, items.lable)) {
        const isReq = reqObj[key].includes('必填项') // 判断是否必填项
        const filedName = key.replace(items.lable, '') // 不为必填项则需要加上它的字段名
        let errMsg = reqObj[key]
        if (errMsg.includes('不详')) {
          errMsg = '.' + errMsg
        }
        errStatus[items.lable].push(isReq ? errMsg : filedName + errMsg)
      }
    }

    // 获取规则验证
    for (const key in rulesObj) {
      if (_.startsWith(key, items.lable)) {
        rulesObj[key].forEach(item => !errStatus[items.lable].includes(item) && errStatus[items.lable].push(item))
      }
    }

    // 判断当前组没有错误信息，则删除
    if (!errStatus[items.lable].length) {
      delete errStatus[items.lable]
    }
  })

  return errStatus
}

// 处理保存数据
const handlerSaveFormData = (formData) => {
  const cloneData = {}
  tabList.value.forEach(items => {
    cloneData[items.lable] = {}
    cloneData[items.lable].page_ids = titiPageIds[items.lable]?.page_ids || []
    items.value.forEach(item => {
      if (item.component === 'slot' && ['其他诊断数量', '手术记录数量', '动脉瘤数量'].includes(item.name)) {
        if (Object.hasOwnProperty.call(formData, items.lable + item.name)) {
          if (item.name === '动脉瘤数量') {
            handleTreeData('动脉瘤', item)
          }
          handleTreeData(items.lable, item)
        }
      } else {
        assignment(items.lable, item.name)
      }
    })
  })

  function assignment(label, name) {
    if (Object.hasOwnProperty.call(formData, label + name)) {
      cloneData[label][name] = formData[label + name]
    }
  }

  function handleTreeData(label, item) {
    switch (item.name) {
      case '其他诊断数量':
        if (formData[label + '其他诊断数量'] && formData[label + '其他诊断数量'] > 0) {
          cloneData[label]['其他诊断数量'] = formData[label + '其他诊断数量']
          for (let index = 0; index < formData[label + '其他诊断数量']; index++) {
            item.children.forEach(child => {
              cloneData[label][child.name + (index + 1)] = formData[label + child.name + (index + 1)]
            })
          }
        }
        break
      case '手术记录数量':
        if (formData[label + '手术记录数量'] && formData[label + '手术记录数量'] > 0) {
          cloneData[label]['手术记录数量'] = formData[label + '手术记录数量']
          for (let index = 0; index < formData[label + '手术记录数量']; index++) {
            item.children.forEach(child => {
              cloneData[label][child.name + (index + 1)] = formData[label + child.name + (index + 1)]
            })
          }
        }
        break
      case '动脉瘤数量':
        if (formData['动脉瘤手术动脉瘤数量'] && formData['动脉瘤手术动脉瘤数量'] > 0) {
          for (let index = 0; index < formData['动脉瘤手术动脉瘤数量']; index++) {
            item.children.forEach(child => {
              cloneData['动脉瘤手术'][label + (index + 1) + child.name] = formData['动脉瘤手术' + label + (index + 1) + child.name]
            })
          }
          cloneData['动脉瘤手术']['动脉瘤数量'] = formData['动脉瘤手术动脉瘤数量']
        }
        break
    }
  }
  return cloneData
}

// 处理机器人数据
const handleRobotData = (data) => {
  const obj = {}
  const handleRobotData = { ...artificialFormClone }
  for (const key in handleRobotData) {
    obj[key] = []
    handleRobotData[key].forEach(item => {
      if (data[key + item]) {
        obj[key].push(item)
      }
    })
  }
  return obj
}

// 取消编辑
const clearFormData = (type) => {
  if (type && !isEdit.value) {
    goBack()
  } else {
    ElMessageBox.confirm('存在指标更新，是否保存？', '保存提示', {
      confirmButtonText: '保 存',
      cancelButtonText: type ? '继续返回' : '继续取消',
      type: 'warning',
      showClose: true,
      distinguishCancelAndClose: true
    }).then(() => {
      getErrAssemble() // 收集错误信息
      nextTick(() => {
        saveForm() // 保存数据
        isEdit.value = false // 取消编辑状态
        if (type) { // 页面跳转
          goBack()
        }
      })
    }).catch((res) => {
      if (res === 'cancel') {
        if (type) {
          goBack()
        } else {
          for (const key in formData) {
            if (!Object.hasOwnProperty.call(cloneData, key)) {
              delete formData[key]
            }
          }
          for (const key in cloneData) {
            formData[key] = cloneData[key]
          }
          nextTick(() => {
            getErrAssemble() // 收集错误信息
            isEdit.value = false // 取消编辑状态
          })
        }
      }
    })
  }
}

const goBack = (handler, data = {}) => {
  if (handler) {
    switch (handler) {
      case 'reIdentify':
        reIdentify({ ...data }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('操作成功')
            emits('goBack', handler)
          }
        })
        break
      case 'delete':
        ElMessageBox.confirm('删除后，该条病历将被永久删除，是否确认？', '删除', {
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning',
          showClose: true
        }).then(() => {
          deleteMedicalRecord({ id: props.curData.id }).then(res => {
            if (res.code === 10000) {
              ElMessage.success('已删除')
              emits('goBack', handler)
            }
          })
        })
        break
      case 'report':
        ElMessageBox.confirm('确定要上报该病历吗？', '病历上报', {
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning',
          showClose: true
        }).then(async () => {
          const res = await reportMedicalRecord({ id: props.curData.id })
          if (res.code === 10000) {
            ElMessage.success('上报成功')
            emits('goBack', handler)
          }
        })
        break
    }
  }
  if (!handler) {
    emits('goBack', handler)
  }
}

// 处理表单数据
const handlerFormData = (data) => {
  formData = Object.assign(formData, data)
  nextTick(() => {
    getErrAssemble(false) // 收集错误信息
  })
}

// 页面加载完成后
onMounted(() => {
  useModuleSetting(formData, ruleFormRef.value)
  nextTick(async () => {
    await init()
    scrollTo() // 页面加载完成后，滚动到第一个锚点
  })
})

// 给所有select添加默认空数组，不然会报错
const handlerTreeDataArr = () => {
  const data = _.cloneDeep(newTabList)
  data.forEach(item => {
    handleTreeData(item.value, item.lable)
  })
  function handleTreeData(data, lable) {
    data.forEach(item => {
      if (item?.isMultiple && !formData[lable + item.name]) {
        formData[lable + item.name] = []
      }
      if (item?.children && item.children.length > 0) {
        handleTreeData(item.children, lable)
      }
    })
  }
}
handlerTreeDataArr() // 处理递归list数据

const saveRuleForm = async () => {
  await getErrAssemble(false)
  nextTick(() => {
    if (!_.isEmpty(errMsgList.value)) { // 存在错误信息
      ElMessageBox.confirm('存在指标未按要求填写，是否保存指标？', '保存指标', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning',
        showClose: true
      }).then(() => {
        saveForm()
      })
    } else { // 无错误信息
      saveForm()
    }
  })
}

const editForm = async () => {
  await getErrAssemble()
  isEdit.value = true
}

const onReidentify = () => {
  isReidentify.value = true
}

watch(() => formData['治疗类型治疗类型'], (value) => {
  if (Array.isArray(value)) {
    treatment.value = value
  }
})
</script>
<style scoped lang="scss">
.detailsOfMedicalRecords {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-basis: 48px;
    box-sizing: border-box;
    width: 100%;
    padding: 0 24px 0 20px;
    background-color: var(--theme-card);
    .goBack {
      display: flex;
      align-items: center;
      color: var(--theme-text);
      p {
        margin: 0;
      }
      p:nth-child(1) {
        display: flex;
        align-items: center;
        height: 20px;
        padding-right: 12px;
        border-right: 1px solid #cbcfdc;
        cursor: pointer;
        .iconfont {
          display: block;
          width: 32px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          font-size: 32px;
          color: var(--theme-primary);
        }
        span {
          display: block;
          margin-left: -5px;
          line-height: 32px;
          font-weight: 400;
          font-size: 16px;
          color: var(--el-color-primary);
        }
      }
      .title {
        margin-left: 12px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
    }
  }
  .main {
    display: flex;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    height: 0;
    padding: 16px;
    .menu {
      display: flex;
      overflow-x: hidden;
      overflow-y: auto;
      flex-direction: column;
      flex-basis: 258px;
      box-sizing: border-box;
      width: 258px;
      margin-right: 14px;
      padding: 0 8px;
      border-radius: 8px;
      background-color: var(--theme-card);
      h4 {
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        white-space: nowrap;
      }
      .el-anchor {
        overflow: auto;
        flex: 1;

        @include scrollBarStyle;
      }
      :deep(.el-anchor__list) {
        margin-bottom: 8px;
        padding-left: 0;
        .el-anchor__item {
          height: 36px;
          cursor: pointer;
          &:not(:first-child) {
            margin-top: 8px;
          }
          a {
            padding: 0;
            padding-left: 16px;
            border-radius: 2px;
            line-height: 36px;
            font-size: 14px;
            color: var(--theme-text-2);
            &.is-active {
              background: rgba(54, 112, 248, 0.05);
              font-weight: 500;
              font-size: 14px;
              color: var(--el-color-primary);
            }
            svg {
              min-width: 1.5rem;
            }
          }
        }
      }
      h4 {
        margin: 16px 0;
        margin-left: 16px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      :deep(.el-anchor__link) {
        display: flex;
        align-items: center;
        svg {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          cursor: pointer;
        }
      }
    }
    #pdfView {
      display: flex;
      overflow: hidden;
      flex: 1;
      box-sizing: border-box;
      margin-right: 14px;
      border-radius: 8px;
      background-color: var(--theme-card);
      :deep(.pdfPreview) {
        .content {
          .header {
            border-bottom: 1px solid #e4e4e4 !important;
          }
        }
      }
    }
    .editForm {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      #containerRef {
        overflow-x: hidden;
        overflow-y: scroll;
        position: relative;
        flex: 1;
        border-radius: 8px;
        background-color: var(--theme-card);

        @include scrollBarStyle;
        .part {
          overflow: hidden;
          flex-basis: 100%;
          box-sizing: border-box;
          height: auto;
          padding: v-bind("isViewPdf ? '0 16px' : '0 24px'");

          &:first-child {
            :deep(.title-label) {
              margin-top: 24px;
            }
          }
          &:last-child {
            margin-bottom: 18px;
          }
        }
        .el-col-24 {
          overflow-x: auto;
          overflow-y: hidden;

          @include scrollBarStyle;
        }
        >.el-form {
          position: absolute;
          width: calc(100% + 6px);
        }
      }
      footer {
        display: flex;
        z-index: 99;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        height: 55px;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        background: var(--theme-card);
        box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.1);
      }
      :deep(.el-row) {
        overflow: hidden;
        .el-col-48 {
          width: 100%;
        }
      }
      .el-col-24 {
        overflow-x: auto;
        overflow-y: hidden;

        @include scrollBarStyle;
      }
    }
  }
  .handlerBtn {
    .btn {
      box-sizing: border-box;
      margin-left: 12px;
      padding: 7px 16px;
      border: 1px solid var(--theme-primary);
      border-radius: 2px;
      cursor: pointer;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-primary);
      &:first-child {
        margin-left: 0;
      }
    }
    .primary {
      background: var(--theme-primary);
      color: #fff;
    }
    .del {
      border: 1px solid #ff4e4e;
      color: #ff4e4e;
    }
    .normal {
      border: 1px solid #d8d8d8;
      color: var(--theme-text-2);
    }
  }
  :deep(.el-table__header) {
    height: 42px !important;
  }
  :deep(.el-table__cell) .cell {
    min-height: 26px !important;
    line-height: 22px;
  }
}
:deep(:where(.el-select,.el-input)) {
  width: 100% !important;
}
:deep(.el-form-item) {
  margin-bottom: 18px;
}
.isPreview {
  :deep(.title-label) {
    margin: 16px 0 8px 0;
  }
  :deep(.tableFrom) td {
    padding: 4px 0 !important;
  }
  :deep(.el-form-item) {
    display: flex !important;
    align-items: flex-start;
    width: auto !important;
    margin-bottom: 0;
    img {
      width: 20px;
      height: 20px;
    }
  }
  :deep(.el-form-item__label) {
    padding: 0;
    line-height: 20px !important;
    &::before {
      position: absolute;
      height: auto;
      margin-top: 4px;
    }
    span {
      padding-left: 14px;
    }
  }
  :deep(.el-form-item__error) {
    display: none;
  }
  :deep(.content .item) {
    align-items: flex-start !important;
  }
  :deep(.el-form-item__content) {
    flex-wrap: wrap !important;
    line-height: 20px !important;
    >div {
      padding: 6px 0;
    }
  }
  :deep(.artificialIntelligence) {
    position: unset !important;
    margin-left: 10px;
    transform: translate(0, 0) !important;
  }
  :deep(.tableFrom) {
    margin-bottom: 8px;
  }
}
:deep(.el-input-number) {
  width: 100%;
  input {
    text-align: left;
  }
}
:deep(.el-form-item__content) {
  display: flex;
  position: relative;
  align-items: flex-start;
  .el-input {
    flex: 1;
    .el-input-group__append {
      padding: 0 8px;
      background-color: var(--theme-fill);
    }
  }
  .el-input__count-inner {
    font-size: 12px;
    color: var(--theme-text-3);
  }
  span {
    display: inline-block;
    white-space: nowrap;
  }
  .warp {
    max-width: 100%;
    color: var(--theme-text-2);
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
  }
  .el-input__suffix {
    display: contents;
  }
  .prefixSpan {
    padding-right: 5px;
  }
  .el-tag {
    display: flex;
    align-items: center;
  }
  .artificialIntelligence {
    position: absolute;
    right: -21px;
    top: 6px;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  &:has(.waring) .artificialIntelligence {
    margin-left: 0;
  }
}
:deep(.el-form-item__error) {
  position: unset;
  margin-top: 0;
  line-height: 1.3em;
  font-size: 12px;
}
:deep(.el-col) {
  &:empty {
    display: none;
  }
}
:deep(.el-form-item__label) {
  display: flex !important;
  justify-content: flex-start;
  align-items: center;
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: none;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
    white-space: nowrap;
  }
  img {
    width: 20px;
    height: 20px;
  }
  &::before {
    height: 16px;
    font-size: 24px;
  }
  img {
    width: 20px;
    height: 20px;
  }
}
:deep(.el-select__tags-text) {
  display: block !important;
}
</style>
<style lang="scss">
.errTip:has(ul) {
  box-sizing: border-box;
  padding-right: 0;
  ul {
    overflow-y: auto;
    box-sizing: border-box;
    max-width: 390px;
    max-height: 360px;
    padding: 0 16px 0 14px;

    @include scrollBarStyle(#6F6F70);
    li {
      list-style: unset !important;
      line-height: 20px;
      font-family: "San francisco", PingFangSC-Light, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: #fff;
      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }
  }
}
</style>
<style>
.el-popper {
  overflow: unset;
}
</style>
