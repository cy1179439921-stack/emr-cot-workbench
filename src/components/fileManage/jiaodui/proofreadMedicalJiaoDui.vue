<template>
  <div class="proofreadMedical" :class="{'myEditing': isEdit}">
    <!-- 防泄露水印：姓名 + 脱敏身份证号，平铺整页 -->
    <DemoWatermark class="cot-watermark" :text="watermarkText" />
    <div class="viewContent">
      <header class="pdfHeader" @wheel.stop>
        <div class="goBack">
          <p @click="goBack">
            <i class="iconfont icon-zuo"></i>
            <span>返回</span>
          </p>
          <div class="item item1">
            <span class="title">文件ID：</span>
            <span class="value">{{info?.id || '-'}}</span>
          </div>
          <div class="item">
            <span class="title">文档编号：</span>
            <span class="value">{{info?.documentId || '-'}}</span>
          </div>
          <div class="item">
            <span class="title">年龄：</span>
            <span class="value">{{info?.age || '-'}}</span>
          </div>
          <div class="item">
            <span class="title">性别：</span>
            <span class="value">{{info?.sex || '-'}}</span>
          </div>
          <div class="item">
            <span class="title">科室：</span>
            <span class="value">{{info?.departmentName || '-'}}</span>
          </div>
          <div class="item">
            <span class="title">Loop数：</span>
            <span class="value">{{info?.loopCount || '-'}}</span>
          </div>
          <div class="item" v-if="isRecordView">
            <span>状态：</span>
            <span class="status" :class="'status' + info.proofreadStatus">{{getStatus(info.proofreadStatus)}}</span>
            <span v-if="info.proofreadStatus === 8 && info.rejectReason" class="reject-reason">（不通过原因：{{ info.rejectReason }}）</span>
          </div>
          <div class="item annotateCount" v-if="isRecordView">
            <span class="title">标注次数：</span>
            <span class="value">{{ annotateCount }} / 4</span>
          </div>
        </div>
        <screenShot></screenShot>
      </header>
      <!-- 标注版本切换：最多 4 个版本，每个版本记录标注人与完成时间 -->
      <div class="versionStrip" v-if="isRecordView && annotateVersions.length">
        <span class="versionLabel">标注版本：</span>
        <div class="versionTabs">
          <button
            v-for="item in annotateVersions"
            :key="item.version"
            type="button"
            class="versionTab"
            :class="{ 'is-active': activeVersion === item.version }"
            @click="activeVersion = item.version">
            {{ item.version }}
          </button>
        </div>
        <span class="versionMeta">
          {{ activeVersionInfo.annotator || '-' }}
          <em v-if="activeVersionInfo.finishedAt">· 完成于 {{ activeVersionInfo.finishedAt }}</em>
          <em v-else class="is-progress">· 标注中</em>
        </span>
      </div>
      <div class="content">
        <div class="stepBar">
          <div class="cot-diagnosis-header">
            <el-scrollbar class="cot-scrollbar">
              <div class="cot-tabBar">
                <div
                  class="diagnosis-item"
                  v-for="(item) in tabList"
                  :key="item.loopId"
                  :class="{ 'is-active': activeTabId === item.loopId, 'has-badge': isDemoView }"
                  @click="tabNodeClick(item.loopId)">
                  {{ item.loopName }}
                  <!-- 演示模式：Loop 完成状态角标，默认未完成 -->
                  <span
                    v-if="isDemoView"
                    class="loop-badge"
                    :class="{ 'is-done': isLoopDone(item.loopId) }">
                    {{ isLoopDone(item.loopId) ? '已完成' : '未完成' }}
                  </span>
                </div>
              </div>
            </el-scrollbar>
          </div>
          <div class="stepContainer">
            <template v-for="(item,index) in steps" :key="index">
              <div :class="{stepItem:true,active:step >= item.id,current:step === item.id}" @click="handleStepJump(index + 1)">
                <i class="iconfont icon-chenggong" v-if='step > item.id && !isRecordView'></i>
                <div class="stepItemNum" v-if="step <= item.id || isRecordView">{{ 'N' + (index + 1) }}</div>
                <div :class="{stepItemName:true}">
                  {{ item.name }}
                </div>
                <!-- 倒计时提示：显示在当前 N 阶段下方 -->
                <span
                  v-if="isEdit && step === item.id"
                  class="stepTimerTip"
                  :class="{ 'is-urgent': remaining <= 10, 'is-first': index === 0, 'is-last': index === steps.length - 1 }">
                  <i class="iconfont icon-shijian1"></i>
                  <b>{{ remaining }}s</b>
                  <em>后自动保存并进入 {{ countdownNextLabel }}</em>
                </span>
              </div>
              <div class="line" v-if="index < steps.length - 1"></div>
            </template>
          </div>
        </div>
        <div class="contentMain" style="margin-top: 0;">
          <div class="left" @wheel.stop>
            <div class="header-step">
              <div class="header-step-left">
                <img class="cot" src="@/assets/cot.png"/>
                <span class="emr-title">EMR · N{{ step }}视图</span>
              </div>
              <div class="header-step-right">
                <span class="anchor-time">锚定时间：<span class="params">{{ lastSavedTime || '-' }}</span></span>
                <span class="header-tag">白名单
                  <span class="params" v-if="activeIndex || isRecordView">10段</span>
                  <span class="params" v-else>{{ whitelist[step] || '-' }}段</span>
                </span>
                <span class="header-tag">引用<span class="params">{{ isDemoView ? demoEvidenceCount : evidenceCount }}</span></span>
              </div>
            </div>
            <!-- 演示模式：原始病历结构化数据（左侧病案导航 + 结构化病历） -->
            <DemoEmrPanel
              v-if="isDemoView"
              class="demo-emr-wrap"
              :tree-data="medicalTypeListStep"
              :ori-data="demoCase.oriData" />
            <div v-else class="main">
              <div class="leftTree" @wheel.stop>
                <h2>病案导航</h2>
                <div class="treeMenu">
                  <el-scrollbar>
                    <!-- :filter-node-method="filterNode" -->
                    <el-tree
                      class="tree-line"
                      :data="medicalTypeListStep"
                      :props="defaultProps"
                      default-expand-all
                      :highlight-current="true"
                      node-key="index"
                      ref="treeRef"
                      :expand-on-click-node="true"
                      @node-click="handleNodeClick">
                      <template #default="{ data }">
                        <div :class=" {'custom-tree-node':true,childrenActived:data.childeIds&&data.childeIds.includes(activeId),'actived':(data.id===activeId),childrenNode:!data.icon }">
                          <i :class="'iconfont'+' ' + data.icon" v-if="data.icon"></i>
                          <div :class="{customTxt:data.icon}" :title="data.title">{{ data.title }}</div>
                        </div>
                      </template>
                    </el-tree>
                  </el-scrollbar>
                </div>
              </div>
              <div class="rightContent">
                <div class="right-content">
                  <el-scrollbar ref="scrollbarRef" :class="'scrollbar_' + curMedicalInfo?.value">
                    <template v-for="item in medicalList" :key="item.id + '-' + renderTimes" >
                      <component ref="childComp" :is="compUrl" :medicalRecordId="recordId" :agencyName="info?.agencyName" :otherInfo="info" :curMedicalInfo="item" mode="proofread"></component>
                    </template>
                  </el-scrollbar>
                </div>
              </div>
            </div>
          </div>
          <AILoading v-if="loading && !isDemoView" class="right" text="AI标注中..."></AILoading>
          <!-- 演示模式：当前步骤的校对数据 -->
          <DemoCotPanel
            v-else-if="isDemoView"
            ref="demoCotRef"
            class="demo-cot-wrap"
            :nodes-annotation="demoNodesAnnotation"
            :ori-data="demoCase.oriData"
            :loop-id="activeTabId"
            :step="step"
            :step-name="currentStepName"
            :save-time="lastEditTime || lastSavedTime"
            :is-edit="isEdit"
            :is-last-step="step === steps.length"
            :is-last-loop="isLastLoop"
            :countdown="remaining"
            :countdown-range="countdownRangeText"
            :countdown-next="countdownNextLabel"
            :readonly="isReadonlyView"
            :is-audit-mode="isAuditMode"
            :is-reannotate-mode="isReannotateMode"
            @audit-pass="handleAuditPass"
            @audit-reject="handleAuditReject"
            @reannotate="handleReannotateSubmit"
            @start-proofread="handleStartProofread"
            @change="handleDemoChange"
            @cancel="handleDemoCancel"
            @save-draft="handleDemoSaveDraft"
            @next="handleDemoNext" />
          <div class="right" v-else>
            <div class="viewContent">
              <div class="stepCountdownBar">
                <span class="countdownNode">N{{ step }}</span>
                <template v-if="remaining > 0">
                  本阶段倒计时 <em class="countdownNum">{{ String(Math.floor(remaining / 60)).padStart(2, '0') }}:{{ String(remaining % 60).padStart(2, '0') }}</em>
                  <span class="countdownHint">结束后自动进入 {{ countdownNextLabel }}</span>
                </template>
                <template v-else>
                  本阶段限时 <em class="countdownNum">{{ countdownRangeText }}</em>
                  <span class="countdownHint">开始校对后自动计时，结束后进入 {{ countdownNextLabel }}</span>
                </template>
              </div>
              <el-scrollbar class="cot-scrollbar">
                <COTN1 ref="cotN1Ref" :is-edit="isEdit" v-if="step === 1" :cot-data="cotFormData" :anchor-time="lastEditTime" />
                <COTN2 ref="cotN2Ref" :is-edit="isEdit" v-if="step === 2" :cot-data="cotFormData" :anchor-time="lastEditTime" @updataLastSavedTime="updataLastSavedTime"/>
                <COTN3 ref="cotN3Ref" :is-edit="isEdit" v-if="step === 3" :cot-data="cotFormData" :anchor-time="lastEditTime" />
                <COTN4 ref="cotN4Ref" :is-edit="isEdit" v-if="step === 4" :cot-data="cotFormData" :anchor-time="lastEditTime" @updataLastSavedTime="updataLastSavedTime"/>
                <COTN5 ref="cotN5Ref" :is-edit="isEdit" v-if="step === 5" :cot-data="cotFormData" :anchor-time="lastEditTime" />
              </el-scrollbar>
            </div>
            <div class="bottom">
              <div class="btn-div">
                <!-- 审核模式：底部展示审核通过/不通过按钮 -->
                <template v-if="isAuditMode">
                  <el-button type="success" @click="handleAuditPass" :loading="auditSubmitting">审核通过</el-button>
                  <el-button type="danger" @click="handleAuditReject" :disabled="auditSubmitting">审核不通过</el-button>
                </template>
                <template v-else-if="!isRecordView">
                  <el-button type="primary" @click="editTable" v-if="!isEdit && (!needCheckPermission || hadPermissionList.includes('编辑'))">开始校对</el-button>
                  <el-button @click="editTable" v-if="isEdit">取 消</el-button>
                  <el-button type="primary" @click="temporaryStorageCotData()" v-if="isEdit">暂 存</el-button>
                  <div class="btnPos">
                    <!-- <el-button type="danger" class="nextBtn" @click="handleStep()"

                    >下一步</el-button> -->
                    <el-button class="animated-el-btn danger" @click="handleStep()" v-if="isEdit && ((step < 5 || activeTabId !== tabList[tabList.length - 1].loopId) || (step === 5 && activeTabId !== tabList[tabList.length - 1].loopId))">
                      <!-- 四条流光边框 -->
                      <span class="line line-top"></span>
                      <span class="line line-right"></span>
                      <span class="line line-bottom"></span>
                      <span class="line line-left"></span>

                      <!-- 按钮文字 + 三重往复动画箭头 -->
                      <span class="btn-text">
                        下一步
                        <!-- SVG 三箭头 -->
                        <svg class="arrows-svg" viewBox="0 0 66 43">
                          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path class="one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479
                            C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                            <path class="two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 24.6771675,42.8608513 L20.1545186,39.1069479
                            C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                            <path class="three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.7000188,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427
                            -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" fill="#FFFFFF"></path>
                          </g>
                        </svg>
                      </span>
                    </el-button>
                    <template v-else>
                      <el-button type="danger" class="animated-el-btn danger" v-if="isEdit" @click="toSave(2)">
                        <!-- 四条流光边框 -->
                        <span class="line line-top"></span>
                        <span class="line line-right"></span>
                        <span class="line line-bottom"></span>
                        <span class="line line-left"></span>

                        <!-- 按钮文字 + 三重往复动画箭头 -->
                        <span class="btn-text">
                          提&nbsp;&nbsp;&nbsp;&nbsp;交
                          <!-- SVG 三箭头 -->
                          <svg class="arrows-svg" viewBox="0 0 66 43">
                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                              <path class="one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479
                            C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                              <path class="two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 24.6771675,42.8608513 L20.1545186,39.1069479
                            C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                              <path class="three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.7000188,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427
                            -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" fill="#FFFFFF"></path>
                            </g>
                          </svg>
                        </span>
                      </el-button>
                    </template>

                  </div>

                </template>
                <template v-else>
                  <el-button type="danger" @click="handleClick('delete')" v-if="!needCheckPermission || hadPermissionListStore.includes('删除病历')">删 除</el-button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 审核不通过弹窗：输入不通过原因（非必填） -->
    <el-dialog v-model="auditRejectDialog" title="审核不通过" width="420px" :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="不通过原因（非必填）">
          <el-input
            v-model="auditRejectReason"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请填写不通过原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditRejectDialog = false">取 消</el-button>
        <el-button type="danger" @click="submitAuditReject" :loading="auditSubmitting">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 右上角悬浮广告位：贴屏幕顶边，悬浮于页面之上，点击跳转官网 -->
    <Teleport to="body">
      <div v-if="adVisible" class="ad-float" @click="handleAdClick">
        <img class="ad-img" :src="adImage" alt="广告" />
        <span class="ad-tag">广告</span>
        <span class="ad-close" title="关闭广告" @click.stop="adVisible = false">×</span>
      </div>
    </Teleport>
  </div>
</template>

<script>
export default {
  name: 'proofreadMedicalJiaoDui'
}
</script>
<script setup>
import router from '@/router'
// import aBtn from './a.vue'
import { ref, reactive, onUnmounted, onMounted, nextTick, shallowRef, computed, provide, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteMedicalRecord, auditMedicalRecord } from '@/api/api_proofread.js'
import { loadPendingRecords, getMedicalInfo, getLoopList, getCurrentLoopData, startVerification, saveCotData, nextStep, getLoopDataByKey, submitMedical } from '@/api/api_cot.js'
import _ from 'lodash'
import medicalRecordHomePage from '@/components/medicalRecord/standardizedMedical/jiaodui/medicalRecordHomePage.vue'
import inHospitalRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/inHospitalRecord.vue'
import outHospitalRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/outHospitalRecord.vue'
import firstMedicalRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/firstMedicalRecord.vue'
import otherMedicalRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/otherMedicalRecord.vue'
import otherRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/otherRecord.vue'
import checkupRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/checkupRecord.vue'
import consulationRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/consulationRecord.vue'
import labCheck from '@/components/medicalRecord/standardizedMedical/jiaodui/labCheck.vue'
import imageExamination from '@/components/medicalRecord/standardizedMedical/jiaodui/imageExamination.vue'
import pathology from '@/components/medicalRecord/standardizedMedical/jiaodui/pathology.vue'
import surgeryRecord from '@/components/medicalRecord/standardizedMedical/jiaodui/surgeryRecord.vue'
import longAdvices from '@/components/medicalRecord/standardizedMedical/jiaodui/longAdvices.vue'
import shortAdvices from '@/components/medicalRecord/standardizedMedical/jiaodui/shortAdvices.vue'
import { useMedicalStore } from '@/store/medicalStore'
import { useRoute } from 'vue-router'
import { useMedicalPathStore } from '@/store/activeHighlightPath'
import screenShot from './screenShot.vue'
import { getPagePermission } from '@/hooks/permissionHooks'
import { storeToRefs } from 'pinia'
import COTN1 from './COTN1.vue'
import COTN2 from './COTN2.vue'
import COTN3 from './COTN3.vue'
import COTN4 from './COTN4.vue'
import COTN5 from './COTN5.vue'
import { useIdle } from '@/utils/useIdle'
import { DEMO_COT_DATA, DEMO_TASKS, getDemoRecord } from '@/mock/proofreadDemo'
import { getCotExportRecord } from '@/mock/cotExportData'
import { loadCaseByRecordId, COT_NODE_KEYS } from '@/mock/cotCaseData'
import DemoEmrPanel from './demoEmrPanel.vue'
import DemoCotPanel from './demoCotPanel.vue'
import DemoWatermark from './demoWatermark.vue'
import { useUserStore } from '@/store/user'
import { watermarkText as buildWatermarkText } from '@/mock/demoUser'
import adBanner from '@/assets/ad-cot-banner.svg'
import { getSystemConfig, pickVisibleAd } from '@/utils/systemConfig'

// 悬浮广告位：展示与否、图片与跳转链接均来自「系统管理-配置管理-广告配置」
const AD_LINK = 'https://ebond-cot.ebondhm.com/'
const adSetting = getSystemConfig()
// 未配置自定义广告时回落到内置宣传图，保持原有演示效果
const activeAd = pickVisibleAd(adSetting)
const adImage = activeAd && activeAd.image ? activeAd.image : adBanner
const adLink = activeAd && activeAd.link ? activeAd.link : AD_LINK
const adVisible = ref(adSetting.adEnabled)
const handleAdClick = () => {
  window.open(adLink, '_blank', 'noopener,noreferrer')
}

const loading = ref(false) // 加载状态
const medicalStore = useMedicalStore()
const route = useRoute()
const { lastEditTime, recordId: recordIdStore } = storeToRefs(medicalStore)
// 详情页刷新时以 URL 参数为准；store 中的病历 ID 可能是上一次访问留下的持久化值。
const routeRecordId = computed(() => route.query.recordId || '')
// Demo 病历详情：仅当显式传 demo=1 或 cotExport=1 时走本地只读数据。
// mock 病历（recordId 以 DEMO- 开头）不再自动走 demo 视图，
// 统一走真实视图模板，后端查不到时由 init() 用 initDemoData 兜底，确保两个入口页面布局一致。
const isDemoView = computed(() => {
  if (route.query.demo === '1') return true
  if (route.query.cotExport === '1') return true
  return false
})
const isRecordView = computed(() => Boolean(routeRecordId.value || recordIdStore.value))
// 只读模式：从「标注管理」进入只允许查看，不提供「开始校对」；COT标注 / 我的工作台进入可标注
const isReadonlyView = computed(() => route.query.readonly === '1')
// 水印文案：当前登录用户姓名 + 脱敏身份证号
const userStore = useUserStore()
const watermarkText = computed(() => buildWatermarkText(userStore.username))
// 审核模式：从任务详情进入审核时，底部展示审核通过/不通过按钮
const isAuditMode = computed(() => route.name === 'auditMedical')
// 重新标注模式：从COT标注列表审核未通过病历点击"开始标注"进入，展示"提交重新标注"按钮
const isReannotateMode = computed(() => route.query.reannotate === '1' && isDemoView.value)
const auditRejectDialog = ref(false)
const auditRejectReason = ref('')
const auditSubmitting = ref(false)
const reannotateSubmitting = ref(false)
const { needCheckPermission, hadPermissionList } = getPagePermission('/medicalRecordProofreading')
const { hadPermissionList: hadPermissionListStore } = getPagePermission('/proofreadingManagement')
const treeRef = ref(null)
const recordId = ref(null)
const userAllocateId = ref(undefined)
const isEdit = ref(false)
const tabList = ref([])
const activeTabId = ref('')
const medicalList = ref([])
const childComp = ref(null)
const renderTimes = ref(0)
const scrollbarRef = ref(null)
// 自动保存定时器 ID
const autoSaveTimerId = ref(null)
const compUrl = shallowRef(null)
const cotN1Ref = ref(null)
const cotN2Ref = ref(null)
const cotN3Ref = ref(null)
const cotN4Ref = ref(null)
const cotN5Ref = ref(null)

// COT 中央数据状态（父组件持有，分发给子组件）
const cotFormData = ref()

// 编辑前的数据快照（用于取消时恢复）
const cotFormSnapshot = ref()

// 演示病例数据：原始病历（ori_data）与 COT 标注（anno_data）
const demoCase = ref({ oriData: {}, annoData: {}})

provide('recordId', recordId)

/** 获取当前 step 对应的 COT 组件实例 */
const currentCOTComp = computed(() => {
  const map = { 1: cotN1Ref, 2: cotN2Ref, 3: cotN3Ref, 4: cotN4Ref, 5: cotN5Ref }
  return map[step.value]?.value
})
const lastSavedTime = ref(null) // 锚定时间
const evidenceCount = ref('-') // 引用证据数量（EvidenceReference 通过 inject 直接更新）
provide('updateEvidenceCount', (count) => { evidenceCount.value = count })
const step = ref(0)
const whitelist = {
  1: 2,
  2: 5,
  3: 7,
  4: 9,
  5: 10
}
const steps = ref([
  {
    name: '初始呈象',
    id: 1
  },
  {
    name: '检查策略',
    id: 2
  },
  {
    name: '病情锚定',
    id: 3
  },
  {
    name: '方案抉择',
    id: 4
  },
  {
    name: '长程应变',
    id: 5
  }
])
const components = {
  medicalRecordHomePage,
  inHospitalRecord,
  outHospitalRecord,
  firstMedicalRecord,
  otherMedicalRecord,
  checkupRecord,
  consulationRecord,
  labCheck,
  imageExamination,
  pathology,
  surgeryRecord,
  longAdvices,
  shortAdvices,
  otherRecord
}
// 当前病历信息
const info = ref({})
// 标注次数与标注版本（最多 4 个版本，每个版本记录标注人与完成时间）
const annotateVersions = ref([])
const annotateCount = ref(0)
const activeVersion = ref('')
const activeVersionInfo = computed(() =>
  annotateVersions.value.find(item => item.version === activeVersion.value) ||
  annotateVersions.value[annotateVersions.value.length - 1] ||
  {}
)
// 同步标注版本：兼容后端只返回次数、不返回明细的情况
const syncAnnotateVersions = (record) => {
  const list = Array.isArray(record?.annotateVersions) ? record.annotateVersions : []
  annotateVersions.value = list.slice(0, 4)
  annotateCount.value = Number(record?.annotateCount ?? list.length) || 0
  activeVersion.value = list.length ? list[list.length - 1].version : ''
}

const defaultProps = {
  children: 'children',
  label: 'label'
}

const getStatus = (status) => {
  switch (status) {
    case 1:
      return '待校对'
    case 2:
      return '校对中'
    case 3:
      return '待复核'
    case 4:
      return '复核中'
    case 5:
      return '待审核'
    case 7:
      return '审核通过'
    case 8:
      return '审核未通过'
    default:
      return '-'
  }
}
const medicalTypeList = ref([
  {
    title: '病历文书',
    icon: 'icon-bingliwenshu',
    id: '1',
    children: [
      {
        title: '病案首页',
        value: 'basic_information',
        ptahValue: 'basic_information',
        component: 'medicalRecordHomePage',
        id: '1-1',
        filter: 1
      },
      {
        title: '入院记录',
        value: 'enter_record',
        ptahValue: 'enter_record',
        component: 'inHospitalRecord',
        id: '1-3',
        filter: 1
      },
      {
        title: '出院记录',
        value: 'exit_record',
        ptahValue: 'exit_record',
        component: 'outHospitalRecord',
        id: '1-4',
        filter: 5
      },
      {
        title: '病程记录',
        id: '1-5',
        filter: 3,
        ptahValue: 'course_record',
        children: [
          {
            title: '首次病程记录',
            value: 'course_record',
            ptahValue: 'first_record',
            component: 'firstMedicalRecord',
            id: '1-5-1',
            filter: 3
          },
          {
            title: '其他病程记录',
            value: 'course_record',
            ptahValue: 'other_records',
            component: 'otherMedicalRecord',
            id: '1-5-2',
            filter: 3
          },
          {
            title: '查房记录',
            value: 'course_record',
            ptahValue: 'ward_records',
            component: 'checkupRecord',
            id: '1-5-3',
            filter: 3
          }
        ]
      }
    ]
  },
  {
    title: '会诊记录',
    value: 'consultation_record',
    ptahValue: 'consultation_record',
    icon: 'icon-huizhenjilu',
    id: '3',
    component: 'consulationRecord',
    filter: 3
  },
  {
    title: '实验室检查',
    value: 'inspections',
    ptahValue: 'inspections',
    icon: 'icon-shiyanshijiancha1',
    id: '4',
    component: 'labCheck',
    filter: 2
  },
  {
    title: '影像检查',
    value: 'image_reports',
    ptahValue: 'image_reports',
    icon: 'icon-yingxiangjiancha',
    id: '5',
    component: 'imageExamination',
    filter: 2
  },
  {
    title: '病理检查',
    value: 'pathologies',
    ptahValue: 'pathologies',
    icon: 'icon-bingli1',
    id: '6',
    component: 'pathology',
    filter: 2
  },
  {
    title: '手术记录',
    value: 'operations',
    ptahValue: 'operations',
    icon: 'icon-shoushujilu',
    id: '7',
    component: 'surgeryRecord',
    filter: 4
  },
  {
    title: '长期医嘱',
    value: 'long_advices',
    ptahValue: 'long_advices',
    icon: 'icon-yizhu',
    id: '8',
    component: 'longAdvices',
    filter: 4
  },
  {
    title: '临时医嘱',
    value: 'short_advices',
    ptahValue: 'short_advices',
    icon: 'icon-yizhu',
    id: '9',
    component: 'shortAdvices',
    filter: 4
  }
])

// 递归收集所有后代节点的 id
const collectDescendantIds = (node) => {
  let ids = []
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      ids.push(child.id)
      if (child.children) {
        ids = ids.concat(collectDescendantIds(child))
      }
    })
  }
  return ids
}

// 递归遍历树，为每个有 children 的节点添加 childeIds
const initChildeIds = (nodes) => {
  nodes.forEach(node => {
    if (node.children && node.children.length > 0) {
      node.childeIds = collectDescendantIds(node)
      initChildeIds(node.children)
    }
  })
}

// 初始化 childeIds
initChildeIds(medicalTypeList.value)

const handleStep = async () => {
  // 校验当前步骤 COT 模块
  if (isEdit.value && currentCOTComp.value) {
    const valid = currentCOTComp.value.getValidateResult ? currentCOTComp.value.getValidateResult() : true
    if (!valid) return
    // 保存当前步骤数据
    await saveCOTStep()
  }
  // 切换步骤后清除 dirty 标记（避免 EditableField 卸载时的副作用触发误判）
  nextTick(() => {
    medicalStore.clearDirty()
  })
}

// ==================== 精准修复：支持多层嵌套的树节点递归过滤 ====================
const medicalTypeListStep = computed(() => {
  const stepValue = step.value
  const rawData = _.cloneDeep(medicalTypeList.value) // 深拷贝原始树结构

  // 递归遍历并过滤树节点
  const filterTreeNodes = (nodes) => {
    return nodes.filter(node => {
      // 1. 如果当前节点有深层子节点（如：病程记录），先递归过滤它的子节点
      if (node.children && node.children.length > 0) {
        node.children = filterTreeNodes(node.children)
        // 如果过滤后，这个父分类下还有需要显示的子节点，则保留此父节点
        return node.children.length > 0
      }

      // 2. 如果是最终的业务叶子节点（如：查房记录），根据 filter 属性与当前步骤对比
      // 如果节点上没有显式写 filter，默认使其通过 (<= stepValue)
      const nodeFilter = node.filter !== undefined ? node.filter : 0
      return nodeFilter <= stepValue
    })
  }
  if (activeIndex.value || isRecordView.value) {
    return rawData
  } else {
    return filterTreeNodes(rawData)
  }
})

const restoreCOTFromSnapshot = () => {
  if (isEdit.value) {
    // 恢复 COT 数据到编辑前状态
    cotFormData.value = _.cloneDeep(cotFormSnapshot.value)
    // step.value = 1
  }
}

// 编辑
const editTable = async () => {
  if (isReadonlyView.value) {
    ElMessage.warning('当前为查看模式，无校对权限')
    return
  }
  if (isEdit.value) {
  //   // 检查内容是否有修改
    const hasChanged = checkDataChanged()
    if (hasChanged) {
      ElMessageBox.confirm(`还有改动没保存，退出后无法找回，确认退出吗？`, '操作未保存',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      ).then(() => {
        // 恢复 COT 数据到编辑前状态
        restoreCOTFromSnapshot()
        isEdit.value = false
        medicalStore.setEditingMedical(null)
        medicalStore.clearDirty()
        clearInterval(autoSaveTimerId.value) // 清除自动保存定时器
      })
    } else {
      // 恢复 COT 数据到编辑前状态
      restoreCOTFromSnapshot()
      isEdit.value = false
      medicalStore.setEditingMedical(null)
      medicalStore.clearDirty()
      clearInterval(autoSaveTimerId.value) // 清除自动保存定时器
    }
    stop()
  } else {
    await startVerification({ userAllocateId: userAllocateId.value })
    isEdit.value = true
    // 启动自动保存
    startAutoSave()
    startStepCountdown()
  }
}
const activeId = ref(null)

const curMedicalInfo = ref(null)
const handleNodeClick = async (data) => {
  // 判断是否为叶子节点（有 component 属性的才是叶子节点）
  const isLeafNode = data.component !== undefined
  // 只有叶子节点才能触发加载
  if (!isLeafNode) {
    return
  }
  renderTimes.value++
  curMedicalInfo.value = data
  compUrl.value = components[data.component]
  medicalList.value = [data]
  activeId.value = data.id
  treeRef.value?.setCurrentKey(activeId.value)
}

// 获取病历信息
const getMedicalAllData = async() => {
  const data = await loadPendingRecords()
  if (data.code === 10000 && data.data?.recordId && data.data?.userAllocateId) {
    recordId.value = data.data.recordId
    userAllocateId.value = data.data.userAllocateId
    getCotDataAndTabs()
  } else {
    goBack()
  }
}

const getCotDataAndTabs = async () => {
  // 获取当前病历信息
  const infoRes = await getMedicalInfo({
    recordId: recordId.value,
    userAllocateId: userAllocateId.value
  })
  if (infoRes.code === 10000) {
    info.value = infoRes.data
    syncAnnotateVersions(infoRes.data)
  }
  // 获取标题数据
  const loopListRes = await getLoopList({
    recordId: recordId.value,
    userAllocateId: userAllocateId.value
  })
  if (loopListRes.code === 10000) {
    tabList.value = loopListRes.data
    // 从管理页面点击后，自动加载当前 COT 内容
    if (isRecordView.value && tabList.value.length > 0) {
      await catCotData(tabList.value[0].loopId) // 获取当前 COT 内容
    }
  }

  // 从菜单进来
  if (!isRecordView.value) {
    await getMedicalContent() // 获取当前 COT 内容
  }

  // 加载已保存的 COT 标注数据
  renderTimes.value++
  nextTick(() => {
    if (medicalTypeListStep.value && medicalTypeListStep.value[0] && medicalTypeListStep.value[0].children && medicalTypeListStep.value[0].children.length > 0) {
      handleNodeClick(medicalTypeListStep.value[0].children[0])
    }
  })
}

const catCotData = async (loopId, nodeType = 'N' + 1) => {
  const cotDataRes = await getLoopDataByKey({
    loopId,
    nodeType,
    recordId: recordId.value
  })

  if (cotDataRes.code === 10000 && cotDataRes.data) {
    activeTabId.value = loopId
    // 字符串过滤只保留数字
    cotFormData.value = cotDataRes.data.jsonData
    step.value = Number(nodeType.replace(/\D/g, ''))
    updataLastSavedTime(cotDataRes.data.jsonData?.node_temporal_anchor?.anchor_timestamp || '-')
    medicalStore.setLastEditTime(cotDataRes.data?.lastUpdateTime || '')
    // 引用数量由 EvidenceReference 的 provide/inject 在初始化时自动同步
  }
}

// 获取当前cot内容
const getMedicalContent = async () => {
  const cotDataRes = await getCurrentLoopData({
    recordId: recordId.value,
    userAllocateId: userAllocateId.value
  })

  if (cotDataRes.code === 10000) {
    tabNodeClick(cotDataRes.data.loopId, true)
    // ai loading
    loading.value = (cotDataRes.data?.recognizeStatus === 0)
    if (loading.value) {
      setTimeout(() => {
        loading.value = false
      }, 5000)
    }

    // 字符串过滤只保留数字
    cotFormData.value = cotDataRes.data.jsonData
    step.value = Number(cotDataRes.data.currentNodeType.replace(/\D/g, ''))
    cotFormSnapshot.value = _.cloneDeep(cotFormData.value) // 保存快照（编辑前的 COT 数据）
    updataLastSavedTime(cotDataRes.data.jsonData?.node_temporal_anchor?.anchor_timestamp || '-')

    medicalStore.setLastEditTime(cotDataRes.data?.lastUpdateTime || '')
    // 引用数量由 EvidenceReference 的 provide/inject 在初始化时自动同步
  }
}

const updataLastSavedTime = (value) => {
  lastSavedTime.value = value
}

// 当前 Loop 的标注节点集合（供右侧校对数据面板使用）
const demoNodesAnnotation = computed(() => {
  const loops = demoCase.value.annoData?.clinical_loop_network || []
  const loop = loops.find(item => item.loop_meta?.loop_id === activeTabId.value) || loops[0]
  return loop?.nodes_annotation || {}
})

// 当前步骤名称（初始呈象 / 检查策略 / 病情锚定 / 方案抉择 / 长程应变）
const currentStepName = computed(() => steps.value.find(item => item.id === step.value)?.name || '')

// 当前步骤引用的证据条数
const demoEvidenceCount = computed(() => {
  const node = demoNodesAnnotation.value[COT_NODE_KEYS[step.value]] || {}
  return node.node_evidence_block?.mapped_emr_evidence?.length || 0
})

// 演示模式：右侧校对面板（编辑态读写用）
const demoCotRef = ref(null)

// 取当前 Loop 的标注数据容器
const getDemoLoop = () => {
  const loops = demoCase.value.annoData?.clinical_loop_network || []
  return loops.find(item => item.loop_meta?.loop_id === activeTabId.value) || loops[0]
}

// 当前时间的展示格式（yyyy-MM-dd HH:mm:ss）
const formatNow = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

// 把编辑结果写回当前 Loop 的标注数据（演示环境仅内存保存）
const commitDemoNode = (nodeData) => {
  const loop = getDemoLoop()
  if (!loop || !nodeData) return
  loop.nodes_annotation = {
    ...(loop.nodes_annotation || {}),
    [COT_NODE_KEYS[step.value]]: nodeData
  }
  cotFormData.value = loop.nodes_annotation
  medicalStore.setLastEditTime(formatNow())
}

// 退出编辑态：停自动保存、清脏标记
const exitDemoEdit = () => {
  isEdit.value = false
  stop()
  clearInterval(autoSaveTimerId.value)
  autoSaveTimerId.value = null
  medicalStore.clearDirty()
}

// ===================== 演示模式：N1-N5 校对进度 =====================
// key = 病历ID|LoopID，value = 已完成的最大步骤（0 表示尚未开始）
const demoCompleted = ref({})
const progressKey = () => `${recordId.value}|${activeTabId.value}`
// 当前 Loop 已完成的步骤数
const getCompletedStep = () => Number(demoCompleted.value[progressKey()] || 0)
// 标记某一步已完成（只增不减）
const markStepDone = (stepValue) => {
  const key = progressKey()
  demoCompleted.value = {
    ...demoCompleted.value,
    [key]: Math.max(Number(demoCompleted.value[key] || 0), Number(stepValue) || 0)
  }
}

// ===================== 演示模式：Loop 完成状态 =====================
// key = 病历ID|LoopID，value = 是否已完成；默认为空对象 → 所有 Loop 均「未完成」
// Loop 在 N5 阶段点击「保存并进入下一loop」或倒计时自动保存后置为已完成
const demoLoopDone = ref({})
const loopDoneKey = (loopId) => `${recordId.value}|${loopId}`
const isLoopDone = (loopId) => Boolean(demoLoopDone.value[loopDoneKey(loopId)])
const markLoopDone = (loopId) => {
  if (!loopId) return
  demoLoopDone.value = { ...demoLoopDone.value, [loopDoneKey(loopId)]: true }
}

// ===================== 演示模式：Loop 之间的 N 阶段记忆 =====================
// key = 病历ID|LoopID，value = 离开该 Loop 时停留的 N；
// 用于「编辑态 / 编辑过的 Loop」再次进入时回到上次切走的阶段，未编辑过的 Loop 一律从 N1 开始。
const demoLoopStep = ref({})
const loopStepKey = (loopId) => `${recordId.value}|${loopId}`
const rememberLoopStep = (loopId, stepValue) => {
  if (!loopId) return
  demoLoopStep.value = { ...demoLoopStep.value, [loopStepKey(loopId)]: Number(stepValue) || 1 }
}
const rememberedLoopStep = (loopId) => Number(demoLoopStep.value[loopStepKey(loopId)] || 0)

// 切到指定 Loop：
// - 未编辑过的 Loop → 从 N1 开始（查看态、编辑态一致）
// - 编辑态切走前记住当前 N；目标 Loop 编辑过 → 回到上次切走的 N
const switchDemoLoop = (loopId, { keepEdit = false } = {}) => {
  if (!loopId) return
  const leavingLoopId = activeTabId.value
  // 编辑态离开时记录当前 Loop 停留的 N（查看态浏览不覆盖记忆）
  if (leavingLoopId && leavingLoopId !== loopId && isEdit.value) {
    rememberLoopStep(leavingLoopId, step.value)
  }
  activeTabId.value = loopId
  activeIndex.value = _.findIndex(tabList.value, { loopId })
  // 有记忆则回到上次离开的 N，否则固定 N1
  const targetStep = rememberedLoopStep(loopId) || 1
  step.value = Math.min(Math.max(targetStep, 1), steps.value.length)
  lastSavedTime.value = demoNodesAnnotation.value[COT_NODE_KEYS[step.value]]?.node_temporal_anchor?.anchor_timestamp || lastSavedTime.value
  resetRightPanelScroll()
  if (keepEdit && isEdit.value) startStepCountdown()
}

// 编辑态下每停留一个 N 就记录（含前进与回跳），供下次切回该 Loop 时恢复到同一阶段
watch([step, isEdit], ([curStep, editing]) => {
  if (editing && isDemoView.value) rememberLoopStep(activeTabId.value, curStep)
})

// ===================== 演示模式：病历顺序 =====================
// 当前 Loop 是否为本病历的最后一个 Loop
const isLastLoop = computed(() => {
  const list = tabList.value
  if (!list.length) return true
  return list[list.length - 1].loopId === activeTabId.value
})

// 定位当前病历在所属任务中的位置，用于「保存并进入下一份病历」
const demoRecordCursor = computed(() => {
  const key = String(recordId.value || routeRecordId.value || '')
  if (!key) return null
  for (const task of DEMO_TASKS) {
    const index = task.records.findIndex(item => String(item.id) === key)
    if (index > -1) return { task, index, next: task.records[index + 1] || null }
  }
  return null
})

// 跨 N 跳转：只能按顺序往后校对（点击后面的 N 时，提示先校对当前所处的 N）；
// 已经标好的 N 可以往回跳转，编辑态回跳前先静默保存当前 N 的修改。
const handleStepJump = (target) => {
  const targetStep = Number(target)
  if (!targetStep || targetStep === step.value) return

  if (!isDemoView.value) {
    tabNodeClick(activeTabId.value, false, targetStep)
    return
  }

  const completed = getCompletedStep()
  // 往后跳：不允许跨阶段，只提示「当前所处的阶段」，一次只提示一个 N
  if (targetStep > step.value) {
    ElMessage.warning(`请先校对N${step.value}`)
    return
  }

  // 往回跳：目标必须是已完成（已标好）的 N
  if (targetStep > completed) {
    ElMessage.warning(`请先校对N${completed + 1}`)
    return
  }

  if (isEdit.value) {
    // 编辑态往回跳：保存当前 N，保持编辑态继续校对目标 N
    const nodeData = demoCotRef.value?.getFormData()
    if (nodeData) commitDemoNode(nodeData)
    medicalStore.clearDirty()
  }

  step.value = targetStep
  lastSavedTime.value = demoNodesAnnotation.value[COT_NODE_KEYS[targetStep]]?.node_temporal_anchor?.anchor_timestamp || lastSavedTime.value
  resetRightPanelScroll()
  if (isEdit.value) startStepCountdown()
}

// 演示模式开始校对：本地进入编辑态，不调后端
const handleStartProofread = () => {
  if (isReadonlyView.value) {
    ElMessage.warning('当前为查看模式，无校对权限')
    return
  }
  if (isAuditMode.value || isReannotateMode.value) {
    ElMessage.info('当前为演示数据，暂不支持在线校对')
    return
  }
  cotFormSnapshot.value = _.cloneDeep(demoNodesAnnotation.value[COT_NODE_KEYS[step.value]] || {})
  isEdit.value = true
  medicalStore.clearDirty()
  startAutoSave()
  startStepCountdown()
}

// 编辑内容变化：标记为未保存
const handleDemoChange = () => {
  if (isEdit.value) medicalStore.setDirty()
}

// 取消：放弃本次修改，回到上次保存的内容
const handleDemoCancel = () => {
  exitDemoEdit()
  demoCotRef.value?.reset()
  ElMessage.info('已取消本次修改')
}

// 暂存：本地保存并退出编辑态
const handleDemoSaveDraft = (nodeData) => {
  commitDemoNode(nodeData)
  exitDemoEdit()
  ElMessage.success('已暂存，可以随时回来继续')
}

// 进入下一步：仍有后续步骤则切步骤（保持编辑态），否则切下一个 Loop 查看态 / 结束
const handleDemoNext = async(nodeData) => {
  commitDemoNode(nodeData)
  markStepDone(step.value)
  medicalStore.clearDirty()

  if (step.value < steps.value.length) {
    step.value += 1
    lastSavedTime.value = demoNodesAnnotation.value[COT_NODE_KEYS[step.value]]?.node_temporal_anchor?.anchor_timestamp || lastSavedTime.value
    resetRightPanelScroll()
    startStepCountdown()
    ElMessage.success(`已进入 N${step.value} ${currentStepName.value}`)
    return
  }

  // N5 完成：当前 Loop 标记为已完成，进入下一个 Loop 并保持编辑态
  markLoopDone(activeTabId.value)
  const loopIndex = tabList.value.findIndex(item => item.loopId === activeTabId.value)
  if (loopIndex > -1 && loopIndex < tabList.value.length - 1) {
    const nextLoop = tabList.value[loopIndex + 1]
    // 定位到下一个 Loop 的待校对阶段，编辑态保持
    switchDemoLoop(nextLoop.loopId, { keepEdit: true })
    ElMessage.success(`「${nextLoop.loopName}」已进入编辑态，可从 N${step.value} 继续校对`)
    return
  }

  // 最后一个 Loop：进入下一份病历的查看态
  if (await enterNextDemoRecord()) return

  exitDemoEdit()
  ElMessage.success('已是最后一份病历，全部校对完成')
}

// 切换步骤/Loop 后右侧面板回到顶部
const resetRightPanelScroll = () => {
  nextTick(() => {
    const wrap = demoCotRef.value?.$el?.querySelector('.el-scrollbar__wrap')
    if (wrap) wrap.scrollTop = 0
  })
}

const initDemoData = async () => {
  const recordKey = routeRecordId.value || recordIdStore.value || ''
  // 状态类元数据（任务、审核状态、驳回原因）取自列表 mock 数据
  const demoRecord = route.query.cotExport === '1'
    ? await getCotExportRecord(recordKey)
    : getDemoRecord(recordKey)
  if (!demoRecord) return

  let oriData = {}
  let loops = demoRecord.loops || []
  // 常规演示：加载 public/static 下成对的原始病历（左）与 COT 标注（右）
  if (route.query.cotExport !== '1') {
    try {
      const payload = await loadCaseByRecordId(recordKey)
      oriData = payload.oriData || {}
      loops = payload.annoData?.clinical_loop_network || []
      demoCase.value = { oriData, annoData: payload.annoData || {}}
    } catch (error) {
      // 静态数据缺失时不阻断页面渲染，左侧展示空态
      console.warn('[演示数据] 病历加载失败', error)
    }
  } else {
    demoCase.value = { oriData: {}, annoData: { clinical_loop_network: loops }}
  }

  const basic = oriData.basic_information || {}
  const context = demoCase.value.annoData?.patient_global_context || {}

  recordId.value = demoRecord.id
  medicalStore.setRecordId(demoRecord.id)
  info.value = {
    ...demoRecord,
    documentId: basic.document_id || demoRecord.documentId,
    age: context.age || basic.age || demoRecord.age,
    sex: context.sex === 'FEMALE' ? '女' : (context.sex === 'MALE' ? '男' : demoRecord.sex),
    departmentName: basic.in_department || demoRecord.departmentName,
    loopCount: loops.length || 0,
    agencyName: demoRecord.agencyName || '演示医院'
  }
  syncAnnotateVersions(demoRecord)
  tabList.value = loops.length
    ? loops.map((loop, index) => ({
      loopId: loop.loop_meta?.loop_id || `demo-loop-${index + 1}`,
      loopName: loop.loop_meta?.loop_name || `Loop ${index + 1}`
    }))
    : [{ loopId: 'demo-loop-1', loopName: '初始评估' }]
  activeTabId.value = tabList.value[0].loopId
  step.value = 1
  cotFormData.value = loops[0]?.nodes_annotation || { ...DEMO_COT_DATA }
  cotFormSnapshot.value = _.cloneDeep(cotFormData.value)
  const firstNode = loops[0]?.nodes_annotation?.[COT_NODE_KEYS[1]] || {}
  lastSavedTime.value = firstNode.node_temporal_anchor?.anchor_timestamp || DEMO_COT_DATA.node_temporal_anchor.anchor_timestamp

  // 校对进度：按病历状态推导已完成的 N，供跨 N 跳转校验使用
  const status = Number(info.value?.proofreadStatus || 1)
  let doneStep = 0
  if ([3, 4, 5, 7, 8].includes(status)) doneStep = 5
  else if (status === 2) doneStep = 2
  const progressMap = {}
  tabList.value.forEach((loop) => {
    progressMap[`${recordId.value}|${loop.loopId}`] = doneStep
  })
  demoCompleted.value = progressMap

  medicalList.value = []
  renderTimes.value++
}

// N5 完成且已是本 Loop 的最后一环：进入本任务下一份病历的查看态
// 返回 false 表示已是最后一份病历（由调用方收尾）
const enterNextDemoRecord = async() => {
  const nextRecord = demoRecordCursor.value?.next
  if (!nextRecord) return false
  exitDemoEdit()
  // 只替换 recordId，保留 demo/backTo 等其余参数
  await router.replace({ query: { ...route.query, recordId: nextRecord.id }})
  await initDemoData()
  activeIndex.value = 0
  resetRightPanelScroll()
  ElMessage.success(`「${info.value?.documentId || nextRecord.documentId || nextRecord.id}」已进入查看态`)
  return true
}

const init = async() => {
  if (isDemoView.value) {
    await initDemoData()
    return
  }
  // 直接打开或刷新详情页时，优先读取显式路由参数。
  if (routeRecordId.value) {
    recordId.value = routeRecordId.value
    medicalStore.setRecordId(routeRecordId.value)
    // mock 病历（ID 以 DEMO- 开头）不调后端接口，直接用 demo 数据填充真实视图模板
    if (String(routeRecordId.value).startsWith('DEMO-')) {
      await initDemoData()
      return
    }
    try {
      await getCotDataAndTabs()
    } catch (e) {
      // 接口异常时静默，后续用 demo 数据兜底
    }
    // 后端返回空数据时用 demo 数据兜底，确保页面布局一致
    if (!info.value || !tabList.value?.length) {
      await initDemoData()
    }
  } else if (recordIdStore.value) {
    recordId.value = recordIdStore.value
    await getCotDataAndTabs()
  } else {
    await getMedicalAllData()
  }
}

onMounted(() => {
  // 从cot进来清空持久化数据
  if (route.fullPath === '/medicalRecordProofreading') {
    medicalStore.clearRecordId()
  }
  init()
})

onUnmounted(() => {
  clearInterval(autoSaveTimerId.value) // 清除自动保存定时器
  medicalStore.clearDirty()
})

// 校对病历：返回
// 严格按显式 backTo 路由返回；任务详情链路携带 allocateId/taskStatus；
// 无显式 backTo 时走 browser history 栈。
const goBack = async () => {
  medicalStore.clearRecordId()
  const backTo = route.query?.backTo
  if (backTo) {
    try {
      if (backTo === '/proofreadingManagement/taskDetail') {
        // 返回任务详情：携带 allocateId/taskStatus
        const demoRecord = isDemoView.value && routeRecordId.value ? getDemoRecord(routeRecordId.value) : null
        const backAllocateId = route.query?.backAllocateId || demoRecord?.taskId
        const backTaskStatus = route.query?.backTaskStatus ?? demoRecord?.taskStatus
        if (backAllocateId) {
          const query = { allocateId: backAllocateId }
          if (backTaskStatus !== undefined && backTaskStatus !== '') query.taskStatus = backTaskStatus
          await router.replace({ name: 'taskDetail', query })
        } else {
          await router.replace({ name: 'taskManagement' })
        }
      } else {
        // 返回 backTo 指定路径（病历池 / COT标注 等）
        await router.replace({ path: backTo })
      }
      return
    } catch (e) {
      // replace 失败回退到 history 返回
    }
  }
  // 无显式 backTo：走 history 栈；栈浅时兜底返回病历池
  if (window.history.length > 1) {
    router.back()
  } else {
    await router.push({ name: 'medicalRecordPool' })
  }
}

/** 保存当前步骤的 COT 标注数据 */
const saveCOTStep = async (submitStatus = false) => {
  if (!currentCOTComp.value) return
  const content = currentCOTComp.value.getEditingMedicalContent ? currentCOTComp.value.getEditingMedicalContent() : null
  if (!content) return

  const params = {
    userAllocateId: userAllocateId.value,
    currentLoopId: activeTabId.value,
    currentNodeType: 'N' + step.value,
    cotResult: content
  }
  try {
    const res = await nextStep(params)
    if (res.code === 10000) {
      !submitStatus && await getMedicalContent()
    }
  } catch (error) {
    console.error('COT步骤保存失败:', error)
  }
}

// 保存
const toSave = () => {
  ElMessageBox.confirm('提交后进入下一份病历，确认提交吗？', '确认提交',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  ).then(async () => {
    if (currentCOTComp.value && currentCOTComp.value.getValidateResult) {
      const valid = currentCOTComp.value.getValidateResult()
      if (!valid) {
        // 校验未通过，终止执行
        return
      }
    }
    await saveCOTStep(true)
    saveForm()
  })
}

const saveForm = async () => {
  submitMedical({ recordId: recordId.value, userAllocateId: userAllocateId.value }).then(res => {
    if (res.code === 10000) {
      isEdit.value = false
      step.value = 0
      medicalStore.clearDirty()
      clearInterval(autoSaveTimerId.value)
      getMedicalAllData()
    } else {
      ElMessage.success(res.msg || '保存失败')
    }
  })
}

// 自动保存：检查数据是否有修改
const checkDataChanged = () => {
  return medicalStore.isDirty
}

// 自动保存：启动定时器（固定10秒间隔，严格周期驱动）
const startAutoSave = () => {
  // 清除旧定时器
  if (autoSaveTimerId.value) {
    clearInterval(autoSaveTimerId.value)
    autoSaveTimerId.value = null
  }
  // 清除初始脏标记（避免组件初始化产生的副作用被误判为"有更新"）
  nextTick(() => {
    medicalStore.clearDirty()
  })
  // 启动固定间隔定时器：严格每10秒执行一次检查与保存，不受数据变化时机影响
  autoSaveTimerId.value = setInterval(() => {
    autoSave()
  }, 10000)
}

// 自动保存：执行检查与保存逻辑（由固定周期触发）
const autoSave = async () => {
  // 非编辑模式则停止定时器
  if (!isEdit.value) {
    clearInterval(autoSaveTimerId.value)
    autoSaveTimerId.value = null
    return
  }
  // 无更新则跳过本次周期
  if (!checkDataChanged()) return

  // 演示模式：仅本地写回
  if (isDemoView.value) {
    const nodeData = demoCotRef.value?.getFormData()
    if (nodeData) commitDemoNode(nodeData)
    medicalStore.clearDirty()
    return
  }

  // 有更新，执行保存
  try {
    await temporaryStorageCotData(2)
  } catch (error) {
    console.error('自动保存失败:', error)
  }
}

// 自动保存：临时存储 COT 数据
const temporaryStorageCotData = async (type = 1) => {
  // 演示数据不落库，交给演示分支处理
  if (isDemoView.value) return
  if (currentCOTComp.value && step.value > 0) {
    const params = {
      userAllocateId: userAllocateId.value,
      currentLoopId: activeTabId.value,
      currentNodeType: 'N' + step.value,
      cotResult: currentCOTComp.value.getEditingMedicalContent(),
      saveType: type
    }
    const res = await saveCotData(params)
    if (type === 1 && res.code === 10000) {
      cotFormSnapshot.value = _.cloneDeep(params.cotResult)
      ElMessage.success('已暂存，可以随时回来继续')
      isEdit.value = false
    } else if (res.code === 10000) {
      cotFormSnapshot.value = _.cloneDeep(params.cotResult)
    }
    medicalStore.setLastEditTime(res?.data?.lastUpdateTime || '')
  }
  medicalStore.clearDirty()
}

// 删除
const handleClick = (operation) => {
  ElMessageBox.confirm(
    `是否删除该病历？`,
    '提示',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning'
    }
  ).then(async() => {
    // 确定删除
    if (operation === 'delete') {
      const { code } = await deleteMedicalRecord({ recordId: recordId.value })
      if (code === 10000) {
        ElMessage.success('已删除')
        goBack()
      }
    }
  })
}

// 审核通过
const handleAuditPass = () => {
  if (isDemoView.value) {
    ElMessage.success('演示：审核已通过')
    goBack()
    return
  }
  ElMessageBox.confirm('确认审核通过该病历？', '审核', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'success'
  }).then(async () => {
    auditSubmitting.value = true
    try {
      const res = await auditMedicalRecord({ recordId: recordId.value, status: 7 })
      if (res.code === 10000) {
        ElMessage.success('审核通过')
        goBack()
      } else {
        ElMessage.error(res.msg || '审核失败')
      }
    } catch (e) {
      ElMessage.error('审核失败')
    } finally {
      auditSubmitting.value = false
    }
  }).catch(() => {})
}

// 审核不通过：弹窗输入原因（非必填）
const handleAuditReject = () => {
  auditRejectReason.value = ''
  auditRejectDialog.value = true
}

// 提交审核不通过
const submitAuditReject = async () => {
  if (isDemoView.value) {
    ElMessage.success('演示：已标记审核不通过')
    auditRejectDialog.value = false
    goBack()
    return
  }
  auditSubmitting.value = true
  try {
    const res = await auditMedicalRecord({ recordId: recordId.value, status: 8, rejectReason: auditRejectReason.value })
    if (res.code === 10000) {
      ElMessage.success('已标记审核不通过')
      auditRejectDialog.value = false
      goBack()
    } else {
      ElMessage.error(res.msg || '审核失败')
    }
  } catch (e) {
    ElMessage.error('审核失败')
  } finally {
    auditSubmitting.value = false
  }
}

// 提交重新标注：demo 模式下提交后状态变更为待审核，返回 COT 标注列表
const handleReannotateSubmit = async () => {
  reannotateSubmitting.value = true
  try {
    // demo 模式：更新本地病历状态为待审核(5)
    const demoRecord = getDemoRecord(recordId.value)
    if (demoRecord) {
      const task = DEMO_TASKS.find(t => t.id === demoRecord.taskId)
      const target = task?.records.find(r => r.id === demoRecord.id)
      if (target) {
        target.proofreadStatus = 5
        target.rejectReason = ''
      }
    }
    ElMessage.success('已提交重新标注，病历状态已变更为待审核')
    goBack()
  } finally {
    reannotateSubmitting.value = false
  }
}

const activeIndex = ref(0)
provide('activeIndex', activeIndex)
const tabNodeClick = (id, isWhether = false, steps) => {
  // 演示模式：数据全在本地，直接切换 Loop 与步骤，不请求后端
  if (isDemoView.value) {
    const isLoopSwitch = Boolean(id) && id !== activeTabId.value
    if (isLoopSwitch) {
      // 切换 Loop：编辑态下先静默保存当前 N，切过去后继续保持编辑态；
      // 查看态下切过去仍是查看态
      const keepEdit = isEdit.value
      if (keepEdit) {
        const nodeData = demoCotRef.value?.getFormData()
        if (nodeData) commitDemoNode(nodeData)
        medicalStore.clearDirty()
      }
      switchDemoLoop(id, { keepEdit })
      return
    }
    // 同一 Loop 内切换步骤（统一走跨 N 校验）
    if (steps !== undefined) handleStepJump(Number(steps))
    return
  }
  if (isRecordView.value) {
    catCotData(id, 'N' + steps)
  }
  if (isRecordView.value || isWhether) {
    activeTabId.value = id
    activeIndex.value = _.findIndex(tabList.value, { loopId: id })
  }
}
// 2. 实例化 Store
const medicalPathStore = useMedicalPathStore()

// === 证据字段背景色高亮（直接给元素加 background-color，不影响可读性）===
const highlightState = reactive({
  /** 当前高亮的目标 DOM 元素引用 */
  el: null
})

/** 给目标元素高亮：整行 key 走 <tr> 整行高亮；整列/普通字段保持元素自身高亮 */
/** @param {HTMLElement|HTMLElement[]} targetDoms - 目标 DOM 元素
 *  @param {'row'|'self'} [mode='self'] - 'row'=给所在 <tr> 加整行高亮, 'self'=给元素自身加高亮 */
const triggerHighlight = (targetDoms, mode) => {
  const doms = Array.isArray(targetDoms) ? targetDoms : [targetDoms]
  // 清除上一次的高亮
  if (highlightState.el) {
    const prev = Array.isArray(highlightState.el) ? highlightState.el : [highlightState.el]
    prev.forEach(el => el?.classList.remove('evidence-row-highlight'))
  }
  highlightState.el = null
  nextTick(() => {
    const targets = new Set()
    if (mode === 'row') {
      // 整行模式：收集去重后的 <tr>
      doms.forEach(d => {
        const tr = d.closest('tr')
        if (tr) targets.add(tr)
        else targets.add(d)
      })
    } else {
      // 自身模式（整列/普通字段）：直接高亮元素本身
      doms.forEach(d => targets.add(d))
    }
    targets.forEach(el => {
      el.classList.remove('evidence-row-highlight')
      el.offsetHeight
      el.classList.add('evidence-row-highlight')
    })
    highlightState.el = [...targets]
  })
}

// 3. 监听 COT 证据点击 → 自动定位右侧病历字段

// ============ 定位相关常量 ============
/** 病案首页整列字段映射：data.json 扁平数组 → 组件 el-table 对象数组列（整列高亮） */
const COLUMN_MATCH_MAP = [
  ['other_diagnosis_name', 'basic_information.other_diagnosis[', '].name'],
  ['other_diagnosis_icd10', 'basic_information.other_diagnosis[', '].code'],
  ['operations_code', 'basic_information.operations[', '].operation_code'],
  ['operations_time', 'basic_information.operations[', '].operation_time'],
  ['operations_name', 'basic_information.operations[', '].operation_name']
]
/** 证据路径 → 组件实际 key 的命名空间映射 */
const PATH_REPLACEMENTS = [
  [/advices\.long_advices\.items/, 'advices.long_advices.long_term'],
  [/advices\.short_advices\.items/, 'advices.short_advices.short_term']
]
/** 需取第二段匹配树节点的嵌套命名空间 */
const NESTED_NAMESPACES = ['course_record', 'advices']
/** 定位/重试参数 */
const LOCATE_CONFIG = {
  maxRetries: 10,
  retryDelay: 200,
  initialDelay: 350,
  scrollDuration: 800,
  scrollOffsetRatio: 1 / 3
}

// ============ 模块一：路径解析（数据处理） ============
/** 解析证据路径，提取用于匹配树节点的 targetValue（处理嵌套命名空间第二段） */
const resolveTreeTargetValue = (path) => {
  const firstMatch = path.match(/^([a-zA-Z_]+)/)
  if (!firstMatch) return null
  let targetValue = firstMatch[1]
  if (NESTED_NAMESPACES.includes(targetValue)) {
    const secondMatch = path.match(new RegExp(`^${targetValue}\\.([a-zA-Z_]+)`))
    if (secondMatch?.[1]) targetValue = secondMatch[1]
  }
  return targetValue
}

/** 在多个树列表中递归查找匹配 ptahValue/value 的节点 */
const findTreeNode = (value, treeLists) => {
  let found = null
  const search = (nodes) => {
    if (!nodes || found) return
    for (const node of nodes) {
      if (node.ptahValue === value || node.value === value) { found = node; return }
      if (node.children?.length) search(node.children)
    }
  }
  treeLists.forEach(search)
  return found
}

/** 证据路径 → 组件实际 domPath（命名空间映射） */
const normalizeDomPath = (path) => {
  let domPath = path
  PATH_REPLACEMENTS.forEach(([re, replacement]) => { domPath = domPath.replace(re, replacement) })
  return domPath
}

// ============ 模块二：DOM 匹配（属性查询） ============
/** 查询所有 data-evidence-field 元素并按 predicate 过滤，返回数组 */
const queryEvidenceFields = (predicate) =>
  [...document.querySelectorAll('[data-evidence-field]')].filter(predicate)

/**
 * 将证据 domPath 解析为实际定位的 DOM 集合及高亮参数。
 * 匹配优先级：整列(COLUMN_MATCH_MAP) → 精确 → 整行兜底(以]结尾) → 子数组父级(含table) → 末尾字段缺失回退
 * @returns {{ targetDoms: Element|Element[]|null, highlightMode: 'row'|'self', needHighlight: boolean }}
 */
const resolveTargetDoms = (domPath) => {
  // 1. 病案首页整列字段
  const colRule = COLUMN_MATCH_MAP.find(([key]) =>
    new RegExp(`^basic_information\\.${key}(?:\\[\\d+\\])?$`).test(domPath)
  )
  if (colRule) {
    const [, prefix, suffix] = colRule
    const doms = queryEvidenceFields(el => {
      const v = el.getAttribute('data-evidence-field')
      return v.startsWith(prefix) && v.endsWith(suffix)
    })
    return { targetDoms: doms, highlightMode: 'self', needHighlight: true }
  }

  // 2. 精确匹配
  let targetDoms = document.querySelector(`[data-evidence-field="${domPath}"]`)
  let highlightMode = 'self'
  let needHighlight = true

  // 3. 整行兜底（路径以 ] 结尾）
  if (!targetDoms && /\]$/.test(domPath)) {
    const rowDoms = queryEvidenceFields(el =>
      el.getAttribute('data-evidence-field')?.startsWith(domPath + '.')
    )
    if (rowDoms.length) { targetDoms = rowDoms; highlightMode = 'row' }
  }

  // 4. 子数组父级兜底（命中含 table 的容器，需下钻到内部单元格）
  if (!targetDoms || targetDoms?.querySelector?.('table')) {
    const arrDoms = queryEvidenceFields(el =>
      el.getAttribute('data-evidence-field')?.startsWith(domPath + '[')
    )
    if (arrDoms.length) targetDoms = arrDoms
  }

  // 5. 末尾字段缺失回退（...[N].字段 不存在 → 回退 [N] 表单项，仅定位不高亮）
  if (!targetDoms) {
    const m = domPath.match(/^(.*\[\d+\])\.([a-zA-Z_]\w*)$/)
    if (m) {
      const itemDoms = queryEvidenceFields(el =>
        el.getAttribute('data-evidence-field')?.startsWith(m[1] + '.')
      )
      if (itemDoms.length) { targetDoms = itemDoms; needHighlight = false }
    }
  }

  return { targetDoms, highlightMode, needHighlight }
}

// ============ 模块三：DOM 操作（滚动） ============
/** 平滑滚动到目标位置（easeInOutCubic 缓动） */
const slowScrollTo = (scrollEl, targetTop, duration = LOCATE_CONFIG.scrollDuration) => {
  const startTop = scrollEl.scrollTop
  const distance = targetTop - startTop
  if (Math.abs(distance) < 5) return
  const startTime = performance.now()
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
  const animate = (now) => {
    const progress = Math.min((now - startTime) / duration, 1)
    scrollEl.scrollTop = startTop + distance * easeInOutCubic(progress)
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

/** 将目标元素滚动到可视区域（优先使用右侧滚动容器平滑滚动） */
const scrollElementIntoView = (firstDom) => {
  const rightContent = firstDom.closest('.right-content')
  if (!rightContent) {
    firstDom.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  const scrollWrap = rightContent.querySelector('.el-scrollbar__wrap')
  if (!scrollWrap) {
    firstDom.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  const containerRect = scrollWrap.getBoundingClientRect()
  const targetRect = firstDom.getBoundingClientRect()
  const offsetTop = targetRect.top - containerRect.top + scrollWrap.scrollTop - containerRect.height * LOCATE_CONFIG.scrollOffsetRatio
  slowScrollTo(scrollWrap, offsetTop)
}

// ============ 模块四：编排（定位 + 高亮，带失败重试） ============
/** 执行定位+高亮，DOM 未就绪时按配置重试 */
const startLocateAndHighlight = (rawPath) => {
  let retryCount = 0
  const tryOnce = () => {
    const domPath = normalizeDomPath(rawPath)
    const { targetDoms, highlightMode, needHighlight } = resolveTargetDoms(domPath)
    const hasTargets = targetDoms && (Array.isArray(targetDoms) ? targetDoms.length : true)
    if (hasTargets) {
      const firstDom = Array.isArray(targetDoms) ? targetDoms[0] : targetDoms
      scrollElementIntoView(firstDom)
      if (needHighlight) triggerHighlight(targetDoms, highlightMode)
    } else if (retryCount < LOCATE_CONFIG.maxRetries) {
      retryCount++
      setTimeout(tryOnce, LOCATE_CONFIG.retryDelay)
    }
  }
  setTimeout(tryOnce, LOCATE_CONFIG.initialDelay)
}

// ============ 模块五：N1-N5 独立倒计时 ============
// 时长取「配置管理 - 自动保存时间」里对应 N 的范围（默认 30-40s），每次随机落点；
// 无操作 / 倒计时归零后自动保存当前 N，并进入下一个 N 或下一份病历。
const DEFAULT_COUNTDOWN_RANGE = { min: 30, max: 40 }

// 当前 N 的配置范围
const currentCountdownRange = computed(() => {
  const config = getSystemConfig()
  const range = config?.autoSaveRanges?.[step.value - 1] || DEFAULT_COUNTDOWN_RANGE
  const min = Number(range.min) || DEFAULT_COUNTDOWN_RANGE.min
  const max = Number(range.max) || DEFAULT_COUNTDOWN_RANGE.max
  return { min, max: Math.max(min, max) }
})

// 供界面展示的范围文案，如 30-40s
const countdownRangeText = computed(() => {
  const { min, max } = currentCountdownRange.value
  return min === max ? `${min}s` : `${min}-${max}s`
})

// 倒计时结束后要去的地方：下一个 N 名称 / 下一份病历
const countdownNextLabel = computed(() => {
  if (step.value < steps.value.length) {
    const next = steps.value[step.value]
    return `N${next.id} ${next.name}`
  }
  return isLastLoop.value ? '下一份病历' : '下一个 Loop'
})

// 在范围内随机取一个时长，避免每个 N 都整 30 秒
const getStepCountdownSeconds = () => {
  const { min, max } = currentCountdownRange.value
  if (max <= min) return min
  return Math.floor(min + Math.random() * (max - min + 1))
}

// 重新开始当前 N 的倒计时（切换步骤 / 进入编辑时调用）
const startStepCountdown = () => {
  stop()
  start(getStepCountdownSeconds())
}

// 倒计时结束：保存当前 N，自动进入下一个 N；N5 结束后进入下一个 Loop 或下一份病历
async function handleStepIdle() {
  if (!isEdit.value) return
  if (isDemoView.value) {
    const nodeData = demoCotRef.value?.getFormData()
    if (nodeData) commitDemoNode(nodeData)
    markStepDone(step.value)
    medicalStore.clearDirty()

    // N1-N4：保持编辑态，自动推进到下一个 N 并重启倒计时
    if (step.value < steps.value.length) {
      const finished = step.value
      step.value += 1
      lastSavedTime.value = demoNodesAnnotation.value[COT_NODE_KEYS[step.value]]?.node_temporal_anchor?.anchor_timestamp || lastSavedTime.value
      resetRightPanelScroll()
      startStepCountdown()
      ElMessage.info(`N${finished} 已自动保存，进入 N${step.value} ${currentStepName.value}`)
      return
    }

    // N5：当前 Loop 标记为已完成，自动进入下一个 Loop 并保持编辑态
    const finishedLoop = tabList.value.find(item => item.loopId === activeTabId.value)
    const loopIndex = tabList.value.findIndex(item => item.loopId === activeTabId.value)
    markLoopDone(activeTabId.value)
    if (loopIndex > -1 && loopIndex < tabList.value.length - 1) {
      const nextLoop = tabList.value[loopIndex + 1]
      switchDemoLoop(nextLoop.loopId, { keepEdit: true })
      ElMessage.success(`「${finishedLoop?.loopName || ''}」校对完成，已进入下一个 Loop「${nextLoop.loopName}」N${step.value} 编辑态`)
      return
    }

    // 最后一个 Loop：进入下一份病历的查看态
    if (await enterNextDemoRecord()) return

    exitDemoEdit()
    ElMessage.success('已是最后一份病历，全部校对完成')
    return
  }

  // 真实链路：静默保存当前步骤后推进
  await handleRealStepIdle()
}

async function handleRealStepIdle() {
  try {
    await temporaryStorageCotData(2)
  } catch (error) {
    console.error('自动保存失败:', error)
  }
  if (step.value < steps.value.length) {
    step.value += 1
    startStepCountdown()
    return
  }
  isEdit.value = false
  if (tabList.value.findIndex(item => item.loopId === activeTabId.value) === tabList.value.length - 1) {
    saveForm()
  } else {
    await getMedicalContent()
  }
}

const { start, stop, remaining } = useIdle(30, handleStepIdle)

watch(
  () => medicalPathStore.activeHighlightPath,
  async (newPath) => {
    if (!newPath) return
    const targetValue = resolveTreeTargetValue(newPath)
    const targetNode = targetValue && findTreeNode(targetValue, [medicalTypeListStep.value, medicalTypeList.value])
    if (!targetNode) return

    // 切换树节点 / 病历组件
    if (treeRef.value?.setCurrentKey) treeRef.value.setCurrentKey(targetNode.id)
    if (typeof handleNodeClick === 'function') await handleNodeClick(targetNode)

    nextTick(() => startLocateAndHighlight(newPath))
  }
)
</script>

<style scoped lang="scss">
@use '@/components/fileManage/jiaodui/proofreadMedicalJiaoDui.scss';

// 水印定位基准
.proofreadMedical {
  position: relative;
}

// 右上角悬浮广告位：贴屏幕顶边，浮于页面之上
.ad-float {
  overflow: hidden;
  position: fixed;
  right: 24px;
  top: 0;
  z-index: 2100;
  width: 336px;
  height: 126px;
  border-radius: 0 0 14px 14px;
  box-shadow: 0 12px 32px rgba(15, 36, 88, 0.3), 0 2px 6px rgba(15, 36, 88, 0.16);
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  animation: adDropIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;

  .ad-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ad-tag {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 0 6px;
    border-radius: 6px 0 0 0;
    background: rgba(8, 24, 60, 0.34);
    line-height: 18px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.92);
  }

  .ad-close {
    display: flex;
    position: absolute;
    right: 9px;
    top: 8px;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(8, 24, 60, 0.28);
    opacity: 0.6;
    line-height: 1;
    font-size: 18px;
    color: #fff;
    transition: opacity 0.2s, background 0.2s;

    &:hover {
      background: rgba(8, 24, 60, 0.66);
    }
  }

  &:hover {
    box-shadow: 0 16px 40px rgba(15, 36, 88, 0.36), 0 2px 8px rgba(15, 36, 88, 0.2);
    transform: translateY(2px);

    .ad-close {
      opacity: 1;
    }
  }
}

@keyframes adDropIn {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
}

// 窄屏收缩，减少对内容的遮挡
@media (max-width: 1440px) {
  .ad-float {
    right: 22px;
  }
}

@media (max-width: 1280px) {
  .ad-float {
    right: 14px;
    width: 312px;
    height: 117px;
  }
}

// 当前 N 阶段下方的倒计时提示
.stepTimerTip {
  display: inline-flex;
  position: absolute;
  left: 50%;
  top: calc(100% + 8px);
  z-index: 31;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 1px solid #d8e4ff;
  border-radius: 14px;
  background: var(--theme-primary-soft);
  line-height: 1;
  font-size: 15px;
  color: #6d7d9c;
  white-space: nowrap;
  transform: translateX(-50%);

  // 首尾节点：靠边对齐，避免溢出卡片
  &.is-first {
    left: 0;
    transform: none;
  }

  &.is-last {
    left: auto;
    right: 0;
    transform: none;
  }

  i {
    margin-right: 3px;
    font-size: 15px;
    color: #3670f8;
  }

  b {
    margin-right: 2px;
    font-family: D-DIN, Menlo, monospace;
    font-weight: 700;
    font-size: 16px;
    color: #3670f8;
  }

  em {
    font-style: normal;
  }

  &.is-urgent {
    border-color: #ffd7d5;
    background: var(--theme-fill);
    color: #ff8a80;

    i,
    b {
      color: #ff4d4f;
    }
  }
}

// 步骤之间的连线
.stepContainer .line {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
}

// 演示模式：左侧原始病历结构化面板撑满 .left 剩余高度
.demo-emr-wrap {
  flex: 1;
  min-height: 0;
  margin: 0 12px 12px;
}

// 演示模式：右侧校对数据面板占满剩余宽度
.demo-cot-wrap {
  flex: 1;
  min-width: 0;
  margin-bottom: 12px;
}

.cot-scrollbar {
  height: 100%;
}

// 审核未通过原因展示
.reject-reason {
  margin-left: 8px;
  font-size: 13px;
  color: #f56c6c;
}

// ==================== 证据字段整行背景色高亮 ====================
// 高亮目标所在整行 <tr>，覆盖所有列（含序号列）

:deep(.evidence-row-highlight) {
  background-color: rgba(255, 242, 212, 1) !important;
  animation: highlightPulse 1.5s ease-in-out;
}

@keyframes highlightPulse {
  0% { background-color: rgba(255, 242, 212, 0); }
  35% { background-color: rgba(255, 242, 212, 0.8); }
  100% { background-color: rgba(255, 242, 212, 1); }
}
</style>
