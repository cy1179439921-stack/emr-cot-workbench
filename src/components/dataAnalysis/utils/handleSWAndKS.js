export const handleSWAndKS = (tableData) => {
  if (tableData) {
    tableData.forEach(item => {
      // 使用正则表达式匹配两个数值
      const regular = /^(\d+\.\d+)\((\d+\.\d+)\)$/
      const matches = item['K-s'].match(regular)
      if (matches) {
        item['K-s-t'] = matches[1]
        item['K-s-p'] = matches[2]
      } else {
        item['K-s-t'] = '-'
        item['K-s-p'] = '-'
      }
      const matches2 = item['S-w'].match(regular)
      if (matches2) {
        item['S-w-t'] = matches2[1]
        item['S-w-p'] = matches2[2]
      } else {
        item['S-w-t'] = '-'
        item['S-w-p'] = '-'
      }
    })
  }
  return tableData || []
}
