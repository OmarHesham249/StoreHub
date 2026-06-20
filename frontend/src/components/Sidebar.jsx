import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes } from 'lucide-react';

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package,          label: 'Products'  },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/30">
            <Boxes size={17} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">StoreHub</span>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Inventory Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 font-medium px-3 py-2">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent text-white shadow-sm shadow-accent/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent-light text-xs font-bold">
            AD
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Admin</p>
            <p className="text-[10px] text-slate-500">Store Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
