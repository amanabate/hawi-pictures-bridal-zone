'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  ShieldCheck,
  UserCheck,
  MapPin,
  Send,
  X,
  AlertCircle
} from 'lucide-react';
import { Booking, saveBooking, generateBookingCode, assignStaffToBooking } from '@/lib/storage';
import {
  useCapacitySettings,
  getCapacityForDate,
  STAFF_ROSTER,
  StaffMember,
  DateCapacityResult
} from '@/lib/capacity-store';
import { useManagedPackages, logActivity } from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';

interface AdminCalendarViewProps {
  bookings: Booking[];
  currentRole: 'Studio Owner' | 'Receptionist';
  onShowToast: (msg: string) => void;
  onSelectBooking: (b: Booking) => void;
}

export default function AdminCalendarView({
  bookings,
  currentRole,
  onShowToast,
  onSelectBooking
}: AdminCalendarViewProps) {
  const { t, formatDate } = useLanguage();
  const capacitySettings = useCapacitySettings();
  const managedPackages = useManagedPackages();

  // Selected Month & Year (Default to November 2026 for demo or current date)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Month 10 is Nov
  const [selectedDayStr, setSelectedDayStr] = useState<string>('2026-11-14');

  // Direct Booking Modal / Owner Override
  const [showAddModal, setShowAddModal] = useState(false);
  const [overrideWarningModal, setOverrideWarningModal] = useState(false);

  // New Booking Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTelegram, setNewClientTelegram] = useState('');
  const [newPackageId, setNewPackageId] = useState('gold-royal');
  const [newPeriod, setNewPeriod] = useState('Full Day (All Day & Evening)');
  const [newVenue, setNewVenue] = useState('Addis Ababa');
  const [newStaff, setNewStaff] = useState<string[]>([]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 1));
    setSelectedDayStr('2026-11-14');
  };

  // Month label and first day index
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute capacity data for all days in this month
  const monthDays = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const numDays = new Date(y, m + 1, 0).getDate();

    const days: Array<{
      dayNum: number;
      dateStr: string;
      isToday: boolean;
      capacity: DateCapacityResult;
      dayBookings: Booking[];
    }> = [];

    for (let d = 1; d <= numDays; d++) {
      const dayFormatted = String(d).padStart(2, '0');
      const monthFormatted = String(m + 1).padStart(2, '0');
      const dateStr = `${y}-${monthFormatted}-${dayFormatted}`;

      const cap = getCapacityForDate(dateStr, bookings, capacitySettings);
      const dayBookings = bookings.filter((b) => b.eventDate.slice(0, 10) === dateStr);

      days.push({
        dayNum: d,
        dateStr,
        isToday: dateStr === '2026-11-14',
        capacity: cap,
        dayBookings
      });
    }

    return days;
  }, [currentDate, bookings, capacitySettings]);

  // Selected Day Details
  const selectedDayCapacity = useMemo(() => {
    return getCapacityForDate(selectedDayStr, bookings, capacitySettings);
  }, [selectedDayStr, bookings, capacitySettings]);

  const selectedDayBookings = useMemo(() => {
    return bookings.filter((b) => b.eventDate.slice(0, 10) === selectedDayStr);
  }, [bookings, selectedDayStr]);

  // Double booking check helper
  const checkStaffConflict = (staffName: string, bookingId: string, periodStr: string) => {
    const periodLower = periodStr.toLowerCase();
    for (const b of selectedDayBookings) {
      if (b.id !== bookingId && b.assignedStaff?.includes(staffName)) {
        const otherPeriod = (b.timeOfDay || '').toLowerCase();
        // Conflict if either is full day or periods match
        if (
          periodLower.includes('full day') ||
          otherPeriod.includes('full day') ||
          (periodLower.includes('morning') && otherPeriod.includes('morning')) ||
          (periodLower.includes('afternoon') && otherPeriod.includes('afternoon')) ||
          (periodLower.includes('evening') && otherPeriod.includes('evening'))
        ) {
          return {
            hasConflict: true,
            conflictingBookingCode: b.bookingCode,
            conflictingClient: b.fullName
          };
        }
      }
    }
    return { hasConflict: false };
  };

  // Staff assignment change
  const handleAssignStaff = (bookingId: string, staffName: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;

    const currentStaff = targetBooking.assignedStaff || [];
    let updatedStaff: string[];

    if (currentStaff.includes(staffName)) {
      updatedStaff = currentStaff.filter((s) => s !== staffName);
    } else {
      // Check conflict before adding
      const conflict = checkStaffConflict(staffName, bookingId, targetBooking.timeOfDay);
      if (conflict.hasConflict) {
        onShowToast(`⚠️ Conflict warning: ${staffName} is already assigned to ${conflict.conflictingBookingCode}!`);
      }
      updatedStaff = [...currentStaff, staffName];
    }

    assignStaffToBooking(bookingId, updatedStaff);
    logActivity('Staff Assigned', 'bookings', `Assigned staff [${updatedStaff.join(', ')}] to booking ${targetBooking.bookingCode}.`);
    onShowToast(`Updated crew for ${targetBooking.bookingCode}`);
  };

  // Initiate direct add booking
  const handleStartAddBooking = () => {
    if (selectedDayCapacity.isBlocked) {
      onShowToast(`Cannot add booking: Date ${selectedDayStr} is blocked (${selectedDayCapacity.blockedReason}).`);
      return;
    }

    if (selectedDayCapacity.isFull) {
      if (currentRole === 'Studio Owner') {
        setOverrideWarningModal(true);
      } else {
        onShowToast('Capacity limit reached. Only Studio Owner can override capacity limits.');
      }
      return;
    }

    setShowAddModal(true);
  };

  const handleConfirmOverrideAndOpenModal = () => {
    setOverrideWarningModal(false);
    setShowAddModal(true);
  };

  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) {
      onShowToast('Client name and phone are required.');
      return;
    }

    const pkg = managedPackages.find((p) => p.id === newPackageId) || managedPackages[0];
    const isOverridden = selectedDayCapacity.isFull;

    const newBooking: Booking = {
      id: generateBookingCode(),
      bookingCode: generateBookingCode(),
      fullName: newClientName.trim(),
      phone: newClientPhone.trim(),
      telegramUsername: newClientTelegram.trim().replace(/^@+/, '') || undefined,
      isPhoneOnly: !newClientTelegram.trim(),
      clientLanguage: 'en',
      packageId: pkg.id,
      packageName: pkg.name,
      packagePrice: pkg.priceDisplay,
      priceNumeric: pkg.price,
      depositRequired: pkg.depositAmount,
      eventDate: selectedDayStr,
      timeOfDay: newPeriod,
      venue: newVenue.trim(),
      notes: isOverridden ? `[Owner Override on Full Date] Created by ${currentRole}` : 'Admin direct entry',
      paymentMethod: 'In-Studio Cash Deposit',
      status: 'Confirmed',
      assignedStaff: newStaff,
      isOverriddenByOwner: isOverridden,
      notificationStatus: {
        notified: false
      },
      createdAt: new Date().toISOString()
    };

    saveBooking(newBooking);
    logActivity(
      isOverridden ? 'Capacity Override Booking Created' : 'Direct Booking Created',
      'bookings',
      `${currentRole} added reservation ${newBooking.bookingCode} for ${newBooking.eventDate} (${isOverridden ? 'OVER CAPACITY' : 'Normal capacity'}).`
    );

    onShowToast(`Booking ${newBooking.bookingCode} added successfully!`);
    setShowAddModal(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientTelegram('');
    setNewStaff([]);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header with Navigation and Role Badge */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
            <CalendarIcon className="w-4 h-4 text-[var(--gold)]" />
            <span>{t('admin.calendarView.title')}</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--text)] mt-1">
            {monthLabel}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {t('admin.calendarView.subtitle')}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--card-subtle)] p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
              title={t('admin.calendarView.prevMonth')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)] rounded-lg transition-colors"
            >
              {t('admin.calendarView.today')}
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
              title={t('admin.calendarView.nextMonth')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartAddBooking}
            className="px-3.5 py-2 rounded-xl bg-[var(--gold)] text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>+ {t('admin.actions.addNew')} ({selectedDayStr.slice(5)})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Month Calendar (8 Cols) + Day Details (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] pb-2 border-b border-[var(--border)]">
            <span className="text-[var(--gold)]">Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span className="text-[var(--gold)]">Fri</span>
            <span className="text-[var(--gold)]">Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset tiles for first day of month */}
            {[...Array(firstDayIndex)].map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] rounded-2xl bg-[var(--card-subtle)]/30 border border-transparent opacity-30" />
            ))}

            {/* Actual Month Days */}
            {monthDays.map((d) => {
              const cap = d.capacity;
              const isSelected = selectedDayStr === d.dateStr;

              // Color styles based on capacity state
              let tileBorder = 'border-[var(--border)]';
              let badgeBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

              if (cap.isBlocked) {
                tileBorder = 'border-red-500/30 bg-red-500/5';
                badgeBg = 'bg-red-500/10 text-red-500 border-red-500/20';
              } else if (cap.isFull) {
                tileBorder = 'border-red-500/50 bg-red-500/5';
                badgeBg = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
              } else if (cap.isLimited) {
                tileBorder = 'border-amber-500/50 bg-amber-500/5';
                badgeBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
              } else if (cap.bookedCount > 0) {
                tileBorder = 'border-[var(--gold)]/50 bg-[var(--gold)]/5';
                badgeBg = 'bg-[var(--gold)]/10 text-[var(--gold-text)] border-[var(--gold)]/30';
              }

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => setSelectedDayStr(d.dateStr)}
                  className={`min-h-[90px] p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${tileBorder} ${
                    isSelected
                      ? 'ring-2 ring-[var(--gold)] bg-[var(--card-subtle)] shadow-md'
                      : 'hover:bg-[var(--card-subtle)] hover:shadow-xs'
                  }`}
                >
                  {/* Top: Day Num + Override/Blocked Dot */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-serif text-sm font-bold ${isSelected ? 'text-[var(--gold)]' : 'text-[var(--text)]'}`}>
                      {d.dayNum}
                    </span>

                    {cap.isBlocked ? (
                      <Lock className="w-3 h-3 text-red-500" />
                    ) : cap.hasOverride ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" title="Date override active" />
                    ) : null}
                  </div>

                  {/* Middle: Count Badges */}
                  <div className="mt-1 space-y-1 w-full">
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-center border ${badgeBg}`}>
                      {cap.isBlocked ? 'BLOCKED' : `${cap.bookedCount}/${cap.maxCapacity}`}
                    </div>

                    {/* Dot indicators for bookings */}
                    <div className="flex items-center justify-center gap-1 pt-0.5">
                      {d.dayBookings.slice(0, 3).map((b, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-500'
                              : b.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-zinc-400'
                          }`}
                        />
                      ))}
                      {d.dayBookings.length > 3 && (
                        <span className="text-[9px] text-[var(--text-muted)] font-bold">+</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{t('capacity.available')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{t('capacity.limited')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>{t('capacity.full')} / {t('capacity.blocked')}</span>
              </span>
            </div>

            <div className="text-[11px] font-mono">
              Pending & Confirmed consume capacity
            </div>
          </div>
        </div>

        {/* Day Details Drawer (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-5">
            {/* Day Header */}
            <div className="border-b border-[var(--border)] pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                  {t('admin.calendarView.bookedEventsTitle')}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {selectedDayStr}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-[var(--text)]">
                {formatDate(selectedDayStr)}
              </h3>

              {/* Day Capacity Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] text-xs">
                <div>
                  <span className="text-[var(--text-muted)]">Capacity Status:</span>
                  <div className="font-bold text-[var(--text)] font-mono">
                    {selectedDayCapacity.bookedCount} / {selectedDayCapacity.maxCapacity} Booked
                  </div>
                </div>

                {selectedDayCapacity.isBlocked ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/30">
                    {t('admin.calendarView.dayBlocked')}
                  </span>
                ) : selectedDayCapacity.isFull ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                    {t('admin.calendarView.dayFull')}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {selectedDayCapacity.remainingSlots} {t('admin.calendarView.dayAvailable')}
                  </span>
                )}
              </div>

              {selectedDayCapacity.isBlocked && (
                <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
                  Reason: {selectedDayCapacity.blockedReason}
                </div>
              )}
            </div>

            {/* Bookings on this Date */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text)]">
                <span>{t('admin.calendarView.bookedEventsTitle')} ({selectedDayBookings.length}):</span>
                <button
                  type="button"
                  onClick={handleStartAddBooking}
                  className="text-xs text-[var(--gold-text)] font-bold hover:underline"
                >
                  + {t('admin.actions.addNew')}
                </button>
              </div>

              {selectedDayBookings.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[var(--card-subtle)] border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
                  {t('admin.table.emptyState')}
                </div>
              ) : (
                selectedDayBookings.map((b) => {
                  const isPending = b.status === 'Pending';
                  const isConfirmed = b.status === 'Confirmed';
                  const isCompleted = b.status === 'Completed';

                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--gold)]/50 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-serif font-bold text-sm text-[var(--text)]">
                            {b.fullName}
                          </div>
                          <div className="text-xs text-[var(--gold-text)] font-semibold mt-0.5">
                            {b.packageName} · {b.timeOfDay}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isConfirmed
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      {/* Venue & Phone */}
                      <div className="text-[11px] text-[var(--text-muted)] space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[var(--gold)] shrink-0" />
                          <span className="truncate">{b.venue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <a href={`tel:${b.phone}`} className="font-mono text-[var(--gold-text)] hover:underline">
                            {b.phone}
                          </a>
                          {b.telegramUsername && (
                            <span className="font-mono text-sky-500">@{b.telegramUsername}</span>
                          )}
                        </div>
                      </div>

                      {/* Staff Assignment & Conflict Detection */}
                      <div className="pt-2 border-t border-[var(--border)] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[var(--text)] flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-[var(--gold)]" />
                            <span>Assigned Crew:</span>
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">Toggle to assign</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {STAFF_ROSTER.map((staff) => {
                            const isAssigned = b.assignedStaff?.includes(staff.name);
                            const conflict = checkStaffConflict(staff.name, b.id, b.timeOfDay);

                            return (
                              <button
                                key={staff.id}
                                type="button"
                                onClick={() => handleAssignStaff(b.id, staff.name)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                                  isAssigned
                                    ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                                    : conflict.hasConflict
                                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
                                    : 'bg-[var(--card-subtle)] border-[var(--border)] text-[var(--text)] hover:border-[var(--gold)]/50'
                                }`}
                                title={
                                  conflict.hasConflict
                                    ? `⚠️ Warning: Already booked in ${conflict.conflictingBookingCode}`
                                    : `${staff.role}`
                                }
                              >
                                <span>{staff.name.split(' ')[0]}</span>
                                {conflict.hasConflict && !isAssigned && (
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action trigger */}
                      <button
                        type="button"
                        onClick={() => onSelectBooking(b)}
                        className="w-full py-1 text-center text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] border-t border-[var(--border)] pt-2"
                      >
                        Open Full Reservation Details →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OWNER OVERRIDE WARNING MODAL */}
      {overrideWarningModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-[var(--surface)] border border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Studio Owner Capacity Override
              </div>
              <h3 className="font-serif text-xl font-bold text-[var(--text)]">
                Date is at Maximum Capacity ({selectedDayCapacity.bookedCount}/{selectedDayCapacity.maxCapacity})
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                The standard production crew limit for <strong className="text-[var(--text)]">{selectedDayStr}</strong> has been reached. As <strong className="text-[var(--gold)]">Studio Owner</strong>, you have exclusive authority to override this limit.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              ⚠️ This action will dispatch an emergency auxiliary camera crew and will be recorded in the official audit activity log.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOverrideWarningModal(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOverrideAndOpenModal}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-600 shadow-sm"
              >
                Confirm Override as Owner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT EVENT CREATION MODAL */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">
                  Direct Studio Reservation
                </span>
                <h3 className="font-serif text-xl font-bold text-[var(--text)]">
                  Add Event for {selectedDayStr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">Client / Couple Name *</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Bethlehem & Yonas"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">Telegram Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">@</span>
                    <input
                      type="text"
                      value={newClientTelegram}
                      onChange={(e) => setNewClientTelegram(e.target.value)}
                      placeholder="username"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">Package</label>
                  <select
                    value={newPackageId}
                    onChange={(e) => setNewPackageId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)]"
                  >
                    {managedPackages.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[var(--surface)] text-[var(--text)]">
                        {p.name} ({p.priceDisplay})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">Session Period</label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)]"
                  >
                    <option value="Full Day (All Day & Evening)" className="bg-[var(--surface)] text-[var(--text)]">Full Day (All Day & Evening)</option>
                    <option value="Morning (8:00 AM - 12:00 PM)" className="bg-[var(--surface)] text-[var(--text)]">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 5:00 PM)" className="bg-[var(--surface)] text-[var(--text)]">Afternoon (1:00 PM - 5:00 PM)</option>
                    <option value="Evening Reception (5:00 PM - 11:00 PM)" className="bg-[var(--surface)] text-[var(--text)]">Evening Reception (5:00 PM - 11:00 PM)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">Venue / Hotel</label>
                  <input
                    type="text"
                    required
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="e.g. Skylight Hotel"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--gold)] text-black font-bold hover:opacity-90 shadow-md"
                >
                  Save Confirmed Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
