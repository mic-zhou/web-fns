import { describe, it, expect } from 'vitest'
import {
  PLACEHOLDER,
  isFalseValue,
  unitPercent,
  toFixed,
  toFixedWithUnit,
  numberFormat
} from '../../../../src/format/number'

describe('utils/format/number.ts', () => {
  describe('PLACEHOLDER', () => {
    it('默认占位符为两个短横线', () => {
      expect(PLACEHOLDER).toBe('--')
    })
  })

  describe('isFalseValue', () => {
    it('空值与占位符判定为 false 值', () => {
      expect(isFalseValue(null)).toBe(true)
      expect(isFalseValue(undefined)).toBe(true)
      expect(isFalseValue('')).toBe(true)
      expect(isFalseValue(PLACEHOLDER)).toBe(true)
    })
    it('0 与 false 属于有效数据', () => {
      expect(isFalseValue(0)).toBe(false)
      expect(isFalseValue(false)).toBe(false)
      expect(isFalseValue(NaN)).toBe(false)
    })
    it('普通文本判定为有效数据', () => {
      expect(isFalseValue('abc')).toBe(false)
      expect(isFalseValue(' ')).toBe(false)
    })
  })

  describe('unitPercent', () => {
    it('默认保留两位小数', () => {
      expect(unitPercent(12.3456)).toBe('12.35%')
    })
    it('支持倍率放大', () => {
      expect(unitPercent(0.1234, 100)).toBe('12.34%')
    })
    it('支持自定义小数位数', () => {
      expect(unitPercent(0.123456, 100, 3)).toBe('12.346%')
      expect(unitPercent(1.6, 1, 0)).toBe('2%')
    })
    it('数字字符串可以正常转换', () => {
      expect(unitPercent('5' as any)).toBe('5.00%')
    })
    it('负数保留负号', () => {
      expect(unitPercent(-3.14159, 1, 2)).toBe('-3.14%')
    })
    it('空值与非数字返回占位符', () => {
      expect(unitPercent(null as any)).toBe(PLACEHOLDER)
      expect(unitPercent('' as any)).toBe(PLACEHOLDER)
      expect(unitPercent(PLACEHOLDER as any)).toBe(PLACEHOLDER)
      expect(unitPercent('abc' as any)).toBe(PLACEHOLDER)
      expect(unitPercent(NaN)).toBe(PLACEHOLDER)
      expect(unitPercent(undefined as any)).toBe(PLACEHOLDER)
    })
  })

  describe('toFixed', () => {
    it('默认保留两位小数', () => {
      expect(toFixed(1.239)).toBe('1.24')
      expect(toFixed(5)).toBe('5.00')
    })
    it('支持自定义小数位数', () => {
      expect(toFixed(1.23456, 3)).toBe('1.235')
      expect(toFixed(1.2, 0)).toBe('1')
    })
    it('负数与字符串数字', () => {
      expect(toFixed(-1.5, 1)).toBe('-1.5')
      expect(toFixed('2.5' as any, 1)).toBe('2.5')
    })
    it('空值返回占位符', () => {
      expect(toFixed(null as any)).toBe(PLACEHOLDER)
      expect(toFixed(undefined as any)).toBe(PLACEHOLDER)
      expect(toFixed('' as any)).toBe(PLACEHOLDER)
    })
    it('非数字字符串转成 NaN', () => {
      expect(toFixed('abc' as any)).toBe('NaN')
    })
  })

  describe('toFixedWithUnit', () => {
    it('拼接单位', () => {
      expect(toFixedWithUnit(1.5, 1, '元')).toBe('1.5元')
      expect(toFixedWithUnit(2, 2, '万股')).toBe('2.00万股')
    })
    it('默认无单位、保留两位小数', () => {
      expect(toFixedWithUnit(3.14159)).toBe('3.14')
    })
    it('空值返回占位符', () => {
      expect(toFixedWithUnit(null as any, 2, '元')).toBe(PLACEHOLDER)
      expect(toFixedWithUnit('' as any)).toBe(PLACEHOLDER)
    })
  })

  describe('numberFormat', () => {
    it('小于万直接保留小数', () => {
      expect(numberFormat(1234)).toBe('1234.00')
    })
    it('一万进位为万', () => {
      expect(numberFormat(10000)).toBe('1.00万')
      expect(numberFormat(2000000)).toBe('200.00万')
    })
    it('支持亿与万亿', () => {
      expect(numberFormat(300000000)).toBe('3.00亿')
      expect(numberFormat(4000000000000)).toBe('4.00万亿')
    })
    it('支持倍率与小数位数', () => {
      expect(numberFormat(2000000, 0.5)).toBe('100.00万')
      expect(numberFormat(2000000, 1, 0)).toBe('200万')
    })
    it('负数保留负号', () => {
      expect(numberFormat(-2000000)).toBe('-200.00万')
      expect(numberFormat(-1234, 1, 1)).toBe('-1234.0')
    })
    it('参数非数字时返回占位符', () => {
      expect(numberFormat('100' as any)).toBe(PLACEHOLDER)
      expect(numberFormat(null as any)).toBe(PLACEHOLDER)
      expect(numberFormat(100, '1' as any)).toBe(PLACEHOLDER)
      expect(numberFormat(100, 1, '2' as any)).toBe(PLACEHOLDER)
    })
    it('isUnit 为 false 时省略单位但保留进位结果', () => {
      expect(numberFormat(2000000, 1, 2, false)).toBe('200.00')
      expect(numberFormat(100000000, 1, 2, false)).toBe('1.00')
      expect(numberFormat(9999, 1, 2, false)).toBe('9999.00')
      expect(numberFormat(-250000, 1, 2, false)).toBe('-25.00')
    })
    it('isUnit 默认为 true，显式传 true 与默认一致', () => {
      expect(numberFormat(2000000, 1, 2)).toBe('200.00万')
      expect(numberFormat(2000000, 1, 2, true)).toBe('200.00万')
      expect(numberFormat(-250000, 1, 2, true)).toBe('-25.00万')
    })
    it('NaN 输出中包含 NaN', () => {
      expect(numberFormat(NaN)).toContain('NaN')
    })
  })
})
