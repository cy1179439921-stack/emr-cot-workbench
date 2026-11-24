import { ref, onMounted, onUnmounted } from 'vue'
import Dexie from 'dexie'

export function useIndexedDB(dbName = 'myDatabase', storeName = 'myStore') {
  const db = ref(null)
  const isReady = ref(false)

  const initDB = () => {
    db.value = new Dexie(dbName)
    db.value.version(1).stores({ [storeName]: 'id' })
    isReady.value = true
  }

  const addItem = async (item) => {
    return await db.value[storeName].add(item)
  }

  const putItem = async (item) => {
    return await db.value[storeName].put(item) // 如果 item.id 存在，则更新；不存在则新增
  }

  const getItem = async (id) => {
    return await db.value[storeName].get(id)
  }

  const getAllItems = async () => {
    return await db.value[storeName].toArray()
  }

  const deleteItem = async (id) => {
    return await db.value[storeName].delete(id)
  }

  const getStorageUsage = async () => {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage, // 已使用的字节数
        quota: estimate.quota, // 总存储配额
        usagePercentage: ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%'
      }
    }
    return null
  }

  onMounted(initDB)

  onUnmounted(() => {
    db.value = null
  })

  return {
    isReady,
    addItem,
    putItem,
    getItem,
    getAllItems,
    deleteItem,
    getStorageUsage
  }
}
