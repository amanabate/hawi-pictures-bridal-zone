import { en } from './en';
import { om } from './om';
import { am } from './am';
import { LanguageCode, TranslationSchema } from './types';

export * from './types';

export const translations: Record<LanguageCode, TranslationSchema> = {
  en,
  om,
  am,
};

export const DEFAULT_LANGUAGE: LanguageCode = 'om'; // Afaan Oromoo is default on first visit as requested

export const SUPPORTED_LANGUAGES: Array<{
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  short: string;
}> = [
  { code: 'en', label: 'English', nativeLabel: 'English', short: 'EN' },
  { code: 'om', label: 'Afaan Oromoo', nativeLabel: 'Afaan Oromoo', short: 'OM' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', short: 'AM' },
];
