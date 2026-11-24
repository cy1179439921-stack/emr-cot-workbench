<template>
  <div class="add-node-btn-box">
    <div class="add-node-btn">
      <el-popover placement="right" v-model="visible" width="auto">
        <div class="add-node-popover-body">
          <a class="add-node-popover-item approver" @click="addType(1)">
            <i class="iconfont icon-bianji3"></i>
            <p>审批人</p>
          </a>
          <!-- <a class="add-node-popover-item notifier" @click="addType(2)">
            <div class="item-wrapper">
              <span class="iconfont icon-a-shangchuantupian-jiahao"></span>
            </div>
            <p>抄送人</p>
          </a>
          <a class="add-node-popover-item condition" @click="addType(4)">
            <div class="item-wrapper">
              <span class="iconfont icon-a-shangchuantupian-jiahao"></span>
            </div>
            <p>条件分支</p>
          </a> -->
        </div>
        <template #reference>
          <button class="btn" type="button">
            <!-- <span class="iconfont icon-a-shangchuantupian-jiahao"></span> -->
            <img :src="add" alt="">
          </button>
        </template>
      </el-popover>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useStore } from '@/store/workflow'
import add from '@/assets/add.png'
const { setIsTried } = useStore()
const props = defineProps({
  childNodeP: {
    type: Object,
    default: () => ({})
  }
})
const emits = defineEmits(['update:childNodeP'])
const visible = ref(false)
const addType = (type) => {
  visible.value = false
  if (type !== 4) {
    let data
    if (type === 1) {
      data = {
        name: '审批',
        error: true,
        type: 1,
        auditPersonType: null,
        // selectMode: 0,
        // selectRange: 0,
        directorLevel: '',
        // examineMode: 1,
        // noHanderAction: 1,
        // examineEndDirectorLevel: 0,
        designatedPersonInCharge: '',
        childNode: props.childNodeP,
        nodeUserList: []
      }
      setIsTried(false)
    } else if (type === 2) {
      data = {
        name: '抄送人',
        type: 2,
        ccSelfSelectFlag: 1,
        childNode: props.childNodeP,
        nodeUserList: []
      }
    }
    emits('update:childNodeP', data)
  } else {
    emits('update:childNodeP', {
      name: '路由',
      type: 4,
      childNode: null,
      conditionNodes: [{
        name: '条件1',
        error: true,
        type: 3,
        priorityLevel: 1,
        conditionList: [],
        nodeUserList: [],
        childNode: props.childNodeP
      }, {
        name: '条件2',
        type: 3,
        priorityLevel: 2,
        conditionList: [],
        nodeUserList: [],
        childNode: null
      }]
    })
  }
}
</script>
<style scoped lang="scss">
.add-node-btn-box {
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  position: relative;
  flex-shrink: 0;
  width: 240px;
  -ms-flex-negative: 0;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  &::before {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: -1;
    width: 2px;
    height: 100%;
    margin: auto;
    background-color: #cacaca;
    content: "";
  }
  .add-node-btn {
    display: flex;
    justify-content: center;
    flex-grow: 1;
    flex-shrink: 0;
    width: 240px;
    padding: 35px 0 40px;
    user-select: none;
    -webkit-box-pack: center;
    -webkit-box-flex: 1;
    .btn {
      display: flex;
      position: relative;
      justify-content: center;
      align-items: center;
      width: 18px;
      height: 18px;
      border: none;
      border-radius: 50%;
      outline: none;
      background: var(--theme-primary);
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .1);
      -webkit-transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      img {
        width: 8px;
        height: 8px;
        cursor: pointer;
      }
      &:hover {
        box-shadow: 0 13px 27px 0 rgba(0, 0, 0, .1);
      }
      &:active {
        background: #1e83e9;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .1);
        transform: none;
      }
    }
  }
}
</style>
<style lang="scss">
.add-node-popover-body {
  display: flex;
  .add-node-popover-item {
    display: flex;
    align-items: center;
    flex: 1;
    margin-right: 10px;
    cursor: pointer;
    text-align: center;
    i {
      margin-right: 8px;
      color: var(--theme-text-2);
    }
    p {
      color: var(--theme-text);
    }
    .item-wrapper {
      display: inline-block;
      width: 80px;
      height: 80px;
      margin-bottom: 5px;
      border: 1px solid #e2e2e2;
      border-radius: 50%;
      background: var(--theme-card);
      user-select: none;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      .iconfont {
        line-height: 80px;
        font-size: 35px;
      }
    }
    &.approver {
      .item-wrapper {
        color: #ff943e;
      }
    }
    &.notifier {
      .item-wrapper {
        color: #3296fa;
      }
    }
    &.condition {
      .item-wrapper {
        color: #15bc83;
      }
    }
    &:hover {
      .item-wrapper {
        background: #3296fa;
        box-shadow: 0 10px 20px 0 rgba(50, 150, 250, .4);
      }
    }
    &:active {
      .item-wrapper {
        background: #eaeaea;
        box-shadow: none;
      }
      .iconfont {
        color: inherit;
      }
    }
  }
}
.el-popover.el-popper {
  min-width: 94px;
  padding: 14px 16px;
}
</style>
