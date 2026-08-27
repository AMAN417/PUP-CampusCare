import React from 'react'

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-white/[0.04] border border-white/[0.03] animate-pulse rounded-xl ${className}`}
    />
  )
}

export const KpiSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <div key={n} className="bg-[#07111F] border border-white/[0.08] p-5 rounded-2xl space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-3 w-28" />
      </div>
    ))}
  </div>
)

export const TableRowSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="divide-y divide-white/[0.04]">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="p-4 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
)
