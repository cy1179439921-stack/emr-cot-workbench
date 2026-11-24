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
            <span class="label">文件名称: </span>
            <span class="value tag" v-if="curEditRow?.fileName">{{curEditRow?.fileName}}</span>
          </li>
          <li>
            <span class="label">导出日期: </span>
            <span class="value">{{convertTimestampToDate(curEditRow?.createTime,true)}}</span>
          </li>
          <li class="mt-32 flex">
            <span class="label">查询条件: </span>
            <div>
              <div class="value br">
                <span v-if="listHandler?.medicalRecordId">{{'就诊ID' + '：' + listHandler?.medicalRecordId }}</span>
                <span v-if="listHandler?.visitNumber">{{'住院号' + '：' + listHandler?.visitNumber }}</span>
                <span v-if="listHandler?.patientName">{{'患者姓名' + '：' + listHandler?.patientName}}</span>
                <span v-if="(listHandler?.healingTypeList || []).length >0">{{'治疗类型' + '：' + transfromEnumsLable(diseaseGroupOptions,listHandler?.healingTypeList)}}</span>
                <span v-if="(listHandler?.exitHospitalDateList || []).length >0">{{'出院日期' + '：' + transformParams(listHandler?.exitHospitalDateList,listHandler?.exitType)}}</span>
                <span v-if="(listHandler?.createTimeList || []).length >0">{{'录入时间' + '：' + transformParams(listHandler?.createTimeList,listHandler?.createType)}}</span>
                <span v-if="(listHandler?.indexRecognitionStatusList || []).length >0">{{'识别状态' + '：' + transfromEnumsLable(statusOptions,listHandler?.indexRecognitionStatusList)}}</span>
                <span v-if="(listHandler?.checkStatus || []).length >0">{{'校对状态' + '：' + transfromEnumsLable(checkStatus,listHandler?.checkStatus)}}</span>
              </div>
              <el-button type="primary" link @click="searchDath">使用此查询条件</el-button>
            </div>
          </li>
        </ul>
      </section>
    </div>
    <span class="dialog-footer">
      <i></i>
      <!-- <span @click="handleClose('delete')" class="del">删除</span> -->
      <el-button type="primary" @click="handleClose('download')" :disabled="curEditRow.bizStatus !== 2" v-if="curEditRow.bizStatus !== 0">下 载</el-button>
      <el-button type="primary" @click="handleClose('retry')" v-else>重 试</el-button>
    </span>
  </div>
</template>
<script setup>
import { reactive, ref, computed } from 'vue'
import { convertTimestampToDate } from '@/utils/utils'
const checkStatus = [{ id: '0', name: '异常' }, { id: '1', name: '正常' }]
const statusOptions = ref([
  {
    id: 200,
    name: '已完成',
    className: 'tag1'
  },
  {
    id: 100,
    name: '识别中',
    className: 'tag2'
  },
  {
    id: -100,
    name: '识别失败',
    className: 'tag3'
  },
  {
    id: 0,
    name: '未上传',
    className: 'tag5'
  },
  {
    id: 10,
    name: '等待识别',
    className: 'tag4'
  }
])
const props = defineProps({
  curEditRow: Object,
  type: {
    type: Number,
    default: 1
  },
  diseaseGroupOptions: {
    type: Array,
    default: () => ([])
  }
})

const listHandler = computed(() => {
  return curEditRow?.showFilterContent ? JSON.parse(curEditRow?.showFilterContent) : {}
})

const curEditRow = reactive(props.curEditRow)

const emit = defineEmits(['handle-close', 'handler', 'close', 'echo'])

const handleClose = (type) => {
  if (!(type === 'download' && curEditRow.bizStatus !== 2)) {
    emit('handler', type, curEditRow)
  }
}

const searchDath = () => {
  emit('echo', {
    ...listHandler.value
  })
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

const transformParams = (time, type) => {
  console.log(time, type)
  if (Array.isArray(time) && time.length > 0) {
    const startTimestamp = time[0]
    const endTimestamp = time[1]
    if (type === 'yearrange') {
      return `${startTimestamp}至${endTimestamp}`
    }
    if (type === 'monthrange') {
      return `${startTimestamp}至${handleTime(new Date(endTimestamp))}`
    }
    if (type === 'daterange') {
      return `${startTimestamp}至${endTimestamp}`
    }
  } else {
    return ''
  }
}

const handleTime = (date) => {
  const yearOld = date.getFullYear()
  const monthOld = date.getMonth() + 1 // getMonth()返回0-11，因此需要加1
  const lastDay = new Date(yearOld, monthOld, 0) // 设置日期为下个月的第0天，即当前月的最后一天
  const year = lastDay.getFullYear()
  const month = String(lastDay.getMonth() + 1).padStart(2, '0') // 补全两位数月份
  const day = String(lastDay.getDate()).padStart(2, '0') // 补全两位数日期
  return `${year}-${month}-${day}`
}

</script>
  <style scoped lang="scss">
.addIP-dialogDIV {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: var(--theme-card);
  .main {
    flex: 1;
    .content {
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
            &:empty::after {
              padding: 2px 0 6px 0;
              cursor: pointer;
              font-weight: 400;
              font-size: 14px;
              content: '无';
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
            }
            :deep(.content) {
              margin-left: 0;
            }
          }
          :deep(.el-button) {
            justify-content: flex-start;
            width: 100px;
            padding-left: 0 !important;
            span {
              text-decoration: underline;
              text-underline-offset: 4px;
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
    .icon-zuo {
      font-size: 24px;
    }
  }
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 24px;
  }
}
.del {
  color: #f76868 !important;
}
</style>

