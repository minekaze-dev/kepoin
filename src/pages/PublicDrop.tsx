/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ContentMenu } from '../components/ContentMenu';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  BarChart2, 
  Plus, 
  Music, 
  MapPin, 
  Link as LinkIcon, 
  X, 
  Camera, 
  Image,
  Type, 
  Hash, 
  CheckSquare,
  ChevronDown,
  MessageCircle,
  LayoutGrid,
  List,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { storage } from '../lib/storage';
import { DropBoard, DropResponse, ResponseType } from '../types';
import { useLanguage } from '../lib/i18n';

const REACTION_EMOJIS = ['❤️', '😂', '🔥', '👀', '👍'];

export const PublicDrop = () => {
  const { t, lang } = useLanguage();
  const { slug } = useParams();
  const [drop, setDrop] = useState<DropBoard | null>(null);
  const [responses, setResponses] = useState<DropResponse[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'top'>('recent');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTalksModalOpen, setIsTalksModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dropUserReactions, setDropUserReactions] = useState<string[]>([]);

  useEffect(() => {
    storage.checkAndNotifyExpiringDrops();
    const allDrops = storage.getDrops();
    const foundDrop = allDrops.find(d => d.slug === slug);
    if (foundDrop) {
      setDrop(foundDrop);
      setResponses(storage.getResponses(foundDrop.id));
      setIsSaved(storage.getSavedDrops().includes(foundDrop.id));
      const userReactions = storage.getUserReactions();
      setDropUserReactions(userReactions[foundDrop.id] || []);
    }
  }, [slug]);

  const isExpired = drop ? storage.isDropExpired(drop) : false;

  const handleToggleSave = () => {
    if (!drop) return;
    if (!storage.getIsLoggedIn()) {
      window.dispatchEvent(new Event('open-login-modal'));
      return;
    }
    const added = storage.toggleSaveDrop(drop.id);
    setIsSaved(added);
  };

  const handleDropReact = (emoji: string) => {
    if (!drop) return;
    if (!storage.getIsLoggedIn()) {
      window.dispatchEvent(new Event('open-login-modal'));
      return;
    }
    if (isExpired) return;
    storage.toggleDropReaction(drop.id, emoji);
    const allDrops = storage.getDrops();
    const found = allDrops.find(d => d.id === drop.id);
    if (found) setDrop(found);
    const userReactions = storage.getUserReactions();
    setDropUserReactions(userReactions[drop.id] || []);
  };

  const handleResponseAdded = () => {
    if (drop) {
      setResponses(storage.getResponses(drop.id));
    }
    setIsModalOpen(false);
  };

  const handleOpenDropYours = () => {
    if (!storage.getIsLoggedIn()) {
      window.dispatchEvent(new Event('open-login-modal'));
      return;
    }
    if (isExpired) return;
    setIsModalOpen(true);
  };

  if (!drop) return <div className="py-20 text-center dark:text-dark-muted">{t.public.notFound}</div>;

  const sortedResponses = [...responses].sort((a, b) => {
    if (sortBy === 'top') {
      const aLikes = (a.reactions || []).reduce((acc, curr) => acc + curr.count, 0);
      const bLikes = (b.reactions || []).reduce((acc, curr) => acc + curr.count, 0);
      return bLikes - aLikes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Back button */}
      <Link to="/" className="flex items-center gap-2 text-gray-400 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text text-[13px] font-medium transition-colors">
        <ArrowLeft size={16} />
        {t.public.back}
      </Link>

      {/* Expiration Notice Banner (Rule 9: Pertanyaan hanya aktif 3 hari) */}
      {isExpired && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-center gap-3 text-amber-900 dark:text-amber-200 text-[13px] shadow-xs">
          <Clock size={20} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="font-medium leading-snug">
            {lang === 'id' 
              ? 'Pertanyaan ini telah melewati masa aktif 3 hari dan telah berakhir. Jawaban baru dan obrolan telah ditutup.' 
              : 'This question has passed its 3-day active window and is now expired. New answers and talks are closed.'}
          </p>
        </div>
      )}

      {/* Hero / Header */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-orange-50 dark:bg-[#12A889]/10 text-[#12A889] dark:text-[#12A889] px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                  {t.create.types[drop.type.toUpperCase() as keyof typeof t.create.types] || drop.type}
                </span>
                <span className={`flex items-center gap-1 text-[11px] font-bold ${!isExpired && drop.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${!isExpired && drop.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-500'}`} />
                  {isExpired ? (lang === 'id' ? 'BERAKHIR' : 'EXPIRED') : drop.status}
                </span>
              </div>
              <h1 className="text-3xl font-black text-charcoal dark:text-dark-text uppercase leading-tight">
                {drop.prompt}
              </h1>
              {drop.description && (
                <p className="text-gray-500 dark:text-dark-muted text-[15px]">{drop.description}</p>
              )}
              
              {/* User-provided image for the drop board */}
              {drop.coverImage && (
                <div className="mt-4 w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-sm">
                  <img src={drop.coverImage} alt={drop.prompt} className="w-full h-auto object-cover max-h-[500px]" />
                </div>
              )}

              <div className="flex items-center justify-between gap-3 text-[13px] text-gray-400 dark:text-dark-muted pt-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-600 dark:text-dark-text">
                    {responses.length} {lang === 'en' ? (responses.length === 1 ? 'answer' : 'answers') : 'jawaban'}
                  </span>
                  <span>•</span>
                  <span>
                    {t.public.createdBy}{' '}
                    <Link 
                      to={`/profile/${storage.getUserById(drop.ownerId)?.username.replace('@', '') || ''}`}
                      className="hover:text-[#12A889] font-bold transition-colors"
                    >
                      {drop.ownerId === 'user_minekaze' ? t.public.you : (storage.getUserById(drop.ownerId)?.name || t.public.someone)}
                    </Link>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleToggleSave}
                    className={`p-2 rounded-lg border transition-all ${isSaved ? 'bg-orange-50 dark:bg-[#12A889]/10 border-orange-200 dark:border-[#12A889] text-[#12A889] dark:text-[#12A889]' : 'bg-white dark:bg-dark-surface border-gray-100 dark:border-dark-border text-gray-400 dark:text-dark-muted hover:border-gray-200 dark:hover:border-dark-muted'}`}
                  >
                    <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(url);
                      alert(lang === 'en' ? 'Share link copied to clipboard!' : 'Tautan berhasil disalin ke clipboard!');
                    }}
                    className="p-2 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-gray-400 dark:text-dark-muted hover:border-gray-200 dark:hover:border-dark-muted rounded-lg transition-all"
                  >
                    <Share2 size={16} />
                  </button>
                  <ContentMenu 
                    targetType="ASK" 
                    targetId={drop.id} 
                    targetTitle={drop.prompt} 
                    targetContent={drop.description} 
                    targetOwnerName={storage.getUserById(drop.ownerId)?.name} 
                    targetOwnerUsername={storage.getUserById(drop.ownerId)?.username} 
                    targetOwnerId={drop.ownerId}
                    isSaved={isSaved}
                    onToggleSave={handleToggleSave}
                  />
                </div>
              </div>

              {/* Reaction Bar on Drop Board (Rule 3: Reaction ❤️ 😂 🔥 👀 👍) */}
              <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center flex-wrap gap-2">
                <span className="text-[12px] font-bold text-gray-400 dark:text-dark-muted mr-1">
                  {lang === 'id' ? 'Reaksi Pertanyaan:' : 'Question Reactions:'}
                </span>
                {REACTION_EMOJIS.map((emoji) => {
                  const isUserReacted = dropUserReactions.includes(emoji);
                  const count = (drop.reactions?.find(r => r.emoji === emoji)?.count) || 0;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      disabled={isExpired}
                      onClick={() => handleDropReact(emoji)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                        isUserReacted 
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400 dark:ring-amber-600 scale-105' 
                          : 'bg-gray-50 dark:bg-dark-bg text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border hover:scale-105'
                      } ${isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="text-[11px] font-black">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-8 pb-6 md:pb-8">
          <button 
            onClick={handleOpenDropYours}
            disabled={isExpired || drop.status !== 'ACTIVE'}
            className={`
              w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[16px] font-black transition-all shadow-lg
              ${!isExpired && drop.status === 'ACTIVE'
                ? 'bg-[#12A889] text-white hover:bg-[#12A889] shadow-[#12A889]/20 cursor-pointer' 
                : 'bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-dark-muted cursor-not-allowed'}
            `}
          >
            {isExpired ? (lang === 'id' ? 'Pertanyaan Berakhir (Ditutup)' : 'Question Expired (Closed)') : t.public.dropMine}
          </button>
        </div>
      </div>


      {/* What They Dropped */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-charcoal dark:text-dark-text">{t.public.community}</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 dark:bg-dark-bg p-1 rounded-lg border border-gray-200 dark:border-dark-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-dark-surface shadow-xs text-charcoal dark:text-dark-text' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-dark-surface shadow-xs text-charcoal dark:text-dark-text' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'top')}
              className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg px-3 py-1.5 text-[13px] font-semibold outline-none text-gray-600 dark:text-dark-text hover:text-charcoal cursor-pointer shadow-xs"
            >
              <option value="recent">{t.public.recentFirst}</option>
              <option value="top">{t.public.topLiked}</option>
            </select>
          </div>
        </div>

        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
          <AnimatePresence mode="popLayout">
            {sortedResponses.map((resp) => (
              <ResponseCard 
                key={resp.id} 
                response={resp} 
                drop={drop}
                type={drop.type} 
                isOwner={resp.userId === drop.ownerId} 
                onPhotoClick={setSelectedPhoto}
                allowTalks={drop.settings.allowTalks}
                viewMode={viewMode}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {responses.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border border-dashed rounded-2xl">
            <p className="text-gray-400 dark:text-dark-muted">{t.public.noDrops}</p>
          </div>
        )}
      </section>

      {/* Modal */}
      <RespondModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        drop={drop}
        onSuccess={handleResponseAdded}
      />

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedPhoto} 
                alt="Enlarged drop" 
                className="max-w-[95vw] max-h-[95vh] object-contain rounded-xl shadow-2xl" 
              />
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 font-bold"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResponseCard = ({ response, drop, type, isOwner, onPhotoClick, allowTalks = true, viewMode = 'grid' }: { response: DropResponse, drop?: DropBoard | null, type: ResponseType, isOwner?: boolean, onPhotoClick?: (url: string) => void, allowTalks?: boolean, viewMode?: 'grid' | 'list', key?: React.Key }) => {
  const { t, lang } = useLanguage();
  const [localResponse, setLocalResponse] = useState(response);
  const [localReactions, setLocalReactions] = useState(response.reactions || []);
  const [userReactedEmojis, setUserReactedEmojis] = useState<string[]>([]);
  const [isTalksExpanded, setIsTalksExpanded] = useState(false);
  const [isTalkAnon, setIsTalkAnon] = useState(false);

  const isExpired = drop ? storage.isDropExpired(drop) : false;

  useEffect(() => {
    const userReactions = storage.getUserReactions();
    setUserReactedEmojis(userReactions[response.id] || []);
    setLocalResponse(response);
    setLocalReactions(response.reactions || []);
  }, [response]);

  const handleReact = (emoji: string) => {
    if (!storage.getIsLoggedIn()) {
      window.dispatchEvent(new Event('open-login-modal'));
      return;
    }
    if (isExpired) return;
    storage.toggleReaction(response.id, emoji);
    
    // Refresh local
    const updatedResponses = storage.getResponses();
    const updated = updatedResponses.find(r => r.id === response.id);
    if (updated) {
      setLocalResponse(updated);
      setLocalReactions(updated.reactions || []);
    }
    const userReactions = storage.getUserReactions();
    setUserReactedEmojis(userReactions[response.id] || []);
  };

  const isListMode = viewMode === 'list' && type === 'PHOTO';

  const renderContent = () => {
    switch (type) {
      case 'PHOTO':
        return (
          <div 
            className={`${isListMode ? 'aspect-square w-full h-full' : 'aspect-[4/3] sm:aspect-video w-full mb-3'} rounded-xl overflow-hidden bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border cursor-pointer relative group shrink-0`}
            onClick={() => onPhotoClick?.(response.content)}
          >
            <img 
              src={response.content} 
              alt={response.caption || 'Response photo'} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white bg-black/60 px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-[12px] font-bold backdrop-blur-xs transition-opacity shadow-sm">
                Lihat
              </span>
            </div>
          </div>
        );
      case 'NUMBER':
        const numVal = Number(response.content);
        const formattedNum = !isNaN(numVal) && numVal >= 1000 
          ? `Rp ${numVal.toLocaleString('id-ID')}` 
          : (!isNaN(numVal) ? numVal.toLocaleString('id-ID') : String(response.content));
        return (
          <div className="py-4 px-5 bg-orange-50/70 dark:bg-[#12A889]/10 rounded-xl border border-orange-200/50 dark:border-[#12A889]/20 flex flex-col items-center justify-center mb-3">
            <span className="text-3xl font-black text-[#12A889] dark:text-orange-400 tracking-tight">{formattedNum}</span>
          </div>
        );
      case 'CHOICE':
        return (
          <div className="py-3.5 px-5 bg-orange-50/90 dark:bg-[#12A889]/10 text-orange-800 dark:text-orange-300 font-bold rounded-xl mb-3 border border-orange-200/80 dark:border-[#12A889]/30 text-center text-[15px] sm:text-[16px] leading-snug flex items-center justify-center shadow-xs">
            <span className="truncate-none">{response.content}</span>
          </div>
        );
      case 'SONG':
        return (
          <div className="flex items-center gap-3.5 p-3.5 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100/80 dark:border-purple-900/30 rounded-xl mb-3">
            <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center rounded-xl shrink-0">
              <Music size={22} />
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="font-bold text-[14px] text-gray-900 dark:text-dark-text truncate">
                {typeof response.content === 'object' ? response.content.title : String(response.content)}
              </p>
              {typeof response.content === 'object' && response.content.artist && (
                <p className="text-[12px] text-gray-500 dark:text-dark-muted truncate">{response.content.artist}</p>
              )}
            </div>
          </div>
        );
      case 'PLACE':
        return (
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl mb-3 border border-emerald-100/80 dark:border-emerald-900/30">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center rounded-xl shrink-0">
              <MapPin size={20} />
            </div>
            <span className="text-[14px] font-bold text-gray-900 dark:text-dark-text truncate">
              {typeof response.content === 'object' ? `${response.content.name}, ${response.content.city}` : String(response.content)}
            </span>
          </div>
        );
      case 'TEXT':
        return (
          <div className="text-[14.5px] text-gray-800 dark:text-dark-text bg-gray-50/80 dark:bg-dark-bg/60 p-4 rounded-xl border border-gray-100 dark:border-dark-border mb-3 italic leading-relaxed">
            "{response.content}"
          </div>
        );
      default:
        return null; } }; return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white dark:bg-dark-surface p-4 rounded-2xl flex shadow-xs border transition-shadow hover:shadow-md ${isOwner ? 'border-2 border-[#12A889] shadow-[#12A889]/10' : 'border-gray-100 dark:border-dark-border'} ${isListMode ? 'flex-row items-start gap-4' : 'flex-col'}`}
    >
      {isOwner && (
        <div className="absolute -top-3 -right-2 bg-[#12A889] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md border-2 border-white dark:border-dark-surface z-10 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Creator
        </div>
      )}

      {isListMode && (
        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0">
          {renderContent()}
        </div>
      )}

      <div className={`flex flex-col min-w-0 ${isListMode ? 'flex-1 h-24 sm:h-32 justify-between' : 'w-full'}`}>
        <div className={`flex items-center gap-2.5 ${isListMode ? 'mb-1' : 'mb-3.5'}`}>
          <Link 
            to={`/profile/${response.userId ? storage.getUserById(response.userId)?.username.replace('@', '') : response.userName.toLowerCase()}`}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-dark-bg overflow-hidden border border-gray-100 dark:border-dark-border flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${response.userName}`} alt="avatar" />
          </Link>
          <div className="flex items-center gap-1.5 min-w-0">
            <Link 
              to={`/profile/${response.userId ? storage.getUserById(response.userId)?.username.replace('@', '') : response.userName.toLowerCase()}`}
              className="text-[13px] font-bold dark:text-dark-text truncate hover:text-[#12A889] transition-colors"
            >
              {response.userName}
            </Link>
            {isOwner && (
              <span className="text-[9px] font-bold bg-orange-100 dark:bg-[#12A889]/20 text-[#12A889] dark:text-orange-400 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                Creator
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 dark:text-dark-muted ml-auto flex-shrink-0">
            {new Date(response.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
          <ContentMenu 
            targetType="ANSWER" 
            targetId={response.id} 
            targetContent={String(response.content)} 
            targetOwnerName={response.userName} 
            targetOwnerUsername={response.userId ? storage.getUserById(response.userId)?.username : undefined} 
            targetOwnerId={response.userId}
          />
        </div>

        {!isListMode && renderContent()}

        {response.caption && (
          <p className={`text-[13.5px] text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed ${isListMode ? '' : 'mb-4'}`}>{response.caption}</p>
        )}

        {/* Reactions Bar on Answer Card */}
        <div className={`mt-auto flex items-center justify-between border-gray-50 dark:border-dark-border ${isListMode ? 'pt-1' : 'border-t pt-3'}`}>
          <div className="flex items-center flex-wrap gap-1.5">
            {REACTION_EMOJIS.map((emoji) => {
              const isUserReacted = userReactedEmojis.includes(emoji);
              const count = (localReactions.find(r => r.emoji === emoji)?.count) || 0;
              return (
                <button 
                  key={emoji}
                  disabled={isExpired}
                  onClick={() => handleReact(emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                    isUserReacted 
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400' 
                      : 'bg-gray-50 dark:bg-dark-bg text-gray-400 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                  } ${isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span>{emoji}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}

            {allowTalks && (
              <button 
                onClick={() => setIsTalksExpanded(!isTalksExpanded)}
                className={`flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${isTalksExpanded ? 'bg-orange-50 dark:bg-[#12A889]/10 text-[#12A889]' : 'bg-gray-50 dark:bg-dark-bg text-gray-400 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer'}`}
              >
                <MessageCircle size={13} fill={isTalksExpanded ? 'currentColor' : 'none'} />
                <span>{localResponse.talks?.length || 0}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isTalksExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setIsTalksExpanded(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-4xl shadow-2xl relative my-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Column: Drop Image & Content Preview */}
              <div className="w-full md:w-1/2 bg-gray-50 dark:bg-dark-bg p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 dark:border-dark-border overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
                <div>
                  {drop && (
                    <div className="mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-[#12A889]/20 text-[#12A889] dark:text-orange-400 px-2.5 py-1 rounded-full">
                        {drop.type}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text mt-2">{drop.prompt}</h2>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-border overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${response.userName}`} alt="avatar" className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold dark:text-dark-text">{response.userName}</p>
                      <p className="text-[10px] text-gray-400">{lang === 'id' ? 'Jawaban' : 'Response'}</p>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden mb-4 bg-black/5">
                    {renderContent()}
                  </div>

                  {response.caption && (
                    <p className="text-[13px] text-gray-700 dark:text-gray-300 mb-4">{response.caption}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-dark-border flex-wrap">
                  {REACTION_EMOJIS.map(emoji => {
                    const count = (localReactions.find(r => r.emoji === emoji)?.count) || 0;
                    if (count === 0) return null;
                    return (
                      <span key={emoji} className="flex items-center gap-1 font-bold bg-white dark:bg-dark-surface px-2 py-0.5 rounded-full border border-gray-200 dark:border-dark-border">
                        {emoji} {count}
                      </span>
                    );
                  })}
                  <div className="flex items-center gap-1.5 font-bold text-[#12A889] ml-auto">
                    <MessageCircle size={15} fill="currentColor" />
                    {localResponse.talks?.length || 0} {lang === 'en' ? (localResponse.talks?.length === 1 ? 'Talk' : 'Talks') : 'Obrolan'}
                  </div>
                </div>
              </div>

              {/* Right Column: Comments / Talks Stream & Input */}
              <div className="w-full md:w-1/2 flex flex-col max-h-[50vh] md:max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">
                  <h3 className="font-bold text-gray-900 dark:text-dark-text text-[15px]">
                    {lang === 'en' ? 'Talks & Comments' : (lang === 'slank' ? 'Obrolan (Talks)' : 'Obrolan (Talks)')}
                  </h3>
                  <button onClick={() => setIsTalksExpanded(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-dark-muted hover:bg-gray-200 dark:hover:bg-dark-border flex items-center justify-center transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {(!localResponse.talks || localResponse.talks.length === 0) && (
                    <div className="text-center py-12 text-gray-400 dark:text-dark-muted text-[13px]">
                      {lang === 'id' ? 'Belum ada obrolan. Jadilah yang pertama berkomentar!' : 'No talks yet. Be the first to talk!'}
                    </div>
                  )}
                  {localResponse.talks?.map(talk => (
                    <div key={talk.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-border flex-shrink-0 overflow-hidden">
                         <img src={talk.isAnonymous ? `https://api.dicebear.com/7.x/avataaars/svg?seed=Anon` : (talk.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${talk.userName}`)} alt="avatar" className="w-full h-full" />
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-dark-bg rounded-2xl px-4 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold dark:text-dark-text">
                            {talk.userName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(talk.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed mt-1">{talk.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 text-[12px] font-medium text-gray-600 dark:text-dark-muted cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isTalkAnon} 
                        onChange={(e) => setIsTalkAnon(e.target.checked)}
                        className="rounded text-[#12A889] focus:ring-[#12A889]"
                      />
                      <span>{lang === 'id' ? 'Kirim sebagai Anonim' : 'Send as Anonymous'}</span>
                    </label>
                    {isExpired && (
                      <span className="text-[11px] font-bold text-red-500">
                        {lang === 'id' ? 'Obrolan ditutup (expired)' : 'Talks closed (expired)'}
                      </span>
                    )}
                  </div>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!storage.getIsLoggedIn()) {
                        window.dispatchEvent(new Event('open-login-modal'));
                        return;
                      }
                      if (isExpired) return;
                      const form = e.target as HTMLFormElement;
                      const input = form.elements.namedItem('talk') as HTMLInputElement;
                      const text = input.value.trim();
                      if (text) {
                        const currentUser = storage.getUser();
                        const talkUserName = isTalkAnon ? (lang === 'id' ? 'Seseorang (Anonim)' : 'Anonymous') : currentUser.name;
                        const newTalk = {
                          id: Math.random().toString(36).substr(2, 9),
                          userName: talkUserName,
                          avatar: isTalkAnon ? undefined : (currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`),
                          content: text,
                          isAnonymous: isTalkAnon,
                          createdAt: new Date().toISOString()
                        };
                        const updatedResponse = { ...localResponse, talks: [...(localResponse.talks || []), newTalk] };
                        storage.updateResponse(updatedResponse);
                        setLocalResponse(updatedResponse);

                        if (drop) {
                          // Rule 2: TALK / OBROLAN notification to Drop Owner
                          const actorDisplayName = isTalkAnon ? (lang === 'id' ? 'Seseorang (Anonim)' : 'Someone (Anonymous)') : currentUser.name;
                          storage.addNotification({
                            userId: drop.ownerId,
                            actorName: actorDisplayName,
                            actorAvatar: isTalkAnon ? undefined : currentUser.avatar,
                            type: 'TALK',
                            message: lang === 'id' ? 'ikut ngobrol di pertanyaanmu.' : 'joined the talk on your question.',
                            dropId: drop.id,
                            dropSlug: drop.slug,
                            dropPrompt: drop.prompt,
                            responseId: response.id,
                            talkId: newTalk.id,
                            priority: 'HIGH',
                            linkUrl: `/drop/${drop.slug}`
                          });

                          // Rule 5: MENTION notification
                          storage.handleMentionsInTalk({
                            content: text,
                            actorId: currentUser.id,
                            actorName: currentUser.name,
                            actorAvatar: isTalkAnon ? undefined : currentUser.avatar,
                            isAnonymous: isTalkAnon,
                            dropId: drop.id,
                            dropSlug: drop.slug,
                            dropPrompt: drop.prompt,
                            responseId: response.id,
                          });
                        }

                        input.value = '';
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      type="text" 
                      name="talk"
                      disabled={isExpired}
                      placeholder={isExpired ? (lang === 'id' ? 'Pertanyaan telah berakhir' : 'Question has expired') : (lang === 'id' ? 'Tulis obrolan... (@username untuk mention)' : 'Add a talk... (@username to mention)')}
                      className="flex-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#12A889] dark:text-dark-text transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="off"
                    />
                    <button 
                      type="submit" 
                      disabled={isExpired}
                      className="bg-[#12A889] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#12A889] transition-colors shadow-md shadow-[#12A889]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {lang === 'id' ? 'Kirim' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const RespondModal = ({ isOpen, onClose, drop, onSuccess }: { isOpen: boolean, onClose: () => void, drop: DropBoard, onSuccess: () => void }) => {
  const { t, lang } = useLanguage();
  const currentUser = storage.getUser();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState<any>('');
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setContent(result);
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && drop.type !== 'PHOTO') return;
    if (drop.type === 'PHOTO' && !preview && !content) return;
    
    const responderName = isAnonymous ? (lang === 'id' ? 'Anonim' : 'Anonymous') : currentUser.name;
    const responderId = isAnonymous ? undefined : currentUser.id;

    const newResponse: DropResponse = {
      id: Math.random().toString(36).substr(2, 9),
      dropId: drop.id,
      userName: responderName,
      userId: responderId,
      isAnonymous,
      content: drop.type === 'SONG' ? { title: content.title, artist: content.artist } : 
               drop.type === 'PLACE' ? { name: content.name, city: content.city } : content,
      caption,
      createdAt: new Date().toISOString(),
      reactions: []
    };

    storage.saveResponse(newResponse);

    // Dispatch notification (Rule 1: JAWABAN)
    const actorDisplayName = isAnonymous ? (lang === 'id' ? 'Seseorang' : 'Someone') : currentUser.name;
    storage.addNotification({
      userId: drop.ownerId,
      actorName: actorDisplayName,
      actorAvatar: isAnonymous ? undefined : (currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`),
      type: 'RESPONSE',
      message: lang === 'id' ? 'menjawab pertanyaanmu.' : 'answered your question.',
      dropId: drop.id,
      dropSlug: drop.slug,
      dropPrompt: drop.prompt,
      responseId: newResponse.id,
      priority: 'HIGH',
      linkUrl: `/drop/${drop.slug}`
    });

    onSuccess();
    // Reset
    setContent('');
    setCaption('');
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border dark:border-dark-border"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-[18px] font-bold dark:text-dark-text">{t.public.modalTitle}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-5">
            {/* Responder Identity Card (Auto from username & account) */}
            <div className="bg-orange-50/70 dark:bg-[#12A889]/10 border border-orange-200/60 dark:border-[#12A889]/20 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-[#12A889]/30 overflow-hidden shrink-0 flex items-center justify-center">
                  {isAnonymous ? (
                    <span className="text-lg">🕶️</span>
                  ) : (
                    <img 
                      src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} 
                      alt={currentUser.name} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-dark-muted">
                    {lang === 'id' ? 'Menjawab sebagai' : 'Responding as'}
                  </p>
                  <p className="text-[13.5px] font-bold text-gray-900 dark:text-dark-text truncate">
                    {isAnonymous ? (lang === 'id' ? 'Anonim' : 'Anonymous') : currentUser.name}
                    {!isAnonymous && (
                      <span className="text-[12px] font-normal text-gray-500 dark:text-dark-muted ml-1.5">
                        {currentUser.username}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {drop.settings.allowAnonymous && (
                <label className="flex items-center gap-2 cursor-pointer shrink-0 bg-white dark:bg-dark-surface px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border shadow-2xs hover:border-orange-300 transition-colors">
                  <input 
                    type="checkbox" 
                    className="accent-[#12A889] cursor-pointer w-3.5 h-3.5"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span className="text-[11.5px] font-semibold text-gray-700 dark:text-dark-text whitespace-nowrap">
                    {lang === 'id' ? 'Anonim' : 'Anon'}
                  </span>
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold dark:text-dark-text">{t.public.responseLabel}</label>
              
              {drop.type === 'PHOTO' && (
                <div className="space-y-3">
                  <div className="w-full h-40 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-orange-200 dark:hover:border-[#12A889] transition-colors">
                    {preview ? (
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Image size={32} className="text-gray-300 dark:text-dark-muted" />
                        <span className="text-[12px] text-gray-400 dark:text-dark-muted font-medium">{t.public.photoPlaceholder}</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}

              {drop.type === 'TEXT' && (
                <textarea 
                  placeholder={t.public.textPlaceholder}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-lg px-4 py-3 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text min-h-[100px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              )}

              {drop.type === 'NUMBER' && (
                <input 
                  type="number" 
                  placeholder={t.public.numberPlaceholder}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-lg px-4 py-3 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              )}

              {drop.type === 'CHOICE' && (
                <div className="grid grid-cols-1 gap-2">
                  {drop.settings.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setContent(opt)}
                      className={`
                        w-full text-left px-4 py-3 rounded-lg text-[14px] font-bold border transition-all
                        ${content === opt 
                          ? 'bg-orange-50 dark:bg-[#12A889]/10 border-orange-200 dark:border-[#12A889] text-[#12A889] dark:text-[#12A889]' 
                          : 'bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border'}
                      `}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {drop.type === 'SONG' && (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder={t.public.songTitle}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text"
                    value={content.title || ''}
                    onChange={(e) => setContent({...content, title: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder={t.public.songArtist}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text"
                    value={content.artist || ''}
                    onChange={(e) => setContent({...content, artist: e.target.value})}
                  />
                </div>
              )}

              {drop.type === 'PLACE' && (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder={t.public.placeName}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text"
                    value={content.name || ''}
                    onChange={(e) => setContent({...content, name: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder={t.public.placeCity}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text"
                    value={content.city || ''}
                    onChange={(e) => setContent({...content, city: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold dark:text-dark-text">{t.public.captionLabel}</label>
              <input 
                type="text" 
                placeholder={t.public.captionPlaceholder}
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-orange-200 dark:focus:border-[#12A889] dark:text-dark-text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[#12A889] text-white rounded-xl font-black text-[16px] hover:bg-[#12A889] transition-all shadow-lg shadow-[#12A889]/20"
          >
            {t.public.submitDrop}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
