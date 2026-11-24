<template>
  <div class="authenticationApplication">
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
    </div>
    <div class="content">
      <ApplicationManagement v-if="activeTab===1"></ApplicationManagement>
      <ApplicationOperationLog v-if="activeTab===2"></ApplicationOperationLog>
    </div>
  </div>
</template>
<script setup name="authenticationApplication">
import { ref } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import ApplicationManagement from '@/components/manage/components/applicationManagement.vue'
import ApplicationOperationLog from '@/components/manage/components/applicationOperationLog.vue'
const route = useRoute()
const tabs = ref([
  {
    label: '应用管理',
    value: 1
  },
  {
    label: '操作日志',
    value: 2
  }
])
const activeTab = ref(1)
activeTab.value = route.query.index - 0 || 1
const handleClickTab = (index) => {
  activeTab.value = index
  router.push({
    path: '/manage/authenticationApplication',
    query: {
      index
    }
  })
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

.authenticationApplication {
  display: flex;
  overflow: hidden;
  z-index: 0;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px 20px;
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
      padding: 0 26px 0 33px;
      font-size: 16px;

      li {
        display: flex;
        position: relative;
        flex-direction: column;
        width: auto;
        margin-right: 42px;
        cursor: pointer;
        font-weight: 400;
        font-size: 16px;
        color: var(--theme-text-2);
        &.active {
          font-weight: 500;
          font-size: 16px;
          // color: var(--theme-text);
          color: var(--theme-primary);
          .bottomLine {
            position: absolute;
            left: 50%;
            bottom: 0;
            width: 67px;
            height: 3px;
            background: var(--theme-primary);
            transform: translateX(-50%);
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
