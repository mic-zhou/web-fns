/**
 * lite-kit —— 数字格式化（零依赖）
 */

/** 默认占位符，用于表示无效数据 */
export const PLACEHOLDER = '--'

/** 判断数据是否为假值（null / undefined / '' / 占位符） */
export const isFalseValue = (data: unknown): boolean => [null, PLACEHOLDER, undefined, ''].includes(data as string)

/**
 * 转换成百分数
 * @param data 待处理的数据
 * @param gap 是否需要扩大源数据
 * @param len 转换之后保留几位小数
 */
export const unitPercent = (data: unknown, gap = 1, len = 2): string => {
  if (isFalseValue(data) || isNaN(Number(data))) return PLACEHOLDER
  return `${(Number(data) * gap).toFixed(len)}%`
}

/**
 * 格式化数据，保留小数
 * @param data 待处理的数据
 * @param len 需要保留的小数位数
 */
export const toFixed = (data: unknown, len = 2): string => {
  if (isFalseValue(data)) return PLACEHOLDER
  return Number(data).toFixed(len)
}

/**
 * 格式化数据，保留小数并携带单位
 * @param data 待处理数据
 * @param len 需要保留的小数位数
 * @param unit 需要携带的单位
 */
export const toFixedWithUnit = (data: unknown, len = 2, unit = ''): string => {
  if (isFalseValue(data)) return PLACEHOLDER
  return `${Number(data).toFixed(len)}${unit}`
}

/**
 * 数字转换，超过一万自动换算单位
 * @param data 待转换的数字
 * @param gap 倍率
 * @param decimalSize 保留小数位数
 * @param isUnit 是否携带单位
 * @example numberFormat(2000000) // => '200.00万'
 */
export const numberFormat = (data: unknown, gap = 1, decimalSize = 2, isUnit = true): string => {
  const isNumber = (v: unknown): v is number => typeof v === 'number'
  if (!isNumber(data) || !isNumber(gap) || !isNumber(decimalSize)) return PLACEHOLDER
  const num = data * gap
  const isNegative = num < 0
  const param = isNegative ? Math.abs(num) : num
  let value, unit
  const sizes = ['', '万', '亿', '万亿', '亿亿']
  let index = 0
  const defaultSize = 10000
  if (param < defaultSize) {
    value = param.toFixed(decimalSize)
    unit = ''
  } else {
    index = Math.floor(Math.log(param) / Math.log(defaultSize))
    value = (param / Math.pow(defaultSize, index)).toFixed(decimalSize)
    unit = sizes[index]
  }
  const result = isUnit ? `${value}${unit}` : value
  return isNegative ? `-${result}` : result
}
