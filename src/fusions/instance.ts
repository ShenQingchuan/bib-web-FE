import axios from "axios";
import _ from "underscore";
import {
  axiosInstanceBaseConfig,
  requestInterceptorCallback,
  requestInterceptorErrCallback,
  responseInterceptorCallback,
  responseInterceptorErrCallback
} from "./common";

const defaultBaseURL =
  process.env.NODE_ENV === "production"
    ? "https://bibapi.techdict.pro"
    : "http://localhost:3000/api";

const fusions = axios.create(
  _.extend(axiosInstanceBaseConfig, {
    baseURL: defaultBaseURL
  })
);
fusions.interceptors.request.use(
  requestInterceptorCallback,
  requestInterceptorErrCallback
);
fusions.interceptors.response.use(
  responseInterceptorCallback,
  responseInterceptorErrCallback
);

export default fusions;
