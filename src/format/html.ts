/**
 * lite-kit —— HTML 转义工具（零依赖）
 */

/**
 * 转义 HTML 特殊字符，防止 XSS
 * @param str 待转义的字符串
 */
export const escapeHtml = (str: string): string => {
  const escapeMap: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return str.replace(/[&<>"']/g, m => escapeMap[m])
}

/**
 * 转义正则特殊字符
 * @param str 待转义的字符串
 */
export const escapeRegExp = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
