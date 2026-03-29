import { Skeleton } from '@/components/ui/skeleton'

export function PageLoading() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      {/* Page header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>

      {/* Content rows */}
      <div className="space-y-3">
        {(['a', 'b', 'c', 'd', 'e'] as const).map((k) => (
          <Skeleton key={k} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
