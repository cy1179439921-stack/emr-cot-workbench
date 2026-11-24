// mixins.js
import { getMedicalRecordDetail, getAdminMedicalRecordDetail } from '@/api/api_proofread'
import { useMedicalStore } from '@/store/medicalStore'
const medicalStore = useMedicalStore()
export const getMedicalDetailsData = (props) => {
  return new Promise((resolve, reject) => {
    const params = {
      recordId: props.medicalRecordId,
      contentGroup: ['long_advices', 'short_advices'].includes(props.curMedicalInfo.value) ? 'advices' : props.curMedicalInfo.value
    }
    // 通过判断medicalStore.userAllocateId是否存在来区分管理员和校对员进入，如果是管理员进入则调用getAdminMedicalRecordDetail接口获取数据，校对员进入则调用getMedicalRecordDetail接口获取数据
    const res = medicalStore.userAllocateId
      ? getMedicalRecordDetail(params)
      : getAdminMedicalRecordDetail(params)
    res.then((res) => {
      if (res.code === 10000) {
        resolve(res.data)
      } else {
        reject(res.message)
      }
    })
  })
}
// const oldData = [
//   { id: 101, unit: '秒', name: '111血浆凝血酶原时间测定', range: '9.8--12.1', state: '正常', value: '11.80', index: 0 },
//   { id: 102, unit: '%', name: '血浆凝血酶原时间活动度', range: '70.0--130.0', state: '正常', value: '88.40', index: 1 },
//   { id: 103, unit: '', name: '血浆凝血酶原时间比率', range: '0.83--1.17', state: '正常', value: '0.97', index: 2 },
//   { id: 104, unit: '', name: '血浆凝血酶原标准化比率', range: '0.84--1.16', state: '正常', value: '0.97', index: 3 },
//   { id: 105, unit: 'g/L', name: '纤维蛋白原含量', range: '1.8--3.5', state: '正常', value: '2.64', index: 4 },
//   { id: 106, unit: '秒', name: '活化部分凝血活酶时间', range: '22.7--31.8', state: '正常', value: '29', index: 5 },
//   { id: 107, unit: '', name: '活化部分凝血活酶比率', range: '0.80--1.20', state: '正常', value: '1.09', index: 6 },
//   { id: 108, unit: '秒', name: '血浆凝血酶时间测定', range: '14.0--21.0', state: '正常', value: '16.60', index: 7 },
//   { id: 109, unit: '', name: '凝血酶时间比率', range: '0.80--1.20', state: '正常', value: '0.95', index: 8 },
//   { id: 110, unit: 'mg/L', name: '血浆D二聚体测定', range: '0--0.55', state: '正常', value: '0.29', index: 9 },
//   { id: 111, unit: 'mg/L', name: '纤维蛋白(原)降解产物', range: '0--5.0', state: '正常', value: '2.5', index: 10 }
// ]
// const newData = [
//   { id: 101, unit: '秒', name: '血浆凝血酶原时间测定', range: '9.8--12.1', state: '正常', value: '11.80', index: 0 },
//   { id: 111, unit: 'mg/L', name: '纤维蛋白(原)降解产物', range: '0--5.0', state: '正常', value: '2.5', index: 1 },
//   { id: 102, unit: '%', name: '血浆凝血酶原时间活动度', range: '70.0--130.0', state: '正常', value: '88.40', index: 2 },
//   { id: 103, unit: '', name: '血浆凝血酶原时间比率', range: '0.83--1.17', state: '正常', value: '0.97', index: 3 },
//   { id: 204, unit: '', name: '血浆凝血酶原标准化比率', range: '0.84--1.16', state: '正常', value: '0.97', index: 4 },
//   { id: 105, unit: 'g/L', name: '纤维蛋白原含量', range: '1.8--3.5', state: '正常', value: '2.64', index: 5 },
//   { id: 206, unit: '秒', name: '活化部分凝血活酶时间', range: '22.7--31.8', state: '正常', value: '29', index: 6 },
//   { id: 107, unit: '', name: '活化部分凝血活酶比率', range: '0.80--1.20', state: '正常', value: '1.09', index: 7 },
//   { id: 108, unit: '秒', name: '血浆凝血酶时间测定', range: '14.0--21.0', state: '正常', value: '16.60', index: 8 },
//   { id: 109, unit: '', name: '凝血酶时间比率', range: '0.80--1.20', state: '正常', value: '0.95', index: 9 },
//   { id: 110, unit: 'mg/L', name: '血浆D二聚体测定', range: '0--0.55', state: '正常', value: '0.29', index: 10 }
// ]
// const mergeData = [
//   { id: 101, unit: '秒', name: '血浆凝血酶原时间测定', range: '9.8--12.1', state: '正常', value: '11.80', index: 0, oldunit: '秒', oldname: '111血浆凝血酶原时间测定', oldrange: '9.8--12.1', oldstate: '正常', oldvalue: '11.80' },
//   { id: 111, unit: 'mg/L', name: '纤维蛋白(原)降解产物', range: '0--5.0', state: '正常', value: '2.5', index: 1, oldunit: 'mg/L', oldname: '纤维蛋白(原)降解产物', oldrange: '0--5.0', oldstate: '正常', oldvalue: '2.5', operation: 'move' },
//   { id: 102, unit: '%', name: '血浆凝血酶原时间活动度', range: '70.0--130.0', state: '正常', value: '88.40', index: 2, oldunit: '%', oldname: '血浆凝血酶原时间活动度', oldrange: '70.0--130.0', oldstate: '正常', oldvalue: '88.40', operation: 'move' },
//   { id: 104, unit: '', name: '', range: '', state: '', value: '', index: 3, oldunit: '', oldname: '血浆凝血酶原标准化比率', oldrange: '0.84--1.16', oldstate: '正常', oldvalue: '0.97', operation: 'delete' },
//   { id: 103, unit: '', name: '血浆凝血酶原时间比率', range: '0.83--1.17', state: '正常', value: '0.97', index: 3, oldunit: '', oldname: '血浆凝血酶原时间比率', oldrange: '0.83--1.17', oldstate: '正常', oldvalue: '0.97', operation: 'move' },
//   { id: 204, unit: '', name: '血浆凝血酶原标准化比率', range: '0.84--1.16', state: '正常', value: '0.97', index: 4, oldunit: '', oldname: '', oldrange: '', oldstate: '', oldvalue: '', operation: 'add' },
//   { id: 106, unit: '', name: '', range: '', state: '', value: '', index: 5, oldunit: '秒', oldname: '活化部分凝血活酶时间', oldrange: '22.7--31.8', oldstate: '正常', oldvalue: '29', operation: 'delete' },
//   { id: 105, unit: 'g/L', name: '纤维蛋白原含量', range: '1.8--3.5', state: '正常', value: '2.64', index: 5, oldunit: 'g/L', oldname: '纤维蛋白原含量', oldrange: '1.8--3.5', oldstate: '正常', oldvalue: '2.64', operation: 'move' },
//   { id: 206, unit: '秒', name: '活化部分凝血活酶时间', range: '22.7--31.8', state: '正常', value: '29', index: 6, oldunit: '', oldname: '', oldrange: '', oldstate: '', oldvalue: '', operation: 'add' },
//   { id: 107, unit: '', name: '活化部分凝血活酶比率', range: '0.80--1.20', state: '正常', value: '1.09', index: 7, oldunit: '', oldname: '活化部分凝血活酶比率', oldrange: '0.80--1.20', oldstate: '正常', oldvalue: '1.09', operation: 'move' },
//   { id: 108, unit: '秒', name: '血浆凝血酶时间测定', range: '14.0--21.0', state: '正常', value: '16.60', index: 8, oldunit: '秒', oldname: '血浆凝血酶时间测定', oldrange: '14.0--21.0', oldstate: '正常', oldvalue: '16.60', operation: 'move' },
//   { id: 109, unit: '', name: '凝血酶时间比率', range: '0.80--1.20', state: '正常', value: '0.95', index: 9, oldunit: '', oldname: '凝血酶时间比率', oldrange: '0.80--1.20', oldstate: '正常', oldvalue: '0.95', operation: 'move' },
//   { id: 110, unit: 'mg/L', name: '血浆D二聚体测定', range: '0--0.55', state: '正常', value: '0.29', index: 10, oldunit: 'mg/L', oldname: '血浆D二聚体测定', oldrange: '0--0.55', oldstate: '正常', oldvalue: '0.29', operation: 'move' }
// ]
// const yourData = [
//   { id: 101, unit: '秒', name: '血浆凝血酶原时间测定', range: '9.8--12.1', state: '正常', value: '11.80', index: 0, oldunit: '秒', oldname: '111血浆凝血酶原时间测定', oldrange: '9.8--12.1', oldstate: '正常', oldvalue: '11.80' },
//   { id: 111, unit: 'mg/L', name: '纤维蛋白(原)降解产物', range: '0--5.0', state: '正常', value: '2.5', index: 1, oldunit: 'mg/L', oldname: '纤维蛋白(原)降解产物', oldrange: '0--5.0', oldstate: '正常', oldvalue: '2.5', operation: 'move' },
//   { id: 102, unit: '%', name: '血浆凝血酶原时间活动度', range: '70.0--130.0', state: '正常', value: '88.40', index: 2, oldunit: '%', oldname: '血浆凝血酶原时间活动度', oldrange: '70.0--130.0', oldstate: '正常', oldvalue: '88.40', operation: 'move' },
//   { id: 104, unit: '', name: '', range: '', state: '', value: '', index: 3, oldunit: '', oldname: '血浆凝血酶原标准化比率', oldrange: '0.84--1.16', oldstate: '正常', oldvalue: '0.97', operation: 'delete' },
//   { id: 103, unit: '', name: '血浆凝血酶原时间比率', range: '0.83--1.17', state: '正常', value: '0.97', index: 3, oldunit: '', oldname: '血浆凝血酶原时间比率', oldrange: '0.83--1.17', oldstate: '正常', oldvalue: '0.97', operation: 'move' },
//   { id: 204, unit: '', name: '血浆凝血酶原标准化比率', range: '0.84--1.16', state: '正常', value: '0.97', index: 4, oldunit: '', oldname: '', oldrange: '', oldstate: '', oldvalue: '', operation: 'add' },
//   { id: 106, unit: '', name: '', range: '', state: '', value: '', index: 5, oldunit: '秒', oldname: '活化部分凝血活酶时间', oldrange: '22.7--31.8', oldstate: '正常', oldvalue: '29', operation: 'delete' },
//   { id: 105, unit: 'g/L', name: '纤维蛋白原含量', range: '1.8--3.5', state: '正常', value: '2.64', index: 5, oldunit: 'g/L', oldname: '纤维蛋白原含量', oldrange: '1.8--3.5', oldstate: '正常', oldvalue: '2.64', operation: 'move' },
//   { id: 206, unit: '秒', name: '活化部分凝血活酶时间', range: '22.7--31.8', state: '正常', value: '29', index: 6, oldunit: '', oldname: '', oldrange: '', oldstate: '', oldvalue: '', operation: 'add' },
//   { id: 107, unit: '', name: '活化部分凝血活酶比率', range: '0.80--1.20', state: '正常', value: '1.09', index: 7, oldunit: '', oldname: '活化部分凝血活酶比率', oldrange: '0.80--1.20', oldstate: '正常', oldvalue: '1.09', operation: 'move' },
//   { id: 108, unit: '秒', name: '血浆凝血酶时间测定', range: '14.0--21.0', state: '正常', value: '16.60', index: 8, oldunit: '秒', oldname: '血浆凝血酶时间测定', oldrange: '14.0--21.0', oldstate: '正常', oldvalue: '16.60', operation: 'move' },
//   { id: 109, unit: '', name: '凝血酶时间比率', range: '0.80--1.20', state: '正常', value: '0.95', index: 9, oldunit: '', oldname: '凝血酶时间比率', oldrange: '0.80--1.20', oldstate: '正常', oldvalue: '0.95', operation: 'move' },
//   { id: 110, unit: 'mg/L', name: '血浆D二聚体测定', range: '0--0.55', state: '正常', value: '0.29', index: 10, oldunit: 'mg/L', oldname: '血浆D二聚体测定', oldrange: '0--0.55', oldstate: '正常', oldvalue: '0.29', operation: 'move' }
// ]
// const compareAndMergeData = (oldData, newData) => {
//   const result = []

//   // 创建 oldData 的 id -> item 映射
//   const oldDataMap = new Map(oldData.map(item => [item.id, item]))

//   // 创建 newData 的 id -> item 映射
//   const newDataMap = new Map(newData.map(item => [item.id]))

//   // 1. 先找出 oldData 中被删除的项（id 在 oldData 中但不在 newData 中）
//   const deletedItems = oldData.filter(item => !newDataMap.has(item.id))

//   // 2. 先遍历 newData，构建基础结果
//   newData.forEach((newItem, newIndex) => {
//     const oldItem = oldDataMap.get(newItem.id)

//     if (oldItem) {
//       // id 存在于 oldData 中
//       const mergedItem = { ...newItem }

//       // 添加 old* 前缀的属性
//       mergedItem.oldunit = oldItem.unit
//       mergedItem.oldname = oldItem.name
//       mergedItem.oldrange = oldItem.range
//       mergedItem.oldstate = oldItem.state
//       mergedItem.oldvalue = oldItem.value

//       // 只有 index 不同时才标记为 move
//       if (oldItem.index !== newIndex) {
//         mergedItem.operation = 'move'
//       }

//       result.push(mergedItem)
//     } else {
//       // 新增的项
//       result.push({
//         ...newItem,
//         oldunit: '',
//         oldname: '',
//         oldrange: '',
//         oldstate: '',
//         oldvalue: '',
//         operation: 'add'
//       })
//     }
//   })

//   // 3. 插入被删除的项到原来的 index 位置（按 index 降序，避免插入位置偏移）
//   deletedItems
//     .sort((a, b) => b.index - a.index)
//     .forEach(deletedItem => {
//       const deleteItem = {
//         id: deletedItem.id,
//         unit: '',
//         name: '',
//         range: '',
//         state: '',
//         value: '',
//         index: deletedItem.index,
//         oldunit: deletedItem.unit,
//         oldname: deletedItem.name,
//         oldrange: deletedItem.range,
//         oldstate: deletedItem.state,
//         oldvalue: deletedItem.value,
//         operation: 'delete'
//       }
//       result.splice(deletedItem.index, 0, deleteItem)
//     })

//   return result
// }

// const computedMergeData = compareAndMergeData(oldData, newData)
// console.log('oldData:', oldData)
// console.log('newData:', newData)
// console.log('mergeData:', mergeData, yourData)
// console.log('computedMergeData:', computedMergeData)
