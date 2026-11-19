import { describe, it, expect } from 'vitest'
import { generateAxisTicks } from '../../../../src/format/axis'

describe('utils/format/axis.ts', () => {
  describe('generateAxisTicks', () => {
    it('整数区间返回好看刻度', () => {
      const result = generateAxisTicks(0, 10)
      expect(result).toEqual({ min: 0, max: 10, interval: 5, ticks: [0, 5, 10] })
    })
    it('fraction <= 1 时 interval 取 1', () => {
      const result = generateAxisTicks(0, 4, 4)
      expect(result.interval).toBe(1)
      expect(result.ticks).toEqual([0, 1, 2, 3, 4])
    })
    it('fraction <= 2 时 interval 取 2', () => {
      const result = generateAxisTicks(0, 8, 4)
      expect(result.interval).toBe(2)
      expect(result.ticks).toEqual([0, 2, 4, 6, 8])
    })
    it('fraction <= 5 时 interval 进位到 5', () => {
      const result = generateAxisTicks(0, 90, 4)
      expect(result.interval).toBe(50)
      expect(result.ticks).toEqual([0, 50, 100])
    })
    it('fraction > 5 时 interval 进位到 10', () => {
      const result = generateAxisTicks(0, 6, 1)
      expect(result.interval).toBe(10)
      expect(result.ticks).toEqual([0, 10])
    })
    it('支持负数区间', () => {
      const result = generateAxisTicks(-100, -50)
      expect(result.min).toBe(-100)
      expect(result.max).toBe(-40)
      expect(result.ticks).toEqual([-100, -80, -60, -40])
    })
    it('小数区间按精度取整', () => {
      const result = generateAxisTicks(0, 1, 5)
      expect(result.interval).toBe(0.2)
      expect(result.ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    })
    it('min 与 max 同为 0 时按分段数生成 0..n', () => {
      const result = generateAxisTicks(0, 0)
      expect(result).toEqual({ min: 0, max: 4, interval: 1, ticks: [0, 1, 2, 3, 4] })
      expect(generateAxisTicks(0, 0, 2).ticks).toEqual([0, 1, 2])
    })
    it('min 等于 max（非 0）时按 10% 外扩', () => {
      const result = generateAxisTicks(5, 5)
      expect(result.min).toBe(4.5)
      expect(result.max).toBe(5.5)
      expect(result.ticks).toEqual([4.5, 5, 5.5])
    })
    it('极小的 min 等于 max 时至少外扩 1', () => {
      const result = generateAxisTicks(0.0000001, 0.0000001)
      expect(result.max).toBeGreaterThan(result.min)
    })
    it('min 等于 max 且外扩量下溢为 0 时按 1 兜底', () => {
      expect(generateAxisTicks(Number.MIN_VALUE, Number.MIN_VALUE)).toEqual({
        min: -1,
        max: 1,
        interval: 0.5,
        ticks: [-1, -0.5, 0, 0.5, 1]
      })
      expect(generateAxisTicks(-Number.MIN_VALUE, -Number.MIN_VALUE).min).toBe(-1)
    })
    it('segments 非正数时回退为 4', () => {
      expect(generateAxisTicks(0, 10, 0)).toEqual(generateAxisTicks(0, 10, 4))
      expect(generateAxisTicks(0, 10, -3)).toEqual(generateAxisTicks(0, 10))
    })
    it('ticks 首尾与 min / max 一致且等间距', () => {
      const { min, max, interval, ticks } = generateAxisTicks(3.7, 96.2, 4)
      expect(ticks[0]).toBe(min)
      expect(ticks[ticks.length - 1]).toBe(max)
      ticks.slice(1).forEach((t, i) => {
        expect(Number((t - ticks[i]).toFixed(4))).toBeCloseTo(interval, 3)
      })
    })
  })
})
