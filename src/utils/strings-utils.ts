/**
 * 随机字符串
 * @param length 长度
 */
export const random = (length: number = 6) => {
  if (length < 5) length = 5;
  const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let word = "";
  for (let index = 0; index < length; index++) {
    word += str.charAt(Math.floor(Math.random() * str.length));
  }
  return word;
};

/**
 * 驼峰命名转换枚举
 */
export enum CamelCaseType {
  UPPER = "upper",
  LOWER = "lower",
}

/**
 * kebab-case 转换为驼峰命名法
 * @param {string} value 需要转换的字符串
 * @param {CamelCaseType} type 转换类型，upper 大驼峰命名法，lower，小驼峰命名法
 */
export const toCamelCase = (value: string, type: CamelCaseType): string => {
  return value
    .split("-")
    .map((str, index) => {
      if (type === "upper" || (type === "lower" && index > 0)) {
        return str.charAt(0).toUpperCase() + str.substr(1);
      }
      if (type === "lower" && index === 0) {
        return str.charAt(0).toLowerCase() + str.substr(1);
      }
      return str;
    })
    .join("");
};
export const toUpperCamelCase = (value: string) =>
  toCamelCase(value, CamelCaseType.UPPER);
export const toLowerCamelCase = (value: string) =>
  toCamelCase(value, CamelCaseType.LOWER);

/**
 * RGB 颜色转换为16进制颜色代码
 * @param {string} rgb
 */
export const toHex = (rgb: string): string => {
  const hex = (num: string) => {
    const char = parseInt(num, 10)
      .toString(16)
      .toUpperCase();
    return char.length > 1 ? char : "0" + char;
  };

  const reg = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;
  return rgb.replace(reg, ($0, $1, $2, $3) => {
    return "#" + hex($1) + hex($2) + hex($3);
  });
};

/**
 * 字符串对 HTML 危险字符转义
 * @param value 需要编码的字符串
 */
export const escapeForHTML = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

/**
 * 字符串对 HTML 危险字符解转义
 * @param value 需要解转义的字符串
 */
export const unescapeForHTML = (value: string) => {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
};

/**
 * 验证字符串是否是合法的URL
 * @param url 需要验证的字符串
 */
export const isUrl = (url: string) => {
  url = url.toLowerCase(); // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs

  if (url.startsWith("data:text/html")) {
    return false;
  }

  if (!!!url.match(/^\S*$/)) {
    return false;
  }

  if (
    !!["http:", "https:", "data:", "ftp:"].some((protocol) => {
      return url.startsWith(protocol);
    })
  ) {
    return true;
  }

  if (url.startsWith("./") || url.startsWith("/")) {
    return true;
  }

  if (url.indexOf(":") < 0) {
    return true;
  }
  return false;
};
