import React, { useState } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, ShoppingCart } from 'lucide-react';
import { InventoryHistory } from '../types';
import { formatDate, cn } from '../lib/utils';

interface HistoryProps {
  history: InventoryHistory[];
}

export default function InventoryHistoryPage({ history }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'increase' | 'decrease' | 'sale'>('all');

  const filteredHistory = history.filter(h => {
    const matchesSearch = h.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         h.updatedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || h.actionType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Inventory History</h1>
        <p className="text-zinc-500">Track every stock adjustment and sale across your inventory.</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by product or user..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
              />
            </div>
            <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="text-sm border-zinc-200 rounded-lg focus:ring-zinc-900 py-2"
            >
              <option value="all">All Actions</option>
              <option value="increase">Stock In</option>
              <option value="decrease">Stock Out</option>
              <option value="sale">Sales</option>
            </select>
          </div>
          <button className="btn-secondary py-1.5 text-sm flex items-center gap-2">
            <Download size={14} /> Export Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="table-header">Product Name</th>
                <th className="table-header">Action</th>
                <th className="table-header">Prev. Qty</th>
                <th className="table-header">New Qty</th>
                <th className="table-header">Adjustment</th>
                <th className="table-header">Updated By</th>
                <th className="table-header">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="table-cell font-medium text-zinc-900">{log.productName}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {log.actionType === 'increase' && (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <ArrowUpRight size={12} /> Stock In
                        </span>
                      )}
                      {log.actionType === 'decrease' && (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <ArrowDownRight size={12} /> Stock Out
                        </span>
                      )}
                      {log.actionType === 'sale' && (
                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <ShoppingCart size={12} /> Sale
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">{log.previousQuantity}</td>
                  <td className="table-cell">{log.newQuantity}</td>
                  <td className="table-cell">
                    <span className={cn(
                      "font-bold",
                      log.newQuantity > log.previousQuantity ? "text-emerald-600" : "text-red-600"
                    )}>
                      {log.newQuantity > log.previousQuantity ? '+' : ''}
                      {log.newQuantity - log.previousQuantity}
                    </span>
                  </td>
                  <td className="table-cell">{log.updatedBy}</td>
                  <td className="table-cell text-zinc-400">{formatDate(log.timestamp)}</td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No history logs found.
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
