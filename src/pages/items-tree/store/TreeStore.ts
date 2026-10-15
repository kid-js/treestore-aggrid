export type Id = number | string;

export interface TreeItem {
  id: Id;
  parent: Id | null;
  label: string;
}

export class TreeStore {
  private items = new Map<Id, TreeItem>();
  private children = new Map<Id, Set<Id>>();
  private cache: TreeItem[] | null = null;

  constructor(items: readonly TreeItem[] = []) {
    this.setItems(items);
  }

  getAll(): TreeItem[] {
    this.cache ??= Array.from(this.items.values());
    return this.cache
  }

  getItem(id: Id): Readonly<TreeItem> | undefined {
    return this.items.get(id);
  }

  getChildren(id: Id): TreeItem[] {
    const ids = this.children.get(id);
    const result: TreeItem[] = [];

    if (ids) {
      for (const childId of ids) {
        result.push(this.items.get(childId)!);
      }
    }
    return result;
  }

  getAllChildren(id: Id): TreeItem[] {
    const result: TreeItem[] = [];
    const queue: Id[] = [id];

    for (const current of queue) {
      const ids = this.children.get(current);

      if (!ids) {
        continue;
      }
      for (const childId of ids) {
        result.push(this.items.get(childId)!);
        queue.push(childId);
      }
    }
    return result;
  }

  getAllParents(id: Id): TreeItem[] {
    const result: TreeItem[] = [];
    let current = this.items.get(id);

    while (current) {
      result.push(current);
      current = current.parent == null ? undefined : this.items.get(current.parent);
    }
    return result;
  }

  setItems(items: readonly TreeItem[]): void {
    this.items.clear();
    this.children.clear();
    this.cache = null;

    for (const item of items) {
      this.addItemToMap(item);
    }
  }

  addItem(item: TreeItem): void {
    if (this.items.has(item.id)) {
      return;
    }

    this.addItemToMap(item);
    this.cache = null;
  }

  // Удаляет элемент и всё его поддерево потомков
  removeItem(id: Id): void {
    const rootItem = this.items.get(id);

    if (!rootItem) {
      return;
    }

    this.detachFromParent(rootItem);
    this.cache = null;

    const queue: Id[] = [id];

    for (const current of queue) {
      const ids = this.children.get(current);

      if (ids) {
        for (const childId of ids) {
          queue.push(childId);
        }
      }

      this.children.delete(current);
      this.items.delete(current);
    }
  }

  // Заменяет элемент с тем же id. При смене `parent` переносит в новую ветку
  updateItem(item: TreeItem): void {
    const oldItem = this.items.get(item.id);

    if (!oldItem) {
      return;
    }
    if ((oldItem.parent ?? null) !== (item.parent ?? null)) {
      this.detachFromParent(oldItem);
      this.attachToParent(item);
    }

    this.items.set(item.id, item); // позиция в Map сохраняется
    this.cache = null;
  }

  private addItemToMap(item: TreeItem): void {
    this.items.set(item.id, item);
    this.attachToParent(item);
  }

  private attachToParent(item: TreeItem): void {
    if (!item.parent) {
      return;
    }

    const parentId = item.parent;
    let childrenSet = this.children.get(parentId);

    if (!childrenSet) {
      childrenSet = new Set();
      this.children.set(parentId, childrenSet);
    }
    childrenSet.add(item.id);
  }

  private detachFromParent(item: TreeItem): void {
    if (!item.parent) {
      return;
    }

    const parentId = item.parent;
    const childrenSet = this.children.get(parentId);

    if (!childrenSet) {
      return;
    }
    childrenSet.delete(item.id);

    if (childrenSet.size === 0) {
      this.children.delete(parentId);
    }
  }
}
