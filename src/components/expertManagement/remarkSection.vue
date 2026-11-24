<template>
  <div class="remarkSection">
    <!-- 头部说明 -->
    <div class="remarkHeader">
      <span class="label">{{ title }}：</span>
      <span v-if="!remarkList || remarkList.length === 0" class="val">-</span>
    </div>

    <!-- 备注时间线列表 -->
    <el-timeline v-if="remarkList && remarkList.length > 0" class="customTimeline margin-top-16">
      <el-timeline-item
        v-for="(item, index) in remarkList"
        :key="item.id || index"
        hollow
        type="primary"
      >
        <div class="timelineTitle">{{ item.createTime || '-' }}</div>
        <div class="timelineText">{{ item.noteText || '-' }}</div>
        <div class="deleteBtn" @click="handleDeleteRemark(item, index)" v-if="isEdit">
          删除
        </div>
      </el-timeline-item>
    </el-timeline>

    <!-- 添加备注按钮 -->
    <el-button
      v-if="isEdit"
      class="lineBtn blueLine"
      :class="{ editBtn: !remarkList?.length }"
      @click="openRemarkDialog"
    >
      <i class="iconfont icon-bianji1"></i>
      添加备注
    </el-button>

    <!-- 添加备注弹窗 -->
    <el-dialog
      :title="`添加${title}`"
      v-model="dialogVisible"
      :width=" pxToRem(520)"
      :before-close="closeRemarkDialog"
      class="remarkDialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
      >
        <el-form-item label="备注内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            maxlength="500"
            show-word-limit
            resize="none"
            placeholder="仅管理员可见，专家不可见"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRemarkDialog">取 消</el-button>
          <el-button type="primary" @click="confirmSaveRemark">保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 1. Props 定义：与父组件绑定参数保持一致
defineProps({
  // 备注列表数据
  remarkList: {
    type: Array,
    default: () => []
  },
  // 标题文字
  title: {
    type: String,
    default: '其他核算备注'
  },
  isEdit: {
    type: Boolean,
    default: true
  }
})

// 2. Emits 定义：按要求的 @save 和 @delete 抛出事件
const emit = defineEmits(['save', 'delete'])

// 状态定义
const dialogVisible = ref(false)
const formRef = ref(null)
const form = reactive({
  content: ''
})

const formRules = {
  content: [{ required: true, message: '请填写备注内容', trigger: 'blur' }]
}

// 打开弹窗
const openRemarkDialog = () => {
  form.content = ''
  dialogVisible.value = true
}

// 关闭弹窗并重置校验
const closeRemarkDialog = () => {
  dialogVisible.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 点击保存 -> 抛出 @save 事件
const confirmSaveRemark = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      // 触发父组件的 @save 方法，并将新增数据作为参数抛出
      emit('save', form.content, () => {
        closeRemarkDialog()
        ElMessage.success('已保存')
      })
    }
  })
}

// 点击删除 -> 抛出 @delete 事件
const handleDeleteRemark = (item, index) => {
  ElMessageBox.confirm('删除后无法恢复，确认删除这条备注吗？', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  }).then(() => {
    // 触发父组件的 @delete 方法，抛出删除项与索引
    emit('delete', { item, index })
  })
}
</script>

<style lang="scss" scoped>
.remarkSection {
  .remarkHeader {
    display: flex;
    align-items: center;

    .label {
      font-size: 16px;
      color: var(--theme-text);
    }

    .val {
      font-size: 16px;
      color: var(--theme-text-2);
    }
  }

  /* 时间线组件重置样式 */
  .customTimeline {
    padding-left: 4px;
    :deep(.el-timeline-item) {
      padding-bottom: 24px;
      // &:nth-last-of-type(1) {
      //   padding-bottom: 0;
      // }
    }
    .timelineTitle {
      line-height: 23px;
      font-weight: 600;
      font-size: 16px;
      color: var(--theme-text);
    }

    .timelineText {
      margin-top: 4px;
      font-weight: 400;
      font-size: 16px;
      color: var(--theme-text-2);
    }

    .deleteBtn {
      width: 40px;
      margin-top: 8px;
      padding: 0 !important;
      cursor: pointer;
      line-height: 23px;
      font-size: 16px;
      color: #ff1414;
    }
  }

  .editBtn {
    margin-top: 16px;
  }
}

/* 通用按钮样式 */
.el-button.lineBtn {
  width: 124px;
  height: 40px;
  border-radius: 20px !important;
  font-weight: 600;
  font-size: 16px;
  color: var(--theme-text-2);

  .iconfont {
    margin-right: 10px;
  }

  &.blueLine {
    border-color: var(--theme-primary);
    color: var(--theme-primary);

    .iconfont {
      color: var(--theme-primary);
    }
  }
}

.margin-top-16 {
  margin-top: 16px;
}

.margin-top-24 {
  margin-top: 24px;
}
</style>

<style lang="scss">
/* 弹窗样式调整 */
.remarkDialog {
  &.el-dialog .el-dialog__header {
    padding-bottom: 16px !important;
  }

  .el-form--label-top .el-form-item__label {
    margin: 0 0 10px 0 !important;
    font-weight: 500;
  }
}
</style>
