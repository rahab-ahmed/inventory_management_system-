import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  RefreshCw, 
  History, 
  ShoppingCart, 
  FileText, 
  Users, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  Search,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Product, InventoryHistory, User, Invoice, NavItem } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import UpdateStock from './pages/UpdateStock';
import InventoryHistoryPage from './pages/InventoryHistory';
import POS from './pages/POS';
import Billing from './pages/Billing';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'update-stock', label: 'Update Stock', icon: RefreshCw },
  { id: 'history', label: 'Inventory History', icon: History },
  { id: 'pos', label: 'POS', icon: ShoppingCart },
  { id: 'billing', label: 'Billing', icon: FileText },
  { id: 'users', label: 'User Management', icon: Users },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Shared State
  const [products, setProducts] = useState<Product[]>([
    { id: '1', inventoryName: 'Main Store', itemName: 'Premium Coffee Beans', weightPerItem: 0.5, quantity: 120, totalWeight: 60, dateAdded: '2024-02-20T10:00:00Z', price: 25.00 },
    { id: '2', inventoryName: 'Warehouse A', itemName: 'Organic Green Tea', weightPerItem: 0.25, quantity: 45, totalWeight: 11.25, dateAdded: '2024-02-21T14:30:00Z', price: 18.50 },
    { id: '3', inventoryName: 'Main Store', itemName: 'Dark Chocolate Bars', weightPerItem: 0.1, quantity: 8, totalWeight: 0.8, dateAdded: '2024-02-22T09:15:00Z', price: 5.99 },
  ]);

  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active' },
  ]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard products={products} invoices={invoices} />;
      case 'inventory': return <Inventory products={products} setProducts={setProducts} setHistory={setHistory} />;
      case 'update-stock': return <UpdateStock products={products} setProducts={setProducts} setHistory={setHistory} />;
      case 'history': return <InventoryHistoryPage history={history} />;
      case 'pos': return <POS products={products} setProducts={setProducts} setHistory={setHistory} setInvoices={setInvoices} setActiveTab={setActiveTab} />;
      case 'billing': return <Billing invoices={invoices} />;
      case 'users': return <UserManagement users={users} setUsers={setUsers} />;
      default: return <Dashboard products={products} invoices={invoices} />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        className="bg-white border-r border-zinc-200 flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-zinc-900"
            >
              StockMaster
            </motion.span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-zinc-900 text-white shadow-md" 
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium text-sm whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {activeTab === item.id && isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors group",
              isSidebarCollapsed && "justify-center"
            )}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search inventory, sales, or orders..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-zinc-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-zinc-900 leading-none">Admin User</p>
                <p className="text-xs text-zinc-500 mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
                <UserIcon size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
