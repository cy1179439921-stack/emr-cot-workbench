<template>
  <div class="common-form-title">
    <commonGoBack @handleBack="handleBack">
      <div class="title-info">
        <template v-if="mode === 'view' || mode === 'approve'">
          <div class="splitLine"></div>
          <div class="item" v-if="menu !== 'panorama'">提交人：
            <template v-if="curEditRow?.projectCommitterName || curEditRow?.committerName">
              {{ curEditRow.projectCommitterName || curEditRow.committerName }}（{{ curEditRow.committerDepartment }}）
            </template>
            <template v-else>-</template>
          </div>
          <div class="item" v-if="menu !== 'panorama'">提交日期：{{curEditRow?.commitTime || '-'}}</div>
          <div class="item approval-status" v-if="mode === 'view' && menu !== 'panorama'">审批状态：<span :class="getStatus(curEditRow?.auditStatus)">{{statusGroupOptions[curEditRow?.auditStatus - 1]?.label}}</span></div>
          <div class="item copy-item" v-if="mode === 'view' && !['论文', '著作', '专利', '获奖'].includes(title)">项目ID：{{curEditRow?.projectId}}<i class="iconfont icon-fuzhi1" @click="copy(curEditRow?.projectId)"></i></div>
          <div class="item copy-item" v-if="mode === 'view' && menu !== 'panorama' && !['论文', '著作', '专利', '获奖'].includes(title)">
            {{ title }}ID：{{ displayId }}
            <i class="iconfont icon-fuzhi1" @click="copy(displayId)"></i>
          </div>
        </template>
      </div>
      <el-button type="primary" @click="viewProjectInfo" :disabled="!projectId && !curEditRow?.projectId" v-if="needView">查看项目信息</el-button>
    </commonGoBack>
    <projectInfoDetail title="项目信息" v-if="showNewProjectChange" mode="view" :businessType="1" v-model:addDialogShow="showNewProjectChange" :projectId="projectId" :curEditRow="curEditRow" @handle-close="showNewProjectChange = false" @handleBack="showNewProjectChange = false"/>
  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonFormTitle',
  inheritAttrs: false
})
import commonGoBack from '@/components/common/commonGoBack.vue'
import projectInfoDetail from '@/components/researchManagement/newProjectChangeDialog.vue'
import {
  enum_status as statusGroupOptions
} from '@/components/researchManagement/enum/enum_researchManagement.js'
import { copy } from '@/utils/utils'
import { ref, computed } from 'vue'
const emits = defineEmits(['handleBack'])
const props = defineProps({
  mode: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  menu: {
    type: String,
    default: ''
  },
  needView: {
    type: Boolean,
    default: false
  },
  curEditRow: {
    type: Object
  },
  projectId: {
    type: String,
    default: ''
  }
})
// const displayId = computed(() => props.curEditRow?.projectApprovalId ?? props.curEditRow?.id)
const displayId = computed(() => {
  if (props.curEditRow?.id === props.curEditRow?.projectId) {
    return props.curEditRow?.projectApprovalId
  } else {
    return props.curEditRow?.id
  }
})
const handleBack = () => {
  emits('handleBack')
}
// 获取审批状态对应的class
const getStatus = (status) => {
  switch (status) {
    case 1:
      return 'temporarySave'
    case 2:
      return 'approver'
    case 3:
      return 'rejected'
    case 4:
      return 'approved'
    case 5:
      return 'revocation'
    default:
      return ''
  }
}
// 展示项目变更弹窗
const showNewProjectChange = ref(false)
// 查看项目信息
const viewProjectInfo = () => {
  showNewProjectChange.value = true
}
</script>
<style scoped lang="scss">
.common-form-title {
  display: flex;
  width: 100%;
  .title-info {
    display: flex;
    align-items: center;
    flex: 1;
    color: var(--theme-text);
    .splitLine {
      width: 1px;
      height: 16px;
      margin-left: 12px;
      margin-right: 12px;
      background-color: #cbcfdc;
    }
    .item {
      display: flex;
      align-items: center;
      margin-right: 32px;
      &.approval-status {
        span {
          box-sizing: border-box;
          padding: 1px 8px;
          border-radius: 2px;
          font-size: 12px;
          &.temporarySave {
            background: rgba(197, 196, 196, 0.2);
            color: var(--theme-text);
          }
          &.approver {
            background: rgba(54, 112, 248, 0.1);
            color: var(--theme-primary);
          }
          &.rejected {
            background: rgba(255, 78, 78, 0.1);
            color: #ff4e4e;
          }

          &.approved {
            background: rgba(4, 162, 115, 0.1);
            color: #04a273;
          }
          &.revocation {
            background: rgba(245, 159, 12, 0.1);
            color: #f59f0c;
          }
        }
      }
    }
    .copy-item {
      i {
        padding-left: 8px;
        cursor: pointer;
        font-size: 14px;
        color: var(--theme-primary);
      }
    }
  }
}
</style>
