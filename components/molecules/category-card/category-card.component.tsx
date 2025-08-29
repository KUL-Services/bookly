import { BaseCard } from "@/components/atoms/base-card/base-card.component";
import { Category } from "@/types/api.types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
  onClick?: () => void;
}

export const CategoryCard = ({ category, className, onClick }: CategoryCardProps) => {
  return (
    <div onClick={onClick}>
      <BaseCard
        className={cn("hover:scale-105 transition-transform cursor-pointer", className)}
        contentClassName="flex flex-col items-center justify-center p-6 space-y-2"
      >
        <div className="text-4xl">{category.icon}</div>
        <h3 className="text-lg font-medium">{category.name}</h3>
      </BaseCard>
    </div>
  );
};
