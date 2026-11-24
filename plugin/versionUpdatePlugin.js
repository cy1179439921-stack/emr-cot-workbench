import fs from 'fs'
import path from 'path'
const writeVersion = (versionFile, content) => {
  // 通过fs模块写入文件
  fs.writeFile(versionFile, content, (err) => {
    if (err) throw err
  })
}

export default (options) => {
  let config

  return {
    name: 'version-update',

    configResolved(resolvedConfig) {
      // 存储最终解析的配置
      config = resolvedConfig
    },

    buildStart() {
      // 只在 build 模式执行
      if (config.command !== 'build') return

      // 生成版本信息文件路径存到dist的version.json
      const file = config.publicDir + path.sep + 'version.json'
      // 这里使用编译时间作为版本信息
      const content = JSON.stringify({ version: options.version }, null, 2)

      if (fs.existsSync(config.publicDir)) {
        writeVersion(file, content)
      } else {
        fs.mkdir(config.publicDir, (err) => {
          if (err) throw err
          writeVersion(file, content)
        })
      }
    }
  }
}
