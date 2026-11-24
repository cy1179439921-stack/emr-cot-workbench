<template>
  <div class="patientHomePage">
    <el-scrollbar ref="scrollbar" class="scrollbar-custom" @scroll="handleScroll">
      <header class="pdfHeader" @wheel.stop v-if="data?.routerName">
        <div class="goBack">
          <p @click="goBack" v-if="data?.routerName">
            <i class="iconfont icon-zuo"></i>
            <span>返回</span>
          </p>
          <span class="title">患者主页</span>
        </div>
      </header>
      <div class="viewContent">
        <div class="contentTop">
          <p>
            <span class="title">患者ID：</span>
            <span class="value">{{ patentInfo.id || '-' }}</span>
            <span class="title">性别：</span>
            <span class="value">{{ patentInfo.sex || '-' }}</span>
            <span class="title">年龄：</span>
            <span class="value">{{ patentInfo.age || '-' }}</span>
            <span class="title">出生日期：</span>
            <span class="value">{{ patentInfo.birthDate || '-' }}</span>
            <span class="title">婚姻状况：</span>
            <span class="value">{{ patentInfo.marital || '-' }}</span>
            <span class="title">职业：</span>
            <span class="value">{{ patentInfo.occupation || '-' }}</span>
            <span class="title">患者总就诊次数：</span>
            <span class="value">{{ patentInfo.outpatientNumber + patentInfo.hospitalNumber + patentInfo.physicalNumber || '-' }}</span>
            <span class="title">门急诊就诊次数：</span>
            <span class="value">{{ patentInfo.outpatientNumber}}</span>
            <span class="title">住院就诊次数：</span>
            <span class="value">{{ patentInfo.hospitalNumber}}</span>
            <span class="title">体检次数：</span>
            <span class="value">{{ patentInfo.physicalNumber}}</span>
            <span class="title">是否死亡：</span>
            <span class="value">{{ patentInfo?.isDeath ? '是' : '否' }}</span>
            <template v-if="patentInfo?.isDeath">
              <span class="title">死亡原因：</span>
              <el-tooltip class="box-item" effect="dark" :content="patentInfo?.deathReason" placement="top" :disabled="!patentInfo?.deathReason">
                <span class="value ellipsis">{{ patentInfo?.deathReason || '-' }}</span>
              </el-tooltip>
            </template>
          </p>
          <div class="line" v-show="false">
            <span class="tip">（接入 DeepSeek）</span>
            <div class="aiTitle" @click="isAiShow = true">
              <img :src="menuFoldLogo" class="logo"/>
              <span class="aiName">智脉大模型AI</span>
              <span>助理</span>
            </div>
          </div>
        </div>
        <div class="contentMain">
          <div class="main">
            <div class="patientTimeline">
              <div class="fixe">
                <h2 class="title">患者时间轴</h2>
                <span v-show="isShowHeight" @click="isShowHeight = false"> <i class="iconfont icon-zhankai"></i> 展开</span>
                <span v-show="!isShowHeight" @click="isShowHeight = true"> <i class="iconfont icon-shouqi"></i> 收起</span>
              </div>
              <div class="plr16" v-show="!isShowHeight">
                <patientTimeline class="timeline" :data="patentInfo.timeLine || []" v-if="!loading && patentInfo.timeLine.length > 0"></patientTimeline>
                <emptyContent :loading="loading" v-if="loading || patentInfo.timeLine.length === 0" />
              </div>
            </div>
            <div class="contentBottom" ref="contentBottom" :style="{height: clientHeight + 'px'}">
              <header class="header header1">
                <ul class="tabList">
                  <li
                    v-for="item in tabs"
                    :key="item.value"
                    class="flexCenter"
                    :class="{ active: activeTab === item.value }"
                    @click="handleClickTab(item.value)"
                  >{{item.label}}</li>
                </ul>
              </header>
              <div class="tableContent search">
                <keep-alive>
                  <component :is='tabs[activeTab].component' :curPatientDetail="props.data" ref="refComponents"></component>
                </keep-alive>
              </div>
            </div>
          </div>
          <div class="aiContent" v-if="isAiShow">
            <div class="closeBtn" @click="isAiShow = false">
              <img :src="close" alt="">
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>

  </div>
</template>

<script>
export default {
  name: 'PatientHomePage'
}
</script>
<script setup>
import { ref, onMounted, markRaw, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPatientDetail } from '@/api/api_patient'
import patientTimeline from '@/components/medicalRecord/components/patientTimeline.vue'
import seeADoctor from '@/components/medicalRecord/components/seeADoctor.vue'
import inspection from '@/components/medicalRecord/components/inspection.vue'
import check from '@/components/medicalRecord/components/check.vue'
import operation from '@/components/medicalRecord/components/operation.vue'
import advice from '@/components/medicalRecord/components/advice.vue'
import emptyContent from '@/components/medicalRecord/standardizedMedical/emptyContent.vue'
import { useMedicalStore } from '@/store/medicalStore'
import projectLogo from '@/assets/ebondlogo.png'
import close from '@/assets/close.png'
import { echartsToPx } from '@/utils/utils'
import { useUserStore } from '@/store/user'
import _ from 'lodash'
const userStore = useUserStore()
const menuFoldLogo = ref(userStore.platInfo.menuFoldLogo || projectLogo)
const router = useRouter()
const medicalStore = useMedicalStore()
const props = defineProps({
  data: {
    type: Object
  }
})
const clientHeight = ref(document.documentElement.clientHeight - Math.floor(echartsToPx(16)) * 2)
console.log(111, clientHeight.value)
const router2 = useRoute()
const patentInfo = ref({
  id: '',
  displayId: '',
  sex: '',
  age: 0,
  birthDate: '',
  marital: null,
  occupation: null,
  medicalNumber: 0
})
const isAiShow = ref(false)
const loading = ref(true)
const refComponents = ref(null)
const isShowHeight = ref(false) // 时间轴是否展开
const activeTab = ref(0) // 当前激活的tab
// 菜单
const tabs = ref([
  {
    label: '就诊',
    value: 0,
    component: markRaw(seeADoctor) // 就诊组件
  },
  {
    label: '实验室检查',
    value: 1,
    component: markRaw(inspection) // 检验组件
  },
  {
    label: '影像检查',
    value: 2,
    component: markRaw(check) // 检查组件
  },
  {
    label: '手术记录',
    value: 3,
    component: markRaw(operation) // 手术组件
  },
  {
    label: '医嘱',
    value: 4,
    component: markRaw(advice) // 医嘱组件
  }
])

// 切换tab
const handleClickTab = (index) => {
  activeTab.value = index
}

// 获取患者详细信息
const getPatientDetailData = async () => {
  const params = {
    patientId: props.data.patientId,
    queueId: props.data.studyCohort
    // id: '907062720296259585'
  }
  loading.value = true
  const res = await getPatientDetail(params)
  if (res.code === 10000) {
    patentInfo.value = res.data
    const label = `${patentInfo.value.id}-${patentInfo.value.sex}-${patentInfo.value.age}岁`
    medicalStore.setPatientLable(props.data.key, label)
    loading.value = false
  }
}

// 加载时请求页面列表
const init = _.debounce(async () => {
  // 直接跳转到当前就诊
  if (router2.query.curMedicalId) {
    // 当前就诊
    // 临时默认第一个
    await getPatientDetailData()
  } else {
    getPatientDetailData()
  }
}, 300)

// 返回
const goBack = () => {
  router.back()
}

const contentBottom = ref(null)
const scrollbar = ref(null)
const handleScroll = (event) => {
  if (contentBottom.value) {
    const topOffset = contentBottom.value.offsetTop - Math.floor(echartsToPx(16))
    if (event.scrollTop >= topOffset) {
      // 禁止继续滑动
      scrollbar.value.setScrollTop(topOffset)
    }
  }
}

// 手动改正复制内容过滤空or换行
const copyFilterEmpty = () => {
  document.oncopy = event => {
    // 获取剪切板内容
    const content = window?.getSelection().toString()
    // 判断当前浏览器是否支持获取剪切板对象
    if (event.clipboardData || event.originalEvent) {
      // 获取剪切板对象
      const clipboardData = (event.clipboardData || window.clipboardData)
      // 重新设置剪切板内容（如果是要加一些版权信息之类的修改这个地方即可）
      clipboardData.setData('text/plain', content.trim())
      // 阻止事件冒泡
      event.preventDefault()
    }
  }
}

onMounted(() => {
  init()
  copyFilterEmpty()
})

defineExpose({
  onRefresh: () => {
    nextTick(() => {
      init()
      refComponents.value?.onRefresh()
    })
  }
})
</script>

<style scoped lang="scss">
.patientHomePage {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  :deep(.scrollbar-custom)>.el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .pdfHeader {
    display: flex;
    justify-content: space-between;
    height: 48px;
    min-height: 48px;
    padding: 0 8px;
    border-radius: 0 0 0 0;
    background: var(--theme-card);
    opacity: 1;
    .goBack {
      display: flex;
      align-items: center;
      color: var(--theme-text);
      p {
        margin: 0;
      }
      p:nth-child(1) {
        display: flex;
        align-items: center;
        height: 20px;
        padding-right: 16px;
        border-right: 1px solid #cbcfdc;
        cursor: pointer;
        .iconfont {
          display: block;
          width: 32px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          font-size: 32px;
          color: var(--theme-primary);
        }
        span {
          display: block;
          margin-left: -5px;
          line-height: 32px;
          font-weight: 400;
          font-size: 16px;
          color: var(--el-color-primary);
        }
      }
      .title {
        margin-left: 16px;
      }
    }
  }
  .contentTop {
    display: flex;
    overflow-x: auto;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    height: 48px;
    padding: 0 21px;
    background-color: var(--theme-card);
    >span {
      padding-right: 15px;
      cursor: pointer;
      color: #429fff;
    }
    .title,
    .value {
      white-space: nowrap;
    }
    .line,
    .aiTitle {
      display: flex;
      align-items: center;
      .tip {
        margin-right: 8px;
        font-weight: 400;
        font-size: 16px;
        color: var(--theme-text-2);
      }
    }
    .aiTitle {
      justify-content: center;
      width: 197px;
      height: 37px;
      border-radius: 18px;
      background: linear-gradient(111deg, #ebf0ff 0%, #efebff 100%);
      cursor: pointer;
      user-select: none;
      .logo {
        width: 14px;
        margin-right: 10px;
      }
      span {
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .aiName {
        color: var(--theme-primary);
      }
    }
    .ellipsis {
      display: inline-block;
      width: 154px;
    }
  }
  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 48px;
    padding: 0 26px;
    background-color: var(--theme-bg)#fafafa;
    p:nth-child(1) {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 16px;
      color: var(--el-color-primary);
      i {
        font-size: 32px;
      }
    }
    p:nth-child(2) {
      height: 16px;
      margin: 0 14px;
      border: 1px solid #cbcfdc;
    }
    p:nth-child(3) {
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
  }
}
.viewContent {
  display: flex;
  flex-direction: column;
  height: auto;
  .contentMain {
    display: flex;
    overflow: hidden;
    box-sizing: border-box;
    padding-top: 12px;
    .aiContent {
      position: relative;
      box-sizing: border-box;
      width: 517px;
      margin-left: 12px;
      border-radius: 8px;
      background-color: var(--theme-card);
      .closeBtn {
        position: absolute;
        right: 12px;
        top: 5px;
        cursor: pointer;
        img {
          width: 38px;
          height: 38px;
        }
      }
    }
  }
  .main {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
  }
  .contentTop {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 56px;
    padding: 0 26px;
    border-radius: 8px;
    background-color: var(--theme-card);
    >span {
      padding-right: 15px;
      cursor: pointer;
      color: #429fff;
    }
    p {
      display: flex;
      overflow: hidden;
      align-items: center;
      height: 20px;
      margin: 0;
      line-height: 20px;
      color: var(--theme-text-2);
      .value {
        margin-right: 32px;
      }
    }
  }
  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0;
    background-color: var(--theme-card);
    :deep(.el-form) {
      display: flex;
      position: relative;
      width: 100%;
      .el-form-item {
        width: 240px;
        margin-right: 14px;
      }
    }
    &.header1 {
      box-sizing: border-box;
      width: 100%;
      padding-top: 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      font-size: 14px;
      ul {
        display: flex;
        flex: 1;
        box-sizing: border-box;
        height: 25px;
        padding-left: 0;
        font-size: 16px;
        li {
          display: flex;
          // width: 32px;
          margin-right: 24px;
          border-bottom: 2px solid #fff;
          cursor: pointer;
          .bottomLine {
            width: 100%;
            height: 2px;
            margin-top: 4px;
            background-color: var(--theme-card);
          }

          &.active {
            border-bottom: 2px solid var(--theme-primary);
            color: var(--theme-primary);
            .bottomLine {
              background-color: var(--theme-primary);
            }
          }
        }
      }
    }
    .divText {
      display: flex;
      align-items: center;
      height: 100%;
      font-weight: 500;
      font-size: 16px;
      color: #0b0b0a;
      span {
        margin-right: 15px;
        padding-right: 15px;
        border-right: 1px solid #d9d9d9;
        cursor: pointer;
        i {
          font-weight: 600;
          color: #378aff;
        }
      }
    }
  }

  .contentBottom {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    margin-top: 16px;
    padding: 0 24px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .tableContent {
      flex: 1;
      height: 0;
    }
  }
  .patientTimeline {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding-bottom: 23px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .fixe {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      box-sizing: border-box;
      width: 100%;
      height: 67px;
      padding: 24px;
      span {
        display: flex;
        align-items: center;
        padding-right: 26px;
        cursor: pointer;
        user-select: none;
        font-weight: 400;
        font-size: 14px;
        color: var(--el-color-primary);
        i {
          margin-right: 6px;
        }
      }
      h2 {
        display: inline-block;
        margin: 0;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-text);
      }
    }
    .plr16 {
      box-sizing: border-box;
      height: 244px;
      padding: 0 16px;
      :deep(.empty-body) {
        .emptyContent {
          .loading {
            font-size: 12px;
          }
          .emptyImg {
            img {
              width: 206px;
              height: auto;
              margin-bottom: 8px;
            }
          }
        }
        .pixel-spinner .pixel-spinner-inner {
          width: 5px;
          height: 5px;
          box-shadow:
            6px 6px  0 0,
            -6px -6px  0 0,
            6px -6px  0 0,
            -6px 6px  0 0,
            0 6px  0 0,
            6px 0  0 0,
            -6px 0  0 0,
            0 -6px 0 0;
        }

        @keyframes pixel-spinner-animation {
          50% {
            box-shadow:
              9px 9px 0 0,
              -9px -9px 0 0,
              9px -9px 0 0,
              -9px 9px 0 0,
              0 4px 0 0,
              4px 0 0 0,
              -4px 0 0 0,
              0 -4px 0 0;
          }
          75% {
            box-shadow:
              9px 9px 0 0,
              -9px -9px 0 0,
              9px -9px 0 0,
              -9px 9px 0 0,
              0 4px 0 0,
              4px 0 0 0,
              -4px 0 0 0,
              0 -4px 0 0;
          }
          100% {
            transform: rotate(360deg);
          }
        }
      }
    }
    .timeline {
      background-color: var(--theme-card);
    }
  }
}
</style>
