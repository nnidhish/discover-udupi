'use client';
import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { reviewService } from '@/lib/supabase';

const PAGE_SIZE = 5;

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  createdAt: string;
  helpfulCount: number;
  isVerified: boolean;
  visitDate?: string;
}

interface ReviewSystemProps {
  locationId: string;
  locationName: string;
  initialReviews: Review[];
  onReviewSubmit: (review: Partial<Review>) => Promise<boolean>;
  currentUserId?: string;
}

// ── Main component ────────────────────────────────────────────────
const ReviewSystem: React.FC<ReviewSystemProps> = ({
  locationId,
  locationName,
  initialReviews,
  onReviewSubmit,
  currentUserId,
}) => {
  const [reviews, setReviews]           = useState<Review[]>(initialReviews);
  const [offset, setOffset]             = useState(initialReviews.length);
  const [hasMore, setHasMore]           = useState(initialReviews.length >= PAGE_SIZE);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy]             = useState<'newest' | 'rating' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Sync when parent refreshes reviews (new submission or location change)
  useEffect(() => {
    setReviews(initialReviews);
    setOffset(initialReviews.length);
    setHasMore(initialReviews.length >= PAGE_SIZE);
  }, [initialReviews]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count:      reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0,
  }));

  const displayedReviews = reviews
    .filter(r => filterRating ? r.rating === filterRating : true)
    .sort((a, b) => {
      if (sortBy === 'rating')  return b.rating - a.rating;
      if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const loadMore = async () => {
    setLoadingMore(true);
    const { data, error } = await reviewService.getLocationReviews(locationId, PAGE_SIZE, offset);
    if (!error && data && data.length > 0) {
      // Map Supabase rows to Review shape
      type Row = {
        id: string; user_id: string; rating: number; title: string | null;
        comment: string; visit_date: string | null; helpful_count: number | null;
        created_at: string;
        profiles?: { full_name?: string | null; avatar_url?: string | null; is_verified?: boolean | null } | null;
        review_images?: { url: string }[] | null;
      };
      const mapped: Review[] = (data as Row[]).map(r => ({
        id: r.id, userId: r.user_id,
        userName:    r.profiles?.full_name  || 'Explorer',
        userAvatar:  r.profiles?.avatar_url || '/icon-192x192.png',
        rating:      r.rating,
        title:       r.title ?? '',
        comment:     r.comment,
        images:      (r.review_images ?? []).map(ri => ri.url),
        createdAt:   r.created_at,
        helpfulCount: r.helpful_count ?? 0,
        isVerified:  r.profiles?.is_verified ?? false,
        visitDate:   r.visit_date ?? undefined,
      }));
      setReviews(prev => [...prev, ...mapped]);
      setOffset(prev => prev + mapped.length);
      setHasMore(mapped.length >= PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  const handleVote = async (reviewId: string, vote: 'up' | 'down', currentVote: 'up' | 'down' | null) => {
    if (!currentUserId) { toast.error('Sign in to vote'); return; }
    const newVote = currentVote === vote ? null : vote;
    await reviewService.voteOnReview(reviewId, currentUserId, newVote);
    // Optimistic update of helpfulCount reflected via ReviewCard's own state
  };

  const handleReport = async (reviewId: string) => {
    if (!currentUserId) { toast.error('Sign in to report a review'); return; }
    const { error } = await reviewService.reportReview(reviewId, currentUserId);
    if (error) {
      toast.error('Could not submit report');
    } else {
      toast.success('Review reported. We\'ll look into it.');
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Rating overview ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Big number + write CTA */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${
                    i < Math.floor(averageRating)
                      ? 'text-amber-400 fill-current'
                      : i < averageRating
                      ? 'text-amber-400 fill-current opacity-50'
                      : 'text-gray-200'
                  }`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-5 py-2 text-sm font-semibold text-white rounded-full transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
            >
              Write a Review
            </button>
          </div>

          {/* Distribution bars */}
          <div className="space-y-1.5">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`flex items-center gap-2 w-full group rounded-lg px-1 py-0.5 transition-colors ${
                  filterRating === rating ? 'bg-amber-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-xs font-medium text-gray-500 w-4">{rating}</span>
                <Star className="w-3 h-3 text-amber-400 fill-current" />
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sort + filter row ── */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="text-sm px-3 py-1.5 border border-gray-200 rounded-full focus:ring-1 focus:ring-amber-400 outline-none bg-white text-gray-700"
        >
          <option value="newest">Newest first</option>
          <option value="rating">Highest rating</option>
          <option value="helpful">Most helpful</option>
        </select>
        {filterRating && (
          <button
            onClick={() => setFilterRating(null)}
            className="text-sm px-3 py-1.5 border border-amber-300 bg-amber-50 text-amber-700 rounded-full flex items-center gap-1"
          >
            {filterRating}★ only <span className="text-amber-400 ml-0.5">×</span>
          </button>
        )}
      </div>

      {/* ── Reviews list ── */}
      {displayedReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-1">No reviews yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Be the first to share your experience at {locationName}
          </p>
          <button
            onClick={() => setShowWriteReview(true)}
            className="text-sm px-5 py-2 font-semibold text-white rounded-full"
            style={{ background: 'var(--primary)' }}
          >
            Write the first review
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onVote={handleVote}
              onReport={handleReport}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loadingMore
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
                : 'Load more reviews'
              }
            </button>
          )}
        </div>
      )}

      {/* ── Write review modal ── */}
      {showWriteReview && (
        <WriteReviewModal
          locationName={locationName}
          onClose={() => setShowWriteReview(false)}
          onSubmit={onReviewSubmit}
        />
      )}
    </div>
  );
};

// ── Review Card ───────────────────────────────────────────────────
const ReviewCard: React.FC<{
  review: Review;
  currentUserId?: string;
  onVote: (reviewId: string, vote: 'up' | 'down', currentVote: 'up' | 'down' | null) => void;
  onReport: (reviewId: string) => void;
}> = ({ review, currentUserId, onVote, onReport }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [userVote, setUserVote]         = useState<'up' | 'down' | null>(null);
  const [reported, setReported]         = useState(false);
  const [expanded, setExpanded]         = useState(false);

  const shouldTruncate = review.comment.length > 280;
  const displayComment = shouldTruncate && !expanded
    ? review.comment.slice(0, 280) + '…'
    : review.comment;

  const vote = (type: 'up' | 'down') => {
    const prev = userVote;
    // Optimistic state update
    if (prev === type) {
      setUserVote(null);
      setHelpfulCount(c => type === 'up' ? c - 1 : c + 1);
    } else {
      if (prev) setHelpfulCount(c => prev === 'up' ? c - 2 : c + 2);
      else      setHelpfulCount(c => type === 'up' ? c + 1 : c - 1);
      setUserVote(type);
    }
    onVote(review.id, type, prev);
  };

  const report = () => {
    if (reported) return;
    setReported(true);
    onReport(review.id);
  };

  const dateStr = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Image
            src={review.userAvatar}
            alt={review.userName}
            width={40}
            height={40}
            className="rounded-full object-cover flex-shrink-0 border border-gray-100"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-gray-900">{review.userName}</span>
              {review.isVerified && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${
                    i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'
                  }`} />
                ))}
              </div>
              <span className="text-xs text-gray-400">{dateStr}</span>
              {review.visitDate && (
                <span className="text-xs text-gray-400">
                  · visited {new Date(review.visitDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Flag */}
        <button
          onClick={report}
          disabled={reported}
          className={`p-1.5 rounded-full transition-colors ${
            reported ? 'text-gray-300 cursor-default' : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
          }`}
          title={reported ? 'Reported' : 'Report this review'}
          aria-label="Report review"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      {review.title && (
        <p className="font-semibold text-gray-900 mb-1 text-sm">{review.title}</p>
      )}
      <p className="text-gray-600 text-sm leading-relaxed">
        {displayComment}
        {shouldTruncate && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="ml-1 font-medium text-amber-600 hover:text-amber-700"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {/* Review images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {review.images.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt={`Review photo ${i + 1}`}
              width={96}
              height={72}
              className="rounded-lg object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Vote row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => vote('up')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              userVote === 'up'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ''}
          </button>
          <button
            onClick={() => vote('down')}
            className={`p-1.5 rounded-full transition-colors ${
              userVote === 'down'
                ? 'bg-red-100 text-red-500'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            aria-label="Not helpful"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
        {!currentUserId && (
          <span className="text-xs text-gray-400">Sign in to vote</span>
        )}
      </div>
    </div>
  );
};

// ── Write Review Modal ────────────────────────────────────────────
const WriteReviewModal: React.FC<{
  locationName: string;
  onClose: () => void;
  onSubmit: (review: Partial<Review>) => Promise<boolean>;
}> = ({ locationName, onClose, onSubmit }) => {
  const [rating, setRating]       = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle]         = useState('');
  const [comment, setComment]     = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) { toast.error('Please write your review'); return; }
    setSubmitting(true);
    const ok = await onSubmit({ rating, title, comment, visitDate });
    setSubmitting(false);
    if (ok) onClose();
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
              <p className="text-sm text-gray-500">{locationName}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 text-xl leading-none">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star className={`w-8 h-8 transition-colors ${
                      star <= activeRating ? 'text-amber-400 fill-current' : 'text-gray-200'
                    }`} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500 self-center">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][activeRating]}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your review <span className="text-red-400">*</span></label>
              <textarea
                value={comment}
                onChange={e => { if (e.target.value.length <= 1000) setComment(e.target.value); }}
                rows={4}
                placeholder="Share what you liked, tips for other visitors, what to avoid…"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-amber-400 focus:border-transparent outline-none resize-none"
                required
              />
              <p className={`text-xs mt-1 text-right ${comment.length >= 950 ? 'text-red-500' : 'text-gray-400'}`}>
                {comment.length}/1000
              </p>
            </div>

            {/* Visit date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">When did you visit? <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="date"
                value={visitDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setVisitDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-amber-400 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <><Send className="w-4 h-4" /> Submit Review</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewSystem;
