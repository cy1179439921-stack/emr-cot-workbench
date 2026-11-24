<template>
  <div class="analysis-cards">
    <!-- 卡片渲染 -->
    <div class="card-content">
      <header class="header">
        <div class="left">
          <div>流程列表</div>
          <div class="line"></div>
          <div class="count">共计<span>{{cardsData.length}}</span></div>
        </div>
        <el-button type="primary" @click="handleAdd" v-if="!needCheckPermission || hadPermissionList.includes('新增')"><i class="iconfont icon-tianjiayihang"></i>新增流程</el-button>
      </header>
      <template v-if="cardsData && cardsData.length && !loading">
        <el-scrollbar>
          <div class="card-section">
            <div class="card-item" v-for="item in cardsData" :key="item.id" @click="handleClickCard(item)">
              <div class="card-name">
                <img :src="cardLogos[item.stage]">
                <div class="name">
                  <div class="name">
                    <CommonTooltip :content="item.flowName">
                      <span>{{ item.flowName }}</span>
                    </CommonTooltip>
                  </div></div>
                <MorePopover :width="97" :operationList="getPermission(operationList2)" trigger="hover" @handlePopoverSelect="btnValue => handlePopoverSelect(btnValue, item)" v-if="getPermission(operationList2).length > 0"/>
              </div>
              <div class="card-main">
                <div class="normalText" v-for="(item2, index2) in cardsFields" :key="'line' + index2">
                  <div class="label">{{item2.name}}：</div>
                  <div class="value">
                    <CommonTooltip :content="item[item2.value]">
                      <span>{{ item[item2.value] }}</span>
                    </CommonTooltip>
                  </div>
                </div>
                <div class="card-time">
                  <i class="iconfont icon-shenpishu"></i>
                  <span class="text">正被引用的审批数：</span>
                  <span class="count">{{item.auditNum || '-'}}</span>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </template>
      <template v-else>
        <div class="emptyContent" v-if="!loading">
          <emptyContent :loading="loading"/>
        </div>
        <div class="loading-div flexCenter" v-else>
          <div class="loading-box">
            <div class="pixel-spinner">
              <div class="pixel-spinner-inner"></div>
            </div>
            <div class="text">加载中</div>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>
<script setup>
import { ref } from 'vue'
import initProjectProcess from '@/assets/initProjectProcess.png'
import researchProcess from '@/assets/researchProcess.png'
import modifyProcess from '@/assets/modifyProcess.png'
import midCheckProcess from '@/assets/midCheckProcess.png'
import finishProcess from '@/assets/finishProcess.png'
import paperProcess from '@/assets/paperProcess.png'
import workProcess from '@/assets/workProcess.png'
import patentProcess from '@/assets/patentProcess.png'
import awardProcess from '@/assets/awardProcess.png'
import MorePopover from '@/components/common/morePopover.vue'
import emptyContent from '@/components/medicalRecord/standardizedMedical/emptyContent.vue'
const emits = defineEmits(['handleEdit', 'handleDelete', 'handleAdd', 'handleNew', 'handleClickCard', 'viewDataBase'])
defineOptions({
  name: 'AnalysisCardsTable',
  inheritAttrs: false
})
const props = defineProps({
  type: {
    type: Number,
    default: 0
  },
  options: {
    type: Object,
    default: () => ({})
  },
  needCheckPermission: {
    type: Boolean,
    default: false
  },
  hadPermissionList: {
    type: Array,
    default: () => []
  },
  otherPermissions: {
    type: Array,
    default: () => []
  },
  cardsData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const cardsFields = [
  {
    name: '医院',
    value: 'agencyName'
  },
  {
    name: '科室',
    value: 'departmentName'
  },
  {
    name: '阶段',
    value: 'stage'
  },
  {
    name: '创建人',
    value: 'creator'
  },
  {
    name: '创建时间',
    value: 'createTime'
  }
]
const cardLogos = {
  项目立项: initProjectProcess,
  项目研究: researchProcess,
  项目变更: modifyProcess,
  项目中检: midCheckProcess,
  项目结题: finishProcess,
  论文管理: paperProcess,
  著作管理: workProcess,
  专利管理: patentProcess,
  获奖管理: awardProcess
}
const operationList2 = ref([
  {
    name: '详情',
    permissionText: '查看',
    icon: 'iconfont icon-xiangqing'
  },
  {
    name: '编辑',
    permissionText: '编辑',
    icon: 'iconfont icon-bianji2'
  },
  {
    name: '删除',
    permissionText: '删除',
    icon: 'iconfont icon-shanchu3'
  }
])
// 判断权限
const getPermission = (operationList) => {
  const result = []
  for (const item of operationList) {
    if (!props.needCheckPermission || props.hadPermissionList.includes(item.permissionText)) {
      result.push(item)
    }
  }
  return result
}

// 空内容时新增
const handleAdd = () => {
  emits('handleNew')
}
const handlePopoverSelect = (name, item) => {
  switch (name) {
    case '编辑':
      editFolder(item)
      break
    case '删除':
      deleteFolder(item)
      break
    case '详情':
      handleClickCard(item)
      break
    default:
      break
  }
}
// 删除
const deleteFolder = async (item) => {
  console.log(item)
  emits('handleDelete', {
    name: '删除',
    data: item
  })
}
// 编辑
const editFolder = (item) => {
  console.log(item)
  emits('handleEdit', {
    name: '编辑',
    data: item
  })
}

// 点击卡片
const handleClickCard = (item) => {
  emits('handleClickCard', item)
}
</script>
<style scoped lang="scss">
.analysis-cards {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 0;
  margin-top: 16px;
  :deep(.el-breadcrumb) {
    height: 20px;
    margin-top: 8px;
    margin-bottom: 24px;
    line-height: 20px;
    color: var(--theme-text-3);
    .el-breadcrumb__item:last-child {
      .el-breadcrumb__inner {
        color: var(--theme-text);
      }
    }
    .el-breadcrumb__inner {
      cursor: pointer;
      color: var(--theme-text-3);
    }
    .el-breadcrumb__separator {
      margin: 0 5px;
      font-weight: normal;
    }
  }
  .card-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 0;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 67px;
      margin-bottom: 16px;
      padding: 0 26px;
      border-radius: 8px;
      background-color: var(--theme-card);
      .left {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
        color: var(--theme-text);
        .line {
          width: 1px;
          height: 16px;
          margin-left: 16px;
          background-color: #cbcfdc;
        }
        .count {
          display: flex;
          align-items: center;
          margin-left: 16px;
          font-weight: 400;
          font-size: 16px;
          color: var(--theme-text-2);
          span {
            font-weight: 600;
            font-size: 18px;
            color: var(--theme-primary);
          }
        }
      }
      .el-button {
        i {
          margin-right: 10px;
          font-size: 12px;
        }
      }
    }
    .card-section {
      display: flex;
      flex-wrap: wrap;
      .card-item {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: calc((100% - 64px)/5);
        height: 273px;
        margin-right: 16px;
        padding: 0;
        border-radius: 8px;
        background-color: var(--theme-card);
        cursor: pointer;
        &:nth-child(5n) {
          margin-right: 0;
        }
        &:nth-child(n + 6) {
          margin-top: 16px;
        }
        .card-name {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          height: 56px;
          padding-left: 16px;
          padding-right: 16px;
          border-bottom: 1px solid #e8e8e8;
          img {
            width: 24px;
          }
          .name {
            display: flex;
            overflow: hidden;
            flex: 1;
            margin-left: 6px;
            font-weight: 600;
            color: var(--theme-text);
          }
        }
        .card-main {
          flex: 1;
          padding: 16px 16px 0;
          .normalText {
            display: flex;
            overflow: hidden;
            line-height: 22px;
            &:not(:first-child) {
              margin-top: 8px;
            }
            .label {
              color: var(--theme-text-2);
            }
            .value {
              flex: 1;
              width: 0;
              color: var(--theme-text);
            }
          }
        }
        .card-desc {
          display: flex;
          overflow: hidden;
          margin-top: 17px;
          padding-left: 2px;
          color: var(--theme-text-2);
        }
        .card-time {
          display: flex;
          align-items: center;
          flex: 1;
          margin-right: 3px;
          margin-top: 16px;
          .iconfont {
            font-size: 16px;
            color: var(--theme-primary);
          }
          .el-icon {
            font-size: 16px;
            color: var(--theme-primary);
          }
          .text {
            margin-left: 8px;
            color: var(--theme-text-2);
          }
          .count {
            color: var(--theme-text);
          }
        }
        &:hover {
          box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
          :deep(.card-name) {
            .icon-gengduo1 {
              display: block;
            }
            &:hover {
              .operate-btn {
                display: block;
              }
            }
          }
        }
      }
    }
  }
  .emptyContent {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    // margin-top: 16px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .emptyImg {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -84px;
      // margin-top: 212px;
      img {
        width: 204px;
        margin-bottom: 6px;
      }
      .text {
        color: var(--theme-text-3);
      }
      .btn-div {
        display: flex;
        margin-top: 33px;
        .el-button {
          display: flex;
          img {
            width: 21px;
            margin-right: 8px;
            margin-bottom: 0;
          }
          &:nth-child(2) {
            img {
              width: 23px;
            }
          }
        }
      }
    }
  }
  .loading-div {
    flex: 1;
    border-radius: 8px;
    background-color: var(--theme-card);
    .loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      .pixel-spinner {
        margin-bottom: 14px;
      }
      .text {
        color: var(--theme-text-3);
      }
    }
  }
}
</style>
