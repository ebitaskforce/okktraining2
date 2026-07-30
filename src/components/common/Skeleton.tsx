import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
  );
};

export const SessionCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="grid grid-cols-2 gap-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
    <div className="pt-2 flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
  </div>
);
