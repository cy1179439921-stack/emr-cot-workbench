/**
 * 多连接SSE管理器
 * 借鉴AI.vue中的SSE实现，支持同时管理多个独立的SSE连接
 */
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getToken } from '@/utils/crypto'

class MultiSSEManager {
  constructor() {
    this.connections = new Map() // connectionId -> { controller, callbacks, loading }
    this.startTime = null
  }

  // SSE连接头部配置（借鉴AI.vue）
  getSSEHeaders() {
    return {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${getToken()}`
    }
  }

  // 创建新的SSE连接
  createConnection(connectionId, params, url, callbacks = {}) {
    // 如果已存在连接，先停止它
    if (this.connections.has(connectionId)) {
      this.stopConnection(connectionId)
    }

    const controller = new AbortController()
    const connectionInfo = {
      controller,
      loading: true,
      callbacks: {
        onMessage: callbacks.onMessage || (() => {}),
        onError: callbacks.onError || (() => {}),
        onClose: callbacks.onClose || (() => {}),
        onProgress: callbacks.onProgress || (() => {})
      }
    }

    this.connections.set(connectionId, connectionInfo)

    // 开始SSE连接（借鉴AI.vue的startSSE实现）
    this.startSSEConnection(connectionId, params, url)

    return connectionId
  }

  // 启动SSE连接
  async startSSEConnection(connectionId, params, url) {
    const connectionInfo = this.connections.get(connectionId)
    if (!connectionInfo) return
    const requestUrl = `${window.location.protocol}//${window.location.host}/api${url}`
    try {
      // eslint-disable-next-line no-undef
      await fetchEventSource(requestUrl, {
        method: 'POST',
        headers: this.getSSEHeaders(),
        body: JSON.stringify(params),
        signal: connectionInfo.controller.signal,
        openWhenHidden: true,
        async onopen(response) {
          if (response.ok) {
            console.log(`SSE连接成功: ${connectionId}`)
            return
          }
          throw new Error(`连接失败，状态码: ${response.status}`)
        },
        onmessage: (msg) => {
          try {
            const delta = JSON.parse(msg.data)
            this.handleMessage(connectionId, delta)
          } catch (error) {
            console.error(
              `Error parsing SSE message for ${connectionId}:`,
              error
            )
            connectionInfo.callbacks.onError(error)
          }
        },
        onerror: (error) => {
          console.error(`SSE error for ${connectionId}:`, error)
          connectionInfo.callbacks.onError(error)
        },
        onclose: () => {
          console.log(`SSE连接已关闭: ${connectionId}`)
          this.handleClose(connectionId)
        }
      })
    } catch (error) {
      console.error(`网络好像不太稳定，请稍后重试 ${connectionId}:`, error)
      this.handleClose(connectionId)
    }
  }

  // 处理SSE消息（借鉴AI.vue的handleMessage实现）
  handleMessage(connectionId, delta) {
    const connectionInfo = this.connections.get(connectionId)
    if (!connectionInfo) return
    if (connectionId === 'all') {
      if (delta) {
        // 正文内容处理
        connectionInfo.callbacks.onMessage(connectionId, delta)
      }
    } else {
      if (delta.content) {
        // 正文内容处理
        connectionInfo.callbacks.onMessage(connectionId, delta.content)
      } else if (delta.chatContentType === 3) {
        // 连接结束状态处理
        console.log(`章节生成完成: ${connectionId}`)
        this.handleClose(connectionId)
      }
    }

    // 调用进度回调
    this.updateProgress()
  }

  // 处理连接关闭
  handleClose(connectionId) {
    const connectionInfo = this.connections.get(connectionId)
    if (connectionInfo) {
      connectionInfo.loading = false
      connectionInfo.callbacks.onClose(connectionId)
      console.log(`连接关闭处理完成: ${connectionId}`)
    }
  }

  // 更新整体进度
  updateProgress() {
    const totalConnections = this.connections.size
    if (totalConnections === 0) return

    let completedConnections = 0
    this.connections.forEach((connectionInfo) => {
      if (!connectionInfo.loading) {
        completedConnections++
      }
    })

    const progress = Math.round(
      (completedConnections / totalConnections) * 100
    )
    const elapsedTime = this.startTime
      ? Math.round((Date.now() - this.startTime) / 1000)
      : 0

    // 如果所有连接都完成了，停止计时
    if (completedConnections === totalConnections && this.startTime) {
      this.stopTiming()
    }

    // 通知所有连接的进度回调
    this.connections.forEach((connectionInfo) => {
      connectionInfo.callbacks.onProgress(
        progress,
        elapsedTime,
        completedConnections,
        totalConnections
      )
    })
  }

  // 停止计时
  stopTiming() {
    if (this.startTime) {
      // 计算并保存最终完成时间
      const finalTime = Math.round((Date.now() - this.startTime) / 1000)
      this.finalTime = finalTime

      console.log(`所有章节完成，停止计时，总用时: ${finalTime}秒`)
      this.startTime = null
    }
  }

  // 停止指定连接
  stopConnection(connectionId) {
    const connectionInfo = this.connections.get(connectionId)
    if (connectionInfo && connectionInfo.loading) {
      console.log(`主动停止SSE连接: ${connectionId}`)
      connectionInfo.controller.abort()
      connectionInfo.loading = false
      connectionInfo.callbacks.onClose(connectionId)
    }
  }

  // 停止所有连接
  stopAllConnections() {
    console.log('停止所有SSE连接')
    this.connections.forEach((_connectionInfo, connectionId) => {
      this.stopConnection(connectionId)
    })
    this.connections.clear()
  }

  // 获取连接状态
  getConnectionStatus(connectionId) {
    const connectionInfo = this.connections.get(connectionId)
    if (connectionInfo) {
      return {
        loading: connectionInfo.loading,
        connected: true
      }
    }
    return {
      loading: false,
      connected: false
    }
  }

  // 获取所有连接状态
  getAllConnectionStatus() {
    const status = {}
    this.connections.forEach((connectionInfo, connectionId) => {
      status[connectionId] = {
        loading: connectionInfo.loading,
        connected: true
      }
    })
    return status
  }

  // 获取运行时间
  getElapsedTime() {
    // 如果还在计时，返回当前经过的时间
    // 如果已停止计时，返回0（组件会使用缓存的最终时间）
    return this.startTime
      ? Math.round((Date.now() - this.startTime) / 1000)
      : 0
  }

  // 获取最终完成时间
  getFinalTime() {
    return this.finalTime || 0
  }

  // 设置最终完成时间
  setFinalTime(time) {
    this.finalTime = time
  }
}

// 创建单例实例
const multiSSEManager = new MultiSSEManager()

export default multiSSEManager
