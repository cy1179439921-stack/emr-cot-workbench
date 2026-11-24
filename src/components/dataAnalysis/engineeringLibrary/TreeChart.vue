<template>
  <table v-if="treeData.name">
    <tr>
      <td :colspan="Array.isArray(treeData.children) ? treeData.children.length * 2 : 1"
          :class="{parentLevel: Array.isArray(treeData.children) && treeData.children.length, extend: Array.isArray(treeData.children) && treeData.children.length && treeData.extend}"
      >
        <div class="node">
          <div class="person" :class="treeData?.class" @click="$emit('click-node', treeData)">
            <slot :treeData="treeData">
              <div class="avat">
                {{ treeData.name }}
              </div>
            </slot>
          </div>
        </div>
        <div class="extend_handle" v-if="expandable && Array.isArray(treeData.children) && treeData.children.length" @click="toggleExtend(treeData)"></div>
      </td>
    </tr>
    <tr v-if="Array.isArray(treeData.children) && treeData.children.length && treeData.extend">
      <td v-for="(children, index) in treeData.children" :key="index" colspan="2" class="childLevel">
        <TreeChart :json="children" :expandable="expandable" @click-node="$emit('click-node', $event)"/>
      </td>
    </tr>
  </table>
</template>

<script setup>
import { watch, ref, getCurrentInstance } from 'vue'
const { proxy: $vm } = getCurrentInstance()
const porps = defineProps({
  json: { // 树形数据
    type: Object,
    required: true
  },
  expandable: { // 是否可扩展
    type: Boolean,
    default: true
  },
  tbHeidht: { // 边框高度
    type: Number,
    default: 24
  },
  radian: { // 左右边框弧度
    type: Number,
    default: 0
  },
  nodeLRMargins: { // 节点左右边距
    type: Number,
    default: 12
  }
})

const treeData = ref({})

watch(() => porps.json, (newVal) => {
  const extendKey = function(jsonData) {
    // eslint-disable-next-line no-void
    jsonData.extend = (jsonData.extend === void 0 ? true : !!jsonData.extend)
    if (Array.isArray(jsonData.children)) {
      jsonData.children.forEach(c => {
        extendKey(c)
      })
    }
    return jsonData
  }
  if (newVal) {
    treeData.value = extendKey(newVal)
  }
}, { immediate: true })

const toggleExtend = (treeData) => {
  treeData.extend = !treeData.extend
  $vm.$forceUpdate()
}

const pxToRem = (px) => {
  const baseFontSize = 14 // 设定基准字体大小，比如14px
  return `${px / baseFontSize}rem`
}

const borderTopHeight = porps.tbHeidht // 上边框高度
const borderBottomHeight = porps.tbHeidht // 下边框高度
const nodeLRMargins = porps.nodeLRMargins // 节点左右边距
const borderCenter = -borderBottomHeight // 边框中心线高度
const bottomBorderHeight = -(borderBottomHeight - 2) // 下框线定位高度
</script>

<style lang="scss" scoped>
$border-top-height:v-bind('pxToRem(borderTopHeight - 1)');
$border-bottom-height:v-bind('pxToRem(borderBottomHeight)');
$border-center:v-bind('pxToRem(borderCenter)');
$nodeNextHeight: v-bind('pxToRem(borderTopHeight + borderBottomHeight - 6)');
$nodeLRMargins:v-bind('pxToRem(nodeLRMargins)');
$bottomBorderHeight:v-bind('pxToRem(bottomBorderHeight)');
$lrRadius: v-bind('pxToRem(porps.radian)');
table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}
td {
  position: relative;
  vertical-align: top;
  text-align: center;
  &.parentLevel {
    padding-bottom: $nodeNextHeight;
  }
}

.extend_handle {
  position: absolute;
  left: 50%;
  bottom: 30px;
  width: 10px;
  height: 10px;
  padding: 10px;
  cursor: pointer;
  transform: translate3d(-15px, 0, 0);
}
.extend_handle::before {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 2px solid;
  border-color: #ccc #ccc transparent transparent;
  content: "";
  transform: rotateZ(135deg);
  transform-origin: 50% 50% 0;
  transition: transform ease 300ms;
}
.extend_handle:hover::before { border-color: #333 #333 transparent transparent; }
.extend .extend_handle::before { transform: rotateZ(-45deg); }

.extend::after {
  position: absolute;
  left: 50%;
  bottom: $border-top-height;
  height: $border-top-height; // 上边框高度
  border-left: 2px solid #ccc;
  content: "";
  transform: translate3d(-1px, 0, 0);
}
.childLevel::before {
  position: absolute;
  left: 50%;
  top: $bottomBorderHeight;
  bottom: 100%;
  height: $border-bottom-height; // 下边框高度
  border-left: 2px solid #ccc;
  content: "";
  transform: translate3d(-1px, 0, 0);
}
.childLevel::after {
  position: absolute;
  left: 0;
  right: 0;
  top: $border-center;
  border-top: 2px solid #ccc;
  content: "";
}
.childLevel:first-child::before,
.childLevel:last-child::before {
  display: none;
}
// 左弧度
.childLevel:first-child::after {
  left: calc(50% - 1px);
  box-sizing: border-box;
  height: $border-bottom-height;
  border: 2px solid;
  border-color: #ccc transparent transparent #ccc;
  border-right: none;
  border-radius: $lrRadius 0 0 0;
  transform: translate3d(0, 0, 0);
}
// 右弧度
.childLevel:last-child::after {
  right: calc(50% - 1px);
  box-sizing: border-box;
  height: $border-bottom-height;
  border: 2px solid;
  border-color: #ccc #ccc transparent transparent;
  border-left: none;
  border-radius: 0 $lrRadius 0 0;
  transform: translate3d(0, 0, 0);
}
.childLevel:first-child.childLevel:last-child::after {
  left: auto;
  border-color: transparent #ccc transparent transparent;
  border-radius: 0;
  transform: translate3d(1px, 0, 0);
}
.node {
  box-sizing: border-box;
  margin: 0 $nodeLRMargins; // 节点左右边距
  text-align: center;
  .person {
    display: inline-block;
    overflow: hidden;
    width: 100%;
    .avat {
      display: block;
      overflow: hidden;
      box-sizing: border-box;
      width: auto;
      min-width: 72px;
      height: auto;
      min-height: 24px;
      margin: auto;
      background: var(--theme-card);
    }
    .name {
      overflow: hidden;
      width: 100%;
      height: 2em;
      line-height: 2em;
    }
  }
}
.childLevel .person {
  &::after {
    display: block;
    position: absolute;
    left: 50%;
    top: -3px;
    box-sizing: border-box;
    width: 10px;
    height: 10px;
    border: 5px solid;
    border-color: #ccc transparent transparent;
    content: "";
    transform: translateX(-50%);
  }
}

/* 横板 */
.landscape {
  margin-left: 32px;
  transform: translate(-100%, 0) rotate(-90deg);
  transform-origin: 100% 0;
  .node {
    display: inline-block;
    text-align: left;
  }
  .person {
    transform: rotate(90deg);
    .avat {
      width: 72px;
      height: 72px;
    }
  }
  .childLevel .person {
    &::after {
      left: 0;
      top: 50%;
      transform: translate(0, -50%) rotate(270deg);
    }
  }
}
</style>
