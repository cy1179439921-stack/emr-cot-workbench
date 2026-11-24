
import { ref } from 'vue'
import { getAllVariables, getChartData } from '@/api/api_dataAnalysis.js'
import lodash from 'lodash'
import { verticalBarChartBasicOption, histogramChartBasicOption } from '@/components/dataAnalysis/engineeringLibrary/common/echartsConfig.js'
import { useDataFilterHook } from '@/hooks/dataFilterHook.js'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import { nowDate } from '@/utils/utils.js'

export const useDataConversionResultNHook = (formData, props) => {
  const { filteredList } = useDataFilterHook()
  const echartsOptions = ref({})
  const initParams = ref({})
  const currentVar = ref({})
  const dataList = ref([])
  const dataOperateId = ref('')
  const crrentVarList = ref([])

  const getDataList = (colNumber) => {
    getAllVariables({ id: dataOperateId.value }).then(v => {
      dataList.value = v.data || []
      if (colNumber) {
        currentVar.value = dataList.value.find(item => item.colNumber === colNumber)
      }
    })
  }
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
    })
  }

  // 图片导出命
  const handleName = (label) => {
  // 工程名称_变量名_数据视图_年月日时分秒
    return `${props.engineeringInfo?.name}_${props.titleObj.name}_${label}_${nowDate(new Date())}`
  }

  // 下载图片
  const handleDownload = (label) => {
    const el = document.getElementById('chartBox')
    html2canvas(el).then(async canvas => {
      try {
        canvas.toBlob(function (blob) {
          fileDownload(blob, handleName(label) + '.png')
        })
      } catch (err) {
        console.error(err.name, err.message)
      }
    })
  }

  return { dataOperateId, currentVar, filteredList, dataList, echartsOptions, crrentVarList, getChartsDataFn, getDataList, handleDownload, isShowCharts }
}
