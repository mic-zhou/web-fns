/**
 * lite-kit —— 数组 / URL / 时间辅助函数（零依赖）
 */

import { isFalseValue } from './format/index.js'

/**
 * 数据排序（按字段，空值排末尾/队首）
 * @param origin 待排序的源数据
 * @param sortKey 排序的字段
 * @param type 排序方式，'desc'-倒序，'asc'-正序
 */
export const sortByKey = (origin: any[], sortKey: string, type: string): any[] => {
  if (!Array.isArray(origin)) return []
  const target = [...origin]
  if (!['desc', 'asc'].includes(type)) return target
  return target.sort((pre, next) => {
    let preValue = pre[sortKey]
    let nextValue = next[sortKey]
    if (isFalseValue(preValue)) {
      preValue = type === 'desc' ? -(Math.pow(2, 53) - 1) : Math.pow(2, 53) - 1
    }
    if (isFalseValue(nextValue)) {
      nextValue = type === 'desc' ? -(Math.pow(2, 53) - 1) : Math.pow(2, 53) - 1
    }
    return type === 'desc' ? nextValue - preValue : preValue - nextValue
  })
}

/**
 * 数据排序（按时间字段，兼容 iOS 的 '-' 日期）
 * @param origin 待排序的源数据
 * @param dateKey 排序的时间字段
 * @param type 排序方式，'desc'-倒序，'asc'-正序
 */
export const sortByDate = (origin: any[], dateKey: string, type: string): any[] => {
  if (!Array.isArray(origin)) return []
  const target = [...origin]
  if (!['desc', 'asc'].includes(type)) return target
  return target.sort((pre, next) => {
    const preDate = isString(pre[dateKey]) ? pre[dateKey].replace(/-/g, '/') : pre[dateKey]
    const nextDate = isString(next[dateKey]) ? next[dateKey].replace(/-/g, '/') : next[dateKey]
    if (type === 'desc') {
      const preValue = isFalseValue(preDate) ? -(Math.pow(2, 53) - 1) : new Date(preDate).getTime()
      const nextValue = isFalseValue(nextDate) ? -(Math.pow(2, 53) - 1) : new Date(nextDate).getTime()
      return nextValue - preValue
    } else {
      const preValue = isFalseValue(preDate) ? Math.pow(2, 53) - 1 : new Date(preDate).getTime()
      const nextValue = isFalseValue(nextDate) ? Math.pow(2, 53) - 1 : new Date(nextDate).getTime()
      return preValue - nextValue
    }
  })
}

const isString = (v: unknown): v is string => typeof v === 'string'

/**
 * 简单一维数组去重
 * @param arr 待去重的数组
 */
export const uniqueArray = (arr: unknown): any[] => {
  if (!Array.isArray(arr)) return []
  return Array.from(new Set(arr))
}

/**
 * 判断对象是否包含属性（安全版 hasOwnProperty）
 * @param obj 待判定的对象
 * @param key 待判定的属性
 */
export const hasOwnProperty = (obj: unknown, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * 获取时间戳，兼容 iOS（'-' 日期替换为 '/'）。无效日期返回 NaN
 */
export const getTimestamp = (date: unknown): number => {
  // 与 lodash isEmpty 对齐：null/undefined/空串/数字/布尔/无可枚举属性的 Date 均视为空
  const isEmpty = (v: unknown): boolean => {
    if (v == null) return true
    const t = typeof v
    if (t === 'string') return (v as string).length === 0
    if (t === 'number' || t === 'boolean' || t === 'bigint' || t === 'symbol') return true
    if (t === 'object') return Object.keys(v as object).length === 0
    return true
  }
  if (typeof date === 'number' && Number.isInteger(date) && date.toString().length === 13) {
    return new Date(date).getTime()
  }
  if (isEmpty(date)) return NaN
  return new Date(String(date).replace(/-/g, '/')).getTime()
}

/**
 * 替换 URL 中的某一个参数
 * @param url 待处理的 URL
 * @param key 待替换的参数名
 * @param value 待替换的参数值
 */
export const replaceUrlParam = (url: string, key: string, value: unknown): string => {
  const hasParams = url.includes('?')
  const hasCurParams = url.includes(`&${key}=`) || url.includes(`?${key}=`)
  const isFirstParams = url.includes(`?${key}=`)

  if (!hasParams) {
    return `${url}?${key}=${value}`
  }
  if (!hasCurParams) {
    return `${url}&${key}=${value}`
  }
  if (isFirstParams) {
    return url.replace(new RegExp(`\\?${key}=[^&]*`, 'gi'), `?${key}=${value}`)
  }
  return url.replace(new RegExp(`&${key}=[^&]*`, 'gi'), `&${key}=${value}`)
}

/**
 * 获取数据量级以及对应的单位（万亿 / 亿 / 万）
 * @param value 数值
 */
export const getOrder = (value: number): { order: number; unit: string } => {
  if (value > 1000000000000) return { order: 1000000000000, unit: '万亿' }
  if (value > 100000000) return { order: 100000000, unit: '亿' }
  if (value > 10000) return { order: 10000, unit: '万' }
  return { order: 1, unit: '' }
}

/**
 * 时间排序（纯日期数组）
 * @param dates 日期数组
 * @param type 排序方式，默认倒序
 */
export const sortDate = (dates: unknown[], type = 'desc'): any[] => {
  if (!Array.isArray(dates)) return []
  return [...dates].sort((pre, next) => {
    if (type === 'desc') return getTimestamp(next) - getTimestamp(pre)
    return getTimestamp(pre) - getTimestamp(next)
  })
}

/**
 * 按 key 对对象数组去重（保留首次出现）
 * @param list 对象数组
 * @param key 判断重复的字段，默认 'id'
 */
export const uniqueByKey = (list: unknown, key = 'id'): any[] => {
  if (!Array.isArray(list)) return []
  const seen = new Map()
  return list.filter(item => {
    if (seen.has(item[key])) return false
    seen.set(item[key], true)
    return true
  })
}

/**
 * 计算数组 min/max，并向外扩 1/8 量程（用于图表 Y 轴留白）
 * @param allYData Y 轴数据
 * @param num 保留小数位
 */
export const getMaxAndMin = (allYData: number[], num = 2): { min_y: number; max_y: number } => {
  let min_y = Math.min(...allYData)
  let max_y = Math.max(...allYData)
  const avg = Number(Math.abs(max_y - min_y) / 8) || 0
  min_y = Number((min_y - avg).toFixed(num)) || 0
  max_y = Number((max_y + avg).toFixed(num)) || 0
  if (min_y === max_y && min_y === 0) {
    max_y = 1
  }
  return {
    min_y,
    max_y
  }
}

/**
 * iOS 日期兼容：'-' 替换为 '/'
 */
export const iosDate = (date: string): string => {
  if (!date) return date
  return date.replace(/-/g, '/')
}

/**
 * 从 querystring 中获取指定参数值
 * @param search 形如 "a=1&b=2" 的查询串（不含开头的 ?）
 * @param key 参数名
 * @param decode 是否对结果 decodeURIComponent
 */
export const getUrlParams = (search: string, key: string, decode = false): string | null => {
  if (!search || !key) return null
  const reg = new RegExp(`(?:^|&)${key}=([^&]*)`)
  const match = search.match(reg)
  if (!match) return null
  return decode ? decodeURIComponent(match[1]) : match[1]
}

export default {
  sortByKey,
  sortByDate,
  uniqueArray,
  hasOwnProperty,
  getTimestamp,
  replaceUrlParam,
  getOrder,
  sortDate,
  uniqueByKey,
  getMaxAndMin,
  iosDate,
  getUrlParams
}
