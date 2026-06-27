/**
 * Generic page-area skeleton shown via loading.tsx while a server page renders.
 * The persistent sidebar/layout stays mounted across navigation, so this only
 * fills the content area — giving instant feedback instead of a frozen screen.
 */
export function PageSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-gray-200 rounded-lg" />
        <div className="h-4 w-72 bg-gray-100 rounded" />
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
              <div className="h-8 w-full bg-gray-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
