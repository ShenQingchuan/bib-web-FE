import axios from 'axios';
import {
  axiosInstanceBaseConfig,
  requestInterceptorCallback,
  requestInterceptorErrCallback,
  responseInterceptorCallback,
  responseInterceptorErrCallback
} from './common';
import _ from 'underscore';

const mocker = axios.create(
  _.extend(axiosInstanceBaseConfig, {
    baseURL: 'https://yapi.techdict.pro/mock/11/bibfe'
  })
);
mocker.interceptors.request.use(
  requestInterceptorCallback,
  requestInterceptorErrCallback
);
mocker.interceptors.response.use(
  responseInterceptorCallback,
  responseInterceptorErrCallback
);

export default mocker;
