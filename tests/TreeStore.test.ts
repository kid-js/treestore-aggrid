import { describe, expect, it } from 'vitest';
import { TreeStore, type TreeItem } from '../src/pages/items-tree/store/TreeStore';

const makeItems = (): TreeItem[] => [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cef', label: 'Айтем 4' },
  { id: 5, parent: '91064cef', label: 'Айтем 5' },
  { id: 6, parent: '91064cef', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
];

const ids = (items: TreeItem[]) => items.map((i) => i.id);

describe('TreeStore', () => {
  it('`getAll` возвращает все элементы', () => {
    const items = makeItems();
    const store = new TreeStore(items);
    expect(store.getAll()).toEqual(items);
  });

  it('`getAll` кэшируется и сбрасывается после мутации', () => {
    const store = new TreeStore(makeItems());
    const a = store.getAll();
    expect(store.getAll()).toBe(a);

    store.addItem({ id: 9, parent: 1, label: 'new' });
    expect(store.getAll()).not.toBe(a);
    expect(store.getAll()).toHaveLength(9);
  });

  it('`getItem` возвращает элемент или `undefined`', () => {
    const store = new TreeStore(makeItems());
    expect(store.getItem(4)).toEqual({ id: 4, parent: '91064cef', label: 'Айтем 4' });
    expect(store.getItem('91064cef')?.label).toBe('Айтем 2');
    expect(store.getItem(999)).toBeUndefined();
  });

  it('TreeStore различает числовые и строковые id', () => {
    const store = new TreeStore<TreeItem>([
      { id: 1, parent: null },
      { id: '1', parent: null },
    ]);
    expect(store.getAll()).toHaveLength(2);
    expect(store.getItem(1)).not.toBe(store.getItem('1'));
  });

  it('`getChildren` возвращает прямых потомков', () => {
    const store = new TreeStore(makeItems());
    expect(ids(store.getChildren(1))).toEqual(['91064cef', 3]);
    expect(ids(store.getChildren('91064cef'))).toEqual([4, 5, 6]);
  });

  it('`getChildren` для не группы и неизвестного id возвращает пустой массив', () => {
    const store = new TreeStore(makeItems());
    expect(store.getChildren(7)).toEqual([]);
    expect(store.getChildren('nope')).toEqual([]);
  });

  it('`getAllChildren` возвращает всех потомков', () => {
    const store = new TreeStore(makeItems());
    expect(ids(store.getAllChildren(1)).sort()).toEqual(
      [3, 4, 5, 6, 7, 8, '91064cef'].sort(),
    );
    expect(ids(store.getAllChildren(4)).sort()).toEqual([7, 8]);
    expect(store.getAllChildren(8)).toEqual([]);
  });

  it('`getAllParents` - цепочка от элемента до корня, порядок важен', () => {
    const store = new TreeStore(makeItems());
    expect(ids(store.getAllParents(7))).toEqual([7, 4, '91064cef', 1]);
    expect(ids(store.getAllParents(1))).toEqual([1]);
    expect(store.getAllParents('nope')).toEqual([]);
  });

  it('`setItems` полностью заменяет данные', () => {
    const store = new TreeStore(makeItems());
    store.setItems([{ id: 100, parent: null, label: 'x' }]);
    expect(ids(store.getAll())).toEqual([100]);
    expect(store.getItem(1)).toBeUndefined();
    expect(store.getChildren(1)).toEqual([]);
  });

  it('Конструктор по умолчанию создаёт пустое хранилище', () => {
    const store = new TreeStore();
    expect(store.getAll()).toEqual([]);
    store.setItems(makeItems());
    expect(store.getAll()).toHaveLength(8);
  });

  it('`addItem` добавляет элемент в структуру', () => {
    const store = new TreeStore(makeItems());
    store.addItem({ id: 9, parent: 7, label: 'Айтем 9' });
    expect(ids(store.getChildren(7))).toEqual([9]);
    expect(ids(store.getAllParents(9))).toEqual([9, 7, 4, '91064cef', 1]);
  });

  it('`removeItem` удаляет элемент и всё поддерево', () => {
    const store = new TreeStore(makeItems());
    store.removeItem(4);
    expect(ids(store.getAll())).toEqual([1, '91064cef', 3, 5, 6]);
    expect(store.getItem(7)).toBeUndefined();
    expect(ids(store.getChildren('91064cef'))).toEqual([5, 6]);
    store.removeItem(999); // неизвестный id — без ошибок
    expect(store.getAll()).toHaveLength(5);
  });

  it('`updateItem` обновляет поля и сохраняет позицию', () => {
    const store = new TreeStore(makeItems());
    store.updateItem({ id: 3, parent: 1, label: 'Обновлён' });
    expect(store.getItem(3)?.label).toBe('Обновлён');
    expect(ids(store.getAll())).toEqual([1, '91064cef', 3, 4, 5, 6, 7, 8]);
    expect(ids(store.getChildren(1))).toEqual(['91064cef', 3]);
  });

  it('`updateItem` со сменой parent переносит элемент в другую ветку', () => {
    const store = new TreeStore(makeItems());
    store.updateItem({ id: 4, parent: 3, label: 'Айтем 4' });
    expect(ids(store.getChildren('91064cef'))).toEqual([5, 6]);
    expect(ids(store.getChildren(3))).toEqual([4]);
    expect(ids(store.getAllParents(7))).toEqual([7, 4, 3, 1]);
  });

  it('`updateItem` для несуществующего `id` ничего не делает', () => {
    const store = new TreeStore(makeItems());
    store.updateItem({ id: 999, parent: 1, label: 'x' });
    expect(store.getAll()).toHaveLength(8);
  });
});
