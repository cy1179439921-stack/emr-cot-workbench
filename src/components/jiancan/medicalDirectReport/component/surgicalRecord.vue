<template>
  <universalModule :item="item" :isEdit="isEdit" :isViewPdf="isViewPdf" :formData="formData" :lable="lable" :artificialIntelligenceForm="artificialIntelligenceForm">
    <template #手术记录数量="scope">
      <el-table :data="tableData" style="width: 100%;" class="tableFrom" ref="elTableRef" row-key="index" :key="tableKey">
        <el-table-column prop="index" label="编号" :min-width="60">
          <template #default="items">
            <div class="dragBtn" v-if="isEdit">
              <!-- <el-icon><Operation /></el-icon> -->
              <i class="iconfont icon-liebiao-shangxiayi"></i>
              {{items.row.index}}
            </div>
            <span v-else>{{ items.row.index }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="手术及操作名称" :min-width="120">
          <template #default="items">
            <el-form-item :prop="props.lable + scope.item.children[0].name + (items.row.index)" :rules="scope.item.children[0].rules || null">
              <div style="display: flex; width: 100%;">
                <!-- <el-input v-model="formData[props.lable + scope.item.children[0].name + (items.row.index)]" placeholder="请填写内容"  @blur="channelArtificialIntelligenceForm(props.lable + scope.item.children[0].name + (items.row.index))"></el-input> -->
                <operationCodeSelect isOperationCodeListLoaded useCustomSelectionItems valueFileds="name"
                                     @click="isClick = (props.lable + scope.item.children[0].name + (items.row.index))"
                                     :options="isClick === (props.lable + scope.item.children[0].name + (items.row.index)) ? options : []"
                                     @blur="channelArtificialIntelligenceForm(props.lable + scope.item.children[0].name + (items.row.index))"
                                     v-if="isEdit"
                                     v-model="formData[props.lable + scope.item.children[0].name + (items.row.index)]"
                                     @change="(value) => changeSur(props.lable + scope.item.children[0].name,items.row.index,value)"
                                     :popperClass="isViewPdf ? 'setWidthPopper' : ''"
                >
                </operationCodeSelect>
                <span class="warp" v-else>
                  {{ formData[props.lable + scope.item.children[0].name + (items.row.index)] || '-' }}
                </span>
                <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.children[0].name + (items.row.index)]">
                  <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
                </el-tooltip>
              </div>
              <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.children[0].name + (items.row.index)) && isEdit" v-html="errMsg(props.lable + scope.item.children[0].name + (items.row.index)).join('<br/>')"></div>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="手术及操作编码" :min-width="120" >
          <template #default="items">
            <el-form-item :prop="props.lable + scope.item.children[1].name + (items.row.index)" :rules="scope.item.children[1].rules || null">
              <div style="display: flex; width: 100%;">
                <!-- <el-input v-model="formData[props.lable + scope.item.children[1].lable + (items.row.index)]" placeholder="请填写内容" v-if="isEdit" @blur="channelArtificialIntelligenceForm(props.lable + scope.item.children[1].lable + (items.row.index))"></el-input> -->
                <operationCodeSelect isOperationCodeListLoaded useCustomSelectionItems
                                     @click="isClick = (props.lable + scope.item.children[1].lable + (items.row.index))"
                                     :options="isClick === (props.lable + scope.item.children[1].lable + (items.row.index)) ? options : []"
                                     @blur="channelArtificialIntelligenceForm(props.lable + scope.item.children[1].name + (items.row.index))"
                                     v-if="isEdit"
                                     v-model="formData[props.lable + scope.item.children[1].lable + (items.row.index)]"
                                     @change="(value) => changeSur(props.lable + scope.item.children[1].name,items.row.index,value)"
                                     :popperClass="isViewPdf ? 'setWidthPopper' : ''"
                ></operationCodeSelect>
                <span class="warp" v-else>
                  {{ formData[props.lable + scope.item.children[1].name + (items.row.index)] || '-' }}
                </span>
                <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.children[1].name + (items.row.index)]">
                  <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
                </el-tooltip>
              </div>
              <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.children[1].name + (items.row.index)) && isEdit" v-html="errMsg(props.lable + scope.item.children[1].name + (items.row.index)).join('<br/>')"></div>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="手术日期" :min-width="120" >
          <template #default="items">
            <el-form-item :prop="props.lable + scope.item.children[2].name + (items.row.index)" :rules="scope.item.children[2].rules || null">
              <div style="display: flex; width: 100%;">
                <el-date-picker
                  v-if="isEdit"
                  :disabledDate="dateOptions"
                  v-model="formData[props.lable + scope.item.children[2].lable + (items.row.index)]"
                  :type="scope.item.children[2].type ? scope.item.children[2].type : 'datetime'"
                  :format="scope.item.children[2].minute ? scope.item.children[2].format : 'YYYY-MM-DD HH:mm:ss'"
                  :value-format="scope.item.children[2].minute ? scope.item.children[2].format : 'YYYY-MM-DD HH:mm:ss'"
                  @blur="channelArtificialIntelligenceForm(props.lable + scope.item.children[2].lable + (items.row.index))"
                >
                </el-date-picker>
                <span class="warp" v-else>
                  {{ formData[props.lable + scope.item.children[2].name + (items.row.index)] || '-' }}
                </span>
                <el-tooltip effect="dark" content="该字段结果为智能提取" placement="bottom" v-if="artificialIntelligenceForm[props.lable + scope.item.children[2].name + (items.row.index)]">
                  <img :src="artificialIntelligence" alt="该字段结果为智能提取" class="artificialIntelligence">
                </el-tooltip>
              </div>
              <div class="el-form-item__error" v-if="errMsg(props.lable + scope.item.children[2].name + (items.row.index)) && isEdit" v-html="errMsg(props.lable + scope.item.children[2].name + (items.row.index)).join('<br/>')"></div>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="操作" :min-width="60" v-if="isEdit">
          <template #default="scope">
            <el-button link type="danger" size="small" @click="remove(scope.row.index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <span class="add" :class="{ 'is-disabled': formData[props.lable + '手术记录数量'] >= 6 }" @click="add(tableData.length)" v-if="isEdit">+ 添加1行手术记录</span>
    </template>
  </universalModule>
</template>
<script setup>
import universalModule from '@/components/jiancan/medicalDirectReport/component/universalModule.vue'
import artificialIntelligence from '@/assets/artificialIntelligence.png'
import { ref, toRefs, watch, onMounted, nextTick } from 'vue'
import operationCodeSelect from '@/components/common/operationCodeSelect.vue'
import Sortable from 'sortablejs'
import { getOperationCodeList } from '@/api/jiancanAPI/api_home'
import { errorCollector, errorCollectorHandler } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import _ from 'lodash'
defineOptions({
  name: 'surgicalRecord',
  inheritAttrs: false
})
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isEdit: { // 是否编辑
    type: Boolean,
    required: true,
    default: false
  },
  formData: { // 表单数据
    type: Object,
    required: true
  },
  lable: {
    type: String
  },
  isViewPdf: { // 是否为预览pdf
    type: Boolean,
    default: false
  },
  artificialIntelligenceForm: {
    type: Object, // 人工智能标识
    default: () => ({})
  }
})
const { formData, artificialIntelligenceForm } = toRefs(props)
const tableData = ref([])
const tableKey = ref(0)
const options = ref([])
const isClick = ref('') // 是否点击选择
// 清空人工智能标识
const channelArtificialIntelligenceForm = (name) => {
  if (artificialIntelligenceForm.value[name]) {
    artificialIntelligenceForm.value[name] = false
  }
}

const add = (index) => {
  if (index >= 6) {
    return
  }
  formData.value[props.lable + '手术记录数量'] = formData.value[props.lable + '手术记录数量'] + 1
  const num = formData.value[props.lable + '手术记录数量']
  if ((index + 1) !== num) {
    for (let i = num; i > index; i--) {
      formData.value[props.lable + '手术及操作名称' + i] = formData.value[props.lable + '手术及操作名称' + (i - 1)]
      formData.value[props.lable + '手术及操作编码' + i] = formData.value[props.lable + '手术及操作编码' + (i - 1)]
      formData.value[props.lable + '手术日期' + i] = formData.value[props.lable + '手术日期' + (i - 1)]
    }
    delete formData.value[props.lable + '手术及操作名称' + (index + 1)]
    delete formData.value[props.lable + '手术及操作编码' + (index + 1)]
    delete formData.value[props.lable + '手术日期' + (index + 1)]
  }
}
const remove = (index) => {
  for (let i = 1; i <= 6; i++) {
    const valList = [formData['手术记录（病案首页中原始信息）' + '手术及操作名称' + i], formData['手术记录（病案首页中原始信息）' + '手术及操作编码' + i], formData['手术记录（病案首页中原始信息）' + '手术日期' + i]]
    const errMsg = `手术及操作名称${i},手术及操作编码${i},手术日期${i}为一组需同时存在`
    const conditionalJudgment = !(valList.every(val => _.isString(val)) || valList.every(val => !_.isString(val)))
    errorCollectorHandler('手术记录（病案首页中原始信息）手术及操作名称' + i, errMsg, conditionalJudgment ? 'add' : 'del')
    errorCollectorHandler('手术记录（病案首页中原始信息）手术及操作编码' + i, errMsg, conditionalJudgment ? 'add' : 'del')
    errorCollectorHandler('手术记录（病案首页中原始信息）手术日期' + i, errMsg, conditionalJudgment ? 'add' : 'del')
  }

  const num = formData.value[props.lable + '手术记录数量']
  formData.value[props.lable + '手术记录数量'] = formData.value[props.lable + '手术记录数量'] - 1
  if (num === index) {
    delete formData.value[props.lable + '手术及操作名称' + index]
    delete formData.value[props.lable + '手术及操作编码' + index]
    delete formData.value[props.lable + '手术日期' + index]
  } else {
    for (let i = index; i < num; i++) {
      formData.value[props.lable + '手术及操作名称' + i] = formData.value[props.lable + '手术及操作名称' + (i + 1)]
      formData.value[props.lable + '手术及操作编码' + i] = formData.value[props.lable + '手术及操作编码' + (i + 1)]
      formData.value[props.lable + '手术日期' + i] = formData.value[props.lable + '手术日期' + (i + 1)]
    }
    delete formData.value[props.lable + '手术及操作名称' + num]
    delete formData.value[props.lable + '手术及操作编码' + num]
    delete formData.value[props.lable + '手术日期' + num]
  }
}

const dateOptions = (time) => {
  return time.getTime() > Date.now() - 8.64e6
}

watch(() => formData.value[props.lable + '手术记录数量'], (newVal) => {
  tableData.value = Array.from({ length: newVal }, (_, index) => ({
    index: index + 1
  }))
}, { deep: true, immediate: true })

const elTableRef = ref(null)
const setSort = () => {
  nextTick(() => {
    if (elTableRef?.value) {
      const el = elTableRef?.value?.$el.querySelector('tbody')
      // eslint-disable-next-line no-new
      new Sortable(el, {
        handle: '.dragBtn',
        animation: 180,
        delay: 0,
        onEnd: (e) => {
          const newIndex = e.newIndex + 1
          const oldIndex = e.oldIndex + 1
          if (newIndex !== oldIndex) {
            if (newIndex > oldIndex) {
              const oldsurgeryAndOperationName = formData.value[props.lable + '手术及操作名称' + oldIndex]
              const oldsurgeryAndOperationCode = formData.value[props.lable + '手术及操作编码' + oldIndex]
              const oldsurgeryDate = formData.value[props.lable + '手术日期' + oldIndex]
              for (let i = oldIndex; i < newIndex; i++) {
                formData.value[props.lable + '手术及操作名称' + i] = formData.value[props.lable + '手术及操作名称' + (i + 1)]
                formData.value[props.lable + '手术及操作编码' + i] = formData.value[props.lable + '手术及操作编码' + (i + 1)]
                formData.value[props.lable + '手术日期' + i] = formData.value[props.lable + '手术日期' + (i + 1)]
              }
              formData.value[props.lable + '手术及操作名称' + newIndex] = oldsurgeryAndOperationName
              formData.value[props.lable + '手术及操作编码' + newIndex] = oldsurgeryAndOperationCode
              formData.value[props.lable + '手术日期' + newIndex] = oldsurgeryDate
            } else {
              const surgeryAndOperationName = formData.value[props.lable + '手术及操作名称' + oldIndex]
              const surgeryAndOperationCode = formData.value[props.lable + '手术及操作编码' + oldIndex]
              const surgeryDate = formData.value[props.lable + '手术日期' + oldIndex]
              for (let i = oldIndex; i > newIndex; i--) {
                formData.value[props.lable + '手术及操作名称' + i] = formData.value[props.lable + '手术及操作名称' + (i - 1)]
                formData.value[props.lable + '手术及操作编码' + i] = formData.value[props.lable + '手术及操作编码' + (i - 1)]
                formData.value[props.lable + '手术日期' + i] = formData.value[props.lable + '手术日期' + (i - 1)]
              }
              formData.value[props.lable + '手术及操作名称' + newIndex] = surgeryAndOperationName
              formData.value[props.lable + '手术及操作编码' + newIndex] = surgeryAndOperationCode
              formData.value[props.lable + '手术日期' + newIndex] = surgeryDate
            }
          }
          nextTick(() => {
            tableKey.value = Math.random()
            setSort()
          })
        }
      })
    }
  })
}

onMounted(async () => {
  await getCode()
  setSort()
})

const changeSur = (filed, index, value) => {
  switch (filed) {
    case '手术记录（病案首页中原始信息）手术及操作名称':
      formData.value[props.lable + '手术及操作编码' + index] = options.value.find(item => item.name === value)?.code
      break
    case '手术记录（病案首页中原始信息）手术及操作编码':
      formData.value[props.lable + '手术及操作名称' + index] = options.value.find(item => item.code === value)?.name
      break
  }
}

const errMsg = (name) => {
  return [...new Set(errorCollector.value[name]?.map(item => item.replace(/条件\d+/, '')) || [])]
}

const getCode = async () => {
  const params = {
    pageNum: 1,
    pageSize: 50000
  }
  getOperationCodeList(params).then(res => {
    options.value = res.data?.items || []
  })
}

</script>
<style lang="scss" scoped>
.center {
  display: flex;
  i {
    margin-right: 20px;
    margin-top: 10px;
    cursor: pointer;
  }
}
.add {
  display: block;
  box-sizing: border-box;
  margin: 12px 0  24px 0;
  border: 1px dashed #d8d8d8;
  cursor: pointer;
  user-select: none;
  line-height: 32px;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  color: #3670f8;
}
.is-disabled {
  cursor: not-allowed;
}
.tableFrom {
  margin-top: 6px;
  transform: translateZ(0);
  .dragBtn {
    display: flex;
    align-items: center;
    cursor: pointer;
    i {
      visibility: hidden;
      margin-right: 7px;
      font-size: 10px;
    }
  }
  .el-table__header {
    height: 42px;
  }
  :deep(.el-form-item__error) {
    position: unset;
  }
  :deep(.el-table__header-wrapper) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  :deep(td,th) {
    padding: 12px 0 !important;
  }
  :deep(.el-form-item) {
    width: 100%;
    margin: 0 !important;
  }
  :deep(.el-form-item__content) {
    width: calc(100% - 24px) !important;
    img {
      right: -26px;
    }
  }
  :deep(tbody tr td) {
    border-bottom: 1px solid #e8e8e8 !important;
    .el-button {
      padding: 5px 0 !important;
    }
  }
  :deep(tbody tr:hover) {
    i {
      visibility: visible;
    }
  }
  :deep(thead tr th) {
    background-color: rgba(54, 112, 248, 0.05) !important;
  }
  :deep(.el-table__empty-block) {
    border-bottom: 1px solid #e8e8e8 !important;
  }
  :deep(.el-table__empty-text) {
    line-height: 42px;
  }
  :deep(.el-table__empty-block) {
    box-sizing: border-box;
    height: 42px !important;
    min-height: 42px !important;
  }
  :deep(.operation-code-select) {
    position: relative;
    .el-popper {
      z-index: 9999 !important;
    }
  }
}
</style>
<style lang="scss">
.setWidthPopper {
  .el-select-dropdown {
    min-width: 270px !important;
    .el-select-dropdown__list {
      width: 100% !important;
    }
  }
}
</style>
