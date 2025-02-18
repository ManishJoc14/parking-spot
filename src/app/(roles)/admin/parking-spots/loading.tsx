import {
  PaginationSkeleton,
  ParkingsTableSkeleton,
} from "@/components/adminComponents/skeletons";

export default function ParkingSpotsPageLoading() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-8 w-44 rounded-md bg-gray-100 dark:bg-gray-800"></div>
      <div className="flex gap-8">
        <div className="h-12 w-full rounded-md bg-gray-100 dark:bg-gray-800 mt-4"></div>
        <div className="h-12 w-40 rounded-md bg-gray-100 dark:bg-gray-800 mt-4"></div>
      </div>
      <ParkingsTableSkeleton />
      <PaginationSkeleton />
    </div>
  );
}
