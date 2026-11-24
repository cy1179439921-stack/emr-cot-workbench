<template>
  <div class="common-form-render editMode" v-bind="$attrs">
    <el-form class="common-form" ref="ruleFormRef" :model="localFormData">
      <template v-for="(item, index) in renderInfo" :key="index">
        <div class="section" :id="'part' + index" :class="[{'last-section': index === renderInfo.filter(item => item.show).length - 1}, item.className]" v-if="item.show">
          <div class="section-title" v-if="item.label">
            <div class="line"></div>
            <div v-if="item.component === 'labelWithContent'">{{item.label}}：{{localFormData[item.key]}}</div>
            <div v-else>{{item.label}}</div>
            <div class="labelDesc" v-if="item.labelDesc">{{item.labelDesc}}</div>
          </div>
          <div class="commonUl-li" v-if="item.component === 'ul-li'">
            <ul>
              <li v-for="(li, liIndex) in item.children" :key="li.label + liIndex" :class="li.className">
                <el-form-item class="custom-form-item" :label="li.label + '：'"
                              label-width="100%" label-position="left" :prop="li.key" :rules="li.rules">
                  <template #label v-if="li.helpHTML">
                    <div class="custom-label">
                      {{li.label}}
                      <el-tooltip :content="li.helpHTML" raw-content placement="top">
                        <el-icon><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                  <el-input-number v-no-e v-model="localFormData[li.key]" :controls="false" :max="li.max" :min="li.min" :step-strictly="li.stepStrictly" placeholder="请填写内容" v-if="li.component === 'el-input-number'" @change="(val) => handleInputNumberChange(val, li.key, li.precision)" :disabled="li.disabled"></el-input-number>
                  <!-- 普通输入框 -->
                  <el-input :type="li.type" clearable v-model="localFormData[li.key]" placeholder="请填写内容" v-else-if="li.component === 'el-input'" :maxlength="li.maxlength || 100" show-word-limit :autosize="{ minRows: 2 }" :disabled="li.disabled"></el-input>
                  <!-- 带查询的输入框 -->
                  <div class="query-div" v-else-if="li.component === 'el-input-query'">
                    <el-input :type="li.type" clearable v-model="localFormData[li.key]" placeholder="请填写内容" :maxlength="li.maxlength || 100" show-word-limit :autosize="{ minRows: 2 }" :disabled="li.disabled"></el-input>
                    <div class="query-btn flexCenter" @click="handleShowParticipantTable('', li.key)"><i class="iconfont icon-sousuo"></i></div>
                  </div>
                  <el-select v-model="localFormData[li.key]" :filterable="li.filterable" placeholder="请选择一项" v-if="li.component === 'el-select'" clearable :disabled="li.disabled" @change="val => handleSelectChange(val, li)">
                    <el-option v-for="enumItem in li.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                  </el-select>
                  <el-cascader
                    v-model="localFormData[li.key]"
                    :options="li.enums"
                    :props="{multiple: false,label:'name',value:'id',children:'departmentList'}"
                    collapse-tags
                    collapse-tags-tooltip
                    clearable
                    v-if="li.component === 'el-cascader'"
                  />
                  <el-date-picker v-model="localFormData[li.key]" :type="li.type ? li.type : 'datetime'" :format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="li.customFormat ? li.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" :disabled="li.disabled" v-if="li.component === 'el-date-picker'" placeholder="请选择一项"></el-date-picker>
                </el-form-item>
              </li>
            </ul>
          </div>
          <el-table ref="elTableRef" :row-key="row => row.uuid || row.id" :data="localFormData[item.key]" :border="item.border" :class="item.className" :row-class-name="item.needRowClass ? tableRowClassName : ''" v-if="item.component === 'el-table'">
            <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
              <el-table-column :min-width="h.width">
                <template #header>
                  <span class="star" v-if="h.required">*</span>
                  <span>{{h.label}}</span>
                </template>
                <template #default="scope">
                  <div class="dragBtn" v-if="item.needDrag && hIndex === 0"><i class="iconfont icon-liebiao-shangxiayi"></i></div>
                  <template v-if="h.label === '序号'">
                    <div class="td-div checkbox-div flexCenter">{{ scope.$index + 1 }}</div>
                  </template>
                  <el-form-item class="td-custom-form-item" label="" label-width="100%" label-position="left" :prop="`${item.key}.${scope.$index}.${h.key}`" :rules="h.rules" v-else>
                    <div class="td-div checkbox-div flexCenter" v-if="h.component === 'el-checkbox'">
                      <el-checkbox v-model="scope.row[h.key]"></el-checkbox>
                    </div>
                    <div class="td-div flex-div align-end" v-else-if="h.component === 'el-input'">
                      <el-input clearable v-model="scope.row[h.key]" maxlength="100" show-word-limit :placeholder="h.placeholder || '请填写'" :disabled="h.disabled"></el-input>
                      <div class="query-btn flexCenter" v-if="h.operation === 'query'" @click="handleShowParticipantTable(scope.$index, item.key)"><i class="iconfont icon-sousuo"></i></div>
                    </div>
                    <div class="td-div align-end" v-else-if="h.component === 'el-select'">
                      <el-select v-model="scope.row[h.key]" placeholder="请选择一项" clearable @change="val => handleTdSelectChange(val, h, scope.row)">
                        <el-option v-for="enumItem in h.enums" :key="enumItem.value" :label="enumItem.label" :value="enumItem.value"></el-option>
                      </el-select>
                    </div>
                    <div v-else-if="h.component === 'el-button'">
                      <span class="btn" @click="handleDelete(scope.row, scope.$index, item.key)">删除</span>
                    </div>
                    <div class="td-div align-end" v-else-if="h.component === 'el-date-picker'">
                      <el-date-picker v-model="scope.row[h.key]" :type="h.type ? h.type : 'datetime'" :format="h.customFormat ? h.format : 'YYYY-MM-DD HH:mm:ss'" :value-format="h.customFormat ? h.format : 'YYYY-MM-DD HH:mm:ss'" :disabled-date="disabledDate" placeholder="请选择一项"></el-date-picker>
                    </div>
                    <div v-else>
                      {{scope.row[h.key]}}
                    </div>
                  </el-form-item>
                </template>
              </el-table-column>
            </template>
          </el-table>
          <div class="addLine flexCenter" v-if="item.component === 'el-table' && localFormData[item.key]?.length < item.maxCount" @click="handleAddLine(item.key)">
            <i class="iconfont icon-jia"></i>
            <span>{{item.addText}}</span>
          </div>
          <!-- 文件上传区 -->
          <div class="upload-div" v-if="item.component === 'el-upload'">
            <header class="upload-header">
              <div class="star" v-if="item.required">*</div>
              <div class="text1">文件上传：</div>
              <div class="text2">*单个文件最大不超过200M</div>
            </header>
            <el-upload
              class="myUpload"
              ref="uploadRef"
              drag
              action="#"
              multiple
              :auto-upload="false"
              :limit="filesLimit"
              :accept="item.accept"
              :on-change="(file, fileList) => handleChange(file, fileList, item.key, item.projectType)"
              :on-exceed="(files, uploadFiles) => handleExceed(files, uploadFiles, item.key)"
              v-model:file-list="fileListLocal"
            >
              <div class="upload-masklayer" @click.stop="handleClickMask(item.key)" v-if="showUploadMask(item.key)"></div>
              <img class="borderImg" :src="authenticationBg" />
              <div class="upload-content">
                <img class="defaultLogo" src="@/assets/el-upload.png" />
                <div class="el-upload__text">
                  <div class="text1">将文件拖到此处，或<span>点击上传</span></div>
                  <div class="text2">支持pdf、docx、xls、xlsx</div>
                </div>
              </div>
            </el-upload>
            <el-table ref="elTableRef" :row-key="row => row.uuid || row.id" :data="localFormData[item.key]" :border="item.border" :class="item.className" :row-class-name="item.needRowClass ? tableRowClassName : ''">
              <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
                <el-table-column :min-width="h.width" v-if="!h.hidden">
                  <template #header>
                    <span class="star" v-if="h.required">*</span>
                    <span>{{h.label}}</span>
                  </template>
                  <template #default="scope">
                    <template v-if="h.label === '序号'">
                      <div>{{ scope.$index + 1 }}</div>
                    </template>
                    <template v-if="h.label === '文件'">
                      <div class="td-fileName">
                        <img src="@/assets/image-docx.png" v-if="scope.row.fileName.includes('docx')">
                        <img src="@/assets/image-xls.png" v-if="scope.row.fileName.includes('xls') || scope.row.fileName.includes('xlsx')">
                        <img src="@/assets/image-pdf.png" v-if="scope.row.fileName.includes('pdf')">
                        {{ scope.row.fileName }}
                      </div>
                    </template>
                    <template v-else-if="h.label === '上传状态'">
                      <div class="progress-div">
                        <el-progress :percentage="100" :stroke-width="6" status="success" color="#04A273" v-if="scope.row['id']">
                          <template #default>
                            <span class="custom-success-icon"><el-icon><CircleCheckFilled /></el-icon></span>
                          </template>
                        </el-progress>
                        <el-progress :percentage="50" :stroke-width="6" status="exception" color="#FF4E4E" v-else-if="scope.row['status'] == 'error'">
                          <template #default>
                            <span class="custom-error-icon"><el-icon><CircleCloseFilled /></el-icon></span>
                          </template>
                        </el-progress>
                        <el-progress :percentage="50" :stroke-width="6" color="#3670F8" v-else-if="scope.row['status'] == 'uploading'"></el-progress>
                      </div>
                    </template>
                    <div v-else-if="h.component === 'el-button'">
                      <el-button type="primary" link @click="viewFile(scope.row)" :disabled="!scope.row?.id">预览</el-button>
                      <el-button type="danger" link @click="handleDelete(scope.row, scope.$index, item.key)">删除</el-button>
                    </div>
                    <div v-else>
                      {{scope.row[h.key]}}
                    </div>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            <template v-if="item.children">
              <div class="table-other commonUl-li">
                <ul>
                  <li v-for="(otherLi, otherLiIndex) in item.children" :key="otherLi.label + otherLiIndex" :class=" [{'width100': otherLi.type === 'textarea'}, otherLi.className]">
                    <el-form-item class="custom-form-item" :label="otherLi.label + '：'"
                                  label-width="100%" label-position="left" :prop="otherLi.key" :rules="otherLi.rules">
                      <el-input :type="otherLi.type" clearable v-model="localFormData[otherLi.key]" placeholder="请填写内容" v-if="otherLi.component === 'el-input'" :maxlength="otherLi.type === 'textarea' ? otherLi.maxlength : 100" show-word-limit :autosize="{ minRows: 2 }"></el-input>
                    </el-form-item>
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </template>
    </el-form>
    <div class="bottom-btn">
      <div class="btn-div">
        <el-button @click="handleCancel">取 消</el-button>
        <!-- 审批状态为驳回和撤销的不能再次暂存 -->
        <el-button @click="handleSubmit(1)" v-if="![3,5].includes(auditStatus)">暂 存</el-button>
        <el-button type="primary" @click="handleSubmit(2)">{{ [3,5].includes(auditStatus) ? '重新提交' : '提 交' }}</el-button>
      </div>
    </div>
    <participantTable @handle-close="handleClose" @handle-sure="handleSure" v-if="showParticipantTable"/>
  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonFormEditRender',
  inheritAttrs: false
})
import { ref, watch, onMounted } from 'vue'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { ElMessage, ElMessageBox } from 'element-plus'
import authenticationBg from '@/assets/upload-border.png'
import participantTable from '@/components/researchManagement/participantTable.vue'
import { uploadFiles } from '@/api/api_scientific.js'
import { Base64 } from 'js-base64'
import { getBaseInfo } from '@/api/api_user.js'
const emits = defineEmits(['cancel', 'submit'])
const filesLimit = 50 // 单次上传数量限制
const totalFilesLimit = 50 // 总上传数量限制
const fileSizeLimit = 200 // 单个文件大小限制
const props = defineProps({
  lightQuery: {
    type: String
  },
  renderInfo: {
    type: Array,
    default: () => []
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  businessType: {
    type: Number,
    default: 1
  },
  auditStatus: { // 当前数据状态，用于按钮控制
    type: Number,
    default: 0
  }
})
const localFormData = ref(_.cloneDeep(props.formData))
watch(() => props.formData, (newVal) => {
  console.log('监听到', newVal)
  ruleFormRef.value?.resetFields() // 消除自动校验
  localFormData.value = _.cloneDeep(newVal)
})

const tableRowClassName = ({
  row,
  rowIndex
}) => {
  if (row.state === '正常') {
    return 'normalTr'
  } else if (!row.state || row.state === '-') {
    return ''
  } else {
    return 'abnormalTr'
  }
}
// 预览
const viewFile = (row) => {
  let pdfUrl = ''
  if (process.env.NODE_ENV === 'development') {
    pdfUrl = `http://192.168.43.162:9000${row.fileUrl.replace('/minio', '')}`
    console.log('pdfUrl', pdfUrl)
  } else {
    pdfUrl = `${window.location.origin}/${row.fileUrl}`
  }
  console.log('row', row)
  if (localStorage.getItem('baseInfo')) {
    const baseInfo = JSON.parse(localStorage.getItem('baseInfo'))
    if (row.fileName.includes('.pdf')) {
      window.open(baseInfo.filePreviewPrefix + 'onlinePreview?url=' + encodeURIComponent(Base64.encode(pdfUrl)) + '&officePreviewType=pdf')
    } else {
      window.open(baseInfo.filePreviewPrefix + 'onlinePreview?url=' + encodeURIComponent(Base64.encode(pdfUrl)))
    }
  } else {
    getBaseInfo().then(res => {
      if (res.code === 10000) {
        localStorage.setItem('baseInfo', JSON.stringify(res.data))
        if (row.fileName.includes('.pdf')) {
          window.open(res.data.filePreviewPrefix + 'onlinePreview?url=' + encodeURIComponent(Base64.encode(pdfUrl)) + '&officePreviewType=pdf')
        } else {
          window.open(res.data.filePreviewPrefix + 'onlinePreview?url=' + encodeURIComponent(Base64.encode(pdfUrl)))
        }
      }
    })
  }
}
// 删除该行
const handleDelete = (row, index, key) => {
  localFormData.value[key].splice(index, 1)
}
const defaultRowMap = {
  projectParticipantList: {
    inHospital: false,
    userName: '',
    sex: '',
    workCode: '',
    birthday: '',
    degree: '',
    title: '',
    unitName: ''
  },
  srmThesisPersonList: { // 作者
    isOurCollege: false,
    name: '',
    gender: '',
    workNo: '',
    birthDate: '',
    departmentName: '',
    unitName: '',
    type: ''
  },
  srmBizProjectList: {
    statisticFlag: false,
    projectId: '',
    projectName: '',
    projectCode: '',
    projectDirectorName: '',
    unitName: ''
  },
  srmPatentPersonDOList: {
    isOurCollege: false,
    name: '',
    gender: '',
    workNo: '',
    birthDate: '',
    departmentName: '',
    unitName: '',
    type: ''
  },
  winnersList: {
    inHospital: false,
    userName: '',
    sex: '',
    workCode: '',
    birthday: '',
    departmentName: '',
    unitName: '',
    awardRank: ''
  },
  default: {
    code: '',
    name: ''
  }
}
// 添加一行
const handleAddLine = (key) => {
  const base = _.cloneDeep(defaultRowMap[key] || defaultRowMap.default)
  if (key === 'winnersList') {
    base.awardRank = localFormData.value[key].length + 1
    localFormData.value[key].push({
      uuid: uuidv4(),
      ...base
    })
  } else {
    localFormData.value[key].push({
      uuid: uuidv4(),
      ...base
    })
  }
}

const elTableRef = ref()
const disabledDate = (time) => {
  // return time.getTime() > Date.now()
  return false
}
onMounted(async() => {
})

// 校验
const ruleFormRef = ref(null)
const validateForm = () => {
  return new Promise((resolve, reject) => {
    ruleFormRef.value.validate((valid) => {
      if (valid) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
const uploadRef = ref(null)
const fileListLocal = ref([])
const isValidFileType = (file) => {
  const type = file.type
  const name = file.name.toLowerCase()
  return (
    type === 'application/pdf' ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // docx
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // xlsx
    type === 'application/vnd.ms-excel' || // xls
    name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.xls') || name.endsWith('.xlsx') // 兜底判断
  )
}
let uploadTimer = null
const handleChange = async (uploadFile, uploadFileList, key) => {
  // 多文件上传，只让触发一次
  if (uploadTimer) clearTimeout(uploadTimer)
  uploadTimer = setTimeout(async () => {
    // 在此拦截不符合的格式文件，只允许上传pdf、docx、xls、xlsx文件
    if (uploadFileList.length > filesLimit) {
      ElMessage.error(`单次附件总数不可超过${filesLimit}个`)
      fileListLocal.value = []
      return false
    } else {
    // 从localFormData[key]中统计成功的文件数，并加上files数量，如果超过totalFilesLimit，则提示
      const successCount = localFormData.value[key].filter(
        (f) => f.id
      ).length
      if (successCount + uploadFileList.length > totalFilesLimit) {
        ElMessage.error(`附件总数不可超过${totalFilesLimit}个`)
        fileListLocal.value = []
        return false
      }
    }
    for (const file of uploadFileList) {
      const newFormData = new FormData()
      if (!isValidFileType(file)) {
        ElMessage.error(`${file.name} 格式不正确，请上传 pdf、docx、xls、xlsx 文件`)
        continue
      }
      if (!isUnderMaxSize(file)) {
        ElMessage.warning(`${file.name} 超过${fileSizeLimit}MB，已被忽略`)
        continue
      }
      // 可选：避免重复添加
      // const alreadyAdded = localFormData.value[key].some(
      //   (f) => f.fileName === file.name
      // )
      // if (alreadyAdded) {
      //   ElMessage.warning(`${file.name} 已存在，请勿重复上传`)
      //   continue
      // }
      newFormData.append('files', file.raw)
      localFormData.value[key].push({
        uuid: uuidv4(),
        fileName: file.name,
        status: 'uploading'
      })
      const { code, data } = await uploadFiles(newFormData, props.businessType)
      if (code === 10000) {
      // 更新状态
        const index = localFormData.value[key].findIndex(
          (f) => f.fileName === file.name && !f.id
        )
        if (index > -1) {
          localFormData.value[key][index].fileUrl = data[0].fileUrl
          localFormData.value[key][index].id = data[0].id
          localFormData.value[key][index].status = 'success'
        }
      } else {
      // 更新状态
        const index = localFormData.value[key].findIndex(
          (f) => f.fileName === file.name && !f.id
        )
        if (index > -1) {
          localFormData.value[key][index].status = 'error'
        }
      }
    }

    // 清空上传框
    if (Array.isArray(uploadRef.value)) {
      uploadRef.value.forEach((u) => u.clearFiles?.())
    } else if (uploadRef.value?.clearFiles) {
      uploadRef.value.clearFiles()
    }
    resetUploadInput()
  }, 300) // 延迟 100ms 等所有触发合并
}
const resetUploadInput = () => {
  if (Array.isArray(uploadRef.value)) {
    uploadRef.value.forEach(refItem => {
      const inputEl = refItem?.$el?.querySelector?.('input[type="file"]')
      if (inputEl) inputEl.value = ''
    })
  } else if (uploadRef.value?.$el) {
    const inputEl = uploadRef.value.$el.querySelector?.('input[type="file"]')
    if (inputEl) inputEl.value = ''
  }
}
const handleExceed = (files, uploadFiles, key) => {
  if (files.length > filesLimit) {
    ElMessage.error(`单次附件总数不可超过${filesLimit}个`)
    fileListLocal.value = []
  } else {
    // 从localFormData[key]中统计成功的文件数，并加上files数量，如果超过totalFilesLimit，则提示
    const successCount = localFormData.value[key].filter(
      (f) => f.id
    ).length
    if (successCount + files.length > totalFilesLimit) {
      ElMessage.error(`附件总数不可超过${totalFilesLimit}个`)
      fileListLocal.value = []
    }
  }
}
const isUnderMaxSize = (file) => {
  return file.size <= fileSizeLimit * 1024 * 1024
}
const showParticipantTable = ref(false)

const editRowIndex = ref({
  index: 0,
  key: ''
})
const handleShowParticipantTable = (index, key) => {
  editRowIndex.value.index = index
  editRowIndex.value.key = key
  showParticipantTable.value = true
}
// 关闭选择参与人弹窗
const handleClose = () => {
  showParticipantTable.value = false
}
// 确定参与人
const handleSure = (data) => {
  const index = editRowIndex.value.index
  const key = editRowIndex.value.key
  if (index || index === 0) {
    if ([6, 7, 8, 9].includes(props.businessType)) {
      localFormData.value[key][index].departmentName = data.departmentName
      localFormData.value[key][index].name = data.userName
      localFormData.value[key][index].userId = data.id
      localFormData.value[key][index].unitName = data.agencyName
    } else {
      localFormData.value[key][index].userName = data.userName
      localFormData.value[key][index].userId = data.id
      localFormData.value[key][index].unitName = data.agencyName
    }
  } else {
    localFormData.value[key] = data.userName
  }

  showParticipantTable.value = false
  // 清空localFormData.value[editRowIndex.value.key][editRowIndex.value.index]所在form的错误提示
  ruleFormRef.value.clearValidate(`${key}.${index}.userName`)
}
// 去除指定数组里的字段的校验提示
const removeValidate = (keyArry) => {
  keyArry.forEach(key => {
    ruleFormRef.value.clearValidate(key)
  })
}
// 提交，对必填项做校验
const handleSubmit = async(status) => {
  if (status === 1) {
    emits('submit', status)
  } else if (status === 2) {
    const valid = await validateForm()
    if (!valid) {
      ElMessage.error('请检查必填项')
      console.log('没通过校验', localFormData.value)
    } else {
      console.log('通过校验', localFormData.value)
      emits('submit', status)
    }
  }
}

// 取消编辑
const handleCancel = (text) => {
  if (!_.isEqual(localFormData.value, props.formData) && ![3, 5].includes(props.auditStatus)) {
    ElMessageBox.confirm('存在字段更新,是否暂存？', '暂存', {
      confirmButtonText: '确 定',
      cancelButtonText: '继续取消',
      type: 'warning',
      distinguishCancelAndClose: true // 启用区分取消和关闭
    }).then(() => {
      console.log('去保存')
      emits('submit', 1)
    }).catch((action) => {
      // 继续取消或关闭
      if (action === 'cancel') {
        console.log('点击的继续取消')
        emits('cancel')
      } else if (action === 'close') {
        console.log('点击的关闭按钮')
      }
    })
  } else {
    emits('cancel')
  }
}
// 返回
const judgeBack = () => {
  return new Promise((resolve, reject) => {
    if (!_.isEqual(localFormData.value, props.formData) && ![3, 5].includes(props.auditStatus)) {
      ElMessageBox.confirm('存在字段更新,是否暂存？', '暂存', {
        confirmButtonText: '确 定',
        cancelButtonText: '继续返回',
        type: 'warning',
        distinguishCancelAndClose: true // 启用区分取消和关闭
      }).then(() => {
        console.log('去保存')
        resolve('confirm')
      }).catch((action) => {
        // 继续取消或关闭
        if (action === 'cancel') {
          console.log('点击的继续取消')
          emits('cancel')
        } else if (action === 'close') {
          console.log('点击的关闭按钮')
        }
      })
    } else {
      resolve('no-change')
    }
  })
}

// 最多保留6位
const handleInputNumberChange = (value, key, precision) => {
  if (String(value).includes('.')) {
    const arr = String(value).split('.')
    if (arr[1].length > precision) {
      value = arr[0] + '.' + arr[1].slice(0, precision)
    }
  }
  localFormData.value[key] = value
}
// 下拉框的自定义事件
const handleSelectChange = (val, item) => {
  if (typeof item.onChange === 'function') {
    item.onChange(val, localFormData)
  }
}
const handleTdSelectChange = (val, item, row) => {
  if (typeof item.onChange === 'function') {
    item.onChange(val, row, localFormData)
  }
}
// 是否展示拖拽区遮罩层
const showUploadMask = (key) => {
  return localFormData.value[key].some(
    (f) => f.status === 'uploading'
  )
}
const handleClickMask = (key) => {
  ElMessage.warning('有文件正在上传，请稍后')
}
defineExpose({
  validateForm,
  handleCancel,
  judgeBack,
  removeValidate,
  getFormData: () => _.cloneDeep(localFormData.value)
})
</script>
<style scoped lang="scss">
@use '@/components/researchManagement/style/commonFormRender.scss';
.header {
  margin-top: 16px;
}
.addLine {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  margin-top: 12px;
  border: 1px dashed #d8d8d8;
  cursor: pointer;
  font-weight: 500;
  color: #3670f8;
  i {
    font-size: 20px;
  }
}
</style>
