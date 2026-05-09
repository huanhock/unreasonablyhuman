import { todayNews } from '@/data/mock';

export default function NewsCard() {
  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-emerald-200 via-green-100 to-lime-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-emerald-800 mb-4">📰 Industry News</h2>
      <div className="space-y-3">
        {todayNews.map((item, i) => (
          <div key={i} className="glass p-4">
            <p className="font-semibold text-[var(--color-warm-text)]">{item.headline}</p>
            <p className="text-xs text-[var(--color-warm-text)]/50 mb-1">{item.source}</p>
            <p className="text-sm text-[var(--color-warm-text)]/70">{item.shareNote}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
