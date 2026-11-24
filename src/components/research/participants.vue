<template>
  <div class="listDiv">
    <div class="viewContent">
      <div class="tableStyle borderDiv">
        <header class="tableTop">
          <h2>参与人员列表</h2>
          <div class="rightTop">
            <el-button type="primary" @click="addPerson" v-if="!needCheckPermission || hadPermissionList.includes('新增参与人员')"><i class="iconfont icon-tianjiayihang"></i>新增人员</el-button>
            <!-- <el-button type="primary" @click="addPerson" v-if="!props.needCheckPermission || props.hadPermissionList.includes('编辑参与人员')"><i class="iconfont icon-tianjiayihang"></i>新增人员</el-button> -->
          </div>
        </header>
        <commonTable
          class="singleTable btnsLastCell"
          :data="tableData">
          <el-table-column prop="account" label="账号" min-width="160"></el-table-column>
          <el-table-column prop="userName" label="姓名" min-width="160"></el-table-column>
          <el-table-column prop="agencyName" label="医院" min-width="170"></el-table-column>
          <el-table-column label="操作" min-width="20">
            <template #default="scope">
              <el-button link @click="deleteRow(scope.row)" v-if="(!needCheckPermission || hadPermissionList.includes('删除参与人员')) && (researchStore.curResearchQueueDetail.creator !== scope.row.userName)">删除</el-button>
            </template>
          </el-table-column>
        </commonTable>
        <div class="tabel_pagination">
          <el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" v-model:current-page="currentPage" :page-size="limit" :total="total">
            <template #default><span class="el-pagination__total is-first my-pagination"> 共 <span class="total">{{ total }}</span> 条</span></template>
          </el-pagination>
        </div>
      </div>
    </div>
    <newPersonnel v-if="addDialogShow" v-model:addDialogShow="addDialogShow" :curEditRow="curEditRow" @handle-close="addDialogShow = false" @handle-submit="handleSubmit" />
  </div>
</template>

<script>
export default {
  name: 'Participants'
}
</script>
<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import newPersonnel from './newPersonnel.vue'
import { getParticipantList, deleteParticipant } from '@/api/api_proofread'
import { useResearchStore } from '@/store/researchStore'
defineProps({
  hadPermissionList: {
    type: Array
  },
  needCheckPermission: {
    type: Boolean
  }
})
const researchStore = useResearchStore()
const tableData = ref([])
const addDialogShow = ref(false)
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
// 获取数据
const getData = async() => {
  const params = {
    pageNum: currentPage.value,
    pageSize: limit.value,
    batchId: researchStore.curResearchQueueDetail.id
  }
  const res = await getParticipantList(params)
  if (res.code === 10000) {
    tableData.value = res.data
    total.value = res.data.total
  }
}

// 加载时请求页面列表
const init = async() => {
  getData()
}

init()

const curEditRow = ref('')
// 新增
const addPerson = () => {
  curEditRow.value = ''
  addDialogShow.value = true
}
// 删除
const deleteRow = async(row) => {
  console.log(row.id)
  ElMessageBox.confirm(
    `确认删除该人员吗？删除后可重新添加。`,
    '删除参与人员',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  )
    .then(async () => {
      const res = await deleteParticipant({ id: row.id })
      if (res.code === 10000) {
        ElMessage.success('已删除')
        row.visible = false
        await getData()
      }
    })
}
// 新增后回调
const handleSubmit = async() => {
  await getData()
  addDialogShow.value = false
}
// 分页导航
const handleCurrentChange = (val) => {
  currentPage.value = val
  getData()
}
const handleSizeChange = (val) => {
  currentPage.value = 1
  limit.value = val
  getData()
}
</script>

<style scoped lang="scss">
.listDiv {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .viewContent {
    padding: 0;
    .tableStyle {
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      width: 100%;
      height: 0;
      padding: 0 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      .tableTop {
        display: flex;
        position: relative;
        justify-content: space-between;
        align-items: center;
        height: 71px;
        h2 {
          line-height: 27px;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        .rightTop {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 110px;
          height: 32px;
          border-radius: 2px;
          .el-button {
            i {
              margin-right: 10px;
              font-size: 12px;
            }
          }
        }
        .rightTop:hover {
          background: var(--theme-primary-soft);
          p {
            color: var(--theme-primary);
          }
        }
      }
      :deep(.singleTable) {
        display: flex;
        flex-direction: column;
        flex: 1;
        thead {
          .cell {
            font-weight: 400;
            font-size: 14px;
            color: #000;
          }
          .is-first-column .cell {
            justify-content: end;
            padding-right: 24px;
          }
        }
        .el-table__body {
          .el-button {
            border: none;
            font-weight: 400;
            font-size: 14px;
            color: #f76868;
          }
          .is-first-column .cell {
            justify-content: end;
            padding-right: 20px;
          }
        }
      }
      :deep(.singleTable) tbody :empty::before {
        padding-left: 5px;
        color: #000;
        content: '-';
      }
      .tabel_pagination {
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
