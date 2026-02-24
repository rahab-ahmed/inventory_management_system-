import React, { useState } from 'react';
import { RefreshCw, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { Product, InventoryHistory } from '../types';
import { cn } from '../lib/utils';

interface UpdateStockProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setHistory: React.Dispatch<React.SetStateAction<InventoryHistory[]>>;
}

export default function UpdateStock({ products, setProducts, setHistory }: UpdateStockProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [updateType, setUpdateType] = useState<'increase' | 'decrease'>('increase');
  const [amount, setAmount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || amount <= 0) return;

    if (updateType === 'decrease' && selectedProduct.quantity < amount) {
      alert('Cannot decrease more than available stock!');
      return;
    }

    setIsUpdating(true);

    setTimeout(() => {
      const newQuantity = updateType === 'increase' 
        ? selectedProduct.quantity + amount 
        : selectedProduct.quantity - amount;

      setProducts(prev => prev.map(p => p.id === selectedProductId ? {
        ...p,
        quantity: newQuantity,
        totalWeight: newQuantity * p.weightPerItem
      } : p));

      // Add to history
      const historyEntry: InventoryHistory = {
        id: Math.random().toString(36).substr(2, 9),
        productId: selectedProduct.id,
        productName: selectedProduct.itemName,
        previousQuantity: selectedProduct.quantity,
        newQuantity: newQuantity,
        actionType: updateType,
        updatedBy: 'Admin User',
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyEntry, ...prev]);

      setAmount(0);
      setIsUpdating(false);
      alert('Stock updated successfully!');
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Update Stock Levels</h1>
        <p className="text-zinc-500">Quickly adjust inventory quantities for existing items.</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="label">Select Product</label>
            <select 
              required
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.itemName} ({p.inventoryName}) - Current: {p.quantity}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold">Current Stock</p>
                <p className="text-lg font-bold text-zinc-900">{selectedProduct.quantity} Units</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold">Current Weight</p>
                <p className="text-lg font-bold text-zinc-900 font-mono">{selectedProduct.totalWeight.toFixed(2)} kg</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUpdateType('increase')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                updateType === 'increase' 
                  ? "border-zinc-900 bg-zinc-900 text-white" 
                  : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200"
              )}
            >
              <ArrowUp size={18} />
              <span className="font-semibold">Increase</span>
            </button>
            <button
              type="button"
              onClick={() => setUpdateType('decrease')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                updateType === 'decrease' 
                  ? "border-zinc-900 bg-zinc-900 text-white" 
                  : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200"
              )}
            >
              <ArrowDown size={18} />
              <span className="font-semibold">Decrease</span>
            </button>
          </div>

          <div>
            <label className="label">Adjustment Amount</label>
            <input 
              type="number" 
              required
              min="1"
              value={amount || ''}
              onChange={e => setAmount(parseInt(e.target.value) || 0)}
              className="input-field text-lg font-semibold"
              placeholder="Enter quantity to add/remove"
            />
          </div>

          {selectedProduct && updateType === 'decrease' && amount > selectedProduct.quantity && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle size={16} />
              <span>Warning: Amount exceeds current stock!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating || !selectedProductId || amount <= 0 || (updateType === 'decrease' && amount > (selectedProduct?.quantity || 0))}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
          >
            {isUpdating ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <RefreshCw size={20} />
            )}
            Update Inventory
          </button>
        </form>
      </div>
    </div>
  );
}
