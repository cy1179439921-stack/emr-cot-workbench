/* 导出excel文档 */
import FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
// 导出excel
export const exportExcel = (element, excelName) => {
  try {
    // const $e = this.$refs[`${element}`].$el
    // let $table = $e.querySelector('.el-table__fixed')
    // if (!$table) {
    //   $table = $e
    // }
    const $table = document.querySelector(element)
    const wb = XLSX.utils.table_to_book($table, { raw: true })
    const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
    FileSaver.saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `${excelName}.xlsx`
    )
  } catch (e) {
    if (typeof console !== 'undefined') console.error(e)
  }
}
