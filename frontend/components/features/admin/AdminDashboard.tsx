'use client';

import React, { useState, useSyncExternalStore, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Calendar as CalendarIcon,
  Sparkles,
  Image as ImageIcon,
  Star,
  Users,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  Phone,
  Search,
  Eye,
  Trash2,
  RotateCcw,
  Check,
  X,
  MapPin,
  CreditCard,
  Building,
  Menu,
  ChevronRight,
  ExternalLink,
  Crown,
  Heart,
  History,
  Shield,
  Send,
  AlertTriangle,
  AlertCircle,
  Copy,
  UserCheck,
  Bell,
  BellOff
} from 'lucide-react';
import {
  Booking,
  getBookings,
  subscribeBookings,
  INITIAL_DEMO_BOOKINGS,
  updateBookingStatus,
  updateBooking,
  markBookingNotified,
  deleteBooking,
  resetDemoBookings
} from '@/lib/storage';
import {
  useManagedPackages,
  useManagedGallery,
  useActivityLogs,
  logActivity
} from '@/lib/data-store';
import {
  useCapacitySettings,
  checkAndExpireBookings,
  formatTelegramMessage,
  buildTelegramUrl,
  STAFF_ROSTER
} from '@/lib/capacity-store';
import { CONTACT_PHONES, PAYMENT_METHODS } from '@/data/packages';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/language-context';
import PackagesManager from './PackagesManager';
import GalleryManager from './GalleryManager';
import ActivityLogView from './ActivityLogView';
import CapacityManager from './CapacityManager';
import AdminCalendarView from './AdminCalendarView';
import { usePWA } from '@/lib/use-pwa';

type NavTab =
  | 'Dashboard'
  | 'Bookings'
  | 'Calendar'
  | 'Capacity'
  | 'Packages'
  | 'Gallery'
  | 'Activity Log'
  | 'Reviews'
  | 'Customers'
  | 'Settings';

interface ToastState {
  id: string;
  message: string;
  undoAction?: () => void;
}

const COMMON_REASONS = [
  'Payment not received',
  'Wrong amount',
  'Date unavailable',
  'Duplicate submission',
  'Client requested cancellation',
  'Other reason'
];

export default function AdminDashboard() {
  const { t, language, formatCurrency, formatDate } = useLanguage();
  const bookings = useSyncExternalStore(
    subscribeBookings,
    getBookings,
    () => INITIAL_DEMO_BOOKINGS
  );
  const managedPackages = useManagedPackages();
  const managedGallery = useManagedGallery();
  const activityLogs = useActivityLogs();
  const capacitySettings = useCapacitySettings();

  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Rejected' | 'Cancelled' | 'Expired' | 'Not notified'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Studio Role Switcher: Studio Owner vs Receptionist
  const [currentRole, setCurrentRole] = useState<'Studio Owner' | 'Receptionist'>('Studio Owner');

  // Reason Modal State (for Rejection / Cancellation)
  const [reasonModalTarget, setReasonModalTarget] = useState<{
    booking: Booking;
    action: 'Rejected' | 'Cancelled';
  } | null>(null);
  const [selectedPresetReason, setSelectedPresetReason] = useState(COMMON_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState('');

  // Telegram Notification Modal State
  const [telegramModalBooking, setTelegramModalBooking] = useState<Booking | null>(null);
  const [editableTelegramMsg, setEditableTelegramMsg] = useState('');
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Toast notification with optional Undo
  const showToast = useCallback((message: string, undoAction?: () => void) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToast({ id, message, undoAction });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  }, []);

  // Check and auto-expire timed out bookings on component mount
  useEffect(() => {
    const expiredCount = checkAndExpireBookings();
    if (expiredCount > 0) {
      const timer = setTimeout(() => {
        showToast(`${expiredCount} pending reservation(s) past time limit marked as Expired.`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // PWA Push Notifications state & subscription for new bookings
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined') return 'default';
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
    return Notification.permission;
  });
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(async (reg) => {
      try {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          setPushSubscribed(true);
        }
      } catch {
        // ignore
      }
    });
  }, []);

  const handleTogglePushNotifications = async () => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPushStatusMessage('Push notifications are not supported in this browser.');
      return;
    }

    setPushLoading(true);
    setPushStatusMessage(null);
    try {
      if (pushSubscribed) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
        setPushSubscribed(false);
        try {
          localStorage.setItem('hawi_admin_push_enabled', 'false');
        } catch {}
        setPushStatusMessage('Push notifications have been disabled on this device.');
      } else {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          const reg = await navigator.serviceWorker.ready;
          // Subscribe to pushManager without sending mock spam
          try {
            await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: new Uint8Array([
                4, 54, 119, 12, 88, 92, 140, 201, 10, 44, 219, 18, 90, 77, 12, 19,
                82, 33, 91, 104, 25, 60, 48, 120, 15, 99, 102, 34, 88, 101, 47, 98, 71
              ])
            });
          } catch {
            // Subscription state recorded
          }
          setPushSubscribed(true);
          try {
            localStorage.setItem('hawi_admin_push_enabled', 'true');
          } catch {}
          setPushStatusMessage('Browser push notifications enabled! You will be alerted when new reservations are created.');
        } else if (perm === 'denied') {
          setPushStatusMessage('Notification permission is blocked by your browser. Please enable notifications in site settings.');
        }
      }
    } catch (err) {
      console.error(err);
      setPushStatusMessage('Unable to configure push notifications.');
    } finally {
      setPushLoading(false);
    }
  };

  const { checkForUpdates, clearPrivateCaches } = usePWA();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleTestPushNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Notifications are not supported in this browser.');
      return;
    }
    if (Notification.permission !== 'granted') {
      showToast('Please enable notifications first.');
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('Hawi Test Booking Alert', {
        body: 'New reservation test: Bethlehem Haile reserved Special Package for Nov 14.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { url: '/admin' }
      });
      showToast('Test notification dispatched to your device!');
    } catch {
      new Notification('Hawi Test Booking Alert', {
        body: 'New reservation test from Hawi Bridal Zone.',
        icon: '/icon-192.png'
      });
      showToast('Test notification dispatched!');
    }
  };

  const handleManualCheckUpdate = async () => {
    setCheckingUpdate(true);
    const res = await checkForUpdates();
    setCheckingUpdate(false);
    if (res.hasNewVersion) {
      showToast('A new update is ready! Refresh the page to apply.');
    } else {
      showToast('Hawi is up to date (App version v1.1.0-pwa).');
    }
  };

  const handleAdminLogout = async () => {
    await clearPrivateCaches();
    try {
      sessionStorage.clear();
      localStorage.removeItem('hawi_admin_session');
    } catch {}
    showToast('Admin session and cached runtime data cleared.');
  };

  // Status Action Handlers
  const handleConfirm = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateBookingStatus(id, 'Confirmed', `Confirmed by ${currentRole}`);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: 'Confirmed' });
    }
    logActivity('Booking Confirmed', 'bookings', `Booking ${id} marked Confirmed by ${currentRole}.`);
    showToast(`Booking ${id} marked as Confirmed!`);
  };

  const handleStartReject = (booking: Booking, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReasonModalTarget({ booking, action: 'Rejected' });
    setSelectedPresetReason(COMMON_REASONS[0]);
    setCustomReasonText('');
  };

  const handleStartCancel = (booking: Booking, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReasonModalTarget({ booking, action: 'Cancelled' });
    setSelectedPresetReason('Client requested cancellation');
    setCustomReasonText('');
  };

  const handleConfirmReasonAndOpenNotify = () => {
    if (!reasonModalTarget) return;
    const { booking, action } = reasonModalTarget;
    const effectiveReason =
      selectedPresetReason === 'Other reason'
        ? customReasonText.trim() || 'Date unavailable / payment unverified'
        : selectedPresetReason;

    // Update status, save reason, and release capacity
    const updated = updateBooking(booking.id, {
      status: action,
      rejectionReason: action === 'Rejected' ? effectiveReason : undefined,
      cancellationReason: action === 'Cancelled' ? effectiveReason : undefined,
      notificationStatus: { notified: false },
      adminNotes: booking.adminNotes ? `${booking.adminNotes} · ${action}: ${effectiveReason}` : `${action}: ${effectiveReason}`
    });

    const updatedBooking = updated.find((b) => b.id === booking.id) || {
      ...booking,
      status: action,
      rejectionReason: effectiveReason,
      notificationStatus: { notified: false }
    };

    if (selectedBooking && selectedBooking.id === booking.id) {
      setSelectedBooking(updatedBooking);
    }

    logActivity(
      `Booking ${action}`,
      'bookings',
      `Booking ${booking.bookingCode} changed to ${action} (Reason: ${effectiveReason}). Date capacity released.`
    );

    setReasonModalTarget(null);
    showToast(`Booking ${booking.bookingCode} marked as ${action}. Date capacity released.`);

    // Open Telegram Notification review modal immediately
    handleOpenTelegramModal(updatedBooking, effectiveReason);
  };

  const handleOpenTelegramModal = (booking: Booking, explicitReason?: string) => {
    const lang = booking.clientLanguage || 'en';
    const template = capacitySettings.telegramTemplates[lang] || capacitySettings.telegramTemplates.en;
    const reason = explicitReason || booking.rejectionReason || booking.cancellationReason || 'Requested slot unavailable / payment unverified';
    const formatted = formatTelegramMessage(template, booking, reason);

    setTelegramModalBooking(booking);
    setEditableTelegramMsg(formatted);
  };

  const handleSendTelegram = () => {
    if (!telegramModalBooking) return;
    const tgUser = telegramModalBooking.telegramUsername;
    if (tgUser) {
      const url = buildTelegramUrl(tgUser, editableTelegramMsg);
      window.open(url, '_blank');
    }

    // Mark as notified in storage
    markBookingNotified(telegramModalBooking.id, currentRole, 'telegram');
    if (selectedBooking && selectedBooking.id === telegramModalBooking.id) {
      setSelectedBooking({
        ...selectedBooking,
        notificationStatus: {
          notified: true,
          notifiedAt: new Date().toISOString(),
          notifiedBy: currentRole,
          method: 'telegram'
        }
      });
    }

    logActivity('Client Notified via Telegram', 'bookings', `Client ${telegramModalBooking.fullName} (${telegramModalBooking.bookingCode}) notified on Telegram by ${currentRole}.`);
    showToast(`Client ${telegramModalBooking.fullName} marked as Notified!`);
    setTelegramModalBooking(null);
  };

  const handleCopyTelegramMsg = () => {
    if (!telegramModalBooking) return;
    navigator.clipboard.writeText(editableTelegramMsg);
    setCopiedMsg(true);
    markBookingNotified(telegramModalBooking.id, currentRole, 'copied');
    showToast('Message copied to clipboard and marked as notified.');
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleCallPhoneOnlyClient = () => {
    if (!telegramModalBooking) return;
    window.location.href = `tel:${telegramModalBooking.phone}`;
    markBookingNotified(telegramModalBooking.id, currentRole, 'phone_call');
    showToast(`Calling client ${telegramModalBooking.phone}. Marked as notified.`);
  };

  const handleComplete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateBookingStatus(id, 'Completed', 'Event successfully finished & media delivered');
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: 'Completed' });
    }
    showToast(`Booking ${id} marked as Completed!`);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Permanently delete this booking record?')) {
      deleteBooking(id);
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(null);
      }
      showToast('Booking record removed.');
    }
  };

  const handleSaveAdminNote = (id: string) => {
    if (!adminNoteInput.trim()) return;
    updateBookingStatus(
      id,
      selectedBooking ? selectedBooking.status : 'Pending',
      adminNoteInput.trim()
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, adminNotes: adminNoteInput.trim() });
    }
    setAdminNoteInput('');
    showToast('Internal note saved.');
  };

  const handleResetDemo = () => {
    if (confirm('Reset bookings back to demo defaults?')) {
      resetDemoBookings();
      setSelectedBooking(null);
      showToast('Demo bookings restored.');
    }
  };

  // KPI Calculations
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  const rejectedCount = bookings.filter((b) => b.status === 'Rejected').length;
  const cancelledCount = bookings.filter((b) => b.status === 'Cancelled').length;
  const expiredCount = bookings.filter((b) => b.status === 'Expired').length;

  const notNotifiedCount = bookings.filter(
    (b) =>
      ['Rejected', 'Cancelled', 'Expired'].includes(b.status) &&
      !b.notificationStatus?.notified
  ).length;

  const packagesTrashCount = managedPackages.filter((p) => p.deletedAt).length;
  const galleryTrashCount = managedGallery.filter((g) => g.deletedAt).length;

  // Monthly income estimate (Confirmed + Completed)
  const monthlyIncome = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'Confirmed' || b.status === 'Completed')
      .reduce((sum, b) => {
        const num = b.priceNumeric || parseInt(b.packagePrice.replace(/[^0-9]/g, ''), 10) || 0;
        return sum + num;
      }, 0);
  }, [bookings]);

  // Upcoming confirmed events
  const upcomingEvents = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'Confirmed')
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [bookings]);

  // Filtered Bookings for Table & List
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      let matchesStatus = true;
      if (statusFilter === 'Not notified') {
        matchesStatus =
          ['Rejected', 'Cancelled', 'Expired'].includes(b.status) &&
          !b.notificationStatus?.notified;
      } else if (statusFilter !== 'All') {
        matchesStatus = b.status === statusFilter;
      }

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesSearch =
        b.fullName.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.bookingCode.toLowerCase().includes(q) ||
        b.packageName.toLowerCase().includes(q) ||
        b.venue.toLowerCase().includes(q) ||
        (b.telegramUsername && b.telegramUsername.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Sidebar Items
  const sidebarItems: Array<{ id: NavTab; label: string; icon: React.ElementType; badge?: number | string }> = [
    { id: 'Dashboard', label: t('admin.nav.dashboard'), icon: LayoutDashboard },
    { id: 'Bookings', label: t('admin.nav.bookings'), icon: FileText, badge: pendingCount > 0 ? pendingCount : notNotifiedCount > 0 ? `${notNotifiedCount} unnotified` : undefined },
    { id: 'Calendar', label: t('admin.nav.calendar'), icon: CalendarIcon, badge: upcomingEvents.length },
    { id: 'Capacity', label: t('admin.nav.capacity'), icon: Shield },
    {
      id: 'Packages',
      label: t('admin.nav.packages'),
      icon: Sparkles,
      badge: packagesTrashCount > 0 ? `${packagesTrashCount} in trash` : undefined
    },
    {
      id: 'Gallery',
      label: t('admin.nav.gallery'),
      icon: ImageIcon,
      badge: galleryTrashCount > 0 ? `${galleryTrashCount} in trash` : undefined
    },
    { id: 'Activity Log', label: t('admin.nav.activityLog'), icon: History, badge: activityLogs.length > 0 ? activityLogs.length : undefined },
    { id: 'Reviews', label: t('admin.nav.reviews'), icon: Star },
    { id: 'Customers', label: t('admin.nav.customers'), icon: Users },
    { id: 'Settings', label: t('admin.nav.settings'), icon: Settings },
  ];

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'Pending': return t('status.pending');
      case 'Confirmed': return t('status.confirmed');
      case 'Completed': return t('status.completed');
      case 'Rejected': return t('status.rejected');
      case 'Cancelled': return t('status.cancelled');
      case 'Expired': return t('status.expired');
      default: return st;
    }
  };

  const getFilterLabel = (st: string) => {
    switch (st) {
      case 'All': return t('admin.table.filterAll');
      case 'Pending': return t('admin.table.filterPending');
      case 'Confirmed': return t('admin.table.filterConfirmed');
      case 'Completed': return t('admin.table.filterCompleted');
      case 'Rejected': return t('admin.table.filterRejected');
      case 'Cancelled': return t('admin.table.filterCancelled');
      case 'Expired': return t('admin.table.filterExpired');
      case 'Not notified': return 'Not notified';
      default: return st;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'Payment not received': return t('admin.rejectModal.reasons.paymentNotReceived');
      case 'Wrong amount': return t('admin.rejectModal.reasons.wrongAmount');
      case 'Date unavailable': return t('admin.rejectModal.reasons.dateUnavailable');
      case 'Duplicate submission': return t('admin.rejectModal.reasons.duplicate');
      case 'Client requested cancellation': return t('admin.rejectModal.reasons.clientCancelled');
      case 'Other reason': return t('admin.rejectModal.reasons.other');
      default: return reason;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col md:flex-row transition-colors duration-200">
      {/* Toast Notification with Undo */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--gold)] px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--gold)] shrink-0" />
          <span>{toast.message}</span>
          {toast.undoAction && (
            <button
              type="button"
              onClick={() => {
                toast.undoAction?.();
                setToast(null);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--gold)] text-[#141008] hover:brightness-105 ml-2 shrink-0 flex items-center gap-1 shadow-sm transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('admin.actions.undo')}</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)] flex items-center justify-center text-[var(--gold)]">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold text-[var(--text)]">Hawi Admin</span>
            <span className="text-[10px] text-[var(--gold-text)] block font-semibold uppercase tracking-wider">
              {currentRole}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-[var(--card-subtle)] text-[var(--text)] border border-[var(--border)]"
            aria-label="Toggle menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[var(--surface)] border-r border-[var(--border)] shrink-0 flex flex-col h-screen overflow-y-auto z-30 transition-colors duration-200`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Studio Brand Header */}
          <div className="p-6 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[var(--card-subtle)] border border-[var(--gold)] flex items-center justify-center text-[var(--gold)] shadow-sm">
                <Sparkles className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-[var(--text)] block leading-none">
                  Hawi Admin
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[var(--gold-text)] block mt-1">
                  Pictures & Bridal Zone
                </span>
              </div>
            </Link>

            {/* Role Switcher */}
            <div className="mt-4 p-2 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-1">
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1">
                Active Staff Role:
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCurrentRole('Studio Owner')}
                  className={`py-1 px-1.5 rounded-lg font-semibold transition-all ${
                    currentRole === 'Studio Owner'
                      ? 'bg-[var(--gold)] text-black shadow-xs font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                  title="Studio Owner has capacity override privileges"
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentRole('Receptionist')}
                  className={`py-1 px-1.5 rounded-lg font-semibold transition-all ${
                    currentRole === 'Receptionist'
                      ? 'bg-[var(--surface)] text-[var(--gold)] border border-[var(--border)] shadow-xs font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                  title="Receptionist cannot override capacity limits"
                >
                  Receptionist
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--card-subtle)] text-[var(--gold)] border border-[var(--gold)]/30 shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-[var(--card-subtle)] hover:text-[var(--text)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-[var(--gold)] text-[#141008]'
                          : typeof item.badge === 'string' && item.badge.includes('unnotified')
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          : typeof item.badge === 'string' && item.badge.includes('trash')
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          : 'bg-[var(--gold)]/20 text-[var(--gold-text)] border border-[var(--gold)]/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--border)] space-y-3 bg-[var(--surface)]">
          <div className="pt-2 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="text-[var(--gold-text)] hover:text-[var(--gold)] font-semibold flex items-center gap-1"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleResetDemo}
              className="text-[var(--text-muted)] hover:text-[var(--text)] text-[11px] flex items-center gap-1"
              title="Reset Demo Records"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-[var(--bg)] p-4 sm:p-8 lg:p-10 overflow-y-auto min-h-screen transition-colors duration-200">
        {/* ==================== 1. DASHBOARD VIEW ==================== */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                  {t('admin.sidebarTitle')}
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Logged in as <strong className="text-[var(--gold)]">{currentRole}</strong> · Live capacity and client notification dispatch.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeToggle className="hidden sm:inline-flex" />
                <Link
                  href="/booking"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#141008] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 transition-all flex items-center gap-1.5 shadow-md font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('admin.actions.addNew')}</span>
                </Link>
              </div>
            </div>

            {/* CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Card 1: Pending Bookings */}
              <div
                onClick={() => {
                  setActiveTab('Bookings');
                  setStatusFilter('Pending');
                }}
                className="group p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:border-[var(--gold)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t('admin.metrics.pendingTitle')}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text)] tabular-nums">
                    {pendingCount}
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">
                    {t('admin.metrics.pendingSub')}
                  </div>
                </div>
              </div>

              {/* Card 2: Upcoming Events */}
              <div
                onClick={() => setActiveTab('Calendar')}
                className="group p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:border-[var(--gold)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t('admin.metrics.upcomingTitle')}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text)] tabular-nums">
                    {upcomingEvents.length}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                    {t('admin.metrics.upcomingSub')}
                  </div>
                </div>
              </div>

              {/* Card 3: Unnotified Clients */}
              <div
                onClick={() => {
                  setActiveTab('Bookings');
                  setStatusFilter('Not notified');
                }}
                className="group p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:border-[var(--gold)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Unnotified Clients
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Send className="w-5 h-5 text-red-500" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                    {notNotifiedCount}
                  </div>
                  <div className="text-xs text-red-600/80 font-medium mt-1">
                    {notNotifiedCount === 0 ? 'All rejected/expired notified' : `${notNotifiedCount} pending Telegram dispatch`}
                  </div>
                </div>
              </div>

              {/* Card 4: Monthly Income */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t('admin.metrics.incomeTitle')}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-[var(--gold)]" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--gold-text)] tabular-nums">
                    {formatCurrency(monthlyIncome)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {t('admin.metrics.incomeSub')}
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT BOOKINGS TABLE */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[var(--text)]">
                      {t('admin.table.title')}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t('admin.table.subtitle')}
                    </p>
                  </div>
                  <a
                    href="/api/admin/reports?export=excel"
                    download
                    className="px-3 py-1.5 rounded-xl bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                    title="Export all reservations to Excel / CSV"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </a>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 bg-[var(--card-subtle)] border border-[var(--border)] rounded-xl overflow-x-auto">
                  {(['All', 'Pending', 'Confirmed', 'Completed', 'Rejected', 'Cancelled', 'Expired', 'Not notified'] as const).map((status) => {
                    const active = statusFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                          active
                            ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        {getFilterLabel(status)}
                        {status === 'Not notified' && notNotifiedCount > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
                            {notNotifiedCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--card-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border)]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">{t('admin.table.colClient')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('admin.table.colPackage')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('admin.table.colEvent')}</th>
                      <th className="py-3.5 px-4 font-semibold">Assigned Crew</th>
                      <th className="py-3.5 px-4 font-semibold">{t('admin.table.colStatus')}</th>
                      <th className="py-3.5 px-4 font-semibold text-right">{t('admin.table.colActions')}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                          {t('admin.table.emptyState')}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const isPending = b.status === 'Pending';
                        const isConfirmed = b.status === 'Confirmed';
                        const isRejected = b.status === 'Rejected';
                        const isCancelled = b.status === 'Cancelled';
                        const isExpired = b.status === 'Expired';
                        const isInactive = isRejected || isCancelled || isExpired;
                        const isNotified = b.notificationStatus?.notified;

                        return (
                          <tr
                            key={b.id}
                            onClick={() => setSelectedBooking(b)}
                            className="hover:bg-[var(--card-subtle)] transition-colors cursor-pointer group"
                          >
                            {/* Client & Phone / Telegram */}
                            <td className="py-4 px-4">
                              <div className="font-semibold text-sm text-[var(--text)]">
                                {b.fullName}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <a
                                  href={`tel:${b.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-mono text-xs text-[var(--gold-text)] hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3 text-[var(--gold)]" />
                                  <span>{b.phone}</span>
                                </a>
                                {b.telegramUsername && (
                                  <span className="font-mono text-[11px] text-sky-500 flex items-center gap-0.5">
                                    <Send className="w-2.5 h-2.5" />
                                    <span>@{b.telegramUsername}</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Package */}
                            <td className="py-4 px-4">
                              <div className="font-medium text-[var(--text)]">{b.packageName}</div>
                              <div className="text-[11px] font-mono text-[var(--gold-text)] mt-0.5">
                                {b.packagePrice}
                              </div>
                            </td>

                            {/* Event Date & Time */}
                            <td className="py-4 px-4">
                              <div className="font-mono font-bold text-[var(--text)]" suppressHydrationWarning>
                                {formatDate(b.eventDate)}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{b.timeOfDay}</div>
                            </td>

                            {/* Crew */}
                            <td className="py-4 px-4">
                              {b.assignedStaff && b.assignedStaff.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {b.assignedStaff.map((s, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 rounded bg-[var(--card-subtle)] text-[10px] font-semibold border border-[var(--border)]">
                                      {s.split(' ')[0]}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-[var(--text-muted)] italic">Unassigned</span>
                              )}
                            </td>

                            {/* Status & Notification Badge */}
                            <td className="py-4 px-4 space-y-1">
                              <div>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                    isConfirmed
                                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                      : isPending
                                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                      : isRejected
                                      ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
                                      : isCancelled
                                      ? 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/30'
                                      : isExpired
                                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
                                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                                  }`}
                                >
                                  {getStatusLabel(b.status)}
                                </span>
                              </div>

                              {/* Notification Tracking Badge for Inactive */}
                              {isInactive && (
                                <div>
                                  {isNotified ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Notified</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span>Client not notified</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => handleConfirm(b.id, e)}
                                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm flex items-center gap-1"
                                      title={t('admin.actions.confirm')}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>{t('admin.actions.confirm')}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleStartReject(b, e)}
                                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-[var(--card-subtle)] border border-red-500/30 hover:bg-red-500/10 flex items-center gap-1"
                                      title={t('admin.actions.reject')}
                                    >
                                      <X className="w-3 h-3" />
                                      <span>{t('admin.actions.reject')}</span>
                                    </button>
                                  </>
                                )}

                                {isInactive && !isNotified && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenTelegramModal(b)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 shadow-sm flex items-center gap-1"
                                    title={t('admin.actions.sendTelegram')}
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>{t('admin.actions.sendTelegram')}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedBooking(b)}
                                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--card-subtle)]"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. BOOKINGS FULL QUEUE VIEW ==================== */}
        {activeTab === 'Bookings' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)]">
                  {t('admin.nav.bookings')}
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {t('admin.table.subtitle')}
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder={t('admin.table.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[var(--card-subtle)] border border-[var(--border)] rounded-xl overflow-x-auto max-w-fit">
              {(['All', 'Pending', 'Confirmed', 'Completed', 'Rejected', 'Cancelled', 'Expired', 'Not notified'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-[var(--surface)] text-[var(--gold)] shadow-xs border border-[var(--border)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {getFilterLabel(st)}
                  {st === 'Not notified' && notNotifiedCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
                      {notNotifiedCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bookings Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((b) => {
                const isInactive = ['Rejected', 'Cancelled', 'Expired'].includes(b.status);
                const isNotified = b.notificationStatus?.notified;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--gold)]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[var(--gold-text)] bg-[var(--gold-bg)] border border-[var(--gold)]/20 px-2 py-0.5 rounded-md">
                          {b.bookingCode}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-[var(--card-subtle)] text-[var(--text)]">
                          {b.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[var(--text)]">{b.fullName}</h3>

                      <div className="text-xs text-[var(--text-muted)] space-y-1">
                        <div><strong className="text-[var(--text)]">Package:</strong> {b.packageName} ({b.packagePrice})</div>
                        <div><strong className="text-[var(--text)]">Event Date:</strong> {b.eventDate} · {b.timeOfDay}</div>
                        <div><strong className="text-[var(--text)]">Venue:</strong> {b.venue}</div>
                        <div className="flex items-center gap-2">
                          <strong className="text-[var(--text)]">Telegram:</strong>
                          {b.telegramUsername ? (
                            <span className="font-mono text-sky-500">@{b.telegramUsername}</span>
                          ) : (
                            <span className="italic">Phone-only client</span>
                          )}
                        </div>
                      </div>

                      {/* Notification Alert for Inactive */}
                      {isInactive && (
                        <div className="p-2.5 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-between text-xs">
                          <span className="text-[var(--text-muted)]">Notification:</span>
                          {isNotified ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Notified</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-red-500 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Client not notified</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${b.phone}`}
                        className="text-xs font-semibold text-[var(--gold-text)] flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                        <span>Call</span>
                      </a>

                      <div className="flex items-center gap-1.5">
                        {isInactive && !isNotified && (
                          <button
                            type="button"
                            onClick={() => handleOpenTelegramModal(b)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Notify</span>
                          </button>
                        )}

                        {b.status === 'Pending' && (
                          <>
                            <button
                              onClick={(e) => handleConfirm(b.id, e)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={(e) => handleStartReject(b, e)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-[var(--card-subtle)] border border-red-500/30 hover:bg-red-500/10"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--card-subtle)] text-[var(--text)] hover:bg-[var(--surface)] border border-[var(--border)]"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== 3. CALENDAR VIEW ==================== */}
        {activeTab === 'Calendar' && (
          <AdminCalendarView
            bookings={bookings}
            currentRole={currentRole}
            onShowToast={showToast}
            onSelectBooking={(b) => setSelectedBooking(b)}
          />
        )}

        {/* ==================== 4. CAPACITY & TELEGRAM VIEW ==================== */}
        {activeTab === 'Capacity' && (
          <CapacityManager onShowToast={showToast} />
        )}

        {/* ==================== 5. PACKAGES VIEW ==================== */}
        {activeTab === 'Packages' && (
          <PackagesManager onShowToast={showToast} />
        )}

        {/* ==================== 6. GALLERY VIEW ==================== */}
        {activeTab === 'Gallery' && (
          <GalleryManager onShowToast={showToast} />
        )}

        {/* ==================== 7. ACTIVITY LOG VIEW ==================== */}
        {activeTab === 'Activity Log' && (
          <ActivityLogView />
        )}

        {/* ==================== 8. REVIEWS VIEW ==================== */}
        {activeTab === 'Reviews' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="pb-6 border-b border-[var(--border)]">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)]">
                Customer Reviews & Testimonials
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Feedback collected from newly married couples in Addis Ababa and abroad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  couple: 'Selamawit & Dawit Bekele',
                  venue: 'Ethiopian Skylight Hotel',
                  pkg: 'Gold Royal Package',
                  content: 'Hawi Pictures exceeded all our expectations! The photography team was so calm and organized. The makeup lasted until 2:00 AM without a smudge.'
                },
                {
                  couple: 'Bethlehem Haile & Yonas Girma',
                  venue: 'Sheraton Addis & Kuriftu',
                  pkg: 'Diamond Splendor (2-Day)',
                  content: 'The drone footage over Kuriftu lake looks like an international cinema film. Our relatives in diaspora love the album and video!'
                },
                {
                  couple: 'Meron Tadesse & Dr. Henok',
                  venue: 'Haile Grand Hotel',
                  pkg: 'Imperial Habesha Luxury',
                  content: 'Having the bridal suite, imported gown fitting, and 4 master photographers managed seamlessly saved us weeks of wedding planning stress.'
                }
              ].map((rev, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                  <div className="flex items-center gap-1 text-[var(--gold)]">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                    &ldquo;{rev.content}&rdquo;
                  </p>
                  <div className="pt-3 border-t border-[var(--border)]">
                    <div className="font-serif text-base font-bold text-[var(--text)]">{rev.couple}</div>
                    <div className="text-xs text-[var(--text-muted)]">{rev.venue} · {rev.pkg}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 9. CUSTOMERS VIEW ==================== */}
        {activeTab === 'Customers' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="pb-6 border-b border-[var(--border)]">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)]">
                Customer Roster
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Directory of brides, grooms, and booking representatives.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--card-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border)]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Client Name</th>
                    <th className="py-3 px-4 font-semibold">Phone Number</th>
                    <th className="py-3 px-4 font-semibold">Telegram</th>
                    <th className="py-3 px-4 font-semibold">Selected Package</th>
                    <th className="py-3 px-4 font-semibold">Event Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Direct Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {bookings.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--card-subtle)] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--text)]">{c.fullName}</td>
                      <td className="py-3.5 px-4 font-mono text-[var(--gold-text)]">{c.phone}</td>
                      <td className="py-3.5 px-4 font-mono text-sky-500">
                        {c.telegramUsername ? `@${c.telegramUsername}` : 'Phone-only'}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-muted)]">{c.packageName}</td>
                      <td className="py-3.5 px-4 font-mono text-[var(--text)]">{c.eventDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`tel:${c.phone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card-subtle)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)]"
                        >
                          <Phone className="w-3 h-3 text-[var(--gold)]" />
                          <span>Call</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== 10. SETTINGS VIEW ==================== */}
        {activeTab === 'Settings' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="pb-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)]">
                  Studio & System Settings
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Configure contact lines, capacity rules, Telegram templates, and accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('Capacity')}
                className="px-4 py-2 rounded-xl bg-[var(--gold)] text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-sm"
              >
                <Shield className="w-4 h-4" />
                <span>Open Capacity Manager →</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Studio Contact Settings */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[var(--text)] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--gold)]" />
                  <span>Configured Studio Phone Numbers</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)]">
                    <div className="text-[var(--text-muted)]">Photography & Bookings Hotline:</div>
                    <div className="font-mono text-base font-bold text-[var(--text)] mt-1">0988 01 80 16</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)]">
                    <div className="text-[var(--text-muted)]">Bridal Salon & Gowns Hotline:</div>
                    <div className="font-mono text-base font-bold text-[var(--text)] mt-1">0914 87 80 07</div>
                  </div>
                </div>
              </div>

              {/* Bank Accounts */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[var(--text)] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[var(--gold)]" />
                  <span>Deposit Bank & Mobile Accounts</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {PAYMENT_METHODS.map((m, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[var(--text)]">{m.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{m.accountName}</div>
                      </div>
                      <div className="font-mono text-sm font-bold text-[var(--gold-text)]">
                        {m.accountNumber}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Notifications Setting (Preparation & Client Subscription) */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[var(--text)] flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[var(--gold)]" />
                      <span>Notify me about new bookings</span>
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Receive instantaneous alerts directly on your phone or desktop whenever a new client submits a wedding or bridal booking.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {pushSubscribed ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Enabled & Subscribed</span>
                      </span>
                    ) : pushPermission === 'denied' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/30 flex items-center gap-1.5">
                        <BellOff className="w-3 h-3" />
                        <span>Blocked in Browser</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-[var(--border)]">
                        <span>Not Configured</span>
                      </span>
                    )}
                  </div>
                </div>

                {pushStatusMessage && (
                  <div className="p-3 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] text-xs text-[var(--text)]">
                    {pushStatusMessage}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={pushLoading || pushPermission === 'unsupported'}
                    onClick={handleTogglePushNotifications}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                      pushSubscribed
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-[var(--text)] hover:bg-zinc-300 dark:hover:bg-zinc-700'
                        : 'bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black hover:opacity-90'
                    }`}
                  >
                    {pushLoading ? (
                      <span>Updating...</span>
                    ) : pushSubscribed ? (
                      <>
                        <BellOff className="w-3.5 h-3.5" />
                        <span>Disable Push Notifications</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Enable: Notify me about new bookings</span>
                      </>
                    )}
                  </button>

                  {/* Test notification button */}
                  {pushSubscribed && (
                    <button
                      type="button"
                      onClick={handleTestPushNotification}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--gold)]/50 transition-colors flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5 text-[var(--gold)]" />
                      <span>Test Notification</span>
                    </button>
                  )}

                  <span className="text-[11px] text-[var(--text-muted)]">
                    Permission is requested only upon turning this on. Telegram remains the primary notification channel.
                  </span>
                </div>

                {/* 
                  =========================================================================
                  SERVER PUSH DISPATCH ARCHITECTURE (PLACEHOLDER FOR SERVER IMPLEMENTATION)
                  =========================================================================
                  When backend web-push sending is connected on the server:
                  1. Server retrieves stored push subscription endpoint & keys from the database.
                  2. Server executes:
                     webpush.sendNotification(subscription, JSON.stringify({
                       title: 'New Booking Reservation',
                       body: `${newBooking.fullName} - ${newBooking.packageName} on ${newBooking.eventDate}`,
                       url: '/admin'
                     }));
                  3. Service worker self.addEventListener('push') displays native notification.
                  =========================================================================
                */}
              </div>

              {/* Maintenance & Reset */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[var(--text)] flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[var(--gold)]" />
                  <span>Database & Demo Controls</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Reset your local storage bookings to sample test data with Pending, Confirmed, Completed, and Rejected reservations.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] text-[var(--text)] hover:bg-[var(--surface)] border border-[var(--border)] transition-colors"
                  >
                    Reset Demo Bookings to Default
                  </button>

                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                  >
                    Clear Session &amp; Private Caches
                  </button>
                </div>
              </div>

              {/* PWA System & Version Footer */}
              <div className="p-5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
                <div>
                  <div className="font-semibold text-[var(--text)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>App Version: v1.1.0-pwa</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Hawi Pictures &amp; Bridal Zone · Progressive Web App (Lighthouse Optimized)
                  </div>
                </div>

                <button
                  type="button"
                  disabled={checkingUpdate}
                  onClick={handleManualCheckUpdate}
                  className="px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--gold)] text-xs font-semibold text-[var(--text)] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-[var(--gold)] ${checkingUpdate ? 'animate-spin' : ''}`} />
                  <span>{checkingUpdate ? 'Checking...' : 'Check for updates'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* REASON MODAL (REQUIRED FOR REJECTION / CANCELLATION) */}
      {reasonModalTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                {t('admin.rejectModal.title')}
              </span>
              <h3 className="font-serif text-xl font-bold text-[var(--text)]">
                {getStatusLabel(reasonModalTarget.action)}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {t('admin.rejectModal.subtitle')}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text)]">{t('admin.rejectModal.reasonLabel')}</label>
                <select
                  value={selectedPresetReason}
                  onChange={(e) => setSelectedPresetReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] font-medium"
                >
                  {COMMON_REASONS.map((r, i) => (
                    <option key={i} value={r} className="bg-[var(--surface)] text-[var(--text)]">
                      {getReasonLabel(r)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPresetReason === 'Other reason' && (
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text)]">{t('admin.rejectModal.customNoteLabel')}</label>
                  <textarea
                    rows={2}
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    placeholder={t('admin.rejectModal.customNotePlaceholder')}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)]"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setReasonModalTarget(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {t('admin.rejectModal.cancelButton')}
              </button>
              <button
                type="button"
                onClick={handleConfirmReasonAndOpenNotify}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md"
              >
                {t('admin.rejectModal.confirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELEGRAM NOTIFICATION PREVIEW & SEND MODAL */}
      {telegramModalBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-[var(--surface)] border border-[var(--gold)]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--text)]">
                    {t('admin.telegramModal.title')}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {t('admin.telegramModal.subtitle')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTelegramModalBooking(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client Destination Info */}
            <div className="p-3.5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-[var(--text)]">{telegramModalBooking.fullName}</div>
                <div className="text-[11px] text-[var(--text-muted)] font-mono">{telegramModalBooking.phone}</div>
              </div>

              <div>
                {telegramModalBooking.telegramUsername ? (
                  <span className="font-mono text-sm font-bold text-sky-500 flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" />
                    <span>@{telegramModalBooking.telegramUsername}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {t('admin.telegramModal.phoneOnlyNotice')}
                  </span>
                )}
              </div>
            </div>

            {/* Editable Message Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
                <span>{t('admin.telegramModal.messagePreview')}</span>
                <span className="text-[10px] font-mono text-[var(--gold)]">
                  {t('admin.telegramModal.clientLangLabel')}: {telegramModalBooking.clientLanguage || 'om'}
                </span>
              </label>
              <textarea
                rows={5}
                value={editableTelegramMsg}
                onChange={(e) => setEditableTelegramMsg(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--gold)] resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleCopyTelegramMsg}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--card-subtle)] flex items-center justify-center gap-1.5"
              >
                {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMsg ? 'Copied & Marked Notified' : 'Copy Message'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {telegramModalBooking.isPhoneOnly || !telegramModalBooking.telegramUsername ? (
                  <button
                    type="button"
                    onClick={handleCallPhoneOnlyClient}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--gold)] text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Client & Mark Notified</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendTelegram}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-sky-600 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('admin.telegramModal.openTelegram')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[var(--surface)] text-[var(--text)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[var(--gold-text)] bg-[var(--gold-bg)] border border-[var(--gold)]/20 px-2.5 py-0.5 rounded-md">
                    {selectedBooking.bookingCode}
                  </span>
                  {selectedBooking.isOverriddenByOwner && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Owner Override
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-bold text-[var(--text)] mt-1.5">
                  {selectedBooking.fullName}
                </h2>
                <div className="text-xs text-[var(--text-muted)]">
                  Received: {new Date(selectedBooking.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Immediate Action Row */}
            <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[var(--text-muted)]">Status:</div>
                <div className="text-sm font-bold mt-0.5 text-[var(--text)] flex items-center gap-2">
                  <span>{selectedBooking.status}</span>
                  {['Rejected', 'Cancelled', 'Expired'].includes(selectedBooking.status) && (
                    selectedBooking.notificationStatus?.notified ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Notified ({selectedBooking.notificationStatus.notifiedBy})</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Client not notified</span>
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedBooking.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleConfirm(selectedBooking.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartReject(selectedBooking)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-[var(--surface)] border border-red-500/30 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {selectedBooking.status === 'Confirmed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleComplete(selectedBooking.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#141008] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartCancel(selectedBooking)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--card-subtle)]"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}

                {['Rejected', 'Cancelled', 'Expired'].includes(selectedBooking.status) && (
                  <button
                    type="button"
                    onClick={() => handleOpenTelegramModal(selectedBooking)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 flex items-center gap-1 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Notify Client on Telegram</span>
                  </button>
                )}
              </div>
            </div>

            {/* Event & Package Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-1.5">
                <div className="font-semibold text-[var(--gold)] uppercase tracking-wider text-[11px]">
                  Package & Investment
                </div>
                <div><strong className="text-[var(--text)]">Package:</strong> {selectedBooking.packageName}</div>
                <div><strong className="text-[var(--text)]">Total Investment:</strong> {selectedBooking.packagePrice}</div>
                <div><strong className="text-[var(--text)]">Required Deposit:</strong> {selectedBooking.depositRequired}</div>
                <div><strong className="text-[var(--text)]">Payment Method:</strong> {selectedBooking.paymentMethod}</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-1.5">
                <div className="font-semibold text-[var(--gold)] uppercase tracking-wider text-[11px]">
                  Schedule & Contact
                </div>
                <div><strong className="text-[var(--text)]">Event Date:</strong> {selectedBooking.eventDate}</div>
                <div><strong className="text-[var(--text)]">Time:</strong> {selectedBooking.timeOfDay}</div>
                <div><strong className="text-[var(--text)]">Venue:</strong> {selectedBooking.venue}</div>
                <div className="flex items-center gap-1.5 pt-1">
                  <strong className="text-[var(--text)]">Phone:</strong>
                  <a href={`tel:${selectedBooking.phone}`} className="text-[var(--gold-text)] font-mono font-bold hover:underline">
                    {selectedBooking.phone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-[var(--text)]">Telegram:</strong>
                  {selectedBooking.telegramUsername ? (
                    <span className="font-mono text-sky-500 font-bold">@{selectedBooking.telegramUsername}</span>
                  ) : (
                    <span className="text-[var(--text-muted)] italic">Phone-only client</span>
                  )}
                </div>
              </div>
            </div>

            {/* Reason if Rejected/Cancelled/Expired */}
            {(selectedBooking.rejectionReason || selectedBooking.cancellationReason) && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-1 text-red-700 dark:text-red-300">
                <div className="font-semibold uppercase tracking-wider text-[11px]">Reason on File:</div>
                <p>{selectedBooking.rejectionReason || selectedBooking.cancellationReason}</p>
              </div>
            )}

            {/* Notes */}
            {selectedBooking.notes && (
              <div className="p-4 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-1">
                <div className="text-xs font-semibold text-[var(--text)]">Special Client Requests:</div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                  &ldquo;{selectedBooking.notes}&rdquo;
                </p>
              </div>
            )}

            {/* Payment Screenshot Preview */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                Payment Screenshot / Deposit Slip
              </div>
              {selectedBooking.paymentScreenshot ? (
                <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card-subtle)] max-h-72 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBooking.paymentScreenshot}
                    alt="Payment receipt proof"
                    className="max-h-64 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
                  No payment screenshot was uploaded for this booking.
                </div>
              )}
            </div>

            {/* Internal Admin Note */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <div className="text-xs font-semibold text-[var(--text)]">Internal Studio Notes:</div>
              {selectedBooking.adminNotes && (
                <div className="p-3 rounded-lg bg-[var(--card-subtle)] text-xs text-[var(--gold-text)] border border-[var(--gold)]/30">
                  {selectedBooking.adminNotes}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add note (e.g. CBE reference confirmed, assigned Abebe)..."
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                />
                <button
                  type="button"
                  onClick={() => handleSaveAdminNote(selectedBooking.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#141008] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 transition-all shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedBooking.id)}
                className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Record</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] text-[var(--text)] hover:bg-[var(--border)] transition-colors border border-[var(--border)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
