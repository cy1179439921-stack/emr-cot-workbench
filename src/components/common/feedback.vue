<template>
  <div class="feedback" >
    <div class="suspension" @click="handleClick">
      <i class="iconfont icon-yijianfankui"></i>
      <span>意见反馈</span>
    </div>
    <div class="customDialog" v-if="showDialog">
      <div class="dialogHeader">
        <div class="title">您对输出的结果是否满意？</div>
        <i class="iconfont icon-guanbi2" @click="handleClose"></i>
      </div>
      <div class="dialogContent">
        <div v-for="(item,index) in scoringSheet" :key="index" @click="handleScore(item,index)" @mouseenter="hoverIndex = index + 1" @mouseleave="hoverIndex = 0" class="levelItem">
          <img v-if="score !== index + 1 && hoverIndex !== index + 1" :src="item.icon" alt="">
          <img v-else :src="item.iconc" alt="">
          <div>{{ item.label }}</div>
        </div>
      </div>
      <div class="opinion">
        <el-input
          type="textarea"
          placeholder="请填写您宝贵的意见"
          v-model="textarea"
          maxlength="5000"
          show-word-limit
          resize="none"
        >
        </el-input>
      </div>
      <div class="subBtn" @click="handleSub">提交</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { feedback } from '@/api/api_agent.js'
import lodash from 'lodash'
import { ElMessage } from 'element-plus'
const props = defineProps({
  sessionType: {
    type: String
  }
})
const showDialog = ref(false)
const handleClick = () => {
  score.value = 0
  textarea.value = ''
  showDialog.value = true
}
const handleClose = () => {
  showDialog.value = false
}
const scoringSheet = ref([
  {
    label: '不推荐',
    icon: new URL('@/assets/emoji1.png', import.meta.url).href,
    iconc: new URL('@/assets/emojic1.png', import.meta.url).href,
    status: 0
  },
  {
    label: '一般',
    icon: new URL('@/assets/emoji2.png', import.meta.url).href,
    iconc: new URL('@/assets/emojic2.png', import.meta.url).href,
    status: 0
  },
  {
    label: '还不错',
    icon: new URL('@/assets/emoji3.png', import.meta.url).href,
    iconc: new URL('@/assets/emojic3.png', import.meta.url).href,
    status: 0
  },
  {
    label: '很满意',
    icon: new URL('@/assets/emoji4.png', import.meta.url).href,
    iconc: new URL('@/assets/emojic4.png', import.meta.url).href,
    status: 0
  },
  {
    label: '强烈推荐',
    icon: new URL('@/assets/emoji5.png', import.meta.url).href,
    iconc: new URL('@/assets/emojic5.png', import.meta.url).href,
    status: 0
  }
])
const score = ref(0)
const hoverIndex = ref(0)
const satisfaction = ref('')
const handleScore = (obj, index) => {
  score.value = index + 1
  satisfaction.value = obj.label
}
const textarea = ref('')
const sessionTypeList = ['section1', 'section2', 'section3']

const handleSub = () => {
  const index = lodash.indexOf(sessionTypeList, props.sessionType)
  // if (score.value <= 0) {
  //   ElMessage.warning('请选择满意度')
  //   return
  // }
  if (!textarea.value.trim()) {
    ElMessage.warning('请填写您的意见')
    return
  }
  // eslint-disable-next-line no-unreachable
  feedback({
    agentType: index + 3,
    satisfaction: satisfaction.value,
    suggestion: textarea.value.trim()
  }).then(res => {
    if (res.code === 10000) {
      showDialog.value = false
      ElMessage.warning('已成功提交,非常感谢你的反馈!')
    }
  })
}
defineExpose({ handleClose })
</script>
<style scoped lang="scss">
.feedback {
  position: fixed;
  right: 35px;
  bottom: 69px;
  z-index: 4;
  .suspension {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 65px;
    height: 65px;
    border: 1px solid #e7eaf0;
    border-radius: 160px 160px 160px 160px;
    background: var(--theme-card);
    box-shadow: 0 3px 10px 0 rgba(163, 165, 175, 0.08);
    cursor: pointer;
    font-size: 20px;
    color: #3d3d3d;
    &:hover {
      width: 170px;
      height: 65px;
      animation: slowlyMove 0.1s linear;
      span {
        display: inline;
        word-break: keep-all;
      }
      .iconfont {
        margin-right: 9px;
      }
    }
    span {
      display: none;
    }
    .iconfont {
      font-size: 22px;
    }
  }
}

@keyframes slowlyMove {
  0% {
    width: 65px;
  }
  25% {
    width: 85px;
  }
  50% {
    width: 105px;
  }
  75% {
    width: 125px;
  }
  100% {
    width: 170px;
  }
}

.customDialog {
  display: flex;
  position: fixed;
  right: 35px;
  bottom: 57px;
  z-index: 40;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: 472px;
  height: 564px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 10px 10px 10px 10px;
  background: var(--theme-card);
  box-shadow: 0 4px 10px 0 rgba(162, 166, 173, 0.43);
  .dialogHeader {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 24px;
    .title {
      flex: 1;
      line-height: 32px;
      font-weight: 600;
      font-size: 20px;
      color: var(--theme-text);
    }
    .iconfont {
      cursor: pointer;
      font-size: 17px;
      color: var(--theme-text-3);
    }
  }
  .dialogContent {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0 6px;
    .levelItem {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      img {
        width: 42px;
        height: 42px;
        margin-bottom: 10px;
      }
    }
  }
  .opinion {
    overflow: hidden;
    position: relative;
    // height: 262px;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    margin: 24px 0;
    padding: 12px 0;
    border: 1px solid #d1d5db;
    border-radius: 8px 8px 8px 8px;
    background: var(--theme-card);
    :deep(.el-textarea) {
      height: 100%;
    }
    :deep(.el-textarea__inner) {
      height: 100%;
      box-shadow: none;
    }
  }
  .subBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 53px;
    border-radius: 50px;
    background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
    cursor: pointer;
    line-height: 24px;
    font-weight: 600;
    font-size: 20px;
    color: #fff;
  }
  :deep(.el-textarea__inner) {
    font-size: 18px;
  }
  :deep(.el-input__count) {
    font-size: 16px;
  }
}
</style>
