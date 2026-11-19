/**
 * lite-kit —— 页面跳转与 iframe 父容器通信（零依赖）
 */

let parentOriginOverride = ''

/**
 * 显式指定父窗口 origin（跨域嵌入宿主时由应用注入，如 setParentOrigin(import.meta.env.VITE_PARENT_ORIGIN)）
 */
export const setParentOrigin = (origin: string): void => {
  parentOriginOverride = origin
}

/**
 * 解析 postMessage 的 targetOrigin
 * 优先使用 setParentOrigin 注入的值；未配置时读取父窗口 origin，
 * 跨域读取会抛 SecurityError，此时降级为 '*' 保证消息可达
 */
export const getParentOrigin = (): string => {
  if (parentOriginOverride) return parentOriginOverride
  try {
    return window.parent.location.origin
  } catch (err) {
    return '*'
  }
}

/** 向父容器发送信息 */
export const postParentMessage = (message: unknown): void => {
  if (!window.parent) return
  window.parent.postMessage(message, getParentOrigin())
}

/**
 * 全局统一跳转方法（hash 路由，基于 URL API）
 * @param page 目标页面路由（不含 '#/'）
 * @param options 附带的 query 参数
 * @param target '_self' 当前页跳转，'_blank' 新窗口打开
 */
export const goPage = (page: string, options: Record<string, string | number> = {}, target = '_self'): void => {
  const url = new URL(window.location.href)
  Object.keys(options).forEach(key => {
    url.searchParams.set(key, String(options[key]))
  })
  url.hash = `/${page}`
  if (target === '_blank') {
    window.open(url.toString())
  } else {
    window.location.href = url.toString()
  }
}
