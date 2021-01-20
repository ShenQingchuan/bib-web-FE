import {
  isBibUserTokenValid,
  tokenStorageRef,
} from "../utils/user-token-validation";
import { message } from "ant-design-vue";
import axios from "axios";

const defaultBaseURL =
  process.env.NODE_ENV === "production"
    ? "https://bibs.techdict.pro"
    : "http://localhost:3000/api";

const fusions = axios.create({
  baseURL: defaultBaseURL,
  timeout: 10000, // 10s 后视为请求超时
  headers: {
    post: {
      "Content-Type": "application/javascript;charset=UTF-8",
    },
  },
});

enum HTTP_STATUS {
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
  INTERNAL_ERROR = 500,
}
function $slice(str: string) {
  if (str.length <= 60) return str;
  return `${str.slice(0, 60)}...`;
}

fusions.interceptors.request.use(
  (config) => {
    if (isBibUserTokenValid()) {
      config.headers.Authorization = `Bearer ${tokenStorageRef.value}`;
    }
    return config;
  },
  (error) => {
    message.error(`错误：${error}`);
    Promise.reject(error);
  }
);

fusions.interceptors.response.use(
  (response) => {
    if (!response.data.isResponseOk) {
      message.error(`请求失败 - ${response.data.message}`);
    }
    return Promise.resolve(response);
  },
  (error) => {
    // 服务器状态码不是200系的的情况
    switch (error.response?.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        message.error(`401 权限不足 - ${$slice(error.response?.data.message)}`);
        break;
      case HTTP_STATUS.NOT_FOUND:
        message.error(
          `404 请求路径不存在 - ${$slice(error.response?.data.message)}`
        );
        break;
      case HTTP_STATUS.INTERNAL_ERROR:
        message.error(
          `500 服务器错误 - ${$slice(error.response?.data.message)}`
        );
        break;
    }
  }
);

export default fusions;
