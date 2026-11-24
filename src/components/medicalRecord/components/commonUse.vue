<template>
  <div class="content-medicalRecord">
    <el-dialog
      :model-value="true"
      destroy-on-close
      title="常用筛选项"
      width="680px"
      class="dialogDIV"
      @close="emits('close')"
    >
      <CommonInput
        v-model="filterText"
        placeholder="搜索名称"
        class="search"
        clearable
      />
      <div class="commonUserContainer">
        <div class="radioContainer rgpaContainer" >
          <el-scrollbar style="height: 100%;">
            <el-radio-group v-model="radioValue" @change="handleChange">
              <el-radio v-for="item in options" :key="item.id" :value="item.id">
                <span >{{ item.filterName }}</span>
                <echoSearchItems class="MT" v-if="queryWay === 1&& radioValue === item.id" :key="item.id" :searchItems="searchItems" :values="values">
                </echoSearchItems>
                <rgpa ref="rgpaRef" class="rgpa" isDisabled :menuList="treeSelectList" valueFileds="name" :isFullShow="false" v-if="queryWay === 2 && filterTree !== '{}' && radioValue === item.id && props.isCaseBase"></rgpa>
                <rgpa ref="rgpaRef" class="rgpa" isDisabled :studyCohort="props.studyCohort" :isFullShow="false" v-if="queryWay === 2 && filterTree !== '{}' && radioValue === item.id && !props.isCaseBase"></rgpa>
              </el-radio>
            </el-radio-group>
          </el-scrollbar>
        </div>
        <!-- <div class="content" v-if="queryWay === 1">
          <el-scrollbar style="height: 100%;">
            <echoSearchItems :searchItems="searchItems" :values="values">
            </echoSearchItems>
          </el-scrollbar>
        </div> -->
      </div>
      <template #footer>
        <div class="footer">
          <el-button @click="handelDel">删 除</el-button>
          <el-button type="primary" @click="handelSure">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="addConditions">
import { onMounted, ref, watch, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import lodash from 'lodash'
import { getCommonUse, delCommonUse } from '@/api/api_homePage.js'
import echoSearchItems from '@/components/medicalRecord/components/echoSearchItems.vue'
import rgpa from '@/components/medicalRecord/components/rgpa.vue'
import { useTree } from '@/hooks/treeData.js'
const { initTreeData2 } = useTree(true, true)
const emits = defineEmits(['close', 'handelSure', 'restorationTree'])
const props = defineProps({
  queryWay: {
    type: Number,
    default: 1
  },
  studyCohort: {
    type: String,
    default: ''
  },
  filterNamePa: {
    type: String,
    default: ''
  },
  treeSource: {
    type: Array,
    default: () => {
      return []
    }
  },
  isCaseBase: {
    type: Boolean,
    default: false
  }
})

const rgpaRef = ref(null) // rgpa组件
const filterText = ref('')
const radioValue = ref('')
const initOptions = ref([
  {
    filterName: '无',
    id: ''
  }
])
const options = ref([])
const searchItems = ref([])
const values = ref({})
const filterName = ref('无')
onMounted(() => {
  options.value = initOptions.value
  handelGetCommonUse()
})
watch(filterText, (val) => {
  if (!val) {
    options.value = initOptions.value
  } else {
    options.value = lodash.filter(initOptions.value, (n) => {
      return n.filterName.includes(val)
    })
  }
})
const flattenTree = (tree) => {
  return tree.reduce((acc, node) => {
    acc.push({ ...node, name: node.label })
    if (node.children) {
      acc.push(...flattenTree(node.children)) // 使用递归处理子节点
    }
    return acc
  }, [])
}

const treeSelectList = computed(() => {
  const collectedItems = initTreeData2.reduce((acc, item) => {
    if (item.codomainType !== undefined) {
      acc.push({ label: item.label, name: item.label, indexSearchType: item.type, codomainType: item.codomainType, id: item.id, enumOptionsString: item.EnumValues })
    }
    if (item.children && item.children.length > 0) {
      return acc.concat((function collect(items) {
        return items.reduce((accInner, itemInner) => {
          if (itemInner.codomainType !== undefined) {
            accInner.push({ label: itemInner.label, name: itemInner.label, indexSearchType: itemInner.type, codomainType: itemInner.codomainType, id: itemInner.id, enumOptionsString: itemInner.EnumValues })
          }
          if (itemInner.children && itemInner.children.length > 0) {
            return accInner.concat(collect(itemInner.children))
          }
          return accInner
        }, [])
      })(item.children))
    }
    return acc
  }, [])

  return collectedItems
})

const collectLeafConditions = (node) => {
  let conditions = []
  if (node.leafCondition && node.leafCondition?.name) {
    conditions.push(node.leafCondition)
  } else if (node.childNodeList && node.childNodeList.length > 0) {
    node.childNodeList.forEach(childNode => {
      conditions = conditions.concat(collectLeafConditions(childNode))
    })
  }
  return conditions
}

const handelSure = () => {
  if (radioValue.value) {
    // 常规查询
    const arr = flattenTree(props.treeSource)
    if (props.queryWay === 1) {
      let flag = true
      // 对已保存的查询条件进行检验,如果指标名称,类型,枚举值任一发生变化,该查询项不可用
      for (let i = 0; i < searchItems.value.length; i++) {
        const item = searchItems.value[i]
        if (!item.init) {
          const index = lodash.findIndex(arr, { soleID: item.soleID })
          if (index > 0) {
            const obj = arr[index]
            if (props.isCaseBase) {
              if (item.type === obj.type && item.label === obj.label && item.EnumValues?.toString() === obj.EnumValues?.toString()) {
                console.log('通过')
              } else {
                flag = false
                break
              }
            } else {
              if (item.indexSearchType === obj.indexSearchType && item.name === obj.name && item.enumOptionsString === obj.enumOptionsString) {
                console.log('通过')
              } else {
                flag = false
                break
              }
            }
          } else {
            flag = false
            break
          }
        }
      }
      if (flag) {
        emits('handelSure', {
          searchItems: searchItems.value,
          values: values.value,
          filterName: filterName.value
        })
      } else {
        ElMessage.warning('该查询条件已更改，请重新录入条件')
      }
    } else {
      const treeData = JSON.parse(filterTree.value)
      const treeFiledList = collectLeafConditions(treeData)
      const filedList = arr.filter(item => item?.codomainType)
      const flag = treeFiledList.every(item => filedList.find(it => it.name === item.name && it.codomainType === item.dataType))
      if (flag) {
        emits('restorationTree', JSON.parse(filterTree.value), filterName.value)
      } else {
        ElMessage.warning('该查询条件已更改，请重新录入条件')
      }
    }
  } else {
    if (props.queryWay === 1) {
      emits('handelSure', {
        init: true
      })
    } else {
      emits('reset')
    }
  }
}

const filterTree = computed(() => {
  return (
    options.value.find((it) => it.id === radioValue.value)?.filterItemContent ||
    '{}'
  )
})

const treeList = computed(() => {
  const arr = JSON.parse(filterTree.value)
  return arr
})

watch(() => radioValue.value, () => {
  setTimeout(() => {
    nextTick(() => {
      Array.isArray(rgpaRef.value) ? rgpaRef.value[0]?.reduction(treeList.value) : rgpaRef.value?.reduction(treeList.value)
    })
  }, 50)
})

const handelDel = () => {
  if (!radioValue.value) {
    return
  }
  ElMessageBox.confirm('确定删除该常用筛选项?', '删除', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    delCommonUse({ id: radioValue.value }).then((res) => {
      if (res.code === 10000) {
        ElMessage({
          type: 'success',
          message: '已删除'
        })
        lodash.remove(options.value, (n) => {
          return n.id === radioValue.value
        })
        radioValue.value = ''
        searchItems.value = []
        if (props.queryWay === 1) {
          emits('handelSure', {
            init: true
          })
        } else {
          emits('reset')
        }
      }
    })
  })
}
const handelGetCommonUse = () => {
  const params = {
    type: props.isCaseBase ? (props.queryWay === 1 ? 6 : 7) : props.queryWay,
    queueId: props.studyCohort
  }
  getCommonUse(params).then((res) => {
    if (res.code === 10000) {
      options.value = initOptions.value.concat(res.data)
      options.value.forEach(item => {
        if (item.filterName === props.filterNamePa) {
          radioValue.value = item.id
          filterName.value = item.filterName
          handleChange(radioValue.value)
        }
      })
      initOptions.value = JSON.parse(JSON.stringify(options.value))
    }
  })
}
const handleChange = (val) => {
  if (radioValue.value) {
    const arr = lodash.filter(options.value, { id: val })
    const obj = arr.length ? arr[0] : {}
    let searchObj = {}
    try {
      searchObj = JSON.parse(obj.filterItemContent)
    } catch (error) {

    }
    searchItems.value = searchObj.search
    values.value = searchObj.value
    filterName.value = obj.filterName
  } else {
    filterName.value = ''
    searchItems.value = []
  }
}
</script>
<style lang="scss" scoped>
.content-medicalRecord {
  :deep(.dialogDIV) {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    height: 60vh;
    .el-dialog__header {
      display: v-bind(headerIsShow);
    }
    .el-dialog__body {
      display: flex;
      flex-direction: column;
      padding: 0 26px 16px 26px !important;
    }
  }
  .treeContainer {
    flex: 1;
    // overflow-y: auto;
  }
  .footer {
    display: flex;
    align-items: center;
  }
  .btn {
    width: 65px;
    height: 32px;
    border: 1px solid #d8d8d8;
    border-radius: 2px;
    opacity: 1;
    cursor: pointer;
    line-height: 32px;
    text-align: center;
    font-size: 14px;
    &.sure {
      margin-left: 12px;
      border-color: var(--theme-primary);
      border-radius: 2px;
      background: var(--theme-primary);
      font-weight: 500;
      color: #fff;
    }
    &.cancel {
      color: var(--theme-text-2);
    }
  }
}
.commonUserContainer {
  display: flex;
  overflow: hidden;
  flex: 1;
  box-sizing: border-box;
  height: 100%;
  padding-top: 12px;
  .radioContainer {
    overflow: hidden;
    flex: 1;
    height: 100%;
    .MT {
      margin-top: 8px;
    }
    :deep(.el-radio-group) {
      .el-radio {
        width: 100%;
        margin-right: 0;
      }
    }
    :deep(.rgpa) {
      height: 290px !important;
      margin: 8px 0;
      .relation-graph {
        border-radius: 4px;
      }
    }
  }
  .content {
    display: flex;
    overflow-y: auto;
    flex-wrap: wrap;
    align-content: flex-start;
    flex: 1;
    height: 100%;
    .searchItem {
      display: flex;
      align-items: center;
      width: auto;
      height: 20px;
      margin-right: 4px;
      margin-bottom: 4px;
      padding: 4px 6px;
      border-radius: 6px 6px 6px 6px;
      background: #cbcfdc;
      opacity: 0.3;
    }
    &.tree {
      overflow: hidden;
      height: 300px;
    }
  }
  .rgpaContainer {
    .el-radio-group {
      width: 100%;
      :deep(.el-radio) {
        height: auto;
        min-height: 32px;
        .el-radio__label {
          width: 100%;
          >span {
            display: inline-block;
            margin: 8px 0;
          }
        }
        &.is-checked {
          align-items: self-start;
          .el-radio__input {
            margin-top: 10px;
          }
        }
      }
    }
  }
}
:deep(.content .noneText) {
  padding-bottom: 0;
  line-height: 32px;
}
:deep(.el-scrollbar__bar) {
  z-index: 999;
}
</style>
