const DB_NAME = 'visual-regression-snapshots';
const STORE_NAME = 'snapshots';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const request = run(tx.objectStore(STORE_NAME));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export const saveSnapshot = (key: string, blob: Blob) => withStore('readwrite', (store) => store.put(blob, key));

export const clearAllSnapshots = () => withStore('readwrite', (store) => store.clear());

export async function getAllSnapshots(): Promise<Map<string, Blob>> {
  const db = await openDb();
  try {
    return await new Promise<Map<string, Blob>>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const keysRequest = store.getAllKeys();
      const valuesRequest = store.getAll();

      tx.oncomplete = () => {
        const keys = keysRequest.result as string[];
        const values = valuesRequest.result as Blob[];
        resolve(new Map(keys.map((key, i) => [key, values[i]])));
      };
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
