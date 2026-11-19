import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatDate, formatPublishedTime } from '../../../../src/format/date'
import { PLACEHOLDER } from '../../../../src/format/number'

const ts = new Date(2023, 0, 5, 8, 9, 10, 7).getTime()
const SLASH = '/'

describe('utils/format/date.ts', () => {
  describe('formatDate', () => {
    it('默认格式化为年月日', () => {
      expect(formatDate('2023-01-05')).toBe('2023-01-05')
      expect(formatDate(ts)).toBe('2023-01-05')
    })
    it('date 别名等价于 yyyy-MM-dd', () => {
      expect(formatDate(ts, 'date')).toBe('2023-01-05')
    })
    it('datetime 别名输出到秒', () => {
      expect(formatDate(ts, 'datetime')).toBe('2023-01-05 08:09:10')
    })
    it('支持自定义格式串', () => {
      const slashFormat = ['yyyy', 'MM', 'dd'].join(SLASH)
      expect(formatDate(ts, slashFormat)).toBe(['2023', '01', '05'].join(SLASH))
      expect(formatDate(ts, 'MM-dd HH:mm')).toBe('01-05 08:09')
      expect(formatDate(ts, 'yyyy年MM月dd日')).toBe('2023年01月05日')
      expect(formatDate(ts, 'ss.ms')).toBe('10.007')
    })
    it('未识别的 token 原样输出', () => {
      expect(formatDate(ts, 'yy')).toBe('yy')
    })
    it('支持传入格式化函数', () => {
      expect(formatDate(ts, dateInfo => `${dateInfo.yyyy}-${dateInfo.MM}`)).toBe('2023-01')
      expect(formatDate(ts, dateInfo => `${dateInfo.HH}:${dateInfo.mm}:${dateInfo.ss}`)).toBe('08:09:10')
    })
    it('isPad 为 false 时不补零', () => {
      expect(formatDate(ts, 'MM-dd HH:mm', false)).toBe('1-5 8:9')
      expect(formatDate(ts, 'yyyy', false)).toBe('2023')
    })
    it('横杠日期会转成斜杠以兼容 iOS', () => {
      expect(formatDate('2023-01-05 08:09:10', 'datetime')).toBe('2023-01-05 08:09:10')
    })
    it('非法日期返回占位符', () => {
      expect(formatDate('not-a-date')).toBe(PLACEHOLDER)
      expect(formatDate(undefined as any)).toBe(PLACEHOLDER)
      expect(formatDate('' as any)).toBe(PLACEHOLDER)
    })
    it('null 被当作时间戳 0 解析为纪元日期', () => {
      expect(formatDate(null as any)).toBe('1970-01-01')
    })
    it('格式化器为空字符串时抛错', () => {
      expect(() => formatDate(ts, '')).toThrow('formatter can not be an empty string')
    })
    it('格式化器类型非法时抛错', () => {
      expect(() => formatDate(ts, 123 as any)).toThrow('formatter can not be an empty string')
      expect(() => formatDate(ts, null as any)).toThrow('formatter can not be an empty string')
      expect(() => formatDate(ts, {} as any)).toThrow('formatter can not be an empty string')
    })
  })

  describe('formatPublishedTime', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('同一天只展示时分', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 7, 27, 15, 30, 0))
      expect(formatPublishedTime('2026-08-27 09:05:00')).toBe('09:05')
    })
    it('同一年但早于今天展示月日', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 7, 27, 15, 30, 0))
      expect(formatPublishedTime('2026-08-01 09:05:00')).toBe('08-01')
    })
    it('不同年份展示完整年月日', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 7, 27, 15, 30, 0))
      expect(formatPublishedTime('2025-12-31 23:59:59')).toBe('2025-12-31')
    })
    it('晚于今天（未来）同样落入时分分支', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 7, 27, 15, 30, 0))
      expect(formatPublishedTime('2026-08-28 10:00:00')).toBe('10:00')
    })
    it('非法日期返回占位符', () => {
      expect(formatPublishedTime('xxxx')).toBe(PLACEHOLDER)
    })
  })
})
