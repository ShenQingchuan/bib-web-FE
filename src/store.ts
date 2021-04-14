import { reactive, inject } from 'vue';
import { DocumentViewData } from './models';

interface globalStoreType {
  editDocumentParam?: DocumentViewData; // 查看到编辑文档的跳转携带数据
}

export const globalStore = reactive<globalStoreType>({});

export const globalStoreSymbol = Symbol('bib-global-store');
export const useGlobalStore = () => inject<globalStoreType>(globalStoreSymbol)!;
