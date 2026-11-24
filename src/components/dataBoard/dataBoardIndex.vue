<template>
  <div :class="{dataBoardIndex:true,darkBoardIndex: modeStore.mode==='dark'}">
    <div class="dataContent">
      <div class="indexOverview">
        <div class="title common-title">
          <div class="flag"></div>
          <div>基础指标统计表</div>
        </div>
        <div class="indexOverviewContent">
          <div
            v-for="(item, index) in indexOverview"
            :key="index"
            :style="`background:${item.bgc}`"
            class="indexItem"
          >
            <div class="value">
              {{ addThousandSeparator(overViewData[item.prop] ||item.value||0)}}
            </div>
            <div class="label">{{ item.label }}</div>

          </div>
        </div>
      </div>
      <div class="dataOverview">
        <div class="header">
          <div class="title common-title">
            <div class="flag"></div>
            <div>实时数据概览</div>
          </div>
          <div class="queryContainer" :class="'queryDimension' + queryDimension">
            <div :class="{queryItem:true,actived:queryDimension===1}" @click="handelQuery(1)">日</div>
            <div :class="{queryItem:true,actived:queryDimension===2}" @click="handelQuery(2)">月</div>
          </div>
        </div>
        <div class="dataOverviewContent">
          <div
            v-for="(item, index) in dataOverview"
            :key="index"
            class="dataItem"
          >
            <div class="valContainer">
              <div
                class="value"
                :style="`color:${item.color}`"
                :title="(queryDimension === 1 ?overViewData[item.dayProp]:overViewData[item.monthProp])||0">
                {{ (queryDimension === 1 ?addThousandSeparator(overViewData[item.dayProp]):addThousandSeparator(overViewData[item.monthProp])||0) }}
              </div>
              <div class="preData">
                <span class="preLabel">{{ queryDimension === 1 ? '昨日：': '上月：' }}</span>
                <span
                  class="preVal"
                  :title="queryDimension === 1?overViewData[item.subData.dayProp]:overViewData[item.subData.monthProp]">
                  {{ queryDimension === 1?addThousandSeparator(overViewData[item.subData.dayProp]):addThousandSeparator(overViewData[item.subData.monthProp]) }}
                </span>
              </div>
            </div>

            <div class="label" >
              <span
                :title="queryDimension === 1 ? '当日' + item.label : '当月' + item.label">
                {{queryDimension === 1 ? '当日' + item.label : '当月' + item.label}}
              </span>
              <!-- <span
                v-if="index>2"
                :title="queryDimension === 1 ? '昨日' + item.label : '上月' + item.label">
                {{queryDimension === 1 ? '昨日' + item.label : '上月' + item.label}}
              </span> -->
            </div>

          </div>
        </div>
      </div>
    </div>
    <div class="mainContent">
      <div class="leftTree">
        <div class="header">
          <div class="title">医院导航</div>
          <CommonInput
            v-model="filterText"
            placeholder="搜索名称"
            class="search"
            clearable
          />
        </div>
        <div :class="{treeContainer:true,darkTreeContainer:modeStore.mode==='dark'}">
          <el-scrollbar height="100%">
            <el-tree
              class="tree-line"
              ref="myTreeRef"
              :data="treeData"
              :indent="indent"
              node-key="hospitalCode"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :current-node-key="searchContent"
              icon-class="none"
              :highlight-current="true"
              :filter-node-method="filterNode"
              :props="{ class: customNodeClass }"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node" :class="[node.data.highlight ? 'highlight' : '', 'custom-tree-node' + node.data.mapLevel]">
                  <!-- <div :class="node.expanded?'expanded pointer':'pointer'" v-if="data.children"></div> -->
                  <div
                    v-if="data.children"
                    @click="handelMap(node,data)"
                    :class="currentAdcode===(data.adcode+'000000')?'name expanded':'name'"
                    v-show-tip>
                    <!-- {{ data.name}} -->
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      :popper-class="modeStore.mode==='dark'?'darkModeTooltip':''"
                      :content="data.name"
                      placement="bottom"
                      :open-delay="400"
                      :enterable="false"
                      :hide-after="0"
                    >
                      <span class="treeLabel">{{data.name}}</span>
                    </el-tooltip>
                  </div>
                  <div
                    v-if="!data.children"
                    @click="handelSelect(node,data)"
                    :class="searchContent&&searchContent===data.id&&level==='hospital'?'expanded name':'name'"
                    v-show-tip
                  >
                    <!-- {{ data.name}} -->
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      :popper-class="modeStore.mode==='dark'?'darkModeTooltip':''"
                      :content="data.name"
                      placement="bottom"
                      :open-delay="400"
                      :enterable="false"
                      :hide-after="0"
                    >
                      <span class="treeLabel">{{data.name}}</span>
                    </el-tooltip>
                  </div>
                  <!-- <span v-if="data.children" @click="handleExpanded(node,data)">
                    <i v-if="!node.expanded" class="icon el-icon-arrow-right"></i>
                    <i v-if="node.expanded" class="icon el-icon-arrow-down"></i>
                  </span> -->
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
      </div>
      <div class="mapContaienr">
        <div v-show="level!=='hospital'" class="chart-box" ref="chartRef">
          <div class="empty" v-if="loadingStatus">
            <div class="pixel-spinner">
              <div class="pixel-spinner-inner"></div>
            </div>
            <span class="emptyText" :class="{ 'loading': loadingStatus }">{{ loadingStatus ? '加载中' : '这里还没有内容' }}</span>
          </div>
        </div>
        <Hospital
          @cancel="detailBack"
          v-if="level==='hospital'"
          :hospitalInfo="hospitalInfo"
        ></Hospital>
        <div class="cancel" v-show="deepTree.length>1&&level!=='hospital'" @click="back">
          <i class="iconfont icon-zuo"></i>
          <span>返回</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup name="dataBoardIndex">
import { ref, reactive, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { mapOption } from './mapOption'
import lodash from 'lodash'
import { echartsToPx, addThousandSeparator } from '@/utils/utils.js'
import * as $echarts from 'echarts'
import Hospital from '@/components/dataBoard/components/Hospital.vue'
import {
  getChinaJson,
  getProvinceJson,
  getCityJson,
  getDistrictJson
} from '@/api/map.js'
// import { getAllAgencyByCity } from '@/api/api_home.js'
import { dataBoardBasicData, getOverviewData, getTreeData, getAgencyNum } from '@/api/api_bigScreen.js'
// import hospitalData from './hospitalData'
import { useEcharts } from '@/hooks/useEcharts.js'

const chartRef = ref(null)
const { setOptions, getInstance } = useEcharts(chartRef)
const chartInstance = ref('')
import { useModeStore } from '@/store/modeStore'
const modeStore = useModeStore()
const queryDimension = ref(1)

const indexOverview = ref([
  {
    label: '哨点医院总数',
    prop: 'agencyNum',
    bgc: 'linear-gradient(360deg, #86DCF6 0%, #489FE1 100%, rgba(255,211,67,0) 100%);'
  },
  {
    label: '病案总数',
    prop: 'reportTotalNum',
    bgc: 'linear-gradient(360deg, #7FAEFF 0%, #5974F9 100%, rgba(255,211,67,0) 100%);'
  },
  {
    label: '符合检测病种总数',
    prop: 'matchReportTotalNum',
    bgc: 'linear-gradient(360deg, #FFD343 0%, #FF9900 100%, #FFD343 100%);'
  },
  {
    label: '完成标准化总数',
    prop: 'standardTotalNum',
    bgc: 'linear-gradient(360deg, #91EB8C 0%, #32C578 100%, rgba(255,211,67,0) 100%, #82D794 100%);'
  }
])

const dataOverview = ref([
  {
    label: '哨点医院上报',
    dayProp: 'currentDayReportTotalNum',
    monthProp: 'currentMonthReportTotalNum',
    color: '#333',
    subData: {
      dayProp: 'preDayReportTotalNum',
      monthProp: 'preMonthReportTotalNum'
    }
  },
  {
    label: '符合检测病种上报',
    dayProp: 'matchCurrentDayReportTotalNum',
    monthProp: 'matchCurrentMonthReportTotalNum',
    color: '#333',
    subData: {
      dayProp: 'matchPreDayReportTotalNum',
      monthProp: 'matchPreMonthReportTotalNum'
    }
  },
  {
    label: '已处理病案',
    dayProp: 'currentDayStandardTotalNum',
    monthProp: 'currentMonthStandardTotalNum',
    color: '#333',
    subData: {
      dayProp: 'preDayStandardTotalNum',
      monthProp: 'preMonthStandardTotalNum'
    }
  }
  // {
  //   label: '哨点医院上报',
  //   dayProp: 'preDayReportTotalNum',
  //   monthProp: 'preMonthReportTotalNum',
  //   color: '#646464'
  // },
  // {
  //   label: '符合检测病种上报',
  //   dayProp: 'matchPreDayReportTotalNum',
  //   monthProp: 'matchPreMonthReportTotalNum',
  //   color: '#646464'
  // },
  // {
  //   label: '已处理病案',
  //   dayProp: 'preDayStandardTotalNum',
  //   monthProp: 'preMonthStandardTotalNum',
  //   color: '#646464'
  // }
])
const overViewData = ref({})
const filterText = ref('')
const option = reactive({ ...mapOption.basicOption })
const mapDataList = ref([])
const deepTree = reactive([])
// const commonEchartsRef = ref('')
const areaLevel = ref(0)
const areaCode = ref('000000000000')
const areaName = ref('china')
const level = ref('')
const hospitalInfo = ref({})
const currentAdcode = ref('')
const searchContent = ref('')
const myTreeRef = ref('')
const loadingStatus = ref(true)
onMounted(async () => {
  await getAllAgencyFn()
  getAgencyNum().then(res => {
    overViewData.value.agencyNum = res.data
  })
  loadingStatus.value = false
  initCharts()

  window.addEventListener('resize', resizeHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHeight)
})
watch(() => modeStore.mode, () => {
  const titleColor = modeStore.mode === 'dark' ? '#fff' : '#5571DF'
  option.title.textStyle.color = titleColor
  option.geo = {
    ...option.geo,
    ...setGeo()
  }
  setSeries()
  setOptions(option, true)
})
watch(filterText, (val) => {
  myTreeRef.value.filter(val)
})
const indent = ref(echartsToPx(20))
const resizeHeight = () => {
  indent.value = echartsToPx(20)
}
const colorConfig = ref({
  darkBorderColor: 'rgba(255, 234, 97, 1)',
  darkAreaColor: 'rgba(108, 139, 255, 0.1)',
  darkLabelColor: 'rgba(255, 234, 97, 1)',
  darkLabelTitleColor: '#fff',
  darkLabelLbColor: '#C8C8C8',
  darkLabelvalColor: '#FFEA61',
  darkPointsColor: '#FFEA61',
  darkBgColor: 'rgba(0,0,0,0.6)',
  darkEmphasisLabelColor: '#FAC858',
  lightBorderColor: '#fff',
  lightAreaColor: 'rgba(192, 217, 253, 1)',
  // lightLabelColor: 'rgba(106, 104, 186, 1)',
  lightLabelColor: '#5571df',
  lightLabelTitleColor: '#1F1F1F',
  lightLabelLbColor: '#646464',
  lightLabelvalColor: '#5571DF',
  lightPointsColor: '#3670F8',
  lightBgColor: '#fff',
  lightEmphasisLabelColor: '#3670F8'
})

const setGeo = () => {
  const mode = modeStore.mode
  return {
    show: true,
    scaleLimit: {
      min: 0.5,
      max: 10
    },
    animationDurationUpdate: true,
    roam: true, // 是否开启平游或缩放
    ...mapOption.seriesOption,
    zoom: areaLevel.value === 1 ? 0.7 : 1, // 当前视角的缩放比例
    type: 'map',
    label: {
      show: true,
      color: colorConfig.value[mode + 'LabelColor'],
      fontSize: echartsToPx(14),
      formatter: p => {
        if (p.name === '香港特别行政区') {
          return '香港'
        } else if (p.name === '澳门特别行政区') {
          return '\n\n澳门'
        } else {
          return p.name
        }
      }
    },
    select: {
      itemStyle: {
        fontSize: echartsToPx(14),
        areaColor: 'rgba(2,37,101,.8)'
      }
    },
    emphasis: {
      label: {
        color: colorConfig.value[mode + 'EmphasisLabelColor'],
        fontWeight: 700,
        fontSize: echartsToPx(18)
      },
      itemStyle: {
        areaColor: colorConfig.value[mode + 'AreaColor'],
        borderColor: colorConfig.value[mode + 'BorderColor'],
        borderWidth: echartsToPx(1.6)
      },
      show: true
    },
    itemStyle: {
      areaColor: colorConfig.value[mode + 'AreaColor'],
      borderColor: colorConfig.value[mode + 'BorderColor'],
      borderType: mode === 'dark' ? [2, 5] : 0,
      borderDashOffset: 2
    }
  }
}
const filterNode = (value, data) => {
  if (!value) return true
  return data.name.includes(value)
}
// eslint-disable-next-line no-unused-vars
const formatDataTree = (data) => {
  const res = [] // 用于存储递归结果（扁平数据）
  // 递归函数
  const fn = (source) => {
    source.forEach((el) => {
      res.push(el)
      if (el.children) {
        fn(el.children)
      }
      // el.children && el.children.length > 0 ? fn(el.children, el.mapLevel === 'city' ? el : '') : '' // 子级递归
    })
  }
  fn(data)
  return res
}
const handelQuery = (val) => {
  queryDimension.value = val
}
const hospitalLabel = ref([])
// const treeData = reactive(hospitalData[0].children)
const treeData = ref([])
const formatDataTree2 = (arr) => {
  const flatArr = []
  const fn = (initData) => {
    initData.forEach(item => {
      item.adcode = item.id
      item.value = [lodash.get(item, 'longitude'), lodash.get(item, 'latitude')]
      flatArr.push(item)
      if (item.children) {
        fn(item.children)
      }
    })
  }
  fn(arr)
  return flatArr
}
const getAllAgencyFn = () => {
  return new Promise((resolve, reject) => {
    getTreeData({}).then(res => {
      const data = lodash.get(res, 'data') || []
      hospitalLabel.value = formatDataTree2(data)
      data.forEach(item => {
        item.provinceId = item.id
        if (item.children) {
          item.children.forEach(child => {
            child.provinceId = item.id
            if (child.children) {
              child.children.forEach(grandson => {
                grandson.provinceId = item.id
              })
            }
          })
        }
      })
      treeData.value = data
      resolve()
    })
  })
}
// eslint-disable-next-line no-unused-vars
const dataBoardBasicDataFn = () => {
  return new Promise((resolve, reject) => {
    dataBoardBasicData({ agency: [] }).then(res => {
      if (res.code === 10000) {
        res.data.forEach(v => {
          // hospitalLabel.forEach((item, index) => {
          //   if (item.childrenName && item.childrenName.includes(v.agencyName) && item.mapLevel === 'city') {
          //     if (v.agencyId) {
          //       item.matchReportTotalNum += (v.matchReportTotalNum - 0)
          //       item.standardTotalNum += (v.standardTotalNum - 0)
          //       item.reportTotalNum += (v.reportTotalNum - 0)
          //     }
          //   } else if (item.mapLevel === 'hospital' && item.agencyId === v.agencyId) {
          //     hospitalLabel[index] = {
          //       ...item,
          //       ...v
          //     }
          //     item = {
          //       ...item,
          //       ...v
          //     }
          //   } else if (item.mapLevel === 'province' || item.mapLevel === 'china') {
          //     if (v.agencyId) {
          //       item.matchReportTotalNum += (v.matchReportTotalNum - 0)
          //       item.standardTotalNum += (v.standardTotalNum - 0)
          //       item.reportTotalNum += (v.reportTotalNum - 0)
          //     }
          //   }
          // })
        })
      }
      resolve()
    })
  })
}

// getAllAgencyFn()
const getOverviewDataFn = () => {
  getOverviewData().then(res => {
    if (res.code === 10000) {
      overViewData.value = {
        ...overViewData.value,
        ...res.data
      }
    }
  })
}
getOverviewDataFn()
const initCharts = () => {
  if (areaLevel.value === 0) {
    requestGetChinaJson()
  } else if (areaLevel.value === 1) {
    requestGetProvinceJSON({
      name: areaName.value,
      mapLevel: 'province',
      adcode: areaCode.value.substr(0, 6)
    })
  } else if (areaLevel.value === 2) {
    requestGetCityJSON({
      name: areaName.value,
      mapLevel: 'city',
      adcode: areaCode.value.substr(0, 6)
    })
  } else if (areaLevel.value === 3) {
    requestGetDistrictJSON({
      name: areaName.value,
      mapLevel: 'district',
      adcode: areaCode.value.substr(0, 6)
    })
  } else {
    return false
  }
}
// 绘制全国地图areaStatistic
const requestGetChinaJson = () => {
  getChinaJson().then((res) => {
    areaLevel.value = 0
    setJsonData(res)
  })
}
const requestGetProvinceJSON = (params) => {
  getProvinceJson(params.adcode).then((res) => {
    areaLevel.value = 1
    setJsonData(res, params)
  })
}
// 加载市级地图
const requestGetCityJSON = (params) => {
  getCityJson(params.adcode).then((res) => {
    areaLevel.value = 2
    setJsonData(res, params)
  })
}
// 加载县级地图
const requestGetDistrictJSON = (params) => {
  getDistrictJson(params.adcode).then((res) => {
    areaLevel.value = 3
    setJsonData(res, params)
  })
}
const _mathRandom1000 = () => {
  return (Math.random() * 1000).toFixed(0) * 1
}
const setJsonData = (res, params) => {
  const mapDataList = []
  const mapNameList = []
  const mapCodeList = []
  for (let i = 0; i < res.features.length; i++) {
    const obj = {
      ...res.features[i].properties,
      value: _mathRandom1000(),
      valueData: _mathRandom1000()
    }
    mapDataList.unshift(obj)
    mapNameList.unshift(res.features[i].properties.name)
    mapCodeList.unshift(res.features[i].properties.adcode + '000000')
  }
  mapDataList.value = mapDataList
  setMapData(res, params)
}
const currentLableData = ref([])
const maplevelList = ref([
  {
    name: 'province',
    value: 0
  },
  {
    name: 'city',
    value: 1
  },
  {
    name: 'district',
    value: 2
  },
  {
    name: 'agency',
    value: 5
  }
])
// 地图点击
const echartsMapClick = (params, isOper) => {
  // 不是医院或者省级/市级需要忽略,逻辑暂时不删除,后续可能需要点进去
  console.log('参数', params)
  if (!params.data) {
    // 点击的地图而不是点位
    const obj = lodash.find(hospitalLabel.value, { name: params.name })
    console.log(obj)
    params.data = obj
  }
  const currentLevel = lodash.find(maplevelList.value, { value: params.data?.mapLevel })?.name || ''
  if (params.data?.mapLevel === 5) {
    // 进入医院详情
    level.value = 'hospital'
    hospitalInfo.value = lodash.get(params, 'data')
    return
  }

  if (
    !params.data ||
    !['province', 'city'].includes(currentLevel)
  ) {
    return
  }

  level.value = lodash.get(params, 'data.mapLevel')
  hospitalInfo.value = lodash.get(params, 'data')
  currentAdcode.value = params.data.adcode + '000000'
  areaName.value = params.data.name
  areaLevel.value = params.data.mapLevel
  if (currentLevel === 'province') {
    requestGetProvinceJSON(params.data)
  } else if (currentLevel === 'city') {
    requestGetCityJSON(params.data)
  } else if (currentLevel === 'district' && mapDataList.value.length > 1) {
    requestGetDistrictJSON(params.data)
  } else if (currentLevel === 'hospital') {
    console.log('需要处理的地方', '&& !this.highlight')
    // 如果重复点击返回会有问题
    // requestGetCityJSON(params.data)
  } else {
    return false
  }
}
// 设置地图信息
const setMapData = (res, params) => {
  if (areaName.value === 'china') {
    deepTree.push({
      mapDataList: mapDataList.value,
      params: { name: 'china', mapLevel: 'country', adcode: '100000' }
    })
    // 注册地图
    $echarts.registerMap('china', res)
    // 绘制地图
    renderMap('china', mapDataList.value)
  } else {
    deepTree.push({ mapDataList, params })
    $echarts.registerMap(params.name, res)
    renderMap(params.name, mapDataList.value, params)
  }
}
// const highlight = ref(false)
const chartTitle = ref('全国')
// 渲染地图
const renderMap = (map, data, params) => {
  chartTitle.value = map === 'china' ? '全国' : map
  const mapDataList = data.map((item) => {
    return {
      name: item.name,
      value: item.value
    }
  })
  mapDataList.value = mapDataList.sort(function (a, b) {
    return b.value - a.value
  })
  const titleColor = modeStore.mode === 'dark' ? '#fff' : '#3670F8'
  option.title = {
    text: chartTitle,
    right: echartsToPx(60),
    top: echartsToPx(30),
    textStyle: {
      fontSize: echartsToPx(24),
      fontWeight: 500,
      color: titleColor
    }
  }
  option.geo = {
    map,
    data,
    ...setGeo()
  }
  currentLableData.value = map === 'china' ? treeData.value : (lodash.get(params, 'children') || [])
  setSeries()
  // 渲染地图
  setOptions(option, true)
  if (!chartInstance.value) {
    chartInstance.value = getInstance()
    chartInstance.value.on('click', echartsMapClick)
    // 绑定 itemMouseover 事件
    chartInstance.value.on('mouseover', function (params) {
    // params.dataIndex 是当前鼠标所在点的索引
    // params.data 是当前鼠标所在点的数据
      if (params.componentType === 'series') {
        // 发送 AJAX 请求
      }
    })
  }
}
const setSeries = () => {
  const mode = modeStore.mode
  option.series = [
    {
      name: '',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      data: currentLableData.value,
      symbolSize: echartsToPx(10),
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      emphasis: {
        scale: true,
        label: {
          show: true,
          padding: [echartsToPx(14), echartsToPx(16)],
          formatter(params) {
            const arr = [
              `{a|${params.name}}`,
              '{w|}',
              `{p|}{b|医院等级： }{c|${lodash.get(params, 'data.grade') || ''}}`,
              '{w|}',
              `{p|}{b|哨点上报总数： }{c|${addThousandSeparator(lodash.get(params, 'data.reportTotalNum')) || 0}}`,
              '{w|}',
              `{p|}{b|符合监测病种总数： }{c|${addThousandSeparator(lodash.get(params, 'data.matchReportTotalNum')) || 0}}`,
              '{w|}',
              `{p|}{d|完成标准化总数： }{e|${addThousandSeparator(lodash.get(params, 'data.standardTotalNum')) || 0}}`
            ]
            if (params.data.mapLevel !== 'hospital') {
              arr.splice(1, 2)
            }
            return arr.join('\n')
          },
          position: 'top',
          distance: echartsToPx(70),
          backgroundColor: 'rgba(0,0,0,0.6)',
          shadowColor: 'rgba(0,0,0,0)',
          shadowBlur: echartsToPx(8), // 0px 3px 8px 0px
          borderRadius: echartsToPx(2),
          verticalAlign: 'middle',
          rich: {
            a: {
              fontSize: echartsToPx(12),
              fontWeight: '500',
              lineHeight: echartsToPx(17),
              padding: [0, 0, 0, 0],
              color: '#fff'
            },
            b: {
              fontSize: echartsToPx(12),
              fontWeight: 400,
              color: '#fff',
              height: echartsToPx(17),
              lineHeight: echartsToPx(17),
              padding: [0, 0, 0, echartsToPx(5)]
            },
            c: {
              fontSize: echartsToPx(14),
              color: '#FAC858',
              height: echartsToPx(17),
              fontWeight: 500,
              lineHeight: echartsToPx(17),
              padding: 0
            },
            d: {
              fontSize: echartsToPx(12),
              fontWeight: 400,
              color: '#fff',
              height: echartsToPx(17),
              lineHeight: echartsToPx(17),
              padding: [0, 0, 0, echartsToPx(5)]
            },
            e: {
              fontSize: echartsToPx(14),
              color: '#FAC858',
              height: echartsToPx(17),
              fontWeight: 500,
              lineHeight: echartsToPx(17),
              padding: 0
            },
            p: {
              width: echartsToPx(3),
              height: echartsToPx(3),
              color: '#FAC858',
              backgroundColor: '#FAC858',
              padding: 0,
              borderRadius: echartsToPx(1.5)
            },
            w: {
              height: echartsToPx(10)
            }
          }
        }
      },
      itemStyle: {
        color: colorConfig.value[mode + 'PointsColor'],
        shadowBlur: echartsToPx(10),
        shadowColor: '#333'
      }
    }
  ]
}
const highlightNode = (node) => {
  if (node) {
    const parentNode = myTreeRef.value.getNode(node)
    if (parentNode) {
      // 这里可以设置高亮的样式，例如更改背景色
      // parentNode.highlight = true
      if (parentNode.level !== 0) {
        parentNode.data.highlight = true
      }
    }
  }
}
const highlightParentNodes = (node) => {
  if (node.parent) {
    highlightNode(node.parent)
    highlightParentNodes(node.parent)
  }
}
// 清除最大父节点的其他兄弟高亮节点
const clearHighlight = (node) => {
  treeData.value.forEach(item => {
    if (node.provinceId !== item.id) {
      item.highlight = false
      item.children.forEach(child => {
        child.highlight = false
      })
    }
  })
}
const handelMap = (node, data) => {
  searchContent.value = ''
  echartsMapClick({ data }, true)
  // 清除最大父节点的其他兄弟高亮节点
  clearHighlight(node)
  // 高亮当前节点的父节点
  highlightParentNodes(node)
}
const handelSelect = (node, data) => {
  searchContent.value = data.id
  const trueData = lodash.find(hospitalLabel.value, { id: searchContent.value })
  echartsMapClick({ data: trueData }, true)
  // 清除其他高亮节点
  clearHighlight(node)
  // 高亮当前节点的父节点
  highlightParentNodes(node)
}

const back = () => {
  if (deepTree.length > 1) {
    deepTree.pop()
    detailBack()
  }
}
const detailBack = () => {
  mapDataList.value = deepTree[deepTree.length - 1].mapDataList
  const areaNameValue = deepTree[deepTree.length - 1].params.name
  const areaCodeValue = deepTree[deepTree.length - 1].params.adcode
  const areaLevelValue = deepTree[deepTree.length - 1].params.mapLevel
  areaName.value = areaNameValue
  areaLevel.value = areaLevelValue
  currentAdcode.value = areaCodeValue + '000000'
  const areaLevelMap = {
    country: 0,
    china: 0,
    province: 1,
    city: 2,
    district: 3,
    hospital: 4
  }
  level.value = areaLevelMap[areaLevel]
  areaCode.value = (areaCodeValue === '100000' ? '000000' : areaCodeValue) + '000000'
  nextTick(() => {
    renderMap(areaName.value, mapDataList.value, deepTree[deepTree.length - 1].params)
  })
}
const customNodeClass = (data, node) => {
  if (data.children?.length === 1) {
    return 'onlyOne'
  }
  return null
}
</script>
<style lang="scss" scoped>
.dataBoardIndex {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 100%;
  padding: 0 16px;
  .dataContent {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 189px;
    margin-bottom: 16px;
    .common-title {
      display: flex;
      align-items: center;
      height: 22px;
      .flag {
        width: 2px;
        height: 14px;
        margin-right: 5px;
        background-color: var(--theme-primary);
      }
    }
    .indexOverview,
    .dataOverview {
      box-sizing: border-box;
      width: calc(50% - 7px);
      height: 100%;
      padding: 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      .title {
        margin-bottom: 24px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
    }
    .indexOverview {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      .indexOverviewContent {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;
        .indexItem {
          display: flex;
          overflow: hidden;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          width: calc(25% - 12px);
          height: 95px;
          padding-top: 17px;
          padding-bottom: 18px;
          // border: 1px solid transparent;
          border-radius: 4px;
          .label {
            overflow: hidden;
            text-overflow: ellipsis;
            // height: 56px;
            // margin-bottom: 30px;
            text-align: center;
            font-weight: 500;
            font-size: 14px;
            color: #fff;
            white-space: nowrap;
          }
          .value {
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            font-family: D-Din;
            font-weight: 700;
            font-size: 32px;
            color: #fff;
            white-space: nowrap;
          }
        }
      }
    }
    .dataOverview {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      padding-top: 18px;
      .header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .title {
          flex: 1;
          margin-bottom: 0;
        }
        .queryContainer {
          display: flex;
          align-items: center;
          &.queryDimension1 {
            .queryItem:nth-child(1) {
              border-top-right-radius: 0;
              border-bottom-right-radius: 0;
            }
            .queryItem:nth-child(2) {
              border-left-color: transparent;
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
            }
          }
          &.queryDimension2 {
            .queryItem:nth-child(2) {
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
            }
            .queryItem:nth-child(1) {
              border-right-color: transparent;
              border-top-right-radius: 0;
              border-bottom-right-radius: 0;
            }
          }
          .queryItem {
            position: relative;
            z-index: 4;
            z-index: 1;
            box-sizing: border-box;
            width: 46px;
            height: 32px;
            border: 1px solid #d8d8d8;
            border-radius: 2px;
            cursor: pointer;
            line-height: 32px;
            text-align: center;
            font-size: 14px;
            color: #5e6e78;
            // &:nth-child(2) {
            //   margin-left: -1px;
            // }
            &.actived {
              z-index: 2;
              border: 1px solid var(--theme-primary);
              color: var(--theme-primary);
            }
          }
        }
      }
      .dataOverviewContent {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;
        .dataItem {
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: calc(33.33% - 10px);
          height: 95px;
          padding: 19px 24px;
          border-radius: 4px;
          background: rgba(54, 112, 248, 0.03);
          .valContainer {
            display: flex;
            align-items: center;
            flex: 1;
            .preData {
              display: flex;
              max-width: 50%;
              font-size: 14px;
              color: var(--theme-primary);
              .preLabel {
                line-height: 20px;
                word-break: keep-all;
              }

              .preVal {
                overflow: hidden;
                width: 100%;
                line-height: 20px;
                text-overflow: ellipsis;
                word-break: keep-all;
              }
            }
          }
          .label {
            overflow: hidden;
            margin-top: 2px;
            line-height: 20px;
            text-overflow: ellipsis;
            font-size: 14px;
            white-space: nowrap;
          }
          .value {
            overflow: hidden;
            flex: 1;
            text-overflow: ellipsis;
            font-family: D-DIN;
            font-weight: 700;
            font-size: 32px;
            color: var(--theme-text);
            white-space: nowrap;
          }
        }
      }
    }
  }
  .mainContent {
    display: flex;
    overflow: hidden;
    align-items: center;
    flex: 1;
    .leftTree {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      box-sizing: border-box;
      width: 258px;
      height: 100%;
      margin-right: 16px;
      padding: 16px 0;
      border-radius: 8px;
      background-color: var(--theme-card);
      .treeContainer {
        overflow-y: auto;
        flex: 1;
        :deep(.el-scrollbar) {
          padding: 0 16px;
        }
        :deep(.el-tree-node__content) {
          overflow: hidden;
          height: auto;
          border-radius: 2px;
        }
        :deep(.el-tree-node__content):hover {
          background-color: transparent;
          .custom-tree-node {
            .name {
              color: var(--theme-primary);
            }
          }
        }
        .custom-tree-node {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
          height: auto;
          &.highlight {
            .name {
              opacity: 1;
              color: var(--el-color-primary) !important;
            }
          }
          &.custom-tree-node0 {
            &.highlight {
              .name {
                font-weight: 500;
                color: var(--theme-primary);
              }
            }
          }
          // margin-right: 8px;
          .name {
            overflow: hidden;
            flex: 1;
            width: 100%;
            height: auto;
            margin-left: 9px;
            line-height: 36px;
            text-overflow: ellipsis;
            font-size: 14px;
            color: var(--theme-text-2);
            word-break: break-all;
            white-space: nowrap;
            // &.expanded {
            //   color: var(--theme-primary);
            // }
          }
          .icon {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
      .title {
        margin-bottom: 16px;
        padding-left: 19px;
        line-height: 19px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
    }
    .mapContaienr {
      overflow: hidden;
      position: relative;
      flex: 1;
      height: 100%;
      border-radius: 8px;
      background-color: var(--theme-card);

      .chart-box {
        width: 100%;
        height: 100%;
      }
      .cancel {
        display: flex;
        position: absolute;
        left: 17px;
        top: 16px;
        justify-content: flex-start;
        height: 32px;
        background: var(--theme-card);
        // box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.16);
        cursor: pointer;
        line-height: 23px;
        font-size: 16px;
        color: var(--el-color-primary);
        i {
          margin-right: -6px;
          font-size: 32px;
        }
      }
    }
  }
}
.darkBoardIndex.dataBoardIndex {
  .common-title {
    .flag {
      background-color: var(--theme-card);
    }
  }
  .dataContent {
    .indexOverview {
      border: 1px solid rgba(129, 167, 255, 0.1);
      background: rgba(129, 167, 255, 0.1);
      .title {
        color: #fff;
      }
      .indexItem {
        box-sizing: border-box;
        border: 1px solid rgba(78, 86, 128, 0.3);
        background: rgba(51, 60, 92, 0.3) !important;
        .label {
          font-weight: 400;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
    .dataOverview {
      border: 1px solid rgba(129, 167, 255, 0.1);
      background: rgba(129, 167, 255, 0.1);
      .header {
        .title {
          color: #fff;
        }
        .queryContainer {
          .queryItem {
            box-sizing: border-box;
            border: 1px solid rgba(255, 255, 255, 0.19);
            background: rgba(7, 6, 23, 0.44);
            color: rgba(255, 255, 255, 0.6);
            &.actived {
              border: 1px solid var(--theme-primary);
              background: var(--theme-primary);
              color: #fff;
            }
          }
        }
      }
      .dataItem {
        border: 1px solid rgba(78, 86, 128, 0.3);
        background: rgba(51, 60, 92, 0.3);
        .label {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .valContainer {

          .value {
            color: #fff !important;
          }
          .preData {
            color: #fac858;
          }
        }
      }
    }
  }
  .mainContent {
    .leftTree {
      border: 1px solid rgba(129, 167, 255, 0.1);
      background: rgba(129, 167, 255, 0.1);
      :deep(.custom-tree-node),
      :deep(.el-tree) {
        background: transparent;
      }
      :deep(.custom-tree-node) {
        .name {
          opacity: 0.6;
          color: #fff !important;
          &.expanded {
            color: #fff;
          }
        }
      }
      :deep(.el-tree-node__expand-icon) {
        color: #fff;
      }
      :deep(.el-tree-node__content):hover {
        background-color: transparent;
        .custom-tree-node {
          .name {
            opacity: 1;
            color: #fff !important;
          }
        }
      }
      .custom-tree-node {
        &.highlight {
          .name {
            color: #fff !important;
          }
        }
        &.custom-tree-node0 {
          &.highlight {
            .name {
              color: #fff;
            }
          }
        }
      }
      .title {
        color: #fff;
      }
      .search {
        :deep(.el-input__wrapper) {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: none;
        }
        :deep(.el-input__prefix-inner) {
          color: rgba(255, 255, 255, 0.6);
        }
        :deep(.el-input__inner) {
          color: #fff;
        }
      }
    }
    .mapContaienr {
      box-sizing: border-box;
      border: 1px solid rgba(129, 167, 255, 0.1);
      background-color: rgba(129, 167, 255, 0.1);
      // background: rgba(129, 167, 255, 0.1);
      .cancel {
        background: transparent;
        color: #fff;
      }
    }
  }
}
:deep(.el-radio-button.is-active .el-radio-button__inner) {
  color: #fff;
}
:deep(.el-radio-button) {
  width: 70px;
}
:deep(.el-radio-button__inner) {
  box-sizing: border-box;
  width: 70px;
  height: 24px;
  padding: 0 7px;
  border: 2px solid var(--theme-primary);
  border-left: 2px solid var(--theme-primary) !important;
  line-height: 20px;
  color: var(--theme-primary);
}
.search {
  height: 32px;
  margin-bottom: 17px;
  padding: 0 16px;
}

:deep(.el-tree-node__expand-icon.expanded),
:deep(.el-tree-node__expand-icon) {
  position: absolute;
  right: 6px;
}
:deep(.el-tree-node__content),
.customTreeNode {
  display: flex;
  align-items: center;
  height: 44px;
  user-select: none;

  .hookImg {
    // margin-left: 10px;
    position: absolute;
    right: 6px;
    width: 10px;
    height: auto;
  }
}

.treeLabel {
  // line-height: 44px;
  // font-weight: 400;
  // font-size: 14px;
  overflow: hidden; /* 隐藏溢出内容 */
  flex: 1;
  // line-height: 20px;
  text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
  // font-weight: 400;
  // font-size: 14px;
  white-space: nowrap;
}
:deep(.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content) {
  background-color: var(--theme-card);
}
:deep(.el-tree-node.is-current) {
  .el-tree-node__content {
    .custom-tree-node {
      .name.expanded {
        // font-weight: 500;
        color: var(--theme-primary);
      }
    }
  }
  & > .el-tree-node__content {
    background-color: rgba(54, 112, 248, 0.05) !important;
  }
}
.darkBoardIndex {
  :deep(.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content) {
    border-radius: 2px;
    background: var(--theme-primary) !important;
    .custom-tree-node .name {
      opacity: 1;
    }
  }
  :deep(.el-tree-node:focus>.el-tree-node__content) {
    background: transparent;
  }
  .empty {
    .emptyText {
      color: var(--theme-text-2);
      &.loading {
        color: #fff;
      }
    }
    .pixel-spinner .pixel-spinner-inner {
      background-color: #9cb9fe;
      color: #9cb9fe;
    }
  }
}
.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  .emptyImg {
    width: 206px;
    height: auto;
  }
  .emptyText {
    margin-top: 14px;
    line-height: 22px;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
:deep(.tree-line) {
  & > .el-tree-node {
    & > .el-tree-node__children {
      padding-left: 0;
      & > .el-tree-node {
        &:not(:first-child) {
          margin-top: 8px;
        }
        & > .el-tree-node__content {
          padding-left: 17px !important;
          .name {
            margin-left: 0;
          }
        }
        & > .el-tree-node__children {
          padding-left: 31px !important;
          .el-tree-node {
            .el-tree-node__content {
              margin-top: 8px;
              padding-left: 15px !important;
              .custom-tree-node {
                .name {
                  margin-left: 0;
                }
              }
            }
          }
        }
      }
      // 竖线
      .el-tree-node::before {
        position: absolute;
        // left: -3px;
        left: -10px;
        top: -30px;
        width: 1px;
        height: 48px;
        border-width: 1px;
        border-left: 1px solid #d8d8d8;
        content: '';
      }
      .el-tree-node:nth-child(1)::before {
        top: 0;
      }
      // 当前层最后一个节点的竖线高度固定
      .el-tree-node:last-child::before {
        height: 48px; // 可以自己调节到合适数值
      }

      // 横线
      .el-tree-node::after {
        position: absolute;
        left: -10px;
        top: 18px;
        width: 9px;
        height: 20px;
        border-width: 1px;
        border-top: 1px solid #d8d8d8;
        content: '';
      }

      // 去掉最顶层的虚线，放最下面样式才不会被上面的覆盖了
      & > .el-tree-node::after {
        border-top: none;
      }
      & > .el-tree-node::before {
        border-left: none;
      }

      // 展开关闭的icon
      .el-tree-node__expand-icon {
        // font-size: 16px;
        // 叶子节点（无子节点）
        &.is-leaf {
          color: transparent;
          // display: none; // 也可以去掉
        }
      }
      .onlyOne {
        > .el-tree-node__children {
          .el-tree-node:last-child::before {
            height: 18px; // 可以自己调节到合适数值
          }
        }
      }
    }
  }
  .el-tree-node {
    position: relative;
    padding-left: 0; // 缩进量
    .custom-tree-node {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      &.actived {
        font-weight: 500;
        // background: red;
        color: var(--el-color-primary);
        .iconfont {
          color: var(--el-color-primary);
        }
      }
    }
    // &:focus>.el-tree-node__content,
    // &.is-current {
    //   .iconfont,
    //   .customTxt {
    //     color: var(--theme-primary) !important;
    //   }
    // }
    // &.is-current > .el-tree-node__content {
    //   background: rgba(54,112,248,0.05); !important;
    // }
  }

  .el-tree-node__children {
    padding-left: 8px; // 缩进量
  }
}
</style>
