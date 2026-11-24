<template>
  <div class="common-form-render readonlyMode" v-bind="$attrs">
    <el-form class="common-form" ref="ruleFormRef" :model="localFormData">
      <template v-for="(item, index) in renderInfo" :key="index">
        <div class="section" :id="'part' + index" :class="[{'last-section': index === renderInfo.filter(item => item.show).length - 1}, {'paddingLR0': ['进度及日志', '变更记录'].includes(item.label)}, item.className]" v-if="item.show">
          <div class="section-title" v-if="item.label">
            <div class="line"></div>
            <div v-if="item.component === 'labelWithContent'">{{item.label}}：{{localFormData[item.key]}}</div>
            <div v-else>{{item.label}}</div>
            <div class="multi-download" v-if="item.label.includes('附件')">
              <el-button type="primary" link @click="handleBatchDownLoad(item.multipleSelectionKey)" :disabled="!localFormData[item.multipleSelectionKey] || localFormData[item.multipleSelectionKey]?.length === 0">
                <i class="iconfont icon-daochu2"></i>
                批量下载
              </el-button>
            </div>
          </div>
          <div class="commonUl-li" v-if="item.component === 'ul-li'">
            <ul>
              <li v-for="(li, liIndex) in item.children" :key="li.label + liIndex" :class=" [{'textareaLi width100': li.type === 'textarea'}, li.className]">
                <div class="star" v-if="li.rules && li.rules[0]?.required">*</div>
                <div class="li-content" v-if="li.type === 'textarea'">
                  {{li.label}}：{{ formData[li.key] || '-' }}
                </div>
                <div class="li-content" v-else>
                  <div>{{li.label}}：</div>
                  <div v-if="li.component === 'el-date-picker' && li.type === 'daterange'">{{formData[li.key][0] ? formData[li.key][0] + '~' + formData[li.key][1] : '-'}}</div>
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
                      <div class="text1">{{process.label || '-'}}</div>
                      <div class="text2">
                        <CommonTooltip :content="process.user">
                          <div class="content-ellipsis">{{ process.user || '-' }}</div>
                        </CommonTooltip>
                      </div>
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
            <div class="title">
              <div class="line" v-if="!item.label"></div>
              <div class="title-text">流程日志</div>
            </div>
          </div>
          <div class="process-log" v-if="['el-table', 'el-upload', 'process-table'].includes(item.component)">
            <el-table ref="elTableRef" :row-key="row => row.uuid || row.id" :data="localFormData[item.key]" :border="item.border" :class="item.className" :row-class-name="item.needRowClass ? tableRowClassName : ''" @selection-change="(val) => handleSelectionChange(val, item.multipleSelectionKey)">

              <el-table-column type="selection" min-width="22" v-if="item.selection"/>
              <template v-for="(h, hIndex) in item.header" :key="'th' + hIndex">
                <el-table-column :min-width="h.width" v-if="h.onlyView || (!h.viewHidden && (h.label !== '操作' || (h.label === '操作' && h.onlyReadBtns)))">
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
                      <div class="td-approvalResult"><span class="icon-status" :style="{backgroundColor:approveStatusOptions[scope.row.auditRes]?.color}" v-if="scope.row.auditRes !== ''"></span>{{ approveStatusOptions[scope.row.auditRes]?.label||'-' }}</div>
                    </template>
                    <template v-else-if="h.label === '审批附件'">
                      <div class="td-attachment" v-if="scope.row.fileVOList && scope.row.fileVOList.length > 0">
                        <div class="file-div" v-for="(attachment, attachmentIndex) in scope.row.fileVOList" :key="attachmentIndex">
                          <img :src="getFileTypeIcon(attachment.fileName)" >
                          {{ attachment.fileName }}
                          <div class="download-icon" @click="handleClick('下载', attachment)"><i class="iconfont icon-daochu2"></i></div>
                        </div>
                      </div>
                      <div v-else>-</div>
                    </template>
                    <template v-else-if="h.label === '操作' && h.onlyReadBtns">
                      <div>
                        <el-button type="primary" @click="handleClick(btn,scope.row)" link v-for="(btn, btnIndex) in h.onlyReadBtns" :key="btnIndex">{{btn}}</el-button>
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
                        {{scope.row[h.key]|| '-'}}
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
                <li v-for="(otherLi, otherLiIndex) in item.children" :key="otherLi.label + otherLiIndex" :class=" [{'textareaLi width100': otherLi.type === 'textarea'}, otherLi.className]">
                  <span>{{otherLi.label}}：{{formData[otherLi.key] || otherLi.nullDefaultValue || '-'}}</span>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </template>
    </el-form>
  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonFormRender',
  inheritAttrs: false
})
import { ref, onMounted, watch } from 'vue'
import _ from 'lodash'
import docxIcon from '@/assets/image-docx.png'
import xlsIcon from '@/assets/image-xls.png'
import pdfIcon from '@/assets/image-pdf.png'
import projectChangeFormRender from '@/components/researchManagement/projectChangeFormRender.vue'
import { getBaseInfo } from '@/api/api_user.js'
import { Base64 } from 'js-base64'
import { ElMessage } from 'element-plus'
import { approve_status as approveStatusOptions } from '@/components/researchManagement/enum/enum_researchManagement.js'
// import { ElMessage, ElMessageBox } from 'element-plus'
// const emits = defineEmits(['cancel', 'submit'])

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
watch(() => props.formData, (newVal) => {
  console.log('监听到111', newVal)
  localFormData.value = _.cloneDeep(newVal)
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
const handleClick = (txt, row) => {
  console.log('点击', txt, row)
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
    console.log('baseInfo', baseInfo)
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
