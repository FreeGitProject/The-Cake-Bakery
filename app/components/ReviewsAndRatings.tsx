'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
//import { useToast } from "@/components/ui/use-toast"
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reviews and Ratings</h2>
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${star <= Math.floor(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-lg font-semibold">{averageRating?.toFixed(1)}</span>
        <span className="text-gray-500">({reviews.length} reviews)</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <Select
              value={userReview.rating.toString()}
              onValueChange={(value) => setUserReview({ ...userReview, rating: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your rating" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Write your review here..."
              value={userReview.comment}
              onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
              rows={4}
            />
            <Button type="submit" disabled={!session}>Submit Review</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review._id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{review.username}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="mt-2">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

