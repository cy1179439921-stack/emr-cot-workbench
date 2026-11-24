<template>
  <div>
    <div class="sticky-button">
      <el-input v-model="filterText" class="fitler" placeholder="筛选" />
      <el-button class="fl-right" type="success" @click="authApiEnter">确 定</el-button>
    </div>
    <div class="tree-content">
      <el-tree
        ref="apiTree"
        :data="apiTreeData"
        :default-checked-keys="apiTreeIds"
        :props="apiDefaultProps"
        default-expand-all
        highlight-current
        node-key="onlyId"
        show-checkbox
        :filter-node-method="filterNode"
        @check="nodeChange"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'Apis'
}
</script>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllApis } from '@/api/api_api'
import { updateCasbin, getPolicyPathByAuthorityId } from '@/api/api_casbin'

const props = defineProps({
  row: {
    default() {
      return {}
    },
    type: Object
  }
})

const apiDefaultProps = ref({
  children: 'children',
  label: 'description'
})
const filterText = ref('')
const apiTreeData = ref([])
const apiTreeIds = ref([])
const activeUserId = ref('')
// 创建api树方法
const buildApiTree = (apis) => {
  const apiObj = {}
  apis && apis.forEach((item) => {
    item.onlyId = `p:${item.path}m:${item.method}`
    if (Object.prototype.hasOwnProperty.call(apiObj, item.apiGroup)) {
      apiObj[item.apiGroup].push(item)
    } else {
      Object.assign(apiObj, { [item.apiGroup]: [item] })
    }
  })
  const apiTree = []
  for (const key in apiObj) {
    const treeNode = {
      ID: key,
      description: `${key}组`,
      children: apiObj[key]
    }
    apiTree.push(treeNode)
  }
  return apiTree
}
const init = async() => {
  const res2 = await getAllApis()
  const { apis } = res2.data

  apiTreeData.value = buildApiTree(apis)
  const res = await getPolicyPathByAuthorityId({
    authorityId: props.row.authorityId
  })
  activeUserId.value = props.row.authorityId
  apiTreeIds.value = []
  // eslint-disable-next-line no-unused-expressions
  res.data.paths && res.data.paths.forEach((item) => {
    apiTreeIds.value.push(`p:${item.path}m:${item.method}`)
  })
}

init()

const needConfirm = ref(false)
const nodeChange = () => {
  needConfirm.value = true
}
// 关联关系确定
const apiTree = ref(null)
const authApiEnter = async() => {
  const checkArr = apiTree.value.getCheckedNodes(true)
  const casbinInfos = []
  checkArr && checkArr.forEach((item) => {
    const casbinInfo = {
      path: item.path,
      method: item.method
    }
    casbinInfos.push(casbinInfo)
  })
  const res = await updateCasbin({
    authorityId: activeUserId.value,
    casbinInfos
  })
  if (res.code === 200) {
    ElMessage({ type: 'success', message: 'api设置成功' })
  }
}
// 暴露给外层使用的切换拦截统一方法
const enterAndNext = () => {
  authApiEnter()
}

defineExpose({
  needConfirm,
  enterAndNext
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.description.indexOf(value) !== -1
}
watch(filterText, (val) => {
  apiTree.value.filter(val)
})

</script>

<style lang="scss" scoped>
.sticky-button{
  display: flex;
  margin-bottom: 10px;
  .fl-right{
    margin-left: 20px;
  }
}
</style>
