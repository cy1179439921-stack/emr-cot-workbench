<template>
  <div class="roleManage">
    <div class="roleManageContent">
      <div class="left">
        <header>
          <span>角色</span>
          <!-- <span @click="newRole" v-if="!userStore.needCheckPermission || hadPermissionList.includes('新增角色')" class="add">新增 <img :src="iconAdd" /> </span> -->
          <el-button link type="primary" @click="newRole" v-if="!userStore.needCheckPermission || hadPermissionList.includes('新增角色')">新增 <img :src="iconAdd" /></el-button>
        </header>
        <ul class="ul">
          <el-scrollbar>
            <li v-for="(item, index) in roleList" :key="index" :class="{'active': activeRole && activeRole.id === item.id}" @click="handleClickLi(item, true)">
              <span class="content-ellipsis" :title="item.name">{{item.name}}</span>
              <i class="iconfont icon-shanchu2" @click="toDeleteRole(item)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('删除角色')"></i>
            </li>
          </el-scrollbar>
        </ul>
      </div>
      <div class="right" :class="{'editing': isEdit}">
        <div class="right-top">
          <div class="roleDiv">
            <div class="formName readDiv" v-if="!isEdit">
              <span class="activeRoleName content-ellipsis" :title="activeRole.name" v-if="activeRole">{{activeRole.name}}</span>
            </div>
            <div class="formName" v-else>
              <el-form ref="myForm" :model="roleForm" hide-required-asterisk label-position="left" :label-width="pxToRem(77)" :rules="rules">
                <el-form-item label="角色名称" prop="newRoleName">
                  <el-input text placeholder="请填写内容" maxlength="30" show-word-limit v-model="roleForm.newRoleName" @submit.prevent></el-input>
                </el-form-item>
              </el-form>
            </div>
          </div>
          <div class="btnDiv">
            <template v-if="!isEdit">
              <el-button class="deleteBtn" @click="toDeleteRole" v-if="!userStore.needCheckPermission || hadPermissionList.includes('删除角色')">删 除</el-button>
              <el-button type="primary" @click="toEditRoleName" v-if="!userStore.needCheckPermission || hadPermissionList.includes('编辑角色信息')">编 辑</el-button>
            </template>
            <template v-else>
              <el-button @click="cancelEdit">取 消</el-button>
              <el-button type="primary" class="save" @click="saveEdit">保 存</el-button>
            </template>
          </div>
        </div>
        <div class="right-bottom">
          <div class="tabsDiv">
            <ul>
              <li v-for="item in tabs" :key="item.value" :class="{'active': activeTabName === item.value}" @click="handleClickTab(item.value)">
                <div>{{item.label}}</div>
                <div class="bottomLine" ></div>
              </li>
            </ul>
          </div>
          <div class="right-bottom-content">
            <!-- 功能权限 -->
            <div class="roleSection1 roleSection2" v-if="activeTabName === 0">
              <div class="titleDiv" v-if="isEdit">
                <span class="title">全部</span>
                <el-checkbox v-model="functionPermissionCheckAll" :indeterminate="functionPermissionIsIndeterminate" @change="handleFunctionCheckAllChange" :disabled="!isEdit">全选</el-checkbox>
              </div>
              <el-scrollbar>
                <div class="checkboxDiv">
                  <div class="functionDiv" v-for="(first ,firstIndex) in functionPermissionList" :key="firstIndex">
                    <div class="moduleName">
                      <div class="title-flag"></div>
                      <div class="groupName">{{first.groupName}}</div>
                      <el-checkbox v-model="first.checkAll" :indeterminate="first.isIndeterminate" @change="checked => handleFirstLevelCheckAllChange(checked, first, functionPermissionList, 'function')" :disabled="!isEdit" v-if="isEdit">全选</el-checkbox>
                    </div>
                    <div class="permissionDiv" v-for="(second ,secondIndex) in first.children" :key="secondIndex">
                      <div class="labelTitle1">
                        <el-checkbox v-model="second.checkAll" :indeterminate="second.isIndeterminate" @change="checked => handleSecondLevelCheckAllChange(checked, second, first, 'function')" :disabled="!isEdit" v-if="isEdit">{{second.label}}</el-checkbox>
                        <span class="title" v-else>{{second.label}}</span>
                      </div>
                      <div class="thirdLevelBox" v-if="second.children.length > 0 && second.children[0].children">
                        <div class="thirdLevelLine" v-for="(third ,thirdIndex) in second.children" :key="third.label + thirdIndex">
                          <div class="labelTitle2">
                            <el-checkbox v-model="third.checkAll" :indeterminate="third.isIndeterminate" @change="checked => handleThirdLevelCheckAllChange(checked, third, second, first, 'function')" :disabled="!isEdit" v-if="isEdit">{{third.label}}</el-checkbox>
                            <span class="title" v-else>{{third.label}}</span>
                          </div>
                          <el-checkbox-group v-model="third.checkedIds" @change="handleCheckedFunctionChange">
                            <el-checkbox v-for="fourth in third.children" :key="fourth.id" :value="fourth.id" @change="checked => handleFourthFunctionCheckChange(checked, fourth, third, second, first)" :disabled="!isEdit">
                              {{ fourth.label }}
                            </el-checkbox>
                          </el-checkbox-group>
                        </div>
                      </div>
                      <el-checkbox-group v-model="second.checkedIds" @change="handleCheckedFunctionChange" v-else>
                        <el-checkbox v-for="third in second.children" :key="third.id" :value="third.id" @change="checked => handleThirdFunctionCheckChange(checked, third, second, first)" :disabled="!isEdit">
                          {{ third.label }}
                        </el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <!-- 数据权限 -->
            <div class="roleSection1" v-else-if="activeTabName === 1">
              <div class="titleDiv" v-if="isEdit">
                <span class="title">全部</span>
                <el-checkbox v-model="dataPermissionCheckAll" :indeterminate="dataPermissionIsIndeterminate" @change="handleDataCheckAllChange" :disabled="!isEdit">全选</el-checkbox>
              </div>
              <el-scrollbar>
                <div class="checkboxDiv">
                  <template v-for="(province ,provinceIndex) in dataPermissionList" :key="provinceIndex">
                    <div class="functionDiv">
                      <div class="moduleName">
                        <div class="title-flag"></div>
                        <div class="groupName">{{province.label}}</div>
                        <el-checkbox v-model="province.checkAll" :indeterminate="province.isIndeterminate" @change="checked => handleFirstLevelCheckAllChange(checked, province, dataPermissionList, 'data')" :disabled="!isEdit" v-if="isEdit">全选</el-checkbox>
                      </div>
                      <div class="permissionDiv" v-for="(city ,cityIndex) in province.children" :key="cityIndex">
                        <div class="labelTitle1">
                          <el-checkbox v-model="city.checkAll" :indeterminate="city.isIndeterminate" @change="checked => handleSecondLevelCheckAllChange(checked, city, province, 'data')" :disabled="!isEdit" v-if="isEdit">{{city.label}}</el-checkbox>
                          <span class="title" v-else>{{city.label}}</span>
                        </div>
                        <el-checkbox-group v-model="city.checkedIds" @change="handleCheckedThirdLevelChange">
                          <el-checkbox v-for="agengcy in city.children" :key="agengcy.id" :value="agengcy.id" :disabled="!isEdit">
                            <div style="width: 100%;" v-show-tip class="labelContainer">
                              <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="agengcy.label"
                                placement="bottom"
                                :open-delay="400"
                                :enterable="false"
                                :hide-after="0"
                              >
                                <div class="treeLabel" style="max-width: 100%;">{{agengcy.label}}</div>
                              </el-tooltip>
                            </div>
                          </el-checkbox>
                        </el-checkbox-group>
                      </div>
                    </div>

                  </template>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoleManage'
}
</script>
<script setup>
import { ref, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getRoleList, addRole, deleteRole, updateRole } from '@/api/api_role'
import { getMenuRoleTree } from '@/api/api_menu'
import { getAgencyRoleTree } from '@/api/api_agency'
import { SYSTEM_ROLE_ROWS, SYSTEM_MENU_TREE_FLAT, SYSTEM_AGENCY_ROWS } from '@/mock/demoModules'
import iconAdd from '@/assets/icon-add.png'
import _ from 'lodash'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/manage/roleManage') {
    hadPermissionList.value.push(item.name)
  }
})
const roleList = ref([])
const dataPermissionList = ref([])
const functionPermissionList = ref([])
const activeRole = ref(null)
const isEdit = ref(false)
const dataPermissionCheckAll = ref(false)
const dataPermissionIsIndeterminate = ref(false)
const functionPermissionCheckAll = ref(false)
const functionPermissionIsIndeterminate = ref(false)
const tabs = ref([
  {
    label: '功能权限',
    value: 0
  },
  {
    label: '数据权限',
    value: 1
  }
])
const activeTabName = ref(0)
// const editResearchNameStatus = ref(false)

// 标签页切换
const handleClickTab = (value) => {
  activeTabName.value = value
}
// 获取列表数据
const getRoleData = async() => {
  const res = await getRoleList()
  if (res.code === 10000) {
    // mock 模式下接口无数据，使用演示角色兜底
    roleList.value = res.data && res.data.length ? res.data : SYSTEM_ROLE_ROWS
  }
}
const generateTree1 = (data) => {
  const provinceMap = new Map()

  data.forEach(item => {
    // Check if province exists in the map
    if (!provinceMap.has(item.provinceId)) {
      provinceMap.set(item.provinceId, {
        id: item.provinceId,
        label: item.provinceName,
        checkAll: false,
        isIndeterminate: false,
        children: []
      })
    }

    const province = provinceMap.get(item.provinceId)
    let city = province.children.find(c => c.label === item.cityName)
    if (!city) {
      city = {
        label: item.cityName,
        checkAll: false,
        isIndeterminate: false,
        checkedIds: [],
        childrenIds: [],
        children: []
      }
      province.children.push(city)
    }

    city.children.push({
      id: item.id,
      label: item.name
    })
    city.childrenIds.push(item.id)
  })

  return Array.from(provinceMap.values())
}
// 获取医院树
const toGetAgencyRoleTree = async() => {
  const res = await getAgencyRoleTree()
  if (res.code === 10000) {
    dataPermissionList.value = generateTree1(res.data && res.data.length ? res.data : SYSTEM_AGENCY_ROWS)
  }
}
const generateTree2 = (data) => {
  const result = []
  data.forEach(first => {
    const json = {
      id: first.id,
      label: first.name,
      groupName: first.groupName,
      checkAll: false,
      isIndeterminate: false,
      checkedIds: [],
      childrenIds: [],
      children: [],
      groupSort: first.groupSort
    }
    first.children.forEach(second => {
      json.childrenIds.push(second.id)
      json.children.push({
        id: second.id,
        label: second.name
      })
    })
    result.push(json)
  })
  return result
}
const createTree = (data, parentId = '0') => {
  return data
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.sort - b.sort) // 这里按照 sort 属性对数组进行排序
    .map(item => ({
      ...item,
      children: createTree(data, item.id)
    }))
}
const backEndIds = ref([])
// 获取功能权限树
const toGetMenuRoleTree = async() => {
  const res = await getMenuRoleTree()
  let newArr = []
  if (res.code === 10000) {
    // mock 模式下接口无数据，使用演示权限树兜底
    newArr = generateTree2(createTree(res.data && res.data.length ? res.data : SYSTEM_MENU_TREE_FLAT))
    // if (localStorage.getItem('account') === 'admin') {
    //   // 将管理后台的几个权限组装到数组，当admin账户保存权限时，自动带上
    //   const backEndArr = newArr.filter(item => item.groupName === '管理后台')
    //   backEndArr.forEach(item => {
    //     backEndIds.value.push(...item.childrenIds)
    //   })
    // }
    // 除了admin，其余账户都不允许看到管理后台的权限
    if (localStorage.getItem('account') !== 'admin') {
      newArr = newArr.filter(item => item.groupName !== '管理后台')
    }
    // 按照functionPermissionList数组中的groupName进行排序,
    // 排序规则是：groupName===基础模块的在前，其次是研究队列，其次是数据大屏，其次是卒中直报
    newArr.sort((a, b) => {
      if (a.groupName === '基础模块') {
        return -1
      } else if (b.groupName === '基础模块') {
        return 1
      } else if (a.groupName === '数据大屏') {
        return -1
      } else if (b.groupName === '数据大屏') {
        return 1
      } else if (a.groupName === '研究队列') {
        return -1
      } else if (b.groupName === '研究队列') {
        return 1
      } else if (a.groupName === '卒中直报') {
        return -1
      } else if (b.groupName === '卒中直报') {
        return 1
      } else {
        return 0
      }
    })
    // 排序后，将functionPermissionList变为一个新数组，数组元素为checkAll、children、id、isIndeterminate、label,每个数组表示一个模块
    const arr = []
    newArr.forEach(item => {
      const newGroupName = item.groupName
      const obj = arr.find(item => item.groupName === newGroupName)
      if (obj) {
        obj.children.push(item)
      } else {
        const id = arr.length + 1
        arr.push({
          id,
          groupName: newGroupName,
          checkAll: false,
          isIndeterminate: false,
          children: [item]
        })
      }
    })
    console.log('arr', arr)
    // 对arr[0]里的内容，按照groupSort值的大小排序，由小到大
    // arr[0].children.sort((a, b) => a.groupSort - b.groupSort)
    arr.forEach(group => {
      group.children.sort((a, b) => a.groupSort - b.groupSort)
    })
    // 插入：科研管理放到数据分析后
    // const researchIndex = arr.findIndex(item => item.groupName === '科研管理')
    // const analysisIndex = arr.findIndex(item => item.groupName === '数据分析')
    // if (researchIndex > -1 && analysisIndex > -1) {
    //   arr.splice(analysisIndex + 1, 0, arr.splice(researchIndex, 1)[0])
    // }
    // // 获取数据分析对象
    // const dataAnalysis = arr.find(group => group.groupName === '数据分析')
    // const newGroup = ['数据整理', '分析方法']
    // const newObject = {
    //   checkAll: false,
    //   checkedIds: [],
    //   childrenIds: [],
    //   groupName: '数据分析',
    //   isIndeterminate: false,
    //   label: '工程首页',
    //   id: 'sjfxff',
    //   children: []
    // }
    // newGroup.forEach(item => {
    //   const obj = dataAnalysis.children.find(child => child.label === item)
    //   if (obj) {
    //     newObject.childrenIds.push(obj.id)
    //     newObject.children.push(obj)
    //   }
    // })
    // console.log(newObject)
    // // 从dataAnalysis下删除newGroup下所有项，并插入newObject
    // dataAnalysis.children = dataAnalysis.children.filter(child => !newGroup.includes(child.label))
    // // 插入到操作日志上部
    // if (dataAnalysis.children.length > 1) {
    //   dataAnalysis.children.splice(dataAnalysis.children.length - 1, 0, newObject)
    // } else {
    //   dataAnalysis.children.push(newObject)
    // }

    functionPermissionList.value = arr
  }
}
// 加载时请求页面列表
const init = async() => {
  await toGetAgencyRoleTree()
  await toGetMenuRoleTree()
  await getRoleData()
  handleClickLi(roleList.value[0])
}
init()
// 清空权限
const clearPermission = () => {
  dataPermissionCheckAll.value = false
  dataPermissionIsIndeterminate.value = false
  dataPermissionList.value.forEach(province => {
    province.checkAll = false
    province.isIndeterminate = false
    province.children.forEach(city => {
      city.checkAll = false
      city.isIndeterminate = false
      city.checkedIds = []
    })
  })
  functionPermissionCheckAll.value = false
  functionPermissionIsIndeterminate.value = false
  functionPermissionList.value.forEach(firstLevel => {
    firstLevel.checkAll = false
    firstLevel.isIndeterminate = false
    firstLevel.children.forEach(secondLevel => {
      secondLevel.checkAll = false
      secondLevel.isIndeterminate = false
      secondLevel.checkedIds = []
      if (secondLevel.children) {
        secondLevel.children.forEach(thirdLevel => {
          thirdLevel.checkAll = false
          thirdLevel.isIndeterminate = false
          thirdLevel.checkedIds = []
        })
      }
    })
  })
}
// 新增
const newRole = () => {
  clearPermission()
  const count = roleList.value.filter(item => !item.id)
  if (count.length === 0) {
    roleList.value.push({
      id: '',
      name: '未命名角色',
      menuIdSet: [],
      agencyIdSet: []
    })
    roleForm.value.newRoleName = ''
    activeRole.value = roleList.value[roleList.value.length - 1]
    isEdit.value = true
  }
}
const myForm = ref(null)
const roleForm = ref({
  newRoleName: ''
})
const validateRoleName = (rule, value, callback) => {
  if (value.trim() === '') {
    callback(new Error('请填写角色名称'))
  } else if (value.trim() === '未命名角色') {
    callback(new Error('不可使用此名称'))
  } else {
    callback()
  }
}
const rules = {
  newRoleName: [
    { required: true, message: '请填写角色名称', trigger: 'blur' },
    { validator: validateRoleName, trigger: 'blur' }
  ]
}
// 切换角色
const handleClickLi = (item, changeLi) => {
  if (!activeRole.value || activeRole.value.id !== item.id) {
    if (!isEdit.value) {
      confirmHandleClickLi(item)
    } else {
      ElMessageBox.confirm(
        `有改动还没保存，切换后会丢失，确认切换吗？`,
        '操作未保存',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      )
        .then(async () => {
          confirmHandleClickLi(item)
        })
        .catch(() => {
        })
    }
  }
}
// 确定切换角色
const confirmHandleClickLi = (item) => {
  isEdit.value = false
  if (activeRole.value && !activeRole.value.id) {
    roleList.value.pop()
  }
  clearPermission()
  activeRole.value = item
  functionPermissionList.value.forEach(firstLevel => {
    firstLevel.children.forEach(secondLevel => {
      if (secondLevel.label === '工程首页') {
        console.log('secondLevel', secondLevel)
        secondLevel.children.forEach(thirdLevel => {
          item.menuIdSet.forEach(selectedId => {
            if (thirdLevel.childrenIds.includes(selectedId)) {
              thirdLevel.checkedIds.push(selectedId)
            }
          })
          // 控制三级的选中状态和二级的checkedIds
          // 三级选中
          if (thirdLevel.checkedIds.length === thirdLevel.childrenIds.length) {
            thirdLevel.checkAll = true
            thirdLevel.isIndeterminate = false
            // 处理二级的选中状态，没有则添加
            if (!secondLevel.checkedIds.includes(thirdLevel.id)) {
              secondLevel.checkedIds.push(thirdLevel.id)
            }
          } else if (thirdLevel.checkedIds.length > 0) { // 三级半选中，二级不需要处理checkedIds
            thirdLevel.checkAll = false
            thirdLevel.isIndeterminate = true
          } else { // 三级不选中，二级不需要处理checkedIds
            thirdLevel.checkAll = false
            thirdLevel.isIndeterminate = false
          }
        })
      } else {
        item.menuIdSet.forEach(selectedId => {
          if (secondLevel.childrenIds.includes(selectedId)) {
            secondLevel.checkedIds.push(selectedId)
          }
        })
      }
    })

    handleSecondLevelStatusPassive(functionPermissionList.value)
    functionPermissionList.value.forEach(firstLevel => {
      handleFirstLevelStatusPassive(firstLevel)
    })
    nextTick(() => {
      handleCheckAllChangePassive('function')
    })
  })
  dataPermissionList.value.forEach(firstLevel => {
    firstLevel.children.forEach(secondLevel => {
      item.agencyIdSet.forEach(selectedId => {
        if (secondLevel.childrenIds.includes(selectedId)) {
          secondLevel.checkedIds.push(selectedId)
        }
      })
    })
    handleSecondLevelStatusPassive(dataPermissionList.value)
    dataPermissionList.value.forEach(firstLevel => {
      handleFirstLevelStatusPassive(firstLevel)
    })
    nextTick(() => {
      handleCheckAllChangePassive('data')
    })
  })
}
// 编辑研究队列名称
const toEditRoleName = () => {
  roleForm.value.newRoleName = activeRole.value.name
  isEdit.value = true
}
// 取消编辑
const cancelEdit = () => {
  ElMessageBox.confirm(
    `还有改动没保存，退出后无法找回，确认退出吗？`,
    '操作未保存',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      isEdit.value = false
      // if (!activeRole.value.id) {
      // roleList.value.pop()
      activeRole.value = null
      await getRoleData()
      if (roleList.value.length > 0) {
        handleClickLi(roleList.value[0])
      }
      // }
    })
    .catch(() => {
    })
}
// 保存编辑
const saveEdit = async () => {
  // if (!roleForm.value.newRoleName || roleForm.value.newRoleName.trim() === '') {
  //   ElMessage.warning('请填写角色名称')
  //   return false
  // }
  // if (roleForm.value.newRoleName === '未命名角色') {
  //   ElMessage.warning('不可用此名称')
  //   return false
  // }
  myForm.value.validate(async (valid) => {
    if (valid) {
      const result = []
      // 获取到所有的选中的医院列表
      dataPermissionList.value.forEach(province => {
        province.children.forEach(city => {
          city.checkedIds.forEach(agency => {
            result.push(agency)
          })
        })
      })
      const result2 = []
      // 获取到所有的选中的功能列表
      functionPermissionList.value.forEach(page => {
        console.log('page', page)
        page.children.forEach(city => {
          if (city.groupName === '数据分析' && city.label !== '数据集库' && city.label !== '工程库' && city.label !== '操作日志') {
            city.children.forEach(third => {
              result2.push(...third.checkedIds)
            })
          } else {
            result2.push(...city.checkedIds)
          }
        })
      })
      if (localStorage.getItem('account') === 'admin') {
        // 管理员账户，将管理后台的权限组装到数组
        // 判断result2数组中是否已存在backEndIds中的项
        backEndIds.value.forEach(item => {
          if (!result2.includes(item)) {
            result2.push(item)
          }
        })
      }
      const params = {
        id: activeRole.value.id,
        name: roleForm.value.newRoleName,
        agencyIdSet: result,
        menuIdSet: result2
      }
      let res = ''
      if (!activeRole.value.id) {
        res = await addRole(params)
      } else {
        res = await updateRole(params)
      }
      if (res.code === 10000) {
        await getRoleData()
        // 高亮新增项
        activeRole.value = roleList.value.find(item => item.name === roleForm.value.newRoleName)
        isEdit.value = false
      }
    }
  })
}
// 删除
const toDeleteRole = (obj) => {
  const name = obj?.name || activeRole.value.name
  const id = obj?.id || activeRole.value.id
  ElMessageBox.confirm(
    `确认删除<span class="specialText">【${name}】</span>吗？删除后将无法找回，请谨慎操作。`,
    '删除角色',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const params = {
        id
      }
      const res = await deleteRole(params)
      if (res.code === 10000) {
        await getRoleData()
        if (roleList.value.length > 0) {
          handleClickLi(roleList.value[0])
        }
      }
    })
    .catch(() => {
      // ElMessage({
      //   type: 'info',
      //   message: '删除失败'
      // })
    })
}

// 下级改变后，“全部”（根）的全选/全不选
const handleCheckAllChangePassive = (type) => {
  if (type === 'function') {
    const obj = functionPermissionList.value.filter(item => item.checkAll)
    if (obj.length === functionPermissionList.value.length) {
      functionPermissionCheckAll.value = true
      functionPermissionIsIndeterminate.value = false
    } else {
    // 没有全选，看是否有半选
      const obj2 = functionPermissionList.value.filter(item => item.isIndeterminate || item.checkAll)
      if (obj2.length > 0) {
        functionPermissionCheckAll.value = false
        functionPermissionIsIndeterminate.value = true
      } else {
        functionPermissionCheckAll.value = false
        functionPermissionIsIndeterminate.value = false
      }
    }
  } else if (type === 'data') {
    const obj = dataPermissionList.value.filter(item => item.checkAll)
    if (obj.length === dataPermissionList.value.length) {
      dataPermissionCheckAll.value = true
      dataPermissionIsIndeterminate.value = false
    } else {
    // 没有全选，看是否有半选
      const obj2 = dataPermissionList.value.filter(item => item.checkAll || item.isIndeterminate)
      if (obj2.length > 0) {
        dataPermissionCheckAll.value = false
        dataPermissionIsIndeterminate.value = true
      } else {
        dataPermissionCheckAll.value = false
        dataPermissionIsIndeterminate.value = false
      }
    }
  }
}
// 对一级（省、功能模块）的全选/全不选
const handleFirstLevelCheckAllChange = (val, group, list, type) => {
  group.isIndeterminate = false
  if (val) {
    const obj = list.find(item => item.id === group.id)
    // 对该组下的数据全部选中
    obj.isIndeterminate = false
    obj.children.forEach(city => {
      city.isIndeterminate = false
      city.checkAll = true
      city.checkedIds = _.cloneDeep(city.childrenIds)
      if (city.children) {
        city.children.forEach(third => {
          third.checkAll = true
          third.isIndeterminate = false
          third.checkedIds = _.cloneDeep(third.childrenIds)
        })
      }
    })
  } else {
    const obj = list.find(item => item.id === group.id)
    // 全不选
    obj.isIndeterminate = false
    obj.children.forEach(city => {
      city.isIndeterminate = false
      city.checkAll = false
      city.checkedIds = []
      if (city.children) {
        city.children.forEach(third => {
          third.checkAll = false
          third.isIndeterminate = false
          third.checkedIds = []
        })
      }
    })
  }
  handleCheckAllChangePassive(type)
}
// 改变二级，处理一级的选中状态
const handleFirstLevelStatusPassive = (firstLevel) => {
  const checkedCities = firstLevel.children.filter(item => item.checkedIds.length > 0)
  if (checkedCities.length === firstLevel.children.length) {
    // 有医院被选中的城市，又分医院全选和不全选
    const obj = checkedCities.some(item => item.isIndeterminate)
    // 如果有医院为半选，则设置省份为半选
    if (obj) {
      firstLevel.checkAll = false
      firstLevel.isIndeterminate = true
    } else {
      firstLevel.checkAll = true
      firstLevel.isIndeterminate = false
    }
  } else if (checkedCities.length === 0) {
    firstLevel.checkAll = false
    firstLevel.isIndeterminate = false
  } else {
    firstLevel.checkAll = false
    firstLevel.isIndeterminate = true
  }
}
// 改变三级，处理二级（市、二级标题）的选中状态
const handleSecondLevelStatusPassive = (list) => {
  list.forEach(item => {
    item.children.forEach(city => {
      if (city.checkedIds.length === city.childrenIds.length) {
        // 全选
        city.isIndeterminate = false
        city.checkAll = true
      } else if (city.checkedIds.length === 0) {
        // 全不选
        city.isIndeterminate = false
        city.checkAll = false
      } else {
        city.isIndeterminate = true
        city.checkAll = false
      }
    })
  })
}
// 改变三级，处理二级（市、二级标题）的选中状态
const handleSecondLevelStatusPassive2 = (obj, first) => {
  // 判断obj.children是否有isIndeterminate为true的项
  const isIndeterminate = obj.children.some(item => item.isIndeterminate)
  if (isIndeterminate) {
    obj.isIndeterminate = true
    obj.checkAll = false
  } else {
    // 子项没有半选项，说明是没有选择或部分选择
    const count = obj.children.filter(item => item.checkAll).length
    if (count === 0) {
      // 没有半选项，也没有选中项
      obj.checkAll = false
      obj.isIndeterminate = false
    } else if (count === obj.childrenIds?.length) {
      // 没有半选项，子项全选中
      obj.checkAll = true
      obj.isIndeterminate = false
    } else {
      obj.checkAll = false
      obj.isIndeterminate = true
    }
  }
  const isIndeterminate2 = first.children.some(item => item.isIndeterminate)
  if (isIndeterminate2) {
    first.isIndeterminate = true
    first.checkAll = false
  } else {
    // 子项没有半选项，说明是没有选择或部分选择
    const count = first.children.filter(item => item.checkAll).length
    if (count === 0) {
      // 没有半选项，也没有选中项
      first.checkAll = false
      first.isIndeterminate = false
    } else if (count === first.children.length) {
      // 没有半选项，子项全选中
      first.checkAll = true
      first.isIndeterminate = false
    } else {
      first.checkAll = false
      first.isIndeterminate = true
    }
  }
}
// 对二级（市、二级标题）的全选/全不选
const handleSecondLevelCheckAllChange = (val, secondLevel, firstLevel, type) => {
  secondLevel.isIndeterminate = false
  secondLevel.checkedIds = []
  if (val) {
    secondLevel.children.forEach(item => {
      secondLevel.checkedIds.push(item.id)
      if (item.children) {
        item.checkAll = true
        item.isIndeterminate = false
        item.checkedIds = _.cloneDeep(item.childrenIds)
      }
    })
  } else {
    secondLevel.children.forEach(item => {
      if (item.children) {
        item.checkAll = false
        item.isIndeterminate = false
        item.checkedIds = []
      }
    })
  }
  handleFirstLevelStatusPassive(firstLevel)
  nextTick(() => {
    handleCheckAllChangePassive(type)
  })
}
// 对三级的全选/全不选
const handleThirdLevelCheckAllChange = (val, thirdLevel, secondLevel, firstLevel, type) => {
  thirdLevel.isIndeterminate = false
  thirdLevel.checkedIds = []
  if (val) {
    thirdLevel.children.forEach(item => {
      thirdLevel.checkedIds.push(item.id)
    })
    // 处理二级的选中状态，没有则添加
    if (!secondLevel.checkedIds.includes(thirdLevel.id)) {
      secondLevel.checkedIds.push(thirdLevel.id)
    }
  } else {
    // 处理二级的选中状态，有则移除
    // 从secondLevel.checkedIds中移除
    const index = secondLevel.checkedIds.indexOf(thirdLevel.id)
    if (index !== -1) {
      secondLevel.checkedIds.splice(index, 1)
    }
  }
  handleSecondLevelStatusPassive(functionPermissionList.value)
  handleFirstLevelStatusPassive(firstLevel)
  nextTick(() => {
    handleCheckAllChangePassive(type)
  })
}
// 选中医院变化
const handleCheckedThirdLevelChange = (value) => {
  handleSecondLevelStatusPassive(dataPermissionList.value)
  dataPermissionList.value.forEach(firstLevel => {
    handleFirstLevelStatusPassive(firstLevel)
  })
  nextTick(() => {
    handleCheckAllChangePassive('data')
  })
}
// 全部 全选/全不选
// 通用的全选/全不选处理方法
const handleCheckAllChange = (val, permissionList) => {
  permissionList.forEach(firstLevel => {
    firstLevel.checkAll = val
    firstLevel.isIndeterminate = false
    firstLevel.children.forEach(secondLevel => {
      secondLevel.checkAll = val
      secondLevel.isIndeterminate = false
      secondLevel.checkedIds = val ? secondLevel.childrenIds : []
      if (secondLevel.children) {
        secondLevel.children.forEach(thirdLevel => {
          thirdLevel.checkAll = val
          thirdLevel.isIndeterminate = false
          thirdLevel.checkedIds = val ? thirdLevel.childrenIds : []
        })
      }
    })
  })
}

// 处理功能权限全选/全不选
const handleFunctionCheckAllChange = (val) => {
  functionPermissionIsIndeterminate.value = false
  handleCheckAllChange(val, functionPermissionList.value)
}
// 处理数据权限全选/全不选
const handleDataCheckAllChange = (val) => {
  dataPermissionIsIndeterminate.value = false
  handleCheckAllChange(val, dataPermissionList.value)
}
// 三级的具体的小功能变化
const handleThirdFunctionCheckChange = (checked, third, second, firstLevel) => {
  if (checked && third.label !== '查看' && third.label !== '查看院内卒中基本数据情况' && third.label !== '查看院内卒中数据预估分析' && third.label !== '查看中心卒中基本数据情况') {
    // 判断首项查看是否被选中。没有则选中
    if (!second.checkedIds.includes(second.childrenIds[0])) {
      second.checkedIds.unshift(second.childrenIds[0])
      handleSecondLevelStatusPassive(functionPermissionList.value)
      handleFirstLevelStatusPassive(firstLevel)
      nextTick(() => {
        handleCheckAllChangePassive('function')
      })
    }
  } else if (!checked && (third.label === '查看')) {
    // 判断首项查看是否被选中。不选中，则也取消其他兄弟项的选中
    if (!second.checkedIds.includes(second.childrenIds[0])) {
      second.checkedIds = []
      handleSecondLevelStatusPassive(functionPermissionList.value)
      handleFirstLevelStatusPassive(firstLevel)
      nextTick(() => {
        handleCheckAllChangePassive('function')
      })
    }
  }
}
// 四级的具体的小功能变化
const handleFourthFunctionCheckChange = (checked, fourth, third, second, first) => {
  if (checked) {
    if (!third.checkedIds.includes(fourth.id)) {
      third.checkedIds.push(fourth.id)
    }
    if (third.checkedIds.length === third.childrenIds.length) {
      third.checkAll = true
      third.isIndeterminate = false
      // 处理二级的选中状态，没有则添加
      if (!second.checkedIds.includes(third.id)) {
        second.checkedIds.push(third.id)
      }
    } else {
      third.checkAll = false
      third.isIndeterminate = true
      // 处理二级的选中状态，有则移除
      const index = second.checkedIds.indexOf(third.id)
      if (index !== -1) {
        second.checkedIds.splice(index, 1)
      }
    }
  } else {
    if (third.checkedIds.includes(fourth.id)) {
      const index = third.checkedIds.indexOf(fourth.id)
      third.checkedIds.splice(index, 1)
    }
    if (third.checkedIds.length === 0) {
      third.checkAll = false
      third.isIndeterminate = false
    } else {
      third.checkAll = false
      third.isIndeterminate = true
    }
    // 处理二级的选中状态，有则移除
    const index = second.checkedIds.indexOf(third.id)
    if (index !== -1) {
      second.checkedIds.splice(index, 1)
    }
  }
  // 处理二级被动和一级被动
  handleSecondLevelStatusPassive2(second, first)
  nextTick(() => {
    handleCheckAllChangePassive('function')
  })
  // handleSecondLevelStatusPassive2(first)
  // nextTick(() => {
  //   handleFirstLevelStatusPassive(first)
  //   nextTick(() => {
  //     handleCheckAllChangePassive('function')
  //   })
  // })
}
// 选中功能变化
const handleCheckedFunctionChange = (value) => {
  handleSecondLevelStatusPassive(functionPermissionList.value)
  functionPermissionList.value.forEach(firstLevel => {
    handleFirstLevelStatusPassive(firstLevel)
  })
  nextTick(() => {
    handleCheckAllChangePassive('function')
  })
}
</script>

<style scoped lang="scss">
.roleManage {
  width: 100%;
  height: 100%;
  .roleManageContent {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 16px;
    .left {
      display: flex;
      flex-direction: column;
      width: 258px;
      height: 100%;
      border-radius: 8px;
      background-color: var(--theme-card);
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        height: 55px;
        padding: 0 16px 0 24px;
        span:nth-child(1) {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        span:nth-child(2) {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: var(--theme-primary);
          img {
            width: 18px;
            height: 18px;
            margin-left: 8px;
          }
        }
        .el-button {
          img {
            width: 12px;
            height: 12px;
            margin-left: 8px;
          }
        }
      }
      .ul {
        flex: 1;
        box-sizing: border-box;
        height: 0;
        padding: 0 12px;
        li {
          display: flex;
          justify-content: space-between;
          box-sizing: border-box;
          height: 36px;
          padding-left: 10px;
          border-radius: 2px;
          cursor: pointer;
          line-height: 36px;
          &:not(:first-child) {
            margin-top: 6px;
          }
          &.active {
            background-color: rgba(54, 112, 248, 0.05);
            font-weight: 500;
            color: var(--theme-primary);
          }
          &:hover {
            background-color: rgba(54, 112, 248, 0.05);
            .iconfont {
              visibility: visible;
            }
          }
          .iconfont {
            visibility: hidden;
            margin-right: 8px;
            font-size: 14px;
            color: #f76868;
          }
        }
      }
    }
    .right {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-left: 16px;
      border-radius: 8px;
      background-color: var(--theme-card);
      &.editing {
        border-radius: 0;
        background-color: inherit;
        .right-top {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          height: 68px;
          padding-right: 20px;
          padding-top: 0;
          border-radius: 8px;
          background-color: var(--theme-card);
          .formName {
            flex: 1;
            .el-input {
              width: auto;
            }
            :deep(.el-form) {
              .el-form-item {
                margin-bottom: 0;
                .el-form-item__label {
                  font-size: 16px;
                }
                .el-form-item__content {
                  .el-form-item__error {
                    right: -92px;
                    height: 17px;
                    padding-top: 0;
                    line-height: 17px;
                  }
                }
              }
            }
          }
          .btnDiv {
            position: initial;
          }
        }
        .right-bottom {
          margin-top: 16px;
          border-radius: 8px;
          background-color: var(--theme-card);
          .checkboxDiv {
            .functionDiv:nth-child(1) {
              .moduleName {
                margin-top: 0;
              }
            }
          }
          .permissionDiv {
            .labelTitle1 {
              justify-content: flex-start !important;
              // align-items: flex-start !important;
              box-sizing: border-box;
              padding-left: 24px;
              padding-right: 20px;
              // padding-top: 16px;
              :deep(.el-checkbox) {
                height: auto;
                // margin-top: 2px;
                white-space: wrap;
                .el-checkbox__label {
                  display: inline-block;
                  width: 56px;
                  margin-left: 8px;
                  padding-left: 0;
                  line-height: 20px;
                  font-weight: 500;
                  color: var(--theme-text);
                }
              }
            }
          }
        }
      }
      .right-top {
        display: flex;
        position: relative;
        flex-direction: column;
        // justify-content: space-between;
        // align-items: center;
        box-sizing: border-box;
        padding: 16px 16px 0 24px;
        .roleDiv {
          display: flex;
          flex: 1;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
          .readDiv {
            flex: 1;
            width: 0;
            .activeRoleName {
              display: inline-block;
              width: 100%;
            }
          }
          .formName {
            display: flex;
            align-items: center;

            .iconfont {
              width: 32px;
              height: 32px;
              margin-left: 10px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 32px;
              &:hover {
                background: var(--theme-primary-soft);
                color: var(--theme-primary);
              }
            }
            :deep(.el-input) {
              .el-input__wrapper {
                .el-input__inner {
                  width: 254px;
                }
              }
            }
            .el-button {
              margin-left: 26px;
            }
            .el-button+.el-button {
              margin-left: 14px;
            }
          }
        }
        .btnDiv {
          position: absolute;
          right: 20px;
          top: 54px;
          .el-button {
            &.deleteBtn {
              border: 1px solid #ff4e4e;
              color: #ff4e4e;
              &:hover {
                background-color: rgba(255, 78, 78, 0.1);
              }
            }
            &:nth-child(2) {
              margin-left: 14px;
            }
          }
        }
      }
      .right-bottom {
        display: flex;
        flex-direction: column;
        flex: 1;
        box-sizing: border-box;
        height: 0;
        padding: 0 23px 16px 24px;
        .tabsDiv {
          display: flex;
          height: 42px;
          margin-top: 19px;
          border-bottom: 1px solid #e8e8e8;
          ul {
            display: flex;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            font-size: 16px;
            li {
              display: flex;
              position: relative;
              flex-direction: column;
              align-items: center;
              // width: 66px;
              margin-right: 24px;
              cursor: pointer;
              div:nth-child(1) {
                height: 23px;
                line-height: 23px;
                font-weight: 400;
                font-size: 16px;
                color: var(--theme-text-2);
              }
              .bottomLine {
                position: absolute;
                bottom: 0;
                width: calc(100% - 10px);
                height: 3px;
                background-color: var(--theme-card);
              }
              &.active {
                div:nth-child(1) {
                  font-weight: 500;
                  font-size: 16px;
                  color: var(--theme-primary);
                }
                .bottomLine {
                  background-color: var(--theme-primary);
                }
              }
            }
          }
        }
        :deep(.el-checkbox__input.is-disabled .el-checkbox__inner) {
          border-color: #d8d8d8;
          background-color: var(--theme-fill);
        }
        :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner) {
          background-color: #d8d8d8;

          &::after {
            border-color: #f7f7f7;
          }
        }
        .right-bottom-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 0;
        }
        :deep(.el-checkbox__input.is-disabled.is-indeterminate .el-checkbox__inner) {
          border-color: #f7f7f7;
          background-color: #d8d8d8;

          &::before {
            border-color: #f7f7f7;
            background-color: var(--theme-fill);
          }
        }
        .roleSection1 {
          display: flex;
          flex-direction: column;
          &:nth-child(1) {
            flex: 1;
            height: 0;
            :deep(.el-scrollbar) {
              flex: 1;
              height: auto;
              .el-scrollbar__wrap {
                display: flex;
                .el-scrollbar__view {
                  width: 100%;
                }
              }
              // border-radius: 4px;
              // background-color: var(--theme-fill);
            }
          }
          .titleDiv {
            display: flex;
            align-items: center;
            width: 100%;
            height: 68px;
            .title {
              margin-left: 8px;
              margin-right: 16px;
              font-weight: 500;
              font-size: 16px;
              color: var(--theme-text);
            }
            :deep(.el-checkbox__label) {
              padding-left: 8px;
              font-size: 12px;
            }
          }
          .checkboxDiv {
            box-sizing: border-box;
            .provinceDiv {
              display: flex;
              align-items: center;
              height: 20px;
              &:not(:first-child) {
                margin-top: 20px;
              }
              .title {
                margin-left: 8px;
                color: var(--theme-text);
              }
            }
            .city {
              box-sizing: border-box;
              padding-left: 26px;
              .title {
                margin-left: 12px;
              }
              .labelTitle1 {
                display: flex;
                align-items: center;
                height: 20px;
                margin-top: 16px;
              }
              :deep(.el-checkbox-group) {
                box-sizing: border-box;
                padding-left: 26px;
                .el-checkbox {
                  height: 20px;
                  margin-right: 59px;
                  margin-top: 8px;
                  &.is-disabled {
                    .el-checkbox__label {
                      color: inherit !important;
                    }
                  }
                  .el-checkbox__label {
                    margin-left: 8px;
                    font-weight: 400;
                    color: var(--theme-text-2);
                  }
                  &.is-checked {
                    .el-checkbox__label {
                      font-weight: 400;
                      color: var(--theme-text-2) !important;
                    }
                  }
                }
              }
            }
            .pageListDiv {
              display: flex;
              :deep(.el-checkbox-group) {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-start;
                width: 100%;
                .el-checkbox {
                  width: 23%;
                  height: 20px;
                  margin-top: 16px;
                  &:nth-child(1),
                  &:nth-child(2),
                  &:nth-child(3),
                  &:nth-child(4) {
                    margin-top: 0;
                  }
                  &:not(:nth-child(4n)) {
                    /* 计算出三个间距大小，平分即可 */
                    margin-right: calc(8%/ 3);
                  }
                  &:nth-child(4n) {
                    margin-right: 0;
                  }
                  &.is-disabled {
                    .el-checkbox__label {
                      color: inherit !important;
                    }
                  }
                  &.is-checked {
                    .el-checkbox__label {
                      font-weight: 400;
                      color: var(--theme-text-2) !important;
                    }
                  }
                }
              }
            }
            .functionDiv {
              box-sizing: border-box;
              .moduleName {
                display: flex;
                align-items: center;
                box-sizing: border-box;
                height: 53px;
                margin-top: 24px;
                padding-left: 18px;
                border: 1px solid #e8e8e8;
                background: rgba(54, 112, 248, 0.05);
                font-weight: 500;
                color: var(--theme-primary);
                :deep(.el-checkbox) {
                  margin-left: 16px;
                  .el-checkbox__label {
                    padding-left: 8px;
                  }
                }
                .title-flag {
                  width: 2px;
                  height: 15px;
                  margin-right: 8px;
                  background-color: var(--theme-primary);
                }
                .groupName {
                  font-size: 16px;
                }
              }
              .permissionDiv {
                display: flex;
                box-sizing: border-box;
                min-height: 53px;
                border-left: 1px solid #e8e8e8;
                border-right: 1px solid #e8e8e8;
                border-bottom: 1px solid #e8e8e8;
                .labelTitle1 {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  box-sizing: border-box;
                  width: 130px;
                  border-right: 1px solid #e8e8e8;
                }
                .thirdLevelBox {
                  display: flex;
                  flex-direction: column;
                  flex: 1;
                  .thirdLevelLine {
                    display: flex;
                    min-height: 53px;
                    &:not(:first-child) {
                      border-top: 1px solid #e8e8e8;
                    }
                    .labelTitle2 {
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      box-sizing: border-box;
                      width: 132px;
                      // padding-left: 24px;
                      border-right: 1px solid #e8e8e8;
                    }
                  }
                }
              }
              .title {
                // margin-left: 8px;
                font-weight: 500;
                color: var(--theme-text);
              }
              :deep(.el-checkbox-group) {
                display: flex;
                flex-wrap: wrap;
                flex: 1;
                box-sizing: border-box;
                padding-top: 1px;
                padding-bottom: 16px;
                // padding-left: 26px;
                .el-checkbox {
                  display: flex;
                  overflow: hidden;
                  box-sizing: border-box;
                  width: calc(100%/4);
                  height: 20px;
                  margin-right: 0;
                  margin-top: 16px;
                  padding-left: 24px;
                  &.is-disabled {
                    .el-checkbox__label {
                      color: inherit !important;
                    }
                  }
                  .el-checkbox__label {
                    overflow: hidden; // 文字长度超出限定宽度，则隐藏超出的内容
                    flex: 1;
                    // margin-left: 8px;
                    padding-left: 8px;
                    // text-overflow: ellipsis;
                    font-weight: 400;
                    color: var(--theme-text-2);
                    // white-space: nowrap; // 设置文字在一行显示，不能换行
                  }
                  &.is-checked {
                    .el-checkbox__label {
                      font-weight: 400;
                      color: var(--theme-text-2) !important;
                    }
                  }
                }
              }
            }
          }
        }
        .roleSection2 {
          flex: 1;
          height: 0;
          :deep(.el-scrollbar) {
            flex: 1;
            height: auto;
            // border-radius: 4px;
            // background-color: var(--theme-fill);
          }
        }
      }
    }
  }
}
.treeLabel {
  overflow: hidden; /* 隐藏溢出内容 */
  flex: 1;
  line-height: 20px;
  text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
  font-weight: 400;
  font-size: 14px;
  white-space: nowrap;
}
</style>
