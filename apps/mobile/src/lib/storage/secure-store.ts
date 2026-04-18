import * as SecureStore from "expo-secure-store";

const secureStoreNamespace = "gama.secure";

function toSecureKey(key: string) {
  return `${secureStoreNamespace}.${key}`;
}

export const secureStoreSessionAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(toSecureKey(key)),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(toSecureKey(key), value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(toSecureKey(key))
};

export const secureStore = {
  async getSensitiveValue(key: string) {
    return SecureStore.getItemAsync(toSecureKey(key));
  },
  async setSensitiveValue(key: string, value: string) {
    return SecureStore.setItemAsync(toSecureKey(key), value);
  },
  async removeSensitiveValue(key: string) {
    return SecureStore.deleteItemAsync(toSecureKey(key));
  }
};
