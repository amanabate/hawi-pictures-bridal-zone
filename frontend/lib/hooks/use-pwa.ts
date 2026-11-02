'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWA_DISMISSED_UNTIL_KEY = 'hawi_pwa_install_dismissed_until';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Checks if the user is currently interacting with an input or form
 */
export function isUserEditingForm(): boolean {
  if (typeof document === 'undefined') return false;
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  const tag = activeEl.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

// Standalone mode store
function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(display-mode: standalone)');
  mediaQuery.addEventListener('change', callback);
  window.addEventListener('appinstalled', callback);
  return () => {
    mediaQuery.removeEventListener('change', callback);
    window.removeEventListener('appinstalled', callback);
  };
}

function getSnapshotStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Online status store
function subscribeOnline(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshotOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

// iOS device detection snapshot
function getSnapshotIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
}

// Dismissed prompt store
let dismissedListeners: Array<() => void> = [];
function subscribeDismissed(callback: () => void) {
  dismissedListeners.push(callback);
  return () => {
    dismissedListeners = dismissedListeners.filter((l) => l !== callback);
  };
}

function notifyDismissedChanged() {
  dismissedListeners.forEach((l) => l());
}

function getSnapshotDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const untilStr = localStorage.getItem(PWA_DISMISSED_UNTIL_KEY);
    if (!untilStr) return false;
    const until = parseInt(untilStr, 10);
    return !isNaN(until) && Date.now() < until;
  } catch {
    return false;
  }
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const isInstalled = useSyncExternalStore(subscribeStandalone, getSnapshotStandalone, () => false);
  const isOnline = useSyncExternalStore(subscribeOnline, getSnapshotOnline, () => true);
  const isIOS = useSyncExternalStore(() => () => {}, getSnapshotIOS, () => false);
  const isPromptDismissed = useSyncExternalStore(subscribeDismissed, getSnapshotDismissed, () => false);

  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [userTriggeredUpdate, setUserTriggeredUpdate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preserve scroll position on back/forward
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setHasUpdate(true);
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setHasUpdate(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[Hawi PWA] Service Worker registration failed:', err);
        });

      // Reload page ONLY when update is user-confirmed or no form is actively in progress
      let isRefreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isRefreshing) {
          if (userTriggeredUpdate || !isUserEditingForm()) {
            isRefreshing = true;
            window.location.reload();
          } else {
            setHasUpdate(true);
          }
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [userTriggeredUpdate]);

  // Trigger native browser install prompt
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('[Hawi PWA] Install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  // Dismiss install prompt for 14 days
  const dismissPrompt = useCallback(() => {
    try {
      const expiry = Date.now() + FOURTEEN_DAYS_MS;
      localStorage.setItem(PWA_DISMISSED_UNTIL_KEY, String(expiry));
      notifyDismissedChanged();
    } catch {
      // ignore
    }
  }, []);

  // Apply new version update safely
  const applyUpdate = useCallback(() => {
    setUserTriggeredUpdate(true);
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  }, [waitingWorker]);

  // Manual Check for Updates
  const checkForUpdates = useCallback(async (): Promise<{ hasNewVersion: boolean }> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return { hasNewVersion: false };
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.update();
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setHasUpdate(true);
        return { hasNewVersion: true };
      }
      return { hasNewVersion: false };
    } catch (err) {
      console.warn('[Hawi PWA] Update check error:', err);
      return { hasNewVersion: false };
    }
  }, []);

  // Purge runtime caches on logout
  const clearPrivateCaches = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_USER_DATA' });
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => k.includes('pages') || k.includes('images'))
            .map((k) => caches.delete(k))
        );
      }
    } catch (err) {
      console.warn('[Hawi PWA] Cache purge error:', err);
    }
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isOnline,
    hasUpdate,
    isPromptDismissed,
    installApp,
    dismissPrompt,
    applyUpdate,
    checkForUpdates,
    clearPrivateCaches
  };
}
