import { BaseCard } from "@/components/atoms/base-card/base-card.component";
import { Business } from "@/types/api.types";
import { cn } from "@/lib/utils";
import Button from "../button/button.component";
import { KulIcon } from "@/components/atoms";

interface BusinessCardProps {
  business: Business;
  className?: string;
  onClick?: () => void;
}

export const BusinessCard = ({
  business,
  className,
  onClick,
}: BusinessCardProps) => {
  return (
    <div onClick={onClick}>
      <BaseCard
        className={cn("overflow-hidden", className)}
        imageSrc={business.coverImage}
        imageAlt={business.name}
        titleProps={{ plainText: business.name }}
        headerClassName="space-y-3"
        footerClassName="flex flex-col items-start gap-2"
        footerContent={
          <>
            <div className="flex justify-between w-full">
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ⭐
                  </span>
                ))}
                <span className="font-medium">{business.averageRating}</span>
                <span className="text-gray-500">({business.totalRatings})</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-500 mb-2">
              <KulIcon icon={"lucide:map-pin"} />
              {business.city}
            </div>
            <Button
              buttonText={{ plainText: "Book" }}
              variant="contained"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            />
          </>
        }
      />
    </div>
  );
};
