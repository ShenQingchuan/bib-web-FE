import { DocumentViewData } from '@/models';
import { useStorage } from '@vueuse/core';

export const editingDocViewData = useStorage<DocumentViewData | undefined>(
  'bib:editing-doc-view-data',
  undefined
);
