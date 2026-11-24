<template>
  <div class="operation-records">
    <header class="header">
      <div class="title">操作记录</div>
      <div class="closeBtn" @click="handleClose"><i class="iconfont icon-guanbi1"></i></div>
    </header>
    <div class="mainContent">
      <el-scrollbar style="height: 100%;" ref="scrollbarRef" v-if="groupedData.length > 0">
        <el-collapse v-model="activeNames">
          <el-collapse-item v-for="(group, gIndex) in groupedData" :key="gIndex" :name="group.date">
            <template #title>
              <div class="collapseTitle">{{ group.date }}</div>
            </template>
            <div v-for="(item, index) in group.children" :key="index" class="recordItem" @click="handleClick(item)">
              <div class="groupName"><span>{{ item.groupName }}</span></div>
              <div class="time">{{ formatDateTime(item.createTime) }}</div>
              <div class="content">{{ item.logContent }}</div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
      <div class="loadingDiv" v-else>
        <emptyContent :loading="loading"/>
      </div>
    </div>
    <div class="tabel_pagination" v-if="groupedData.length > 0">
      <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-sizes="[100, 200, 300, 400]" :page-size="limit" :total="total">
        <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
      </el-pagination>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'OperationRecords',
  inheritAttrs: false
})
import { ref, computed, watch, nextTick } from 'vue'
import { getOperationRecords } from '@/api/api_proofread'
import { formatDateTime, formatDate } from '@/utils/utils'
import emptyContent from '@/components/medicalRecord/standardizedMedical/emptyContent.vue'
const props = defineProps({
  medicalRecordId: {
    type: String,
    default: ''
  },
  curMedicalInfo: {
    type: Object
  }
})
const emits = defineEmits(['handleOperationClick'])
const currentPage = ref(1)
const limit = ref(200)
const total = ref(0)
const list = ref([])
const activeNames = ref([])
const scrollbarRef = ref(null)
const getListData = async () => {
  const params = {
    recordId: props.medicalRecordId,
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  const { code, data } = await getOperationRecords(params)
  if (code === 10000) {
    list.value = data.items
    total.value = data.total
    // el-scrollbar要滚动到最顶部
    nextTick(() => {
      if (scrollbarRef.value) {
        scrollbarRef.value.setScrollTop(0)
      }
    })
    emits('handleOperationClick', {
      groupName: props.curMedicalInfo.title
    })
  }
}
const init = () => {
  getListData()
}
init()

// 按日期分组数据
const groupedData = computed(() => {
  const groups = {}
  list.value.forEach(item => {
    const date = formatDate(new Date(item.createTime))
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  // 转换为数组并按日期倒序
  return Object.entries(groups)
    .map(([date, children]) => ({ date, children }))
    .sort((a, b) => b.date.localeCompare(a.date))
})

// 监听数据变化，默认展开第一个
watch(groupedData, (newVal) => {
  if (newVal.length > 0) {
    activeNames.value = [newVal[0].date]
  }
}, { immediate: true })
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getListData()
}
// 更改每页条数
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getListData()
}
// 点击定位
const handleClick = (item) => {
  emits('handleOperationClick', item)
}
// 关闭
const handleClose = () => {
  emits('handleOperationClick', null)
}
</script>
<style scoped lang="scss">
.operation-records {
  display: flex;
  flex-direction: column;
  width: 500px;
  height: 100%;
  margin-left: 16px;
  border-radius: 8px;
  background-color: var(--theme-card);
  // background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    height: 48px;
    padding: 0 16px;
    .title {
      font-weight: 600;
      font-size: 18px;
      color: var(--theme-text);
    }
    .closeBtn {
      padding: 3px;
      cursor: pointer;
    }
  }
  .mainContent {
    display: flex;
    flex: 1;
    height: 0;
    padding: 0 0 16px 16px;
    .loadingDiv {
      flex: 1;
    }
    .el-scrollbar {
      width: 100%;
      padding-right: 16px;

      :deep(.el-collapse) {
        border: none;

        .el-collapse-item {
          overflow: hidden;
          margin-bottom: 20px;
          border-radius: 12px;
          background: var(--theme-card);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
          }

          .el-collapse-item__header {
            height: auto;
            padding: 14px 18px;
            border: none;
            background: linear-gradient(135deg, #475569 0%, #334155 100%);
            line-height: normal;
            font-weight: 500;
            font-size: 14px;
            color: #fff;
            letter-spacing: 0.02em;
            transition: all 0.3s ease;

            &.is-active {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            }

            .el-collapse-item__arrow {
              color: #fff;
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
          }

          .el-collapse-item__wrap {
            border: none;
            background-color: transparent;
          }

          .el-collapse-item__content {
            padding: 16px 0;
            background-color: var(--theme-card);
          }
        }
      }

      .collapseTitle {
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 0.03em;
      }

      .recordItem {
        margin-bottom: 10px;
        padding: 14px 16px;
        border-left: 3px solid #cbd5e1;
        border-radius: 8px;
        background: var(--theme-primary-soft);
        cursor: pointer;
        transition: all 0.2s ease;
        animation: slideIn 0.3s ease-out;

        &:hover {
          border-left-color: #3b82f6;
          background: var(--theme-primary-soft);
          // transform: translateX(2px);
        }

        &:last-child {
          margin-bottom: 0;
        }

        .groupName {
          margin-bottom: 8px;

          span {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            font-weight: 600;
            font-size: 12px;
            color: #3730a3;
            letter-spacing: 0.02em;
          }
        }

        .time {
          margin-bottom: 6px;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          color: #64748b;
          letter-spacing: 0.01em;
        }

        .content {
          line-height: 1.6;
          font-weight: 400;
          font-size: 14px;
          color: #1e293b;
        }
      }
    }
  }

  .tabel_pagination {
    margin-bottom: 8px;
    padding: 0;
    border-top: 1px solid #e2e8f0;
    background: var(--theme-card);
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.04);
    :deep(.el-pagination) {
      padding-top: 16px !important;
      padding-bottom: 8px !important;
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
