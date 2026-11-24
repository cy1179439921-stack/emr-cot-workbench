<template>
  <div class="change-record">
    <template v-for="(record, recordIndex) in renderInfo.children" :key="record.label + recordIndex">
      <div class="section-title2" v-if="localFormData[record.key]?.length > 0">
        <div class="line" v-if="record.needTitleLine"></div>
        <div>{{record.label}}</div>
      </div>
      <div class="process-log" v-if="['el-table', 'el-upload', 'process-table'].includes(record.component)">
        <el-table ref="elTableRef" :row-key="row => row.uuid || row.id" :data="localFormData[record.key]" :border="record.border" :class="record.className" :row-class-name="record.needRowClass ? tableRowClassName : ''" v-if="localFormData[record.key]?.length > 0">

          <el-table-column type="selection" min-width="20" v-if="record.selection"/>
          <template v-for="(h, hIndex) in record.header" :key="'th' + hIndex">
            <el-table-column :min-width="h.width">
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
                  <div class="td-approvalResult"><span class="icon-status" :class="getStatus(scope.row.auditRes)" v-if="scope.row.auditRes"></span>{{scope.row[h.key] || '-'}}</div>
                </template>
                <template v-else-if="h.label.includes('是否')">
                  <div>
                    {{scope.row[h.key] ? '是' : '否'}}
                  </div>
                </template>
                <template v-else-if="h.label === '操作'">
                  <div class="td-operationType"><span :class="getOperationTypeClass(scope.row[h.key])">{{scope.row[h.key]}}</span></div>
                </template>
                <!--项目参与人信息有特殊颜色要求 -->
                <template v-else-if="scope.row.changeTextArr">
                  <div :class="{'td-changeText' : scope.row[h.key] === '变更信息' || scope.row.changeTextArr.includes(scope.row[h.key])}">
                    {{scope.row[h.key]}}
                  </div>
                </template>
                <template v-else>
                  <div>
                    {{scope.row[h.key]}}
                  </div>
                </template>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
    </template>
  </div>
</template>
<script setup>
defineOptions({
  name: 'ProjectChangeFormRender',
  inheritAttrs: false
})
import { ref, onMounted, watch } from 'vue'
import _ from 'lodash'
import docxIcon from '@/assets/image-docx.png'
import xlsIcon from '@/assets/image-xls.png'
import pdfIcon from '@/assets/image-pdf.png'

const props = defineProps({
  renderInfo: {
    type: Object
  },
  formData: {
    type: Object
  }
})
const localFormData = ref(_.cloneDeep(props.formData))
watch(() => props.formData, (newVal) => {
  localFormData.value = _.cloneDeep(newVal)
})
const tableRowClassName = ({
  row,
  rowIndex
}) => {
  console.log('row', row)
  if (row.changeMethod === '删除信息') {
    return 'red'
  } else if (row.changeMethod === '新增信息') {
    return 'blue'
  } else {
    return ''
  }
}

const elTableRef = ref()

onMounted(async() => {
})

// 获取审批状态对应的class
const getStatus = (status) => {
  switch (status) {
    case '审批中':
      return 'approver'
    case '已通过':
      return 'approved'
    case '已驳回':
      return 'rejected'
    default:
      return ''
  }
}
// 获取操作类型对应的class
const getOperationTypeClass = (operationType) => {
  switch (operationType) {
    case '新增':
      return 'add'
    case '删除':
      return 'delete'
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
</script>
<style scoped lang="scss">
@use '@/components/researchManagement/style/commonFormRender.scss';
:deep(.changebasicInfo) {
  .el-table__body {
    tbody {
      tr {
        td:nth-child(3) {
          color: #3670f8 !important;
        }
      }
    }
  }
}
:deep(.fileListInfo) {
  .el-table__body {
    tbody {
      tr {
        td {
          .cell {
            .td-operationType {
              .add {
                color: #3670f8;
              }
              .delete {
                color: #ff4e4e;
              }
            }
          }
        }
      }
    }
  }
}
</style>
