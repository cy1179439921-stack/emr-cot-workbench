<template>
  <el-drawer :append-to-body="true" title="审批人设置" v-model="visible" class="set_promoter" :size="pxToRem(490)" :with-header="false" :before-close="saveApprover" :close-on-click-modal="false">
    <div class="demo-drawer__content">
      <div class="drawer_content">
        <div class="drawer_title">
          <div class="section-title">
            <template v-if="!isInput">
              <div class="line"></div>
              <span class="title">{{ approverConfig.name }}</span>
              <i class="iconfont icon-bianji3" @click="isInput=true"></i>
            </template>
            <el-input v-if="isInput" :maxlength="15" v-model="approverConfig.name" @keyup.enter="blurEvent" @blur="blurEvent" v-focus clearable/>
          </div>
          <i class="iconfont icon-guanbi1" v-if="!isInput" @click="closeDrawer"></i>
        </div>
        <h4 class="drawer_subtitle">设置审批人</h4>
        <div class="approver_content">
          <h4 class="approver">审批人</h4>
          <div class="approver_type">
            <el-radio-group v-model="approverConfig.auditPersonType" class="clear" @change="changeType">
              <el-radio v-for="({value, label}) in setTypes" :key="value" :label="value">{{label}}</el-radio>
            </el-radio-group>

            <template v-if="approverConfig.auditPersonType == 2">
              <h4 class="drawer_subtitle mb16">添加成员<span>（限1人）</span></h4>
              <div class="flex_align_center">
                <el-button type="primary" @click="addApprover" link class="add_approver">
                  <i class="iconfont icon-tianjiayihang"></i>
                  <span>添加成员</span>
                </el-button>
                <p class="selected_list">
                  <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">
                    <div v-show-tip class="content">
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        :content=" item.name "
                        placement="bottom"
                        :open-delay="400"
                        :enterable="false"
                        :hide-after="0"
                      >
                        <p>{{item.name}}</p>
                      </el-tooltip>
                    </div>
                    <i class="iconfont icon-guanbi1" @click="$func.removeEle(approverConfig.nodeUserList,item,'targetId')"></i>
                  </span>
                </p>
              </div>
            </template>

            <template v-if="approverConfig.auditPersonType == 0">
              <h4 class="drawer_subtitle mb16">制定审批层次</h4>
              <div class="approver_manager">
                <span class="label">提交人：</span>
                <el-select :model-value="1">
                  <el-option :value="1" label="直属科室负责人"></el-option>
                </el-select>
              </div>
            </template>

            <template v-if="approverConfig.auditPersonType == 1">
              <h4 class="drawer_subtitle mb16">制定审批层次</h4>
              <div class="approver_manager">
                <span class="label">提交人：</span>
                <el-select v-model="approverConfig.designatedPersonInCharge" value-key="id" placement="bottom">
                  <el-option v-for="(it) in departmentOptions" :key="it.id" :value="it.id" :label="it.name + '负责人'"></el-option>
                </el-select>
              </div>
            </template>

          </div>
        </div>
        <div class="approver_some" v-if="approverConfig.auditPersonType == 0">
          <p class="mb14">审批人与提交人为同一人时</p>
          <!-- v-model="approverConfig.examineMode"  -->
          <el-radio-group :model-value="1" class="clear">
            <el-radio :value="1">由提交人对自己审批</el-radio>
          </el-radio-group>
        </div>
        <!-- <div class="approver_self" v-if="approverConfig.auditPersonType==5">
          <p>该审批节点设置“发起人自己”后，审批人默认为发起人</p>
        </div> -->
        <!-- <div class="approver_self_select" v-show="approverConfig.auditPersonType==4">
          <el-radio-group v-model="approverConfig.selectMode" style="width: 100%;">
            <el-radio v-for="({value, label}) in selectModes" :label="value" :key="value">{{label}}</el-radio>
          </el-radio-group>
          <h3>选择范围</h3>
          <el-radio-group v-model="approverConfig.selectRange" style="width: 100%;" @change="changeRange">
            <el-radio v-for="({value, label}) in selectRanges" :label="value" :key="value">{{label}}</el-radio>
          </el-radio-group>
          <template v-if="approverConfig.selectRange==2||approverConfig.selectRange==3">
            <el-button type="primary" @click="addApprover" v-if="approverConfig.selectRange==2">添加/修改成员</el-button>
            <el-button type="primary" @click="addRoleApprover" v-else>添加/修改角色</el-button>
            <p class="selected_list">
              <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">{{item.name}}
                <img src="@/assets/close.png" @click="$func.removeEle(approverConfig.nodeUserList,item,'targetId')">
              </span>
              <a v-if="approverConfig.nodeUserList.length!=0&&approverConfig.selectRange!=1" @click="approverConfig.nodeUserList=[]">清除</a>
            </p>
          </template>

        </div> -->
        <!-- <div class="approver_manager" v-if="approverConfig.auditPersonType==7">
          <p>审批终点</p>
          <p style="padding-bottom: 20px;">
            <span>发起人的：</span>
            <select v-model="approverConfig.examineEndDirectorLevel">
              <option v-for="item in directorMaxLevel" :value="item" :key="item">{{item==1?'最高':'第'+item}}层级主管</option>
            </select>
          </p>
        </div> -->
        <!-- <div class="approver_some" v-if="(approverConfig.auditPersonType==1&&approverConfig.nodeUserList.length>1)||approverConfig.auditPersonType==2||(approverConfig.auditPersonType==4&&approverConfig.selectMode==2)">
          <p>多人审批时采用的审批方式</p>
          <el-radio-group v-model="approverConfig.examineMode" class="clear">
            <el-radio :value="1">依次审批</el-radio>
            <br/>
            <el-radio :value="2" v-if="approverConfig.auditPersonType!=2">会签(须所有审批人同意)</el-radio>
          </el-radio-group>
        </div> -->
        <!-- <div class="approver_some" v-if="approverConfig.auditPersonType==2||approverConfig.auditPersonType==7">
          <p>审批人为空时</p>
          <el-radio-group v-model="approverConfig.noHanderAction" class="clear">
            <el-radio :value="1">自动审批通过/不允许发起</el-radio>
            <br/>
            <el-radio :value="2">转交给审核管理员</el-radio>
          </el-radio-group>
        </div> -->
      </div>
      <div class="demo-drawer__footer clear">
        <el-button @click="closeDrawer">取 消</el-button>
        <el-button type="primary" @click="saveApprover">确 定</el-button>
      </div>
      <employees-dialog
        :agencyId="agencyId"
        v-model:visible="approverVisible"
        :data="checkedList"
        @change="sureApprover"
      />
      <!-- <role-dialog
        v-model:visible="approverRoleVisible"
        :data="checkedRoleList"
        @change="sureRoleApprover"
      /> -->
    </div>
  </el-drawer>
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import $func from '@/utils/fun'
import { useStore } from '@/store/workflow'
import employeesDialog from '../dialog/employeesDialog.vue'
// import roleDialog from '../dialog/roleDialog.vue'

const props = defineProps({
  departmentOptions: {
    type: Array,
    default: () => []
  },
  agencyId: {
    type: String,
    required: true
  }
})

const setTypes = [
  { value: 0, label: '直属科室负责人' },
  { value: 1, label: '指定科室负责人' },
  { value: 2, label: '指定成员' }
]
const isInput = ref(false)
const approverConfig = ref({})
const approverVisible = ref(false)
// const approverRoleVisible = ref(false)
// const checkedRoleList = ref([])
const checkedList = ref([])
const store = useStore()
const { setApproverConfig, setApprover } = store
const approverConfig1 = computed(() => store.approverConfig1)
const approverDrawer = computed(() => store.approverDrawer)
const visible = computed({
  get() {
    return approverDrawer.value
  },
  set() {
    closeDrawer()
  }
})
watch(approverConfig1, (val) => {
  approverConfig.value = val.value
})
// const changeRange = () => {
//   approverConfig.value.nodeUserList = []
// }
const changeType = (val) => {
  approverConfig.value.nodeUserList = []
  approverConfig.value.examineMode = 1
  // approverConfig.value.noHanderAction = 2
  // if (val === 0) {
  //   approverConfig.value.directorLevel = 1
  // }
  // if (val === 1) {
  //   approverConfig.value.designatedPersonInCharge = ''
  // }
  // if (val === 2) {
  //   approverConfig.value.nodeUserList = []
  // }
  //  else if (val === 4) {
  //   approverConfig.value.selectMode = 1
  //   approverConfig.value.selectRange = 1
  // } else if (val === 7) {
  //   approverConfig.value.examineEndDirectorLevel = 1
  // }
}
const addApprover = () => {
  approverVisible.value = true
  checkedList.value = approverConfig.value.nodeUserList
}
// const addRoleApprover = () => {
//   approverRoleVisible.value = true
//   checkedRoleList.value = approverConfig.value.nodeUserList
// }
const sureApprover = (data) => {
  approverConfig.value.nodeUserList = data
  approverVisible.value = false
}
// const sureRoleApprover = (data) => {
//   approverConfig.value.nodeUserList = data
//   approverRoleVisible.value = false
// }
const saveApprover = () => {
  approverConfig.value.error = !$func.setApproverStr(approverConfig.value, props.departmentOptions)
  setApproverConfig({
    value: approverConfig.value,
    flag: true,
    id: approverConfig1.value.id
  })
  closeDrawer()
}

const blurEvent = () => {
  if (!approverConfig.value.name) {
    approverConfig.value.name = '审批'
  }
  isInput.value = false
}

const closeDrawer = () => {
  setApprover(false)
}
</script>
<style lang="scss" scoped>
.set_promoter {
  width: 490px;
  font-family: "San francisco", PingFangSC-Light, sans-serif;
  .el-drawer__body {
    padding: 24px;
  }
  .drawer_content {
    flex: 1;
    .drawer_title {
      display: flex;
      justify-content: space-between;
    }
    .section-title {
      display: flex;
      align-items: center;
      flex: 1;
      height: 20px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
      .title {
        font-weight: normal;
        font-size: 14px;
        color: var(--theme-text);
      }
      .line {
        width: 2px;
        height: 14px;
        margin-right: 6px;
        background-color: var(--theme-primary);
      }
      .icon-bianji3 {
        margin-left: 8px;
        font-size: 14px;
        color: #3570f8;
      }
      .el-input {
        width: 100%;
      }
    }
    .icon-guanbi1 {
      cursor: pointer;
      font-size: 12px;
      color: var(--theme-text-3);
    }
    .drawer_subtitle {
      margin: 16px 0;
      font-weight: normal;
      font-size: 14px;
      color: var(--theme-text);
      &.mb16 {
        margin-top: 10px;
        margin-bottom: 16px;
      }
      span {
        font-weight: normal;
        color: var(--theme-text-3);
      }
    }
  }
  .demo-drawer__content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .demo-drawer__footer {
    display: flex;
    justify-content: flex-end;
  }
  .approver_content {
    box-sizing: border-box;
    margin-bottom: 24px;
    border: 1px solid #e8e8e8;
    border-radius: 2px;
    .approver {
      margin: 0;
      padding-left: 16px;
      background: rgba(54, 112, 248, 0.05);
      line-height: 40px;
      font-weight: normal;
      font-size: 14px;
      color: var(--theme-text);
    }
    .approver_type {
      box-sizing: border-box;
      padding: 12px 16px;
      .approver_manager {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        .label {
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text);
          white-space: nowrap;
        }
      }
      .add_approver>span {
        display: flex;
        align-items: center;
        i {
          margin-right: 4px;
          font-size: 12px;
        }
      }
      .flex_align_center {
        display: flex;
        overflow: hidden;
        align-items: center;
      }
    }
  }
}
.mb14 {
  margin-bottom: 14px;
  font-weight: 500;
}
</style>
