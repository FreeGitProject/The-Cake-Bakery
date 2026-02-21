'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, Send, MessageSquare, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Review {
  _id: string
  userId: string
  username: string
  rating: number
  comment: string
  createdAt: string
}

interface ReviewsAndRatingsProps {
  cakeId: string
}

export default function ReviewsAndRatings({ cakeId }: ReviewsAndRatingsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState({ rating: 0, comment: '' })
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [cakeId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/${cakeId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      } else {
        throw new Error('Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cakeId,
          ...userReview,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your review has been submitted.",
        })
        setUserReview({ rating: 0, comment: '' })
        fetchReviews()
      } else {
        throw new Error('Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-text">
          Reviews & Ratings
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-brand-pink to-brand-pink-light rounded-full mt-3" />
      </div>

      {/* Rating Summary */}
      <div className="flex items-center gap-5 bg-brand-cream/50 rounded-2xl p-5 border border-brand-pink/10">
        <div className="flex flex-col items-center">
          <span className="text-4xl font-display font-bold text-brand-text">{averageRating?.toFixed(1)}</span>
          <span className="text-xs text-brand-text-secondary mt-0.5">out of 5</span>
        </div>
        <div className="h-12 w-px bg-brand-pink/20" />
        <div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 transition-colors duration-300 ${
                  star <= Math.floor(averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : star <= Math.ceil(averageRating) && averageRating % 1 > 0
                    ? 'text-amber-400 fill-amber-400/40'
                    : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-brand-text-secondary mt-1">
            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Write Review Form */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-brand-cream/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-pink to-brand-pink-light flex items-center justify-center">
              <MessageSquare className="w-4.5 h-4.5 text-white" />
            </div>
            <h3 className="font-display font-semibold text-lg text-brand-text">Write a Review</h3>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-text">Your Rating</label>
              <Select
                value={userReview.rating.toString()}
                onValueChange={(value) => setUserReview({ ...userReview, rating: parseInt(value) })}
              >
                <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-all duration-300">
                  <SelectValue placeholder="Select your rating" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()} className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <span>{rating} {rating === 1 ? 'Star' : 'Stars'}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-text">Your Review</label>
              <Textarea
                placeholder="Share your experience with this cake..."
                value={userReview.comment}
                onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                rows={4}
                className="rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 resize-none transition-all duration-300"
              />
            </div>
            <Button
              type="submit"
              disabled={!session}
              className="h-11 rounded-xl bg-gradient-to-r from-brand-pink to-brand-pink-light text-white font-semibold shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 border-0 px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
            {!session && (
              <p className="text-sm text-brand-text-secondary">
                Please sign in to submit a review.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-lg text-brand-text">
            All Reviews ({reviews.length})
          </h3>
          {reviews.map((review, index) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-5 hover:shadow-card-hover transition-all duration-300"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cream to-brand-pink-lighter flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-brand-pink" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text">{review.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200 fill-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-brand-text-secondary">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                </div>
                <time className="text-xs text-brand-text-secondary whitespace-nowrap bg-brand-cream/50 px-2.5 py-1 rounded-lg">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <p className="mt-3.5 ml-[54px] text-brand-text-secondary leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-brand-cream mx-auto flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-brand-pink/50" />
          </div>
          <p className="text-brand-text-secondary">No reviews yet. Be the first to share your experience!</p>
        </div>
      )}
    </div>
  )
}
