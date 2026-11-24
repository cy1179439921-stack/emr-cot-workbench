<template>
  <div class="noPermission">
    <div class="noPermission-content">
      <div class="tips">
        <img :src="noPermission" alt="No Permission">
        <span class="noPermission-text">当前用户账号未授权该平台任何功能、数据权限</span>
        <span class="noPermission-tip">请联系运维人员完成授权操作～</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import noPermission from '@/assets/noPermission.png'
</script>
<style scoped lang="scss">
.noPermission {
  flex: 1;
  box-sizing: border-box;
  padding: 16px;
  background-color: var(--theme-bg)#f0f3f8;

  @include childrenCenter();
  .noPermission-content {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background-color: var(--theme-card);

    @include childrenCenter();
    .tips {
      flex-direction: column;

      @include childrenCenter();
      img {
        width: 214px;
        height: 169px;
      }
      .noPermission-text {
        line-height: 22px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text-2);
      }
      .noPermission-tip {
        line-height: 26px;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-text);
      }
    }
  }
}
</style>
