let recordsPromise

const fileName = (path) => String(path).split('/').pop()

const readUint16 = (view, offset) => view.getUint16(offset, true)
const readUint32 = (view, offset) => view.getUint32(offset, true)

const inflateRaw = async (bytes) => {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

const parseZip = async (buffer) => {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  const decoder = new TextDecoder()
  const entries = []
  let endOffset = bytes.length - 22
  while (endOffset >= 0 && readUint32(view, endOffset) !== 0x06054b50) endOffset -= 1
  if (endOffset < 0) return entries
  const entryCount = readUint16(view, endOffset + 10)
  const centralOffset = readUint32(view, endOffset + 16)
  let offset = centralOffset
  for (let index = 0; index < entryCount && offset + 46 < bytes.length; index += 1) {
    if (readUint32(view, offset) !== 0x02014b50) break
    const method = readUint16(view, offset + 10)
    const compressedSize = readUint32(view, offset + 20)
    const nameLength = readUint16(view, offset + 28)
    const extraLength = readUint16(view, offset + 30)
    const commentLength = readUint16(view, offset + 32)
    const localOffset = readUint32(view, offset + 42)
    const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength))
    const localNameLength = readUint16(view, localOffset + 26)
    const localExtraLength = readUint16(view, localOffset + 28)
    const start = localOffset + 30 + localNameLength + localExtraLength
    const compressed = bytes.slice(start, start + compressedSize)
    if (name.endsWith('.json')) {
      const content = method === 8 ? await inflateRaw(compressed) : compressed
      entries.push([name, JSON.parse(decoder.decode(content))])
    }
    offset += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

export const loadCotExportRecords = async () => {
  if (!recordsPromise) {
    recordsPromise = fetch('/data/cot-export-records.zip')
      .then(response => response.arrayBuffer())
      .then(async buffer => {
        const entries = await parseZip(buffer)
        return entries
          .filter(([path]) => /^case_.*\.json$/i.test(fileName(path)))
          .map(([path, data]) => {
            const context = data.patient_global_context || {}
            const loops = data.clinical_loop_network || []
            return {
              id: context.patient_ref || fileName(path).replace(/\.json$/i, ''),
              recordId: context.patient_ref || fileName(path).replace(/\.json$/i, ''),
              documentId: fileName(path).replace(/\.json$/i, ''),
              caseName: fileName(path).replace(/^case_/, '').replace(/\.json$/i, '').replace(/_/g, ' '),
              patientRef: context.patient_ref || '-',
              patientName: `COT病例 ${context.patient_ref || '-'}`,
              age: context.age,
              sex: context.sex === 'FEMALE' ? '女' : '男',
              specialty: data.specialty_context?.subspecialty_note || data.specialty_context?.specialty_category || '-',
              loopCount: loops.length,
              loopNames: loops.map(item => item.loop_meta?.loop_name).filter(Boolean),
              loops,
              raw: data,
              proofreadStatus: 5,
              agencyName: 'COT示例数据',
              departmentName: data.specialty_context?.subspecialty_note || '综合科室'
            }
          })
      })
      .catch(error => {
        console.error('COT示例数据加载失败', error)
        return []
      })
  }
  return recordsPromise
}

export const getCotExportRecord = async (id) => {
  const records = await loadCotExportRecords()
  return records.find(item => String(item.id) === String(id) || String(item.documentId) === String(id)) || records[0]
}
