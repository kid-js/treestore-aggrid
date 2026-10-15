import { createApp } from 'vue';
import App from './App.vue';

import {
  ModuleRegistry,
  CellStyleModule,
  RenderApiModule,
  ClientSideRowModelModule,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';
import { enableDevValidations } from 'ag-grid-community';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CellStyleModule, // cellStyle (жирный шрифт у групп)
  RenderApiModule, // api.refreshCells для колонки № п\п
  TreeDataModule,
]);

if (import.meta.env.DEV) {
  // Расширенные проверки только в режиме разработки
  enableDevValidations();
}

const app = createApp(App);

app.mount('#app');
