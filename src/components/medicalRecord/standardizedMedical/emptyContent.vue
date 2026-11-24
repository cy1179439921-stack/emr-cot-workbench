<template>
  <div class="empty-body">
    <div class="emptyContent">
      <div class="emptyImg">
        <img v-if="!loading" class="emptyImg" :src="emptyImg" alt="" />
        <div v-if="loading" class="pixel-spinner">
          <div class="pixel-spinner-inner"></div>
        </div>
        <div class="noData" :class="{ 'loading': loading }">{{loading ? '加载中' : '这里还没有内容'}}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import emptyImg from '@/assets/empty.png'
defineOptions({
  name: 'EmptyContent',
  inheritAttrs: false
})
defineProps({
  title: {
    type: String
  },
  loading: {
    type: Boolean
  }
})
</script>
<style scoped lang="scss">
@use '@/style/common/medicalRecord.scss';
.empty-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  .emptyContent {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    .emptyImg {
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 206px;
        margin-bottom: 14px;
      }
      .pixel-spinner {
        margin-bottom: 14px;
      }
      .noData {
        line-height: 22px;
        font-size: 14px;
        color: var(--theme-text-2);
      }
    }
  }
}
</style>
