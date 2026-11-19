import { describe, it, expect } from 'vitest'
import validate, { isPhoneNumber, isEmail, isIdCard, isBankCard, isUrl, isStockCode } from '../../../src/validate'

describe('utils/validate.ts', () => {
  describe('模块导出', () => {
    it('默认导出包含全部校验函数', () => {
      expect(Object.keys(validate)).toEqual([
        'isPhoneNumber',
        'isEmail',
        'isIdCard',
        'isBankCard',
        'isUrl',
        'isStockCode'
      ])
    })
    it('具名导出与默认导出指向同一实现', () => {
      expect(isPhoneNumber).toBe(validate.isPhoneNumber)
      expect(isEmail).toBe(validate.isEmail)
      expect(isIdCard).toBe(validate.isIdCard)
      expect(isBankCard).toBe(validate.isBankCard)
      expect(isUrl).toBe(validate.isUrl)
      expect(isStockCode).toBe(validate.isStockCode)
    })
  })

  describe('isPhoneNumber', () => {
    it('识别合法手机号（字符串）', () => {
      expect(validate.isPhoneNumber('13812345678')).toBe(true)
    })
    it('识别合法手机号（数字）', () => {
      expect(validate.isPhoneNumber(13812345678)).toBe(true)
    })
    it('识别各号段的第二位', () => {
      expect(validate.isPhoneNumber('14812345678')).toBe(true)
      expect(validate.isPhoneNumber('19912345678')).toBe(true)
      expect(validate.isPhoneNumber('12812345678')).toBe(false)
    })
    it('拒绝过短号码', () => {
      expect(validate.isPhoneNumber('1381234567')).toBe(false)
    })
    it('拒绝过长号码', () => {
      expect(validate.isPhoneNumber('138123456789')).toBe(false)
    })
    it('拒绝包含非数字字符的号码', () => {
      expect(validate.isPhoneNumber('1381234567a')).toBe(false)
    })
    it('拒绝带空格与带连字符的号码', () => {
      expect(validate.isPhoneNumber(' 13812345678')).toBe(false)
      expect(validate.isPhoneNumber('138-1234-5678')).toBe(false)
    })
    it('拒绝空值', () => {
      expect(validate.isPhoneNumber('')).toBe(false)
      expect(validate.isPhoneNumber(null)).toBe(false)
      expect(validate.isPhoneNumber(undefined)).toBe(false)
    })
    it('非字符串非数字返回 false', () => {
      expect(validate.isPhoneNumber({})).toBe(false)
      expect(validate.isPhoneNumber([])).toBe(false)
      expect(validate.isPhoneNumber(true)).toBe(false)
    })
  })

  describe('isEmail', () => {
    it('识别合法邮箱', () => {
      expect(validate.isEmail('test@example.com')).toBe(true)
    })
    it('识别带加号与下划线的用户名', () => {
      expect(validate.isEmail('a+b@example.com')).toBe(true)
      expect(validate.isEmail('a_b@example.com')).toBe(true)
    })
    it('识别多级域名', () => {
      expect(validate.isEmail('a@example.co.uk')).toBe(true)
    })
    it('识别大写与连字符域名', () => {
      expect(validate.isEmail('A1@e-c.com')).toBe(true)
    })
    it('拒绝域名中的下划线', () => {
      expect(validate.isEmail('a@ex_ample.com')).toBe(false)
    })
    it('拒绝以分隔符开头的用户名', () => {
      expect(validate.isEmail('.a@example.com')).toBe(false)
    })
    it('拒绝过短的顶级域名', () => {
      expect(validate.isEmail('a@e.c')).toBe(false)
    })
    it('拒绝无 @ 的字符串', () => {
      expect(validate.isEmail('testexample.com')).toBe(false)
    })
    it('拒绝空值', () => {
      expect(validate.isEmail('')).toBe(false)
      expect(validate.isEmail(null)).toBe(false)
      expect(validate.isEmail(undefined)).toBe(false)
    })
    it('非字符串入参被隐式转换后仍不通过', () => {
      expect(validate.isEmail(123)).toBe(false)
      expect(validate.isEmail({})).toBe(false)
    })
  })

  describe('isIdCard', () => {
    it('识别合法 18 位身份证号', () => {
      expect(validate.isIdCard('110101199003074178')).toBe(true)
    })
    it('识别校验位为 X 的身份证号', () => {
      expect(validate.isIdCard('11010119900307416X')).toBe(true)
    })
    it('识别小写 x 校验位', () => {
      expect(validate.isIdCard('11010119900307416x')).toBe(true)
    })
    it('校验位错误返回 false', () => {
      expect(validate.isIdCard('110101199003074168')).toBe(false)
    })
    it('识别合法 15 位身份证号', () => {
      expect(validate.isIdCard('110101900307417')).toBe(true)
    })
    it('15 位号码支持数字入参', () => {
      expect(validate.isIdCard(110101900307417)).toBe(true)
    })
    it('拒绝长度不合法的号码', () => {
      expect(validate.isIdCard('1101011990030741')).toBe(false)
      expect(validate.isIdCard('1101011990030741789')).toBe(false)
    })
    it('拒绝含非法字符的号码', () => {
      expect(validate.isIdCard('110101199003074Y78')).toBe(false)
    })
    it('拒绝空值', () => {
      expect(validate.isIdCard('')).toBe(false)
      expect(validate.isIdCard(null)).toBe(false)
      expect(validate.isIdCard(undefined)).toBe(false)
    })
    it('非字符串非数字返回 false', () => {
      expect(validate.isIdCard({})).toBe(false)
      expect(validate.isIdCard([])).toBe(false)
    })
  })

  describe('isBankCard', () => {
    it('识别合法银行卡号（Luhn算法）', () => {
      expect(validate.isBankCard('6225880137268844')).toBe(true)
    })
    it('忽略卡号中的空格', () => {
      expect(validate.isBankCard('6225 8801 3726 8844')).toBe(true)
    })
    it('支持数字入参', () => {
      expect(validate.isBankCard(6225880137268844)).toBe(true)
    })
    it('识别 13 位合法卡号', () => {
      expect(validate.isBankCard('1111111111112')).toBe(true)
    })
    it('识别 19 位合法卡号', () => {
      expect(validate.isBankCard('1111111111111111113')).toBe(true)
    })
    it('Luhn 校验失败返回 false', () => {
      expect(validate.isBankCard('1234567890123456')).toBe(false)
      expect(validate.isBankCard('1111111111111')).toBe(false)
    })
    it('拒绝长度不在 13 到 19 之间的卡号', () => {
      expect(validate.isBankCard('123456789012')).toBe(false)
      expect(validate.isBankCard('62258801372688456789')).toBe(false)
    })
    it('拒绝含字母的卡号', () => {
      expect(validate.isBankCard('622588013726884A')).toBe(false)
    })
    it('拒绝空值与非字符串非数字', () => {
      expect(validate.isBankCard('')).toBe(false)
      expect(validate.isBankCard(null)).toBe(false)
      expect(validate.isBankCard({})).toBe(false)
    })
  })

  describe('isUrl', () => {
    it('识别合法URL', () => {
      expect(validate.isUrl('https://example.com')).toBe(true)
    })
    it('识别 http 与 ftp 协议', () => {
      expect(validate.isUrl('http://example.com')).toBe(true)
      expect(validate.isUrl('ftp://example.com')).toBe(true)
    })
    it('识别带路径与查询串的 URL', () => {
      expect(validate.isUrl('https://example.com/a/b?x=1#hash')).toBe(true)
    })
    it('识别非 http 的特殊协议', () => {
      expect(validate.isUrl('mailto:foo@bar.com')).toBe(true)
    })
    it('拒绝协议省略写法的 URL', () => {
      expect(validate.isUrl('//example.com')).toBe(false)
    })
    it('拒绝非法URL', () => {
      expect(validate.isUrl('not-a-url')).toBe(false)
    })
    it('拒绝空串', () => {
      expect(validate.isUrl('')).toBe(false)
    })
    it('拒绝非字符串', () => {
      expect(validate.isUrl(123)).toBe(false)
      expect(validate.isUrl(null)).toBe(false)
      expect(validate.isUrl(undefined)).toBe(false)
    })
  })

  describe('isStockCode', () => {
    it('识别6位股票代码', () => {
      expect(validate.isStockCode('600570')).toBe(true)
    })
    it('识别带市场后缀的代码', () => {
      expect(validate.isStockCode('600570.SH')).toBe(true)
      expect(validate.isStockCode('000001.SZ')).toBe(true)
    })
    it('识别全部支持的市场后缀', () => {
      expect(validate.isStockCode('600570.BJ')).toBe(true)
      expect(validate.isStockCode('000700.HK')).toBe(true)
      expect(validate.isStockCode('123456.US')).toBe(true)
      expect(validate.isStockCode('012345.OF')).toBe(true)
    })
    it('后缀必须大写', () => {
      expect(validate.isStockCode('600570.sh')).toBe(false)
    })
    it('拒绝未知市场后缀', () => {
      expect(validate.isStockCode('600570.XX')).toBe(false)
    })
    it('拒绝长度不合法的代码', () => {
      expect(validate.isStockCode('600570')).toBe(true)
      expect(validate.isStockCode('1234567')).toBe(false)
      expect(validate.isStockCode('12345')).toBe(false)
    })
    it('拒绝非法代码', () => {
      expect(validate.isStockCode('abc')).toBe(false)
    })
    it('拒绝空值', () => {
      expect(validate.isStockCode('')).toBe(false)
      expect(validate.isStockCode(null)).toBe(false)
    })
    it('拒绝非字符串', () => {
      expect(validate.isStockCode(123)).toBe(false)
      expect(validate.isStockCode(600570)).toBe(false)
    })
  })
})
