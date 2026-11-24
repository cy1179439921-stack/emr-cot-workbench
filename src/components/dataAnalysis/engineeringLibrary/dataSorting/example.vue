<template>
  <el-dialog
    v-model="dialogVisible"
    :width="pxToRem(1066)"
    destroy-on-close
    :before-close="handleClose"
  >
    <template #header>
      <el-tooltip
        class="box-item"
        effect="dark"
        placement="bottom-start"
      >
        <div class="titleContainer">
          <span>{{titleObj.name}}</span>
          <i class="iconfont icon-querentishi headerIcon"></i>
        </div>
        <template #content>
          <div class="toolTipContent">
            {{ titleObj.explain }}
          </div>
        </template>
      </el-tooltip>
    </template>
    <div >
      <div class="variableSelectionContainer">
        <variableSelection
          :titleObj="titleObj"
          @handleChange="handleChange"
          :initDataList="dataList"
          :showTag="true"
          :isBatch="true"
          :disabledTypeArr="[]"
        >
        </variableSelection>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose(false)">取&nbsp;消</el-button>
        <el-button type="primary" @click="handleSure">
          确&nbsp;定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import variableSelection from '../common/variableSelection.vue'
const emits = defineEmits(['handleClose'])

defineProps({
  titleObj: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const dialogVisible = ref(true)
const handleSure = () => {
}
const handleClose = (done) => {
  emits('handleClose')
  if (done) {
    done()
  }
}
// 需要传入的数据
const dataList = ref([
  { type: '1', name: 'Group', nullFlag: false },
  { type: '1', name: 'age', nullFlag: true },
  { type: '2', name: 'sex', nullFlag: false },
  { type: '0', name: 'BMI', nullFlag: false },
  { type: '0', name: 'ASA', nullFlag: true },
  { type: '1', name: 'age1', nullFlag: false },
  { type: '1', name: 'sex1', nullFlag: false },
  { type: '2', name: 'BMI1', nullFlag: false },
  { type: '1', name: 'ASA1', nullFlag: false },
  { type: '2', name: 'age2', nullFlag: false },
  { type: '0', name: 'sex2', nullFlag: false },
  { type: '0', name: 'BMI2', nullFlag: false },
  { type: '0', name: 'ASA2', nullFlag: false }
])
const handleChange = (obj) => {
  console.log('选择的变量', obj)
}
defineExpose({
})
</script>
<style scoped lang="scss">
.description {
  height: 94px;
  :deep(textarea) {
    height: 94px;
  }
}
:deep(.el-form-item__label) {
  align-items: center;
  height: 40px;
}
:deep(.el-form-item:nth-last-of-type(1)) {
  margin-bottom: 0;
}
.toolTipContent {
  max-width: 1000px;
}
.variableSelectionContainer {
  overflow: hidden;
  width: 260px;
  height: 400px;
}
.titleContainer {
  display: flex;
  align-items: center;
}
.headerIcon {
  margin-left: 8px;
  color: var(--theme-text-3);
}
</style>
