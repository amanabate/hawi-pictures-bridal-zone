'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Search,
  Copy,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  GripVertical,
  Check,
  X,
  AlertTriangle,
  Crown,
  RotateCcw,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  ManagedPackage,
  PackageBadge,
  ItemStatus,
  useManagedPackages,
  saveManagedPackage,
  duplicateManagedPackage,
  togglePackageStatus,
  reorderPackages,
  movePackageToTrash,
  restorePackageFromTrash,
  permanentlyDeletePackage,
  emptyPackagesTrash,
  calculateTrashDaysLeft
} from '@/lib/data-store';
import { getBookings } from '@/lib/storage';
import { useLanguage } from '@/lib/language-context';
import PackageCardPreview from './PackageCardPreview';

interface PackagesManagerProps {
  onShowToast: (message: string, undoAction?: () => void) => void;
}

export default function PackagesManager({ onShowToast }: PackagesManagerProps) {
  const { t, language, formatCurrency } = useLanguage();
  const packages = useManagedPackages();
  const bookings = getBookings();

  // Filters & State
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Hidden' | 'Trash'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPackage, setEditingPackage] = useState<Partial<ManagedPackage> | null>(null);
  const [isNewPackage, setIsNewPackage] = useState(false);
  const [formLangTab, setFormLangTab] = useState<'EN' | 'OM' | 'AM'>('EN');

  // Safety Modal State for Delete
  const [deleteCandidate, setDeleteCandidate] = useState<ManagedPackage | null>(null);
  const [candidateBookingCount, setCandidateBookingCount] = useState(0);

  // Form Field: New feature line input
  const [newFeatureText, setNewFeatureText] = useState('');

  // Drag and Drop State
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Categorize active & trashed
  const activeAndHidden = useMemo(() => packages.filter((p) => !p.deletedAt), [packages]);
  const trashedPackages = useMemo(() => packages.filter((p) => p.deletedAt), [packages]);

  // Filtered List
  const displayedPackages = useMemo(() => {
    let list: ManagedPackage[] = [];

    if (activeTab === 'Trash') {
      list = trashedPackages;
    } else if (activeTab === 'Active') {
      list = activeAndHidden.filter((p) => p.status === 'active');
    } else if (activeTab === 'Hidden') {
      list = activeAndHidden.filter((p) => p.status === 'hidden');
    } else {
      list = activeAndHidden;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameEnglish.toLowerCase().includes(q) ||
        p.nameAfaanOromoo.toLowerCase().includes(q) ||
        p.nameAmharic.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.priceDisplay.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
    );
  }, [activeTab, activeAndHidden, trashedPackages, searchQuery]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleOpenAdd = () => {
    const nextOrder = activeAndHidden.length;
    setEditingPackage({
      id: `package-${Date.now().toString(36)}`,
      name: 'New Luxury Package',
      nameEnglish: 'New Luxury Package',
      nameAfaanOromoo: '',
      nameAmharic: '',
      tagline: 'Comprehensive coverage tailored to your wedding vision',
      price: 65000,
      priceDisplay: '65,000 ETB',
      depositAmount: '20,000 ETB',
      badge: 'none',
      status: 'active',
      category: 'full_wedding',
      categoryLabel: 'Complete Wedding',
      daysCoverage: '1 Full Day (10 Hours)',
      team: '2 Lead Photographers + 1 Bridal Stylist',
      image: '/images/hawi_hero_wedding_1793302555646.jpg',
      features: [
        'Full day continuous coverage',
        'Bridal preparation & evening reception',
        'Over 350+ color-graded high-resolution photos',
        'Online gallery delivery within 14 days'
      ],
      deliverables: ['350+ Retouched Photos', 'Online Gallery', '1 Hardcover Album'],
      idealFor: 'Couples planning an elegant wedding ceremony in Addis Ababa.',
      order: nextOrder
    });
    setIsNewPackage(true);
  };

  const handleOpenEdit = (pkg: ManagedPackage) => {
    setEditingPackage({ ...pkg });
    setIsNewPackage(false);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage || !editingPackage.nameEnglish?.trim()) {
      alert('Please specify at least the English package name.');
      return;
    }

    const priceNum = Number(editingPackage.price) || 0;
    const formattedPrice = editingPackage.priceDisplay || `${priceNum.toLocaleString()} ETB`;
    const formattedDeposit = editingPackage.depositAmount || `${Math.round(priceNum * 0.3).toLocaleString()} ETB`;

    const pkgToSave: ManagedPackage = {
      id: editingPackage.id || `package-${Date.now().toString(36)}`,
      name: editingPackage.nameEnglish.trim(),
      nameEnglish: editingPackage.nameEnglish.trim(),
      nameAfaanOromoo: editingPackage.nameAfaanOromoo?.trim() || '',
      nameAmharic: editingPackage.nameAmharic?.trim() || '',
      tagline: editingPackage.tagline?.trim() || '',
      price: priceNum,
      priceDisplay: formattedPrice,
      depositAmount: formattedDeposit,
      badge: editingPackage.badge || 'none',
      status: editingPackage.status || 'active',
      category: editingPackage.category || 'full_wedding',
      categoryLabel: editingPackage.categoryLabel || 'Complete Wedding',
      daysCoverage: editingPackage.daysCoverage || '1 Day',
      team: editingPackage.team || 'Photo Team',
      image: editingPackage.image || '/images/hawi_hero_wedding_1793302555646.jpg',
      features: editingPackage.features && editingPackage.features.length > 0 ? editingPackage.features : ['Full day wedding coverage'],
      deliverables: editingPackage.deliverables || ['Retouched Photos'],
      idealFor: editingPackage.idealFor || 'Couples seeking timeless wedding memories.',
      order: editingPackage.order !== undefined ? editingPackage.order : activeAndHidden.length,
      deletedAt: null
    };

    saveManagedPackage(pkgToSave);
    const wasNew = isNewPackage;
    setEditingPackage(null);

    onShowToast(
      wasNew ? `Package "${pkgToSave.name}" created successfully!` : `Package "${pkgToSave.name}" updated!`,
      wasNew
        ? () => {
            movePackageToTrash(pkgToSave.id);
          }
        : undefined
    );
  };

  const handleDuplicate = (pkg: ManagedPackage) => {
    const duplicated = duplicateManagedPackage(pkg.id);
    if (duplicated) {
      onShowToast(`Duplicated "${pkg.name}". New copy is ready.`, () => {
        permanentlyDeletePackage(duplicated.id);
      });
    }
  };

  const handleToggleStatus = (pkg: ManagedPackage) => {
    const newStatus = togglePackageStatus(pkg.id);
    onShowToast(`Package "${pkg.name}" is now ${newStatus}.`, () => {
      togglePackageStatus(pkg.id);
    });
  };

  // Reordering
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeAndHidden.length) return;

    const copy = [...activeAndHidden];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const orderedIds = copy.map((p) => p.id);
    reorderPackages(orderedIds);
  };

  // Drag and Drop Reordering
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const fromIdx = activeAndHidden.findIndex((p) => p.id === draggedId);
    const toIdx = activeAndHidden.findIndex((p) => p.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const copy = [...activeAndHidden];
    const [removed] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, removed);

    reorderPackages(copy.map((p) => p.id));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // Delete flow with safety check for bookings
  const handleInitiateDelete = (pkg: ManagedPackage) => {
    const bookingCount = bookings.filter((b) => b.packageId === pkg.id).length;
    setDeleteCandidate(pkg);
    setCandidateBookingCount(bookingCount);
  };

  const handleConfirmMoveToTrash = (pkg: ManagedPackage) => {
    movePackageToTrash(pkg.id);
    setDeleteCandidate(null);

    onShowToast(`Package "${pkg.name}" moved to Trash. Available for 30 days.`, () => {
      restorePackageFromTrash(pkg.id);
    });
  };

  const handleHideInsteadOfDelete = (pkg: ManagedPackage) => {
    if (pkg.status !== 'hidden') {
      togglePackageStatus(pkg.id);
    }
    setDeleteCandidate(null);
    onShowToast(`Package "${pkg.name}" has been hidden from the public website.`);
  };

  const handleRestore = (pkg: ManagedPackage) => {
    restorePackageFromTrash(pkg.id);
    onShowToast(`Restored "${pkg.name}" to active packages!`, () => {
      movePackageToTrash(pkg.id);
    });
  };

  const handlePermanentDelete = (pkg: ManagedPackage) => {
    if (confirm(`Permanently and irreversibly purge package "${pkg.name}"? This cannot be undone.`)) {
      permanentlyDeletePackage(pkg.id);
      onShowToast(`Package "${pkg.name}" was permanently removed.`);
    }
  };

  const handleEmptyTrash = () => {
    if (confirm(`Are you sure you want to permanently delete all ${trashedPackages.length} packages in trash?`)) {
      const count = emptyPackagesTrash();
      onShowToast(`Emptied trash (${count} packages permanently removed).`);
    }
  };

  // Feature line items inside form
  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !editingPackage) return;
    const currentFeatures = editingPackage.features || [];
    setEditingPackage({
      ...editingPackage,
      features: [...currentFeatures, newFeatureText.trim()]
    });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPackage || !editingPackage.features) return;
    const currentFeatures = [...editingPackage.features];
    currentFeatures.splice(index, 1);
    setEditingPackage({
      ...editingPackage,
      features: currentFeatures
    });
  };

  const handleMoveFeature = (index: number, direction: 'up' | 'down') => {
    if (!editingPackage || !editingPackage.features) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingPackage.features.length) return;

    const copy = [...editingPackage.features];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    setEditingPackage({
      ...editingPackage,
      features: copy
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
              Package & Investment Management
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--gold-bg)] text-[var(--gold-text)] border border-[var(--gold)]/20">
              {activeAndHidden.length} Total
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Configure wedding tiers, trilingual titles (English, Afaan Oromoo, Amharic), pricing, deposits, and included services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/packages"
            target="_blank"
            className="px-3 py-2 rounded-xl text-xs font-semibold text-[var(--gold-text)] hover:text-[var(--gold)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-subtle)] flex items-center gap-1.5 transition-colors"
          >
            <span>Live Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-105 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--card-subtle)] border border-[var(--border)] rounded-xl overflow-x-auto">
          {(['All', 'Active', 'Hidden', 'Trash'] as const).map((tab) => {
            const count =
              tab === 'All'
                ? activeAndHidden.length
                : tab === 'Active'
                ? activeAndHidden.filter((p) => p.status === 'active').length
                : tab === 'Hidden'
                ? activeAndHidden.filter((p) => p.status === 'hidden').length
                : trashedPackages.length;

            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                  active
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    tab === 'Trash' && count > 0
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                      : 'bg-[var(--card-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by English, Oromo, Amharic name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          />
        </div>
      </div>

      {/* TRASH VIEW BANNER */}
      {activeTab === 'Trash' && trashedPackages.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>Items in trash are automatically purged after 30 days. You can restore them anytime.</span>
          </div>
          <button
            onClick={handleEmptyTrash}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Empty Trash Now
          </button>
        </div>
      )}

      {/* PACKAGES LIST */}
      {displayedPackages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--gold)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[var(--text)]">No packages found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {activeTab === 'Trash'
              ? 'Trash is empty. Deleted packages will appear here for 30 days with restore protection.'
              : searchQuery
              ? 'No packages matched your search query. Try searching for a different keyword.'
              : 'Create your first wedding package to show on the public website.'}
          </p>
          {activeTab !== 'Trash' && (
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--gold)] text-[#141008]"
            >
              Add New Package
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedPackages.map((pkg, idx) => {
            const isTrash = Boolean(pkg.deletedAt);
            const daysLeft = isTrash ? calculateTrashDaysLeft(pkg.deletedAt) : 30;
            const packageBookings = bookings.filter((b) => b.packageId === pkg.id).length;

            return (
              <div
                key={pkg.id}
                draggable={!isTrash}
                onDragStart={() => handleDragStart(pkg.id)}
                onDragOver={(e) => handleDragOver(e, pkg.id)}
                onDragEnd={handleDragEnd}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isTrash
                    ? 'bg-red-500/5 border-red-500/20'
                    : pkg.status === 'hidden'
                    ? 'bg-[var(--card)]/60 border-[var(--border)] opacity-85'
                    : pkg.badge === 'special'
                    ? 'bg-[var(--card)] border-[var(--gold)] shadow-md'
                    : 'bg-[var(--card)] border-[var(--border)] shadow-sm hover:border-[var(--gold)]/60'
                }`}
              >
                {/* Left: Reorder handle + details */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {!isTrash && (
                    <div
                      className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-subtle)]"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>
                  )}

                  {/* Thumbnail / Category Badge */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[var(--border)] bg-[var(--card-subtle)]">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    {pkg.badge === 'special' && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-[var(--gold)] text-[#141008] flex items-center justify-center rounded-bl">
                        <Crown className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Information & Trilingual Names */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-[var(--text)] truncate">{pkg.name}</h3>

                      {/* Badges */}
                      {pkg.badge === 'special' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008]">
                          Special Flagship
                        </span>
                      )}
                      {pkg.badge === 'popular' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--gold)] text-[#141008]">
                          Popular
                        </span>
                      )}
                      {pkg.status === 'hidden' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--card-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                          Hidden
                        </span>
                      )}
                      {packageBookings > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {packageBookings} booking{packageBookings > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Multilingual subtext */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                      {pkg.nameAfaanOromoo && (
                        <span className="font-medium">Oromo: {pkg.nameAfaanOromoo}</span>
                      )}
                      {pkg.nameAfaanOromoo && pkg.nameAmharic && <span>·</span>}
                      {pkg.nameAmharic && (
                        <span className="font-medium">አማርኛ: {pkg.nameAmharic}</span>
                      )}
                    </div>

                    <div className="text-xs text-[var(--text-muted)] flex flex-wrap items-center gap-3 pt-0.5">
                      <span>{pkg.categoryLabel}</span>
                      <span>·</span>
                      <span>{pkg.daysCoverage}</span>
                      <span>·</span>
                      <span>{pkg.features?.length || 0} Included services</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Pricing & Deposit */}
                <div className="flex sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border)]">
                  <div className="font-serif text-xl sm:text-2xl font-bold text-[var(--gold)] tabular-nums">
                    {pkg.priceDisplay}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Deposit: <strong className="text-[var(--text)] font-mono">{pkg.depositAmount}</strong>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border)]">
                  {isTrash ? (
                    <>
                      <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold mr-2">
                        {daysLeft} days left
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestore(pkg)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] flex items-center gap-1.5"
                        title="Restore to active packages"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[var(--gold)]" />
                        <span>Restore</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePermanentDelete(pkg)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded-xl"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Move Up / Down Buttons for accessible reordering */}
                      <div className="hidden sm:flex items-center mr-1">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-25 rounded-lg"
                          title="Move up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === activeAndHidden.length - 1}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-25 rounded-lg"
                          title="Move down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pkg)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] flex items-center gap-1 transition-colors"
                        title="Edit package details"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[var(--gold)]" />
                        <span>Edit</span>
                      </button>

                      {/* Duplicate Button */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(pkg)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-subtle)] rounded-xl border border-[var(--border)] transition-colors"
                        title="Duplicate package"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Hide/Show Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(pkg)}
                        className={`p-2 rounded-xl border transition-colors ${
                          pkg.status === 'hidden'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                            : 'bg-[var(--card-subtle)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`}
                        title={pkg.status === 'hidden' ? 'Show package on website' : 'Hide package from website'}
                      >
                        {pkg.status === 'hidden' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleInitiateDelete(pkg)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded-xl border border-transparent transition-colors"
                        title="Delete package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          ADD / EDIT PACKAGE MODAL WITH LIVE PREVIEW
         ========================================== */}
      {editingPackage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setEditingPackage(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-[var(--surface)] text-[var(--text)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] space-y-6 my-8 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                  {isNewPackage ? 'Catalog Creation' : 'Catalog Customization'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
                  {isNewPackage ? 'Add New Wedding Package' : `Edit: ${editingPackage.nameEnglish}`}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Grid: Form (Left) & Live Preview (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Side */}
              <form onSubmit={handleSavePackage} className="lg:col-span-7 space-y-6">
                {/* Trilingual Package Details with Language Tabs */}
                <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                      {t('admin.packagesManager.nameLabel')} & {t('admin.packagesManager.taglineLabel')}
                    </div>

                    {/* Language Tabs: [EN | OM | AM] with Missing Translation Indicator */}
                    <div className="flex items-center gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                      {(['EN', 'OM', 'AM'] as const).map((langCode) => {
                        const isMissing =
                          langCode === 'EN'
                            ? !editingPackage.nameEnglish?.trim()
                            : langCode === 'OM'
                            ? !editingPackage.nameAfaanOromoo?.trim()
                            : !editingPackage.nameAmharic?.trim();

                        const isActive = formLangTab === langCode;

                        return (
                          <button
                            key={langCode}
                            type="button"
                            onClick={() => setFormLangTab(langCode)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                              isActive
                                ? 'bg-[var(--gold)] text-[#141008] shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                            }`}
                          >
                            <span>{langCode}</span>
                            {isMissing && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                  isActive
                                    ? 'bg-black/20 text-black'
                                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {t('admin.packagesManager.missingTranslationTag')}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Content by Active Tab */}
                  {formLangTab === 'EN' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text)] block mb-1">
                          English Package Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Special Package / Package 1"
                          value={editingPackage.nameEnglish || ''}
                          onChange={(e) =>
                            setEditingPackage({
                              ...editingPackage,
                              nameEnglish: e.target.value,
                              name: e.target.value
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text)] block mb-1">
                          English Tagline
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Master studio and 4K film experience"
                          value={editingPackage.tagline || ''}
                          onChange={(e) =>
                            setEditingPackage({
                              ...editingPackage,
                              tagline: e.target.value
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                        />
                      </div>
                    </div>
                  )}

                  {formLangTab === 'OM' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text)] block mb-1">
                          Maqaa Paakeejjii (Afaan Oromoo)
                        </label>
                        <input
                          type="text"
                          placeholder="fakkeenyaaf: Paakeejii Addaa / Paakeejii 1ffaa"
                          value={editingPackage.nameAfaanOromoo || ''}
                          onChange={(e) =>
                            setEditingPackage({
                              ...editingPackage,
                              nameAfaanOromoo: e.target.value
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text)] block mb-1">
                          Ibsa Gabaabaa (Afaan Oromoo)
                        </label>
                        <input
                          type="text"
                          placeholder="Ibsa gabaabaa paakeejjii kanaa"
                          value={editingPackage.tagline || ''}
                          onChange={(e) =>
                            setEditingPackage({
                              ...editingPackage,
                              tagline: e.target.value
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                        />
                      </div>
                    </div>
                  )}

                  {formLangTab === 'AM' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text)] block mb-1">
                          የፓኬጅ ስም (አማርኛ)
                        </label>
                        <input
                          type="text"
                          placeholder="ለምሳሌ፦ ልዩ ፓኬጅ / ፓኬጅ 1"
                          value={editingPackage.nameAmharic || ''}
                          onChange={(e) =>
                            setEditingPackage({
                              ...editingPackage,
                              nameAmharic: e.target.value
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text)] block mb-1">
                          አጭር መግለጫ (አማርኛ)
                        </label>
                        <input
                          type="text"
                          placeholder="ስለ ፓኬጁ አጭር ማብራሪያ"
                          value={editingPackage.tagline || ''}
                          onChange={(e) =>
                            setEditingPackage({
                              ...editingPackage,
                              tagline: e.target.value
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Price & Deposit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Price in ETB (Numeric)
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={editingPackage.price || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setEditingPackage({
                          ...editingPackage,
                          price: val,
                          priceDisplay: `${val.toLocaleString()} ETB`,
                          depositAmount: `${Math.round(val * 0.3).toLocaleString()} ETB`
                        });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    />
                    <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                      Display: {editingPackage.priceDisplay}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Required Deposit (ETB)
                    </label>
                    <input
                      type="text"
                      value={editingPackage.depositAmount || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, depositAmount: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    />
                  </div>
                </div>

                {/* Badge & Status & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Highlight Badge
                    </label>
                    <select
                      value={editingPackage.badge || 'none'}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          badge: e.target.value as PackageBadge
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    >
                      <option value="none">None (Standard)</option>
                      <option value="popular">Popular (Gold Glow)</option>
                      <option value="special">Special (Crown Flagship)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Visibility Status
                    </label>
                    <select
                      value={editingPackage.status || 'active'}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          status: e.target.value as ItemStatus
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="hidden">Hidden (Draft/Private)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Category
                    </label>
                    <select
                      value={editingPackage.category || 'full_wedding'}
                      onChange={(e) => {
                        const cat = e.target.value as ManagedPackage['category'];
                        const labels: Record<string, string> = {
                          full_wedding: 'Complete Wedding',
                          photography: 'Photography',
                          bridal_salon: 'Bridal Salon Only',
                          cinema: 'Photo & Drone Cinema',
                          special: 'Special Signature Package'
                        };
                        setEditingPackage({
                          ...editingPackage,
                          category: cat,
                          categoryLabel: labels[cat] || 'Wedding'
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    >
                      <option value="full_wedding">Full Wedding & Melse</option>
                      <option value="photography">Photography</option>
                      <option value="bridal_salon">Bridal Salon & Gowns</option>
                      <option value="cinema">4K Drone & Cinema</option>
                      <option value="special">Special Flagship</option>
                    </select>
                  </div>
                </div>

                {/* Coverage & Team */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Days / Hours Coverage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Day (12 Hours) or 2 Full Days"
                      value={editingPackage.daysCoverage || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, daysCoverage: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-1">
                      Assigned Crew Team
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Master Photographers + 1 Drone Pilot"
                      value={editingPackage.team || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, team: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    />
                  </div>
                </div>

                {/* INCLUDED ITEMS EDITOR (Add, Remove, Reorder) */}
                <div className="p-4 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                      Included Services & Deliverables Editor
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {editingPackage.features?.length || 0} line items
                    </span>
                  </div>

                  {/* Add item input row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 4K Drone footage of venue and ceremony..."
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--gold)] text-[#141008] hover:brightness-105 shrink-0"
                    >
                      Add Line
                    </button>
                  </div>

                  {/* Feature lines list */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(editingPackage.features || []).map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                          <span className="truncate text-[var(--text)]">{feat}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveFeature(fIdx, 'up')}
                            disabled={fIdx === 0}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-20"
                            title="Move up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveFeature(fIdx, 'down')}
                            disabled={fIdx === (editingPackage.features?.length || 1) - 1}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-20"
                            title="Move down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(fIdx)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Remove line"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setEditingPackage(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] shadow-md hover:brightness-105"
                  >
                    {isNewPackage ? 'Publish Package' : 'Save Changes'}
                  </button>
                </div>
              </form>

              {/* Right Side: Live Card Preview */}
              <div className="lg:col-span-5 sticky top-4">
                <PackageCardPreview pkg={editingPackage} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE CONFIRMATION & SAFETY MODAL
         ========================================== */}
      {deleteCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            className="relative max-w-md w-full bg-[var(--surface)] text-[var(--text)] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[var(--border)] space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  candidateBookingCount > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text)]">
                  {candidateBookingCount > 0 ? 'Package Has Active Bookings!' : 'Move Package to Trash?'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Target: <strong>{deleteCandidate.name}</strong> ({deleteCandidate.priceDisplay})
                </p>
              </div>
            </div>

            {candidateBookingCount > 0 ? (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                  <strong>Warning:</strong> This package currently has{' '}
                  <span className="font-bold underline">{candidateBookingCount} existing client booking(s)</span>.
                  Hard-deleting it could disrupt customer records and deposit references.
                </div>
                <p className="text-[var(--text-muted)]">
                  We strongly recommend choosing <strong>&quot;Hide Package&quot;</strong> instead. Hiding it removes it
                  from the public website while preserving client contracts in the Admin Dashboard.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Moving this package to trash will remove it from the public website immediately. You can restore it from
                the Trash tab anytime within 30 days.
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] text-[var(--text)] border border-[var(--border)]"
              >
                Cancel
              </button>

              {candidateBookingCount > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleHideInsteadOfDelete(deleteCandidate)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                  >
                    Hide Package Instead
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmMoveToTrash(deleteCandidate)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:underline"
                  >
                    Move to Trash Anyway
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConfirmMoveToTrash(deleteCandidate)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Move to Trash
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
