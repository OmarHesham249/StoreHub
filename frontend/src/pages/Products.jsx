import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, CheckCircle, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['Electronics', 'Peripherals', 'Accessories', 'Office', 'Clothing', 'Other'];
const ALL_CATS   = ['All', ...CATEGORIES];

// ── Stock badge ──────────────────────────────────────────────────────────────
function StockBadge({ stock }) {
  const n = parseInt(stock);
  if (n === 0)  return <span className="px-2 py-0.5 text-[11px] font-medium bg-red-500/10 text-red-400 rounded-full">Out of Stock</span>;
  if (n < 10)   return <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-400 rounded-full">Low · {n}</span>;
  return             <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 rounded-full">{n} in stock</span>;
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border fade-in
      ${ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
      {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {toast.message}
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 fade-in">{children}</div>
    </div>
  );
}

// ── Form field ────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent transition-colors';

// ── Default form state ────────────────────────────────────────────────────────
const defaultForm = { name: '', category: 'Electronics', price: '', stock: '', description: '' };

// ═════════════════════════════════════════════════════════════════════════════
export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [catFilter,setCatFilter]= useState('All');
  const [modal,    setModal]    = useState(null);   // 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(defaultForm);
  const [toast,    setToast]    = useState(null);
  const [submitting,setSubmitting]=useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/products', {
        params: { search: search || undefined, category: catFilter !== 'All' ? catFilter : undefined },
      });
      setProducts(data);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, catFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Modal controls ─────────────────────────────────────────────────────────
  const openAdd    = ()  => { setForm(defaultForm); setModal('add'); };
  const openEdit   = (p) => { setSelected(p); setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, description: p.description || '' }); setModal('edit'); };
  const openDelete = (p) => { setSelected(p); setModal('delete'); };
  const closeModal = ()  => { setModal(null); setSelected(null); };

  // ── Submit add / edit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name || !form.price || form.stock === '') {
      showToast('Name, price and stock are required', 'error'); return;
    }
    setSubmitting(true);
    try {
      if (modal === 'add') {
        await axios.post('/api/products', form);
        showToast('Product added successfully');
      } else {
        await axios.put(`/api/products/${selected.id}`, form);
        showToast('Product updated');
      }
      closeModal();
      fetchProducts();
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`/api/products/${selected.id}`);
      showToast('Product deleted');
      closeModal();
      fetchProducts();
    } catch {
      showToast('Failed to delete product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 fade-in">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">Products</h1>
          <p className="text-slate-500 text-sm">{products.length} item{products.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-accent/20"
        >
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_CATS.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                catFilter === c
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">No products found</p>
            <p className="text-slate-600 text-xs">Try adjusting your filters or{' '}
              <button onClick={openAdd} className="text-accent hover:underline">add a new product</button>
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Product', 'Category', 'Price', 'Stock', ''].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-[10px] uppercase tracking-widest font-semibold text-slate-500 ${h === '' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map(p => (
                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">{p.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded font-medium">{p.category}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-white font-mono">
                    ${parseFloat(p.price).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(p)}
                        title="Edit"
                        className="p-1.5 rounded-md hover:bg-accent/10 text-slate-500 hover:text-accent-light transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        title="Delete"
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal onClose={closeModal}>
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Product Name *">
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. MacBook Pro 16""
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Category *">
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className={inputCls}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Price (USD) *">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className={inputCls}
                    placeholder="0.00"
                  />
                </Field>
              </div>

              <Field label="Stock Quantity *">
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className={inputCls}
                  placeholder="0"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Optional product description…"
                />
              </Field>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 border border-border text-slate-400 hover:text-white hover:border-slate-500 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-accent hover:bg-accent-h text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Saving…' : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      {modal === 'delete' && (
        <Modal onClose={closeModal}>
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl">
            <div className="w-11 h-11 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Delete Product</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="text-white font-semibold">"{selected?.name}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 border border-border text-slate-400 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
