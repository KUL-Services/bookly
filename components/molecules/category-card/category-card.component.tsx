import { BaseCard } from "@/components/atoms/base-card/base-card.component";
import { Category } from "@/types/api.types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
  onClick?: () => void;
}

export const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  return (
    <div onClick={onClick}>
      <BaseCard
        className={`mx-auto mb-3 border-none rounded-lg flex items-center justify-center hover:border-4 hover:border-green-500 hover:scale-105 transition-transform cursor-pointer `}
      >
        <span className="text-2xl">{category.icon}</span>
        <h3 className="text-gray-700 font-medium">{category.name}</h3>
      </BaseCard>
    </div>
  );
};

// className={cn("hover:scale-105 transition-transform cursor-pointer", className)}
//         contentClassName="flex flex-col items-center justify-center p-6 space-y-2"
