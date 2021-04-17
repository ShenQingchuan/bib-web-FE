import axios from 'axios';
import {
  axiosInstanceBaseConfig,
  requestInterceptorCallback,
  requestInterceptorErrCallback
} from './common';

const FETCH_DOC_BASEURL =
  process.env.NODE_ENV === 'production'
    ? 'https://yjs.techdict.pro'
    : 'http://localhost:3000/yjs-api';

const fetchDocAxiosInstance = axios.create(axiosInstanceBaseConfig);
fetchDocAxiosInstance.interceptors.request.use(
  requestInterceptorCallback,
  requestInterceptorErrCallback
);

export const fetchDocFromPersistence = (docName: string) => {
  return fetchDocAxiosInstance.get<{
    responseOk: boolean;
    message: string;
    data: string;
  }>(`${FETCH_DOC_BASEURL}/ydoc/${docName}`);
};
