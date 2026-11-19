import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { goPage, getParentOrigin, postParentMessage, setParentOrigin } from '../../../src/dom'

describe('utils/dom.ts', () => {
  beforeEach(() => {
    setParentOrigin('')
    window.location.hash = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getParentOrigin', () => {
    it('未注入 override 时读取父窗口 origin', () => {
      expect(getParentOrigin()).toBe(window.location.origin)
    })
    it('注入 override 后优先使用 override', () => {
      setParentOrigin('https://parent.example.com')
      expect(getParentOrigin()).toBe('https://parent.example.com')
    })
    it('跨域读取父窗口抛错时降级为 *', () => {
      const originDesc = Object.getOwnPropertyDescriptor(window, 'parent')
      Object.defineProperty(window, 'parent', {
        get() {
          throw new Error('cross-origin')
        },
        configurable: true
      })
      try {
        expect(getParentOrigin()).toBe('*')
      } finally {
        if (originDesc) Object.defineProperty(window, 'parent', originDesc)
      }
    })
  })

  describe('postParentMessage', () => {
    it('向父窗口 postMessage 并携带 targetOrigin', () => {
      const spy = vi.fn()
      const parentDesc = Object.getOwnPropertyDescriptor(window, 'parent')
      Object.defineProperty(window, 'parent', { value: { postMessage: spy }, configurable: true })
      try {
        postParentMessage({ type: 'close' })
        // 假 parent 没有 location，getParentOrigin 降级为 '*'
        expect(spy).toHaveBeenCalledWith({ type: 'close' }, '*')
      } finally {
        if (parentDesc) Object.defineProperty(window, 'parent', parentDesc)
      }
    })
    it('window.parent 不存在时直接返回', () => {
      const parentDesc = Object.getOwnPropertyDescriptor(window, 'parent')
      Object.defineProperty(window, 'parent', { value: undefined, configurable: true })
      try {
        expect(() => postParentMessage('x')).not.toThrow()
      } finally {
        if (parentDesc) Object.defineProperty(window, 'parent', parentDesc)
      }
    })
    it('使用注入的 origin 发送', () => {
      setParentOrigin('https://parent.example.com')
      const spy = vi.fn()
      const parentDesc = Object.getOwnPropertyDescriptor(window, 'parent')
      Object.defineProperty(window, 'parent', { value: { postMessage: spy }, configurable: true })
      try {
        postParentMessage('hello')
        expect(spy).toHaveBeenCalledWith('hello', 'https://parent.example.com')
      } finally {
        if (parentDesc) Object.defineProperty(window, 'parent', parentDesc)
      }
    })
  })

  describe('goPage', () => {
    it('默认当前页 hash 跳转', () => {
      goPage('home')
      expect(window.location.hash).toBe('#/home')
    })
    it('附带 query 参数（jsdom 不支持带 query 的导航，走 _blank 捕获 URL 断言）', () => {
      const spy = vi.spyOn(window, 'open').mockImplementation(() => null)
      goPage('detail', { code: '600570', tab: 1 }, '_blank')
      const url = new URL(String(spy.mock.calls[0][0]))
      expect(url.searchParams.get('code')).toBe('600570')
      expect(url.searchParams.get('tab')).toBe('1')
      expect(url.hash).toBe('#/detail')
    })
    it('同名参数被覆盖而非追加', () => {
      const spy = vi.spyOn(window, 'open').mockImplementation(() => null)
      goPage('detail', { code: '1' }, '_blank')
      goPage('detail', { code: '2' }, '_blank')
      const url = new URL(String(spy.mock.calls[1][0]))
      expect(url.searchParams.get('code')).toBe('2')
      expect(url.searchParams.getAll('code')).toHaveLength(1)
    })
    it('_blank 用 window.open 打开', () => {
      const spy = vi.spyOn(window, 'open').mockImplementation(() => null)
      goPage('home', {}, '_blank')
      expect(spy).toHaveBeenCalledTimes(1)
      expect(String(spy.mock.calls[0][0])).toContain('#/home')
    })
  })
})
