<template>
  <div class="list-div">
    <div class="viewContent">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <div class="titleSearch">
          <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
            <el-form-item label="医院名称" class="form-query-select">
              <el-input v-model="searchInfo.name" clearable placeholder="请填写内容" @keyup.enter="onSubmit"></el-input>
            </el-form-item>
            <!-- <el-form-item label="授权状态" class="form-query-select">
              <el-select v-model="searchInfo.authStatus" clearable placeholder="请选择一项">
                <el-option
                  v-for="item in statusOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="有效期" class="form-query-select" :style="{width:pxToRem(320)}">
              <el-date-picker
                value-format="YYYY-MM-DD"
                v-model="searchInfo.effectiveTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item> -->
            <div class="btnDiv">
              <el-button @click="resetParams">重置条件</el-button>
              <el-button type="primary" @click="onSubmit">查 询</el-button>
            </div>
          </el-form>
        </div>
      </header>
      <div class="list-section">
        <header class="table-header">
          <div>医院列表</div>
          <el-button type="primary" class="common-btn primary" @click="newResearch" v-if="!needCheckPermission || hadPermissionList.includes('添加医院')"><i class="iconfont icon-tianjiayihang"></i>新增医院</el-button>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable btnsLastCell" :data="tableData">
            <el-table-column prop="name" label="医院名称" min-width="240"></el-table-column>
            <!-- <el-table-column prop="level" label="医院等级" min-width="100"></el-table-column> -->
            <el-table-column label="地址" min-width="300">
              <template #default="scope">
                <div class="cell-flex-div">
                  <span v-if="scope.row.provinceName">{{scope.row.provinceName}}</span>
                  <span v-if="scope.row.cityName">-{{scope.row.cityName}}</span>
                  <!-- <span v-if="scope.row.address">-{{scope.row.address}}</span> -->
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column prop="authStatus" label="授权状态" min-width="120">
              <template v-slot="scope">
                <div :class="['statusDiv']">
                  <span :class="'status-tag status-tag' + scope.row.authStatus"></span>
                  <span>{{getStatusText(scope.row.authStatus)}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="地图坐标" min-width="200">
              <template #default="scope">
                <div class="cell-flex-div">
                  <span>{{scope.row.longitude}}</span>
                  <span v-if="scope.row.latitude">，{{scope.row.latitude}}</span>
                </div>

              </template>
            </el-table-column> -->
            <el-table-column label="操作" fixed="right" :min-width="hadPermissionList.includes('证书管理') ? 104 : 60">
              <template #default="scope">
                <el-button type="primary" link @click="editRow(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('编辑医院')">编辑</el-button>
                <!-- <el-button class="blueBtn" link @click="certificateManage(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('证书管理')">证书管理</el-button> -->
                <el-button type="danger" link @click="deleteRow(scope.row)" v-if="!needCheckPermission || hadPermissionList.includes('删除医院')">删除</el-button>
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
    </div>
    <el-dialog :title="title" v-model="showDialog" class="new_Dialog new_Dialog2" :width="pxToRem(640)" :before-close="handleClose">
      <el-form ref="ruleFormRef" label-position="left" :label-width="pxToRem(100)" :model="formData" class="new_DialogForm" :rules="rules">
        <el-form-item label="医院名称：" prop="name">
          <el-input text placeholder="请填写内容" maxlength="30" show-word-limit v-model="formData.name" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="name"></el-input>
        </el-form-item>
        <!-- <el-form-item label="医院等级：" prop="level">
          <el-select v-model="formData.level" clearable placeholder="请选择一项">
            <el-option
              v-for="item in levelGroupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label="省-市：" prop="city">
          <el-cascader
            :options="options"
            separator="-"
            v-model="formData.city"
            @change="handleChange">
          </el-cascader>
        </el-form-item>
        <!-- <el-form-item label="详细地址：" prop="address">
          <el-input type="textarea" placeholder="请填写内容" maxlength="200" autosize show-word-limit v-model="formData.address" @keyup.enter="submitForm(ruleFormRef)" @submit.prevent ref="address"></el-input>
        </el-form-item> -->
        <!-- <el-form-item label="地图坐标：" prop="coordinate" class="coordinate">
          <div class="coordinate_div">
            <div class="div1">
              <span class="text">经度</span>
              <el-input
                @input="formData.longitude=formData.longitude.replace(/[^\d.]/g, '')"
                v-model="formData.longitude"
                maxlength="50" show-word-limit
                placeholder="经度"
              />
            </div>
            <div class="div1">
              <span class="text">纬度</span>
              <el-input
                v-model="formData.latitude"
                @input="formData.latitude=formData.latitude.replace(/[^\d.]/g, '')"
                maxlength="50" show-word-limit
                placeholder="纬度"
              />
            </div>
          </div>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">保 存</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- <el-dialog title="证书管理" v-model="showCertificateDialog" v-if="showCertificateDialog" class="new_Dialog certificate_Dialog" :width="pxToRem(548)" :before-close="handleCloseCertificate">
      <div class="certificate_title">
        <p v-if="!hasData">
          <img src="@/assets/icon-hint.png">
          <span>下载证书前需完善证书信息</span>
        </p>
      </div>
      <div class="certificate_content" :class="{'view_certificate_content': hasData}">
        <div :class="['certificate_content_title', {'viewCertificate': hasData}]">
          <p>
            <i></i>
            <span>证书信息</span>
          </p>
          <div class="certificate_content_title_right" v-if="isFromDisabled">
            <span @click="cancelEdit">取消编辑</span>
            <span @click="confirmCertificate(certificateRuleFormRef)">保存证件信息</span>
          </div>
          <div class="certificate_content_title_right certificate_edit" v-if="hasData">
            <i class="iconfont icon-bianji1"></i>
            <span class="text" @click="editCertificate">编辑证书信息</span>
          </div>
        </div>
        <div class="certificate_content_info" v-if="hasData && !isEdit">
          <ul>
            <li><span>mac地址：</span>{{ certificateFormData.mac }}</li>
            <li><span>产品名称：</span>{{ certificateFormData.productName }}</li>
            <li><span>有效期：</span>{{ certificateFormData.effectiveTime }}</li>
          </ul>
        </div>
        <div class="certificate_content_item" v-if="isEdit">
          <img :src="projectLogo"/>
          <p><span>您还没有证书，去</span><a @click="editCertificateNoData">编辑证书信息</a></p>
        </div>
        <el-form ref="certificateRuleFormRef" v-if="isFromDisabled" label-position="left" :label-width="pxToRem(81)" :model="certificateFormDataCopy" class="new_DialogForm" :rules="certificateRules">
          <el-form-item label="mac地址：" prop="mac">
            <el-input text clearable placeholder="12位16进制字符" maxlength="17" show-word-limit v-model="certificateFormDataCopy.mac" @submit.prevent ref="mac"></el-input>
          </el-form-item>
          <el-form-item label="产品名称：" prop="productName">
            <el-input text clearable placeholder="请填写内容" maxlength="30" show-word-limit v-model="certificateFormDataCopy.productName" @submit.prevent ref="productName"></el-input>
          </el-form-item>
          <el-form-item label="有效期：" prop="effectiveTime">
            <el-date-picker class="custom-date-picker" v-model="certificateFormDataCopy.effectiveTime" @visible-change="handleCertificateVisibleChange" type="date" :disabledDate="disabledDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD" size="default" placeholder="请选择一项" clearable @submit.prevent ref="effectiveTime" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseCertificate">取 消</el-button>
          <el-button type="primary" v-if="hasData" class="certificateBtn" @click="downloadCertificate">下载证书</el-button>
          <el-button type="primary" v-if="!hasData" disabled="true" class="no_certificateBtn">下载证书</el-button>
        </span>
      </template>
    </el-dialog> -->
  </div>
</template>

<script>
export default {
  name: 'InstitutionManage'
}
</script>
<script setup>
import { ref, reactive } from 'vue'
import { getAgencyList, deleteAgency, addAgency, updateAgency } from '@/api/api_agency'
import { getRegionMap } from '@/api/api_region'
// import { addCertificate, editCertificates, downloadCertificates } from '@/api/api_home'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPagePermission } from '@/hooks/permissionHooks'
import { SYSTEM_AGENCY_ROWS } from '@/mock/demoModules'
// import { formatStandardDate } from '@/utils/utils'
// import projectLogo from '@/assets/empty.png'
const { needCheckPermission, hadPermissionList } = getPagePermission('/manage/institutionManage')
const showDialog = ref(false)
// const showCertificateDialog = ref(false)
// const isEdit = ref(true)
// const editOrAdd = ref('1')
// const projectLogo = ref('')
const searchInfo = ref({
  name: '',
  authStatus: '',
  effectiveTime: []
})
const title = ref('新增医院')
// 医院等级
// const levelGroupOptions = ref([
//   {
//     label: '省级政府',
//     value: '省级政府'
//   }, {
//     label: '市级政府',
//     value: '市级政府'
//   }, {
//     label: '三甲',
//     value: '三甲'
//   }, {
//     label: '三乙',
//     value: '三乙'
//   }, {
//     label: '二甲',
//     value: '二甲'
//   }, {
//     label: '二乙',
//     value: '二乙'
//   }
// ])
const options = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const ruleFormRef = ref()
// const agencyIdValue = ref('')
// const agencyNameValue = ref('')
// // const certificateRuleFormRef = ref()
// const stepsNumber = ref(1)
// const isFromDisabled = ref(false)
// const hasData = ref(false)
const formData = reactive({
  id: '',
  name: '',
  level: '',
  city: '',
  // address: '',
  longitude: '',
  latitude: ''
})
// const certificateFormData = reactive({
//   mac: '',
//   productName: '',
//   effectiveTime: ''
// })
// const certificateFormDataCopy = reactive({
//   mac: '',
//   productName: '',
//   effectiveTime: ''
// })
// const statusOption = ref([
//   {
//     label: '未认证',
//     value: '0'

//   },
//   {
//     label: '已认证',
//     value: '1'

//   },
//   {
//     label: '认证过期',
//     value: '2'

//   }
// ])
const resetParams = () => {
  searchInfo.value = {}
  currentPage.value = 1
  getListData()
}
const onSubmit = () => {
  console.log('提交')
  currentPage.value = 1
  getListData()
}
const tableData = ref([])
// 验证经纬度
const checkCoordinate = (rule, value, callback) => {
  if (!formData.longitude) {
    return callback(new Error('请填写经度'))
  } else if (!formData.latitude) {
    return callback(new Error('请填写纬度'))
  }
  return callback()
}
const rules = reactive({
  name: [{ required: true, message: '请填写', trigger: 'blur' }],
  level: [{ required: true, message: '请填写', trigger: 'change' }],
  city: [{ required: true, message: '请选择', trigger: 'change' }],
  // address: [{ required: true, message: '请填写', trigger: 'blur' }],
  coordinate: [{ validator: checkCoordinate, required: true, message: '请填写经纬度，如 117.20, 34.35', trigger: 'blur' }]
})
const handleChange = (val) => {
  console.log(11, val)
}
// const disabledDate = (time) => {
//   const today = new Date()
//   today.setHours(0, 0, 0, 0)
//   return time.getTime() < today.getTime()
// }
// const handleCertificateVisibleChange = (visible) => {
//   if (!visible) {
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)
//     // 确保使用选中日期的副本进行比较
//     const selectedDate = new Date(certificateFormDataCopy.effectiveTime)
//     selectedDate.setHours(0, 0, 0, 0)
//     if (selectedDate.getTime() < today.getTime()) {
//       certificateFormDataCopy.effectiveTime = new Date().toISOString().split('T')[0]
//     }
//   }
// }
// const getStatusText = (status) => {
//   switch (status) {
//     case 0:
//       return '未认证'
//     case 1:
//       return '已认证'
//     case 2:
//       return '认证过期'
//   }
// }
// 获取列表数据
const getListData = async() => {
  const params = {
    ...searchInfo.value,
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  const res = await getAgencyList(params)
  if (res.code === 10000) {
    // mock 模式下接口无数据，使用演示医院兜底
    const items = res.data?.items
    tableData.value = items && items.length ? items : SYSTEM_AGENCY_ROWS
    total.value = res.data?.total || SYSTEM_AGENCY_ROWS.length
  }
}

// 加载时请求页面列表
const init = async() => {
  getListData()
}

init()
// 获取省市数据
const toGetRegionMap = async () => {
  const res = await getRegionMap()
  if (res.code === 10000) {
    options.value = []
    res.data.forEach(province => {
      const children = []
      province.children.forEach(city => {
        children.push({
          label: city.name,
          value: city.id
        })
      })
      options.value.push({
        label: province.name,
        value: province.id,
        children
      })
    })
    // tableData.value = res.data.items
    // total.value = res.data.total
  }
}
// 新增
const newResearch = () => {
  if (ruleFormRef.value) {
    ruleFormRef.value.resetFields()
  }
  formData.id = ''
  formData.name = ''
  // formData.level = ''
  formData.city = ''
  // formData.address = ''
  // formData.longitude = ''
  // formData.latitude = ''
  title.value = '新增医院'
  showDialog.value = true
  toGetRegionMap()
}
const handleClose = async () => {
  ruleFormRef.value.clearValidate()
  showDialog.value = false
}
// const handleCloseCertificate = async () => {
//   if (stepsNumber.value === 1 && hasData.value === false) {
//     showCertificateDialog.value = false
//   } else if (stepsNumber.value === 1 && hasData.value === true) {
//     isFromDisabled.value = false
//     hasData.value = false
//     isEdit.value = true
//     stepsNumber.value = 1
//     showCertificateDialog.value = false
//   } else if (stepsNumber.value === 2 && editOrAdd.value === '1') {
//     isFromDisabled.value = false
//     hasData.value = false
//     isEdit.value = true
//     stepsNumber.value = 1
//   } else if (stepsNumber.value === 2 && editOrAdd.value === '2') {
//     isFromDisabled.value = false
//     hasData.value = true
//     isEdit.value = false
//     stepsNumber.value = 1
//   }
// }
// const cancelEdit = () => {
//   if (editOrAdd.value === '1') {
//     stepsNumber.value = 1
//     certificateFormData.mac = ''
//     certificateFormData.productName = ''
//     certificateFormData.effectiveTime = ''
//     isFromDisabled.value = false
//     isEdit.value = true
//   } else if (editOrAdd.value === '2') {
//     stepsNumber.value = 1
//     isFromDisabled.value = false
//     hasData.value = true
//     isEdit.value = false
//   }
// }
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
// 编辑医院
const editRow = (item) => {
  title.value = '编辑医院'
  formData.id = item.id
  formData.name = item.name
  // formData.level = item.level
  formData.city = [item.provinceId, item.cityId]
  // formData.address = item.address
  // formData.longitude = item.longitude
  // formData.latitude = item.latitude
  if (options.value.length === 0) {
    toGetRegionMap()
  }
  showDialog.value = true
}
// 证书管理
// const certificateManage = async (row) => {
//   agencyIdValue.value = row.id
//   agencyNameValue.value = row.name
//   const params = {
//     agencyId: row.id
//   }
//   const res = await getCertificateList(params)
//   if (res.code === 10000) {
//     if (res.data) {
//       hasData.value = true
//       isEdit.value = false
//       editOrAdd.value = '2'
//       certificateFormData.mac = res.data.mac
//       certificateFormData.productName = res.data.productName
//       certificateFormData.effectiveTime = res.data.effectiveTime
//     } else {
//       editOrAdd.value = '1'
//       hasData.value = false
//       isEdit.value = true
//     }
//     showCertificateDialog.value = true
//   }
// }
// 删除
const deleteRow = async(row) => {
  // const res = await deleteAgency({ id: row.id })
  // if (res.code === 10000) {
  //   ElMessage.success('已删除')
  //   await getListData()
  // }
  ElMessageBox.confirm(
    `确认删除【${row.name}】吗？删除后将无法找回，请谨慎操作。`,
    '删除医院',
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
      const res = await deleteAgency(params)
      if (res.code === 10000) {
        ElMessage.success('已删除')
        await getListData()
      }
    })
}

// 省市代码转名称
const codeToProvinceText = (code) => {
  return options.value.find(item => item.value === code)?.label || ''
}

// 省市代码转名称
const codeToCityText = (code) => {
  const province = options.value.find(p => p.children && p.children.some(c => c.value === code))
  return province ? province.children.find(c => c.value === code).label : ''
}
// const downloadCertificate = async () => {
//   const params = {
//     agencyId: agencyIdValue.value,
//     agencyName: agencyNameValue.value
//   }
//   try {
//     const res = await downloadCertificates(params)
//     console.log(res)
//     if (res.status === 200) {
//       const { data, headers } = res
//       // 创建 Blob 对象
//       const blob = new Blob([data], { type: headers['content-type'] })
//       // 创建下载链接
//       const url = window.URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       const fileName = `${agencyNameValue.value}_${formatStandardDate(new Date())}.lic`
//       link.href = url
//       link.setAttribute('download', fileName) // 设置下载文件名
//       // 触发下载
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//       // 显示成功消息
//       ElMessage.success('文件已开始下载')
//       // 关闭弹窗
//       showCertificateDialog.value = false
//     }
//   } catch (error) {
//     // 处理下载失败的情况
//     console.error('下载失败', error)
//     ElMessage.error('下载失败')
//   }
// }

// // 编辑证书
// const editCertificate = () => {
//   hasData.value = false
//   isEdit.value = false
//   isFromDisabled.value = true
//   stepsNumber.value = 2
//   editOrAdd.value = '2'
//   certificateFormDataCopy.mac = certificateFormData.mac
//   certificateFormDataCopy.productName = certificateFormData.productName
//   certificateFormDataCopy.effectiveTime = certificateFormData.effectiveTime
// }
// const editCertificateNoData = () => {
//   isEdit.value = false
//   isFromDisabled.value = true
//   stepsNumber.value = 2
//   certificateFormDataCopy.mac = ''
//   certificateFormDataCopy.productName = ''
//   certificateFormDataCopy.effectiveTime = ''
// }
// const confirmCertificate = async(formEl) => {
//   if (!formEl) return
//   await formEl.validate(async(valid, fields) => {
//     if (valid) {
//       const params = {
//         mac: certificateFormDataCopy.mac,
//         productName: certificateFormDataCopy.productName,
//         effectiveTime: certificateFormDataCopy.effectiveTime,
//         agencyId: agencyIdValue.value
//       }
//       if (editOrAdd.value === '1') {
//         const res = await addCertificate(params)
//         if (res.code === 10000) {
//           ElMessage.success('证书信息已保存')
//           hasData.value = true
//           isEdit.value = false
//           isFromDisabled.value = false
//           stepsNumber.value = 1
//           certificateFormData.mac = certificateFormDataCopy.mac
//           certificateFormData.productName = certificateFormDataCopy.productName
//           certificateFormData.effectiveTime = certificateFormDataCopy.effectiveTime
//           getListData()
//         }
//       } else if (editOrAdd.value === '2') {
//         const res = await editCertificates(params)
//         if (res.code === 10000) {
//           ElMessage.success('证书信息已保存')
//           hasData.value = true
//           isEdit.value = false
//           isFromDisabled.value = false
//           stepsNumber.value = 1
//           certificateFormData.mac = certificateFormDataCopy.mac
//           certificateFormData.productName = certificateFormDataCopy.productName
//           certificateFormData.effectiveTime = certificateFormDataCopy.effectiveTime
//           getListData()
//         }
//       }
//     }
//   })
// }
// const fullscreenLoading = ref(false)
// 弹出原生上传界面
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      const params = {
        id: formData.id,
        name: formData.name,
        provinceId: formData.city[0],
        provinceName: codeToProvinceText(formData.city[0]),
        cityId: formData.city[1],
        cityName: codeToCityText(formData.city[1])
        // address: formData.address
        // level: formData.level,
        // longitude: formData.longitude,
        // latitude: formData.latitude
      }
      console.log('params', params)
      let res = ''
      if (!formData.id) {
        res = await addAgency(params)
      } else {
        res = await updateAgency(params)
      }
      if (res.code === 10000) {
        ElMessage.success('已保存')
        getListData()
        showDialog.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
@use "@/style/common/list.scss";
.list-div {
  .header-query {
    .titleSearch {
      display: flex;
      width: 100%;
      .search {
        display: flex;
        align-items: center;
        p {
          width: auto;
          min-width: 56px;
          margin: 0;
          margin-right: 10px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text);
        }
        .el-input {
          width: 235px;
          margin-right: 32px;
        }
      }
    }
  }
  .tableMain {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 0;
    :deep(.singleTable) {
      flex: 1;
    }
  }
  :deep(.new_Dialog) {
    .el-form {
      .el-form-item__content {
        height: auto !important;
        .el-cascader {
          width: 100% !important;
        }
        .is-transparent {
          span {
            color: var(--theme-text-3) !important;
          }
        }
        .el-select__selected-item {
          span {
            color: var(--theme-text);
          }
        }
      }
    }
  }
  :deep(.new_Dialog2) {
    // .el-form {
    //   margin-top: -4px;
    // }
    .el-textarea__inner {
      min-height: 36px !important;
    }
  }
  :deep(.certificate_Dialog) {
    padding: 0;
    .el-dialog__header {
      padding-bottom: 16px !important;
    }
    .el-dialog__body {
      box-sizing: border-box;
      padding-bottom: 0;
      .certificate_title {
        display: flex;
        p {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
          height: 40px;
          margin: 0;
          padding-left: 16px;
          border: 1px solid rgba(245, 159, 12, 0.5);
          border-radius: 2px;
          background: rgba(245, 159, 12, 0.05);
          // svg {
          //   display: block;
          //   width: 13px;
          //   font-size: 13px;
          //   color: #fc9700;
          // }
          img {
            width: 19px;
          }
          span {
            display: block;
            padding-left: 7px;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text);
          }
        }
      }
      .certificate_content {
        height: 228px;
        &.view_certificate_content {
          height: 178px;
        }
        .certificate_content_title {
          display: flex;
          justify-content: space-between;
          width: 100%;
          p {
            display: flex;
            align-items: center;
            margin: 0;
            padding: 16px 0;
            span {
              display: block;
              margin-left: 6px;
              font-weight: 500;
              color: var(--theme-text);
            }
            i {
              display: block;
              width: 2px;
              height: 16px;
              background: var(--theme-primary);
            }
          }
          .certificate_content_title_right {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            &.certificate_edit {
              i {
                font-size: 14px;
                color: var(--theme-primary);
              }
              .text {
                padding-left: 4px;
              }
            }
            span {
              display: block;
              cursor: pointer;
              font-size: 14px;
            }
            span:nth-child(1) {
              padding-right: 10px;
              border-right: 1px solid #cbcfdc;
              color: var(--theme-text-2);
            }
            span:nth-child(2) {
              padding-left: 10px;
              color: var(--theme-primary);
            }
          }
        }
        .viewCertificate {
          p {
            padding: 0 !important;
          }
        }
        .certificate_content_info {
          ul {
            padding-top: 2px;
            li {
              display: flex;
              align-items: center;
              margin: 0 auto;
              margin-top: 24px;
              font-weight: 400;
              font-size: 14px;
              color: var(--theme-text);
              span {
                width: 81px;
                padding: 0;
                text-align: right;
              }
            }
          }
        }
        .certificate_content_item {
          text-align: center;
          img {
            width: 108px;
          }
          p {
            margin: 0;
            padding-top: 6px;
            span,
            a {
              font-size: 14px;
              color: var(--theme-text);
            }
            a {
              padding-bottom: 3px;
              cursor: pointer;
              font-weight: 600;
              color: var(--theme-primary);
            }
          }
        }
        .el-form {
          .el-form-item {
            margin-bottom: 16px;
            &:last-child {
              margin-bottom: 0;
            }
          }
          .el-form-item__content {
            .el-input {
              width: 100%;
              height: 40px;
              .el-input__wrapper {
                height: 100%;
              }
            }
            .custom-date-picker {
              .el-input__wrapper {
                // position: relative;
                .el-input__prefix {
                  // position: absolute;
                  // right: 5px;
                  font-size: 16px;
                  color: #959595;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
