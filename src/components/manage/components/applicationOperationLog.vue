<template>
  <div class="list-div">
    <div class="viewContent">
      <header class="list-header header-query">
        <div class="conditionTitle">
          <div class="title">查询条件</div>
        </div>
        <el-form ref="searchForm" class="commonSearch" :inline="true" :model="searchInfo" @submit.prevent>
          <el-form-item label="用户名" class="form-query-select">
            <el-input type="text" v-model="searchInfo.username" placeholder="请填写内容" clearable @keyup.enter="onSubmit"/>
          </el-form-item>
          <el-form-item label="用户类型" class="form-query-select">
            <el-select v-model="searchInfo.userSource" clearable placeholder="请选择一项">
              <el-option
                v-for="item in userSourceOptions"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="事件描述" class="form-query-select">
            <el-select v-model="searchInfo.eventType" clearable placeholder="请选择一项">
              <el-option
                v-for="item in eventTypeOptions"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <div class="btnDiv">
            <el-button @click="resetParams">重置条件</el-button>
            <el-button type="primary" @click="onSubmit">查 询</el-button>
          </div>
        </el-form>
      </header>
      <div class="list-section">
        <header class="table-header">
          <div>日志列表</div>
        </header>
        <div class="tableMain">
          <commonTable class="singleTable" :data="tableData">
            <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
            <el-table-column prop="userSourceDesc" label="用户类型" min-width="120"></el-table-column>
            <el-table-column prop="eventTypeDesc" label="事件描述" min-width="160"></el-table-column>
            <el-table-column prop="forwardApp" label="来源/去向" min-width="160">
              <template #default="scope">
                <div>{{ scope.row.forwardApp||'-' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="appUrl" label="应用地址" min-width="160"></el-table-column>
            <el-table-column prop="operatorTime" label="操作时间" min-width="80"></el-table-column>
          </commonTable>
          <div class="tabel_pagination">
            <el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
              <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'userManage'
}
</script>
<script setup>
import { ref } from 'vue'
import { getApplicationLogList } from '@/api/api_home'
const searchInfo = ref({
  username: '',
  userSource: '',
  eventType: ''
})

const userSourceOptions = ref([
  {
    id: 'PLATFORM',
    label: '平台用户'
  },
  {
    id: 'THIRD_PARTY_ZKR',
    label: '三方-中科软'
  }
])

const eventTypeOptions = ref([
  {
    id: 'LOGIN_IDL',
    label: '跳转IDL'
  },
  {
    id: 'FORWARD_THIRD_PARTY',
    label: '跳转三方应用'
  }
])

const tableData = ref([])
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)

// 获取用户列表
const getData = async() => {
  const params = {
    pageNum: currentPage.value,
    pageSize: limit.value,
    username: searchInfo.value.username,
    userSource: searchInfo.value.userSource,
    eventType: searchInfo.value.eventType
  }
  const res = await getApplicationLogList(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
    total.value = res.data.total
  }
}

// 分页
const handleCurrentChange = (val) => {
  currentPage.value = val
  getData()
}
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getData()
}

// 加载时请求页面列表
const init = async() => {
  getData()
}

init()

// 重置
const resetParams = () => {
  searchInfo.value = {
    username: '',
    userSource: '',
    eventType: ''
  }
  getData()
}

// 搜索
const onSubmit = () => {
  getData()
  return false
}

</script>

<style scoped lang="scss">
@use "@/style/common/list.scss";
.list-div {
  .viewContent {
    padding: 0;
  }
  .tableMain {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 0;
    :deep(.singleTable) {
      flex: 1;
    }
  }
}
</style>
