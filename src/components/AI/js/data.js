import { ref } from 'vue'

export const outlineHTML = (arr) => {
  let stringHtml = ''
  arr.forEach(item => {
    stringHtml += `
    <div class="content-item-template">
      <div type="text" class="yt-div-edit ellipsis">${item.title}</div>
      <div class="item-content">
        <div class="keywords"> 
          <div><i class="iconfont icon-zhishitubiao"></i><span>关键词：</span></div>
          <div class="label">
            ${item.keywords && item.keywords.length > 0 ? item.keywords.map(tip => `<span class="tip">${tip}</span>`).join('') : ''}
          </div>
        </div>
        <div class="searchPurpose"><i class="iconfont icon-zhishitubiao"></i><span>检索目的：${item.target}</span></div>
      </div>
      <div class="subtitle">
          ${item.children && item.children.length > 0
    ? item.children.map(tip => `
            <div class="subtitleItemContainer">
                  <i class="iconfont icon-erjibiaoshi"></i>
              <div type="text" class="yt-div-edit ellipsis" :title="value">${tip.title}</div>
          </div>`).join('')
    : ''}
      </div>
    </div>
  `
  })
  return stringHtml
}

// 处理大纲为需要的格式
export const aiLiteratureDataHandler = (data) => {
  console.log('data', data)
  return data.map((item, index) => {
    const id = index + 1
    return {
      ...item,
      id,
      ref: ref(null),
      menuTitle: id + '. ' + item.title,
      children: item.subsections.map((it, index) => {
        const childrenId = index + 1
        return {
          id: childrenId,
          parentId: id,
          title: it,
          ref: ref(null),
          menuTitle: id + '.' + childrenId + ' ' + it
        }
      })
    }
  })
}

export const aiLiteratureDataHandler2 = (data) => {
  console.log('data', data)
  return data.map((item, index) => {
    const id = index + 1
    return {
      ...item,
      id,
      ref: ref(null),
      menuTitle: id + '. ' + item.title,
      children: item.children.map((it, index) => {
        const childrenId = index + 1
        return {
          id: childrenId,
          parentId: id,
          title: it.title,
          ref: ref(null),
          menuTitle: id + '.' + childrenId + ' ' + it.title
        }
      })
    }
  })
}

// 还原大纲格式
export const aiLiteratureDataRestore = (data) => {
  return data.map(item => {
    return {
      title: item.title,
      keywords: item?.keywords || undefined,
      target: item?.target || undefined,
      subsections: item?.children?.map(it => it.title) || []
    }
  })
}

// 对大纲格式数据拼接字符串
export const aiLiteratureDataString = (data) => {
  let text = ''
  data.forEach(item => {
    text += item.title
    if (item.children && item.children.length > 0) {
      text += '：'
      item.children.forEach((it, itIndex) => {
        if (itIndex === item.children.length - 1) {
          // 最后一个，结尾为。
          text += `${it.title}。`
        } else {
          // 中间子标题，结尾为;
          text += `${it.title}；`
        }
      })
    } else {
      text += '。'
    }
  })
  return text
}
