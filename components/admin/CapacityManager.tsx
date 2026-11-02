'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Shield,
  Send,
  AlertTriangle,
  Lock,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  useCapacitySettings,
  saveCapacitySettings,
  CapacitySettings,
  DEFAULT_CAPACITY_SETTINGS,
  formatTelegramMessage
} from '@/lib/capacity-store';
import { logActivity } from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';

interface CapacityManagerProps {
  onShowToast: (message: string) => void;
}

export default function CapacityManager({ onShowToast }: CapacityManagerProps) {
  const { t, language } = useLanguage();
  const currentSettings = useCapacitySettings();
  const [settings, setSettings] = useState<CapacitySettings>(currentSettings);

  // New Date Override Form State
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideMax, setOverrideMax] = useState(4);
  const [overrideNotes, setOverrideNotes] = useState('');

  // New Blocked Date Form State
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Template language tab
  const [templateLang, setTemplateLang] = useState<'en' | 'om' | 'am'>('en');

  const handleSaveAll = () => {
    saveCapacitySettings(settings);
    logActivity('Capacity Settings Updated', 'system', 'Admin modified studio capacity limits and Telegram notification templates.');
    onShowToast('Capacity and Telegram settings saved successfully.');
  };

  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) return;
    const updatedOverrides = {
      ...settings.dateOverrides,
      [overrideDate]: {
        date: overrideDate,
        maxEvents: Number(overrideMax),
        notes: overrideNotes.trim() || undefined
      }
    };
    const newSettings = { ...settings, dateOverrides: updatedOverrides };
    setSettings(newSettings);
    saveCapacitySettings(newSettings);
    logActivity('Date Override Added', 'bookings', `Custom capacity (${overrideMax} events) set for ${overrideDate}.`);
    setOverrideDate('');
    setOverrideNotes('');
    onShowToast(`Capacity override set for ${overrideDate}`);
  };

  const handleRemoveOverride = (dateKey: string) => {
    const updatedOverrides = { ...settings.dateOverrides };
    delete updatedOverrides[dateKey];
    const newSettings = { ...settings, dateOverrides: updatedOverrides };
    setSettings(newSettings);
    saveCapacitySettings(newSettings);
    onShowToast(`Removed override for ${dateKey}`);
  };

  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate || !blockReason.trim()) return;
    const updatedBlocked = {
      ...settings.blockedDates,
      [blockDate]: {
        date: blockDate,
        reason: blockReason.trim(),
        blockedAt: new Date().toISOString()
      }
    };
    const newSettings = { ...settings, blockedDates: updatedBlocked };
    setSettings(newSettings);
    saveCapacitySettings(newSettings);
    logActivity('Date Blocked', 'bookings', `Date ${blockDate} blocked with reason: "${blockReason}".`);
    setBlockDate('');
    setBlockReason('');
    onShowToast(`Date ${blockDate} is now blocked for reservations.`);
  };

  const handleRemoveBlockedDate = (dateKey: string) => {
    const updatedBlocked = { ...settings.blockedDates };
    delete updatedBlocked[dateKey];
    const newSettings = { ...settings, blockedDates: updatedBlocked };
    setSettings(newSettings);
    saveCapacitySettings(newSettings);
    logActivity('Date Unblocked', 'bookings', `Date ${dateKey} unblocked.`);
    onShowToast(`Unblocked ${dateKey}`);
  };

  // Sample booking preview for Telegram templates
  const sampleBooking = {
    fullName: 'Selamawit Tadesse',
    bookingCode: 'HAWI-2026-9142',
    packageName: 'Gold Royal',
    eventDate: '2026-11-14',
    status: 'Rejected'
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-8">
      {/* Top Banner & Save Action */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
            <Shield className="w-4 h-4 text-[var(--gold)]" />
            <span>Studio Production Guard</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--text)] mt-1">
            {t('admin.capacityManager.title')}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {t('admin.capacityManager.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 shadow-md shrink-0 cursor-pointer"
        >
          <Save className="w-4 h-4 text-black" />
          <span>{t('admin.actions.saveChanges')}</span>
        </button>
      </div>

      {/* Grid: Daily Defaults & Weekday Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Default Daily & Period Limits */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] border-b border-[var(--border)] pb-2">
            <Clock className="w-4 h-4 text-[var(--gold)]" />
            <span>1. {t('admin.capacityManager.defaultDailyLabel')}</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[var(--text)] block mb-1">
                {t('admin.capacityManager.defaultDailyLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.defaultMaxEventsPerDay}
                onChange={(e) =>
                  setSettings({ ...settings, defaultMaxEventsPerDay: Math.max(1, Number(e.target.value)) })
                }
                className="w-full sm:w-36 px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] font-mono font-bold text-sm"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                {t('admin.capacityManager.defaultDailyDesc')}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border)] space-y-3">
              <span className="font-semibold text-[var(--text)] block">
                {t('admin.capacityManager.periodLimitsLabel')}
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)]">
                  <div className="text-[var(--text-muted)] font-medium text-[11px]">{t('timeOfDay.morning')}</div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.defaultPeriodLimits.morning}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultPeriodLimits: {
                          ...settings.defaultPeriodLimits,
                          morning: Math.max(1, Number(e.target.value))
                        }
                      })
                    }
                    className="w-full mt-1 px-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-mono font-bold text-center"
                  />
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">8am - 12pm</div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)]">
                  <div className="text-[var(--text-muted)] font-medium text-[11px]">{t('timeOfDay.afternoon')}</div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.defaultPeriodLimits.afternoon}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultPeriodLimits: {
                          ...settings.defaultPeriodLimits,
                          afternoon: Math.max(1, Number(e.target.value))
                        }
                      })
                    }
                    className="w-full mt-1 px-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-mono font-bold text-center"
                  />
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">1pm - 5pm</div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)]">
                  <div className="text-[var(--text-muted)] font-medium text-[11px]">{t('timeOfDay.evening')}</div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.defaultPeriodLimits.evening}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultPeriodLimits: {
                          ...settings.defaultPeriodLimits,
                          evening: Math.max(1, Number(e.target.value))
                        }
                      })
                    }
                    className="w-full mt-1 px-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-mono font-bold text-center"
                  />
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">5pm - 11pm</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <label className="font-semibold text-[var(--text)] block mb-1">
                Unconfirmed Booking Expiration Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={12}
                  max={168}
                  value={settings.expirationHours}
                  onChange={(e) =>
                    setSettings({ ...settings, expirationHours: Math.max(12, Number(e.target.value)) })
                  }
                  className="w-24 px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] font-mono font-bold text-xs"
                />
                <span className="text-xs text-[var(--text-muted)]">Hours before marking unverified bookings as Expired</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Weekday Capacity Limits */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] border-b border-[var(--border)] pb-2">
            <Calendar className="w-4 h-4 text-[var(--gold)]" />
            <span>2. {t('admin.capacityManager.weekdayLimitsLabel')}</span>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Adjust limits for peak weekend celebrations (Friday - Sunday) vs mid-week studio sessions.
          </p>

          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card-subtle)] text-xs">
            {dayNames.map((name, dayIndex) => {
              const currentVal = settings.weekdayLimits[dayIndex] ?? 2;
              const isWeekend = dayIndex === 0 || dayIndex === 5 || dayIndex === 6;

              return (
                <div key={dayIndex} className="p-2.5 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text)]">{name}</span>
                    {isWeekend && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--gold)]/20 text-[var(--gold-text)]">
                        Peak
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-muted)]">Max Events:</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={currentVal}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setSettings({
                          ...settings,
                          weekdayLimits: {
                            ...settings.weekdayLimits,
                            [dayIndex]: val
                          }
                        });
                      }}
                      className="w-16 px-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-mono font-bold text-center"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Date Overrides & Blocked Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 3: Per-Date Overrides */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] border-b border-[var(--border)] pb-2">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <span>3. {t('admin.capacityManager.overridesLabel')}</span>
          </div>

          <form onSubmit={handleAddOverride} className="p-3.5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-3 text-xs">
            <div className="font-semibold text-[var(--text)]">{t('admin.capacityManager.overridesLabel')}:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="date"
                required
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-mono text-xs"
              />
              <input
                type="number"
                min={1}
                max={12}
                value={overrideMax}
                onChange={(e) => setOverrideMax(Number(e.target.value))}
                placeholder="Max Events"
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-mono text-xs text-center"
              />
              <input
                type="text"
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[var(--gold)] text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('admin.actions.addNew')}</span>
            </button>
          </form>

          {/* List of Overrides */}
          <div className="space-y-2 text-xs">
            {Object.keys(settings.dateOverrides).length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[var(--border)] text-center text-[var(--text-muted)]">
                {t('admin.table.emptyState')}
              </div>
            ) : (
              Object.values(settings.dateOverrides).map((ov) => (
                <div
                  key={ov.date}
                  className="p-3 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-[var(--text)]">{ov.date}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Capacity: <span className="font-bold text-[var(--gold-text)]">{ov.maxEvents} events</span>
                      {ov.notes && ` · ${ov.notes}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOverride(ov.date)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Remove override"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 4: Blocked Dates */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] border-b border-[var(--border)] pb-2">
            <Lock className="w-4 h-4 text-red-500" />
            <span>4. {t('admin.capacityManager.blockedDatesLabel')}</span>
          </div>

          <form onSubmit={handleAddBlockedDate} className="p-3.5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-3 text-xs">
            <div className="font-semibold text-[var(--text)]">{t('admin.capacityManager.addBlockDate')}:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-mono text-xs"
              />
              <input
                type="text"
                required
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={t('admin.capacityManager.blockReasonLabel')}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-700"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('admin.capacityManager.addBlockDate')}</span>
            </button>
          </form>

          {/* List of Blocked Dates */}
          <div className="space-y-2 text-xs">
            {Object.keys(settings.blockedDates).length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[var(--border)] text-center text-[var(--text-muted)]">
                {t('admin.table.emptyState')}
              </div>
            ) : (
              Object.values(settings.blockedDates).map((b) => (
                <div
                  key={b.date}
                  className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      <span>{b.date}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {b.reason}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedDate(b.date)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Unblock date"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Card 5: Service-Level Limits (Coming Soon) */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
            <Shield className="w-4 h-4 text-[var(--gold)]" />
            <span>5. {t('admin.capacityManager.serviceLimitsTitle')}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            Coming Soon
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          {t('admin.capacityManager.serviceLimitsComingSoon')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs opacity-70">
          <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--text)]">Photography Teams</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface)]">Max 3</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Independent master crews with 4K camera gear & aerial drone.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--text)]">Makeup Artists (MUA)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface)]">Max 2</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Senior bridal hair stylists & Habesha traditional makeup artists.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--text)]">Studio Suite Sessions</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface)]">Max 2</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Indoor bridal gown fittings and private bridal suite trials.</p>
          </div>
        </div>
      </div>

      {/* Card 6: Telegram Client Notification Templates */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
            <Send className="w-4 h-4 text-sky-500" />
            <span>6. Telegram Notification Templates (Trilingual)</span>
          </div>

          {/* Language Switcher */}
          <div className="flex rounded-xl border border-[var(--border)] p-0.5 bg-[var(--card-subtle)] text-xs">
            <button
              type="button"
              onClick={() => setTemplateLang('en')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                templateLang === 'en'
                  ? 'bg-[var(--surface)] text-[var(--gold)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setTemplateLang('om')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                templateLang === 'om'
                  ? 'bg-[var(--surface)] text-[var(--gold)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Afaan Oromoo
            </button>
            <button
              type="button"
              onClick={() => setTemplateLang('am')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                templateLang === 'am'
                  ? 'bg-[var(--surface)] text-[var(--gold)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              አማርኛ (Amharic)
            </button>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          When changing a booking to <span className="font-semibold text-red-500">Rejected</span>, <span className="font-semibold text-amber-500">Cancelled</span>, or when it has <span className="font-semibold text-zinc-500">Expired</span>, this message is pre-formatted for direct one-click Telegram sending.
        </p>

        {/* Template Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text)]">
            <span>Template for {templateLang === 'en' ? 'English' : templateLang === 'om' ? 'Afaan Oromoo' : 'አማርኛ'}:</span>
            <span className="text-[11px] text-[var(--gold)] font-mono">Available variables: [Name], [BookingCode], [Package], [Date], [Status], [Reason]</span>
          </div>

          <textarea
            rows={4}
            value={settings.telegramTemplates[templateLang]}
            onChange={(e) =>
              setSettings({
                ...settings,
                telegramTemplates: {
                  ...settings.telegramTemplates,
                  [templateLang]: e.target.value
                }
              })
            }
            className="w-full p-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--gold)] font-mono resize-y"
          />
        </div>

        {/* Live Preview Card */}
        <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-2">
          <div className="text-[10px] uppercase font-bold text-[var(--gold)] tracking-wider">
            Live Preview (How Client Sees It in Telegram):
          </div>
          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-500/20 text-xs text-sky-950 dark:text-sky-200 leading-relaxed font-sans">
            {formatTelegramMessage(settings.telegramTemplates[templateLang], sampleBooking, 'Payment deposit not verified within 48h')}
          </div>
        </div>
      </div>
    </div>
  );
}
