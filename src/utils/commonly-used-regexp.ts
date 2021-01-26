// （中国大陆）手机号：宽松版本，1 开头的 10 位
export const MOBILE_PHONE_REGEXP = /^\d{11}$/;

// 密码： 最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符
export const PASSWORD_REGEXP = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@\-#$%^&*? ])\S*$/;

// 用户名：
export const USERNAME_REGEXP = /^[a-zA-Z0-9#._-]{4,16}$/;

// 邮箱：
export const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// 验证码：
export const VCODE_REGEXP = /^[0-9]{6}$/;
