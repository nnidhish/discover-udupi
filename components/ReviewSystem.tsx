// components/ReviewSystem.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, Camera, Send } from 'lucide-react';
import Image from 'next/image';
import type { Map as LeafletMapType, Marker } from 'leaflet';

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
  onReviewSubmit: (review: Partial<Review>) => void;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ 
  locationId, 
  locationName, 
  initialReviews, 
  onReviewSubmit 
}) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const mapInstanceRef = useRef<LeafletMapType | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // Calculate average rating and distribution
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpfulCount - a.helpfulCount;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-500 fill-current'
                        : i < averageRating
                        ? 'text-yellow-500 fill-current opacity-50'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600">{reviews.length} reviews</p>
            <button
              onClick={() => setShowWriteReview(true)}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              Write a Review
            </button>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating' | 'helpful')}
            className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
          
          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedAndFilteredReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
        
        {sortedAndFilteredReviews.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No reviews match your criteria.</p>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
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

// Individual Review Card Component
const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [showFullComment, setShowFullComment] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleHelpful = (type: 'up' | 'down') => {
    if (userVote === type) {
      setUserVote(null);
      setHelpfulCount(prev => type === 'up' ? prev - 1 : prev + 1);
    } else {
      if (userVote) {
        setHelpfulCount(prev => userVote === 'up' ? prev - 2 : prev + 2);
      } else {
        setHelpfulCount(prev => type === 'up' ? prev + 1 : prev - 1);
      }
      setUserVote(type);
    }
  };

  const shouldTruncate = review.comment.length > 300;
  const displayComment = shouldTruncate && !showFullComment 
    ? review.comment.slice(0, 300) + '...' 
    : review.comment;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      {/* User Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Image
            src={review.userAvatar}
            alt={review.userName}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold">{review.userName}</h4>
              {review.isVerified && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span>•</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              {review.visitDate && (
                <>
                  <span>•</span>
                  <span>Visited {new Date(review.visitDate).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        {review.title && (
          <h5 className="font-semibold mb-2">{review.title}</h5>
        )}
        <p className="text-gray-700 leading-relaxed">
          {displayComment}
          {shouldTruncate && (
            <button
              onClick={() => setShowFullComment(!showFullComment)}
              className="text-purple-600 hover:text-purple-700 ml-1 font-medium"
            >
              {showFullComment ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </div>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {review.images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                width={120}
                height={80}
                className="rounded-lg object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleHelpful('up')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
              userVote === 'up'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">{helpfulCount > 0 ? helpfulCount : ''}</span>
          </button>
          <button
            onClick={() => handleHelpful('down')}
            className={`p-1 rounded-full transition-colors ${
              userVote === 'down'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
        <span className="text-sm text-gray-500">
          Helpful ({helpfulCount})
        </span>
      </div>
    </div>
  );
};

// Write Review Modal Component
const WriteReviewModal: React.FC<{
  locationName: string;
  onClose: () => void;
  onSubmit: (review: Partial<Review>) => void;
}> = ({ locationName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      rating,
      title,
      comment,
      visitDate,
      images,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Write a Review for {locationName}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Summarize your experience"
                required
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                placeholder="Share your experience, tips, and what others should know..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-sm font-medium mb-2">When did you visit?</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Drag photos here or click to upload</p>
                <button
                  type="button"
                  className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Choose Photos
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewSystem;