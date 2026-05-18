export function CollectionCardSkeleton() {
  return (
    <div className="bg-dark-800 rounded-xl overflow-hidden neon-border">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="flex justify-between">
          <div className="h-6 w-20 skeleton rounded" />
          <div className="h-6 w-16 skeleton rounded" />
        </div>
      </div>
    </div>
  )
}

export function CollectionDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 skeleton rounded-xl mb-8" />
      <div className="space-y-4 mb-8">
        <div className="h-8 w-2/3 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-4/5 skeleton rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square skeleton rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function UserTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-dark-800 rounded-lg">
          <div className="w-10 h-10 skeleton rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 skeleton rounded" />
            <div className="h-3 w-48 skeleton rounded" />
          </div>
          <div className="h-6 w-20 skeleton rounded" />
          <div className="h-8 w-24 skeleton rounded" />
        </div>
      ))}
    </div>
  )
}
