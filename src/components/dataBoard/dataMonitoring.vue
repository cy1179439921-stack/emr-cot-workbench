<template>
  <div :class="{dataMonitoring:true, darkMode:modeStore.mode==='dark',lightMode:modeStore.mode==='light'} ">
    <el-scrollbar >
      <img :src="Halo1" v-if="modeStore.mode==='dark'" alt="" class="Halo Halo1">
      <img :src="Halo2" v-if=" modeStore.mode==='dark'" alt="" class="Halo Halo2">
      <img :src="Halo3" v-if="modeStore.mode==='dark'" alt="" class="Halo Halo3">
      <CommonTitle
        titleText="慢病监测数据上报情况"
        class="dataDistributionTitile"
        :mode="modeStore.mode"
      >
      </CommonTitle>
      <div class="reportContent">
        <div class="totalityChart conBorder">
          <div class="totalityTitle">
            <div class="title">
              <commonSubTitle text="地区上报排行榜" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="subTitle">
              <div class="pointer"></div>
              <div class="txt">上报总数</div>
            </div>
          </div>
          <div class="chartContainer">
            <common-echarts :option='chartOptions.chartOneOption'>
            </common-echarts>
          </div>
        </div>
        <div class="dataDetail conBorder">
          <commonSubTitle text="数据统计" :mode="modeStore.mode"></commonSubTitle>
          <div class="reportDataContainer">
            <div v-for="(item,index) in dataOptions.reportData" :key="index" class="dataItem">
              <div class="label">{{ item.label }}</div>
              <div class="placeholderDom">
                <div v-if="index===1" v-html="item.formatter()"></div>
              </div>
              <div class="value">{{ addThousandSeparator(overviewData[item.props])}}</div>
              <img class="bgGif" v-if="modeStore.mode==='dark'" :src="bgGif" alt="">
              <img
                v-if="modeStore.mode!=='dark'"
                :src="item.lightIcon"
                :class="{dataIcon:true,today:index===1}"
                alt="">
              <img
                v-if="modeStore.mode==='dark'"
                :src="item.icon"
                :class="{darkDataIcon:true,today:index===1}"
                alt="">
            </div>
          </div>
          <div class="processedContainer">
            <div v-for="(item,index) in dataOptions.processedData" :key="index" class="dataItem">
              <div class="label">{{ item.label }}</div>
              <div class="placeholderDom">
                <div v-if="index===1" v-html="item.formatter()"></div>
              </div>
              <div class="value">{{ addThousandSeparator(overviewData[item.props])}}</div>
              <img class="bgGif" v-if="modeStore.mode==='dark'" :src="bgGif" alt="">
              <img
                v-if="modeStore.mode!=='dark'"
                :src="item.lightIcon"
                :class="{dataIcon:true,today:index===1}"
                alt="">
              <img
                v-if="modeStore.mode==='dark'"
                :src="item.icon"
                :class="{darkDataIcon:true,today:index===1}"
                alt="">
            </div>
          </div>
        </div>
        <div class="tendencyChart conBorder">
          <div class="header">
            <div class="title">
              <commonSubTitle text="地区上报趋势" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="headerLegend">
              <commonLengend :text="reportTitle" :mode="modeStore.mode"></commonLengend>
            </div>
          </div>
          <div class="areaContainer">
            <AreaSelect @updateArea='hanldeArea($event,"chartTwoOption")' :areaList="areaList"></AreaSelect>
          </div>
          <div class="searchContainer">
            <el-form :inline="true" :model="chartTwoOptionSearchObj" class="demo-form-inline" label-width="auto">
              <el-form-item label="医院" :style='{width: `calc(50% - ${pxToRem(8)})`}'>
                <commonMultipleSelect
                  v-model="chartTwoOptionSearchObj.hospitalList"
                  placeholder="全部"
                  :options="(chartTwoOptionSearchObj.hospitalListOptions&&chartTwoOptionSearchObj.hospitalListOptions.length>0?chartTwoOptionSearchObj.hospitalListOptions:allHospitalListOptions)"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper common-multiple-select-popper':'common-multiple-select-popper'"
                  style='width: 100%;'
                  @change="getReportTendencyFn"
                >

                </commonMultipleSelect>
                <!-- <el-select
                  v-model="chartTwoOptionSearchObj.hospitalList"
                  multiple
                  placeholder="全部"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  style='width: 100%;'
                  @change="getReportTendencyFn"
                  collapse-tags
                  collapse-tags-tooltip
                >
                  <el-option
                    v-for="item in (chartTwoOptionSearchObj.hospitalListOptions&&chartTwoOptionSearchObj.hospitalListOptions.length>0?chartTwoOptionSearchObj.hospitalListOptions:allHospitalListOptions)"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select> -->
              </el-form-item>
              <el-form-item label="病种" :style='{width: `calc(50% - ${pxToRem(8)})`, "margin-right": 0}'>
                <CommonMultiSelectWithSearch v-model="chartTwoOptionSearchObj.diseaseList" :options="diseaseList" placeholder="全部" @handleChange="getReportTendencyFn" :popper-class="modeStore.mode==='dark'?'darkModePopper':''" placement="bottom-end"/>
                <!-- <el-select
                  v-model="chartTwoOptionSearchObj.diseaseList"
                  multiple
                  style='width: 100%;'
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  @change="getReportTendencyFn"
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="全部"
                >
                  <el-option
                    v-for="item in diseaseList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select> -->
              </el-form-item>
              <el-form-item label="起止时间" style='width: 100%;'>
                <AllDateSelect
                  :isDefaultTime="true"
                  v-model="chartTwoOptionSearchObj.date"
                  v-model:dateType="chartTwoOptionSearchObj.dateType"
                  @change="getReportTendencyFn"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                ></AllDateSelect>
              </el-form-item>
            </el-form>
          </div>
          <div v-if="isAreaList" class="chartContainer">
            <common-echarts :option='chartOptions.chartTwoOption'>
            </common-echarts>
          </div>
        </div>
      </div>
      <CommonTitle
        titleText="慢病监测大病种趋势监控"
        :mode="modeStore.mode"
      >
      </CommonTitle>
      <div class="chronicDisease">
        <div class="dataAndMapContainer conBorder">
          <div class="mapLeftContainer">
            <div>
              <commonSubTitle text="上报总数" :mode="modeStore.mode"></commonSubTitle>
              <div class="chronicDiseaseItemContainer">
                <div v-for="(item,index) in mapLeftOptions.allData" :key="index" class="chronicDiseaseItem">
                  <div class="value">{{ addThousandSeparator(item.value) }}</div>
                  <div class="label">{{ item.name+'总数' }}</div>
                </div>
              </div>
            </div>
            <div>
              <commonSubTitle text="今日新增总数" :mode="modeStore.mode"></commonSubTitle>
              <div class="chronicDiseaseItemContainer">
                <div v-for="(item,index) in mapLeftOptions.everyData" :key="index" class="chronicDiseaseItem">
                  <div class="value">{{ addThousandSeparator(item.value) }}</div>
                  <div class="label">{{ item.name}}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="chronicDiseaseMapContainer">
            <div class="mapContainer">
              <MAP :mapData="majorDiseaseMapData" mapTitle="大病种患者分布地图"></MAP>
            </div>
          </div>
        </div>
        <div class="mapRightContainer">
          <div class="search conBorder">
            <div class="title">
              <commonSubTitle text="大病种患者新增数" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="areaContainer">
              <AreaSelect @updateArea="hanldeArea($event,'everyDayBrokenLineSearchObj')" :areaList="areaList"></AreaSelect>
            </div>
            <div class="searchContainer">
              <el-form :inline="true" :model="everyDayBrokenLineSearchObj" class="demo-form-inline" :label-width="echartsToPx(56)">
                <el-form-item label="医&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;院" style='width: 100%;'>
                  <commonMultipleSelect
                    v-model="everyDayBrokenLineSearchObj.hospitalList"
                    placeholder="全部"
                    :options="(everyDayBrokenLineSearchObj.hospitalListOptions&&everyDayBrokenLineSearchObj.hospitalListOptions.length>0?everyDayBrokenLineSearchObj.hospitalListOptions:allHospitalListOptions)"
                    :popper-class="modeStore.mode==='dark'?'darkModePopper common-multiple-select-popper':'common-multiple-select-popper'"
                    style='width: 100%;'
                    @change="getEveryDayBrokenLineFn"
                  >
                  </commonMultipleSelect>
                  <!-- <el-select
                    v-model="everyDayBrokenLineSearchObj.hospitalList"
                    multiple
                    :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                    @change="getEveryDayBrokenLineFn"
                    style='width: 100%;'
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="全部"
                  >
                    <el-option
                      v-for="item in (everyDayBrokenLineSearchObj.hospitalListOptions&&everyDayBrokenLineSearchObj.hospitalListOptions.length>0?everyDayBrokenLineSearchObj.hospitalListOptions:allHospitalListOptions)"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select> -->
                </el-form-item>

                <el-form-item label="起止时间" :style='{width: "100%", "margin-top": pxToRem(18)}'>
                  <AllDateSelect
                    :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                    :isDefaultTime="true"
                    v-model="everyDayBrokenLineSearchObj.date"
                    v-model:dateType="everyDayBrokenLineSearchObj.dateType"
                    @change="getEveryDayBrokenLineFn"
                  ></AllDateSelect>
                </el-form-item>
              </el-form>
            </div>
            <div class="chartContainer" v-if="isAreaList">
              <common-echarts :option='chartOptions.chartThreeOption'>
              </common-echarts>
            </div>
          </div>
          <div class="showContent">
            <div class="chartContainer conBorder">
              <div class="title">
                <commonSubTitle text="大病种患者总数占比" :mode="modeStore.mode"></commonSubTitle>
              </div>
              <div class="chartF">
                <common-echarts :option='chartOptions.chartFourOption'>
                </common-echarts>
              </div>
            </div>
            <div class="chartContainer conBorder">
              <div class="title">
                <commonSubTitle text="大病种患者所在地区占比" :mode="modeStore.mode"></commonSubTitle>
              </div>
              <div class="chartF">
                <common-echarts :option='chartOptions.chartFiveOption'>
                </common-echarts>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommonTitle
        titleText="慢病监测小病种趋势监控"
        :mode="modeStore.mode"
      >
      </CommonTitle>
      <div class='minorDisease '>
        <div class="search conBorder">
          <div class="areaContainer">
            <AreaSelect :isAll="true" @updateArea="hanldeArea($event,'minorDiseaseSearchObj')" :areaList="areaList"></AreaSelect>
          </div>
          <div class="searchContainer">
            <el-form :inline="true" :model="minorDiseaseSearchObj" class="demo-form-inline" label-width="auto">
              <el-form-item label="起止时间" :style='{width: pxToRem(400)}'>
                <AllDateSelect
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  :isDefaultTime="true"
                  v-model="minorDiseaseSearchObj.date"
                  v-model:dateType="minorDiseaseSearchObj.dateType"
                  @change="getminorDiseaseFn"
                ></AllDateSelect>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="allCharts allCharts1">
          <div class="chartContainer conBorder" >
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartSixOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartSixOption'>
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartSevenOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartSevenOption'>
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartEightOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartEightOption'>
              </common-echarts>
            </div>
          </div>
        </div>
      </div>
      <CommonTitle
        titleText="慢病患者基本信息分布情况"
        :mode="modeStore.mode"
      >
      </CommonTitle>
      <div class='minorDisease basicInfContainer'>
        <div class="search conBorder">
          <div class="areaContainer">
            <AreaSelect :isAll="true" @updateArea="hanldeArea($event,'basicInfoSearchObj')" :areaList="areaList"></AreaSelect>
          </div>
          <div class="searchContainer">
            <el-form
              :model="basicInfoSearchObj"
              class="demo-form-inline"
              style="display: flex; align-items: center; width: auto;"
              label-width="auto">
              <el-form-item label="医院类型" :style='{width: pxToRem(360)}'>
                <commonMultipleSelect
                  v-model="basicInfoSearchObj.agencyType"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper common-multiple-select-popper':'common-multiple-select-popper'"
                  @change="getBasicInfoFn"
                  style='width: 100%;'
                  placeholder="全部"
                  :options="[{
                    label:'二级医院',
                    value:'二级'
                  },{
                    label:'三级医院',
                    value:'三级'
                  }]"
                >

                </commonMultipleSelect>
                <!-- <el-select
                  v-model="basicInfoSearchObj.agencyType"
                  multiple
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  @change="getBasicInfoFn"
                  style='width: 100%;'
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="全部"
                >
                  <el-option
                    label="二级医院"
                    value="二级"
                  />
                  <el-option
                    label="三级医院"
                    value="三级"
                  />
                </el-select> -->
              </el-form-item>
              <el-form-item label="病种" :style='{width: pxToRem(360)}'>
                <CommonMultiSelectWithSearch
                  v-model="basicInfoSearchObj.diseaseList"
                  :options="diseaseList"
                  style='width: 100%;'
                  placeholder="全部"
                  @handleChange="getBasicInfoFn"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  placement="bottom-end"/>

              </el-form-item>
              <el-form-item label="起止时间" :style='{width: pxToRem(400)}'>
                <AllDateSelect
                  :isDefaultTime="true"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  v-model="basicInfoSearchObj.date"
                  v-model:dateType="basicInfoSearchObj.dateType"
                  @change="getBasicInfoFn"
                ></AllDateSelect>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="allCharts" v-if="isAreaList">
          <div class="chartContainer conBorder">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartNineOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
              <div class="lineLengend">
                <div class="pointer"></div>
                <div class="txt">患者数量</div>
              </div>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartNineOption'>
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartTenOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartTenOption'>
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartElevenOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartElevenOption'>
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder" v-if="theThirdPhase">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartSixteenOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartSixteenOption' :needResize="true">
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder" v-if='theThirdPhase'>
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartSeventeenOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartSeventeenOption' :needResize="true">
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder" v-if='theThirdPhase'>
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartEighteenOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartEighteenOption' :needResize="true">
              </common-echarts>
            </div>
          </div>
        </div>
      </div>
      <CommonTitle
        titleText="慢病患者共病分布情况"
        :mode="modeStore.mode"
      >
      </CommonTitle>
      <div class='minorDisease basicInfContainer'>
        <div class="search conBorder">
          <div class="areaContainer">
            <AreaSelect :isAll="true" @updateArea="hanldeArea($event,'commonSearchObj')" :areaList="areaList"></AreaSelect>
          </div>
          <div class="searchContainer">
            <el-form
              :model="tendencyChartSearch"
              class="demo-form-inline"
              style="display: flex; align-items: center; width: auto;"
              label-width="auto">
              <el-form-item label="医院类型" :style='{width: pxToRem(300)}'>
                <commonMultipleSelect
                  v-model="basicInfoSearchObj.agencyType"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper common-multiple-select-popper':'common-multiple-select-popper'"
                  @change="getBasicInfoFn"
                  style='width: 100%;'
                  placeholder="全部"
                  :options="[{
                    label:'二级医院',
                    value:'二级'
                  },{
                    label:'三级医院',
                    value:'三级'
                  }]"
                />
                <!-- <el-select
                  v-model="commonSearchObj.agencyType"
                  multiple
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  style='width: 100%;'
                  @change="getCommonDataFn"
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="全部"
                >
                  <el-option
                    label="二级医院"
                    value="二级"
                  />
                  <el-option
                    label="三级医院"
                    value="三级"
                  />
                </el-select> -->
              </el-form-item>
              <el-form-item label="共病病种" :style='{width: pxToRem(360)}'>
                <CommonMultiSelectWithSearch
                  v-model="commonSearchObj.diseaseList"
                  :options="diseaseList"
                  style='width: 100%;'
                  placeholder="请选择一项"
                  @handleChange="getCommonDataFn"
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  placement="bottom-end"/>
              </el-form-item>
              <el-form-item label="起止时间" :style='{width: pxToRem(400)}'>
                <AllDateSelect
                  :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                  :isDefaultTime="true"
                  v-model="commonSearchObj.date"
                  v-model:dateType="commonSearchObj.dateType"
                  @change="getCommonDataFn"
                ></AllDateSelect>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="allCharts" v-if="isAreaList">
          <div class="chartContainer conBorder">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartTwelveOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
              <div class="lineLengend">
                <div class="pointer"></div>
                <div class="txt">患者数量</div>
              </div>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartTwelveOption'>
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartThirteenOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartThirteenOption'>
              </common-echarts>
            </div>
          </div>
          <div class="chartContainer conBorder">
            <div class="titleContaienr">
              <commonSubTitle :text="chartConfigs.chartFourteenOption.titleTxt" :mode="modeStore.mode"></commonSubTitle>
            </div>
            <div class="chartF">
              <common-echarts :option='chartOptions.chartFourteenOption'>
              </common-echarts>
            </div>
          </div>
        </div>
      </div>
      <CommonTitle
        titleText="慢病患者复发及死因汇总"
        :mode="modeStore.mode"
      >
      </CommonTitle>
      <div class='chronicDiseaseCollect'>
        <div class="chartItem conBorder">
          <commonSubTitle text="复发时长" :mode="modeStore.mode"></commonSubTitle>
          <div class="search">
            <div class="areaContainer">
              <AreaSelect @updateArea="hanldeArea($event,'recurSearchObj')" :areaList="areaList"></AreaSelect>
            </div>
            <div class="searchContainer">
              <el-form
                :model="recurSearchObj"
                class="demo-form-inline"
                style="display: flex; align-items: center; width: auto;"
                label-width="auto">
                <el-form-item label="先因病种" :style='{width: pxToRem(273),marginRight:pxToRem(21)}'>
                  <CommonMultiSelectWithSearch
                    v-model="recurSearchObj.causeFirst"
                    :options="diseaseList"
                    style='width: 100%;'
                    :multiple="false"
                    class="sigleSelect"
                    placeholder="请选择一项"
                    @handleChange="handelRecurSearch('causeLater')"
                    :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                    placement="bottom-end"/>
                </el-form-item>
                <el-form-item label="后因病种" :style='{width: pxToRem(273)}'>
                  <CommonMultiSelectWithSearch
                    v-model="recurSearchObj.causeLater"
                    :options="diseaseList"
                    style='width: 100%;'
                    :multiple="false"
                    class="sigleSelect"
                    placeholder="请选择一项"
                    @handleChange="handelRecurSearch('causeLater')"
                    :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                    placement="bottom-end"/>
                </el-form-item>
              </el-form>
            </div>
          </div>
          <div v-if="isAreaList" class="chartContainer">
            <common-echarts :option='chartOptions.chartFifteenOption'>
            </common-echarts>
          </div>
        </div>
        <div class="chartItem conBorder" v-if='theThirdPhase'>
          <commonSubTitle text="住院次数" :mode="modeStore.mode"></commonSubTitle>
          <div class="search">
            <div class="areaContainer">
              <AreaSelect @updateArea="hanldeArea($event,'hospitalizationsSearchObj')" :areaList="areaList"></AreaSelect>
            </div>
            <div class="searchContainer">
              <el-form
                :model="hospitalizationsSearchObj"
                class="demo-form-inline"
                style="display: flex; align-items: center; width: auto;"
                label-width="auto">
                <el-form-item label="病种" style='width: 100%;'>
                  <CommonMultiSelectWithSearch
                    v-model="hospitalizationsSearchObj.diseaseList"
                    :options="diseaseList"
                    style='width: 100%;'
                    class="sigleSelect"
                    placeholder="全部"
                    @handleChange="hospitalizationsSearch('causeLater')"
                    :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                    placement="bottom-end"/>
                </el-form-item>
              </el-form>
            </div>
          </div>
          <div class="chartContainer">
            <common-echarts :option='chartOptions.chartNineteenOption'>
            </common-echarts>
          </div>
        </div>
        <div class="chartItem conBorder" v-if='theThirdPhase'>
          <commonSubTitle text="死因分布" :mode="modeStore.mode"></commonSubTitle>
          <div class="search">
            <div class="areaContainer">
              <AreaSelect @updateArea="hanldeArea($event,'deathCausesObj')" :areaList="areaList"></AreaSelect>
            </div>
            <div class="searchContainer">
              <el-form
                :model="deathCausesObj"
                class="demo-form-inline deathForm"
                style="display: flex; align-items: center; width: auto;"
                label-width="auto">
                <el-form-item label="病种" style='width: 100%;'>
                  <CommonMultiSelectWithSearch
                    v-model="deathCausesObj.diseaseList"
                    :options="diseaseList"
                    style='width: 100%;'
                    class="sigleSelect"
                    placeholder="全部"
                    @handleChange="deathCausesObjSearch('causeLater')"
                    :popper-class="modeStore.mode==='dark'?'darkModePopper':''"
                    placement="bottom-end"/>
                </el-form-item>
              </el-form>
            </div>
          </div>
          <div class="chartContainer">
            <common-echarts :option='chartOptions.chartTwentyOption'>
            </common-echarts>
          </div>
        </div>
      </div>
    </el-scrollbar>

  </div>
</template>
<script setup name="dataMonitoring">
import { reactive, ref, watch, onMounted, markRaw, onBeforeUnmount } from 'vue'
import { formatStandardDate, filterZero, addThousandSeparator } from '@/utils/utils.js'
import lodash from 'lodash'
import * as echarts from 'echarts'
import { darkBasicOption, lightBasicOption } from '@/components/dataBoard/chartsConfig.js'
import AreaSelect from '@/components/dataBoard/components/areaSelect.vue'
import MAP from '@/components/dataBoard/components/map.vue'
import CommonMultiSelectWithSearch from '@/components/common/commonMultiSelectWithSearch.vue'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
import {
  getReportedTotal,
  getOverviewData,
  getReportTendency,
  getAreaList,
  getHospitalsByArea,
  getDiseaseList,
  getRecurData,
  getCommonData,
  getBasicInfo,
  getminorDisease,
  getEveryDayBrokenLine,
  getEveryDayPieData,
  getMajorDiseaseEveryDayData,
  getMajorDiseaseMapData,
  getEnterHospitalNum,
  getDeathCause
} from '@/api/api_dataMonitor.js'
import { ElMessage } from 'element-plus'
import { useModeStore } from '@/store/modeStore'
import { echartsToPx, debounce } from '@/utils/utils'
import handleIcon2 from '@/assets/handleIcon2.png'
import darkHandleIcon from '@/assets/darkHandleIcon.png'
import Halo1 from '@/assets/Halo1.png'
import Halo2 from '@/assets/Halo2.png'
import Halo3 from '@/assets/Halo3.png'
import bgGif from '@/assets/bgGif.gif'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const modeStore = useModeStore()

watch(() => modeStore.mode, () => {
  handleChartTheme()
})
onMounted(async() => {
  getDefaultTime()
  getAreaListFn()
  await getDiseaseListFn()
  getHospitalsByAreaFn('', true)
  getDefaultData()
})
const theThirdPhase = ref(true)
const getDefaultTime = (type) => {
  if (type === 'month' || type === 'monthrange') {
    const end = new Date()
    end.setDate(1) // Force to 1st of month
    const start = new Date(end)
    // 默认近12个月
    start.setMonth(end.getMonth() - 11)

    return [formatStandardDate(start), formatStandardDate(end)]
  } else if (type === 'year' || type === 'yearrange') {
    const year = new Date().getFullYear()
    return [year - 6, year]
  } else {
    const end = new Date()
    const start = new Date().getTime() - 3600 * 1000 * 24 * 6
    return [formatStandardDate(start), formatStandardDate(end)]
  }
}

const dataOptions = ref({
  reportData: [
    {
      label: '历史已上报病案总数',
      props: 'reportTotalNum',
      // icon: new URL('@/assets/timeIcon.png', import.meta.url).href,
      icon: new URL('@/assets/testtimeIcon.png', import.meta.url).href,
      lightIcon: new URL('@/assets/lightTimeIcon1.png', import.meta.url).href
    },
    {
      label: '今日已上报病案总数',
      props: 'currentDayReportTotalNum',
      icon: new URL('@/assets/todayIcon3.png', import.meta.url).href,
      lightIcon: new URL('@/assets/lightTodayIcon1.png', import.meta.url).href,
      formatter: (row) => {
        const num1 = lodash.get(overviewData.value, 'currentDayReportTotalNum') - 0
        const num2 = lodash.get(overviewData.value, 'preDayReportTotalNum') - 0

        let className = num1 > num2 ? 'up' : num1 < num2 ? 'down' : 'none'
        let num = 0
        const obj = {
          down: new URL('/src/assets/downIcon2.png', import.meta.url).href,
          up: new URL('/src/assets/upIcon2.png', import.meta.url).href,
          none: ''
        }
        let icon = obj[className]
        if (!num2) {
          num = '-'
          className = ''
          icon = ''
        } else {
          num = (Math.abs((num1 - num2) / num2) * 100).toFixed(1) + '%'
        }

        if (className && className !== 'none') {
          return `
                <span class='${className}'>较昨日：${num}</span>
                <img src='${icon}' class='chainRatioIcon'/>
              `
        } else {
          return `<span class='none'>较昨日：- - </span>`
        }
      }
    }
  ],
  processedData: [
    {
      label: '历史已处理病案总数',
      props: 'standardTotalNum',
      // icon: new URL('@/assets/timeIcon.png', import.meta.url).href,
      icon: new URL('@/assets/testtimeIcon.png', import.meta.url).href,
      lightIcon: new URL('@/assets/lightTimeIcon2.png', import.meta.url).href
    },
    {
      label: '今日已处理病案总数',
      props: 'currentDayStandardTotalNum',
      icon: new URL('@/assets/todayIcon3.png', import.meta.url).href,
      lightIcon: new URL('@/assets/lightTodyIcon2.png', import.meta.url).href,
      formatter: (row) => {
        const num1 = lodash.get(overviewData.value, 'currentDayStandardTotalNum') - 0
        const num2 = lodash.get(overviewData.value, 'preDayStandardTotalNum') - 0
        let className = num1 > num2 ? 'up' : num1 < num2 ? 'down' : 'none'
        let num = 0
        const obj = {
          down: new URL('/src/assets/downIcon2.png', import.meta.url).href,
          up: new URL('/src/assets/upIcon2.png', import.meta.url).href,
          none: ''
        }
        let icon = obj[className]
        if (!num2) {
          num = '-'
          className = ''
          icon = ''
        } else {
          num = (Math.abs((num1 - num2) / num2) * 100).toFixed(1) + '%'
        }

        if (className && className !== 'none') {
          return `
                <span class='${className}'>较昨日：${num}</span>
                <img src='${icon}' class='chainRatioIcon'/>
              `
        } else {
          return `<span class='none'>较昨日：- - </span>`
        }
      }
    }
  ]
})
const areaList = ref([])
const isAreaList = ref(false)
const getAreaListFn = () => {
  getAreaList({}).then(res => {
    const arr = lodash.get(res, 'data') || []
    areaList.value = [{
      name: '全部',
      id: ''
    }].concat(arr)
    isAreaList.value = true
  })
}
const titleColor = ref('#fff')
// color: #1A1A1A;
const reportTitle = ref('月上报数')
const tendencyChartSearch = ref({
  val1: '',
  val2: ''
})
// eslint-disable-next-line no-unused-vars
const chartOptions = reactive({})
// eslint-disable-next-line no-unused-vars
const chartConfigs = reactive({
  chartOneOption: {
    prop: 'horizontalBarChartBasicOption',
    lightColor: ['#6694FF'],
    darkColor: ['#6694FF'],
    legend: {
      show: false
    }
  },
  chartTwoOption: {
    prop: 'barAndLineChartBasicOption',
    legend: {
      show: false
    }
  },
  chartThreeOption: {
    prop: 'linesChartsOption',
    lightColor: ['#3670F8', '#04A273', '#FAC858'],
    darkColor: ['#3670F8', '#04A273', '#FAC858']
    // titleTxt: '大病种患者新增数'
  },
  chartFourOption: {
    prop: 'pieChartOption2',
    lightColor: ['#3670F8', '#04A273', '#FAC858'],
    darkColor: ['#3670F8', '#04A273', '#FAC858']
    // titleTxt: '大病种患者总数占比'
  },
  chartFiveOption: {
    prop: 'pieChartOption2',
    lightColor: ['#9EB5EB', '#3670F8', '#91CC75', '#04A273', '#68A400', '#FAC858', '#8A33C4', '#FF4E4E'],
    darkColor: ['#9EB5EB', '#3670F8', '#91CC75', '#04A273', '#68A400', '#FAC858', '#8A33C4', '#FF4E4E']
    // titleTxt: '大病种患者所在地区占比'
  },
  chartSixOption: {
    prop: 'linesChartsOption',
    titleTxt: '心脑血管疾病新增'
  },
  chartSevenOption: {
    prop: 'linesChartsOption',
    titleTxt: '恶性肿瘤新增'
  },
  chartEightOption: {
    prop: 'linesChartsOption',
    lightColor: ['#3670F8'],
    darkColor: ['#FAC858'],
    lightAreaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: '#C7D8FF'
        },
        {
          offset: 1,
          color: '#F9FCFF'
        }
      ])
    },
    darkAreaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: 'rgba(250, 200, 88, 0.6)'
        },
        {
          offset: 1,
          color: 'rgba(250, 200, 88, 0)'
        }
      ])
    },
    titleTxt: '呼吸系统疾病新增'
  },
  chartNineOption: {
    prop: 'verticalBarChartBasicOption2',
    titleTxt: '年龄分布',
    lightColor: ['#FAC858'],
    darkColor: ['#FAC858'],
    isDataZoom: true
  },
  chartTenOption: {
    prop: 'pieChartOption2',
    titleTxt: '性别分布',
    lightColor: ['#FAC858', '#04A273'],
    darkColor: ['#FAC858', '#04A273']
  },
  chartElevenOption: {
    prop: 'pieChartOption2',
    titleTxt: '职业分布',
    lightColor: ['#FAC858', '#FF4E4E', '#3670F8', '#04A273'],
    darkColor: ['#FAC858', '#FF4E4E', '#3670F8', '#04A273']
  },
  chartTwelveOption: {
    prop: 'verticalBarChartBasicOption2',
    titleTxt: '年龄分布',
    lightColor: ['#FAC858'],
    darkColor: ['#FAC858'],
    isDataZoom: true
  },
  chartThirteenOption: {
    prop: 'pieChartOption2',
    titleTxt: '性别分布',
    lightColor: ['#FAC858', '#04A273'],
    darkColor: ['#FAC858', '#04A273']
  },
  chartFourteenOption: {
    prop: 'pieChartOption2',
    titleTxt: '职业分布',
    lightColor: ['#FAC858', '#FF4E4E', '#3670F8', '#04A273'],
    darkColor: ['#FAC858', '#FF4E4E', '#3670F8', '#04A273']
  },
  chartFifteenOption: {
    prop: 'PolarOption'
    // titleTxt: '慢病住院患者复发'
  },
  chartSixteenOption: {
    prop: 'pieChartOption2',
    titleTxt: '手术类型分布'
  },
  chartSeventeenOption: {
    prop: 'pieChartOption2',
    titleTxt: '实验室检查分布'
  },
  chartEighteenOption: {
    prop: 'pieChartOption2',
    titleTxt: '影像检查分布'
  },
  chartNineteenOption: {
    prop: 'verticalBarChartBasicOption2',
    lightColor: ['#04A273'],
    darkColor: ['#04A273']
    // titleTxt: '住院次数'
  },
  chartTwentyOption: {
    prop: 'pieChartOption2'
    // titleTxt: '死亡分布'
  }
})
const handlePie = (key, data) => {
  const configList = modeStore.mode === 'dark' ? darkBasicOption : lightBasicOption
  chartConfigs[key].initData = data
  chartOptions[key] = configList.pieChartOption2(data, chartConfigs[key][modeStore.mode + 'Color'])
  handlePadAngle(chartOptions[key])
}
const handleVerticalBarChart = (key, initData = {}, name) => {
  let dataZoom = ''
  if (chartConfigs[key].isDataZoom) {
    const showNum = 10
    dataZoom = computedBarNum(initData.YData?.length, showNum, 'horizontal', 0)
  }

  const configList = modeStore.mode === 'dark' ? darkBasicOption : lightBasicOption
  chartConfigs[key].initData = initData || {
    XData: [],
    YData: []
  }
  chartOptions[key] = configList.verticalBarChartBasicOption2(initData.XData, initData.YData, name, dataZoom)
  const isAllZero = initData.YData?.every(d => (d - 0) === 0)
  if (isAllZero) {
    chartOptions[key].yAxis.minInterval = null
  } else {
    chartOptions[key].yAxis.minInterval = 1
  }
  chartOptions[key].yAxis.axisLabel.formatter = function(value) {
    if (isAllZero) {
      return value < 1 ? value * 10 : value * 10
    } else {
      return value
    }
  }
  chartOptions[key].color = chartConfigs[key][modeStore.mode + 'Color']
}
// 默认获取所有图表数据的方法
const getDefaultData = () => {
  getReportedTotalFn()
  getOverviewDataFn()
  getReportTendencyFn()
  getEveryDayBrokenLineFn()
  getEveryDayPieDataFn()
  getMajorDiseaseEveryDayDataFn()
  getMajorDiseaseMapDataFn()
  getminorDiseaseFn()
  getBasicInfoFn('', true)
  getCommonDataFn('', true)
  handelRecurSearch('', true)
  if (theThirdPhase.value) {
    hospitalizationsSearch()
    deathCausesObjSearch()
  }
}
// 慢病监测数据上报情况
const getReportedTotalFn = () => {
  const params = {
    // agency: null,
    // city: null,
    // disease: null,
    // date: null
    // agencyType: []
  }
  getReportedTotal(params).then(res => {
    chartOptions.chartOneOption.yAxis.data = lodash.get(res, 'data.x') || []
    chartOptions.chartOneOption.series.data = lodash.get(res, 'data.y') || []
  })
}
const overviewData = ref({
})
const getOverviewDataFn = () => {
  // 获取数据预览
  getOverviewData().then(res => {
    overviewData.value = lodash.get(res, 'data') || {}
  })
}
// const handleyearchange = (val) => {
//   console.log(chartTwoOptionSearchObj.value.date)
//   getReportTendencyFn()
// }

const chartTwoOptionSearchObj = ref({
  date: getDefaultTime('month'),
  dateType: 'monthrange'
})
watch(() => chartTwoOptionSearchObj.value.dateType, (newV) => {
  let text = ''
  switch (newV) {
    case 'yearrange':
      text = '年'
      break

    case 'monthrange':
      text = '月'
      break

    case 'daterange':
      text = '日'
      break
  }
  reportTitle.value = `${text}上报数`
  chartOptions.chartTwoOption.series.name = reportTitle.value
})
const transforParam = (type) => {
  const obj = {
    yearrange: 'year',
    monthrange: 'month',
    daterange: 'day'
  }
  return obj[type]
}
// 地区上报趋势图
const getReportTendencyFn = () => {
  const params = {
    agency: chartTwoOptionSearchObj.value.hospitalList,
    city: chartTwoOptionSearchObj.value.areaList,
    disease: chartTwoOptionSearchObj.value.diseaseList,
    date: chartTwoOptionSearchObj.value.date,
    type: transforParam(chartTwoOptionSearchObj.value.dateType)
    // agencyType: []
  }
  getReportTendency(params).then(res => {
    chartOptions.chartTwoOption.xAxis.data = lodash.get(res, 'data.x') || []
    const data = lodash.get(res, 'data.y') || []
    data.forEach(item => {
      if (item.name === '当日上报数') { // 此处当日上报数文字是后端返的
        chartOptions.chartTwoOption.series.data = lodash.get(item, 'data') || []
        chartOptions.chartTwoOption.series.name = reportTitle.value
      }
    })
  })
}
// 大病种患者每日数据
const getMajorDiseaseEveryDayDataFn = () => {
  getMajorDiseaseEveryDayData({}).then(res => {
    const data = lodash.get(res, 'data') || [{
      name: '心脑血管疾病',
      value: 0
    },
    {
      name: '恶性肿瘤',
      value: 0
    },
    {
      name: '呼吸系统疾病',
      value: 0
    }]
    mapLeftOptions.value.everyData = mapLeftOptions.value.everyData.concat(data)
  })
}
const majorDiseaseMapData = ref([])
// 大病种患者地图数据
const getMajorDiseaseMapDataFn = () => {
  getMajorDiseaseMapData({}).then(res => {
    majorDiseaseMapData.value = lodash.get(res, 'data.agency') || []
    handlePie('chartFiveOption', lodash.get(res, 'data.city') || [])
  })
}
// 大病种患者总数占比
const getEveryDayPieDataFn = () => {
  getEveryDayPieData({}).then(res => {
    const data = lodash.get(res, 'data') || [
      {
        name: '心脑血管疾病',
        value: 0
      },
      {
        name: '恶性肿瘤',
        value: 0
      },
      {
        name: '呼吸系统疾病',
        value: 0
      }
    ]
    mapLeftOptions.value.allData = mapLeftOptions.value.allData.concat(data)
    handlePie('chartFourOption', data)
  })
}
// 大病种患者每日新增折线图
const everyDayBrokenLineSearchObj = ref({
  date: getDefaultTime('month'),
  dateType: 'monthrange'
})
const getEveryDayBrokenLineFn = () => {
  const params = {
    agency: everyDayBrokenLineSearchObj.value.hospitalList,
    city: everyDayBrokenLineSearchObj.value.areaList,
    date: everyDayBrokenLineSearchObj.value.date,
    type: transforParam(everyDayBrokenLineSearchObj.value.dateType)
  }
  getEveryDayBrokenLine(params).then(res => {
    chartOptions.chartThreeOption.xAxis.data = lodash.get(res, 'data.x') || []
    chartOptions.chartThreeOption.series = []
    chartOptions.chartThreeOption.legend.data = []
    const data = lodash.get(res, 'data.y') || []
    data.forEach(item => {
      chartOptions.chartThreeOption.legend.data.push(item.name)
      chartOptions.chartThreeOption.series.push(
        {
          ...item,
          yAxisIndex: 0,
          type: 'line',
          symbolSize: echartsToPx(8),
          smooth: true,
          lineStyle: {
            width: echartsToPx(2)
          }
        })
    })
  })
}
// 小病种趋势图
const minorDiseaseSearchObj = ref({
  date: getDefaultTime('month'),
  dateType: 'monthrange'
})
const getminorDiseaseFn = () => {
  const params = {
    city: lodash.get(minorDiseaseSearchObj.value, 'areaList'),
    date: lodash.get(minorDiseaseSearchObj.value, 'date'),
    type: transforParam(minorDiseaseSearchObj.value.dateType)
  }
  getminorDisease(params).then(res => {
    const data = lodash.get(res, 'data') || []
    data.forEach(item => {
      if (item.diseaseTypeName === '心脑血管疾病') {
        // 心脑血管
        chartOptions.chartSixOption.xAxis.data = item.statisticsChartResult.x
        chartOptions.chartSixOption.series = []
        chartOptions.chartSixOption.legend.data = []
        item.statisticsChartResult.y.forEach(v => {
          chartOptions.chartSixOption.legend.data.push(v.name)
          chartOptions.chartSixOption.series.push({
            ...v,
            yAxisIndex: 0,
            type: 'line',
            symbolSize: echartsToPx(8),
            smooth: true,
            lineStyle: {
              width: echartsToPx(2)
            }
          })
        })
      }
      if (item.diseaseTypeName === '恶性肿瘤') {
        // 恶性肿瘤
        chartOptions.chartSevenOption.xAxis.data = item.statisticsChartResult.x
        chartOptions.chartSevenOption.series = []
        chartOptions.chartSevenOption.legend.data = []
        item.statisticsChartResult.y.forEach(v => {
          chartOptions.chartSevenOption.legend.data.push(v.name)
          chartOptions.chartSevenOption.series.push({
            ...v,
            yAxisIndex: 0,
            type: 'line',
            symbolSize: echartsToPx(8),
            smooth: true,
            lineStyle: {
              width: echartsToPx(2)
            }
          })
        })
      }
      if (item.diseaseTypeName === '呼吸系统疾病') {
        // 呼吸系统
        chartOptions.chartEightOption.xAxis.data = item.statisticsChartResult.x
        chartOptions.chartEightOption.series = []
        chartOptions.chartEightOption.legend.data = []
        chartOptions.chartEightOption.color = chartConfigs.chartEightOption[modeStore.mode + 'Color']
        item.statisticsChartResult.y.forEach(v => {
          chartOptions.chartEightOption.legend.data.push(v.name)
          chartOptions.chartEightOption.series.push({
            ...v,
            yAxisIndex: 0,
            type: 'line',
            symbolSize: echartsToPx(8),
            smooth: true,
            lineStyle: {
              width: echartsToPx(2)
            },
            areaStyle: chartConfigs.chartEightOption[modeStore.mode + 'AreaStyle']
          })
        })
      }
    })
  })
}
const basicInfoSearchObj = ref({
  date: getDefaultTime('month'),
  dateType: 'monthrange'
})
// 慢病患者基本信息分布情况，定义此字段是为了切换主题时不需要再次请求接口
const basicInfoData = ref({})

// 慢病患者基本信息分布情况
const getBasicInfoFn = (event, isInit) => {
  if (isInit) {
    basicInfoSearchObj.value.diseaseList = [firstDisease.value]
  }
  const params = {
    agency: null,
    city: lodash.get(basicInfoSearchObj.value, 'areaList'),
    // 不要问我传参为什么这么奇怪,问就是后端要求的
    disease: lodash.get(basicInfoSearchObj.value, 'diseaseList') ? lodash.get(basicInfoSearchObj.value, 'diseaseList') : null,
    date: lodash.get(basicInfoSearchObj.value, 'date'),
    agencyType: lodash.get(basicInfoSearchObj.value, 'agencyType'),
    type: transforParam(basicInfoSearchObj.value.dateType)
  }
  getBasicInfo(params).then(res => {
    basicInfoData.value = res
    handleBasicInfoDataFn()
  })
}
// 切换主题走的慢病患者基本信息分布情况
const handleBasicInfoDataFn = () => {
  const res = basicInfoData.value
  const data = lodash.get(res, 'data.age') || []
  const XData = []
  const YData = []
  data.forEach(item => {
    XData.push(item.name)
    YData.push(item.value)
  })
  handleVerticalBarChart('chartNineOption', { XData, YData }, '')

  handlePie('chartTenOption', lodash.get(res, 'data.sex'))

  handlePie('chartElevenOption', lodash.get(res, 'data.career'))

  if (theThirdPhase.value) {
    // 判断这三项，哪一个图例文字最多
    const operation = filterZero(lodash.get(res, 'data.operation'))
    const exam = filterZero(lodash.get(res, 'data.exam'))
    const inspection = filterZero(lodash.get(res, 'data.inspection'))
    // const maxLen = Math.max(operation.length, exam.length, inspection.length)
    // // 假设平均3个为一行，求最大行数
    // let maxLine = Math.ceil(maxLen / 3)
    // // 手术一行是2个，以手术分布个数为最先
    // const maxLine2 = Math.ceil(operation.length / 2)
    // if (maxLine < maxLine2) {
    //   maxLine = maxLine2
    // }
    // chartOptions.chartSixteenOption.legend.formatter = lengendFormatter
    // chartOptions.chartSeventeenOption.legend.formatter = lengendFormatter
    // chartOptions.chartEighteenOption.legend.formatter = lengendFormatter

    handlePie('chartSixteenOption', operation)
    handlePie('chartSeventeenOption', inspection)
    handlePie('chartEighteenOption', exam)
  }
}
// const lengendFormatter = function(name) {
//   // 根据需要对图例项进行截断或缩短处理
//   let textNumber = 8
//   const width = document.documentElement.clientWidth || document.body.clientWidth
//   if (width > 1440 && width <= 1680) {
//     textNumber = 9
//   } else if (width > 1680 && width <= 1920) {
//     textNumber = 10
//   } else if (width > 1920) {
//     textNumber = 11
//   }
//   return name.length > textNumber ? name.substring(0, textNumber) + '...' : name // 如果图例项长度超过7个字符，则截断并添加省略号
// }
const commonSearchObj = ref({
  date: getDefaultTime('month'),
  dateType: 'monthrange'
})
// 慢病患者共病分布情况获取
const getCommonDataFn = (event, isInit) => {
  if (isInit) {
    commonSearchObj.value.diseaseList = [firstDisease.value, secondDisease.value]
  }
  if (commonSearchObj.value.diseaseList?.length < 2) {
    ElMessage.warning('请选择至少两种病种')
    return
  }
  const params = {
    // agency: lodash.get(commonSearchObj.value, 'hospitalList'),
    city: lodash.get(commonSearchObj.value, 'areaList'),
    disease: lodash.get(commonSearchObj.value, 'diseaseList'),
    date: lodash.get(commonSearchObj.value, 'date'),
    agencyType: lodash.get(commonSearchObj.value, 'agencyType'),
    type: transforParam(commonSearchObj.value.dateType)
  }
  getCommonData(params).then(res => {
    // 慢病患者共病分布情况 年龄分布处理
    const data = lodash.get(res, 'data.age') || []
    const XData = []
    const YData = []
    data.forEach(item => {
      XData.push(item.name)
      YData.push(item.value)
    })
    handleVerticalBarChart('chartTwelveOption', { XData, YData }, '')

    handlePie('chartThirteenOption', lodash.get(res, 'data.sex'))
    handlePie('chartFourteenOption', lodash.get(res, 'data.career'))
  })
}
const computedBarNum = (length, barNum, orient = 'horizontal', initStart, fontSize = 12) => {
  const defaultShowNum = barNum || 4
  const index = modeStore.mode === 'dark' ? 1 : 0
  const Radius = Math.min(defaultShowNum, length) / length * 100 || 100
  const config = [
    {
      commonColor: '#FAC858',
      fillerColor: 'rgba(250, 200, 88, 0.2)',
      handleIcon: handleIcon2,
      bgc: 'rgba(242, 243, 245, 0.70)'
    },
    {
      commonColor: '#FAC858',
      fillerColor: 'rgba(250, 200, 88, 0.2)',
      handleIcon: darkHandleIcon,
      bgc: 'rgba(250, 200, 88, 0.10)'
    }
  ]
  const selectConfig = config[index]
  if (orient === 'horizontal') {
    return [{ // 这是重要的部分
      type: 'slider',
      show: true,
      start: initStart ? 100 : 0,
      orient,
      end: initStart ? (100 - Radius) : Radius,
      zoomOnMouseWheel: false, // 关闭滚轮缩放
      moveOnMouseWheel: false, // 开启滚轮平移
      moveOnMouseMove: false,
      backgroundColor: selectConfig.bgc,
      borderColor: 'rgba(0,0,0,0)',
      height: echartsToPx(12),
      dataBackground: {
        lineStyle: {
          color: selectConfig.commonColor,
          width: echartsToPx(2),
          opacity: 0.3
        },
        areaStyle: {
          color: selectConfig.commonColor,
          opacity: 0
        }
      },
      selectedDataBackground: {
        lineStyle: {
          color: selectConfig.commonColor,
          width: echartsToPx(2),
          opacity: 0.3
        },
        areaStyle: {
          color: selectConfig.commonColor,
          opacity: 0.15
        }
      },
      zoomLock: true,
      borderRadius: echartsToPx(2),
      fillerColor: selectConfig.fillerColor,
      handleIcon: 'image://' + selectConfig.handleIcon,
      handleSize: echartsToPx(30),
      handleStyle: {},
      moveHandleSize: 0,
      moveHandleStyle: {},
      textStyle: {
        padding: echartsToPx(-70),
        color: index ? '#fff' : '#666',
        fontSize: echartsToPx(fontSize)
      },
      brushSelect: false,
      left: echartsToPx(16),
      right: echartsToPx(16),
      bottom: echartsToPx(3)
    }]
  } else {
    return [{ // 这是重要的部分
      type: 'inside', // 缩放条类型为滑动条
      show: true,
      start: initStart ? 100 : 0,
      orient,
      end: initStart ? (100 - Radius) : Radius,
      zoomOnMouseWheel: false, // 关闭滚轮缩放
      moveOnMouseWheel: true, // 开启滚轮平移
      moveOnMouseMove: false,
      handleSize: '80%'
    }]
  }
}
// 复发参数
const recurSearchObj = ref({
  causeFirst: '',
  causeLater: ''
})
// 获取复发数据
const handelRecurSearch = (type, isInit) => {
  if (isInit) {
    recurSearchObj.value = {
      causeFirst: firstDisease.value,
      causeLater: secondDisease.value
    }
  }
  if (recurSearchObj.value.causeFirst && recurSearchObj.value.causeLater) {
    if (recurSearchObj.value.causeFirst === recurSearchObj.value.causeLater) {
      ElMessage.warning('先因病种与后因病种不能相同')
      return
    }
    const params = {
      city: lodash.get(recurSearchObj.value, 'areaList') || null,
      disease: [recurSearchObj.value.causeFirst, recurSearchObj.value.causeLater]
    }
    getRecurData(params).then(res => {
      chartOptions.chartFifteenOption.series.data = lodash.get(res, 'data') || []
    })
  } else {
    ElMessage.warning('请完整选择病因')
  }
}

const hospitalizationsSearchObj = ref({
  areaList: []
})
// 住院次数获取
const hospitalizationsSearch = () => {
  // console.log('进行住院次数的数据获取')
  const params = {
    // agency: [],
    city: lodash.get(hospitalizationsSearchObj.value, 'areaList') || [],
    disease: lodash.get(hospitalizationsSearchObj.value, 'diseaseList') ? lodash.get(hospitalizationsSearchObj.value, 'diseaseList') : null
  }
  const seriesData = []
  const xAxisData = []
  getEnterHospitalNum(params).then(res => {
    const data = lodash.get(res, 'data') || []
    data.forEach(item => {
      seriesData.push(item.value)
      xAxisData.push(item.name)
    })
    handleVerticalBarChart('chartNineteenOption', { XData: xAxisData, YData: seriesData })
  })
}
// 死因分布

const deathCausesObj = ref({
  areaList: []
})
const deathCausesObjSearch = () => {
  // console.log('进行死因分布的数据获取')
  const params = {
    // agency: [],
    city: lodash.get(deathCausesObj.value, 'areaList') || [],
    disease: lodash.get(deathCausesObj.value, 'diseaseList') ? lodash.get(deathCausesObj.value, 'diseaseList') : null
  }
  getDeathCause(params).then(res => {
    const death = filterZero(lodash.get(res, 'data'))
    // 一行默认显示3个
    // const maxLine = Math.ceil(death.length / 3)
    // 默认高度够两行，求剩余行数需要的高度
    // let height = 0
    // if (maxLine > 2) {
    //   // 默认高度够两行，求剩余行数需要的高度
    //   height = (maxLine - 2) * 28
    // }
    // chartOptions.chartTwentyOption.series.top = echartsToPx(66 + height)
    // chartOptions.chartTwentyOption.legend.formatter = lengendFormatter
    // chartOptions.chartTwentyOption.series.data = death
    // chartOptions.chartTwentyOption.legend.top = echartsToPx(5)
    handlePie('chartTwentyOption', death)
  })
}

const diseaseList = ref([])
const firstDisease = ref('')
const secondDisease = ref([])
const getDiseaseListFn = () => {
  return new Promise((resolve, reject) => {
    getDiseaseList().then(res => {
      diseaseList.value = res.data
      if (diseaseList.value?.length > 2) {
        firstDisease.value = diseaseList.value[0].id
        secondDisease.value = diseaseList.value[2].id
      }
      resolve()
    })
  })
}

const mapLeftOptions = ref({
  allData: [
  ],
  everyData: [
  ]
})
const allHospitalListOptions = ref([])
// 所选地区发生变化 可选的医院也要跟随变化
const getHospitalsByAreaFn = (key, init) => {
  const params = {
    cityIdList: key ? key.areaList : {}
  }
  getHospitalsByArea(init ? {} : params).then(res => {
    if (init) {
      allHospitalListOptions.value = res.data
    } else {
      key.hospitalListOptions = res.data
    }
  })
}
// 所选地区发生变化的处理函数
const hanldeArea = (data, type) => {
  // console.log('所选地区发生改变', data, type)
  let isAll = false
  if (data.includes('')) {
    isAll = true
  }
  switch (type) {
    case 'chartTwoOption':
      chartTwoOptionSearchObj.value.areaList = isAll ? null : data
      chartTwoOptionSearchObj.value.hospitalList = []
      getHospitalsByAreaFn(chartTwoOptionSearchObj.value)
      getReportTendencyFn()
      break
    case 'everyDayBrokenLineSearchObj':
      everyDayBrokenLineSearchObj.value.areaList = isAll ? null : data
      everyDayBrokenLineSearchObj.value.hospitalList = []
      getHospitalsByAreaFn(everyDayBrokenLineSearchObj.value)
      getEveryDayBrokenLineFn()
      break
      // 小病种
    case 'minorDiseaseSearchObj':
      minorDiseaseSearchObj.value.areaList = isAll ? null : data
      getminorDiseaseFn()
      break
    case 'basicInfoSearchObj':
      basicInfoSearchObj.value.areaList = isAll ? null : data
      // basicInfoSearchObj.value.hospitalList = []
      // getHospitalsByAreaFn(basicInfoSearchObj.value)
      getBasicInfoFn()
      break
    case 'commonSearchObj':
      // 慢病患者共病分布情况
      commonSearchObj.value.areaList = isAll ? null : data
      // commonSearchObj.value.hospitalList = []
      // getHospitalsByAreaFn(commonSearchObj.value)
      getCommonDataFn()
      break
    case 'recurSearchObj':
      // 慢病患者复发统计
      recurSearchObj.value.areaList = isAll ? null : data
      handelRecurSearch()
      break
    case 'hospitalizationsSearchObj':
      hospitalizationsSearchObj.value.areaList = isAll ? null : data
      hospitalizationsSearch()
      break
    case 'deathCausesObj':
      deathCausesObj.value.areaList = isAll ? null : data
      deathCausesObjSearch()
      break
  }
}
const handlePadAngle = (obj) => {
  if (obj?.series?.data.length >= 2) {
    obj.series.padAngle = 1
  } else {
    obj.series.padAngle = ''
  }
}
const handleChartTheme = (init) => {
  titleColor.value = modeStore.mode === 'dark' ? '#fff' : '#1A1A1A'
  Object.keys(chartConfigs).forEach(item => {
    const obj = lodash.cloneDeep(chartConfigs[item])
    if (obj.prop) {
      const configList = modeStore.mode === 'dark' ? darkBasicOption : lightBasicOption
      let configObj = ''
      if (chartConfigs[item].prop === 'pieChartOption2') {
        handlePie(item, chartConfigs[item].initData)
      } else if (obj.prop === 'verticalBarChartBasicOption2') {
        handleVerticalBarChart(item, chartConfigs[item].initData || {})
      } else {
        configObj = lodash.cloneDeep(markRaw(configList[obj.prop]))
        if (!init) {
          const data = lodash.cloneDeep(chartOptions[item])
          const series = lodash.get(data, 'series') || ''
          if ((series instanceof Array)) {
            configObj.series = series
            if (configObj.yAxis?.data) {
              configObj.yAxis.data = lodash.get(data, 'yAxis.data') || []
            }
            if (configObj.xAxis?.data) {
              configObj.xAxis.data = lodash.get(data, 'xAxis.data') || []
            }
            if (configObj.legend?.data) {
              configObj.legend.data = lodash.get(data, 'legend.data') || []
            }
            if (['chartEightOption'].includes(item)) {
              configObj.series[0].areaStyle = chartConfigs[item][modeStore.mode + 'AreaStyle']
              configObj.color = chartConfigs[item][modeStore.mode + 'Color']
            }
          } else if (series) {
            // series是对象
            configObj.series.data = lodash.get(data, 'series.data') || []
            if (data.yAxis?.data) {
              configObj.yAxis.data = lodash.get(data, 'yAxis.data') || []
            }
            if (data.xAxis?.data) {
              configObj.xAxis.data = lodash.get(data, 'xAxis.data') || []
            }
            if (data.radiusAxis?.data) {
              configObj.radiusAxis.data = lodash.get(data, 'radiusAxis.data') || []
            }
            if (data.legend?.data) {
              configObj.legend.data = lodash.get(data, 'legend.data') || []
            }
          }
        }
        chartOptions[item] = lodash.cloneDeep({
          prop: obj.prop,
          color: obj[modeStore.mode + 'Color'],
          ...configObj
        })
      }
    }
  })
  // 切换主题后，特殊处理慢病患者基本信息分布情况，因为此option的legend.formatter和series的top是动态的，需要重新设置
  if (!init) {
    handleBasicInfoDataFn()
  }
}

handleChartTheme(true)

let debouncedResize = null
// 在页面加载时添加resize事件监听
onMounted(() => {
  debouncedResize = debounce(() => {
    // 避免收缩导航栏触发resize
    if (userStore.screenWidth !== (document.documentElement.clientWidth || document.body.clientWidth)) {
      location.reload()
    }
  }, 300) // 延迟时间为300毫秒

  window.addEventListener('resize', debouncedResize)
})
// 在组件销毁前移除resize事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', debouncedResize)
})
</script>
<style lang="scss" scoped>
.svg-icon {
  display: inline-block;
  overflow: hidden;
  width: 1em;
  height: 1em;
  outline: none;
  vertical-align: -.15em; /* 因icon大小被设置为和字体大小一致，而span等标签的下边缘会和字体的基线对齐，故需设置一个往下的偏移比例，来纠正视觉上的未对齐效果 */
  fill: currentcolor; /* 定义元素的颜色，currentColor是一个变量，这个变量的值就表示当前元素的color值，如果当前元素未设置color值，则从父元素继承 */
}
.dataMonitoring {
  overflow: hidden;
  width: 100%;
  height: 100%;
  // border-radius: 16px;
  .itemTitle {
    position: relative;
    height: 26px;
    margin-top: 40px;
    margin-bottom: 29px;
    padding-left: 10px;
    line-height: 26px;
    font-weight: 500;
    font-size: 18px;
    color: #fff;
    &:nth-of-type(1) {
      margin-top: 16px;
    }
    span {
      position: relative;
      z-index: 20;
    }
    &::before {
      position: absolute;
      left: 0;
      bottom: -5px;
      z-index: 1;
      width: 100px;
      height: 16px;
      border-radius: 8px;
      background: linear-gradient(90deg, #6c8bff 0%, rgba(108, 139, 255, 0) 98%);
      opacity: 1;
      content: '';
    }
  }
  :deep(.dataDistributionTitile.commonTitle) {
    margin-top: 8px;
  }
  .reportContent {
    display: flex;
    align-items: center;
    width: 100%;
    // height: 506px;
    height: 373px;
    .totalityChart {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      width: 595px;
      height: 100%;
      padding: 20px 24px;
      border-radius: 8px;
      background: var(--dark-screen-bg-color);
      .totalityTitle {
        display: flex;
        align-items: center;

        .title {
          flex: 1;
          line-height: 20px;
          font-size: 14px;
          color: #fff;
        }
        .subTitle {
          display: flex;
          align-items: center;
          .txt {
            line-height: 17px;
            font-size: 12px;
            color: #fff;
          }
        }
        .pointer {
          width: 12px;
          height: 12px;
          margin-right: 8px;
          border-radius: 2px;
          // background: #ff904a;
          background-color: #6694ff;
        }
      }
      .chartContainer {
        flex: 1;
      }
    }
    .dataDetail {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 595px;
      height: 100%;
      margin: 0 16px;
      padding: 24px;
      border-radius: 8px;
      background: var(--dark-screen-bg-color);
      .reportDataContainer,
      .processedContainer {
        display: flex;
        height: calc(50% - 8px);

        .dataItem {
          display: flex;
          position: relative;
          flex-direction: column;
          justify-content: flex-start;
          box-sizing: border-box;
          width: 265px;
          // height: 191px;
          height: 137px;
          margin-top: 14px;
          padding: 24px;
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.04);
          &:nth-of-type(1) {
            margin-right: 16px;
          }
          .placeholderDom {
            flex: 1;
            margin-top: 7px;
          }
          :deep(.up) {
            line-height: 20px;
            font-size: 14px;
            color: #04a273;
          }
          :deep(.down) {
            line-height: 20px;
            font-size: 14px;
            color: #ff4e4e;
          }
          :deep(.none) {
            color: rgba(255, 255, 255, 0.6);
          }
          .value {
            display: flex;
            align-items: center;
            line-height: 30px;
            text-align: center;
            font-family: D-DIN;
            font-weight: 500;
            font-size: 30px;
            color: #fff;
            word-break: break-all;
          }
          .label {
            display: flex;
            align-items: center;
            line-height: 25px;
            text-align: center;
            font-size: 16px;
            color: #fff;
          }
          .dataIcon {
            position: absolute;
            right: 24px;
            bottom: 20px;
            width: 55px;
            height: auto;
          }
          .darkDataIcon {
            position: absolute;
            right: 39px;
            bottom: 39px;
            width: 36px;
            height: auto;
            &.today {
              width: 32px;
            }
          }
          .bgGif {
            position: absolute;
            right: 9px;
            bottom: 7px;
            width: 91px;
            height: 91px;
          }
        }
      }
    }
    .tendencyChart {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      box-sizing: border-box;
      // width: 30%;
      width: 594px;
      height: 100%;
      padding: 20px 24px;
      border-radius: 8px;
      background: var(--dark-screen-bg-color);
      .header {
        display: flex;
        align-items: center;
        margin-bottom: 14px;
        .title {
          flex: 1;
          line-height: 20px;
          font-size: 14px;
          color: #fff;
        }
        .dottedLine {
          margin-left: 8px;
        }
        .subTitle {
          display: flex;
          align-items: center;
          line-height: 17px;
          font-size: 12px;
          color: #fff;
          .pointer {
            width: 12px;
            height: 12px;
            margin-right: 5px;
            border-radius: 6px;
            background-color: rgba(140, 235, 160, 0.5);
          }
        }
      }
      .areaContainer {
        margin-bottom: 16px;
      }
      .chartContainer {
        flex: 1;
      }
    }
  }
  .chronicDisease {
    display: flex;
    overflow: hidden;
    position: relative;
    width: 100%;
    height: auto;

    .mapContainer {
      flex: 1;
      width: 100%;
    }
    .dataAndMapContainer {
      display: flex;
      flex-direction: column;
      width: auto;
      height: 948px;
      margin-right: 16px;
      border-radius: 8px;
      background: var(--dark-screen-bg-color);
      .chronicDiseaseMapContainer {
        display: flex;
        position: relative;
        flex-direction: column;
        flex: 1;
        box-sizing: border-box;
        width: 1206px;
        // margin-top: 16px;
        padding: 24px;
        padding-top: 14px;
        .mapContainer {
          flex: 1;
        }
      }
    }
    .mapLeftContainer {
      display: flex;
      z-index: 2;
      align-items: center;
      box-sizing: border-box;
      width: 1206px;
      height: 189px;
      padding: 24px;
      border-radius: 8px;
      >div {
        width: 50%;
        &:nth-of-type(1) {
          margin-right: 16px;
        }
      }
      .chronicDiseaseItemContainer {
        display: flex;
        align-items: center;
        margin-top: 24px;
      }
      .chronicDiseaseItem {
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-sizing: border-box;
        width: 180px;
        height: 95px;
        margin-right: 15px;
        padding: 18px 0;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.04);
        &:nth-last-child(1) {
          margin-right: 0;
        }
        .value {
          margin-bottom: 6px;
          line-height: 35px;
          text-align: center;
          font-family: D-DIN;
          font-weight: 700;
          font-size: 32px;
          color: #fff;
        }
        .label {
          line-height: 20px;
          text-align: center;
          font-weight: 400;
          font-size: 14px;
          color: #fff;
        }
      }
    }
    .mapRightContainer {
      display: flex;
      z-index: 2;
      flex-direction: column;
      width: 594px;
      height: 100%;
      .search {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 100%;
        height: 404px;
        margin-bottom: 16px;
        padding: 24px;
        border-radius: 8px;
        background: var(--dark-screen-bg-color);
        .title {
          margin-bottom: 14px;
        }
        .chartContainer {
          flex: 1;
          margin-top: 16px;
        }
      }
      .showContent {
        flex: 1;
        border-radius: 8px;
        .chartContainer {
          display: flex;
          flex-direction: column;
          flex: 1;
          box-sizing: border-box;
          width: 100%;
          height: 256px;
          padding: 24px;
          border-radius: 8px;
          background: var(--dark-screen-bg-color);
          &:nth-of-type(1) {
            margin-bottom: 16px;
          }
          .chartF {
            flex: 1;
          }
        }
      }
      .areaContainer {
        margin-bottom: 16px;
      }
      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }
  .minorDisease {
    width: 100%;
    .search {
      box-sizing: border-box;
      height: 122px;
      margin-bottom: 21px;
      padding: 24px;
      border-radius: 8px;
      background: var(--dark-screen-bg-color);
      .searchContainer {
        margin-top: 14px;
        :deep(.el-form-item) {
          margin: 0;
          margin-right: 32px;
        }
      }
    }
    .allCharts {
      display: flex;
      overflow: hidden;
      flex-wrap: wrap;
      align-items: center;
      &.allCharts1 {
        .chartContainer {
          height: 399px;
        }
        .chartF {
          margin-top: 20px;
        }
      }
      .chartContainer {
        display: flex;
        position: relative;
        flex-direction: column;
        box-sizing: border-box;
        width: calc((100% - 32px)/3);
        height: 100%;
        margin-right: 16px;
        padding: 24px;
        border-radius: 8px;
        background: var(--dark-screen-bg-color);
        &:nth-of-type(3n) {
          margin-right: 0;
        }
        .chartF {
          flex: 1;
        }
        .lineLengend {
          display: flex;
          position: absolute;
          right: 24px;
          top: 24px;
          align-items: center;
          width: auto;
          .pointer {
            width: 12px;
            height: 12px;
            margin-right: 4px;
            border-radius: 2px;
            background-color: #feb40e;
          }
          .txt {
            line-height: 22px;
            font-weight: 400;
            font-size: 12px;
            color: #fff;
          }
        }
      }
    }
  }
  .basicInfContainer {
    height: auto;
    .allCharts {
      .chartContainer {
        height: 365px;
      }
      .chartContainer:nth-of-type(n+4) {
        margin-top: 16px;
      }
    }
  }
  .chronicDiseaseCollect {
    display: flex;
    align-items: center;
    .chartItem {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: calc(( 100% - 32px)/3);
      height: 475px;
      margin-right: 16px;
      padding: 24px;
      border-radius: 8px;
      background: var(--dark-screen-bg-color);
      &:nth-of-type(3) {
        margin-right: 0;
      }
      .search {
        margin-top: 14px;
        .areaContainer {
          margin-bottom: 14px;
        }
      }

      .chartContainer {
        flex: 1;
      }
      .searchContainer {
        :deep(.deathForm) {
          .el-form-item {
            margin-bottom: 0;
          }
        }
      }
      .title {
        margin-bottom: 8px;
        line-height: 20px;
        font-size: 14px;
        color: #fff;
      }
    }
  }
}

.searchContainer {
  :deep(.el-form-item) {
    border-radius: 2px;
    background: transparent;
  }
  :deep(.el-form--inline .el-form-item) {
    margin-right: 16px;
    margin-bottom: 16px;
  }
  :deep(.el-form-item__label-wrap) {
    margin-left: 0 !important;
  }
  :deep(.el-form-item__label) {
    height: 32px;
    margin-right: 10px;
    padding: 0;
    border-radius: 8px 0 0 12px;
    background: transparent;
    line-height: 32px;
    font-size: 14px;
    color: #fff;
  }

  :deep(.el-date-editor) {
    width: 100% !important;
    height: 100% !important;
  }

  :deep(.el-select .el-select__selection.is-near) {
    margin-left: 0;
  }
  :deep(.el-tag) {
    width: auto;
    height: 24px;
    border-radius: 2px;
    line-height: 24px;
    font-size: 14px;
    &.el-select__placeholder {
      padding: 0 6px;
    }
  }
  :deep(.el-select__icon) {
    color: #fff;
  }
}

.darkMode {
  .searchContainer {
    :deep(.el-tag) {
      width: auto;
      height: 24px;
      border-radius: 2px;
      background: rgba(129, 167, 255, 0.1);
      line-height: 24px;
      font-size: 14px;
      color: #fff;
      span {
        color: #fff;
      }
      &.el-select__placeholder {
        padding: 0 6px;
        color: #fff;
      }
    }
  }
  :deep(.el-scrollbar__view) {
    padding: 0 16px;
  }
  :deep(.el-range-input),
  :deep(.el-range-separator),
  :deep(.el-input__inner) {
    color: #fff;
  }
  .searchContainer {
    :deep(.yearPicker) {
      box-shadow: none;
    }
    :deep(.el-form-item__content) {
      overflow: hidden;
      border-radius: 2px;
      background: rgba(7, 6, 23, 0.38);
    }
    :deep(.el-input__wrapper):hover,
    :deep(.el-input__wrapper),
    :deep(.el-select):hover,
    :deep(.el-input__wrapper) :visited,
    :deep(.elect-trigger):hover,
    :deep(.el-input__wrapper.is-focus) :visited,
    :deep(.el-input) :visited,
    :deep(.el-input.is-focus):visited,
    :deep(.el-input),
    :deep(.el-select .el-input.is-focus .el-input__wrapper),
    :deep(.el-select .el-input__wrapper.is-focus) {
      border: 0 !important;
      box-shadow: none !important;
    }
    :deep(.el-select),
    :deep(.el-select__wrapper),
    :deep(.el-input__wrapper) {
      height: 32px !important;
      min-height: 0;
      line-height: 32px !important;
    }
    :deep(.el-select.sigleSelect) {
      .el-select__wrapper {
        .el-select__selected-item {
          color: #fff;
        }
      }
    }
    :deep(.el-select__wrapper) {
      border: 0;
      background: transparent;
      box-shadow: none;
    }
    :deep(.el-date-editor) {
      background: transparent;
      box-shadow: none;
    }
    :deep(.el-input__wrapper),
    :deep(.el-input__wrapper:hover) {
      background: transparent;
      box-shadow: none;
    }
  }
  .conBorder {
    border: 1px solid rgba(129, 167, 255, 0.1);
  }
  :deep(.el-tag__close) {
    color: #fff;
  }
  :deep(.el-tag .el-tag__close:hover) {
    background-color: #383d5c !important;
    color: #e4e3e3;
  }
}
.lightMode {
  :deep(.el-scrollbar__view) {
    padding: 0 16px;
  }
}
.lightMode .searchContainer {
  :deep(.el-form-item__label) {
    background: transparent;
    color: #5e6e78;
  }
  :deep(.el-select__icon) {
    color: #5e6e78;
  }
}
.lightMode {
  .itemTitle {
    color: #1a1a1a;
  }
  .totalityChart,
  .processedContainer,
  .reportDataContainer,
  .tendencyChart,
  .search,
  .chartContainer {
    background: var(--light-screen-bg-color) !important;
  }
  .reportContent {
    .dataDetail {
      background-color: var(--theme-card);
      .reportDataContainer,
      .processedContainer {
        .dataItem {
          background-color: var(--theme-primary-soft);
          .value {
            color: var(--theme-text);
            :deep(.down) {
              color: rgba(255, 95, 90, 1);
            }
            :deep(.up) {
              color: #3ac09d !important;
            }
          }
          .label {
            color: var(--theme-text-2);
          }
          :deep(.up) {
            line-height: 20px;
            font-size: 14px;
            color: #04a273;
          }
          :deep(.down) {
            line-height: 20px;
            font-size: 14px;
            color: #ff4e4e;
          }
          :deep(.none) {
            color: var(--theme-text-3);
          }
        }
      }
    }
  }

  .mapTitle {
    color: #1a1a1a !important;
  }
  .mapName {
    span {
      border-radius: 20px;
      background: var(--theme-card) !important;
      color: #1a1a1a !important;
    }
  }
  .dataAndMapContainer {
    background: var(--theme-card) !important;
  }
  .chronicDisease {
    .mapLeftContainer {
      background: var(--theme-card);
      .chronicDiseaseItem {
        background-color: var(--theme-primary-soft);
        .value {
          color: var(--theme-text);
        }
        .label {
          color: var(--theme-text-2);
        }
      }
    }
  }
  .title {
    color: #1a1a1a !important;
  }
  .subTitle,
  .txt {
    color: var(--theme-text-2) !important;
    .pointer {
      background: #6694ff !important;
    }
  }
  .tendencyChart {
    .subTitle {
      .pointer {
        background: #04a273 !important;
      }
    }
  }
  .lineLengend {
    .txt {
      color: var(--theme-text-2);
    }
  }
  .lengend {
    .pointer {
      background-color: rgba(140, 235, 160, 1);
    }
  }
  .chronicDiseaseCollect .chartItem {
    border: none;
    background: var(--light-screen-bg-color) !important;
  }
}
.yearRange {
  width: 100%;
}
:deep(.el-form-item__content) {
  line-height: 0;
}
// :deep(.calendarIcon) {
//   position: absolute;
//   right: 10px;
// }
:deep(.chainRatioIcon) {
  width: 11px;
  height: 14px;
  margin-left: 6px;
}
:deep(.el-scrollbar__view) {
  overflow-x: hidden;
  position: relative;
}
.Halo {
  z-index: -1;
}
.Halo1 {
  position: absolute;
  left: -6%;
  // bottom: -30%;
  top: 600px;
  width: 46.98%;
  height: auto;
  opacity: 0.7;
}
.Halo2 {
  position: absolute;
  right: 16%;
  top: 300px;
  width: 28%;
  height: auto;
  opacity: 0.5;
}
.Halo3 {
  position: absolute;
  right: -4%;
  top: -0;
  width: 35%;
  height: auto;
  opacity: 0.7;
}
</style>

