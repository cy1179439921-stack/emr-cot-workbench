<template>
  <div class="variable-selection-area">
    <div class="mainTop">
      <div class="topLeft">
        <header class="header">全部变量</header>
      </div>
      <div class="topCenter">
        <transferButton :leftActive="leftActiveObj" :rightActive="rightActiveObj" />
      </div>
      <div class="topRight">
        <div class="right1">
          <header class="header">
            <span>选择变量</span>
            <SvgIcon iconName="icon-shuzi"></SvgIcon>
          </header>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'EmptyMethod',
  inheritAttrs: false
})
import { ref } from 'vue'
import transferButton from '@/components/dataAnalysis/engineeringLibrary/common/transferButton.vue'

const leftActiveObj = ref([])
const rightActiveObj = ref([])

</script>
<style scoped lang="scss">
@use '@/style/common/variableSelection.scss';
</style>
