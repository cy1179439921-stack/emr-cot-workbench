<template>
  <h1>标题</h1>
  <div class="text-container">
    <div class="text">
      <span>字号：</span>
      <el-select v-model="styleObj.fontSize" class="input">
        <el-option v-for="item in sizeList" :key="item" :label="item" :value="item" />
      </el-select>
    </div>
    <div class="text">
      <span>字体：</span>
      <el-select v-model="styleObj.fontFamily" class="input">
        <el-option v-for="item in fontList" :key="item" :label="item" :value="item" />
      </el-select>
    </div>
    <div class="font">
      <el-checkbox-group v-model="styleObj.fontStyles" class="styleCombination">
        <el-tooltip class="item" effect="dark" content="加粗" placement="bottom">
          <el-checkbox-button type="text" label="B" name="type"></el-checkbox-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="倾斜" placement="bottom">
          <el-checkbox-button type="text" label="U" name="type" style="font-style: oblique;"></el-checkbox-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="下划线" placement="bottom">
          <el-checkbox-button type="text" label="I" name="type"></el-checkbox-button>
        </el-tooltip>
      </el-checkbox-group>
    </div>
  </div>
</template>
<script setup>
import { onBeforeMount, toRefs, watch, reactive } from 'vue'
const props = defineProps({
  data: {
    type: Object
  }
})

const sizeList = ['12px', '14px', '16px', '18px', '20px', '22px', '24px']
const fontList = ['黑体', '宋体']

const { data } = toRefs(props)

onBeforeMount(() => {
  const { style } = data.value
  if (Object.keys(data.value.style).length !== 0) {
    styleObj.fontSize = style?.fontSize
    styleObj.fontFamily = style?.fontFamily
    if (style?.fontWeight) {
      styleObj.fontStyles.push('B')
    }
    if (style?.textDecoration) {
      styleObj.fontStyles.push('I')
    }
    if (style?.fontStyle) {
      styleObj.fontStyles.push('U')
    }
  }

  watch(() => styleObj, (value) => {
    if (value) {
      const isItBold = value.fontStyles.includes('B') // 是否加粗
      const whetherItIsTilted = value.fontStyles.includes('U') // 是否倾斜
      const whetherUnderline = value.fontStyles.includes('I') // 是否下划线
      data.value.style = {
        fontSize: value.fontSize,
        fontFamily: value.fontFamily,
        fontWeight: isItBold ? 'bold' : undefined,
        textDecoration: whetherUnderline ? 'underline' : undefined,
        fontStyle: whetherItIsTilted ? 'oblique' : undefined
      }
    }
  }, { deep: true })
})

const styleObj = reactive({
  fontSize: '14px',
  fontFamily: '黑体',
  fontStyles: []
})
</script>
<style lang="scss" scoped>
h1 {
  margin-top: 20px;
  margin-bottom: 28px;
  font-weight: 500;
  font-size: 14px;
  color: var(--theme-text);
}
.text-container {
  margin-left: 14px;
}
.text {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  span {
    // font-family: Source Han Sans, Source Han Sans;
    font-weight: 400;
    font-size: 14px;
    color: #646464;
    white-space: nowrap;
  }
}
.font {
  :deep(.styleCombination) {
    span {
      border: 0;
      font-family: AndaleMono;
      font-size: 20px;
      color: #606060;
    }

    label:last-child span {
      text-decoration: underline;
    }

    .el-checkbox-button.is-checked .el-checkbox-button__inner {
      border: 0;
      background-color: var(--theme-card);
      -webkit-box-shadow: none;
      box-shadow: none;
      color: #409eff;
    }
  }
}
</style>
