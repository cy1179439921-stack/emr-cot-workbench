/* 导出pdf文档 */
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'
import $ from 'jquery'
import { nextTick } from 'vue'
import { ElLoading } from 'element-plus'

let loading = null
export default {
  DPR () {
    // 获取设备dpi
    if (window.devicePixelRatio && window.devicePixelRatio > 1) {
      return window.devicePixelRatio
    }
    return 1
  },
  // 下载pdf,内容在一页显示
  downloadPDF (refDom, id, title, isQrcode = false) {
    // let A4_WIDTH = 1256
    // if (document.documentElement.clientWidth < 1920) {
    const A4_WIDTH = Math.round((1256 / 1920) * document.documentElement.clientWidth)
    // }
    loading = ElLoading.service({
      lock: true,
      text: '下载中',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    $('#' + id).addClass('downloading')
    // 没有下面的minWidth和minHeight，pdf就会显示不全
    if (title.includes('独立样本Mann-Whitney U检验')) { // 有特殊的分割线，需要固定的rotate角度
      if (document.documentElement.clientWidth < 1920) {
        $('#' + id).css('minWidth', (A4_WIDTH / 14) + 'rem')
      } else {
        $('#' + id).css('minWidth', A4_WIDTH + 'px')
      }
    } else {
      // 额外加100px（1920分辨率下）宽度
      const extraWidth = Math.round((100 / 1920) * document.documentElement.clientWidth)
      // 遍历$('#' + id + ' .el-table__header')，取最大clientWidth宽度
      let maxWidth = 0
      $('#' + id + ' .el-table__header').each(function() {
        const currentWidth = this.clientWidth
        if (currentWidth > maxWidth) {
          maxWidth = currentWidth
        }
      })
      if (maxWidth < A4_WIDTH) {
        $('#' + id).css('minWidth', A4_WIDTH + 'px')
      } else {
        $('#' + id).css('minWidth', (maxWidth + extraWidth) + 'px')
      }
    }

    const content = document.getElementById(id)
    $('#' + id + ' .spanCopy').hide() // 隐藏下载按钮
    nextTick(() => {
      const resizeEvent = new Event('resize')
      // 手动触发 resize 事件
      window.dispatchEvent(resizeEvent)
      let defaultScale = 2 // 默认缩放倍数

      setTimeout(() => {
        html2canvas(content, {
          allowTaint: true,
          scale: defaultScale // 提升画面质量，但是会增加文件大小
        }).then(function (canvas) {
          // 得到canvas画布的单位是px 像素单位
          const contentWidth = canvas.width
          const contentHeight = canvas.height
          // 特别注意，多大的pdf是会被截断的，报错信息如下：
          // pdf.js:81 A page in a PDF can not be wider or taller than 14400 userUnit. jsPDF limits the width/height to 14400
          if (contentHeight > 28800) {
            defaultScale = 3 // 对于过大的pdf，需要缩放3倍
          }
          const pageData = canvas.toDataURL('image/jpeg', 1.0)
          // 设置pdf的尺寸，pdf要使用pt单位 已知 1pt/1px = 0.75   pt = (px/scale)* 0.75
          // 2为上面的scale 缩放了2倍,默认要缩放2倍，对于过大的pdf需要传入参数，比如{scale: 3}
          const pdfX = ((contentWidth + 10) / defaultScale) * 0.75
          const pdfY = ((contentHeight + 500) / defaultScale) * 0.75 // 500为底部留白
          // 设置内容图片的尺寸，img是pt单位
          // const imgX = pdfX
          // // const imgY = (contentHeight / defaultScale) * 0.75 // 内容图片这里不需要留白的距离
          // const imgY = (contentHeight / defaultScale) // 内容图片这里不需要留白的距离
          // 初始化jspdf 第一个参数方向：默认''时为纵向，第二个参数设置pdf内容图片使用的长度单位为pt，第三个参数为PDF的大小，单位是pt
          // const PDF = new JsPDF('', 'pt', [pdfX, pdfY])
          // // 将内容图片添加到pdf中，因为内容宽高和pdf宽高一样，就只需要一页，位置就是 0,0
          // PDF.addImage(pageData, 'jpeg', 0, 0, pdfX, pdfY)
          const PDF = new JsPDF('', 'pt', [pdfX, pdfY])
          const pageWidth = PDF.internal.pageSize.getWidth()
          const pageHeight = PDF.internal.pageSize.getHeight()

          const imgProps = PDF.getImageProperties(pageData)
          const imgWidth = imgProps.width
          const imgHeight = imgProps.height

          // 等比缩放，填满页宽
          let pdfImgWidth = pageWidth
          let pdfImgHeight = (imgHeight * pdfImgWidth) / imgWidth

          // 如果高度超出，继续等比缩放
          if (pdfImgHeight > pageHeight) {
            const scale = pageHeight / pdfImgHeight
            pdfImgWidth *= scale
            pdfImgHeight = pageHeight
          }

          // 左上角对齐贴图（不再居中）
          PDF.addImage(pageData, 'JPEG', 0, 0, pdfImgWidth, pdfImgHeight)
          PDF.save(title + '.pdf')
          $('#' + id + ' .spanCopy').show() // 恢复下载按钮
          $('#' + id).css('minWidth', 'auto')
          // 移除dowloading样式
          $('#' + id).removeClass('downloading')
          // // if (id === 'resultTable') {
          // $('#' + id).css('minHeight', 'auto')
          // // }
          try {
            refDom.value.deletePlotlyToImg()
          } catch (error) {

          }
          window.dispatchEvent(resizeEvent)

          loading.close()
        })
      }, 300) // 解决loading层出现有延迟问题
    })
  }
}
