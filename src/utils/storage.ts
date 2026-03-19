import { createMMKV } from 'react-native-mmkv';

// Create a single shared instance of MMKV
export const storage = createMMKV();

/**
 * Saves a string value to storage
 */
export const setStringItem = (key: string, value: string): void => {
  storage.set(key, value);
};

/**
 * Gets a string value from storage
 */
export const getStringItem = (key: string): string | undefined => {
  return storage.getString(key);
};

/**
 * Saves a boolean value to storage
 */
export const setBooleanItem = (key: string, value: boolean): void => {
  storage.set(key, value);
};

/**
 * Gets a boolean value from storage
 */
export const getBooleanItem = (key: string): boolean | undefined => {
  return storage.getBoolean(key);
};

/**
 * Saves a number value to storage
 */
export const setNumberItem = (key: string, value: number): void => {
  storage.set(key, value);
};

/**
 * Gets a number value from storage
 */
export const getNumberItem = (key: string): number | undefined => {
  return storage.getNumber(key);
};

/**
 * Saves an object to storage safely.
 * 
 * @param key - The storage key
 * @param value - The object to be stringified and stored
 */
export const setObjectItem = <T extends Record<string, any> | string>(key: string, value: T): void => {
  try {
    // Runtime safety net in case of an 'any' cast bypassing TS
    const jsonString =
      typeof value === 'object' && value !== null
        ? JSON.stringify(value)
        : (value as unknown as string);

    storage.set(key, jsonString);
  } catch (error) {
    console.error(`Error saving object to MMKV with key ${key}:`, error);
  }
};

/**
 * Gets an object/JSON value from storage safely
 */
export const getObjectItem = <T>(key: string): T | null => {
  try {
    const jsonString = storage.getString(key);
    if (jsonString) {
      return JSON.parse(jsonString) as T;
    }
  } catch (error) {
    console.error(`Error parsing object from MMKV with key ${key}:`, error);
  }
  return null;
};

/**
 * Checks whether a given key exists in storage (v4+)
 */
export const containsKey = (key: string): boolean => {
  return storage.contains(key);
};

/**
 * Removes an item from storage by key
 */
export const removeItem = (key: string): void => {
  // react-native-mmkv v4 replaces .delete() with .remove()
  storage.remove(key);
};

/**
 * Completely clears all data from this MMKV instance
 */
export const clearStorage = (): void => {
  storage.clearAll();
};
