// 每个 markdown 实例都有一个唯一 ID
let markdownUid = 0
export const collapsePlugin = (md) => {
  md.block.ruler.before('fence', 'custom_collapse', (state, startLine, endLine, silent) => {
    const start = state.getLines(startLine, startLine + 1, 0, false).trim()
    if (!start.startsWith(':::collapse')) return false

    const paramsLine = start.replace(':::collapse', '').trim()
    const params = {}
    paramsLine.split(/\s+/).forEach(p => {
      const [key, value] = p.split('=')
      if (key && value) params[key] = value.replace(/^"|"$/g, '')
    })

    let nextLine = startLine + 1
    let content = ''
    while (nextLine < endLine) {
      const line = state.getLines(nextLine, nextLine + 1, 0, false)
      if (line.trim().startsWith(':::')) break
      content += line + '\n'
      nextLine++
    }

    markdownUid++
    const token = state.push('custom_collapse', '', 0)
    token.meta = { ...params, content: content.trim(), uid: markdownUid }

    state.line = nextLine + 1
    return true
  })

  md.renderer.rules.custom_collapse = (tokens, idx) => {
    const meta = tokens[idx].meta || {}
    const id = `collapse-${meta.uid}`
    const title = meta.title || '展开查看'
    const dataset = Object.entries(meta)
      .map(([k, v]) => `data-${k}="${v}"`)
      .join(' ')

    return `
      <div class="md-collapse" id="${id}" ${dataset}>
        <div class="md-collapse-header">
          <span class="md-collapse-title">${title}</span>
          <span class="md-collapse-toggle">展开查看 ▼</span>
        </div>
        <div class="md-collapse-content" style="display:none;">
          ${meta.content}
        </div>
      </div>
    `
  }
}
