// Generated offline; no runtime schema compilation or eval.
/*
ajv:
The MIT License (MIT)

Copyright (c) 2015-2021 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


ajv-formats:
MIT License

Copyright (c) 2020 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/.pnpm/ajv-formats@3.0.1_ajv@8.20.0/node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS({
  "node_modules/.pnpm/ajv-formats@3.0.1_ajv@8.20.0/node_modules/ajv-formats/dist/formats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
    function fmtDef(validate, compare) {
      return { validate, compare };
    }
    exports.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: fmtDef(date, compareDate),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: fmtDef(getTime(true), compareTime),
      "date-time": fmtDef(getDateTime(true), compareDateTime),
      "iso-time": fmtDef(getTime(), compareIsoTime),
      "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte,
      // signed 32 bit integer
      int32: { type: "number", validate: validateInt32 },
      // signed 64 bit integer
      int64: { type: "number", validate: validateInt64 },
      // C-type float
      float: { type: "number", validate: validateNumber },
      // C-type double
      double: { type: "number", validate: validateNumber },
      // hint to the UI to hide input strings
      password: true,
      // unchecked string payload
      binary: true
    };
    exports.fastFormats = {
      ...exports.fullFormats,
      date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
      time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
      "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
      "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
      "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    };
    exports.formatNames = Object.keys(exports.fullFormats);
    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date(str) {
      const matches = DATE.exec(str);
      if (!matches)
        return false;
      const year = +matches[1];
      const month = +matches[2];
      const day = +matches[3];
      return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
    }
    function compareDate(d1, d2) {
      if (!(d1 && d2))
        return void 0;
      if (d1 > d2)
        return 1;
      if (d1 < d2)
        return -1;
      return 0;
    }
    var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function getTime(strictTimeZone) {
      return function time(str) {
        const matches = TIME.exec(str);
        if (!matches)
          return false;
        const hr = +matches[1];
        const min = +matches[2];
        const sec = +matches[3];
        const tz = matches[4];
        const tzSign = matches[5] === "-" ? -1 : 1;
        const tzH = +(matches[6] || 0);
        const tzM = +(matches[7] || 0);
        if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
          return false;
        if (hr <= 23 && min <= 59 && sec < 60)
          return true;
        const utcMin = min - tzM * tzSign;
        const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
        return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
      };
    }
    function compareTime(s1, s2) {
      if (!(s1 && s2))
        return void 0;
      const t1 = (/* @__PURE__ */ new Date("2020-01-01T" + s1)).valueOf();
      const t2 = (/* @__PURE__ */ new Date("2020-01-01T" + s2)).valueOf();
      if (!(t1 && t2))
        return void 0;
      return t1 - t2;
    }
    function compareIsoTime(t1, t2) {
      if (!(t1 && t2))
        return void 0;
      const a1 = TIME.exec(t1);
      const a2 = TIME.exec(t2);
      if (!(a1 && a2))
        return void 0;
      t1 = a1[1] + a1[2] + a1[3];
      t2 = a2[1] + a2[2] + a2[3];
      if (t1 > t2)
        return 1;
      if (t1 < t2)
        return -1;
      return 0;
    }
    var DATE_TIME_SEPARATOR = /t|\s/i;
    function getDateTime(strictTimeZone) {
      const time = getTime(strictTimeZone);
      return function date_time(str) {
        const dateTime = str.split(DATE_TIME_SEPARATOR);
        return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
      };
    }
    function compareDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const d1 = new Date(dt1).valueOf();
      const d2 = new Date(dt2).valueOf();
      if (!(d1 && d2))
        return void 0;
      return d1 - d2;
    }
    function compareIsoDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
      const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
      const res = compareDate(d1, d2);
      if (res === void 0)
        return void 0;
      return res || compareTime(t1, t2);
    }
    var NOT_URI_FRAGMENT = /\/|:/;
    var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function uri(str) {
      return NOT_URI_FRAGMENT.test(str) && URI.test(str);
    }
    var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function byte(str) {
      BYTE.lastIndex = 0;
      return BYTE.test(str);
    }
    var MIN_INT32 = -(2 ** 31);
    var MAX_INT32 = 2 ** 31 - 1;
    function validateInt32(value) {
      return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
    }
    function validateInt64(value) {
      return Number.isInteger(value);
    }
    function validateNumber() {
      return true;
    }
    var Z_ANCHOR = /[^\\]\\Z/;
    function regex(str) {
      if (Z_ANCHOR.test(str))
        return false;
      try {
        new RegExp(str);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
});

// node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// compiled-contract.js
var schema_BootstrapError = validate53;
function validate53(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate53.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message")) {
        validate53.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message")) {
            validate53.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            const _errs2 = errors;
            if (typeof data.code !== "string") {
              validate53.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate53.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate53.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate53.errors = vErrors;
  return errors === 0;
}
validate53.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_BrowserCallback = validate54;
var formats0 = require_formats().fullFormats.uri;
var func1 = require_ucs2length().default;
var pattern3 = new RegExp("^https?://", "u");
function validate54(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate54.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (errors === 0) {
      if (typeof data === "string") {
        if (func1(data) > 2048) {
          validate54.errors = [{ instancePath, schemaPath: "#/maxLength", keyword: "maxLength", params: { limit: 2048 }, message: "must NOT have more than 2048 characters" }];
          return false;
        } else {
          if (!pattern3.test(data)) {
            validate54.errors = [{ instancePath, schemaPath: "#/pattern", keyword: "pattern", params: { pattern: "^https?://" }, message: 'must match pattern "^https?://"' }];
            return false;
          } else {
            if (!formats0(data)) {
              validate54.errors = [{ instancePath, schemaPath: "#/format", keyword: "format", params: { format: "uri" }, message: 'must match format "uri"' }];
              return false;
            }
          }
        }
      } else {
        validate54.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
        return false;
      }
    }
  }
  validate54.errors = vErrors;
  return errors === 0;
}
validate54.evaluated = { "dynamicProps": false, "dynamicItems": false };
var schema_BrowserCodeExchange = validate55;
var pattern4 = new RegExp("^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$", "u");
function validate56(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate56.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (typeof data === "string") {
      if (func1(data) > 43) {
        validate56.errors = [{ instancePath, schemaPath: "#/maxLength", keyword: "maxLength", params: { limit: 43 }, message: "must NOT have more than 43 characters" }];
        return false;
      } else {
        if (func1(data) < 43) {
          validate56.errors = [{ instancePath, schemaPath: "#/minLength", keyword: "minLength", params: { limit: 43 }, message: "must NOT have fewer than 43 characters" }];
          return false;
        } else {
          if (!pattern4.test(data)) {
            validate56.errors = [{ instancePath, schemaPath: "#/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$" }, message: 'must match pattern "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$"' }];
            return false;
          }
        }
      }
    } else {
      validate56.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
      return false;
    }
  }
  validate56.errors = vErrors;
  return errors === 0;
}
validate56.evaluated = { "dynamicProps": false, "dynamicItems": false };
var pattern5 = new RegExp("^[A-Za-z0-9._~-]{43,128}$", "u");
function validate55(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate55.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.authorization_code === void 0 && (missing0 = "authorization_code") || data.code_verifier === void 0 && (missing0 = "code_verifier") || data.redirect_uri === void 0 && (missing0 = "redirect_uri") || data.state === void 0 && (missing0 = "state")) {
        validate55.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "authorization_code" || key0 === "code_verifier" || key0 === "redirect_uri" || key0 === "state")) {
            validate55.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.authorization_code !== void 0) {
            const _errs2 = errors;
            if (!validate56(data.authorization_code, { instancePath: instancePath + "/authorization_code", parentData: data, parentDataProperty: "authorization_code", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.code_verifier !== void 0) {
              let data1 = data.code_verifier;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 128) {
                    validate55.errors = [{ instancePath: instancePath + "/code_verifier", schemaPath: "#/properties/code_verifier/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 43) {
                      validate55.errors = [{ instancePath: instancePath + "/code_verifier", schemaPath: "#/properties/code_verifier/minLength", keyword: "minLength", params: { limit: 43 }, message: "must NOT have fewer than 43 characters" }];
                      return false;
                    } else {
                      if (!pattern5.test(data1)) {
                        validate55.errors = [{ instancePath: instancePath + "/code_verifier", schemaPath: "#/properties/code_verifier/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._~-]{43,128}$" }, message: 'must match pattern "^[A-Za-z0-9._~-]{43,128}$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate55.errors = [{ instancePath: instancePath + "/code_verifier", schemaPath: "#/properties/code_verifier/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.redirect_uri !== void 0) {
                const _errs5 = errors;
                if (!validate54(data.redirect_uri, { instancePath: instancePath + "/redirect_uri", parentData: data, parentDataProperty: "redirect_uri", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.state !== void 0) {
                  const _errs6 = errors;
                  if (!validate56(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
                    errors = vErrors.length;
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate55.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate55.errors = vErrors;
  return errors === 0;
}
validate55.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_BrowserCodeIssue = validate60;
function validate60(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate60.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.redirect_uri === void 0 && (missing0 = "redirect_uri") || data.state === void 0 && (missing0 = "state") || data.code_challenge === void 0 && (missing0 = "code_challenge") || data.code_challenge_method === void 0 && (missing0 = "code_challenge_method")) {
        validate60.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "redirect_uri" || key0 === "state" || key0 === "code_challenge" || key0 === "code_challenge_method")) {
            validate60.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.redirect_uri !== void 0) {
            const _errs2 = errors;
            if (!validate54(data.redirect_uri, { instancePath: instancePath + "/redirect_uri", parentData: data, parentDataProperty: "redirect_uri", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.state !== void 0) {
              const _errs3 = errors;
              if (!validate56(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.code_challenge !== void 0) {
                const _errs4 = errors;
                if (!validate56(data.code_challenge, { instancePath: instancePath + "/code_challenge", parentData: data, parentDataProperty: "code_challenge", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs4 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.code_challenge_method !== void 0) {
                  const _errs5 = errors;
                  if ("S256" !== data.code_challenge_method) {
                    validate60.errors = [{ instancePath: instancePath + "/code_challenge_method", schemaPath: "#/properties/code_challenge_method/const", keyword: "const", params: { allowedValue: "S256" }, message: "must be equal to constant" }];
                    return false;
                  }
                  var valid0 = _errs5 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate60.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate60.errors = vErrors;
  return errors === 0;
}
validate60.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_BrowserCodeIssued = validate64;
var formats2 = require_formats().fullFormats["date-time"];
function validate64(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate64.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.authorization_code === void 0 && (missing0 = "authorization_code") || data.state === void 0 && (missing0 = "state") || data.redirect_uri === void 0 && (missing0 = "redirect_uri") || data.expires_at === void 0 && (missing0 = "expires_at")) {
        validate64.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "authorization_code" || key0 === "state" || key0 === "redirect_uri" || key0 === "expires_at")) {
            validate64.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.authorization_code !== void 0) {
            const _errs2 = errors;
            if (!validate56(data.authorization_code, { instancePath: instancePath + "/authorization_code", parentData: data, parentDataProperty: "authorization_code", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.state !== void 0) {
              const _errs3 = errors;
              if (!validate56(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.redirect_uri !== void 0) {
                const _errs4 = errors;
                if (!validate54(data.redirect_uri, { instancePath: instancePath + "/redirect_uri", parentData: data, parentDataProperty: "redirect_uri", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs4 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.expires_at !== void 0) {
                  let data3 = data.expires_at;
                  const _errs5 = errors;
                  if (errors === _errs5) {
                    if (errors === _errs5) {
                      if (typeof data3 === "string") {
                        if (!formats2.validate(data3)) {
                          validate64.errors = [{ instancePath: instancePath + "/expires_at", schemaPath: "#/properties/expires_at/format", keyword: "format", params: { format: "date-time" }, message: 'must match format "date-time"' }];
                          return false;
                        }
                      } else {
                        validate64.errors = [{ instancePath: instancePath + "/expires_at", schemaPath: "#/properties/expires_at/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs5 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate64.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate64.errors = vErrors;
  return errors === 0;
}
validate64.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_BrowserNonce = validate68;
function validate68(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate68.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (typeof data === "string") {
      if (func1(data) > 43) {
        validate68.errors = [{ instancePath, schemaPath: "#/maxLength", keyword: "maxLength", params: { limit: 43 }, message: "must NOT have more than 43 characters" }];
        return false;
      } else {
        if (func1(data) < 43) {
          validate68.errors = [{ instancePath, schemaPath: "#/minLength", keyword: "minLength", params: { limit: 43 }, message: "must NOT have fewer than 43 characters" }];
          return false;
        } else {
          if (!pattern4.test(data)) {
            validate68.errors = [{ instancePath, schemaPath: "#/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$" }, message: 'must match pattern "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$"' }];
            return false;
          }
        }
      }
    } else {
      validate68.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
      return false;
    }
  }
  validate68.errors = vErrors;
  return errors === 0;
}
validate68.evaluated = { "dynamicProps": false, "dynamicItems": false };
var schema_CardChannel = validate69;
var schema27 = { "type": "object", "properties": { "id": { "type": "string", "format": "uuid" }, "youtube_channel_id": { "type": ["string", "null"], "pattern": "^UC[A-Za-z0-9_-]{22}$", "minLength": 24, "maxLength": 24 }, "name": { "type": ["string", "null"], "maxLength": 150 }, "url": { "type": "string", "format": "uri", "pattern": "^https://www\\.youtube\\.com/channel/UC[A-Za-z0-9_-]{22}$" }, "identity_verified": { "type": "boolean" }, "association_verified": { "type": "boolean", "description": "Separate video provider proof. Verified channel alone is insufficient. Future context writes recheck proof server-side." } }, "required": ["id", "youtube_channel_id", "name", "identity_verified", "association_verified"], "additionalProperties": false };
var formats4 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
var pattern7 = new RegExp("^UC[A-Za-z0-9_-]{22}$", "u");
var pattern8 = new RegExp("^https://www\\.youtube\\.com/channel/UC[A-Za-z0-9_-]{22}$", "u");
function validate69(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate69.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.youtube_channel_id === void 0 && (missing0 = "youtube_channel_id") || data.name === void 0 && (missing0 = "name") || data.identity_verified === void 0 && (missing0 = "identity_verified") || data.association_verified === void 0 && (missing0 = "association_verified")) {
        validate69.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "id" || key0 === "youtube_channel_id" || key0 === "name" || key0 === "url" || key0 === "identity_verified" || key0 === "association_verified")) {
            validate69.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data0 = data.id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (errors === _errs2) {
                if (typeof data0 === "string") {
                  if (!formats4.test(data0)) {
                    validate69.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                    return false;
                  }
                } else {
                  validate69.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.youtube_channel_id !== void 0) {
              let data1 = data.youtube_channel_id;
              const _errs4 = errors;
              if (typeof data1 !== "string" && data1 !== null) {
                validate69.errors = [{ instancePath: instancePath + "/youtube_channel_id", schemaPath: "#/properties/youtube_channel_id/type", keyword: "type", params: { type: schema27.properties.youtube_channel_id.type }, message: "must be string,null" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 24) {
                    validate69.errors = [{ instancePath: instancePath + "/youtube_channel_id", schemaPath: "#/properties/youtube_channel_id/maxLength", keyword: "maxLength", params: { limit: 24 }, message: "must NOT have more than 24 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 24) {
                      validate69.errors = [{ instancePath: instancePath + "/youtube_channel_id", schemaPath: "#/properties/youtube_channel_id/minLength", keyword: "minLength", params: { limit: 24 }, message: "must NOT have fewer than 24 characters" }];
                      return false;
                    } else {
                      if (!pattern7.test(data1)) {
                        validate69.errors = [{ instancePath: instancePath + "/youtube_channel_id", schemaPath: "#/properties/youtube_channel_id/pattern", keyword: "pattern", params: { pattern: "^UC[A-Za-z0-9_-]{22}$" }, message: 'must match pattern "^UC[A-Za-z0-9_-]{22}$"' }];
                        return false;
                      }
                    }
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.name !== void 0) {
                let data2 = data.name;
                const _errs6 = errors;
                if (typeof data2 !== "string" && data2 !== null) {
                  validate69.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: schema27.properties.name.type }, message: "must be string,null" }];
                  return false;
                }
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 150) {
                      validate69.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/maxLength", keyword: "maxLength", params: { limit: 150 }, message: "must NOT have more than 150 characters" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.url !== void 0) {
                  let data3 = data.url;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (errors === _errs8) {
                      if (typeof data3 === "string") {
                        if (!pattern8.test(data3)) {
                          validate69.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/pattern", keyword: "pattern", params: { pattern: "^https://www\\.youtube\\.com/channel/UC[A-Za-z0-9_-]{22}$" }, message: 'must match pattern "^https://www\\.youtube\\.com/channel/UC[A-Za-z0-9_-]{22}$"' }];
                          return false;
                        } else {
                          if (!formats0(data3)) {
                            validate69.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/format", keyword: "format", params: { format: "uri" }, message: 'must match format "uri"' }];
                            return false;
                          }
                        }
                      } else {
                        validate69.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.identity_verified !== void 0) {
                    const _errs10 = errors;
                    if (typeof data.identity_verified !== "boolean") {
                      validate69.errors = [{ instancePath: instancePath + "/identity_verified", schemaPath: "#/properties/identity_verified/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.association_verified !== void 0) {
                      const _errs12 = errors;
                      if (typeof data.association_verified !== "boolean") {
                        validate69.errors = [{ instancePath: instancePath + "/association_verified", schemaPath: "#/properties/association_verified/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                        return false;
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate69.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate69.errors = vErrors;
  return errors === 0;
}
validate69.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_ChannelRatingWrite = validate70;
var schema28 = { "type": "object", "properties": { "expected_revision": { "type": "integer", "format": "int64", "minimum": 0, "description": "JSON int64. JavaScript clients must reject unsafe integers rather than round a revision or sequence." }, "rating": { "type": ["integer", "null"], "minimum": 1, "maximum": 10 } }, "required": ["expected_revision", "rating"], "additionalProperties": false };
var formats8 = require_formats().fullFormats.int64;
function validate70(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate70.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.expected_revision === void 0 && (missing0 = "expected_revision") || data.rating === void 0 && (missing0 = "rating")) {
        validate70.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "expected_revision" || key0 === "rating")) {
            validate70.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.expected_revision !== void 0) {
            let data0 = data.expected_revision;
            const _errs2 = errors;
            if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)))) {
              validate70.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs2) {
              if (typeof data0 == "number") {
                if (data0 < 0 || isNaN(data0)) {
                  validate70.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                } else {
                  if (!formats8.validate(data0)) {
                    validate70.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                    return false;
                  }
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.rating !== void 0) {
              let data1 = data.rating;
              const _errs4 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1))) && data1 !== null) {
                validate70.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema28.properties.rating.type }, message: "must be integer,null" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data1 == "number") {
                  if (data1 > 10 || isNaN(data1)) {
                    validate70.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                    return false;
                  } else {
                    if (data1 < 1 || isNaN(data1)) {
                      validate70.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                      return false;
                    }
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate70.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate70.errors = vErrors;
  return errors === 0;
}
validate70.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_ChannelState = validate71;
var schema29 = { "type": "object", "properties": { "revision": { "type": "integer", "format": "int64", "minimum": 0, "description": "JSON int64. JavaScript clients must reject unsafe integers rather than round a revision or sequence." }, "rating": { "type": ["integer", "null"], "minimum": 1, "maximum": 10 } }, "required": ["revision", "rating"], "additionalProperties": false, "allOf": [{ "if": { "properties": { "revision": { "const": 0 } }, "required": ["revision"] }, "then": { "properties": { "rating": { "type": "null" } } } }] };
function validate71(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate71.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs2 = errors;
  let valid1 = true;
  const _errs3 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.revision === void 0 && (missing0 = "revision")) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    } else {
      if (data.revision !== void 0) {
        if (0 !== data.revision) {
          const err1 = {};
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
    }
  }
  var _valid0 = _errs3 === errors;
  errors = _errs2;
  if (vErrors !== null) {
    if (_errs2) {
      vErrors.length = _errs2;
    } else {
      vErrors = null;
    }
  }
  if (_valid0) {
    const _errs5 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.rating !== void 0) {
        if (data.rating !== null) {
          validate71.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/allOf/0/then/properties/rating/type", keyword: "type", params: { type: "null" }, message: "must be null" }];
          return false;
        }
      }
    }
    var _valid0 = _errs5 === errors;
    valid1 = _valid0;
    if (valid1) {
      var props0 = {};
      props0.rating = true;
      props0.revision = true;
    }
  }
  if (!valid1) {
    const err2 = { instancePath, schemaPath: "#/allOf/0/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
    validate71.errors = vErrors;
    return false;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing1;
      if (data.revision === void 0 && (missing1 = "revision") || data.rating === void 0 && (missing1 = "rating")) {
        validate71.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
        return false;
      } else {
        const _errs8 = errors;
        for (const key0 in data) {
          if (!(key0 === "revision" || key0 === "rating")) {
            validate71.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs8 === errors) {
          if (data.revision !== void 0) {
            let data2 = data.revision;
            const _errs9 = errors;
            if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)))) {
              validate71.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs9) {
              if (typeof data2 == "number") {
                if (data2 < 0 || isNaN(data2)) {
                  validate71.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                } else {
                  if (!formats8.validate(data2)) {
                    validate71.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                    return false;
                  }
                }
              }
            }
            var valid4 = _errs9 === errors;
          } else {
            var valid4 = true;
          }
          if (valid4) {
            if (data.rating !== void 0) {
              let data3 = data.rating;
              const _errs11 = errors;
              if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                validate71.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema29.properties.rating.type }, message: "must be integer,null" }];
                return false;
              }
              if (errors === _errs11) {
                if (typeof data3 == "number") {
                  if (data3 > 10 || isNaN(data3)) {
                    validate71.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                    return false;
                  } else {
                    if (data3 < 1 || isNaN(data3)) {
                      validate71.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                      return false;
                    }
                  }
                }
              }
              var valid4 = _errs11 === errors;
            } else {
              var valid4 = true;
            }
          }
        }
      }
    } else {
      validate71.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate71.errors = vErrors;
  return errors === 0;
}
validate71.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_ChannelStateResult = validate72;
var schema30 = { "type": "object", "properties": { "kind": { "const": "channel_state" }, "target_id": { "type": "string", "format": "uuid" }, "state": { "$ref": "#/components/schemas/ChannelState" }, "change_seq": { "type": ["integer", "null"], "format": "int64", "minimum": 1, "description": "JSON int64. JavaScript clients must reject unsafe integers rather than round a revision or sequence." } }, "required": ["kind", "target_id", "state", "change_seq"], "additionalProperties": false };
function validate72(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate72.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.target_id === void 0 && (missing0 = "target_id") || data.state === void 0 && (missing0 = "state") || data.change_seq === void 0 && (missing0 = "change_seq")) {
        validate72.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "target_id" || key0 === "state" || key0 === "change_seq")) {
            validate72.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            const _errs2 = errors;
            if ("channel_state" !== data.kind) {
              validate72.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "channel_state" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.target_id !== void 0) {
              let data1 = data.target_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate72.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate72.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.state !== void 0) {
                const _errs5 = errors;
                if (!validate71(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.change_seq !== void 0) {
                  let data3 = data.change_seq;
                  const _errs6 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate72.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/type", keyword: "type", params: { type: schema30.properties.change_seq.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs6) {
                    if (typeof data3 == "number") {
                      if (data3 < 1 || isNaN(data3)) {
                        validate72.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                        return false;
                      } else {
                        if (!formats8.validate(data3)) {
                          validate72.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate72.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate72.errors = vErrors;
  return errors === 0;
}
validate72.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_Credentials = validate74;
var pattern9 = new RegExp("^[A-Za-z0-9_]{3,32}$", "u");
var pattern10 = new RegExp("^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$", "u");
function validate76(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate76.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.login === void 0 && (missing0 = "login") || data.name === void 0 && (missing0 = "name") || data.email === void 0 && (missing0 = "email")) {
        validate76.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "id" || key0 === "login" || key0 === "name" || key0 === "email")) {
            validate76.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data0 = data.id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (errors === _errs2) {
                if (typeof data0 === "string") {
                  if (!formats4.test(data0)) {
                    validate76.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                    return false;
                  }
                } else {
                  validate76.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.login !== void 0) {
              let data1 = data.login;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 32) {
                    validate76.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/maxLength", keyword: "maxLength", params: { limit: 32 }, message: "must NOT have more than 32 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 3) {
                      validate76.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" }];
                      return false;
                    } else {
                      if (!pattern9.test(data1)) {
                        validate76.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_]{3,32}$" }, message: 'must match pattern "^[A-Za-z0-9_]{3,32}$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate76.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.name !== void 0) {
                let data2 = data.name;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 100) {
                      validate76.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/maxLength", keyword: "maxLength", params: { limit: 100 }, message: "must NOT have more than 100 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 1) {
                        validate76.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    }
                  } else {
                    validate76.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.email !== void 0) {
                  let data3 = data.email;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 254) {
                        validate76.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/maxLength", keyword: "maxLength", params: { limit: 254 }, message: "must NOT have more than 254 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 3) {
                          validate76.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" }];
                          return false;
                        } else {
                          if (!pattern10.test(data3)) {
                            validate76.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/pattern", keyword: "pattern", params: { pattern: "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$" }, message: 'must match pattern "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$"' }];
                            return false;
                          }
                        }
                      }
                    } else {
                      validate76.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate76.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate76.errors = vErrors;
  return errors === 0;
}
validate76.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate75(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate75.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.user === void 0 && (missing0 = "user") || data.access_token === void 0 && (missing0 = "access_token") || data.session_id === void 0 && (missing0 = "session_id")) {
        validate75.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "user" || key0 === "access_token" || key0 === "session_id")) {
            validate75.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.user !== void 0) {
            const _errs2 = errors;
            if (!validate76(data.user, { instancePath: instancePath + "/user", parentData: data, parentDataProperty: "user", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate76.errors : vErrors.concat(validate76.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.access_token !== void 0) {
              let data1 = data.access_token;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (typeof data1 === "string") {
                  if (func1(data1) < 1) {
                    validate75.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate75.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.session_id !== void 0) {
                let data2 = data.session_id;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (errors === _errs5) {
                    if (typeof data2 === "string") {
                      if (!formats4.test(data2)) {
                        validate75.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                        return false;
                      }
                    } else {
                      validate75.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate75.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate75.errors = vErrors;
  return errors === 0;
}
validate75.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var pattern11 = new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$", "u");
function validate79(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate79.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.user === void 0 && (missing0 = "user") || data.access_token === void 0 && (missing0 = "access_token") || data.session_id === void 0 && (missing0 = "session_id") || data.refresh_token === void 0 && (missing0 = "refresh_token")) {
        validate79.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "user" || key0 === "access_token" || key0 === "session_id" || key0 === "refresh_token")) {
            validate79.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.user !== void 0) {
            const _errs2 = errors;
            if (!validate76(data.user, { instancePath: instancePath + "/user", parentData: data, parentDataProperty: "user", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate76.errors : vErrors.concat(validate76.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.access_token !== void 0) {
              let data1 = data.access_token;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (typeof data1 === "string") {
                  if (func1(data1) < 1) {
                    validate79.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate79.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.session_id !== void 0) {
                let data2 = data.session_id;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (errors === _errs5) {
                    if (typeof data2 === "string") {
                      if (!formats4.test(data2)) {
                        validate79.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                        return false;
                      }
                    } else {
                      validate79.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.refresh_token !== void 0) {
                  let data3 = data.refresh_token;
                  const _errs7 = errors;
                  if (errors === _errs7) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 80) {
                        validate79.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 80) {
                          validate79.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/minLength", keyword: "minLength", params: { limit: 80 }, message: "must NOT have fewer than 80 characters" }];
                          return false;
                        } else {
                          if (!pattern11.test(data3)) {
                            validate79.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/pattern", keyword: "pattern", params: { pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$" }, message: 'must match pattern "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$"' }];
                            return false;
                          }
                        }
                      }
                    } else {
                      validate79.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs7 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate79.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate79.errors = vErrors;
  return errors === 0;
}
validate79.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate74(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate74.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate75(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate75.errors : vErrors.concat(validate75.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (!validate79(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate74.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate74.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate74.evaluated = { "dynamicProps": true, "dynamicItems": false };
var schema_Device = validate82;
var schema35 = { "type": "object", "properties": { "id": { "type": "string", "format": "uuid" }, "client_type": { "type": "string", "enum": ["web", "extension"] }, "device_label": { "type": "string", "maxLength": 100 }, "created_at": { "type": "string", "format": "date-time" }, "updated_at": { "type": "string", "format": "date-time" }, "expires_at": { "type": "string", "format": "date-time" }, "current": { "type": "boolean" } }, "required": ["id", "client_type", "device_label", "created_at", "updated_at", "expires_at", "current"], "additionalProperties": false };
function validate82(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate82.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.client_type === void 0 && (missing0 = "client_type") || data.device_label === void 0 && (missing0 = "device_label") || data.created_at === void 0 && (missing0 = "created_at") || data.updated_at === void 0 && (missing0 = "updated_at") || data.expires_at === void 0 && (missing0 = "expires_at") || data.current === void 0 && (missing0 = "current")) {
        validate82.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "id" || key0 === "client_type" || key0 === "device_label" || key0 === "created_at" || key0 === "updated_at" || key0 === "expires_at" || key0 === "current")) {
            validate82.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data0 = data.id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (errors === _errs2) {
                if (typeof data0 === "string") {
                  if (!formats4.test(data0)) {
                    validate82.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                    return false;
                  }
                } else {
                  validate82.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.client_type !== void 0) {
              let data1 = data.client_type;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate82.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "web" || data1 === "extension")) {
                validate82.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/enum", keyword: "enum", params: { allowedValues: schema35.properties.client_type.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.device_label !== void 0) {
                let data2 = data.device_label;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 100) {
                      validate82.errors = [{ instancePath: instancePath + "/device_label", schemaPath: "#/properties/device_label/maxLength", keyword: "maxLength", params: { limit: 100 }, message: "must NOT have more than 100 characters" }];
                      return false;
                    }
                  } else {
                    validate82.errors = [{ instancePath: instancePath + "/device_label", schemaPath: "#/properties/device_label/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.created_at !== void 0) {
                  let data3 = data.created_at;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (errors === _errs8) {
                      if (typeof data3 === "string") {
                        if (!formats2.validate(data3)) {
                          validate82.errors = [{ instancePath: instancePath + "/created_at", schemaPath: "#/properties/created_at/format", keyword: "format", params: { format: "date-time" }, message: 'must match format "date-time"' }];
                          return false;
                        }
                      } else {
                        validate82.errors = [{ instancePath: instancePath + "/created_at", schemaPath: "#/properties/created_at/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.updated_at !== void 0) {
                    let data4 = data.updated_at;
                    const _errs10 = errors;
                    if (errors === _errs10) {
                      if (errors === _errs10) {
                        if (typeof data4 === "string") {
                          if (!formats2.validate(data4)) {
                            validate82.errors = [{ instancePath: instancePath + "/updated_at", schemaPath: "#/properties/updated_at/format", keyword: "format", params: { format: "date-time" }, message: 'must match format "date-time"' }];
                            return false;
                          }
                        } else {
                          validate82.errors = [{ instancePath: instancePath + "/updated_at", schemaPath: "#/properties/updated_at/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                      }
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.expires_at !== void 0) {
                      let data5 = data.expires_at;
                      const _errs12 = errors;
                      if (errors === _errs12) {
                        if (errors === _errs12) {
                          if (typeof data5 === "string") {
                            if (!formats2.validate(data5)) {
                              validate82.errors = [{ instancePath: instancePath + "/expires_at", schemaPath: "#/properties/expires_at/format", keyword: "format", params: { format: "date-time" }, message: 'must match format "date-time"' }];
                              return false;
                            }
                          } else {
                            validate82.errors = [{ instancePath: instancePath + "/expires_at", schemaPath: "#/properties/expires_at/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.current !== void 0) {
                        const _errs14 = errors;
                        if (typeof data.current !== "boolean") {
                          validate82.errors = [{ instancePath: instancePath + "/current", schemaPath: "#/properties/current/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                          return false;
                        }
                        var valid0 = _errs14 === errors;
                      } else {
                        var valid0 = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate82.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate82.errors = vErrors;
  return errors === 0;
}
validate82.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_DevicePage = validate83;
function validate83(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate83.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.items === void 0 && (missing0 = "items")) {
        validate83.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "items" || key0 === "next_cursor")) {
            validate83.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.items !== void 0) {
            let data0 = data.items;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (Array.isArray(data0)) {
                if (data0.length > 100) {
                  validate83.errors = [{ instancePath: instancePath + "/items", schemaPath: "#/properties/items/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" }];
                  return false;
                } else {
                  var valid1 = true;
                  const len0 = data0.length;
                  for (let i0 = 0; i0 < len0; i0++) {
                    const _errs4 = errors;
                    if (!validate82(data0[i0], { instancePath: instancePath + "/items/" + i0, parentData: data0, parentDataProperty: i0, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate82.errors : vErrors.concat(validate82.errors);
                      errors = vErrors.length;
                    }
                    var valid1 = _errs4 === errors;
                    if (!valid1) {
                      break;
                    }
                  }
                }
              } else {
                validate83.errors = [{ instancePath: instancePath + "/items", schemaPath: "#/properties/items/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.next_cursor !== void 0) {
              let data2 = data.next_cursor;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 === "string") {
                  if (func1(data2) > 128) {
                    validate83.errors = [{ instancePath: instancePath + "/next_cursor", schemaPath: "#/properties/next_cursor/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                    return false;
                  } else {
                    if (func1(data2) < 1) {
                      validate83.errors = [{ instancePath: instancePath + "/next_cursor", schemaPath: "#/properties/next_cursor/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                      return false;
                    }
                  }
                } else {
                  validate83.errors = [{ instancePath: instancePath + "/next_cursor", schemaPath: "#/properties/next_cursor/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate83.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate83.errors = vErrors;
  return errors === 0;
}
validate83.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_Error = validate85;
function validate85(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate85.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate85.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate85.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate85.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate85.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate85.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate85.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate85.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate85.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate85.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate85.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate85.errors = vErrors;
  return errors === 0;
}
validate85.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_ExtensionCredentials = validate86;
function validate86(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate86.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.user === void 0 && (missing0 = "user") || data.access_token === void 0 && (missing0 = "access_token") || data.session_id === void 0 && (missing0 = "session_id") || data.refresh_token === void 0 && (missing0 = "refresh_token")) {
        validate86.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "user" || key0 === "access_token" || key0 === "session_id" || key0 === "refresh_token")) {
            validate86.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.user !== void 0) {
            const _errs2 = errors;
            if (!validate76(data.user, { instancePath: instancePath + "/user", parentData: data, parentDataProperty: "user", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate76.errors : vErrors.concat(validate76.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.access_token !== void 0) {
              let data1 = data.access_token;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (typeof data1 === "string") {
                  if (func1(data1) < 1) {
                    validate86.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate86.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.session_id !== void 0) {
                let data2 = data.session_id;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (errors === _errs5) {
                    if (typeof data2 === "string") {
                      if (!formats4.test(data2)) {
                        validate86.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                        return false;
                      }
                    } else {
                      validate86.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.refresh_token !== void 0) {
                  let data3 = data.refresh_token;
                  const _errs7 = errors;
                  if (errors === _errs7) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 80) {
                        validate86.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 80) {
                          validate86.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/minLength", keyword: "minLength", params: { limit: 80 }, message: "must NOT have fewer than 80 characters" }];
                          return false;
                        } else {
                          if (!pattern11.test(data3)) {
                            validate86.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/pattern", keyword: "pattern", params: { pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$" }, message: 'must match pattern "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$"' }];
                            return false;
                          }
                        }
                      }
                    } else {
                      validate86.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs7 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate86.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate86.errors = vErrors;
  return errors === 0;
}
validate86.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_ExtensionRefresh = validate88;
function validate88(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate88.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.client_type === void 0 && (missing0 = "client_type") || data.attempt_id === void 0 && (missing0 = "attempt_id") || data.attempt_proof === void 0 && (missing0 = "attempt_proof") || data.refresh_token === void 0 && (missing0 = "refresh_token")) {
        validate88.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "client_type" || key0 === "attempt_id" || key0 === "attempt_proof" || key0 === "refresh_token")) {
            validate88.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.client_type !== void 0) {
            const _errs2 = errors;
            if ("extension" !== data.client_type) {
              validate88.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/const", keyword: "const", params: { allowedValue: "extension" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.attempt_id !== void 0) {
              let data1 = data.attempt_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate88.errors = [{ instancePath: instancePath + "/attempt_id", schemaPath: "#/properties/attempt_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate88.errors = [{ instancePath: instancePath + "/attempt_id", schemaPath: "#/properties/attempt_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.attempt_proof !== void 0) {
                let data2 = data.attempt_proof;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 43) {
                      validate88.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/maxLength", keyword: "maxLength", params: { limit: 43 }, message: "must NOT have more than 43 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 43) {
                        validate88.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/minLength", keyword: "minLength", params: { limit: 43 }, message: "must NOT have fewer than 43 characters" }];
                        return false;
                      } else {
                        if (!pattern4.test(data2)) {
                          validate88.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$" }, message: 'must match pattern "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$"' }];
                          return false;
                        }
                      }
                    }
                  } else {
                    validate88.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.refresh_token !== void 0) {
                  let data3 = data.refresh_token;
                  const _errs7 = errors;
                  if (errors === _errs7) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 80) {
                        validate88.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 80) {
                          validate88.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/minLength", keyword: "minLength", params: { limit: 80 }, message: "must NOT have fewer than 80 characters" }];
                          return false;
                        } else {
                          if (!pattern11.test(data3)) {
                            validate88.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/pattern", keyword: "pattern", params: { pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$" }, message: 'must match pattern "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$"' }];
                            return false;
                          }
                        }
                      }
                    } else {
                      validate88.errors = [{ instancePath: instancePath + "/refresh_token", schemaPath: "#/properties/refresh_token/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs7 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate88.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate88.errors = vErrors;
  return errors === 0;
}
validate88.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_Healthy = validate89;
function validate89(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate89.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.status === void 0 && (missing0 = "status")) {
        validate89.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "status")) {
            validate89.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.status !== void 0) {
            if ("ok" !== data.status) {
              validate89.errors = [{ instancePath: instancePath + "/status", schemaPath: "#/properties/status/const", keyword: "const", params: { allowedValue: "ok" }, message: "must be equal to constant" }];
              return false;
            }
          }
        }
      }
    } else {
      validate89.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate89.errors = vErrors;
  return errors === 0;
}
validate89.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_Lease = validate90;
function validate90(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate90.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.lease === void 0 && (missing0 = "lease") || data.valid_for_seconds === void 0 && (missing0 = "valid_for_seconds")) {
        validate90.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "lease" || key0 === "valid_for_seconds")) {
            validate90.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.lease !== void 0) {
            let data0 = data.lease;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate90.errors = [{ instancePath: instancePath + "/lease", schemaPath: "#/properties/lease/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate90.errors = [{ instancePath: instancePath + "/lease", schemaPath: "#/properties/lease/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.valid_for_seconds !== void 0) {
              const _errs4 = errors;
              if (604800 !== data.valid_for_seconds) {
                validate90.errors = [{ instancePath: instancePath + "/valid_for_seconds", schemaPath: "#/properties/valid_for_seconds/const", keyword: "const", params: { allowedValue: 604800 }, message: "must be equal to constant" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate90.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate90.errors = vErrors;
  return errors === 0;
}
validate90.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_Login = validate91;
var schema42 = { "type": "object", "properties": { "login": { "type": "string", "description": "Login, not email. Invalid/unknown/wrong password returns the same401." }, "password": { "type": "string", "minLength": 8, "maxLength": 128, "writeOnly": true, "description": "8..128 Unicode code points, at most512 UTF8 bytes. Never trimmed/normalized/stored in client storage or an offline queue. Invalid Unicode JSON escapes are rejected." }, "client_type": { "type": "string", "enum": ["web", "extension"] } }, "required": ["login", "password", "client_type"], "additionalProperties": false };
function validate91(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate91.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.login === void 0 && (missing0 = "login") || data.password === void 0 && (missing0 = "password") || data.client_type === void 0 && (missing0 = "client_type")) {
        validate91.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "login" || key0 === "password" || key0 === "client_type")) {
            validate91.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.login !== void 0) {
            const _errs2 = errors;
            if (typeof data.login !== "string") {
              validate91.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.password !== void 0) {
              let data1 = data.password;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 128) {
                    validate91.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 8) {
                      validate91.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/minLength", keyword: "minLength", params: { limit: 8 }, message: "must NOT have fewer than 8 characters" }];
                      return false;
                    }
                  }
                } else {
                  validate91.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.client_type !== void 0) {
                let data2 = data.client_type;
                const _errs6 = errors;
                if (typeof data2 !== "string") {
                  validate91.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data2 === "web" || data2 === "extension")) {
                  validate91.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/enum", keyword: "enum", params: { allowedValues: schema42.properties.client_type.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate91.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate91.errors = vErrors;
  return errors === 0;
}
validate91.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_ObservationAdd = validate92;
var schema43 = { "type": "object", "properties": { "youtube_video_id": { "type": "string", "pattern": "^[A-Za-z0-9_-]{11}$", "minLength": 11, "maxLength": 11 }, "title": { "type": ["string", "null"], "description": "Optional observed plain text; server NFC/whitespace-normalizes to at most250 code points, raw UTF8 bound4096bytes. Empty/null means unknown, not a fabricated title." }, "youtube_channel_id": { "type": ["string", "null"], "pattern": "^(UC[A-Za-z0-9_-]{22})?$", "description": "Optional UC claim, not trusted identity/membership evidence." }, "channel_name": { "type": ["string", "null"], "description": "Optional observed plain name, normalized max150 code points." }, "channel_handle": { "type": ["string", "null"], "description": "Observed bounded handle text only; never an identity/merge key or a fetch URL." }, "duration_seconds": { "type": ["integer", "null"], "minimum": 0, "maximum": 2147483647, "description": "Unknown staysnull and is hidden by clients." }, "hashtags": { "type": ["array", "null"], "maxItems": 30, "items": { "type": "string", "description": "Optional leading#, then Unicode letters/numbers/marks/underscore. Server NFC+casefold, normalized1..100 code points; raw input at most1024bytes." } }, "hashtags_observation_status": { "type": ["string", "null"], "enum": ["unknown", "partial", "complete", null], "default": "unknown", "description": "Omitted/null meansunknown. Unknown cannot carry positive tags. Complete empty is observed empty; untrusted input never grants erasure authority." }, "expected_revision": { "type": "integer", "format": "int64", "minimum": 0, "description": "JSON int64. JavaScript clients must reject unsafe integers rather than round a revision or sequence." }, "rating": { "type": ["integer", "null"], "minimum": 1, "maximum": 10 }, "later": { "type": "boolean" } }, "required": ["youtube_video_id", "expected_revision"], "additionalProperties": false, "allOf": [{ "if": { "anyOf": [{ "not": { "properties": { "hashtags_observation_status": {} }, "required": ["hashtags_observation_status"] } }, { "properties": { "hashtags_observation_status": { "enum": ["unknown", null] } }, "required": ["hashtags_observation_status"] }] }, "then": { "properties": { "hashtags": { "anyOf": [{ "type": "array", "maxItems": 0 }, { "type": "null" }] } } } }] };
var func36 = Object.prototype.hasOwnProperty;
var pattern15 = new RegExp("^[A-Za-z0-9_-]{11}$", "u");
var pattern16 = new RegExp("^(UC[A-Za-z0-9_-]{22})?$", "u");
function validate92(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate92.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs2 = errors;
  let valid1 = true;
  const _errs3 = errors;
  const _errs4 = errors;
  let valid2 = false;
  const _errs5 = errors;
  const _errs6 = errors;
  const _errs7 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.hashtags_observation_status === void 0 && (missing0 = "hashtags_observation_status")) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var valid3 = _errs7 === errors;
  if (valid3) {
    const err1 = {};
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  } else {
    errors = _errs6;
    if (vErrors !== null) {
      if (_errs6) {
        vErrors.length = _errs6;
      } else {
        vErrors = null;
      }
    }
  }
  var _valid1 = _errs5 === errors;
  valid2 = valid2 || _valid1;
  const _errs8 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing1;
    if (data.hashtags_observation_status === void 0 && (missing1 = "hashtags_observation_status")) {
      const err2 = {};
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    } else {
      if (data.hashtags_observation_status !== void 0) {
        let data0 = data.hashtags_observation_status;
        if (!(data0 === "unknown" || data0 === null)) {
          const err3 = {};
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      }
    }
  }
  var _valid1 = _errs8 === errors;
  valid2 = valid2 || _valid1;
  if (_valid1) {
    var props0 = {};
    props0.hashtags_observation_status = true;
  }
  if (!valid2) {
    const err4 = {};
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
  } else {
    errors = _errs4;
    if (vErrors !== null) {
      if (_errs4) {
        vErrors.length = _errs4;
      } else {
        vErrors = null;
      }
    }
  }
  var _valid0 = _errs3 === errors;
  errors = _errs2;
  if (vErrors !== null) {
    if (_errs2) {
      vErrors.length = _errs2;
    } else {
      vErrors = null;
    }
  }
  if (_valid0) {
    const _errs10 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.hashtags !== void 0) {
        let data1 = data.hashtags;
        const _errs12 = errors;
        let valid6 = false;
        const _errs13 = errors;
        if (errors === _errs13) {
          if (Array.isArray(data1)) {
            if (data1.length > 0) {
              const err5 = { instancePath: instancePath + "/hashtags", schemaPath: "#/allOf/0/then/properties/hashtags/anyOf/0/maxItems", keyword: "maxItems", params: { limit: 0 }, message: "must NOT have more than 0 items" };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          } else {
            const err6 = { instancePath: instancePath + "/hashtags", schemaPath: "#/allOf/0/then/properties/hashtags/anyOf/0/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        var _valid2 = _errs13 === errors;
        valid6 = valid6 || _valid2;
        const _errs15 = errors;
        if (data1 !== null) {
          const err7 = { instancePath: instancePath + "/hashtags", schemaPath: "#/allOf/0/then/properties/hashtags/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        var _valid2 = _errs15 === errors;
        valid6 = valid6 || _valid2;
        if (!valid6) {
          const err8 = { instancePath: instancePath + "/hashtags", schemaPath: "#/allOf/0/then/properties/hashtags/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
          validate92.errors = vErrors;
          return false;
        } else {
          errors = _errs12;
          if (vErrors !== null) {
            if (_errs12) {
              vErrors.length = _errs12;
            } else {
              vErrors = null;
            }
          }
        }
      }
    }
    var _valid0 = _errs10 === errors;
    valid1 = _valid0;
    if (valid1) {
      if (props0 !== true) {
        props0 = props0 || {};
        props0.hashtags = true;
      }
    }
  }
  if (!valid1) {
    const err9 = { instancePath, schemaPath: "#/allOf/0/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
    validate92.errors = vErrors;
    return false;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing2;
      if (data.youtube_video_id === void 0 && (missing2 = "youtube_video_id") || data.expected_revision === void 0 && (missing2 = "expected_revision")) {
        validate92.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" }];
        return false;
      } else {
        const _errs17 = errors;
        for (const key0 in data) {
          if (!func36.call(schema43.properties, key0)) {
            validate92.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs17 === errors) {
          if (data.youtube_video_id !== void 0) {
            let data2 = data.youtube_video_id;
            const _errs18 = errors;
            if (errors === _errs18) {
              if (typeof data2 === "string") {
                if (func1(data2) > 11) {
                  validate92.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/maxLength", keyword: "maxLength", params: { limit: 11 }, message: "must NOT have more than 11 characters" }];
                  return false;
                } else {
                  if (func1(data2) < 11) {
                    validate92.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/minLength", keyword: "minLength", params: { limit: 11 }, message: "must NOT have fewer than 11 characters" }];
                    return false;
                  } else {
                    if (!pattern15.test(data2)) {
                      validate92.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^[A-Za-z0-9_-]{11}$"' }];
                      return false;
                    }
                  }
                }
              } else {
                validate92.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid7 = _errs18 === errors;
          } else {
            var valid7 = true;
          }
          if (valid7) {
            if (data.title !== void 0) {
              let data3 = data.title;
              const _errs20 = errors;
              if (typeof data3 !== "string" && data3 !== null) {
                validate92.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: schema43.properties.title.type }, message: "must be string,null" }];
                return false;
              }
              var valid7 = _errs20 === errors;
            } else {
              var valid7 = true;
            }
            if (valid7) {
              if (data.youtube_channel_id !== void 0) {
                let data4 = data.youtube_channel_id;
                const _errs22 = errors;
                if (typeof data4 !== "string" && data4 !== null) {
                  validate92.errors = [{ instancePath: instancePath + "/youtube_channel_id", schemaPath: "#/properties/youtube_channel_id/type", keyword: "type", params: { type: schema43.properties.youtube_channel_id.type }, message: "must be string,null" }];
                  return false;
                }
                if (errors === _errs22) {
                  if (typeof data4 === "string") {
                    if (!pattern16.test(data4)) {
                      validate92.errors = [{ instancePath: instancePath + "/youtube_channel_id", schemaPath: "#/properties/youtube_channel_id/pattern", keyword: "pattern", params: { pattern: "^(UC[A-Za-z0-9_-]{22})?$" }, message: 'must match pattern "^(UC[A-Za-z0-9_-]{22})?$"' }];
                      return false;
                    }
                  }
                }
                var valid7 = _errs22 === errors;
              } else {
                var valid7 = true;
              }
              if (valid7) {
                if (data.channel_name !== void 0) {
                  let data5 = data.channel_name;
                  const _errs24 = errors;
                  if (typeof data5 !== "string" && data5 !== null) {
                    validate92.errors = [{ instancePath: instancePath + "/channel_name", schemaPath: "#/properties/channel_name/type", keyword: "type", params: { type: schema43.properties.channel_name.type }, message: "must be string,null" }];
                    return false;
                  }
                  var valid7 = _errs24 === errors;
                } else {
                  var valid7 = true;
                }
                if (valid7) {
                  if (data.channel_handle !== void 0) {
                    let data6 = data.channel_handle;
                    const _errs26 = errors;
                    if (typeof data6 !== "string" && data6 !== null) {
                      validate92.errors = [{ instancePath: instancePath + "/channel_handle", schemaPath: "#/properties/channel_handle/type", keyword: "type", params: { type: schema43.properties.channel_handle.type }, message: "must be string,null" }];
                      return false;
                    }
                    var valid7 = _errs26 === errors;
                  } else {
                    var valid7 = true;
                  }
                  if (valid7) {
                    if (data.duration_seconds !== void 0) {
                      let data7 = data.duration_seconds;
                      const _errs28 = errors;
                      if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7))) && data7 !== null) {
                        validate92.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/type", keyword: "type", params: { type: schema43.properties.duration_seconds.type }, message: "must be integer,null" }];
                        return false;
                      }
                      if (errors === _errs28) {
                        if (typeof data7 == "number") {
                          if (data7 > 2147483647 || isNaN(data7)) {
                            validate92.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2147483647 }, message: "must be <= 2147483647" }];
                            return false;
                          } else {
                            if (data7 < 0 || isNaN(data7)) {
                              validate92.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                              return false;
                            }
                          }
                        }
                      }
                      var valid7 = _errs28 === errors;
                    } else {
                      var valid7 = true;
                    }
                    if (valid7) {
                      if (data.hashtags !== void 0) {
                        let data8 = data.hashtags;
                        const _errs30 = errors;
                        if (!Array.isArray(data8) && data8 !== null) {
                          validate92.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/type", keyword: "type", params: { type: schema43.properties.hashtags.type }, message: "must be array,null" }];
                          return false;
                        }
                        if (errors === _errs30) {
                          if (Array.isArray(data8)) {
                            if (data8.length > 30) {
                              validate92.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" }];
                              return false;
                            } else {
                              var valid8 = true;
                              const len0 = data8.length;
                              for (let i0 = 0; i0 < len0; i0++) {
                                const _errs32 = errors;
                                if (typeof data8[i0] !== "string") {
                                  validate92.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                                var valid8 = _errs32 === errors;
                                if (!valid8) {
                                  break;
                                }
                              }
                            }
                          }
                        }
                        var valid7 = _errs30 === errors;
                      } else {
                        var valid7 = true;
                      }
                      if (valid7) {
                        if (data.hashtags_observation_status !== void 0) {
                          let data10 = data.hashtags_observation_status;
                          const _errs34 = errors;
                          if (typeof data10 !== "string" && data10 !== null) {
                            validate92.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/type", keyword: "type", params: { type: schema43.properties.hashtags_observation_status.type }, message: "must be string,null" }];
                            return false;
                          }
                          if (!(data10 === "unknown" || data10 === "partial" || data10 === "complete" || data10 === null)) {
                            validate92.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/enum", keyword: "enum", params: { allowedValues: schema43.properties.hashtags_observation_status.enum }, message: "must be equal to one of the allowed values" }];
                            return false;
                          }
                          var valid7 = _errs34 === errors;
                        } else {
                          var valid7 = true;
                        }
                        if (valid7) {
                          if (data.expected_revision !== void 0) {
                            let data11 = data.expected_revision;
                            const _errs36 = errors;
                            if (!(typeof data11 == "number" && (!(data11 % 1) && !isNaN(data11)))) {
                              validate92.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                              return false;
                            }
                            if (errors === _errs36) {
                              if (typeof data11 == "number") {
                                if (data11 < 0 || isNaN(data11)) {
                                  validate92.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                  return false;
                                } else {
                                  if (!formats8.validate(data11)) {
                                    validate92.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                                    return false;
                                  }
                                }
                              }
                            }
                            var valid7 = _errs36 === errors;
                          } else {
                            var valid7 = true;
                          }
                          if (valid7) {
                            if (data.rating !== void 0) {
                              let data12 = data.rating;
                              const _errs38 = errors;
                              if (!(typeof data12 == "number" && (!(data12 % 1) && !isNaN(data12))) && data12 !== null) {
                                validate92.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema43.properties.rating.type }, message: "must be integer,null" }];
                                return false;
                              }
                              if (errors === _errs38) {
                                if (typeof data12 == "number") {
                                  if (data12 > 10 || isNaN(data12)) {
                                    validate92.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                                    return false;
                                  } else {
                                    if (data12 < 1 || isNaN(data12)) {
                                      validate92.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                      return false;
                                    }
                                  }
                                }
                              }
                              var valid7 = _errs38 === errors;
                            } else {
                              var valid7 = true;
                            }
                            if (valid7) {
                              if (data.later !== void 0) {
                                const _errs40 = errors;
                                if (typeof data.later !== "boolean") {
                                  validate92.errors = [{ instancePath: instancePath + "/later", schemaPath: "#/properties/later/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                  return false;
                                }
                                var valid7 = _errs40 === errors;
                              } else {
                                var valid7 = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate92.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate92.errors = vErrors;
  return errors === 0;
}
validate92.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_ObservationResult = validate93;
var schema45 = { "type": "object", "properties": { "kind": { "const": "video_state" }, "target_id": { "type": "string", "format": "uuid" }, "state": { "$ref": "#/components/schemas/VideoState" }, "change_seq": { "type": ["integer", "null"], "format": "int64", "minimum": 1, "description": "JSON int64. JavaScript clients must reject unsafe integers rather than round a revision or sequence. Write acknowledgment only, never a pull cursor. Explicit null for no-op/read." } }, "required": ["kind", "target_id", "state", "change_seq"], "additionalProperties": false };
var schema46 = { "type": "object", "properties": { "revision": { "type": "integer", "format": "int64", "minimum": 0, "description": "JSON int64. JavaScript clients must reject unsafe integers rather than round a revision or sequence." }, "rating": { "type": ["integer", "null"], "minimum": 1, "maximum": 10 }, "added": { "type": "boolean" }, "later": { "type": "boolean" } }, "required": ["revision", "rating", "added", "later"], "additionalProperties": false, "allOf": [{ "if": { "properties": { "revision": { "const": 0 } }, "required": ["revision"] }, "then": { "properties": { "rating": { "type": "null" }, "added": { "const": false }, "later": { "const": false } } } }] };
function validate95(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate95.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs2 = errors;
  let valid1 = true;
  const _errs3 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.revision === void 0 && (missing0 = "revision")) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    } else {
      if (data.revision !== void 0) {
        if (0 !== data.revision) {
          const err1 = {};
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
    }
  }
  var _valid0 = _errs3 === errors;
  errors = _errs2;
  if (vErrors !== null) {
    if (_errs2) {
      vErrors.length = _errs2;
    } else {
      vErrors = null;
    }
  }
  if (_valid0) {
    const _errs5 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.rating !== void 0) {
        const _errs6 = errors;
        if (data.rating !== null) {
          validate95.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/allOf/0/then/properties/rating/type", keyword: "type", params: { type: "null" }, message: "must be null" }];
          return false;
        }
        var valid3 = _errs6 === errors;
      } else {
        var valid3 = true;
      }
      if (valid3) {
        if (data.added !== void 0) {
          const _errs8 = errors;
          if (false !== data.added) {
            validate95.errors = [{ instancePath: instancePath + "/added", schemaPath: "#/allOf/0/then/properties/added/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" }];
            return false;
          }
          var valid3 = _errs8 === errors;
        } else {
          var valid3 = true;
        }
        if (valid3) {
          if (data.later !== void 0) {
            const _errs9 = errors;
            if (false !== data.later) {
              validate95.errors = [{ instancePath: instancePath + "/later", schemaPath: "#/allOf/0/then/properties/later/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" }];
              return false;
            }
            var valid3 = _errs9 === errors;
          } else {
            var valid3 = true;
          }
        }
      }
    }
    var _valid0 = _errs5 === errors;
    valid1 = _valid0;
    if (valid1) {
      var props0 = {};
      props0.rating = true;
      props0.added = true;
      props0.later = true;
      props0.revision = true;
    }
  }
  if (!valid1) {
    const err2 = { instancePath, schemaPath: "#/allOf/0/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
    validate95.errors = vErrors;
    return false;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing1;
      if (data.revision === void 0 && (missing1 = "revision") || data.rating === void 0 && (missing1 = "rating") || data.added === void 0 && (missing1 = "added") || data.later === void 0 && (missing1 = "later")) {
        validate95.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
        return false;
      } else {
        const _errs10 = errors;
        for (const key0 in data) {
          if (!(key0 === "revision" || key0 === "rating" || key0 === "added" || key0 === "later")) {
            validate95.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs10 === errors) {
          if (data.revision !== void 0) {
            let data4 = data.revision;
            const _errs11 = errors;
            if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)))) {
              validate95.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs11) {
              if (typeof data4 == "number") {
                if (data4 < 0 || isNaN(data4)) {
                  validate95.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                } else {
                  if (!formats8.validate(data4)) {
                    validate95.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                    return false;
                  }
                }
              }
            }
            var valid4 = _errs11 === errors;
          } else {
            var valid4 = true;
          }
          if (valid4) {
            if (data.rating !== void 0) {
              let data5 = data.rating;
              const _errs13 = errors;
              if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5))) && data5 !== null) {
                validate95.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema46.properties.rating.type }, message: "must be integer,null" }];
                return false;
              }
              if (errors === _errs13) {
                if (typeof data5 == "number") {
                  if (data5 > 10 || isNaN(data5)) {
                    validate95.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                    return false;
                  } else {
                    if (data5 < 1 || isNaN(data5)) {
                      validate95.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                      return false;
                    }
                  }
                }
              }
              var valid4 = _errs13 === errors;
            } else {
              var valid4 = true;
            }
            if (valid4) {
              if (data.added !== void 0) {
                const _errs15 = errors;
                if (typeof data.added !== "boolean") {
                  validate95.errors = [{ instancePath: instancePath + "/added", schemaPath: "#/properties/added/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                  return false;
                }
                var valid4 = _errs15 === errors;
              } else {
                var valid4 = true;
              }
              if (valid4) {
                if (data.later !== void 0) {
                  const _errs17 = errors;
                  if (typeof data.later !== "boolean") {
                    validate95.errors = [{ instancePath: instancePath + "/later", schemaPath: "#/properties/later/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                    return false;
                  }
                  var valid4 = _errs17 === errors;
                } else {
                  var valid4 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate95.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate95.errors = vErrors;
  return errors === 0;
}
validate95.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate94(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate94.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.target_id === void 0 && (missing0 = "target_id") || data.state === void 0 && (missing0 = "state") || data.change_seq === void 0 && (missing0 = "change_seq")) {
        validate94.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "target_id" || key0 === "state" || key0 === "change_seq")) {
            validate94.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            const _errs2 = errors;
            if ("video_state" !== data.kind) {
              validate94.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "video_state" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.target_id !== void 0) {
              let data1 = data.target_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate94.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate94.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.state !== void 0) {
                const _errs5 = errors;
                if (!validate95(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.change_seq !== void 0) {
                  let data3 = data.change_seq;
                  const _errs6 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate94.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/type", keyword: "type", params: { type: schema45.properties.change_seq.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs6) {
                    if (typeof data3 == "number") {
                      if (data3 < 1 || isNaN(data3)) {
                        validate94.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                        return false;
                      } else {
                        if (!formats8.validate(data3)) {
                          validate94.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate94.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate94.errors = vErrors;
  return errors === 0;
}
validate94.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate93(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate93.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate94(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate94.errors : vErrors.concat(validate94.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.state !== void 0) {
        let data0 = data.state;
        if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
          if (data0.added !== void 0) {
            if (true !== data0.added) {
              validate93.errors = [{ instancePath: instancePath + "/state/added", schemaPath: "#/allOf/1/properties/state/properties/added/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
              return false;
            }
          }
        }
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate93.errors = vErrors;
  return errors === 0;
}
validate93.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_PasswordChange = validate98;
function validate98(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate98.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.current_password === void 0 && (missing0 = "current_password") || data.new_password === void 0 && (missing0 = "new_password")) {
        validate98.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "current_password" || key0 === "new_password")) {
            validate98.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.current_password !== void 0) {
            let data0 = data.current_password;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) > 128) {
                  validate98.errors = [{ instancePath: instancePath + "/current_password", schemaPath: "#/properties/current_password/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 8) {
                    validate98.errors = [{ instancePath: instancePath + "/current_password", schemaPath: "#/properties/current_password/minLength", keyword: "minLength", params: { limit: 8 }, message: "must NOT have fewer than 8 characters" }];
                    return false;
                  }
                }
              } else {
                validate98.errors = [{ instancePath: instancePath + "/current_password", schemaPath: "#/properties/current_password/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.new_password !== void 0) {
              let data1 = data.new_password;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 128) {
                    validate98.errors = [{ instancePath: instancePath + "/new_password", schemaPath: "#/properties/new_password/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 8) {
                      validate98.errors = [{ instancePath: instancePath + "/new_password", schemaPath: "#/properties/new_password/minLength", keyword: "minLength", params: { limit: 8 }, message: "must NOT have fewer than 8 characters" }];
                      return false;
                    }
                  }
                } else {
                  validate98.errors = [{ instancePath: instancePath + "/new_password", schemaPath: "#/properties/new_password/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate98.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate98.errors = vErrors;
  return errors === 0;
}
validate98.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_Rating = validate99;
var schema48 = { "type": "object", "properties": { "count": { "type": "integer", "format": "int64", "minimum": 0, "description": "JSON int64. JavaScript clients must reject unsafe integers rather than round a revision or sequence." }, "average": { "type": ["number", "null"], "minimum": 1, "maximum": 10, "description": "Real sum/count, exact positive half-up to2decimal places. Count0 givesnull, never a synthetic score." } }, "required": ["count", "average"], "additionalProperties": false, "allOf": [{ "if": { "properties": { "count": { "const": 0 } }, "required": ["count"] }, "then": { "properties": { "average": { "type": "null" } } }, "else": { "properties": { "average": { "type": "number" } } } }] };
function validate99(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate99.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs2 = errors;
  let valid1 = true;
  const _errs3 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.count === void 0 && (missing0 = "count")) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    } else {
      if (data.count !== void 0) {
        if (0 !== data.count) {
          const err1 = {};
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
    }
  }
  var _valid0 = _errs3 === errors;
  errors = _errs2;
  if (vErrors !== null) {
    if (_errs2) {
      vErrors.length = _errs2;
    } else {
      vErrors = null;
    }
  }
  let ifClause0;
  if (_valid0) {
    const _errs5 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.average !== void 0) {
        if (data.average !== null) {
          validate99.errors = [{ instancePath: instancePath + "/average", schemaPath: "#/allOf/0/then/properties/average/type", keyword: "type", params: { type: "null" }, message: "must be null" }];
          return false;
        }
      }
    }
    var _valid0 = _errs5 === errors;
    valid1 = _valid0;
    if (valid1) {
      var props0 = {};
      props0.average = true;
      props0.count = true;
    }
    ifClause0 = "then";
  } else {
    const _errs8 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.average !== void 0) {
        if (!(typeof data.average == "number")) {
          validate99.errors = [{ instancePath: instancePath + "/average", schemaPath: "#/allOf/0/else/properties/average/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
          return false;
        }
      }
    }
    var _valid0 = _errs8 === errors;
    valid1 = _valid0;
    if (valid1) {
      if (props0 !== true) {
        props0 = props0 || {};
        props0.average = true;
      }
    }
    ifClause0 = "else";
  }
  if (!valid1) {
    const err2 = { instancePath, schemaPath: "#/allOf/0/if", keyword: "if", params: { failingKeyword: ifClause0 }, message: 'must match "' + ifClause0 + '" schema' };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
    validate99.errors = vErrors;
    return false;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing1;
      if (data.count === void 0 && (missing1 = "count") || data.average === void 0 && (missing1 = "average")) {
        validate99.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
        return false;
      } else {
        const _errs11 = errors;
        for (const key0 in data) {
          if (!(key0 === "count" || key0 === "average")) {
            validate99.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs11 === errors) {
          if (data.count !== void 0) {
            let data3 = data.count;
            const _errs12 = errors;
            if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)))) {
              validate99.errors = [{ instancePath: instancePath + "/count", schemaPath: "#/properties/count/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs12) {
              if (typeof data3 == "number") {
                if (data3 < 0 || isNaN(data3)) {
                  validate99.errors = [{ instancePath: instancePath + "/count", schemaPath: "#/properties/count/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                } else {
                  if (!formats8.validate(data3)) {
                    validate99.errors = [{ instancePath: instancePath + "/count", schemaPath: "#/properties/count/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                    return false;
                  }
                }
              }
            }
            var valid5 = _errs12 === errors;
          } else {
            var valid5 = true;
          }
          if (valid5) {
            if (data.average !== void 0) {
              let data4 = data.average;
              const _errs14 = errors;
              if (!(typeof data4 == "number") && data4 !== null) {
                validate99.errors = [{ instancePath: instancePath + "/average", schemaPath: "#/properties/average/type", keyword: "type", params: { type: schema48.properties.average.type }, message: "must be number,null" }];
                return false;
              }
              if (errors === _errs14) {
                if (typeof data4 == "number") {
                  if (data4 > 10 || isNaN(data4)) {
                    validate99.errors = [{ instancePath: instancePath + "/average", schemaPath: "#/properties/average/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                    return false;
                  } else {
                    if (data4 < 1 || isNaN(data4)) {
                      validate99.errors = [{ instancePath: instancePath + "/average", schemaPath: "#/properties/average/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                      return false;
                    }
                  }
                }
              }
              var valid5 = _errs14 === errors;
            } else {
              var valid5 = true;
            }
          }
        }
      }
    } else {
      validate99.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate99.errors = vErrors;
  return errors === 0;
}
validate99.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_Ready = validate100;
function validate100(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate100.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.status === void 0 && (missing0 = "status")) {
        validate100.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "status")) {
            validate100.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.status !== void 0) {
            if ("ready" !== data.status) {
              validate100.errors = [{ instancePath: instancePath + "/status", schemaPath: "#/properties/status/const", keyword: "const", params: { allowedValue: "ready" }, message: "must be equal to constant" }];
              return false;
            }
          }
        }
      }
    } else {
      validate100.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate100.errors = vErrors;
  return errors === 0;
}
validate100.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_Refresh = validate101;
function validate102(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate102.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.client_type === void 0 && (missing0 = "client_type") || data.attempt_id === void 0 && (missing0 = "attempt_id") || data.attempt_proof === void 0 && (missing0 = "attempt_proof")) {
        validate102.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "client_type" || key0 === "attempt_id" || key0 === "attempt_proof")) {
            validate102.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.client_type !== void 0) {
            const _errs2 = errors;
            if ("web" !== data.client_type) {
              validate102.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/const", keyword: "const", params: { allowedValue: "web" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.attempt_id !== void 0) {
              let data1 = data.attempt_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate102.errors = [{ instancePath: instancePath + "/attempt_id", schemaPath: "#/properties/attempt_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate102.errors = [{ instancePath: instancePath + "/attempt_id", schemaPath: "#/properties/attempt_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.attempt_proof !== void 0) {
                let data2 = data.attempt_proof;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 43) {
                      validate102.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/maxLength", keyword: "maxLength", params: { limit: 43 }, message: "must NOT have more than 43 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 43) {
                        validate102.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/minLength", keyword: "minLength", params: { limit: 43 }, message: "must NOT have fewer than 43 characters" }];
                        return false;
                      } else {
                        if (!pattern4.test(data2)) {
                          validate102.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$" }, message: 'must match pattern "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$"' }];
                          return false;
                        }
                      }
                    }
                  } else {
                    validate102.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate102.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate102.errors = vErrors;
  return errors === 0;
}
validate102.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate101(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate101.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate102(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate102.errors : vErrors.concat(validate102.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (!validate88(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate88.errors : vErrors.concat(validate88.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate101.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate101.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate101.evaluated = { "dynamicProps": true, "dynamicItems": false };
var schema_Register = validate105;
var schema52 = { "type": "object", "properties": { "login": { "type": "string", "pattern": "^[A-Za-z0-9_]{3,32}$" }, "email": { "type": "string", "maxLength": 254, "minLength": 3, "pattern": "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$", "description": "Canonical mailbox accepted by Go net/mail.ParseAddress, without display name, at most254 UTF8 bytes; Unicode local-part is supported and address lowercased by server. Wire bounds do not replace authoritative registration syntax validation. Verification and mail recovery deferred." }, "name": { "type": "string", "description": "Server trims and NFC-normalizes; normalized length1..100 code points." }, "password": { "type": "string", "minLength": 8, "maxLength": 128, "writeOnly": true, "description": "8..128 Unicode code points, at most512 UTF8 bytes. Never trimmed/normalized/stored in client storage or an offline queue. Invalid Unicode JSON escapes are rejected." }, "client_type": { "type": "string", "enum": ["web", "extension"] } }, "required": ["login", "email", "name", "password", "client_type"], "additionalProperties": false };
function validate105(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate105.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.login === void 0 && (missing0 = "login") || data.email === void 0 && (missing0 = "email") || data.name === void 0 && (missing0 = "name") || data.password === void 0 && (missing0 = "password") || data.client_type === void 0 && (missing0 = "client_type")) {
        validate105.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "login" || key0 === "email" || key0 === "name" || key0 === "password" || key0 === "client_type")) {
            validate105.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.login !== void 0) {
            let data0 = data.login;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (!pattern9.test(data0)) {
                  validate105.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_]{3,32}$" }, message: 'must match pattern "^[A-Za-z0-9_]{3,32}$"' }];
                  return false;
                }
              } else {
                validate105.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.email !== void 0) {
              let data1 = data.email;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 254) {
                    validate105.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/maxLength", keyword: "maxLength", params: { limit: 254 }, message: "must NOT have more than 254 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 3) {
                      validate105.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" }];
                      return false;
                    } else {
                      if (!pattern10.test(data1)) {
                        validate105.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/pattern", keyword: "pattern", params: { pattern: "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$" }, message: 'must match pattern "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate105.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.name !== void 0) {
                const _errs6 = errors;
                if (typeof data.name !== "string") {
                  validate105.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.password !== void 0) {
                  let data3 = data.password;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 128) {
                        validate105.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 8) {
                          validate105.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/minLength", keyword: "minLength", params: { limit: 8 }, message: "must NOT have fewer than 8 characters" }];
                          return false;
                        }
                      }
                    } else {
                      validate105.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.client_type !== void 0) {
                    let data4 = data.client_type;
                    const _errs10 = errors;
                    if (typeof data4 !== "string") {
                      validate105.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    if (!(data4 === "web" || data4 === "extension")) {
                      validate105.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/enum", keyword: "enum", params: { allowedValues: schema52.properties.client_type.enum }, message: "must be equal to one of the allowed values" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate105.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate105.errors = vErrors;
  return errors === 0;
}
validate105.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_User = validate106;
function validate106(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate106.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.login === void 0 && (missing0 = "login") || data.name === void 0 && (missing0 = "name") || data.email === void 0 && (missing0 = "email")) {
        validate106.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "id" || key0 === "login" || key0 === "name" || key0 === "email")) {
            validate106.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data0 = data.id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (errors === _errs2) {
                if (typeof data0 === "string") {
                  if (!formats4.test(data0)) {
                    validate106.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                    return false;
                  }
                } else {
                  validate106.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.login !== void 0) {
              let data1 = data.login;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 32) {
                    validate106.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/maxLength", keyword: "maxLength", params: { limit: 32 }, message: "must NOT have more than 32 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 3) {
                      validate106.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" }];
                      return false;
                    } else {
                      if (!pattern9.test(data1)) {
                        validate106.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_]{3,32}$" }, message: 'must match pattern "^[A-Za-z0-9_]{3,32}$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate106.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.name !== void 0) {
                let data2 = data.name;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 100) {
                      validate106.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/maxLength", keyword: "maxLength", params: { limit: 100 }, message: "must NOT have more than 100 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 1) {
                        validate106.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    }
                  } else {
                    validate106.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.email !== void 0) {
                  let data3 = data.email;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 254) {
                        validate106.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/maxLength", keyword: "maxLength", params: { limit: 254 }, message: "must NOT have more than 254 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 3) {
                          validate106.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" }];
                          return false;
                        } else {
                          if (!pattern10.test(data3)) {
                            validate106.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/pattern", keyword: "pattern", params: { pattern: "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$" }, message: 'must match pattern "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$"' }];
                            return false;
                          }
                        }
                      }
                    } else {
                      validate106.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate106.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate106.errors = vErrors;
  return errors === 0;
}
validate106.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_VideoCard = validate107;
var schema54 = { "type": "object", "properties": { "id": { "type": "string", "format": "uuid" }, "youtube_video_id": { "type": "string", "pattern": "^[A-Za-z0-9_-]{11}$", "minLength": 11, "maxLength": 11 }, "title": { "type": ["string", "null"], "minLength": 1, "maxLength": 250 }, "duration_seconds": { "type": ["integer", "null"], "minimum": 0, "maximum": 2147483647 }, "availability": { "type": "string", "enum": ["unknown", "available", "unavailable"] }, "url": { "type": "string", "format": "uri", "pattern": "^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$" }, "preview_url": { "type": "string", "format": "uri", "pattern": "^https://i\\.ytimg\\.com/vi/[A-Za-z0-9_-]{11}/hqdefault\\.jpg$" }, "hashtags": { "type": "array", "maxItems": 100, "uniqueItems": true, "items": { "type": "string", "minLength": 1, "maxLength": 100, "pattern": "^[^#]" } }, "hashtags_observation_status": { "type": "string", "enum": ["unknown", "partial", "complete"] }, "channel": { "anyOf": [{ "$ref": "#/components/schemas/CardChannel" }, { "type": "null" }] }, "rating": { "$ref": "#/components/schemas/Rating" }, "my_state": { "$ref": "#/components/schemas/VideoState", "description": "Omitted for guest; only current live viewer, never another author. Absent carrier means real revision0." } }, "required": ["id", "youtube_video_id", "title", "duration_seconds", "availability", "url", "preview_url", "hashtags", "hashtags_observation_status", "channel", "rating"], "additionalProperties": false };
var pattern23 = new RegExp("^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$", "u");
var pattern24 = new RegExp("^https://i\\.ytimg\\.com/vi/[A-Za-z0-9_-]{11}/hqdefault\\.jpg$", "u");
var pattern25 = new RegExp("^[^#]", "u");
function validate107(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate107.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.youtube_video_id === void 0 && (missing0 = "youtube_video_id") || data.title === void 0 && (missing0 = "title") || data.duration_seconds === void 0 && (missing0 = "duration_seconds") || data.availability === void 0 && (missing0 = "availability") || data.url === void 0 && (missing0 = "url") || data.preview_url === void 0 && (missing0 = "preview_url") || data.hashtags === void 0 && (missing0 = "hashtags") || data.hashtags_observation_status === void 0 && (missing0 = "hashtags_observation_status") || data.channel === void 0 && (missing0 = "channel") || data.rating === void 0 && (missing0 = "rating")) {
        validate107.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func36.call(schema54.properties, key0)) {
            validate107.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data0 = data.id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (errors === _errs2) {
                if (typeof data0 === "string") {
                  if (!formats4.test(data0)) {
                    validate107.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                    return false;
                  }
                } else {
                  validate107.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.youtube_video_id !== void 0) {
              let data1 = data.youtube_video_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 11) {
                    validate107.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/maxLength", keyword: "maxLength", params: { limit: 11 }, message: "must NOT have more than 11 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 11) {
                      validate107.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/minLength", keyword: "minLength", params: { limit: 11 }, message: "must NOT have fewer than 11 characters" }];
                      return false;
                    } else {
                      if (!pattern15.test(data1)) {
                        validate107.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^[A-Za-z0-9_-]{11}$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate107.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.title !== void 0) {
                let data2 = data.title;
                const _errs6 = errors;
                if (typeof data2 !== "string" && data2 !== null) {
                  validate107.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: schema54.properties.title.type }, message: "must be string,null" }];
                  return false;
                }
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 250) {
                      validate107.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/maxLength", keyword: "maxLength", params: { limit: 250 }, message: "must NOT have more than 250 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 1) {
                        validate107.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    }
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.duration_seconds !== void 0) {
                  let data3 = data.duration_seconds;
                  const _errs8 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate107.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/type", keyword: "type", params: { type: schema54.properties.duration_seconds.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs8) {
                    if (typeof data3 == "number") {
                      if (data3 > 2147483647 || isNaN(data3)) {
                        validate107.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2147483647 }, message: "must be <= 2147483647" }];
                        return false;
                      } else {
                        if (data3 < 0 || isNaN(data3)) {
                          validate107.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.availability !== void 0) {
                    let data4 = data.availability;
                    const _errs10 = errors;
                    if (typeof data4 !== "string") {
                      validate107.errors = [{ instancePath: instancePath + "/availability", schemaPath: "#/properties/availability/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    if (!(data4 === "unknown" || data4 === "available" || data4 === "unavailable")) {
                      validate107.errors = [{ instancePath: instancePath + "/availability", schemaPath: "#/properties/availability/enum", keyword: "enum", params: { allowedValues: schema54.properties.availability.enum }, message: "must be equal to one of the allowed values" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.url !== void 0) {
                      let data5 = data.url;
                      const _errs12 = errors;
                      if (errors === _errs12) {
                        if (errors === _errs12) {
                          if (typeof data5 === "string") {
                            if (!pattern23.test(data5)) {
                              validate107.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/pattern", keyword: "pattern", params: { pattern: "^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$"' }];
                              return false;
                            } else {
                              if (!formats0(data5)) {
                                validate107.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/format", keyword: "format", params: { format: "uri" }, message: 'must match format "uri"' }];
                                return false;
                              }
                            }
                          } else {
                            validate107.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.preview_url !== void 0) {
                        let data6 = data.preview_url;
                        const _errs14 = errors;
                        if (errors === _errs14) {
                          if (errors === _errs14) {
                            if (typeof data6 === "string") {
                              if (!pattern24.test(data6)) {
                                validate107.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/pattern", keyword: "pattern", params: { pattern: "^https://i\\.ytimg\\.com/vi/[A-Za-z0-9_-]{11}/hqdefault\\.jpg$" }, message: 'must match pattern "^https://i\\.ytimg\\.com/vi/[A-Za-z0-9_-]{11}/hqdefault\\.jpg$"' }];
                                return false;
                              } else {
                                if (!formats0(data6)) {
                                  validate107.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/format", keyword: "format", params: { format: "uri" }, message: 'must match format "uri"' }];
                                  return false;
                                }
                              }
                            } else {
                              validate107.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                        }
                        var valid0 = _errs14 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.hashtags !== void 0) {
                          let data7 = data.hashtags;
                          const _errs16 = errors;
                          if (errors === _errs16) {
                            if (Array.isArray(data7)) {
                              if (data7.length > 100) {
                                validate107.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" }];
                                return false;
                              } else {
                                var valid1 = true;
                                const len0 = data7.length;
                                for (let i0 = 0; i0 < len0; i0++) {
                                  let data8 = data7[i0];
                                  const _errs18 = errors;
                                  if (errors === _errs18) {
                                    if (typeof data8 === "string") {
                                      if (func1(data8) > 100) {
                                        validate107.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/maxLength", keyword: "maxLength", params: { limit: 100 }, message: "must NOT have more than 100 characters" }];
                                        return false;
                                      } else {
                                        if (func1(data8) < 1) {
                                          validate107.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                          return false;
                                        } else {
                                          if (!pattern25.test(data8)) {
                                            validate107.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/pattern", keyword: "pattern", params: { pattern: "^[^#]" }, message: 'must match pattern "^[^#]"' }];
                                            return false;
                                          }
                                        }
                                      }
                                    } else {
                                      validate107.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                  }
                                  var valid1 = _errs18 === errors;
                                  if (!valid1) {
                                    break;
                                  }
                                }
                                if (valid1) {
                                  let i1 = data7.length;
                                  let j0;
                                  if (i1 > 1) {
                                    const indices0 = {};
                                    for (; i1--; ) {
                                      let item0 = data7[i1];
                                      if (typeof item0 !== "string") {
                                        continue;
                                      }
                                      if (typeof indices0[item0] == "number") {
                                        j0 = indices0[item0];
                                        validate107.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/uniqueItems", keyword: "uniqueItems", params: { i: i1, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i1 + " are identical)" }];
                                        return false;
                                        break;
                                      }
                                      indices0[item0] = i1;
                                    }
                                  }
                                }
                              }
                            } else {
                              validate107.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                              return false;
                            }
                          }
                          var valid0 = _errs16 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.hashtags_observation_status !== void 0) {
                            let data9 = data.hashtags_observation_status;
                            const _errs20 = errors;
                            if (typeof data9 !== "string") {
                              validate107.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            if (!(data9 === "unknown" || data9 === "partial" || data9 === "complete")) {
                              validate107.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/enum", keyword: "enum", params: { allowedValues: schema54.properties.hashtags_observation_status.enum }, message: "must be equal to one of the allowed values" }];
                              return false;
                            }
                            var valid0 = _errs20 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.channel !== void 0) {
                              let data10 = data.channel;
                              const _errs22 = errors;
                              const _errs23 = errors;
                              let valid3 = false;
                              const _errs24 = errors;
                              if (!validate69(data10, { instancePath: instancePath + "/channel", parentData: data, parentDataProperty: "channel", rootData, dynamicAnchors })) {
                                vErrors = vErrors === null ? validate69.errors : vErrors.concat(validate69.errors);
                                errors = vErrors.length;
                              }
                              var _valid0 = _errs24 === errors;
                              valid3 = valid3 || _valid0;
                              const _errs25 = errors;
                              if (data10 !== null) {
                                const err0 = { instancePath: instancePath + "/channel", schemaPath: "#/properties/channel/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                if (vErrors === null) {
                                  vErrors = [err0];
                                } else {
                                  vErrors.push(err0);
                                }
                                errors++;
                              }
                              var _valid0 = _errs25 === errors;
                              valid3 = valid3 || _valid0;
                              if (!valid3) {
                                const err1 = { instancePath: instancePath + "/channel", schemaPath: "#/properties/channel/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                if (vErrors === null) {
                                  vErrors = [err1];
                                } else {
                                  vErrors.push(err1);
                                }
                                errors++;
                                validate107.errors = vErrors;
                                return false;
                              } else {
                                errors = _errs23;
                                if (vErrors !== null) {
                                  if (_errs23) {
                                    vErrors.length = _errs23;
                                  } else {
                                    vErrors = null;
                                  }
                                }
                              }
                              var valid0 = _errs22 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.rating !== void 0) {
                                const _errs27 = errors;
                                if (!validate99(data.rating, { instancePath: instancePath + "/rating", parentData: data, parentDataProperty: "rating", rootData, dynamicAnchors })) {
                                  vErrors = vErrors === null ? validate99.errors : vErrors.concat(validate99.errors);
                                  errors = vErrors.length;
                                }
                                var valid0 = _errs27 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data.my_state !== void 0) {
                                  const _errs28 = errors;
                                  if (!validate95(data.my_state, { instancePath: instancePath + "/my_state", parentData: data, parentDataProperty: "my_state", rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
                                    errors = vErrors.length;
                                  }
                                  var valid0 = _errs28 === errors;
                                } else {
                                  var valid0 = true;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate107.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate107.errors = vErrors;
  return errors === 0;
}
validate107.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_VideoPatch = validate111;
var schema55 = { "type": "object", "properties": { "expected_revision": { "type": "integer", "format": "int64", "minimum": 0, "description": "JSON int64. JavaScript clients must reject unsafe integers rather than round a revision or sequence." }, "rating": { "type": ["integer", "null"], "minimum": 1, "maximum": 10 }, "added": { "type": "boolean" }, "later": { "type": "boolean" } }, "required": ["expected_revision"], "additionalProperties": false, "anyOf": [{ "required": ["rating"] }, { "required": ["added"] }, { "required": ["later"] }] };
function validate111(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate111.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs1 = errors;
  let valid0 = false;
  const _errs2 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.rating === void 0 && (missing0 = "rating")) {
      const err0 = { instancePath, schemaPath: "#/anyOf/0/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  const _errs3 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing1;
    if (data.added === void 0 && (missing1 = "added")) {
      const err1 = { instancePath, schemaPath: "#/anyOf/1/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  const _errs4 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing2;
    if (data.later === void 0 && (missing2 = "later")) {
      const err2 = { instancePath, schemaPath: "#/anyOf/2/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (!valid0) {
    const err3 = { instancePath, schemaPath: "#/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
    validate111.errors = vErrors;
    return false;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing3;
      if (data.expected_revision === void 0 && (missing3 = "expected_revision")) {
        validate111.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" }];
        return false;
      } else {
        const _errs5 = errors;
        for (const key0 in data) {
          if (!(key0 === "expected_revision" || key0 === "rating" || key0 === "added" || key0 === "later")) {
            validate111.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs5 === errors) {
          if (data.expected_revision !== void 0) {
            let data0 = data.expected_revision;
            const _errs6 = errors;
            if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)))) {
              validate111.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs6) {
              if (typeof data0 == "number") {
                if (data0 < 0 || isNaN(data0)) {
                  validate111.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                } else {
                  if (!formats8.validate(data0)) {
                    validate111.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                    return false;
                  }
                }
              }
            }
            var valid1 = _errs6 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.rating !== void 0) {
              let data1 = data.rating;
              const _errs8 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1))) && data1 !== null) {
                validate111.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema55.properties.rating.type }, message: "must be integer,null" }];
                return false;
              }
              if (errors === _errs8) {
                if (typeof data1 == "number") {
                  if (data1 > 10 || isNaN(data1)) {
                    validate111.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                    return false;
                  } else {
                    if (data1 < 1 || isNaN(data1)) {
                      validate111.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                      return false;
                    }
                  }
                }
              }
              var valid1 = _errs8 === errors;
            } else {
              var valid1 = true;
            }
            if (valid1) {
              if (data.added !== void 0) {
                const _errs10 = errors;
                if (typeof data.added !== "boolean") {
                  validate111.errors = [{ instancePath: instancePath + "/added", schemaPath: "#/properties/added/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                  return false;
                }
                var valid1 = _errs10 === errors;
              } else {
                var valid1 = true;
              }
              if (valid1) {
                if (data.later !== void 0) {
                  const _errs12 = errors;
                  if (typeof data.later !== "boolean") {
                    validate111.errors = [{ instancePath: instancePath + "/later", schemaPath: "#/properties/later/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                    return false;
                  }
                  var valid1 = _errs12 === errors;
                } else {
                  var valid1 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate111.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate111.errors = vErrors;
  return errors === 0;
}
validate111.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_VideoState = validate112;
function validate112(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate112.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs2 = errors;
  let valid1 = true;
  const _errs3 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.revision === void 0 && (missing0 = "revision")) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    } else {
      if (data.revision !== void 0) {
        if (0 !== data.revision) {
          const err1 = {};
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
    }
  }
  var _valid0 = _errs3 === errors;
  errors = _errs2;
  if (vErrors !== null) {
    if (_errs2) {
      vErrors.length = _errs2;
    } else {
      vErrors = null;
    }
  }
  if (_valid0) {
    const _errs5 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.rating !== void 0) {
        const _errs6 = errors;
        if (data.rating !== null) {
          validate112.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/allOf/0/then/properties/rating/type", keyword: "type", params: { type: "null" }, message: "must be null" }];
          return false;
        }
        var valid3 = _errs6 === errors;
      } else {
        var valid3 = true;
      }
      if (valid3) {
        if (data.added !== void 0) {
          const _errs8 = errors;
          if (false !== data.added) {
            validate112.errors = [{ instancePath: instancePath + "/added", schemaPath: "#/allOf/0/then/properties/added/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" }];
            return false;
          }
          var valid3 = _errs8 === errors;
        } else {
          var valid3 = true;
        }
        if (valid3) {
          if (data.later !== void 0) {
            const _errs9 = errors;
            if (false !== data.later) {
              validate112.errors = [{ instancePath: instancePath + "/later", schemaPath: "#/allOf/0/then/properties/later/const", keyword: "const", params: { allowedValue: false }, message: "must be equal to constant" }];
              return false;
            }
            var valid3 = _errs9 === errors;
          } else {
            var valid3 = true;
          }
        }
      }
    }
    var _valid0 = _errs5 === errors;
    valid1 = _valid0;
    if (valid1) {
      var props0 = {};
      props0.rating = true;
      props0.added = true;
      props0.later = true;
      props0.revision = true;
    }
  }
  if (!valid1) {
    const err2 = { instancePath, schemaPath: "#/allOf/0/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
    validate112.errors = vErrors;
    return false;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing1;
      if (data.revision === void 0 && (missing1 = "revision") || data.rating === void 0 && (missing1 = "rating") || data.added === void 0 && (missing1 = "added") || data.later === void 0 && (missing1 = "later")) {
        validate112.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
        return false;
      } else {
        const _errs10 = errors;
        for (const key0 in data) {
          if (!(key0 === "revision" || key0 === "rating" || key0 === "added" || key0 === "later")) {
            validate112.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs10 === errors) {
          if (data.revision !== void 0) {
            let data4 = data.revision;
            const _errs11 = errors;
            if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)))) {
              validate112.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs11) {
              if (typeof data4 == "number") {
                if (data4 < 0 || isNaN(data4)) {
                  validate112.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                } else {
                  if (!formats8.validate(data4)) {
                    validate112.errors = [{ instancePath: instancePath + "/revision", schemaPath: "#/properties/revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                    return false;
                  }
                }
              }
            }
            var valid4 = _errs11 === errors;
          } else {
            var valid4 = true;
          }
          if (valid4) {
            if (data.rating !== void 0) {
              let data5 = data.rating;
              const _errs13 = errors;
              if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5))) && data5 !== null) {
                validate112.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema46.properties.rating.type }, message: "must be integer,null" }];
                return false;
              }
              if (errors === _errs13) {
                if (typeof data5 == "number") {
                  if (data5 > 10 || isNaN(data5)) {
                    validate112.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                    return false;
                  } else {
                    if (data5 < 1 || isNaN(data5)) {
                      validate112.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                      return false;
                    }
                  }
                }
              }
              var valid4 = _errs13 === errors;
            } else {
              var valid4 = true;
            }
            if (valid4) {
              if (data.added !== void 0) {
                const _errs15 = errors;
                if (typeof data.added !== "boolean") {
                  validate112.errors = [{ instancePath: instancePath + "/added", schemaPath: "#/properties/added/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                  return false;
                }
                var valid4 = _errs15 === errors;
              } else {
                var valid4 = true;
              }
              if (valid4) {
                if (data.later !== void 0) {
                  const _errs17 = errors;
                  if (typeof data.later !== "boolean") {
                    validate112.errors = [{ instancePath: instancePath + "/later", schemaPath: "#/properties/later/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                    return false;
                  }
                  var valid4 = _errs17 === errors;
                } else {
                  var valid4 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate112.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate112.errors = vErrors;
  return errors === 0;
}
validate112.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_VideoStateResult = validate113;
function validate113(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate113.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.target_id === void 0 && (missing0 = "target_id") || data.state === void 0 && (missing0 = "state") || data.change_seq === void 0 && (missing0 = "change_seq")) {
        validate113.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "target_id" || key0 === "state" || key0 === "change_seq")) {
            validate113.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            const _errs2 = errors;
            if ("video_state" !== data.kind) {
              validate113.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "video_state" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.target_id !== void 0) {
              let data1 = data.target_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate113.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate113.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.state !== void 0) {
                const _errs5 = errors;
                if (!validate95(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.change_seq !== void 0) {
                  let data3 = data.change_seq;
                  const _errs6 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate113.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/type", keyword: "type", params: { type: schema45.properties.change_seq.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs6) {
                    if (typeof data3 == "number") {
                      if (data3 < 1 || isNaN(data3)) {
                        validate113.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                        return false;
                      } else {
                        if (!formats8.validate(data3)) {
                          validate113.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate113.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate113.errors = vErrors;
  return errors === 0;
}
validate113.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_WebCredentials = validate115;
function validate115(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate115.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.user === void 0 && (missing0 = "user") || data.access_token === void 0 && (missing0 = "access_token") || data.session_id === void 0 && (missing0 = "session_id")) {
        validate115.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "user" || key0 === "access_token" || key0 === "session_id")) {
            validate115.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.user !== void 0) {
            const _errs2 = errors;
            if (!validate76(data.user, { instancePath: instancePath + "/user", parentData: data, parentDataProperty: "user", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate76.errors : vErrors.concat(validate76.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.access_token !== void 0) {
              let data1 = data.access_token;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (typeof data1 === "string") {
                  if (func1(data1) < 1) {
                    validate115.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate115.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.session_id !== void 0) {
                let data2 = data.session_id;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (errors === _errs5) {
                    if (typeof data2 === "string") {
                      if (!formats4.test(data2)) {
                        validate115.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                        return false;
                      }
                    } else {
                      validate115.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate115.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate115.errors = vErrors;
  return errors === 0;
}
validate115.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema_WebRefresh = validate117;
function validate117(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate117.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.client_type === void 0 && (missing0 = "client_type") || data.attempt_id === void 0 && (missing0 = "attempt_id") || data.attempt_proof === void 0 && (missing0 = "attempt_proof")) {
        validate117.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "client_type" || key0 === "attempt_id" || key0 === "attempt_proof")) {
            validate117.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.client_type !== void 0) {
            const _errs2 = errors;
            if ("web" !== data.client_type) {
              validate117.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/const", keyword: "const", params: { allowedValue: "web" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.attempt_id !== void 0) {
              let data1 = data.attempt_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate117.errors = [{ instancePath: instancePath + "/attempt_id", schemaPath: "#/properties/attempt_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate117.errors = [{ instancePath: instancePath + "/attempt_id", schemaPath: "#/properties/attempt_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.attempt_proof !== void 0) {
                let data2 = data.attempt_proof;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 43) {
                      validate117.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/maxLength", keyword: "maxLength", params: { limit: 43 }, message: "must NOT have more than 43 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 43) {
                        validate117.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/minLength", keyword: "minLength", params: { limit: 43 }, message: "must NOT have fewer than 43 characters" }];
                        return false;
                      } else {
                        if (!pattern4.test(data2)) {
                          validate117.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$" }, message: 'must match pattern "^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$"' }];
                          return false;
                        }
                      }
                    }
                  } else {
                    validate117.errors = [{ instancePath: instancePath + "/attempt_proof", schemaPath: "#/properties/attempt_proof/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate117.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate117.errors = vErrors;
  return errors === 0;
}
validate117.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var registerAccount_response_201 = validate118;
function validate118(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate118.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate75(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate75.errors : vErrors.concat(validate75.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (!validate79(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate118.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate118.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate118.evaluated = { "dynamicProps": true, "dynamicItems": false };
var registerAccount_response_403 = validate121;
function validate121(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate121.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate121.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate121.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate121.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate121.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate121.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate121.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate121.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate121.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate121.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate121.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate121.errors = vErrors;
  return errors === 0;
}
validate121.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var registerAccount_response_default = validate122;
function validate122(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate122.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate122.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate122.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate122.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate122.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate122.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate122.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate122.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate122.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate122.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate122.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate122.errors = vErrors;
  return errors === 0;
}
validate122.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var registerAccount_request = validate123;
function validate123(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate123.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.login === void 0 && (missing0 = "login") || data.email === void 0 && (missing0 = "email") || data.name === void 0 && (missing0 = "name") || data.password === void 0 && (missing0 = "password") || data.client_type === void 0 && (missing0 = "client_type")) {
        validate123.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "login" || key0 === "email" || key0 === "name" || key0 === "password" || key0 === "client_type")) {
            validate123.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.login !== void 0) {
            let data0 = data.login;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (!pattern9.test(data0)) {
                  validate123.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_]{3,32}$" }, message: 'must match pattern "^[A-Za-z0-9_]{3,32}$"' }];
                  return false;
                }
              } else {
                validate123.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.email !== void 0) {
              let data1 = data.email;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 254) {
                    validate123.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/maxLength", keyword: "maxLength", params: { limit: 254 }, message: "must NOT have more than 254 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 3) {
                      validate123.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" }];
                      return false;
                    } else {
                      if (!pattern10.test(data1)) {
                        validate123.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/pattern", keyword: "pattern", params: { pattern: "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$" }, message: 'must match pattern "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate123.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.name !== void 0) {
                const _errs6 = errors;
                if (typeof data.name !== "string") {
                  validate123.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.password !== void 0) {
                  let data3 = data.password;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 128) {
                        validate123.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 8) {
                          validate123.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/minLength", keyword: "minLength", params: { limit: 8 }, message: "must NOT have fewer than 8 characters" }];
                          return false;
                        }
                      }
                    } else {
                      validate123.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.client_type !== void 0) {
                    let data4 = data.client_type;
                    const _errs10 = errors;
                    if (typeof data4 !== "string") {
                      validate123.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    if (!(data4 === "web" || data4 === "extension")) {
                      validate123.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/enum", keyword: "enum", params: { allowedValues: schema52.properties.client_type.enum }, message: "must be equal to one of the allowed values" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate123.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate123.errors = vErrors;
  return errors === 0;
}
validate123.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var registerAccount_parameter_0 = validate124;
function validate124(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate124.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate124.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  validate124.errors = vErrors;
  return errors === 0;
}
validate124.evaluated = { "dynamicProps": false, "dynamicItems": false };
var loginAccount_response_200 = validate125;
function validate125(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate125.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate75(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate75.errors : vErrors.concat(validate75.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (!validate79(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate125.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate125.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate125.evaluated = { "dynamicProps": true, "dynamicItems": false };
var loginAccount_response_403 = validate128;
function validate128(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate128.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate128.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate128.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate128.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate128.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate128.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate128.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate128.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate128.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate128.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate128.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate128.errors = vErrors;
  return errors === 0;
}
validate128.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var loginAccount_response_default = validate129;
function validate129(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate129.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate129.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate129.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate129.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate129.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate129.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate129.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate129.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate129.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate129.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate129.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate129.errors = vErrors;
  return errors === 0;
}
validate129.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var loginAccount_request = validate130;
function validate130(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate130.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.login === void 0 && (missing0 = "login") || data.password === void 0 && (missing0 = "password") || data.client_type === void 0 && (missing0 = "client_type")) {
        validate130.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "login" || key0 === "password" || key0 === "client_type")) {
            validate130.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.login !== void 0) {
            const _errs2 = errors;
            if (typeof data.login !== "string") {
              validate130.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.password !== void 0) {
              let data1 = data.password;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 128) {
                    validate130.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 8) {
                      validate130.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/minLength", keyword: "minLength", params: { limit: 8 }, message: "must NOT have fewer than 8 characters" }];
                      return false;
                    }
                  }
                } else {
                  validate130.errors = [{ instancePath: instancePath + "/password", schemaPath: "#/properties/password/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.client_type !== void 0) {
                let data2 = data.client_type;
                const _errs6 = errors;
                if (typeof data2 !== "string") {
                  validate130.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data2 === "web" || data2 === "extension")) {
                  validate130.errors = [{ instancePath: instancePath + "/client_type", schemaPath: "#/properties/client_type/enum", keyword: "enum", params: { allowedValues: schema42.properties.client_type.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate130.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate130.errors = vErrors;
  return errors === 0;
}
validate130.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var refreshSession_response_200 = validate131;
function validate131(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate131.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate75(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate75.errors : vErrors.concat(validate75.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (!validate79(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate131.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate131.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate131.evaluated = { "dynamicProps": true, "dynamicItems": false };
var refreshSession_response_403 = validate134;
function validate134(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate134.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate134.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate134.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate134.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate134.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate134.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate134.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate134.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate134.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate134.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate134.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate134.errors = vErrors;
  return errors === 0;
}
validate134.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var refreshSession_response_default = validate135;
function validate135(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate135.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate135.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate135.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate135.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate135.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate135.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate135.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate135.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate135.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate135.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate135.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate135.errors = vErrors;
  return errors === 0;
}
validate135.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var refreshSession_request = validate136;
function validate136(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate136.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (!validate102(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate102.errors : vErrors.concat(validate102.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (!validate88(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate88.errors : vErrors.concat(validate88.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
  }
  if (!valid0) {
    const err0 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
    validate136.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate136.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate136.evaluated = { "dynamicProps": true, "dynamicItems": false };
var logoutCurrentSession_response_403 = validate139;
function validate139(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate139.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate139.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate139.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate139.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate139.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate139.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate139.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate139.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate139.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate139.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate139.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate139.errors = vErrors;
  return errors === 0;
}
validate139.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var logoutCurrentSession_response_default = validate140;
function validate140(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate140.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate140.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate140.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate140.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate140.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate140.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate140.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate140.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate140.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate140.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate140.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate140.errors = vErrors;
  return errors === 0;
}
validate140.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var logoutOtherSessions_response_403 = validate141;
function validate141(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate141.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate141.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate141.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate141.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate141.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate141.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate141.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate141.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate141.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate141.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate141.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate141.errors = vErrors;
  return errors === 0;
}
validate141.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var logoutOtherSessions_response_default = validate142;
function validate142(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate142.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate142.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate142.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate142.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate142.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate142.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate142.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate142.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate142.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate142.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate142.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate142.errors = vErrors;
  return errors === 0;
}
validate142.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var listSessions_response_200 = validate143;
function validate143(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate143.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.items === void 0 && (missing0 = "items")) {
        validate143.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "items" || key0 === "next_cursor")) {
            validate143.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.items !== void 0) {
            let data0 = data.items;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (Array.isArray(data0)) {
                if (data0.length > 100) {
                  validate143.errors = [{ instancePath: instancePath + "/items", schemaPath: "#/properties/items/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" }];
                  return false;
                } else {
                  var valid1 = true;
                  const len0 = data0.length;
                  for (let i0 = 0; i0 < len0; i0++) {
                    const _errs4 = errors;
                    if (!validate82(data0[i0], { instancePath: instancePath + "/items/" + i0, parentData: data0, parentDataProperty: i0, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate82.errors : vErrors.concat(validate82.errors);
                      errors = vErrors.length;
                    }
                    var valid1 = _errs4 === errors;
                    if (!valid1) {
                      break;
                    }
                  }
                }
              } else {
                validate143.errors = [{ instancePath: instancePath + "/items", schemaPath: "#/properties/items/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.next_cursor !== void 0) {
              let data2 = data.next_cursor;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (typeof data2 === "string") {
                  if (func1(data2) > 128) {
                    validate143.errors = [{ instancePath: instancePath + "/next_cursor", schemaPath: "#/properties/next_cursor/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                    return false;
                  } else {
                    if (func1(data2) < 1) {
                      validate143.errors = [{ instancePath: instancePath + "/next_cursor", schemaPath: "#/properties/next_cursor/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                      return false;
                    }
                  }
                } else {
                  validate143.errors = [{ instancePath: instancePath + "/next_cursor", schemaPath: "#/properties/next_cursor/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs5 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate143.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate143.errors = vErrors;
  return errors === 0;
}
validate143.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var listSessions_response_403 = validate145;
function validate145(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate145.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate145.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate145.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate145.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate145.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate145.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate145.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate145.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate145.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate145.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate145.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate145.errors = vErrors;
  return errors === 0;
}
validate145.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var listSessions_response_default = validate146;
function validate146(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate146.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate146.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate146.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate146.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate146.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate146.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate146.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate146.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate146.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate146.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate146.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate146.errors = vErrors;
  return errors === 0;
}
validate146.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var listSessions_parameter_0 = validate147;
function validate147(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate147.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (typeof data === "string") {
      if (func1(data) > 128) {
        validate147.errors = [{ instancePath, schemaPath: "#/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
        return false;
      }
    } else {
      validate147.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
      return false;
    }
  }
  validate147.errors = vErrors;
  return errors === 0;
}
validate147.evaluated = { "dynamicProps": false, "dynamicItems": false };
var listSessions_parameter_1 = validate148;
function validate148(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate148.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (!(typeof data == "number" && (!(data % 1) && !isNaN(data)))) {
    validate148.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
    return false;
  }
  if (errors === 0) {
    if (typeof data == "number") {
      if (data > 100 || isNaN(data)) {
        validate148.errors = [{ instancePath, schemaPath: "#/maximum", keyword: "maximum", params: { comparison: "<=", limit: 100 }, message: "must be <= 100" }];
        return false;
      } else {
        if (data < 1 || isNaN(data)) {
          validate148.errors = [{ instancePath, schemaPath: "#/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
          return false;
        }
      }
    }
  }
  validate148.errors = vErrors;
  return errors === 0;
}
validate148.evaluated = { "dynamicProps": false, "dynamicItems": false };
var revokeSession_response_403 = validate149;
function validate149(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate149.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate149.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate149.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate149.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate149.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate149.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate149.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate149.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate149.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate149.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate149.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate149.errors = vErrors;
  return errors === 0;
}
validate149.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var revokeSession_response_default = validate150;
function validate150(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate150.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate150.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate150.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate150.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate150.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate150.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate150.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate150.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate150.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate150.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate150.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate150.errors = vErrors;
  return errors === 0;
}
validate150.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var revokeSession_parameter_0 = validate151;
function validate151(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate151.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (errors === _errs1) {
    if (errors === _errs1) {
      if (typeof data === "string") {
        if (!formats4.test(data)) {
          const err0 = { instancePath, schemaPath: "#/anyOf/0/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = { instancePath, schemaPath: "#/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  const _errs3 = errors;
  if ("self" !== data) {
    const err2 = { instancePath, schemaPath: "#/anyOf/1/const", keyword: "const", params: { allowedValue: "self" }, message: "must be equal to constant" };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (!valid0) {
    const err3 = { instancePath, schemaPath: "#/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
    validate151.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate151.errors = vErrors;
  return errors === 0;
}
validate151.evaluated = { "dynamicProps": false, "dynamicItems": false };
var getMe_response_200 = validate152;
function validate152(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate152.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.login === void 0 && (missing0 = "login") || data.name === void 0 && (missing0 = "name") || data.email === void 0 && (missing0 = "email")) {
        validate152.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "id" || key0 === "login" || key0 === "name" || key0 === "email")) {
            validate152.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data0 = data.id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (errors === _errs2) {
                if (typeof data0 === "string") {
                  if (!formats4.test(data0)) {
                    validate152.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                    return false;
                  }
                } else {
                  validate152.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.login !== void 0) {
              let data1 = data.login;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 32) {
                    validate152.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/maxLength", keyword: "maxLength", params: { limit: 32 }, message: "must NOT have more than 32 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 3) {
                      validate152.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" }];
                      return false;
                    } else {
                      if (!pattern9.test(data1)) {
                        validate152.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_]{3,32}$" }, message: 'must match pattern "^[A-Za-z0-9_]{3,32}$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate152.errors = [{ instancePath: instancePath + "/login", schemaPath: "#/properties/login/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.name !== void 0) {
                let data2 = data.name;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 100) {
                      validate152.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/maxLength", keyword: "maxLength", params: { limit: 100 }, message: "must NOT have more than 100 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 1) {
                        validate152.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    }
                  } else {
                    validate152.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.email !== void 0) {
                  let data3 = data.email;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 254) {
                        validate152.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/maxLength", keyword: "maxLength", params: { limit: 254 }, message: "must NOT have more than 254 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 3) {
                          validate152.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" }];
                          return false;
                        } else {
                          if (!pattern10.test(data3)) {
                            validate152.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/pattern", keyword: "pattern", params: { pattern: "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$" }, message: 'must match pattern "^[^\\x00-\\x1F\\x7F]+@[^\\x00-\\x1F\\x7F]+$"' }];
                            return false;
                          }
                        }
                      }
                    } else {
                      validate152.errors = [{ instancePath: instancePath + "/email", schemaPath: "#/properties/email/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate152.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate152.errors = vErrors;
  return errors === 0;
}
validate152.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getMe_response_403 = validate153;
function validate153(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate153.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate153.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate153.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate153.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate153.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate153.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate153.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate153.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate153.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate153.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate153.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate153.errors = vErrors;
  return errors === 0;
}
validate153.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getMe_response_default = validate154;
function validate154(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate154.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate154.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate154.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate154.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate154.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate154.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate154.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate154.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate154.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate154.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate154.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate154.errors = vErrors;
  return errors === 0;
}
validate154.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var issueOfflineLease_response_200 = validate155;
function validate155(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate155.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.lease === void 0 && (missing0 = "lease") || data.valid_for_seconds === void 0 && (missing0 = "valid_for_seconds")) {
        validate155.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "lease" || key0 === "valid_for_seconds")) {
            validate155.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.lease !== void 0) {
            let data0 = data.lease;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate155.errors = [{ instancePath: instancePath + "/lease", schemaPath: "#/properties/lease/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate155.errors = [{ instancePath: instancePath + "/lease", schemaPath: "#/properties/lease/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.valid_for_seconds !== void 0) {
              const _errs4 = errors;
              if (604800 !== data.valid_for_seconds) {
                validate155.errors = [{ instancePath: instancePath + "/valid_for_seconds", schemaPath: "#/properties/valid_for_seconds/const", keyword: "const", params: { allowedValue: 604800 }, message: "must be equal to constant" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate155.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate155.errors = vErrors;
  return errors === 0;
}
validate155.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var issueOfflineLease_response_403 = validate156;
function validate156(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate156.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate156.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate156.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate156.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate156.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate156.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate156.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate156.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate156.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate156.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate156.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate156.errors = vErrors;
  return errors === 0;
}
validate156.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var issueOfflineLease_response_default = validate157;
function validate157(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate157.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate157.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate157.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate157.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate157.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate157.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate157.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate157.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate157.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate157.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate157.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate157.errors = vErrors;
  return errors === 0;
}
validate157.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var changePassword_response_403 = validate158;
function validate158(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate158.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate158.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate158.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate158.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate158.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate158.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate158.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate158.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate158.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate158.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate158.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate158.errors = vErrors;
  return errors === 0;
}
validate158.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var changePassword_response_default = validate159;
function validate159(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate159.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate159.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate159.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate159.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate159.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate159.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate159.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate159.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate159.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate159.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate159.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate159.errors = vErrors;
  return errors === 0;
}
validate159.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var changePassword_request = validate160;
function validate160(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate160.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.current_password === void 0 && (missing0 = "current_password") || data.new_password === void 0 && (missing0 = "new_password")) {
        validate160.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "current_password" || key0 === "new_password")) {
            validate160.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.current_password !== void 0) {
            let data0 = data.current_password;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) > 128) {
                  validate160.errors = [{ instancePath: instancePath + "/current_password", schemaPath: "#/properties/current_password/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 8) {
                    validate160.errors = [{ instancePath: instancePath + "/current_password", schemaPath: "#/properties/current_password/minLength", keyword: "minLength", params: { limit: 8 }, message: "must NOT have fewer than 8 characters" }];
                    return false;
                  }
                }
              } else {
                validate160.errors = [{ instancePath: instancePath + "/current_password", schemaPath: "#/properties/current_password/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.new_password !== void 0) {
              let data1 = data.new_password;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 128) {
                    validate160.errors = [{ instancePath: instancePath + "/new_password", schemaPath: "#/properties/new_password/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 8) {
                      validate160.errors = [{ instancePath: instancePath + "/new_password", schemaPath: "#/properties/new_password/minLength", keyword: "minLength", params: { limit: 8 }, message: "must NOT have fewer than 8 characters" }];
                      return false;
                    }
                  }
                } else {
                  validate160.errors = [{ instancePath: instancePath + "/new_password", schemaPath: "#/properties/new_password/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate160.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate160.errors = vErrors;
  return errors === 0;
}
validate160.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var addObservedVideo_response_200 = validate161;
function validate161(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate161.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  if (!validate94(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate94.errors : vErrors.concat(validate94.errors);
    errors = vErrors.length;
  }
  var valid0 = _errs0 === errors;
  if (valid0) {
    const _errs1 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.state !== void 0) {
        let data0 = data.state;
        if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
          if (data0.added !== void 0) {
            if (true !== data0.added) {
              validate161.errors = [{ instancePath: instancePath + "/state/added", schemaPath: "#/allOf/1/properties/state/properties/added/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
              return false;
            }
          }
        }
      }
    }
    var valid0 = _errs1 === errors;
  }
  validate161.errors = vErrors;
  return errors === 0;
}
validate161.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var addObservedVideo_response_403 = validate163;
function validate163(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate163.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate163.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate163.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate163.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate163.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate163.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate163.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate163.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate163.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate163.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate163.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate163.errors = vErrors;
  return errors === 0;
}
validate163.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var addObservedVideo_response_default = validate164;
function validate164(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate164.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate164.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate164.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate164.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate164.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate164.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate164.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate164.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate164.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate164.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate164.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate164.errors = vErrors;
  return errors === 0;
}
validate164.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var addObservedVideo_request = validate165;
function validate165(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate165.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs2 = errors;
  let valid1 = true;
  const _errs3 = errors;
  const _errs4 = errors;
  let valid2 = false;
  const _errs5 = errors;
  const _errs6 = errors;
  const _errs7 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.hashtags_observation_status === void 0 && (missing0 = "hashtags_observation_status")) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var valid3 = _errs7 === errors;
  if (valid3) {
    const err1 = {};
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  } else {
    errors = _errs6;
    if (vErrors !== null) {
      if (_errs6) {
        vErrors.length = _errs6;
      } else {
        vErrors = null;
      }
    }
  }
  var _valid1 = _errs5 === errors;
  valid2 = valid2 || _valid1;
  const _errs8 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing1;
    if (data.hashtags_observation_status === void 0 && (missing1 = "hashtags_observation_status")) {
      const err2 = {};
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    } else {
      if (data.hashtags_observation_status !== void 0) {
        let data0 = data.hashtags_observation_status;
        if (!(data0 === "unknown" || data0 === null)) {
          const err3 = {};
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      }
    }
  }
  var _valid1 = _errs8 === errors;
  valid2 = valid2 || _valid1;
  if (_valid1) {
    var props0 = {};
    props0.hashtags_observation_status = true;
  }
  if (!valid2) {
    const err4 = {};
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
  } else {
    errors = _errs4;
    if (vErrors !== null) {
      if (_errs4) {
        vErrors.length = _errs4;
      } else {
        vErrors = null;
      }
    }
  }
  var _valid0 = _errs3 === errors;
  errors = _errs2;
  if (vErrors !== null) {
    if (_errs2) {
      vErrors.length = _errs2;
    } else {
      vErrors = null;
    }
  }
  if (_valid0) {
    const _errs10 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.hashtags !== void 0) {
        let data1 = data.hashtags;
        const _errs12 = errors;
        let valid6 = false;
        const _errs13 = errors;
        if (errors === _errs13) {
          if (Array.isArray(data1)) {
            if (data1.length > 0) {
              const err5 = { instancePath: instancePath + "/hashtags", schemaPath: "#/allOf/0/then/properties/hashtags/anyOf/0/maxItems", keyword: "maxItems", params: { limit: 0 }, message: "must NOT have more than 0 items" };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          } else {
            const err6 = { instancePath: instancePath + "/hashtags", schemaPath: "#/allOf/0/then/properties/hashtags/anyOf/0/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        var _valid2 = _errs13 === errors;
        valid6 = valid6 || _valid2;
        const _errs15 = errors;
        if (data1 !== null) {
          const err7 = { instancePath: instancePath + "/hashtags", schemaPath: "#/allOf/0/then/properties/hashtags/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        var _valid2 = _errs15 === errors;
        valid6 = valid6 || _valid2;
        if (!valid6) {
          const err8 = { instancePath: instancePath + "/hashtags", schemaPath: "#/allOf/0/then/properties/hashtags/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
          validate165.errors = vErrors;
          return false;
        } else {
          errors = _errs12;
          if (vErrors !== null) {
            if (_errs12) {
              vErrors.length = _errs12;
            } else {
              vErrors = null;
            }
          }
        }
      }
    }
    var _valid0 = _errs10 === errors;
    valid1 = _valid0;
    if (valid1) {
      if (props0 !== true) {
        props0 = props0 || {};
        props0.hashtags = true;
      }
    }
  }
  if (!valid1) {
    const err9 = { instancePath, schemaPath: "#/allOf/0/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema' };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
    validate165.errors = vErrors;
    return false;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing2;
      if (data.youtube_video_id === void 0 && (missing2 = "youtube_video_id") || data.expected_revision === void 0 && (missing2 = "expected_revision")) {
        validate165.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" }];
        return false;
      } else {
        const _errs17 = errors;
        for (const key0 in data) {
          if (!func36.call(schema43.properties, key0)) {
            validate165.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs17 === errors) {
          if (data.youtube_video_id !== void 0) {
            let data2 = data.youtube_video_id;
            const _errs18 = errors;
            if (errors === _errs18) {
              if (typeof data2 === "string") {
                if (func1(data2) > 11) {
                  validate165.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/maxLength", keyword: "maxLength", params: { limit: 11 }, message: "must NOT have more than 11 characters" }];
                  return false;
                } else {
                  if (func1(data2) < 11) {
                    validate165.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/minLength", keyword: "minLength", params: { limit: 11 }, message: "must NOT have fewer than 11 characters" }];
                    return false;
                  } else {
                    if (!pattern15.test(data2)) {
                      validate165.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^[A-Za-z0-9_-]{11}$"' }];
                      return false;
                    }
                  }
                }
              } else {
                validate165.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid7 = _errs18 === errors;
          } else {
            var valid7 = true;
          }
          if (valid7) {
            if (data.title !== void 0) {
              let data3 = data.title;
              const _errs20 = errors;
              if (typeof data3 !== "string" && data3 !== null) {
                validate165.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: schema43.properties.title.type }, message: "must be string,null" }];
                return false;
              }
              var valid7 = _errs20 === errors;
            } else {
              var valid7 = true;
            }
            if (valid7) {
              if (data.youtube_channel_id !== void 0) {
                let data4 = data.youtube_channel_id;
                const _errs22 = errors;
                if (typeof data4 !== "string" && data4 !== null) {
                  validate165.errors = [{ instancePath: instancePath + "/youtube_channel_id", schemaPath: "#/properties/youtube_channel_id/type", keyword: "type", params: { type: schema43.properties.youtube_channel_id.type }, message: "must be string,null" }];
                  return false;
                }
                if (errors === _errs22) {
                  if (typeof data4 === "string") {
                    if (!pattern16.test(data4)) {
                      validate165.errors = [{ instancePath: instancePath + "/youtube_channel_id", schemaPath: "#/properties/youtube_channel_id/pattern", keyword: "pattern", params: { pattern: "^(UC[A-Za-z0-9_-]{22})?$" }, message: 'must match pattern "^(UC[A-Za-z0-9_-]{22})?$"' }];
                      return false;
                    }
                  }
                }
                var valid7 = _errs22 === errors;
              } else {
                var valid7 = true;
              }
              if (valid7) {
                if (data.channel_name !== void 0) {
                  let data5 = data.channel_name;
                  const _errs24 = errors;
                  if (typeof data5 !== "string" && data5 !== null) {
                    validate165.errors = [{ instancePath: instancePath + "/channel_name", schemaPath: "#/properties/channel_name/type", keyword: "type", params: { type: schema43.properties.channel_name.type }, message: "must be string,null" }];
                    return false;
                  }
                  var valid7 = _errs24 === errors;
                } else {
                  var valid7 = true;
                }
                if (valid7) {
                  if (data.channel_handle !== void 0) {
                    let data6 = data.channel_handle;
                    const _errs26 = errors;
                    if (typeof data6 !== "string" && data6 !== null) {
                      validate165.errors = [{ instancePath: instancePath + "/channel_handle", schemaPath: "#/properties/channel_handle/type", keyword: "type", params: { type: schema43.properties.channel_handle.type }, message: "must be string,null" }];
                      return false;
                    }
                    var valid7 = _errs26 === errors;
                  } else {
                    var valid7 = true;
                  }
                  if (valid7) {
                    if (data.duration_seconds !== void 0) {
                      let data7 = data.duration_seconds;
                      const _errs28 = errors;
                      if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7))) && data7 !== null) {
                        validate165.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/type", keyword: "type", params: { type: schema43.properties.duration_seconds.type }, message: "must be integer,null" }];
                        return false;
                      }
                      if (errors === _errs28) {
                        if (typeof data7 == "number") {
                          if (data7 > 2147483647 || isNaN(data7)) {
                            validate165.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2147483647 }, message: "must be <= 2147483647" }];
                            return false;
                          } else {
                            if (data7 < 0 || isNaN(data7)) {
                              validate165.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                              return false;
                            }
                          }
                        }
                      }
                      var valid7 = _errs28 === errors;
                    } else {
                      var valid7 = true;
                    }
                    if (valid7) {
                      if (data.hashtags !== void 0) {
                        let data8 = data.hashtags;
                        const _errs30 = errors;
                        if (!Array.isArray(data8) && data8 !== null) {
                          validate165.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/type", keyword: "type", params: { type: schema43.properties.hashtags.type }, message: "must be array,null" }];
                          return false;
                        }
                        if (errors === _errs30) {
                          if (Array.isArray(data8)) {
                            if (data8.length > 30) {
                              validate165.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" }];
                              return false;
                            } else {
                              var valid8 = true;
                              const len0 = data8.length;
                              for (let i0 = 0; i0 < len0; i0++) {
                                const _errs32 = errors;
                                if (typeof data8[i0] !== "string") {
                                  validate165.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                                var valid8 = _errs32 === errors;
                                if (!valid8) {
                                  break;
                                }
                              }
                            }
                          }
                        }
                        var valid7 = _errs30 === errors;
                      } else {
                        var valid7 = true;
                      }
                      if (valid7) {
                        if (data.hashtags_observation_status !== void 0) {
                          let data10 = data.hashtags_observation_status;
                          const _errs34 = errors;
                          if (typeof data10 !== "string" && data10 !== null) {
                            validate165.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/type", keyword: "type", params: { type: schema43.properties.hashtags_observation_status.type }, message: "must be string,null" }];
                            return false;
                          }
                          if (!(data10 === "unknown" || data10 === "partial" || data10 === "complete" || data10 === null)) {
                            validate165.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/enum", keyword: "enum", params: { allowedValues: schema43.properties.hashtags_observation_status.enum }, message: "must be equal to one of the allowed values" }];
                            return false;
                          }
                          var valid7 = _errs34 === errors;
                        } else {
                          var valid7 = true;
                        }
                        if (valid7) {
                          if (data.expected_revision !== void 0) {
                            let data11 = data.expected_revision;
                            const _errs36 = errors;
                            if (!(typeof data11 == "number" && (!(data11 % 1) && !isNaN(data11)))) {
                              validate165.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                              return false;
                            }
                            if (errors === _errs36) {
                              if (typeof data11 == "number") {
                                if (data11 < 0 || isNaN(data11)) {
                                  validate165.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                  return false;
                                } else {
                                  if (!formats8.validate(data11)) {
                                    validate165.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                                    return false;
                                  }
                                }
                              }
                            }
                            var valid7 = _errs36 === errors;
                          } else {
                            var valid7 = true;
                          }
                          if (valid7) {
                            if (data.rating !== void 0) {
                              let data12 = data.rating;
                              const _errs38 = errors;
                              if (!(typeof data12 == "number" && (!(data12 % 1) && !isNaN(data12))) && data12 !== null) {
                                validate165.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema43.properties.rating.type }, message: "must be integer,null" }];
                                return false;
                              }
                              if (errors === _errs38) {
                                if (typeof data12 == "number") {
                                  if (data12 > 10 || isNaN(data12)) {
                                    validate165.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                                    return false;
                                  } else {
                                    if (data12 < 1 || isNaN(data12)) {
                                      validate165.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                      return false;
                                    }
                                  }
                                }
                              }
                              var valid7 = _errs38 === errors;
                            } else {
                              var valid7 = true;
                            }
                            if (valid7) {
                              if (data.later !== void 0) {
                                const _errs40 = errors;
                                if (typeof data.later !== "boolean") {
                                  validate165.errors = [{ instancePath: instancePath + "/later", schemaPath: "#/properties/later/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                  return false;
                                }
                                var valid7 = _errs40 === errors;
                              } else {
                                var valid7 = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate165.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate165.errors = vErrors;
  return errors === 0;
}
validate165.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var addObservedVideo_parameter_0 = validate166;
function validate166(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate166.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (errors === 0) {
      if (typeof data === "string") {
        if (!formats4.test(data)) {
          validate166.errors = [{ instancePath, schemaPath: "#/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
          return false;
        }
      } else {
        validate166.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
        return false;
      }
    }
  }
  validate166.errors = vErrors;
  return errors === 0;
}
validate166.evaluated = { "dynamicProps": false, "dynamicItems": false };
var addObservedVideo_parameter_1 = validate167;
function validate167(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate167.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (typeof data === "string") {
      if (func1(data) < 1) {
        validate167.errors = [{ instancePath, schemaPath: "#/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
        return false;
      }
    } else {
      validate167.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
      return false;
    }
  }
  validate167.errors = vErrors;
  return errors === 0;
}
validate167.evaluated = { "dynamicProps": false, "dynamicItems": false };
var getVideoState_response_200 = validate168;
function validate168(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate168.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.target_id === void 0 && (missing0 = "target_id") || data.state === void 0 && (missing0 = "state") || data.change_seq === void 0 && (missing0 = "change_seq")) {
        validate168.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "target_id" || key0 === "state" || key0 === "change_seq")) {
            validate168.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            const _errs2 = errors;
            if ("video_state" !== data.kind) {
              validate168.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "video_state" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.target_id !== void 0) {
              let data1 = data.target_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate168.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate168.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.state !== void 0) {
                const _errs5 = errors;
                if (!validate95(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.change_seq !== void 0) {
                  let data3 = data.change_seq;
                  const _errs6 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate168.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/type", keyword: "type", params: { type: schema45.properties.change_seq.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs6) {
                    if (typeof data3 == "number") {
                      if (data3 < 1 || isNaN(data3)) {
                        validate168.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                        return false;
                      } else {
                        if (!formats8.validate(data3)) {
                          validate168.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate168.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate168.errors = vErrors;
  return errors === 0;
}
validate168.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoState_response_403 = validate170;
function validate170(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate170.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate170.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate170.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate170.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate170.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate170.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate170.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate170.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate170.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate170.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate170.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate170.errors = vErrors;
  return errors === 0;
}
validate170.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoState_response_default = validate171;
function validate171(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate171.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate171.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate171.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate171.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate171.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate171.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate171.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate171.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate171.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate171.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate171.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate171.errors = vErrors;
  return errors === 0;
}
validate171.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoState_parameter_0 = validate172;
function validate172(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate172.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (errors === 0) {
      if (typeof data === "string") {
        if (!formats4.test(data)) {
          validate172.errors = [{ instancePath, schemaPath: "#/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
          return false;
        }
      } else {
        validate172.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
        return false;
      }
    }
  }
  validate172.errors = vErrors;
  return errors === 0;
}
validate172.evaluated = { "dynamicProps": false, "dynamicItems": false };
var patchVideoState_response_200 = validate173;
function validate173(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate173.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.target_id === void 0 && (missing0 = "target_id") || data.state === void 0 && (missing0 = "state") || data.change_seq === void 0 && (missing0 = "change_seq")) {
        validate173.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "target_id" || key0 === "state" || key0 === "change_seq")) {
            validate173.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            const _errs2 = errors;
            if ("video_state" !== data.kind) {
              validate173.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "video_state" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.target_id !== void 0) {
              let data1 = data.target_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate173.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate173.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.state !== void 0) {
                const _errs5 = errors;
                if (!validate95(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.change_seq !== void 0) {
                  let data3 = data.change_seq;
                  const _errs6 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate173.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/type", keyword: "type", params: { type: schema45.properties.change_seq.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs6) {
                    if (typeof data3 == "number") {
                      if (data3 < 1 || isNaN(data3)) {
                        validate173.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                        return false;
                      } else {
                        if (!formats8.validate(data3)) {
                          validate173.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate173.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate173.errors = vErrors;
  return errors === 0;
}
validate173.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var patchVideoState_response_403 = validate175;
function validate175(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate175.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate175.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate175.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate175.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate175.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate175.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate175.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate175.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate175.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate175.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate175.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate175.errors = vErrors;
  return errors === 0;
}
validate175.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var patchVideoState_response_default = validate176;
function validate176(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate176.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate176.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate176.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate176.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate176.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate176.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate176.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate176.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate176.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate176.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate176.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate176.errors = vErrors;
  return errors === 0;
}
validate176.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var patchVideoState_request = validate177;
function validate177(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate177.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs1 = errors;
  let valid0 = false;
  const _errs2 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.rating === void 0 && (missing0 = "rating")) {
      const err0 = { instancePath, schemaPath: "#/anyOf/0/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  const _errs3 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing1;
    if (data.added === void 0 && (missing1 = "added")) {
      const err1 = { instancePath, schemaPath: "#/anyOf/1/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  const _errs4 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing2;
    if (data.later === void 0 && (missing2 = "later")) {
      const err2 = { instancePath, schemaPath: "#/anyOf/2/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (!valid0) {
    const err3 = { instancePath, schemaPath: "#/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
    validate177.errors = vErrors;
    return false;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing3;
      if (data.expected_revision === void 0 && (missing3 = "expected_revision")) {
        validate177.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" }];
        return false;
      } else {
        const _errs5 = errors;
        for (const key0 in data) {
          if (!(key0 === "expected_revision" || key0 === "rating" || key0 === "added" || key0 === "later")) {
            validate177.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs5 === errors) {
          if (data.expected_revision !== void 0) {
            let data0 = data.expected_revision;
            const _errs6 = errors;
            if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)))) {
              validate177.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs6) {
              if (typeof data0 == "number") {
                if (data0 < 0 || isNaN(data0)) {
                  validate177.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                } else {
                  if (!formats8.validate(data0)) {
                    validate177.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                    return false;
                  }
                }
              }
            }
            var valid1 = _errs6 === errors;
          } else {
            var valid1 = true;
          }
          if (valid1) {
            if (data.rating !== void 0) {
              let data1 = data.rating;
              const _errs8 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1))) && data1 !== null) {
                validate177.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema55.properties.rating.type }, message: "must be integer,null" }];
                return false;
              }
              if (errors === _errs8) {
                if (typeof data1 == "number") {
                  if (data1 > 10 || isNaN(data1)) {
                    validate177.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                    return false;
                  } else {
                    if (data1 < 1 || isNaN(data1)) {
                      validate177.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                      return false;
                    }
                  }
                }
              }
              var valid1 = _errs8 === errors;
            } else {
              var valid1 = true;
            }
            if (valid1) {
              if (data.added !== void 0) {
                const _errs10 = errors;
                if (typeof data.added !== "boolean") {
                  validate177.errors = [{ instancePath: instancePath + "/added", schemaPath: "#/properties/added/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                  return false;
                }
                var valid1 = _errs10 === errors;
              } else {
                var valid1 = true;
              }
              if (valid1) {
                if (data.later !== void 0) {
                  const _errs12 = errors;
                  if (typeof data.later !== "boolean") {
                    validate177.errors = [{ instancePath: instancePath + "/later", schemaPath: "#/properties/later/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                    return false;
                  }
                  var valid1 = _errs12 === errors;
                } else {
                  var valid1 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate177.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate177.errors = vErrors;
  return errors === 0;
}
validate177.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var patchVideoState_parameter_0 = validate178;
function validate178(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate178.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (errors === 0) {
      if (typeof data === "string") {
        if (!formats4.test(data)) {
          validate178.errors = [{ instancePath, schemaPath: "#/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
          return false;
        }
      } else {
        validate178.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
        return false;
      }
    }
  }
  validate178.errors = vErrors;
  return errors === 0;
}
validate178.evaluated = { "dynamicProps": false, "dynamicItems": false };
var getChannelRating_response_200 = validate179;
function validate179(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate179.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.target_id === void 0 && (missing0 = "target_id") || data.state === void 0 && (missing0 = "state") || data.change_seq === void 0 && (missing0 = "change_seq")) {
        validate179.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "target_id" || key0 === "state" || key0 === "change_seq")) {
            validate179.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            const _errs2 = errors;
            if ("channel_state" !== data.kind) {
              validate179.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "channel_state" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.target_id !== void 0) {
              let data1 = data.target_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate179.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate179.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.state !== void 0) {
                const _errs5 = errors;
                if (!validate71(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.change_seq !== void 0) {
                  let data3 = data.change_seq;
                  const _errs6 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate179.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/type", keyword: "type", params: { type: schema30.properties.change_seq.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs6) {
                    if (typeof data3 == "number") {
                      if (data3 < 1 || isNaN(data3)) {
                        validate179.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                        return false;
                      } else {
                        if (!formats8.validate(data3)) {
                          validate179.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate179.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate179.errors = vErrors;
  return errors === 0;
}
validate179.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getChannelRating_response_403 = validate181;
function validate181(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate181.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate181.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate181.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate181.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate181.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate181.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate181.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate181.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate181.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate181.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate181.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate181.errors = vErrors;
  return errors === 0;
}
validate181.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getChannelRating_response_default = validate182;
function validate182(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate182.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate182.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate182.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate182.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate182.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate182.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate182.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate182.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate182.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate182.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate182.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate182.errors = vErrors;
  return errors === 0;
}
validate182.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getChannelRating_parameter_0 = validate183;
function validate183(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate183.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (errors === 0) {
      if (typeof data === "string") {
        if (!formats4.test(data)) {
          validate183.errors = [{ instancePath, schemaPath: "#/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
          return false;
        }
      } else {
        validate183.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
        return false;
      }
    }
  }
  validate183.errors = vErrors;
  return errors === 0;
}
validate183.evaluated = { "dynamicProps": false, "dynamicItems": false };
var putChannelRating_response_200 = validate184;
function validate184(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate184.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.target_id === void 0 && (missing0 = "target_id") || data.state === void 0 && (missing0 = "state") || data.change_seq === void 0 && (missing0 = "change_seq")) {
        validate184.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "target_id" || key0 === "state" || key0 === "change_seq")) {
            validate184.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            const _errs2 = errors;
            if ("channel_state" !== data.kind) {
              validate184.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "channel_state" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.target_id !== void 0) {
              let data1 = data.target_id;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (errors === _errs3) {
                  if (typeof data1 === "string") {
                    if (!formats4.test(data1)) {
                      validate184.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                      return false;
                    }
                  } else {
                    validate184.errors = [{ instancePath: instancePath + "/target_id", schemaPath: "#/properties/target_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.state !== void 0) {
                const _errs5 = errors;
                if (!validate71(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.change_seq !== void 0) {
                  let data3 = data.change_seq;
                  const _errs6 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate184.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/type", keyword: "type", params: { type: schema30.properties.change_seq.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs6) {
                    if (typeof data3 == "number") {
                      if (data3 < 1 || isNaN(data3)) {
                        validate184.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                        return false;
                      } else {
                        if (!formats8.validate(data3)) {
                          validate184.errors = [{ instancePath: instancePath + "/change_seq", schemaPath: "#/properties/change_seq/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate184.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate184.errors = vErrors;
  return errors === 0;
}
validate184.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var putChannelRating_response_403 = validate186;
function validate186(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate186.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate186.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate186.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate186.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate186.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate186.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate186.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate186.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate186.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate186.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate186.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate186.errors = vErrors;
  return errors === 0;
}
validate186.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var putChannelRating_response_default = validate187;
function validate187(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate187.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate187.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate187.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate187.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate187.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate187.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate187.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate187.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate187.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate187.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate187.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate187.errors = vErrors;
  return errors === 0;
}
validate187.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var putChannelRating_request = validate188;
function validate188(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate188.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.expected_revision === void 0 && (missing0 = "expected_revision") || data.rating === void 0 && (missing0 = "rating")) {
        validate188.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "expected_revision" || key0 === "rating")) {
            validate188.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.expected_revision !== void 0) {
            let data0 = data.expected_revision;
            const _errs2 = errors;
            if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)))) {
              validate188.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (errors === _errs2) {
              if (typeof data0 == "number") {
                if (data0 < 0 || isNaN(data0)) {
                  validate188.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                  return false;
                } else {
                  if (!formats8.validate(data0)) {
                    validate188.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/format", keyword: "format", params: { format: "int64" }, message: 'must match format "int64"' }];
                    return false;
                  }
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.rating !== void 0) {
              let data1 = data.rating;
              const _errs4 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1))) && data1 !== null) {
                validate188.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/type", keyword: "type", params: { type: schema28.properties.rating.type }, message: "must be integer,null" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data1 == "number") {
                  if (data1 > 10 || isNaN(data1)) {
                    validate188.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/maximum", keyword: "maximum", params: { comparison: "<=", limit: 10 }, message: "must be <= 10" }];
                    return false;
                  } else {
                    if (data1 < 1 || isNaN(data1)) {
                      validate188.errors = [{ instancePath: instancePath + "/rating", schemaPath: "#/properties/rating/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                      return false;
                    }
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate188.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate188.errors = vErrors;
  return errors === 0;
}
validate188.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var putChannelRating_parameter_0 = validate189;
function validate189(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate189.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (errors === 0) {
      if (typeof data === "string") {
        if (!formats4.test(data)) {
          validate189.errors = [{ instancePath, schemaPath: "#/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
          return false;
        }
      } else {
        validate189.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
        return false;
      }
    }
  }
  validate189.errors = vErrors;
  return errors === 0;
}
validate189.evaluated = { "dynamicProps": false, "dynamicItems": false };
var getVideoCard_response_200 = validate190;
function validate190(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate190.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.youtube_video_id === void 0 && (missing0 = "youtube_video_id") || data.title === void 0 && (missing0 = "title") || data.duration_seconds === void 0 && (missing0 = "duration_seconds") || data.availability === void 0 && (missing0 = "availability") || data.url === void 0 && (missing0 = "url") || data.preview_url === void 0 && (missing0 = "preview_url") || data.hashtags === void 0 && (missing0 = "hashtags") || data.hashtags_observation_status === void 0 && (missing0 = "hashtags_observation_status") || data.channel === void 0 && (missing0 = "channel") || data.rating === void 0 && (missing0 = "rating")) {
        validate190.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func36.call(schema54.properties, key0)) {
            validate190.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data0 = data.id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (errors === _errs2) {
                if (typeof data0 === "string") {
                  if (!formats4.test(data0)) {
                    validate190.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                    return false;
                  }
                } else {
                  validate190.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.youtube_video_id !== void 0) {
              let data1 = data.youtube_video_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 11) {
                    validate190.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/maxLength", keyword: "maxLength", params: { limit: 11 }, message: "must NOT have more than 11 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 11) {
                      validate190.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/minLength", keyword: "minLength", params: { limit: 11 }, message: "must NOT have fewer than 11 characters" }];
                      return false;
                    } else {
                      if (!pattern15.test(data1)) {
                        validate190.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^[A-Za-z0-9_-]{11}$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate190.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.title !== void 0) {
                let data2 = data.title;
                const _errs6 = errors;
                if (typeof data2 !== "string" && data2 !== null) {
                  validate190.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: schema54.properties.title.type }, message: "must be string,null" }];
                  return false;
                }
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 250) {
                      validate190.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/maxLength", keyword: "maxLength", params: { limit: 250 }, message: "must NOT have more than 250 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 1) {
                        validate190.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    }
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.duration_seconds !== void 0) {
                  let data3 = data.duration_seconds;
                  const _errs8 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate190.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/type", keyword: "type", params: { type: schema54.properties.duration_seconds.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs8) {
                    if (typeof data3 == "number") {
                      if (data3 > 2147483647 || isNaN(data3)) {
                        validate190.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2147483647 }, message: "must be <= 2147483647" }];
                        return false;
                      } else {
                        if (data3 < 0 || isNaN(data3)) {
                          validate190.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.availability !== void 0) {
                    let data4 = data.availability;
                    const _errs10 = errors;
                    if (typeof data4 !== "string") {
                      validate190.errors = [{ instancePath: instancePath + "/availability", schemaPath: "#/properties/availability/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    if (!(data4 === "unknown" || data4 === "available" || data4 === "unavailable")) {
                      validate190.errors = [{ instancePath: instancePath + "/availability", schemaPath: "#/properties/availability/enum", keyword: "enum", params: { allowedValues: schema54.properties.availability.enum }, message: "must be equal to one of the allowed values" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.url !== void 0) {
                      let data5 = data.url;
                      const _errs12 = errors;
                      if (errors === _errs12) {
                        if (errors === _errs12) {
                          if (typeof data5 === "string") {
                            if (!pattern23.test(data5)) {
                              validate190.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/pattern", keyword: "pattern", params: { pattern: "^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$"' }];
                              return false;
                            } else {
                              if (!formats0(data5)) {
                                validate190.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/format", keyword: "format", params: { format: "uri" }, message: 'must match format "uri"' }];
                                return false;
                              }
                            }
                          } else {
                            validate190.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.preview_url !== void 0) {
                        let data6 = data.preview_url;
                        const _errs14 = errors;
                        if (errors === _errs14) {
                          if (errors === _errs14) {
                            if (typeof data6 === "string") {
                              if (!pattern24.test(data6)) {
                                validate190.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/pattern", keyword: "pattern", params: { pattern: "^https://i\\.ytimg\\.com/vi/[A-Za-z0-9_-]{11}/hqdefault\\.jpg$" }, message: 'must match pattern "^https://i\\.ytimg\\.com/vi/[A-Za-z0-9_-]{11}/hqdefault\\.jpg$"' }];
                                return false;
                              } else {
                                if (!formats0(data6)) {
                                  validate190.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/format", keyword: "format", params: { format: "uri" }, message: 'must match format "uri"' }];
                                  return false;
                                }
                              }
                            } else {
                              validate190.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                        }
                        var valid0 = _errs14 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.hashtags !== void 0) {
                          let data7 = data.hashtags;
                          const _errs16 = errors;
                          if (errors === _errs16) {
                            if (Array.isArray(data7)) {
                              if (data7.length > 100) {
                                validate190.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" }];
                                return false;
                              } else {
                                var valid1 = true;
                                const len0 = data7.length;
                                for (let i0 = 0; i0 < len0; i0++) {
                                  let data8 = data7[i0];
                                  const _errs18 = errors;
                                  if (errors === _errs18) {
                                    if (typeof data8 === "string") {
                                      if (func1(data8) > 100) {
                                        validate190.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/maxLength", keyword: "maxLength", params: { limit: 100 }, message: "must NOT have more than 100 characters" }];
                                        return false;
                                      } else {
                                        if (func1(data8) < 1) {
                                          validate190.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                          return false;
                                        } else {
                                          if (!pattern25.test(data8)) {
                                            validate190.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/pattern", keyword: "pattern", params: { pattern: "^[^#]" }, message: 'must match pattern "^[^#]"' }];
                                            return false;
                                          }
                                        }
                                      }
                                    } else {
                                      validate190.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                  }
                                  var valid1 = _errs18 === errors;
                                  if (!valid1) {
                                    break;
                                  }
                                }
                                if (valid1) {
                                  let i1 = data7.length;
                                  let j0;
                                  if (i1 > 1) {
                                    const indices0 = {};
                                    for (; i1--; ) {
                                      let item0 = data7[i1];
                                      if (typeof item0 !== "string") {
                                        continue;
                                      }
                                      if (typeof indices0[item0] == "number") {
                                        j0 = indices0[item0];
                                        validate190.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/uniqueItems", keyword: "uniqueItems", params: { i: i1, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i1 + " are identical)" }];
                                        return false;
                                        break;
                                      }
                                      indices0[item0] = i1;
                                    }
                                  }
                                }
                              }
                            } else {
                              validate190.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                              return false;
                            }
                          }
                          var valid0 = _errs16 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.hashtags_observation_status !== void 0) {
                            let data9 = data.hashtags_observation_status;
                            const _errs20 = errors;
                            if (typeof data9 !== "string") {
                              validate190.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            if (!(data9 === "unknown" || data9 === "partial" || data9 === "complete")) {
                              validate190.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/enum", keyword: "enum", params: { allowedValues: schema54.properties.hashtags_observation_status.enum }, message: "must be equal to one of the allowed values" }];
                              return false;
                            }
                            var valid0 = _errs20 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.channel !== void 0) {
                              let data10 = data.channel;
                              const _errs22 = errors;
                              const _errs23 = errors;
                              let valid3 = false;
                              const _errs24 = errors;
                              if (!validate69(data10, { instancePath: instancePath + "/channel", parentData: data, parentDataProperty: "channel", rootData, dynamicAnchors })) {
                                vErrors = vErrors === null ? validate69.errors : vErrors.concat(validate69.errors);
                                errors = vErrors.length;
                              }
                              var _valid0 = _errs24 === errors;
                              valid3 = valid3 || _valid0;
                              const _errs25 = errors;
                              if (data10 !== null) {
                                const err0 = { instancePath: instancePath + "/channel", schemaPath: "#/properties/channel/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                if (vErrors === null) {
                                  vErrors = [err0];
                                } else {
                                  vErrors.push(err0);
                                }
                                errors++;
                              }
                              var _valid0 = _errs25 === errors;
                              valid3 = valid3 || _valid0;
                              if (!valid3) {
                                const err1 = { instancePath: instancePath + "/channel", schemaPath: "#/properties/channel/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                if (vErrors === null) {
                                  vErrors = [err1];
                                } else {
                                  vErrors.push(err1);
                                }
                                errors++;
                                validate190.errors = vErrors;
                                return false;
                              } else {
                                errors = _errs23;
                                if (vErrors !== null) {
                                  if (_errs23) {
                                    vErrors.length = _errs23;
                                  } else {
                                    vErrors = null;
                                  }
                                }
                              }
                              var valid0 = _errs22 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.rating !== void 0) {
                                const _errs27 = errors;
                                if (!validate99(data.rating, { instancePath: instancePath + "/rating", parentData: data, parentDataProperty: "rating", rootData, dynamicAnchors })) {
                                  vErrors = vErrors === null ? validate99.errors : vErrors.concat(validate99.errors);
                                  errors = vErrors.length;
                                }
                                var valid0 = _errs27 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data.my_state !== void 0) {
                                  const _errs28 = errors;
                                  if (!validate95(data.my_state, { instancePath: instancePath + "/my_state", parentData: data, parentDataProperty: "my_state", rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
                                    errors = vErrors.length;
                                  }
                                  var valid0 = _errs28 === errors;
                                } else {
                                  var valid0 = true;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate190.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate190.errors = vErrors;
  return errors === 0;
}
validate190.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoCard_response_403 = validate194;
function validate194(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate194.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate194.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate194.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate194.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate194.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate194.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate194.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate194.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate194.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate194.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate194.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate194.errors = vErrors;
  return errors === 0;
}
validate194.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoCard_response_default = validate195;
function validate195(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate195.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate195.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate195.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate195.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate195.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate195.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate195.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate195.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate195.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate195.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate195.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate195.errors = vErrors;
  return errors === 0;
}
validate195.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoCard_parameter_0 = validate196;
function validate196(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate196.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (errors === 0) {
      if (typeof data === "string") {
        if (!formats4.test(data)) {
          validate196.errors = [{ instancePath, schemaPath: "#/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
          return false;
        }
      } else {
        validate196.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
        return false;
      }
    }
  }
  validate196.errors = vErrors;
  return errors === 0;
}
validate196.evaluated = { "dynamicProps": false, "dynamicItems": false };
var getVideoCardByYoutube_response_200 = validate197;
function validate197(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate197.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.id === void 0 && (missing0 = "id") || data.youtube_video_id === void 0 && (missing0 = "youtube_video_id") || data.title === void 0 && (missing0 = "title") || data.duration_seconds === void 0 && (missing0 = "duration_seconds") || data.availability === void 0 && (missing0 = "availability") || data.url === void 0 && (missing0 = "url") || data.preview_url === void 0 && (missing0 = "preview_url") || data.hashtags === void 0 && (missing0 = "hashtags") || data.hashtags_observation_status === void 0 && (missing0 = "hashtags_observation_status") || data.channel === void 0 && (missing0 = "channel") || data.rating === void 0 && (missing0 = "rating")) {
        validate197.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func36.call(schema54.properties, key0)) {
            validate197.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.id !== void 0) {
            let data0 = data.id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (errors === _errs2) {
                if (typeof data0 === "string") {
                  if (!formats4.test(data0)) {
                    validate197.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                    return false;
                  }
                } else {
                  validate197.errors = [{ instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.youtube_video_id !== void 0) {
              let data1 = data.youtube_video_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 11) {
                    validate197.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/maxLength", keyword: "maxLength", params: { limit: 11 }, message: "must NOT have more than 11 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 11) {
                      validate197.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/minLength", keyword: "minLength", params: { limit: 11 }, message: "must NOT have fewer than 11 characters" }];
                      return false;
                    } else {
                      if (!pattern15.test(data1)) {
                        validate197.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^[A-Za-z0-9_-]{11}$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate197.errors = [{ instancePath: instancePath + "/youtube_video_id", schemaPath: "#/properties/youtube_video_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.title !== void 0) {
                let data2 = data.title;
                const _errs6 = errors;
                if (typeof data2 !== "string" && data2 !== null) {
                  validate197.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: schema54.properties.title.type }, message: "must be string,null" }];
                  return false;
                }
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 250) {
                      validate197.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/maxLength", keyword: "maxLength", params: { limit: 250 }, message: "must NOT have more than 250 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 1) {
                        validate197.errors = [{ instancePath: instancePath + "/title", schemaPath: "#/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    }
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.duration_seconds !== void 0) {
                  let data3 = data.duration_seconds;
                  const _errs8 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3))) && data3 !== null) {
                    validate197.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/type", keyword: "type", params: { type: schema54.properties.duration_seconds.type }, message: "must be integer,null" }];
                    return false;
                  }
                  if (errors === _errs8) {
                    if (typeof data3 == "number") {
                      if (data3 > 2147483647 || isNaN(data3)) {
                        validate197.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2147483647 }, message: "must be <= 2147483647" }];
                        return false;
                      } else {
                        if (data3 < 0 || isNaN(data3)) {
                          validate197.errors = [{ instancePath: instancePath + "/duration_seconds", schemaPath: "#/properties/duration_seconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                          return false;
                        }
                      }
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.availability !== void 0) {
                    let data4 = data.availability;
                    const _errs10 = errors;
                    if (typeof data4 !== "string") {
                      validate197.errors = [{ instancePath: instancePath + "/availability", schemaPath: "#/properties/availability/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    if (!(data4 === "unknown" || data4 === "available" || data4 === "unavailable")) {
                      validate197.errors = [{ instancePath: instancePath + "/availability", schemaPath: "#/properties/availability/enum", keyword: "enum", params: { allowedValues: schema54.properties.availability.enum }, message: "must be equal to one of the allowed values" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.url !== void 0) {
                      let data5 = data.url;
                      const _errs12 = errors;
                      if (errors === _errs12) {
                        if (errors === _errs12) {
                          if (typeof data5 === "string") {
                            if (!pattern23.test(data5)) {
                              validate197.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/pattern", keyword: "pattern", params: { pattern: "^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$"' }];
                              return false;
                            } else {
                              if (!formats0(data5)) {
                                validate197.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/format", keyword: "format", params: { format: "uri" }, message: 'must match format "uri"' }];
                                return false;
                              }
                            }
                          } else {
                            validate197.errors = [{ instancePath: instancePath + "/url", schemaPath: "#/properties/url/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.preview_url !== void 0) {
                        let data6 = data.preview_url;
                        const _errs14 = errors;
                        if (errors === _errs14) {
                          if (errors === _errs14) {
                            if (typeof data6 === "string") {
                              if (!pattern24.test(data6)) {
                                validate197.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/pattern", keyword: "pattern", params: { pattern: "^https://i\\.ytimg\\.com/vi/[A-Za-z0-9_-]{11}/hqdefault\\.jpg$" }, message: 'must match pattern "^https://i\\.ytimg\\.com/vi/[A-Za-z0-9_-]{11}/hqdefault\\.jpg$"' }];
                                return false;
                              } else {
                                if (!formats0(data6)) {
                                  validate197.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/format", keyword: "format", params: { format: "uri" }, message: 'must match format "uri"' }];
                                  return false;
                                }
                              }
                            } else {
                              validate197.errors = [{ instancePath: instancePath + "/preview_url", schemaPath: "#/properties/preview_url/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                        }
                        var valid0 = _errs14 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.hashtags !== void 0) {
                          let data7 = data.hashtags;
                          const _errs16 = errors;
                          if (errors === _errs16) {
                            if (Array.isArray(data7)) {
                              if (data7.length > 100) {
                                validate197.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" }];
                                return false;
                              } else {
                                var valid1 = true;
                                const len0 = data7.length;
                                for (let i0 = 0; i0 < len0; i0++) {
                                  let data8 = data7[i0];
                                  const _errs18 = errors;
                                  if (errors === _errs18) {
                                    if (typeof data8 === "string") {
                                      if (func1(data8) > 100) {
                                        validate197.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/maxLength", keyword: "maxLength", params: { limit: 100 }, message: "must NOT have more than 100 characters" }];
                                        return false;
                                      } else {
                                        if (func1(data8) < 1) {
                                          validate197.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                          return false;
                                        } else {
                                          if (!pattern25.test(data8)) {
                                            validate197.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/pattern", keyword: "pattern", params: { pattern: "^[^#]" }, message: 'must match pattern "^[^#]"' }];
                                            return false;
                                          }
                                        }
                                      }
                                    } else {
                                      validate197.errors = [{ instancePath: instancePath + "/hashtags/" + i0, schemaPath: "#/properties/hashtags/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                  }
                                  var valid1 = _errs18 === errors;
                                  if (!valid1) {
                                    break;
                                  }
                                }
                                if (valid1) {
                                  let i1 = data7.length;
                                  let j0;
                                  if (i1 > 1) {
                                    const indices0 = {};
                                    for (; i1--; ) {
                                      let item0 = data7[i1];
                                      if (typeof item0 !== "string") {
                                        continue;
                                      }
                                      if (typeof indices0[item0] == "number") {
                                        j0 = indices0[item0];
                                        validate197.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/uniqueItems", keyword: "uniqueItems", params: { i: i1, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i1 + " are identical)" }];
                                        return false;
                                        break;
                                      }
                                      indices0[item0] = i1;
                                    }
                                  }
                                }
                              }
                            } else {
                              validate197.errors = [{ instancePath: instancePath + "/hashtags", schemaPath: "#/properties/hashtags/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                              return false;
                            }
                          }
                          var valid0 = _errs16 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.hashtags_observation_status !== void 0) {
                            let data9 = data.hashtags_observation_status;
                            const _errs20 = errors;
                            if (typeof data9 !== "string") {
                              validate197.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            if (!(data9 === "unknown" || data9 === "partial" || data9 === "complete")) {
                              validate197.errors = [{ instancePath: instancePath + "/hashtags_observation_status", schemaPath: "#/properties/hashtags_observation_status/enum", keyword: "enum", params: { allowedValues: schema54.properties.hashtags_observation_status.enum }, message: "must be equal to one of the allowed values" }];
                              return false;
                            }
                            var valid0 = _errs20 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.channel !== void 0) {
                              let data10 = data.channel;
                              const _errs22 = errors;
                              const _errs23 = errors;
                              let valid3 = false;
                              const _errs24 = errors;
                              if (!validate69(data10, { instancePath: instancePath + "/channel", parentData: data, parentDataProperty: "channel", rootData, dynamicAnchors })) {
                                vErrors = vErrors === null ? validate69.errors : vErrors.concat(validate69.errors);
                                errors = vErrors.length;
                              }
                              var _valid0 = _errs24 === errors;
                              valid3 = valid3 || _valid0;
                              const _errs25 = errors;
                              if (data10 !== null) {
                                const err0 = { instancePath: instancePath + "/channel", schemaPath: "#/properties/channel/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                if (vErrors === null) {
                                  vErrors = [err0];
                                } else {
                                  vErrors.push(err0);
                                }
                                errors++;
                              }
                              var _valid0 = _errs25 === errors;
                              valid3 = valid3 || _valid0;
                              if (!valid3) {
                                const err1 = { instancePath: instancePath + "/channel", schemaPath: "#/properties/channel/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                if (vErrors === null) {
                                  vErrors = [err1];
                                } else {
                                  vErrors.push(err1);
                                }
                                errors++;
                                validate197.errors = vErrors;
                                return false;
                              } else {
                                errors = _errs23;
                                if (vErrors !== null) {
                                  if (_errs23) {
                                    vErrors.length = _errs23;
                                  } else {
                                    vErrors = null;
                                  }
                                }
                              }
                              var valid0 = _errs22 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.rating !== void 0) {
                                const _errs27 = errors;
                                if (!validate99(data.rating, { instancePath: instancePath + "/rating", parentData: data, parentDataProperty: "rating", rootData, dynamicAnchors })) {
                                  vErrors = vErrors === null ? validate99.errors : vErrors.concat(validate99.errors);
                                  errors = vErrors.length;
                                }
                                var valid0 = _errs27 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data.my_state !== void 0) {
                                  const _errs28 = errors;
                                  if (!validate95(data.my_state, { instancePath: instancePath + "/my_state", parentData: data, parentDataProperty: "my_state", rootData, dynamicAnchors })) {
                                    vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
                                    errors = vErrors.length;
                                  }
                                  var valid0 = _errs28 === errors;
                                } else {
                                  var valid0 = true;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate197.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate197.errors = vErrors;
  return errors === 0;
}
validate197.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoCardByYoutube_response_403 = validate201;
function validate201(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate201.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate201.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate201.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate201.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate201.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate201.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate201.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate201.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate201.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate201.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate201.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate201.errors = vErrors;
  return errors === 0;
}
validate201.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoCardByYoutube_response_default = validate202;
function validate202(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate202.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate202.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate202.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate202.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate202.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate202.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate202.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate202.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate202.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate202.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate202.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate202.errors = vErrors;
  return errors === 0;
}
validate202.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var getVideoCardByYoutube_parameter_0 = validate203;
function validate203(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate203.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (typeof data === "string") {
      if (func1(data) > 11) {
        validate203.errors = [{ instancePath, schemaPath: "#/maxLength", keyword: "maxLength", params: { limit: 11 }, message: "must NOT have more than 11 characters" }];
        return false;
      } else {
        if (func1(data) < 11) {
          validate203.errors = [{ instancePath, schemaPath: "#/minLength", keyword: "minLength", params: { limit: 11 }, message: "must NOT have fewer than 11 characters" }];
          return false;
        } else {
          if (!pattern15.test(data)) {
            validate203.errors = [{ instancePath, schemaPath: "#/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_-]{11}$" }, message: 'must match pattern "^[A-Za-z0-9_-]{11}$"' }];
            return false;
          }
        }
      }
    } else {
      validate203.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
      return false;
    }
  }
  validate203.errors = vErrors;
  return errors === 0;
}
validate203.evaluated = { "dynamicProps": false, "dynamicItems": false };
var health_response_200 = validate204;
function validate204(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate204.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.status === void 0 && (missing0 = "status")) {
        validate204.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "status")) {
            validate204.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.status !== void 0) {
            if ("ok" !== data.status) {
              validate204.errors = [{ instancePath: instancePath + "/status", schemaPath: "#/properties/status/const", keyword: "const", params: { allowedValue: "ok" }, message: "must be equal to constant" }];
              return false;
            }
          }
        }
      }
    } else {
      validate204.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate204.errors = vErrors;
  return errors === 0;
}
validate204.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var health_response_404 = validate205;
function validate205(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate205.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message")) {
        validate205.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message")) {
            validate205.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            const _errs2 = errors;
            if (typeof data.code !== "string") {
              validate205.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate205.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate205.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate205.errors = vErrors;
  return errors === 0;
}
validate205.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var ready_response_200 = validate206;
function validate206(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate206.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.status === void 0 && (missing0 = "status")) {
        validate206.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "status")) {
            validate206.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.status !== void 0) {
            if ("ready" !== data.status) {
              validate206.errors = [{ instancePath: instancePath + "/status", schemaPath: "#/properties/status/const", keyword: "const", params: { allowedValue: "ready" }, message: "must be equal to constant" }];
              return false;
            }
          }
        }
      }
    } else {
      validate206.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate206.errors = vErrors;
  return errors === 0;
}
validate206.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var ready_response_404 = validate207;
function validate207(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate207.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message")) {
        validate207.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message")) {
            validate207.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            const _errs2 = errors;
            if (typeof data.code !== "string") {
              validate207.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate207.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate207.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate207.errors = vErrors;
  return errors === 0;
}
validate207.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var ready_response_503 = validate208;
function validate208(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate208.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message")) {
        validate208.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message")) {
            validate208.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            const _errs2 = errors;
            if (typeof data.code !== "string") {
              validate208.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate208.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate208.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate208.errors = vErrors;
  return errors === 0;
}
validate208.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var issueBrowserCode_response_200 = validate209;
function validate209(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate209.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.authorization_code === void 0 && (missing0 = "authorization_code") || data.state === void 0 && (missing0 = "state") || data.redirect_uri === void 0 && (missing0 = "redirect_uri") || data.expires_at === void 0 && (missing0 = "expires_at")) {
        validate209.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "authorization_code" || key0 === "state" || key0 === "redirect_uri" || key0 === "expires_at")) {
            validate209.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.authorization_code !== void 0) {
            const _errs2 = errors;
            if (!validate56(data.authorization_code, { instancePath: instancePath + "/authorization_code", parentData: data, parentDataProperty: "authorization_code", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.state !== void 0) {
              const _errs3 = errors;
              if (!validate56(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.redirect_uri !== void 0) {
                const _errs4 = errors;
                if (!validate54(data.redirect_uri, { instancePath: instancePath + "/redirect_uri", parentData: data, parentDataProperty: "redirect_uri", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs4 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.expires_at !== void 0) {
                  let data3 = data.expires_at;
                  const _errs5 = errors;
                  if (errors === _errs5) {
                    if (errors === _errs5) {
                      if (typeof data3 === "string") {
                        if (!formats2.validate(data3)) {
                          validate209.errors = [{ instancePath: instancePath + "/expires_at", schemaPath: "#/properties/expires_at/format", keyword: "format", params: { format: "date-time" }, message: 'must match format "date-time"' }];
                          return false;
                        }
                      } else {
                        validate209.errors = [{ instancePath: instancePath + "/expires_at", schemaPath: "#/properties/expires_at/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                  }
                  var valid0 = _errs5 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate209.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate209.errors = vErrors;
  return errors === 0;
}
validate209.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var issueBrowserCode_response_403 = validate213;
function validate213(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate213.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate213.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate213.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate213.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate213.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate213.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate213.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate213.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate213.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate213.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate213.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate213.errors = vErrors;
  return errors === 0;
}
validate213.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var issueBrowserCode_response_default = validate214;
function validate214(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate214.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate214.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate214.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate214.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate214.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate214.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate214.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate214.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate214.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate214.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate214.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate214.errors = vErrors;
  return errors === 0;
}
validate214.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var issueBrowserCode_request = validate215;
function validate215(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate215.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.redirect_uri === void 0 && (missing0 = "redirect_uri") || data.state === void 0 && (missing0 = "state") || data.code_challenge === void 0 && (missing0 = "code_challenge") || data.code_challenge_method === void 0 && (missing0 = "code_challenge_method")) {
        validate215.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "redirect_uri" || key0 === "state" || key0 === "code_challenge" || key0 === "code_challenge_method")) {
            validate215.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.redirect_uri !== void 0) {
            const _errs2 = errors;
            if (!validate54(data.redirect_uri, { instancePath: instancePath + "/redirect_uri", parentData: data, parentDataProperty: "redirect_uri", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.state !== void 0) {
              const _errs3 = errors;
              if (!validate56(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.code_challenge !== void 0) {
                const _errs4 = errors;
                if (!validate56(data.code_challenge, { instancePath: instancePath + "/code_challenge", parentData: data, parentDataProperty: "code_challenge", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs4 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.code_challenge_method !== void 0) {
                  const _errs5 = errors;
                  if ("S256" !== data.code_challenge_method) {
                    validate215.errors = [{ instancePath: instancePath + "/code_challenge_method", schemaPath: "#/properties/code_challenge_method/const", keyword: "const", params: { allowedValue: "S256" }, message: "must be equal to constant" }];
                    return false;
                  }
                  var valid0 = _errs5 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate215.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate215.errors = vErrors;
  return errors === 0;
}
validate215.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var issueBrowserCode_parameter_0 = validate219;
function validate219(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate219.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate219.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  validate219.errors = vErrors;
  return errors === 0;
}
validate219.evaluated = { "dynamicProps": false, "dynamicItems": false };
var exchangeBrowserCode_response_200 = validate220;
function validate220(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate220.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.user === void 0 && (missing0 = "user") || data.access_token === void 0 && (missing0 = "access_token") || data.session_id === void 0 && (missing0 = "session_id")) {
        validate220.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "user" || key0 === "access_token" || key0 === "session_id")) {
            validate220.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.user !== void 0) {
            const _errs2 = errors;
            if (!validate76(data.user, { instancePath: instancePath + "/user", parentData: data, parentDataProperty: "user", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate76.errors : vErrors.concat(validate76.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.access_token !== void 0) {
              let data1 = data.access_token;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (typeof data1 === "string") {
                  if (func1(data1) < 1) {
                    validate220.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                } else {
                  validate220.errors = [{ instancePath: instancePath + "/access_token", schemaPath: "#/properties/access_token/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.session_id !== void 0) {
                let data2 = data.session_id;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (errors === _errs5) {
                    if (typeof data2 === "string") {
                      if (!formats4.test(data2)) {
                        validate220.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/format", keyword: "format", params: { format: "uuid" }, message: 'must match format "uuid"' }];
                        return false;
                      }
                    } else {
                      validate220.errors = [{ instancePath: instancePath + "/session_id", schemaPath: "#/properties/session_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate220.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate220.errors = vErrors;
  return errors === 0;
}
validate220.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var exchangeBrowserCode_response_403 = validate222;
function validate222(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate222.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate222.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate222.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate222.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate222.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate222.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate222.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate222.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate222.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate222.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate222.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate222.errors = vErrors;
  return errors === 0;
}
validate222.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var exchangeBrowserCode_response_default = validate223;
function validate223(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate223.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.code === void 0 && (missing0 = "code") || data.message === void 0 && (missing0 = "message") || data.field_errors === void 0 && (missing0 = "field_errors") || data.request_id === void 0 && (missing0 = "request_id")) {
        validate223.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "code" || key0 === "message" || key0 === "field_errors" || key0 === "request_id")) {
            validate223.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.code !== void 0) {
            let data0 = data.code;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) < 1) {
                  validate223.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                  return false;
                }
              } else {
                validate223.errors = [{ instancePath: instancePath + "/code", schemaPath: "#/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.message !== void 0) {
              const _errs4 = errors;
              if (typeof data.message !== "string") {
                validate223.errors = [{ instancePath: instancePath + "/message", schemaPath: "#/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_errors !== void 0) {
                let data2 = data.field_errors;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    for (const key1 in data2) {
                      const _errs9 = errors;
                      if (typeof data2[key1] !== "string") {
                        validate223.errors = [{ instancePath: instancePath + "/field_errors/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/field_errors/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      var valid1 = _errs9 === errors;
                      if (!valid1) {
                        break;
                      }
                    }
                  } else {
                    validate223.errors = [{ instancePath: instancePath + "/field_errors", schemaPath: "#/properties/field_errors/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request_id !== void 0) {
                  let data4 = data.request_id;
                  const _errs11 = errors;
                  if (errors === _errs11) {
                    if (typeof data4 === "string") {
                      if (func1(data4) < 1) {
                        validate223.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    } else {
                      validate223.errors = [{ instancePath: instancePath + "/request_id", schemaPath: "#/properties/request_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs11 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate223.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate223.errors = vErrors;
  return errors === 0;
}
validate223.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var exchangeBrowserCode_request = validate224;
function validate224(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate224.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.authorization_code === void 0 && (missing0 = "authorization_code") || data.code_verifier === void 0 && (missing0 = "code_verifier") || data.redirect_uri === void 0 && (missing0 = "redirect_uri") || data.state === void 0 && (missing0 = "state")) {
        validate224.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "authorization_code" || key0 === "code_verifier" || key0 === "redirect_uri" || key0 === "state")) {
            validate224.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.authorization_code !== void 0) {
            const _errs2 = errors;
            if (!validate56(data.authorization_code, { instancePath: instancePath + "/authorization_code", parentData: data, parentDataProperty: "authorization_code", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.code_verifier !== void 0) {
              let data1 = data.code_verifier;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 128) {
                    validate224.errors = [{ instancePath: instancePath + "/code_verifier", schemaPath: "#/properties/code_verifier/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 43) {
                      validate224.errors = [{ instancePath: instancePath + "/code_verifier", schemaPath: "#/properties/code_verifier/minLength", keyword: "minLength", params: { limit: 43 }, message: "must NOT have fewer than 43 characters" }];
                      return false;
                    } else {
                      if (!pattern5.test(data1)) {
                        validate224.errors = [{ instancePath: instancePath + "/code_verifier", schemaPath: "#/properties/code_verifier/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._~-]{43,128}$" }, message: 'must match pattern "^[A-Za-z0-9._~-]{43,128}$"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate224.errors = [{ instancePath: instancePath + "/code_verifier", schemaPath: "#/properties/code_verifier/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.redirect_uri !== void 0) {
                const _errs5 = errors;
                if (!validate54(data.redirect_uri, { instancePath: instancePath + "/redirect_uri", parentData: data, parentDataProperty: "redirect_uri", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs5 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.state !== void 0) {
                  const _errs6 = errors;
                  if (!validate56(data.state, { instancePath: instancePath + "/state", parentData: data, parentDataProperty: "state", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
                    errors = vErrors.length;
                  }
                  var valid0 = _errs6 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate224.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate224.errors = vErrors;
  return errors === 0;
}
validate224.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var exchangeBrowserCode_parameter_0 = validate228;
function validate228(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate228.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (typeof data !== "string") {
    validate228.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
    return false;
  }
  validate228.errors = vErrors;
  return errors === 0;
}
validate228.evaluated = { "dynamicProps": false, "dynamicItems": false };
export {
  addObservedVideo_parameter_0,
  addObservedVideo_parameter_1,
  addObservedVideo_request,
  addObservedVideo_response_200,
  addObservedVideo_response_403,
  addObservedVideo_response_default,
  changePassword_request,
  changePassword_response_403,
  changePassword_response_default,
  exchangeBrowserCode_parameter_0,
  exchangeBrowserCode_request,
  exchangeBrowserCode_response_200,
  exchangeBrowserCode_response_403,
  exchangeBrowserCode_response_default,
  getChannelRating_parameter_0,
  getChannelRating_response_200,
  getChannelRating_response_403,
  getChannelRating_response_default,
  getMe_response_200,
  getMe_response_403,
  getMe_response_default,
  getVideoCardByYoutube_parameter_0,
  getVideoCardByYoutube_response_200,
  getVideoCardByYoutube_response_403,
  getVideoCardByYoutube_response_default,
  getVideoCard_parameter_0,
  getVideoCard_response_200,
  getVideoCard_response_403,
  getVideoCard_response_default,
  getVideoState_parameter_0,
  getVideoState_response_200,
  getVideoState_response_403,
  getVideoState_response_default,
  health_response_200,
  health_response_404,
  issueBrowserCode_parameter_0,
  issueBrowserCode_request,
  issueBrowserCode_response_200,
  issueBrowserCode_response_403,
  issueBrowserCode_response_default,
  issueOfflineLease_response_200,
  issueOfflineLease_response_403,
  issueOfflineLease_response_default,
  listSessions_parameter_0,
  listSessions_parameter_1,
  listSessions_response_200,
  listSessions_response_403,
  listSessions_response_default,
  loginAccount_request,
  loginAccount_response_200,
  loginAccount_response_403,
  loginAccount_response_default,
  logoutCurrentSession_response_403,
  logoutCurrentSession_response_default,
  logoutOtherSessions_response_403,
  logoutOtherSessions_response_default,
  patchVideoState_parameter_0,
  patchVideoState_request,
  patchVideoState_response_200,
  patchVideoState_response_403,
  patchVideoState_response_default,
  putChannelRating_parameter_0,
  putChannelRating_request,
  putChannelRating_response_200,
  putChannelRating_response_403,
  putChannelRating_response_default,
  ready_response_200,
  ready_response_404,
  ready_response_503,
  refreshSession_request,
  refreshSession_response_200,
  refreshSession_response_403,
  refreshSession_response_default,
  registerAccount_parameter_0,
  registerAccount_request,
  registerAccount_response_201,
  registerAccount_response_403,
  registerAccount_response_default,
  revokeSession_parameter_0,
  revokeSession_response_403,
  revokeSession_response_default,
  schema_BootstrapError,
  schema_BrowserCallback,
  schema_BrowserCodeExchange,
  schema_BrowserCodeIssue,
  schema_BrowserCodeIssued,
  schema_BrowserNonce,
  schema_CardChannel,
  schema_ChannelRatingWrite,
  schema_ChannelState,
  schema_ChannelStateResult,
  schema_Credentials,
  schema_Device,
  schema_DevicePage,
  schema_Error,
  schema_ExtensionCredentials,
  schema_ExtensionRefresh,
  schema_Healthy,
  schema_Lease,
  schema_Login,
  schema_ObservationAdd,
  schema_ObservationResult,
  schema_PasswordChange,
  schema_Rating,
  schema_Ready,
  schema_Refresh,
  schema_Register,
  schema_User,
  schema_VideoCard,
  schema_VideoPatch,
  schema_VideoState,
  schema_VideoStateResult,
  schema_WebCredentials,
  schema_WebRefresh
};

export const contract = {
  "registerAccount": {
    "method": "POST",
    "path": "/v1/auth/register",
    "request": "registerAccount_request",
    "responses": {
      "201": "registerAccount_response_201",
      "403": "registerAccount_response_403",
      "default": "registerAccount_response_default"
    },
    "auth": "none",
    "parameters": [
      {
        "name": "Origin",
        "in": "header",
        "required": false,
        "validator": "registerAccount_parameter_0"
      }
    ]
  },
  "loginAccount": {
    "method": "POST",
    "path": "/v1/auth/login",
    "request": "loginAccount_request",
    "responses": {
      "200": "loginAccount_response_200",
      "403": "loginAccount_response_403",
      "default": "loginAccount_response_default"
    },
    "auth": "none",
    "parameters": [
      {
        "name": "Origin",
        "in": "header",
        "required": false,
        "validator": "registerAccount_parameter_0"
      }
    ]
  },
  "refreshSession": {
    "method": "POST",
    "path": "/v1/auth/refresh",
    "request": "refreshSession_request",
    "responses": {
      "200": "refreshSession_response_200",
      "403": "refreshSession_response_403",
      "default": "refreshSession_response_default"
    },
    "auth": "none",
    "parameters": [
      {
        "name": "Origin",
        "in": "header",
        "required": false,
        "validator": "registerAccount_parameter_0"
      }
    ]
  },
  "logoutCurrentSession": {
    "method": "POST",
    "path": "/v1/auth/logout",
    "request": null,
    "responses": {
      "204": null,
      "403": "logoutCurrentSession_response_403",
      "default": "logoutCurrentSession_response_default"
    },
    "auth": "required",
    "parameters": []
  },
  "logoutOtherSessions": {
    "method": "POST",
    "path": "/v1/auth/logout-others",
    "request": null,
    "responses": {
      "204": null,
      "403": "logoutOtherSessions_response_403",
      "default": "logoutOtherSessions_response_default"
    },
    "auth": "required",
    "parameters": []
  },
  "listSessions": {
    "method": "GET",
    "path": "/v1/me/sessions",
    "request": null,
    "responses": {
      "200": "listSessions_response_200",
      "403": "listSessions_response_403",
      "default": "listSessions_response_default"
    },
    "auth": "required",
    "parameters": [
      {
        "name": "after",
        "in": "query",
        "required": false,
        "validator": "listSessions_parameter_0"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "validator": "listSessions_parameter_1"
      }
    ]
  },
  "revokeSession": {
    "method": "DELETE",
    "path": "/v1/me/sessions/{id}",
    "request": null,
    "responses": {
      "204": null,
      "403": "revokeSession_response_403",
      "default": "revokeSession_response_default"
    },
    "auth": "required",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "validator": "revokeSession_parameter_0"
      }
    ]
  },
  "getMe": {
    "method": "GET",
    "path": "/v1/me",
    "request": null,
    "responses": {
      "200": "getMe_response_200",
      "403": "getMe_response_403",
      "default": "getMe_response_default"
    },
    "auth": "required",
    "parameters": []
  },
  "issueOfflineLease": {
    "method": "GET",
    "path": "/v1/me/offline-lease",
    "request": null,
    "responses": {
      "200": "issueOfflineLease_response_200",
      "403": "issueOfflineLease_response_403",
      "default": "issueOfflineLease_response_default"
    },
    "auth": "required",
    "parameters": []
  },
  "changePassword": {
    "method": "POST",
    "path": "/v1/me/password",
    "request": "changePassword_request",
    "responses": {
      "204": null,
      "403": "changePassword_response_403",
      "default": "changePassword_response_default"
    },
    "auth": "required",
    "parameters": []
  },
  "addObservedVideo": {
    "method": "POST",
    "path": "/v1/me/videos",
    "request": "addObservedVideo_request",
    "responses": {
      "200": "addObservedVideo_response_200",
      "403": "addObservedVideo_response_403",
      "default": "addObservedVideo_response_default"
    },
    "auth": "required",
    "parameters": [
      {
        "name": "Idempotency-Key",
        "in": "header",
        "required": true,
        "validator": "addObservedVideo_parameter_0"
      },
      {
        "name": "X-Offline-Lease",
        "in": "header",
        "required": false,
        "validator": "addObservedVideo_parameter_1"
      }
    ]
  },
  "getVideoState": {
    "method": "GET",
    "path": "/v1/me/videos/{id}/state",
    "request": null,
    "responses": {
      "200": "getVideoState_response_200",
      "403": "getVideoState_response_403",
      "default": "getVideoState_response_default"
    },
    "auth": "required",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "validator": "getVideoState_parameter_0"
      }
    ]
  },
  "patchVideoState": {
    "method": "PATCH",
    "path": "/v1/me/videos/{id}/state",
    "request": "patchVideoState_request",
    "responses": {
      "200": "patchVideoState_response_200",
      "403": "patchVideoState_response_403",
      "default": "patchVideoState_response_default"
    },
    "auth": "required",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "validator": "patchVideoState_parameter_0"
      },
      {
        "name": "Idempotency-Key",
        "in": "header",
        "required": true,
        "validator": "addObservedVideo_parameter_0"
      },
      {
        "name": "X-Offline-Lease",
        "in": "header",
        "required": false,
        "validator": "addObservedVideo_parameter_1"
      }
    ]
  },
  "getChannelRating": {
    "method": "GET",
    "path": "/v1/me/channels/{id}/rating",
    "request": null,
    "responses": {
      "200": "getChannelRating_response_200",
      "403": "getChannelRating_response_403",
      "default": "getChannelRating_response_default"
    },
    "auth": "required",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "validator": "getChannelRating_parameter_0"
      }
    ]
  },
  "putChannelRating": {
    "method": "PUT",
    "path": "/v1/me/channels/{id}/rating",
    "request": "putChannelRating_request",
    "responses": {
      "200": "putChannelRating_response_200",
      "403": "putChannelRating_response_403",
      "default": "putChannelRating_response_default"
    },
    "auth": "required",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "validator": "putChannelRating_parameter_0"
      },
      {
        "name": "Idempotency-Key",
        "in": "header",
        "required": true,
        "validator": "addObservedVideo_parameter_0"
      },
      {
        "name": "X-Offline-Lease",
        "in": "header",
        "required": false,
        "validator": "addObservedVideo_parameter_1"
      }
    ]
  },
  "getVideoCard": {
    "method": "GET",
    "path": "/v1/videos/{id}",
    "request": null,
    "responses": {
      "200": "getVideoCard_response_200",
      "403": "getVideoCard_response_403",
      "default": "getVideoCard_response_default"
    },
    "auth": "optional",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "validator": "getVideoCard_parameter_0"
      }
    ]
  },
  "getVideoCardByYoutube": {
    "method": "GET",
    "path": "/v1/videos/by-youtube/{youtube_id}",
    "request": null,
    "responses": {
      "200": "getVideoCardByYoutube_response_200",
      "403": "getVideoCardByYoutube_response_403",
      "default": "getVideoCardByYoutube_response_default"
    },
    "auth": "optional",
    "parameters": [
      {
        "name": "youtube_id",
        "in": "path",
        "required": true,
        "validator": "getVideoCardByYoutube_parameter_0"
      }
    ]
  },
  "health": {
    "method": "GET",
    "path": "/healthz",
    "request": null,
    "responses": {
      "200": "health_response_200",
      "404": "health_response_404"
    },
    "auth": "none",
    "parameters": []
  },
  "ready": {
    "method": "GET",
    "path": "/readyz",
    "request": null,
    "responses": {
      "200": "ready_response_200",
      "404": "ready_response_404",
      "503": "ready_response_503"
    },
    "auth": "none",
    "parameters": []
  },
  "issueBrowserCode": {
    "method": "POST",
    "path": "/v1/auth/browser/code",
    "request": "issueBrowserCode_request",
    "responses": {
      "200": "issueBrowserCode_response_200",
      "403": "issueBrowserCode_response_403",
      "default": "issueBrowserCode_response_default"
    },
    "auth": "required",
    "parameters": [
      {
        "name": "Origin",
        "in": "header",
        "required": true,
        "validator": "issueBrowserCode_parameter_0"
      }
    ]
  },
  "exchangeBrowserCode": {
    "method": "POST",
    "path": "/v1/auth/browser/exchange",
    "request": "exchangeBrowserCode_request",
    "responses": {
      "200": "exchangeBrowserCode_response_200",
      "403": "exchangeBrowserCode_response_403",
      "default": "exchangeBrowserCode_response_default"
    },
    "auth": "none",
    "parameters": [
      {
        "name": "Origin",
        "in": "header",
        "required": true,
        "validator": "exchangeBrowserCode_parameter_0"
      }
    ]
  }
};
