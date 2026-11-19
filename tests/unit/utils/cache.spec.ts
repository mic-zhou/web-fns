import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import cache, {
  setStorage,
  getStorage,
  getAllStorage,
  removeStorage,
  clearStorage,
  setCookie,
  getCookie
} from '../../../src/cache'

interface KV {
  key: string
  value: unknown
}

const clearCookies = () => {
  document.cookie.split(';').forEach((item: string) => {
    const name = item.split('=')[0].trim()
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })
}

describe('utils/cache.ts', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    clearCookies()
  })

  afterEach(() => {
    clearCookies()
    vi.restoreAllMocks()
  })

  describe('模块导出', () => {
    it('默认导出包含全部缓存方法', () => {
      expect(Object.keys(cache)).toEqual([
        'setStorage',
        'getStorage',
        'getAllStorage',
        'removeStorage',
        'clearStorage',
        'setCookie',
        'getCookie'
      ])
    })
    it('具名导出与默认导出指向同一实现', () => {
      expect(setStorage).toBe(cache.setStorage)
      expect(getStorage).toBe(cache.getStorage)
      expect(getAllStorage).toBe(cache.getAllStorage)
      expect(removeStorage).toBe(cache.removeStorage)
      expect(clearStorage).toBe(cache.clearStorage)
      expect(setCookie).toBe(cache.setCookie)
      expect(getCookie).toBe(cache.getCookie)
    })
  })

  describe('setStorage / getStorage', () => {
    it('存取字符串', () => {
      cache.setStorage('name', 'hello')
      expect(cache.getStorage('name')).toBe('hello')
    })
    it('存取对象', () => {
      cache.setStorage('user', { id: 1, name: 'test' })
      expect(cache.getStorage('user')).toEqual({ id: 1, name: 'test' })
    })
    it('存取数组', () => {
      cache.setStorage('list', [1, 2, 3])
      expect(cache.getStorage('list')).toEqual([1, 2, 3])
    })
    it('存 null 时存储为 null', () => {
      cache.setStorage('nullval', null)
      expect(cache.getStorage('nullval')).toBeNull()
    })
    it('存 undefined 时存储为 null', () => {
      cache.setStorage('undef', undefined)
      expect(cache.getStorage('undef')).toBeNull()
    })
    it('存空字符串时按空值处理', () => {
      cache.setStorage('empty', '')
      expect(window.localStorage.getItem('empty')).toBe('null')
      expect(cache.getStorage('empty')).toBeNull()
    })
    it('存数字 0 与布尔 false', () => {
      cache.setStorage('zero', 0)
      cache.setStorage('flag', false)
      expect(cache.getStorage('zero')).toBe(0)
      expect(cache.getStorage('flag')).toBe(false)
    })
    it('存 NaN 时序列化为 null', () => {
      cache.setStorage('nan', NaN)
      expect(cache.getStorage('nan')).toBeNull()
    })
    it('不存在的 key 返回 null', () => {
      expect(cache.getStorage('notexist')).toBeNull()
    })
    it('支持 sessionStorage', () => {
      cache.setStorage('ss', 'val', 'sessionStorage')
      expect(cache.getStorage('ss', 'sessionStorage')).toBe('val')
    })
    it('两种 storage 相互隔离', () => {
      cache.setStorage('only', 'ls')
      expect(cache.getStorage('only', 'sessionStorage')).toBeNull()
    })
    it('原始值为 null 字符串时返回 null', () => {
      window.localStorage.setItem('rawNull', 'null')
      expect(cache.getStorage('rawNull')).toBeNull()
    })
    it('原始值为数字时返回解析后的数字', () => {
      window.localStorage.setItem('rawNum', '123')
      expect(cache.getStorage('rawNum')).toBe(123)
    })
    it('原始值为非 JSON 字符串时返回原始值', () => {
      window.localStorage.setItem('bad', 'not-json')
      expect(cache.getStorage('bad')).toBe('not-json')
    })
    it('非法 storage 类型时写入静默返回', () => {
      expect(cache.setStorage('k', 'v', 'indexedDB')).toBeUndefined()
      expect(window.localStorage.getItem('k')).toBeNull()
    })
    it('非法 storage 类型时读取返回 null', () => {
      cache.setStorage('k', 'v')
      expect(cache.getStorage('k', 'cookie')).toBeNull()
    })
  })

  describe('getAllStorage', () => {
    it('返回当前 storage 中所有键值对', () => {
      cache.setStorage('a', 1)
      cache.setStorage('b', 'hello')
      const all: KV[] = cache.getAllStorage()
      const keys = all.map((i: KV) => i.key)
      expect(keys).toEqual(expect.arrayContaining(['a', 'b']))
    })
    it('键值对结构与存入内容一致', () => {
      cache.setStorage('obj', { x: 1 })
      const all: KV[] = cache.getAllStorage()
      expect(all.find((i: KV) => i.key === 'obj')).toEqual({ key: 'obj', value: { x: 1 } })
    })
    it('空 storage 返回空数组', () => {
      expect(cache.getAllStorage()).toEqual([])
    })
    it('支持读取 sessionStorage', () => {
      cache.setStorage('ssKey', 'ssVal', 'sessionStorage')
      expect(cache.getAllStorage('sessionStorage')).toEqual([{ key: 'ssKey', value: 'ssVal' }])
    })
    it('存在非 JSON 值时回退为原始值且不报错', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      cache.setStorage('ok', 1)
      window.localStorage.setItem('bad', 'not-json')
      expect(cache.getAllStorage()).toEqual(
        expect.arrayContaining([{ key: 'ok', value: 1 }, { key: 'bad', value: 'not-json' }])
      )
      expect(errSpy).not.toHaveBeenCalled()
      errSpy.mockRestore()
    })
    it('非法 storage 类型返回空数组', () => {
      expect(cache.getAllStorage('cookie')).toEqual([])
    })
  })

  describe('removeStorage', () => {
    it('删除指定 key', () => {
      cache.setStorage('a', 1)
      cache.setStorage('b', 2)
      cache.removeStorage('a')
      expect(cache.getStorage('a')).toBeNull()
      expect(cache.getStorage('b')).toBe(2)
    })
    it('删除不存在的 key 不报错', () => {
      expect(() => cache.removeStorage('ghost')).not.toThrow()
    })
    it('支持删除 sessionStorage', () => {
      cache.setStorage('ss', 'v', 'sessionStorage')
      cache.removeStorage('ss', 'sessionStorage')
      expect(cache.getStorage('ss', 'sessionStorage')).toBeNull()
    })
    it('非法 storage 类型时不删除', () => {
      cache.setStorage('a', 1)
      expect(cache.removeStorage('a', 'foo')).toBeUndefined()
      expect(cache.getStorage('a')).toBe(1)
    })
  })

  describe('clearStorage', () => {
    it('清空所有 storage', () => {
      cache.setStorage('a', 1)
      cache.setStorage('b', 2)
      cache.clearStorage()
      expect(cache.getStorage('a')).toBeNull()
      expect(cache.getStorage('b')).toBeNull()
    })
    it('只清空指定类型', () => {
      cache.setStorage('ls', 1)
      cache.setStorage('ss', 2, 'sessionStorage')
      cache.clearStorage('sessionStorage')
      expect(cache.getStorage('ls')).toBe(1)
      expect(cache.getStorage('ss', 'sessionStorage')).toBeNull()
    })
    it('非法 storage 类型时不清空', () => {
      cache.setStorage('a', 1)
      expect(cache.clearStorage('foo')).toBeUndefined()
      expect(cache.getStorage('a')).toBe(1)
    })
  })

  describe('setCookie / getCookie', () => {
    it('写入后可读取同名 cookie', () => {
      cache.setCookie('tk', 'abc123')
      expect(cache.getCookie('tk')).toBe('abc123')
    })
    it('cookie 真实落到 document.cookie', () => {
      cache.setCookie('tk', 'abc123')
      expect(document.cookie).toBe('tk=abc123')
    })
    it('读取不存在的 cookie 返回 undefined', () => {
      expect(cache.getCookie('nope')).toBeUndefined()
    })
    it('支持传入 options 且不抛错', () => {
      expect(() => cache.setCookie('exp', 'v', { expires: 1, path: '/' })).not.toThrow()
      expect(cache.getCookie('exp')).toBe('v')
    })
    it('同名 cookie 后写覆盖先写', () => {
      cache.setCookie('tk', 'first')
      cache.setCookie('tk', 'second')
      expect(cache.getCookie('tk')).toBe('second')
    })
    it('非法百分号编码的 cookie 值原样返回', () => {
      document.cookie = 'bad=%E0%A4%A'
      expect(cache.getCookie('bad')).toBe('%E0%A4%A')
    })
    it('解码失败时原样返回', () => {
      cache.setCookie('enc', 'hello')
      vi.stubGlobal('decodeURIComponent', () => {
        throw new Error('bad encoding')
      })
      try {
        expect(cache.getCookie('enc')).toBe('hello')
      } finally {
        vi.unstubAllGlobals()
      }
    })
    it('expires 支持 Date 实例', () => {
      const writes: string[] = []
      const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!
      Object.defineProperty(Document.prototype, 'cookie', {
        get: () => '',
        set(v: string) {
          writes.push(v)
        },
        configurable: true
      })
      try {
        cache.setCookie('d', 'v', { expires: new Date(Date.now() + 864e5) })
        expect(writes[0]).toContain('expires=')
      } finally {
        Object.defineProperty(Document.prototype, 'cookie', desc)
      }
    })
    it('domain/secure/sameSite 拼进 cookie 字符串', () => {
      const writes: string[] = []
      const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!
      Object.defineProperty(Document.prototype, 'cookie', {
        get: () => '',
        set(v: string) {
          writes.push(v)
        },
        configurable: true
      })
      try {
        cache.setCookie('full', 'v', { domain: 'example.com', secure: true, sameSite: 'Lax', path: '/' })
        expect(writes[0]).toContain('path=/')
        expect(writes[0]).toContain('domain=example.com')
        expect(writes[0]).toContain('secure')
        expect(writes[0]).toContain('samesite=Lax')
      } finally {
        Object.defineProperty(Document.prototype, 'cookie', desc)
      }
    })
  })

  describe('异常分支', () => {
    /** 临时让 Storage 原型上的某个方法抛错，模拟隐私模式/配额异常 */
    const withStorageMethodThrowing = (method: string, run: () => void) => {
      const proto = Object.getPrototypeOf(window.localStorage)
      const orig = Object.getOwnPropertyDescriptor(proto, method)
      Object.defineProperty(proto, method, {
        value: () => {
          throw new Error(`${method} failed`)
        },
        configurable: true
      })
      try {
        run()
      } finally {
        if (orig) Object.defineProperty(proto, method, orig)
        else delete proto[method]
      }
    }

    /** 临时让 document.cookie 读写抛错，模拟浏览器禁用 cookie */
    const withDocumentCookieThrowing = (run: () => void) => {
      const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!
      Object.defineProperty(Document.prototype, 'cookie', {
        get() {
          throw new Error('cookie disabled')
        },
        set() {
          throw new Error('cookie disabled')
        },
        configurable: true
      })
      try {
        run()
      } finally {
        Object.defineProperty(Document.prototype, 'cookie', desc)
      }
    }

    it('setStorage 异常被 catch', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      withStorageMethodThrowing('setItem', () => {
        expect(() => cache.setStorage('x', 1)).not.toThrow()
      })
      expect(errSpy).toHaveBeenCalled()
      errSpy.mockRestore()
    })
    it('getStorage 异常走 catch 分支返回 null', () => {
      withStorageMethodThrowing('getItem', () => {
        expect(cache.getStorage('x')).toBeNull()
      })
    })
    it('getAllStorage 异常被 catch 并返回空数组', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      withStorageMethodThrowing('key', () => {
        cache.setStorage('a', 1)
        expect(cache.getAllStorage()).toEqual([])
      })
      expect(errSpy).toHaveBeenCalled()
      errSpy.mockRestore()
    })
    it('removeStorage 异常被 catch', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      withStorageMethodThrowing('removeItem', () => {
        expect(() => cache.removeStorage('a')).not.toThrow()
      })
      expect(errSpy).toHaveBeenCalled()
      errSpy.mockRestore()
    })
    it('clearStorage 异常被 catch', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      withStorageMethodThrowing('clear', () => {
        expect(() => cache.clearStorage()).not.toThrow()
      })
      expect(errSpy).toHaveBeenCalled()
      errSpy.mockRestore()
    })
    it('setCookie 异常被 catch', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      withDocumentCookieThrowing(() => {
        expect(() => cache.setCookie('k', 'v')).not.toThrow()
      })
      expect(errSpy).toHaveBeenCalled()
      errSpy.mockRestore()
    })
    it('getCookie 异常被 catch', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      withDocumentCookieThrowing(() => {
        expect(cache.getCookie('k')).toBeUndefined()
      })
      expect(errSpy).toHaveBeenCalled()
      errSpy.mockRestore()
    })
  })
})
