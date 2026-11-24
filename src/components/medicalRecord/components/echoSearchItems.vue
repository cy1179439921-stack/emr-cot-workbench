<template>
  <div class="content" ref="content">
    <template v-if="!isNone">
      <template v-for="item in searchItems" :key="item.id">
        <div class="searchItem" v-if="(item.type === 'text'||item.type === 'number'||item.type==='positiveInteger'||!item.type)&&(values[item.value]||values[item.value]===0)">
          <div class="val" >{{ item.label+'：'+values[item.value] }}</div>
        </div>
        <div class="searchItem" v-if="item.type === 'select'&&echoSelect(item.EnumValues, values[item.value])">
          <div
            class="val"
            v-text=" item.label + '：'+echoSelect(item.EnumValues, values[item.value])"
          ></div>
        </div>
        <div class="searchItem" v-if="item.type === 'mulSelect'&&echoMulSelect(item.EnumValues, values[item.value])">
          <div
            class="val"
            v-text="item.label + '：'+echoMulSelect(item.EnumValues, values[item.value])"
          ></div>
        </div>
        <div class="searchItem" v-if="item.type === 'select-v2'&&echoSelectV2(item.EnumValues, values[item.value])">
          <div
            class="val"
            v-text="item.label + '：' +echoSelectV2(item.EnumValues, values[item.value])"
          ></div>
        </div>
        <div class="searchItem" v-if="(item.type === 'datePicker'||item.type === 'daterange')&&echoDatePicker(values[item.value])">
          <div
            class="val"
            v-text="item.label + '：'+echoDatePicker(values[item.value])"
          ></div>
        </div>
        <div class="searchItem" v-if="item.type === 'datetimerange'&&(values[item.value]!==''&&echoDatetimerange(values[item.value]))">
          <div
            class="val"
            v-text="item.label + '：'+echoDatetimerange(values[item.value])"
          ></div>
        </div>
        <div class="searchItem" v-if="item.type === 'relationSelect'&&echoRelation(item)">
          <div class="label" >{{ item.label + '：' }}</div>
          <div class="val" v-text="echoRelation(item)"></div>
        </div>
      </template>
    </template>
    <div class="noneText" v-if="isNone">
      无
    </div>
  </div>
</template>
<script setup name="echoSearchItems">
import { onMounted, ref, watch, nextTick } from 'vue'
const props = defineProps({
  searchItems: {
    type: Array,
    default: () => {
      return []
    }
  },
  values: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const isNone = ref(false)
const content = ref(null)
onMounted(() => {
  // nextTick(() => {
  //   const isEl = hasChildElements(content.value)
  //   isNone.value = !isEl
  // })
})

const hasChildElements = (element) => {
  return element.childElementCount > 0
}
const echoSelect = (EnumValues, value) => {
  let name = ''
  EnumValues.forEach((item) => {
    if (value === item.id) {
      name = item.name
    }
  })
  return name
}
const echoDatePicker = (value) => {
  return value ? value.join('至') : ''
}
const echoDatetimerange = (value) => {
  return value ? value.join('至') : ''
}
const echoRelation = (obj) => {
  let val = ''
  const relationValue = props.values['relationValue-' + obj.id] || props.values.relationValue
  switch (relationValue) {
    case 'gt':
      // 大于
      val = '>' + props.values[obj.value]
      break
    case 'eq':
      // 等于
      val = '=' + props.values[obj.value]
      break
    case 'lt':
      // 小于
      val = '<' + props.values[obj.value]
      break
    case 'between':
      // 介于
      if (props.values[obj.rangeValue].length) {
        val = props.values[obj.rangeValue][0] + '-' + props.values[obj.rangeValue][1]
      }
      break
  }
  return val
}
const echoMulSelect = (EnumValues, value) => {
  let name = ''
  EnumValues.forEach((item) => {
    if (value?.includes(item.id)) {
      name ? (name += ',' + item.name) : (name += item.name)
    }
  })
  return name
}
const echoSelectV2 = (EnumValues, value) => {
  let name = ''
  EnumValues.forEach((item) => {
    if (value?.includes(item.value)) {
      name ? (name += ',' + item.label) : (name += item.label)
    }
  })
  return name
}

watch(() => props.searchItems, () => {
  nextTick(() => {
    const isEl = hasChildElements(content.value)
    isNone.value = !isEl
  })
}, {
  deep: true
})

</script>
<style lang="scss" scoped>
.content {
  display: flex;
  overflow-y: auto;
  flex-wrap: wrap;
  align-content: flex-start;
  flex: 1;
  height: 100%;
  .searchItem {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: auto;
    max-width: 100%;
    min-height: 24px;
    margin-right: 10px;
    margin-bottom: 13px;
    padding: 3px 6px;
    border-radius: 2px;
    background: var(--theme-fill);
    line-height: 18px;
    font-size: 14px;
    color: var(--theme-text-2);
    .val {
      overflow: hidden;
      flex: 1;
      height: auto;
      white-space: normal;
    }
  }
  .noneText {
    box-sizing: border-box;
    width: 34px;
    height: 24px;
    margin-bottom: 16px;
    border-radius: 2px;
    background: var(--theme-fill);
    line-height: 24px !important;
    text-align: center;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
</style>
