import $func from '@/utils/fun.js'
import { ref } from 'vue'
export const searchVal = ref('')
export const departments = ref({
  titleDepartments: [],
  childDepartments: [],
  employees: []
})
export const roles = ref({})
export const getRoleList = async () => {
  roles.value = []
}
export const getDepartmentList = async (parentId = 0) => {
  departments.value = []
}
export const getDebounceData = (event, type = 1) => {
  $func.debounce(async () => {
    if (event.target.value) {
      if (type === 1) {
        departments.value.childDepartments = []
        departments.value.employees = []
      } else {
        roles.value = []
      }
    } else {
      type === 1 ? await getDepartmentList() : await getRoleList()
    }
  })()
}
