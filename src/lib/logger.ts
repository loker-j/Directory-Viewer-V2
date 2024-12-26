// 日志级别
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 日志配置
const config = {
  level: (process.env.LOG_LEVEL || 'info') as LogLevel,
  enabled: process.env.NODE_ENV !== 'production'
}

// 日志级别映射
const levelMap = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

// 检查是否应该记录该级别的日志
function shouldLog(level: LogLevel): boolean {
  return config.enabled && levelMap[level] >= levelMap[config.level]
}

// 基本日志函数
function log(level: LogLevel, message: string, ...args: any[]) {
  if (!shouldLog(level)) return

  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] ${level.toUpperCase()}`

  if (level === 'error') {
    console.error(prefix, message, ...args)
  } else if (level === 'warn') {
    console.warn(prefix, message, ...args)
  } else {
    console.log(prefix, message, ...args)
  }
}

// 导出日志函数
export const logger = {
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args)
} 