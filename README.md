# TreeStore / AG Grid (Vue 3 + TypeScript)

## Запуск

```bash
npm ci            # установка зависимостей
npm run dev       # dev-сервер
npm run build     # проверка типов + production-сборка
npm run preview   # локальный запуск
npm test          # unit-тесты
```

## Структура

- `src/store/TreeStore.ts` - класс хранилища
- `src/components/TreeGrid.vue` - таблица на `ag-grid-vue`
- `public/data.json` - mock-данные
- `tests/TreeStore.test.ts` - unit-тесты

## Особенности

Для быстрого доступа к элементам и связям используются Map и Set. Класс `TreeStore` не зависит от Vue и может тестироваться автономно. Метод `getAll` осознанно отдаёт общий кэшированный массив, а не копию: это компромисс ради скорости - O(1) при повторных вызовах вместо O(n).
