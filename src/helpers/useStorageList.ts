import { LocalStorage, SessionStorage } from 'quasar';

export enum StorageType {
  Local,
  Session,
}

const storages = [LocalStorage, SessionStorage];

export default function useStorageList<T>(type: StorageType, key: string) {
  const storage = storages[type];

  return {
    get() {
      if (storage.has(key)) {
        const list: T[] = storage.getItem(key)!;
        return list;
      } else {
        return [];
      }
    },
    push(...items: T[]) {
      if (storage.has(key)) {
        const list: T[] = storage.getItem(key)!;

        list.push(...items);

        storage.set(key, list);
      } else {
        storage.set(key, [...items]);
      }
    },
  };
}
