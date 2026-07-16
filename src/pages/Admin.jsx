import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Trash2, Package, ShoppingCart, Check, Lock, LogOut, AlertCircle, ImagePlus, Upload, X, ChevronDown, Plus, BarChart2 } from 'lucide-react'

const STATUS_OPTIONS = ['pending', 'contacted', 'paid', 'delivered', 'cancelled']

function getToken() {
  return sessionStorage.getItem('admin_token')
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
}

async function authFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers }
  })
  if (res.status === 401) {
    sessionStorage.removeItem('admin_token')
    window.location.reload()
    throw new Error('Session expired')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return res.json()
}

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    try {
      setError('')
      const data = await authFetch('/api/orders')
      setOrders(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    try {
      await authFetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      fetchOrders()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return
    try {
      await authFetch(`/api/orders/${id}`, { method: 'DELETE' })
      fetchOrders()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-gray-400 text-center py-10">Loading orders...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Orders ({orders.length})</h2>
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
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

function GalleryTab() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [alt, setAlt] = useState('')
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const fetchImages = async () => {
    try {
      setError('')
      const data = await authFetch('/api/gallery')
      setImages(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    setAlt('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('alt', alt || 'Force Up community photo')
      const token = getToken()
      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (res.status === 401) {
        sessionStorage.removeItem('admin_token')
        window.location.reload()
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }
      clearSelection()
      fetchImages()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteImage = async (id) => {
    if (!confirm('Delete this gallery image?')) return
    try {
      await authFetch(`/api/gallery/${id}`, { method: 'DELETE' })
      fetchImages()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-gray-400 text-center py-10">Loading gallery...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Gallery ({images.length} photos)</h2>
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="bg-zinc-800 rounded-xl p-5 border border-white/10 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <ImagePlus className="w-5 h-5" /> Add Photo
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="gallery-upload"
            />
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Preview" className="h-32 w-auto rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="gallery-upload"
                className="flex items-center justify-center gap-2 h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors text-gray-400 hover:text-gray-300"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Choose an image</span>
              </label>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Description (optional)"
              className="bg-zinc-700 text-white rounded-lg px-4 py-2.5 border border-white/10 text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload Photo</>}
            </button>
          </div>
        </div>
      </form>

      {images.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No gallery images yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative rounded-xl overflow-hidden bg-zinc-800 border border-white/10">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => deleteImage(image.id)}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2">
                <p className="text-gray-400 text-xs truncate">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InventoryTab() {
  const [products, setProducts] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingChanges, setPendingChanges] = useState({})
  const [expandedProduct, setExpandedProduct] = useState(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' })
  const [addingProduct, setAddingProduct] = useState(false)

  const fetchData = async () => {
    try {
      setError('')
      const [prods, inv] = await Promise.all([
        authFetch('/api/products/all'),
        authFetch('/api/inventory'),
      ])
      setProducts(prods)
      setInventory(inv)
      if (prods.length > 0 && expandedProduct === null) setExpandedProduct(prods[0].id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const getStock = (productId, color, size) => {
    const key = `${productId}-${color}-${size}`
    if (key in pendingChanges) return pendingChanges[key]
    const item = inventory.find(i => i.product_id === productId && i.color === color && i.size === size)
    return item ? item.stock : 0
  }

  const handleStockChange = (productId, color, size, value) => {
    const key = `${productId}-${color}-${size}`
    setPendingChanges(prev => ({ ...prev, [key]: Math.max(0, parseInt(value) || 0) }))
  }

  const saveChanges = async (productId) => {
    setSaving(true)
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return
      const colors = Array.isArray(product.colors) ? product.colors : []
      const allSizes = [
        ...(Array.isArray(product.adult_sizes) ? product.adult_sizes : []).map(s => ({ size: s, cat: 'Adult' })),
        ...(Array.isArray(product.youth_sizes) ? product.youth_sizes : []).map(s => ({ size: s, cat: 'Youth' })),
      ]
      const updates = []
      for (const color of colors) {
        for (const { size, cat } of allSizes) {
          const key = `${productId}-${color}-${size}`
          if (key in pendingChanges) {
            updates.push({ product_id: productId, color, size, size_category: cat, stock: pendingChanges[key] })
          }
        }
      }
      if (updates.length > 0) {
        await authFetch('/api/inventory/batch', { method: 'PUT', body: JSON.stringify({ updates }) })
        setPendingChanges(prev => {
          const next = { ...prev }
          updates.forEach(u => delete next[`${u.product_id}-${u.color}-${u.size}`])
          return next
        })
        await fetchData()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleProductActive = async (product) => {
    try {
      await authFetch(`/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...product, active: !product.active })
      })
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const addProduct = async (e) => {
    e.preventDefault()
    setAddingProduct(true)
    try {
      const result = await authFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          colors: ['Black', 'Navy', 'White'],
          adult_sizes: ['S', 'M', 'L', 'XL'],
          youth_sizes: ['YS', 'YM', 'YL', 'YXL'],
          image_url: '',
        })
      })
      // Seed inventory for new product
      const colors = ['Black', 'Navy', 'White']
      const sizes = [
        { size: 'S', cat: 'Adult' }, { size: 'M', cat: 'Adult' },
        { size: 'L', cat: 'Adult' }, { size: 'XL', cat: 'Adult' },
        { size: 'YS', cat: 'Youth' }, { size: 'YM', cat: 'Youth' },
        { size: 'YL', cat: 'Youth' }, { size: 'YXL', cat: 'Youth' },
      ]
      const updates = []
      for (const color of colors) {
        for (const { size, cat } of sizes) {
          updates.push({ product_id: result.id, color, size, size_category: cat, stock: 0 })
        }
      }
      await authFetch('/api/inventory/batch', { method: 'PUT', body: JSON.stringify({ updates }) })
      setNewProduct({ name: '', description: '', price: '' })
      setShowAddProduct(false)
      await fetchData()
      setExpandedProduct(result.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingProduct(false)
    }
  }

  if (loading) return <p className="text-gray-400 text-center py-10">Loading inventory...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Inventory ({products.length} product{products.length !== 1 ? 's' : ''})</h2>
        <button
          onClick={() => setShowAddProduct(!showAddProduct)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {showAddProduct && (
        <form onSubmit={addProduct} className="bg-zinc-800 rounded-xl p-5 border border-white/10 mb-6">
          <h3 className="text-white font-semibold mb-4">New Product</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              required
              type="text"
              placeholder="Product Name *"
              value={newProduct.name}
              onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
              className="bg-zinc-700 text-white rounded-lg px-4 py-2.5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
            />
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Price ($) *"
              value={newProduct.price}
              onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))}
              className="bg-zinc-700 text-white rounded-lg px-4 py-2.5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
            />
            <input
              type="text"
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))}
              className="bg-zinc-700 text-white rounded-lg px-4 py-2.5 border border-white/10 text-sm focus:outline-none focus:border-white/30 sm:col-span-2"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={addingProduct} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {addingProduct ? 'Adding...' : 'Add Product'}
            </button>
            <button type="button" onClick={() => setShowAddProduct(false)} className="bg-zinc-700 text-gray-300 px-5 py-2 rounded-lg text-sm font-bold hover:bg-zinc-600 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No products yet. Add your first product above.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const colors = Array.isArray(product.colors) ? product.colors : []
            const adultSizes = Array.isArray(product.adult_sizes) ? product.adult_sizes : []
            const youthSizes = Array.isArray(product.youth_sizes) ? product.youth_sizes : []
            const allSizes = [
              ...adultSizes.map(s => ({ size: s, cat: 'Adult' })),
              ...youthSizes.map(s => ({ size: s, cat: 'Youth' })),
            ]
            const isExpanded = expandedProduct === product.id
            const hasPending = Object.keys(pendingChanges).some(k => k.startsWith(`${product.id}-`))
            const totalStock = inventory
              .filter(i => i.product_id === product.id)
              .reduce((sum, i) => sum + Number(i.stock), 0)

            return (
              <div key={product.id} className="bg-zinc-800 rounded-xl border border-white/10 overflow-hidden">
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{product.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${product.active ? 'bg-green-900 text-green-300' : 'bg-zinc-700 text-gray-400'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-0.5">
                      ${Number(product.price).toFixed(2)} &middot; {totalStock} units in stock
                    </p>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    {hasPending && (
                      <button
                        onClick={() => saveChanges(product.id)}
                        disabled={saving}
                        className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                    <button
                      onClick={() => toggleProductActive(product)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        product.active ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                      }`}
                    >
                      {product.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform pointer-events-none ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/10">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mt-4 mb-3">Stock Levels (click any number to edit)</p>
                    {colors.length === 0 || allSizes.length === 0 ? (
                      <p className="text-gray-500 text-sm">No sizes or colors configured.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="text-sm">
                          <thead>
                            <tr>
                              <th className="text-left text-gray-500 font-medium pb-2 pr-6">Size</th>
                              {colors.map(color => (
                                <th key={color} className="text-center text-gray-400 font-medium pb-2 px-4 min-w-[90px]">{color}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allSizes.map(({ size, cat }) => (
                              <tr key={size} className="border-t border-white/5">
                                <td className="py-2 pr-6">
                                  <span className="text-gray-300 font-medium">{size}</span>
                                  <span className="text-gray-600 text-xs ml-1">({cat})</span>
                                </td>
                                {colors.map(color => {
                                  const stock = getStock(product.id, color, size)
                                  const key = `${product.id}-${color}-${size}`
                                  const isPending = key in pendingChanges
                                  return (
                                    <td key={color} className="py-2 px-4 text-center">
                                      <input
                                        type="number"
                                        min="0"
                                        value={stock}
                                        onChange={(e) => handleStockChange(product.id, color, size, e.target.value)}
                                        className={`w-16 text-center rounded px-2 py-1.5 text-sm focus:outline-none border transition-colors ${
                                          isPending
                                            ? 'bg-amber-900/20 border-amber-600/50 text-amber-300'
                                            : stock === 0
                                              ? 'bg-red-900/10 border-red-900/20 text-red-400'
                                              : 'bg-zinc-700 border-white/10 text-white'
                                        }`}
                                      />
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {hasPending && (
                      <button
                        onClick={() => saveChanges(product.id)}
                        disabled={saving}
                        className="mt-4 bg-white text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem('admin_token', data.token)
        onLogin()
      } else {
        setError(data.error || 'Incorrect password')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="Force Up" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Admin Login
          </h1>
          <p className="text-gray-500 text-sm mt-1">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoFocus
              className="w-full bg-zinc-800 text-white rounded-lg pl-10 pr-4 py-3 border border-white/10 text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-6">
          <a href="/" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            Back to site
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (token) {
      fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res.ok) {
            setAuthenticated(true)
          } else {
            sessionStorage.removeItem('admin_token')
          }
        })
        .catch(() => sessionStorage.removeItem('admin_token'))
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [])

  const handleLogout = async () => {
    const token = sessionStorage.getItem('admin_token')
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {})
    }
    sessionStorage.removeItem('admin_token')
    setAuthenticated(false)
  }

  if (checking) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  }

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />
  }

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
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <img src="/images/logo.png" alt="Force Up" className="h-10 w-auto" />
          </div>
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
            onClick={() => setTab('gallery')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tab === 'gallery' ? 'bg-white text-black' : 'bg-zinc-800 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <ImagePlus className="w-4 h-4" /> Gallery
          </button>
          <button
            onClick={() => setTab('inventory')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tab === 'inventory' ? 'bg-white text-black' : 'bg-zinc-800 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Inventory
          </button>
        </div>

        {tab === 'orders' && <OrdersTab />}
        {tab === 'gallery' && <GalleryTab />}
        {tab === 'inventory' && <InventoryTab />}
      </div>
    </div>
  )
}
