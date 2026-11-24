<template>
  <div :class="{mapContaienr:true,lightMapContaienr:modeStore.mode==='light'}">
    <div class="mapHeader">
      <div class="titleContainer">
        <div :class="{cancel:true, lightCancel:modeStore.mode==='light'}" v-show="deepTree.length>1" @click="handleBack">
          <i class="iconfont icon-zuo"></i>
          <span>返回</span>
        </div>
        <div class="SLine" v-show="deepTree.length>1"></div>
        <div class="mapTitle" v-show="deepTree.length>1">
          {{mapTitle}}
        </div>

        <div class="mapTitle" v-show="deepTree.length<2">
          <commonSubTitle :text="mapTitle" :mode="modeStore.mode"></commonSubTitle>
        </div>
      </div>
      <div class="mapName">
        山东省
      </div>
    </div>
    <div class="chart-box" ref="chartRef"></div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch, nextTick } from 'vue'
import { mapOption } from '../mapOption'
import lodash from 'lodash'
import * as $echarts from 'echarts'
import { useEcharts } from '@/hooks/useEcharts.js'
import { getPointDetail } from '@/api/api_dataMonitor.js'
import { echartsToPx, addThousandSeparator } from '@/utils/utils'
const chartRef = ref(null)
const { setOptions, getInstance } = useEcharts(chartRef)
const chartInstance = ref('')

import {
  getChinaJson,
  getProvinceJson,
  getCityJson,
  getDistrictJson
} from '@/api/map.js'
import { useModeStore } from '@/store/modeStore'
const modeStore = useModeStore()
const props = defineProps({
  mapData: {
    type: Array,
    default: () => {
      return []
    }
  },
  mapTitle: {
    type: String,
    default: ''
  }
})
const colorConfig = ref({
  darkBorderColor: 'rgba(255, 234, 97, 1)',
  darkAreaColor: 'rgba(108, 139, 255, 0.1)',
  darkLabelColor: 'rgba(255, 234, 97, 1)',
  darkLabelTitleColor: '#fff',
  darkLabelLbColor: '#C8C8C8',
  darkLabelvalColor: '#FFEA61',
  darkPointsColor: '#FFEA61',
  darkBgColor: 'rgba(0,0,0,0.6)',

  lightBorderColor: '#fff',
  lightAreaColor: 'rgba(192, 217, 253, 1)',
  lightLabelColor: '#3670F8',
  lightLabelTitleColor: '#1F1F1F',
  lightLabelLbColor: '#646464',
  lightLabelvalColor: '#5571DF',
  lightPointsColor: '#3670F8',
  lightBgColor: 'rgba(0,0,0,0.6)'
})

watch(() => modeStore.mode, () => {
  const mode = modeStore.mode
  option.geo = {
    ...option.geo,
    ...setGeo()
  }
  option.series[0] = {
    ...option.series[0],
    label: {
      formatter: '{a}{b}',
      position: 'right',
      color: colorConfig.value[mode + 'LabelColor'],
      fontSize: echartsToPx(12),
      show: true
    },
    emphasis: {
      scale: true,
      label: {
        show: true,
        padding: [echartsToPx(14), echartsToPx(16)],
        formatter(params) {
          const arr = [`{a|${params.name}}`, '{w|}']
          params.data.disease?.forEach((item, index) => {
            if (index > (params.data.disease?.length - 2)) {
              arr.push(
                `{p|}{d|${lodash.get(item, 'name')}： }{e|${addThousandSeparator(lodash.get(item, 'value'))}}`
              )
            } else {
              arr.push(
                `{p|}{b|${lodash.get(item, 'name')}： }{c|${addThousandSeparator(lodash.get(item, 'value'))}}`
              )
              arr.push('{w|}')
            }
          })
          return arr.join('\n')
        },
        backgroundColor: 'rgba(0,0,0,0.6)',
        shadowColor: 'rgba(0,0,0,0)',
        shadowBlur: echartsToPx(8),
        borderRadius: echartsToPx(2),
        verticalAlign: 'middle',
        position: 'top',
        distance: echartsToPx(70),
        rich: {
          a: {
            fontSize: echartsToPx(12),
            fontWeight: '500',
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
            lineHeight: echartsToPx(17),
            height: echartsToPx(17),
            fontWeight: 500
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
            padding: [0, 0, 0, 0]
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
      shadowColor: colorConfig.value[mode + 'PointsColor']
    }
  }
  setOptions(option, true)
})
const flatMapData = ref([])
watch(() => props.mapData, () => {
  let pointData = []
  const filterPointData = []
  let max = 0
  flatMapData.value = treeToArr(props.mapData)
  pointData = filterData(props.mapData)
  pointData.forEach((item, index) => {
    if ((item.value - 0) > max) {
      max = item.value - 0
    }
    filterPointData.push({
      name: item.name,
      id: item.id,
      mapLevel: item.mapLevel,
      value: [item.longitude - 0, item.latitude - 0, item.value]
    })
  })
  const mode = modeStore.mode
  option.series = [{
    name: '',
    type: 'effectScatter',
    coordinateSystem: 'geo',
    rippleEffect: {
      brushType: 'stroke'
    },
    label: {
      formatter: '{a}{b}',
      position: 'right',
      color: colorConfig.value[mode + 'LabelColor'],
      fontSize: echartsToPx(12),
      show: true
    },
    itemStyle: {
      color: colorConfig.value[mode + 'PointsColor'],
      shadowBlur: 2,
      shadowColor: '#333'
    },
    data: filterPointData,
    symbolSize: function(val) {
      const value = val[2]
      let size = value / max * 50
      if (size < 10) {
        size = 10
      }
      return echartsToPx(size)
    },
    showEffectOn: 'render' // 加载完毕显示特效
  }]

  setOptions(option, true)
})
const option = reactive({ ...mapOption.basicOption })
const mapDataList = ref([])
const deepTree = reactive([])
const areaLevel = ref(1)
const areaCode = ref('370000')
const areaName = ref('山东省')
const level = ref('')
const hospitalInfo = ref({})
const currentAdcode = ref('')
const searchContent = ref('')
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
onMounted(() => {
  initCharts()
})

const filterData = (allData) => {
  let filterData = []
  const fn = (arr) => {
    arr.forEach(item => {
      if (item.id === areaCode.value) {
        filterData = item.children
      } else if (item.children) {
        fn(item.children)
      }
    })
  }
  fn(allData)
  return filterData
}
const treeToArr = (allData) => {
  const filterData = []
  const fn = (arr) => {
    arr.forEach(item => {
      filterData.push(item)
      if (item.children) {
        fn(item.children)
      }
    })
  }
  fn(allData)
  return filterData
}
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
    mapCodeList.unshift(res.features[i].properties.adcode)
  }
  mapDataList.value = mapDataList
  setMapData(res, params)
}
// 地图点击
const echartsMapClick = (v, isOper) => {
  // isOper 判断是不是由操作人在页面上点击进来的
  // 不是医院或者省级/市级需要忽略,逻辑暂时不删除,后续可能需要点进去
  let params = ''
  let obj = ''
  if (!v.data) {
  // 没有data,点击的地图,判断是否有数据
    obj = lodash.find(flatMapData.value, { name: v.name })
    params = {
      data: {
        ...obj,
        adcode: obj?.id
      }
    }
  } else {
    return
  }
  if (!obj) {
    return
  }
  level.value = lodash.get(params, 'data.mapLevel')
  hospitalInfo.value = lodash.get(params, 'data')
  currentAdcode.value = params.data.adcode
  if (params.data.mapLevel === '5') {
    if (!isOper) {
      searchContent.value = params.data.hospitalCode
    }
  }
  areaName.value = params.data.name
  areaLevel.value = params.data.mapLevel
  // dataLevel.value = params.data.level
  if (lodash.find(maplevelList.value, { value: params.data.mapLevel }).name === 'province') {
    option.series[0].data = params.data
    requestGetProvinceJSON(params.data)
  } else if (lodash.find(maplevelList.value, { value: params.data.mapLevel }).name === 'city') {
    requestGetCityJSON(params.data)
  } else if (lodash.find(maplevelList.value, { value: params.data.mapLevel }) === 'district' && mapDataList.value.length > 1) {
    requestGetDistrictJSON(params.data)
  } else if (lodash.find(maplevelList.value, { value: params.data.mapLevel }) === 'hospital') {
    // 如果重复点击返回会有问题
    requestGetCityJSON(params.data)
  } else {
    return false
  }
}
const handlePoints = (params) => {
  let max = 0
  const filterPointData = []
  params.children.forEach((item, index) => {
    if ((item.value - 0) > max) {
      max = item.value - 0
    }
    filterPointData.push({
      name: item.name,
      id: item.id,
      mapLevel: item.mapLevel,
      value: [item.longitude - 0, item.latitude - 0, item.value]
    })
  })
  option.series[0].data = filterPointData
  option.series[0].symbolSize = function(val) {
    const value = val[2]
    let size = value / max * 50
    if (size < 10) {
      size = 10
    }
    return echartsToPx(size)
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
    if (params.children) {
      handlePoints(params)
    }

    renderMap(params.name, mapDataList.value)
  }
}
// const highlight = ref(false)
const chartTitle = ref('全国')
// const currentMap = ref('')
// const currentData = ref('')
// 渲染地图
const renderMap = (map, data) => {
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
  option.geo = {
    map,
    data,
    ...setGeo()
  }
  // 这儿是地图层级发生变化的时候清除label
  if (option.series?.length >= 2) {
    option.series = [option.series[0]]
  }

  // 渲染地图
  setOptions(option, true)
  if (!chartInstance.value) {
    chartInstance.value = getInstance()
    chartInstance.value.on('click', echartsMapClick)
    chartInstance.value.on('mouseover', async(params) => {
    // params.dataIndex 是当前鼠标所在点的索引
    // params.data 是当前鼠标所在点的数据
      if (params.componentType === 'series') {
        let obj = lodash.find(labelData.value, { id: params.data.id })

        if (!obj) {
          await getPointerDetailFn({
            id: params.data.id,
            type: lodash.find(maplevelList.value, { value: params.data.mapLevel }).name
          }, params)
          obj = lodash.find(labelData.value, { id: params.data.id })
        }
        params.data.disease = obj.disease
        option.animation = false
        const mode = modeStore.mode
        option.series[0] = {
          ...option.series[0],
          emphasis: {
            scale: true,
            label: {
              show: true,
              padding: [echartsToPx(14), echartsToPx(16)],
              formatter(params) {
                const arr = [`{a|${params.name}}`, '{w|}']
                params.data.disease?.forEach((item, index) => {
                  if (index > (params.data.disease?.length - 2)) {
                    arr.push(
                      `{p|}{d|${lodash.get(item, 'name')}： }{e|${addThousandSeparator(lodash.get(item, 'value'))}}`
                    )
                  } else {
                    arr.push(
                      `{p|}{b|${lodash.get(item, 'name')}： }{c|${addThousandSeparator(lodash.get(item, 'value'))}}`
                    )
                    arr.push('{w|}')
                  }
                })
                return arr.join('\n')
              },
              backgroundColor: 'rgba(0,0,0,0.6)',
              shadowColor: 'rgba(0,0,0,0)',
              shadowBlur: echartsToPx(8),
              borderRadius: echartsToPx(2),
              verticalAlign: 'middle',
              position: 'top',
              distance: echartsToPx(70),
              rich: {
                a: {
                  fontSize: echartsToPx(12),
                  fontWeight: '500',
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
                  lineHeight: echartsToPx(17),
                  height: echartsToPx(17),
                  fontWeight: 500
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
                  padding: [0, 0, 0, 0]
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
            shadowColor: colorConfig.value[mode + 'PointsColor']
          }
        }
        option.series[0].data.forEach(item => {
          if (item.id === params.data.id) {
            item.disease = lodash.get(obj, 'disease') || []
          }
        })
        setOptions(option, false)
      }
    })
  }
}
const getPointerDetailFn = (params, obj) => {
  return new Promise((resolve) => {
    getPointDetail(params).then(res => {
      labelData.value.push({
        ...obj.data,
        disease: lodash.get(res, 'data.disease') || []
      })
      resolve()
    })
  })
}
const labelData = ref([])
const setGeo = () => {
  const mode = modeStore.mode
  return {
    type: 'map',
    roam: 'move',
    // z: 3,
    zoom: 1,
    label: {
      show: false,
      color: colorConfig.value[mode + 'LabelColor'],
      fontSize: 12,
      formatter: p => {
        return p.name
      }
    },
    select: {
      itemStyle: {
        areaColor: 'rgba(2,37,101,.8)'
      }
    },
    emphasis: {
      label: {
        color: '#f75a00',
        fontWeight: 700,
        fontSize: echartsToPx(18),
        show: false
      },
      itemStyle: {
        areaColor: colorConfig.value[mode + 'AreaColor'],
        borderColor: colorConfig.value[mode + 'BorderColor'],
        borderWidth: 1.6
      }
    },
    itemStyle: {
      areaColor: colorConfig.value[mode + 'AreaColor'],
      borderColor: colorConfig.value[mode + 'BorderColor'],
      borderType: mode === 'dark' ? [2, 5] : 0,
      borderDashOffset: 2
    }
  }
}
const handleBack = () => {
  if (deepTree.length > 1) {
    deepTree.pop()
    detailBack()
  }
}
const detailBack = () => {
  const newMap = deepTree[deepTree.length - 1]
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
  const obj = lodash.find(flatMapData.value, { name: newMap.params.name })
  if (obj) {
    handlePoints(obj)
  }

  nextTick(() => {
    renderMap(areaName.value, mapDataList.value)
  })
}
</script>
<style lang="scss">
.mapContaienr,
.chart-box {
  width: 100%;
  height: 100%;
}
.mapContaienr {
  position: relative;
  &.lightMapContaienr {
    .mapHeader {
      .mapTitle {
        font-size: 16px;
        color: var(--theme-text);
      }
      .SLine {
        border-right: 1px solid #cbcfdc;
      }
      .mapName {
        color: var(--theme-primary);
      }
    }
  }
  .mapHeader {
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 100;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    // padding: 24px;
    background: transparent;
    .titleContainer {
      display: flex;
      align-items: center;
      flex: 1;
    }
    .mapTitle {
      flex: 1;
      font-size: 16px;
      color: #fff;
    }
    .SLine {
      width: 0;
      height: 16px;
      margin: 0 16px;
      border-right: 1px solid  rgba(129, 167, 255, 0.1);
    }
    .mapName {
      display: flex;
      position: absolute;
      right: 16px;
      top: 16px;
      justify-content: center;
      align-items: center;
      width: 126px;
      height: 54px;
      background: url(@/assets/mapTitleBg.png) no-repeat;
      background-size: contain;
      font-weight: 500;
      font-size: 18px;
      color: #fff;
    }
  }
  .cancel {
    display: flex;
    z-index: 3;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    text-align: center;
    font-size: 16px;
    color: #6694ff;
  }
  .lightCancel {
    background: var(--theme-card);
    color: #6694ff;
  }
}
</style>
