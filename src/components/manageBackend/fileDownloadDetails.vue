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
            <span class="value">{{ currentRow.fileName }}</span>
          </li>
          <li>
            <span class="label">导出时间: </span>
            <span class="value">{{convertTimestampToDate(currentRow.createTime,true)}}</span>
          </li>
          <li>
            <span class="label">导出状态: </span>
            <div class="value" v-if="Number(currentRow.recordNum)>100">联系管理员下载</div>
            <span class="value tag" v-else :class="'status' + currentRow.bizStatus">{{statusList[currentRow.bizStatus]}}</span>
          </li>
          <li class="mt-32 flex">
            <span class="label">查询条件: </span>
            <div class="value br">
              <span v-if="listHandler?.fileId">{{'文件ID' + '：' + listHandler?.fileId }}</span>
              <span v-if="listHandler?.fileName">{{'文件名' + '：' + listHandler?.fileName }}</span>
              <span v-if="listHandler?.hospital?.length">{{'所属医院' + '：' + transfromEnumsLable(hospitalGroupOptions,listHandler?.hospital)}}</span>
              <span v-if="(listHandler?.enterHospitalDate || []).length >0">{{'入库时间' + '：' + transformParams(listHandler?.enterHospitalDate)}}</span>
              <span v-if="(listHandler?.diseaseType || []).length >0">{{'病种' + '：' + transfromEnumsLable(diseaseGroupOptions,listHandler?.diseaseType)}}</span>
              <div class="oprationContainer">
                <el-button type="primary" link @click="searchDath">使用此查询条件</el-button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
    <span class="dialog-footer">
      <el-button @click="handleClose('delete')">删 除</el-button>
      <el-button type="primary" @click="handleClose('download')" :disabled="currentRow.bizStatus !== 2||!currentRow.bizStatus === 3" v-if="currentRow.bizStatus !== 0&&Number(currentRow.recordNum)<100">下 载</el-button>
      <el-button type="primary" @click="handleClose('retry')" v-if="currentRow.bizStatus === 0">重 试</el-button>
    </span>
  </div>
</template>
<script setup>
import { reactive, onMounted, ref } from 'vue'
import { convertTimestampToDate } from '@/utils/utils'
// eslint-disable-next-line no-unused-vars
import { ElMessage } from 'element-plus'
const props = defineProps({
  currentRow: Object,
  treeSource: {
    type: Array,
    default: () => {
      return []
    }
  },
  hospitalGroupOptions: {
    type: Array,
    default: () => {
      return []
    }
  },
  diseaseGroupOptions: {
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
const currentRow = reactive(props.currentRow)
const emit = defineEmits(['handle-close', 'handler', 'close', 'echo'])

const handleClose = (type) => {
  emit('handler', type, currentRow)
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
    ...listHandler.value
  })
}
const listHandler = ref({})
try {
  listHandler.value = JSON.parse(props.currentRow?.showFilterContent).value
} catch (error) {

}
const transformParams = (time) => {
  if (Array.isArray(time) && time.length > 0) {
    const startTimestamp = time[0]
    const endTimestamp = time[1]
    return `${startTimestamp}至${endTimestamp}`
  } else {
    return ''
  }
}
const transfromEnumsLable = (enums, values) => {
  if (values) {
    const valuesList = Array.isArray(values) ? values : values.split(',')
    return valuesList.map(value => getLable(enums, value)).join(',')
  } else {
    return ''
  }
  function getLable(enums, value) {
    return enums.find(item => item.id === value)?.name || ''
  }
}

onMounted(() => {
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
              width: auto;
              min-height: 18px;
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
            // flex-direction: column;
            .oprationContainer {
              width: 100%;
            }
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
// .value {
//   display: flex;
//   flex-wrap: wrap;
//   flex: 1;
//   width: auto;
//   min-height: 20px;
//   span {
//     height: 18px;
//     margin-right: 10px;
//     margin-bottom: 10px;
//     padding: 3px 6px;
//     border-radius: 2px;
//     background: var(--theme-fill);
//     color: var(--theme-text-2);
//   }
//   :deep(.content) {
//     margin-left: 0;
//   }
// }
  </style>

