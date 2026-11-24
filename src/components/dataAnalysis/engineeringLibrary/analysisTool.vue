<template>
  <div class="analysisTool" :class="pageType === 1 ? 'detailsPage' : ''">
    <el-button class="signBtn" @click="toSign(1)" v-if="!sign && nodeObject.name !== '数据可视化'">
      <i class="iconfont icon-biaoji-1"></i>标记为核心节点
    </el-button>
    <el-button class="signBtn hadSign" @click="toSign(0)" v-if="sign === 1">
      <i class="iconfont icon-biaoji-2"></i>已标记核心节点
    </el-button>
    <el-button class="downloadBtn" @click="exportPDF">
      <i class="iconfont icon-daochu2"></i>下载PDF
    </el-button>
    <el-button class="jumpBtn" type="primary" @click="toCurrentNode" v-if="pageType && (!needCheckPermission || otherPermissions.includes('跳转'))">
      <i class="iconfont icon-tiaozhuan-3"></i>跳转至该节点
    </el-button>
    <el-button class="editBtn" type="primary" @click="emits('toEditCode')" v-if="!pageType">
      <i class="iconfont icon-daimabianji"></i>代码编辑
    </el-button>
  </div>
</template>
<script setup>
defineOptions({
  name: 'AnalysisTool',
  inheritAttrs: false
})
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getPagePermission, getOtherPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission } = getPagePermission('/dataAnalysis/engineeringLibrary')
const { OtherPagePermissionList } = getOtherPagePermission(['/dataAnalysis/operationLog'])
const otherPermissions = ref([])
if (OtherPagePermissionList.value.length > 0) {
  otherPermissions.value = OtherPagePermissionList.value[0].permission
}
const emits = defineEmits(['toSign', 'exportPDF', 'toCurrentNode', 'toEditCode'])
defineProps({
  pageType: {
    // 1表示详情页
    type: Number
  },
  downloadId: {
    type: String
  },
  currentNode: {
    type: Object,
    required: true
  },
  nodeObject: {
    type: Object,
    default: () => ({})
  }
})
const sign = ref(0)
const exportPDF = async () => {
  emits('exportPDF', '')
}
const toCurrentNode = () => {
  emits('toCurrentNode', '')
}
const toSign = (flag) => {
  if (flag === 0) {
    ElMessageBox.confirm(`确认取消核心节点标记吗？`, '取消标记', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }).then(() => {
      emits('toSign', flag)
    })
  } else {
    emits('toSign', flag)
  }
}
const setSign = (flag) => {
  sign.value = flag
}
defineExpose({
  setSign
})
</script>
<style scoped lang="scss">
.analysisTool {
  .el-button {
    i {
      margin-right: 10px;
    }
  }
  .el-button + .el-button {
    margin-left: 10px;
  }
  .signBtn {
    i {
      font-size: 16px;
      color: var(--theme-text-2);
    }
    &:hover {
      i {
        color: var(--theme-primary);
      }
    }
  }
  .hadSign {
    i {
      font-size: 16px;
      color: #feb40e;
    }
    &:hover {
      i {
        color: #feb40e;
      }
    }
  }
  .jumpBtn {
    i {
      font-size: 15px;
    }
  }
  .downloadBtn {
    i {
      font-size: 14px;
      color: var(--theme-text-2);
    }
    &:hover {
      i {
        color: var(--theme-primary);
      }
    }
  }
  .editBtn {
    i {
      font-size: 14px;
    }
  }
}
</style>
