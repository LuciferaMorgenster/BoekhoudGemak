import React from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Check, 
  Info, 
  CheckCheck,
  ExternalLink 
} from 'lucide-react';
import { Language, NotificationItem } from '../types';
import { translations } from '../translations';
import { getGoogleCalendarUrl } from '../utils/exporters';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNavigate: (view: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  language,
  notifications,
  onMarkAllRead,
  onNavigate,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500" />
              {t.notificationsTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fiscale deadlines, afwijkingen en limietoverschrijdingen
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onMarkAllRead}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{t.markAllRead}</span>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t.noNotifications}
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-colors ${
                  !n.read
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {n.type === 'deadline' && <Calendar className="w-4 h-4 text-blue-500 shrink-0" />}
                    {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                    {n.type === 'success' && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {n.type === 'info' && <Info className="w-4 h-4 text-slate-500 shrink-0" />}
                    {n.title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {n.date}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>

                {n.isDeadline && n.deadlineDate && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <a
                      href={getGoogleCalendarUrl(n.title, n.message, n.deadlineDate)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{t.addToGoogleCalendar}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
