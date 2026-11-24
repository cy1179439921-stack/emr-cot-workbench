// mixins.js
import { ref, watch, nextTick } from 'vue'
import _ from 'lodash'
import { variableData } from '@/components/dataAnalysis/utils/variableData'
// 获取变量
export const leftData = ref([])
export const leftAllData = ref([])
export const allSearch = ref('')
export const leftActiveObj = ref([])
// 左侧拖拽区域分组
export const groupLeft = ref({
  name: 'groupA',
  put: true
})
export const rightData1 = ref([])
export const rightData2 = ref([])
export const rightData3 = ref([])
export const rightData4 = ref([])
export const rightData5 = ref([])
export const rightActiveObj = ref([])
// 监听leftData
watch(() => leftData.value, (nVal, oVal) => {
  console.log(11, nVal.length, oVal.length)
  // 若nVal值长度大于oVal值长度，说明是从右侧拖入左侧
  if (nVal.length > oVal.length && allSearch.value === '') {
    leftAllData.value = _.cloneDeep(leftData.value)
  } else if (nVal.length > oVal.length && allSearch.value !== '') {
  // allSearch.value = ''
    nextTick(() => {
    // 对比nVal和oVal，看看是多的哪个变量
      const diffArr = _.differenceWith(nVal, oVal, (arrVal, oArrVal) => {
        return arrVal.name === oArrVal.name
      })
      if (diffArr.length > 0) {
        const waitIndex = diffArr[0].index
        // 按顺序插入到左侧leftData
        if (leftAllData.value.length === 0) {
          leftAllData.value.push(diffArr[0])
        } else if (waitIndex < leftAllData.value[0].index) {
          leftAllData.value.splice(0, 0, diffArr[0])
        } else if (waitIndex > leftAllData.value[leftAllData.value.length - 1].index) {
          leftAllData.value.push(diffArr[0])
        } else {
          for (let i = 0; i < leftAllData.value.length - 1; i++) {
            if (leftAllData.value[i].index < waitIndex && leftAllData.value[i + 1].index > waitIndex) {
              leftAllData.value.splice(i + 1, 0, diffArr[0])
            }
          }
        }
      }
    })
    nextTick(() => {
      leftData.value = _.cloneDeep(leftAllData.value).filter(item => item.name.includes(allSearch.value))
    })
  }
}, {
  deep: true
})
export const getAllVariables = (val) => {
  variableData.forEach((item, index) => {
    item.index = index
  })
  let filterV = ''
  if (val === '定量') {
    filterV = ['S']
  } else if (val === '定性') {
    filterV = ['N', 'O']
  }
  if (filterV) {
    leftData.value = _.cloneDeep(variableData.filter(item => filterV.includes(item.type)))
    leftAllData.value = _.cloneDeep(variableData.filter(item => filterV.includes(item.type)))
  } else {
    leftData.value = _.cloneDeep(variableData)
    leftAllData.value = _.cloneDeep(variableData)
  }
}
export const onEndLeft = (evt) => {
  if (leftActiveObj.value) {
    leftActiveObj.value = leftActiveObj.value.filter(item => leftData.value.some(dataItem => dataItem.name === item.name))
  }
}
export const clickMultiLeft = (item) => {
  if (leftActiveObj.value) {
    const objIndex = leftActiveObj.value.findIndex(d => d === item)
    if (objIndex === -1) {
      leftActiveObj.value.push(item)
    } else {
      leftActiveObj.value.splice(objIndex, 1)
    }
  } else {
    leftActiveObj.value = [item]
  }
}
export const toMultiLeft = (value, type, rightData) => {
  rightActiveObj.value.forEach(item => {
    if (!type || (type === 'S' && item.type === 'S') || (type === '!S' && item.type !== 'S')) {
      const objIndex = rightData.findIndex(obj => obj.name === item.name)
      if (objIndex === -1) {
        return false
      }
      rightData.splice(objIndex, 1)
      const waitIndex = item.index
      // 按顺序插入到左侧leftData
      if (!allSearch.value || item.name.includes(allSearch.value)) {
        if (leftData.value.length === 0) {
          leftData.value.push(item)
        } else if (waitIndex < leftData.value[0].index) {
          leftData.value.splice(0, 0, item)
        } else if (waitIndex > leftData.value[leftData.value.length - 1].index) {
          leftData.value.push(item)
        } else {
          for (let i = 0; i < leftData.value.length - 1; i++) {
            if (leftData.value[i].index < waitIndex && leftData.value[i + 1].index > waitIndex) {
              leftData.value.splice(i + 1, 0, item)
            }
          }
        }
      }
      // 按顺序插入到左侧完整数据leftAllData
      if (leftAllData.value.length === 0) {
        leftAllData.value.push(item)
      } else if (waitIndex < leftAllData.value[0].index) {
        leftAllData.value.splice(0, 0, item)
      } else if (waitIndex > leftAllData.value[leftAllData.value.length - 1].index) {
        leftAllData.value.push(item)
      } else {
        for (let i = 0; i < leftAllData.value.length - 1; i++) {
          if (leftAllData.value[i].index < waitIndex && leftAllData.value[i + 1].index > waitIndex) {
            leftAllData.value.splice(i + 1, 0, item)
          }
        }
      }
    }
  })
  // debugger
  if (type === 'S') {
    rightActiveObj.value = rightActiveObj.value.filter(item => item.type !== 'S')
  } else if (type === '!S') {
    rightActiveObj.value = rightActiveObj.value.filter(item => item.type === 'S')
  } else {
    rightActiveObj.value = []
  }
}
export const toMultiRight = (value, rightData) => {
  leftActiveObj.value.forEach(item => {
    const objIndex = leftAllData.value.findIndex(obj => obj.name === item.name)
    leftAllData.value.splice(objIndex, 1)
    const objIndex2 = leftData.value.findIndex(obj => obj.name === item.name)
    leftData.value.splice(objIndex2, 1)
    rightData.value.push(item)
    leftActiveObj.value = []
  })
}
export const searchAll = (text) => {
  let oldData = _.cloneDeep(leftAllData.value)
  // 排除掉右侧已经有的
  rightData1.value.forEach(item => {
    oldData = oldData.filter(item2 => item2.name !== item.name)
  })
  if (rightData2.value) {
    rightData2.value.forEach(item => {
      oldData = oldData.filter(item2 => item2.name !== item.name)
    })
  }
  if (rightData3.value) {
    rightData3.value.forEach(item => {
      oldData = oldData.filter(item2 => item2.name !== item.name)
    })
  }
  if (rightData4.value) {
    rightData4.value.forEach(item => {
      oldData = oldData.filter(item2 => item2.name !== item.name)
    })
  }
  if (rightData5.value) {
    rightData5.value.forEach(item => {
      oldData = oldData.filter(item2 => item2.name !== item.name)
    })
  }
  leftData.value = oldData.filter(item => item.name.includes(text))
}

