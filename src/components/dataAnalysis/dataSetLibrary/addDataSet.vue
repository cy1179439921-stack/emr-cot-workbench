<template>
  <el-dialog
    v-model="dialogVisible"
    destroy-on-close
    :modal-class="resourceType===1&&step==2?'addDataSetDialog':''"
    :before-close="handleClose"
    :width="activeTab === 'researchQueue' ? dialogWidth : pxToRem(storkeWidth)"
    class="el-dialog-addDataSet"
  >

    <template #header="{ titleId, titleClass }">
      <div class="myHeader">
        <h4 :id="titleId" :class="titleClass">{{ isThreePartyDataSource ? '新增数据集' : '新增数据集' }}</h4>
        <div class="text">【数据集最大限制5万行*500列】</div>
        <!-- <el-button type="danger" @click="close">
          <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
        </el-button> -->
      </div>

    </template>

    <!-- 分类 -->
    <el-tabs v-model="activeTab" class="tabs" v-if="!strokeResult && !((step===4&&resourceType===1||step===3&&resourceType===2||step===3&&resourceType===3) || (isThreePartyDataSource && step===4) ) && step===2&&resourceType===1">
      <el-tab-pane label="研究队列" name="researchQueue"></el-tab-pane>
      <el-tab-pane label="脑卒中" name="stroke"></el-tab-pane>
    </el-tabs>

    <!-- 研究队列部分 -->
    <div v-show="activeTab === 'researchQueue'">
      <div v-if="isThreePartyDataSource && step!==4" >
        <el-form
          ref="localRuleFormDom"
          :model="ruleForm"
          :rules="rules"
          label-width="auto"
        >
          <el-form-item label="三方数据源" prop="source">
            <el-input
              class="h40"
              disabled
              maxlength="50"
              show-word-limit
              v-model="threeData.jsonName"
              placeholder="请填写内容" >
            </el-input>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input
              class="h40"
              maxlength="50"
              show-word-limit
              v-model.trim="ruleForm.name"
              placeholder="请填写内容" />
          </el-form-item>
          <el-form-item label="描述" prop="text">
            <el-input
              class="description"
              maxlength="60"
              show-word-limit
              resize='none'
              type="textarea"
              v-model="ruleForm.text"
              placeholder="请填写内容"
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="channelList" v-else-if='step===1'>
        <div v-for="(item,index) in channelList" :key="index" class="channelItem">
          <img class="icon" :src="item.logo" alt="">
          <div class="name">{{ item.name }}</div>
          <div class="text" v-if="index!==1">{{ item.text }}</div>
          <div v-if="index==1">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="item.text"
              placement="bottom"
              :open-delay="400"
              :enterable="false"
              :hide-after="0"
            >
              <div class="text">{{ item.text }}</div>
            </el-tooltip>
          </div>
          <div class="btn" @click="handleResoure(item.type)" v-if="item.type!=2">
            <img class="addImg" :src="channelAddImg" alt="">
            <span class="unselectable">添加</span>
          </div>
          <el-upload
            v-if="item.type==2"
            class="upload-demo"
            :auto-upload="false"
            accept=".csv,.xlsx,.xls,.json"
            action="#"
            :limit="1"
            :show-file-list="false"
            @change="uploadFile"
          >
            <div class="btn">
              <img class="addImg" :src="channelAddImg" alt="">
              <span class="unselectable">添加</span>
            </div>
          </el-upload>
        </div>
      </div>
      <div v-show="step===2&&resourceType===1" class="dataSourceContainer">
        <div class="listHeader">
          <div class="total">
            <span>共</span>
            <span class="num">{{ total }}</span>
            <span>个数据源</span>
          </div>
          <div>
            <commonInput
              class="searchInput"
              v-model="searchText"
              @input="handleSearch"
              placeholder="请填写平台数据源"
              clearable
            >
            </commonInput>
          </div>
        </div>
        <myTable
          ref="myTableRef"
          class="myTable"
          :tableData="tableData"
          :column="column"
          :pagination="false"
        >
          <template #queueNameSource="scope">
            <div class="radioContainer">
              <el-radio class="idRadio"
                        v-model="queueId"
                        :key="scope.row.queueId"
                        @change="handleChange(scope.row)"
                        :value="scope.row.queueId"></el-radio>
              <span>{{ scope.row.queueNameSource }}</span>
            </div>
          </template>
        </myTable>
      </div>
      <div v-if="step===3&&resourceType===1" >
        <el-form
          ref="platformRuleFormDom"
          :model="ruleForm"
          :rules="rules"
          label-width="auto"
        >
          <el-form-item label="平台数据源" prop="source">
            <el-input
              class="h40"
              disabled
              maxlength="50"
              show-word-limit
              v-model="ruleForm.queueName"
              placeholder="请填写内容" >
              <template #append><span class="reselect" @click="handleStep('up')">重新选择</span></template>
            </el-input>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input
              class="h40"
              maxlength="50"
              show-word-limit
              v-model.trim="ruleForm.name"
              placeholder="请填写内容" />
          </el-form-item>
          <el-form-item label="描述" prop="text">
            <el-input
              class="description"
              maxlength="60"
              show-word-limit
              resize='none'
              type="textarea"
              v-model="ruleForm.text"
              placeholder="请填写内容"
            />
          </el-form-item>
        </el-form>
      </div>
      <div v-if="step===2&&resourceType===2" >
        <el-form
          ref="localRuleFormDom"
          :model="ruleForm"
          :rules="rules"
          label-width="auto"
        >
          <el-form-item label="本地数据源" prop="source">
            <el-input
              class="h40"
              disabled
              maxlength="50"
              show-word-limit
              v-model="ruleForm.source"
              placeholder="请填写内容" >
              <template #append>
                <el-upload
                  class="upload-demo"
                  :auto-upload="false"
                  accept=".csv,.xlsx,.xls,.json"
                  action="#"
                  :limit="1"
                  :show-file-list="false"
                  @change="uploadFile"
                >
                  <span class="reselect">重新选择</span>
                </el-upload>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input
              class="h40"
              maxlength="50"
              show-word-limit
              v-model.trim="ruleForm.name"
              placeholder="请填写内容" />
          </el-form-item>
          <el-form-item label="描述" prop="text">
            <el-input
              class="description"
              maxlength="60"
              show-word-limit
              resize='none'
              type="textarea"
              v-model="ruleForm.text"
              placeholder="请填写内容"
            />
          </el-form-item>
        </el-form>
      </div>
      <div v-if="((step===4&&resourceType===1||step===3&&resourceType===2||step===3&&resourceType===3) || (isThreePartyDataSource && step===4) )&&isSuccess" class="uploadProgress">
        <el-progress
          class="myProgress"
          :percentage="percentage"
          :show-text="false"
          striped
          striped-flow
        />
        <div class="waitText">{{ isThreePartyDataSource ? '文件上传中，请稍等片刻...' : '文件上传中，请稍等片刻...'}}</div>
      </div>
      <div v-if="((step===4&&resourceType===1||step===3&&resourceType===2||step===3&&resourceType===3) || (isThreePartyDataSource && step===4) )&&!isSuccess" class="uploadFail">
        <img :src="uploadFail" alt="">
        <div class="failText">上传失败</div>
      </div>
      <div v-if="step===2&&resourceType===3" >
        <el-form
          label-position="top"
          ref="spaceFormDom"
          :model="ruleForm"
          :rules="rules"
        >
          <div class="notice" v-show="!isError">
            <i class="iconfont icon-tishi-tongyishujuyuan"></i>
            <span class="noticeTxt">三份不同格式文件要求为同一数据源。</span>
          </div>
          <div class="notice errorNotice" v-show="isError">
            <i class="iconfont icon-tishicuowu-butongshujuyuan"></i>
            <span class="noticeTxt">三份格式文件数据不为同一份数据源，请重新上传！</span>
          </div>
          <el-form-item label="空间自相关数据源" prop="sourceList">
            <template v-for="(item,index) in spaceConfig" :key="index">
              <el-upload
                class="spaceUpload"
                :auto-upload="false"
                ref="uploadDom"
                :accept="'.'+item.type"
                action="#"
                :limit="1"
                :show-file-list="false"
                @change="handleFile($event,item)"
              >
                <div class="spaceItem" @click="handleUpload(item.type)">
                  <img :src="item.icon" alt="">
                  <div class="label" v-if="!item.file">{{ item.label }}</div>
                  <div class="label" v-if="item.file">
                    {{ item.file.name}}
                  </div>
                  <div class="uploadBtn" v-if="!item.file">去上传</div>
                  <div class="uploadBtn" v-if="item.file">重新选择</div>
                </div>
              </el-upload>
            </template>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input
              class="h40"
              maxlength="50"
              show-word-limit
              v-model.trim="ruleForm.name"
              placeholder="请填写内容" />
          </el-form-item>
          <el-form-item label="描述" prop="text">
            <el-input
              class="description"
              maxlength="60"
              show-word-limit
              type="textarea"
              resize
              v-model="ruleForm.text"
              placeholder="请填写内容"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 脑卒中 -->
    <strokeStep v-show="activeTab ==='stroke' && !strokeResult" @handlerStrokeData = "handlerStrokeData" @handlerPrev="handleStep('up')"></strokeStep>
    <!-- 脑卒中结果页 -->
    <div v-if="activeTab ==='stroke' && strokeResult">
      <el-form ref="platformRuleFormDom" :model="ruleForm" :rules="rules" label-width="auto">
        <el-form-item label="平台数据源" prop="source">
          <el-input class="h40" disabled maxlength="50" show-word-limit v-model="ruleForm.queueName" placeholder="请填写内容" >
            <template #append><span class="reselect" @click="strokeResult = false">重新选择</span></template>
          </el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input class="h40" maxlength="50" show-word-limit v-model.trim="ruleForm.name" placeholder="请填写内容" />
        </el-form-item>
        <el-form-item label="描述" prop="text">
          <el-input class="description" maxlength="60" show-word-limit resize='none' type="textarea" v-model="ruleForm.text" placeholder="请填写内容"/>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer" :class="{'footerNone':(activeTab ==='stroke' && !strokeResult) || step===1}">
        <!-- 研究队列按钮 -->
        <template v-if="activeTab ==='researchQueue'">
          <template v-if="!isThreePartyDataSource">
            <el-button
              class="handleBtn"
              v-if="step===2||(step===3&&resourceType===1)"
              @click="handleStep('up')">上一步</el-button>
            <el-button
              class="handleBtn"
              v-if="step===2&&resourceType===1"
              type="primary"
              :disabled="!canSave"
              @click="handleStep('next')">下一步</el-button>
            <el-button
              class="handleBtn"
              type="primary"
              @click="handleSure"
              v-if="(step===3&&resourceType===1)||(step===2&&resourceType===2)||(step===2&&resourceType===3)">
              确&nbsp;定
            </el-button>
          </template>
          <el-button class="handleBtn" type="primary" @click="handleTreeSure" v-else-if="isThreePartyDataSource && step!==4">确&nbsp;定</el-button>
        </template>
        <!-- 脑卒中 -->
        <template v-if="activeTab ==='stroke' && strokeResult">
          <el-button class="handleBtn" @click="strokeResult = false">上一步</el-button>
          <el-button class="handleBtn" type="primary" @click="handleStrokeSure" >确&nbsp;定</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { echartsToPx } from '@/utils/utils.js'
import channelAddImg from '@/assets/channelAdd.png'
import { getPlatformDataSource, createDataSet, createTreeDataSet } from '@/api/api_dataAnalysis.js'
import lodash from 'lodash'
import { ElMessage } from 'element-plus'
import { useAnalysisStore } from '@/store/analysisStore.js'
import uploadFail from '@/assets/uploadFail.png'
import strokeStep from '@/components/dataAnalysis/dataSetLibrary/strokeStep.vue'
const props = defineProps({
  type: {
    type: [String, Number],
    default: ''
  }
})
const analysisStore = useAnalysisStore()
const emits = defineEmits(['updateList', 'handleClose'])
const dialogVisible = ref(false)
const isThreePartyDataSource = ref(false) // 是否是第三方数据源
const threeData = ref({})
const activeTab = ref('researchQueue') // 选项卡
const strokeResult = ref(false)
const storkeWidth = computed(() => { // 脑卒中弹框宽度
  return strokeResult.value ? 540 : 740
})

const handleDialog = (isThreePartyData = false, treeData = {}) => {
  dialogVisible.value = true
  // 是否是三方数据源
  if (isThreePartyData) {
    isThreePartyDataSource.value = true
    threeData.value = treeData
  }
}
const step = ref(1)
const channelList = ref([
  {
    name: '平台数据源',
    logo: new URL(`/src/assets/addDataSetImg1.png`, import.meta.url).href,
    text: '*从同账号下IDL平台直接获取',
    type: 1
  },
  {
    name: '本地数据源',
    logo: new URL(`/src/assets/addDataSetImg2.png`, import.meta.url).href,
    text: '*目前支持csv、xlsx、xls、json格式',
    type: 2
  },
  {
    name: '空间自相关数据源',
    logo: new URL(`/src/assets/addDataSetImg3.png`, import.meta.url).href,
    text: '*需上传shp、dbf、shx文件',
    type: 3
  }
])
const resourceType = ref('')
const dialogWidth = ref(echartsToPx(539))
const handleResoure = (type) => {
  resourceType.value = type
  if (type === 1) {
    getPlatformSrouceDataFn()
  }
  handleStep('next')
  searchText.value = ''
}
const total = ref(0)

const searchText = ref('')
const handleSearch = () => {
  const newArr = lodash.filter(initTableData.value, (o) => {
    return o.queueNameSource.includes(searchText.value)
  })
  tableData.value = newArr || []
  // total.value = tableData.value.length
}
const initTableData = ref([])
const tableData = ref([])
const column = ref([
  { label: '平台数据源', value: 'queueNameSource', fixed: 'left', html: true, minWidth: 160 },
  { label: '来源研究队列', value: 'queueName', fixed: 'left' },
  { label: '数据量', value: 'medicalRecordSum', fixed: 'left' },
  { label: '指标数', value: 'indexSum', fixed: 'left', width: 80 }
])
const queueId = ref('')
const canSave = ref(true)
const handleChange = (obj) => {
  ruleForm.value.queueName = obj?.queueNameSource
  if (Number(obj?.medicalRecordSum)) {
    canSave.value = true
  } else {
    canSave.value = false
  }
}
const getPlatformSrouceDataFn = () => {
  getPlatformDataSource().then(res => {
    if (res.code === 10000) {
      initTableData.value = res.data || []
      tableData.value = res.data || []
      total.value = tableData.value.length
    }
  })
}
const validateArray = (rule, value, callback) => {
  if (value?.length === 3) {
    callback()
  } else if (!value || value?.length === 0) {
    callback(new Error('请选择文件'))
  } else {
    callback(new Error('请选择全部对应的文件'))
  }
}
const rules = reactive({
  name: [
    { required: true, message: '请填写名称', trigger: 'blur' },
    { max: 50, message: '最长50个字', trigger: 'blur' }
  ],
  sourceList: [
    { required: true, validator: validateArray, trigger: 'blur' }
  ]
})
const ruleForm = ref({
  name: '',
  text: '',
  source: '',
  sourceList: []
})
const handleStep = (type) => {
  activeTab.value = 'researchQueue'
  if (type === 'up') {
    step.value = step.value - 1
  } else {
    if (resourceType.value === 1 && step.value === 2 && !queueId.value) {
      ElMessage.warning('请选择平台数据源')
      return
    }
    step.value = step.value + 1
  }
  const stepAndType = `${resourceType.value}-${step.value}`
  switch (stepAndType) {
    case '1-1':
      dialogWidth.value = echartsToPx(539)
      break
    case '1-2':
      dialogWidth.value = echartsToPx(740)
      break
    case '1-3':
      dialogWidth.value = echartsToPx(539)
      break
    case '2-1':
      dialogWidth.value = echartsToPx(539)
      break
    case '2-2':
      dialogWidth.value = echartsToPx(539)
      break
    case '2-3':
      dialogWidth.value = echartsToPx(470)
      break
    case '3-2':
      dialogWidth.value = echartsToPx(539)
      break
    case '3-3':
      dialogWidth.value = echartsToPx(539)
      break
  }
}
const fileInfo = ref('')
const uploadFile = (file, fileList) => {
  resourceType.value = 2
  step.value = 1
  fileInfo.value = file
  ruleForm.value.source = file.name
  handleStep('next')
}
const spaceConfig = ref([
  {
    label: '上传 .shp 格式数据',
    icon: new URL(`/src/assets/shp.png`, import.meta.url).href,
    type: 'shp'
  },
  {
    label: '上传 .dbf格式数据',
    icon: new URL(`/src/assets/dbf.png`, import.meta.url).href,
    type: 'dbf'
  },
  {
    label: '上传 .shx 格式数据',
    icon: new URL(`/src/assets/shx.png`, import.meta.url).href,
    type: 'shx'
  }
])
const uploadDom = ref('')
const handleUpload = (type) => {
  console.log('上传的文件类型', type)
}
const handleFile = (file, obj) => {
  if (obj.file) {
    ruleForm.value.sourceList.forEach((item, index) => {
      if (item.name.includes(obj.type)) {
        obj.file = file.raw
        ruleForm.value.sourceList.splice(index, 1, file.raw)
      }
    })
  } else {
    obj.file = file.raw
    ruleForm.value.sourceList.push(file.raw)
  }
  switch (obj.type) {
    case 'shp':
      uploadDom.value[0].clearFiles()
      break
    case 'dbf':
      uploadDom.value[1].clearFiles()
      break
    case 'shx':
      uploadDom.value[2].clearFiles()
      break
  }
}
const platformRuleFormDom = ref('')
const localRuleFormDom = ref('')
const spaceFormDom = ref('')
const isError = ref(false)
const percentage = ref(0)
const interval = ref('')
const isSuccess = ref(true)
const handleSure = () => {
  const newFormData = new FormData()
  const formm = {
    dataSource: resourceType.value,
    queueId: queueId.value,
    pid: props.type === '2' ? 0 : analysisStore.pid,
    describe: ruleForm.value.text,
    name: ruleForm.value.name,
    type: 2,
    level: ''
  }
  newFormData.append('dataSetSaveAO', new Blob([JSON.stringify(formm)], { type: 'application/json' }))
  if (resourceType.value === 1) {
    platformRuleFormDom.value.validate((valid) => {
      if (valid) {
        newFormData.append('files', '')
        createDataSet(newFormData).then(res => {
          if (res.code === 10000) {
            clearInterval(interval.value)
            percentage.value = 100
            nextTick(() => {
              setTimeout(() => {
                emits('updateList')
                ElMessage.success('创建成功')
                dialogVisible.value = false
              }, 1000)
            })
          } else {
            clearInterval(interval.value)
            isSuccess.value = false
          }
        })
        step.value = 4
        interval.value = setInterval(() => {
          if (percentage.value >= 90) {
            percentage.value = 90
          } else {
            percentage.value += 3
          }
        }, 400)
      }
    })
  } else if (resourceType.value === 2) {
    localRuleFormDom.value.validate((valid) => {
      if (valid) {
        newFormData.append('files', fileInfo.value?.raw)
        createDataSet(newFormData).then(res => {
          if (res.code === 10000) {
            clearInterval(interval.value)
            percentage.value = 100
            nextTick(() => {
              setTimeout(() => {
                emits('updateList')
                ElMessage.success('创建成功')
                dialogVisible.value = false
              }, 1000)
            })
          } else {
            ElMessage({
              message: res.msg,
              type: 'error'
            })
            clearInterval(interval.value)
            isSuccess.value = false
          }
        })
        step.value = 3
        interval.value = setInterval(() => {
          if (percentage.value >= 90) {
            percentage.value = 90
          } else {
            percentage.value += 3
          }
        }, 400)
      }
    })
  } else if (resourceType.value === 3) {
    spaceFormDom.value.validate((valid) => {
      if (valid) {
        ruleForm.value.sourceList.forEach(item => {
          newFormData.append('files', item)
        })
        createDataSet(newFormData).then(res => {
          if (res.code === 10000) {
            clearInterval(interval.value)
            percentage.value = 100
            nextTick(() => {
              setTimeout(() => {
                emits('updateList')
                ElMessage.success('创建成功')
                dialogVisible.value = false
              }, 1000)
            })
          } else {
            // isError.value = true
            clearInterval(interval.value)
            isSuccess.value = false
          }
        })
        step.value = 3
        interval.value = setInterval(() => {
          if (percentage.value >= 90) {
            percentage.value = 90
          } else {
            percentage.value += 3
          }
        }, 400)
      }
    })
  }
}

const handleTreeSure = () => {
  const { dataRows, dataColumns, jsonPath } = threeData.value

  if (lodash.isNaN(Number(dataRows)) || lodash.isNaN(Number(dataColumns))) {
    console.log('参数异常', dataRows, dataColumns)
    ElMessage.error('获取参数异常')
    return
  }

  if (Number(dataRows) > 50000 || Number(dataColumns) > 500) {
    ElMessage.error('超过最大行列数限制，请重新选择')
    return
  }

  const formm = {
    fileUrl: jsonPath,
    pid: 0,
    describe: ruleForm.value.text,
    name: ruleForm.value.name
  }
  localRuleFormDom.value.validate((valid) => {
    if (valid) {
      createTreeDataSet(formm).then(res => {
        if (res.code === 10000) {
          clearInterval(interval.value)
          percentage.value = 100
          nextTick(() => {
            setTimeout(() => {
              emits('updateList')
              ElMessage.success('创建成功')
              dialogVisible.value = false
            }, 1000)
          })
        } else {
          ElMessage({
            message: res.msg,
            type: 'error'
          })
          clearInterval(interval.value)
          isSuccess.value = false
        }
      })
      step.value = 4
      interval.value = setInterval(() => {
        if (percentage.value >= 90) {
          percentage.value = 90
        } else {
          percentage.value += 3
        }
      }, 400)
    }
  })
}

// 脑卒中数据
const handlerStrokeData = (data) => {
  const name = ruleForm.value.name
  ruleForm.value = data
  ruleForm.value.name = name
  strokeResult.value = true
}
// 脑卒中确定
const handleStrokeSure = () => {
  platformRuleFormDom.value.validate((valid) => {
    if (valid) {
      const newFormData = new FormData()
      const form = {
        dataSource: 6,
        queueId: queueId.value,
        pid: props.type === '2' ? 0 : analysisStore.pid,
        describe: ruleForm.value.text,
        name: ruleForm.value.name,
        type: 2,
        level: '',
        jcwParams: {
          ...ruleForm.value,
          name: undefined,
          describe: undefined
        }
      }
      newFormData.append('dataSetSaveAO', new Blob([JSON.stringify(form)], { type: 'application/json' }))
      createDataSet(newFormData).then(res => {
        if (res.code === 10000) {
          clearInterval(interval.value)
          percentage.value = 100
          nextTick(() => {
            setTimeout(() => {
              emits('updateList')
              ElMessage.success('创建成功')
              dialogVisible.value = false
            }, 1000)
          })
        } else {
          // isError.value = true
          clearInterval(interval.value)
          isSuccess.value = false
        }
      })
      dialogWidth.value = echartsToPx(539)
      activeTab.value = 'researchQueue'
      strokeResult.value = false
      step.value = 3
      resourceType.value = 3
      interval.value = setInterval(() => {
        if (percentage.value >= 90) {
          percentage.value = 90
        } else {
          percentage.value += 3
        }
      }, 400)
    }
  })
}

const handleClose = (done) => {
  emits('handleClose')
  done()
}
defineExpose({
  handleDialog
})
</script>
<style scoped lang="scss">
.tabs {
  margin-top: -6px;
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
  :deep(.el-tabs__item) {
    font-weight: 400;
    &.is-active {
      font-weight: 500;
    }
  }
}
.description {
  height: 94px !important;
  :deep(textarea) {
    height: 100% !important;
  }
}
.channelList {
  display: flex;
  .channelItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 153px;
    height: 217px;
    margin-right: 16px;
    border: 1px solid #e9e9e9;
    border-radius: 2px;
    &:nth-of-type(3) {
      margin-right: 0;
    }
    .icon {
      width: 40px;
      height: 40px;
      margin: 27px auto 0;
    }
    .name {
      margin: 10px auto 5px;
      line-height: 20px;
      font-weight: 500;
      font-size: 14px;
      color: #3d3d3d;
    }
    .text {
      display: -webkit-box;
      overflow: hidden;
      padding: 0 27px;
      -webkit-line-clamp: 2; /* 定义显示的最大行数 */
      text-overflow: ellipsis;
      text-align: center;
      font-weight: 400;
      font-size: 12px;
      color: var(--theme-text-3);
      -webkit-box-orient: vertical;
    }
    .btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 84px;
      height: 29px;
      margin-top: 17px;
      border-radius: 2px;
      background: rgba(54, 112, 248, 0.1);
      cursor: pointer;
      .addImg {
        width: 12px;
        height: 12px;
        margin-right: 3px;
      }
      span {
        line-height: 16px;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-primary);
      }
    }
    :deep(.el-upload-list) {
      margin: 0 !important;
    }
  }
}
.dataSourceContainer {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 422px;
  :deep(.myTable) {
    flex: 1;
  }
  .listHeader {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    .total {
      flex: 1;
      span {
        line-height: 19px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text);
      }
      .num {
        color: var(--theme-primary);
      }
    }
  }
}
.reselect {
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  color: var(--theme-primary);
}

.notice {
  display: flex;
  align-items: center;
  height: 40px;
  margin-bottom: 16px;
  padding: 0 16px;
  border: 1px solid rgba(54, 112, 248, 0.5);
  border-radius: 2px;
  background: rgba(54, 112, 248, 0.05);

  &.errorNotice {
    border: 1px solid rgba(255, 78, 78, 0.5);
    background: rgba(255, 78, 78, 0.05);
    .iconfont {
      color: #ff4e4e;
    }
  }
  .iconfont {
    color: var(--theme-primary);
  }
  span {
    margin-left: 8px;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text);
  }
}
.spaceUpload {
  width: 100%;
  &:nth-of-type(3) {
    .spaceItem {
      margin-bottom: 0;
    }
  }
  :deep(.el-upload) {
    width: 100%;
  }
}
.spaceItem {
  display: flex;
  align-items: center;
  width: 100%;
  height: 73px;
  margin-bottom: 12px;
  padding: 0 30px 0 16px;
  background: var(--theme-fill);

  img {
    width: 32px;
    height: 34px;
    margin-right: 12px;
  }
  .label {
    flex: 1;
    line-height: 20px;
    font-size: 14px;
    color: var(--theme-text);
  }
  .uploadBtn {
    font-size: 14px;
    color: var(--theme-primary);
  }
}
.radioContainer {
  display: flex;
  align-items: center;
}
.idRadio {
  margin-right: 8px;
}
:deep(.el-form-item:nth-last-of-type(1)) {
  margin-bottom: 0;
}
:deep(.el-form-item__label) {
  align-items: center;
  height: 40px;
}
.uploadProgress {
  padding: 46px 63px 48px 63px;
  .myProgress {
    height: 6px;
  }
  .waitText {
    margin-top: 22px;
    line-height: 20px;
    text-align: center;
    font-size: 14px;
    color: var(--theme-text);
  }
  :deep(.el-progress-bar__outer) {
    background-color: var(--theme-fill);
  }
}
.uploadFail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 22px;
  padding-bottom: 42px;
  img {
    width: 50px;
    margin-bottom: 8px;
  }
  .failText {
    line-height: 20px;
    font-weight: 500;
    font-size: 14px;
    color: var(--theme-text);
  }
}
.searchInput {
  width: 230px;
}
.myHeader {
  display: flex;
  align-items: center;
  h4 {
    margin: 0;
    line-height: 23px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
  }
  .text {
    margin-left: 3px;
    line-height: 20px;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-3);
  }
}
.mt16 {
  margin-top: 16px;
}
</style>
<style lang="scss">
.el-dialog__footer:has(.footerNone) {
  display: none !important;
}
.el-overlay .el-dialog-addDataSet {
  .el-dialog__header {
    padding-bottom: 16px !important;
  }
}
.el-tabs__nav-wrap::after {
  height: 1px !important;
}
</style>

