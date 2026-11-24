<template>
  <div class="analysisStep3">
    <div class="main1">
      <div class="section left">
        <header>报告生成</header>
        <div class="div1">
          <div class="result1" v-for="(item, index) in resultList" :key="index">
            <div class="result-timeline">
              <div class="flexCenter">{{index + 1}}</div>
              <div></div>
            </div>
            <div class="result-right">
              <div class="weight-16">{{item.name}}</div>
              <div class="detail">
                <div class="top">
                  <span>输出结果：</span>
                  <span v-if="item.showDetail" @click="handleClick(item, index, false)">隐藏内容 <i class="iconfont icon-arrowUp"></i></span>
                  <span v-else @click="handleClick(item, index, true)">展开查看 <i class="iconfont icon-arrowDown"></i></span>
                </div>
                <div class="result-content" v-if="item.showDetail" v-html="item.result"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="section right">
        <div class="div1">
          <el-button type="primary">
            <i class="iconfont icon-daochu2"></i>
            下载PDF
          </el-button>
          <el-scrollbar>
            <img src="@/assets/peiduiyangbenjianyan.png" v-if="resultList[0].showDetail">
            <img src="@/assets/luojihuigui.png" v-if="resultList[1].showDetail">
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const resultList = ref([
  {
    name: '配对样本T检验',
    result: `
    表1展示了样本配对差值的描述性统计和正态性检验的结果，包括均值、标准差等，用于检验数据的正态性。</br>
  通常正态分布的检验方法有两种，一种是Shapiro-Wilk检验，适用于小样本资料（样本量≤5000）；另一种是Kolmogorov–Smirnov检验，适用于大样本资料（样本量>5000）。</br>
若呈现显著性(P<0.05)，则说明拒绝原假设（数据符合正态分布），该数据不满足正态分布，反之则说明该数据满足正态分布。
    `,
    showDetail: true
  },
  {
    name: 'logistic回归',
    result: `
    - 表1展示了因变量各分组的分布情况。选项：当前字段数据下的去重类别。频数：当前去重类别在数据中出现的次数。百分比：当前去重类别的频数占比。当因变量分类水平的数据量出现严重不平衡时，建议对数据进行过采样或者欠采样。
    `,
    showDetail: false
  }
])
const handleClick = (item, index, showDetail) => {
  resultList.value[index].showDetail = showDetail
  if (showDetail) {
    // 关闭其他的
    resultList.value.forEach((item, index2) => {
      if (index !== index2) {
        resultList.value[index2].showDetail = false
      }
    })
  }
}
</script>
<style scoped lang="scss">
.analysisStep3 {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 0;
  margin-top: 16px;
  .main1 {
    display: flex;
    flex-direction: row;
    flex: 1;
    width: 100%;
    height: 0;
  }
  header {
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-primary);
  }
  .section {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 0;
    padding: 16px 24px 24px 24px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .div1 {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-top: 16px;
      padding: 0 24px 20px 24px;
      border: 1px solid #c9d8fc;
      border-radius: 8px;
      background: var(--theme-primary-soft);
    }
  }
  .left {
    .div1 {
      padding-top: 32px;
    }
    .result1 {
      display: flex;
      width: 100%;
      margin-bottom: 20px;
      .result-timeline {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 23px;
        div:nth-child(1) {
          width: 23px;
          height: 23px;
          border-radius: 23px;
          background: var(--theme-primary);
          color: #fff;
        }
        div:nth-child(2) {
          flex: 1;
          width: 1px;
          margin-top: 15px;
          background-color: var(--theme-primary);
        }
      }
      .result-right {
        flex: 1;
        margin-left: 12px;
        .detail {
          margin-top: 20px;
          padding: 20px;
          border-radius: 8px;
          background-color: var(--theme-card);
          .top {
            display: flex;
            span:nth-child(1) {
              font-weight: 500;
              color: var(--theme-text);
            }
            span:nth-child(2) {
              display: flex;
              align-items: center;
              cursor: pointer;
              color: var(--theme-primary);
              i {
                margin-left: 8px;
                font-size: 6px;
              }
            }
          }
          .result-content {
            width: 100%;
            margin-top: 10px;
          }
        }
      }
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    margin-left: 16px;
    .div1 {
      position: relative;
      flex: 1;
      height: 0;
      padding-top: 24px;
      .el-button {
        position: absolute;
        right: 24px;
        z-index: 2;
        width: 107px;
        border-radius: 32px;
        cursor: pointer;
        i {
          margin-right: 6px;
          font-size: 13px;
        }
      }
      img {
        width: 100%;
      }
    }
  }
}

</style>
