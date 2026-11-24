<template>
  <div class="rankingContainer">
    <el-scrollbar>
      <div v-for="(item,index) in renderList" :key="index" class="rankingItem">
        <div class="labelContainer">
          <img :src="rankingIcon1" alt="" v-if="index==0" class="rankingIcon">
          <img :src="rankingIcon2" alt="" v-if="index==1" class="rankingIcon">
          <img :src="rankingIcon3" alt="" v-if="index==2" class="rankingIcon">
          <span v-if="index>2" class="rankingIndex">{{ index+1 +'.'}}</span>
          <div class="label">
            {{ item.label||item.name }}
          </div>
          <span class="val">{{ item.value }}</span>
        </div>
        <div class="processContainer">
          <div v-if="totality" :style="{width:(Number(item.value)/Number(totality)*100+'%')}" class="processBar"></div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
<script setup>
import rankingIcon1 from '@/assets/rankingIcon1.png'
import rankingIcon2 from '@/assets/rankingIcon2.png'
import rankingIcon3 from '@/assets/rankingIcon3.png'
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  renderList: {
    type: Array,
    default: () => {
      return []
    }
  },
  totality: {
    type: Number,
    default: 0
  }

})

</script>
<style lang="scss" scoped>
.rankingContainer {
  width: 100%;
  height: 100%;
  .rankingItem {
    &:nth-last-of-type(1) {
      .processContainer {
        margin-bottom: 0;
      }
    }

    .labelContainer {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      .rankingIcon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
      .rankingIndex {
        line-height: 14px;
        font-size: 14px;
        color: var(--theme-text);
      }
      .label {
        flex: 1;
        line-height: 14px;
        font-size: 14px;
        color: var(--theme-text);
      }
      .val {
        margin-right: 4px;
        line-height: 18px;
        font-weight: 500;
        font-size: 18px;
        color: var(--theme-primary);
      }
    }
    .processContainer {
      position: relative;
      width: 100%;
      height: 13px;
      margin-bottom: 20px;
      background: rgba(54, 112, 248, 0.05);
      .processBar {
        position: absolute;
        left: 0;
        height: 100%;
        background-color: var(--theme-primary);
      }
    }
  }
}
</style>
