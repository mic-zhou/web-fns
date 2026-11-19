/**
 * web-fns —— 格式化工具出口
 */

export { PLACEHOLDER, isFalseValue, unitPercent, toFixed, toFixedWithUnit, numberFormat } from './number.js'
export { formatDate, formatPublishedTime } from './date.js'
export { formatCurrency, mathAdd, mathSubtract, mathMultiply, mathDivide } from './currency.js'
export { escapeHtml, escapeRegExp } from './html.js'
export { generateAxisTicks } from './axis.js'

import { PLACEHOLDER, isFalseValue, unitPercent, toFixed, toFixedWithUnit, numberFormat } from './number.js'
import { formatDate, formatPublishedTime } from './date.js'
import { formatCurrency, mathAdd, mathSubtract, mathMultiply, mathDivide } from './currency.js'
import { escapeHtml, escapeRegExp } from './html.js'
import { generateAxisTicks } from './axis.js'

// 兼容 default import
export default {
  PLACEHOLDER,
  isFalseValue,
  unitPercent,
  toFixed,
  toFixedWithUnit,
  numberFormat,
  formatDate,
  formatPublishedTime,
  formatCurrency,
  mathAdd,
  mathSubtract,
  mathMultiply,
  mathDivide,
  escapeHtml,
  escapeRegExp,
  generateAxisTicks
}
