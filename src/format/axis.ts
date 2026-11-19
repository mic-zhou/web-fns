/**
 * lite-kit —— ECharts 坐标轴刻度计算（零依赖）
 */

/**
 * 计算 ECharts 坐标轴「好看」的刻度：min/max 对齐到整刻度，返回刻度数组
 * @param min 数据最小值
 * @param max 数据最大值
 * @param segments 期望的刻度分段数
 */
export const generateAxisTicks = (
  min: number,
  max: number,
  segments: number = 4
): { min: number; max: number; interval: number; ticks: number[] } => {
  if (segments <= 0) segments = 4
  if (min === max) {
    if (min === 0) {
      return { min: 0, max: segments, interval: 1, ticks: Array.from({ length: segments + 1 }, (_, i) => i) }
    }
    const pad = Math.abs(min) * 0.1 || 1
    min -= pad
    max += pad
  }

  const range = max - min
  const rawInterval = range / segments
  const exponent = Math.floor(Math.log10(rawInterval))
  const base = Math.pow(10, exponent)
  const fraction = rawInterval / base

  let niceFraction: number
  if (fraction <= 1) niceFraction = 1
  else if (fraction <= 2) niceFraction = 2
  else if (fraction <= 5) niceFraction = 5
  else niceFraction = 10

  const interval = niceFraction * base
  const niceMin = Math.floor(min / interval) * interval
  const niceMax = Math.ceil(max / interval) * interval

  const decimals = Math.max(0, -exponent)
  const factor = Math.pow(10, decimals)
  const ticks: number[] = []
  for (let v = niceMin; v <= niceMax + interval * 0.001; v += interval) {
    ticks.push(Math.round(v * factor) / factor)
  }

  return {
    min: Math.round(niceMin * factor) / factor,
    max: Math.round(niceMax * factor) / factor,
    interval: Math.round(interval * factor) / factor,
    ticks
  }
}
