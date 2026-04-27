import { transactionCategoryStyles } from "@/constants";
import { cn } from "@/lib/utils";

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const style =
    transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] ??
    transactionCategoryStyles.default;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-12 font-medium",
        style.borderColor,
        style.chipBackgroundColor,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.backgroundColor)} />
      <span className={style.textColor}>{category}</span>
    </div>
  );
};

export default CategoryBadge;
