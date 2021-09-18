import { useStorage } from "@vueuse/core";
import decode, { BibTokenPayload } from "./crypto/token-decode";

const tokenDefaultValue = "__$bT:default";
export const tokenStorageRef = useStorage<string | null>(
  "__$bT",
  tokenDefaultValue
);
export const userDetailsStorageRef = useStorage("__$bib_user_details", {
  avatarURL: "",
  address: "",
  profession: "",
  introduce: ""
});

/** 检查当前 Token 是否可用 */
export function isBibUserTokenValid() {
  if (!tokenStorageRef.value || tokenStorageRef.value === tokenDefaultValue)
    return false;
  const token = decode(tokenStorageRef.value) as BibTokenPayload;
  if (!token || Date.now() > token.exp * 1000) return false;
  return true;
}

export interface UserTokenPayload {
  expiredAt: number;
  userId: number;
  userName: string;
  avatarURL: string;
}

export function usePayloadFromToken(): UserTokenPayload | null {
  if (tokenStorageRef.value && isBibUserTokenValid()) {
    const { exp, uid, sub, avatarURL } = decode(
      tokenStorageRef.value
    ) as BibTokenPayload;
    return {
      expiredAt: exp * 1000,
      userId: uid,
      userName: sub,
      avatarURL
    };
  } else return null;
}
