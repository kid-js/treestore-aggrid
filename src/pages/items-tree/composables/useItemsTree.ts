import { onScopeDispose, ref, shallowRef } from 'vue';

import type {
  ColDef,
  GridApi,
  GetDataPath,
  GetRowIdFunc,
  GridReadyEvent,
} from 'ag-grid-community';

import { TreeStore } from '../store/TreeStore.ts';
import type { TreeItem } from '../store/TreeStore.ts';

const MOCK_DELAY_MS = 2000;

export function useItemsTree() {
  const store = new TreeStore([]);

  const gridApi = shallowRef<GridApi | null>(null);
  const rowData = shallowRef<TreeItem[]>([]);
  const loading = ref(true);

  const defaultColDef = ref<ColDef>({ flex: 1 });
  const groupDefaultExpanded = ref(-1);

  const columnDefs = ref<ColDef<TreeItem>[]>([
    {
      colId: 'rowNum',
      headerName: '№ п\\п',
      width: 80,
      flex: 0,
      cellStyle: { fontWeight: 'bold' },
      valueGetter: (p) => p.node?.rowIndex != null ? p.node.rowIndex + 1 : '',
    },
    {
      colId: 'category',
      headerName: 'Категория',
      flex: 2,
      showRowGroup: true,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: { suppressCount: true },
      cellStyle: (p) => ({ fontWeight: !!p.node?.group ? 'bold' : 'normal' }),
      valueGetter: (p) => {
        if (!p.data) {
          return '';
        }
        return p.node?.group ? 'Группа' : 'Элемент';
      }
    },
    {
      field: 'label',
      headerName: 'Наименование',
      flex: 3,
      cellStyle: (p) => ({ fontWeight: !!p.node?.group ? 'bold' : 'normal' }),
    },
  ]);

  const getRowId = ref<GetRowIdFunc<TreeItem>>((params) => String(params.data.id));

  const getDataPath = ref<GetDataPath<TreeItem>>((data) => {
    const parents = store.getAllParents(data.id);
    const path: string[] = [];

    // Идем с конца, чтобы избежать .reverse() и сделать только 1 итерацию
    for (let i = parents.length - 1; i >= 0; i--) {
      const parent = parents[i];
      if (parent) {
        path.push(String(parent.id));
      }
    }

    return path;
  });

  let abortController: AbortController | null = null;

  const getData = async () => {
    abortController = new AbortController();

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data.json`, {
        signal: abortController.signal,
      });
      const data: TreeItem[] = await res.json();
      // Имитируем задержку на сервере
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

      store.setItems(data);
      syncRows();
    }
    catch (error) {
      console.error(error);
    }
    finally {
      loading.value = false;
    }
  };

  const setItems = (items: readonly TreeItem[]) => {
    store.setItems(items);
    syncRows();
  };

  const addItem = (item: TreeItem) => {
    store.addItem(item);
    syncRows();
  }

  const removeItem = (id: number | string) => {
    store.removeItem(id);
    syncRows();
  }

  const updateItem = (item: TreeItem) => {
    store.updateItem(item);
    syncRows();
  }

  const syncRows = () => rowData.value = store.getAll();

  const onGridReady = (params: GridReadyEvent) => gridApi.value = params.api;

  // № п\п зависит от позиции строки: пересчитываем при раскрытии/сворачивании.
  const onModelUpdated = () => {
    gridApi.value?.refreshCells({ force: true });
  };

  onScopeDispose(() => abortController?.abort());

  return {
    groupDefaultExpanded,
    onModelUpdated,
    defaultColDef,
    onGridReady,
    getDataPath,
    columnDefs,
    getRowId,
    syncRows,
    gridApi,
    rowData,
    getData,
    loading,
    addItem,
    setItems,
    updateItem,
    removeItem,
  }
}
