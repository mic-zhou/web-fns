/**
 * lite-kit —— 常见表单校验（零依赖）
 */

/** 手机号判断 */
export const isPhoneNumber = (phoneNumber: unknown): boolean => {
  if (typeof phoneNumber !== 'string' && typeof phoneNumber !== 'number') return false
  return /^1[3456789]\d{9}$/.test(String(phoneNumber))
}

/** 邮箱判断 */
export const isEmail = (email: unknown): boolean => {
  if (typeof email !== 'string') return false
  return /^[a-zA-Z0-9]+([._+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/.test(email)
}

/** 身份证号判断（支持 15 位和 18 位，18 位含校验码验证） */
export const isIdCard = (idCard: unknown): boolean => {
  if (typeof idCard !== 'string' && typeof idCard !== 'number') return false
  const str = String(idCard)
  if (/^\d{17}[\dXx]$/.test(str)) {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += Number(str[i]) * weights[i]
    }
    return str[17].toUpperCase() === checkCodes[sum % 11]
  }
  return /^\d{15}$/.test(str)
}

/** 银行卡号判断（Luhn 算法，13-19 位数字） */
export const isBankCard = (cardNo: unknown): boolean => {
  if (typeof cardNo !== 'string' && typeof cardNo !== 'number') return false
  const str = String(cardNo).replace(/\s/g, '')
  if (!/^\d{13,19}$/.test(str)) return false
  let sum = 0
  let isEven = false
  for (let i = str.length - 1; i >= 0; i--) {
    let digit = Number(str[i])
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

/** URL 判断（借助原生 URL 构造器） */
export const isUrl = (url: unknown): boolean => {
  if (typeof url !== 'string') return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/** 股票代码判断（6 位纯数字 + 可选市场后缀 .SH/.SZ/.BJ/.HK/.US/.OF） */
export const isStockCode = (code: unknown): boolean => {
  if (typeof code !== 'string') return false
  return /^\d{6}(\.(SH|SZ|BJ|HK|US|OF))?$/.test(code)
}

export default {
  isPhoneNumber,
  isEmail,
  isIdCard,
  isBankCard,
  isUrl,
  isStockCode
}
