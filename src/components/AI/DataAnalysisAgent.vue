<template>
  <div class="section6">
    <header class="header" v-if="curStep !== 0">AI数据分析</header>
    <div class="top">
      <div class="content">
        <CommonSteps6 :step="curStep" @toStep="toStep"/>
      </div>
    </div>
    <div class="page-div" v-if="curStep === 0">
      <div class="main">
        <div class="input-div">
          <img :src="aiLogo" class="logo">
        </div>
        <AIInput6 ref="AIInputRef" :sessionType="sessionType" :dialogId="activeSessionInfo?.dialogId" :loading="loading" @handleRequest="handleRequest" @handleStopRequest="handleStopRequest"/>
      </div>
    </div>
    <analysisStep2 @handleNextStep="handleNextStep" v-if="curStep === 1"/>
    <analysisStep3 :variables="variables" @handleNextStep="handleNextStep" v-if="curStep === 2"/>
    <analysisStep4 v-if="curStep === 3"/>
  </div>
</template>

<script setup>
defineOptions({
  name: 'DataAnalysisAgent',
  inheritAttrs: false
})
import aiLogo from '@/assets/AI-logo6.png'
import AIInput6 from '@/components/AI/AIInput6.vue'
import CommonSteps6 from '@/components/common/commonSteps6.vue'
import analysisStep2 from '@/components/AI/analysisStep2.vue'
import analysisStep3 from '@/components/AI/analysisStep3.vue'
import analysisStep4 from '@/components/AI/analysisStep4.vue'
import { getAllVariables } from '@/api/api_dataAnalysis.js'
import { useAgentStore } from '@/store/agentStore.js'
const agentStore = useAgentStore()
const props = defineProps({
  defaultStep: {
    type: Number,
    default: 0
  }
})
// const emits = defineEmits(['handleGenerate'])
import { ref } from 'vue'
const sessionType = ref('dataAnalysis')
const curStep = ref(props.defaultStep)
const handleRequest = () => {
  curStep.value = 1
}
const handleNextStep = () => {
  curStep.value++
}
const toStep = (step) => {
  curStep.value = step
}
const dataOperateId = ref('1143004521119748096')
const variables = ref([])
const init = async () => {
  const { code, data } = await getAllVariables({
    id: dataOperateId.value
  })
  if (code === 10000) {
    variables.value = data
    agentStore.setVariables(data)
  }
}
init()

</script>
<style scoped lang="scss">
.section6 {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 65px;
    margin-bottom: 16px;
    padding-left: 24px;
    border-radius: 8px;
    background-color: var(--theme-card);
    font-weight: 700;
    font-size: 16px;
    color: #3d3d3d;
  }
  .top {
    display: flex;
    align-items: center;
    width: 100%;
    height: 83px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .content {
      width: 100%;
      height: 76px;
      border-radius: 8px;
      background: linear-gradient(180deg, rgba(54, 112, 248, 0.13) 5%, rgba(255, 255, 255, 0) 100%);
    }
  }
  .page-div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    width: 100%;
    margin-top: 16px;
    background: url('@/assets/aiBg.png') no-repeat;
    background-size: 100% 100%;
    .main {
      width: 880px;
      margin: 0 auto;
      .input-div {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 73px;
      }
      .logo {
        // width: 361px;
        height: 83px;
      }
    }
  }
}

</style>
