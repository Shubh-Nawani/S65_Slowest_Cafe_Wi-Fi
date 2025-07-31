import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, MessageCircle, ThumbsUp, ThumbsDown, Calendar, User } from 'lucide-react';
import { Button, Input, Card, Badge, Modal } from '../ui';

const RatingModal = ({ 
  isOpen, 
  onClose, 
  cafe, 
  onSubmit, 
  loading = false,
  userRating = null 
}) => {
  const [rating, setRating] = useState(userRating?.rating || 0);
  const [comment, setComment] = useState(userRating?.comment || '');
  const [categories, setCategories] = useState({
    wifi: userRating?.categories?.wifi || 0,
    ambiance: userRating?.categories?.ambiance || 0,
    service: userRating?.categories?.service || 0,
    comfort: userRating?.categories?.comfort || 0
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [errors, setErrors] = useState({});

  const categoryLabels = {
    wifi: 'WiFi Quality',
    ambiance: 'Ambiance', 
    service: 'Service',
    comfort: 'Comfort'
  };

  useEffect(() => {
    if (userRating) {
      setRating(userRating.rating);
      setComment(userRating.comment || '');
      setCategories(userRating.categories || {
        wifi: 0, ambiance: 0, service: 0, comfort: 0
      });
    }
  }, [userRating]);

  const StarRating = ({ 
    value, 
    onChange, 
    size = 'md', 
    interactive = true,
    label = '',
    className = '' 
  }) => {
    const [hovered, setHovered] = useState(0);
    
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    };

    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {label && <span className="text-sm font-medium text-gray-700 mr-2">{label}</span>}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              disabled={!interactive}
              className={`${sizes[size]} transition-colors ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
              onMouseEnter={() => interactive && setHovered(star)}
              onMouseLeave={() => interactive && setHovered(0)}
              onClick={() => interactive && onChange(star)}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.9 } : {}}
            >
              <Star
                className={`w-full h-full ${
                  star <= (interactive ? (hovered || value) : value)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </motion.button>
          ))}
        </div>
        {interactive && (
          <span className="text-sm text-gray-500 ml-2">
            {(hovered || value) > 0 ? `${hovered || value}/5` : 'No rating'}
          </span>
        )}
      </div>
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please provide an overall rating';
    }
    
    if (comment.trim().length < 10) {
      newErrors.comment = 'Please provide a comment with at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const ratingData = {
      cafeId: cafe._id,
      rating,
      comment: comment.trim(),
      categories,
      isUpdate: !!userRating
    };

    onSubmit(ratingData);
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setCategories({ wifi: 0, ambiance: 0, service: 0, comfort: 0 });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={userRating ? `Update Your Review of ${cafe?.name}` : `Rate ${cafe?.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">
              Overall Rating *
            </label>
            {rating > 0 && (
              <Badge variant={rating >= 4 ? 'success' : rating >= 3 ? 'warning' : 'error'}>
                {rating >= 4 ? 'Excellent' : rating >= 3 ? 'Good' : rating >= 2 ? 'Fair' : 'Poor'}
              </Badge>
            )}
          </div>
          
          <StarRating
            value={rating}
            onChange={setRating}
            size="lg"
          />
          
          {errors.rating && (
            <p className="text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Category Ratings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Rate Different Aspects</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <StarRating
                  value={categories[key]}
                  onChange={(value) => setCategories(prev => ({ ...prev, [key]: value }))}
                  label={label}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Share Your Experience *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience at this café. What did you like? What could be improved?"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {comment.length}/500 characters
            </div>
            {errors.comment && (
              <p className="text-sm text-red-600">{errors.comment}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="coffee"
            loading={loading}
            disabled={loading}
          >
            {userRating ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ReviewCard = ({ 
  review, 
  onLike, 
  onReport, 
  currentUser, 
  isOwner = false 
}) => {
  const [showFullComment, setShowFullComment] = useState(false);
  const isLongComment = review.comment && review.comment.length > 150;
  
  const displayComment = isLongComment && !showFullComment 
    ? review.comment.substring(0, 150) + '...'
    : review.comment;

  const timeAgo = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInSeconds = Math.floor((now - reviewDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return reviewDate.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b last:border-b-0 pb-4 last:pb-0"
    >
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.userId?.name || 'Anonymous User'}
              </span>
              {isOwner && (
                <Badge variant="coffee" size="sm">Owner</Badge>
              )}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">{review.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {timeAgo(review.createdAt)}
              </span>
            </div>
          </div>

          {/* Category Ratings */}
          {review.categories && Object.keys(review.categories).length > 0 && (
            <div className="flex flex-wrap gap-4">
              {Object.entries(review.categories).map(([category, rating]) => (
                rating > 0 && (
                  <div key={category} className="flex items-center gap-1">
                    <span className="text-xs text-gray-600 capitalize">{category}:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <p className="text-gray-700 text-sm leading-relaxed">
              {displayComment}
            </p>
            
            {isLongComment && (
              <button
                onClick={() => setShowFullComment(!showFullComment)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {showFullComment ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(review._id)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ThumbsUp className={`w-3 h-3 ${
                review.likedBy?.includes(currentUser?.id) ? 'text-blue-600 fill-blue-600' : ''
              }`} />
              <span>{review.likes || 0}</span>
            </button>
            
            <button
              onClick={() => onReport(review._id)}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              Report
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ReviewsSection = ({ 
  cafeId, 
  reviews = [], 
  onAddReview, 
  onUpdateReview,
  currentUser, 
  loading = false 
}) => {
  const [userReview, setUserReview] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const existingReview = reviews.find(review => 
        review.userId?._id === currentUser.id || review.userId === currentUser.id
      );
      setUserReview(existingReview || null);
    }
  }, [reviews, currentUser]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (userReview) {
        await onUpdateReview(reviewData);
      } else {
        await onAddReview(reviewData);
      }
      setShowRatingModal(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (!currentUser) {
    return (
      <Card className="p-6 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Share Your Experience</h3>
        <p className="text-gray-600 mb-4">Sign in to leave a review and help others discover great cafés</p>
        <Button variant="coffee">Sign In</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add/Update Review Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Reviews ({reviews.length})
        </h3>
        
        <Button
          onClick={() => setShowRatingModal(true)}
          variant={userReview ? "outline" : "coffee"}
          className="flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          {userReview ? 'Update Review' : 'Write Review'}
        </Button>
      </div>

      {/* User's Review Preview */}
      {userReview && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="blue">Your Review</Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{userReview.rating}</span>
            </div>
          </div>
          <p className="text-sm text-gray-700">{userReview.comment}</p>
        </Card>
      )}

      {/* Reviews List */}
      <Card className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedReviews.length > 0 ? (
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUser={currentUser}
                onLike={() => {}}
                onReport={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
            <p className="text-gray-600">Be the first to share your experience!</p>
          </div>
        )}
      </Card>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        cafe={{ _id: cafeId, name: 'This Café' }}
        onSubmit={handleReviewSubmit}
        userRating={userReview}
        loading={loading}
      />
    </div>
  );
};

export { RatingModal, ReviewCard, ReviewsSection };
export default ReviewsSection;
