import { ref } from 'vue'
import { getAllVariables, getAnalysisResult } from '@/api/api_dataAnalysis.js'
// import { emitter } from '@/utils/bus'
import { ElMessage } from 'element-plus'
// 左侧拖拽区域分组
export const groupLeft = ref({
  name: 'groupA',
  put: true
})

export const useData = (
  leftAllData,
  leftData,
  allSearch,
  leftActiveObj,
  rightActiveObj
) => {
  const init = async (type, dataOperateId, jumpData, callback) => {
    const { code, data } = await getAllVariables({
      id: dataOperateId
    })
    if (code === 10000) {
      data.forEach((item, index) => {
        item.index = index
      })
      let variables = ''
      let filterV = ''
      if (type === '定量') {
        filterV = [1]
      } else if (type === '定性') {
        filterV = [0]
      } else {
        filterV = [0, 1]
      }
      // if (filterV) {
      variables = data.filter((item) => filterV.includes(item.dataProperty))
      // } else {
      //   variables = data
      // }
      leftAllData.value = variables
      leftData.value = variables
      // console.log(999, jumpData)
      if (jumpData) {
        callback(jumpData)
      }
    } else {
      return []
    }
  }
  // 检索全部变量
  const searchAll = () => {
    console.log(allSearch.value)
    leftData.value = leftAllData.value.filter((item) =>
      item.label.toLowerCase().includes(allSearch.value.toLowerCase())
    )
  }
  // 左侧变量有变化
  const changeLeftData = (event) => {
    console.log('左侧变化了', event)
    if (event.added) {
      const changeItem = event.added.element
      // 判断leftAllData中是否存在changeItem，不存在则将changeItem加入leftAllData
      const index = leftAllData.value.findIndex(
        (item) => item.label === changeItem.label
      )
      if (index === -1) {
        const waitIndex = changeItem.index
        // 按顺序插入到左侧leftData
        if (leftAllData.value.length === 0) {
          leftAllData.value.push(changeItem)
        } else if (waitIndex < leftAllData.value[0].index) {
          leftAllData.value.splice(0, 0, changeItem)
        } else if (
          waitIndex > leftAllData.value[leftAllData.value.length - 1].index
        ) {
          leftAllData.value.push(changeItem)
        } else {
          for (let i = 0; i < leftAllData.value.length - 1; i++) {
            if (
              leftAllData.value[i].index < waitIndex &&
              leftAllData.value[i + 1].index > waitIndex
            ) {
              leftAllData.value.splice(i + 1, 0, changeItem)
            }
          }
        }
      }
    } else if (event.removed) {
      const changeItem = event.removed.element
      // 判断leftAllData中是否存在changeItem，存在则将changeItem从leftAllData中移除
      const index = leftAllData.value.findIndex(
        (item) => item.label === changeItem.label
      )
      if (index !== -1) {
        leftAllData.value.splice(index, 1)
      }
      // 如果leftActiveObj中存在changeItem，则将changeItem从leftActiveObj中移除
      if (leftActiveObj.value) {
        const objIndex = leftActiveObj.value.findIndex((d) => d === changeItem)
        if (objIndex !== -1) {
          leftActiveObj.value.splice(objIndex, 1)
        }
      }
    }
    searchAll()
  }
  // 允许左侧多选, multiType为'single'时单选，否则为多选
  const clickMultiLeft = (item, multiType) => {
    if (multiType === 'single') {
      leftActiveObj.value = [item]
    } else {
      if (leftActiveObj.value) {
        const objIndex = leftActiveObj.value.findIndex((d) => d === item)
        if (objIndex === -1) {
          leftActiveObj.value.push(item)
        } else {
          leftActiveObj.value.splice(objIndex, 1)
        }
      } else if (!leftActiveObj.value) {
        leftActiveObj.value = [item]
      }
    }
  }
  // 允许右侧多选, multiType为'single'时单选，否则为多选
  const clickMultiRight = (item, multiType, s_rightActiveObj = rightActiveObj) => {
    if (multiType === 'single') {
      s_rightActiveObj.value = [item]
    } else {
      const objIndex = s_rightActiveObj.value.findIndex((d) => d === item)
      if (objIndex === -1) {
        s_rightActiveObj.value.push(item)
      } else {
        s_rightActiveObj.value.splice(objIndex, 1)
      }
    }
  }
  // 右移事件
  const toMultiRight = (rightData) => {
    leftActiveObj.value.forEach((item) => {
      const objIndex = leftAllData.value.findIndex(
        (obj) => obj.label === item.label
      )
      leftAllData.value.splice(objIndex, 1)
      rightData.value.push(item)
    })
    searchAll()
    leftActiveObj.value = []
  }
  // 左移事件
  const toCommonMultiLeft = (value, type, rightData, rightActiveObj) => {
    console.log('rightActiveObj.value', rightActiveObj.value)
    rightActiveObj.value.forEach((item) => {
      if (
        !type ||
        (type === 1 && item.dataProperty === 1) ||
        (type !== 1 && item.dataProperty !== 1)
      ) {
        const objIndex = rightData.value.findIndex(
          (obj) => obj.label === item.label
        )
        if (objIndex === -1) {
          return false
        }
        rightData.value.splice(objIndex, 1)
        const waitIndex = item.index
        // 按顺序插入到左侧完整数据leftAllData
        if (leftAllData.value.length === 0) {
          leftAllData.value.push(item)
        } else if (waitIndex < leftAllData.value[0].index) {
          leftAllData.value.splice(0, 0, item)
        } else if (
          waitIndex > leftAllData.value[leftAllData.value.length - 1].index
        ) {
          leftAllData.value.push(item)
        } else {
          for (let i = 0; i < leftAllData.value.length - 1; i++) {
            if (
              leftAllData.value[i].index < waitIndex &&
              leftAllData.value[i + 1].index > waitIndex
            ) {
              leftAllData.value.splice(i + 1, 0, item)
            }
          }
        }
      }
    })
    searchAll()
    if (type === 1) {
      // 只要定量,过滤掉非定量
      rightActiveObj.value = rightActiveObj.value.filter(
        (item) => item.dataProperty !== 1
      )
    } else if (type && type !== 1) {
      // 只要定性,过滤掉非定性
      rightActiveObj.value = rightActiveObj.value.filter(
        (item) => item.dataProperty === 1
      )
    } else {
      rightActiveObj.value = []
    }
  }
  // 发送请求
  const sendRequest = async (isAntdSix, currentNode, newDataOperateId, params, emits, otherParams = {}) => {
    // emitter.emit('showLoadingSpecial')
    if (isAntdSix) {
      emits('saveData', params)
      ElMessage.success('操作成功')
      return
    }
    emits('showLoading', true)
    if (newDataOperateId.value) {
      // 组装java请求参数
      const newParams = {
        bigGroup: currentNode.groupName,
        smallGroup: currentNode.name,
        dataOperateId: newDataOperateId.value,
        params,
        apiName: currentNode.apiName
      }
      const { code, data, msg } = await getAnalysisResult(newParams, currentNode.path)
      if (code === 10000) {
        data.showAnalysisResult = true
        emits('getResultData', {
          name: currentNode.name,
          node_id: data.newDataOperateId,
          coreFlag: 0,
          coreDescription: '',
          ...data.result,
          ...otherParams
        }, '分析')
        newDataOperateId.value = data.newDataOperateId
        ElMessage.success(msg || '操作成功')
      }
    }
  }
  // 发送请求-新
  const sendRequestNew = async (isAntdSix, currentNode, newDataOperateId, params, emits, otherParams = {}) => {
    // emitter.emit('showLoadingSpecial')
    if (isAntdSix) {
      emits('saveData', params)
      ElMessage.success('操作成功')
      return
    }
    emits('showLoading', true)
    if (newDataOperateId.value) {
      // 组装java请求参数
      const newParams = {
        bigGroup: currentNode.groupName,
        smallGroup: currentNode.name,
        dataOperateId: newDataOperateId.value,
        ...params
      }
      const { code, data, msg } = await getAnalysisResult(newParams, currentNode.path)
      if (code === 10000) {
        data.showAnalysisResult = true
        emits('getResultData', {
          name: currentNode.name,
          node_id: data.newDataOperateId,
          coreFlag: 0,
          coreDescription: '',
          ...data.result,
          ...otherParams
        }, '分析')
        newDataOperateId.value = data.newDataOperateId
        ElMessage.success(msg || '操作成功')
      }
    }
  }
  // 快速选择变量
  const selectVariable = (dlCount, dxCount) => {
    const variables1 = leftData.value.filter((item) => item.dataProperty === 1).slice(0, dlCount)
    const variables2 = leftData.value.filter((item) => item.dataProperty === 0).slice(0, dxCount)
    leftActiveObj.value = variables1.concat(variables2)
  }

  return {
    init,
    changeLeftData,
    searchAll,
    clickMultiLeft,
    clickMultiRight,
    toMultiRight,
    toCommonMultiLeft,
    sendRequest,
    sendRequestNew,
    selectVariable
  }
}
