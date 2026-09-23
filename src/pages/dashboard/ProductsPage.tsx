import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Package,
  Check,
  X,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { Profile, Product } from '../../types';

export const ProductsPage: React.FC = () => {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: '₹',
    image_url: '',
    category: '',
    available: true,
    featured: false,
  });

  const loadProducts = async () => {
    if (profile?.id) {
      const prods = await StorageService.getProducts(profile.id);
      setProducts(prods);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [profile?.id]);

  // Handle URL ?action=new to automatically open create modal
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: '₹',
      image_url:
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      category: profile?.category || 'General',
      available: true,
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description || '',
      price: p.price.toString(),
      currency: p.currency || '₹',
      image_url: p.image_url || '',
      category: p.category || '',
      available: p.available,
      featured: !!p.featured,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await StorageService.deleteProduct(id);
      loadProducts();
    }
  };

  const handleToggleAvailability = async (p: Product) => {
    const updated: Product = { ...p, available: !p.available };
    await StorageService.saveProduct(updated);
    loadProducts();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await StorageService.uploadImage(e.target.files[0], 'products');
        setFormData((prev) => ({ ...prev, image_url: url }));
      } catch (err: any) {
        alert(err.message || 'Image upload failed');
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
      profile_id: profile.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      currency: formData.currency,
      image_url: formData.image_url,
      category: formData.category,
      available: formData.available,
      featured: formData.featured,
      sort_order: editingProduct ? editingProduct.sort_order : products.length + 1,
      created_at: editingProduct ? editingProduct.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await StorageService.saveProduct(productPayload);
    setIsModalOpen(false);
    loadProducts();
  };

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Product & Service Catalog</h1>
          <p className="text-xs text-zinc-500">
            Items showcase directly on your public LinkOS page with 1-click WhatsApp inquiry buttons.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or description..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
          />
        </div>

        {categories.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Table / Grid */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs text-zinc-400">Loading catalog...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
              >
                {/* Image and details */}
                <div className="flex items-center gap-4 min-w-0">
                  {product.image_url?.trim() ? (
                    <img
                      src={product.image_url.trim()}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0 flex items-center justify-center text-zinc-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 truncate">{product.name}</h3>
                      {product.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="font-bold text-zinc-900">
                        {product.currency}
                        {product.price.toLocaleString()}
                      </span>
                      {product.category && (
                        <span className="text-[11px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                  {/* In Stock toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(product)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                      product.available
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.available ? 'bg-emerald-500' : 'bg-zinc-400'
                      }`}
                    />
                    <span>{product.available ? 'Available' : 'Hidden'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(product)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">No items found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Add your best-selling products or services so customers can see pricing and inquire on WhatsApp.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Item</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <h2 className="text-base font-bold text-zinc-900">
                {editingProduct ? 'Edit Catalog Item' : 'Add Catalog Item'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Product / Service Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Leatherette Car Seat Covers"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="4500"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Interior / Seat Covers"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features, warranty, material quality..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
                />
              </div>

              {/* Photo */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0"
                    />
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-xs font-medium text-zinc-800 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 rounded-sm border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>Active & In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded-sm border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>Feature on Top</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
