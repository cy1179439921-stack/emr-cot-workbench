<template>
  <span class="headerAvatar">
    <!-- <template v-if="picType === 'avatar'">
      <el-avatar v-if="userStore.userInfo.headerImg" :size="30" :src="avatar" />
      <el-avatar v-else :size="30" :src="noAvatar" />
    </template>
    <template v-if="picType === 'img'">
      <img v-if="userStore.userInfo.headerImg" :src="avatar" class="avatar">
      <img v-else :src="noAvatar" class="avatar">
    </template> -->
    <template v-if="scene === 'table' && picType === 'file' && fileList.length > 0">
      <el-image
        :style="{height: height}"
        :preview-teleported="true"
        :src="fileList[0]"
        :preview-src-list="fileList"
        fit="cover"/>
    </template>
    <template v-if="!scene && picType === 'file' && fileList.length > 0">
      <el-image v-for="(item, index) in fileList" :key="index"
                :style="{width: width}" style="margin-bottom: 10px;"
                :preview-teleported="true"
                :src="item"
                :initial-index="index"
                :preview-src-list="fileList"
                fit="cover"/>
      <!-- <img :src="item" class="file" v-for="(item,index) in fileList" :key="index"> -->
    </template>
  </span>
</template>

<script>
export default {
  name: 'CustomPic'
}
</script>

<script setup>
import { ref, computed } from 'vue'
// import noAvatarPng from '@/assets/noBody.png'
// import { useUserStore } from '@/pinia/modules/user'

const props = defineProps({
  picType: {
    type: String,
    required: false,
    default: 'avatar'
  },
  picSrc: {
    type: String,
    required: false,
    default: ''
  },
  scene: {
    type: String,
    required: false,
    default: ''
  },
  height: {
    type: String,
    required: false,
    default: '50px'
  },
  width: {
    type: String,
    required: false,
    default: '100%'
  }
})

const path = ref(`${localStorage.getItem('minioIP')}/admin-go/`)
// const noAvatar = ref(noAvatarPng)

// const userStore = useUserStore()

// const avatar = computed(() => {
//   if (props.picSrc === '') {
//     if (userStore.userInfo.headerImg !== '' && userStore.userInfo.headerImg.slice(0, 4) === 'http') {
//       return userStore.userInfo.headerImg
//     }
//     return path.value + userStore.userInfo.headerImg
//   }
//   if (props.picSrc !== '' && props.picSrc.slice(0, 4) === 'http') {
//     return props.picSrc
//   }
//   return path.value + props.picSrc
// })
// const fileList = ref([])
const fileList = computed(() => {
  const arr = props.picSrc.split(',')
  const arr2 = []
  arr.forEach((item) => {
    if (item && item.slice(0, 4) !== 'http') {
      arr2.push(path.value + item)
    }
  })
  return arr2
})

</script>

<style scoped lang="scss">
.headerAvatar {
     display: flex;
    align-items: center;
  flex-direction: column;
  margin-right: 8px;
}
.file {
  width: 80px;
  height: 80px;
  position: relative;
}
</style>
