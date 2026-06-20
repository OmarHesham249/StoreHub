import { useEffect, useState } from 'react';
import { Package, DollarSign, AlertTriangle, Tag, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalValue = parseFloat(stats?.total_value || 0)
    .toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="p-8 fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white mb-0.5">Dashboard</h1>
        <p className="text-slate-500 text-sm">Welcome back — here's what's happening in your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Products"
          value={stats?.total_products || 0}
          icon={Package}
          variant="accent"
        />
        <StatCard
          title="Inventory Value"
          value={totalValue}
          icon={DollarSign}
          trend={12}
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.low_stock_count || 0}
          subtitle="Below 10 units"
          icon={AlertTriangle}
          variant={parseInt(stats?.low_stock_count) > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Categories"
          value={stats?.total_categories || 0}
          icon={Tag}
        />
      </div>

      {/* Alerts */}
      {parseInt(stats?.low_stock_count) > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-1">Low Stock Alert</p>
              <p className="text-xs text-slate-400">
                {stats.low_stock_count} product{stats.low_stock_count > 1 ? 's are' : ' is'} running low.{' '}
                <Link to="/products" className="text-accent-light underline underline-offset-2 hover:text-white transition-colors">
                  Review products →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/products" className="bg-surface border border-border hover:border-accent/40 rounded-xl p-5 flex items-center gap-4 transition-all group">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors">
            <Package size={18} className="text-accent group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Manage Products</p>
            <p className="text-xs text-slate-500">Add, edit or remove products</p>
          </div>
        </Link>
        <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 opacity-50 cursor-not-allowed">
          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Analytics</p>
            <p className="text-xs text-slate-500">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
