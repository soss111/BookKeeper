// Local Storage Polyfill for standalone use
// This replaces the browser storage API with localStorage

const createLocalStorage = () => {
  return {
    get: async (key) => {
      try {
        const value = localStorage.getItem(key);
        if (value === null) {
          throw new Error('Key not found');
        }
        return {
          key: key,
          value: value,
          shared: false
        };
      } catch (error) {
        throw error;
      }
    },

    set: async (key, value) => {
      try {
        localStorage.setItem(key, value);
        return {
          key: key,
          value: value,
          shared: false
        };
      } catch (error) {
        console.error('Storage error:', error);
        return null;
      }
    },

    delete: async (key) => {
      try {
        localStorage.removeItem(key);
        return {
          key: key,
          deleted: true,
          shared: false
        };
      } catch (error) {
        console.error('Storage error:', error);
        return null;
      }
    },

    list: async (prefix, shared = false) => {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!prefix || key.startsWith(prefix)) {
            keys.push(key);
          }
        }
        return {
          keys: keys,
          prefix: prefix,
          shared: shared
        };
      } catch (error) {
        console.error('Storage error:', error);
        return null;
      }
    }
  };
};

// Initialize the storage polyfill
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = createLocalStorage();
}

export default createLocalStorage;
