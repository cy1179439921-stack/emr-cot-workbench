<template>
  <div class="researchQueue">
    <dialogReidentify :currentData="curData" @reidentify="reidentify" v-if="isReidentify" @close="isReidentify = false"></dialogReidentify>
    <detailsOfMedicalRecords v-if="isDetails" :isPreview="isPreview" :curData="curData" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" :diseaseGroupOptions="diseaseGroupOptions" @goBack="goBack"></detailsOfMedicalRecords>
    <HistoryExportRecord v-if="ishistoryExportRecord" @closure="handleHisExport(false)" @echo="echo" :diseaseGroupOptions="diseaseGroupOptions" :type="3"></HistoryExportRecord>
    <div class="viewContent" v-show="!isDetails">

      <header class="header header1">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="searchTitle">
          <el-form ref="searchForm" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="就诊ID" >
              <el-input v-model="searchInfo.medicalRecordId" clearable placeholder="请填写内容" @keyup.enter="onSubmit" oninput="value=value.replace(/[^\d.]/g,'')" maxlength="19"></el-input>
            </el-form-item>
            <el-form-item label="住院号" >
              <el-input v-model="searchInfo.visitNumber" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="患者姓名" >
              <el-input v-model="searchInfo.patientName" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="治疗类型" >
              <commonMultipleSelect
                v-model="searchInfo.healingTypeList"
                :options="diseaseGroupOptions"
                placeholder="请选择一项"
              />
            </el-form-item>
            <el-form-item label="出院日期" :style="{width:pxToRem(300)}">
              <AllDateSelect :clearable="true" v-model="searchInfo.exitHospitalDateList" v-model:dateType="searchInfo.exitType"></AllDateSelect>
            </el-form-item>

            <!-- 隐藏栏 -->
            <template v-if="whether">
              <el-form-item label="录入时间" :style="{width:pxToRem(300)}">
                <AllDateSelect :clearable="true" v-model="searchInfo.createTimeList" v-model:dateType="searchInfo.createType"></AllDateSelect>
              </el-form-item>
              <el-form-item label="识别状态" >
                <el-select v-model="searchInfo.indexRecognitionStatusList" multiple :multiple-limit="30" collapse-tags clearable placeholder="请选择一项">
                  <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="校对状态" >
                <el-select
                  v-model="searchInfo.checkStatus"
                  multiple
                  :multiple-limit="30"
                  collapse-tags
                  clearable
                  placeholder="请选择一项">
                  <el-option
                    key="1"
                    label="正常"
                    value="1">
                  </el-option>
                  <el-option
                    key="1"
                    label="异常"
                    value="0">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-form>
          <div class="btnDiv">
            <div class="whether">
              <el-button class="blueBtn" link @click="whether = !whether">
                {{ whether ? '收起' : '展开' }}
                <i class="iconfont icon-xuanzekuang-xiala" :class="{rotate:whether}"></i>
              </el-button>
            </div>
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </div>
      </header>
      <div class="list-section">
        <header class="header">
          <div class="title">病历列表</div>
          <div class="export">
            <el-button @click="handleHisExport(true)" v-if="!needCheckPermission || hadPermissionList.includes('导出')">
              <i class="iconfont icon-daochu1"></i>
              <span>导出记录</span>
            </el-button>
            <el-button @click="showeExportDialog = true" v-if="!needCheckPermission || hadPermissionList.includes('导出')">
              <i class="iconfont icon-daochu1"></i>
              <span>导 出</span>
            </el-button>
            <el-button type="primary" @click="newResearch" v-if="!needCheckPermission || hadPermissionList.includes('新增')"><i class="iconfont icon-tianjiayihang"></i>新增病历</el-button>
          </div>
        </header>
        <commonTable class="singleTable emptyDefaultTable btnsLastCell" ref="myTable" :data="tableBtnNum" @sort-change="handleChangeSort">
          <el-table-column prop="medicalRecordId" label="就诊ID" min-width="120">
            <template #default="scope">
              <SvgIcon iconName="icon-duihao" v-if="!scope.row.warnStringList||!scope.row.warnStringList.length"></SvgIcon>
              <el-tooltip
                class="box-item"
                v-else-if="scope.row.warnStringList?.length"
                effect="dark"
                placement="bottom-start"
                popper-class="custom-tooltip-medical">
                <!-- <img src="@/assets/cuohao.png" alt=""> -->
                <SvgIcon iconName="icon-cuowu"></SvgIcon>
                <template #content>
                  <div class="customTooltipContent">
                    <el-scrollbar>
                      <div v-for="(item,index) in scope.row.warnStringList" :key="index" class="tipItem">
                        <div class="pointerContaienr">
                          <i class="point"></i>
                        </div>
                        <span>{{ item }}</span>
                      </div>
                    </el-scrollbar>
                  </div>
                </template>
              </el-tooltip>
              <i v-else></i>
              <span :title="scope.row.medicalRecordId">{{ scope.row.medicalRecordId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="visitNumber" label="住院号" min-width="60"></el-table-column>
          <el-table-column prop="patientName" label="患者姓名" min-width="50"></el-table-column>
          <el-table-column prop="sex" label="性别" min-width="40">
            <template #default="scope">
              <div>{{ {0: '未知', 1: '男', 2: '女'}[scope.row.sex] }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" min-width="40"></el-table-column>
          <el-table-column prop="exitHospitalDate" sortable="custom" label="出院日期" min-width="70"></el-table-column>
          <el-table-column prop="healingType" label="治疗类型" min-width="100"></el-table-column>
          <el-table-column prop="creator" label="录入人" min-width="60"></el-table-column>
          <el-table-column prop="createTime" sortable="custom" label="录入时间" min-width="85"></el-table-column>
          <el-table-column label="数据来源" min-width="60">
            <template #default="scope">
              <div>{{ {0:'手动采集',1:'病历库采集',2:'自动采集'}[scope.row.uploadType] }}</div>
            </template>
          </el-table-column>
          <el-table-column label="识别状态" min-width="90">
            <template #default="scope">
              <div style="display: flex; align-items: center;">
                <span v-if="statusOptions.find(it=>it.id===scope.row.indexRecognitionStatus)?.className" class="tag" :class="statusOptions.find(it=>it.id===scope.row.indexRecognitionStatus).className"></span>
                <span v-text="renderTxt(scope.row.indexRecognitionStatus)" :style="{minWidth:pxToRem(56)}"></span>
                <el-button link class="blueBtn reIdentify" v-if="scope.row.btns.includes('重新识别')" @click="handelReIdentify(scope.row)">
                  <i class="iconfont icon-liebiao-shuaxin" :class="{ 'rotate': scope.row.isHovered }"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="reportFlag" label="上报状态" min-width="50">
            <template #default="scope">
              <div>{{ scope.row.reportFlag === 0 ? '未上报' : scope.row.reportFlag === 1 ? '上报成功' : '上报失败' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="94" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="lookFile(scope.row)" v-if="scope.row.btns.includes('查看')">查看</el-button>
              <el-button type="primary" link v-if="scope.row.btns.includes('编辑')" @click="editRow(scope.row)">编辑</el-button>
              <el-button type="primary" link v-if="scope.row.btns.includes('上报') && !(scope.row.btns.findIndex(it=>it==='上报') >= 2) " @click="reportPdf(scope.row)">上报</el-button>
              <el-button type="primary" class="blueBtn" link @click="viewFile(scope.row)" v-if="scope.row.btns.includes('查看原始病历') && !(scope.row.btns.findIndex(it=>it==='查看原始病历') >= 2 )">查看原始病历</el-button>
              <!-- 识别失败的 -->
              <el-button link class="blueBtn del" v-if="scope.row.btns.includes('删除') && !(scope.row.btns.findIndex(it=> it==='删除') >= 2) " @click="handelDelete(scope.row)">删除</el-button>
              <template v-if="scope.row.btnNum > 2">
                <span class="segmentationLine">｜</span>
                <el-popover placement="bottom" popper-class="More" :width="pxToRem(116)" trigger="hover">
                  <template #reference>
                    <div>
                      <el-button class="blueBtn" link>更多</el-button>
                      <i class="iconfont icon-xuanzekuang-xiala"></i>
                    </div>
                  </template>
                  <el-button link class="blueBtn" v-if="scope.row.btns.includes('上报') && (scope.row.btns.findIndex(it=>it==='上报') >= 2)" @click="reportPdf(scope.row)">上报</el-button>
                  <el-button class="blueBtn" link @click="viewFile(scope.row)" v-if="scope.row.btns.includes('查看原始病历') && (scope.row.btns.findIndex(it=>it==='查看原始病历') >= 2 )">查看原始病历</el-button>
                  <!-- 识别失败的 -->
                  <el-button link class="blueBtn del" v-if="scope.row.btns.includes('删除')" @click="handelDelete(scope.row) && (scope.row.btns.findIndex(it=> it==='删除') >= 2)">删除</el-button>
                </el-popover>
              </template>
            </template>
          </el-table-column>
        </commonTable>
        <div class="tabel_pagination">
          <el-pagination class="bottomPagination" @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
            <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog title="新增病历" v-model="showDialog" label-width="auto" class="new_Dialog new_Dialog3" :width="pxToRem(552)" :before-close="handleClose" >
      <!-- 添加 el-tabs 组件 -->
      <el-tabs v-model="activeTab" class="dialog-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="手动采集" name="manual">
          <!-- 手动采集指标内容 -->
          <div class="exportTip" v-if="!needCheckPermission || otherPermissions.includes('文件上传')">
            <p>若需上传病历文件请进入文件管理模块操作，点击<span @click="handleUploadPdf">上传PDF</span></p>
          </div>
          <el-form ref="ruleForm" :model="formData" class="new_DialogForm" :label-width="pxToRem(93)" :rules="rules">
            <el-form-item label="患者姓名：" prop="patientName">
              <el-input v-model="formData.patientName" maxlength="20" show-word-limit clearable placeholder="请填写内容" @keyup.enter="onSubmit" required></el-input>
            </el-form-item>
            <el-form-item label="住院号：" prop="visitNumber">
              <el-input v-model="formData.visitNumber" maxlength="50" show-word-limit clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <el-form-item label="治疗类型：" prop="healingTypeList">
              <commonMultipleSelect
                v-model="formData.healingTypeList"
                :options="diseaseGroupOptions"
                placeholder="请选择一项"
              />
            </el-form-item>
            <div class="errorMsg" v-if="errorMsg">{{errorMsg}}</div>
          </el-form>
          <div class="dialog-footer">
            <el-button @click="handleClose">取 消</el-button>
            <el-button type="primary" @click="handleUpload">确 认</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="病历库采集" name="library">
          <!-- 病历库采集指标内容 -->
          <div class="library-collection">
            <el-steps :active="active" align-center>
              <el-step title="输入纳排条件" :description="active === 0 ? '进行中' : '已完成'">
                <template #icon>
                  <span class="custom-dot" />
                </template>
              </el-step>
              <el-step title="确认采集数量" :class="active === 0 ? 'inactive-step' : ''" :description="active === 0 ? '未开始' : (active === 1 ? '进行中' : '已完成')">
                <template #icon>
                  <span class="custom-dot" />
                </template>
              </el-step>
              <el-step title="采集结果" :class="active < 2 ? 'inactive-step' : ''" :description="active === 2 ? (resultText === '采集完成' ? '已完成' : '进行中') : '未开始'">
                <template #icon>
                  <span class="custom-dot" />
                </template>
              </el-step>
            </el-steps>
            <keep-alive>
              <el-form ref="ruleFormRef" :model="formLibraryData" class="new_DialogForm library-collection-form" :label-width="pxToRem(126)" v-if="active === 0">
                <el-form-item label="就诊类型：" prop="medicalRecordTypeList">
                  <el-select disabled class="medicalBg" v-model="formLibraryData.medicalRecordTypeList" multiple :multiple-limit="30" collapse-tags clearable placeholder="请选择一项" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent>
                    <el-option v-for="item in medicalRecordTypeListOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
                <el-form-item label="就诊ID：" prop="patientId">
                  <el-input v-model="formLibraryData.patientId" clearable placeholder="请填写就诊ID,多个ID用英文分号隔开" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent></el-input>
                </el-form-item>
                <el-form-item label="病 种：" prop="healingTypeList">
                  <CommonMultiSelectWithSearch v-model="formLibraryData.healingTypeList" :options="diseaseList" :multipleLimit="30"/>
                  <!-- <el-select v-model="formLibraryData.healingTypeList" multiple :multiple-limit="30" collapse-tags clearable placeholder="请选择一项" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent>
                    <el-option v-for="item in diseaseList" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select> -->
                </el-form-item>
                <el-form-item label="入院时间：" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent>
                  <AllDateSelect
                    :clearable="true"
                    v-model="formLibraryData.hospitalizationTime"
                    v-model:dateType="formLibraryData.enterType"
                  ></AllDateSelect>
                </el-form-item>
                <el-form-item label="出院时间：" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent >
                  <AllDateSelect
                    :clearable="true"
                    v-model="formLibraryData.hospitalLeaveTime"
                    v-model:dateType="formLibraryData.exitType"
                  ></AllDateSelect>
                </el-form-item>
                <el-form-item label="病历库入库时间：" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent >
                  <AllDateSelect
                    :clearable="true"
                    v-model="formLibraryData.createTimeList"
                    v-model:dateType="formLibraryData.createType"
                  ></AllDateSelect>
                </el-form-item>
                <!-- <el-form-item label="手术编码：" prop="operationCode">
                <el-input v-model="formLibraryData.operationCode" clearable placeholder="请填写,多个编码请用英文分号隔开" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent></el-input>
              </el-form-item> -->
                <el-form-item label="手术编码/名称：" class="operationCodeValue" prop="operationCode" :class="{'hasIcon': formLibraryData.operationCode.length === 0}">
                  <operationCodeSelect valueFileds="label" :multiple="true" :isOperationCodeListLoaded="isOperationCodeListLoaded" v-model="formLibraryData.operationCode"></operationCodeSelect>
                </el-form-item>
              </el-form>
            </keep-alive>
            <div v-if="active === 1" class="library-collection-result">
              <p>共筛选出病历<span>{{ sum }}</span>份，其中<span>{{ repeatNum }}</span>份重复，实际拉取<span>{{ realityNum }}</span>份</p>
              <p class="red" v-if="realityNum > 10000">拉取数量最多一万，请重新筛选</p>
            </div>
            <div v-if="active === 2" class="library-collection-result-success">
              <img class="logo" v-if="resultText === '采集完成'" :src="myRequire('caijichenggong.png')" />
              <img class="logo" v-else :src="myRequire('caijishibai.png')" />
              <p>{{ resultText }}</p>
            </div>
          </div>
          <div class="dialog-footer">
            <el-button class="prevBtn" v-if="active === 1 || resultText === '采集失败'" @click="prev">上一步</el-button>
            <el-button class="nextBtn" :disabled="(active === 1 && realityNum === 0) || realityNum > 10000 || isDisabled" v-if="active === 0 || active === 1" type="primary" @click="submitForm(ruleFormRef)">下一步</el-button>
            <el-button class="confirmBtn" v-if="active === 2" type="primary" @click="handleUploadLibrary">确 定</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog title="导出" v-model="showeExportDialog" class="new_Dialog new_Dialog2" :width="pxToRem(610)" :before-close="handleExportClose">
      <div class="exportContent">
        <div class="tipTitle">
          <i class="iconfont icon-querentishi"></i>
          <span>月份仅用作文件名称展示，不作为筛选条件</span>
        </div>
        <img :src="exportName" alt="" class="exportImg">
        <div class="tipText">
          <span class="req">请</span><span class="primary">完善</span>以下导出<span class="primary">文件名称</span>
        </div>
        <div class="selectMonth">
          <span class="text">
            “<span class="text"> 卒中出院病历数据 </span> +
          </span>
          <el-form ref="ruleExportFormRef" style="padding: 0;" label-position="left" :model="exportData">
            <el-form-item label="" prop="date" :rules="[{ required: true, message: '请选择上报年月', trigger: 'change' }]">
              <el-date-picker v-model="exportData.date" type="month" value-format="YYYYMM" clearable placeholder="请选择一项" style="width: 100%;" :disabledDate="dateOptions"/>
            </el-form-item>
          </el-form>
          <span class="text">
            + <span class="text"> 文件序列号.xlsx </span>”
          </span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleExportClose">取 消</el-button>
          <el-button type="primary" @click="handleExportUpload">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <pdfViews :pdfUrl="pdfUrl" v-model:isPdf='isPdf' :fileName="fileName" v-if="isPdf" ></pdfViews>
  </div>
</template>
<script setup>
import lodash from 'lodash'
import { ref, reactive, computed, onBeforeUnmount, onMounted, watch, nextTick } from 'vue'
import router from '@/router'
import { convertTimestampToDate } from '@/utils/utils.js'
import { getMedicalRecordList, reportMedicalRecord, uploadMedicalRecordPdf, exportExcel, deleteMedicalRecord, collectMedicalRecord, getCollectCount, reIdentify } from '@/api/jiancanAPI/api_home'
import { ElMessage, ElMessageBox } from 'element-plus'
import detailsOfMedicalRecords from '@/components/jiancan/medicalDirectReport/detailsOfMedicalRecords.vue'
import { getPagePermission, getOtherPagePermission } from '@/hooks/permissionHooks'
import HistoryExportRecord from '@/components/jiancan/medicalDirectReport/component/historyExportRecord.vue'
import { diseaseOptions, clearErrorCollector } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import dialogReidentify from '@/components/jiancan/medicalDirectReport/component/dialogReidentify.vue'
import CommonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import exportName from '@/assets/exportName.png'
const { needCheckPermission, hadPermissionList } = getPagePermission('/strokeDirectReport/medicalDirectReportList')
const { OtherPagePermissionList } = getOtherPagePermission(['/fileManage/fileList'])
const otherPermissions = ref([])
if (OtherPagePermissionList.value.length > 0) {
  otherPermissions.value = OtherPagePermissionList.value[0].permission
}
const isDetails = ref(false) // 是否查看病历详情
const isReidentify = ref(false) // 是否重新识别
const curData = ref({}) // 当前病历数据
const isPreview = ref(false) // 是否预览病历
const myTable = ref(null)
const sum = ref(0)
const repeatNum = ref(0)
const realityNum = ref(0)
const isDisabled = ref(true)
const rules = ref({
  patientName: [
    { required: true, message: '请填写患者姓名', trigger: 'blur' }, {
      validator: (rule, value, callback) => {
        if (value && /^[\u4e00-\u9fa5]+$/.test(value) === false) {
          callback(new Error('请填写中文'))
        } else {
          // 校验通过
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  visitNumber: [
    { required: true, message: '请填写住院号', trigger: 'blur' }, {
      validator: (rule, value, callback) => {
        const numericValue = Number(value)
        if (isNaN(numericValue) && !lodash.isNil(value)) {
          callback(new Error('只能输入数字'))
        } else {
          callback()
        }
      }
    }
  ]
})
const searchInfo = ref({
  medicalRecordId: '',
  visitNumber: '',
  patientName: '',
  healingTypeList: [],
  indexRecognitionStatusList: [],
  exitHospitalDateList: [],
  exitType: 'monthrange',
  createTimeList: [],
  createType: 'monthrange',
  checkStatus: []
})
const diseaseList = ref([
  {
    id: 44,
    name: '脑出血'
  },
  {
    id: 45,
    name: '脑梗死'
  },
  {
    id: 1,
    name: '其他'
  }
])
const medicalRecordTypeListOptions = ref([
  {
    id: 1,
    name: '住院病历'
  }
  // {
  //   id: 2,
  //   name: '门急诊病历'
  // },
  // {
  //   id: 3,
  //   name: '体检病历'
  // }
])
const whether = ref(false) // 是否显示全部
const ruleExportFormRef = ref(null)
const showeExportDialog = ref(false)
const showDialog = ref(false)
const pdfInfoIsShow = ref(false)
const isOperationCodeListLoaded = ref(false)
const pdfName = ref('')
const activeTab = ref('manual')
const diseaseGroupOptions = ref(diseaseOptions)
const idsArr = ref([])
const resultText = ref('')
const myRequire = (name) =>
  new URL(`/src/assets/${name}`, import.meta.url).href
const statusOptions = ref([
  {
    id: 200,
    name: '已完成',
    className: 'tag1'
  },
  {
    id: 100,
    name: '识别中',
    className: 'tag2'
  },
  {
    id: -100,
    name: '识别失败',
    className: 'tag3'
  },
  {
    id: 0,
    name: '未上传',
    className: 'tag5'
  },
  {
    id: 10,
    name: '等待识别',
    className: 'tag4'
  }
])

const renderTxt = (val) => {
  const obj = lodash.find(statusOptions.value, { id: val })
  return obj?.name || '-'
}
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const formData = reactive({
  patientName: '',
  // idCardNumber: '',
  visitNumber: '',
  healingTypeList: []
})
const formLibraryData = reactive({
  patientId: '',
  healingTypeList: [],
  hospitalizationTime: '',
  hospitalLeaveTime: '',
  createTimeList: '',
  createType: 'daterange',
  operationCode: [],
  enterType: 'daterange',
  exitType: 'daterange',
  medicalRecordTypeList: [1]
})
const cloneSearchInfo = ref(JSON.stringify(formData))
const exportData = reactive({
  date: ''
})
const errorMsg = ref('')
const tableData = ref([])
watch(
  formLibraryData,
  (newVal) => {
    // 判断是否有任意一个字段不为空或不为默认值
    isDisabled.value = !(
      newVal.patientId ||
          newVal.healingTypeList?.length > 0 ||
          // newVal.medicalRecordTypeList.length > 0 ||
          newVal.hospitalizationTime?.length > 0 ||
          newVal.hospitalLeaveTime?.length > 0 ||
          newVal.createTimeList?.length > 0 ||
          newVal.operationCode?.length > 0
    )
  },
  { deep: true, immediate: true }
)
const tableBtnNum = computed(() => {
  const table = tableData.value.map(item => {
    item.isHovered = false
    item.btnNum = 0
    item.btns = []
    // 查看
    if (![100, 10].includes(item.indexRecognitionStatus)) {
      item.btnNum += 1
      item.btns.push('查看')
    }
    // 编辑
    if ((!needCheckPermission.value || hadPermissionList.value.includes('编辑')) && item.reportFlag !== 1 && ![100, 10].includes(item.indexRecognitionStatus)) {
      item.btnNum += 1
      item.btns.push('编辑')
    }
    // 上报
    if ((!needCheckPermission.value || hadPermissionList.value.includes('上报')) && item.reportFlag !== 1 && item.indexRecognitionStatus === 200) {
      item.btnNum += 1
      item.btns.push('上报')
    }
    // 查看原始病历
    if ((!needCheckPermission.value || hadPermissionList.value.includes('查看原始病历')) && item.fileUrl) {
      item.btnNum += 1
      item.btns.push('查看原始病历')
    }
    // 删除
    if ((!needCheckPermission.value || hadPermissionList.value.includes('删除')) && item.reportFlag !== 1) {
      item.btnNum += 1
      item.btns.push('删除')
    }
    // 重新识别
    if (item.uploadType !== 0 && (!needCheckPermission.value || hadPermissionList.value.includes('重新识别')) && (item.indexRecognitionStatus === -100 || item.indexRecognitionStatus === 200) && item.reportFlag !== 1) {
      item.btns.push('重新识别')
    }

    return item
  })
  return table
})
const pdfUrl = ref('')
const isPdf = ref(false)
const fileName = ref('')
const ishistoryExportRecord = ref(false)
const active = ref(0)
const ruleFormRef = ref(null)
const ruleForm = ref(null)

const submitFormBtn = () => {
  console.log(active.value)
  if (active.value === 0) {
    // 检查至少有一个字段被填写
    // const isAnyFieldFilled = formLibraryData.patientId ||
    //                         formLibraryData.healingTypeList.length > 0 ||
    //                         formLibraryData.hospitalizationTime ||
    //                         formLibraryData.hospitalLeaveTime ||
    //                         formLibraryData.operationCode

    // if (!isAnyFieldFilled) {
    //   ElMessage.error('请至少填写一个字段')
    //   return // 阻止提交
    // }
    // 检查就诊ID是否为多个19位数字的组合，以分号间隔
    const patientIds = formLibraryData.patientId ? formLibraryData.patientId.split(';').map(id => id.trim()) : []
    // const isPatientIdsValid = patientIds.every(id => /^\d{19}$/.test(id))
    const isPatientIdsValid = patientIds.every(id => /^\d{1,19}$/.test(id))

    if (!isPatientIdsValid) {
      ElMessage.error('所有患者ID应为不超过19位数字，并以英文分号;分隔')
      return // 阻止提交
    }
    console.log(ruleFormRef.value)
    ruleFormRef.value.validate((valid) => {
      if (valid) {
        console.log(formLibraryData.operationCode)
        const params = {
          medicalRecordIds: patientIds,
          diseaseIdList: formLibraryData.healingTypeList,
          medicalRecordTypeList: formLibraryData.medicalRecordTypeList,
          enterHospitalDate: formLibraryData.hospitalizationTime ? formLibraryData.hospitalizationTime : [],
          enterType: formLibraryData.enterType,
          exitHospitalDate: formLibraryData.hospitalLeaveTime ? formLibraryData.hospitalLeaveTime : [],
          exitType: formLibraryData.exitType,
          createTimeList: formLibraryData.createTimeList ? formLibraryData.createTimeList : [],
          createType: formLibraryData.createType,
          operationCodeList: formLibraryData.operationCode.map(code => code.replace(/\s*\（.*?\）/, '').trim())
          // ? formLibraryData.operationCode.split(';').map(code => code.trim()).filter(code => code)
          // : []
        }
        getCollectCount(params).then(res => {
          if (res.code === 10000) {
            // ElMessage.success('采集完成')
            console.log(res.data)
            sum.value = res.data.sum
            repeatNum.value = res.data.repeatNum
            realityNum.value = res.data.realityNum
            active.value++
          } else {
            // ElMessage.error('采集失败')
          }
        })
      }
    })
  }
  console.log(active.value)
  if (active.value === 1) {
    console.log(active.value)
    getCollectCountData()
    console.log(resultText.value)
  }
}
// 获取手术编码列表数据
const handleTabClick = (tab) => {
  console.log(tab.props.label)
  if (tab.props.label === '病历库采集') {
    isOperationCodeListLoaded.value = true
  }
}

const submitForm = lodash.debounce(submitFormBtn, 1000, { leading: true, trailing: false })
// 获取采集数量
const getCollectCountData = () => {
  const patientIds = formLibraryData.patientId ? formLibraryData.patientId.split(';').map(id => id.trim()) : []
  const params = {
    medicalRecordIds: patientIds,
    diseaseIdList: formLibraryData.healingTypeList,
    medicalRecordTypeList: formLibraryData.medicalRecordTypeList,
    enterHospitalDate: formLibraryData.hospitalizationTime ? formLibraryData.hospitalizationTime : [],
    enterType: formLibraryData.enterType,
    exitHospitalDate: formLibraryData.hospitalLeaveTime ? formLibraryData.hospitalLeaveTime : [],
    exitType: formLibraryData.exitType,
    createTimeList: formLibraryData.createTimeList ? formLibraryData.createTimeList : [],
    createType: formLibraryData.createType,
    // operationCodeList: formLibraryData.operationCode
    operationCodeList: formLibraryData.operationCode.map(code => code.replace(/\s*\（.*?\）/, '').trim())
    // ? formLibraryData.operationCode.split(';').map(code => code.trim()).filter(code => code)
    // : []
  }
  collectMedicalRecord(params).then(res => {
    console.log(res)
    if (res.code === 10000) {
      resultText.value = '采集完成'
      active.value++
    } else {
      active.value++
      resultText.value = '采集失败'
    }
  })
}

const prev = () => {
  console.log(active.value)
  if (active.value > 0) {
    active.value--
    if (active.value === 0) {
      realityNum.value = 0
    }
  }
}
const handleUploadLibrary = () => {
  getListData()
  handleClose()
}

const handleHisExport = (flag) => {
  ishistoryExportRecord.value = flag
}

const echo = (data) => {
  searchInfo.value = data
  ishistoryExportRecord.value = false
  getListData()
}

// 定时请求
const startTimer = () => {
  const timer = setInterval(() => {
    if (!isDetails.value) {
      // refreshStatus() // 每隔30秒请求一次接口更新识别状态
      getListData() // 每隔30秒请求一次接口更新识别状态
    }
  }, 5000)

  return timer // 返回定时器ID，以便在组件销毁时清除
}
const stopTimer = (timer) => {
  clearInterval(timer)
}
// const refreshStatus = () => {
//   refreshIdentifyStatus(idsArr.value).then(res => {
//     if (res.code === 10000) {
//       // 创建一个字典来存储 res.data 中的数据
//       // const statusMap = new Map()
//       // res.data.forEach(newData => {
//       //   statusMap.set(newData.id, newData.indexRecognitionStatus)
//       // })
//       // 遍历 tableData 并更新状态
//       tableData.value.forEach(item => {
//         // const newStatus = statusMap.get(item.medicalRecordId)
//         const newStatus = res.data.find(data => data.medicalRecordId === item.medicalRecordId)?.indexRecognitionStatus
//         if (newStatus !== undefined) {
//           item.indexRecognitionStatus = newStatus // 更新识别状态为新的状态描述
//         }
//       })
//     }
//   })
// }

let timer = null // 定时器变量
onMounted(() => {
  timer = startTimer() // 组件挂载时启动定时器
})

onBeforeUnmount(() => {
  stopTimer(timer) // 组件销毁前停止定时器
})

// 获取列表数据
const getListData = async() => {
  const params = {
    medicalRecordId: searchInfo.value.medicalRecordId,
    exitHospitalDateList: handleDateChange(searchInfo.value),
    createTimeList: handleDateChange2(searchInfo.value),
    healingTypeList: searchInfo.value.healingTypeList,
    visitNumber: searchInfo.value.visitNumber,
    patientName: searchInfo.value.patientName,
    // reportFlag: '',
    pageNum: currentPage.value,
    pageSize: limit.value,
    indexRecognitionStatusList: searchInfo.value.indexRecognitionStatusList,
    exitType: searchInfo.value.exitType,
    createType: searchInfo.value.createType,
    sortType: searchInfo.value.sortType,
    orderType: searchInfo.value.orderType,
    checkStatus: searchInfo.value.checkStatus
  }
  cloneSearchInfo.value = JSON.stringify(searchInfo.value)
  const res = await getMedicalRecordList(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    idsArr.value = res.data.items.map(item => item.id)
    total.value = res.data.total
  }
}

const handleDateChange = (data) => {
  let enterHospitalDateValue = ''
  let exitHospitalDateValue = ''
  if (data.exitHospitalDateList && data.exitHospitalDateList[0]) {
    enterHospitalDateValue = convertTimestampToDate(data.exitHospitalDateList[0])
  }
  if (data.exitHospitalDateList && data.exitHospitalDateList[1]) {
    exitHospitalDateValue = convertTimestampToDate(data.exitHospitalDateList[1])
  }
  const exitHospitalDates = enterHospitalDateValue || exitHospitalDateValue ? [enterHospitalDateValue, exitHospitalDateValue] : []
  return exitHospitalDates
}
const handleDateChange2 = (data) => {
  let startDateValue = ''
  let endDateValue = ''
  if (data.createTimeList && data.createTimeList[0]) {
    startDateValue = convertTimestampToDate(data.createTimeList[0])
  }
  if (data.createTimeList && data.createTimeList[1]) {
    endDateValue = convertTimestampToDate(data.createTimeList[1])
  }
  const dates = startDateValue || endDateValue ? [startDateValue, endDateValue] : []
  return dates
}

const handleChangeSort = (column, prop, order) => {
  console.log(column, prop, order)
  const transformParams = {
    descending: 1, // 降序
    ascending: 2, // 升序
    exitHospitalDate: '2', // 出院时间
    createTime: '1', // 录入时间
    reportTime: '3' // 上报时间
  }
  searchInfo.value.sortType = transformParams[column.order]
  searchInfo.value.orderType = transformParams[column.prop]
  getListData()
}
// 加载时请求页面列表
const init = async() => {
  getListData()
}

init()
// 重置
const resetParams = () => {
  myTable.value?.tableRef?.clearSort()
  searchInfo.value = {
    medicalRecordId: '',
    visitNumber: '',
    patientName: '',
    healingTypeList: [],
    exitHospitalDateList: [],
    indexRecognitionStatusList: [],
    exitType: 'monthrange',
    createTimeList: [],
    createType: 'monthrange',
    checkStatus: []
  }

  cloneSearchInfo.value = JSON.stringify(searchInfo.value)
  getListData()
}

// 新增
const newResearch = () => {
  formData.patientName = ''
  // formData.idCardNumber = ''
  formData.visitNumber = ''
  formData.healingTypeList = []
  showDialog.value = true
  active.value = 0
  formLibraryData.patientId = ''
  formLibraryData.healingTypeList = []
  formLibraryData.medicalRecordTypeList = [1]
  formLibraryData.hospitalizationTime = ''
  formLibraryData.hospitalLeaveTime = ''
  formLibraryData.createTimeList = ''
  formLibraryData.operationCode = []
  resultText.value = ''
  activeTab.value = 'manual'
  nextTick(() => {
    ruleForm.value?.clearValidate()
  })
}
const handleClose = async () => {
  showDialog.value = false
  pdfInfoIsShow.value = false
  pdfName.value = ''
  errorMsg.value = ''
  if (resultText.value === '采集完成') {
    getListData()
  }
  isOperationCodeListLoaded.value = false
}

const handleExportClose = () => {
  showeExportDialog.value = false
  exportData.date = ''
  ruleExportFormRef.value.clearValidate()
}

const handleExportUpload = async() => {
  ruleExportFormRef.value.validate((valid) => {
    if (valid) {
      const data = JSON.parse(cloneSearchInfo.value)
      const params = {
        visitNumber: data.visitNumber,
        fileName: '卒中出院病历数据' + exportData.date,
        filterItemContent: cloneSearchInfo.value,
        exitHospitalDateList: handleDateChange(data),
        healingTypeList: data.healingTypeList,
        patientName: data.patientName,
        exitType: data.exitType,
        createTimeList: handleDateChange2(data),
        createType: data.createType,
        medicalRecordId: data.medicalRecordId,
        indexRecognitionStatusList: data.indexRecognitionStatusList,
        checkStatus: data.checkStatus,
        sortType: data.sortType,
        orderType: data.orderType
      }

      exportExcel(params).then(res => {
        if (res.code === 10000) {
          ElMessage.success('导出成功')
          handleExportClose()
        }
      })
    }
  })
}

// 搜索
const onSubmit = () => {
  getListData()
}
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getListData()
}
// 更改每页条数
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getListData()
}
// 查看文件
const viewFile = (item, index) => {
  pdfUrl.value = item.fileUrl
  fileName.value = item.fileName
  if (pdfUrl.value) {
    isPdf.value = true
  }
}
// 查看病历
const lookFile = (item) => {
  clearErrorCollector()
  curData.value = item
  isPreview.value = true
  isDetails.value = true
}

// 编辑
const editRow = async(row) => {
  clearErrorCollector()
  curData.value = row
  isPreview.value = false
  isDetails.value = true
}
// 上报
const reportPdf = async(row) => {
  ElMessageBox.confirm(
    `确定要上报该病历吗？`,
    '病历上报',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const params = {
        id: row.id
      }
      const res = await reportMedicalRecord(params)
      if (res.code === 10000) {
        ElMessage.success('上报成功')
        await getListData()
      } else {
        await getListData()
        errorMsg.value = res.msg
      }
    })
}
const handelDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除该病历吗？`,
    '删除病历',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  ).then(async() => {
    deleteMedicalRecord({ id: row.id }).then(res => {
      if (res.code === 10000) {
        ElMessage.success('已删除')
        getListData()
      } else {
        getListData()
        errorMsg.value = res.msg
      }
    })
  })
}
const handelReIdentify = (row) => {
  curData.value = row
  row.isHovered = true
  isReidentify.value = true
}
// const fileList = ref([])
// const maxFileLength = ref(0)
// const uploadFile = ref(null)
// 调用后端上传API
const toAddFile = async () => {
  const formm = {
    patientName: formData.patientName,
    visitNumber: formData.visitNumber,
    healingTypeList: formData.healingTypeList,
    agencyId: 1,
    uploadType: 0 // 0 手动采集 1自动采集
  }
  const res = await uploadMedicalRecordPdf(formm)
  if (res.code === 10000) {
    handleClose()
    pdfInfoIsShow.value = false
    ElMessage.success('已新增')
    getListData()
  }
}
// 弹出原生上传界面
const handleUpload = () => {
  // if (!formData.patientName) {
  //   ElMessage.warning('请填写患者姓名')
  //   return false
  // } else if (!formData.visitNumber) {
  //   ElMessage.warning('请填写住院号')
  //   return false
  // }

  ruleForm.value.validate((valid) => {
    console.log(valid)
    if (valid) {
      toAddFile()
    }
  })
}
// 详情返回
const goBack = (hasUpdate = true) => {
  isDetails.value = false
  if (hasUpdate) {
    onSubmit()
  }
}

const dateOptions = (time) => {
  return time.getTime() > Date.now()
}

// 点击上传pdf，去往文件管理页面
const handleUploadPdf = () => {
  console.log('路由跳转了')
  router.push({ name: 'fileManage' })
}

const reidentify = (data) => {
  reIdentify({ ...data }).then(res => {
    if (res.code === 10000) {
      ElMessage.success('操作成功')
      getListData()
    } else {
      getListData()
    }
    isReidentify.value = false
  })
}
</script>
<style lang="scss">
.custom-tooltip-medical {
  left: -20px !important;
  padding: 0;
  .el-popper__arrow {
    left: 20px !important;
  }
}
</style>
<style scoped lang="scss">
.custom-popper {
  .is-selected::after {
    display: none;
  }
}
.researchQueue {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  :deep(.el-overlay) {
    z-index: 100 !important;
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
      flex-wrap: wrap;
      flex: 1;
      width: 0;
      .el-form-item {
        width: 262px;
        margin-right: 32px;
        .el-form-item__content {
          .el-input {
            .el-input__wrapper {
              .el-input__inner {
                color: var(--theme-text) !important;
              }
            }
          }
          .el-date-editor,
          .el-select__wrapper {
            height: 32px;
            .el-range-input {
              color: var(--theme-text);
            }
          }
        }
        &:nth-child(5) {
          width: 322px !important;
          margin-right: 0;
          .el-form-item__content {
            width: 255px;
            .el-input__wrapper {
              width: 100% !important;
            }
          }
        }
      }
    }
    &.header1 {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      width: 100%;
      height: auto;
      padding: 0 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      font-size: 14px;
      transition: all 0.3s;
      .conditionTitle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 52px;
        .title {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
      }
      .searchTitle {
        display: flex;
        justify-content: space-between;
        width: 100%;
        // width: 100%;
        .btnDiv {
          display: flex;
          .el-button {
            height: 32px;
            border-radius: 2px;
            &:nth-child(3) {
              margin-left: 16px;
              color: #fff;
            }
          }
          :deep(.whether) {
            display: flex;
            align-items: center;
            height: 32px;
            margin-right: 16px;
            span {
              color: var(--theme-primary);
            }
            i {
              margin-left: 5px;
            }
            .rotate {
              transform: rotate(180deg);
              transition: transform 0.3s;
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
    .export {
      display: flex;
      align-items: center;
      .el-button {
        margin-left: 12px;
      }
    }
  }
  .list-section {
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    height: 0;
    margin-top: 16px;
    padding: 0 26px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: 67px;
      border-radius: 16px;
      .title {
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .el-button {
        i {
          margin-right: 10px;
          font-size: 12px;
        }
      }
    }
    :deep(.singleTable) {
      display: flex;
      flex-direction: column;
      flex: 1;
      .el-table__body {
        tbody {
          tr {
            td {
              // height: 53px;
              padding: 5px 0;
              svg {
                width: 16px;
                height: 16px;
                // margin: 0 auto;
                margin-right: 6px;
              }
              .segmentationLine {
                color: #d8d8d8;
              }
              &:last-child {
                .cell {
                  display: flex;
                  flex-wrap: wrap;
                  align-items: center;
                }
              }
              .el-button {
                font-weight: 400;
                &+.el-button {
                  margin-left: 7px;
                }
              }
              .blueBtn {
                color: var(--el-color-primary);
                &.is-disabled {
                  color: rgba(149, 149, 149, .55);
                }
                .iconfont {
                  font-size: 16px;
                  color: var(--theme-primary);
                  // transform: scale(.7);
                }
              }
              .reIdentify {
                width: 26px;
                height: 26px;
                margin-left: 8px;
                border: 1px solid var(--theme-primary);
                background: rgba(54, 112, 248, 0.1);
                .rotate {
                  animation: rotate 0.5s linear;
                }

                @keyframes rotate {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg);
                  }
                }
              }
              .cell {
                // display: flex;
                .tag {
                  display: block;
                  width: 6px;
                  height: 6px;
                  margin: 0 8px 0 0;
                  border-radius: 100%;
                }
                .tag1 {
                  background: #04a273;
                }
                .tag2 {
                  background: var(--el-color-primary);
                }
                .tag3 {
                  background: #ff4e4e;
                }
                .tag4 {
                  background: #faad14;
                }
                .tag5 {
                  background: #bfbfbf;
                }
              }
              &.displayCell {
                .cell {
                  display: flex;
                  justify-content: center;
                }
              }
            }
            td:nth-child(1) {
              .cell {
                display: flex;
                align-items: center;
                padding-left: 26px;
                span {
                  display: block;
                  // max-width: 70px;
                }
                i {
                  width: 16px;
                  padding-right: 10px;
                }
              }
            }
          }
        }
      }
    }
    .tabel_pagination {
      display: flex;
      justify-content: center;
    }
  }
  :deep(.new_Dialog) {
    padding: 0;
    .el-dialog__body {
      .el-tabs {
        .el-tabs__header {
          margin-bottom: 16px;
          .el-tabs__item {
            height: 31px;
            padding-bottom: 10px;
            line-height: 20px;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text);
          }
          .el-tabs__nav-wrap::after {
            height: 1px;
          }
          .el-tabs__item.is-active {
            font-weight: 500;
            font-size: 14px;
            color: var(--theme-primary);
          }
        }
        .el-tabs__content {
          .exportTip {
            width: 502px;
            height: 40px;
            margin-bottom: 16px;
            border: 1px solid rgba(54, 112, 248, 0.5);
            border-radius: 2px;
            background: rgba(54, 112, 248, 0.05);
            p {
              margin: 0;
              padding-left: 11px;
              line-height: 40px;
              font-weight: 400;
              font-size: 14px;
              color: var(--theme-text);
              span {
                cursor: pointer;
                color: var(--theme-primary);
              }
            }
          }
          .el-steps {
            display: flex;
            align-items: center;
            width: 504px;
            height: 78px;
            margin-bottom: 16px;
            background: rgba(54, 112, 248, 0.05);
            .el-step__icon {
              background: none;
            }
            .custom-dot {
              display: block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
            }
            .el-step__head {
              .el-step__line {
                left: 26%;
                width: 100%;
                height: 1px;
                margin: 0 auto;
                background: #e8e8e8;
                .el-step__line-inner {
                  border: 0;
                }
              }
              &.is-finish,
              &.is-process {
                .custom-dot {
                  background: var(--theme-primary);
                }
              }
              &.is-finish {
                .el-step__line {
                  background: var(--theme-primary);
                }
              }
              &.is-wait {
                .custom-dot {
                  background: #d8d8d8;
                }
              }
            }
            .el-step__title {
              line-height: 22px;
              font-weight: 400;
              font-size: 14px;
              color: var(--theme-text);
            }
            .el-step__description {
              margin-top: 0;
              line-height: 22px;
              font-weight: 400;
              font-size: 11px;
              color: var(--theme-text-3) !important;
            }
            .el-step__main {
              .is-process,
              .is-wait,
              .is-finish {
                color: var(--theme-text);
              }
            }
            .el-step:nth-child(1) {
              padding-left: 16px;
              .el-step__head {
                text-align: left;
                .el-step__icon {
                  margin-left: 25px;
                }
              }
              .el-step__main {
                text-align: left;
                .el-step__description {
                  padding-left: 16%;
                }
              }
            }
            .el-step:nth-child(2) {
              .el-step__head {
                .el-step__line {
                  left: 60%;
                  width: 112%;
                }
              }
            }
            .el-step:nth-child(3) {
              padding-right: 16px;
              .el-step__head {
                text-align: right;
                .el-step__icon {
                  margin-right: 8px;
                }
              }
              .el-step__main {
                text-align: right;
                .el-step__description {
                  padding-right: 10%;
                }
              }
            }
          }
          .is-horizontal {
            .el-step__main {
              .is-wait {
                color: var(--theme-text-3) !important;
              }
            }
          }
        }
      }
    }
    .el-form {
      .errorMsg {
        position: absolute;
        left: 143px;
        margin-top: 4px;
        font-size: 12px;
        color: #ea0000;
      }
      .pdfInfo {
        display: flex;
        padding-left: 84px;
        .icon-pdfwenjian {
          display: block;
          padding-top: 2px;
          color: #3778f2;
        }
        span {
          display: block;
          padding: 0 4px;
          font-weight: 400;
          font-size: 14px;
          color: #3778f2;
        }
        .icon-guanbi {
          display: block;
          width: 18px;
          height: 18px;
          border: 1px solid #e8e8e8;
          cursor: pointer;
          line-height: 19px;
          text-align: center;
          color: #959595;
        }
      }
    }
    .el-form-item {
      position: relative;
      margin-bottom: 16px;
      .el-form-item__label {
        height: 40px;
        line-height: 40px;
      }
      .el-form-item__content {
        .yearRange {
          margin-left: -1px;
        }
        .el-input {
          line-height: 40px;
          .el-input__wrapper {
            height: 40px;
          }
        }
        .el-select {
          width: 100%;
          .el-select__wrapper {
            box-sizing: border-box;
            height: auto;
            min-height: 40px;
            padding: 8px 13px 8px 16px;
            .iconfont {
              font-size: 7px !important;
            }
          }
          &.operation-code-select {
            .el-select__wrapper {
              height: auto !important;
              min-height: 40px !important;
            }
          }
        }
        .el-date-editor,
        .el-select__wrapper {
          height: 40px !important;
        }
        .el-form-item__label {
          width: 85px;
          padding-right: 13px;
        }
        .heigth-select {
          .el-select__wrapper {
            height: auto !important;
          }
        }
        .upload-demo {
          display: block !important;
          .el-upload {
            .el-button {
              width: 90px;
              height: 40px;
              border: none;
              border-radius: 8px;
              background: var(--theme-fill);
              span {
                text-align: center;
                font-weight: 400;
                font-size: 14px;
                color: #3778f2;
              }
            }
          }
        }
        .txtTip {
          line-height: 20px;
          // position: absolute;
          // left: 98px;
          font-weight: 400;
          font-size: 14px;
          color: #9a9a9a;
          // word-break: break-all;
          white-space: nowrap;
        }
      }
      &:nth-child(1) {
        .el-form-item__content {
          .el-select {
            width: 100%;
            height: 100%;
            line-height: 100%;
            font-size: 14px;
          }
        }
      }
      &:nth-child(2) {
        .el-form-item__content {
          display: flex;
          align-items: flex-start;
          .el-checkbox-group {
            .el-checkbox {
              width: 166px;
              margin-right: 0;
              .el-checkbox__label {
                padding-left: 13px;
              }
              .el-checkbox__inner {
                border-radius: 2px;
              }
              .el-checkbox__inner::after {
                border-width: 3px;
              }
              .el-checkbox__input.is-checked+.el-checkbox__label {
                color: inherit;
              }
            }
          }
        }
      }
    }
    .el-form-item:last-child {
      margin-bottom: 24px;
    }
    .el-form-item.operationCodeValue {
      .el-form-item__content {
        .el-select__wrapper {
          height: auto;
          padding: 8px 2px 8px 16px;
          .el-select__selection {
            overflow-y: auto;
            max-height: 123px;

            @include scrollBarStyle;
            .el-select__selected-item.is-transparent {
              display: contents;
            }
          }

          .el-select__suffix {
            display: none;
            // position: absolute;
            // right: 0;
          }
        }
      }
      &.hasIcon {
        .el-select__wrapper {
          padding-right: 13px;
        }
        .el-select__suffix {
          display: block !important;
          .el-icon {
            font-size: 7px !important;
          }
        }
      }
    }
    .library-collection {
      .library-collection-form {
        .el-form-item {
          .allDateSelect {
            .el-date-editor {
              justify-content: flex-start;
              width: 100% !important;
              padding-left: 17px;
              // .el-range-input {
              //   width: 70px;
              // }
              .el-range__close-icon {
                position: absolute;
                right: 16px;
              }
            }
          }
          &:nth-child(1)::before,
          &:nth-child(2)::before {
            display: none;
          }
        }
      }
      .library-collection-result {
        margin: 44px 0 54px 0;
        text-align: center;
        p {
          line-height: 20px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text);
          span {
            font-weight: 500;
          }
          span:nth-child(2) {
            color: #f59f0c;
          }
          span:nth-child(3) {
            color: var(--theme-primary);
          }
          &.red {
            color: #ff4e4e;
          }
        }
      }
      .library-collection-result-success {
        margin-top: 32px;
        text-align: center;
        img {
          width: 36px;
        }
        p {
          margin: 9px 0 24px 0;
          line-height: 20px;
          font-weight: 500;
          font-size: 14px;
          color: var(--theme-text);
        }
      }
    }
    .el-input {
      .el-input__wrapper {
        .el-input__inner {
          font-size: 14px;
          color: var(--theme-text);
        }
        .el-input__count-inner {
          background: inherit;
          font-size: 14px;
          color: var(--theme-text-3);
        }
      }
    }
  }
  :deep(.new_Dialog2) {
    .el-dialog__header {
      padding-bottom: 16px !important;
    }
    .el-dialog__body {
      box-sizing: border-box;
      padding: 0 24px 0 24px !important;
      .el-form-item__label {
        color: var(--theme-text);
      }
      .el-form-item__content {
        height: auto !important;
        padding-right: 0;
        .el-input {
          height: 40px;
          line-height: 40px;
        }
        p {
          margin: 4px 0 0 6px;
          line-height: 17px;
          text-align: left;
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          color: var(--theme-text);
        }
      }
      .exportContent {
        display: flex;
        flex-direction: column;
        .tipTitle {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
          height: 40px;
          margin-bottom: 40px;
          border: 1px solid rgba(245, 159, 12, 0.5);
          border-radius: 2px;
          background: rgba(245, 159, 12, 0.05);
          i {
            margin: 0 8px 0 16px;
            color: #f59f0c;
          }
          span {
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text);
          }
        }
        .exportImg {
          width: 80px;
          height: 80px;
          margin: 0 auto;
        }
        .tipText {
          margin: 20px 0;
          text-align: center;
          font-weight: 400;
          font-size: 16px;
          color: var(--theme-text);
          .primary {
            color: var(--theme-primary);
          }
          .req {
            position: relative;
            &::before {
              position: absolute;
              left: -10px;
              top: 0;
              font-size: 18px;
              color: var(--el-color-danger);
              content: "*";
            }
          }
        }
        .selectMonth {
          margin: 0 auto;
          margin-bottom: 40px;

          @include childrenCenter;
          >.text {
            font-weight: 350;
            font-size: 14px;
            color: var(--theme-text);
            .text {
              color: var(--theme-text-2);
            }
          }
          .el-form-item {
            margin: 0 10px;
          }
        }
      }
    }
    .el-form-item:nth-child(1)::before {
      display: none !important;
    }
    .is-disabled {
      opacity: 0.6;
    }
    .el-input__wrapper {
      width: 186px;
    }
  }
  :deep(.new_Dialog3) {
    .el-dialog__header {
      padding-top: 24px !important;
      padding-bottom: 16px !important;
    }
  }
}
.del {
  color: #f76868 !important;
}
.icon-xuanzekuang-xiala {
  font-size: 7px;
  color: var(--theme-primary);
}
.customTooltipContent {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  width: auto;
  max-width: 390px;
  height: auto;
  max-height: 360px;
  padding: 12px 0 12px 16px;
  border-radius: 2px;
  :deep(.el-scrollbar) {
    display: flex;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
  }

  .tipItem {
    display: flex;
    height: auto;
    margin-bottom: 8px;
    padding-right: 16px;
    line-height: 21px;
    font-weight: 400;
    font-size: 14px;
    color: #fff;
    &:nth-last-child(1) {
      margin-bottom: 0;
    }
    .pointerContaienr {
      display: flex;
      align-items: center;
      height: 21px;
      margin-right: 4px;
    }
    .point {
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 2px;
      background: var(--theme-card);
    }
  }
}
</style>
<style lang="scss">
  .More {
    display: flex;
    flex-direction: column;
    padding: 8px 0 0 0 !important;
    .el-button {
      display: flex;
      justify-content: flex-start;
      width: 100%;
      height: 28px;
      margin: 0 0 8px 0;
      padding: 0 0 0 16px;
      font-weight: 400;
      &.is-link {
        color: var(--el-color-primary);
      }
      &:hover {
        background-color: rgba(54, 112, 248, 0.05) !important;
      }
    }
  }
  .customTooltipContent {
    .el-scrollbar {
      .el-scrollbar__thumb {
        background: #6f6f70;
        &:hover {
          background: #6f6f70;
        }
      }
    }
  }
</style>
