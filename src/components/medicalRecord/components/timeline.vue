<template>
  <el-scrollbar class="timeline-container" ref="timeline" :wrap-class="id" :min-size="0" @scroll="scrollTop">
    <!-- <div class="timeline-container" > -->
    <div class="timeaxis">
      <div v-for="(item,i) in props.data" :key="i" class="blue">
        <div class="timeaxis-box">
          <div class="timeaxis-topText">
            <!-- <span class="btn-triangle"></span> -->
            <div class="text-time">
              <span class="time">{{item.title}}</span>
              <span class="time">{{item.date}}</span>
            </div>
          </div>
          <div class="circular"></div>
          <div class="timeaxis-bootomText">
            <span class="top-triangle"></span>
            <div class="text-list">
              <el-scrollbar >
                <div v-for="(itemchild ,index) in item.contents || []" :key="index" class="timeitem" >{{itemchild}}</div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>
    </div>
    <span class="right-triangle" v-if="isScroll"></span>

    <!-- </div> -->
  </el-scrollbar>
</template>
<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'

const timeline = ref(null)
const isScroll = ref(false)
const width = ref(0)
const srcoll = ref(0)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  id: {
    type: String,
    default: Math.random().toString()
  }
})

onMounted(() => {
  nextTick(() => {
    const { clientWidth, scrollWidth } = timeline.value.wrapRef
    width.value = clientWidth
    srcoll.value = scrollWidth
    isScroll.value = scrollWidth > clientWidth

    const dom = document.getElementsByClassName(props.id)[0]
    dom.style.height = dom.scrollHeight + 'px'
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scrollTop)
})

const scrollTop = (val) => {
  const { scrollLeft } = val
  isScroll.value = ((width.value + scrollLeft + 1) <= srcoll.value)
}
</script>
<style lang="scss" scoped>
.timeline-container {
  display: flex;
  overflow-x: auto;
  position: relative;
  width: 100%;
  height: auto;
  background: var(--theme-card);
  .timeaxis {
    display: flex;
    margin-left: 100px;
    margin-top: 80px;
    .timeaxis-box {
      width: 256px;
      .circular {
        overflow: hidden;
        position: relative;
        top: -7px;
        width: 12px;
        height: 12px;
        margin-bottom: -6px;
        border-radius: 6px;
        background: #04a273;
        &::before {
          display: none;
        }
      }
      .timeaxis-topText {
        position: relative;
        border-bottom: 2px solid #e9f9f9;
        .btn-triangle {
          position: absolute;
          top: -30px;
          height: 24px;
          border-right: 1px solid #35c7cb;
        }
        .text-time {
          display: flex;
          position: absolute;
          left: -100px;
          top: -50px;
          flex-direction: column;
          width: 200px;
          height: 50px;
          text-align: center;
          span {
            display: block;
            line-height: 20px;
            font-weight: 400;
            font-size: 14px;
            color: #646464;
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
          overflow: hidden;
          position: absolute;
          left: -100px;
          top: 20px;
          box-sizing: border-box;
          width: 200px;
          height: auto;
          padding: 12px 16px;
          border-radius: 6px;
          background: #e5f5f1;
          .timeitem {
            margin: 4px 0;
            border-radius: 2px;
          }
        }
      }
    }
    > div:last-child .timeaxis-topText {
      border: 0;
    }
  }
  .timeitem {
    line-height: 20px;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text);
    white-space: initial;
  }
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: var(--theme-card);
    color: #909399;
  }
  .right-triangle {
    position: absolute;
    right: 0;
    top: 73px;
    width: 0;
    height: 0;
    border-width: 8px 0 8px 16px;
    border-style: solid;
    border-color: transparent transparent transparent #04a273;
  }
}
</style>
