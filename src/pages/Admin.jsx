import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, Package, ShoppingCart, X, Check } from 'lucide-react'

const STATUS_OPTIONS = ['pending', 'contacted', 'paid', 'delivered', 'cancelled']

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchOrders()
  }

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return
    await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    fetchOrders()
  }

  if (loading) return <p className="text-gray-400 text-center py-10">Loading orders...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-zinc-800 rounded-xl p-5 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white font-semibold text-lg">{order.customer_name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-900 text-green-300' :
                      order.status === 'paid' ? 'bg-blue-900 text-blue-300' :
                      order.status === 'contacted' ? 'bg-yellow-900 text-yellow-300' :
                      order.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                      'bg-zinc-700 text-gray-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    {order.customer_email && <p className="text-gray-400">Email: <span className="text-gray-300">{order.customer_email}</span></p>}
                    {order.customer_phone && <p className="text-gray-400">Phone: <span className="text-gray-300">{order.customer_phone}</span></p>}
                    <p className="text-gray-400">Color: <span className="text-gray-300">{order.color}</span></p>
                    <p className="text-gray-400">Size: <span className="text-gray-300">{order.size} ({order.size_category})</span></p>
                    <p className="text-gray-400">Qty: <span className="text-gray-300">{order.quantity}</span></p>
                    <p className="text-gray-400">Total: <span className="text-white font-medium">${Number(order.total).toFixed(2)}</span></p>
                  </div>
                  {order.notes && <p className="text-gray-500 text-sm mt-2">Notes: {order.notes}</p>}
                  <p className="text-gray-600 text-xs mt-2">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="bg-zinc-700 text-gray-300 text-sm rounded-lg px-3 py-2 border border-white/10"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => deleteOrder(order.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductsTab() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const emptyProduct = { name: '', description: '', price: 16, colors: 'Black,Navy,White', adult_sizes: 'S,M,L,XL', youth_sizes: 'YS,YM,YL,YXL', image_url: '', active: true }
  const [form, setForm] = useState(emptyProduct)

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/all')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = {
      ...form,
      price: Number(form.price),
      colors: typeof form.colors === 'string' ? form.colors.split(',').map(s => s.trim()) : form.colors,
      adult_sizes: typeof form.adult_sizes === 'string' ? form.adult_sizes.split(',').map(s => s.trim()) : form.adult_sizes,
      youth_sizes: typeof form.youth_sizes === 'string' ? form.youth_sizes.split(',').map(s => s.trim()) : form.youth_sizes,
    }

    if (editing) {
      await fetch(`/api/products/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    }
    setEditing(null)
    setShowForm(false)
    setForm(emptyProduct)
    fetchProducts()
  }

  const startEdit = (product) => {
    setEditing(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      colors: (product.colors || []).join(', '),
      adult_sizes: (product.adult_sizes || []).join(', '),
      youth_sizes: (product.youth_sizes || []).join(', '),
      image_url: product.image_url || '',
      active: product.active,
    })
    setShowForm(true)
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This will also remove all associated orders.')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  if (loading) return <p className="text-gray-400 text-center py-10">Loading products...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Products ({products.length})</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(emptyProduct) }}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-xl p-6 border border-white/10 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">{editing ? 'Edit Product' : 'New Product'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full bg-zinc-700 text-white rounded-lg px-3 py-2 border border-white/10 text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Price ($)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="w-full bg-zinc-700 text-white rounded-lg px-3 py-2 border border-white/10 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full bg-zinc-700 text-white rounded-lg px-3 py-2 border border-white/10 text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Colors (comma-separated)</label>
              <input value={form.colors} onChange={e => setForm({...form, colors: e.target.value})} className="w-full bg-zinc-700 text-white rounded-lg px-3 py-2 border border-white/10 text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Image URL</label>
              <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full bg-zinc-700 text-white rounded-lg px-3 py-2 border border-white/10 text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Adult Sizes (comma-separated)</label>
              <input value={form.adult_sizes} onChange={e => setForm({...form, adult_sizes: e.target.value})} className="w-full bg-zinc-700 text-white rounded-lg px-3 py-2 border border-white/10 text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Youth Sizes (comma-separated)</label>
              <input value={form.youth_sizes} onChange={e => setForm({...form, youth_sizes: e.target.value})} className="w-full bg-zinc-700 text-white rounded-lg px-3 py-2 border border-white/10 text-sm" />
            </div>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-gray-400 text-sm">
              <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="rounded" />
              Active (visible in shop)
            </label>
          )}
          <button type="submit" className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
            <Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Add Product'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className={`bg-zinc-800 rounded-xl p-5 border ${product.active ? 'border-white/10' : 'border-red-900/30 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-700" />
                )}
                <div>
                  <p className="text-white font-semibold">{product.name} {!product.active && <span className="text-red-400 text-xs">(inactive)</span>}</p>
                  <p className="text-gray-400 text-sm">${Number(product.price).toFixed(2)}</p>
                  <p className="text-gray-500 text-xs mt-1">Colors: {(product.colors || []).join(', ')}</p>
                  <p className="text-gray-500 text-xs">Adult: {(product.adult_sizes || []).join(', ')} | Youth: {(product.youth_sizes || []).join(', ')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(product)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('orders')

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Force Up Admin
            </h1>
          </div>
          <img src="/images/logo.png" alt="Force Up" className="h-10 w-auto" />
        </div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tab === 'orders' ? 'bg-white text-black' : 'bg-zinc-800 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <ShoppingCart className="w-4 h-4" /> Orders
          </button>
          <button
            onClick={() => setTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tab === 'products' ? 'bg-white text-black' : 'bg-zinc-800 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <Package className="w-4 h-4" /> Products
          </button>
        </div>

        {tab === 'orders' ? <OrdersTab /> : <ProductsTab />}
      </div>
    </div>
  )
}
