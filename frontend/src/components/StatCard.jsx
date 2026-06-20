export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', trend }) {
  const variants = {
    default: 'bg-surface border-border',
    accent:  'bg-accent/10 border-accent/30',
    warning: 'bg-amber-500/10 border-amber-500/20',
    danger:  'bg-red-500/10  border-red-500/20',
  };
  const iconVariants = {
    default: 'bg-white/5 text-slate-400',
    accent:  'bg-accent text-white',
    warning: 'bg-amber-500/20 text-amber-400',
    danger:  'bg-red-500/20 text-red-400',
  };

  return (
    <div className={`border rounded-xl p-5 transition-all hover:scale-[1.01] ${variants[variant]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconVariants[variant]}`}>
          <Icon size={18} />
        </div>
        {trend != null && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight mb-0.5">{value}</p>
      <p className="text-xs font-medium text-slate-400">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
