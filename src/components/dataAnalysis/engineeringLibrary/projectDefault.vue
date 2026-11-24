<template>
  <div class="project-default">
    <div class="header">
      <div class="icon">
        <svgIcon iconName="icon-gongcheng-1"></svgIcon>
      </div>
      <span class="title">{{ data?.projectName || ' ' }}</span>
    </div>
    <CommonSubTitle text="当前工程信息"></CommonSubTitle>
    <div class="main">
      <span>工程名称：{{ data?.projectName || '-' }}</span>
      <span>工程创建时间：{{ data?.projectCreateTime || '-' }}</span>
      <span>最近节点：{{ data?.recentGroup || '-' }}</span>
      <span>上次操作时间：{{ data?.operatorTime || '-' }}</span>
      <span>描述：{{ data?.projectDescription || '-' }}</span>
    </div>
    <CommonSubTitle text="引用数据集信息"></CommonSubTitle>
    <div class="main">
      <span>数据集名称：{{ data?.dateSetName || '-' }}</span>
      <span>数据集创建时间：{{ data?.dateSetCreateTime || '-' }}</span>
      <span>数据量（患者数）：{{ data?.medicalRecordSum || '-' }}</span>
      <span>变量数（指标数）：{{ data?.indexSum || '-' }}</span>
      <span>描述：{{ data?.dataSetDescription || '-' }}</span>
    </div>
  </div>
</template>
<script setup>
import { reactive } from 'vue'
import { getProjectStartInfo } from '@/api/api_dataAnalysis'
const porps = defineProps({
  nodeData: {
    type: Object,
    require: true,
    default: () => ({})
  }
})
const data = reactive({})

;(function() {
  getProjectStartInfo({ id: porps.nodeData.id }).then(res => {
    if (res.code === 10000) {
      Object.assign(data, res.data)
    }
  })
})()
</script>
<style lang="scss" scoped>
.project-default {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 24px;

  .header {
    display: flex;
    align-items: center;
    .svg-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
    .title {
      height: 22.5px;
      line-height: 22.5px;
      font-weight: 600;
      font-size: 16px;
      color: var(--theme-text);
    }
  }
  .commonSubTitle {
    margin: 16px 0;
  }
  .main {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin-bottom: 8px;
    padding: 16px;
    border-radius: 4px;
    background-color: var(--theme-bg)#fafafa;
    span {
      line-height: 20px;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text-2);
      &:not(:first-child) {
        margin-top: 8px;
      }
    }
  }
  :deep(.commonSubTitleText) {
    font-size: 14px;
  }
}
</style>
