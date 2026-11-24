<template>
  <div class="addIP-dialogDIV">
    <div class="main">
      <el-page-header :icon="null">
        <template #content>
          <span class="text-large">历史导出记录详情</span>
        </template>
        <template #title>
          <el-button type="primary" link @click="emit('handle-close')">
            <i class="iconfont icon-zuo"></i>
            返回
          </el-button>
        </template>
        <template #extra >
          <el-icon @click="emit('close')" color="#959595" class="no-inherit"><Close /></el-icon>
        </template>
      </el-page-header>
      <section class="content">
        <div class="section-title">
          <div class="line"></div>
          <div class="text">基础信息</div>
        </div>
        <ul>
          <li>
            <span class="label">文件名: </span>
            <span class="value">{{ curEditRow.fileName }}</span>
          </li>
          <li>
            <span class="label">导出时间: </span>
            <span class="value">{{convertTimestampToDate(curEditRow.createTime,true)}}</span>
          </li>
          <li v-if="curEditRow.queueId">
            <span class="label">研究队列: </span>
            <span class="value">{{curEditRow.queueName}}</span>
          </li>
          <li>
            <span class="label">导出状态: </span>
            <span class="value tag" :class="'status' + curEditRow.bizStatus">{{statusList[curEditRow.bizStatus]}}</span>
          </li>
          <li class="mt-32 flex">
            <span class="label">查询条件: </span>
            <div class="value br">
              <div v-if="isTree" class="rgpa">
                <!-- <span class="table" v-for="item in list" :key="item">{{item?.name + '：' + item.indexName + '：' + item.value}}</span> -->
                <!-- <rgpa ref="rgpaRef" :studyCohort="props.studyCohort" isDisabled :isFullShow="false"></rgpa> -->
                <rgpa ref="rgpaRef" class="rgpa" isDisabled :menuList="treeSelectList" valueFileds="name" :isFullShow="false" v-if="props.isMedicalRecord"></rgpa>
                <rgpa ref="rgpaRef" class="rgpa" isDisabled :studyCohort="props.studyCohort" :isFullShow="false" v-if="!props.isMedicalRecord"></rgpa>
              </div>
              <echoSearchItems :searchItems="searchItems" :values="values || {}" v-if="!isTree"></echoSearchItems>
              <!-- <span class="null" v-if="!curEditRow.showFilterContent">无</span> -->
              <el-button type="primary" link @click="searchDath">使用此查询条件</el-button>
            </div>
          </li>

          <template v-if="type === 1">
            <div class="section-title">
              <div class="line"></div>
              <div class="text">导出病历类型</div>
            </div>
            <li class="mt-32 flex">
              <span class="label">{{curEditRow.type === 1 ? '住院病历: ':'指标详情: '}} </span>
              <template v-if="curEditRow?.inHospitalMedicalRecordHeadNameList && typeof(curEditRow?.inHospitalMedicalRecordHeadNameList)=='string'">
                <div class="value empty" v-if="!JSON.parse(curEditRow.inHospitalMedicalRecordHeadNameList)?.length">无</div>
                <template v-else>
                  <div class="value"><span v-for="items in JSON.parse(curEditRow.inHospitalMedicalRecordHeadNameList)" :key="items">{{items}}</span></div>
                </template>

              </template>
            </li>
            <li class="mt-32 flex">
              <span class="label">门急诊病历: </span>
              <template v-if="curEditRow?.outPatientMedicalRecordHeadNameList && typeof(curEditRow?.outPatientMedicalRecordHeadNameList)=='string'">
                <div class="value empty" v-if="!JSON.parse(curEditRow.outPatientMedicalRecordHeadNameList)?.length">无</div>
                <template v-else>
                  <div class="value"><span v-for="items in JSON.parse(curEditRow.outPatientMedicalRecordHeadNameList)" :key="items">{{items}}</span></div>
                </template>
              </template>
            </li>
            <li class="mt-32 flex">
              <span class="label">体检报告: </span>
              <template v-if="curEditRow?.physicalMedicalRecordHeadNameList && typeof(curEditRow?.physicalMedicalRecordHeadNameList)=='string'">
                <div class="value empty" v-if="!JSON.parse(curEditRow.physicalMedicalRecordHeadNameList)?.length">无</div>
                <template v-else>
                  <div class="value"><span v-for="items in JSON.parse(curEditRow.physicalMedicalRecordHeadNameList)" :key="items">{{items}}</span></div>
                </template>
              </template>
            </li>
          </template>
        </ul>
      </section>
    </div>
    <span class="dialog-footer">
      <el-button @click="handleClose('delete')">删 除</el-button>
      <el-button type="primary" @click="handleClose('download')" :disabled="curEditRow.bizStatus !== 2||!curEditRow.bizStatus === 3" v-if="curEditRow.bizStatus !== 0">下 载</el-button>
      <el-button type="primary" @click="handleClose('retry')" v-else>重 试</el-button>    </span>
  </div>
</template>
<script setup>
import { reactive, ref, onMounted, nextTick, computed } from 'vue'
import { convertTimestampToDate } from '@/utils/utils'
// eslint-disable-next-line no-unused-vars
import { ElMessage } from 'element-plus'
import lodash from 'lodash'
import echoSearchItems from '@/components/medicalRecord/components/echoSearchItems.vue'
import rgpa from '@/components/medicalRecord/components/rgpa.vue'
import { useTree } from '@/hooks/treeData.js'
const { initTreeData2 } = useTree(true, true)
const props = defineProps({
  curEditRow: Object,
  type: {
    type: Number,
    default: 1
  },
  studyCohort: {
    type: String,
    default: '0'
  },
  isMedicalRecord: {
    type: Boolean,
    default: true
  },
  treeSource: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const statusList = {
  0: '导出失败',
  1: '导出中',
  2: '已完成',
  3: '已过期'
}
const curEditRow = reactive(props.curEditRow)
const list = ref([])
const isTree = ref(false)
const searchItems = ref([])
const values = ref({})
const rgpaRef = ref(null) // rgpa组件

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

const emit = defineEmits(['handle-close', 'handler', 'close', 'echo'])

const handleClose = (type) => {
  emit('handler', type, curEditRow)
}

const jsonTree = (treeData) => {
  const nodes = []
  function handlerData (data) {
    if (data.nodeType === 1) {
      nodes.push(data.leafCondition)
    }
    nodes.push({ id: String(data.id), data })
    if (Array.isArray(data?.childNodeList) && data?.childNodeList.length > 0) {
      data.childNodeList.forEach(element => {
        handlerData(element)
      })
    }
  }
  handlerData(treeData)
  return nodes.filter(it => !it.data)
}
// eslint-disable-next-line no-unused-vars
const flattenTree = (tree) => {
  return tree.reduce((acc, node) => {
    acc.push({ ...node, name: node.label })
    if (node.children) {
      acc.push(...flattenTree(node.children)) // 使用递归处理子节点
    }
    return acc
  }, [])
}
const searchDath = () => {
  emit('echo', {
    treeValue: JSON.parse(JSON.stringify(treeData.value)),
    isTree: isTree.value,
    ...curEditRow
  })
  // if (isTree.value) {
  //   emit('echo', {
  //     treeValue: JSON.parse(JSON.stringify(treeData.value)),
  //     isTree: isTree.value,
  //     ...curEditRow
  //   })
  // } else {
  //   const arr = flattenTree(props.treeSource)
  //   console.log('props.treeSource', arr, searchItems.value)
  //   let flag = true
  //   // 对已保存的查询条件进行检验,如果指标名称,类型,枚举值任一发生变化,该查询项不可用
  //   for (let i = 0; i < searchItems.value; i++) {
  //     const item = searchItems.value[i]
  //     const index = lodash.findIndex(arr, { soleID: item.soleID })

  //     if (index > 0) {
  //       const obj = arr[index]
  //       if (props.isMedicalRecord || item.init) {
  //         if (item.type === obj.type && item.label === obj.label && item.EnumValues?.toString() === obj.EnumValues?.toString()) {
  //           console.log('通过')
  //         } else {
  //           flag = false
  //           break
  //         }
  //       } else {
  //         if (item.indexSearchType === obj.indexSearchType && item.name === obj.name && item.enumOptionsString === obj.enumOptionsString) {
  //           console.log('通过')
  //         } else {
  //           flag = false
  //           break
  //         }
  //       }
  //     } else {
  //       flag = false
  //       break
  //     }
  //   }
  //   if (flag) {
  //     emit('echo', {
  //       treeValue: JSON.parse(JSON.stringify(treeData.value)),
  //       isTree: isTree.value,
  //       ...curEditRow
  //     })
  //   } else {
  //     ElMessage.warning('该查询条件已更改，请重新录入条件')
  //   }
  // }
}

const handleChange = (val) => {
  nextTick(() => {
    searchItems.value = val.search
    values.value = val.value
  })
}
const treeData = ref(null)

// const relationshipArr = [
//   { id: 0, value: 'and', label: '取交集' },
//   { id: 1, value: 'or', label: '取并集' },
//   { id: 2, value: 'nor', label: '取差集' }
// ]
try {
  treeData.value = curEditRow.showFilterContent && JSON.parse(curEditRow.showFilterContent)
  if (treeData.value) {
    if ([0, 1].includes(lodash.get(treeData.value, 'nodeType', false))) {
      list.value = jsonTree(treeData.value)
      isTree.value = true
    }
    if (lodash.get(treeData.value, 'search', false) || lodash.get(treeData.value, 'value', false)) {
      isTree.value = false
      handleChange(treeData.value)
    }
  }
} catch (error) {
  console.log(error)
}

onMounted(() => {
  nextTick(() => {
    if (treeData.value && isTree.value) {
      rgpaRef.value?.reduction(curEditRow.showFilterContent && JSON.parse(curEditRow.showFilterContent))
    }
  })
})

</script>
  <style scoped lang="scss">
.addIP-dialogDIV {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: var(--theme-card);
  .main {
    flex: 1;
    .icon-zuo {
      font-size: 24px;
    }
    .content {
      overflow-y: auto;
      height: 430px;

      @include scrollBarStyle;
      .section-title {
        display: flex;
        align-items: center;
        height: 20px;
        margin-top: 16px;
        margin-bottom: -4px;
        line-height: 20px;
        font-weight: 500;
        color: var(--theme-text);
        .line {
          width: 2px;
          height: 15px;
          margin-right: 6px;
          background-color: var(--theme-primary);
        }
        .text {
          font-weight: 500;
          font-size: 16px;
        }
        &:nth-child(1) {
          margin-top: 0;
        }
      }
      ul {
        li {
          display: flex;
          align-items: center;
          margin-top: 16px;
          .label {
            width: 84px;
            height: 20px;
            margin-right: 12px;
            line-height: 20px;
            text-align: right;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text);
          }
          .value {
            margin-right: 12px;
            cursor: pointer;
            line-height: 20px;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text-2);
            .table {
              display: inline-block;
            }
            .rgpa {
              height: 300px;
            }
          }
          .tag {
            padding: 2px 10px;
            border-radius: 2px;
            // background: #e6f4ef;
            // color: #04a273;
            &.status0 {
              background: rgba(255, 78, 78, 0.1);
              color: #ff4e4e;
            }
            &.status1 {
              background: rgba(54, 112, 248, 0.05);
              color: var(--theme-primary);
            }
            &.status2 {
              background: #e6f4ef;
              color: #04a273;
            }
            &.status3 {
              color: #f59f0c;
            }
          }
        }
        .flex {
          display: flex;
          align-items: flex-start;
          >.label,
          .empty {
            line-height: 24px;
          }
          .value {
            display: flex;
            flex-wrap: wrap;
            flex: 1;
            width: auto;
            min-height: 20px;
            span {
              height: 18px;
              margin-right: 10px;
              margin-bottom: 10px;
              padding: 3px 6px;
              border-radius: 2px;
              background: var(--theme-fill);
              color: var(--theme-text-2);
              &.null {
                padding-left: 0;
                background-color: transparent;
              }
            }
            :deep(.content) {
              margin-left: 0;
            }
          }
          :deep(.br) {
            flex-direction: column;
            .el-button {
              justify-content: flex-start;
              width: 100px;
              padding: 0 !important;
              span {
                text-decoration: underline;
                text-underline-offset: 4px;
              }
            }
          }
        }
        .mt-32:not(.empty) +li {
          margin-top: 6px;
        }
      }
    }
  }
  .el-page-header {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 24px 0 16px -12px;
    :deep(.el-page-header__header) {
      width: 100%;
      line-height: unset;
    }
    .no-inherit {
      padding-right: 2px;
      cursor: pointer;
      font-size: 14px;
    }
    :deep(.el-page-header__content) {
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
    :deep(.el-page-header__extra) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .el-icon {
        margin-right: -14px;
        font-family: "iconfont" !important;
        font-style: normal;
        font-size: 14px;
        color: var(--theme-text-3);
        &::before {
          content: "\e666";
        }
        svg {
          display: none;
        }
      }
    }
    :deep(.el-page-header__title) {
      span {
        font-size: 16px;
        color: var(--theme-primary);
      }
    }
    :deep(.el-divider--vertical) {
      margin-left: 12px;
    }
  }
  .dialog-footer {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    span {
      width: 120px;
      border: 1px solid #d9d9d9;
      border-radius: 14px 14px 14px 14px;
      cursor: pointer;
      line-height: 28px;
      text-align: center;
      font-weight: 400;
      font-size: 12px;
      color: #646464;
    }
  }
}
  </style>

