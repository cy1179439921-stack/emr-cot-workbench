<template>
  <template v-if="!isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="index">
      <template v-if="index < loadedCount">
        <commonRecordTimeLine/>
        <div class="timeline-right marginT24">
          <header class="header" :id="'page_'+ item.page_ids + '_' + index">
            <!-- <WordHighlighter highlightClass="highlight" :query="lightQuery"> -->
            <div class="time-card" :data-evidence-field="`inspections[${index}].time`"><span class="time-index">[{{ index }}]</span>{{item.time || '-'}}</div>
            <div class="typeTitle">{{item.type || '-'}}</div>
            <!-- <div class="typeTitle2">送检科室：{{item.department || '-'}}</div> -->
            <!-- </WordHighlighter> -->
          </header>
          <commonRecordRender :fieldInfo="fieldInfo" :formData="item" :lightQuery="lightQuery" :pathPrefix="evidencePathPrefix(index)"></commonRecordRender>
        </div>
      </template>

    </div>
  </template>
  <template v-else-if="isEdit && formData.length > 0">
    <div class="medical-body medical-body-multi" v-for="(item, index) in formData" :key="item.uuid">
      <commonRecordTimeLine/>
      <div class="timeline-right marginT24">
        <div class="number">检查单：{{index + 1}}</div>
        <commonMultiRecordEditRender :ref="el => setEditRenderRef(el, index)" :curMedicalInfo="curMedicalInfo" :otherInfo="otherInfo" :fieldInfo="getEditFieldInfo(fieldInfo)" :formData="formData" :singleFormData="item" :childId="'page_'+ item.page_ids + '_' + index" @dragLengthChange="(val) => handleDragLengthChange(val, index)">
          <div class="tools">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="btns">
                <el-button type="default" @click="toAdd(index)">存为模板</el-button>
                <el-button type="default" @click="toUse(index)">使用模板</el-button>
                <el-button type="default" @click="copyMedicalRecord(index)">创建副本</el-button>
                <el-button type="default" @click="rejudgeStatus(index)">重判状态</el-button>
                <el-button type="default" @click="saveDepartment(index)">存储科室</el-button>
                <el-button type="default" @click="useDepartment(index)">使用科室</el-button>
              </div>
              <el-button type="primary" link @click="item.expandTools = !item.expandTools">
                <i :class="item.expandTools ? 'iconfont icon-xiangshang' : 'iconfont icon-xiangxia'"></i>
                {{ item.expandTools ? '收起' : '展开' }}
              </el-button>
            </div>
            <div class="tools-textarea" v-show="item.expandTools">
              <div class="leftRight-div">
                <div class="left">
                  <span>左右分区</span>
                  <el-switch v-model="item.leftRightMode" @change="val => handleLeftRightModeChange(val, index)"/>
                  <span class="interval-mode-label">间隔模式</span>
                  <el-switch v-model="item.intervalMode" :disabled="!item.leftRightMode" @change="val => handleIntervalModeChange(val, index)"/>
                  <div class="setValue-div">
                    左侧
                    <el-input
                      style="width: 60px;"
                      v-model="item.leftLength"
                      placeholder="请填写内容"
                      @change="val => handleModeChange(val, index, 'left')"
                    />
                    右侧
                    <el-input
                      style="width: 60px;"
                      v-model="item.rightLength"
                      placeholder="请填写内容"
                      @change="val => handleModeChange(val, index, 'right')"
                    />
                  </div>
                </div>
                <div class="right">
                  合并检查单
                  <el-input
                    style="width: 60px;"
                    v-model="item.fromLabNumber"
                    placeholder="请填写内容"
                    @change="val => handleModeChange(val, index, 'left')"
                  />
                  到
                  <el-input
                    style="width: 60px;"
                    v-model="item.toLabNumber"
                    placeholder="请填写内容"
                    @change="val => handleModeChange(val, index, 'left')"
                  />
                  <el-button type="default" style="margin-left: 8px;" @click="toMerge(index)">合并</el-button>
                </div>
              </div>
              <div class="replaceAdd-div">
                <el-input
                  class="textarea-div"
                  v-model="item.nameTextarea"
                  style="flex: 1;"
                  :rows="2"
                  type="textarea"
                  placeholder="请填写内容"
                />
                <div class="btns">
                  <div v-if="!item.leftRightMode">
                    <div class="line1">
                      <el-button type="primary" link @click="replaceLab('name', '', index)">替换名称</el-button>
                      <el-button type="primary" link @click="replaceLab('value', '', index)">替换结果</el-button>
                      <el-button type="primary" link @click="replaceLab('range', '', index)">替换参考范围</el-button>
                      <el-button type="primary" link @click="replaceLab('unit', '', index)">替换单位</el-button>
                    </div>
                    <div class="line2">
                      <el-button type="primary" link @click="addLab('name', '', index)">添加名称</el-button>
                      <el-button type="primary" link @click="addLab('value', '', index)">添加结果</el-button>
                      <el-button type="primary" link @click="addLab('range', '', index)">添加参考范围</el-button>
                      <el-button type="primary" link @click="addLab('unit', '', index)">添加单位</el-button>
                      <el-button type="primary" link @click="addTotal(index)">多行赋值</el-button>
                      起始行
                      <el-input
                        style="width: 60px;"
                        v-model="item.startRowNumber"
                        placeholder="请填写内容"
                      />
                      结束行
                      <el-input
                        style="width: 60px;"
                        v-model="item.endRowNumber"
                        placeholder="请填写内容"
                      />
                    </div>
                    <div class="line3">
                      <el-button type="primary" link @click="assignValue(index)">单行赋值</el-button>
                      行序号：
                      <el-input
                        style="width: 60px;"
                        v-model="item.serialNumber"
                        placeholder="请填写内容"
                      />
                      <el-button class="assignBasic" type="primary" link @click="assignBasicValue(index)">基本信息赋值</el-button>
                    </div>
                  </div>
                  <div v-else>
                    <div>
                      <el-button type="primary" link @click="replaceLab('name', 'left', index)">替换左侧名称</el-button>
                      <el-button type="primary" link @click="replaceLab('value', 'left', index)">替换左侧结果</el-button>
                      <el-button type="primary" link @click="replaceLab('range', 'left', index)">替换左侧参考范围</el-button>
                      <el-button type="primary" link @click="replaceLab('unit', 'left', index)">替换左侧单位</el-button>
                      <el-button type="primary" link @click="replaceLab('', 'left', index)">替换左侧全部</el-button>
                    </div>
                    <div style="margin-top: 8px;">
                      <el-button type="primary" link @click="replaceLab('name', 'right', index)">替换右侧名称</el-button>
                      <el-button type="primary" link @click="replaceLab('value', 'right', index)">替换右侧结果</el-button>
                      <el-button type="primary" link @click="replaceLab('range', 'right', index)">替换右侧参考范围</el-button>
                      <el-button type="primary" link @click="replaceLab('unit', 'right', index)">替换右侧单位</el-button>
                      <el-button type="primary" link @click="replaceLab('', 'right', index)">替换右侧全部</el-button>
                    </div>
                    <div style="margin-top: 8px;">
                      <el-button type="primary" link @click="assignValue(index)">单行赋值</el-button>
                      行序号：
                      <el-input
                        style="width: 60px;"
                        v-model="item.serialNumber"
                        placeholder="请填写内容"
                      />
                      <el-button class="assignBasic" type="primary" link @click="assignBasicValue(index)">基本信息赋值</el-button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </commonMultiRecordEditRender>
        <el-button link type="danger" class="deleteDiv" @click="handleDelete(index)"><i class="iconfont icon-shanchu2"></i>删除</el-button>
      </div>
    </div>
  </template>
  <template v-else>
    <emptyMedicalRecord :loading="loading" :title="medicalInfo.typeName"></emptyMedicalRecord>
  </template>
  <el-dialog title="添加模板" v-model="showDialog" class="lab_new_Dialog" :width="pxToRem(640)" :before-close="handleClose">
    <el-form ref="ruleFormRef" label-position="left" :model="templateFormData" class="new_DialogForm">
      <el-form-item label="模板名称：" prop="name">
        <el-input type="text" v-model="templateFormData.name" clearable placeholder="请填写内容" :maxlength="100" show-word-limit></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSure">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog title="选择模板" v-model="selectTemDialog" class="lab_new_Dialog" :width="pxToRem(800)" :before-close="handleClose2" draggable>
    <div class="select-tem-div">
      <div class="left">
        <el-scrollbar>
          <ul>
            <li v-for="(item, index) in list" :class="{'is-active': curActiveTemIndex === index}" :key="index" @click="changeTem(item, index)">
              <CommonTooltip :content="item.name">
                <div class="content-ellipsis">{{ item.name }}</div>
              </CommonTooltip>
            </li>
          </ul>
        </el-scrollbar>
      </div>
      <div class="right">
        <commonTable class="singleTable" :data="temTableData">
          <el-table-column label="序号" min-width="40">
            <template #default="scope">
              {{scope.$index}}
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" min-width="190"></el-table-column>
          <el-table-column prop="range" label="参考范围" min-width="90"></el-table-column>
          <el-table-column prop="unit" label="单位" min-width="80"></el-table-column>
        </commonTable>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="danger" @click="handleDelete2">删 除</el-button>
        <el-button @click="handleClose2">取 消</el-button>
        <el-button type="primary" @click="handleSure2">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
defineOptions({
  name: 'LabCheck',
  inheritAttrs: false
})
import commonRecordRender from '@/components/medicalRecord/standardizedMedical/commonRecordRender.vue'
import commonMultiRecordEditRender from '@/components/medicalRecord/standardizedMedical/jiaodui/commonMultiRecordEditRender.vue'
import commonRecordTimeLine from '@/components/medicalRecord/standardizedMedical/commonRecordTimeLine.vue'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
// 基本信息
import { ref, watch, nextTick, onMounted } from 'vue'
// import WordHighlighter from 'vue-word-highlighter'
import { getMedicalDetailsData } from '@/hooks/getMedicalDetailsHooks.js'
import { saveTemplate, getTemplateList, deleteTemplate } from '@/api/api_proofread.js'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { useMedicalStore } from '@/store/medicalStore'
import { ElMessage, ElMessageBox } from 'element-plus'
const medicalStore = useMedicalStore()
const props = defineProps({
  lightQuery: {
    type: String
  },
  curMedicalInfo: {
    type: Object
  },
  medicalRecordId: {
    type: String
  },
  isEdit: {
    type: Boolean
  },
  mode: {
    type: String
  },
  otherInfo: {
    type: Object
  }
})
const loading = ref(false)
const medicalInfo = ref({
  typeName: '实验室检查'
})
const formData = ref([])

/** 构建证据路径前缀：inspections[index] */
const evidencePathPrefix = (index) => {
  return `inspections[${index}]`
}
const rowCount = ref(5)
if (props.mode === 'proofread') {
  rowCount.value = 3
}
const updateRowCount = (count) => {
  rowCount.value = count
  fieldInfo[1].rowCount = count
  fieldInfo[2].rowCount = count
}
watch(() => props.isEdit, (val) => {
  if (val) {
    updateRowCount(3)
  } else {
    if (props.mode === 'proofread') {
      updateRowCount(3)
    } else {
      updateRowCount(5)
    }
  }
})
const fieldInfo = [
  {
    label: '时间轴',
    key: 'time',
    component: 'el-date-picker',
    onlyEdit: true
  },
  {
    label: '检验信息',
    component: 'ul-li',
    rowCount: rowCount.value,
    children: [
      {
        label: '送检科室',
        key: 'department',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '检验项目',
        key: 'type',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '标本类型',
        key: 'specimen_type',
        component: 'el-input',
        type: 'text'
      },
      {
        label: '送检时间',
        key: 'time',
        component: 'el-date-picker'
      }
    ]
  },
  {
    label: '',
    key: 'content',
    component: 'el-table',
    className: 'proofreadTable',
    addText: '添加1行检验信息',
    maxCount: 100,
    border: false,
    needRowClass: true,
    rowKey: 'name',
    header: [
      {
        label: '序号',
        key: 'index',
        component: 'el-text',
        width: 17
      },
      {
        label: '名称',
        key: 'name',
        component: 'el-input',
        type: 'text',
        width: 90,
        hiddenLimit: true
      },
      {
        label: '结果',
        key: 'value',
        component: 'el-input',
        type: 'text',
        width: 50,
        needJudge: true,
        hiddenLimit: true
      },
      {
        label: '状态',
        key: 'state',
        component: 'el-select',
        allowCreate: true,
        enums: [
          {
            label: '高',
            value: '高'
          },
          {
            label: '低',
            value: '低'
          },
          {
            label: '正常',
            value: '正常'
          },
          {
            label: '不正常',
            value: '不正常'
          }
        ],
        width: 50,
        isTag: true
      },
      {
        label: '参考范围',
        key: 'range',
        component: 'el-input',
        type: 'text',
        width: 60,
        needJudge: true,
        hiddenLimit: true
      },
      {
        label: '单位',
        key: 'unit',
        component: 'el-input',
        type: 'text',
        width: props.mode === 'proofread' ? 43 : 25,
        editWidth: 60,
        hiddenLimit: true
      },
      {
        label: '操作',
        key: '',
        component: 'el-button',
        width: 28,
        onlyEdit: true
      }
    ]
  },
  {
    label: '检验诊断',
    key: 'diagnosis',
    component: 'singleDiv',
    buttonText1: '存储检验诊断',
    buttonTextKey1: 'diagnosis',
    buttonText2: '使用检验诊断',
    buttonTextKey2: 'diagnosis'
  }
]
if (props.isEdit) {
  updateRowCount(3)
}
const getEditFieldInfo = (fieldInfo) => {
  // 去除不需要编辑的字段-状态
  const newFieldInfo = _.cloneDeep(fieldInfo)
  // newFieldInfo[3].header = newFieldInfo[3].header.filter(item => item.key !== 'state')
  return newFieldInfo
}
const totalMedicalContent = ref()
const oldTotalMedicalContent = ref()
loading.value = true
const loadedCount = ref(0)
const getData = (value) => {
  getMedicalDetailsData(props).then(res => {
    if (!res) {
      loading.value = false
      return
    }
    const pageIds = []
    const orderPageIds = []
    totalMedicalContent.value = res.jsonData
    totalMedicalContent.value?.forEach((item, index) => {
      const content = []
      item.content.forEach((item, index) => {
        content.push({
          uuid: uuidv4(),
          ...item
        })
      })
      if (value === 'auto') {
        formData.value[index].type = item.type
        formData.value[index].specimen_type = item.specimen_type
        formData.value[index].time = item.time
        formData.value[index].department = item.department
        formData.value[index].inspection_number = item.inspection_number || ''
        formData.value[index].diagnosis = item.diagnosis
        formData.value[index].content = content
        formData.value[index].page_ids = item.page_ids ? item.page_ids.map(id => parseInt(id) + 1).join(',') : ''
      } else {
        formData.value[index] = {
          uuid: uuidv4(),
          type: item.type,
          specimen_type: item.specimen_type,
          time: item.time,
          department: item.department,
          inspection_number: item.inspection_number || '',
          diagnosis: item.diagnosis,
          content,
          page_ids: item.page_ids ? item.page_ids.map(id => parseInt(id) + 1).join(',') : '',
          leftRightMode: false,
          intervalMode: false,
          leftLength: '',
          rightLength: '',
          startRowNumber: '',
          endRowNumber: '',
          fromLabNumber: '',
          toLabNumber: '',
          expandTools: false,
          serialNumber: '',
          nameTextarea: ''
        }
      }

      if (item.page_ids) {
        pageIds.push(...item.page_ids)
        orderPageIds.push(item.page_ids)
      }
    })
    if (medicalStore.showOperationView) {
      oldTotalMedicalContent.value = res.rawData
      oldTotalMedicalContent.value?.forEach((item, index) => {
        if (formData.value[index]) {
          Object.assign(formData.value[index], {
            oldtype: item.type,
            oldspecimen_type: item.specimen_type,
            oldtime: item.time,
            olddepartment: item.department,
            oldinspection_number: item.inspection_number || '',
            olddiagnosis: item.diagnosis,
            oldcontent: item.content,
            oldpage_ids: item.page_ids ? item.page_ids.map(id => parseInt(id) + 1).join(',') : ''
          })
        }
      })
    }
    // 对pageIds进行去重处理
    medicalStore.setMedicalPageList([...new Set(pageIds)])
    medicalStore.setMedicalOrderPageList(orderPageIds)
    emits('updateCount', formData.value.length)
    loading.value = false
    // 初始加载前两个
    loadedCount.value = Math.min(2, formData.value.length)

    // 每隔一定时间加载一个
    if (formData.value.length > 2) {
      for (let i = 2; i < formData.value.length; i++) {
        setTimeout(() => {
          loadedCount.value++
        }, (i - 1) * 100)
      }
    }
  }).catch(() => {
    loading.value = false
  })
}
onMounted(() => {
  getData()
})
const oldFormData = ref([])
// 保存旧数据
const saveOldData = () => {
  oldFormData.value = _.cloneDeep(formData.value)
}
// 恢复旧数据
const recoverOldData = () => {
  formData.value = _.cloneDeep(oldFormData.value)
  oldFormData.value = []
  // 清空子组件引用，触发重新渲染
  editRenderRefs.value = []
  // 恢复medicalStore
  medicalStore.setEditingMedical(_.cloneDeep(formData.value))
  emits('updateCount', formData.value.length)
}
// 新建病历
const addMedicalRecord = () => {
  formData.value.push({
    uuid: uuidv4(),
    time: '',
    type: '',
    department: '',
    inspection_number: '',
    diagnosis: '',
    specimen_type: '',
    content: [],
    page_ids: '',
    leftRightMode: false,
    intervalMode: false,
    leftLength: '',
    rightLength: '',
    startRowNumber: '',
    endRowNumber: '',
    fromLabNumber: '',
    toLabNumber: '',
    expandTools: false,
    serialNumber: '',
    nameTextarea: ''
  })
  return formData.value.length
}

// 重新组装编辑后的数据
const getEditingMedicalContent = () => {
  const content = _.cloneDeep(medicalStore.editingMedical)
  if (content) {
    // 先剔除content中undefined项
    content.forEach(item => {
      if (item) {
        item.content = item.content.filter(item => item)
        // 如果item.page_ids有中文逗号，则先转成英文逗号，再转成数组
        if (item.page_ids) {
          item.page_ids = item.page_ids.replace(/，/g, ',').split(',').map(id => parseInt(id) - 1)
        }
      }
    })
    // 删除content中的uuid
    content.forEach(item => {
      if (item) {
        delete item.uuid
        delete item.leftRightMode
        delete item.intervalMode
        delete item.leftLength
        delete item.rightLength
        delete item.startRowNumber
        delete item.endRowNumber
        delete item.nameTextarea
        delete item.fromLabNumber
        delete item.toLabNumber
        delete item.expandTools
        delete item.serialNumber
        item.content.forEach(item => {
          delete item.uuid
        })
      }
    })
  }
  return content
}
const emits = defineEmits(['updateCount'])
// 删除某一份
const handleDelete = (deleteIndex) => {
  ElMessageBox.confirm('删除后无法恢复，确认删除吗？', '删除', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    const deleteUUID = formData.value[deleteIndex].uuid
    formData.value.splice(deleteIndex, 1)
    // 获取已经保存的临时数据
    const savedData = _.cloneDeep(medicalStore.editingMedical)
    // 找到修改的哪一次的检验记录
    const index = savedData.findIndex(item => item.uuid === deleteUUID)
    // 替换掉数组的某个索引的值
    savedData.splice(index, 1)
    medicalStore.setEditingMedical(savedData)
    medicalStore.setDirty(true)
    emits('updateCount', formData.value.length)
  }).catch(() => {
    // 取消删除
  })
}
const editRenderRefs = ref([])

// 动态设置 ref
const setEditRenderRef = (el, index) => {
  if (el) {
    editRenderRefs.value[index] = el
  }
}
// 存为模板
const toSaveTemplate = async (index) => {
  if (templateFormData.value.name.trim() === '') {
    ElMessage.warning('请给模板起个名字')
    return
  }
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  // 只留下template下的type字段，以及template下的content数组中每一项里的name，range，unit字段
  const content = localFormData.content.map(item => {
    return {
      name: item.name,
      range: item.range,
      unit: item.unit
    }
  })
  const params = {
    name: templateFormData.value.name,
    content: JSON.stringify(content)
  }
  const { code } = await saveTemplate(params)
  if (code === 10000) {
    ElMessage.success('模板已保存')
    handleClose()
  }
}
// 使用模板
const useTemplate = (index) => {
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  const templateValue = list.value[curActiveTemIndex.value]
  if (localFormData.content.length !== templateValue.content.length) {
    ElMessage.warning('模板行数和目标行数不一致，请调整后再套用')
    return false
  }
  templateValue.content.forEach((item, index) => {
    localFormData.content[index].name = item.name
    localFormData.content[index].range = item.range
    localFormData.content[index].unit = item.unit
  })
  childComponent.markDirty()
  ElMessage.success('模板已套用')
  handleClose2()
}
// 创建副本
const copyMedicalRecord = (index) => {
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const childData = childComponent.localFormData
  // 再添加到formData中, 不要添加到末尾，添加到copyIndex+ 1位置
  const newRecord = {
    uuid: uuidv4(),
    time: childData.time,
    type: childData.type,
    department: childData.department,
    inspection_number: childData.inspection_number,
    diagnosis: childData.diagnosis,
    specimen_type: childData.specimen_type,
    content: childData.content?.map(item => ({
      uuid: uuidv4(),
      name: item.name,
      value: item.value,
      state: item.state,
      range: item.range,
      unit: item.unit
    })),
    page_ids: childData.page_ids,
    leftRightMode: false,
    intervalMode: false,
    leftLength: '',
    rightLength: '',
    startRowNumber: '',
    endRowNumber: '',
    fromLabNumber: '',
    toLabNumber: '',
    serialNumber: '',
    nameTextarea: ''
  }
  formData.value.push(newRecord)
  const savedData = Array.isArray(medicalStore.editingMedical) ? [...medicalStore.editingMedical] : []
  savedData.push(newRecord)
  medicalStore.setEditingMedical(savedData)
  medicalStore.setDirty(true)
  ElMessage.success('已创建副本')
  // return formData.value.length
}
// 重判状态
const rejudgeStatus = (index) => {
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  localFormData.content.forEach(item => {
    childComponent.handleInput(item, 'value', item.value)
  })
  childComponent.markDirty()
  ElMessage.success('判读状态已更新')
}
// 存储科室
const saveDepartment = (index) => {
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  if (localFormData.department.trim() === '') {
    ElMessage.warning('请先选择科室')
    return
  }
  localStorage.setItem('department', localFormData.department)
  ElMessage.success('已保存')
}
// 使用科室
const useDepartment = (index) => {
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  if (localStorage.getItem('department')) {
    localFormData.department = localStorage.getItem('department')
    childComponent.markDirty()
  } else {
    ElMessage.warning('还没有保存过科室信息')
  }
}
const validateLeftRightSettings = (childComponent, index) => {
  const leftLen = Number(childComponent.leftLength) || 0
  const rightLen = Number(childComponent.rightLength) || 0
  const totalRows = childComponent.localFormData.content?.length || 0
  if (leftLen === 0 && rightLen === 0) {
    ElMessage.warning('先把左右两侧的行数填上，再开启分区')
    return false
  }
  if (leftLen + rightLen !== totalRows) {
    ElMessage.warning(`左侧+右侧的值必须等于表格行数（当前表格${totalRows}行，左侧${leftLen}+右侧${rightLen}=${leftLen + rightLen}）`)
    return false
  }
  if (formData.value[index].intervalMode && rightLen > Math.floor(totalRows / 2)) {
    ElMessage.warning(`间隔模式下右侧最多可取${Math.floor(totalRows / 2)}行，请调整左右侧行数`)
    return false
  }
  return true
}
const handleLeftRightModeChange = (val, index) => {
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  // 切换到左右分区模式时，检查左右两侧的值
  if (val) {
    formData.value[index].intervalMode = true
    if (!validateLeftRightSettings(childComponent, index)) {
      // 重置 switch 状态
      nextTick(() => {
        formData.value[index].leftRightMode = false
        formData.value[index].intervalMode = false
      })
      return
    }
  }
  childComponent.leftRightMode = val
  childComponent.intervalMode = val ? formData.value[index].intervalMode : false
  if (!val) {
    formData.value[index].intervalMode = false
    // 关闭分区模式，等待 DOM 完全更新后再初始化单表格拖拽
    nextTick(() => {
      nextTick(() => {
        childComponent.setSort()
      })
    })
  } else {
    nextTick(() => {
      childComponent.setSort2()
      formData.value[index].leftLength = childComponent.leftLength
      formData.value[index].rightLength = childComponent.rightLength
    })
  }
}
// 处理拖拽后 leftLength/rightLength 变化
const handleDragLengthChange = (val, index) => {
  formData.value[index].leftLength = val.leftLength
  formData.value[index].rightLength = val.rightLength
}
const handleIntervalModeChange = (val, index) => {
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  if (val && !formData.value[index].leftRightMode) {
    ElMessage.warning('先开启左右分区，再使用这个功能')
    nextTick(() => {
      formData.value[index].intervalMode = false
    })
    return
  }
  childComponent.intervalMode = val
  if (val && !validateLeftRightSettings(childComponent, index)) {
    childComponent.intervalMode = false
    nextTick(() => {
      formData.value[index].intervalMode = false
    })
    return
  }
  nextTick(() => {
    childComponent.setSort2()
  })
}
// 更改左侧右侧值
const handleModeChange = (val, index, which) => {
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  if (which === 'left') {
    childComponent.leftLength = val
  } else {
    childComponent.rightLength = val
  }
}
const getLeftRightTargetIndex = (childComponent, index, which, lineIndex) => {
  if (!childComponent.intervalMode) {
    if (which === 'right') {
      const leftLen = Number(formData.value[index].leftLength) || 0
      return leftLen + lineIndex
    }
    return lineIndex
  }
  const rightLen = Number(formData.value[index].rightLength) || 0
  if (which === 'right') {
    return lineIndex * 2 + 1
  }
  if (which === 'left' && lineIndex < rightLen) {
    return lineIndex * 2
  }
  return rightLen * 2 + lineIndex - rightLen
}
// 替换检验值
const replaceLab = (field, which, index) => {
  if (!formData.value[index].nameTextarea) return
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  formData.value[index].leftLength = childComponent.leftLength
  formData.value[index].rightLength = childComponent.rightLength
  const lines = formData.value[index].nameTextarea.split(/\r?\n/)
  const replaceAll = field === ''
  const leftLength = Number(formData.value[index].leftLength) || 0
  const rightLength = Number(formData.value[index].rightLength) || 0
  const targetLength = which === 'left' ? leftLength : rightLength
  if (replaceAll && ['left', 'right'].includes(which) && lines.length !== targetLength) {
    ElMessage.warning(`输入行数必须等于${which === 'left' ? '左侧' : '右侧'}行数（需要${targetLength}行），您输入了${lines.length}行`)
    return
  }
  if (which === 'left' && lines.length > leftLength) {
    ElMessage.warning('粘贴的行数超过左侧行数，请调整')
    return
  } else if (which === 'right' && lines.length > rightLength) {
    ElMessage.warning('粘贴的行数超过右侧行数，请调整')
    return
  }
  lines.forEach((line, lineIndex) => {
    const values = line.split('\t')
    let newValue = line.trim()
    // 如果是参考范围，若newValue包含~,则转换为-
    if (field === 'range' && newValue.includes('~')) {
      newValue = newValue.replace('~', '-')
    }
    // 根据 which 和当前分区模式计算原始 content 下标
    const targetIndex = getLeftRightTargetIndex(childComponent, index, which, lineIndex)
    // 获取或创建对应行
    let row = localFormData.content[targetIndex]
    if (!row) {
      row = {
        uuid: uuidv4(),
        name: '',
        value: '',
        state: '',
        range: '',
        unit: ''
      }
      localFormData.content[targetIndex] = row
    }
    if (replaceAll) {
      row.name = values[0]?.trim() || ''
      row.value = values[1]?.trim() || ''
      row.range = values[2]?.trim().replace(/[~～]/g, '-') || ''
      row.unit = values[3]?.trim() || ''
      if (row.value && row.range) {
        childComponent.handleInput(row, 'value', row.value)
      }
      return
    }
    // 更新字段
    row[field] = newValue
    // 特定字段处理
    if (['value', 'range'].includes(field) && row.value && row.range) {
      childComponent.handleInput(row, field, newValue)
    }
  })
  childComponent.markDirty()
}
const isBlankValue = (value) => {
  return value === undefined || value === null || String(value).trim() === ''
}
const isEmptyLabRow = (row) => {
  return ['name', 'value', 'range', 'unit'].every(key => isBlankValue(row?.[key]))
}
const isEmptySerialNumber = (serialNumber) => {
  return serialNumber === undefined || serialNumber === null || String(serialNumber).trim() === ''
}
// 按指定序号单行赋值：名称、结果、参考范围、单位
const assignValue = (index) => {
  const currentLab = formData.value[index]
  if (!currentLab?.nameTextarea) {
    ElMessage.warning('请粘贴要填入的内容')
    return
  }
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  const content = localFormData.content || []
  const totalRows = content.length
  const lines = currentLab.nameTextarea.split(/\r?\n/)
  let targetIndex = -1
  let serialNumber = 0
  if (isEmptySerialNumber(currentLab.serialNumber)) {
    targetIndex = content.findIndex(row => isEmptyLabRow(row))
    if (targetIndex === -1) {
      ElMessage.warning('没找到可以填入的空行，请先新增一行')
      return
    }
    serialNumber = targetIndex + 1
  } else {
    serialNumber = Number(currentLab.serialNumber)
    if (!Number.isInteger(serialNumber) || serialNumber <= 0) {
      ElMessage.warning('请填写行号（从 1 开始）')
      return
    }
    if (serialNumber > totalRows) {
      ElMessage.warning(`行序号超出范围（当前表格共${totalRows}行）`)
      return
    }
    targetIndex = serialNumber - 1
  }
  let row = content[targetIndex]
  if (!row) {
    row = {
      uuid: uuidv4(),
      name: '',
      value: '',
      state: '',
      range: '',
      unit: ''
    }
    content[targetIndex] = row
  }
  row.name = lines[0]?.trim() || ''
  row.value = lines[1]?.trim() || ''
  row.range = lines[2]?.trim().replace(/[~～]/g, '-') || ''
  row.unit = lines[3]?.trim() || ''
  if (row.value && row.range) {
    childComponent.handleInput(row, 'value', row.value)
  }
  childComponent.markDirty()
  ElMessage.success(`已成功赋值第${serialNumber}行`)
}
// 基本信息赋值：科室、检查项目、样本类型、报告时间、临床诊断
const assignBasicValue = (index) => {
  const currentLab = formData.value[index]
  if (!currentLab?.nameTextarea) {
    ElMessage.warning('请粘贴基本信息')
    return
  }
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  const fieldMap = {
    科室: 'department',
    检查项目: 'type',
    样本类型: 'specimen_type',
    报告时间: 'time',
    临床诊断: 'diagnosis'
  }
  const values = {}
  currentLab.nameTextarea.split(/\r?\n/).forEach(line => {
    const [label, ...rest] = line.split('\t')
    const key = fieldMap[label?.trim()]
    if (!key) {
      return
    }
    values[key] = rest.join('\t').trim()
  })
  if (Object.keys(values).length === 0) {
    ElMessage.warning('没识别出可填入的内容，请检查格式后重试')
    return
  }
  Object.assign(localFormData, values)
  Object.assign(currentLab, values)
  childComponent.markDirty()
  ElMessage.success('基本信息已填入')
}
// 添加检验值
const addLab = (field, which, index) => {
  if (!formData.value[index].nameTextarea) {
    ElMessage.warning('请粘贴要添加的内容')
    return
  }
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  formData.value[index].leftLength = childComponent.leftLength
  formData.value[index].rightLength = childComponent.rightLength

  // 获取起始行和结束行
  const startRow = Number(formData.value[index].startRowNumber) || 0
  const endRow = Number(formData.value[index].endRowNumber) || 0
  const totalRows = localFormData.content?.length || 0

  // 验证起始行和结束行
  if (startRow <= 0 || endRow <= 0) {
    ElMessage.warning('请填写起始行和结束行（从 1 开始）')
    return
  }
  if (startRow > endRow) {
    ElMessage.warning('起始行不能大于结束行')
    return
  }
  if (startRow > totalRows || endRow > totalRows) {
    ElMessage.warning(`行号超出范围（当前表格共${totalRows}行）`)
    return
  }

  // 左右分区模式下的额外验证
  if (which === 'left') {
    const leftLen = Number(formData.value[index].leftLength) || 0
    if (leftLen > 0 && (startRow > leftLen || endRow > leftLen)) {
      ElMessage.warning(`行号超出左侧范围（左侧共${leftLen}行）`)
      return
    }
  } else if (which === 'right') {
    const rightLen = Number(formData.value[index].rightLength) || 0
    const leftLen = Number(formData.value[index].leftLength) || 0
    if (rightLen > 0 && (startRow > leftLen + rightLen || endRow > leftLen + rightLen)) {
      ElMessage.warning(`行号超出右侧范围（右侧共${rightLen}行，从第${leftLen + 1}行开始）`)
      return
    }
  }

  // 获取要添加的内容（按行分割）
  const lines = formData.value[index].nameTextarea.split(/\r?\n/)
  if (lines.length === 0) {
    ElMessage.warning('请粘贴要添加的内容')
    return
  }

  // 计算实际要填充的行数（取内容行数和目标行数范围的最小值）
  const rowCount = endRow - startRow + 1
  const actualRowCount = Math.min(lines.length, rowCount)

  // 从起始行开始，逐个覆盖（不循环）
  for (let i = 0; i < actualRowCount; i++) {
    const targetRow = startRow + i - 1 // 转换为0-based索引
    let newValue = lines[i] // 直接取对应索引的值，不循环

    // 如果是参考范围，若newValue包含~,则转换为-
    if (field === 'range' && newValue.includes('~')) {
      newValue = newValue.replace('~', '-')
    }

    // 计算实际的 content 索引
    let actualIndex = targetRow
    if (which === 'right') {
      const leftLen = Number(formData.value[index].leftLength) || 0
      actualIndex = leftLen + targetRow
    }

    // 获取对应行
    let row = localFormData.content[actualIndex]
    if (!row) {
      row = {
        uuid: uuidv4(),
        name: '',
        value: '',
        state: '',
        range: '',
        unit: ''
      }
      localFormData.content[actualIndex] = row
    }

    // 更新字段（覆盖模式）
    row[field] = newValue

    // 特定字段处理
    if (['value', 'range'].includes(field) && row.value && row.range) {
      childComponent.handleInput(row, field, newValue)
    }
  }

  childComponent.markDirty()
  ElMessage.success(`已成功添加到第${startRow}行至第${endRow}行`)
}
// 多行赋值：每行按 名称、结果、参考范围、单位 写入表格连续行
const addTotal = (index) => {
  const currentLab = formData.value[index]
  if (!currentLab?.nameTextarea) {
    ElMessage.warning('请粘贴要填入的内容')
    return
  }
  const childComponent = editRenderRefs.value[index]
  if (!childComponent) {
    return
  }
  const localFormData = childComponent.localFormData
  const content = localFormData.content || []
  const lines = currentLab.nameTextarea.split(/\r?\n/)
  if (lines.length === 0) {
    ElMessage.warning('请粘贴要填入的内容')
    return
  }
  let startRow = Number(currentLab.startRowNumber) || 0
  let endRow = Number(currentLab.endRowNumber) || 0
  const isAutoFillRows = startRow === 0 && endRow === 0

  if (isAutoFillRows) {
    startRow = 1
    endRow = lines.length
    const maxRowCount = fieldInfo.find(item => item.key === 'content')?.maxCount || 100
    if (endRow > maxRowCount) {
      ElMessage.warning(`最多只能赋值${maxRowCount}行，您输入了${lines.length}行`)
      return
    }
    const addCount = lines.length - content.length
    for (let i = 0; i < addCount; i++) {
      content.push({
        uuid: uuidv4(),
        name: '',
        value: '',
        state: '',
        range: '',
        unit: ''
      })
    }
    currentLab.startRowNumber = startRow
    currentLab.endRowNumber = endRow
  }

  const totalRows = content.length

  if (startRow <= 0 || endRow <= 0) {
    ElMessage.warning('请填写起始行和结束行（从 1 开始）')
    return
  }
  if (startRow > endRow) {
    ElMessage.warning('起始行不能大于结束行')
    return
  }
  if (startRow > totalRows || endRow > totalRows) {
    ElMessage.warning(`输入的行数与赋值的行数必须相等，您输入了${lines.length}行，但目标行数范围内只有${totalRows}行`)
    return
  }

  const rowCount = endRow - startRow + 1
  if (lines.length !== rowCount) {
    ElMessage.warning(`输入行数必须等于起始行到结束行的行数（需要${rowCount}行），您输入了${lines.length}行`)
    return
  }

  lines.forEach((line, lineIndex) => {
    const targetIndex = startRow + lineIndex - 1
    const values = line.split('\t')
    let row = content[targetIndex]
    if (!row) {
      row = {
        uuid: uuidv4(),
        name: '',
        value: '',
        state: '',
        range: '',
        unit: ''
      }
      content[targetIndex] = row
    }

    row.name = values[0]?.trim() || ''
    row.value = values[1]?.trim() || ''
    row.range = values[2]?.trim().replace(/[~～]/g, '-') || ''
    row.unit = values[3]?.trim() || ''
    if (row.value && row.range) {
      childComponent.handleInput(row, 'value', row.value)
    }
  })

  childComponent.markDirty()
  ElMessage.success(`已成功多行赋值${lines.length}行`)
}
// 合并检查单，将检查单号fromLabNumber内的所有内容添加到toLabNumber的检查单中
const toMerge = (index) => {
  const currentLab = formData.value[index]
  const fromLabNumber = Number(currentLab.fromLabNumber) || 0
  const toLabNumber = Number(currentLab.toLabNumber) || 0

  // 验证检查单号
  if (fromLabNumber <= 0 || toLabNumber <= 0) {
    ElMessage.warning('请填写检查单序号（从 1 开始）')
    return
  }
  if (fromLabNumber > formData.value.length || toLabNumber > formData.value.length) {
    ElMessage.warning(`检查单号超出范围（当前共有${formData.value.length}个检查单）`)
    return
  }
  if (fromLabNumber === toLabNumber) {
    ElMessage.warning('合并的两张检查单不能是同一张')
    return
  }

  // 转换为0-based索引
  const fromIndex = fromLabNumber - 1
  const toIndex = toLabNumber - 1

  // 获取子组件的localFormData
  const toChildComponent = editRenderRefs.value[toIndex]
  if (!toChildComponent) {
    ElMessage.warning('目标检查单还没加载好，请稍后重试')
    return
  }
  const fromChildComponent = editRenderRefs.value[fromIndex]
  if (!fromChildComponent) {
    ElMessage.warning('源检查单还没加载好，请稍后重试')
    return
  }

  // 合并content到子组件的localFormData
  toChildComponent.localFormData.content = [
    ...toChildComponent.localFormData.content,
    ...fromChildComponent.localFormData.content
  ]

  // 同步更新formData
  formData.value[toIndex].content = [...toChildComponent.localFormData.content]

  // 更新medicalStore
  const savedData = _.cloneDeep(medicalStore.editingMedical)
  savedData[toIndex].content = [...toChildComponent.localFormData.content]
  savedData.splice(fromIndex, 1)
  medicalStore.setEditingMedical(savedData)
  medicalStore.setDirty(true)

  // 删除源检查单
  formData.value.splice(fromIndex, 1)
  // 清空对应的editRenderRefs引用
  editRenderRefs.value.splice(fromIndex, 1)
  emits('updateCount', formData.value.length)

  ElMessage.success(`已将第${fromLabNumber}个检查单合并到第${toLabNumber}个检查单，并删除了第${fromLabNumber}个检查单（可撤销）`)
}
const showDialog = ref(false)
const templateFormData = ref({
  name: ''
})
const curLabIndex = ref(0)
// 新增
const toAdd = (index) => {
  curLabIndex.value = index
  templateFormData.value.name = ''
  showDialog.value = true
}
const handleSure = () => {
  toSaveTemplate(curLabIndex.value)
}
const handleClose = async () => {
  showDialog.value = false
}
const curActiveTemIndex = ref(0)
const selectTemDialog = ref(false)
const temTableData = ref([])
const toUse = async (index) => {
  curLabIndex.value = index
  const { code, data } = await getTemplateList({
    pageNum: 1,
    pageSize: 10000
  })
  if (code === 10000) {
    list.value = data.items
    if (list.value.length > 0) {
      selectTemDialog.value = true

      list.value.forEach(item => {
        item.content = JSON.parse(item.content)
      })
      nextTick(() => {
        changeTem(list.value[0], 0)
      })
    } else {
      ElMessage.warning('还没有保存过模板，先保存一个吧')
    }
  }
}
const handleClose2 = async () => {
  selectTemDialog.value = false
}
const handleSure2 = () => {
  useTemplate(curLabIndex.value)
}
const list = ref([])
const changeTem = (item, index) => {
  curActiveTemIndex.value = index
  temTableData.value = item.content
}
// 删除模板
const handleDelete2 = () => {
  ElMessageBox.confirm(
    '删除后模板不可恢复，确认删除吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    const { code } = await deleteTemplate({
      id: list.value[curActiveTemIndex.value].id
    })
    if (code === 10000) {
      ElMessage.success('模板已删除')
      list.value.splice(curActiveTemIndex.value, 1)
      if (list.value.length > 0) {
        changeTem(list.value[0], 0)
      } else {
        // 如果左侧全部删除，右侧也清空
        temTableData.value = []
      }
    }
  }).catch(() => {
    // 用户取消操作
  })
}
defineExpose({
  saveOldData,
  recoverOldData,
  addMedicalRecord,
  getEditingMedicalContent,
  getData
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.medical-body {
  display: flex;
  margin-top: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  :deep(.el-table) {
    margin-top: 12px;
  }
  :deep(.common-record-render) {
    .commonUl-li {
      ul {
        li:nth-child(1) {
          width: auto;
          min-width: 20%;
          max-width: 50%;
          margin-right: 20px;
        }
      }
    }
  }
}
.tools {
  box-sizing: border-box;
  margin-top: 16px;
  padding: 8px;
  border-radius: 8px;
  background-color: #dce6ff;
  .section-title {
    display: flex;
    align-items: center;
    height: 20px;
    margin-bottom: 12px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);

    .line {
      width: 2px;
      height: 14px;
      margin-right: 6px;
      background-color: var(--theme-primary);
    }
  }
  .btns {
    display: flex;
    margin-top: 11px;
    margin-bottom: 8px;
  }
}
.tools-textarea {
  .section-title {
    display: flex;
    align-items: center;
    height: 20px;
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);

    .line {
      width: 2px;
      height: 14px;
      margin-right: 6px;
      background-color: var(--theme-primary);
    }
  }
  .btns {
    display: flex;
    margin-top: 11px;
  }
  :deep(.el-input) {
    width: 80px !important;
    .el-input__wrapper {
      padding-left: 8px;
      padding-right: 4px;
    }
  }
  .assignBasic {
    margin-left: 16px;
  }
}
:deep(.leftRight-div) {
  display: flex;
  justify-content: space-between;
  .el-switch {
    margin-left: 8px;
  }
  .setValue-div {
    margin-left: 8px;
  }
  .interval-mode-label {
    margin-left: 12px;
  }
  .left {
    display: flex;
    align-items: center;
  }
}
.textarea-div {
  margin-top: 8px;
}
.select-tem-div {
  display: flex;
  height: 400px;
  .left {
    width: 180px;
    ul {
      li {
        overflow: hidden;
        padding: 8px;
        cursor: pointer;
        text-overflow: ellipsis;
        color: var(--theme-text-2);
        white-space: nowrap;
        &:hover,
        &.is-active {
          border-radius: 2px;
          background: rgba(54, 112, 248, 0.05);
          font-weight: 600;
          color: var(--theme-primary);
        }
      }
    }
  }
  :deep(.right) {
    flex: 1;
    width: 0;
    padding-left: 16px;
    border-left: 1px solid #e4e4e4;
    .el-table__header {
      height: 30px !important;
    }
    .el-table {
      height: 100%;
      .el-table__cell {
        padding: 0;
        .cell {
          min-height: 30px !important;
        }
      }
    }
  }
}
</style>
