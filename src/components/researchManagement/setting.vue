<template>
  <div>
    <div class="fd-nav-content" :class="{'eventNone':!props.isEdit}">
      <section class="dingflow-design">
        <div class="box-scale">
          <nodeWrap v-model:nodeConfig="nodeConfig" v-model:flowPermission="flowPermission" :isEdit="props.isEdit" :departmentOptions="departmentOptions" />
          <div class="end-node">
            <div class="node-wrap-box start-node">
              <div class="title">
                <span>结束</span>
              </div>
              <div class="content">
                <div class="text">流程结束</div>
                <i class="anticon anticon-right arrow"></i>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!-- <errorDialog v-model:visible="tipVisible" :list="tipList" /> -->
    <approverDrawer :directorMaxLevel="100" :departmentOptions="departmentOptions" :agencyId="agencyId"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from '@/store/workflow'
// import errorDialog from '@/components/researchManagement/workflow/dialog/errorDialog.vue'
import approverDrawer from '@/components/researchManagement/workflow/drawer/approverDrawer.vue'
import nodeWrap from '@/components/researchManagement/workflow/nodeWrap.vue'
import { ElMessage } from 'element-plus'
const { setTableId, setIsTried } = useStore()
const props = defineProps({
  isEdit: {
    type: Boolean,
    default: true
  },
  departmentOptions: {
    type: Array,
    default: () => ([])
  },
  initData: {
    type: Object,
    default: () => ({ name: '提交', type: 0, auditPersonType: '', directorLevel: '', ccSelfSelectFlag: '', nodeUserList: [], childNode: { name: '审批', error: true, type: 1, auditPersonType: null, directorLevel: '', childNode: {}, nodeUserList: [], designatedPersonInCharge: '' }, conditionNodes: [] })
  },
  agencyId: {
    type: String,
    required: true
  },
  roleList: {
    type: Array,
    default: () => ([])
  }
})

const tipList = ref([])
const tipVisible = ref(false)
// const processConfig = ref({})
const nodeConfig = ref({})
// const workFlowDef = ref({})
const flowPermission = ref([])
// const directorMaxLevel = ref(0)

const reErr = ({ childNode }) => {
  if (childNode) {
    const { type, error, name, conditionNodes } = childNode
    if (type === 1 || type === 2) {
      if (error) {
        tipList.value.push({
          name,
          type: ['', '审批', '抄送人'][type]
        })
      }
      reErr(childNode)
    } else if (type === 3) {
      reErr(childNode)
    } else if (type === 4) {
      reErr(childNode)
      for (let i = 0; i < conditionNodes.length; i++) {
        if (conditionNodes[i].error) {
          tipList.value.push({ name: conditionNodes[i].name, type: '条件' })
        }
        reErr(conditionNodes[i])
      }
    }
  } else {
    childNode = null
  }
}
const saveSet = () => {
  setIsTried(true)
  tipList.value = []
  // console.log(nodeConfig.value)
  reErr(nodeConfig.value)
  if (tipList.value.length !== 0) {
    tipVisible.value = true
    ElMessage.error('有审批节点未设置审批人')
    return false
  }
  // processConfig.value.flowPermission = flowPermission.value
  // eslint-disable-next-line no-console
  return { ...nodeConfig.value }
}

const handlerTreeSetName = (data) => {
  const handlerData = { ...data }

  function treeHandler(cdata) {
    if (cdata.auditPersonType === 2) {
      cdata.nodeUserList = cdata.nodeUserList.map((item) => {
        item.name = props.roleList.find(it => it.id === item.id)?.userName
        return item
      })
    }

    if (cdata.childNode) {
      treeHandler(cdata.childNode)
    }
  }

  treeHandler(handlerData)
  return { ...handlerData }
}

const initLayoutData = (data = props.initData) => {
  nodeConfig.value = handlerTreeSetName(data)
  setTableId(data.tableId)
}

onMounted(() => {
  setIsTried(false)
  initLayoutData()
})

defineExpose({
  saveSet,
  initLayoutData,
  initData: () => ({ ...nodeConfig.value })
})
</script>
<style>
@import "@/style/common/workflow.scss";
.error-modal-list {
  width: 455px;
}
.eventNone {
  pointer-events: none;
}
</style>
