<template>
  <div class="dataBoardBasic" :class="{dataMonitoring:true, darkMode:modeStore.mode==='dark',lightMode:modeStore.mode==='light'} ">
    <div class="viewContent">
      <header class="header header1">
        <div class="conditionTitle">
          <span>查询条件</span>
          <div class="conditionMain">
            <el-form ref="searchForm" :inline="true" :model="searchInfo" :label-width="pxToRem(40)">
              <el-form-item label="地市" class="form-query-select">
                <el-select v-model="searchInfo.city" clearable placeholder="请选择一项" :popper-class="modeStore.mode==='dark'?'darkSinglePopper':''">
                  <el-option
                    v-for="item in cityGroupOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="医院" class="form-query-select">
                <commonMultipleSelect
                  v-model="searchInfo.agency"
                  clearable
                  placeholder="请选择一项"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  :options="getAgencyData"
                ></commonMultipleSelect>
                <!-- <el-select v-model="searchInfo.agency" multiple collapse-tags clearable placeholder="请选择一项" :popper-class="modeStore.mode==='dark'?'darkModePopper':''">
                  <el-option
                    v-for="item in getAgencyData"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select> -->
              </el-form-item>
            </el-form>
            <div class="btnDiv">
              <el-button @click="resetParams">重置条件</el-button>
              <el-button type="primary" @click="onSubmit">查 询</el-button>
            </div>
          </div>
        </div>
      </header>
      <div class="dataOverview">
        <div class="timeTop">
          <p>数据概览</p>
          <div class="choice">
            <span>维度</span>
            <el-radio-group v-model="queryDimension">
              <el-radio-button :label="1">日</el-radio-button>
              <el-radio-button :label="2">月</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <ul class="dataInfo">
          <li>
            <div class="dataInfoItem">
              <span>已上报病案总数</span>
              <span>{{ queryDimension === 1 ? overviewData.currentDayReportTotalNum : overviewData.currentMonthReportTotalNum }}</span>
            </div>
            <img class="defaultLogo" v-if="modeStore.mode==='light'" :src="myRequire('img5001.png')" />
            <img class="defaultLogo" v-else :src="myRequire('img5007.png')" />
          </li>
          <li>
            <div class="dataInfoItem">
              <span>符合监测病种总数</span>
              <span>{{ queryDimension === 1 ? overviewData.matchCurrentDayReportTotalNum : overviewData.matchCurrentMonthReportTotalNum }}</span>
            </div>
            <img class="defaultLogo" v-if="modeStore.mode==='light'" :src="myRequire('img5002.png')" />
            <img class="defaultLogo" v-else :src="myRequire('img5008.png')" />
          </li>
          <li>
            <div class="dataInfoItem">
              <span>已同步病案总数</span>
              <span>{{ queryDimension === 1 ? overviewData.medicalRecordsNum : overviewData.preMonthReportTotalNum }}</span>
            </div>
            <img class="defaultLogo" v-if="modeStore.mode==='light'" :src="myRequire('img5003.png')" />
            <img class="defaultLogo" v-else :src="myRequire('img5009.png')" />
          </li>
          <li>
            <div class="dataInfoItem">
              <span>完成标准化总数</span>
              <span>{{ queryDimension === 1 ? overviewData.currentDayStandardTotalNum : overviewData.currentMonthStandardTotalNum }}</span>
            </div>
            <img class="defaultLogo" v-if="modeStore.mode==='light'" :src="myRequire('img5004.png')" />
            <img class="defaultLogo" v-else :src="myRequire('img5010.png')" />
          </li>
        </ul>
      </div>
      <div class="content">
        <div class="contentTop">
          <p>统计结果</p>
          <el-button @click="exportData" v-if="!userStore.needCheckPermission || hadPermissionList.includes('数据导出')">
            <i v-if="modeStore.mode==='light'" class="iconfont icon-daochu1"></i>
            <!-- <img class="defaultLogo" v-if="modeStore.mode==='light'" :src="myRequire('img5005.png')" /> -->
            <img class="defaultLogo" v-else :src="myRequire('img5006.png')" />
            <span>导出结果</span>
          </el-button>
        </div>
        <div class="tableMain" :class="{'tableMainEmpty': tableData.length === 0}">
          <commonTable
            id="exportTable"
            class="singleTable"
            :data="tableData"
            style="width: 100%;"
            :span-method="objectSpanMethod"
            :key="1"
            :fixed="true"
            ref="myTable"
            :border="true"
            header-fixed
            :row-class-name="getRowClassName"
          >
            <el-table-column
              v-for="(header, index) in tableHeader"
              :key="index"
              :label="header.name"
              :align="header.name"
              :colspan="header.colspan"
              :rowspan="header.rowspan"
            >
              <el-table-column
                v-for="(subHeader, subIndex) in header.children"
                :key="subIndex"
                :prop="subHeader.prop"
                :label="subHeader.name"
                :formatter="(row)=>{return row[subHeader.prop] || '-'}"
              ></el-table-column>
            </el-table-column>
          </commonTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataBoardBasic'
}
</script>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllAgencyByCity } from '@/api/api_home'
import * as XLXS from 'xlsx'
import FileSaver from 'file-saver'
import { getOverviewData, dataBoardBasicData } from '@/api/api_bigScreen'
import { getAreaList } from '@/api/api_dataMonitor'
import { useModeStore } from '@/store/modeStore'
import { useUserStore } from '@/store/user'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
const myRequire = (name) =>
  new URL(`/src/assets/${name}`, import.meta.url).href
const userStore = useUserStore()
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/dataBoard') {
    hadPermissionList.value.push(item.name)
  }
})

const modeStore = useModeStore()
const searchInfo = ref({
  agency: '',
  city: ''
})
const queryDimension = ref(1)
// const isSecondSelectEnabled = ref(false)
const tableData = ref([])
const tableHeader = ref([
  {
    label: '基本信息',
    name: '基本信息',
    children: [
      {
        prop: 'cityName',
        name: '地市'
      },
      {
        prop: 'agencyName',
        name: '医院'
      }
    ]
  },
  {
    label: '哨点医院统计信息',
    name: '哨点医院统计信息',
    children: [
      {
        prop: 'exitHospitalTime',
        name: '已处理病案出院时间范围'
      },
      {
        prop: 'startReportTime',
        name: '开始上报时间'
      },
      {
        prop: 'reportTotalNum',
        name: '已上报病案数'
      },
      {
        prop: 'currentDayReportTotalNum',
        name: '当日上报病案数'
      },
      {
        prop: 'preDayReportTotalNum',
        name: '昨日上报病案数'
      }
    ]
  },
  {
    label: '数据平台统计信息',
    name: '数据平台统计信息',
    children: [
      {
        prop: 'matchReportTotalNum',
        name: '符合检测病种总数'
      },
      {
        prop: 'medicalRecordsNum',
        name: '已完成同步病案总数'
      },
      {
        prop: 'standardTotalNum',
        name: '完成标准化总数'
      }
    ]
  }
])
const overviewData = ref({})
const getAgencyData = ref([])
const cityGroupOptions = ref([])
const myTable = ref(null)
const sumCount = ref(0)

// 页面加载时请求数据
onMounted(async () => {
  await getAreaList({
    cityId: ''
  }).then(res => {
    if (res.code === 10000) {
      cityGroupOptions.value = res.data
    }
  })
})

const choiceCity = async(val) => {
  console.log(val)
  if (val) {
    await getAllAgencyByCity({ cityId: val }).then(res => {
      if (res.code === 10000) {
        getAgencyData.value = res.data
        searchInfo.value.agency = ''
        // isSecondSelectEnabled.value = !!searchInfo.value.city
      } else {
        ElMessage.error('医院列表加载失败，请刷新页面重试')
      }
    })
  } else {
    searchInfo.value.agency = ''
    allCityData()
    // isSecondSelectEnabled.value = false
  }
}
watch(() => searchInfo.value.city, choiceCity, { immediate: false })
const getData = async() => {
  const params = {
    agency: searchInfo.value.agency ? searchInfo.value.agency : [],
    city: searchInfo.value.city ? [searchInfo.value.city] : [],
    disease: []
  }
  const res = await dataBoardBasicData(params)
  if (res.code === 10000) {
    tableData.value = res.data
    handleTableBorder()
  }
}

// 选择全部城市
const allCityData = async() => {
  await getAllAgencyByCity({}).then(res => {
    if (res.code === 10000) {
      getAgencyData.value = res.data
      // isSecondSelectEnabled.value = !!searchInfo.value.city
    } else {
      ElMessage.error('医院列表加载失败，请刷新页面重试')
    }
  })
}

// 表格边框
const handleTableBorder = async() => {
  const headerAttrCount = []
  tableHeader.value.forEach(item => {
    headerAttrCount.push(item.children.length)
  })
  headerAttrCount.forEach((item, index) => {
    if (index !== headerAttrCount.length - 1) {
      sumCount.value += item
      const secondRow = myTable.value.$el.querySelector('.el-table__header thead tr:nth-child(2)')
      if (secondRow) {
        const thElements = secondRow.querySelectorAll('th')
        if (thElements.length >= sumCount.value) {
          thElements[sumCount.value - 1].classList.add('borderR')
        }
      }
    }
  })
}

// 导出数据
const exportData = async() => {
  // const params = {
  //   agency: searchInfo.value.agency ? searchInfo.value.agency : [],
  //   city: searchInfo.value.city ? [searchInfo.value.city] : [],
  //   disease: []
  // }
  // console.log(params)
  // const res = await dataExportBasic(params)
  // if (res.code === 10000) {
  //   // ElMessage.success('导出成功')
  // }

  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const filename = `基本数据统计表_${year}年${month}月${day}日 ${hours}时${minutes}分${seconds}秒.xlsx`
  const wb = XLXS.utils.table_to_book(document.getElementById('exportTable'), {
    raw: true
  })
  const wbout = XLXS.write(wb, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array'
  })
  try {
    FileSaver.saveAs(
      new Blob([wbout], {
        type: 'application/octet-stream'
      }),
      // '基本数据统计表' + '.xlsx'
      filename
    )
    ElMessage.success('导出任务创建成功，可在浏览器下载中查看')
  } catch (e) {
    console.log(e)
  }
  return wbout
}

// 请求数据概览
const getOverData = async() => {
  const res = await getOverviewData()
  if (res.code === 10000) {
    overviewData.value = res.data
  }
}

// 表格合并
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    const _row = mergeColumn(tableData.value).one[rowIndex]
    const _col = _row > 0 ? 1 : 0
    return {
      rowspan: _row,
      colspan: _col
    }
  }
}

// 表格合并
const mergeColumn = (data) => {
  const spanOneArr = []
  let concatOne = 0
  data.forEach((item, index) => {
    if (index === 0) {
      spanOneArr.push(1)
    } else {
      if (item.cityName === data[index - 1].cityName) {
        spanOneArr[concatOne] += 1
        spanOneArr.push(0)
      } else {
        spanOneArr.push(1)
        concatOne = index
      }
    }
  })
  return {
    one: spanOneArr
  }
}

// 加载时请求页面列表
const init = async() => {
  getData()
  allCityData()
  getOverData()
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {
    agency: '',
    city: ''
  }
  getData()
}
// 搜索
const onSubmit = () => {
  getData()
  return false
}
// 行class
const getRowClassName = (row, rowIndex) => {
  // console.log('row', row)
  if (!row.row.agencyId) {
    return 'no-hover provinceRow'
  } else {
    return 'no-hover'
  }
}
</script>

<style scoped lang="scss">
:deep(.el-table__cell .cell) {
  display: flex;
  justify-content: center;
}
:deep(.el-table .el-table__body tbody tr td:first-child .cell),
:deep(.el-table .el-table__header thead tr th:first-child .cell) {
  padding-left: 12px !important;
}
.dataBoardBasic {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  .viewContent {
    padding: 0;
    .header {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding: 0 16px 0 0;
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
        display: block;
        width: 100%;
        height: 127px;
        padding: 0 24px;
        border-radius: 8px;
        background-color: var(--theme-card);
        font-size: 14px;
        .conditionTitle {
          span {
            display: block;
            width: 100%;
            padding: 24px 0;
            font-weight: 500;
            font-size: 16px;
            color: var(--theme-text);
          }
        }
        .conditionMain {
          display: flex;
          :deep(.el-form) {
            width: auto;
            .el-form-item {
              width: auto;
              margin-right: 32px;
              .el-form-item__label {
                justify-content: flex-start;
                font-weight: 400;
                font-size: 14px;
                color: var(--theme-text);
              }
              .el-form-item__content {
                width: 245px;
              }
            }
          }
        }
      }
    }
    .dataOverview {
      height: 197px;
      margin: 16px 0;
      border-radius: 8px;
      background: var(--theme-card);
      .timeTop {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 71px;
        padding: 0 24px;
        p {
          margin: 0;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        .choice {
          display: flex;
          align-items: center;
          span {
            display: block;
            height: 24px;
            margin-right: 12px;
            line-height: 26px;
            font-weight: 350;
            font-size: 14px;
            color: var(--theme-text);
          }
          :deep(.el-radio-button) {
            // width: 70px;
            .el-radio-button__inner {
              box-sizing: border-box;
              width: 46px;
              height: 32px;
              // border: 1px solid #d8d8d8;
              border-left: 1px solid #d8d8d8 !important;
              color: var(--theme-text-2);
            }
          }
          :deep(.el-radio-button:nth-child(2)) {
            .el-radio-button__inner {
              border-left: none !important;
            }
          }
          :deep(.el-radio-button.is-active .el-radio-button__inner) {
            border-color: var(--theme-primary) !important;
            background: var(--theme-card);
            color: var(--theme-primary);
          }
        }
      }
      .dataInfo {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;
        padding: 0 24px;
        li {
          display: flex;
          overflow: hidden;
          justify-content: space-between;
          align-items: center;
          flex: 1;
          box-sizing: border-box;
          width: calc(25% - 5px);
          height: 102px;
          margin-right: 20px;
          padding: 0 24px;
          border-radius: 4px;
          background: rgba(54, 112, 248, 0.03);
          span {
            display: block;
          }
          span:nth-child(1) {
            margin-bottom: 12px;
            line-height: 20px;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text-2);
          }
          span:nth-child(2) {
            line-height: 30px;
            font-family: D-DIN;
            font-weight: 700;
            font-size: 28px;
            color: var(--theme-text);
          }
          img {
            width: 55px;
            height: 55px;
          }
        }
        li:nth-child(4) {
          margin-right: 0;
        }
      }
    }
    .content {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 0;
      border-radius: 8px;
      background: var(--theme-card);
      .contentTop {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 71px;
        padding: 0 24px;
        p {
          display: flex;
          align-items: center;
          margin: 0;
        }
        p:nth-child(1) {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        p:nth-child(2) {
          display: flex;
          justify-content: center;
          width: 111px;
          height: 32px;
          border: 1px solid #d8d8d8;
          cursor: pointer;
          img {
            width: 13px;
            height: 12px;
          }
          span {
            padding-left: 10px;
            font-weight: 350;
            font-size: 14px;
            color: var(--theme-text);
          }
        }
        .el-button {
          i {
            font-size: 13px;
          }
          span {
            padding-left: 10px;
            font-weight: 350;
            font-size: 14px;
            color: var(--theme-text);
          }
        }
      }
      .tableMain {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 0;
        padding: 0 24px 24px;
        &.tableMainEmpty {
          :deep(.singleTable) {
            height: 100%;
            // border: 1px solid #e8e8e8;
            border-bottom: 1px solid #e8e8e8;
          }
        }
        :deep(.singleTable) {
          &.el-table--border::after {
            top: 0;
          }
          .el-table--border::before {
            top: 0;
          }
          .el-table__border-left-patch {
            display: none;
          }
          // .el-table__border-left-patch,
          // &.el-table--border::before,
          // &.el-table--border::after {
          //   width: 0;
          // }
          .el-table__inner-wrapper {
            .el-table__header {
              tr:nth-child(1) {
                .cell {
                  color: var(--theme-text);
                }
              }
              tr:nth-child(2) {
                .cell {
                  color: var(--theme-text);
                }
              }
              .cell {
                padding: 0;
                text-align: center;
              }
            }
            .el-table__body-wrapper {
              .cell {
                text-align: center;
                color: var(--theme-text-2);
              }
            }
            .el-table__body tr:nth-child(1) {
              .cell {
                color: var(--theme-primary);
              }
            }
          }
        }
      }
    }
  }
}

.darkMode {
  .viewContent {
    .header.header1,
    .dataOverview {
      // border: 1px solid var(--dark-screen-border-color);
      border: 1px solid rgba(129, 167, 255, 0.1);
      // background-color: var(--dark-screen-bg-color);
      background: rgba(129, 167, 255, 0.1);
      span,
      p {
        // color: #c8c8c8 !important;
        color: #fff !important;
      }
      .timeTop .choice {
        :deep(.el-radio-button) {
          overflow: hidden;
          width: 44px !important;
          // margin: 0 4px;
          // border-radius: 44px;
          input {
            display: none;
          }
          .el-radio-button__inner {
            width: 44px !important;
            border: 0 !important;
            background: rgba(7, 6, 23, 0.44) !important;
            line-height: 18px;
            color: rgba(255, 255, 255, 0.6) !important;
          }
        }
        .is-active {
          :deep(.el-radio-button__inner) {
            background-color: var(--theme-primary) !important;
            color: #fff !important;
          }
        }
      }
      .conditionTitle {
        :deep(.el-form-item) {
          overflow: hidden;
          // border-radius: 12px;
          // background: rgba(0, 0, 0, 0.5);
          .el-input__inner {
            color: #fff;
          }
        }
        :deep(.el-form--inline .el-form-item) {
          margin-right: 32px;
        }
        :deep(.el-form-item__label-wrap) {
          margin-left: 0 !important;
        }
        :deep(.el-form-item__label) {
          height: 24px;
          margin-top: 3px;
          // margin-right: 10px;
          // padding: 0 10px;
          // border-right: 1px solid #45454f;
          // border-radius: 12px 0 0 12px;
          // background: transparent;
          line-height: 25px;
          font-size: 14px;
          // color: #c8c8c8;
          color: #fff !important;
        }
        // :deep(.el-form-item__content) {
        //   background: rgba(7, 6, 23, 0.44);
        //   opacity: 0.99;
        // }
        :deep(.el-select__wrapper) {
          border: 0;
          background-color: rgba(7, 6, 23, 0.44);
          box-shadow: none;
        }
        :deep(.el-select__selected-item),
        :deep(.el-tag) {
          width: auto;
          border-radius: 2px;
          background: rgba(129, 167, 255, 0.1);
          line-height: 18px;
          font-size: 14px;
          &.el-select__placeholder {
            padding: 0 6px;
          }
          span {
            color: #fff;
          }
          &.is-transparent {
            span {
              color: var(--theme-text-3);
            }
          }
        }
        :deep(.el-select__selected-item) {
          background: none;
        }
        :deep(.el-tag__close) {
          color: #fff;
        }
        :deep(.el-select__icon) {
          // color: #fff;
          color: rgba(255, 255, 255, 0.6);
        }
      }
      :deep(.btnDiv) {
        .el-button {
          border: 0;
          background: rgba(7, 6, 23, 0.44);
          opacity: 0.99;
          span {
            color: #fff;
          }
          &:nth-child(2) {
            background: var(--theme-primary);
          }
        }
      }
      .dataInfo li {
        border: 0.07143rem solid rgba(78, 86, 128, 0.3);
        background: rgba(51, 60, 92, 0.3);
        span:nth-child(1) {
          color: #fff !important;
        }
      }
    }
    .tableMainEmpty {
      :deep(.singleTable) {
        border-bottom: 1px solid rgba(89, 119, 176, 0.5) !important;
      }
    }
    .content,
    :deep(.el-table) {
      // border: 1px solid var(--dark-screen-border-color);
      // border: 1px solid rgba(129, 167, 255, 0.1);
      // background-color: var(--dark-screen-bg-color);
      background: rgba(129, 167, 255, 0.1);
      .contentTop {
        p,
        i,
        span {
          color: #fff !important;
        }
        p:nth-child(2) {
          border: none;
          background: rgba(7, 6, 23, 0.44);
          opacity: 0.99;
        }
        .el-button {
          border: none;
          background: rgba(7, 6, 23, 0.44);
          opacity: 0.99;
          img {
            width: 13px;
            height: 12px;
          }
        }
      }
      .el-table__row--striped td.el-table__cell:nth-child(1),
      .el-table__row--striped td.el-table__cell:last-child {
        border-radius: 0;
      }
      .el-table__row td.el-table__cell {
        // border-color: rgba(255, 255, 255, 0);
        // background: rgba(255, 255, 255, 0);
        border-color: rgba(89, 119, 176, 0.5);
        color: #fff;
      }
      thead th.el-table__cell {
        border-color: rgba(89, 119, 176, 0.5) !important;
        background: rgba(54, 112, 248, 0.2) !important;
        .cell {
          color: #fff !important;
        }
      }
      .el-table__inner-wrapper {
        .el-table__header {
          .cell {
            color: #fff !important;
          }
        }
        .el-table__body-wrapper {
          .cell {
            color: #fff !important;
          }
        }
      }
      .el-table__row--striped td.el-table__cell {
        border: 0;
        // border-color: rgba(124, 242, 246, 0.1) !important;
        // background: rgba(124, 242, 246, 0.1) !important;
        .cell {
          color: #fff !important;
        }
      }
      thead th.borderR {
        border-right-color: rgba(89, 119, 176, 0.5) !important;
      }
      tr {
        background-color: transparent;
        box-shadow: none;
      }
      .borderR,
      .el-table__header tr:nth-child(1) th:not(:nth-last-child(1)) {
        border-right: 1px solid rgba(89, 119, 176, 0.5) !important;
      }
      .el-table__body {
        .provinceRow {
          .el-table__cell {
            .cell {
              font-weight: 500;
              color: #fac858 !important;
            }
          }
        }
      }
      .el-table--border::after,
      .el-table--border::before,
      .el-table__border-left-patch,
      .el-table__inner-wrapper::after {
        // width: 0 !important;
        background-color: rgba(89, 119, 176, 0.5);
        // color: transparent;
      }
      .el-table__border-left-patch {
        display: none;
      }
    }
    :deep(.hover-cell) {
      background: rgba(54, 112, 248, 0.1) !important;
    }
    :deep(.el-table__body tr:hover>td.el-table__cell),
    .el-table_body tr:hover,
    :deep(.el-table__body tr.hover-row>td.el-table__cell) {
      // background: rgba(124, 242, 246, 0.1) !important;
      background: rgba(54, 112, 248, 0.1);
    }
    .el-table {
      // border-left: 1px solid rgba(89, 119, 176, 0.5) !important;
      // border-top: 1px solid rgba(89, 119, 176, 0.5) !important;
      border-image-width: 0 !important;
      :deep(.el-table__header-wrapper) {
        border-radius: 0;
      }
    }
  }
}
:deep(.el-form-item) {
  margin-bottom: 0;
}
:deep(.empty) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  .emptyImg {
    width: 118px;
    height: auto;
  }
  .emptyText {
    margin-top: 12px;
    line-height: 15px;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
</style>
