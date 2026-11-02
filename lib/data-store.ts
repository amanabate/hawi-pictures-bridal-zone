'use client';

import { useSyncExternalStore } from 'react';
import { PACKAGES_DATA, WeddingPackage } from '@/data/packages';
import { GALLERY_SECTION_DATA } from '@/data/gallery';
import { getBookings } from '@/lib/storage';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type PackageBadge = 'none' | 'popular' | 'special';
export type ItemStatus = 'active' | 'hidden';

export interface ManagedPackage {
  id: string;
  name: string; // Default English/Primary
  nameEnglish: string;
  nameAfaanOromoo: string;
  nameAmharic: string;
  tagline: string;
  price: number; // numeric ETB
  priceDisplay: string; // e.g. "85,000 ETB"
  depositAmount: string; // e.g. "25,000 ETB"
  badge: PackageBadge;
  status: ItemStatus;
  category: 'photography' | 'bridal_salon' | 'full_wedding' | 'cinema' | 'special';
  categoryLabel: string;
  daysCoverage: string;
  team: string;
  image: string;
  features: string[]; // included items
  deliverables: string[];
  idealFor: string;
  order: number;
  deletedAt?: string | null; // ISO date string if in trash
}

export type GalleryCategory = 'Wedding' | 'Bridal' | 'Makeup' | 'Traditional' | 'Studio';

export interface ManagedGalleryItem {
  id: string;
  title: string; // Caption
  titleEnglish?: string;
  titleAfaanOromoo?: string;
  titleAmharic?: string;
  description: string;
  descriptionEnglish?: string;
  descriptionAfaanOromoo?: string;
  descriptionAmharic?: string;
  category: GalleryCategory;
  type: 'image' | 'video';
  url: string; // Image path/data URL or video link
  videoEmbedUrl?: string;
  featured: boolean;
  status: ItemStatus;
  order: number;
  createdAt: string;
  deletedAt?: string | null; // ISO date string if in trash
}

export interface ActivityLogItem {
  id: string;
  action: string;
  category: 'packages' | 'gallery' | 'bookings' | 'system';
  details: string;
  timestamp: string;
}

// ==========================================
// 2. STORAGE KEYS
// ==========================================
const PACKAGES_KEY = 'hawi_managed_packages_v2';
const GALLERY_KEY = 'hawi_managed_gallery_v2';
const ACTIVITY_KEY = 'hawi_activity_log_v1';

// ==========================================
// 3. INITIAL SEED DATA
// ==========================================

const INITIAL_PACKAGES: ManagedPackage[] = PACKAGES_DATA.map((p, idx) => ({
  id: p.id,
  name: p.name,
  nameEnglish: p.nameEnglish || p.name,
  nameAfaanOromoo: p.nameAfaanOromoo || p.name,
  nameAmharic: p.nameAmharic || p.name,
  tagline: p.tagline,
  price: p.price,
  priceDisplay: p.priceDisplay,
  depositAmount: p.depositAmount,
  badge: (p.badge as PackageBadge) || (p.isSpecial ? 'special' : p.popular ? 'popular' : 'none'),
  status: 'active',
  category: p.category,
  categoryLabel: p.categoryLabel,
  daysCoverage: p.daysCoverage,
  team: p.team,
  image: p.image,
  features: p.features,
  deliverables: p.deliverables,
  idealFor: p.idealFor,
  order: idx
}));

const INITIAL_GALLERY: ManagedGalleryItem[] = GALLERY_SECTION_DATA.photos.map((photo, idx) => ({
  id: photo.id,
  title: photo.caption.slice(0, 48),
  description: photo.caption,
  category: photo.category,
  type: 'image',
  url: photo.imageUrl,
  featured: idx < 4,
  status: 'active',
  order: idx,
  createdAt: new Date(Date.now() - (10 - idx) * 86400000).toISOString()
}));

const INITIAL_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    action: 'System Initialized',
    category: 'system',
    details: 'Hawi Pictures & Bridal Zone management ledger initialized with 9 standard packages and 6 gallery items.',
    timestamp: '2026-10-28T09:00:00Z'
  }
];

// ==========================================
// 4. PUB / SUB STATE & OBSERVERS
// ==========================================
let packagesListeners: Array<() => void> = [];
let galleryListeners: Array<() => void> = [];
let activityListeners: Array<() => void> = [];

let cachedPackages: ManagedPackage[] | null = null;
let cachedGallery: ManagedGalleryItem[] | null = null;
let cachedLogs: ActivityLogItem[] | null = null;

function notifyPackages() {
  for (const l of packagesListeners) l();
}
function notifyGallery() {
  for (const l of galleryListeners) l();
}
function notifyActivity() {
  for (const l of activityListeners) l();
}

// Multi-tab sync & window storage observer
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === PACKAGES_KEY) {
      cachedPackages = null;
      notifyPackages();
    } else if (e.key === GALLERY_KEY) {
      cachedGallery = null;
      notifyGallery();
    } else if (e.key === ACTIVITY_KEY) {
      cachedLogs = null;
      notifyActivity();
    }
  });
}

// ==========================================
// 5. PACKAGES OPERATIONS
// ==========================================

export function subscribeManagedPackages(listener: () => void) {
  packagesListeners.push(listener);
  return () => {
    packagesListeners = packagesListeners.filter((l) => l !== listener);
  };
}

export function getManagedPackages(): ManagedPackage[] {
  if (typeof window === 'undefined') {
    return INITIAL_PACKAGES;
  }
  if (cachedPackages) {
    return cachedPackages;
  }
  try {
    const raw = localStorage.getItem(PACKAGES_KEY);
    if (!raw) {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(INITIAL_PACKAGES));
      cachedPackages = INITIAL_PACKAGES;
      return INITIAL_PACKAGES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cachedPackages = parsed.sort((a, b) => a.order - b.order);
      return cachedPackages;
    }
    cachedPackages = INITIAL_PACKAGES;
    return INITIAL_PACKAGES;
  } catch (e) {
    console.error('Error reading packages from localStorage:', e);
    cachedPackages = INITIAL_PACKAGES;
    return INITIAL_PACKAGES;
  }
}

function persistPackages(pkgs: ManagedPackage[]) {
  if (typeof window === 'undefined') return;
  cachedPackages = pkgs;
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(pkgs));
  notifyPackages();
}

export function saveManagedPackage(pkg: Omit<ManagedPackage, 'order'> & { order?: number }): ManagedPackage {
  const current = getManagedPackages();
  const existingIdx = current.findIndex((p) => p.id === pkg.id);
  const nextOrder = pkg.order !== undefined ? pkg.order : current.length;

  const fullPkg: ManagedPackage = {
    ...pkg,
    nameEnglish: pkg.nameEnglish || pkg.name,
    nameAfaanOromoo: pkg.nameAfaanOromoo || '',
    nameAmharic: pkg.nameAmharic || '',
    order: nextOrder
  };

  let updated: ManagedPackage[];
  if (existingIdx >= 0) {
    updated = current.map((p, idx) => (idx === existingIdx ? fullPkg : p));
    logActivity('Package Updated', 'packages', `Updated package "${fullPkg.name}" (${fullPkg.priceDisplay})`);
  } else {
    updated = [...current, fullPkg];
    logActivity('Package Created', 'packages', `Created new package "${fullPkg.name}" (${fullPkg.priceDisplay})`);
  }
  persistPackages(updated);
  return fullPkg;
}

export function duplicateManagedPackage(id: string): ManagedPackage | null {
  const current = getManagedPackages();
  const source = current.find((p) => p.id === id);
  if (!source) return null;

  const newId = `${source.id}-copy-${Date.now().toString(36).slice(-4)}`;
  const duplicate: ManagedPackage = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    nameEnglish: `${source.nameEnglish || source.name} (Copy)`,
    nameAfaanOromoo: source.nameAfaanOromoo ? `${source.nameAfaanOromoo} (Garagalcha)` : '',
    nameAmharic: source.nameAmharic ? `${source.nameAmharic} (ቅጅ)` : '',
    order: current.length,
    status: 'active',
    deletedAt: null
  };

  const updated = [...current, duplicate];
  persistPackages(updated);
  logActivity('Package Duplicated', 'packages', `Duplicated "${source.name}" as "${duplicate.name}"`);
  return duplicate;
}

export function togglePackageStatus(id: string): ItemStatus {
  const current = getManagedPackages();
  const target = current.find((p) => p.id === id);
  const newStatus: ItemStatus = target && target.status === 'active' ? 'hidden' : 'active';
  const updated = current.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
  persistPackages(updated);
  logActivity(
    newStatus === 'hidden' ? 'Package Hidden' : 'Package Activated',
    'packages',
    `Changed status of package ${id} to ${newStatus}`
  );
  return newStatus;
}

export function reorderPackages(orderedIds: string[]): ManagedPackage[] {
  const current = getManagedPackages();
  const map = new Map(current.map((p) => [p.id, p]));
  const updated: ManagedPackage[] = [];

  orderedIds.forEach((id, idx) => {
    const item = map.get(id);
    if (item) {
      updated.push({ ...item, order: idx });
      map.delete(id);
    }
  });

  // Append remaining that were not in orderedIds
  map.forEach((item) => {
    updated.push({ ...item, order: updated.length });
  });

  persistPackages(updated);
  logActivity('Packages Reordered', 'packages', 'Updated package display sequence');
  return updated;
}

export function movePackageToTrash(id: string): { success: boolean; hasBookings?: boolean; bookingCount?: number } {
  const bookings = getBookings();
  const bookingCount = bookings.filter((b) => b.packageId === id).length;

  const current = getManagedPackages();
  const target = current.find((p) => p.id === id);
  if (!target) return { success: false };

  const updated = current.map((p) => (p.id === id ? { ...p, deletedAt: new Date().toISOString() } : p));
  persistPackages(updated);
  logActivity('Package Moved to Trash', 'packages', `Moved "${target.name}" to trash (retention: 30 days)`);
  return { success: true, hasBookings: bookingCount > 0, bookingCount };
}

export function restorePackageFromTrash(id: string): boolean {
  const current = getManagedPackages();
  const target = current.find((p) => p.id === id);
  if (!target) return false;

  const updated = current.map((p) => (p.id === id ? { ...p, deletedAt: null } : p));
  persistPackages(updated);
  logActivity('Package Restored', 'packages', `Restored "${target.name}" from trash to active catalog`);
  return true;
}

export function permanentlyDeletePackage(id: string): boolean {
  const current = getManagedPackages();
  const target = current.find((p) => p.id === id);
  if (!target) return false;

  const updated = current.filter((p) => p.id !== id);
  persistPackages(updated);
  logActivity('Package Permanently Deleted', 'packages', `Permanently purged "${target.name}"`);
  return true;
}

export function emptyPackagesTrash(): number {
  const current = getManagedPackages();
  const toDelete = current.filter((p) => p.deletedAt);
  const updated = current.filter((p) => !p.deletedAt);
  persistPackages(updated);
  logActivity('Packages Trash Emptied', 'packages', `Emptied ${toDelete.length} trashed packages permanently`);
  return toDelete.length;
}

// Convert ManagedPackage to public WeddingPackage compatibility
export function toPublicWeddingPackage(pkg: ManagedPackage): WeddingPackage {
  return {
    id: pkg.id,
    name: pkg.name,
    tagline: pkg.tagline,
    price: pkg.price,
    priceDisplay: pkg.priceDisplay,
    depositAmount: pkg.depositAmount,
    isSpecial: pkg.badge === 'special',
    popular: pkg.badge === 'popular',
    category: pkg.category,
    categoryLabel: pkg.categoryLabel,
    daysCoverage: pkg.daysCoverage,
    team: pkg.team,
    image: pkg.image,
    features: pkg.features,
    deliverables: pkg.deliverables,
    idealFor: pkg.idealFor
  };
}

// ==========================================
// 6. GALLERY OPERATIONS
// ==========================================

export function subscribeManagedGallery(listener: () => void) {
  galleryListeners.push(listener);
  return () => {
    galleryListeners = galleryListeners.filter((l) => l !== listener);
  };
}

export function getManagedGallery(): ManagedGalleryItem[] {
  if (typeof window === 'undefined') {
    return INITIAL_GALLERY;
  }
  if (cachedGallery) {
    return cachedGallery;
  }
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(INITIAL_GALLERY));
      cachedGallery = INITIAL_GALLERY;
      return INITIAL_GALLERY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cachedGallery = parsed.sort((a, b) => a.order - b.order);
      return cachedGallery;
    }
    cachedGallery = INITIAL_GALLERY;
    return INITIAL_GALLERY;
  } catch (e) {
    console.error('Error reading gallery from localStorage:', e);
    cachedGallery = INITIAL_GALLERY;
    return INITIAL_GALLERY;
  }
}

function persistGallery(items: ManagedGalleryItem[]) {
  if (typeof window === 'undefined') return;
  cachedGallery = items;
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
  notifyGallery();
}

export function addGalleryItem(item: Omit<ManagedGalleryItem, 'id' | 'order' | 'createdAt'> & { id?: string; order?: number }): ManagedGalleryItem {
  const current = getManagedGallery();
  const id = item.id || `gal-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const order = item.order !== undefined ? item.order : current.length;

  const newItem: ManagedGalleryItem = {
    ...item,
    id,
    order,
    createdAt: new Date().toISOString(),
    status: item.status || 'active',
    featured: item.featured ?? false,
    deletedAt: null
  };

  const updated = [newItem, ...current].map((it, idx) => ({ ...it, order: idx }));
  persistGallery(updated);
  logActivity('Gallery Item Added', 'gallery', `Added ${item.type} "${item.title}" (${item.category})`);
  return newItem;
}

export function addMultipleGalleryItems(newItems: Array<Omit<ManagedGalleryItem, 'id' | 'order' | 'createdAt'>>): ManagedGalleryItem[] {
  const current = getManagedGallery();
  const created: ManagedGalleryItem[] = newItems.map((item, idx) => ({
    ...item,
    id: `gal-${Date.now().toString(36)}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    order: idx,
    createdAt: new Date().toISOString(),
    status: item.status || 'active',
    featured: item.featured ?? false,
    deletedAt: null
  }));

  const updated = [...created, ...current].map((it, idx) => ({ ...it, order: idx }));
  persistGallery(updated);
  logActivity('Multiple Gallery Items Uploaded', 'gallery', `Uploaded ${newItems.length} media items`);
  return created;
}

export function updateGalleryItem(id: string, partial: Partial<ManagedGalleryItem>): ManagedGalleryItem | null {
  const current = getManagedGallery();
  let updatedItem: ManagedGalleryItem | null = null;

  const updated = current.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...partial };
      return updatedItem;
    }
    return item;
  });

  if (updatedItem) {
    persistGallery(updated);
    logActivity('Gallery Item Updated', 'gallery', `Updated "${(updatedItem as ManagedGalleryItem).title}"`);
  }
  return updatedItem;
}

export function toggleGalleryStatus(id: string): ItemStatus {
  const current = getManagedGallery();
  const target = current.find((item) => item.id === id);
  const newStatus: ItemStatus = target && target.status === 'active' ? 'hidden' : 'active';
  const updated = current.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
  persistGallery(updated);
  logActivity(
    newStatus === 'hidden' ? 'Gallery Item Hidden' : 'Gallery Item Activated',
    'gallery',
    `Toggled visibility of item ${id} to ${newStatus}`
  );
  return newStatus;
}

export function reorderGallery(orderedIds: string[]): ManagedGalleryItem[] {
  const current = getManagedGallery();
  const map = new Map(current.map((item) => [item.id, item]));
  const updated: ManagedGalleryItem[] = [];

  orderedIds.forEach((id, idx) => {
    const item = map.get(id);
    if (item) {
      updated.push({ ...item, order: idx });
      map.delete(id);
    }
  });

  map.forEach((item) => {
    updated.push({ ...item, order: updated.length });
  });

  persistGallery(updated);
  logActivity('Gallery Reordered', 'gallery', 'Reordered gallery portfolio sequence');
  return updated;
}

export function moveGalleryToTrash(ids: string[]): number {
  if (ids.length === 0) return 0;
  const current = getManagedGallery();
  const idSet = new Set(ids);
  const now = new Date().toISOString();

  const updated = current.map((item) => (idSet.has(item.id) ? { ...item, deletedAt: now } : item));
  persistGallery(updated);
  logActivity('Gallery Items Moved to Trash', 'gallery', `Moved ${ids.length} item(s) to trash`);
  return ids.length;
}

export function restoreGalleryFromTrash(ids: string[]): number {
  if (ids.length === 0) return 0;
  const current = getManagedGallery();
  const idSet = new Set(ids);

  const updated = current.map((item) => (idSet.has(item.id) ? { ...item, deletedAt: null } : item));
  persistGallery(updated);
  logActivity('Gallery Items Restored', 'gallery', `Restored ${ids.length} item(s) from trash`);
  return ids.length;
}

export function bulkUpdateGalleryCategory(ids: string[], category: GalleryCategory): number {
  if (ids.length === 0) return 0;
  const current = getManagedGallery();
  const idSet = new Set(ids);

  const updated = current.map((item) => (idSet.has(item.id) ? { ...item, category } : item));
  persistGallery(updated);
  logActivity('Gallery Category Moved', 'gallery', `Moved ${ids.length} item(s) to category "${category}"`);
  return ids.length;
}

export function bulkUpdateGalleryStatus(ids: string[], status: ItemStatus): number {
  if (ids.length === 0) return 0;
  const current = getManagedGallery();
  const idSet = new Set(ids);

  const updated = current.map((item) => (idSet.has(item.id) ? { ...item, status } : item));
  persistGallery(updated);
  logActivity('Gallery Bulk Status Changed', 'gallery', `Set ${ids.length} item(s) to "${status}"`);
  return ids.length;
}

export function permanentlyDeleteGallery(ids: string[]): number {
  if (ids.length === 0) return 0;
  const current = getManagedGallery();
  const idSet = new Set(ids);

  const updated = current.filter((item) => !idSet.has(item.id));
  persistGallery(updated);
  logActivity('Gallery Permanently Deleted', 'gallery', `Permanently deleted ${ids.length} item(s)`);
  return ids.length;
}

export function emptyGalleryTrash(): number {
  const current = getManagedGallery();
  const toDelete = current.filter((item) => item.deletedAt);
  const updated = current.filter((item) => !item.deletedAt);
  persistGallery(updated);
  logActivity('Gallery Trash Emptied', 'gallery', `Emptied ${toDelete.length} trashed gallery items permanently`);
  return toDelete.length;
}

// ==========================================
// 7. ACTIVITY LOG OPERATIONS
// ==========================================

export function subscribeActivityLogs(listener: () => void) {
  activityListeners.push(listener);
  return () => {
    activityListeners = activityListeners.filter((l) => l !== listener);
  };
}

export function getActivityLogs(): ActivityLogItem[] {
  if (typeof window === 'undefined') {
    return INITIAL_LOGS;
  }
  if (cachedLogs) {
    return cachedLogs;
  }
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(INITIAL_LOGS));
      cachedLogs = INITIAL_LOGS;
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    cachedLogs = Array.isArray(parsed) ? parsed : INITIAL_LOGS;
    return cachedLogs;
  } catch (e) {
    console.error('Error reading activity log:', e);
    cachedLogs = INITIAL_LOGS;
    return INITIAL_LOGS;
  }
}

export function logActivity(action: string, category: 'packages' | 'gallery' | 'bookings' | 'system', details: string): void {
  if (typeof window === 'undefined') return;
  const current = getActivityLogs();
  const newLog: ActivityLogItem = {
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    category,
    details,
    timestamp: new Date().toISOString()
  };
  const updated = [newLog, ...current].slice(0, 100); // keep last 100 entries
  cachedLogs = updated;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  notifyActivity();
}

export function clearActivityLogs(): void {
  if (typeof window === 'undefined') return;
  cachedLogs = [];
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify([]));
  notifyActivity();
}

// ==========================================
// 8. UTILITIES: IMAGE RESIZE, VIDEO EMBED, TRASH DAYS
// ==========================================

export function calculateTrashDaysLeft(deletedAt?: string | null): number {
  if (!deletedAt) return 30;
  const deletedTime = new Date(deletedAt).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - deletedTime) / (1000 * 60 * 60 * 24));
  return Math.max(0, 30 - diffDays);
}

export function parseVideoLink(rawUrl: string): { embedUrl: string; isVideo: boolean; provider: string } {
  const url = rawUrl.trim();
  if (!url) return { embedUrl: '', isVideo: false, provider: '' };

  // YouTube match: watch?v= or youtu.be/ or /embed/
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      isVideo: true,
      provider: 'YouTube'
    };
  }

  // Vimeo match: vimeo.com/123456789
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      isVideo: true,
      provider: 'Vimeo'
    };
  }

  // Direct MP4/WebM video
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return {
      embedUrl: url,
      isVideo: true,
      provider: 'Direct Video'
    };
  }

  return { embedUrl: url, isVideo: false, provider: 'Web Link' };
}

/**
 * Resizes an image file to max dimensions while maintaining aspect ratio,
 * compressing to JPEG format (~100-250KB) so localStorage doesn't overflow.
 */
export function resizeImageFile(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file size and type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Invalid format. Please upload JPG, PNG, or WEBP images only.'));
    }
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('File exceeds 10MB maximum limit.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

// React Hook Wrappers
export function useManagedPackages() {
  return useSyncExternalStore(subscribeManagedPackages, getManagedPackages, () => INITIAL_PACKAGES);
}

export function useManagedGallery() {
  return useSyncExternalStore(subscribeManagedGallery, getManagedGallery, () => INITIAL_GALLERY);
}

export function useActivityLogs() {
  return useSyncExternalStore(subscribeActivityLogs, getActivityLogs, () => INITIAL_LOGS);
}
