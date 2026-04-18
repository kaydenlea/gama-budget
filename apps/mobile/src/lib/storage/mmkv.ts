import { MMKV } from "react-native-mmkv";

export const appCacheStorage = new MMKV({
  id: "gama-cache"
});

const allowedNonSensitivePrefixes = ["cache:", "pref:", "query:", "ui:"] as const;
const sensitiveKeyPattern = /(token|secret|session|password|credential|auth|jwt|api[-_]?key|private|pin|biometric)/i;

function assertNonSensitiveKey(key: string) {
  if (sensitiveKeyPattern.test(key)) {
    throw new Error(`Sensitive key "${key}" must not be stored in MMKV.`);
  }

  if (!allowedNonSensitivePrefixes.some((prefix) => key.startsWith(prefix))) {
    throw new Error(
      `MMKV key "${key}" must use an approved non-sensitive prefix: ${allowedNonSensitivePrefixes.join(", ")}.`,
    );
  }
}

export const nonSensitiveCache = {
  getString(key: string) {
    assertNonSensitiveKey(key);
    return appCacheStorage.getString(key) ?? null;
  },
  setString(key: string, value: string) {
    assertNonSensitiveKey(key);
    appCacheStorage.set(key, value);
  },
  remove(key: string) {
    assertNonSensitiveKey(key);
    appCacheStorage.delete(key);
  }
};
