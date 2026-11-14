import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// The session lives in the iPhone keychain (expo-secure-store). Keychain
// values should stay under ~2 KB and a Supabase session is larger, so each
// value is split into chunks.
const CHUNK = 1800;

const secureChunkedStorage = {
  async getItem(key) {
    const count = Number(await SecureStore.getItemAsync(`${key}.n`));
    if (!count) return null;
    const parts = [];
    for (let i = 0; i < count; i += 1) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part == null) return null;
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(key, value) {
    await this.removeItem(key);
    const parts = value.match(new RegExp(`[\\s\\S]{1,${CHUNK}}`, 'g')) || [''];
    for (let i = 0; i < parts.length; i += 1) await SecureStore.setItemAsync(`${key}.${i}`, parts[i]);
    await SecureStore.setItemAsync(`${key}.n`, String(parts.length));
  },
  async removeItem(key) {
    const count = Number(await SecureStore.getItemAsync(`${key}.n`));
    for (let i = 0; i < count; i += 1) await SecureStore.deleteItemAsync(`${key}.${i}`);
    await SecureStore.deleteItemAsync(`${key}.n`);
  },
};

// SecureStore has no web implementation; the web preview (used only for
// checking layouts) keeps the session in localStorage instead.
const storage = Platform.OS === 'web' ? undefined : secureChunkedStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
