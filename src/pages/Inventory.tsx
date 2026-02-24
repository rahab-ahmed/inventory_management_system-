import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, InventoryHistory } from '../types';
import { formatDate } from '../lib/utils';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setHistory: React.Dispatch<React.SetStateAction<InventoryHistory[]>>;
}

export default function Inventory({ products, setProducts, setHistory }: InventoryProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    inventoryName: '',
    itemName: '',
    weightPerItem: 0,
    quantity: 0,
    price: 0
  });

  const totalWeight = useMemo(() => {
    return formData.weightPerItem * formData.quantity;
  }, [formData.weightPerItem, formData.quantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        ...formData,
        totalWeight: formData.weightPerItem * formData.quantity
      } : p));
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        totalWeight,
        dateAdded: new Date().toISOString()
      };
      setProducts(prev => [newProduct, ...prev]);
      
      // Add to history
      const historyEntry: InventoryHistory = {
        id: Math.random().toString(36).substr(2, 9),
        productId: newProduct.id,
        productName: newProduct.itemName,
        previousQuantity: 0,
        newQuantity: newProduct.quantity,
        actionType: 'increase',
        updatedBy: 'Admin User',
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyEntry, ...prev]);
    }

    setFormData({ inventoryName: '', itemName: '', weightPerItem: 0, quantity: 0, price: 0 });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      inventoryName: product.inventoryName,
      itemName: product.itemName,
      weightPerItem: product.weightPerItem,
      quantity: product.quantity,
      price: product.price
    });
    setShowForm(true);
  };

  const filteredProducts = products.filter(p => 
    p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.inventoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Inventory Management</h1>
          <p className="text-zinc-500">Manage your products, stock levels, and locations.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ inventoryName: '', itemName: '', weightPerItem: 0, quantity: 0, price: 0 });
            setShowForm(!showForm);
          }}
          className="btn-primary flex items-center gap-2 self-start"
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> Add New Item</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-6 bg-white border-zinc-200">
              <h3 className="font-semibold text-zinc-900 mb-6">
                {editingProduct ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="label">Inventory Name / Location</label>
                  <input 
                    type="text" 
                    required
                    value={formData.inventoryName}
                    onChange={e => setFormData({...formData, inventoryName: e.target.value})}
                    className="input-field" 
                    placeholder="e.g. Main Warehouse" 
                  />
                </div>
                <div>
                  <label className="label">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.itemName}
                    onChange={e => setFormData({...formData, itemName: e.target.value})}
                    className="input-field" 
                    placeholder="e.g. Arabica Coffee" 
                  />
                </div>
                <div>
                  <label className="label">Price per Unit ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="label">Weight per Item (kg)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.weightPerItem}
                    onChange={e => setFormData({...formData, weightPerItem: parseFloat(e.target.value) || 0})}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input 
                    type="number" 
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="label">Total Weight (Auto-calculated)</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={`${totalWeight.toFixed(2)} kg`}
                    className="input-field bg-zinc-50 font-mono" 
                  />
                </div>
                <div className="lg:col-span-3 flex justify-end gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProduct ? 'Update Item' : 'Save Item'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <div className="card">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-1.5 text-sm flex items-center gap-2">
              <Filter size={14} /> Filter
            </button>
            <button className="btn-secondary py-1.5 text-sm flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="table-header">Item Name</th>
                <th className="table-header">Location</th>
                <th className="table-header">Weight/Item</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Total Weight</th>
                <th className="table-header">Price</th>
                <th className="table-header">Date Added</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="table-cell font-medium text-zinc-900">{product.itemName}</td>
                  <td className="table-cell">{product.inventoryName}</td>
                  <td className="table-cell">{product.weightPerItem} kg</td>
                  <td className="table-cell">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      product.quantity < 10 ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-600"
                    )}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="table-cell font-mono">{product.totalWeight.toFixed(2)} kg</td>
                  <td className="table-cell">${product.price.toFixed(2)}</td>
                  <td className="table-cell">{formatDate(product.dateAdded)}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
