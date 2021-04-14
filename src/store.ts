import { reactive, inject } from 'vue';
import { DocumentViewData } from './models';

interface globalStoreType {
  editingDoc: DocumentViewData | null;
}

export const globalStore = reactive<globalStoreType>({
  editingDoc: null
});

export const globalStoreSymbol = Symbol('bib-global-store');
export const useGlobalStore = () => inject<globalStoreType>(globalStoreSymbol)!;
