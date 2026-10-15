<script setup lang="ts">
import { onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { useItemsTree } from './composables/useItemsTree';

const {
  getData,
  loading,
  rowData,
  getRowId,
  columnDefs,
  onGridReady,
  getDataPath,
  defaultColDef,
  onModelUpdated,
  groupDefaultExpanded,
} = useItemsTree();

onMounted(() => getData());
</script>

<template>
  <ag-grid-vue
    style="width: 100%; height: 480px"
    treeDataDisplayType="custom"
    :groupDefaultExpanded
    :defaultColDef
    :getDataPath
    :columnDefs
    :getRowId
    :rowData
    :loading
    treeData
    @grid-ready="onGridReady"
    @model-updated="onModelUpdated"
  />
</template>
