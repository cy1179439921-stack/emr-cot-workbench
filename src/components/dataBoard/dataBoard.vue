<template>
  <div :class="{dataBoard:true, dark:(modeStore.mode==='dark'),extraDark:(modeStore.mode==='dark'&&activeTab===4),light:(modeStore.mode==='light')}">
    <div class="topNav">
      <ul>
        <li
          v-for="(item, index) in tabs"
          :key="item.value"
          class="flexCenter"
          :class="{ active: activeTab === item.value }"
          @click="handleClickTab(item.value)"
        >
          <div>{{ item.label }}</div>
          <div class="bottomLine" :class="'bottomLine' + index"></div>
        </li>
      </ul>
      <div class="mode">
        <div class="lightMode" @click="handleMode('light')">普通模式</div>
        <div class="darkMode" @click="handleMode('dark')">暗黑模式</div>
      </div>
    </div>
    <div class="content">
      <DataBoardIndex v-if="activeTab===1"></DataBoardIndex>
      <DataBoardBasic v-if="activeTab===2"></DataBoardBasic>
      <DataBoardDisease v-if="activeTab===3"></DataBoardDisease>
      <DataMonitoring v-if="activeTab===4"></DataMonitoring>
    </div>
    <img :src="Halo1" v-if="modeStore.mode==='dark'&&activeTab !== 4" alt="" class="Halo Halo1">
    <img :src="Halo2" v-if="activeTab == 1 && modeStore.mode==='dark'" alt="" class="Halo Halo2">
    <img :src="Halo3" v-if="modeStore.mode==='dark'&&activeTab !== 4" alt="" class="Halo Halo3">
  </div>
</template>
<script setup name="dataBoard">
import { ref } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import { useModeStore } from '@/store/modeStore'
import DataBoardIndex from '@/components/dataBoard/dataBoardIndex.vue'
import DataBoardBasic from '@/components/dataBoard/dataBoardBasic.vue'
import DataBoardDisease from '@/components/dataBoard/dataBoardDisease.vue'
import DataMonitoring from '@/components/dataBoard/dataMonitoring.vue'
import Halo1 from '@/assets/Halo1.png'
import Halo2 from '@/assets/Halo2.png'
import Halo3 from '@/assets/Halo3.png'
const modeStore = useModeStore()
const route = useRoute()
const tabs = ref([
  {
    label: '首页',
    value: 1
  },
  {
    label: '住院数据监测',
    value: 4
  },
  {
    label: '基本数据统计表',
    value: 2
  },
  {
    label: '病种数据统计表',
    value: 3
  }
])
const activeTab = ref(1)
activeTab.value = route.query.index - 0 || 1
const handleClickTab = (index) => {
  activeTab.value = index
  router.push({
    path: '/dataBoard',
    query: {
      index
    }
  })
}
const handleMode = (val) => {
  modeStore.setMode(val)
}
</script>
<style lang="scss" scoped>
:deep(.el-button),
:deep(.el-radio-button__inner),
:deep(.el-select__wrapper),
:deep(.el-input__wrapper),
:deep(.el-radio-button__inner) {
  transition: none;
}

.dataBoard {
  display: flex;
  overflow: hidden;
  z-index: 0;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 14px 20px;
  .topNav {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    // width: 100%;
    height: 58px;
    margin-bottom: 0;
    margin-bottom: 16px;
    padding-right: 16px;
    border-radius: 8px;
    background: var(--theme-card);

    ul {
      display: flex;
      flex: 1;
      box-sizing: border-box;
      height: 100%;
      padding: 0 26px 0 42px;
      font-size: 16px;

      li {
        display: flex;
        flex-direction: column;
        width: auto;
        margin-right: 42px;
        cursor: pointer;
        &.active {
          color: var(--theme-text);
          .bottomLine {
            position: absolute;
            left: 50%;
            bottom: 0;
            height: 3px;
            transform: translateX(-50%);
            &.bottomLine0 {
              width: 50px;
            }
            &.bottomLine1 {
              width: 96px;
            }
            &.bottomLine2 {
              width: 112px;
            }
            &.bottomLine3 {
              width: 112px;
            }
          }
        }
      }
    }
  }
  &.dark {
    padding: 0;
    padding-bottom: 16px;
    background: radial-gradient(circle at center, #1d2656 0%, #04020f 65%);
    :deep(.el-scrollbar__thumb) {
      background: #595f7b !important;
    }
    // &.extraDark {
    //   background: #0b0c21;
    // }
    .topNav {
      margin: 16px;
      border: 1px solid rgba(129, 167, 255, 0.1);
      background: rgba(129, 167, 255, 0.1);
      ul {
        display: flex;
        flex: 1;
        box-sizing: border-box;
        height: 100%;
        li {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: auto;
          margin-right: 42px;
          cursor: pointer;
          line-height: 22px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          .label {
            display: flex;
            align-items: center;
            height: 100%;
          }
          &.active {
            position: relative;
            font-weight: 500;
            font-size: 16px;
            color: #fff;
            .bottomLine {
              background-color: var(--theme-card);
            }
          }
        }
      }
      .mode {
        display: flex;
        align-items: center;
        .lightMode,
        .darkMode {
          display: flex;
          position: relative;
          z-index: 2;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          width: 88px;
          height: 32px;
          border-radius: 2px;
          cursor: pointer;
          text-align: center;
          font-size: 14px;
          color: var(--theme-text-2);
        }
        .lightMode {
          border: 1px solid rgba(255, 255, 255, 0.19);
          border-right: 0;
          border-radius: 2px 0 0 2px;
          color: rgba(255, 255, 255, 0.6);
        }
        .darkMode {
          border: 1px solid var(--theme-primary);
          border-left: 0;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          background: var(--theme-primary);
          color: #fff;
        }
      }
    }
  }
  &.light {
    padding: 0;
    padding-bottom: 16px;
    // background: linear-gradient(139deg, #ebeff2 0%, #f0f8ff 51%, #d5dbf3 100%);
    background: var(--theme-bg)#f0f3f8;
    .topNav {
      margin: 16px;
      ul {
        display: flex;
        flex: 1;
        box-sizing: border-box;
        height: 100%;
        li {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: auto;
          margin-right: 42px;
          cursor: pointer;
          line-height: 22px;
          font-size: 16px;
          color: var(--theme-text-2);
          .label {
            display: flex;
            align-items: center;
            height: 100%;
          }
          &.active {
            position: relative;
            font-weight: 500;
            font-size: 16px;
            color: var(--theme-primary);
            .bottomLine {
              background-color: var(--theme-primary);
            }
          }
        }
      }
      .mode {
        display: flex;
        align-items: center;
        .lightMode,
        .darkMode {
          display: flex;
          position: relative;
          z-index: 2;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          width: 88px;
          height: 32px;
          border-radius: 2px;
          cursor: pointer;
          text-align: center;
          font-size: 14px;
          color: var(--theme-text-2);
        }
        .lightMode {
          border: 1px solid var(--theme-primary);
          border-radius: 2px 0 0 2px;
          color: var(--theme-primary);
        }
        .darkMode {
          border: 1px solid #d8d8d8;
          border-left: 0;
          background: var(--theme-card);
        }
      }
    }
  }
  .content {
    overflow: hidden;
    position: relative;
    z-index: 2;
    flex: 1;
    width: 100%;
  }
}
.Halo1 {
  position: fixed;
  left: -6%;
  bottom: -30%;
  width: 46.98%;
  height: auto;
  opacity: 0.7;
}
.Halo2 {
  position: fixed;
  right: 20%;
  top: 16.8%;
  width: 28%;
  height: auto;
  opacity: 0.5;
}
.Halo3 {
  position: fixed;
  right: -4%;
  top: -1.3%;
  width: 35%;
  height: auto;
  opacity: 0.7;
}
</style>
