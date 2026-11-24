<template>
  <div class="main-header">
    <div class="header-left" @click="lookInfo">
      <span class="title">当前工程：</span>
      <img class="img1" :src="engineeringLogo">
      <div class="text">
        <CommonTooltip :content="propsEngineeringInfo.name">
          <span>{{ propsEngineeringInfo.name }}</span>
        </CommonTooltip>
      </div>
      <img class="img2" :src="exclamation">
    </div>
    <div class="tabsDiv">
      <ul>
        <template v-for="item in tabs" :key="item.value">
          <li :class="{'active': activeTabName === item.value}" @click="handleClickTab(item.value)" v-if="item.show">
            <div>{{item.label}}</div>
            <div class="bottomLine" ></div>
          </li>
        </template>
      </ul>
    </div>
    <el-button type="primary" @click="emits('viewDataSet',{...engineeringInfo,isProject:true})" v-if="!needCheckPermission || hadPermissionList.includes('查看原始数据集')">查看原始数据集</el-button>
    <el-dialog v-model="dialogShow" v-if="dialogShow" title="工程信息" class="new_Dialog" :width="pxToRem(426)">
      <div class="info-item">
        <div class="info-item-title">工程名称:</div>
        <div class="info-item-content" v-if="!editStatus">
          <span class="text" v-if="localEngineeringInfo.name">{{localEngineeringInfo.name}}</span>
          <i class="iconfont icon-bianji2" @click="editName" v-if="!needCheckPermission || hadPermissionList.includes('编辑')"></i>
        </div>
        <el-input
          ref="inputName"
          v-model="projectName"
          placeholder="请填写工程名称"
          @blur="handleSubmit"
          maxlength="50"
          show-word-limit
          v-else
        ></el-input>
      </div>
      <div class="info-item">
        <div class="info-item-title">最近节点:</div>
        <div class="info-item-content">{{localEngineeringInfo.node || '-'}}</div>
      </div>
      <div class="info-time">
        <div class="info-item">
          <div class="info-item-title">创建时间:</div>
          <div class="info-item-content">{{localEngineeringInfo.createTime}}</div>
        </div>
        <div class="info-item">
          <div class="info-item-title">上次操作时间:</div>
          <div class="info-item-content">{{localEngineeringInfo.operatorTime}}</div>
        </div>
      </div>
      <div class="info-item">
        <div class="info-item-title">描述:</div>
        <div class="info-item-content" v-if="!editStatus2">
          <span class="text">{{localEngineeringInfo.describe || '暂无描述'}}</span>
          <i class="iconfont icon-bianji2" @click="editDescription" v-if="!needCheckPermission || hadPermissionList.includes('编辑')"></i>
        </div>
        <el-input
          type="textarea"
          ref="inputDescription"
          autosize
          placeholder="请填写描述"
          v-model="description"
          maxlength="60"
          show-word-limit
          @blur="handleSubmit"
          v-else
        ></el-input>
      </div>
      <div class="info-item">
        <div class="info-item-title marginB11">引用数据集:</div>
        <div class="info-item-content">
          <span class="datasetName" v-if="engineeringInfo.dataSetName"><i class="iconfont icon-shujuji"></i>{{engineeringInfo.dataSetName}}</span>
          <span class="datasetName nullDatasetName" v-else><i class="iconfont icon-shujuji"></i></span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
defineOptions({
  name: 'EngineeringFrameHeader',
  inheritAttrs: false
})
import { ref, nextTick, computed } from 'vue'
import engineeringLogo from '@/assets/dataSet.png'
import { editProject, getProjectDetail } from '@/api/api_dataAnalysis.js'
import exclamation from '@/assets/tanhao.png'
import { ElMessage } from 'element-plus'
const emits = defineEmits(['handleClickTab', 'updateList', 'updateName', 'viewDataSet'])
import { useAnalysisStore } from '@/store/analysisStore.js'
const analysisStore = useAnalysisStore()
const props = defineProps({
  engineeringInfo: {
    type: Object
  },
  needCheckPermission: {
    type: Boolean,
    default: false
  },
  hadPermissionList: {
    type: Array,
    default: () => []
  },
  otherPermissions: {
    type: Array,
    default: () => []
  }
})
const propsEngineeringInfo = computed(() => {
  return props.engineeringInfo
})
// 判断有无工程首页查看权限
// const requiredPermissions = [
//   '数据可视化', '数据编辑', '空值处理', '异常值处理', '生成变量',
//   '对照组切分', '数据筛选', '数据变换', '变量变换', '数据标准化', '比例抽样',
//   '单变量调整', '变量间滞后调整', '描述性分析', '差异性分析', '相关性分析',
//   '回归分析', '生存分析', '时间序列模型', '空间分析', '传统机器学习',
//   '人工神经网络'
// ]

// const hasEngineerHomePermission = computed(() => {
//   return requiredPermissions.some(permission => props.hadPermissionList.includes(permission))
// })
const localEngineeringInfo = ref({
  name: propsEngineeringInfo.value.name,
  describe: '',
  createTime: '',
  operatorTime: '',
  node: ''
})
// localEngineeringInfo.value.name = props.engineeringInfo.name
const initialName = ref('') // 存储初始名称
const initialDescription = ref('')
const dialogShow = ref(false)
const editStatus = ref(false)
const editStatus2 = ref(false)
const projectName = ref('')
const description = ref('')
const inputName = ref(null)
const inputDescription = ref(null)
const tabs = ref([
  {
    label: '工程首页',
    value: 'engineeringHomePage',
    // show: hasEngineerHomePermission.value
    show: true
  },
  // {
  //   label: '全景脉络',
  //   value: 'diagram'
  // },
  {
    label: '操作日志',
    value: 'operationLog',
    show: props.otherPermissions.includes('查看') || props.hadPermissionList.includes('跳转')
  }
])
const activeTabName = ref('engineeringHomePage')

const handleClickTab = (value) => {
  activeTabName.value = value
  emits('handleClickTab', value)
}
const setTab = (value) => {
  activeTabName.value = value
}

const getInfoData = () => {
  const params = {
    id: props.engineeringInfo.id
  }
  getProjectDetail(params).then(res => {
    if (res.code === 10000) {
      localEngineeringInfo.value = res.data
      initialName.value = res.data.name
      initialDescription.value = res.data.describe
      emits('updateName', { id: res.data.id, name: res.data.name })
    }
  })
}

const lookInfo = () => {
  dialogShow.value = true
  getInfoData()
}

const sendEditRequest = (params) => {
  editProject(params).then(res => {
    if (res.code === 10000) {
      getInfoData()
      emits('updateList')
    }
  })
}

const editName = () => {
  editStatus.value = true
  projectName.value = localEngineeringInfo.value.name
  nextTick(() => {
    if (inputName.value) {
      inputName.value.focus()
    }
  })
}
const editDescription = () => {
  editStatus2.value = true
  description.value = localEngineeringInfo.value.describe
  nextTick(() => {
    if (inputDescription.value) {
      inputDescription.value.focus()
    }
  })
}
const handleSubmit = () => {
  if (editStatus.value && projectName.value !== initialName.value) {
    if (projectName.value === '') {
      ElMessage.error('工程名称不能为空')
      projectName.value = initialName.value
      editStatus.value = false
      return false
    }
    localEngineeringInfo.value.name = projectName.value
    const params = {
      id: localEngineeringInfo.value.id,
      pid: analysisStore.pid || 0,
      describe: localEngineeringInfo.value.describe,
      name: projectName.value
    }
    sendEditRequest(params)
    initialName.value = projectName.value
  }
  if (editStatus2.value && description.value !== initialDescription.value) {
    localEngineeringInfo.value.describe = description.value
    const params = {
      id: localEngineeringInfo.value.id,
      pid: analysisStore.pid || 0,
      describe: description.value,
      name: localEngineeringInfo.value.name
    }
    sendEditRequest(params)
    initialDescription.value = description.value
  }
  editStatus.value = false
  editStatus2.value = false
  projectName.value = ''
  description.value = ''
}
defineExpose({
  setTab
})

</script>
<style scoped lang="scss">
.main-header {
  position: relative;
  box-sizing: border-box;
  height: 64px;
  padding: 0 24px;
  border-radius: 8px;
  background-color: var(--theme-card);

  @include childrenBetween();
  .header-left {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 30px;
    cursor: pointer;
    font-size: 16px;
    color: var(--theme-text);
    .title {
      font-weight: 500;
    }
    .img1 {
      width: 18px;
      margin-left: 3px;
      margin-right: 9px;
    }
    .img2 {
      width: 17px;
      margin-left: 4px;
      cursor: pointer;
    }
    .text {
      display: flex;
      max-width: 174px;
    }
  }
  .tabsDiv {
    display: flex;
    position: absolute;
    left: 50%;
    height: 44px;
    margin: 0 auto;
    margin-top: 20px;
    transform: translateX(-50%);
    ul {
      display: flex;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      font-size: 16px;
      li {
        display: flex;
        position: relative;
        flex-direction: column;
        align-items: center;
        margin-right: 32px;
        cursor: pointer;
        div:nth-child(1) {
          display: flex;
          align-items: center;
          height: 23px;
          font-weight: 400;
          font-size: 16px;
          color: var(--theme-text-2);
        }
        .bottomLine {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 3px;
          background-color: var(--theme-card);
        }
        &.active {
          div:nth-child(1) {
            font-weight: 500;
            font-size: 16px;
            color: var(--theme-primary);
          }
          .bottomLine {
            background-color: var(--theme-primary);
          }
        }
      }
    }
  }
  :deep(.new_Dialog) {
    .el-dialog__body {
      .info-time {
        display: flex;
        .info-item {
          flex: 1;
        }
      }
      .info-item {
        margin-bottom: 20px;
        .info-item-title {
          margin-bottom: 8px;
          line-height: 20px;
          font-weight: 500;
          font-size: 14px;
          color: var(--theme-text);
          &.marginB11 {
            margin-bottom: 11px;
          }
        }
        .el-input {
          .el-input__wrapper {
            height: 40px;
            line-height: 40px;
          }
        }
        .el-textarea {
          .el-textarea__inner {
            min-height: 80px !important;
          }
        }
        .info-item-content {
          line-height: 22px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-2);
          .text {
            padding-right: 10px;
          }
          .icon-bianji2 {
            cursor: pointer;
            font-size: 12px;
            color: var(--theme-primary);
          }
          .datasetName {
            display: inline-block;
            height: 25px;
            padding: 0 10px;
            border-radius: 2px;
            background-color: #e6f4ef;
            line-height: 25px;
            font-size: 14px;
            color: #04a273;
            i {
              margin-right: 8px;
              font-size: 13px;
            }
            &.nullDatasetName {
              i {
                margin-right: 0;
                opacity: 0.3;
              }
            }
          }
        }
      }
      .info-time:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
