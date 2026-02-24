import React, { useState, useRef } from 'react';
import { Printer, Search, Download, FileText, Calendar, User as UserIcon, Package, Weight } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';

interface BillingProps {
  invoices: Invoice[];
}

export default function Billing({ invoices }: BillingProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const filteredInvoices = invoices.filter(inv => 
    inv.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
      {/* Invoice List */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Search bills..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredInvoices.map((inv) => (
            <button
              key={inv.id}
              onClick={() => setSelectedInvoice(inv)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                selectedInvoice?.id === inv.id 
                  ? "bg-zinc-900 border-zinc-900 text-white shadow-md" 
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm">{inv.billNumber}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                  selectedInvoice?.id === inv.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                )}>
                  Paid
                </span>
              </div>
              <p className={cn(
                "text-xs mb-1 font-medium",
                selectedInvoice?.id === inv.id ? "text-zinc-300" : "text-zinc-500"
              )}>
                {inv.customerName}
              </p>
              <div className="flex justify-between items-center mt-3">
                <span className="font-bold">{formatCurrency(inv.grandTotal)}</span>
                <span className={cn(
                  "text-[10px]",
                  selectedInvoice?.id === inv.id ? "text-zinc-400" : "text-zinc-400"
                )}>
                  {new Date(inv.date).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
          {filteredInvoices.length === 0 && (
            <div className="text-center py-10 text-zinc-400">
              <FileText size={32} strokeWidth={1} className="mx-auto mb-2" />
              <p className="text-sm">No invoices found</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6 flex items-center justify-between no-print">
          <h2 className="text-xl font-bold text-zinc-900">Invoice Preview</h2>
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Download size={18} /> Export PDF
            </button>
            <button 
              onClick={handlePrint}
              disabled={!selectedInvoice}
              className="btn-primary flex items-center gap-2"
            >
              <Printer size={18} /> Print Invoice
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-200/50 p-8 rounded-2xl border border-zinc-200/50 no-print">
          {selectedInvoice ? (
            <InvoicePaper invoice={selectedInvoice} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <FileText size={64} strokeWidth={1} className="mb-4" />
              <p>Select an invoice to preview</p>
            </div>
          )}
        </div>

        {/* Hidden printable version */}
        <div className="print-only">
          {selectedInvoice && <InvoicePaper invoice={selectedInvoice} />}
        </div>
      </div>
    </div>
  );
}

function InvoicePaper({ invoice }: { invoice: Invoice }) {
  return (
    <div className="bg-white mx-auto shadow-2xl p-12 w-[210mm] min-h-[297mm] font-sans text-zinc-900">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
            <h1 className="text-2xl font-black tracking-tight">STOCKMASTER</h1>
          </div>
          <div className="text-sm text-zinc-500 space-y-1">
            <p>123 Business Avenue, Tech City</p>
            <p>contact@stockmaster.com</p>
            <p>+1 (555) 000-1234</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-zinc-200 mb-4 uppercase tracking-widest">Invoice</h2>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-zinc-900">Bill No: {invoice.billNumber}</p>
            <p className="text-zinc-500">Date: {formatDate(invoice.date)}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-12 mb-12 pb-8 border-b border-zinc-100">
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Bill To</p>
          <div className="flex items-center gap-2 mb-1">
            <UserIcon size={14} className="text-zinc-400" />
            <p className="font-bold text-lg">{invoice.customerName}</p>
          </div>
          <p className="text-sm text-zinc-500 italic">Walk-in Customer</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Payment Info</p>
          <p className="text-sm font-medium">Method: Credit Card / Cash</p>
          <p className="text-sm text-zinc-500">Status: Fully Paid</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-zinc-900">
            <th className="py-4 text-left text-xs font-black uppercase tracking-widest">Item Description</th>
            <th className="py-4 text-center text-xs font-black uppercase tracking-widest">Qty</th>
            <th className="py-4 text-center text-xs font-black uppercase tracking-widest">Weight</th>
            <th className="py-4 text-right text-xs font-black uppercase tracking-widest">Price</th>
            <th className="py-4 text-right text-xs font-black uppercase tracking-widest">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-4">
                <p className="font-bold">{item.itemName}</p>
                <p className="text-xs text-zinc-400">SKU: {item.productId.slice(0, 8).toUpperCase()}</p>
              </td>
              <td className="py-4 text-center font-medium">{item.quantity}</td>
              <td className="py-4 text-center font-mono text-sm">{(item.weight * item.quantity).toFixed(2)} kg</td>
              <td className="py-4 text-right text-sm">{formatCurrency(item.price)}</td>
              <td className="py-4 text-right font-bold">{formatCurrency(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-80 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 flex items-center gap-2"><Package size={14} /> Total Quantity</span>
            <span className="font-bold">{invoice.totalQuantity} Units</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 flex items-center gap-2"><Weight size={14} /> Total Weight</span>
            <span className="font-mono font-bold">{invoice.totalWeight.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Subtotal</span>
            <span className="font-bold">{formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Tax (0%)</span>
            <span className="font-bold">$0.00</span>
          </div>
          <div className="pt-4 border-t-2 border-zinc-900 flex justify-between items-center">
            <span className="text-lg font-black uppercase tracking-widest">Grand Total</span>
            <span className="text-3xl font-black">{formatCurrency(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-20 text-center">
        <div className="inline-block px-8 py-4 bg-zinc-50 rounded-2xl border border-zinc-100">
          <p className="text-sm font-bold text-zinc-900 mb-1">Thank you for your business!</p>
          <p className="text-xs text-zinc-500">Please keep this invoice for your records.</p>
        </div>
        <div className="mt-12 flex justify-center gap-12 text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
          <span>Authentic Invoice</span>
          <span>•</span>
          <span>System Generated</span>
          <span>•</span>
          <span>StockMaster POS</span>
        </div>
      </div>
    </div>
  );
}
