"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { formUrlQuery } from "@/lib/utils";

const Pagination = ({ page, totalPages }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (direction: "prev" | "next") => {
    const newPage =
      direction === "prev" ? Math.max(1, page - 1) : Math.min(totalPages, page + 1);

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: String(newPage),
    });

    router.push(newUrl, { scroll: false });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <Button
        type="button"
        variant="outline"
        disabled={page <= 1}
        onClick={() => handleNavigation("prev")}
      >
        Previous
      </Button>
      <p className="text-14 text-gray-600">
        Page {page} of {totalPages}
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => handleNavigation("next")}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
