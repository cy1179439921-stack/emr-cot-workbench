
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
// eslint-disable-next-line no-unused-vars
import { getAllVariables, saveDataFilter, getChartData } from '@/api/api_dataAnalysis.js'
import lodash from 'lodash'
import { verticalBarChartBasicOption, histogramChartBasicOption } from '@/components/dataAnalysis/engineeringLibrary/common/echartsConfig.js'
export const useDataFilterHook = (resetLoading) => {
  const varTypeList = [
    {
      id: 0,
      label: '定性变量',
      type: 'N'
    },
    {
      id: 1,
      label: '定量变量',
      type: 'S'
    },
    {
      id: 2,
      label: '其他',
      type: 'E'
    }
  ]
  const startComputingOptions = [
    {
      value: '>=',
      label: '≤'
    },
    {
      value: '>',
      label: '<'
    }
  ]
  const endComputingOptions = [
    {
      value: '<=',
      label: '≤'
    },
    {
      value: '<',
      label: '<'
    }
  ]
  const currentVar = ref({})
  const dataList = ref([])
  const dataOperateId = ref('')

  const getDataList = (id) => {
    getAllVariables({ id }).then(v => {
      dataList.value = v.data || []
    })
  }
  const pageSelected = ref([])
  const pageUnSelected = ref([])

  // 合并已选区间
  // eslint-disable-next-line no-unused-vars
  const mergeSelectedRanges = (sortedRanges) => {
    if (!sortedRanges || sortedRanges.length <= 1) return { merged: sortedRanges, mergeIndex: [] }
    // 先按开始值排序
    // const sortedRanges = [...ranges].sort((a, b) => Number(a[0]) - Number(b[0]))
    const merged = []
    let current = sortedRanges[0]
    const mergeIndex = []
    for (let i = 1; i < sortedRanges.length; i++) {
      const [currentStart, currentEnd] = current
      const [nextStart, nextEnd] = sortedRanges[i]

      // 如果当前区间的结束点大于等于下一个区间的开始点，合并区间
      if (Number(currentEnd) >= Number(nextStart)) {
        current = [
          currentStart,
          Number(currentEnd) > Number(nextEnd) ? currentEnd : nextEnd
        ]
        mergeIndex.push(i)
      } else {
        merged.push(current)
        current = sortedRanges[i]
      }
    }
    merged.push(current)
    const res = { merged: (merged || []), mergeIndex: (mergeIndex || []) }
    return res
  }

  // eslint-disable-next-line no-unused-vars
  const findUnselectedRanges = (totalRange, selectedRanges) => {
    // 保持原始精度的数字比较函数
    const isEqual = (a, b) => Math.abs(Number(a) - Number(b)) < 0.000001
    const isLessThan = (a, b) => Number(a) < Number(b) && !isEqual(a, b)

    // 保持原始字符串中的小数位数
    const keepOriginalPrecision = (num) => {
      if (typeof num === 'string') return num
      // 如果是计算结果，转换为字符串并保留所有有效位
      return num.toString()
    }

    const [start, end] = totalRange

    // 排序，但保持原始字符串格式
    const sortedRanges = [...selectedRanges].sort((a, b) => Number(a[0]) - Number(b[0]))

    const unselectedRanges = []
    let currentPosition = start

    for (const [rangeStart, rangeEnd] of sortedRanges) {
      if (isLessThan(currentPosition, rangeStart)) {
        unselectedRanges.push([
          keepOriginalPrecision(currentPosition),
          keepOriginalPrecision(rangeStart)
        ])
      }
      currentPosition = isLessThan(currentPosition, rangeEnd) ? rangeEnd : currentPosition
    }

    if (isLessThan(currentPosition, end)) {
      unselectedRanges.push([
        keepOriginalPrecision(currentPosition),
        keepOriginalPrecision(end)
      ])
    }

    return unselectedRanges
  }
  const isCheckAll = ref(false)
  // eslint-disable-next-line no-unused-vars
  const sectionObj = ref({})
  const changeParamsPage = (obj, view) => {
    pageUnSelected.value = []
    if (obj.dataProperty === 1) {
      // 测试
      // let totalRange = []
      // const selectedRanges = []
      // const currentVarSectionObj = lodash.get(sectionObj.value, currentVar.value.colId)
      // if (currentVarSectionObj) {
      //   totalRange = currentVarSectionObj
      // } else {
      //   if (arr.length > 0) {
      //     totalRange = [arr[0].startValue, arr[0].endValue]
      //   }
      //   sectionObj.value[currentVar.value.colId] = totalRange
      // }

      // let currentRangeArr = []
      // // 有已选区间的情况
      // if (pageSelected.value.length) {
      //   currentRangeArr = lodash.filter(pageSelected.value, { colId: currentVar.value.colId })
      //   currentRangeArr = [...currentRangeArr].sort((a, b) => Number(a.startValue) - Number(b.startValue))
      //   currentRangeArr.forEach(item => {
      //     selectedRanges.push([item.startValue, '' + item.endValue])
      //   })
      // }
      // const mergedSelectedRangesObj = mergeSelectedRanges(selectedRanges) || {}
      // const mergedSelectedRangesArr = mergedSelectedRangesObj.merged || []
      // const result = findUnselectedRanges(totalRange, mergedSelectedRangesArr)
      // // 有合并区间的情况
      // let selectedRangeArr = []
      // if (mergedSelectedRangesArr?.length < currentRangeArr.length) {
      //   const mergeIndex = mergedSelectedRangesObj.mergeIndex || []
      //   let mergeNum = 0
      //   mergedSelectedRangesArr.forEach((item, index) => {
      //     if (mergeIndex.includes(index)) {
      //       mergeNum++
      //     }
      //     selectedRangeArr.push({
      //       colId: currentVar.value.colId,
      //       colNumber: null,
      //       dataProperty: null,
      //       endSymbol: currentRangeArr[index + mergeNum + 1].endSymbol,
      //       endValue: item[1],
      //       indexValue: null,
      //       labelValue: null,
      //       startSymbol: currentRangeArr[index + mergeNum].startSymbol,
      //       startValue: item[0]
      //     })
      //   })
      // } else {
      //   selectedRangeArr = currentRangeArr
      // }
      // lodash.remove(pageSelected.value, { colId: currentVar.value.colId })
      // pageSelected.value = [...pageSelected.value, ...selectedRangeArr]
      // result?.forEach(item => {
      //   pageUnSelected.value.push({
      //     colId: currentVar.value.colId,
      //     colNumber: null,
      //     dataProperty: null,
      //     endSymbol: '<',
      //     endValue: item[1],
      //     indexValue: null,
      //     labelValue: null,
      //     startSymbol: '>',
      //     startValue: item[0]
      //   })
      // })

      lodash.remove(pageSelected.value, { colId: currentVar.value.colId })
      pageSelected.value = [...pageSelected.value, ...(lodash.get(view, 'input') || [])]
      pageUnSelected.value = lodash.get(view, 'output') || []
    } else {
      pageSelected.value = lodash.get(view, 'input', [])
      pageUnSelected.value = lodash.get(view, 'output') || []
    }

    if (pageSelected.value.length && !pageUnSelected.value.length) {
      isCheckAll.value = true
    } else {
      isCheckAll.value = false
    }
  }

  const echartsOptions = ref({})
  const initParams = ref({})
  const isShowCharts = ref(false)
  const getChartsDataFn = (params) => {
    initParams.value = params
    getChartData({
      ...params
    }).then(res => {
      if (res.code !== 10000) {
        isShowCharts.value = false
        return
      }
      isShowCharts.value = true
      if (currentVar.value.dataProperty === 1) {
        const chartsData = lodash.get(res, 'data.view.groupData') || []
        const xAxisData = chartsData.xaxis
        const yAxisData = chartsData.yaxis
        echartsOptions.value = histogramChartBasicOption({
          xAxisData,
          yAxisData,
          type: currentVar.value.dataProperty
        })
      } else {
        const chartsData = lodash.get(res, 'data.view.barData') || []
        const xAxisData = []
        const yAxisData = []
        chartsData.forEach((item) => {
          xAxisData.push(item.name)
          yAxisData.push(item.value)
        })
        echartsOptions.value = verticalBarChartBasicOption({
          xAxisData,
          yAxisData
        })
      }

      changeParamsPage(currentVar.value, lodash.get(res, 'data.view'))
    })
  }
  const checkAll = (isCheck) => {
    // 全选
    if (isCheck) {
      pageSelected.value = [...pageSelected.value, ...pageUnSelected.value]
      pageUnSelected.value = []
      getDataFilter() // 获取右侧参数
    } else {
      // pageSelected.value = []
      console.log('条件置空', pageSelected.value)
      lodash.remove(pageSelected.value, (O) => {
        return O.colId === currentVar.value.colId
      })
      getDataFilter() // 获取右侧参数
    }
  }

  const getDataFilter = () => {
    getChartsDataFn({
      ...initParams.value,
      params: pageSelected.value || []
    })
  }
  const editRange = (value) => {
    if (!value) return ElMessage.error('请填写筛选范围')
    getDataFilter() // 获取右侧参数
  }
  const cancel = (item, index) => {
    pageSelected.value.splice(index, 1)
    pageUnSelected.value.push(item)
    getDataFilter() // 获取右侧参数
  }
  const add = (item, index) => {
    if ((item.startValue && item.endValue) || Number(currentVar.value.dataProperty) === 0) {
      // pageSelected.value.push(item)
      pageSelected.value.push(
        {
          ...item,
          colNumber: currentVar.value.colNumber,
          dataProperty: currentVar.value.dataProperty
        })
      pageUnSelected.value.splice(index, 1)
      getDataFilter() // 获取右侧参数
    } else {
      ElMessage.error('请填写筛选范围')
    }
  }
  const filteredList = computed(() => {
    return pageSelected.value.map(item => item.colId
    )
  })
  const uniSaveFilterList = ref([])
  const savedFilterList = ref([])
  const saveDataFilterFn = () => {
    savedFilterList.value = []
    savedFilterList.value = savedFilterList.value.concat(pageSelected.value)
    if (!pageSelected.value.length) {
      ElMessage.warning('请先选择筛选条件')
      resetLoading()
      return
    }
    saveDataFilter({
      ...initParams.value,
      params: savedFilterList.value
    }).then(res => {
      if (res.code === 10000) {
        pageSelected.value = []
        dataOperateId.value = res.data.dataOperateId
        uniSaveFilterList.value = uniSaveFilterList.value.concat(lodash.get(res.data, 'colNumberList', []))
        ElMessage.success('操作成功')
        getDataList(dataOperateId.value)
      }
    })
  }
  // const uniSaveFilterList = computed(() => {
  //   const savedFilterListArr = savedFilterList.value.map(item => item.colNumber)
  //   console.log('这个是什么', [...new Set(savedFilterListArr)])
  //   return [...new Set(savedFilterListArr)]
  // })
  return {
    startComputingOptions,
    endComputingOptions,
    pageSelected,
    pageUnSelected,
    changeParamsPage,
    varTypeList,
    checkAll,
    editRange,
    cancel,
    add,
    filteredList,
    uniSaveFilterList,
    saveDataFilterFn,
    getDataList,
    dataList,
    currentVar,
    getChartsDataFn,
    echartsOptions,
    dataOperateId,
    isCheckAll,
    isShowCharts
  }
}
