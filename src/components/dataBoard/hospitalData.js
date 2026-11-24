
export default [
  {
    // parent: ['china'],
    name: '全国',
    adcode: '000000', // adcode为地图数据展示id
    Belong: [],
    webLevel: 'china',
    hospitalCode: '000000', // hospitalCode为医院数据展示id
    coords: [
      [118.187759, 36.376092],
      [120.24, 28.55, 10]
    ], // 线条位置[开始位置，结束位置]
    children: [
      {
        parent: ['china'],
        name: '山东省',
        adcode: 370000, // adcode为地图数据展示id
        Belong: [1, 2, 3],
        webLevel: 'province',
        hospitalCode: 370000, // hospitalCode为医院数据展示id
        coords: [
          [118.187759, 36.376092],
          [120.24, 30.55, 8]
        ], // 线条位置[开始位置，结束位置]
        children: [
          {
            parent: ['山东省'],
            name: '济南市',
            adcode: 370100,
            Belong: [3],
            hospitalCode: 370100,
            webLevel: 'city',
            coords: [
              [116.75199, 36.55358, 100],
              [117.853198, 38.76, 100]
            ], // 线条位置[开始位置，结束位置]
            childrenCode: ['jn_zhongqurenmin', 'jn_qfs', 'jn_shanghe'],
            children: [
              {
                parent: ['济南市', '济南市市中区人民医院'],
                name: '济南市市中区人民医院',
                grade: '二级甲等',
                adcode: 370100,
                Belong: [3],
                hospitalCode: 'jn_zhongqurenmin',
                webLevel: 'hospital',
                coords: [
                  [117.005569, 36.600994, 100],
                  [117.005569, 36.2, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['济南市', '山东省千佛山医院'],
                name: '山东省千佛山医院',
                // 山东第一医科大学第一附属医院
                grade: '三级甲等',
                adcode: 370100,
                Belong: [3],
                hospitalCode: 'jn_qfs',
                webLevel: 'hospital',
                coords: [
                  [117.04293994068146, 36.647395416646624, 100],
                  [116.198, 36.647395416646624, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['济南市', '商河县人民医院'],
                name: '商河县人民医院',
                grade: '二级甲等',
                adcode: 370100,
                Belong: [3],
                hospitalCode: 'jn_shanghe',
                webLevel: 'hospital',
                coords: [
                  [117.049034, 37.407764, 100],
                  [117.53198, 37.407764, 100]
                ] // 线条位置[开始位置，结束位置]
              }
            ]
          },
          {
            parent: ['山东省'],
            name: '德州市',
            adcode: 371400,
            Belong: [3],
            hospitalCode: 371400,
            webLevel: 'city',
            coords: [
              [116.29941, 37.45079, 100],
              [114.853198, 38, 100]
            ], // 线条位置[开始位置，结束位置]
            childrenCode: ['dz_qilu', 'dz_shili', 'dz_qihe', 'ebond_idl_rp_dev'],
            children: [
              {
                parent: ['德州市', '德州市立医院'],
                name: '德州市立医院',
                grade: '二级甲等',
                adcode: 371400,
                Belong: [3],
                hospitalCode: 'dz_shili',
                webLevel: 'hospital',
                coords: [
                  [116.310188, 37.460648, 100],
                  [115.453198, 37.523, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['德州市', '德州齐河县人民医院'],
                name: '德州齐河县人民医院',
                grade: '二级甲等',
                adcode: 371400,
                Belong: [3],
                hospitalCode: 'dz_qihe',
                webLevel: 'hospital',
                coords: [
                  // 手动定位得来的坐标
                  [116.7541701021385, 36.79400929713602, 100],
                  [116.9198, 36.7, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['德州市', '山东大学齐鲁医院德州医院'],
                name: '山东大学齐鲁医院德州医院',
                grade: '三级甲等',
                adcode: 371400,
                Belong: [3],
                // hospitalCode: 'ebond_idl_rp_dev',
                hospitalCode: 'dz_qilu',
                webLevel: 'hospital',
                coords: [
                  [116.853198, 37.450901, 100],
                  [117.0198, 37.7, 100]
                ] // 线条位置[开始位置，结束位置]
              }
            ]
          },
          {
            parent: ['山东省'],
            name: '济宁市',
            adcode: 370800,
            Belong: [3],
            hospitalCode: 370800,
            webLevel: 'city',
            coords: [
              [116.59649, 35.4082, 100],
              [115.853198, 34.232, 100]
            ], // 线条位置[开始位置，结束位置]
            childrenCode: ['jn_yanzhou', 'jn_wenshang', 'jn_diyirenmin'],
            children: [
              {
                parent: ['济宁市', '济宁市第一人民医院'],
                name: '济宁市第一人民医院',
                grade: '三级甲等',
                adcode: 370800,
                Belong: [3],
                hospitalCode: 'jn_diyirenmin',
                webLevel: 'hospital',
                coords: [
                  [116.690414, 35.413326, 100],
                  [115.553198, 35.0, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['济宁市', '汶上县人民医院'],
                name: '汶上县人民医院',
                grade: '二级甲等',
                adcode: 370800,
                Belong: [3],
                hospitalCode: 'jn_wenshang',
                webLevel: 'hospital',
                coords: [
                  [116.481873, 35.724819, 100],
                  [116.3198, 35.89, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['济宁市', '济宁市兖州区人民医院'],
                name: '济宁市兖州区人民医院',
                grade: '二级',
                adcode: 370800,
                Belong: [3],
                hospitalCode: 'jn_yanzhou',
                webLevel: 'hospital',
                coords: [
                  [116.824501, 35.54427, 100],
                  [116.953198, 35, 100]
                ] // 线条位置[开始位置，结束位置]
              }
            ]
          },
          {
            parent: ['山东省'],
            name: '青岛市',
            adcode: 370200,
            Belong: [3],
            hospitalCode: 370200,
            webLevel: 'city',
            coords: [
              [120.396298, 36.30744, 100],
              [121.853198, 36.4, 100]
            ], // 线条位置[开始位置，结束位置]
            childrenCode: ['qd_xihaian', 'qd_chengyangrenmin', 'qd_zhongxin', 'jz_dongfang'],
            children: [
              {
                parent: ['青岛市', '青岛市城阳区人民医院'],
                name: '青岛市城阳区人民医院',
                grade: '三级乙等',
                adcode: 370200,
                Belong: [3],
                hospitalCode: 'qd_chengyangrenmin',
                webLevel: 'hospital',
                coords: [
                  [120.400627, 36.301216, 100],
                  [119.553198, 36.8, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['青岛市', '青岛市黄岛区人民医院'],
                name: '青岛市黄岛区人民医院',
                grade: '三级综合',
                adcode: 370200,
                Belong: [3],
                hospitalCode: 'qd_xihaian',
                webLevel: 'hospital',
                coords: [
                  [119.995201, 35.877304, 100],
                  [119.53198, 35.7, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['青岛市', '青岛市中心医院'],
                name: '青岛市中心医院',
                grade: '三级甲等',
                adcode: 370200,
                Belong: [3],
                hospitalCode: 'qd_zhongxin',
                webLevel: 'hospital',
                coords: [
                  [120.376358, 36.139477, 100],
                  [120.8, 36, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['青岛市', '同济大学附属东方医院胶州医院'],
                name: '同济大学附属东方医院胶州医院',
                grade: '三级甲等',
                adcode: 370200,
                Belong: [3],
                hospitalCode: 'jz_dongfang',
                webLevel: 'hospital',
                coords: [
                  [120.010307, 36.280128, 100],
                  [118.6, 36.1, 100]
                ] // 线条位置[开始位置，结束位置]
              }
            ]
          },
          {
            parent: ['山东省'],
            name: '潍坊市',
            adcode: 370700,
            Belong: [3],
            hospitalCode: 370700,
            webLevel: 'city',
            coords: [
              [119.16607, 36.65458, 100],
              [119.853198, 38.0111, 100]
            ], // 线条位置[开始位置，结束位置]
            childrenCode: ['wf_renmin', 'wf_renmin2', 'wf_qingzhou'],
            children: [
              {
                parent: ['潍坊市', '青州市人民医院'],
                name: '青州市人民医院',
                grade: '二级甲等',
                adcode: 370700,
                Belong: [3],
                hospitalCode: 'wf_qingzhou',
                webLevel: 'hospital',
                coords: [
                  [118.481392, 36.695461, 100],
                  [117.853198, 36.3, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['潍坊市', '潍坊市第二人民医院'],
                name: '潍坊市第二人民医院',
                grade: '二级甲等',
                adcode: 370700,
                Belong: [3],
                hospitalCode: 'wf_renmin2',
                webLevel: 'hospital',
                coords: [
                  [119.137009, 36.708881, 100],
                  [119.453198, 36.4, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['潍坊市', '潍坊市人民医院'],
                name: '潍坊市人民医院',
                grade: '三级甲等',
                adcode: 370700,
                Belong: [3],
                hospitalCode: 'wf_renmin',
                webLevel: 'hospital',
                coords: [
                  [119.155769, 36.7239, 100],
                  [119.553198, 36.94, 100]
                ] // 线条位置[开始位置，结束位置]
              }
            ]
          },
          {
            parent: ['山东省'],
            name: '聊城市',
            adcode: 371500,
            Belong: [3],
            hospitalCode: 371500,
            webLevel: 'city',
            coords: [
              [115.98847, 36.43452, 100],
              [114.53198, 36.3, 100]
            ], // 线条位置[开始位置，结束位置]
            childrenCode: ['lc_renmin', 'lc_chiping', 'lc_linqing'],
            children: [
              {
                parent: ['聊城市', '聊城市人民医院'],
                name: '聊城市人民医院',
                grade: '三级甲等',
                adcode: 371500,
                Belong: [3],
                hospitalCode: 'lc_renmin',
                webLevel: 'hospital',
                coords: [
                  [116.02932, 36.452991, 100],
                  [115.853198, 36, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['聊城市', '临清市人民医院'],
                name: '临清市人民医院',
                grade: '二级甲等',
                adcode: 371500,
                Belong: [3],
                hospitalCode: 'lc_linqing',
                webLevel: 'hospital',
                coords: [
                  [115.746964, 36.82597, 100],
                  [115.93198, 37.0, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['聊城市', '聊城市茌平区人民医院'],
                name: '聊城市茌平区人民医院',
                grade: '二级甲等',
                adcode: 371500,
                Belong: [3],
                hospitalCode: 'lc_chiping',
                webLevel: 'hospital',
                coords: [
                  [116.249359, 36.578552, 100],
                  [116.353198, 36.3, 100]
                ] // 线条位置[开始位置，结束位置]
              }
            ]
          },
          {
            parent: ['山东省'],
            name: '临沂市',
            adcode: 371300,
            Belong: [3],
            hospitalCode: 371300,
            webLevel: 'city',
            coords: [
              [118.40184, 35.08729, 100],
              [118.853198, 34, 100]
            ], // 线条位置[开始位置，结束位置]
            childrenCode: ['ly_renmin', 'ly_laonian', 'ly_yishui'],
            children: [
              {
                parent: ['临沂市', '临沂市人民医院'],
                name: '临沂市人民医院',
                grade: '三级甲等',
                adcode: 371300,
                Belong: [3],
                hospitalCode: 'ly_renmin',
                webLevel: 'hospital',
                coords: [
                  [118.306763, 35.126251, 100],
                  [117.73198, 34.7, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['临沂市', '郯城县第一人民医院'],
                name: '郯城县第一人民医院',
                grade: '二级甲等',
                // 山东医学高等专科学校附属医院（
                adcode: 371300,
                Belong: [3],
                hospitalCode: 'ly_tancheng',
                webLevel: 'hospital',
                coords: [
                  [118.40184, 35.08729, 100],
                  [118.853198, 34.7, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['临沂市', '沂水县人民医院'],
                name: '沂水县人民医院',
                grade: '二级甲等',
                adcode: 371300,
                Belong: [3],
                hospitalCode: 'ly_yishui',
                webLevel: 'hospital',
                coords: [
                  [118.637497, 35.788391, 100],
                  [118.853198, 35.9, 100]
                ] // 线条位置[开始位置，结束位置]
              }
            ]
          },
          {
            parent: ['山东省'],
            name: '烟台市',
            adcode: 370600,
            Belong: [3],
            hospitalCode: 370600,
            webLevel: 'city',
            coords: [
              [121.26757, 37.49794, 100],
              [121.853198, 38, 100]
            ], // 线条位置[开始位置，结束位置]
            childrenCode: ['yt_haiyangrenmin', 'yt_penglai', 'yt_yuhuangding'],
            children: [
              {
                parent: ['烟台市', '海阳市人民医院'],
                name: '海阳市人民医院',
                grade: '二级甲等',
                adcode: 370600,
                Belong: [3],
                hospitalCode: 'yt_haiyangrenmin',
                webLevel: 'hospital',
                coords: [
                  [121.168617, 36.779362, 100],
                  [121.53198, 36.5, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['烟台市', '烟台市蓬莱人民医院'],
                name: '烟台市蓬莱人民医院',
                grade: '二级乙等',
                adcode: 370600,
                Belong: [3],
                hospitalCode: 'yt_penglai',
                webLevel: 'hospital',
                coords: [
                  [120.845642, 37.692532, 100],
                  [119.653198, 37.8, 100]
                ] // 线条位置[开始位置，结束位置]
              },
              {
                parent: ['烟台市', '烟台毓璜顶医院'],
                name: '烟台毓璜顶医院',
                grade: '三级甲等',
                adcode: 370600,
                Belong: [3],
                hospitalCode: 'yt_yuhuangding',
                webLevel: 'hospital',
                coords: [
                  [121.389542, 37.53627, 100],
                  [121.2198, 38.1, 100]
                ] // 线条位置[开始位置，结束位置]
              }
            ]
          }
        ]
      }
    ]
  }

]
