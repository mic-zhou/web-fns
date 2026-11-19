# web-fns

纯 JS 工具函数库：数字 / 日期 / 金额格式化、常见校验、Storage / Cookie、DOM 辅助函数。

**零第三方依赖**，不耦合任何框架，Vue2 / Vue3 / React 均可直接使用。TypeScript 编写并自带类型声明，JS 项目同样适用。

## 安装

```bash
npm install web-fns
```

## 快速上手

```js
import { formatCurrency, mathAdd, formatDate, isBankCard, setStorage } from 'web-fns'

formatCurrency(1234.5)            // '1,234.50'
mathAdd([0.1, 0.2])               // 0.3（定点整数运算，无浮点误差）
formatDate('2023-01-05')          // '2023-01-05'
setStorage('key', { a: 1 })       // localStorage
```

子入口按需引入（tree-shaking 友好）：

```js
import { formatCurrency, mathAdd } from 'web-fns/format'
```

---

# API 手册

## format —— 格式化

### PLACEHOLDER

无效数据的默认占位符，值为 `'--'`。

### isFalseValue(data)

判断是否为假值：`null` / `undefined` / `''` / 占位符 `'--'` 返回 `true`。

```js
isFalseValue(null)      // true
isFalseValue('--')      // true
isFalseValue(0)         // false
```

### unitPercent(data, gap = 1, len = 2)

转成百分数字符串。`gap` 用于源数据需要扩大的场景（如小数形式的比例 ×100 时传 `gap=100`），`len` 保留小数位。

```js
unitPercent(0.05)         // '5.00%'
unitPercent(5, 1, 0)      // '5%'
unitPercent('--')         // '--'
```

### toFixed(data, len = 2)

保留小数位，假值返回占位符 `'--'`。

```js
toFixed(1.239)       // '1.24'
toFixed(1.2, 3)      // '1.200'
toFixed(null)        // '--'
```

### toFixedWithUnit(data, len = 2, unit = '')

保留小数位并拼接单位，假值返回占位符 `'--'`。

```js
toFixedWithUnit(1.239, 2, '元')   // '1.24元'
toFixedWithUnit(3.1, 0, '%')     // '3%'
```

### numberFormat(data, gap = 1, decimalSize = 2, isUnit = true)

数字按「万 → 亿 → 万亿」自动换算单位。`gap` 为倍率，`isUnit` 控制是否带单位，只接受 number 入参。

```js
numberFormat(2000000)          // '200.00万'
numberFormat(120000000)        // '1.20亿'
numberFormat(-2000000)         // '-200.00万'
numberFormat(50, 10000)        // '50.00万'（50 × 10000 倍率）
```

### formatDate(date, formatter = 'date', isPad = true)

时间格式化，兼容 iOS（自动把 `-` 转 `/`）。`formatter` 支持三种形态：

- 快捷名：`'date'`（yyyy-MM-dd）、`'datetime'`（yyyy-MM-dd HH:mm:ss）
- 自定义模板：`yyyy` `MM` `dd` `HH` `mm` `ss` `ms` 任意组合
- 格式化函数：`(dateInfo) => string`

非法日期返回 `'--'`；`isPad = false` 时不补零。

```js
formatDate('2023-01-05')                          // '2023-01-05'
formatDate(1672877330007, 'datetime')             // '2023-01-05 08:08:50'
formatDate(new Date(), 'yyyy/MM/dd HH:mm')        // '2026/11/19 14:30'
formatDate(ts, info => `${info.yyyy}年`)           // '2023年'
formatDate(ts, 'MM-dd HH:mm', false)              // '1-5 8:9'（不补零）
```

### formatPublishedTime(dateStr)

资讯发布时间展示规则：今天显示 `HH:mm`，同年非今天显示 `MM-dd`，跨年显示 `yyyy-MM-dd`。

```js
formatPublishedTime('2026-11-19 09:30')   // 今天 => '09:30'
formatPublishedTime('2026-11-01 09:30')   // 同年 => '11-01'
formatPublishedTime('2024-12-01 09:30')   // 跨年 => '2024-12-01'
```

### formatCurrency(money, options)

金额千分位格式化，四舍五入到 `precision` 位。空值 / 不可解析值按 `0` 输出。

| options | 默认 | 说明 |
|---------|------|------|
| `symbol` | `''` | 金额符号，如 `'¥'` `'$'` |
| `separator` | `','` | 千分位分隔符 |
| `decimal` | `'.'` | 小数点符号 |
| `precision` | `2` | 小数位数 |

```js
formatCurrency(1234567.891)                  // '1,234,567.89'
formatCurrency(-1234.567)                    // '-1,234.57'
formatCurrency('1234.5')                     // '1,234.50'
formatCurrency(null)                         // '0.00'
formatCurrency(1234.56, { precision: 0 })    // '1,235'
formatCurrency(1234.5, { symbol: '¥' })      // '¥1,234.50'
formatCurrency(1234567.89, { separator: ' ' }) // '1 234 567.89'
```

### mathAdd(params, precision = 2)

定点整数加法（规避浮点误差），传数组累加。非数字元素按 `0` 参与，非数组抛 `TypeError`。

```js
mathAdd([0.1, 0.2])          // 0.3
mathAdd([1.1, 2.2, 3.3])     // 6.6
mathAdd(['a', 1])            // 1
mathAdd([])                  // 0
```

### mathSubtract(subtraction, subtracted, precision = 2)

定点整数减法。

```js
mathSubtract(10.1, 3.2)      // 6.9
mathSubtract(1, 3, 3)        // -2
mathSubtract(null, 1)        // -1（空值按 0）
```

### mathMultiply(params, precision = 2)

定点整数乘法，中间结果保留 10 位精度不被截断，传数组累乘。

```js
mathMultiply([1.1, 1.1])       // 1.21
mathMultiply([1.005, 100])     // 100.5
mathMultiply([2, 3, 4])        // 24
```

### mathDivide(dividend, divisor, precision = 2)

定点整数除法。除数为 `0` / 空值 / `'--'` 抛 `Error`。

```js
mathDivide(10, 2)          // 5
mathDivide(10, 3)          // 3.33
mathDivide(10, 3, 4)       // 3.3333
mathDivide(10, 0)          // Error: divisor must not be zero or empty
```

### escapeHtml(str)

转义 HTML 特殊字符（`& < > " '`），防 XSS。

```js
escapeHtml('<b>"x"</b>')   // '&lt;b&gt;&quot;x&quot;&lt;/b&gt;'
```

### escapeRegExp(str)

转义正则元字符，用于动态构造正则。

```js
escapeRegExp('a.b(1)')     // 'a\\.b\\(1\\)'
new RegExp(escapeRegExp(userInput), 'g')   // 安全地用用户输入建正则
```

### generateAxisTicks(min, max, segments = 4)

计算 ECharts 坐标轴「好看」的整数刻度：min/max 对齐到整刻度并返回刻度数组，解决轴标签出现长小数的问题。

```js
generateAxisTicks(12.3, 88.7, 4)
// { min: 0, max: 100, interval: 25, ticks: [0, 25, 50, 75, 100] }
generateAxisTicks(3, 3, 4)      // { min: 0, max: 4, interval: 1, ticks: [0,1,2,3,4] }
```

---

## validate —— 校验

### isPhoneNumber(phoneNumber)

中国大陆手机号。

```js
isPhoneNumber('13812345678')   // true
isPhoneNumber('12345678901')   // false
```

### isEmail(email)

邮箱格式。

```js
isEmail('a.b+c@test.com')   // true
isEmail('a@b')              // false
```

### isIdCard(idCard)

身份证号，支持 15 位；18 位含校验码验证。

```js
isIdCard('11010519491231002X')   // true（18 位合法校验码）
isIdCard('110105491231002')      // true（15 位）
isIdCard('110105194912310021')   // false（校验码不对）
```

### isBankCard(cardNo)

银行卡号 Luhn 算法校验（13-19 位数字，可含空格）。

```js
isBankCard('6225768888888888')           // 按 Luhn 校验
isBankCard('6222 0202 0011 2233 000')    // 自动去空格
```

### isUrl(url)

URL 格式（基于原生 `URL` 构造器）。

```js
isUrl('https://example.com/a?b=1')   // true
isUrl('example.com')                 // false
```

### isStockCode(code)

证券代码：6 位数字 + 可选市场后缀（`.SH` `.SZ` `.BJ` `.HK` `.US` `.OF`，大写）。

```js
isStockCode('600570')          // true
isStockCode('600570.SH')       // true
isStockCode('000700.HK')       // true
isStockCode('600570.sh')       // false（后缀必须大写）
isStockCode(600570)            // false（只接受字符串）
```

---

## cache —— Storage / Cookie

### setStorage(key, value, type = 'localStorage')

写 storage，自动 `JSON.stringify`；空值（`''` / `null` / `undefined`）存为 `null`；异常静默（隐私模式兜底）。

```js
setStorage('user', { id: 1 })
setStorage('token', 'abc', 'sessionStorage')
```

### getStorage(key, type = 'localStorage')

读 storage，自动反序列化；不存在返回 `null`；非 JSON 字符串原样返回。

```js
getStorage('user')               // { id: 1 }
getStorage('token', 'sessionStorage')
getStorage('not-exist')          // null
```

### getAllStorage(type = 'localStorage')

返回指定 storage 全部键值对：`[{ key, value }]`。

```js
getAllStorage()   // [{ key: 'user', value: { id: 1 } }, ...]
```

### removeStorage(key, type = 'localStorage')

删除指定键。

```js
removeStorage('user')
```

### clearStorage(type = 'localStorage')

清空指定 storage。

```js
clearStorage('sessionStorage')   // 只清 session，不动 localStorage
```

### setCookie(name, value, options)

原生 `document.cookie` 实现写 cookie，零依赖。

| options | 说明 |
|---------|------|
| `expires` | 过期时间：数字（天数）或 Date 实例 |
| `path` | 路径 |
| `domain` | 域名 |
| `secure` | 仅 https |
| `sameSite` | `'Strict'` / `'Lax'` / `'None'` |

```js
setCookie('token', 'abc123')
setCookie('token', 'abc123', { expires: 7, path: '/' })          // 7 天
setCookie('token', 'abc123', { expires: new Date('2026-12-31') })
```

### getCookie(name)

读 cookie，不存在返回 `undefined`。

```js
getCookie('token')      // 'abc123'
getCookie('nope')       // undefined
```

---

## helper —— 数组 / URL / 时间辅助

### sortByKey(origin, sortKey, type)

按字段排序对象数组（不修改原数组），假值排末尾（`asc`）或队首（`desc`）。`type`：`'asc'` / `'desc'`，非法值返回原序副本。

```js
sortByKey([{ v: 3 }, { v: 1 }, { v: null }], 'v', 'asc')
// [{ v: 1 }, { v: 3 }, { v: null }]
```

### sortByDate(origin, dateKey, type)

按时间字段排序（兼容 iOS `-` 日期），不修改原数组。

```js
sortByDate([{ d: '2023-01-02' }, { d: '2023-01-01' }], 'd', 'asc')
// [{ d: '2023-01-01' }, { d: '2023-01-02' }]
```

### uniqueArray(arr)

一维数组去重。

```js
uniqueArray([1, 2, 2, 3])   // [1, 2, 3]
uniqueArray(null)           // []
```

### hasOwnProperty(obj, key)

安全版属性判断（不依赖对象自身的 hasOwnProperty，可判定任意 key）。

```js
hasOwnProperty({ a: 1 }, 'a')    // true
hasOwnProperty(Object.create(null), 'a')   // false
```

### getTimestamp(date)

取时间戳，兼容 iOS `-` 日期；13 位整型时间戳原样返回；空值 / 无效日期返回 `NaN`。

```js
getTimestamp('2023-01-01')     // 1672502400000
getTimestamp(1672502400000)    // 原样返回
getTimestamp('abc')            // NaN
```

### replaceUrlParam(url, key, value)

替换 URL 中某个 query 参数，不存在则追加。

```js
replaceUrlParam('a.com?p=1&q=2', 'p', 9)   // 'a.com?p=9&q=2'
replaceUrlParam('a.com', 'p', 9)           // 'a.com?p=9'
```

### getOrder(value)

获取数值量级与中文单位（万亿 / 亿 / 万）。

```js
getOrder(150000000)      // { order: 100000000, unit: '亿' }
getOrder(50000)          // { order: 10000, unit: '万' }
getOrder(100)            // { order: 1, unit: '' }
```

### sortDate(dates, type = 'desc')

纯日期数组排序，默认倒序，不修改原数组。

```js
sortDate(['2023-01-02', '2023-01-01'])   // ['2023-01-02', '2023-01-01']
sortDate(['2023-01-02', '2023-01-01'], 'asc')
```

### uniqueByKey(list, key = 'id')

对象数组按 key 去重（保留首次出现）。

```js
uniqueByKey([{ id: 1, n: 'a' }, { id: 1, n: 'b' }, { id: 2, n: 'c' }])
// [{ id: 1, n: 'a' }, { id: 2, n: 'c' }]
```

### getMaxAndMin(allYData, num = 2)

计算数组 min/max 并向外扩 1/8 量程（图表 Y 轴留白），全零时 max 抬到 1。

```js
getMaxAndMin([10, 20])       // { min_y: 8.75, max_y: 21.25 }
getMaxAndMin([0, 0])         // { min_y: 0, max_y: 1 }
```

### iosDate(date)

iOS 日期兼容：`-` 替换 `/`。

```js
iosDate('2023-01-05')   // '2023/01/05'（iOS 的 new Date('2023-01-05') 会 NaN）
```

### getUrlParams(search, key, decode = false)

从 querystring（不含开头 `?`）取参数值，取不到返回 `null`；`decode = true` 时做 `decodeURIComponent`。

```js
getUrlParams('a=1&b=%E4%B8%AD', 'a')          // '1'
getUrlParams('a=1&b=%E4%B8%AD', 'b', true)    // '中'
```

---

## dom —— 页面跳转 / iframe 通信

### goPage(page, options = {}, target = '_self')

hash 路由统一跳转（基于 URL API）。`options` 为附加 query 参数，`target = '_blank'` 新窗口打开。

```js
goPage('home')                        // location.hash => '#/home'
goPage('detail', { code: '600570' })  // ?code=600570#/detail
goPage('home', {}, '_blank')          // window.open
```

### setParentOrigin(origin)

显式指定父窗口 origin。iframe 跨域嵌入宿主时，由应用注入环境变量值：

```js
setParentOrigin(import.meta.env.VITE_PARENT_ORIGIN)
```

### getParentOrigin()

解析 postMessage 应用的 targetOrigin：优先 `setParentOrigin` 注入值；未配置时读父窗口 origin；跨域读不到时降级 `'*'`。

### postParentMessage(message)

向父容器发 postMessage（自动带上正确的 targetOrigin）。

```js
postParentMessage({ type: 'close' })
```

---

## 特性

- 零运行时依赖，体积小
- 金额四则运算基于定点整数，规避浮点误差
- 日期函数兼容 iOS 的 `-` 格式
- ESM 输出，Node >= 16
- 单测覆盖率 100%

## License

[MIT](./LICENSE)
