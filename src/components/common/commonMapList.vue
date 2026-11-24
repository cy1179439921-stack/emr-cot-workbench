<template>
  <div class="common-map-list">
    <div class="map-list-title">
      <CommonSubTitle :text="title"></CommonSubTitle>
    </div>
    <ul class="map-list-container">
      <li v-for="(item, index) in arr" :key="index" class="map-list-item">
        <div class="map-list-item-title">
          <span>{{ item.name }}</span>
          <span class="map-list-item-desc">{{ item.value }}</span>
        </div>
        <div class="progressBar">
          <el-progress
            :text-inside="true"
            :show-text="false"
            :percentage="computedPercentage(item)"
            color="#3670F8"
            status="exception"
            class="custom-progress"
          >
          </el-progress>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import lodash from 'lodash'
const props = defineProps({
  AISDistributionConfig: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: ''
  }
})
const arr = ref()
const computedPercentage = (obj) => {
  if (Number(obj.totalNumber)) {
    return obj.value / obj.totalNumber * 100
  } else {
    return 0
  }
}
watch(() => props.AISDistributionConfig, () => {
  arr.value = lodash.sortBy(props.AISDistributionConfig, o => {
    return Number(o.value)
  }).reverse()
},
{
  deep: true,
  immediate: true
})
</script>

<style lang="scss">
.custom-progress .el-progress-bar__outer {
  height: 16px !important;
  border-radius: 0 !important;
  background-color: rgba(54, 112, 248, 0.05);
}
.custom-progress .el-progress-bar__inner {
  border-radius: 0 !important;
}
</style>
<style lang="scss" scoped>
.common-map-list {
  // padding: 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  padding: 24px 34px 35px 24px;
  .map-list-title {
    margin-bottom: 32px;
    line-height: 26px;
    font-weight: 500;
    font-size: 18px;
    color: #1a1a1a;
  }
  .map-list-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    // height: calc(100% - 24px);
    height: 100%;
    padding-left: 8px;
    li {
      // flex: 1;
      .map-list-item-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 13px;
        span {
          display: block;
        }
        span:nth-child(1) {
          line-height: 20px;
          font-weight: 350;
          font-size: 14px;
          color: var(--theme-text);
        }
        span:nth-child(2) {
          padding-right: 4px;
          line-height: 26px;
          font-weight: 500;
          font-size: 18px;
          color: var(--theme-primary);
        }
      }
    }
    li:last-child {
      margin-bottom: 0;
    }
  }
}
</style>

