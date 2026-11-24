import { ElMessage } from 'element-plus'
/**
 * 下载文件
 * @param {Object} fileBlod 文件流
 * @param {String} fileName 文件名
 * @returns {void}
 */
export function blodDownLoadFile(fileBlod, fileName) {
  try {
    const { data, headers } = fileBlod
    const blob = new Blob([data], { type: headers['content-type'] })
    const url = URL.createObjectURL(blob)// 创建 Blob URL
    // 创建一个<a>元素并触发下载
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a) // 将元素添加到 DOM
    a.click() // 触发点击事件
    a.remove() // 下载后移除元素

    // 释放 Blob URL
    window.URL.revokeObjectURL(url)
    ElMessage.success('文件已开始下载')
  } catch (e) {
    console.error('下载失败:', e)
  }
}
