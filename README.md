# web-fns

纯 JS 工具函数库：数字 / 日期 / 金额格式化、常见校验、Storage / Cookie、DOM 辅助函数。

**零第三方依赖**，不耦合任何框架，Vue2 / Vue3 / React 均可直接使用。TypeScript 编写并自带类型声明，JS 项目同样适用。

## 安装

```bash
npm install web-fns
```

## 使用

```js
import { formatCurrency, mathAdd, formatDate, isBankCard, setStorage } from 'web-fns'

formatCurrency(1234.5)          // '1,234.50'
mathAdd([0.1, 0.2])             // 0.3（定点整数运算，无浮点误差）
formatDate('2023-01-05')        // '2023-01-05'
isBankCard('6222020000000000000') // Luhn 校验
setStorage('key', { a: 1 })     // localStorage
```

子入口按需引入：

```js
import { formatCurrency } from 'web-fns/format'
```

## API 概览

| 模块 | 函数 |
|------|------|
| format | PLACEHOLDER、isFalseValue、unitPercent、toFixed、toFixedWithUnit、numberFormat、formatDate、formatPublishedTime、formatCurrency、mathAdd、mathSubtract、mathMultiply、mathDivide、escapeHtml、escapeRegExp、generateAxisTicks |
| validate | isPhoneNumber、isEmail、isIdCard、isBankCard、isUrl、isStockCode |
| cache | setStorage / getStorage / getAllStorage / removeStorage / clearStorage / setCookie / getCookie（Cookie 为原生实现，支持 expires / path / domain / secure / sameSite） |
| helper | sortByKey、sortByDate、uniqueArray、hasOwnProperty、getTimestamp、replaceUrlParam、getOrder、sortDate、uniqueByKey、getMaxAndMin、iosDate、getUrlParams |
| dom | goPage、getParentOrigin、postParentMessage、setParentOrigin |

## 特性

- 零运行时依赖，体积小
- 金额四则运算基于定点整数，规避浮点误差
- 日期函数兼容 iOS 的 `-` 格式
- ESM 输出，Node >= 16
- 单测覆盖率 100%

## License

[MIT](./LICENSE)
