import axios, { AxiosResponse } from 'axios';

const FETCH_DOC_BASEURL =
  process.env.NODE_ENV === 'production'
    ? 'https://yjs.techdict.pro'
    : 'http://localhost:3000/yjs-api';

export function fetchDocFromPersistence(docName: string) {
  return axios.get<{
    responseOk: boolean;
    message: string;
    data: string;
  }>(`${FETCH_DOC_BASEURL}/ydoc/${docName}`);
}
