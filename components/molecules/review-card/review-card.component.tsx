import { BaseCard } from "@/bookly/components/atoms/base-card/base-card.component";
import BaseImage from "@/bookly/components/atoms/base-image/base-image.component";
import { Review } from "@/bookly/types/api.types";
import { cn } from "@/bookly/lib/utils";
import { getInitials } from "@/bookly/utils";

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export const ReviewCard = ({ review, className }: ReviewCardProps) => {
  return (
    <BaseCard
      className={cn("", className)}
      contentClassName="p-4"
    >
      <div className="flex items-start space-x-4">
        <div className="relative w-12 h-12">
          {review.authorImage ? (
            <BaseImage
              src={review.authorImage}
              alt={review.authorName}
              className="rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              {getInitials(review.authorName)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{review.authorName}</h3>
            <div className="flex items-center">
              {Array.from({ length: review.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
          </div>
          <p className="text-gray-600 mt-2">{review.comment}</p>
          <p className="text-gray-400 text-sm mt-2">
            {new Date(review.date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </BaseCard>
  );
};
