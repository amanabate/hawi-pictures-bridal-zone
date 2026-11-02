import { translations, LanguageCode, TranslationSchema, DEFAULT_LANGUAGE } from '@/locales';

/**
 * Access a nested property from an object using a dot-delimited key
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Interpolate {variables} within a translation string
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

/**
 * Main translation lookup function with fallback, interpolation, and dev warnings
 */
export function translate(
  lang: LanguageCode,
  key: string,
  params?: Record<string, string | number>
): string {
  const currentDict = translations[lang] || translations[DEFAULT_LANGUAGE];
  const value = getNestedValue(currentDict, key);

  if (typeof value === 'string') {
    return interpolate(value, params);
  }

  // Fallback to English if not found
  if (lang !== 'en') {
    const englishValue = getNestedValue(translations.en, key);
    if (typeof englishValue === 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n warning] Missing key "${key}" in language "${lang}". Falling back to English.`);
      }
      return interpolate(englishValue, params);
    }
  }

  // Never show raw "key.path" to end users — convert last segment to human text as ultimate safety fallback
  const fallbackLabel = key.split('.').pop() || key;
  const humanized = fallbackLabel.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  const safeText = humanized.charAt(0).toUpperCase() + humanized.slice(1);

  if (process.env.NODE_ENV === 'development') {
    console.error(`[i18n error] Translation key "${key}" completely missing in all languages.`);
  }

  return interpolate(safeText, params);
}

/**
 * Format currency with proper Birr suffix for each language
 */
export function formatCurrency(amount: number | string, lang: LanguageCode = DEFAULT_LANGUAGE): string {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
  if (isNaN(num)) return String(amount);

  const formattedNum = new Intl.NumberFormat('en-US').format(num);

  switch (lang) {
    case 'om':
      return `${formattedNum} Birrii`;
    case 'am':
      return `${formattedNum} ብር`;
    case 'en':
    default:
      return `${formattedNum} Birr`;
  }
}

/**
 * Format calendar date cleanly for each locale
 */
export function formatDate(
  dateStr: string,
  lang: LanguageCode = DEFAULT_LANGUAGE,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const localeCode = lang === 'am' ? 'am-ET' : lang === 'om' ? 'om-ET' : 'en-US';
    return date.toLocaleDateString(localeCode, defaultOptions);
  } catch {
    return dateStr;
  }
}

/**
 * Verification utility that checks translation key parity across EN, OM, AM
 */
export function auditTranslations(): {
  isComplete: boolean;
  missingInOm: string[];
  missingInAm: string[];
  totalKeys: number;
} {
  const keys: string[] = [];

  function collectKeys(obj: unknown, prefix = '') {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') {
        keys.push(fullPath);
      } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        collectKeys(v, fullPath);
      }
    }
  }

  collectKeys(translations.en);

  const missingInOm: string[] = [];
  const missingInAm: string[] = [];

  for (const k of keys) {
    if (getNestedValue(translations.om, k) === undefined) {
      missingInOm.push(k);
    }
    if (getNestedValue(translations.am, k) === undefined) {
      missingInAm.push(k);
    }
  }

  return {
    isComplete: missingInOm.length === 0 && missingInAm.length === 0,
    missingInOm,
    missingInAm,
    totalKeys: keys.length,
  };
}
