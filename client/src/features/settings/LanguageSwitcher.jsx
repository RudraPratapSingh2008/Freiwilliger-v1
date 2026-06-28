import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Globe } from 'lucide-react';
import axios from '../../lib/axios';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const currentLang = i18n.language;

  const handleChange = async (lang) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('i18n_language', lang);
    if (isAuthenticated) {
      try { await axios.patch('/settings/language', { preferredLanguage: lang }); } catch {}
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="h-4 w-4 text-violet-600" />
        <span className="text-sm font-medium">{t('settings.selectLanguage')}</span>
      </div>
      <div className="flex gap-3">
        {[{ code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }].map(({ code, label }) => (
          <button
            key={code}
            onClick={() => handleChange(code)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              currentLang === code
                ? 'bg-violet-100 border-violet-300 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
