<template>
  <div class="commonEchartsTitle">

    <div class="xAxisName" v-show-tip>
      <el-tooltip
        class="box-item"
        effect="dark"
        placement="bottom-start"
      >
        <div class="titleContainer">
          {{ yAxisName }}
        </div>
        <template #content>
          <div class="toolTipContent">
            {{ yAxisName }}
          </div>
        </template>
      </el-tooltip>
    </div>
    <div class="chartsDom">
      <slot></slot>
    </div>
    <div class="yAxisName" v-show-tip>
      <el-tooltip
        class="box-item"
        effect="dark"
        placement="bottom-start"
      >
        <div class="titleContainer">
          {{ xAxisName }}
        </div>
        <template #content>
          <div class="toolTipContent">
            {{ xAxisName }}
          </div>
        </template>
      </el-tooltip>
    </div>
  </div>
</template>
<script setup>
defineProps({
  xAxisName: {
    type: String,
    default: ''
  },
  yAxisName: {
    type: String,
    default: ''
  }
})
</script>
<style scoped lang="scss">
.commonEchartsTitle {
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .chartsDom {
    flex: 1;
  }
  .xAxisName,
  .yAxisName {
    display: flex;
    height: 22px;
    line-height: 22px;
    font-weight: 400;
    font-size: 12px;
    color: var(--theme-text-3);
    .titleContainer {
      overflow: hidden;
      // max-width: 200px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .xAxisName {
    margin-bottom: 10px;
  }
  .yAxisName {
    justify-content: center;
    margin-top: 12px;
    text-align: center;
  }
}
</style>
