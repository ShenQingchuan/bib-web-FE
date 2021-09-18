import { url } from "./base64";

export type BibTokenPayload = {
  exp: number; // 过期时间
  iat: number; // 颁发日期
  iss: string; // jwt 提供者：bib-cloud
  sub: string; // 用户名
  uid: number; // 用户 id
  avatarURL: string; // 用户头像地址
  role: string; // 权限级别
};

export default function decode(token: string) {
  const [, data] = token.split(".");

  const json = decodeURIComponent(
    url
      .decode(data)
      .split("")
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  return JSON.parse(json) as BibTokenPayload;
}
