import { describe, it, expect } from 'vitest'
import { escapeHtml, escapeRegExp } from '../../../../src/format/html'

describe('utils/format/html.ts', () => {
  describe('escapeHtml', () => {
    it('转义尖括号与引号', () => {
      expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
      expect(escapeHtml("it's a \"test\"")).toBe('it&#39;s a &quot;test&quot;')
    })
    it('转义 and 符号', () => {
      expect(escapeHtml('a&b')).toBe('a&amp;b')
    })
    it('普通字符串原样返回', () => {
      expect(escapeHtml('abc123')).toBe('abc123')
      expect(escapeHtml('')).toBe('')
    })
    it('非字符串入参抛 TypeError', () => {
      expect(() => escapeHtml(123 as any)).toThrow(TypeError)
    })
  })

  describe('escapeRegExp', () => {
    it('为正则元字符添加转义', () => {
      expect(escapeRegExp('a.b')).toBe('a\\.b')
      expect(escapeRegExp('[abc]')).toBe('\\[abc\\]')
      expect(escapeRegExp('(x)')).toBe('\\(x\\)')
      expect(escapeRegExp('a*b')).toBe('a\\*b')
    })
    it('普通字符与空串原样返回', () => {
      expect(escapeRegExp('abc')).toBe('abc')
      expect(escapeRegExp('')).toBe('')
    })
  })
})
