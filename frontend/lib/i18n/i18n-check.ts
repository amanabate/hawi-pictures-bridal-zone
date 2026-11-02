import { translations } from '@/locales';

/**
 * Validates key parity across all supported language dictionaries.
 * Throws or reports errors if any key in English is missing in Afaan Oromoo or Amharic.
 */
export function verifyLanguageKeyParity(): {
  success: boolean;
  totalKeys: number;
  missingInOm: string[];
  missingInAm: string[];
} {
  const keys: string[] = [];

  function walk(node: Record<string, unknown>, prefix = '') {
    for (const [key, value] of Object.entries(node)) {
      const current = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        keys.push(current);
      } else if (Array.isArray(value)) {
        keys.push(current);
      } else if (typeof value === 'object' && value !== null) {
        walk(value as Record<string, unknown>, current);
      }
    }
  }

  walk(translations.en as unknown as Record<string, unknown>);

  function getValueByPath(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== 'object') return undefined;
    const parts = path.split('.');
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        return undefined;
      }
    }
    return cur;
  }

  const missingInOm: string[] = [];
  const missingInAm: string[] = [];

  for (const k of keys) {
    if (getValueByPath(translations.om, k) === undefined) {
      missingInOm.push(k);
    }
    if (getValueByPath(translations.am, k) === undefined) {
      missingInAm.push(k);
    }
  }

  const success = missingInOm.length === 0 && missingInAm.length === 0;

  if (!success && process.env.NODE_ENV === 'development') {
    console.error('[i18n validation failed] Missing keys detected:', {
      missingInOm,
      missingInAm,
    });
  }

  return {
    success,
    totalKeys: keys.length,
    missingInOm,
    missingInAm,
  };
}
