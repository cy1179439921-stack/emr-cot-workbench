export const containerList = [
  {
    id: 1,
    name: '文字',
    type: 'TextComponent',
    icon: 'icon-wenzi',
    option: {
      content: '文本内容'
    },
    style: {}
  },
  {
    id: 2,
    name: '单行文本输入框',
    type: 'InputComponent',
    icon: 'icon-danhangwenben',
    option: {
      name: '单行名称',
      placeholder: '识别内容',
      type: '字符串',
      lenght: 20
    },
    style: {}
  },
  {
    id: 3,
    name: '多行文本输入框',
    type: 'TextAreaComponent',
    icon: 'icon-duohangwenbenkuang',
    option: {
      name: '多行名称',
      placeholder: '识别内容',
      type: '字符串',
      lenght: 2000
    },
    style: {}
  },
  {
    id: 4,
    name: '单选',
    type: 'RadioComponent',
    icon: 'icon-danxuan1',
    option: {
      name: '单选名称',
      options: ['默认项']
    },
    style: {}
  },
  {
    id: 5,
    name: '多选',
    type: 'CheckComponent',
    icon: 'icon-duoxuan1',
    option: {
      name: '多选名称',
      options: ['默认项']
    },
    style: {}
  },
  {
    id: 6,
    name: '填空',
    type: 'FillComponent',
    icon: 'icon-tiankong',
    option: {
      name: '填空名称',
      options: [{
        lable: '内容',
        value: '识别内容'
      }]
    },
    style: {}
  },
  {
    id: 7,
    name: '表格',
    type: 'TableComponent',
    icon: 'icon-biaoge',
    option: {
      name: '表格名称',
      localRow: 6,
      localColumn: 6,
      tableData: []
    },
    style: {}
  },
  {
    id: 8,
    name: '图片',
    type: 'ImageComponent',
    icon: 'icon-tupian',
    option: {
      name: '图片名称'
    },
    style: {}
  },
  {
    id: 100,
    name: '两栏布局容器',
    type: 'LayoutContainer',
    icon: 'icon-buju-erlan',
    children: [],
    option: {},
    style: {}
  }
]

export const transformInspect = (data) => {
  const { inspectionContent, content } = data
  if (inspectionContent && Array.isArray(inspectionContent) && inspectionContent.length > 0) {
    const data = inspectionContent.map((item) => {
      try {
        return JSON.parse(item)
      } catch (error) {
        return [item]
      }
    })
    try {
      const header = Object.keys(data[0])
      // content.inspectionContent = []
      // content.inspectionContent.push(header)
      // data.forEach(item => {
      //   const data = Object.values(item)
      //   content.inspectionContent.push(data)
      // })
      content.isSpenction = true
      content.inspectionContent = {
        header,
        data
      }
    } catch (error) {
      console.log(error)
    }
  }
}
