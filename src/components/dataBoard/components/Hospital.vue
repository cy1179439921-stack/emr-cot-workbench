<template>
  <div :class="{hospitalHome:true, darkHospitalHome:modeStore.mode==='dark'}">
    <div class="header">
      <div class="cancelBtn" @click="emits('cancel')">
        <i class="iconfont icon-zuo"></i>
        <span>返回</span>
      </div>
      <div class="line"></div>
      <div class="back-title">医院详情</div>
    </div>
    <div class="basicLabel common-title">
      <div class="flag"></div>
      <div>基础数据</div>
    </div>
    <div class="basicData">
      <div class="hospitalName">
        <div class="name" :title="hospitalInfo.name">{{ hospitalInfo.name }}</div>
        <div class="grade">{{ hospitalDetail.level }}</div>
      </div>
      <div class="itemDataContaienr">
        <div v-for="(item,index) in basicDataOptions" :key="index" class="itemData">
          <div class="value" :title="hospitalDetail[item.prop]||0">{{ addThousandSeparator(hospitalDetail[item.prop])||0 }}</div>
          <div class="label" :title="item.label">{{ item.label }}</div>
        </div>
      </div>
    </div>
    <div class="diseaseDataLabel common-title">
      <div class="flag"></div>
      <div>病种数据信息</div>
    </div>
    <div class="diseaseData">
      <el-scrollbar v-if="!loadingStatus&&diseaseData?.length">
        <div v-for="(item,index) in diseaseData" :key="index" class="diseaseType">
          <div class="diseaseHeader">

            <div class="label" v-show-tip>
              <el-tooltip
                class="box-item"
                effect="dark"
                :popper-class="modeStore.mode==='dark'?'darkModeTooltip':''"
                :content="item.name"
                placement="bottom"
                :open-delay="400"
                :enterable="false"
                :hide-after="0"
              >
                <span class="treeLabel">{{item.name}}</span>
              </el-tooltip>
            </div>
            <div class="dashLine"></div>
            <div class="val">{{ addThousandSeparator(item.num) }}</div>
          </div>
          <template v-if="item.children">
            <div v-for="v in item.children" :key="v.id" class="diseaseItem">
              <div class="label" v-show-tip>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :popper-class="modeStore.mode==='dark'?'darkModeTooltip':''"
                  :content="v.name"
                  placement="bottom"
                  :open-delay="400"
                  :enterable="false"
                  :hide-after="0"
                >
                  <span class="treeLabel">{{v.name}}</span>
                </el-tooltip>
              </div>
              <div class="dashLine"></div>
              <div class="val">{{ addThousandSeparator(v.num) }}</div>
            </div>
          </template>
        </div>
      </el-scrollbar>
      <div class="empty" v-if="!diseaseData?.length">
        <img v-if="!loadingStatus" class="emptyImg" :src="modeStore.mode==='dark' ? darkEmpty : emptyImg" alt="" />
        <div v-if="loadingStatus" class="pixel-spinner">
          <div class="pixel-spinner-inner"></div>
        </div>
        <span class="emptyText" :class="{ 'loading': loadingStatus }">{{ loadingStatus ? '加载中' : '这里还没有内容' }}</span>
      </div>
    </div>
  </div>
</template>
<script setup name="hospital">
import { ref, watch } from 'vue'
import { agencyDetail } from '@/api/api_bigScreen.js'
import lodash from 'lodash'
import emptyImg from '@/assets/empty.png'
import darkEmpty from '@/assets/dark-empty.png'
import { addThousandSeparator } from '@/utils/utils.js'
import { useModeStore } from '@/store/modeStore'
const modeStore = useModeStore()
const emits = defineEmits(['cancel'])
const props = defineProps({
  hospitalInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const loadingStatus = ref(true)
const basicDataOptions = ref([
  {
    label: '上报病案总数',
    prop: 'reportTotalNum'
  },
  {
    label: '符合检测病种病案总数',
    prop: 'matchReportTotalNum'
  },
  {
    label: '已同步数据平台病案总数',
    prop: 'medicalRecordsNum'
  },
  {
    label: '完成标准化总数',
    prop: 'standardTotalNum'
  }
])
const hospitalDetail = ref({})
const diseaseData = ref([])
watch(() => props.hospitalInfo, () => {
  getAgencyDetail()
})
const getAgencyDetail = () => {
  diseaseData.value = []
  loadingStatus.value = true
  const params = {
    id: lodash.get(props.hospitalInfo, 'id')
  }
  agencyDetail(params).then(res => {
    if (res.code === 10000) {
      hospitalDetail.value = lodash.get(res, 'data') || {}
      diseaseData.value = res.data.disease
      loadingStatus.value = false
    }
  })
}
getAgencyDetail()
</script>
<style lang="scss" scoped>
.hospitalHome {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 56px;
    padding: 0 16px;
    border-bottom: 1px solid #e8e8e8;
    .cancelBtn {
      display: flex;
      align-items: center;
      height: 32px;
      cursor: pointer;
      line-height: 23px;
      font-size: 16px;
      color: var(--el-color-primary);
      i {
        margin-right: -7px;
        font-size: 32px;
      }
    }
    .back-title {
      margin-left: 16px;
      font-size: 16px;
      color: var(--theme-text);
    }
  }
  .line {
    width: 0;
    height: 16px;
    margin-left: 16px;
    border-right: 1px solid #cbcfdc;
  }
  .common-title {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 24px 24px 16px 24px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
    .flag {
      width: 2px;
      height: 14px;
      margin-right: 5px;
      background-color: var(--theme-primary);
    }
  }
  .basicData {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 94px;
    padding: 0 24px;
    .hospitalName {
      overflow: hidden;
      box-sizing: border-box;
      width: 275px;
      height: 100%;
      margin-right: 12px;
      padding: 16px;
      border-radius: 4px;
      background: rgba(54, 112, 248, 0.03);
    }
    .name {
      overflow: hidden;
      margin-bottom: 20px;
      line-height: 22px;
      text-overflow: ellipsis;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
      white-space: nowrap;
    }
    .grade {
      line-height: 20px;
      font-size: 14px;
      color: var(--theme-primary);
    }
    .itemDataContaienr {
      display: flex;
      overflow: hidden;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      .itemData {
        box-sizing: border-box;
        width: calc(25% - 9px);
        height: 94px;
        padding: 19px;
        border-radius: 4px;
        background: rgba(54, 112, 248, 0.03);
        .label {
          overflow: hidden;
          margin-top: 2px;
          line-height: 20px;
          text-overflow: ellipsis;
          text-align: center;
          font-size: 14px;
          color: var(--theme-text-2);
          white-space: nowrap;
        }
        .value {
          overflow: hidden;
          line-height: 35px;
          text-overflow: ellipsis;
          text-align: center;
          font-family: D-DIN;
          font-weight: 700;
          font-size: 32px;
          color: var(--theme-text);
          white-space: nowrap;
        }
      }
    }
  }
  .diseaseData {
    overflow: hidden;
    flex-wrap: wrap;
    flex: 1;
    box-sizing: border-box;
    padding: 0 0 24px 24px;
    :deep(.el-scrollbar__view) {
      display: flex;
      flex-wrap: wrap;
      // justify-content: space-between;
      align-items: stretch;
      height: 100%;
      padding-right: 24px;
    }
    .diseaseType {
      overflow: hidden;
      box-sizing: border-box;
      width: calc((100% - 32px)/3);
      margin-right: 16px;
      margin-bottom: 16px;
      padding: 24px;
      border-radius: 4px;
      background: var(--theme-primary-soft);
      &:nth-of-type(3n) {
        margin-right: 0;
      }
    }
    .diseaseHeader,
    .diseaseItem {
      display: flex;
      align-items: center;
      margin-bottom: 17px;
      .label {
        display: flex;
        overflow: hidden; /* 隐藏溢出内容 */
        line-height: 22px;
        font-size: 14px;
        color: var(--theme-text);
        .treeLabel {
          overflow: hidden; /* 隐藏溢出内容 */
          flex: 1;
          line-height: 22px;
          text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
          font-weight: 400;
          font-size: 14px;
          white-space: nowrap;
        }
      }
      .dashLine {
        flex: 1;
        min-width: 40px;
        height: 22px;
        margin-left: 6px;
        margin-right: 6px;
        background: url(@/assets/dashline.png) repeat;
        background-size: contain;
      }
      .val {
        line-height: 22px;
        font-family: D-DIN;
        font-weight: 700;
        font-size: 20px;
        color: var(--theme-primary);
      }
    }
  }
}
.darkHospitalHome {
  .title {
    color: #fff;
  }
  .header {
    border-bottom-color: rgba(255, 255, 255, 0.05);
    .cancelBtn {
      color: #fff;
    }
    .back-title {
      color: #fff;
    }
  }
  .common-title {
    color: #fff;
    .flag {
      background-color: var(--theme-card);
    }
  }
  .basicData {
    .hospitalName {
      box-sizing: border-box;
      border: 1px solid rgba(78, 86, 128, 0.3);
      background: rgba(51, 60, 92, 0.3);
    }
    .name {
      color: #fff;
    }
    .grade {
      color: #fff;
    }
    .itemDataContaienr {
      .itemData {
        box-sizing: border-box;
        border: 1px solid rgba(78, 86, 128, 0.3);
        background: rgba(51, 60, 92, 0.3);
        .value {
          color: #fff;
        }
        .label {
          color: #fff;
        }
      }
    }
  }
  .diseaseData {
    .diseaseType {
      border: 1px solid rgba(78, 86, 128, 0.3);
      background: rgba(51, 60, 92, 0.3);
      .diseaseHeader,
      .diseaseItem {
        .label {
          color: #fff;
        }
        .dashLine {
          background: url(@/assets/dashline-dark.png) repeat;
          background-size: contain;
        }
        .val {
          color: #fac858;
        }
      }
    }
  }
  .empty {
    .emptyText {
      color: var(--theme-text-2);
      &.loading {
        color: #fff;
      }
    }
    .pixel-spinner .pixel-spinner-inner {
      background-color: #9cb9fe;
      color: #9cb9fe;
    }
  }
}
.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  .emptyImg {
    width: 118px;
    height: auto;
  }
  .emptyText {
    margin-top: 12px;
    line-height: 15px;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
</style>
