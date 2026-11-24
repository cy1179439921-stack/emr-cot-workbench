// mixins.js
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
// 页面具有的权限
export const getPagePermission = (path) => {
  // 权限
  const userStore = useUserStore()
  const hadPermissionList = ref([])
  const needCheckPermission = ref(userStore.needCheckPermission)
  userStore.userPermissionMenu.forEach(item => {
    // 判断path是字符串还是数组
    if (Array.isArray(path)) {
      if (path.includes(item.url)) {
        hadPermissionList.value.push(item.name)
      }
    } else if (item.url === path) {
      hadPermissionList.value.push(item.name)
    }
  })

  return {
    needCheckPermission,
    hadPermissionList
  }
}
// 获取其他页面权限
export const getOtherPagePermission = (pathArr) => {
  const userStore = useUserStore() // 此行必须在此，不可以移到方法外，否则会出现打包后无法运行问题
  const OtherPagePermissionList = ref([])
  pathArr.forEach(path => {
    const permission = []
    userStore.userPermissionMenu.forEach(item => {
      if (item.url === path) {
        permission.push(item.name)
      }
    })
    OtherPagePermissionList.value.push({
      path,
      permission
    })
  })
  return {
    OtherPagePermissionList
  }
}
