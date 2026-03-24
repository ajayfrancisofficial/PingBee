import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// Create a single shared instance of MMKV
const storage = createMMKV();

/**
 * Custom storage adapter for Zustand's persist middleware
 */
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: name => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: name => {
    return storage.remove(name);
  },
};

export const mmkvStorage = {
  /**
   * Saves a string value to storage
   */
  setStringItem: (key: string, value: string): void => {
    storage.set(key, value);
  },

  /**
   * Gets a string value from storage
   */
  getStringItem: (key: string): string | undefined => {
    return storage.getString(key);
  },

  /**
   * Saves a boolean value to storage
   */
  setBooleanItem: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  /**
   * Gets a boolean value from storage
   */
  getBooleanItem: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  /**
   * Saves a number value to storage
   */
  setNumberItem: (key: string, value: number): void => {
    storage.set(key, value);
  },

  /**
   * Gets a number value from storage
   */
  getNumberItem: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  /**
   * Saves an object to storage safely.
   *
   * @param key - The storage key
   * @param value - The object to be stringified and stored
   */
  setObjectItem: <T extends Record<string, any> | string>(
    key: string,
    value: T,
  ): void => {
    try {
      const jsonString =
        typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : (value as unknown as string);

      storage.set(key, jsonString);
    } catch (error) {
      console.error(`Error saving object to MMKV with key ${key}:`, error);
    }
  },

  /**
   * Gets an object/JSON value from storage safely
   */
  getObjectItem: <T>(key: string): T | null => {
    try {
      const jsonString = storage.getString(key);
      if (jsonString) {
        return JSON.parse(jsonString) as T;
      }
    } catch (error) {
      console.error(`Error parsing object from MMKV with key ${key}:`, error);
    }
    return null;
  },

  /**
   * Checks whether a given key exists in storage (v4+)
   */
  containsKey: (key: string): boolean => {
    return storage.contains(key);
  },

  /**
   * Removes an item from storage by key
   */
  removeItem: (key: string): void => {
    storage.remove(key);
  },

  /**
   * Completely clears all data from this MMKV instance
   */
  clearStorage: (): void => {
    storage.clearAll();
  },
};
