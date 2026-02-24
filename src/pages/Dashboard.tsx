import React from 'react';
import { 
  Package, 
  Weight, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Product, Invoice } from '../types';
import { formatCurrency } from '../lib/utils';

interface DashboardProps {
  products: Product[];
  invoices: Invoice[];
}

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export default function Dashboard({ products, invoices }: DashboardProps) {
  const totalProducts = products.length;
  const totalStockWeight = products.reduce((acc, p) => acc + p.totalWeight, 0);
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const lowStockAlerts = products.filter(p => p.quantity < 10).length;
  const todaySales = invoices.filter(inv => {
    const today = new Date().toISOString().split('T')[0];
    return inv.date.startsWith(today);
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard Overview</h1>
        <p className="text-zinc-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Products" 
          value={totalProducts} 
          icon={Package} 
          trend="+12%" 
          trendUp={true} 
        />
        <StatCard 
          title="Stock Weight" 
          value={`${totalStockWeight.toFixed(1)} kg`} 
          icon={Weight} 
          trend="-2.4%" 
          trendUp={false} 
        />
        <StatCard 
          title="Today's Sales" 
          value={todaySales} 
          icon={TrendingUp} 
          trend="+5.2%" 
          trendUp={true} 
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          icon={DollarSign} 
          trend="+18%" 
          trendUp={true} 
        />
        <StatCard 
          title="Low Stock" 
          value={lowStockAlerts} 
          icon={AlertTriangle} 
          trend={lowStockAlerts > 0 ? "Action Required" : "All Good"} 
          trendUp={false}
          isWarning={lowStockAlerts > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900">Weekly Revenue</h3>
            <select className="text-sm border-zinc-200 rounded-lg focus:ring-zinc-900">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Products */}
        <div className="card p-6">
          <h3 className="font-semibold text-zinc-900 mb-6">Recent Products</h3>
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold">
                    {product.itemName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{product.itemName}</p>
                    <p className="text-xs text-zinc-500">{product.inventoryName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900">{product.quantity}</p>
                  <p className="text-xs text-zinc-500">Units</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            View All Inventory
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, isWarning }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-2 rounded-lg",
          isWarning ? "bg-red-50 text-red-600" : "bg-zinc-50 text-zinc-600"
        )}>
          <Icon size={20} />
        </div>
        <div className={cn(
          "flex items-center gap-0.5 text-xs font-medium",
          isWarning ? "text-red-600" : trendUp ? "text-emerald-600" : "text-red-600"
        )}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
