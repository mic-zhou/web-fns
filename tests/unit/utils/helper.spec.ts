import { describe, it, expect } from 'vitest'
import helper, { getUrlParams } from '../../../src/helper'

const SL = '/'
const DAY1 = `2023${SL}01${SL}01`
const TS_2023_01_01 = new Date(2023, 0, 1).getTime()

interface Row {
  v?: number | null
  d?: string | number | null
  n?: string
  c?: string
  id?: number
}

describe('utils/helper.ts', () => {
  describe('模块导出', () => {
    it('默认导出包含全部工具函数', () => {
      expect(Object.keys(helper)).toEqual([
        'sortByKey',
        'sortByDate',
        'uniqueArray',
        'hasOwnProperty',
        'getTimestamp',
        'replaceUrlParam',
        'getOrder',
        'sortDate',
        'uniqueByKey',
        'getMaxAndMin',
        'iosDate',
        'getUrlParams'
      ])
    })
    it('具名导出的 getUrlParams 与默认导出同一实现', () => {
      expect(getUrlParams).toBe(helper.getUrlParams)
    })
  })

  describe('sortByKey', () => {
    it('按指定字段降序排序', () => {
      const data: Row[] = [{ v: 1 }, { v: 3 }, { v: 2 }]
      const result = helper.sortByKey(data, 'v', 'desc')
      expect(result.map((d: Row) => d.v)).toEqual([3, 2, 1])
    })
    it('按指定字段升序排序', () => {
      const data: Row[] = [{ v: 3 }, { v: 1 }, { v: 2 }]
      const result = helper.sortByKey(data, 'v', 'asc')
      expect(result.map((d: Row) => d.v)).toEqual([1, 2, 3])
    })
    it('假值字段在降序中排在末尾', () => {
      const data: Row[] = [{ v: 1 }, { v: null }, { v: 3 }]
      expect(helper.sortByKey(data, 'v', 'desc').map((d: Row) => d.v)).toEqual([3, 1, null])
    })
    it('假值字段在升序中排在末尾', () => {
      const data: Row[] = [{ v: 1 }, { v: null }, { v: 3 }]
      expect(helper.sortByKey(data, 'v', 'asc').map((d: Row) => d.v)).toEqual([1, 3, null])
    })
    it('数字 0 不算假值，参与正常排序', () => {
      const data: Row[] = [{ v: 0 }, { v: 2 }]
      expect(helper.sortByKey(data, 'v', 'desc').map((d: Row) => d.v)).toEqual([2, 0])
    })
    it('排序方式非法时保持原顺序', () => {
      const data: Row[] = [{ v: 2 }, { v: 1 }]
      const result = helper.sortByKey(data, 'v', 'foo')
      expect(result.map((d: Row) => d.v)).toEqual([2, 1])
    })
    it('返回新数组，不修改源数据', () => {
      const data: Row[] = [{ v: 2 }, { v: 1 }]
      const result = helper.sortByKey(data, 'v', 'asc')
      expect(result).not.toBe(data)
      expect(data.map((d: Row) => d.v)).toEqual([2, 1])
    })
    it('非数组返回空数组', () => {
      expect(helper.sortByKey(null, 'v', 'desc')).toEqual([])
      expect(helper.sortByKey(undefined, 'v', 'desc')).toEqual([])
      expect(helper.sortByKey({}, 'v', 'desc')).toEqual([])
    })
    it('空数组返回空数组', () => {
      expect(helper.sortByKey([], 'v', 'desc')).toEqual([])
    })
  })

  describe('sortByDate', () => {
    it('按时间字段降序排序且空值置末', () => {
      const data: Row[] = [{ d: '2023-01-01' }, { d: null }, { d: '2023-01-02' }]
      expect(helper.sortByDate(data, 'd', 'desc').map((i: Row) => i.d)).toEqual(['2023-01-02', '2023-01-01', null])
    })
    it('按时间字段升序排序且空值置末', () => {
      const data: Row[] = [{ d: '2023-01-02' }, { d: null }, { d: '2023-01-01' }]
      expect(helper.sortByDate(data, 'd', 'asc').map((i: Row) => i.d)).toEqual(['2023-01-01', '2023-01-02', null])
    })
    it('支持数字时间戳字段', () => {
      const ts2 = TS_2023_01_01 + 86400000
      const data: Row[] = [{ d: ts2 }, { d: TS_2023_01_01 }]
      expect(helper.sortByDate(data, 'd', 'asc').map((i: Row) => i.d)).toEqual([TS_2023_01_01, ts2])
    })
    it('排序方式非法时保持原顺序', () => {
      const data: Row[] = [{ d: '2023-01-02' }, { d: '2023-01-01' }]
      expect(helper.sortByDate(data, 'd').map((i: Row) => i.d)).toEqual(['2023-01-02', '2023-01-01'])
    })
    it('非数组返回空数组', () => {
      expect(helper.sortByDate('2023-01-01', 'd', 'asc')).toEqual([])
    })
  })

  describe('uniqueArray', () => {
    it('去重', () => {
      expect(helper.uniqueArray([1, 2, 2, 3, 3])).toEqual([1, 2, 3])
    })
    it('空数组返回空数组', () => {
      expect(helper.uniqueArray([])).toEqual([])
    })
    it('字符串数组同样去重', () => {
      expect(helper.uniqueArray(['a', 'a', 'b'])).toEqual(['a', 'b'])
    })
    it('非数组返回空数组', () => {
      expect(helper.uniqueArray(null)).toEqual([])
      expect(helper.uniqueArray('aa')).toEqual([])
    })
  })

  describe('hasOwnProperty', () => {
    it('自身属性返回 true', () => {
      expect(helper.hasOwnProperty({ a: 1 }, 'a')).toBe(true)
    })
    it('继承属性返回 false', () => {
      expect(helper.hasOwnProperty({}, 'toString')).toBe(false)
    })
    it('空对象返回 false', () => {
      expect(helper.hasOwnProperty({}, 'a')).toBe(false)
    })
    it('null 入参抛出 TypeError', () => {
      expect(() => helper.hasOwnProperty(null, 'a')).toThrow(TypeError)
    })
  })

  describe('getTimestamp', () => {
    it('有效日期返回时间戳', () => {
      expect(helper.getTimestamp('2023-01-01')).toBeGreaterThan(0)
    })
    it('兼容 YYYY-MM-DD 形式', () => {
      expect(helper.getTimestamp('2023-01-01')).toBe(TS_2023_01_01)
    })
    it('十三位数字时间戳原样返回', () => {
      expect(helper.getTimestamp(TS_2023_01_01)).toBe(TS_2023_01_01)
    })
    it('无效日期返回 NaN', () => {
      expect(isNaN(helper.getTimestamp(null))).toBe(true)
    })
    it('数字 0 与空串返回 NaN', () => {
      expect(helper.getTimestamp(0)).toBeNaN()
      expect(helper.getTimestamp('')).toBeNaN()
    })
    it('Date 对象被 isEmpty 判定为空，返回 NaN', () => {
      expect(helper.getTimestamp(new Date(2023, 0, 1))).toBeNaN()
    })
    it('函数等无可枚举属性的入参按空处理', () => {
      expect(helper.getTimestamp((() => {}) as any)).toBeNaN()
    })
  })

  describe('replaceUrlParam', () => {
    it('无查询串时追加参数', () => {
      expect(helper.replaceUrlParam('a.com', 'p', 9)).toBe('a.com?p=9')
    })
    it('有查询串但无目标参数时用 & 追加', () => {
      expect(helper.replaceUrlParam('a.com?q=1', 'p', 9)).toBe('a.com?q=1&p=9')
    })
    it('替换首个参数', () => {
      expect(helper.replaceUrlParam('a.com?p=1&q=2', 'p', 9)).toBe('a.com?p=9&q=2')
    })
    it('替换非首个参数', () => {
      expect(helper.replaceUrlParam('a.com?q=2&p=1', 'p', 9)).toBe('a.com?q=2&p=9')
    })
    it('只替换问号后的首个同名参数', () => {
      expect(helper.replaceUrlParam('a.com?p=1&p=2', 'p', 9)).toBe('a.com?p=9&p=2')
    })
  })

  describe('getOrder', () => {
    it('超过万亿返回万亿量级', () => {
      expect(helper.getOrder(2000000000000)).toEqual({ order: 1000000000000, unit: '万亿' })
    })
    it('大于亿返回亿', () => {
      expect(helper.getOrder(200000000).unit).toBe('亿')
    })
    it('大于万返回万', () => {
      expect(helper.getOrder(20000).unit).toBe('万')
    })
    it('小于万返回空单位', () => {
      expect(helper.getOrder(100).unit).toBe('')
    })
    it('边界值使用严格大于', () => {
      expect(helper.getOrder(10000)).toEqual({ order: 1, unit: '' })
      expect(helper.getOrder(10001)).toEqual({ order: 10000, unit: '万' })
      expect(helper.getOrder(100000000)).toEqual({ order: 10000, unit: '万' })
    })
    it('零与负数返回无量级', () => {
      expect(helper.getOrder(0)).toEqual({ order: 1, unit: '' })
      expect(helper.getOrder(-100000)).toEqual({ order: 1, unit: '' })
    })
  })

  describe('sortDate', () => {
    it('默认倒序排列日期字符串', () => {
      expect(helper.sortDate(['2023-01-01', '2023-01-03', '2023-01-02'])).toEqual(['2023-01-03', '2023-01-02', '2023-01-01'])
    })
    it('升序排列日期字符串', () => {
      expect(helper.sortDate(['2023-01-03', '2023-01-01', '2023-01-02'], 'asc')).toEqual(['2023-01-01', '2023-01-02', '2023-01-03'])
    })
    it('不修改源数组', () => {
      const dates = ['2023-01-02', '2023-01-01']
      helper.sortDate(dates)
      expect(dates).toEqual(['2023-01-02', '2023-01-01'])
    })
    it('非数组返回空数组', () => {
      expect(helper.sortDate(null)).toEqual([])
      expect(helper.sortDate('2023-01-01')).toEqual([])
    })
    it('空数组返回空数组', () => {
      expect(helper.sortDate([])).toEqual([])
    })
  })

  describe('uniqueByKey', () => {
    it('默认按 id 去重并保留首次出现', () => {
      const list: Row[] = [{ id: 1, n: 'a' }, { id: 1, n: 'b' }, { id: 2, n: 'c' }]
      expect(helper.uniqueByKey(list).map((i: Row) => i.n)).toEqual(['a', 'c'])
    })
    it('支持自定义主键字段', () => {
      const list: Row[] = [{ c: 'x', n: 'a' }, { c: 'x', n: 'b' }, { c: 'y', n: 'c' }]
      expect(helper.uniqueByKey(list, 'c').map((i: Row) => i.n)).toEqual(['a', 'c'])
    })
    it('缺少主键字段的元素按 undefined 去重', () => {
      const list: Row[] = [{ n: 'a' }, { n: 'b' }]
      expect(helper.uniqueByKey(list, 'id').map((i: Row) => i.n)).toEqual(['a'])
    })
    it('非数组返回空数组', () => {
      expect(helper.uniqueByKey(null)).toEqual([])
    })
    it('空数组返回空数组', () => {
      expect(helper.uniqueByKey([])).toEqual([])
    })
  })

  describe('getMaxAndMin', () => {
    it('返回含上下浮动的坐标范围', () => {
      expect(helper.getMaxAndMin([1, 2, 3])).toEqual({ min_y: 0.75, max_y: 3.25 })
    })
    it('自定义小数位', () => {
      expect(helper.getMaxAndMin([1, 2, 3], 3)).toEqual({ min_y: 0.75, max_y: 3.25 })
    })
    it('全零数据返回 0 到 1', () => {
      expect(helper.getMaxAndMin([0, 0])).toEqual({ min_y: 0, max_y: 1 })
    })
    it('空数据返回 0 到 1', () => {
      expect(helper.getMaxAndMin([])).toEqual({ min_y: 0, max_y: 1 })
    })
    it('相等非零数据保持原值', () => {
      expect(helper.getMaxAndMin([5, 5, 5])).toEqual({ min_y: 5, max_y: 5 })
    })
    it('含负数数据同样给出范围', () => {
      expect(helper.getMaxAndMin([-2, 2])).toEqual({ min_y: -2.5, max_y: 2.5 })
    })
  })

  describe('iosDate', () => {
    it('把短横线替换为斜杠以兼容 iOS', () => {
      expect(helper.iosDate('2023-01-01 12:00:00')).toBe(`${DAY1} 12:00:00`)
    })
    it('空值原样返回', () => {
      expect(helper.iosDate('')).toBe('')
      expect(helper.iosDate(null)).toBeNull()
      expect(helper.iosDate(0)).toBe(0)
    })
  })

  describe('getUrlParams', () => {
    it('获取指定参数', () => {
      expect(helper.getUrlParams('a=1&b=2', 'b')).toBe('2')
    })
    it('不存在的参数返回 null', () => {
      expect(helper.getUrlParams('a=1', 'b')).toBeNull()
    })
    it('空查询串返回 null', () => {
      expect(helper.getUrlParams('', 'a')).toBeNull()
    })
    it('空参数名返回 null', () => {
      expect(helper.getUrlParams('a=1', '')).toBeNull()
    })
    it('默认不做解码', () => {
      expect(helper.getUrlParams('a=%E4%B8%AD&b=2', 'a')).toBe('%E4%B8%AD')
    })
    it('decode 为 true 时解码中文', () => {
      expect(helper.getUrlParams('a=%E4%B8%AD&b=2', 'a', true)).toBe('中')
    })
    it('取最后一个参数', () => {
      expect(helper.getUrlParams('a=1&b=2&c=3', 'c')).toBe('3')
    })
  })
})
