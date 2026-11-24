<template>
  <div class="title-container" v-if="activeTab === 1">
    <span class="label">标题：</span>
    <el-input v-model="data.option.name" type="text" class="input"/>
    <div class="multipleChoice">
      <div class="flex">
        <span>选择项内容</span>
        <el-button type="text" class="multipleChoicebtn" @click="()=>{ data.option.options.push('空' + (data.option.options.length + 1)); }">+ 新选项</el-button>
      </div>
    </div>
    <VueDraggableNext v-model="data.option.options" class="dragItem" handle=".icon-xuanxiangbiaoshi" animation="300">
      <transition-group>
        <div class="item" v-for="(item,index) in data.option.options" :key="index">
          <i class="iconfont icon-xuanxiangbiaoshi"></i>
          <el-input v-model.trim="data.option.options[index]" type="text" class="input"></el-input>
          <i class="iconfont icon-jia" @click="addChildren(data.option.options[index])"></i>
          <i class="iconfont icon-guanbi" @click="()=>{ data.option.options.splice(index,1) }"></i>
        </div>
      </transition-group>
    </VueDraggableNext>
  </div>
  <div class="common" v-else>
    <common :data="data"></common>
  </div>
  <el-dialog v-model="dialogVisible" title="设置子集关联关系" :width="pxToRem(500)">
    <el-select v-model="selectChildren" multiple style="width: 100%;" placeholder="请选择子集">
      <el-option
        v-for="item in options"
        :key="item.key"
        :label="item.name"
        :value="item.key"
      />
    </el-select>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="saveRelation()"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { toRefs, ref, nextTick } from 'vue'
import common from '@/components/draggable/layoutContainer/editComponents/common.vue'
import _ from 'lodash'
import { VueDraggableNext } from 'vue-draggable-next'

const props = defineProps({
  data: {
    type: Object
  },
  activeTab: {
    type: Number,
    default: 0
  },
  dataSource: {
    type: Object
  }
})
const { data, dataSource } = toRefs(props)

const dialogVisible = ref(false) // 子集关联弹窗显示
const selectItem = ref('') // 选择的项
const selectChildren = ref([]) // 选择的子集
const options = ref([]) // 子集选项
// 选择项弹窗
const addChildren = async (item) => {
  selectItem.value = item
  selectChildren.value = []
  options.value = []

  const selected = await dataSource.value.childrenRelation.reduce((total, currentValue) => {
    if (currentValue.relation.includes(data.value.key)) { // 如果当前被其他项关联，则不显示父级
      total.push(currentValue.key)
    }
    // 这里走的是收集已经被关联过的数据
    if (currentValue.key === data.value.key && currentValue.select === item) {
      selectChildren.value = currentValue.relation
    } else {
      total.push(...currentValue.relation)
    }
    return total
  }, []) || []

  nextTick(() => {
    // 收集子集选项
    formRcursive(dataSource.value.data, selected)
    dialogVisible.value = true
  })

  dialogVisible.value = true
}

// 收集子集选项
const formRcursive = (list, selected) => {
  for (const i in list) {
    const rowData = list[i]
    if (rowData.type === 'LayoutContainer') {
      this.formRcursive(rowData.col, selected)
    } else {
      const { key, option, type } = rowData
      const { name } = option
      if (key !== data.value.key && !selected.includes(key)) {
        options.value.push({ key, type, name })
      }
    }
  }
}

// 保存子集关联关系
const saveRelation = () => {
  dialogVisible.value = false
  const params = {
    key: data.value.key,
    select: selectItem.value,
    relation: selectChildren.value,
    name: data.value.option.name,
    valueType: 'array'
  }

  if (_.get(dataSource.value, 'childrenRelation', []).some(it => it.key === params.key && it.select === params.select)) {
    dataSource.value.childrenRelation = dataSource.value.childrenRelation.map(it => {
      if (it.key === params.key && it.select === params.select) {
        it = { ...params }
      }
      return it
    })
  } else {
    dataSource.value?.childrenRelation?.push(params)
  }
}
</script>
<style lang="scss" scoped>
.label {
  display: block;
  margin-top: 35px;
  margin-bottom: 6px;
  line-height: 20px;
  font-weight: 400;
  font-size: 14px;
  color: #646464;
}
.input {
  width: 100%;
  .el-input-number__decrease,
  .el.inputNumber.increase {
    display: none;
  }
}
.multipleChoice {
  margin-top: 20px;
  margin-bottom: 6px;
  font-size: 14px;
  .multipleChoicebtn {
    font-size: 14px;
  }
}
.flex,
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item {
  margin-bottom: 4px;
  padding: 0 14px;
  border-radius: 8px 8px 8px 8px;
  background: var(--theme-fill);
  cursor: pointer;
  &:hover {
    background: var(--theme-primary-soft);
    .icon-xuanxiangbiaoshi {
      color: var(--theme-primary);
    }
    :deep(.el-input__inner) {
      background-color: var(--theme-card);
    }
    :deep(.el-input__wrapper) {
      background-color: var(--theme-primary-soft);
    }
  }
  .icon-guanbi {
    font-size: 20px;
  }
}
</style>
