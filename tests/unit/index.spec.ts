import { describe, it, expect } from 'vitest'
import * as liteKit from '../../src/index.js'
import * as format from '../../src/format/index.js'
import cache from '../../src/cache.js'
import validate from '../../src/validate.js'
import helper from '../../src/helper.js'
import { goPage, getParentOrigin, postParentMessage, setParentOrigin } from '../../src/dom.js'

describe('src/index.ts 主入口', () => {
  it('聚合导出 format/cache/validate/helper/dom 的全部能力', () => {
    expect(liteKit.formatCurrency).toBe(format.formatCurrency)
    expect(liteKit.setStorage).toBe(cache.setStorage)
    expect(liteKit.isStockCode).toBe(validate.isStockCode)
    expect(liteKit.uniqueByKey).toBe(helper.uniqueByKey)
    expect(liteKit.goPage).toBe(goPage)
    expect(liteKit.getParentOrigin).toBe(getParentOrigin)
    expect(liteKit.postParentMessage).toBe(postParentMessage)
    expect(liteKit.setParentOrigin).toBe(setParentOrigin)
    expect(typeof liteKit.generateAxisTicks).toBe('function')
  })
  it('入口功能可用', () => {
    expect(liteKit.formatCurrency(1234.5)).toBe('1,234.50')
    expect(liteKit.isEmail('a@b.com')).toBe(true)
  })
})
