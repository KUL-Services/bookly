import { BaseCard } from "@/components/atoms/base-card/base-card.component";
import { Business } from "@/types/api.types";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
  business: Business;
  className?: string;
  onClick?: () => void;
}

export const BusinessCard = ({ business, className, onClick }: BusinessCardProps) => {
  return (
    <div onClick={onClick}>
      <BaseCard
        className={cn("overflow-hidden", className)}
        imageSrc={business.coverImage}
        imageAlt={business.name}
        titleProps={{ plainText: business.name }}
        descriptionProps={{ plainText: business.about }}
        contentClassName="p-4"
        footerClassName="flex items-center justify-between p-4 border-t"
        footerContent={
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⭐</span>
              <span className="font-medium">{business.averageRating}</span>
              <span className="text-gray-500">({business.totalRatings})</span>
            </div>
            <div className="text-gray-500">
              {business.address}, {business.city}
            </div>
          </div>
        }
      />
    </div>
  );
};
