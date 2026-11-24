import { createRouter, createWebHistory } from 'vue-router'
import { showVersionUpdatePrompt } from '@/utils/versionChecker'
import { keepShareCodeInUrl } from '@/utils/shareCode'
const history = createWebHistory()
const home = () => import('../views/home.vue')
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/',
    name: 'home',
    component: home,
    // redirect: '/medicalRecord/index',
    children: [
      // 首页（原专家工作台）：放在菜单最上方，登录后默认进入
      {
        name: 'expertWorkbench',
        path: '/expertWorkbench',
        title: '首页',
        type: 0,
        icon: 'icon-shouye',
        component: () => import('../components/cot/expertWorkbench.vue')
      },
      // 入驻申请（专家端填写入驻申请，后台在「入驻审核管理」中审核）
      {
        name: 'onboardingAudit',
        path: '/onboardingAudit',
        title: '入驻申请',
        type: 0,
        icon: 'icon-ruzhuguanli',
        component: () => import('../components/expertManagement/onboardingApply.vue')
      },
      // {
      //   name: 'homePage',
      //   path: '/homePage',
      //   title: '首页',
      //   type: 0,
      //   icon: 'icon-a-1',
      //   component: () => import('../views/homePage.vue')
      // },
      {
        name: 'dataBoard',
        path: '/dataBoard',
        title: '数据统计',
        type: 0,
        icon: 'icon-a-2',
        component: () => import('../components/dataBoard/newDataBoard.vue')
      },
      {
        name: 'cotAnnotation',
        path: '/cotAnnotation',
        title: '标注',
        type: 1,
        icon: 'icon-COTbiaozhu-copy',
        meta: {
          activeName: 'medicalRecordProofreading'
        },
        component: () => import('../components/fileManage/jiaodui/proofreadMedicalJiaoDui.vue'),
        props: { isMedicalRecordProofreading: true }
      },
      {
        name: 'cotAnnotation1',
        path: '/cotAnnotation1',
        title: '标注',
        type: 1,
        icon: 'icon-COTbiaozhu-copy',
        meta: {
          activeName: 'expertWorkbench'
        },
        component: () => import('../components/fileManage/jiaodui/proofreadMedicalJiaoDui.vue'),
        props: { isMedicalRecordProofreading: true }
      },
      {
        name: 'medicalRecordProofreading',
        path: '/medicalRecordProofreading',
        title: 'COT标注',
        type: 0,
        icon: 'icon-COTbiaozhu-copy',
        component: () => import('../components/cot/cotAnnotationPage.vue')
      },
      {
        name: 'laborSign',
        path: '/laborSign',
        title: '劳务签署',
        type: 0,
        icon: 'icon-laowuqianshu',
        component: () => import('../components/cot/laborSign.vue')
      },
      {
        name: 'laborSettlement',
        path: '/laborSettlement',
        title: '劳务结算',
        type: 0,
        icon: 'icon-laowujiesuan',
        component: () => import('../components/cot/laborSettlement.vue')
      },
      {
        name: 'proofreadingManagement',
        path: '/proofreadingManagement',
        title: '标注管理',
        type: 0,
        icon: 'icon-biaozhuguanli-copy',
        // 移除页面内二级标签导航，病历池/任务管理作为左侧菜单的子菜单项展示
        // component: () => import('../components/research/proofreadingManagement.vue'),
        redirect: '/proofreadingManagement/medicalRecordPool',
        children: [
          { name: 'medicalRecordPool', path: '/proofreadingManagement/medicalRecordPool', title: '病历池', meta: { activeName: 'proofreadingManagement' }, component: () => import('../components/research/medicalRecordPool.vue') },
          { name: 'taskManagement', path: '/proofreadingManagement/taskManagement', title: '任务管理', meta: { activeName: 'proofreadingManagement' }, component: () => import('../components/research/taskManagement.vue') }
        ]
      },
      // 旧 COT 校对子路由（已被 COT 标注 / 专家工作台等模块替换）
      // {
      //   name: 'proofreadMedical',
      //   path: '/fileManage/proofreadMedical',
      //   title: '校对病历',
      //   type: 1,
      //   meta: {
      //     activeName: 'cotAnnotation'
      //   },
      //   component: () => import('../components/fileManage/jiaodui/proofreadMedicalJiaoDui.vue')
      // },
      {
        name: 'viewProofreadMedical',
        path: '/fileManage/proofreadMedical',
        title: '校对病历',
        type: 1,
        meta: {
          activeName: 'proofreadingManagement'
        },
        component: () => import('../components/fileManage/jiaodui/proofreadMedicalJiaoDui.vue')
      },
      {
        name: 'taskDetail',
        path: '/proofreadingManagement/taskDetail',
        title: '任务详情',
        type: 1,
        meta: {
          activeName: 'proofreadingManagement'
        },
        component: () => import('../components/research/taskDetail.vue')
      },
      {
        name: 'auditMedical',
        path: '/proofreadingManagement/auditMedical',
        title: '病历审核',
        type: 1,
        meta: {
          activeName: 'proofreadingManagement'
        },
        component: () => import('../components/fileManage/jiaodui/proofreadMedicalJiaoDui.vue')
      },
      {
        name: 'checkInAuditManage',
        path: '/expertManagement/checkInAuditManage',
        title: '入驻审核管理',
        type: 0,
        icon: 'icon-ruzhuguanli',
        component: () => import('../components/expertManagement/checkInAuditManage.vue')
      },
      {
        name: 'checkInAuditManageDetail',
        path: '/expertManagement/checkInAuditManageDetail',
        title: '入驻审核管理',
        type: 1,
        meta: {
          activeName: 'checkInAuditManage' // 切换此路由时，左侧导航高亮
        },
        component: () => import('../components/expertManagement/checkInAuditManageDetail.vue')
      },
      {
        name: 'contractManagement',
        path: '/expertManagement/contractManagement',
        title: '劳务合同管理',
        type: 0,
        icon: 'icon-laowuhetongguanli',
        component: () => import('../components/expertManagement/contractManagement.vue')
      },
      {
        name: 'contractManagementDetail',
        path: '/expertManagement/contractManagementDetail',
        title: '劳务合同管理',
        type: 1,
        meta: {
          activeName: 'contractManagement'
        },
        icon: 'icon-laowuhetongguanli',
        component: () => import('../components/expertManagement/contractManagementDetail.vue')
      },
      {
        name: 'invoiceManagement',
        path: '/invoiceManagement',
        title: '结算单管理',
        type: 0,
        icon: 'icon-jiesuandanguanli',
        // component: () => import('../components/expertManagement/contractManagement.vue')
        children: [
          {
            name: 'invoiceList',
            path: '/invoiceManagement/invoiceList',
            title: '结算单列表',
            meta: {
              activeName: 'invoiceManagement'
            },
            component: () => import('../components/expertManagement/invoiceList.vue')
          },
          {
            name: 'invoiceListDetail',
            path: '/invoiceManagement/invoiceListDetail',
            title: '结算单管理详情',
            hidden: true,
            meta: {
              activeName: 'invoiceManagement'
            },
            component: () => import('../components/expertManagement/invoiceListDetail.vue')
          },
          {
            name: 'invoiceListEdit',
            path: '/invoiceManagement/invoiceListEdit',
            title: '结算单管理编辑',
            hidden: true,
            meta: {
              activeName: 'invoiceManagement'
            },
            component: () => import('../components/expertManagement/invoiceListEdit.vue')
          },
          {
            name: 'archivingInvoiceList',
            path: '/invoiceManagement/archivingInvoiceList',
            title: '归档结算单',
            meta: {
              activeName: 'invoiceManagement'
            },
            component: () => import('../components/expertManagement/archivingInvoiceList.vue')
          },
          {
            name: 'archivingInvoiceDetail',
            path: '/invoiceManagement/archivingInvoiceDetail',
            title: '归档结算单详情',
            hidden: true,
            meta: {
              activeName: 'invoiceManagement'
            },
            component: () => import('../components/expertManagement/invoiceListDetail.vue')
          }
        ]

      },
      {
        name: 'manage',
        path: '/manage',
        title: '系统管理',
        type: 0,
        icon: 'icon-a-5',
        // redirect: '/research/researchQueue',
        children: [
          {
            name: 'userManage',
            path: '/manage/userManage',
            title: '用户管理',
            meta: {
              activeName: 'manage'
            },
            component: () => import('../components/manage/userManage.vue')
          },
          {
            name: 'departmentManagement',
            path: '/manage/departmentManagement',
            title: '科室管理',
            meta: {
              activeName: 'manage'
            },
            component: () => import('../components/manage/departmentManagement.vue')
          },
          {
            name: 'institutionManage',
            path: '/manage/institutionManage',
            title: '医院管理',
            meta: {
              activeName: 'manage'
            },
            component: () => import('../components/manage/institutionManage.vue')
          },
          {
            name: 'roleManage',
            path: '/manage/roleManage',
            title: '角色权限管理',
            meta: {
              activeName: 'manage'
            },
            component: () => import('../components/manage/roleManage.vue')
          },
          {
            name: 'configManagement',
            path: '/manage/configManagement',
            title: '配置管理',
            meta: {
              activeName: 'manage'
            },
            component: () => import('../components/manage/configManagement.vue')
          }

          // {
          //   name: 'indexDictionary',
          //   path: '/manage/indexDictionary',
          //   title: '指标字典',
          //   meta: {
          //     activeName: 'manage'
          //   },
          //   component: () => import('../components/manage/indexDictionary.vue')
          // },
          // {
          //   name: 'form',
          //   path: '/manage/form',
          //   title: 'CRF表单',
          //   meta: {
          //     activeName: 'manage'
          //   },
          //   component: () => import('../components/draggable/draggable.vue')
          // },
          // {
          //   name: 'authentication',
          //   path: '/manage/authentication',
          //   title: '产品认证',
          //   meta: {
          //     activeName: 'manage'
          //   },
          //   component: () => import('../components/authentication/authentication.vue')
          // },
          // {
          //   name: 'operationLog',
          //   path: '/manage/operationLog',
          //   title: '操作日志',
          //   meta: {
          //     activeName: 'manage'
          //   },
          //   component: () => import('../components/manage/operationLog.vue')
          // },
          // {
          //   name: 'authenticationApplication',
          //   path: '/manage/authenticationApplication',
          //   title: '认证应用',
          //   meta: {
          //     activeName: 'manage'
          //   },
          //   component: () => import('../components/manage/authenticationApplication.vue')
          // },
          // {
          //   name: 'scientificResearchConfiguration',
          //   path: '/manage/scientificResearchConfiguration',
          //   title: '科研配置',
          //   meta: {
          //     activeName: 'manage'
          //   },
          //   component: () => import('../components/researchManagement/researchConfigurationHome.vue')
          // }
        ]
      }
      // {
      //   name: 'manageBackend',
      //   path: '/manageBackend',
      //   title: '管理后台',
      //   type: 0,
      //   icon: 'icon-a-6',
      //   // redirect: '/research/researchQueue',
      //   children: [
      //     {
      //       name: 'platformInfo',
      //       path: '/manageBackend/platformInfo',
      //       title: '平台信息',
      //       meta: {
      //         activeName: 'manageBackend' // 切换此路由时，左侧导航栏仍为管理后台
      //       },
      //       component: () => import('../components/manageBackend/platformInfo.vue')
      //     },
      //     {
      //       name: 'safetyManagement',
      //       path: '/manageBackend/safetyManagement',
      //       title: '安全管理',
      //       meta: {
      //         activeName: 'manageBackend'
      //       },
      //       component: () => import('../components/manageBackend/safetyManagement.vue')
      //     },
      //     {
      //       name: 'leakagePrevention',
      //       path: '/manageBackend/leakagePrevention',
      //       title: '防泄露管理',
      //       meta: {
      //         activeName: 'manageBackend'
      //       },
      //       component: () => import('../components/manageBackend/leakagePrevention.vue')
      //     },
      //     {
      //       name: 'fileDownload',
      //       path: '/manageBackend/fileDownload',
      //       title: '原文件库',
      //       meta: {
      //         activeName: 'manageBackend'
      //       },
      //       component: () => import('../components/manageBackend/fileDownload.vue')
      //     }
      //   ]
      // },
      // {
      //   name: 'medicalDetails',
      //   path: '/medicalRecord/medicalDetails',
      //   title: '就诊详情',
      //   type: 0,
      //   meta: {
      //     keepAlive: true, // 缓存页面
      //     independent: true
      //   },
      //   icon: 'icon-a-11',
      //   component: () => import('../components/medicalRecord/medicalDetails.vue')
      // },
      // {
      //   name: 'patientHomePage',
      //   path: '/medicalRecordLibrary/patientHomePage',
      //   title: '患者主页',
      //   type: 0,
      //   meta: {
      //     activeName: 'medicalRecordLibrary', // 此值是动态改变的，病历库进入就是medicalRecordLibrary，研究队列进入就是researchQueue
      //     independent: true,
      //     keepAlive: true // 缓存页面
      //   },
      //   icon: 'icon-a-10',
      //   component: () => import('../components/medicalRecord/patientDetails.vue')
      // },
      // {
      //   name: 'AI',
      //   path: '/AI',
      //   title: 'AI',
      //   type: 1,
      //   component: () => import('../views/AI.vue')
      // },
      // {
      //   name: 'deepseek',
      //   path: '/deepseek',
      //   title: 'deepseek',
      //   type: 1,
      //   component: () => import('../views/deepseek.vue')
      // },
      // {
      //   name: 'doubao',
      //   path: '/doubao',
      //   title: 'doubao',
      //   type: 1,
      //   component: () => import('../views/doubao.vue')
      // }
    ]
  }
  // {
  //   path: '/Auth',
  //   name: 'Auth',
  //   component: () => import('../views/Auth.vue')
  // }
  // {
  //   path: '/',
  //   name: '',
  //   redirect: '/medicalRecord/index'
  // }
]
const router = createRouter({
  history,
  routes
})

// 可以监听路由拦截，比如权限验证。
// router.beforeEach((to, from, next) => {
//   // 1. 每个条件执行后都要跟上 next() 或 使用路由跳转 api 否则页面就会停留一动不动
//   // 2. 要合理的搭配条件语句，避免出现路由死循环。
//   const token = localStorage.getItem('token')
//   if (to.meta.auth) {
//     if (!token) {
//       return router.replace({
//         name: 'login'
//       })
//     }
//     next()
//   } else {
//     console.log('to', to)
//     next()
//   }
// })

// 公网预览分享码保活：站内跳转会丢掉 ?sharecode=，这里每次切换后补回，
// 保证地址栏始终是可分享的完整链接（缺失时网关会返回「链接不完整」）
router.afterEach(() => {
  keepShareCodeInUrl()
})

// 路由错误拦截：动态导入模块失败时提示更新
router.onError((error) => {
  console.log('[版本检测] 路由错误拦截:', error.message)

  // 匹配多种动态导入失败的错误信息
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed') ||
    error.message.includes('error loading dynamically imported module')
  ) {
    showVersionUpdatePrompt()
  }
})
export default router
