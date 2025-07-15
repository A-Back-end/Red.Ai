import { useTheme } from './theme-context';
import { translations } from './translations';

export function useTranslation() {
  const { language } = useTheme();

  const t = (key: string): string => {
    const languageTranslations = translations[language] as { [key: string]: string };
    const englishTranslations = translations.en as { [key: string]: string };
    return languageTranslations[key] || englishTranslations[key] || key;
  };

  return { t, language };
} 