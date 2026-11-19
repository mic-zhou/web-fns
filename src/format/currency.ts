/**
 * lite-kit —— 金额格式化与浮点安全四则运算（零依赖）
 *
 * 核心思路：把数值按精度转成「定点整数」后做整数运算，
 * 规避 0.1 + 0.2 !== 0.3 之类的浮点误差，行为与 currency.js 版本对齐。
 */

import { isFalseValue } from './number.js'

export interface FormatCurrencyOptions {
  /** 金额符号，默认为空 */
  symbol?: string
  /** 千分位分隔符，默认为逗号 */
  separator?: string
  /** 小数点符号，默认为 '.' */
  decimal?: string
  /** 小数位数，默认 2 位 */
  precision?: number
}

/** 链式运算的内部精度，保证中间结果不被过早截断 */
const INTERNAL_PRECISION = 10

/**
 * 按精度把数值 / 数字字符串转成定点整数（多余小数位四舍五入），不可解析按 0 处理
 */
const toUnits = (value: unknown, precision: number): number => {
  let str: string
  if (typeof value === 'number') {
    if (!isFinite(value)) return 0
    str = String(value)
  } else if (value == null) {
    return 0
  } else {
    str = String(value).trim().split(',').join('')
    if (str === '') return 0
  }

  let sign = ''
  if (str[0] === '+' || str[0] === '-') {
    sign = str[0]
    str = str.slice(1)
  }
  if (str === '') return 0

  // 科学计数法先展开成普通小数字符串
  if (/e/i.test(str)) {
    const expanded = Number(str)
    if (!isFinite(expanded)) return 0
    str = expanded.toFixed(Math.max(precision, 20))
  }

  const dotIndex = str.indexOf('.')
  let intPart = dotIndex === -1 ? str : str.slice(0, dotIndex)
  const decPart = dotIndex === -1 ? '' : str.slice(dotIndex + 1)
  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(decPart)) return 0
  if (intPart === '') intPart = '0'

  const kept = decPart.slice(0, precision)
  const rest = decPart.slice(precision)
  let units = Number(intPart + (precision > 0 ? kept.padEnd(precision, '0') : ''))
  if (!isFinite(units)) return 0
  if (rest && Number(`0.${rest}`) >= 0.5) units += 1
  return sign === '-' ? -units : units
}

/**
 * 定点整数还原为 number
 */
const fromUnits = (units: number, precision: number): number => {
  const sign = units < 0 ? '-' : ''
  const abs = String(Math.abs(units))
  if (precision === 0) return Number(sign + abs)
  const padded = abs.padStart(precision + 1, '0')
  return Number(`${sign}${padded.slice(0, -precision)}.${padded.slice(-precision)}`)
}

/**
 * 在两种精度之间移动定点整数（高位精度 → 低位精度时四舍五入）
 */
const shiftPrecision = (units: number, from: number, to: number): number => {
  if (to === from) return units
  const scaled = Math.abs(units) / Math.pow(10, from - to)
  return Math.sign(units) * Math.round(scaled)
}

/**
 * 格式化金额数据（千分位 + 固定小数位）
 * @param money 金额（数字或数字字符串，空值按 0 输出）
 * @param options symbol / separator / decimal / precision
 */
export const formatCurrency = (money: unknown, options: FormatCurrencyOptions = {}): string => {
  const { symbol = '', separator = ',', decimal = '.', precision = 2 } = options
  const units = toUnits(money, precision)
  const sign = units < 0 ? '-' : ''
  const abs = String(Math.abs(units))
  const padded = precision > 0 ? abs.padStart(precision + 1, '0') : abs
  const intPart = precision > 0 ? padded.slice(0, -precision) : padded
  const decPart = precision > 0 ? padded.slice(-precision) : ''
  const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return `${sign}${symbol}${withSeparator}${precision > 0 ? decimal + decPart : ''}`
}

/**
 * 四则运算-加法
 * @param params 待累加的数组（非数字元素按 0 参与运算）
 * @param precision 结果保留小数位
 */
export const mathAdd = (params: unknown, precision = 2): number => {
  if (!Array.isArray(params)) throw new TypeError('mathAdd: params must be an array')
  if (params.length === 0) return 0
  if (params.length === 1) return Number(params[0])
  const p = Math.max(precision, INTERNAL_PRECISION)
  const sum = params.reduce((acc: number, cur) => acc + toUnits(cur, p), 0)
  return fromUnits(shiftPrecision(sum, p, precision), precision)
}

/**
 * 四则运算-减法
 * @param subtraction 被减数
 * @param subtracted 减数
 * @param precision 结果保留小数位
 */
export const mathSubtract = (subtraction: unknown, subtracted: unknown, precision = 2): number => {
  const p = Math.max(precision, INTERNAL_PRECISION)
  const diff = toUnits(subtraction, p) - toUnits(subtracted, p)
  return fromUnits(shiftPrecision(diff, p, precision), precision)
}

/**
 * 四则运算-乘法（中间结果保留高精度，不被最终 precision 截断）
 * @param params 待累乘的数组
 * @param precision 结果保留小数位
 */
export const mathMultiply = (params: unknown, precision = 2): number => {
  if (!Array.isArray(params)) throw new TypeError('mathMultiply: params must be an array')
  if (params.length === 0) return 0
  if (params.length === 1) return Number(params[0])
  const p = Math.max(precision, INTERNAL_PRECISION)
  const factor = Math.pow(10, p)
  let acc = toUnits(params[0], p)
  for (let i = 1; i < params.length; i++) {
    const next = toUnits(params[i], p)
    acc = Math.sign(acc) * Math.sign(next) * Math.round((Math.abs(acc) * Math.abs(next)) / factor)
  }
  return fromUnits(shiftPrecision(acc, p, precision), precision)
}

/**
 * 四则运算-除法
 * @param dividend 被除数
 * @param divisor 除数（0 / 空值 / 占位符抛错）
 * @param precision 结果保留小数位
 */
export const mathDivide = (dividend: unknown, divisor: unknown, precision = 2): number => {
  if (isFalseValue(divisor) || Number(divisor) === 0) throw new Error('mathDivide: divisor must not be zero or empty')
  const ratio = toUnits(dividend, INTERNAL_PRECISION) / toUnits(divisor, INTERNAL_PRECISION)
  return fromUnits(Math.round(ratio * Math.pow(10, precision)), precision)
}
