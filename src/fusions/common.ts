import { message } from 'ant-design-vue';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  isBibUserTokenValid,
  tokenStorageRef
} from '../utils/user-token-validation';

function $slice(str: string) {
  if (str.length <= 60) return str;
  return `${str.slice(0, 60)}...`;
}
enum HTTP_STATUS {
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
  INTERNAL_ERROR = 500
}

export const axiosInstanceBaseConfig = {
  timeout: 10000, // 10s 后视为请求超时
  headers: {
    post: {
      'Content-Type': 'application/javascript;charset=UTF-8'
    }
  }
};

export const requestInterceptorCallback = (config: AxiosRequestConfig) => {
  if (isBibUserTokenValid()) {
    config.headers.Authorization = `Bearer ${tokenStorageRef.value}`;
  }
  return config;
};
export const requestInterceptorErrCallback = (error: any) => {
  message.error(`错误：${error}`);
  Promise.reject(error);
};

export const responseInterceptorCallback = (response: AxiosResponse<any>) => {
  if (!response.data.isResponseOk) {
    message.error(`请求失败 - ${response.data.message}`);
  }
  return Promise.resolve(response);
};
export const responseInterceptorErrCallback = (error: any) => {
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
      message.error(`500 服务器错误 - ${$slice(error.response?.data.message)}`);
      break;
  }
};
