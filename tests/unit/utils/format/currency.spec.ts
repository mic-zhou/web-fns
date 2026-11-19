import { describe, it, expect } from 'vitest'
import { formatCurrency, mathAdd, mathSubtract, mathMultiply, mathDivide } from '../../../../src/format/currency'

describe('utils/format/currency.ts', () => {
  describe('formatCurrency', () => {
    it('默认无货币符号、千分位、保留两位小数', () => {
      expect(formatCurrency(1234567.891)).toBe('1,234,567.89')
      expect(formatCurrency(0)).toBe('0.00')
    })
    it('支持字符串形式的金额', () => {
      expect(formatCurrency('1234.5')).toBe('1,234.50')
    })
    it('负数保留负号', () => {
      expect(formatCurrency(-1234.567)).toBe('-1,234.57')
    })
    it('空值入参输出零值', () => {
      expect(formatCurrency(null as any)).toBe('0.00')
      expect(formatCurrency(undefined as any)).toBe('0.00')
      expect(formatCurrency('')).toBe('0.00')
    })
    it('可以通过 options 覆盖 precision/symbol/separator', () => {
      expect(formatCurrency(1234.56, { precision: 0 })).toBe('1,235')
      expect(formatCurrency(1234.5, { symbol: '¥' })).toBe('¥1,234.50')
      expect(formatCurrency(1234567.89, { separator: ' ' })).toBe('1 234 567.89')
    })
  })

  describe('mathAdd', () => {
    it('累加数组中的数值', () => {
      expect(mathAdd([1, 2, 3])).toBe(6)
      expect(mathAdd([1.1, 2.2])).toBe(3.3)
    })
    it('空数组返回 0，单元素返回自身', () => {
      expect(mathAdd([])).toBe(0)
      expect(mathAdd([5])).toBe(5)
    })
    it('支持数字字符串数组', () => {
      expect(mathAdd(['1', '2'] as any)).toBe(3)
    })
    it('precision 参数控制小数位', () => {
      expect(mathAdd([1.005, 1.005], 0)).toBe(2)
    })
    it('非数字元素按 0 参与运算', () => {
      expect(mathAdd(['a', 1] as any)).toBe(1)
    })
    it('非数组入参抛 TypeError', () => {
      expect(() => mathAdd(123 as any)).toThrow(TypeError)
      expect(() => mathAdd('1,2' as any)).toThrow('mathAdd: params must be an array')
    })
  })

  describe('mathSubtract', () => {
    it('正常相减', () => {
      expect(mathSubtract(10, 3)).toBe(7)
      expect(mathSubtract(10.1, 3.2)).toBe(6.9)
    })
    it('结果为负数', () => {
      expect(mathSubtract(0, 5)).toBe(-5)
    })
    it('空值被减数按 0 处理', () => {
      expect(mathSubtract(null as any, 1)).toBe(-1)
    })
    it('precision 参数生效', () => {
      expect(mathSubtract(1, 3, 3)).toBe(-2)
    })
  })

  describe('mathMultiply', () => {
    it('累乘数组中的数值', () => {
      expect(mathMultiply([2, 3])).toBe(6)
      expect(mathMultiply([1.1, 1.1])).toBe(1.21)
    })
    it('中间结果保留高精度，不被最终 precision 截断', () => {
      expect(mathMultiply([1.005, 100])).toBe(100.5)
    })
    it('空数组返回 0，单元素返回自身', () => {
      expect(mathMultiply([])).toBe(0)
      expect(mathMultiply([7])).toBe(7)
    })
    it('precision 参数控制小数位', () => {
      expect(mathMultiply([1.234, 2], 0)).toBe(2)
    })
    it('非数组入参抛 TypeError', () => {
      expect(() => mathMultiply('a' as any)).toThrow('mathMultiply: params must be an array')
    })
  })

  describe('mathDivide', () => {
    it('正常相除', () => {
      expect(mathDivide(10, 2)).toBe(5)
      expect(mathDivide(10, 3)).toBe(3.33)
    })
    it('precision 参数控制小数位', () => {
      expect(mathDivide(10, 3, 4)).toBe(3.3333)
    })
    it('除数为 0 抛错', () => {
      expect(() => mathDivide(10, 0)).toThrow('mathDivide: divisor must not be zero or empty')
    })
    it('除数为假值或占位符抛错', () => {
      expect(() => mathDivide(10, '')).toThrow(Error)
      expect(() => mathDivide(10, null as any)).toThrow(Error)
      expect(() => mathDivide(10, undefined as any)).toThrow(Error)
      expect(() => mathDivide(10, '--')).toThrow(Error)
    })
  })

  describe('零依赖重写的边界行为', () => {
    it('Infinity/NaN 按 0 处理', () => {
      expect(formatCurrency(Infinity as any)).toBe('0.00')
      expect(formatCurrency(NaN as any)).toBe('0.00')
    })
    it('科学计数法展开成普通小数', () => {
      expect(formatCurrency('1e-2')).toBe('0.01')
      expect(formatCurrency('1e2')).toBe('100.00')
      expect(formatCurrency('-1e-3')).toBe('0.00')
    })
    it('省略整数部分的小数', () => {
      expect(formatCurrency('.5')).toBe('0.50')
    })
    it('非数字字符串按 0 处理', () => {
      expect(formatCurrency('abc')).toBe('0.00')
    })
    it('超长数字串按 0 处理', () => {
      expect(formatCurrency('9'.repeat(400))).toBe('0.00')
    })
    it('科学计数法参与四则运算', () => {
      expect(mathAdd(['1e2', '1e2'], 0)).toBe(200)
    })
    it('纯符号串按 0 处理', () => {
      expect(formatCurrency('-')).toBe('0.00')
      expect(formatCurrency('+')).toBe('0.00')
    })
    it('科学计数法溢出按 0 处理', () => {
      expect(formatCurrency('1e999')).toBe('0.00')
    })
    it('precision >= 10 时跳过精度移动', () => {
      expect(mathAdd([1.1, 2.2], 10)).toBe(3.3)
    })
  })
})
