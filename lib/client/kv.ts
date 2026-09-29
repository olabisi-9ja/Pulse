/**
 * Minimal IndexedDB key-value store. Values are structured-cloned, so
 * non-extractable CryptoKeys can be stored and never leave the browser.
 */
const DB_NAME = "payvault";
const STORE = "kv";

let dbPromise: Promise<IDBDatabase> | undefined;

function open(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

export const kv = {
  get: <T>(key: string) => tx<T | undefined>("readonly", (s) => s.get(key) as IDBRequest<T | undefined>),
  set: (key: string, value: unknown) => tx("readwrite", (s) => s.put(value, key)).then(() => undefined),
  del: (key: string) => tx("readwrite", (s) => s.delete(key)).then(() => undefined),
  async keys(prefix: string): Promise<string[]> {
    const all = await tx<IDBValidKey[]>("readonly", (s) => s.getAllKeys());
    return all.map(String).filter((k) => k.startsWith(prefix));
  },
};
