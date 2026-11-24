<template>
  <div class="main" @scroll="handleScroll($event)">
    <div class="type" v-if="['and','or','nor'].includes(nodeVal.nodeCondition)">
      <p class="typeAddAll" :class="nodeVal.nodeCondition === 'or' ? 'typeAdd' : (nodeVal.nodeCondition === 'and' ? 'typeAddss' : 'typeAdds')" @click.stop="emit('addNodes',id)" v-if="!isDisabled"><el-icon><Plus /></el-icon></p>
      <el-select placeholder="请选择一项" v-model="nodeVal.nodeCondition" class="typeSelAll" :class="nodeVal.nodeCondition === 'or' ? 'typeSel' : (nodeVal.nodeCondition === 'and' ? 'typeSelss' : 'typeSels')" :teleported="true" :disabled="isDisabled">
        <el-option v-for="item in relationshipArr" :key="item.id" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </div>
    <div class="val" v-else>
      <p class="valAdd" @click.stop="emit('addNodes',id)" v-if="!isDisabled"><el-icon><Plus /></el-icon></p>
      <el-select class="valSel" v-model="nodeValue.indexId" @change="conditionChange" filterable placeholder="请选择一项" :teleported="true" :disabled="isDisabled">
        <el-option v-for="item in treeList" :key="item.id" :label="item.name" :value="item[valueFileds]"></el-option>
      </el-select>
      <el-select class="valSel" v-model="nodeValue.condition" placeholder="请选择一项" v-if="[1,2,5,6,''].includes(nodeValue.dataType)" :teleported="true" :disabled="isDisabled">
        <el-option v-for="item in conditionArrFir" :key="item.id" :label="item.label" :value="item.value"> </el-option>
      </el-select>
      <el-select class="valSel" v-model="nodeValue.condition" placeholder="请选择一项" v-if="[3].includes(nodeValue.dataType)" :teleported="true" :disabled="isDisabled">
        <el-option v-for="item in conditionArrThr" :key="item.id" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select class="valSel" v-model="nodeValue.condition" placeholder="请选择一项" v-if="[4].includes(nodeValue.dataType)" :teleported="true" :disabled="isDisabled">
        <el-option v-for="item in conditionArrSel" :key="item.id" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-input class="txtVal" v-model="nodeValue.value" placeholder="请填写内容" oninput ="value=value.replace(/[^0-9]/g,'')" v-if="nodeValue.dataType === 1" :disabled="isDisabled"></el-input>
      <el-input class="txtVal" v-model="nodeValue.value" placeholder="请填写内容" oninput ="value=value.replace(/[^0-9.]/g,'')" v-if="nodeValue.dataType === 2 || nodeValue.dataType === ''" :disabled="isDisabled"></el-input>

      <el-input class="txtVal" type="text" v-model="nodeValue.value" placeholder="请填写内容" v-if="[3].includes(nodeValue.dataType)" :disabled="isDisabled"></el-input>

      <template v-if="nodeValue.dataType === 4 && !virtualScrollingListName.includes(nodeValue.name)">
        <commonMultipleSelect
          class="valSel"
          v-model="nodeValue.valueList"
          :options="selectList"
          placeholder="请选择一项"
          v-if="isMultiple"
          :teleported="true"
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="1"
          :disabled="isDisabled"
        />
        <!-- <el-select class="valSel" v-model="nodeValue.valueList" multiple placeholder="请选择一项" v-if="isMultiple" :teleported="true" collapse-tags collapse-tags-tooltip :max-collapse-tags="1" :disabled="isDisabled">
          <el-option v-for="item in selectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select> -->
        <el-select class="valSel" v-model="nodeValue.value" :placeholder="请选择一项" v-if="!isMultiple" :teleported="true" :disabled="isDisabled">
          <el-option v-for="item in selectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </template>
      <template v-if="nodeValue.dataType === 4 && virtualScrollingListName.includes(nodeValue.name)">
        <!-- <operationCodeSelect class="valSel" useCustomSelectionItems valueFileds="value" labelFileds="code" :options="selectList" v-model="nodeValue.valueList" multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="1" :teleported="true"></operationCodeSelect> -->

        <el-select-v2 clearable multiple :item-height="echartsToPx(34)" collapse-tags collapse-tags-tooltip :max-collapse-tags="1" class="valSel selectV2Graph" :options="filterOptionsVirtual" v-model="nodeValue.valueList" placeholder="请选择一项" :disabled="isDisabled" @visible-change="searchKeyword = ''">
          <template #header>
            <el-input placeholder="搜索名称" v-model.trim="searchKeyword" clearable/>
          </template>
          <template #label="{ value }">
            <span class="ellipsis" :title="selectList.find(item => item.value === value)?.label || value">{{ selectList.find(item => item.value === value)?.label || value }}</span>
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
      </template>

      <el-date-picker class="txtVal" v-model="nodeValue.value" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" v-if="nodeValue.dataType === 6" :teleported="true" :disabled="isDisabled"></el-date-picker>
      <el-date-picker class="txtVal" v-model="nodeValue.value" type="datetime" placeholder="选择日期时间" value-format="YYYY-MM-DD HH:mm:ss" v-if="nodeValue.dataType === 5" :teleported="true" :disabled="isDisabled"></el-date-picker>
      <!-- <p class="delete" @click.stop="emit('delNodes',id)"><el-icon><Close /></el-icon></p> -->
      <div class="delete" v-if="!isDisabled">
        <i class="iconfont icon-guanbi" @click.stop="emit('delNodes',id)"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRefs, nextTick, watch, computed } from 'vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import { echartsToPx } from '@/utils/utils'
const props = defineProps({
  node: {
    type: Object
  },
  treeList: {
    type: Array
  },
  valueFileds: {
    type: String,
    default: 'id'
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['addNodes', 'delNodes'])
// 数字关系，日期关系
const conditionArrFir = [
  { id: 0, value: 'gt', label: '大于' },
  { id: 1, value: 'ge', label: '大于等于' },
  { id: 2, value: 'eq', label: '等于' },
  { id: 3, value: 'lt', label: '小于' },
  { id: 4, value: 'le', label: '小于等于' },
  { id: 5, value: 'ne', label: '不等于' }
]
// 文字关系
const conditionArrThr = [
  { id: 0, value: 'eq', label: '等于字符' },
  { id: 1, value: 'like', label: '包含字符' },
  { id: 2, value: 'notLike', label: '不包含' }
]

// 下拉关系
const conditionArrSel = [
  { id: 0, value: 'eq', label: '等于字符' },
  { id: 1, value: 'in', label: '包含字符' },
  { id: 2, value: 'notIn', label: '不包含' }
]

// 关系
const relationshipArr = [
  { id: 0, value: 'and', label: '取交集' },
  { id: 1, value: 'or', label: '取并集' },
  { id: 2, value: 'nor', label: '取差集' }
]
const elSelV2 = ref(null)
const searchKeyword = ref('')
const selectList = ref([])
const isMultiple = ref(false)
const virtualScrollingListName = ['门（急）诊诊断-诊断名称', '门（急）诊诊断-疾病编码', '主要诊断-诊断名称', '主要诊断-疾病编码', '其他诊断-诊断名称', '其他诊断-疾病编码', '手术及操作编码', '手术及操作名称', '病种']

let nodeVal = reactive({})
let nodeValue = reactive({})
const id = ref(0)

const { node } = toRefs(props)
id.value = node.value.id
nodeVal = node.value.data
nodeValue = node.value.data?.leafCondition

const filterOptionsVirtual = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return selectList.value.filter(item =>
    item.label.toLowerCase().includes(keyword)
  )
})

onMounted(() => {
  nextTick(() => {
    const SELECTWRAP_DOM = document.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
    SELECTWRAP_DOM?.addEventListener('scroll', handleScroll)
  })
})

const handleScroll = (event) => {
  event.stopPropagation()
  event.preventDefault()
}

const conditionChange = (val, type = true) => {
  if (val) {
    props.treeList.forEach((item) => {
      if (item[props.valueFileds] === val) {
        if (item.codomainType === 4) {
          selectList.value = Array.isArray(item.enumOptionsString) ? item.enumOptionsString : item.enumOptionsString.split(',').map(item => ({ id: item, name: item, value: item, label: item }))
          isMultiple.value = item?.indexSearchType === 'mulSelect'
          nodeValue.valueList = nodeValue?.valueList ? nodeValue.valueList : []
        }

        nodeValue.dataType = item.codomainType
        nodeValue.name = item.name

        nextTick(() => {
          elSelV2.value?.clearSearch()
        })

        if (type) {
          nodeValue.condition = ''
          nodeValue.value = ''
          nodeValue.valueList = []
        }
      }
    })
  }
}

watch(() => nodeVal, (value) => {
  if (value) {
    node.value = value
  }
}, { deep: true })

watch(() => nodeValue, (value) => {
  if (value) {
    node.value.leafCondition = value
  }
}, { deep: true })

watch(() => props.treeList, (value) => {
  if (value.length > 0) {
    nextTick(() => {
      conditionChange(nodeValue?.indexId, false)
    })
  }
}, { deep: true, immediate: true })

</script>

<style lang="scss" scoped>
.main {
  display: flex;
  .type,
  .val {
    display: flex;
    align-items: center;
    .typeAddAll,
    .valAdd {
      width: 28px;
      height: 28px;
      margin: 2px 10px 0 0;
      border-radius: 2px;
      cursor: pointer;
      color: #fff;

      @include childrenCenter;
    }
    .typeAdd {
      background: var(--theme-primary);
    }
    .typeAdds {
      background: #04a273;
    }
    .typeAddss {
      background: #f59f0c;
    }
    .typeSelAll {
      width: 177px;
      height: 30px;
    }
    .typeSel {
      :deep(.el-input__wrapper) {
        background-color: rgba(76, 112, 255, .3);
      }
    }
    .typeSels {
      :deep(.el-input__wrapper) {
        background-color: rgba(37, 199, 203, .3);
      }
    }
    .typeSelss {
      :deep(.el-input__wrapper) {
        background-color: rgba(255, 220, 43, .3);
      }
    }
  }
  .val {
    .valAdd {
      background: #193e77;
    }
    :where(.valSel,.txtVal) {
      width: 177px;
      height: 30px;
      margin-right: 10px;
    }

    .delete {
      width: 14px;
      height: 14px;
      border: 1px solid #999;
      border-radius: 50%;
      cursor: pointer;
      color: var(--theme-text-3);

      @include childrenCenter;
      i {
        font-size: 12px;
      }
    }
  }
  :deep(.el-date-editor) {
    margin-right: 10px;
  }
  :deep(.el-input__icon) {
    line-height: 30px;
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
