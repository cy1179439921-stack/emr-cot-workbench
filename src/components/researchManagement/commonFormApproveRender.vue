<template>
  <div class="common-form-render readonlyMode approveMode" v-bind="$attrs">
    <el-form class="common-form" ref="ruleFormRef" :model="localFormData">
      <template v-for="(item, index) in renderInfo" :key="index">
        <div class="section" :id="'part' + index" :class="[{'last-section': index === renderInfo.filter(item => item.show).length - 1}, {'paddingLR0': ['进度及日志', '变更记录'].includes(item.label)}, item.className]" v-if="item.show">
          <div class="section-title" v-if="item.label">
            <div class="line"></div>
            <div v-if="item.component === 'labelWithContent'">{{item.label}}：{{localFormData[item.key]}}</div>
            <div v-else>{{item.label}}</div>
            <div class="multi-download" v-if="item.label.includes('附件')">
              <el-button type="primary" link @click="handleBatchDownLoad(item.multipleSelectionKey)" :disabled="localFormData[item.multipleSelectionKey]?.length === 0">
                <i class="iconfont icon-daochu2"></i>
                批量下载
              </el-button>
            </div>
          </div>
          <div class="commonUl-li" v-if="item.component === 'ul-li'">
            <ul>
              <li v-for="(li, liIndex) in item.children" :key="li.label + liIndex" :class=" [{'textareaLi width100': li.type === 'textarea'}, li.className]">
                <div class="star" v-if="li.rules">*</div>
                <div class="li-content" v-if="li.type === 'textarea'">
                  {{li.label}}：{{ formData[li.key] || '-' }}
                </div>
                <div class="li-content" v-else>
                  <div>{{li.label}}：</div>
                  <div v-if="li.component === 'el-date-picker' && li.type === 'daterange'">{{formData[li.key][0] + '~' + formData[li.key][1] || '-'}}</div>
                  <div v-else-if="['el-select', 'el-cascader'].includes(li.component) && li.viewKey" class="li-value">
                    <CommonTooltip :content="formData[li.viewKey]">
                      <div class="content-ellipsis">{{ formData[li.viewKey] || '-' }}</div>
                    </CommonTooltip>
                  </div>
                  <div v-else class="li-value">
                    <CommonTooltip :content="formData[li.key]">
                      <div class="content-ellipsis">{{ formData[li.key] || '-' }}</div>
                    </CommonTooltip>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="process-timeLine" v-if="item.component === 'process-table'">
            <div class="title">
              <div class="line" v-if="!item.label"></div>
              <div class="title-text">流程进度</div>
            </div>
            <el-scrollbar :class="{'scrollbar-paddingBT': localFormData[item.key2].length > 3}">
              <div class="box">
                <div class="process-item approver-div start" :class="getStatusClass(localFormData[item.key2]?.[0]?.nodeStatus || '')">
                  <div class="circle flexCenter">
                    <i class="iconfont icon-wancheng-1"></i>
                  </div>
                  <div class="text-div">
                    <div class="text1">流程开始</div>
                  </div>
                </div>
                <div class="process-item line"></div>
                <template v-for="(process, processIndex) in localFormData[item.key2]" :key="process.label + processIndex">
                  <div class="process-item approver-div" :class="getStatusClass(process.nodeStatus)">
                    <div class="circle flexCenter">
                      <i class="iconfont icon-shenpi" v-if="processIndex === 0"></i>
                      <i class="iconfont icon-shenpi-1" v-else></i>
                    </div>
                    <div class="text-div">
                      <div class="text1">{{process.label}}</div>
                      <div class="text2">{{process.user}}</div>
                    </div>
                  </div>
                  <div class="process-item line"></div>
                </template>
                <div class="process-item approver-div end" :class="getStatusClass2(localFormData[item.key2]?.[localFormData[item.key2]?.length - 1]?.nodeStatus || '')">
                  <div class="circle flexCenter">
                    <i class="iconfont icon-jieshu"></i>
                  </div>
                  <div class="text-div">
                    <div class="text1">流程结束</div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
            <div class="title">流程日志</div>
          </div>
          <div class="process-log" v-if="['el-table', 'el-upload', 'process-table'].includes(item.component)">
            <el-table ref="elTableRef" :row-key="row => row.uuid || row.id" :data="localFormData[item.key]" :border="item.border" :class="item.className" :row-class-name="item.needRowClass ? tableRowClassName : ''" @selection-change="(val) => handleSelectionChange(val, item.multipleSelectionKey)">

              <el-table-column type="selection" min-width="20" v-if="item.selection"/>
              <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
                <el-table-column :min-width="h.width" v-if="h.label !== '操作' || (h.label === '操作' && h.onlyReadBtns)">
                  <template #header>
                    <span>{{h.label}}</span>
                  </template>
                  <template #default="scope">
                    <template v-if="h.label === '序号'">
                      <div>{{ scope.$index + 1 }}</div>
                    </template>
                    <template v-else-if="h.label === '文件'">
                      <div class="td-fileName">
                        <img :src="getFileTypeIcon(scope.row.fileName)" >
                        {{ scope.row.fileName }}
                      </div>
                    </template>
                    <template v-else-if="h.label === '审批结果'">
                      <div class="td-approvalResult">
                        <span class="icon-status"></span>
                        {{getApprovalName(scope.row[h.key]) || '-'}}
                      </div>
                    </template>
                    <template v-else-if="h.label === '审批附件'">
                      <div class="td-attachment" v-if="scope.row.fileVOList && scope.row.fileVOList.length > 0">
                        <div class="file-div" v-for="(attachment, attachmentIndex) in scope.row.fileVOList" :key="attachmentIndex">
                          <img :src="getFileTypeIcon(attachment.fileName)" >
                          {{ attachment.fileName }}
                          <div class="download-icon" @click="handleClick('下载',attachment)"><i class="iconfont icon-daochu2"></i></div>
                        </div>
                      </div>
                      <div v-else>-</div>
                    </template>
                    <template v-else-if="h.label === '操作' && h.onlyReadBtns">
                      <div>
                        <el-button type="primary" link v-for="(btn, btnIndex) in h.onlyReadBtns" @click="handleClick(btn,scope.row)" :key="btnIndex">{{btn}}</el-button>
                      </div>
                    </template>
                    <template v-else-if="h.label.includes('是否')">
                      <div>
                        {{scope.row[h.key] ? '是' : '否'}}
                      </div>
                    </template>
                    <template v-else-if="h.component = 'el-select' && h.viewKey">
                      {{scope.row[h.viewKey] || '-'}}
                    </template>
                    <template v-else>
                      <div>
                        {{scope.row[h.key] || '-'}}
                      </div>
                    </template>
                  </template>
                </el-table-column>
              </template>
            </el-table>
          </div>
          <projectChangeFormRender :renderInfo="item" :formData="formData" v-if="item.component === 'el-record'"/>
          <template v-else-if="item.component === 'el-upload' && item.children">
            <div class="table-other commonUl-li">
              <ul>
                <li v-for="(otherLi, otherLiIndex) in item.children" :key="otherLi.label + otherLiIndex" :class=" [{'width100': otherLi.type === 'textarea'}, otherLi.className]">
                  <span>{{otherLi.label}}：</span>
                  <span>{{otherLi.label}}：{{formData[otherLi.key] || otherLi.nullDefaultValue || '-'}}</span>
                </li>
              </ul>
            </div>
          </template>
          <!-- 文件上传区 -->
          <div class="upload-div" v-if="item.component === 'el-approval'">
            <div class="commonUl-li">
              <ul>
                <li v-for="(otherLi, otherLiIndex) in item.children" :key="otherLi.label + otherLiIndex" :class="otherLi.className">
                  <el-form-item class="approve-form-item" :label="otherLi.label + '：'"
                                label-width="100%" label-position="left" :prop="otherLi.key" :rules="otherLi.rules">
                    <el-input :type="otherLi.type" clearable v-model="localFormData[otherLi.key]" placeholder="请填写内容" v-if="otherLi.component === 'el-input'" :maxlength="otherLi.type === 'textarea' ? otherLi.maxlength : 100" show-word-limit :autosize="{ minRows: 2 }"></el-input>
                  </el-form-item>
                </li>
              </ul>
            </div>
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
                <el-table-column :min-width="h.width">
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
                      {{scope.row[h.key] || '-'}}
                    </div>
                  </template>
                </el-table-column>
              </template>
            </el-table>
          </div>
        </div>
      </template>
    </el-form>
    <div class="bottom-btn">
      <div class="btn-div">
        <el-button @click="handleApprove(1)">驳 回</el-button>
        <el-button type="primary" @click="handleApprove(0)">通 过</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonFormApproveRender',
  inheritAttrs: false
})
import { ref, onMounted, watch } from 'vue'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import docxIcon from '@/assets/image-docx.png'
import xlsIcon from '@/assets/image-xls.png'
import pdfIcon from '@/assets/image-pdf.png'
import projectChangeFormRender from '@/components/researchManagement/projectChangeFormRender.vue'
import { uploadAttachmentFiles } from '@/api/api_scientific.js'
import { ElMessage } from 'element-plus'
import authenticationBg from '@/assets/upload-border.png'
import { getBaseInfo } from '@/api/api_user.js'
import { Base64 } from 'js-base64'
// const emits = defineEmits(['cancel', 'submit'])
const filesLimit = 50 // 单次上传数量限制
const totalFilesLimit = 50 // 总上传数量限制
const fileSizeLimit = ref(200) // 单个文件大小限制
const props = defineProps({
  lightQuery: {
    type: String
  },
  renderInfo: {
    type: Object
  },
  formData: {
    type: Object
  }
})
const localFormData = ref(_.cloneDeep(props.formData))
const ruleFormRef = ref(null)
watch(() => props.formData, (newVal) => {
  console.log('监听到', newVal)
  ruleFormRef.value?.resetFields() // 消除自动校验
  localFormData.value = _.cloneDeep(newVal)
})
props.renderInfo.forEach(item => {
  if (item.component === 'singleDivArray') {
    localFormData.value[item.key] = localFormData.value[item.key]?.join('\n')
  }
})

const tableRowClassName = ({
  row,
  rowIndex
}) => {
  if (row.stageName === '发起申请') {
    return 'blue'
  } else {
    return ''
  }
}

const elTableRef = ref()

onMounted(async() => {
})

const handleSelectionChange = (val, key) => {
  console.log(11, val, key)
  localFormData.value[key] = val
  // 将所选val数组的id赋值给localFormData.value[key]
}
// 获取审批状态对应的class
const getStatusClass = (status) => {
  switch (status) {
    case 1:
      return ''
    case 2:
      return 'approver'
    case 3:
      return 'rejected'
    case 4:
      return 'approved'
    default:
      return ''
  }
}
const getStatusClass2 = (status) => {
  switch (status) {
    case 4:
      return 'approved'
    default:
      return ''
  }
}
// 获取审批状态对应的名称
const getApprovalName = (status) => {
  switch (status) {
    case 0:
      return '通过'
    case 1:
      return '驳回'
    default:
      return ''
  }
}
// 获取文件类型对应的图片
const getFileTypeIcon = (fileName) => {
  if (fileName?.includes('docx')) {
    return docxIcon
  } else if (fileName?.includes('xls') || fileName?.includes('xlsx')) {
    return xlsIcon
  } else if (fileName?.includes('pdf')) {
    return pdfIcon
  } else {
    return ''
  }
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
      ElMessage.error(
        `单次附件总数不可超过${filesLimit}个`
      )
      fileListLocal.value = []
      return false
    } else {
    // 从localFormData[key]中统计成功的文件数，并加上files数量，如果超过totalFilesLimit，则提示
      const successCount = localFormData.value[key].filter(
        (f) => f.id
      ).length
      if (successCount + uploadFileList.length > totalFilesLimit) {
        ElMessage.error(
          `附件总数不可超过${totalFilesLimit}个`
        )
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
        ElMessage.warning(`${file.name} 超过${fileSizeLimit.value}MB，已被忽略`)
        continue
      }
      // // 可选：避免重复添加
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
      const { code, data } = await uploadAttachmentFiles(newFormData, props.businessType)
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
    ElMessage.error(
      `单次附件总数不可超过${filesLimit}个`
    )
    fileListLocal.value = []
  } else {
    // 从localFormData[key]中统计成功的文件数，并加上files数量，如果超过totalFilesLimit，则提示
    const successCount = localFormData.value[key].filter(
      (f) => f.id
    ).length
    if (successCount + files.length > totalFilesLimit) {
      ElMessage.error(
        `附件总数不可超过${totalFilesLimit}个`
      )
      fileListLocal.value = []
    }
  }
}
const isUnderMaxSize = (file) => {
  return file.size <= fileSizeLimit.value * 1024 * 1024
}
const emits = defineEmits(['approve'])
const handleApprove = (status) => {
  const editFormData = _.cloneDeep(localFormData.value)
  // 判断editFormData.fileList中的status是否存在uploading状态，若存在，则阻止提交
  const uploading = editFormData.fileList.some(item => item.status === 'uploading')
  if (uploading) {
    ElMessage.error('有文件正在上传，请等待文件上传完成或删除文件后再提交')
    return
  }
  emits('approve', status)
}
const handleClick = (txt, row) => {
  if (txt === '预览') {
    viewFile(row)
  } else {
    // 下载
    console.log('下载')
    download([row])
  }
}
const handleBatchDownLoad = (multipleSelectionKey) => {
  if (localFormData.value[multipleSelectionKey].length) {
    download(localFormData.value[multipleSelectionKey])
  } else {
    ElMessage.warning('请选择需要下载的文件')
  }
}
// 预览
const viewFile = (row) => {
  let pdfUrl = ''
  if (process.env.NODE_ENV === 'development') {
    pdfUrl = `http://192.168.43.162:9000${row.fileUrl.replace('/minio', '')}`
  } else {
    pdfUrl = `${window.location.origin}/${row.fileUrl}`
  }
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
const download = async (rowList = []) => {
  rowList.forEach(item => {
    if (item.fileUrl) {
      let pdfUrl = ''
      if (process.env.NODE_ENV === 'development') {
        pdfUrl = `http://192.168.43.162:9000${item.fileUrl.replace('/minio', '')}`
      } else {
        pdfUrl = `${window.location.origin}/${item.fileUrl}`
      }
      const name = item.fileName
      const link = document.createElement('a')
      link.href = pdfUrl
      console.log('啥情况', name)
      link.download = name
      link.target = '_blank' // 可选，如果希望在新窗口中下载文件，请取消注释此行
      link.click()
      link.remove()
    } else {
      ElMessage.error('文件地址无效，请联系管理员核对')
    }
  })

  ElMessage({ message: '文件已开始下载', type: 'success' })
}
// 是否展示拖拽区遮罩层
const showUploadMask = (key) => {
  return localFormData.value[key]?.some(
    (f) => f.status === 'uploading'
  )
}
const handleClickMask = (key) => {
  ElMessage.warning('有文件正在上传，请稍后')
}
defineExpose({
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
