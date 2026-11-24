<template>
  <div class="addIP-dialogDIV">
    <el-dialog class="addIP_Dialog"
               v-model="showDialog"
               :width="pxToRem(596)"
               :close-on-click-modal="active === 2 ? false : true"
               :show-close="active === 2 ? false : true"
               title="更新病历">
      <div class="content">
        <el-steps :active="active" align-center>
          <el-step title="更新范围" description="第一步">
            <template #icon>
              <span class="custom-dot" />
            </template>
          </el-step>
          <el-step title="确认更新数量" :class="active === 0 ? 'inactive-step' : ''" description="第二步">
            <template #icon>
              <span class="custom-dot" />
            </template>
          </el-step>
          <el-step title="更新结果" :class="active < 2 ? 'inactive-step' : ''" description="第三步">
            <template #icon>
              <span class="custom-dot" />
            </template>
          </el-step>
        </el-steps>
        <div v-if="active === 0" class="first-step">
          <img class="logo" :src="myRequire('diyibulogo.png')" />
          <p>检测到纳入条件更新，将依据新纳入条件从病历库重新拉取</p>
        </div>
        <div v-if="active === 1" class="first-step second-step">
          <img class="logo" :src="myRequire('diyibulogo.png')" />
          <p>共筛选出病历<span>{{ sum }}</span>份</p>
        </div>
        <div v-if="active === 2" class="first-step third-step">
          <img class="logo" v-if="resultText === '更新成功'" :src="myRequire('caijichenggong.png')" />
          <img class="logo" v-else :src="myRequire('caijishibai.png')" />
          <p>{{ resultText }}</p>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button class="prevBtn" v-if="active === 1 || resultText === '更新失败'" @click="prev">上一步</el-button>
        <!-- <el-button class="nextBtn" :disabled="active === 1" v-if="active === 0 || active === 1" type="primary" @click="submitForm(ruleFormRef)">下一步</el-button> -->
        <el-button class="nextBtn" v-if="active === 0 || active === 1" :disabled="active === 1 && parseInt(sum) === 0" type="primary" @click="submitForm(ruleFormRef)">下一步</el-button>
        <el-button class="confirmBtn" v-if="active === 2" type="primary" @click="handleUploadLibrary">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import lodash from 'lodash'
const active = ref(0)
const sum = ref(0)
const resultText = ref('更新成功')
const myRequire = (name) => new URL(`/src/assets/${name}`, import.meta.url).href
const props = defineProps({
  getProgressData: Function,
  storeInclusionCriteria: Function,
  isShow: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:isShow', 'uploadLibrary'])
const showDialog = ref(props.isShow)

// 监听父组件传入的 isShow，当父组件修改时更新 showDialog
watch(() => props.isShow, (newVal) => {
  showDialog.value = newVal
})

// 双向绑定，子组件关闭时将 showDialog 的值更新到父组件
watch(showDialog, (newVal) => {
  emit('update:isShow', newVal)
})

const submitFormBtn = async () => {
  console.log(active.value)
  if (active.value === 0) {
    sum.value = await props.getProgressData() || 0
    active.value = 1
  } else if (active.value === 1) {
    active.value = 2
    await props.storeInclusionCriteria()
  }
}
const submitForm = lodash.debounce(submitFormBtn, 1000, { leading: true, trailing: false })

const prev = () => {
  if (active.value > 0) {
    active.value--
  }
}

const handleClose = async () => {
  showDialog.value = false
}

const handleUploadLibrary = () => {
  emit('uploadLibrary')
  handleClose()
}
</script>

<style lang="scss" scoped>
.addIP-dialogDIV {
  :deep(.addIP_Dialog) {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    padding: 0;
    .el-dialog__body {
      padding-bottom: 0;
      .el-steps {
        display: flex;
        align-items: center;
        width: 548px;
        height: 78px;
        margin-bottom: 0;
        background: rgba(54, 112, 248, 0.05);
        .el-step__icon {
          background: none;
        }
        .custom-dot {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .el-step__head {
          .el-step__line {
            left: 16%;
            width: 114%;
            height: 1px;
            margin: 0 auto;
            background: #e8e8e8;
            .el-step__line-inner {
              border: 0;
            }
          }
          &.is-finish,
          &.is-process {
            .custom-dot {
              background: var(--theme-primary);
            }
          }
          &.is-finish {
            .el-step__line {
              background: var(--theme-primary);
            }
          }
          &.is-wait {
            .custom-dot {
              background: #d8d8d8;
            }
          }
        }
        .el-step__title {
          line-height: 22px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-3);
        }
        .el-step__description {
          margin-top: 0;
          line-height: 22px;
          font-weight: 400;
          font-size: 11px;
          color: var(--theme-text-3) !important;
        }
        .el-step__main {
          .is-process,
          .is-wait,
          .is-finish {
            color: var(--theme-text);
          }
        }
        .el-step:nth-child(1) {
          padding-left: 24px;
          .el-step__head {
            text-align: left;
            .el-step__icon {
              margin-left: 9px;
            }
          }
          .el-step__main {
            text-align: left;
            .el-step__description {
              padding-left: 6%;
            }
          }
        }
        .el-step:nth-child(2) {
          .el-step__head {
            .el-step__line {
              left: 60%;
              width: 112%;
            }
          }
        }
        .el-step:nth-child(3) {
          padding-right: 24px;
          .el-step__head {
            text-align: right;
            .el-step__icon {
              margin-right: 8px;
            }
          }
          .el-step__main {
            text-align: right;
            .el-step__description {
              padding-right: 7%;
            }
          }
        }
      }
      .is-horizontal {
        .el-step__main {
          .is-wait {
            color: var(--theme-text-3) !important;
          }
        }
      }
      .first-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 270px;
        margin: 0 auto;
        margin-bottom: 32px;
        img {
          display: block;
          width: 46px;
          height: 51px;
          margin: 39px 0 17px 0;
        }
        p {
          margin: 0;
          line-height: 20px;
          text-align: center;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text);
        }
      }
      .second-step {
        img {
          margin-top: 55px;
        }
        span {
          color: var(--theme-primary);
        }
      }
      .third-step {
        img {
          width: 50px;
          height: 50px;
          margin: 63px 0 8px 0;
        }
        p {
          line-height: 20px;
          font-weight: 500;
          font-size: 14px;
          color: var(--theme-text);
        }
      }
    }
    .dialog-footer {
      padding: 24px 0;
    }
  }
}
</style>
