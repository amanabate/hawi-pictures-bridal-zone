'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Film,
  Plus,
  Search,
  Check,
  X,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Edit2,
  Star,
  GripVertical,
  MoveUp,
  MoveDown,
  Layers,
  Sparkles,
  ExternalLink,
  Play,
  AlertTriangle,
  FolderInput,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  ManagedGalleryItem,
  GalleryCategory,
  ItemStatus,
  useManagedGallery,
  addGalleryItem,
  addMultipleGalleryItems,
  updateGalleryItem,
  toggleGalleryStatus,
  reorderGallery,
  moveGalleryToTrash,
  restoreGalleryFromTrash,
  bulkUpdateGalleryCategory,
  bulkUpdateGalleryStatus,
  permanentlyDeleteGallery,
  emptyGalleryTrash,
  calculateTrashDaysLeft,
  parseVideoLink,
  resizeImageFile
} from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';

interface GalleryManagerProps {
  onShowToast: (message: string, undoAction?: () => void) => void;
}

export default function GalleryManager({ onShowToast }: GalleryManagerProps) {
  const { t, language } = useLanguage();
  const gallery = useManagedGallery();

  // Filters & Tabs
  const [selectedCategory, setSelectedCategory] = useState<'All' | GalleryCategory | 'Featured' | 'Hidden' | 'Trash'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection & Multi-action state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<GalleryCategory>('Wedding');

  // Drag and drop reordering
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Upload & Video Modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ active: boolean; percent: number; statusText: string }>({
    active: false,
    percent: 0,
    statusText: ''
  });
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Video Link Form state
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoDescInput, setVideoDescInput] = useState('');
  const [videoCategoryInput, setVideoCategoryInput] = useState<GalleryCategory>('Wedding');
  const [videoFeaturedInput, setVideoFeaturedInput] = useState(false);

  // Edit Single Item Modal state
  const [editingItem, setEditingItem] = useState<ManagedGalleryItem | null>(null);
  const [galleryEditLangTab, setGalleryEditLangTab] = useState<'EN' | 'OM' | 'AM'>('EN');

  // Replace file input ref
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);

  // Categorize
  const activeAndHidden = useMemo(() => gallery.filter((item) => !item.deletedAt), [gallery]);
  const trashedItems = useMemo(() => gallery.filter((item) => item.deletedAt), [gallery]);

  // Filtered List
  const displayedItems = useMemo(() => {
    let list: ManagedGalleryItem[] = [];

    if (selectedCategory === 'Trash') {
      list = trashedItems;
    } else if (selectedCategory === 'Featured') {
      list = activeAndHidden.filter((i) => i.featured && i.status === 'active');
    } else if (selectedCategory === 'Hidden') {
      list = activeAndHidden.filter((i) => i.status === 'hidden');
    } else if (selectedCategory === 'All') {
      list = activeAndHidden;
    } else {
      list = activeAndHidden.filter((i) => i.category === selectedCategory);
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [selectedCategory, activeAndHidden, trashedItems, searchQuery]);

  // ==========================================
  // UPLOAD & FILE PROCESSING
  // ==========================================

  const handleFilesDropped = async (files: FileList | File[]) => {
    setUploadError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploadProgress({
      active: true,
      percent: 10,
      statusText: `Validating & optimizing ${fileArray.length} image(s)...`
    });

    const processedItems: Array<Omit<ManagedGalleryItem, 'id' | 'order' | 'createdAt'>> = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Type validation
        if (!validTypes.includes(file.type)) {
          throw new Error(`"${file.name}" is not a valid format. Please use JPG, PNG, or WEBP.`);
        }
        // Size validation (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 10MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        }

        // Automatic client-side resize and compression
        const dataUrl = await resizeImageFile(file, 1600, 1600, 0.82);

        // Derive pretty title from filename
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        processedItems.push({
          title: cleanName || 'Hawi Bridal Celebration',
          description: `Captured by Hawi Pictures at luxury wedding venue in Addis Ababa.`,
          category: 'Wedding',
          type: 'image',
          url: dataUrl,
          featured: false,
          status: 'active',
          deletedAt: null
        });

        const progressPercent = Math.round(((i + 1) / fileArray.length) * 85);
        setUploadProgress({
          active: true,
          percent: progressPercent,
          statusText: `Optimized ${i + 1} of ${fileArray.length} media items...`
        });
      }

      setUploadProgress({
        active: true,
        percent: 95,
        statusText: 'Saving to gallery portfolio...'
      });

      addMultipleGalleryItems(processedItems);

      setUploadProgress({ active: false, percent: 100, statusText: 'Complete!' });
      setIsUploadOpen(false);
      onShowToast(`Uploaded and optimized ${processedItems.length} photograph(s) successfully!`);
    } catch (err: unknown) {
      setUploadProgress({ active: false, percent: 0, statusText: '' });
      setUploadError(err instanceof Error ? err.message : 'Error uploading images. Please try again.');
    }
  };

  // Add Video by Link
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) {
      alert('Please enter a video URL.');
      return;
    }

    const { embedUrl, isVideo, provider } = parseVideoLink(videoUrlInput);
    if (!isVideo) {
      alert('Could not recognize video URL format. Please paste a valid YouTube, Vimeo, or MP4 link.');
      return;
    }

    const newItem = addGalleryItem({
      title: videoTitleInput.trim() || `${provider} Wedding Highlights Film`,
      description: videoDescInput.trim() || 'Cinematic wedding storytelling captured by Hawi Pictures video team.',
      category: videoCategoryInput,
      type: 'video',
      url: videoUrlInput.trim(),
      videoEmbedUrl: embedUrl,
      featured: videoFeaturedInput,
      status: 'active',
      deletedAt: null
    });

    setVideoUrlInput('');
    setVideoTitleInput('');
    setVideoDescInput('');
    setIsUploadOpen(false);

    onShowToast(`Added ${provider} video "${newItem.title}" to gallery!`, () => {
      permanentlyDeleteGallery([newItem.id]);
    });
  };

  // Replace Image on existing item
  const handleTriggerReplaceImage = (itemId: string) => {
    setReplacingItemId(itemId);
    replaceFileInputRef.current?.click();
  };

  const handleExecuteReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingItemId) return;

    try {
      const dataUrl = await resizeImageFile(file, 1600, 1600, 0.82);
      updateGalleryItem(replacingItemId, {
        url: dataUrl,
        type: 'image'
      });
      onShowToast('Photograph replaced successfully!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to replace image.');
    } finally {
      setReplacingItemId(null);
      e.target.value = '';
    }
  };

  // Drag and Drop reordering
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const fromIdx = activeAndHidden.findIndex((i) => i.id === draggedId);
    const toIdx = activeAndHidden.findIndex((i) => i.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const copy = [...activeAndHidden];
    const [removed] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, removed);

    reorderGallery(copy.map((i) => i.id));
  };
  const handleDragEnd = () => setDraggedId(null);

  // Single Action Handlers
  const handleToggleStatus = (item: ManagedGalleryItem) => {
    const next = toggleGalleryStatus(item.id);
    onShowToast(`Item "${item.title}" is now ${next}.`, () => {
      toggleGalleryStatus(item.id);
    });
  };

  const handleToggleFeatured = (item: ManagedGalleryItem) => {
    const updated = updateGalleryItem(item.id, { featured: !item.featured });
    if (updated) {
      onShowToast(`Item "${item.title}" ${updated.featured ? 'marked as Featured' : 'unfeatured'}.`);
    }
  };

  const handleDeleteSingle = (item: ManagedGalleryItem) => {
    moveGalleryToTrash([item.id]);
    onShowToast(`"${item.title}" moved to trash. Available for 30 days.`, () => {
      restoreGalleryFromTrash([item.id]);
    });
  };

  const handleRestoreSingle = (item: ManagedGalleryItem) => {
    restoreGalleryFromTrash([item.id]);
    onShowToast(`Restored "${item.title}"!`, () => {
      moveGalleryToTrash([item.id]);
    });
  };

  const handlePermanentDeleteSingle = (item: ManagedGalleryItem) => {
    if (confirm(`Permanently and irreversibly delete "${item.title}"?`)) {
      permanentlyDeleteGallery([item.id]);
      onShowToast(`Permanently deleted "${item.title}".`);
    }
  };

  // Bulk Multi-Select Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === displayedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedItems.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkHide = () => {
    if (selectedIds.length === 0) return;
    const count = bulkUpdateGalleryStatus(selectedIds, 'hidden');
    setSelectedIds([]);
    onShowToast(`Hidden ${count} item(s) from website.`);
  };

  const handleBulkShow = () => {
    if (selectedIds.length === 0) return;
    const count = bulkUpdateGalleryStatus(selectedIds, 'active');
    setSelectedIds([]);
    onShowToast(`Activated ${count} item(s) on website.`);
  };

  const handleBulkMoveCategory = () => {
    if (selectedIds.length === 0) return;
    const count = bulkUpdateGalleryCategory(selectedIds, bulkCategoryTarget);
    setSelectedIds([]);
    onShowToast(`Moved ${count} item(s) to "${bulkCategoryTarget}".`);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Move ${selectedIds.length} item(s) to trash?`)) {
      const idsCopy = [...selectedIds];
      const count = moveGalleryToTrash(idsCopy);
      setSelectedIds([]);
      onShowToast(`Moved ${count} item(s) to trash (30 days restore).`, () => {
        restoreGalleryFromTrash(idsCopy);
      });
    }
  };

  const handleEmptyTrash = () => {
    if (confirm(`Permanently empty all ${trashedItems.length} gallery items in trash?`)) {
      const count = emptyGalleryTrash();
      onShowToast(`Trash emptied (${count} items purged).`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hidden file input for Replace action */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleExecuteReplaceImage}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
              Gallery & Media Portfolio
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--gold-bg)] text-[var(--gold-text)] border border-[var(--gold)]/20">
              {activeAndHidden.length} Items
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Drag-and-drop multiple high-res photos with automatic resizing, paste cinema video links, and manage showcase categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#gallery"
            target="_blank"
            className="px-3 py-2 rounded-xl text-xs font-semibold text-[var(--gold-text)] hover:text-[var(--gold)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-subtle)] flex items-center gap-1.5 transition-colors"
          >
            <span>Public Showcase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setIsUploadOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#141008] hover:brightness-105 transition-all flex items-center gap-1.5 shadow-md"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* CATEGORY TABS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--card-subtle)] border border-[var(--border)] rounded-xl overflow-x-auto">
          {(['All', 'Wedding', 'Bridal', 'Makeup', 'Traditional', 'Studio', 'Featured', 'Hidden', 'Trash'] as const).map(
            (cat) => {
              const active = selectedCategory === cat;
              let count = 0;
              if (cat === 'All') count = activeAndHidden.length;
              else if (cat === 'Trash') count = trashedItems.length;
              else if (cat === 'Featured') count = activeAndHidden.filter((i) => i.featured && i.status === 'active').length;
              else if (cat === 'Hidden') count = activeAndHidden.filter((i) => i.status === 'hidden').length;
              else count = activeAndHidden.filter((i) => i.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedIds([]);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      cat === 'Trash' && count > 0
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                        : 'bg-[var(--card-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search caption, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          />
        </div>
      </div>

      {/* TRASH WARNING BANNER */}
      {selectedCategory === 'Trash' && trashedItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>Items in trash are automatically purged after 30 days. You can restore any item.</span>
          </div>
          <button
            onClick={handleEmptyTrash}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Empty Trash Now
          </button>
        </div>
      )}

      {/* MULTI-SELECT FLOATING / STICKY TOOLBAR */}
      {selectedCategory !== 'Trash' && displayedItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)] hover:text-[var(--gold)]"
            >
              {selectedIds.length === displayedItems.length && displayedItems.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[var(--gold)]" />
              ) : (
                <Square className="w-4 h-4 text-[var(--text-muted)]" />
              )}
              <span>
                {selectedIds.length > 0 ? `${selectedIds.length} of ${displayedItems.length} selected` : 'Select All'}
              </span>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleBulkHide}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] flex items-center gap-1"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                <span>Hide</span>
              </button>

              <button
                type="button"
                onClick={handleBulkShow}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                <span>Show</span>
              </button>

              {/* Move Category Dropdown */}
              <div className="flex items-center gap-1 bg-[var(--card-subtle)] border border-[var(--border)] rounded-xl pl-2 pr-1 py-0.5">
                <FolderInput className="w-3.5 h-3.5 text-[var(--gold)]" />
                <select
                  value={bulkCategoryTarget}
                  onChange={(e) => setBulkCategoryTarget(e.target.value as GalleryCategory)}
                  className="bg-transparent text-xs text-[var(--text)] py-1 focus:outline-none"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Bridal">Bridal</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Studio">Studio</option>
                </select>
                <button
                  type="button"
                  onClick={handleBulkMoveCategory}
                  className="px-2 py-1 rounded-lg text-xs font-bold bg-[var(--gold)] text-[#141008]"
                >
                  Move
                </button>
              </div>

              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Trash</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* GALLERY GRID */}
      {displayedItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--gold)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[var(--text)]">No gallery items found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {selectedCategory === 'Trash'
              ? 'Trash is clean. Trashed photos and videos stay here for 30 days.'
              : 'Upload high-resolution photography or paste video reels to showcase your work.'}
          </p>
          {selectedCategory !== 'Trash' && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--gold)] text-[#141008]"
            >
              Upload Media Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedItems.map((item) => {
            const isTrash = Boolean(item.deletedAt);
            const isSelected = selectedIds.includes(item.id);
            const daysLeft = isTrash ? calculateTrashDaysLeft(item.deletedAt) : 30;

            return (
              <div
                key={item.id}
                draggable={!isTrash}
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`group relative rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                  isTrash
                    ? 'bg-red-500/5 border-red-500/30 opacity-90'
                    : isSelected
                    ? 'border-[var(--gold)] ring-2 ring-[var(--gold)] bg-[var(--card)]'
                    : item.status === 'hidden'
                    ? 'bg-[var(--card)]/60 border-[var(--border)] opacity-75'
                    : 'bg-[var(--card)] border-[var(--border)] shadow-sm hover:border-[var(--gold)]/60'
                }`}
              >
                {/* Media Preview Container */}
                <div className="relative aspect-[4/3] bg-black/10 overflow-hidden">
                  {item.type === 'video' ? (
                    item.videoEmbedUrl ? (
                      <iframe
                        src={item.videoEmbedUrl}
                        title={item.title}
                        className="w-full h-full border-0 pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--card-subtle)] text-[var(--gold)]">
                        <Play className="w-10 h-10 fill-current" />
                        <span className="text-[11px] font-semibold mt-2">Video Link</span>
                      </div>
                    )
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Gradient Overlay for badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Bar on Card: Multi-select Checkbox + Reorder Grip */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    {!isTrash ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOne(item.id);
                        }}
                        className="p-1 rounded-lg bg-black/60 text-white hover:bg-black/80"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[var(--gold)]" />
                        ) : (
                          <Square className="w-4 h-4 text-white" />
                        )}
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                        {daysLeft}d left
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {item.featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--gold)] text-[#141008] flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Featured</span>
                        </span>
                      )}

                      {item.status === 'hidden' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-amber-300 border border-amber-300/40">
                          Hidden
                        </span>
                      )}

                      {!isTrash && (
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 rounded-lg bg-black/50 text-white hover:bg-black/70"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Pill at bottom left */}
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm border border-white/20">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Card Body: Caption & Description */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[var(--text)] line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    {isTrash ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestoreSingle(item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface)] flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[var(--gold)]" />
                          <span>Restore</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDeleteSingle(item)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded-lg"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--card-subtle)]"
                            title="Edit caption & details"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[var(--gold)]" />
                          </button>

                          {/* Replace Image */}
                          {item.type === 'image' && (
                            <button
                              type="button"
                              onClick={() => handleTriggerReplaceImage(item.id)}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-subtle)]"
                              title="Replace with new photo"
                            >
                              Replace
                            </button>
                          )}

                          {/* Featured toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(item)}
                            className={`p-1.5 rounded-lg ${
                              item.featured
                                ? 'text-[var(--gold)] hover:bg-[var(--card-subtle)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--card-subtle)]'
                            }`}
                            title={item.featured ? 'Remove from featured showcase' : 'Make featured on homepage'}
                          >
                            <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Hide / Show */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`p-1.5 rounded-lg ${
                              item.status === 'hidden'
                                ? 'text-amber-500 hover:bg-amber-500/10'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-subtle)]'
                            }`}
                            title={item.status === 'hidden' ? 'Show item' : 'Hide item'}
                          >
                            {item.status === 'hidden' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete to Trash */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(item)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-lg"
                            title="Move to trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          UPLOAD / ADD MEDIA MODAL (Drag & Drop + Video Link)
         ========================================== */}
      {isUploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => {
            if (!uploadProgress.active) setIsUploadOpen(false);
          }}
        >
          <div
            className="relative max-w-2xl w-full bg-[var(--surface)] text-[var(--text)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] space-y-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                  Portfolio Manager
                </span>
                <h3 className="font-serif text-2xl font-bold text-[var(--text)] mt-1">
                  Add Media to Hawi Gallery
                </h3>
              </div>

              {!uploadProgress.active && (
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Progress Bar Display */}
            {uploadProgress.active && (
              <div className="p-5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[var(--text)]">{uploadProgress.statusText}</span>
                  <span className="text-[var(--gold)] font-mono">{uploadProgress.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] transition-all duration-300"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* SECTION 1: DRAG & DROP MULTI-IMAGE UPLOAD */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                Option 1: Upload Photography (JPG, PNG, WEBP · Max 10MB)
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) {
                    handleFilesDropped(e.dataTransfer.files);
                  }
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/jpeg,image/png,image/webp';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleFilesDropped(files);
                  };
                  input.click();
                }}
                className="p-8 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--gold)] bg-[var(--card-subtle)] text-center cursor-pointer transition-colors space-y-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--gold)] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text)]">
                    Drag and drop multiple photos here
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Or click to browse from your computer. Files are automatically resized and optimized.
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: VIDEO REEL / CINEMA LINK */}
            <form onSubmit={handleAddVideo} className="space-y-3 pt-4 border-t border-[var(--border)]">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <Film className="w-4 h-4 text-[var(--gold)]" />
                <span>Option 2: Add Video Reel (YouTube, Vimeo, or MP4 Link)</span>
              </div>

              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="Paste YouTube, Vimeo or MP4 URL (e.g. https://www.youtube.com/watch?v=...)"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Video Title (e.g. Grand Skylight Reception Reel)"
                    value={videoTitleInput}
                    onChange={(e) => setVideoTitleInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                  />

                  <select
                    value={videoCategoryInput}
                    onChange={(e) => setVideoCategoryInput(e.target.value as GalleryCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-[var(--text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={videoFeaturedInput}
                      onChange={(e) => setVideoFeaturedInput(e.target.checked)}
                      className="rounded text-[var(--gold)] focus:ring-[var(--gold)]"
                    />
                    <span>Highlight as Featured on public homepage</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--gold)] text-[#141008] hover:brightness-105"
                  >
                    Add Video
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          EDIT SINGLE ITEM MODAL
         ========================================== */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="relative max-w-lg w-full bg-[var(--surface)] text-[var(--text)] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[var(--border)] space-y-5 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                  Edit Gallery Item
                </span>
                <h3 className="font-serif text-xl font-bold text-[var(--text)] mt-0.5">
                  Update Media Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Trilingual Tabs for Caption & Description */}
              <div className="p-3.5 rounded-2xl bg-[var(--card-subtle)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)]">
                    {t('admin.galleryManager.captionLabel')} & {t('admin.galleryManager.descLabel')}
                  </span>
                  <div className="flex items-center gap-1 p-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                    {(['EN', 'OM', 'AM'] as const).map((langCode) => {
                      const isMissing =
                        langCode === 'EN'
                          ? !editingItem.titleEnglish?.trim() && !editingItem.title?.trim()
                          : langCode === 'OM'
                          ? !editingItem.titleAfaanOromoo?.trim()
                          : !editingItem.titleAmharic?.trim();

                      const isActive = galleryEditLangTab === langCode;

                      return (
                        <button
                          key={langCode}
                          type="button"
                          onClick={() => setGalleryEditLangTab(langCode)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
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
                              {t('admin.galleryManager.missingTranslationTag')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {galleryEditLangTab === 'EN' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="font-semibold block mb-1 text-[var(--text)]">English Caption</label>
                      <input
                        type="text"
                        value={editingItem.titleEnglish || editingItem.title}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            title: e.target.value,
                            titleEnglish: e.target.value
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-[var(--text)]">English Description</label>
                      <textarea
                        rows={2}
                        value={editingItem.descriptionEnglish || editingItem.description}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            description: e.target.value,
                            descriptionEnglish: e.target.value
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                      />
                    </div>
                  </div>
                )}

                {galleryEditLangTab === 'OM' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="font-semibold block mb-1 text-[var(--text)]">Ibsa Suuraa (Afaan Oromoo)</label>
                      <input
                        type="text"
                        placeholder="fakkeenyaaf: Waraabsa suuraa cidhii addaa"
                        value={editingItem.titleAfaanOromoo || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            titleAfaanOromoo: e.target.value
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-[var(--text)]">Bal&apos;ina (Afaan Oromoo)</label>
                      <textarea
                        rows={2}
                        placeholder="Bal'ina suuraa kanaa Afaan Oromootiin"
                        value={editingItem.descriptionAfaanOromoo || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            descriptionAfaanOromoo: e.target.value
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                      />
                    </div>
                  </div>
                )}

                {galleryEditLangTab === 'AM' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="font-semibold block mb-1 text-[var(--text)]">የፎቶ መግለጫ (አማርኛ)</label>
                      <input
                        type="text"
                        placeholder="ለምሳሌ፦ ልዩ የሰርግ ፎቶግራፍ"
                        value={editingItem.titleAmharic || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            titleAmharic: e.target.value
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-[var(--text)]">ዝርዝር ማብራሪያ (አማርኛ)</label>
                      <textarea
                        rows={2}
                        placeholder="ስለ ፎቶው ዝርዝር ማብራሪያ በአማርኛ"
                        value={editingItem.descriptionAmharic || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            descriptionAmharic: e.target.value
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[var(--text)]">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as GalleryCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-[var(--text)]">Visibility</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as ItemStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.featured}
                  onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                  className="rounded text-[var(--gold)] focus:ring-[var(--gold)]"
                />
                <span className="text-[var(--text)]">Feature in main showcase</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--card-subtle)] text-[var(--text)] border border-[var(--border)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingItem) {
                    updateGalleryItem(editingItem.id, editingItem);
                    onShowToast(`Updated "${editingItem.title}"!`);
                    setEditingItem(null);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--gold)] text-[#141008]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
