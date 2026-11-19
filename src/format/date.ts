/**
 * lite-kit —— 日期格式化（零依赖）
 */

import { PLACEHOLDER } from './number.js'

export interface DateParts {
  yyyy: string
  MM: string
  dd: string
  HH: string
  mm: string
  ss: string
  ms: string
}

export type DateFormatter = string | ((info: DateParts) => string)

const _formatNormalize = (formatter: DateFormatter): ((info: DateParts) => string) => {
  if (typeof formatter === 'function') return formatter
  if (typeof formatter !== 'string' || formatter === '') throw new Error('formatter can not be an empty string')
  const formatterMap: Record<string, string> = {
    date: 'yyyy-MM-dd',
    datetime: 'yyyy-MM-dd HH:mm:ss'
  }
  const pattern = formatterMap[formatter] ? formatterMap[formatter] : formatter
  const formatterFunc = (dateInfo: DateParts): string => {
    const map: Record<string, string> = { ...dateInfo }
    return pattern.replace(/yyyy|MM|dd|HH|mm|ss|ms/g, (match: string) => map[match])
  }
  return formatterFunc
}

/**
 * 时间格式化，支持 date、datetime 快捷格式与自定义格式（如 'yyyy/MM/dd HH:mm'）
 * @param date 日期（字符串、时间戳均可，兼容 iOS 的 '-' 日期）
 * @param formatter 时间格式或格式化函数
 * @param isPad 是否需要补 0
 */
export const formatDate = (date: unknown, formatter: DateFormatter = 'date', isPad = true): string => {
  const normalizedFormatter = _formatNormalize(formatter)
  const dtStr = String(date).includes('-') ? String(date).replace(/-/g, '/') : date
  const dt = new Date(dtStr as string)
  if (isNaN(dt.getTime())) return PLACEHOLDER

  const dateInfo: DateParts = {
    yyyy: String(dt.getFullYear()),
    MM: String(dt.getMonth() + 1),
    dd: String(dt.getDate()),
    HH: String(dt.getHours()),
    mm: String(dt.getMinutes()),
    ss: String(dt.getSeconds()),
    ms: String(dt.getMilliseconds())
  }

  if (isPad) {
    dateInfo.yyyy = dateInfo.yyyy.padStart(4, '0')
    dateInfo.MM = dateInfo.MM.padStart(2, '0')
    dateInfo.dd = dateInfo.dd.padStart(2, '0')
    dateInfo.HH = dateInfo.HH.padStart(2, '0')
    dateInfo.mm = dateInfo.mm.padStart(2, '0')
    dateInfo.ss = dateInfo.ss.padStart(2, '0')
    dateInfo.ms = dateInfo.ms.padStart(3, '0')
  }
  return normalizedFormatter(dateInfo)
}

/**
 * 资讯发布时间格式化
 * @rules
 * 1、年份不同，展示完整年月日
 * 2、年份相同则比较日期，日期相同只需要展示 时分，否则只展示 月日
 */
export const formatPublishedTime = (dateStr: unknown): string => {
  const compareDate = (preDate: string, nextDate: string): boolean => {
    return new Date(preDate).getTime() > new Date(nextDate).getTime()
  }
  return formatDate(
    dateStr,
    dateInfo => {
      const now = new Date()
      const nowYear = String(now.getFullYear())
      const nowMonth = String(now.getMonth() + 1).padStart(2, '0')
      const nowDay = String(now.getDate()).padStart(2, '0')
      const { yyyy, MM, dd, HH, mm } = dateInfo
      if (nowYear === yyyy) {
        if (compareDate(`${nowYear}-${nowMonth}-${nowDay}`, `${yyyy}-${MM}-${dd}`)) {
          return `${MM}-${dd}`
        } else {
          return `${HH}:${mm}`
        }
      } else {
        return `${yyyy}-${MM}-${dd}`
      }
    },
    true
  )
}
