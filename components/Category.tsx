import { topCategoryStyles } from "@/constants";
import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";

const Category = ({ category }: CategoryProps) => {
  const style =
    topCategoryStyles[category.name as keyof typeof topCategoryStyles] ??
    topCategoryStyles.default;

  return (
    <div className={cn("flex gap-4 rounded-xl p-4", style.bg)}>
      <div className={cn("size-2 rounded-full self-center", style.progress.indicator)} />
      <div className="flex w-full flex-col gap-2">
        <div className="flex justify-between text-14">
          <h3 className={cn("font-medium", style.text.main)}>{category.name}</h3>
          <p className={cn("font-normal", style.text.count)}>{category.count}</p>
        </div>
        <Progress
          value={(category.count / category.totalCount) * 100}
          className={cn("h-2 w-full", style.progress.bg)}
          indicatorClassName={cn("h-2", style.progress.indicator)}
        />
      </div>
    </div>
  );
};

export default Category;
