/* eslint-disable no-undef */
// 结算单 PDF：把 DOM 节点渲染成 A4 单页 PDF 并下载
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

const A4 = { width: 595.28, height: 841.89 } // pt

/**
 * @param {HTMLElement} el 待导出的节点（离屏渲染，宽度按 794px 设计）
 * @param {string} fileName 下载文件名（不带 .pdf）
 */
export async function exportElementToPdf(el, fileName = '结算单') {
  if (!el) throw new Error('未找到待导出的结算单节点')

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight
  })

  const pdf = new JsPDF('p', 'pt', 'a4')
  const pageW = A4.width
  const pageH = A4.height

  const imgData = canvas.toDataURL('image/jpeg', 1)
  let drawW = pageW
  let drawH = (canvas.height * drawW) / canvas.width

  // 单页内容：超出时整体等比缩放到一页内，避免被截断
  if (drawH > pageH) {
    const ratio = pageH / drawH
    drawW *= ratio
    drawH = pageH
  }

  const offsetX = (pageW - drawW) / 2
  pdf.addImage(imgData, 'JPEG', offsetX, 0, drawW, drawH)
  pdf.save(`${fileName}.pdf`)
}
