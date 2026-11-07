import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Fingerprint, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  Smartphone,
  Eye,
  AlertCircle
} from 'lucide-react';
import { CompanySettings, Language } from '../types';
import { translations } from '../translations';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  settings: CompanySettings;
  onUpdateSettings: (s: CompanySettings) => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  language,
  settings,
  onUpdateSettings,
}) => {
  const t = translations[language];
  const [totpCode, setTotpCode] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleToggle2FA = () => {
    onUpdateSettings({
      ...settings,
      twoFactorEnabled: !settings.twoFactorEnabled,
    });
  };

  const handleToggleBiometrics = () => {
    onUpdateSettings({
      ...settings,
      biometricEnabled: !settings.biometricEnabled,
    });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      setVerifySuccess(true);
      setErrorMessage('');
      setTimeout(() => {
        setVerifySuccess(false);
        setTotpCode('');
      }, 2000);
    } else {
      setErrorMessage('Voer een geldige 6-cijferige verificatiecode in.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              {t.twoFactorTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.twoFactorSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Controls */}
        <div className="space-y-4">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Authenticator App (TOTP)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Google Authenticator, Microsoft Auth of 1Password
                </div>
              </div>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Biometrics Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Biometrische Beveiliging
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  FaceID, TouchID of Windows Hello op dit apparaat
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleBiometrics}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.biometricEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Verification code tester */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.totpCode}
          </div>
          <form onSubmit={handleVerifyCode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="flex-1 px-3 py-1.5 text-xs text-center tracking-widest font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap"
            >
              {t.verify}
            </button>
          </form>

          {verifySuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>2FA token geverifieerd. Uw sessie is cryptografisch beveiligd!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
