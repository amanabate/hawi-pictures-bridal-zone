'use client';

import React, { useState } from 'react';
import { Clock, ShieldAlert, Sparkles, Image as ImageIcon, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { useActivityLogs, clearActivityLogs } from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';

export default function ActivityLogView() {
  const { t, formatDate } = useLanguage();
  const logs = useActivityLogs();
  const [filter, setFilter] = useState<'all' | 'packages' | 'gallery' | 'bookings' | 'system'>('all');

  const filteredLogs = logs.filter((log) => (filter === 'all' ? true : log.category === filter));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'packages':
        return <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />;
      case 'gallery':
        return <ImageIcon className="w-3.5 h-3.5 text-blue-500" />;
      case 'bookings':
        return <FileText className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />;
    }
  };

  const getCategoryLabel = (cat: 'all' | 'packages' | 'gallery' | 'bookings' | 'system') => {
    switch (cat) {
      case 'all':
        return t('admin.activityLog.filterAll');
      case 'packages':
        return t('admin.nav.packages');
      case 'gallery':
        return t('admin.nav.gallery');
      case 'bookings':
        return t('admin.nav.bookings');
      case 'system':
        return 'System';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            {t('admin.activityLog.title')}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t('admin.activityLog.subtitle')}
          </p>
        </div>

        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear audit history log?')) {
                clearActivityLogs();
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 border border-[var(--border)] bg-[var(--card-subtle)] flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('admin.activityLog.clearLogs')}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--card-subtle)] border border-[var(--border)] rounded-xl overflow-x-auto max-w-fit">
        {(['all', 'packages', 'gallery', 'bookings', 'system'] as const).map((cat) => {
          const active = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                active
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          );
        })}
      </div>

      {/* Log Feed */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden divide-y divide-[var(--border)]">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-xs text-[var(--text-muted)]">
            {t('admin.table.emptyState')}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-[var(--card-subtle)] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                {getCategoryIcon(log.category)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-[var(--text)]">{log.action}</span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{log.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
