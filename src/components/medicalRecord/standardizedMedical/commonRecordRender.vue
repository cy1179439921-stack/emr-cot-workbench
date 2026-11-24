<template>
  <div class="common-record-render readOnly" v-bind="$attrs">
    <template v-for="(item, index) in fieldInfo" :key="index">
      <div class="section" :data-evidence-field="item.key ? (pathPrefix ? pathPrefix + '.' : '') + item.key : ''">
        <!-- <WordHighlighter highlightClass="highlight" :query="lightQuery"> -->
        <div class="section-title" v-if="item.label && !item.onlyEdit">
          <div class="line"></div>
          <div v-if="item.component === 'labelWithContent'">{{item.label}}：{{formData[item.key]}}</div>
          <div v-else>{{item.label}}</div>
        </div>
        <div class="commonUl-li" v-if="item.component === 'ul-li' && !item.onlyEdit">
          <ul :class="'ul-' + item.rowCount">
            <li v-for="(li, liIndex) in item.children.filter(child => !child.onlyEdit)" :key="li.label + liIndex"
                :class="{'marginT7': liIndex > (item.rowCount - 1)}"
                :data-evidence-field="li.key ? (pathPrefix ? pathPrefix + '.' : '') + li.key : ''"
            >
              <template v-if="!medicalStore.showOperationView">
                <span>{{li.label}}：</span>
                <span :title="formData[li.key]">{{formData[li.key] || '-'}}</span>
              </template>
              <template v-else>
                <div>{{li.label}}：</div>
                <div :title="formData[li.key]">
                  <DiffViewer :original="formData[`old${li.key}`] || ''" :polished="formData[li.key] || ''"></DiffViewer>
                </div>
              </template>
            </li>
          </ul>
        </div>
        <div class="singleDiv" v-if="item.component === 'singleDiv' || item.component === 'el-select'"
             :data-evidence-field="item.key ? (pathPrefix ? pathPrefix + '.' : '') + item.key : ''"
        >
          <template v-if="!medicalStore.showOperationView">
            {{formData[item.key] || '这里还没有内容'}}
          </template>
          <template v-else>
            <DiffViewer :original="formData[`old${item.key}`] || ''" :polished="formData[item.key] || ''"></DiffViewer>
          </template>
        </div>
        <div class="singleDiv" v-if="item.component === 'singleDivArray'"
             :data-evidence-field="item.key ? (pathPrefix ? pathPrefix + '.' : '') + item.key : ''"
        >
          <template v-if="Array.isArray(formData[item.key]) && formData[item.key].filter(item => !!item).length > 0">
            <div v-for="(child, childIndex) in formData[item.key]" :key="'child' + childIndex">{{child}}</div>
          </template>
          <template v-else>这里还没有内容</template>
        </div>
        <!-- <div class="singleDiv" :class="item.className" v-if="item.component === 'el-table' && formData[item.key].length === 0">
            这里还没有内容
          </div> -->
        <!-- </WordHighlighter> -->
        <el-table :data="formData[item.key]" :border="item.border" :class="item.className" :row-class-name="item.needRowClass ? tableRowClassName : ''" v-if="item.component === 'el-table'">
          <template v-for="(h, hIndex) in item.header.filter(child => !child.onlyEdit)" :key="'th' + hIndex">
            <el-table-column :min-width="h.width" :prop="h.key" :sortable="h.sortable || false">
              <template #header>
                <!-- <WordHighlighter highlightClass="highlight" :query="lightQuery"> -->
                <span>{{h.label}}</span>
                <!-- </WordHighlighter> -->
              </template>
              <template #default="scope">
                <div v-if="h.label === '序号' || h.label === ''">
                  {{scope.$index}}
                </div>
                <div class="tag" v-else-if="h.isTag"
                     :data-evidence-field="h.key ? (pathPrefix ? pathPrefix + '.' : '') + item.key + '[' + scope.$index + '].' + h.key : ''"
                >
                  <template v-if="!medicalStore.showOperationView">
                    <span class="circle"></span>
                    <span class="text">{{ scope.row[h.key]}}</span>
                    <span class="arrow" v-if="scope.row[h.key]?.includes('高')"><i class="iconfont icon-shang"></i></span>
                    <span class="arrow" v-if="scope.row[h.key]?.includes('低')"><i class="iconfont icon-xia"></i></span>
                  </template>
                  <template v-else>
                    <DiffViewer :original="formData[`old${item.key}`]?.[scope.$index]?.[h.key] || ''" :polished="scope.row[h.key] || ''"></DiffViewer>
                  </template>
                </div>
                <div v-else
                     :data-evidence-field="h.key ? (pathPrefix ? pathPrefix + '.' : '') + item.key + '[' + scope.$index + '].' + h.key : ''"
                >
                  <template v-if="!medicalStore.showOperationView">
                    {{scope.row[h.key] || '-'}}
                  </template>
                  <template v-else>
                    <DiffViewer :original="formData[`old${item.key}`]?.[scope.$index]?.[h.key] || ''" :polished="scope.row[h.key] || ''"></DiffViewer>
                  </template>
                </div>
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
  name: 'CommonRecordRender',
  inheritAttrs: false
})
import { useMedicalStore } from '@/store/medicalStore'
import DiffViewer from '@/components/common/DiffViewer.vue'
const medicalStore = useMedicalStore()
defineProps({
  lightQuery: {
    type: String
  },
  fieldInfo: {
    type: Object
  },
  formData: {
    type: Object
  },
  rowCount: {
    type: Number
  },
  pathPrefix: {
    type: String,
    default: ''
  }
})
const tableRowClassName = ({
  row,
  rowIndex
}) => {
  if (!medicalStore.showOperationView) {
    if (row.state === '正常') {
      return 'normalTr'
    } else if (!row.state || row.state === '-') {
      return ''
    } else {
      return 'abnormalTr'
    }
  }
  return ''
}
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.header {
  margin-top: 16px;
}
</style>
