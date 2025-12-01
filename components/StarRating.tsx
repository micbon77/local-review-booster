'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
    rating: number
    setRating: (rating: number) => void
    disabled?: boolean
}

export default function StarRating({ rating, setRating, disabled }: StarRatingProps) {
    return (
        <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => setRating(star)}
                    className={cn(
                        "transition-all duration-200 hover:scale-110 focus:outline-none",
                        disabled ? "cursor-default" : "cursor-pointer"
                    )}
                >
                    <Star
                        className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 transition-colors",
                            star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-transparent text-gray-300 hover:text-yellow-200"
                        )}
                    />
                </button>
            ))}
        </div>
    )
}
