export function SkeletonPost() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[var(--pc-border)]/60 mb-4 animate-pulse">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-11 h-11 rounded-full bg-[var(--pc-border)] dark:bg-[#30363D] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[var(--pc-border)] dark:bg-[#30363D] rounded-full w-1/3" />
          <div className="h-2.5 bg-[var(--pc-border)] dark:bg-[#30363D] rounded-full w-1/2" />
        </div>
      </div>
      <div className="px-4 mb-3 space-y-2">
        <div className="h-3 bg-[var(--pc-border)] dark:bg-[#30363D] rounded-full w-full" />
        <div className="h-3 bg-[var(--pc-border)] dark:bg-[#30363D] rounded-full w-4/5" />
      </div>
      <div className="bg-[var(--pc-border)]/40 dark:bg-[#1C2128]" style={{ aspectRatio: '1/1', maxHeight: '320px' }} />
      <div className="flex items-center gap-6 px-4 py-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-3 bg-[var(--pc-border)] dark:bg-[#30363D] rounded-full w-12" />
        ))}
      </div>
    </div>
  );
}
