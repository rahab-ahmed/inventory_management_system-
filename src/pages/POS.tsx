import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  User as UserIcon,
  Package,
  Weight,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, SaleItem, Invoice, InventoryHistory } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface POSProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setHistory: React.Dispatch<React.SetStateAction<InventoryHistory[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setActiveTab: (tab: string) => void;
}

export default function POS({ products, setProducts, setHistory, setInvoices, setActiveTab }: POSProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');

  const filteredProducts = products.filter(p => 
    p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) && p.quantity > 0
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert('Not enough stock available!');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.price
            } 
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        itemName: product.itemName,
        quantity: 1,
        weight: product.weightPerItem,
        price: product.price,
        totalPrice: product.price
      }]);
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty > product.quantity) {
          alert('Not enough stock!');
          return item;
        }
        return {
          ...item,
          quantity: newQty,
          totalPrice: newQty * item.price
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totals = useMemo(() => {
    return cart.reduce((acc, item) => ({
      quantity: acc.quantity + item.quantity,
      weight: acc.weight + (item.weight * item.quantity),
      price: acc.price + item.totalPrice
    }), { quantity: 0, weight: 0, price: 0 });
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const billNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      billNumber,
      date: new Date().toISOString(),
      customerName: customerName || 'Walk-in Customer',
      items: [...cart],
      totalQuantity: totals.quantity,
      totalWeight: totals.weight,
      grandTotal: totals.price
    };

    // Update Inventory
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.productId === p.id);
      if (cartItem) {
        const newQty = p.quantity - cartItem.quantity;
        return {
          ...p,
          quantity: newQty,
          totalWeight: newQty * p.weightPerItem
        };
      }
      return p;
    }));

    // Add to History
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const historyEntry: InventoryHistory = {
          id: Math.random().toString(36).substr(2, 9),
          productId: product.id,
          productName: product.itemName,
          previousQuantity: product.quantity,
          newQuantity: product.quantity - item.quantity,
          actionType: 'sale',
          updatedBy: 'Admin User',
          timestamp: new Date().toISOString()
        };
        setHistory(prev => [historyEntry, ...prev]);
      }
    });

    setInvoices(prev => [newInvoice, ...prev]);
    setCart([]);
    setCustomerName('');
    alert('Checkout successful!');
    setActiveTab('billing');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products by name..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-10 py-3 text-lg"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-4 py-2">
            <UserIcon size={18} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Customer Name" 
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-32"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <motion.button
              key={product.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              className="card p-4 text-left hover:border-zinc-900 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  {product.itemName[0]}
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  product.quantity < 10 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {product.quantity} In Stock
                </span>
              </div>
              <h4 className="font-bold text-zinc-900 mb-1 truncate">{product.itemName}</h4>
              <p className="text-xs text-zinc-500 mb-3">{product.inventoryName}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-bold text-zinc-900">{formatCurrency(product.price)}</span>
                <span className="text-xs text-zinc-400 font-mono">{product.weightPerItem}kg/unit</span>
              </div>
            </motion.button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400">
              <Package size={48} strokeWidth={1} className="mb-4" />
              <p>No products found or out of stock.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary Area */}
      <div className="w-full lg:w-96 flex flex-col">
        <div className="card flex-1 flex flex-col bg-white shadow-lg border-zinc-200">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
              <ShoppingCart size={20} /> Current Cart
            </h3>
            <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-bold">
              {cart.length} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{item.itemName}</p>
                    <p className="text-xs text-zinc-500">{formatCurrency(item.price)} / unit</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg p-1">
                    <button 
                      onClick={() => updateCartQuantity(item.productId, -1)}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-500"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.productId, 1)}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-500"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-10">
                <ShoppingCart size={32} strokeWidth={1} className="mb-2" />
                <p className="text-sm">Your cart is empty</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 flex items-center gap-1"><Package size={14} /> Total Qty</span>
                <span className="font-bold text-zinc-900">{totals.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 flex items-center gap-1"><Weight size={14} /> Total Weight</span>
                <span className="font-bold text-zinc-900 font-mono">{totals.weight.toFixed(2)} kg</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex justify-between items-center">
                <span className="text-zinc-900 font-bold text-lg flex items-center gap-1"><DollarSign size={20} /> Total</span>
                <span className="text-2xl font-black text-zinc-900">{formatCurrency(totals.price)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg shadow-lg shadow-zinc-900/10"
            >
              <CreditCard size={20} />
              Complete Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
