<template>
  <div :class="{qualityResult:true,thumbnail:mode==='thumbnail'}">
    <img class="rateImg" src="@/assets/oeverallQuality.png" v-if="mode==='thumbnail'" alt="质量检查报告"/>
    <div class="leftContianer">
      <div class="score-div">
        <!-- 总体质量 -->
        <img class="img1" src="@/assets/robot2.gif" alt="">
        <img class="img2" src="@/assets/overallQuality.png" alt="">
      </div>
      <div class="colorLine">
        <customRate :rateValue="rateValue(info.score)"/>
        <span class="rate">{{ info.score }}分</span>
      </div>
    </div>
    <div class="line" v-if="mode==='all'"></div>
    <div class="description" v-if="mode==='all'">
      <div class="left">
        <div class="textContaienr">
          <div class="circle"></div>
          <div>关键问题：</div>
        </div>
        <div class="keyQuestion">{{info.keyQuestionCount}}<span>（个）</span></div>
      </div>
      <div class="right">
        <div class="textContaienr">
          <div class="circle"></div>
          <div>优化项：</div>
        </div>
        <div class="optimize">{{info.optimizationCount}}<span>（个）</span></div>
      </div>
    </div>
  </div>
  <div class="thumbnailDescription" v-if="mode==='thumbnail'">
    <div class="left">
      <div class="circle"></div>
      <div>关键问题：</div>
      <div class="keyQuestion">{{info.keyQuestionCount}}个</div>
    </div>
    <div class="right">
      <div class="circle"></div>
      <div>优化项：</div>
      <div class="optimize">{{info.optimizationCount}}个</div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AIQualityResult',
  inheritAttrs: false
})
import { computed } from 'vue'
import customRate from '@/components/jiancan/directApoplexyReport/customRate.vue'
const props = defineProps({
  info: {
    type: Object,
    default: () => ({
      score: 0,
      keyQuestionCount: 0,
      optimizationCount: 0
    })
  },
  mode: {
    type: String,
    default: 'all'
  }
})
const rateValue = (num) => {
  if (num) {
    return Number(((num - 0) / 10 * 5).toFixed(1)) || 0
  } else {
    return 0
  }
}
// eslint-disable-next-line no-unused-vars, vue/return-in-computed-property
const starColor = computed(() => {
  if (Number(props.info.score) < 4) {
    return '#ff4e4e'
  } else if (Number(props.info.score) >= 4 && Number(props.info.score) < 8) {
    return '#f59f0c'
  } else if (Number(props.info.score) >= 8) {
    return '#12b47c'
  }
})
</script>
<style scoped lang="scss">
.qualityResult {
  display: flex;
  align-items: center;
  // flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  &.thumbnail {
    margin-top: 11px;
    .rateImg {
      width: 89px;
    }
    .score-div .img1 {
      width: 30px;
      margin-right: 7px;
    }
    .score-div .img2 {
      width: 103px;
    }
    .colorLine {
      margin-top: 0;
      :deep(.el-rate) {
        .el-rate__icon {
          width: 28px;
          .iconfont {
            font-size: 25px;
          }
        }
      }
    }
    .colorLine .rate {
      margin-left: 12px;
      font-size: 26px;
    }
  }
  .leftContianer {
    display: flex;
    flex-direction: column;
    margin-left: 15px;
  }
  .line {
    width: 0;
    height: 86px;
    margin: 0 66px;
    border-right: 1px solid #e8e8e8;
  }

  .score-div {
    display: flex;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 1px;
    font-weight: 600;
    font-size: 18px;
    color: var(--theme-text);
    span {
      margin-left: 7px;
      font-weight: 700;
      font-size: 24px;
      &.low {
        color: #ff4e4e;
      }
      &.medium {
        color: #ffa100;
      }
      &.high {
        color: #12b47c;
      }
    }
    .img1 {
      width: 37px;
      margin-right: 8px;
    }
    .img2 {
      width: 125px;
      height: auto;
    }
  }
  .colorLine {
    display: flex;
    position: relative;
    align-items: center;
    margin-top: 8px;
    :deep(.el-rate) {
      .el-rate__icon {
        width: 38px;
        .iconfont {
          font-size: 36px;
        }
      }
    }
    .red {
      width: 40%;
      height: 9px;
      border-top-left-radius: 9px;
      border-bottom-left-radius: 9px;
      background-color: #ff4e4e;
      div {
        position: absolute;
        top: 20px;
        font-size: 12px;
        color: var(--theme-text-3);
      }
    }
    .yellow {
      flex: 1;
      height: 9px;
      background-color: #f59f0c;
    }
    .green {
      width: 20%;
      height: 9px;
      border-top-right-radius: 9px;
      border-bottom-right-radius: 9px;
      background-color: #12b47c;
      div {
        position: absolute;
        right: 0;
        top: 20px;
        font-size: 12px;
        color: var(--theme-text-3);
      }
    }
    .line {
      width: 1px;
      height: 13px;
      margin-left: 1px;
      margin-right: 1px;
      div {
        position: absolute;
        top: 20px;
        margin-left: -2px;
        font-size: 12px;
        color: var(--theme-text-3);
      }
      &.yellowLine {
        background-color: #f5a70c;
      }
      &.greenLine {
        background-color: #12b47c;
      }
    }
    .rate {
      margin-left: 14px;
      margin-top: -9px;
      font-weight: 600;
      font-size: 32px;
      color: v-bind(starColor);
    }
  }
  .description {
    display: flex;
    // margin-top: 38px;
    color: var(--theme-text-2);
    .textContaienr {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      font-size: 20px;
      color: var(--theme-text-2);
    }
    .circle {
      width: 8px;
      height: 8px;
      margin-right: 7px;
      border-radius: 8px;
    }
    .left {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .circle {
        background-color: #ff4e4e;
      }
      .keyQuestion {
        font-weight: 600;
        font-size: 38px;
        color: #ff4e4e;
        span {
          font-size: 20px;
        }
      }
    }
    .right {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      .circle {
        background-color: #f59f0c;
      }
      .optimize {
        font-weight: 600;
        font-size: 38px;
        color: #f59f0c;
        span {
          font-size: 20px;
        }
      }
    }
  }
}
.qualityResult {
  :deep(.el-rate .el-rate__icon.is-active),
  :deep(.el-rate__decimal) {
    color: v-bind(starColor) !important;
  }
}
.thumbnailDescription {
  display: flex;
  height: 25px;
  margin-top: 13px;
  line-height: 25px;
  color: var(--theme-text-2);
  .textContaienr {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    font-size: 18px;
    color: var(--theme-text-2);
  }
  .circle {
    width: 8px;
    height: 8px;
    margin-right: 7px;
    border-radius: 8px;
  }
  .left {
    display: flex;
    align-items: center;
    margin-left: 12px;
    margin-right: 27px;
    // flex: 1;
    font-size: 18px;
    .circle {
      background-color: #ff4e4e;
    }
    .keyQuestion {
      font-weight: 600;
      font-size: 18px;
      color: #ff4e4e;
    }
  }
  .right {
    display: flex;
    align-items: center;
    flex: 1;
    font-size: 18px;
    .circle {
      background-color: #f59f0c;
    }
    .optimize {
      font-weight: 600;
      font-size: 18px;
      color: #f59f0c;
    }
  }
}

</style>

