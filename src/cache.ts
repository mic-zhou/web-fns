/**
 * lite-kit —— Storage / Cookie 读写（零依赖）
 *
 * Cookie 为原生 document.cookie 实现，支持 expires / path / domain / secure / sameSite。
 */

const STORAGE_TYPES = ['localStorage', 'sessionStorage']

const isValidStorageType = (type: string): boolean => STORAGE_TYPES.includes(type)

/** 写入 storage，空值（'' / null / undefined）按 null 存储 */
export const setStorage = (key: string, value: unknown, type = 'localStorage'): void => {
  if (!isValidStorageType(type)) return
  try {
    const valueStr = ['', null, undefined].includes(value as string) ? null : JSON.stringify(value)
    ;(window as any)[type].setItem(key, valueStr)
  } catch (err) {
    console.error(err)
  }
}

/** 读取 storage，不存在返回 null；非 JSON 字符串返回原始值 */
export const getStorage = (key: string, type = 'localStorage'): unknown => {
  if (!isValidStorageType(type)) return null
  let raw: string | null = null
  try {
    raw = (window as any)[type].getItem(key)
    if (raw === null || raw === 'null') {
      return null
    }
    return JSON.parse(raw)
  } catch (err) {
    return raw
  }
}

/** 读取指定 storage 下的全部键值对 */
export const getAllStorage = (type = 'localStorage'): Array<{ key: string; value: unknown }> => {
  if (!isValidStorageType(type)) return []
  try {
    const storageLength = (window as any)[type].length
    const newArr: Array<{ key: string; value: unknown }> = []
    for (let i = 0; i < storageLength; i++) {
      const key = (window as any)[type].key(i)
      const value = getStorage(key, type)
      newArr.push({ key, value })
    }
    return newArr
  } catch (err) {
    console.error(err)
    return []
  }
}

/** 删除指定 storage 键 */
export const removeStorage = (key: string, type = 'localStorage'): void => {
  if (!isValidStorageType(type)) return
  try {
    ;(window as any)[type].removeItem(key)
  } catch (err) {
    console.error(err)
  }
}

/** 清空指定 storage */
export const clearStorage = (type = 'localStorage'): void => {
  if (!isValidStorageType(type)) return
  try {
    ;(window as any)[type].clear()
  } catch (err) {
    console.error(err)
  }
}

export interface CookieOptions {
  /** 过期时间：数字（天数）或 Date 实例 */
  expires?: number | Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

/** 写入 cookie（原生 document.cookie 实现） */
export const setCookie = (name: string, value: unknown, options: CookieOptions = {}): void => {
  try {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`
    if (options.expires !== undefined) {
      const expires =
        typeof options.expires === 'number' ? new Date(Date.now() + options.expires * 864e5) : options.expires
      cookieStr += `; expires=${expires.toUTCString()}`
    }
    if (options.path) cookieStr += `; path=${options.path}`
    if (options.domain) cookieStr += `; domain=${options.domain}`
    if (options.secure) cookieStr += '; secure'
    if (options.sameSite) cookieStr += `; samesite=${options.sameSite}`
    document.cookie = cookieStr
  } catch (err) {
    console.error(err)
  }
}

/** 读取 cookie，不存在返回 undefined */
export const getCookie = (name: string): string | undefined => {
  try {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`))
    if (!match) return undefined
    try {
      return decodeURIComponent(match[1])
    } catch {
      return match[1]
    }
  } catch (err) {
    console.error(err)
    return undefined
  }
}

export default {
  setStorage,
  getStorage,
  getAllStorage,
  removeStorage,
  clearStorage,
  setCookie,
  getCookie
}
