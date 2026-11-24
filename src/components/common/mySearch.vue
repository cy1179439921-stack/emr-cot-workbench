<template>
  <div :style="{ display: 'flex' }" class="mySearch">
    <slot name="pre_form_content" />
    <el-form
      :inline="true"
      :rules="rules"
      class="myForm commonSearch"
      :model="formSearch"
      ref="formSearchRef"
      @submit.prevent
      v-if="search && search.length > 0"
      v-bind="{ 'label-width': pxToRem(100), ...options?.formProps }"
    >
      <template :key="index" v-for="(item, index) in search">
        <el-form-item
          :prop="item.value"
          v-bind="item.labelProps"
          :label="item.label"
        >
          <el-select
            clearable
            class="normalSelect"
            v-bind="item.props"
            v-if="item.type === 'select'"
            v-model="formSearch[item.value]"
            placeholder="请选择一项"
          >
            <!-- :placeholder="`请选择${item.placeholder || item.label}`" -->
            <el-option
              v-for="(option, v) in item.EnumValues"
              :key="v"
              :value="option.id"
              :label="option.name"
            />
          </el-select>
          <el-select-v2
            clearable
            multiple
            :item-height="echartsToPx(34)"
            collapse-tags
            collapse-tags-tooltip
            style="width: 100%;"
            v-bind="item.props"
            class="selectV2"
            @blur="clearSearch(item)"
            @focus="clearSearch(item)"
            :options="(currentEnumValues&&searchKeyword&&item.soleID===soleID)?currentEnumValues:item.EnumValues"
            v-else-if="item.type === 'select-v2'"
            v-model="formSearch[item.value]"
            placeholder="请选择一项"
          >
            <!-- :placeholder="`请选择${item.placeholder || item.label}`" -->
            <template #header>
              <el-input placeholder="搜索名称" v-model.trim="searchKeyword" clearable @input="filterOptions(item)" />
            </template>
            <template #label="{ value }">
              <span class="ellipsis" :title="value">{{ item.EnumValues.find(item => item.value === value)?.label || value }}</span>
            </template>
            <template #default="{ item }">
              <div class="selectV2Item" v-show-tip>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="item.label"
                  placement="bottom"
                  :open-delay="400"
                  :enterable="false"
                  :hide-after="0"
                >
                  <div class="selectV2Label">{{ item.label}}</div>
                </el-tooltip>
              </div>
            </template>
          </el-select-v2>
          <!-- <CommonMultiSelectV2WithSearch
            v-else-if="item.type === 'select-v2'"
            class="selectV2"
            v-model="formSearch[item.value]"
            :options="item.EnumValues"
            placeholder="请选择一项"
          > -->
          <!-- filterable -->
          <commonMultipleSelect
            class="mulSelect"
            v-else-if="item.type === 'mulSelect'&&!item.isShowSearch"
            v-model="formSearch[item.value]"
            multiple
            clearable
            @blur="clearSearch(item)"
            @focus="clearSearch(item)"
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择一项"
            :options="item.EnumValues"
          >

          </commonMultipleSelect>
          <!-- <el-select
            class="mulSelect"
            v-else-if="item.type === 'mulSelect'&&!item.isShowSearch"
            v-model="formSearch[item.value]"
            multiple
            clearable
            @blur="clearSearch(item)"
            @focus="clearSearch(item)"
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择一项"
          >
            <el-option
              v-for="(option, v) in item.EnumValues"
              :key="v"
              :value="option.id"
              :label="option.name"
            />
          </el-select> -->
          <CommonMultiSelectWithSearch
            class="mulSelect"
            v-else-if="item.type === 'mulSelect'&&item.isShowSearch"
            v-model="formSearch[item.value]"
            :options="item.EnumValues"
            placeholder="请选择一项">

          </CommonMultiSelectWithSearch>
          <el-row
            type="flex"
            :gutter="24"
            class="relationContainer"
            v-else-if="item.type === 'relationSelect'"
          >
            <el-select
              class="relationSelect"
              clearable
              @change="handleRelationChange(item)"
              v-bind="item.props"
              v-model="formSearch[item.relationValue]"
              placeholder="请选择一项"
            >
              <el-option
                v-for="(option, v) in item.EnumValues"
                :key="v"
                :value="option.value"
                :label="option.name"
              />
            </el-select>
            <!-- <el-input
              v-if="formSearch[item.relationValue] !== 4"
              style="width: 100%;"
              class="ageInput"
              v-model="formSearch[item.value]"
              placeholder="请填写内容"
            /> -->
            <el-input-number
              v-no-e
              v-if="formSearch[item.relationValue] !== 'between'"
              :min="item.min||-Infinity"
              :max="item.max||Infinity"
              class="ageInput"
              :precision="myIsEmpty(item.precision)"
              title=""
              placeholder="请填写内容"
              @change="handleAloneValue(item)"
              v-model="formSearch[item.value]"
              :controls="false"
            />
            <rangeSelect
              class="rangeSelect"
              :valueRange="item.valueRange"
              :precision="item.precision"
              v-if="formSearch[item.relationValue] === 'between'"
              v-model="formSearch[item.rangeValue]"
            >
            </rangeSelect>

            <!-- <el-input
              class="ageInput"
              v-if="formSearch[item.relationValue] === 4"
              v-model="formSearch[item.value]"
              placeholder="请填写内容"
            />
            <span v-if="formSearch[item.relationValue] === 4">-</span>
            <el-input
              class="ageInput"
              v-if="formSearch[item.relationValue] === 4"
              v-model="formSearch[item.value]"
              placeholder="请填写内容"
            /> -->
          </el-row>
          <el-date-picker
            clearable
            placeholder="请选择一项"
            v-bind="item.props || { type: 'date' }"
            v-else-if="item.type === 'picker'"
            v-model="formSearch[item.value]"
          />
          <el-date-picker
            clearable
            placeholder="请选择一项"
            range-separator="-"
            :value-format="item.valueFormat || 'YYYY-MM-DD HH:mm:ss'"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            v-bind="item.props || { type: 'datetimerange' }"
            v-else-if="item.type === 'datetimerange'"
            v-model="formSearch[item.value]"
          />
          <el-date-picker
            v-else-if="item.type === 'datePicker'||item.type === 'daterange'"
            v-model="formSearch[item.value]"
            type="daterange"
            range-separator="-"
            :value-format="item.valueFormat || 'YYYY-MM-DD'"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
          <!-- 正整数或者小数 -->
          <el-input
            v-model="formSearch[item.value]"
            :maxlength="item.maxlength"
            onafterpaste
            @input="handleValueFomatter(item)"
            v-else-if="item.type === 'number'||item.type === 'positiveInteger'"
            placeholder="请填写内容"
            @keyup.enter="handleSearch"
            clearable />
          <!-- <el-row
            type="flex"
            :gutter="5"
            v-else-if="item.type === 'datePicker'"
          >
            <el-col :span="12">
              <el-date-picker
                clearable
                :editable="false"
                placeholder="选择开始日期"
                v-bind="item.props || { type: 'date' }"
                v-model="formSearch[item.startDate]"
                :disabled-date="
                  (time) => startPickerOptions(time, formSearch[item.endDate])
                "
              />
            </el-col>
            <el-col :span="12">
              <el-date-picker
                clearable
                :editable="false"
                placeholder="选择结束日期"
                v-bind="item.props || { type: 'date' }"
                v-model="formSearch[item.endDate]"
                :disabled-date="
                  (time) => endPickerOptions(time, formSearch[item.startDate])
                "
              />
            </el-col>
          </el-row> -->
          <el-input
            v-else
            clearable
            class="textInput"
            v-bind="item.props"
            :type="item.inputType || 'text'"
            v-model.trim="formSearch[item.value]"
            placeholder="请填写内容"
            :maxlength="item.maxlength"
            @keyup.enter="handleSearch"
            :oninput="handleChangeInput(item)"
          >
            <!-- :placeholder="`请填写${item.placeholder || item.label}`" -->
            <template #append v-if="item.vSlot">
              <el-button icon="Search" @click="handleSearch" />
            </template>
          </el-input>
          <div
            class="deleteBtn"
            v-if="!item.init && needDel"
            @click="handleDel(item, index)"
          >
            <i class="iconfont icon-shanchu"></i>
          </div>
        </el-form-item>
      </template>
    </el-form>
    <div class="submitContainer">
      <slot></slot>
    </div>
    <slot name="next_form_content" />
  </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { reactive, ref, onMounted, watch, computed, nextTick } from 'vue'
import rangeSelect from '@/components/common/rangeSelect.vue'
import CommonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import lodash from 'lodash'
import { echartsToPx } from '@/utils/utils'
const myIsEmpty = (val) => {
  if (val === 0) {
    return 0
  } else {
    return lodash.isEmpty(val) ? 3 : val
  }
}
const props = defineProps({
  search: {
    type: Array,
    default: () => {
      return []
    }
  },
  rules: {
    type: Array,
    default: () => {
      return []
    }
  },
  options: {
    type: Object,
    default: () => {
      return {}
    }
  },
  reset: {
    type: Boolean,
    default: true
  },
  isShowSearch: {
    type: Boolean,
    default: true
  },
  isShowReset: {
    type: Boolean,
    default: true
  },
  value: {
    type: Object,
    default: () => {
      return {}
    }
  },
  // 是否需要删除按钮
  needDel: {
    type: Boolean,
    default: false
  }
})
const formSearch = ref({})

const formSearchRef = ref()

const emit = defineEmits(['handleSearch', 'handleReset', 'handelDel'])

// 搜索查询按钮
const handleSearch = () => {
  emit('handleSearch')
}

// 搜索重置按钮
const handleReset = (formName) => {
  formSearch.value = {}
}
const handleDel = (item, index) => {
  // 年龄 关系的选择需要特殊删除
  if (item.type === 'relationSelect') {
    delete formSearch.value[item.value]
    delete formSearch.value[item.rangeValue]
    delete formSearch.value[item.relationValue]
    delete formSearch.value[item.minValue]
    delete formSearch.value[item.maxValue]
  } else {
    delete formSearch.value[item.value]
  }
  emit('handelDel', item, index)
}
const handleRelationChange = (item) => {
  nextTick(() => {
    formSearch.value[item.rangeValue] = []
    formSearch.value[item.value] = ''
  })
}
const handleAloneValue = (item) => {
  formSearch.value[item.rangeValue] = [formSearch.value[item.value]]
}
// input为number校验
const handleChangeInput = (item) => {
  return item.inputType === 'number'
    ? handleOnInput(formSearch.value[item.value], item.value, item.maxlength)
    : null
}

// input渲染长度校验
const handleOnInput = (val, label, maxlength) => {
  if (val && Number(val) <= 0) {
    formSearch.value[label] = undefined
  }
  if (maxlength && val && val.length > maxlength) {
    formSearch.value[label] = formSearch.value[label].slice(0, maxlength)
  }
}

const handleValueFomatter = (item) => {
  if (item.type === 'number') {
    // 限制小数位的输入,默认两位
    formSearch.value[item.value] = formSearch.value[item.value].replace(/[^\d.]/g, '')
    formSearch.value[item.value] = formSearch.value[item.value].replace(/^\./g, '').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
    const reg = new RegExp('^(\\d+)\\.(\\d{' + (item.limit || 2) + ',}).$')
    formSearch.value[item.value] = formSearch.value[item.value].replace(reg, '$1.$2')
  } else {
    // 正整数
    formSearch.value[item.value] = formSearch.value[item.value].replace(/[^\d]/g, '')
  }
}
const currentEnumValues = ref([])
const searchKeyword = ref('')
const soleID = ref('')
const clearSearch = (obj) => {
  soleID.value = obj.soleID
  searchKeyword.value = ''
  currentEnumValues.value = []
}
const filterOptions = (obj) => {
  const keyword = searchKeyword.value.toLowerCase()
  currentEnumValues.value = obj.EnumValues.filter(item =>
    item.label?.toLowerCase().includes(keyword) || item.name?.toLowerCase().includes(keyword)
  )
}
onMounted(() => {
  if (props.value) {
    Object.assign(formSearch.value, props.value)
  }
})

watch(
  () => props.value,
  (newval) => {
    formSearch.value = {
      ...props.value
    }
  }
)
defineExpose({ formSearch, handleReset })
</script>

<script>
export default { name: 'SearchForm' }
</script>

<style lang="scss" scoped>
.mySearch {
  display: flex;
  .submitContainer {
    display: flex;
    flex-wrap: nowrap;
    flex: 1;
    white-space: nowrap;
  }
}

:deep(.el-form-item__label) {
  width: auto !important;
}
:deep(.rangeSelect) {
  overflow: hidden;
  // border-radius: 0 6px 6px 0;
}
.mulSelect,
.textInput,
.normalSelect {
  width: 147px;
}
.normalSelect {
  height: 100%;
  background-color: var(--theme-fill);
}
:deep(.mulSelect) {
  // .el-select__selection {
  //   flex-wrap: nowrap;
  // }
  .el-select__tags {
    max-width: 129px !important;
    .el-tag {
      padding: 0 5px;
    }
  }
}
.commonSearch .el-form-item .el-select.relationSelect {
  width: 100px !important;
  margin-right: 10px;
}
.relationContainer {
  display: flex;
  align-items: center;
  // min-width: 180px;
  // height: 28px;
  margin: 0 !important;
}
:deep(.el-form-item):hover {
  .deleteBtn {
    display: block;
    cursor: pointer;
  }
}
.deleteBtn {
  display: none;
  position: absolute;
  right: 0;
  top: -28px;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  border-radius: 6px 6px 6px 6px;
  background: var(--theme-card);
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.16);
  text-align: center;
  font-size: 28px;
  color: #f76868;
  i {
    font-size: 28px;
  }
}
.selectV2 {
  :deep(.el-select__selection) {
    // overflow: hidden;
    flex-wrap: nowrap;
  }
}
.selectV2Item {
  width: 100%;
  .selectV2Label {
    overflow: hidden; /* 隐藏溢出内容 */
    flex: 1;
    line-height: 20px;
    text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
    font-weight: 400;
    font-size: 14px;
    white-space: nowrap;
  }
}
</style>
<style lang="scss">
.el-select-dropdown__item {
  height: 34px !important;
}
.el-select-dropdown__header {
  border-bottom: none;
}
</style>
