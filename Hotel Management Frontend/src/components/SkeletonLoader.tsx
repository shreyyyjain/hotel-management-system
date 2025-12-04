export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
    <div className="p-8">
      <div className="h-6 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded-lg mb-6 w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-16"></div>
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
    {[...Array(count)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonText = ({ className = "h-4 w-full" }: { className?: string }) => (
  <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`}></div>
);
