import { describe, it, expect } from 'vitest'
import * as format from '../../../../src/format/index'
import $format from '../../../../src/format/index'
import { PLACEHOLDER } from '../../../../src/format/number'
import { formatDate } from '../../../../src/format/date'
import { formatCurrency } from '../../../../src/format/currency'
import { escapeHtml } from '../../../../src/format/html'

const NAMED_EXPORTS = [
  'PLACEHOLDER',
  'isFalseValue',
  'unitPercent',
  'toFixed',
  'toFixedWithUnit',
  'numberFormat',
  'formatDate',
  'formatPublishedTime',
  'formatCurrency',
  'mathAdd',
  'mathSubtract',
  'mathMultiply',
  'mathDivide',
  'escapeHtml',
  'escapeRegExp',
  'generateAxisTicks'
]

describe('utils/format/index.ts', () => {
  it('具名导出完整且类型正确', () => {
    Object.keys(format).forEach(key => {
      if (key === 'default') return
      expect(NAMED_EXPORTS).toContain(key)
    })
    expect(Object.keys(format).sort()).toEqual([...NAMED_EXPORTS, 'default'].sort())
    expect(format.PLACEHOLDER).toBe('--')
    NAMED_EXPORTS.filter(key => key !== 'PLACEHOLDER').forEach(key => {
      expect(typeof (format as any)[key]).toBe('function')
    })
  })

  it('default 导出包含全部工具函数', () => {
    expect(Object.keys($format).sort()).toEqual(NAMED_EXPORTS.slice().sort())
    expect($format.PLACEHOLDER).toBe(PLACEHOLDER)
  })

  it('具名导出与子模块导出指向同一实现', () => {
    expect(format.formatDate).toBe(formatDate)
    expect(format.formatCurrency).toBe(formatCurrency)
    expect(format.escapeHtml).toBe(escapeHtml)
    expect($format.formatDate).toBe(formatDate)
    expect($format.escapeHtml).toBe(escapeHtml)
  })

  it('通过入口调用可正常执行各子模块逻辑', () => {
    expect(format.toFixed(1.239)).toBe('1.24')
    expect(format.formatDate('2023-01-05')).toBe('2023-01-05')
    expect(format.formatCurrency(1234.5)).toBe('1,234.50')
    expect(format.escapeHtml('<b>')).toBe('&lt;b&gt;')
    expect(format.isFalseValue('--')).toBe(true)
  })
})
