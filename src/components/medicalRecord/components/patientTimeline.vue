<template>
  <el-scrollbar class="timeline-container" id="timeline-container" ref="timeline" @scroll="scrollTop" style="width: 100%;">
    <!-- <div class="timeline-container"> -->
    <template v-if="listClone.length > 0">
      <div class="timeaxis">

        <div v-for="(item,i) in listClone" :key="i" class="blue">
          <div class="timeaxis-box" :style="{width: listClone.length === (i+1)?'100px':'' }" >
            <div class="timeaxis-topText" :style="{borderColor: item.data_list ? item.iconColor:''}">
              <span class="btn-triangle" v-if="!item?.hidden" :class="{center:item?.center}"></span>
              <div class="text-time" v-if="!item?.hidden" :class="{center:item?.center}">
                <span class="time">{{item.title}}</span>
                <div class="elipsisHos" v-show-tip>
                  <el-tooltip class="box-item" effect="dark" :content="item.hospitalName" placement="top">
                    {{item.hospitalName}}
                  </el-tooltip>
                </div>
                <span class="time">{{i % 2 == 0 ?item.enterHospitalTime?.substring(0, 10) : item.exitHospitalTime?.substring(0, 10)}}</span>
              </div>
            </div>
            <div class="circular" :style="{background:item.iconColor}" v-if="!item?.hidden" :class="{center:item?.center}"></div>
            <div class="timeaxis-bootomText">
              <!-- <span class="top-triangle"></span> -->
              <div class="text-list" v-show-tip v-if="i % 2 == 0" :style="{background:item.background}">
                <el-scrollbar v-show-tip>
                  <!-- <div class="timeitem" >就诊医院：{{ item.hospitalName }}</div> -->
                  <!-- 门急诊or住院 -->
                  <template v-if="[1,2].includes(item.medicalRecordType)">
                    <el-tooltip class="box-item" effect="dark" :content="item.mainDiagnosis" placement="top" :disabled="!item.mainDiagnosis">
                      <div class="timeitem elipsis mb8" :title="item.mainDiagnosis">主要诊断：{{ item?.mainDiagnosis || '-' }}</div>
                    </el-tooltip>
                    <!-- <div class="timeitem" v-if="item.medicalRecordType !== 2">是否死亡：{{ item.dead ? '是' : '否' }}</div> -->
                  </template>
                  <!-- 体检 -->
                  <template v-else-if="item.medicalRecordType === 3">
                    <div class="timeitem" >体检类型：{{ item?.physicalType || '-' }}</div>
                  </template>
                  <!-- <div class="timeitem">
                    {{ item.medicalRecordType !== 2 ? '就医类型：':'就诊类型：' }}{{ medicalMenu?.[item.medicalRecordType] || '-' }}
                  </div> -->
                  <div class="timeitem" v-if="item.medicalRecordType !== 3">
                    <el-tooltip class="box-item" effect="dark" :content="item.chiefComplaint" placement="top" :disabled="!item.chiefComplaint">
                      <div class="timeitem elipsis" :title="item.mainDiagnosis">主诉：{{ item?.chiefComplaint || '-' }}</div>
                    </el-tooltip>
                  </div>
                </el-scrollbar>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span class="right-triangle" v-if="isScroll"></span>
    </template>
    <template v-else>
      <div class="empty">
        <p>这里还没有内容</p>
      </div>
    </template>
  <!-- </div> -->
  </el-scrollbar>
</template>
<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
const colorList = ['var(--el-color-primary)', '#04A273', '#F59F0C']
const backgroundList = ['#EAF0FE', '#E5F5F1', '#FDF5E6']

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

// const medicalMenu = {
//   1: '住院',
//   2: '门急诊',
//   3: '体检'
// }

const toChinesNum = (num) => {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const chineseUnits = ['', '十', '百', '千']
  if (num === 0) {
    return chineseNums[0]
  }
  let chineseStr = ''
  let unitIndex = 0
  while (num > 0) {
    const digit = num % 10
    if (digit !== 0) {
      // 处理非零数字
      chineseStr = chineseNums[digit] + chineseUnits[unitIndex] + chineseStr
    } else if (chineseStr.charAt(0) !== chineseNums[0]) {
      // 处理连续的零，只保留一个零
      chineseStr = '' + chineseStr
    }
    num = Math.floor(num / 10)
    unitIndex++
  }
  return chineseStr
}
const listClone = computed(() => {
  const arrt = []
  let num = 1
  props.data.forEach((item, index) => {
    item.iconColor = colorList[index % 3]
    item.background = backgroundList[index % 3]
    const row1 = { ...item }
    const row2 = { ...item }
    if (item.medicalRecordType === 2) {
      row1.title = '门急诊'
      row1.center = true
      row2.title = '门急诊'
      row2.hidden = true
    } else if (item.medicalRecordType === 3) {
      row1.title = '体检'
      row1.center = true
      row2.title = '体检'
      row2.hidden = true
    } else {
      row1.title = num === 1 ? '首次入院' : `第${toChinesNum(num)}次入院`
      row2.title = num === 1 ? '首次出院' : `第${toChinesNum(num)}次出院`
      num++
    }
    arrt.push(row1, row2)
  })
  return arrt
})
const timeline = ref(null)
const isScroll = ref(false)

const scrollTop = (val) => {
  const { scrollLeft } = val
  const { clientWidth, scrollWidth } = timeline.value.wrapRef
  isScroll.value = (clientWidth + scrollLeft !== scrollWidth)
}

watch(() => listClone.value, () => {
  nextTick(() => {
    scrollTop({ scrollLeft: 0 })
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scrollTop)
})

defineExpose({
  isScroll
})

</script>
<style lang="scss" scoped>
.timeline-container {
  display: flex;
  overflow-x: auto;
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--theme-primary-soft);
  :deep(.el-scrollbar__wrap) {
    width: 100%;
  }
  .timeaxis {
    display: flex;
    box-sizing: border-box;
    margin-left: 76px;
    margin-top: 102px;
    .timeaxis-box {
      width: 264px;
      .circular {
        overflow: hidden;
        position: relative;
        left: -4px;
        top: -10px;
        width: 16px;
        height: 16px;
        border-radius: 8px;
        background: #35c7cb;
        &.center {
          left: 128px;
        }
      }
      .timeaxis-topText {
        position: relative;
        box-sizing: border-box;
        border-bottom: 2px solid #f2f2f2;
        .btn-triangle {
          position: absolute;
          left: 3px;
          top: -28px;
          height: 24px;
          border-right: 1px solid #dbdadb;
          &.center {
            left: 136px;
          }
        }
        .text-time {
          display: flex;
          position: absolute;
          left: -100px;
          top: -100px;
          flex-direction: column;
          width: 200px;
          height: 68px;
          text-align: center;
          span {
            display: block;
            line-height: 20px;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text-2);
          }
          &.center {
            left: 36px;
          }
          .elipsisHos {
            overflow: hidden;
            width: 140px;
            margin: 0 auto;
            -o-text-overflow: ellipsis;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
      .timeaxis-topText:last-child {
        border: none;
      }
      .timeaxis-bootomText {
        position: relative;
        .top-triangle {
          position: absolute;
          left: 5px;
          top: -1px;
          height: 24px;
          border-right: 1px solid #35c7cb;
        }
        .text-list {
          overflow-x: hidden;
          overflow-y: auto;
          position: absolute;
          left: 5px;
          top: -6px;
          box-sizing: border-box;
          width: 264px;
          height: 128px;
          padding: 12px 16px;
          border-radius: 6px;
          background: #e9f9f9;
          .timeitem {
            line-height: 20px;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text);
            white-space: initial;
            &.mb8 {
              margin-bottom: 8px;
            }
          }
          .elipsis {
            display: -webkit-box;
            overflow: hidden;
            -webkit-line-clamp: 2;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
          }
        }
      }
    }
    > div:last-child .timeaxis-topText {
      border: 0;
    }
  }
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: var(--theme-card);
    color: var(--theme-text-2);
  }
  .right-triangle {
    position: absolute;
    right: 0;
    top: 94px;
    width: 0;
    height: 0;
    border-width: 8px 0 8px 16px;
    border-style: solid;
    border-color: transparent transparent transparent var(--el-color-primary);
  }
}
</style>
